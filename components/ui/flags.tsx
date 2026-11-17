import type { ReactNode } from "react";
import FlagBR from "@/components/ui/flag-br";

// Bandeiras simplificadas (SVG inline, 3:2) dos DDIs do form, sem CDN externo.
// Só o phone-field (carregado sob demanda) importa este arquivo.
type FlagCountry = "BR" | "PT" | "US" | "AR" | "PY" | "UY" | "CL" | "MX" | "CO" | "ES";

const US_STRIPES = Array.from({ length: 7 }, (_, k) => `M0 ${(k * 40) / 13}h30v${20 / 13}H0z`).join("");

const SHAPES: Record<Exclude<FlagCountry, "BR">, ReactNode> = {
  PT: (
    <>
      <rect width="30" height="20" fill="#da291c" />
      <rect width="12" height="20" fill="#046a38" />
      <circle cx="12" cy="10" r="3.4" fill="#ffe900" />
      <circle cx="12" cy="10" r="2.2" fill="#da291c" />
      <rect x="11" y="8.8" width="2" height="2.4" fill="#fff" />
    </>
  ),
  US: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <path d={US_STRIPES} fill="#b22234" />
      <rect width="12" height={140 / 13} fill="#3c3b6e" />
    </>
  ),
  AR: (
    <>
      <rect width="30" height="20" fill="#74acdf" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <circle cx="15" cy="10" r="1.8" fill="#f6b40e" />
    </>
  ),
  PY: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6.67" fill="#d52b1e" />
      <rect y="13.33" width="30" height="6.67" fill="#0038a8" />
      <circle cx="15" cy="10" r="1.8" fill="none" stroke="#0038a8" strokeWidth=".5" />
    </>
  ),
  UY: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <path d="M0 2.22h30v2.22H0zm0 4.45h30v2.22H0zm0 4.44h30v2.22H0zm0 4.45h30v2.22H0z" fill="#0038a8" />
      <rect width="11.1" height="11.1" fill="#fff" />
      <circle cx="5.55" cy="5.55" r="2.6" fill="#fcd116" />
    </>
  ),
  CL: (
    <>
      <rect width="30" height="20" fill="#d52b1e" />
      <rect width="30" height="10" fill="#fff" />
      <rect width="10" height="10" fill="#0039a6" />
      <polygon points="5,2.4 5.62,4.15 7.47,4.2 6,5.32 6.53,7.1 5,6.05 3.47,7.1 4,5.32 2.53,4.2 4.38,4.15" fill="#fff" />
    </>
  ),
  MX: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="10" height="20" fill="#006847" />
      <rect x="20" width="10" height="20" fill="#ce1126" />
      <circle cx="15" cy="10" r="2.2" fill="#8c5a2b" />
    </>
  ),
  CO: (
    <>
      <rect width="30" height="20" fill="#ce1126" />
      <rect width="30" height="15" fill="#003893" />
      <rect width="30" height="10" fill="#fcd116" />
    </>
  ),
  ES: (
    <>
      <rect width="30" height="20" fill="#aa151b" />
      <rect y="5" width="30" height="10" fill="#f1bf00" />
      <rect x="7" y="7.5" width="3" height="5" rx=".6" fill="#aa151b" />
    </>
  ),
};

export default function Flag({ country, className = "" }: { country?: string; className?: string }) {
  if (country === "BR") return <FlagBR className={className} />;
  const shape = country ? SHAPES[country as Exclude<FlagCountry, "BR">] : undefined;
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true" focusable="false">
      {shape ?? (
        // DDI fora da lista: globo neutro.
        <>
          <rect width="30" height="20" fill="#2a2a2e" />
          <circle cx="15" cy="10" r="6" fill="none" stroke="#a3a2a9" strokeWidth="1" />
          <path d="M9 10h12M15 4c-2.5 3.5-2.5 8.5 0 12M15 4c2.5 3.5 2.5 8.5 0 12" fill="none" stroke="#a3a2a9" strokeWidth=".8" />
        </>
      )}
    </svg>
  );
}
