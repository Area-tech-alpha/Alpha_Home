"use server";

import { headers } from "next/headers";
import type { SubmitLead01lpResult } from "@/app/actions/submit-lead-01lp";
import { content01lp } from "@/lib/content-01-lp";
import { foodLp, intakeLead } from "@/lib/lead-intake";
import { rotear01lp } from "@/lib/lead-01lp";
import { clientIp } from "@/lib/rate-limit";
import { leadSchema01lp } from "@/lib/validation-01lp";

// /nao-dependa-de-sorte: mesmo form e mesma régua da /01-lp. O lead vai UMA vez para a
// entrada de leads do CRM (food/lp, origem "nao-dependa-de-sorte"; antes ia também ao n8n
// "wordpress-geral") e só há redirect se o CRM respondeu ok (a faixa "80 mil até 100 mil"
// navega para /obrigado-a, como a /01-lp).
export async function submitLeadNds(data: unknown, rawTracking?: unknown): Promise<SubmitLead01lpResult> {
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchema01lp,
    scope: "nao-dependa-de-sorte",
    errors: content01lp.form.errors,
    crm: foodLp("nao-dependa-de-sorte", "/nao-dependa-de-sorte"),
  });
  if (!result.success) return result;
  return { success: true, redirectTo: `/${rotear01lp(result.lead.faturamento, result.lead.investiria).slug}` };
}
