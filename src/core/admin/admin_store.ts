import { randomBytes } from "crypto";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  residenceCountry: string;
  sovereignNode: string;
  complianceFramework: "NDPC" | "GDPR" | "US_PRIVACY";
  status: "ACTIVE" | "FROZEN" | "PENDING_VERIFICATION";
  totalSyncedCategories: number;
  totalActiveKeys: number;
  createdAt: string;
}

export interface ManagedOrganization {
  id: string;
  name: string;
  type: "GOVERNMENT" | "ENTERPRISE" | "UNIVERSITY" | "BORDER_SECURITY";
  orgApiKey: string; // X-Sabi-Org-Key: sbo_live_...
  rateLimitPerMin: number;
  totalQueriesProcessed: number;
  status: "ACTIVE" | "SUSPENDED";
  webhookUrl?: string;
  jurisdiction: string;
  createdAt: string;
}

export interface GlobalTelemetry {
  totalUsersCount: number;
  totalOrganizationsCount: number;
  totalQueriesExecuted: number;
  totalPlatformRevenueUsd: number;
  totalSovereignPayoutUsd: number;
  activeSovereignNodesCount: number;
  fraudAlertsIntercepted: number;
}

class AdminMasterStore {
  private users: Map<string, ManagedUser> = new Map();
  private organizations: Map<string, ManagedOrganization> = new Map();
  private orgKeyIndex: Map<string, string> = new Map(); // orgApiKey => orgId

  private telemetry: GlobalTelemetry = {
    totalUsersCount: 1,
    totalOrganizationsCount: 3,
    totalQueriesExecuted: 1420,
    totalPlatformRevenueUsd: 852.0, // 60% of $1420
    totalSovereignPayoutUsd: 568.0, // 40% of $1420
    activeSovereignNodesCount: 3,
    fraudAlertsIntercepted: 14,
  };

  constructor() {
    // Seed initial citizen
    this.users.set("usr_chinwe_okafor_7721", {
      id: "usr_chinwe_okafor_7721",
      name: "Chinwe Okafor",
      email: "chinwe.okafor@example.com",
      residenceCountry: "NG",
      sovereignNode: "ng-west-africa",
      complianceFramework: "NDPC",
      status: "ACTIVE",
      totalSyncedCategories: 6,
      totalActiveKeys: 1,
      createdAt: "2026-08-14T09:00:00Z",
    });

    // Seed initial government & enterprise organizations
    this.createOrganization({
      id: "org_uk_visas",
      name: "UK Visas & Immigration Border Agency",
      type: "GOVERNMENT",
      rateLimitPerMin: 120,
      status: "ACTIVE",
      jurisdiction: "United Kingdom",
      webhookUrl: "https://visas.gov.uk/api/sabi-webhook",
    });

    this.createOrganization({
      id: "org_stripe_talent",
      name: "Stripe / Paystack Global Recruitment",
      type: "ENTERPRISE",
      rateLimitPerMin: 60,
      status: "ACTIVE",
      jurisdiction: "United States / Global",
      webhookUrl: "https://stripe.com/api/talent-webhook",
    });

    this.createOrganization({
      id: "org_unilag_admissions",
      name: "University of Lagos Postgraduate Admissions",
      type: "UNIVERSITY",
      rateLimitPerMin: 60,
      status: "ACTIVE",
      jurisdiction: "Nigeria / West Africa",
    });
  }

  // --- USER CRUD ---
  getAllUsers(): ManagedUser[] {
    return Array.from(this.users.values());
  }

  getUser(userId: string): ManagedUser | undefined {
    return this.users.get(userId);
  }

  updateUserStatus(userId: string, status: ManagedUser["status"]): ManagedUser | null {
    const user = this.users.get(userId);
    if (!user) return null;
    user.status = status;
    this.users.set(userId, user);
    return user;
  }

  // --- ORGANIZATION & GOVT CRUD ---
  getAllOrganizations(): ManagedOrganization[] {
    return Array.from(this.organizations.values());
  }

  createOrganization(
    data: Omit<ManagedOrganization, "id" | "orgApiKey" | "totalQueriesProcessed" | "createdAt"> & { id?: string }
  ): ManagedOrganization {
    const id = data.id || `org_${randomBytes(4).toString("hex")}`;
    const orgApiKey = `sbo_live_${randomBytes(16).toString("hex")}`;

    const newOrg: ManagedOrganization = {
      ...data,
      id,
      orgApiKey,
      totalQueriesProcessed: 0,
      createdAt: new Date().toISOString(),
    };

    this.organizations.set(id, newOrg);
    this.orgKeyIndex.set(orgApiKey, id);
    this.telemetry.totalOrganizationsCount = this.organizations.size;
    return newOrg;
  }

  verifyOrgApiKey(apiKey: string): { isValid: boolean; org?: ManagedOrganization } {
    const orgId = this.orgKeyIndex.get(apiKey);
    if (!orgId) return { isValid: false };
    const org = this.organizations.get(orgId);
    if (!org || org.status !== "ACTIVE") return { isValid: false };
    return { isValid: true, org };
  }

  recordQueryExecuted(queryFeeUsd: number = 1.0): void {
    this.telemetry.totalQueriesExecuted += 1;
    this.telemetry.totalPlatformRevenueUsd += queryFeeUsd * 0.6;
    this.telemetry.totalSovereignPayoutUsd += queryFeeUsd * 0.4;
  }

  getTelemetry(): GlobalTelemetry {
    return {
      ...this.telemetry,
      totalUsersCount: this.users.size,
      totalOrganizationsCount: this.organizations.size,
    };
  }
}

export const globalAdminStore = new AdminMasterStore();
