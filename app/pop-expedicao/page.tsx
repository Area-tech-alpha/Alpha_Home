import PopPage from "@/components/pop/pop-page";
import { popMetadata } from "@/components/pop/metadata";
import { contentPopExpedicao } from "@/lib/content-pop-expedicao";
import "@/components/pop/pop.css";

export const metadata = popMetadata(contentPopExpedicao);

export default function PopExpedicaoPage() {
  return <PopPage c={contentPopExpedicao} />;
}
