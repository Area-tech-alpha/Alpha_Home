import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildCrmLeadPayload } from "@/lib/crm";
import { intakeLead, type IntakeErrors } from "@/lib/lead-intake";
import type { Limiter, Limiters } from "@/lib/rate-limit";
import { parseTracking } from "@/lib/validation";
import { FATURAMENTOS_POP, POP_SLUGS, SEGMENTOS_POP, isPopSlug, popForm, raioXPath } from "@/lib/content-pop";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { RAIO_X_PADRAO, raioXVariacao } from "@/lib/content-raio-x";
import { leadSchemaPop } from "@/lib/validation-pop";

// LPs de POP: validação do form, envio ao CRM (mock local, nada sai para a rede) e
// rate limit com escopo por LP.

const CRM_URL = "http://crm.mock.local";
const CRM_KEY = "chave-falsa-de-teste";
const errors: IntakeErrors = { validation: "Dados inválidos.", rateLimited: "Tente em {min} min.", crm: "Não conseguimos enviar agora." };

const lead = {
  nome: "Ana Souza",
  email: "ana@ex.com",
  telefone: "+5511911110001",
  segmento: "Pizzarias",
  faturamento: "100 mil até 150 mil",
};
const rawTracking = { utm_source: "meta", utm_medium: "cpc", utm_campaign: "pop", utm_content: "a1", utm_term: "t", fbclid: "abc", gclid: "ignorado" };

function fakeCrm(respond: () => Response = () => Response.json({ crmLeadId: "crm-1" }, { status: 201 })) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return respond();
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

function fakeLimiters() {
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
  return { seen, limiters: { email: make(1), telefone: make(1), ip: make(3) } as Limiters };
}

async function withCrmEnv<T>(fn: () => Promise<T>) {
  const old = { url: process.env.CRM_API_URL, key: process.env.CRM_EXTERNAL_LEADS_API_KEY, sdr: process.env.CRM_SDR_EMAIL };
  process.env.CRM_API_URL = CRM_URL;
  process.env.CRM_EXTERNAL_LEADS_API_KEY = CRM_KEY;
  delete process.env.CRM_SDR_EMAIL;
  const restore = (k: string, v: string | undefined) => (v === undefined ? delete process.env[k] : (process.env[k] = v));
  try {
    return await fn();
  } finally {
    restore("CRM_API_URL", old.url);
    restore("CRM_EXTERNAL_LEADS_API_KEY", old.key);
    restore("CRM_SDR_EMAIL", old.sdr);
  }
}

// ===== Validação =====

test("form POP: mesmos 12 segmentos e 10 faixas do WP, enviando os valores da home", () => {
  assert.equal(SEGMENTOS_POP.length, 12);
  assert.equal(FATURAMENTOS_POP.length, 10);
  assert.deepEqual(SEGMENTOS_POP.map((o) => o.value), [...contentPizzaria.form.fields.segmento.options]);
  assert.deepEqual(FATURAMENTOS_POP.map((o) => o.value), [...contentPizzaria.form.fields.faturamento.options]);
  // Rótulos literais do WP.
  assert.equal(SEGMENTOS_POP[3].label, "Churrascaria/steakhouse");
  assert.equal(FATURAMENTOS_POP[1].label, "30–50 mil");
  assert.equal(popForm.submit, "ENVIAR MEU POP");
});

test("form POP: lead válido sem empresa (o WP não pede) sai com empresa vazia", () => {
  const r = leadSchemaPop.safeParse(lead);
  assert.equal(r.success, true);
  assert.equal(r.success && r.data.empresa, "");
});

test("form POP: rejeita nome curto, e-mail, WhatsApp, segmento e faixa inválidos", () => {
  const casos: [Record<string, unknown>, string, string][] = [
    [{ nome: "A" }, "nome", popForm.errors.nome],
    [{ email: "x" }, "email", popForm.errors.email],
    [{ telefone: "+55119" }, "telefone", popForm.errors.telefone],
    [{ segmento: "Açaí/sorveteria" }, "segmento", popForm.errors.segmento],
    [{ faturamento: "30–50 mil" }, "faturamento", popForm.errors.faturamento],
  ];
  for (const [extra, campo, msg] of casos) {
    const r = leadSchemaPop.safeParse({ ...lead, ...extra });
    assert.equal(r.success, false, campo);
    if (!r.success) assert.deepEqual([r.error.issues[0].path[0], r.error.issues[0].message], [campo, msg]);
  }
});

test("form POP: CNPJ e investiria só são exigidos em 'Até 30 mil'", () => {
  const ate30 = { ...lead, faturamento: "Até 30 mil" };
  const semExtras = leadSchemaPop.safeParse(ate30);
  assert.equal(semExtras.success, false);
  if (!semExtras.success) assert.deepEqual(semExtras.error.issues.map((i) => i.path[0]).sort(), ["cnpj", "investiria"]);
  assert.equal(leadSchemaPop.safeParse({ ...ate30, cnpj: "11.111.111/1111-11", investiria: "Sim" }).success, false);
  assert.equal(leadSchemaPop.safeParse({ ...ate30, cnpj: "11.222.333/0001-81", investiria: "Sim" }).success, true);
  for (const { value } of FATURAMENTOS_POP.slice(1)) assert.equal(leadSchemaPop.safeParse({ ...lead, faturamento: value }).success, true, value);
});

// ===== Envio ao CRM =====

for (const slug of POP_SLUGS) {
  test(`/${slug}: 1 envio ao CRM com o payload da home (sem company)`, async () => {
    await withCrmEnv(async () => {
      const crm = fakeCrm();
      const r = await intakeLead({ data: lead, rawTracking, ip: "200.1.1.1", schema: leadSchemaPop, scope: slug, errors, limiters: null, fetchImpl: crm.fetchImpl });
      assert.equal(r.success, true);
      assert.equal(crm.calls.length, 1);
      const { url, init } = crm.calls[0];
      assert.equal(url, `${CRM_URL}/external/leads`);
      assert.deepEqual(init.headers, { "Content-Type": "application/json", "x-api-key": CRM_KEY });
      const body = JSON.parse(String(init.body));
      const daHome = buildCrmLeadPayload({ ...lead, empresa: "" }, parseTracking(rawTracking), undefined);
      assert.deepEqual(body, JSON.parse(JSON.stringify(daHome)));
      assert.ok(!("company" in body));
      assert.equal(body.source, "alpha-home");
      assert.equal(body.destination, "hq");
      assert.equal(body.segmento, "Pizzarias");
      assert.equal(body.faturamento, "100 mil até 150 mil");
      assert.ok(!("gclid" in body));
    });
  });
}

test("POP: 'Até 30 mil' + Sim vai como categoria D, com o CNPJ em document", async () => {
  await withCrmEnv(async () => {
    const crm = fakeCrm();
    const data = { ...lead, faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81", investiria: "Sim" };
    const r = await intakeLead({ data, ip: null, schema: leadSchemaPop, scope: "pop-delivery", errors, limiters: null, fetchImpl: crm.fetchImpl });
    assert.equal(r.success, true);
    const body = JSON.parse(String(crm.calls[0].init.body));
    assert.equal(body.lead_category, "D");
    assert.equal(body.document, "11.222.333/0001-81");
  });
});

test("POP: CRM com erro não dá sucesso (sem redirect) e devolve a cota", async () => {
  await withCrmEnv(async () => {
    const orig = console.error;
    console.error = () => {};
    try {
      const crm = fakeCrm(() => Response.json({ code: "INVALID_LEAD" }, { status: 422 }));
      const { limiters } = fakeLimiters();
      const args = { data: lead, ip: "9.9.9.9", schema: leadSchemaPop, scope: "pop-producao" as const, errors, limiters, fetchImpl: crm.fetchImpl };
      assert.deepEqual(await intakeLead(args), { success: false, error: errors.crm, reason: "crm" });
      assert.deepEqual(await intakeLead(args), { success: false, error: errors.crm, reason: "crm" });
      assert.equal(crm.calls.length, 2);
    } finally {
      console.error = orig;
    }
  });
});

test("POP: lead inválido não chama o CRM", async () => {
  await withCrmEnv(async () => {
    const crm = fakeCrm();
    const r = await intakeLead({ data: { ...lead, email: "x" }, ip: null, schema: leadSchemaPop, scope: "pop-expedicao", errors, limiters: null, fetchImpl: crm.fetchImpl });
    assert.equal(r.success, false);
    assert.equal(crm.calls.length, 0);
  });
});

// ===== Rate limit por LP =====

test("rate limit: cada LP de POP tem o seu escopo e não divide cota com as outras", async () => {
  await withCrmEnv(async () => {
    const { seen, limiters } = fakeLimiters();
    for (const slug of POP_SLUGS) {
      const crm = fakeCrm();
      const r = await intakeLead({ data: lead, ip: "8.8.8.8", schema: leadSchemaPop, scope: slug, errors, limiters, fetchImpl: crm.fetchImpl });
      assert.equal(r.success, true, `${slug}: mesmo lead nas 3 LPs não colide`);
    }
    for (const slug of POP_SLUGS) {
      for (const name of ["email", "telefone", "ip"]) {
        assert.ok(seen.some((k) => new RegExp(`^${slug}:${name}:[0-9a-f]{64}$`).test(k)), `${slug}:${name}`);
      }
    }
    // Segundo envio na mesma LP: bloqueado, sem chamar o CRM.
    const crm = fakeCrm();
    const again = await intakeLead({ data: lead, ip: "8.8.8.8", schema: leadSchemaPop, scope: "pop-producao", errors, limiters, fetchImpl: crm.fetchImpl });
    assert.deepEqual(again, { success: false, error: "Tente em 3 min.", reason: "rate_limited" });
    assert.equal(crm.calls.length, 0);
    assert.ok(seen.every((k) => !k.includes("ana@ex.com")));
  });
});

// ===== Pós-envio =====

test("pós-envio: obrigado na rota do WP, com a isca de cada LP", () => {
  assert.equal(raioXPath("pop-producao"), "/raio-x-do-restaurante?isca=isca-pop-producao");
  assert.equal(raioXPath("pop-expedicao"), "/raio-x-do-restaurante?isca=isca-pop-expedicao");
  assert.equal(raioXPath("pop-delivery"), "/raio-x-do-restaurante?isca=isca-pop-delivery");
  assert.equal(isPopSlug("pop-producao"), true);
  assert.equal(isPopSlug("home"), false);
  assert.match(raioXVariacao("isca-pop-producao").barra, /POP de produção já está no seu e-mail/);
  assert.match(raioXVariacao("isca-pop-expedicao").etq, /estoque/);
  assert.equal(raioXVariacao("isca-desconhecida"), RAIO_X_PADRAO);
  assert.equal(raioXVariacao("__proto__"), RAIO_X_PADRAO);
});

test("form e obrigado: nenhum envio além do CRM (sem webhook, sem fetch no navegador)", () => {
  for (const f of ["components/pop/lead-form-pop.tsx", "components/pop/raio-x-client.tsx", "components/pop/pop-page.tsx"]) {
    const src = readFileSync(path.join(process.cwd(), f), "utf8");
    assert.doesNotMatch(src, /fetch\(|webhook3|leads-iscas|leads-raio-x|fbq/, f);
  }
  const action = readFileSync(path.join(process.cwd(), "app/actions/submit-lead-pop.ts"), "utf8");
  assert.match(action, /intakeLead/);
  assert.match(action, /scope: slug/);
});
