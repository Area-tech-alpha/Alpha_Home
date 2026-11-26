import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { buildFoodLpBody, buildLmBody, pageUrlOf } from "@/lib/crm";
import { foodLm, foodLp, intakeLead, type CrmTarget, type IntakeErrors } from "@/lib/lead-intake";
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
const rawTracking = { utm_source: "meta", utm_medium: "cpc", utm_campaign: "pizzaria", utm_content: "a1", utm_term: "t", fbclid: "abc", fbc: "fb.1.1.abc", gclid: "ignorado" };

type Lp = { nome: string; schema: Parameters<typeof intakeLead>[0]["schema"]; scope: RateLimitScope; crm: CrmTarget; rota: "lp" | "lm"; origem: string; path: string };

function lp(nome: string, schema: Lp["schema"], scope: RateLimitScope, rota: "lp" | "lm", origem: string, pagePath: string): Lp {
  return { nome, schema, scope, rota, origem, path: pagePath, crm: rota === "lm" ? foodLm(origem, pagePath) : foodLp(origem, pagePath) };
}

// Home e LPs: cada uma com o schema, o escopo e o destino no CRM (rota + origem) próprios,
// iguais aos das server actions (conferido no teste das actions, mais abaixo).
const LPS: Lp[] = [
  lp("/ (home)", leadSchema, "home", "lp", "alpha-home", "/"),
  lp("/01-lp", leadSchema01lp, "01lp", "lp", "01-lp", "/01-lp"),
  lp("/alphas-pizzaria", leadSchemaPizzaria, "pizzaria", "lp", "alphas-pizzaria", "/alphas-pizzaria"),
  lp("/resultado-alphas-pizzaria", leadSchemaPizzaria, "pizzaria-resultado", "lp", "resultado-alphas-pizzaria", "/resultado-alphas-pizzaria"),
  lp("/lead-magnetic-bastidores-alphas-pizzaria", leadSchemaPizzaria, "pizzaria-bastidores", "lp", "lead-magnetic-bastidores-alphas-pizzaria", "/lead-magnetic-bastidores-alphas-pizzaria"),
  lp("/lead-magnetic-vsl", leadSchemaLeadMagneticVsl, "lead-magnetic-vsl", "lm", "lead-magnetic-vsl", "/lead-magnetic-vsl"),
];

const args = (l: Lp) => ({ schema: l.schema, scope: l.scope, crm: l.crm });

type Call = { url: string; init: RequestInit };
function fakeCrm(respond: () => Response | Promise<Response> = () => Response.json({ status: "growth_hub", category: "A", organic: false })) {
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
  const old = { url: process.env.CRM_API_URL, key: process.env.CRM_LEAD_INTAKE_FOOD_KEY };
  const restore = (k: string, v: string | undefined) => (v === undefined ? delete process.env[k] : (process.env[k] = v));
  restore("CRM_API_URL", env.url);
  restore("CRM_LEAD_INTAKE_FOOD_KEY", env.key);
  try {
    return await fn();
  } finally {
    restore("CRM_API_URL", old.url);
    restore("CRM_LEAD_INTAKE_FOOD_KEY", old.key);
  }
}

function captureLogs() {
  const lines: string[] = [];
  const orig = { error: console.error, warn: console.warn };
  console.error = (...a: unknown[]) => lines.push(a.map(String).join(" "));
  console.warn = console.error;
  return { lines, restore: () => Object.assign(console, orig) };
}

// ===== Cada página envia UMA vez à rota food/* dela, com a chave e a origem certas =====

for (const l of LPS) {
  test(`${l.nome}: 1 envio a food/${l.rota}, x-api-key e corpo do CRM`, async () => {
    await withCrmEnv(async () => {
      const crm = fakeCrm();
      const r = await intakeLead({ data: rawLead, rawTracking, ip: "200.1.1.1", ...args(l), errors, limiters: null, fetchImpl: crm.fetchImpl });
      assert.equal(r.success, true);
      assert.equal(crm.calls.length, 1);
      const { url, init } = crm.calls[0];
      assert.equal(url, `${CRM_URL}/external/lead-intake/food/${l.rota}`);
      assert.equal(init.method, "POST");
      assert.deepEqual(init.headers, { "Content-Type": "application/json", "x-api-key": CRM_KEY });
      const body = JSON.parse(String(init.body));
      const parsed = leadSchema.parse(rawLead);
      const tracking = parseTracking(rawTracking);
      const esperado =
        l.rota === "lm"
          ? buildLmBody({ lead: parsed, tracking, leadMagnet: l.origem, pageUrl: pageUrlOf(l.path) })
          : buildFoodLpBody({ lead: parsed, tracking, origem: l.origem, pageUrl: pageUrlOf(l.path) });
      assert.deepEqual(body, esperado);
      // Atribuição: UTMs, fbclid e fbc vão; gclid não (o CRM não lê).
      assert.equal(body.utm_source, "meta");
      assert.equal(body.fbclid, "abc");
      assert.equal(body.fbc, "fb.1.1.abc");
      assert.ok(!("gclid" in body));
      assert.equal(body[l.rota === "lm" ? "lead_magnet" : "origem"], l.origem);
      assert.equal(body.page_url, pageUrlOf(l.path));
      assert.equal(body.nome, "Ana Souza");
      assert.equal(body.telefone, "+5511911110001");
      // Destino e categoria são do CRM (pago → Growth Hub, orgânico → Matriz, E → oportunidade).
      assert.ok(!("destination" in body) && !("lead_category" in body));
    });
  });
}

test("'Até 30 mil': investiria e CNPJ vão para o CRM decidir (D ou E)", async () => {
  await withCrmEnv(async () => {
    for (const l of LPS.filter((x) => x.rota === "lp")) {
      for (const investiria of ["Sim", "Não"]) {
        const crm = fakeCrm();
        const data = { ...rawLead, faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81", investiria };
        const r = await intakeLead({ data, ip: null, ...args(l), errors, limiters: null, fetchImpl: crm.fetchImpl });
        assert.equal(r.success, true, l.nome);
        const body = JSON.parse(String(crm.calls[0].init.body));
        assert.deepEqual([body.faturamento, body.investiria, body.cnpj], ["Até 30 mil", investiria, "11.222.333/0001-81"], l.nome);
      }
    }
  });
});

test("CRM responde 200 'ignored' (repetido, spam): conta como recebido e redireciona", async () => {
  await withCrmEnv(async () => {
    const crm = fakeCrm(() => Response.json({ status: "ignored", reason: "spam" }));
    const r = await intakeLead({ data: rawLead, ip: null, ...args(LPS[1]), errors, limiters: null, fetchImpl: crm.fetchImpl });
    assert.equal(r.success, true);
  });
});

// ===== Falhas: nada de CRM, cota devolvida, sem vazar dados =====

test("lead inválido: nem chama o CRM nem gasta cota", async () => {
  await withCrmEnv(async () => {
    const crm = fakeCrm();
    const { seen, limiters } = fakeLimiters();
    for (const bad of [{ ...rawLead, email: "x" }, { ...rawLead, telefone: "+55119" }, { ...rawLead, segmento: "" }, null, "texto"]) {
      const r = await intakeLead({ data: bad, ip: "1.1.1.1", ...args(LPS[2]), errors, limiters, fetchImpl: crm.fetchImpl });
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
    const a = { data: rawLead, ip: "9.9.9.9", ...args(LPS[1]), errors, limiters, fetchImpl: crm.fetchImpl };
    assert.equal((await intakeLead(a)).success, true);
    const r = await intakeLead(a);
    assert.deepEqual(r, { success: false, error: "Tente em 3 min.", reason: "rate_limited" });
    assert.equal(crm.calls.length, 1);
  });
});

test("CRM recusa (400, filtro de segurança): erro de validação amigável e cota devolvida", async () => {
  await withCrmEnv(async () => {
    const log = captureLogs();
    try {
      const crm = fakeCrm(() => Response.json({ code: "SECURITY_FILTER", reasons: ["nome: HTML"] }, { status: 400 }));
      const { limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 3 });
      const a = { data: rawLead, ip: "9.9.9.6", ...args(LPS[1]), errors, limiters, fetchImpl: crm.fetchImpl };
      assert.deepEqual(await intakeLead(a), { success: false, error: errors.validation, reason: "validation" });
      // A pessoa corrige e reenvia sem cair no rate limit.
      assert.deepEqual(await intakeLead(a), { success: false, error: errors.validation, reason: "validation" });
      assert.equal(crm.calls.length, 2);
    } finally {
      log.restore();
    }
  });
});

test("CRM responde 5xx: mostra 'tente de novo', devolve a cota e não vaza URL/chave/dados no log", async () => {
  await withCrmEnv(async () => {
    const log = captureLogs();
    try {
      const crm = fakeCrm(() => Response.json({ message: "Growth Hub indisponível", detail: "Ana Souza ana@ex.com" }, { status: 502 }));
      const { limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 3 });
      const a = { data: rawLead, ip: "9.9.9.8", ...args(LPS[3]), errors, limiters, fetchImpl: crm.fetchImpl };
      assert.deepEqual(await intakeLead(a), { success: false, error: errors.crm, reason: "crm" });
      // Cota de e-mail e telefone devolvida: a nova tentativa chega ao CRM (não cai no limite).
      assert.deepEqual(await intakeLead(a), { success: false, error: errors.crm, reason: "crm" });
      assert.equal(crm.calls.length, 2);
    } finally {
      log.restore();
    }
    const all = log.lines.join("\n");
    assert.ok(log.lines.length >= 2);
    for (const secret of [CRM_KEY, CRM_URL, "ana@ex.com", "Ana Souza", "91111"]) assert.ok(!all.includes(secret), `log vazou: ${secret}`);
  });
});

test("chave errada (401/403): 'tente de novo' (não é erro do form)", async () => {
  await withCrmEnv(async () => {
    const log = captureLogs();
    try {
      for (const status of [401, 403]) {
        const crm = fakeCrm(() => Response.json({ message: "Chave inválida" }, { status }));
        const r = await intakeLead({ data: rawLead, ip: null, ...args(LPS[0]), errors, limiters: null, fetchImpl: crm.fetchImpl });
        assert.deepEqual(r, { success: false, error: errors.crm, reason: "crm" });
      }
    } finally {
      log.restore();
    }
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
      const a = { data: rawLead, ip: "9.9.9.7", ...args(LPS[4]), errors, limiters, fetchImpl };
      assert.equal((await intakeLead(a)).success, false);
      assert.equal((await intakeLead(a)).success, false); // segue não bloqueando por rate limit
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
        const r = await intakeLead({ data: rawLead, ip: null, ...args(LPS[1]), errors, limiters: null, fetchImpl: crm.fetchImpl });
        assert.deepEqual(r, { success: false, error: errors.crm, reason: "crm" });
        assert.equal(crm.calls.length, 0);
      } finally {
        log.restore();
      }
    },
    { url: undefined, key: undefined }
  );
});

// ===== Rate limit com escopo por página =====

test("rate limit: cada página usa o seu prefixo e não divide cota com as outras", async () => {
  await withCrmEnv(async () => {
    const { seen, limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 10 });
    for (const l of LPS) {
      const crm = fakeCrm();
      const r = await intakeLead({ data: rawLead, ip: "8.8.8.8", ...args(l), errors, limiters, fetchImpl: crm.fetchImpl });
      assert.equal(r.success, true, `${l.nome} (mesmo lead em todas as páginas não colide)`);
    }
    for (const l of LPS) {
      assert.ok(seen.some((k) => new RegExp(`^${l.scope}:email:[0-9a-f]{64}$`).test(k)), l.scope);
      assert.ok(seen.some((k) => new RegExp(`^${l.scope}:telefone:[0-9a-f]{64}$`).test(k)), l.scope);
      assert.ok(seen.some((k) => new RegExp(`^${l.scope}:ip:[0-9a-f]{64}$`).test(k)), l.scope);
    }
    // Chaves guardam só hash: nunca o e-mail ou o telefone em claro.
    assert.ok(seen.every((k) => !k.includes("ana@ex.com") && !k.includes("91111")));
  });
});

// ===== Server actions: rota, origem e escopo de cada página; um envio só =====

test("server actions: cada uma chama a sua rota/origem/escopo, uma vez, sem n8n nem /external/leads", () => {
  const esperado: Record<string, RegExp[]> = {
    "submit-lead.ts": [/foodLp\("alpha-home", "\/"\)/, /scope: "home"/],
    "submit-lead-01lp.ts": [/foodLp\("01-lp", "\/01-lp"\)/, /scope: "01lp"/],
    "submit-lead-pizzaria.ts": [/foodLp\("alphas-pizzaria", "\/alphas-pizzaria"\)/, /scope: "pizzaria"/],
    "submit-lead-resultado-pizzaria.ts": [/foodLp\("resultado-alphas-pizzaria", "\/resultado-alphas-pizzaria"\)/, /scope: "pizzaria-resultado"/],
    "submit-lead-bastidores-pizzaria.ts": [/foodLp\("lead-magnetic-bastidores-alphas-pizzaria", "\/lead-magnetic-bastidores-alphas-pizzaria"\)/, /scope: "pizzaria-bastidores"/],
    "submit-lead-nds.ts": [/foodLp\("nao-dependa-de-sorte", "\/nao-dependa-de-sorte"\)/, /scope: "nao-dependa-de-sorte"/],
    "submit-lead-magnetic-vsl.ts": [/foodLm\("lead-magnetic-vsl", "\/lead-magnetic-vsl"\)/, /scope: "lead-magnetic-vsl"/],
    "submit-lead-pop.ts": [/route: "isca"/, /scope: ISCA_LPS\[slug\]\.scope/, /sendToLeadIntake\("raio-x", body\)/],
  };
  for (const [file, res] of Object.entries(esperado)) {
    const src = readFileSync(path.join(process.cwd(), "app/actions", file), "utf8");
    for (const re of res) assert.match(src, re, file);
    assert.doesNotMatch(src, /postWebhook|after\(|LEAD_WEBHOOK|\/external\/leads/, file);
    assert.equal((src.match(/await intakeLead\(/g) ?? []).length, 1, file);
  }
});

// ===== Guardas de regressão: sem n8n, sem rota antiga e sem pixel da Meta =====

function sources(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "_assets-wordpress", "_screenshots", "videos", "images", "fonts", "files"].includes(name)) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) sources(full, out);
    else if (/\.(ts|tsx|js|mjs|css|json|md|example|html)$/.test(name) && name !== "package-lock.json") out.push(full);
  }
  return out;
}

test("nenhum código, config, teste ou doc tem URL de webhook do n8n", () => {
  const root = process.cwd();
  const files = [...sources(path.join(root, "app")), ...sources(path.join(root, "components")), ...sources(path.join(root, "lib")), ...sources(path.join(root, "tests")), path.join(root, ".env.example"), path.join(root, "README.md"), path.join(root, "next.config.ts")];
  const proibido = /webhook3\.assessorialpha|assessorialpha\.com\/webhook|\/webhook\/(wordpress-geral|leads-lms|lead-magnet|leads-iscas|leads-raio-x)/;
  const achou = files.filter((f) => proibido.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
  assert.deepEqual(achou, []);
});

test("código não usa mais o n8n nem a rota/chave antiga do CRM (só food/* com CRM_LEAD_INTAKE_FOOD_KEY)", () => {
  const root = process.cwd();
  const files = [...sources(path.join(root, "app")), ...sources(path.join(root, "components")), ...sources(path.join(root, "lib")), path.join(root, ".env.example")];
  const proibido = /LEAD_WEBHOOK_URL|CRM_EXTERNAL_LEADS_API_KEY|CRM_SDR_EMAIL|\/external\/leads\b|postWebhook/;
  const achou = files.filter((f) => proibido.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
  assert.deepEqual(achou, []);
});

test("nenhum pixel/CAPI da Meta no código (só a leitura de fbclid/fbc/fbp para atribuição)", () => {
  const root = process.cwd();
  const files = [...sources(path.join(root, "app")), ...sources(path.join(root, "components")), ...sources(path.join(root, "lib")), path.join(root, "next.config.ts"), path.join(root, "package.json")];
  const proibido = /fbq\s*\(|fbevents|connect\.facebook\.net|graph\.facebook\.com\/v|facebook-pixel|NEXT_PUBLIC_(META|FB)_?PIXEL|META_(CAPI|CONVERSIONS)|react-facebook-pixel/i;
  const achou = files.filter((f) => proibido.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
  assert.deepEqual(achou, []);
});
