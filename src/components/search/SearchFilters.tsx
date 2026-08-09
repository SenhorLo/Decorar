"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { CATEGORIES, CONDITIONS, SORT_OPTIONS, UFS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/** Monta a querystring ignorando valores vazios e sempre voltando à página 1. */
function buildQuery(current: URLSearchParams, patch: Record<string, string>) {
  const params = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(patch)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  params.delete("pagina");

  return params.toString();
}

export function SearchFilters({ total }: { total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [q, setQ] = useState(searchParams.get("q") ?? "");

  // Mantém o campo sincronizado quando a navegação vem de fora (chip, voltar).
  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  function apply(patch: Record<string, string>) {
    const query = buildQuery(searchParams, patch);
    startTransition(() => router.push(`/anuncios${query ? `?${query}` : ""}`));
  }

  const activeFilters = [
    ["categoria", CATEGORIES.find((c) => c.slug === searchParams.get("categoria"))?.label],
    ["condicao", CONDITIONS.find((c) => c.value === searchParams.get("condicao"))?.label],
    ["uf", searchParams.get("uf")],
    ["cidade", searchParams.get("cidade")],
    ["min", searchParams.get("min") && `a partir de R$ ${searchParams.get("min")}`],
    ["max", searchParams.get("max") && `até R$ ${searchParams.get("max")}`],
    ["entrega", searchParams.get("entrega") === "true" ? "Com entrega" : null],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <div className="space-y-5">
      {/* Barra de busca */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: q.trim() });
        }}
        className="flex gap-2"
        role="search"
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, marca, material…"
          aria-label="Buscar peças"
          maxLength={80}
          className="rounded-full"
        />
        <Button type="submit" className="shrink-0">
          Buscar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="shrink-0 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filtros
        </Button>
      </form>

      {/* Resumo + ordenação */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-dusk">
          <span className="tabular text-ink">{total}</span>{" "}
          {total === 1 ? "peça encontrada" : "peças encontradas"}
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="ordem" className="text-[0.75rem] uppercase tracking-[0.1em] text-mute">
            Ordenar
          </label>
          <Select
            id="ordem"
            value={searchParams.get("ordem") ?? "recentes"}
            onChange={(e) => apply({ ordem: e.target.value })}
            className="h-10 w-44 rounded-full"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Chips dos filtros ativos */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => apply({ [key]: "" })}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand-deep bg-canvas px-3 py-1.5 text-[0.75rem] text-bark transition-colors hover:border-clay hover:text-clay"
            >
              {label}
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}

          <button
            type="button"
            onClick={() => router.push("/anuncios")}
            className="px-2 text-[0.75rem] text-dusk underline-offset-4 hover:text-ink hover:underline"
          >
            Limpar tudo
          </button>
        </div>
      )}

      {/* Painel de filtros */}
      <div
        className={cn(
          "grid gap-5 rounded-lg border border-sand-deep/70 bg-canvas p-5 lg:grid-cols-6",
          !open && "hidden lg:grid",
        )}
      >
        <Field label="Categoria" htmlFor="f-categoria" className="lg:col-span-2">
          <Select
            id="f-categoria"
            value={searchParams.get("categoria") ?? ""}
            onChange={(e) => apply({ categoria: e.target.value })}
          >
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Estado" htmlFor="f-uf">
          <Select
            id="f-uf"
            value={searchParams.get("uf") ?? ""}
            onChange={(e) => apply({ uf: e.target.value })}
          >
            <option value="">Brasil</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Cidade" htmlFor="f-cidade">
          <Input
            id="f-cidade"
            defaultValue={searchParams.get("cidade") ?? ""}
            placeholder="Ex.: Curitiba"
            maxLength={60}
            onBlur={(e) => {
              if (e.target.value !== (searchParams.get("cidade") ?? "")) {
                apply({ cidade: e.target.value.trim() });
              }
            }}
          />
        </Field>

        <Field label="Conservação" htmlFor="f-condicao">
          <Select
            id="f-condicao"
            value={searchParams.get("condicao") ?? ""}
            onChange={(e) => apply({ condicao: e.target.value })}
          >
            <option value="">Qualquer</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Preço (R$)" htmlFor="f-min">
          <div className="flex items-center gap-2">
            <Input
              id="f-min"
              type="number"
              min={0}
              max={500000}
              placeholder="mín."
              defaultValue={searchParams.get("min") ?? ""}
              onBlur={(e) => apply({ min: e.target.value })}
              className="px-2.5 text-center"
            />
            <span className="text-mute">–</span>
            <Input
              type="number"
              min={0}
              max={500000}
              placeholder="máx."
              aria-label="Preço máximo"
              defaultValue={searchParams.get("max") ?? ""}
              onBlur={(e) => apply({ max: e.target.value })}
              className="px-2.5 text-center"
            />
          </div>
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bark lg:col-span-6">
          <input
            type="checkbox"
            checked={searchParams.get("entrega") === "true"}
            onChange={(e) => apply({ entrega: e.target.checked ? "true" : "" })}
            className="h-[1.05rem] w-[1.05rem] rounded-xs accent-[#a47b45]"
          />
          Mostrar apenas peças com entrega disponível
        </label>
      </div>
    </div>
  );
}
