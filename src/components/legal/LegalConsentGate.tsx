"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/src/Context/UserContext";
import { getPending } from "@/src/Handle/Legal";
import type { LegalDocument } from "@/src/types/legal";
import LegalConsentDialog from "./LegalConsentDialog";

export default function LegalConsentGate() {
  const { user, loading } = useUser();
  const [pending, setPending] = useState<LegalDocument[] | null>(null);

  const loadPending = useCallback(async () => {
    try {
      const documents = await getPending();
      setPending(documents);
    } catch {
      // Falhas de rede ou sessão não devem prender o usuário em um modal.
      setPending(null);
    }
  }, []);

  useEffect(() => {
    if (loading || !user) return;

    let cancelled = false;

    getPending()
      .then((documents) => {
        if (!cancelled) setPending(documents);
      })
      .catch(() => {
        if (!cancelled) setPending(null);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const visiblePending = loading || !user ? null : pending;

  if (!visiblePending || visiblePending.length === 0) return null;

  return (
    <LegalConsentDialog
      pending={visiblePending}
      onAccepted={loadPending}
      onRefresh={loadPending}
    />
  );
}
