"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  FileUp,
  FileText,
  ShieldCheck,
  UploadCloud,
  Unlink,
  Loader2,
} from "lucide-react";
import { VaultCategory } from "@/types/vault";
import { ScanPipeline } from "./ScanPipeline";
import { CloudConnectModal } from "./CloudConnectModal";

const MAX_FILE_BYTES = 16 * 1024 * 1024; // 16 MB ephemeral processing cap

interface CloudIntegrationInfo {
  provider: "google_drive" | "dropbox";
  is_active: boolean;
  connected_at: string;
  drive_folder_id?: string | null;
}

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "auto_detect", label: "✨ Auto-Detect (AI Multi-Agent Classification)" },
  { value: "identification", label: "🪪 Personal IDs & Passports" },
  { value: "legal", label: "⚖️ MOUs, Contracts & Legal Instruments" },
  { value: "receipts", label: "🧾 Purchase Receipts & Invoices" },
  { value: "finance", label: "🏦 Finance & Bank Statements" },
  { value: "academics", label: "🎓 Academics & Transcripts" },
  { value: "experience", label: "💼 Experience & Employment" },
  { value: "certifications", label: "📜 Certifications & Licenses" },
  { value: "achievements", label: "🏆 Achievements & Awards" },
  { value: "portfolio", label: "🌐 Portfolio & Case Studies" },
];

interface SyncResult {
  documentName: string;
  category: VaultCategory;
  sha256Hash: string;
  verificationTier: number;
  onChainCommit?: { txHash: string; isSimulated: boolean; timestamp: number };
}

interface DocumentIntakeProps {
  /** Called after a successful sync so the parent can refresh vault data
   *  and switch to the affected category tab. */
  onSynced: (category: VaultCategory) => void;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Document intake panel: drag-and-drop or browse to push a document through
 * the real ephemeral pipeline (SHA-256, on-chain anchor, buffer zeroing),
 * plus entry points to link Google Drive / Dropbox via OAuth.
 */
export function DocumentIntake({ onSynced }: DocumentIntakeProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<string>("auto_detect");
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [activeFileName, setActiveFileName] = useState<string>("");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [cloudModal, setCloudModal] = useState<"google_drive" | "dropbox" | null>(null);
  const [integrations, setIntegrations] = useState<CloudIntegrationInfo[]>([]);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const refreshIntegrations = async () => {
    try {
      const res = await fetch("/api/v1/user/cloud-settings");
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations || []);
      }
    } catch {
      // Non-fatal
    }
  };

  useEffect(() => {
    refreshIntegrations();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("cloudConnected")) {
        refreshIntegrations();
      }
    }
  }, []);

  const handleDisconnectCloud = async (provider: "google_drive" | "dropbox") => {
    if (disconnecting) return;
    setDisconnecting(provider);
    try {
      const res = await fetch(`/api/v1/user/cloud-settings?provider=${provider}`, { method: "DELETE" });
      if (res.ok) {
        setIntegrations((prev) => prev.filter((i) => i.provider !== provider));
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || `Failed to disconnect ${provider}`);
      }
    } catch {
      setError(`Network error disconnecting ${provider}`);
    } finally {
      setDisconnecting(null);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    setError(null);
    setResult(null);

    if (file.size > MAX_FILE_BYTES) {
      setError(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The ephemeral pipeline accepts files up to 16 MB.`);
      return;
    }

    setUploading(true);
    setActiveFileName(file.name);

    try {
      // Use native multipart FormData to stream full-fidelity uncompressed binary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/v1/vault/sync", {
        method: "POST",
        body: formData,
      });

      const resText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(resText);
      } catch {
        setError(resText && resText.length < 250 ? resText : `Sync failed with server status ${res.status}.`);
        return;
      }

      if (!res.ok) {
        setError(data.details || data.error || `Document sync failed (${res.status}). Please try again.`);
        return;
      }

      setResult({
        documentName: data.documentName,
        category: data.category,
        sha256Hash: data.sha256Hash,
        verificationTier: data.verificationTier,
        onChainCommit: data.onChainCommit,
      });
      onSynced(data.category);
    } catch (err: any) {
      setError(err?.message ? `Upload failed: ${err.message}` : "Network error while syncing the document.");
    } finally {
      setUploading(false);
    }
  };

  const copyHash = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="clean-card rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-slate-900">
            <FileUp className="h-4 w-4 text-emerald-600" />
            Add documents
          </h2>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
            Upload a credential or link your cloud drive. Files are processed in memory only:
            hashed, anchored on-chain, then the buffer is zeroed. No raw file ever touches our servers.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          <ShieldCheck className="h-3 w-3" />
          Zero raw storage
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Upload column */}
        <div className="space-y-4 lg:col-span-3">
          <div>
            <label htmlFor="doc-category" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Document category
            </label>
            <select
              id="doc-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as VaultCategory)}
              disabled={uploading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropzone */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            disabled={uploading}
            className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200 disabled:cursor-not-allowed ${
              dragOver
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-emerald-50/40"
            }`}
            style={dragOver ? { animation: "scanDropPulse 0.9s ease-in-out infinite" } : undefined}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200 ${
                dragOver ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 ring-1 ring-slate-200"
              }`}
            >
              <UploadCloud className="h-6 w-6" />
            </span>
            <span className="mt-3 text-sm font-bold text-slate-900">
              {dragOver ? "Drop to scan and anchor" : "Drag a document here, or browse"}
            </span>
            <span className="mt-1 text-[11px] text-slate-500">
              PDF, image, or text up to 8 MB. Scanned, hashed, anchored. Never stored.
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-xs font-medium leading-relaxed text-red-700">{error}</p>
            </div>
          )}

          {/* Cloud linking */}
          <div className="flex items-center gap-3 pt-1">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              or link your cloud
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                { id: "google_drive" as const, name: "Google Drive", logo: "https://cdn.simpleicons.org/googledrive" },
                { id: "dropbox" as const, name: "Dropbox", logo: "https://cdn.simpleicons.org/dropbox" },
              ]
            ).map((p) => {
              const isConnected = integrations.some((i) => i.provider === p.id && i.is_active);
              const isBusy = disconnecting === p.id;

              return (
                <div
                  key={p.id}
                  className={`group relative flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                    isConnected
                      ? "border-emerald-200 bg-emerald-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors ${
                        isConnected
                          ? "bg-white ring-emerald-200 text-emerald-600 shadow-xs"
                          : "bg-slate-50 ring-slate-200 group-hover:bg-emerald-50 group-hover:ring-emerald-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.logo} alt="" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-bold text-slate-900">{p.name}</span>
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Connected & Vault Synced
                        </span>
                      ) : (
                        <span className="block text-[10px] font-medium text-slate-500">Not connected</span>
                      )}
                    </div>
                  </div>

                  <div>
                    {isConnected ? (
                      <button
                        type="button"
                        onClick={() => handleDisconnectCloud(p.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-red-600 transition-colors hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                        title={`Disconnect ${p.name}`}
                      >
                        {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlink className="h-3 w-3" />}
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCloudModal(p.id)}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 active:scale-95"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline / result column */}
        <div className="lg:col-span-2">
          {uploading || result ? (
            <div className="space-y-4">
              {(uploading || result) && (
                <ScanPipeline active={uploading} done={!!result} fileName={activeFileName} />
              )}
              {result && (
                <div
                  className="rounded-xl border border-emerald-200 bg-white p-4"
                  style={{ animation: "dashCardIn 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">{result.documentName}</p>
                      <p className="text-[10px] font-semibold capitalize text-emerald-700">
                        {result.category} · Tier {result.verificationTier}{" "}
                        {result.verificationTier === 2 ? "notarized" : "hashed"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={copyHash}
                      className="flex w-full items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2 font-mono text-[10px] text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-100"
                      title="Copy SHA-256"
                    >
                      <span className="truncate">{result.sha256Hash}</span>
                      {copied ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      )}
                    </button>
                    {result.onChainCommit && (
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2 ring-1 ring-slate-200">
                        <span className="font-mono text-[10px] text-slate-600">
                          tx {result.onChainCommit.txHash.substring(0, 18)}...
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            result.onChainCommit.isSimulated
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {result.onChainCommit.isSimulated ? "Testnet sim" : "On-chain"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-300 ring-1 ring-slate-200">
                <FileText className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                The scan pipeline appears here
              </p>
              <p className="mt-1 max-w-[220px] text-[11px] leading-relaxed text-slate-400">
                Watch each stage as your document is extracted, hashed, and anchored in real time.
              </p>
            </div>
          )}
        </div>
      </div>

      {cloudModal && (
        <CloudConnectModal
          provider={cloudModal}
          open={cloudModal !== null}
          onClose={() => {
            setCloudModal(null);
            refreshIntegrations();
          }}
        />
      )}
    </div>
  );
}
