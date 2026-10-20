import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SabiProfile App | Sovereign Identity and Credential Vault",
  description:
    "Native sovereign identity and programmable credential application. Zero physical paperwork, instant on-chain attestation.",
};

export default function PwaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-600 selection:text-white">
      {children}
    </div>
  );
}

