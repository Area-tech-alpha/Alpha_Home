import Image from "next/image";
import { FaqJsonLd } from "@/components/json-ld";
import LeadForm01lp from "@/components/lp01/lead-form-01lp";
import MetodoVideo from "@/components/lp01/metodo-video";
import Rich from "@/components/lp01/rich";
import ServicosCarousel from "@/components/lp01/servicos-carousel";
import ShortVideo01lp from "@/components/lp01/short-video";
import { content01lp as c } from "@/lib/content-01-lp";

// Seções da 00-lp do WP (página 3445), na mesma ordem e com as mesmas medidas
// do Elementor: conteúdo de 1100px, títulos Montserrat 36px (22px no celular).
// Os elementos com .rv entram no scroll como o "scroll-bottom" do WP.

function ArrowUpRight() {
  return (
    <svg width="11" height="10" viewBox="0 0 11 10" fill="currentColor" aria-hidden="true" className="h-[13px] w-auto">
      <path d="M2.104 9.52 8.667 2.958v4.417a.792.792 0 0 0 1.583 0V1.081A.792.792 0 0 0 9.458.29H3.125a.792.792 0 0 0 0 1.583h4.394L.98 8.372a.792.792 0 1 0 1.124 1.148Z" />
    </svg>
  );
}

function CtaForm({ label, className = "" }: { label: string; className?: string }) {
  return (
    <a href={c.formAnchor} className={`lp01-btn ${className}`}>
      {/* Texto cresce no botão largo (celular) e quebra como no Elementor. */}
      <span className="min-w-0 grow px-[6px] md:px-0">{label}</span>
      <ArrowUpRight />
    </a>
  );
}

export function Hero() {
  const { hero, heroLogo } = c;
  return (
    <section
      aria-labelledby="hero-titulo"
      className="lp01-hero flex items-end justify-center pt-[60px] pb-[130px] md:min-h-[979px] md:items-center md:py-0"
    >
      <div className="lp01-container flex flex-col items-center md:flex-row">
        <div className="flex w-full flex-col items-center gap-5 md:w-1/2 md:items-start md:pr-[30px]">
          <Image
            src={heroLogo.src}
            alt={heroLogo.alt}
            width={heroLogo.width}
            height={heroLogo.height}
            priority
            sizes="(max-width: 767px) 220px, 170px"
            className="h-auto w-[220px] md:w-[170px]"
          />
          <h1
            id="hero-titulo"
            className="lp01-title max-w-[347px] text-center text-black md:max-w-[915px] md:text-left"
          >
            {hero.titleLine1} <strong className="font-extrabold">{hero.titleLine2}</strong>
          </h1>
          <p className="max-w-[306px] text-center text-[16px] leading-[1.2] font-medium text-black md:max-w-[741px] md:text-left md:text-[15px]">
            {hero.subtitle}
          </p>
          <ul className="flex flex-col self-start font-[family-name:var(--font-roboto)] text-[16px] leading-[24px] font-semibold text-black md:self-auto">
            {hero.checks.map((item) => (
              <li key={item} className="flex items-center gap-[6px]">
                <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zm0 400H48V80h352v352zm-35.864-241.724L191.547 361.48c-4.705 4.667-12.303 4.637-16.97-.068l-90.781-91.516c-4.667-4.705-4.637-12.303.069-16.971l22.719-22.536c4.705-4.667 12.303-4.637 16.97.069l59.792 60.277 141.352-140.216c4.705-4.667 12.303-4.637 16.97.068l22.536 22.718c4.667 4.706 4.637 12.304-.068 16.971z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <CtaForm label={hero.cta} className="w-full md:w-auto" />
        </div>

        <div className="mt-[30px] flex w-full justify-center md:mt-0 md:w-1/2 md:justify-start md:pl-[32px]">
          <div id="formulario" className="lp01-form w-full scroll-mt-6 md:max-w-[496px]">
            <LeadForm01lp />
          </div>
        </div>
      </div>
    </section>
  );
}

// Duas faixas cruzadas: preta (7°) rolando para a direita e branca (-1°) para a esquerda.
export function Faixas() {
  const { numeros } = c;
  const repeat = (times: number) => `${Array.from({ length: times }, () => numeros.join(" • ")).join(" • ")} • ${numeros[0]} •`;
  return (
    <div className="relative">
      <ul className="sr-only">
        {numeros.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <div className="lp01-band lp01-band--black" aria-hidden="true">
        <p>{repeat(4)}</p>
      </div>
      <div className="lp01-band lp01-band--white" aria-hidden="true">
        <p>{repeat(3)}</p>
      </div>
    </div>
  );
}

export function Depoimentos() {
  const { depoimentos: d } = c;
  return (
    <section aria-labelledby="depoimentos-titulo" className="bg-white py-[60px] text-black">
      <div className="lp01-container flex flex-col items-center gap-5 md:max-w-[1160px] md:items-start">
        <p className="rv w-full text-center text-[18px] leading-none font-bold text-[#7c7c7c] uppercase md:w-auto md:text-left">
          {d.eyebrow}
        </p>
        <h2
          id="depoimentos-titulo"
          className="rv lp01-title mb-[54px] text-center tracking-[-0.9px] md:mb-0 md:max-w-[698px] md:text-left md:tracking-normal"
        >
          <Rich text={d.title} />
        </h2>
        <ul className="flex w-full flex-col gap-[41px] mb-3 md:mt-5 md:mb-3 md:grid md:grid-cols-3 md:gap-5 md:px-[10px]">
          {d.shorts.map((id) => (
            <li key={id} className="md:p-[10px]">
              <ShortVideo01lp videoId={id} poster={`/images/depoimentos/short-${id}.jpg`} title={d.shortLabel} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function QuemSomos() {
  const { quemSomos: q } = c;
  return (
    <section aria-labelledby="quem-somos-titulo" className="py-[20px]">
      <div className="lp01-container flex flex-col items-center gap-[60px] py-[50px] md:flex-row md:py-[60px]">
        <div className="flex w-full justify-center md:w-1/2">
          <Image
            src={q.image.src}
            alt={q.image.alt}
            width={q.image.width}
            height={q.image.height}
            sizes="(max-width: 767px) 330px, 400px"
            className="rv h-auto w-full max-w-[330px] md:max-w-[400px]"
          />
        </div>
        <div className="flex w-full min-w-0 flex-col items-center gap-5 text-center md:w-1/2 md:items-start md:text-left">
          <p className="rv lp01-eyebrow">{q.eyebrow}</p>
          <h2 id="quem-somos-titulo" className="rv lp01-title max-w-[330px] tracking-[-0.5px] md:w-[537px] md:max-w-none">
            <Rich text={q.title} />
          </h2>
          <div className="rv lp01-text flex max-w-[340px] flex-col gap-[1.2em] md:w-[495px] md:max-w-none">
            {q.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>
                <Rich text={p} strongClass="font-normal text-white" />
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
    <section aria-labelledby="metodo-titulo" className="py-[50px] md:py-[60px]">
      <div className="lp01-container flex flex-col items-center gap-5 text-center">
        <p className="rv lp01-eyebrow">{m.eyebrow}</p>
        <h2 id="metodo-titulo" className="rv lp01-title max-w-[340px] md:max-w-[677px]">
          <Rich text={m.title} />
        </h2>
        <p className="rv lp01-text max-w-[310px] md:max-w-[574px]">
          <Rich text={m.subtitle} strongClass="font-normal text-white" />
        </p>

        <figure className="relative mt-[19px] w-full max-w-[1100px] md:mt-[37px]">
          <div className="relative aspect-video w-full">
            <MetodoVideo src={m.video.src} poster={m.video.poster} width={m.video.width} height={m.video.height} />
          </div>
          {/* Rótulos do diagrama (2-1.png do WP) por cima da animação, como lá. */}
          <Image
            src={m.rotulos.src}
            alt=""
            width={m.rotulos.width}
            height={m.rotulos.height}
            sizes="(max-width: 767px) 528px, 1100px"
            className="pointer-events-none absolute top-1/2 left-0 z-[2] h-auto w-full -translate-y-1/2 translate-x-[6px] scale-[1.6] md:translate-x-[8px] md:translate-y-[calc(-50%+3px)] md:scale-100"
          />
          <figcaption className="sr-only">
            Etapas do Método Alpha: {m.labels.join(", ")} e {m.badge}.
          </figcaption>
        </figure>

        <p
          className="lp01-badge relative z-[3] mt-[-53px] ml-[-21px] flex items-center gap-[6px] p-[10px] text-[10px] font-semibold text-[#ffe1a6] md:mt-[-112px] md:ml-[-100px] md:gap-[10px] md:px-[32px] md:py-[22px] md:text-[20px]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 17 19" fill="none" aria-hidden="true" className="h-[10px] w-auto md:h-[18px]">
            <path
              d="M5.889 1.5h4.444a1.333 1.333 0 0 1 1.334 1.333 3.111 3.111 0 0 1-3.111 3.111h-.89a3.111 3.111 0 0 1-3.11-3.11A1.333 1.333 0 0 1 5.888 1.5Z"
              stroke="#FFE1A6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1 13.944v-.889a7.111 7.111 0 0 1 14.222 0v.89a3.556 3.556 0 0 1-3.555 3.555H4.556A3.556 3.556 0 0 1 1 13.944Z"
              stroke="#FFE1A6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {m.badge}
        </p>
      </div>
    </section>
  );
}

export function Servicos() {
  const { servicos: s } = c;
  return (
    <section aria-labelledby="servicos-titulo" className="pt-[50px] pb-[64px] md:pt-[60px] md:pb-[74px]">
      <div className="lp01-container flex flex-col items-center gap-5 text-center">
        <p className="lp01-eyebrow">{s.eyebrow}</p>
        <h2 id="servicos-titulo" className="lp01-title mb-[40px] max-w-[340px] md:max-w-[760px]">
          <Rich text={s.title} />
        </h2>
        <ServicosCarousel cards={s.cards} autoplayMs={s.autoplayMs} width={s.cardWidth} height={s.cardHeight} />
      </div>
    </section>
  );
}

export function Planos() {
  const { planos: p } = c;
  return (
    <section aria-labelledby="planos-titulo">
      <div className="lp01-container flex flex-col items-center gap-[60px] py-[50px] md:flex-row md:py-[60px]">
        <div className="flex w-full flex-col items-center gap-5 text-center md:w-1/2 md:items-start md:text-left">
          <p className="rv lp01-eyebrow">{p.eyebrow}</p>
          <h2 id="planos-titulo" className="rv lp01-title max-w-[340px] md:max-w-[362px]">
            <Rich text={p.title} />
          </h2>
          <p className="rv lp01-text max-w-[434px] tracking-[-0.7px] whitespace-pre-line md:tracking-normal">
            <Rich text={p.text} strongClass="font-normal text-white" />
          </p>
        </div>
        <div className="w-full md:w-1/2">
          <Image
            src={p.image.src}
            alt={p.image.alt}
            width={p.image.width}
            height={p.image.height}
            sizes="(max-width: 767px) 350px, 556px"
            className="rv h-auto w-full md:w-[529px] md:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}

export function Time() {
  const { time: t } = c;
  return (
    <section
      aria-labelledby="time-titulo"
      className="flex min-h-[516px] items-center bg-[#ffa902] py-[50px] text-black md:min-h-[521px] md:py-0"
    >
      <div className="lp01-container flex flex-col items-center gap-5 text-center">
        <p className="rv lp01-eyebrow text-white">{t.eyebrow}</p>
        <h2 id="time-titulo" className="rv lp01-title max-w-[350px] tracking-[-0.7px] md:max-w-[691px]">
          <Rich text={t.title} />
        </h2>
        <p className="rv text-[16px] leading-[1.2] max-w-[340px] md:max-w-[658px] md:text-[18px]">{t.text}</p>
        <div className="flex flex-col items-center gap-[10px] md:flex-row md:gap-5">
          <CtaForm label={t.cta} className="rv text-[16px]" />
          <p className="rv lp01-online relative ml-[19px] text-[16px] leading-[1.2] font-medium">{t.online}</p>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { faq } = c;
  return (
    <section aria-labelledby="faq-titulo">
      <FaqJsonLd items={faq.items} />
      <div className="lp01-container flex flex-col gap-5 pt-[50px] pb-[44px] md:flex-row md:items-center md:gap-[60px] md:pt-[60px] md:pb-[57px]">
        <div className="flex flex-col items-center gap-5 p-[10px] text-center md:w-[400px] md:shrink-0 md:items-start md:text-left">
          <h2
            id="faq-titulo"
            className="max-w-[340px] text-[24px] leading-[1.2] font-extrabold tracking-[-0.5px] uppercase md:max-w-[264px] md:text-[36px] md:tracking-normal"
          >
            {faq.title}
          </h2>
          <p className="lp01-text max-w-[259px] md:max-w-[300px]">{faq.subtitle}</p>
        </div>
        <div className="flex w-full flex-col gap-[17px] p-[10px]">
          {faq.items.map((item) => (
            <details key={item.question} name="faq-01lp" className="lp01-faq group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[5px] border border-[#363636] bg-[#151515] p-[18px] text-white">
                <span className="text-[15px] leading-[1.35] font-semibold md:text-[17px]">
                  <Image
                    src={faq.icon}
                    alt=""
                    width={26}
                    height={26}
                    className="mr-[10px] inline-block h-[26px] w-[26px] align-middle"
                  />
                  {item.question}
                </span>
                <svg viewBox="0 0 448 512" width="15" height="15" fill="currentColor" aria-hidden="true" className="shrink-0 group-open:hidden">
                  <path d="m413.1 222.5 22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z" />
                </svg>
                <svg viewBox="0 0 448 512" width="15" height="15" fill="currentColor" aria-hidden="true" className="hidden shrink-0 group-open:block">
                  <path d="m257.5 445.1-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z" />
                </svg>
              </summary>
              <div className="lp01-faq-body">
                <div className="overflow-hidden">
                  <p className="p-5 text-[14px] leading-[1.4] text-[#8e8e8e] md:p-[40px] md:text-[18px] md:leading-[1.2]">
                    {item.answer}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
