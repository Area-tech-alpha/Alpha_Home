import PopPage from "@/components/pop/pop-page";
import { popMetadata } from "@/components/pop/metadata";
import { contentPopDelivery } from "@/lib/content-pop-delivery";
import "@/components/pop/pop.css";

export const metadata = popMetadata(contentPopDelivery);

export default function PopDeliveryPage() {
  return <PopPage c={contentPopDelivery} />;
}
