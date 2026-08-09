"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ListingImage } from "@/components/ListingImage";
import { cn } from "@/lib/utils";

export function ListingGallery({
  images,
  title,
  category,
}: {
  images: { url: string; alt: string | null }[];
  title: string;
  category: string;
}) {
  const [index, setIndex] = useState(0);
  const list = images.length > 0 ? images : [{ url: "", alt: title }];
  const current = list[Math.min(index, list.length - 1)]!;

  const step = (delta: number) =>
    setIndex((i) => (i + delta + list.length) % list.length);

  return (
    <div className="space-y-3">
      <div className="group relative aspect-4/3 overflow-hidden rounded-xl border border-sand-deep/70 bg-sand/40">
        <ListingImage
          url={current.url || undefined}
          alt={current.alt ?? title}
          category={category}
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
        />

        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Imagem anterior"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-sand-deep bg-canvas/90 text-bark opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Próxima imagem"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-sand-deep bg-canvas/90 text-bark opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1 text-[0.6875rem] text-linen backdrop-blur-sm">
              {index + 1} / {list.length}
            </div>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-6">
          {list.map((image, i) => (
            <button
              key={`${image.url}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border transition-all duration-300",
                i === index
                  ? "border-brass ring-2 ring-brass/25"
                  : "border-sand-deep/70 opacity-70 hover:opacity-100",
              )}
            >
              <ListingImage
                url={image.url || undefined}
                alt=""
                category={category}
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
