import { Suspense } from "react";
import Header from "@/src/components/header/Header";
import Loading from "@/src/components/Loading";
import CategoryContent from "./CategoryContent";

export default function CategoryName({ params }: PageProps<"/categoria/[name]">) {
  return (
    <>
      <Header />

      <Suspense
        fallback={
          <div className="flex justify-center py-16" role="status">
            <Loading />
          </div>
        }
      >
        {params.then(({ name }) => (
          <CategoryContent key={name} name={name} />
        ))}
      </Suspense>
    </>
  );
}
