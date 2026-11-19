import Image from "next/image";
import { Ic } from "@/components/pop/icons";
import { Cta } from "@/components/pop/pop-page";
import { cardapioExtras as x } from "@/lib/content-cardapio-que-vende";

// Partes só da /cardapio-que-vende. As animações são as do WP, em CSS puro (ciclo de
// 10 s: toque no item, sugestão de combo, sacola de 1 para 2 e total de R$ 59,00 para
// R$ 71,00; anel de 10 a 0 em loop). Sem JS.

// Celular com o cardápio animado (no WP ficava à direita do hero).
export function CelularCardapio() {
  const cel = x.celular;
  return (
    <section className="tz-sec tz-dark tz-vitrine" aria-label="Exemplo de cardápio no celular">
      <div className="tz-wrap">
        <div className="tz-vitrine-in">
          <div className="tz-phone" aria-hidden="true">
            <div className="tz-phone-scr">
              <div className="tz-cdp">
                <div className="tz-cdp-top">
                  <div className="tz-cdp-row">
                    <span className="tz-cdp-nome">{cel.nome}</span>
                    <span className="tz-cdp-timer">
                      <Ic name="timer" />
                      {cel.timer}
                    </span>
                  </div>
                  <span className="tz-cdp-aberto">{cel.aberto}</span>
                  <div className="tz-cdp-cats">
                    {cel.cats.map((cat, i) => (
                      <span key={cat} data-on={i === 0 ? "true" : undefined}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="tz-cdp-list">
                  {cel.itens.map((it) => (
                    <div key={it.nome} className="tz-cdp-it" data-alvo={it.alvo ? "true" : undefined}>
                      <Image src={it.img} alt="" width={58} height={58} sizes="58px" />
                      <div>
                        <b>{it.nome}</b>
                        <p>{it.desc}</p>
                        <em>{it.preco}</em>
                      </div>
                    </div>
                  ))}
                  <div className="tz-cdp-sheet">
                    <small>{cel.sheet.small}</small>
                    <b>{cel.sheet.titulo}</b>
                    <div className="tz-cdp-add">
                      <Ic name="arrow" />
                      {cel.sheet.botao}
                    </div>
                  </div>
                  <span className="tz-dedo" />
                </div>
                <div className="tz-cdp-bag">
                  <span>
                    <Ic name="bag" />
                    {cel.sacola} <i />
                  </span>
                  <span className="tot" />
                </div>
              </div>
            </div>
          </div>
          <p className="tz-exemplo">{cel.exemplo}</p>
        </div>
      </div>
    </section>
  );
}

// Anel de 10 segundos (10 → 0) acima da comanda.
export function Anel() {
  return (
    <div className="tz-anel" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <circle className="bg" cx="60" cy="60" r="54" />
        <circle className="fg" cx="60" cy="60" r="54" />
      </svg>
      <span />
    </div>
  );
}

// Antes x depois do item + o que vem no guia + páginas do guia.
export function BlocoCardapio({ cta, extras }: { cta: string; extras: readonly string[] }) {
  const { antes, depois, exemplo } = x.antesDepois;
  return (
    <>
      <div className="tz-split tz-email">
        <div>
          <div className="tz-ad">
            <div className="tz-ad-c" data-tipo="antes">
              <span className="tz-ad-tag">{antes.tag}</span>
              <div className="tz-ad-row">
                <span>{antes.nome}</span>
                <span>{antes.preco}</span>
              </div>
            </div>
            <div className="tz-ad-c" data-tipo="depois">
              <span className="tz-ad-tag">{depois.tag}</span>
              <div className="tz-ad-it">
                <Image src={depois.img} alt={depois.alt} width={96} height={96} sizes="96px" />
                <div>
                  <b>{depois.nome}</b>
                  <p>{depois.desc}</p>
                  <em>{depois.preco}</em>
                </div>
              </div>
              <div className="tz-ad-combo">
                <span>{depois.combo}</span>
                <b>{depois.comboPreco}</b>
              </div>
            </div>
          </div>
          <p className="tz-exemplo">{exemplo}</p>
        </div>
        <div className="tz-stack">
          <div className="tz-extras">
            {extras.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Cta label={cta} />
        </div>
      </div>
      <div className="tz-guia" style={{ marginTop: 64 }}>
        {x.guia.map((g) => (
          <figure className="tz-gpag" key={g.img}>
            <Image src={g.img} alt={`Página do guia: ${g.legenda}`} width={560} height={792} sizes="(min-width: 900px) 260px, 45vw" />
            <em>{g.legenda}</em>
          </figure>
        ))}
      </div>
    </>
  );
}

// Foto da fachada no lugar do Ailton.
export function FachadaAlphas() {
  const f = x.fachada;
  return (
    <figure className="tz-autor">
      <div className="tz-autor-foto">
        <Image src={f.src} alt={f.alt} width={f.width} height={f.height} sizes="(min-width: 900px) 460px, 90vw" />
      </div>
      <figcaption className="tz-autor-cap">
        <b>{f.nome}</b>
        <span>
          {f.cap[0]}
          <br />
          {f.cap[1]}
        </span>
      </figcaption>
    </figure>
  );
}
