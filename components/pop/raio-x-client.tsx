"use client";

import { useEffect, useRef, useState } from "react";
import { Ic } from "@/components/pop/icons";
import { contentRaioX as c } from "@/lib/content-raio-x";

// "Quero meu Raio-X gratuito": no WP o clique mostra a tela de confirmação e manda o
// lead (salvo no navegador) para um webhook do n8n com a tag "aceitou-raio-x". Aqui
// o lead já foi ao CRM no envio do form, então o clique só mostra a confirmação
// (nenhum envio). Ver Pendências no README.
export function RaioXOk() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!(e.target as Element | null)?.closest?.("[data-raiox]")) return;
      setOn(true);
      document.documentElement.classList.add("tz-lock");
      document.body.classList.add("tz-lock");
    }
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.documentElement.classList.remove("tz-lock");
      document.body.classList.remove("tz-lock");
    };
  }, []);
  return (
    <div className={on ? "tz-ok on" : "tz-ok"} role="dialog" aria-modal="true" aria-labelledby="tz-ok-t" aria-hidden={!on} inert={!on}>
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
        <div key={v.slug} className={playing === i ? "tz-vid on" : "tz-vid"}>
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
