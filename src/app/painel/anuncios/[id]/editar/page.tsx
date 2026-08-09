import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ListingForm } from "@/components/listing/ListingForm";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { centsToInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar anúncio",
  robots: { index: false, follow: false },
};

export default async function EditarAnuncioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, requireUser("/painel/anuncios")]);

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!listing) notFound();

  // Dono ou admin — o mesmo teste é refeito na Server Action ao salvar.
  if (listing.sellerId !== user.id && user.role !== "ADMIN") notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/painel/anuncios"
        className="group inline-flex items-center gap-2 text-sm text-dusk transition-colors hover:text-ink"
      >
        <ArrowLeft
          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
          aria-hidden="true"
        />
        Meus anúncios
      </Link>

      <header>
        <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">Editando</p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-light leading-tight tracking-[-0.025em] text-ink">
          {listing.title}
        </h1>
      </header>

      <ListingForm
        mode="edit"
        defaults={{
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: centsToInput(listing.priceCents),
          originalPrice: listing.originalPriceCents
            ? centsToInput(listing.originalPriceCents)
            : "",
          category: listing.category,
          condition: listing.condition,
          material: listing.material ?? "",
          color: listing.color ?? "",
          brand: listing.brand ?? "",
          city: listing.city,
          state: listing.state,
          status: listing.status,
          negotiable: listing.negotiable,
          deliveryAvailable: listing.deliveryAvailable,
          images: listing.images.map((image) => image.url),
        }}
      />
    </div>
  );
}
