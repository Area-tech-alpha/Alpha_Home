import type { PopContent } from "@/lib/content-pop";

// /pop-producao: textos literais da página do WP (https://assessorialpha.com/pop-producao/).
export const contentPopProducao = {
  slug: "pop-producao",
  meta: {
    title: "POP de Produção da Alpha's Pizzaria · Alpha",
    description:
      "É o POP de produção da Alpha's: um passo a passo da montagem ao forno que qualquer pessoa da equipe consegue seguir, sem depender de um pizzaiolo só. Imprima, cole na parede da bancada e comece no próximo turno.",
    ogImage: "/images/pop/og-producao.jpg",
  },
  cta: "QUERO O POP DE PRODUÇÃO",
  hero: {
    image: "/images/pop/hero-producao.webp",
    title: ["Implemente na sua pizzaria o processo que tira cada pizza ", "em menos de 5 minutos,", " até nos dias de pico"],
    titleSize: "l",
    sub: "É o POP de produção da Alpha's: um passo a passo da montagem ao forno que qualquer pessoa da equipe consegue seguir, sem depender de um pizzaiolo só. Imprima, cole na parede da bancada e comece no próximo turno.",
    prova: "É o padrão da cozinha da Alpha's Pizzaria: R$ 450 mil por mês em 8 meses de operação, com 27% de margem.",
  },
  folhas: {
    capa: "/images/pop/producao-1.webp",
    pagina2: "/images/pop/producao-2.webp",
    selo: "menos de 5 min",
  },
  problema: {
    title: ["Mesma pizza, ", "três jeitos diferentes."],
    paras: [
      "Cada pizzaiolo monta no olho. Uma pizza sai com cobertura demais e come a sua margem. Outra sai com de menos e vira reclamação.",
      "No rush, a montagem trava, o forno vira fila e o pedido atrasa. E no dia em que o pizzaiolo bom falta, a pizza muda junto.",
      "O problema não é o seu pizzaiolo. É a falta de padrão.",
    ],
    virada: "Quando o padrão está na parede, qualquer um monta a pizza certa.",
    comanda: {
      titulo: "Mesma pizza · mesmo preço",
      subtitulo: "3 pizzaiolos, 3 jeitos",
      rows: [
        { label: "Pizza 1 · cobertura demais", value: "come a margem", tone: "red" },
        { label: "Pizza 2 · cobertura de menos", value: "vira reclamação", tone: "red" },
        { label: "Pizza 3 · no padrão", value: "custo certo", tone: "ok" },
      ],
      total: { label: "Mesmo preço,", value: "custos diferentes" },
      nota: "Exemplo ilustrativo",
    },
  },
  muda: {
    title: ["O que muda ", "na sua cozinha."],
    itens: [
      ["Pizza pronta em menos de 5 minutos", "Montagem em até 2 minutos e forno a 300 °C por 2min40. No rush, o forno não vira fila."],
      ["Toda pizza igual", "Cada etapa da montagem e da produção tem o seu padrão, e todo mundo faz do mesmo jeito."],
      ["Menos desperdício", "Quando a equipe segue o padrão, ninguém monta no olho."],
      ["Pizzaiolo novo pronto mais rápido", "Aprende pelo padrão, não pelo olho de quem já estava."],
      ["Cozinha pronta para o próximo turno", "Limpeza e finalização no fim de cada turno."],
    ],
  },
  email: {
    extras: [
      "Você recebe o POP original da Alpha's, com 54 passos em 3 blocos, e o modelo editável, em PowerPoint e PDF, para adaptar à sua cozinha. Imprima, apresente para a equipe e defina um responsável para conferir se cada passo está sendo seguido. É assim na Alpha's.",
    ],
  },
  autor: {
    title: ["Escrito numa cozinha ", "que produz todo dia."],
    paras: [
      "É o POP da cozinha da Alpha's Pizzaria, escrito pelo Ailton Cruz, sócio-proprietário. A casa que segue esse padrão chegou a R$ 450 mil por mês em 8 meses de operação, com 27% de margem.",
      "Padrão na bancada é o que segura o CMV quando o movimento sobe. Trazer esse movimento é o trabalho da Alpha.",
    ],
    stats: [
      ["< 5 min", "por pizza"],
      ["R$ 450 mil", "por mês em 8 meses"],
      ["27%", "de margem"],
    ],
    virada: "A próxima pizza sai hoje. Faça ela sair no padrão.",
  },
} as const satisfies PopContent;
