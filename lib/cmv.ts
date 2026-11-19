// Cálculo de CMV das páginas /calculadora-de-cmv (mini calculadora do topo) e
// /ferramenta-calculadora-cmv ("Calculadora mágica"). Fórmulas e textos copiados do
// JS das páginas do WP (window.TZ_CX e o script da ferramenta; data-minicalc do
// script das iscas). Funções puras: sem DOM, sem estado. Testes em tests/cmv.test.ts,
// com valores conferidos na página original.

export type SegmentoCmv = { id: string; nome: string; min: number; max: number };

// window.TZ_CX.seg do WP (13 segmentos, faixa ideal de CMV em %).
export const SEGMENTOS_CMV: readonly SegmentoCmv[] = [
  { id: "pizzaria", nome: "Pizzaria", min: 26, max: 32 },
  { id: "hamburgueria", nome: "Hamburgueria", min: 28, max: 34 },
  { id: "japones", nome: "Japonês / Sushi", min: 32, max: 40 },
  { id: "alacarte", nome: "Restaurante à la carte", min: 30, max: 36 },
  { id: "quilo", nome: "Self-service / por quilo", min: 32, max: 38 },
  { id: "brasileira", nome: "Comida brasileira", min: 30, max: 36 },
  { id: "bar", nome: "Bar / Gastrobar", min: 25, max: 32 },
  { id: "cafeteria", nome: "Cafeteria / Café", min: 24, max: 32 },
  { id: "padaria", nome: "Padaria / Confeitaria", min: 28, max: 36 },
  { id: "acai", nome: "Açaí / Sorveteria", min: 28, max: 36 },
  { id: "fastfood", nome: "Food truck / Fast food", min: 28, max: 34 },
  { id: "delivery", nome: "Marmitaria / Delivery", min: 30, max: 38 },
  { id: "geral", nome: "Outro / Geral", min: 30, max: 35 },
];

export type SemanaPlano = readonly [string, string, string];

export const PLANO_ALTO: readonly SemanaPlano[] = [
  ["Semana 1", "Ficha técnica dos 10 itens que mais vendem", "Custo por porção e CMV de cada um. Sem isso, você não sabe onde cortar."],
  ["Semana 2", "Porção na balança e contagem semanal", "Balança e medidor na bancada, e contagem do estoque toda semana: furo, desperdício e erro de porção aparecem antes de virar prejuízo."],
  ["Semana 3", "Cotação dos insumos que mais pesam", "Poucos insumos respondem pela maior parte da compra. Cote os 10 principais com 3 fornecedores e controle a validade (o primeiro que vence é o primeiro que sai)."],
  ["Semana 4", "Reajuste pela ficha e nova medição", "Reajuste só os itens fora da faixa, com base no custo, e meça o CMV de novo para ver quanto voltou para o caixa."],
];

export const PLANO_OK: readonly SemanaPlano[] = [
  ["Semana 1", "Mantenha a contagem em dia", "Continue medindo toda semana para o CMV não subir sem você perceber."],
  ["Semana 2", "Ficha técnica atualizada", "Revise o custo dos itens que mais vendem sempre que um insumo subir."],
  ["Semana 3", "Destaque o que tem margem", "Dê destaque no cardápio aos itens de margem alta e reavalie os de margem apertada."],
  ["Semana 4", "Recote os fornecedores", "Mesmo com o CMV bom, recotar de tempos em tempos garante que o custo não escorregue."],
];

// Segmento pelo id; desconhecido cai no último ("Outro / Geral"), como no WP.
export function segmentoCmv(id: string): SegmentoCmv {
  return SEGMENTOS_CMV.find((s) => s.id === id) ?? SEGMENTOS_CMV[SEGMENTOS_CMV.length - 1];
}

// num() do WP: aceita "1.234,56", "1234.56", "12.345" (milhar) e lixo (vira 0).
export function parseNum(v: unknown): number {
  if (v == null) return 0;
  let s = String(v).replace(/[^\d.,-]/g, "");
  if (!s) return 0;
  if (s.indexOf(",") > -1) s = s.replace(/\./g, "").replace(",", ".");
  else {
    const pt = s.split(".");
    if (pt.length > 1 && pt[pt.length - 1].length === 3) s = s.replace(/\./g, "");
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// brl() da ferramenta: "R$ 3.000" (sem centavos).
export function formatBrl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).replace(/ /g, " ");
}

// pct() da ferramenta: uma casa decimal, vírgula ("35,0").
export function formatPct(n: number): string {
  return (Math.round(n * 10) / 10).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// Valor do input ao sair do campo (blur do WP): "1.234,5".
export function formatInput(v: string): string {
  return v.trim() ? parseNum(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : v;
}

export type Prato = { n: string; p: string; c: string; q: string };

// Pratos de exemplo do WP (modo ficha técnica).
export const PRATOS_EXEMPLO: readonly Prato[] = [
  { n: "Pizza Calabresa", p: "59,00", c: "19,00", q: "410" },
  { n: "Pizza Margherita", p: "55,00", c: "17,00", q: "320" },
  { n: "Refrigerante 2L", p: "15,00", c: "8,50", q: "260" },
];

export type CorPrato = "perda" | "amarelo" | "verde";

// CMV de um prato e a cor da linha (acima do teto, dentro, abaixo do mínimo).
export function cmvPrato(d: Prato, seg: SegmentoCmv): { texto: string; cor: CorPrato | null } {
  const p = parseNum(d.p);
  const c = parseNum(d.c);
  if (!(p > 0)) return { texto: "", cor: null };
  const pct = (c / p) * 100;
  return { texto: `CMV do prato: ${formatPct(pct)}%`, cor: pct > seg.max ? "perda" : pct >= seg.min ? "amarelo" : "verde" };
}

export type Modo = "rapido" | "ficha";
export type EntradaCmv = {
  modo: Modo;
  seg: string;
  v: { fat: string; ei: string; co: string; ef: string };
  pratos: readonly Prato[];
};

export type Veredito = { tom: "v-bom" | "v-at" | "v-ruim"; texto: string };
export type Vilao = { n: string; p: number; e: number };

export type ResultadoCmv = {
  seg: SegmentoCmv;
  fat: number;
  cmv: number;
  // CMV em %, pontos acima do teto e perda mensal em R$.
  p: number;
  exc: number;
  perda: number;
  veredito: Veredito;
  // Posições (0–100) na régua de 15% a 55%.
  regua: { min: number; max: number; marca: number };
  noTeto: number;
  // Mostra "deixando na mesa" (exc > 0,05) ou "margem protegida".
  naMesa: boolean;
  viloes: Vilao[];
  plano: "alto" | "ok";
};

const regua = (x: number) => Math.max(0, Math.min(100, ((x - 15) / 40) * 100));

// calc() do WP. null = faturamento vazio ("Preencha os campos...").
export function calcularCmv(e: EntradaCmv): ResultadoCmv | null {
  const s = segmentoCmv(e.seg);
  let fat = 0;
  let cmv = 0;
  const viloes: Vilao[] = [];
  if (e.modo === "rapido") {
    fat = parseNum(e.v.fat);
    cmv = parseNum(e.v.ei) + parseNum(e.v.co) - parseNum(e.v.ef);
  } else {
    for (const d of e.pratos) {
      const p = parseNum(d.p);
      const c = parseNum(d.c);
      const q = parseNum(d.q) || 1;
      fat += p * q;
      cmv += c * q;
      if (p > 0 && (c / p) * 100 > s.max) viloes.push({ n: d.n || "Item sem nome", p: (c / p) * 100, e: (c / p - s.max / 100) * p * q });
    }
  }
  viloes.sort((a, b) => b.e - a.e);
  if (!(fat > 0)) return null;
  const p = (cmv / fat) * 100;
  const exc = Math.max(0, p - s.max);
  const perda = (fat * exc) / 100;
  const veredito: Veredito =
    p < s.min
      ? { tom: "v-at", texto: "Abaixo do esperado: confira a contagem" }
      : p <= s.max
        ? { tom: "v-bom", texto: "CMV saudável" }
        : p <= s.max + 5
          ? { tom: "v-at", texto: "Ponto de atenção" }
          : { tom: "v-ruim", texto: "CMV crítico" };
  return {
    seg: s,
    fat,
    cmv,
    p,
    exc,
    perda,
    veredito,
    regua: { min: regua(s.min), max: regua(s.max), marca: regua(p) },
    noTeto: (fat * s.max) / 100,
    naMesa: exc > 0.05,
    viloes: e.modo === "ficha" ? viloes.slice(0, 4) : [],
    plano: exc > 0.05 || p < s.min ? "alto" : "ok",
  };
}

// ===== Mini calculadora do topo da /calculadora-de-cmv (data-minicalc do WP) =====

export const MINI_CALC = {
  teto: 32,
  fat: { min: 20000, max: 600000, step: 5000, inicial: 100000 },
  cmv: { min: 22, max: 50, step: 1, inicial: 35 },
} as const;

const brlMini = (n: number) => "R$ " + Math.round(n).toLocaleString("pt-BR");

export type ResultadoMini = { fat: string; cmv: string; titulo: string; perda: string; nota: string; ok: boolean };

export function calcularMini(f: number, c: number, teto: number = MINI_CALC.teto): ResultadoMini {
  const fat = f >= 1000000 ? "R$ 1 milhão" : "R$ " + (f / 1000).toLocaleString("pt-BR") + " mil";
  const perda = (f * Math.max(0, c - teto)) / 100;
  if (perda > 0) {
    return {
      fat,
      cmv: c + "%",
      titulo: "Você pode estar perdendo",
      perda: brlMini(perda) + " por mês",
      nota: brlMini(perda * 12) + " por ano. Conta: faturamento × pontos de CMV acima do teto de pizzaria (" + teto + "%).",
      ok: false,
    };
  }
  return {
    fat,
    cmv: c + "%",
    titulo: "Dentro da faixa de pizzaria",
    perda: "Confira com os números reais",
    nota: "A conta da calculadora usa estoque, compras e faturamento: o CMV real costuma ser diferente do que se imagina.",
    ok: true,
  };
}

// Contador "R$ 3.000 → R$ 36.000" (data-countup do WP): 1,6 s com easing cúbico.
export const CONTADOR = { de: 3000, ate: 36000, ms: 1600 } as const;
export function contadorEm(k: number): string {
  const t = Math.max(0, Math.min(1, k));
  const e = 1 - Math.pow(1 - t, 3);
  return brlMini(t < 1 ? CONTADOR.de + (CONTADOR.ate - CONTADOR.de) * e : CONTADOR.ate);
}
