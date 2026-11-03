import { BeerOff } from "lucide-react";

export default function MostOrderEmptyState({
  message = "Não foi possível encontrar os produtos mais pedidos.",
}: {
  message?: string;
}) {
  return (
    <div
      className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface-soft p-8 text-center"
      role="status"
    >
      <BeerOff
        className="h-20 w-20 text-muted"
        strokeWidth={1.25}
        aria-hidden="true"
      />
      <h2 className="text-xl font-semibold text-ink">
        Não foi possível encontrar
      </h2>
      <p className="max-w-md text-sm text-muted">{message}</p>
    </div>
  );
}
