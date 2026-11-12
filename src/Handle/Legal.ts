import { requestRefresh } from "./Auth";
import {
  LEGAL_DOCUMENT_TYPE_SLUG,
  type LegalDocument,
  type LegalDocumentType,
  type PublishLegalDocumentRequest,
  type UpdateLegalDocumentRequest,
  type UserConsent,
} from "@/src/types/legal";

type LegalProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
};

type LegalErrorMessages = {
  badRequest?: string;
  forbidden?: string;
  notFound?: string;
  conflict?: string;
  fallback?: string;
};

export class LegalApiError extends Error {
  readonly status: number;
  readonly detail: string | null;
  readonly validationErrors: string[];

  constructor(
    status: number,
    message: string,
    detail: string | null = null,
    validationErrors: string[] = [],
  ) {
    super(message);
    this.name = "LegalApiError";
    this.status = status;
    this.detail = detail;
    this.validationErrors = validationErrors;
  }
}

export function getLegalErrorMessage(
  error: unknown,
  fallback: string,
): string {
  // As mensagens do backend são em inglês; apenas as mensagens já traduzidas
  // pela camada de API são exibidas ao usuário.
  if (error instanceof LegalApiError) return error.message;

  return fallback;
}

function extractionValidationErrors(problem: LegalProblemDetails | null) {
  if (!problem?.errors) return [];

  return Object.values(problem.errors)
    .flat()
    .filter(
      (message): message is string =>
        typeof message === "string" && message.trim().length > 0,
    );
}

function extractProblemDetail(problem: LegalProblemDetails | null) {
  const validationErrors = extractionValidationErrors(problem);
  if (validationErrors.length > 0) return validationErrors.join(" ");

  return problem?.detail ?? problem?.title ?? null;
}

async function readProblemDetails(
  response: Response,
): Promise<LegalProblemDetails | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as LegalProblemDetails;
  } catch {
    return { detail: text };
  }
}

function legalErrorMessage(
  status: number,
  messages: LegalErrorMessages,
): string {
  switch (status) {
    case 400:
      return (
        messages.badRequest ??
        "Dados inválidos. Verifique os campos informados."
      );
    case 401:
      return "Sessão expirada. Entre novamente para continuar.";
    case 403:
      return (
        messages.forbidden ??
        "Você não tem permissão para executar esta ação."
      );
    case 404:
      return messages.notFound ?? "Documento não encontrado.";
    case 409:
      return (
        messages.conflict ??
        "Não foi possível concluir a operação por conflito com outros dados."
      );
    case 429:
      return "Muitas requisições. Aguarde um instante e tente novamente.";
    default:
      return status >= 500
        ? "Serviço indisponível no momento. Tente novamente."
        : (messages.fallback ??
            "Não foi possível concluir a operação. Tente novamente.");
  }
}

async function fetchLegal(url: string, init: RequestInit = {}) {
  try {
    return await fetch(url, {
      credentials: "include",
      cache: "no-store",
      ...init,
    });
  } catch {
    throw new LegalApiError(
      0,
      "Não foi possível conectar ao servidor. Tente novamente.",
    );
  }
}

async function fetchWithRefresh(url: string, init: RequestInit) {
  const response = await fetchLegal(url, init);
  if (response.status !== 401) return response;

  let refreshed = false;

  try {
    refreshed = (await requestRefresh()) !== null;
  } catch {
    refreshed = false;
  }

  if (!refreshed) return response;

  return fetchLegal(url, init);
}

async function sendLegalRequest(
  url: string,
  init: RequestInit,
  messages: LegalErrorMessages,
  options: { refreshOnUnauthorized?: boolean } = {},
): Promise<Response> {
  const response =
    options.refreshOnUnauthorized === false
      ? await fetchLegal(url, init)
      : await fetchWithRefresh(url, init);

  if (!response.ok) {
    const problem = await readProblemDetails(response);

    throw new LegalApiError(
      response.status,
      legalErrorMessage(response.status, messages),
      extractProblemDetail(problem),
      extractionValidationErrors(problem),
    );
  }

  return response;
}

async function readJsonOrNull<T>(response: Response): Promise<T | null> {
  if ([204, 205, 304].includes(response.status)) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function getActive(
  type: LegalDocumentType,
): Promise<LegalDocument | null> {
  const response = await fetchLegal(
    `/api/legal/active/${LEGAL_DOCUMENT_TYPE_SLUG[type]}`,
    { method: "GET" },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new LegalApiError(
      response.status,
      legalErrorMessage(response.status, {}),
    );
  }

  return (await response.json()) as LegalDocument;
}

export async function getPending(): Promise<LegalDocument[]> {
  const response = await sendLegalRequest(
    "/api/legal/pending",
    { method: "GET" },
    {
      fallback: "Não foi possível carregar os documentos pendentes.",
    },
  );

  return (await response.json()) as LegalDocument[];
}

export async function accept(legalDocumentIds: string[]): Promise<void> {
  await sendLegalRequest(
    "/api/legal/accept",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ legalDocumentIds }),
    },
    {
      badRequest: "Não foi possível registrar o aceite. Tente novamente.",
      notFound:
        "Um dos documentos não está mais disponível. Atualizando a lista...",
      conflict:
        "Os documentos legais foram atualizados. Revise e aceite novamente.",
    },
  );
}

export async function getConsents(): Promise<UserConsent[]> {
  const response = await sendLegalRequest(
    "/api/legal/consents",
    { method: "GET" },
    {
      fallback: "Não foi possível carregar seus aceites.",
    },
  );

  return (await response.json()) as UserConsent[];
}

export async function listAll(): Promise<LegalDocument[]> {
  const response = await sendLegalRequest(
    "/api/legal/documents",
    { method: "GET" },
    {
      forbidden: "Apenas administradores podem acessar os documentos.",
      fallback: "Não foi possível carregar os documentos legais.",
    },
  );

  return (await response.json()) as LegalDocument[];
}

export async function publish(
  request: PublishLegalDocumentRequest,
): Promise<LegalDocument | null> {
  const response = await sendLegalRequest(
    "/api/legal/documents",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
    {
      badRequest:
        "Dados inválidos. Verifique a versão (máximo de 20 caracteres) e o conteúdo.",
      conflict:
        "Já existe uma versão com esse nome para este tipo de documento.",
      fallback: "Não foi possível publicar o documento.",
    },
  );

  return readJsonOrNull<LegalDocument>(response);
}

export async function update(
  id: string,
  request: UpdateLegalDocumentRequest,
): Promise<LegalDocument | null> {
  const response = await sendLegalRequest(
    `/api/legal/documents/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
    {
      badRequest:
        "Dados inválidos. Verifique a versão (máximo de 20 caracteres) e o conteúdo.",
      conflict:
        "Este documento já foi aceito por usuários e não pode ser editado. Publique uma nova versão.",
      notFound: "Documento não encontrado.",
      fallback: "Não foi possível atualizar o documento.",
    },
  );

  return readJsonOrNull<LegalDocument>(response);
}
