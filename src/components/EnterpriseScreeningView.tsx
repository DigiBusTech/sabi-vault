"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Shield,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Plus,
  Search,
  Sparkles,
  Users,
  Check,
  X,
  RefreshCw,
  ScanSearch,
  FileText,
  Bot,
  Calendar,
  Video,
  Plane,
  GraduationCap,
  Briefcase,
  Scale,
  MessageSquare,
  Layers,
  ArrowRight,
  Lock,
} from "lucide-react";
import { CriteriaProfile, CandidateEvaluationResult, BenchmarkItem } from "@/core/enterprise/criteria_store";

function verdictClasses(verdict: string | undefined): string {
  switch (verdict) {
    case "HIGHLY_QUALIFIED":
    case "QUALIFIED":
      return "bg-emerald-100 text-emerald-700";
    case "MARGINAL":
    case "CONDITIONALLY_QUALIFIED":
      return "bg-amber-100 text-amber-700";
    case "UNQUALIFIED":
    case "REJECTED":
      return "bg-red-100 text-red-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export const QUERY_TRACKS = [
  {
    id: "IMMIGRATION",
    label: "Immigration & Border",
    icon: Plane,
    desc: "Visa requirements, funds minimums, Tier-2 legal notarization & ID biometric integrity",
  },
  {
    id: "EDUCATION",
    label: "Academic Admissions",
    icon: GraduationCap,
    desc: "Official transcripts, GPA thresholds, degree accreditation attestation & language levels",
  },
  {
    id: "LABOUR",
    label: "Talent & Employment",
    icon: Briefcase,
    desc: "Verified employment tenure, reference integrity, technical skill mastery & role alignment",
  },
  {
    id: "PROCUREMENT",
    label: "Legal & Procurement",
    icon: Scale,
    desc: "Corporate MOUs, tax compliance certificates, sworn declarations & partner standing",
  },
] as const;

export type QueryTrackId = (typeof QUERY_TRACKS)[number]["id"];

const AGENT_STAGES = [
  { name: "🛡️ Integrity Agent", desc: "On-chain hash vs Base Sepolia ledger" },
  { name: "🔬 Domain Compliance Agent", desc: "Track-specific threshold & seal verification" },
  { name: "⚙️ Strict RAG Evaluator", desc: "Rubric grounding, zero hallucination scoring" },
  { name: "🚩 Fraud & Anomaly Radar", desc: "Pattern, timeline & credential issuer analysis" },
] as const;

export type EnterpriseViewMode = "all" | "overview" | "rubrics" | "screening";

interface EnterpriseScreeningViewProps {
  viewMode?: EnterpriseViewMode;
}

export function EnterpriseScreeningView({ viewMode = "all" }: EnterpriseScreeningViewProps = {}) {
  const [rubrics, setRubrics] = useState<CriteriaProfile[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState<string>("");
  const [activeMode, setActiveMode] = useState<"single" | "bulk">("single");
  const [selectedTrack, setSelectedTrack] = useState<QueryTrackId>("LABOUR");
  const [isLoadingRubrics, setIsLoadingRubrics] = useState<boolean>(true);

  // Sabi Interviewer & Interview Scheduling Modals
  const [showSabiInterviewerModal, setShowSabiInterviewerModal] = useState<boolean>(false);
  const [showDirectInterviewModal, setShowDirectInterviewModal] = useState<boolean>(false);
  const [interviewLink, setInterviewLink] = useState<string>("");
  const [notified, setNotified] = useState<boolean>(false);

  // Single Screening State
  const [singleKey, setSingleKey] = useState<string>("");
  const [requestingOrg, setRequestingOrg] = useState<string>("");
  const [isSingleLoading, setIsSingleLoading] = useState<boolean>(false);
  const [singleResult, setSingleResult] = useState<CandidateEvaluationResult | null>(null);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Bulk Screening State
  const [bulkKeysText, setBulkKeysText] = useState<string>("");
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);
  const [bulkResult, setBulkResult] = useState<any | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Agent stage animation while screening
  const [agentStage, setAgentStage] = useState<number>(0);
  useEffect(() => {
    const running = isSingleLoading || isBulkLoading;
    if (!running) {
      setAgentStage(0);
      return;
    }
    setAgentStage(0);
    const timer = window.setInterval(
      () => setAgentStage((s) => Math.min(s + 1, AGENT_STAGES.length - 1)),
      900
    );
    return () => window.clearInterval(timer);
  }, [isSingleLoading, isBulkLoading]);

  // Custom Rubric Modal State
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<"IMMIGRATION" | "LABOUR" | "EDUCATION" | "CUSTOM">("LABOUR");
  const [customMinGpa, setCustomMinGpa] = useState<string>("3.5");
  const [customMinFunds, setCustomMinFunds] = useState<string>("10000");
  const [customMinExp, setCustomMinExp] = useState<string>("3");
  const [customTier2Required, setCustomTier2Required] = useState<boolean>(true);
  const [customPassingScore, setCustomPassingScore] = useState<string>("70");
  const [customAutoInterviewScore, setCustomAutoInterviewScore] = useState<string>("85");
  const [customBenchmarks, setCustomBenchmarks] = useState<BenchmarkItem[]>([]);
  const [customError, setCustomError] = useState<string | null>(null);
  const [isSavingRubric, setIsSavingRubric] = useState<boolean>(false);

  const handleTrackChange = (trackId: QueryTrackId) => {
    setSelectedTrack(trackId);
    const matching = rubrics.find((r) => r.category === trackId);
    if (matching) {
      setSelectedRubricId(matching.id);
    }
  };

  const loadRubrics = async () => {
    try {
      setIsLoadingRubrics(true);
      const res = await fetch("/api/v1/enterprise/criteria");
      if (res.ok) {
        const data = await res.json();
        setRubrics(data.profiles);
        if (data.profiles?.length && !selectedRubricId) {
          setSelectedRubricId(data.profiles[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load rubrics:", err);
    } finally {
      setIsLoadingRubrics(false);
    }
  };

  useEffect(() => {
    loadRubrics();
  }, []);

  const activeRubric = rubrics.find((r) => r.id === selectedRubricId) || rubrics[0];

  const handleSingleScreen = async () => {
    if (!singleKey) return;
    setIsSingleLoading(true);
    setSingleResult(null);
    setSingleError(null);

    try {
      const res = await fetch("/api/v1/enterprise/screen-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keys: [singleKey],
          rubricId: activeRubric?.id,
          requestingOrg: requestingOrg || "Enterprise Screener",
        }),
      });

      const data = await res.json();
      if (res.ok && data.candidates?.length > 0) {
        setSingleResult(data.candidates[0]);
      } else {
        setSingleError(data.error || "Screening failed. Verify the candidate key and quota.");
      }
    } catch {
      setSingleError("Network error while screening the candidate.");
    } finally {
      setIsSingleLoading(false);
    }
  };

  const handleBulkScreen = async () => {
    const rawKeys = bulkKeysText
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (rawKeys.length === 0) return;
    setIsBulkLoading(true);
    setBulkResult(null);
    setBulkError(null);

    try {
      const res = await fetch("/api/v1/enterprise/screen-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keys: rawKeys,
          rubricId: activeRubric?.id,
          requestingOrg: requestingOrg || "Enterprise Screener",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBulkResult(data);
      } else {
        setBulkError(data.error || "Batch screening failed.");
      }
    } catch {
      setBulkError("Network error while screening the pool.");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleCreateCustomRubric = async () => {
    if (!customName || !customDescription) return;
    setIsSavingRubric(true);
    setCustomError(null);
    try {
      const res = await fetch("/api/v1/enterprise/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customName,
          category: customCategory,
          description: customDescription,
          minGpa: parseFloat(customMinGpa) || undefined,
          minLiquidFundsUsd: parseFloat(customMinFunds) || undefined,
          minExperienceYears: parseInt(customMinExp) || undefined,
          mandatoryTier2Notarization: customTier2Required,
          passingScore: parseFloat(customPassingScore) || 70,
          autoInterviewScore: parseFloat(customAutoInterviewScore) || 85,
          requiredCategories: ["academics", "finance", "experience"],
          benchmarks: customBenchmarks,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRubrics(data.profiles);
        setSelectedRubricId(data.profile.id);
        setShowCustomModal(false);
        setCustomName("");
        setCustomDescription("");
      } else {
        setCustomError(data.error || "Could not save the rubric.");
      }
    } catch {
      setCustomError("Network error while saving the rubric.");
    } finally {
      setIsSavingRubric(false);
    }
  };

  const sectionAnchor = "scroll-mt-24 lg:scroll-mt-8";
  const isScreening = isSingleLoading || isBulkLoading;

  return (
    <div className="space-y-10">
      {/* ---- Overview ---- */}
      {(viewMode === "all" || viewMode === "overview") && (
      <section id="overview" className={sectionAnchor}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: Sliders,
              label: "Grounding rubrics",
              value: `${rubrics.length} available`,
              sub: "Strict mathematical evaluation rules",
            },
            {
              icon: ScanSearch,
              label: "Screening engine",
              value: "3-agent pipeline",
              sub: "Integrity · RAG evaluator · fraud radar",
            },
            {
              icon: Shield,
              label: "Ledger enforcement",
              value: "Fail-closed",
              sub: "Unknown or tampered hashes are rejected",
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

      {/* ---- Criteria studio ---- */}
      {(viewMode === "all" || viewMode === "rubrics") && (
      <section id="rubrics" className={`${sectionAnchor} dash-card-in`} style={{ animationDelay: "120ms" }}>
        <div className="clean-card rounded-2xl p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center">
            <div>
              <h2 className="flex items-center gap-2 font-heading text-base font-bold text-slate-900">
                <Sliders className="h-4 w-4 text-emerald-600" />
                Criteria studio
              </h2>
              <p className="mt-1 max-w-lg text-xs leading-relaxed text-slate-500">
                Configure the rubric candidates are evaluated against. The evaluator only reads
                verified, structured fields. Missing data fails the category; it is never guessed.
              </p>
            </div>
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              New rubric
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-4">
              <label htmlFor="rubric-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Active evaluation rubric
              </label>
              {isLoadingRubrics ? (
                <div className="skeleton h-11 rounded-xl" />
              ) : (
                <select
                  id="rubric-select"
                  value={activeRubric?.id || ""}
                  onChange={(e) => setSelectedRubricId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {rubrics.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.category})
                    </option>
                  ))}
                </select>
              )}

              {activeRubric && (
                <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs italic leading-relaxed text-slate-500">
                  &ldquo;{activeRubric.description}&rdquo;
                </p>
              )}
            </div>

            {activeRubric && (
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 lg:col-span-8">
                {[
                  {
                    label: "Min GPA",
                    value: activeRubric.minGpa ? `${activeRubric.minGpa} / 5.0` : "None",
                  },
                  {
                    label: "Liquid funds",
                    value: activeRubric.minLiquidFundsUsd
                      ? `$${activeRubric.minLiquidFundsUsd.toLocaleString()}`
                      : "None",
                  },
                  {
                    label: "Min experience",
                    value: activeRubric.minExperienceYears
                      ? `${activeRubric.minExperienceYears}+ years`
                      : "None",
                  },
                  {
                    label: "Tier-2 notary seal",
                    value: activeRubric.mandatoryTier2Notarization ? "Mandatory" : "Optional",
                  },
                ].map((rule) => (
                  <div
                    key={rule.label}
                    className="space-y-1 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {rule.label}
                    </span>
                    <span className="block text-sm font-extrabold text-slate-900">{rule.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Rubric Rich Dynamic Benchmarks Table */}
          {activeRubric && activeRubric.benchmarks && activeRubric.benchmarks.length > 0 && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Active Multi-Benchmarks & Statutory Thresholds ({activeRubric.benchmarks.length})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">
                    Passing Bar: <strong className="text-emerald-700">{activeRubric.passingScore || 65}/100</strong>
                  </span>
                  <span className="text-slate-500">
                    Auto-Interview: <strong className="text-indigo-700">{activeRubric.autoInterviewScore ? `${activeRubric.autoInterviewScore}+/100` : "Manual"}</strong>
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                    <tr>
                      <th className="pb-2">Benchmark Requirement</th>
                      <th className="pb-2">Domain</th>
                      <th className="pb-2">Metric Type</th>
                      <th className="pb-2">Statutory Target</th>
                      <th className="pb-2">Importance</th>
                      <th className="pb-2">Legal Citation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activeRubric.benchmarks.map((bm) => (
                      <tr key={bm.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-bold text-slate-900">{bm.name}</td>
                        <td className="py-2.5 capitalize text-slate-600">{bm.category}</td>
                        <td className="py-2.5 font-mono text-[11px] text-slate-500">{bm.metricType}</td>
                        <td className="py-2.5 font-bold text-emerald-700">{String(bm.targetValue)} {bm.unit || ""}</td>
                        <td className="py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                            bm.importance === "mandatory"
                              ? "bg-rose-100 text-rose-800 ring-1 ring-rose-200"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {bm.importance}
                          </span>
                        </td>
                        <td className="py-2.5 text-[11px] text-slate-500 max-w-xs truncate">{bm.statutoryCitation || "Standard Evaluation Policy"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    )}

      {/* ---- Screening ---- */}
      {(viewMode === "all" || viewMode === "screening") && (
      <section id="screening" className={sectionAnchor}>
        {/* Specialized Evaluation Query Tracks */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Layers className="h-4 w-4 text-emerald-600" /> Specialized Evaluation Query Tracks
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Select your institutional track to configure domain verification criteria, funds thresholds, and notary mandates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {QUERY_TRACKS.map((track) => {
              const isSelected = selectedTrack === track.id;
              const Icon = track.icon;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleTrackChange(track.id)}
                  className={`flex flex-col text-left rounded-xl border p-3 transition-all duration-200 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900">{track.label}</span>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                    {track.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Rubric Selector & Criteria HUD in Screening Mode */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Evaluation Rubric
                </h4>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                  {activeRubric?.category || selectedTrack}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Candidates screened below are evaluated strictly against this rubric&apos;s benchmarks and passing thresholds.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isLoadingRubrics ? (
                <div className="skeleton h-9 w-48 rounded-xl" />
              ) : (
                <select
                  id="screening-rubric-select"
                  value={activeRubric?.id || ""}
                  onChange={(e) => setSelectedRubricId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                >
                  {rubrics.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.category})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {activeRubric && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-900">
                  {activeRubric.name}
                </span>
                <span className="text-xs italic text-slate-500">
                  &ldquo;{activeRubric.description}&rdquo;
                </span>
              </div>

              {/* Thresholds HUD Cards */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-0.5">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Passing Bar</span>
                  <span className="block text-xs font-extrabold text-emerald-600">
                    {activeRubric.passingScore || 65} / 100
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-0.5">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Auto-Interview</span>
                  <span className="block text-xs font-extrabold text-indigo-600">
                    {activeRubric.autoInterviewScore ? `${activeRubric.autoInterviewScore}+ / 100` : "Manual"}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-0.5">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Min GPA</span>
                  <span className="block text-xs font-extrabold text-slate-800">
                    {activeRubric.minGpa ? `${activeRubric.minGpa} / 5.0` : "None"}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-0.5">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Liquid Funds</span>
                  <span className="block text-xs font-extrabold text-slate-800">
                    {activeRubric.minLiquidFundsUsd ? `${activeRubric.minLiquidFundsUsd.toLocaleString()}` : "None"}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-0.5">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Min Tenure</span>
                  <span className="block text-xs font-extrabold text-slate-800">
                    {activeRubric.minExperienceYears ? `${activeRubric.minExperienceYears}+ yrs` : "None"}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-0.5">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Tier-2 Notary</span>
                  <span className={`block text-xs font-extrabold ${activeRubric.mandatoryTier2Notarization ? "text-amber-600" : "text-slate-600"}`}>
                    {activeRubric.mandatoryTier2Notarization ? "Mandatory Seal" : "Optional"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mode tabs */}
        <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1" role="tablist" aria-label="Screening mode">
          {(
            [
              { id: "single" as const, label: "Single candidate", icon: Search },
              { id: "bulk" as const, label: "Bulk queue", icon: Users },
            ]
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeMode === tab.id}
              onClick={() => setActiveMode(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
                activeMode === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Agent pipeline progress (shown while screening) */}
        {isScreening && (
          <div className="clean-card mb-5 rounded-2xl p-5">
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {AGENT_STAGES.map((stage, i) => {
                const isDone = i < agentStage;
                const isCurrent = i === agentStage;
                return (
                  <li
                    key={stage.name}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-colors duration-300 ${
                      isDone
                        ? "border-emerald-200 bg-emerald-50/60"
                        : isCurrent
                        ? "border-emerald-300 bg-white"
                        : "border-slate-100 bg-slate-50/50"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-300"
                      }`}
                      style={isCurrent ? { animation: "scanStagePulse 1.2s ease-out infinite" } : undefined}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                    </span>
                    <div>
                      <p className={`text-xs font-bold ${isDone || isCurrent ? "text-slate-900" : "text-slate-400"}`}>
                        {stage.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{stage.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {activeMode === "single" && (
          <div className="space-y-6">
            <div className="clean-card dash-card-in rounded-2xl p-6" style={{ animationDelay: "80ms" }}>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="space-y-1.5 lg:col-span-8">
                  <label htmlFor="single-key" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Candidate scoped API key
                  </label>
                  <input
                    id="single-key"
                    type="text"
                    value={singleKey}
                    onChange={(e) => setSingleKey(e.target.value)}
                    placeholder="Paste candidate scoped key (e.g. sbk_live_v1_...)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <p className="text-[11px] text-slate-400">
                    The key defines exactly which categories you can see. Everything else stays sealed.
                  </p>
                </div>

                <div className="space-y-1.5 lg:col-span-4">
                  <label htmlFor="requesting-org" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Requesting organization
                  </label>
                  <input
                    id="requesting-org"
                    type="text"
                    value={requestingOrg}
                    onChange={(e) => setRequestingOrg(e.target.value)}
                    placeholder="Recorded in the candidate's audit ledger"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {singleError && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-xs font-medium leading-relaxed text-red-700">{singleError}</p>
                </div>
              )}

              <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <Coins className="h-4 w-4 text-amber-500" />
                  Query fee: <span className="font-bold text-slate-900">$1.00</span> settled on-chain per evaluation
                </p>
                <button
                  onClick={handleSingleScreen}
                  disabled={isSingleLoading || !singleKey || !activeRubric}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSingleLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
                  {isSingleLoading ? "Evaluating..." : "Run multi-agent screening"}
                </button>
              </div>
            </div>

            {/* Single result dossier */}
            {singleResult && (
              <div
                className="clean-card space-y-6 rounded-2xl p-6"
                style={{ animation: "dashCardIn 0.45s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        Candidate {singleResult.candidateId}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-extrabold ${verdictClasses(singleResult.verdict)}`}
                      >
                        {String(singleResult.verdict).replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Node: {singleResult.sovereignNode} · evaluated against {activeRubric?.name}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-heading text-2xl font-black text-emerald-600">
                      {singleResult.compositeScore}
                      <span className="text-sm font-bold text-slate-400"> / 100</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Composite fit score
                    </span>
                  </div>
                </div>

                {/* Agent verdicts */}
                <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
                  <div className="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Integrity agent</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="font-mono text-[11px] text-emerald-700">
                      Ledger: {singleResult.integrityStatus}
                    </p>
                  </div>
                  <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">RAG evaluator</span>
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Zero-hallucination grounding · schema-matched scoring
                    </p>
                  </div>
                  <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Fraud radar</span>
                      <Shield className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {singleResult.anomaliesDetected?.length > 0
                        ? `${singleResult.anomaliesDetected.length} anomaly flag(s) raised`
                        : "Zero anomalies detected"}
                    </p>
                  </div>
                </div>

                {/* Citations */}
                {singleResult.citations?.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Verbatim verified citations
                    </span>
                    <div className="space-y-1.5">
                      {singleResult.citations.map((cit, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 font-mono text-xs text-slate-700"
                        >
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span>{cit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Settlement receipt */}
                <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:flex-row sm:items-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Coins className="h-4 w-4 text-amber-500" />
                      Micro-transaction settled
                    </div>
                    <p className="text-[11px] text-slate-500">
                      $0.60 platform treasury · $0.40 sovereign node host, executed by splitter contract
                    </p>
                  </div>
                  {singleResult.onChainTx && (
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-[10px] text-slate-500">
                      tx {singleResult.onChainTx.substring(0, 18)}...
                    </div>
                  )}
                </div>

                {/* Benchmark Evaluations (if present) */}
                {singleResult.benchmarkResults && singleResult.benchmarkResults.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Multi-Benchmark Statutory Audits ({singleResult.benchmarkResults.length})
                    </span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {singleResult.benchmarkResults.map((bm, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start justify-between gap-2 rounded-xl border p-3 text-xs ${
                            bm.passed
                              ? "border-emerald-200 bg-emerald-50/50 text-slate-800"
                              : bm.importance === "mandatory"
                              ? "border-rose-200 bg-rose-50/50 text-rose-900"
                              : "border-amber-200 bg-amber-50/50 text-amber-900"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold">
                              {bm.passed ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <X className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                              )}
                              <span>{bm.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-600">{bm.message}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                              bm.importance === "mandatory"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {bm.importance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Evidence-Gated Screening Funnel Visualizer */}
                {(() => {
                  const isIntegrityPassed = singleResult.integrityStatus === "TAMPER_FREE_VERIFIED";
                  const isTampered = singleResult.integrityStatus === "TAMPER_DETECTED" || singleResult.integrityStatus === "KEY_INVALID" || singleResult.integrityStatus === "VAULT_NOT_FOUND";

                  const missingRequiredCategories = (activeRubric?.requiredCategories || []).filter(
                    (cat) => !singleResult.verifiedCategories?.includes(cat)
                  );

                  const failedMandatoryBenchmarks = (singleResult.benchmarkResults || []).filter(
                    (b) => b.importance === "mandatory" && !b.passed
                  );

                  const isPrereqsPassed = missingRequiredCategories.length === 0 && failedMandatoryBenchmarks.length === 0;

                  const passingScore = activeRubric?.passingScore || 65;
                  const isScorePassed = singleResult.compositeScore >= passingScore;

                  const isOrgReviewPassed = singleResult.verdict === "QUALIFIED";
                  const isOrgReviewMarginal = singleResult.verdict === "CONDITIONALLY_QUALIFIED";
                  const isDisqualified = singleResult.verdict === "REJECTED" || !isScorePassed || isTampered || !isPrereqsPassed;

                  const isInterviewEligible = !isDisqualified && isIntegrityPassed && isPrereqsPassed && isScorePassed && singleResult.verdict !== "REJECTED";

                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-900">
                          <Layers className="h-4 w-4 text-emerald-600" />
                          Multi-Stage Evidence-Gated Evaluation Funnel
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isInterviewEligible
                            ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                            : "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
                        }`}>
                          {isInterviewEligible ? "Stage 5: Advance to Interview" : "Stage 5: Interview Dispatch Locked"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5 text-xs">
                        {/* Stage 1: Hash Ledger */}
                        <div className={`rounded-lg border p-2.5 space-y-1 ${
                          isIntegrityPassed
                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-700"
                            : "border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-400"
                        }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span>1. Hash Ledger</span>
                            {isIntegrityPassed ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3 text-rose-600" />}
                          </div>
                          <p className="text-[10px] text-slate-600">
                            {isIntegrityPassed ? "Base Sepolia on-chain proof" : `Alert: ${singleResult.integrityStatus}`}
                          </p>
                        </div>

                        {/* Stage 2: Prerequisites */}
                        <div className={`rounded-lg border p-2.5 space-y-1 ${
                          isPrereqsPassed
                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-700"
                            : "border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-400"
                        }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span>2. Prerequisites</span>
                            {isPrereqsPassed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-rose-600" />}
                          </div>
                          <p className="text-[10px] text-slate-600 truncate">
                            {isPrereqsPassed
                              ? "Thresholds & seals verified"
                              : missingRequiredCategories.length > 0
                              ? `Missing: ${missingRequiredCategories.join(", ")}`
                              : "Mandatory benchmark failed"}
                          </p>
                        </div>

                        {/* Stage 3: AI Semantic */}
                        <div className={`rounded-lg border p-2.5 space-y-1 ${
                          isScorePassed
                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-700"
                            : "border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-400"
                        }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span>3. AI Semantic</span>
                            {isScorePassed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-rose-600" />}
                          </div>
                          <p className="text-[10px] text-slate-600">
                            {isScorePassed ? `Score ${singleResult.compositeScore} >= ${passingScore}` : `Score ${singleResult.compositeScore} < ${passingScore}`}
                          </p>
                        </div>

                        {/* Stage 4: Org Review */}
                        <div className={`rounded-lg border p-2.5 space-y-1 ${
                          isOrgReviewPassed
                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-700"
                            : isOrgReviewMarginal
                            ? "border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-amber-300"
                            : "border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-400"
                        }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span>4. Org Review</span>
                            {isOrgReviewPassed ? (
                              <Check className="h-3 w-3" />
                            ) : isOrgReviewMarginal ? (
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                            ) : (
                              <X className="h-3 w-3 text-rose-600" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-600">
                            {isOrgReviewPassed ? "Shortlisted" : isOrgReviewMarginal ? "Manual review" : "Disqualified"}
                          </p>
                        </div>

                        {/* Stage 5: Interview Dispatch */}
                        <div className={`rounded-lg border p-2.5 space-y-1 ${
                          isInterviewEligible
                            ? "border-emerald-300 bg-emerald-100/60 text-emerald-800 ring-1 ring-emerald-400"
                            : "border-slate-200 bg-slate-100/80 text-slate-400"
                        }`}>
                          <div className="flex items-center justify-between font-extrabold">
                            <span>5. Interview</span>
                            {isInterviewEligible ? (
                              <Sparkles className="h-3 w-3 text-emerald-700" />
                            ) : (
                              <Lock className="h-3 w-3 text-slate-400" />
                            )}
                          </div>
                          <p className={`text-[10px] font-medium ${isInterviewEligible ? "text-emerald-800" : "text-slate-500"}`}>
                            {isInterviewEligible ? "Ready for interview" : "Locked (Disqualified)"}
                          </p>
                        </div>
                      </div>

                      {/* Interview Dispatch Actions with Strict Evidence Gating */}
                      {isInterviewEligible ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="block text-xs font-bold text-slate-800">
                              Candidate Qualified — Dispatch Final Interview:
                            </span>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                              Passed all prerequisite gates
                            </span>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <button
                              type="button"
                              onClick={() => {
                                const generated = `https://meet.google.com/sabi-eval-${Math.random().toString(36).substring(2, 7)}`;
                                setInterviewLink(generated);
                                setShowDirectInterviewModal(true);
                              }}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-95"
                            >
                              <Video className="h-4 w-4" />
                              Schedule Org Direct Interview (Meet / Zoom / On-site)
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowSabiInterviewerModal(true)}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white py-2.5 px-4 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-all active:scale-95"
                            >
                              <Bot className="h-4 w-4 text-emerald-600" />
                              <span>🤖 Sabi Interviewer</span>
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-900">
                                Autonomous AI
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-3">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                            <div>
                              <h5 className="text-xs font-bold text-rose-900">
                                Interview Dispatch Locked — Candidate Disqualified
                              </h5>
                              <p className="mt-0.5 text-[11px] text-rose-700 leading-relaxed">
                                This candidate failed critical evidence verification gates (Composite Score: {singleResult.compositeScore}/100 vs Passing Bar: {passingScore}/100
                                {missingRequiredCategories.length > 0 && `, Missing mandatory records: ${missingRequiredCategories.join(", ")}`}
                                {isTampered && `, Ledger Status: ${singleResult.integrityStatus}`}). Interview scheduling is strictly locked to prevent unverified candidate progression.
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center opacity-40">
                            <button
                              type="button"
                              disabled
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-300 py-2.5 px-4 text-xs font-bold text-slate-500 cursor-not-allowed"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              Schedule Org Direct Interview (Locked)
                            </button>
                            <button
                              type="button"
                              disabled
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-4 text-xs font-bold text-slate-400 cursor-not-allowed"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              🤖 Sabi Interviewer (Locked)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Single empty state */}
            {!singleResult && !isSingleLoading && !singleError && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 ring-1 ring-slate-200">
                  <ScanSearch className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-700">No evaluation yet</p>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  Paste a candidate&apos;s scoped key above. The integrity agent checks the ledger first;
                  unknown or tampered hashes fail closed.
                </p>
              </div>
            )}
          </div>
        )}

        {activeMode === "bulk" && (
          <div className="space-y-6">
            <div className="clean-card dash-card-in rounded-2xl p-6" style={{ animationDelay: "80ms" }}>
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-heading text-sm font-bold text-slate-900">Batch key ingestion</h3>
                <p className="mt-1 text-xs text-slate-500">
                  One candidate scoped key per line. The pool is screened in parallel against{" "}
                  <span className="font-semibold text-slate-700">{activeRubric?.name || "the active rubric"}</span>.
                </p>
              </div>

              <textarea
                rows={4}
                value={bulkKeysText}
                onChange={(e) => setBulkKeysText(e.target.value)}
                placeholder={"sbk_live_v1_...\nsbk_live_v1_...\nsbk_live_v1_..."}
                aria-label="Candidate scoped keys, one per line"
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              {bulkError && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-xs font-medium leading-relaxed text-red-700">{bulkError}</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-end">
                <button
                  onClick={handleBulkScreen}
                  disabled={isBulkLoading || !bulkKeysText.trim() || !activeRubric}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBulkLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  {isBulkLoading ? "Evaluating pool..." : "Execute batch screening"}
                </button>
              </div>
            </div>

            {/* Bulk leaderboard */}
            {bulkResult && (
              <div
                className="clean-card space-y-4 rounded-2xl p-6"
                style={{ animation: "dashCardIn 0.45s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-slate-900">Ranked leaderboard</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {bulkResult.totalCandidates} evaluated · {bulkResult.qualifiedCount} qualified ·{" "}
                      {bulkResult.conditionallyQualifiedCount} conditional · {bulkResult.rejectedCount} rejected
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        <th className="p-3">Rank</th>
                        <th className="p-3">Candidate</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Verdict</th>
                        <th className="p-3">Integrity</th>
                        <th className="p-3">Node</th>
                        <th className="p-3">Verified categories</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkResult.candidates?.map((cand: any, idx: number) => (
                        <tr key={idx} className="transition-colors hover:bg-slate-50">
                          <td className="p-3 font-bold text-emerald-600">#{idx + 1}</td>
                          <td className="p-3 font-mono font-semibold text-slate-900">{cand.candidateId}</td>
                          <td className="p-3 font-extrabold text-slate-900">{cand.compositeScore}</td>
                          <td className="p-3">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold ${verdictClasses(cand.verdict)}`}
                            >
                              {String(cand.verdict).replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="p-3">
                            {cand.integrityStatus === "VERIFIED" || cand.integrityStatus === "MATCH" ? (
                              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                                <Check className="h-3 w-3" /> Tamper-free
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 font-semibold text-red-500">
                                <X className="h-3 w-3" /> {String(cand.integrityStatus || "Unknown")}
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-slate-500">{cand.sovereignNode}</td>
                          <td className="p-3 text-slate-600">{cand.verifiedCategories?.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    )}

      {/* ---- New rubric modal ---- */}
      {showCustomModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={() => setShowCustomModal(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create custom rubric"
            className="relative w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            style={{ animation: "dashCardIn 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <button
              type="button"
              onClick={() => setShowCustomModal(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">Create grounding rubric</h3>
                <p className="text-xs text-slate-500">Candidates are scored strictly against these rules</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="rubric-name" className="mb-1.5 block font-semibold text-slate-700">
                  Rubric name
                </label>
                <input
                  id="rubric-name"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Senior Smart Contract Auditor"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label htmlFor="rubric-category" className="mb-1.5 block font-semibold text-slate-700">
                  Domain category
                </label>
                <select
                  id="rubric-category"
                  value={customCategory}
                  onChange={(e: any) => setCustomCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="LABOUR">Labour and enterprise hiring</option>
                  <option value="IMMIGRATION">Immigration and visa processing</option>
                  <option value="EDUCATION">Education and university admissions</option>
                  <option value="CUSTOM">Custom organization rubric</option>
                </select>
              </div>

              <div>
                <label htmlFor="rubric-desc" className="mb-1.5 block font-semibold text-slate-700">
                  Grounding description
                </label>
                <textarea
                  id="rubric-desc"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Strict qualification requirements for applicants..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="rubric-gpa" className="mb-1.5 block font-semibold text-slate-700">
                    Min GPA
                  </label>
                  <input
                    id="rubric-gpa"
                    type="number"
                    step="0.1"
                    value={customMinGpa}
                    onChange={(e) => setCustomMinGpa(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label htmlFor="rubric-funds" className="mb-1.5 block font-semibold text-slate-700">
                    Min funds ($)
                  </label>
                  <input
                    id="rubric-funds"
                    type="number"
                    value={customMinFunds}
                    onChange={(e) => setCustomMinFunds(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label htmlFor="rubric-exp" className="mb-1.5 block font-semibold text-slate-700">
                    Min years
                  </label>
                  <input
                    id="rubric-exp"
                    type="number"
                    value={customMinExp}
                    onChange={(e) => setCustomMinExp(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="rubric-pass-score" className="mb-1.5 block font-semibold text-slate-700">
                    Passing Bar (0-100)
                  </label>
                  <input
                    id="rubric-pass-score"
                    type="number"
                    min="1"
                    max="100"
                    value={customPassingScore}
                    onChange={(e) => setCustomPassingScore(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label htmlFor="rubric-auto-interview" className="mb-1.5 block font-semibold text-slate-700">
                    Auto-Interview Threshold (0-100)
                  </label>
                  <input
                    id="rubric-auto-interview"
                    type="number"
                    min="1"
                    max="100"
                    value={customAutoInterviewScore}
                    onChange={(e) => setCustomAutoInterviewScore(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="tier2check"
                  type="checkbox"
                  checked={customTier2Required}
                  onChange={(e) => setCustomTier2Required(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="tier2check" className="font-medium text-slate-700">
                  Mandatory Tier-2 institutional notarization
                </label>
              </div>

              {customError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 font-medium text-red-700">
                  {customError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowCustomModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomRubric}
                disabled={!customName || !customDescription || isSavingRubric}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingRubric && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Save rubric
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Org Interview Modal */}
      {showDirectInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Schedule Org Direct Interview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectInterviewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              An encrypted video conference room has been generated for Candidate <strong>{singleResult?.candidateId}</strong>. Send this meeting invite to the candidate or launch now.
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Direct Video Conference URL
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-emerald-800 truncate">{interviewLink}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(interviewLink);
                    alert("Meeting link copied to clipboard!");
                  }}
                  className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200 hover:bg-slate-100 shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDirectInterviewModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sabi Interviewer Coming Soon Modal */}
      {showSabiInterviewerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">🤖 Sabi Interviewer</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800 ring-1 ring-emerald-200">
                    Future Upgrade · Enterprise Roadmap
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSabiInterviewerModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <p className="leading-relaxed">
                The <strong>Sabi Interviewer</strong> is an autonomous, multi-modal screening agent designed to conduct live technical, behavioral, and visa eligibility interviews without requiring human panel hours.
              </p>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <p className="font-bold text-slate-900 text-xs">Engineered Pipeline Highlights:</p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700 text-[11px] leading-relaxed">
                  <li>
                    <strong>Adaptive Deep-Probing:</strong> Dynamically asks contextual questions grounded strictly in candidate credentials without hallucinations.
                  </li>
                  <li>
                    <strong>Biometric Liveness & Impersonation Defense:</strong> Continuous multi-angle facial & voice verification to prevent proxy interview fraud.
                  </li>
                  <li>
                    <strong>Live Code & Attestation Defense:</strong> Evaluates problem solving in real time against strict rubric standards.
                  </li>
                  <li>
                    <strong>Tamper-Proof Ledger Scoring:</strong> Generates a signed SHA-256 interview attestation anchored on Base Sepolia.
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-emerald-950">
                  Feature in active engineering. Early access rollout scheduled for Enterprise v2.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNotified(true);
                    setTimeout(() => setNotified(false), 3000);
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shrink-0"
                >
                  {notified ? "✓ Subscribed" : "Notify Me"}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowSabiInterviewerModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
