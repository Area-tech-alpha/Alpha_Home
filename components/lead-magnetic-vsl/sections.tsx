"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, AlertTriangle, Grid2X2, ImageOff, FileText, Blend, RotateCcw, MousePointerClick } from "lucide-react";
import LeadFormPizzaria from "@/components/pizzaria/lead-form-pizzaria";
import { useLoopCarousel } from "@/components/pizzaria/use-loop-carousel";
import { contentLeadMagneticVsl as c } from "@/lib/content-lead-magnetic-vsl";

function scrollToForm() {
  document.getElementById("contato")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HeroLmvsl() {
  return (
    <section className="lv-hero" id="hero">
      <Image
        src="/images/lead-magnetic-vsl/hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="lv-hero-bg"
      />
      <div className="lv-container lv-hero-grid">
        <div className="lv-hero-copy">
          <h1>{c.hero.titleBefore}<strong>{c.hero.titleBold}</strong></h1>
          <p>{c.hero.sub}</p>
          <button type="button" className="lv-btn lv-btn-primary" onClick={scrollToForm}>
            {c.hero.cta} ↗
          </button>
        </div>
        <div className="lv-form-card" id="contato">
          <LeadFormPizzaria variant="lead-magnetic-vsl" />
        </div>
      </div>
    </section>
  );
}

const problemaIcons = [AlertTriangle, Grid2X2, ImageOff, FileText, Blend, RotateCcw];

export function ProblemaLmvsl() {
  return (
    <section className="lv-problema">
      <div className="lv-container">
        <h2 className="lv-reveal">{c.problema.titleBefore}<span>{c.problema.titleGold}</span></h2>
        <p className="lv-problema-sub lv-reveal">{c.problema.sub}</p>
        <div className="lv-problema-grid">
          {c.problema.cards.map(([title, text], i) => {
            const Icon = problemaIcons[i];
            return (
              <article className="lv-problema-card lv-reveal" key={title}>
                <Icon aria-hidden="true" />
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            );
          })}
        </div>
        <button type="button" className="lv-btn lv-btn-primary lv-section-cta" onClick={scrollToForm}>
          {c.hero.cta} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  );
}

export function ResultadosLmvsl() {
  const count = c.resultados.slides.length;
  const carousel = useLoopCarousel({ count, autoplayMs: 5000 });
  const slides = [...c.resultados.slides, ...c.resultados.slides, ...c.resultados.slides];
  return (
    <section className="lv-resultados">
      <div className="lv-container">
        <h2 className="lv-reveal">{c.resultados.titleBefore}<span>{c.resultados.titleGold}</span></h2>
        <div className="lv-carousel lv-reveal" role="region" aria-label="Resultados" {...carousel.rootProps}>
          <div className="lv-carousel-viewport" {...carousel.wrapProps}>
            <div className="lv-carousel-track" {...carousel.trackProps}>
              {slides.map((src, i) => (
                <div className="lv-carousel-slide" key={`${src}-${i}`} data-clone={i >= count && i < 2 * count ? undefined : "true"} aria-hidden={i >= count && i < 2 * count ? undefined : true}>
                  <Image src={src} alt={`Resultado de aplicação da metodologia ${((i % count) + 1)}`} width={591} height={1280} sizes="(max-width: 600px) 86vw, 347px" draggable={false} />
                </div>
              ))}
            </div>
          </div>
          <div className="lv-carousel-controls">
            <button type="button" aria-label="Resultado anterior" onClick={() => carousel.go(-1)}><ChevronLeft /></button>
            <div className="lv-carousel-dots" aria-hidden="true">{c.resultados.slides.map((_, i) => <span key={i} />)}</div>
            <button type="button" aria-label="Próximo resultado" onClick={() => carousel.go(1)}><ChevronRight /></button>
          </div>
        </div>
        <button type="button" className="lv-btn lv-btn-primary lv-section-cta" onClick={scrollToForm}>
          {c.hero.cta} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  );
}

const aprenderIcons = [Grid2X2, AlertTriangle, ImageOff, Blend, RotateCcw, MousePointerClick];

export function AprenderLmvsl() {
  return (
    <section className="lv-aprender">
      <div className="lv-container">
        <h2 className="lv-reveal">{c.aprender.titleBefore}<span>{c.aprender.titleGold}</span></h2>
        <p className="lv-aprender-sub lv-reveal">{c.aprender.sub}</p>
        <div className="lv-aprender-grid">
          {c.aprender.cards.map(([title, text], i) => {
            const Icon = aprenderIcons[i];
            return (
              <article className="lv-aprender-card lv-reveal" key={title}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            );
          })}
        </div>
        <button type="button" className="lv-btn lv-btn-primary lv-section-cta" onClick={scrollToForm}>
          {c.hero.cta} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  );
}

export function FinalLmvsl() {
  return (
    <section className="lv-final">
      <div className="lv-container lv-final-inner">
        <h2 className="lv-reveal">{c.finalCta.titleBefore}<span>{c.finalCta.titleGold}</span></h2>
        <p className="lv-reveal">{c.finalCta.sub}</p>
        <button type="button" className="lv-btn lv-btn-primary lv-section-cta lv-reveal" onClick={scrollToForm}>
          {c.hero.cta} <span aria-hidden="true">↗</span>
        </button>
        <small>{c.finalCta.note}</small>
        <div className="lv-final-benefits">
          {["+2.000 restaurantes", "Leitura em 15 min", "PDF para celular"].map((item) => (
            <div key={item}><span aria-hidden="true">✓</span><strong>{item}</strong></div>
          ))}
        </div>
      </div>
    </section>
  );
}
