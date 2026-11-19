import localFont from "next/font/local";

// Fontes das páginas de POP e do Raio-X no WP: Instrument Serif (títulos), Inter
// (texto, já carregada no layout) e JetBrains Mono (etiquetas). Auto-hospedadas
// (latin) e usadas só nessas páginas.
export const instrumentSerif = localFont({
  src: [
    { path: "../../public/fonts/InstrumentSerif-Regular-latin.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/InstrumentSerif-Italic-latin.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  variable: "--font-instrument-serif",
});

export const jetbrainsMono = localFont({
  src: "../../public/fonts/JetBrainsMono-latin.woff2",
  weight: "400 600",
  display: "swap",
  variable: "--font-jetbrains-mono",
  preload: false,
});

export const popFontClasses = `${instrumentSerif.variable} ${jetbrainsMono.variable}`;
