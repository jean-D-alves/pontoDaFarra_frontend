import { NextRequest } from "next/server";
import {
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
} from "../../_lib/proxy";

export async function GET(request: NextRequest) {
  if (!backendUrl) return missingConfigResponse();

  const { searchParams } = request.nextUrl;
  const query = new URLSearchParams();
  const name = searchParams.get("name");
  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");
  const includeUnavailable = searchParams.get("includeUnavailable");
  const onlyPromos = searchParams.get("onlyPromos");
  const below = searchParams.get("below");

  if (name) query.set("name", name);
  if (page) query.set("page", page);
  if (pageSize) query.set("pageSize", pageSize);
  if (includeUnavailable) query.set("includeUnavailable", includeUnavailable);
  if (onlyPromos) query.set("onlyPromos", onlyPromos);
  if (below) query.set("below", below);

  const qs = query.toString();
  const url = `${backendUrl}/products/search${qs ? `?${qs}` : ""}`;

  const backend = await fetch(url, {
    method: "GET",
    headers: buildBackendHeaders(request),
    cache: "no-store",
  });

  return await forwardBackendResponse(backend);
}
