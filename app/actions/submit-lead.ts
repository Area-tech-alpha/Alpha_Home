"use server";

import { headers } from "next/headers";
import { content } from "@/lib/content";
import { foodLp, intakeLead } from "@/lib/lead-intake";
import { clientIp } from "@/lib/rate-limit";
import { leadSchema } from "@/lib/validation";

export type SubmitLeadResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

// Home: o lead vai para a entrada de leads do CRM (food/lp, origem "alpha-home"), pelo
// mesmo caminho das LPs (lib/lead-intake.ts). Só redireciona se o CRM respondeu ok.
export async function submitLead(data: unknown, rawTracking?: unknown): Promise<SubmitLeadResult> {
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchema,
    scope: "home",
    errors: content.form.errors,
    crm: foodLp("alpha-home", "/"),
  });
  if (!result.success) return result;
  return { success: true, redirectTo: "/obrigado" };
}
