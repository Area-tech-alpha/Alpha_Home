import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFoodLpBody, buildLmBody, buildRaioXBody, buildTzLead, pageUrlOf, sendToLeadIntake } from "@/lib/crm";
import { TZ_LEAD_FIELDS } from "@/lib/tz-lead-constants";
import type { LeadFormData } from "@/lib/validation";
import { leadSchemaPop } from "@/lib/validation-pop";

// Entrada de leads do CRM (food/*): corpos no formato que cada handler do CRM lê e envio
// com a chave. Tudo com mock local: nenhuma chamada sai para a rede.

const lead: LeadFormData = {
  nome: "Ana Souza",
  email: "ana@ex.com",
  telefone: "+5511911110001",
  empresa: "Pizzaria da Ana",
  segmento: "Pizzarias",
  faturamento: "50 mil até 80 mil",
};

const tracking = { utm_source: "meta", utm_medium: "cpc", utm_campaign: "home", utm_id: "123", fbclid: "abc", fbc: "fb.1.1.abc", fbp: "fb.1.2.3" };

test("food/lp: campos que o LpLeadIntakeService lê, origem da página e sem destino/categoria", () => {
  const body = buildFoodLpBody({ lead, tracking, origem: "01-lp", pageUrl: "https://assessorialpha.com/01-lp" });
  assert.deepEqual(body, {
    origem: "01-lp",
    nome: "Ana Souza",
    email: "ana@ex.com",
    telefone: "+5511911110001",
    empresa: "Pizzaria da Ana",
    segmento: "Pizzarias",
    faturamento: "50 mil até 80 mil",
    utm_source: "meta",
    utm_medium: "cpc",
    utm_campaign: "home",
    utm_id: "123",
    fbclid: "abc",
    fbc: "fb.1.1.abc",
    fbp: "fb.1.2.3",
    page_url: "https://assessorialpha.com/01-lp",
  });
  for (const k of ["destination", "lead_category", "source", "niche", "sdr_email"]) assert.ok(!(k in body), k);
});

test("food/lp: 'Até 30 mil' leva investiria e CNPJ; vazio não vai (POP sem empresa)", () => {
  const body = buildFoodLpBody({
    lead: { ...lead, empresa: "", faturamento: "Até 30 mil", investiria: "Não", cnpj: "11.222.333/0001-81" },
    tracking: {},
    origem: "alpha-home",
    pageUrl: "https://assessorialpha.com",
  });
  assert.equal(body.investiria, "Não");
  assert.equal(body.cnpj, "11.222.333/0001-81");
  assert.ok(!("empresa" in body));
  assert.ok(!("utm_source" in body));
});

test("food/lm: lead_magnet no lugar de origem, sem tipo_lead (o CRM classifica)", () => {
  const body = buildLmBody({ lead, tracking: { utm_source: "meta" }, leadMagnet: "lead-magnetic-vsl", pageUrl: "https://assessorialpha.com/lead-magnetic-vsl" });
  assert.equal(body.lead_magnet, "lead-magnetic-vsl");
  assert.equal(body.page_url, "https://assessorialpha.com/lead-magnetic-vsl");
  assert.equal(body.utm_source, "meta");
  assert.ok(!("tipo_lead" in body) && !("origem" in body));
});

test("pageUrlOf: domínio do site + rota (a home sem barra)", () => {
  assert.match(pageUrlOf("/01-lp"), /^https?:\/\/[^/]+\/01-lp$/);
  assert.doesNotMatch(pageUrlOf("/"), /\/$/);
});

// ===== Iscas e Raio-X =====

const NOW = new Date("2026-11-19T15:00:00.000Z");

const TZ = {
  isca: "isca-ficha-tecnica",
  origem_pagina: "ficha-tecnica",
  page_url: "https://assessorialpha.com/ficha-tecnica?utm_source=meta&utm_medium=cpc",
  nome: "Ana Souza",
  telefone: "+5511911110001",
  email: "ana@ex.com",
  segmento: "Pizzarias",
  faturamento: "100–150 mil",
  enviado_em: "2026-11-19T15:00:00.000Z",
  utm_id: "Leads",
  utm_source: "meta",
  utm_medium: "cpc",
  utm_campaign: "isca-ficha-tecnica",
  utm_content: "",
  utm_term: "",
};

function parsedPop(extra: Record<string, unknown> = {}) {
  const r = leadSchemaPop.safeParse({ nome: " Ana Souza ", email: "Ana@Ex.com", telefone: "+5511911110001", segmento: "Pizzarias", faturamento: "100 mil até 150 mil", ...extra });
  assert.ok(r.success);
  return r.data;
}

test("food/isca: isca, rótulos do segmento/faixa (o CRM converte pelo rótulo), UTMs e página", () => {
  const body = buildTzLead({
    slug: "ficha-tecnica",
    pageUrl: "https://assessorialpha.com/ficha-tecnica?utm_source=meta&utm_medium=cpc#formulario",
    lead: parsedPop(),
    rawTracking: { utm_source: "meta", utm_medium: "cpc", fbclid: "x", gclid: "y" },
    now: NOW,
  });
  assert.deepEqual(body, TZ);
  assert.deepEqual(Object.keys(body), [...TZ_LEAD_FIELDS]);
  assert.ok(!("whatsapp" in body));
});

test("food/isca: isca do cronograma, segmento com barra e UTMs da campanha", () => {
  const body = buildTzLead({
    slug: "cronograma-de-limpeza",
    pageUrl: "https://x/cronograma-de-limpeza",
    lead: parsedPop({ segmento: "Churrascaria steakhouse", faturamento: "600 mil até 1 milhão" }),
    rawTracking: { utm_id: "123", utm_campaign: "camp", utm_content: "ad1", utm_term: "t" },
    now: NOW,
  });
  assert.equal(body.isca, "isca-pop-higienizacao");
  assert.equal(body.segmento, "Churrascaria/steakhouse");
  assert.equal(body.faturamento, "600 mil–1 milhão");
  assert.deepEqual([body.utm_id, body.utm_campaign, body.utm_content, body.utm_term], ["123", "camp", "ad1", "t"]);
  // CNPJ e investiria não fazem parte do lead da isca.
  const comExtras = buildTzLead({ slug: "pop-delivery", pageUrl: "", lead: parsedPop({ faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81", investiria: "Sim" }), now: NOW });
  assert.ok(!("cnpj" in comExtras) && !("investiria" in comExtras));
});

test("food/raio-x: lead salvo + isca do obrigado + página; campos de fora são ignorados", () => {
  const salvo = { ...TZ, whatsapp: "(11) 91111-0001", extra: "<script>" };
  const body = buildRaioXBody({ lead: salvo, isca: "isca-ficha-tecnica", pageUrl: "https://x/raio-x-do-restaurante?isca=isca-ficha-tecnica#a" });
  const preenchidos: Record<string, string> = { ...TZ };
  delete preenchidos.utm_content;
  delete preenchidos.utm_term;
  assert.deepEqual(body, { ...preenchidos, page_url: "https://x/raio-x-do-restaurante?isca=isca-ficha-tecnica" });
  assert.ok(body && !("extra" in body) && !("whatsapp" in body));
});

test("food/raio-x: ?isca= desconhecida (utm_campaign qualquer) fica a do lead; telefone mascarado vira E.164", () => {
  const body = buildRaioXBody({ lead: { ...TZ, telefone: "(11) 91111-0001" }, isca: "campanha-black-friday", pageUrl: "" });
  assert.equal(body?.isca, "isca-ficha-tecnica");
  assert.equal(body?.telefone, "+5511911110001");
  // Sem telefone (abriu a página direto): não envia.
  assert.equal(buildRaioXBody({ lead: { nome: "x" }, isca: "", pageUrl: "" }), null);
  assert.equal(buildRaioXBody({ lead: null, isca: "", pageUrl: "" }), null);
});

// ===== Envio =====

const CRM_URL = "https://crm.mock.local/";
const CRM_KEY = "chave-falsa-de-teste";

async function withEnv<T>(fn: () => Promise<T>, env: { url?: string; key?: string } = { url: CRM_URL, key: CRM_KEY }) {
  const old = { url: process.env.CRM_API_URL, key: process.env.CRM_LEAD_INTAKE_FOOD_KEY };
  const set = (k: string, v: string | undefined) => (v === undefined ? delete process.env[k] : (process.env[k] = v));
  set("CRM_API_URL", env.url);
  set("CRM_LEAD_INTAKE_FOOD_KEY", env.key);
  const logs: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => logs.push(args.map(String).join(" "));
  try {
    return { result: await fn(), logs };
  } finally {
    console.error = originalError;
    set("CRM_API_URL", old.url);
    set("CRM_LEAD_INTAKE_FOOD_KEY", old.key);
  }
}

const semSegredos = (logs: string[]) =>
  logs.length > 0 && logs.every((l) => ![CRM_KEY, "crm.mock.local", "ana", "Ana", "5511"].some((s) => l.includes(s)));

for (const route of ["lp", "isca", "lm", "raio-x"] as const) {
  test(`envio food/${route}: URL da rota, x-api-key, corpo JSON e status do CRM`, async () => {
    let call: { url: string; init: RequestInit } | undefined;
    const fakeFetch = (async (url: string, init: RequestInit) => {
      call = { url, init };
      return Response.json({ status: "crm", crmLeadId: "123", category: "B" });
    }) as unknown as typeof fetch;
    const { result } = await withEnv(() => sendToLeadIntake(route, { nome: "Ana" }, fakeFetch));
    assert.deepEqual(result, { ok: true, httpStatus: 200, status: "crm", crmLeadId: "123" });
    assert.equal(call?.url, `https://crm.mock.local/external/lead-intake/food/${route}`);
    assert.equal(call?.init.method, "POST");
    assert.deepEqual(call?.init.headers, { "Content-Type": "application/json", "x-api-key": CRM_KEY });
    assert.equal(call?.init.body, JSON.stringify({ nome: "Ana" }));
  });
}

test("200 com 'ignored'/'growth_hub' também é recebido (não reenviar)", async () => {
  for (const status of ["ignored", "growth_hub", "growth_hub_opportunity", "crm_duplicate", "duplicate"]) {
    const fakeFetch = (async () => Response.json({ status })) as unknown as typeof fetch;
    const { result } = await withEnv(() => sendToLeadIntake("lp", {}, fakeFetch));
    assert.equal(result.ok, true, status);
  }
});

test("400 (filtro de segurança): recusado, loga código e motivos sem dados do lead", async () => {
  const fakeFetch = (async () =>
    Response.json({ message: "Envio recusado", code: "SECURITY_FILTER", reasons: ["nome: HTML"] }, { status: 400 })) as unknown as typeof fetch;
  const { result, logs } = await withEnv(() => sendToLeadIntake("lp", { nome: "Ana <b>" }, fakeFetch));
  assert.deepEqual(result, { ok: false, httpStatus: 400, rejected: true, reason: "SECURITY_FILTER" });
  assert.ok(semSegredos(logs));
  assert.match(logs[0], /400 \(SECURITY_FILTER\) \[nome: HTML\]/);
});

test("5xx, 401/403 e rede: falha que pode ser reenviada (não é 'recusado')", async () => {
  for (const status of [500, 502, 401, 403]) {
    const fakeFetch = (async () => Response.json({ message: "ana@ex.com" }, { status })) as unknown as typeof fetch;
    const { result, logs } = await withEnv(() => sendToLeadIntake("isca", {}, fakeFetch));
    assert.deepEqual(result, { ok: false, httpStatus: status, rejected: false, reason: "sem_codigo" });
    assert.ok(semSegredos(logs));
  }
  const rede = (async () => {
    throw new DOMException("timeout ana@ex.com", "TimeoutError");
  }) as unknown as typeof fetch;
  const { result, logs } = await withEnv(() => sendToLeadIntake("lp", {}, rede));
  assert.deepEqual(result, { ok: false, httpStatus: 0, rejected: false, reason: "TimeoutError" });
  assert.ok(semSegredos(logs));
});

test("sem CRM_API_URL ou CRM_LEAD_INTAKE_FOOD_KEY: não chama o CRM", async () => {
  const nunca = (() => {
    throw new Error("não deveria chamar");
  }) as unknown as typeof fetch;
  for (const env of [{ url: CRM_URL }, { key: CRM_KEY }]) {
    const { result } = await withEnv(() => sendToLeadIntake("lp", {}, nunca), env);
    assert.deepEqual(result, { ok: false, httpStatus: 0, rejected: false, reason: "crm_not_configured" });
  }
});
