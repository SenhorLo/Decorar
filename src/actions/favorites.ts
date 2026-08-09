"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type FavoriteResult =
  | { ok: true; favorited: boolean }
  | { ok: false; reason: "unauthenticated" | "notfound" };

export async function toggleFavoriteAction(listingId: string): Promise<FavoriteResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  if (typeof listingId !== "string" || listingId.length > 40) {
    return { ok: false, reason: "notfound" };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });
  if (!listing) return { ok: false, reason: "notfound" };

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
    select: { userId: true },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_listingId: { userId: user.id, listingId } },
    });
    revalidatePath("/favoritos");
    return { ok: true, favorited: false };
  }

  await prisma.favorite.create({ data: { userId: user.id, listingId } });
  revalidatePath("/favoritos");
  return { ok: true, favorited: true };
}
