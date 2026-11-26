// Constantes da /alphas-pizzaria sem dependências (o form e o player importam
// daqui sem puxar o zod).

// Mesmas chaves do UTM_KEYS do script da página no WP, lidas da URL (fbp só do cookie
// _fbp). O CRM recebe utm_*, fbclid, fbc e fbp (lib/lead-constants.ts).
export const TRACKING_KEYS_PIZZARIA = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "fbc",
  "gcl_aw",
  "fbp",
] as const;

export type TrackingKeyPizzaria = (typeof TRACKING_KEYS_PIZZARIA)[number];
export type LeadTrackingPizzaria = Partial<Record<TrackingKeyPizzaria, string>>;

// First-touch da atribuição: vale 30 dias (mesmo padrão da /01-lp).
export const TRACKING_STORAGE_KEY_PIZZARIA = "alpha-pizzaria:first-touch";
export const TRACKING_TTL_MS_PIZZARIA = 30 * 24 * 60 * 60 * 1000;

// Única faixa que mostra (e exige) CNPJ e "investiria", como no WP.
export const FATURAMENTO_EXIGE_EXTRAS_PIZZARIA = "Até 30 mil";

// Libera o botão do obrigado aos 50% do vídeo (FRACAO_GATE do WP).
export const FRACAO_GATE_PIZZARIA = 0.5;
