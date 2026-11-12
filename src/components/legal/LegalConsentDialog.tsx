"use client";

import { useId, useState } from "react";
import { CheckCircle2, ExternalLink, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Modal from "@/src/components/Modal";
import LegalMarkdown from "@/src/components/legal/LegalMarkdown";
import { accept, getLegalErrorMessage, LegalApiError } from "@/src/Handle/Legal";
import { formatLegalDate } from "@/lib/legal";
import {
  LEGAL_DOCUMENT_TYPE_LABEL,
  LEGAL_DOCUMENT_TYPE_PATH,
  type LegalDocument,
} from "@/src/types/legal";

type LegalConsentDialogProps = {
  pending: LegalDocument[];
  onAccepted: () => Promise<void> | void;
  onRefresh: () => Promise<void> | void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function LegalConsentDialog({
  pending,
  onAccepted,
  onRefresh,
}: LegalConsentDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!accepted) {
      setError("Você precisa marcar que leu e aceitou os documentos.");
      return;
    }

    setLoading(true);

    try {
      await accept(pending.map((document) => document.legalDocumentId));
      await onAccepted();
    } catch (err) {
      setError(
        getLegalErrorMessage(
          err,
          "Não foi possível registrar o aceite. Tente novamente.",
        ),
      );

      if (err instanceof LegalApiError) {
        if (err.status === 404 || err.status === 409) {
          await onRefresh();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      labelledBy={titleId}
      describedBy={descriptionId}
      onClose={() => {}}
      closeOnOverlay={false}
      closeOnEscape={false}
      panelClassName="max-w-2xl"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="bg-brand-gradient px-6 py-5">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <ShieldCheck aria-hidden="true" size={18} />
            Atualização necessária
          </span>
          <h2
            id={titleId}
            className="mt-2 text-2xl font-bold leading-tight text-ink"
          >
            Revise e aceite os documentos legais
          </h2>
          <p id={descriptionId} className="mt-1 text-sm text-ink/80">
            Para continuar usando o Ponto da Farra, leia e aceite os documentos
            atualizados abaixo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
          aria-busy={loading}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
            {pending.map((document) => (
              <section
                key={document.legalDocumentId}
                aria-labelledby={`legal-consent-${document.legalDocumentId}`}
                className="rounded-xl border border-line bg-background p-4"
              >
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3
                      id={`legal-consent-${document.legalDocumentId}`}
                      className="text-base font-semibold text-stone-strong"
                    >
                      {LEGAL_DOCUMENT_TYPE_LABEL[document.type]}
                    </h3>
                    <p className="text-xs text-muted">
                      Versão {document.version} · Publicado em{" "}
                      {formatLegalDate(document.publishedAt)}
                    </p>
                  </div>

                  <Link
                    href={LEGAL_DOCUMENT_TYPE_PATH[document.type]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-deep underline underline-offset-2 transition hover:text-black"
                  >
                    Abrir em nova aba
                    <ExternalLink aria-hidden="true" size={14} />
                  </Link>
                </header>

                <details className="mt-3">
                  <summary
                    className={`cursor-pointer rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-body transition hover:bg-line-soft ${focusRing}`}
                  >
                    Ler conteúdo
                  </summary>
                  <div className="mt-3 max-h-64 overflow-y-auto pr-2 text-sm">
                    <LegalMarkdown content={document.content} />
                  </div>
                </details>
              </section>
            ))}

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-line px-6 py-4">
            <label className="flex items-start gap-2 text-sm text-body">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                aria-required="true"
                className="mt-0.5 h-4 w-4 shrink-0 accent-black"
              />
              <span>
                Li e concordo com{" "}
                {pending.length === 1
                  ? "o documento legal acima"
                  : "os documentos legais acima"}
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 text-sm font-semibold text-ink transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
            >
              {loading ? (
                <LoaderCircle
                  aria-hidden="true"
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2 aria-hidden="true" size={16} />
              )}
              {loading ? "Registrando aceite…" : "Aceitar e continuar"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
