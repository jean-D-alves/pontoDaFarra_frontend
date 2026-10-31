"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OrderMetricsResponse } from "@/src/types/order";

type Datum = {
  name: string;
  value: number;
};

const PALETTE = [
  "#F5A800",
  "#0A0A0A",
  "#FFD43B",
  "#7A5C00",
  "#A8A59C",
  "#FFE9A3",
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function colorAt(index: number) {
  return PALETTE[index % PALETTE.length];
}

function DonutChart({ data, unit }: { data: Datum[]; unit: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="relative h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colorAt(index)} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} ${unit}`, ""]} />
          <Legend verticalAlign="bottom" iconType="square" />
        </PieChart>
      </ResponsiveContainer>

      {/* total no centro da rosca */}
      <div className="pointer-events-none absolute left-0 right-0 top-[40%] flex -translate-y-1/2 flex-col items-center">
        <span className="text-2xl font-bold">{total}</span>
        <span className="text-xs text-[#52514E]">{unit}</span>
      </div>
    </div>
  );
}

function ValueBarChart({ data }: { data: Datum[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, left: 8, right: 16 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
          <YAxis
            width={80}
            tickFormatter={(v) => currency.format(Number(v))}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [currency.format(Number(value)), "Faturado"]}
            cursor={{ fill: "#F3F1EA" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={colorAt(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function OrdersPieChart({ data }: { data: Datum[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius="80%"
            stroke="#FFFFFF"
            strokeWidth={2}
            label={({ percent }) =>
              `${((percent ?? 0) * 100).toFixed(1).replace(".", ",")}%`
            }
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colorAt(index)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [
              `${value} ${Number(value) === 1 ? "pedido" : "pedidos"}`,
              "",
            ]}
          />
          <Legend verticalAlign="bottom" iconType="square" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartCard({
  id,
  title,
  subtitle,
  empty,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="box-border flex min-w-0 flex-[1_1_300px] flex-col gap-6 rounded-2xl border border-[#E7E5DF] p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-[17px] font-semibold">
          {title}
        </h2>
        <p className="text-[13px] text-[#52514E]">{subtitle}</p>
      </div>

      {empty ? (
        <p className="text-sm text-[#52514E]">Sem dados para exibir.</p>
      ) : (
        children
      )}
    </section>
  );
}

export default function TopProductsDashboard({
  metrics,
}: {
  metrics: OrderMetricsResponse;
}) {
  const byQuantity: Datum[] = metrics.byQuantity
    .filter((p) => p.quantity > 0)
    .map((p) => ({ name: p.productName, value: p.quantity }));

  const byValue: Datum[] = metrics.byValue
    .filter((p) => p.totalValue > 0)
    .map((p) => ({ name: p.productName, value: p.totalValue }));

  const byOrderCount: Datum[] = metrics.byOrderCount
    .filter((p) => p.orderCount > 0)
    .map((p) => ({ name: p.productName, value: p.orderCount }));

  return (
    <main className="box-border flex min-h-[600px] min-w-0 flex-[999_1_560px] flex-col gap-7 rounded-2xl bg-white p-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">
          Produtos mais pedidos
        </h1>
        <p className="text-[15px] leading-normal text-[#52514E]">
          Ranking dos produtos por quantidade, valor e número de pedidos.
        </p>
      </div>

      <div className="flex flex-wrap items-stretch gap-5">
        <ChartCard
          id="g-quantidade"
          title="Por quantidade"
          subtitle="Unidades pedidas de cada produto"
          empty={byQuantity.length === 0}
        >
          <DonutChart data={byQuantity} unit="unidades" />
        </ChartCard>

        <ChartCard
          id="g-valor"
          title="Por valor"
          subtitle="Total faturado por produto"
          empty={byValue.length === 0}
        >
          <ValueBarChart data={byValue} />
        </ChartCard>

        <ChartCard
          id="g-pedidos"
          title="Por número de pedidos"
          subtitle="Em quantos pedidos cada produto aparece"
          empty={byOrderCount.length === 0}
        >
          <OrdersPieChart data={byOrderCount} />
        </ChartCard>
      </div>
    </main>
  );
}
