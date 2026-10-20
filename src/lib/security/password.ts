/**
 * Password Complexity Enforcement Engine for SabiProfile
 * Mandates:
 * 1. Minimum 8 characters
 * 2. At least one uppercase letter (A-Z)
 * 3. At least one lowercase letter (a-z)
 * 4. At least one digit (0-9)
 * 5. At least one special character (!@#$%^&* etc.)
 */

export interface PasswordCriteria {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  criteria: PasswordCriteria;
}

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128; // OWASP recommendation to mitigate DoS via heavy hashing
export const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

export function evaluatePasswordComplexity(password: string): PasswordValidationResult {
  const criteria: PasswordCriteria = {
    hasMinLength: password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: SPECIAL_CHAR_REGEX.test(password),
  };

  const errors: string[] = [];

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


