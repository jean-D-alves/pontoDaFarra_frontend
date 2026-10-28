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
      className="flex items-center gap-2 bg-black text-yellow-400 rounded-full px-4 py-2"
    >
      <ShoppingCart size={18} />
      <span className="text-sm">Carrinho ({cartCount})</span>
    </Link>
  );
}
