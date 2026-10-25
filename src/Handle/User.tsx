import { type User } from "../types/User";

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

type RefreshResponse = { message: string };

let refreshPromise: Promise<RefreshResponse | null> | null = null;

export function requestRefresh(): Promise<RefreshResponse | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as RefreshResponse;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
