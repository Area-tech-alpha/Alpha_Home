// Textos e mídias da /alphas-pizzaria e do obrigado dela, copiados literalmente
// das páginas do WP:
//   https://assessorialpha.com/alphas-pizzaria-vsl/          (page-id 13930)
//   https://assessorialpha.com/obrigado-vsl-alphas-pizzaria/ (page-id 13950)

export const contentPizzaria = {
  meta: {
    title: "Alpha's Pizzaria: a estrutura que fez sair de 0 a R$228 mil, de graça",
    // O WP não tem meta description na página 1; texto do subtítulo do hero.
    description:
      "Preencha o formulário ao lado, assista o vídeo até a metade e a gente te entrega a estrutura completa, sem custo.",
  },

  logo: { src: "/images/logo-alpha.png", alt: "Alpha Assessoria", width: 764, height: 247, href: "https://assessorialpha.com" },

  hero: {
    background: {
      src: "/images/alphas-pizzaria/hero.webp",
      alt: "Alpha's Pizzaria, case próprio da Alpha Assessoria",
      width: 1086,
      height: 1448,
    },
    eyebrow: "Alpha's Pizzaria · estrutura liberada",
    // [texto, destaque?]: destaque = gradiente amarelo (.gold-text) com "respiração".
    title: [
      ["Vamos liberar a estrutura que fez a Alpha's Pizzaria sair de ", false],
      ["0 a mais de R$228 mil", true],
      [" de faturamento. ", false],
      ["De graça.", true],
    ] as const,
    sub: "Preencha o formulário ao lado, assista o vídeo até a metade e a gente te entrega a estrutura completa, sem custo.",
    // [antes, negrito, depois]
    checks: [
      ["O mesmo sistema que roda na ", "nossa própria pizzaria", ""],
      ["Sem pegadinha, sem cobrança pra acessar", "", ""],
      ["Feito pra restaurante e food service", "", ""],
    ] as const,
    trust: [
      { value: "R$228 mil", label: "faturamento gerado" },
      { value: "< 1 ano", label: "do zero ao resultado" },
      { value: "R$0", label: "pra receber a estrutura" },
    ],
  },

  form: {
    title: "Preencha para liberar a estrutura",
    subtitle: "Depois de enviar, você vai direto para o vídeo com a estrutura.",
    submitLabel: "Quero a estrutura de graça",
    sending: "Enviando...",
    note: "Seus dados vão só para o time da Alpha. Nada de spam.",
    fields: {
      nome: { label: "Nome", placeholder: "Seu nome" },
      email: { label: "E-mail", placeholder: "Seu melhor e-mail" },
      telefone: { label: "Telefone", placeholder: "(00) 00000-0000" },
      empresa: { label: "Empresa", placeholder: "Nome da empresa" },
      segmento: {
        label: "Segmento",
        placeholder: "Selecionar segmento",
        // value = o que o WP manda no payload; label = o que aparece.
        options: [
          { value: "pizzarias", label: "Pizzarias" },
          { value: "hamburguerias", label: "Hamburguerias" },
          { value: "comida-brasileira", label: "Restaurante comida brasileira" },
          { value: "churrascaria", label: "Churrascaria steakhouse" },
          { value: "japones", label: "Restaurante japonês" },
          { value: "massas-italiano", label: "Restaurante massas italiano" },
          { value: "comida-arabe", label: "Restaurante comida árabe" },
          { value: "acai-sorveteria", label: "Açaí / sorveteria" },
          { value: "cafeteria", label: "Cafeteria" },
          { value: "doceria", label: "Doceria" },
          { value: "gastrobar", label: "Gastrobar" },
          { value: "outros", label: "Outros" },
        ],
      },
      faturamento: {
        label: "Faturamento atual",
        placeholder: "Selecionar",
        // O payload do WP leva o rótulo (FATURAMENTO_LABELS), não o value do select.
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
      cnpj: { label: "CNPJ", placeholder: "00.000.000/0000-00" },
      investiria: {
        label: "Você investiria R$4.000 por mês para vender mais?",
        placeholder: "Selecionar",
        options: ["Sim", "Não"],
      },
    },
    errors: {
      // Mesmas mensagens do WP para telefone e CNPJ.
      telefone: "Telefone inválido, confira o número.",
      cnpj: "CNPJ inválido, confira o número.",
    },
  },

  depoimentos: {
    eyebrow: "Quem já usa a estrutura",
    title: "Donos de restaurante que trocaram like por mesa cheia",
    sub: "Depoimentos reais de clientes Alpha. Toque no card para assistir.",
    badge: "Cliente Alpha",
    role: "Restaurante parceiro",
    autoplayMs: 5000,
    // Vídeos em public/videos/depoimento-<slug>.mp4 + -poster.jpg (os 6 que a
    // home já usava são os mesmos arquivos). Mesma ordem do WP.
    items: [
      { slug: "pizzaria-cheffao", name: "Pizzaria Cheffão" },
      { slug: "kallebe-pizzaria-kallebe", name: "Kallebe · Pizzaria Kallebe" },
      { slug: "isa-imperio-da-boa-pizza", name: "Isa · Império da Boa Pizza" },
      { slug: "leoneu-pizza-do-leo", name: "Leoneu · Pizza do Léo" },
      { slug: "ebenezer-pizzaria-laura-e-felipe", name: "Ebenezer · Pizzaria Laura e Felipe" },
      { slug: "leo-pizzaria-gra-fina", name: "Léo · Pizzaria Grã Fina" },
      { slug: "allan-di-florenca", name: "Allan · Di Florença" },
      { slug: "menu-confianca", name: "Menu Confiança" },
      { slug: "madruga-lanches", name: "Madruga Lanches" },
      { slug: "joao-brasa-burguer", name: "João · Brasa Burguer" },
      { slug: "keyla-lendarios", name: "Keyla · Lendários" },
      { slug: "arthur-oh-my-dog", name: "Arthur · Oh My Dog" },
      { slug: "rodrigo-pampa-dog", name: "Rodrigo · Pampa Dog" },
      { slug: "trumans-burguers", name: "Truman's Burguers" },
    ],
  },

  faq: {
    eyebrow: "Perguntas frequentes",
    title: "Antes de preencher",
    items: [
      {
        question: "A estrutura é paga mesmo?",
        answer:
          "Não. Você recebe de graça depois de assistir o vídeo até a metade. É o mesmo sistema que roda na Alpha's Pizzaria.",
      },
      {
        question: "A Alpha's Pizzaria é real ou é só um case?",
        answer: "É real e é nossa. A Alpha opera a pizzaria com o mesmo método que está liberando aqui.",
      },
      {
        question: "Serve pro meu segmento?",
        answer:
          "A estrutura foi feita pra restaurante e food service em geral: pizzaria, hamburgueria, japonês, açaí, cafeteria, doceria e afins.",
      },
      {
        question: "O que acontece depois que eu envio?",
        answer:
          "Você vai direto para uma página com o vídeo. Assistindo até a metade, libera o botão para confirmar. Aí o nosso time entra em contato com a estrutura.",
      },
    ],
  },

  footer: { copyright: "© 2026 Alpha Assessoria. Todos os direitos reservados." },
  floatCta: "Quero a estrutura de graça",

  obrigado: {
    meta: {
      title: "Assista o vídeo e libere o PDF | Alpha's Pizzaria",
      description:
        "Assista o vídeo até a metade para liberar o PDF grátis com a estrutura completa e falar direto com o time da Alpha.",
    },
    eyebrow: "Falta pouco",
    title: [
      ["Assista até a metade pra baixar o ", false],
      ["PDF", true],
      [" e falar com o nosso time", false],
    ] as const,
    sub: "O vídeo começa sozinho. Quando você chegar na metade, o botão abaixo libera.",
    video: {
      src: "/videos/alphas-pizzaria-vsl.mp4",
      poster: "/videos/alphas-pizzaria-vsl-poster.jpg",
      // DURACAO_VIDEO_SEGUNDOS do WP (4:52): só para o texto "Libera em m:ss";
      // o progresso real vem do próprio <video>.
      durationSeconds: 292,
    },
    gate: {
      waiting: "O vídeo vai começar em instantes.",
      // "Libera em <b>m:ss</b>"
      countdown: "Libera em",
      done: ["Liberado!", " Clique abaixo pra baixar a estrutura."],
      preview: ["Preview:", " botão liberado sem gate (parâmetro ?preview=liberado)."],
    },
    sound: {
      overlay: "Clique para ativar o som",
      mute: "Desativar o som",
      unmute: "Ativar o som",
      volume: "Volume",
    },
    button: "Baixar a estrutura em PDF",
    sending: "Enviando...",
    buttonSub: "Ao clicar, o time da Alpha recebe seus dados e você é direcionado pro PDF.",
    // PDF_URL do WP: para onde o lead vai depois do clique (link, não embed).
    pdfUrl: "https://assessorialpha.com/wp-content/uploads/2026/09/Playbook-Cardapio-Digital-Alpha.pdf",
  },
} as const;

export function depoimentoVideo(slug: string) {
  return { src: `/videos/depoimento-${slug}.mp4`, poster: `/videos/depoimento-${slug}-poster.jpg` };
}
