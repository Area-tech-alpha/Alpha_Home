import { parsePhoneNumberFromString } from "libphonenumber-js";

// Body do webhook "wordpress-geral" do n8n, IDÊNTICO ao que o script da
// /nao-dependa-de-sorte/ do WP manda (mesmos campos, ordem e formatos), inclusive
// tipo_lead e redirect_url pela régua do WP (calcularQualificacaoLead): a faixa
// "80 mil até 100 mil" vai como "qualificado-geral" e .../obrigado/ no body, mesmo
// que a navegação daqui leve para /obrigado-a (como a /01-lp).

// UTM_KEYS do WP, nesta ordem.
export const WP_GERAL_UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id", "gclid", "fbclid", "fbc", "gcl_aw"] as const;
export type WpGeralUtms = Partial<Record<(typeof WP_GERAL_UTM_KEYS)[number], string>>;

// value do <select> de segmento do WP para cada rótulo (os rótulos são os da /01-lp).
const SEGMENTO_SLUG: Record<string, string> = {
  Pizzarias: "pizzarias",
  Hamburguerias: "hamburguerias",
  "Restaurante comida brasileira": "comida-brasileira",
  "Churrascaria steakhouse": "churrascaria",
  "Restaurante japonês": "japones",
  "Restaurante massas italiano": "massas-italiano",
  "Restaurante comida árabe": "comida-arabe",
  "Açaí / sorveteria": "acai-sorveteria",
  Cafeteria: "cafeteria",
  Doceria: "doceria",
  Gastrobar: "gastrobar",
  Outros: "outros",
};

const FAIXA_A = ["100 mil até 150 mil", "150 mil até 250 mil", "250 mil até 400 mil", "400 mil até 600 mil", "600 mil até 1 milhão", "Mais de 1 milhão"];
const FAIXA_B = ["50 mil até 80 mil"];
const FAIXA_C = ["30 mil até 50 mil"];

export function qualificacaoWp(faturamento: string, disposto: string) {
  let slug = "obrigado";
  let tipo = "qualificado-geral";
  if (faturamento === "Até 30 mil" && disposto === "agradecimento") {
    slug = "agradecimento";
    tipo = "desqualificado";
  } else if (FAIXA_A.includes(faturamento)) {
    slug = "obrigado-a";
    tipo = "a";
  } else if (FAIXA_B.includes(faturamento)) {
    slug = "obrigado-b";
    tipo = "b";
  } else if (FAIXA_C.includes(faturamento) || faturamento === "Até 30 mil") {
    slug = "obrigado-c";
    tipo = "c";
  }
  return { slug, tipo, url: `https://assessorialpha.com/${slug}/` };
}

// "+55 (11) 98765-4321": DDI + espaço + o que a máscara do WP deixava no campo.
export function telefoneWp(e164: string) {
  const p = parsePhoneNumberFromString(e164);
  if (!p) return e164;
  const ddi = p.countryCallingCode;
  let d = String(p.nationalNumber);
  let campo: string;
  if (ddi === "55") {
    d = d.slice(0, 11);
    campo = d;
    if (d.length > 2) campo = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) campo = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  } else {
    campo = d.slice(0, 15);
  }
  return `+${ddi} ${campo}`.trim();
}

const SEARCH_ENGINES = ["google.", "bing.", "yahoo.", "duckduckgo.", "baidu.", "yandex."];
const SOCIAL_DOMAINS = ["instagram.com", "facebook.com", "fb.com", "l.facebook.com", "lm.facebook.com", "tiktok.com", "linkedin.com", "t.co", "twitter.com", "x.com", "youtube.com", "wa.me", "whatsapp.com"];

// classificarOrigemOrganica() do WP: sem utm_source e utm_medium, a origem vem do referrer.
export function origemOrganica(referrer: string, pageHost: string) {
  if (!referrer) return { utm_source: "direto", utm_medium: "nenhum" };
  let hostname: string;
  try {
    hostname = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return { utm_source: "direto", utm_medium: "nenhum" };
  }
  if (pageHost && hostname.includes(pageHost)) return { utm_source: "direto", utm_medium: "nenhum" };
  if (SEARCH_ENGINES.some((s) => hostname.includes(s))) return { utm_source: hostname.split(".")[0], utm_medium: "organico" };
  if (SOCIAL_DOMAINS.some((s) => hostname.includes(s))) return { utm_source: hostname.split(".")[0], utm_medium: "organico" };
  return { utm_source: hostname, utm_medium: "referral" };
}

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : "");

export type ContextoWp = { pageUrl?: unknown; referrer?: unknown; utms?: unknown };

export function buildWpGeralBody(opts: {
  lead: { nome: string; email: string; telefone: string; empresa: string; segmento: string; faturamento: string; cnpj?: string; investiria?: "Sim" | "Não" };
  ctx?: ContextoWp;
  now?: Date;
}) {
  const { lead } = opts;
  const ctx = opts.ctx ?? {};
  const pageUrl = str(ctx.pageUrl);
  const referrer = str(ctx.referrer);
  const ate30 = lead.faturamento === "Até 30 mil";
  const disposto = ate30 ? (lead.investiria === "Não" ? "agradecimento" : "obrigado") : "";
  const q = qualificacaoWp(lead.faturamento, disposto);

  const raw = ctx.utms && typeof ctx.utms === "object" ? (ctx.utms as Record<string, unknown>) : {};
  const utms = {} as Record<(typeof WP_GERAL_UTM_KEYS)[number], string>;
  for (const k of WP_GERAL_UTM_KEYS) utms[k] = str(raw[k]);
  if (!utms.utm_source && !utms.utm_medium) {
    let host = "";
    try {
      host = pageUrl ? new URL(pageUrl).hostname : "";
    } catch {}
    Object.assign(utms, origemOrganica(referrer, host));
  }

  return {
    nome: lead.nome.trim(),
    email: lead.email.trim(),
    telefone: telefoneWp(lead.telefone),
    empresa: lead.empresa.trim(),
    segmento: SEGMENTO_SLUG[lead.segmento] ?? lead.segmento,
    faturamento: lead.faturamento,
    disposto_investir: disposto,
    cnpj: ate30 ? (lead.cnpj ?? "") : "",
    tipo_lead: q.tipo,
    redirect_url: q.url,
    ...utms,
    page_url: pageUrl,
    referrer,
    submitted_at: (opts.now ?? new Date()).toISOString(),
  };
}
