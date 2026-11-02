"use client";

import { Search, X } from "lucide-react";

export type UserRoleFilter = "all" | "Admin" | "Client";

type UserFilterBarProps = {
  search: string;
  role: UserRoleFilter;
  canClear: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: UserRoleFilter) => void;
  onClear: () => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const fieldClassName = `min-h-[44px] w-full rounded-xl border border-line bg-white px-3 text-sm text-black transition ${focusRing}`;

const labelClassName =
  "flex min-w-0 flex-col gap-1 text-sm font-medium text-body";

export default function UserFilterBar({
  search,
  role,
  canClear,
  onSearchChange,
  onRoleChange,
  onClear,
}: UserFilterBarProps) {
  return (
    <div className="mb-4 rounded-2xl border border-line bg-surface p-4">
      <div
        role="group"
        aria-label="Filtros de usuários"
        className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:items-end"
      >
        <label className={labelClassName}>
          Buscar
          <span className="relative">
            <Search
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nome ou e-mail"
              className={`${fieldClassName} pl-9`}
            />
          </span>
        </label>

        <label className={labelClassName}>
          Perfil
          <select
            value={role}
            onChange={(event) =>
              onRoleChange(event.target.value as UserRoleFilter)
            }
            className={fieldClassName}
          >
            <option value="all">Todos</option>
            <option value="Admin">Administradores</option>
            <option value="Client">Clientes</option>
          </select>
        </label>

        <button
          type="button"
          onClick={onClear}
          disabled={!canClear}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
        >
          <X aria-hidden="true" size={16} />
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
