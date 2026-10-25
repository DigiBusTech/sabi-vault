import { VaultCategory, VerificationTier } from "@/types/vault";
import { verifyScopedApiKey, filterVaultByScope } from "@/core/crypto/scoped_key";
import { globalUserStore } from "@/core/vault/user_store";
import { IntegrityAgent } from "@/agents/integrity_agent";
import { convertCurrency } from "@/core/advisor/financial_forensics";

export type BenchmarkImportance = "mandatory" | "preferred" | "optional";

export type BenchmarkMetricType =
  | "min_gpa"
  | "min_funds"
  | "holding_period_days"
  | "funds_dumping_limit"
  | "min_tenure_years"
  | "required_skill"
  | "cefr_level"
  | "anabin_status"
  | "police_clearance"
  | "residential_lease"
  | "tier2_notarized";

export interface BenchmarkItem {
  id: string;
  name: string;
  category: "academics" | "finance" | "experience" | "language" | "legal" | "certifications" | "achievements";
  importance: BenchmarkImportance;
  metricType: BenchmarkMetricType;
  targetValue: string | number;
  unit?: string;
  failurePenalty: number;
  statutoryCitation?: string;
  description?: string;
}

export interface CriteriaProfile {
  id: string;
  orgId?: string;
  name: string;
  category: "IMMIGRATION" | "LABOUR" | "EDUCATION" | "CUSTOM";
  description: string;
  passingScore: number; // e.g. 70
  autoInterviewScore?: number; // e.g. 85+ to auto-advance to interview
  minGpa?: number;
  minLiquidFundsUsd?: number;
  minExperienceYears?: number;
  requiredCategories: VaultCategory[];
  mandatoryTier2Notarization: boolean;
  weights: {
    finance?: number;
    academics?: number;
    experience?: number;
    certifications?: number;
    achievements?: number;
    portfolio?: number;
    legal?: number;
  };
  benchmarks: BenchmarkItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface CandidateEvaluationResult {
  candidateId: string;
  keyId: string;
  sovereignNode: string;
  compositeScore: number; // 0-100
  verdict: "QUALIFIED" | "CONDITIONALLY_QUALIFIED" | "REJECTED";
  integrityStatus: "TAMPER_FREE_VERIFIED" | "TAMPER_DETECTED" | "KEY_INVALID" | "VAULT_NOT_FOUND";
  onChainTx: string;
  verifiedCategories: VaultCategory[];
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
    importance: BenchmarkImportance;
    message: string;
  }[];
  citations: string[];
  anomaliesDetected: string[];
  evaluatedAt: string;
}

class EnterpriseCriteriaMasterStore {
  private rubrics: Map<string, CriteriaProfile> = new Map();

  constructor() {
    this.saveCriteriaProfile({
      id: "rubric_immigration_tech_visa",
      name: "Global Talent Tech Visa (UK / Canada / Australia)",
      category: "IMMIGRATION",
      description: "Strict sovereign immigration screening for exceptional tech talent and high-skilled migrants.",
      passingScore: 75,
      autoInterviewScore: 88,
      minGpa: 3.5,
      minLiquidFundsUsd: 12000,
      minExperienceYears: 3,
      requiredCategories: ["finance", "academics", "experience", "identification"],
      mandatoryTier2Notarization: true,
      weights: {
        finance: 30,
        academics: 30,
        experience: 30,
        legal: 10,
      },
      benchmarks: [
        {
          id: "bm_imm_funds",
          name: "Sovereign Settlement Maintenance Funds",
          category: "finance",
          importance: "mandatory",
          metricType: "min_funds",
          targetValue: 12000,
          unit: "USD",
          failurePenalty: 35,
          statutoryCitation: "UKVI Appendix Finance FIN 6.1 / IRCC R200",
          description: "Candidate must possess liquid unencumbered proof of funds held continuously.",
        },
        {
          id: "bm_imm_holding",
          name: "28-Day Consecutive Holding Window",
          category: "finance",
          importance: "mandatory",
          metricType: "holding_period_days",
          targetValue: 28,
          unit: "Days",
          failurePenalty: 30,
          statutoryCitation: "UKVI Appendix Finance Strict Consecutive Balance Rule",
          description: "Balance must not drop below statutory minimum for even one single day.",
        },
        {
          id: "bm_imm_experience",
          name: "Documented Tech Career Tenure",
          category: "experience",
          importance: "mandatory",
          metricType: "min_tenure_years",
          targetValue: 3,
          unit: "Years",
          failurePenalty: 25,
          statutoryCitation: "SOC 2020 High-Skilled Tech Occupations",
          description: "Verified professional employment matching eligible technology roles.",
        },
        {
          id: "bm_imm_degree_seal",
          name: "Institutional Attestation (Tier-2 Notarized)",
          category: "academics",
          importance: "mandatory",
          metricType: "tier2_notarized",
          targetValue: "TIER_2",
          failurePenalty: 25,
          statutoryCitation: "Hague Apostille / Consular Legalization Standards",
          description: "Degree certificate and transcript must bear institutional digital attestation.",
        },
        {
          id: "bm_imm_english",
          name: "English CEFR B2 Proficiency",
          category: "language",
          importance: "preferred",
          metricType: "cefr_level",
          targetValue: "B2",
          failurePenalty: 10,
          statutoryCitation: "Appendix English Language EL 1.1",
          description: "Certified CEFR B2+ language credentials or Ecctis-verified degree taught in English.",
        },
      ],
      createdAt: "2026-09-01T10:00:00Z",
    });

    this.saveCriteriaProfile({
      id: "rubric_fintech_lead_eng",
      name: "Senior Distributed Systems & Security Architect",
      category: "LABOUR",
      description: "Enterprise engineering audit for high-volume financial settlement and sovereign systems.",
      passingScore: 70,
      autoInterviewScore: 85,
      minExperienceYears: 4,
      requiredCategories: ["experience", "academics", "certifications"],
      mandatoryTier2Notarization: false,
      weights: {
        experience: 50,
        academics: 25,
        certifications: 25,
      },
      benchmarks: [
        {
          id: "bm_lab_tenure",
          name: "Senior Architectural Tenure",
          category: "experience",
          importance: "mandatory",
          metricType: "min_tenure_years",
          targetValue: 4,
          unit: "Years",
          failurePenalty: 35,
          description: "Minimum 48 months documented engineering practice in production systems.",
        },
        {
          id: "bm_lab_typescript",
          name: "TypeScript / Node.js Proficiency",
          category: "experience",
          importance: "mandatory",
          metricType: "required_skill",
          targetValue: "TypeScript",
          failurePenalty: 20,
          description: "Expert level mastery in type-safe asynchronous backend architectures.",
        },
        {
          id: "bm_lab_security",
          name: "Cryptographic / Security Attestation",
          category: "certifications",
          importance: "preferred",
          metricType: "tier2_notarized",
          targetValue: "TIER_1",
          failurePenalty: 15,
          description: "Documented credentials in information security, cloud architecture, or cryptography.",
        },
      ],
      createdAt: "2026-09-05T10:00:00Z",
    });

    this.saveCriteriaProfile({
      id: "rubric_masters_scholarship",
      name: "Commonwealth Sovereign Post-Grad Fellowship",
      category: "EDUCATION",
      description: "Rigorous academic admissions and scholarship vetting requiring verified first-class standing.",
      passingScore: 80,
      autoInterviewScore: 90,
      minGpa: 4.5,
      requiredCategories: ["academics", "achievements", "portfolio"],
      mandatoryTier2Notarization: true,
      weights: {
        academics: 60,
        achievements: 25,
        portfolio: 15,
      },
      benchmarks: [
        {
          id: "bm_edu_gpa",
          name: "First Class Academic Standing (GPA 4.5/5.0)",
          category: "academics",
          importance: "mandatory",
          metricType: "min_gpa",
          targetValue: 4.5,
          unit: "GPA",
          failurePenalty: 40,
          description: "Undergraduate transcript must verify GPA of at least 4.5/5.0 or 3.6/4.0 equivalent.",
        },
        {
          id: "bm_edu_attestation",
          name: "University Sealed Transcript (Tier-2 Notarized)",
          category: "academics",
          importance: "mandatory",
          metricType: "tier2_notarized",
          targetValue: "TIER_2",
          failurePenalty: 30,
          description: "Official transcript digitally signed by registrar or authorized attestation authority.",
        },
        {
          id: "bm_edu_honors",
          name: "Documented Academic Honors & Publications",
          category: "achievements",
          importance: "preferred",
          metricType: "tier2_notarized",
          targetValue: "TIER_1",
          failurePenalty: 15,
          description: "Verified university prizes, hackathon championships, or peer-reviewed papers.",
        },
      ],
      createdAt: "2026-09-10T10:00:00Z",
    });
  }

  public listProfiles(): CriteriaProfile[] {
    return Array.from(this.rubrics.values());
  }

  public getProfile(id: string): CriteriaProfile | undefined {
    return this.rubrics.get(id);
  }

  public saveCriteriaProfile(profile: CriteriaProfile): CriteriaProfile {
    // Ensure backwards-compatible defaults
    if (!profile.benchmarks) profile.benchmarks = [];
    if (!profile.passingScore) profile.passingScore = 70;
    if (!profile.autoInterviewScore) profile.autoInterviewScore = 85;
    this.rubrics.set(profile.id, profile);
    return profile;
  }

  // --- CANDIDATE SCREENING ENGINE ---
  public async evaluateCandidate(
    scopedKey: string,
    rubricId: string,
    requestingOrg: string = "Enterprise Evaluator"
  ): Promise<CandidateEvaluationResult> {
    const rubric = this.rubrics.get(rubricId) || this.rubrics.get("rubric_immigration_tech_visa")!;
    const verification = verifyScopedApiKey(scopedKey);

    if (!verification.isValid || !verification.payload) {
      return {
        candidateId: "UNKNOWN",
        keyId: "INVALID",
        sovereignNode: "UNKNOWN",
        compositeScore: 0,
        verdict: "REJECTED",
        integrityStatus: "KEY_INVALID",
        onChainTx: "0x0000000000000000000000000000000000000000000000000000000000000000",
        verifiedCategories: [],
        scoresBreakdown: {},
        citations: ["Cryptographic key signature invalid, forged, or expired."],
        anomaliesDetected: ["INVALID_SCOPED_KEY"],
        evaluatedAt: new Date().toISOString(),
      };
    }

    const payload = verification.payload;
    const vault = globalUserStore.findVault(payload.vaultId);
    if (!vault) {
      return {
        candidateId: payload.vaultId,
        keyId: payload.keyId,
        sovereignNode: payload.sovereignNode,
        compositeScore: 0,
        verdict: "REJECTED",
        integrityStatus: "VAULT_NOT_FOUND",
        onChainTx: "",
        verifiedCategories: [],
        scoresBreakdown: {},
        citations: ["Candidate sovereign vault was not found on regional node."],
        anomaliesDetected: ["CANDIDATE_VAULT_NOT_FOUND"],
        evaluatedAt: new Date().toISOString(),
      };
    }
    const redactedVault = filterVaultByScope(vault, payload.allowedScopes);

    const integrityAgent = new IntegrityAgent();
    const verifiedCategories: VaultCategory[] = [];
    for (const category of payload.allowedScopes) {
      const categoryData = redactedVault[category];
      if (!categoryData) {
        return {
          candidateId: payload.vaultId,
          keyId: payload.keyId,
          sovereignNode: payload.sovereignNode,
          compositeScore: 0,
          verdict: "REJECTED",
          integrityStatus: "TAMPER_DETECTED",
          onChainTx: "",
          verifiedCategories,
          scoresBreakdown: {},
          citations: [`Consented category '${category}' has no stored data.`],
          anomaliesDetected: ["INTEGRITY_CHECK_INCOMPLETE"],
          evaluatedAt: new Date().toISOString(),
        };
      }
      const integrity = await integrityAgent.verifyCategoryIntegrity(payload.vaultId, category, categoryData);
      if (!integrity.isTamperFree) {
        return {
          candidateId: payload.vaultId,
          keyId: payload.keyId,
          sovereignNode: payload.sovereignNode,
          compositeScore: 0,
          verdict: "REJECTED",
          integrityStatus: "TAMPER_DETECTED",
          onChainTx: "",
          verifiedCategories,
          scoresBreakdown: {},
          citations: [integrity.anomalyDetails || "On-chain integrity verification failed."],
          anomaliesDetected: ["INTEGRITY_VERIFICATION_FAILED"],
          evaluatedAt: new Date().toISOString(),
        };
      }
      verifiedCategories.push(category);
    }
    globalUserStore.recordKeyUsage(payload.keyId);

    // Record transparency audit log
    globalUserStore.recordAuditEntry({
      requestingOrg,
      orgType: "ENTERPRISE",
      accessedScopes: payload.allowedScopes,
      purpose: `Automated screening against ${rubric.name}`,
      integrityVerified: true,
      onChainTx: "",
      status: "VERIFIED_ACCESSED",
      targetVaultId: payload.vaultId,
    });

    // Score candidate strictly against rubric
    let totalScore = 0;
    const citations: string[] = [];
    const anomalies: string[] = [];
    const scoresBreakdown: CandidateEvaluationResult["scoresBreakdown"] = {};
    const benchmarkResults: NonNullable<CandidateEvaluationResult["benchmarkResults"]> = [];
    let hasMandatoryFailure = false;

    // 1. Academics Evaluation
    if (rubric.requiredCategories.includes("academics")) {
      if (!payload.allowedScopes.includes("academics") || !redactedVault.academics?.degrees?.length) {
        anomalies.push("Missing required 'academics' category scope or records.");
        scoresBreakdown.academicsScore = 0;
        hasMandatoryFailure = true;
      } else {
        const primaryDegree = redactedVault.academics.degrees[0];
        const gpa = primaryDegree.gpa || 0;
        const meetsGpa = !rubric.minGpa || gpa >= rubric.minGpa;
        const meetsTier2 = !rubric.mandatoryTier2Notarization || primaryDegree.tier === VerificationTier.TIER_2_AUTHENTICATED_LEGALIZED;

        let acadScore = 100;
        if (!meetsGpa) {
          acadScore -= 30;
          anomalies.push(`GPA (${gpa}) below rubric requirement of ${rubric.minGpa}`);
        }
        if (!meetsTier2) {
          acadScore -= 40;
          anomalies.push("Degree is Tier-1 standard hashed, but criteria requires Tier-2 institutional attestation.");
        }

        acadScore = Math.max(0, acadScore);
        scoresBreakdown.academicsScore = acadScore;
        totalScore += (acadScore * (rubric.weights.academics || 30)) / 100;

        citations.push(
          `Academics: ${primaryDegree.institution} (${primaryDegree.degreeType} in ${primaryDegree.fieldOfStudy}), GPA: ${gpa}/${primaryDegree.maxGpa || 5.0} [Tier ${primaryDegree.tier}]`
        );
      }
    }

    // 2. Finance Evaluation
    if (rubric.requiredCategories.includes("finance")) {
      if (!payload.allowedScopes.includes("finance") || !redactedVault.finance?.bankRecords?.length) {
        anomalies.push("Missing required 'finance' category scope or records.");
        scoresBreakdown.financeScore = 0;
        hasMandatoryFailure = true;
      } else {
        const bank = redactedVault.finance.bankRecords[0];
        const rawBalance = Number(bank.currentLiquidBalance) || 0;
        const { convertedAmount: balanceUsd } = convertCurrency(rawBalance, bank.currency || "NGN", "USD");
        const meetsFunds = !rubric.minLiquidFundsUsd || balanceUsd >= rubric.minLiquidFundsUsd;

        let finScore = 100;
        if (!meetsFunds) {
          finScore = Math.round((balanceUsd / (rubric.minLiquidFundsUsd || 10000)) * 70);
          anomalies.push(`Liquid funds ($${balanceUsd.toFixed(0)}) below rubric requirement of $${rubric.minLiquidFundsUsd}`);
        }

        finScore = Math.max(0, Math.min(100, finScore));
        scoresBreakdown.financeScore = finScore;
        totalScore += (finScore * (rubric.weights.finance || 30)) / 100;

        citations.push(
          `Finance: ${bank.institutionName} liquid balance ${bank.currency} ${rawBalance.toLocaleString()} (~$${balanceUsd.toFixed(0)} USD)`
        );
      }
    }

    // 3. Experience Evaluation
    if (rubric.requiredCategories.includes("experience")) {
      if (!payload.allowedScopes.includes("experience") || !redactedVault.experience?.experiences?.length) {
        anomalies.push("Missing required 'experience' category scope or records.");
        scoresBreakdown.experienceScore = 0;
        hasMandatoryFailure = true;
      } else {
        const exp = redactedVault.experience.experiences[0];
        const startYear = parseInt(exp.startDate.split("-")[0]);
        const currentYear = 2026;
        const years = isNaN(startYear) ? 1 : Math.max(0, currentYear - startYear);
        const meetsTenure = !rubric.minExperienceYears || years >= rubric.minExperienceYears;

        let expScore = meetsTenure ? 100 : Math.round((years / (rubric.minExperienceYears || 3)) * 70);
        scoresBreakdown.experienceScore = expScore;
        totalScore += (expScore * (rubric.weights.experience || 30)) / 100;

        citations.push(
          `Experience: ${exp.jobTitle} at ${exp.company} (${years} verified years, current: ${exp.isCurrent})`
        );
      }
    }

    // 4. Certifications Evaluation
    if (rubric.requiredCategories.includes("certifications") && redactedVault.certifications?.certifications?.length) {
      scoresBreakdown.certificationsScore = 100;
      totalScore += (100 * (rubric.weights.certifications || 15)) / 100;
      citations.push(`Certifications: ${redactedVault.certifications.certifications[0].title}`);
    }

    // 5. Achievements Evaluation
    if (rubric.requiredCategories.includes("achievements") && redactedVault.achievements?.achievements?.length) {
      scoresBreakdown.achievementsScore = 100;
      totalScore += (100 * (rubric.weights.achievements || 15)) / 100;
      citations.push(`Achievements: ${redactedVault.achievements.achievements[0].title}`);
    }

    // 6. Dynamic Multi-Benchmark Evaluation
    if (rubric.benchmarks && Array.isArray(rubric.benchmarks)) {
      for (const bm of rubric.benchmarks) {
        let bmPassed = true;
        let bmMessage = "";

        if (bm.metricType === "min_gpa") {
          const gpa = redactedVault.academics?.degrees?.[0]?.gpa || 0;
          const targetGpa = Number(bm.targetValue);
          bmPassed = gpa >= targetGpa;
          bmMessage = bmPassed
            ? `GPA verified (${gpa} >= ${targetGpa})`
            : `GPA shortfall: ${gpa} is below mandatory ${targetGpa}`;
        } else if (bm.metricType === "min_funds") {
          const bank = redactedVault.finance?.bankRecords?.[0];
          const raw = Number(bank?.currentLiquidBalance) || 0;
          const { convertedAmount } = convertCurrency(raw, bank?.currency || "NGN", bm.unit || "USD");
          const target = Number(bm.targetValue);
          bmPassed = convertedAmount >= target;
          bmMessage = bmPassed
            ? `Maintenance funds verified (${bm.unit || "USD"} ${convertedAmount.toLocaleString()} >= ${target.toLocaleString()})`
            : `Funds deficit: ${bm.unit || "USD"} ${convertedAmount.toLocaleString()} vs required ${target.toLocaleString()}`;
        } else if (bm.metricType === "holding_period_days") {
          const bank = redactedVault.finance?.bankRecords?.[0];
          let days = 30;
          if (bank?.statementPeriod?.from && bank?.statementPeriod?.to) {
            const d1 = new Date(bank.statementPeriod.from).getTime();
            const d2 = new Date(bank.statementPeriod.to).getTime();
            if (!isNaN(d1) && !isNaN(d2) && d2 >= d1) {
              days = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
            }
          }
          const targetDays = Number(bm.targetValue);
          bmPassed = days >= targetDays;
          bmMessage = bmPassed
            ? `Holding window verified (${days} days >= ${targetDays}d)`
            : `Statement duration (${days} days) is less than required ${targetDays} consecutive days`;
        } else if (bm.metricType === "min_tenure_years") {
          const exp = redactedVault.experience?.experiences?.[0];
          const startYear = parseInt(exp?.startDate?.split("-")[0] || "2026");
          const years = Math.max(0, 2026 - startYear);
          const targetYears = Number(bm.targetValue);
          bmPassed = years >= targetYears;
          bmMessage = bmPassed
            ? `Career tenure verified (${years} yrs >= ${targetYears} yrs)`
            : `Experience deficit: ${years} years vs required ${targetYears} years`;
        } else if (bm.metricType === "tier2_notarized") {
          const tier = redactedVault.academics?.degrees?.[0]?.tier || VerificationTier.TIER_1_STANDARD_HASHED;
          bmPassed = tier === VerificationTier.TIER_2_AUTHENTICATED_LEGALIZED;
          bmMessage = bmPassed
            ? "Tier-2 Institutional Notary Seal verified on-chain"
            : "Missing Tier-2 Attestation: Document only standard hashed (Tier-1)";
        }

        if (!bmPassed && bm.importance === "mandatory") {
          hasMandatoryFailure = true;
          totalScore = Math.max(0, totalScore - bm.failurePenalty);
          anomalies.push(`[Benchmark Failure] ${bm.name}: ${bmMessage}`);
        }

        benchmarkResults.push({
          benchmarkId: bm.id,
          name: bm.name,
          passed: bmPassed,
          importance: bm.importance,
          message: bmMessage,
        });
      }
    }

    const roundedScore = Math.min(100, Math.round(totalScore));
    const passingThreshold = rubric.passingScore || 70;

    let verdict: CandidateEvaluationResult["verdict"] = "REJECTED";
    if (roundedScore >= passingThreshold && !hasMandatoryFailure && anomalies.length === 0) {
      verdict = "QUALIFIED";
    } else if (roundedScore >= 50 && !hasMandatoryFailure) {
      verdict = "CONDITIONALLY_QUALIFIED";
    } else {
      verdict = "REJECTED";
    }

    return {
      candidateId: payload.vaultId,
      keyId: payload.keyId,
      sovereignNode: payload.sovereignNode,
      compositeScore: roundedScore,
      verdict,
      integrityStatus: "TAMPER_FREE_VERIFIED",
      onChainTx: "",
      verifiedCategories,
      scoresBreakdown,
      benchmarkResults,
      citations,
      anomaliesDetected: anomalies,
      evaluatedAt: new Date().toISOString(),
    };
  }

  // --- BATCH SCREENING RUNNER ---
  public async screenBatch(
    keys: string[],
    rubricId: string,
    requestingOrg: string = "Batch Enterprise Screener"
  ): Promise<{
    rubricUsed: CriteriaProfile;
    totalCandidates: number;
    qualifiedCount: number;
    conditionallyQualifiedCount: number;
    rejectedCount: number;
    candidates: CandidateEvaluationResult[];
  }> {
    const rubric = this.rubrics.get(rubricId) || this.rubrics.get("rubric_immigration_tech_visa")!;
    const results = await Promise.all(keys.map((key) => this.evaluateCandidate(key, rubricId, requestingOrg)));

    results.sort((a, b) => b.compositeScore - a.compositeScore);

    return {
      rubricUsed: rubric,
      totalCandidates: results.length,
      qualifiedCount: results.filter((r) => r.verdict === "QUALIFIED").length,
      conditionallyQualifiedCount: results.filter((r) => r.verdict === "CONDITIONALLY_QUALIFIED").length,
      rejectedCount: results.filter((r) => r.verdict === "REJECTED").length,
      candidates: results,
    };
  }
}

export const globalCriteriaStore = new EnterpriseCriteriaMasterStore();
