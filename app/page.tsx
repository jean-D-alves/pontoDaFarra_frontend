import BannersSkeleton from "@/src/components/Banners/BannersSkeleton";
import MostOrder from "@/src/components/product/MostOrder";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col m-10">
      <BannersSkeleton />
      <MostOrder />
    </div>
  );
}
