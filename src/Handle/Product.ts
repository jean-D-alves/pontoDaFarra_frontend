import {
  PagedResult,
  Product,
  UpdateProductPayload,
  UpdateProductPromotionPayload,
} from "@/src/types/Products";
import { DESKTOP_PAGE_SIZE } from "@/lib/pageSize";

const productCache = new Map<string, Promise<Product>>();

function productActionError(
  status: number,
  fallback: string,
  conflictMessage = "Não foi possível concluir a operação por conflito com outros dados.",
): string {
  switch (status) {
    case 400:
      return fallback;
    case 401:
      return "Sessão expirada. Entre novamente para continuar.";
    case 403:
      return "Apenas administradores podem executar esta ação.";
    case 404:
      return "Produto não encontrado.";
    case 409:
      return conflictMessage;
    case 413:
      return "A imagem deve ter no máximo 5 MB.";
    case 415:
      return "Formato de imagem não suportado. Use JPEG, PNG ou WebP.";
    case 429:
      return "Muitas requisições. Aguarde um instante e tente novamente.";
    default:
      return status >= 500
        ? "Serviço indisponível no momento. Tente novamente."
        : fallback;
  }
}

async function sendProductRequest(
  url: string,
  init: RequestInit,
  fallback: string,
  conflictMessage?: string,
): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
      ...init,
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }

  if (!response.ok) {
    throw new Error(
      productActionError(response.status, fallback, conflictMessage),
    );
  }

  return response;
}

export function clearProductCache(id?: string) {
  if (id) {
    productCache.delete(id);
    return;
  }

  productCache.clear();
}

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

export async function RequestAll(
  page: number,
  pageSize: number,
): Promise<PagedResult<Product> | null> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(`/api/products/all?${params}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json();
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
  qs.set("pageSize", String(params.pageSize ?? DESKTOP_PAGE_SIZE));
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

export async function UpdateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> {
  const formData = new FormData();

  formData.append("Name", payload.name);
  formData.append("Description", payload.description);
  formData.append("Value", String(payload.value));
  formData.append("CategoryId", payload.categoryId);

  if (payload.image) {
    formData.append("Image", payload.image);
  }

  const response = await sendProductRequest(
    `/api/products/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: formData,
    },
    "Dados inválidos. Verifique nome, descrição, valor, categoria e imagem.",
    "Não foi possível atualizar o produto: verifique a categoria informada.",
  );

  return response.json();
}

type CreateProductPayload = {
  name: string;
  description: string | null;
  value: number;
  categoryId: string;
  isAvailable: boolean;
  isPromotional: boolean;
  image: File | null;
};

export async function CreateProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const formData = new FormData();

  formData.append("Name", payload.name);
  if (payload.description) {
    formData.append("Description", payload.description);
  }
  formData.append("Value", String(payload.value));
  formData.append("CategoryId", payload.categoryId);
  formData.append("IsAvailable", String(payload.isAvailable));
  formData.append("IsPromotional", String(payload.isPromotional));

  if (payload.image) {
    formData.append("Image", payload.image);
  }

  const response = await sendProductRequest(
    `/api/products`,
    {
      method: "POST",
      body: formData,
    },
    "Dados inválidos. Verifique nome, descrição, valor, categoria e imagem.",
    "Não foi possível criar o produto: verifique a categoria informada.",
  );

  return response.json();
}
export async function UpdateProductPromotion(
  id: string,
  payload: UpdateProductPromotionPayload,
): Promise<Product> {
  const response = await sendProductRequest(
    `/api/products/${encodeURIComponent(id)}/promotional`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Valor promocional inválido. Informe um valor maior que zero.",
  );

  return response.json();
}

export async function SetProductAvailability(id: string): Promise<Product> {
  const response = await sendProductRequest(
    `/api/products/${encodeURIComponent(id)}/availability`,
    {
      method: "PATCH",
    },
    "Não foi possível alterar a disponibilidade do produto.",
  );

  return response.json();
}

export async function DeleteProduct(id: string): Promise<void> {
  await sendProductRequest(
    `/api/products/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
    "Não foi possível excluir o produto.",
    "Não é possível excluir este produto porque ele está vinculado a pedidos.",
  );
}
