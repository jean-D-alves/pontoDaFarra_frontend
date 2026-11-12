"use client";

import { useId, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import Modal from "@/src/components/Modal";
import ProductFormField from "@/src/components/Admin/ProductFormField";
import { publish, getLegalErrorMessage } from "@/src/Handle/Legal";
import {
  LEGAL_DOCUMENT_TYPES,
  LEGAL_DOCUMENT_TYPE_ID,
  LEGAL_DOCUMENT_TYPE_LABEL,
  type LegalDocumentType,
} from "@/src/types/legal";
import {
  LEGAL_VERSION_MAX_LENGTH,
  validateLegalContent,
  validateLegalVersion,
} from "@/lib/legal";

type LegalPublishModalProps = {
  defaultType?: LegalDocumentType;
  initialContent?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function LegalPublishModal({
  defaultType = "PrivacyPolicy",
  initialContent = "",
  onClose,
  onSuccess,
}: LegalPublishModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const [type, setType] = useState<LegalDocumentType>(defaultType);
  const [version, setVersion] = useState("");
  const [content, setContent] = useState(initialContent);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const versionMessage = validateLegalVersion(version);
    const contentMessage = validateLegalContent(content);

    setVersionError(versionMessage);
    setContentError(contentMessage);

    if (versionMessage || contentMessage) return;

    setLoading(true);

    try {
      await publish({
        type: LEGAL_DOCUMENT_TYPE_ID[type],
        version: version.trim(),
        content,
      });

      onSuccess("Nova versão publicada com sucesso.");
    } catch (err) {
      setError(
        getLegalErrorMessage(
          err,
          "Não foi possível publicar o documento.",
        ),
      );
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
              Publicar nova versão
            </h2>
            <p id={descriptionId} className="text-sm text-muted">
              A nova versão passa a ser o documento vigente e será solicitada
              aos usuários que ainda não a aceitaram.
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
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="legal-publish-type"
              className="text-sm font-semibold text-black"
            >
              Tipo de documento
            </label>
            <select
              id="legal-publish-type"
              value={type}
              onChange={(event) =>
                setType(event.target.value as LegalDocumentType)
              }
              disabled={loading}
              className={`h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-black outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >
              {LEGAL_DOCUMENT_TYPES.map((documentType) => (
                <option key={documentType} value={documentType}>
                  {LEGAL_DOCUMENT_TYPE_LABEL[documentType]}
                </option>
              ))}
            </select>
          </div>

          <ProductFormField
            id="legal-publish-version"
            label="Versão"
            value={version}
            onChange={(nextVersion) => {
              setVersion(nextVersion);
              if (versionError) setVersionError(null);
            }}
            placeholder="ex.: 2026.1"
            helper={`Máximo de ${LEGAL_VERSION_MAX_LENGTH} caracteres.`}
            error={versionError ?? undefined}
            maxLength={LEGAL_VERSION_MAX_LENGTH}
            required
          />

          <ProductFormField
            id="legal-publish-content"
            label="Conteúdo"
            value={content}
            onChange={(nextContent) => {
              setContent(nextContent);
              if (contentError) setContentError(null);
            }}
            placeholder="Conteúdo em Markdown"
            helper="Aceita formatação em Markdown (títulos, listas, links e negrito)."
            error={contentError ?? undefined}
            multiline
            rows={14}
            required
          />

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
            >
              {error}
            </p>
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
              {loading ? "Publicando…" : "Publicar versão"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
