"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import { CATEGORIES, UFS } from "@/lib/taxonomy";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [uf, setUf] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (categoria) params.set("categoria", categoria);
    if (uf) params.set("uf", uf);

    router.push(`/anuncios${params.size ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-sand-deep/80 bg-canvas/85 p-2 shadow-[var(--shadow-soft)] backdrop-blur-md sm:rounded-full"
      role="search"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-dusk" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Poltrona de couro, mesa de jantar, luminária…"
            aria-label="O que você procura"
            maxLength={80}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-mute"
          />
        </div>

        <div className="hidden h-7 w-px bg-sand-deep sm:block" />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          aria-label="Categoria"
          className="cursor-pointer rounded-full bg-transparent px-4 py-2.5 text-sm text-bark outline-none sm:max-w-[10.5rem]"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>

        <div className="hidden h-7 w-px bg-sand-deep sm:block" />

        <select
          value={uf}
          onChange={(e) => setUf(e.target.value)}
          aria-label="Estado"
          className="cursor-pointer rounded-full bg-transparent px-4 py-2.5 text-sm text-bark outline-none sm:w-24"
        >
          <option value="">Brasil</option>
          {UFS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="h-12 shrink-0 rounded-full bg-ink px-7 text-sm font-medium text-linen transition-all duration-300 hover:bg-bark active:scale-[0.98]"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
