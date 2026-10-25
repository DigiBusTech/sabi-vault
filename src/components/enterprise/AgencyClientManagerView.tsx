"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Send,
  UploadCloud,
  FileCheck2,
  RefreshCw,
  Coins,
  Scale,
  ExternalLink,
  Check,
  Copy,
  Clock,
  Sparkles,
} from "lucide-react";
import { AgencyClientDossier } from "@/core/enterprise/agency_client_service";

export function AgencyClientManagerView() {
  const [clients, setClients] = useState<AgencyClientDossier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Client Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [nationality, setNationality] = useState<string>("Nigerian");
  const [destinationCountry, setDestinationCountry] = useState<string>("United Kingdom");
  const [targetRoute, setTargetRoute] = useState<string>("Skilled Worker Visa");
  const [passportNumber, setPassportNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handover Modal
  const [handoverData, setHandoverData] = useState<{ client: AgencyClientDossier; inviteUrl: string; tempAccessKey: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [auditingClientId, setAuditingClientId] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/enterprise/clients");
      const data = await res.json();
      if (res.ok && data.clients) {
        setClients(data.clients);
      }
    } catch {
      setError("Failed to load managed client dossiers.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/enterprise/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          nationality,
          destinationCountry,
          targetRoute,
          passportNumber,
        }),
      });
      const data = await res.json();
      if (res.ok && data.client) {
        setClients((prev) => [data.client, ...prev]);
        setShowCreateModal(false);
        setFullName("");
        setEmail("");
        setPhone("");
        setPassportNumber("");
      } else {
        setError(data.error || "Failed to create client dossier.");
      }
    } catch {
      setError("Network error while creating client dossier.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunAudit = async (clientId: string) => {
    setAuditingClientId(clientId);
    try {
      const res = await fetch(`/api/v1/enterprise/clients/${clientId}/audit`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.client) {
        setClients((prev) => prev.map((c) => (c.id === clientId ? data.client : c)));
      }
    } catch {
      alert("Failed to execute consular audit on client.");
    } finally {
      setAuditingClientId(null);
    }
  };

  const handleDispatchHandover = async (client: AgencyClientDossier) => {
    try {
      const res = await fetch(`/api/v1/enterprise/clients/${client.id}/handover`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.inviteUrl) {
        setHandoverData({
          client,
          inviteUrl: data.inviteUrl,
          tempAccessKey: data.tempAccessKey,
        });
        setClients((prev) => prev.map((c) => (c.id === client.id ? { ...c, status: "HANDED_OVER" } : c)));
      }
    } catch {
      alert("Could not generate handover access.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" /> Agency Client Manager (On-Behalf-Of Hub)
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Create applicant dossiers on behalf of your clients, upload verified visa/job documents, run autonomous consular pre-screens, and issue secure login handover credentials.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" /> New Applicant Dossier
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Managed Clients</span>
          <p className="text-xl font-extrabold text-slate-900">{clients.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Pre-Screen Approved</span>
          <p className="text-xl font-extrabold text-emerald-800">
            {clients.filter((c) => c.status === "PRE_SCREEN_PASSED").length}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Action Needed / Flags</span>
          <p className="text-xl font-extrabold text-amber-800">
            {clients.filter((c) => c.status === "FLAGGED_ACTION_NEEDED" || c.status === "DOCS_PENDING").length}
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Handed Over to Client</span>
          <p className="text-xl font-extrabold text-blue-800">
            {clients.filter((c) => c.status === "HANDED_OVER").length}
          </p>
        </div>
      </div>

      {/* Clients Dossiers List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 p-5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Applicant Dossiers ({clients.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Sovereign regional vault partitioning active
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" /> Loading managed client dossiers...
          </div>
        ) : clients.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Users className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No applicant dossiers created yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Start onboarding your clients by clicking &ldquo;New Applicant Dossier&rdquo; above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {clients.map((c) => {
              const audit = c.consularAuditSummary;
              const isAuditing = auditingClientId === c.id;

              return (
                <div key={c.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-extrabold text-slate-900">{c.fullName}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {c.nationality}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                        🎯 {c.destinationCountry} · {c.targetRoute}
                      </span>
                      {c.passportNumber && (
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Pass: {c.passportNumber}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                      <span>{c.email}</span>
                      {c.phone && <span>• {c.phone}</span>}
                      <span>• Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Consular Solvency Summary Radar */}
                    {audit ? (
                      <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50 p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Scale className="h-3.5 w-3.5 text-emerald-600" />
                            Consular Pre-Screen:{" "}
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                audit.verdict === "READY_TO_APPLY"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {audit.verdict.replace(/_/g, " ")} (Grade {audit.healthGrade})
                            </span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {audit.openChecklistCount === 0 ? "All requirements verified" : `${audit.openChecklistCount} open flags`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{audit.summary}</p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>Documents intake pending. Run consular pre-screen after adding credentials.</span>
                      </div>
                    )}
                  </div>

                  {/* Agency Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      onClick={() => handleRunAudit(c.id)}
                      disabled={isAuditing}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${isAuditing ? "animate-spin" : ""}`} />
                      <span>{isAuditing ? "Auditing..." : "Pre-Screen"}</span>
                    </button>

                    <button
                      onClick={() => handleDispatchHandover(c)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition-all shadow-2xs"
                    >
                      <Send className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{c.status === "HANDED_OVER" ? "Re-send Access" : "Handover Access"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Applicant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" /> Create Managed Applicant Dossier
            </h3>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Applicant Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chukwuemeka Obi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="applicant@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 803 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Passport / Travel Doc #
                  </label>
                  <input
                    type="text"
                    placeholder="A01234567"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Nationality *
                  </label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="Nigerian">Nigerian</option>
                    <option value="Ghanaian">Ghanaian</option>
                    <option value="Kenyan">Kenyan</option>
                    <option value="Indian">Indian</option>
                    <option value="South African">South African</option>
                    <option value="Global">Other (International)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Destination *
                  </label>
                  <select
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Albania">Albania</option>
                    <option value="Canada">Canada</option>
                    <option value="United States">United States</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Target Visa Stream *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetRoute}
                    onChange={(e) => setTargetRoute(e.target.value)}
                    placeholder="e.g. Skilled Worker"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !fullName || !email}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Create Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Handover & Access Modal */}
      {handoverData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-emerald-600">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-sm font-bold text-slate-900">Applicant Access Generated</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Send this secure onboarding link to <strong>{handoverData.client.fullName}</strong> ({handoverData.client.email}). They will use it to access their populated sovereign vault and take full ownership.
            </p>

            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Secure Client Access Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={handoverData.inviteUrl}
                  className="w-full bg-white font-mono text-xs rounded border border-emerald-200 px-2 py-1 text-slate-800"
                />
                <button
                  onClick={() => copyToClipboard(handoverData.inviteUrl)}
                  className="flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setHandoverData(null)}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
