import { NextRequest } from "next/server";
import {
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../_lib/proxy";

export async function GET(request: NextRequest) {
  if (!backendUrl) return missingConfigResponse();

  const headers = buildBackendHeaders(request);

  try {
    const backend = await fetch(`${backendUrl}/auth/me`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
