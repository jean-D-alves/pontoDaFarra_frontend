"use client";

import { useId, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import Modal from "@/src/components/Modal";
import ProductFormField from "@/src/components/Admin/ProductFormField";
import { LegalApiError, getLegalErrorMessage, update } from "@/src/Handle/Legal";
import {
  LEGAL_DOCUMENT_TYPE_LABEL,
  type LegalDocument,
  type LegalDocumentType,
} from "@/src/types/legal";
import {
  LEGAL_VERSION_MAX_LENGTH,
  validateLegalContent,
  validateLegalVersion,
} from "@/lib/legal";

export type LegalNewVersionDraft = {
  type: LegalDocumentType;
  content: string;
};

type LegalEditModalProps = {
  legalDocument: LegalDocument;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onPublishNewVersion: (draft: LegalNewVersionDraft) => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function LegalEditModal({
  legalDocument,
  onClose,
  onSuccess,
  onPublishNewVersion,
}: LegalEditModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const [version, setVersion] = useState(legalDocument.version);
  const [content, setContent] = useState(legalDocument.content);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setConflict(false);

    const versionMessage = validateLegalVersion(version);
    const contentMessage = validateLegalContent(content);

    setVersionError(versionMessage);
    setContentError(contentMessage);

    if (versionMessage || contentMessage) return;

    setLoading(true);

    try {
      await update(legalDocument.legalDocumentId, {
        version: version.trim(),
        content,
      });

      onSuccess("Documento atualizado com sucesso.");
    } catch (err) {
      setError(
        getLegalErrorMessage(
          err,
          "Não foi possível atualizar o documento.",
        ),
      );

      if (err instanceof LegalApiError && err.status === 409) {
        setConflict(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      labelledBy={titleId}
      describedBy={descriptionId}
      onClose={onClose}
      closeOnOverlay={!loading}
      closeOnEscape={!loading}
      panelClassName="max-w-3xl"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-black">
              Editar documento
            </h2>
            <p id={descriptionId} className="text-sm text-muted">
              {LEGAL_DOCUMENT_TYPE_LABEL[legalDocument.type]} · versão{" "}
              {legalDocument.version}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
            className={`rounded-full p-2 text-muted transition hover:bg-surface hover:text-black disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
          aria-busy={loading}
        >
          <ProductFormField
            id="legal-edit-version"
            label="Versão"
            value={version}
            onChange={(nextVersion) => {
              setVersion(nextVersion);
              if (versionError) setVersionError(null);
              if (conflict) setConflict(false);
            }}
            placeholder="ex.: 2026.1"
            helper={`Máximo de ${LEGAL_VERSION_MAX_LENGTH} caracteres.`}
            error={versionError ?? undefined}
            maxLength={LEGAL_VERSION_MAX_LENGTH}
            required
          />

          <ProductFormField
            id="legal-edit-content"
            label="Conteúdo"
            value={content}
            onChange={(nextContent) => {
              setContent(nextContent);
              if (contentError) setContentError(null);
              if (conflict) setConflict(false);
            }}
            placeholder="Conteúdo em Markdown"
            helper="Aceita formatação em Markdown (títulos, listas, links e negrito)."
            error={contentError ?? undefined}
            multiline
            rows={14}
            required
          />

          {error && (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
            >
              <p>{error}</p>

              {conflict && (
                <button
                  type="button"
                  onClick={() =>
                    onPublishNewVersion({
                      type: legalDocument.type,
                      content,
                    })
                  }
                  className={`self-start rounded-lg bg-white px-3 py-1.5 font-semibold text-black ${focusRing}`}
                >
                  Publicar nova versão
                </button>
              )}
            </div>
          )}

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`min-h-[44px] flex-1 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-ink transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
            >
              {loading && (
                <LoaderCircle
                  aria-hidden="true"
                  size={16}
                  className="animate-spin"
                />
              )}
              {loading ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
