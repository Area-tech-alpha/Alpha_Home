// Conteúdo da /01-lp: textos literais da página WP /00-lp/ (ID 3445) e das
// páginas de obrigado. Nos títulos, **trecho** = peso 800 (como os <span> do
// WP) e ==trecho== = amarelo #FFA902; nos parágrafos, **trecho** = branco.

export const content01lp = {
  meta: {
    title: "Marketing para Restaurantes | Assessoria Alpha",
    description:
      "Aumente o movimento do seu restaurante com estratégias de marketing feitas sob medida. Gestão de redes sociais, tráfego pago e cardápio digital.",
    ogImage: { src: "/images/01-lp/og-01-lp.png", width: 590, height: 292 },
  },

  logo: { src: "/images/logo-alpha.png", alt: "Alpha Assessoria", width: 764, height: 247 },
  // Logos da 00-lp: Logo-Alpha.png no hero e ALPHAA.svg no rodapé.
  heroLogo: { src: "/images/01-lp/logo-hero.webp", alt: "Alpha Assessoria", width: 513, height: 147 },
  footerLogo: { src: "/images/01-lp/logo-rodape.svg", alt: "Alpha Assessoria", width: 195, height: 53 },

  // Âncora do formulário: todos os CTAs da página rolam até aqui.
  formAnchor: "#formulario",

  hero: {
    titleLine1: "Fazemos o seu restaurante vender R$ 15 a cada",
    titleLine2: "R$ 1 investido em tráfego pago",
    subtitle:
      "Agende uma chamada gratuita e descubra como podemos transformar seu marketing em uma máquina de vendas e novos pedidos.",
    checks: ["Marketing focado em VENDAS", "Especialistas no ramo de food"],
    cta: "Quero resultados como esse",
    // Fundos do hero do WP (hero-nova-00-lp.webp e background-mobile.png).
    background: "/images/01-lp/hero-fundo.webp",
    backgroundMobile: "/images/01-lp/hero-fundo-mobile.webp",
  },

  form: {
    fields: {
      nome: { label: "Nome", placeholder: "Seu nome" },
      email: { label: "Email", placeholder: "Seu melhor e-mail" },
      telefone: { label: "Telefone", placeholder: "Telefone" },
      empresa: { label: "Nome da Empresa", placeholder: "Nome da empresa" },
      segmento: {
        label: "Selecionar segmento",
        placeholder: "Selecionar",
        options: [
          "Pizzarias",
          "Hamburguerias",
          "Restaurante comida brasileira",
          "Churrascaria steakhouse",
          "Restaurante japonês",
          "Restaurante massas italiano",
          "Restaurante comida árabe",
          "Açaí / sorveteria",
          "Cafeteria",
          "Doceria",
          "Gastrobar",
          "Outros",
        ],
      },
      faturamento: {
        label: "Coloque seu faturamento atual",
        placeholder: "Selecionar",
        options: [
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
        ],
      },
      cnpj: { label: "Seu CNPJ", placeholder: "Seu CNPJ" },
      investiria: {
        label: "Você Investiria R$4.000 por mês para vender mais?",
        options: ["Sim", "Não"],
      },
    },
    submitLabel: "Quero vender mais investindo menos",
    sending: "Enviando...",
    errors: {
      webhook: "Não conseguimos enviar agora. Tente de novo em instantes.",
      validation: "Dados inválidos. Verifique o formulário.",
      // {min} = minutos até liberar (lib/rate-limit.ts).
      rateLimited: "Recebemos seu cadastro há pouco. Tente novamente em {min} min.",
    },
  },

  numeros: ["+600 CLIENTES ATIVOS", "+500M EM VENDAS PARA OS NOSSOS CLIENTES", "+5 ANOS DE EXPERIÊNCIA"],

  depoimentos: {
    eyebrow: "👤 Depoimentos",
    title: "**Mais de ==2.000== restaurantes** com **resultados**. Isso é **==Alpha==**.",
    // Mesmos Shorts da 00-lp; posters locais já usados na home.
    shorts: ["5A264VtPKEs", "aoDx_HTLaWA", "oSDQUXjzd7Y"],
    shortLabel: "Depoimento de cliente Alpha",
  },

  quemSomos: {
    eyebrow: "Quem somos",
    title: "**Líder** em **marketing gastronômico** e parceira do **seu sucesso**.",
    paragraphs: [
      "Na **Alpha Assessoria**, não somos apenas uma agência; somos a **maior assessoria de marketing especializada em restaurantes da América Latina**. Nascemos da paixão por transformar negócios gastronômicos, elevando-os a um novo patamar de sucesso e reconhecimento.",
      "Com uma **estrutura 100% presencial** e uma **equipe de mais de 80 profissionais** altamente qualificados, a Alpha Assessoria é a parceira estratégica que seu restaurante precisa.",
      "Nosso time multidisciplinar, composto por gestores de tráfego, designers e **especialistas em marketing digital,** trabalha em sinergia para garantir que cada aspecto da sua presença online e offline seja otimizado.",
    ],
    // Composição "Time Alpha / Escritório / Nossa cultura" (Imagem2-1.png do WP).
    image: {
      src: "/images/01-lp/quem-somos-fotos.webp",
      alt: "Fotos da Alpha: Time Alpha, Escritório e Nossa cultura",
      width: 468,
      height: 1069,
    },
  },

  metodo: {
    eyebrow: "O Método Alpha",
    title: "Existe um **método comprovado** para que seu restaurante **nunca pare** de **vender**",
    subtitle: "Se você seguir, irá manter seu negócio **faturando todos os dias.**",
    // Etapas escritas no diagrama (2-1.png do WP); "Monetização" é o selo flutuante.
    labels: ["Engajamento", "Retenção", "Ativação", "Aquisição", "Indicação"],
    badge: "Monetização",
    rotulos: { src: "/images/01-lp/metodo-rotulos.webp", width: 1187, height: 733 },
    video: { src: "/videos/01-lp-metodo.mp4", poster: "/images/01-lp/metodo-poster.webp", width: 1166, height: 720 },
  },

  servicos: {
    eyebrow: "O que fazemos?",
    title: "A **Assessoria Alpha** estrutura o marketing do seu restaurante com base na sua **necessidade**",
    // Ordem e nomes (alt) dos cards do carrossel do WP; autoplay de 5 s como lá.
    autoplayMs: 5000,
    cards: [
      { src: "/images/01-lp/servicos/acompanhamento.webp", alt: "Acompanhamento" },
      { src: "/images/01-lp/servicos/cardapio-digital.webp", alt: "Cardápio Digital" },
      { src: "/images/01-lp/servicos/disparo-de-mensagens.webp", alt: "Disparo de Mensagens Inteligente" },
      { src: "/images/01-lp/servicos/gestao-e-atendimento.webp", alt: "Gestão e Atendimento" },
      { src: "/images/01-lp/servicos/midia-paga.webp", alt: "Mídia Paga" },
      { src: "/images/01-lp/servicos/solucoes-comerciais.webp", alt: "Soluções Comerciais" },
      { src: "/images/01-lp/servicos/videos.webp", alt: "Vídeos" },
    ],
    cardWidth: 1280,
    cardHeight: 755,
  },

  planos: {
    eyebrow: "Planos personalizados",
    title: "Você **escolhe** a **solução certa** para a fase que seu restaurante **vive hoje**.",
    text: "Oferecemos nossos serviços por **planos flexíveis.** Você escolhe **conforme sua condição atual.**\nO mais importante é continuar apostando em estratégias que trazem resultado.",
    image: { src: "/images/01-lp/planos.webp", alt: "", width: 556, height: 499 },
  },

  time: {
    eyebrow: "Receba um time exclusivo",
    title: "A **Assessoria Alpha** estrutura o marketing do seu restaurante com base na sua **necessidade**",
    text: "Tenha um time de especialistas ao seu lado ou terceirize totalmente seu marketing e setor comercial com a Alpha. Sem dor de cabeça com contratações, gestão de equipe, riscos trabalhistas ou burocracias você foca no seu restaurante, e a gente foca em fazer ele crescer.",
    cta: "Quero mais informações",
    online: "Especialistas online agora",
  },

  faq: {
    title: "Perguntas frequentes",
    icon: "/images/01-lp/faq-icone.webp",
    subtitle: "Ficou com alguma dúvida sobre a Alpha? Talvez ela esteja aqui.",
    items: [
      {
        question: "O que exatamente a Alpha faz?",
        answer:
          "Somos uma assessoria especializada em marketing gastronômico. Ajudamos restaurantes, pizzarias, hamburguerias e negócios de alimentação a vender mais por meio de estratégias como tráfego pago, gestão de iFood, disparo de mensagens, criação de criativos e estruturação do comercial.",
      },
      {
        question: "Posso cancelar quando quiser?",
        answer: "Sim, você pode cancelar sua assinatura a qualquer momento.",
      },
      {
        question: "Em quanto tempo vou ver resultados?",
        answer:
          "Depende do estágio atual do seu negócio, estrutura interna e investimento. Mas, na maioria dos casos, nossos clientes começam a sentir o impacto positivo nas vendas em 30 a 60 dias.",
      },
      {
        question: "Vocês atendem qualquer tipo de restaurante?",
        answer:
          "Atendemos desde pequenas operações até grandes redes, desde que estejam dispostas a seguir um plano estratégico de crescimento. Inclusive, temos um núcleo especializado para negócios que faturam acima de R$200 mil/mês: o Alpha X.",
      },
      {
        question: "A Alpha cuida do meu Instagram e redes sociais?",
        answer:
          "Sim, mas com foco em performance. Não somos uma empresa de “post bonitinho”. Nosso objetivo é transformar conteúdo e anúncios em vendas reais. Se não gerar resultado, não faz sentido estar ali.",
      },
    ],
  },

  footer: {
    // No WP o rótulo do 2º ícone diz "Tiktok", mas o link é o LinkedIn.
    socials: [
      { label: "Instagram", href: "https://www.instagram.com/assessorialpha/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/assessoria-alpha/" },
    ],
    // {ano} = ano corrente (no WP: "2025 © ...").
    copyright: "{ano} © Assessoria Alpha. CNPJ: 48.684.183/0001-38",
  },

  obrigado: {
    title: "Cadastro",
    titleHighlight: "Concluído!",
    text: "Nos próximos minutos, o nosso time de especialistas entrará em contato com você para entender melhor o seu negócio e saber se realmente podemos te ajudar a acelerar suas vendas. Por enquanto conheça nossa assessoria, através do vídeo abaixo:",
    video: {
      id: "V6NgxcCfo6A",
      title: "Conheça a Assessoria Alpha: Como funciona nossa operação",
      poster: "/images/01-lp/video-V6NgxcCfo6A.webp",
    },
    back: { label: "VOLTAR AO INÍCIO", href: "/01-lp" },
    copyright: "{ano} © Assessoria Alpha. Todos os direitos reservados.",
  },

  // TODO(Max): texto provisório, aguardando Max. A /agradecimento do WP está
  // quebrada (mostra o template "Esse artigo não existe"). Lead desqualificado:
  // sem promessa de contato e sem vídeo.
  agradecimento: {
    title: "Cadastro",
    titleHighlight: "Concluído!",
  },
};

export type Content01lp = typeof content01lp;
