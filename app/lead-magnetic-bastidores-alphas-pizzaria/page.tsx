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
import "./bastidores.css";

const { meta } = contentBastidores;
const og = contentPizzaria.hero.background;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: BASTIDORES_PATH },
  // noindex,nofollow em qualquer domínio, igual ao WP (lead magnet de campanha).
  // Fica fora do sitemap e SEM disallow no robots.txt, para o Google ler o noindex.
  robots: { index: false, follow: false },
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
