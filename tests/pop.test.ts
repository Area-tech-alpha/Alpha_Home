import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildTzLead } from "@/lib/crm";
import { intakeLead, type CrmTarget, type IntakeErrors } from "@/lib/lead-intake";
import type { Limiter, Limiters } from "@/lib/rate-limit";
import { FATURAMENTOS_POP, ISCA_LPS, ISCA_SLUGS, SEGMENTOS_POP, isPopSlug, popForm, raioXPath, type IscaSlug } from "@/lib/content-pop";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { RAIO_X_PADRAO, raioXVariacao } from "@/lib/content-raio-x";
import { leadSchemaPop } from "@/lib/validation-pop";

// LPs de isca: validação do form, envio a food/isca do CRM (mock local, nada sai para a
// rede) e rate limit com escopo por LP.

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

function fakeCrm(respond: () => Response = () => Response.json({ status: "crm", crmLeadId: "crm-1", category: "A" })) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return respond();
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

function fakeLimiters(max: { ip?: number } = {}) {
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
  return { seen, limiters: { email: make(1), telefone: make(1), ip: make(max.ip ?? 3) } as Limiters };
}

async function withCrmEnv<T>(fn: () => Promise<T>) {
  const old = { url: process.env.CRM_API_URL, key: process.env.CRM_LEAD_INTAKE_FOOD_KEY };
  process.env.CRM_API_URL = CRM_URL;
  process.env.CRM_LEAD_INTAKE_FOOD_KEY = CRM_KEY;
  const restore = (k: string, v: string | undefined) => (v === undefined ? delete process.env[k] : (process.env[k] = v));
  try {
    return await fn();
  } finally {
    restore("CRM_API_URL", old.url);
    restore("CRM_LEAD_INTAKE_FOOD_KEY", old.key);
  }
}

// O mesmo destino da server action (submit-lead-pop.ts): food/isca com o lead da isca.
function isca(slug: IscaSlug, pageUrl = `https://assessorialpha.com/${slug}`): CrmTarget {
  return { route: "isca", body: (l) => buildTzLead({ slug, pageUrl, lead: l, rawTracking }) };
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

// ===== Envio ao CRM (food/isca) =====

for (const slug of ISCA_SLUGS) {
  test(`/${slug}: 1 envio a food/isca com a isca, a página e os rótulos do form`, async () => {
    await withCrmEnv(async () => {
      const crm = fakeCrm();
      const r = await intakeLead({ data: lead, rawTracking, ip: "200.1.1.1", schema: leadSchemaPop, scope: ISCA_LPS[slug].scope, errors, crm: isca(slug), limiters: null, fetchImpl: crm.fetchImpl });
      assert.equal(r.success, true);
      assert.equal(crm.calls.length, 1);
      const { url, init } = crm.calls[0];
      assert.equal(url, `${CRM_URL}/external/lead-intake/food/isca`);
      assert.deepEqual(init.headers, { "Content-Type": "application/json", "x-api-key": CRM_KEY });
      const body = JSON.parse(String(init.body));
      assert.equal(body.isca, ISCA_LPS[slug].isca);
      assert.equal(body.origem_pagina, slug);
      assert.equal(body.page_url, `https://assessorialpha.com/${slug}`);
      assert.deepEqual([body.nome, body.email, body.telefone], ["Ana Souza", "ana@ex.com", "+5511911110001"]);
      // Rótulos do form (o CRM converte o segmento e lê a faixa por eles).
      assert.equal(body.segmento, "Pizzarias");
      assert.equal(body.faturamento, "100–150 mil");
      assert.equal(body.utm_source, "meta");
      assert.ok(!("empresa" in body) && !("whatsapp" in body) && !("destination" in body) && !("gclid" in body));
    });
  });
}

test("isca: 'Até 30 mil' não leva CNPJ nem investiria (régua das iscas, piso D, é do CRM)", async () => {
  await withCrmEnv(async () => {
    const crm = fakeCrm();
    const data = { ...lead, faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81", investiria: "Não" };
    const r = await intakeLead({ data, ip: null, schema: leadSchemaPop, scope: "pop-delivery", errors, crm: isca("pop-delivery"), limiters: null, fetchImpl: crm.fetchImpl });
    assert.equal(r.success, true);
    const body = JSON.parse(String(crm.calls[0].init.body));
    assert.equal(body.faturamento, "Até 30 mil");
    assert.ok(!("cnpj" in body) && !("investiria" in body));
  });
});

test("isca: CRM com 5xx não dá sucesso (sem redirect) e devolve a cota; 400 vira erro de validação", async () => {
  await withCrmEnv(async () => {
    const orig = console.error;
    console.error = () => {};
    try {
      const crm = fakeCrm(() => Response.json({ message: "Erro" }, { status: 503 }));
      const { limiters } = fakeLimiters();
      const args = { data: lead, ip: "9.9.9.9", schema: leadSchemaPop, scope: "pop-producao" as const, errors, crm: isca("pop-producao"), limiters, fetchImpl: crm.fetchImpl };
      assert.deepEqual(await intakeLead(args), { success: false, error: errors.crm, reason: "crm" });
      assert.deepEqual(await intakeLead(args), { success: false, error: errors.crm, reason: "crm" });
      assert.equal(crm.calls.length, 2);
      const recusa = fakeCrm(() => Response.json({ code: "SECURITY_FILTER", reasons: ["nome: HTML"] }, { status: 400 }));
      const r = await intakeLead({ ...args, ip: "9.9.9.10", fetchImpl: recusa.fetchImpl });
      assert.deepEqual(r, { success: false, error: errors.validation, reason: "validation" });
    } finally {
      console.error = orig;
    }
  });
});

test("isca: lead inválido não chama o CRM", async () => {
  await withCrmEnv(async () => {
    const crm = fakeCrm();
    const r = await intakeLead({ data: { ...lead, email: "x" }, ip: null, schema: leadSchemaPop, scope: "pop-expedicao", errors, crm: isca("pop-expedicao"), limiters: null, fetchImpl: crm.fetchImpl });
    assert.equal(r.success, false);
    assert.equal(crm.calls.length, 0);
  });
});

// ===== Rate limit por LP =====

test("rate limit: cada LP de isca tem o seu escopo e não divide cota com as outras", async () => {
  assert.deepEqual(ISCA_SLUGS.map((s) => ISCA_LPS[s].scope), [
    "pop-producao", "pop-expedicao", "pop-delivery", "ficha-tecnica", "cronograma-limpeza", "cardapio-que-vende", "calculadora-cmv",
  ]);
  await withCrmEnv(async () => {
    const { seen, limiters } = fakeLimiters({ ip: 10 });
    for (const slug of ISCA_SLUGS) {
      const crm = fakeCrm();
      const scope = ISCA_LPS[slug].scope;
      const r = await intakeLead({ data: lead, ip: "8.8.8.8", schema: leadSchemaPop, scope, errors, crm: isca(slug), limiters, fetchImpl: crm.fetchImpl });
      assert.equal(r.success, true, `${slug}: mesmo lead nas 7 LPs não colide`);
      for (const name of ["email", "telefone", "ip"]) {
        assert.ok(seen.some((k) => new RegExp(`^${scope}:${name}:[0-9a-f]{64}$`).test(k)), `${scope}:${name}`);
      }
    }
    // Segundo envio na mesma LP: bloqueado, sem chamar o CRM.
    const crm = fakeCrm();
    const again = await intakeLead({ data: lead, ip: "8.8.8.8", schema: leadSchemaPop, scope: "pop-producao", errors, crm: isca("pop-producao"), limiters, fetchImpl: crm.fetchImpl });
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
  assert.equal(raioXPath("ficha-tecnica"), "/raio-x-do-restaurante?isca=isca-ficha-tecnica");
  assert.equal(raioXPath("cronograma-de-limpeza"), "/raio-x-do-restaurante?isca=isca-pop-higienizacao");
  assert.equal(raioXPath("cardapio-que-vende"), "/raio-x-do-restaurante?isca=isca-cardapio");
  assert.equal(raioXPath("calculadora-de-cmv"), "/raio-x-do-restaurante?isca=isca-cmv&calc=1");
  assert.match(raioXVariacao("isca-cmv").barra, /calculadora/);
  assert.match(raioXVariacao("isca-pop-higienizacao").barra, /cronograma de limpeza/);
  assert.equal(isPopSlug("pop-producao"), true);
  assert.equal(isPopSlug("home"), false);
  assert.match(raioXVariacao("isca-pop-producao").barra, /POP de produção já está no seu e-mail/);
  assert.match(raioXVariacao("isca-pop-expedicao").etq, /estoque/);
  assert.equal(raioXVariacao("isca-desconhecida"), RAIO_X_PADRAO);
  assert.equal(raioXVariacao("__proto__"), RAIO_X_PADRAO);
});

test("form e obrigado: nada sai do navegador direto (só server actions), sem URL de webhook e sem pixel", () => {
  for (const f of ["components/pop/lead-form-pop.tsx", "components/pop/raio-x-client.tsx", "components/pop/pop-page.tsx"]) {
    const src = readFileSync(path.join(process.cwd(), f), "utf8");
    assert.doesNotMatch(src, /fetch\(|webhook3|https?:\/\/[^"']*webhook|fbq/, f);
  }
  const action = readFileSync(path.join(process.cwd(), "app/actions/submit-lead-pop.ts"), "utf8");
  assert.match(action, /intakeLead/);
  assert.match(action, /scope: ISCA_LPS\[slug\]\.scope/);
  // Isca vai a food/isca (um envio) e o Raio-X a food/raio-x; nada de n8n.
  assert.match(action, /route: "isca", body: \(lead\) => \(tzLead = buildTzLead\(\{ slug, pageUrl, lead, rawTracking \}\)\)/);
  assert.match(action, /sendToLeadIntake\("raio-x", body\)/);
  assert.doesNotMatch(action, /postWebhook|after\(|LEAD_WEBHOOK/);
});
