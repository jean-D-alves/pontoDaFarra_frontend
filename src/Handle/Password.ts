import { requestRefresh } from "./Auth";
import type {
  AdminResetPasswordInput,
  ChangeOwnPasswordInput,
  PasswordField,
} from "../types/password";

const CONNECTION_ERROR =
  "Não foi possível conectar ao servidor. Tente novamente.";
const SESSION_ERROR = "Sessão expirada. Entre novamente para continuar.";
const RATE_LIMIT_ERROR =
  "Muitas tentativas. Aguarde um instante e tente novamente.";

type PasswordScope = "self" | "admin";

type ProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
};

export class PasswordApiError extends Error {
  readonly status: number;
  readonly field: PasswordField;

  constructor(status: number, message: string, field: PasswordField) {
    super(message);
    this.name = "PasswordApiError";
    this.status = status;
    this.field = field;
  }
}

async function readProblemDetails(
  response: Response,
): Promise<ProblemDetails | null> {
  try {
    const text = await response.text();
    if (!text.trim()) return null;

    try {
      return JSON.parse(text) as ProblemDetails;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

function fieldFromProblem(problem: ProblemDetails | null): PasswordField | null {
  const keys = Object.keys(problem?.errors ?? {}).map((key) =>
    key.toLowerCase(),
  );

  if (keys.some((key) => key.includes("newpassword"))) {
    return "newPassword";
  }

  return null;
}

function mapPasswordError(
  status: number,
  problem: ProblemDetails | null,
  scope: PasswordScope,
): PasswordApiError {
  const detail = problem?.detail?.toLowerCase() ?? "";
  const action = scope === "self" ? "alterar" : "redefinir";

  switch (status) {
    case 400:
      if (
        detail.includes("at least 8") ||
        detail.includes("letter and one number")
      ) {
        return new PasswordApiError(
          status,
          "A nova senha não atende aos requisitos de segurança.",
          "newPassword",
        );
      }

      if (detail.includes("different from the current password")) {
        return new PasswordApiError(
          status,
          "A nova senha deve ser diferente da atual.",
          "newPassword",
        );
      }

      return new PasswordApiError(
        status,
        `Não foi possível ${action} a senha. Verifique os dados e tente novamente.`,
        fieldFromProblem(problem) ?? "form",
      );

    case 401:
      return new PasswordApiError(status, SESSION_ERROR, "form");

    case 403:
      return new PasswordApiError(
        status,
        scope === "admin"
          ? "Apenas administradores podem redefinir senhas."
          : "Você não tem permissão para alterar esta senha.",
        "form",
      );

    case 404:
      return new PasswordApiError(
        status,
        scope === "admin"
          ? "Usuário não encontrado. Ele pode ter sido excluído."
          : "Sua conta não foi encontrada. Entre novamente.",
        "form",
      );

    case 429:
      return new PasswordApiError(status, RATE_LIMIT_ERROR, "form");

    default:
      return new PasswordApiError(
        status,
        status >= 500
          ? "Serviço indisponível no momento. Tente novamente."
          : `Não foi possível ${action} a senha. Tente novamente.`,
        "form",
      );
  }
}

async function sendPasswordRequest(
  url: string,
  init: RequestInit,
  scope: PasswordScope,
): Promise<Response> {
  async function execute(): Promise<Response> {
    try {
      return await fetch(url, {
        credentials: "include",
        cache: "no-store",
        ...init,
      });
    } catch {
      throw new PasswordApiError(0, CONNECTION_ERROR, "form");
    }
  }

  let response = await execute();

  if (response.status === 401) {
    let refreshed = false;

    try {
      refreshed = (await requestRefresh()) !== null;
    } catch {
      refreshed = false;
    }

    if (refreshed) response = await execute();
  }

  if (response.ok) return response;

  const problem = await readProblemDetails(response);
  throw mapPasswordError(response.status, problem, scope);
}

export async function requestChangeOwnPassword(
  input: ChangeOwnPasswordInput,
): Promise<void> {
  await sendPasswordRequest(
    "/api/user/me/password",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    "self",
  );
}

export async function requestAdminResetPassword(
  userId: string,
  input: AdminResetPasswordInput,
): Promise<void> {
  await sendPasswordRequest(
    `/api/user/admin/${encodeURIComponent(userId)}/password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    "admin",
  );
}
