import type { Metadata } from "next";

import { deleteStoreAction } from "@/actions/store";
import { StoreForm } from "@/components/painel/StoreForm";
import { FormSuccess } from "@/components/ui/form";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Minha loja",
  robots: { index: false, follow: false },
};

export default async function PainelLojaPage({
  searchParams,
}: {
  searchParams: Promise<{ removida?: string }>;
}) {
  const [user, params] = await Promise.all([requireUser("/painel/loja"), searchParams]);

  const store = await prisma.store.findUnique({ where: { ownerId: user.id } });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
          {store ? "Página pública" : "Ainda sem loja"}
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-light leading-tight tracking-[-0.025em] text-ink">
          Minha loja
        </h1>
        <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-dusk">
          A loja reúne todos os seus anúncios numa página com endereço próprio.
          É opcional — dá para vender normalmente sem criar uma.
        </p>
      </header>

      {params.removida && <FormSuccess>Loja removida. Seus anúncios continuam no ar.</FormSuccess>}

      <div className="rounded-lg border border-sand-deep/70 bg-canvas p-6 sm:p-8">
        <StoreForm
          defaults={{
            name: store?.name ?? "",
            tagline: store?.tagline ?? "",
            description: store?.description ?? "",
            city: store?.city ?? user.city ?? "",
            state: store?.state ?? user.state ?? "",
            whatsapp: store?.whatsapp ?? user.phone ?? "",
            instagram: store?.instagram ?? "",
            slug: store?.slug ?? null,
          }}
        />
      </div>

      {store && (
        <section className="rounded-lg border border-danger/25 bg-danger/4 p-6">
          <h2 className="font-display text-[1.125rem] text-ink">Encerrar a loja</h2>
          <p className="mt-2 max-w-lg text-[0.8125rem] leading-relaxed text-dusk">
            A página pública sai do ar. Seus anúncios continuam ativos, apenas
            deixam de exibir o nome da loja.
          </p>

          <form action={deleteStoreAction} className="mt-5">
            <button
              type="submit"
              className="h-10 rounded-full border border-danger/40 px-5 text-[0.8125rem] text-danger transition-colors hover:bg-danger hover:text-white"
            >
              Encerrar minha loja
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
