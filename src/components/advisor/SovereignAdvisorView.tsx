"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Plus,
  Plane,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Target,
  Trash2,
  Edit2,
  Check,
  X,
  Coins,
  Scale,
  Building,
  Clock,
  ShieldAlert,
  HelpCircle,
  FileText,
} from "lucide-react";
import { SovereignAdvisorAudit, TargetGoal, AdvisorGapAlert, ConsularChecklistItem, FinancialForensicsReport, ConsularVisaRoute } from "@/types/profile";
import { CONSULAR_ROUTES_CATALOG } from "@/core/advisor/consular_routes_catalog";
import Link from "next/link";

export function SovereignAdvisorView() {
  const [audit, setAudit] = useState<SovereignAdvisorAudit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reAuditing, setReAuditing] = useState<boolean>(false);
  const [liveAiActive, setLiveAiActive] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modal State
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalType, setGoalType] = useState<"job" | "relocation" | "academic" | "procurement">("relocation");
  const [goalTitle, setGoalTitle] = useState<string>("");
  const [targetCountry, setTargetCountry] = useState<string>("");
  const [savingGoal, setSavingGoal] = useState<boolean>(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Route presets helper
  const popularDestinations = [
    { country: "United Kingdom", streams: ["Skilled Worker Visa", "Student Visa (Higher Education)"] },
    { country: "Germany", streams: ["Opportunity Card (Chancenkarte)", "EU Blue Card"] },
    { country: "Albania", streams: ["Unique Residence & Work Permit (Leje Unike)", "Self-Employment / Nomad"] },
    { country: "Canada", streams: ["Express Entry (Federal Skilled Worker)", "Study Permit"] },
    { country: "United States", streams: ["Specialty / Extraordinary Employment (H-1B / O-1A)"] },
  ];

  useEffect(() => {
    fetchAudit();
  }, []);

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/user/advisor");
      if (res.ok) {
        const data = await res.json();
        setAudit(data.audit);
      }
    } catch (err) {
      console.error("Failed to fetch advisor audit:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunReAudit = async (useLiveAi: boolean = true) => {
    try {
      setReAuditing(true);
      const url = useLiveAi ? "/api/v1/user/advisor?liveAi=true" : "/api/v1/user/advisor";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAudit(data.audit);
        setLiveAiActive(useLiveAi);
        setActionMessage(
          useLiveAi
            ? "Consular Audit complete: Evaluated against sovereign visa regulations, forensic financial holding, and vault proofs."
            : "Audit refreshed against active goals."
        );
        setTimeout(() => setActionMessage(null), 6000);
      }
    } catch (err) {
      console.error("Re-audit failed:", err);
    } finally {
      setReAuditing(false);
    }
  };

  const openCreateModal = () => {
    setEditingGoalId(null);
    setGoalType("relocation");
    setGoalTitle("");
    setTargetCountry("");
    setShowGoalModal(true);
  };

  const openEditModal = (goal: TargetGoal) => {
    setEditingGoalId(goal.id);
    setGoalType(goal.type);
    setGoalTitle(goal.title);
    setTargetCountry(goal.targetCountry || "");
    setShowGoalModal(true);
  };

  const handleSaveGoal = async () => {
    if (!goalTitle.trim()) return;
    try {
      setSavingGoal(true);
      const res = await fetch("/api/v1/user/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingGoalId ? { id: editingGoalId } : {}),
          type: goalType,
          title: goalTitle.trim(),
          targetCountry: targetCountry.trim() || "Global",
          status: "active",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAudit(data.audit);
        setShowGoalModal(false);
        setEditingGoalId(null);
        setGoalTitle("");
        setTargetCountry("");
        setActionMessage(editingGoalId ? "Target goal updated." : "Target goal added.");
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error("Save goal failed:", err);
    } finally {
      setSavingGoal(false);
    }
  };

  const handleDeleteGoal = async (goalId: string, goalTitle: string) => {
    if (!confirm(`Are you sure you want to remove the goal "${goalTitle}"?`)) {
      return;
    }
    try {
      setDeletingGoalId(goalId);
      const res = await fetch(`/api/v1/user/advisor?id=${encodeURIComponent(goalId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setAudit(data.audit);
        setActionMessage(`Goal "${goalTitle}" removed.`);
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error("Delete goal failed:", err);
    } finally {
      setDeletingGoalId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const score = audit?.overallReadinessScore || 0;
  const verdict = audit?.decisionVerdict || (score >= 80 ? "READY_TO_APPLY" : score >= 50 ? "BORDERLINE_RISK" : "HIGH_REFUSAL_PROBABILITY");
  const forensics = audit?.financialForensics as FinancialForensicsReport | undefined;
  const checklist = (audit?.checklist || []) as ConsularChecklistItem[];
  const route = audit?.consularRoute as ConsularVisaRoute | undefined;

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">AI Sovereign Target Advisor</h2>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <Sparkles className="h-3.5 w-3.5" /> Virtual Consular Officer Active
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Acts as an authoritative immigration officer for your destination countries. Autonomously audits maintenance funds, consecutive 28-day holding, transaction consistency, and passport MRZ validity against statutory criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 text-emerald-600" /> Add Target Goal
          </button>
          <button
            onClick={() => handleRunReAudit(true)}
            disabled={reAuditing}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${reAuditing ? "animate-spin" : ""}`} />
            {reAuditing ? "Auditing Consular Rules..." : "Run Live Consular Audit"}
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Consular Decision Verdict Banner */}
      <div
        className={`rounded-2xl border p-5 shadow-xs transition-all ${
          verdict === "READY_TO_APPLY"
            ? "border-emerald-200 bg-emerald-50/70"
            : verdict === "BORDERLINE_RISK"
            ? "border-amber-200 bg-amber-50/70"
            : "border-red-200 bg-red-50/70"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                verdict === "READY_TO_APPLY"
                  ? "bg-emerald-600 text-white"
                  : verdict === "BORDERLINE_RISK"
                  ? "bg-amber-500 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {verdict === "READY_TO_APPLY" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : verdict === "BORDERLINE_RISK" ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <ShieldAlert className="h-6 w-6" />
              )}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  {verdict === "READY_TO_APPLY"
                    ? "Consular Decision Matrix: High Issuance Probability"
                    : verdict === "BORDERLINE_RISK"
                    ? "Consular Decision Matrix: Borderline Application — Action Needed"
                    : "Consular Decision Matrix: High Refusal Risk (Statutory Gaps)"}
                </span>
                <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                  {route?.statutoryAuthority || "Sovereign Consular Adjudication"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-700 leading-relaxed max-w-3xl">
                {verdict === "READY_TO_APPLY"
                  ? "Your cryptographic credentials and liquid financial records satisfy all core statutory entry requirements. Minimal risk of consular refusal."
                  : verdict === "BORDERLINE_RISK"
                  ? "Core qualifications are strong, but procedural flags (e.g. statement duration holding, uncertified translation, or name reconciliation) must be addressed."
                  : "Critical statutory blockers detected (e.g. insufficient maintenance funds, missing passport MRZ, or sudden deposit spike). Refusal is virtually certain unless resolved."}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <Link
              href="/dashboard/documents"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> Upload Missing Documents
            </Link>
          </div>
        </div>
      </div>

      {/* Readiness Radar & Active Goals Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Score Card (4 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Aggregate Readiness Radar
              </span>
              {liveAiActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 ring-1 ring-purple-200">
                  <Sparkles className="h-3 w-3" /> Live Consular AI
                </span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-heading text-5xl font-extrabold text-slate-900">{score}%</span>
              <span className="text-xs font-bold text-slate-500">Readiness Score</span>
            </div>

            {/* Score progress bar */}
            <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              {score >= 80
                ? "Excellent standing. Your cryptographic credentials fulfill core requirements for your selected targets."
                : score >= 50
                ? "Moderate readiness. Several key credentials or language attestations require attention."
                : "Action needed. Critical missing documents will cause immediate rejection if evaluated."}
            </p>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Active Goals Tracked:</span>
              <span className="font-bold text-slate-900">{audit?.activeGoals?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-slate-500">Identified Statutory Gaps:</span>
              <span className="font-bold text-red-600">{audit?.gapAlerts?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-slate-500">Financial Solvency Grade:</span>
              <span className="font-bold text-emerald-700">Grade {forensics?.financialHealthGrade || "—"}</span>
            </div>
          </div>
        </div>

        {/* Active Target Goals (8 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Target className="h-4 w-4 text-emerald-600" /> Tracked Target Goals ({audit?.activeGoals?.length || 0})
            </h3>
            <button
              onClick={openCreateModal}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Goal
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(!audit?.activeGoals || audit.activeGoals.length === 0) && (
              <div className="col-span-2 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <Target className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-600">No active target goals configured</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select destination countries (e.g. United Kingdom, Germany, Albania, Canada) to activate deep statutory consular auditing.
                </p>
                <button
                  onClick={openCreateModal}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Add First Goal
                </button>
              </div>
            )}

            {audit?.activeGoals?.map((goal) => {
              const typeIcon =
                goal.type === "relocation" ? (
                  <Plane className="h-4 w-4 text-sky-600" />
                ) : goal.type === "academic" ? (
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                ) : (
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                );

              const isDeleting = deletingGoalId === goal.id;

              return (
                <div
                  key={goal.id}
                  className="group relative rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 hover:border-slate-300 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      {typeIcon} {goal.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600 border border-slate-200">
                        {goal.type}
                      </span>
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(goal)}
                        title="Edit Goal"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteGoal(goal.id, goal.title)}
                        disabled={isDeleting}
                        title="Delete Goal"
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className={`h-3.5 w-3.5 ${isDeleting ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">Destination: {goal.targetCountry || "Global"}</p>
                  {goal.mandatoryCredentials && goal.mandatoryCredentials.length > 0 && (
                    <div className="text-[10px] text-slate-600 space-y-0.5 pt-1">
                      <span className="font-semibold text-slate-700">Audit Rules:</span>
                      <ul className="list-disc list-inside">
                        {goal.mandatoryCredentials.slice(0, 2).map((req, i) => (
                          <li key={i} className="truncate">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Forensic Financial Maintenance Card */}
      {forensics && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Coins className="h-4 w-4 text-emerald-600" /> Deep Financial Forensic & Solvency Audit
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Statutory maintenance funds evaluation, currency conversions, 28-day consecutive holding verification, and sudden deposit (funds dumping) radar.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                forensics.financialHealthGrade === "A"
                  ? "bg-emerald-100 text-emerald-800"
                  : forensics.financialHealthGrade === "B"
                  ? "bg-sky-100 text-sky-800"
                  : forensics.financialHealthGrade === "C"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Consular Grade {forensics.financialHealthGrade}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Statutory Requirement</span>
              <p className="text-base font-extrabold text-slate-900">
                {forensics.targetCurrency} {forensics.requiredAmount.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">Official Consular Minimum</span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Detected Balance (Converted)</span>
              <p
                className={`text-base font-extrabold ${
                  forensics.isAmountSufficient ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {forensics.targetCurrency} {forensics.detectedLiquidBalance.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">
                From {forensics.detectedCurrency} (Rate: {forensics.exchangeRateUsed})
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Consecutive Holding</span>
              <p
                className={`text-base font-extrabold flex items-center gap-1 ${
                  forensics.isConsecutiveRuleSatisfied ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {forensics.consecutiveDaysPassed} Days
                <span className="text-[10px] text-slate-400 font-normal">/ {forensics.consecutiveDaysRequired}d req</span>
              </p>
              <span className="text-[10px] text-slate-500">28/90-Day Consecutive Rule</span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Funds Dumping Flag</span>
              <p
                className={`text-base font-extrabold flex items-center gap-1 ${
                  forensics.suddenDepositDetected ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {forensics.suddenDepositDetected ? "Spike Detected" : "Clear (Zero Spikes)"}
              </p>
              <span className="text-[10px] text-slate-500">Deposit Velocity Scrutiny</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Name Match Audit:</span>{" "}
                <span className="text-slate-600">
                  {forensics.accountHolderNameMatch
                    ? `Bank account name ("${forensics.accountNameDetected}") matches verified passport legal name ("${forensics.passportNameDetected}").`
                    : `Name variance detected ("${forensics.accountNameDetected}" vs "${forensics.passportNameDetected}"). Notarized affidavit recommended.`}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Consular Financial Verdict:</span>{" "}
                <span className="text-slate-600">{forensics.summary}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authoritative Consular Requirements Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Scale className="h-4 w-4 text-emerald-600" /> Consular Requirements & Verification Checklist ({checklist.length})
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Line-by-line statutory checklist required by consular visa officers. Compliant items are ticked; flags indicate refusal risks with exact remediation actions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              ✓ {checklist.filter((c) => c.isSatisfied).length} Verified
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              ! {checklist.filter((c) => !c.isSatisfied).length} Open
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {checklist.map((item) => {
            const isVerified = item.status === "verified";
            const isRefusalRisk = item.status === "refusal_risk";

            return (
              <div
                key={item.id}
                className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between transition-all ${
                  isVerified
                    ? "border-emerald-100 bg-emerald-50/30"
                    : isRefusalRisk
                    ? "border-red-200 bg-red-50/40"
                    : "border-amber-200 bg-amber-50/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      isVerified
                        ? "bg-emerald-100 text-emerald-700"
                        : isRefusalRisk
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {isVerified ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : isRefusalRisk ? (
                      <AlertOctagon className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </span>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                          isVerified
                            ? "bg-emerald-100 text-emerald-800"
                            : isRefusalRisk
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isVerified ? "Verified [✓]" : isRefusalRisk ? "Refusal Risk [✗]" : "Action Needed [!]"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">({item.statutoryCitation})</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{item.requirement}</p>

                    {item.proofSnippet && (
                      <p className="text-[11px] font-medium text-slate-600 flex items-center gap-1 pt-0.5">
                        <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{item.proofSnippet}</span>
                      </p>
                    )}

                    {!isVerified && item.suggestedAction && (
                      <p className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 pt-1">
                        <ArrowRight className="h-3 w-3" /> Remediation: {item.suggestedAction}
                      </p>
                    )}
                  </div>
                </div>

                {!isVerified && (
                  <div className="sm:self-center shrink-0">
                    <Link
                      href={item.rectificationUrl || "/dashboard/documents"}
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      Upload & Rectify
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column Bottom: Cryptographic Strengths & Action Milestones */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Verified Strengths */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Cryptographic Vault Strengths
          </h3>
          <ul className="space-y-2">
            {(!audit?.strengths || audit.strengths.length === 0) && (
              <li className="text-xs text-slate-400 italic">No verified vault credentials analyzed yet.</li>
            )}
            {audit?.strengths?.map((st, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Recommended Milestones */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Next Recommended Action Milestones
          </h3>
          <ul className="space-y-2">
            {(!audit?.nextMilestones || audit.nextMilestones.length === 0) && (
              <li className="text-xs text-slate-400 italic">No pending milestones. Your targets are on track!</li>
            )}
            {audit?.nextMilestones?.map((ms, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800 mt-0.5">
                  {i + 1}
                </span>
                <span>{ms}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add / Edit Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingGoalId ? "Edit Sovereign Target Goal" : "Add Sovereign Target Goal"}
              </h3>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Goal Type</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                >
                  <option value="relocation">Immigration & Visa Relocation</option>
                  <option value="job">Talent & Career Selection</option>
                  <option value="academic">Academic Admissions & Scholarships</option>
                  <option value="procurement">Legal Due Diligence & Procurement</option>
                </select>
              </div>

              {/* Popular Destination Quick-Select Chips */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quick-Select Destination</label>
                <div className="flex flex-wrap gap-1.5">
                  {popularDestinations.map((p) => (
                    <button
                      key={p.country}
                      type="button"
                      onClick={() => {
                        setTargetCountry(p.country);
                        setGoalTitle(p.streams[0]);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                        targetCountry.toLowerCase() === p.country.toLowerCase()
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {p.country}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Target Country / Jurisdiction *</label>
                <input
                  type="text"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  placeholder="e.g. United Kingdom, Germany, Albania, Canada"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Visa Stream / Goal Title *</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Skilled Worker Visa / Chancenkarte / Unique Permit"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingGoal || !goalTitle.trim()}
                onClick={handleSaveGoal}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {savingGoal ? "Saving..." : editingGoalId ? "Update Target Goal" : "Add Target Goal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
