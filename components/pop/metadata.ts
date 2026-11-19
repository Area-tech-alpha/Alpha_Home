import type { Metadata } from "next";
import type { PopContent } from "@/lib/content-pop";

// SEO igual ao WP: as páginas de POP têm noindex (meta robots da própria página no
// WP), ficam fora do sitemap e SEM disallow no robots.txt, para o Google ler o noindex.
export function popMetadata(c: PopContent): Metadata {
  const path = `/${c.slug}`;
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: { canonical: path },
    robots: { index: false, follow: true },
    openGraph: {
      title: c.meta.title,
      description: c.meta.description,
      url: path,
      type: "website",
      locale: "pt_BR",
      images: [{ url: c.meta.ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: c.meta.title, description: c.meta.description },
  };
}
