import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | SabiProfile",
  description: "Terms governing the use of the SabiProfile platform and developer API.",
};

const sections = [
  {
    title: "1. The service",
    body: [
      "SabiProfile provides a platform for storing structured, cryptographically verified representations of personal and professional records, and for sharing controlled access to those records with third parties through scoped API keys.",
      "Physical documents remain in the user's own cloud storage. SabiProfile does not take custody of raw documents and is not a document archive.",
    ],
  },
  {
    title: "2. Accounts and responsibilities",
    body: [
      "You are responsible for the accuracy of records you add to your vault and for the security of your account credentials.",
      "Scoped API keys are bearer instruments. You are responsible for deciding which organizations receive a key, and you may revoke any key at any time from your vault.",
      "Organizations accessing candidate data through the API must hold a valid organization key, must present the candidate's consent key, and may use the data only for the stated screening purpose.",
    ],
  },
  {
    title: "3. Verification tiers",
    body: [
      "Tier 1 records are hashed on sync and prove existence and integrity at a point in time. They do not prove that the underlying document is genuine.",
      "Tier 2 records additionally carry an attestation from an accredited notary or issuing institution. SabiProfile verifies the cryptographic seal; the legal weight of the attestation remains with the attesting party.",
    ],
  },
  {
    title: "4. Acceptable use",
    body: [
      "You may not submit records you do not have the right to hold, attempt to query vaults without a valid consent key, probe or bypass authentication or quota controls, or use screening output as the sole basis for decisions where law requires human review.",
      "We may suspend keys, organizations, or accounts that violate these terms or applicable law.",
    ],
  },
  {
    title: "5. AI screening output",
    body: [
      "Screening results are deterministic evaluations of verified data against a rubric supplied by the requesting organization. They are decision-support signals, not final determinations, and the requesting organization remains responsible for its own decisions and legal obligations.",
    ],
  },
  {
    title: "6. Liability and changes",
    body: [
      "The service is provided with reasonable skill and care. To the extent permitted by law, SabiProfile is not liable for decisions made by third parties using verification output.",
      "We may update these terms with notice. Continued use after the effective date constitutes acceptance.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="bg-white text-brand-dark">
      <article className="mx-auto max-w-3xl px-5 pt-20 pb-24 lg:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">Legal</p>
        <h1 className="mt-4 font-poppins text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: October 2026</p>

        <p className="mt-8 text-sm leading-relaxed text-slate-600">
          These terms govern access to the SabiProfile platform and developer API. They are a
          working draft for the pre-production period and will be finalized with counsel before
          public launch.
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-poppins text-lg font-bold text-brand-dark">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-[1.8] text-slate-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
