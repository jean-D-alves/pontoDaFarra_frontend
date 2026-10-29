export default function OrderHistorySkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando pedidos…</span>

      <div aria-hidden="true" className="flex animate-pulse flex-col gap-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#E7E5DF] bg-white p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-48 rounded bg-surface" />
                <div className="h-3 w-20 rounded bg-surface" />
              </div>
              <div className="h-6 w-24 rounded bg-surface" />
            </div>

            <div className="mt-4 h-4 w-16 rounded bg-surface" />
            <div className="mt-4 h-11 w-32 rounded-lg bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
