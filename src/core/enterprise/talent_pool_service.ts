import { randomBytes } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { CandidateEvaluationResult, CriteriaProfile } from "./criteria_store";
import { UserHumanProfile } from "@/types/profile";
import { FullUserVault, VerificationTier } from "@/types/vault";
import { globalDiscoveryEngine } from "@/agents/discovery_engine";

export type UniversalSector = "IMMIGRATION" | "EDUCATION" | "LABOUR" | "CUSTOM" | "FINANCE" | "HEALTHCARE" | "LEGAL";

export type UniversalPipelineStage =
  // Immigration Stages
  | "DOSSIER_INGESTED"
  | "ADMISSIBILITY_REVIEW"
  | "FINANCIALS_VERIFIED"
  | "CONSULAR_INTERVIEW"
  | "VISA_GRANTED"
  | "VISA_REFUSED"
  // Education Stages
  | "APPLICATION_LOGGED"
  | "TRANSCRIPT_ATTESTATION"
  | "ACADEMIC_BOARD_REVIEW"
  | "FACULTY_INTERVIEW"
  | "ADMITTED_SCHOLARSHIP"
  | "ADMISSION_DECLINED"
  // Labour Stages
  | "QUERIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "OFFER_EXTENDED"
  | "HIRED"
  | "REJECTED"
  // Universal
  | "ARCHIVED";

export interface EvaluatorNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

export interface VerifiedVaultDocumentSummary {
  id: string;
  name: string;
  category: string;
  tier: 1 | 2; // 1 = Standard Hashed, 2 = Authenticated / Legalized
  sha256Hash: string;
  blockchainTxHash?: string;
  notarySealReference?: string;
  attestedAt?: string;
}

export interface HolisticMatchIndex {
  foundationalIntegrityScore: number; // 0 - 100
  practicalExecutionIndex: number;    // 0 - 100
  learningVelocityIndex: number;      // 0 - 100
  situationalJudgmentScore: number;   // 0 - 100
  overallHmiScore: number;            // 0 - 100
  isHiddenGem: boolean;
  hasPedigreeDivergenceWarning: boolean;
  hiddenGemReason?: string;
  pedigreeWarningReason?: string;
  tailoredInterviewProbes: string[];  // 3 sharp, incisive questions targeting applicant risks
}

export interface QueriedApplicantRecord {
  id: string;
  orgId: string;
  candidateId: string; // vaultId
  keyIdUsed: string;
  fullName: string;
  headline: string;
  avatarUrl?: string;
  residenceCity: string;
  residenceCountry: string;
  nationality: string;
  sector: UniversalSector;
  targetRoleOrRoute: string;
  targetCountries: string[];
  
  // Scoring & Evaluation Outcome
  rubricId: string;
  rubricName: string;
  compositeScore: number; // 0 - 100
  verdict: "QUALIFIED" | "CONDITIONALLY_QUALIFIED" | "REJECTED";
  integrityStatus: "TAMPER_FREE_VERIFIED" | "TAMPER_DETECTED" | "KEY_INVALID" | "VAULT_NOT_FOUND";
  onChainTx: string;
  scoresBreakdown: {
    financeScore?: number;
    academicsScore?: number;
    experienceScore?: number;
    certificationsScore?: number;
    achievementsScore?: number;
    legalScore?: number;
  };
  benchmarkResults?: {
    benchmarkId: string;
    name: string;
    passed: boolean;
    importance: "mandatory" | "preferred" | "optional";
    message: string;
  }[];
  citations: string[];
  anomaliesDetected: string[];

  // Candidate Human Profile Snapshot
  workHistorySummary: {
    company: string;
    title: string;
    employmentType: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }[];
  skills: { name: string; category?: string; proficiency?: string }[];
  languages: { language: string; level: string }[];

  // Cryptographic Vault Documents Ledger (Tier 1 vs Tier 2)
  vaultDocuments: VerifiedVaultDocumentSummary[];
  tier2Deficits: string[];

  // The "Right Applicant" Discovery Matrix
  holisticMatchIndex?: HolisticMatchIndex;

  // CRM Pipeline & Team Interaction
  pipelineStage: UniversalPipelineStage;
  tags: string[];
  evaluatorNotes: EvaluatorNote[];
  assignedTo?: string; // Team member ID
  assignedToName?: string;
  firstQueriedAt: string;
  updatedAt: string;
}

class EnterpriseTalentPoolService {
  private pool: Map<string, QueriedApplicantRecord> = new Map();

  constructor() {
    this.seedInitialApplicants();
  }

  private seedInitialApplicants() {
    const seedId = "applicant_chinwe_okafor_seed";
    this.pool.set(seedId, {
      id: seedId,
      orgId: "org_covenant_gate",
      candidateId: "usr_chinwe_okafor_7721",
      keyIdUsed: "sbk_live_v1_demo",
      fullName: "Chinwe Nkechi Okafor",
      headline: "Senior Distributed Systems & Blockchain Engineer",
      residenceCity: "Lagos",
      residenceCountry: "Nigeria",
      nationality: "Nigerian",
      sector: "IMMIGRATION",
      targetRoleOrRoute: "UK Global Talent Visa / Lead Backend Engineer",
      targetCountries: ["United Kingdom", "Germany", "Canada"],
      rubricId: "rubric_immigration_tech_visa",
      rubricName: "Global Talent Tech Visa (UK / Canada / Australia)",
      compositeScore: 84,
      verdict: "QUALIFIED",
      integrityStatus: "TAMPER_FREE_VERIFIED",
      onChainTx: "0x89f7a21345dc67e89ab0123456789abcdef0123456789abcdef0123456789abcd",
      scoresBreakdown: {
        financeScore: 85,
        academicsScore: 95,
        experienceScore: 90,
        certificationsScore: 80,
      },
      benchmarkResults: [
        {
          benchmarkId: "bm_imm_funds",
          name: "Sovereign Settlement Maintenance Funds",
          passed: true,
          importance: "mandatory",
          message: "Maintenance funds verified (USD 14,200 >= 12,000)",
        },
        {
          benchmarkId: "bm_imm_holding",
          name: "28-Day Consecutive Holding Window",
          passed: true,
          importance: "mandatory",
          message: "Holding window verified (90 days >= 28d)",
        },
        {
          benchmarkId: "bm_imm_tenure",
          name: "Documented Tech Career Tenure",
          passed: true,
          importance: "mandatory",
          message: "Career tenure verified (4 yrs >= 3 yrs)",
        },
        {
          benchmarkId: "bm_imm_tier2",
          name: "Institutional Attestation (Tier-2 Notarized)",
          passed: true,
          importance: "mandatory",
          message: "Tier-2 Institutional Notary Seal verified on-chain",
        },
      ],
      citations: [
        "✓ Attested Academic Degree: University of Lagos (BSc in Computer Engineering), GPA: 4.84/5 [Tier 2 Notarized]",
        "Finance: Zenith Bank PLC liquid balance NGN 8,750,000 (~$5,469 USD)",
        "✓ Attested Work Experience: Senior Systems Engineer at Paystack (Stripe) (4 verified years, current: true)",
        "Candidate Profile Technical Matrix: Distributed Systems, TypeScript & Node.js, Go, Solidity (5 skills indexed)",
        "Language Competencies: English [NATIVE], German [B1], French [A2]",
      ],
      anomaliesDetected: [],
      workHistorySummary: [
        {
          company: "Paystack (Stripe)",
          title: "Senior Systems Engineer",
          employmentType: "Full-time",
          startDate: "2022-03",
          isCurrent: true,
          description: "Engineered high-throughput payment settlement microservices handling 25,000 TPS with 99.99% uptime.",
        },
        {
          company: "Kuda Microfinance Bank",
          title: "Backend Engineer",
          employmentType: "Full-time",
          startDate: "2020-01",
          endDate: "2022-02",
          isCurrent: false,
          description: "Core banking integration and transaction reconciliation pipelines in Go and Node.js.",
        },
      ],
      skills: [
        { name: "Distributed Systems & Consensus", category: "Backend", proficiency: "EXPERT" },
        { name: "TypeScript & Node.js", category: "Fullstack", proficiency: "EXPERT" },
        { name: "Go (Golang)", category: "Backend", proficiency: "ADVANCED" },
        { name: "Solidity & EVM Smart Contracts", category: "Blockchain", proficiency: "ADVANCED" },
        { name: "PostgreSQL & Redis", category: "Database", proficiency: "EXPERT" },
      ],
      languages: [
        { language: "English", level: "NATIVE" },
        { language: "German", level: "B1" },
        { language: "French", level: "A2" },
      ],
      vaultDocuments: [
        {
          id: "doc_degree_01",
          name: "University of Lagos BSc Degree Certificate",
          category: "academics",
          tier: 2,
          sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          blockchainTxHash: "0x89f7a21345dc67e89ab0123456789abcdef0123456789abcdef0123456789abcd",
          notarySealReference: "NOTARY-NG-LAG-2026-9921",
          attestedAt: "2026-08-14T10:00:00Z",
        },
        {
          id: "doc_passport_01",
          name: "Nigerian International Passport (MRZ Verified)",
          category: "identification",
          tier: 2,
          sha256Hash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
          blockchainTxHash: "0x12a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3",
          notarySealReference: "IMM-NG-PASSPORT-2026-004",
          attestedAt: "2026-07-20T14:30:00Z",
        },
        {
          id: "doc_bank_01",
          name: "Zenith Bank 6-Month Official Statement",
          category: "finance",
          tier: 1,
          sha256Hash: "60303ae22b998861bce3b28f33eec1be758a213c86c93c076dbe9f508c36cb05",
          blockchainTxHash: "0x45f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
          attestedAt: "2026-09-01T08:00:00Z",
        },
      ],
      tier2Deficits: [],
      holisticMatchIndex: {
        foundationalIntegrityScore: 98,
        practicalExecutionIndex: 92,
        learningVelocityIndex: 88,
        situationalJudgmentScore: 90,
        overallHmiScore: 92,
        isHiddenGem: true,
        hasPedigreeDivergenceWarning: false,
        hiddenGemReason: "High practical systems engineering velocity and verified Tier-2 credentials outperforming standard market benchmarks.",
        tailoredInterviewProbes: [
          "How did you isolate latency bottlenecks in the Paystack settlement microservice during peak volume surges?",
          "Given the UK Tech Talent criteria, how do you substantiate your outside-work leadership or open-source community contributions?",
          "Explain the transaction cadence between your primary checking account and liquid foreign currency holdings.",
        ],
      },
      pipelineStage: "SHORTLISTED",
      tags: ["High Velocity", "Tier-2 Notarized", "UK Ready", "Distributed Systems"],
      evaluatorNotes: [
        {
          id: "note_01",
          authorId: "user_lead_evaluator",
          authorName: "Sarah Jenkins (Lead Consular Evaluator)",
          authorRole: "ORG_ADMIN",
          text: "Applicant has outstanding Tier-2 verified credentials, 4 years proven fintech systems experience, and unblemished on-chain cryptographic proof.",
          createdAt: "2026-10-25T11:00:00Z",
        },
      ],
      firstQueriedAt: "2026-10-25T10:30:00Z",
      updatedAt: "2026-10-25T11:00:00Z",
    });
  }

  /**
   * Automatically captures an evaluated candidate into the organization's Talent Pool CRM.
   */
  public async captureEvaluatedApplicant(params: {
    orgId: string;
    keyId: string;
    rubric: CriteriaProfile;
    evalResult: CandidateEvaluationResult;
    candidateProfile: UserHumanProfile;
    vault: FullUserVault;
  }): Promise<QueriedApplicantRecord> {
    const { orgId, keyId, rubric, evalResult, candidateProfile, vault } = params;
    const candidateId = evalResult.candidateId;

    // Detect sector from rubric category
    let sector: UniversalSector = "LABOUR";
    if (rubric.category === "IMMIGRATION") sector = "IMMIGRATION";
    else if (rubric.category === "EDUCATION") sector = "EDUCATION";
    else if (rubric.category === "FINANCE") sector = "FINANCE";
    else if (rubric.category === "HEALTHCARE") sector = "HEALTHCARE";
    else if (rubric.category === "LEGAL") sector = "LEGAL";

    // Set initial pipeline stage matching sector
    let defaultStage: UniversalPipelineStage = "QUERIED";
    if (sector === "IMMIGRATION") defaultStage = "DOSSIER_INGESTED";
    else if (sector === "EDUCATION") defaultStage = "APPLICATION_LOGGED";

    if (evalResult.verdict === "QUALIFIED") {
      defaultStage = sector === "IMMIGRATION" ? "ADMISSIBILITY_REVIEW" : sector === "EDUCATION" ? "ACADEMIC_BOARD_REVIEW" : "SHORTLISTED";
    }

    // Extract verified vault documents with Tier 1 vs Tier 2
    const vaultDocuments: VerifiedVaultDocumentSummary[] = [];
    const tier2Deficits: string[] = [];

    // Check academics
    if (vault.academics?.degrees) {
      for (const deg of vault.academics.degrees) {
        const isTier2 = deg.tier === VerificationTier.TIER_2_AUTHENTICATED_LEGALIZED || deg.isNotarized;
        vaultDocuments.push({
          id: deg.id || `doc_acad_${Date.now()}`,
          name: `${deg.institution} - ${deg.degreeType} in ${deg.fieldOfStudy}`,
          category: "academics",
          tier: isTier2 ? 2 : 1,
          sha256Hash: deg.hashRef || "0x0000000000000000000000000000000000000000000000000000000000000000",
          blockchainTxHash: evalResult.onChainTx,
          attestedAt: new Date().toISOString(),
        });
        if (!isTier2 && rubric.mandatoryTier2Notarization) {
          tier2Deficits.push(`Degree "${deg.degreeType} in ${deg.fieldOfStudy}" is Tier-1 standard hashed, but criteria requires Tier-2 Institutional Attestation / Hague Apostille.`);
        }
      }
    }

    // Check identifications
    if (vault.identification?.identifications) {
      for (const idDoc of vault.identification.identifications) {
        vaultDocuments.push({
          id: idDoc.id || `doc_id_${Date.now()}`,
          name: `${idDoc.documentType.replace(/_/g, " ").toUpperCase()}`,
          category: "identification",
          tier: 2,
          sha256Hash: idDoc.hashRef || "0x0000000000000000000000000000000000000000000000000000000000000000",
          blockchainTxHash: evalResult.onChainTx,
          attestedAt: new Date().toISOString(),
        });
      }
    }

    // Check finance
    if (vault.finance?.bankRecords) {
      for (const bank of vault.finance.bankRecords) {
        vaultDocuments.push({
          id: `doc_fin_${Date.now()}`,
          name: `${bank.institutionName} (${bank.currency} Account Statement)`,
          category: "finance",
          tier: 1,
          sha256Hash: bank.hashRef || "0x0000000000000000000000000000000000000000000000000000000000000000",
          blockchainTxHash: evalResult.onChainTx,
          attestedAt: bank.verifiedAt || new Date().toISOString(),
        });
      }
    }

    // Check work experience
    if (vault.experience?.experiences) {
      for (const exp of vault.experience.experiences) {
        vaultDocuments.push({
          id: exp.id || `doc_exp_${Date.now()}`,
          name: `${exp.jobTitle} at ${exp.company} (Verified Contract / Letter)`,
          category: "experience",
          tier: exp.verifiedReference ? 2 : 1,
          sha256Hash: exp.hashRef || "0x0000000000000000000000000000000000000000000000000000000000000000",
          blockchainTxHash: evalResult.onChainTx,
          attestedAt: new Date().toISOString(),
        });
      }
    }

    // Compute Holistic Match Index (HMI) using Discovery Engine
    const discoveryResult = globalDiscoveryEngine.evaluateApplicant({
      evalResult,
      profile: candidateProfile,
      vault,
      rubric,
    });

    const applicantRecord: QueriedApplicantRecord = {
      id: `app_${candidateId}_${randomBytes(3).toString("hex")}`,
      orgId: orgId || "org_covenant_gate",
      candidateId,
      keyIdUsed: keyId,
      fullName: candidateProfile.fullName || "Candidate",
      headline: candidateProfile.headline || `${rubric.name} Applicant`,
      avatarUrl: candidateProfile.avatarUrl,
      residenceCity: candidateProfile.residenceCity || "Lagos",
      residenceCountry: candidateProfile.residenceCountry || "Nigeria",
      nationality: candidateProfile.nationality || "Nigerian",
      sector,
      targetRoleOrRoute: candidateProfile.targetRoles?.[0] || rubric.name,
      targetCountries: candidateProfile.targetCountries || ["United Kingdom"],
      rubricId: rubric.id,
      rubricName: rubric.name,
      compositeScore: evalResult.compositeScore,
      verdict: evalResult.verdict,
      integrityStatus: evalResult.integrityStatus,
      onChainTx: evalResult.onChainTx,
      scoresBreakdown: evalResult.scoresBreakdown || {},
      benchmarkResults: evalResult.benchmarkResults || [],
      citations: evalResult.citations || [],
      anomaliesDetected: evalResult.anomaliesDetected || [],
      workHistorySummary: (candidateProfile.workExperiences || []).map((w) => ({
        company: w.company,
        title: w.title,
        employmentType: w.employmentType || "Full-time",
        startDate: w.startDate,
        endDate: w.endDate,
        isCurrent: w.isCurrent,
        description: w.description,
      })),
      skills: (candidateProfile.skills || []).map((s) => ({
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
      })),
      languages: (candidateProfile.languages || []).map((l) => ({
        language: l.language,
        level: l.level,
      })),
      vaultDocuments,
      tier2Deficits,
      holisticMatchIndex: discoveryResult.hmi,
      pipelineStage: defaultStage,
      tags: [sector, evalResult.verdict, ...(discoveryResult.hmi.isHiddenGem ? ["Hidden Gem"] : [])],
      evaluatorNotes: [],
      firstQueriedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in memory Map
    this.pool.set(applicantRecord.id, applicantRecord);

    // Persist to regional Supabase node asynchronously
    try {
      const admin = createAdminSupabaseClient();
      await admin.from("enterprise_talent_pool").upsert(
        {
          id: applicantRecord.id,
          org_id: applicantRecord.orgId,
          candidate_id: applicantRecord.candidateId,
          key_id_used: applicantRecord.keyIdUsed,
          full_name: applicantRecord.fullName,
          headline: applicantRecord.headline,
          avatar_url: applicantRecord.avatarUrl,
          residence_city: applicantRecord.residenceCity,
          residence_country: applicantRecord.residenceCountry,
          nationality: applicantRecord.nationality,
          sector: applicantRecord.sector,
          target_role_or_route: applicantRecord.targetRoleOrRoute,
          target_countries: applicantRecord.targetCountries,
          rubric_id: applicantRecord.rubricId,
          rubric_name: applicantRecord.rubricName,
          composite_score: applicantRecord.compositeScore,
          verdict: applicantRecord.verdict,
          integrity_status: applicantRecord.integrityStatus,
          on_chain_tx: applicantRecord.onChainTx,
          scores_breakdown: applicantRecord.scoresBreakdown,
          benchmark_results: applicantRecord.benchmarkResults,
          citations: applicantRecord.citations,
          anomalies_detected: applicantRecord.anomaliesDetected,
          work_history_summary: applicantRecord.workHistorySummary,
          skills: applicantRecord.skills,
          languages: applicantRecord.languages,
          vault_documents: applicantRecord.vaultDocuments,
          tier2_deficits: applicantRecord.tier2Deficits,
          holistic_match_index: applicantRecord.holisticMatchIndex,
          pipeline_stage: applicantRecord.pipelineStage,
          tags: applicantRecord.tags,
          evaluator_notes: applicantRecord.evaluatorNotes,
          first_queried_at: applicantRecord.firstQueriedAt,
          updated_at: applicantRecord.updatedAt,
        },
        { onConflict: "id" }
      );
    } catch (err: any) {
      console.warn("[TalentPoolService] DB persistence notice:", err.message);
    }

    return applicantRecord;
  }

  public listApplicants(orgId: string, filter?: {
    search?: string;
    sector?: UniversalSector;
    stage?: UniversalPipelineStage;
    verdict?: string;
    minScore?: number;
  }): QueriedApplicantRecord[] {
    let list: QueriedApplicantRecord[] = Array.from(this.pool.values()).filter(
      (a) => a.orgId === orgId || orgId === "org_all" || a.orgId === "org_covenant_gate"
    );

    if (filter) {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(
          (a) =>
            a.fullName.toLowerCase().includes(q) ||
            a.headline.toLowerCase().includes(q) ||
            a.targetRoleOrRoute.toLowerCase().includes(q) ||
            a.residenceCountry.toLowerCase().includes(q) ||
            a.skills.some((s) => s.name.toLowerCase().includes(q))
        );
      }
      if (filter.sector) {
        list = list.filter((a) => a.sector === filter.sector);
      }
      if (filter.stage) {
        list = list.filter((a) => a.pipelineStage === filter.stage);
      }
      if (filter.verdict) {
        list = list.filter((a) => a.verdict === filter.verdict);
      }
      if (filter.minScore !== undefined) {
        list = list.filter((a) => a.compositeScore >= filter.minScore!);
      }
    }

    // Sort by last updated descending
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return list;
  }

  public getApplicant(id: string): QueriedApplicantRecord | undefined {
    return this.pool.get(id);
  }

  public async updateStage(id: string, stage: UniversalPipelineStage): Promise<boolean> {
    const applicant = this.pool.get(id);
    if (!applicant) return false;
    applicant.pipelineStage = stage;
    applicant.updatedAt = new Date().toISOString();
    this.pool.set(id, applicant);

    try {
      const admin = createAdminSupabaseClient();
      await admin
        .from("enterprise_talent_pool")
        .update({ pipeline_stage: stage, updated_at: applicant.updatedAt })
        .eq("id", id);
    } catch (err: any) {
      console.warn("[TalentPoolService] updateStage DB notice:", err.message);
    }
    return true;
  }

  public async addNote(id: string, note: Omit<EvaluatorNote, "id" | "createdAt">): Promise<EvaluatorNote | null> {
    const applicant = this.pool.get(id);
    if (!applicant) return null;

    const fullNote: EvaluatorNote = {
      ...note,
      id: `note_${randomBytes(4).toString("hex")}`,
      createdAt: new Date().toISOString(),
    };
    applicant.evaluatorNotes.unshift(fullNote);
    applicant.updatedAt = new Date().toISOString();
    this.pool.set(id, applicant);

    try {
      const admin = createAdminSupabaseClient();
      await admin
        .from("enterprise_talent_pool")
        .update({ evaluator_notes: applicant.evaluatorNotes, updated_at: applicant.updatedAt })
        .eq("id", id);
    } catch (err: any) {
      console.warn("[TalentPoolService] addNote DB notice:", err.message);
    }
    return fullNote;
  }

  public async updateTags(id: string, tags: string[]): Promise<boolean> {
    const applicant = this.pool.get(id);
    if (!applicant) return false;
    applicant.tags = tags;
    applicant.updatedAt = new Date().toISOString();
    this.pool.set(id, applicant);

    try {
      const admin = createAdminSupabaseClient();
      await admin
        .from("enterprise_talent_pool")
        .update({ tags, updated_at: applicant.updatedAt })
        .eq("id", id);
    } catch (err: any) {
      console.warn("[TalentPoolService] updateTags DB notice:", err.message);
    }
    return true;
  }
}

export const globalTalentPoolService = new EnterpriseTalentPoolService();
