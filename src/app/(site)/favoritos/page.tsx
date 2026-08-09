import type { Metadata } from "next";
import Link from "next/link";
import { HeartOff } from "lucide-react";

import { ListingCard } from "@/components/ListingCard";
import { Reveal } from "@/components/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listingCardSelect } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: { index: false, follow: false },
};

export default async function FavoritosPage() {
  const user = await requireUser("/favoritos");

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { listing: { select: listingCardSelect } },
    orderBy: { createdAt: "desc" },
  });

  const listings = favorites.map((f) => f.listing);

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 max-w-xl">
        <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
          Sua seleção
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-light leading-tight tracking-[-0.025em] text-ink">
          Favoritos
        </h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-dusk">
          {listings.length > 0
            ? "As peças que você guardou. Vale conferir de tempos em tempos — preços mudam e anúncios saem do ar."
            : "Você ainda não salvou nenhuma peça."}
        </p>
      </header>

      {listings.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing, i) => (
            <Reveal
              key={listing.id}
              from="scale"
              delay={(i % 4) * 70}
              threshold={0.05}
              className="h-full"
            >
              <ListingCard listing={listing} favorited canFavorite />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-sand-deep bg-canvas/60 px-8 py-24 text-center">
          <HeartOff className="mx-auto h-7 w-7 text-mute" aria-hidden="true" />
          <p className="mt-5 font-display text-xl text-ink">Nada salvo por aqui</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-dusk">
            Toque no coração de qualquer anúncio para guardá-lo. Fica tudo nesta
            página, só para você.
          </p>
          <Link href="/anuncios" className={buttonStyles("primary", "md", "mt-8")}>
            Explorar peças
          </Link>
        </div>
      )}
    </div>
  );
}
