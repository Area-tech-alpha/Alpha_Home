import localFont from "next/font/local";

// Fontes da 00-lp do WP (Elementor): Montserrat nos títulos e textos, Roboto na
// lista do hero e nos rótulos do form, Public Sans nos campos e no botão do form.
// Auto-hospedadas (variáveis, latin) e usadas só na /01-lp.
export const montserrat = localFont({
  src: "../../public/fonts/Montserrat-latin.woff2",
  weight: "400 800",
  display: "swap",
  variable: "--font-montserrat",
});

export const roboto = localFont({
  src: "../../public/fonts/Roboto-latin.woff2",
  weight: "400 600",
  display: "swap",
  variable: "--font-roboto",
  preload: false,
});

export const publicSans = localFont({
  src: "../../public/fonts/PublicSans-latin.woff2",
  weight: "400 500",
  display: "swap",
  variable: "--font-public-sans",
  preload: false,
});
