import ProductContent from "@/src/components/product/AllProducts";
import CreateProducts from "@/src/components/product/CreateProducts";

export const instant = false;

export default function productAdmin() {
  return (
    <main className="flex flex-col w-full">
      <ProductContent />
      <CreateProducts />
    </main>
  );
}
