import type { Metadata } from "next";
import { FloatCtaPizzaria, RevealPizzaria } from "@/components/pizzaria/interactions";
import { DepoimentosPizzaria, FaqPizzaria, FooterPizzaria, HeroPizzaria } from "@/components/pizzaria/sections";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { IS_PRODUCTION_SITE } from "@/lib/site";
import "./pizzaria.css";

const { meta, hero } = contentPizzaria;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/alphas-pizzaria" },
  // Indexável só no domínio final (mesma regra da /01-lp).
  robots: IS_PRODUCTION_SITE ? undefined : { index: false, follow: false },
  openGraph: {
    title: meta.title,
    description: meta.description,
    locale: "pt_BR",
    type: "website",
    url: "/alphas-pizzaria",
    images: [{ url: hero.background.src, width: hero.background.width, height: hero.background.height }],
  },
  twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
};

export default function AlphasPizzaria() {
  return (
    <div className="pizzaria">
      <main>
        <HeroPizzaria />
        <DepoimentosPizzaria />
        <FaqPizzaria />
      </main>
      <FooterPizzaria />
      <FloatCtaPizzaria />
      <RevealPizzaria />
    </div>
  );
}
