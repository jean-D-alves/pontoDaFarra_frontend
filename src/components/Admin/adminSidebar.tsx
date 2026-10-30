"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useUser } from "@/src/Context/UserContext";
interface AdminSidebarProps {
  name: string;
  role: string;
}

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Produtos", href: "/admin/produtos", icon: Package },
  { label: "Categorias", href: "/admin/categorias", icon: Tag },
  { label: "Pedidos", href: "/admin/pedidos", icon: ReceiptText },
  { label: "Usuários", href: "/admin/usuarios", icon: Users },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isActive(pathname: string, href: string): boolean {
  // "/admin" só fica ativo na própria rota; as demais também nas subrotas.
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const name = user?.name ?? "";
  const role = user?.role ?? "";

  return (
    <aside
      aria-label="Menu do administrador"
      className="flex w-full shrink-0 flex-col gap-7 rounded-2xl bg-[#0A0A0A] px-5 pb-6 pt-8 text-white lg:max-w-[300px]"
    >
      <div className="flex flex-col items-center gap-3 border-b border-[#2A2A2A] pb-7 text-center">
        <div
          aria-hidden="true"
          className="bg-brand-gradient flex h-20 w-20 items-center justify-center rounded-full text-[28px] font-bold text-[#0A0A0A]"
        >
          {getInitials(name)}
        </div>

        <p className="min-h-[26px] text-[17px] font-semibold">{name}</p>

        {role && (
          <span className="inline-flex items-center rounded-full border border-[#FFC31F] px-3.5 py-1 text-[13px] font-medium text-[#FFC31F]">
            {role}
          </span>
        )}
      </div>

      <nav aria-label="Páginas do admin">
        <ul className="flex flex-col gap-1.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-[15px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC31F] ${
                    active
                      ? "bg-brand-gradient font-semibold text-[#0A0A0A]"
                      : "font-medium text-[#E7E5DF] hover:bg-white/10"
                  }`}
                >
                  <Icon aria-hidden="true" size={20} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
