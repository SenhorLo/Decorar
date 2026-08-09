import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";
import { safeRedirectPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeRedirectPath(params.next, "/painel");

  return (
    <>
      <header className="mb-9">
        <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
          Bem-vindo de volta
        </p>
        <h1 className="mt-3 font-display text-[2.25rem] font-light leading-tight tracking-[-0.025em] text-ink">
          Entrar na sua conta
        </h1>
      </header>

      <LoginForm nextPath={nextPath} />
    </>
  );
}
