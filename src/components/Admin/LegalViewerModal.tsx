"use client";

import { useId } from "react";
import { X } from "lucide-react";
import Modal from "@/src/components/Modal";
import LegalDocumentViewer from "@/src/components/legal/LegalDocumentViewer";
import type { LegalDocument } from "@/src/types/legal";

type LegalViewerModalProps = {
  legalDocument: LegalDocument;
  onClose: () => void;
};

export default function LegalViewerModal({
  legalDocument,
  onClose,
}: LegalViewerModalProps) {
  const titleId = useId();

  return (
    <Modal
      labelledBy={titleId}
      onClose={onClose}
      panelClassName="max-w-3xl"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <p className="text-sm font-semibold text-muted">
            Visualizar documento
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-2 text-muted transition hover:bg-surface hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <LegalDocumentViewer
            legalDocument={legalDocument}
            headingId={titleId}
            headingLevel="h2"
            compact
          />
        </div>
      </div>
    </Modal>
  );
}
