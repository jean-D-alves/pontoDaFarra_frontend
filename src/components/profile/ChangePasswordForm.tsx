"use client";

import { useId, useState, type FormEvent } from "react";
import { LoaderCircle, X } from "lucide-react";
import Modal from "@/src/components/Modal";
import PasswordField from "@/src/components/PasswordField";
import {
  PasswordApiError,
  requestChangeOwnPassword,
} from "@/src/Handle/Password";
import { validatePasswordStrength } from "@/lib/password";
import type { PasswordFormField } from "@/src/types/password";

type ChangePasswordFormProps = {
  onClose: () => void;
  onSuccess: (message: string) => void;
};

const FIELD_ORDER: PasswordFormField[] = [
  "newPassword",
  "confirmPassword",
];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function ChangePasswordForm({
  onClose,
  onSuccess,
}: ChangePasswordFormProps) {
  const titleId = useId();
  const descriptionId = useId();
  const fieldIdPrefix = useId();

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

      if (strengthError) {
        nextErrors.newPassword = strengthError;
      }
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirme a nova senha.";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "As senhas não coincidem.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    setLoading(true);

    try {
      await requestChangeOwnPassword({ newPassword });

      setNewPassword("");
      setConfirmPassword("");
      setFieldErrors({});
      onSuccess("Senha alterada com sucesso.");
    } catch (err) {
      if (err instanceof PasswordApiError) {
        if (err.field === "form") {
          setFormError(err.message);
        } else {
          setFieldErrors({ [err.field]: err.message });
          document.getElementById(fieldId(err.field))?.focus();
        }
      } else {
        setFormError("Não foi possível alterar a senha. Tente novamente.");
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
              Alterar senha
            </h2>
            <p id={descriptionId} className="text-sm text-muted">
              Escolha uma nova senha para sua conta.
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
          noValidate
          aria-busy={loading}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
        >
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
              {loading ? "Alterando…" : "Alterar senha"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
