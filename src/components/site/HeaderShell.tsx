"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, LayoutGrid, Menu, Search, User, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { buttonStyles } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

type HeaderUser = { name: string; storeSlug: string | null } | null;

const NAV = [
  { href: "/anuncios", label: "Explorar" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#curadoria", label: "Curadoria" },
];

export function HeaderShell({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);

  /** Na home o header flutua sobre o hero até o usuário rolar. */
  const overlay = pathname === "/" && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha os menus ao navegar e trava o scroll com o drawer aberto.
  useEffect(() => {
    setMenuOpen(false);
    setCatsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        overlay
          ? "border-b border-transparent bg-transparent"
          : "border-b border-sand-deep/60 bg-linen/85 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-18 max-w-[88rem] items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="shrink-0" aria-label="Decorar — página inicial">
          <Logo tone={overlay ? "dark" : "dark"} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          <div
            className="relative"
            onMouseEnter={() => setCatsOpen(true)}
            onMouseLeave={() => setCatsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setCatsOpen((v) => !v)}
              aria-expanded={catsOpen}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm text-bark transition-colors hover:text-ink"
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              Categorias
            </button>

            {catsOpen && (
              <div className="absolute left-0 top-full w-[30rem] pt-2">
                <div className="animate-fade-up grid grid-cols-2 gap-0.5 rounded-lg border border-sand-deep bg-canvas p-2 shadow-[var(--shadow-lift)]">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/anuncios?categoria=${c.slug}`}
                      className="rounded-sm px-3 py-2 text-[0.8125rem] text-bark transition-colors hover:bg-brass-wash hover:text-ink"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm text-bark transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/anuncios"
            aria-label="Buscar peças"
            className="grid h-10 w-10 place-items-center rounded-full text-bark transition-colors hover:bg-sand/60 hover:text-ink"
          >
            <Search className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
          </Link>

          {user ? (
            <>
              <Link
                href="/favoritos"
                aria-label="Favoritos"
                className="hidden h-10 w-10 place-items-center rounded-full text-bark transition-colors hover:bg-sand/60 hover:text-ink sm:grid"
              >
                <Heart className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
              </Link>
              <Link href="/painel" className={buttonStyles("outline", "sm", "hidden sm:inline-flex")}>
                <User className="h-3.5 w-3.5" aria-hidden="true" />
                {user.name.split(" ")[0]}
              </Link>
              <Link href="/anuncios/novo" className={buttonStyles("primary", "sm", "hidden md:inline-flex")}>
                Anunciar
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonStyles("ghost", "sm", "hidden sm:inline-flex")}>
                Entrar
              </Link>
              <Link href="/cadastro" className={buttonStyles("primary", "sm", "hidden sm:inline-flex")}>
                Criar conta
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-sand/60 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="animate-fade-up border-t border-sand-deep bg-linen lg:hidden">
          <nav className="mx-auto max-w-[88rem] space-y-1 px-5 py-6 sm:px-8" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-3 text-[0.9375rem] text-bark hover:bg-sand/50"
              >
                {item.label}
              </Link>
            ))}

            <p className="px-3 pb-1 pt-5 text-[0.6875rem] uppercase tracking-[0.14em] text-dusk">
              Categorias
            </p>
            <div className="grid grid-cols-2 gap-0.5">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/anuncios?categoria=${c.slug}`}
                  className="rounded-md px-3 py-2.5 text-[0.8125rem] text-bark hover:bg-sand/50"
                >
                  {c.label}
                </Link>
              ))}
            </div>

            <div className="hairline my-5" />

            {user ? (
              <div className="grid gap-2">
                <Link href="/painel" className={buttonStyles("outline", "md")}>
                  Meu painel
                </Link>
                <Link href="/anuncios/novo" className={buttonStyles("primary", "md")}>
                  Criar anúncio
                </Link>
              </div>
            ) : (
              <div className="grid gap-2">
                <Link href="/login" className={buttonStyles("outline", "md")}>
                  Entrar
                </Link>
                <Link href="/cadastro" className={buttonStyles("primary", "md")}>
                  Criar conta
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
