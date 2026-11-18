"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { contentLeadMagneticVsl as c } from "@/lib/content-lead-magnetic-vsl";

export default function ObrigadoLmvsl() {
  const [visible, setVisible] = useState(false);
  const [clicked, setClicked] = useState(false);
  const subscribePreview = () => () => {};
  const preview = useSyncExternalStore(
    subscribePreview,
    () => new URLSearchParams(window.location.search).get("preview") === "liberado",
    () => false
  );
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 150_000);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <section className="lv-obrigado-content">
      <div className="lv-obrigado-email">{c.obrigado.email}</div>
      <h1>{c.obrigado.title}</h1>
      {(visible || preview) && !clicked && (
        <button type="button" className="lv-obrigado-btn" onClick={() => setClicked(true)}>
          {c.obrigado.button}
        </button>
      )}
      {clicked && <p className="lv-obrigado-thanks" role="status">{c.obrigado.thanks}</p>}
    </section>
  );
}
