import type { Metadata } from "next";

import { logoutEverywhereAction } from "@/actions/auth";
import {
  DeleteAccountForm,
  PasswordForm,
  ProfileForm,
} from "@/components/painel/ProfileForms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configurações",
  robots: { index: false, follow: false },
};

function Card({
  title,
  description,
  children,
  tone = "default",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={
        tone === "danger"
          ? "rounded-lg border border-danger/25 bg-danger/4 p-6 sm:p-8"
          : "rounded-lg border border-sand-deep/70 bg-canvas p-6 sm:p-8"
      }
    >
      <h2 className="font-display text-[1.25rem] text-ink">{title}</h2>
      {description && (
        <p className="mt-2 max-w-xl text-[0.8125rem] leading-relaxed text-dusk">
          {description}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function ConfiguracoesPage() {
  const user = await requireUser("/painel/configuracoes");

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">Sua conta</p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-light leading-tight tracking-[-0.025em] text-ink">
          Configurações
        </h1>
      </header>

      <Card
        title="Perfil"
        description="Estes dados aparecem para quem visita seus anúncios. O e-mail nunca é exibido publicamente."
      >
        <ProfileForm
          defaults={{
            name: user.name,
            phone: user.phone ?? "",
            city: user.city ?? "",
            state: user.state ?? "",
            bio: user.bio ?? "",
          }}
        />
      </Card>

      <Card title="E-mail de acesso">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-sand-deep bg-linen/50 px-4 py-3">
          <span className="text-sm text-bark">{user.email}</span>
          <span className="text-[0.75rem] text-mute">
            A troca de e-mail chega em uma próxima versão
          </span>
        </div>
      </Card>

      <Card
        title="Senha"
        description="Ao trocar a senha, todas as outras sessões são encerradas automaticamente."
      >
        <PasswordForm />
      </Card>

      <Card
        title="Sessões ativas"
        description="Se você acessou o Decorar em um computador compartilhado, encerre todas as sessões — inclusive esta."
      >
        <form action={logoutEverywhereAction}>
          <button
            type="submit"
            className="h-10 rounded-full border border-sand-deep px-5 text-[0.8125rem] text-bark transition-colors hover:border-ink"
          >
            Sair de todos os dispositivos
          </button>
        </form>
      </Card>

      <Card
        tone="danger"
        title="Excluir conta"
        description="Apaga permanentemente seu perfil, sua loja, todos os anúncios e as imagens enviadas. Não há como desfazer."
      >
        <DeleteAccountForm />
      </Card>
    </div>
  );
}
