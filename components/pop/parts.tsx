import Image from "next/image";
import { popShared as s, type PopTitle } from "@/lib/content-pop";

// Peças comuns às LPs de POP e ao Raio-X (sem JS de cliente).

const LOGO = { src: "/images/logo-alpha.png", width: 764, height: 247 };

export function Title({ t }: { t: PopTitle }) {
  return (
    <>
      {t[0]}
      <span className="tz-hl">{t[1]}</span>
      {t[2]}
    </>
  );
}

export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      className={className}
      src={LOGO.src}
      alt="Alpha Assessoria"
      width={LOGO.width}
      height={LOGO.height}
      sizes="100px"
      priority={priority}
    />
  );
}

export function Autor() {
  const { autor } = s;
  return (
    <figure className="tz-autor">
      <div className="tz-autor-foto">
        <Image src={autor.foto.src} alt={autor.foto.alt} width={autor.foto.width} height={autor.foto.height} sizes="(min-width: 900px) 460px, 90vw" />
        <span className="tz-pizzaria-badge">
          <Image src={autor.badge.src} alt={autor.badge.alt} width={64} height={64} />
        </span>
      </div>
      <figcaption className="tz-autor-cap">
        <b>{autor.nome}</b>
        <span>
          {autor.cargo[0]}
          <br />
          {autor.cargo[1]}
        </span>
      </figcaption>
    </figure>
  );
}
