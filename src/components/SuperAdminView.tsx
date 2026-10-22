"use client";

import React, { useCallback, useEffect, useState } from "react";
import { LiveTelemetryMonitor } from "@/components/admin/LiveTelemetryMonitor";
import {
  Activity,
  AlertTriangle,
  Building2,
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Landmark,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings2,
  Shield,
  ShieldCheck,
  Snowflake,
  Sun,
  Users,
  X,
} from "lucide-react";

// ---------- Types mirrored from the API ----------

interface AdminUser {
  id: string;
  email: string;
  role: string;
  orgId: string | null;
  accountStatus: string;
  sovereignNode: string | null;
  residenceCountry: string | null;
  emailConfirmed: boolean;
  createdAt: string;
  lastSignInAt: string | null;
}

interface AdminOrg {
  id: string;
  name: string;
  type: string;
  rateLimitPerMin: number;
  status: "ACTIVE" | "SUSPENDED";
  jurisdiction: string;
  webhookUrl?: string;
  createdAt: string;
  source?: string;
}

interface ConfigEntry {
  key: string;
  label: string;
  description: string;
  category: "security" | "blockchain" | "ai" | "integrations" | "billing" | "nodes" | "seo" | "auth";
  sensitive: boolean;
  maskedValue: string;
  source: "dashboard" | "environment" | "default" | "unset";
  updatedAt: string | null;
  updatedBy: string | null;
}

const ROLES = ["citizen", "enterprise_admin", "notary", "govt_auditor", "super_admin"] as const;

const CATEGORY_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  auth: { label: "Google Auth & SSO", icon: KeyRound },
  security: { label: "Security and signing", icon: Shield },
  blockchain: { label: "Blockchain ledger", icon: Landmark },
  ai: { label: "AI gateways", icon: Activity },
  integrations: { label: "Cloud integrations", icon: Building2 },
  billing: { label: "Billing and fees", icon: KeyRound },
  nodes: { label: "Sovereign nodes", icon: GlobeIcon },
  seo: { label: "SEO, OpenGraph & Favicon", icon: Globe2 },
};

function GlobeIcon({ className }: { className?: string }) {
  return <Landmark className={className} />;
}

function sourceBadge(source: ConfigEntry["source"]) {
  switch (source) {
    case "dashboard":
      return "bg-emerald-100 text-emerald-700";
    case "environment":
      return "bg-slate-100 text-slate-600";
    case "default":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-red-100 text-red-600";
  }
}

function sourceLabel(source: ConfigEntry["source"]) {
  switch (source) {
    case "dashboard":
      return "Dashboard";
    case "environment":
      return "Env fallback";
    case "default":
      return "Default";
    default:
      return "Not set";
  }
}

export type AdminViewMode = "all" | "overview" | "users" | "organizations" | "config" | "telemetry";

interface SuperAdminViewProps {
  viewMode?: AdminViewMode;
}

export function SuperAdminView({ viewMode = "all" }: SuperAdminViewProps = {}) {
  // Data state
  const [telemetry, setTelemetry] = useState<any | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [config, setConfig] = useState<ConfigEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Action state
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [busyOrgId, setBusyOrgId] = useState<string | null>(null);

  // Register org modal
  const [showOrgModal, setShowOrgModal] = useState<boolean>(false);
  const [orgName, setOrgName] = useState<string>("");
  const [orgType, setOrgType] = useState<string>("ENTERPRISE");
  const [orgJurisdiction, setOrgJurisdiction] = useState<string>("");
  const [orgRateLimit, setOrgRateLimit] = useState<string>("60");
  const [orgWebhook, setOrgWebhook] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [issuedOrgKey, setIssuedOrgKey] = useState<{ name: string; key: string } | null>(null);
  const [copiedOrgKey, setCopiedOrgKey] = useState<boolean>(false);

  // Config edit modal
  const [editingKey, setEditingKey] = useState<ConfigEntry | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const flash = (message: string) => {
    setActionSuccess(message);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [telemetryRes, usersRes, orgsRes, configRes] = await Promise.all([
        fetch("/api/v1/admin/telemetry"),
        fetch("/api/v1/admin/users"),
        fetch("/api/v1/admin/orgs"),
        fetch("/api/v1/admin/config"),
      ]);

      if (telemetryRes.status === 401 || usersRes.status === 401) {
        setLoadError(
          "This account does not hold the super_admin role. Promote your account with scripts/promote_super_admin.mjs, then sign out and back in."
        );
        return;
      }

      if (telemetryRes.ok) setTelemetry(await telemetryRes.json());
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }
      if (orgsRes.ok) {
        const data = await orgsRes.json();
        setOrgs(data.organizations);
      }
      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data.config);
      }
    } catch {
      setLoadError("Network error while loading the control plane.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---------- User actions ----------

  const patchUser = async (userId: string, patch: { role?: string; status?: string }) => {
    setBusyUserId(userId);
    setActionError(null);
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "User update failed.");
        return;
      }
      setUsers((current) =>
        current.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: patch.role ?? u.role,
                accountStatus: patch.status ?? u.accountStatus,
              }
            : u
        )
      );
      flash("User claims updated. Applies on their next token refresh.");
    } catch {
      setActionError("Network error while updating the user.");
    } finally {
      setBusyUserId(null);
    }
  };

  // ---------- Org actions ----------

  const patchOrg = async (orgId: string, status: "ACTIVE" | "SUSPENDED") => {
    setBusyOrgId(orgId);
    setActionError(null);
    try {
      const res = await fetch("/api/v1/admin/orgs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Organization update failed.");
        return;
      }
      setOrgs((current) => current.map((o) => (o.id === orgId ? { ...o, status } : o)));
      flash(`Organization ${status === "ACTIVE" ? "activated" : "suspended"}. M2M keys ${status === "ACTIVE" ? "work" : "are rejected"} immediately.`);
    } catch {
      setActionError("Network error while updating the organization.");
    } finally {
      setBusyOrgId(null);
    }
  };

  const registerOrg = async () => {
    if (!orgName || !orgJurisdiction) return;
    setIsRegistering(true);
    setActionError(null);
    try {
      const res = await fetch("/api/v1/admin/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName,
          type: orgType,
          jurisdiction: orgJurisdiction,
          rateLimitPerMin: parseInt(orgRateLimit) || 60,
          webhookUrl: orgWebhook || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Organization registration failed.");
        return;
      }
      setIssuedOrgKey({ name: data.organization.name, key: data.organization.orgApiKey });
      setShowOrgModal(false);
      setOrgName("");
      setOrgJurisdiction("");
      setOrgWebhook("");
      await loadAll();
    } catch {
      setActionError("Network error while registering the organization.");
    } finally {
      setIsRegistering(false);
    }
  };

  // ---------- Config actions ----------

  const openConfigEditor = (entry: ConfigEntry) => {
    setEditingKey(entry);
    setEditValue("");
    setEditVisible(false);
    setConfigError(null);
  };

  const saveConfig = async () => {
    if (!editingKey || !editValue.trim()) return;
    setIsSavingConfig(true);
    setConfigError(null);
    try {
      const res = await fetch("/api/v1/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: editingKey.key, value: editValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfigError(data.error || "Failed to save configuration.");
        return;
      }
      setConfig(data.config);
      setEditingKey(null);
      flash(`${editingKey.label} updated. Hot-reloaded across all runtime consumers.`);
    } catch {
      setConfigError("Network error while saving configuration.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const resetConfig = async (entry: ConfigEntry) => {
    setActionError(null);
    try {
      const res = await fetch("/api/v1/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: entry.key, reset: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to reset configuration.");
        return;
      }
      await loadAll();
      flash(`${entry.label} reset to environment/default resolution.`);
    } catch {
      setActionError("Network error while resetting configuration.");
    }
  };

  const copyOrgKey = () => {
    if (!issuedOrgKey) return;
    navigator.clipboard.writeText(issuedOrgKey.key);
    setCopiedOrgKey(true);
    setTimeout(() => setCopiedOrgKey(false), 2000);
  };

  const sectionAnchor = "scroll-mt-24 lg:scroll-mt-8";
  const configCategories = ["auth", "security", "blockchain", "ai", "integrations", "billing", "nodes", "seo"];
  const summary = telemetry?.telemetry || {};
  const revenue = telemetry?.revenueModel || {};

  if (isLoading && users.length === 0 && config.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[104px] rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-6 py-14 text-center">
        <Shield className="h-8 w-8 text-amber-500" />
        <h2 className="mt-3 font-heading text-lg font-bold text-amber-900">Super admin access required</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-amber-800">{loadError}</p>
        <code className="mt-4 rounded-lg bg-white px-3 py-2 font-mono text-xs text-amber-900 ring-1 ring-amber-200">
          node scripts/promote_super_admin.mjs you@example.com
        </code>
        <button
          onClick={loadAll}
          className="mt-5 flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {(actionError || actionSuccess) && (
        <div
          className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-medium ${
            actionError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {actionError ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{actionError || actionSuccess}</span>
        </div>
      )}

      {/* ---- Overview ---- */}
      {(viewMode === "all" || viewMode === "overview") && (
      <section id="overview" className={sectionAnchor}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "System users", value: String(users.length), icon: Users },
            { label: "Organizations", value: String(orgs.length), icon: Building2 },
            {
              label: "Queries executed",
              value: (summary.totalQueriesExecuted ?? 0).toLocaleString(),
              icon: Activity,
            },
            {
              label: "Platform revenue",
              value: `$${(summary.totalPlatformRevenueUsd ?? 0).toLocaleString()}`,
              icon: Landmark,
            },
          ].map((metric, i) => (
            <div
              key={metric.label}
              className="clean-card dash-card-in space-y-1 rounded-2xl p-4"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {metric.label}
                </span>
                <metric.icon className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="block font-heading text-xl font-extrabold text-slate-900">
                {metric.value}
              </span>
            </div>
          ))}
        </div>

        <div className="clean-card mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <Landmark className="h-4 w-4 text-emerald-600" />
            <span>
              Revenue split: <strong className="text-slate-900">{revenue.platformSharePercent ?? 60}% platform</strong>{" "}
              / <strong className="text-slate-900">{revenue.sovereignHostSharePercent ?? 40}% sovereign host</strong>{" "}
              · query fee <strong className="text-slate-900">${revenue.standardQueryFeeUsd ?? "1.00"}</strong>
            </span>
          </div>
          <a href="#config" className="text-xs font-bold text-emerald-700 hover:underline">
            Adjust in billing config
          </a>
        </div>
      </section>
    )}

      {/* ---- Users ---- */}
      {(viewMode === "all" || viewMode === "users") && (
      <section id="users" className={sectionAnchor}>
        <div className="clean-card dash-card-in rounded-2xl p-6" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-slate-900">
              <Users className="h-4 w-4 text-emerald-600" />
              System users ({users.length})
            </h3>
            <button
              onClick={loadAll}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Node</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isFrozen = user.accountStatus === "FROZEN";
                  const isBusy = busyUserId === user.id;
                  return (
                    <tr key={user.id} className="transition-colors hover:bg-slate-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                            {(user.email || "?").charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{user.email}</p>
                            <p className="font-mono text-[10px] text-slate-400">
                              {user.id.substring(0, 14)}...
                              {!user.emailConfirmed && " · unconfirmed email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <select
                          value={user.role}
                          disabled={isBusy}
                          onChange={(e) => patchUser(user.id, { role: e.target.value })}
                          aria-label={`Role for ${user.email}`}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-emerald-500 disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold ${
                            isFrozen ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {user.accountStatus}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {user.sovereignNode || "-"}
                      </td>
                      <td className="p-3 text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() =>
                            patchUser(user.id, { status: isFrozen ? "ACTIVE" : "FROZEN" })
                          }
                          disabled={isBusy}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 ${
                            isFrozen
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                          }`}
                        >
                          {isBusy ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : isFrozen ? (
                            <Sun className="h-3 w-3" />
                          ) : (
                            <Snowflake className="h-3 w-3" />
                          )}
                          {isFrozen ? "Reactivate" : "Freeze"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-slate-400">
                      No user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )}

      {/* ---- Organizations ---- */}
      {(viewMode === "all" || viewMode === "organizations") && (
      <section id="organizations" className={sectionAnchor}>
        <div className="clean-card dash-card-in rounded-2xl p-6" style={{ animationDelay: "120ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-slate-900">
              <Building2 className="h-4 w-4 text-emerald-600" />
              Organizations ({orgs.length})
            </h3>
            <button
              onClick={() => setShowOrgModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              Register organization
            </button>
          </div>

          {issuedOrgKey && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <ShieldCheck className="h-4 w-4" />
                    {issuedOrgKey.name} registered. API key issued once:
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-800">
                    Store this key securely. Only its SHA-256 hash is kept on the node.
                  </p>
                </div>
                <button
                  onClick={() => setIssuedOrgKey(null)}
                  aria-label="Dismiss"
                  className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={copyOrgKey}
                className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg bg-slate-900 px-3 py-2 font-mono text-[11px] text-emerald-300 transition-colors hover:bg-slate-800"
                title="Copy API key"
              >
                <span className="truncate">{issuedOrgKey.key}</span>
                {copiedOrgKey ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                )}
              </button>
            </div>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <th className="p-3">Organization</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Jurisdiction</th>
                  <th className="p-3">Rate limit</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orgs.map((org) => {
                  const isSuspended = org.status === "SUSPENDED";
                  const isBusy = busyOrgId === org.id;
                  return (
                    <tr key={org.id} className="transition-colors hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-semibold text-slate-900">{org.name}</p>
                        <p className="font-mono text-[10px] text-slate-400">{org.id}</p>
                      </td>
                      <td className="p-3 text-slate-600">{org.type.replace(/_/g, " ")}</td>
                      <td className="p-3 text-slate-600">{org.jurisdiction}</td>
                      <td className="p-3 font-mono text-slate-600">{org.rateLimitPerMin}/min</td>
                      <td className="p-3">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                          {org.source || "registry"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold ${
                            isSuspended ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => patchOrg(org.id, isSuspended ? "ACTIVE" : "SUSPENDED")}
                          disabled={isBusy}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 ${
                            isSuspended
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600"
                          }`}
                        >
                          {isBusy && <RefreshCw className="h-3 w-3 animate-spin" />}
                          {isSuspended ? "Activate" : "Suspend"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {orgs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-slate-400">
                      No organizations registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )}

      {/* ---- Config keys ---- */}
      {(viewMode === "all" || viewMode === "config") && (
      <section id="config" className={sectionAnchor}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-slate-900">
              <Settings2 className="h-4 w-4 text-emerald-600" />
              Platform configuration
            </h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
              Every runtime key lives here, encrypted (AES-256-GCM) in the sovereign database and
              hot-reloaded on save. Only the Supabase connection keys remain in the server environment.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {configCategories.map((category, catIdx) => {
            const entries = config.filter((c) => c.category === category);
            if (entries.length === 0) return null;
            const meta = CATEGORY_META[category];
            return (
              <div
                key={category}
                className="clean-card dash-card-in rounded-2xl p-5"
                style={{ animationDelay: `${catIdx * 60}ms` }}
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <meta.icon className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {meta.label}
                  </h4>
                </div>
                <ul className="divide-y divide-slate-100">
                  {entries.map((entry) => (
                    <li key={entry.key} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{entry.label}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${sourceBadge(entry.source)}`}
                          >
                            {sourceLabel(entry.source)}
                          </span>
                          {entry.sensitive && (
                            <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                              Encrypted
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                          {entry.description}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-slate-600">
                          {entry.maskedValue || "not configured"}
                        </p>
                        {entry.source === "dashboard" && entry.updatedAt && (
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Updated {new Date(entry.updatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => openConfigEditor(entry)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition-all duration-200 hover:border-emerald-300 hover:text-emerald-700 active:scale-[0.97]"
                        >
                          <Pencil className="h-3 w-3" />
                          {entry.source === "unset" ? "Set" : "Edit"}
                        </button>
                        {entry.source === "dashboard" && (
                          <button
                            onClick={() => resetConfig(entry)}
                            title="Reset to environment/default"
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-400 transition-all duration-200 hover:border-amber-300 hover:text-amber-600 active:scale-[0.97]"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Reset
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    )}

      {/* ---- Live Telemetry Mission Control ---- */}
      {(viewMode === "all" || viewMode === "telemetry") && (
        <section id="telemetry" className={sectionAnchor}>
          <LiveTelemetryMonitor />
        </section>
      )}

      {/* ---- Register org modal ---- */}
      {showOrgModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={() => setShowOrgModal(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Register organization"
            className="relative w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            style={{ animation: "dashCardIn 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <button
              type="button"
              onClick={() => setShowOrgModal(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">Register organization</h3>
                <p className="text-xs text-slate-500">Issues an X-Sabi-Org-Key, disclosed once</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="org-name" className="mb-1.5 block font-semibold text-slate-700">
                  Organization name
                </label>
                <input
                  id="org-name"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. UK Visas and Immigration"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="org-type" className="mb-1.5 block font-semibold text-slate-700">
                    Type
                  </label>
                  <select
                    id="org-type"
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="ENTERPRISE">Enterprise</option>
                    <option value="GOVERNMENT">Government</option>
                    <option value="UNIVERSITY">University</option>
                    <option value="BORDER_SECURITY">Border security</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="org-rate" className="mb-1.5 block font-semibold text-slate-700">
                    Rate limit / min
                  </label>
                  <input
                    id="org-rate"
                    type="number"
                    value={orgRateLimit}
                    onChange={(e) => setOrgRateLimit(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="org-jurisdiction" className="mb-1.5 block font-semibold text-slate-700">
                  Jurisdiction
                </label>
                <input
                  id="org-jurisdiction"
                  type="text"
                  value={orgJurisdiction}
                  onChange={(e) => setOrgJurisdiction(e.target.value)}
                  placeholder="e.g. Nigeria / West Africa"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label htmlFor="org-webhook" className="mb-1.5 block font-semibold text-slate-700">
                  Webhook URL (optional)
                </label>
                <input
                  id="org-webhook"
                  type="url"
                  value={orgWebhook}
                  onChange={(e) => setOrgWebhook(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <button
                onClick={registerOrg}
                disabled={!orgName || !orgJurisdiction || isRegistering}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRegistering ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Register and issue key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Config edit modal ---- */}
      {editingKey && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={() => setEditingKey(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${editingKey.label}`}
            className="relative w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            style={{ animation: "dashCardIn 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <button
              type="button"
              onClick={() => setEditingKey(null)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Settings2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">{editingKey.label}</h3>
                <p className="font-mono text-[10px] text-slate-400">{editingKey.key}</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-500">{editingKey.description}</p>

            <div>
              <label htmlFor="config-value" className="mb-1.5 block text-xs font-semibold text-slate-700">
                New value
              </label>
              <div className="relative">
                <input
                  id="config-value"
                  type={editingKey.sensitive && !editVisible ? "password" : "text"}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={editingKey.maskedValue ? `Current: ${editingKey.maskedValue}` : "Enter value"}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 pr-10 font-mono text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                {editingKey.sensitive && (
                  <button
                    type="button"
                    onClick={() => setEditVisible((v) => !v)}
                    aria-label={editVisible ? "Hide value" : "Show value"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-700"
                  >
                    {editVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
                Stored AES-256-GCM encrypted in the sovereign database. Applies immediately to all
                runtime consumers without a redeploy.
              </p>
            </div>

            {configError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
                {configError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingKey(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={saveConfig}
                disabled={!editValue.trim() || isSavingConfig}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingConfig && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Save and hot-reload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
