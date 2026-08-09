"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  changePasswordAction,
  deleteAccountAction,
  updateProfileAction,
} from "@/actions/profile";
import { emptyState } from "@/actions/types";
import { Button } from "@/components/ui/button";
import { Field, FormError, FormSuccess, Input, Select, Textarea } from "@/components/ui/form";
import { UFS } from "@/lib/taxonomy";

function Submit({ label, variant = "primary" }: { label: string; variant?: "primary" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? "Salvando…" : label}
    </Button>
  );
}

export function ProfileForm({
  defaults,
}: {
  defaults: { name: string; phone: string; city: string; state: string; bio: string };
}) {
  const [state, formAction] = useActionState(updateProfileAction, emptyState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <Field label="Nome" htmlFor="p-name" error={state.fieldErrors?.name} required>
        <Input
          id="p-name"
          name="name"
          required
          maxLength={80}
          defaultValue={defaults.name}
          invalid={Boolean(state.fieldErrors?.name)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[1fr_1fr_8rem]">
        <Field
          label="Telefone"
          htmlFor="p-phone"
          error={state.fieldErrors?.phone}
          hint="Aparece só depois que alguém clica em ver contato."
        >
          <Input
            id="p-phone"
            name="phone"
            inputMode="tel"
            maxLength={20}
            defaultValue={defaults.phone}
            placeholder="41988887777"
            className="tabular"
          />
        </Field>

        <Field label="Cidade" htmlFor="p-city">
          <Input id="p-city" name="city" maxLength={60} defaultValue={defaults.city} />
        </Field>

        <Field label="Estado" htmlFor="p-state">
          <Select id="p-state" name="state" defaultValue={defaults.state}>
            <option value="">UF</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Sobre você"
        htmlFor="p-bio"
        error={state.fieldErrors?.bio}
        hint="Aparece na lateral dos seus anúncios. Máximo de 400 caracteres."
      >
        <Textarea id="p-bio" name="bio" rows={4} maxLength={400} defaultValue={defaults.bio} />
      </Field>

      <Submit label="Salvar perfil" />
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, emptyState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <Field
        label="Senha atual"
        htmlFor="currentPassword"
        error={state.fieldErrors?.currentPassword}
        required
      >
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          invalid={Boolean(state.fieldErrors?.currentPassword)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nova senha"
          htmlFor="newPassword"
          error={state.fieldErrors?.newPassword}
          hint="Mínimo de 8 caracteres, com letra e número."
          required
        >
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            invalid={Boolean(state.fieldErrors?.newPassword)}
          />
        </Field>

        <Field
          label="Confirmar nova senha"
          htmlFor="confirmNewPassword"
          error={state.fieldErrors?.confirmPassword}
          required
        >
          <Input
            id="confirmNewPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            invalid={Boolean(state.fieldErrors?.confirmPassword)}
          />
        </Field>
      </div>

      <Submit label="Alterar senha" />
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, formAction] = useActionState(deleteAccountAction, emptyState);

  return (
    <form action={formAction} className="mt-5 space-y-4" noValidate>
      <FormError>{state.error}</FormError>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sua senha" htmlFor="del-password" error={state.fieldErrors?.password} required>
          <Input
            id="del-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            invalid={Boolean(state.fieldErrors?.password)}
          />
        </Field>

        <Field
          label="Digite EXCLUIR"
          htmlFor="del-confirmation"
          error={state.fieldErrors?.confirmation}
          required
        >
          <Input
            id="del-confirmation"
            name="confirmation"
            required
            placeholder="EXCLUIR"
            invalid={Boolean(state.fieldErrors?.confirmation)}
          />
        </Field>
      </div>

      <Submit label="Excluir minha conta" variant="danger" />
    </form>
  );
}
