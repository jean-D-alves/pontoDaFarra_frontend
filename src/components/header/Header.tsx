"use client";

import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SearchInput from "./SearchInput";
import CartButton from "./CartButton";
import CategoryNav from "./CategoryNav";
import { RequestAll } from "@/src/Handle/Category";
import { Category } from "@/src/types/category";
import { useUser } from "@/src/Context/UserContext";
import MenuUser from "./MenuUser";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

type CategoriesStatus = "loading" | "ready" | "error";

export default function Header() {
  const { user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesStatus, setCategoriesStatus] =
    useState<CategoriesStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    RequestAll()
      .then((data) => {
        if (cancelled) return;

        if (!data) {
          setCategoriesStatus("error");
          return;
        }

        setCategories(data);
        setCategoriesStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setCategoriesStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
              <MenuUser user={user} />
            ) : (
              <Link href="/auth" className="text-sm text-black hidden md:block">
                Entrar
              </Link>
            )}
            <CartButton />
          </div>

          {categoriesStatus === "loading" && (
            <p className="text-sm text-gray-400" role="status">
              Carregando categorias...
            </p>
          )}

          {categoriesStatus === "error" && (
            <p className="text-sm text-gray-500" role="status">
              Categorias não estão disponíveis no momento.
            </p>
          )}

          {categoriesStatus === "ready" && categories.length === 0 && (
            <p className="text-sm text-gray-500" role="status">
              Nenhuma categoria disponível no momento.
            </p>
          )}

          {categoriesStatus === "ready" && categories.length > 0 && (
            <Suspense fallback={<CategoryNav categories={categories} />}>
              <ActiveCategoryNav categories={categories} />
            </Suspense>
          )}
        </div>
      </div>
    </header>
  );
}

function ActiveCategoryNav({ categories }: { categories: Category[] }) {
  const params = useParams<{ name?: string | string[] }>();
  const activeName = Array.isArray(params.name) ? params.name[0] : params.name;

  return <CategoryNav categories={categories} activeName={activeName} />;
}
