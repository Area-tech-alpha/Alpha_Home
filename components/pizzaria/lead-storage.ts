// Só navegador: atribuição first-touch das LPs da pizzaria.
import {
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
// sem cookie, o fbc segue o formato do Meta a partir do fbclid da URL. Isso é só
// dado de atribuição que segue no lead: nenhuma LP carrega pixel da Meta. O CRM
// recebe utm_*, fbclid, fbc e fbp.
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
  const fbpCookie = readCookie("_fbp");
  return {
    ...tracking,
    ...(!tracking.fbc && fbcCookie && { fbc: fbcCookie }),
    ...(!tracking.gcl_aw && gclCookie && { gcl_aw: gclCookie }),
    ...(fbpCookie && { fbp: fbpCookie }),
  };
}
