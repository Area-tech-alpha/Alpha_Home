"use client";

import { useEffect, useState } from "react";
import { contentPizzaria } from "@/lib/content-pizzaria";

// Reveal no scroll do WP: .reveal ganha .visible ao entrar na tela (12%) e
// não volta. O CSS só esconde .reveal com JS ligado (pizzaria.css).
export function RevealPizzaria() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".pizzaria .pz-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}

// Rolagem até o form (#contato) com 40px de folga, como o data-scroll do WP.
export function scrollToForm() {
  const target = document.getElementById("contato");
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - 40;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}

// Botão fixo: aparece quando o form do hero sai da tela.
export function FloatCtaPizzaria() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const form = document.getElementById("contato");
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting), { threshold: 0 });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`float-cta ${show ? "show" : ""}`} inert={!show}>
      <a
        href="#contato"
        className="pz-btn pz-btn-primary"
        onClick={(e) => {
          e.preventDefault();
          scrollToForm();
          document.getElementById("nome")?.focus({ preventScroll: true });
        }}
      >
        {contentPizzaria.floatCta}
      </a>
    </div>
  );
}
