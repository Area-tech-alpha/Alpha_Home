import { z } from "zod";
import { TRACKING_KEYS_01LP, type LeadTracking01lp } from "@/lib/lead-01lp-constants";

// Regra de pós-envio da 00-lp do WP (script inline, ramo pageId 3445), literal:
//   faturamento "Até 30 mil" + disposto "agradecimento" (Não)  -> /agradecimento (desqualificado)
//   faixa_a                                                    -> /obrigado-a (a)
//   faixa_b                                                    -> /obrigado-b (b)
//   faixa_c ou "Até 30 mil"                                    -> /obrigado-c (c)
//   resto (só "80 mil até 100 mil")                            -> /obrigado (qualificado-geral)
// A faixa "80 mil até 100 mil" ficou de fora no WP; mantida igual, pendência pro Max.
const FAIXA_A = [
  "100 mil até 150 mil",
  "150 mil até 250 mil",
  "250 mil até 400 mil",
  "400 mil até 600 mil",
  "600 mil até 1 milhão",
  "Mais de 1 milhão",
];
const FAIXA_B = ["50 mil até 80 mil"];
const FAIXA_C = ["30 mil até 50 mil"];

export type TipoLead = "a" | "b" | "c" | "desqualificado" | "qualificado-geral";
export type Rota01lp = { slug: string; tipo: TipoLead };

export function rotear01lp(faturamento: string, investiria?: "Sim" | "Não"): Rota01lp {
  if (faturamento === "Até 30 mil" && investiria === "Não") return { slug: "agradecimento", tipo: "desqualificado" };
  if (FAIXA_A.includes(faturamento)) return { slug: "obrigado-a", tipo: "a" };
  if (FAIXA_B.includes(faturamento)) return { slug: "obrigado-b", tipo: "b" };
  if (FAIXA_C.includes(faturamento) || faturamento === "Até 30 mil") return { slug: "obrigado-c", tipo: "c" };
  return { slug: "obrigado", tipo: "qualificado-geral" };
}

// Valores que o select "disposto_investir" do WP envia para cada opção.
export const DISPOSTO_INVESTIR_VALUE = { Sim: "obrigado", Não: "agradecimento" } as const;

// Atribuição vinda do navegador: nunca barra o lead; valor inválido é descartado.
const trackingValue = z.string().trim().min(1).max(500);
const urlValue = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => /^https?:\/\/[^\s]+$/i.test(v), "URL inválida");

export type Tracking01lp = LeadTracking01lp & { debug_full_url?: string };

export function parseTracking01lp(raw: unknown): Tracking01lp {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const tracking: Tracking01lp = {};
  for (const key of TRACKING_KEYS_01LP) {
    const parsed = trackingValue.safeParse(source[key]);
    if (parsed.success) tracking[key] = parsed.data;
  }
  const url = urlValue.safeParse(source.debug_full_url);
  if (url.success) tracking.debug_full_url = url.data;
  return tracking;
}
