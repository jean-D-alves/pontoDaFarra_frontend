import { NextRequest } from "next/server";
import {
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
} from "../../_lib/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!backendUrl) return missingConfigResponse();

  const { id } = await params;

  const backend = await fetch(`${backendUrl}/category/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: buildBackendHeaders(request),
    cache: "no-store",
  });

  return await forwardBackendResponse(backend);
}
