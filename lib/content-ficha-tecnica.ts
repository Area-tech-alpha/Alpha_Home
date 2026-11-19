import type { PopContent } from "@/lib/content-pop";

// /ficha-tecnica: textos literais da página do WP (https://assessorialpha.com/ficha-tecnica/, ID 14305).
export const contentFichaTecnica = {
  slug: "ficha-tecnica",
  meta: {
    title: "Ficha Técnica da Margem Blindada · Alpha",
    description:
      "É a ficha que a Alpha's Pizzaria usa na cozinha, editável para qualquer nicho: a gramatura de cada ingrediente, o custo de cada item e o seu CMV. Coloque os seus ingredientes e preços e pendure na bancada hoje.",
    ogImage: "/images/pop/og-producao.jpg",
  },
  cta: "QUERO A FICHA TÉCNICA",
  eyebrow: "Bastidores da Alpha's Pizzaria · ficha técnica gratuita",
  form: { submit: "ENVIAR MINHA FICHA", nota: "O material chega no seu e-mail em seguida." },
  hero: {
    image: "/images/pop/hero-producao.webp",
    title: ["Baixe a ", "Ficha Técnica da Margem Blindada:", " saiba quanto custa cada item do seu cardápio e lucre mais em cada venda"],
    titleSize: "xl",
    sub: "É a ficha que a Alpha's Pizzaria usa na cozinha, editável para qualquer nicho: a gramatura de cada ingrediente, o custo de cada item e o seu CMV. Coloque os seus ingredientes e preços e pendure na bancada hoje.",
    prova: "Feita por Ailton Cruz, sócio-proprietário da Alpha's Pizzaria: R$ 450 mil por mês em 8 meses de operação, com 27% de margem.",
  },
  folhas: {
    capa: "/images/iscas/ficha-1.webp",
    pagina2: "/images/iscas/ficha-2.webp",
    capaAlt: "Ficha técnica da Alpha's Pizzaria",
    land: true,
    width: 920,
    height: 651,
  },
  problema: {
    title: ["Quanto custa a pizza ", "que você acabou de vender?"],
    paras: [
      "Se a resposta é \"mais ou menos\", o problema começa aí.",
      "Cada funcionário põe uma quantidade. A gramatura varia, o custo varia, e o preço do cardápio continua o mesmo. Quando o insumo sobe, o reajuste é no chute, e você só descobre que a margem caiu quando o mês fecha e não sobra.",
      "50 gramas a mais de cobertura parecem nada. Em mil pizzas no mês, são 50 kg de insumo saindo do seu lucro.",
    ],
    virada: "Antes de mexer no preço, descubra o custo.",
    comanda: {
      titulo: "Pizza Frango com Bacon",
      subtitulo: "Cobertura · ficha x balança",
      rows: [
        { label: "Ficha técnica", value: "900 g", tone: "ok" },
        { label: "Balança na bancada", value: "950 g", tone: "red" },
        { label: "Diferença por pizza", value: "+50 g", tone: "red" },
        { label: "× pizzas no mês", value: "1.000" },
      ],
      total: { label: "Saindo do lucro", value: "50 kg/mês" },
    },
  },
  muda: {
    title: ["O que muda ", "no seu restaurante."],
    itens: [
      ["Margem protegida", "Com o custo de cada item na mão, você vê na hora qual perdeu margem quando o insumo sobe, e reajusta só ele."],
      ["Mais lucro em cada venda", "Sem gramatura a mais, o insumo que sobrava em cada item volta para o seu caixa."],
      ["Preço com base no custo", "Com o CMV de cada item, você monta o cardápio pela conta, não pelo chute."],
      ["Todo item sai igual", "Passo a passo com a gramatura em cada etapa. Ninguém monta no olho."],
      ["Serve para qualquer nicho", "Troque os ingredientes e monte a ficha de cada item do cardápio no PowerPoint, no Google Slides ou no Canva."],
    ],
  },
  email: {
    arquivos: [
      { tipo: "PDF", cor: "#B3261E", titulo: "Ficha da Alpha's", texto: "Frango com Bacon e Creme de Milho, pronta para imprimir" },
      { tipo: "PPT", cor: "#C4502C", titulo: "Modelo editável", texto: "PowerPoint, Google Slides ou Canva" },
    ],
    extras: [
      "Você recebe a ficha da Frango com Bacon e Creme de Milho da Alpha's, com as 8 gramaturas da casa (900 g de cobertura), e o modelo editável para montar a sua. O custo, você preenche com os seus preços. Imprima em A4 e pendure na bancada.",
    ],
  },
  autor: {
    title: ["Feita por quem calcula ", "o custo de cada pizza."],
    paras: [
      "O Ailton Cruz, sócio-proprietário da Alpha's Pizzaria, é o autor das fichas técnicas da casa. Lá, nenhuma gramatura muda sem autorização da gestão. A casa chegou a R$ 450 mil por mês em 8 meses de operação, com 27% de margem.",
      "Margem assim começa na ficha técnica. Vender mais com essa margem é o trabalho da Alpha.",
    ],
    stats: [
      ["900 g", "de cobertura no padrão"],
      ["R$ 450 mil", "por mês em 8 meses"],
      ["27%", "de margem"],
    ],
    virada: "Você vai vender pizza hoje. Saiba quanto cada uma te deixa.",
  },
} as const satisfies PopContent;
