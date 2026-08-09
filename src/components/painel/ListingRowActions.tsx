"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, PencilLine, Trash2 } from "lucide-react";

import { deleteListingAction, setListingStatusAction } from "@/actions/listings";
import { LISTING_STATUS } from "@/lib/taxonomy";

export function ListingRowActions({
  id,
  status,
  title,
}: {
  id: string;
  status: string;
  title: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-1.5">
      {/* Troca de situação direto na lista */}
      <form action={setListingStatusAction} className="contents">
        <input type="hidden" name="id" value={id} />
        <select
          name="status"
          defaultValue={status}
          aria-label={`Situação de ${title}`}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="h-9 cursor-pointer rounded-full border border-sand-deep bg-canvas px-3 text-[0.75rem] text-bark outline-none transition-colors hover:border-dusk focus:border-brass"
        >
          {LISTING_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </form>

      <Link
        href={`/anuncios/${id}`}
        aria-label={`Ver ${title}`}
        className="grid h-9 w-9 place-items-center rounded-full border border-sand-deep text-dusk transition-colors hover:border-ink hover:text-ink"
      >
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>

      <Link
        href={`/painel/anuncios/${id}/editar`}
        aria-label={`Editar ${title}`}
        className="grid h-9 w-9 place-items-center rounded-full border border-sand-deep text-dusk transition-colors hover:border-ink hover:text-ink"
      >
        <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>

      {confirming ? (
        <form action={deleteListingAction} className="flex items-center gap-1.5">
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="h-9 rounded-full bg-danger px-3.5 text-[0.75rem] text-white transition-colors hover:bg-[#7f261d]"
          >
            Confirmar exclusão
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-9 rounded-full px-2.5 text-[0.75rem] text-dusk hover:text-ink"
          >
            Cancelar
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Excluir ${title}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-sand-deep text-dusk transition-colors hover:border-danger hover:text-danger"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
