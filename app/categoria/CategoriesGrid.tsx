import Link from "next/link";
import { Beer } from "lucide-react";
import { Category } from "@/src/types/category";

export default function CategoriesGrid({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <li key={category.categoryId}>
          <Link
            href={`/categoria/${encodeURIComponent(category.name)}`}
            className="group flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-white px-4 py-8 text-center transition hover:border-brand hover:shadow-sm"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-black transition group-hover:bg-brand">
              <Beer size={24} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold capitalize text-black">
              {category.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
