"use client";

import { useEffect, useRef, useState } from "react";
import { Ic } from "@/components/pop/icons";
import {
  PLANO_ALTO,
  PLANO_OK,
  PRATOS_EXEMPLO,
  SEGMENTOS_CMV,
  calcularCmv,
  cmvPrato,
  formatBrl,
  formatInput,
  formatPct,
  segmentoCmv,
  type Modo,
  type Prato,
} from "@/lib/cmv";
import { contentFerramenta as t } from "@/lib/content-ferramenta-calculadora-cmv";

// Calculadora mágica de CMV: mesma funcionalidade e mesmas fórmulas do WP
// (lib/cmv.ts), com layout novo. Estado salvo no navegador como no WP ("tzCalcCMV");
// sem storage (aba anônima, bloqueado) a página funciona igual, só não lembra.

const KEY = "tzCalcCMV";
type Campo = "fat" | "ei" | "co" | "ef";
type Estado = { modo: Modo; seg: string; v: Record<Campo, string>; pratos: Prato[] };

const INICIAL: Estado = { modo: "rapido", seg: "pizzaria", v: { fat: "", ei: "", co: "", ef: "" }, pratos: PRATOS_EXEMPLO.map((p) => ({ ...p })) };

function lerSalvo(): Estado | null {
  try {
    const sv = JSON.parse(localStorage.getItem(KEY) || "null");
    if (sv && sv.v && Array.isArray(sv.pratos) && (sv.modo === "rapido" || sv.modo === "ficha")) return sv as Estado;
  } catch {}
  return null;
}

// Número que "corre" até o novo valor (300 ms). Sem animação com reduced-motion.
function useTween(alvo: number) {
  const [v, setV] = useState(alvo);
  const de = useRef(alvo);
  useEffect(() => {
    const dur = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;
    const ini = de.current;
    let raf = 0;
    let t0 = 0;
    const step = (now: number) => {
      t0 ||= now;
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      const val = ini + (alvo - ini) * (1 - Math.pow(1 - k, 3));
      de.current = val;
      setV(val);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [alvo]);
  return v;
}

export default function CalculadoraCmv() {
  const [st, setSt] = useState<Estado>(INICIAL);
  const carregado = useRef(false);
  const novoPrato = useRef<number | null>(null);

  // Carrega o que estava salvo depois de montar (o HTML estático usa o estado inicial).
  useEffect(() => {
    const sv = lerSalvo();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- só o primeiro carregamento
    if (sv) setSt(sv);
    carregado.current = true;
  }, []);
  useEffect(() => {
    if (!carregado.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(st));
    } catch {}
  }, [st]);
  useEffect(() => {
    if (novoPrato.current == null) return;
    document.getElementById(`cx-prato-${novoPrato.current}-n`)?.focus();
    novoPrato.current = null;
  }, [st.pratos.length]);

  const seg = segmentoCmv(st.seg);
  const r = calcularCmv(st);
  const pAnim = useTween(r ? r.p : 0);
  const marcaAnim = useTween(r ? r.regua.marca : 0);

  const setCampo = (k: Campo, val: string) => setSt((s) => ({ ...s, v: { ...s.v, [k]: val } }));
  const setPrato = (i: number, k: keyof Prato, val: string) =>
    setSt((s) => ({ ...s, pratos: s.pratos.map((d, j) => (j === i ? { ...d, [k]: val } : d)) }));
  const limpar = () =>
    setSt((s) => (s.modo === "rapido" ? { ...s, v: { fat: "", ei: "", co: "", ef: "" } } : { ...s, pratos: [{ n: "", p: "", c: "", q: "" }] }));

  const estado = !r ? "vazio" : r.exc > 0 ? "acima" : "ok";
  const plano = r?.plano === "ok" ? PLANO_OK : PLANO_ALTO;

  return (
    <div className="fx-grid">
      <section className="fx-card fx-in" aria-label={t.cardNumeros}>
        <p className="fx-card-t">{t.cardNumeros}</p>
        <div className="fx-tabs" role="tablist" aria-label="Modo de cálculo" data-modo={st.modo}>
          {(["rapido", "ficha"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              id={`fx-tab-${m}`}
              aria-controls={`fx-painel-${m}`}
              aria-selected={st.modo === m}
              className="fx-tab"
              onClick={() => setSt((s) => ({ ...s, modo: m }))}
            >
              {t.tabs[m][0]}
              <small>{t.tabs[m][1]}</small>
            </button>
          ))}
        </div>

        <div className="fx-f">
          <label htmlFor="cx-seg">{t.seg.label}</label>
          <select id="cx-seg" value={seg.id} onChange={(e) => setSt((s) => ({ ...s, seg: e.target.value }))} aria-describedby="cx-seg-h">
            {SEGMENTOS_CMV.map((s) => (
              <option key={s.id} value={s.id}>
                {`${s.nome} · ideal ${s.min} a ${s.max}%`}
              </option>
            ))}
          </select>
          <small id="cx-seg-h">{t.seg.hint}</small>
        </div>

        <div id="fx-painel-rapido" role="tabpanel" aria-labelledby="fx-tab-rapido" hidden={st.modo !== "rapido"}>
          <div className="fx-campos">
            {t.campos.map((f) => (
              <div className="fx-f" key={f.k}>
                <label htmlFor={`cx-${f.k}`}>{f.label}</label>
                <div className="fx-money">
                  <span aria-hidden="true">R$</span>
                  <input
                    id={`cx-${f.k}`}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={f.placeholder}
                    value={st.v[f.k as Campo]}
                    aria-describedby={`cx-${f.k}-h`}
                    onChange={(e) => setCampo(f.k as Campo, e.target.value)}
                    onBlur={(e) => setCampo(f.k as Campo, formatInput(e.target.value))}
                  />
                </div>
                <small id={`cx-${f.k}-h`}>{f.hint}</small>
              </div>
            ))}
          </div>
          <p className="fx-formula">
            <b>{t.comoCalculamos}</b> {t.formulaRapido}
          </p>
        </div>

        <div id="fx-painel-ficha" role="tabpanel" aria-labelledby="fx-tab-ficha" hidden={st.modo !== "ficha"}>
          <div className="fx-dish-h" aria-hidden="true">
            {t.pratos.colunas.map((c) => (
              <span key={c}>{c}</span>
            ))}
            <span />
          </div>
          <div className="fx-dishes">
            {st.pratos.map((d, i) => {
              const lp = cmvPrato(d, seg);
              return (
                <div className="fx-dish" key={i}>
                  {(["n", "p", "c", "q"] as const).map((k) => (
                    <div className="fx-dish-c" data-k={k} key={k}>
                      <label className="fx-sr" htmlFor={`cx-prato-${i}-${k}`}>
                        {t.pratos.labels[k]}
                      </label>
                      <input
                        id={`cx-prato-${i}-${k}`}
                        value={d[k]}
                        inputMode={k === "n" ? undefined : k === "q" ? "numeric" : "decimal"}
                        placeholder={t.pratos.placeholders[k]}
                        onChange={(e) => setPrato(i, k, e.target.value)}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="fx-rm"
                    aria-label={t.pratos.remover}
                    disabled={st.pratos.length <= 1}
                    onClick={() => setSt((s) => (s.pratos.length > 1 ? { ...s, pratos: s.pratos.filter((_, j) => j !== i) } : s))}
                  >
                    <Ic name="x" />
                  </button>
                  <span className="fx-pct" data-cor={lp.cor ?? undefined}>
                    {lp.texto}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="fx-add"
            onClick={() => {
              novoPrato.current = st.pratos.length;
              setSt((s) => ({ ...s, pratos: [...s.pratos, { n: "", p: "", c: "", q: "" }] }));
            }}
          >
            <Ic name="plus" />
            {t.pratos.adicionar}
          </button>
          <p className="fx-formula">
            <b>{t.comoCalculamos}</b> {t.formulaFicha}
          </p>
        </div>
      </section>

      <section className="fx-card fx-res" aria-label={t.cardDiagnostico} data-estado={estado}>
        <p className="fx-card-t">{t.cardDiagnostico}</p>
        <div aria-live="polite">
          {!r ? (
            <div className="fx-vazio">
              <div className="fx-regua" data-vazio="true">
                <div className="fx-regua-t" />
              </div>
              <p>{t.res.vazio}</p>
            </div>
          ) : (
            <>
              <div className="fx-top">
                <div>
                  <small>{t.res.seuCmv}</small>
                  <div className="fx-cmv">
                    {formatPct(pAnim)}
                    <span>%</span>
                  </div>
                </div>
                <span className="fx-veredito" data-tom={r.veredito.tom}>
                  {r.veredito.texto}
                </span>
              </div>

              <div className="fx-regua">
                <div className="fx-regua-t">
                  <div className="fx-regua-b" style={{ left: `${r.regua.min}%`, right: `${100 - r.regua.max}%` }} />
                  <div className="fx-regua-m" style={{ left: `${marcaAnim}%` }} />
                </div>
                <div className="fx-regua-l">
                  <span>{t.res.escala[0]}</span>
                  <span>
                    ideal {r.seg.min} a {r.seg.max}% · {r.seg.nome}
                  </span>
                  <span>{t.res.escala[1]}</span>
                </div>
              </div>

              {r.naMesa ? (
                <div className="fx-mesa">
                  <small>{t.res.mesa}</small>
                  <b>
                    {formatBrl(r.perda)}
                    <span>{t.res.porMes}</span>
                  </b>
                  <p>
                    {t.res.mesaTexto[0]}
                    <strong>
                      {formatPct(r.exc)}
                      {t.res.mesaTexto[1]}
                    </strong>
                    {t.res.mesaTexto[2]}
                    <strong>
                      {formatBrl(r.perda * 12)}
                      {t.res.mesaTexto[3]}
                    </strong>
                    {t.res.mesaTexto[4]}
                  </p>
                </div>
              ) : (
                <div className="fx-mesa" data-ok="true">
                  <small>{t.res.okTitulo}</small>
                  <b>{t.res.okValor}</b>
                  <p>
                    {t.res.okTexto[0]}
                    {r.seg.nome}
                    {t.res.okTexto[1]}
                  </p>
                </div>
              )}

              <div className="fx-mini">
                <div>
                  <small>{t.res.cmvRs}</small>
                  <b>{formatBrl(r.cmv)}</b>
                </div>
                <div>
                  <small>
                    {t.res.noTeto[0]}
                    {r.seg.max}
                    {t.res.noTeto[1]}
                  </small>
                  <b>{formatBrl(r.noTeto)}</b>
                </div>
              </div>

              {r.viloes.length > 0 && (
                <div className="fx-viloes">
                  <h4>{t.res.viloes}</h4>
                  {r.viloes.map((v, i) => (
                    <div key={i}>
                      <span>{v.n}</span>
                      <span>
                        CMV {formatPct(v.p)}%<br />~{formatBrl(v.e)}
                        {t.res.acimaIdeal}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="fx-plano">
                <h4>{t.res.plano}</h4>
                <p>{r.plano === "ok" ? t.res.planoOk : t.res.planoAlto}</p>
                <ol>
                  {plano.map(([sem, titulo, texto]) => (
                    <li key={sem}>
                      <b>{sem}</b>
                      <div>
                        <h5>{titulo}</h5>
                        <p>{texto}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </div>
        <div className="fx-acoes">
          <button type="button" className="fx-ac" onClick={() => window.print()}>
            <Ic name="printer" />
            {t.acoes.imprimir}
          </button>
          <button type="button" className="fx-ac" onClick={limpar}>
            <Ic name="trash" />
            {t.acoes.limpar}
          </button>
        </div>
      </section>
    </div>
  );
}
