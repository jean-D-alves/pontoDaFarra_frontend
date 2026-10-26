import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../_lib/proxy";

export async function POST(request: NextRequest) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const headers = buildBackendHeaders(request, {
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
