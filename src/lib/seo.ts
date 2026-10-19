import { getConfigValue, primeConfigCache } from "@/core/config/platform_config";

export interface ResolvedSEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImageUrl: string;
  faviconUrl: string;
  siteUrl: string;
  twitterHandle: string;
}

/**
 * Server-side helper to resolve dynamic SEO configuration.
 * Pulls from the hot cache or sovereign database first, falling back to
 * environment variables, then to registered defaults.
 */
export async function getDynamicSEO(): Promise<ResolvedSEO> {
  try {
    await primeConfigCache();

    const [
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImageUrl,
      faviconUrl,
      siteUrl,
      twitterHandle,
    ] = await Promise.all([
      getConfigValue("seo.meta_title"),
      getConfigValue("seo.meta_description"),
      getConfigValue("seo.meta_keywords"),
      getConfigValue("seo.og_image_url"),
      getConfigValue("seo.favicon_url"),
      getConfigValue("seo.site_url"),
      getConfigValue("seo.twitter_handle"),
    ]);

    return {
      metaTitle: metaTitle || "Sabi Vault | Sovereign Data Infrastructure & Decentralized Identity",
      metaDescription:
        metaDescription ||
        "Replacing static PDFs and manual verification with programmable, tamper-proof cryptographic API keys and multi-agent AI verification pipelines. Powered by Sabi AI Technologies Ltd.",
      metaKeywords:
        metaKeywords ||
        "sovereign data infrastructure, decentralized identity, verifiable credentials, NDPC compliance, GDPR data residency, Base Sepolia blockchain, Sabi AI Technologies",
      ogImageUrl: ogImageUrl || "/og-image.svg",
      faviconUrl: faviconUrl || "/favicon.svg",
      siteUrl: siteUrl || "https://sabivault.org",
      twitterHandle: twitterHandle || "@SabiVault",
    };
  } catch (error) {
    console.warn("[SEO] Failed to resolve dynamic platform SEO config, using fallback defaults:", error);
    return {
      metaTitle: "Sabi Vault | Sovereign Data Infrastructure & Decentralized Identity",
      metaDescription:
        "Replacing static PDFs and manual verification with programmable, tamper-proof cryptographic API keys and multi-agent AI verification pipelines. Powered by Sabi AI Technologies Ltd.",
      metaKeywords:
        "sovereign data infrastructure, decentralized identity, verifiable credentials, NDPC compliance, GDPR data residency, Base Sepolia blockchain, Sabi AI Technologies",
      ogImageUrl: "/og-image.svg",
      faviconUrl: "/favicon.svg",
      siteUrl: "https://sabivault.org",
      twitterHandle: "@SabiVault",
    };
  }
}
