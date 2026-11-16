"use server";

import { headers } from "next/headers";
import { content01lp } from "@/lib/content-01-lp";
import { parseTracking01lp, rotear01lp } from "@/lib/lead-01lp";
import { checkLeadRateLimit, clientIp, releaseLeadRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { leadSchema } from "@/lib/validation";
import { buildWebhook01lpPayload, sendLeadToWebhook01lp } from "@/lib/webhook-01lp";

export type SubmitLead01lpResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "webhook" };

const { errors } = content01lp.form;

export async function submitLead01lp(data: unknown, rawTracking?: unknown): Promise<SubmitLead01lpResult> {
  const parsed = leadSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: errors.validation, reason: "validation" };
  }
  const lead = parsed.data;
  const tracking = parseTracking01lp(rawTracking);
  const h = await headers();
  const ip = clientIp(h);

  const limit = await checkLeadRateLimit({ email: lead.email, telefone: lead.telefone, ip, scope: "01lp" });
  if (!limit.ok) {
    console.warn(`[submit-lead-01lp] Rate limit por ${limit.by}`);
    return {
      success: false,
      reason: "rate_limited",
      error: errors.rateLimited.replace("{min}", String(limit.retryAfterMinutes)),
    };
  }

  const payload = buildWebhook01lpPayload(lead, tracking, {
    siteUrl: SITE_URL,
    now: new Date(),
  });
  const result = await sendLeadToWebhook01lp(payload);
  if (!result.ok) {
    await releaseLeadRateLimit({ email: lead.email, telefone: lead.telefone, scope: "01lp" });
    return { success: false, error: errors.webhook, reason: "webhook" };
  }
  return { success: true, redirectTo: `/${rotear01lp(lead.faturamento, lead.investiria).slug}` };
}
