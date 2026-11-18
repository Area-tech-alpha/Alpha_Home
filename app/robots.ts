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
      // /alphas-pizzaria/obrigado e /obrigado-lm-bastidores-alphas-pizzaria.
      disallow: [
        "/obrigado",
        "/obrigado-a",
        "/obrigado-b",
        "/obrigado-c",
        "/agradecimento",
        "/alphas-pizzaria/obrigado",
        "/obrigado-lm-bastidores-alphas-pizzaria",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
