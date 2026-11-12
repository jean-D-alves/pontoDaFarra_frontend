const line = "animate-pulse rounded bg-line";

export default function LegalDocumentSkeleton() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-10"
    >
      <span className="sr-only">Carregando documento legal...</span>

      <div className={`mb-8 h-4 w-44 ${line}`} />

      <div className="rounded-2xl border border-line bg-background p-6 sm:p-10">
        <div className={`h-9 w-2/3 ${line}`} />
        <div className={`mt-3 h-4 w-56 ${line}`} />

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
          <div className={`h-4 w-full ${line}`} />
          <div className={`h-4 w-11/12 ${line}`} />
          <div className={`h-4 w-4/5 ${line}`} />
          <div className={`mt-4 h-5 w-1/3 ${line}`} />
          <div className={`h-4 w-full ${line}`} />
          <div className={`h-4 w-10/12 ${line}`} />
        </div>
      </div>
    </main>
  );
}
