import type { Metadata } from "next";
import PaginaNds from "@/components/nao-dependa-de-sorte/pagina";
import { contentNds as c, NDS_PATH } from "@/lib/content-nao-dependa-de-sorte";
import { IS_PRODUCTION_SITE } from "@/lib/site";
import "@/components/nao-dependa-de-sorte/nds.css";

// Migração da /nao-dependa-de-sorte/ do WP (ID 14248). SEO com a regra da /01-lp:
// indexável só no domínio final (e só então no sitemap); o WP não tem noindex.
export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: NDS_PATH },
  robots: IS_PRODUCTION_SITE ? undefined : { index: false, follow: false },
  openGraph: {
    title: c.meta.title,
    description: c.meta.ogDescription,
    url: NDS_PATH,
    type: "website",
    locale: "pt_BR",
  },
};

export default function NaoDependaDeSortePage() {
  return <PaginaNds />;
}
