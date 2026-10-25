import { randomBytes, createHash } from "crypto";
import { globalUserStore } from "@/core/vault/user_store";
import { profileAndAdvisorStore } from "@/core/vault/profile_store";
import { findConsularRoute } from "@/core/advisor/consular_routes_catalog";
import { auditFinancialForensics } from "@/core/advisor/financial_forensics";

export interface AgencyClientDossier {
  id: string;
  orgId: string;
  fullName: string;
  email: string;
  phone?: string;
  nationality: string;
  destinationCountry: string;
  targetRoute: string;
  passportNumber?: string;
  vaultId: string;
  status: "DRAFT" | "DOCS_PENDING" | "PRE_SCREEN_PASSED" | "FLAGGED_ACTION_NEEDED" | "HANDED_OVER";
  consularAuditSummary?: {
    verdict: "READY_TO_APPLY" | "BORDERLINE_RISK" | "HIGH_REFUSAL_PROBABILITY";
    healthGrade: "A" | "B" | "C" | "F";
    consecutiveHoldingSatisfied: boolean;
    suddenDepositDetected: boolean;
    shortfall: number;
    openChecklistCount: number;
    summary: string;
  };
  clientClaimToken?: string;
  handoverDispatchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

class AgencyClientService {
  private dossiers: Map<string, AgencyClientDossier> = new Map();

  constructor() {
    // Seed initial client for testing
    const seedId = "client_chinwe_okafor";
    const seedVaultId = "usr_chinwe_okafor_7721";
    this.dossiers.set(seedId, {
      id: seedId,
      orgId: "org_covenant_gate",
      fullName: "Chinwe Okafor",
      email: "chinwe.okafor@example.com",
      phone: "+234 803 123 4567",
      nationality: "Nigerian",
      destinationCountry: "United Kingdom",
      targetRoute: "Skilled Worker Visa",
      passportNumber: "A99281721",
      vaultId: seedVaultId,
      status: "PRE_SCREEN_PASSED",
      consularAuditSummary: {
        verdict: "READY_TO_APPLY",
        healthGrade: "A",
        consecutiveHoldingSatisfied: true,
        suddenDepositDetected: false,
        shortfall: 0,
        openChecklistCount: 0,
        summary: "UKVI Skilled Worker maintenance requirement (£1,270 for 28 consecutive days) satisfied with verified passport MRZ.",
      },
      createdAt: "2026-10-15T12:00:00Z",
      updatedAt: "2026-10-24T18:00:00Z",
    });
  }

  public listClients(orgId: string): AgencyClientDossier[] {
    const results: AgencyClientDossier[] = [];
    for (const d of Array.from(this.dossiers.values())) {
      if (d.orgId === orgId) {
        results.push(d);
      }
    }
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  }

  public getClient(id: string): AgencyClientDossier | undefined {
    return this.dossiers.get(id);
  }

  public createClientDossier(params: {
    orgId: string;
    fullName: string;
    email: string;
    phone?: string;
    nationality: string;
    destinationCountry: string;
    targetRoute: string;
    passportNumber?: string;
  }): AgencyClientDossier {
    const clientId = `client_${randomBytes(6).toString("hex")}`;
    const vaultId = `usr_${randomBytes(8).toString("hex")}`;

    // Initialize an isolated sovereign vault for the managed client
    globalUserStore.getVault(vaultId);

    // Initialize client profile and set target destination goal
    profileAndAdvisorStore.updateProfile(vaultId, {
      fullName: params.fullName,
      nationality: params.nationality,
      targetCountries: [params.destinationCountry],
      targetRoles: [params.targetRoute],
    });

    profileAndAdvisorStore.addOrUpdateGoal(vaultId, {
      title: `${params.destinationCountry} - ${params.targetRoute}`,
      type: "relocation",
      targetCountry: params.destinationCountry,
      targetDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
    });

    const dossier: AgencyClientDossier = {
      id: clientId,
      orgId: params.orgId,
      fullName: params.fullName,
      email: params.email,
      phone: params.phone,
      nationality: params.nationality,
      destinationCountry: params.destinationCountry,
      targetRoute: params.targetRoute,
      passportNumber: params.passportNumber,
      vaultId,
      status: "DOCS_PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.dossiers.set(clientId, dossier);
    return dossier;
  }

  public async runConsularPreScreen(clientId: string): Promise<AgencyClientDossier> {
    const dossier = this.dossiers.get(clientId);
    if (!dossier) throw new Error("Client dossier not found.");

    const audit = await profileAndAdvisorStore.runAdvisorAudit(dossier.vaultId);
    const forensics = audit.financialForensics;
    const checklist = audit.checklist || [];

    const openFlags = checklist.filter((c) => !c.isSatisfied).length;
    const verdict = audit.decisionVerdict || "BORDERLINE_RISK";

    let status: AgencyClientDossier["status"] = "PRE_SCREEN_PASSED";
    if (verdict === "HIGH_REFUSAL_PROBABILITY" || forensics?.financialHealthGrade === "F") {
      status = "FLAGGED_ACTION_NEEDED";
    } else if (openFlags > 2) {
      status = "DOCS_PENDING";
    }

    dossier.status = status;
    dossier.consularAuditSummary = {
      verdict,
      healthGrade: forensics?.financialHealthGrade || "C",
      consecutiveHoldingSatisfied: Boolean(forensics?.isConsecutiveRuleSatisfied),
      suddenDepositDetected: Boolean(forensics?.suddenDepositDetected),
      shortfall: forensics?.shortfallAmount || 0,
      openChecklistCount: openFlags,
      summary: forensics?.summary || "Consular audit executed against official immigration requirements.",
    };
    dossier.updatedAt = new Date().toISOString();

    return dossier;
  }

  public generateClientHandoverAccess(clientId: string): { inviteUrl: string; tempAccessKey: string } {
    const dossier = this.dossiers.get(clientId);
    if (!dossier) throw new Error("Client dossier not found.");

    const tempToken = `claim_${randomBytes(16).toString("hex")}`;
    dossier.clientClaimToken = tempToken;
    dossier.status = "HANDED_OVER";
    dossier.handoverDispatchedAt = new Date().toISOString();

    const inviteUrl = `https://www.sabiprofile.com/login?claimToken=${tempToken}&email=${encodeURIComponent(dossier.email)}`;

    return {
      inviteUrl,
      tempAccessKey: tempToken,
    };
  }
}

export const agencyClientService = new AgencyClientService();
