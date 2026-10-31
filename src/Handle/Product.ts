import { Product } from "../types/Products";
const productCache = new Map<string, Promise<Product>>();

export function requestProductGetIdCached(id: string): Promise<Product> {
  const cached = productCache.get(id);
  if (cached) return cached;

  const promise = requestProductGetId(id).catch((error) => {
    productCache.delete(id);
    throw error;
  });

  productCache.set(id, promise);
  return promise;
}
export async function requestProductGetId(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao pegar o produto (${response.status}).`);
  }
  return response.json();
}

export type SearchProductsParams = {
  name: string;
  page?: number;
  pageSize?: number;
  includeUnavailable?: boolean;
  onlyPromos?: boolean;
  below?: number;
};

export type SearchProductsResult = {
  items: Product[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export async function requestProductSearch(
  params: SearchProductsParams,
): Promise<SearchProductsResult> {
  const qs = new URLSearchParams();
  qs.set("name", params.name);
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 12));
  if (params.includeUnavailable) qs.set("includeUnavailable", "true");
  if (params.onlyPromos) qs.set("onlyPromos", "true");
  if (params.below !== undefined) qs.set("below", String(params.below));

  const response = await fetch(`/api/products/search?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao pesquisar produtos (${response.status}).`);
  }

  return response.json();
}
