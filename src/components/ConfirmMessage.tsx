"use client";
import { useEffect } from "react";

export type ConfirmVariant = "danger" | "success";

interface ConfirmMessageProps {
  variant?: ConfirmVariant;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

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
  onConfirm,
  onCancel,
}: ConfirmMessageProps) {
  const style = styles[variant];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-2 w-full ${style.bar}`} />
        <div className="flex flex-col gap-3 p-6">
          <h2 id="confirm-title" className={`text-xl font-bold ${style.title}`}>
            {title}
          </h2>
          {message && <p className="text-body">{message}</p>}

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              className="cursor-pointer rounded-2xl border border-line-strong px-6 py-2"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`cursor-pointer rounded-2xl px-6 py-2 font-semibold ${style.confirm}`}
              onClick={() => onConfirm()}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
