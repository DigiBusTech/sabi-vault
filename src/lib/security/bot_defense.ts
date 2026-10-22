import { NextRequest } from "next/server";

export interface BotVerificationResult {
  isBot: boolean;
  reason?: string;
  score: number; // 0 (pure bot) to 1.0 (human verified)
}

/**
 * Common AI Scrapers, Automated Crawlers, and Headless Browser User Agents.
 */
export const KNOWN_AI_SCRAPERS = [
  "gptbot",
  "chatgpt-user",
  "ccbot",
  "anthropic-ai",
  "claude-web",
  "bytespider",
  "diffbot",
  "perplexitybot",
  "cohere-ai",
  "facebookexternalhit",
  "applebot-extended",
  "omgili",
  "imagesiftbot",
];

export const HEADLESS_AGENT_PATTERNS = [
  "headlesschrome",
  "puppeteer",
  "playwright",
  "selenium",
  "phantomjs",
  "webdriver",
  "electron",
  "nightwatch",
  "cypress",
  "splash",
  "htmlunit",
  "wget",
  "curl",
  "python-requests",
  "python-urllib",
  "aiohttp",
  "go-http-client",
  "axios", // unless authorized M2M key present
];

/**
 * Inspect user-agent string for known scrapers or headless automation engines.
 */
export function isScraperOrHeadless(userAgent: string | null): {
  isDetected: boolean;
  type?: "AI_SCRAPER" | "HEADLESS_AGENT";
  matchedPattern?: string;
} {
  if (!userAgent) {
    return { isDetected: true, type: "HEADLESS_AGENT", matchedPattern: "empty_user_agent" };
  }

  const normalized = userAgent.toLowerCase();

  for (const scraper of KNOWN_AI_SCRAPERS) {
    if (normalized.includes(scraper)) {
      return { isDetected: true, type: "AI_SCRAPER", matchedPattern: scraper };
    }
  }

  for (const pattern of HEADLESS_AGENT_PATTERNS) {
    if (normalized.includes(pattern)) {
      return { isDetected: true, type: "HEADLESS_AGENT", matchedPattern: pattern };
    }
  }

  return { isDetected: false };
}

export interface BotDefensePayload {
  honeypot?: string; // Must remain empty
  clientTime?: number; // Epoch timestamp when form loaded
  mouseMovements?: number; // Count of mouse/touch moves recorded
  keystrokes?: number; // Count of keystrokes
  interactionTimeMs?: number; // Active interaction duration
  userEmail?: string; // Optional user email to detect browser autofill duplication
  currentHost?: string; // Optional request host to detect browser URL autofill
}

/**
 * Validate anti-bot honeypot and behavioral interaction indicators.
 */
export function verifyBotDefense(payload: BotDefensePayload): BotVerificationResult {
  // 1. Invisible Honeypot check:
  // If filled, check whether it is a legitimate browser autofill artifact (e.g. Chrome / Password Managers
  // autofilling the website domain or user email into hidden fields) or an actual automated scraper bot.
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    const rawVal = payload.honeypot.trim().toLowerCase();
    const interactionTime = payload.interactionTimeMs ?? 0;

    const isAutofillArtifact =
      interactionTime >= 350 &&
      (
        (payload.userEmail && rawVal.includes(payload.userEmail.toLowerCase())) ||
        rawVal.includes("sabiprofile.com") ||
        rawVal.includes("vercel.app") ||
        rawVal.includes("localhost") ||
        (payload.currentHost && rawVal.includes(payload.currentHost.toLowerCase()))
      );

    if (!isAutofillArtifact) {
      return {
        isBot: true,
        reason: "Bot trap triggered (honeypot field filled).",
        score: 0.0,
      };
    }
  }

  // 2. Interaction time check: superhuman submission (< 350ms)
  if (payload.interactionTimeMs !== undefined && payload.interactionTimeMs < 350) {
    return {
      isBot: true,
      reason: "Automated submission detected (superhuman speed < 350ms).",
      score: 0.1,
    };
  }

  // 3. Behavioral signals: check that some human movement or keystrokes occurred
  const moves = payload.mouseMovements ?? 0;
  const keys = payload.keystrokes ?? 0;

  if (moves === 0 && keys === 0 && (payload.interactionTimeMs ?? 0) < 600) {
    return {
      isBot: true,
      reason: "Absence of human interaction telemetry (zero pointer or key movements).",
      score: 0.2,
    };
  }

  let humanScore = 0.5;
  if (moves > 2) humanScore += 0.3;
  if (keys > 3) humanScore += 0.2;
  humanScore = Math.min(1.0, humanScore);

  return {
    isBot: false,
    score: humanScore,
  };
}

/**
 * Enterprise Strict Security Headers Builder.
 * Injects X-Robots-Tag: noindex, nofollow, noarchive and robust CSP.
 */
export function applyStrictSecurityHeaders(headers: Headers): void {
  // AI Scraper & Search Engine Exfiltration Prevention
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");

  // Prevent MIME-sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Clickjacking mitigation
  headers.set("X-Frame-Options", "DENY");

  // Strict Referrer Policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Cross-site scripting / reflection
  headers.set("X-XSS-Protection", "1; mode=block");

  // Permissions policy
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
  ].join("; ");

  headers.set("Content-Security-Policy", cspDirectives);
}
