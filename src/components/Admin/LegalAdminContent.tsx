"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, FileText, Plus, TriangleAlert } from "lucide-react";
import EmptyState from "@/src/components/EmptyState";
import Loading from "@/src/components/Loading";
import LegalDocumentCard from "@/src/components/Admin/LegalDocumentCard";
import LegalEditModal, {
  type LegalNewVersionDraft,
} from "@/src/components/Admin/LegalEditModal";
import LegalPublishModal from "@/src/components/Admin/LegalPublishModal";
import LegalViewerModal from "@/src/components/Admin/LegalViewerModal";
import { listAll, getLegalErrorMessage } from "@/src/Handle/Legal";
import {
  LEGAL_DOCUMENT_TYPES,
  LEGAL_DOCUMENT_TYPE_LABEL,
  type LegalDocument,
  type LegalDocumentType,
} from "@/src/types/legal";

const FEEDBACK_DURATION = 4000;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

type PublishState = {
  type: LegalDocumentType;
  content?: string;
};

export default function LegalAdminContent() {
  const [documents, setDocuments] = useState<LegalDocument[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [publishing, setPublishing] = useState<PublishState | null>(null);
  const [editing, setEditing] = useState<LegalDocument | null>(null);
  const [viewing, setViewing] = useState<LegalDocument | null>(null);

  useEffect(() => {
    let cancelled = false;

    listAll()
      .then((result) => {
        if (cancelled) return;

        setDocuments(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setError(
          getLegalErrorMessage(
            err,
            "Não foi possível carregar os documentos legais.",
          ),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => setFeedback(null), FEEDBACK_DURATION);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleChanged = useCallback((message?: string) => {
    if (message) setFeedback(message);
    setEditing(null);
    setPublishing(null);
    setError(null);
    setLoading(true);
    setReloadToken((current) => current + 1);
  }, []);

  function handlePublishFromEdit(draft: LegalNewVersionDraft) {
    setEditing(null);
    setPublishing({ type: draft.type, content: draft.content });
  }

  const groups = LEGAL_DOCUMENT_TYPES.map((type) => ({
    type,
    label: LEGAL_DOCUMENT_TYPE_LABEL[type],
    documents: (documents ?? [])
      .filter((document) => document.type === type)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
  }));

  const totalDocuments = documents?.length ?? 0;

  return (
    <section aria-busy={loading} className="flex w-full min-w-0 flex-col gap-4">
      <header className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="admin-legal-title" className="text-2xl font-bold">
            <strong>Documentos legais</strong>
          </h1>
          <p className="text-sm text-muted">
            Gerencie as versões da Política de Privacidade e dos Termos de Uso.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {documents && (
            <p className="text-sm text-muted">
              {totalDocuments} versão{totalDocuments === 1 ? "" : "ões"}{" "}
              publicada{totalDocuments === 1 ? "" : "s"}
            </p>
          )}

          <button
            type="button"
            onClick={() => setPublishing({ type: "PrivacyPolicy" })}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-ink transition hover:brightness-105 ${focusRing}`}
          >
            <Plus aria-hidden="true" size={16} />
            Publicar nova versão
          </button>
        </div>
      </header>

      {loading && documents && (
        <p className="text-xs text-muted">Atualizando documentos…</p>
      )}

      <div aria-live="polite" role="status">
        {feedback && (
          <p className="mb-2 flex items-center gap-2 rounded-xl bg-available-bg px-3 py-2 text-sm font-medium text-available-text">
            <CheckCircle2 aria-hidden="true" size={16} className="shrink-0" />
            {feedback}
          </p>
        )}
      </div>

      {error && documents && (
        <p
          role="alert"
          className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
        >
          {error}
        </p>
      )}

      {loading && !documents && (
        <div className="flex justify-center py-16" role="status">
          <Loading />
        </div>
      )}

      {!loading && !documents && error && (
        <EmptyState
          role="alert"
          icon={TriangleAlert}
          title="Documentos indisponíveis"
          description={error}
        />
      )}

      {!loading && !documents && !error && (
        <EmptyState
          icon={FileText}
          title="Nenhum documento por aqui"
          description="Ainda não há documentos legais publicados."
        />
      )}

      {documents && (
        <div className="flex flex-col gap-7">
          {groups.map((group) => (
            <section
              key={group.type}
              aria-labelledby={`legal-group-${group.type}`}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                <div>
                  <h2
                    id={`legal-group-${group.type}`}
                    className="text-lg font-bold text-black"
                  >
                    {group.label}
                  </h2>
                  <p className="text-xs text-muted">
                    {group.documents.length} versão
                    {group.documents.length === 1 ? "" : "ões"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPublishing({ type: group.type })}
                  className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-body transition hover:bg-surface ${focusRing}`}
                >
                  <Plus aria-hidden="true" size={16} />
                  Publicar nova versão
                </button>
              </div>

              {group.documents.length > 0 ? (
                <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {group.documents.map((legalDocument) => (
                    <LegalDocumentCard
                      key={legalDocument.legalDocumentId}
                      legalDocument={legalDocument}
                      onView={setViewing}
                      onEdit={setEditing}
                    />
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                  Nenhuma versão publicada para este documento.
                </p>
              )}
            </section>
          ))}
        </div>
      )}

      {publishing && (
        <LegalPublishModal
          defaultType={publishing.type}
          initialContent={publishing.content}
          onClose={() => setPublishing(null)}
          onSuccess={handleChanged}
        />
      )}

      {editing && (
        <LegalEditModal
          legalDocument={editing}
          onClose={() => setEditing(null)}
          onSuccess={handleChanged}
          onPublishNewVersion={handlePublishFromEdit}
        />
      )}

      {viewing && (
        <LegalViewerModal
          legalDocument={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </section>
  );
}
