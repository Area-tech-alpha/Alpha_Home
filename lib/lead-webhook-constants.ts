// Sem dependências (o form e o obrigado importam daqui sem puxar código de servidor).

// Chave do localStorage onde o WP guarda o lead da isca ("tzLead"), lido no obrigado
// para o aceite do Raio-X.
export const TZ_LEAD_KEY = "tzLead";

// UTMs que o script do WP manda ao n8n, nesta ordem (UTM = [...] do WP).
export const WEBHOOK_UTM_KEYS = ["utm_id", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

// Campos do lead da isca no WP, na ordem em que o script monta o objeto.
export const TZ_LEAD_FIELDS = [
  "isca",
  "origem_pagina",
  "page_url",
  "nome",
  "telefone",
  "whatsapp",
  "email",
  "segmento",
  "faturamento",
  "enviado_em",
  ...WEBHOOK_UTM_KEYS,
] as const;

export type TzLead = Record<(typeof TZ_LEAD_FIELDS)[number], string>;
