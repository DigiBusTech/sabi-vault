"use client";

import { useEffect, useState } from "react";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Shield,
  Code2,
  Terminal,
  Smartphone,
  Globe,
  RefreshCw,
  AlertTriangle,
  Lock,
  ExternalLink,
} from "lucide-react";

interface ApiKeyItem {
  id: string;
  orgId: string;
  name: string;
  keyPrefix: string;
  environment: "production" | "sandbox";
  scopes: string[];
  rateLimitPerMin: number;
  totalCalls: number;
  lastUsedAt?: string;
  createdAt: string;
}

export function DeveloperApiKeysView() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Key Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [keyName, setKeyName] = useState<string>("");
  const [keyEnv, setKeyEnv] = useState<"production" | "sandbox">("production");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "screening:evaluate",
    "vault:read_consented",
  ]);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // One-time Key Secret Modal
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // SDK Snippet Tab
  const [activeSnippetTab, setActiveSnippetTab] = useState<"curl" | "ts" | "swift" | "kotlin" | "python">("curl");
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/enterprise/api-keys");
      const data = await res.json();
      if (res.ok && data.keys) {
        setKeys(data.keys);
      }
    } catch {
      setError("Failed to load organization API keys.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/enterprise/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: keyName,
          environment: keyEnv,
          scopes: selectedScopes,
          rateLimitPerMin: keyEnv === "production" ? 120 : 60,
        }),
      });
      const data = await res.json();
      if (res.ok && data.key && data.rawSecretKey) {
        setKeys((prev) => [data.key, ...prev]);
        setRevealedKey(data.rawSecretKey);
        setShowCreateModal(false);
        setKeyName("");
      } else {
        setError(data.error || "Could not generate key.");
      }
    } catch {
      setError("Network error while minting API key.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will immediately fail.")) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/enterprise/api-keys?keyId=${keyId}`, { method: "DELETE" });
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
      }
    } catch {
      alert("Failed to revoke key.");
    }
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const codeSnippets = {
    curl: `# 1. Candidate Screening Evaluation
curl -X POST https://api.sabiprofile.com/api/v1/m2m/evaluate \\
  -H "X-Sabi-Org-Key: ${keys[0]?.keyPrefix || "sbo_live_..."}YOUR_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "scopedKey": "sbk_live_v1_...",
    "rubricId": "rubric_immigration_tech_visa"
  }'`,
    ts: `// TypeScript / Next.js / React Native Fetch
import axios from "axios";

export async function evaluateCandidate(candidateKey: string) {
  const response = await fetch("https://api.sabiprofile.com/api/v1/m2m/evaluate", {
    method: "POST",
    headers: {
      "X-Sabi-Org-Key": process.env.SABI_ORG_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scopedKey: candidateKey,
      rubricId: "rubric_immigration_tech_visa",
    }),
  });
  return await response.json();
}`,
    swift: `// iOS Native (Swift with URLSession)
import Foundation

func screenCandidate(candidateKey: String) async throws -> [String: Any] {
    let url = URL(string: "https://api.sabiprofile.com/api/v1/m2m/evaluate")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("${keys[0]?.keyPrefix || "sbo_live_..."}YOUR_SECRET", forHTTPHeaderField: "X-Sabi-Org-Key")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let body = ["scopedKey": candidateKey, "rubricId": "rubric_immigration_tech_visa"]
    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (data, _) = try await URLSession.shared.data(for: request)
    return try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
}`,
    kotlin: `// Android Native (Kotlin with OkHttp / Retrofit)
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()
val jsonBody = """
    {"scopedKey": "sbk_live_v1_...", "rubricId": "rubric_immigration_tech_visa"}
""".trimIndent().toRequestBody("application/json".toMediaType())

val request = Request.Builder()
    .url("https://api.sabiprofile.com/api/v1/m2m/evaluate")
    .addHeader("X-Sabi-Org-Key", "${keys[0]?.keyPrefix || "sbo_live_..."}YOUR_SECRET")
    .post(jsonBody)
    .build()

client.newCall(request).execute().use { response ->
    println(response.body?.string())
}`,
    python: `# Python / FastAPI / Django Integration
import requests

def screen_applicant(scoped_key: str):
    headers = {
        "X-Sabi-Org-Key": "${keys[0]?.keyPrefix || "sbo_live_..."}YOUR_SECRET",
        "Content-Type": "application/json"
    }
    payload = {
        "scopedKey": scoped_key,
        "rubricId": "rubric_immigration_tech_visa"
    }
    response = requests.post("https://api.sabiprofile.com/api/v1/m2m/evaluate", json=payload, headers=headers)
    return response.json()`,
  };

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Key className="h-5 w-5 text-emerald-600" /> Developer API & Native App Keys
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Mint and manage scoped API keys for your external web applications, iOS/Android mobile clients, and enterprise ATS workflows.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Generate New API Key
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Keys Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 p-5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Integration Keys ({keys.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Keys are hashed deterministically and authenticated via Base Sepolia protocol
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" /> Loading active API keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Lock className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No external API keys generated yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Generate an API key to connect your web app, mobile client, or recruitment tooling directly to SabiProfile.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {keys.map((k) => (
              <div key={k.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{k.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        k.environment === "production"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      }`}
                    >
                      {k.environment.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {k.keyPrefix}...
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                    <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Calls: {k.totalCalls.toLocaleString()}</span>
                    <span>•</span>
                    <span>Rate limit: {k.rateLimitPerMin} req/min</span>
                    <span>•</span>
                    <span>
                      Last used: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {k.scopes.map((s) => (
                      <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleRevokeKey(k.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Multi-Platform Developer Integration SDK */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-emerald-600" /> Multi-Platform Integration Snippets
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Paste these code snippets directly into your external frontend or native app to query candidates or run screening.
            </p>
          </div>

          {/* Platform Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            {(
              [
                { id: "curl", label: "cURL", icon: Terminal },
                { id: "ts", label: "TypeScript / Next", icon: Globe },
                { id: "swift", label: "iOS (Swift)", icon: Smartphone },
                { id: "kotlin", label: "Android (Kotlin)", icon: Smartphone },
                { id: "python", label: "Python", icon: Code2 },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSnippetTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                  activeSnippetTab === tab.id
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <tab.icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Display Area */}
        <div className="relative rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
          <button
            onClick={() => copyToClipboard(codeSnippets[activeSnippetTab], setCopiedSnippet)}
            className="absolute top-3 right-3 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-sans font-bold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {copiedSnippet ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedSnippet ? "Copied" : "Copy"}</span>
          </button>
          <pre className="pr-16 leading-relaxed whitespace-pre">{codeSnippets[activeSnippetTab]}</pre>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-600" /> Mint New External API Key
            </h3>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Application Name / Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile iOS Client, ATS Production Connector"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Environment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKeyEnv("production")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      keyEnv === "production"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🟢 Production (sbo_live_)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeyEnv("sandbox")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      keyEnv === "sandbox"
                        ? "border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-500"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🟡 Sandbox (sbo_test_)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Granted Scopes
                </label>
                <div className="space-y-1.5 text-xs text-slate-700">
                  {[
                    { id: "screening:evaluate", label: "Evaluate Candidates (M2M)" },
                    { id: "vault:read_consented", label: "Read Consented Vault Records" },
                    { id: "clients:dossier_write", label: "Create / Manage Client Dossiers" },
                    { id: "consular:audit_run", label: "Execute Consular Pre-Screens" },
                  ].map((s) => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedScopes((prev) => [...prev, s.id]);
                          else setSelectedScopes((prev) => prev.filter((item) => item !== s.id));
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !keyName.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isCreating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* One-Time Key Secret Reveal Modal */}
      {revealedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Copy Your Secret API Key</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This secret key will <strong>never be shown again</strong>. Store it securely in your external application’s environment secrets or Keychain.
            </p>

            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 flex items-center justify-between gap-2">
              <code className="font-mono text-xs font-bold text-emerald-950 break-all">{revealedKey}</code>
              <button
                onClick={() => copyToClipboard(revealedKey, setCopiedKey)}
                className="flex items-center gap-1 shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                {copiedKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <button
              onClick={() => setRevealedKey(null)}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              I have safely copied my key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
