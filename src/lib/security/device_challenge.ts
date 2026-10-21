import { randomBytes, randomUUID } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { toValidUuid } from "@/lib/security/session";

export interface DeviceChallenge {
  id: string;
  userId: string;
  userEmail?: string;
  deviceFingerprint: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  verificationCode: string;
  status: "pending" | "approved" | "rejected" | "completed" | "expired";
  activeSessionId?: string;
  createdAt: Date;
  expiresAt: Date;
}

const memoryChallenges: Map<string, DeviceChallenge> =
  (globalThis as any).__sabi_memory_challenges || new Map<string, DeviceChallenge>();
(globalThis as any).__sabi_memory_challenges = memoryChallenges;

function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createDeviceChallenge(params: {
  userId: string;
  userEmail?: string;
  deviceFingerprint: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  activeSessionId?: string;
  ttlMinutes?: number;
}): Promise<DeviceChallenge> {
  const challengeId = "dvc_" + randomBytes(16).toString("hex");
  const verificationCode = generate6DigitCode();
  const ttl = params.ttlMinutes || 10;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl * 60 * 1000);
  const validUuid = toValidUuid(params.userId);

  memoryChallenges.forEach((ch) => {
    if ((ch.userId === params.userId || ch.userId === validUuid) && ch.status === "pending") {
      ch.status = "expired";
    }
  });

  const challenge: DeviceChallenge = {
    id: challengeId,
    userId: params.userId,
    userEmail: params.userEmail,
    deviceFingerprint: params.deviceFingerprint,
    deviceId: params.deviceId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    verificationCode,
    status: "pending",
    activeSessionId: params.activeSessionId,
    createdAt: now,
    expiresAt,
  };

  memoryChallenges.set(challengeId, challenge);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("security_audit_events").insert({
      id: randomUUID(),
      user_uuid: validUuid,
      identifier: params.userEmail || null,
      event_type: "DEVICE_VERIFICATION_CHALLENGE",
      device_fingerprint: params.deviceFingerprint,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      metadata: {
        challengeId,
        verificationCode,
        status: "pending",
        expiresAt: expiresAt.toISOString(),
      },
      created_at: now.toISOString(),
    });
  } catch {
    // Non-fatal fallback
  }

  return challenge;
}


export async function getDeviceChallenge(challengeId: string): Promise<DeviceChallenge | null> {
  let challenge = memoryChallenges.get(challengeId) || null;

  if (!challenge) {
    try {
      const supabase = createAdminSupabaseClient();
      const { data } = await supabase
        .from("security_audit_events")
        .select("*")
        .eq("event_type", "DEVICE_VERIFICATION_CHALLENGE")
        .contains("metadata", { challengeId })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.metadata) {
        const meta = data.metadata as any;
        challenge = {
          id: meta.challengeId,
          userId: data.user_uuid,
          userEmail: data.identifier || undefined,
          deviceFingerprint: data.device_fingerprint || "",
          verificationCode: meta.verificationCode,
          ipAddress: data.ip_address || undefined,
          userAgent: data.user_agent || undefined,
          status: meta.status,
          createdAt: new Date(data.created_at),
          expiresAt: new Date(meta.expiresAt),
        };
        memoryChallenges.set(challenge.id, challenge);
      }
    } catch {
      // Fall through
    }
  }

  // Cross-check resolution in database to catch status updates across serverless lambdas
  if (challenge && challenge.status === "pending") {
    try {
      const supabase = createAdminSupabaseClient();
      const { data: resolutions } = await supabase
        .from("security_audit_events")
        .select("event_type, metadata")
        .in("event_type", [
          "DEVICE_VERIFICATION_COMPLETED",
          "DEVICE_VERIFICATION_APPROVED",
          "DEVICE_VERIFICATION_REJECTED",
        ])
        .order("created_at", { ascending: false })
        .limit(10);

      const match = resolutions?.find((r: any) => r.metadata?.challengeId === challengeId);
      if (match) {
        if (match.event_type === "DEVICE_VERIFICATION_COMPLETED") {
          challenge.status = "completed";
        } else if (match.event_type === "DEVICE_VERIFICATION_APPROVED") {
          challenge.status = "approved";
        } else if (match.event_type === "DEVICE_VERIFICATION_REJECTED") {
          challenge.status = "rejected";
        }
        memoryChallenges.set(challengeId, challenge);
      }
    } catch {
      // Fall through
    }
  }

  if (challenge && challenge.status === "pending" && new Date() > challenge.expiresAt) {
    challenge.status = "expired";
    memoryChallenges.set(challengeId, challenge);
  }

  return challenge;
}

export async function getPendingChallengeForUser(userId: string): Promise<DeviceChallenge | null> {
  const now = new Date();
  const validUuid = toValidUuid(userId);
  let found: DeviceChallenge | null = null;

  memoryChallenges.forEach((ch) => {
    if (ch.userId === userId || ch.userId === validUuid) {
      if (now > ch.expiresAt) {
        ch.status = "expired";
      } else if (ch.status === "pending") {
        found = ch;
      }
    }
  });

  // Cross-check whether a resolution event (completed/rejected) occurred for any challenge in memory
  if (found) {
    try {
      const supabase = createAdminSupabaseClient();
      const { data: resolutions } = await supabase
        .from("security_audit_events")
        .select("event_type, metadata")
        .eq("user_uuid", validUuid)
        .in("event_type", [
          "DEVICE_VERIFICATION_COMPLETED",
          "DEVICE_VERIFICATION_REJECTED",
        ])
        .order("created_at", { ascending: false })
        .limit(10);

      const resolved = resolutions?.some(
        (r: any) => r.metadata?.challengeId === found?.id
      );
      if (resolved) {
        (found as DeviceChallenge).status = "completed";
        found = null;
      }
    } catch {
      // Fall through
    }
  }

  if (!found) {
    try {
      const supabase = createAdminSupabaseClient();
      const { data } = await supabase
        .from("security_audit_events")
        .select("*")
        .eq("user_uuid", validUuid)
        .eq("event_type", "DEVICE_VERIFICATION_CHALLENGE")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.metadata) {
        const meta = data.metadata as any;
        const challengeId = meta.challengeId;
        const expiresAt = new Date(meta.expiresAt);

        // Check if there is any subsequent completion, approval, or rejection event for this challenge
        const { data: resolutions } = await supabase
          .from("security_audit_events")
          .select("event_type, metadata")
          .eq("user_uuid", validUuid)
          .in("event_type", [
            "DEVICE_VERIFICATION_COMPLETED",
            "DEVICE_VERIFICATION_REJECTED",
            "DEVICE_VERIFICATION_APPROVED",
          ])
          .order("created_at", { ascending: false })
          .limit(10);

        const resolution = resolutions?.find(
          (r: any) => r.metadata?.challengeId === challengeId
        );

        if (resolution) {
          if (
            resolution.event_type === "DEVICE_VERIFICATION_COMPLETED" ||
            resolution.event_type === "DEVICE_VERIFICATION_REJECTED"
          ) {
            // Already finalized! No pending challenge exists.
            return null;
          }
        }

        if (meta.status === "pending" && now <= expiresAt) {
          found = {
            id: meta.challengeId,
            userId,
            userEmail: data.identifier || undefined,
            deviceFingerprint: data.device_fingerprint || "",
            verificationCode: meta.verificationCode,
            ipAddress: data.ip_address || undefined,
            userAgent: data.user_agent || undefined,
            status: resolution?.event_type === "DEVICE_VERIFICATION_APPROVED" ? "approved" : "pending",
            createdAt: new Date(data.created_at),
            expiresAt,
          };
          memoryChallenges.set(found.id, found);
        }
      }
    } catch {
      // Fall through
    }
  }

  return found;
}

export async function approveDeviceChallenge(challengeId: string, approvedByUserId: string): Promise<boolean> {
  const challenge = await getDeviceChallenge(challengeId);
  if (!challenge) return false;
  const validApprovedUuid = toValidUuid(approvedByUserId);
  const validChallengeUuid = toValidUuid(challenge.userId);
  if (challenge.userId !== approvedByUserId && validApprovedUuid !== validChallengeUuid) return false;
  if (challenge.status !== "pending") return false;

  challenge.status = "approved";
  memoryChallenges.set(challengeId, challenge);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("security_audit_events").insert({
      id: randomUUID(),
      user_uuid: validApprovedUuid,
      identifier: challenge.userEmail || null,
      event_type: "DEVICE_VERIFICATION_APPROVED",
      device_fingerprint: challenge.deviceFingerprint,
      metadata: { challengeId, status: "approved" },
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal
  }

  return true;
}

export async function rejectDeviceChallenge(challengeId: string, rejectedByUserId: string): Promise<boolean> {
  const challenge = await getDeviceChallenge(challengeId);
  if (!challenge) return false;
  const validRejectedUuid = toValidUuid(rejectedByUserId);
  const validChallengeUuid = toValidUuid(challenge.userId);
  if (challenge.userId !== rejectedByUserId && validRejectedUuid !== validChallengeUuid) return false;

  challenge.status = "rejected";
  memoryChallenges.set(challengeId, challenge);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("security_audit_events").insert({
      id: randomUUID(),
      user_uuid: validRejectedUuid,
      identifier: challenge.userEmail || null,
      event_type: "DEVICE_VERIFICATION_REJECTED",
      device_fingerprint: challenge.deviceFingerprint,
      metadata: { challengeId, status: "rejected" },
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal
  }

  return true;
}

export async function confirmDeviceChallenge(params: {
  challengeId: string;
  code?: string;
}): Promise<{
  success: boolean;
  challenge?: DeviceChallenge;
  error?: string;
}> {
  const challenge = await getDeviceChallenge(params.challengeId);
  if (!challenge) {
    return { success: false, error: "Challenge not found or invalid." };
  }

  if (challenge.status === "completed") {
    return { success: false, error: "Challenge already completed." };
  }

  if (challenge.status === "rejected") {
    return { success: false, error: "Device authorization was rejected by your active device." };
  }

  if (challenge.status === "expired" || new Date() > challenge.expiresAt) {
    return { success: false, error: "Challenge has expired. Please sign in again." };
  }

  let isAuthorized = false;
  if (challenge.status === "approved") {
    isAuthorized = true;
  } else if (params.code && params.code.trim() === challenge.verificationCode) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return {
      success: false,
      error: "Incorrect verification code or awaiting approval from your other device.",
    };
  }

  challenge.status = "completed";
  memoryChallenges.set(params.challengeId, challenge);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("security_audit_events").insert({
      id: randomUUID(),
      user_uuid: toValidUuid(challenge.userId),
      identifier: challenge.userEmail || null,
      event_type: "DEVICE_VERIFICATION_COMPLETED",
      device_fingerprint: challenge.deviceFingerprint,
      metadata: { challengeId: params.challengeId, status: "completed" },
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal
  }

  return { success: true, challenge };
}
