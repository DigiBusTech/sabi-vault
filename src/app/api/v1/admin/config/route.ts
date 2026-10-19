import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, authenticateUser } from "@/lib/auth/auth_guard";
import {
  listConfig,
  setConfigValue,
  resetConfigValue,
  CONFIG_REGISTRY,
} from "@/core/config/platform_config";

/**
 * GET /api/v1/admin/config
 * Lists the configuration registry with masked values and source badges
 * (dashboard / environment / default / unset). Secrets are never returned
 * in raw form. (Super Admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await authenticateAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error || "Super Admin credentials required" },
        { status: 401 }
      );
    }

    const config = await listConfig();
    return NextResponse.json({ status: "SUCCESS", config });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch config", details: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/config
 * Sets or resets configuration keys at runtime. Values persist encrypted
 * (AES-256-GCM) in the sovereign database and hot-reload for all consumers.
 *
 * Body shapes:
 *   { "key": "ai.gemini_api_key", "value": "..." }              set one
 *   { "updates": { "ai.gemini_api_key": "...", ... } }          set many
 *   { "key": "ai.gemini_api_key", "reset": true }               reset to env/default
 */
export async function POST(req: NextRequest) {
  try {
    const adminCheck = await authenticateAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error || "Super Admin credentials required" },
        { status: 401 }
      );
    }

    const actor = (await authenticateUser(req)).user?.userId || "super_admin";
    const body = await req.json();

    // Reset path
    if (body.key && body.reset === true) {
      await resetConfigValue(body.key);
      return NextResponse.json({
        status: "CONFIG_RESET",
        key: body.key,
        message: "Key reset. It now resolves from environment or its registered default.",
      });
    }

    const updates: Record<string, string> =
      body.updates && typeof body.updates === "object"
        ? body.updates
        : body.key
        ? { [body.key]: String(body.value ?? "") }
        : {};

    const validKeys = new Set(CONFIG_REGISTRY.map((m) => m.key));
    const entries = Object.entries(updates);
    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Provide { key, value }, { updates: {...} }, or { key, reset: true }." },
        { status: 400 }
      );
    }

    const unknown = entries.map(([k]) => k).filter((k) => !validKeys.has(k));
    if (unknown.length > 0) {
      return NextResponse.json(
        { error: `Unknown configuration key(s): ${unknown.join(", ")}` },
        { status: 400 }
      );
    }

    for (const [key, value] of entries) {
      if (typeof value !== "string" || value.trim() === "") {
        return NextResponse.json(
          { error: `Value for '${key}' must be a non-empty string. Use reset to clear a key.` },
          { status: 422 }
        );
      }
      await setConfigValue(key, value.trim(), actor);
    }

    const config = await listConfig();
    return NextResponse.json({
      status: "CONFIG_UPDATED_HOT_RELOADED",
      updatedKeys: entries.map(([k]) => k),
      config,
      message: "Configuration updated and applied to all runtime consumers without redeployment.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update config", details: err.message },
      { status: 500 }
    );
  }
}
