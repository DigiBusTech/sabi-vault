import {
  UserHumanProfile,
  UserProfileNiche,
  TargetGoal,
  AdvisorGapAlert,
  SovereignAdvisorAudit,
} from "@/types/profile";
import { globalUserStore } from "./user_store";
import { randomBytes } from "crypto";

class ProfileAndAdvisorStore {
  private profiles: Map<string, UserHumanProfile> = new Map();
  private niches: Map<string, UserProfileNiche[]> = new Map();
  private goals: Map<string, TargetGoal[]> = new Map();

  constructor() {
    // Seed default Chinwe Okafor Human Profile
    const defaultProfile: UserHumanProfile = {
      userId: "usr_chinwe_okafor_7721",
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
        {
          id: "lang_en",
          language: "English",
          level: "NATIVE",
          isNative: true,
        },
        {
          id: "lang_de",
          language: "German",
          level: "B1",
          isNative: false,
          verifiedCredentialRef: "Goethe-Zertifikat B1 (In Progress)",
        },
        {
          id: "lang_fr",
          language: "French",
          level: "A2",
          isNative: false,
        },
      ],
      skills: [
        {
          id: "sk_dist",
          name: "Distributed Systems & Consensus",
          category: "Architecture",
          proficiency: "EXPERT",
          yearsOfExperience: 5,
        },
        {
          id: "sk_ts",
          name: "TypeScript & Node.js",
          category: "Software Engineering",
          proficiency: "EXPERT",
          yearsOfExperience: 6,
        },
        {
          id: "sk_go",
          name: "Go (Golang)",
          category: "Backend & Systems",
          proficiency: "ADVANCED",
          yearsOfExperience: 4,
        },
        {
          id: "sk_sol",
          name: "Solidity & EVM Smart Contracts",
          category: "Web3 & Blockchain",
          proficiency: "ADVANCED",
          yearsOfExperience: 3,
        },
        {
          id: "sk_pg",
          name: "PostgreSQL & Database Partitioning",
          category: "Databases",
          proficiency: "ADVANCED",
          yearsOfExperience: 5,
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
    this.profiles.set(defaultProfile.userId, defaultProfile);

    // Seed default Persona Niches
    const defaultNiches: UserProfileNiche[] = [
      {
        id: "niche_tech_fintech",
        userId: "usr_chinwe_okafor_7721",
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
        userId: "usr_chinwe_okafor_7721",
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
        userId: "usr_chinwe_okafor_7721",
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
    this.niches.set("usr_chinwe_okafor_7721", defaultNiches);

    // Seed default Target Goals
    const defaultGoals: TargetGoal[] = [
      {
        id: "goal_eu_blue_card",
        userId: "usr_chinwe_okafor_7721",
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
        userId: "usr_chinwe_okafor_7721",
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
        userId: "usr_chinwe_okafor_7721",
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
    this.goals.set("usr_chinwe_okafor_7721", defaultGoals);
  }

  // --- HUMAN PROFILE CRUD ---
  public getProfile(userId: string = "usr_chinwe_okafor_7721"): UserHumanProfile {
    let profile = this.profiles.get(userId);
    if (!profile) {
      profile = {
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
        hobbies: [],
        targetRoles: [],
        targetCountries: [],
        updatedAt: new Date().toISOString(),
      };
      this.profiles.set(userId, profile);
    }
    return { ...profile };
  }

  public updateProfile(userId: string, updates: Partial<UserHumanProfile>): UserHumanProfile {
    const existing = this.getProfile(userId);
    const updated: UserHumanProfile = {
      ...existing,
      ...updates,
      userId,
      socialLinks: { ...existing.socialLinks, ...(updates.socialLinks || {}) },
      languages: updates.languages || existing.languages,
      skills: updates.skills || existing.skills,
      hobbies: updates.hobbies || existing.hobbies,
      targetRoles: updates.targetRoles || existing.targetRoles,
      targetCountries: updates.targetCountries || existing.targetCountries,
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(userId, updated);
    return updated;
  }

  // --- PERSONA NICHES CRUD ---
  public listNiches(userId: string = "usr_chinwe_okafor_7721"): UserProfileNiche[] {
    return this.niches.get(userId) || [];
  }

  public createOrUpdateNiche(userId: string, niche: Partial<UserProfileNiche>): UserProfileNiche {
    const userNiches = this.listNiches(userId);
    const id = niche.id || `niche_${randomBytes(4).toString("hex")}`;
    const now = new Date().toISOString();

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
      createdAt: niche.createdAt || now,
      updatedAt: now,
    };

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

  public deleteNiche(userId: string, nicheId: string): boolean {
    const userNiches = this.listNiches(userId);
    const filtered = userNiches.filter((n) => n.id !== nicheId);
    this.niches.set(userId, filtered);
    return filtered.length < userNiches.length;
  }

  // --- TARGET GOALS CRUD ---
  public listGoals(userId: string = "usr_chinwe_okafor_7721"): TargetGoal[] {
    return this.goals.get(userId) || [];
  }

  public addOrUpdateGoal(userId: string, goal: Partial<TargetGoal>): TargetGoal {
    const userGoals = this.listGoals(userId);
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

    const index = userGoals.findIndex((g) => g.id === id);
    if (index >= 0) {
      userGoals[index] = record;
    } else {
      userGoals.push(record);
    }

    this.goals.set(userId, userGoals);
    return record;
  }

  public deleteGoal(userId: string, goalId: string): boolean {
    const userGoals = this.listGoals(userId);
    const filtered = userGoals.filter((g) => g.id !== goalId);
    this.goals.set(userId, filtered);
    return filtered.length < userGoals.length;
  }

  // --- DYNAMIC AI SOVEREIGN ADVISOR AUDIT ENGINE ---
  public runAdvisorAudit(userId: string = "usr_chinwe_okafor_7721"): SovereignAdvisorAudit {
    const profile = this.getProfile(userId);
    const userVault = globalUserStore.getVault(userId);
    const activeGoals = this.listGoals(userId).filter((g) => g.status === "active");

    const gapAlerts: AdvisorGapAlert[] = [];
    const strengths: string[] = [];
    const nextMilestones: string[] = [];

    // Audit vault items
    const hasPassport = (userVault.identification?.identifications?.length || 0) > 0;
    const hasDegree = (userVault.academics?.degrees?.length || 0) > 0;
    const hasTier2Degree = userVault.academics?.degrees?.some((d: any) => d.isNotarized || d.tier === 2);
    const hasExperience = (userVault.experience?.experiences?.length || 0) > 0;
    const hasFinance = (userVault.finance?.bankRecords?.length || 0) > 0;
    const hasLegal = (userVault.legal?.instruments?.length || 0) > 0;
    const hasEnglishC1OrNative = profile.languages.some(
      (l) => l.language.toLowerCase().includes("english") && (l.isNative || ["C1", "C2", "NATIVE"].includes(l.level))
    );
    const hasGermanB1OrHigher = profile.languages.some(
      (l) => l.language.toLowerCase().includes("german") && ["B1", "B2", "C1", "C2", "NATIVE"].includes(l.level)
    );

    // Strengths
    if (hasDegree && hasTier2Degree) {
      strengths.push("Tier-2 Notarized University Degree on-chain with authentic institutional attestation.");
    }
    if (hasExperience) {
      strengths.push("Verified senior software engineering tenure at Paystack with email-verified reference.");
    }
    if (hasPassport) {
      strengths.push("Valid International Passport with machine-readable MRZ code verified.");
    }
    if (profile.skills.length >= 4) {
      strengths.push(`Rich technical skills matrix (${profile.skills.length} domains evaluated with Expert mastery).`);
    }

    // Evaluate against each goal
    for (const goal of activeGoals) {
      if (goal.type === "relocation" && goal.targetCountry.toLowerCase().includes("germany")) {
        if (!hasPassport) {
          gapAlerts.push({
            id: `gap_${randomBytes(3).toString("hex")}`,
            goalId: goal.id,
            category: "identification",
            severity: "critical",
            title: "Missing International Passport",
            message: "German Chancenkarte & EU Blue Card require a valid international passport with > 6 months validity.",
            missingCredentialType: "International Passport",
            suggestedAction: "Upload or scan your valid passport under Vault > Identification.",
            isResolved: false,
          });
        }

        if (!hasTier2Degree) {
          gapAlerts.push({
            id: `gap_${randomBytes(3).toString("hex")}`,
            goalId: goal.id,
            category: "academics",
            severity: "critical",
            title: "Degree Lacks Tier-2 Apostille / Notarization",
            message: "German embassy requirements mandate that university transcripts possess Tier-2 legal attestation or Anabin certification.",
            missingCredentialType: "Tier-2 Legalized Transcript",
            suggestedAction: "Request institutional attestation or upload a notarized certificate with notary stamp.",
            isResolved: false,
          });
        }

        if (!hasGermanB1OrHigher) {
          gapAlerts.push({
            id: `gap_${randomBytes(3).toString("hex")}`,
            goalId: goal.id,
            category: "profile_languages",
            severity: "warning",
            title: "German Language Readiness at B1 (Target: B2)",
            message: "Upgrading from B1 to B2 significantly accelerates Chancenkarte points scoring from 3 to 4 points.",
            missingCredentialType: "Goethe / TELC B2 Certificate",
            suggestedAction: "Upload Goethe-Zertifikat B2 exam confirmation to claim maximum points.",
            isResolved: false,
          });
        }
      }

      if (goal.type === "job") {
        if (!hasEnglishC1OrNative) {
          gapAlerts.push({
            id: `gap_${randomBytes(3).toString("hex")}`,
            goalId: goal.id,
            category: "profile_languages",
            severity: "warning",
            title: "Fluent English Proficiency Verification Recommended",
            message: "Global remote engineering positions require verified C1 or Native English proficiency.",
            suggestedAction: "Set English to C1/Native in Human Profile or link IELTS/Duolingo attestation.",
            isResolved: false,
          });
        }

        if ((userVault.experience?.experiences?.length || 0) < 2) {
          gapAlerts.push({
            id: `gap_${randomBytes(3).toString("hex")}`,
            goalId: goal.id,
            category: "experience",
            severity: "recommendation",
            title: "Additional Prior Experience Record Recommended",
            message: "Adding your previous intermediate or startup engineering roles solidifies your 5+ year track record.",
            suggestedAction: "Upload prior offer letter or work contract to strengthen employment tenure.",
            isResolved: false,
          });
        }
      }
    }

    // Milestones
    if (gapAlerts.some((g) => g.severity === "critical")) {
      nextMilestones.push("Resolve critical missing credential blockers (e.g. Passport or Tier-2 Legalization).");
    }
    nextMilestones.push("Generate Scoped API Key for target German consulate / recruiter with tailored Niche profile.");
    nextMilestones.push("Review auto-synthesized Zero-CV dossier in Persona Niche Studio.");

    // Score calculation
    let calculatedScore = 88; // Base healthy score for Chinwe
    const criticalPenalty = gapAlerts.filter((g) => g.severity === "critical").length * 20;
    const warningPenalty = gapAlerts.filter((g) => g.severity === "warning").length * 8;
    calculatedScore = Math.max(20, Math.min(100, calculatedScore - criticalPenalty - warningPenalty));

    return {
      userId,
      overallReadinessScore: calculatedScore,
      activeGoals,
      gapAlerts,
      strengths,
      nextMilestones,
      lastAuditedAt: new Date().toISOString(),
    };
  }
}

export const profileAndAdvisorStore = new ProfileAndAdvisorStore();
