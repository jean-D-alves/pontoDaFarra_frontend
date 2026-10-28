const line = "animate-pulse rounded bg-line";

export default function ProductSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6"
    >
      <span className="sr-only">Carregando produto...</span>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`h-4 w-56 ${line}`} />
        <div className={`hidden h-7 w-48 rounded-lg sm:block ${line}`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start md:gap-12">
        <div className="aspect-square w-full animate-pulse rounded-3xl bg-surface" />

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            <div className={`h-[44px] w-32 rounded-full ${line}`} />
            <div className={`h-[44px] w-32 rounded-full ${line}`} />
          </div>

          <div className="flex flex-col gap-4">
            <div className={`h-11 w-3/4 ${line}`} />
            <div className="flex flex-col gap-2">
              <div className={`h-4 w-24 ${line}`} />
              <div className={`h-12 w-44 ${line}`} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className={`h-4 w-full ${line}`} />
            <div className={`h-4 w-5/6 ${line}`} />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className={`h-[52px] w-64 rounded-xl ${line}`} />
            <div className={`h-[52px] w-52 rounded-xl ${line}`} />
          </div>

          <div className="flex flex-col gap-3 border-t border-line-warm pt-3">
            <div className={`h-4 w-full ${line}`} />
            <div className={`h-4 w-full ${line}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
