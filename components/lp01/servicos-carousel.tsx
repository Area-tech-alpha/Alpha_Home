"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

type Card = { src: string; alt: string };

// Carrossel dos serviços: 1 card por vez, infinito, autoplay (5 s no WP) que
// pausa no hover/foco, fora da tela e no botão de pausa; sem autoplay com
// prefers-reduced-motion. Setas, dots e swipe no celular.
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

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Serviços da Alpha"
      className="relative mx-auto w-full max-w-[820px]"
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
        className="overflow-hidden rounded-[22px] border border-border"
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
          className="flex transition-transform duration-500 ease-[var(--ease)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
          aria-live={playing ? "off" : "polite"}
        >
          {cards.map((card, i) => (
            <div
              key={card.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${count}: ${card.alt}`}
              aria-hidden={i !== index}
              inert={i !== index}
              className="w-full shrink-0"
            >
              <Image
                src={card.src}
                alt={card.alt}
                width={width}
                height={height}
                sizes="(max-width: 900px) 92vw, 820px"
                draggable={false}
                className="h-auto w-full select-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Serviço anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong text-white transition-colors hover:border-gold-1 hover:text-gold-1"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <ul className="flex items-center" aria-label="Escolher serviço">
          {cards.map((card, i) => (
            <li key={card.src}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={card.alt}
                aria-current={i === index}
                className="flex h-11 w-6 items-center justify-center"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-5 bg-gold-1" : "w-2 bg-white/30"
                  }`}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Próximo serviço"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong text-white transition-colors hover:border-gold-1 hover:text-gold-1"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>

        {!reduced && (
          <button
            type="button"
            onClick={() => setStopped((s) => !s)}
            aria-label={stopped ? "Retomar rotação automática" : "Pausar rotação automática"}
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-muted transition-colors hover:text-white"
          >
            {stopped ? (
              <Play className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Pause className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
