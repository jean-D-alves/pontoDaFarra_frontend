import Link from "next/link";
import { ChevronRight } from "lucide-react";

const crumbLink =
  "inline-flex min-h-[44px] items-center rounded text-sm text-stone transition hover:text-stone-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function CartBreadcrumb() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
            <span
              aria-current="page"
              className="inline-flex min-h-[44px] items-center font-semibold text-stone-strong"
            >
              Carrinho
            </span>
          </li>
        </ol>
      </nav>

      <span
        aria-hidden="true"
        className="inline-flex items-center rounded-lg border border-line-warm bg-surface px-3 py-1.5 font-mono text-xs text-stone"
      >
        /carrinho
      </span>
    </div>
  );
}
