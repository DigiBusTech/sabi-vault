import { randomBytes } from "crypto";

export interface SovereignNodeRecord {
  id: string;
  name: string;
  jurisdiction: string;
  dataCenterLocation: string;
  complianceFramework: "NDPC" | "GDPR" | "US_PRIVACY";
  status: "ONLINE" | "DEGRADED" | "MAINTENANCE";
  uptimePct: number;
  totalCitizenRecords: number;
  totalQueriesProcessed: number;
  accumulatedHostYieldUsd: number;
  pendingDisbursementUsd: number;
  hostTreasuryWallet: string;
  lastAuditedAt: string;
}

export interface GovTechDisbursement {
  txHash: string;
  nodeId: string;
  nodeName: string;
  amountUsd: number;
  recipientWallet: string;
  network: string; // Base Sepolia
  smartContract: string; // SabiRevenueSplitter.sol
  timestamp: string;
  status: "CONFIRMED_ON_CHAIN";
}

export interface FraudRadarAlert {
  id: string;
  detectedAt: string;
  category: "DEGREE_FORGERY" | "BALANCE_MANIPULATION" | "TIMELINE_ANOMALY" | "HASH_MISMATCH";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  entityName: string;
  suspectCandidateId: string;
  originNode: string;
  description: string;
  actionTaken: "FLAGGED_AND_INTERCEPTED" | "REFERRED_TO_POLICE_FRAUD_UNIT" | "NOTARY_SEAL_REVOKED";
}

class SovereignGovtMasterStore {
  private nodes: Map<string, SovereignNodeRecord> = new Map();
  private disbursements: GovTechDisbursement[] = [];
  private fraudAlerts: FraudRadarAlert[] = [];

  constructor() {
    // Seed 3 regional sovereign nodes
    this.nodes.set("ng-west-africa", {
      id: "ng-west-africa",
      name: "Nigeria & ECOWAS Sovereign Regional Node",
      jurisdiction: "Federal Republic of Nigeria (ECOWAS Zone)",
      dataCenterLocation: "MainOne Tier-III / Galaxy Backbone, Abuja",
      complianceFramework: "NDPC",
      status: "ONLINE",
      uptimePct: 99.98,
      totalCitizenRecords: 4820,
      totalQueriesProcessed: 1840,
      accumulatedHostYieldUsd: 736.0, // 40% of $1840
      pendingDisbursementUsd: 294.4,
      hostTreasuryWallet: "0x71C5A869C08D0a7479F224E8972E9D4791E82bE4",
      lastAuditedAt: new Date(Date.now() - 3600000).toISOString(),
    });

    this.nodes.set("eu-central", {
      id: "eu-central",
      name: "EU Frankfurt Sovereign Partition Node",
      jurisdiction: "European Union / EEA",
      dataCenterLocation: "Equinix FR5, Frankfurt am Main, Germany",
      complianceFramework: "GDPR",
      status: "ONLINE",
      uptimePct: 99.99,
      totalCitizenRecords: 2190,
      totalQueriesProcessed: 910,
      accumulatedHostYieldUsd: 364.0,
      pendingDisbursementUsd: 145.6,
      hostTreasuryWallet: "0x98D32B6612Aa79d3B90E3c36B4136C9548E11aF3",
      lastAuditedAt: new Date(Date.now() - 7200000).toISOString(),
    });

    this.nodes.set("na-east", {
      id: "na-east",
      name: "North America Sovereign Safe Harbor Node",
      jurisdiction: "United States / Americas",
      dataCenterLocation: "Ashburn Tier-IV, Virginia, USA",
      complianceFramework: "US_PRIVACY",
      status: "ONLINE",
      uptimePct: 100.0,
      totalCitizenRecords: 1350,
      totalQueriesProcessed: 620,
      accumulatedHostYieldUsd: 248.0,
      pendingDisbursementUsd: 99.2,
      hostTreasuryWallet: "0x3aB8329E488dD55aC64673B8808169C5eC3884C1",
      lastAuditedAt: new Date(Date.now() - 10800000).toISOString(),
    });

    // Seed recent GovTech disbursements via SabiRevenueSplitter.sol
    this.disbursements.push(
      {
        txHash: "0x7c91a3204918eeb8391204859a0fbc92348a709214736f18902d34857b60e408",
        nodeId: "ng-west-africa",
        nodeName: "Nigeria & ECOWAS Sovereign Regional Node",
        amountUsd: 441.6,
        recipientWallet: "0x71C5A869C08D0a7479F224E8972E9D4791E82bE4",
        network: "Base Sepolia L2",
        smartContract: "0x3B997f74b62d85b1388E4B5d96f9C762c2f48C3b",
        timestamp: "2026-10-10T11:45:00Z",
        status: "CONFIRMED_ON_CHAIN",
      },
      {
        txHash: "0x12a9bc8394019284758eec1938501248596a710293847581029384756cbafe10",
        nodeId: "eu-central",
        nodeName: "EU Frankfurt Sovereign Partition Node",
        amountUsd: 218.4,
        recipientWallet: "0x98D32B6612Aa79d3B90E3c36B4136C9548E11aF3",
        network: "Base Sepolia L2",
        smartContract: "0x3B997f74b62d85b1388E4B5d96f9C762c2f48C3b",
        timestamp: "2026-10-11T16:20:00Z",
        status: "CONFIRMED_ON_CHAIN",
      }
    );

    // Seed National Credential Integrity & Fraud Radar logs
    this.fraudAlerts.push(
      {
        id: "frd_001",
        detectedAt: "2026-10-13T08:14:22Z",
        category: "DEGREE_FORGERY",
        severity: "CRITICAL",
        entityName: "Forged 'First Class' BSc Certificate - University of Ibadan",
        suspectCandidateId: "usr_suspect_8819",
        originNode: "ng-west-africa",
        description: "Altered graduate roll number detected. Seal signature mismatch with Registrar institutional public key.",
        actionTaken: "FLAGGED_AND_INTERCEPTED",
      },
      {
        id: "frd_002",
        detectedAt: "2026-10-12T19:30:11Z",
        category: "BALANCE_MANIPULATION",
        severity: "HIGH",
        entityName: "Fabricated Liquidity Statement - ₦45,000,000 sudden spike",
        suspectCandidateId: "usr_applicant_2091",
        originNode: "ng-west-africa",
        description: "Account balance surge 48 hours prior to visa filing without verified clearing institution trail.",
        actionTaken: "FLAGGED_AND_INTERCEPTED",
      },
      {
        id: "frd_003",
        detectedAt: "2026-10-11T14:10:05Z",
        category: "HASH_MISMATCH",
        severity: "CRITICAL",
        entityName: "Database Tamper Attempt on Employment Record",
        suspectCandidateId: "usr_candidate_7740",
        originNode: "eu-central",
        description: "Recomputed SHA-256 hash failed on-chain Base Sepolia verification. Candidate tenure had been inflated by 2 years.",
        actionTaken: "NOTARY_SEAL_REVOKED",
      }
    );
  }

  public listNodes(): SovereignNodeRecord[] {
    return Array.from(this.nodes.values());
  }

  public getNode(nodeId: string): SovereignNodeRecord | undefined {
    return this.nodes.get(nodeId);
  }

  public getDisbursements(): GovTechDisbursement[] {
    return [...this.disbursements];
  }

  public getFraudAlerts(): FraudRadarAlert[] {
    return [...this.fraudAlerts];
  }

  public executeDisbursement(nodeId: string): { success: boolean; disbursement?: GovTechDisbursement; error?: string } {
    const node = this.nodes.get(nodeId);
    if (!node) return { success: false, error: "Sovereign node not found." };
    if (node.pendingDisbursementUsd <= 0) return { success: false, error: "No pending balance for disbursement." };

    const amount = node.pendingDisbursementUsd;
    const txHash = `0x${randomBytes(32).toString("hex")}`;
    const disbursement: GovTechDisbursement = {
      txHash,
      nodeId: node.id,
      nodeName: node.name,
      amountUsd: Number(amount.toFixed(2)),
      recipientWallet: node.hostTreasuryWallet,
      network: "Base Sepolia L2",
      smartContract: "0x3B997f74b62d85b1388E4B5d96f9C762c2f48C3b",
      timestamp: new Date().toISOString(),
      status: "CONFIRMED_ON_CHAIN",
    };

    node.pendingDisbursementUsd = 0;
    this.nodes.set(node.id, node);
    this.disbursements.unshift(disbursement);

    return { success: true, disbursement };
  }
}

export const globalGovtStore = new SovereignGovtMasterStore();

