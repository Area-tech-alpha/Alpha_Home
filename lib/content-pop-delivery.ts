import type { PopContent } from "@/lib/content-pop";

// /pop-delivery: textos literais da página do WP (https://assessorialpha.com/pop-delivery/).
export const contentPopDelivery = {
  slug: "pop-delivery",
  meta: {
    title: "POP de Delivery da Alpha's Pizzaria · Alpha",
    description:
      "Cada funcionário sabe o que fazer, da comanda ao motoboy, sem perguntar toda hora. Imprima, apresente para a equipe e comece no próximo turno.",
    ogImage: "/images/pop/og-delivery.jpg",
  },
  cta: "QUERO O POP DE DELIVERY",
  hero: {
    image: "/images/pop/hero-delivery.webp",
    title: ["O POP de delivery para a sua operação funcionar ", "em ordem até nos dias de pico", " e sem depender de você"],
    titleSize: "l",
    sub: "Cada funcionário sabe o que fazer, da comanda ao motoboy, sem perguntar toda hora. Imprima, apresente para a equipe e comece no próximo turno.",
    prova: "É o POP que roda o delivery da Alpha's Pizzaria: mais de R$ 200 mil por mês.",
  },
  folhas: {
    capa: "/images/pop/delivery-1.webp",
    pagina2: "/images/pop/delivery-2.webp",
  },
  problema: {
    title: ["Sexta, 20h. A operação ", "entra em parafuso."],
    paras: [
      "Pedido chegando sem parar e cada um fazendo o que dá na cabeça. A pizza demora, a cozinha vira bagunça e o erro besta aparece: item esquecido, pedido trocado.",
      "O cliente sente na hora. A equipe se desgasta entre si, o gerente estoura e, no fim da noite, você ainda paga duas vezes pelos pedidos que voltaram.",
      "O problema não é a sua equipe. É a falta de processo.",
    ],
    virada: "Quando todo mundo sabe o que fazer, a sexta-feira deixa de ser um caos.",
    comanda: {
      titulo: "Sexta · 20h · delivery",
      subtitulo: "Sem processo",
      rows: [
        { label: "#231 · item esquecido", value: "voltou", tone: "red" },
        { label: "#232 · pedido trocado", value: "voltou", tone: "red" },
        { label: "#233 · atrasou 40 min", value: "reclamou", tone: "red" },
        { label: "#234 · refeito do zero", value: "pagou 2x", tone: "red" },
        { label: "Com o POP: comanda conferida", value: "saiu certo", tone: "ok" },
      ],
      nota: "Cena ilustrativa",
      carimbo: "Pago 2 vezes",
    },
  },
  muda: {
    title: ["O que muda ", "no seu delivery."],
    itens: [
      ["Cada um sabe o que fazer", "Um passo a passo para cada etapa, da abertura do setor ao fechamento do caixa. Ninguém precisa perguntar."],
      ["Pedido conferido, toda vez", "Cada comanda é conferida e todo pedido passa por um checklist antes de sair."],
      ["Pico sem caos", "A equipe segue o mesmo processo na sexta lotada e na terça tranquila."],
      ["Funcionário novo pronto mais rápido", "Aprende pelo passo a passo, não pelo vício de quem já estava."],
      ["Uma operação que se gerencia sozinha", "Você e o gerente param de apagar incêndio."],
    ],
  },
  email: {
    extras: [
      "Você recebe o POP original da Alpha's e o modelo editável, em PowerPoint e PDF, para adaptar ao seu restaurante. Imprima, apresente para a equipe e defina um responsável para conferir se cada passo está sendo seguido. É assim na Alpha's.",
    ],
  },
  autor: {
    title: ["Não é teoria. ", "É o delivery da Alpha's."],
    paras: [
      "Este POP roda todo dia no delivery da Alpha's Pizzaria, que vende mais de R$ 200 mil por mês só nas entregas. Quem escreveu é o Ailton Cruz, sócio-proprietário, que levou a casa a R$ 450 mil por mês em 8 meses de operação, com 27% de margem.",
      "Processo é o que segura a margem quando o volume sobe. Trazer esse volume é o trabalho da Alpha.",
    ],
    stats: [
      ["R$ 200 mil", "por mês no delivery"],
      ["R$ 450 mil", "por mês em 8 meses"],
      ["27%", "de margem"],
    ],
    virada: "A próxima sexta vai chegar. Deixe a sua operação pronta para ela.",
  },
} as const satisfies PopContent;
