"use client";

import { useEffect } from "react";

// Entrada dos elementos .rv, como o script "scroll-bottom" da 00-lp: o elemento
// aparece (opacidade, blur e 80px, 0,5 s) quando o topo dele passa de metade
// da tela + 320px. Aqui roda uma vez só por elemento. Sem JS ou com
// prefers-reduced-motion, tudo fica visível desde o início.
export default function Reveal01lp() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lp01");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const show = (el: Element) => el.classList.add("rv-in");
    const limit = () => window.innerHeight / 2 + 320;
    const elements = Array.from(root.querySelectorAll(".rv"));

    // O que já está na área de disparo aparece sem animação.
    for (const el of elements) {
      if (el.getBoundingClientRect().top < limit()) show(el);
    }
    root.classList.add("js-reveal");

    const bottom = Math.min(0, limit() - window.innerHeight);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < limit()) {
            show(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: `0px 0px ${bottom}px 0px` }
    );
    for (const el of elements) if (!el.classList.contains("rv-in")) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return null;
}
