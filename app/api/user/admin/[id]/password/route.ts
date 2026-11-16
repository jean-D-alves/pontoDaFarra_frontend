import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../../../_lib/proxy";

type PasswordRouteContext = { params: Promise<{ id: string }> };

export async function PUT(
  request: NextRequest,
  { params }: PasswordRouteContext,
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
      `${backendUrl}/user/admin/${encodeURIComponent(id)}/password`,
      {
        method: "PUT",
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
