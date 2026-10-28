import Link from "next/link";
import { Product } from "@/src/types/Products";
import { resolveImageUrl } from "@/src/Handle/Image";
import AddToCartButton from "./AddToCartButton";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function ProductCard({ product }: { product: Product }) {
  const imageUrl = resolveImageUrl(product.imageUrl);
  const href = `/produtos/${product.productId}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <Link
        href={href}
        aria-label={`Ver detalhes de ${product.name}`}
        className={`relative block aspect-square bg-surface ${focusRing}`}
      >
        {product.isPromotional && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-brand px-2 py-1 text-xs font-bold text-black">
            Oferta
          </span>
        )}

        {!product.isAvailable && (
          <span className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm font-semibold text-black">
            Indisponível
          </span>
        )}

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-muted">
            Sem imagem
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-black">
          <Link href={href} className={`rounded ${focusRing}`}>
            {product.name}
          </Link>
        </h3>

        {product.description && (
          <p className="line-clamp-2 text-xs text-muted">
            {product.description}
          </p>
        )}

        <p className="mt-auto pt-2 text-lg font-bold text-black">
          {currency.format(Number(product.value))}
        </p>

        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
