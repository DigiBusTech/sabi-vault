import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Sabi Vault",
  description:
    "How Sabi Vault handles personal data: zero raw document storage, regional data residency, and consent-based sharing.",
};

const sections = [
  {
    title: "1. What we collect",
    body: [
      "Account data: your email address and authentication metadata, used to sign you in.",
      "Structured records: data extracted from documents you sync, stored as schema-validated JSON on a regional database node in your jurisdiction.",
      "Usage data: authentication events and your vault's transparency log, which records every third-party query against your data.",
    ],
  },
  {
    title: "2. What we never collect",
    body: [
      "Your raw documents. Files remain in your own cloud storage (Google Drive, Dropbox) and are read over OAuth, parsed in memory, and the memory buffer is wiped. Sabi Vault servers do not retain document files.",
    ],
  },
  {
    title: "3. Where data lives",
    body: [
      "Structured records are stored on sovereign regional database nodes partitioned by jurisdiction, designed to satisfy NDPC (Nigeria), GDPR (European Union), and equivalent residency requirements.",
      "Cryptographic hashes (SHA-256) of verified records are anchored to a public blockchain. A hash cannot be reversed into your data.",
    ],
  },
  {
    title: "4. Who can access your records",
    body: [
      "Only you, by default. Third parties can query specific categories of your vault only when they present a scoped API key that you issued, and only within that key's category scope, expiry, and quota.",
      "Every such query is written to your transparency log, visible in your vault. You can revoke any key at any time; revocation takes effect on the next query.",
    ],
  },
  {
    title: "5. Cookies",
    body: [
      "We use essential cookies for authentication sessions. With your consent, we use privacy-respecting product analytics. You can accept or decline analytics cookies from the consent banner, and change your choice by clearing site data.",
    ],
  },
  {
    title: "6. Your rights",
    body: [
      "You may export, correct, or delete your structured records from your vault at any time. Deleting a record removes it from the database node; the on-chain hash remains as an unlinkable proof artifact and contains no personal data.",
      "For privacy requests, contact us through the contact page with the topic set to Support.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-white text-brand-dark">
      <article className="mx-auto max-w-3xl px-5 pt-20 pb-24 lg:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">Legal</p>
        <h1 className="mt-4 font-poppins text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: October 2026</p>

        <p className="mt-8 text-sm leading-relaxed text-slate-600">
          This policy describes how Sabi Vault handles personal data. It is a working draft for
          the pre-production period and will be finalized with counsel before public launch.
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
