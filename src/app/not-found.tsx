import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { ProductPlate } from "@/components/ProductPlate";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>

        <div className="mx-auto mt-10 w-52 overflow-hidden rounded-xl border border-sand-deep">
          <div className="aspect-4/3">
            <ProductPlate category="espelhos" seed="404" />
          </div>
        </div>

        <p className="mt-10 text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
          Erro 404
        </p>
        <h1 className="mt-3 font-display text-[2.5rem] font-light leading-tight tracking-[-0.03em] text-ink">
          Esta peça não está mais aqui
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-dusk">
          O anúncio pode ter sido vendido, pausado ou removido pelo vendedor.
          Mas o acervo é grande — vale dar uma olhada.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/anuncios" className={buttonStyles("primary", "md")}>
            Explorar peças
          </Link>
          <Link href="/" className={buttonStyles("outline", "md")}>
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
