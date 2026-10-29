"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BeerOff } from "lucide-react";
import {
  buildOrderPayload,
  clearCart,
  getCart,
  getCartItemNames,
  removeFromCart,
  subscribeToCart,
  updateCartItemQuantity,
} from "@/lib/cart";
import EmptyState from "@/src/components/EmptyState";
import CartBreadcrumb from "@/src/components/cart/CartBreadcrumb";
import CartItemCard from "@/src/components/cart/CartItemCard";
import CartSkeleton from "@/src/components/cart/CartSkeleton";
import CartSummary from "@/src/components/cart/CartSummary";
import LastOrderBanner from "@/src/components/cart/LastOrderBanner";
import type { CartItem } from "@/src/types/cart";

type CartState = {
  items: CartItem[];
  loaded: boolean;
};

export default function CartContent() {
  const [cart, setCart] = useState<CartState>({ items: [], loaded: false });

  useEffect(() => {
    // Leitura única no cliente evita divergência entre o HTML do servidor e o
    // carrinho salvo no localStorage durante a hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart({ items: getCart(), loaded: true });

    return subscribeToCart(() => {
      setCart({ items: getCart(), loaded: true });
    });
  }, []);

  const { items, loaded } = cart;

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );
  const order = useMemo(() => buildOrderPayload(items), [items]);
  const itemNames = useMemo(() => getCartItemNames(items), [items]);

  function handleIncrease(item: CartItem) {
    setCart({
      items: updateCartItemQuantity(item.productId, item.quantity + 1),
      loaded: true,
    });
  }

  function handleDecrease(item: CartItem) {
    setCart({
      items: updateCartItemQuantity(item.productId, item.quantity - 1),
      loaded: true,
    });
  }

  function handleRemove(item: CartItem) {
    setCart({
      items: removeFromCart(item.productId),
      loaded: true,
    });
  }

  function handleOrderSent() {
    clearCart();
    setCart({ items: [], loaded: true });
  }

  return (
    <>
      <CartBreadcrumb />

      {!loaded ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <div>
          <LastOrderBanner />

          <EmptyState
            icon={BeerOff}
            title="Seu carrinho está vazio"
            description="Adicione produtos do cardápio para montar o seu pedido."
          />

          <div className="mt-6 flex justify-center">
            <Link
              href="/categoria"
              className="inline-flex min-h-[52px] items-center rounded-xl bg-brand-gradient px-7 text-base font-bold text-stone-strong transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Ver produtos
            </Link>
          </div>
        </div>
      ) : (
        <>
          <header className="mb-6">
            <h1 className="font-display text-3xl text-stone-strong sm:text-4xl">
              Meu carrinho{" "}
              <span className="ml-1 align-middle font-sans text-base font-semibold text-stone">
                ({totalItems} {totalItems === 1 ? "item" : "itens"})
              </span>
            </h1>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <section aria-labelledby="itens-carrinho">
              <h2 id="itens-carrinho" className="sr-only">
                Itens do carrinho
              </h2>

              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.productId}>
                    <CartItemCard
                      item={item}
                      onIncrease={() => handleIncrease(item)}
                      onDecrease={() => handleDecrease(item)}
                      onRemove={() => handleRemove(item)}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <CartSummary
              totalItems={totalItems}
              order={order}
              itemNames={itemNames}
              onOrderSent={handleOrderSent}
            />
          </div>
        </>
      )}
    </>
  );
}
