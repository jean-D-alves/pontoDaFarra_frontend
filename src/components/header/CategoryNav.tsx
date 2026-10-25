import { Category } from "@/src/types/category";
import Link from "next/link";

interface CategoryNavProps {
  categories: Category[];
  activeSlug?: string;
}

export default function CategoryNav({
  categories,
  activeSlug,
}: CategoryNavProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Categorias" className="w-full">
      <ul className="flex items-center gap-6 whitespace-nowrap">
        {categories.map((category) => {
          const isActive = activeSlug === category.slug;
          return (
            <li key={category.id}>
              <Link
                href={`/categoria/${category.slug}`}
                className={`text-sm ${
                  isActive
                    ? "text-black border-b border-gray-400 pb-0.5"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
