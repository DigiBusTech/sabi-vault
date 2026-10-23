import { NextRequest } from "next/server";

export interface ResolveGoogleRedirectUriOptions {
  configuredUri?: string | null;
  defaultDomain?: string;
}

/**
 * Resolves the canonical, exact Google OAuth redirect URI.
 *
 * Eliminates `Error 400: redirect_uri_mismatch` across:
 * 1. Apex vs www subdomains (`sabiprofile.com` vs `www.sabiprofile.com`)
 * 2. Reverse proxy SSL termination (HTTP vs HTTPS)
 * 3. Multi-tenant / Multi-environment deployments (Vercel preview, production apex, localhost)
 *
 * @param req Incoming NextRequest or standard Request
 * @param options Configuration options including configuredUri from Super Admin platform config
 */
export function resolveGoogleRedirectUri(
  req: NextRequest | Request,
  options?: ResolveGoogleRedirectUriOptions
): string {
  const configuredUri = options?.configuredUri?.trim();

  // Extract host and protocol safely handling reverse proxies (Vercel, Cloudflare, etc.)
  let host = "";
  let proto = "https";

  try {
    const urlObj = new URL(req.url);
    host = urlObj.host;
    proto = urlObj.protocol.replace(":", "");
  } catch {
    // Fallback if URL cannot be parsed directly
  }

  // Header inspection takes priority behind reverse proxies
  const forwardedHost = req.headers.get("x-forwarded-host");
  const hostHeader = req.headers.get("host");
  if (forwardedHost) {
    host = forwardedHost.split(",")[0].trim();
  } else if (hostHeader) {
    host = hostHeader.trim();
  }

  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    proto = forwardedProto.split(",")[0].trim();
  }

  const cleanHost = host.toLowerCase().split(":")[0];
  const port = host.split(":")[1];

  // Case 1: Localhost / Development loopback
  if (cleanHost === "localhost" || cleanHost === "127.0.0.1") {
    const devPort = port ? `:${port}` : ":3000";
    return `http://${cleanHost}${devPort}/auth/callback`;
  }

  // Case 2: Production SabiProfile domain (sabiprofile.com or *.sabiprofile.com)
  if (cleanHost === "sabiprofile.com" || cleanHost.endsWith(".sabiprofile.com")) {
    // If an explicit redirect URI is configured in platform config (e.g. https://sabiprofile.com/auth/callback), use it
    if (configuredUri && configuredUri.includes("sabiprofile.com")) {
      return configuredUri.replace(/\/+$/, "");
    }
    // Default canonical production redirect URI (must match Google Cloud Console Authorised redirect URIs)
    return "https://sabiprofile.com/auth/callback";
  }

  // Case 3: Vercel preview or branch deployments (*.vercel.app)
  if (cleanHost.endsWith(".vercel.app")) {
    return `https://${cleanHost}/auth/callback`;
  }

  // Case 4: Any other custom deployment domain
  // Enforce HTTPS for all public web environments as required by Google OAuth 2.0
  const finalProto = proto === "http" && !cleanHost.includes("localhost") ? "https" : proto;
  const portPart = port && port !== "80" && port !== "443" ? `:${port}` : "";
  return `${finalProto}://${cleanHost}${portPart}/auth/callback`;
}

