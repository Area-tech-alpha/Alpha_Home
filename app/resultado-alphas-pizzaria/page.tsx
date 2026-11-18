import type { Metadata } from "next";
import { FloatCtaPizzaria, RevealPizzaria } from "@/components/pizzaria/interactions";
import {
  CtaFinalResultado,
  EntregaveisResultado,
  EpisodiosResultado,
  FaqResultado,
  FooterResultado,
  HeroResultado,
} from "@/components/pizzaria/sections-resultado";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { contentResultado } from "@/lib/content-resultado-pizzaria";
import { IS_PRODUCTION_SITE } from "@/lib/site";
import "../alphas-pizzaria/pizzaria.css";
import "./resultado.css";

const { meta, floatCta } = contentResultado;
const og = contentPizzaria.hero.background;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/resultado-alphas-pizzaria" },
  // Indexável só no domínio final (mesma regra da /01-lp e da /alphas-pizzaria).
  robots: IS_PRODUCTION_SITE ? undefined : { index: false, follow: false },
  openGraph: {
    title: meta.title,
    description: meta.description,
    locale: "pt_BR",
    type: "website",
    url: "/resultado-alphas-pizzaria",
    images: [{ url: og.src, width: og.width, height: og.height }],
  },
  twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
};

export default function ResultadoAlphasPizzaria() {
  return (
    <div className="pizzaria pizzaria-resultado">
      <main>
        <HeroResultado />
        <EpisodiosResultado />
        <EntregaveisResultado />
        <FaqResultado />
        <CtaFinalResultado />
      </main>
      <FooterResultado />
      <FloatCtaPizzaria label={floatCta} />
      <RevealPizzaria />
    </div>
  );
}
