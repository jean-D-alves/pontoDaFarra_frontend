import { NextResponse } from "next/server";

export const backendUrl = process.env.NEXT_PUBLIC_API_URL;
export const apiKey = process.env.API_KEY;

export function missingConfigResponse() {
  return NextResponse.json(
    { error: "Configuração da API ausente." },
    { status: 500 },
  );
}

export function unavailableResponse() {
  return NextResponse.json(
    { error: "Serviço de autenticação indisponível." },
    { status: 502 },
  );
}

export function buildBackendHeaders(
  request: Request,
  initial?: HeadersInit,
): Headers {
  const headers = new Headers(initial);
  const forwardedFor = request.headers.get("x-forwarded-for");
  const incomingCookie = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");

  headers.set(
    "X-Forwarded-Proto",
    request.headers.get("x-forwarded-proto") ??
      new URL(request.url).protocol.replace(":", ""),
  );

  if (forwardedFor) headers.set("X-Forwarded-For", forwardedFor);
  if (incomingCookie) headers.set("Cookie", incomingCookie);
  if (authorization) headers.set("Authorization", authorization);

  return headers;
}

const refreshCookieName = "refresh_token";
const legacyRefreshCookiePaths = [
  "/",
  "/auth",
  "/api",
  "/api/auth",
  "/api/auth/",
];

function clearLegacyRefreshCookies(response: NextResponse) {
  for (const path of legacyRefreshCookiePaths) {
    response.headers.append(
      "Set-Cookie",
      `${refreshCookieName}=; Path=${path}; Max-Age=0; HttpOnly; SameSite=Lax`,
    );
  }
}

export async function forwardBackendResponse(backend: Response) {
  const noBody = [204, 205, 304].includes(backend.status);
  const text = noBody ? null : await backend.text();

  const headers = new Headers();
  if (text) {
    headers.set(
      "Content-Type",
      backend.headers.get("content-type") ?? "application/json",
    );
  }

  const response = new NextResponse(text, {
    status: backend.status,
    headers,
  });

  const setCookies = backend.headers.getSetCookie();
  const setsRefreshCookie = setCookies.some((setCookie) =>
    setCookie.trimStart().toLowerCase().startsWith(`${refreshCookieName}=`),
  );

  if (setsRefreshCookie) clearLegacyRefreshCookies(response);

  for (const setCookie of setCookies) {
    response.headers.append(
      "Set-Cookie",
      setCookie.replace(/;\s*path=\/auth(?=;|$)/i, "; path=/"),
    );
  }

  return response;
}
