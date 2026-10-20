# SABIPROFILE: MANDATORY AI & AGENT DIRECTIVE
> **APPLIES TO ALL AGENTS, SUBAGENTS, AND CODING ASSISTANTS ACROSS ALL IDES (Cursor, Antigravity, Windsurf, Claude Code, GitHub Copilot, Roo/Cline).**

## MANDATORY WORKFLOW FOR EVERY QUERY:
1. **STEP 1 - READ CONTEXT FIRST:**
   - You MUST read `./PROJECT_CONTEXT.md` to understand the current architecture, data schemas, security rules, and active components.
   - You MUST read `./PROMPT_EXPERIENCE_LOG.md` to review user prompts, prior decisions, known issues, and lessons learned.
2. **STEP 2 - COMPLY WITH CORE ARCHITECTURAL INVARIANTS:**
   - **Zero Raw Document Centralization:** SabiProfile never saves physical user PDFs to our servers. Files reside in the user's private Google Drive/Dropbox via OAuth.
   - **Sovereign Node Isolation:** Structured JSON data resides on regional database nodes (PostgreSQL/Supabase) partitioned to satisfy NDPC, GDPR, and regional data residency.
   - **Blockchain Verification Layer:** Every verified document must have a SHA-256 hash committed to the blockchain registry. When an enterprise queries data, the hash must be re-verified against the on-chain ledger.
   - **Strict RAG Evaluator:** AI agents must never hallucinate candidate qualifications. The LLM evaluates only verified structured candidate data against uploaded requirement documents.
   - **Low-Budget MVP Constraint:** Prioritize cost-effective solutions (free tiers, Base/Polygon testnets, Gemini Flash/Groq fallback, Supabase free tier).
3. **STEP 3 - LOGGING AND UPDATING ON EVERY COMMIT:**
   - Every time code or configuration changes are made, append a new log entry to `PROMPT_EXPERIENCE_LOG.md`.
   - If architectural contracts, database schemas, or major modules change, update `PROJECT_CONTEXT.md`.

