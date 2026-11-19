import { contentPizzaria } from "@/lib/content-pizzaria";

// Partes comuns das LPs de POP (/pop-producao, /pop-expedicao, /pop-delivery),
// migradas das páginas do WP (mesma estrutura nas 3). O que muda em cada uma fica
// em lib/content-pop-*.ts. Textos literais do WP.

export const POP_SLUGS = ["pop-producao", "pop-expedicao", "pop-delivery"] as const;
export type PopSlug = (typeof POP_SLUGS)[number];

export function isPopSlug(value: unknown): value is PopSlug {
  return typeof value === "string" && (POP_SLUGS as readonly string[]).includes(value);
}

// Pós-envio: o WP manda para /raio-x-do-restaurante/ (obrigado comum às iscas), que
// troca a barra de confirmação conforme a isca. Aqui a isca vai em ?isca=.
export const RAIO_X_PATH = "/raio-x-do-restaurante";
export function raioXPath(slug: PopSlug) {
  return `${RAIO_X_PATH}?isca=isca-${slug}`;
}

// Âncora do form (os botões "Quero o POP de…" rolam até ele).
export const POP_FORM_ID = "formulario";

// Segmentos e faixas do form do WP. O rótulo é o do WP; o valor enviado ao CRM é o
// mesmo das LPs da pizzaria e da home (mesma ordem), para o comercial classificar
// igual.
const SEGMENTO_LABELS = [
  "Pizzarias",
  "Hamburguerias",
  "Restaurante comida brasileira",
  "Churrascaria/steakhouse",
  "Restaurante japonês",
  "Restaurante massas/italiano",
  "Restaurante comida árabe",
  "Açaí/sorveteria",
  "Cafeteria",
  "Doceria",
  "Gastrobar",
  "Outros",
] as const;

const FATURAMENTO_LABELS = [
  "Até 30 mil",
  "30–50 mil",
  "50–80 mil",
  "80–100 mil",
  "100–150 mil",
  "150–250 mil",
  "250–400 mil",
  "400–600 mil",
  "600 mil–1 milhão",
  "Mais de 1 milhão",
] as const;

const { fields: pzFields, errors: pzErrors } = contentPizzaria.form;

export const SEGMENTOS_POP = SEGMENTO_LABELS.map((label, i) => ({ label, value: pzFields.segmento.options[i] }));
export const FATURAMENTOS_POP = FATURAMENTO_LABELS.map((label, i) => ({ label, value: pzFields.faturamento.options[i] }));

export const popForm = {
  segmento: { label: "Qual é o seu segmento?", placeholder: pzFields.segmento.placeholder },
  faturamento: { label: "Quanto o seu restaurante fatura por mês?", placeholder: pzFields.faturamento.placeholder },
  cnpj: pzFields.cnpj,
  investiria: pzFields.investiria,
  contato: "Para onde a gente manda?",
  nome: { label: "Nome", placeholder: "Seu nome" },
  telefone: { label: "WhatsApp", placeholder: "(00) 00000-0000" },
  email: { label: "E-mail", placeholder: "voce@restaurante.com" },
  submit: "ENVIAR MEU POP",
  sending: "ENVIANDO...",
  nota: "O material chega no seu e-mail em seguida.",
  seguro: "Seus dados ficam com a Alpha. Sem spam.",
  errors: {
    // Envio ao CRM, rate limit e CNPJ: mesmos textos das outras LPs.
    ...pzErrors,
    // Mensagens do form do WP.
    nome: "Digite o seu nome.",
    telefone: "Digite um WhatsApp válido com DDD.",
    email: "Digite um e-mail válido.",
    segmento: "Selecione um segmento",
    faturamento: "Selecione uma faixa de faturamento",
    investiria: "Selecione uma opção",
  },
};

export const popShared = {
  topTag: "Bastidores · material gratuito",
  eyebrow: "Bastidores da Alpha's Pizzaria · POP gratuito",
  folhaTag: "Original da Alpha's",
  folhaAlt: "Cartaz original da Alpha's Pizzaria",
  pagina2Alt: "Segunda página do material",
  emailEyebrow: "O que chega no seu e-mail",
  arquivos: [
    { tipo: "PDF", cor: "#B3261E", titulo: "Original da Alpha's", texto: "O mesmo que está na parede da casa" },
    { tipo: "PPT", cor: "#C4502C", titulo: "Modelo editável", texto: "PowerPoint" },
    { tipo: "PDF", cor: "#B3261E", titulo: "Modelo editável", texto: "PDF para imprimir" },
  ],
  autor: {
    nome: "Ailton Cruz",
    cargo: ["Sócio-proprietário", "Alpha's Pizzaria"],
    foto: { src: "/images/pop/ailton-cruz.webp", alt: "Ailton Cruz, sócio-proprietário da Alpha's Pizzaria", width: 768, height: 816 },
    badge: { src: "/images/pop/alphas-pizzaria-badge.webp", alt: "Alpha's Pizzaria" },
  },
  footer: [
    "Alpha Assessoria · marketing e gestão para restaurantes · 2026",
    "Seus dados são usados só para enviar o material e falar com você.",
  ],
};

export type PopComandaRow = {
  label: string;
  value: string;
  tone?: "red" | "ok";
  big?: boolean;
  // Ícone depois do valor ("R$ ✓" / "R$ ✗"), como no WP.
  icon?: "sim" | "nao";
};

// [antes, destaque, depois]: o destaque é o trecho em amarelo/itálico do WP.
export type PopTitle = readonly [string, string, string?];

export type PopContent = {
  slug: PopSlug;
  meta: { title: string; description: string; ogImage: string };
  cta: string;
  hero: {
    image: string;
    title: PopTitle;
    // Tamanho do h1 no WP (classe "l" ou "xl").
    titleSize: "l" | "xl";
    sub: string;
    prova: string;
  };
  folhas: { capa: string; pagina2: string; selo?: string };
  problema: {
    title: PopTitle;
    paras: readonly string[];
    virada: string;
    comanda: {
      titulo: string;
      subtitulo: string;
      rows: readonly PopComandaRow[];
      total?: { label: string; value: string };
      nota?: string;
      carimbo?: string;
    };
  };
  muda: { title: PopTitle; itens: readonly (readonly [string, string])[] };
  email: { extras: readonly string[] };
  autor: {
    title: PopTitle;
    paras: readonly string[];
    stats: readonly (readonly [string, string])[];
    virada: string;
  };
};
