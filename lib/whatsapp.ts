/**
 * O número vem de NEXT_PUBLIC_WHATSAPP_NUMBER (somente dígitos, com DDI).
 * Abaixo de 10 dígitos consideramos não configurado.
 */
export function getWhatsAppNumber(): string | null {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(
    /\D/g,
    "",
  );

  return number.length >= 10 ? number : null;
}

/** Monta o link "click to chat" oficial do WhatsApp (wa.me). */
export function buildWhatsAppUrl(message: string): string | null {
  const number = getWhatsAppNumber();

  if (!number) return null;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
