import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sabi Vault | Sovereign Data Infrastructure & Decentralized Identity",
  description:
    "Replacing static PDFs and manual verification with programmable, tamper-proof cryptographic API keys and multi-agent AI verification pipelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
