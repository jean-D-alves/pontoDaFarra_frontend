import BannersSkeleton from "@/src/components/Banners/BannersSkeleton";
import MostOrder from "@/src/components/product/MostOrder";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col m-10">
      <BannersSkeleton />
      <div className="flex flex-col p-5 gap-2">
        <h1 className="flex text-2xl">
          <strong>Produtos mais pedidos</strong>
        </h1>
      </div>
    </div>
  );
}
