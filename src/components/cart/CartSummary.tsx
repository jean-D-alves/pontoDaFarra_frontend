"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/src/Handle/Currency";
import type { OrderPayload } from "@/src/types/cart";
import WhatsAppOrderButton from "../product/WhatsAppOrderButton";

interface CartSummaryProps {
  totalItems: number;
  order: OrderPayload;
  itemNames: Record<string, string>;
  onOrderSent: () => void;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function CartSummary({
  totalItems,
  order,
  itemNames,
  onOrderSent,
}: CartSummaryProps) {
  return (
    <aside
      aria-labelledby="resumo-pedido"
      className="rounded-[20px] border border-[#E7E5DF] bg-white p-6 lg:sticky lg:top-6"
    >
      <h2 id="resumo-pedido" className="text-lg font-bold text-stone-strong">
        Resumo do pedido
      </h2>

      <dl className="mt-4 flex flex-col gap-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-stone">Itens</dt>
          <dd className="font-semibold text-stone-strong">{totalItems}</dd>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[#E7E5DF] pt-4">
          <dt className="text-base font-semibold text-stone-strong">Total</dt>
          <dd className="text-[32px] font-bold leading-none text-stone-strong">
            {formatCurrency(order.totalValue)}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <WhatsAppOrderButton
          order={order}
          itemNames={itemNames}
          label="Finalizar pelo WhatsApp"
          onOrderSent={onOrderSent}
        />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-stone">
        Seu pedido será enviado por WhatsApp com todos os itens e o valor
        total.
      </p>

      <Link
        href="/categoria"
        className={`mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-semibold text-stone-strong transition hover:underline ${focusRing}`}
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Continuar comprando
      </Link>
    </aside>
  );
}
