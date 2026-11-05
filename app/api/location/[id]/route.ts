import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../_lib/proxy";

type LocationRouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: LocationRouteContext,
) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const { id } = await params;
  const headers = buildBackendHeaders(request, {
    "Content-Type": request.headers.get("content-type") ?? "application/json",
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(
      `${backendUrl}/locations/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: LocationRouteContext,
) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const { id } = await params;
  const body = await request.text();
  const headers = buildBackendHeaders(request, {
    "Content-Type": request.headers.get("content-type") ?? "application/json",
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(
      `${backendUrl}/locations/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers,
        body,
        cache: "no-store",
      },
    );

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: LocationRouteContext,
) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const { id } = await params;
  const headers = buildBackendHeaders(request, {
    "Content-Type": request.headers.get("content-type") ?? "application/json",
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(
      `${backendUrl}/locations/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers,
        cache: "no-store",
      },
    );

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
