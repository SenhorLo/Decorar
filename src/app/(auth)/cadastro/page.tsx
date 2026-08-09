import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false, follow: false },
};

export default function CadastroPage() {
  return (
    <>
      <header className="mb-9">
        <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
          Leva menos de um minuto
        </p>
        <h1 className="mt-3 font-display text-[2.25rem] font-light leading-tight tracking-[-0.025em] text-ink">
          Criar sua conta
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-dusk">
          Anuncie quantas peças quiser, salve favoritos e monte a sua loja — tudo
          gratuito.
        </p>
      </header>

      <RegisterForm />
    </>
  );
}
