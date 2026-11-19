import { test } from "node:test";
import assert from "node:assert/strict";
import { PLANO_ALTO, PRATOS_EXEMPLO, SEGMENTOS_CMV, calcularCmv, calcularMini, cmvPrato, contadorEm, formatBrl, formatPct, parseNum, segmentoCmv, type EntradaCmv } from "@/lib/cmv";

// Valores esperados conferidos na página original do WP (Edge, 19/11/2026):
// /ferramenta-calculadora-cmv/ e a mini calculadora de /calculadora-de-cmv/.

const rapido = (seg: string, fat: string, ei: string, co: string, ef: string): EntradaCmv => ({ modo: "rapido", seg, v: { fat, ei, co, ef }, pratos: PRATOS_EXEMPLO });
const ficha = (seg: string): EntradaCmv => ({ modo: "ficha", seg, v: { fat: "", ei: "", co: "", ef: "" }, pratos: PRATOS_EXEMPLO });

function resumo(e: EntradaCmv) {
  const r = calcularCmv(e);
  if (!r) return null;
  return {
    cmv: formatPct(r.p) + "%",
    veredito: r.veredito.texto,
    mesa: r.naMesa ? formatBrl(r.perda) : "Dentro da faixa",
    pontos: formatPct(r.exc),
    ano: formatBrl(r.perda * 12),
    cmvRs: formatBrl(r.cmv),
    teto: formatBrl(r.noTeto),
    plano: r.plano,
    viloes: r.viloes.map((v) => `${v.n} ${formatPct(v.p)}% ~${formatBrl(v.e)}`),
  };
}

test("ferramenta A: pizzaria 100.000 / 18.000 / 36.500 / 19.500", () => {
  assert.deepEqual(resumo(rapido("pizzaria", "100000", "18000", "36500", "19500")), {
    cmv: "35,0%", veredito: "Ponto de atenção", mesa: "R$ 3.000", pontos: "3,0", ano: "R$ 36.000", cmvRs: "R$ 35.000", teto: "R$ 32.000", plano: "alto", viloes: [],
  });
});

test("ferramenta B: hamburgueria com pontos de milhar → crítico", () => {
  assert.deepEqual(resumo(rapido("hamburgueria", "80.000", "20.000", "30.000", "15.000")), {
    cmv: "43,8%", veredito: "CMV crítico", mesa: "R$ 7.800", pontos: "9,8", ano: "R$ 93.600", cmvRs: "R$ 35.000", teto: "R$ 27.200", plano: "alto", viloes: [],
  });
});

test("ferramenta C: japonês no limite mínimo → saudável, plano de manutenção", () => {
  const r = resumo(rapido("japones", "50000", "10000", "15000", "9000"));
  assert.equal(r?.cmv, "32,0%");
  assert.equal(r?.veredito, "CMV saudável");
  assert.equal(r?.mesa, "Dentro da faixa");
  assert.equal(r?.cmvRs, "R$ 16.000");
  assert.equal(r?.teto, "R$ 20.000");
  assert.equal(r?.plano, "ok");
});

test("ferramenta D: cafeteria abaixo do mínimo → 'confira a contagem', sem perda, plano alto", () => {
  const r = resumo(rapido("cafeteria", "100000", "5000", "20000", "5000"));
  assert.equal(r?.cmv, "20,0%");
  assert.equal(r?.veredito, "Abaixo do esperado: confira a contagem");
  assert.equal(r?.mesa, "Dentro da faixa");
  assert.equal(r?.plano, "alto");
});

test("ferramenta F: decimais com vírgula e milhar com ponto (Outro / Geral)", () => {
  assert.deepEqual(resumo(rapido("geral", "120.500", "15.000,50", "40000", "12.345")), {
    cmv: "35,4%", veredito: "Ponto de atenção", mesa: "R$ 481", pontos: "0,4", ano: "R$ 5.766", cmvRs: "R$ 42.656", teto: "R$ 42.175", plano: "alto", viloes: [],
  });
});

test("ferramenta Z: sem faturamento não há diagnóstico", () => {
  assert.equal(calcularCmv(rapido("pizzaria", "", "1000", "2000", "500")), null);
});

test("ferramenta E/H: ficha técnica com os pratos de exemplo (pizzaria e bar)", () => {
  const esperado = {
    cmv: "33,8%", veredito: "Ponto de atenção", mesa: "R$ 819", pontos: "1,8", ano: "R$ 9.830", cmvRs: "R$ 15.440", teto: "R$ 14.621", plano: "alto",
    viloes: ["Refrigerante 2L 56,7% ~R$ 962", "Pizza Calabresa 32,2% ~R$ 49"],
  };
  assert.deepEqual(resumo(ficha("pizzaria")), esperado);
  assert.deepEqual(resumo(ficha("bar")), esperado);
});

test("ficha técnica: CMV de cada prato e cor da linha (pizzaria)", () => {
  const s = segmentoCmv("pizzaria");
  assert.deepEqual(PRATOS_EXEMPLO.map((d) => cmvPrato(d, s)), [
    { texto: "CMV do prato: 32,2%", cor: "perda" },
    { texto: "CMV do prato: 30,9%", cor: "amarelo" },
    { texto: "CMV do prato: 56,7%", cor: "perda" },
  ]);
  assert.deepEqual(cmvPrato({ n: "", p: "", c: "3", q: "" }, s), { texto: "", cor: null });
  assert.equal(cmvPrato({ n: "", p: "100", c: "20", q: "" }, s).cor, "verde");
});

test("ficha técnica: quantidade vazia conta como 1 e prato sem nome vira 'Item sem nome'", () => {
  const r = calcularCmv({ ...ficha("pizzaria"), pratos: [{ n: "", p: "10", c: "5", q: "" }] });
  assert.equal(r?.fat, 10);
  assert.equal(r?.viloes[0].n, "Item sem nome");
});

test("parseNum, segmentos e planos iguais ao WP", () => {
  assert.equal(parseNum("1.234,56"), 1234.56);
  assert.equal(parseNum("12.345"), 12345);
  assert.equal(parseNum("12.34"), 12.34);
  assert.equal(parseNum("R$ 1.000"), 1000);
  assert.equal(parseNum("abc"), 0);
  assert.equal(SEGMENTOS_CMV.length, 13);
  assert.equal(segmentoCmv("nao-existe").nome, "Outro / Geral");
  assert.equal(PLANO_ALTO.length, 4);
});

test("mini calculadora: mesmos textos da página original", () => {
  const casos: [number, number, string, string, string, string][] = [
    [100000, 35, "R$ 100 mil", "Você pode estar perdendo", "R$ 3.000 por mês", "R$ 36.000 por ano. Conta: faturamento × pontos de CMV acima do teto de pizzaria (32%)."],
    [20000, 22, "R$ 20 mil", "Dentro da faixa de pizzaria", "Confira com os números reais", "A conta da calculadora usa estoque, compras e faturamento: o CMV real costuma ser diferente do que se imagina."],
    [600000, 50, "R$ 600 mil", "Você pode estar perdendo", "R$ 108.000 por mês", "R$ 1.296.000 por ano. Conta: faturamento × pontos de CMV acima do teto de pizzaria (32%)."],
    [255000, 33, "R$ 255 mil", "Você pode estar perdendo", "R$ 2.550 por mês", "R$ 30.600 por ano. Conta: faturamento × pontos de CMV acima do teto de pizzaria (32%)."],
    [100000, 32, "R$ 100 mil", "Dentro da faixa de pizzaria", "Confira com os números reais", "A conta da calculadora usa estoque, compras e faturamento: o CMV real costuma ser diferente do que se imagina."],
  ];
  for (const [f, c, fat, titulo, perda, nota] of casos) {
    const r = calcularMini(f, c);
    assert.deepEqual([r.fat, r.cmv, r.titulo, r.perda, r.nota], [fat, `${c}%`, titulo, perda, nota], `${f}/${c}`);
  }
});

test("contador R$ 3.000 → R$ 36.000", () => {
  assert.equal(contadorEm(0), "R$ 3.000");
  assert.equal(contadorEm(1), "R$ 36.000");
  assert.equal(contadorEm(0.5), "R$ 31.875");
});
