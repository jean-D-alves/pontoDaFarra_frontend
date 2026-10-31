"use client";

import { useState } from "react";

export type SearchFiltersValue = {
  includeUnavailable: boolean;
  onlyPromos: boolean;
  below?: number;
};

type SearchFiltersProps = {
  value: SearchFiltersValue;
  onApply: (value: SearchFiltersValue) => void;
};

export default function SearchFilters({ value, onApply }: SearchFiltersProps) {
  const [includeUnavailable, setIncludeUnavailable] = useState(
    value.includeUnavailable,
  );
  const [onlyPromos, setOnlyPromos] = useState(value.onlyPromos);
  const [below, setBelow] = useState(
    value.below !== undefined ? String(value.below) : "",
  );

  const hasActiveFilters =
    value.includeUnavailable || value.onlyPromos || value.below !== undefined;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = below.trim() === "" ? NaN : Number(below);

    onApply({
      includeUnavailable,
      onlyPromos,
      below: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
    });
  };

  const handleClear = () => {
    setIncludeUnavailable(false);
    setOnlyPromos(false);
    setBelow("");
    onApply({ includeUnavailable: false, onlyPromos: false });
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Filtros da pesquisa"
      className="mb-6 flex flex-wrap items-end gap-x-6 gap-y-3 rounded-2xl border border-line bg-white p-4"
    >
      <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
        <input
          type="checkbox"
          checked={onlyPromos}
          onChange={(e) => setOnlyPromos(e.target.checked)}
          className="h-4 w-4 accent-black"
        />
        Somente promoções
      </label>

      <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
        <input
          type="checkbox"
          checked={includeUnavailable}
          onChange={(e) => setIncludeUnavailable(e.target.checked)}
          className="h-4 w-4 accent-black"
        />
        Incluir indisponíveis
      </label>

      <label className="flex flex-col gap-1 text-sm text-black">
        Preço até (R$)
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={below}
          onChange={(e) => setBelow(e.target.value)}
          placeholder="Ex.: 30"
          className="h-9 w-32 rounded-full border border-gray-300 bg-white px-4 text-sm placeholder:text-gray-400 focus:outline-none"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="h-9 rounded-full bg-black px-5 text-sm font-semibold text-white cursor-pointer hover:opacity-80"
        >
          Aplicar
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="h-9 rounded-full border border-gray-300 px-5 text-sm text-black cursor-pointer hover:bg-surface"
          >
            Limpar
          </button>
        )}
      </div>
    </form>
  );
}
