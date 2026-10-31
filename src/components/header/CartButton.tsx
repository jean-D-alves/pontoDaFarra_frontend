"use client";

import { useSyncExternalStore } from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import {
  countCartItems,
  getCartServerSnapshot,
  getCartSnapshot,
  subscribeToCart,
} from "@/src/Handle/Cart";

export default function CartButton() {
  const cartJson = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const cartCount = countCartItems(cartJson);

  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho de compras, ${cartCount} item(ns)`}
      className="relative flex items-center gap-2 rounded-full bg-black p-2 text-yellow-400 sm:px-4"
    >
      <ShoppingCart size={18} />

      <span className="hidden text-sm sm:inline">Carrinho ({cartCount})</span>

      {/* Mobile: badge com a contagem sobre o ícone */}
      {cartCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-xs font-bold text-black sm:hidden"
        >
          {cartCount}
        </span>
      )}
    </Link>
  );
}