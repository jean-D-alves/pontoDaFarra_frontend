"use client"
import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import SearchInput from "./SearchInput";
import CartButton from "./CartButton";
import CategoryNav from "./CategoryNav";
import { Category } from "@/src/types/category";
import { useUser } from "@/src/Context/UserContext";
import MenuUser from "./MenuUser";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

interface HeaderProps {
  categories: Category[];
  cartCount: number;
  activeSlug?: string;
}

export default function Header({
  categories,
  cartCount,
  activeSlug,
}: HeaderProps) {
  const { user } = useUser();
  return (
    <header className="bg-[#f1f1f1] w-full">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
            <Link
              href="/"
              className={`${bebasNeue.className} text-2xl tracking-wide text-black`}
            >
              PONTO DA FARRA
            </Link>
            <div className="order-last w-full md:order-none md:flex-1">
              <SearchInput />
            </div>
            {user ? (
              <MenuUser user={user}/>
            ) : (
              <Link href="/auth" className="text-sm text-black hidden md:block">
                Entrar
              </Link>
            )}
            <CartButton cartCount={cartCount} />
          </div>
          <CategoryNav categories={categories} activeSlug={activeSlug} />
        </div>
      </div>
    </header>
  );
}
