import { requestRefresh } from "./Auth";
import type {
  CreateLocationInput,
  Location,
  UpdateLocationInput,
} from "../types/location";

const CONNECTION_ERROR =
  "Não foi possível conectar ao servidor. Tente novamente.";
const SESSION_ERROR = "Sessão expirada. Entre novamente para continuar.";
const LIMIT_ERROR = "Você já atingiu o limite de 3 locais";

function firstMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function collectErrorMessages(value: unknown): string[] {
  if (typeof value === "string") {
    const message = firstMessage(value);
    return message ? [message] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectErrorMessages);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectErrorMessages);
  }

  return [];
}

function extractErrorMessage(payload: unknown): string | null {
  if (typeof payload === "string") return firstMessage(payload);
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;

  for (const key of ["message", "error", "detail"]) {
    const value = record[key];
    const message = firstMessage(value);
    if (message) return message;

    if (value && typeof value === "object") {
      const nestedMessages = collectErrorMessages(value);
      if (nestedMessages.length > 0) return nestedMessages.join(" ");
    }
  }

  const validationMessages = collectErrorMessages(record.errors);
  if (validationMessages.length > 0) return validationMessages.join(" ");

  return firstMessage(record.title);
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const text = await response.text();
    if (!text.trim()) return fallback;

    try {
      const payload: unknown = JSON.parse(text);
      return extractErrorMessage(payload) ?? fallback;
    } catch {
      const trimmed = text.trim();
      return trimmed.startsWith("<") ? fallback : trimmed;
    }
  } catch {
    return fallback;
  }
}

async function sendLocationRequest(
  url: string,
  init: RequestInit,
  fallback: string,
): Promise<Response> {
  async function execute(): Promise<Response> {
    try {
      return await fetch(url, {
        credentials: "include",
        cache: "no-store",
        ...init,
      });
    } catch {
      throw new Error(CONNECTION_ERROR);
    }
  }

  let response = await execute();

  if (response.status === 401) {
    let refreshed = false;

    try {
      refreshed = (await requestRefresh()) !== null;
    } catch {
      refreshed = false;
    }

    if (refreshed) response = await execute();
  }

  if (response.ok) return response;

  if (response.status === 401) throw new Error(SESSION_ERROR);
  if (response.status === 409) throw new Error(LIMIT_ERROR);

  throw new Error(await readErrorMessage(response, fallback));
}

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text.trim()) return null;

  return JSON.parse(text) as T;
}

export async function requestLocations(): Promise<Location[]> {
  const response = await sendLocationRequest(
    "/api/location",
    { method: "GET" },
    "Não foi possível carregar seus locais.",
  );

  return (await readJson<Location[]>(response)) ?? [];
}

export async function requestCreateLocation(
  input: CreateLocationInput,
): Promise<void> {
  await sendLocationRequest(
    "/api/location",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    "Não foi possível criar o local.",
  );
}

export async function requestUpdateLocation(
  id: string,
  input: UpdateLocationInput,
): Promise<void> {
  await sendLocationRequest(
    `/api/location/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    "Não foi possível atualizar o local.",
  );
}

export async function requestDeleteLocation(id: string): Promise<void> {
  await sendLocationRequest(
    `/api/location/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "Não foi possível excluir o local.",
  );
}
