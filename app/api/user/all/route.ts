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

  const { searchParams } = request.nextUrl;
  const query = new URLSearchParams();

  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");
  const role = searchParams.get("role");
  const search = searchParams.get("search");

  if (page) query.set("page", page);
  if (pageSize) query.set("pageSize", pageSize);
  if (role) query.set("role", role);
  if (search) query.set("search", search);

  const qs = query.toString();
  const headers = buildBackendHeaders(request, {
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(
      `${backendUrl}/user/all${qs ? `?${qs}` : ""}`,
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
