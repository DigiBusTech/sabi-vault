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
  Sparkles,
  RefreshCw,
  Copy,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  History,
  Cloud,
  Check,
  ExternalLink,
} from "lucide-react";
import { VaultCategory, FullUserVault } from "@/types/vault";

interface CitizenVaultViewProps {
  onMintKeyForDemo?: (key: string) => void;
}

export function CitizenVaultView({ onMintKeyForDemo }: CitizenVaultViewProps) {
  const [vault, setVault] = useState<FullUserVault | null>(null);
  const [activeCategory, setActiveCategory] = useState<VaultCategory>("academics");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Scoped Keys State
  const [keysList, setKeysList] = useState<any[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<VaultCategory[]>([
    "academics",
    "finance",
  ]);
  const [keyTtlDays, setKeyTtlDays] = useState<number>(14);
  const [maxQueries, setMaxQueries] = useState<number>(5);
  const [keyLabel, setKeyLabel] = useState<string>("");
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Ephemeral Cloud Sync State
  const [cloudFileName, setCloudFileName] = useState<string>("");
  const [cloudCategory, setCloudCategory] = useState<VaultCategory>("certifications");
  const [cloudProvider, setCloudProvider] = useState<"google_drive" | "dropbox">("google_drive");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Manual Add Credential Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItemTitle, setNewItemTitle] = useState<string>("");
  const [newItemInstitution, setNewItemInstitution] = useState<string>("");
  const [newItemDetail, setNewItemDetail] = useState<string>("");

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Fetch data on load
  const loadVaultData = async () => {
    try {
      setIsLoading(true);
      const [vaultRes, keysRes, auditRes] = await Promise.all([
        fetch("/api/v1/vault/credentials"),
        fetch("/api/v1/vault/keys"),
        fetch("/api/v1/vault/audit-log"),
      ]);

      if (vaultRes.ok) {
        const data = await vaultRes.json();
        setVault(data.vault);
      }
      if (keysRes.ok) {
        const data = await keysRes.json();
        setKeysList(data.keys);
      }
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error("Failed to load vault data:", err);
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
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  // Mint new Scoped Key
  const handleMintKey = async () => {
    if (selectedScopes.length === 0) return;
    setIsMinting(true);
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
      }
    } catch (err) {
      console.error("Mint key failed:", err);
    } finally {
      setIsMinting(false);
    }
  };

  // Revoke Scoped Key
  const handleRevokeKey = async (keyId: string) => {
    try {
      const res = await fetch("/api/v1/vault/keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setKeysList(data.keys);
      }
    } catch (err) {
      console.error("Revoke key failed:", err);
    }
  };

  // Delete Credential Item
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

  // Run Ephemeral Cloud Sync
  const handleCloudSync = async () => {
    if (!cloudFileName) return;
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const res = await fetch("/api/v1/vault/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cloud_sync",
          fileName: cloudFileName,
          category: cloudCategory,
          provider: cloudProvider,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVault(data.vault);
        setSyncSuccessMsg(
          `Synced '${cloudFileName}' ephemerally: SHA-256 anchored, raw buffer zeroed in memory.`
        );
        setCloudFileName("");
        setTimeout(() => setSyncSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error("Cloud sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Add Manual Credential
  const handleAddManualCredential = async () => {
    if (!newItemTitle) return;
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
        body: JSON.stringify({
          category: activeCategory,
          itemData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVault(data.vault);
        setShowAddModal(false);
        setNewItemTitle("");
        setNewItemInstitution("");
        setNewItemDetail("");
      }
    } catch (err) {
      console.error("Add credential failed:", err);
    }
  };

  const getCategoryCount = (cat: VaultCategory): number => {
    if (!vault) return 0;
    if (cat === "academics") return vault.academics?.degrees?.length || 0;
    if (cat === "finance") return vault.finance?.bankRecords?.length || 0;
    if (cat === "experience") return vault.experience?.experiences?.length || 0;
    if (cat === "certifications") return vault.certifications?.certifications?.length || 0;
    if (cat === "achievements") return vault.achievements?.achievements?.length || 0;
    if (cat === "portfolio") return vault.portfolio?.publicLinks?.length || 1;
    return 0;
  };

  return (
    <div className="space-y-8">
      {/* Sovereign Header Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Sovereign Node Isolation
            </div>
            <div className="text-sm font-extrabold text-white">
              {vault?.sovereignNode || "ng-west-africa"}
            </div>
            <div className="text-[11px] text-slate-400">Strict NDPC Compliance • Zero Server PDFs</div>
          </div>
        </div>

        <div className="border border-cyan-500/30 bg-cyan-950/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
              Cryptographic Immutability
            </div>
            <div className="text-sm font-extrabold text-white">Base Sepolia L2 Ledger</div>
            <div className="text-[11px] text-slate-400">SHA-256 Notarized Hash Verification</div>
          </div>
        </div>

        <div className="border border-purple-500/30 bg-purple-950/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Key className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
              Active Scoped Keys
            </div>
            <div className="text-sm font-extrabold text-white">
              {keysList.filter((k) => k.status === "ACTIVE").length} Keys Active
            </div>
            <div className="text-[11px] text-slate-400">Time-Decaying & Quota Protected</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = 6 Category Manager, Right = Scoped Key Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Category Navigation & Credential CRUD */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Sovereign Credential Vault
                </h2>
                <p className="text-xs text-slate-400">
                  Organized into 6 standardized data categories. Zero raw files stored centrally.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Entry
                </button>
              </div>
            </div>

            {/* 6 Category Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(
                [
                  { id: "academics", label: "Academics", icon: GraduationCap },
                  { id: "finance", label: "Finance", icon: Wallet },
                  { id: "experience", label: "Experience", icon: Briefcase },
                  { id: "certifications", label: "Certs", icon: FileCheck },
                  { id: "portfolio", label: "Portfolio", icon: Globe2 },
                  { id: "achievements", label: "Awards", icon: Award },
                ] as const
              ).map((cat) => {
                const Icon = cat.icon;
                const count = getCategoryCount(cat.id as VaultCategory);
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as VaultCategory)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                    <span className="truncate w-full text-center">{cat.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Credential Items List for Active Category */}
            <div className="space-y-3 min-h-[220px]">
              {activeCategory === "academics" && (
                <div className="space-y-3">
                  {vault?.academics?.degrees?.map((deg: any) => (
                    <div
                      key={deg.id}
                      className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {deg.degreeType} {deg.fieldOfStudy}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              deg.tier === 2
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            Tier {deg.tier || 1} {deg.tier === 2 ? "Notarized" : "Hashed"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {deg.institution} • Class of {deg.graduationYear} (GPA: {deg.gpa}/{deg.maxGpa || 5.0})
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 truncate max-w-md">
                          SHA-256: {deg.hashRef || "Computed On-Chain"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCredential("academics", deg.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeCategory === "finance" && (
                <div className="space-y-3">
                  {vault?.finance?.bankRecords?.map((bank: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {bank.currency} {bank.currentLiquidBalance?.toLocaleString()} Liquid Funds
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Tier 1 Hashed
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {bank.institutionName} • 3-Mo Avg: {bank.currency}{" "}
                          {bank.averageThreeMonthBalance?.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 truncate max-w-md">
                          SHA-256: {bank.hashRef}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCredential("finance", bank.institutionName)}
                        className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeCategory === "experience" && (
                <div className="space-y-3">
                  {vault?.experience?.experiences?.map((exp: any) => (
                    <div
                      key={exp.id}
                      className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{exp.jobTitle}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Verified Tenure
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {exp.company} • {exp.employmentType} (Since {exp.startDate})
                        </p>
                        <p className="text-[11px] text-slate-400">{exp.responsibilities?.join(" • ")}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCredential("experience", exp.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeCategory === "certifications" && (
                <div className="space-y-3">
                  {vault?.certifications?.certifications?.map((cert: any) => (
                    <div
                      key={cert.id}
                      className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{cert.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Tier 1 Hashed
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Issued by {cert.issuingOrganization} ({cert.issueDate})
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 truncate max-w-md">
                          SHA-256: {cert.hashRef}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCredential("certifications", cert.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeCategory === "achievements" && (
                <div className="space-y-3">
                  {vault?.achievements?.achievements?.map((ach: any) => (
                    <div
                      key={ach.id}
                      className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{ach.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Award
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Issuer: {ach.issuer} ({ach.date})
                        </p>
                        <p className="text-[11px] text-slate-400">{ach.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCredential("achievements", ach.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeCategory === "portfolio" && (
                <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3">
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm">{vault?.portfolio?.headline}</span>
                    <p className="text-xs text-slate-300">{vault?.portfolio?.bio}</p>
                    <p className="text-[11px] text-slate-400 italic">
                      "{vault?.portfolio?.personalStatement}"
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {vault?.portfolio?.publicLinks?.map((link: any, idx: number) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ephemeral Cloud Sync Action Box */}
            <div className="border border-slate-800/80 bg-black/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  Ephemeral Cloud Sync (Zero Raw Storage Connector)
                </span>
                <span className="text-[10px] text-slate-400">OAuth Google Drive / Dropbox</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <input
                  type="text"
                  value={cloudFileName}
                  onChange={(e) => setCloudFileName(e.target.value)}
                  placeholder="e.g. Stanford_Machine_Learning_Certificate.pdf"
                  className="sm:col-span-6 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500"
                />
                <select
                  value={cloudCategory}
                  onChange={(e) => setCloudCategory(e.target.value as VaultCategory)}
                  className="sm:col-span-3 bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-slate-200 outline-none"
                >
                  <option value="certifications">Certifications</option>
                  <option value="academics">Academics</option>
                  <option value="finance">Finance</option>
                  <option value="achievements">Achievements</option>
                </select>
                <button
                  onClick={handleCloudSync}
                  disabled={isSyncing || !cloudFileName}
                  className="sm:col-span-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-lg px-3 py-2 flex items-center justify-center gap-1.5 transition-all"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {isSyncing ? "Parsing..." : "Stream & Anchor"}
                </button>
              </div>

              {syncSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{syncSuccessMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Citizen Privacy & Transparency Audit Ledger */}
          <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                Citizen Privacy & Transparency Ledger
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                Real-Time Access Audit
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Every time an enterprise, embassy, or AI agent evaluates your credentials via an API key, it is
              cryptographically logged here. Zero dark surveillance.
            </p>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.requestingOrg}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {log.orgType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{log.purpose}</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Scopes: {log.accessedScopes?.join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 space-y-0.5">
                    <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" />
                      Tamper-Free Verified
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleDateString()} •{" "}
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Scoped Key Minting & Active Keys Table */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key Generator Card */}
          <div className="border border-slate-800 bg-gradient-to-b from-slate-900 to-[#0c1220] rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Mint Scoped API Key</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Zero PDF Sharing
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Purpose / Label:</label>
                <input
                  type="text"
                  value={keyLabel}
                  onChange={(e) => setKeyLabel(e.target.value)}
                  placeholder="e.g. UK Tech Visa Officer Review"
                  className="w-full bg-black/60 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  1. Data Redaction (Allowed Scopes):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      "academics",
                      "finance",
                      "experience",
                      "certifications",
                      "portfolio",
                      "achievements",
                    ] as VaultCategory[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleScope(cat)}
                      className={`px-3 py-2 rounded-lg border text-left font-medium capitalize transition-all ${
                        selectedScopes.includes(cat)
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {selectedScopes.includes(cat) ? "✓ " : "+ "}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">2. Expiration (TTL):</label>
                  <select
                    value={keyTtlDays}
                    onChange={(e) => setKeyTtlDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value={1}>24 Hours</option>
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">3. Query Quota:</label>
                  <select
                    value={maxQueries}
                    onChange={(e) => setMaxQueries(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value={1}>1 (Single Use)</option>
                    <option value={5}>5 Queries</option>
                    <option value={10}>10 Queries</option>
                    <option value={20}>20 Queries</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleMintKey}
                disabled={isMinting || selectedScopes.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {isMinting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Mint Cryptographic Scoped Key
              </button>
            </div>
          </div>

          {/* Active Scoped Keys Management Table */}
          <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Active Scoped Keys ({keysList.length})
              </h3>
              <span className="text-[10px] text-slate-400">One-Click Revocation</span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {keysList.map((key) => {
                const isRevoked = key.status === "REVOKED";
                const isExpired = key.status === "EXPIRED";
                return (
                  <div
                    key={key.keyId}
                    className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                      isRevoked
                        ? "bg-red-950/20 border-red-900/40 opacity-70"
                        : isExpired
                        ? "bg-amber-950/20 border-amber-900/40"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs truncate max-w-[200px]">
                        {key.label || key.keyId}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          isRevoked
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : isExpired
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {key.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Queries: {key.remainingQueries}/{key.maxQueries} left
                      </span>
                      <span>
                        Expires: {new Date(key.expiresAt * 1000).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-2 bg-black/60 rounded-lg font-mono text-[10px] text-emerald-300 truncate select-all flex items-center justify-between">
                      <span className="truncate">{key.rawKey}</span>
                      <button
                        onClick={() => handleCopyKey(key.rawKey, key.keyId)}
                        className="text-slate-400 hover:text-white shrink-0 ml-2"
                        title="Copy Key"
                      >
                        {copiedKeyId === key.keyId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {key.allowedScopes?.map((s: string) => (
                          <span
                            key={s}
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {!isRevoked && (
                        <button
                          onClick={() => handleRevokeKey(key.keyId)}
                          className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline"
                        >
                          Revoke Key
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Add Credential Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border border-slate-800 bg-[#0c1220] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Add Entry to {activeCategory}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title / Degree / Position:</label>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="e.g. Master of Science in Data Engineering"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Institution / Employer / Issuing Body:
                </label>
                <input
                  type="text"
                  value={newItemInstitution}
                  onChange={(e) => setNewItemInstitution(e.target.value)}
                  placeholder="e.g. University of Edinburgh"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Details / Responsibilities:</label>
                <textarea
                  value={newItemDetail}
                  onChange={(e) => setNewItemDetail(e.target.value)}
                  placeholder="e.g. Specialization in distributed consensus algorithms..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualCredential}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                Anchor Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
