import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Preloader } from "@/components/Preloader";
import { getDynamicSEO } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getDynamicSEO();

  return {
    metadataBase: new URL(seo.siteUrl),
    title: {
      default: seo.metaTitle,
      template: "%s | SabiProfile",
    },
    description: seo.metaDescription,
    keywords: seo.metaKeywords.split(",").map((k) => k.trim()),
    authors: [
      { name: "Sabi AI Technologies Ltd", url: "https://SabiProfile.org" },
    ],
    creator: "Sabi AI Technologies Ltd",
    publisher: "Sabi AI Technologies Ltd",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: seo.faviconUrl, type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "32x32" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/svg+xml" },
      ],
      shortcut: [seo.faviconUrl],
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: seo.siteUrl,
      title: seo.metaTitle,
      description: seo.metaDescription,
      siteName: "SabiProfile",
      images: [
        {
          url: seo.ogImageUrl,
          width: 1200,
          height: 630,
          alt: "SabiProfile - Sovereign Data Infrastructure & Decentralized Identity",
          type: "image/svg+xml",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle,
      description: seo.metaDescription,
      site: seo.twitterHandle,
      creator: seo.twitterHandle,
      images: [seo.ogImageUrl],
    },
    alternates: {
      canonical: seo.siteUrl,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
