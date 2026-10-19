"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/dashboard");
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
          <span className="font-poppins text-sm font-extrabold tracking-tight">SABI VAULT</span>
        </Link>

        <h1 className="mt-8 font-poppins text-2xl font-extrabold tracking-tight">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Set a new password for your vault. You will be signed in afterwards.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <PasswordInput
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Repeat your new password"
          />

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
