import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

// Regras de SEO das LPs (domínio final): as LPs indexáveis entram no sitemap; as
// páginas de obrigado ficam fora do sitemap, com disallow no robots (e noindex).
// A LP de bastidores é noindex,nofollow como no WP: fora do sitemap, mas SEM
// disallow, para o Google conseguir ler o noindex.

const LPS_INDEXAVEIS = ["/01-lp", "/alphas-pizzaria", "/resultado-alphas-pizzaria"];
const BASTIDORES = "/lead-magnetic-bastidores-alphas-pizzaria";
const OBRIGADOS = [
  "/obrigado",
  "/obrigado-a",
  "/obrigado-b",
  "/obrigado-c",
  "/agradecimento",
  "/alphas-pizzaria/obrigado",
  "/obrigado-lm-bastidores-alphas-pizzaria",
];

function disallow() {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
  return ([] as string[]).concat(rules.disallow ?? []);
}

test("sitemap: as LPs indexáveis entram; bastidores e páginas de obrigado não", () => {
  const urls = sitemap().map((e) => new URL(e.url).pathname);
  for (const lp of LPS_INDEXAVEIS) assert.ok(urls.includes(lp), `sitemap sem ${lp}`);
  assert.ok(!urls.includes(BASTIDORES), "bastidores não pode estar no sitemap");
  for (const o of OBRIGADOS) assert.ok(!urls.includes(o), `sitemap com ${o}`);
});

test("robots: toda página de obrigado tem disallow; as LPs (inclusive bastidores) não", () => {
  const d = disallow();
  for (const o of OBRIGADOS) assert.ok(d.includes(o), `robots sem disallow de ${o}`);
  for (const lp of [...LPS_INDEXAVEIS, BASTIDORES]) assert.ok(!d.includes(lp), `robots bloqueando ${lp}`);
});

test("bastidores: metadata com noindex,nofollow fixo (igual ao WP), sem depender do domínio", () => {
  // A página importa CSS e não roda no node:test; confere o código-fonte.
  const src = readFileSync(path.join(process.cwd(), "app/lead-magnetic-bastidores-alphas-pizzaria/page.tsx"), "utf8");
  assert.match(src, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
  assert.ok(!src.includes("IS_PRODUCTION_SITE"));
});
