"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

// Vídeo horizontal do YouTube no modo "lite": poster local (nunca hotlink) e o
// iframe só entra depois do clique.
export default function YoutubeVideo({ videoId, title, poster }: { videoId: string; title: string; poster: string }) {
  const [active, setActive] = useState(false);

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-[22px] border border-border bg-bg-1">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Reproduzir vídeo: ${title}`}
          className="absolute inset-0 h-full w-full cursor-pointer"
        >
          <Image
            src={poster}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span
            className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold-1 shadow-[0_10px_40px_rgba(255,183,3,.45)] transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            <Play className="ml-1 h-6 w-6 text-ink" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
