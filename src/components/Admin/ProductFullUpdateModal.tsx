"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import Modal from "@/src/components/Modal";
import ProductFormField from "@/src/components/Admin/ProductFormField";
import { requestCategoryGetId } from "@/src/Handle/Category";
import { UpdateProduct } from "@/src/Handle/Product";
import { resolveImageUrl } from "@/src/Handle/Image";
import type { Product } from "@/src/types/Products";

type ProductFullUpdateModalProps = {
  product: Product;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function ProductFullUpdateModal({
  product,
  onClose,
  onSuccess,
}: ProductFullUpdateModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const imageObjectUrlRef = useRef<string | null>(null);

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [value, setValue] = useState(String(product.value));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    resolveImageUrl(product.imageUrl),
  );
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [valueError, setValueError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    requestCategoryGetId(product.categoryId)
      .then((category) => {
        if (cancelled) return;

        if (category) {
          setCategoryName(category.name);
        } else {
          setCategoryError("Não foi possível carregar a categoria atual.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategoryError("Não foi possível carregar a categoria atual.");
        }
      })
      .finally(() => {
        if (!cancelled) setCategoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product.categoryId]);

  useEffect(() => {
    return () => {
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current);
      }
    };
  }, []);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
      imageObjectUrlRef.current = null;
    }

    setImageError(null);

    if (!file) {
      setImageFile(null);
      setImagePreview(resolveImageUrl(product.imageUrl));
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Use uma imagem JPEG, PNG ou WebP.");
      event.target.value = "";
      setImageFile(null);
      setImagePreview(resolveImageUrl(product.imageUrl));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      setImageFile(null);
      setImagePreview(resolveImageUrl(product.imageUrl));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    imageObjectUrlRef.current = objectUrl;
    setImageFile(file);
    setImagePreview(objectUrl);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    let hasError = false;
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const numericValue = Number(value.replace(",", "."));

    if (!trimmedName) {
      setNameError("Informe o nome do produto.");
      hasError = true;
    } else if (trimmedName.length > 120) {
      setNameError("O nome deve ter no máximo 120 caracteres.");
      hasError = true;
    }

    if (trimmedDescription.length > 240) {
      setDescriptionError("A descrição deve ter no máximo 240 caracteres.");
      hasError = true;
    }

    if (!value.trim() || !Number.isFinite(numericValue) || numericValue <= 0) {
      setValueError("Informe um valor maior que zero.");
      hasError = true;
    }

    if (imageError) hasError = true;

    if (hasError) return;

    setLoading(true);

    try {
      await UpdateProduct(product.productId, {
        name: trimmedName,
        description: trimmedDescription,
        value: numericValue,
        categoryId: product.categoryId,
        image: imageFile ?? undefined,
      });

      onSuccess("Produto atualizado com sucesso.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível atualizar o produto.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      labelledBy={titleId}
      describedBy={descriptionId}
      onClose={onClose}
      closeOnOverlay={!loading}
      closeOnEscape={!loading}
      panelClassName="max-w-lg"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-black">
              Alterar produto por inteiro
            </h2>
            <p id={descriptionId} className="truncate text-sm text-muted">
              {product.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
            className={`rounded-full p-2 text-muted transition hover:bg-surface hover:text-black disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
          aria-busy={loading}
        >
          <ProductFormField
            id="product-name"
            label="Nome"
            value={name}
            onChange={(nextName) => {
              setName(nextName);
              if (nameError) setNameError(null);
            }}
            placeholder="Nome do produto"
            error={nameError ?? undefined}
            maxLength={120}
            required
          />

          <ProductFormField
            id="product-description"
            label="Descrição"
            value={description}
            onChange={(nextDescription) => {
              setDescription(nextDescription);
              if (descriptionError) setDescriptionError(null);
            }}
            placeholder="Descrição do produto"
            error={descriptionError ?? undefined}
            maxLength={240}
            multiline
            rows={3}
          />

          <ProductFormField
            id="product-value"
            label="Valor (R$)"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="Ex.: 19.90"
            value={value}
            onChange={(nextValue) => {
              setValue(nextValue);
              if (valueError) setValueError(null);
            }}
            error={valueError ?? undefined}
            helper={
              product.isPromotional
                ? "Em promoção, este é o preço promocional atual."
                : undefined
            }
            required
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-black">Categoria</span>
            <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 text-sm">
              <span className="min-w-0 truncate text-black">
                {categoryLoading
                  ? "Carregando categoria…"
                  : (categoryName ?? "Categoria atual")}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-muted">
                {product.categoryId}
              </span>
            </div>
            {categoryError && (
              <p role="alert" className="text-sm text-red-600">
                {categoryError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-line bg-white px-3 py-2">
              <span className="block text-xs text-muted">Disponibilidade</span>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  product.isAvailable
                    ? "bg-available-bg text-available-text"
                    : "bg-unavailable-bg text-unavailable-text"
                }`}
              >
                {product.isAvailable ? "Disponível" : "Indisponível"}
              </span>
            </div>

            <div className="rounded-xl border border-line bg-white px-3 py-2">
              <span className="block text-xs text-muted">Promoção</span>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  product.isPromotional
                    ? "bg-promo-bg text-promo-text"
                    : "bg-surface text-body"
                }`}
              >
                {product.isPromotional ? "Em promoção" : "Sem promoção"}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted">
            Disponibilidade e promoção são alteradas pelos botões do card.
          </p>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-black">Imagem</span>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex aspect-square w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt={`Imagem atual de ${product.name}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImagePlus
                    aria-hidden="true"
                    size={24}
                    className="text-muted"
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <label
                  htmlFor="product-image"
                  className="text-sm font-semibold text-black"
                >
                  Escolher nova imagem
                </label>
                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={loading}
                  className={`block w-full text-sm text-body file:mr-3 file:rounded-xl file:border-0 file:bg-surface file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-line disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                />
                <p className="text-xs text-muted">
                  JPEG, PNG ou WebP, até 5 MB. Se não escolher, a imagem atual
                  será mantida.
                </p>
              </div>
            </div>

            {imageError && (
              <p role="alert" className="text-sm text-red-600">
                {imageError}
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
            >
              {error}
            </p>
          )}

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`min-h-[44px] flex-1 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-ink transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
            >
              {loading && (
                <LoaderCircle
                  aria-hidden="true"
                  size={16}
                  className="animate-spin"
                />
              )}
              {loading ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
