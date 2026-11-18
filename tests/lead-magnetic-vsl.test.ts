import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { leadSchemaLeadMagneticVsl } from "@/lib/validation-pizzaria";
import { FATURAMENTOS_LMVSL, SEGMENTOS_LMVSL } from "@/lib/content-lead-magnetic-vsl";

const lead = {
  nome: "Ana Souza",
  email: "ana@ex.com",
  telefone: "+5511911110001",
  empresa: "Restaurante da Ana",
  segmento: "Restaurante Japonês / asiáticos",
  faturamento: "100 mil até 150 mil",
};

test("lead magnetic VSL: usa segmentos próprios e todas as 10 faixas", () => {
  assert.equal(SEGMENTOS_LMVSL.length, 7);
  assert.equal(FATURAMENTOS_LMVSL.length, 10);
  assert.equal(leadSchemaLeadMagneticVsl.safeParse(lead).success, true);
  assert.equal(leadSchemaLeadMagneticVsl.safeParse({ ...lead, segmento: "Açaí / sorveteria" }).success, false);
  assert.equal(leadSchemaLeadMagneticVsl.safeParse({ ...lead, faturamento: "falsa" }).success, false);
});

test("lead magnetic VSL: não exige CNPJ nem investiria em nenhuma faixa", () => {
  for (const faturamento of FATURAMENTOS_LMVSL) {
    assert.equal(
      leadSchemaLeadMagneticVsl.safeParse({ ...lead, faturamento }).success,
      true,
      faturamento
    );
  }
});

test("lead magnetic VSL: obrigado mantém 150 s e não envia webhook", () => {
  const src = readFileSync(path.join(process.cwd(), "components/lead-magnetic-vsl/obrigado.tsx"), "utf8");
  const content = readFileSync(path.join(process.cwd(), "lib/content-lead-magnetic-vsl.ts"), "utf8");
  assert.match(src, /150_000/);
  assert.match(content, /Entraremos em contato em breve!/);
  assert.doesNotMatch(src, /fetch\(|webhook|n8n/);
});
