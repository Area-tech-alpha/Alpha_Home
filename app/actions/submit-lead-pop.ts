"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { ISCA_LPS, isIscaSlug, popForm, raioXPath, type IscaSlug } from "@/lib/content-pop";
import { intakeLead } from "@/lib/lead-intake";
import type { TzLead } from "@/lib/lead-webhook-constants";
import { buildRaioXBody, buildTzLead, postWebhook } from "@/lib/lead-webhook";
import { clientIp } from "@/lib/rate-limit";
import { leadSchemaPop } from "@/lib/validation-pop";

export type SubmitLeadPopResult =
  | { success: true; redirectTo: string; tzLead: TzLead }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

// LPs de isca (POP, ficha técnica, cronograma, cardápio, calculadora de CMV): o slug
// define o escopo do rate limit e a isca. O lead vai ao CRM comercial (mesmo caminho e
// payload da home) e só há redirect se o CRM respondeu ok. Depois da resposta, o
// mesmo lead vai ao n8n (LEAD_WEBHOOK_URL_ISCAS) com o body do WP; falha ali não
// afeta o lead nem o redirect.
export async function submitLeadPop(
  slug: IscaSlug,
  data: unknown,
  rawTracking?: unknown,
  pageUrl?: unknown
): Promise<SubmitLeadPopResult> {
  if (!isIscaSlug(slug)) return { success: false, error: popForm.errors.validation, reason: "validation" };
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchemaPop,
    scope: ISCA_LPS[slug].scope,
    errors: popForm.errors,
  });
  if (!result.success) return result;
  const tzLead = buildTzLead({ slug, pageUrl, lead: result.lead, rawTracking });
  after(() => postWebhook("iscas", tzLead));
  return { success: true, redirectTo: raioXPath(slug), tzLead };
}

// "Quero meu Raio-X gratuito" no obrigado: manda o lead salvo no navegador ao n8n
// (LEAD_WEBHOOK_URL_RAIO_X), como o WP. Sem lead com telefone, não envia nada.
export async function submitRaioXAceite(lead: unknown, isca: unknown, pageUrl: unknown): Promise<{ ok: boolean }> {
  const body = buildRaioXBody({ lead, isca, pageUrl });
  if (!body) return { ok: false };
  return postWebhook("raio-x", body);
}
