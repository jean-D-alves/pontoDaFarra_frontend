"use client";

import { X } from "lucide-react";
import type { Category } from "@/src/types/category";

export type AvailabilityFilter = "all" | "available" | "unavailable";
export type PromotionFilter = "all" | "promotional" | "regular";

type ProductFilterBarProps = {
  availability: AvailabilityFilter;
  promotion: PromotionFilter;
  categoryId: string;
  categories: Category[];
  loadingCategories: boolean;
  categoryError: boolean;
  hasActiveFilters: boolean;
  onChangeAvailability: (value: AvailabilityFilter) => void;
  onChangePromotion: (value: PromotionFilter) => void;
  onChangeCategory: (value: string) => void;
  onClear: () => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const fieldClassName = `min-h-[44px] w-full rounded-xl border border-line bg-white px-3 text-sm text-black transition disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

const labelClassName = "flex min-w-0 flex-col gap-1 text-sm font-medium text-body";

export default function ProductFilterBar({
  availability,
  promotion,
  categoryId,
  categories,
  loadingCategories,
  categoryError,
  hasActiveFilters,
  onChangeAvailability,
  onChangePromotion,
  onChangeCategory,
  onClear,
}: ProductFilterBarProps) {
  return (
    <div className="mb-4 rounded-2xl border border-line bg-surface p-4">
      <div
        role="group"
        aria-label="Filtros de produtos"
        className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:items-end"
      >
        <label className={labelClassName}>
          Disponibilidade
          <select
            value={availability}
            onChange={(event) =>
              onChangeAvailability(event.target.value as AvailabilityFilter)
            }
            className={fieldClassName}
          >
            <option value="all">Todos</option>
            <option value="available">Disponíveis</option>
            <option value="unavailable">Indisponíveis</option>
          </select>
        </label>

        <label className={labelClassName}>
          Oferta
          <select
            value={promotion}
            onChange={(event) =>
              onChangePromotion(event.target.value as PromotionFilter)
            }
            className={fieldClassName}
          >
            <option value="all">Todas</option>
            <option value="promotional">Em oferta</option>
            <option value="regular">Sem oferta</option>
          </select>
        </label>

        <label className={labelClassName}>
          Categoria
          <select
            value={categoryId}
            onChange={(event) => onChangeCategory(event.target.value)}
            disabled={loadingCategories || categoryError}
            className={fieldClassName}
          >
            <option value="">
              {loadingCategories
                ? "Carregando…"
                : categoryError
                  ? "Erro ao carregar"
                  : "Todas"}
            </option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasActiveFilters}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
        >
          <X aria-hidden="true" size={16} />
          Limpar filtros
        </button>
      </div>

      {categoryError && !loadingCategories && (
        <p role="alert" className="mt-3 text-sm font-medium text-unavailable-text">
          Não foi possível carregar as categorias.
        </p>
      )}
    </div>
  );
}
