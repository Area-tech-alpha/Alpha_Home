import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildRaioXBody, buildTzLead, postWebhook } from "@/lib/lead-webhook";
import { TZ_LEAD_FIELDS } from "@/lib/lead-webhook-constants";
import { leadSchemaPop } from "@/lib/validation-pop";

// Envio extra ao n8n: o body tem que ser IGUAL ao que o script do WP monta
// (_assets-wordpress/<slug>/scripts.js.txt), senão o fluxo do n8n quebra.
// Tudo com mock local: nenhuma chamada sai para a rede, nenhuma URL real aqui.

const URL_FALSA = "http://n8n.mock.local/hook";
const NOW = new Date("2026-11-19T15:00:00.000Z");

// O que o script do WP envia para: nome "Ana Souza", WhatsApp digitado "11911110001",
// e-mail "Ana@Ex.com", botões "Pizzarias" e "100–150 mil", na /ficha-tecnica com
// ?utm_source=meta&utm_medium=cpc (sem utm_campaign e sem utm_id).
const WP_BODY = {
  isca: "isca-ficha-tecnica",
  origem_pagina: "ficha-tecnica",
  page_url: "https://assessorialpha.com/ficha-tecnica?utm_source=meta&utm_medium=cpc",
  nome: "Ana Souza",
  telefone: "+5511911110001",
  whatsapp: "(11) 91111-0001",
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

function parsed(extra: Record<string, unknown> = {}) {
  const r = leadSchemaPop.safeParse({ nome: " Ana Souza ", email: "Ana@Ex.com", telefone: "+5511911110001", segmento: "Pizzarias", faturamento: "100 mil até 150 mil", ...extra });
  assert.ok(r.success);
  return r.data;
}

test("n8n (leads-iscas): body idêntico ao do WP, mesma ordem de campos", () => {
  const body = buildTzLead({
    slug: "ficha-tecnica",
    pageUrl: "https://assessorialpha.com/ficha-tecnica?utm_source=meta&utm_medium=cpc#formulario",
    lead: parsed(),
    rawTracking: { utm_source: "meta", utm_medium: "cpc", fbclid: "x", gclid: "y" },
    now: NOW,
  });
  assert.deepEqual(body, WP_BODY);
  assert.deepEqual(Object.keys(body), [...TZ_LEAD_FIELDS]);
  assert.equal(JSON.stringify(body), JSON.stringify(WP_BODY));
});

test("n8n: rótulos do WP para segmento/faixa, UTMs da campanha e isca do cronograma", () => {
  const body = buildTzLead({
    slug: "cronograma-de-limpeza",
    pageUrl: "https://x/cronograma-de-limpeza",
    lead: parsed({ segmento: "Churrascaria steakhouse", faturamento: "600 mil até 1 milhão" }),
    rawTracking: { utm_id: "123", utm_campaign: "camp", utm_content: "ad1", utm_term: "t" },
    now: NOW,
  });
  assert.equal(body.isca, "isca-pop-higienizacao");
  assert.equal(body.origem_pagina, "cronograma-de-limpeza");
  assert.equal(body.segmento, "Churrascaria/steakhouse");
  assert.equal(body.faturamento, "600 mil–1 milhão");
  assert.deepEqual([body.utm_id, body.utm_campaign, body.utm_content, body.utm_term], ["123", "camp", "ad1", "t"]);
  // CNPJ e investiria não existem no form do WP: não vão ao n8n.
  const comExtras = buildTzLead({ slug: "pop-delivery", pageUrl: "", lead: parsed({ faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81", investiria: "Sim" }), now: NOW });
  assert.ok(!("cnpj" in comExtras) && !("investiria" in comExtras));
  assert.equal(comExtras.faturamento, "Até 30 mil");
});

test("n8n (leads-raio-x): aceite = lead salvo + tag, isca, utm_campaign, aceitou_em, page_url (como o WP)", () => {
  const lead = { ...WP_BODY, extra: "<script>", __proto__: { x: 1 } };
  const body = buildRaioXBody({ lead, isca: "isca-ficha-tecnica", pageUrl: "https://x/raio-x-do-restaurante?isca=isca-ficha-tecnica#a", now: NOW });
  assert.deepEqual(body, {
    ...WP_BODY,
    page_url: "https://x/raio-x-do-restaurante?isca=isca-ficha-tecnica",
    tag: "aceitou-raio-x",
    aceitou_em: "2026-11-19T15:00:00.000Z",
  });
  assert.ok(body && !("extra" in body));
  // Sem telefone (abriu a página direto): não envia.
  assert.equal(buildRaioXBody({ lead: { nome: "x" }, isca: "", pageUrl: "", now: NOW }), null);
  assert.equal(buildRaioXBody({ lead: null, isca: "", pageUrl: "" }), null);
});

function capturar() {
  const lines: string[] = [];
  const orig = { error: console.error, warn: console.warn };
  console.error = (...a: unknown[]) => lines.push(a.map(String).join(" "));
  console.warn = console.error;
  return { lines, restore: () => Object.assign(console, orig) };
}

test("postWebhook: POST JSON com o body exato para a URL da env (mock)", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response("ok", { status: 200 });
  }) as unknown as typeof fetch;
  assert.deepEqual(await postWebhook("iscas", WP_BODY, fetchImpl, URL_FALSA), { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, URL_FALSA);
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(calls[0].init.headers, { "Content-Type": "application/json" });
  assert.equal(calls[0].init.body, JSON.stringify(WP_BODY));
});

test("postWebhook: erro HTTP, falha de rede ou env vazia não lançam e o log não tem a URL nem dados", async () => {
  const log = capturar();
  try {
    const erro500 = (async () => new Response("x", { status: 500 })) as unknown as typeof fetch;
    const rede = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    assert.deepEqual(await postWebhook("iscas", WP_BODY, erro500, URL_FALSA), { ok: false });
    assert.deepEqual(await postWebhook("raio-x", WP_BODY, rede, URL_FALSA), { ok: false });
    let chamou = false;
    const nunca = (async () => {
      chamou = true;
      return new Response();
    }) as unknown as typeof fetch;
    assert.deepEqual(await postWebhook("iscas", WP_BODY, nunca, ""), { ok: false });
    assert.equal(chamou, false);
  } finally {
    log.restore();
  }
  const all = log.lines.join("\n");
  assert.ok(log.lines.length >= 3);
  for (const s of [URL_FALSA, "n8n.mock", "ana@ex.com", "Ana Souza", "91111"]) assert.ok(!all.includes(s), `log vazou: ${s}`);
});

test("server action: webhook só depois do CRM ok e fora do caminho do redirect (after)", () => {
  const src = readFileSync(path.join(process.cwd(), "app/actions/submit-lead-pop.ts"), "utf8");
  const crm = src.indexOf("await intakeLead(");
  const falhou = src.indexOf("if (!result.success) return result;");
  const hook = src.indexOf('after(() => postWebhook("iscas"');
  assert.ok(crm > 0 && falhou > crm && hook > falhou, "ordem: CRM → checa sucesso → webhook em after()");
});
