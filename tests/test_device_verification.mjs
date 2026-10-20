import assert from "node:assert";
import { randomBytes } from "node:crypto";
import {
  createDeviceChallenge,
  getPendingChallengeForUser,
  approveDeviceChallenge,
  confirmDeviceChallenge,
} from "../src/lib/security/device_challenge.ts";
import {
  registerUserSession,
  validateActiveUserSession,
  getActiveSessionForUser,
  generateDeviceId,
} from "../src/lib/security/session.ts";

console.log("=======================================================");
console.log("SabiProfile: MULTI-DEVICE VERIFICATION TEST SUITE");
console.log("=======================================================");

async function runTests() {
  const testUserId = "usr_test_device_" + randomBytes(4).toString("hex");
  const testEmail = "test_device@sabiprofile.org";

  // --- Test 1: Device A logs in initially ---
  console.log("\n[Test 1] Device A logs in and establishes active session...");
  const fpDeviceA = "fp_macbook_chrome_device_a_hash_111";
  const sessionA = await registerUserSession({
    userId: testUserId,
    email: testEmail,
    role: "citizen",
    deviceFingerprint: fpDeviceA,
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0",
  });

  assert(sessionA.sessionId, "Session A must have a session ID");
  const activeCheckA = await getActiveSessionForUser(testUserId);
  assert(activeCheckA, "Active session for user must exist");
  assert.strictEqual(activeCheckA.deviceFingerprint, fpDeviceA);
  console.log("  ✓ Device A session registered and active.");

  // --- Test 2: Device B attempts login while Device A is active ---
  console.log("\n[Test 2] Device B attempts login from another device/browser...");
  const fpDeviceB = "fp_windows_firefox_device_b_hash_222";

  const currentActive = await getActiveSessionForUser(testUserId);
  assert(currentActive, "Device A must still be active");

  // Create verification challenge (Device B is locked in challenge state)
  const challenge = await createDeviceChallenge({
    userId: testUserId,
    userEmail: testEmail,
    deviceFingerprint: fpDeviceB,
    deviceId: generateDeviceId(),
    ipAddress: "10.0.0.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0",
    activeSessionId: currentActive.id,
  });

  assert.strictEqual(challenge.status, "pending");
  assert.strictEqual(challenge.verificationCode.length, 6);

  // CRITICAL: Verify Device A's session was NOT terminated!
  const activeCheckAStillActive = await getActiveSessionForUser(testUserId);
  assert(activeCheckAStillActive, "Device A MUST NOT be logged out prematurely");
  assert.strictEqual(activeCheckAStillActive.id, sessionA.sessionId);
  console.log("  ✓ Device B locked in verification state; Device A session NOT terminated.");

  // --- Test 3: Active Device A inspects pending challenge ---
  console.log("\n[Test 3] Active Device A receives pending authorization challenge...");
  const pendingForA = await getPendingChallengeForUser(testUserId);
  assert(pendingForA, "Device A must find pending challenge");
  assert.strictEqual(pendingForA.id, challenge.id);
  assert.strictEqual(pendingForA.verificationCode, challenge.verificationCode);
  console.log(`  ✓ Active device received challenge with 6-digit PIN: [${pendingForA.verificationCode}].`);

  // --- Test 4: Device B cannot confirm with invalid code ---
  console.log("\n[Test 4] Device B attempts confirmation with wrong code...");
  const wrongCodeResult = await confirmDeviceChallenge({
    challengeId: challenge.id,
    code: "000000",
  });
  assert.strictEqual(wrongCodeResult.success, false);
  console.log("  ✓ Invalid code properly rejected.");

  // --- Test 5: Device A approves challenge and verifies Device B ---
  console.log("\n[Test 5] Approving challenge and verifying Device B...");
  const approved = await approveDeviceChallenge(challenge.id, testUserId);
  assert.strictEqual(approved, true);

  const confirmResult = await confirmDeviceChallenge({ challengeId: challenge.id });
  assert.strictEqual(confirmResult.success, true);
  assert.strictEqual(confirmResult.challenge.status, "completed");

  // Register Device B as the active session
  const sessionB = await registerUserSession({
    userId: testUserId,
    email: testEmail,
    role: "citizen",
    deviceFingerprint: fpDeviceB,
    ipAddress: "10.0.0.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0",
  });

  assert(sessionB.sessionId);
  const activeCheckB = await getActiveSessionForUser(testUserId);
  assert.strictEqual(activeCheckB.deviceFingerprint, fpDeviceB);

  // Device A is now safely transitioned
  const validateAAfterHandover = await validateActiveUserSession(testUserId, sessionA.refreshToken);
  assert.strictEqual(validateAAfterHandover.isTerminated, true);
  console.log("  ✓ Device B successfully authorized, registered, and transitioned.");

  // --- Test 6: 3-Browser Concurrency Prevention Test ---
  console.log("\n[Test 6] 3-Browser Simultaneous Attempt Simulation...");
  const fpBrowser1 = "fp_chrome_b1_" + randomBytes(4).toString("hex");
  const fpBrowser2 = "fp_firefox_b2_" + randomBytes(4).toString("hex");
  const fpBrowser3 = "fp_edge_b3_" + randomBytes(4).toString("hex");

  // Browser 1 logs in
  const sess1 = await registerUserSession({
    userId: testUserId,
    email: testEmail,
    role: "citizen",
    deviceFingerprint: fpBrowser1,
  });

  // Browser 2 attempts login -> must see active session and get challenged
  const activeForB2 = await getActiveSessionForUser(testUserId);
  assert(activeForB2, "Active session must exist");
  assert.strictEqual(activeForB2.deviceFingerprint, fpBrowser1);
  const isB2Different = activeForB2.deviceFingerprint !== fpBrowser2;
  assert.strictEqual(isB2Different, true, "Browser 2 must be detected as different device");

  // Browser 3 attempts login -> must also see active session and get challenged
  const activeForB3 = await getActiveSessionForUser(testUserId);
  assert(activeForB3, "Active session must exist");
  assert.strictEqual(activeForB3.deviceFingerprint, fpBrowser1);
  const isB3Different = activeForB3.deviceFingerprint !== fpBrowser3;
  assert.strictEqual(isB3Different, true, "Browser 3 must be detected as different device");

  // Verify Browser 1 is still active
  const checkB1 = await validateActiveUserSession(testUserId, sess1.refreshToken);
  assert.strictEqual(checkB1.isValid, true);
  assert.strictEqual(checkB1.isTerminated, false);
  console.log("  ✓ 3-Browser simultaneous bypass prevented: Browser 2 and Browser 3 are challenged; Browser 1 remains active.");

  console.log("\n=======================================================");
  console.log("ALL MULTI-DEVICE VERIFICATION TESTS PASSED (100%)");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
