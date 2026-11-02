"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  MoreVertical,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import ConfirmMessage from "@/src/components/ConfirmMessage";
import UserDetailModal from "@/src/components/Admin/UserDetailModal";
import {
  requestDeleteUserById,
  requestToggleUserRole,
} from "@/src/Handle/User";
import { useUser } from "@/src/Context/UserContext";
import type { User } from "@/src/types/User";

type ActiveModal = "detail" | "delete" | null;

type UserCardAdminProps = {
  user: User;
  onChanged: (message?: string) => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const menuItemClass = `flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition ${focusRing}`;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function UserCardAdmin({ user, onChanged }: UserCardAdminProps) {
  const { user: currentUser } = useUser();
  const isSelf = currentUser?.userId === user.userId;

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function openModal(modal: Exclude<ActiveModal, null>) {
    setMenuOpen(false);
    setDeleteError(null);
    setActiveModal(modal);
  }

  function closeModal() {
    if (deleteLoading) return;

    setActiveModal(null);
    setDeleteError(null);
  }

  async function handleToggleRole() {
    setMenuOpen(false);
    setRoleError(null);
    setRoleLoading(true);

    try {
      await requestToggleUserRole(user.userId);
      onChanged(
        user.role === "Admin"
          ? `${user.name} agora é cliente.`
          : `${user.name} agora é administrador.`,
      );
    } catch (err) {
      setRoleError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar o perfil do usuário.",
      );
    } finally {
      setRoleLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    setDeleteLoading(true);

    try {
      await requestDeleteUserById(user.userId);
      setActiveModal(null);
      onChanged("Usuário excluído com sucesso.");
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o usuário.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <li className="relative flex h-full flex-col gap-3 rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold text-black"
        >
          {getInitials(user.name)}
        </span>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Ações do usuário ${user.name}`}
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-body transition hover:bg-surface ${focusRing}`}
          >
            <MoreVertical aria-hidden="true" size={18} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label={`Ações do usuário ${user.name}`}
              className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-line bg-white shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => openModal("detail")}
                className={`${menuItemClass} text-body hover:bg-surface`}
              >
                <Eye aria-hidden="true" size={16} />
                Ver detalhes
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleToggleRole}
                disabled={isSelf || roleLoading}
                title={
                  isSelf
                    ? "Você não pode alterar o próprio perfil."
                    : undefined
                }
                className={`${menuItemClass} text-body hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {user.role === "Admin" ? (
                  <ShieldOff aria-hidden="true" size={16} />
                ) : (
                  <ShieldCheck aria-hidden="true" size={16} />
                )}
                {roleLoading
                  ? "Alterando…"
                  : user.role === "Admin"
                    ? "Rebaixar para cliente"
                    : "Promover a admin"}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => openModal("delete")}
                disabled={isSelf}
                title={
                  isSelf ? "Você não pode excluir a própria conta." : undefined
                }
                className={`${menuItemClass} text-unavailable-text hover:bg-unavailable-bg disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <Trash2 aria-hidden="true" size={16} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-sm font-semibold text-black">{user.name}</p>
        <p className="truncate text-sm text-muted">{user.email}</p>
        <p className="truncate text-sm text-muted">
          {user.phoneNumber || "Sem telefone"}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            user.role === "Admin"
              ? "bg-brand text-black"
              : "bg-surface text-body"
          }`}
        >
          {user.role === "Admin" ? "Administrador" : "Cliente"}
        </span>

        {isSelf && (
          <span className="inline-flex rounded-full bg-surface px-2 py-1 text-xs font-semibold text-muted">
            Você
          </span>
        )}

        {roleLoading && (
          <span className="text-xs text-muted">Atualizando perfil…</span>
        )}
      </div>

      {roleError && (
        <p
          role="alert"
          className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
        >
          {roleError}
        </p>
      )}

      {activeModal === "detail" && (
        <UserDetailModal
          userId={user.userId}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "delete" && (
        <ConfirmMessage
          title="Excluir usuário"
          message={`Tem certeza que deseja excluir "${user.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          loading={deleteLoading}
          loadingLabel="Excluindo…"
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
    </li>
  );
}
