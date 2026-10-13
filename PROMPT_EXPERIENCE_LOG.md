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
