import {
  buildFoodLpBody,
  buildLmBody,
  pageUrlOf,
  sendToLeadIntake,
  type FoodIntakeRoute,
  type IntakeBody,
} from "@/lib/crm";
import {
  checkLeadRateLimit,
  releaseLeadRateLimit,
  type Limiters,
  type RateLimitScope,
} from "@/lib/rate-limit";
import { parseTracking, type LeadFormData, type LeadTracking } from "@/lib/validation";

// Caminho único de envio da home e das LPs: valida, aplica o rate limit (escopo da LP),
// manda UMA vez para a entrada de leads do CRM (lib/crm.ts, rota food/* que a LP escolher)
// e, se o CRM não responder ok, devolve a cota do rate limit para a pessoa tentar de novo.
// O redirect só acontece quando o envio deu certo.
//
// Não recebe nada de next/headers: a server action de cada LP passa o IP. Assim dá
// para testar com limitadores e fetch falsos, sem rede.

export type IntakeErrors = { validation: string; rateLimited: string; crm: string };

type LeadSchema = {
  safeParse(data: unknown): { success: true; data: LeadFormData } | { success: false };
};

// Para onde e com que corpo o lead vai ao CRM.
export type CrmTarget = { route: FoodIntakeRoute; body: (lead: LeadFormData, tracking: LeadTracking) => IntakeBody };

// food/lp: home e LPs de restaurante. `origem` = de qual página o lead veio; `path` = rota
// da página (vira page_url).
export function foodLp(origem: string, path: string): CrmTarget {
  return { route: "lp", body: (lead, tracking) => buildFoodLpBody({ lead, tracking, origem, pageUrl: pageUrlOf(path) }) };
}

// food/lm: lead magnets. `leadMagnet` = slug da LM no catálogo do CRM.
export function foodLm(leadMagnet: string, path: string): CrmTarget {
  return { route: "lm", body: (lead, tracking) => buildLmBody({ lead, tracking, leadMagnet, pageUrl: pageUrlOf(path) }) };
}

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
  crm: CrmTarget;
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

  const result = await sendToLeadIntake(opts.crm.route, opts.crm.body(lead, tracking), opts.fetchImpl);
  if (!result.ok) {
    await releaseLeadRateLimit({ email: lead.email, telefone: lead.telefone, scope }, opts.limiters);
    // 400: o CRM recusou o conteúdo (ex.: link no nome). Reenviar igual não adianta: a
    // pessoa precisa corrigir o form. Resto (5xx, rede, chave): "tente de novo".
    if (result.rejected) return { success: false, error: errors.validation, reason: "validation" };
    return { success: false, error: errors.crm, reason: "crm" };
  }
  return { success: true, lead };
}
