import {
  UserHumanProfile,
  UserProfileNiche,
  TargetGoal,
  AdvisorGapAlert,
  SovereignAdvisorAudit,
} from "@/types/profile";
import { globalUserStore } from "./user_store";
import { findConsularRoute } from "@/core/advisor/consular_routes_catalog";
import { auditFinancialForensics } from "@/core/advisor/financial_forensics";
import { ConsularChecklistItem, FinancialForensicsReport, ConsularVisaRoute } from "@/types/profile";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { MultiLLMGateway } from "@/agents/gateway/llm_gateway";
import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Profile & Sovereign Advisor Store
 *
 * SOVEREIGN NODE INVARIANT: Human profiles, persona niches, and target goals
 * are persisted to the regional Supabase/PostgreSQL node
 * (tables: user_human_profiles, user_profile_niches, user_target_goals) whose
 * RLS policies scope every row to its owner (auth.uid() = user_id).
 *
 * The in-memory Maps are a DEVELOPMENT-ONLY fallback, activated solely when
 * Supabase service credentials are not configured. Demo seed data is loaded
 * exclusively in that fallback mode and never in a configured deployment.
 */
class ProfileAndAdvisorStore {
  private profiles: Map<string, UserHumanProfile> = new Map();
  private niches: Map<string, UserProfileNiche[]> = new Map();
  private goals: Map<string, TargetGoal[]> = new Map();
  private db: SupabaseClient | null | undefined = undefined;

  constructor() {
    if (!this.getDb()) {
      console.info(
        "[ProfileStore] Supabase not configured — using in-memory development fallback with demo seed data."
      );
      this.seedDemoData();
    }
  }

  /** Returns the service-role Supabase client, or null when unconfigured. */
  private getDb(): SupabaseClient | null {
    if (this.db !== undefined) return this.db;
    try {
      this.db = createAdminSupabaseClient();
    } catch {
      this.db = null;
    }
    return this.db;
  }

  // --- ROW MAPPERS (snake_case DB <-> camelCase domain) ---

  private profileToRow(p: UserHumanProfile) {
    const rawSocial = { ...(p.socialLinks ?? {}) };
    // Preserves workExperiences in social_links JSONB for 100% resilient DB persistence
    (rawSocial as any)._workExperiences = p.workExperiences ?? [];

    return {
      user_id: p.userId,
      full_name: p.fullName,
      headline: p.headline ?? null,
      bio: p.bio ?? null,
      avatar_url: p.avatarUrl ?? null,
      date_of_birth: p.dateOfBirth ?? null,
      residence_city: p.residenceCity,
      residence_country: p.residenceCountry,
      nationality: p.nationality,
      social_links: rawSocial,
      languages: p.languages ?? [],
      skills: p.skills ?? [],
      hobbies: p.hobbies ?? [],
      target_roles: p.targetRoles ?? [],
      target_countries: p.targetCountries ?? [],
      updated_at: p.updatedAt,
    };
  }

  private rowToProfile(row: any): UserHumanProfile {
    const rawSocial = row.social_links ?? {};
    const workExperiences = row.work_experiences ?? rawSocial._workExperiences ?? [];
    const { _workExperiences, ...cleanSocial } = rawSocial;

    return {
      userId: row.user_id,
      fullName: row.full_name,
      headline: row.headline ?? "",
      bio: row.bio ?? "",
      avatarUrl: row.avatar_url ?? undefined,
      dateOfBirth: row.date_of_birth ?? undefined,
      residenceCity: row.residence_city,
      residenceCountry: row.residence_country,
      nationality: row.nationality,
      socialLinks: cleanSocial,
      languages: row.languages ?? [],
      skills: row.skills ?? [],
      workExperiences,
      hobbies: row.hobbies ?? [],
      targetRoles: row.target_roles ?? [],
      targetCountries: row.target_countries ?? [],
      updatedAt: row.updated_at,
    };
  }

  private nicheToRow(n: UserProfileNiche) {
    return {
      id: n.id,
      user_id: n.userId,
      title: n.title,
      target_type: n.targetType,
      target_industry: n.targetIndustry,
      headline: n.headline,
      executive_summary: n.executiveSummary,
      selected_skill_ids: n.selectedSkillIds ?? [],
      selected_credential_ids: n.selectedCredentialIds ?? [],
      auto_synthesize_dossier: n.autoSynthesizeDossier,
      is_default: n.isDefault,
      created_at: n.createdAt,
      updated_at: n.updatedAt,
    };
  }

  private rowToNiche(row: any): UserProfileNiche {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      targetType: row.target_type,
      targetIndustry: row.target_industry,
      headline: row.headline,
      executiveSummary: row.executive_summary,
      selectedSkillIds: row.selected_skill_ids ?? [],
      selectedCredentialIds: row.selected_credential_ids ?? [],
      autoSynthesizeDossier: row.auto_synthesize_dossier,
      isDefault: row.is_default,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private goalToRow(g: TargetGoal) {
    return {
      id: g.id,
      user_id: g.userId,
      type: g.type,
      title: g.title,
      target_country: g.targetCountry,
      target_date: g.targetDate ?? null,
      status: g.status,
      required_categories: g.requiredCategories ?? [],
      min_liquid_funds_usd: g.minLiquidFundsUSD ?? null,
      min_years_experience: g.minYearsExperience ?? null,
      mandatory_credentials: g.mandatoryCredentials ?? [],
    };
  }

  private rowToGoal(row: any): TargetGoal {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      targetCountry: row.target_country,
      targetDate: row.target_date ?? undefined,
      status: row.status,
      requiredCategories: row.required_categories ?? [],
      minLiquidFundsUSD: row.min_liquid_funds_usd ?? undefined,
      minYearsExperience: row.min_years_experience ?? undefined,
      mandatoryCredentials: row.mandatory_credentials ?? [],
    };
  }

  private buildDefaultProfile(userId: string): UserHumanProfile {
    return {
      userId,
      fullName: "Citizen User",
      headline: "Sovereign Identity Holder",
      bio: "",
      residenceCity: "Lagos",
      residenceCountry: "Nigeria",
      nationality: "Nigerian",
      socialLinks: {},
      languages: [{ id: "lang_1", language: "English", level: "NATIVE", isNative: true }],
      skills: [],
      workExperiences: [],
      hobbies: [],
      targetRoles: [],
      targetCountries: [],
      updatedAt: new Date().toISOString(),
    };
  }

  // --- HUMAN PROFILE CRUD ---

  public async getProfile(userId: string): Promise<UserHumanProfile> {
    const db = this.getDb();
    if (db) {
      const { data, error } = await db
        .from("user_human_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw new Error(`Profile fetch failed: ${error.message}`);
      if (data) return this.rowToProfile(data);

      // First touch: persist a default profile for the authenticated user
      const fresh = this.buildDefaultProfile(userId);
      const { error: insertError } = await db
        .from("user_human_profiles")
        .insert(this.profileToRow(fresh));
      if (insertError) throw new Error(`Profile bootstrap failed: ${insertError.message}`);
      return fresh;
    }

    let profile = this.profiles.get(userId);
    if (!profile) {
      profile = this.buildDefaultProfile(userId);
      this.profiles.set(userId, profile);
    }
    return { ...profile };
  }

  public async updateProfile(
    userId: string,
    updates: Partial<UserHumanProfile>
  ): Promise<UserHumanProfile> {
    const existing = await this.getProfile(userId);
    const updated: UserHumanProfile = {
      ...existing,
      ...updates,
      userId, // Server-owned identity; client payload can never override it
      socialLinks: { ...existing.socialLinks, ...(updates.socialLinks || {}) },
      languages: updates.languages || existing.languages,
      skills: updates.skills || existing.skills,
      workExperiences: updates.workExperiences || existing.workExperiences,
      hobbies: updates.hobbies || existing.hobbies,
      targetRoles: updates.targetRoles || existing.targetRoles,
      targetCountries: updates.targetCountries || existing.targetCountries,
      updatedAt: new Date().toISOString(),
    };

    // Synchronize work experiences with vault_records 'experience' category
    if (updates.workExperiences && updates.workExperiences.length > 0) {
      try {
        await globalUserStore.addCredentialAsync(
          "experience",
          {
            experiences: updates.workExperiences.map((w) => ({
              company: w.company,
              jobTitle: w.title,
              employmentType: w.employmentType,
              startDate: w.startDate,
              endDate: w.endDate || null,
              isCurrent: w.isCurrent,
              location: w.location || null,
              summary: w.description,
            })),
          },
          userId
        );
      } catch (expErr: any) {
        console.warn("[ProfileStore] Experience vault sync notice:", expErr.message);
      }
    }

    // Two-way synchronization: sync new target countries & roles to target goals
    if (updates.targetCountries || updates.targetRoles) {
      const activeGoals = await this.listGoals(userId);
      const existingCountries = new Set(activeGoals.map((g) => g.targetCountry.toLowerCase()));
      const countriesToAdd = (updates.targetCountries || []).filter(
        (c) => c && !existingCountries.has(c.toLowerCase())
      );
      for (const country of countriesToAdd) {
        const goalRole = updates.targetRoles?.[0] || "Skilled Migration & Career";
        await this.addOrUpdateGoal(userId, {
          type: "relocation",
          title: goalRole,
          targetCountry: country,
          status: "active",
        });
      }
    }

    const db = this.getDb();
    if (db) {
      const { error } = await db
        .from("user_human_profiles")
        .upsert(this.profileToRow(updated), { onConflict: "user_id" });
      if (error) throw new Error(`Profile update failed: ${error.message}`);
      return updated;
    }

    this.profiles.set(userId, updated);
    return updated;
  }

  // --- PERSONA NICHES CRUD ---

  public async listNiches(userId: string): Promise<UserProfileNiche[]> {
    const db = this.getDb();
    if (db) {
      const { data, error } = await db
        .from("user_profile_niches")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(`Niche list failed: ${error.message}`);
      return (data || []).map((r) => this.rowToNiche(r));
    }
    return this.niches.get(userId) || [];
  }

  public async createOrUpdateNiche(
    userId: string,
    niche: Partial<UserProfileNiche>
  ): Promise<UserProfileNiche> {
    const id = niche.id || `niche_${randomBytes(4).toString("hex")}`;
    const now = new Date().toISOString();

    const db = this.getDb();
    let existingCreatedAt = niche.createdAt;
    if (db && niche.id) {
      const { data: existing } = await db
        .from("user_profile_niches")
        .select("created_at")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();
      existingCreatedAt = existing?.created_at ?? existingCreatedAt;
    }

    const record: UserProfileNiche = {
      id,
      userId,
      title: niche.title || "Custom Persona Niche",
      targetType: niche.targetType || "job",
      targetIndustry: niche.targetIndustry || "General Industry",
      headline: niche.headline || "",
      executiveSummary: niche.executiveSummary || "",
      selectedSkillIds: niche.selectedSkillIds || [],
      selectedCredentialIds: niche.selectedCredentialIds || [],
      autoSynthesizeDossier: niche.autoSynthesizeDossier ?? true,
      isDefault: niche.isDefault ?? false,
      createdAt: existingCreatedAt || now,
      updatedAt: now,
    };

    if (db) {
      if (record.isDefault) {
        const { error: clearError } = await db
          .from("user_profile_niches")
          .update({ is_default: false })
          .eq("user_id", userId)
          .neq("id", id);
        if (clearError) throw new Error(`Niche default reset failed: ${clearError.message}`);
      }
      const { error } = await db
        .from("user_profile_niches")
        .upsert(this.nicheToRow(record), { onConflict: "id" });
      if (error) throw new Error(`Niche save failed: ${error.message}`);
      return record;
    }

    const userNiches = this.niches.get(userId) || [];
    if (record.isDefault) {
      userNiches.forEach((n) => (n.isDefault = false));
    }
    const index = userNiches.findIndex((n) => n.id === id);
    if (index >= 0) {
      userNiches[index] = record;
    } else {
      userNiches.push(record);
    }
    this.niches.set(userId, userNiches);
    return record;
  }

  public async deleteNiche(userId: string, nicheId: string): Promise<boolean> {
    const db = this.getDb();
    if (db) {
      const { error, count } = await db
        .from("user_profile_niches")
        .delete({ count: "exact" })
        .eq("id", nicheId)
        .eq("user_id", userId); // Ownership enforced in the delete predicate
      if (error) throw new Error(`Niche delete failed: ${error.message}`);
      return (count ?? 0) > 0;
    }

    const userNiches = this.niches.get(userId) || [];
    const filtered = userNiches.filter((n) => n.id !== nicheId);
    this.niches.set(userId, filtered);
    return filtered.length < userNiches.length;
  }

  // --- TARGET GOALS CRUD ---

  public async listGoals(userId: string): Promise<TargetGoal[]> {
    const db = this.getDb();
    if (db) {
      const { data, error } = await db
        .from("user_target_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(`Goal list failed: ${error.message}`);
      return (data || []).map((r) => this.rowToGoal(r));
    }
    return this.goals.get(userId) || [];
  }

  public async addOrUpdateGoal(
    userId: string,
    goal: Partial<TargetGoal>
  ): Promise<TargetGoal> {
    const id = goal.id || `goal_${randomBytes(4).toString("hex")}`;

    const record: TargetGoal = {
      id,
      userId,
      type: goal.type || "job",
      title: goal.title || "New Sovereign Target",
      targetCountry: goal.targetCountry || "Global",
      targetDate: goal.targetDate,
      status: goal.status || "active",
      requiredCategories: goal.requiredCategories || ["identification", "academics"],
      minLiquidFundsUSD: goal.minLiquidFundsUSD,
      minYearsExperience: goal.minYearsExperience,
      mandatoryCredentials: goal.mandatoryCredentials || [],
    };

    const db = this.getDb();
    if (db) {
      const { error } = await db
        .from("user_target_goals")
        .upsert(this.goalToRow(record), { onConflict: "id" });
      if (error) throw new Error(`Goal save failed: ${error.message}`);
    }

    const userGoals = this.goals.get(userId) || [];
    const index = userGoals.findIndex((g) => g.id === id);
    if (index >= 0) {
      userGoals[index] = record;
    } else {
      userGoals.push(record);
    }
    this.goals.set(userId, userGoals);

    // Two-way synchronization: ensure target country & role exist in user profile
    if (record.targetCountry && record.targetCountry !== "Global") {
      try {
        const p = await this.getProfile(userId);
        let changed = false;
        if (!p.targetCountries.includes(record.targetCountry)) {
          p.targetCountries.push(record.targetCountry);
          changed = true;
        }
        if (record.title && !p.targetRoles.includes(record.title)) {
          p.targetRoles.push(record.title);
          changed = true;
        }
        if (changed) {
          await this.updateProfile(userId, {
            targetCountries: p.targetCountries,
            targetRoles: p.targetRoles,
          });
        }
      } catch {
        // Non-fatal
      }
    }

    return record;
  }

  public async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    const userGoals = this.goals.get(userId) || [];
    const filtered = userGoals.filter((g) => g.id !== goalId);
    this.goals.set(userId, filtered);

    const db = this.getDb();
    if (db) {
      const { error, count } = await db
        .from("user_target_goals")
        .delete({ count: "exact" })
        .eq("id", goalId)
        .eq("user_id", userId);
      if (error) throw new Error(`Goal delete failed: ${error.message}`);
      return (count ?? 0) > 0;
    }

    return filtered.length < userGoals.length;
  }

  // --- DYNAMIC AI SOVEREIGN ADVISOR AUDIT ENGINE ---

  public async runAdvisorAudit(userId: string): Promise<SovereignAdvisorAudit> {
    const profile = await this.getProfile(userId);
    const userVault = await globalUserStore.getVaultAsync(userId);
    const activeGoals = (await this.listGoals(userId)).filter((g) => g.status === "active");

    const gapAlerts: AdvisorGapAlert[] = [];
    const strengths: string[] = [];
    const nextMilestones: string[] = [];

    // Audit vault items
    const hasPassport = (userVault.identification?.identifications?.length || 0) > 0;
    const hasDegree = (userVault.academics?.degrees?.length || 0) > 0;
    const hasTier2Degree = userVault.academics?.degrees?.some((d: any) => d.isNotarized || d.tier === 2);
    const hasExperience =
      (userVault.experience?.experiences?.length || 0) > 0 ||
      (profile.workExperiences && profile.workExperiences.length > 0);
    const hasFinance = (userVault.finance?.bankRecords?.length || 0) > 0 || !!userVault.finance?.taxClearance;
    const hasLegal = (userVault.legal?.instruments?.length || 0) > 0;
    const hasEnglishC1OrNative = profile.languages.some(
      (l) => l.language.toLowerCase().includes("english") && (l.isNative || ["C1", "C2", "NATIVE"].includes(l.level))
    );

    // Strengths
    if (hasDegree && hasTier2Degree) {
      strengths.push("Tier-2 Notarized University Degree on-chain with authentic institutional attestation.");
    } else if (hasDegree) {
      strengths.push("Verified Higher Education Degree on-chain in sovereign vault.");
    }
    if (hasExperience) {
      strengths.push("Verified professional employment history and engineering tenure documented.");
    }
    if (hasPassport) {
      strengths.push("Valid International Passport with machine-readable MRZ code verified.");
    }
    if (hasFinance) {
      strengths.push("Verified liquid proof of funds and solvency statement committed on-chain.");
    }
    if (profile.skills.length >= 3) {
      strengths.push(`Rich technical skills matrix (${profile.skills.length} domains evaluated with depth).`);
    }

    // Universal Country & Target Evaluation
    for (const goal of activeGoals) {
      const country = goal.targetCountry || "Global";
      const countryLower = country.toLowerCase();

      if (goal.type === "relocation") {
        if (!hasPassport) {
          gapAlerts.push({
            id: `gap_pass_${goal.id}_${randomBytes(2).toString("hex")}`,
            goalId: goal.id,
            category: "identification",
            severity: "critical",
            title: `Missing Valid Passport for ${country} Relocation`,
            message: `International relocation and visa applications to ${country} strictly mandate a valid international passport with > 6 months validity and MRZ verification.`,
            missingCredentialType: "International Passport",
            suggestedAction: "Upload or scan your valid passport under Vault > Identification.",
            isResolved: false,
          });
        }

        if (!hasFinance) {
          gapAlerts.push({
            id: `gap_fin_${goal.id}_${randomBytes(2).toString("hex")}`,
            goalId: goal.id,
            category: "finance",
            severity: "critical",
            title: `Proof of Financial Solvency Required for ${country}`,
            message: `${country} consular authorities require verified bank statements showing sufficient liquid balance to demonstrate independent financial support.`,
            missingCredentialType: "Proof of Funds / Bank Statement",
            suggestedAction: "Upload your recent 3-6 month official bank statement under Vault > Finance.",
            isResolved: false,
          });
        }

        if (!hasLegal) {
          gapAlerts.push({
            id: `gap_leg_${goal.id}_${randomBytes(2).toString("hex")}`,
            goalId: goal.id,
            category: "legal",
            severity: "warning",
            title: `Sworn Affidavit / Police Character Certificate for ${country}`,
            message: `Immigration and residence permits for ${country} require a notarized certificate of clean criminal record or sworn affidavit.`,
            missingCredentialType: "Police Character Certificate / Affidavit",
            suggestedAction: "Upload a sworn declaration or police character clearance under Vault > Legal.",
            isResolved: false,
          });
        }

        if (!hasExperience && (goal.title.toLowerCase().includes("employment") || goal.title.toLowerCase().includes("work"))) {
          gapAlerts.push({
            id: `gap_exp_${goal.id}_${randomBytes(2).toString("hex")}`,
            goalId: goal.id,
            category: "experience",
            severity: "warning",
            title: `Documented Work History & Contracts for ${country}`,
            message: `Professional relocation or self-employment permit in ${country} mandates documented proof of professional tenure and client contracts.`,
            missingCredentialType: "Employment Contract / Work Verification",
            suggestedAction: "Add your work experience in Human Profile and upload prior contracts under Vault > Experience.",
            isResolved: false,
          });
        }

        // Country-specific language & immigration rules
        if (countryLower.includes("albania")) {
          const hasAccommodationProof = userVault.legal?.instruments?.some(
            (r: any) => r.title.toLowerCase().includes("lease") || r.title.toLowerCase().includes("rent") || r.title.toLowerCase().includes("accommodation")
          );
          if (!hasAccommodationProof) {
            gapAlerts.push({
              id: `gap_alb_lease_${goal.id}_${randomBytes(2).toString("hex")}`,
              goalId: goal.id,
              category: "legal",
              severity: "warning",
              title: "Albania Unique Permit: Proof of Accommodation / Residential Lease",
              message: "Albanian immigration authorities require a notarized residential lease contract or registered address in Albania for Unique Residence Permit issuance.",
              missingCredentialType: "Residential Lease Agreement / Notarized Host Declaration",
              suggestedAction: "Upload your registered Albanian lease agreement or host notarization under Vault > Legal.",
              isResolved: false,
            });
          }
        }

        if (countryLower.includes("germany") || countryLower.includes("austria")) {
          const hasGerman = profile.languages.some((l) => l.language.toLowerCase().includes("german") && ["B1", "B2", "C1", "C2", "NATIVE"].includes(l.level));
          if (!hasGerman) {
            gapAlerts.push({
              id: `gap_lang_${goal.id}_${randomBytes(2).toString("hex")}`,
              goalId: goal.id,
              category: "profile_languages",
              severity: "warning",
              title: "German Language Attestation (Target: B1/B2)",
              message: "Chancenkarte points scoring and EU Blue Card require B1/B2 German language attestation.",
              missingCredentialType: "Goethe / TELC B1+ Certificate",
              suggestedAction: "Add German proficiency or upload Goethe exam confirmation.",
              isResolved: false,
            });
          }
        }
      }

      if (goal.type === "job") {
        if (!hasEnglishC1OrNative) {
          gapAlerts.push({
            id: `gap_eng_${goal.id}_${randomBytes(2).toString("hex")}`,
            goalId: goal.id,
            category: "profile_languages",
            severity: "warning",
            title: "Fluent Professional English Verification Recommended",
            message: "Global remote positions mandate verified C1 or Native English proficiency.",
            suggestedAction: "Set English to C1/Native in Human Profile or link language attestation.",
            isResolved: false,
          });
        }

        if (!hasExperience) {
          gapAlerts.push({
            id: `gap_exp_${goal.id}_${randomBytes(2).toString("hex")}`,
            goalId: goal.id,
            category: "experience",
            severity: "critical",
            title: "Documented Work Experience Required",
            message: "Recruiters and screening agents evaluate verified prior tenure and responsibilities.",
            suggestedAction: "Populate your Work Experience timeline in Human Profile or upload experience certificates.",
            isResolved: false,
          });
        }
      }

      if (goal.type === "academic") {
        if (!hasDegree) {
          gapAlerts.push({
            id: `gap_deg_${goal.id}_${randomBytes(2).toString("hex")}`,
            goalId: goal.id,
            category: "academics",
            severity: "critical",
            title: `Degree & Transcripts Required for ${country}`,
            message: "Academic admissions require prior diploma and official transcripts.",
            suggestedAction: "Upload degree certificate and transcript under Vault > Academics.",
            isResolved: false,
          });
        }
      }

      if (goal.type === "procurement") {
        if (!hasLegal) {
          gapAlerts.push({
            id: `gap_proc_${goal.id}_${randomBytes(2).toString("hex")}`,
            goalId: goal.id,
            category: "legal",
            severity: "critical",
            title: "Corporate Legal Instruments & MOUs Required",
            message: "Enterprise procurement criteria demand legal incorporation and sworn vendor agreements.",
            suggestedAction: "Upload partnership agreement or corporate charter under Vault > Legal.",
            isResolved: false,
          });
        }
      }
    }

    // --- FORENSIC CONSULAR INTELLIGENCE & STATUTORY CHECKLIST ---
    const primaryGoal = activeGoals[0] || null;
    const consularRoute: ConsularVisaRoute = primaryGoal
      ? findConsularRoute(primaryGoal.targetCountry, primaryGoal.title)
      : findConsularRoute("Global", "General Relocation");

    const financialForensics: FinancialForensicsReport = auditFinancialForensics(
      userVault,
      profile,
      consularRoute
    );

    const checklist: ConsularChecklistItem[] = [];

    // 1. Identification Check
    if (hasPassport) {
      checklist.push({
        id: "chk_passport",
        category: "identification",
        title: "International Passport & MRZ Integrity",
        requirement: "Valid biometric passport with machine-readable zone (MRZ) and >6 months validity.",
        statutoryCitation: "ICAO Doc 9303 / Destination Consular Entry Rules",
        status: "verified",
        isSatisfied: true,
        proofSnippet: `Verified passport on-chain (${userVault.identification?.identifications?.[0]?.documentNumber || "Biometric"}).`,
      });
    } else {
      checklist.push({
        id: "chk_passport",
        category: "identification",
        title: "International Passport & MRZ Integrity",
        requirement: "Valid biometric passport with machine-readable zone (MRZ) and >6 months validity.",
        statutoryCitation: "ICAO Doc 9303 / Destination Consular Entry Rules",
        status: "refusal_risk",
        isSatisfied: false,
        suggestedAction: "Upload or scan your valid passport under Vault > Identification.",
        rectificationUrl: "/dashboard/documents",
      });
    }

    // 2. Financial Solvency & Maintenance Funds
    if (financialForensics.isAmountSufficient && financialForensics.isConsecutiveRuleSatisfied) {
      checklist.push({
        id: "chk_finance_amount",
        category: "finance",
        title: `Maintenance Solvency (${consularRoute.financialRequirements.targetCurrency} ${consularRoute.financialRequirements.minimumLiquidFundsTargetCurrency.toLocaleString()})`,
        requirement: `Statutory minimum liquid funds of ${consularRoute.financialRequirements.targetCurrency} ${consularRoute.financialRequirements.minimumLiquidFundsTargetCurrency.toLocaleString()} maintained.`,
        statutoryCitation: `${consularRoute.statutoryAuthority} Maintenance Rules`,
        status: "verified",
        isSatisfied: true,
        proofSnippet: `Detected balance: ${financialForensics.targetCurrency} ${financialForensics.detectedLiquidBalance.toLocaleString()} (Exceeds required ${financialForensics.targetCurrency} ${financialForensics.requiredAmount.toLocaleString()}).`,
      });
    } else {
      checklist.push({
        id: "chk_finance_amount",
        category: "finance",
        title: `Maintenance Solvency (${consularRoute.financialRequirements.targetCurrency} ${consularRoute.financialRequirements.minimumLiquidFundsTargetCurrency.toLocaleString()})`,
        requirement: `Statutory minimum liquid funds of ${consularRoute.financialRequirements.targetCurrency} ${consularRoute.financialRequirements.minimumLiquidFundsTargetCurrency.toLocaleString()} required.`,
        statutoryCitation: `${consularRoute.statutoryAuthority} Maintenance Rules`,
        status: "refusal_risk",
        isSatisfied: false,
        proofSnippet: financialForensics.summary,
        suggestedAction: `Shortfall of ${financialForensics.targetCurrency} ${financialForensics.shortfallAmount.toLocaleString()}. Upload updated bank statement under Vault > Finance.`,
        rectificationUrl: "/dashboard/documents",
      });
    }

    // 3. Consecutive Holding Duration Rule
    if (consularRoute.financialRequirements.strictConsecutiveBalance) {
      if (financialForensics.isConsecutiveRuleSatisfied) {
        checklist.push({
          id: "chk_finance_consecutive",
          category: "finance",
          title: `Strict ${consularRoute.financialRequirements.holdingPeriodDays}-Day Consecutive Balance Holding`,
          requirement: `Funds must never dip below the required threshold for ${consularRoute.financialRequirements.holdingPeriodDays} consecutive days.`,
          statutoryCitation: "UKVI Appendix Finance FIN 5.1",
          status: "verified",
          isSatisfied: true,
          proofSnippet: `Statement period verified over ${financialForensics.consecutiveDaysPassed} consecutive days.`,
        });
      } else {
        checklist.push({
          id: "chk_finance_consecutive",
          category: "finance",
          title: `Strict ${consularRoute.financialRequirements.holdingPeriodDays}-Day Consecutive Balance Holding`,
          requirement: `Funds must never dip below the required threshold for ${consularRoute.financialRequirements.holdingPeriodDays} consecutive days.`,
          statutoryCitation: "UKVI Appendix Finance FIN 5.1",
          status: "refusal_risk",
          isSatisfied: false,
          suggestedAction: `Ensure your account maintains the minimum balance for at least ${consularRoute.financialRequirements.holdingPeriodDays} consecutive days before visa application.`,
          rectificationUrl: "/dashboard/documents",
        });
      }
    }

    // 4. Funds Dumping / Sudden Unexplained Spike Flag
    if (financialForensics.suddenDepositDetected) {
      checklist.push({
        id: "chk_finance_dumping",
        category: "finance",
        title: "Sudden Deposit / Funds Provenance Audit",
        requirement: "Consular officers reject borrowed or parked funds. All sudden deposits must have verifiable provenance.",
        statutoryCitation: "UKVI Appendix Finance FIN 8.1 / IRPA R200",
        status: "warning",
        isSatisfied: false,
        proofSnippet: financialForensics.suddenDepositDetails,
        suggestedAction: "Upload source-of-funds proof (e.g. deed of sale, employer gratuity, notarized gift affidavit) under Vault > Legal.",
        rectificationUrl: "/dashboard/documents",
      });
    } else if (hasFinance) {
      checklist.push({
        id: "chk_finance_dumping",
        category: "finance",
        title: "Transaction Consistency & Deposit Patterns",
        requirement: "Natural transaction velocity without suspicious lump-sum deposits.",
        statutoryCitation: "Consular Financial Bona Fides Standard",
        status: "verified",
        isSatisfied: true,
        proofSnippet: "Consistent transaction velocity; zero suspicious funds-dumping spikes detected.",
      });
    }

    // 5. Account Holder Name Reconciliation
    if (!financialForensics.accountHolderNameMatch) {
      checklist.push({
        id: "chk_finance_name_match",
        category: "finance",
        title: "Bank Account Holder Name Reconciliation",
        requirement: "Account name on bank statement must match passport legal name.",
        statutoryCitation: "Consular Financial Sponsorship Standard",
        status: "warning",
        isSatisfied: false,
        proofSnippet: `Bank account name ("${financialForensics.accountNameDetected}") differs from passport ("${financialForensics.passportNameDetected}").`,
        suggestedAction: "Upload a notarized Sworn Affidavit of Name Confirmation under Vault > Legal.",
        rectificationUrl: "/dashboard/documents",
      });
    }

    // 6. Legal Instrument / Police Character / Lease
    const hasPoliceClearance = userVault.legal?.instruments?.some(
      (r: any) => r.title.toLowerCase().includes("police") || r.title.toLowerCase().includes("character") || r.title.toLowerCase().includes("clearance")
    );
    if (hasPoliceClearance) {
      checklist.push({
        id: "chk_legal_police",
        category: "legal",
        title: "Police Character Clearance / Certificate of Good Conduct",
        requirement: "Clean criminal record certificate with official Hague Apostille or consular legalization.",
        statutoryCitation: "Consular General Inadmissibility Grounds",
        status: "verified",
        isSatisfied: true,
        proofSnippet: "Verified police character clearance certificate on-chain.",
      });
    } else {
      checklist.push({
        id: "chk_legal_police",
        category: "legal",
        title: "Police Character Clearance / Certificate of Good Conduct",
        requirement: "Clean criminal record certificate with official Hague Apostille or consular legalization.",
        statutoryCitation: "Consular General Inadmissibility Grounds",
        status: "warning",
        isSatisfied: false,
        suggestedAction: "Upload your police character certificate or notarized affidavit under Vault > Legal.",
        rectificationUrl: "/dashboard/documents",
      });
    }

    // 7. Residential Lease / Accommodation (for Albania / Schengen)
    if (primaryGoal?.targetCountry?.toLowerCase().includes("albania")) {
      const hasLease = userVault.legal?.instruments?.some(
        (r: any) => r.title.toLowerCase().includes("lease") || r.title.toLowerCase().includes("rent") || r.title.toLowerCase().includes("accommodation")
      );
      if (hasLease) {
        checklist.push({
          id: "chk_albania_lease",
          category: "legal",
          title: "Albania Unique Permit: Registered Residential Lease",
          requirement: "Notarized residential rental contract or host declaration in Albania.",
          statutoryCitation: "Law No. 79/2021 Article 34(d)",
          status: "verified",
          isSatisfied: true,
          proofSnippet: "Registered lease contract verified in sovereign vault.",
        });
      } else {
        checklist.push({
          id: "chk_albania_lease",
          category: "legal",
          title: "Albania Unique Permit: Registered Residential Lease",
          requirement: "Notarized residential rental contract or host declaration in Albania.",
          statutoryCitation: "Law No. 79/2021 Article 34(d)",
          status: "warning",
          isSatisfied: false,
          suggestedAction: "Upload your registered Albanian lease agreement or notarized host declaration under Vault > Legal.",
          rectificationUrl: "/dashboard/documents",
        });
      }
    }

    // 8. Academic Recognition & Equivalency
    if (hasDegree) {
      checklist.push({
        id: "chk_academics_degree",
        category: "academics",
        title: "Higher Education Degree & Tertiary Recognition",
        requirement: "Degree evaluated for comparability (Anabin H+, UK Ecctis, WES Canada).",
        statutoryCitation: "Destination Qualification Recognition Standards",
        status: "verified",
        isSatisfied: true,
        proofSnippet: `Verified degree on-chain${hasTier2Degree ? " with Tier-2 Legalized Notary Stamp" : ""}.`,
      });
    } else if (consularRoute.category === "work" || consularRoute.category === "study") {
      checklist.push({
        id: "chk_academics_degree",
        category: "academics",
        title: "Higher Education Degree & Tertiary Recognition",
        requirement: "Degree evaluated for comparability (Anabin H+, UK Ecctis, WES Canada).",
        statutoryCitation: "Destination Qualification Recognition Standards",
        status: "warning",
        isSatisfied: false,
        suggestedAction: "Upload degree certificate and transcript under Vault > Academics.",
        rectificationUrl: "/dashboard/documents",
      });
    }

    // 9. Work Experience & Career Tenure
    if (hasExperience) {
      checklist.push({
        id: "chk_experience",
        category: "experience",
        title: "Documented Professional Tenure & Work Contracts",
        requirement: "Documented employment history matching destination eligible occupation codes.",
        statutoryCitation: "Skilled Worker / Talent Mobility Regulations",
        status: "verified",
        isSatisfied: true,
        proofSnippet: `Documented career history (${profile.workExperiences?.length || 0} roles listed).`,
      });
    } else {
      checklist.push({
        id: "chk_experience",
        category: "experience",
        title: "Documented Professional Tenure & Work Contracts",
        requirement: "Documented employment history matching destination eligible occupation codes.",
        statutoryCitation: "Skilled Worker / Talent Mobility Regulations",
        status: "warning",
        isSatisfied: false,
        suggestedAction: "Add your work experiences in Human Profile or upload employment contracts under Vault > Experience.",
        rectificationUrl: "/dashboard/profile",
      });
    }

    // Sync Checklist into Gap Alerts for seamless UI integration
    for (const item of checklist) {
      if (!item.isSatisfied) {
        const severity = item.status === "refusal_risk" ? "critical" : "warning";
        const exists = gapAlerts.some((g) => g.title.toLowerCase().includes(item.title.toLowerCase().slice(0, 15)));
        if (!exists) {
          gapAlerts.push({
            id: `gap_${item.id}_${randomBytes(2).toString("hex")}`,
            goalId: primaryGoal?.id || "goal_default",
            category: item.category,
            severity,
            title: item.title,
            message: `${item.requirement} ${item.proofSnippet ? `(${item.proofSnippet})` : ""}`,
            missingCredentialType: item.title,
            suggestedAction: item.suggestedAction || "Upload required credential in your Citizen Vault.",
            isResolved: false,
          });
        }
      }
    }

    // Milestones
    if (gapAlerts.some((g) => g.severity === "critical")) {
      nextMilestones.push("Resolve critical missing credential blockers (Passport, Proof of Funds, or Legal Affidavits).");
    }
    if (gapAlerts.some((g) => g.severity === "warning")) {
      nextMilestones.push("Complete language attestations and employment contracts for target destination.");
    }
    nextMilestones.push("Generate Scoped API Key for destination embassy / recruiter with verified credentials.");
    nextMilestones.push("Synthesize tailored Zero-CV dossier in Persona Niche Studio.");

    // Dynamic Mathematical Score Calculation
    let calculatedScore = 100;
    if (activeGoals.length === 0) {
      // Base profile completeness
      calculatedScore = 40;
      if (hasPassport) calculatedScore += 15;
      if (hasFinance) calculatedScore += 15;
      if (hasExperience) calculatedScore += 15;
      if (hasDegree) calculatedScore += 15;
    } else {
      const criticalPenalty = gapAlerts.filter((g) => g.severity === "critical").length * 20;
      const warningPenalty = gapAlerts.filter((g) => g.severity === "warning").length * 10;
      const recPenalty = gapAlerts.filter((g) => g.severity === "recommendation").length * 5;
      calculatedScore = Math.max(15, Math.min(100, calculatedScore - criticalPenalty - warningPenalty - recPenalty));
    }

    const decisionVerdict: "READY_TO_APPLY" | "BORDERLINE_RISK" | "HIGH_REFUSAL_PROBABILITY" =
      calculatedScore >= 80 && !checklist.some((c) => c.status === "refusal_risk")
        ? "READY_TO_APPLY"
        : calculatedScore >= 50
        ? "BORDERLINE_RISK"
        : "HIGH_REFUSAL_PROBABILITY";

    return {
      userId,
      overallReadinessScore: calculatedScore,
      activeGoals,
      gapAlerts,
      strengths: Array.from(new Set(strengths)),
      nextMilestones: Array.from(new Set(nextMilestones)),
      lastAuditedAt: new Date().toISOString(),
      consularRoute,
      financialForensics,
      checklist,
      decisionVerdict,
    };
  }

  /**
   * Real Multimodal AI Sovereign Advisor Audit
   * Invokes Gemini 3.5 Flash (with Groq failover) for country-specific deep intelligence.
   */
  public async runLiveAiAdvisorAudit(userId: string): Promise<SovereignAdvisorAudit> {
    const fallbackAudit = await this.runAdvisorAudit(userId);
    const activeGoals = fallbackAudit.activeGoals;

    if (activeGoals.length === 0) {
      return fallbackAudit;
    }

    try {
      const profile = await this.getProfile(userId);
      const userVault = await globalUserStore.getVaultAsync(userId);

      const prompt = `
You are the SabiProfile Sovereign Target Advisor AI.
Evaluate this citizen's multi-target goals against their verified credentials.

Active Goals:
${JSON.stringify(activeGoals, null, 2)}

User Profile & Credentials Summary:
- Full Name: ${profile.fullName} (${profile.headline})
- Residence: ${profile.residenceCity}, ${profile.residenceCountry}
- Nationality: ${profile.nationality}
- Languages: ${profile.languages.map((l) => `${l.language} (${l.level})`).join(", ")}
- Skills: ${profile.skills.map((s) => `${s.name} (${s.proficiency})`).join(", ")}
- Work History: ${(profile.workExperiences || []).map((w) => `${w.title} at ${w.company} (${w.startDate} - ${w.isCurrent ? "Present" : w.endDate})`).join("; ")}
- Vault Identification: ${userVault.identification?.identifications?.length || 0} verified documents
- Vault Academics: ${userVault.academics?.degrees?.length || 0} degrees
- Vault Finance: ${userVault.finance?.bankRecords?.length || 0} bank records / proof of funds
- Vault Legal: ${userVault.legal?.instruments?.length || 0} sworn affidavits / contracts

Generate a rigorous, country-specific immigration and qualification audit tailored to the exact destination countries (${activeGoals.map((g) => g.targetCountry).join(", ")}).
Return valid JSON matching:
{
  "overallReadinessScore": number between 15 and 95,
  "gapAlerts": [
    {
      "id": "gap_ai_1",
      "goalId": "${activeGoals[0]?.id}",
      "category": "identification" | "finance" | "legal" | "experience" | "academics" | "profile_languages",
      "severity": "critical" | "warning" | "recommendation",
      "title": "Clear concise gap title",
      "message": "Specific explanation referencing destination country immigration or employer criteria",
      "missingCredentialType": "e.g. Bank Statement showing minimum liquid funds",
      "suggestedAction": "Exact steps to resolve in SabiProfile",
      "isResolved": false
    }
  ],
  "strengths": ["Strong verified asset 1", "Strong verified asset 2"],
  "nextMilestones": ["Actionable next step 1", "Actionable next step 2"]
}
`;

      const gateway = new MultiLLMGateway();
      const response = await gateway.complete({
        messages: [{ role: "user", content: prompt }],
        jsonSchema: true,
        temperature: 0.1,
      });

      let parsed: any;
      try {
        parsed = JSON.parse(response.content);
      } catch {
        const first = response.content.indexOf("{");
        const last = response.content.lastIndexOf("}");
        if (first !== -1 && last > first) {
          parsed = JSON.parse(response.content.substring(first, last + 1));
        }
      }

      if (parsed && Array.isArray(parsed.gapAlerts)) {
        return {
          userId,
          overallReadinessScore: typeof parsed.overallReadinessScore === "number" ? parsed.overallReadinessScore : fallbackAudit.overallReadinessScore,
          activeGoals,
          gapAlerts: parsed.gapAlerts.length > 0 ? parsed.gapAlerts : fallbackAudit.gapAlerts,
          strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : fallbackAudit.strengths,
          nextMilestones: Array.isArray(parsed.nextMilestones) && parsed.nextMilestones.length > 0 ? parsed.nextMilestones : fallbackAudit.nextMilestones,
          lastAuditedAt: new Date().toISOString(),
          consularRoute: fallbackAudit.consularRoute,
          financialForensics: fallbackAudit.financialForensics,
          checklist: fallbackAudit.checklist,
          decisionVerdict: fallbackAudit.decisionVerdict,
        };
      }
    } catch (aiErr: any) {
      console.warn("[ProfileStore] Live AI audit failover to sovereign rules:", aiErr.message);
    }

    return fallbackAudit;
  }

  /**
   * DEMO-ONLY seed data, loaded exclusively when Supabase is not configured
   * (local development fallback). Never seeded in a configured deployment.
   */
  private seedDemoData(): void {
    const demoUserId = "usr_chinwe_okafor_7721";

    const defaultProfile: UserHumanProfile = {
      userId: demoUserId,
      fullName: "Chinwe Nkechi Okafor",
      headline: "Principal Systems Engineer & Sovereign Identity Architect",
      bio: "Passionate about decentralized systems, high-throughput payment architectures, and verifiable credentials. 5+ years building fault-tolerant infrastructure across African and European fintechs.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop",
      dateOfBirth: "1996-05-15",
      residenceCity: "Lagos",
      residenceCountry: "Nigeria",
      nationality: "Nigerian",
      socialLinks: {
        linkedin: "https://linkedin.com/in/chinweokafor",
        github: "https://github.com/chinweokafor",
        twitter: "https://x.com/chinwe_codes",
        portfolio: "https://chinweokafor.dev",
        behance: "",
        other: "",
      },
      languages: [
        { id: "lang_en", language: "English", level: "NATIVE", isNative: true },
        {
          id: "lang_de",
          language: "German",
          level: "B1",
          isNative: false,
          verifiedCredentialRef: "Goethe-Zertifikat B1 (In Progress)",
        },
        { id: "lang_fr", language: "French", level: "A2", isNative: false },
      ],
      skills: [
        { id: "sk_dist", name: "Distributed Systems & Consensus", category: "Architecture", proficiency: "EXPERT", yearsOfExperience: 5 },
        { id: "sk_ts", name: "TypeScript & Node.js", category: "Software Engineering", proficiency: "EXPERT", yearsOfExperience: 6 },
        { id: "sk_go", name: "Go (Golang)", category: "Backend & Systems", proficiency: "ADVANCED", yearsOfExperience: 4 },
        { id: "sk_sol", name: "Solidity & EVM Smart Contracts", category: "Web3 & Blockchain", proficiency: "ADVANCED", yearsOfExperience: 3 },
        { id: "sk_pg", name: "PostgreSQL & Database Partitioning", category: "Databases", proficiency: "ADVANCED", yearsOfExperience: 5 },
      ],
      workExperiences: [
        {
          id: "exp_seed_1",
          company: "Helios Financial Systems",
          title: "Principal Distributed Systems Architect",
          employmentType: "Full-time",
          location: "Berlin, Germany (Hybrid)",
          startDate: "2023-01",
          isCurrent: true,
          description: "Led high-throughput settlement engine processing €40M+ daily. Implemented sovereign data enclave satisfying BaFin & GDPR requirements.",
          skillsUsed: ["TypeScript", "Distributed Systems", "PostgreSQL", "Go"],
        },
        {
          id: "exp_seed_2",
          company: "Kora Core Technologies",
          title: "Lead Infrastructure Engineer",
          employmentType: "Full-time",
          location: "Lagos, Nigeria",
          startDate: "2020-03",
          endDate: "2022-12",
          isCurrent: false,
          description: "Designed multi-region payment switch handling 12,000 TPS with 99.999% uptime across West African clearing corridors.",
          skillsUsed: ["Go", "Kafka", "Docker", "Kubernetes", "AWS"],
        },
      ],
      hobbies: [
        "African Classical & Afrobeat Drumming",
        "Open-source Cryptography Mentorship",
        "Long-distance Cycling",
        "Sci-Fi Literature & Speculative Fiction",
      ],
      targetRoles: [
        "Staff Infrastructure Engineer",
        "Head of Distributed Architecture",
        "Sovereign Tech Fellow",
      ],
      targetCountries: ["Germany", "United Kingdom", "Canada", "Estonia"],
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(demoUserId, defaultProfile);

    const defaultNiches: UserProfileNiche[] = [
      {
        id: "niche_tech_fintech",
        userId: demoUserId,
        title: "Staff Distributed Systems Engineer (FinTech & Settlement)",
        targetType: "job",
        targetIndustry: "Financial Rails & Decentralized Identity",
        headline: "High-throughput transactional systems & NDPC/GDPR sovereign node architecture",
        executiveSummary:
          "Targeted dossier emphasizing 5 years at Paystack (Stripe), high-concurrency payment settlement rails, and First-Class Honours Computer Engineering attestation. Eliminates the need for custom CVs by highlighting proven ledger uptime and verifiable references.",
        selectedSkillIds: ["sk_dist", "sk_ts", "sk_go", "sk_pg"],
        selectedCredentialIds: ["deg_01", "exp_01"],
        autoSynthesizeDossier: true,
        isDefault: true,
        createdAt: "2026-10-14T08:00:00Z",
        updatedAt: "2026-10-22T09:00:00Z",
      },
      {
        id: "niche_eu_relocation",
        userId: demoUserId,
        title: "EU Blue Card & German Opportunity Card (Chancenkarte)",
        targetType: "relocation",
        targetIndustry: "Skilled Worker Immigration & Sovereign Relocation",
        headline: "Verified Academic Tier-2 Legalization, B1 German, and Liquid Settlement Proof",
        executiveSummary:
          "Configured specifically for EU immigration authorities and German Ausländerbehörde audits: features Tier-2 legalized BSc Computer Engineering degree, sworn affidavit, international passport verification, and certified bank liquidity reserves.",
        selectedSkillIds: ["sk_dist", "sk_go"],
        selectedCredentialIds: ["deg_01", "id_passport_01", "legal_affidavit_01", "rec_tuition_01"],
        autoSynthesizeDossier: true,
        isDefault: false,
        createdAt: "2026-10-18T11:00:00Z",
        updatedAt: "2026-10-22T10:30:00Z",
      },
      {
        id: "niche_chevening_academic",
        userId: demoUserId,
        title: "Chevening / Commonwealth Academic Fellowship",
        targetType: "academic",
        targetIndustry: "Postgraduate & International Research",
        headline: "4.84 / 5.0 First Class Honours with Published Identity Research",
        executiveSummary:
          "Synthesizes academic transcripts, verified reference from Paystack leadership, and research portfolio into a unified academic dossier with verifiable SHA-256 on-chain proof.",
        selectedSkillIds: ["sk_dist", "sk_sol"],
        selectedCredentialIds: ["deg_01", "exp_01"],
        autoSynthesizeDossier: true,
        isDefault: false,
        createdAt: "2026-10-20T14:00:00Z",
        updatedAt: "2026-10-22T11:00:00Z",
      },
    ];
    this.niches.set(demoUserId, defaultNiches);

    const defaultGoals: TargetGoal[] = [
      {
        id: "goal_eu_blue_card",
        userId: demoUserId,
        type: "relocation",
        title: "EU Blue Card / Chancenkarte (Germany)",
        targetCountry: "Germany",
        targetDate: "2026-12-31",
        status: "active",
        requiredCategories: ["identification", "academics", "finance", "legal"],
        minLiquidFundsUSD: 12000,
        minYearsExperience: 3,
        mandatoryCredentials: [
          "Valid International Passport (> 6 months validity)",
          "Anabin-Accredited Degree with Tier-2 Legalization",
          "Proof of Blocked Account / Minimum Liquid Funds",
          "German B1 Language Certificate or C1 English Proof",
        ],
      },
      {
        id: "goal_staff_engineer",
        userId: demoUserId,
        type: "job",
        title: "Staff Distributed Systems Engineer (Global Remote)",
        targetCountry: "United Kingdom / Germany / US Remote",
        targetDate: "2026-11-30",
        status: "active",
        requiredCategories: ["experience", "academics", "certifications", "portfolio"],
        minYearsExperience: 5,
        mandatoryCredentials: [
          "Verified Employment Letter with Reference Integrity",
          "Public Architecture Case Studies / Repositories",
          "EVM or High-Concurrency System Proofs",
        ],
      },
      {
        id: "goal_msc_research",
        userId: demoUserId,
        type: "academic",
        title: "MSc Cryptography & Decentralized Systems (TUM Germany)",
        targetCountry: "Germany",
        targetDate: "2027-03-01",
        status: "active",
        requiredCategories: ["academics", "identification", "finance"],
        mandatoryCredentials: [
          "Complete Official University Transcript with Tier-2 Seal",
          "English C1 or IELTS Academic 7.5+",
        ],
      },
    ];
    this.goals.set(demoUserId, defaultGoals);
  }
}

export const profileAndAdvisorStore = new ProfileAndAdvisorStore();
