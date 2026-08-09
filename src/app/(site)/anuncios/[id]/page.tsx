import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  MapPin,
  PencilLine,
  Store as StoreIcon,
  Truck,
} from "lucide-react";

import { FavoriteButton } from "@/components/FavoriteButton";
import { ListingCard } from "@/components/ListingCard";
import { ContactSeller } from "@/components/listing/ContactSeller";
import { ListingGallery } from "@/components/listing/ListingGallery";
import { Reveal } from "@/components/Reveal";
import { Badge } from "@/components/ui/form";
import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listingCardSelect } from "@/lib/listings";
import { categoryLabel, conditionLabel, statusLabel } from "@/lib/taxonomy";
import { discountPercent, formatBRL, formatRelativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getListing(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      seller: {
        select: {
          id: true,
          name: true,
          phone: true,
          city: true,
          state: true,
          bio: true,
          createdAt: true,
          store: {
            select: { name: true, slug: true, tagline: true, whatsapp: true },
          },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { title: true, description: true, status: true },
  });

  if (!listing) return { title: "Anúncio não encontrado" };

  return {
    title: listing.title,
    description: listing.description.slice(0, 155),
    robots: listing.status === "ATIVO" ? undefined : { index: false, follow: false },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, user] = await Promise.all([getListing(id), getCurrentUser()]);

  if (!listing) notFound();

  const isOwner = user?.id === listing.sellerId;
  const isAdmin = user?.role === "ADMIN";

  // Rascunho e pausado só aparecem para o dono (e para admin).
  if (listing.status !== "ATIVO" && !isOwner && !isAdmin) notFound();

  // Visualizações não contam o próprio dono.
  if (!isOwner) {
    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  const favorited = user
    ? Boolean(
        await prisma.favorite.findUnique({
          where: { userId_listingId: { userId: user.id, listingId: id } },
          select: { userId: true },
        }),
      )
    : false;

  const related = await prisma.listing.findMany({
    where: {
      status: "ATIVO",
      category: listing.category,
      id: { not: listing.id },
    },
    select: listingCardSelect,
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const discount = discountPercent(listing.priceCents, listing.originalPriceCents);
  const store = listing.seller.store;

  const specs = [
    ["Categoria", categoryLabel(listing.category)],
    ["Conservação", conditionLabel(listing.condition)],
    ["Material", listing.material],
    ["Cor", listing.color],
    ["Marca", listing.brand],
    ["Localização", `${listing.city}, ${listing.state}`],
    ["Entrega", listing.deliveryAvailable ? "Disponível" : "Retirada no local"],
    ["Publicado", formatRelativeDate(listing.createdAt)],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/anuncios"
        className="group inline-flex items-center gap-2 text-sm text-dusk transition-colors hover:text-ink"
      >
        <ArrowLeft
          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
          aria-hidden="true"
        />
        Voltar para a busca
      </Link>

      {listing.status !== "ATIVO" && (
        <div className="mt-6 rounded-md border border-brass/30 bg-brass-wash px-4 py-3 text-sm text-brass">
          Este anúncio está como <strong>{statusLabel(listing.status)}</strong> e não
          aparece na busca pública. Só você consegue vê-lo.
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-14">
        {/* ---------- Coluna esquerda ---------- */}
        <div>
          <ListingGallery
            images={listing.images}
            title={listing.title}
            category={listing.category}
          />

          <section className="mt-12">
            <h2 className="font-display text-[1.5rem] text-ink">Sobre a peça</h2>
            <div className="mt-4 whitespace-pre-line text-[1rem] leading-relaxed text-bark">
              {listing.description}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-[1.5rem] text-ink">Ficha técnica</h2>
            <dl className="mt-5 grid gap-x-10 gap-y-0 sm:grid-cols-2">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 border-b border-sand py-3.5"
                >
                  <dt className="text-[0.8125rem] uppercase tracking-[0.08em] text-mute">
                    {label}
                  </dt>
                  <dd className="text-right text-[0.9375rem] text-bark">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* ---------- Coluna direita (sticky) ---------- */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-xl border border-sand-deep/70 bg-canvas p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brass">{categoryLabel(listing.category)}</Badge>
              <Badge tone="neutral">{conditionLabel(listing.condition)}</Badge>
              {listing.negotiable && <Badge tone="muted">Aceita proposta</Badge>}
            </div>

            <h1 className="mt-5 font-display text-[clamp(1.6rem,3vw,2.125rem)] font-light leading-tight tracking-[-0.02em] text-ink">
              {listing.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem] text-dusk">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {listing.city}, {listing.state}
              </span>
              {listing.deliveryAvailable && (
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                  Entrega disponível
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                {listing.views} visualizações
              </span>
            </div>

            <div className="mt-7 flex items-end gap-3">
              <p className="tabular font-display text-[2.5rem] font-light leading-none text-ink">
                {formatBRL(listing.priceCents)}
              </p>
              {discount && (
                <div className="pb-1">
                  <p className="tabular text-sm text-mute line-through">
                    {formatBRL(listing.originalPriceCents!)}
                  </p>
                  <p className="text-[0.75rem] font-medium text-clay">−{discount}%</p>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              {isOwner ? (
                <Link
                  href={`/painel/anuncios/${listing.id}/editar`}
                  className={buttonStyles("primary", "lg", "w-full")}
                >
                  <PencilLine className="h-4 w-4" aria-hidden="true" />
                  Editar meu anúncio
                </Link>
              ) : (
                <ContactSeller
                  phone={listing.seller.phone}
                  whatsapp={store?.whatsapp ?? null}
                  sellerName={listing.seller.name}
                  listingTitle={listing.title}
                />
              )}

              {user && !isOwner && (
                <FavoriteButton
                  listingId={listing.id}
                  initial={favorited}
                  size="lg"
                  withLabel
                />
              )}

              {!user && (
                <Link href={`/login?next=/anuncios/${listing.id}`} className={buttonStyles("outline", "lg", "w-full")}>
                  Entrar para salvar
                </Link>
              )}
            </div>
          </div>

          {/* Vendedor */}
          <div className="mt-5 rounded-xl border border-sand-deep/70 bg-canvas p-6">
            <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-mute">
              Anunciado por
            </p>

            <div className="mt-3 flex items-start gap-3">
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest font-display text-lg text-linen"
                aria-hidden="true"
              >
                {listing.seller.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate font-display text-[1.0625rem] text-ink">
                  {listing.seller.name}
                </p>
                <p className="mt-0.5 text-[0.75rem] text-dusk">
                  No Decorar desde{" "}
                  {new Intl.DateTimeFormat("pt-BR", {
                    month: "long",
                    year: "numeric",
                  }).format(listing.seller.createdAt)}
                </p>
              </div>
            </div>

            {listing.seller.bio && (
              <p className="mt-4 text-[0.8125rem] leading-relaxed text-dusk">
                {listing.seller.bio}
              </p>
            )}

            {store && (
              <Link
                href={`/loja/${store.slug}`}
                className="mt-5 flex items-center gap-2.5 rounded-md border border-sand-deep px-4 py-3 text-sm text-bark transition-colors hover:border-brass hover:text-brass"
              >
                <StoreIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">
                  Ver a loja {store.name}
                </span>
              </Link>
            )}
          </div>

          <p className="mt-5 px-1 text-[0.75rem] leading-relaxed text-mute">
            Combine a retirada em local público sempre que possível e confira a
            peça antes de pagar. O Decorar não intermedeia pagamentos.
          </p>
        </aside>
      </div>

      {/* ---------- Relacionados ---------- */}
      {related.length > 0 && (
        <section className="mt-24 border-t border-sand-deep/60 pt-16">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-light tracking-[-0.02em] text-ink">
            Da mesma categoria
          </h2>

          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, i) => (
              <Reveal key={item.id} from="scale" delay={i * 80} threshold={0.05} className="h-full">
                <ListingCard listing={item} canFavorite={Boolean(user)} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
