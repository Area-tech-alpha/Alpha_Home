"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// Animação do logo do Método (5 s em loop, sem áudio). Não baixa nada até
// entrar na tela (preload="none"), pausa fora dela e, com prefers-reduced-motion,
// fica só no poster. O poster é uma imagem lazy por baixo do vídeo (o atributo
// poster do <video> baixaria a imagem já no carregamento da página).
export default function MetodoVideo({
  src,
  poster,
  width,
  height,
}: {
  src: string;
  poster: string;
  width: number;
  height: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Image src={poster} alt="" fill sizes="(max-width: 900px) 92vw, 860px" className="object-cover" />
      <video
        ref={ref}
        src={src}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </>
  );
}
