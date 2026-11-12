export type LegalDocumentType = "PrivacyPolicy" | "TermsOfService";

export type LegalDocumentTypeId = 1 | 2;

export interface LegalDocument {
  legalDocumentId: string;
  type: LegalDocumentType;
  version: string;
  content: string;
  publishedAt: string;
  isActive: boolean;
}

export interface UserConsent {
  userConsentId: string;
  legalDocumentId: string;
  type: LegalDocumentType;
  version: string;
  acceptedAt: string;
  ipAddress: string | null;
}

export interface PublishLegalDocumentRequest {
  type: LegalDocumentTypeId;
  version: string;
  content: string;
}

export interface UpdateLegalDocumentRequest {
  version?: string;
  content?: string;
}

export const LEGAL_DOCUMENT_TYPES: readonly LegalDocumentType[] = [
  "PrivacyPolicy",
  "TermsOfService",
];

export const LEGAL_DOCUMENT_TYPE_LABEL: Record<
  LegalDocumentType,
  string
> = {
  PrivacyPolicy: "Política de Privacidade",
  TermsOfService: "Termos de Uso",
};

export const LEGAL_DOCUMENT_TYPE_SLUG = {
  PrivacyPolicy: "privacy-policy",
  TermsOfService: "terms-of-service",
} as const;

export const LEGAL_DOCUMENT_TYPE_ID: Record<
  LegalDocumentType,
  LegalDocumentTypeId
> = {
  PrivacyPolicy: 1,
  TermsOfService: 2,
};

export const LEGAL_DOCUMENT_TYPE_PATH = {
  PrivacyPolicy: "/politica-de-privacidade",
  TermsOfService: "/termos-de-uso",
} as const;
