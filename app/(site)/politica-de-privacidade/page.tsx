import type { Metadata } from "next";
import { Suspense } from "react";
import LegalDocumentPage from "@/src/components/legal/LegalDocumentPage";
import LegalDocumentSkeleton from "@/src/components/legal/LegalDocumentSkeleton";

export const metadata: Metadata = {
  title: "Ponto da Farra | Política de Privacidade",
  description:
    "Política de Privacidade da Ponto da Farra, distribuidora de bebidas em Acari, RN.",
};

export default function PoliticaDePrivacidade() {
  return (
    <Suspense fallback={<LegalDocumentSkeleton />}>
      <LegalDocumentPage type="PrivacyPolicy" />
    </Suspense>
  );
}
