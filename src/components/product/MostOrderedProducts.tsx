"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/src/components/ProductCard";
import { requestProductGetIdCached } from "@/src/Handle/Product";
import type { Product } from "@/src/types/Products";
import type { ProductOrderCount } from "@/src/types/order";

type ProductWithCount = {
  product: Product;
  orderCount: number;
};

export default function MostOrderedProducts({
  items,
}: {
  items: ProductOrderCount[];
}) {
  const [products, setProducts] = useState<ProductWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      // ids únicos: uma requisição por produto
      const uniqueIds = [...new Set(items.map((item) => item.productId))];

      const results = await Promise.allSettled(
        uniqueIds.map((id) => requestProductGetIdCached(id)),
      );

      if (cancelled) return;

      const productById = new Map<string, Product>();
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          productById.set(uniqueIds[index], result.value);
        }
      });

      // mantém a ordem e a contagem de cada item das métricas
      const loaded: ProductWithCount[] = [];
      for (const item of items) {
        const product = productById.get(item.productId);
        if (product) {
          loaded.push({ product, orderCount: item.orderCount });
        }
      }

      if (loaded.length === 0 && items.length > 0) {
        setError("Não foi possível carregar os produtos.");
      }

      setProducts(loaded);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [items]);

  if (loading) {
    return <p className="text-sm text-muted">Carregando produtos...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="text-sm text-muted">Nenhum produto encontrado.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" id="most-order">
      {products.map(({ product, orderCount }, index) => (
        <li
          key={`${product.productId}-${index}`}
          className="flex flex-col gap-1"
        >
          <ProductCard product={product} />
          <span className="text-center text-xs text-muted">
            {orderCount} {orderCount === 1 ? "pedido" : "pedidos"}
          </span>
        </li>
      ))}
    </ul>
  );
}
