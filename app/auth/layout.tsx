import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ponto da Farra | Faça login",
  description: "Distribuidora de bebidas em Acari, RN",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
