"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLoopCarousel } from "@/components/pizzaria/use-loop-carousel";
import { contentResultado, episodioCover } from "@/lib/content-resultado-pizzaria";

const { episodios } = contentResultado;
const items = episodios.items;
const covers = new Set(episodios.covers);

// Ícone do Instagram (o lucide-react 1.x não tem ícones de marca).
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M16.5 7.5v.01" />
    </svg>
  );
}

// Carrossel "Do zero aos 100 mil, filmamos tudo": os 15 episódios do WP, cada card
// é um link para o reel (nova aba). Mecânica do carrossel de depoimentos da
// /alphas-pizzaria (hook useLoopCarousel): autoplay de 5s deslizando, loop infinito,
// arraste, setas e pausa no hover. Um arraste nunca abre o reel: só o clique sem
// arrastar. O reveal fica num wrapper de className fixo e o estado do arraste vai
// em data-dragging, para o React não apagar a classe "visible" ao arrastar.
export default function EpisodiosCarousel() {
  const count = items.length;
  const { go, suppressClick, rootProps, wrapProps, trackProps } = useLoopCarousel({
    count,
    autoplayMs: episodios.autoplayMs,
  });
  const slides = [...items, ...items, ...items];

  return (
    <div role="region" aria-roledescription="carrossel" aria-label="Episódios da série da Alpha's Pizzaria" {...rootProps}>
      <div className="car-head">
        <div className="pz-section-head pz-reveal">
          <span className="pz-eyebrow">{episodios.eyebrow}</span>
          <h2>{episodios.title}</h2>
          <p>{episodios.sub}</p>
        </div>
        <div className="car-controls">
          <button type="button" className="car-btn" aria-label="Anterior" onClick={() => go(-1)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="car-btn" aria-label="Próximo" onClick={() => go(1)}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="pz-reveal r-1">
        <div className="car-track-wrap" {...wrapProps}>
          <div className="car-track" {...trackProps}>
            {slides.map((href, i) => {
              const real = i >= count && i < 2 * count;
              const n = (i % count) + 1;
              const cover = covers.has(`ep-${String(n).padStart(2, "0")}.webp`);
              return (
                <a
                  key={`${i}-${href}`}
                  href={href}
                  target="_blank"
                  rel="noopener"
                  className="car-slide"
                  data-clone={real ? undefined : "true"}
                  aria-hidden={!real}
                  inert={!real}
                  draggable={false}
                  aria-label={`Episódio ${n}, ${episodios.cardSub}: ${episodios.cardLabel} (abre em nova aba)`}
                  onClick={(e) => {
                    // O click que vem depois de um arraste não pode abrir o Instagram.
                    if (suppressClick.current) e.preventDefault();
                  }}
                >
                  <div className="car-media" data-cover={cover ? "true" : undefined}>
                    {cover ? (
                      <Image
                        src={episodioCover(n)}
                        alt=""
                        fill
                        sizes="280px"
                        draggable={false}
                        className="car-cover"
                      />
                    ) : (
                      <InstagramIcon className="car-ig" />
                    )}
                    <span className="car-label">{episodios.cardLabel}</span>
                  </div>
                  <div className="car-info">
                    <strong>Episódio {n}</strong>
                    <span>{episodios.cardSub}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
