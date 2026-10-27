import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../_lib/proxy";

export async function DELETE(request: NextRequest) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const headers = buildBackendHeaders(request, {
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/user`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
