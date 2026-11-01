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

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type UpdateProductPayload = {
  name: string;
  description: string;
  value: number;
  categoryId: string;
  image?: File;
};

export type UpdateProductPromotionPayload = {
  promotionalValue: number;
  isPromotional: boolean;
};

export type ProductOrderCount = {
  productId: string;
  productName: string;
  orderCount: number;
};

export type MoreOrderResponse = {
  byOrderCount: ProductOrderCount[];
};
