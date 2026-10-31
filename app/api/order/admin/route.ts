import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../_lib/proxy";

export async function GET(request: NextRequest) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const headers = buildBackendHeaders(request, {
    "Content-Type": request.headers.get("content-type") ?? "application/json",
    "X-Api-Key": apiKey,
  });

  const { searchParams } = request.nextUrl;
  const query = new URLSearchParams();
  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");

  if (page) query.set("page", page);
  if (pageSize) query.set("pageSize", pageSize);

  const qs = query.toString();

  try {
    const backend = await fetch(
      `${backendUrl}/orders/admin${qs ? `?${qs}` : ""}`,
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
