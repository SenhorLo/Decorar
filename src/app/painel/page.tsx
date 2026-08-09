import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, Heart, Package, Store as StoreIcon } from "lucide-react";

import { ListingImage } from "@/components/ListingImage";
import { Badge } from "@/components/ui/form";
import { buttonStyles } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/taxonomy";
import { formatBRL, formatRelativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

const STATUS_TONE = {
  ATIVO: "brass",
  RASCUNHO: "muted",
  PAUSADO: "neutral",
  VENDIDO: "forest",
} as const;

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ bemvindo?: string }>;
}) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);

  const [listings, counts, viewsAgg, favoritesCount] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: user.id },
      select: {
        id: true,
        title: true,
        priceCents: true,
        status: true,
        views: true,
        category: true,
        createdAt: true,
        images: { select: { url: true, alt: true }, orderBy: { position: "asc" }, take: 1 },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.listing.groupBy({
      by: ["status"],
      where: { sellerId: user.id },
      _count: { _all: true },
    }),
    prisma.listing.aggregate({
      where: { sellerId: user.id },
      _sum: { views: true },
    }),
    prisma.favorite.count({ where: { listing: { sellerId: user.id } } }),
  ]);

  const byStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  const totalListings = counts.reduce((sum, c) => sum + c._count._all, 0);

  const stats = [
    { label: "Anúncios ativos", value: byStatus.ATIVO ?? 0, icon: Package },
    { label: "Visualizações", value: viewsAgg._sum.views ?? 0, icon: Eye },
    { label: "Salvos por outros", value: favoritesCount, icon: Heart },
    { label: "Vendidos", value: byStatus.VENDIDO ?? 0, icon: StoreIcon },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
          {params.bemvindo ? "Conta criada" : "Visão geral"}
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-light leading-tight tracking-[-0.025em] text-ink">
          {params.bemvindo
            ? `Bem-vindo ao Decorar, ${user.name.split(" ")[0]}`
            : `Olá, ${user.name.split(" ")[0]}`}
        </h1>
        <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-dusk">
          {totalListings === 0
            ? "Você ainda não publicou nada. Comece pelo primeiro anúncio — leva uns cinco minutos."
            : "Acompanhe o desempenho dos seus anúncios e mantenha as informações em dia."}
        </p>
      </header>

      {/* Métricas */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-sand-deep/70 bg-canvas p-5"
          >
            <stat.icon className="h-4 w-4 text-brass" aria-hidden="true" />
            <p className="tabular mt-4 font-display text-[1.875rem] leading-none text-ink">
              {stat.value}
            </p>
            <p className="mt-2 text-[0.75rem] uppercase tracking-[0.08em] text-mute">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* Loja */}
      {!user.hasStore && (
        <section className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-brass/25 bg-brass-wash p-6">
          <div className="max-w-md">
            <h2 className="font-display text-[1.25rem] text-ink">
              Reúna seus anúncios em uma loja
            </h2>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-bark/80">
              Uma página própria com nome, descrição e contato — ideal para quem
              vende com frequência ou tem um brechó de mobília.
            </p>
          </div>
          <Link href="/painel/loja" className={buttonStyles("secondary", "md")}>
            Criar minha loja
          </Link>
        </section>
      )}

      {/* Últimos anúncios */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-[1.5rem] text-ink">Últimos anúncios</h2>
          {totalListings > 0 && (
            <Link
              href="/painel/anuncios"
              className="group inline-flex items-center gap-1.5 text-sm text-dusk transition-colors hover:text-ink"
            >
              Ver todos ({totalListings})
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>

        {listings.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className="flex items-center gap-4 rounded-lg border border-sand-deep/70 bg-canvas p-3 transition-colors hover:border-dusk/50"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-sand/40">
                  <ListingImage
                    url={listing.images[0]?.url}
                    alt=""
                    category={listing.category}
                    sizes="80px"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/anuncios/${listing.id}`}
                    className="line-clamp-1 text-[0.9375rem] text-ink underline-offset-4 hover:underline"
                  >
                    {listing.title}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[0.75rem] text-dusk">
                    <span className="tabular">{formatBRL(listing.priceCents)}</span>
                    <span>{listing.views} visualizações</span>
                    <span>{listing._count.favorites} favoritos</span>
                    <span className="hidden sm:inline">
                      {formatRelativeDate(listing.createdAt)}
                    </span>
                  </p>
                </div>

                <Badge
                  tone={STATUS_TONE[listing.status as keyof typeof STATUS_TONE] ?? "neutral"}
                  className="shrink-0"
                >
                  {statusLabel(listing.status)}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-sand-deep bg-canvas/50 px-8 py-16 text-center">
            <Package className="mx-auto h-6 w-6 text-mute" aria-hidden="true" />
            <p className="mt-4 font-display text-lg text-ink">Nenhum anúncio ainda</p>
            <Link href="/anuncios/novo" className={buttonStyles("primary", "md", "mt-6")}>
              Criar meu primeiro anúncio
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
