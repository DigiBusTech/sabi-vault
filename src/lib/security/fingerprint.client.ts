/**
 * Client-Side Robust Device Fingerprinting Utility
 * Combines User-Agent, Screen Specs, Canvas 2D Hash, WebGL Renderer, and Persistent Device ID.
 */

export async function computeSha256Browser(input: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    // Simple fast fallback hash
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, "0");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate offscreen canvas render signature.
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "canvas_unsupported";

    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#059669";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#0f172a";
    ctx.fillText("SabiProfile Security 2026! @#$", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("SabiProfile Security 2026! @#$", 4, 17);

    return canvas.toDataURL();
  } catch {
    return "canvas_blocked";
  }
}

/**
 * Get WebGL GPU renderer string.
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return "webgl_unsupported";

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `${vendor}~${renderer}`;
    }
    return "webgl_no_debug";
  } catch {
    return "webgl_blocked";
  }
}

/**
 * Get or initialize persistent client device seed.
 */
function getPersistentDeviceId(): string {
  if (typeof window === "undefined") return "ssr";

  const STORAGE_KEY = "sb_persistent_device_seed";
  let seed = localStorage.getItem(STORAGE_KEY);
  if (!seed) {
    seed = "dseed_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    try {
      localStorage.setItem(STORAGE_KEY, seed);
    } catch {
      // Storage blocked
    }
  }
  return seed;
}

/**
 * Gathers device specs and returns a deterministic SHA-256 fingerprint hash.
 */
export async function getDeviceFingerprint(): Promise<{
  fingerprintHash: string;
  specs: {
    screen: string;
    userAgent: string;
    language: string;
    timezone: string;
    cores: number;
    canvasHashPreview: string;
  };
}> {
  if (typeof window === "undefined") {
    return {
      fingerprintHash: "ssr_placeholder_fingerprint",
      specs: {
        screen: "unknown",
        userAgent: "unknown",
        language: "en",
        timezone: "UTC",
        cores: 1,
        canvasHashPreview: "",
      },
    };
  }

  const screenSpecs = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth || 24}`;
  const userAgent = window.navigator.userAgent;
  const language = window.navigator.language || "en";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const cores = window.navigator.hardwareConcurrency || 4;
  const canvasHash = getCanvasFingerprint();
  const webgl = getWebGLFingerprint();
  const persistentId = getPersistentDeviceId();

  const rawSeed = [
    userAgent,
    screenSpecs,
    language,
    timezone,
    cores.toString(),
    canvasHash.slice(0, 100),
    webgl,
    persistentId,
  ].join("||");

  const fingerprintHash = await computeSha256Browser(rawSeed);

  return {
    fingerprintHash,
    specs: {
      screen: screenSpecs,
      userAgent,
      language,
      timezone,
      cores,
      canvasHashPreview: canvasHash.slice(0, 32),
    },
  };
}
