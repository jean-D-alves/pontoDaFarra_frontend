import type { Order, OrderItem } from "@/src/types/order";

const orderDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

/** `createdAt` chega em UTC (ISO 8601); o Intl converte para o fuso local. */
export function formatOrderDate(createdAt: string): string {
  const date = new Date(createdAt);

  if (!Number.isFinite(date.getTime())) return "Data indisponível";

  return orderDateFormatter.format(date);
}

/** Código curto do pedido exibido no card: `#` + 8 primeiros caracteres. */
export function shortOrderId(orderId: string): string {
  const trimmed = orderId?.trim() ?? "";

  if (!trimmed) return "#—";

  return `#${trimmed.slice(0, 8)}`;
}

/** Soma das quantidades de todos os itens do pedido. */
export function countOrderItems(order: Order): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

/** Subtotal em centavos para evitar erro de ponto flutuante. */
export function getOrderItemSubtotal(item: OrderItem): number {
  return (Math.round(item.unitPrice * 100) * item.quantity) / 100;
}
