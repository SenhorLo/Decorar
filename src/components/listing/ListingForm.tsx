"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createListingAction, updateListingAction } from "@/actions/listings";
import { emptyState } from "@/actions/types";
import { ImageUploader } from "@/components/listing/ImageUploader";
import { Button } from "@/components/ui/button";
import {
  Checkbox,
  Field,
  FormError,
  FormSuccess,
  Input,
  Select,
  Textarea,
} from "@/components/ui/form";
import { CATEGORIES, CONDITIONS, LISTING_STATUS, MATERIALS, UFS } from "@/lib/taxonomy";

export type ListingFormValues = {
  id?: string;
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  condition: string;
  material: string;
  color: string;
  brand: string;
  city: string;
  state: string;
  status: string;
  negotiable: boolean;
  deliveryAvailable: boolean;
  images: string[];
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Salvando…" : label}
    </Button>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t border-sand pt-8 lg:grid-cols-[15rem_1fr] lg:gap-10">
      <div>
        <h2 className="font-display text-[1.25rem] leading-snug text-ink">{title}</h2>
        {description && (
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-dusk">{description}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function ListingForm({
  mode,
  defaults,
}: {
  mode: "create" | "edit";
  defaults: ListingFormValues;
}) {
  const action = mode === "create" ? createListingAction : updateListingAction;
  const [state, formAction] = useActionState(action, emptyState);

  // Após um erro, o servidor devolve os valores digitados para não perdê-los.
  const v = state.values;
  const value = <K extends keyof ListingFormValues>(key: K, fallback: string): string =>
    (v?.[key as string] as string | undefined) ?? fallback;

  const checked = (key: "negotiable" | "deliveryAvailable"): boolean =>
    v ? v[key] === "on" : defaults[key];

  const images = v?.images !== undefined ? v.images.split("|").filter(Boolean) : defaults.images;

  return (
    <form action={formAction} className="space-y-10" noValidate>
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <Section
        title="Fotos"
        description="A primeira imagem é a capa. Luz natural e fundo limpo fazem diferença real na hora de vender."
      >
        <ImageUploader initial={images} error={state.fieldErrors?.images} />
      </Section>

      <Section
        title="A peça"
        description="Seja específico: dimensões, procedência e defeitos. Anúncio honesto vende mais rápido."
      >
        <Field label="Título" htmlFor="title" error={state.fieldErrors?.title} required>
          <Input
            id="title"
            name="title"
            required
            maxLength={90}
            defaultValue={value("title", defaults.title)}
            invalid={Boolean(state.fieldErrors?.title)}
            placeholder="Ex.: Poltrona Mole em jacarandá restaurada"
          />
        </Field>

        <Field
          label="Descrição"
          htmlFor="description"
          error={state.fieldErrors?.description}
          hint="Dimensões, material, estado de conservação, motivo da venda e condições de retirada."
          required
        >
          <Textarea
            id="description"
            name="description"
            rows={8}
            required
            maxLength={3000}
            defaultValue={value("description", defaults.description)}
            invalid={Boolean(state.fieldErrors?.description)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Categoria" htmlFor="category" error={state.fieldErrors?.category} required>
            <Select
              id="category"
              name="category"
              required
              defaultValue={value("category", defaults.category)}
              invalid={Boolean(state.fieldErrors?.category)}
            >
              <option value="">Selecione…</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Conservação"
            htmlFor="condition"
            error={state.fieldErrors?.condition}
            required
          >
            <Select
              id="condition"
              name="condition"
              required
              defaultValue={value("condition", defaults.condition)}
              invalid={Boolean(state.fieldErrors?.condition)}
            >
              <option value="">Selecione…</option>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label} — {c.hint}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Material" htmlFor="material">
            <Select
              id="material"
              name="material"
              defaultValue={value("material", defaults.material)}
            >
              <option value="">Não informar</option>
              {MATERIALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Cor predominante" htmlFor="color">
            <Input
              id="color"
              name="color"
              maxLength={30}
              defaultValue={value("color", defaults.color)}
              placeholder="Ex.: Caramelo"
            />
          </Field>

          <Field label="Marca ou designer" htmlFor="brand" className="sm:col-span-2">
            <Input
              id="brand"
              name="brand"
              maxLength={40}
              defaultValue={value("brand", defaults.brand)}
              placeholder="Ex.: Knoll, Sergio Rodrigues, sem marca"
            />
          </Field>
        </div>
      </Section>

      <Section title="Preço" description="Você recebe o valor integral — o Decorar não cobra comissão.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Preço (R$)"
            htmlFor="price"
            error={state.fieldErrors?.priceCents}
            required
          >
            <Input
              id="price"
              name="price"
              inputMode="decimal"
              required
              defaultValue={value("price", defaults.price)}
              invalid={Boolean(state.fieldErrors?.priceCents)}
              placeholder="1.480,00"
              className="tabular"
            />
          </Field>

          <Field
            label="Preço original (R$)"
            htmlFor="originalPrice"
            error={state.fieldErrors?.originalPriceCents}
            hint="Opcional. Se preenchido, mostramos o desconto no anúncio."
          >
            <Input
              id="originalPrice"
              name="originalPrice"
              inputMode="decimal"
              defaultValue={value("originalPrice", defaults.originalPrice)}
              invalid={Boolean(state.fieldErrors?.originalPriceCents)}
              placeholder="1.890,00"
              className="tabular"
            />
          </Field>
        </div>

        <Checkbox
          name="negotiable"
          defaultChecked={checked("negotiable")}
          label="Aceito propostas"
          description="Mostra um selo indicando que o preço é negociável."
        />
      </Section>

      <Section
        title="Localização e entrega"
        description="Móvel grande é logística. Quem está perto negocia melhor."
      >
        <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
          <Field label="Cidade" htmlFor="city" error={state.fieldErrors?.city} required>
            <Input
              id="city"
              name="city"
              required
              maxLength={60}
              defaultValue={value("city", defaults.city)}
              invalid={Boolean(state.fieldErrors?.city)}
              placeholder="Ex.: Curitiba"
            />
          </Field>

          <Field label="Estado" htmlFor="state" error={state.fieldErrors?.state} required>
            <Select
              id="state"
              name="state"
              required
              defaultValue={value("state", defaults.state)}
              invalid={Boolean(state.fieldErrors?.state)}
            >
              <option value="">UF</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Checkbox
          name="deliveryAvailable"
          defaultChecked={checked("deliveryAvailable")}
          label="Posso entregar ou combinar frete"
          description="Aparece como filtro na busca — amplia bastante o alcance."
        />
      </Section>

      <Section
        title="Publicação"
        description="Rascunho fica salvo só para você. Pausado tira da busca sem apagar nada."
      >
        <Field label="Situação do anúncio" htmlFor="status">
          <Select id="status" name="status" defaultValue={value("status", defaults.status)}>
            {LISTING_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
      </Section>

      <div className="flex flex-wrap items-center gap-4 border-t border-sand pt-8">
        <SubmitButton label={mode === "create" ? "Publicar anúncio" : "Salvar alterações"} />
        <Link
          href={defaults.id ? `/anuncios/${defaults.id}` : "/painel/anuncios"}
          className="text-sm text-dusk underline-offset-4 hover:text-ink hover:underline"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
