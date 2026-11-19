import Image from "next/image";
import type { ReactNode } from "react";
import { popFontClasses } from "@/components/pop/fonts";
import { Ic } from "@/components/pop/icons";
import LeadFormPop from "@/components/pop/lead-form-pop";
import PopSticky from "@/components/pop/sticky";
import { Autor, Logo, Title } from "@/components/pop/parts";
import { POP_FORM_ID, popForm, popShared as s, type PopContent, type PopComandaRow } from "@/lib/content-pop";

// Estrutura comum das LPs de isca no padrão das POP (mesmo template no WP). Mudanças
// pedidas em relação ao WP: o form fica visível no hero (no WP era um modal) e os
// botões rolam até ele; o que ocupava o lado direito do hero (papel do material,
// celular do cardápio, mini calculadora) desce para a seção seguinte.
// As partes que só existem numa página entram pelos "slots".
// Página leve: sem animação de entrada, sem efeitos de cursor.

const FOLHA_SIZES = "(min-width: 900px) 460px, 90vw";

export function Cta({ label }: { label: string }) {
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

function ComandaRow({ r }: { r: PopComandaRow }) {
  const icon = r.icon && <Ic name={r.icon === "sim" ? "check" : "x"} className="tz-com-ic" label={r.icon === "sim" ? "sim" : "não"} />;
  return (
    <div className={["tz-com-r", r.tone, r.big && "big"].filter(Boolean).join(" ")}>
      <span className="l">{r.label}</span>
      <span className="d" />
      <span className="v">
        {r.strike && <s>{r.strike}</s>}
        {r.iconPos === "before" && icon}
        {r.value}
        {r.iconPos !== "before" && icon}
      </span>
    </div>
  );
}

export type PopSlots = {
  // Seção logo depois do hero (o que ficava à direita do hero no WP).
  depoisDoHero?: ReactNode;
  // Antes e depois da comanda (anel de 10 s do cardápio; contador da calculadora).
  antesDaComanda?: ReactNode;
  depoisDaComanda?: ReactNode;
  // Substitui a seção escura inteira ("O que muda…").
  secaoMuda?: ReactNode;
  // Substitui o bloco papel do material + "O que chega no seu e-mail".
  blocoEmail?: ReactNode;
  // Substitui a foto do Ailton e acrescenta conteúdo depois dos números.
  figuraAutor?: ReactNode;
  depoisDosNumeros?: ReactNode;
};

export default function PopPage({ c, slots = {} }: { c: PopContent; slots?: PopSlots }) {
  const { comanda } = c.problema;
  const sepAntes = comanda.sepAntes ?? comanda.rows.length;
  const figura = slots.figuraAutor ?? <Autor />;
  return (
    <div className={`pop tz ${popFontClasses}`}>
      <header className="tz-hero">
        <Image className="tz-bg-img" src={c.hero.image} alt="" fill priority sizes="100vw" />
        <div className="tz-wrap">
          <div className="tz-top">
            <span className="tz-logo">
              <Logo priority />
            </span>
            <span className="tz-top-tag">{c.topTag ?? s.topTag}</span>
          </div>
          <div className="tz-hero-grid">
            <div className="tz-stack">
              <p className="tz-eyebrow">{c.eyebrow ?? s.eyebrow}</p>
              <h1 className={["tz-h1", c.hero.titleSize].filter(Boolean).join(" ")}>
                <Title t={c.hero.title} tone={c.hero.titleTone} />
              </h1>
              <p className="tz-sub">{c.hero.sub}</p>
              <Cta label={c.cta} />
              <p className="tz-prova">
                <Ic name="check" />
                <span>{c.hero.prova}</span>
              </p>
            </div>
            <div className="tz-formcard" id={POP_FORM_ID} tabIndex={-1}>
              <LeadFormPop slug={c.slug} submit={c.form?.submit ?? popForm.submit} nota={c.form?.nota ?? popForm.nota} />
            </div>
          </div>
        </div>
      </header>

      <main>
        {slots.depoisDoHero}

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
              {slots.antesDaComanda}
              <div className="tz-com">
                <div className="tz-com-h">
                  <b>{comanda.titulo}</b>
                  {comanda.subtitulo}
                </div>
                {comanda.rows.slice(0, sepAntes).map((r) => (
                  <ComandaRow key={r.label} r={r} />
                ))}
                <div className="tz-com-sep" />
                {comanda.rows.slice(sepAntes).map((r) => (
                  <ComandaRow key={r.label} r={r} />
                ))}
                {comanda.total && (
                  <div className="tz-com-tot">
                    <span className="l">{comanda.total.label}</span>
                    <span className="v">{comanda.total.value}</span>
                  </div>
                )}
                {comanda.nota && <p className="tz-com-nota">{comanda.nota}</p>}
                {comanda.carimbo && <span className="tz-com-carimbo">{comanda.carimbo}</span>}
              </div>
              {slots.depoisDaComanda}
            </div>
          </div>
        </section>

        {slots.secaoMuda ?? (
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
              {slots.blocoEmail ?? (c.folhas && c.email && <BlocoEmail c={c} />)}
            </div>
          </section>
        )}

        <section className="tz-sec tz-light">
          <div className="tz-wrap tz-split rev">
            <div className="tz-desk">{figura}</div>
            <div className="tz-stack">
              <h2 className="tz-sec-h">
                <Title t={c.autor.title} />
              </h2>
              <div className="tz-paras">
                {c.autor.paras.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="tz-mob">{figura}</div>
              <div className="tz-stats">
                {c.autor.stats.map(([b, span]) => (
                  <div key={b}>
                    <b>{b}</b>
                    <span>{span}</span>
                  </div>
                ))}
              </div>
              {slots.depoisDosNumeros}
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

// Papel do material (capa na frente, com o selo; segunda página atrás) + o que chega no e-mail.
function BlocoEmail({ c }: { c: PopContent }) {
  const f = c.folhas!;
  const dim = { width: f.width ?? 920, height: f.height ?? 1299, sizes: FOLHA_SIZES };
  return (
    <div className="tz-split tz-email">
      <div className="tz-folhas" data-land={f.land ? "true" : undefined}>
        <figure className="tz-folha tz-folha-p2">
          <Image src={f.pagina2} alt={s.pagina2Alt} {...dim} />
        </figure>
        <figure className="tz-folha tz-folha-capa">
          {f.selo && <span className="tz-selo">{f.selo}</span>}
          <Image src={f.capa} alt={f.capaAlt ?? s.folhaAlt} {...dim} />
          <span className="tz-folha-tag">{s.folhaTag}</span>
        </figure>
      </div>
      <div className="tz-stack">
        <p className="tz-eyebrow">{s.emailEyebrow}</p>
        <Arquivos lista={c.email?.arquivos ?? s.arquivos} />
        <div className="tz-extras">
          {c.email!.extras.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <Cta label={c.cta} />
      </div>
    </div>
  );
}

function Arquivos({ lista }: { lista: readonly { tipo: string; cor: string; titulo: string; texto: string }[] }) {
  return (
    <div className="tz-arqs">
      {lista.map((a, i) => (
        <div className="tz-arq" key={i}>
          <i style={{ background: a.cor }}>{a.tipo}</i>
          <div>
            <b>{a.titulo}</b>
            <span>{a.texto}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
