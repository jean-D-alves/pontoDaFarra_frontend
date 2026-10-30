"use client";

import Header from "@/src/components/header/Header";
import { useMemo, useSyncExternalStore } from "react";
import ProductCardCart from "@/src/components/Cart/ProductCardCart";
import {
  getCartServerSnapshot,
  getCartSnapshot,
  parseCart,
  subscribeToCart,
} from "@/lib/cart";
import SideBarCart from "@/src/components/Cart/SideBarCart";

export default function CartPage() {
  const raw = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );

  const products = useMemo(() => parseCart(raw), [raw]);

  return (
    <>
      <Header />

      <main className="mx-auto flex w-full max-w-[1000px] gap-6 px-4 py-6">
        <div className="flex flex-1 flex-col gap-4">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-8 text-center">
              <h2 className="text-xl font-semibold">Seu carrinho está vazio</h2>
              <p className="mt-2 text-gray-500">
                Adicione produtos ao carrinho para continuar.
              </p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCardCart key={product.productId} data={product} />
            ))
          )}
        </div>

        <SideBarCart items={products} />
      </main>
    </>
  );
}
