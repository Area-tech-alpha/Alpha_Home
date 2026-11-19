import type { PopContent } from "@/lib/content-pop";

// /pop-expedicao: textos literais da página do WP (https://assessorialpha.com/pop-expedicao/).
export const contentPopExpedicao = {
  slug: "pop-expedicao",
  meta: {
    title: "POP de Expedição da Alpha's Pizzaria · Alpha",
    description:
      "Uma rotina que a equipe segue sem você, do recebimento do insumo ao produto etiquetado, com os 18 pontos que a vigilância confere. Imprima, cole na parede e comece hoje.",
    ogImage: "/images/pop/og-expedicao.jpg",
  },
  cta: "QUERO O POP DE EXPEDIÇÃO",
  hero: {
    image: "/images/pop/hero-expedicao.webp",
    title: ["O POP de expedição para o seu estoque ", "parar de perder insumo", " e estar sempre pronto para a vigilância sanitária"],
    titleSize: "xl",
    sub: "Uma rotina que a equipe segue sem você, do recebimento do insumo ao produto etiquetado, com os 18 pontos que a vigilância confere. Imprima, cole na parede e comece hoje.",
    prova: "É a rotina da Alpha's Pizzaria: R$ 450 mil por mês em 8 meses de operação, com 27% de margem.",
  },
  folhas: {
    capa: "/images/pop/expedicao-1.webp",
    pagina2: "/images/pop/expedicao-2.webp",
  },
  problema: {
    title: ["Insumo vencido é dinheiro que você pagou ", "para jogar fora."],
    paras: [
      "Estoque sem rotina esconde produto. Você compra o que já tinha, deixa vencer o que ninguém viu e o CMV sobe sem ninguém saber por quê.",
      "E no dia em que a vigilância aparece, ela encontra exatamente isso: produto sem etiqueta, insumo vencido no fundo da prateleira, limpeza que ficou para depois.",
      "O problema não é a sua equipe. É a falta de rotina.",
    ],
    virada: "Quando a rotina está na parede, o estoque se arruma todo dia.",
    comanda: {
      titulo: "Insumo vencido",
      subtitulo: "Estoque sem rotina",
      rows: [
        { label: "Comprou", value: "R$ ", icon: "sim" },
        { label: "Pagou", value: "R$ ", icon: "sim" },
        { label: "Venceu no fundo da prateleira", value: "sem etiqueta", tone: "red" },
        { label: "Jogou fora", value: "R$ ", icon: "nao", tone: "red", big: true },
      ],
      total: { label: "Resultado", value: "comprou, pagou, jogou fora" },
      carimbo: "Vencido",
    },
  },
  muda: {
    title: ["O que muda ", "na sua cozinha."],
    itens: [
      ["Menos insumo no lixo", "PVPS (o primeiro que vence é o primeiro que sai) e etiqueta de validade em todo produto manipulado."],
      ["Compra certa", "Contagem do estoque seco, hortifrúti, frios e proteínas duas vezes por semana. Você sabe o que tem antes de pedir."],
      ["Vigilância sem susto", "Os 18 pontos críticos que a fiscalização confere, do EPI à temperatura de conservação."],
      ["Bancada pronta para o rush", "Hortifrúti cortado e pré-produção embalada e etiquetada antes de o movimento começar."],
      ["Setor só abre conferido", "Um checklist de 10 itens que o líder assina antes de liberar para a operação."],
    ],
  },
  email: {
    extras: [
      "Também vem: a diluição certa de cada produto de limpeza, o fluxo em 9 etapas do recebimento à expedição e a faxina geral da semana.",
      "Você recebe o POP original da Alpha's e o modelo editável, em PowerPoint e PDF, para adaptar ao seu estoque. Imprima, apresente para a equipe e defina um responsável para conferir se cada passo está sendo seguido. É assim na Alpha's.",
    ],
  },
  autor: {
    title: ["Feito num estoque ", "que gira todo dia."],
    paras: [
      "É a rotina de estoque da Alpha's Pizzaria, escrita pelo Ailton Cruz, sócio-proprietário. A casa chegou a R$ 450 mil por mês em 8 meses de operação, com 27% de margem.",
      "Estoque sob controle é parte de como essa margem se mantém. Trazer mais venda para girar esse estoque é o trabalho da Alpha.",
    ],
    stats: [
      ["18 pontos", "críticos da vigilância"],
      ["R$ 450 mil", "por mês em 8 meses"],
      ["27%", "de margem"],
    ],
    virada: "O próximo recebimento chega amanhã. Confira do jeito certo.",
  },
} as const satisfies PopContent;
