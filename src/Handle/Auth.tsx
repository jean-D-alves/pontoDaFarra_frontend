import { User } from "../types/User";

export async function RequestMe(): Promise<User | null> {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json();
}

export async function requestSignIn(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Email: email, Password: password }),
  });

  if (!response.ok) return null;
  return response.json();
}
export type SignUpResult =
  | { ok: true; status: number }
  | { ok: false; status: number; message: string };

function readRegisterError(status: number, fallback: string): string {
  switch (status) {
    case 400:
      return "Não foi possível criar a conta. Verifique os dados informados e tente novamente.";
    case 401:
      return "Sessão expirada. Atualize a página e tente novamente.";
    case 403:
      return "Você não tem permissão para criar esta conta.";
    case 409:
      return "Este e-mail já está cadastrado. Tente entrar com sua conta.";
    case 429:
      return "Muitas requisições. Aguarde um instante e tente novamente.";
    default:
      return status >= 500
        ? "Serviço indisponível no momento. Tente novamente."
        : fallback;
  }
}

export async function requestSignUp(
  name: string,
  email: string,
  password: string,
  phoneNumber: string,
  legalDocumentIds: string[],
): Promise<SignUpResult> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Name: name,
        Email: email,
        Password: password,
        PhoneNumber: phoneNumber,
        legalDocumentIds,
      }),
    });

    if (response.ok) return { ok: true, status: response.status };

    return {
      ok: false,
      status: response.status,
      message: readRegisterError(
        response.status,
        "Não foi possível criar a conta. Tente novamente.",
      ),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }
}

type typeResponse = { message: string };

let refreshPromise: Promise<typeResponse | null> | null = null;
let logoutPromise: Promise<typeResponse | null> | null = null;

export function requestRefresh(): Promise<typeResponse | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as typeResponse;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export function requestLogout(): Promise<typeResponse | null> {
  if (logoutPromise) return logoutPromise;

  logoutPromise = (async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as typeResponse;
  })().finally(() => {
    logoutPromise = null;
  });

  return logoutPromise;
}
