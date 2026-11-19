import { Chips, MiniCalc } from "@/components/pop/calculadora-client";
import { Cta } from "@/components/pop/pop-page";
import { Title } from "@/components/pop/parts";
import { calculadoraExtras as x, contentCalculadoraCmv as c } from "@/lib/content-calculadora-de-cmv";

// Partes só da /calculadora-de-cmv (as interativas ficam em calculadora-client.tsx).

// Mini calculadora (no WP ficava à direita do hero).
export function SecaoMiniCalc() {
  return (
    <section className="tz-sec tz-dark tz-vitrine" aria-label="Simulação rápida de CMV">
      <div className="tz-wrap">
        <div className="tz-vitrine-in">
          <MiniCalc />
        </div>
      </div>
    </section>
  );
}

// "Seus números, a resposta em reais": lista, chips, frases e as 4 telas de exemplo.
export function SecaoNumeros() {
  const t = x.telas;
  return (
    <section className="tz-sec tz-dark glow">
      <div className="tz-wrap">
        <div className="tz-split w" style={{ alignItems: "start" }}>
          <div className="tz-stack">
            <h2 className="tz-sec-h">
              <Title t={c.muda.title} />
            </h2>
            <ol className="tz-lista so">
              {x.lista.map((item, i) => (
                <li key={item}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{item}</h3>
                </li>
              ))}
            </ol>
          </div>
          <div className="tz-stack" style={{ gap: 40 }}>
            <Chips />
            <div className="tz-socos">
              {x.socos.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Cta label={c.cta} />
          </div>
        </div>
        <div style={{ marginTop: 72 }}>
          <div className="tz-telas">
            <div className="tz-tela">
              <div className="tz-tela-t">
                <span>{t.t1.titulo}</span>
                <b>{t.t1.tag}</b>
              </div>
              {t.t1.linhas.map(([k, v]) => (
                <div className="tz-tela-f" key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
              <p className="tz-tela-cap">{t.t1.cap}</p>
            </div>
            <div className="tz-tela">
              <div className="tz-tela-t">
                <span>{t.t2.titulo}</span>
                <b>{t.t2.tag}</b>
              </div>
              <div className="tz-gauge">
                <i style={{ left: "27.5%", right: "57.5%" }} />
                <em style={{ left: "50%" }} />
              </div>
              <div className="tz-gauge-l">
                {t.t2.escala.map((e) => (
                  <span key={e}>{e}</span>
                ))}
              </div>
              <p className="tz-tela-cap">{t.t2.cap}</p>
            </div>
            <div className="tz-tela">
              <div className="tz-tela-t">
                <span>{t.t3.titulo}</span>
                <b>{t.t3.tag}</b>
              </div>
              <p className="tz-tela-p">{t.t3.antes}</p>
              <div className="tz-tela-big">{t.t3.valor}</div>
              <p className="tz-tela-p">{t.t3.depois}</p>
            </div>
            <div className="tz-tela">
              <div className="tz-tela-t">
                <span>{t.t4.titulo}</span>
                <b>{t.t4.tag}</b>
              </div>
              {t.t4.itens.map((it, i) => (
                <div className="tz-tela-w" key={it}>
                  <b>{i + 1}</b>
                  {it}
                </div>
              ))}
            </div>
          </div>
          <p className="tz-exemplo" style={{ textAlign: "left" }}>
            {t.exemplo}
          </p>
        </div>
      </div>
    </section>
  );
}

// Linha do tempo do faturamento da Alpha's (depois dos números do autor).
export function LinhaDoTempo() {
  const tl = x.timeline;
  return (
    <div className="tz-tl">
      <p className="tz-tl-t">{tl.titulo}</p>
      <div className="tz-tl-l">
        {tl.pontos.map(([m, v], i) => (
          <div className="tz-tl-p" key={m} data-top={i === tl.pontos.length - 1 ? "true" : undefined}>
            <small>{m}</small>
            <b>{v}</b>
            {i === tl.pontos.length - 1 && <span className="tz-tl-selo">{tl.selo}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
