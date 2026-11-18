import Image from "next/image";
import { CheckCircle2, FileBarChart, Plus, Store, Target, Users } from "lucide-react";
import EpisodiosCarousel from "@/components/pizzaria/episodios-carousel";
import { ScrollToFormLink } from "@/components/pizzaria/interactions";
import LeadFormPizzaria from "@/components/pizzaria/lead-form-pizzaria";
import { GoldTitle, LogoLink } from "@/components/pizzaria/sections";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { contentResultado as c } from "@/lib/content-resultado-pizzaria";

const ICONS = { users: Users, target: Target, store: Store, chart: FileBarChart } as const;

// ===== Hero + form (sem o logo no topo, como no WP; mesmo fundo da /alphas-pizzaria) =====
export function HeroResultado() {
  const { hero, form } = c;
  const bg = contentPizzaria.hero.background;
  return (
    <section id="hero">
      <div className="hero-bg">
        <Image src={bg.src} alt={bg.alt} width={bg.width} height={bg.height} priority sizes="100vw" />
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
              {hero.checks.map(([before, bold]) => (
                <li key={bold}>
                  <CheckCircle2 aria-hidden="true" />
                  <span>
                    {before}
                    <b>{bold}</b>
                  </span>
                </li>
              ))}
            </ul>
            <ScrollToFormLink className="pz-btn pz-btn-primary hero-cta pz-reveal r-3">{hero.cta}</ScrollToFormLink>
          </div>

          <div className="pz-reveal r-2" id="contato">
            <div className="hero-form-card">
              <h3>{form.title}</h3>
              <span>{form.subtitle}</span>
              <LeadFormPizzaria variant="resultado" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EpisodiosResultado() {
  return (
    <section id="carrossel">
      <div className="container">
        <EpisodiosCarousel />
      </div>
    </section>
  );
}

// ===== "O mesmo método que aplicamos..." (4 cards + faixa de resultado) =====
export function EntregaveisResultado() {
  const { entregaveis: e } = c;
  return (
    <section id="entregaveis">
      <div className="container">
        <div className="pz-section-head pz-reveal">
          <span className="pz-eyebrow">{e.eyebrow}</span>
          <h2>{e.title}</h2>
          <p>{e.sub}</p>
        </div>
        <div className="entrega-grid">
          {e.cards.map((card, i) => {
            const Icon = ICONS[card.icon];
            return (
              <div key={card.title} className={`entrega-card pz-reveal${i ? ` r-${i}` : ""}`}>
                <div className="ic">
                  <Icon aria-hidden="true" />
                </div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            );
          })}
        </div>
        <div className="entrega-roi pz-reveal">
          <span>{e.roi.label}</span>
          <strong>
            {e.roi.before}
            <em>{e.roi.gold}</em>
            {e.roi.after}
          </strong>
        </div>
      </div>
    </section>
  );
}

// ===== FAQ (accordion com <details>, primeira aberta, com JSON-LD) =====
export function FaqResultado() {
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

export function CtaFinalResultado() {
  const { ctaFinal: f } = c;
  return (
    <section id="cta-final">
      <div className="container">
        <div className="cta-final-box pz-reveal">
          <span className="pz-eyebrow">{f.eyebrow}</span>
          <h2>{f.title}</h2>
          <p>{f.text}</p>
          <ScrollToFormLink className="pz-btn pz-btn-primary">{f.button}</ScrollToFormLink>
        </div>
      </div>
    </section>
  );
}

export function FooterResultado() {
  return (
    <footer>
      <div className="container">
        <LogoLink className="footer-logo" height={28} />
        <p>{contentPizzaria.footer.copyright}</p>
      </div>
    </footer>
  );
}
