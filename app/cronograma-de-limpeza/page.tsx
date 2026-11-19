import PopPage from "@/components/pop/pop-page";
import { popMetadata } from "@/components/pop/metadata";
import { contentCronogramaLimpeza } from "@/lib/content-cronograma-de-limpeza";
import "@/components/pop/pop.css";

export const metadata = popMetadata(contentCronogramaLimpeza);

export default function CronogramaDeLimpezaPage() {
  return <PopPage c={contentCronogramaLimpeza} />;
}
