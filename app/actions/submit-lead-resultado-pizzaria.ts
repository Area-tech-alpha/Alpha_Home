"use server";

import { headers } from "next/headers";
import { contentResultado } from "@/lib/content-resultado-pizzaria";
import { parseTrackingPizzaria, parseUrlOrEmpty } from "@/lib/lead-pizzaria";
import { checkLeadRateLimit, clientIp, releaseLeadRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { leadSchemaPizzaria, type LeadFormDataPizzaria } from "@/lib/validation-pizzaria";
import { sendLeadToWebhookPizzaria } from "@/lib/webhook-pizzaria";
import { buildWebhookResultadoPayload } from "@/lib/webhook-resultado-pizzaria";

// Submit do form da /resultado-alphas-pizzaria. O lead vai para o webhook aqui
// (mesmo destino da /alphas-pizzaria: LEAD_WEBHOOK_URL_PIZZARIA) e o navegador só
// segue para o obrigado se o envio deu certo. No WP o envio é "fire and forget";
// aqui falha de envio devolve a cota do rate limit e pede para tentar de novo.

export type SubmitLeadResultadoResult =
  | { success: true; lead: LeadFormDataPizzaria }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "webhook" };

const { errors } = contentResultado.form;

export async function submitLeadResultadoPizzaria(
  data: unknown,
  rawTracking?: unknown,
  rawPage?: { pageUrl?: unknown; referrer?: unknown }
): Promise<SubmitLeadResultadoResult> {
  const parsed = leadSchemaPizzaria.safeParse(data);
  if (!parsed.success) return { success: false, error: errors.validation, reason: "validation" };
  const lead = parsed.data;
  const h = await headers();

  const limit = await checkLeadRateLimit({
    email: lead.email,
    telefone: lead.telefone,
    ip: clientIp(h),
    scope: "pizzaria-resultado",
  });
  if (!limit.ok) {
    console.warn(`[submit-lead-resultado-pizzaria] Rate limit por ${limit.by}`);
    return {
      success: false,
      reason: "rate_limited",
      error: errors.rateLimited.replace("{min}", String(limit.retryAfterMinutes)),
    };
  }

  const payload = buildWebhookResultadoPayload(lead, parseTrackingPizzaria(rawTracking), {
    siteUrl: SITE_URL,
    now: new Date(),
    pageUrl: parseUrlOrEmpty(rawPage?.pageUrl),
    referrer: parseUrlOrEmpty(rawPage?.referrer),
  });
  const result = await sendLeadToWebhookPizzaria(payload);
  if (!result.ok) {
    await releaseLeadRateLimit({ email: lead.email, telefone: lead.telefone, scope: "pizzaria-resultado" });
    return { success: false, error: errors.webhook, reason: "webhook" };
  }
  return { success: true, lead };
}
