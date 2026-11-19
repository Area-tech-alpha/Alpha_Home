"use client";

import { useEffect, useRef, useState } from "react";
import { irParaForm, tocarVslDeFora } from "@/components/nao-dependa-de-sorte/client";
import { NdsIc } from "@/components/nao-dependa-de-sorte/icons";
import { contentNds as c } from "@/lib/content-nao-dependa-de-sorte";

// Quiz "Antes de sair" (textos e respostas do WP). Carregado só quando o gatilho dispara.
export default function Saida({ onClose }: { onClose: () => void }) {
  const s = c.saida;
  const [resp, setResp] = useState<string | null>(null);
  const caixa = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.ndsLock = "true";
    const anterior = document.activeElement as HTMLElement | null;
    caixa.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      delete html.dataset.ndsLock;
      document.removeEventListener("keydown", onKey);
      anterior?.focus?.({ preventScroll: true });
    };
  }, [onClose]);
  const r = resp ? s.respostas[resp] : null;
  return (
    <div className="cv-exit" data-saida="aberta" role="dialog" aria-modal="true" aria-labelledby="cvExitTitle">
      <div className="cv-exit-bg" onClick={onClose} />
      <div className="cv-exit-box" ref={caixa}>
        <div className="cv-exit-head">
          <i />
          {s.head}
        </div>
        <button type="button" className="cv-x" aria-label={s.fechar} onClick={onClose}>
          <NdsIc name="x" />
        </button>
        <div className="cv-exit-body">
          {!r ? (
            <div>
              <h3 id="cvExitTitle">
                {s.pergunta[0]}
                <em>{s.pergunta[1]}</em>
                {s.pergunta[2]}
              </h3>
              <p>{s.instrucao}</p>
              <div className="cv-opts">
                {s.opcoes.map(([k, t]) => (
                  <button type="button" className="cv-opt" key={k} onClick={() => setResp(k)}>
                    {t}
                    <NdsIc name="arrow" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-ans" aria-live="polite">
              <span className="cv-ans-tag">{r.tag}</span>
              <h3 id="cvExitTitle">
                {r.t[0]}
                <em>{r.t[1]}</em>
              </h3>
              <p>{r.p.map((t, i) => (i % 2 ? <b key={i}>{t}</b> : t))}</p>
              <button
                type="button"
                className="cv-btn cv-btn-gold"
                onClick={() => {
                  onClose();
                  irParaForm();
                }}
              >
                {s.ir}
                <span className="cv-btn-ic">
                  <NdsIc name="arrow" />
                </span>
              </button>
              <button
                type="button"
                className="cv-plain cv-ans-alt"
                onClick={() => {
                  onClose();
                  document.getElementById("cv-video")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  window.setTimeout(tocarVslDeFora, 700);
                }}
              >
                {s.video}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
