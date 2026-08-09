import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { ListingCard } from "@/components/ListingCard";
import { Pagination } from "@/components/Pagination";
import { Reveal } from "@/components/Reveal";
import { SearchFilters } from "@/components/search/SearchFilters";
import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { searchListings } from "@/lib/listings";
import { categoryLabel } from "@/lib/taxonomy";
import { searchParamsSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explorar peças",
  description:
    "Busque móveis e objetos de decoração por categoria, estado de conservação, cidade e faixa de preço.",
};

type RawParams = Record<string, string | string[] | undefined>;

export default async function AnunciosPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const raw = await searchParams;

  // Tudo que vem da URL passa pelo zod: valores fora do esperado viram
  // undefined em vez de chegar ao banco.
  const parsed = searchParamsSchema.safeParse(raw);
  const query = parsed.success
    ? parsed.data
    : searchParamsSchema.parse({ ordem: "recentes", pagina: 1 });

  const [user, result] = await Promise.all([getCurrentUser(), searchListings(query)]);

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

  const flatParams: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );

  const heading = query.categoria
    ? categoryLabel(query.categoria)
    : query.q
      ? `Resultados para “${query.q}”`
      : "Todas as peças";

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-9 max-w-2xl">
        <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">Explorar</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-light leading-tight tracking-[-0.025em] text-ink">
          {heading}
        </h1>
      </header>

      {/* Sem <Suspense> aqui de propósito: a página é `force-dynamic`, então
          não há prerender estático a proteger, e um limite de Suspense adia a
          hidratação dos filtros — que precisam responder de imediato. */}
      <SearchFilters total={result.total} />

      {result.items.length > 0 ? (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.items.map((listing, i) => (
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
                  priority={i < 4}
                />
              </Reveal>
            ))}
          </div>

          <Pagination page={result.page} pageCount={result.pageCount} params={flatParams} />
        </>
      ) : (
        <div className="mt-14 rounded-xl border border-dashed border-sand-deep bg-canvas/60 px-8 py-24 text-center">
          <SearchX className="mx-auto h-7 w-7 text-mute" aria-hidden="true" />
          <p className="mt-5 font-display text-xl text-ink">Nenhuma peça com esses filtros</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-dusk">
            Tente ampliar a faixa de preço, remover a cidade ou olhar outra
            categoria — o acervo muda todo dia.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/anuncios" className={buttonStyles("outline", "md")}>
              Limpar filtros
            </Link>
            <Link href="/anuncios/novo" className={buttonStyles("primary", "md")}>
              Anunciar uma peça
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
