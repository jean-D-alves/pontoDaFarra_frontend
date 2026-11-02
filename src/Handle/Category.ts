import { Category, CategoryWithProducts } from "@/src/types/category";

function categoryActionError(
  status: number,
  fallback: string,
  serverError = "Não foi possível concluir a operação. Tente novamente.",
): string {
  switch (status) {
    case 400:
      return fallback;
    case 401:
      return "Sessão expirada. Entre novamente para continuar.";
    case 403:
      return "Apenas administradores podem executar esta ação.";
    case 404:
      return "Categoria não encontrada.";
    case 409:
      return "Não foi possível concluir a operação por conflito com outros dados.";
    case 429:
      return "Muitas requisições. Aguarde um instante e tente novamente.";
    default:
      return status >= 500 ? serverError : fallback;
  }
}

async function sendCategoryRequest(
  url: string,
  init: RequestInit,
  fallback: string,
  serverError?: string,
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
    throw new Error(categoryActionError(response.status, fallback, serverError));
  }

  return response;
}

export async function RequestAll(): Promise<Category[] | null> {
  const response = await fetch("/api/category/all", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json();
}

export async function UpdateCategory(
  id: string,
  name: string,
): Promise<Category> {
  const response = await sendCategoryRequest(
    `/api/category/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Name: name }),
    },
    "Nome inválido. Use apenas letras minúsculas, números e hífens (ex.: bebidas-geladas).",
    "Não foi possível atualizar a categoria. Tente novamente.",
  );

  return response.json();
}

export async function CreateCategory(name: string): Promise<Category> {
  const response = await sendCategoryRequest(
    "/api/category",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Name: name }),
    },
    "Nome inválido. Use apenas letras minúsculas, números e hífens (ex.: bebidas-geladas).",
    "Não foi possível criar a categoria. Tente novamente.",
  );

  return response.json();
}

export async function DeleteCategory(id: string): Promise<void> {
  await sendCategoryRequest(
    `/api/category/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
    "Não foi possível excluir a categoria.",
    "Não foi possível excluir a categoria. Verifique se há produtos ou pedidos vinculados a ela.",
  );
}

export async function requestCategoryGetId(
  id: string,
): Promise<Category | null> {
  const response = await fetch(`/api/category/${encodeURIComponent(id)}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json();
}

export async function RequestName(
  name: string,
  page = 1,
  pageSize = 10,
): Promise<CategoryWithProducts | null> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(
    `/api/category/name/${encodeURIComponent(name)}?${query}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) return null;
  return response.json();
}
