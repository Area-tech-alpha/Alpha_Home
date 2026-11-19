import Image from "next/image";
import { BotaoForm, Depoimentos, Efeitos, Faq, FormNds, PalavraRiscada, Vsl } from "@/components/nao-dependa-de-sorte/client";
import { NdsIc, type NdsIconName } from "@/components/nao-dependa-de-sorte/icons";
import SaidaGatilho from "@/components/nao-dependa-de-sorte/saida-gatilho";
import { popFontClasses } from "@/components/pop/fonts";
import { contentNds as c, NDS_FORM_ID } from "@/lib/content-nao-dependa-de-sorte";

// /nao-dependa-de-sorte: carta de vendas do WP (template próprio, classes cv-).
// Seções alternando preto e branco (data-tema); o form da /01-lp fica no hero, no
// lugar da comanda. Server Component; as partes interativas ficam em client.tsx.

const LOGO = { src: "/images/logo-alpha.png", width: 764, height: 247 };

function Micro({ itens }: { itens: readonly (readonly [NdsIconName, string])[] }) {
  return (
    <div className="cv-micro">
      {itens.map(([ic, t]) => (
        <span key={t}>
          <NdsIc name={ic} />
          {t}
        </span>
      ))}
    </div>
  );
}

export default function PaginaNds() {
  const h = c.hero;
  return (
    <div className={`cv ${popFontClasses}`}>
      <Efeitos />

      <header className="cv-top" data-tema="preto">
        <div className="cv-wide">
          <Image className="cv-logo" src={LOGO.src} alt="Alpha Assessoria" width={LOGO.width} height={LOGO.height} sizes="110px" priority />
          <div className="cv-top-meta">
            <i />
            <span>{c.topo.meta[0]}</span>
            {c.topo.meta[1]}
          </div>
        </div>
      </header>

      <main>
        <section className="cv-hero" id="cv-topo" data-tema="branco">
          <div className="cv-wide cv-hero-grid">
            <div className="cv-hero-txt">
              <span className="cv-kick">
                <i>!</i>
                {h.kick[0]}
                <span className="cv-hm">{h.kick[1]}</span>
              </span>
              <h1>
                {h.h1.antes}
                <PalavraRiscada />
                {h.h1.depois}
                <em className="cv-mk" data-mk="">
                  {h.h1.mk}
                </em>
              </h1>
              <p className="cv-hero-deck">
                {h.deck[0]}
                <b>{h.deck[1]}</b>
                {h.deck[2]}
              </p>
              <div className="cv-cta">
                <BotaoForm className="cv-btn cv-btn-gold">{h.cta}</BotaoForm>
                <Micro itens={[["clock", h.micro[0]], ["check", h.micro[1]]]} />
              </div>
            </div>
            <div className="hero-form-card" id={NDS_FORM_ID} tabIndex={-1}>
              <h2 className="nds-form-t">{c.form.titulo}</h2>
              <span className="nds-form-sub">{c.form.sub}</span>
              <div className="al-modal-steps">
                {c.form.passos.map(([n, t]) => (
                  <span key={n}>
                    <b>{n}</b>
                    {t}
                  </span>
                ))}
              </div>
              <FormNds />
              <p className="dg-form-note">
                <NdsIc name="lock" />
                {c.form.nota}
              </p>
            </div>
          </div>
          <div className="cv-strip" aria-label={h.strip.map(([b, t]) => `${b} ${t}`).join(", ")}>
            <div className="cv-strip-t" aria-hidden="true">
              {[0, 1, 2, 3].flatMap((k) =>
                h.strip.map(([b, t]) => (
                  <span key={`${k}-${b}`}>
                    <b>{b}</b> {t}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="cv-week" id="cv-rotina" data-tema="preto">
          <div className="cv-col">
            <div className="cv-letterhead">
              <b>{c.semana.de[0]}</b>
              <span>{c.semana.de[1]}</span>
              <b>{c.semana.para[0]}</b>
              <span>{c.semana.para[1]}</span>
            </div>
            <span className="cv-lbl">{c.semana.lbl}</span>
            <h2 className="cv-h2">
              {c.semana.h2[0]}
              <em style={{ whiteSpace: "nowrap" }}>{c.semana.h2[1]}</em>
            </h2>
            <div className="cv-days">
              {c.semana.dias.map(([d, t]) => (
                <div className="cv-day" key={d}>
                  <b>{d}</b>
                  <p>{t}</p>
                </div>
              ))}
            </div>
            <p className="cv-p">
              {c.semana.p[0]}
              <b>{c.semana.p[1]}</b>
              {c.semana.p[2]}
            </p>
            <p className="cv-pull">
              {c.semana.pull[0]}
              <span className="cv-mk" data-mk="">
                {c.semana.pull[1]}
              </span>
            </p>
          </div>
        </section>

        <section className="cv-why" id="cv-porque" data-tema="branco">
          <div className="cv-wide">
            <div className="cv-col" style={{ padding: 0 }}>
              <span className="cv-lbl">{c.porque.lbl}</span>
              <h2 className="cv-h2">
                {c.porque.h2[0]}
                <em>{c.porque.h2[1]}</em>
              </h2>
              <p className="cv-p">
                {c.porque.p1[0]}
                <b>{c.porque.p1[1]}</b>
              </p>
              <p className="cv-p">{c.porque.p2}</p>
            </div>
            <div className="cv-split">
              <div className="cv-box cv-box-a">
                <h3>{c.porque.pedacos.titulo}</h3>
                <div className="cv-bits">
                  {c.porque.pedacos.itens.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <p>{c.porque.pedacos.p}</p>
              </div>
              <div className="cv-box cv-box-b">
                <h3>{c.porque.sistema.titulo}</h3>
                <ol className="cv-chain">
                  {c.porque.sistema.itens.map((t, i) => (
                    <li key={t}>
                      <span className="n">{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ol>
                <p>{c.porque.sistema.p}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cv-proofblk" id="cv-video" data-tema="preto">
          <div className="cv-wide">
            <div className="cv-proof-top">
              <div>
                <span className="cv-lbl">{c.prova.lbl}</span>
                <h2 className="cv-h2">
                  {c.prova.h2[0]}
                  <em>{c.prova.h2[1]}</em>
                </h2>
              </div>
              <div>
                <div className="cv-big">
                  {c.prova.big[0]}
                  <small>{c.prova.big[1]}</small>
                </div>
              </div>
            </div>
            <div className="cv-col" style={{ padding: 0, marginBottom: 44 }}>
              <p className="cv-p">
                {c.prova.p[0]}
                <b>{c.prova.p[1]}</b>
                {c.prova.p[2]}
                <b>{c.prova.p[3]}</b>
                {c.prova.p[4]}
              </p>
            </div>
            <div className="cv-vsl">
              <Vsl />
              <div className="cv-vsl-cap">
                <span>
                  <b>{c.prova.cap[0]}</b>
                  {c.prova.cap[1]}
                </span>
                <span>{c.prova.cap[2]}</span>
              </div>
            </div>
            <div className="cv-cta cv-cta-center">
              <BotaoForm className="cv-btn cv-btn-gold">{c.prova.cta}</BotaoForm>
              <Micro itens={[["check", c.prova.micro[0]], ["check", c.prova.micro[1]]]} />
            </div>
          </div>
        </section>

        <section className="cv-method" id="cv-metodo" data-tema="branco">
          <div className="cv-wide">
            <div className="cv-method-top">
              <div>
                <span className="cv-lbl">{c.metodo.lbl}</span>
                <h2 className="cv-h2">
                  {c.metodo.h2[0]}
                  <em>{c.metodo.h2[1]}</em>
                </h2>
              </div>
              <p className="cv-p">{c.metodo.p}</p>
            </div>
            <div className="cv-moves">
              {c.metodo.movimentos.map(([n, t, p]) => (
                <article className="cv-move" key={n}>
                  <i>{n}</i>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </article>
              ))}
            </div>
            <div className="cv-pillars">
              <h3>{c.metodo.pilaresTitulo}</h3>
              <ul>
                {c.metodo.pilares.map(([b, t]) => (
                  <li key={b}>
                    <b>{b}</b>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="cv-voices" id="cv-cases" data-tema="preto">
          <Depoimentos />
        </section>

        <section className="cv-story" id="cv-historia" data-tema="branco">
          <div className="cv-wide cv-story-grid">
            <div>
              <span className="cv-lbl">{c.historia.lbl}</span>
              <h2 className="cv-h2">
                {c.historia.h2[0]}
                <em style={{ whiteSpace: "nowrap" }}>{c.historia.h2[1]}</em>
              </h2>
              <p className="cv-p">{c.historia.p1}</p>
              <p className="cv-p">
                {c.historia.p2[0]}
                <b>{c.historia.p2[1]}</b>
                {c.historia.p2[2]}
              </p>
              <p className="cv-p">{c.historia.p3}</p>
            </div>
            <div className="cv-faces">
              {c.historia.time.map((p) => (
                <figure className="cv-face" key={p.nome}>
                  <Image src={p.foto} alt={p.nome} fill sizes="(min-width: 980px) 270px, 45vw" />
                  <figcaption>
                    <b>{p.nome}</b>
                    {p.cargo}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="cv-offer" id="cv-oferta" data-tema="preto">
          <div className="cv-wide">
            <span className="cv-lbl">{c.oferta.lbl}</span>
            <h2 className="cv-h2">
              {c.oferta.h2[0]}
              <em>{c.oferta.h2[1]}</em>
            </h2>
            <div className="cv-ticket">
              <div className="cv-ticket-main">
                <h3>{c.oferta.titulo}</h3>
                <ul>
                  {c.oferta.itens.map(([b, t]) => (
                    <li key={b}>
                      <NdsIc name="check" />
                      <span>
                        <b>{b}</b>
                        {t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="cv-ticket-side">
                <small>{c.oferta.investimento}</small>
                <strong>{c.oferta.valor}</strong>
                <p>{c.oferta.side}</p>
                <BotaoForm className="cv-btn">{c.oferta.cta}</BotaoForm>
              </div>
            </div>
            <div className="cv-why-free">
              {c.oferta.porque.map(([t, p]) => (
                <div key={t}>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cv-paths" id="cv-caminhos" data-tema="branco">
          <div className="cv-wide">
            <div style={{ textAlign: "center" }}>
              <span className="cv-lbl">{c.caminhos.lbl}</span>
            </div>
            <h2 className="cv-h2">
              {c.caminhos.h2[0]}
              <em>{c.caminhos.h2[1]}</em>
            </h2>
            <div className="cv-paths-grid">
              <div className="cv-path cv-path-a">
                <small>{c.caminhos.a.small}</small>
                <h3>{c.caminhos.a.h3}</h3>
                <ul>
                  {c.caminhos.a.itens.map((t) => (
                    <li key={t}>
                      <NdsIc name="x" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="cv-path cv-path-b">
                <small>{c.caminhos.b.small}</small>
                <h3>{c.caminhos.b.h3}</h3>
                <ul>
                  {c.caminhos.b.itens.map((t) => (
                    <li key={t}>
                      <NdsIc name="check" />
                      {t}
                    </li>
                  ))}
                </ul>
                <BotaoForm className="cv-btn">{c.caminhos.b.cta}</BotaoForm>
              </div>
            </div>
          </div>
        </section>

        <section className="cv-faq" id="cv-faq" data-tema="preto">
          <div className="cv-col">
            <span className="cv-lbl">{c.faq.lbl}</span>
            <h2 className="cv-h2">
              {c.faq.h2[0]}
              <em>{c.faq.h2[1]}</em>
            </h2>
            <Faq />
          </div>
        </section>

        <section className="cv-close" id="cv-final" data-tema="branco">
          <div className="cv-wide">
            <h2>
              {c.final.h2[0]}
              <em className="cv-mk" data-mk="">
                {c.final.h2[1]}
              </em>{" "}
              <span style={{ whiteSpace: "nowrap" }}>{c.final.h2[2]}</span>
            </h2>
            <p className="cv-p">{c.final.p}</p>
            <div className="cv-cta cv-cta-c">
              <BotaoForm className="cv-btn cv-btn-gold">{c.final.cta}</BotaoForm>
              <Micro itens={[["lock", c.final.micro[0]], ["phone", c.final.micro[1]], ["check", c.final.micro[2]]]} />
            </div>
            <div className="cv-sign">
              <p>{c.final.abraco}</p>
              <p className="sig">{c.final.assinatura}</p>
              <p style={{ marginTop: 28 }}>
                <b>{c.final.ps[0]}</b>
                {c.final.ps[1]}
                <a className="cv-ps-link" href={`#${NDS_FORM_ID}`}>
                  {c.final.ps[2]}
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="cv-foot" data-tema="preto">
        <div className="cv-wide">
          <Image className="cv-logo" src={LOGO.src} alt="Alpha Assessoria" width={LOGO.width} height={LOGO.height} sizes="100px" />
          <p>{c.rodape}</p>
        </div>
      </footer>

      <SaidaGatilho />
    </div>
  );
}
