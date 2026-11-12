import { cache } from "react";
import {
  LEGAL_DOCUMENT_TYPE_SLUG,
  type LegalDocument,
  type LegalDocumentType,
} from "@/src/types/legal";

const backendUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

async function requestActiveLegalDocument(
  type: LegalDocumentType,
): Promise<LegalDocument | null> {
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não está configurada.");
  }

  const response = await fetch(
    `${backendUrl}/legal/${LEGAL_DOCUMENT_TYPE_SLUG[type]}`,
    { cache: "no-store" },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(
      `Falha ao consultar o documento legal (${response.status}).`,
    );
  }

  return (await response.json()) as LegalDocument;
}

/**
 * Busca o documento vigente de um tipo no servidor.
 *
 * O conteúdo muda quando o administrador publica uma nova versão, por isso a
 * consulta não é armazenada em cache.
 */
export const getActiveLegalDocument = cache(requestActiveLegalDocument);
