"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { submitLeadNds } from "@/app/actions/submit-lead-nds";
import LeadForm01lp, { type LeadForm01lpConfig } from "@/components/lp01/lead-form-01lp";
import { contentNds as c, NDS_FORM_ID } from "@/lib/content-nao-dependa-de-sorte";
import { NdsIc } from "@/components/nao-dependa-de-sorte/icons";

// Partes interativas da /nao-dependa-de-sorte, cada uma isolada. Estados sempre em
// data-attributes (nunca classe adicionada no DOM por fora do React).

const reduzido = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== Form (o da /01-lp) =====
// Atribuição: o first-touch da /01-lp (UTMs, fbclid, fbc e fbp) vai com o lead ao CRM.
const config: LeadForm01lpConfig = {
  submit: (data, tracking) => submitLeadNds(data, tracking),
  labels: c.form.labels,
  placeholders: c.form.placeholders,
  labelClassName: "nds-label",
  submitLabel: c.form.submit,
  submitClassName: "cv-btn cv-btn-gold nds-submit",
  submitIcon: (
    <span className="cv-btn-ic">
      <NdsIc name="arrow" />
    </span>
  ),
  ariaLabel: c.form.titulo,
};

export function FormNds() {
  return <LeadForm01lp config={config} />;
}

// Rola até o form e põe o foco no primeiro campo.
export function irParaForm() {
  const el = document.getElementById(NDS_FORM_ID);
  el?.scrollIntoView({ behavior: reduzido() ? "auto" : "smooth", block: "start" });
  window.setTimeout(() => (document.getElementById("nome") as HTMLInputElement | null)?.focus({ preventScroll: true }), reduzido() ? 0 : 500);
}

// ===== Palavra riscada que troca (2,6 s), como no WP =====
export function PalavraRiscada() {
  const [i, setI] = useState(0);
  const [estado, setEstado] = useState<"" | "cut" | "out">("");
  useEffect(() => {
    if (reduzido()) {
      const t = window.setTimeout(() => setEstado("cut"), 0);
      return () => window.clearTimeout(t);
    }
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setEstado("cut"), 500));
    const iv = window.setInterval(() => {
      setEstado("out");
      timers.push(
        window.setTimeout(() => {
          setI((n) => (n + 1) % c.hero.palavras.length);
          setEstado("");
          timers.push(window.setTimeout(() => setEstado("cut"), 250));
        }, 380)
      );
    }, 2600);
    return () => {
      window.clearInterval(iv);
      timers.forEach(window.clearTimeout);
    };
  }, []);
  return (
    <span className="cv-rot" data-estado={estado || undefined}>
      <span className="cv-rot-w">{c.hero.palavras[i]}</span>
    </span>
  );
}

// ===== Marca-texto amarelo que pinta ao aparecer + barra de progresso + barra fixa =====
export function Efeitos() {
  const prog = useRef<HTMLDivElement>(null);
  const [barra, setBarra] = useState(false);
  useEffect(() => {
    const mks = Array.from(document.querySelectorAll<HTMLElement>("[data-mk]"));
    if (reduzido() || !("IntersectionObserver" in window)) mks.forEach((el) => (el.dataset.mk = "in"));
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (es) =>
              es.forEach((e) => {
                if (e.isIntersecting) {
                  (e.target as HTMLElement).dataset.mk = "in";
                  io?.unobserve(e.target);
                }
              }),
            { rootMargin: "0px 0px -12% 0px" }
          )
        : null;
    mks.forEach((el) => io?.observe(el));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (prog.current) prog.current.style.transform = `scaleX(${total > 0 ? Math.min(1, window.scrollY / total) : 0})`;
        const vh = window.innerHeight;
        const topo = document.getElementById("cv-topo")?.getBoundingClientRect();
        const fim = document.getElementById("cv-final")?.getBoundingClientRect();
        const oferta = document.getElementById("cv-oferta")?.getBoundingClientRect();
        const naOferta = !!oferta && oferta.top < vh * 0.6 && oferta.bottom > vh * 0.4;
        const saida = document.querySelector('[data-saida="aberta"]');
        setBarra(!!topo && topo.bottom < 60 && !!fim && fim.top > vh - 40 && !naOferta && !saida);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io?.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <>
      <div className="cv-prog" ref={prog} aria-hidden="true" />
      <div className="nds-bar" data-on={barra ? "true" : undefined} inert={!barra}>
        <div className="cv-bar-in">
          <p>
            {c.barra.titulo}
            <small>{c.barra.sub}</small>
          </p>
          <BotaoForm className="cv-btn cv-btn-gold cv-btn-sm">{c.barra.cta}</BotaoForm>
        </div>
      </div>
    </>
  );
}

// Botão que leva ao form (no WP abria o modal).
export function BotaoForm({ className, children }: { className: string; children: ReactNode }) {
  return (
    <a
      className={className}
      href={`#${NDS_FORM_ID}`}
      onClick={(e) => {
        e.preventDefault();
        irParaForm();
      }}
    >
      {children}
      <span className="cv-btn-ic">
        <NdsIc name="arrow" />
      </span>
    </a>
  );
}

// ===== Vídeo da prova: só baixa no clique =====
const EV_VSL = "nds:vsl";
export function tocarVslDeFora() {
  window.dispatchEvent(new Event(EV_VSL));
}
export function Vsl() {
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const play = () => setOn(true);
    window.addEventListener(EV_VSL, play);
    return () => window.removeEventListener(EV_VSL, play);
  }, []);
  useEffect(() => {
    if (!on || !ref.current) return;
    document.querySelectorAll<HTMLVideoElement>("[data-depo] video").forEach((v) => v.pause());
    void ref.current.play().catch(() => {});
  }, [on]);
  return (
    <div className="cv-vsl-box" data-on={on ? "true" : undefined}>
      {on ? (
        <video ref={ref} src={c.prova.video.src} controls playsInline poster={c.prova.video.poster} />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- pôster local já otimizado, carregado só perto da tela */}
          <img className="cv-vsl-poster" src={c.prova.video.poster} alt="" loading="lazy" decoding="async" />
          <button type="button" className="cv-plain cv-vsl-play" aria-label={c.prova.playAria} onClick={() => setOn(true)}>
            <span className="p">
              <NdsIc name="play" />
            </span>
            <b>{c.prova.play}</b>
          </button>
        </>
      )}
    </div>
  );
}

// ===== Depoimentos: nenhum vídeo baixa até o clique; um toca por vez =====
export function Depoimentos() {
  const track = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [tocando, setTocando] = useState<number | null>(null);
  const mover = (dir: number) => {
    const tr = track.current;
    const card = tr?.querySelector<HTMLElement>("[data-depo]");
    if (tr && card) tr.scrollBy({ left: (card.offsetWidth + 16) * dir, behavior: reduzido() ? "auto" : "smooth" });
  };
  useEffect(() => {
    if (tocando == null) return;
    refs.current.forEach((v, j) => j !== tocando && v?.pause());
    const v = refs.current[tocando];
    if (v) {
      v.muted = false;
      void v.play().catch(() => {});
    }
  }, [tocando]);
  return (
    <>
      <div className="cv-wide cv-voices-top">
        <div>
          <span className="cv-lbl">{c.depoimentos.lbl}</span>
          <h2 className="cv-h2">
            {c.depoimentos.h2[0]}
            <em>{c.depoimentos.h2[1]}</em>
          </h2>
        </div>
        <div className="cv-arrows">
          <button type="button" aria-label={c.depoimentos.anterior} onClick={() => mover(-1)}>
            <NdsIc name="arrow" />
          </button>
          <button type="button" aria-label={c.depoimentos.proximo} onClick={() => mover(1)}>
            <NdsIc name="arrow" />
          </button>
        </div>
      </div>
      <div className="cv-track" ref={track}>
        {c.depoimentos.videos.map(([slug, nome], i) => (
          <div className="cv-vid" key={slug} data-depo data-on={tocando === i ? "true" : undefined}>
            <video
              ref={(el) => {
                refs.current[i] = el;
              }}
              src={`/videos/depoimento-${slug}.mp4`}
              poster={`/videos/depoimento-${slug}-poster.jpg`}
              preload="none"
              playsInline
              controls={tocando === i}
            />
            {tocando !== i && (
              <button type="button" className="cv-plain cv-vid-btn" aria-label={`Assistir depoimento: ${nome}`} onClick={() => setTocando(i)}>
                <span className="cv-vid-q" aria-hidden="true">
                  “
                </span>
                <span className="cv-vid-p" aria-hidden="true">
                  <NdsIc name="play" />
                </span>
                <span className="cv-vid-b">
                  <b>{nome}</b>
                  <span>{c.depoimentos.tipo}</span>
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ===== FAQ: um aberto por vez =====
export function Faq() {
  const [aberto, setAberto] = useState<number | null>(null);
  return (
    <div className="cv-acc">
      {c.faq.itens.map(([q, a], i) => (
        <div className="cv-acc-i" key={q} data-aberto={aberto === i ? "true" : undefined}>
          <button
            type="button"
            className="cv-plain cv-acc-q"
            aria-expanded={aberto === i}
            aria-controls={`nds-faq-${i}`}
            onClick={() => setAberto((x) => (x === i ? null : i))}
          >
            {q}
            <span aria-hidden="true">
              <NdsIc name="plus" />
            </span>
          </button>
          <div className="cv-acc-a" id={`nds-faq-${i}`} role="region" inert={aberto !== i}>
            <div>
              <p>{a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
