import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import EmptyState from "@/src/components/EmptyState";
import { getActiveLegalDocument } from "@/src/services/legal";
import {
  LEGAL_DOCUMENT_TYPE_LABEL,
  LEGAL_DOCUMENT_TYPE_PATH,
  type LegalDocument,
  type LegalDocumentType,
} from "@/src/types/legal";
import LegalDocumentViewer from "./LegalDocumentViewer";

const linkClassName =
  "inline-flex min-h-[44px] items-center rounded-xl border border-line-strong px-5 text-sm font-semibold text-stone-strong transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default async function LegalDocumentPage({
  type,
}: {
  type: LegalDocumentType;
}) {
  let legalDocument: LegalDocument | null = null;
  let unavailable = false;

  try {
    legalDocument = await getActiveLegalDocument(type);
  } catch {
    unavailable = true;
  }

  if (!legalDocument) {
    return (
      <LegalDocumentUnavailable type={type} unavailable={unavailable} />
    );
  }

  const label = LEGAL_DOCUMENT_TYPE_LABEL[type];
  const otherType: LegalDocumentType =
    type === "PrivacyPolicy" ? "TermsOfService" : "PrivacyPolicy";
  const otherLabel = LEGAL_DOCUMENT_TYPE_LABEL[otherType];

  return (
    <main className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-10">
      <nav aria-label="Você está aqui" className="mb-6 text-sm text-muted">
        <Link href="/" className="transition hover:text-black">
          Início
        </Link>
        <span aria-hidden="true" className="px-2">
          /
        </span>
        <span aria-current="page">{label}</span>
      </nav>

      <LegalDocumentViewer legalDocument={legalDocument} />

      <footer className="mt-8 flex flex-col gap-4 border-t border-line pt-6">
        <p className="text-sm text-muted">
          Este é o documento vigente no momento. Em caso de dúvidas, entre em
          contato pelos nossos canais de atendimento.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href={LEGAL_DOCUMENT_TYPE_PATH[otherType]} className={linkClassName}>
            Ver {otherLabel}
          </Link>
          <Link href="/" className={linkClassName}>
            Voltar ao início
          </Link>
        </div>
      </footer>
    </main>
  );
}

function LegalDocumentUnavailable({
  type,
  unavailable,
}: {
  type: LegalDocumentType;
  unavailable: boolean;
}) {
  const otherType: LegalDocumentType =
    type === "PrivacyPolicy" ? "TermsOfService" : "PrivacyPolicy";

  return (
    <main className="mx-auto w-full max-w-[860px] px-4 py-10">
      <EmptyState
        role="alert"
        icon={TriangleAlert}
        title={
          unavailable
            ? "Documento indisponível no momento"
            : "Documento ainda não publicado"
        }
        description={
          unavailable
            ? "Não foi possível carregar o documento agora. Tente novamente em instantes."
            : "Ainda não há uma versão publicada para este documento. Tente novamente mais tarde."
        }
      />

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href={LEGAL_DOCUMENT_TYPE_PATH[otherType]}
          className={linkClassName}
        >
          Ver {LEGAL_DOCUMENT_TYPE_LABEL[otherType]}
        </Link>
        <Link href="/" className={linkClassName}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
