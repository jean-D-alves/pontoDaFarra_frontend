"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, TriangleAlert, UserX } from "lucide-react";
import EmptyState from "@/src/components/EmptyState";
import Loading from "@/src/components/Loading";
import Pagination from "@/src/components/Pagination";
import UserCardAdmin from "@/src/components/Admin/UserCardAdmin";
import UserFilterBar, {
  type UserRoleFilter,
} from "@/src/components/Admin/UserFilterBar";
import { requestUsersPage, type UserFilters } from "@/src/Handle/User";
import type { User } from "@/src/types/User";
import type { PagedResult } from "@/src/types/pagination";
import { usePageSize } from "@/src/hooks/usePageSize";

const FEEDBACK_DURATION = 4000;
const SEARCH_DEBOUNCE = 400;

export default function UserAdminContent() {
  const pageSize = usePageSize();
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<PagedResult<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRoleFilter>("all");

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) return;

    const timer = window.setTimeout(() => {
      setSearch(trimmed);
      setPage(1);
      setLoading(true);
    }, SEARCH_DEBOUNCE);

    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    let cancelled = false;
    let redirecting = false;

    const filters: UserFilters = {};
    if (role !== "all") filters.role = role;
    if (search) filters.search = search;

    requestUsersPage(page, pageSize, filters)
      .then((result) => {
        if (cancelled) return;

        if (!result) {
          setError("Não foi possível carregar os usuários.");
          if (!hasLoadedRef.current) setUsers(null);
          return;
        }

        if (result.items.length === 0 && page > 1) {
          const lastPage = Math.max(1, result.totalPages);

          // Página fora do intervalo (ex.: filtro ou tamanho de página mudou).
          if (lastPage !== page) {
            redirecting = true;
            setPage(lastPage);
            return;
          }
        }

        hasLoadedRef.current = true;
        setError(null);
        setUsers(result);
      })
      .catch(() => {
        if (cancelled) return;

        setError("Não foi possível carregar os usuários.");
        if (!hasLoadedRef.current) setUsers(null);
      })
      .finally(() => {
        if (!cancelled && !redirecting) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, search, role, reloadToken]);

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

  function handlePageChange(nextPage: number) {
    if (nextPage === page) return;

    setFeedback(null);
    setError(null);
    setLoading(true);
    setPage(nextPage);
  }

  function handleRoleChange(value: UserRoleFilter) {
    if (value === role) return;

    setRole(value);
    setFeedback(null);
    setError(null);
    setLoading(true);
    setPage(1);
  }

  function handleClearFilters() {
    setSearchInput("");
    setSearch("");
    setRole("all");
    setFeedback(null);
    setError(null);
    setLoading(true);
    setPage(1);
  }

  const hasActiveFilters = role !== "all" || search !== "";
  const canClearFilters =
    hasActiveFilters || searchInput.trim() !== "";

  return (
    <section aria-busy={loading} className="flex w-full min-w-0 flex-col gap-4">
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 id="admin-users-title" className="text-2xl font-bold">
          <strong>Usuários</strong>
        </h1>

        {users && (
          <p className="text-sm text-muted">
            {users.totalItems} usuário{users.totalItems === 1 ? "" : "s"}{" "}
            encontrado{users.totalItems === 1 ? "" : "s"}
          </p>
        )}

        {loading && users && (
          <p className="text-xs text-muted">Atualizando usuários…</p>
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

      <UserFilterBar
        search={searchInput}
        role={role}
        canClear={canClearFilters}
        onSearchChange={setSearchInput}
        onRoleChange={handleRoleChange}
        onClear={handleClearFilters}
      />

      {error && users && (
        <p
          role="alert"
          className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
        >
          {error}
        </p>
      )}

      {loading && !users && (
        <div className="flex justify-center py-16" role="status">
          <Loading />
        </div>
      )}

      {!loading && !users && error && (
        <EmptyState
          role="alert"
          icon={TriangleAlert}
          title="Usuários indisponíveis"
          description={error}
        />
      )}

      {users && users.items.length > 0 && (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {users.items.map((user) => (
              <UserCardAdmin
                key={user.userId}
                user={user}
                onChanged={handleChanged}
              />
            ))}
          </ul>
          <Pagination
            pageNow={page}
            totalPages={users.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {!loading && users && users.items.length === 0 && (
        <>
          <EmptyState
            icon={UserX}
            title={
              hasActiveFilters
                ? "Nenhum usuário encontrado"
                : "Nenhum usuário por aqui"
            }
            description={
              hasActiveFilters
                ? "Nenhum usuário corresponde aos filtros selecionados. Tente ajustar ou limpar os filtros."
                : "Ainda não há usuários cadastrados."
            }
          />

          {hasActiveFilters && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleClearFilters}
                className="min-h-[44px] rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
