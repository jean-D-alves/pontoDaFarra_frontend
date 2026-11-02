import MostOrderAdmin from "@/src/components/Admin/MostOrderAdmin";

export const instant = false;

export default function AdminPedidos() {
  return (
    <main className="min-w-0 flex-1">
      <section
        aria-labelledby="admin-dashboard-title"
        className="flex min-h-[600px] w-full min-w-0 flex-col gap-7 rounded-2xl bg-background p-5 sm:p-8"
      >
        <MostOrderAdmin />
      </section>
    </main>
  );
}
