import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { CATEGORIES_CACHE_TAG } from "@/lib/category";
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
    "Content-Type": request.headers.get("content-type") ?? "application/json",
    "X-Api-Key": apiKey,
  });

  try {
    const backend = await fetch(`${backendUrl}/category`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    if (backend.ok) revalidateTag(CATEGORIES_CACHE_TAG, "max");

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
