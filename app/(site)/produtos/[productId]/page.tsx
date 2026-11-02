import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveImageUrl } from "@/src/Handle/Image";
import { getProductById } from "@/src/services/catalog";
import ProductSkeleton from "@/src/components/product/ProductSkeleton";
import ProductDetail from "./ProductDetail";

export async function generateMetadata({
  params,
}: PageProps<"/produtos/[productId]">): Promise<Metadata> {
  const { productId } = await params;

  try {
    const product = await getProductById(productId);

    if (!product) {
      return { title: "Produto não encontrado" };
    }

    const image = resolveImageUrl(product.imageUrl);

    return {
      title: product.name,
      description: product.description ?? undefined,
      openGraph: {
        title: product.name,
        description: product.description ?? undefined,
        images: image ? [{ url: image, alt: product.name }] : undefined,
      },
    };
  } catch {
    return { title: "Produto" };
  }
}

export default function ProductPage({
  params,
}: PageProps<"/produtos/[productId]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
