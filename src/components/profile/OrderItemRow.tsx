import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { formatCurrency } from "@/src/Handle/Currency";
import { resolveImageUrl } from "@/src/Handle/Image";
import { getOrderItemSubtotal } from "@/lib/order";
import type { OrderItem } from "@/src/types/order";
import type { Product } from "@/src/types/Products";

interface OrderItemRowProps {
  item: OrderItem;
  product: Product | null | undefined;
}

const thumbSize = 56;

export default function OrderItemRow({ item, product }: OrderItemRowProps) {
  const imageUrl = resolveImageUrl(product?.imageUrl ?? null);
  const name = product?.name ?? null;
  const subtotal = getOrderItemSubtotal(item);

  return (
    <div className="flex items-center gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name ? `Imagem de ${name}` : "Imagem do produto"}
            width={thumbSize}
            height={thumbSize}
            className="size-14 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-lg bg-disabled-bg text-stone">
            <ImageOff aria-hidden="true" size={20} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {product ? (
          <Link
            href={`/produtos/${product.productId}`}
            className="flex min-h-[44px] items-center text-sm font-semibold text-stone-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <span className="line-clamp-2">{name}</span>
          </Link>
        ) : (
          <p className="text-sm font-semibold text-stone">
            Produto indisponível
          </p>
        )}

        <p className="mt-0.5 text-sm text-stone">
          {item.quantity}x {formatCurrency(item.unitPrice)}
        </p>
      </div>

      <p className="shrink-0 text-sm font-bold text-stone-strong">
        {formatCurrency(subtotal)}
      </p>
    </div>
  );
}
