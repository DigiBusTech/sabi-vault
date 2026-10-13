import { NextRequest, NextResponse } from "next/server";
import { verifyScopedApiKey, filterVaultByScope } from "@/core/crypto/scoped_key";
import { SovereignNodeRouter } from "@/core/sovereign/node_router";
import { BlockchainLedgerClient } from "@/core/blockchain/ledger_client";
import { computeSha256 } from "@/core/crypto/hasher";
import { FullUserVault } from "@/types/vault";

// Sample verified citizen vault storage mock (simulating Sovereign Regional Database)
const MOCK_SOVEREIGN_STORAGE: Record<string, FullUserVault> = {
  usr_chinwe_okafor_7721: {
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
  },
};

/**
 * POST /api/v1/vault/query
 *
 * Enterprise Scoped Query Endpoint
 * Accepts a Scoped API Key (`sbk_live_v1_...`), verifies signature and TTL,
 * redacts un-scoped data categories, and performs live on-chain hash verification.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, queryingOrganization } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing required 'apiKey' parameter" }, { status: 400 });
    }

    // 1. Verify Cryptographic API Key
    const verification = verifyScopedApiKey(apiKey);
    if (!verification.isValid || !verification.payload) {
      return NextResponse.json(
        {
          error: "Cryptographic API key rejected",
          details: verification.error,
        },
        { status: 401 }
      );
    }

    const { vaultId, allowedScopes, sovereignNode, expiresAt, maxQueries } = verification.payload;

    // 2. Fetch Structured Data from Sovereign Node Storage
    const rawVault = MOCK_SOVEREIGN_STORAGE[vaultId];
    if (!rawVault) {
      return NextResponse.json(
        { error: `Vault '${vaultId}' not found on sovereign node '${sovereignNode}'` },
        { status: 404 }
      );
    }

    // 3. Redact Un-Permitted Categories
    const scopedVault = filterVaultByScope(rawVault, allowedScopes);

    // 4. Verify Document Hashes Against Blockchain Ledger
    const ledgerClient = new BlockchainLedgerClient();
    const verificationResults: Record<string, any> = {};

    for (const scope of allowedScopes) {
      if ((scopedVault as any)[scope]) {
        const currentDataHash = computeSha256((scopedVault as any)[scope]);
        const onChainCheck = await ledgerClient.verifyHash(vaultId, scope, currentDataHash);
        verificationResults[scope] = {
          sha256Hash: currentDataHash,
          onChainVerified: onChainCheck.isMatch,
          tier: onChainCheck.tier,
          ledgerTimestamp: onChainCheck.timestamp,
        };
      }
    }

    // 5. Calculate GovTech 60/40 Micro-Transaction Accounting
    const queryFeeUsd = 1.0;
    const platformShareUsd = 0.6;
    const sovereignHostShareUsd = 0.4;
    const nodeConfig = SovereignNodeRouter.resolveSovereignNode(rawVault.residenceCountry);

    return NextResponse.json({
      status: "SUCCESS",
      vaultId,
      sovereignNode: {
        id: nodeConfig.nodeId,
        region: nodeConfig.regionName,
        jurisdiction: nodeConfig.jurisdiction,
        complianceFramework: nodeConfig.complianceFramework,
      },
      allowedScopes,
      data: scopedVault,
      integrityVerifications: verificationResults,
      auditReceipt: {
        queryId: `qry_${Math.random().toString(36).substring(2, 10)}`,
        queryingOrganization: queryingOrganization || "Authorized Enterprise",
        feeUsd: queryFeeUsd,
        revenueSplit: {
          platformUsd: platformShareUsd,
          sovereignHostUsd: sovereignHostShareUsd,
          payoutWallet: nodeConfig.payoutAddress,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal error processing scoped query", details: err.message },
      { status: 500 }
    );
  }
}

