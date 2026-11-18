// Só navegador: atribuição first-touch e o lead que vai da página 1 para a 2.
import { parseSentMarkPizzaria } from "@/lib/obrigado-pizzaria";
import {
  LEAD_STORAGE_KEY_PIZZARIA,
  LEAD_TTL_MS_PIZZARIA,
  SENT_MARK_STORAGE_KEY_PIZZARIA,
  TRACKING_KEYS_PIZZARIA,
  TRACKING_STORAGE_KEY_PIZZARIA,
  TRACKING_TTL_MS_PIZZARIA,
  type LeadTrackingPizzaria,
} from "@/lib/lead-pizzaria-constants";

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// First-touch (mesmo padrão da /01-lp): a primeira visita com parâmetros de
// campanha fica gravada por 30 dias. fbc/gcl_aw vêm dos cookies _fbc/_gcl_aw;
// sem cookie, o fbc segue o formato do Meta a partir do fbclid da URL.
export function readFirstTouchPizzaria(): LeadTrackingPizzaria {
  let stored: { at: number; tracking: LeadTrackingPizzaria } | null = null;
  try {
    stored = JSON.parse(localStorage.getItem(TRACKING_STORAGE_KEY_PIZZARIA) ?? "null");
  } catch {
    stored = null;
  }
  const valid = stored && Date.now() - stored.at < TRACKING_TTL_MS_PIZZARIA ? stored.tracking : null;

  const fromUrl: LeadTrackingPizzaria = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of TRACKING_KEYS_PIZZARIA) {
    const value = params.get(key);
    if (value) fromUrl[key] = value;
  }
  if (fromUrl.fbclid && !fromUrl.fbc) fromUrl.fbc = `fb.1.${Date.now()}.${fromUrl.fbclid}`;

  const tracking = valid ?? fromUrl;
  if (!valid && Object.keys(fromUrl).length > 0) {
    try {
      localStorage.setItem(TRACKING_STORAGE_KEY_PIZZARIA, JSON.stringify({ at: Date.now(), tracking: fromUrl }));
    } catch {
      // Sem storage (aba anônima): vale só para esta visita.
    }
  }

  const fbcCookie = readCookie("_fbc");
  const gclCookie = readCookie("_gcl_aw");
  return {
    ...tracking,
    ...(!tracking.fbc && fbcCookie && { fbc: fbcCookie }),
    ...(!tracking.gcl_aw && gclCookie && { gcl_aw: gclCookie }),
  };
}

// Grava nos dois storages, como o WP: sessionStorage (mesma aba) e
// localStorage com carimbo de hora (fallback de 2h, ex.: link aberto em outra aba).
export function saveLeadPizzaria(stored: unknown) {
  try {
    sessionStorage.setItem(LEAD_STORAGE_KEY_PIZZARIA, JSON.stringify(stored));
  } catch {}
  try {
    localStorage.setItem(LEAD_STORAGE_KEY_PIZZARIA, JSON.stringify({ ...(stored as object), _ts: Date.now() }));
  } catch {}
}

export function readLeadPizzaria(): unknown {
  try {
    const s = sessionStorage.getItem(LEAD_STORAGE_KEY_PIZZARIA);
    if (s) return JSON.parse(s);
  } catch {}
  try {
    const l = localStorage.getItem(LEAD_STORAGE_KEY_PIZZARIA);
    if (l) {
      const obj = JSON.parse(l);
      if (obj && obj._ts && Date.now() - obj._ts < LEAD_TTL_MS_PIZZARIA) {
        delete obj._ts;
        return obj;
      }
    }
  } catch {}
  return null;
}

// Marca "lead já enviado pela resultado" (lead + data). Os dois storages, como o lead da VSL.
export function saveSentMarkPizzaria(lead: unknown) {
  const mark = JSON.stringify({ lead, enviado_em: new Date().toISOString() });
  try {
    sessionStorage.setItem(SENT_MARK_STORAGE_KEY_PIZZARIA, mark);
  } catch {}
  try {
    localStorage.setItem(SENT_MARK_STORAGE_KEY_PIZZARIA, mark);
  } catch {}
}

// Devolve o que está gravado (válido e dentro das 2h) ou null.
export function readSentMarkPizzaria(): unknown {
  for (const storage of ["sessionStorage", "localStorage"] as const) {
    try {
      const raw = window[storage].getItem(SENT_MARK_STORAGE_KEY_PIZZARIA);
      const mark = raw ? parseSentMarkPizzaria(JSON.parse(raw)) : null;
      if (mark) return mark;
    } catch {}
  }
  return null;
}

export function clearLeadPizzaria() {
  for (const key of [LEAD_STORAGE_KEY_PIZZARIA, SENT_MARK_STORAGE_KEY_PIZZARIA]) {
    try {
      sessionStorage.removeItem(key);
    } catch {}
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}
