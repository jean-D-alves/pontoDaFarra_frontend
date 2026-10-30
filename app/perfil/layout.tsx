import Header from "@/src/components/header/Header";
import { UserProvider } from "@/src/Context/UserContext";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ponto da Farra | Seu Perfil",
  description: "Distribuidora de bebidas em Acari, RN",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <body className="min-h-full flex flex-col">
      {children}
    </body>
  );
}
