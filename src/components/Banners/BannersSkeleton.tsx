"use client";
import { useRouter } from "next/navigation";
import Banner from "./Banner";

export default function BannersSkeleton() {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col gap-4 md:flex-row">
      <Banner
        type="first"
        onClick={() => {
          router.push("/#most-order");
        }}
      >
        Aproveite os mais pedidos
      </Banner>
      <Banner type="second">Escolha um combo gelo</Banner>
    </div>
  );
}
