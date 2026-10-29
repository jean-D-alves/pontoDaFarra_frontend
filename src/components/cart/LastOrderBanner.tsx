"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import {
  clearLastOrder,
  formatOrderMessage,
  getLastOrder,
  type LastOrder,
} from "@/lib/cart";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useUser } from "@/src/Context/UserContext";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const resendButton =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 text-base font-bold text-stone-strong transition hover:opacity-90";

function formatSentAt(createdAt: string): string {
  const date = new Date(createdAt);

  if (!Number.isFinite(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function LastOrderBanner() {
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const { user } = useUser();

  useEffect(() => {
    // Lê o localStorage só no cliente para não divergir do HTML do servidor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastOrder(getLastOrder());
  }, []);

  if (!lastOrder) return null;

  const url = buildWhatsAppUrl(
    formatOrderMessage(lastOrder.order, lastOrder.itemNames, {
      name: user?.name,
      phone: user?.phoneNumber,
    }),
  );
  const sentAt = formatSentAt(lastOrder.createdAt);

  function handleDismiss() {
    clearLastOrder();
    setLastOrder(null);
  }

  return (
    <section
      aria-labelledby="reenviar-pedido-titulo"
      className="mb-6 rounded-[20px] border border-line-warm bg-surface p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="reenviar-pedido-titulo"
            className="text-lg font-bold text-stone-strong"
          >
            Último pedido enviado
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-stone">
            Se o WhatsApp não abriu ou a mensagem não chegou a ser enviada
            {sentAt ? ` em ${sentAt}` : ""}, reenvie o mesmo pedido:
          </p>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Descartar último pedido"
          title="Descartar último pedido"
          className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-stone transition hover:bg-white ${focusRing}`}
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="mt-4">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${resendButton} ${focusRing}`}
          >
            <MessageCircle aria-hidden="true" size={20} />
            Reenviar pedido
          </a>
        ) : (
          <p className="text-sm font-medium text-unavailable-text">
            WhatsApp não configurado.
          </p>
        )}
      </div>
    </section>
  );
}
