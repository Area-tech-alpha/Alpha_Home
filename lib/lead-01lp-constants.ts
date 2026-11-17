// Constantes da /01-lp sem dependências (o form importa daqui sem puxar o zod).

// Mesmos campos ocultos de atribuição do form do WP (00-lp), lidos no navegador
// em first-touch. creation_time e debug_full_url são gerados no envio.
export const TRACKING_KEYS_01LP = [
  "utm_source",
  "utm_campaign",
  "utm_medium",
  "utm_id",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "fbc",
  "gcl_aw",
] as const;

export type TrackingKey01lp = (typeof TRACKING_KEYS_01LP)[number];
export type LeadTracking01lp = Partial<Record<TrackingKey01lp, string>>;

export const TRACKING_STORAGE_KEY_01LP = "alpha-01lp:first-touch";
// First-touch vale por 30 dias; depois disso uma nova visita com UTM substitui.
export const TRACKING_TTL_MS_01LP = 30 * 24 * 60 * 60 * 1000;

// Única faixa de faturamento que mostra (e exige) CNPJ e "investiria", como no WP.
export const FATURAMENTO_EXIGE_EXTRAS_01LP = "Até 30 mil";
