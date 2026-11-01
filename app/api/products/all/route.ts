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
  const { searchParams } = new URL(request.url);

  const page = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "10";

  try {
    const backend = await fetch(
      `${backendUrl}/products/all?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
