import type { PagedResult } from "./pagination";

export type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  orderId: string;
  userId: string | null;
  customerName: string;
  customerPhone: string | null;
  totalValue: number;
  /** Presente nas respostas que incluem taxa de entrega (ex.: cria��o, meus pedidos). */
  deliveryFee?: number;
  createdAt: string;
  items: OrderItem[];
};

export type ProductOrderCount = {
  productId: string;
  productName: string;
  orderCount: number;
};

export type ProductQuantity = {
  productId: string;
  productName: string;
  quantity: number;
};

export type ProductValue = {
  productId: string;
  productName: string;
  totalValue: number;
};

export type OrderMetrics = {
  byQuantity: ProductQuantity[];
  byValue: ProductValue[];
  byOrderCount: ProductOrderCount[];
};

export type OrderMetricsResponse = OrderMetrics;

export type OrdersResponse = Order[];

/** Resposta paginada de `GET /orders/admin`. */
export type OrderListResponse = PagedResult<Order>;
