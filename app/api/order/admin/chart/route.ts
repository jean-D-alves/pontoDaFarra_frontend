import { NextRequest } from "next/server";
import {
  apiKey,
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../../_lib/proxy";

/**
 * Proxy das métricas administrativas de produtos mais pedidos.
 *
 * O backend expõe `GET /orders/admin/chart` (protegido por role Admin). O
 * navegador conversa apenas com esta rota do Next, que encaminha os cookies
 * httpOnly e a API key para o backend.
 */
export async function GET(request: NextRequest) {
  if (!backendUrl || !apiKey) return missingConfigResponse();

  const headers = buildBackendHeaders(request, {
    "Content-Type": request.headers.get("content-type") ?? "application/json",
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/orders/admin/chart`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
