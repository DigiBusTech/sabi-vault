import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CookieConsent } from "@/components/marketing/CookieConsent";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MarketingNav />
      {children}
      <MarketingFooter />
      <CookieConsent />
    </>
  );
}
