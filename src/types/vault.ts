import { z } from "zod";

// --- VERIFICATION TIERS ---
export enum VerificationTier {
  TIER_1_STANDARD_HASHED = 1,
  TIER_2_AUTHENTICATED_LEGALIZED = 2,
}

export const DocumentMetadataSchema = z.object({
  documentId: z.string().uuid(),
  documentName: z.string(),
  mimeType: z.string(),
  category: z.enum([
    "finance",
    "portfolio",
    "certifications",
    "academics",
    "experience",
    "achievements",
    "identification",
    "legal",
    "receipts",
  ]),
  sha256Hash: z.string().length(64),
  tier: z.nativeEnum(VerificationTier),
  blockchainTxHash: z.string().optional(),
  onChainTimestamp: z.number().optional(),
  notaryAttestation: z
    .object({
      notaryId: z.string(),
      notaryName: z.string(),
      jurisdiction: z.string(),
      sealSignature: z.string(),
      attestedAt: z.string().datetime(),
    })
    .optional(),
  cloudFileRef: z
    .object({
      provider: z.enum(["google_drive", "dropbox", "onedrive", "local_ephemeral"]),
      fileId: z.string(),
      webViewLink: z.string().optional(),
      uploadedAt: z.string(),
    })
    .optional(),
  sourceCloudStorage: z.object({
    provider: z.enum(["google_drive", "dropbox", "onedrive", "local_ephemeral"]),
    remoteFileId: z.string(),
    syncedAt: z.string().datetime(),
  }),
});

export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;
export interface CloudFileRef {
  provider: "google_drive" | "dropbox" | "onedrive" | "local_ephemeral";
  fileId: string;
  webViewLink?: string;
  uploadedAt: string;
}


// --- 1. FINANCE CATEGORY SCHEMA ---
export const FinanceSchema = z.object({
  userId: z.string(),
  bankRecords: z.array(
    z.object({
      institutionName: z.string(),
      currency: z.string().length(3),
      currentLiquidBalance: z.number(),
      averageThreeMonthBalance: z.number(),
      statementPeriod: z.object({
        from: z.string(),
        to: z.string(),
      }),
      verifiedAt: z.string().datetime(),
      hashRef: z.string(),
    })
  ),
  taxClearance: z
    .object({
      taxId: z.string(),
      jurisdiction: z.string(),
      status: z.enum(["VALID", "EXPIRED", "PENDING"]),
      validUntil: z.string(),
      hashRef: z.string(),
    })
    .optional(),
});
export type FinanceData = z.infer<typeof FinanceSchema>;

// --- 2. PORTFOLIO CATEGORY SCHEMA ---
export const PortfolioSchema = z.object({
  userId: z.string(),
  headline: z.string(),
  bio: z.string(),
  publicLinks: z.array(
    z.object({
      label: z.string(),
      url: z.string().url(),
    })
  ),
  personalStatement: z.string().optional(),
});
export type PortfolioData = z.infer<typeof PortfolioSchema>;

// --- 3. CERTIFICATIONS CATEGORY SCHEMA ---
export const CertificationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuingOrganization: z.string(),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  verificationUrl: z.string().url().optional(),
  tier: z.nativeEnum(VerificationTier),
  hashRef: z.string(),
});
export const CertificationsSchema = z.object({
  userId: z.string(),
  certifications: z.array(CertificationItemSchema),
});
export type CertificationsData = z.infer<typeof CertificationsSchema>;

// --- 4. ACADEMICS CATEGORY SCHEMA ---
export const AcademicDegreeSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degreeType: z.enum(["BSc", "BA", "MSc", "MA", "PhD", "MBA", "Diploma", "Certificate"]),
  fieldOfStudy: z.string(),
  graduationYear: z.number(),
  gpa: z.number().optional(),
  maxGpa: z.number().optional(),
  honors: z.string().optional(),
  isNotarized: z.boolean().default(false),
  tier: z.nativeEnum(VerificationTier),
  hashRef: z.string(),
});

export const AcademicTranscriptCourseSchema = z.object({
  code: z.string(),
  title: z.string(),
  grade: z.string(),
  credits: z.number(),
});

export const AcademicsSchema = z.object({
  userId: z.string(),
  degrees: z.array(AcademicDegreeSchema),
  transcripts: z
    .array(
      z.object({
        degreeId: z.string(),
        courses: z.array(AcademicTranscriptCourseSchema),
        hashRef: z.string(),
      })
    )
    .optional(),
});
export type AcademicsData = z.infer<typeof AcademicsSchema>;

// --- 5. EXPERIENCE CATEGORY SCHEMA ---
export const ExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string(),
  jobTitle: z.string(),
  employmentType: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  startDate: z.string(),
  endDate: z.string().optional(), // undefined = Present
  isCurrent: z.boolean(),
  location: z.string().optional(),
  responsibilities: z.array(z.string()),
  technologiesUsed: z.array(z.string()).optional(),
  verifiedReference: z
    .object({
      contactName: z.string(),
      officialEmail: z.string().email(),
      isVerified: z.boolean(),
    })
    .optional(),
  hashRef: z.string(),
});

export const ExperienceSchema = z.object({
  userId: z.string(),
  experiences: z.array(ExperienceItemSchema),
});
export type ExperienceData = z.infer<typeof ExperienceSchema>;

// --- 6. ACHIEVEMENTS CATEGORY SCHEMA ---
export const AchievementItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
  description: z.string(),
  awardUrl: z.string().url().optional(),
  grantAmount: z.number().optional(),
  hashRef: z.string(),
});

export const AchievementsSchema = z.object({
  userId: z.string(),
  achievements: z.array(AchievementItemSchema),
});
export type AchievementsData = z.infer<typeof AchievementsSchema>;

// --- 7. IDENTIFICATION CATEGORY SCHEMA ---
export const IdentificationItemSchema = z.object({
  id: z.string(),
  documentType: z.enum([
    "international_passport",
    "national_id",
    "drivers_license",
    "passport_photograph",
    "voters_card",
    "residence_permit",
    "other_id",
  ]).optional().default("other_id"),
  idNumber: z.string().optional().default(""),
  documentNumber: z.string().optional(),
  idType: z.string().optional(),
  fullName: z.string(),
  nationality: z.string().optional(),
  issuingAuthority: z.string().optional().default(""),
  expiryDate: z.string().optional(),
  dateOfBirth: z.string().optional(),
  issueDate: z.string().optional(),
  mrzCode: z.string().optional(),
  tier: z.nativeEnum(VerificationTier).optional(),
  hashRef: z.string(),
  cloudFileRef: z
    .object({
      provider: z.string(),
      fileId: z.string(),
      webViewLink: z.string().optional(),
      uploadedAt: z.string().optional(),
    })
    .optional(),
});

export const IdentificationSchema = z.object({
  userId: z.string(),
  identifications: z.array(IdentificationItemSchema),
});
export type IdentificationData = z.infer<typeof IdentificationSchema>;

// --- 8. LEGAL INSTRUMENTS CATEGORY SCHEMA ---
export const LegalItemSchema = z.object({
  id: z.string(),
  instrumentType: z.enum([
    "mou",
    "contract",
    "affidavit",
    "power_of_attorney",
    "deed",
    "court_order",
    "marriage_certificate",
    "birth_certificate",
    "other_legal",
  ]),
  title: z.string(),
  partiesInvolved: z.array(z.string()),
  executionDate: z.string(),
  jurisdiction: z.string(),
  notarized: z.boolean().default(true),
  notarySealReference: z.string().optional(),
  hashRef: z.string(),
  cloudFileRef: z
    .object({
      provider: z.string(),
      fileId: z.string(),
      webViewLink: z.string().optional(),
    })
    .optional(),
});

export const LegalSchema = z.object({
  userId: z.string(),
  instruments: z.array(LegalItemSchema),
});
export type LegalData = z.infer<typeof LegalSchema>;

// --- 9. RECEIPTS & PURCHASES CATEGORY SCHEMA ---
export const ReceiptItemSchema = z.object({
  id: z.string(),
  receiptNumber: z.string(),
  vendorOrIssuer: z.string(),
  totalAmount: z.number(),
  currency: z.string().default("USD"),
  transactionDate: z.string(),
  descriptionOrItems: z.string(),
  paymentMethod: z.string().optional(),
  hashRef: z.string(),
  cloudFileRef: z
    .object({
      provider: z.string(),
      fileId: z.string(),
      webViewLink: z.string().optional(),
    })
    .optional(),
});

export const ReceiptsSchema = z.object({
  userId: z.string(),
  receipts: z.array(ReceiptItemSchema),
});
export type ReceiptsData = z.infer<typeof ReceiptsSchema>;

// --- COMPLETE VAULT AGGREGATE ---
export const VaultCategoryEnum = z.enum([
  "finance",
  "portfolio",
  "certifications",
  "academics",
  "experience",
  "achievements",
  "identification",
  "legal",
  "receipts",
]);
export type VaultCategory = z.infer<typeof VaultCategoryEnum>;

export interface FullUserVault {
  userId: string;
  sovereignNode: string; // e.g. "ng-west-africa" or "eu-central"
  residenceCountry: string;
  finance?: FinanceData;
  portfolio?: PortfolioData;
  certifications?: CertificationsData;
  academics?: AcademicsData;
  experience?: ExperienceData;
  achievements?: AchievementsData;
  identification?: IdentificationData;
  legal?: LegalData;
  receipts?: ReceiptsData;
  lastSyncedAt: string;
}

