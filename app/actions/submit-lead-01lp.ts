"use server";

import { headers } from "next/headers";
import { content01lp } from "@/lib/content-01-lp";
import { intakeLead } from "@/lib/lead-intake";
import { rotear01lp } from "@/lib/lead-01lp";
import { clientIp } from "@/lib/rate-limit";
import { leadSchema01lp } from "@/lib/validation-01lp";

export type SubmitLead01lpResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

// O lead vai para o CRM comercial (mesmo código e mesmo payload da home) no submit;
// só redireciona se o CRM respondeu ok.
export async function submitLead01lp(data: unknown, rawTracking?: unknown): Promise<SubmitLead01lpResult> {
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchema01lp,
    scope: "01lp",
    errors: content01lp.form.errors,
  });
  if (!result.success) return result;
  return { success: true, redirectTo: `/${rotear01lp(result.lead.faturamento, result.lead.investiria).slug}` };
}
