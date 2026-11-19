import PopPage from "@/components/pop/pop-page";
import { popMetadata } from "@/components/pop/metadata";
import { contentPopProducao } from "@/lib/content-pop-producao";
import "@/components/pop/pop.css";

export const metadata = popMetadata(contentPopProducao);

export default function PopProducaoPage() {
  return <PopPage c={contentPopProducao} />;
}
