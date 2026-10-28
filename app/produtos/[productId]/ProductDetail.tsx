import Link from "next/link";
import { notFound } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { resolveImageUrl } from "@/src/Handle/Image";
import { getCategoryById, getProductById } from "@/src/services/catalog";
import type { Product } from "@/src/types/Products";
import EmptyState from "@/src/components/EmptyState";
import ProductActions from "@/src/components/product/ProductActions";
import ProductBadges from "@/src/components/product/ProductBadges";
import ProductBreadcrumb from "@/src/components/product/ProductBreadcrumb";
import ProductDetailsList from "@/src/components/product/ProductDetailsList";
import ProductImage from "@/src/components/product/ProductImage";
import ProductPrice from "@/src/components/product/ProductPrice";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  let product: Product | null;

  try {
    product = await getProductById(productId);
  } catch {
    return <ProductUnavailable />;
  }

  if (!product) notFound();

  const category = await getCategoryById(product.categoryId);
  const categoryName = category?.name ?? null;

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6">
      <ProductBreadcrumb
        productId={product.productId}
        productName={product.name}
        categoryName={categoryName}
      />

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start md:gap-12">
        <ProductImage
          name={product.name}
          imageUrl={resolveImageUrl(product.imageUrl)}
          isPromotional={product.isPromotional}
        />

        <div className="flex flex-col gap-6">
          <ProductBadges
            categoryName={categoryName}
            isAvailable={product.isAvailable}
          />

          <div className="flex flex-col gap-4">
            <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-stone-strong">
              {product.name}
            </h1>

            <ProductPrice
              value={Number(product.value)}
              isPromotional={product.isPromotional}
            />
          </div>

          {product.description && (
            <p className="max-w-[56ch] text-[17px] leading-relaxed text-body">
              {product.description}
            </p>
          )}

          <ProductActions product={product} />

          <ProductDetailsList
            productId={product.productId}
            categoryName={categoryName}
          />
        </div>
      </div>
    </main>
  );
}

function ProductUnavailable() {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 py-10">
      <EmptyState
        role="alert"
        icon={TriangleAlert}
        title="Não foi possível carregar o produto"
        description="Tente novamente em instantes ou volte ao cardápio para escolher outro produto."
      />

      <div className="mt-6 flex justify-center">
        <Link
          href="/categoria"
          className="inline-flex min-h-[52px] items-center rounded-xl border border-line-warm px-6 text-sm font-semibold text-stone-strong transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Voltar ao cardápio
        </Link>
      </div>
    </main>
  );
}
