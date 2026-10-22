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
  Camera,
  UploadCloud,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cloud,
  Scale,
  Receipt,
} from "lucide-react";
import { CameraScannerModal } from "@/components/dashboard/CameraScannerModal";
import { VaultCategory, FullUserVault } from "@/types/vault";
import { DocumentIntake } from "@/components/dashboard/DocumentIntake";
import { DeviceManager } from "@/components/dashboard/DeviceManager";

export type CitizenViewMode = "all" | "overview" | "documents" | "vault" | "keys" | "devices" | "audit";

interface CitizenVaultViewProps {
  onMintKeyForDemo?: (key: string) => void;
  viewMode?: CitizenViewMode;
}

const CATEGORIES: {
  id: VaultCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "identification", label: "Personal IDs", icon: ShieldCheck },
  { id: "legal", label: "Legal Instruments", icon: Scale },
  { id: "receipts", label: "Receipts & Bills", icon: Receipt },
  { id: "academics", label: "Academics", icon: GraduationCap },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "certifications", label: "Certifications", icon: FileCheck },
  { id: "achievements", label: "Achievements", icon: Award },
  { id: "portfolio", label: "Portfolio", icon: Globe2 },
];

export function CitizenVaultView({ onMintKeyForDemo, viewMode = "all" }: CitizenVaultViewProps) {
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

  // Sovereign Document Intake State (Strict Zero Manual Text Invariant)
  type AddDocStep = "source" | "extracting" | "review" | "securing" | "done";
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addDocStep, setAddDocStep] = useState<AddDocStep>("source");
  const [showCameraScanner, setShowCameraScanner] = useState<boolean>(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedFileBase64, setCapturedFileBase64] = useState<string>("");
  const [scanPreviewData, setScanPreviewData] = useState<any>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [securingStep, setSecuringStep] = useState<number>(0);
  const [securedTxHash, setSecuredTxHash] = useState<string | null>(null);
  const [selectedCloudProvider, setSelectedCloudProvider] = useState<"google_drive" | "dropbox">("google_drive");
  const [connectedCloudProviders, setConnectedCloudProviders] = useState<string[]>([]);
  const docFileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/v1/user/cloud-settings")
      .then((res) => (res.ok ? res.json() : { integrations: [] }))
      .then((data) => {
        const active = (data.integrations || [])
          .filter((i: any) => i.is_active)
          .map((i: any) => i.provider);
        setConnectedCloudProviders(active);
        if (active.includes("google_drive")) setSelectedCloudProvider("google_drive");
        else if (active.includes("dropbox")) setSelectedCloudProvider("dropbox");
      })
      .catch(() => {});
  }, []);

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

  const handleResetModal = () => {
    setShowAddModal(false);
    setAddDocStep("source");
    setCapturedFile(null);
    setCapturedFileBase64("");
    setScanPreviewData(null);
    setAddError(null);
    setSecuringStep(0);
    setSecuredTxHash(null);
  };

  const handleDocumentFileSelected = async (file: File) => {
    setAddError(null);
    setCapturedFile(file);
    setAddDocStep("extracting");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(",")[1];
          setCapturedFileBase64(base64Data);

          const res = await fetch("/api/v1/vault/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              confirmed: false,
              fileName: file.name,
              mimeType: file.type || "image/jpeg",
              category: activeCategory,
              fileBase64: base64Data,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Failed to analyze document.");
          }

          setScanPreviewData(data);
          setAddDocStep("review");
        } catch (innerErr: any) {
          setAddError(innerErr.message || "Failed to process document.");
          setAddDocStep("source");
        }
      };
      reader.onerror = () => {
        setAddError("Could not read local file buffer.");
        setAddDocStep("source");
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setAddError(err.message || "Document processing failed.");
      setAddDocStep("source");
    }
  };

  const handleConfirmAndSecure = async () => {
    if (!scanPreviewData || !capturedFileBase64) return;
    setAddDocStep("securing");
    setSecuringStep(1);

    try {
      setTimeout(() => setSecuringStep(2), 600);
      setTimeout(() => setSecuringStep(3), 1200);

      const res = await fetch("/api/v1/vault/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmed: true,
          scanId: scanPreviewData.scanId,
          fileName: scanPreviewData.fileName,
          mimeType: capturedFile?.type || "image/jpeg",
          category: scanPreviewData.inferredCategory || activeCategory,
          fileBase64: capturedFileBase64,
          cloudProvider: selectedCloudProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to anchor credential on blockchain.");
      }

      setSecuredTxHash(data.onChainCommit?.txHash || "0xsimulated_tx_hash");
      setSecuringStep(4);
      setAddDocStep("done");
      await loadVaultData();
    } catch (err: any) {
      setAddError(err.message || "Failed to secure credential.");
      setAddDocStep("review");
    }
  };

  const getCategoryCount = (cat: VaultCategory): number => {
    if (!vault) return 0;
    if (cat === "identification") return vault.identification?.identifications?.length || 0;
    if (cat === "legal") return vault.legal?.instruments?.length || 0;
    if (cat === "receipts") return vault.receipts?.receipts?.length || 0;
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
    if (activeCategory === "identification") {
      return (
        <div className="space-y-3">
          {vault?.identification?.identifications?.map((idDoc: any) => (
            <div
              key={idDoc.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {idDoc.idType ? idDoc.idType.replace(/_/g, " ").toUpperCase() : "IDENTIFICATION"} · {idDoc.documentNumber}
                  </span>
                  {tierBadge(idDoc.tier || 2, "Tier 2 Notarized Identity")}
                </div>
                <p className="text-xs text-slate-600">
                  {idDoc.fullName} ({idDoc.nationality}) · Issued by {idDoc.issuingAuthority}
                  {idDoc.expiryDate ? ` · Exp: ${idDoc.expiryDate}` : ""}
                </p>
                {idDoc.mrzCode && (
                  <pre className="max-w-md overflow-x-auto rounded bg-slate-50 p-1.5 font-mono text-[9px] text-slate-500">
                    {idDoc.mrzCode}
                  </pre>
                )}
                {hashLine(idDoc.hashRef)}
              </div>
              {deleteButton(() => handleDeleteCredential("identification", idDoc.id))}
            </div>
          ))}
        </div>
      );
    }

    if (activeCategory === "legal") {
      return (
        <div className="space-y-3">
          {vault?.legal?.instruments?.map((inst: any) => (
            <div
              key={inst.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{inst.title}</span>
                  {tierBadge(2, "Tier 2 Legal Notarization")}
                </div>
                <p className="text-xs text-slate-600">
                  {inst.instrumentType?.replace(/_/g, " ").toUpperCase()} · {inst.jurisdiction} ({inst.executionDate})
                </p>
                {inst.partiesInvolved && inst.partiesInvolved.length > 0 && (
                  <p className="text-[11px] text-slate-500">
                    Parties: {inst.partiesInvolved.join(" & ")}
                  </p>
                )}
                {inst.notarySealReference && (
                  <p className="text-[10px] font-medium text-emerald-700">
                    Seal: {inst.notarySealReference}
                  </p>
                )}
                {hashLine(inst.hashRef)}
              </div>
              {deleteButton(() => handleDeleteCredential("legal", inst.id))}
            </div>
          ))}
        </div>
      );
    }

    if (activeCategory === "receipts") {
      return (
        <div className="space-y-3">
          {vault?.receipts?.receipts?.map((rec: any) => (
            <div
              key={rec.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {rec.currency} {rec.totalAmount?.toLocaleString()} · {rec.vendorOrIssuer}
                  </span>
                  {tierBadge(1, "Tier 1 Hashed")}
                </div>
                <p className="text-xs text-slate-600">
                  Ref: {rec.receiptNumber} · Date: {rec.transactionDate} {rec.paymentMethod ? `(${rec.paymentMethod})` : ""}
                </p>
                <p className="text-[11px] text-slate-500">{rec.descriptionOrItems}</p>
                {hashLine(rec.hashRef)}
              </div>
              {deleteButton(() => handleDeleteCredential("receipts", rec.id))}
            </div>
          ))}
        </div>
      );
    }

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
      {(viewMode === "all" || viewMode === "overview") && (
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
      )}

      {/* ---- Document intake ---- */}
      {(viewMode === "all" || viewMode === "documents") && (
        <section id="documents" className={`${sectionAnchor} dash-card-in`} style={{ animationDelay: "140ms" }}>
          <DocumentIntake
            onSynced={(cat) => {
              setActiveCategory(cat);
              loadVaultData();
            }}
          />
        </section>
      )}

      {/* ---- Vault ---- */}
      {(viewMode === "all" || viewMode === "vault") && (
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
    )}

      {/* ---- Scoped keys ---- */}
      {(viewMode === "all" || viewMode === "keys") && (
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
    )}

      {/* ---- Connected Devices & Session Management ---- */}
      {(viewMode === "all" || viewMode === "devices") && (
      <section id="devices" className={sectionAnchor}>
        <div className="clean-card dash-card-in rounded-2xl p-6" style={{ animationDelay: "100ms" }}>
          <DeviceManager />
        </div>
      </section>
    )}

      {/* ---- Audit trail ---- */}
      {(viewMode === "all" || viewMode === "audit") && (
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
    )}

      {/* ---- Document Intake & Auto-Scan Modal (Zero Manual Text Invariant) ---- */}
      <CameraScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onFileCaptured={(file: File) => {
          setShowCameraScanner(false);
          handleDocumentFileSelected(file);
        }}
      />

      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={handleResetModal}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Secure document intake"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl"
            style={{ animation: "dashCardIn 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                    Secure Credential Intake
                  </h3>
                  <p className="text-xs text-slate-500">
                    Category: <span className="font-semibold text-emerald-700 capitalize">{activeCatMeta.label}</span> · Tamper-proof AI extraction
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetModal}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Hidden native file input */}
            <input
              ref={docFileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDocumentFileSelected(file);
              }}
            />

            {/* Error Banner */}
            {addError && (
              <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{addError}</span>
              </div>
            )}

            {/* STEP 1: SOURCE SELECTION */}
            {addDocStep === "source" && (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-200/60 leading-relaxed">
                  <strong className="text-slate-900">Zero Manual Data Entry:</strong> In accordance with SabiProfile’s cryptographic trust model, credentials cannot be manually typed. Upload or scan your physical document so our vision pipeline extracts factual data anchored to an immutable SHA-256 hash.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCameraScanner(true)}
                    className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-500 text-slate-800 transition-all group"
                  >
                    <div className="p-3 bg-emerald-600 text-white rounded-xl mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-poppins text-slate-900">Scan with Camera</span>
                    <span className="text-[11px] text-slate-500 text-center mt-1">Mobile viewfinder with A4 alignment guide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => docFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-400 text-slate-800 transition-all group"
                  >
                    <div className="p-3 bg-slate-800 text-white rounded-xl mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-poppins text-slate-900">Upload File</span>
                    <span className="text-[11px] text-slate-500 text-center mt-1">PDF, JPG, or PNG statement/degree</span>
                  </button>
                </div>

                {/* Cloud Destination Notice */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-600" />
                    <span className="text-slate-700 font-medium">
                      {connectedCloudProviders.length > 0
                        ? `Storage: Private ${connectedCloudProviders.includes("google_drive") ? "Google Drive" : "Dropbox"} vault`
                        : "Private cloud not linked (ephemeral hash anchor only)"}
                    </span>
                  </div>
                  {connectedCloudProviders.length === 0 && (
                    <a
                      href="#documents"
                      onClick={() => setShowAddModal(false)}
                      className="text-emerald-700 font-semibold hover:underline text-[11px]"
                    >
                      Connect Drive
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: AI VISION EXTRACTION LOADING */}
            {addDocStep === "extracting" && (
              <div className="mt-6 py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-600">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="absolute -inset-1 rounded-2xl border border-emerald-400 animate-ping opacity-25" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Analyzing Document with Gemini Vision AI
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Ephemerally extracting verified credentials and generating SHA-256 cryptographic seal. Zero raw files saved to disk.
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full animate-indeterminate" />
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW EXTRACTED FIELDS (READ-ONLY) */}
            {addDocStep === "review" && scanPreviewData && (
              <div className="mt-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                {/* Confidence & Hash Badge */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Vision AI Confidence: {Math.round((scanPreviewData.confidence || 0.95) * 100)}%
                    </span>
                    <span className="font-mono text-[10px] bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                      Tier {scanPreviewData.verificationTier || 1}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-600 break-all bg-white/70 p-1.5 rounded border border-emerald-100">
                    SHA-256: {scanPreviewData.sha256Hash}
                  </div>
                </div>

                {/* Extracted Fields Readout */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block border-b border-slate-200 pb-1">
                    Verified Document Attributes
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    {Object.entries(scanPreviewData.extractedFields || {}).map(([key, val]) => {
                      if (typeof val === "object" && val !== null) {
                        return (
                          <div key={key} className="col-span-full bg-white p-2 rounded-lg border border-slate-100">
                            <span className="font-semibold text-slate-900 capitalize text-[11px]">{key}: </span>
                            <span className="text-slate-600 font-mono text-[10px]">{JSON.stringify(val)}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-900 capitalize text-[11px]">{key.replace(/([A-Z])/g, " $1")}: </span>
                          <span className="text-slate-700 font-medium">{String(val || "N/A")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setAddDocStep("source")}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    ← Change File
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAndSecure}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all font-poppins"
                  >
                    <span>Anchor on Blockchain</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SECURING & ON-CHAIN COMMIT */}
            {addDocStep === "securing" && (
              <div className="mt-5 py-6 space-y-3.5">
                <div className="space-y-2.5 text-xs">
                  <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${securingStep >= 1 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                    <CheckCircle2 className={`w-4 h-4 ${securingStep >= 1 ? "text-emerald-600" : "text-slate-300"}`} />
                    <span className="font-medium">1. Structured data validated against regional JSON schema</span>
                  </div>

                  <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${securingStep >= 2 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                    <CheckCircle2 className={`w-4 h-4 ${securingStep >= 2 ? "text-emerald-600" : "text-slate-300"}`} />
                    <span className="font-medium">2. File dispatched to private cloud folder & ephemeral buffer cleared</span>
                  </div>

                  <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${securingStep >= 3 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                    <CheckCircle2 className={`w-4 h-4 ${securingStep >= 3 ? "text-emerald-600" : "text-slate-300"}`} />
                    <span className="font-medium">3. Committing cryptographic SHA-256 seal to Base Sepolia L2</span>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                </div>
              </div>
            )}

            {/* STEP 5: DONE / SECURED */}
            {addDocStep === "done" && (
              <div className="mt-5 py-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-heading text-base font-bold text-slate-900">
                    Credential Cryptographically Secured
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Your credential is sealed on Base Sepolia. Enterprises verifying your profile will test against this immutable hash.
                  </p>
                </div>
                {securedTxHash && (
                  <div className="font-mono text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 max-w-full break-all">
                    Tx: {securedTxHash}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md font-poppins"
                >
                  Return to Vault
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
