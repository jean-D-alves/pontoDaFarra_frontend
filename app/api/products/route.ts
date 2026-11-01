import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../_lib/proxy";

export async function POST(request: NextRequest) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const body = await request.arrayBuffer();
  const headers = buildBackendHeaders(request, {
    "Content-Type":
      request.headers.get("content-type") ?? "multipart/form-data",
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/products`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
