"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Coins,
  AlertTriangle,
  Globe2,
  Database,
  Building,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

export function SovereignGovtView() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [disbursingNodeId, setDisbursingNodeId] = useState<string | null>(null);
  const [disburseSuccessMsg, setDisburseSuccessMsg] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/govt/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to load govt analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleTriggerPayout = async (nodeId: string) => {
    try {
      setDisbursingNodeId(nodeId);
      setDisburseSuccessMsg(null);
      const res = await fetch("/api/v1/govt/disburse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setDisburseSuccessMsg(
          `Disbursed $${data.disbursement.amountUsd} to ${data.disbursement.recipientWallet.substring(0, 8)}... via SabiRevenueSplitter.sol (Tx: ${data.disbursement.txHash.substring(0, 16)}...)`
        );
        loadAnalytics();
        setTimeout(() => setDisburseSuccessMsg(null), 5000);
      } else {
        alert(data.error || "Disbursement failed.");
      }
    } catch (err) {
      console.error("Disbursement error:", err);
    } finally {
      setDisbursingNodeId(null);
    }
  };

  if (isLoading && !analytics) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading Sovereign Government Telemetry & Financials...
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const nodes = analytics?.nodes || [];
  const disbursements = analytics?.disbursements || [];
  const fraudAlerts = analytics?.fraudAlerts || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full mb-2">
              <Globe2 className="w-3.5 h-3.5" />
              Sovereignty First • 100% Data Residency Compliance
            </div>
            <h2 className="text-xl font-extrabold text-white">Sovereign Government & Regional Hub Dashboard</h2>
            <p className="text-xs text-slate-400">
              Real-time regional telemetry, 40% GovTech micro-transaction yield, and National Credential Integrity
              Radar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAnalytics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Telemetry
            </button>
          </div>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Sovereign Nodes</span>
            <div className="text-xl font-extrabold text-white">{summary.totalSovereignNodes || 3} Nodes</div>
            <p className="text-[10px] text-emerald-400">100% Residency Compliant</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Partitioned Records</span>
            <div className="text-xl font-extrabold text-white">
              {summary.totalCitizenRecordsPartitioned?.toLocaleString() || "8,360"}
            </div>
            <p className="text-[10px] text-slate-400">Regional DB Partitioned</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">40% Host Yield (Cumulative)</span>
            <div className="text-xl font-extrabold text-emerald-400">
              ${summary.totalSovereignYieldUsd?.toLocaleString() || "1,348.00"}
            </div>
            <p className="text-[10px] text-slate-400">GovTech Micro-Transactions</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Fraud Interceptions</span>
            <div className="text-xl font-extrabold text-red-400">{summary.interceptedFraudCount || 3} Threats</div>
            <p className="text-[10px] text-slate-400">Zero Breach Integrity</p>
          </div>
        </div>
      </div>

      {disburseSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{disburseSuccessMsg}</span>
        </div>
      )}

      {/* SECTION 1: REGIONAL SOVEREIGN NODES TELEMETRY */}
      <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Regional Sovereign Node Telemetry & Data Residency
          </h3>
          <span className="text-[10px] text-slate-400">EVM L2 Settlement Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map((node: any) => (
            <div
              key={node.id}
              className="border border-slate-800 bg-slate-900/50 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{node.name}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {node.status}
                  </span>
                </div>

                <div className="text-[11px] space-y-1 text-slate-300">
                  <p className="text-slate-400">Jurisdiction: {node.jurisdiction}</p>
                  <p className="text-slate-400">Data Center: {node.dataCenterLocation}</p>
                  <p className="text-emerald-400 font-semibold">
                    Compliance: {node.complianceFramework} (100% Regional Partition)
                  </p>
                  <p className="font-mono text-[10px] text-slate-400">Uptime: {node.uptimePct}%</p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Partitioned Records:</span>
                    <span className="font-bold text-white">{node.totalCitizenRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Host Yield (40%):</span>
                    <span className="font-bold text-emerald-400">${node.accumulatedHostYieldUsd}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Pending Payout:</span>
                    <span className="font-bold text-amber-400">${node.pendingDisbursementUsd}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => handleTriggerPayout(node.id)}
                  disabled={disbursingNodeId === node.id || node.pendingDisbursementUsd <= 0}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  {disbursingNodeId === node.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Coins className="w-3.5 h-3.5" />
                  )}
                  {disbursingNodeId === node.id ? "Settling On-Chain..." : "Trigger 40% Splitter Payout"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: 40% GOVTECH FINANCIAL SETTLEMENT LEDGER */}
      <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            40% GovTech Micro-Transaction Financial Ledger
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Smart Contract: SabiRevenueSplitter.sol</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Tx Hash (Base Sepolia)</th>
                <th className="p-3">Regional Node</th>
                <th className="p-3">Amount ($ USD)</th>
                <th className="p-3">Host Treasury Wallet</th>
                <th className="p-3">Network</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {disbursements.map((tx: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 text-cyan-400 truncate max-w-[120px]">{tx.txHash}</td>
                  <td className="p-3 text-white font-sans font-semibold">{tx.nodeName}</td>
                  <td className="p-3 font-bold text-emerald-400">${tx.amountUsd.toFixed(2)}</td>
                  <td className="p-3 text-slate-400 truncate max-w-[120px]">{tx.recipientWallet}</td>
                  <td className="p-3 text-slate-300 font-sans">{tx.network}</td>
                  <td className="p-3 text-slate-400 font-sans">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      CONFIRMED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: NATIONAL CREDENTIAL INTEGRITY & FRAUD RADAR */}
      <div className="border border-slate-800 bg-[#0c1220] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            National Credential Integrity & Fraud Radar
          </h3>
          <span className="text-[10px] text-slate-400">Autonomous Anomaly Detection</span>
        </div>

        <div className="space-y-3">
          {fraudAlerts.map((alert: any) => (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-xs space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-red-800 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{alert.entityName}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      alert.severity === "CRITICAL"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-slate-300">{alert.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>Suspect: {alert.suspectCandidateId}</span>
                  <span>Origin Node: {alert.originNode}</span>
                </div>
              </div>

              <div className="shrink-0 text-left sm:text-right space-y-1">
                <span className="inline-block text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                  {alert.actionTaken}
                </span>
                <div className="text-[10px] text-slate-500">
                  Detected: {new Date(alert.detectedAt).toLocaleDateString()} •{" "}
                  {new Date(alert.detectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
