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

export type OrdersResponse = Order[];