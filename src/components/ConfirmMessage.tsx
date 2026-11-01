"use client";

import { LoaderCircle } from "lucide-react";
import Modal from "@/src/components/Modal";

export type ConfirmVariant = "danger" | "success";

interface ConfirmMessageProps {
  variant?: ConfirmVariant;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  error?: string | null;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const styles: Record<
  ConfirmVariant,
  { bar: string; title: string; confirm: string }
> = {
  // mensagem ruim: vermelho
  danger: {
    bar: "bg-red-600",
    title: "text-red-600",
    confirm: "bg-red-600 text-white",
  },
  // mensagem boa: degradê da marca
  success: {
    bar: "bg-brand-gradient",
    title: "text-ink",
    confirm: "bg-brand-gradient text-ink",
  },
};

export default function ConfirmMessage({
  variant = "danger",
  title,
  message,
  confirmLabel = "Ok",
  cancelLabel = "Cancelar",
  loading = false,
  loadingLabel = "Aguarde…",
  error,
  onConfirm,
  onCancel,
}: ConfirmMessageProps) {
  const style = styles[variant];

  return (
    <Modal
      role="alertdialog"
      labelledBy="confirm-title"
      describedBy={message ? "confirm-message" : undefined}
      onClose={onCancel}
      closeOnOverlay={!loading}
      closeOnEscape={!loading}
      panelClassName="max-w-sm"
    >
      <div className={`h-2 w-full ${style.bar}`} />
      <div className="flex flex-col gap-3 p-6">
        <h2 id="confirm-title" className={`text-xl font-bold ${style.title}`}>
          {title}
        </h2>
        {message && (
          <p id="confirm-message" className="text-body">
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            className={`cursor-pointer rounded-2xl border border-line-strong px-6 py-2 transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-2 font-semibold transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60 ${style.confirm} ${focusRing}`}
            onClick={() => onConfirm()}
            disabled={loading}
            aria-busy={loading}
          >
            {loading && (
              <LoaderCircle
                aria-hidden="true"
                size={16}
                className="animate-spin"
              />
            )}
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
