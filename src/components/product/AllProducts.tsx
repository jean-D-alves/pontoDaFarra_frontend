"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BeerOff, CheckCircle2, TriangleAlert } from "lucide-react";
import { RequestAll } from "@/src/Handle/Product";
import EmptyState from "@/src/components/EmptyState";
import Loading from "@/src/components/Loading";
import Pagination from "@/src/components/Pagination";
import { PagedResult, Product } from "@/src/types/Products";
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

  useEffect(() => {
    let cancelled = false;
    let redirecting = false;

    RequestAll(page, pageSize)
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
  }, [page, pageSize, reloadToken]);

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => setFeedback(null), FEEDBACK_DURATION);

    return () => window.clearTimeout(timer);
  }, [feedback]);

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
        <EmptyState
          icon={BeerOff}
          title="Nenhum produto por aqui"
          description="Não há produtos disponíveis nesta categoria no momento."
        />
      )}
    </section>
  );
}
