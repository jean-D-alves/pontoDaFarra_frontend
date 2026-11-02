import CategoryAdminContent from "@/src/components/Admin/CategoryAdminContent";

export const instant = false;

export default function AdminCategorias() {
  return (
    <main className="min-w-0 flex-1">
      <section
        aria-labelledby="admin-categories-title"
        className="flex min-h-[600px] w-full min-w-0 flex-col gap-7 rounded-2xl bg-background p-5 sm:p-8"
      >
        <CategoryAdminContent />
      </section>
    </main>
  );
}
