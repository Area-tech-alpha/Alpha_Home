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
      // Pós-envio: /obrigado (home), /obrigado-a, -b, -c e /agradecimento (/01-lp).
      disallow: ["/obrigado", "/obrigado-a", "/obrigado-b", "/obrigado-c", "/agradecimento"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
