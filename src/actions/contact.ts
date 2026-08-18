"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type ContactResult =
  | { ok: true; phone: string | null; whatsapp: string | null }
  | { ok: false; reason: "unauthenticated" | "notfound" | "ratelimited" };

/**
 * Entrega o contato do vendedor de um anúncio.
 *
 * O número não acompanha a página: ele é buscado só quando alguém clica em
 * "ver contato". Isso muda a economia da raspagem — em vez de baixar o
 * catálogo e extrair os telefones do HTML, é preciso uma chamada autenticada
 * por anúncio, que dá para contar e limitar. O limite abaixo permite o uso
 * normal (abrir vários anúncios numa tarde de garimpo) e corta a coleta em
 * massa.
 */
export async function revealContactAction(listingId: string): Promise<ContactResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  if (typeof listingId !== "string" || listingId.length > 40) {
    return { ok: false, reason: "notfound" };
  }

  const ip = await clientIp();
  const limite = rateLimit(`contato:${user.id}:${ip}`, {
    limit: 40,
    windowMs: 60 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });
  if (!limite.ok) return { ok: false, reason: "ratelimited" };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      status: true,
      seller: {
        select: {
          phone: true,
          store: { select: { whatsapp: true } },
        },
      },
    },
  });

  // Anúncio pausado, vendido ou em rascunho não expõe contato.
  if (!listing || listing.status !== "ATIVO") {
    return { ok: false, reason: "notfound" };
  }

  return {
    ok: true,
    phone: listing.seller.phone,
    whatsapp: listing.seller.store?.whatsapp ?? null,
  };
}
