"use client";

import { FormEvent, Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { evaluatePasswordComplexity } from "@/lib/security/password";

const inputClasses =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/15";

const orgTypes = [
  { value: "ENTERPRISE", label: "Employer / recruitment" },
  { value: "UNIVERSITY", label: "University / admissions" },
  { value: "GOVERNMENT", label: "Government agency" },
  { value: "BORDER_SECURITY", label: "Border and immigration" },
] as const;

const included = [
  "A screening workspace for job, admissions, and immigration requirements",
  "Weighted rubrics generated from your requirement documents",
  "Batch candidate verification with fraud and integrity checks",
  "An organization API key for your ATS or internal tooling",
];

interface RegisteredOrg {
  id: string;
  name: string;
  type: string;
  orgApiKey: string;
}

type Phase = "checking" | "account" | "details" | "done";

function OrganizationSignupForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState<string>("ENTERPRISE");
  const [jurisdiction, setJurisdiction] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredOrg, setRegisteredOrg] = useState<RegisteredOrg | null>(null);
  const [copied, setCopied] = useState(false);
  const passwordComplexity = useMemo(() => evaluatePasswordComplexity(password), [password]);
  const passwordsMatch = useMemo(() => password.length > 0 && password === confirmPassword, [password, confirmPassword]);


  useEffect(() => {
    let cancelled = false;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!cancelled) setPhase(data.session ? "details" : "account");
      })
      .catch(() => {
        if (!cancelled) setPhase("account");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const registerOrganization = async (): Promise<boolean> => {
    const response = await fetch("/api/v1/enterprise/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: orgName, type: orgType, jurisdiction }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Organization registration failed. Please try again.");
      return false;
    }
    setRegisteredOrg(data.organization);
    setPhase("done");
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (phase === "account") {
      const passwordCheck = evaluatePasswordComplexity(password);
      if (!passwordCheck.isValid) {
        setError(passwordCheck.errors[0]);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (phase === "details") {
        await registerOrganization();
        return;
      }

      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/signup/organization`,
        },
      });
      if (signUpError) throw signUpError;

      if (!data.session) {
        setNotice(
          "Account created. Confirm your email using the link we sent you, and it will bring you back here to finish setting up your organization."
        );
        return;
      }

      await registerOrganization();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyKey = async () => {
    if (!registeredOrg) return;
    try {
      await navigator.clipboard.writeText(registeredOrg.orgApiKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Select and copy the key manually.");
    }
  };

  if (phase === "checking") {
    return (
      <div className="flex items-center justify-center py-16" role="status" aria-label="Loading">
        <Loader2 size={22} className="animate-spin text-brand-green" />
      </div>
    );
  }

  if (phase === "done" && registeredOrg) {
    return (
      <div className="w-full">
        <CheckCircle2 size={40} className="text-brand-green" />
        <h1 className="mt-4 font-poppins text-3xl font-extrabold tracking-tight text-brand-dark">
          {registeredOrg.name} is registered.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Your organization is active and your account is now its administrator. This is your
          organization API key. It is shown once, store it somewhere safe.
        </p>

        <div className="mt-6 rounded-2xl border border-brand-green/30 bg-brand-green-light p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-green">
            Organization API key
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-brand-dark">
              {registeredOrg.orgApiKey}
            </code>
            <button
              type="button"
              onClick={copyKey}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:text-brand-green"
              aria-label="Copy organization API key"
            >
              {copied ? <Check size={15} className="text-brand-green" /> : <Copy size={15} />}
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            Send it as the X-Sabi-Org-Key header on screening and M2M requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            router.replace("/dashboard");
            router.refresh();
          }}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-green-hover active:scale-[0.98]"
        >
          Open enterprise dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="font-poppins text-3xl font-extrabold tracking-tight text-brand-dark">
        {phase === "details" ? "Finish setting up your organization" : "Register your organization"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {phase === "details"
          ? "You are signed in. Add your organization details to activate your screening workspace."
          : "Create an account for your company, university, or agency and get a screening workspace with an API key."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block text-sm font-semibold text-slate-800">
          Organization name
          <input
            required
            minLength={2}
            maxLength={160}
            value={orgName}
            onChange={(event) => setOrgName(event.target.value)}
            className={inputClasses}
            placeholder="Covenant Gate University"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Organization type
            <select
              value={orgType}
              onChange={(event) => setOrgType(event.target.value)}
              className={inputClasses}
            >
              {orgTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Jurisdiction
            <input
              required
              minLength={2}
              maxLength={120}
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value)}
              className={inputClasses}
              placeholder="Nigeria / West Africa"
            />
          </label>
        </div>

        {phase === "account" && (
          <>
            <label className="block text-sm font-semibold text-slate-800">
              Work email
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClasses}
                placeholder="you@organisation.com"
              />
            </label>
            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            {/* Live Password Complexity Checklist */}
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

            <PasswordInput
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              placeholder="Repeat your password"
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

          </>
        )}

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="flex items-start gap-2 rounded-xl border border-brand-green/30 bg-brand-green-light px-3.5 py-2.5 text-sm font-medium text-brand-green-hover">
            <Mail size={15} className="mt-0.5 shrink-0" />
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-green-hover active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {isSubmitting
            ? "Please wait"
            : phase === "details"
              ? "Activate workspace"
              : "Create organization account"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-sm">
        <p className="text-slate-600">
          Already registered?{" "}
          <Link href="/login/organization" className="font-semibold text-brand-green hover:text-brand-green-hover">
            Organization sign in
          </Link>
        </p>
        <p className="text-slate-600">
          Looking for a personal vault instead?{" "}
          <Link href="/login?mode=signup" className="font-semibold text-brand-green hover:text-brand-green-hover">
            Create a citizen account
          </Link>
        </p>
      </div>

      <p className="mt-6 border-t border-slate-100 pt-5 text-xs leading-relaxed text-slate-500">
        By continuing you agree to the{" "}
        <Link href="/legal/terms" className="font-semibold text-slate-700 underline">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/legal/privacy" className="font-semibold text-slate-700 underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}

export default function OrganizationSignupPage() {
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
            Screen against proof, with consent built in.
          </h2>
          <ul className="mt-8 space-y-4">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand-green" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          Candidate data is only returned when the candidate&apos;s scoped consent key is presented.
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
          <Suspense fallback={null}>
            <OrganizationSignupForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
