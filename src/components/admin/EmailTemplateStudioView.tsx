"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Plane,
  GraduationCap,
  Briefcase,
  Shield,
  Layers,
  Copy,
  Check,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";
import { EmailTemplate, EmailCategory, EmailDispatchLog } from "@/core/notifications/email_template_store";

export function EmailTemplateStudioView() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<EmailDispatchLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Editor Modal
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [editorId, setEditorId] = useState<string>("");
  const [editorName, setEditorName] = useState<string>("");
  const [editorCategory, setEditorCategory] = useState<EmailCategory>("IMMIGRATION");
  const [editorSubject, setEditorSubject] = useState<string>("");
  const [editorBodyHtml, setEditorBodyHtml] = useState<string>("");
  const [editorDescription, setEditorDescription] = useState<string>("");
  const [editorVariables, setEditorVariables] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Test Send State
  const [testEmailAddress, setTestEmailAddress] = useState<string>("admin@sabiprofile.com");
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testSendResult, setTestSendResult] = useState<any | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/emails/templates");
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.templates || []);
        setDispatchLogs(data.recentDispatches || []);
        if (data.templates && data.templates.length > 0 && !selectedTemplate) {
          setSelectedTemplate(data.templates[0]);
        }
      }
    } catch {
      console.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditor = (tpl?: EmailTemplate) => {
    if (tpl) {
      setEditorId(tpl.id);
      setEditorName(tpl.name);
      setEditorCategory(tpl.category);
      setEditorSubject(tpl.subject);
      setEditorBodyHtml(tpl.bodyHtml);
      setEditorDescription(tpl.description);
      setEditorVariables(tpl.availableVariables.join(", "));
    } else {
      setEditorId("");
      setEditorName("");
      setEditorCategory("IMMIGRATION");
      setEditorSubject("Notification from SabiProfile: {{notification_title}}");
      setEditorBodyHtml(`<div style="font-family: sans-serif; padding: 20px;">\n  <h2>{{notification_title}}</h2>\n  <p>Hello {{recipient_name}},</p>\n  <p>Your action is requested: <a href="{{action_url}}">View Details</a></p>\n</div>`);
      setEditorDescription("Custom transactional notification template");
      setEditorVariables("recipient_name, notification_title, action_url");
    }
    setShowEditorModal(true);
    setTestSendResult(null);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/admin/emails/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editorId || undefined,
          name: editorName,
          category: editorCategory,
          subject: editorSubject,
          bodyHtml: editorBodyHtml,
          description: editorDescription,
          availableVariables: editorVariables.split(",").map((v) => v.trim()).filter(Boolean),
          isActive: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.template) {
        setTemplates(data.templates);
        setSelectedTemplate(data.template);
        setShowEditorModal(false);
      }
    } catch {
      console.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSend = async (templateId: string) => {
    setIsSendingTest(true);
    setTestSendResult(null);
    try {
      const res = await fetch("/api/v1/admin/emails/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          recipientEmail: testEmailAddress,
        }),
      });
      const data = await res.json();
      setTestSendResult(data);
      loadData(); // Refresh dispatch logs
    } catch (err: any) {
      setTestSendResult({ success: false, error: err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  const filteredTemplates = selectedCategory === "ALL"
    ? templates
    : templates.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            Event-Driven Dynamic Email & Notification Studio
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage decoupled, high-volume transactional emails triggered across Sovereign Immigration, Admissions, and Enterprise tracks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenEditor()}
          className="flex items-center gap-1.5 self-start rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all"
        >
          <Plus className="h-4 w-4" /> New Email Template
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "ALL", label: "All Templates", icon: Layers },
          { id: "IMMIGRATION", label: "🌍 Immigration Alerts", icon: Plane },
          { id: "EDUCATION", label: "🎓 Academic Admissions", icon: GraduationCap },
          { id: "LABOUR", label: "💼 Enterprise Hiring", icon: Briefcase },
          { id: "SECURITY", label: "🚨 Security & Ledger", icon: Shield },
          { id: "WORKSPACE", label: "🏢 Workspace & Vault", icon: Mail },
        ].map((cat) => {
          const Icon = cat.icon;
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                active
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Studio Split-Pane */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Template List Column */}
        <div className="space-y-3 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Configured Notification Templates ({filteredTemplates.length})
            </span>

            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading templates...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No templates found in this category.</div>
            ) : (
              <div className="space-y-2">
                {filteredTemplates.map((tpl) => {
                  const isSelected = selectedTemplate?.id === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                          {tpl.category}
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800">
                          Active
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mt-1">{tpl.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{tpl.subject}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Dispatches Telemetry */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Dispatches ({dispatchLogs.length})
              </span>
              <button
                type="button"
                onClick={loadData}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900"
              >
                Refresh
              </button>
            </div>

            {dispatchLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No dispatches logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {dispatchLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate max-w-[200px]">{log.subject}</span>
                      <span className="font-mono text-[9px] text-slate-400">{log.provider}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 mt-1">
                      <span>{log.recipientEmail}</span>
                      <span className="text-emerald-700 font-bold">{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Preview & Test Send Column */}
        <div className="lg:col-span-7">
          {selectedTemplate ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-600 uppercase">
                    {selectedTemplate.category}
                  </span>
                  <h3 className="font-heading text-base font-bold text-slate-900 mt-1.5">{selectedTemplate.name}</h3>
                  <p className="text-xs text-slate-500">{selectedTemplate.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEditor(selectedTemplate)}
                  className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Template
                </button>
              </div>

              {/* Subject Bar */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Subject Line Template
                </span>
                <p className="text-xs font-mono font-semibold text-slate-900 mt-0.5">
                  {selectedTemplate.subject}
                </p>
              </div>

              {/* Available Variables */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Available Interpolation Tokens
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.availableVariables.map((v) => (
                    <span key={v} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                      &#123;&#123;{v}&#125;&#125;
                    </span>
                  ))}
                </div>
              </div>

              {/* HTML Sandbox Live Preview */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rendered HTML Sandbox Preview
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-100/40 p-4 max-h-80 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedTemplate.bodyHtml
                        .replace(/\{\{\s*recipient_name\s*\}\}/g, "Chinwe Okafor")
                        .replace(/\{\{\s*organization_name\s*\}\}/g, "Apex Sovereign Capital")
                        .replace(/\{\{\s*target_role\s*\}\}/g, "Principal Systems Architect")
                        .replace(/\{\{\s*destination_country\s*\}\}/g, "United Kingdom")
                        .replace(/\{\{\s*target_route\s*\}\}/g, "Global Talent Tech Visa")
                        .replace(/\{\{\s*accessed_scopes\s*\}\}/g, "academics, experience, finance")
                        .replace(/\{\{\s*on_chain_tx\s*\}\}/g, "0x89f7a21345dc67e89ab0123456789abcdef0123456789abcdef0123456789abcd")
                        .replace(/\{\{\s*audit_url\s*\}\}/g, "#")
                        .replace(/\{\{\s*interview_link\s*\}\}/g, "#")
                        .replace(/\{\{\s*interview_type\s*\}\}/g, "Sabi AI Consular Assessment")
                        .replace(/\{\{\s*scheduled_time\s*\}\}/g, "October 30, 2026 at 14:00 UTC")
                        .replace(/\{\{\s*current_holding_days\s*\}\}/g, "14")
                        .replace(/\{\{\s*shortfall_amount\s*\}\}/g, "£1,270 GBP")
                        .replace(/\{\{\s*advisor_url\s*\}\}/g, "#")
                        .replace(/\{\{\s*institution_name\s*\}\}/g, "University of Cambridge")
                        .replace(/\{\{\s*program_name\s*\}\}/g, "Postgraduate STEM Fellowship")
                        .replace(/\{\{\s*document_name\s*\}\}/g, "Undergraduate Degree Transcript")
                        .replace(/\{\{\s*upload_url\s*\}\}/g, "#")
                        .replace(/\{\{\s*category_name\s*\}\}/g, "academics")
                        .replace(/\{\{\s*blockchain_hash\s*\}\}/g, "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
                        .replace(/\{\{\s*computed_hash\s*\}\}/g, "0x60303ae22b998861bce3b28f33eec1be758a213c86c93c076dbe9f508c36cb05"),
                    }}
                  />
                </div>
              </div>

              {/* Live Test Send Control Box */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                <span className="text-xs font-bold text-emerald-950 block">
                  🚀 Live Dispatch Test Simulator
                </span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 rounded-lg border border-emerald-200 bg-white p-2 text-xs text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestSend(selectedTemplate.id)}
                    disabled={isSendingTest || !testEmailAddress}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSendingTest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Send Test Email
                  </button>
                </div>

                {testSendResult && (
                  <div className="rounded-lg border border-emerald-300 bg-white p-2.5 text-[11px] font-medium text-emerald-900">
                    {testSendResult.success ? (
                      <div>
                        ✓ Dispatched successfully via <strong>{testSendResult.provider}</strong> to <em>{testEmailAddress}</em>
                      </div>
                    ) : (
                      <div className="text-rose-700">✕ Error: {testSendResult.error}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-400">
              Select a template to view details, live sandbox, and test-send simulator.
            </div>
          )}
        </div>
      </div>

      {/* Template Editor Modal */}
      {showEditorModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setShowEditorModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowEditorModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Edit3 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  {editorId ? "Edit Notification Template" : "Create Notification Template"}
                </h3>
                <p className="text-xs text-slate-500">Configure dynamic HTML and subject variable tokens</p>
              </div>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={editorName}
                    onChange={(e) => setEditorName(e.target.value)}
                    placeholder="e.g. Visa Approval Notification"
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Category Vertical *</label>
                  <select
                    value={editorCategory}
                    onChange={(e) => setEditorCategory(e.target.value as EmailCategory)}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 outline-none focus:border-emerald-500"
                  >
                    <option value="IMMIGRATION">🌍 Sovereign Immigration</option>
                    <option value="EDUCATION">🎓 Academic Admissions</option>
                    <option value="LABOUR">💼 Enterprise Labour & Hiring</option>
                    <option value="SECURITY">🚨 Security & Cryptographic Ledger</option>
                    <option value="WORKSPACE">🏢 Workspace & Citizen Vault</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Subject Line Template *</label>
                <input
                  type="text"
                  required
                  value={editorSubject}
                  onChange={(e) => setEditorSubject(e.target.value)}
                  placeholder="e.g. Status Update: {{applicant_name}} has reached {{stage_name}}"
                  className="w-full rounded-lg border border-slate-200 p-2.5 font-mono text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Available Variables (comma separated)</label>
                <input
                  type="text"
                  value={editorVariables}
                  onChange={(e) => setEditorVariables(e.target.value)}
                  placeholder="recipient_name, organization_name, action_url, target_role"
                  className="w-full rounded-lg border border-slate-200 p-2.5 font-mono text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">HTML Body Template *</label>
                <textarea
                  rows={8}
                  required
                  value={editorBodyHtml}
                  onChange={(e) => setEditorBodyHtml(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 font-mono text-[11px] text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !editorName || !editorSubject || !editorBodyHtml}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
