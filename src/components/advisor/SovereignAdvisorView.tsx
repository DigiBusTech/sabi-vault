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
} from "lucide-react";
import { SovereignAdvisorAudit, TargetGoal, AdvisorGapAlert } from "@/types/profile";
import Link from "next/link";

export function SovereignAdvisorView() {
  const [audit, setAudit] = useState<SovereignAdvisorAudit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reAuditing, setReAuditing] = useState<boolean>(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState<boolean>(false);

  // New goal draft
  const [goalType, setGoalType] = useState<"job" | "relocation" | "academic" | "procurement">("relocation");
  const [goalTitle, setGoalTitle] = useState<string>("");
  const [targetCountry, setTargetCountry] = useState<string>("");

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

  const handleRunReAudit = async () => {
    try {
      setReAuditing(true);
      const res = await fetch("/api/v1/user/advisor");
      if (res.ok) {
        const data = await res.json();
        setAudit(data.audit);
      }
    } catch (err) {
      console.error("Re-audit failed:", err);
    } finally {
      setReAuditing(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) return;
    try {
      const res = await fetch("/api/v1/user/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: goalType,
          title: goalTitle,
          targetCountry: targetCountry || "Global",
          status: "active",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAudit(data.audit);
        setShowAddGoalModal(false);
        setGoalTitle("");
        setTargetCountry("");
      }
    } catch (err) {
      console.error("Create goal failed:", err);
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
  const scoreColor =
    score >= 80 ? "text-emerald-600 bg-emerald-50 border-emerald-200" : score >= 50 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">AI Sovereign Target Advisor</h2>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <Sparkles className="h-3.5 w-3.5" /> Autonomous Guidance Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Continuously monitors your verified credentials against immigration visa rules, academic prerequisites, and global employer criteria. Proactively alerts you to gaps before you apply.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Target Goal
          </button>
          <button
            onClick={handleRunReAudit}
            disabled={reAuditing}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${reAuditing ? "animate-spin" : ""}`} />
            {reAuditing ? "Auditing Vault..." : "Run Live AI Audit"}
          </button>
        </div>
      </div>

      {/* Readiness Radar & Active Goals Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Score Card (4 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Aggregate Readiness Radar
            </span>
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
              <span className="text-slate-500">Identified Gap Alerts:</span>
              <span className="font-bold text-red-600">{audit?.gapAlerts?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Active Target Goals (8 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Target className="h-4 w-4 text-emerald-600" /> Tracked Target Goals ({audit?.activeGoals?.length || 0})
            </h3>
            <span className="text-[11px] text-slate-400">Multi-target evaluation enabled</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {audit?.activeGoals?.map((goal) => {
              const typeIcon =
                goal.type === "relocation" ? (
                  <Plane className="h-4 w-4 text-sky-600" />
                ) : goal.type === "academic" ? (
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                ) : (
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                );

              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      {typeIcon} {goal.title}
                    </span>
                    <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600 border border-slate-200">
                      {goal.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Destination: {goal.targetCountry}</p>
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

      {/* Proactive Gap Alerts Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Proactive Credential & Compliance Gap Alerts
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Actionable advice generated by Sentinel & Sovereign Path AI to optimize your acceptance rate.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            {audit?.gapAlerts?.length || 0} Open Items
          </span>
        </div>

        <div className="space-y-3">
          {audit?.gapAlerts?.map((alert) => {
            const isCritical = alert.severity === "critical";
            const isWarning = alert.severity === "warning";

            return (
              <div
                key={alert.id}
                className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between transition-all ${
                  isCritical
                    ? "border-red-200 bg-red-50/50"
                    : isWarning
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-sky-200 bg-sky-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      isCritical
                        ? "bg-red-100 text-red-600"
                        : isWarning
                        ? "bg-amber-100 text-amber-600"
                        : "bg-sky-100 text-sky-600"
                    }`}
                  >
                    {isCritical ? (
                      <AlertOctagon className="h-3.5 w-3.5" />
                    ) : (
                      <Lightbulb className="h-3.5 w-3.5" />
                    )}
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                          isCritical
                            ? "bg-red-200 text-red-800"
                            : isWarning
                            ? "bg-amber-200 text-amber-800"
                            : "bg-sky-200 text-sky-800"
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{alert.message}</p>
                    <p className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 pt-1">
                      <ArrowRight className="h-3 w-3" /> Action: {alert.suggestedAction}
                    </p>
                  </div>
                </div>

                <div className="sm:self-center shrink-0">
                  <Link
                    href="/dashboard/documents"
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    Upload & Resolve
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column Bottom: Strengths & Next Milestones */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Verified Strengths */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Cryptographic Vault Strengths
          </h3>
          <ul className="space-y-2">
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

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Sovereign Target Goal</h3>

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

              <div>
                <label className="text-xs font-bold text-slate-700">Goal Title / Position</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Canada Express Entry / Staff Engineer"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Target Country / Jurisdiction</label>
                <input
                  type="text"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  placeholder="e.g. Canada, Germany, United States"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddGoalModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateGoal}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Add Target Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

