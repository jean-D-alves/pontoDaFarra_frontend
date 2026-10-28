import { Suspense } from "react";
import { BeerOff, TriangleAlert } from "lucide-react";
import Header from "@/src/components/header/Header";
import EmptyState from "@/src/components/EmptyState";
import Loading from "@/src/components/Loading";
import { Category } from "@/src/types/category";
import CategoriesGrid from "./CategoriesGrid";

async function getCategories(): Promise<Category[] | null> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

  if (!backendUrl) return null;

  try {
    const response = await fetch(`${backendUrl}/category/all`, {
      cache: "no-store",
    });

    if (!response.ok) return null;

    return (await response.json()) as Category[];
  } catch {
    return null;
  }
}

async function CategoriesContent() {
  const categories = await getCategories();

  if (!categories) {
    return (
      <EmptyState
        role="alert"
        icon={TriangleAlert}
        title="Categorias indisponíveis"
        description="Não foi possível carregar as categorias. Tente novamente mais tarde."
      />
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={BeerOff}
        title="Nenhuma categoria por aqui"
        description="Ainda não há categorias cadastradas no momento."
      />
    );
  }

  return <CategoriesGrid categories={categories} />;
}

export default function CategoriesPage() {
  return (
    <>
      <Header />

      <section className="mx-auto w-full max-w-[1000px] px-4 py-6">
        <header className="mb-6">
          <h1 className="font-display text-3xl text-black">Categorias</h1>
          <p className="text-sm text-muted">
            Escolha uma categoria para ver os produtos.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="flex justify-center py-16" role="status">
              <Loading />
            </div>
          }
        >
          <CategoriesContent />
        </Suspense>
      </section>
    </>
  );
}
