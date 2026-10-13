import { NextRequest, NextResponse } from "next/server";
import { MultiLLMGateway } from "@/agents/gateway/llm_gateway";
import { IntegrityAgent } from "@/agents/integrity_agent";
import { CriteriaAgent } from "@/agents/criteria_agent";
import { StrictRAGEvaluationAgent } from "@/agents/evaluation_agent";
import { FraudDetectionAgent } from "@/agents/fraud_detection_agent";
import { verifyScopedApiKey, filterVaultByScope } from "@/core/crypto/scoped_key";
import { SovereignNodeRouter } from "@/core/sovereign/node_router";
import { FullUserVault } from "@/types/vault";

// Sample verified candidate storage mock
const MOCK_CANDIDATE_VAULT: FullUserVault = {
  userId: "usr_chinwe_okafor_7721",
  sovereignNode: "ng-west-africa",
  residenceCountry: "NG",
  lastSyncedAt: new Date().toISOString(),
  finance: {
    userId: "usr_chinwe_okafor_7721",
    bankRecords: [
      {
        institutionName: "Zenith Bank PLC",
        currency: "NGN",
        currentLiquidBalance: 8750000,
        averageThreeMonthBalance: 8200000,
        statementPeriod: { from: "2026-06-01", to: "2026-09-01" },
        verifiedAt: "2026-09-05T12:00:00Z",
        hashRef: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      },
    ],
    taxClearance: {
      taxId: "FIRS-TCC-2026-99014",
      jurisdiction: "Federal Republic of Nigeria",
      status: "VALID",
      validUntil: "2026-12-31",
      hashRef: "9e107d9d372bb6826bd81d3542a419d6dae2ee1cb1213f56e9c402b88ec29807",
    },
  },
  academics: {
    userId: "usr_chinwe_okafor_7721",
    degrees: [
      {
        id: "deg_01",
        institution: "University of Lagos",
        degreeType: "BSc",
        fieldOfStudy: "Computer Engineering",
        graduationYear: 2022,
        gpa: 4.84,
        maxGpa: 5.0,
        honors: "First Class Honours",
        isNotarized: true,
        tier: 2,
        hashRef: "3e2849e798bc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
    ],
  },
  experience: {
    userId: "usr_chinwe_okafor_7721",
    experiences: [
      {
        id: "exp_01",
        company: "Paystack (Stripe)",
        jobTitle: "Senior Systems Engineer",
        employmentType: "Full-time",
        startDate: "2022-03-01",
        isCurrent: true,
        responsibilities: [
          "Engineered multi-currency settlement engine processing $12M daily.",
          "Designed fault-tolerant event sourcing system with 99.99% uptime.",
        ],
        technologiesUsed: ["Go", "TypeScript", "PostgreSQL", "Kafka"],
        verifiedReference: {
          contactName: "Tunde Adeyemi (VP Eng)",
          officialEmail: "tunde@paystack.com",
          isVerified: true,
        },
        hashRef: "5f3a097de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
      },
    ],
  },
  certifications: {
    userId: "usr_chinwe_okafor_7721",
    certifications: [
      {
        id: "cert_01",
        title: "AWS Certified Solutions Architect - Professional",
        issuingOrganization: "Amazon Web Services",
        issueDate: "2023-05-15",
        tier: 1,
        hashRef: "8a107d9d372bb6826bd81d3542a419d6dae2ee1cb1213f56e9c402b88ec29807",
      },
    ],
  },
  portfolio: {
    userId: "usr_chinwe_okafor_7721",
    headline: "Staff Distributed Systems Architect & Cryptographic Identity Researcher",
    bio: "Pioneering sovereign data infrastructures, verifiable credentials, and decentralized consensus networks.",
    publicLinks: [
      { label: "GitHub", url: "https://github.com/chinwe-okafor" },
      { label: "Research", url: "https://scholar.google.com/citations?user=chinwe" },
    ],
  },
  achievements: {
    userId: "usr_chinwe_okafor_7721",
    achievements: [
      {
        id: "ach_01",
        title: "Africa Fintech Innovation Award Winner",
        issuer: "Techpoint Africa",
        date: "2024",
        description: "Awarded top engineering innovation for zero-loss payment routing.",
        hashRef: "2b9e107d9d372bb6826bd81d3542a419d6dae2ee1cb1213f56e9c402b88ec298",
      },
    ],
  },
};

/**
 * POST /api/v1/screen
 *
 * Full Multi-Agent Enterprise Screening Pipeline
 * 1. Validates scoped API key
 * 2. Integrity Agent: Recomputes SHA-256 and checks on-chain ledger
 * 3. Criteria Ingestion Agent: Parses requirements text into structured rubric
 * 4. Strict RAG Evaluator: Zero hallucination scoring
 * 5. Fraud Detection Agent: Timeline and anomaly check
 * 6. GovTech 60/40 fee split receipt
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, criteriaText, vertical, requestingOrg } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing candidate 'apiKey'" }, { status: 400 });
    }

    // Step 1: Validate Scoped Key & Redact Non-Permitted Scopes
    const keyVerification = verifyScopedApiKey(apiKey);
    if (!keyVerification.isValid || !keyVerification.payload) {
      return NextResponse.json(
        { error: "Invalid or expired candidate API key", details: keyVerification.error },
        { status: 401 }
      );
    }

    const { vaultId, allowedScopes } = keyVerification.payload;
    const scopedCandidateData = filterVaultByScope(MOCK_CANDIDATE_VAULT, allowedScopes);

    // Step 2: Agent 1 - Document Integrity & Blockchain Ledger Verification
    const integrityAgent = new IntegrityAgent();
    const integrityResults: Record<string, any> = {};
    let allTamperFree = true;

    for (const scope of allowedScopes) {
      if ((scopedCandidateData as any)[scope]) {
        const check = await integrityAgent.verifyCategoryIntegrity(
          vaultId,
          scope,
          (scopedCandidateData as any)[scope]
        );
        integrityResults[scope] = check;
        if (!check.isTamperFree) allTamperFree = false;
      }
    }

    if (!allTamperFree) {
      return NextResponse.json(
        {
          status: "REJECTED_TAMPER_DETECTED",
          error: "Critical integrity failure: database record does not match on-chain ledger hash.",
          integrityResults,
        },
        { status: 403 }
      );
    }

    // Step 3: Agent 2 - Criteria Ingestion Agent
    const gateway = new MultiLLMGateway();
    const criteriaAgent = new CriteriaAgent(gateway);
    const selectedVertical = vertical || "labour";
    const rubric = await criteriaAgent.parseRequirements(
      criteriaText || "Standard requirements: Bachelor degree in engineering or relevant experience with solid financial standing.",
      selectedVertical
    );

    // Step 4: Agent 3 - Strict RAG Evaluator
    const evalAgent = new StrictRAGEvaluationAgent(gateway);
    const evaluationDossier = await evalAgent.evaluateCandidate(scopedCandidateData, rubric);

    // Step 5: Agent 4 - Fraud & Anomaly Detection Agent
    const fraudAgent = new FraudDetectionAgent();
    const fraudAudit = fraudAgent.auditCandidateVault(
      scopedCandidateData,
      selectedVertical === "immigration"
    );

    // Step 6: 60/40 Micro-Transaction Accounting
    const sovereignNode = SovereignNodeRouter.resolveSovereignNode(MOCK_CANDIDATE_VAULT.residenceCountry);

    return NextResponse.json({
      status: "SCREENING_COMPLETE",
      candidateId: vaultId,
      sovereignNode: {
        id: sovereignNode.nodeId,
        jurisdiction: sovereignNode.jurisdiction,
        framework: sovereignNode.complianceFramework,
      },
      evaluationDossier,
      fraudAudit,
      integrityCheck: {
        allTamperFree: true,
        blockchainNetwork: "Base Sepolia L2",
        checkedCategories: Object.keys(integrityResults),
      },
      govTechMicroTransaction: {
        feeUsd: 1.0,
        platformShare: "$0.60 (60% to Sabi Platform Treasury)",
        sovereignHostShare: `$0.40 (40% to ${sovereignNode.regionName})`,
        payoutAddress: sovereignNode.payoutAddress,
        contract: "SabiRevenueSplitter.sol (Base Sepolia)",
      },
      screenedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Screening pipeline execution error", details: err.message },
      { status: 500 }
    );
  }
}

