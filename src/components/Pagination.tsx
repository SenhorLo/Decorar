import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  params,
}: {
  page: number;
  pageCount: number;
  /** Filtros atuais, sem `pagina`. */
  params: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== "pagina") search.set(key, value);
    }
    if (target > 1) search.set("pagina", String(target));
    return `/anuncios${search.size ? `?${search}` : ""}`;
  };

  // Janela deslizante de no máximo 5 números ao redor da página atual.
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i);

  const arrow =
    "grid h-10 w-10 place-items-center rounded-full border border-sand-deep text-bark transition-colors hover:border-ink";

  return (
    <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Paginação">
      {page > 1 ? (
        <Link href={href(page - 1)} className={arrow} aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(arrow, "opacity-35")} aria-hidden="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "tabular grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm transition-colors",
            p === page
              ? "bg-ink text-linen"
              : "border border-sand-deep text-bark hover:border-ink",
          )}
        >
          {p}
        </Link>
      ))}

      {page < pageCount ? (
        <Link href={href(page + 1)} className={arrow} aria-label="Próxima página">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(arrow, "opacity-35")} aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
