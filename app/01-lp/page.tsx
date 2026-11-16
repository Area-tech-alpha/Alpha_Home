import type { Metadata } from "next";
import Footer01lp from "@/components/lp01/footer-01lp";
import { Depoimentos, Faq, Hero, Metodo, Planos, QuemSomos, Servicos, Time } from "@/components/lp01/sections";
import { content01lp } from "@/lib/content-01-lp";
import { IS_PRODUCTION_SITE } from "@/lib/site";

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
    <>
      <main>
        <Hero />
        <Depoimentos />
        <QuemSomos />
        <Metodo />
        <Servicos />
        <Planos />
        <Time />
        <Faq />
      </main>
      <Footer01lp />
    </>
  );
}
