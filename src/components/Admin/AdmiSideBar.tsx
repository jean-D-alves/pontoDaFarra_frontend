"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Produtos", href: "/admin/produtos", icon: Package },
  { label: "Categorias", href: "/admin/categorias", icon: Tag },
  { label: "Pedidos", href: "/admin/pedidos", icon: Receipt },
  { label: "Usuários", href: "/admin/usuarios", icon: Users },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[1][0] : (parts[0]?.[1] ?? "");
  return `${first}${second}`.toUpperCase();
}

export default function AdminSidebar({
  name,
  role = "Admin",
}: {
  name: string;
  role?: string;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    // o Dashboard (/admin) só fica ativo na rota exata
    if (href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      aria-label="Menu do administrador"
      className="box-border flex max-w-[300px] flex-[1_1_260px] flex-col gap-7 rounded-2xl bg-[#0A0A0A] px-5 pb-6 pt-8 text-white"
    >
      <div className="flex flex-col items-center gap-3 border-b border-[#2A2A2A] pb-7 text-center">
        <div
          aria-hidden="true"
          className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD43B] to-[#F5A800] text-[28px] font-bold text-[#0A0A0A]"
        >
          {getInitials(name)}
        </div>

        <div className="text-[17px] font-semibold">{name}</div>

        <span className="inline-flex items-center rounded-full border border-[#FFC31F] px-3.5 py-1 text-[13px] font-medium text-[#FFC31F]">
          {role}
        </span>
      </div>

      <nav aria-label="Páginas do admin" className="flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-[15px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC31F] ${
                active
                  ? "bg-gradient-to-br from-[#FFD43B] to-[#F5A800] font-semibold text-[#0A0A0A]"
                  : "font-medium text-[#E7E5DF] hover:bg-white/10"
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
