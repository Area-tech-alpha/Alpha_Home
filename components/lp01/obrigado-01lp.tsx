import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { currentYearText } from "@/components/lp01/footer-01lp";
import YoutubeVideo from "@/components/ui/youtube-video";
import { content01lp as c } from "@/lib/content-01-lp";

// Páginas pós-envio da /01-lp (/obrigado-a, -b, -c e /agradecimento): fora do Google.
export const obrigadoMetadata: Metadata = {
  title: "Obrigado! - Assessoria Alpha",
  robots: { index: false, follow: false },
};

// variant "qualificado": texto + vídeo (obrigado-a/b/c, iguais no WP).
// variant "desqualificado": só título e botão (/agradecimento, texto provisório).
export default function Obrigado01lp({ variant }: { variant: "qualificado" | "desqualificado" }) {
  const { logo, obrigado, agradecimento } = c;
  const head = variant === "qualificado" ? obrigado : agradecimento;

  return (
    <>
      <main className="flex min-h-svh flex-col items-center justify-center px-[6%] py-10 text-center">
        <div className="w-full max-w-[720px]">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            priority
            sizes="130px"
            className="mx-auto mb-6 h-[40px] w-auto object-contain"
          />
          <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] leading-[1.1] font-semibold">
            {head.title} <span className="gold-text">{head.titleHighlight}</span>
          </h1>

          {variant === "qualificado" && (
            <>
              <p className="mx-auto mt-5 max-w-[620px] text-[15px] leading-[1.65] font-light text-text-muted md:text-[16px]">
                {obrigado.text}
              </p>
              <div className="mx-auto mt-7 max-w-[min(720px,calc((100svh-420px)*1.78))] min-w-[min(100%,300px)]">
                <YoutubeVideo videoId={obrigado.video.id} title={obrigado.video.title} poster={obrigado.video.poster} />
              </div>
            </>
          )}

          <Link href={obrigado.back.href} className="btn btn-primary mt-8">
            {obrigado.back.label}
          </Link>
        </div>
      </main>
      <footer className="border-t border-border py-6 text-center">
        <p className="text-[12.5px] font-light text-text-dim">{currentYearText(obrigado.copyright)}</p>
      </footer>
    </>
  );
}
