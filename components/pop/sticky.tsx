"use client";

import { useEffect, useState, type ReactNode } from "react";

// Botão fixo no rodapé do celular (como no WP): aparece depois que o elemento
// `targetId` sobe para fora da tela. No desktop o CSS esconde.
export default function PopSticky({ targetId, children }: { targetId: string; children: ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setOn(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(target);
    return () => io.disconnect();
  }, [targetId]);
  return (
    <div className="tz-sticky" data-on={on ? "true" : undefined} inert={!on}>
      {children}
    </div>
  );
}
