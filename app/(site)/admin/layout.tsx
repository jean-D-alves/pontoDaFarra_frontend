import type { Metadata } from "next";
import type { ReactNode } from "react";

import AdminGuard from "@/src/components/Admin/AdminGuard";
import AdminSidebar from "@/src/components/Admin/adminSidebar";
import LegalConsentGate from "@/src/components/legal/LegalConsentGate";

export const metadata: Metadata = {
  title: "Ponto da Farra | Página Admin",
  description: "Distribuidora de bebidas em Acari, RN",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 m-5 flex-col gap-2 lg:flex-row">
      <AdminGuard>
        <AdminSidebar />
        {children}
        <LegalConsentGate />
      </AdminGuard>
    </div>
  );
}
