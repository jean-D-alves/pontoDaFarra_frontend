export type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  orderId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  totalValue: number;
  createdAt: string;
  items: OrderItem[];
};
export type ProductOrderCount = {
  productId: string;
  productName: string;
  orderCount: number;
};

export type OrderMetrics = {
  byOrderCount: ProductOrderCount[];
};

export type OrderMetricsResponse = OrderMetrics;

export type OrdersResponse = Order[];
