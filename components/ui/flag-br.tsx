// Bandeira do Brasil em SVG inline (3:2). Fica separada das demais porque é a
// única usada antes do seletor de DDI carregar (campo de telefone "falso").
// SVG em vez de emoji: no Windows o emoji de bandeira vira as letras "BR".
export default function FlagBR({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#009c3b" />
      <path d="M15 2 28 10 15 18 2 10z" fill="#ffdf00" />
      <circle cx="15" cy="10" r="4.6" fill="#002776" />
      <path d="M10.6 9.1c3-.9 6.3-.4 8.9 1.3" fill="none" stroke="#fff" strokeWidth=".8" />
    </svg>
  );
}
