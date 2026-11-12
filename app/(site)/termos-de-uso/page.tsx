import type { Metadata } from "next";
import { Suspense } from "react";
import LegalDocumentPage from "@/src/components/legal/LegalDocumentPage";
import LegalDocumentSkeleton from "@/src/components/legal/LegalDocumentSkeleton";

export const metadata: Metadata = {
  title: "Ponto da Farra | Termos de Uso",
  description:
    "Termos de Uso da Ponto da Farra, distribuidora de bebidas em Acari, RN.",
};

export default function TermosDeUso() {
  return (
    <Suspense fallback={<LegalDocumentSkeleton />}>
      <LegalDocumentPage type="TermsOfService" />
    </Suspense>
  );
}
