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
