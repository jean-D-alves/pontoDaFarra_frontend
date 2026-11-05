export default function LocationSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando locais…</span>

      <div aria-hidden="true" className="flex animate-pulse flex-col gap-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#E7E5DF] bg-white p-4 sm:p-5"
          >
            <div className="flex flex-col gap-2">
              <div className="h-5 w-40 rounded bg-surface" />
              <div className="h-4 w-56 rounded bg-surface" />
              <div className="h-3 w-44 rounded bg-surface" />
            </div>

            <div className="mt-4 flex gap-2">
              <div className="h-11 w-24 rounded-lg bg-surface" />
              <div className="h-11 w-24 rounded-lg bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
