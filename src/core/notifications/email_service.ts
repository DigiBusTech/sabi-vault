import { globalEmailTemplateStore, EmailTemplate, EmailDispatchLog } from "./email_template_store";
import { getConfigValueSync } from "@/core/config/platform_config";

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: "RESEND" | "SMTP" | "SOVEREIGN_MOCK";
  interpolatedSubject: string;
  interpolatedHtml: string;
  recipient: string;
  error?: string;
}

class TransactionalEmailService {
  /**
   * Safe variable interpolator replacing {{variable_name}} with passed dictionary.
   */
  public interpolate(text: string, variables: Record<string, string | number | boolean | undefined>): string {
    return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      const val = variables[key];
      return val !== undefined && val !== null ? String(val) : "";
    });
  }

  /**
   * Dispatches a transactional email given a template ID and dynamic variable payload.
   */
  public async sendEmail(params: {
    templateId: string;
    recipientEmail: string;
    variables: Record<string, string | number | boolean | undefined>;
    provider?: "RESEND" | "SMTP" | "SOVEREIGN_MOCK";
  }): Promise<SendEmailResult> {
    const { templateId, recipientEmail, variables } = params;
    const template = globalEmailTemplateStore.getTemplate(templateId);

    if (!template) {
      return {
        success: false,
        provider: "SOVEREIGN_MOCK",
        interpolatedSubject: "Template Not Found",
        interpolatedHtml: "",
        recipient: recipientEmail,
        error: `Template '${templateId}' does not exist in master store.`,
      };
    }

    if (!template.isActive) {
      return {
        success: false,
        provider: "SOVEREIGN_MOCK",
        interpolatedSubject: template.subject,
        interpolatedHtml: "",
        recipient: recipientEmail,
        error: `Template '${templateId}' is deactivated.`,
      };
    }

    const subject = this.interpolate(template.subject, variables);
    const html = this.interpolate(template.bodyHtml, variables);
    const text = this.interpolate(template.bodyText, variables);

    // Check provider configuration
    const resendKey = process.env.RESEND_API_KEY || getConfigValueSync("notifications.resend_api_key");
    const provider: "RESEND" | "SMTP" | "SOVEREIGN_MOCK" = resendKey ? "RESEND" : "SOVEREIGN_MOCK";

    let dispatchSuccess = true;
    let errorMessage: string | undefined = undefined;

    if (provider === "RESEND" && resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "SabiProfile Notifications <notifications@sabiprofile.com>",
            to: [recipientEmail],
            subject,
            html,
            text,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          dispatchSuccess = false;
          errorMessage = errData.message || "Resend API delivery error";
        }
      } catch (err: any) {
        dispatchSuccess = false;
        errorMessage = err.message || "Network error dispatching via Resend";
      }
    } else {
      // Sovereign Mock Provider: Instant, zero-cost, fully traceable simulation for MVP/Dev
      console.info(
        `[TransactionalEmailService:MOCK] Sent "${subject}" to <${recipientEmail}> (Template: ${templateId})`
      );
    }

    // Log dispatch in master store
    globalEmailTemplateStore.logDispatch({
      templateId,
      recipientEmail,
      subject,
      status: dispatchSuccess ? "SENT" : "FAILED",
      provider,
      errorMessage,
    });

    return {
      success: dispatchSuccess,
      messageId: `msg_${Date.now()}`,
      provider,
      interpolatedSubject: subject,
      interpolatedHtml: html,
      recipient: recipientEmail,
      error: errorMessage,
    };
  }
}

export const globalEmailService = new TransactionalEmailService();

