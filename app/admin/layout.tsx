import AdminSidebar from "@/src/components/Admin/adminSidebar";
import Header from "@/src/components/header/Header";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#D4D4D4]">
      <Header />
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-stretch">
        <AdminSidebar />

        <main className="min-w-0 flex-1 rounded-2xl bg-white p-8">
          {children}
        </main>
      </div>
    </div>
  );
}