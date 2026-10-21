import assert from "assert";
import { randomBytes, randomUUID } from "crypto";

console.log("=======================================================");
console.log("SabiProfile: DEVICE MANAGEMENT & CHALLENGE RESOLUTION SUITE");
console.log("=======================================================");

// 1. In-memory Mock Stores
const memoryChallenges = new Map();
const memorySessions = new Map();

function parseUserAgentFriendly(ua = "") {
  const isMobile = /Android|iPhone|iPod|Mobile/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  let browser = "Web Browser";
  if (/Edg\//i.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome\//i.test(ua)) browser = "Google Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Apple Safari";
  else if (/Firefox\//i.test(ua)) browser = "Mozilla Firefox";
  else if (/Opera|OPR\//i.test(ua)) browser = "Opera";

  let os = "Unknown OS";
  if (/iPhone/i.test(ua)) os = "iOS";
  else if (/iPad/i.test(ua)) os = "iPadOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { browser, os, deviceType, displayName: `${browser} on ${os}` };
}

function createDeviceChallengeMock(params) {
  const id = "dvc_" + randomBytes(8).toString("hex");
  const verificationCode = "482910";
  const ch = {
    id,
    userId: params.userId,
    deviceFingerprint: params.deviceFingerprint,
    verificationCode,
    status: "pending",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };
  memoryChallenges.set(id, ch);
  return ch;
}

function getPendingChallengeForUserMock(userId, callerFingerprint) {
  let found = null;
  memoryChallenges.forEach((ch) => {
    if (ch.userId === userId && ch.status === "pending") {
      if (new Date() <= ch.expiresAt) {
        found = ch;
      }
    }
  });

  if (!found) return null;

  // Caller Guard: Requesting device must never prompt itself
  if (callerFingerprint && found.deviceFingerprint === callerFingerprint) {
    return null;
  }

  return found;
}

function confirmChallengeMock(challengeId, code) {
  const ch = memoryChallenges.get(challengeId);
  if (!ch) return { success: false, error: "Not found" };
  if (ch.status !== "pending") return { success: false, error: "Already completed" };
  if (code !== ch.verificationCode) return { success: false, error: "Invalid code" };

  ch.status = "completed";
  memoryChallenges.set(challengeId, ch);
  return { success: true, challenge: ch };
}

function registerSessionMock(params) {
  const sessionId = randomUUID();
  const session = {
    id: sessionId,
    userId: params.userId,
    deviceFingerprint: params.deviceFingerprint,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    isActive: true,
    lastActiveAt: new Date(),
    createdAt: new Date(),
  };
  memorySessions.set(sessionId, session);
  return session;
}

function getUserDeviceSessionsMock(userId, currentSessionId) {
  const list = [];
  memorySessions.forEach((s) => {
    if (s.userId === userId) {
      const parsed = parseUserAgentFriendly(s.userAgent);
      list.push({
        id: s.id,
        deviceFingerprint: s.deviceFingerprint,
        ipAddress: s.ipAddress,
        browser: parsed.browser,
        os: parsed.os,
        displayName: parsed.displayName,
        deviceType: parsed.deviceType,
        isActive: s.isActive,
        isCurrent: s.id === currentSessionId,
        lastActiveAt: s.lastActiveAt.toISOString(),
      });
    }
  });
  return list;
}

function revokeSessionMock(userId, sessionId) {
  const s = memorySessions.get(sessionId);
  if (s && s.userId === userId) {
    s.isActive = false;
    return true;
  }
  return false;
}

function revokeAllOtherSessionsMock(userId, exceptSessionId) {
  let count = 0;
  memorySessions.forEach((s) => {
    if (s.userId === userId && s.id !== exceptSessionId && s.isActive) {
      s.isActive = false;
      count++;
    }
  });
  return count;
}

function deleteSessionMock(userId, sessionId) {
  const s = memorySessions.get(sessionId);
  if (s && s.userId === userId) {
    memorySessions.delete(sessionId);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// RUN TESTS
// -------------------------------------------------------------

console.log("\n[Test 1] Multi-device Challenge Creation & Caller Fingerprint Isolation...");
const userId = "usr_test_device_owner_9912";
const fpDeviceA = "fp_macbook_chrome_111";
const fpDeviceB = "fp_iphone_safari_222";

// Register active session for Device A
const sessionA = registerSessionMock({
  userId,
  deviceFingerprint: fpDeviceA,
  ipAddress: "102.89.44.1",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0",
});

// Device B initiates login and is challenged
const challenge = createDeviceChallengeMock({
  userId,
  deviceFingerprint: fpDeviceB,
});
assert.strictEqual(challenge.status, "pending");

// Query from Device B (the requesting new device)
const pendingForDeviceB = getPendingChallengeForUserMock(userId, fpDeviceB);
assert.strictEqual(pendingForDeviceB, null, "Requesting device B must NOT receive self-prompt");
console.log("  ✓ Device B is isolated from prompting itself.");

// Query from Device A (the already logged in device)
const pendingForDeviceA = getPendingChallengeForUserMock(userId, fpDeviceA);
assert(pendingForDeviceA, "Device A must see the pending challenge from Device B");
assert.strictEqual(pendingForDeviceA.verificationCode, "482910");
console.log("  ✓ Device A correctly receives the verification challenge with 6-digit PIN.");

// Device B enters the 6-digit PIN
const confirmResult = confirmChallengeMock(challenge.id, "482910");
assert.strictEqual(confirmResult.success, true);
console.log("  ✓ Device B completes 6-digit PIN confirmation.");

// Now Device A queries again: challenge must be cleared!
const pendingForDeviceAAfter = getPendingChallengeForUserMock(userId, fpDeviceA);
assert.strictEqual(pendingForDeviceAAfter, null, "Completed challenge must NOT show on Device A");
console.log("  ✓ Challenge is automatically dismissed from Device A after completion.");

console.log("\n[Test 2] User Dashboard Connected Devices Management...");
// Register session for Device B now that it's verified
const sessionB = registerSessionMock({
  userId,
  deviceFingerprint: fpDeviceB,
  ipAddress: "105.112.98.5",
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
});

const deviceList = getUserDeviceSessionsMock(userId, sessionA.id);
assert.strictEqual(deviceList.length, 2);

const devA = deviceList.find((d) => d.id === sessionA.id);
assert(devA.isCurrent, "Device A must be marked as current session");
assert.strictEqual(devA.displayName, "Google Chrome on macOS");
assert.strictEqual(devA.deviceType, "desktop");

const devB = deviceList.find((d) => d.id === sessionB.id);
assert(!devB.isCurrent, "Device B is not current session on Device A");
assert.strictEqual(devB.displayName, "Apple Safari on iOS");
assert.strictEqual(devB.deviceType, "mobile");
assert.strictEqual(devB.isActive, true);
console.log("  ✓ Devices correctly formatted with friendly names, types and current flags.");

// Test Log Out Single Device (Revoke Device B from Device A)
console.log("\n[Test 3] Revoke Single Device Remotely...");
const revoked = revokeSessionMock(userId, sessionB.id);
assert.strictEqual(revoked, true);
const devBAfter = getUserDeviceSessionsMock(userId, sessionA.id).find((d) => d.id === sessionB.id);
assert.strictEqual(devBAfter.isActive, false, "Device B must now be inactive");
console.log("  ✓ Single device session revoked remotely.");

// Register a 3rd device
const sessionC = registerSessionMock({
  userId,
  deviceFingerprint: "fp_windows_edge_333",
  ipAddress: "197.210.55.10",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36 Edg/120.0",
});

console.log("\n[Test 4] Log Out All Other Devices...");
const revokedCount = revokeAllOtherSessionsMock(userId, sessionA.id);
assert.strictEqual(revokedCount, 1, "Only Device C was active and revoked");
const updatedList = getUserDeviceSessionsMock(userId, sessionA.id);
assert.strictEqual(updatedList.find((d) => d.id === sessionA.id).isActive, true, "Current session A remains active");
assert.strictEqual(updatedList.find((d) => d.id === sessionC.id).isActive, false, "Device C is logged out");
console.log("  ✓ Log Out All Other Devices preserves current session and terminates others.");

console.log("\n[Test 5] Delete Device Record From History...");
const deleted = deleteSessionMock(userId, sessionB.id);
assert.strictEqual(deleted, true);
const remaining = getUserDeviceSessionsMock(userId, sessionA.id);
assert.strictEqual(remaining.length, 2, "Device B record removed from history");
assert(!remaining.some((d) => d.id === sessionB.id));
console.log("  ✓ Device session record deleted cleanly from history.");

console.log("\n=======================================================");
console.log("ALL DEVICE MANAGEMENT & VERIFICATION TESTS PASSED (100%)!");
console.log("=======================================================\n");
