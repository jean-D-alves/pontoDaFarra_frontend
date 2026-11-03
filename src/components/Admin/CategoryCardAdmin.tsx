"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Beer, MoreVertical, Pencil, Trash2 } from "lucide-react";
import ConfirmMessage from "@/src/components/ConfirmMessage";
import CategoryUpdateModal from "@/src/components/Admin/CategoryUpdateModal";
import { DeleteCategory } from "@/src/Handle/Category";
import type { Category } from "@/src/types/category";

type ActiveModal = "update" | "delete" | null;

type CategoryCardAdminProps = {
  category: Category;
  onChanged?: (message?: string) => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const menuItemClass = `flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition ${focusRing}`;

export default function CategoryCardAdmin({
  category,
  onChanged,
}: CategoryCardAdminProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
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

  function handleSuccess(message: string) {
    setActiveModal(null);
    onChanged?.(message);
  }

  async function handleDelete() {
    setDeleteError(null);
    setDeleteLoading(true);

    try {
      await DeleteCategory(category.categoryId);
      setActiveModal(null);
      onChanged?.("Categoria excluída com sucesso.");
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir a categoria.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <li className="relative">
      <Link
        href={`/produtos/all?categoryId=${category.categoryId}`}
        aria-label={`Ver produtos da categoria ${category.name}`}
        className={`group flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-white px-4 py-8 text-center transition hover:border-brand hover:shadow-sm ${focusRing}`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-black transition group-hover:bg-brand">
          <Beer size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold capitalize text-black">
          {category.name}
        </span>
      </Link>

      <div ref={menuRef} className="absolute right-2 top-2">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`Ações da categoria ${category.name}`}
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-body transition hover:bg-surface ${focusRing}`}
        >
          <MoreVertical aria-hidden="true" size={18} />
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label={`Ações da categoria ${category.name}`}
            className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-white shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => openModal("update")}
              className={`${menuItemClass} text-body hover:bg-surface`}
            >
              <Pencil aria-hidden="true" size={16} />
              Atualizar
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => openModal("delete")}
              className={`${menuItemClass} text-unavailable-text hover:bg-unavailable-bg`}
            >
              <Trash2 aria-hidden="true" size={16} />
              Deletar
            </button>
          </div>
        )}
      </div>

      {activeModal === "update" && (
        <CategoryUpdateModal
          category={category}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      {activeModal === "delete" && (
        <ConfirmMessage
          title="Excluir categoria"
          message={`Tem certeza que deseja excluir "${category.name}"? Esta ação não pode ser desfeita.`}
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
