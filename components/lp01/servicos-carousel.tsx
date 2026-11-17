"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Card = { src: string; alt: string };

// Carrossel "O que fazemos": 3 cards inteiros no desktop (>=1024px, gap 20px),
// 2 no tablet e 1 no celular com os vizinhos aparecendo nas bordas. Avança 1
// card por vez, com troca instantânea (speed 0 no WP), loop infinito, autoplay
// de 5 s que pausa no hover/foco, fora da tela e no botão de pausa (visível só
// no foco do teclado); sem autoplay com prefers-reduced-motion. Setas e swipe.
const PER_VIEW_QUERIES: [string, number][] = [
  ["(min-width: 1024px)", 3],
  ["(min-width: 768px)", 2],
];
export default function ServicosCarousel({
  cards,
  autoplayMs,
  width,
  height,
}: {
  cards: readonly Card[];
  autoplayMs: number;
  width: number;
  height: number;
}) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0); // reinicia o timer depois de navegação manual
  const [perView, setPerView] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const count = cards.length;

  const go = useCallback(
    (to: number) => {
      setIndex(((to % count) + count) % count);
      setTick((t) => t + 1);
    },
    [count]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const lists = PER_VIEW_QUERIES.map(([q, n]) => [window.matchMedia(q), n] as const);
    const update = () => setPerView(lists.find(([mq]) => mq.matches)?.[1] ?? 1);
    update();
    for (const [mq] of lists) mq.addEventListener("change", update);
    return () => {
      for (const [mq] of lists) mq.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const playing = !reduced && !stopped && visible && !hovered && !focused;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), autoplayMs);
    return () => window.clearTimeout(id);
  }, [playing, index, tick, autoplayMs, count]);

  // Três cópias da lista: a do meio é a "real"; as das pontas só preenchem as
  // laterais para o loop não ter buraco.
  const slides = [...cards, ...cards, ...cards];
  const pos = count + index;

  const arrow =
    "absolute z-10 flex items-center justify-center rounded-[27px] border border-white/10 bg-[#151515] p-[10px] text-white transition-transform hover:scale-105 md:top-1/2 md:-translate-y-1/2 md:px-[15px] md:py-[16px]";

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Serviços da Alpha"
      className="relative mx-auto mt-[21px] w-full md:mt-0"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        className="md:overflow-hidden"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          startX.current = null;
        }}
      >
        <div
          className="flex gap-[var(--gap)] [--gap:0px] [--per:1] md:[--gap:20px] md:[--per:2] lg:[--per:3]"
          style={{
            transform: `translateX(calc(-1 * ${pos} * ((100% - (var(--per) - 1) * var(--gap)) / var(--per) + var(--gap))))`,
          }}
          aria-live={playing ? "off" : "polite"}
        >
          {slides.map((card, i) => {
            // Só os cards inteiros na tela ficam na árvore de acessibilidade.
            const current = i >= pos && i < pos + perView;
            return (
              <div
                key={`${i}-${card.src}`}
                role={current ? "group" : undefined}
                aria-roledescription={current ? "slide" : undefined}
                aria-label={current ? `${(i % count) + 1} de ${count}: ${card.alt}` : undefined}
                aria-hidden={!current}
                inert={!current}
                className="shrink-0"
                style={{ width: "calc((100% - (var(--per) - 1) * var(--gap)) / var(--per))" }}
              >
                <Image
                  src={card.src}
                  alt={current ? card.alt : ""}
                  width={width}
                  height={height}
                  sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 360px"
                  draggable={false}
                  className="h-auto w-full select-none"
                />
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Serviço anterior"
        className={`${arrow} top-[-15%] left-[38%] md:left-[-14px] lg:left-[-30px]`}
      >
        <svg viewBox="0 0 448 512" width="17" height="17" fill="currentColor" aria-hidden="true">
          <path d="m257.5 445.1-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Próximo serviço"
        className={`${arrow} top-[-15%] right-[38%] md:right-[-14px] lg:right-[-30px]`}
      >
        <svg viewBox="0 0 448 512" width="17" height="17" fill="currentColor" aria-hidden="true">
          <path d="m190.5 66.9 22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z" />
        </svg>
      </button>

      {!reduced && (
        <button
          type="button"
          onClick={() => setStopped((s) => !s)}
          className="sr-only focus:not-sr-only focus:absolute focus:bottom-2 focus:left-1/2 focus:z-10 focus:-translate-x-1/2 focus:rounded-full focus:bg-[#151515] focus:px-4 focus:py-2 focus:text-[13px] focus:text-white"
        >
          {stopped ? "Retomar rotação automática" : "Pausar rotação automática"}
        </button>
      )}
    </div>
  );
}
