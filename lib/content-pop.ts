import { contentPizzaria } from "@/lib/content-pizzaria";
import type { RateLimitScope } from "@/lib/rate-limit";

// Partes comuns das LPs de isca no padrão das POP (/pop-producao, /pop-expedicao,
// /pop-delivery, /ficha-tecnica, /cronograma-de-limpeza, /cardapio-que-vende e
// /calculadora-de-cmv), migradas das páginas do WP (mesmo template). O que muda em
// cada uma fica em lib/content-<slug>.ts. Textos literais do WP.

// Slug da rota → isca do WP (vai ao CRM em food/isca e escolhe o texto do obrigado) e escopo
// do rate limit. "calc": no WP o envio abria a /ferramenta-calculadora-cmv; aqui o
// obrigado mostra o botão "Abrir minha calculadora".
export const ISCA_LPS = {
  "pop-producao": { isca: "isca-pop-producao", scope: "pop-producao", calc: false },
  "pop-expedicao": { isca: "isca-pop-expedicao", scope: "pop-expedicao", calc: false },
  "pop-delivery": { isca: "isca-pop-delivery", scope: "pop-delivery", calc: false },
  "ficha-tecnica": { isca: "isca-ficha-tecnica", scope: "ficha-tecnica", calc: false },
  // No WP a isca do cronograma é "isca-pop-higienizacao" (mantida).
  "cronograma-de-limpeza": { isca: "isca-pop-higienizacao", scope: "cronograma-limpeza", calc: false },
  "cardapio-que-vende": { isca: "isca-cardapio", scope: "cardapio-que-vende", calc: false },
  "calculadora-de-cmv": { isca: "isca-cmv", scope: "calculadora-cmv", calc: true },
} as const satisfies Record<string, { isca: string; scope: RateLimitScope; calc: boolean }>;

export type IscaSlug = keyof typeof ISCA_LPS;
export const ISCA_SLUGS = Object.keys(ISCA_LPS) as IscaSlug[];
export const POP_SLUGS = ["pop-producao", "pop-expedicao", "pop-delivery"] as const;
export type PopSlug = IscaSlug;

export function isIscaSlug(value: unknown): value is IscaSlug {
  return typeof value === "string" && Object.hasOwn(ISCA_LPS, value);
}
export const isPopSlug = isIscaSlug;

// Pós-envio: o WP manda para /raio-x-do-restaurante/ (obrigado comum às iscas), que
// troca a barra de confirmação conforme a isca. Aqui a isca vai em ?isca=.
export const RAIO_X_PATH = "/raio-x-do-restaurante";
export function raioXPath(slug: IscaSlug) {
  const { isca, calc } = ISCA_LPS[slug];
  return `${RAIO_X_PATH}?isca=${isca}${calc ? "&calc=1" : ""}`;
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
  // Ícone junto do valor, como no WP: "after" ("R$ ✓"), "before" ("✓ assinado") ou só o ícone.
  icon?: "sim" | "nao";
  iconPos?: "after" | "before";
  // Valor riscado antes do valor (ex.: "R$ 25,00" riscado).
  strike?: string;
};

// [antes, destaque, depois]: o destaque é o trecho em amarelo/itálico do WP.
export type PopTitle = readonly [string, string, string?];

export type Arquivo = { tipo: string; cor: string; titulo: string; texto: string };

export type PopContent = {
  slug: IscaSlug;
  meta: { title: string; description: string; ogImage: string };
  cta: string;
  // Padrão: popShared.topTag / popShared.eyebrow.
  topTag?: string;
  eyebrow?: string;
  // Padrão: popForm.submit / popForm.nota.
  form?: { submit: string; nota: string };
  hero: {
    image: string;
    title: PopTitle;
    // Tamanho do h1 no WP (classe "l", "xl" ou nenhuma).
    titleSize: "" | "l" | "xl";
    // "loss": destaque em vermelho (classe tz-loss do WP).
    titleTone?: "loss";
    sub: string;
    prova: string;
  };
  // Papel do material: vai para "O que chega no seu e-mail".
  folhas?: { capa: string; pagina2: string; selo?: string; land?: boolean; capaAlt?: string; width?: number; height?: number };
  problema: {
    title: PopTitle;
    paras: readonly string[];
    virada: string;
    comanda: {
      titulo: string;
      subtitulo: string;
      rows: readonly PopComandaRow[];
      // Índice da linha antes da qual vai o separador tracejado (padrão: depois de todas).
      sepAntes?: number;
      total?: { label: string; value: string };
      nota?: string;
      carimbo?: string;
    };
  };
  muda: { title: PopTitle; itens: readonly (readonly [string, string])[] };
  email?: { arquivos?: readonly Arquivo[]; extras: readonly string[] };
  autor: {
    title: PopTitle;
    paras: readonly string[];
    stats: readonly (readonly [string, string])[];
    virada: string;
  };
};
