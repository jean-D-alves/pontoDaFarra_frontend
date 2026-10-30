"use client";

import Image from "next/image";
import { resolveImageUrl } from "@/src/Handle/Image";
import type { CartItem } from "@/src/types/cart";
import { Trash } from "lucide-react";

import {
  updateCartItemQuantity,
  removeFromCart,
  getItemSubtotal,
} from "@/lib/cart";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type ProductCardCartProps = {
  data: CartItem;
};

export default function ProductCardCart({ data }: ProductCardCartProps) {
  const image = resolveImageUrl(data.imageUrl);

  const subtotal = getItemSubtotal(data);

  function increaseQuantity() {
    updateCartItemQuantity(data.productId, data.quantity + 1);
  }

  function decreaseQuantity() {
    if (data.quantity <= 1) {
      return;
    }

    updateCartItemQuantity(data.productId, data.quantity - 1);
  }

  function removeProduct() {
    removeFromCart(data.productId);
  }

  return (
    <article className="flex gap-4 rounded-2xl border border-line bg-white p-4">
      {/* Imagem */}
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={data.name}
            fill
            className="object-contain"
            sizes="112px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            Sem imagem
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{data.name}</h2>

          <p className="mt-1 text-sm text-gray-500">
            {currency.format(data.unitPrice)} cada
          </p>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantidade */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={data.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>

            <span className="min-w-8 text-center font-medium">
              {data.quantity}
            </span>

            <button
              type="button"
              onClick={increaseQuantity}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-lg transition hover:bg-gray-100"
            >
              +
            </button>
          </div>

          {/* Subtotal + apagar */}
          <div className="flex items-center gap-4">
            <strong className="text-lg text-gray-900">
              {currency.format(subtotal)}
            </strong>

            <button
              type="button"
              onClick={removeProduct}
              title="Remover produto"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
            >
              <Trash />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}