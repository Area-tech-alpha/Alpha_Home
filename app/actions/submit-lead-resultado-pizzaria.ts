"use server";

import { headers } from "next/headers";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { intakeLead } from "@/lib/lead-intake";
import { clientIp } from "@/lib/rate-limit";
import { leadSchemaPizzaria } from "@/lib/validation-pizzaria";

export type SubmitLeadResultadoResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

// /resultado-alphas-pizzaria: o lead vai para o CRM comercial (mesmo código e mesmo
// payload da home) no submit e, se o CRM respondeu ok, segue para o obrigado da VSL.
export async function submitLeadResultadoPizzaria(
  data: unknown,
  rawTracking?: unknown
): Promise<SubmitLeadResultadoResult> {
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchemaPizzaria,
    scope: "pizzaria-resultado",
    errors: contentPizzaria.form.errors,
  });
  if (!result.success) return result;
  return { success: true, redirectTo: "/alphas-pizzaria/obrigado" };
}
