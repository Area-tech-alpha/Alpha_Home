import Image from "next/image";
import { popFontClasses } from "@/components/pop/fonts";
import { Ic } from "@/components/pop/icons";
import { Autor, Logo, Title } from "@/components/pop/parts";
import { AbrirCalc, IscaTexto, RaioXOk, RaioXVideos } from "@/components/pop/raio-x-client";
import PopSticky from "@/components/pop/sticky";
import { contentRaioX as c } from "@/lib/content-raio-x";

// /raio-x-do-restaurante: obrigado das LPs de POP (migração da página do WP).
// A barra amarela e a etiqueta do hero mudam conforme a isca (?isca=): o texto é
// escolhido no navegador (página estática), com o espaço já reservado.

const HERO_CTA_ID = "raio-x-cta";

function RaioXBtn({ id }: { id?: string }) {
  return (
    <button type="button" className="tz-btn" data-raiox id={id}>
      <span>{c.cta}</span>
      <span className="tz-arr">
        <Ic name="arrow" />
      </span>
    </button>
  );
}

export default function RaioXPage() {
  const { rx } = c.hero;
  return (
    <div className={`pop tz ${popFontClasses}`}>
      <div className="tz-conf" role="status">
        <div className="tz-wrap">
          <p>
            <Ic name="check" />
            <IscaTexto campo="barra" />
          </p>
          <AbrirCalc />
        </div>
      </div>

      <header className="tz-hero rx">
        <Image className="tz-bg-img" src={c.hero.image} alt="" fill priority sizes="100vw" />
        <div className="tz-wrap">
          <div className="tz-top">
            <span className="tz-logo">
              <Logo priority />
            </span>
            <span className="tz-top-tag">{c.topTag}</span>
          </div>
          <div className="tz-grid2">
            <div className="tz-stack">
              <p className="tz-etq-g">
                <IscaTexto campo="etq" />
              </p>
              <h1 className="tz-h1 xl">
                <Title t={c.hero.title} />
              </h1>
              <p className="tz-sub">{c.hero.sub}</p>
              <div className="tz-cta">
                <RaioXBtn id={HERO_CTA_ID} />
                <p className="tz-um-clique">
                  <Ic name="check" />
                  {c.hero.umClique}
                </p>
              </div>
              <p className="tz-prova">
                <Ic name="check" />
                <span>{c.hero.prova}</span>
              </p>
            </div>
            <div>
              <div style={{ maxWidth: 300, margin: "0 auto" }}>
                <div className="tz-phone">
                  <div className="tz-phone-scr">
                    <div className="tz-rx" aria-hidden="true">
                      <div className="tz-rx-h">
                        <b>{rx.titulo}</b>
                        <span>{rx.tag}</span>
                      </div>
                      <div className="tz-rx-b d">
                        <small>{rx.demanda[0]}</small>
                        <div className="tz-rx-num">{rx.demanda[1]}</div>
                        <div className="tz-rx-bars">
                          {[30, 42, 38, 55, 64, 72, 88].map((h) => (
                            <i key={h} style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="tz-rx-b">
                        <small>{rx.margem[0]}</small>
                        <div className="tz-rx-num">{rx.margem[1]}</div>
                        <div className="tz-rx-l" style={{ width: "80%" }} />
                      </div>
                      <div className="tz-rx-b">
                        <small>{rx.operacao[0]}</small>
                        <div className="tz-rx-num">{rx.operacao[1]}</div>
                        <div className="tz-rx-l" style={{ width: "65%" }} />
                      </div>
                      <div className="tz-rx-b">
                        <small>{rx.plano}</small>
                        <div className="tz-rx-plano">
                          {[1, 2, 3].map((n) => (
                            <span key={n}>
                              <b>{n}</b>
                              <em />
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="tz-exemplo">{c.hero.exemplo}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="tz-sec tz-paper">
          <div className="tz-wrap tz-grid2">
            <div className="tz-stack">
              <h2 className="tz-sec-h">
                <Title t={c.limite.title} />
              </h2>
              <div className="tz-paras">
                {c.limite.paras.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            <div className="tz-stack" style={{ gap: 18 }}>
              <div className="tz-tres">
                {c.limite.tres.map((t, i) => (
                  <div key={t}>
                    <b>{i + 1}</b>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
              <p className="tz-virada">{c.limite.virada}</p>
              <div className="tz-cta">
                <RaioXBtn />
              </div>
            </div>
          </div>
        </section>

        <section className="tz-sec tz-dark">
          <div className="tz-wrap">
            <div className="tz-stack tz-head">
              <h2 className="tz-sec-h">
                <Title t={c.analisa.title} />
              </h2>
            </div>
            <div className="tz-of">
              <div className="tz-of-c um">
                <div>
                  <span className="tz-of-n">{c.analisa.destaque.n}</span>
                  <h3>{c.analisa.destaque.titulo}</h3>
                  <p>{c.analisa.destaque.texto}</p>
                </div>
                <div className="tz-of-print">
                  <Image src={c.analisa.destaque.print.src} alt={c.analisa.destaque.print.alt} width={655} height={1024} sizes="260px" />
                  <span>{c.analisa.destaque.print.legenda}</span>
                </div>
              </div>
              {c.analisa.itens.map(([n, titulo, texto]) => (
                <div className="tz-of-c" key={n}>
                  <span className="tz-of-n">{n}</span>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </div>
              ))}
            </div>
            <div className="tz-stack" style={{ marginTop: 32, maxWidth: 760 }}>
              <p className="tz-of-fim">{c.analisa.fim}</p>
              <div className="tz-cta">
                <RaioXBtn />
              </div>
            </div>
          </div>
        </section>

        <section className="tz-sec tz-light">
          <div className="tz-wrap tz-grid2" style={{ alignItems: "start" }}>
            <div className="tz-stack">
              <h2 className="tz-sec-h">
                <Title t={c.testado.title} />
              </h2>
              <div className="tz-paras">
                {c.testado.paras.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            <div className="tz-stack" style={{ gap: 18 }}>
              <Autor />
            </div>
          </div>
          <div className="tz-wrap" style={{ marginTop: 40 }}>
            <span className="tz-car-hint">{c.testado.hint}</span>
            <RaioXVideos />
            <div className="tz-cta" style={{ marginTop: 10 }}>
              <RaioXBtn />
            </div>
          </div>
        </section>

        <section className="tz-sec tz-dark">
          <div className="tz-wrap">
            <div className="tz-stack tz-head">
              <h2 className="tz-sec-h">
                <Title t={c.funciona.title} />
              </h2>
            </div>
            <div className="tz-stack" style={{ marginTop: 24, gap: 16 }}>
              <div className="tz-passos">
                {c.funciona.passos.map((p, i) => (
                  <div className="tz-passo" key={p}>
                    <b>{i + 1}</b>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              <p className="tz-cnpj">
                <Ic name="check" />
                {c.funciona.cnpj}
              </p>
            </div>
            <div className="tz-grid2" style={{ marginTop: 48, alignItems: "start" }}>
              <div className="tz-faq">
                {c.funciona.faq.map(([q, a]) => (
                  <details key={q}>
                    <summary>
                      {q}
                      <Ic name="chevron" />
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
              <div className="tz-stack">
                <p className="tz-virada">{c.funciona.virada}</p>
                <div className="tz-cta">
                  <RaioXBtn />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="tz-foot">
        <div className="tz-wrap">
          <Logo />
          <p>{c.footer}</p>
        </div>
      </footer>

      <PopSticky targetId={HERO_CTA_ID}>
        <RaioXBtn />
      </PopSticky>
      <RaioXOk />
    </div>
  );
}
