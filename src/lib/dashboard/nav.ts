import { ShellNavItem } from "@/components/dashboard/DashboardShell";

export const NAV_BY_ROLE: Record<string, ShellNavItem[]> = {
  citizen: [
    { id: "overview", label: "Overview", href: "/dashboard" },
    { id: "profile", label: "Human profile", href: "/dashboard/profile" },
    { id: "niches", label: "Persona niches", href: "/dashboard/niches" },
    { id: "advisor", label: "Target advisor", href: "/dashboard/advisor" },
    { id: "documents", label: "Add documents", href: "/dashboard/documents" },
    { id: "vault", label: "Vault", href: "/dashboard/vault" },
    { id: "keys", label: "Scoped keys", href: "/dashboard/keys" },
    { id: "devices", label: "Devices & Security", href: "/dashboard/devices" },
    { id: "audit", label: "Audit trail", href: "/dashboard/audit" },
  ],
  enterprise_admin: [
    { id: "overview", label: "Overview", href: "/dashboard/enterprise" },
    { id: "organization", label: "Organization", href: "/dashboard/enterprise/organization" },
    { id: "rubrics", label: "Criteria studio", href: "/dashboard/enterprise/rubrics" },
    { id: "screening", label: "Screening", href: "/dashboard/enterprise/screening" },
  ],
  govt_auditor: [
    { id: "overview", label: "Overview", href: "/dashboard/government" },
    { id: "nodes", label: "Regional nodes", href: "/dashboard/government/nodes" },
    { id: "ledger", label: "Settlement ledger", href: "/dashboard/government/ledger" },
    { id: "fraud", label: "Fraud radar", href: "/dashboard/government/fraud" },
  ],
  super_admin: [
    { id: "overview", label: "Overview", href: "/dashboard/admin" },
    { id: "users", label: "System users", href: "/dashboard/admin/users" },
    { id: "organizations", label: "Organizations", href: "/dashboard/admin/organizations" },
    { id: "config", label: "Configuration", href: "/dashboard/admin/config" },
    { id: "telemetry", label: "Live Telemetry", href: "/dashboard/admin/telemetry" },
  ],
};

export const ROLE_HEADLINES: Record<string, { title: string; sub: string }> = {
  citizen: {
    title: "Your sovereign vault",
    sub: "Scan documents, mint scoped keys, and watch every access in real time.",
  },
  enterprise_admin: {
    title: "Screening workspace",
    sub: "Define grounding rubrics and evaluate candidates against on-chain proof.",
  },
  govt_auditor: {
    title: "Regional oversight",
    sub: "Data-residency telemetry, settlement ledger, and the national fraud radar.",
  },
  super_admin: {
    title: "Control plane",
    sub: "Manage users, organizations, live telemetry, and runtime configuration from one place.",
  },
};

