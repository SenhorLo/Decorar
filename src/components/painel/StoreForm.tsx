"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ExternalLink } from "lucide-react";

import { upsertStoreAction } from "@/actions/store";
import { emptyState } from "@/actions/types";
import { Button } from "@/components/ui/button";
import { Field, FormError, FormSuccess, Input, Select, Textarea } from "@/components/ui/form";
import { UFS } from "@/lib/taxonomy";

export type StoreDefaults = {
  name: string;
  tagline: string;
  description: string;
  city: string;
  state: string;
  whatsapp: string;
  instagram: string;
  slug: string | null;
};

function SubmitButton({ exists }: { exists: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Salvando…" : exists ? "Salvar alterações" : "Criar loja"}
    </Button>
  );
}

export function StoreForm({ defaults }: { defaults: StoreDefaults }) {
  const [state, formAction] = useActionState(upsertStoreAction, emptyState);
  const exists = Boolean(defaults.slug);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <Field label="Nome da loja" htmlFor="name" error={state.fieldErrors?.name} required>
        <Input
          id="name"
          name="name"
          required
          maxLength={60}
          defaultValue={defaults.name}
          invalid={Boolean(state.fieldErrors?.name)}
          placeholder="Ex.: Atelier Helena"
        />
      </Field>

      <Field
        label="Frase de apresentação"
        htmlFor="tagline"
        error={state.fieldErrors?.tagline}
        hint="Uma linha que resume o que você vende. Aparece abaixo do nome."
      >
        <Input
          id="tagline"
          name="tagline"
          maxLength={90}
          defaultValue={defaults.tagline}
          placeholder="Mobiliário autoral e peças de projeto"
        />
      </Field>

      <Field label="Sobre a loja" htmlFor="description" error={state.fieldErrors?.description}>
        <Textarea
          id="description"
          name="description"
          rows={6}
          maxLength={800}
          defaultValue={defaults.description}
          placeholder="Conte como você seleciona as peças, se faz restauro, como funciona a retirada…"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <Field label="Cidade" htmlFor="store-city">
          <Input
            id="store-city"
            name="city"
            maxLength={60}
            defaultValue={defaults.city}
            placeholder="Ex.: Curitiba"
          />
        </Field>

        <Field label="Estado" htmlFor="store-state">
          <Select id="store-state" name="state" defaultValue={defaults.state}>
            <option value="">UF</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="WhatsApp"
          htmlFor="whatsapp"
          error={state.fieldErrors?.whatsapp}
          hint="Só números, com DDD. Usado no botão de contato dos anúncios."
        >
          <Input
            id="whatsapp"
            name="whatsapp"
            inputMode="tel"
            maxLength={20}
            defaultValue={defaults.whatsapp}
            placeholder="41988887777"
            className="tabular"
          />
        </Field>

        <Field label="Instagram" htmlFor="instagram" hint="Apenas o @, sem link.">
          <Input
            id="instagram"
            name="instagram"
            maxLength={40}
            defaultValue={defaults.instagram}
            placeholder="atelierhelena"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-sand pt-6">
        <SubmitButton exists={exists} />

        {defaults.slug && (
          <Link
            href={`/loja/${defaults.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-dusk underline-offset-4 hover:text-ink hover:underline"
          >
            Ver página pública
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </form>
  );
}
