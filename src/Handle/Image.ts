/**
 * O backend pode devolver a imagem como URL absoluta (R2/armazenamento local)
 * ou apenas a chave crua. Quando vier a chave, montamos a URL pública.
 */
export function resolveImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;

  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const base = (
    process.env.NEXT_PUBLIC_IMAGE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ""
  ).replace(/\/+$/, "");

  if (!base) return imageUrl;

  const path = process.env.NEXT_PUBLIC_IMAGE_URL
    ? imageUrl
    : `uploads/${imageUrl}`;

  return `${base}/${path.replace(/^\/+/, "")}`;
}
