import { ChevronRight, ChevronLeft } from "lucide-react";

type PaginationProps = {
  pageNow: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  pageNow,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const isFirst = pageNow <= 1;
  const isLast = pageNow >= totalPages;

  return (
    <div className="flex flex-1 w-full justify-center items-center p-10 flex-row gap-2.5">
      <button
        type="button"
        aria-label="Página anterior"
        disabled={isFirst}
        onClick={() => onPageChange(pageNow - 1)}
        className="border border-line-strong rounded-xl hover:bg-surface cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={35} />
      </button>

      <p className="text-2xl">
        {pageNow} / {totalPages}
      </p>

      <button
        type="button"
        aria-label="Próxima página"
        disabled={isLast}
        onClick={() => onPageChange(pageNow + 1)}
        className="border border-line-strong rounded-xl hover:bg-surface cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={35} />
      </button>
    </div>
  );
}