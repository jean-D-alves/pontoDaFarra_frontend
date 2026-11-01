import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../_lib/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!backendUrl) return missingConfigResponse();

  const { id } = await params;

  const backend = await fetch(`${backendUrl}/products/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: buildBackendHeaders(request),
    cache: "no-store",
  });

  return await forwardBackendResponse(backend);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const { id } = await params;
  const body = await request.arrayBuffer();
  const headers = buildBackendHeaders(request, {
    "Content-Type": request.headers.get("content-type") ?? "multipart/form-data",
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers,
      body,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const { id } = await params;
  const headers = buildBackendHeaders(request, {
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
