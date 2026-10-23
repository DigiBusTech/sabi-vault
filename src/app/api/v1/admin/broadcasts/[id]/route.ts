import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/auth_guard";
import { broadcastStore } from "@/core/notifications/broadcast_store";
import { UpdateBroadcastInput } from "@/types/broadcast";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/**
 * PATCH /api/v1/admin/broadcasts/[id]
 * Updates or toggles an existing broadcast notification.
 * Protected: Super Admin only.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const adminCheck = await authenticateAdmin(req);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Broadcast ID is required." }, { status: 400 });
  }

  try {
    const body = await req.json();

    const input: UpdateBroadcastInput = {
      id,
      ...(body.title !== undefined && { title: body.title }),
      ...(body.message !== undefined && { message: body.message }),
      ...(body.audience !== undefined && { audience: body.audience }),
      ...(body.theme !== undefined && { theme: body.theme }),
      ...(body.custom_bg_color !== undefined && { custom_bg_color: body.custom_bg_color }),
      ...(body.custom_text_color !== undefined && { custom_text_color: body.custom_text_color }),
      ...(body.is_dismissible !== undefined && { is_dismissible: Boolean(body.is_dismissible) }),
      ...(body.is_active !== undefined && { is_active: Boolean(body.is_active) }),
      ...(body.priority !== undefined && { priority: Number(body.priority) }),
      ...(body.action_label !== undefined && { action_label: body.action_label }),
      ...(body.action_url !== undefined && { action_url: body.action_url }),
      ...(body.starts_at !== undefined && { starts_at: body.starts_at }),
      ...(body.expires_at !== undefined && { expires_at: body.expires_at }),
    };

    const updated = await broadcastStore.updateBroadcast(input);
    if (!updated) {
      return NextResponse.json({ error: "Broadcast notification not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Broadcast notification updated successfully.",
      broadcast: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update broadcast" }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/admin/broadcasts/[id]
 * Deletes an existing broadcast notification.
 * Protected: Super Admin only.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const adminCheck = await authenticateAdmin(req);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Broadcast ID is required." }, { status: 400 });
  }

  try {
    const deleted = await broadcastStore.deleteBroadcast(id);
    if (!deleted) {
      return NextResponse.json({ error: "Broadcast notification not found or already deleted." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Broadcast notification deleted successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete broadcast" }, { status: 500 });
  }
}

