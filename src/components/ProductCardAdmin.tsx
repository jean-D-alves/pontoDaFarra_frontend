"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import ConfirmMessage from "@/src/components/ConfirmMessage";
import ProductActionChoiceModal from "@/src/components/Admin/ProductActionChoiceModal";
import ProductFullUpdateModal from "@/src/components/Admin/ProductFullUpdateModal";
import ProductPromotionModal from "@/src/components/Admin/ProductPromotionModal";
import {
  clearProductCache,
  DeleteProduct,
  SetProductAvailability,
} from "@/src/Handle/Product";
import { resolveImageUrl } from "@/src/Handle/Image";
import { Product } from "@/src/types/Products";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

type ActiveModal = "choice" | "full" | "promotion" | "delete" | null;

type ProductCardAdminProps = {
  product: Product;
  onChanged?: (message?: string) => void;
};

const actionButtonClass = `inline-flex min-h-[44px] items-center justify-center rounded-xl border border-line bg-white text-body transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export default function ProductCardAdmin({
  product,
  onChanged,
}: ProductCardAdminProps) {
  const imageUrl = resolveImageUrl(product.imageUrl);
  const href = `/produtos/${product.productId}`;

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const busy = availabilityLoading || deleteLoading;

  function openModal(modal: Exclude<ActiveModal, null>) {
    setActionError(null);
    setDeleteError(null);
    setActiveModal(modal);
  }

  function closeModal() {
    if (deleteLoading) return;

    setActiveModal(null);
    setDeleteError(null);
  }

  function handleSuccess(message: string) {
    clearProductCache(product.productId);
    setActiveModal(null);
    setActionError(null);
    onChanged?.(message);
  }

  async function handleToggleAvailability() {
    setActionError(null);
    setAvailabilityLoading(true);

    try {
      await SetProductAvailability(product.productId);
      clearProductCache(product.productId);
      onChanged?.(
        product.isAvailable
          ? "Produto marcado como indisponível."
          : "Produto marcado como disponível.",
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar a disponibilidade do produto.",
      );
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    setDeleteLoading(true);

    try {
      await DeleteProduct(product.productId);
      clearProductCache(product.productId);
      setActiveModal(null);
      onChanged?.("Produto excluído com sucesso.");
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o produto.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <Link
        href={href}
        aria-label={`Ver detalhes de ${product.name}`}
        className={`relative block aspect-square w-full shrink-0 overflow-hidden bg-surface ${focusRing}`}
      >
        {product.isPromotional && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-brand px-2 py-1 text-xs font-bold text-black">
            Oferta
          </span>
        )}

        {!product.isAvailable && (
          <span className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm font-semibold text-black">
            Indisponível
          </span>
        )}

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-2"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-muted">
            Sem imagem
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-black">
          <Link href={href} className={`rounded ${focusRing}`}>
            {product.name}
          </Link>
        </h3>

        {product.description && (
          <p className="line-clamp-2 text-xs text-muted">
            {product.description}
          </p>
        )}

        <p className="mt-auto pt-2 text-sm font-bold text-black md:text-xl">
          {currency.format(Number(product.value))}
        </p>

        <div className="mt-1 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => openModal("choice")}
            disabled={busy}
            aria-label={`Alterar ${product.name}`}
            title="Alterar"
            className={actionButtonClass}
          >
            <Pencil aria-hidden="true" size={18} />
          </button>

          <button
            type="button"
            onClick={handleToggleAvailability}
            disabled={busy}
            aria-label={
              product.isAvailable
                ? `Marcar ${product.name} como indisponível`
                : `Marcar ${product.name} como disponível`
            }
            title={
              product.isAvailable
                ? "Marcar como indisponível"
                : "Marcar como disponível"
            }
            aria-busy={availabilityLoading}
            className={actionButtonClass}
          >
            {availabilityLoading ? (
              <LoaderCircle
                aria-hidden="true"
                size={18}
                className="animate-spin"
              />
            ) : product.isAvailable ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>

          <button
            type="button"
            onClick={() => openModal("delete")}
            disabled={busy}
            aria-label={`Excluir ${product.name}`}
            title="Excluir"
            className={`${actionButtonClass} text-unavailable-text hover:bg-unavailable-bg`}
          >
            <Trash2 aria-hidden="true" size={18} />
          </button>
        </div>

        {actionError && (
          <p
            role="alert"
            className="mt-1 rounded-lg bg-unavailable-bg px-2 py-1 text-xs font-medium text-unavailable-text"
          >
            {actionError}
          </p>
        )}
      </div>

      {activeModal === "choice" && (
        <ProductActionChoiceModal
          product={product}
          onClose={closeModal}
          onChooseFull={() => setActiveModal("full")}
          onChoosePromotion={() => setActiveModal("promotion")}
        />
      )}

      {activeModal === "full" && (
        <ProductFullUpdateModal
          product={product}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      {activeModal === "promotion" && (
        <ProductPromotionModal
          product={product}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      {activeModal === "delete" && (
        <ConfirmMessage
          title="Excluir produto"
          message={`Tem certeza que deseja excluir "${product.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          loading={deleteLoading}
          loadingLabel="Excluindo…"
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
    </article>
  );
}
