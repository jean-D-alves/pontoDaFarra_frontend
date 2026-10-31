"use client";

import { useEffect, useState } from "react";
import { requestMoreOrder } from "@/src/Handle/Order";
import type { MoreOrderResponse } from "@/src/types/Products";
import MostOrderedProducts from "./MostOrderedProducts";

export default function MostOrder() {
  const [metrics, setMetrics] = useState<MoreOrderResponse | null>(null);

  useEffect(() => {
    requestMoreOrder().then(setMetrics).catch(console.error);
  }, []);

  if (!metrics) return null;

  return <MostOrderedProducts items={metrics.byOrderCount} />;
}
