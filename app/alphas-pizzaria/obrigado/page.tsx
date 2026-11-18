import type { Metadata } from "next";
import { FooterPizzaria, GoldTitle, LogoLink } from "@/components/pizzaria/sections";
import VslGate from "@/components/pizzaria/vsl-gate";
import { contentPizzaria } from "@/lib/content-pizzaria";
import "../pizzaria.css";

const { obrigado } = contentPizzaria;

// Pós-envio: fora do Google (noindex aqui e disallow no robots.txt).
export const metadata: Metadata = {
  title: obrigado.meta.title,
  description: obrigado.meta.description,
  robots: { index: false, follow: false },
};

export default function AlphasPizzariaObrigado() {
  return (
    <div className="pizzaria pizzaria-obrigado">
      <div className="page-top">
        <LogoLink height={30} />
      </div>
      <main>
        <div className="container">
          <div className="head">
            <span className="pz-eyebrow">{obrigado.eyebrow}</span>
            <h1>
              <GoldTitle parts={obrigado.title} />
            </h1>
            <p>{obrigado.sub}</p>
          </div>
          <VslGate />
        </div>
      </main>
      <FooterPizzaria />
    </div>
  );
}
