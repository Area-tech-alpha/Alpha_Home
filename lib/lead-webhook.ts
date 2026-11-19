import { parsePhoneNumberFromString } from "libphonenumber-js";
import { FATURAMENTOS_POP, ISCA_LPS, SEGMENTOS_POP, type IscaSlug } from "@/lib/content-pop";
import { TZ_LEAD_FIELDS, WEBHOOK_UTM_KEYS, type TzLead } from "@/lib/lead-webhook-constants";

// Envio extra das LPs de isca para o n8n, além do CRM (que continua recebendo tudo).
// O body é o MESMO que o script do WP manda (mesmos campos, nomes e formatos), para
// não quebrar o fluxo do n8n:
// - LEAD_WEBHOOK_URL_ISCAS: lead do form (o n8n envia o material por e-mail).
// - LEAD_WEBHOOK_URL_RAIO_X: aceite do Raio-X no obrigado (tag "aceitou-raio-x").
// As URLs ficam só nas envs (nunca em código, log ou teste). Falha no webhook não
// bloqueia o lead nem o redirect: só registra o erro, sem a URL.

// - LEAD_WEBHOOK_URL_WORDPRESS_GERAL: lead da /nao-dependa-de-sorte (body em lib/lead-webhook-wp-geral.ts).
export type WebhookKind = "iscas" | "raio-x" | "wordpress-geral";
const ENV: Record<WebhookKind, string> = {
  iscas: "LEAD_WEBHOOK_URL_ISCAS",
  "raio-x": "LEAD_WEBHOOK_URL_RAIO_X",
  "wordpress-geral": "LEAD_WEBHOOK_URL_WORDPRESS_GERAL",
};

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function labelDe(lista: readonly { label: string; value: string }[], value: string) {
  return lista.find((o) => o.value === value)?.label ?? value;
}

// WhatsApp como o WP mostrava no campo ("(11) 98765-4321").
function whatsappMascara(telefone: string) {
  const p = parsePhoneNumberFromString(telefone);
  return p ? p.formatNational() : telefone;
}

export function buildTzLead(opts: {
  slug: IscaSlug;
  pageUrl: unknown;
  lead: { nome: string; email: string; telefone: string; segmento: string; faturamento: string };
  rawTracking?: unknown;
  now?: Date;
}): TzLead {
  const { isca } = ISCA_LPS[opts.slug];
  const t = opts.rawTracking && typeof opts.rawTracking === "object" ? (opts.rawTracking as Record<string, unknown>) : {};
  const lead: Record<string, string> = {
    isca,
    origem_pagina: opts.slug,
    page_url: str(opts.pageUrl).split("#")[0],
    nome: opts.lead.nome.trim(),
    telefone: opts.lead.telefone,
    whatsapp: whatsappMascara(opts.lead.telefone),
    email: opts.lead.email.trim().toLowerCase(),
    // O WP manda os rótulos dos botões do form ("30–50 mil", "Churrascaria/steakhouse").
    segmento: labelDe(SEGMENTOS_POP, opts.lead.segmento),
    faturamento: labelDe(FATURAMENTOS_POP, opts.lead.faturamento),
    enviado_em: (opts.now ?? new Date()).toISOString(),
  };
  for (const k of WEBHOOK_UTM_KEYS) lead[k] = str(t[k]);
  if (!lead.utm_campaign) lead.utm_campaign = isca;
  if (!lead.utm_id) lead.utm_id = "Leads";
  return lead as TzLead;
}

// Aceite do Raio-X: o WP copia o lead salvo no navegador e acrescenta tag, isca,
// utm_campaign, aceitou_em e page_url. Só envia se o lead tem telefone (sem contato
// não vai lead vazio pro comercial). Aqui só passam os campos do lead do WP.
export function buildRaioXBody(opts: { lead: unknown; isca: unknown; pageUrl: unknown; now?: Date }): Record<string, string> | null {
  const raw = opts.lead && typeof opts.lead === "object" ? (opts.lead as Record<string, unknown>) : null;
  if (!raw) return null;
  const dados: Record<string, string> = {};
  for (const k of TZ_LEAD_FIELDS) if (k in raw) dados[k] = str(raw[k]);
  if (!dados.telefone) return null;
  const isca = str(opts.isca, 80);
  dados.tag = "aceitou-raio-x";
  dados.isca = isca || dados.isca || "";
  dados.utm_campaign = isca || dados.utm_campaign || "";
  dados.aceitou_em = (opts.now ?? new Date()).toISOString();
  dados.page_url = str(opts.pageUrl).split("#")[0];
  return dados;
}

export async function postWebhook(
  kind: WebhookKind,
  body: unknown,
  fetchImpl: typeof fetch = fetch,
  url: string | undefined = process.env[ENV[kind]]
): Promise<{ ok: boolean }> {
  if (!url) {
    console.warn(`[webhook:${kind}] ${ENV[kind]} não definida; envio ao n8n ignorado`);
    return { ok: false };
  }
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`[webhook:${kind}] respondeu ${res.status}`);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error(`[webhook:${kind}] falha de rede (${err instanceof Error ? err.name : "erro"})`);
    return { ok: false };
  }
}
