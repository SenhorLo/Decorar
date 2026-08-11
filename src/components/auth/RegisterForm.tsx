"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";

import { registerAction } from "@/actions/auth";
import { emptyState } from "@/actions/types";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormError, Input } from "@/components/ui/form";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Criando conta…" : "Criar conta"}
    </Button>
  );
}


export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, emptyState);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormError>{state.error}</FormError>

      <Field label="Nome" htmlFor="name" error={state.fieldErrors?.name} required>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          defaultValue={state.values?.name}
          invalid={Boolean(state.fieldErrors?.name)}
          placeholder="Como devemos te chamar"
        />
      </Field>

      <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email} required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          invalid={Boolean(state.fieldErrors?.email)}
          placeholder="voce@email.com"
        />
      </Field>

      <Field label="Senha" htmlFor="password" error={state.fieldErrors?.password} required>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className="pr-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={Boolean(state.fieldErrors?.password)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-sm text-dusk transition-colors hover:text-ink"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordRules value={password} />
      </Field>

      <Field
        label="Confirmar senha"
        htmlFor="confirmPassword"
        error={state.fieldErrors?.confirmPassword}
        required
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          invalid={Boolean(state.fieldErrors?.confirmPassword)}
          placeholder="••••••••"
        />
      </Field>

      <div>
        <Checkbox
          name="acceptTerms"
          required
          label={
            <>
              Li e aceito os termos de uso e a política de privacidade do
              Decorar.
            </>
          }
        />
        {state.fieldErrors?.acceptTerms && (
          <p className="mt-1.5 text-[0.75rem] text-danger">{state.fieldErrors.acceptTerms}</p>
        )}
      </div>

      <SubmitButton />

      <p className="pt-2 text-center text-sm text-dusk">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-brass underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
