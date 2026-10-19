export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  body: string[];
}

export const posts: BlogPost[] = [
  {
    slug: "why-we-never-store-your-documents",
    title: "Why we never store your documents",
    excerpt:
      "Centralized document stores are breach targets. SabiProfile reads files in memory from your own cloud, hashes them, and wipes the buffer.",
    date: "2026-10-10",
    readingTime: "4 min read",
    category: "Architecture",
    body: [
      "Every major identity breach of the last decade had the same shape: a central database full of scans, passports, and certificates that should never have been collected in one place. The moment a platform stores your documents, it becomes a target, and you inherit its risk forever.",
      "SabiProfile takes a different position. Your physical files, the PDFs, scans, and statements, never leave your own Google Drive or Dropbox. We connect with read-only OAuth scopes, pull a file into memory, extract the structured data, compute a SHA-256 hash, and then overwrite the buffer. There is no upload folder to breach because there is no upload folder.",
      "What remains on our side is a structured record on a regional database node and a hash on a public blockchain. Neither one can be turned back into your document. If a record is altered by even a single character, the recomputed hash fails against the on-chain anchor and every downstream verification fails closed.",
      "This design costs us convenience in a few places, and it is worth it. Zero raw centralization is not a feature flag. It is the load-bearing decision the rest of the platform is built on.",
    ],
  },
  {
    slug: "what-a-scoped-api-key-actually-is",
    title: "What a scoped API key actually is",
    excerpt:
      "Instead of emailing a PDF, you issue a signed key that names exactly which categories an organization may read, for how long, and how many times.",
    date: "2026-10-06",
    readingTime: "5 min read",
    category: "Product",
    body: [
      "When you apply for a visa today, you email a stranger a folder containing your bank statements, your degree, and often your birth certificate. That folder can be forwarded, copied, or leaked, and you will never know. The document outlives the decision it was collected for.",
      "A SabiProfile scoped key inverts that. The key is a signed token that carries its own policy: which of your six credential categories it may read, when it expires, how many queries it allows, and optionally which single organization may present it.",
      "The receiving institution never sees the rest of your vault. A lender asking about proof of funds cannot read your academic history. An admissions office reading your transcript cannot see your bank balance. The scope is enforced cryptographically, not by a terms-of-service promise.",
      "Revocation is one click. The moment you revoke a key, the registry rejects it on the next query, regardless of where it was copied. And every query made against your vault is written to your transparency log, so sharing is something you can audit, not something you hope about.",
    ],
  },
  {
    slug: "how-on-chain-hashes-catch-tampered-records",
    title: "How on-chain hashes catch tampered records",
    excerpt:
      "A database can be edited by anyone with access. An anchored SHA-256 hash cannot. Here is how the two together make tampering visible.",
    date: "2026-09-28",
    readingTime: "6 min read",
    category: "Security",
    body: [
      "Any database, however well administered, can be changed by someone with sufficient access. That includes the honest administrator running a migration and the attacker who found the credentials. The question is not whether records can change, but whether a change can be detected.",
      "When a record enters a SabiProfile vault, we compute its SHA-256 hash and commit that hash, with a timestamp, to a smart contract on an EVM network. The contract does one thing: it remembers hashes. It cannot be edited retroactively, and it does not depend on our servers being honest.",
      "Verification then becomes a recomputation. When an enterprise queries a candidate, the Integrity Agent hashes the record it was just handed and compares it to the on-chain anchor. One flipped character anywhere in the record produces a completely different hash, the comparison fails, and the screening pipeline stops before any AI evaluation runs.",
      "We chose a low-cost L2 network for this deliberately. Anchoring a hash costs fractions of a cent, which makes it practical to anchor every record rather than a sample. Tamper-evidence that only covers one record in a thousand is a brochure, not a control.",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
