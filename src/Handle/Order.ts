import type { OrderItem, OrderPayload } from "@/src/types/cart";

/**
 * Envia o pedido pelo proxy do Next (`app/api/order/route.ts`), que por sua vez
 * encaminha para o backend. O navegador nunca chama o backend diretamente.
 */
export async function requestOrder(
  order: Pick<OrderPayload, "totalValue" | "items">,
): Promise<boolean> {
  const body: { totalValue: number; items: OrderItem[] } = {
    totalValue: order.totalValue,
    items: order.items,
  };

  const response = await fetch("/api/order", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.ok;
}
