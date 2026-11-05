"use client";

import { useEffect, useId, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import EmptyState from "@/src/components/EmptyState";
import ConfirmMessage from "@/src/components/ConfirmMessage";
import { useUser } from "@/src/Context/UserContext";
import {
  requestDeleteLocation,
  requestLocations,
} from "@/src/Handle/Location";
import type { Location } from "@/src/types/location";
import LocationCard from "./LocationCard";
import LocationFormModal from "./LocationFormModal";
import LocationSkeleton from "./LocationSkeleton";

const MAX_LOCATIONS = 3;
const ERROR_MESSAGE = "Não foi possível carregar seus locais.";
const DELETE_ERROR_MESSAGE =
  "Não foi possível excluir o local. Tente novamente.";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

type FormMode = "create" | "edit" | null;

export default function LocationList() {
  const { user, loading: userLoading } = useUser();
  const limitMessageId = useId();

  const [locations, setLocations] = useState<Location[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [formLocation, setFormLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !user) return;

    let active = true;

    requestLocations()
      .then((list) => {
        if (!active) return;

        setLocations(list);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;

        setLocations(null);
        setError(err instanceof Error ? err.message : ERROR_MESSAGE);
      });

    return () => {
      active = false;
    };
  }, [reloadKey, user, userLoading]);

  function handleRetry() {
    setLocations(null);
    setError(null);
    setReloadKey((current) => current + 1);
  }

  function openCreateForm() {
    setFormLocation(null);
    setFormMode("create");
  }

  function openEditForm(location: Location) {
    setFormLocation(location);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setFormLocation(null);
  }

  function handleSaved() {
    closeForm();
    setError(null);
    setDeleteError(null);
    setReloadKey((current) => current + 1);
  }

  async function handleConfirmDelete() {
    const location = locationToDelete;

    if (!location) return;

    setLocationToDelete(null);
    setDeletingId(location.locationId);
    setDeleteError(null);

    try {
      await requestDeleteLocation(location.locationId);
      setLocations((current) =>
        current
          ? current.filter((item) => item.locationId !== location.locationId)
          : current,
      );
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : DELETE_ERROR_MESSAGE,
      );
    } finally {
      setDeletingId(null);
    }
  }

  const isSkeleton = userLoading || (locations === null && error === null);
  const count = locations?.length ?? 0;
  const limitReached = count >= MAX_LOCATIONS;

  return (
    <section
      aria-labelledby="meus-enderecos-titulo"
      className="flex w-full min-w-0 flex-col"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id="meus-enderecos-titulo"
            className="text-2xl font-bold text-stone-strong"
          >
            Meus endereços
          </h2>

          {locations && !error && (
            <span className="rounded-full bg-surface px-3 py-1 text-sm font-semibold text-stone">
              {count}/{MAX_LOCATIONS} locais
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          disabled={limitReached || isSkeleton}
          aria-describedby={limitReached ? limitMessageId : undefined}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-gradient px-5 text-sm font-bold text-ink transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
        >
          <Plus aria-hidden="true" size={18} />
          Adicionar local
        </button>
      </div>

      {limitReached && (
        <p
          id={limitMessageId}
          role="status"
          className="mt-2 text-sm font-medium text-stone"
        >
          Limite de 3 locais atingido
        </p>
      )}

      <div className="mt-6 flex-1">
        {isSkeleton ? (
          <LocationSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col items-start gap-4 rounded-2xl border border-[#E7E5DF] bg-white p-5"
          >
            <p className="text-sm font-semibold text-unavailable-text">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className={`inline-flex min-h-[44px] items-center rounded-xl border border-line-warm bg-white px-5 text-sm font-semibold text-stone-strong transition hover:bg-surface ${focusRing}`}
            >
              Tentar novamente
            </button>
          </div>
        ) : locations && locations.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Você ainda não tem endereços"
            description="Adicione um local para agilizar suas compras."
          />
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {locations?.map((location) => (
                <li key={location.locationId}>
                  <LocationCard
                    location={location}
                    onEdit={openEditForm}
                    onDelete={setLocationToDelete}
                    isDeleting={deletingId === location.locationId}
                  />
                </li>
              ))}
            </ul>

            {deleteError && (
              <p
                role="alert"
                className="mt-4 text-sm font-medium text-unavailable-text"
              >
                {deleteError}
              </p>
            )}
          </>
        )}
      </div>

      {formMode && (
        <LocationFormModal
          location={formMode === "edit" ? formLocation : null}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}

      {locationToDelete && (
        <ConfirmMessage
          variant="danger"
          title="Excluir local?"
          message={`O local "${locationToDelete.name}" será removido da sua lista de endereços. Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={handleConfirmDelete}
          onCancel={() => setLocationToDelete(null)}
        />
      )}
    </section>
  );
}
