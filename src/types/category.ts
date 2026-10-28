import { Product } from "./Products";

export interface Category {
  categoryId: string;
  name: string;
}

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type CategoryWithProducts = {
  categoryId: string;
  name: string;
  products: PagedResult<Product>;
};
