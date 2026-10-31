"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { requestOrderAdmin, requestOrderDelete } from "@/src/Handle/Order";
import { requestProductGetIdCached } from "@/src/Handle/Product";
import { shortOrderId } from "@/lib/order";
import type { Order, OrderListResponse } from "@/src/types/order";
import ConfirmMessage from "../ConfirmMessage";
import Pagination from "../Pagination";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function MostOrderAdmin() {
  const [data, setData] = useState<OrderListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    requestOrderAdmin(page)
      .then((result) => {
        if (!cancelled) {
          setError(null);
          setData(result);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  // resolve os nomes dos produtos uma única vez por página
  useEffect(() => {
    if (!data) return;

    let cancelled = false;
    const productIds = [
      ...new Set(data.items.flatMap((order) => order.items.map((item) => item.productId))),
    ];

    Promise.allSettled(
      productIds.map((id) => requestProductGetIdCached(id)),
    ).then((results) => {
      if (cancelled) return;

      const names: Record<string, string> = {};
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          names[productIds[index]] = result.value.name;
        }
      });

      setProductNames(names);
    });

    return () => {
      cancelled = true;
    };
  }, [data]);

  async function handleConfirmDelete() {
    const order = orderToDelete;

    if (!order) return;

    setOrderToDelete(null);
    setDeletingId(order.orderId);
    setDeleteError(null);

    try {
      await requestOrderDelete(order.orderId);

      const isLastOnPage = data?.items.length === 1;

      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.filter(
                (item) => item.orderId !== order.orderId,
              ),
              totalItems: Math.max(0, current.totalItems - 1),
            }
          : current,
      );

      // se a página ficou vazia, volta para a anterior
      if (isLastOnPage && page > 1) {
        setPage((current) => current - 1);
      }
    } catch {
      setDeleteError("Não foi possível excluir o pedido. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-muted">Carregando pedidos...</p>;
  }

  if (data.items.length === 0) {
    return <p className="text-sm text-muted">Nenhum pedido encontrado.</p>;
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">
          Pedidos
        </h1>
        <p className="text-[15px] leading-normal text-muted">
          {data.totalItems} {data.totalItems === 1 ? "pedido" : "pedidos"} no
          total.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {data.items.map((order) => (
          <li
            key={order.orderId}
            className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="truncate text-[17px] font-semibold">
                  {order.customerName}
                </h2>
                <p className="text-sm text-muted">{order.customerPhone}</p>
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <p className="text-lg font-bold">
                  {currency.format(order.totalValue)}
                </p>
                <p className="text-xs text-muted">
                  {dateTime.format(new Date(order.createdAt))}
                </p>
              </div>
            </div>

            <ul className="flex flex-col divide-y divide-line border-t border-line">
              {order.items.map((item, index) => (
                <li
                  key={`${item.productId}-${index}`}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate">
                    {productNames[item.productId] ?? item.productId}
                  </span>
                  <span className="shrink-0 text-muted">
                    {item.quantity} × {currency.format(item.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs text-muted">
                {shortOrderId(order.orderId)}
              </span>

              <button
                type="button"
                onClick={() => setOrderToDelete(order)}
                disabled={deletingId === order.orderId}
                aria-busy={deletingId === order.orderId}
                aria-label={`Excluir pedido ${shortOrderId(order.orderId)}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line-warm px-4 text-sm font-semibold text-unavailable-text transition hover:bg-unavailable-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60"
              >
                <Trash2 aria-hidden="true" size={16} />
                {deletingId === order.orderId ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {deleteError && (
        <p role="alert" className="text-sm font-medium text-unavailable-text">
          {deleteError}
        </p>
      )}

      {data.totalPages > 1 && (
        <Pagination
          pageNow={data.page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}

      {orderToDelete && (
        <ConfirmMessage
          variant="danger"
          title="Excluir pedido?"
          message={`O pedido ${shortOrderId(orderToDelete.orderId)} será removido do histórico. Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={handleConfirmDelete}
          onCancel={() => setOrderToDelete(null)}
        />
      )}
    </div>
  );
}
