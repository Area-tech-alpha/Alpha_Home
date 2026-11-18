export const LMVSL_PATH = "/lead-magnetic-vsl";
export const LMVSL_OBRIGADO_PATH = "/obrigado-lm-vsl";

export const SEGMENTOS_LMVSL = [
  "Pizzarias",
  "Hamburguerias",
  "Churrascarias / Steakhouses",
  "Restaurante Japonês / asiáticos",
  "Restaurante de massas e comida italiana",
  "Restaurante de comidas brasileiras",
  "Outros",
] as const;

export const FATURAMENTOS_LMVSL = [
  "Até 30 mil",
  "30 mil até 50 mil",
  "50 mil até 80 mil",
  "80 mil até 100 mil",
  "100 mil até 150 mil",
  "150 mil até 250 mil",
  "250 mil até 400 mil",
  "400 mil até 600 mil",
  "600 mil até 1 milhão",
  "Mais de 1 milhão",
] as const;

export const contentLeadMagneticVsl = {
  meta: {
    title: "Estrutura de Cardápio Digital que Já Vendeu R$ 500 Milhões | Alpha",
    description:
      "Copie e cole a estrutura do cardápio digital validada em mais de 2.000 restaurantes.",
  },
  hero: {
    titleBefore: "Copie e cole a estrutura do cardápio digital que ",
    titleBold: "já vendeu R$ 500 milhões",
    sub:
      "Esse modelo já foi validado e aprovado em mais de 2.000 restaurantes de todos os nichos. Inclusive, é o mesmo que usamos na nossa própria pizzaria!",
    cta: "Quero receber esse material!",
  },
  problema: {
    titleBefore: "Você está perdendo clientes ",
    titleGold: "dentro do próprio cardápio.",
    sub:
      "Todos os dias, dezenas de clientes abrem seu cardápio digital, hesitam por alguns segundos e fecham. O problema quase nunca é o produto. É o que acontece na tela.",
    cards: [
      ["Cardápio confuso", "O cliente se perde e fecha antes de pedir."],
      ["Falta de organização", "Categorias bagunçadas matam o impulso de compra."],
      ["Fotos ruins (ou nenhuma foto)", "Sem apetite visual, não tem venda."],
      ["Descrições fracas", "Texto genérico não desperta desejo nem justifica preço."],
      ["Sem estratégia de combos", "Você perde ticket médio em cada pedido."],
      ["Excesso de opções", "Indecisão paralisa o cliente e ele desiste."],
    ] as const,
  },
  resultados: {
    titleBefore: "Veja os resultados ",
    titleGold: "de quem leu e aplicou nossa metodologia",
    slides: [
      "/images/lead-magnetic-vsl/slide-1.webp",
      "/images/lead-magnetic-vsl/slide-2.webp",
      "/images/lead-magnetic-vsl/slide-3.webp",
    ],
  },
  aprender: {
    titleBefore: "O que você ",
    titleGold: "vai aprender",
    sub: "Estratégias práticas, diretas e aplicáveis hoje no seu cardápio sem teoria, sem enrolação.",
    cards: [
      ["Categorias que aumentam o ticket médio", "Estruture o cardápio para o cliente comprar mais a cada pedido."],
      ["Gatilhos visuais que disparam o impulso", "Use ordem, destaque e escassez para acelerar a decisão."],
      ["Fotos e descrições que vendem sozinhas", "O que mostrar, o que esconder e como descrever cada item."],
      ["Combos e upsell automático", "Monte ofertas que o próprio cardápio vende no piloto automático."],
      ["Os erros dos 10 segundos", "Descubra o que faz o cliente fechar o cardápio sem pedir."],
      ["Visitas viram pedidos", "Reduza o abandono e aumente a taxa de conversão final."],
    ] as const,
  },
  finalCta: {
    titleBefore: "Transforme seu cardápio digital em uma ",
    titleGold: "máquina de vendas",
    sub: "Linguagem simples, aplicação imediata. Comece a ver resultado já na próxima semana sem precisar trocar de plataforma.",
    note: "100% gratuito. Sem cadastro complicado. Acesso imediato.",
    benefits: ["+2.000 restaurantes", "Leitura em 15 min", "PDF para celular"],
  },
  footer: "2025 © Assessoria Alpha. Todos os direitos reservados",
  form: {
    fields: {
      nome: { label: "Nome", placeholder: "Seu nome" },
      email: { label: "E-mail", placeholder: "Seu melhor e-mail" },
      telefone: { label: "Telefone", placeholder: "Telefone" },
      empresa: { label: "Empresa", placeholder: "Nome da empresa" },
      segmento: { label: "Segmento", placeholder: "Qual seu segmento?" },
      faturamento: { label: "Faturamento", placeholder: "Selecionar" },
    },
    submitLabel: "Me envie esse modelo!",
  },
  obrigado: {
    meta: {
      title: "Obrigado - Modelo de Cardápio | Alpha",
      description: "Material enviado e consultoria gratuita para o seu restaurante.",
    },
    email:
      "Mandamos o material pro seu e-mail. Verifique a caixa de entrada, promoções e o spam.",
    title:
      "Você ganhou uma consultoria completa e personalizada para o seu restaurante vender mais e melhor!",
    sub:
      "Clique no botão abaixo para marcar a consultoria, meu time vai te chamar em até 2 minutos!",
    button: "Quero minha consultoria gratuita",
    thanks: "Entraremos em contato em breve!",
  },
} as const;
