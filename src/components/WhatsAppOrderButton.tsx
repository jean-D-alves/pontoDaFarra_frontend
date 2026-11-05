"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { isOrderValid } from "@/lib/cart";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { useUser } from "@/src/Context/UserContext";
import OrderWhatsAppModal from "@/src/components/OrderWhatsAppModal";
import type { OrderItem, OrderPayload } from "@/src/types/cart";

export type { OrderItem, OrderPayload };

interface WhatsAppOrderButtonProps {
  order: OrderPayload;
  itemNames: Record<string, string>;
  isAvailable?: boolean;
  label?: string;
  onOrderSent?: () => void;
}

const INVALID_ORDER_MESSAGE =
  "Pedido inválido. Revise os itens do carrinho e tente novamente.";

const buttonBase =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-7 text-base font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function WhatsAppOrderButton({
  order,
  itemNames,
  isAvailable = true,
  label = "Pedir pelo WhatsApp",
  onOrderSent,
}: WhatsAppOrderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const number = getWhatsAppNumber();
  const hasItems = order.items.length > 0;

  const disabledReason = !isAvailable
    ? "Produto indisponível"
    : !number
      ? "WhatsApp não configurado"
      : !hasItems
        ? "Carrinho vazio"
        : null;
  const isDisabled = disabledReason !== null;

  function handleClick() {
    if (isDisabled || userLoading) return;

    setError(null);

    if (!isOrderValid(order)) {
      setError(INVALID_ORDER_MESSAGE);
      return;
    }

    // O pedido pelo WhatsApp exige uma conta: sem usuário, vai para o login.
    if (!user) {
      router.push("/auth");
      return;
    }

    setIsModalOpen(true);
  }

  function handleClose() {
    setIsModalOpen(false);
  }

  function handleOrderSent() {
    setIsModalOpen(false);
    onOrderSent?.();
  }

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={
          isDisabled
            ? `${buttonBase} w-full cursor-not-allowed bg-disabled-bg text-disabled-text`
            : `${buttonBase} w-full bg-brand-gradient text-stone-strong hover:opacity-90`
        }
      >
        <MessageCircle aria-hidden="true" size={20} />
        {disabledReason ?? label}
      </button>

      {error && (
        <p role="alert" className="text-sm font-medium text-unavailable-text">
          {error}
        </p>
      )}

      {isModalOpen && (
        <OrderWhatsAppModal
          order={order}
          itemNames={itemNames}
          onClose={handleClose}
          onSent={handleOrderSent}
        />
      )}
    </div>
  );
}
