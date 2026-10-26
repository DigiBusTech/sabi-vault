import { randomBytes } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type EmailCategory = "IMMIGRATION" | "EDUCATION" | "LABOUR" | "SECURITY" | "WORKSPACE" | "SYSTEM";

export interface EmailTemplate {
  id: string;
  name: string;
  category: EmailCategory;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  availableVariables: string[];
  description: string;
  isActive: boolean;
  updatedAt: string;
}

export interface EmailDispatchLog {
  id: string;
  templateId: string;
  recipientEmail: string;
  subject: string;
  status: "SENT" | "QUEUED" | "FAILED";
  provider: "RESEND" | "SMTP" | "SOVEREIGN_MOCK";
  sentAt: string;
  errorMessage?: string;
}

class EmailTemplateMasterStore {
  private templates: Map<string, EmailTemplate> = new Map();
  private dispatchLogs: EmailDispatchLog[] = [];

  constructor() {
    this.seedDefaultTemplates();
  }

  private seedDefaultTemplates() {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: "tpl_talent_query_notice",
        name: "Citizen Vault Query Transparency Notice",
        category: "WORKSPACE",
        subject: "Transparency Notice: {{organization_name}} accessed your SabiProfile Sovereign Vault",
        availableVariables: ["recipient_name", "organization_name", "accessed_scopes", "on_chain_tx", "audit_url"],
        description: "Sent automatically to citizens whenever an institution queries their consented documents.",
        isActive: true,
        updatedAt: "2026-10-25T10:00:00Z",
        bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 16px;">
  <div style="background-color: #064e3b; color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 700;">SabiProfile Sovereign Vault Access Notice</h1>
    <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Cryptographic Transparency & Zero Raw Centralization</p>
  </div>
  <p style="font-size: 14px; color: #334155;">Hello <strong>{{recipient_name}}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    In accordance with NDPC and GDPR sovereign data rights, this automated notice confirms that <strong>{{organization_name}}</strong> executed an on-chain verification query against your consented credentials ({{accessed_scopes}}).
  </p>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 20px 0; font-family: monospace; font-size: 12px; color: #475569;">
    <div><strong>Blockchain Ledger Tx:</strong> {{on_chain_tx}}</div>
  </div>
  <p style="font-size: 14px; color: #334155;">
    You can inspect the full immutable audit trail, including cryptographic hash comparisons, in your privacy dashboard:
  </p>
  <a href="{{audit_url}}" style="display: inline-block; background-color: #059669; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; margin: 12px 0;">View Audit Trail</a>
  <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
    SabiProfile never stores your physical documents centrally. Files reside solely in your personal cloud storage.
  </p>
</div>`,
        bodyText: `Hello {{recipient_name}},\n\nThis notice confirms that {{organization_name}} queried your sovereign vault (Scopes: {{accessed_scopes}}).\nBlockchain Tx: {{on_chain_tx}}\n\nInspect your audit trail: {{audit_url}}`,
      },
      {
        id: "tpl_interview_invite",
        name: "Universal Interview & Assessment Invitation",
        category: "LABOUR",
        subject: "Interview Invitation: {{organization_name}} has advanced your application for {{target_role}}",
        availableVariables: ["recipient_name", "organization_name", "target_role", "interview_type", "interview_link", "scheduled_time"],
        description: "Dispatched when an applicant is shortlisted for Consular, Academic, or Technical interviews.",
        isActive: true,
        updatedAt: "2026-10-25T11:00:00Z",
        bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
  <div style="background-color: #0f172a; color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Interview Assessment Scheduled</h1>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">{{organization_name}} • {{target_role}}</p>
  </div>
  <p style="font-size: 14px; color: #334155;">Dear <strong>{{recipient_name}}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Congratulations! Based on your verified sovereign credentials and evaluated rubric scores, you have been shortlisted for an interview ({{interview_type}}).
  </p>
  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 13px; color: #166534;">
    <strong>Scheduled Window:</strong> {{scheduled_time}}
  </div>
  <a href="{{interview_link}}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">Enter Interview Room</a>
</div>`,
        bodyText: `Dear {{recipient_name}},\n\nYou are invited for an interview with {{organization_name}} for {{target_role}}.\nTime: {{scheduled_time}}\nLink: {{interview_link}}`,
      },
      {
        id: "tpl_imm_funds_deficit",
        name: "Immigration Financial Holding Period Deficit Alert",
        category: "IMMIGRATION",
        subject: "⚠️ Urgent Consular Action: Maintenance funds holding period deficit detected",
        availableVariables: ["recipient_name", "destination_country", "target_route", "required_amount", "current_holding_days", "shortfall_amount", "advisor_url"],
        description: "Forensic alert sent when bank statements show funds dumping or insufficient consecutive holding.",
        isActive: true,
        updatedAt: "2026-10-25T11:30:00Z",
        bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fecdd3; border-radius: 16px; background-color: #fff1f2;">
  <h2 style="color: #9f1239; margin-top: 0;">⚠️ Statutory Maintenance Funds Deficit Flagged</h2>
  <p style="font-size: 14px; color: #4c0519;">Dear <strong>{{recipient_name}}</strong>,</p>
  <p style="font-size: 13px; color: #4c0519; line-height: 1.6;">
    Your pre-screen audit for the <strong>{{destination_country}} ({{target_route}})</strong> detected a shortfall: statutory regulations require liquid funds held for at least 28 consecutive days without sudden unverified deposits.
  </p>
  <div style="background-color: white; border: 1px solid #fda4af; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 13px; color: #9f1239;">
    <div><strong>Current Holding Window:</strong> {{current_holding_days}} days (Required: 28 days)</div>
    <div><strong>Estimated Shortfall:</strong> {{shortfall_amount}}</div>
  </div>
  <a href="{{advisor_url}}" style="display: inline-block; background-color: #e11d48; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">Resolve in Target Advisor</a>
</div>`,
        bodyText: `Dear {{recipient_name}},\n\nStatutory maintenance deficit detected for {{destination_country}} ({{target_route}}).\nCurrent holding: {{current_holding_days}} days. Shortfall: {{shortfall_amount}}.\nResolve: {{advisor_url}}`,
      },
      {
        id: "tpl_acad_apostille_deficit",
        name: "Academic Admissions Tier-2 Apostille Request",
        category: "EDUCATION",
        subject: "Admissions Update: Tier-2 Institutional Apostille / Legalization Required",
        availableVariables: ["recipient_name", "institution_name", "program_name", "document_name", "upload_url"],
        description: "Sent to student applicant when uploaded transcript is only Tier-1 standard hashed.",
        isActive: true,
        updatedAt: "2026-10-25T12:00:00Z",
        bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
  <h2 style="color: #1e293b; margin-top: 0;">Institutional Legalization Required</h2>
  <p style="font-size: 14px; color: #334155;">Hello <strong>{{recipient_name}}</strong>,</p>
  <p style="font-size: 13px; color: #334155; line-height: 1.6;">
    {{institution_name}} has reviewed your application for <strong>{{program_name}}</strong>. Your uploaded <strong>{{document_name}}</strong> is currently Tier-1 Standard Hashed. International admissions policies mandate a <strong>Tier-2 Hague Apostille or Notarized Institutional Attestation</strong>.
  </p>
  <a href="{{upload_url}}" style="display: inline-block; background-color: #0284c7; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px;">Upload Attested Transcript</a>
</div>`,
        bodyText: `Hello {{recipient_name}},\n\n{{institution_name}} requires Tier-2 Institutional Attestation for {{document_name}} for {{program_name}}.\nUpload: {{upload_url}}`,
      },
      {
        id: "tpl_tamper_critical",
        name: "Cryptographic Hash Mismatch Security Advisory",
        category: "SECURITY",
        subject: "🚨 CRITICAL SECURITY ALERT: Cryptographic tamper detected on sovereign vault",
        availableVariables: ["recipient_name", "category_name", "blockchain_hash", "computed_hash", "timestamp"],
        description: "Dispatched when an on-chain ledger hash fails mathematical equality check.",
        isActive: true,
        updatedAt: "2026-10-25T12:30:00Z",
        bodyHtml: `<div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #ef4444; border-radius: 12px; background-color: #fef2f2; color: #991b1b;">
  <h2 style="margin-top: 0;">🚨 CRITICAL INTEGRITY ADVISORY</h2>
  <p>Attention: {{recipient_name}}</p>
  <p>A query against your sovereign vault detected a cryptographic hash divergence on category [{{category_name}}].</p>
  <p><strong>On-Chain Anchor:</strong> {{blockchain_hash}}</p>
  <p><strong>Recomputed Hash:</strong> {{computed_hash}}</p>
  <p>Any query during this state was fail-closed blocked to prevent fraudulent data dissemination.</p>
</div>`,
        bodyText: `CRITICAL INTEGRITY ADVISORY for {{recipient_name}}.\nHash mismatch detected on [{{category_name}}].\nOn-Chain: {{blockchain_hash}}\nComputed: {{computed_hash}}`,
      },
    ];

    defaultTemplates.forEach((t) => this.templates.set(t.id, t));
  }

  public listTemplates(category?: EmailCategory): EmailTemplate[] {
    let list = Array.from(this.templates.values());
    if (category) {
      list = list.filter((t) => t.category === category);
    }
    return list;
  }

  public getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id);
  }

  public async saveTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    template.updatedAt = new Date().toISOString();
    this.templates.set(template.id, template);

    try {
      const admin = createAdminSupabaseClient();
      await admin.from("email_templates").upsert(
        {
          id: template.id,
          name: template.name,
          category: template.category,
          subject: template.subject,
          body_html: template.bodyHtml,
          body_text: template.bodyText,
          available_variables: template.availableVariables,
          description: template.description,
          is_active: template.isActive,
          updated_at: template.updatedAt,
        },
        { onConflict: "id" }
      );
    } catch (err: any) {
      console.warn("[EmailTemplateStore] DB save notice:", err.message);
    }

    return template;
  }

  public async deleteTemplate(id: string): Promise<boolean> {
    const deleted = this.templates.delete(id);
    try {
      const admin = createAdminSupabaseClient();
      await admin.from("email_templates").delete().eq("id", id);
    } catch (err: any) {
      console.warn("[EmailTemplateStore] DB delete notice:", err.message);
    }
    return deleted;
  }

  public logDispatch(log: Omit<EmailDispatchLog, "id" | "sentAt">): EmailDispatchLog {
    const entry: EmailDispatchLog = {
      ...log,
      id: `disp_${randomBytes(6).toString("hex")}`,
      sentAt: new Date().toISOString(),
    };
    this.dispatchLogs.unshift(entry);
    return entry;
  }

  public listDispatchLogs(): EmailDispatchLog[] {
    return this.dispatchLogs;
  }
}

export const globalEmailTemplateStore = new EmailTemplateMasterStore();
