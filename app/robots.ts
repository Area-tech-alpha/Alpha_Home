import type { MetadataRoute } from "next";
import { IS_PRODUCTION_SITE, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_SITE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Pós-envio: /obrigado (home), /obrigado-a, -b, -c e /agradecimento (/01-lp)
      // /alphas-pizzaria/obrigado, /obrigado-lm-bastidores-alphas-pizzaria, /obrigado-lm-vsl
      // e /raio-x-do-restaurante (obrigado das LPs de POP). As LPs de POP são noindex
      // (igual ao WP) e não entram aqui, para o Google ler o noindex.
      disallow: [
        "/obrigado",
        "/obrigado-a",
        "/obrigado-b",
        "/obrigado-c",
        "/agradecimento",
        "/alphas-pizzaria/obrigado",
        "/obrigado-lm-bastidores-alphas-pizzaria",
        "/obrigado-lm-vsl",
        "/raio-x-do-restaurante",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
