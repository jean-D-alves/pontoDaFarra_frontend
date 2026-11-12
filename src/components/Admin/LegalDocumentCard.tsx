"use client";

import { Eye, Pencil } from "lucide-react";
import { formatLegalDateTime } from "@/lib/legal";
import type { LegalDocument } from "@/src/types/legal";

type LegalDocumentCardProps = {
  legalDocument: LegalDocument;
  onView: (legalDocument: LegalDocument) => void;
  onEdit: (legalDocument: LegalDocument) => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function LegalDocumentCard({
  legalDocument,
  onView,
  onEdit,
}: LegalDocumentCardProps) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-semibold text-black">
            Versão {legalDocument.version}
          </p>
          <p className="text-xs text-muted">
            Publicada em {formatLegalDateTime(legalDocument.publishedAt)}
          </p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
            legalDocument.isActive
              ? "bg-available-bg text-available-text"
              : "bg-surface text-stone"
          }`}
        >
          {legalDocument.isActive ? "Vigente" : "Histórico"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView(legalDocument)}
          className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-body transition hover:bg-surface ${focusRing}`}
        >
          <Eye aria-hidden="true" size={16} />
          Ver conteúdo
        </button>

        {legalDocument.isActive && (
          <button
            type="button"
            onClick={() => onEdit(legalDocument)}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-body transition hover:bg-surface ${focusRing}`}
          >
            <Pencil aria-hidden="true" size={16} />
            Editar
          </button>
        )}
      </div>
    </li>
  );
}
