"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Building2, CheckCircle2, Loader2, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { getDeviceFingerprint } from "@/lib/security/fingerprint.client";
import { setStoredAccessToken } from "@/lib/security/silent_refresh.client";

const inputClasses =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/15";

const capabilities = [
  "Create requirement rubrics for jobs, admissions, and immigration checks",
  "Screen candidates against verified, on-chain anchored records",
  "Manage your organization API key and query quotas",
];

export default function OrganizationLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  const mountTimeRef = useRef<number>(Date.now());
  const mouseMovesRef = useRef<number>(0);
  const keystrokesRef = useRef<number>(0);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSecurityAlert(null);

    if (lockoutRemaining && lockoutRemaining > 0) {
      setError(`Account temporarily locked. Please wait ${lockoutRemaining} seconds.`);
      return;
    }

    setIsSubmitting(true);
    const interactionTimeMs = Date.now() - mountTimeRef.current;

    try {
      const { fingerprintHash } = await getDeviceFingerprint();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          deviceFingerprint: fingerprintHash,
          honeypot,
          mouseMovements: mouseMovesRef.current,
          keystrokes: keystrokesRef.current,
          interactionTimeMs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 423) {
          setLockoutRemaining(data.remainingSeconds || 60);
          setError(data.error || `Locked due to failed attempts. Please wait ${data.remainingSeconds}s.`);
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

      const role = data.user?.role;
      if (role !== "enterprise_admin" && role !== "super_admin") {
        setNotice(
          "This account is not linked to an organization yet. Register your organization to activate the enterprise dashboard, or continue to your personal vault."
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[100dvh] bg-white text-brand-dark lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-dark px-12 py-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Back to homepage">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white">
            <ShieldCheck size={17} strokeWidth={2} />
          </span>
          <span className="font-poppins text-sm font-extrabold tracking-tight">SabiProfile</span>
        </Link>

        <div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-brand-green">
            <Building2 size={20} strokeWidth={1.8} />
          </span>
          <h2 className="mt-6 max-w-md font-poppins text-3xl font-extrabold leading-[1.12] tracking-tight">
            Your screening workspace.
          </h2>
          <ul className="mt-8 space-y-4">
            {capabilities.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand-green" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          Enterprise access is bound to a registered organization and its server-managed role.
        </p>
      </aside>

      {/* Form panel */}
      <section className="flex min-h-[100dvh] items-center justify-center px-5 py-12 lg:min-h-0">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden" aria-label="Back to homepage">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white">
              <ShieldCheck size={17} strokeWidth={2} />
            </span>
            <span className="font-poppins text-sm font-extrabold tracking-tight text-brand-dark">
              SabiProfile
            </span>
          </Link>

          <h1 className="font-poppins text-3xl font-extrabold tracking-tight text-brand-dark">
            Organization sign in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            For administrators of registered companies, universities, and agencies.
          </p>

          {/* Security alert: Unrecognized device */}
          {securityAlert && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-medium text-amber-800">
              <Smartphone size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <span>{securityAlert}</span>
            </div>
          )}

          {/* Progressive lockout countdown alert */}
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

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
            noValidate
            onMouseMove={() => (mouseMovesRef.current += 1)}
            onTouchMove={() => (mouseMovesRef.current += 1)}
            onKeyDown={() => (keystrokesRef.current += 1)}
          >
            {/* Invisible Bot Trap */}
            <input
              type="text"
              name="security_org_website_trap"
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

            <label className="block text-sm font-semibold text-slate-800">
              Work email
              <input
                required
                type="email"
                id="org-auth-username"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting || (lockoutRemaining !== null && lockoutRemaining > 0)}
                className={inputClasses}
                placeholder="you@organisation.com"
              />
            </label>
            <PasswordInput
              id="org-auth-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              placeholder="Your password"
              disabled={isSubmitting || (lockoutRemaining !== null && lockoutRemaining > 0)}
            />

            {error && !lockoutRemaining && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            {notice && (
              <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-800">
                <p>{notice}</p>
                <div className="mt-2 flex gap-4">
                  <Link href="/signup/organization" className="font-bold underline">
                    Register organization
                  </Link>
                  <Link href="/dashboard" className="font-bold underline">
                    Continue to vault
                  </Link>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (lockoutRemaining !== null && lockoutRemaining > 0)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-green-hover active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {lockoutRemaining && lockoutRemaining > 0
                ? `Locked (${lockoutRemaining}s)`
                : isSubmitting
                ? "Please wait"
                : "Sign in to dashboard"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-sm">
            <p className="text-slate-600">
              No organization account yet?{" "}
              <Link href="/signup/organization" className="font-semibold text-brand-green hover:text-brand-green-hover">
                Register your organization
              </Link>
            </p>
            <p className="text-slate-600">
              Personal vault?{" "}
              <Link href="/login" className="font-semibold text-brand-green hover:text-brand-green-hover">
                Citizen sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
