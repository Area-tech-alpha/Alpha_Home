"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckCircle2, MailCheck } from "lucide-react";
import { BASTIDORES_STORAGE_KEY, contentBastidores } from "@/lib/content-bastidores-pizzaria";

const { obrigado } = contentBastidores;

// Primeiro nome que a LP deixou no sessionStorage ("" se não houver). No servidor é
// sempre "" (useSyncExternalStore), então o HTML hidrata igual e o nome entra depois.
const subscribe = () => () => {};
function readNome(): string {
  try {
    const raw = sessionStorage.getItem(BASTIDORES_STORAGE_KEY);
    return raw ? String(JSON.parse(raw)?.nome ?? "").trim().split(/\s+/)[0] : "";
  } catch {
    // Sem storage ou valor inválido: fica o aviso sem o nome.
    return "";
  }
}

// Obrigado da LP de bastidores. Esta página NÃO envia lead: o envio foi feito ao CRM
// no submit da LP. O botão só mostra a mensagem de agradecimento, como no WP depois
// do disparo do webhook (que aqui não existe mais).
//
// A LP deixa o primeiro nome no sessionStorage; se ele existir, o aviso do e-mail
// o usa ("Mandamos o material pro seu e-mail, Ana!"), como no WP.
export default function ObrigadoBastidores() {
  const nome = useSyncExternalStore(subscribe, readNome, () => "");
  const [clicou, setClicou] = useState(false);

  return (
    <section id="vsl">
      <div className="bs-container">
        <div className="email-notice bs-reveal" id="emailNotice">
          <MailCheck aria-hidden="true" />
          <span>{nome ? obrigado.emailNoticeNome.replace("{nome}", nome) : obrigado.emailNotice}</span>
        </div>
        <h1 className="bs-reveal r-1">{obrigado.title}</h1>
        <p className="sub bs-reveal r-2">{obrigado.sub}</p>
        <div className="cta-gate bs-reveal r-2">
          {clicou ? (
            <div className="thanks-msg" role="status">
              <CheckCircle2 aria-hidden="true" />
              <span>{obrigado.thanks}</span>
            </div>
          ) : (
            <button type="button" className="bs-btn bs-btn-primary" onClick={() => setClicou(true)}>
              {obrigado.button}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
