"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Parallax leve por camadas.
 *
 * Procura descendentes com `data-depth` e aplica translateY proporcional ao
 * quanto o container avançou pela viewport. Toda leitura de layout acontece
 * uma vez por frame dentro de requestAnimationFrame e só escrevemos em
 * `transform` — nenhuma propriedade que dispare reflow.
 */
export function Parallax({
  children,
  strength = 42,
  className,
}: {
  children: ReactNode;
  /** Deslocamento máximo em px para uma camada com depth = 1. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = Array.from(
      container.querySelectorAll<SVGGElement | HTMLElement>("[data-depth]"),
    );
    if (layers.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      const viewport = window.innerHeight || 1;

      // -1 (abaixo da tela) .. 1 (acima da tela)
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      const clamped = Math.max(-1.2, Math.min(1.2, progress));

      for (const layer of layers) {
        const depth = Number(layer.dataset.depth ?? 0);
        layer.style.transform = `translate3d(0, ${(clamped * depth * strength).toFixed(2)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
