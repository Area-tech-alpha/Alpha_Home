import type { Metadata } from "next";
import RaioXPage from "@/components/pop/raio-x-page";
import { contentRaioX, raioXVariacao } from "@/lib/content-raio-x";
import "@/components/pop/pop.css";

// Obrigado das LPs de POP (mesma rota do WP). Não envia lead: o lead já foi ao CRM
// no envio do form. noindex + disallow no robots.txt.
export const metadata: Metadata = {
  title: contentRaioX.meta.title,
  description: contentRaioX.meta.description,
  robots: { index: false, follow: false },
};

export default async function RaioXDoRestaurantePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // ?isca= (vindo das LPs daqui) ou utm_campaign, como o WP.
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return <RaioXPage v={raioXVariacao(pick(sp.isca) ?? pick(sp.utm_campaign))} />;
}
