"use client";

import { clearCart, buildOrderPayload, getCartItemNames, getItemSubtotal } from "@/lib/cart";
import { formatCurrency } from "@/src/Handle/Currency";
import WhatsAppOrderButton from "@/src/components/WhatsAppOrderButton"; // ajuste o caminho
import type { CartItem } from "@/src/types/cart";
import { Trash2 } from "lucide-react";

type SideBarCartProps = {
  items: CartItem[];
};

export default function SideBarCart({ items }: SideBarCartProps) {
  const isEmpty = items.length === 0;

  const order = buildOrderPayload(items);
  const itemNames = getCartItemNames(items);
  const totalUnits = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <aside className="sticky top-6 flex w-[300px] shrink-0 flex-col gap-4 self-start rounded-2xl border border-line bg-white p-5">
      <h2 className="text-lg font-semibold">Resumo do pedido</h2>

      {isEmpty ? (
        <p className="text-sm text-gray-500">Nenhum item no carrinho.</p>
      ) : (
        <ul className="flex flex-col gap-3 border-b border-line pb-4">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="text-gray-700">
                <strong>{item.quantity}x</strong> {item.name}
              </span>

              <span className="shrink-0 font-medium text-gray-900">
                {formatCurrency(getItemSubtotal(item))}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Itens</span>
          <span>{totalUnits}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <strong className="text-xl text-gray-900">
            {formatCurrency(order.totalValue)}
          </strong>
        </div>
      </div>

      <WhatsAppOrderButton
        order={order}
        itemNames={itemNames}
        onOrderSent={clearCart}
      />

      <button
        type="button"
        onClick={clearCart}
        disabled={isEmpty}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 size={16} aria-hidden="true" />
        Limpar carrinho
      </button>
    </aside>
  );
}