import Image from "next/image";
import Link from "next/link";
import { ImageOff, Trash2 } from "lucide-react";
import { getItemSubtotal } from "@/lib/cart";
import { formatCurrency } from "@/src/Handle/Currency";
import { resolveImageUrl } from "@/src/Handle/Image";
import type { CartItem } from "@/src/types/cart";
import QuantityStepper from "./QuantityStepper";

interface CartItemCardProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const placeholderStripes = {
  backgroundImage:
    "repeating-linear-gradient(135deg, var(--color-placeholder-a) 0 8px, var(--color-placeholder-b) 8px 16px)",
};

export default function CartItemCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemCardProps) {
  const { productId, name, unitPrice, quantity, imageUrl } = item;
  const resolvedImageUrl = resolveImageUrl(imageUrl);
  const productHref = `/produtos/${encodeURIComponent(productId)}`;

  return (
    <article className="flex gap-3 rounded-2xl border border-[#E7E5DF] bg-white p-4 sm:gap-4">
      <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-surface">
        {resolvedImageUrl ? (
          <Image
            src={resolvedImageUrl}
            alt={`Imagem de ${name}`}
            width={88}
            height={88}
            sizes="88px"
            className="h-[88px] w-[88px] object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-stone"
            style={placeholderStripes}
          >
            <ImageOff aria-hidden="true" size={24} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-sm font-semibold text-stone-strong sm:text-base">
              <Link
                href={productHref}
                className={`rounded hover:underline ${focusRing}`}
              >
                {name}
              </Link>
            </h2>
            <p className="mt-0.5 text-sm text-stone">
              {formatCurrency(unitPrice)} cada
            </p>
          </div>

          <p className="shrink-0 text-right text-sm font-bold text-stone-strong sm:text-base">
            <span className="sr-only">Subtotal do item: </span>
            {formatCurrency(getItemSubtotal(item))}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            productName={name}
            quantity={quantity}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
          />

          <button
            type="button"
            onClick={onRemove}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-unavailable-text transition hover:bg-unavailable-bg ${focusRing}`}
          >
            <Trash2 aria-hidden="true" size={16} />
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}
