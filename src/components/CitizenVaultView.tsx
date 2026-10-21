"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Key,
  Database,
  GraduationCap,
  Wallet,
  Briefcase,
  FileCheck,
  Globe2,
  Award,
  RefreshCw,
  Copy,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  History,
  Check,
  ExternalLink,
  AlertTriangle,
  X,
  FileUp,
  Link2,
} from "lucide-react";
import { VaultCategory, FullUserVault } from "@/types/vault";
import { DocumentIntake } from "@/components/dashboard/DocumentIntake";
import { DeviceManager } from "@/components/dashboard/DeviceManager";

interface CitizenVaultViewProps {
  onMintKeyForDemo?: (key: string) => void;
}

const CATEGORIES: {
  id: VaultCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "academics", label: "Academics", icon: GraduationCap },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "certifications", label: "Certifications", icon: FileCheck },
  { id: "achievements", label: "Achievements", icon: Award },
  { id: "portfolio", label: "Portfolio", icon: Globe2 },
];

export function CitizenVaultView({ onMintKeyForDemo }: CitizenVaultViewProps) {
  const [vault, setVault] = useState<FullUserVault | null>(null);
  const [activeCategory, setActiveCategory] = useState<VaultCategory>("academics");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Scoped Keys State
  const [keysList, setKeysList] = useState<any[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<VaultCategory[]>(["academics", "finance"]);
  const [keyTtlDays, setKeyTtlDays] = useState<number>(14);
  const [maxQueries, setMaxQueries] = useState<number>(5);
  const [keyLabel, setKeyLabel] = useState<string>("");
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);

  // Manual Add Credential Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItemTitle, setNewItemTitle] = useState<string>("");
  const [newItemInstitution, setNewItemInstitution] = useState<string>("");
  const [newItemDetail, setNewItemDetail] = useState<string>("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const loadVaultData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [vaultRes, keysRes, auditRes] = await Promise.all([
        fetch("/api/v1/vault/credentials"),
        fetch("/api/v1/vault/keys"),
        fetch("/api/v1/vault/audit-log"),
      ]);

      if (vaultRes.ok) {
        const data = await vaultRes.json();
        setVault(data.vault);
      } else {
        setLoadError("Could not load your vault. Check your session and retry.");
      }
      if (keysRes.ok) {
        const data = await keysRes.json();
        setKeysList(data.keys);
      }
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data.auditLogs);
      }
    } catch {
      setLoadError("Network error while loading your vault.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVaultData();
  }, []);

  const handleCopyKey = (keyText: string, keyId: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleScope = (scope: VaultCategory) => {
    setSelectedScopes((current) =>
      current.includes(scope) ? current.filter((s) => s !== scope) : [...current, scope]
    );
  };

  const handleMintKey = async () => {
    if (selectedScopes.length === 0) return;
    setIsMinting(true);
    setMintError(null);
    try {
      const res = await fetch("/api/v1/vault/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedScopes: selectedScopes,
          ttlDays: keyTtlDays,
          maxQueries: maxQueries,
          label: keyLabel || `Scoped Key (${selectedScopes.join(", ")})`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setKeysList([data.key, ...keysList]);
        if (onMintKeyForDemo) onMintKeyForDemo(data.key.rawKey);
        setKeyLabel("");
      } else {
        setMintError(data.error || "Key minting failed.");
      }
    } catch {
      setMintError("Network error while minting the key.");
    } finally {
      setIsMinting(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      const res = await fetch("/api/v1/vault/keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      if (res.ok) {
        setKeysList((currentKeys) =>
          currentKeys.map((key) => (key.keyId === keyId ? { ...key, status: "REVOKED" } : key))
        );
      }
    } catch (err) {
      console.error("Revoke key failed:", err);
    }
  };

  const handleDeleteCredential = async (category: VaultCategory, itemId: string) => {
    try {
      const res = await fetch(`/api/v1/vault/credentials?category=${category}&itemId=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setVault(data.vault);
      }
    } catch (err) {
      console.error("Delete credential failed:", err);
    }
  };

  const handleAddManualCredential = async () => {
    if (!newItemTitle) return;
    setIsAdding(true);
    setAddError(null);
    try {
      let itemData: any = {};
      if (activeCategory === "academics") {
        itemData = {
          institution: newItemInstitution || "Institution",
          degreeType: "BSc",
          fieldOfStudy: newItemTitle,
          graduationYear: 2025,
          gpa: 4.5,
          maxGpa: 5.0,
          tier: 1,
        };
      } else if (activeCategory === "experience") {
        itemData = {
          company: newItemInstitution || "Enterprise",
          jobTitle: newItemTitle,
          employmentType: "Full-time",
          startDate: "2024-01-01",
          isCurrent: true,
          responsibilities: [newItemDetail || "Primary role responsibility"],
        };
      } else if (activeCategory === "certifications") {
        itemData = {
          title: newItemTitle,
          issuingOrganization: newItemInstitution || "Issuing Body",
          issueDate: new Date().toISOString().split("T")[0],
          tier: 1,
        };
      } else if (activeCategory === "achievements") {
        itemData = {
          title: newItemTitle,
          issuer: newItemInstitution || "Award Committee",
          date: new Date().toISOString().split("T")[0],
          description: newItemDetail || "Verified Achievement",
        };
      } else if (activeCategory === "finance") {
        itemData = {
          institutionName: newItemInstitution || "Commercial Bank",
          currency: "USD",
          currentLiquidBalance: 15000,
          averageThreeMonthBalance: 14200,
          statementPeriod: { from: "2026-06-01", to: "2026-09-01" },
          verifiedAt: new Date().toISOString(),
        };
      } else {
        itemData = {
          headline: newItemTitle,
          bio: newItemDetail,
        };
      }

      const res = await fetch("/api/v1/vault/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: activeCategory, itemData }),
      });
      const data = await res.json();
      if (res.ok) {
        setVault(data.vault);
        setShowAddModal(false);
        setNewItemTitle("");
        setNewItemInstitution("");
        setNewItemDetail("");
      } else {
        setAddError(data.error || "Could not add the record.");
      }
    } catch {
      setAddError("Network error while adding the record.");
    } finally {
      setIsAdding(false);
    }
  };

  const getCategoryCount = (cat: VaultCategory): number => {
    if (!vault) return 0;
    if (cat === "academics") return vault.academics?.degrees?.length || 0;
    if (cat === "finance") return vault.finance?.bankRecords?.length || 0;
    if (cat === "experience") return vault.experience?.experiences?.length || 0;
    if (cat === "certifications") return vault.certifications?.certifications?.length || 0;
    if (cat === "achievements") return vault.achievements?.achievements?.length || 0;
    if (cat === "portfolio") return vault.portfolio?.publicLinks?.length || 0;
    return 0;
  };

  const totalRecords = CATEGORIES.reduce((sum, c) => sum + getCategoryCount(c.id), 0);
  const activeKeys = keysList.filter((k) => k.status === "ACTIVE").length;

  const sectionAnchor = "scroll-mt-24 lg:scroll-mt-8";

  const deleteButton = (onClick: () => void) => (
    <button
      onClick={onClick}
      className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
      title="Delete entry"
      aria-label="Delete entry"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );

  const hashLine = (hashRef?: string) =>
    hashRef ? (
      <p className="max-w-md truncate font-mono text-[10px] text-slate-400">
        SHA-256: {hashRef}
      </p>
    ) : null;

  const tierBadge = (tier: number | undefined, label: string) => (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
        tier === 2
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
      }`}
    >
      {label}
    </span>
  );

  const renderCategoryBody = () => {
    if (activeCategory === "academics") {
      return (
        <div className="space-y-3">
          {vault?.academics?.degrees?.map((deg: any) => (
            <div
              key={deg.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {deg.degreeType} {deg.fieldOfStudy}
                  </span>
                  {tierBadge(deg.tier, `Tier ${deg.tier || 1} ${deg.tier === 2 ? "Notarized" : "Hashed"}`)}
                </div>
                <p className="text-xs text-slate-600">
                  {deg.institution} · Class of {deg.graduationYear} (GPA: {deg.gpa}/{deg.maxGpa || 5.0})
                </p>
                {hashLine(deg.hashRef)}
              </div>
              {deleteButton(() => handleDeleteCredential("academics", deg.id))}
            </div>
          ))}
        </div>
      );
    }

    if (activeCategory === "finance") {
      return (
        <div className="space-y-3">
          {vault?.finance?.bankRecords?.map((bank: any, idx: number) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {bank.currency} {bank.currentLiquidBalance?.toLocaleString()} liquid funds
                  </span>
                  {tierBadge(1, "Tier 1 Hashed")}
                </div>
                <p className="text-xs text-slate-600">
                  {bank.institutionName} · 3-mo avg: {bank.currency}{" "}
                  {bank.averageThreeMonthBalance?.toLocaleString()}
                </p>
                {hashLine(bank.hashRef)}
              </div>
              {deleteButton(() => handleDeleteCredential("finance", bank.institutionName))}
            </div>
          ))}
        </div>
      );
    }

    if (activeCategory === "experience") {
      return (
        <div className="space-y-3">
          {vault?.experience?.experiences?.map((exp: any) => (
            <div
              key={exp.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{exp.jobTitle}</span>
                  {tierBadge(1, "Verified tenure")}
                </div>
                <p className="text-xs text-slate-600">
                  {exp.company} · {exp.employmentType} (since {exp.startDate})
                </p>
                <p className="text-[11px] text-slate-500">{exp.responsibilities?.join(" · ")}</p>
              </div>
              {deleteButton(() => handleDeleteCredential("experience", exp.id))}
            </div>
          ))}
        </div>
      );
    }

    if (activeCategory === "certifications") {
      return (
        <div className="space-y-3">
          {vault?.certifications?.certifications?.map((cert: any) => (
            <div
              key={cert.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{cert.title}</span>
                  {tierBadge(cert.tier, `Tier ${cert.tier || 1} Hashed`)}
                </div>
                <p className="text-xs text-slate-600">
                  Issued by {cert.issuingOrganization} ({cert.issueDate})
                </p>
                {hashLine(cert.hashRef)}
              </div>
              {deleteButton(() => handleDeleteCredential("certifications", cert.id))}
            </div>
          ))}
        </div>
      );
    }

    if (activeCategory === "achievements") {
      return (
        <div className="space-y-3">
          {vault?.achievements?.achievements?.map((ach: any) => (
            <div
              key={ach.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{ach.title}</span>
                  {tierBadge(1, "Award")}
                </div>
                <p className="text-xs text-slate-600">
                  Issuer: {ach.issuer} ({ach.date})
                </p>
                <p className="text-[11px] text-slate-500">{ach.description}</p>
              </div>
              {deleteButton(() => handleDeleteCredential("achievements", ach.id))}
            </div>
          ))}
        </div>
      );
    }

    // portfolio
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {vault?.portfolio?.headline ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-sm font-bold text-slate-900">{vault.portfolio.headline}</span>
              <p className="text-xs text-slate-600">{vault.portfolio.bio}</p>
              {vault.portfolio.personalStatement && (
                <p className="text-[11px] italic text-slate-500">
                  &ldquo;{vault.portfolio.personalStatement}&rdquo;
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {vault.portfolio.publicLinks?.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No public portfolio profile yet. Add one to give verifiers context beyond documents.
          </p>
        )}
      </div>
    );
  };

  const activeCatMeta = CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <div className="space-y-10">
      {/* ---- Overview ---- */}
      <section id="overview" className={sectionAnchor}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              label: "Sovereign node",
              value: vault?.sovereignNode || "ng-west-africa",
              sub: "NDPC compliant · zero server PDFs",
            },
            {
              icon: Lock,
              label: "Immutability layer",
              value: "Base Sepolia L2",
              sub: "SHA-256 hash verification",
            },
            {
              icon: Key,
              label: "Active scoped keys",
              value: `${activeKeys} key${activeKeys === 1 ? "" : "s"}`,
              sub: `${totalRecords} records in vault`,
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="clean-card dash-card-in flex items-center gap-3.5 rounded-2xl p-4"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <stat.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {stat.label}
                </p>
                <p className="truncate text-sm font-extrabold text-slate-900">{stat.value}</p>
                <p className="text-[11px] text-slate-500">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Document intake ---- */}
      <section id="documents" className={`${sectionAnchor} dash-card-in`} style={{ animationDelay: "140ms" }}>
        <DocumentIntake
          onSynced={(cat) => {
            setActiveCategory(cat);
            loadVaultData();
          }}
        />
      </section>

      {/* ---- Vault ---- */}
      <section id="vault" className={`${sectionAnchor} dash-card-in`} style={{ animationDelay: "200ms" }}>
        <div className="clean-card rounded-2xl p-6">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 font-heading text-base font-bold text-slate-900">
                <Database className="h-4 w-4 text-emerald-600" />
                Sovereign credential vault
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Six standardized categories. Structured JSON only; raw files never leave your device cloud.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add manually
            </button>
          </div>

          {/* Category tabs */}
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Vault categories">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                  <span
                    className={`rounded-full px-1.5 py-px text-[9px] font-bold ${
                      isActive ? "bg-white/15 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category body */}
          <div className="mt-4 min-h-[160px]">
            {isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-[74px] rounded-xl" />
                ))}
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="mt-2 text-sm font-semibold text-red-700">{loadError}</p>
                <button
                  onClick={loadVaultData}
                  className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            ) : getCategoryCount(activeCategory) === 0 && activeCategory !== "portfolio" ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-300 ring-1 ring-slate-200">
                  <activeCatMeta.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-700">
                  No {activeCatMeta.label.toLowerCase()} records yet
                </p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                  Upload a document above and it will be hashed, anchored, and structured into this
                  category automatically.
                </p>
                <a
                  href="#documents"
                  className="mt-4 flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98]"
                >
                  <FileUp className="h-3.5 w-3.5" />
                  Add a document
                </a>
              </div>
            ) : (
              renderCategoryBody()
            )}
          </div>
        </div>
      </section>

      {/* ---- Scoped keys ---- */}
      <section id="keys" className={sectionAnchor}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Mint panel */}
          <div className="clean-card dash-card-in rounded-2xl p-6 lg:col-span-5" style={{ animationDelay: "80ms" }}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-slate-900">
                <Key className="h-4 w-4 text-emerald-600" />
                Mint scoped API key
              </h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                Zero PDF sharing
              </span>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label htmlFor="key-label" className="mb-1.5 block font-semibold text-slate-700">
                  Purpose / label
                </label>
                <input
                  id="key-label"
                  type="text"
                  value={keyLabel}
                  onChange={(e) => setKeyLabel(e.target.value)}
                  placeholder="e.g. UK Tech Visa Officer Review"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <span className="mb-2 block font-semibold text-slate-700">
                  1. Data redaction (allowed scopes)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const selected = selectedScopes.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleScope(cat.id)}
                        aria-pressed={selected}
                        className={`rounded-lg border px-3 py-2 text-left font-medium capitalize transition-all duration-200 active:scale-[0.98] ${
                          selected
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {selected ? "\u2713 " : "+ "}
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="key-ttl" className="mb-1.5 block font-semibold text-slate-700">
                    2. Expiration
                  </label>
                  <select
                    id="key-ttl"
                    value={keyTtlDays}
                    onChange={(e) => setKeyTtlDays(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value={1}>24 hours</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="key-quota" className="mb-1.5 block font-semibold text-slate-700">
                    3. Query quota
                  </label>
                  <select
                    id="key-quota"
                    value={maxQueries}
                    onChange={(e) => setMaxQueries(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value={1}>1 (single use)</option>
                    <option value={5}>5 queries</option>
                    <option value={10}>10 queries</option>
                    <option value={20}>20 queries</option>
                  </select>
                </div>
              </div>

              {mintError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 font-medium text-red-700">
                  {mintError}
                </div>
              )}

              <button
                onClick={handleMintKey}
                disabled={isMinting || selectedScopes.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isMinting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Mint cryptographic scoped key
              </button>
            </div>
          </div>

          {/* Active keys */}
          <div className="clean-card dash-card-in rounded-2xl p-6 lg:col-span-7" style={{ animationDelay: "140ms" }}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-slate-900">
                <Lock className="h-4 w-4 text-emerald-600" />
                Scoped keys ({keysList.length})
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">One-click revocation</span>
            </div>

            <div className="mt-4 max-h-[380px] space-y-3 overflow-y-auto pr-1">
              {keysList.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-300 ring-1 ring-slate-200">
                    <Key className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-700">No keys minted yet</p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                    Mint a scoped key to let an employer, embassy, or school query exactly the
                    categories you choose. Nothing else.
                  </p>
                </div>
              )}

              {keysList.map((key) => {
                const isRevoked = key.status === "REVOKED";
                const isExpired = key.status === "EXPIRED";
                return (
                  <div
                    key={key.keyId}
                    className={`space-y-2.5 rounded-xl border p-3.5 transition-all duration-200 ${
                      isRevoked
                        ? "border-red-200 bg-red-50/40 opacity-70"
                        : isExpired
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="max-w-[220px] truncate text-xs font-bold text-slate-900">
                        {key.label || key.keyId}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-extrabold ${
                          isRevoked
                            ? "bg-red-100 text-red-600"
                            : isExpired
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {key.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Queries: {key.remainingQueries}/{key.maxQueries} left
                      </span>
                      <span>Expires: {new Date(key.expiresAt * 1000).toLocaleDateString()}</span>
                    </div>

                    {key.rawKey ? (
                      <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2 font-mono text-[10px] text-emerald-300">
                        <span className="truncate select-all">{key.rawKey}</span>
                        <button
                          onClick={() => handleCopyKey(key.rawKey, key.keyId)}
                          className="ml-2 shrink-0 text-slate-400 transition-colors hover:text-white"
                          title="Copy key"
                          aria-label="Copy key"
                        >
                          {copiedKeyId === key.keyId ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <p className="rounded-lg bg-slate-50 p-2 font-mono text-[10px] text-slate-400 ring-1 ring-slate-200">
                        {key.keyId} · secret shown only once at creation
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex flex-wrap gap-1">
                        {key.allowedScopes?.map((s: string) => (
                          <span
                            key={s}
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      {!isRevoked && (
                        <button
                          onClick={() => handleRevokeKey(key.keyId)}
                          className="text-[10px] font-bold text-red-500 transition-colors hover:text-red-700 hover:underline"
                        >
                          Revoke key
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Connected Devices & Session Management ---- */}
      <section id="devices" className={sectionAnchor}>
        <div className="clean-card dash-card-in rounded-2xl p-6" style={{ animationDelay: "100ms" }}>
          <DeviceManager />
        </div>
      </section>

      {/* ---- Audit trail ---- */}
      <section id="audit" className={sectionAnchor}>
        <div className="clean-card dash-card-in rounded-2xl p-6" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-slate-900">
              <History className="h-4 w-4 text-emerald-600" />
              Privacy and transparency ledger
            </h3>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              Real-time access audit
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Every time an enterprise, embassy, or AI agent evaluates your credentials via an API key,
            it is cryptographically logged here. Zero dark surveillance.
          </p>

          <div className="mt-4 max-h-[260px] space-y-2.5 overflow-y-auto pr-1">
            {auditLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-300 ring-1 ring-slate-200">
                  <History className="h-4 w-4" />
                </span>
                <p className="mt-3 text-xs font-semibold text-slate-500">No access events yet</p>
                <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-400">
                  When a verifier queries your vault with a scoped key, the event appears here instantly.
                </p>
              </div>
            )}

            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs transition-all duration-200 hover:border-slate-300 sm:flex-row sm:items-center"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.requestingOrg}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-600">
                      {log.orgType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{log.purpose}</p>
                  <span className="font-mono text-[10px] text-slate-400">
                    Scopes: {log.accessedScopes?.join(", ")}
                  </span>
                </div>

                <div className="shrink-0 space-y-0.5 text-left sm:text-right">
                  <div className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <Check className="h-3 w-3" />
                    Tamper-free verified
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleDateString()} ·{" "}
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Manual add modal ---- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={() => setShowAddModal(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add record manually"
            className="relative w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            style={{ animation: "dashCardIn 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Link2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Add {activeCatMeta.label.toLowerCase()} record
                </h3>
                <p className="text-xs text-slate-500">Manually structured entry, Tier 1 hashed</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="manual-title" className="mb-1.5 block font-semibold text-slate-700">
                  Title
                </label>
                <input
                  id="manual-title"
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="e.g. BSc Computer Science"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label htmlFor="manual-institution" className="mb-1.5 block font-semibold text-slate-700">
                  Institution / issuer
                </label>
                <input
                  id="manual-institution"
                  type="text"
                  value={newItemInstitution}
                  onChange={(e) => setNewItemInstitution(e.target.value)}
                  placeholder="e.g. University of Lagos"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label htmlFor="manual-detail" className="mb-1.5 block font-semibold text-slate-700">
                  Detail (optional)
                </label>
                <textarea
                  id="manual-detail"
                  value={newItemDetail}
                  onChange={(e) => setNewItemDetail(e.target.value)}
                  rows={3}
                  placeholder="Short supporting detail"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {addError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 font-medium text-red-700">
                  {addError}
                </div>
              )}

              <button
                onClick={handleAddManualCredential}
                disabled={!newItemTitle || isAdding}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAdding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Add to vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
