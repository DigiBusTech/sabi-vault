import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/auth_guard";
import { broadcastStore } from "@/core/notifications/broadcast_store";
import { CreateBroadcastInput } from "@/types/broadcast";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/broadcasts
 * Lists all broadcast notifications (active, inactive, scheduled, expired).
 * Protected: Super Admin only.
 */
export async function GET(req: NextRequest) {
  const adminCheck = await authenticateAdmin(req);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
  }

  try {
    const broadcasts = await broadcastStore.getAllBroadcasts();
    return NextResponse.json({
      success: true,
      count: broadcasts.length,
      broadcasts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load broadcasts" }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/broadcasts
 * Publishes a new live broadcast alert.
 * Protected: Super Admin only.
 */
export async function POST(req: NextRequest) {
  const adminCheck = await authenticateAdmin(req);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json({ error: "Notification title is required." }, { status: 400 });
    }

    if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
      return NextResponse.json({ error: "Notification message is required." }, { status: 400 });
    }

    const input: CreateBroadcastInput = {
      title: body.title,
      message: body.message,
      audience: body.audience || "all",
      theme: body.theme || "info",
      custom_bg_color: body.custom_bg_color || null,
      custom_text_color: body.custom_text_color || null,
      is_dismissible: body.is_dismissible !== undefined ? Boolean(body.is_dismissible) : true,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      priority: Number(body.priority) || 1,
      action_label: body.action_label || null,
      action_url: body.action_url || null,
      starts_at: body.starts_at || undefined,
      expires_at: body.expires_at || null,
    };

    const created = await broadcastStore.createBroadcast(input, "super_admin");

    return NextResponse.json({
      success: true,
      message: "Broadcast notification published successfully.",
      broadcast: created,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create broadcast" }, { status: 500 });
  }
}
