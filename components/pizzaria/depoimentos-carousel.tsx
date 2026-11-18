"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { contentPizzaria, depoimentoVideo } from "@/lib/content-pizzaria";

const { depoimentos } = contentPizzaria;
const items = depoimentos.items;

// Carrossel "Donos de restaurante...": visual do WP (cards 9:16 de 236px,
// 248px a partir de 860px e 208px até 520px; gap 18px; setas no cabeçalho) com
// a mecânica do carrossel da /01-lp:
// - desliza 1 card por vez (transition do transform em pizzaria.css);
// - loop infinito: a lista é renderizada 3 vezes (a do meio é a real); quando o
//   deslize termina num clone, volta para o card real equivalente sem animação;
// - autoplay a cada autoplayMs, pausado no hover, no foco por teclado, durante o
//   arraste, fora da tela, com um depoimento tocando e com prefers-reduced-motion;
// - arraste com dedo ou mouse; setas e teclado reiniciam o timer.
// O vídeo só entra no DOM quando o card é clicado (até lá, poster estático).
const DRAG_THRESHOLD = 0.15;

export default function DepoimentosCarousel() {
  const count = items.length;
  const [pos, setPos] = useState<number>(count);
  const [animate, setAnimate] = useState(true);
  const [dragDx, setDragDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0);
  const [active, setActive] = useState<number | null>(null); // slide com o vídeo tocando
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const moving = useRef(false);
  const drag = useRef<{ id: number; x: number; y: number; horizontal: boolean | null } | null>(null);
  const suppressClick = useRef(false);

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

  function onTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    moving.current = false;
    const n = normalize(pos);
    if (n === pos) return;
    // O vídeo tocando acompanha o card real equivalente.
    setActive((a) => (a === null ? a : a + (n - pos)));
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
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const playing = !reduced && visible && !hovered && !focused && !dragging && active === null;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => step(1), depoimentos.autoplayMs);
    return () => window.clearTimeout(id);
  }, [playing, pos, tick, step]);

  function cardStep() {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return 1;
    return first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || "0");
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
      d.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!d.horizontal) {
        drag.current = null;
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
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
    // O click que vem depois do arraste não pode tocar o vídeo do card.
    suppressClick.current = true;
    window.setTimeout(() => (suppressClick.current = false), 0);
    const dx = cancelled ? 0 : e.clientX - d.x;
    setDragging(false);
    setDragDx(0);
    setAnimate(!reduced);
    if (Math.abs(dx) > cardStep() * DRAG_THRESHOLD) go(Math.max(1, Math.round(Math.abs(dx) / cardStep())) * (dx < 0 ? 1 : -1));
    else setTick((t) => t + 1);
  }

  const slides = [...items, ...items, ...items];

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Depoimentos de clientes Alpha"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="depo-head">
        <div className="pz-section-head pz-reveal">
          <span className="pz-eyebrow">{depoimentos.eyebrow}</span>
          <h2>{depoimentos.title}</h2>
          <p>{depoimentos.sub}</p>
        </div>
        <div className="depo-controls pz-reveal r-1">
          <button type="button" className="depo-btn" aria-label="Anterior" onClick={() => go(-1)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="depo-btn" aria-label="Próximo" onClick={() => go(1)}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* O reveal fica num wrapper com className fixo: o RevealPizzaria põe
          "visible" via classList, e um className que o React reescreve (ex.:
          no arraste) apagaria essa classe. O estado do arraste vai em data-*. */}
      <div className="pz-reveal r-1">
        <div
          className="depo-track-wrap"
          data-dragging={dragging ? "true" : undefined}
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, false)}
          onPointerCancel={(e) => endDrag(e, true)}
        >
          <div
            ref={trackRef}
            className="depo-track"
            data-animate={animate && !dragging ? "true" : "false"}
            onTransitionEnd={onTransitionEnd}
            style={{ transform: `translateX(calc(-1 * ${pos} * (var(--card) + var(--gap)) + ${dragDx}px))` }}
          >
            {slides.map((item, i) => {
              const real = i >= count && i < 2 * count;
              const isActive = active === i;
              const video = depoimentoVideo(item.slug);
              return (
                <div
                  key={`${i}-${item.slug}`}
                  className="depo-card"
                  data-clone={real ? undefined : "true"}
                  aria-hidden={!real}
                  inert={!real}
                >
                  <div className="depo-media">
                    {isActive ? (
                      // Com som e controles, como o WP faz no clique; no fim volta ao poster.
                      <video
                        // play() explícito ao montar (ainda dentro da ativação do clique);
                        // só o atributo autoPlay com som pode ser barrado pelo navegador.
                        ref={(el) => {
                          el?.play().catch(() => {});
                        }}
                        src={video.src}
                        poster={video.poster}
                        controls
                        playsInline
                        onEnded={() => setActive(null)}
                      />
                    ) : (
                      <button
                        type="button"
                        className="depo-trigger"
                        aria-label={`Assistir depoimento: ${item.name}`}
                        onClick={() => {
                          if (suppressClick.current) return;
                          setActive(i);
                        }}
                      >
                        <Image src={video.poster} alt="" fill sizes="248px" draggable={false} className="depo-poster" />
                        <span className="depo-play" aria-hidden="true">
                          <Play />
                        </span>
                      </button>
                    )}
                    <span className="depo-badge">
                      <BadgeCheck aria-hidden="true" />
                      <span>{depoimentos.badge}</span>
                    </span>
                  </div>
                  <div className="depo-info">
                    <strong>{item.name}</strong>
                    <span>{depoimentos.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
