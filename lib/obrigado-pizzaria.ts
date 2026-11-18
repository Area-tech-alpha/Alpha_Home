import { LEAD_TTL_MS_PIZZARIA } from "@/lib/lead-pizzaria-constants";

// Regra do obrigado da VSL (/alphas-pizzaria/obrigado) ao clicar no botão liberado.
// Sem dependências (roda no navegador sem puxar zod nem libphonenumber).
//
// Quem vem da /resultado-alphas-pizzaria já teve o lead enviado no submit e deixa
// uma marca no navegador. Com a marca válida, o botão só abre o PDF: não chama o
// webhook de novo (nem manda "sem-form"). Sem marca, nada muda: o lead da VSL (ou
// o "sem-form", se a pessoa abriu o obrigado direto) é enviado como sempre.

export type SentMarkPizzaria = { lead: Record<string, unknown>; enviado_em: string };

// Margem para relógio do navegador um pouco adiantado.
const FUTURE_SKEW_MS = 5 * 60 * 1000;

export function parseSentMarkPizzaria(raw: unknown, now = Date.now()): SentMarkPizzaria | null {
  if (!raw || typeof raw !== "object") return null;
  const { lead, enviado_em } = raw as Record<string, unknown>;
  if (!lead || typeof lead !== "object" || Array.isArray(lead)) return null;
  if (typeof enviado_em !== "string") return null;
  const t = Date.parse(enviado_em);
  if (!Number.isFinite(t)) return null;
  if (now - t > LEAD_TTL_MS_PIZZARIA || t - now > FUTURE_SKEW_MS) return null;
  return { lead: lead as Record<string, unknown>, enviado_em };
}

export type AcaoConfirmacaoPizzaria = "so-pdf" | "enviar";

export function decidirConfirmacaoPizzaria(sentMark: unknown, now = Date.now()): AcaoConfirmacaoPizzaria {
  return parseSentMarkPizzaria(sentMark, now) ? "so-pdf" : "enviar";
}
