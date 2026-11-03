import { cacheLife, cacheTag } from "next/cache";
import { RequestAll } from "@/src/Handle/Category";

/** Tag usada para invalidar a listagem após criar/editar/excluir categorias. */
export const CATEGORIES_CACHE_TAG = "categories";

/**
 * Acesso às categorias a partir de Server Components.
 * O fetch fica no Handle; aqui aplicamos cache com invalidação por tag.
 */
export async function getCategories() {
  "use cache";
  cacheTag(CATEGORIES_CACHE_TAG);

  const categories = await RequestAll();

  // Indisponibilidade não entra no cache estático: vira um "dynamic hole"
  // resolvido em tempo de request.
  if (!categories) {
    cacheLife("seconds");
    return null;
  }

  cacheLife("hours");
  return categories;
}
