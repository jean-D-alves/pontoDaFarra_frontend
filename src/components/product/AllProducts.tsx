"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BeerOff, CheckCircle2, TriangleAlert } from "lucide-react";
import { RequestAll, type ProductFilters } from "@/src/Handle/Product";
import { RequestAll as RequestAllCategories } from "@/src/Handle/Category";
import EmptyState from "@/src/components/EmptyState";
import Loading from "@/src/components/Loading";
import Pagination from "@/src/components/Pagination";
import ProductFilterBar, {
  type AvailabilityFilter,
  type PromotionFilter,
} from "@/src/components/product/ProductFilterBar";
import { PagedResult, Product } from "@/src/types/Products";
import { Category } from "@/src/types/category";
import { usePageSize } from "@/src/hooks/usePageSize";
import ProductCardAdmin from "../ProductCardAdmin";

const FEEDBACK_DURATION = 4000;

export default function ProductContent() {
  const pageSize = usePageSize();
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<PagedResult<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [promotion, setPromotion] = useState<PromotionFilter>("all");
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    RequestAllCategories()
      .then((result) => {
        if (cancelled) return;

        if (!result) {
          setCategoryError(true);
          return;
        }

        setCategoryError(false);
        setCategories(result);
      })
      .catch(() => {
        if (!cancelled) setCategoryError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let redirecting = false;

    const filters: ProductFilters = {};

    if (availability !== "all") {
      filters.isAvailable = availability === "available";
    }

    if (promotion !== "all") {
      filters.isPromotional = promotion === "promotional";
    }

    if (categoryId) filters.categoryId = categoryId;

    RequestAll(page, pageSize, filters)
      .then((result) => {
        if (cancelled) return;

        if (!result) {
          setError("Não foi possível carregar os produtos.");
          if (!hasLoadedRef.current) setProducts(null);
          return;
        }

        if (result.items.length === 0 && page > 1) {
          const lastPage = Math.max(1, result.totalPages);

          // Página fora do intervalo (ex.: mudou o tamanho da página): vai para a última válida.
          if (lastPage !== page) {
            redirecting = true;
            setPage(lastPage);
            return;
          }
        }

        hasLoadedRef.current = true;
        setError(null);
        setProducts(result);
      })
      .catch(() => {
        if (cancelled) return;

        setError("Não foi possível carregar os produtos.");
        if (!hasLoadedRef.current) setProducts(null);
      })
      .finally(() => {
        if (!cancelled && !redirecting) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, reloadToken, availability, promotion, categoryId]);

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => setFeedback(null), FEEDBACK_DURATION);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  const hasActiveFilters =
    availability !== "all" || promotion !== "all" || categoryId !== "";

  const handleChanged = useCallback((message?: string) => {
    if (message) setFeedback(message);
    setError(null);
    setLoading(true);
    setReloadToken((current) => current + 1);
  }, []);

  function handlePageChange(nextPage: number) {
    if (nextPage === page) return;

    setFeedback(null);
    setError(null);
    setLoading(true);
    setPage(nextPage);
  }

  function resetToFirstPage() {
    setFeedback(null);
    setError(null);
    setLoading(true);
    setPage(1);
  }

  function handleAvailabilityChange(value: AvailabilityFilter) {
    if (value === availability) return;

    setAvailability(value);
    resetToFirstPage();
  }

  function handlePromotionChange(value: PromotionFilter) {
    if (value === promotion) return;

    setPromotion(value);
    resetToFirstPage();
  }

  function handleCategoryChange(value: string) {
    if (value === categoryId) return;

    setCategoryId(value);
    resetToFirstPage();
  }

  function handleClearFilters() {
    if (!hasActiveFilters) return;

    setAvailability("all");
    setPromotion("all");
    setCategoryId("");
    resetToFirstPage();
  }

  return (
    <section
      aria-busy={loading}
      className="mx-auto w-full max-w-[1000px] px-4 py-6"
    >
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">
          <strong>Todos os produtos</strong>
        </h1>
        {products && (
          <p className="text-sm text-muted">
            {products.totalItems} produto
            {products.totalItems === 1 ? "" : "s"} encontrado
            {products.totalItems === 1 ? "" : "s"}
          </p>
        )}

        {loading && products && (
          <p className="text-xs text-muted">Atualizando produtos…</p>
        )}
      </header>

      <ProductFilterBar
        availability={availability}
        promotion={promotion}
        categoryId={categoryId}
        categories={categories}
        loadingCategories={loadingCategories}
        categoryError={categoryError}
        hasActiveFilters={hasActiveFilters}
        onChangeAvailability={handleAvailabilityChange}
        onChangePromotion={handlePromotionChange}
        onChangeCategory={handleCategoryChange}
        onClear={handleClearFilters}
      />

      <div aria-live="polite" role="status">
        {feedback && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-available-bg px-3 py-2 text-sm font-medium text-available-text">
            <CheckCircle2 aria-hidden="true" size={16} className="shrink-0" />
            {feedback}
          </p>
        )}
      </div>

      {error && products && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
        >
          {error}
        </p>
      )}

      {loading && !products && (
        <div className="flex justify-center py-16" role="status">
          <Loading />
        </div>
      )}

      {!loading && !products && error && (
        <EmptyState
          role="alert"
          icon={TriangleAlert}
          title="Produtos indisponíveis"
          description={error}
        />
      )}

      {products && products.items.length > 0 && (
        <>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.items.map((product) => (
              <li key={product.productId}>
                <ProductCardAdmin product={product} onChanged={handleChanged} />
              </li>
            ))}
          </ul>
          <Pagination
            pageNow={page}
            totalPages={products.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {!loading && products && products.items.length === 0 && (
        <>
          <EmptyState
            icon={BeerOff}
            title={
              hasActiveFilters
                ? "Nenhum produto encontrado"
                : "Nenhum produto por aqui"
            }
            description={
              hasActiveFilters
                ? "Nenhum produto corresponde aos filtros selecionados. Tente ajustar ou limpar os filtros."
                : "Ainda não há produtos cadastrados no momento."
            }
          />

          {hasActiveFilters && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleClearFilters}
                className="min-h-[44px] rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
