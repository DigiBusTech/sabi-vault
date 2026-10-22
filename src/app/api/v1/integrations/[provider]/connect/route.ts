import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { getConfigValue } from "@/core/config/platform_config";

type CloudProvider = "google_drive" | "dropbox";

const PROVIDERS: CloudProvider[] = ["google_drive", "dropbox"];

/**
 * GET /api/v1/integrations/[provider]/connect
 *
 * Initiates the OAuth consent flow for linking a citizen's private cloud
 * storage (Google Drive / Dropbox) to the ephemeral sync pipeline.
 *
 * Per the Zero Raw Document Centralization invariant, SabiProfile only ever
 * requests read-only file access; documents stream through memory, are
 * hashed, and the buffer is zeroed. Nothing is persisted server-side.
 *
 * When the provider's OAuth client credentials are not configured on this
 * node, the route responds 503 with an honest `integration_not_configured`
 * payload naming the environment variables an operator must provide.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const auth = await authenticateUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json(
      { error: auth.error || "Authentication required" },
      { status: auth.status }
    );
  }

  const provider = params.provider as CloudProvider;
  if (!PROVIDERS.includes(provider)) {
    return NextResponse.json(
      { error: "Unsupported provider. Expected google_drive or dropbox." },
      { status: 400 }
    );
  }

  if (provider === "google_drive") {
    const clientId = await getConfigValue("integrations.google_drive_client_id");
    const rawRedirectUri = await getConfigValue("integrations.google_drive_redirect_uri");
    // Defensive guard: if user accidentally pasted an auth scope (e.g. googleapis.com/auth/...) or left blank, use origin callback
    const redirectUri =
      (rawRedirectUri && !rawRedirectUri.includes("googleapis.com/auth/") && rawRedirectUri.startsWith("http"))
        ? rawRedirectUri
        : `${req.nextUrl.origin}/api/v1/integrations/google_drive/callback`;

    if (!clientId) {
      return NextResponse.json(
        {
          error: "integration_not_configured",
          provider,
          message:
            "Google Drive linking is not configured on this sovereign node yet. An administrator can set it in the Super Admin dashboard under Integrations.",
          requiredConfig: [
            "integrations.google_drive_client_id",
            "integrations.google_drive_client_secret",
          ],
        },
        { status: 503 }
      );
    }

    const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set(
      "scope",
      "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly"
    );
    authorizeUrl.searchParams.set("access_type", "offline");
    authorizeUrl.searchParams.set("prompt", "consent");
    authorizeUrl.searchParams.set("state", auth.user.userId);

    return NextResponse.json({ provider, authorizeUrl: authorizeUrl.toString() });
  }

  // dropbox
  const clientId = await getConfigValue("integrations.dropbox_client_id");
  const rawDropboxUri = await getConfigValue("integrations.dropbox_redirect_uri");
  const redirectUri =
    (rawDropboxUri && rawDropboxUri.startsWith("http") && !rawDropboxUri.includes("dropbox.com/oauth"))
      ? rawDropboxUri
      : `${req.nextUrl.origin}/api/v1/integrations/dropbox/callback`;

  if (!clientId) {
    return NextResponse.json(
      {
        error: "integration_not_configured",
        provider,
        message:
          "Dropbox linking is not configured on this sovereign node yet. An administrator can set it in the Super Admin dashboard under Integrations.",
        requiredConfig: [
          "integrations.dropbox_client_id",
          "integrations.dropbox_client_secret",
        ],
      },
      { status: 503 }
    );
  }

  const authorizeUrl = new URL("https://www.dropbox.com/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("token_access_type", "offline");
  authorizeUrl.searchParams.set("state", auth.user.userId);

  return NextResponse.json({ provider, authorizeUrl: authorizeUrl.toString() });
}
