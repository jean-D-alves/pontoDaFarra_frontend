import { formatLegalDate } from "@/lib/legal";
import {
  LEGAL_DOCUMENT_TYPE_LABEL,
  type LegalDocument,
} from "@/src/types/legal";
import LegalMarkdown from "./LegalMarkdown";

type LegalDocumentViewerProps = {
  legalDocument: LegalDocument;
  headingId?: string;
  headingLevel?: "h1" | "h2";
  compact?: boolean;
};

export default function LegalDocumentViewer({
  legalDocument,
  headingId,
  headingLevel = "h1",
  compact = false,
}: LegalDocumentViewerProps) {
  const Heading = headingLevel;
  const label = LEGAL_DOCUMENT_TYPE_LABEL[legalDocument.type];

  return (
    <article
      className={
        compact
          ? "flex flex-col"
          : "rounded-2xl border border-line bg-background p-6 sm:p-10"
      }
    >
      <header className={compact ? "mb-4" : "mb-6 border-b border-line pb-5"}>
        <Heading
          id={headingId}
          className={
            compact
              ? "text-lg font-bold text-stone-strong"
              : "text-[30px] font-bold leading-tight tracking-[-0.01em] text-stone-strong sm:text-[36px]"
          }
        >
          {label}
        </Heading>

        <p className="mt-2 text-sm text-muted">
          Versão {legalDocument.version} · Publicado em{" "}
          {formatLegalDate(legalDocument.publishedAt)}
        </p>
      </header>

      <LegalMarkdown content={legalDocument.content} />
    </article>
  );
}
