"use client";

import { useEffect, useId, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import Modal from "@/src/components/Modal";
import { requestUserById } from "@/src/Handle/User";
import type { User } from "@/src/types/User";

type UserDetailModalProps = {
  userId: string;
  onClose: () => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="text-sm text-black">{children}</dd>
    </div>
  );
}

export default function UserDetailModal({
  userId,
  onClose,
}: UserDetailModalProps) {
  const titleId = useId();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    requestUserById(userId)
      .then((result) => {
        if (!cancelled) setUser(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o usuário.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <Modal labelledBy={titleId} onClose={onClose} panelClassName="max-w-lg">
      <div className="flex max-h-[90vh] flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-black">
              Detalhes do usuário
            </h2>
            <p className="truncate text-sm text-muted">
              Informações cadastradas na conta.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className={`rounded-full p-2 text-muted transition hover:bg-surface hover:text-black ${focusRing}`}
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
          {loading && (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-8 text-sm text-muted"
            >
              <LoaderCircle
                aria-hidden="true"
                size={18}
                className="animate-spin"
              />
              Carregando…
            </div>
          )}

          {!loading && error && (
            <p
              role="alert"
              className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
            >
              {error}
            </p>
          )}

          {!loading && user && (
            <dl className="flex flex-col gap-3">
              <DetailRow label="Nome">{user.name}</DetailRow>
              <DetailRow label="E-mail">{user.email}</DetailRow>
              <DetailRow label="Telefone">
                {user.phoneNumber || "Não informado"}
              </DetailRow>
              <DetailRow label="Perfil">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    user.role === "Admin"
                      ? "bg-brand text-black"
                      : "bg-surface text-body"
                  }`}
                >
                  {user.role === "Admin" ? "Administrador" : "Cliente"}
                </span>
              </DetailRow>
              <DetailRow label="ID">
                <span className="break-all font-mono text-xs">{user.userId}</span>
              </DetailRow>
            </dl>
          )}
        </div>

        <div className="border-t border-line p-5">
          <button
            type="button"
            onClick={onClose}
            className={`min-h-[44px] w-full rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface ${focusRing}`}
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
