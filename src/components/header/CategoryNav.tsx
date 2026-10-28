import { Category } from "@/src/types/category";
import Link from "next/link";

interface CategoryNavProps {
  categories: Category[];
  activeName?: string;
}

export default function CategoryNav({
  categories,
  activeName,
}: CategoryNavProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const current = activeName?.toLowerCase();

  return (
    <nav aria-label="Categorias" className="w-full overflow-x">
      <ul className="flex items-center gap-6 whitespace-nowrap">
        {categories.slice(0, 2).map((category) => {
          const isActive =
            Boolean(current) && category.name?.toLowerCase() === current;

          return (
            <li key={category.categoryId ?? category.name}>
              <Link
                href={
                  category.name
                    ? `/categoria/${encodeURIComponent(category.name)}`
                    : "#"
                }
                aria-current={isActive ? "page" : undefined}
                className={`text-sm capitalize ${
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
        <li>
          <Link
            href="/categoria"
            className="text-sm text-gray-500 hover:text-black"
          >
            Ver todas
          </Link>
        </li>
      </ul>
    </nav>
  );
}
