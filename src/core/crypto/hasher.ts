import { createHash } from "crypto";

/**
 * Deterministically sorts object keys to produce a canonical JSON string.
 * This guarantees that { a: 1, b: 2 } and { b: 2, a: 1 } result in the exact same SHA-256 hash.
 */
export function canonicalJsonStringify(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => canonicalJsonStringify(item)).join(",") + "]";
  }

  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map((key) => {
    return `${JSON.stringify(key)}:${canonicalJsonStringify(obj[key])}`;
  });

  return "{" + entries.join(",") + "}";
}

/**
 * Computes the SHA-256 hash of a string, Buffer, or JavaScript object.
 * Returns the hex-encoded digest (64 characters).
 */
export function computeSha256(data: string | Buffer | object): string {
  const hasher = createHash("sha256");

  if (Buffer.isBuffer(data)) {
    hasher.update(data);
  } else if (typeof data === "string") {
    hasher.update(data, "utf8");
  } else {
    const canonicalString = canonicalJsonStringify(data);
    hasher.update(canonicalString, "utf8");
  }

  return hasher.digest("hex");
}

/**
 * Verifies if candidate data produces the expected SHA-256 hash.
 * Used by the Integrity Agent to verify data against the blockchain ledger.
 */
export function verifySha256(
  data: string | Buffer | object,
  expectedHash: string
): { matches: boolean; computedHash: string } {
  const computedHash = computeSha256(data);
  return {
    matches: computedHash.toLowerCase() === expectedHash.toLowerCase(),
    computedHash,
  };
}
