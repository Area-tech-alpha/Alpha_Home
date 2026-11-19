"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitRaioXAceite } from "@/app/actions/submit-lead-pop";
import { Ic } from "@/components/pop/icons";
import { contentRaioX as c, raioXVariacao } from "@/lib/content-raio-x";
import { TZ_LEAD_KEY } from "@/lib/lead-webhook-constants";

// Partes do /raio-x-do-restaurante que dependem do navegador (a página é estática).

// Mesmo critério do WP: ?isca= (vindo das LPs daqui) ou utm_campaign. useSearchParams
// acompanha também a navegação feita pelo form (router.push). Na página estática o
// HTML sai com o espaço vazio (Suspense) e o texto entra no navegador.
function useIsca() {
  const sp = useSearchParams();
  return sp.get("isca") || sp.get("utm_campaign");
}

function lerLead(): Record<string, unknown> | null {
  try {
    return JSON.parse(localStorage.getItem(TZ_LEAD_KEY) || "null");
  } catch {
    return null;
  }
}

// Barra de confirmação e etiqueta do hero. No servidor fica vazio (espaço reservado
// no CSS); isca ausente ou desconhecida cai no texto padrão do WP.
function IscaTextoIn({ campo }: { campo: "barra" | "etq" }) {
  const isca = useIsca();
  return <span data-isca-texto={campo}>{raioXVariacao(isca ?? undefined)[campo]}</span>;
}
export function IscaTexto({ campo }: { campo: "barra" | "etq" }) {
  return (
    <Suspense fallback={<span data-isca-texto={campo} />}>
      <IscaTextoIn campo={campo} />
    </Suspense>
  );
}

// "Abrir minha calculadora": só para quem veio da /calculadora-de-cmv (?calc=1).
function AbrirCalcIn() {
  const isca = useIsca();
  const calc = useSearchParams().get("calc");
  if (isca !== "isca-cmv" || calc !== "1") return null;
  return (
    <a className="tz-btn2" href={c.abrirCalc.href} target="_blank" rel="noopener">
      <Ic name="external" />
      {c.abrirCalc.label}
    </a>
  );
}
export function AbrirCalc() {
  return (
    <Suspense fallback={null}>
      <AbrirCalcIn />
    </Suspense>
  );
}

// "Quero meu Raio-X gratuito": mostra a confirmação e, como no WP, manda o lead
// salvo no navegador ao n8n (LEAD_WEBHOOK_URL_RAIO_X, pela server action) uma vez.
// Sem lead salvo (abriu a página direto), só mostra a confirmação.
export function RaioXOk() {
  const [on, setOn] = useState(false);
  const enviado = useRef(false);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!(e.target as Element | null)?.closest?.("[data-raiox]")) return;
      setOn(true);
      document.documentElement.classList.add("tz-lock");
      document.body.classList.add("tz-lock");
      if (enviado.current) return;
      enviado.current = true;
      const lead = lerLead();
      const qs = new URLSearchParams(window.location.search);
      const isca = qs.get("isca") || qs.get("utm_campaign") || (typeof lead?.isca === "string" ? lead.isca : "");
      try {
        localStorage.setItem("tzRaioX", new Date().toISOString());
      } catch {}
      if (lead && lead.telefone) void submitRaioXAceite(lead, isca, window.location.href.split("#")[0]).catch(() => {});
    }
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.documentElement.classList.remove("tz-lock");
      document.body.classList.remove("tz-lock");
    };
  }, []);
  return (
    <div className="tz-ok" data-on={on ? "true" : undefined} role="dialog" aria-modal="true" aria-labelledby="tz-ok-t" aria-hidden={!on} inert={!on}>
      <div className="tz-ok-in">
        <span className="tz-ok-ic">
          <Ic name="check" />
        </span>
        <h2 className="tz-sec-h" id="tz-ok-t">
          {c.ok.title}
        </h2>
        <p>{c.ok.texto}</p>
      </div>
    </div>
  );
}

// Depoimentos em vídeo: um toca por vez, com som, ao tocar no card (como no WP).
export function RaioXVideos() {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  function play(i: number) {
    refs.current.forEach((v, j) => j !== i && v?.pause());
    const v = refs.current[i];
    if (!v) return;
    setPlaying(i);
    v.muted = false;
    void v.play();
  }
  return (
    <div className="tz-car">
      {c.testado.videos.map((v, i) => (
        <div key={v.slug} className="tz-vid" data-on={playing === i ? "true" : undefined}>
          <video
            ref={(el) => {
              refs.current[i] = el;
            }}
            src={`/videos/depoimento-${v.slug}.mp4`}
            poster={`/videos/depoimento-${v.slug}-poster.jpg`}
            preload="none"
            playsInline
            controls={playing === i}
            onPlay={() => refs.current.forEach((o, j) => j !== i && o?.pause())}
          />
          <button type="button" className="tz-vid-play" aria-label={`Assistir depoimento de ${v.nome}`} onClick={() => play(i)}>
            <i>
              <Ic name="play" />
            </i>
            <b>{v.nome}</b>
            <span>{v.tipo}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
