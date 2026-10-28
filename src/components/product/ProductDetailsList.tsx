interface ProductDetailsListProps {
  productId: string;
  categoryName: string | null;
}

const row =
  "flex flex-wrap items-start justify-between gap-x-6 gap-y-1 border-b border-line-warm py-3";

export default function ProductDetailsList({
  productId,
  categoryName,
}: ProductDetailsListProps) {
  return (
    <dl className="border-t border-line-warm text-sm">
      <div className={row}>
        <dt className="text-stone">Código do produto</dt>
        <dd className="break-all text-right font-mono text-stone-strong">
          {productId}
        </dd>
      </div>

      <div className={row}>
        <dt className="text-stone">Categoria</dt>
        <dd className="font-medium capitalize text-stone-strong">
          {categoryName ?? "Categoria"}
        </dd>
      </div>
    </dl>
  );
}
