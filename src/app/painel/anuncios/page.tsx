import type { Metadata } from "next";
import Link from "next/link";
import { Package, Plus } from "lucide-react";

import { ListingImage } from "@/components/ListingImage";
import { ListingRowActions } from "@/components/painel/ListingRowActions";
import { FormSuccess } from "@/components/ui/form";
import { buttonStyles } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categoryLabel, LISTING_STATUS } from "@/lib/taxonomy";
import { cn, formatBRL, formatRelativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meus anúncios",
  robots: { index: false, follow: false },
};

export default async function MeusAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; criado?: string; removido?: string }>;
}) {
  const [user, params] = await Promise.all([requireUser("/painel/anuncios"), searchParams]);

  const statusFilter = LISTING_STATUS.some((s) => s.value === params.status)
    ? params.status
    : undefined;

  const [listings, counts] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: user.id, ...(statusFilter ? { status: statusFilter } : {}) },
      select: {
        id: true,
        title: true,
        priceCents: true,
        status: true,
        views: true,
        category: true,
        city: true,
        state: true,
        createdAt: true,
        images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.listing.groupBy({
      by: ["status"],
      where: { sellerId: user.id },
      _count: { _all: true },
    }),
  ]);

  const byStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  const total = counts.reduce((sum, c) => sum + c._count._all, 0);

  const tabs = [
    { value: undefined, label: "Todos", count: total },
    ...LISTING_STATUS.map((s) => ({
      value: s.value,
      label: s.label,
      count: byStatus[s.value] ?? 0,
    })),
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
            Gerenciar
          </p>
          <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-light leading-tight tracking-[-0.025em] text-ink">
            Meus anúncios
          </h1>
        </div>

        <Link href="/anuncios/novo" className={buttonStyles("primary", "md")}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo anúncio
        </Link>
      </header>

      {params.criado && <FormSuccess>Anúncio publicado com sucesso.</FormSuccess>}
      {params.removido && <FormSuccess>Anúncio removido.</FormSuccess>}

      <nav className="flex flex-wrap gap-2" aria-label="Filtrar por situação">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/painel/anuncios?status=${tab.value}` : "/painel/anuncios"}
            aria-current={statusFilter === tab.value ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.8125rem] transition-colors",
              statusFilter === tab.value
                ? "bg-ink text-linen"
                : "border border-sand-deep text-bark hover:border-ink",
            )}
          >
            {tab.label}
            <span className="tabular text-[0.6875rem] opacity-60">{tab.count}</span>
          </Link>
        ))}
      </nav>

      {listings.length > 0 ? (
        <ul className="space-y-3">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="rounded-lg border border-sand-deep/70 bg-canvas p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative h-20 w-26 shrink-0 overflow-hidden rounded-md bg-sand/40">
                  <ListingImage
                    url={listing.images[0]?.url}
                    alt=""
                    category={listing.category}
                    sizes="104px"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/anuncios/${listing.id}`}
                    className="line-clamp-1 font-display text-[1.0625rem] text-ink underline-offset-4 hover:underline"
                  >
                    {listing.title}
                  </Link>

                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-dusk">
                    <span className="tabular text-bark">{formatBRL(listing.priceCents)}</span>
                    <span>·</span>
                    <span>{categoryLabel(listing.category)}</span>
                    <span>·</span>
                    <span>
                      {listing.city}, {listing.state}
                    </span>
                  </p>

                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[0.75rem] text-mute">
                    <span>{listing.views} visualizações</span>
                    <span>{listing._count.favorites} favoritos</span>
                    <span>{formatRelativeDate(listing.createdAt)}</span>
                  </p>
                </div>

                <ListingRowActions
                  id={listing.id}
                  status={listing.status}
                  title={listing.title}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-sand-deep bg-canvas/50 px-8 py-20 text-center">
          <Package className="mx-auto h-6 w-6 text-mute" aria-hidden="true" />
          <p className="mt-4 font-display text-lg text-ink">
            {statusFilter ? "Nada nesta situação" : "Nenhum anúncio ainda"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-dusk">
            {statusFilter
              ? "Troque o filtro acima para ver os outros anúncios."
              : "Publique sua primeira peça e ela aparece aqui para você acompanhar."}
          </p>
          <Link href="/anuncios/novo" className={buttonStyles("primary", "md", "mt-7")}>
            Criar anúncio
          </Link>
        </div>
      )}
    </div>
  );
}
