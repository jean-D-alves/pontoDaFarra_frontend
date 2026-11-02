import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BeerOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Produto não encontrado",
};

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-col items-center px-4 py-16 text-center">
      <BeerOff
        aria-hidden="true"
        size={56}
        strokeWidth={1.5}
        className="text-muted"
      />
      <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-stone-strong">
        Produto não encontrado
      </h1>
      <p className="mt-2 max-w-[48ch] text-base leading-relaxed text-body">
        O produto que você procura não existe ou não está mais disponível no
        cardápio.
      </p>
      <Link
        href="/categoria"
        className="mt-8 inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-brand-gradient px-7 text-base font-bold text-stone-strong transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <ArrowLeft aria-hidden="true" size={18} />
        Voltar ao cardápio
      </Link>
    </main>
  );
}
