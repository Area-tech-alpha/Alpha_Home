import type { Metadata } from "next";
import BastidoresFx from "@/components/bastidores/fx";
import {
  CaseBastidores,
  HeroBastidores,
  MeshBackground,
  ParadaBastidores,
  ProblemaBastidores,
} from "@/components/bastidores/sections";
import { BASTIDORES_PATH, contentBastidores } from "@/lib/content-bastidores-pizzaria";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { IS_PRODUCTION_SITE } from "@/lib/site";
import "./bastidores.css";

const { meta } = contentBastidores;
const og = contentPizzaria.hero.background;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: BASTIDORES_PATH },
  // Indexável só no domínio final (mesma regra das outras LPs). O WP tem
  // noindex,nofollow nesta página: ver Pendências no README.
  robots: IS_PRODUCTION_SITE ? undefined : { index: false, follow: false },
  openGraph: {
    title: meta.title,
    description: meta.description,
    locale: "pt_BR",
    type: "website",
    url: BASTIDORES_PATH,
    images: [{ url: og.src, width: og.width, height: og.height }],
  },
  twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
};

export default function LeadMagneticBastidores() {
  return (
    <div className="bastidores">
      <MeshBackground />
      <div className="page">
        <main>
          <HeroBastidores />
          <ProblemaBastidores />
          <ParadaBastidores />
          <CaseBastidores />
        </main>
      </div>
      <BastidoresFx mode="lp" />
    </div>
  );
}
