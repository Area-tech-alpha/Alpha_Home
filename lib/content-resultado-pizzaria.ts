// Textos da /resultado-alphas-pizzaria, copiados literalmente da página do WP
// https://assessorialpha.com/resultado-alphas-pizzaria/ (page-id 13526).
// Campos e opções do form são os mesmos da /alphas-pizzaria (contentPizzaria.form).

export const contentResultado = {
  meta: {
    title: "Alpha's Pizzaria: De 0 a 400 Mil em Menos de 1 Ano",
    description:
      "Fizemos a nossa própria pizzaria sair de 0 a 400 mil em menos de 1 ano. Vamos entregar esse mesmo método pra você hoje. Estrutura 100% presencial da Alpha Assessoria.",
  },

  hero: {
    eyebrow: "Alpha's Pizzaria · nosso próprio case",
    title: [
      ["Fizemos a nossa pizzaria sair de ", false],
      ["0 a 400 mil", true],
      [" em menos de 1 ano.", false],
    ] as const,
    sub: "Agende uma chamada gratuita e descubra como podemos transformar seu marketing em uma máquina de vendas e novos pedidos.",
    // [antes, negrito]
    checks: [
      ["Marketing focado em ", "VENDAS"],
      ["Especialistas no ramo de ", "food"],
    ] as const,
    cta: "Quero aplicar esse método →",
  },

  form: {
    title: "Quero aplicar esse método",
    subtitle: "Preencha e um especialista da Alpha entra em contato.",
    submitLabel: "Quero aplicar esse método",
    sending: "Enviando...",
    // Mensagens do envio no servidor (mesmas da /01-lp). O WP não tem: lá o
    // webhook é "fire and forget"; aqui falha de envio pede para tentar de novo.
    errors: {
      webhook: "Não conseguimos enviar agora. Tente de novo em instantes.",
      rateLimited: "Recebemos seu cadastro há pouco. Tente novamente em {min} min.",
      validation: "Dados inválidos. Verifique o formulário.",
    },
  },

  episodios: {
    eyebrow: "A jornada, em vídeo",
    title: "Do zero aos 100 mil, filmamos tudo",
    sub: "Uma série de vídeos reais mostrando a Alpha's Pizzaria saindo do zero até ultrapassar R$100 mil de faturamento.",
    cardLabel: "Ver no Instagram",
    cardSub: "Alpha's Pizzaria",
    autoplayMs: 5000,
    // Capas em public/images/alphas-pizzaria/episodios/ep-NN.webp (9/16). Só as
    // listadas aqui são usadas (e conferidas no check-assets); as demais mostram
    // o fundo fosco com o ícone do Instagram. Vazio até as capas chegarem.
    covers: [] as readonly string[],
    // Ordem do WP: Episódio 1 a 15.
    items: [
      "https://www.instagram.com/reel/DR0Mx5Hknbi/",
      "https://www.instagram.com/reel/DR25jgGkReD/",
      "https://www.instagram.com/reel/DR5WwD0kX4M/",
      "https://www.instagram.com/reel/DR77IafDzUp/",
      "https://www.instagram.com/reel/DR-hUNoj_rT/",
      "https://www.instagram.com/reel/DSBFDb4Er6E/",
      "https://www.instagram.com/reel/DSDuawsEcGT/",
      "https://www.instagram.com/reel/DSGWZvMEXzf/",
      "https://www.instagram.com/reel/DSI9z96EX3i/",
      "https://www.instagram.com/reel/DSLm7cCDVYe/",
      "https://www.instagram.com/reel/DSN8cvlkd9A/",
      "https://www.instagram.com/reel/DSQldqiD3ch/",
      "https://www.instagram.com/reel/DSTEyCbkm7j/",
      "https://www.instagram.com/reel/DSVvYxVkfiC/",
      "https://www.instagram.com/reel/DSlPz4ZEZPw/",
    ],
  },

  entregaveis: {
    eyebrow: "O que você recebe",
    title: "O mesmo método que aplicamos na nossa própria pizzaria",
    sub: "Não é teoria de curso. É o sistema que usamos todo dia pra fazer a Alpha's Pizzaria vender mais.",
    cards: [
      {
        icon: "users",
        title: "Gestão e atendimento",
        text: "Um time da Alpha acompanha seu restaurante de perto, do primeiro contato ao suporte do dia a dia.",
      },
      {
        icon: "target",
        title: "Mídia paga",
        text: "Campanhas de Meta e Google Ads geridas e otimizadas pela nossa equipe, não por um robô.",
      },
      {
        icon: "store",
        title: "Soluções comerciais para restaurantes",
        text: "Estratégias pensadas pra aumentar ticket médio, recorrência e conversão de mesa, não só clique.",
      },
      {
        icon: "chart",
        title: "Relatórios e acompanhamento",
        text: "Você acompanha quanto entrou, quanto voltou e o retorno real de cada real investido, sem letra miúda.",
      },
    ],
    roi: {
      label: "O resultado que já provamos em nós mesmos",
      before: "De ",
      gold: "R$0 a R$400 mil",
      after: " em menos de 1 ano",
    },
  },

  faq: {
    eyebrow: "Perguntas frequentes",
    title: "Antes de falar com a gente",
    items: [
      {
        question: "A Alpha's Pizzaria é real ou só um case de marketing?",
        answer:
          "É real, é nossa. A Alpha's Pizzaria é operada pela própria Alpha, usando o mesmo método que vendemos pros nossos clientes de restaurante.",
      },
      {
        question: "Como funciona a gestão da Alpha?",
        answer:
          "Nossa equipe presencial assume o marketing do seu restaurante de ponta a ponta: tráfego pago, atendimento, estruturação comercial e relatório de resultado.",
      },
      {
        question: "Em quanto tempo eu vejo resultado?",
        answer: "A maioria dos restaurantes começa a ver impacto real entre 30 e 60 dias após o início da parceria.",
      },
      {
        question: "Preciso ter equipe de marketing própria?",
        answer: "Não. A Alpha assume a operação do zero, com sua própria equipe e estrutura.",
      },
      {
        question: "A Alpha atende qualquer segmento de restaurante?",
        answer:
          "Sim. Atendemos pizzarias, hamburguerias, churrascarias, restaurantes japoneses, cafeterias, doçarias e praticamente qualquer segmento gastronômico.",
      },
      {
        question: "Como sei se meu restaurante está pronto?",
        answer:
          "Como nosso trabalho é seletivo, o primeiro passo é conversar com nosso time. Preencha o formulário acima e agendamos um diagnóstico gratuito.",
      },
    ],
  },

  ctaFinal: {
    eyebrow: "Chega de deixar dinheiro na mesa",
    title: "Quer o mesmo resultado que a nossa própria pizzaria teve?",
    text: "Preencha o formulário e fale agora com um especialista da Alpha. Vaga limitada por região, por causa da nossa estrutura 100% presencial.",
    button: "Quero aplicar esse método →",
  },

  floatCta: "Quero esse resultado →",
} as const;

export function episodioCover(n: number) {
  return `/images/alphas-pizzaria/episodios/ep-${String(n).padStart(2, "0")}.webp`;
}
