"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import type { SubmitLead01lpResult } from "@/app/actions/submit-lead-01lp";
import { content01lp } from "@/lib/content-01-lp";
import { intakeLead } from "@/lib/lead-intake";
import { rotear01lp } from "@/lib/lead-01lp";
import { postWebhook } from "@/lib/lead-webhook";
import { buildWpGeralBody, type ContextoWp } from "@/lib/lead-webhook-wp-geral";
import { clientIp } from "@/lib/rate-limit";
import { leadSchema01lp } from "@/lib/validation-01lp";

// /nao-dependa-de-sorte: mesmo form e mesma régua da /01-lp. O lead vai ao CRM
// comercial (payload da home, escopo de rate limit próprio) e só há redirect se o CRM
// respondeu ok (a faixa "80 mil até 100 mil" navega para /obrigado-a, como a /01-lp).
// Depois da resposta, o mesmo lead vai ao n8n "wordpress-geral"
// (LEAD_WEBHOOK_URL_WORDPRESS_GERAL) com o body do WP; falha ali não afeta nada.
export async function submitLeadNds(data: unknown, rawTracking?: unknown, ctx?: ContextoWp): Promise<SubmitLead01lpResult> {
  const result = await intakeLead({
    data,
    rawTracking,
    ip: clientIp(await headers()),
    schema: leadSchema01lp,
    scope: "nao-dependa-de-sorte",
    errors: content01lp.form.errors,
  });
  if (!result.success) return result;
  const body = buildWpGeralBody({ lead: result.lead, ctx });
  after(() => postWebhook("wordpress-geral", body));
  return { success: true, redirectTo: `/${rotear01lp(result.lead.faturamento, result.lead.investiria).slug}` };
}
