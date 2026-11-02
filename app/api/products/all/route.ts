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

  const params = new URLSearchParams({
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "10",
  });

  // Só repassa os filtros quando vierem preenchidos, para não filtrar sem querer.
  const isAvailable = searchParams.get("isAvailable");
  if (isAvailable === "true" || isAvailable === "false") {
    params.set("isAvailable", isAvailable);
  }

  const isPromotional = searchParams.get("isPromotional");
  if (isPromotional === "true" || isPromotional === "false") {
    params.set("isPromotional", isPromotional);
  }

  const categoryId = searchParams.get("categoryId");
  if (categoryId) params.set("categoryId", categoryId);

  try {
    const backend = await fetch(
      `${backendUrl}/products/all?${params.toString()}`,
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
