import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles } from "@/lib/auth/auth_guard";
import { globalEmailTemplateStore, EmailCategory, EmailTemplate } from "@/core/notifications/email_template_store";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response!;
  }

  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") as EmailCategory) || undefined;
  const templates = globalEmailTemplateStore.listTemplates(category);
  const logs = globalEmailTemplateStore.listDispatchLogs().slice(0, 50);

  return NextResponse.json({
    success: true,
    totalTemplates: templates.length,
    templates,
    recentDispatches: logs,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response!;
  }

  try {
    const body = await req.json();
    const { id, name, category, subject, bodyHtml, bodyText, availableVariables, description, isActive } = body;

    if (!name || !subject || !bodyHtml) {
      return NextResponse.json(
        { error: "name, subject, and bodyHtml are required." },
        { status: 400 }
      );
    }

    const templateId = id || `tpl_${randomBytes(4).toString("hex")}`;
    const newTemplate: EmailTemplate = {
      id: templateId,
      name,
      category: category || "SYSTEM",
      subject,
      bodyHtml,
      bodyText: bodyText || bodyHtml.replace(/<[^>]+>/g, ""),
      availableVariables: Array.isArray(availableVariables) ? availableVariables : ["recipient_name", "action_url"],
      description: description || "Custom platform notification template",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      updatedAt: new Date().toISOString(),
    };

    const saved = await globalEmailTemplateStore.saveTemplate(newTemplate);
    return NextResponse.json({
      success: true,
      template: saved,
      templates: globalEmailTemplateStore.listTemplates(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save template." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authorizeRoles(req, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response!;
  }

  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get("id");

  if (!templateId) {
    return NextResponse.json({ error: "Template id is required." }, { status: 400 });
  }

  const ok = await globalEmailTemplateStore.deleteTemplate(templateId);
  return NextResponse.json({ success: ok });
}
