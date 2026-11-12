"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  TriangleAlert,
} from "lucide-react";
import EmptyState from "@/src/components/EmptyState";
import Loading from "@/src/components/Loading";
import { getConsents, getLegalErrorMessage } from "@/src/Handle/Legal";
import { formatLegalDateTime } from "@/lib/legal";
import {
  LEGAL_DOCUMENT_TYPE_LABEL,
  LEGAL_DOCUMENT_TYPE_PATH,
  type UserConsent,
} from "@/src/types/legal";

export default function LegalConsents() {
  const [consents, setConsents] = useState<UserConsent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getConsents()
      .then((result) => {
        if (cancelled) return;

        setError(null);
        setConsents(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setError(
          getLegalErrorMessage(
            err,
            "Não foi possível carregar seus aceites.",
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

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadToken((current) => current + 1);
  }, []);

  if (loading && !consents) {
    return (
      <div className="flex justify-center py-12" role="status">
        <Loading />
      </div>
    );
  }

  if (error && !consents) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          role="alert"
          icon={TriangleAlert}
          title="Aceites indisponíveis"
          description={error}
        />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={retry}
            className="min-h-[44px] rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!consents || consents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhum aceite registrado"
        description="Você ainda não possui aceites de documentos legais registrados."
      />
    );
  }

  const sortedConsents = [...consents].sort((a, b) =>
    b.acceptedAt.localeCompare(a.acceptedAt),
  );

  return (
    <div className="flex flex-col gap-3">
      <header>
        <h2 className="text-lg font-bold text-black">Meus aceites</h2>
        <p className="text-sm text-muted">
          Histórico de documentos legais que você aceitou.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
        >
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {sortedConsents.map((consent) => (
          <li
            key={consent.userConsentId}
            className="flex flex-col gap-2 rounded-2xl border border-line bg-background p-4"
          >
            <div className="flex items-start gap-2">
              <CheckCircle2
                aria-hidden="true"
                size={18}
                className="mt-0.5 shrink-0 text-available-text"
              />
              <div>
                <p className="font-semibold text-black">
                  {LEGAL_DOCUMENT_TYPE_LABEL[consent.type]}
                </p>
                <p className="text-sm text-muted">
                  Versão {consent.version} · Aceito em{" "}
                  {formatLegalDateTime(consent.acceptedAt)}
                </p>
              </div>
            </div>

            <Link
              href={LEGAL_DOCUMENT_TYPE_PATH[consent.type]}
              className="self-start text-sm font-semibold text-brand-deep underline underline-offset-2 transition hover:text-black"
            >
              Ver documento
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
