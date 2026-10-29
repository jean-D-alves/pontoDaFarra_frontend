import type { Metadata } from "next";
import Header from "@/src/components/header/Header";
import CartContent from "./CartContent";

export const metadata: Metadata = {
  title: "Meu carrinho",
};

export default function CartPage() {
  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-[1000px] px-4 py-6">
        <CartContent />
      </main>
    </>
  );
}
