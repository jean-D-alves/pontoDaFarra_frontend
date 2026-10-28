import { Category, CategoryWithProducts } from "@/src/types/category";

export async function RequestAll(): Promise<Category[] | null> {
  const response = await fetch("/api/category/all", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json();
}

export async function RequestName(
  name: string,
  page = 1,
  pageSize = 10,
): Promise<CategoryWithProducts | null> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(
    `/api/category/name/${encodeURIComponent(name)}?${query}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) return null;
  return response.json();
}
