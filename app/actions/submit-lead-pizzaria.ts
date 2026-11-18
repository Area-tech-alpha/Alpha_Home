"use server";

import { headers } from "next/headers";
import { parseTrackingPizzaria, parseUrlOrEmpty, storedLeadSchemaPizzaria } from "@/lib/lead-pizzaria";
import { checkLeadRateLimit, clientIp, releaseLeadRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { buildWebhookPizzariaPayload, sendLeadToWebhookPizzaria, type PizzariaLeadInput } from "@/lib/webhook-pizzaria";

// Como no WP, o lead só vai para o webhook na página 2, quando a pessoa clica no
// botão liberado aos 50% do vídeo. A página 1 valida o form e guarda o lead no
// navegador; aqui ele é validado de novo (veio do storage) antes do envio.
//
// Em qualquer resultado o navegador segue para o PDF (no WP o envio é
// "fire and forget" com keepalive): o retorno serve para log e para os testes.

export type ConfirmLeadPizzariaResult =
  | { ok: true; sent: boolean }
  | { ok: false; reason: "validation" | "rate_limited" | "webhook" };

export async function confirmLeadPizzaria(input: {
  stored: unknown; // lead da página 1 (null = abriu a página 2 sem passar pelo form)
  tracking: unknown; // atribuição lida na página 2 (usada só sem lead)
  pageUrl: unknown;
  referrer: unknown;
}): Promise<ConfirmLeadPizzariaResult> {
  let leadInput: PizzariaLeadInput | null = null;

  if (input.stored != null) {
    const parsed = storedLeadSchemaPizzaria.safeParse(input.stored);
    if (!parsed.success) return { ok: false, reason: "validation" };
    // Honeypot preenchido: responde como sucesso e não envia nada.
    if (parsed.data.website) return { ok: true, sent: false };
    leadInput = {
      lead: parsed.data.lead,
      tracking: parseTrackingPizzaria(parsed.data.tracking),
      referrer: parseUrlOrEmpty(parsed.data.referrer),
      formPreenchidoEm: parsed.data.form_preenchido_em,
    };
  }

  const h = await headers();
  const ip = clientIp(h);
  const email = leadInput?.lead.email ?? "";
  const telefone = leadInput?.lead.telefone ?? "";

  const limit = await checkLeadRateLimit({ email, telefone, ip, scope: "pizzaria" });
  if (!limit.ok) {
    console.warn(`[submit-lead-pizzaria] Rate limit por ${limit.by}`);
    return { ok: false, reason: "rate_limited" };
  }

  const payload = buildWebhookPizzariaPayload(
    leadInput,
    {
      pageUrl: parseUrlOrEmpty(input.pageUrl),
      trackingFresh: parseTrackingPizzaria(input.tracking),
      referrer: parseUrlOrEmpty(input.referrer),
    },
    { siteUrl: SITE_URL, now: new Date() }
  );

  const result = await sendLeadToWebhookPizzaria(payload);
  if (!result.ok) {
    if (leadInput) await releaseLeadRateLimit({ email, telefone, scope: "pizzaria" });
    return { ok: false, reason: "webhook" };
  }
  return { ok: true, sent: true };
}
