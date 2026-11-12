export const LEGAL_VERSION_MAX_LENGTH = 20;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeZone: "America/Sao_Paulo",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatLegalDate(value: string): string {
  const date = parseDate(value);
  if (!date) return value;
  return dateFormatter.format(date);
}

export function formatLegalDateTime(value: string): string {
  const date = parseDate(value);
  if (!date) return value;
  return dateTimeFormatter.format(date);
}

export function validateLegalVersion(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return "Informe a versão do documento.";
  if (trimmed.length > LEGAL_VERSION_MAX_LENGTH) {
    return `A versão deve ter no máximo ${LEGAL_VERSION_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateLegalContent(value: string): string | null {
  if (!value.trim()) return "Informe o conteúdo do documento.";
  return null;
}
