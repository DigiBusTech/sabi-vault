"use client";

import { FormEvent, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { CheckCircle2Animated } from "@/components/ui/animated-icons";

type FormStatus = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/15";

export default function ContactPage() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      organisation: String(form.get("organisation") || ""),
      topic: String(form.get("topic") || "general"),
      message: String(form.get("message") || ""),
    };

    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <main className="bg-white text-brand-dark">
      <section className="mx-auto max-w-7xl px-5 pt-20 pb-24 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
              Contact
            </p>
            <h1 className="mt-4 font-poppins text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">
              Talk to the team.
            </h1>
            <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-slate-600">
              Piloting sovereign credential verification, evaluating the enterprise screening
              API, or accrediting as a notary node. Tell us what you are building and we will
              reply within two business days.
            </p>

            <div className="mt-10 space-y-5">
              {[
                ["Enterprise and API access", "Screening pipelines, rubrics, and batch verification for hiring and admissions teams."],
                ["Government and sovereign nodes", "Regional node hosting, the 40% revenue share, and NDPC or GDPR residency planning."],
                ["Notary accreditation", "Tier 2 attestation onboarding for notaries and issuing institutions."],
              ].map(([title, body]) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-green-light text-brand-green">
                    <Mail size={15} />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold">{title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="liquid-glass-card h-fit rounded-3xl p-7 md:p-9 shadow-xl">
            {status === "success" ? (
              <div className="py-10 text-center">
                <CheckCircle2Animated size={44} className="mx-auto text-brand-green" />
                <h2 className="mt-4 font-poppins text-lg font-bold">Message received</h2>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                  Thank you. A member of the team will reply to your email within two business
                  days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-800">
                    Full name
                    <input required name="name" minLength={2} maxLength={120} autoComplete="name" className={inputClasses} placeholder="Adaeze Nwosu" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-800">
                    Work email
                    <input required type="email" name="email" autoComplete="email" className={inputClasses} placeholder="you@organisation.gov" />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-800">
                    Organisation <span className="font-normal text-slate-500">(optional)</span>
                    <input name="organisation" maxLength={160} autoComplete="organization" className={inputClasses} placeholder="Ministry of Interior" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-800">
                    Topic
                    <select name="topic" className={inputClasses} defaultValue="general">
                      <option value="general">General enquiry</option>
                      <option value="enterprise">Enterprise and API access</option>
                      <option value="government">Government and sovereign nodes</option>
                      <option value="notary">Notary accreditation</option>
                      <option value="support">Support</option>
                    </select>
                  </label>
                </div>
                <label className="block text-sm font-semibold text-slate-800">
                  Message
                  <textarea
                    required
                    name="message"
                    minLength={10}
                    maxLength={4000}
                    rows={5}
                    className={`${inputClasses} resize-y`}
                    placeholder="Tell us what you are verifying and at what scale."
                  />
                </label>

                {status === "error" && (
                  <p role="alert" className="text-sm font-medium text-red-700">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-green-hover active:scale-[0.98] disabled:opacity-60"
                >
                  {status === "submitting" && <Loader2 size={15} className="animate-spin" />}
                  {status === "submitting" ? "Sending" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
