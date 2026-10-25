import Header from "@/src/components/header/Header";
import { Category } from "@/src/types/category";

const mockCategories: Category[] = [
  { id: 1, name: "Oferta", slug: "oferta" },
  { id: 2, name: "Cerveja", slug: "cerveja" },
  { id: 3, name: "Tira-gosto", slug: "tira-gosto" },
  { id: 4, name: "Destilado", slug: "destilado" },
];

export default function Page() {
  return (
    <div>
      <Header categories={mockCategories} cartCount={0} activeSlug="cerveja" />
    </div>
  );
}
