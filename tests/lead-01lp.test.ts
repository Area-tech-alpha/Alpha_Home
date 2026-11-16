import { test } from "node:test";
import assert from "node:assert/strict";
import { content01lp } from "@/lib/content-01-lp";
import { parseTracking01lp, rotear01lp } from "@/lib/lead-01lp";
import { checkLeadRateLimit, type Limiter, type Limiters } from "@/lib/rate-limit";
import type { LeadFormData } from "@/lib/validation";
import {
  buildWebhook01lpPayload,
  encodeWebhookBody,
  sendLeadToWebhook01lp,
  type WebhookContext,
} from "@/lib/webhook-01lp";

const lead: LeadFormData = {
  nome: "Ana Souza",
  email: "ana@ex.com",
  telefone: "+5511911110001",
  empresa: "Pizzaria da Ana",
  segmento: "Pizzarias",
  faturamento: "100 mil até 150 mil",
};

const ctx: WebhookContext = {
  siteUrl: "https://assessorialpha.com",
  now: new Date("2026-11-16T15:30:00Z"),
};

const SECRET_URL = "https://n8n.exemplo.com/webhook/token-secreto-123";

// ===== Roteamento (regra literal do WP, pageId 3445) =====

test("roteamento: cada faixa de faturamento vai para o destino do WP", () => {
  const esperado: Record<string, string> = {
    "Até 30 mil": "obrigado-c",
    "30 mil até 50 mil": "obrigado-c",
    "50 mil até 80 mil": "obrigado-b",
    "80 mil até 100 mil": "obrigado",
    "100 mil até 150 mil": "obrigado-a",
    "150 mil até 250 mil": "obrigado-a",
    "250 mil até 400 mil": "obrigado-a",
    "400 mil até 600 mil": "obrigado-a",
    "600 mil até 1 milhão": "obrigado-a",
    "Mais de 1 milhão": "obrigado-a",
  };
  // Toda opção do form está coberta pelo teste.
  assert.deepEqual(Object.keys(esperado), [...content01lp.form.fields.faturamento.options]);
  for (const [faturamento, slug] of Object.entries(esperado)) {
    assert.equal(rotear01lp(faturamento).slug, slug, faturamento);
  }
});

test("roteamento: Até 30 mil + Não = agradecimento (desqualificado); + Sim = obrigado-c", () => {
  assert.deepEqual(rotear01lp("Até 30 mil", "Não"), { slug: "agradecimento", tipo: "desqualificado" });
  assert.deepEqual(rotear01lp("Até 30 mil", "Sim"), { slug: "obrigado-c", tipo: "c" });
  // "Não" só desqualifica em Até 30 mil.
  assert.deepEqual(rotear01lp("50 mil até 80 mil", "Não"), { slug: "obrigado-b", tipo: "b" });
});

test("roteamento: tipos a/b/c e qualificado-geral (80 a 100 mil, pendência do WP)", () => {
  assert.equal(rotear01lp("Mais de 1 milhão").tipo, "a");
  assert.equal(rotear01lp("50 mil até 80 mil").tipo, "b");
  assert.equal(rotear01lp("30 mil até 50 mil").tipo, "c");
  assert.deepEqual(rotear01lp("80 mil até 100 mil"), { slug: "obrigado", tipo: "qualificado-geral" });
});

// ===== Payload =====

test("payload: form/fields/meta no formato do Elementor, ids reais e origem", () => {
  const p = buildWebhook01lpPayload(lead, { utm_source: "metaads", fbclid: "abc" }, ctx);
  assert.deepEqual(p.form, { id: "e1b938c", name: "Formulario_Qualificacao" });
  assert.equal(p.origem, "alpha-home-01-lp");
  assert.deepEqual(Object.keys(p.fields), [
    "name",
    "email",
    "field_bb2d15f",
    "field_4169f50",
    "field_b47b91e",
    "field_13a1e79",
    "field_5cf7e87",
    "faturamento",
    "cnpj",
    "field_4e810df",
    "disposto_investir",
    "utm_source",
    "utm_campaign",
    "utm_medium",
    "utm_id",
    "utm_content",
    "utm_term",
    "fbclid",
    "gclid",
    "fbc",
    "gcl_aw",
    "creation_time",
    "debug_full_url",
    "redirect_url",
    "tipo_lead",
    "field_a8828d3",
  ]);
  assert.equal("meta" in p, false);
  assert.deepEqual(p.fields.name, {
    id: "name",
    type: "text",
    title: "Nome",
    value: "Ana Souza",
    raw_value: "Ana Souza",
    required: "1",
  });
  assert.equal(p.fields.field_bb2d15f.value, "+5511911110001");
  assert.equal(p.fields.field_4169f50.value, "Pizzaria da Ana");
  assert.equal(p.fields.field_13a1e79.value, "Pizzarias");
  assert.equal(p.fields.faturamento.value, "100 mil até 150 mil");
  assert.equal(p.fields.utm_source.value, "metaads");
  assert.equal(p.fields.fbclid.value, "abc");
  assert.equal(p.fields.gclid.value, "");
  assert.equal(p.fields.redirect_url.value, "https://assessorialpha.com/obrigado-a/");
  assert.equal(p.fields.tipo_lead.value, "a");
  assert.equal(p.fields.creation_time.value, String(Date.parse("2026-11-16T15:30:00Z") / 1000));
  assert.deepEqual(p.fields.field_a8828d3, { id: "field_a8828d3", type: "html", title: "", value: "", raw_value: "", required: "0" });
});

test("payload: Até 30 mil leva CNPJ e o valor do WP para 'investiria' (Sim=obrigado, Não=agradecimento)", () => {
  const base = { ...lead, faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81" };
  const sim = buildWebhook01lpPayload({ ...base, investiria: "Sim" }, {}, ctx);
  assert.equal(sim.fields.cnpj.value, "11.222.333/0001-81");
  assert.equal(sim.fields.disposto_investir.value, "obrigado");
  assert.equal(sim.fields.tipo_lead.value, "c");
  const nao = buildWebhook01lpPayload({ ...base, investiria: "Não" }, {}, ctx);
  assert.equal(nao.fields.disposto_investir.value, "agradecimento");
  assert.equal(nao.fields.redirect_url.value, "https://assessorialpha.com/agradecimento/");
  assert.equal(nao.fields.tipo_lead.value, "desqualificado");
});

test("corpo urlencoded na mesma ordem do montarPayloadElementor do WP", () => {
  const p = buildWebhook01lpPayload(lead, {}, ctx);
  const keys = [...encodeWebhookBody(p).keys()];
  const esperado = ["form[id]", "form[name]"];
  for (const id of Object.keys(p.fields)) {
    for (const k of ["id", "type", "title", "value", "raw_value", "required"]) esperado.push(`fields[${id}][${k}]`);
  }
  esperado.push("origem");
  assert.deepEqual(keys, esperado);
  assert.equal(keys.some((k) => k.startsWith("meta[")), false);
  const body = encodeWebhookBody(p);
  assert.equal(body.get("form[id]"), "e1b938c");
  assert.equal(body.get("form[name]"), "Formulario_Qualificacao");
  assert.equal(body.get("fields[email][value]"), "ana@ex.com");
  assert.equal(body.get("fields[email][raw_value]"), "ana@ex.com");
  assert.equal(body.get("fields[email][required]"), "1");
  assert.equal(body.get("origem"), "alpha-home-01-lp");
});

test("tracking: só chaves conhecidas, descarta lixo e URL inválida", () => {
  assert.deepEqual(
    parseTracking01lp({
      utm_source: " google ",
      utm_id: "123",
      gcl_aw: "GCL.1.x",
      outro: "x",
      utm_medium: "",
      utm_term: "a".repeat(600),
      debug_full_url: "javascript:alert(1)",
    }),
    { utm_source: "google", utm_id: "123", gcl_aw: "GCL.1.x" }
  );
  assert.deepEqual(parseTracking01lp({ debug_full_url: "https://assessorialpha.com/01-lp?utm_source=x" }), {
    debug_full_url: "https://assessorialpha.com/01-lp?utm_source=x",
  });
  assert.deepEqual(parseTracking01lp(null), {});
});

// ===== Envio =====

function captureLogs() {
  const lines: string[] = [];
  const orig = { error: console.error, warn: console.warn, log: console.log };
  for (const k of ["error", "warn", "log"] as const) console[k] = (...a: unknown[]) => lines.push(a.map(String).join(" "));
  return { lines, restore: () => Object.assign(console, orig) };
}

test("envio: POST urlencoded para a URL da env, com timeout", async () => {
  let seen: { url: string; init: RequestInit } | null = null;
  const fetchMock = (async (url: string, init: RequestInit) => {
    seen = { url, init };
    return new Response("ok", { status: 200 });
  }) as unknown as typeof fetch;
  const res = await sendLeadToWebhook01lp(buildWebhook01lpPayload(lead, {}, ctx), fetchMock, SECRET_URL);
  assert.deepEqual(res, { ok: true, httpStatus: 200 });
  assert.ok(seen);
  const s = seen as { url: string; init: RequestInit };
  assert.equal(s.url, SECRET_URL);
  assert.equal(s.init.method, "POST");
  assert.equal((s.init.headers as Record<string, string>)["Content-Type"], "application/x-www-form-urlencoded");
  assert.ok(s.init.signal instanceof AbortSignal);
  assert.equal(new URLSearchParams(String(s.init.body)).get("fields[name][value]"), "Ana Souza");
});

test("envio: falha HTTP e de rede não vazam URL nem dados do lead no log", async () => {
  const log = captureLogs();
  try {
    const http500 = (async () => new Response(`erro ${lead.email}`, { status: 500 })) as unknown as typeof fetch;
    assert.deepEqual(await sendLeadToWebhook01lp(buildWebhook01lpPayload(lead, {}, ctx), http500, SECRET_URL), {
      ok: false,
      httpStatus: 500,
      reason: "http_500",
    });
    const timeout = (async () => {
      throw new DOMException("timeout", "TimeoutError");
    }) as unknown as typeof fetch;
    assert.deepEqual(await sendLeadToWebhook01lp(buildWebhook01lpPayload(lead, {}, ctx), timeout, SECRET_URL), {
      ok: false,
      httpStatus: 0,
      reason: "TimeoutError",
    });
  } finally {
    log.restore();
  }
  assert.ok(log.lines.length >= 2);
  for (const line of log.lines) {
    for (const secret of ["n8n.exemplo.com", "token-secreto", "ana@ex.com", "Ana Souza", "5511911110001", "200.1.1.1"]) {
      assert.ok(!line.includes(secret), `log vazou "${secret}": ${line}`);
    }
  }
});

test("envio: env ausente → não chama fetch e falha como não configurado", async () => {
  let called = false;
  const fetchMock = (async () => {
    called = true;
    return new Response("ok");
  }) as unknown as typeof fetch;
  const log = captureLogs();
  try {
    const res = await sendLeadToWebhook01lp(buildWebhook01lpPayload(lead, {}, ctx), fetchMock, undefined);
    assert.deepEqual(res, { ok: false, httpStatus: 0, reason: "webhook_not_configured" });
  } finally {
    log.restore();
  }
  assert.equal(called, false);
});

// ===== Rate limit com prefixo próprio =====

test("rate limit da 01-lp usa o prefixo 01lp: e não divide cota com a home", async () => {
  const seen: string[] = [];
  const counts = new Map<string, number>();
  const make = (max: number): Limiter => ({
    async limit(key) {
      seen.push(key);
      const n = (counts.get(key) ?? 0) + 1;
      counts.set(key, n);
      return { success: n <= max, reset: 60_000 };
    },
    async resetUsedTokens(key) {
      counts.delete(key);
    },
  });
  const limiters: Limiters = { email: make(1), telefone: make(1), ip: make(3) };
  const input = { email: "ana@ex.com", telefone: "+5511911110001", ip: "200.1.1.1" };

  assert.deepEqual(await checkLeadRateLimit({ ...input, scope: "home" }, limiters, 0), { ok: true });
  assert.deepEqual(await checkLeadRateLimit({ ...input, scope: "01lp" }, limiters, 0), { ok: true });
  assert.match(seen[3], /^01lp:email:[0-9a-f]{64}$/);
  assert.match(seen[4], /^01lp:telefone:[0-9a-f]{64}$/);
  assert.match(seen[5], /^01lp:ip:[0-9a-f]{64}$/);
  assert.equal((await checkLeadRateLimit({ ...input, scope: "01lp" }, limiters, 0)).ok, false);
});
