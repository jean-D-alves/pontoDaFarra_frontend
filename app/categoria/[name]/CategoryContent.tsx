"use client";

import { useEffect, useState } from "react";
import { BeerOff, TriangleAlert } from "lucide-react";
import { RequestName } from "@/src/Handle/Category";
import { CategoryWithProducts } from "@/src/types/category";
import EmptyState from "@/src/components/EmptyState";
import Loading from "@/src/components/Loading";
import Pagination from "@/src/components/Pagination";
import ProductCard from "@/src/components/ProductCard";

const PAGE_SIZE = 10;

export default function CategoryContent({ name }: { name: string }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CategoryWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    RequestName(name, page, PAGE_SIZE)
      .then((result) => {
        if (cancelled) return;

        if (!result) {
          setData(null);
          setError("Categoria não encontrada ou indisponível no momento.");
          return;
        }

        setData(result);
      })
      .catch(() => {
        if (cancelled) return;

        setData(null);
        setError(
          "Não foi possível carregar os produtos. Tente novamente mais tarde.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [name, page]);

  function changePage(nextPage: number) {
    if (nextPage < 1 || nextPage === page) return;

    setLoading(true);
    setError(null);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const products = data?.products;
  const totalPages = products?.totalPages ?? 0;

  return (
    <section className="mx-auto w-full max-w-[1000px] px-4 py-6">
      <header className="mb-4">
        <h1 className="font-display text-3xl capitalize text-black">
          {data?.name ?? name}
        </h1>
        {products && (
          <p className="text-sm text-muted">
            {products.totalItems} produto
            {products.totalItems === 1 ? "" : "s"} encontrado
            {products.totalItems === 1 ? "" : "s"}
          </p>
        )}
      </header>

      {loading && (
        <div className="flex justify-center py-16" role="status">
          <Loading />
        </div>
      )}

      {!loading && error && (
        <EmptyState
          role="alert"
          icon={TriangleAlert}
          title="Produtos indisponíveis"
          description={error}
        />
      )}

      {!loading && !error && products && products.items.length === 0 && (
        <EmptyState
          icon={BeerOff}
          title="Nenhum produto por aqui"
          description="Não há produtos disponíveis nesta categoria no momento."
        />
      )}

      {!loading && !error && products && products.items.length > 0 && (
        <>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.items.map((product) => (
              <li key={product.productId}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>

          <Pagination
            page={products.page}
            totalPages={totalPages}
            hasNext={products.hasNext}
            hasPrevious={products.hasPrevious}
            onPageChange={changePage}
            disabled={loading}
            ariaLabel="Paginação de produtos"
            className="mt-8"
          />
        </>
      )}
    </section>
  );
}
