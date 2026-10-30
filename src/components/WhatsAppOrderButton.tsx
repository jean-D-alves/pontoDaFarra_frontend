"use client";

import { useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { formatOrderMessage, isOrderValid, saveLastOrder } from "@/lib/cart";
import { buildWhatsAppUrl, getWhatsAppNumber } from "@/lib/whatsapp";
import { useUser } from "@/src/Context/UserContext";
import { requestOrder } from "@/src/Handle/Order";
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
const SEND_ERROR_MESSAGE =
  "Não foi possível registrar o pedido. Tente novamente.";

const buttonBase =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-7 text-base font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

/**
 * Abre a aba do pedido ainda dentro do clique do usuário: se esperássemos o
 * `requestOrder`, o navegador bloquearia a nova aba por não haver mais gesto
 * do usuário. A aba fica em branco até o pedido ser registrado.
 */
function openCheckoutTab(): Window | null {
  if (typeof window === "undefined") return null;

  try {
    return window.open("", "_blank");
  } catch {
    return null;
  }
}

function goToCheckoutTab(tab: Window | null, url: string) {
  if (tab) {
    tab.opener = null;
    tab.location.href = url;
    return;
  }

  // Fallback para quando o navegador bloqueia pop-ups.
  window.location.assign(url);
}

export default function WhatsAppOrderButton({
  order,
  itemNames,
  isAvailable = true,
  label = "Pedir pelo WhatsApp",
  onOrderSent,
}: WhatsAppOrderButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const { user } = useUser();

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

  async function handleClick() {
    if (isDisabled || submittingRef.current) return;

    setError(null);

    if (!isOrderValid(order)) {
      setError(INVALID_ORDER_MESSAGE);
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    const checkoutTab = openCheckoutTab();

    try {
      const registered = await requestOrder({
        totalValue: order.totalValue,
        items: order.items,
      });

      if (!registered) {
        checkoutTab?.close();
        setError(SEND_ERROR_MESSAGE);
        return;
      }

      const message = formatOrderMessage(order, itemNames, {
        name: user?.name,
        phone: user?.phoneNumber,
      });
      const url = buildWhatsAppUrl(message);

      if (!url) {
        checkoutTab?.close();
        setError(SEND_ERROR_MESSAGE);
        return;
      }

      saveLastOrder(order, itemNames);
      goToCheckoutTab(checkoutTab, url);
      onOrderSent?.();
    } catch {
      checkoutTab?.close();
      setError(SEND_ERROR_MESSAGE);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled || isSubmitting}
        aria-busy={isSubmitting}
        className={
          isDisabled
            ? `${buttonBase} w-full cursor-not-allowed bg-disabled-bg text-disabled-text`
            : `${buttonBase} w-full bg-brand-gradient text-stone-strong hover:opacity-90 disabled:cursor-wait disabled:opacity-70`
        }
      >
        <MessageCircle aria-hidden="true" size={20} />
        {isSubmitting ? "Enviando pedido…" : (disabledReason ?? label)}
      </button>

      {error && (
        <p role="alert" className="text-sm font-medium text-unavailable-text">
          {error}
        </p>
      )}
    </div>
  );
}
