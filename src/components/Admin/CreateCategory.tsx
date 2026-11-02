"use client";

import { useState } from "react";
import CategoryCreateModal from "@/src/components/Admin/CategoryCreateModal";

type CreateCategoryProps = {
  onCreated: (message: string) => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function CreateCategory({ onCreated }: CreateCategoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  function close() {
    setIsOpen(false);
  }

  function handleSuccess(message: string) {
    setIsOpen(false);
    onCreated(message);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex max-h-16 w-full flex-1 items-center justify-center rounded-2xl bg-brand-gradient p-4 text-xl font-bold text-ink transition hover:opacity-80 ${focusRing}`}
      >
        Adicionar categoria
      </button>

      {isOpen && (
        <CategoryCreateModal onClose={close} onSuccess={handleSuccess} />
      )}
    </>
  );
}
