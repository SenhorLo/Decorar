import Link from "next/link";
import { MapPin, Truck } from "lucide-react";

import { ListingImage } from "@/components/ListingImage";
import { Badge } from "@/components/ui/form";
import { FavoriteButton } from "@/components/FavoriteButton";
import { conditionLabel } from "@/lib/taxonomy";
import type { ListingCardData } from "@/lib/listings";
import { cn, discountPercent, formatBRL } from "@/lib/utils";

/**
 * Card da vitrine.
 *
 * Altura uniforme: o card é uma coluna flex `h-full` e cada bloco de conteúdo
 * tem espaço reservado — título com duas linhas fixas, linha do preço original
 * sempre presente (vazia quando não há desconto) e rodapé empurrado com
 * `mt-auto`. Assim a grade fica alinhada independente do texto de cada peça.
 */
export function ListingCard({
  listing,
  favorited = false,
  canFavorite = true,
  priority = false,
  className,
}: {
  listing: ListingCardData;
  favorited?: boolean;
  canFavorite?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const discount = discountPercent(listing.priceCents, listing.originalPriceCents);
  const sellerLabel = listing.seller.store?.name ?? listing.seller.name;

  return (
    <article
      className={cn(
        "card-hover group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-sand-deep/70 bg-canvas",
        // O link do título cobre o card inteiro via ::after; sem isto o foco
        // por teclado ficaria invisível, já que o alvo real é o pseudo-elemento.
        "focus-within:ring-2 focus-within:ring-brass/40 focus-within:ring-offset-2 focus-within:ring-offset-linen",
        className,
      )}
    >
      <div className="relative aspect-4/3 shrink-0 overflow-hidden bg-sand/40">
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]">
          <ListingImage
            url={listing.images[0]?.url}
            alt={listing.images[0]?.alt ?? listing.title}
            category={listing.category}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col items-start gap-1.5">
            {discount && (
              <Badge tone="clay" className="bg-clay text-white">
                −{discount}%
              </Badge>
            )}
            {listing.condition !== "USADO" && (
              <Badge tone="neutral" className="bg-canvas/92 backdrop-blur-sm">
                {conditionLabel(listing.condition)}
              </Badge>
            )}
          </div>

          {canFavorite && (
            <div className="pointer-events-auto">
              <FavoriteButton listingId={listing.id} initial={favorited} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-[0.6875rem] uppercase tracking-[0.1em] text-dusk">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {listing.city}, {listing.state}
          </span>
          {listing.deliveryAvailable && (
            <>
              <span aria-hidden="true">·</span>
              <Truck className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="shrink-0">Entrega</span>
            </>
          )}
        </div>

        {/* Duas linhas reservadas — títulos curtos não encolhem o card. */}
        <h3 className="mt-2.5 line-clamp-2 min-h-[2.9rem] font-display text-[1.0625rem] leading-snug text-ink">
          {/* ::after cobre o card inteiro — clicar em qualquer ponto abre o
              anúncio. O anel de foco fica no <article> (focus-within). */}
          <Link
            href={`/anuncios/${listing.id}`}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {listing.title}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="tabular font-display text-[1.25rem] leading-none text-ink">
              {formatBRL(listing.priceCents)}
            </p>
            {/* Altura fixa mesmo sem preço original, para alinhar as linhas. */}
            <p className="tabular mt-1 h-4 text-[0.75rem] leading-4 text-mute line-through">
              {listing.originalPriceCents ? formatBRL(listing.originalPriceCents) : ""}
            </p>
          </div>

          {listing.negotiable && (
            <span className="shrink-0 pb-0.5 text-[0.6875rem] uppercase tracking-[0.08em] text-brass">
              Aceita proposta
            </span>
          )}
        </div>

        <p className="mt-3 truncate border-t border-sand pt-3 text-[0.75rem] text-dusk">
          por <span className="text-bark">{sellerLabel}</span>
        </p>
      </div>
    </article>
  );
}
