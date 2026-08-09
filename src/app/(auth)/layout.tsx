import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { ProductPlate } from "@/components/ProductPlate";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      {/* Painel editorial — só em telas grandes */}
      <aside className="grain relative hidden overflow-hidden bg-forest text-linen lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="relative z-10 w-fit">
          <Logo tone="light" />
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-[2.75rem] font-light leading-[1.05] tracking-[-0.03em]">
            Uma peça de cada vez, uma casa de cada vez.
          </h2>
          <p className="mt-6 text-[0.9375rem] leading-relaxed text-linen/65">
            Entre para comprar, vender e acompanhar seus anúncios num só lugar.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {["sofas-e-poltronas", "iluminacao", "vasos-e-objetos"].map((slug, i) => (
            <div
              key={slug}
              className={`overflow-hidden rounded-md border border-linen/12 ${
                i === 1 ? "-translate-y-4" : ""
              }`}
            >
              <div className="aspect-square">
                <ProductPlate category={slug} seed={`auth-${i}`} />
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main id="conteudo" className="flex flex-col justify-center px-5 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[26rem]">
          <Link href="/" className="mb-10 inline-block lg:hidden">
            <Logo />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
