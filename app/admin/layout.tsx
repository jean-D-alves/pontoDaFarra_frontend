import type { ReactNode } from "react";
import Header from "@/src/components/header/Header";
export const instant = false;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#D4D4D4]">
      <Header />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 p-4 lg:flex-row lg:items-start">
        {children}
      </div>
    </div>
  );
}
