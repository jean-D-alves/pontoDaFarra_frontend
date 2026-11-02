import { type User } from "../types/User";
import type { PagedResult } from "@/src/types/pagination";

export type UserFilters = {
  role?: "Admin" | "Client";
  search?: string;
};

function userActionError(status: number, fallback: string): string {
  switch (status) {
    case 400:
      return fallback;
    case 401:
      return "Sessão expirada. Entre novamente para continuar.";
    case 403:
      return "Apenas administradores podem executar esta ação.";
    case 404:
      return "Usuário não encontrado.";
    case 409:
      return "Não foi possível concluir a operação por conflito com outros dados.";
    case 429:
      return "Muitas requisições. Aguarde um instante e tente novamente.";
    default:
      return status >= 500
        ? "Serviço indisponível no momento. Tente novamente."
        : fallback;
  }
}

async function sendUserRequest(
  url: string,
  init: RequestInit,
  fallback: string,
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
    throw new Error(userActionError(response.status, fallback));
  }

  return response;
}

export async function requestUsersPage(
  page: number,
  pageSize: number,
  filters: UserFilters = {},
): Promise<PagedResult<User> | null> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (filters.role) params.set("role", filters.role);
  if (filters.search) params.set("search", filters.search);

  const response = await fetch(`/api/user/all?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json();
}

export async function requestUserById(id: string): Promise<User> {
  const response = await sendUserRequest(
    `/api/user/${encodeURIComponent(id)}`,
    { method: "GET" },
    "Não foi possível carregar o usuário.",
  );

  return response.json();
}

export async function requestToggleUserRole(id: string): Promise<void> {
  await sendUserRequest(
    `/api/user/${encodeURIComponent(id)}`,
    { method: "PUT" },
    "Não é possível alterar o próprio perfil.",
  );
}

export async function requestDeleteUserById(id: string): Promise<void> {
  await sendUserRequest(
    `/api/user/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "Não foi possível excluir o usuário.",
  );
}

export async function requestUpdateUser(
  name: string,
  email: string,
  phoneNumber: string,
) {
  const response = await fetch("/api/user/update", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Name: name,
      Email: email,
      PhoneNumber: phoneNumber,
    }),
  });

  if (!response.ok) return null;
  return response.json();
}

export async function requestDeleteUser() {
  const response = await fetch("/api/user/delete", {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) return null;
  return response.ok;
}
