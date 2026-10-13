import { NextRequest, NextResponse } from "next/server";
import { globalConfigVault } from "@/core/admin/config_vault";

/**
 * GET /api/v1/admin/config
 * Returns current masked runtime configurations.
 */
export async function GET() {
  try {
    const config = globalConfigVault.getMaskedConfig();
    return NextResponse.json({ status: "SUCCESS", config });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch config", details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/config
 * Dynamically updates runtime configurations without redeployment.
 */
export async function POST(req: NextRequest) {
  try {
    const updates = await req.json();
    const updatedMasked = globalConfigVault.updateConfig(updates);

    return NextResponse.json({
      status: "CONFIG_UPDATED_HOT_RELOADED",
      updatedConfig: updatedMasked,
      message: "Runtime secrets and gateway configurations updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update config", details: err.message }, { status: 500 });
  }
}
