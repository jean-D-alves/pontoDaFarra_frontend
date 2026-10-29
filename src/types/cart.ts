/**
 * Formato persistido em `localStorage` (chave `pontodafarra:cart`).
 * Mantemos os dados do produto "achatados" para que o carrinho e o pedido
 * compartilhem exatamente os mesmos campos.
 */
export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
};

export type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type OrderPayload = {
  totalValue: number;
  items: OrderItem[];
};
