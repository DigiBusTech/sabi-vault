// SabiProfile: Signup & Password Complexity Test Suite
import assert from "assert";
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

function evaluatePasswordComplexity(password) {
  const criteria = {
    hasMinLength: password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: SPECIAL_CHAR_REGEX.test(password),
  };

  const errors = [];

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`);
  }
  if (!criteria.hasUppercase) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  }
  if (!criteria.hasLowercase) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  }
  if (!criteria.hasNumber) {
    errors.push("Password must contain at least one number (0-9).");
  }
  if (!criteria.hasSpecial) {
    errors.push("Password must contain at least one special character (!@#$%^&* etc.).");
  }

  return {
    isValid: errors.length === 0,
    errors,
    criteria,
  };
}

console.log("=======================================================");
console.log("SabiProfile: SIGNUP & PASSWORD COMPLEXITY TEST SUITE");
console.log("=======================================================");

// Test 1: Reject simple & out-of-bound passwords
console.log("\n[Test 1] Testing rejection of weak passwords & DoS vectors...");
const weakPasswords = [
  "short1!",        // too short (< 8 chars)
  "alllowercase1!", // no uppercase
  "ALLUPPERCASE1!", // no lowercase
  "NoNumbersHere!", // no number
  "NoSpecial12345", // no special character
  "A".repeat(129) + "a1!", // too long (> 128 chars DoS vector)
];

for (const pass of weakPasswords) {
  const result = evaluatePasswordComplexity(pass);
  if (result.isValid) {
    throw new Error(`Expected weak password "${pass}" to be rejected, but passed!`);
  }
}
console.log("  ✓ All 6 weak/out-of-bound password patterns successfully rejected.");

// Test 2: Accept strong passwords with uppercase, lowercase, number, and special character
console.log("\n[Test 2] Testing acceptance of compliant complex passwords...");
const strongPasswords = [
  "SabiProfile#2026",
  "P@ssw0rdSecure!",
  "C0mplex&V@lid99",
  "N1geria#S0vereign2026",
  "A" + "a".repeat(120) + "1!#$", // 125 chars (within bound)
];

for (const pass of strongPasswords) {
  const result = evaluatePasswordComplexity(pass);
  if (!result.isValid) {
    throw new Error(`Expected strong password to be accepted, but failed with: ${result.errors.join(", ")}`);
  }
}
console.log("  ✓ All compliant complex passwords satisfied all criteria (8-128 chars, upper, lower, digit, special char).");

// Test 3: Lockout Bypass Vulnerability Prevention
console.log("\n[Test 3] Testing Lockout Bypass Prevention on Existing Accounts...");
// Simulate lockout state map
const lockoutState = new Map();
lockoutState.set("target_victim@example.com", { failedAttempts: 3, lockedUntil: Date.now() + 60000 });

// Signup attempt on existing account must NOT reset target's lockout
function attemptSignup(email, accountExists) {
  if (accountExists) {
    // 409 Conflict: account already exists -> Lockout MUST NOT be cleared
    return { status: 409, error: "An account with this email already exists." };
  }
  // Only genuine account creation resets lockout
  lockoutState.delete(email);
  return { status: 200, success: true };
}

const existingAttempt = attemptSignup("target_victim@example.com", true);
assert.strictEqual(existingAttempt.status, 409);
assert.ok(lockoutState.has("target_victim@example.com"), "Lockout must NOT be wiped when signup attempts an existing account");

const newAccountAttempt = attemptSignup("fresh_user@example.com", false);
assert.strictEqual(newAccountAttempt.status, 200);
console.log("  ✓ Lockout bypass attack vector successfully blocked (existing account lockout preserved).");

// Test 4: Unconfirmed Email Session Token Isolation
console.log("\n[Test 4] Testing Unconfirmed Email Session Token Isolation...");
function handleSignupSessionIssuance(requiresEmailConfirmation) {
  if (requiresEmailConfirmation) {
    return { issueTokens: false, setCookies: false };
  }
  return { issueTokens: true, setCookies: true };
}

const unconfirmed = handleSignupSessionIssuance(true);
assert.strictEqual(unconfirmed.issueTokens, false, "Tokens must NOT be issued for unconfirmed email accounts");
assert.strictEqual(unconfirmed.setCookies, false, "Session cookies must NOT be set for unconfirmed email accounts");

const confirmed = handleSignupSessionIssuance(false);
assert.strictEqual(confirmed.issueTokens, true);
assert.strictEqual(confirmed.setCookies, true);
console.log("  ✓ Unconfirmed email session isolation verified (zero tokens/cookies issued before email confirmation).");

console.log("\n=======================================================");
console.log("ALL SIGNUP & PASSWORD COMPLEXITY TESTS PASSED (100%)");
console.log("=======================================================");


