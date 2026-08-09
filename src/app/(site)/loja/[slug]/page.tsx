import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Instagram, MapPin, PencilLine } from "lucide-react";

import { ListingCard } from "@/components/ListingCard";
import { ProductPlate } from "@/components/ProductPlate";
import { Reveal } from "@/components/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listingCardSelect } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { name: true, tagline: true, description: true },
  });

  if (!store) return { title: "Loja não encontrada" };

  return {
    title: store.name,
    description: store.tagline ?? store.description?.slice(0, 155) ?? undefined,
  };
}

export default async function LojaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, user] = await Promise.all([params, getCurrentUser()]);

  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true, bio: true, createdAt: true } },
    },
  });

  if (!store) notFound();

  const isOwner = user?.id === store.ownerId;

  const listings = await prisma.listing.findMany({
    where: {
      sellerId: store.ownerId,
      // O dono enxerga rascunho e pausado; visitante só vê o que está ativo.
      ...(isOwner ? {} : { status: "ATIVO" }),
    },
    select: listingCardSelect,
    orderBy: { createdAt: "desc" },
  });

  const favoriteIds = user
    ? new Set(
        (
          await prisma.favorite.findMany({
            where: { userId: user.id },
            select: { listingId: true },
          })
        ).map((f) => f.listingId),
      )
    : new Set<string>();

  return (
    <div>
      {/* Capa */}
      <div className="relative h-52 overflow-hidden border-b border-sand-deep/60 bg-sand/40 sm:h-72">
        <div className="absolute inset-0 grid grid-cols-3 opacity-70 sm:grid-cols-6">
          {["sofas-e-poltronas", "iluminacao", "mesas-e-cadeiras", "vasos-e-objetos", "espelhos", "tapetes-e-texteis"].map(
            (category, i) => (
              <div key={category} className={i > 2 ? "hidden sm:block" : ""}>
                <ProductPlate category={category} seed={`${slug}-${i}`} />
              </div>
            ),
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-linen via-linen/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        {/* Cabeçalho da loja */}
        <header className="-mt-16 flex flex-wrap items-end gap-6 pb-10">
          <div
            className="grid h-28 w-28 shrink-0 place-items-center rounded-xl border-4 border-linen bg-forest font-display text-4xl text-linen"
            aria-hidden="true"
          >
            {store.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[clamp(1.875rem,4.5vw,3rem)] font-light leading-tight tracking-[-0.025em] text-ink">
              {store.name}
            </h1>

            {store.tagline && (
              <p className="mt-2 text-[1.0625rem] leading-relaxed text-dusk">
                {store.tagline}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem] text-dusk">
              {(store.city || store.state) && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {[store.city, store.state].filter(Boolean).join(", ")}
                </span>
              )}

              {store.instagram && (
                <a
                  href={`https://instagram.com/${store.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-brass"
                >
                  <Instagram className="h-3.5 w-3.5" aria-hidden="true" />@{store.instagram}
                </a>
              )}

              <span>
                {listings.length} {listings.length === 1 ? "peça" : "peças"}
              </span>
            </div>
          </div>

          {isOwner && (
            <Link href="/painel/loja" className={buttonStyles("outline", "md")}>
              <PencilLine className="h-4 w-4" aria-hidden="true" />
              Editar loja
            </Link>
          )}
        </header>

        {store.description && (
          <div className="mb-14 max-w-2xl border-l-2 border-brass/40 pl-6">
            <p className="whitespace-pre-line text-[1rem] leading-relaxed text-bark">
              {store.description}
            </p>
          </div>
        )}

        {/* Anúncios */}
        <section className="pb-20">
          <h2 className="mb-8 font-display text-[1.5rem] text-ink">
            {isOwner ? "Todos os seus anúncios" : "Peças à venda"}
          </h2>

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
                  <ListingCard
                    listing={listing}
                    favorited={favoriteIds.has(listing.id)}
                    canFavorite={Boolean(user)}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-sand-deep bg-canvas/60 px-8 py-20 text-center">
              <p className="font-display text-lg text-ink">
                Esta loja ainda não tem peças publicadas.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
