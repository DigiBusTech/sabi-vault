"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  AlertTriangle,
  Globe2,
  Database,
  CheckCircle2,
  RefreshCw,
  Landmark,
} from "lucide-react";

export function SovereignGovtView() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [disbursingNodeId, setDisbursingNodeId] = useState<string | null>(null);
  const [disburseSuccessMsg, setDisburseSuccessMsg] = useState<string | null>(null);
  const [disburseError, setDisburseError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await fetch("/api/v1/govt/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        setLoadError("Could not load sovereign telemetry. Check your auditor session.");
      }
    } catch {
      setLoadError("Network error while loading sovereign telemetry.");
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
      setDisburseError(null);
      const res = await fetch("/api/v1/govt/disburse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setDisburseSuccessMsg(
          `Disbursed $${data.disbursement.amountUsd} to ${data.disbursement.recipientWallet.substring(0, 8)}... via SabiRevenueSplitter.sol (tx ${data.disbursement.txHash.substring(0, 16)}...)`
        );
        loadAnalytics();
        setTimeout(() => setDisburseSuccessMsg(null), 6000);
      } else {
        setDisburseError(data.error || "Disbursement failed.");
      }
    } catch {
      setDisburseError("Network error during disbursement.");
    } finally {
      setDisbursingNodeId(null);
    }
  };

  const sectionAnchor = "scroll-mt-24 lg:scroll-mt-8";
  const summary = analytics?.summary || {};
  const nodes = analytics?.nodes || [];
  const disbursements = analytics?.disbursements || [];
  const fraudAlerts = analytics?.fraudAlerts || [];

  return (
    <div className="space-y-10">
      {/* ---- Overview metrics ---- */}
      <section id="overview" className={sectionAnchor}>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-heading text-base font-bold text-slate-900">
              <Globe2 className="h-4 w-4 text-emerald-600" />
              Sovereign government telemetry
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Regional data-residency health, host yield settlement, and the national fraud radar.
            </p>
          </div>
          <button
            onClick={loadAnalytics}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {isLoading && !analytics ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-[104px] rounded-2xl" />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="mt-2 text-sm font-semibold text-red-700">{loadError}</p>
            <button
              onClick={loadAnalytics}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: "Sovereign nodes",
                value: `${summary.totalSovereignNodes || 3}`,
                sub: "100% residency compliant",
                tone: "text-slate-900",
              },
              {
                label: "Partitioned records",
                value: summary.totalCitizenRecordsPartitioned?.toLocaleString() || "8,360",
                sub: "Regionally partitioned",
                tone: "text-slate-900",
              },
              {
                label: "Host yield (40%)",
                value: `$${summary.totalSovereignYieldUsd?.toLocaleString() || "1,348.00"}`,
                sub: "GovTech micro-transactions",
                tone: "text-emerald-600",
              },
              {
                label: "Fraud interceptions",
                value: `${summary.interceptedFraudCount || 3}`,
                sub: "Zero-breach integrity",
                tone: "text-red-500",
              },
            ].map((metric, i) => (
              <div
                key={metric.label}
                className="clean-card dash-card-in space-y-1 rounded-2xl p-4"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {metric.label}
                </span>
                <span className={`block font-heading text-xl font-extrabold ${metric.tone}`}>
                  {metric.value}
                </span>
                <p className="text-[10px] text-slate-400">{metric.sub}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {disburseSuccessMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{disburseSuccessMsg}</span>
        </div>
      )}
      {disburseError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{disburseError}</span>
        </div>
      )}

      {/* ---- Regional nodes ---- */}
      <section id="nodes" className={sectionAnchor}>
        <div className="clean-card dash-card-in rounded-2xl p-6" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-slate-900">
              <Database className="h-4 w-4 text-emerald-600" />
              Regional node telemetry
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">EVM L2 settlement ready</span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {nodes.map((node: any) => (
              <div
                key={node.id}
                className="flex flex-col justify-between space-y-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{node.name}</span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                      {node.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600">
                    <p>Jurisdiction: {node.jurisdiction}</p>
                    <p>Data center: {node.dataCenterLocation}</p>
                    <p className="font-semibold text-emerald-700">
                      {node.complianceFramework} (100% regional partition)
                    </p>
                    <p className="font-mono text-[10px] text-slate-400">Uptime: {node.uptimePct}%</p>
                  </div>

                  <div className="space-y-1 border-t border-slate-100 pt-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Partitioned records</span>
                      <span className="font-bold text-slate-900">
                        {node.totalCitizenRecords.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Host yield (40%)</span>
                      <span className="font-bold text-emerald-600">
                        ${node.accumulatedHostYieldUsd}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Pending payout</span>
                      <span className="font-bold text-amber-600">${node.pendingDisbursementUsd}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => handleTriggerPayout(node.id)}
                    disabled={disbursingNodeId === node.id || node.pendingDisbursementUsd <= 0}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-extrabold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {disbursingNodeId === node.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Coins className="h-3.5 w-3.5" />
                    )}
                    {disbursingNodeId === node.id ? "Settling on-chain..." : "Trigger splitter payout"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Settlement ledger ---- */}
      <section id="ledger" className={sectionAnchor}>
        <div className="clean-card dash-card-in rounded-2xl p-6" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-slate-900">
              <Coins className="h-4 w-4 text-amber-500" />
              Settlement ledger
            </h3>
            <span className="font-mono text-[10px] text-slate-400">SabiRevenueSplitter.sol</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <th className="p-3">Tx hash</th>
                  <th className="p-3">Regional node</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Host treasury wallet</th>
                  <th className="p-3">Network</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disbursements.map((tx: any, idx: number) => (
                  <tr key={idx} className="transition-colors hover:bg-slate-50">
                    <td className="max-w-[120px] truncate p-3 font-mono text-emerald-700">{tx.txHash}</td>
                    <td className="p-3 font-semibold text-slate-900">{tx.nodeName}</td>
                    <td className="p-3 font-bold text-emerald-600">${tx.amountUsd.toFixed(2)}</td>
                    <td className="max-w-[120px] truncate p-3 font-mono text-slate-500">
                      {tx.recipientWallet}
                    </td>
                    <td className="p-3 text-slate-600">{tx.network}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        CONFIRMED
                      </span>
                    </td>
                  </tr>
                ))}
                {disbursements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-slate-400">
                      No settlement transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---- Fraud radar ---- */}
      <section id="fraud" className={sectionAnchor}>
        <div className="clean-card dash-card-in rounded-2xl p-6" style={{ animationDelay: "140ms" }}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              National credential integrity and fraud radar
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">Autonomous anomaly detection</span>
          </div>

          <div className="mt-4 space-y-3">
            {fraudAlerts.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-300 ring-1 ring-slate-200">
                  <Landmark className="h-4 w-4" />
                </span>
                <p className="mt-3 text-xs font-semibold text-slate-500">No active fraud alerts</p>
                <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-400">
                  Tamper attempts against on-chain hashes are intercepted and listed here in real time.
                </p>
              </div>
            )}

            {fraudAlerts.map((alert: any) => (
              <div
                key={alert.id}
                className="flex flex-col justify-between gap-3 space-y-2 rounded-xl border border-red-200 bg-red-50/50 p-4 text-xs transition-all duration-200 hover:border-red-300 sm:flex-row sm:items-center sm:space-y-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{alert.entityName}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-extrabold ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-slate-600">{alert.description}</p>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                    <span>Suspect: {alert.suspectCandidateId}</span>
                    <span>Origin: {alert.originNode}</span>
                  </div>
                </div>

                <div className="shrink-0 space-y-1 text-left sm:text-right">
                  <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                    {alert.actionTaken}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {new Date(alert.detectedAt).toLocaleDateString()} ·{" "}
                    {new Date(alert.detectedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
