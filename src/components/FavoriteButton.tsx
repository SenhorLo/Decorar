"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { toggleFavoriteAction } from "@/actions/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  listingId,
  initial,
  size = "sm",
  withLabel = false,
}: {
  listingId: string;
  initial: boolean;
  size?: "sm" | "lg";
  withLabel?: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initial);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    // Atualização otimista — revertida se o servidor recusar.
    const next = !favorited;
    setFavorited(next);

    startTransition(async () => {
      const result = await toggleFavoriteAction(listingId);

      if (!result.ok) {
        setFavorited(!next);
        if (result.reason === "unauthenticated") {
          router.push(`/login?next=${encodeURIComponent(`/anuncios/${listingId}`)}`);
        }
        return;
      }

      setFavorited(result.favorited);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-sand-deep/70 bg-canvas/92 text-bark backdrop-blur-sm",
        "transition-all duration-300 hover:border-clay hover:text-clay active:scale-95 disabled:opacity-60",
        size === "lg" ? "h-11 px-5 text-sm" : "h-9 w-9 justify-center",
        withLabel && "w-auto px-5",
        favorited && "border-clay/40 text-clay",
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform duration-300",
          favorited && "scale-110 fill-current",
        )}
        aria-hidden="true"
      />
      {withLabel && <span>{favorited ? "Salvo" : "Salvar"}</span>}
    </button>
  );
}
