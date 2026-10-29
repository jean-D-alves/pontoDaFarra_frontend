import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  productName: string;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

const control =
  "flex h-11 w-11 items-center justify-center rounded-lg text-black transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

export default function QuantityStepper({
  productName,
  quantity,
  onIncrease,
  onDecrease,
}: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-[#E7E5DF] bg-white p-0.5">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= 1}
        aria-label="Diminuir quantidade"
        className={control}
      >
        <Minus aria-hidden="true" size={16} />
      </button>

      <span
        aria-live="polite"
        aria-label={`Quantidade de ${productName}: ${quantity}`}
        className="min-w-8 text-center text-sm font-semibold text-stone-strong"
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        aria-label="Aumentar quantidade"
        className={control}
      >
        <Plus aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
