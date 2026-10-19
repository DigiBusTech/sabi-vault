"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { getDeviceFingerprint } from "@/lib/security/fingerprint.client";
import { setStoredAccessToken } from "@/lib/security/silent_refresh.client";

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

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Progressive lockout countdown state
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);
  const [isPermanentLock, setIsPermanentLock] = useState(false);

  // Behavioral telemetry
  const mountTimeRef = useRef<number>(Date.now());
  const mouseMovesRef = useRef<number>(0);
  const keystrokesRef = useRef<number>(0);

  // Focus tracking for Granular Browser Autofill Control
  const [emailFocused, setEmailFocused] = useState(false);

  // Live timer for progressive lockout
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
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSecurityAlert(null);

    // Stop premature submission if locked
    if (lockoutRemaining && lockoutRemaining > 0) {
      setError(`Account temporarily locked. Please wait ${lockoutRemaining} seconds.`);
      return;
    }
    if (isPermanentLock) {
      setError("Account permanently locked due to excessive failed attempts. Please contact support.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const interactionTimeMs = Date.now() - mountTimeRef.current;

    try {
      // 1. Gather device fingerprint
      const { fingerprintHash } = await getDeviceFingerprint();

      // 2. Execute secure authentication
      const response = await fetch("/api/auth/login", {
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
        if (response.status === 423) {
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

      {/* Security alert: Unrecognized device */}
      {securityAlert && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-medium text-amber-800">
          <Smartphone size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <span>{securityAlert}</span>
        </div>
      )}

      {/* Lockout alert */}
      {lockoutRemaining !== null && lockoutRemaining > 0 && (
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

      {error && !lockoutRemaining && (
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
            disabled={isSubmitting || (lockoutRemaining !== null && lockoutRemaining > 0)}
            className={inputClasses}
            placeholder="you@example.com"
          />
        </label>
        {mode !== "forgot" && (
          <PasswordInput
            id="auth-password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            disabled={isSubmitting || (lockoutRemaining !== null && lockoutRemaining > 0)}
          />
        )}

        {mode === "signup" && (
          <PasswordInput
            id="auth-confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Repeat your password"
            disabled={isSubmitting || (lockoutRemaining !== null && lockoutRemaining > 0)}
          />
        )}

        {mode === "signin" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-xs font-semibold text-brand-green hover:text-brand-green-hover"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || (lockoutRemaining !== null && lockoutRemaining > 0) || isPermanentLock}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {lockoutRemaining && lockoutRemaining > 0
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
              className="font-semibold text-brand-green hover:text-brand-green-hover"
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
              className="font-semibold text-brand-green hover:text-brand-green-hover"
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
              className="font-semibold text-brand-green hover:text-brand-green-hover"
            >
              Back to sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
