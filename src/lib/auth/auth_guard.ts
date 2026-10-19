import { NextRequest, NextResponse } from "next/server";
import { globalAdminStore } from "@/core/admin/admin_store";
import { findOrganizationByApiKey } from "@/core/enterprise/org_repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getConfigValue, primeConfigCache } from "@/core/config/platform_config";
import { verifyAccessToken } from "@/lib/security/session";

export type UserRole = "citizen" | "enterprise_admin" | "notary" | "govt_auditor" | "super_admin";

export interface AuthenticatedUser {
  userId: string;
  email?: string;
  role: UserRole;
  orgId?: string;
  sovereignNode?: string;
}

export interface AuthCheckResult {
  isAuthenticated: boolean;
  user?: AuthenticatedUser;
  error?: string;
  status: number;
}

const INSECURE_DEFAULT_SECRET = "sabi_vault_super_admin_master_aes_256_key_32b!";
const USER_ROLES: UserRole[] = ["citizen", "enterprise_admin", "notary", "govt_auditor", "super_admin"];

function mapSupabaseUser(user: {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
}): AuthenticatedUser {
  const claimedRole = user.app_metadata?.role;
  const role = USER_ROLES.includes(claimedRole as UserRole) ? (claimedRole as UserRole) : "citizen";
  const node = user.app_metadata?.sovereignNode;
  const orgId = user.app_metadata?.org_id;

  return {
    userId: user.id,
    email: user.email,
    role,
    orgId: typeof orgId === "string" ? orgId : undefined,
    sovereignNode: typeof node === "string" ? node : "ng-west-africa",
  };
}

/**
 * Validates Super Admin privileges. Two paths: a Supabase session whose
 * app_metadata role is 'super_admin' (control-plane dashboard), or an
 * 'X-Sabi-Admin-Key' / Bearer token matching the Admin Master Key resolved
 * from the dynamic platform config. Default dev secrets blocked in production.
 */
export async function authenticateAdmin(req: NextRequest): Promise<{ isAdmin: boolean; error?: string }> {
  // Path 1: Supabase session carrying the super_admin role (control-plane dashboard).
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (!error && user && user.app_metadata?.role === "super_admin") {
      return { isAdmin: true };
    }
  } catch {
    // Fall through to the master-key path.
  }

  const adminKey =
    req.headers.get("x-sabi-admin-key") ||
    req.headers.get("X-Sabi-Admin-Key") ||
    req.headers.get("x-admin-key");

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;

  const providedKey = adminKey || bearerToken;
  if (!providedKey) {
    return { isAdmin: false, error: "Missing required 'X-Sabi-Admin-Key' or Bearer admin token." };
  }

  // Warm the config cache so dashboard-managed values resolve for sync consumers.
  await primeConfigCache();
  const configuredMasterKey = await getConfigValue("security.admin_master_key");

  // In production, reject any default or unconfigured master secret
  if (process.env.NODE_ENV === "production") {
    if (!configuredMasterKey || configuredMasterKey === INSECURE_DEFAULT_SECRET) {
      return { isAdmin: false, error: "Production deployment requires the Admin Master Key to be configured in the Super Admin dashboard." };
    }
    if (providedKey === configuredMasterKey) {
      return { isAdmin: true };
    }
    return { isAdmin: false, error: "Invalid administrative credentials." };
  }

  // Development / sandbox environment check
  const validDevKey = configuredMasterKey || INSECURE_DEFAULT_SECRET;
  if (providedKey === validDevKey) {
    return { isAdmin: true };
  }

  return { isAdmin: false, error: "Invalid administrative credentials." };
}


/**
 * Validates Machine-to-Machine Organization license keys (X-Sabi-Org-Key).
 */
export async function authenticateM2M(req: NextRequest): Promise<{
  isValid: boolean;
  org?: ReturnType<typeof globalAdminStore.getOrganization>;
  error?: string;
}> {
  const orgKey = req.headers.get("x-sabi-org-key") || req.headers.get("X-Sabi-Org-Key");
  if (!orgKey) {
    return {
      isValid: false,
      error: "Missing required 'X-Sabi-Org-Key' header. Contact Super Admin to obtain an Org key.",
    };
  }

  // Database is the source of truth for registered organizations; the
  // in-memory registry remains as the development seed fallback.
  const dbOrg = await findOrganizationByApiKey(orgKey);
  if (dbOrg) {
    return { isValid: true, org: dbOrg };
  }

  const result = globalAdminStore.verifyOrgApiKey(orgKey);
  if (!result.isValid || !result.org) {
    return {
      isValid: false,
      error: "Forbidden: Organization key is invalid, suspended, or unrecognized.",
    };
  }

  return { isValid: true, org: result.org };
}

/**
 * Authenticates user session, cryptographically verified Bearer token, or Supabase session.
 */
export async function authenticateUser(req: NextRequest): Promise<AuthCheckResult> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  // 1. Super Admin master key pass-through
  const adminCheck = await authenticateAdmin(req);
  if (adminCheck.isAdmin) {
    return {
      isAuthenticated: true,
      status: 200,
      user: { userId: "usr_super_admin_root", email: "admin@sabivault.org", role: "super_admin" },
    };
  }

  // 2. Verified Bearer Token: Sabi Session Access Token or Supabase Auth JWT
  if (authHeader?.startsWith("Bearer ") && !authHeader.substring(7).trim().startsWith("sbk_live_v1_")) {
    const token = authHeader.substring(7).trim();

    // Check Sabi Cryptographic Access Token first
    const sabiTokenCheck = verifyAccessToken(token);
    if (sabiTokenCheck.isValid && sabiTokenCheck.payload) {
      return {
        isAuthenticated: true,
        status: 200,
        user: {
          userId: sabiTokenCheck.payload.sub,
          email: sabiTokenCheck.payload.email,
          role: sabiTokenCheck.payload.role,
          orgId: sabiTokenCheck.payload.orgId,
          sovereignNode: "ng-west-africa",
        },
      };
    }

    try {
      const supabase = createServerSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        if (user.app_metadata?.account_status === "FROZEN") {
          return {
            isAuthenticated: false,
            status: 403,
            error: "Account Frozen: This account has been temporarily restricted by sovereign compliance.",
          };
        }
        return {
          isAuthenticated: true,
          status: 200,
          user: mapSupabaseUser(user),
        };
      }
    } catch (error) {
      console.error("[Auth] Supabase bearer verification failed.", error);
    }
  }

  // 3. Session Cookies via Supabase SSR
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) {
      if (user.app_metadata?.account_status === "FROZEN") {
        return {
          isAuthenticated: false,
          status: 403,
          error: "Account Frozen: This account has been temporarily restricted by sovereign compliance.",
        };
      }
      return {
        isAuthenticated: true,
        status: 200,
        user: mapSupabaseUser(user),
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Auth] Supabase cookie-session verification failed.", error);
    }
  }

  // 5. Development / Testing Sandbox Session (Never allowed in production)
  if (process.env.NODE_ENV !== "production") {
    const devUserId = req.headers.get("x-sabi-user-id") || "usr_chinwe_okafor_7721";
    const devRole = (req.headers.get("x-sabi-role") as UserRole) || "citizen";
    const userRecord = globalAdminStore.getUser(devUserId);
    if (userRecord && userRecord.status === "FROZEN") {
      return {
        isAuthenticated: false,
        status: 403,
        error: "Account Frozen: This citizen vault has been temporarily restricted by sovereign compliance.",
      };
    }
    return {
      isAuthenticated: true,
      status: 200,
      user: {
        userId: devUserId,
        email: userRecord?.email || `${devUserId}@sabivault.org`,
        role: devRole,
        sovereignNode: userRecord?.sovereignNode || "ng-west-africa",
      },
    };
  }

  return {
    isAuthenticated: false,
    status: 401,
    error: "Authentication required. Please provide a valid session or Authorization header.",
  };
}

/**
 * Enforces role-based authorization for route handlers.
 */
export async function authorizeRoles(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ authorized: boolean; response?: NextResponse; user?: AuthenticatedUser }> {
  const auth = await authenticateUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status }),
    };
  }

  if (auth.user.role === "super_admin" || allowedRoles.includes(auth.user.role)) {
    return { authorized: true, user: auth.user };
  }

  return {
    authorized: false,
    response: NextResponse.json(
      { error: `Forbidden: Role '${auth.user.role}' lacks permission for this endpoint. Required: [${allowedRoles.join(", ")}]` },
      { status: 403 }
    ),
  };
}
