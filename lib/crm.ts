import { parsePhoneNumberFromString } from "libphonenumber-js";
import { FATURAMENTOS_POP, ISCA_LPS, SEGMENTOS_POP, type IscaSlug } from "@/lib/content-pop";
import { SITE_URL } from "@/lib/site";
import { TZ_LEAD_FIELDS, TZ_UTM_KEYS, type TzLead } from "@/lib/tz-lead-constants";
import { TRACKING_KEYS, type LeadFormData, type LeadTracking } from "@/lib/validation";

// Entrada de leads própria do CRM comercial (Dashboard-Comercial-Back-V2), que substituiu
// o n8n e a rota genérica antiga de leads externos (destination "hq"):
//   POST {CRM_API_URL}/external/lead-intake/food/<rota>, header x-api-key = LEAD_INTAKE_FOOD_KEY
// Contrato: docs/modules/lead-intake.md do CRM. Cada form chama UMA rota, uma vez:
//   - lp:     home e LPs de restaurante (o CRM classifica A–E; pago vai primeiro pro Growth
//             Hub, orgânico entra na Matriz, E vira oportunidade no GH)
//   - isca:   LPs de isca (régua das iscas, piso D; Matriz + e-mail do material + planilha)
//   - lm:     lead magnets (LM/VSL; E vira oportunidade no GH, o resto entra na Matriz)
//   - raio-x: aceite do Raio-X no obrigado das iscas
// Respostas: 2xx com `status` = recebido (inclusive "ignored"/"duplicate": não reenviar);
// 400 = recusado pelo filtro de segurança ou dado inválido (não reenviar); 401/403 = chave;
// 5xx = falha do CRM/Growth Hub (pode reenviar). A chave fica só no servidor.

export type FoodIntakeRoute = "lp" | "isca" | "lm" | "raio-x";

export type IntakeBody = Record<string, string>;

// httpStatus 0 = não houve resposta (env faltando, rede ou timeout).
// rejected = o CRM recusou o conteúdo (400): reenviar igual não adianta.
export type CrmResult =
  | { ok: true; httpStatus: number; status?: string; crmLeadId?: string }
  | { ok: false; httpStatus: number; rejected: boolean; reason: string };

// O food/lp pode esperar o Growth Hub (timeout de 20 s do lado do CRM).
const TIMEOUT_MS = 25_000;

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Tira campos vazios: o CRM trata ausente e vazio igual, e o corpo fica menor.
function compact(obj: Record<string, string | undefined>): IntakeBody {
  const out: IntakeBody = {};
  for (const [k, v] of Object.entries(obj)) if (typeof v === "string" && v.trim()) out[k] = v.trim();
  return out;
}

function trackingFields(tracking: LeadTracking) {
  const out: Record<string, string | undefined> = {};
  for (const key of TRACKING_KEYS) out[key] = tracking[key];
  return out;
}

export function pageUrlOf(path: string) {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

// food/lp. `origem` diz de qual página o lead veio (vira o `source` do lead no CRM).
// Nada de destino ou categoria aqui: quem decide é o CRM.
export function buildFoodLpBody(opts: { lead: LeadFormData; tracking: LeadTracking; origem: string; pageUrl: string }): IntakeBody {
  const { lead } = opts;
  return compact({
    origem: opts.origem,
    nome: lead.nome,
    email: lead.email,
    telefone: lead.telefone,
    // As LPs de POP não pedem empresa: sem valor, o campo não vai.
    empresa: lead.empresa,
    segmento: lead.segmento,
    faturamento: lead.faturamento,
    investiria: lead.investiria,
    cnpj: lead.cnpj,
    ...trackingFields(opts.tracking),
    page_url: opts.pageUrl,
  });
}

// food/lm. `lead_magnet` identifica a LM (catálogo do CRM: nome, e-mail da Brevo, planilha).
// Sem `tipo_lead`: o CRM classifica pela régua v3 do faturamento.
export function buildLmBody(opts: { lead: LeadFormData; tracking: LeadTracking; leadMagnet: string; pageUrl: string }): IntakeBody {
  const { lead } = opts;
  return compact({
    lead_magnet: opts.leadMagnet,
    nome: lead.nome,
    email: lead.email,
    telefone: lead.telefone,
    empresa: lead.empresa,
    segmento: lead.segmento,
    faturamento: lead.faturamento,
    investiria: lead.investiria,
    cnpj: lead.cnpj,
    ...trackingFields(opts.tracking),
    page_url: opts.pageUrl,
  });
}

function labelDe(lista: readonly { label: string; value: string }[], value: string) {
  return lista.find((o) => o.value === value)?.label ?? value;
}

// food/isca. Mesmos campos do lead da isca do WP: o CRM converte o segmento pelo rótulo
// ("Churrascaria/steakhouse") e lê a faixa pelo rótulo ("30–50 mil"). Fica também no
// navegador (tzLead) para o aceite do Raio-X.
export function buildTzLead(opts: {
  slug: IscaSlug;
  pageUrl: unknown;
  lead: { nome: string; email: string; telefone: string; segmento: string; faturamento: string };
  rawTracking?: unknown;
  now?: Date;
}): TzLead {
  const { isca } = ISCA_LPS[opts.slug];
  const t = opts.rawTracking && typeof opts.rawTracking === "object" ? (opts.rawTracking as Record<string, unknown>) : {};
  const lead: Record<string, string> = {
    isca,
    origem_pagina: opts.slug,
    page_url: str(opts.pageUrl, 1000).split("#")[0],
    nome: opts.lead.nome.trim(),
    telefone: opts.lead.telefone,
    email: opts.lead.email.trim().toLowerCase(),
    segmento: labelDe(SEGMENTOS_POP, opts.lead.segmento),
    faturamento: labelDe(FATURAMENTOS_POP, opts.lead.faturamento),
    enviado_em: (opts.now ?? new Date()).toISOString(),
  };
  for (const k of TZ_UTM_KEYS) lead[k] = str(t[k]);
  if (!lead.utm_campaign) lead.utm_campaign = isca;
  if (!lead.utm_id) lead.utm_id = "Leads";
  return lead as TzLead;
}

const ISCAS_CONHECIDAS = new Set<string>(Object.values(ISCA_LPS).map((l) => l.isca));

// food/raio-x: o lead da isca salvo no navegador + a isca do obrigado. Sem telefone (abriu
// a página direto) não envia: não vai lead vazio pro comercial. Só passam os campos do lead
// da isca (o resto do localStorage é ignorado).
export function buildRaioXBody(opts: { lead: unknown; isca: unknown; pageUrl: unknown }): IntakeBody | null {
  const raw = opts.lead && typeof opts.lead === "object" ? (opts.lead as Record<string, unknown>) : null;
  if (!raw) return null;
  const dados: Record<string, string> = {};
  for (const k of TZ_LEAD_FIELDS) if (Object.hasOwn(raw, k)) dados[k] = str(raw[k], k === "page_url" ? 1000 : 500);
  // Lead salvo antes da troca pode ter o telefone mascarado; o CRM aceita E.164.
  const tel = parsePhoneNumberFromString(dados.telefone ?? "", "BR");
  if (tel) dados.telefone = tel.number;
  if (!dados.telefone) return null;
  // ?isca= do obrigado vale quando é uma isca conhecida; senão (ex.: utm_campaign
  // qualquer), fica a do lead salvo.
  const isca = str(opts.isca, 80);
  dados.isca = ISCAS_CONHECIDAS.has(isca) ? isca : dados.isca || isca;
  dados.page_url = str(opts.pageUrl, 1000).split("#")[0];
  return compact(dados);
}

// Logs só com status, código e motivos do CRM (nomes de campo): nunca o corpo do lead,
// a URL nem a chave.
export async function sendToLeadIntake(
  route: FoodIntakeRoute,
  body: IntakeBody,
  fetchImpl: typeof fetch = fetch
): Promise<CrmResult> {
  const baseUrl = process.env.CRM_API_URL;
  const apiKey = process.env.CRM_LEAD_INTAKE_FOOD_KEY;
  if (!baseUrl || !apiKey) {
    console.error("[crm] CRM_API_URL / CRM_LEAD_INTAKE_FOOD_KEY não definidas");
    return { ok: false, httpStatus: 0, rejected: false, reason: "crm_not_configured" };
  }

  try {
    const res = await fetchImpl(`${baseUrl.replace(/\/+$/, "")}/external/lead-intake/food/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data = (await res.json().catch(() => null)) as {
      status?: unknown;
      crmLeadId?: unknown;
      code?: unknown;
      reasons?: unknown;
    } | null;

    if (!res.ok) {
      const code = typeof data?.code === "string" ? data.code : "sem_codigo";
      const reasons = Array.isArray(data?.reasons) ? ` [${data.reasons.map(String).join("; ").slice(0, 300)}]` : "";
      console.error(`[crm] food/${route} retornou ${res.status} (${code})${reasons}`);
      return { ok: false, httpStatus: res.status, rejected: res.status === 400, reason: code };
    }
    return {
      ok: true,
      httpStatus: res.status,
      status: typeof data?.status === "string" ? data.status : undefined,
      crmLeadId: typeof data?.crmLeadId === "string" ? data.crmLeadId : undefined,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.name : "erro_desconhecido";
    console.error(`[crm] Falha de rede ao chamar food/${route} (${reason})`);
    return { ok: false, httpStatus: 0, rejected: false, reason };
  }
}
