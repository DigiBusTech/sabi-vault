import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CookieConsent } from "@/components/marketing/CookieConsent";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";

export default function MarketingLayout({ children }: { children: ReactNode }) {
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


