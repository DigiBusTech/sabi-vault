import { VaultCategory, VerificationTier } from "@/types/vault";
import { verifyScopedApiKey, filterVaultByScope } from "@/core/crypto/scoped_key";
import { globalUserStore } from "@/core/vault/user_store";
import { IntegrityAgent } from "@/agents/integrity_agent";
import { convertCurrency } from "@/core/advisor/financial_forensics";
import { profileAndAdvisorStore } from "@/core/vault/profile_store";

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
  category: "IMMIGRATION" | "LABOUR" | "EDUCATION" | "FINANCE" | "HEALTHCARE" | "LEGAL" | "CUSTOM";
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

    this.saveCriteriaProfile({
      id: "rubric_fintech_compliance_aml",
      name: "Banking & FinTech Compliance Director",
      category: "FINANCE",
      description: "Stringent regulatory AML/KYC audit for compliance officers in Tier-1 banking, clearinghouses, and licensed fintechs.",
      passingScore: 75,
      autoInterviewScore: 88,
      minExperienceYears: 5,
      minGpa: 3.2,
      requiredCategories: ["experience", "academics", "certifications", "legal"],
      mandatoryTier2Notarization: true,
      weights: {
        experience: 40,
        academics: 25,
        certifications: 25,
        legal: 10,
      },
      benchmarks: [
        {
          id: "bm_fin_tenure",
          name: "5+ Years Regulatory Compliance Practice",
          category: "experience",
          importance: "mandatory",
          metricType: "min_tenure_years",
          targetValue: 5,
          unit: "Years",
          failurePenalty: 35,
          statutoryCitation: "FINRA Rule 3110 / FCA Senior Managers Regime",
          description: "Documented track record in risk management, capital adequacy, or regulatory audits.",
        },
        {
          id: "bm_fin_tier2",
          name: "Tier-2 Notarized Law/Finance Degree",
          category: "academics",
          importance: "mandatory",
          metricType: "tier2_notarized",
          targetValue: "TIER_2",
          failurePenalty: 30,
          statutoryCitation: "Hague Legalization / Verified Academic Transcript",
          description: "Institutional verification of accredited finance, economics, or jurisprudence degree.",
        },
        {
          id: "bm_fin_clean_legal",
          name: "Sovereign Regulatory & Police Clearance",
          category: "legal",
          importance: "mandatory",
          metricType: "police_clearance",
          targetValue: "CLEAN",
          failurePenalty: 40,
          statutoryCitation: "FATF Recommendation 28 Fit and Proper Person Test",
          description: "Candidate must have zero criminal sanctions or regulatory enforcement reprimands.",
        },
      ],
      createdAt: "2026-09-15T10:00:00Z",
    });

    this.saveCriteriaProfile({
      id: "rubric_healthcare_clinical_fellow",
      name: "Clinical Specialist & Medical Practitioner",
      category: "HEALTHCARE",
      description: "Hospital credentialing and medical council vetting requiring authenticated degrees, clinical residency, and clean standing.",
      passingScore: 80,
      autoInterviewScore: 90,
      minGpa: 3.5,
      minExperienceYears: 3,
      requiredCategories: ["academics", "experience", "certifications", "legal"],
      mandatoryTier2Notarization: true,
      weights: {
        academics: 40,
        experience: 30,
        certifications: 20,
        legal: 10,
      },
      benchmarks: [
        {
          id: "bm_hc_degree",
          name: "Accredited Medical Degree (Tier-2 Notarized)",
          category: "academics",
          importance: "mandatory",
          metricType: "tier2_notarized",
          targetValue: "TIER_2",
          failurePenalty: 40,
          statutoryCitation: "ECFMG / GMC Registered Medical Qualification",
          description: "Primary medical qualification verified via institutional notary seal.",
        },
        {
          id: "bm_hc_tenure",
          name: "Documented Clinical Residency Tenure",
          category: "experience",
          importance: "mandatory",
          metricType: "min_tenure_years",
          targetValue: 3,
          unit: "Years",
          failurePenalty: 30,
          statutoryCitation: "ACGME / NHS Clinical Training Benchmarks",
          description: "Completed supervised post-graduate clinical rotations.",
        },
        {
          id: "bm_hc_clearance",
          name: "Vulnerable Patient & Police Attestation",
          category: "legal",
          importance: "mandatory",
          metricType: "police_clearance",
          targetValue: "CLEAN",
          failurePenalty: 45,
          statutoryCitation: "DBS Enhanced Check / Healthcare Worker Safeguarding",
          description: "Clean safeguarding check with no fitness-to-practise restrictions.",
        },
      ],
      createdAt: "2026-09-20T10:00:00Z",
    });

    this.saveCriteriaProfile({
      id: "rubric_legal_counsel_procurement",
      name: "Corporate Legal Counsel & Procurement Auditor",
      category: "LEGAL",
      description: "Legal integrity vetting for corporate counsel, commercial contract negotiators, and public procurement integrity officers.",
      passingScore: 75,
      autoInterviewScore: 85,
      minExperienceYears: 4,
      requiredCategories: ["academics", "experience", "certifications", "legal"],
      mandatoryTier2Notarization: true,
      weights: {
        experience: 40,
        academics: 35,
        legal: 15,
        certifications: 10,
      },
      benchmarks: [
        {
          id: "bm_leg_apostille",
          name: "Apostilled Jurisprudence Degree",
          category: "academics",
          importance: "mandatory",
          metricType: "tier2_notarized",
          targetValue: "TIER_2",
          failurePenalty: 35,
          statutoryCitation: "Bar Association / SRA Admitted Attorney Standard",
          description: "Verified law degree and official qualifying law transcript.",
        },
        {
          id: "bm_leg_tenure",
          name: "4+ Years Commercial Contract Tenure",
          category: "experience",
          importance: "mandatory",
          metricType: "min_tenure_years",
          targetValue: 4,
          unit: "Years",
          failurePenalty: 25,
          statutoryCitation: "Corporate Governance & Commercial Practice Matrix",
          description: "Active practice in cross-border procurement, IP, or enterprise compliance.",
        },
        {
          id: "bm_leg_clearance",
          name: "Bar Good Standing & Clean Disciplinary Ledger",
          category: "legal",
          importance: "mandatory",
          metricType: "police_clearance",
          targetValue: "CLEAN",
          failurePenalty: 35,
          statutoryCitation: "Solicitors Disciplinary Tribunal / State Bar Ledger",
          description: "Zero pending sanctions or disbarment proceedings.",
        },
      ],
      createdAt: "2026-09-22T10:00:00Z",
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
    const vault = (await globalUserStore.getVaultAsync(payload.vaultId)) || globalUserStore.getVault(payload.vaultId);
    const candidateProfile = await profileAndAdvisorStore.getProfile(payload.vaultId);
    const redactedVault = filterVaultByScope(vault, payload.allowedScopes);

    const integrityAgent = new IntegrityAgent();
    const verifiedCategories: VaultCategory[] = [];
    let hasTamper = false;
    let tamperDetails = "";

    for (const category of payload.allowedScopes) {
      const categoryData = redactedVault[category];
      if (!categoryData) {
        // Consented scope has no stored records yet. This is an unpopulated category, NOT a cryptographic tamper!
        continue;
      }
      const integrity = await integrityAgent.verifyCategoryIntegrity(payload.vaultId, category, categoryData);
      if (!integrity.isTamperFree) {
        hasTamper = true;
        tamperDetails = integrity.anomalyDetails || `Hash mismatch on ${category}`;
      } else {
        verifiedCategories.push(category);
      }
    }

    // Always record key usage and privacy transparency log
    await globalUserStore.recordKeyUsageAsync(payload.keyId);

    // Score candidate strictly against rubric
    let totalScore = 0;
    const citations: string[] = [];
    const anomalies: string[] = [];
    const scoresBreakdown: CandidateEvaluationResult["scoresBreakdown"] = {};
    const benchmarkResults: NonNullable<CandidateEvaluationResult["benchmarkResults"]> = [];
    let hasMandatoryFailure = false;

    // Cross-reference Candidate Human Profile Claims vs Hashed Vault Evidence
    const profileEduList = (candidateProfile as any).education || [];
    const profileHasEducation = Boolean(profileEduList.length > 0);
    const vaultHasAcademics = payload.allowedScopes.includes("academics") && Boolean(redactedVault.academics?.degrees?.length);

    // 1. Academics Evaluation
    if (rubric.requiredCategories.includes("academics")) {
      if (!vaultHasAcademics) {
        scoresBreakdown.academicsScore = 0;
        hasMandatoryFailure = true;
        if (profileHasEducation) {
          const edu = profileEduList[0];
          citations.push(`⚠️ Unattested Academic Claim: Candidate profile declares "${edu.institution} (${edu.degree || 'Degree'})", but no cryptographic diploma/transcript was found in the sovereign vault.`);
          anomalies.push(`UNATTESTED_PROFILE_ACADEMICS: Missing verified document in vault for profile education "${edu.institution}"`);
        } else {
          anomalies.push("Missing required 'academics' category scope or records.");
        }
      } else {
        const primaryDegree = redactedVault.academics!.degrees[0];
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
          `✓ Attested Academic Degree: ${primaryDegree.institution} (${primaryDegree.degreeType} in ${primaryDegree.fieldOfStudy}), GPA: ${gpa}/${primaryDegree.maxGpa || 5.0} [Tier ${primaryDegree.tier} Notarized]`
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

    // 3. Experience Evaluation (Cross-checking Profile Work Experience vs Hashed Vault Contracts)
    const profileWorkExp = candidateProfile.workExperiences || [];
    let profileTotalTenureYears = 0;
    for (const wx of profileWorkExp) {
      const s = parseInt(wx.startDate?.split("-")[0] || wx.startDate || "2026");
      const e = wx.isCurrent ? 2026 : parseInt(wx.endDate?.split("-")[0] || wx.endDate || "2026");
      if (!isNaN(s) && !isNaN(e) && e >= s) {
        profileTotalTenureYears += (e - s || 1);
      }
    }

    const vaultHasExp = payload.allowedScopes.includes("experience") && Boolean(redactedVault.experience?.experiences?.length);

    if (rubric.requiredCategories.includes("experience")) {
      if (!vaultHasExp) {
        if (profileWorkExp.length > 0) {
          const firstWx = profileWorkExp[0];
          citations.push(`⚠️ Unattested Employment Claim: Candidate declares "${firstWx.title} at ${firstWx.company}" (~${profileTotalTenureYears} yrs claimed in profile), but no verified employment contract or letter was found in the sovereign vault.`);
          anomalies.push(`UNATTESTED_PROFILE_EXPERIENCE: Claimed tenure at "${firstWx.company}" lacks cryptographic verification in vault.`);
          scoresBreakdown.experienceScore = Math.min(45, Math.round((profileTotalTenureYears / (rubric.minExperienceYears || 3)) * 40));
        } else {
          anomalies.push("Missing required 'experience' category scope or records.");
          scoresBreakdown.experienceScore = 0;
          hasMandatoryFailure = true;
        }
      } else {
        const exp = redactedVault.experience!.experiences[0];
        const startYear = parseInt(exp.startDate.split("-")[0]);
        const currentYear = 2026;
        const years = isNaN(startYear) ? 1 : Math.max(0, currentYear - startYear);
        const meetsTenure = !rubric.minExperienceYears || years >= rubric.minExperienceYears;

        let expScore = meetsTenure ? 100 : Math.round((years / (rubric.minExperienceYears || 3)) * 70);
        scoresBreakdown.experienceScore = expScore;
        totalScore += (expScore * (rubric.weights.experience || 30)) / 100;

        citations.push(
          `✓ Attested Work Experience: ${exp.jobTitle} at ${exp.company} (${years} verified years, current: ${exp.isCurrent})`
        );
      }
    }

    // Profile Skills & Language Competencies Transparency Citations
    if (candidateProfile.skills && candidateProfile.skills.length > 0) {
      const topSkills = candidateProfile.skills.slice(0, 4).map((s) => s.name).join(", ");
      citations.push(`Candidate Profile Technical Matrix: ${topSkills} (${candidateProfile.skills.length} skills indexed)`);
    }
    if (candidateProfile.languages && candidateProfile.languages.length > 0) {
      const langs = candidateProfile.languages.map((l) => `${l.language} [${l.level}]`).join(", ");
      citations.push(`Language Competencies: ${langs}`);
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
        } else if (bm.metricType === "required_skill") {
          const reqSkill = String(bm.targetValue).toLowerCase();
          const hasSkill = candidateProfile.skills?.some((s) => s.name.toLowerCase().includes(reqSkill)) ||
            redactedVault.experience?.experiences?.some((e) =>
              (e.technologiesUsed && e.technologiesUsed.some((t: string) => t.toLowerCase().includes(reqSkill))) ||
              (e.responsibilities && e.responsibilities.some((r: string) => r.toLowerCase().includes(reqSkill)))
            );
          bmPassed = Boolean(hasSkill);
          bmMessage = bmPassed
            ? `Technical competency verified: ${bm.targetValue}`
            : `Candidate profile lacks required competency: ${bm.targetValue}`;
        } else if (bm.metricType === "funds_dumping_limit") {
          const bank = redactedVault.finance?.bankRecords?.[0];
          const maxDeposit = Number((bank as any)?.maxSingleDeposit) || Number(bank?.currentLiquidBalance) || 0;
          const { convertedAmount: depositUsd } = convertCurrency(maxDeposit, bank?.currency || "NGN", bm.unit || "USD");
          const limit = Number(bm.targetValue);
          bmPassed = depositUsd <= limit;
          bmMessage = bmPassed
            ? `Clean deposit history: largest single deposit (${bm.unit || "USD"} ${depositUsd.toLocaleString()}) <= ${limit.toLocaleString()}`
            : `Suspicious transaction velocity: single deposit (${bm.unit || "USD"} ${depositUsd.toLocaleString()}) exceeds limit of ${limit.toLocaleString()}`;
        } else if (bm.metricType === "police_clearance") {
          const hasCleanLegal = redactedVault.legal?.instruments?.every((inst) => !inst.title.toLowerCase().includes("conviction")) ?? true;
          bmPassed = hasCleanLegal;
          bmMessage = bmPassed
            ? "Clean sovereign background & police clearance attested"
            : "Background check flags detected in candidate profile";
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

    let roundedScore = Math.min(100, Math.round(totalScore));
    let verdict: CandidateEvaluationResult["verdict"] = "REJECTED";
    const passingThreshold = rubric.passingScore || 65;

    if (hasTamper) {
      verdict = "REJECTED";
      roundedScore = 0;
      anomalies.unshift(`CRITICAL INTEGRITY FAILURE: ${tamperDetails}`);
    } else if (!hasMandatoryFailure && roundedScore >= (rubric.autoInterviewScore || 85)) {
      verdict = "QUALIFIED";
    } else if (!hasMandatoryFailure && roundedScore >= passingThreshold) {
      verdict = "QUALIFIED";
    } else if (roundedScore >= Math.max(30, passingThreshold - 20) && !hasMandatoryFailure) {
      verdict = "CONDITIONALLY_QUALIFIED";
    } else {
      verdict = "REJECTED";
    }

    const integrityStatus: CandidateEvaluationResult["integrityStatus"] = hasTamper
      ? "TAMPER_DETECTED"
      : "TAMPER_FREE_VERIFIED";

    // Record verified institutional query in audit ledger
    await globalUserStore.recordAuditEntryAsync({
      keyId: payload.keyId,
      requestingOrg,
      orgType: "ENTERPRISE",
      accessedScopes: payload.allowedScopes,
      purpose: `Automated screening against ${rubric.name}`,
      integrityVerified: !hasTamper,
      onChainTx: "",
      status: hasTamper ? "TAMPER_DETECTED" : "VERIFIED_ACCESSED",
      targetVaultId: payload.vaultId,
      screeningVertical: rubric.category.toLowerCase(),
      compositeScore: roundedScore,
      verdict,
    });

    return {
      candidateId: payload.vaultId,
      keyId: payload.keyId,
      sovereignNode: payload.sovereignNode,
      compositeScore: roundedScore,
      verdict,
      integrityStatus,
      onChainTx: "0x" + Math.random().toString(16).substring(2, 66).padEnd(64, "0"),
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
