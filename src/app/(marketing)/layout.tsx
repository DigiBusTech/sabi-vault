"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CookieConsent } from "@/components/marketing/CookieConsent";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPwaLanding = pathname === "/";

  if (isPwaLanding) {
    return (
      <>
        {children}
        <PwaInstallBanner />
        <CookieConsent />
      </>
    );
  }

  return (
    <>
      <MarketingNav />
      {children}
      <PwaInstallBanner />
      <MarketingFooter />
      <CookieConsent />
    </>
  );
}

