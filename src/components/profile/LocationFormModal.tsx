"use client";

import { useId, useState, type FormEvent } from "react";
import { LoaderCircle, X } from "lucide-react";
import Modal from "@/src/components/Modal";
import ProductFormField from "@/src/components/Admin/ProductFormField";
import {
  requestCreateLocation,
  requestUpdateLocation,
} from "@/src/Handle/Location";
import type {
  CreateLocationInput,
  Location,
  UpdateLocationInput,
} from "@/src/types/location";

type LocationField = keyof CreateLocationInput;

type LocationFormModalProps = {
  location?: Location | null;
  onClose: () => void;
  onSaved: () => void;
};

type FieldConfig = {
  key: LocationField;
  emptyMessage: string;
};

const FIELD_CONFIG: FieldConfig[] = [
  { key: "name", emptyMessage: "Informe o nome do local." },
  { key: "street", emptyMessage: "Informe a rua." },
  { key: "houseNumber", emptyMessage: "Informe o número." },
  { key: "neighborhood", emptyMessage: "Informe o bairro." },
  { key: "city", emptyMessage: "Informe a cidade." },
  { key: "state", emptyMessage: "Informe o estado." },
];

const MAX_LENGTH: Record<LocationField, number> = {
  name: 100,
  state: 100,
  city: 100,
  neighborhood: 100,
  street: 150,
  houseNumber: 20,
};

const EMPTY_VALUES: CreateLocationInput = {
  name: "",
  state: "",
  city: "",
  neighborhood: "",
  street: "",
  houseNumber: "",
};

function toFormValues(location: Location): CreateLocationInput {
  return {
    name: location.name,
    state: location.state,
    city: location.city,
    neighborhood: location.neighborhood,
    street: location.street,
    houseNumber: location.houseNumber,
  };
}

function trimValues(values: CreateLocationInput): CreateLocationInput {
  return {
    name: values.name.trim(),
    state: values.state.trim(),
    city: values.city.trim(),
    neighborhood: values.neighborhood.trim(),
    street: values.street.trim(),
    houseNumber: values.houseNumber.trim(),
  };
}

export default function LocationFormModal({
  location = null,
  onClose,
  onSaved,
}: LocationFormModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const fieldIdPrefix = useId();

  const [values, setValues] = useState<CreateLocationInput>(() =>
    location ? toFormValues(location) : EMPTY_VALUES,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<LocationField, string>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = location !== null;

  function fieldId(key: LocationField): string {
    return `${fieldIdPrefix}-${key}`;
  }

  function handleChange(key: LocationField, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;

      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);

    const trimmed = trimValues(values);
    const nextErrors: Partial<Record<LocationField, string>> = {};

    for (const field of FIELD_CONFIG) {
      if (!trimmed[field.key]) nextErrors[field.key] = field.emptyMessage;
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      const firstInvalid = FIELD_CONFIG.find((field) => nextErrors[field.key]);
      if (firstInvalid) {
        document.getElementById(fieldId(firstInvalid.key))?.focus();
      }
      return;
    }

    let updatePayload: UpdateLocationInput | null = null;

    if (location) {
      const changes: UpdateLocationInput = {};

      for (const field of FIELD_CONFIG) {
        if (trimmed[field.key] !== location[field.key]) {
          changes[field.key] = trimmed[field.key];
        }
      }

      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }

      updatePayload = changes;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      if (location && updatePayload) {
        await requestUpdateLocation(location.locationId, updatePayload);
      } else {
        await requestCreateLocation(trimmed);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditing
            ? "Não foi possível atualizar o local."
            : "Não foi possível criar o local.",
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    onSaved();
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
              {isEditing ? "Editar local" : "Adicionar local"}
            </h2>
            <p id={descriptionId} className="text-sm text-muted">
              {isEditing
                ? "Atualize os dados do endereço selecionado."
                : "Cadastre um endereço para agilizar suas compras."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
            className="rounded-full p-2 text-muted transition hover:bg-surface hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={loading}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ProductFormField
                id={fieldId("name")}
                label="Nome do local"
                value={values.name}
                onChange={(value) => handleChange("name", value)}
                placeholder="ex.: Casa"
                maxLength={MAX_LENGTH.name}
                error={fieldErrors.name}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <ProductFormField
                id={fieldId("street")}
                label="Rua"
                value={values.street}
                onChange={(value) => handleChange("street", value)}
                placeholder="ex.: Rua das Flores"
                maxLength={MAX_LENGTH.street}
                error={fieldErrors.street}
                required
              />
            </div>

            <ProductFormField
              id={fieldId("houseNumber")}
              label="Número"
              value={values.houseNumber}
              onChange={(value) => handleChange("houseNumber", value)}
              placeholder="ex.: 123"
              maxLength={MAX_LENGTH.houseNumber}
              error={fieldErrors.houseNumber}
              required
            />

            <ProductFormField
              id={fieldId("neighborhood")}
              label="Bairro"
              value={values.neighborhood}
              onChange={(value) => handleChange("neighborhood", value)}
              placeholder="ex.: Centro"
              maxLength={MAX_LENGTH.neighborhood}
              error={fieldErrors.neighborhood}
              required
            />

            <ProductFormField
              id={fieldId("city")}
              label="Cidade"
              value={values.city}
              onChange={(value) => handleChange("city", value)}
              placeholder="ex.: Acari"
              maxLength={MAX_LENGTH.city}
              error={fieldErrors.city}
              required
            />

            <ProductFormField
              id={fieldId("state")}
              label="Estado"
              value={values.state}
              onChange={(value) => handleChange("state", value)}
              placeholder="ex.: RN"
              maxLength={MAX_LENGTH.state}
              error={fieldErrors.state}
              required
            />
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
              className="min-h-[44px] flex-1 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-ink transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60"
            >
              {loading && (
                <LoaderCircle
                  aria-hidden="true"
                  size={16}
                  className="animate-spin"
                />
              )}
              {loading
                ? "Salvando…"
                : isEditing
                  ? "Salvar alterações"
                  : "Adicionar local"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
