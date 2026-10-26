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
export async function requestSignUp(
  name: string,
  email: string,
  password: string,
  phoneNumber: string,
) {
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
    }),
  });
  console.log(response);
  if (!response.ok) return null;
  return response.json();
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
