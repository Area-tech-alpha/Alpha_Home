import {
  TRACKING_KEYS_PIZZARIA,
  type LeadTrackingPizzaria,
  type TrackingKeyPizzaria,
} from "@/lib/lead-pizzaria-constants";
import {
  calcularQualificacaoPizzaria,
  cnpjMascarado,
  dispostoInvestir,
  telefoneFormatoWP,
} from "@/lib/lead-pizzaria";
import type { LeadFormDataPizzaria } from "@/lib/validation-pizzaria";

// Payload igual ao do WP: a página 1 monta o objeto do lead e a página 2, no
// clique do botão liberado, faz `{ ...base, lead_sem_form, video_progresso,
// origem_confirmacao, page_url, confirmado_em }` e manda em JSON para o webhook.
// Num spread, uma chave que já existe na base fica na posição original com o
// valor novo: por isso page_url fica antes de referrer quando há lead, e no fim
// quando não há (lead que abriu a página 2 direto, sem passar pelo form).

export const ORIGEM_FORM_PIZZARIA = "LP VSL Alphas (Renam) - pagina 1";
export const ORIGEM_CONFIRMACAO_PIZZARIA = "LP VSL Alphas (Renam) - pagina 2 (video)";
export const VIDEO_PROGRESSO_PIZZARIA = "50%+";

type Utms = Record<TrackingKeyPizzaria, string>;

function utms(tracking: LeadTrackingPizzaria): Utms {
  const out = {} as Utms;
  for (const key of TRACKING_KEYS_PIZZARIA) out[key] = tracking[key] ?? "";
  return out;
}

export type PizzariaLeadInput = {
  lead: LeadFormDataPizzaria;
  // Atribuição da página 1 (first-touch + origem orgânica já resolvida no navegador).
  tracking: LeadTrackingPizzaria;
  referrer: string; // document.referrer da página 1
  formPreenchidoEm: string; // ISO, hora do envio do form na página 1
};

export type PizzariaConfirmInput = {
  pageUrl: string; // URL da página 2 (location.href no clique)
  // Só sem lead: atribuição da página 2 e o referrer dela.
  trackingFresh: LeadTrackingPizzaria;
  referrer: string;
};

export type WebhookPizzariaPayload = Record<string, string | boolean>;

export function buildWebhookPizzariaPayload(
  input: PizzariaLeadInput | null,
  confirm: PizzariaConfirmInput,
  ctx: { siteUrl: string; now: Date }
): WebhookPizzariaPayload {
  const base: WebhookPizzariaPayload = input ? leadBase(input, confirm.pageUrl, ctx.siteUrl) : semFormBase(confirm);
  return {
    ...base,
    lead_sem_form: !input,
    video_progresso: VIDEO_PROGRESSO_PIZZARIA,
    origem_confirmacao: ORIGEM_CONFIRMACAO_PIZZARIA,
    page_url: confirm.pageUrl,
    confirmado_em: ctx.now.toISOString(),
  };
}

function leadBase(input: PizzariaLeadInput, pageUrl: string, siteUrl: string): WebhookPizzariaPayload {
  const { lead } = input;
  const isAte30 = lead.faturamento === "Até 30 mil";
  const disposto = dispostoInvestir(lead.faturamento, lead.investiria);
  const qualificacao = calcularQualificacaoPizzaria(lead.faturamento, disposto);
  return {
    nome: lead.nome.trim(),
    email: lead.email.trim(),
    telefone: telefoneFormatoWP(lead.telefone),
    empresa: lead.empresa.trim(),
    segmento: lead.segmento,
    faturamento: lead.faturamento,
    disposto_investir: disposto,
    cnpj: isAte30 && lead.cnpj ? cnpjMascarado(lead.cnpj) : "",
    tipo_lead: qualificacao.tipo,
    redirect_url: `${siteUrl}/${qualificacao.slug}/`,
    ...utms(input.tracking),
    origem_form: ORIGEM_FORM_PIZZARIA,
    // Valor final = URL da página 2 (o spread da confirmação sobrescreve no lugar).
    page_url: pageUrl,
    referrer: input.referrer,
    form_preenchido_em: input.formPreenchidoEm,
  };
}

function semFormBase(confirm: PizzariaConfirmInput): WebhookPizzariaPayload {
  return {
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    segmento: "",
    faturamento: "",
    disposto_investir: "",
    cnpj: "",
    tipo_lead: "sem-form",
    redirect_url: "",
    origem_form: ORIGEM_FORM_PIZZARIA,
    referrer: confirm.referrer,
    ...utms(confirm.trackingFresh),
  };
}

// httpStatus 0 = não houve resposta (env faltando, rede ou timeout).
export type WebhookResult = { ok: true; httpStatus: number } | { ok: false; httpStatus: number; reason: string };

// Logs só com status/motivo: nunca a URL do webhook nem os dados do lead.
export async function sendLeadToWebhookPizzaria(
  payload: WebhookPizzariaPayload,
  fetchImpl: typeof fetch = fetch,
  url: string | undefined = process.env.LEAD_WEBHOOK_URL_PIZZARIA
): Promise<WebhookResult> {
  if (!url) {
    console.error("[webhook-pizzaria] LEAD_WEBHOOK_URL_PIZZARIA não definida");
    return { ok: false, httpStatus: 0, reason: "webhook_not_configured" };
  }
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[webhook-pizzaria] Webhook retornou ${res.status}`);
      return { ok: false, httpStatus: res.status, reason: `http_${res.status}` };
    }
    return { ok: true, httpStatus: res.status };
  } catch (err) {
    const reason = err instanceof Error ? err.name : "erro_desconhecido";
    console.error(`[webhook-pizzaria] Falha de rede ao chamar o webhook (${reason})`);
    return { ok: false, httpStatus: 0, reason };
  }
}
