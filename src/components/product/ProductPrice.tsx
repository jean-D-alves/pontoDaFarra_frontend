import { formatCurrency } from "@/src/Handle/Currency";

interface ProductPriceProps {
  value: number;
  isPromotional: boolean;
}

export default function ProductPrice({
  value,
  isPromotional,
}: ProductPriceProps) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`text-sm font-medium ${
          isPromotional ? "text-promo-text" : "text-stone"
        }`}
      >
        {isPromotional ? "Preço promocional" : "Preço"}
      </span>
      <p className="text-[48px] font-bold leading-none tracking-[-0.02em] text-stone-strong">
        {formatCurrency(value)}
      </p>
    </div>
  );
}
