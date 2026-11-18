import type { Metadata } from "next";
import Image from "next/image";
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
      <footer className="lmvsl-footer">
        <Image src="/images/logo-alpha.png" alt="Assessoria Alpha" width={764} height={247} sizes="150px" />
        <span>{c.footer}</span>
      </footer>
      <LmvslReveal />
    </div>
  );
}
