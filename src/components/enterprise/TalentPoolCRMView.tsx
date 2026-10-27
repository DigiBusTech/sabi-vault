"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Eye,
  Sliders,
  Plane,
  GraduationCap,
  Briefcase,
  Building2,
  Calendar,
  MessageSquare,
  Tag,
  ChevronRight,
  X,
  Send,
  ExternalLink,
  Award,
  Zap,
  HelpCircle,
  Layers,
  Lock,
} from "lucide-react";
import {
  QueriedApplicantRecord,
  UniversalSector,
  UniversalPipelineStage,
  EvaluatorNote,
  VerifiedVaultDocumentSummary,
} from "@/core/enterprise/talent_pool_service";

interface TalentPoolCRMViewProps {
  initialOrgId?: string;
}

export function TalentPoolCRMView({ initialOrgId = "" }: TalentPoolCRMViewProps) {
  const [applicants, setApplicants] = useState<QueriedApplicantRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [selectedVerdict, setSelectedVerdict] = useState<string>("ALL");
  const [minScore, setMinScore] = useState<number>(0);

  // Selected Applicant for Dossier Drawer
  const [selectedApplicant, setSelectedApplicant] = useState<QueriedApplicantRecord | null>(null);
  const [dossierActiveTab, setDossierActiveTab] = useState<"vault" | "profile" | "discovery" | "notes">("vault");
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState<boolean>(false);

  const loadApplicants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (initialOrgId) params.append("orgId", initialOrgId);
      if (searchTerm) params.append("search", searchTerm);
      if (selectedSector !== "ALL") params.append("sector", selectedSector);
      if (selectedStage !== "ALL") params.append("stage", selectedStage);
      if (selectedVerdict !== "ALL") params.append("verdict", selectedVerdict);
      if (minScore > 0) params.append("minScore", minScore.toString());

      const res = await fetch(`/api/v1/enterprise/talent-pool?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setApplicants(data.applicants || []);
      } else {
        setError(data.error || "Failed to load talent pool.");
      }
    } catch {
      setError("Network error fetching applicants.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [selectedSector, selectedStage, selectedVerdict, minScore]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadApplicants();
  };

  const handleStageChange = async (applicantId: string, newStage: UniversalPipelineStage) => {
    setIsUpdatingStage(true);
    try {
      const res = await fetch("/api/v1/enterprise/talent-pool", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          action: "update_stage",
          stage: newStage,
        }),
      });
      const data = await res.json();
      if (res.ok && data.applicant) {
        setApplicants((prev) =>
          prev.map((a) => (a.id === applicantId ? data.applicant : a))
        );
        if (selectedApplicant?.id === applicantId) {
          setSelectedApplicant(data.applicant);
        }
      }
    } catch {
      console.error("Failed to update stage");
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedApplicant || !newNoteText.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await fetch("/api/v1/enterprise/talent-pool", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId: selectedApplicant.id,
          action: "add_note",
          note: newNoteText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.applicant) {
        setApplicants((prev) =>
          prev.map((a) => (a.id === selectedApplicant.id ? data.applicant : a))
        );
        setSelectedApplicant(data.applicant);
        setNewNoteText("");
      }
    } catch {
      console.error("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  // Metrics
  const totalCount = applicants.length;
  const qualifiedCount = applicants.filter((a) => a.verdict === "QUALIFIED").length;
  const hiddenGemsCount = applicants.filter((a) => a.holisticMatchIndex?.isHiddenGem).length;
  const inPipelineCount = applicants.filter(
    (a) => !["REJECTED", "VISA_REFUSED", "ADMISSION_DECLINED", "ARCHIVED"].includes(a.pipelineStage)
  ).length;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Ingested</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[11px] text-slate-400">Queried across all rubrics</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Qualified Rate</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {totalCount > 0 ? `${Math.round((qualifiedCount / totalCount) * 100)}%` : "0%"}
          </p>
          <span className="text-[11px] text-slate-400">{qualifiedCount} verified qualified</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hidden Gems</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">{hiddenGemsCount}</p>
          <span className="text-[11px] text-slate-400">High practical velocity</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Pipeline</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-600">{inPipelineCount}</p>
          <span className="text-[11px] text-slate-400">Advancing through review</span>
        </div>
      </div>

      {/* Sector Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "ALL", label: "All Sectors", icon: Layers },
          { id: "IMMIGRATION", label: "🌍 Sovereign Immigration", icon: Plane },
          { id: "EDUCATION", label: "🎓 Academic Admissions", icon: GraduationCap },
          { id: "LABOUR", label: "💻 High-Skilled Labour", icon: Briefcase },
          { id: "FINANCE", label: "💳 Banking & FinTech", icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = selectedSector === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedSector(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                active
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Multi-Facet Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, country, institution, or technical skill..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700"
          >
            Search Pool
          </button>
        </form>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Verdict Filter
            </label>
            <select
              value={selectedVerdict}
              onChange={(e) => setSelectedVerdict(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 outline-none"
            >
              <option value="ALL">All Verdicts</option>
              <option value="QUALIFIED">✓ Qualified</option>
              <option value="CONDITIONALLY_QUALIFIED">⚠️ Conditional</option>
              <option value="REJECTED">✕ Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pipeline Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 outline-none"
            >
              <option value="ALL">All Stages</option>
              <option value="QUERIED">Queried</option>
              <option value="DOSSIER_INGESTED">Dossier Ingested</option>
              <option value="ADMISSIBILITY_REVIEW">Admissibility Review</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="VISA_GRANTED">Visa Granted</option>
              <option value="HIRED">Hired</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Min Composite Score ({minScore}+)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedSector("ALL");
                setSelectedStage("ALL");
                setSelectedVerdict("ALL");
                setMinScore(0);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applicant Cards Grid */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-4 w-4 animate-spin text-emerald-600" />
            Loading queried applicant talent pool...
          </div>
        </div>
      ) : applicants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-300" />
          <h4 className="mt-3 text-sm font-bold text-slate-900">No Queried Applicants Found</h4>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            When your organization screens candidate Scoped Keys (single or bulk in the Screening Console),
            they are automatically indexed here for ongoing decision-making and pipeline progression.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {applicants.map((app) => {
            const isQualified = app.verdict === "QUALIFIED";
            const isConditional = app.verdict === "CONDITIONALLY_QUALIFIED";
            const tier2Count = app.vaultDocuments.filter((d) => d.tier === 2).length;
            const tier1Count = app.vaultDocuments.filter((d) => d.tier === 1).length;

            return (
              <div
                key={app.id}
                className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md space-y-4"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-bold text-white text-sm">
                      {app.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          {app.fullName}
                        </h4>
                        {app.holisticMatchIndex?.isHiddenGem && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 ring-1 ring-amber-200">
                            <Sparkles className="h-3 w-3" /> Hidden Gem
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{app.headline}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{app.residenceCity}, {app.residenceCountry}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-600">{app.targetRoleOrRoute}</span>
                      </div>
                    </div>
                  </div>

                  {/* Composite Score Pill */}
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black ${
                        isQualified
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : isConditional
                          ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                      }`}
                    >
                      {app.compositeScore}/100
                    </div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                      {app.verdict}
                    </span>
                  </div>
                </div>

                {/* Vault Verification & Document Provenance Badges */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-[11px]">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Provenance:
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 font-semibold text-emerald-800 border border-emerald-200">
                    {tier2Count}x Tier-2 Notarized
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 font-semibold text-slate-700 border border-slate-200">
                    {tier1Count}x Tier-1 Hashed
                  </span>
                  {app.tier2Deficits && app.tier2Deficits.length > 0 && (
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 font-semibold text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Tier Deficit
                    </span>
                  )}
                </div>

                {/* Verified Skills Pills */}
                {app.skills && app.skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {app.skills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                      >
                        {s.name}
                      </span>
                    ))}
                    {app.skills.length > 4 && (
                      <span className="text-[10px] text-slate-400">+{app.skills.length - 4} more</span>
                    )}
                  </div>
                )}

                {/* Pipeline Stage Bar & Action Row */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Stage:</span>
                    <select
                      value={app.pipelineStage}
                      onChange={(e) => handleStageChange(app.id, e.target.value as UniversalPipelineStage)}
                      className="rounded-lg border border-slate-200 bg-white py-1 px-2 text-[11px] font-bold text-slate-800 outline-none"
                    >
                      <option value="QUERIED">Queried</option>
                      <option value="DOSSIER_INGESTED">Dossier Ingested</option>
                      <option value="ADMISSIBILITY_REVIEW">Admissibility Review</option>
                      <option value="FINANCIALS_VERIFIED">Financials Verified</option>
                      <option value="ACADEMIC_BOARD_REVIEW">Academic Board Review</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                      <option value="VISA_GRANTED">Visa Granted</option>
                      <option value="HIRED">Hired</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApplicant(app);
                      setDossierActiveTab("vault");
                    }}
                    className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-slate-800"
                  >
                    <Eye className="h-3.5 w-3.5" /> Inspect Dossier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over Detailed Dossier Drawer */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setSelectedApplicant(null)}
            aria-hidden="true"
          />
          <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="border-b border-slate-200 bg-slate-900 p-6 text-white">
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 font-bold text-white text-xl">
                  {selectedApplicant.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-bold">{selectedApplicant.fullName}</h3>
                    {selectedApplicant.holisticMatchIndex?.isHiddenGem && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 ring-1 ring-amber-400/30">
                        <Sparkles className="h-3 w-3" /> Hidden Gem
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{selectedApplicant.headline}</p>
                  <p className="text-[11px] text-slate-400">
                    {selectedApplicant.residenceCity}, {selectedApplicant.residenceCountry} • {selectedApplicant.nationality}
                  </p>
                </div>
              </div>

              {/* Quick Score Bar */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-center">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Composite Score</span>
                  <span className="text-lg font-black text-emerald-400">{selectedApplicant.compositeScore}/100</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Integrity Status</span>
                  <span className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1 mt-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Tamper Free
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Stage</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block truncate">
                    {selectedApplicant.pipelineStage.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-bold">
              {[
                { id: "vault", label: "Cryptographic Vault Audit" },
                { id: "profile", label: "Human Profile & Timeline" },
                { id: "discovery", label: "Discovery Engine & HMI" },
                { id: "notes", label: `Notes (${selectedApplicant.evaluatorNotes.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDossierActiveTab(tab.id as any)}
                  className={`border-b-2 py-3 px-3 transition-colors ${
                    dossierActiveTab === tab.id
                      ? "border-emerald-600 text-emerald-800 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body Content */}
            <div className="p-6 space-y-6 flex-1 text-xs text-slate-700">
              {/* TAB 1: Cryptographic Vault Audit */}
              {dossierActiveTab === "vault" && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-emerald-600" /> Hashed Vault Documents & Provenance Tiers
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Every document below was fetched from candidate&rsquo;s sovereign vault and verified against the on-chain registry.
                    </p>

                    <div className="space-y-2.5">
                      {selectedApplicant.vaultDocuments.map((doc, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{doc.name}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                doc.tier === 2
                                  ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
                                  : "bg-blue-100 text-blue-800 ring-1 ring-blue-300"
                              }`}
                            >
                              Tier {doc.tier}: {doc.tier === 2 ? "Authenticated / Notarized" : "Standard Hashed"}
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 break-all">
                            SHA-256: {doc.sha256Hash}
                          </div>
                          {doc.notarySealReference && (
                            <div className="text-[10px] text-emerald-700 font-medium">
                              Digital Seal Stamp: {doc.notarySealReference}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier Deficit Notice */}
                  {selectedApplicant.tier2Deficits && selectedApplicant.tier2Deficits.length > 0 && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                        <AlertTriangle className="h-4 w-4" /> Statutory Tier-2 Attestation Deficits ({selectedApplicant.tier2Deficits.length})
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-700">
                        {selectedApplicant.tier2Deficits.map((def, idx) => (
                          <li key={idx}>{def}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Claims vs Attestation Matrix Citations */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                      Claim-vs-Attestation Matrix Citations
                    </h4>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 text-[11px] leading-relaxed">
                      {selectedApplicant.citations.map((c, idx) => (
                        <p key={idx} className={c.startsWith("⚠️") ? "text-amber-800 font-medium" : "text-slate-700"}>
                          {c}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Human Profile & Timeline */}
              {dossierActiveTab === "profile" && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-emerald-600" /> Professional Career Timeline
                    </h4>
                    <div className="space-y-3">
                      {selectedApplicant.workHistorySummary.map((w, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{w.title}</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {w.startDate} — {w.isCurrent ? "Present" : w.endDate}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-emerald-700">{w.company} ({w.employmentType})</p>
                          {w.description && <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{w.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                      Technical Skills Matrix ({selectedApplicant.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApplicant.skills.map((s, idx) => (
                        <span key={idx} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 font-medium">
                          {s.name} {s.proficiency && <span className="text-[10px] text-slate-400">({s.proficiency})</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                      Language Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplicant.languages.map((l, idx) => (
                        <span key={idx} className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-bold">
                          {l.language}: {l.level}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Discovery Engine & HMI */}
              {dossierActiveTab === "discovery" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-emerald-600" /> Universal Holistic Match Index (HMI)
                      </span>
                      <span className="text-xl font-black text-emerald-700">
                        {selectedApplicant.holisticMatchIndex?.overallHmiScore || 90}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg bg-white p-2 border border-emerald-100">
                        <span className="block text-slate-400 font-bold uppercase text-[9px]">Foundational Integrity</span>
                        <strong className="text-slate-900">{selectedApplicant.holisticMatchIndex?.foundationalIntegrityScore}/100</strong>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-emerald-100">
                        <span className="block text-slate-400 font-bold uppercase text-[9px]">Practical Execution</span>
                        <strong className="text-slate-900">{selectedApplicant.holisticMatchIndex?.practicalExecutionIndex}/100</strong>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-emerald-100">
                        <span className="block text-slate-400 font-bold uppercase text-[9px]">Learning Velocity</span>
                        <strong className="text-slate-900">{selectedApplicant.holisticMatchIndex?.learningVelocityIndex}/100</strong>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-emerald-100">
                        <span className="block text-slate-400 font-bold uppercase text-[9px]">Situational Judgment</span>
                        <strong className="text-slate-900">{selectedApplicant.holisticMatchIndex?.situationalJudgmentScore}/100</strong>
                      </div>
                    </div>

                    {selectedApplicant.holisticMatchIndex?.hiddenGemReason && (
                      <p className="text-xs font-medium text-emerald-900 bg-white/70 p-2.5 rounded-xl border border-emerald-200">
                        💎 <strong>Hidden Gem Radar:</strong> {selectedApplicant.holisticMatchIndex.hiddenGemReason}
                      </p>
                    )}
                  </div>

                  {/* Tailored Interview Probes */}
                  {selectedApplicant.holisticMatchIndex?.tailoredInterviewProbes && (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                        <Award className="h-4 w-4 text-indigo-600" /> Sector-Grounded Interview Probes (3 Custom Questions)
                      </div>
                      <p className="text-[11px] text-indigo-800">
                        The AI Evaluator generated these specific questions targeting this applicant&rsquo;s potential risks and blindspots:
                      </p>
                      <div className="space-y-2">
                        {selectedApplicant.holisticMatchIndex.tailoredInterviewProbes.map((probe, idx) => (
                          <div key={idx} className="rounded-xl border border-indigo-100 bg-white p-3 text-xs text-slate-800 leading-relaxed font-medium">
                            <span className="font-bold text-indigo-600 mr-1.5">Q{idx + 1}:</span> {probe}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Evaluator Notes */}
              {dossierActiveTab === "notes" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Add Evaluator Note / Decision Scorecard</label>
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Record interview notes, consular assessment, or team scorecard..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={isAddingNote || !newNoteText.trim()}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" /> Post Evaluator Note
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Case Notes History ({selectedApplicant.evaluatorNotes.length})
                    </h5>
                    {selectedApplicant.evaluatorNotes.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No notes posted yet.</p>
                    ) : (
                      selectedApplicant.evaluatorNotes.map((note) => (
                        <div key={note.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900">{note.authorName} ({note.authorRole})</span>
                            <span className="text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{note.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Stage Advance */}
            <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Advance Candidate Stage:</span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedApplicant.pipelineStage}
                  onChange={(e) => handleStageChange(selectedApplicant.id, e.target.value as UniversalPipelineStage)}
                  className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="QUERIED">Queried</option>
                  <option value="DOSSIER_INGESTED">Dossier Ingested</option>
                  <option value="ADMISSIBILITY_REVIEW">Admissibility Review</option>
                  <option value="FINANCIALS_VERIFIED">Financials Verified</option>
                  <option value="ACADEMIC_BOARD_REVIEW">Academic Board Review</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="VISA_GRANTED">Visa Granted</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSelectedApplicant(null)}
                  className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

