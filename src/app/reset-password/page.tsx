"use client";

import { FormEvent, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { evaluatePasswordComplexity } from "@/lib/security/password";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordComplexity = useMemo(() => evaluatePasswordComplexity(password), [password]);
  const passwordsMatch = useMemo(() => password.length > 0 && password === confirmPassword, [password, confirmPassword]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!passwordComplexity.isValid) {
      setError(passwordComplexity.errors[0] || "Password does not meet security requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/login?notice=password_reset_success");
      router.refresh();
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Could not update the password. Request a fresh reset link and try again."
      );
      setIsSubmitting(false);
    }
  };


  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-5 py-16 text-brand-dark">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Back to homepage">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white">
            <ShieldCheck size={17} strokeWidth={2} />
          </span>
          <span className="font-poppins text-sm font-extrabold tracking-tight">SabiProfile</span>
        </Link>

        <h1 className="mt-8 font-poppins text-2xl font-extrabold tracking-tight">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Set a new password for your vault. You will be signed in afterwards.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <PasswordInput
              label="New password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />

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
          </div>

          <div>
            <PasswordInput
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              placeholder="Repeat your new password"
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


          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-green-hover active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isSubmitting ? "Updating" : "Update password"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-sm font-semibold text-brand-green hover:text-brand-green-hover"
        >
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
