import { test } from "node:test";
import assert from "node:assert/strict";
import { rotear01lp } from "@/lib/lead-01lp";
import { leadSchema01lp } from "@/lib/validation-01lp";

// O envio da /01-lp ao CRM (payload, rate limit, falhas) é coberto em
// tests/lead-intake.test.ts, junto com as outras LPs. Aqui: validação e a rota
// pós-envio, que continua a da 00-lp do WP.

const lead = {
  nome: "Ana Souza",
  email: "ana@ex.com",
  telefone: "+5511911110001",
  empresa: "Pizzaria da Ana",
  segmento: "Pizzarias",
  faturamento: "100 mil até 150 mil",
};

test("validação da /01-lp: lead completo passa; 'Até 30 mil' exige CNPJ válido e 'investiria'", () => {
  assert.equal(leadSchema01lp.safeParse(lead).success, true);
  const ate30 = leadSchema01lp.safeParse({ ...lead, faturamento: "Até 30 mil" });
  assert.deepEqual(ate30.error?.issues.map((i) => i.path[0]), ["cnpj", "investiria"]);
  assert.equal(leadSchema01lp.safeParse({ ...lead, faturamento: "Até 30 mil", cnpj: "11.222.333/0001-81", investiria: "Sim" }).success, true);
});

test("roteamento: cada faixa vai para o destino do WP (80-100 mil navega para obrigado-a)", () => {
  const esperado: Record<string, string> = {
    "Até 30 mil": "obrigado-c",
    "30 mil até 50 mil": "obrigado-c",
    "50 mil até 80 mil": "obrigado-b",
    "80 mil até 100 mil": "obrigado-a",
    "100 mil até 150 mil": "obrigado-a",
    "150 mil até 250 mil": "obrigado-a",
    "250 mil até 400 mil": "obrigado-a",
    "400 mil até 600 mil": "obrigado-a",
    "600 mil até 1 milhão": "obrigado-a",
    "Mais de 1 milhão": "obrigado-a",
  };
  for (const [faixa, slug] of Object.entries(esperado)) {
    assert.equal(rotear01lp(faixa, faixa === "Até 30 mil" ? "Sim" : undefined).slug, slug, faixa);
  }
});

test("roteamento: Até 30 mil + Não = agradecimento; + Sim = obrigado-c", () => {
  assert.equal(rotear01lp("Até 30 mil", "Não").slug, "agradecimento");
  assert.equal(rotear01lp("Até 30 mil", "Sim").slug, "obrigado-c");
});

test("roteamento: nenhuma faixa navega para /obrigado (página da home)", () => {
  for (const faixa of ["Até 30 mil", "80 mil até 100 mil", "Mais de 1 milhão", "faixa que não existe"]) {
    assert.notEqual(rotear01lp(faixa, "Sim").slug, "obrigado");
  }
});
