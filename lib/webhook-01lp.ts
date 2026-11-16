import type { LeadFormData } from "@/lib/validation";
import { DISPOSTO_INVESTIR_VALUE, rotear01lp, type Tracking01lp } from "@/lib/lead-01lp";

// Lead da /01-lp vai para o n8n no MESMO formato que o form do Elementor
// (Formulario_Qualificacao, form_id e1b938c, página 3445) envia hoje pela ação
// Webhook com "advanced data": x-www-form-urlencoded com chaves PHP
//   form[id], form[name]
//   fields[<id>][id|type|title|value|raw_value|required]
//   meta[<chave>][title|value]
// mais "origem". Documentado no README.
//
// PROVISÓRIO: títulos dos campos ocultos, chaves/títulos de meta e o
// content-type ainda precisam ser conferidos com uma execução real do n8n.
// Tudo que pode mudar está nas tabelas FIELDS/META abaixo.

export const ORIGEM_01LP = "alpha-home-01-lp";
export const FORM_01LP = { id: "e1b938c", name: "Formulario_Qualificacao" } as const;

export type WebhookContext = {
  siteUrl: string;
  pageUrl: string;
  userAgent: string | null;
  ip: string | null;
  now: Date;
};

type FieldSpec = {
  id: string;
  type: string;
  title: string;
  required: boolean;
  value: (lead: LeadFormData, extra: Extra) => string;
};

type Extra = { tracking: Tracking01lp; redirectUrl: string; tipo: string; creationTime: string };

const t = (key: keyof Tracking01lp) => (_: LeadFormData, x: Extra) => x.tracking[key] ?? "";

// Ordem e ids iguais aos do form do WP (campos "html" do Elementor não entram no envio).
const FIELDS: FieldSpec[] = [
  { id: "name", type: "text", title: "Nome", required: true, value: (l) => l.nome },
  { id: "email", type: "email", title: "Email", required: true, value: (l) => l.email },
  { id: "field_bb2d15f", type: "tel", title: "Telefone", required: true, value: (l) => l.telefone },
  { id: "field_4169f50", type: "text", title: "Nome da Empresa", required: true, value: (l) => l.empresa },
  { id: "field_13a1e79", type: "select", title: "Qual o seu segmento?", required: true, value: (l) => l.segmento },
  { id: "faturamento", type: "select", title: "Faturamento", required: true, value: (l) => l.faturamento },
  { id: "cnpj", type: "text", title: "Seu CNPJ", required: false, value: (l) => l.cnpj ?? "" },
  {
    id: "disposto_investir",
    type: "select",
    title: "Você investiria R$4.000,00 por mês para vender mais?",
    required: false,
    value: (l) => (l.investiria ? DISPOSTO_INVESTIR_VALUE[l.investiria] : ""),
  },
  { id: "utm_source", type: "hidden", title: "utm_source", required: false, value: t("utm_source") },
  { id: "utm_campaign", type: "hidden", title: "utm_campaign", required: false, value: t("utm_campaign") },
  { id: "utm_medium", type: "hidden", title: "utm_medium", required: false, value: t("utm_medium") },
  { id: "utm_id", type: "hidden", title: "utm_id", required: false, value: t("utm_id") },
  { id: "utm_content", type: "hidden", title: "utm_content", required: false, value: t("utm_content") },
  { id: "utm_term", type: "hidden", title: "utm_term", required: false, value: t("utm_term") },
  { id: "fbclid", type: "hidden", title: "fbclid", required: false, value: t("fbclid") },
  { id: "gclid", type: "hidden", title: "gclid", required: false, value: t("gclid") },
  { id: "fbc", type: "hidden", title: "fbc", required: false, value: t("fbc") },
  { id: "gcl_aw", type: "hidden", title: "gcl_aw", required: false, value: t("gcl_aw") },
  { id: "creation_time", type: "hidden", title: "creation_time", required: false, value: (_, x) => x.creationTime },
  { id: "debug_full_url", type: "hidden", title: "debug_full_url", required: false, value: t("debug_full_url") },
  { id: "redirect_url", type: "hidden", title: "redirect_url", required: false, value: (_, x) => x.redirectUrl },
  { id: "tipo_lead", type: "hidden", title: "tipo_lead", required: false, value: (_, x) => x.tipo },
];

function formatDate(now: Date, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", ...opts }).format(now);
}

export type WebhookField = {
  id: string;
  type: string;
  title: string;
  value: string;
  raw_value: string;
  required: "0" | "1";
};

export type Webhook01lpPayload = {
  form: { id: string; name: string };
  fields: Record<string, WebhookField>;
  meta: Record<string, { title: string; value: string }>;
  origem: string;
};

export function buildWebhook01lpPayload(
  lead: LeadFormData,
  tracking: Tracking01lp,
  ctx: WebhookContext
): Webhook01lpPayload {
  const rota = rotear01lp(lead.faturamento, lead.investiria);
  const extra: Extra = {
    tracking,
    redirectUrl: `${ctx.siteUrl}/${rota.slug}`,
    tipo: rota.tipo,
    creationTime: String(Math.floor(ctx.now.getTime() / 1000)),
  };

  const fields: Record<string, WebhookField> = {};
  for (const f of FIELDS) {
    const value = f.value(lead, extra);
    fields[f.id] = { id: f.id, type: f.type, title: f.title, value, raw_value: value, required: f.required ? "1" : "0" };
  }

  return {
    form: { ...FORM_01LP },
    fields,
    meta: {
      date: { title: "Data", value: formatDate(ctx.now, { day: "numeric", month: "long", year: "numeric" }) },
      time: { title: "Hora", value: formatDate(ctx.now, { hour: "2-digit", minute: "2-digit" }) },
      page_url: { title: "URL da página", value: ctx.pageUrl },
      user_agent: { title: "Agente de usuário", value: ctx.userAgent ?? "" },
      remote_ip: { title: "IP remoto", value: ctx.ip ?? "" },
    },
    origem: ORIGEM_01LP,
  };
}

// Mesma serialização do wp_remote_post/http_build_query: chaves aninhadas com [].
export function encodeWebhookBody(payload: Webhook01lpPayload): URLSearchParams {
  const body = new URLSearchParams();
  const walk = (prefix: string, value: unknown) => {
    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) walk(prefix ? `${prefix}[${k}]` : k, v);
    } else {
      body.append(prefix, String(value ?? ""));
    }
  };
  walk("", payload);
  return body;
}

// httpStatus 0 = não houve resposta (env faltando, rede ou timeout).
export type WebhookResult = { ok: true; httpStatus: number } | { ok: false; httpStatus: number; reason: string };

// Logs só com status/motivo: nunca a URL (contém o token do n8n) nem o corpo.
export async function sendLeadToWebhook01lp(
  payload: Webhook01lpPayload,
  fetchImpl: typeof fetch = fetch,
  url: string | undefined = process.env.LEAD_WEBHOOK_URL_01LP
): Promise<WebhookResult> {
  if (!url) {
    console.error("[webhook-01lp] LEAD_WEBHOOK_URL_01LP não definida");
    return { ok: false, httpStatus: 0, reason: "webhook_not_configured" };
  }
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: encodeWebhookBody(payload).toString(),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[webhook-01lp] Webhook retornou ${res.status}`);
      return { ok: false, httpStatus: res.status, reason: `http_${res.status}` };
    }
    return { ok: true, httpStatus: res.status };
  } catch (err) {
    const reason = err instanceof Error ? err.name : "erro_desconhecido";
    console.error(`[webhook-01lp] Falha de rede ao chamar o webhook (${reason})`);
    return { ok: false, httpStatus: 0, reason };
  }
}
