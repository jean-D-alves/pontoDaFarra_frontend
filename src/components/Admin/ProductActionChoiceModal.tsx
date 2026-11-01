"use client";

import { useId } from "react";
import { ChevronRight, Pencil, Tag, X } from "lucide-react";
import Modal from "@/src/components/Modal";
import type { Product } from "@/src/types/Products";

type ProductActionChoiceModalProps = {
  product: Product;
  onClose: () => void;
  onChooseFull: () => void;
  onChoosePromotion: () => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function ProductActionChoiceModal({
  product,
  onClose,
  onChooseFull,
  onChoosePromotion,
}: ProductActionChoiceModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      labelledBy={titleId}
      describedBy={descriptionId}
      onClose={onClose}
      panelClassName="max-w-md"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-semibold text-black">
            Atualizar produto
          </h2>
          <p id={descriptionId} className="truncate text-sm text-muted">
            {product.name}
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

      <div className="flex flex-col gap-3 p-5">
        <button
          type="button"
          onClick={onChooseFull}
          className={`flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left transition hover:bg-surface ${focusRing}`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-black">
            <Pencil aria-hidden="true" size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-black">
              Alterar produto por inteiro
            </span>
            <span className="block text-sm text-muted">
              Nome, descrição, valor, categoria e imagem.
            </span>
          </span>
          <ChevronRight
            aria-hidden="true"
            size={18}
            className="shrink-0 text-muted"
          />
        </button>

        <button
          type="button"
          onClick={onChoosePromotion}
          className={`flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left transition hover:bg-surface ${focusRing}`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-promo-bg text-promo-text">
            <Tag aria-hidden="true" size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-black">
              {product.isPromotional
                ? "Editar ou remover promoção"
                : "Apenas colocar em promoção"}
            </span>
            <span className="block text-sm text-muted">
              {product.isPromotional
                ? "Altere o preço promocional ou volte ao preço normal."
                : "Defina o preço promocional do produto."}
            </span>
          </span>
          <ChevronRight
            aria-hidden="true"
            size={18}
            className="shrink-0 text-muted"
          />
        </button>
      </div>
    </Modal>
  );
}
