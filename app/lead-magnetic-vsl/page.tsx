import type { Metadata } from "next";
import { IS_PRODUCTION_SITE } from "@/lib/site";
import { contentLeadMagneticVsl as c, LMVSL_PATH } from "@/lib/content-lead-magnetic-vsl";
import LmvslReveal from "@/components/lead-magnetic-vsl/reveal";
import { AprenderLmvsl, FinalLmvsl, HeroLmvsl, ProblemaLmvsl, ResultadosLmvsl } from "@/components/lead-magnetic-vsl/sections";
import "./lmvsl.css";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: LMVSL_PATH },
  robots: IS_PRODUCTION_SITE
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function LeadMagneticVslPage() {
  return (
    <div className="lmvsl">
      <main>
        <HeroLmvsl />
        <ProblemaLmvsl />
        <ResultadosLmvsl />
        <AprenderLmvsl />
        <FinalLmvsl />
      </main>
      <LmvslReveal />
    </div>
  );
}
