// Ícones das LPs de POP e do Raio-X: os mesmos SVGs (traço) do WP.
const PATHS = {
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  lock: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  play: <polygon points="6 3 20 12 6 21 6 3" />,
};

export type IconName = keyof typeof PATHS;

export function Ic({ name, className, label }: { name: IconName; className?: string; label?: string }) {
  return (
    <svg
      className={className ? `tz-ic ${className}` : "tz-ic"}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {PATHS[name]}
    </svg>
  );
}
