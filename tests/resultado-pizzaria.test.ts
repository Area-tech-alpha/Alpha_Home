import { test } from "node:test";
import assert from "node:assert/strict";
import { contentResultado } from "@/lib/content-resultado-pizzaria";
import { LEAD_TTL_MS_PIZZARIA } from "@/lib/lead-pizzaria-constants";
import { decidirConfirmacaoPizzaria, parseSentMarkPizzaria } from "@/lib/obrigado-pizzaria";
import { checkLeadRateLimit, releaseLeadRateLimit, type Limiter, type Limiters } from "@/lib/rate-limit";
import { leadSchemaPizzaria, type LeadFormDataPizzaria } from "@/lib/validation-pizzaria";
import { buildWebhookPizzariaPayload, sendLeadToWebhookPizzaria } from "@/lib/webhook-pizzaria";
import { buildWebhookResultadoPayload } from "@/lib/webhook-resultado-pizzaria";

// Só mocks locais: nenhuma chamada sai para a rede e a URL abaixo é fictícia.
const SECRET_URL = "https://n8n.exemplo.com/webhook/token-secreto-456";
const PAGE = "https://assessorialpha.com/resultado-alphas-pizzaria";
const ctx = { siteUrl: "https://assessorialpha.com", now: new Date("2026-11-18T12:00:00.000Z"), pageUrl: PAGE, referrer: "" };

const lead: LeadFormDataPizzaria = {
  nome: "Ana Souza",
  email: "ana@ex.com",
  telefone: "+5511911110001",
  empresa: "Pizzaria da Ana",
  segmento: "pizzarias",
  faturamento: "100 mil até 150 mil",
};

const ORDEM = [
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
  "page_url",
  "referrer",
  "submitted_at",
];

// ===== Validação (mesmos campos e regras da /alphas-pizzaria) =====

test("resultado: validação aceita lead completo e segue as regras do WP", () => {
  assert.equal(leadSchemaPizzaria.safeParse(lead).success, true);
  assert.equal(leadSchemaPizzaria.safeParse({ ...lead, telefone: "+55119" }).error?.issues[0].message, "Telefone inválido, confira o número.");
  const ate30 = leadSchemaPizzaria.safeParse({ ...lead, faturamento: "Até 30 mil" });
  assert.deepEqual(ate30.error?.issues.map((i) => i.path[0]), ["cnpj", "investiria"]);
  assert.equal(
    leadSchemaPizzaria.safeParse({ ...lead, faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81", investiria: "Sim" }).success,
    true
  );
});

// ===== Payload (formato e ordem iguais ao do WP) =====

test("resultado: payload com as mesmas chaves, ordem e valores do WP", () => {
  const p = buildWebhookResultadoPayload(
    lead,
    { utm_source: "meta", utm_medium: "cpc", utm_campaign: "pizzaria", fbclid: "abc", fbc: "fb.1.1.abc" },
    { ...ctx, referrer: "https://l.instagram.com/" }
  );
  assert.deepEqual(Object.keys(p), ORDEM);
  assert.deepEqual(p, {
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
    page_url: PAGE,
    referrer: "https://l.instagram.com/",
    submitted_at: "2026-11-18T12:00:00.000Z",
  });
  // Sem origem_form e sem os campos de vídeo: só a VSL tem.
  for (const k of ["origem_form", "lead_sem_form", "video_progresso", "confirmado_em"]) assert.ok(!(k in p), k);
});

test("resultado: tipo_lead e redirect_url seguem a regra de faturamento do WP (80-100 mil = obrigado)", () => {
  const casos: [string, "Sim" | "Não" | undefined, string, string][] = [
    ["30 mil até 50 mil", undefined, "c", "obrigado-c"],
    ["50 mil até 80 mil", undefined, "b", "obrigado-b"],
    ["80 mil até 100 mil", undefined, "qualificado-geral", "obrigado"],
    ["Mais de 1 milhão", undefined, "a", "obrigado-a"],
    ["Até 30 mil", "Sim", "c", "obrigado-c"],
    ["Até 30 mil", "Não", "desqualificado", "agradecimento"],
  ];
  for (const [faturamento, investiria, tipo, slug] of casos) {
    const l = { ...lead, faturamento, ...(faturamento === "Até 30 mil" && { cnpj: "11222333000181", investiria }) };
    const p = buildWebhookResultadoPayload(l, {}, ctx);
    assert.equal(p.tipo_lead, tipo, faturamento);
    assert.equal(p.redirect_url, `https://assessorialpha.com/${slug}/`, faturamento);
  }
  const ate30 = buildWebhookResultadoPayload({ ...lead, faturamento: "Até 30 mil", cnpj: "11222333000181", investiria: "Não" }, {}, ctx);
  assert.equal(ate30.cnpj, "11.222.333/0001-81");
  assert.equal(ate30.disposto_investir, "agradecimento");
});

// ===== Envio (mock local de fetch) =====

test("resultado: envio POST JSON para a URL da env com o corpo igual ao payload", async () => {
  const payload = buildWebhookResultadoPayload(lead, {}, ctx);
  let call: { url: string; init: RequestInit } | null = null;
  const fakeFetch = (async (url: string, init: RequestInit) => {
    call = { url, init };
    return new Response("ok", { status: 200 });
  }) as unknown as typeof fetch;
  assert.deepEqual(await sendLeadToWebhookPizzaria(payload, fakeFetch, SECRET_URL), { ok: true, httpStatus: 200 });
  const { url, init } = call as unknown as { url: string; init: RequestInit };
  assert.equal(url, SECRET_URL);
  assert.equal(init.method, "POST");
  assert.deepEqual(init.headers, { "Content-Type": "application/json" });
  assert.equal(init.body, JSON.stringify(payload));
  assert.deepEqual(Object.keys(JSON.parse(init.body as string)), ORDEM);
});

test("resultado: falha do webhook não vaza URL nem dados do lead no log", async () => {
  const payload = buildWebhookResultadoPayload(lead, {}, ctx);
  const lines: string[] = [];
  const orig = { error: console.error, warn: console.warn };
  console.error = (...a: unknown[]) => lines.push(a.map(String).join(" "));
  console.warn = console.error;
  try {
    const http500 = (async () => new Response("erro", { status: 500 })) as unknown as typeof fetch;
    assert.equal((await sendLeadToWebhookPizzaria(payload, http500, SECRET_URL)).ok, false);
  } finally {
    Object.assign(console, orig);
  }
  const all = lines.join("\n");
  assert.ok(lines.length >= 1);
  for (const secret of [SECRET_URL, "token-secreto", "ana@ex.com", "Ana Souza"]) assert.ok(!all.includes(secret), secret);
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
  return { seen, limiters: { email: make(max.email), telefone: make(max.telefone), ip: make(max.ip) } as Limiters };
}

test("rate limit da resultado usa o prefixo pizzaria-resultado: e não divide cota com a VSL, a home nem a 01-lp", async () => {
  const { seen, limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 3 });
  const input = { email: "ana@ex.com", telefone: "+5511911110001", ip: "200.1.1.1" };
  assert.deepEqual(await checkLeadRateLimit({ ...input, scope: "pizzaria-resultado" }, limiters, 0), { ok: true });
  assert.match(seen[0], /^pizzaria-resultado:email:[0-9a-f]{64}$/);
  assert.match(seen[1], /^pizzaria-resultado:telefone:[0-9a-f]{64}$/);
  assert.match(seen[2], /^pizzaria-resultado:ip:[0-9a-f]{64}$/);
  assert.equal((await checkLeadRateLimit({ ...input, scope: "pizzaria-resultado" }, limiters, 0)).ok, false);
  for (const scope of ["pizzaria", "home", "01lp"] as const) {
    assert.equal((await checkLeadRateLimit({ ...input, scope }, limiters, 0)).ok, true, scope);
  }
});

test("rate limit da resultado: falha no envio devolve a cota de e-mail e telefone", async () => {
  const { limiters } = fakeLimiters({ email: 1, telefone: 1, ip: 3 });
  const input = { email: "ana@ex.com", telefone: "+5511911110001", ip: "200.1.1.9", scope: "pizzaria-resultado" as const };
  assert.equal((await checkLeadRateLimit(input, limiters, 0)).ok, true);
  assert.equal((await checkLeadRateLimit(input, limiters, 0)).ok, false);
  await releaseLeadRateLimit({ email: input.email, telefone: input.telefone, scope: input.scope }, limiters);
  assert.equal((await checkLeadRateLimit({ ...input, ip: "200.1.1.10" }, limiters, 0)).ok, true);
});

// ===== Obrigado da VSL: não repete o lead que a resultado já enviou =====

const NOW = Date.parse("2026-11-18T12:00:00.000Z");
const marca = (enviado_em: string) => ({ lead, enviado_em });

test("obrigado: com a marca da resultado, o botão só abre o PDF (sem webhook)", () => {
  assert.equal(decidirConfirmacaoPizzaria(marca("2026-11-18T11:58:00.000Z"), NOW), "so-pdf");
  assert.equal(parseSentMarkPizzaria(marca("2026-11-18T11:58:00.000Z"), NOW)?.enviado_em, "2026-11-18T11:58:00.000Z");
});

test("obrigado: sem marca (VSL normal ou obrigado aberto direto) continua enviando uma vez", () => {
  assert.equal(decidirConfirmacaoPizzaria(null, NOW), "enviar");
  assert.equal(decidirConfirmacaoPizzaria(undefined, NOW), "enviar");
});

test("obrigado: marca vencida (>2h), futura demais ou malformada é ignorada", () => {
  const velha = new Date(NOW - LEAD_TTL_MS_PIZZARIA - 1000).toISOString();
  assert.equal(decidirConfirmacaoPizzaria(marca(velha), NOW), "enviar");
  assert.equal(decidirConfirmacaoPizzaria(marca("2026-11-18T14:00:00.000Z"), NOW), "enviar");
  for (const ruim of ["x", 1, [], {}, { lead: null, enviado_em: "2026-11-18T11:58:00.000Z" }, { lead, enviado_em: "ontem" }, { lead, enviado_em: 5 }]) {
    assert.equal(decidirConfirmacaoPizzaria(ruim, NOW), "enviar", JSON.stringify(ruim));
  }
});

test("obrigado: o fluxo da VSL não mudou (payload com lead e sem-form seguem iguais)", () => {
  const vsl = buildWebhookPizzariaPayload(
    { lead, tracking: {}, referrer: "", formPreenchidoEm: "2026-11-18T11:58:00.000Z" },
    { pageUrl: "https://assessorialpha.com/alphas-pizzaria/obrigado", trackingFresh: {}, referrer: "" },
    { siteUrl: ctx.siteUrl, now: ctx.now }
  );
  assert.equal(vsl.origem_form, "LP VSL Alphas (Renam) - pagina 1");
  assert.equal(vsl.lead_sem_form, false);
  const semForm = buildWebhookPizzariaPayload(
    null,
    { pageUrl: "https://assessorialpha.com/alphas-pizzaria/obrigado", trackingFresh: {}, referrer: "" },
    { siteUrl: ctx.siteUrl, now: ctx.now }
  );
  assert.equal(semForm.tipo_lead, "sem-form");
  assert.equal(semForm.lead_sem_form, true);
});

// ===== Conteúdo =====

test("conteúdo: 15 episódios na ordem do WP e capas ainda vazias", () => {
  const { items, covers } = contentResultado.episodios;
  assert.equal(items.length, 15);
  assert.equal(items[0], "https://www.instagram.com/reel/DR0Mx5Hknbi/");
  assert.equal(items[14], "https://www.instagram.com/reel/DSlPz4ZEZPw/");
  assert.equal(new Set(items).size, 15);
  assert.deepEqual(covers, []);
});
