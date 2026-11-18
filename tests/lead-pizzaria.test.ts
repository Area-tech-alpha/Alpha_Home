import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularQualificacaoPizzaria,
  classificarOrigemOrganica,
  dispostoInvestir,
  parseTrackingPizzaria,
  storedLeadSchemaPizzaria,
  telefoneFormatoWP,
} from "@/lib/lead-pizzaria";
import { checkLeadRateLimit, type Limiter, type Limiters } from "@/lib/rate-limit";
import { leadSchemaPizzaria, type LeadFormDataPizzaria } from "@/lib/validation-pizzaria";
import { buildWebhookPizzariaPayload, sendLeadToWebhookPizzaria } from "@/lib/webhook-pizzaria";

// Só mocks locais: nenhuma chamada sai para a rede e a URL abaixo é fictícia.
const SECRET_URL = "https://n8n.exemplo.com/webhook/token-secreto-123";
const ctx = { siteUrl: "https://assessorialpha.com", now: new Date("2026-11-18T12:00:00.000Z") };
const PAGE_2 = "https://assessorialpha.com/alphas-pizzaria/obrigado";

const lead: LeadFormDataPizzaria = {
  nome: "Ana Souza",
  email: "ana@ex.com",
  telefone: "+5511911110001",
  empresa: "Pizzaria da Ana",
  segmento: "pizzarias",
  faturamento: "100 mil até 150 mil",
};

const CNPJ_VALIDO = "11.222.333/0001-81";

// ===== Validação =====

test("validação: lead completo passa", () => {
  assert.equal(leadSchemaPizzaria.safeParse(lead).success, true);
});

test("validação: telefone inválido usa a mensagem do WP", () => {
  const r = leadSchemaPizzaria.safeParse({ ...lead, telefone: "+55119" });
  assert.equal(r.success, false);
  assert.equal(r.error?.issues[0].message, "Telefone inválido, confira o número.");
});

test("validação: segmento e faturamento só aceitam as opções do WP", () => {
  assert.equal(leadSchemaPizzaria.safeParse({ ...lead, segmento: "Pizzarias" }).success, false);
  assert.equal(leadSchemaPizzaria.safeParse({ ...lead, faturamento: "ate-30" }).success, false);
});

test("validação: 'Até 30 mil' exige CNPJ válido e 'investiria'; outras faixas não", () => {
  const ate30 = { ...lead, faturamento: "Até 30 mil" };
  const semExtras = leadSchemaPizzaria.safeParse(ate30);
  assert.equal(semExtras.success, false);
  const paths = semExtras.error?.issues.map((i) => i.path[0]);
  assert.deepEqual(paths, ["cnpj", "investiria"]);
  assert.equal(
    leadSchemaPizzaria.safeParse({ ...ate30, cnpj: "11.222.333/0001-00", investiria: "Sim" }).error?.issues[0].message,
    "CNPJ inválido, confira o número."
  );
  assert.equal(leadSchemaPizzaria.safeParse({ ...ate30, cnpj: CNPJ_VALIDO, investiria: "Não" }).success, true);
});

test("validação: lead guardado entre as páginas exige data ISO e o lead válido", () => {
  const ok = {
    lead,
    tracking: {},
    page_url: "https://assessorialpha.com/alphas-pizzaria",
    referrer: "",
    form_preenchido_em: "2026-11-18T11:58:00.000Z",
  };
  assert.equal(storedLeadSchemaPizzaria.safeParse(ok).success, true);
  assert.equal(storedLeadSchemaPizzaria.safeParse({ ...ok, form_preenchido_em: "ontem" }).success, false);
  assert.equal(storedLeadSchemaPizzaria.safeParse({ ...ok, lead: { ...lead, email: "x" } }).success, false);
});

// ===== Regras literais do WP =====

test("qualificação: cada faixa gera o tipo_lead e o slug do WP", () => {
  const esperado: Record<string, [string, string]> = {
    "30 mil até 50 mil": ["obrigado-c", "c"],
    "50 mil até 80 mil": ["obrigado-b", "b"],
    "80 mil até 100 mil": ["obrigado", "qualificado-geral"],
    "100 mil até 150 mil": ["obrigado-a", "a"],
    "Mais de 1 milhão": ["obrigado-a", "a"],
  };
  for (const [faixa, [slug, tipo]] of Object.entries(esperado)) {
    assert.deepEqual(calcularQualificacaoPizzaria(faixa, dispostoInvestir(faixa)), { slug, tipo }, faixa);
  }
  assert.deepEqual(calcularQualificacaoPizzaria("Até 30 mil", dispostoInvestir("Até 30 mil", "Sim")), {
    slug: "obrigado-c",
    tipo: "c",
  });
  assert.deepEqual(calcularQualificacaoPizzaria("Até 30 mil", dispostoInvestir("Até 30 mil", "Não")), {
    slug: "agradecimento",
    tipo: "desqualificado",
  });
});

test("telefone no formato do WP: +DDI e a máscara literal do formatPhone()", () => {
  assert.equal(telefoneFormatoWP("+5511911110001"), "+55 (11) 91111-0001");
  // Fixo de 10 dígitos: a máscara do WP sai "(11) 34567-890".
  assert.equal(telefoneFormatoWP("+551134567890"), "+55 (11) 34567-890");
  assert.equal(telefoneFormatoWP("+351912345678"), "+351 912345678");
});

test("origem orgânica: mesma classificação do WP pelo referrer", () => {
  const host = "assessorialpha.com";
  assert.deepEqual(classificarOrigemOrganica("", host), { utm_source: "direto", utm_medium: "nenhum" });
  assert.deepEqual(classificarOrigemOrganica("https://assessorialpha.com/blog", host), {
    utm_source: "direto",
    utm_medium: "nenhum",
  });
  assert.deepEqual(classificarOrigemOrganica("https://www.google.com.br/", host), {
    utm_source: "google",
    utm_medium: "organico",
  });
  assert.deepEqual(classificarOrigemOrganica("https://l.instagram.com/?u=x", host), {
    utm_source: "l",
    utm_medium: "organico",
  });
  assert.deepEqual(classificarOrigemOrganica("https://parceiro.com.br/post", host), {
    utm_source: "parceiro.com.br",
    utm_medium: "referral",
  });
});

test("tracking: só chaves conhecidas, sem valores vazios ou gigantes", () => {
  const t = parseTrackingPizzaria({ utm_source: "meta", utm_medium: "", fbclid: "x".repeat(600), outra: "y" });
  assert.deepEqual(t, { utm_source: "meta" });
});

// ===== Payload (formato e ordem das chaves) =====

const ORDEM_COM_LEAD = [
  "nome",
  "email",
  "telefone",
  "empresa",
  "segmento",
  "faturamento",
  "disposto_investir",
  "cnpj",
  "tipo_lead",
  "redirect_url",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "fbc",
  "gcl_aw",
  "origem_form",
  "page_url",
  "referrer",
  "form_preenchido_em",
  "lead_sem_form",
  "video_progresso",
  "origem_confirmacao",
  "confirmado_em",
];

test("payload com lead: valores e ordem de chaves iguais ao objeto final do WP", () => {
  const payload = buildWebhookPizzariaPayload(
    {
      lead,
      tracking: { utm_source: "meta", utm_medium: "cpc", utm_campaign: "pizzaria", fbclid: "abc", fbc: "fb.1.1.abc" },
      referrer: "https://l.instagram.com/",
      formPreenchidoEm: "2026-11-18T11:58:00.000Z",
    },
    { pageUrl: PAGE_2, trackingFresh: { utm_source: "ignorado" }, referrer: "https://ignorado.com/" },
    ctx
  );
  assert.deepEqual(Object.keys(payload), ORDEM_COM_LEAD);
  assert.deepEqual(payload, {
    nome: "Ana Souza",
    email: "ana@ex.com",
    telefone: "+55 (11) 91111-0001",
    empresa: "Pizzaria da Ana",
    segmento: "pizzarias",
    faturamento: "100 mil até 150 mil",
    disposto_investir: "",
    cnpj: "",
    tipo_lead: "a",
    redirect_url: "https://assessorialpha.com/obrigado-a/",
    utm_source: "meta",
    utm_medium: "cpc",
    utm_campaign: "pizzaria",
    utm_term: "",
    utm_content: "",
    utm_id: "",
    gclid: "",
    fbclid: "abc",
    fbc: "fb.1.1.abc",
    gcl_aw: "",
    origem_form: "LP VSL Alphas (Renam) - pagina 1",
    page_url: PAGE_2,
    referrer: "https://l.instagram.com/",
    form_preenchido_em: "2026-11-18T11:58:00.000Z",
    lead_sem_form: false,
    video_progresso: "50%+",
    origem_confirmacao: "LP VSL Alphas (Renam) - pagina 2 (video)",
    confirmado_em: "2026-11-18T12:00:00.000Z",
  });
});

test("payload 'Até 30 mil' + Não: CNPJ com máscara, disposto 'agradecimento', desqualificado", () => {
  const payload = buildWebhookPizzariaPayload(
    {
      lead: { ...lead, faturamento: "Até 30 mil", cnpj: "11222333000181", investiria: "Não" },
      tracking: {},
      referrer: "",
      formPreenchidoEm: "2026-11-18T11:58:00.000Z",
    },
    { pageUrl: PAGE_2, trackingFresh: {}, referrer: "" },
    ctx
  );
  assert.equal(payload.cnpj, CNPJ_VALIDO);
  assert.equal(payload.disposto_investir, "agradecimento");
  assert.equal(payload.tipo_lead, "desqualificado");
  assert.equal(payload.redirect_url, "https://assessorialpha.com/agradecimento/");
});

test("payload '80 mil até 100 mil': qualificado-geral com redirect_url .../obrigado/ (igual ao WP)", () => {
  const payload = buildWebhookPizzariaPayload(
    { lead: { ...lead, faturamento: "80 mil até 100 mil" }, tracking: {}, referrer: "", formPreenchidoEm: "2026-11-18T11:58:00.000Z" },
    { pageUrl: PAGE_2, trackingFresh: {}, referrer: "" },
    ctx
  );
  assert.equal(payload.tipo_lead, "qualificado-geral");
  assert.equal(payload.redirect_url, "https://assessorialpha.com/obrigado/");
});

test("payload sem lead (abriu o vídeo direto): tipo 'sem-form', UTMs da página 2 e page_url no fim", () => {
  const payload = buildWebhookPizzariaPayload(
    null,
    { pageUrl: PAGE_2, trackingFresh: { utm_source: "google", gclid: "g1" }, referrer: "https://www.google.com/" },
    ctx
  );
  assert.deepEqual(Object.keys(payload), [
    "nome",
    "email",
    "telefone",
    "empresa",
    "segmento",
    "faturamento",
    "disposto_investir",
    "cnpj",
    "tipo_lead",
    "redirect_url",
    "origem_form",
    "referrer",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
    "gclid",
    "fbclid",
    "fbc",
    "gcl_aw",
    "lead_sem_form",
    "video_progresso",
    "origem_confirmacao",
    "page_url",
    "confirmado_em",
  ]);
  assert.equal(payload.tipo_lead, "sem-form");
  assert.equal(payload.lead_sem_form, true);
  assert.equal(payload.utm_source, "google");
  assert.equal(payload.utm_medium, "");
  assert.equal(payload.gclid, "g1");
  assert.equal(payload.referrer, "https://www.google.com/");
});

// ===== Envio (mock local de fetch) =====

function captureLogs() {
  const lines: string[] = [];
  const orig = { error: console.error, warn: console.warn, log: console.log };
  for (const k of ["error", "warn", "log"] as const) {
    console[k] = (...args: unknown[]) => lines.push(args.map(String).join(" "));
  }
  return { lines, restore: () => Object.assign(console, orig) };
}

const payloadBase = buildWebhookPizzariaPayload(
  { lead, tracking: {}, referrer: "", formPreenchidoEm: "2026-11-18T11:58:00.000Z" },
  { pageUrl: PAGE_2, trackingFresh: {}, referrer: "" },
  ctx
);

test("envio: POST JSON para a URL da env, com timeout, corpo igual ao payload", async () => {
  let call: { url: string; init: RequestInit } | null = null;
  const fakeFetch = (async (url: string, init: RequestInit) => {
    call = { url, init };
    return new Response("ok", { status: 200 });
  }) as unknown as typeof fetch;
  const r = await sendLeadToWebhookPizzaria(payloadBase, fakeFetch, SECRET_URL);
  assert.deepEqual(r, { ok: true, httpStatus: 200 });
  assert.ok(call);
  const { url, init } = call as { url: string; init: RequestInit };
  assert.equal(url, SECRET_URL);
  assert.equal(init.method, "POST");
  assert.deepEqual(init.headers, { "Content-Type": "application/json" });
  assert.ok(init.signal instanceof AbortSignal);
  assert.equal(init.body, JSON.stringify(payloadBase));
  assert.deepEqual(Object.keys(JSON.parse(init.body as string)), ORDEM_COM_LEAD);
});

test("envio: falha HTTP e de rede não vazam URL nem dados do lead no log", async () => {
  const log = captureLogs();
  try {
    const http500 = (async () => new Response("erro", { status: 500 })) as unknown as typeof fetch;
    assert.deepEqual(await sendLeadToWebhookPizzaria(payloadBase, http500, SECRET_URL), {
      ok: false,
      httpStatus: 500,
      reason: "http_500",
    });
    const offline = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    const r = await sendLeadToWebhookPizzaria(payloadBase, offline, SECRET_URL);
    assert.equal(r.ok, false);
  } finally {
    log.restore();
  }
  const all = log.lines.join("\n");
  assert.ok(log.lines.length >= 2);
  for (const secret of [SECRET_URL, "token-secreto", "ana@ex.com", "Ana Souza", "91111"]) {
    assert.ok(!all.includes(secret), `log vazou: ${secret}`);
  }
});

test("envio: env ausente → não chama fetch e falha como não configurado", async () => {
  let called = false;
  const fakeFetch = (async () => {
    called = true;
    return new Response("ok");
  }) as unknown as typeof fetch;
  const log = captureLogs();
  try {
    const r = await sendLeadToWebhookPizzaria(payloadBase, fakeFetch, undefined);
    assert.deepEqual(r, { ok: false, httpStatus: 0, reason: "webhook_not_configured" });
  } finally {
    log.restore();
  }
  assert.equal(called, false);
});

// ===== Rate limit com escopo próprio =====

function fakeLimiters(max: { email: number; telefone: number; ip: number }) {
  const seen: string[] = [];
  const counts = new Map<string, number>();
  const make = (n: number): Limiter => ({
    async limit(key) {
      seen.push(key);
      const c = (counts.get(key) ?? 0) + 1;
      counts.set(key, c);
      return { success: c <= n, reset: 60_000 };
    },
    async resetUsedTokens(key) {
      counts.delete(key);
    },
  });
  const limiters: Limiters = { email: make(max.email), telefone: make(max.telefone), ip: make(max.ip) };
  return { seen, limiters };
}

test("rate limit da pizzaria usa o prefixo pizzaria: e não divide cota com a home nem com a 01-lp", async () => {
  const { seen, limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 3 });
  const input = { email: "ana@ex.com", telefone: "+5511911110001", ip: "200.1.1.1" };
  assert.deepEqual(await checkLeadRateLimit({ ...input, scope: "pizzaria" }, limiters, 0), { ok: true });
  assert.match(seen[0], /^pizzaria:email:[0-9a-f]{64}$/);
  assert.match(seen[1], /^pizzaria:telefone:[0-9a-f]{64}$/);
  assert.match(seen[2], /^pizzaria:ip:[0-9a-f]{64}$/);
  // Mesmo e-mail de novo na pizzaria bloqueia; na home e na 01-lp, não.
  assert.equal((await checkLeadRateLimit({ ...input, scope: "pizzaria" }, limiters, 0)).ok, false);
  assert.equal((await checkLeadRateLimit({ ...input, scope: "home" }, limiters, 0)).ok, true);
  assert.equal((await checkLeadRateLimit({ ...input, scope: "01lp" }, limiters, 0)).ok, true);
});

test("rate limit sem e-mail/telefone (lead sem form): só o IP conta", async () => {
  const { seen, limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 3 });
  assert.deepEqual(await checkLeadRateLimit({ email: "", telefone: "", ip: "200.1.1.2", scope: "pizzaria" }, limiters, 0), {
    ok: true,
  });
  assert.equal(seen.length, 1);
  assert.match(seen[0], /^pizzaria:ip:[0-9a-f]{64}$/);
});
