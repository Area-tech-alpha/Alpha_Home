import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  TRACKING_KEYS_PIZZARIA,
  type LeadTrackingPizzaria,
} from "@/lib/lead-pizzaria-constants";
import { leadSchemaPizzaria } from "@/lib/validation-pizzaria";

// Regras do script da página 1 do WP (calcularQualificacaoLead), literais:
//   "Até 30 mil" + disposto "agradecimento" (Não) -> agradecimento (desqualificado)
//   faixa A                                       -> obrigado-a (a)
//   faixa B                                       -> obrigado-b (b)
//   faixa C ou "Até 30 mil"                       -> obrigado-c (c)
//   resto (só "80 mil até 100 mil")               -> obrigado (qualificado-geral)
// Aqui elas só preenchem tipo_lead e redirect_url do payload: o navegador vai
// sempre para /alphas-pizzaria/obrigado, como no WP.
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

export type TipoLeadPizzaria = "a" | "b" | "c" | "desqualificado" | "qualificado-geral";
export type DispostoInvestir = "" | "obrigado" | "agradecimento";

export function calcularQualificacaoPizzaria(
  faturamento: string,
  disposto: DispostoInvestir
): { slug: string; tipo: TipoLeadPizzaria } {
  if (faturamento === "Até 30 mil" && disposto === "agradecimento") return { slug: "agradecimento", tipo: "desqualificado" };
  if (FAIXA_A.includes(faturamento)) return { slug: "obrigado-a", tipo: "a" };
  if (FAIXA_B.includes(faturamento)) return { slug: "obrigado-b", tipo: "b" };
  if (FAIXA_C.includes(faturamento) || faturamento === "Até 30 mil") return { slug: "obrigado-c", tipo: "c" };
  return { slug: "obrigado", tipo: "qualificado-geral" };
}

// disposto_investir do WP: só em "Até 30 mil"; "nao" -> agradecimento, senão obrigado.
export function dispostoInvestir(faturamento: string, investiria?: "Sim" | "Não"): DispostoInvestir {
  if (faturamento !== "Até 30 mil") return "";
  return investiria === "Não" ? "agradecimento" : "obrigado";
}

// Telefone no formato do payload do WP: `+${ddi} ${número mascarado}`. No Brasil
// a máscara é a do formatPhone() do WP, literal: (DD) + 5 dígitos + "-" + resto
// (um fixo de 10 dígitos sai "(11) 34567-890", como lá). Fora do Brasil, só dígitos.
export function telefoneFormatoWP(e164: string): string {
  const phone = parsePhoneNumberFromString(e164);
  if (!phone) return e164;
  const ddi = phone.countryCallingCode;
  const digits = String(phone.nationalNumber);
  if (ddi !== "55") return `+${ddi} ${digits.slice(0, 15)}`;
  const d = digits.slice(0, 11);
  let out = d;
  if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return `+${ddi} ${out}`;
}

// CNPJ como o WP manda: com a máscara 00.000.000/0000-00.
export function cnpjMascarado(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

// classificarOrigemOrganica() do WP: sem UTM de origem/mídia, deduz pelo referrer.
const SEARCH_ENGINES = ["google.", "bing.", "yahoo.", "duckduckgo.", "baidu.", "yandex."];
const SOCIAL_DOMAINS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "l.facebook.com",
  "lm.facebook.com",
  "tiktok.com",
  "linkedin.com",
  "t.co",
  "twitter.com",
  "x.com",
  "youtube.com",
  "wa.me",
  "whatsapp.com",
];

export function classificarOrigemOrganica(referrer: string, ownHostname: string) {
  const direto = { utm_source: "direto", utm_medium: "nenhum" };
  if (!referrer) return direto;
  let hostname: string;
  try {
    hostname = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return direto;
  }
  if (hostname.includes(ownHostname)) return direto;
  if (SEARCH_ENGINES.some((s) => hostname.includes(s))) return { utm_source: hostname.split(".")[0], utm_medium: "organico" };
  if (SOCIAL_DOMAINS.some((s) => hostname.includes(s))) return { utm_source: hostname.split(".")[0], utm_medium: "organico" };
  return { utm_source: hostname, utm_medium: "referral" };
}

// ===== Validação do que vem do navegador (atribuição nunca barra o lead) =====
const trackingValue = z.string().trim().min(1).max(500);
const urlValue = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => /^https?:\/\/[^\s]+$/i.test(v), "URL inválida");

export function parseTrackingPizzaria(raw: unknown): LeadTrackingPizzaria {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const tracking: LeadTrackingPizzaria = {};
  for (const key of TRACKING_KEYS_PIZZARIA) {
    const parsed = trackingValue.safeParse(source[key]);
    if (parsed.success) tracking[key] = parsed.data;
  }
  return tracking;
}

export function parseUrlOrEmpty(raw: unknown): string {
  const parsed = urlValue.safeParse(raw);
  return parsed.success ? parsed.data : "";
}

// Lead que a página 1 grava no storage e a página 2 manda na confirmação.
// "website" é o honeypot do form (preenchido = bot).
export const storedLeadSchemaPizzaria = z.object({
  lead: leadSchemaPizzaria,
  tracking: z.unknown().optional(),
  page_url: z.string().max(2000),
  referrer: z.string().max(2000),
  form_preenchido_em: z.iso.datetime(),
  website: z.string().max(200).optional(),
});

export type StoredLeadPizzaria = z.infer<typeof storedLeadSchemaPizzaria>;
