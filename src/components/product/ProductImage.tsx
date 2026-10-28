import Image from "next/image";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  name: string;
  imageUrl: string | null;
  isPromotional: boolean;
}

const placeholderStripes = {
  backgroundImage:
    "repeating-linear-gradient(135deg, var(--color-placeholder-a) 0 12px, var(--color-placeholder-b) 12px 24px)",
};

export default function ProductImage({
  name,
  imageUrl,
  isPromotional,
}: ProductImageProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-surface">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          preload
          sizes="(min-width: 768px) 520px, 100vw"
          className="object-cover"
        />
      ) : (
        <div
          className="flex h-full flex-col items-center justify-center gap-2 text-stone"
          style={placeholderStripes}
        >
          <ImageOff aria-hidden="true" size={40} strokeWidth={1.5} />
          <span className="text-sm">Sem imagem</span>
        </div>
      )}

      {isPromotional && (
        <span className="absolute left-4 top-4 rounded-full bg-promo-bg px-3 py-1 text-[13px] font-bold uppercase tracking-[0.12em] text-promo-text">
          Promoção
        </span>
      )}
    </div>
  );
}
