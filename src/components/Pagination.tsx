"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PageItem = number | "ellipsis";

interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

const baseButton =
  "flex items-center justify-center gap-1 rounded-xl border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";
const navButton = `${baseButton} border-line px-3 py-2 text-black enabled:hover:bg-surface`;
const pageButton = `${baseButton} h-9 w-9 px-0`;
const activePage = `${pageButton} border-transparent bg-brand-gradient`;
const inactivePage = `${pageButton} border-line text-black enabled:hover:bg-surface`;

function buildPages(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("ellipsis");

  for (let number = start; number <= end; number += 1) {
    pages.push(number);
  }

  if (end < total - 1) pages.push("ellipsis");

  pages.push(total);

  return pages;
}

export default function Pagination({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  disabled = false,
  ariaLabel = "Paginação",
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = buildPages(page, totalPages);

  return (
    <nav
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || !hasPrevious}
        aria-label="Página anterior"
        className={navButton}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <ol className="flex items-center gap-2">
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <li key={`ellipsis-${index}`}>
              <span aria-hidden="true" className="px-1 text-sm text-muted">
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                disabled={disabled || item === page}
                aria-label={`Página ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={item === page ? activePage : inactivePage}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || !hasNext}
        aria-label="Próxima página"
        className={navButton}
      >
        <span className="hidden sm:inline">Próxima</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>

      <span className="sr-only">
        Página {page} de {totalPages}
      </span>
    </nav>
  );
}
