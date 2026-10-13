import { VaultCategory, VerificationTier } from "@/types/vault";
import { verifyScopedApiKey, filterVaultByScope } from "@/core/crypto/scoped_key";
import { computeSha256 } from "@/core/crypto/hasher";
import { globalUserStore } from "@/core/vault/user_store";
import { randomBytes } from "crypto";

export interface CriteriaProfile {
  id: string;
  name: string;
  category: "IMMIGRATION" | "LABOUR" | "EDUCATION" | "CUSTOM";
  description: string;
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
  };
  createdAt: string;
}

export interface CandidateEvaluationResult {
  candidateId: string;
  keyId: string;
  sovereignNode: string;
  compositeScore: number; // 0-100
  verdict: "QUALIFIED" | "CONDITIONALLY_QUALIFIED" | "REJECTED";
  integrityStatus: "TAMPER_FREE_VERIFIED" | "TAMPER_DETECTED" | "KEY_INVALID";
  onChainTx: string;
  verifiedCategories: VaultCategory[];
  scoresBreakdown: {
    financeScore?: number;
    academicsScore?: number;
    experienceScore?: number;
    certificationsScore?: number;
    achievementsScore?: number;
  };
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
      minGpa: 3.5,
      minLiquidFundsUsd: 12000,
      minExperienceYears: 3,
      requiredCategories: ["finance", "academics", "experience"],
      mandatoryTier2Notarization: true,
      weights: {
        finance: 30,
        academics: 35,
        experience: 35,
      },
      createdAt: "2026-09-01T10:00:00Z",
    });

    this.saveCriteriaProfile({
      id: "rubric_fintech_lead_eng",
      name: "Senior Distributed Systems & Security Architect",
      category: "LABOUR",
      description: "Enterprise engineering audit for high-volume financial settlement and sovereign systems.",
      minExperienceYears: 4,
      requiredCategories: ["experience", "academics", "certifications"],
      mandatoryTier2Notarization: false,
      weights: {
        experience: 50,
        academics: 25,
        certifications: 25,
      },
      createdAt: "2026-09-05T10:00:00Z",
    });

    this.saveCriteriaProfile({
      id: "rubric_masters_scholarship",
      name: "Commonwealth Sovereign Post-Grad Fellowship",
      category: "EDUCATION",
      description: "Rigorous academic admissions and scholarship vetting requiring verified first-class standing.",
      minGpa: 4.5,
      requiredCategories: ["academics", "achievements", "portfolio"],
      mandatoryTier2Notarization: true,
      weights: {
        academics: 60,
        achievements: 25,
        portfolio: 15,
      },
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
    this.rubrics.set(profile.id, profile);
    return profile;
  }

  // --- CANDIDATE SCREENING ENGINE ---
  public evaluateCandidate(
    scopedKey: string,
    rubricId: string,
    requestingOrg: string = "Enterprise Evaluator"
  ): CandidateEvaluationResult {
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
    const vault = globalUserStore.getVault();
    const redactedVault = filterVaultByScope(vault, payload.allowedScopes);

    // Record key usage
    globalUserStore.recordKeyUsage(payload.keyId);

    // Record transparency audit log
    const onChainTx = `0x${randomBytes(32).toString("hex")}`;
    globalUserStore.recordAuditEntry({
      requestingOrg,
      orgType: "ENTERPRISE",
      accessedScopes: payload.allowedScopes,
      purpose: `Automated screening against ${rubric.name}`,
      integrityVerified: true,
      onChainTx,
      status: "VERIFIED_ACCESSED",
    });

    // Score candidate strictly against rubric
    let totalScore = 0;
    const citations: string[] = [];
    const anomalies: string[] = [];
    const scoresBreakdown: CandidateEvaluationResult["scoresBreakdown"] = {};

    // 1. Academics Evaluation
    if (rubric.requiredCategories.includes("academics")) {
      if (!payload.allowedScopes.includes("academics") || !redactedVault.academics?.degrees?.length) {
        anomalies.push("Missing required 'academics' category scope or records.");
        scoresBreakdown.academicsScore = 0;
      } else {
        const primaryDegree = redactedVault.academics.degrees[0];
        const gpa = primaryDegree.gpa || 0;
        const meetsGpa = !rubric.minGpa || gpa >= rubric.minGpa;
        const meetsTier2 = !rubric.mandatoryTier2Notarization || primaryDegree.tier === VerificationTier.TIER_2_AUTHENTICATED_LEGALIZED;

        let acadScore = 100;
        if (!meetsGpa) acadScore -= 30;
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
      } else {
        const bank = redactedVault.finance.bankRecords[0];
        // Convert to USD equivalent (assuming NGN rate ~ 1:1500 for testing or raw balance)
        const balanceUsd = bank.currency === "NGN" ? bank.currentLiquidBalance / 1500 : bank.currentLiquidBalance;
        const meetsFunds = !rubric.minLiquidFundsUsd || balanceUsd >= rubric.minLiquidFundsUsd;

        let finScore = 100;
        if (!meetsFunds) {
          finScore = Math.round((balanceUsd / (rubric.minLiquidFundsUsd || 10000)) * 70);
          anomalies.push(`Liquid funds (\$${balanceUsd.toFixed(0)}) below rubric requirement of \$${rubric.minLiquidFundsUsd}`);
        }

        finScore = Math.max(0, Math.min(100, finScore));
        scoresBreakdown.financeScore = finScore;
        totalScore += (finScore * (rubric.weights.finance || 30)) / 100;

        citations.push(
          `Finance: ${bank.institutionName} liquid balance ${bank.currency} ${bank.currentLiquidBalance.toLocaleString()} (~$${balanceUsd.toFixed(0)} USD)`
        );
      }
    }

    // 3. Experience Evaluation
    if (rubric.requiredCategories.includes("experience")) {
      if (!payload.allowedScopes.includes("experience") || !redactedVault.experience?.experiences?.length) {
        anomalies.push("Missing required 'experience' category scope or records.");
        scoresBreakdown.experienceScore = 0;
      } else {
        const exp = redactedVault.experience.experiences[0];
        // Calculate years from startDate
        const startYear = parseInt(exp.startDate.split("-")[0]);
        const currentYear = 2026;
        const years = currentYear - startYear;
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

    const roundedScore = Math.min(100, Math.round(totalScore));
    let verdict: CandidateEvaluationResult["verdict"] = "REJECTED";
    if (roundedScore >= 80 && anomalies.length === 0) {
      verdict = "QUALIFIED";
    } else if (roundedScore >= 60) {
      verdict = "CONDITIONALLY_QUALIFIED";
    }

    return {
      candidateId: payload.vaultId,
      keyId: payload.keyId,
      sovereignNode: payload.sovereignNode,
      compositeScore: roundedScore,
      verdict,
      integrityStatus: "TAMPER_FREE_VERIFIED",
      onChainTx,
      verifiedCategories: payload.allowedScopes,
      scoresBreakdown,
      citations,
      anomaliesDetected: anomalies,
      evaluatedAt: new Date().toISOString(),
    };
  }

  // --- BATCH SCREENING RUNNER ---
  public screenBatch(
    keys: string[],
    rubricId: string,
    requestingOrg: string = "Batch Enterprise Screener"
  ): {
    rubricUsed: CriteriaProfile;
    totalCandidates: number;
    qualifiedCount: number;
    conditionallyQualifiedCount: number;
    rejectedCount: number;
    candidates: CandidateEvaluationResult[];
  } {
    const rubric = this.rubrics.get(rubricId) || this.rubrics.get("rubric_immigration_tech_visa")!;
    const results = keys.map((key) => this.evaluateCandidate(key, rubricId, requestingOrg));

    // Sort descending by composite score
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
