import Image from "next/image";
import LeadFormPizzaria from "@/components/pizzaria/lead-form-pizzaria";
import { contentBastidores as c } from "@/lib/content-bastidores-pizzaria";
import { contentPizzaria } from "@/lib/content-pizzaria";

// Texto com trechos em destaque (gradiente amarelo do WP) ou em negrito.
function Parts({ parts, mark }: { parts: readonly (readonly [string, boolean])[]; mark: "gold" | "strong" }) {
  return (
    <>
      {parts.map(([text, on], i) =>
        on ? (
          mark === "gold" ? (
            <span key={i} className="bs-gold">
              {text}
            </span>
          ) : (
            <strong key={i}>{text}</strong>
          )
        ) : (
          text
        )
      )}
    </>
  );
}

// Fundo "mesh" fixo do WP. A LP tem 4 manchas; o obrigado, 2.
export function MeshBackground({ blobs = 4 }: { blobs?: 2 | 4 }) {
  return (
    <div className="bs-mesh" aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      {blobs === 4 && (
        <>
          <div className="blob b3" />
          <div className="blob b4" />
          <div className="noise" />
        </>
      )}
    </div>
  );
}

// 22 partículas como no WP, mas com valores determinísticos (o WP sorteava no
// navegador; aqui o servidor e o cliente renderizam o mesmo HTML).
function Particles() {
  return (
    <div className="particles" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 47 + 13) % 100}%`,
            animationDuration: `${10 + ((i * 7) % 12)}s`,
            animationDelay: `${(i * 5) % 12}s`,
          }}
        />
      ))}
    </div>
  );
}

// ===== Hero + form "Quero receber os processos" =====
export function HeroBastidores() {
  const { hero, form } = c;
  const bg = contentPizzaria.hero.background;
  return (
    <section id="hero">
      <div className="hero-bg">
        <Image src={bg.src} alt="Alpha's Pizzaria" width={bg.width} height={bg.height} priority sizes="100vw" />
      </div>
      <Particles />
      <div className="bs-container hero-grid">
        <div className="hero-head">
          <span className="bs-eyebrow bs-reveal">{hero.eyebrow}</span>
          <h1 className="bs-reveal r-1">
            <Parts parts={hero.title} mark="gold" />
          </h1>
          <p className="sub bs-reveal r-2">{hero.sub}</p>
          <a href="#contato" className="bs-btn bs-btn-primary bs-reveal r-3" data-cursor="Ver">
            {hero.cta}
          </a>
        </div>
        <div className="hero-form-card bs-reveal-scale r-2" id="contato">
          <h3>{form.title}</h3>
          <span>{form.subtitle}</span>
          <LeadFormPizzaria variant="bastidores" />
        </div>
      </div>
    </section>
  );
}

// ===== O problema real (com a lista) =====
export function ProblemaBastidores() {
  const { problema: p } = c;
  return (
    <section id="problema">
      <div className="bs-container">
        <div className="problema-head">
          <span className="bs-eyebrow bs-reveal">{p.eyebrow}</span>
          <h2 className="bs-reveal r-1">{p.title}</h2>
        </div>
        <div className="problema-body bs-reveal r-2">
          <Parts parts={p.body1} mark="strong" />
        </div>
        <div className="problema-body bs-reveal r-2" style={{ marginBottom: 10 }}>
          {p.body2}
        </div>
        <ul className="problema-list bs-reveal r-3">
          {p.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="problema-body bs-reveal r-3">{p.body3}</div>
        <div className="problema-body bs-reveal r-4">{p.body4}</div>
        <a href="#contato" className="bs-btn bs-btn-primary bs-reveal r-4" data-cursor="Ver">
          {p.cta}
        </a>
      </div>
    </section>
  );
}

// ===== "Faturamento é ego. Lucro é a realidade..." + foto =====
export function ParadaBastidores() {
  const { parada: p } = c;
  return (
    <section id="parada">
      <div className="parada-glow" />
      <div className="bs-container parada-grid">
        <div className="parada-text">
          <h2 className="parada-quote bs-reveal">
            <Parts parts={p.quote} mark="gold" />
          </h2>
          <p className="parada-body bs-reveal r-1">{p.body[0]}</p>
          <p className="parada-body bs-reveal r-2">{p.body[1]}</p>
          <p className="parada-body bs-reveal r-2">{p.body[2]}</p>
          <a href="#contato" className="bs-btn bs-btn-primary parada-cta bs-reveal r-3" data-cursor="Ver">
            {p.cta}
          </a>
        </div>
        <div className="parada-photo bs-reveal-scale r-2">
          <Image
            src={p.photo.src}
            alt={p.photo.alt}
            width={p.photo.width}
            height={p.photo.height}
            sizes="(max-width: 1100px) 420px, 480px"
          />
        </div>
      </div>
    </section>
  );
}

// ===== "Nós somos o nosso próprio case!" =====
export function CaseBastidores() {
  const { case: k } = c;
  const bg = contentPizzaria.hero.background;
  return (
    <section id="pizzaria-resultados">
      <div className="pizzaria-bg">
        <Image src={bg.src} alt="Alpha's Pizzaria" width={bg.width} height={bg.height} sizes="100vw" />
      </div>
      <div className="pizzaria-content bs-container">
        <span className="bs-eyebrow bs-reveal">{k.eyebrow}</span>
        <h2 className="bs-reveal r-1">{k.title}</h2>
        <p className="bs-reveal r-2">{k.body1}</p>
        <p className="bs-reveal r-3" style={{ marginTop: 22 }}>
          {k.body2}
        </p>
        <a href="#contato" className="bs-btn bs-btn-primary bs-reveal r-3" data-cursor="Ver">
          {k.cta}
        </a>
      </div>
    </section>
  );
}
