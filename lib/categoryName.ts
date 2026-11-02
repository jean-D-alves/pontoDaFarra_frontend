// O backend normaliza o nome para minúsculo e exige palavras separadas por hífen.
export const CATEGORY_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const CATEGORY_NAME_HINT =
  "Letras minúsculas, números e hífens entre as palavras.";

export function validateCategoryName(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return "Informe o nome da categoria.";

  if (!CATEGORY_NAME_PATTERN.test(trimmed)) {
    return "Use apenas letras minúsculas, números e hífens entre as palavras.";
  }

  return null;
}
