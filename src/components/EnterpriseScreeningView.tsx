"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Key,
  Shield,
  Layers,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Plus,
  FileText,
  Search,
  Sparkles,
  Users,
  Copy,
  ChevronRight,
  TrendingUp,
  Award,
  Lock,
  Check,
} from "lucide-react";
import { CriteriaProfile, CandidateEvaluationResult } from "@/core/enterprise/criteria_store";

export function EnterpriseScreeningView() {
  const [rubrics, setRubrics] = useState<CriteriaProfile[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState<string>("rubric_immigration_tech_visa");
  const [activeMode, setActiveMode] = useState<"single" | "bulk">("single");

  // Single Screening State
  const [singleKey, setSingleKey] = useState<string>("");
  const [requestingOrg, setRequestingOrg] = useState<string>("Verified Enterprise Screener");
  const [isSingleLoading, setIsSingleLoading] = useState<boolean>(false);
  const [singleResult, setSingleResult] = useState<CandidateEvaluationResult | null>(null);

  // Bulk Screening State
  const [bulkKeysText, setBulkKeysText] = useState<string>("");
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);
  const [bulkResult, setBulkResult] = useState<any | null>(null);

  // Custom Rubric Modal State
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<"IMMIGRATION" | "LABOUR" | "EDUCATION" | "CUSTOM">("LABOUR");
  const [customMinGpa, setCustomMinGpa] = useState<string>("3.5");
  const [customMinFunds, setCustomMinFunds] = useState<string>("10000");
  const [customMinExp, setCustomMinExp] = useState<string>("3");
  const [customTier2Required, setCustomTier2Required] = useState<boolean>(true);

  // Fetch rubrics
  const loadRubrics = async () => {
    try {
      const res = await fetch("/api/v1/enterprise/criteria");
      if (res.ok) {
        const data = await res.json();
        setRubrics(data.profiles);
      }
    } catch (err) {
      console.error("Failed to load rubrics:", err);
    }
  };

  useEffect(() => {
    loadRubrics();
  }, []);

  const activeRubric = rubrics.find((r) => r.id === selectedRubricId) || rubrics[0];

  // Execute Single Screening
  const handleSingleScreen = async () => {
    if (!singleKey) return;
    setIsSingleLoading(true);
    setSingleResult(null);

    try {
      const res = await fetch("/api/v1/enterprise/screen-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keys: [singleKey],
          rubricId: selectedRubricId,
          requestingOrg,
        }),
      });

      const data = await res.json();
      if (res.ok && data.candidates?.length > 0) {
        setSingleResult(data.candidates[0]);
      } else {
        alert(data.error || "Single screening failed.");
      }
    } catch (err) {
      console.error("Single screening error:", err);
    } finally {
      setIsSingleLoading(false);
    }
  };

  // Execute Bulk Screening
  const handleBulkScreen = async () => {
    const rawKeys = bulkKeysText
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (rawKeys.length === 0) return;
    setIsBulkLoading(true);
    setBulkResult(null);

    try {
      const res = await fetch("/api/v1/enterprise/screen-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keys: rawKeys,
          rubricId: selectedRubricId,
          requestingOrg: "Enterprise High-Volume Screener",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBulkResult(data);
      } else {
        alert(data.error || "Batch screening failed.");
      }
    } catch (err) {
      console.error("Batch screening error:", err);
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Preload Demo Keys for Batch
  const handlePreloadDemoBatch = async () => {
    try {
      const res = await fetch("/api/v1/vault/keys");
      if (res.ok) {
        const data = await res.json();
        const primaryKey = data.keys?.[0]?.rawKey || "";
        setBulkKeysText(
          `${primaryKey}\n${primaryKey}#cand_2\n${primaryKey}#cand_3`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Custom Rubric
  const handleCreateCustomRubric = async () => {
    if (!customName || !customDescription) return;
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
          requiredCategories: ["academics", "finance", "experience"],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRubrics(data.profiles);
        setSelectedRubricId(data.profile.id);
        setShowCustomModal(false);
        setCustomName("");
        setCustomDescription("");
      }
    } catch (err) {
      console.error("Failed to create criteria profile:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Dynamic Criteria Studio & Screening Overview */}
      <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full mb-2">
              <Sliders className="w-3.5 h-3.5" />
              Dynamic Grounding & Zero-Hallucination RAG Studio
            </div>
            <h2 className="text-xl font-extrabold text-white">Enterprise Screening & Criteria Studio</h2>
            <p className="text-xs text-slate-400">
              Configure strict mathematical evaluation rubrics. Autonomous agents verify structured candidate JSON
              against Base Sepolia on-chain hashes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              New Grounding Rubric
            </button>
          </div>
        </div>

        {/* Rubric Selector & Rule Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Active Evaluation Rubric:
            </label>
            <select
              value={selectedRubricId}
              onChange={(e) => setSelectedRubricId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-500"
            >
              {rubrics.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.category})
                </option>
              ))}
            </select>

            {activeRubric && (
              <p className="text-xs text-slate-400 leading-relaxed italic bg-black/40 p-3 rounded-xl border border-slate-800/80">
                "{activeRubric.description}"
              </p>
            )}
          </div>

          {activeRubric && (
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Min GPA Required</span>
                <div className="text-sm font-extrabold text-white">
                  {activeRubric.minGpa ? `${activeRubric.minGpa} / 5.0` : "None"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Liquid Funds</span>
                <div className="text-sm font-extrabold text-emerald-400">
                  {activeRubric.minLiquidFundsUsd
                    ? `$${activeRubric.minLiquidFundsUsd.toLocaleString()} USD`
                    : "None"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Min Experience</span>
                <div className="text-sm font-extrabold text-cyan-400">
                  {activeRubric.minExperienceYears ? `${activeRubric.minExperienceYears}+ Years` : "None"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Tier-2 Notarized</span>
                <div className="text-sm font-extrabold text-amber-400">
                  {activeRubric.mandatoryTier2Notarization ? "Mandatory" : "Optional"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher: Single vs Bulk */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveMode("single")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMode === "single"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Single Candidate Screening
        </button>
        <button
          onClick={() => setActiveMode("bulk")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMode === "bulk"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Bulk Candidate Screening Queue
        </button>
      </div>

      {/* MODE 1: SINGLE CANDIDATE SCREENING */}
      {activeMode === "single" && (
        <div className="space-y-6">
          <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Candidate Scoped API Key:
                </label>
                <input
                  type="text"
                  value={singleKey}
                  onChange={(e) => setSingleKey(e.target.value)}
                  placeholder="Paste candidate scoped key (e.g. sbk_live_v1_...)"
                  className="w-full bg-black/60 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs font-mono text-cyan-300 placeholder-slate-600 outline-none"
                />
              </div>

              <div className="lg:col-span-4 space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Requesting Organization:
                </label>
                <input
                  type="text"
                  value={requestingOrg}
                  onChange={(e) => setRequestingOrg(e.target.value)}
                  className="w-full bg-black/60 border border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Query Fee: <span className="font-semibold text-slate-200">$1.00</span> ($0.60 Sabi / $0.40 Sovereign Node Host)
              </div>

              <button
                onClick={handleSingleScreen}
                disabled={isSingleLoading || !singleKey}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
              >
                {isSingleLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                {isSingleLoading ? "Evaluating..." : "Run Multi-Agent Screening"}
              </button>
            </div>
          </div>

          {/* Single Screening Result Dossier */}
          {singleResult && (
            <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">
                      Candidate ID: {singleResult.candidateId}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                        singleResult.verdict === "QUALIFIED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : singleResult.verdict === "CONDITIONALLY_QUALIFIED"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {singleResult.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Sovereign Node: {singleResult.sovereignNode} • Evaluated against {activeRubric?.name}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-cyan-400">
                    {singleResult.compositeScore} / 100
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Composite Fit Score
                  </span>
                </div>
              </div>

              {/* 3 Agent Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">1. Integrity Agent</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-emerald-300 font-mono">
                    Ledger Status: {singleResult.integrityStatus}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">2. Strict RAG Evaluator</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Zero Hallucination Guarantee • Mathematical Schema Match
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">3. Fraud & Anomaly Radar</span>
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {singleResult.anomaliesDetected?.length > 0
                      ? `${singleResult.anomaliesDetected.length} Anomaly Flagged`
                      : "Zero Anomalies Detected"}
                  </p>
                </div>
              </div>

              {/* Citations Box */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Verbatim Verified Proof Citations:
                </span>
                <div className="space-y-1.5">
                  {singleResult.citations?.map((cit, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{cit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GovTech 60/40 Micro-Transaction Settlement Receipt */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/20 via-slate-900 to-cyan-950/20 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    GovTech 60/40 Micro-Transaction Executed
                  </div>
                  <p className="text-[11px] text-slate-400">
                    $0.60 to Sabi Platform Treasury • $0.40 directly to Sovereign Node Host
                  </p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 bg-black/60 px-3 py-1.5 rounded-lg border border-slate-800">
                  On-Chain Tx: {singleResult.onChainTx.substring(0, 16)}...
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: BULK CANDIDATE SCREENING QUEUE */}
      {activeMode === "bulk" && (
        <div className="space-y-6">
          <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white">Batch Candidate Key Ingestion</h3>
                <p className="text-xs text-slate-400">
                  Enter one candidate scoped API key per line to screen candidate pools in parallel.
                </p>
              </div>

              <button
                onClick={handlePreloadDemoBatch}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold hover:bg-purple-500/30"
              >
                Pre-fill Demo Batch
              </button>
            </div>

            <textarea
              rows={4}
              value={bulkKeysText}
              onChange={(e) => setBulkKeysText(e.target.value)}
              placeholder="sbk_live_v1_...\nsbk_live_v1_...\nsbk_live_v1_..."
              className="w-full bg-black/60 border border-slate-700 focus:border-purple-500 rounded-xl p-3 font-mono text-xs text-purple-300 placeholder-slate-600 outline-none"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Evaluation Grounding: <span className="font-semibold text-white">{activeRubric?.name}</span>
              </span>

              <button
                onClick={handleBulkScreen}
                disabled={isBulkLoading || !bulkKeysText}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all"
              >
                {isBulkLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                {isBulkLoading ? "Evaluating Pool..." : "Execute Batch Parallel Screening"}
              </button>
            </div>
          </div>

          {/* Bulk Leaderboard Results Table */}
          {bulkResult && (
            <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">Ranked Candidate Leaderboard</h3>
                  <p className="text-xs text-slate-400">
                    {bulkResult.totalCandidates} evaluated: {bulkResult.qualifiedCount} Qualified,{" "}
                    {bulkResult.conditionallyQualifiedCount} Conditional, {bulkResult.rejectedCount} Rejected
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Candidate ID</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Verdict</th>
                      <th className="p-3">Integrity</th>
                      <th className="p-3">Node</th>
                      <th className="p-3">Verified Categories</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {bulkResult.candidates?.map((cand: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 font-bold text-cyan-400">#{idx + 1}</td>
                        <td className="p-3 text-white font-semibold">{cand.candidateId}</td>
                        <td className="p-3 font-extrabold text-white">{cand.compositeScore} / 100</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cand.verdict === "QUALIFIED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : cand.verdict === "CONDITIONALLY_QUALIFIED"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {cand.verdict}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-400">✓ Tamper-Free</td>
                        <td className="p-3 text-slate-400">{cand.sovereignNode}</td>
                        <td className="p-3 text-slate-300 font-sans">
                          {cand.verifiedCategories?.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Grounding Rubric Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border border-slate-800 bg-[#0c1220] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Create Custom Grounding Rubric</h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rubric Name:</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Senior Smart Contract Auditor"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Domain Category:</label>
                <select
                  value={customCategory}
                  onChange={(e: any) => setCustomCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none"
                >
                  <option value="LABOUR">Labour & Enterprise Hiring</option>
                  <option value="IMMIGRATION">Immigration & Visa Processing</option>
                  <option value="EDUCATION">Education & University Admissions</option>
                  <option value="CUSTOM">Custom Organization Rubric</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Grounding Description:</label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Strict qualification requirements for applicants..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min GPA:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customMinGpa}
                    onChange={(e) => setCustomMinGpa(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Funds ($):</label>
                  <input
                    type="number"
                    value={customMinFunds}
                    onChange={(e) => setCustomMinFunds(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Years:</label>
                  <input
                    type="number"
                    value={customMinExp}
                    onChange={(e) => setCustomMinExp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tier2check"
                  checked={customTier2Required}
                  onChange={(e) => setCustomTier2Required(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-800"
                />
                <label htmlFor="tier2check" className="text-slate-300 font-medium">
                  Mandatory Tier-2 Institutional Notarization Required
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomRubric}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
              >
                Save Grounding Rubric
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
