import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ProductBreadcrumbProps {
  productId: string;
  productName: string;
  categoryName: string | null;
}

const crumbLink =
  "inline-flex min-h-[44px] items-center text-stone transition hover:text-stone-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black rounded";

export default function ProductBreadcrumb({
  productId,
  productName,
  categoryName,
}: ProductBreadcrumbProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <nav aria-label="Navegação estrutural">
        <ol className="flex flex-wrap items-center gap-1 text-sm">
          <li>
            <Link href="/" className={crumbLink}>
              Início
            </Link>
          </li>
          <li aria-hidden="true" className="text-line-warm">
            <ChevronRight size={14} />
          </li>
          <li>
            <Link
              href={
                categoryName
                  ? `/categoria/${encodeURIComponent(categoryName)}`
                  : "/categoria"
              }
              className={`${crumbLink} capitalize`}
            >
              {categoryName ?? "Categoria"}
            </Link>
          </li>
          <li aria-hidden="true" className="text-line-warm">
            <ChevronRight size={14} />
          </li>
          <li className="min-w-0">
            <span
              aria-current="page"
              className="inline-flex min-h-[44px] items-center font-semibold text-stone-strong"
            >
              {productName}
            </span>
          </li>
        </ol>
      </nav>

      <span className="hidden items-center rounded-lg border border-line-warm bg-surface px-3 py-1.5 font-mono text-xs text-stone sm:inline-flex">
        /produtos/{productId}
      </span>
    </div>
  );
}
