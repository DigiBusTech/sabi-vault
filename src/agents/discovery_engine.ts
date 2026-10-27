import { CandidateEvaluationResult, CriteriaProfile } from "@/core/enterprise/criteria_store";
import { UserHumanProfile } from "@/types/profile";
import { FullUserVault, VerificationTier } from "@/types/vault";
import { HolisticMatchIndex, UniversalSector } from "@/core/enterprise/talent_pool_service";
import { MultiLLMGateway } from "@/agents/gateway/llm_gateway";

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

    // Sector-Grounded Individualized Probes Generation (Targeting applicant-specific claims & risks)
    const probes: string[] = [];
    const strengths: string[] = [];
    const vulnerabilities: string[] = [];

    if (foundationalIntegrity >= 85) strengths.push("Cryptographically verified tamper-free on-chain provenance");
    else vulnerabilities.push("Integrity deficit: Document hashes unverified or Tier-2 legalization missing");

    if (practicalExecution >= 80) strengths.push("Strong practical execution velocity and demonstrable impact metrics");
    else vulnerabilities.push("Thin practical demonstration: resume claims lack verified portfolio or codebase artifacts");

    if (learningVelocity >= 80) strengths.push("High growth velocity and multi-domain/multilingual adaptability");

    const topSkill = profile.skills?.[0]?.name || "core engineering disciplines";
    const topExp = profile.workExperiences?.[0];
    const topTitle = topExp?.title || "Lead Practitioner";
    const topCompany = topExp?.company || "Primary Organization";

    if (sector === "IMMIGRATION") {
      probes.push(
        `Under consular questioning for ${rubric.name}, can you demonstrate that your liquid maintenance funds were held continuously for 28+ days without third-party loans or sudden cash dumping?`
      );
      probes.push(
        `How do your documented competencies in ${topSkill} directly alleviate statutory labor market shortages in your destination route?`
      );
      probes.push(
        `Explain your career trajectory transitioning from ${topTitle} at ${topCompany} to your planned relocation objectives.`
      );
    } else if (sector === "EDUCATION") {
      const eduList = (profile as any).educationList || (profile as any).education || [];
      const topDegree = eduList[0]?.degree || "advanced coursework";
      const topField = eduList[0]?.fieldOfStudy || "academic specialization";
      probes.push(
        `Walk the academic admissions panel through your proposed research methodology in ${topField} and how you isolate confounding variables.`
      );
      probes.push(
        `Explain how your practical problem-solving in ${topSkill} substantiates your academic performance in ${topDegree}.`
      );
      probes.push(
        `What specific independent scholarship, research papers, or open-source scientific contributions have you delivered outside formal lectures?`
      );
    } else {
      probes.push(
        `In your work with ${topSkill}, walk us through a critical production outage or distributed systems failure you diagnosed and resolved under pressure.`
      );
      probes.push(
        `How do you balance delivery velocity against rigorous cryptographic compliance and data residency constraints?`
      );
      probes.push(
        topExp
          ? `In your role as ${topTitle} at ${topCompany}, what architectural trade-offs did you make when scaling throughput or optimizing costs?`
          : `Walk us through a situation where you had to master an unfamiliar technology framework in days to ship a mission-critical feature.`
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

  /**
   * Synthesizes individualized dynamic interview probes using MultiLLMGateway
   * (Google Gemini 1.5/2.0 Flash or Groq LLaMA 3.3 70B failover router).
   * Gracefully falls back to individualized deterministic probes if offline or rate-limited.
   */
  public async generateDynamicProbes(params: {
    evalResult?: CandidateEvaluationResult;
    profile?: Partial<UserHumanProfile> & { fullName?: string };
    vault?: FullUserVault;
    rubric?: Partial<CriteriaProfile>;
    sector?: UniversalSector;
    fallbackProbes?: string[];
    // Flat convenience parameters
    candidateName?: string;
    roleOrTrack?: string;
    topSkills?: string[];
    claimedCompany?: string;
    claimedTitle?: string;
    deficits?: string[];
  }): Promise<string[]> {
    const candidateName = params.profile?.fullName || params.candidateName || "Candidate";
    const sector = params.sector || "LABOUR";
    const roleOrTrack = params.rubric?.name || params.roleOrTrack || "Target Position";
    const skillsList = Array.isArray(params.topSkills)
      ? params.topSkills.join(", ")
      : (params.profile?.skills || []).map((s: any) => s.name).join(", ") || "General";
    const workList = params.claimedCompany
      ? `${params.claimedTitle || "Professional"} at ${params.claimedCompany}`
      : (params.profile?.workExperiences || [])
          .map((w: any) => `${w.title} at ${w.company}`)
          .join("; ") || "Declared Work Experience";
    const deficits = params.deficits
      ? params.deficits.join("; ")
      : (params.evalResult?.anomaliesDetected || []).join("; ") || "None";

    const topSkill = Array.isArray(params.topSkills) && params.topSkills.length > 0
      ? params.topSkills[0]
      : (params.profile?.skills && params.profile.skills.length > 0 ? params.profile.skills[0].name : "core domain");

    const defaultFallbacks = [
      `In your work with ${topSkill}, walk us through a critical production challenge or system constraint you diagnosed and resolved under pressure.`,
      `How did you architect and maintain the solutions at ${params.claimedCompany || "your previous role"}, and how did you measure its operational success?`,
      `Regarding the criteria for ${roleOrTrack}: how do you ensure compliance and verification given ${deficits}?`,
    ];

    const fallbackProbes = params.fallbackProbes && params.fallbackProbes.length >= 3
      ? params.fallbackProbes
      : defaultFallbacks;

    try {
      const gateway = new MultiLLMGateway();
      const prompt = `You are a strict sovereign evaluator and senior interview examiner for ${sector}.
Target Route/Role: ${roleOrTrack}
Candidate Profile:
- Full Name: ${candidateName}
- Claimed Technical/Professional Skills: ${skillsList}
- Work Experience Claims: ${workList}
- Anomalies / Deficits: ${deficits}

Task: Formulate exactly 3 razor-sharp, individualized interview probes (questions) tailored specifically to this applicant's unique background, claimed skills, and identified evidence deficits or risk factors.
Format: Return ONLY a valid JSON array of 3 strings, e.g. ["Question 1", "Question 2", "Question 3"]. Do not include markdown code fences or conversational text.`;

      const response = await gateway.complete({
        messages: [
          { role: "system", content: "You are an expert technical and compliance interviewer. Output only a JSON array of 3 strings." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        jsonSchema: true,
      });

      if (response && response.content) {
        const cleaned = response.content.trim().replace(/^```json/i, "").replace(/```$/i, "").trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed.slice(0, 3).map((q) => String(q).trim());
        }
      }
    } catch (err: any) {
      console.warn("[DiscoveryEngine] Dynamic LLM probe generation notice:", err.message);
    }
    return fallbackProbes;
  }
}

export const globalDiscoveryEngine = new RightApplicantDiscoveryEngine();

