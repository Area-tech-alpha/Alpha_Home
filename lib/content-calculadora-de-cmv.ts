import type { PopContent } from "@/lib/content-pop";

// /calculadora-de-cmv: textos literais da página do WP
// (https://assessorialpha.com/calculadora-de-cmv/, ID 14285). O título é o mesmo da
// /ferramenta-calculadora-cmv no WP (mantido).
export const contentCalculadoraCmv = {
  slug: "calculadora-de-cmv",
  meta: {
    title: "Calculadora Mágica de CMV · Alpha",
    description: "Coloque estoque, compras e faturamento. Em 2 minutos você vê a perda em reais e recebe um plano para recuperar sua margem.",
    ogImage: "/images/pop/og-expedicao.jpg",
  },
  cta: "QUERO CALCULAR MEU CMV",
  topTag: "Material gratuito",
  eyebrow: "Calculadora de CMV · grátis para restaurantes",
  form: { submit: "ENVIAR MINHA CALCULADORA", nota: "A calculadora abre na hora, e o link também vai para o seu e-mail." },
  hero: {
    image: "/images/pop/hero-expedicao.webp",
    title: ["Descubra quanto o seu CMV está ", "tirando do seu lucro", " todo mês"],
    titleSize: "",
    titleTone: "loss",
    sub: "Coloque estoque, compras e faturamento. Em 2 minutos você vê a perda em reais e recebe um plano para recuperar sua margem.",
    prova: "A mesma calculadora que a Alpha usa com os clientes e na Alpha's Pizzaria, que opera com 27% de margem de lucro.",
  },
  problema: {
    title: ["Vende bem e ", "não sobra?"],
    paras: [
      "Cada ponto de CMV acima da faixa sai direto do seu lucro.",
      "Uma pizzaria que fatura R$ 100 mil com CMV de 35%, quando o teto é 32%, perde R$ 3 mil por mês. R$ 36 mil por ano. Sem perder nenhum cliente.",
      "E vender mais não resolve: aumenta o vazamento.",
    ],
    virada: "Antes de vender mais, descubra quanto escapa do que você já vende.",
    comanda: {
      titulo: "De cada R$ 100 vendidos",
      subtitulo: "Pizzaria · CMV 35% · teto 32%",
      rows: [
        { label: "Insumos (CMV)", value: "R$ 32,00" },
        { label: "+3 pontos acima do teto", value: "R$ 3,00", tone: "red" },
        { label: "Aluguel", value: "R$ 8,00" },
        { label: "Equipe", value: "R$ 25,00" },
        { label: "Impostos", value: "R$ 10,00" },
        { label: "O que sobra", value: "R$ 22,00", strike: "R$ 25,00", tone: "red", big: true },
      ],
      sepAntes: 5,
      nota: "Exemplo ilustrativo",
    },
  },
  muda: {
    title: ["Seus números, ", "a resposta em reais."],
    itens: [],
  },
  autor: {
    title: ["Feita por quem ", "tem restaurante."],
    paras: [
      "O Ailton Cruz é sócio-proprietário da Alpha's Pizzaria. Ele levou a casa do zero a R$ 450 mil por mês em 8 meses, com 27% de margem de lucro e uma operação enxuta.",
      "É essa a conta que ele faz toda semana. E é a mesma que a Alpha usa com os clientes: mais de 2.000 restaurantes que aumentaram o lucro com a gente.",
      "A calculadora mostra o furo. Fechar ele todo mês é o trabalho da Alpha.",
    ],
    stats: [
      ["27%", "de margem"],
      ["R$ 450 mil", "por mês em 8 meses"],
      ["+2.000", "restaurantes"],
    ],
    virada: "Descubra hoje quanto do que você vende fica com você.",
  },
} as const satisfies PopContent;

// Partes só desta página.
export const calculadoraExtras = {
  mini: { titulo: "Simulação rápida", tag: "Pizzaria · teto 32%", fatLabel: "Quanto você fatura por mês?", cmvLabel: "Qual o seu CMV hoje?" },
  conta: { mes: "R$ 3.000/mês", ano: "por ano" },
  lista: [
    "Seu CMV comparado à faixa ideal de pizzaria, hamburgueria, japonês e mais 10 segmentos.",
    "Quanto ele custa por mês e por ano.",
    "Os pratos que mais pesam na sua margem.",
    "Um plano de 4 semanas para recuperar.",
  ],
  chipsHint: "Faixa ideal de CMV · toque no seu segmento",
  // Chips do WP (12 segmentos; a ferramenta tem 13, com outros nomes: mantido como no WP).
  chips: [
    ["Pizzaria", "26% a 32%"],
    ["Hamburgueria", "28% a 34%"],
    ["Japonês", "32% a 40%"],
    ["À la carte", "30% a 36%"],
    ["Por quilo", "32% a 38%"],
    ["Brasileira", "30% a 36%"],
    ["Gastrobar", "25% a 32%"],
    ["Cafeteria", "24% a 32%"],
    ["Confeitaria", "28% a 36%"],
    ["Açaí", "28% a 36%"],
    ["Fast food", "28% a 34%"],
    ["Marmitaria", "30% a 38%"],
  ],
  socos: ["Pare de comprar no escuro.", "Pare de reajustar preço no chute.", "Saiba quanto sobra antes de o mês acabar."],
  telas: {
    t1: { titulo: "1 · Seus números", tag: "Pizzaria", linhas: [["Faturamento", "R$ 100.000"], ["Estoque inicial", "R$ 18.000"], ["Compras", "R$ 36.500"], ["Estoque final", "R$ 19.500"]], cap: "CMV = 18.000 + 36.500 - 19.500" },
    t2: { titulo: "2 · Seu CMV", tag: "35,0%", escala: ["15%", "ideal 26 a 32%", "55%"], cap: "Pizzaria: faixa ideal de 26% a 32%. Você está 3 pontos acima." },
    t3: { titulo: "3 · Na mesa", tag: "por mês", antes: "Você está deixando na mesa", valor: "R$ 3.000", depois: "R$ 36.000 por ano saindo direto do seu lucro." },
    t4: { titulo: "4 · Plano", tag: "4 semanas", itens: ["Ficha técnica dos itens que mais vendem", "Porção na balança e contagem semanal", "Cotação dos insumos que mais pesam", "Reajuste pela ficha e nova medição"] },
    exemplo: "As telas da calculadora · números de exemplo",
  },
  timeline: {
    titulo: "Alpha's Pizzaria · faturamento mensal",
    pontos: [["Mês 0", "R$ 0"], ["Mês 6", "R$ 340 mil"], ["Mês 8", "R$ 450 mil"]],
    selo: "27% de margem",
  },
};
