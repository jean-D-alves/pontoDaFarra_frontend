"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, X } from "lucide-react";
import Modal from "@/src/components/Modal";
import PasswordField from "@/src/components/PasswordField";
import { useUser } from "@/src/Context/UserContext";
import {
  PasswordApiError,
  requestAdminResetPassword,
} from "@/src/Handle/Password";
import { validatePasswordStrength } from "@/lib/password";
import type { User } from "@/src/types/User";
import type { PasswordFormField } from "@/src/types/password";

type ResetUserPasswordModalProps = {
  user: User;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

type Step = "form" | "confirm";

const FIELD_ORDER: PasswordFormField[] = ["newPassword", "confirmPassword"];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function ResetUserPasswordModal({
  user,
  onClose,
  onSuccess,
}: ResetUserPasswordModalProps) {
  const { user: currentUser, logout } = useUser();
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const fieldIdPrefix = useId();
  const confirmButtonId = `${fieldIdPrefix}-confirm`;
  const isSelf = currentUser?.userId === user.userId;

  const [step, setStep] = useState<Step>("form");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<PasswordFormField, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function fieldId(field: PasswordFormField): string {
    return `${fieldIdPrefix}-${field}`;
  }

  function clearFieldError(field: PasswordFormField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleChange(field: PasswordFormField, value: string) {
    if (field === "newPassword") setNewPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);

    clearFieldError(field);
    if (formError) setFormError(null);
  }

  function validate(): Partial<Record<PasswordFormField, string>> {
    const nextErrors: Partial<Record<PasswordFormField, string>> = {};

    if (!newPassword) {
      nextErrors.newPassword = "Informe a nova senha.";
    } else {
      const strengthError = validatePasswordStrength(newPassword);
      if (strengthError) nextErrors.newPassword = strengthError;
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirme a nova senha.";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "As senhas não coincidem.";
    }

    return nextErrors;
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setFormError(null);

    const nextErrors = validate();
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstInvalid) document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    setStep("confirm");
    requestAnimationFrame(() => {
      document.getElementById(confirmButtonId)?.focus();
    });
  }

  function handleBack() {
    if (loading) return;

    setFormError(null);
    setStep("form");
    requestAnimationFrame(() => {
      document.getElementById(fieldId("newPassword"))?.focus();
    });
  }

  async function handleConfirm() {
    if (loading) return;

    setFormError(null);
    setLoading(true);

    try {
      await requestAdminResetPassword(user.userId, { newPassword });

      setNewPassword("");
      setConfirmPassword("");
      setFieldErrors({});

      if (isSelf) {
        // O backend revoga todos os refresh tokens do usuário, inclusive os
        // do próprio admin, e não devolve novos cookies.
        try {
          await logout();
        } finally {
          router.push("/auth?motivo=senha-alterada");
        }
        return;
      }

      onSuccess(
        `Senha de ${user.name} redefinida. As sessões desse usuário foram encerradas.`,
      );
    } catch (err) {
      if (err instanceof PasswordApiError) {
        if (err.field === "newPassword" || err.field === "confirmPassword") {
          const field = err.field;
          setFieldErrors({ [field]: err.message });
          setStep("form");
          requestAnimationFrame(() => {
            document.getElementById(fieldId(field))?.focus();
          });
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError("Não foi possível redefinir a senha. Tente novamente.");
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
      panelClassName="max-w-lg"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-black">
              Redefinir senha
            </h2>
            <p id={descriptionId} className="truncate text-sm text-muted">
              {user.name}
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

        {step === "form" ? (
          <form
            onSubmit={handleReview}
            noValidate
            aria-busy={loading}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
          >
            <p className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text">
              Ao redefinir a senha, todas as sessões abertas deste usuário
              serão encerradas. Ele precisará entrar novamente com a nova
              senha.
            </p>

            {isSelf && (
              <p className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-body">
                Você está redefinindo a própria senha. Ao confirmar, você será
                desconectado(a) e precisará entrar novamente.
              </p>
            )}

            <PasswordField
              id={fieldId("newPassword")}
              label="Nova senha"
              autoComplete="new-password"
              placeholder="Digite a nova senha"
              value={newPassword}
              onChange={(value) => handleChange("newPassword", value)}
              error={fieldErrors.newPassword}
              helper="Mínimo de 8 caracteres, com pelo menos uma letra e um número."
              disabled={loading}
              required
            />

            <PasswordField
              id={fieldId("confirmPassword")}
              label="Confirmar nova senha"
              autoComplete="new-password"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(value) => handleChange("confirmPassword", value)}
              error={fieldErrors.confirmPassword}
              disabled={loading}
              required
            />

            {formError && (
              <p
                role="alert"
                className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
              >
                {formError}
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
                className={`min-h-[44px] flex-1 rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-ink transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
              >
                Revisar e continuar
              </button>
            </div>
          </form>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
            <h3 className="text-base font-semibold text-black">
              Confirmar redefinição
            </h3>

            <p className="text-sm text-body">
              Redefinir a senha de <strong>{user.name}</strong>? Todas as
              sessões abertas desse usuário serão encerradas e ele precisará
              entrar novamente com a nova senha.
            </p>

            {isSelf && (
              <p className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text">
                Esta é a sua própria conta. Você será desconectado(a) após a
                confirmação.
              </p>
            )}

            {formError && (
              <p
                role="alert"
                className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
              >
                {formError}
              </p>
            )}

            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className={`min-h-[44px] flex-1 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
              >
                Voltar
              </button>
              <button
                id={confirmButtonId}
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                aria-busy={loading}
                className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
              >
                {loading && (
                  <LoaderCircle
                    aria-hidden="true"
                    size={16}
                    className="animate-spin"
                  />
                )}
                {loading ? "Redefinindo…" : "Confirmar redefinição"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
