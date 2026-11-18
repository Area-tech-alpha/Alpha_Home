"use client";

import { useEffect, useRef } from "react";

// Comportamentos do script do WP (lead-magnetic-bastidores): reveal no scroll,
// rolagem suave até o form, botão "magnético" e cursor personalizado. Tudo
// delegado na raiz .bastidores.
//
// Regra: nenhuma classe é adicionada via DOM em elemento que o React controla. O
// estado vai em data-attributes (data-visible, data-show, data-big,
// data-cursor-active), que o React não gerencia, e o CSS lê esses atributos.
//
// mode "lp": reveal + âncoras + botão magnético + cursor (a LP do WP).
// mode "obrigado": só o reveal (a página de obrigado do WP não tem o resto).
export default function BastidoresFx({ mode = "lp" }: { mode?: "lp" | "obrigado" }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".bastidores");
    if (!root) return;
    const cleanups: (() => void)[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveal: entra na tela (12%) e não volta.
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
    cleanups.push(() => io.disconnect());

    if (mode === "lp") {
      // Rolagem até o form (#contato) com 100px de folga, como o script do WP.
      const onClick = (ev: MouseEvent) => {
        const a = (ev.target as Element).closest('a[href="#contato"]');
        if (!a) return;
        ev.preventDefault();
        const target = document.getElementById("contato");
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
      };
      root.addEventListener("click", onClick);
      cleanups.push(() => root.removeEventListener("click", onClick));

      // Botão magnético: acompanha o mouse em 20% do deslocamento.
      const onMove = (ev: MouseEvent) => {
        const btn = (ev.target as Element).closest<HTMLElement>(".bs-btn");
        if (!btn || (btn as HTMLButtonElement).disabled) return;
        const r = btn.getBoundingClientRect();
        const x = (ev.clientX - r.left - r.width / 2) * 0.2;
        const y = (ev.clientY - r.top - r.height / 2) * 0.2;
        btn.style.transform = `translate(${x}px,${y}px)`;
      };
      const onLeave = (ev: MouseEvent) => {
        const btn = (ev.target as Element).closest<HTMLElement>(".bs-btn");
        if (btn && !btn.contains(ev.relatedTarget as Node | null)) btn.style.transform = "";
      };
      root.addEventListener("mousemove", onMove);
      root.addEventListener("mouseout", onLeave);
      cleanups.push(() => {
        root.removeEventListener("mousemove", onMove);
        root.removeEventListener("mouseout", onLeave);
      });

      // Cursor personalizado (só com mouse).
      const dot = dotRef.current;
      const label = labelRef.current;
      if (dot && label && window.matchMedia("(pointer: fine)").matches) {
        root.setAttribute("data-cursor-active", "");
        let mx = 0;
        let my = 0;
        let dx = 0;
        let dy = 0;
        let raf = 0;
        const track = (ev: MouseEvent) => {
          mx = ev.clientX;
          my = ev.clientY;
          dot.dataset.show = "true";
        };
        const loop = () => {
          dx += (mx - dx) * 0.18;
          dy += (my - dy) * 0.18;
          dot.style.left = `${dx}px`;
          dot.style.top = `${dy}px`;
          label.style.left = `${mx}px`;
          label.style.top = `${my - 42}px`;
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        const over = (ev: MouseEvent) => {
          const el = (ev.target as Element).closest<HTMLElement>("[data-cursor]");
          if (!el || !el.dataset.cursor) return;
          dot.dataset.big = "true";
          label.textContent = el.dataset.cursor;
          label.dataset.show = "true";
        };
        const out = (ev: MouseEvent) => {
          const el = (ev.target as Element).closest<HTMLElement>("[data-cursor]");
          if (!el || el.contains(ev.relatedTarget as Node | null)) return;
          delete dot.dataset.big;
          delete label.dataset.show;
        };
        window.addEventListener("mousemove", track);
        root.addEventListener("mouseover", over);
        root.addEventListener("mouseout", out);
        cleanups.push(() => {
          cancelAnimationFrame(raf);
          window.removeEventListener("mousemove", track);
          root.removeEventListener("mouseover", over);
          root.removeEventListener("mouseout", out);
          root.removeAttribute("data-cursor-active");
        });
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, [mode]);

  if (mode !== "lp") return null;
  return (
    <>
      <div ref={dotRef} className="bs-cursor-dot" aria-hidden="true" />
      <div ref={labelRef} className="bs-cursor-label" aria-hidden="true" />
    </>
  );
}
