"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { shortOrderId } from "@/lib/order";
import EmptyState from "@/src/components/EmptyState";
import ConfirmMessage from "@/src/components/ConfirmMessage";
import { useUser } from "@/src/Context/UserContext";
import { requestOrderDelete, requestOrderMe } from "@/src/Handle/Order";
import { getProductById } from "@/src/services/catalog";
import type { Order } from "@/src/types/order";
import type { Product } from "@/src/types/Products";
import OrderCard from "./OrderCard";
import OrderHistorySkeleton from "./OrderHistorySkeleton";

const ERROR_MESSAGE = "Não foi possível carregar seus pedidos.";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

async function loadProducts(
  orders: Order[],
): Promise<Record<string, Product | null>> {
  const productIds = Array.from(
    new Set(orders.flatMap((order) => order.items.map((item) => item.productId))),
  );

  const entries = await Promise.all(
    productIds.map(async (productId) => {
      try {
        return [productId, await getProductById(productId)] as const;
      } catch {
        // Produto removido ou backend indisponível: o card mostra o fallback.
        return [productId, null] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}

export default function OrderHistory() {
  const { user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Record<string, Product | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !user) return;

    let active = true;

    requestOrderMe()
      .then(async (list) => {
        const sorted = [...list].sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
        );
        const productMap = await loadProducts(sorted);

        if (!active) return;

        setOrders(sorted);
        setProducts(productMap);
      })
      .catch(() => {
        if (!active) return;

        setOrders(null);
        setError(ERROR_MESSAGE);
      });

    return () => {
      active = false;
    };
  }, [reloadKey, user, userLoading]);

  function handleRetry() {
    setOrders(null);
    setError(null);
    setReloadKey((current) => current + 1);
  }

  async function handleConfirmDelete() {
    const order = orderToDelete;

    if (!order) return;

    setOrderToDelete(null);
    setDeletingId(order.orderId);
    setDeleteError(null);

    try {
      await requestOrderDelete(order.orderId);
      setOrders((current) =>
        current
          ? current.filter((item) => item.orderId !== order.orderId)
          : current,
      );
    } catch {
      setDeleteError("Não foi possível excluir o pedido. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  }

  const isSkeleton = userLoading || (orders === null && error === null);

  return (
    <section
      aria-labelledby="meus-pedidos-titulo"
      className="flex w-full min-w-0 flex-col"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="meus-pedidos-titulo"
          className="text-2xl font-bold text-stone-strong"
        >
          Meus pedidos
        </h2>

        {orders && !error && (
          <span className="rounded-full bg-surface px-3 py-1 text-sm font-semibold text-stone">
            {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
          </span>
        )}
      </div>

      <div className="mt-6 flex-1">
        {isSkeleton ? (
          <OrderHistorySkeleton />
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col items-start gap-4 rounded-2xl border border-[#E7E5DF] bg-white p-5"
          >
            <p className="text-sm font-semibold text-unavailable-text">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className={`inline-flex min-h-[44px] items-center rounded-xl border border-line-warm bg-white px-5 text-sm font-semibold text-stone-strong transition hover:bg-surface ${focusRing}`}
            >
              Tentar novamente
            </button>
          </div>
        ) : orders && orders.length === 0 ? (
          <div>
            <EmptyState
              icon={ReceiptText}
              title="Você ainda não fez pedidos"
              description="Quando você finalizar um pedido, ele aparece aqui."
            />

            <div className="mt-6 flex justify-center">
              <Link
                href="/categoria"
                className={`inline-flex min-h-[52px] items-center rounded-xl bg-[linear-gradient(135deg,#FDE047,#FACC15)] px-7 text-base font-bold text-[#1C1917] transition hover:opacity-90 ${focusRing}`}
              >
                Ver produtos
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {orders?.map((order, index) => (
                <li key={order.orderId}>
                  <OrderCard
                    order={order}
                    products={products}
                    defaultExpanded={index === 0}
                    onDelete={setOrderToDelete}
                    isDeleting={deletingId === order.orderId}
                  />
                </li>
              ))}
            </ul>

            {deleteError && (
              <p
                role="alert"
                className="mt-4 text-sm font-medium text-unavailable-text"
              >
                {deleteError}
              </p>
            )}
          </>
        )}
      </div>

      {orderToDelete && (
        <ConfirmMessage
          variant="danger"
          title="Excluir pedido?"
          message={`O pedido ${shortOrderId(orderToDelete.orderId)} será removido do seu histórico. Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={handleConfirmDelete}
          onCancel={() => setOrderToDelete(null)}
        />
      )}
    </section>
  );
}
