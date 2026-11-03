"use client";

import { useEffect, useState } from "react";
import { requestMoreOrder } from "@/src/Handle/Order";
import type { MoreOrderResponse } from "@/src/types/Products";
import MostOrderEmptyState from "./MostOrderEmptyState";
import MostOrderedProducts from "./MostOrderedProducts";
import Link from "next/link";

export default function MostOrder() {
  const [metrics, setMetrics] = useState<MoreOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    requestMoreOrder()
      .then((data) => {
        if (cancelled) return;
        setMetrics(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-muted">Carregando produtos...</p>;
  }

  if (error) {
    return (
      <MostOrderEmptyState message="A API de pedidos não respondeu. Tente novamente mais tarde." />
    );
  }

  if (!metrics || !metrics.byOrderCount || metrics.byOrderCount.length === 0) {
    return (
      <MostOrderEmptyState message="Ainda não há produtos pedidos suficientes para montar essa lista." />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <MostOrderedProducts items={metrics.byOrderCount} />
      <Link
        href={"/produtos/all"}
        className="flex w-full rounded-xl justify-center items-center font-bold p-2 bg-brand-gradient"
      >
        ver todos os produtos
      </Link>
    </div>
  );
}
