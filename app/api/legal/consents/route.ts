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

  try {
    const backend = await fetch(`${backendUrl}/legal/consents`, {
      method: "GET",
      headers: buildBackendHeaders(request),
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
