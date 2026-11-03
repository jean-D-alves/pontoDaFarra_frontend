"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BeerOff, TriangleAlert } from "lucide-react";
import EmptyState from "@/src/components/EmptyState";
import Loading from "@/src/components/Loading";
import Pagination from "@/src/components/Pagination";
import ProductCard from "@/src/components/ProductCard";
import ProductFilterBar, {
  type AvailabilityFilter,
  type PromotionFilter,
} from "@/src/components/product/ProductFilterBar";
import { RequestAll as RequestAllCategories } from "@/src/Handle/Category";
import { RequestAll, type ProductFilters } from "@/src/Handle/Product";
import { usePageSize } from "@/src/hooks/usePageSize";
import type { Category } from "@/src/types/category";
import type { PagedResult, Product } from "@/src/types/Products";

const ALL_PRODUCTS_PATH = "/produtos/all";

type UrlFilters = {
  availability: AvailabilityFilter;
  promotion: PromotionFilter;
  categoryId: string;
};

function buildUrl(filters: UrlFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.availability !== "all") {
    params.set(
      "isAvailable",
      String(filters.availability === "available"),
    );
  }
  if (filters.promotion !== "all") {
    params.set(
      "isPromotional",
      String(filters.promotion === "promotional"),
    );
  }
  if (page > 1) params.set("page", String(page));

  const qs = params.toString();
  return qs ? `${ALL_PRODUCTS_PATH}?${qs}` : ALL_PRODUCTS_PATH;
}

function ProductsAllContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSize = usePageSize();

  const rawIsAvailable = searchParams.get("isAvailable");
  const rawIsPromotional = searchParams.get("isPromotional");

  const availability: AvailabilityFilter =
    rawIsAvailable === "true"
      ? "available"
      : rawIsAvailable === "false"
        ? "unavailable"
        : "all";
  const promotion: PromotionFilter =
    rawIsPromotional === "true"
      ? "promotional"
      : rawIsPromotional === "false"
        ? "regular"
        : "all";
  const categoryId = searchParams.get("categoryId") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [products, setProducts] = useState<PagedResult<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    async function load() {
      setLoading(true);
      setError(null);

      const filters: ProductFilters = {};
      if (availability !== "all") {
        filters.isAvailable = availability === "available";
      }
      if (promotion !== "all") {
        filters.isPromotional = promotion === "promotional";
      }
      if (categoryId) filters.categoryId = categoryId;

      try {
        const result = await RequestAll(page, pageSize, filters);

        if (cancelled) return;

        if (!result) {
          setError("Não foi possível carregar os produtos.");
          return;
        }

        // Página fora do intervalo (ex.: mudou o tamanho da página): vai para a última válida.
        const lastPage = Math.max(1, result.totalPages);
        if (result.items.length === 0 && page > lastPage) {
          router.replace(
            buildUrl({ availability, promotion, categoryId }, lastPage),
          );
          return;
        }

        setProducts(result);
      } catch {
        if (!cancelled) setError("Não foi possível carregar os produtos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, availability, promotion, categoryId, router]);

  const hasActiveFilters =
    availability !== "all" || promotion !== "all" || categoryId !== "";

  function handleAvailabilityChange(value: AvailabilityFilter) {
    if (value === availability) return;

    setLoading(true);
    setError(null);
    router.push(buildUrl({ availability: value, promotion, categoryId }, 1));
  }

  function handlePromotionChange(value: PromotionFilter) {
    if (value === promotion) return;

    setLoading(true);
    setError(null);
    router.push(buildUrl({ availability, promotion: value, categoryId }, 1));
  }

  function handleCategoryChange(value: string) {
    if (value === categoryId) return;

    setLoading(true);
    setError(null);
    router.push(buildUrl({ availability, promotion, categoryId: value }, 1));
  }

  function handleClearFilters() {
    if (!hasActiveFilters) return;

    setLoading(true);
    setError(null);
    router.push(ALL_PRODUCTS_PATH);
  }

  function handlePageChange(nextPage: number) {
    if (nextPage === page) return;

    setLoading(true);
    setError(null);
    router.push(buildUrl({ availability, promotion, categoryId }, nextPage));
  }

  return (
    <section
      aria-busy={loading}
      className="mx-auto w-full max-w-[1000px] px-4 py-6"
    >
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl text-black">Todos os produtos</h1>
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
                <ProductCard product={product} />
              </li>
            ))}
          </ul>

          {products.totalPages > 1 && (
            <Pagination
              pageNow={page}
              totalPages={products.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {!loading && !error && products && products.items.length === 0 && (
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
      )}
    </section>
  );
}

export default function ProductsAllPage() {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto flex w-full max-w-[1000px] justify-center px-4 py-16"
          role="status"
        >
          <Loading />
        </div>
      }
    >
      <ProductsAllContent />
    </Suspense>
  );
}
