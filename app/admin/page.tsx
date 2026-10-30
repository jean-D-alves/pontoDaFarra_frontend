export const instant = false;

export default function AdminPage() {
  return (
    <main className="min-w-0 flex-1">
      <section
        aria-labelledby="admin-dashboard-title"
        className="flex min-h-[600px] w-full min-w-0 flex-col gap-7 rounded-2xl bg-background p-5 sm:p-8"
      >
        <header className="flex flex-col gap-2">
          <h1
            id="admin-dashboard-title"
            className="text-[28px] font-bold leading-tight text-[#0A0A0A]"
          >
            Produtos mais pedidos
          </h1>
          <p className="max-w-2xl text-[15px] leading-6 text-[#52514E]">
            Ranking dos produtos por quantidade, valor e número de pedidos.
          </p>
        </header>
      </section>
    </main>
  );
}
