"use client";

import Image from "next/image";
import { useState } from "react";

// Short do YouTube no formato do widget de vídeo da 00-lp (9:16, raio 12px).
// Só a capa até o clique: o player (youtube-nocookie) carrega ao tocar.
export default function ShortVideo01lp({ videoId, poster, title }: { videoId: string; poster: string; title: string }) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[12px] bg-black">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&playsinline=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Reproduzir: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <Image src={poster} alt="" fill sizes="(max-width: 767px) 92vw, 333px" className="object-cover" />
          <svg
            viewBox="0 0 68 48"
            width="68"
            height="48"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110"
          >
            <path
              d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26Z"
              fill="#f00"
            />
            <path d="M45 24 27 14v20" fill="#fff" />
          </svg>
        </button>
      )}
    </div>
  );
}
