"use server";

import { headers } from "next/headers";
import { LMVSL_OBRIGADO_PATH } from "@/lib/content-lead-magnetic-vsl";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { foodLm, intakeLead } from "@/lib/lead-intake";
import { clientIp } from "@/lib/rate-limit";
import { leadSchemaLeadMagneticVsl } from "@/lib/validation-pizzaria";

export type SubmitLeadMagneticVslResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

// /lead-magnetic-vsl: lead magnet, vai para food/lm ("lead-magnetic-vsl" no catálogo do
// CRM: planilha das LMs + e-mail da Brevo). Só redireciona se o CRM respondeu ok.
export async function submitLeadMagneticVsl(
  data: unknown,
  rawTracking?: unknown
): Promise<SubmitLeadMagneticVslResult> {
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchemaLeadMagneticVsl,
    scope: "lead-magnetic-vsl",
    errors: contentPizzaria.form.errors,
    crm: foodLm("lead-magnetic-vsl", "/lead-magnetic-vsl"),
  });
  if (!result.success) return result;
  return { success: true, redirectTo: LMVSL_OBRIGADO_PATH };
}
