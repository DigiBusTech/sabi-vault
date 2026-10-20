import { randomBytes } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

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

const memoryChallenges = new Map<string, DeviceChallenge>();

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

  memoryChallenges.forEach((ch) => {
    if (ch.userId === params.userId && ch.status === "pending") {
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
    await supabase
      .from("device_verification_challenges")
      .update({ status: "expired" })
      .eq("user_uuid", params.userId)
      .eq("status", "pending");

    await supabase.from("device_verification_challenges").insert({
      id: challengeId,
      user_uuid: params.userId,
      device_fingerprint: params.deviceFingerprint,
      verification_code: verificationCode,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      status: "pending",
      expires_at: expiresAt.toISOString(),
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
        .from("device_verification_challenges")
        .select("*")
        .eq("id", challengeId)
        .maybeSingle();

      if (data) {
        challenge = {
          id: data.id,
          userId: data.user_uuid,
          deviceFingerprint: data.device_fingerprint,
          verificationCode: data.verification_code,
          ipAddress: data.ip_address,
          userAgent: data.user_agent,
          status: data.status,
          createdAt: new Date(data.created_at),
          expiresAt: new Date(data.expires_at),
        };
        memoryChallenges.set(challenge.id, challenge);
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
  let found: DeviceChallenge | null = null;

  memoryChallenges.forEach((ch) => {
    if (ch.userId === userId && ch.status === "pending") {
      if (now > ch.expiresAt) {
        ch.status = "expired";
      } else {
        found = ch;
      }
    }
  });

  if (!found) {
    try {
      const supabase = createAdminSupabaseClient();
      const { data } = await supabase
        .from("device_verification_challenges")
        .select("*")
        .eq("user_uuid", userId)
        .eq("status", "pending")
        .gt("expires_at", now.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        found = {
          id: data.id,
          userId: data.user_uuid,
          deviceFingerprint: data.device_fingerprint,
          verificationCode: data.verification_code,
          ipAddress: data.ip_address,
          userAgent: data.user_agent,
          status: data.status,
          createdAt: new Date(data.created_at),
          expiresAt: new Date(data.expires_at),
        };
        memoryChallenges.set(found.id, found);
      }
    } catch {
      // Fall through
    }
  }

  return found;
}

export async function approveDeviceChallenge(challengeId: string, approvedByUserId: string): Promise<boolean> {
  const challenge = await getDeviceChallenge(challengeId);
  if (!challenge || challenge.userId !== approvedByUserId) return false;
  if (challenge.status !== "pending") return false;

  challenge.status = "approved";
  memoryChallenges.set(challengeId, challenge);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("device_verification_challenges").update({ status: "approved" }).eq("id", challengeId);
  } catch {
    // Non-fatal
  }

  return true;
}

export async function rejectDeviceChallenge(challengeId: string, rejectedByUserId: string): Promise<boolean> {
  const challenge = await getDeviceChallenge(challengeId);
  if (!challenge || challenge.userId !== rejectedByUserId) return false;

  challenge.status = "rejected";
  memoryChallenges.set(challengeId, challenge);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("device_verification_challenges").update({ status: "rejected" }).eq("id", challengeId);
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
    await supabase.from("device_verification_challenges").update({ status: "completed" }).eq("id", params.challengeId);
  } catch {
    // Non-fatal
  }

  return { success: true, challenge };
}
