import Image from "next/image";
import { popFontClasses } from "@/components/pop/fonts";
import { Ic } from "@/components/pop/icons";
import LeadFormPop from "@/components/pop/lead-form-pop";
import PopSticky from "@/components/pop/sticky";
import { Autor, Logo, Title } from "@/components/pop/parts";
import { POP_FORM_ID, popShared as s, type PopContent } from "@/lib/content-pop";

// Estrutura comum das LPs de POP (igual nas 3 páginas do WP). Mudanças pedidas em
// relação ao WP: o form fica visível no hero (no lugar do papel do POP) e os botões
// rolam até ele; o papel do POP (com o selo) vai para "O que chega no seu e-mail".
// Página leve: sem animação de entrada, sem efeitos de cursor.

const FOLHA = { width: 920, height: 1299, sizes: "(min-width: 900px) 460px, 90vw" };

function Cta({ label }: { label: string }) {
  return (
    <div className="tz-cta">
      <a className="tz-btn" href={`#${POP_FORM_ID}`}>
        <span>{label}</span>
        <span className="tz-arr">
          <Ic name="arrow" />
        </span>
      </a>
    </div>
  );
}

export default function PopPage({ c }: { c: PopContent }) {
  const { comanda } = c.problema;
  return (
    <div className={`pop tz ${popFontClasses}`}>
      <header className="tz-hero">
        <Image className="tz-bg-img" src={c.hero.image} alt="" fill priority sizes="100vw" />
        <div className="tz-wrap">
          <div className="tz-top">
            <span className="tz-logo">
              <Logo priority />
            </span>
            <span className="tz-top-tag">{s.topTag}</span>
          </div>
          <div className="tz-hero-grid">
            <div className="tz-stack">
              <p className="tz-eyebrow">{s.eyebrow}</p>
              <h1 className={`tz-h1 ${c.hero.titleSize}`}>
                <Title t={c.hero.title} />
              </h1>
              <p className="tz-sub">{c.hero.sub}</p>
              <Cta label={c.cta} />
              <p className="tz-prova">
                <Ic name="check" />
                <span>{c.hero.prova}</span>
              </p>
            </div>
            <div className="tz-formcard" id={POP_FORM_ID} tabIndex={-1}>
              <LeadFormPop slug={c.slug} />
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="tz-sec tz-paper">
          <div className="tz-wrap tz-split w">
            <div className="tz-stack">
              <h2 className="tz-sec-h">
                <Title t={c.problema.title} />
              </h2>
              <div className="tz-paras">
                {c.problema.paras.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <p className="tz-virada">{c.problema.virada}</p>
              <Cta label={c.cta} />
            </div>
            <div>
              <div className="tz-com">
                <div className="tz-com-h">
                  <b>{comanda.titulo}</b>
                  {comanda.subtitulo}
                </div>
                {comanda.rows.map((r) => (
                  <div key={r.label} className={["tz-com-r", r.tone, r.big && "big"].filter(Boolean).join(" ")}>
                    <span className="l">{r.label}</span>
                    <span className="d" />
                    <span className="v">
                      {r.value}
                      {r.icon && <Ic name={r.icon === "sim" ? "check" : "x"} className="tz-com-ic" label={r.icon === "sim" ? "sim" : "não"} />}
                    </span>
                  </div>
                ))}
                <div className="tz-com-sep" />
                {comanda.total && (
                  <div className="tz-com-tot">
                    <span className="l">{comanda.total.label}</span>
                    <span className="v">{comanda.total.value}</span>
                  </div>
                )}
                {comanda.nota && <p className="tz-com-nota">{comanda.nota}</p>}
                {comanda.carimbo && <span className="tz-com-carimbo">{comanda.carimbo}</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="tz-sec tz-dark glow">
          <div className="tz-wrap">
            <div className="tz-head">
              <h2 className="tz-sec-h">
                <Title t={c.muda.title} />
              </h2>
            </div>
            <ol className="tz-lista odd">
              {c.muda.itens.map(([titulo, texto], i) => (
                <li key={titulo}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </li>
              ))}
            </ol>
            <div className="tz-split tz-email">
              {/* Papel do POP (capa, com o selo) na frente e a segunda página atrás. */}
              <div className="tz-folhas">
                <figure className="tz-folha tz-folha-p2">
                  <Image src={c.folhas.pagina2} alt={s.pagina2Alt} width={FOLHA.width} height={FOLHA.height} sizes={FOLHA.sizes} />
                </figure>
                <figure className="tz-folha tz-folha-capa">
                  {"selo" in c.folhas && c.folhas.selo && <span className="tz-selo">{c.folhas.selo}</span>}
                  <Image src={c.folhas.capa} alt={s.folhaAlt} width={FOLHA.width} height={FOLHA.height} sizes={FOLHA.sizes} />
                  <span className="tz-folha-tag">{s.folhaTag}</span>
                </figure>
              </div>
              <div className="tz-stack">
                <p className="tz-eyebrow">{s.emailEyebrow}</p>
                <div className="tz-arqs">
                  {s.arquivos.map((a, i) => (
                    <div className="tz-arq" key={i}>
                      <i style={{ background: a.cor }}>{a.tipo}</i>
                      <div>
                        <b>{a.titulo}</b>
                        <span>{a.texto}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tz-extras">
                  {c.email.extras.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <Cta label={c.cta} />
              </div>
            </div>
          </div>
        </section>

        <section className="tz-sec tz-light">
          <div className="tz-wrap tz-split rev">
            <div className="tz-desk">
              <Autor />
            </div>
            <div className="tz-stack">
              <h2 className="tz-sec-h">
                <Title t={c.autor.title} />
              </h2>
              <div className="tz-paras">
                {c.autor.paras.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="tz-mob">
                <Autor />
              </div>
              <div className="tz-stats">
                {c.autor.stats.map(([b, span]) => (
                  <div key={b}>
                    <b>{b}</b>
                    <span>{span}</span>
                  </div>
                ))}
              </div>
              <p className="tz-virada">{c.autor.virada}</p>
              <Cta label={c.cta} />
            </div>
          </div>
        </section>
      </main>

      <footer className="tz-foot">
        <div className="tz-wrap">
          <Logo />
          <p>
            {s.footer[0]}
            <br />
            {s.footer[1]}
          </p>
        </div>
      </footer>

      <PopSticky targetId={POP_FORM_ID}>
        <a className="tz-btn" href={`#${POP_FORM_ID}`}>
          <span>{c.cta}</span>
          <span className="tz-arr">
            <Ic name="arrow" />
          </span>
        </a>
      </PopSticky>
    </div>
  );
}
