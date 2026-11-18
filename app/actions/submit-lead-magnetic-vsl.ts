"use server";

import { headers } from "next/headers";
import { LMVSL_OBRIGADO_PATH } from "@/lib/content-lead-magnetic-vsl";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { intakeLead } from "@/lib/lead-intake";
import { clientIp } from "@/lib/rate-limit";
import { leadSchemaLeadMagneticVsl } from "@/lib/validation-pizzaria";

export type SubmitLeadMagneticVslResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

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
  });
  if (!result.success) return result;
  return { success: true, redirectTo: LMVSL_OBRIGADO_PATH };
}
