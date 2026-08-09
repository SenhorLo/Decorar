/**
 * Esqueleto do anúncio.
 *
 * Sem isto, a navegação para um anúncio fica sem retorno visual enquanto o
 * servidor responde — e a impressão é a de que o clique não funcionou.
 */
export default function LoadingListing() {
  return (
    <div className="mx-auto max-w-[88rem] px-5 py-10 sm:px-8 sm:py-14" aria-busy="true">
      <span className="sr-only" role="status">
        Carregando anúncio…
      </span>

      <div className="h-4 w-40 animate-pulse rounded-full bg-sand/70" />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <div className="aspect-4/3 animate-pulse rounded-xl bg-sand/60" />

          <div className="mt-3 grid grid-cols-5 gap-3 sm:grid-cols-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-md bg-sand/50" />
            ))}
          </div>

          <div className="mt-12 space-y-3">
            <div className="h-6 w-40 animate-pulse rounded-full bg-sand/70" />
            {[100, 96, 88, 92, 60].map((w, i) => (
              <div
                key={i}
                className="h-3.5 animate-pulse rounded-full bg-sand/45"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>

        <aside>
          <div className="rounded-xl border border-sand-deep/70 bg-canvas p-6 sm:p-8">
            <div className="flex gap-2">
              <div className="h-6 w-28 animate-pulse rounded-full bg-sand/70" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-sand/50" />
            </div>
            <div className="mt-5 h-8 w-4/5 animate-pulse rounded-full bg-sand/70" />
            <div className="mt-3 h-8 w-3/5 animate-pulse rounded-full bg-sand/60" />
            <div className="mt-7 h-10 w-48 animate-pulse rounded-full bg-sand/70" />
            <div className="mt-8 h-13 w-full animate-pulse rounded-full bg-sand/60" />
          </div>

          <div className="mt-5 h-40 animate-pulse rounded-xl border border-sand-deep/70 bg-canvas" />
        </aside>
      </div>
    </div>
  );
}
