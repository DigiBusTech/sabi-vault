import type { Metadata } from "next";
import "./globals.css";
import { Preloader } from "@/components/Preloader";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-[#0f172a] font-sans antialiased selection:bg-[#059669] selection:text-white">
        <Preloader />
        {children}
      </body>
    </html>
  );
}
