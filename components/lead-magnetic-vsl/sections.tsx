"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LMVSL_ICONS } from "@/lib/lead-magnetic-vsl-icons";
import LeadFormPizzaria from "@/components/pizzaria/lead-form-pizzaria";
import { useLoopCarousel } from "@/components/pizzaria/use-loop-carousel";
import { contentLeadMagneticVsl as c } from "@/lib/content-lead-magnetic-vsl";

function WpIcon({ svg, className }: { svg: string; className: string }) {
  // SVG literal do WP (conteúdo estático do repositório, não vem de usuário).
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

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

const problemaIcons = [LMVSL_ICONS.problema1, LMVSL_ICONS.problema2, LMVSL_ICONS.problema3, LMVSL_ICONS.problema4, LMVSL_ICONS.problema5, LMVSL_ICONS.problema6];

export function ProblemaLmvsl() {
  return (
    <section className="lv-problema">
      <div className="lv-container">
        <h2 className="lmvsl-reveal">{c.problema.titleBefore}<span>{c.problema.titleGold}</span></h2>
        <p className="lv-problema-sub lmvsl-reveal">{c.problema.sub}</p>
        <div className="lv-problema-grid">
          {c.problema.cards.map(([title, text], i) => {
            return (
              <article className="lv-problema-card lmvsl-reveal" key={title}>
                <WpIcon className="lv-icon" svg={problemaIcons[i]} />
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
        <h2 className="lmvsl-reveal">{c.resultados.titleBefore}<span>{c.resultados.titleGold}</span></h2>
        <div className="lv-carousel lmvsl-reveal" role="region" aria-label="Resultados" {...carousel.rootProps}>
          <div className="lv-carousel-viewport" {...carousel.wrapProps}>
            <div className="lv-carousel-track" {...carousel.trackProps}>
              {slides.map((src, i) => (
                <div className="lv-carousel-slide" key={`${src}-${i}`} data-clone={i >= count && i < 2 * count ? undefined : "true"} aria-hidden={i >= count && i < 2 * count ? undefined : true}>
                  <Image src={src} alt={`Resultado de aplicação da metodologia ${((i % count) + 1)}`} width={591} height={1280} sizes="(max-width: 600px) 330px, 327px" draggable={false} />
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

const aprenderIcons = [LMVSL_ICONS.aprender1, LMVSL_ICONS.aprender2, LMVSL_ICONS.aprender3, LMVSL_ICONS.aprender4, LMVSL_ICONS.aprender5, LMVSL_ICONS.aprender6];

export function AprenderLmvsl() {
  return (
    <section className="lv-aprender">
      <div className="lv-container">
        <h2 className="lmvsl-reveal">{c.aprender.titleBefore}<span>{c.aprender.titleGold}</span></h2>
        <p className="lv-aprender-sub lmvsl-reveal">{c.aprender.sub}</p>
        <div className="lv-aprender-grid">
          {c.aprender.cards.map(([title, text], i) => {
            return (
              <article className="lv-aprender-card lmvsl-reveal" key={title}>
                <WpIcon className="lv-icon" svg={aprenderIcons[i]} />
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

const finalIcons = [LMVSL_ICONS.final1, LMVSL_ICONS.final2, LMVSL_ICONS.final3];

export function FinalLmvsl() {
  return (
    <section className="lv-final">
      <div className="lv-container lv-final-inner">
        <h2 className="lmvsl-reveal">{c.finalCta.titleBefore}<span>{c.finalCta.titleGold}</span></h2>
        <p className="lmvsl-reveal">{c.finalCta.sub}</p>
        <button type="button" className="lv-btn lv-btn-primary lv-section-cta lmvsl-reveal" onClick={scrollToForm}>
          {c.hero.cta} <span aria-hidden="true">↗</span>
        </button>
        <small>{c.finalCta.note}</small>
        <div className="lv-final-benefits">
          {c.finalCta.benefits.map((item, i) => (
            <div key={item}><WpIcon className="lv-icon" svg={finalIcons[i]} /><span>{item}</span></div>
          ))}
        </div>
        <footer className="lmvsl-footer">
          <Image src="/images/logo-alpha.png" alt="Assessoria Alpha" width={764} height={247} sizes="200px" />
          <span>{c.footer}</span>
        </footer>
      </div>
    </section>
  );
}
