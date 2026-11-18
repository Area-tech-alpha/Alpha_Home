"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Mecânica dos carrosséis da Alpha's Pizzaria (depoimentos da /alphas-pizzaria e
// episódios da /resultado-alphas-pizzaria), a mesma do carrossel da /01-lp:
// - desliza 1 card por vez (transition do transform no CSS, desligada com
//   data-animate="false");
// - loop infinito: a lista é renderizada 3 vezes (a do meio é a real); quando o
//   deslize termina num clone, volta para o card real equivalente sem animação;
// - autoplay a cada autoplayMs, pausado no hover, no foco por teclado, durante o
//   arraste, fora da tela, com `paused` (ex.: vídeo tocando) e com
//   prefers-reduced-motion;
// - arraste com dedo ou mouse; setas e teclado reiniciam o timer.
// O transform usa as variáveis CSS --card e --gap do trilho.
//
// Estado do arraste vai em data-dragging (nunca no className): o reveal põe
// "visible" via classList, e um className reescrito pelo React apagaria a classe.
const DRAG_THRESHOLD = 0.15;

export function useLoopCarousel({
  count,
  autoplayMs,
  paused = false,
  onNormalize,
}: {
  count: number;
  autoplayMs: number;
  paused?: boolean;
  // Chamado quando o trilho volta de um clone para o card real (shift = n - pos).
  onNormalize?: (shift: number) => void;
}) {
  const [pos, setPos] = useState<number>(count);
  const [animate, setAnimate] = useState(true);
  const [dragDx, setDragDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const moving = useRef(false);
  const drag = useRef<{ id: number; x: number; y: number; horizontal: boolean | null } | null>(null);
  // true logo depois de um arraste: o click que vem em seguida é ignorado.
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
    onNormalize?.(n - pos);
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

  const playing = !reduced && visible && !hovered && !focused && !dragging && !paused;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => step(1), autoplayMs);
    return () => window.clearTimeout(id);
  }, [playing, pos, tick, step, autoplayMs]);

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
    suppressClick.current = true;
    window.setTimeout(() => (suppressClick.current = false), 0);
    const dx = cancelled ? 0 : e.clientX - d.x;
    setDragging(false);
    setDragDx(0);
    setAnimate(!reduced);
    if (Math.abs(dx) > cardStep() * DRAG_THRESHOLD) go(Math.max(1, Math.round(Math.abs(dx) / cardStep())) * (dx < 0 ? 1 : -1));
    else setTick((t) => t + 1);
  }

  return {
    go,
    suppressClick,
    rootProps: {
      ref: rootRef,
      onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && setHovered(true),
      onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && setHovered(false),
      // Só o foco por teclado pausa: o clique numa seta reinicia o timer e segue.
      onFocus: (e: React.FocusEvent) => setFocused((e.target as HTMLElement).matches(":focus-visible")),
      onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      },
    },
    wrapProps: {
      "data-dragging": dragging ? "true" : undefined,
      style: { touchAction: "pan-y" } as React.CSSProperties,
      onPointerDown,
      onPointerMove,
      onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => endDrag(e, false),
      onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => endDrag(e, true),
      // Link/imagem arrastados pelo navegador (drag nativo) roubariam o gesto.
      onDragStart: (e: React.DragEvent) => e.preventDefault(),
    },
    trackProps: {
      ref: trackRef,
      "data-animate": animate && !dragging ? "true" : "false",
      onTransitionEnd,
      style: { transform: `translateX(calc(-1 * ${pos} * (var(--card) + var(--gap)) + ${dragDx}px))` },
    },
  };
}
