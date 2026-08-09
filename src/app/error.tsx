"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button, buttonStyles } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Em produção isto iria para um serviço de observabilidade.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>

        <p className="mt-12 text-[0.6875rem] uppercase tracking-[0.22em] text-clay">
          Algo saiu do lugar
        </p>
        <h1 className="mt-3 font-display text-[2.5rem] font-light leading-tight tracking-[-0.03em] text-ink">
          Não conseguimos carregar esta página
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-dusk">
          O erro foi registrado. Tente de novo — se persistir, volte ao início e
          siga daí.
        </p>

        {error.digest && (
          <p className="mt-6 text-[0.6875rem] text-mute">
            Código: <span className="tabular">{error.digest}</span>
          </p>
        )}

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Tentar novamente</Button>
          <Link href="/" className={buttonStyles("outline", "md")}>
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
