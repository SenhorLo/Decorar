import type { Metadata } from "next";

import { ListingForm } from "@/components/listing/ListingForm";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Criar anúncio",
  robots: { index: false, follow: false },
};

export default async function NovoAnuncioPage() {
  // Middleware já barrou visitantes; esta é a segunda camada, no servidor.
  const user = await requireUser("/anuncios/novo");

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
          Novo anúncio
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-light leading-tight tracking-[-0.025em] text-ink">
          Conte a história da peça
        </h1>
        <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-dusk">
          Quanto mais completo o anúncio, menos perguntas você responde depois —
          e mais rápido a peça sai.
        </p>
      </header>

      <ListingForm
        mode="create"
        defaults={{
          title: "",
          description: "",
          price: "",
          originalPrice: "",
          category: "",
          condition: "",
          material: "",
          color: "",
          brand: "",
          city: user.city ?? "",
          state: user.state ?? "",
          status: "ATIVO",
          negotiable: false,
          deliveryAvailable: false,
          images: [],
        }}
      />
    </div>
  );
}
