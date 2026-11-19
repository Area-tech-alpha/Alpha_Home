import PopPage from "@/components/pop/pop-page";
import { Anel, BlocoCardapio, CelularCardapio, FachadaAlphas } from "@/components/pop/cardapio";
import { popMetadata } from "@/components/pop/metadata";
import { contentCardapioQueVende as c } from "@/lib/content-cardapio-que-vende";
import "@/components/pop/pop.css";

export const metadata = popMetadata(c);

export default function CardapioQueVendePage() {
  return (
    <PopPage
      c={c}
      slots={{
        depoisDoHero: <CelularCardapio />,
        antesDaComanda: <Anel />,
        blocoEmail: <BlocoCardapio cta={c.cta} extras={c.email.extras} />,
        figuraAutor: <FachadaAlphas />,
      }}
    />
  );
}
