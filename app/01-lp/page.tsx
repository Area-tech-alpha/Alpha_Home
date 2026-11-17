import type { Metadata } from "next";
import { montserrat, publicSans, roboto } from "@/components/lp01/fonts";
import Footer01lp from "@/components/lp01/footer-01lp";
import Reveal01lp from "@/components/lp01/reveal";
import { Depoimentos, Faixas, Faq, Hero, Metodo, Planos, QuemSomos, Servicos, Time } from "@/components/lp01/sections";
import { content01lp } from "@/lib/content-01-lp";
import { IS_PRODUCTION_SITE } from "@/lib/site";
import "./lp01.css";

const { meta } = content01lp;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/01-lp" },
  robots: IS_PRODUCTION_SITE ? undefined : { index: false, follow: false },
  openGraph: {
    title: meta.title,
    description: meta.description,
    locale: "pt_BR",
    type: "website",
    url: "/01-lp",
    images: [{ url: meta.ogImage.src, width: meta.ogImage.width, height: meta.ogImage.height }],
  },
  twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
};

export default function Lp01() {
  return (
    <div className={`lp01 ${montserrat.variable} ${roboto.variable} ${publicSans.variable}`}>
      <main>
        <Hero />
        <Faixas />
        <Depoimentos />
        <QuemSomos />
        <Metodo />
        <Servicos />
        <Planos />
        <Time />
        <Faq />
      </main>
      <Footer01lp />
      <Reveal01lp />
    </div>
  );
}
