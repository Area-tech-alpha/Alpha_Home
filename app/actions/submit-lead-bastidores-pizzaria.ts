"use server";

import { headers } from "next/headers";
import { BASTIDORES_OBRIGADO_PATH } from "@/lib/content-bastidores-pizzaria";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { intakeLead } from "@/lib/lead-intake";
import { clientIp } from "@/lib/rate-limit";
import { leadSchemaPizzaria } from "@/lib/validation-pizzaria";

export type SubmitLeadBastidoresResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

// /lead-magnetic-bastidores-alphas-pizzaria: o lead vai para o CRM comercial (mesmo
// código e mesmo payload da home) no submit e, se o CRM respondeu ok, segue para o
// obrigado dela. No WP o form não enviava nada: o envio era na página de obrigado.
export async function submitLeadBastidoresPizzaria(
  data: unknown,
  rawTracking?: unknown
): Promise<SubmitLeadBastidoresResult> {
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchemaPizzaria,
    scope: "pizzaria-bastidores",
    errors: contentPizzaria.form.errors,
  });
  if (!result.success) return result;
  return { success: true, redirectTo: BASTIDORES_OBRIGADO_PATH };
}
