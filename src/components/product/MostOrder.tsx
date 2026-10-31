"use client";

import { useEffect, useState } from "react";
import { requestMoreOrder } from "@/src/Handle/Order";
import type { OrderMetricsResponse } from "@/src/types/order";
import MostOrderedProducts from "./MostOrderedProducts";

export default function MostOrder() {
  const [metrics, setMetrics] = useState<OrderMetricsResponse | null>(null);

  useEffect(() => {
    requestMoreOrder().then(setMetrics).catch(console.error);
  }, []);

  if (!metrics) return null;

  return <MostOrderedProducts items={metrics.byOrderCount} />;
}
