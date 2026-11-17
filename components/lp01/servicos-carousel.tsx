"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Card = { src: string; alt: string };

// Carrossel "O que fazemos": mais largo que o resto da seção (área dos cards
// até 1440px). 3 cards inteiros no desktop (>=1024px, gap 20px), 2 no tablet e
// 1 no celular com os vizinhos aparecendo nas bordas; os cards crescem na
// proporção da imagem. Setas por fora dos cards no desktop (no padding lateral,
// sem rolagem horizontal) e por cima da borda no tablet/celular.
//
// Troca: desliza 1 card por vez (transition do transform em lp01.css). Loop
// infinito contínuo: a lista é renderizada 3 vezes (a do meio é a real, as das
// pontas são clones); quando o deslize termina num clone, a posição volta para o
// card real equivalente sem animação, então o carrossel sempre anda para o
// mesmo lado, sem "retão" de volta ao primeiro.
//
// Autoplay (autoplayMs) pausa no hover, no foco por teclado, durante o arraste,
// fora da tela e no botão de pausa (visível só no foco do teclado). Com
// prefers-reduced-motion não há autoplay e a troca é seca. Setas, teclado e
// arraste (dedo ou mouse) reiniciam o timer.
const PER_VIEW_QUERIES: [string, number][] = [
  ["(min-width: 1024px)", 3],
  ["(min-width: 768px)", 2],
];
// Arraste maior que 15% da largura de um card troca de card; menor, volta.
const DRAG_THRESHOLD = 0.15;

export default function ServicosCarousel({
  cards,
  autoplayMs,
  width,
  height,
  className = "",
}: {
  cards: readonly Card[];
  autoplayMs: number;
  width: number;
  height: number;
  className?: string;
}) {
  const count = cards.length;
  // Posição no trilho de 3 cópias; o card real "count + i" é o card i.
  const [pos, setPos] = useState(count);
  const [animate, setAnimate] = useState(true);
  const [dragDx, setDragDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0); // reinicia o timer depois de navegação manual
  const [perView, setPerView] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const moving = useRef(false); // há um deslize animado em andamento
  const drag = useRef<{ id: number; x: number; y: number; horizontal: boolean | null } | null>(null);

  const index = (((pos - count) % count) + count) % count;

  // Leva um clone para o card real equivalente (mesmo visual, outro lugar no trilho).
  const normalize = useCallback(
    (p: number) => {
      let n = p;
      while (n >= 2 * count) n -= count;
      while (n < count) n += count;
      return n;
    },
    [count]
  );

  const step = useCallback(
    (delta: number) => {
      // Sem deslize em andamento, parte sempre do card real.
      const base = moving.current ? pos : normalize(pos);
      const next = Math.min(Math.max(base + delta, 0), 3 * count - 1);
      moving.current = !reduced;
      setAnimate(!reduced);
      setPos(reduced ? normalize(next) : next);
    },
    [count, normalize, pos, reduced]
  );

  const go = useCallback(
    (delta: number) => {
      step(delta);
      setTick((t) => t + 1);
    },
    [step]
  );

  // Fim do deslize: se parou num clone, reposiciona no real sem animação e
  // religa a transition no frame seguinte.
  function onTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    moving.current = false;
    const n = normalize(pos);
    if (n === pos) return;
    setAnimate(false);
    setPos(n);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
  }

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

  const playing = !reduced && !stopped && visible && !hovered && !focused && !dragging;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => step(1), autoplayMs);
    return () => window.clearTimeout(id);
  }, [playing, pos, tick, autoplayMs, step]);

  function cardWidth() {
    const first = trackRef.current?.firstElementChild as HTMLElement | null;
    return first?.getBoundingClientRect().width ?? 1;
  }

  // ===== Arraste (dedo e mouse) =====
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, horizontal: null };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.horizontal === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      // Gesto vertical fica com a rolagem da página (touch-action: pan-y).
      d.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!d.horizontal) {
        drag.current = null;
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      // Se um deslize estava no meio, começa do card real (sem salto visível).
      if (moving.current) {
        moving.current = false;
        setPos(normalize(pos));
      }
      setDragging(true);
      setAnimate(false);
    }
    setDragDx(dx);
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.horizontal) return;
    const dx = cancelled ? 0 : e.clientX - d.x;
    setDragging(false);
    setDragDx(0);
    setAnimate(!reduced);
    if (Math.abs(dx) > cardWidth() * DRAG_THRESHOLD) go(dx < 0 ? 1 : -1);
    else setTick((t) => t + 1); // volta para o lugar (com a mesma animação)
  }

  const slides = [...cards, ...cards, ...cards];

  // Cards reais (cópia do meio) que estão na tela; só eles ficam para o leitor de tela.
  const shown = new Set(Array.from({ length: perView }, (_, k) => (index + k) % count));

  const arrow =
    "absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-[27px] border border-white/10 bg-[#151515] p-[10px] text-white transition-transform hover:scale-105 md:px-[15px] md:py-[16px]";

  return (
    // Padding lateral: 20px; no desktop, 72px para as setas ficarem fora dos cards.
    <div className={`w-full px-5 lg:px-[72px] ${className}`}>
      <div
        ref={rootRef}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Serviços da Alpha"
        className="relative mx-auto w-full max-w-[1440px]"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
        // Só o foco por teclado pausa: o clique numa seta reinicia o timer e segue.
        onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <div
          className={`select-none md:overflow-hidden ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, false)}
          onPointerCancel={(e) => endDrag(e, true)}
        >
          <div
            ref={trackRef}
            className="lp01-carousel-track flex gap-[var(--gap)] [--gap:0px] [--per:1] md:[--gap:20px] md:[--per:2] lg:[--per:3]"
            data-animate={animate && !dragging ? "true" : "false"}
            onTransitionEnd={onTransitionEnd}
            style={{
              transform: `translateX(calc(-1 * ${pos} * ((100% - (var(--per) - 1) * var(--gap)) / var(--per) + var(--gap)) + ${dragDx}px))`,
            }}
            aria-live={playing ? "off" : "polite"}
          >
            {slides.map((card, i) => {
              const real = i >= count && i < 2 * count;
              const current = real && shown.has(i - count);
              return (
                <div
                  key={`${i}-${card.src}`}
                  role={current ? "group" : undefined}
                  aria-roledescription={current ? "slide" : undefined}
                  aria-label={current ? `${(i % count) + 1} de ${count}: ${card.alt}` : undefined}
                  aria-hidden={!current}
                  // Clones e cards fora da tela: fora do Tab e do leitor de tela
                  // (inert vale também para links/botões dentro do card).
                  inert={!current}
                  tabIndex={current ? undefined : -1}
                  data-clone={real ? undefined : "true"}
                  className="shrink-0"
                  style={{ width: "calc((100% - (var(--per) - 1) * var(--gap)) / var(--per))" }}
                >
                  <Image
                    src={card.src}
                    alt={current ? card.alt : ""}
                    width={width}
                    height={height}
                    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(50vw - 30px), 480px"
                    draggable={false}
                    className="pointer-events-none h-auto w-full select-none"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Serviço anterior"
          className={`${arrow} left-[-12px] md:left-[-14px] lg:left-[-64px]`}
        >
          <svg viewBox="0 0 448 512" width="17" height="17" fill="currentColor" aria-hidden="true">
            <path d="m257.5 445.1-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Próximo serviço"
          className={`${arrow} right-[-12px] md:right-[-14px] lg:right-[-64px]`}
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
    </div>
  );
}
