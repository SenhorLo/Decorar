import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { SearchQuery } from "@/lib/validators";
import { normalize } from "@/lib/utils";

export const PAGE_SIZE = 12;

/** Campos que a vitrine precisa — nunca traz e-mail/hash do vendedor. */
export const listingCardSelect = {
  id: true,
  title: true,
  priceCents: true,
  originalPriceCents: true,
  category: true,
  condition: true,
  city: true,
  state: true,
  status: true,
  negotiable: true,
  deliveryAvailable: true,
  views: true,
  createdAt: true,
  images: {
    select: { url: true, alt: true },
    orderBy: { position: "asc" },
    take: 1,
  },
  seller: {
    select: {
      id: true,
      name: true,
      store: { select: { name: true, slug: true } },
    },
  },
} satisfies Prisma.ListingSelect;

export type ListingCardData = Prisma.ListingGetPayload<{
  select: typeof listingCardSelect;
}>;

/** Texto normalizado gravado em Listing.searchIndex. */
export function buildSearchIndex(parts: {
  title: string;
  description: string;
  brand?: string | null;
  material?: string | null;
  color?: string | null;
  city: string;
}): string {
  return normalize(
    [parts.title, parts.description, parts.brand, parts.material, parts.color, parts.city]
      .filter(Boolean)
      .join(" "),
  ).slice(0, 4000);
}

const ORDER_BY: Record<SearchQuery["ordem"], Prisma.ListingOrderByWithRelationInput[]> = {
  recentes: [{ createdAt: "desc" }],
  "menor-preco": [{ priceCents: "asc" }, { createdAt: "desc" }],
  "maior-preco": [{ priceCents: "desc" }, { createdAt: "desc" }],
  populares: [{ views: "desc" }, { createdAt: "desc" }],
};

export function buildListingWhere(query: SearchQuery): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: "ATIVO" };

  if (query.q) {
    // searchIndex já está sem acento e em minúsculo; normalizamos o termo
    // igual para que "sofa" encontre "Sofá".
    const terms = normalize(query.q).split(/\s+/).filter(Boolean).slice(0, 6);
    if (terms.length) {
      where.AND = terms.map((term) => ({ searchIndex: { contains: term } }));
    }
  }

  if (query.categoria) where.category = query.categoria;
  if (query.condicao) where.condition = query.condicao;
  if (query.uf) where.state = query.uf;
  // `city` guarda o nome como o vendedor digitou ("Belo Horizonte"), então a
  // comparação precisa ignorar caixa — no Postgres `contains` é sensível a
  // maiúsculas, ao contrário do SQLite usado no início do projeto.
  if (query.cidade) where.city = { contains: query.cidade, mode: "insensitive" };
  if (query.entrega) where.deliveryAvailable = true;

  if (query.min !== undefined || query.max !== undefined) {
    where.priceCents = {
      ...(query.min !== undefined ? { gte: query.min * 100 } : {}),
      ...(query.max !== undefined ? { lte: query.max * 100 } : {}),
    };
  }

  return where;
}

export async function searchListings(query: SearchQuery) {
  const where = buildListingWhere(query);
  const skip = (query.pagina - 1) * PAGE_SIZE;

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      select: listingCardSelect,
      orderBy: ORDER_BY[query.ordem],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.pagina,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export function featuredListings(take = 8) {
  return prisma.listing.findMany({
    where: { status: "ATIVO" },
    select: listingCardSelect,
    orderBy: [{ views: "desc" }, { createdAt: "desc" }],
    take,
  });
}

export function latestListings(take = 4) {
  return prisma.listing.findMany({
    where: { status: "ATIVO" },
    select: listingCardSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function categoryCounts(): Promise<Record<string, number>> {
  const rows = await prisma.listing.groupBy({
    by: ["category"],
    where: { status: "ATIVO" },
    _count: { _all: true },
  });

  return Object.fromEntries(rows.map((r) => [r.category, r._count._all]));
}
