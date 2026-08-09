import Link from "next/link";
import { ArrowUpRight, LogOut, Plus } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { Logo } from "@/components/brand/Logo";
import { PainelNav } from "@/components/painel/PainelNav";
import { buttonStyles } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/painel");

  return (
    <div className="min-h-dvh bg-linen">
      <header className="sticky top-0 z-40 border-b border-sand-deep/60 bg-linen/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[80rem] items-center gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Decorar — página inicial">
            <Logo />
          </Link>

          <span className="hidden text-[0.6875rem] uppercase tracking-[0.16em] text-mute sm:inline">
            Painel
          </span>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/anuncios"
              className="hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-sm text-dusk transition-colors hover:text-ink sm:inline-flex"
            >
              Ver o site
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>

            <Link href="/anuncios/novo" className={buttonStyles("primary", "sm")}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Anunciar
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sair da conta"
                className="grid h-10 w-10 place-items-center rounded-full text-dusk transition-colors hover:bg-sand/60 hover:text-danger"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[80rem] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[14rem_1fr] lg:gap-12 lg:py-14">
        <aside>
          <div className="mb-6 hidden items-center gap-3 lg:flex">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest font-display text-base text-linen"
              aria-hidden="true"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{user.name}</p>
              <p className="truncate text-[0.75rem] text-mute">{user.email}</p>
            </div>
          </div>

          <PainelNav />
        </aside>

        <main id="conteudo" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
