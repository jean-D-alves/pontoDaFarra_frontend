"use client";

import { useId, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { formatCurrency } from "@/src/Handle/Currency";
import { countOrderItems, formatOrderDate, shortOrderId } from "@/lib/order";
import type { Order } from "@/src/types/order";
import type { Product } from "@/src/types/Products";
import OrderItemRow from "./OrderItemRow";

interface OrderCardProps {
  order: Order;
  products: Record<string, Product | null>;
  defaultExpanded?: boolean;
  onDelete?: (order: Order) => void;
  isDeleting?: boolean;
}

export default function OrderCard({
  order,
  products,
  defaultExpanded = false,
  onDelete,
  isDeleting = false,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const itemsListId = useId();
  const totalItems = countOrderItems(order);

  return (
    <article className="rounded-2xl border border-[#E7E5DF] bg-white p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <time
            dateTime={order.createdAt}
            className="block text-sm font-semibold text-stone-strong"
          >
            {formatOrderDate(order.createdAt)}
          </time>
          <span className="mt-1 block font-mono text-xs text-stone">
            {shortOrderId(order.orderId)}
          </span>
        </div>

        <p className="text-lg font-bold leading-none text-stone-strong">
          {formatCurrency(order.totalValue)}
        </p>
      </header>

      <p className="mt-3 text-sm text-stone">
        {totalItems} {totalItems === 1 ? "item" : "itens"}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls={itemsListId}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line-warm px-4 text-sm font-semibold text-stone-strong transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          {expanded ? "Ocultar itens" : "Ver itens"}
          <ChevronDown
            aria-hidden="true"
            size={16}
            className={expanded ? "rotate-180 transition" : "transition"}
          />
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(order)}
            disabled={isDeleting}
            aria-busy={isDeleting}
            aria-label={`Excluir pedido ${shortOrderId(order.orderId)}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line-warm px-4 text-sm font-semibold text-unavailable-text transition hover:bg-unavailable-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60"
          >
            <Trash2 aria-hidden="true" size={16} />
            {isDeleting ? "Excluindo…" : "Excluir"}
          </button>
        )}
      </div>

      {expanded && (
        <ul
          id={itemsListId}
          className="mt-4 flex flex-col gap-3 border-t border-line-warm pt-4"
        >
          {order.items.map((item, index) => (
            <li key={`${item.productId}-${index}`}>
              <OrderItemRow
                item={item}
                product={products[item.productId] ?? null}
              />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
