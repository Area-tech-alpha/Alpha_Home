import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { buildCrmLeadPayload } from "@/lib/crm";
import { intakeLead, type IntakeErrors } from "@/lib/lead-intake";
import type { Limiter, Limiters, RateLimitScope } from "@/lib/rate-limit";
import { leadSchema, parseTracking } from "@/lib/validation";
import { leadSchema01lp } from "@/lib/validation-01lp";
import { leadSchemaPizzaria } from "@/lib/validation-pizzaria";
import { leadSchemaLeadMagneticVsl } from "@/lib/validation-pizzaria";

// Só mocks locais: o CRM e o Redis aqui são falsos e nenhuma chamada sai para a rede.
const CRM_URL = "http://crm.mock.local";
const CRM_KEY = "chave-falsa-de-teste";

const errors: IntakeErrors = {
  validation: "Dados inválidos.",
  rateLimited: "Tente em {min} min.",
  crm: "Não conseguimos enviar agora.",
};

const rawLead = {
  nome: "Ana Souza",
  email: "ana@ex.com",
  telefone: "+5511911110001",
  empresa: "Pizzaria da Ana",
  segmento: "Pizzarias",
  faturamento: "100 mil até 150 mil",
};
const rawTracking = { utm_source: "meta", utm_medium: "cpc", utm_campaign: "pizzaria", utm_content: "a1", utm_term: "t", fbclid: "abc", gclid: "ignorado" };

// Todas as LPs enviam por aqui, com o schema e o escopo próprios.
const LPS: { nome: string; schema: Parameters<typeof intakeLead>[0]["schema"]; scope: RateLimitScope }[] = [
  { nome: "/01-lp", schema: leadSchema01lp, scope: "01lp" },
  { nome: "/alphas-pizzaria", schema: leadSchemaPizzaria, scope: "pizzaria" },
  { nome: "/resultado-alphas-pizzaria", schema: leadSchemaPizzaria, scope: "pizzaria-resultado" },
  { nome: "/lead-magnetic-bastidores-alphas-pizzaria", schema: leadSchemaPizzaria, scope: "pizzaria-bastidores" },
  { nome: "/lead-magnetic-vsl", schema: leadSchemaLeadMagneticVsl, scope: "lead-magnetic-vsl" },
];

type Call = { url: string; init: RequestInit };
function fakeCrm(respond: () => Response | Promise<Response> = () => Response.json({ crmLeadId: "crm-1" }, { status: 201 })) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return respond();
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

function fakeLimiters(max = { email: 1, telefone: 1, ip: 3 }) {
  const seen: string[] = [];
  const counts = new Map<string, number>();
  const make = (n: number): Limiter => ({
    async limit(key) {
      seen.push(key);
      const c = (counts.get(key) ?? 0) + 1;
      counts.set(key, c);
      return { success: c <= n, reset: Date.now() + 179_000 };
    },
    async resetUsedTokens(key) {
      counts.delete(key);
    },
  });
  return { seen, limiters: { email: make(max.email), telefone: make(max.telefone), ip: make(max.ip) } as Limiters };
}

async function withCrmEnv<T>(fn: () => Promise<T>, env: { url?: string; key?: string } = { url: CRM_URL, key: CRM_KEY }) {
  const old = { url: process.env.CRM_API_URL, key: process.env.CRM_EXTERNAL_LEADS_API_KEY, sdr: process.env.CRM_SDR_EMAIL };
  const restore = (k: string, v: string | undefined) => (v === undefined ? delete process.env[k] : (process.env[k] = v));
  restore("CRM_API_URL", env.url);
  restore("CRM_EXTERNAL_LEADS_API_KEY", env.key);
  delete process.env.CRM_SDR_EMAIL;
  try {
    return await fn();
  } finally {
    restore("CRM_API_URL", old.url);
    restore("CRM_EXTERNAL_LEADS_API_KEY", old.key);
    restore("CRM_SDR_EMAIL", old.sdr);
  }
}

function captureLogs() {
  const lines: string[] = [];
  const orig = { error: console.error, warn: console.warn };
  console.error = (...a: unknown[]) => lines.push(a.map(String).join(" "));
  console.warn = console.error;
  return { lines, restore: () => Object.assign(console, orig) };
}

// ===== Cada LP envia ao CRM, uma vez, com o mesmo payload da home =====

for (const lp of LPS) {
  test(`${lp.nome}: 1 envio ao CRM, payload idêntico ao da home`, async () => {
    await withCrmEnv(async () => {
      const crm = fakeCrm();
      const r = await intakeLead({ data: rawLead, rawTracking, ip: "200.1.1.1", ...lp, errors, limiters: null, fetchImpl: crm.fetchImpl });
      assert.equal(r.success, true);
      assert.equal(crm.calls.length, 1);
      const { url, init } = crm.calls[0];
      assert.equal(url, `${CRM_URL}/external/leads`);
      assert.equal(init.method, "POST");
      assert.deepEqual(init.headers, { "Content-Type": "application/json", "x-api-key": CRM_KEY });
      // O que a home mandaria para o mesmo lead e a mesma atribuição.
      const daHome = buildCrmLeadPayload(leadSchema.parse(rawLead), parseTracking(rawTracking), undefined);
      assert.deepEqual(JSON.parse(String(init.body)), JSON.parse(JSON.stringify(daHome)));
      // Só os campos de atribuição que a home já manda: gclid não vai.
      const body = JSON.parse(String(init.body));
      assert.equal(body.utm_source, "meta");
      assert.equal(body.fbclid, "abc");
      assert.ok(!("gclid" in body));
      assert.equal(body.source, "alpha-home");
      assert.equal(body.destination, "hq");
    });
  });
}

test("destino/categoria: mesma regra da home (Até 30 mil + Sim = D; + Não e demais faixas sem categoria)", async () => {
  await withCrmEnv(async () => {
    const casos: [Record<string, unknown>, string | undefined][] = [
      [{ faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81", investiria: "Sim" }, "D"],
      [{ faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81", investiria: "Não" }, undefined],
      [{ faturamento: "50 mil até 80 mil" }, undefined],
    ];
    for (const lp of LPS) {
      for (const [extra, categoria] of casos) {
        const crm = fakeCrm();
        const r = await intakeLead({ data: { ...rawLead, ...extra }, ip: null, ...lp, errors, limiters: null, fetchImpl: crm.fetchImpl });
        assert.equal(r.success, true, lp.nome);
        const body = JSON.parse(String(crm.calls[0].init.body));
        assert.equal(body.lead_category, categoria, `${lp.nome} ${JSON.stringify(extra)}`);
        assert.equal(body.destination, "hq");
        if (extra.cnpj) assert.equal(body.document, "11.222.333/0001-81");
      }
    }
  });
});

// ===== Falhas: nada de CRM, cota devolvida, sem vazar dados =====

test("lead inválido: nem chama o CRM nem gasta cota", async () => {
  await withCrmEnv(async () => {
    const crm = fakeCrm();
    const { seen, limiters } = fakeLimiters();
    for (const bad of [{ ...rawLead, email: "x" }, { ...rawLead, telefone: "+55119" }, { ...rawLead, segmento: "" }, null, "texto"]) {
      const r = await intakeLead({ data: bad, ip: "1.1.1.1", ...LPS[1], errors, limiters, fetchImpl: crm.fetchImpl });
      assert.deepEqual(r, { success: false, error: errors.validation, reason: "validation" });
    }
    assert.equal(crm.calls.length, 0);
    assert.equal(seen.length, 0);
  });
});

test("rate limit bloqueado: não chama o CRM e informa os minutos", async () => {
  await withCrmEnv(async () => {
    const crm = fakeCrm();
    const { limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 3 });
    const args = { data: rawLead, ip: "9.9.9.9", ...LPS[0], errors, limiters, fetchImpl: crm.fetchImpl };
    assert.equal((await intakeLead(args)).success, true);
    const r = await intakeLead(args);
    assert.deepEqual(r, { success: false, error: "Tente em 3 min.", reason: "rate_limited" });
    assert.equal(crm.calls.length, 1);
  });
});

test("CRM responde erro: mostra 'tente de novo', devolve a cota e não vaza URL/chave/dados no log", async () => {
  await withCrmEnv(async () => {
    const log = captureLogs();
    try {
      const crm = fakeCrm(() => Response.json({ code: "INVALID_LEAD", detail: "Ana Souza ana@ex.com" }, { status: 422 }));
      const { limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 3 });
      const args = { data: rawLead, ip: "9.9.9.8", ...LPS[2], errors, limiters, fetchImpl: crm.fetchImpl };
      assert.deepEqual(await intakeLead(args), { success: false, error: errors.crm, reason: "crm" });
      // Cota de e-mail e telefone devolvida: a nova tentativa chega ao CRM (não cai no limite).
      assert.deepEqual(await intakeLead(args), { success: false, error: errors.crm, reason: "crm" });
      assert.equal(crm.calls.length, 2);
    } finally {
      log.restore();
    }
    const all = log.lines.join("\n");
    assert.ok(log.lines.length >= 2);
    for (const secret of [CRM_KEY, CRM_URL, "ana@ex.com", "Ana Souza", "91111"]) assert.ok(!all.includes(secret), `log vazou: ${secret}`);
  });
});

test("falha de rede ao chamar o CRM: erro, cota devolvida, sem dados no log", async () => {
  await withCrmEnv(async () => {
    const log = captureLogs();
    try {
      const fetchImpl = (async () => {
        throw new TypeError("fetch failed");
      }) as unknown as typeof fetch;
      const { limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 3 });
      const args = { data: rawLead, ip: "9.9.9.7", ...LPS[3], errors, limiters, fetchImpl };
      assert.equal((await intakeLead(args)).success, false);
      assert.equal((await intakeLead(args)).success, false); // segue não bloqueando por rate limit
    } finally {
      log.restore();
    }
    assert.ok(!log.lines.join("\n").includes("ana@ex.com"));
  });
});

test("CRM não configurado: erro e nenhuma chamada de rede", async () => {
  await withCrmEnv(
    async () => {
      const log = captureLogs();
      try {
        const crm = fakeCrm();
        const r = await intakeLead({ data: rawLead, ip: null, ...LPS[0], errors, limiters: null, fetchImpl: crm.fetchImpl });
        assert.deepEqual(r, { success: false, error: errors.crm, reason: "crm" });
        assert.equal(crm.calls.length, 0);
      } finally {
        log.restore();
      }
    },
    { url: undefined, key: undefined }
  );
});

// ===== Rate limit com escopo por LP =====

test("rate limit: cada LP usa o seu prefixo e não divide cota com as outras", async () => {
  await withCrmEnv(async () => {
    const { seen, limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 3 });
    for (const lp of LPS) {
      const crm = fakeCrm();
      const r = await intakeLead({ data: rawLead, ip: "8.8.8.8", ...lp, errors, limiters, fetchImpl: crm.fetchImpl });
      assert.equal(r.success, true, `${lp.nome} (mesmo lead nas 4 LPs não colide)`);
    }
    for (const lp of LPS) {
      assert.ok(seen.some((k) => new RegExp(`^${lp.scope}:email:[0-9a-f]{64}$`).test(k)), lp.scope);
      assert.ok(seen.some((k) => new RegExp(`^${lp.scope}:telefone:[0-9a-f]{64}$`).test(k)), lp.scope);
      assert.ok(seen.some((k) => new RegExp(`^${lp.scope}:ip:[0-9a-f]{64}$`).test(k)), lp.scope);
    }
    // Chaves guardam só hash: nunca o e-mail ou o telefone em claro.
    assert.ok(seen.every((k) => !k.includes("ana@ex.com") && !k.includes("91111")));
  });
});

// ===== Guardas de regressão: sem webhook do n8n e sem pixel da Meta =====

function sources(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "_assets-wordpress", "_screenshots", "videos", "images", "fonts", "files"].includes(name)) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) sources(full, out);
    else if (/\.(ts|tsx|js|mjs|css|json|md|example|html)$/.test(name) && name !== "package-lock.json") out.push(full);
  }
  return out;
}

// As LPs de isca mandam ao n8n via env (LEAD_WEBHOOK_URL_ISCAS / _RAIO_X): o nome da
// env pode aparecer; a URL do webhook, nunca (só em .env.local e na Vercel).
test("nenhum código, config, teste ou doc tem URL de webhook do n8n", () => {
  const root = process.cwd();
  const files = [...sources(path.join(root, "app")), ...sources(path.join(root, "components")), ...sources(path.join(root, "lib")), ...sources(path.join(root, "tests")), path.join(root, ".env.example"), path.join(root, "README.md"), path.join(root, "next.config.ts")];
  const proibido = /webhook3\.assessorialpha|assessorialpha\.com\/webhook|\/webhook\/(wordpress-geral|leads-lms|lead-magnet|leads-iscas|leads-raio-x)/;
  const achou = files.filter((f) => proibido.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
  assert.deepEqual(achou, []);
});

test("nenhum pixel/CAPI da Meta no código (só a leitura de fbclid/fbc para atribuição)", () => {
  const root = process.cwd();
  const files = [...sources(path.join(root, "app")), ...sources(path.join(root, "components")), ...sources(path.join(root, "lib")), path.join(root, "next.config.ts"), path.join(root, "package.json")];
  const proibido = /fbq\s*\(|fbevents|connect\.facebook\.net|graph\.facebook\.com\/v|facebook-pixel|NEXT_PUBLIC_(META|FB)_?PIXEL|META_(CAPI|CONVERSIONS)|react-facebook-pixel/i;
  const achou = files.filter((f) => proibido.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
  assert.deepEqual(achou, []);
});
