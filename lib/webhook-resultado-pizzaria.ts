import { TRACKING_KEYS_PIZZARIA, type LeadTrackingPizzaria, type TrackingKeyPizzaria } from "@/lib/lead-pizzaria-constants";
import { calcularQualificacaoPizzaria, cnpjMascarado, dispostoInvestir, telefoneFormatoWP } from "@/lib/lead-pizzaria";
import type { LeadFormDataPizzaria } from "@/lib/validation-pizzaria";
import type { WebhookPizzariaPayload } from "@/lib/webhook-pizzaria";

// Payload do submit do form da /resultado-alphas-pizzaria no WP (JSON, mesmas
// chaves e mesma ordem): nome, email, telefone, empresa, segmento, faturamento,
// disposto_investir, cnpj, tipo_lead, redirect_url, as 10 UTMs, page_url,
// referrer, submitted_at. Sem origem_form (só a VSL tem).
//
// tipo_lead e redirect_url seguem a regra de faturamento do WP (obrigado-a/b/c,
// agradecimento ou obrigado), mesmo que aqui o navegador vá sempre para
// /alphas-pizzaria/obrigado.
export function buildWebhookResultadoPayload(
  lead: LeadFormDataPizzaria,
  tracking: LeadTrackingPizzaria,
  ctx: { siteUrl: string; now: Date; pageUrl: string; referrer: string }
): WebhookPizzariaPayload {
  const isAte30 = lead.faturamento === "Até 30 mil";
  const disposto = dispostoInvestir(lead.faturamento, lead.investiria);
  const qualificacao = calcularQualificacaoPizzaria(lead.faturamento, disposto);
  const utms = {} as Record<TrackingKeyPizzaria, string>;
  for (const key of TRACKING_KEYS_PIZZARIA) utms[key] = tracking[key] ?? "";
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
    redirect_url: `${ctx.siteUrl}/${qualificacao.slug}/`,
    ...utms,
    page_url: ctx.pageUrl,
    referrer: ctx.referrer,
    submitted_at: ctx.now.toISOString(),
  };
}
