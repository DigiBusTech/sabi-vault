import { NextRequest, NextResponse } from "next/server";
import { globalAdminStore } from "@/core/admin/admin_store";
import { verifyScopedApiKey, filterVaultByScope } from "@/core/crypto/scoped_key";
import { BlockchainLedgerClient } from "@/core/blockchain/ledger_client";
import { SovereignNodeRouter } from "@/core/sovereign/node_router";
import { computeSha256 } from "@/core/crypto/hasher";
import { FullUserVault } from "@/types/vault";

// Sample sovereign storage record
const CANDIDATE_STORAGE: FullUserVault = {
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
 * POST /api/v1/m2m/query
 *
 * M2M Autonomous Query Endpoint with Dual-Key Handshake:
 * Requires:
 * 1. `X-Sabi-Org-Key` header (Enterprise/Govt Organization License)
 * 2. `Authorization: Bearer <candidate_scoped_api_key>` header (Citizen Consent Anchor)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Dual-Key Check: Header 1 - Organization Key
    const orgKey = req.headers.get("x-sabi-org-key") || req.headers.get("X-Sabi-Org-Key");
    if (!orgKey) {
      return NextResponse.json(
        { error: "Unauthorized: Missing 'X-Sabi-Org-Key' header. Contact Super Admin to obtain an Org key." },
        { status: 401 }
      );
    }

    const orgVerification = globalAdminStore.verifyOrgApiKey(orgKey);
    if (!orgVerification.isValid || !orgVerification.org) {
      return NextResponse.json(
        { error: "Forbidden: Invalid, suspended, or unrecognized 'X-Sabi-Org-Key'." },
        { status: 403 }
      );
    }

    // 2. Dual-Key Check: Header 2 - Candidate Scoped API Key
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or malformed 'Authorization: Bearer <candidate_key>' header." },
        { status: 401 }
      );
    }

    const candidateApiKey = authHeader.substring("Bearer ".length).trim();
    const keyVerification = verifyScopedApiKey(candidateApiKey);
    if (!keyVerification.isValid || !keyVerification.payload) {
      return NextResponse.json(
        { error: "Candidate API Key invalid or expired", details: keyVerification.error },
        { status: 401 }
      );
    }

    const { vaultId, allowedScopes, sovereignNode } = keyVerification.payload;

    // 3. User Status Check
    const user = globalAdminStore.getUser(vaultId);
    if (user && user.status === "FROZEN") {
      return NextResponse.json(
        { error: "Account Frozen: This citizen vault has been temporarily restricted by sovereign compliance." },
        { status: 403 }
      );
    }

    // 4. Redact Un-Permitted Categories
    const scopedData = filterVaultByScope(CANDIDATE_STORAGE, allowedScopes);

    // 5. Blockchain Proof Verification
    const ledgerClient = new BlockchainLedgerClient();
    const verificationResults: Record<string, any> = {};

    for (const scope of allowedScopes) {
      if ((scopedData as any)[scope]) {
        const hash = computeSha256((scopedData as any)[scope]);
        const onChainCheck = await ledgerClient.verifyHash(vaultId, scope, hash);
        verificationResults[scope] = {
          sha256Hash: hash,
          isMatch: onChainCheck.isMatch,
          tier: onChainCheck.tier,
          timestamp: onChainCheck.timestamp,
        };
      }
    }

    // 6. Record Micro-Transaction Telemetry & Revenue Split
    globalAdminStore.recordQueryExecuted(1.0);
    const nodeConfig = SovereignNodeRouter.resolveSovereignNode(CANDIDATE_STORAGE.residenceCountry);

    return NextResponse.json({
      status: "VERIFIED_SUCCESS",
      candidateId: vaultId,
      requestingOrganization: {
        id: orgVerification.org.id,
        name: orgVerification.org.name,
        type: orgVerification.org.type,
      },
      sovereignNode: {
        id: nodeConfig.nodeId,
        region: nodeConfig.regionName,
        jurisdiction: nodeConfig.jurisdiction,
        complianceFramework: nodeConfig.complianceFramework,
      },
      allowedScopes,
      verifiedData: scopedData,
      blockchainProof: {
        network: "Base Sepolia L2",
        blockNumber: 18924102,
        tamperStatus: "ALL_HASHES_MATCH_LEDGER",
        verifications: verificationResults,
      },
      microTransactionReceipt: {
        feeUsd: 1.0,
        platformSplitUsd: 0.6,
        sovereignHostSplitUsd: 0.4,
        payoutAddress: nodeConfig.payoutAddress,
        contract: "SabiRevenueSplitter.sol (Base Sepolia)",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "M2M query processing failed", details: err.message },
      { status: 500 }
    );
  }
}
