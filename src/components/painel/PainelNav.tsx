"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, Package, Settings, Store } from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/painel", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/painel/anuncios", label: "Meus anúncios", icon: Package },
  { href: "/painel/loja", label: "Minha loja", icon: Store },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/painel/configuracoes", label: "Configurações", icon: Settings },
];

export function PainelNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Painel" className="lg:sticky lg:top-24">
      <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-[0.875rem] transition-colors",
                  active
                    ? "bg-canvas text-ink shadow-[var(--shadow-inset-line)]"
                    : "text-dusk hover:bg-canvas/60 hover:text-ink",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
