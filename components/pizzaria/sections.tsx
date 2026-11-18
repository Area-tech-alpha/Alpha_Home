import Image from "next/image";
import { CheckCircle2, Plus } from "lucide-react";
import DepoimentosCarousel from "@/components/pizzaria/depoimentos-carousel";
import LeadFormPizzaria from "@/components/pizzaria/lead-form-pizzaria";
import { contentPizzaria as c } from "@/lib/content-pizzaria";

// Texto com trechos em destaque (gradiente amarelo do WP).
export function GoldTitle({ parts }: { parts: readonly (readonly [string, boolean])[] }) {
  return (
    <>
      {parts.map(([text, gold], i) =>
        gold ? (
          <span key={i} className="pz-gold">
            {text}
          </span>
        ) : (
          text
        )
      )}
    </>
  );
}

export function LogoLink({ className, height }: { className?: string; height: number }) {
  const { logo } = c;
  return (
    <a href={logo.href} className={className}>
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        style={{ height, width: "auto" }}
        sizes={`${Math.round((height * logo.width) / logo.height)}px`}
      />
    </a>
  );
}

// ===== Dobra 1: hero com o form =====
export function HeroPizzaria() {
  const { hero, form } = c;
  return (
    <section id="hero">
      <div className="hero-bg">
        <Image
          src={hero.background.src}
          alt={hero.background.alt}
          width={hero.background.width}
          height={hero.background.height}
          priority
          sizes="100vw"
        />
      </div>
      <div className="hero-top">
        <LogoLink className="hero-logo" height={32} />
      </div>
      <div className="container">
        <div className="hero-grid">
          <div className="hero-head">
            <span className="pz-eyebrow pz-reveal">{hero.eyebrow}</span>
            <h1 className="pz-reveal r-1">
              <GoldTitle parts={hero.title} />
            </h1>
            <p className="sub pz-reveal r-2">{hero.sub}</p>
            <ul className="hero-checks pz-reveal r-2">
              {hero.checks.map(([before, bold, after]) => (
                <li key={before}>
                  <CheckCircle2 aria-hidden="true" />
                  <span>
                    {before}
                    {bold && <b>{bold}</b>}
                    {after}
                  </span>
                </li>
              ))}
            </ul>
            <div className="hero-trust pz-reveal r-4">
              {hero.trust.map((t) => (
                <div key={t.value}>
                  <b>{t.value}</b>
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pz-reveal r-2" id="contato">
            <div className="hero-form-card">
              <h3>{form.title}</h3>
              <span>{form.subtitle}</span>
              <LeadFormPizzaria />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Dobra 2: depoimentos =====
export function DepoimentosPizzaria() {
  return (
    <section id="depoimentos">
      <div className="container">
        <DepoimentosCarousel />
      </div>
    </section>
  );
}

// ===== Dobra 3: FAQ (accordion com <details>, primeira aberta como no WP) =====
export function FaqPizzaria() {
  const { faq } = c;
  return (
    <section id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.items.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />
      <div className="container">
        <div className="faq-grid">
          <div className="faq-sticky pz-reveal">
            <span className="pz-eyebrow">{faq.eyebrow}</span>
            <h2>{faq.title}</h2>
          </div>
          <div className="faq-list pz-reveal r-1">
            {faq.items.map((item, i) => (
              <details key={item.question} className="faq-item" open={i === 0}>
                <summary>
                  {item.question}
                  <Plus aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FooterPizzaria() {
  return (
    <footer>
      <div className="container">
        <LogoLink className="footer-logo" height={22} />
        <p>{c.footer.copyright}</p>
      </div>
    </footer>
  );
}
