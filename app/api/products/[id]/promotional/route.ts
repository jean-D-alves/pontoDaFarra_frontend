import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../../_lib/proxy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
      `${backendUrl}/products/${encodeURIComponent(id)}/promotional`,
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
