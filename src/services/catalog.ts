import { cache } from "react";
import type { Category } from "@/src/types/category";
import type { Product } from "@/src/types/Products";

const backendUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

async function requestBackend<T>(path: string): Promise<T | null> {
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não está configurada.");
  }

  const response = await fetch(`${backendUrl}${path}`, { cache: "no-store" });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Falha ao consultar ${path} (${response.status}).`);
  }

  return (await response.json()) as T;
}

/**
 * Busca o produto no backend. `React.cache` deduplica a chamada entre
 * `generateMetadata` e a página dentro da mesma requisição.
 */
export const getProductById = cache(
  (productId: string): Promise<Product | null> =>
    requestBackend<Product>(`/products/${encodeURIComponent(productId)}`),
);

/**
 * O nome da categoria é complementar: se o endpoint falhar, a página
 * continua funcionando com o fallback "Categoria".
 */
export const getCategoryById = cache(
  async (categoryId: string): Promise<Category | null> => {
    if (!categoryId) return null;

    try {
      return await requestBackend<Category>(
        `/category/${encodeURIComponent(categoryId)}`,
      );
    } catch {
      return null;
    }
  },
);
