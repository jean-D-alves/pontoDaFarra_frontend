"use client";

import { useEffect, useState } from "react";
import { requestOrderChart } from "@/src/Handle/Order";
import type { OrderMetricsResponse } from "@/src/types/order";
import TopProductsDashboard from "./DashBoard";

export default function DashBoardSection() {
  const [metrics, setMetrics] = useState<OrderMetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestOrderChart()
      .then(setMetrics)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!metrics) return <p className="text-sm">Carregando métricas...</p>;

  return <TopProductsDashboard metrics={metrics} />;
}
