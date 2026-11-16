import Image from "next/image";
import { Check, Plus } from "lucide-react";
import { FaqJsonLd } from "@/components/json-ld";
import LeadForm01lp from "@/components/lp01/lead-form-01lp";
import MetodoVideo from "@/components/lp01/metodo-video";
import Rich from "@/components/lp01/rich";
import ServicosCarousel from "@/components/lp01/servicos-carousel";
import { YoutubeShort } from "@/components/ui/youtube-player";
import { content01lp as c } from "@/lib/content-01-lp";

// Cada seção é uma "dobra": cabe em 100svh (classe .fold no globals.css).

function CtaForm({ label, className = "btn btn-primary" }: { label: string; className?: string }) {
  return (
    <a href={c.formAnchor} className={className}>
      {label}
    </a>
  );
}

export function Hero() {
  const { hero, logo } = c;
  return (
    <section aria-labelledby="hero-titulo" className="fold relative overflow-hidden">
      <div className="container-alpha grid w-full grid-cols-1 items-center gap-5 md:gap-8 desk:grid-cols-[1.1fr_.9fr] desk:gap-14">
        <div>
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            priority
            sizes="130px"
            className="mb-4 h-[34px] w-auto object-contain md:mb-8 md:h-[42px]"
          />
          <h1
            id="hero-titulo"
            className="font-display text-[clamp(1.55rem,3.6vw,3.1rem)] leading-[1.1] font-semibold"
          >
            <span className="block">{hero.titleLine1}</span>
            <span className="gold-text block">{hero.titleLine2}</span>
          </h1>
          <p className="mt-3 max-w-[520px] text-[14px] leading-[1.55] font-light text-text-muted md:mt-6 md:text-[clamp(1rem,1.2vw,1.1rem)] md:leading-[1.7]">
            {hero.subtitle}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 md:mt-6">
            {hero.checks.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[13px] font-medium text-white md:text-[14.5px]">
                <Check className="h-4 w-4 shrink-0 text-gold-1" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          id="formulario"
          className="relative w-full scroll-mt-6 rounded-[24px] border border-border-strong bg-glass px-4 py-4 shadow-[0_40px_100px_rgba(0,0,0,.5)] sm:px-7 sm:py-7 desk:max-w-[460px] desk:justify-self-end"
        >
          <LeadForm01lp />
        </div>
      </div>
    </section>
  );
}

export function Depoimentos() {
  const { depoimentos: d, numeros } = c;
  const strip = [...numeros, ...numeros];
  return (
    <section aria-labelledby="depoimentos-titulo" className="fold relative overflow-hidden">
      <div className="mb-[clamp(20px,4svh,44px)] overflow-hidden border-y border-border-gold bg-gold-1 py-2.5" aria-label="Números da Alpha">
        <ul className="logo-track flex w-max gap-10 pr-10 font-heading text-[13px] font-semibold tracking-[.08em] text-ink md:text-[14px]">
          {[...strip, ...strip].map((n, i) => (
            <li key={i} aria-hidden={i >= numeros.length} className="flex items-center gap-10 whitespace-nowrap">
              {n}
              <span aria-hidden="true">•</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-alpha w-full text-center">
        <span className="eyebrow">{d.eyebrow}</span>
        <h2 id="depoimentos-titulo" className="mx-auto max-w-[760px] text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.18]">
          <Rich text={d.title} />
        </h2>

        <ul className="-mx-[6vw] mt-[clamp(18px,3.5svh,36px)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[6vw] pb-2 md:mx-auto md:max-w-[780px] md:justify-center md:overflow-visible md:px-0">
          {d.shorts.map((id) => (
            <li key={id} className="w-[min(58vw,40svh)] shrink-0 snap-center md:w-[min(220px,25svh)]">
              <YoutubeShort videoId={id} poster={`/images/depoimentos/short-${id}.jpg`} name={d.shortLabel} role="" />
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(18px,3.5svh,36px)]">
          <CtaForm label={d.cta} />
        </div>
      </div>
    </section>
  );
}

export function QuemSomos() {
  const { quemSomos: q } = c;
  return (
    <section aria-labelledby="quem-somos-titulo" className="relative">
      <div className="container-alpha grid grid-cols-1 desk:min-h-svh desk:grid-cols-[auto_1fr] desk:items-center desk:gap-16">
        {/* No celular o texto e as fotos são duas dobras; no desktop, uma. */}
        <div className="fold order-2 items-center desk:order-1 desk:min-h-0 desk:py-0">
          <Image
            src={q.image.src}
            alt={q.image.alt}
            width={q.image.width}
            height={q.image.height}
            sizes="(max-width: 1100px) 40svh, 34svh"
            className="h-[min(86svh,1069px)] w-auto desk:h-[min(88svh,760px)]"
          />
        </div>
        <div className="fold order-1 desk:order-2 desk:min-h-0 desk:py-0">
          <span className="eyebrow">{q.eyebrow}</span>
          <h2 id="quem-somos-titulo" className="text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.18]">
            <Rich text={q.title} />
          </h2>
          <div className="mt-5 flex max-w-[560px] flex-col gap-3.5 text-[14.5px] leading-[1.65] font-light text-text-muted md:text-[15.5px]">
            {q.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>
                <Rich text={p} strongClass="font-semibold text-white" />
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Metodo() {
  const { metodo: m } = c;
  return (
    <section aria-labelledby="metodo-titulo" className="fold relative">
      <div className="container-alpha w-full text-center">
        <span className="eyebrow">{m.eyebrow}</span>
        <h2 id="metodo-titulo" className="mx-auto max-w-[760px] text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.18]">
          <Rich text={m.title} />
        </h2>
        <p className="mt-3 text-[14.5px] font-light text-text-muted md:text-[16px]">
          <Rich text={m.subtitle} strongClass="font-semibold text-white" />
        </p>

        <figure className="relative mx-auto mt-[clamp(14px,3svh,32px)] aspect-[1166/720] w-full max-w-[min(860px,calc((100svh-260px)*1.62))]">
          <MetodoVideo src={m.video.src} poster={m.video.poster} width={m.video.width} height={m.video.height} />
          <figcaption className="sr-only">Etapas do Método Alpha: {m.labels.map((l) => l.label).join(", ")}.</figcaption>
          {/* Rótulos sobre o logo (desktop/tablet), nas posições do diagrama do WP. */}
          <ul className="hidden md:block" aria-hidden="true">
            {m.labels.map((l) => (
              <li
                key={l.label}
                className="absolute flex items-center gap-2 text-[13.5px] font-medium whitespace-nowrap text-white"
                style={{
                  left: `${l.x}%`,
                  top: `${l.y}%`,
                  transform:
                    l.side === "left"
                      ? "translate(-100%, -50%)"
                      : l.side === "right"
                        ? "translate(0, -50%)"
                        : "translate(-50%, -50%)",
                  flexDirection: l.side === "left" ? "row" : "row-reverse",
                }}
              >
                {l.side === "center" ? (
                  <span className="rounded-full border border-border-gold bg-[rgba(255,183,3,.1)] px-4 py-1.5 text-gold-1 shadow-[0_0_24px_rgba(255,183,3,.25)]">
                    {l.label}
                  </span>
                ) : (
                  <>
                    {l.label}
                    <span className="flex items-center" aria-hidden="true">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-1" />
                      <span className="h-px w-10 bg-white/60 lg:w-16" />
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </figure>

        {/* No celular os rótulos viram uma grade abaixo do logo. */}
        <ul className="mx-auto mt-3 grid max-w-[360px] grid-cols-2 gap-2 md:hidden" aria-hidden="true">
          {m.labels.map((l) => (
            <li
              key={l.label}
              className="flex items-center justify-center gap-2 rounded-full border border-border bg-glass px-3 py-2 text-[13px] text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold-1" />
              {l.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Servicos() {
  const { servicos: s } = c;
  return (
    <section aria-labelledby="servicos-titulo" className="fold relative">
      <div className="container-alpha w-full text-center">
        <span className="eyebrow">{s.eyebrow}</span>
        <h2 id="servicos-titulo" className="mx-auto max-w-[900px] text-[clamp(1.5rem,3vw,2.3rem)] leading-[1.18]">
          <Rich text={s.title} />
        </h2>
        <div className="mx-auto mt-[clamp(16px,3.5svh,36px)] max-w-[min(820px,calc((100svh-330px)*1.7))]">
          <ServicosCarousel cards={s.cards} autoplayMs={s.autoplayMs} width={s.cardWidth} height={s.cardHeight} />
        </div>
      </div>
    </section>
  );
}

export function Planos() {
  const { planos: p } = c;
  return (
    <section aria-labelledby="planos-titulo" className="fold relative">
      <div className="container-alpha grid w-full grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14">
        <div>
          <span className="eyebrow">{p.eyebrow}</span>
          <h2 id="planos-titulo" className="text-[clamp(1.6rem,3.2vw,2.6rem)] leading-[1.15]">
            <Rich text={p.title} />
          </h2>
          <p className="mt-5 max-w-[480px] text-[15px] leading-[1.7] font-light text-text-muted md:text-[16px]">
            <Rich text={p.text} strongClass="font-semibold text-white" />
          </p>
        </div>
        <Image
          src={p.image.src}
          alt={p.image.alt}
          width={p.image.width}
          height={p.image.height}
          sizes="(max-width: 768px) 88vw, 556px"
          className="mx-auto h-auto w-full max-w-[min(556px,calc(45svh*1.11))]"
        />
      </div>
    </section>
  );
}

export function Time() {
  const { time: t } = c;
  return (
    <section aria-labelledby="time-titulo" className="fold relative">
      <div className="container-alpha w-full">
        <div className="mx-auto max-w-[900px] rounded-[32px] bg-[linear-gradient(135deg,var(--gold-1),var(--gold-2))] px-6 py-12 text-center text-ink shadow-[0_30px_90px_rgba(255,183,3,.18)] md:px-14 md:py-16">
          <p className="mb-4 text-[11.5px] font-bold tracking-[.2em] uppercase">{t.eyebrow}</p>
          <h2 id="time-titulo" className="text-[clamp(1.45rem,2.8vw,2.2rem)] leading-[1.2] text-ink">
            <Rich text={t.title} strongClass="font-bold" />
          </h2>
          <p className="mx-auto mt-5 max-w-[640px] text-[14.5px] leading-[1.7] md:text-[15.5px]">{t.text}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <CtaForm
              label={t.cta}
              className="btn bg-ink text-white shadow-[0_10px_30px_rgba(0,0,0,.25)] hover:-translate-y-[3px]"
            />
            <p className="flex items-center gap-2 text-[13.5px] font-semibold">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0d7a2f] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#0d7a2f]" />
              </span>
              {t.online}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { faq } = c;
  return (
    <section aria-labelledby="faq-titulo" className="fold relative">
      <FaqJsonLd items={faq.items} />
      <div className="container-alpha grid w-full grid-cols-1 gap-6 desk:grid-cols-[.8fr_1.2fr] desk:gap-[70px]">
        <div className="desk:self-center">
          <h2 id="faq-titulo" className="text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.2]">
            {faq.title}
          </h2>
          <p className="mt-3 max-w-[360px] text-[14.5px] leading-[1.6] font-light text-text-muted">{faq.subtitle}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {faq.items.map((item) => (
            <details
              key={item.question}
              name="faq-01lp"
              className="group rounded-2xl border border-border border-l-2 border-l-transparent bg-glass px-5 py-4 transition-colors open:border-l-gold-1 open:bg-[rgba(255,183,3,.05)] hover:bg-glass-strong [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-heading text-[15px] font-semibold text-white">
                {item.question}
                <Plus
                  className="h-[18px] w-[18px] shrink-0 text-gold-1 transition-transform duration-300 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-[14px] leading-[1.65] font-light text-text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
