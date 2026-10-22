import { NextRequest, NextResponse } from "next/server";
import { getConfigValue } from "@/core/config/platform_config";
import {
  saveUserCloudIntegration,
  CloudProvider,
} from "@/core/storage/cloud_integrations";
import { GoogleDriveConnector } from "@/core/storage/google_drive";
import { DropboxConnector } from "@/core/storage/dropbox";

/**
 * GET /api/v1/integrations/[provider]/callback
 *
 * Handles the OAuth 2.0 authorization code callback from Google Drive or Dropbox.
 * 1. Exchanges code for tokens.
 * 2. Encrypts and stores tokens securely.
 * 3. Initializes the user's isolated "/SabiProfile Vault" root folder.
 * 4. Redirects the user back to their Citizen Dashboard with success confirmation.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider as CloudProvider;
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // Contains userId
  const oauthError = searchParams.get("error");

  const baseUrl = req.nextUrl.origin;

  if (oauthError) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?cloudError=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?cloudError=${encodeURIComponent("Missing authorization code or user state")}`
    );
  }

  const userId = state;

  try {
    if (provider === "google_drive") {
      const clientId =
        (await getConfigValue("integrations.google_drive_client_id")) ||
        process.env.GOOGLE_DRIVE_CLIENT_ID;
      const clientSecret =
        (await getConfigValue("integrations.google_drive_client_secret")) ||
        process.env.GOOGLE_DRIVE_CLIENT_SECRET;
      const redirectUri =
        (await getConfigValue("integrations.google_drive_redirect_uri")) ||
        `${baseUrl}/api/v1/integrations/google_drive/callback`;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(
          `${baseUrl}/dashboard?cloudError=${encodeURIComponent("Google Drive credentials not configured on server")}`
        );
      }

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errDetail = await tokenRes.text();
        return NextResponse.redirect(
          `${baseUrl}/dashboard?cloudError=${encodeURIComponent(`Google token exchange failed: ${errDetail}`)}`
        );
      }

      const tokens = await tokenRes.json();
      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token;
      const expiresIn = tokens.expires_in;

      // Initialize root folder in user's Drive
      let folderId: string | undefined;
      try {
        const driveConnector = new GoogleDriveConnector(accessToken);
        folderId = await driveConnector.createVaultFolder("SabiProfile Vault");
      } catch (fErr) {
        console.warn("[GoogleDriveCallback] Folder init warning:", fErr);
      }

      await saveUserCloudIntegration(userId, "google_drive", {
        accessToken,
        refreshToken,
        expiresIn,
        folderId,
      });

      return NextResponse.redirect(
        `${baseUrl}/dashboard?cloudConnected=google_drive&status=success`
      );
    }

    if (provider === "dropbox") {
      const clientId =
        (await getConfigValue("integrations.dropbox_client_id")) ||
        process.env.DROPBOX_CLIENT_ID;
      const clientSecret =
        (await getConfigValue("integrations.dropbox_client_secret")) ||
        process.env.DROPBOX_CLIENT_SECRET;
      const redirectUri =
        (await getConfigValue("integrations.dropbox_redirect_uri")) ||
        `${baseUrl}/api/v1/integrations/dropbox/callback`;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(
          `${baseUrl}/dashboard?cloudError=${encodeURIComponent("Dropbox credentials not configured on server")}`
        );
      }

      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const tokenRes = await fetch("https://api.dropboxapi.com/oauth2/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenRes.ok) {
        const errDetail = await tokenRes.text();
        return NextResponse.redirect(
          `${baseUrl}/dashboard?cloudError=${encodeURIComponent(`Dropbox token exchange failed: ${errDetail}`)}`
        );
      }

      const tokens = await tokenRes.json();
      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token;
      const expiresIn = tokens.expires_in;

      // Initialize root folder in user's Dropbox
      try {
        const dropboxConnector = new DropboxConnector(accessToken);
        await dropboxConnector.createFolder("/SabiProfile Vault");
      } catch (fErr) {
        console.warn("[DropboxCallback] Folder init warning:", fErr);
      }

      await saveUserCloudIntegration(userId, "dropbox", {
        accessToken,
        refreshToken,
        expiresIn,
      });

      return NextResponse.redirect(
        `${baseUrl}/dashboard?cloudConnected=dropbox&status=success`
      );
    }

    return NextResponse.redirect(
      `${baseUrl}/dashboard?cloudError=${encodeURIComponent("Unsupported cloud provider")}`
    );
  } catch (err: any) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?cloudError=${encodeURIComponent(err.message || "OAuth processing failed")}`
    );
  }
}

