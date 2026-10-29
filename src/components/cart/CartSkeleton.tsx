export default function CartSkeleton() {
  return (
    <>
      <span role="status" className="sr-only">
        Carregando carrinho…
      </span>

      <div aria-hidden="true" className="animate-pulse">
        <div className="mb-6 h-9 w-52 rounded-lg bg-surface" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl border border-[#E7E5DF] bg-white p-4"
              >
                <div className="h-[88px] w-[88px] shrink-0 rounded-xl bg-surface" />
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="h-4 w-2/3 rounded bg-surface" />
                  <div className="h-3 w-24 rounded bg-surface" />
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="h-11 w-32 rounded-xl bg-surface" />
                    <div className="h-4 w-16 rounded bg-surface" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[20px] border border-[#E7E5DF] bg-white p-6">
            <div className="h-5 w-40 rounded bg-surface" />
            <div className="mt-6 h-4 w-full rounded bg-surface" />
            <div className="mt-4 h-9 w-32 rounded bg-surface" />
            <div className="mt-6 h-[52px] w-full rounded-xl bg-surface" />
            <div className="mt-4 h-4 w-full rounded bg-surface" />
          </div>
        </div>
      </div>
    </>
  );
}
