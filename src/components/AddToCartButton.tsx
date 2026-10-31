"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { addToCart } from "@/src/Handle/Cart";
import { Product } from "@/src/types/Products";

export default function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;

    const timeout = window.setTimeout(() => setAdded(false), 1500);

    return () => window.clearTimeout(timeout);
  }, [added]);

  function handleAdd() {
    addToCart(product);
    setAdded(true);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!product.isAvailable}
      aria-label={
        added
          ? `${product.name} adicionado ao carrinho`
          : `Adicionar ${product.name} ao carrinho`
      }
      className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {added ? <Check size={18} /> : <ShoppingCart size={18} />}
      <span className="hidden sm:inline">
        {added ? "Adicionado" : "Adicionar ao carrinho"}
      </span>
    </button>
  );
}