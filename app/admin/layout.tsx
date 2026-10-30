import type { Metadata } from "next";
import type { ReactNode } from "react";

import AdminGuard from "@/src/components/Admin/AdminGuard";
import Header from "@/src/components/header/Header";

export const metadata: Metadata = {
  title: "Ponto da Farra | Página Admin",
  description: "Distribuidora de bebidas em Acari, RN",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <body>
      <AdminGuard>{children}</AdminGuard>
    </body>
  );
}
