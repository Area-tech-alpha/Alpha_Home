"use server";

import { headers } from "next/headers";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { intakeLead } from "@/lib/lead-intake";
import { clientIp } from "@/lib/rate-limit";
import { leadSchemaPizzaria } from "@/lib/validation-pizzaria";

export type SubmitLeadPizzariaResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

// /alphas-pizzaria (VSL): o lead vai para o CRM comercial (mesmo código e mesmo
// payload da home) no submit da página 1, e só então vai para o vídeo. O obrigado
// (/alphas-pizzaria/obrigado) só faz o gate do vídeo e abre o PDF: não envia nada.
export async function submitLeadPizzaria(data: unknown, rawTracking?: unknown): Promise<SubmitLeadPizzariaResult> {
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchemaPizzaria,
    scope: "pizzaria",
    errors: contentPizzaria.form.errors,
  });
  if (!result.success) return result;
  return { success: true, redirectTo: "/alphas-pizzaria/obrigado" };
}
