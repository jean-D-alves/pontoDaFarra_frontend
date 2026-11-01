"use client";

import { useId, useState } from "react";
import { LoaderCircle, Tag, X } from "lucide-react";
import Modal from "@/src/components/Modal";
import ProductFormField from "@/src/components/Admin/ProductFormField";
import { formatCurrency } from "@/src/Handle/Currency";
import { UpdateProductPromotion } from "@/src/Handle/Product";
import type { Product } from "@/src/types/Products";

type ProductPromotionModalProps = {
  product: Product;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

type PromotionMode = "save" | "remove";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function ProductPromotionModal({
  product,
  onClose,
  onSuccess,
}: ProductPromotionModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [mode, setMode] = useState<PromotionMode>("save");
  const [promotionalValue, setPromotionalValue] = useState(
    product.isPromotional ? String(product.value) : "",
  );
  const [normalValue, setNormalValue] = useState("");
  const [valueError, setValueError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRemoving = product.isPromotional && mode === "remove";
  const title = isRemoving
    ? "Remover promoção"
    : product.isPromotional
      ? "Editar promoção"
      : "Colocar em promoção";

  const submitLabel = isRemoving
    ? "Remover promoção"
    : product.isPromotional
      ? "Salvar promoção"
      : "Colocar em promoção";

  function changeMode(nextMode: PromotionMode) {
    setMode(nextMode);
    setValueError(null);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setValueError(null);

    const rawValue = isRemoving ? normalValue : promotionalValue;
    const numericValue = Number(rawValue.replace(",", "."));

    if (!rawValue.trim() || !Number.isFinite(numericValue) || numericValue <= 0) {
      setValueError("Informe um valor maior que zero.");
      return;
    }

    setLoading(true);

    try {
      await UpdateProductPromotion(product.productId, {
        promotionalValue: numericValue,
        isPromotional: !isRemoving,
      });

      onSuccess(
        isRemoving
          ? "Promoção removida com sucesso."
          : product.isPromotional
            ? "Promoção atualizada com sucesso."
            : "Produto colocado em promoção.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar a promoção.",
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
      panelClassName="max-w-md"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-semibold text-black">
            {title}
          </h2>
          <p id={descriptionId} className="truncate text-sm text-muted">
            {product.name}
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
        className="flex flex-col gap-4 p-5"
        aria-busy={loading}
      >
        <div className="flex items-center gap-2 rounded-xl bg-promo-bg px-3 py-2 text-sm text-promo-text">
          <Tag aria-hidden="true" size={16} className="shrink-0" />
          <span>
            Preço atual: <strong>{formatCurrency(product.value)}</strong>
            {product.isPromotional ? " (promocional)" : ""}
          </span>
        </div>

        {product.isPromotional && (
          <div
            role="group"
            aria-label="Ação da promoção"
            className="grid grid-cols-2 gap-2"
          >
            <button
              type="button"
              onClick={() => changeMode("save")}
              aria-pressed={mode === "save"}
              disabled={loading}
              className={`min-h-[44px] rounded-xl border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${
                mode === "save"
                  ? "border-brand bg-brand text-ink"
                  : "border-line bg-white text-body hover:bg-surface"
              }`}
            >
              Editar promoção
            </button>
            <button
              type="button"
              onClick={() => changeMode("remove")}
              aria-pressed={mode === "remove"}
              disabled={loading}
              className={`min-h-[44px] rounded-xl border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${
                mode === "remove"
                  ? "border-unavailable-text bg-unavailable-bg text-unavailable-text"
                  : "border-line bg-white text-body hover:bg-surface"
              }`}
            >
              Remover promoção
            </button>
          </div>
        )}

        {isRemoving ? (
          <>
            <div className="rounded-xl bg-surface px-3 py-2 text-xs text-body">
              O backend não guarda o preço anterior. Informe o valor que voltará
              a ser cobrado.
            </div>
            <ProductFormField
              id="product-normal-value"
              label="Preço normal (R$)"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="Ex.: 19.90"
              value={normalValue}
              onChange={(nextValue) => {
                setNormalValue(nextValue);
                if (valueError) setValueError(null);
              }}
              error={valueError ?? undefined}
              required
            />
          </>
        ) : (
          <ProductFormField
            id="product-promotional-value"
            label="Preço promocional (R$)"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="Ex.: 14.90"
            value={promotionalValue}
            onChange={(nextValue) => {
              setPromotionalValue(nextValue);
              if (valueError) setValueError(null);
            }}
            error={valueError ?? undefined}
            helper="O valor promocional substitui o preço atual do produto."
            required
          />
        )}

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
            {loading ? "Salvando…" : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
