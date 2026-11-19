import type { PopContent } from "@/lib/content-pop";

// /cronograma-de-limpeza: textos literais da página do WP
// (https://assessorialpha.com/cronograma-de-limpeza/, ID 14295).
export const contentCronogramaLimpeza = {
  slug: "cronograma-de-limpeza",
  meta: {
    title: "Cronograma de Limpeza da Alpha's Pizzaria · Alpha",
    description:
      "40 tarefas de limpeza divididas em diária, semanal, quinzenal e mensal, com o produto certo, a diluição certa e os 17 pontos que a vigilância confere. Imprima, cole na parede e comece hoje.",
    ogImage: "/images/iscas/og-limpeza.jpg",
  },
  cta: "QUERO O CRONOGRAMA DE LIMPEZA",
  eyebrow: "Bastidores da Alpha's Pizzaria · cronograma gratuito",
  form: { submit: "ENVIAR MEU CRONOGRAMA", nota: "O material chega no seu e-mail em seguida." },
  hero: {
    image: "/images/iscas/hero-limpeza.webp",
    title: ["O cronograma de limpeza para a sua cozinha estar ", "sempre pronta para a vigilância sanitária", " e sem você precisar cobrar a equipe"],
    titleSize: "xl",
    sub: "40 tarefas de limpeza divididas em diária, semanal, quinzenal e mensal, com o produto certo, a diluição certa e os 17 pontos que a vigilância confere. Imprima, cole na parede e comece hoje.",
    prova: "É o cronograma da cozinha da Alpha's Pizzaria: R$ 450 mil por mês em 8 meses de operação, com 27% de margem.",
  },
  folhas: {
    capa: "/images/iscas/limpeza-1.webp",
    pagina2: "/images/iscas/limpeza-2.webp",
  },
  problema: {
    title: ["A vigilância ", "não avisa quando vem."],
    paras: [
      "E quando chega, ela olha o que ninguém olha: a coifa, o ralo, a câmara fria, o rodapé.",
      "Na cozinha sem cronograma, a limpeza depende de alguém lembrar. Quem limpou a coifa? Quando foi a última vez da câmara fria? Ninguém sabe, e ninguém assinou.",
      "O risco não é só a multa. É uma autuação parar a sua operação, ou um cliente passar mal com a sua comida.",
      "O problema não é a sua equipe. É a falta de cronograma.",
    ],
    virada: "Quando cada limpeza tem dia, produto e assinatura, ninguém esquece.",
    comanda: {
      titulo: "Quem limpou?",
      subtitulo: "Cozinha sem cronograma",
      rows: [
        { label: "Coifa", value: "?", tone: "red" },
        { label: "Ralo", value: "?", tone: "red" },
        { label: "Câmara fria", value: "?", tone: "red" },
        { label: "Rodapé", value: "?", tone: "red" },
        { label: "Com o cronograma: dia, produto e assinatura", value: " assinado", tone: "ok", icon: "sim", iconPos: "before" },
      ],
      sepAntes: 4,
      nota: "Ninguém sabe, e ninguém assinou",
    },
  },
  muda: {
    title: ["O que muda ", "na sua cozinha."],
    itens: [
      ["Vigilância sem susto", "Os 17 pontos críticos que a fiscalização confere, do ralo fechado ao produto químico longe do alimento."],
      ["Nada fica esquecido", "40 tarefas, cada uma com a sua frequência: do piso de todo dia à coifa a cada 15 dias e à tela contra insetos todo mês."],
      ["Produto certo, na diluição certa", "3 produtos, cada um com o que limpa e a sua medida. Sem desperdício e sem risco para a equipe e para o alimento."],
      ["Equipe protegida", "Luvas, máscara, touca, avental e botas impermeáveis."],
      ["Prova de que foi feito", "Um plano de registro com responsável, assinatura e data. Se a vigilância perguntar, está no papel."],
    ],
  },
  email: {
    extras: [
      "Também vem: o fluxo de higienização em 9 passos, do preparo do produto ao registro.",
      "Você recebe o cronograma original da Alpha's e o modelo editável, em PowerPoint e PDF, para adaptar à sua cozinha. Imprima, apresente para a equipe e defina um responsável para conferir se cada tarefa está sendo feita. É assim na Alpha's.",
    ],
  },
  autor: {
    title: ["Feito numa cozinha ", "que não pode parar."],
    paras: [
      "É o cronograma da Alpha's Pizzaria, escrito pelo Ailton Cruz, sócio-proprietário. A casa chegou a R$ 450 mil por mês em 8 meses de operação, com 27% de margem.",
      "Cozinha no padrão é cozinha que não para. Encher essa cozinha de pedido é o trabalho da Alpha.",
    ],
    stats: [
      ["40 tarefas", "de limpeza"],
      ["R$ 450 mil", "por mês em 8 meses"],
      ["27%", "de margem"],
    ],
    virada: "A fiscalização não avisa. Esteja pronto hoje.",
  },
} as const satisfies PopContent;
