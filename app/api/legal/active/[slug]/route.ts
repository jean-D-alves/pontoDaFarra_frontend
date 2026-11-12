import { NextRequest, NextResponse } from "next/server";
import {
  backendUrl,
  buildBackendHeaders,
  forwardBackendResponse,
  missingConfigResponse,
  unavailableResponse,
} from "../../../_lib/proxy";
import { LEGAL_DOCUMENT_TYPE_SLUG } from "@/src/types/legal";

const allowedSlugs = new Set<string>(Object.values(LEGAL_DOCUMENT_TYPE_SLUG));

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!backendUrl) return missingConfigResponse();

  const { slug } = await params;

  if (!allowedSlugs.has(slug)) {
    return NextResponse.json(
      { error: "Documento legal não encontrado." },
      { status: 404 },
    );
  }

  try {
    const backend = await fetch(
      `${backendUrl}/legal/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: buildBackendHeaders(request),
        cache: "no-store",
      },
    );

    return await forwardBackendResponse(backend);
  } catch {
    return unavailableResponse();
  }
}
