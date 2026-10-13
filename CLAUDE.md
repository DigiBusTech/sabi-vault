# CLAUDE.md - Sabi Vault Assistant Instructions

Before reading or editing any code or answering any prompt:
1. Read `PROJECT_CONTEXT.md` (System Architecture, Tiers, Schemas, Current Status).
2. Read `PROMPT_EXPERIENCE_LOG.md` (User Prompts, Historical Decisions, Learnings).
3. Respect all architectural invariants:
   - Zero raw document storage: user cloud via OAuth only.
   - Sovereign data nodes: PostgreSQL/Supabase regional compliance (NDPC/GDPR).
   - Blockchain immutability: SHA-256 document hashing + EVM ledger verification.
   - Two-tier verification: Tier 1 Standard Hashed, Tier 2 Authenticated/Legalized.
   - 60/40 GovTech revenue split smart contract.
   - Multi-agent screening engine: Integrity Agent, Criteria Ingestion Agent, RAG Evaluation Agent, Fraud Detection Agent, Multi-LLM Gateway.
   - Low-budget MVP tech stack.
4. Record your work in `PROMPT_EXPERIENCE_LOG.md` after every user instruction or commit.

