import type { OrderItem, OrderPayload } from "@/src/types/cart";
import type { OrderListResponse, OrdersResponse } from "../types/order";
import { MoreOrderResponse } from "../types/Products";
import type { OrderMetricsResponse } from "@/src/types/order";

export async function requestOrderChart(): Promise<OrderMetricsResponse> {
  const response = await fetch("/api/order/admin/chart", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao buscar as métricas de pedidos (${response.status}).`,
    );
  }

  return (await response.json()) as OrderMetricsResponse;
}

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

export async function requestOrderMe(): Promise<OrdersResponse> {
  const response = await fetch("/api/order/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar os pedidos (${response.status}).`);
  }

  return (await response.json()) as OrdersResponse;
}

export async function requestMoreOrder(): Promise<MoreOrderResponse> {
  const response = await fetch("/api/order/more-order", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar os pedidos (${response.status}).`);
  }

  return (await response.json()) as MoreOrderResponse;
}

export async function requestOrderAdmin(
  page = 1,
  pageSize = 5,
): Promise<OrderListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(`/api/order/admin?${query}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar os pedidos (${response.status}).`);
  }

  return (await response.json()) as OrderListResponse;
}

export async function requestOrderDelete(id: string): Promise<void> {
  const response = await fetch(`/api/order/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao excluir o pedido (${response.status}).`);
  }
}
