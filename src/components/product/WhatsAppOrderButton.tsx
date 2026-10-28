import { MessageCircle } from "lucide-react";
import { formatCurrency } from "@/src/Handle/Currency";

interface WhatsAppOrderButtonProps {
  productName: string;
  value: number;
  isAvailable: boolean;
}

/**
 * Monta o link "click to chat" oficial do WhatsApp (wa.me).
 * O número vem de NEXT_PUBLIC_WHATSAPP_NUMBER (somente dígitos, com DDI).
 */
function buildWhatsAppUrl(productName: string, value: number): string | null {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(
    /\D/g,
    "",
  );

  if (number.length < 10) return null;

  const message = `Olá! Quero pedir: ${productName} — ${formatCurrency(value)}`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

const buttonBase =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-7 text-base font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function WhatsAppOrderButton({
  productName,
  value,
  isAvailable,
}: WhatsAppOrderButtonProps) {
  if (!isAvailable) {
    return (
      <button
        type="button"
        disabled
        className={`${buttonBase} cursor-not-allowed bg-disabled-bg text-disabled-text`}
      >
        <MessageCircle aria-hidden="true" size={20} />
        Produto indisponível
      </button>
    );
  }

  const href = buildWhatsAppUrl(productName, value);

  if (!href) {
    return (
      <button
        type="button"
        disabled
        title="Número de WhatsApp não configurado"
        className={`${buttonBase} cursor-not-allowed bg-disabled-bg text-disabled-text`}
      >
        <MessageCircle aria-hidden="true" size={20} />
        WhatsApp não configurado
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${buttonBase} bg-brand-gradient text-stone-strong hover:opacity-90`}
    >
      <MessageCircle aria-hidden="true" size={20} />
      Pedir pelo WhatsApp
    </a>
  );
}
