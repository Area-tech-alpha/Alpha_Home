import type { Metadata } from "next";
import RaioXPage from "@/components/pop/raio-x-page";
import { contentRaioX } from "@/lib/content-raio-x";
import "@/components/pop/pop.css";

// Obrigado das LPs de isca (mesma rota do WP). Página estática: o texto da isca é
// escolhido no navegador. O lead já foi ao CRM no envio do form; aqui só o aceite do
// Raio-X vai ao CRM (food/raio-x). noindex + disallow no robots.txt.
export const metadata: Metadata = {
  title: contentRaioX.meta.title,
  description: contentRaioX.meta.description,
  robots: { index: false, follow: false },
};

export default function RaioXDoRestaurantePage() {
  return <RaioXPage />;
}
