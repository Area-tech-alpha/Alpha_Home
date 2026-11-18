import type { Metadata } from "next";
import BastidoresFx from "@/components/bastidores/fx";
import ObrigadoBastidores from "@/components/bastidores/obrigado";
import { MeshBackground } from "@/components/bastidores/sections";
import { contentBastidores } from "@/lib/content-bastidores-pizzaria";
import "../lead-magnetic-bastidores-alphas-pizzaria/bastidores.css";

const { obrigado } = contentBastidores;

// Pós-envio: fora do Google (noindex aqui e disallow no robots.txt). Esta página
// não envia lead: o envio é no submit da LP (CRM).
export const metadata: Metadata = {
  title: obrigado.meta.title,
  description: obrigado.meta.description,
  robots: { index: false, follow: false },
};

export default function ObrigadoLmBastidores() {
  return (
    <div className="bastidores bastidores-obrigado">
      <MeshBackground blobs={2} />
      <main className="page">
        <ObrigadoBastidores />
      </main>
      <BastidoresFx mode="obrigado" />
    </div>
  );
}
