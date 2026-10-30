import { Product } from "../types/Products";

export async function requestProductGetId(id: string): Promise<Product> {
  const response = await fetch(`/api/produtos/${encodeURIComponent(id)}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao pegar o produto (${response.status}).`);
  }
  return response.json();
}
