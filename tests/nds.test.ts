import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildCrmLeadPayload } from "@/lib/crm";
import { intakeLead, type IntakeErrors } from "@/lib/lead-intake";
import { rotear01lp } from "@/lib/lead-01lp";
import { postWebhook } from "@/lib/lead-webhook";
import { buildWpGeralBody, origemOrganica, qualificacaoWp, telefoneWp } from "@/lib/lead-webhook-wp-geral";
import type { Limiter, Limiters } from "@/lib/rate-limit";
import { contentNds } from "@/lib/content-nao-dependa-de-sorte";
import { parseTracking } from "@/lib/validation";
import { leadSchema01lp } from "@/lib/validation-01lp";

// /nao-dependa-de-sorte: body do n8n "wordpress-geral" idêntico ao do WP (capturado
// no form original com o webhook interceptado, 19/11/2026), CRM e rate limit com
// mock local. Nenhuma chamada sai para a rede; nenhuma URL real aqui.

const NOW = new Date("2026-11-19T22:22:43.481Z");
const URL_FALSA = "http://n8n.mock.local/hook";

const leadBase = {
  nome: " Ana Souza ",
  email: "Ana@Ex.com",
  telefone: "+5511911110001",
  empresa: "Pizzaria da Ana",
  segmento: "Churrascaria steakhouse",
};

// Caso 1 do WP: faixa 80–100, com UTMs da campanha na URL.
const WP_80_100 = {
  nome: "Ana Souza",
  email: "Ana@Ex.com",
  telefone: "+55 (11) 91111-0001",
  empresa: "Pizzaria da Ana",
  segmento: "churrascaria",
  faturamento: "80 mil até 100 mil",
  disposto_investir: "",
  cnpj: "",
  tipo_lead: "qualificado-geral",
  redirect_url: "https://assessorialpha.com/obrigado/",
  utm_source: "meta",
  utm_medium: "cpc",
  utm_campaign: "camp",
  utm_term: "",
  utm_content: "",
  utm_id: "",
  gclid: "",
  fbclid: "abc",
  fbc: "",
  gcl_aw: "",
  page_url: "https://assessorialpha.com/nao-dependa-de-sorte/?utm_source=meta&utm_medium=cpc&utm_campaign=camp&fbclid=abc",
  referrer: "https://assessorialpha.com/nao-dependa-de-sorte/?utm_source=meta&utm_medium=cpc&utm_campaign=camp&fbclid=abc",
  submitted_at: "2026-11-19T22:22:43.481Z",
};

function parsed(extra: Record<string, unknown>) {
  const r = leadSchema01lp.safeParse({ ...leadBase, ...extra });
  assert.ok(r.success, JSON.stringify(extra));
  return r.data;
}

test("n8n wordpress-geral: body idêntico ao do WP (80–100 vai como qualificado-geral e .../obrigado/)", () => {
  const body = buildWpGeralBody({
    lead: parsed({ faturamento: "80 mil até 100 mil" }),
    ctx: { pageUrl: WP_80_100.page_url, referrer: WP_80_100.referrer, utms: { utm_source: "meta", utm_medium: "cpc", utm_campaign: "camp", fbclid: "abc" } },
    now: NOW,
  });
  assert.equal(JSON.stringify(body), JSON.stringify(WP_80_100));
  // A navegação daqui segue a /01-lp: 80–100 vai para /obrigado-a.
  assert.equal(rotear01lp("80 mil até 100 mil").slug, "obrigado-a");
});

test("n8n wordpress-geral: 'Até 30 mil' + Não = desqualificado, CNPJ com máscara, origem direta sem UTM", () => {
  const body = buildWpGeralBody({
    lead: parsed({ faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81", investiria: "Não" }),
    ctx: { pageUrl: "https://assessorialpha.com/nao-dependa-de-sorte/", referrer: "https://assessorialpha.com/nao-dependa-de-sorte/", utms: {} },
    now: NOW,
  });
  assert.deepEqual(
    [body.disposto_investir, body.cnpj, body.tipo_lead, body.redirect_url, body.utm_source, body.utm_medium],
    ["agradecimento", "11.222.333/0001-81", "desqualificado", "https://assessorialpha.com/agradecimento/", "direto", "nenhum"]
  );
  assert.equal(rotear01lp("Até 30 mil", "Não").slug, "agradecimento");
});

test("régua do WP: faixas A, B, C e 'Até 30 mil' + Sim", () => {
  assert.deepEqual(qualificacaoWp("100 mil até 150 mil", ""), { slug: "obrigado-a", tipo: "a", url: "https://assessorialpha.com/obrigado-a/" });
  assert.equal(qualificacaoWp("50 mil até 80 mil", "").tipo, "b");
  assert.equal(qualificacaoWp("30 mil até 50 mil", "").tipo, "c");
  assert.equal(qualificacaoWp("Até 30 mil", "obrigado").slug, "obrigado-c");
});

test("telefone e segmento no formato do WP", () => {
  assert.equal(telefoneWp("+5511911110001"), "+55 (11) 91111-0001");
  assert.equal(telefoneWp("+551134567890"), "+55 (11) 34567-890");
  assert.equal(telefoneWp("+351912345678"), "+351 912345678");
  const segs: [string, string][] = [
    ["Pizzarias", "pizzarias"], ["Restaurante comida brasileira", "comida-brasileira"], ["Restaurante massas italiano", "massas-italiano"], ["Açaí / sorveteria", "acai-sorveteria"], ["Outros", "outros"],
  ];
  for (const [label, slug] of segs) assert.equal(buildWpGeralBody({ lead: parsed({ segmento: label, faturamento: "50 mil até 80 mil" }), now: NOW }).segmento, slug);
});

test("origem sem UTM pelo referrer (classificarOrigemOrganica do WP)", () => {
  assert.deepEqual(origemOrganica("", "x.com.br"), { utm_source: "direto", utm_medium: "nenhum" });
  assert.deepEqual(origemOrganica("https://www.google.com/search?q=a", "site.com"), { utm_source: "google", utm_medium: "organico" });
  assert.deepEqual(origemOrganica("https://l.instagram.com/", "site.com"), { utm_source: "l", utm_medium: "organico" });
  assert.deepEqual(origemOrganica("https://blog.exemplo.com/p", "site.com"), { utm_source: "blog.exemplo.com", utm_medium: "referral" });
  assert.deepEqual(origemOrganica("https://site.com/a", "site.com"), { utm_source: "direto", utm_medium: "nenhum" });
});

// ===== CRM e rate limit (mock) =====

const errors: IntakeErrors = { validation: "Dados inválidos.", rateLimited: "Tente em {min} min.", crm: "Não conseguimos enviar agora." };

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

test("CRM: 1 envio com o payload da home; rate limit com escopo nao-dependa-de-sorte", async () => {
  const old = { url: process.env.CRM_API_URL, key: process.env.CRM_EXTERNAL_LEADS_API_KEY };
  process.env.CRM_API_URL = "http://crm.mock.local";
  process.env.CRM_EXTERNAL_LEADS_API_KEY = "chave-falsa";
  try {
    const calls: RequestInit[] = [];
    const fetchImpl = (async (_u: string, init: RequestInit) => {
      calls.push(init);
      return Response.json({ crmLeadId: "x" }, { status: 201 });
    }) as unknown as typeof fetch;
    const { seen, limiters } = fakeLimiters();
    const data = { ...leadBase, faturamento: "100 mil até 150 mil" };
    const tracking = { utm_source: "meta", fbclid: "abc" };
    const args = { data, rawTracking: tracking, ip: "8.8.8.8", schema: leadSchema01lp, scope: "nao-dependa-de-sorte" as const, errors, limiters, fetchImpl };
    assert.equal((await intakeLead(args)).success, true);
    assert.equal(calls.length, 1);
    assert.deepEqual(JSON.parse(String(calls[0].body)), JSON.parse(JSON.stringify(buildCrmLeadPayload(leadSchema01lp.parse(data), parseTracking(tracking), undefined))));
    assert.ok(seen.some((k) => /^nao-dependa-de-sorte:email:[0-9a-f]{64}$/.test(k)));
    assert.equal((await intakeLead(args)).success, false);
    assert.equal(calls.length, 1);
  } finally {
    for (const [k, v] of [["CRM_API_URL", old.url], ["CRM_EXTERNAL_LEADS_API_KEY", old.key]] as const) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
});

test("postWebhook wordpress-geral: usa a env própria e manda o body exato (mock)", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response("ok");
  }) as unknown as typeof fetch;
  const old = process.env.LEAD_WEBHOOK_URL_WORDPRESS_GERAL;
  process.env.LEAD_WEBHOOK_URL_WORDPRESS_GERAL = URL_FALSA;
  try {
    assert.deepEqual(await postWebhook("wordpress-geral", WP_80_100, fetchImpl), { ok: true });
  } finally {
    if (old === undefined) delete process.env.LEAD_WEBHOOK_URL_WORDPRESS_GERAL;
    else process.env.LEAD_WEBHOOK_URL_WORDPRESS_GERAL = old;
  }
  assert.equal(calls[0].url, URL_FALSA);
  assert.equal(calls[0].init.body, JSON.stringify(WP_80_100));
});

test("server action: CRM primeiro; webhook em after() só depois do CRM ok; navegação pela régua da /01-lp", () => {
  const src = readFileSync(path.join(process.cwd(), "app/actions/submit-lead-nds.ts"), "utf8");
  const crm = src.indexOf("await intakeLead(");
  const ok = src.indexOf("if (!result.success) return result;");
  const hook = src.indexOf('after(() => postWebhook("wordpress-geral"');
  assert.ok(crm > 0 && ok > crm && hook > ok);
  assert.match(src, /scope: "nao-dependa-de-sorte"/);
  assert.match(src, /rotear01lp\(/);
});

test("time só com Athos e Pedro; fotos proibidas fora do código e do public", () => {
  assert.deepEqual(contentNds.historia.time.map((p) => p.nome), ["Athos Vilarins", "Pedro Dias"]);
  for (const f of ["lib/content-nao-dependa-de-sorte.ts", "components/nao-dependa-de-sorte/pagina.tsx"]) {
    const src = readFileSync(path.join(process.cwd(), f), "utf8");
    assert.doesNotMatch(src, /IMG_9194|IMG_1855|Gustavo Oliveira|Samuel Lacerda/, f);
  }
});
