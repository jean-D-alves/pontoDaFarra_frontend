import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/src/types/Products";
import WhatsAppOrderButton from "./WhatsAppOrderButton";
import AddToCartButton from "../AddToCartButton";

export default function ProductActions({ product }: { product: Product }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <AddToCartButton product={product}/>

      <Link
        href="/categoria"
        className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-line-warm px-6 text-sm font-semibold text-stone-strong transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <ArrowLeft aria-hidden="true" size={18} />
        Voltar ao cardápio
      </Link>
    </div>
  );
}
