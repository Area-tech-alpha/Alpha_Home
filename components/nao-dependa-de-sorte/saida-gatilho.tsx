"use client";

import { useEffect, useState, type ComponentType } from "react";

// Pop-up de retenção do WP (quiz de 1 toque), 1x por sessão. Aqui só ficam os
// gatilhos (leves); o quiz é baixado na hora em que dispara.
//   desktop: mouse saindo pelo topo · celular: botão voltar ou rolagem rápida pra cima
// Nunca abre nos primeiros 5 s, nem depois de já ter aparecido na sessão.
const KEY = "cv_exit_visto";
function visto() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
function marcar() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {}
}

type Quiz = ComponentType<{ onClose: () => void }>;

export default function SaidaGatilho() {
  const [Quiz, setQuiz] = useState<Quiz | null>(null);
  useEffect(() => {
    const inicio = Date.now();
    let aberto = false;
    const abrir = () => {
      if (aberto || visto() || Date.now() - inicio < 5000) return false;
      aberto = true;
      marcar();
      import("@/components/nao-dependa-de-sorte/saida").then((m) => setQuiz(() => m.default));
      return true;
    };
    const hover = window.matchMedia("(hover:hover)").matches;
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 4) abrir();
    };
    // celular: uma entrada extra no histórico depois do 1º toque; o 2º "voltar" sai normalmente
    let armado = false;
    const armar = () => {
      if (armado || visto() || hover) return;
      armado = true;
      try {
        history.pushState({ cvExit: 1 }, "", location.href);
      } catch {}
    };
    const onPop = () => {
      if (!armado) return;
      armado = false;
      if (!abrir()) history.back();
    };
    let ultY = window.scrollY;
    let ultT = Date.now();
    const onScroll = () => {
      if (hover) return;
      const y = window.scrollY;
      const t = Date.now();
      const vel = (ultY - y) / Math.max(1, t - ultT);
      if (vel > 2.4 && ultY > (document.documentElement.scrollHeight - window.innerHeight) * 0.3) abrir();
      ultY = y;
      ultT = t;
    };
    document.addEventListener("mouseout", onOut);
    document.addEventListener("touchstart", armar, { passive: true });
    document.addEventListener("pointerdown", armar, { passive: true });
    window.addEventListener("popstate", onPop);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("touchstart", armar);
      document.removeEventListener("pointerdown", armar);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return Quiz ? <Quiz onClose={() => setQuiz(null)} /> : null;
}
