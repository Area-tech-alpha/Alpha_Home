"use client";

import { useEffect } from "react";

// Comportamentos da LP de bastidores (e do obrigado): reveal no scroll (uma vez por
// elemento, só opacity/translate) e, na LP, os CTAs que rolam até o form. Nada de
// cursor personalizado, botão magnético, partículas nem requestAnimationFrame.
//
// O estado do reveal vai em data-visible (o React não gerencia esse atributo), nunca
// em classe adicionada via DOM.
export default function BastidoresFx({ mode = "lp" }: { mode?: "lp" | "obrigado" }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".bastidores");
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.visible = "true";
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    root.querySelectorAll(".bs-reveal, .bs-reveal-scale").forEach((el) => io.observe(el));
    if (mode !== "lp") return () => io.disconnect();

    // Rolagem até o form (#contato) com 100px de folga, como o script do WP.
    const onClick = (ev: MouseEvent) => {
      if (!(ev.target as Element).closest('a[href="#contato"]')) return;
      const target = document.getElementById("contato");
      if (!target) return;
      ev.preventDefault();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    };
    root.addEventListener("click", onClick);
    return () => {
      io.disconnect();
      root.removeEventListener("click", onClick);
    };
  }, [mode]);

  return null;
}
