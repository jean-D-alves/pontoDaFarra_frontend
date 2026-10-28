import Link from "next/link";
import { Check, X } from "lucide-react";

interface ProductBadgesProps {
  categoryName: string | null;
  isAvailable: boolean;
}

const chipBase =
  "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-semibold";

export default function ProductBadges({
  categoryName,
  isAvailable,
}: ProductBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={
          categoryName
            ? `/categoria/${encodeURIComponent(categoryName)}`
            : "/categoria"
        }
        className="inline-flex min-h-[44px] items-center rounded-full border border-line-warm px-4 text-sm font-medium capitalize text-stone-strong transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        {categoryName ?? "Categoria"}
      </Link>

      {isAvailable ? (
        <span className={`${chipBase} bg-available-bg text-available-text`}>
          <Check aria-hidden="true" size={16} strokeWidth={3} />
          Disponível
        </span>
      ) : (
        <span
          className={`${chipBase} bg-unavailable-bg text-unavailable-text`}
        >
          <X aria-hidden="true" size={16} strokeWidth={3} />
          Indisponível
        </span>
      )}
    </div>
  );
}
