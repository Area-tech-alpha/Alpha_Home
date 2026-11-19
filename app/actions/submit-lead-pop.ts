"use server";

import { headers } from "next/headers";
import { isPopSlug, popForm, raioXPath, type PopSlug } from "@/lib/content-pop";
import { intakeLead } from "@/lib/lead-intake";
import { clientIp } from "@/lib/rate-limit";
import { leadSchemaPop } from "@/lib/validation-pop";

export type SubmitLeadPopResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

// As 3 LPs de POP enviam por aqui: o slug define o escopo do rate limit
// ("pop-producao", "pop-expedicao", "pop-delivery") e a isca do obrigado. O lead vai
// ao CRM comercial (mesmo caminho e payload da home) e só há redirect se o CRM
// respondeu ok.
export async function submitLeadPop(
  slug: PopSlug,
  data: unknown,
  rawTracking?: unknown
): Promise<SubmitLeadPopResult> {
  if (!isPopSlug(slug)) return { success: false, error: popForm.errors.validation, reason: "validation" };
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchemaPop,
    scope: slug,
    errors: popForm.errors,
  });
  if (!result.success) return result;
  return { success: true, redirectTo: raioXPath(slug) };
}
