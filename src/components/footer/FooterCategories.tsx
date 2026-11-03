import Link from "next/link";
import { getCategories } from "@/lib/category";

export default async function FooterCategories() {
  const categories = await getCategories();

  if (!categories?.length) return null;

  return (
    <>
      {categories.slice(0, 4).map((category) => (
        <Link
          className="text-footer-muted"
          href={`/produtos/all?categoryId=${category.categoryId}`}
          key={category.name}
        >
          {category.name}
        </Link>
      ))}
    </>
  );
}
