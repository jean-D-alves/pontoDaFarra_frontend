"use client";

import { useCallback, useEffect, useState } from "react";
import { BeerOff, CheckCircle2, TriangleAlert } from "lucide-react";
import EmptyState from "@/src/components/EmptyState";
import Loading from "@/src/components/Loading";
import CategoryCardAdmin from "@/src/components/Admin/CategoryCardAdmin";
import CreateCategory from "@/src/components/Admin/CreateCategory";
import { RequestAll } from "@/src/Handle/Category";
import type { Category } from "@/src/types/category";

const FEEDBACK_DURATION = 4000;

export default function CategoryAdminContent() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    RequestAll()
      .then((result) => {
        if (cancelled) return;

        if (!result) {
          setError("Não foi possível carregar as categorias.");
          return;
        }

        setError(null);
        setCategories(result);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar as categorias.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => setFeedback(null), FEEDBACK_DURATION);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleChanged = useCallback((message?: string) => {
    if (message) setFeedback(message);
    setError(null);
    setLoading(true);
    setReloadToken((current) => current + 1);
  }, []);

  return (
    <section aria-busy={loading} className="flex w-full min-w-0 flex-col gap-4">
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 id="admin-categories-title" className="text-2xl font-bold">
          <strong>Categorias</strong>
        </h1>

        {categories && (
          <p className="text-sm text-muted">
            {categories.length} categoria{categories.length === 1 ? "" : "s"}{" "}
            cadastrada{categories.length === 1 ? "" : "s"}
          </p>
        )}

        {loading && categories && (
          <p className="text-xs text-muted">Atualizando categorias…</p>
        )}
      </header>

      <div aria-live="polite" role="status">
        {feedback && (
          <p className="mb-2 flex items-center gap-2 rounded-xl bg-available-bg px-3 py-2 text-sm font-medium text-available-text">
            <CheckCircle2 aria-hidden="true" size={16} className="shrink-0" />
            {feedback}
          </p>
        )}
      </div>

      {error && categories && (
        <p
          role="alert"
          className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
        >
          {error}
        </p>
      )}

      {loading && !categories && (
        <div className="flex justify-center py-16" role="status">
          <Loading />
        </div>
      )}

      {!loading && !categories && error && (
        <EmptyState
          role="alert"
          icon={TriangleAlert}
          title="Categorias indisponíveis"
          description={error}
        />
      )}

      {categories && categories.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCardAdmin
              key={category.categoryId}
              category={category}
              onChanged={handleChanged}
            />
          ))}
        </ul>
      )}

      {!loading && categories && categories.length === 0 && (
        <EmptyState
          icon={BeerOff}
          title="Nenhuma categoria por aqui"
          description="Ainda não há categorias cadastradas no momento."
        />
      )}

      <CreateCategory onCreated={handleChanged} />
    </section>
  );
}
