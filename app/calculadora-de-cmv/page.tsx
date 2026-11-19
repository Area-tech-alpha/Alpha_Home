import PopPage from "@/components/pop/pop-page";
import { Contador } from "@/components/pop/calculadora-client";
import { LinhaDoTempo, SecaoMiniCalc, SecaoNumeros } from "@/components/pop/calculadora";
import { popMetadata } from "@/components/pop/metadata";
import { contentCalculadoraCmv as c } from "@/lib/content-calculadora-de-cmv";
import "@/components/pop/pop.css";

export const metadata = popMetadata(c);

export default function CalculadoraDeCmvPage() {
  return (
    <PopPage
      c={c}
      slots={{
        depoisDoHero: <SecaoMiniCalc />,
        depoisDaComanda: <Contador />,
        secaoMuda: <SecaoNumeros />,
        depoisDosNumeros: <LinhaDoTempo />,
      }}
    />
  );
}
