"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/src/components/ProductCard";
import Pagination from "@/src/components/Pagination";
import SearchFilters, {
  SearchFiltersValue,
} from "@/src/components/header/SearchFilter";
import {
  requestProductSearch,
  SearchProductsResult,
} from "@/src/Handle/Product";
import { SEARCH_PATH } from "@/src/components/header/SearchInput";

type Status = "loading" | "ready" | "error";

function buildSearchUrl(
  name: string,
  page: number,
  filters: SearchFiltersValue,
) {
  const qs = new URLSearchParams();
  qs.set("name", name);
  qs.set("page", String(page));
  if (filters.includeUnavailable) qs.set("includeUnavailable", "true");
  if (filters.onlyPromos) qs.set("onlyPromos", "true");
  if (filters.below !== undefined) qs.set("below", String(filters.below));
  return `${SEARCH_PATH}?${qs.toString()}`;
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const name = (searchParams.get("name") ?? "").trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const includeUnavailable = searchParams.get("includeUnavailable") === "true";
  const onlyPromos = searchParams.get("onlyPromos") === "true";
  const belowParam = Number(searchParams.get("below"));
  const below =
    Number.isFinite(belowParam) && belowParam > 0 ? belowParam : undefined;

  const filters: SearchFiltersValue = { includeUnavailable, onlyPromos, below };

  const [result, setResult] = useState<SearchProductsResult | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!name) return;

    let cancelled = false;
    setStatus("loading");

    requestProductSearch({ name, page, includeUnavailable, onlyPromos, below })
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [name, page, includeUnavailable, onlyPromos, below]);

  const goToPage = (next: number) => {
    router.push(buildSearchUrl(name, next, filters));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mudou o filtro: volta para a página 1
  const applyFilters = (next: SearchFiltersValue) => {
    router.push(buildSearchUrl(name, 1, next));
  };

  if (!name) {
    return (
      <p className="text-sm text-gray-500">
        Digite o nome de um produto na barra de pesquisa.
      </p>
    );
  }

  return (
    <>
      <h1 className="mb-4 text-xl font-bold text-black">
        Resultados para &ldquo;{name}&rdquo;
        {status === "ready" && result && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({result.totalItems}{" "}
            {result.totalItems === 1 ? "produto" : "produtos"})
          </span>
        )}
      </h1>

      {/* key força o formulário a reiniciar quando a URL muda (voltar, limpar, etc.) */}
      <SearchFilters
        key={`${includeUnavailable}-${onlyPromos}-${below ?? ""}`}
        value={filters}
        onApply={applyFilters}
      />

      {status === "loading" && (
        <p className="text-sm text-gray-400" role="status">
          Buscando produtos...
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-gray-500" role="status">
          Não foi possível pesquisar agora. Tente novamente.
        </p>
      )}

      {status === "ready" && result && result.items.length === 0 && (
        <p className="text-sm text-gray-500" role="status">
          Nenhum produto encontrado com esses critérios.
        </p>
      )}

      {status === "ready" && result && result.items.length > 0 && (
        <>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {result.items.map((product) => (
              <li key={product.productId}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>

          {result.totalPages > 1 && (
            <Pagination
              pageNow={result.page}
              totalPages={result.totalPages}
              onPageChange={goToPage}
            />
          )}
        </>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="max-w-[1000px] mx-auto px-4 py-6">
      <Suspense
        fallback={<p className="text-sm text-gray-400">Carregando...</p>}
      >
        <SearchResults />
      </Suspense>
    </main>
  );
}
