// Para onde a /01-lp leva a pessoa depois do envio ao CRM. Regra de pós-envio da
// 00-lp do WP (script inline, ramo pageId 3445), literal:
//   faturamento "Até 30 mil" + investiria "Não"   -> /agradecimento (desqualificado)
//   faixa A (100 mil até 150 mil ... Mais de 1 mi) -> /obrigado-a
//   faixa B (50 mil até 80 mil)                    -> /obrigado-b
//   faixa C (30 mil até 50 mil) ou "Até 30 mil"    -> /obrigado-c
//   resto (só "80 mil até 100 mil")                -> /obrigado no WP
// A faixa "80 mil até 100 mil" ficou de fora no WP (pendência pro Max). Aqui a
// /obrigado é a página da home, então essa faixa NAVEGA para /obrigado-a.
// O destino do lead no CRM não depende disso: ele segue resolverDestino (lib/crm.ts).
const FAIXA_A = [
  "100 mil até 150 mil",
  "150 mil até 250 mil",
  "250 mil até 400 mil",
  "400 mil até 600 mil",
  "600 mil até 1 milhão",
  "Mais de 1 milhão",
];
const FAIXA_B = ["50 mil até 80 mil"];
const FAIXA_C = ["30 mil até 50 mil"];

export type Rota01lp = { slug: string };

export function rotear01lp(faturamento: string, investiria?: "Sim" | "Não"): Rota01lp {
  if (faturamento === "Até 30 mil" && investiria === "Não") return { slug: "agradecimento" };
  if (FAIXA_A.includes(faturamento)) return { slug: "obrigado-a" };
  if (FAIXA_B.includes(faturamento)) return { slug: "obrigado-b" };
  if (FAIXA_C.includes(faturamento) || faturamento === "Até 30 mil") return { slug: "obrigado-c" };
  return { slug: "obrigado-a" };
}
