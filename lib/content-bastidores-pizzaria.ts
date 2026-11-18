// Textos da /lead-magnetic-bastidores-alphas-pizzaria e do obrigado dela, copiados
// literalmente das páginas do WP:
//   https://assessorialpha.com/lead-magnetic-bastidores-alphas-pizzaria/ (page-id 13210)
//   https://assessorialpha.com/obrigado-lm-bastidores-alphas-pizzaria/   (page-id 13215)
// Campos e opções do form são os mesmos da /alphas-pizzaria (contentPizzaria.form).

export const BASTIDORES_PATH = "/lead-magnetic-bastidores-alphas-pizzaria";
export const BASTIDORES_OBRIGADO_PATH = "/obrigado-lm-bastidores-alphas-pizzaria";

// Chave do sessionStorage do WP para o que a LP passa ao obrigado. Aqui guarda só o
// primeiro nome, para personalizar o aviso do e-mail (o envio do lead é no submit).
export const BASTIDORES_STORAGE_KEY = "leadMagnetBastidoresPizzaria";

export const contentBastidores = {
  meta: {
    title: "Bastidores da Alpha's Pizzaria: Como Chegamos a 27% de Margem | Alpha Assessoria",
    description:
      "Copie os processos operacionais que fizeram a Alpha's Pizzaria ter 27% de margem de lucro. Processos validados e 100% práticos pra aplicar no seu restaurante.",
  },

  hero: {
    eyebrow: "Bastidores da Alpha's Pizzaria",
    // [texto, destaque?]
    title: [
      ["Copie os processos", true],
      [" operacionais que fizeram a Alpha's Pizzaria ter ", false],
      ["27% de margem de lucro", true],
    ] as const,
    sub: "Replique processos validados, 100% práticos e aplicáveis no dia a dia que fizeram a nossa própria pizzaria lucrar acima da média do mercado faturando mais de 340 mil no 6º mês de operação.",
    cta: "Quero copiar esses processos",
  },

  form: {
    title: "Quero receber os processos",
    subtitle: "Preencha e receba o material no seu e-mail.",
    submitLabel: "Quero aumentar o lucro do meu restaurante →",
    sending: "Enviando...",
    success: "Recebemos seus dados! Redirecionando...",
  },

  problema: {
    eyebrow: "O problema real",
    title: "Descobrimos na pele que o maior problema do dono de restaurante é o lucro, não as vendas.",
    // [texto, negrito?]
    body1: [
      ["Criamos o nosso restaurante depois de ter atendido mais de 2.000 em todo o Brasil. Um dos relatos que mais ouvíamos ", false],
      ["depois de ter dobrado o faturamento do cliente", true],
      [" é que eles ", false],
      ["não viam a mesma diferença na última linha: o lucro das vendas.", true],
    ] as const,
    body2: "Quando fomos investigar o motivo eram sempre os mesmos problemas:",
    list: [
      "Não tinham controle do CMV",
      "Não tinham processo de produção",
      "Não tinham processos para evitar desperdício de alimentos",
      "Não tinham DRE",
    ],
    body3: "Tudo isso estava drenando o lucro na última linha.",
    body4:
      "Depois de ajustarmos esses pontos aumentamos até 20% de lucro dos nossos parceiros, que agora que possuem controle da operação estão visando a expansão da marca com reforma de restaurante, novas unidades e franquias.",
    cta: "Quero aumentar o lucro do meu restaurante →",
  },

  parada: {
    quote: [
      ["Faturamento é ego. ", false],
      ["Lucro é a realidade", true],
      [" do seu restaurante.", false],
    ] as const,
    body: [
      "O dono de restaurante que entende isso consegue parar de apagar incêndio operacional todo santo dia e finalmente realiza o sonho de se tornar um gestor do restaurante.",
      "Você vai poder viajar em paz, ter mais tempo com a família e aproveitar mais o próprio tempo no trabalho, tomando decisões mais estratégicas que vão expandir a marca.",
      "Mas isso só será possível depois de você ter processos validados e bem definidos, para que a equipe saiba sempre o que fazer em cada função.",
    ],
    cta: "Quero mudar a realidade do meu restaurante",
    photo: {
      src: "/images/bastidores/ailton-cruz.webp",
      alt: "Ailton Cruz, sócio operador da Alpha's Pizzaria",
      width: 1792,
      height: 1904,
    },
  },

  case: {
    eyebrow: "Prova real, não discurso de vendas",
    title: "Nós somos o nosso próprio case!",
    body1:
      "Antes de vender para você, validamos na nossa própria operação. Foram com esses processos que o Ailton Cruz, sócio operador da Alpha's Pizzaria, passou nessa aula que chegamos aos mais de R$340 mil por mês com 27% de lucro.",
    body2: "Clique no botão abaixo para você copiar e colar o passo a passo pra aumentar a margem do seu restaurante.",
    cta: "Quero aplicar",
  },

  obrigado: {
    meta: {
      title: "Replique o Método | Alpha's Pizzaria",
      description: "Descubra como aplicar os processos da Alpha's Pizzaria no seu restaurante.",
    },
    // {nome} = primeiro nome, quando a LP o deixou no navegador.
    emailNotice: "Mandamos o material pro seu e-mail. Verifique a caixa de entrada, promoções e o spam.",
    emailNoticeNome: "Mandamos o material pro seu e-mail, {nome}! Verifique a caixa de entrada, promoções e o spam.",
    title: "Replique o método que foi validado em nossa pizzaria e bata recorde de faturamento em 90 dias!",
    sub: "Clique no botão abaixo para o meu time te mostrar como faturamos 228k só no primeiro mês e explicar como podemos usar as mesmas alavancas para bombar o seu restaurante.",
    button: "Quero esse resultado pro meu restaurante",
    thanks: "Perfeito! Nosso time recebeu seu interesse e vai entrar em contato em breve.",
  },
} as const;
