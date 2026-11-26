// Sem dependências (o form e o obrigado importam daqui sem puxar código de servidor).

// Chave do localStorage onde fica o lead da isca ("tzLead", mesmo nome do WP), lido no
// obrigado para o aceite do Raio-X.
export const TZ_LEAD_KEY = "tzLead";

// UTMs que seguem com o lead da isca, nesta ordem.
export const TZ_UTM_KEYS = ["utm_id", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

// Campos do lead da isca: o corpo de POST /external/lead-intake/food/isca (lib/crm.ts) e o
// que fica no navegador para o aceite do Raio-X (food/raio-x). Sem "whatsapp" com máscara
// nacional: o CRM lê o telefone em E.164, e número estrangeiro mascarado (menos de 10
// dígitos) seria recusado pelo filtro de segurança.
export const TZ_LEAD_FIELDS = [
  "isca",
  "origem_pagina",
  "page_url",
  "nome",
  "telefone",
  "email",
  "segmento",
  "faturamento",
  "enviado_em",
  ...TZ_UTM_KEYS,
] as const;

export type TzLead = Record<(typeof TZ_LEAD_FIELDS)[number], string>;
