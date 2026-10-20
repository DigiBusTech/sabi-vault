"use client";

import { FormEvent, useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Check,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  X,
  Sparkles,
} from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { getDeviceFingerprint } from "@/lib/security/fingerprint.client";
import { setStoredAccessToken } from "@/lib/security/silent_refresh.client";
import { evaluatePasswordComplexity, PasswordValidationResult } from "@/lib/security/password";

const inputClasses =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 disabled:bg-slate-50 disabled:text-slate-400";

type AuthMode = "signin" | "signup" | "forgot";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("mode") === "signup" ? "signup" : "signin"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Invisible bot trap

  const [error, setError] = useState(
    searchParams.get("error") === "confirmation_failed"
      ? "Email confirmation link was invalid or has expired. Please try signing in or requesting a new confirmation link."
      : ""
  );
  const [notice, setNotice] = useState(
    searchParams.get("notice") === "password_reset_success"
      ? "Password updated successfully. Please sign in with your new password."
      : searchParams.get("notice") === "email_verified"
      ? "Email confirmed successfully. Please sign in to access your sovereign vault."
      : ""
  );
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Progressive lockout countdown state (strictly for sign-in mode)
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);
  const [isPermanentLock, setIsPermanentLock] = useState(false);

  // Behavioral telemetry
  const mountTimeRef = useRef<number>(Date.now());
  const mouseMovesRef = useRef<number>(0);
  const keystrokesRef = useRef<number>(0);

  // Focus tracking for Granular Browser Autofill Control
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Live Password Complexity Evaluation
  const passwordComplexity: PasswordValidationResult = useMemo(() => {
    return evaluatePasswordComplexity(password);
  }, [password]);

  const passwordsMatch = useMemo(() => {
    return password.length > 0 && password === confirmPassword;
  }, [password, confirmPassword]);

  // Live timer for progressive lockout (sign-in only)
  useEffect(() => {
    if (lockoutRemaining === null || lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const recordMouseMove = () => {
    mouseMovesRef.current += 1;
  };

  const recordKeyDown = () => {
    keystrokesRef.current += 1;
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setNotice("");
    setSecurityAlert(null);
    setConfirmPassword("");
    // If user is switching to signup, clear any sign-in lockout state
    if (next === "signup") {
      setLockoutRemaining(null);
      setIsPermanentLock(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSecurityAlert(null);

    // Stop premature submission if locked (applies strictly to signin)
    if (mode === "signin") {
      if (lockoutRemaining && lockoutRemaining > 0) {
        setError(`Account temporarily locked. Please wait ${lockoutRemaining} seconds.`);
        return;
      }
      if (isPermanentLock) {
        setError("Account permanently locked due to excessive failed attempts. Please contact support.");
        return;
      }
    }

    // Strict validation for Signup Mode
    if (mode === "signup") {
      if (!passwordComplexity.isValid) {
        setError(passwordComplexity.errors[0] || "Password does not meet complexity requirements.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);
    const interactionTimeMs = Date.now() - mountTimeRef.current;

    try {
      // 1. Gather device fingerprint
      const { fingerprintHash } = await getDeviceFingerprint();

      // 2. Select appropriate endpoint
      const targetEndpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";

      // 3. Execute secure request
      const response = await fetch(targetEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          deviceFingerprint: fingerprintHash,
          honeypot, // Bot trap
          mouseMovements: mouseMovesRef.current,
          keystrokes: keystrokesRef.current,
          interactionTimeMs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 423 && mode === "signin") {
          if (data.lockoutLevel === 4) {
            setIsPermanentLock(true);
            setError("Account permanently locked due to excessive failed attempts. Contact support.");
          } else {
            setLockoutRemaining(data.remainingSeconds || 60);
            setError(data.error || `Too many failed attempts. Locked for ${data.remainingSeconds}s.`);
          }
          return;
        }

        setError(data.error || "Authentication failed.");
        return;
      }

      // Handle Signup requiring email verification
      if (mode === "signup" && data.requiresEmailConfirmation) {
        setNotice(
          data.message ||
            "Vault account created! We have sent a confirmation link to your email. Please click it to activate your sovereign vault."
        );
        setPassword("");
        setConfirmPassword("");
        return;
      }

      if (data.isNewDevice) {
        setSecurityAlert("New device/browser detected! A security notification has been logged.");
      }

      if (data.accessToken) {
        setStoredAccessToken(data.accessToken);
      }

      const nextUrl = searchParams.get("next") || "/dashboard";
      router.replace(nextUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error during authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const titles: Record<AuthMode, string> = {
    signin: "Welcome back",
    signup: "Create your vault",
    forgot: "Reset your password",
  };
  const subtitles: Record<AuthMode, string> = {
    signin: "Sign in with single-session device protection.",
    signup: "One account for your verified records, scoped keys, and transparency log.",
    forgot: "Enter your account email and we will send you a secure reset link.",
  };

  return (
    <div
      className="w-full"
      onMouseMove={recordMouseMove}
      onTouchMove={recordMouseMove}
      onKeyDown={recordKeyDown}
    >
      <h1 className="font-poppins text-3xl font-extrabold tracking-tight text-brand-dark">
        {titles[mode]}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{subtitles[mode]}</p>

      {/* Concurrent Login Termination Notice */}
      {searchParams.get("terminated") === "concurrent" && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs font-semibold text-rose-900 shadow-xs">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600" />
          <div>
            <p className="font-bold">Single-Session Security Policy Triggered</p>
            <p className="mt-0.5 font-normal text-rose-800">
              Your previous session was automatically terminated because your account was logged in from another device or browser. SabiProfile strictly restricts active dashboard sessions to one device at a time.
            </p>
          </div>
        </div>
      )}

      {/* Security alert: Unrecognized device */}
      {securityAlert && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-medium text-amber-800">
          <Smartphone size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <span>{securityAlert}</span>
        </div>
      )}

      {/* Lockout alert - Strictly displayed during signin */}
      {mode === "signin" && lockoutRemaining !== null && lockoutRemaining > 0 && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800">
          <Lock size={16} className="mt-0.5 shrink-0 text-rose-600 animate-pulse" />
          <div>
            <p>Account Locked (Brute-Force Mitigation)</p>
            <p className="mt-0.5 font-normal">
              Please wait <span className="font-bold text-rose-950">{lockoutRemaining}s</span> before retrying.
            </p>
          </div>
        </div>
      )}

      {error && (mode === "signup" || !lockoutRemaining) && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-green" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        {/* Invisible Bot Honeypot */}
        <input
          type="text"
          name="security_auth_check_website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            opacity: 0,
            position: "absolute",
            top: 0,
            left: "-9999px",
            height: "1px",
            width: "1px",
            pointerEvents: "none",
          }}
        />

        {/* Username/Email with Granular Autofill Control */}
        <label className="block text-sm font-semibold text-slate-800">
          Email address
          <input
            required
            type="email"
            id="auth-username"
            name="username"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onFocus={() => setEmailFocused(true)}
            onClick={() => setEmailFocused(true)}
            disabled={isSubmitting || (mode === "signin" && lockoutRemaining !== null && lockoutRemaining > 0)}
            className={inputClasses}
            placeholder="you@example.com"
          />
        </label>

        {mode !== "forgot" && (
          <div>
            <PasswordInput
              id="auth-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? "Create a complex password" : "Your password"}
              disabled={isSubmitting || (mode === "signin" && lockoutRemaining !== null && lockoutRemaining > 0)}
            />

            {/* Live Password Complexity Checklist for Signup */}
            {mode === "signup" && (
              <div className="mt-2.5 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-3 text-xs space-y-1.5 transition-all">
                <div className="flex items-center justify-between font-semibold text-slate-700 pb-1 border-b border-slate-200/60">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-brand-green" />
                    <span>Password Security Requirements</span>
                  </span>
                  <span className={`text-[11px] font-bold ${passwordComplexity.isValid ? "text-emerald-700" : "text-slate-400"}`}>
                    {passwordComplexity.isValid ? "All Criteria Satisfied" : "Complexity Required"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  <div className={`flex items-center gap-1.5 ${passwordComplexity.criteria.hasMinLength ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                    {passwordComplexity.criteria.hasMinLength ? <Check size={13} className="text-emerald-600 shrink-0" /> : <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0 ml-0.5 mr-1" />}
                    <span>At least 8 characters</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordComplexity.criteria.hasUppercase ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                    {passwordComplexity.criteria.hasUppercase ? <Check size={13} className="text-emerald-600 shrink-0" /> : <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0 ml-0.5 mr-1" />}
                    <span>Uppercase letter (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordComplexity.criteria.hasLowercase ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                    {passwordComplexity.criteria.hasLowercase ? <Check size={13} className="text-emerald-600 shrink-0" /> : <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0 ml-0.5 mr-1" />}
                    <span>Lowercase letter (a-z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordComplexity.criteria.hasNumber ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                    {passwordComplexity.criteria.hasNumber ? <Check size={13} className="text-emerald-600 shrink-0" /> : <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0 ml-0.5 mr-1" />}
                    <span>At least one number (0-9)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 sm:col-span-2 ${passwordComplexity.criteria.hasSpecial ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                    {passwordComplexity.criteria.hasSpecial ? <Check size={13} className="text-emerald-600 shrink-0" /> : <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0 ml-0.5 mr-1" />}
                    <span>Special character (!@#$%^&* etc.)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "signup" && (
          <div>
            <PasswordInput
              id="auth-confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              placeholder="Repeat your password"
              disabled={isSubmitting}
            />

            {confirmPassword.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                {passwordsMatch ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Check size={13} />
                    <span>Passwords match</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-600 font-medium">
                    <X size={13} />
                    <span>Passwords do not match</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {mode === "signin" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-xs font-semibold text-brand-green hover:text-brand-green-hover cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            (mode === "signin" && ((lockoutRemaining !== null && lockoutRemaining > 0) || isPermanentLock)) ||
            (mode === "signup" && (!passwordComplexity.isValid || !passwordsMatch))
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {mode === "signin" && lockoutRemaining && lockoutRemaining > 0
            ? `Locked (${lockoutRemaining}s)`
            : mode === "signin"
            ? "Sign in"
            : mode === "signup"
            ? "Create vault"
            : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
        {mode === "signin" && (
          <p>
            Don&apos;t have a vault yet?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className="font-semibold text-brand-green hover:text-brand-green-hover cursor-pointer"
            >
              Create one now
            </button>
          </p>
        )}
        {mode === "signup" && (
          <p>
            Already have a vault?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="font-semibold text-brand-green hover:text-brand-green-hover cursor-pointer"
            >
              Sign in
            </button>
          </p>
        )}
        {mode === "forgot" && (
          <p>
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="font-semibold text-brand-green hover:text-brand-green-hover cursor-pointer"
            >
              Back to sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
