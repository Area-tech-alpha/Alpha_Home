import { buildCrmLeadPayload, sendLeadToCrm } from "@/lib/crm";
import {
  checkLeadRateLimit,
  releaseLeadRateLimit,
  type Limiters,
  type RateLimitScope,
} from "@/lib/rate-limit";
import { parseTracking, type LeadFormData } from "@/lib/validation";

// Caminho único de envio das LPs (/01-lp, /alphas-pizzaria, /resultado-alphas-pizzaria
// e /lead-magnetic-bastidores-alphas-pizzaria): o mesmo da home. Valida, aplica o
// rate limit (escopo da LP), manda para o CRM comercial com o MESMO payload da home
// (lib/crm.ts) e, se o CRM não responder ok, devolve a cota do rate limit para a
// pessoa tentar de novo. O redirect só acontece quando o envio deu certo.
//
// Não recebe nada de next/headers: a server action de cada LP passa o IP. Assim dá
// para testar com limitadores e fetch falsos, sem rede.

export type IntakeErrors = { validation: string; rateLimited: string; crm: string };

type LeadSchema = {
  safeParse(data: unknown): { success: true; data: LeadFormData } | { success: false };
};

export type IntakeResult =
  | { success: true; lead: LeadFormData }
  | { success: false; error: string; reason: "validation" | "rate_limited" | "crm" };

export async function intakeLead(opts: {
  data: unknown;
  rawTracking?: unknown;
  ip: string | null;
  schema: LeadSchema;
  scope: RateLimitScope;
  errors: IntakeErrors;
  // Só nos testes:
  limiters?: Limiters | null;
  fetchImpl?: typeof fetch;
}): Promise<IntakeResult> {
  const { errors, scope } = opts;
  const parsed = opts.schema.safeParse(opts.data);
  if (!parsed.success) return { success: false, error: errors.validation, reason: "validation" };
  const lead = parsed.data;
  const tracking = parseTracking(opts.rawTracking);

  const limit = await checkLeadRateLimit({ email: lead.email, telefone: lead.telefone, ip: opts.ip, scope }, opts.limiters);
  if (!limit.ok) {
    console.warn(`[lead-intake:${scope}] Rate limit por ${limit.by}`);
    return {
      success: false,
      reason: "rate_limited",
      error: errors.rateLimited.replace("{min}", String(limit.retryAfterMinutes)),
    };
  }

  const result = await sendLeadToCrm(buildCrmLeadPayload(lead, tracking), opts.fetchImpl);
  if (!result.ok) {
    await releaseLeadRateLimit({ email: lead.email, telefone: lead.telefone, scope }, opts.limiters);
    return { success: false, error: errors.crm, reason: "crm" };
  }
  return { success: true, lead };
}
