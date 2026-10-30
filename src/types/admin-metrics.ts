export type ProductByQuantity = {
  productId: string;
  productName: string;
  quantity: number;
};

export type ProductByValue = {
  productId: string;
  productName: string;
  totalValue: number;
};

export type ProductByOrderCount = {
  productId: string;
  productName: string;
  orderCount: number;
};

export type TopProductsMetrics = {
  byQuantity: ProductByQuantity[];
  byValue: ProductByValue[];
  byOrderCount: ProductByOrderCount[];
};
