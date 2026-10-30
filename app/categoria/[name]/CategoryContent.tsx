"use client";

import { useEffect, useState } from "react";
import { BeerOff, TriangleAlert } from "lucide-react";
import { RequestName } from "@/src/Handle/Category";
import { CategoryWithProducts } from "@/src/types/category";
import EmptyState from "@/src/components/EmptyState";
import Loading from "@/src/components/Loading";
import ProductCard from "@/src/components/ProductCard";
import Pagination from "@/src/components/Pagination";

const PAGE_SIZE = 10;

export default function CategoryContent({ name }: { name: string }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CategoryWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const result = await RequestName(name, page, PAGE_SIZE);

      if (cancelled) return;

      if (!result) {
        setError("Não foi possível carregar os produtos.");
        setData(null);
      } else {
        setData(result);
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [name, page]);


  const products = data?.products;

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
                <ProductCard key={product.productId} product={product} />
              </li>
            ))}
          </ul>
          <Pagination
            pageNow={page}
            totalPages={products.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
