"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Volume1, Volume2, VolumeX } from "lucide-react";
import { confirmLeadPizzaria } from "@/app/actions/submit-lead-pizzaria";
import {
  clearLeadPizzaria,
  readFirstTouchPizzaria,
  readLeadPizzaria,
  readSentMarkPizzaria,
} from "@/components/pizzaria/lead-storage";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { FRACAO_GATE_PIZZARIA } from "@/lib/lead-pizzaria-constants";
import { decidirConfirmacaoPizzaria } from "@/lib/obrigado-pizzaria";

const { obrigado } = contentPizzaria;
const { gate, sound, video: vsl } = obrigado;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

type Label = { kind: "waiting" } | { kind: "countdown"; seconds: number } | { kind: "done" } | { kind: "preview" };

// Mesmas regras do WP (travarVideoNativo + marcarProgresso):
// - o vídeo começa sozinho e mudo (único autoplay garantido), sem controles;
// - não dá para pausar (volta a tocar) nem adiantar (o seek volta ao máximo assistido);
// - a barra enche até a metade do vídeo e mostra "Libera em m:ss";
// - aos 50% libera o botão, que manda o lead e leva para o PDF;
// - ?preview=liberado libera na hora (para conferir o botão).
// Novo: aviso "Clique para ativar o som" por cima do vídeo enquanto ele está
// mudo, e controle de volume (mudo/som + slider). Ativar o som não reinicia o vídeo.
export default function VslGate() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const maxSeg = useRef(0);
  const fracaoMax = useRef(0);
  const liberadoRef = useRef(false);
  const soundTouched = useRef(false);
  const enviado = useRef(false);

  const [fill, setFill] = useState(0);
  const [label, setLabel] = useState<Label>({ kind: "waiting" });
  const [liberado, setLiberado] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [soundOn, setSoundOn] = useState(false); // já ativou o som alguma vez
  const [sending, setSending] = useState(false);

  function liberar(preview = false) {
    if (liberadoRef.current) return;
    liberadoRef.current = true;
    setLiberado(true);
    setFill(100);
    setLabel(preview ? { kind: "preview" } : { kind: "done" });
    requestAnimationFrame(() => buttonRef.current?.focus({ preventScroll: true }));
  }

  function tryPlay() {
    const p = videoRef.current?.play();
    if (p) p.catch(() => {});
  }

  function applySound(nextMuted: boolean, nextVolume = volume) {
    const v = videoRef.current;
    if (!v) return;
    v.muted = nextMuted;
    v.volume = nextVolume;
    setMuted(nextMuted);
    setVolume(nextVolume);
    if (!nextMuted) setSoundOn(true);
    tryPlay();
  }

  function enableSound() {
    soundTouched.current = true;
    applySound(false, volume > 0 ? volume : 1);
  }

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    tryPlay();

    // WP: o primeiro clique em qualquer lugar da página liga o som.
    const onFirstClick = () => {
      if (soundTouched.current) return;
      soundTouched.current = true;
      v.muted = false;
      setMuted(false);
      setSoundOn(true);
      tryPlay();
    };
    document.addEventListener("click", onFirstClick, { once: true });

    const onPause = () => {
      if (!v.ended && !liberadoRef.current) tryPlay();
    };
    const clamp = () => {
      if (v.currentTime > maxSeg.current + 1.2) v.currentTime = maxSeg.current;
    };
    const onTime = () => {
      clamp();
      maxSeg.current = Math.max(maxSeg.current, v.currentTime);
      // Duração real do vídeo; antes do metadata, a constante do WP (4:52).
      const duracao = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : vsl.durationSeconds;
      const fracao = Math.max(0, Math.min(1, maxSeg.current / duracao));
      fracaoMax.current = Math.max(fracaoMax.current, fracao);
      if (liberadoRef.current) return;
      setFill(Math.min(100, (fracaoMax.current / FRACAO_GATE_PIZZARIA) * 100));
      if (fracaoMax.current >= FRACAO_GATE_PIZZARIA) liberar();
      else setLabel({ kind: "countdown", seconds: Math.round((FRACAO_GATE_PIZZARIA - fracaoMax.current) * duracao) });
    };
    // Mudança vinda de fora dos nossos controles (ex.: atalho do sistema).
    const onVolume = () => {
      setMuted(v.muted);
      setVolume(v.volume);
    };

    v.addEventListener("pause", onPause);
    v.addEventListener("seeking", clamp);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onTime);
    v.addEventListener("volumechange", onVolume);

    if (new URLSearchParams(window.location.search).get("preview") === "liberado") liberar(true);

    return () => {
      document.removeEventListener("click", onFirstClick);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("seeking", clamp);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onTime);
      v.removeEventListener("volumechange", onVolume);
    };
  }, []);

  async function confirmar() {
    if (enviado.current) return;
    enviado.current = true;
    setSending(true);
    // Quem veio da /resultado-alphas-pizzaria já teve o lead enviado no submit
    // (marca no navegador): aqui só abre o PDF, sem webhook e sem "sem-form".
    if (decidirConfirmacaoPizzaria(readSentMarkPizzaria()) === "enviar") {
      try {
        // O WP não espera o webhook (fetch com keepalive). Aqui a confirmação é
        // uma server action: espera até 10s e segue para o PDF de qualquer jeito.
        await Promise.race([
          confirmLeadPizzaria({
            stored: readLeadPizzaria(),
            tracking: readFirstTouchPizzaria(),
            pageUrl: window.location.href,
            referrer: document.referrer || "",
          }),
          new Promise((resolve) => setTimeout(resolve, 10_000)),
        ]);
      } catch {
        // Falha de rede: o lead ainda vai para o PDF, como no WP.
      }
    }
    clearLeadPizzaria();
    window.location.assign(obrigado.pdfUrl);
  }

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      <div className="video-wrap">
        <video
          ref={videoRef}
          src={vsl.src}
          poster={vsl.poster}
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          onContextMenu={(e) => e.preventDefault()}
        />

        {!soundOn && (
          <button
            type="button"
            className="sound-overlay"
            onClick={(e) => {
              e.stopPropagation();
              enableSound();
            }}
          >
            <span>
              <VolumeX aria-hidden="true" />
              {sound.overlay}
            </span>
          </button>
        )}

        <div className="sound-controls" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label={muted ? sound.unmute : sound.mute}
            onClick={() => {
              soundTouched.current = true;
              if (muted) enableSound();
              else applySound(true);
            }}
          >
            <VolumeIcon aria-hidden="true" />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            aria-label={sound.volume}
            onChange={(e) => {
              soundTouched.current = true;
              const value = Number(e.target.value);
              applySound(value === 0, value === 0 ? volume : value);
            }}
            style={{ "--vol": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
          />
        </div>
      </div>

      <div className="gate">
        <div className="gate-bar">
          <div className={`gate-fill ${liberado ? "done" : ""}`} style={{ width: `${fill}%` }} />
        </div>
        <div className="gate-label" aria-live="polite">
          {label.kind === "waiting" && gate.waiting}
          {label.kind === "countdown" && (
            <>
              {gate.countdown} <b>{fmt(label.seconds)}</b>
            </>
          )}
          {label.kind === "done" && (
            <>
              <b>{gate.done[0]}</b>
              {gate.done[1]}
            </>
          )}
          {label.kind === "preview" && (
            <>
              <b>{gate.preview[0]}</b>
              {gate.preview[1]}
            </>
          )}
        </div>
      </div>

      <div className="reveal-zone">
        <div className={`reveal-btn ${liberado ? "show" : ""}`} inert={!liberado}>
          <button ref={buttonRef} type="button" className="pz-btn pz-btn-primary" disabled={sending} onClick={confirmar}>
            <Download aria-hidden="true" />
            <span>{sending ? obrigado.sending : obrigado.button}</span>
          </button>
          <div className="reveal-sub">{obrigado.buttonSub}</div>
        </div>
      </div>
    </>
  );
}
