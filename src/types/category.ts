import { Product } from "./Products";
import type { PagedResult } from "./pagination";

export type { PagedResult } from "./pagination";

export interface Category {
  categoryId: string;
  name: string;
}

export type CategoryWithProducts = {
  categoryId: string;
  name: string;
  products: PagedResult<Product>;
};
