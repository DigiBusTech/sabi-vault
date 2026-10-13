# SABI VAULT: PROMPT & EXPERIENCE LOG
> **Mandatory Rule for All Agents & IDEs (Antigravity, Cursor, Windsurf, Claude Code, VSCode):**  
> Every single query and task in this project MUST read and process this log alongside `PROJECT_CONTEXT.md` before analyzing, editing, or creating files. Every user prompt, architectural decision, bug fix, and development experience MUST be appended to this log in reverse or chronological order.

---

## Developer Experience & Project Principles
1. **Security & Cryptographic Verification First:** No unhashed or unverified credential is ever trusted. Hashes must be computed deterministically via SHA-256 and verified on-chain.
2. **Strict Data Compliance & Sovereignty:** Zero raw physical document centralization. Raw files live in user OAuth storage. Structured JSON records live in sovereign regional nodes (NDPC/GDPR compliant).
3. **Budget-Conscious / High-Leverage Architecture:** Prioritize free/low-cost tools for MVP (Supabase free tier, Base/Polygon testnets, Gemini 1.5 Flash / Groq LLaMA 3, Next.js).
4. **Deterministic AI Screening:** Zero hallucinations. The screening engine operates as a strict RAG evaluator against parsed JSON schema data and uploaded criteria documents.
5. **Universal Portability:** Architectural patterns, configurations, and state must remain independent of any single IDE or assistant tool.

---

## Log Entries

### Entry #001: Project Genesis, Context Ingestion, and Master Implementation Roadmap
- **Date & Timestamp:** 2026-10-13 09:21:11 (Local)
- **User Prompt / Intent:**
  > "I want to start building this project Sabi Vault, it will be global scalable enterprise/Government Tech system, cutting accross immigration, education and labour, a solid global scale system that will shift 3 primary sectors in the world economy including soveriegn data shift, read the 2 attached pdf to get the full context overview of Sabi Vault and create a context file which will always be updated during every commit, and detailed implementation plan, I want this to be built with secuirity primary in mind, data compliance model, scalability, feasibilty, profitability, and innovative impact, all detailed features, logics, flows Multiagents must be cleary matching the mission and vision and all dependencies and technologies must meet our low budget build for MVP and early beta testers, before market lauch. let us move the center of gravity and shake the world with the next big thing, also make sure there is a dedicated file that documents all my prompts and fixes and my experience each query must always go through those files and context files to understand everything before editing or implementing any new code, even if i switch IDE or agent ithe new ide must still pass throught that flow. Let us begin with solid assurance and faith."
  
- **Context Ingested:**
  - `Sabi Vault_ Product Specification & Scope.pdf`: Complete 3-tier storage model (User cloud -> Sovereign regional database nodes -> Blockchain ledger), 2-tier document verification (Tier 1 Standard Hashed vs Tier 2 Authenticated/Legalized), 6 user vault categories (`finance`, `portfolio`, `certifications`, `academics`, `experience`, `achievements`), Scoped API key generator, Multi-LLM gateway failover architecture, 60/40 GovTech revenue split smart contract.
  - `The 2-Minute Winning Pitch Script.pdf`: Live demo script, pitch mechanics, and Deep Technical Defense matrix against judge/investor scrutiny (GDPR compliance, why blockchain is needed beyond databases, zero-hallucination RAG, provider failover, two-tier notarization).

- **Actions Taken:**
  1. Created `PROJECT_CONTEXT.md` as the master system context to be maintained across all commits.
  2. Created `PROMPT_EXPERIENCE_LOG.md` (this file) to record all prompts, fixes, and lessons.
  3. Created universal IDE guidance files (`AGENTS.md`, `.cursorrules`, `CLAUDE.md`) so that Cursor, Windsurf, VSCode, and other environments automatically enforce the reading of these context files prior to code execution.
  4. Formulated the comprehensive `IMPLEMENTATION_PLAN.md` spanning architectural design, low-budget MVP tech stack, smart contracts, multi-agent evaluation pipeline, sovereign node routing, and phased milestones.
  5. Built interactive architecture and roadmap artifact for visual clarity and execution tracking.

- **Key Architectural Decisions Made:**
  - **Zero Raw File Storage:** Users authenticate their Google Drive/Dropbox. Files are parsed ephemerally into standardized JSON schemas, hashed, and never retained on central storage.
  - **Sovereign Node Isolation:** Database architecture uses PostgreSQL with regional schemas / multi-tenant routing, allowing regional hosting (e.g., Supabase EU vs Supabase West Africa) to satisfy local data residency rules.
  - **Cryptographic Hash Proofing:** Documents receive SHA-256 hashes committed to EVM smart contracts. Re-hashing occurs in real-time during enterprise queries to detect any database tampering.
  - **Low-Budget High-Speed AI Gateway:** Multi-LLM gateway wraps Gemini 1.5 Flash (free/inexpensive, huge context window), Groq LLaMA-3 (near-instant fallback), and OpenAI mini models to keep operational expenses under $5/month during MVP testing.

- **Next Phase:**
  - Initialize the Next.js TypeScript repository with Tailwind CSS and core folder structure.
  - Implement cryptographic modules (SHA-256 hasher, scoped API key minting/verifying).
  - Draft and compile the EVM smart contracts (`SabiVaultRegistry.sol` and `SabiRevenueSplitter.sol`).

---

### Entry #002: Phase 1 Implementation, Cryptographic Engine, Smart Contracts & Multi-Agent Engine
- **Date & Timestamp:** 2026-10-13 10:02:00 (Local)
- **User Prompt / Intent:**
  > "yes begin next step."

- **Actions Taken:**
  1. **Scaffolded Next.js 14 Full-Stack Architecture:**
     - Configured `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `.gitignore`, and `src/app/globals.css`.
     - Installed Next.js, React 18, TypeScript, Tailwind CSS, Lucide-react, Ethers.js, and Zod.
  2. **Deterministic Cryptographic Hashing Engine (`src/core/crypto/hasher.ts`):**
     - Engineered `canonicalJsonStringify` to guarantee order-independent deterministic JSON representation.
     - Implemented `computeSha256` and `verifySha256` for mathematical equality testing.
  3. **Standardized 6-Category Zod Schemas (`src/types/vault.ts`):**
     - Created schemas for `finance`, `portfolio`, `certifications`, `academics`, `experience`, `achievements`.
     - Implemented `VerificationTier` enum (`TIER_1_STANDARD_HASHED` vs `TIER_2_AUTHENTICATED_LEGALIZED`).
  4. **Scoped Cryptographic API Key Generator & Redactor (`src/core/crypto/scoped_key.ts`):**
     - Formats keys as `sbk_live_v1_<base64UrlPayload>.<signature>`.
     - Verifies HMAC-SHA256 signature with constant-time equality check (`timingSafeEqual`) to prevent timing attacks.
     - Enforces TTL expiration and query quotas.
     - Implemented `filterVaultByScope` to strip and redact any non-permitted categories before exposure to enterprises.
  5. **EVM Smart Contracts (`contracts/`):**
     - `SabiVaultRegistry.sol`: On-chain hash registry with Tier-1 automatic commits and Tier-2 authorized notary seal bindings.
     - `SabiRevenueSplitter.sol`: Automated 60/40 fee split smart contract routing 60% to Sabi Platform and 40% to the Sovereign Regional Node Host.
  6. **Multi-Agent Enterprise Screening Suite (`src/agents/`):**
     - `IntegrityAgent`: Validates structured JSON hashes against on-chain ledger hashes to catch database tampering.
     - `CriteriaAgent`: Deconstructs unstructured requirement documents into structured evaluation rubrics.
     - `StrictRAGEvaluationAgent`: Zero-hallucination evaluator that evaluates only verified candidate data against criteria.
     - `FraudDetectionAgent`: Detects timeline discrepancies, future graduation years, and abnormal balance surges.
     - `MultiLLMGateway`: 4-tier failover router (Gemini 1.5 Flash -> Groq LLaMA 3.3 -> OpenAI GPT-4o-mini -> Deterministic Fallback).
  7. **Core Verification Suite (`tests/test_sabi_core.mjs`):**
     - Verified all 6 core architectural invariants: canonical hashing, valid key minting, tampered key rejection, data category redaction, database anti-tamper detection, and fraud auditing.
  8. **Interactive Dual-Mode Web Application (`src/app/page.tsx`):**
     - Built Citizen Sovereign Vault (B2C) interface with live category browsing and Scoped API Key generator.
     - Built Enterprise Screening Engine (B2B) interface running live multi-agent verification and rendering GovTech 60/40 micro-transaction settlement receipts.

- **Outcome:** All 6 architectural integration tests passed with 100% success.


