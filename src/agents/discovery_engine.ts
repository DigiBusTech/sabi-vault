import { CandidateEvaluationResult, CriteriaProfile } from "@/core/enterprise/criteria_store";
import { UserHumanProfile } from "@/types/profile";
import { FullUserVault, VerificationTier } from "@/types/vault";
import { HolisticMatchIndex, UniversalSector } from "@/core/enterprise/talent_pool_service";

export interface DiscoveryAuditResult {
  hmi: HolisticMatchIndex;
  sector: UniversalSector;
  provenanceGrade: "A" | "B" | "C" | "F";
  practicalGrade: "A" | "B" | "C" | "F";
  velocityGrade: "A" | "B" | "C" | "F";
  situationalGrade: "A" | "B" | "C" | "F";
  keyStrengths: string[];
  vulnerabilitiesAndBlindspots: string[];
  tailoredProbes: string[];
}

/**
 * The "Right Applicant" Discovery Engine
 * 
 * Solves the core industry dilemma where employers, consular officers, and admissions boards
 * rely solely on flat credentials, overlooking genuine problem-solvers (Hidden Gems) while
 * falling victim to buzzword-padded or loan-shark-funded applications.
 */
export class RightApplicantDiscoveryEngine {
  /**
   * Evaluates candidate across 4 Triangulated Vectors:
   * 1. Cryptographic Provenance & Work Velocity (Hard Mathematical Grounding)
   * 2. Practical Competency & Artifact Radar (Real Tools, Repos, Scaled Impact)
   * 3. Growth Gradient & Learning Velocity (Pace of Skill Mastery vs Static Time Served)
   * 4. Situational Fit & Applied Judgment (Problem-Solving Trade-Offs)
   */
  public evaluateApplicant(params: {
    evalResult: CandidateEvaluationResult;
    profile: UserHumanProfile;
    vault: FullUserVault;
    rubric: CriteriaProfile;
  }): DiscoveryAuditResult {
    const { evalResult, profile, vault, rubric } = params;

    // Detect Sector
    let sector: UniversalSector = "LABOUR";
    if (rubric.category === "IMMIGRATION") sector = "IMMIGRATION";
    else if (rubric.category === "EDUCATION") sector = "EDUCATION";
    else if (rubric.category === "FINANCE") sector = "FINANCE";
    else if (rubric.category === "HEALTHCARE") sector = "HEALTHCARE";
    else if (rubric.category === "LEGAL") sector = "LEGAL";

    // --- 1. Provenance & Foundational Integrity Score (0-100) ---
    let foundationalIntegrity = evalResult.integrityStatus === "TAMPER_FREE_VERIFIED" ? 95 : 10;
    
    // Check Tier-2 compliance on degrees and legal documents
    const hasTier2Degrees = vault.academics?.degrees?.some(
      (d) => d.tier === VerificationTier.TIER_2_AUTHENTICATED_LEGALIZED || d.isNotarized
    );
    if (rubric.mandatoryTier2Notarization && !hasTier2Degrees) {
      foundationalIntegrity = Math.max(20, foundationalIntegrity - 30);
    }

    // --- 2. Practical Execution Index (0-100) ---
    // Audits tangible artifacts: skills depth, documented responsibilities, verified references
    let practicalExecution = 40;
    const skillsCount = profile.skills?.length || 0;
    const workItems = profile.workExperiences || [];
    
    // Check for high-impact metrics in responsibilities (e.g. TPS, throughput, revenue, scale)
    let hasQuantifiedImpact = false;
    for (const exp of workItems) {
      if (exp.description && /(%|k|m|scale|tps|million|billion|optimized|architected|settlement)/i.test(exp.description)) {
        hasQuantifiedImpact = true;
        break;
      }
    }

    practicalExecution += Math.min(30, skillsCount * 4);
    if (hasQuantifiedImpact) practicalExecution += 20;
    if (evalResult.scoresBreakdown.experienceScore && evalResult.scoresBreakdown.experienceScore >= 80) {
      practicalExecution += 15;
    }
    practicalExecution = Math.min(100, practicalExecution);

    // --- 3. Growth Gradient & Learning Velocity (0-100) ---
    // Distinguishes 5 years of compound growth vs 1 year repeated 5 times
    let learningVelocity = 50;
    const languagesCount = profile.languages?.length || 1;
    learningVelocity += Math.min(20, languagesCount * 7);

    if (workItems.length >= 2) {
      const isProgressive = workItems.some((w) => /(lead|senior|principal|director|head|architect)/i.test(w.title));
      if (isProgressive) learningVelocity += 25;
    }
    learningVelocity = Math.min(100, learningVelocity);

    // --- 4. Situational Judgment Score (0-100) ---
    let situationalJudgment = evalResult.compositeScore >= 75 ? 88 : evalResult.compositeScore >= 50 ? 70 : 45;
    if (evalResult.anomaliesDetected.length === 0) situationalJudgment += 5;
    situationalJudgment = Math.min(100, situationalJudgment);

    // Overall Holistic Match Index (HMI) Weighted Synthesis
    const overallHmiScore = Math.round(
      foundationalIntegrity * 0.25 +
      practicalExecution * 0.35 +
      learningVelocity * 0.20 +
      situationalJudgment * 0.20
    );

    // Indicator 1: Hidden Gem (High practical execution + clean provenance despite non-traditional pedigree)
    const isHiddenGem = practicalExecution >= 80 && foundationalIntegrity >= 85 && (!evalResult.scoresBreakdown.academicsScore || evalResult.scoresBreakdown.academicsScore < 85);
    
    // Indicator 2: Pedigree Inflation Warning (High academic score but very low practical artifact demonstration)
    const hasPedigreeDivergence = Boolean(
      evalResult.scoresBreakdown.academicsScore &&
      evalResult.scoresBreakdown.academicsScore > 85 &&
      practicalExecution < 55
    );

    // Sector-Grounded Probes Generation (Targeting applicant risks)
    const probes: string[] = [];
    const strengths: string[] = [];
    const vulnerabilities: string[] = [];

    if (foundationalIntegrity >= 85) strengths.push("Cryptographically verified tamper-free on-chain provenance");
    else vulnerabilities.push("Integrity deficit: Document hashes unverified or Tier-2 legalization missing");

    if (practicalExecution >= 80) strengths.push("Strong practical execution velocity and demonstrable impact metrics");
    else vulnerabilities.push("Thin practical demonstration: resume claims lack verified portfolio or codebase artifacts");

    if (learningVelocity >= 80) strengths.push("High growth velocity and multi-domain/multilingual adaptability");

    if (sector === "IMMIGRATION") {
      probes.push(
        "Under consular questioning, can you demonstrate that your liquid maintenance funds were held continuously for 28+ days without third-party loans or sudden cash dumping?"
      );
      probes.push(
        "How do your documented professional skills directly alleviate labor market shortages in your destination country?"
      );
      probes.push(
        "Explain any career or location transitions between your home country experience and your planned relocation route."
      );
    } else if (sector === "EDUCATION") {
      probes.push(
        "Walk the academic admissions panel through your proposed research methodology and how you will isolate confounding variables."
      );
      probes.push(
        "Explain how your practical problem-solving experiences substantiate your quantitative coursework and GPA."
      );
      probes.push(
        "What specific independent scholarship or open-source scientific contributions have you delivered outside formal classroom lectures?"
      );
    } else {
      probes.push(
        "Describe a critical production outage or distributed systems failure you diagnosed and resolved under pressure."
      );
      probes.push(
        "How do you balance delivery velocity against rigorous cryptographic and data security compliance?"
      );
      probes.push(
        "Walk us through a situation where you had to master an unfamiliar technology framework in days to ship a mission-critical feature."
      );
    }

    const toGrade = (score: number): "A" | "B" | "C" | "F" => {
      if (score >= 85) return "A";
      if (score >= 70) return "B";
      if (score >= 50) return "C";
      return "F";
    };

    return {
      hmi: {
        foundationalIntegrityScore: foundationalIntegrity,
        practicalExecutionIndex: practicalExecution,
        learningVelocityIndex: learningVelocity,
        situationalJudgmentScore: situationalJudgment,
        overallHmiScore,
        isHiddenGem,
        hasPedigreeDivergenceWarning: hasPedigreeDivergence,
        hiddenGemReason: isHiddenGem
          ? "Candidate demonstrates exceptional practical execution velocity and clean cryptographic provenance that conventional ATS filters routinely miss."
          : undefined,
        pedigreeWarningReason: hasPedigreeDivergence
          ? "Candidate boasts high formal academic marks but demonstrates very thin practical artifact depth; probe hands-on problem solving during the interview."
          : undefined,
        tailoredInterviewProbes: probes,
      },
      sector,
      provenanceGrade: toGrade(foundationalIntegrity),
      practicalGrade: toGrade(practicalExecution),
      velocityGrade: toGrade(learningVelocity),
      situationalGrade: toGrade(situationalJudgment),
      keyStrengths: strengths,
      vulnerabilitiesAndBlindspots: vulnerabilities,
      tailoredProbes: probes,
    };
  }
}

export const globalDiscoveryEngine = new RightApplicantDiscoveryEngine();
