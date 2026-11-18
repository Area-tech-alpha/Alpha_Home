import { test } from "node:test";
import assert from "node:assert/strict";
import { contentBastidores, BASTIDORES_OBRIGADO_PATH, BASTIDORES_PATH } from "@/lib/content-bastidores-pizzaria";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { contentResultado } from "@/lib/content-resultado-pizzaria";
import { leadSchemaPizzaria, type LeadFormDataPizzaria } from "@/lib/validation-pizzaria";

// O envio ao CRM, o rate limit por escopo e as falhas das LPs da pizzaria são
// cobertos em tests/lead-intake.test.ts. Aqui: validação e conteúdo.

const lead: LeadFormDataPizzaria = {
  nome: "Ana Souza",
  email: "ana@ex.com",
  telefone: "+5511911110001",
  empresa: "Pizzaria da Ana",
  segmento: "Pizzarias",
  faturamento: "100 mil até 150 mil",
};
const CNPJ_VALIDO = "11.222.333/0001-81";

test("validação: lead completo passa", () => {
  assert.equal(leadSchemaPizzaria.safeParse(lead).success, true);
});

test("validação: telefone inválido usa a mensagem do WP", () => {
  const r = leadSchemaPizzaria.safeParse({ ...lead, telefone: "+55119" });
  assert.equal(r.success, false);
  assert.equal(r.error?.issues[0].message, "Telefone inválido, confira o número.");
});

test("validação: segmento e faturamento só aceitam as opções do form (os mesmos rótulos da home)", () => {
  assert.equal(leadSchemaPizzaria.safeParse({ ...lead, segmento: "pizzarias" }).success, false);
  assert.equal(leadSchemaPizzaria.safeParse({ ...lead, segmento: "Outros" }).success, true);
  assert.equal(leadSchemaPizzaria.safeParse({ ...lead, faturamento: "ate-30" }).success, false);
  assert.equal(contentPizzaria.form.fields.segmento.options.length, 12);
  assert.equal(contentPizzaria.form.fields.faturamento.options.length, 10);
});

test("validação: 'Até 30 mil' exige CNPJ válido e 'investiria'; outras faixas não", () => {
  const ate30 = { ...lead, faturamento: "Até 30 mil" };
  const semExtras = leadSchemaPizzaria.safeParse(ate30);
  assert.deepEqual(semExtras.error?.issues.map((i) => i.path[0]), ["cnpj", "investiria"]);
  assert.equal(
    leadSchemaPizzaria.safeParse({ ...ate30, cnpj: "11.222.333/0001-00", investiria: "Sim" }).error?.issues[0].message,
    "CNPJ inválido, confira o número."
  );
  assert.equal(leadSchemaPizzaria.safeParse({ ...ate30, cnpj: CNPJ_VALIDO, investiria: "Não" }).success, true);
});

test("erros de envio: mesmos textos da home", () => {
  const { errors } = contentPizzaria.form;
  assert.equal(errors.crm, "Não conseguimos enviar agora. Tente de novo em instantes.");
  assert.equal(errors.validation, "Dados inválidos. Verifique o formulário.");
  assert.match(errors.rateLimited, /\{min\}/);
});

test("resultado: 15 episódios na ordem do WP e capas ainda vazias", () => {
  const { items, covers } = contentResultado.episodios;
  assert.equal(items.length, 15);
  assert.equal(items[0], "https://www.instagram.com/reel/DR0Mx5Hknbi/");
  assert.equal(items[14], "https://www.instagram.com/reel/DSlPz4ZEZPw/");
  assert.equal(new Set(items).size, 15);
  assert.deepEqual(covers, []);
});

test("bastidores: rotas iguais às do WP e textos principais literais", () => {
  assert.equal(BASTIDORES_PATH, "/lead-magnetic-bastidores-alphas-pizzaria");
  assert.equal(BASTIDORES_OBRIGADO_PATH, "/obrigado-lm-bastidores-alphas-pizzaria");
  assert.equal(contentBastidores.form.title, "Quero receber os processos");
  assert.equal(contentBastidores.form.submitLabel, "Quero aumentar o lucro do meu restaurante →");
  assert.equal(contentBastidores.problema.list.length, 4);
  assert.equal(contentBastidores.obrigado.button, "Quero esse resultado pro meu restaurante");
  // A foto é a do Ailton Cruz: nunca as fotos IMG_9194 / IMG_1855.
  assert.match(contentBastidores.parada.photo.alt, /Ailton Cruz/);
  assert.ok(!/IMG_(9194|1855)/i.test(JSON.stringify(contentBastidores)));
});
