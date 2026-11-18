import type { MetadataRoute } from "next";
import { IS_PRODUCTION_SITE, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/depoimentos`, changeFrequency: "monthly", priority: 0.6 },
    // /01-lp, /alphas-pizzaria e /resultado-alphas-pizzaria só entram quando são indexáveis (domínio final),
    // mesma regra do noindex delas.
    ...(IS_PRODUCTION_SITE
      ? [
          { url: `${SITE_URL}/01-lp`, changeFrequency: "monthly" as const, priority: 0.7 },
          { url: `${SITE_URL}/alphas-pizzaria`, changeFrequency: "monthly" as const, priority: 0.7 },
          { url: `${SITE_URL}/resultado-alphas-pizzaria`, changeFrequency: "monthly" as const, priority: 0.7 },
        ]
      : []),
  ];
}
