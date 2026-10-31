export type Product = {
  productId: string;
  name: string;
  description: string | null;
  value: number;
  isAvailable: boolean;
  isPromotional: boolean;
  imageUrl: string | null;
  categoryId: string;
};

export type ProductOrderCount = {
  productId: string;
  productName: string;
  orderCount: number;
};

export type MoreOrderResponse = {
  byOrderCount: ProductOrderCount[];
};
