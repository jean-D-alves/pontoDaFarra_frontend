import { NextRequest, NextResponse } from "next/server";
import {
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../../_lib/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  if (!backendUrl) return missingConfigResponse();

  const { name } = await params;
  const trimmed = name?.trim();

  if (!trimmed) {
    return NextResponse.json(
      { message: "O parâmetro 'name' é obrigatório." },
      { status: 400 },
    );
  }

  const { searchParams } = request.nextUrl;
  const query = new URLSearchParams();
  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");
  if (page) query.set("page", page);
  if (pageSize) query.set("pageSize", pageSize);

  const qs = query.toString();
  const url = `${backendUrl}/category/name/${encodeURIComponent(trimmed)}${qs ? `?${qs}` : ""}`;

  try {
    const backend = await fetch(url, {
      method: "GET",
      headers: buildBackendHeaders(request),
      cache: "no-store",
    });

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
