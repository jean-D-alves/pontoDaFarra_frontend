"use client";

import { useId, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import Modal from "@/src/components/Modal";
import ProductFormField from "@/src/components/Admin/ProductFormField";
import { CreateCategory } from "@/src/Handle/Category";
import { CATEGORY_NAME_HINT, validateCategoryName } from "@/lib/categoryName";

type CategoryCreateModalProps = {
  onClose: () => void;
  onSuccess: (message: string) => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function CategoryCreateModal({
  onClose,
  onSuccess,
}: CategoryCreateModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const validationError = validateCategoryName(trimmedName);

    if (validationError) {
      setNameError(validationError);
      return;
    }

    setLoading(true);

    try {
      await CreateCategory(trimmedName);
      onSuccess("Categoria criada com sucesso.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a categoria.",
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
      panelClassName="max-w-lg"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-black">
              Adicionar categoria
            </h2>
            <p id={descriptionId} className="text-sm text-muted">
              Crie uma nova categoria para organizar os produtos.
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
            id="new-category-name"
            label="Nome"
            value={name}
            onChange={(nextName) => {
              setName(nextName);
              if (nameError) setNameError(null);
            }}
            placeholder="ex.: bebidas-geladas"
            helper={CATEGORY_NAME_HINT}
            error={nameError ?? undefined}
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
              {loading ? "Salvando…" : "Criar categoria"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
