"use client";

import { useEffect, useRef, useState } from "react";
import { Ic } from "@/components/pop/icons";
import { CONTADOR, MINI_CALC, calcularMini, contadorEm } from "@/lib/cmv";
import { calculadoraExtras as x } from "@/lib/content-calculadora-de-cmv";

// Partes interativas da /calculadora-de-cmv, com a lógica do WP (lib/cmv.ts).

// Mini calculadora (sliders): recalcula na hora, mesma fórmula e mesmas faixas do WP.
export function MiniCalc() {
  const [fat, setFat] = useState<number>(MINI_CALC.fat.inicial);
  const [cmv, setCmv] = useState<number>(MINI_CALC.cmv.inicial);
  const r = calcularMini(fat, cmv);
  const fill = (v: number, min: number, max: number) => ({ ["--p" as string]: `${((v - min) / (max - min)) * 100}%` });
  return (
    <div className="tz-calc">
      <div className="tz-calc-h">
        <span>{x.mini.titulo}</span>
        <b>{x.mini.tag}</b>
      </div>
      <div className="tz-calc-f">
        <label htmlFor="mc-fat">
          {x.mini.fatLabel}
          <output htmlFor="mc-fat">{r.fat}</output>
        </label>
        <input
          id="mc-fat"
          type="range"
          {...MINI_CALC.fat}
          value={fat}
          style={fill(fat, MINI_CALC.fat.min, MINI_CALC.fat.max)}
          onChange={(e) => setFat(+e.target.value)}
        />
      </div>
      <div className="tz-calc-f">
        <label htmlFor="mc-cmv">
          {x.mini.cmvLabel}
          <output htmlFor="mc-cmv">{r.cmv}</output>
        </label>
        <input
          id="mc-cmv"
          type="range"
          {...MINI_CALC.cmv}
          value={cmv}
          style={fill(cmv, MINI_CALC.cmv.min, MINI_CALC.cmv.max)}
          onChange={(e) => setCmv(+e.target.value)}
        />
      </div>
      <div className="tz-calc-res" data-ok={r.ok ? "true" : undefined} aria-live="polite">
        <small>{r.titulo}</small>
        <b>{r.perda}</b>
      </div>
      <p className="tz-calc-n">{r.nota}</p>
    </div>
  );
}

// "R$ 3.000/mês → R$ 36.000 por ano": conta de 3 mil a 36 mil em 1,6 s quando aparece.
export function Contador() {
  const ref = useRef<HTMLDivElement>(null);
  const [texto, setTexto] = useState(contadorEm(1));
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let t0 = 0;
        const step = (t: number) => {
          t0 ||= t;
          const k = Math.min(1, (t - t0) / CONTADOR.ms);
          setTexto(contadorEm(k));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="tz-conta" ref={ref}>
      <span className="m">{x.conta.mes}</span>
      <Ic name="arrow" />
      <span className="a">{texto}</span>
      <span className="m">{x.conta.ano}</span>
    </div>
  );
}

// Chips de segmento: mostram a faixa ideal do segmento tocado.
export function Chips() {
  const [i, setI] = useState(0);
  return (
    <div className="tz-stack" style={{ gap: 16, width: "100%" }}>
      <p className="tz-car-hint">{x.chipsHint}</p>
      <p className="tz-chip-out" aria-live="polite">
        {x.chips[i][1]}
      </p>
      <div className="tz-chips">
        {x.chips.map(([nome], j) => (
          <button type="button" key={nome} className="tz-chip" data-on={i === j ? "true" : undefined} aria-pressed={i === j} onClick={() => setI(j)}>
            {nome}
          </button>
        ))}
      </div>
    </div>
  );
}
