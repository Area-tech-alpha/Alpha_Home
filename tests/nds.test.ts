import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildFoodLpBody, pageUrlOf } from "@/lib/crm";
import { foodLp, intakeLead, type IntakeErrors } from "@/lib/lead-intake";
import { rotear01lp } from "@/lib/lead-01lp";
import type { Limiter, Limiters } from "@/lib/rate-limit";
import { contentNds } from "@/lib/content-nao-dependa-de-sorte";
import { parseTracking } from "@/lib/validation";
import { leadSchema01lp } from "@/lib/validation-01lp";

// /nao-dependa-de-sorte: o lead vai UMA vez para food/lp (antes ia também ao n8n
// "wordpress-geral"), com rate limit próprio. CRM e Redis com mock local: nenhuma
// chamada sai para a rede.

const leadBase = {
  nome: " Ana Souza ",
  email: "Ana@Ex.com",
  telefone: "+5511911110001",
  empresa: "Pizzaria da Ana",
  segmento: "Churrascaria steakhouse",
};

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

test("CRM: 1 envio a food/lp com origem nao-dependa-de-sorte; rate limit com escopo próprio", async () => {
  const old = { url: process.env.CRM_API_URL, key: process.env.CRM_LEAD_INTAKE_FOOD_KEY };
  process.env.CRM_API_URL = "http://crm.mock.local";
  process.env.CRM_LEAD_INTAKE_FOOD_KEY = "chave-falsa";
  try {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchImpl = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return Response.json({ status: "growth_hub", category: "A" });
    }) as unknown as typeof fetch;
    const { seen, limiters } = fakeLimiters();
    const data = { ...leadBase, faturamento: "80 mil até 100 mil" };
    const tracking = { utm_source: "meta", utm_medium: "cpc", utm_campaign: "camp", fbclid: "abc" };
    const args = {
      data,
      rawTracking: tracking,
      ip: "8.8.8.8",
      schema: leadSchema01lp,
      scope: "nao-dependa-de-sorte" as const,
      errors,
      crm: foodLp("nao-dependa-de-sorte", "/nao-dependa-de-sorte"),
      limiters,
      fetchImpl,
    };
    assert.equal((await intakeLead(args)).success, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "http://crm.mock.local/external/lead-intake/food/lp");
    assert.equal((calls[0].init.headers as Record<string, string>)["x-api-key"], "chave-falsa");
    const body = JSON.parse(String(calls[0].init.body));
    assert.deepEqual(
      body,
      buildFoodLpBody({ lead: leadSchema01lp.parse(data), tracking: parseTracking(tracking), origem: "nao-dependa-de-sorte", pageUrl: pageUrlOf("/nao-dependa-de-sorte") })
    );
    // Sem UTM inventada pelo referrer ("direto"/"nenhum"): isso faria o CRM tratar o lead como pago.
    assert.equal(body.utm_source, "meta");
    assert.equal(body.segmento, "Churrascaria steakhouse");
    assert.ok(seen.some((k) => /^nao-dependa-de-sorte:email:[0-9a-f]{64}$/.test(k)));
    assert.equal((await intakeLead(args)).success, false);
    assert.equal(calls.length, 1);
  } finally {
    for (const [k, v] of [["CRM_API_URL", old.url], ["CRM_LEAD_INTAKE_FOOD_KEY", old.key]] as const) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
});

test("server action: só o CRM (sem n8n), navegação pela régua da /01-lp", () => {
  const src = readFileSync(path.join(process.cwd(), "app/actions/submit-lead-nds.ts"), "utf8");
  assert.match(src, /await intakeLead\(/);
  assert.match(src, /scope: "nao-dependa-de-sorte"/);
  assert.match(src, /foodLp\("nao-dependa-de-sorte"/);
  assert.match(src, /rotear01lp\(/);
  assert.doesNotMatch(src, /postWebhook|after\(|LEAD_WEBHOOK/);
  // A navegação segue a /01-lp: 80–100 vai para /obrigado-a; "Até 30 mil" + Não, /agradecimento.
  assert.equal(rotear01lp("80 mil até 100 mil").slug, "obrigado-a");
  assert.equal(rotear01lp("Até 30 mil", "Não").slug, "agradecimento");
});

test("time só com Athos e Pedro; fotos proibidas fora do código e do public", () => {
  assert.deepEqual(contentNds.historia.time.map((p) => p.nome), ["Athos Vilarins", "Pedro Dias"]);
  for (const f of ["lib/content-nao-dependa-de-sorte.ts", "components/nao-dependa-de-sorte/pagina.tsx"]) {
    const src = readFileSync(path.join(process.cwd(), f), "utf8");
    assert.doesNotMatch(src, /IMG_9194|IMG_1855|Gustavo Oliveira|Samuel Lacerda/, f);
  }
});
