"use server";

import { headers } from "next/headers";
import { ISCA_LPS, isIscaSlug, popForm, raioXPath, type IscaSlug } from "@/lib/content-pop";
import { buildRaioXBody, buildTzLead, sendToLeadIntake } from "@/lib/crm";
import { intakeLead } from "@/lib/lead-intake";
import { clientIp } from "@/lib/rate-limit";
import type { TzLead } from "@/lib/tz-lead-constants";
import { leadSchemaPop } from "@/lib/validation-pop";

export type SubmitLeadPopResult =
  | { success: true; redirectTo: string; tzLead: TzLead }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

// LPs de isca (POP, ficha técnica, cronograma, cardápio, calculadora de CMV): o slug
// define o escopo do rate limit e a isca. O lead vai UMA vez para a entrada de leads do
// CRM (food/isca: Matriz, régua das iscas, e-mail do material e planilha; antes ia ao CRM
// genérico e ao n8n "leads-iscas") e só há redirect se o CRM respondeu ok.
export async function submitLeadPop(
  slug: IscaSlug,
  data: unknown,
  rawTracking?: unknown,
  pageUrl?: unknown
): Promise<SubmitLeadPopResult> {
  if (!isIscaSlug(slug)) return { success: false, error: popForm.errors.validation, reason: "validation" };
  let tzLead: TzLead | undefined;
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchemaPop,
    scope: ISCA_LPS[slug].scope,
    errors: popForm.errors,
    crm: { route: "isca", body: (lead) => (tzLead = buildTzLead({ slug, pageUrl, lead, rawTracking })) },
  });
  if (!result.success) return result;
  // O mesmo lead que foi ao CRM fica no navegador para o aceite do Raio-X.
  return { success: true, redirectTo: raioXPath(slug), tzLead: tzLead ?? buildTzLead({ slug, pageUrl, lead: result.lead, rawTracking }) };
}

// "Quero meu Raio-X gratuito" no obrigado: manda o lead salvo no navegador para o CRM
// (food/raio-x: marca na planilha, nota no lead ou lead novo). Sem lead com telefone, não
// envia nada. A confirmação aparece de qualquer jeito (o clique não espera o envio).
export async function submitRaioXAceite(lead: unknown, isca: unknown, pageUrl: unknown): Promise<{ ok: boolean }> {
  const body = buildRaioXBody({ lead, isca, pageUrl });
  if (!body) return { ok: false };
  const result = await sendToLeadIntake("raio-x", body);
  return { ok: result.ok };
}
