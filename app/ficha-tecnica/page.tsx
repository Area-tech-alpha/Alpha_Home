import PopPage from "@/components/pop/pop-page";
import { popMetadata } from "@/components/pop/metadata";
import { contentFichaTecnica } from "@/lib/content-ficha-tecnica";
import "@/components/pop/pop.css";

export const metadata = popMetadata(contentFichaTecnica);

export default function FichaTecnicaPage() {
  return <PopPage c={contentFichaTecnica} />;
}
