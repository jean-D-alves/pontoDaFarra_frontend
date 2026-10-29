import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../_lib/proxy";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const { id } = await params;
  const headers = buildBackendHeaders(request, {
    "Content-Type": request.headers.get("content-type") ?? "application/json",
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/orders/${id}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
