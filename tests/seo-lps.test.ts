import { test } from "node:test";
import assert from "node:assert/strict";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

// Regras de SEO das LPs (domínio final): as LPs entram no sitemap; as páginas de
// obrigado ficam fora do sitemap, com disallow no robots (e noindex nas páginas).

const LPS = ["/01-lp", "/alphas-pizzaria", "/resultado-alphas-pizzaria", "/lead-magnetic-bastidores-alphas-pizzaria"];
const OBRIGADOS = [
  "/obrigado",
  "/obrigado-a",
  "/obrigado-b",
  "/obrigado-c",
  "/agradecimento",
  "/alphas-pizzaria/obrigado",
  "/obrigado-lm-bastidores-alphas-pizzaria",
];

test("sitemap: as LPs entram e nenhuma página de obrigado aparece", () => {
  const urls = sitemap().map((e) => new URL(e.url).pathname);
  for (const lp of LPS) assert.ok(urls.includes(lp), `sitemap sem ${lp}`);
  for (const o of OBRIGADOS) assert.ok(!urls.includes(o), `sitemap com ${o}`);
});

test("robots: toda página de obrigado tem disallow e as LPs seguem permitidas", () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
  const disallow = ([] as string[]).concat(rules.disallow ?? []);
  for (const o of OBRIGADOS) assert.ok(disallow.includes(o), `robots sem disallow de ${o}`);
  for (const lp of LPS) assert.ok(!disallow.includes(lp), `robots bloqueando ${lp}`);
});
