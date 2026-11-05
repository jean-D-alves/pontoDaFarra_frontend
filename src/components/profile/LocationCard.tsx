"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Location } from "@/src/types/location";

interface LocationCardProps {
  location: Location;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
  isDeleting?: boolean;
}

export default function LocationCard({
  location,
  onEdit,
  onDelete,
  isDeleting = false,
}: LocationCardProps) {
  return (
    <article className="rounded-2xl border border-[#E7E5DF] bg-white p-4 sm:p-5">
      <header className="min-w-0">
        <h3 className="text-lg font-bold leading-tight text-stone-strong">
          {location.name}
        </h3>
        <p className="mt-1 text-sm text-stone">
          {location.street}, {location.houseNumber}
        </p>
        <p className="mt-0.5 text-xs text-stone">
          {location.neighborhood} · {location.city} - {location.state}
        </p>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(location)}
            disabled={isDeleting}
            aria-label={`Editar local ${location.name}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line-warm px-4 text-sm font-semibold text-stone-strong transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60"
          >
            <Pencil aria-hidden="true" size={16} />
            Editar
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(location)}
            disabled={isDeleting}
            aria-busy={isDeleting}
            aria-label={`Excluir local ${location.name}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line-warm px-4 text-sm font-semibold text-unavailable-text transition hover:bg-unavailable-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60"
          >
            <Trash2 aria-hidden="true" size={16} />
            {isDeleting ? "Excluindo…" : "Excluir"}
          </button>
        )}
      </div>
    </article>
  );
}
