"use client";
import { RequestAll } from "@/src/Handle/Category";
import { CreateProduct } from "@/src/Handle/Product";
import { Category } from "@/src/types/category";
import { Product } from "@/src/types/Products";
import { useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

// productId e imageUrl ficam de fora: o backend gera o id e a url da imagem
type ProductForm = Omit<Product, "productId" | "imageUrl">;

const initialForm: ProductForm = {
  name: "",
  description: null,
  value: 0,
  isAvailable: true,
  isPromotional: false,
  categoryId: "",
};

export default function CreateProducts() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valueText, setValueText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoadingCategories(true);

    RequestAll()
      .then((data) => {
        if (!cancelled) setCategories(data ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);
  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(",", ".").replace(/[^\d.]/g, "");
    const [int, ...rest] = v.split(".");
    v = rest.length ? `${int}.${rest.join("").slice(0, 2)}` : int;
    setValueText(v);
  }

  function handleValueBlur() {
    const n = Number(valueText);
    if (!valueText || Number.isNaN(n)) return;
    setValueText(n.toFixed(2)); // 39.5 -> "39.50"
  }
  function close() {
    setIsOpen(false);
    setForm(initialForm);
    setImageFile(null);
    setError(null);
    setValueText("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const value = Number(valueText);
    if (!valueText || Number.isNaN(value) || value <= 0) {
      setError("Informe um valor válido, ex: 39.50");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await CreateProduct({ ...form, value, image: imageFile });
      close();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o produto.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex flex-1 justify-center items-center p-4 w-full max-h-16 text-xl bg-brand-gradient rounded-2xl font-bold hover:opacity-80"
      >
        Adicionar produto
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-product-title"
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="create-product-title" className="text-2xl font-bold">
                Adicionar produto
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                className="text-2xl hover:opacity-70"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                Nome
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-lg bg-zinc-800 p-2"
                />
              </label>

              <label className="flex flex-col gap-1">
                Descrição
                <textarea
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value || null })
                  }
                  className="rounded-lg bg-zinc-800 p-2"
                />
              </label>

              <label className="flex flex-col gap-1">
                Valor (R$)
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  required
                  pattern="^\d+(\.\d{1,2})?$"
                  value={valueText}
                  onChange={handleValueChange}
                  onBlur={handleValueBlur}
                  className="rounded-lg bg-zinc-800 p-2"
                />
              </label>

              <div className="flex flex-col gap-1">
                Imagem
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800 text-zinc-400 hover:border-zinc-400 hover:text-zinc-200"
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="Prévia da imagem"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>Clique para escolher uma foto</span>
                  )}
                </button>
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="self-start text-sm text-red-400 hover:underline"
                  >
                    Remover foto
                  </button>
                )}
              </div>

              <label className="flex flex-col gap-1">
                Categoria
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  disabled={loadingCategories}
                  className="rounded-lg bg-zinc-800 p-2"
                >
                  <option value="" disabled>
                    {loadingCategories
                      ? "Carregando..."
                      : "Selecione uma categoria"}
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm({ ...form, isAvailable: e.target.checked })
                  }
                />
                Disponível
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isPromotional}
                  onChange={(e) =>
                    setForm({ ...form, isPromotional: e.target.checked })
                  }
                />
                Promocional
              </label>
              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={close}
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-zinc-700 p-3 font-bold hover:opacity-80 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-brand-gradient p-3 font-bold hover:opacity-80 disabled:opacity-50"
                >
                  {submitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
