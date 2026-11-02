import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../_lib/proxy";

type UserRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: UserRouteContext) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const { id } = await params;
  const headers = buildBackendHeaders(request, {
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/user/${encodeURIComponent(id)}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}

export async function PUT(request: NextRequest, { params }: UserRouteContext) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const { id } = await params;
  const headers = buildBackendHeaders(request, {
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/user/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: UserRouteContext,
) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const { id } = await params;
  const headers = buildBackendHeaders(request, {
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/user/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
