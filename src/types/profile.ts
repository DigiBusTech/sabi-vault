import { z } from "zod";

// --- CEFR Language Proficiency Levels ---
export const CefrLevelEnum = z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "NATIVE"]);
export type CefrLevel = z.infer<typeof CefrLevelEnum>;

export const LanguageProficiencySchema = z.object({
  id: z.string(),
  language: z.string(),
  level: CefrLevelEnum,
  isNative: z.boolean().default(false),
  verifiedCredentialRef: z.string().optional(), // credential hash or ID if backed by IELTS/DELF/etc.
});
export type LanguageProficiency = z.infer<typeof LanguageProficiencySchema>;

// --- Skill Mastery Matrix ---
export const SkillProficiencyEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]);
export type SkillProficiency = z.infer<typeof SkillProficiencyEnum>;

export const SkillItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(), // e.g. "Distributed Systems", "Cloud & DevOps", "Design"
  proficiency: SkillProficiencyEnum,
  yearsOfExperience: z.number().min(0),
  credentialRef: z.string().optional(), // link to certifications or experience
});
export type SkillItem = z.infer<typeof SkillItemSchema>;

// --- Social & Professional Presence ---
export const SocialLinksSchema = z.object({
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  behance: z.string().url().optional().or(z.literal("")),
  other: z.string().url().optional().or(z.literal("")),
});
export type SocialLinks = z.infer<typeof SocialLinksSchema>;

// --- Work Experience Item (LinkedIn-Style Professional History) ---
export const EmploymentTypeEnum = z.enum([
  "Full-time",
  "Part-time",
  "Contract",
  "Self-employed",
  "Internship",
  "Freelance",
]);
export type EmploymentType = z.infer<typeof EmploymentTypeEnum>;

export const WorkExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  employmentType: EmploymentTypeEnum.default("Full-time"),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().default(""),
  skillsUsed: z.array(z.string()).default([]),
  credentialRef: z.string().optional(),
});
export type WorkExperienceItem = z.infer<typeof WorkExperienceItemSchema>;

// --- Human Profile Full Schema ---
export const UserHumanProfileSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  headline: z.string(),
  bio: z.string(),
  avatarUrl: z.string().optional(),
  dateOfBirth: z.string().optional(),
  residenceCity: z.string(),
  residenceCountry: z.string(),
  nationality: z.string(),
  socialLinks: SocialLinksSchema,
  languages: z.array(LanguageProficiencySchema).default([]),
  skills: z.array(SkillItemSchema).default([]),
  workExperiences: z.array(WorkExperienceItemSchema).default([]),
  hobbies: z.array(z.string()).default([]),
  targetRoles: z.array(z.string()).default([]),
  targetCountries: z.array(z.string()).default([]),
  updatedAt: z.string(),
});
export type UserHumanProfile = z.infer<typeof UserHumanProfileSchema>;

// --- Persona Niches (Zero-CV / Zero-Cover-Letter Studio) ---
export const NicheTargetTypeEnum = z.enum(["job", "relocation", "academic", "procurement", "grant"]);
export type NicheTargetType = z.infer<typeof NicheTargetTypeEnum>;

export const UserProfileNicheSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(), // e.g. "Senior Distributed Systems Engineer (FinTech)"
  targetType: NicheTargetTypeEnum,
  targetIndustry: z.string(), // e.g. "Financial Infrastructure", "EU Visa Compliance"
  headline: z.string(),
  executiveSummary: z.string(), // Synthesized positioning statement
  selectedSkillIds: z.array(z.string()),
  selectedCredentialIds: z.array(z.string()), // IDs of diplomas, experiences, bank statements to prioritize
  autoSynthesizeDossier: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserProfileNiche = z.infer<typeof UserProfileNicheSchema>;

// --- AI Sovereign Advisor & Target Goals ---
export const TargetGoalTypeEnum = z.enum(["job", "relocation", "academic", "procurement"]);
export type TargetGoalType = z.infer<typeof TargetGoalTypeEnum>;

export const TargetGoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: TargetGoalTypeEnum,
  title: z.string(), // e.g. "EU Blue Card (Germany / Netherlands)", "Staff Infrastructure Engineer"
  targetCountry: z.string(),
  targetDate: z.string().optional(),
  status: z.enum(["active", "achieved", "paused"]).default("active"),
  requiredCategories: z.array(z.string()), // e.g. ["identification", "academics", "finance", "legal"]
  minLiquidFundsUSD: z.number().optional(),
  minYearsExperience: z.number().optional(),
  mandatoryCredentials: z.array(z.string()).default([]), // e.g. "Notarized Degree (Tier 2)", "B2 German or C1 English"
});
export type TargetGoal = z.infer<typeof TargetGoalSchema>;

export const AdvisorGapAlertSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  category: z.string(),
  severity: z.enum(["critical", "warning", "recommendation"]),
  title: z.string(),
  message: z.string(),
  missingCredentialType: z.string().optional(),
  suggestedAction: z.string(),
  isResolved: z.boolean().default(false),
});
export type AdvisorGapAlert = z.infer<typeof AdvisorGapAlertSchema>;

export const SovereignAdvisorAuditSchema = z.object({
  userId: z.string(),
  overallReadinessScore: z.number().min(0).max(100),
  activeGoals: z.array(TargetGoalSchema),
  gapAlerts: z.array(AdvisorGapAlertSchema),
  strengths: z.array(z.string()),
  nextMilestones: z.array(z.string()),
  lastAuditedAt: z.string(),
  consularRoute: z.any().optional(),
  financialForensics: z.any().optional(),
  checklist: z.array(z.any()).optional(),
  decisionVerdict: z.enum(["READY_TO_APPLY", "BORDERLINE_RISK", "HIGH_REFUSAL_PROBABILITY"]).optional(),
});
export type SovereignAdvisorAudit = z.infer<typeof SovereignAdvisorAuditSchema>;
export type { ConsularChecklistItem, FinancialForensicsReport, ConsularVisaRoute } from "./consular";

// --- API Input Schemas (strict validation for mutating endpoints) ---

/** POST /api/v1/user/profile — profile updates never accept userId/updatedAt from the client. */
export const UserHumanProfileUpdateSchema = UserHumanProfileSchema.omit({
  userId: true,
  updatedAt: true,
}).partial();
export type UserHumanProfileUpdate = z.infer<typeof UserHumanProfileUpdateSchema>;

/** POST /api/v1/user/niches — create/update payload; server owns userId and timestamps. */
export const UserProfileNicheInputSchema = UserProfileNicheSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();
export type UserProfileNicheInput = z.infer<typeof UserProfileNicheInputSchema>;

/** POST /api/v1/user/advisor — goal create/update payload; server owns userId. */
export const TargetGoalInputSchema = TargetGoalSchema.omit({ userId: true }).partial();
export type TargetGoalInput = z.infer<typeof TargetGoalInputSchema>;

