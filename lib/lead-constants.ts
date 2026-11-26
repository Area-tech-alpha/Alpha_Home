// Constantes do form sem dependências: o componente do form importa daqui para
// não puxar o zod no carregamento da página.
export const FATURAMENTO_EXIGE_EXTRAS = "Até 30 mil";

// Atribuição que segue com o lead para a entrada de leads do CRM (food/*). fbc e fbp
// vêm dos cookies _fbc/_fbp (ou o fbc é montado do fbclid); só dado de atribuição,
// nenhuma página carrega pixel.
export const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
  "fbc",
  "fbp",
] as const;

export type LeadTracking = Partial<Record<(typeof TRACKING_KEYS)[number], string>>;
