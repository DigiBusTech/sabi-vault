import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CookieConsent } from "@/components/marketing/CookieConsent";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full max-w-full overflow-x-clip min-w-0 flex flex-col min-h-screen">
      <MarketingNav />
      <div className="flex-1 w-full max-w-full overflow-x-clip min-w-0">
        {children}
      </div>
      <PwaInstallBanner />
      <MarketingFooter />
      <CookieConsent />
    </div>
  );
}


