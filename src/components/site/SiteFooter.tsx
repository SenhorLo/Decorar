import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { CATEGORIES } from "@/lib/taxonomy";

const COLUMNS = [
  {
    title: "Explorar",
    links: [
      { href: "/anuncios", label: "Todas as peças" },
      { href: "/anuncios?ordem=recentes", label: "Novidades" },
      { href: "/anuncios?categoria=vintage-e-garimpo", label: "Garimpo vintage" },
      { href: "/anuncios?entrega=true", label: "Com entrega" },
    ],
  },
  {
    title: "Vender",
    links: [
      { href: "/anuncios/novo", label: "Criar anúncio" },
      { href: "/painel/loja", label: "Abrir uma loja" },
      { href: "/painel/anuncios", label: "Meus anúncios" },
      { href: "/#como-funciona", label: "Como funciona" },
    ],
  },
  {
    title: "Conta",
    links: [
      { href: "/login", label: "Entrar" },
      { href: "/cadastro", label: "Criar conta" },
      { href: "/painel/configuracoes", label: "Configurações" },
      { href: "/favoritos", label: "Favoritos" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="grain relative overflow-hidden bg-forest text-linen">
      <div className="relative mx-auto max-w-[88rem] px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-linen/70">
              Um lugar sério para peças que merecem uma segunda casa. Curadoria,
              procedência e negociação direta entre quem vende e quem decora.
            </p>

            <div className="mt-8 flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.14em] text-brass-soft">
              <span className="h-px w-8 bg-brass-soft/60" />
              Desde 2026
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brass-soft">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-[0.875rem] text-linen/70 transition-colors hover:text-linen"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-linen/12 pt-8">
          <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-linen/40">
            Categorias
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/anuncios?categoria=${c.slug}`}
                className="text-[0.8125rem] text-linen/55 transition-colors hover:text-brass-soft"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-linen/12 pt-8 text-[0.75rem] text-linen/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Decorar. Projeto MVP.</p>
          <p>Feito com atenção aos detalhes — e às pessoas que moram neles.</p>
        </div>
      </div>
    </footer>
  );
}
