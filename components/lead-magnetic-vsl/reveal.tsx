"use client";

import { useEffect, useRef } from "react";

export default function LmvslReveal() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current?.parentElement;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>(".lmvsl-reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.dataset.visible = "true");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.dataset.visible = "true";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return <div ref={rootRef} aria-hidden="true" className="lmvsl-reveal-anchor" />;
}
