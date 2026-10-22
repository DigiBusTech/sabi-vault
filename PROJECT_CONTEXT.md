> **Status:** Pre-production; Google Auth Fast Sign-in/Sign-up active for citizens and organizations with Super Admin runtime OAuth configuration (`auth.google_oauth_enabled`, `auth.google_client_id`, `auth.google_client_secret`, `auth.google_redirect_uri`). Multi-Agent Orchestration, B2B/B2C/B2G SaaS Architect, SaaS Pipeline, and Backend Architect skills installed and operational (Entry #058). Universal 9-Category Vault Spectrum (identification, legal, receipts, finance, academics, experience, certs, achievements, portfolio + AI Auto-Detect), Human Profile Suite (`/dashboard/profile`), Persona Niche Studio & Zero-CV Engine (`/dashboard/niches`), AI Sovereign Target Advisor (`/dashboard/advisor`), and Enterprise 4-Track Multi-Stage Evaluation Pipeline with AI Smart Interviewer active. Complete Multi-Page Modular Dashboard Architecture active across all 4 roles. Enterprise Live Telemetry Mission Control active under `/dashboard/admin/telemetry`. All Next.js routes compiled cleanly, 0 errors (100% Passed Test Suites). Enforces pure white background, strict 3-color palette (Pure White #ffffff, Slate Dark #0f172a, Sabi Emerald #059669), Poppins & Montserrat fonts. Dev server: http://localhost:3000.


> **Rule:** This file MUST be read at the beginning of any session by any AI agent, developer, or IDE before inspecting or modifying code. It MUST be updated during every commit or major milestone.





---

## 1. Executive Summary & Global Vision
**SabiProfile** is a sovereign data infrastructure and decentralized identity platform engineered to disrupt three fundamental pillars of the global economy:
1. **Immigration & Border Security** (Visa verification, proof of funds, authenticated legal documents).
2. **Education** (Instant credential attestation, tamper-proof transcript verification, admissions screening).
3. **Labour & Enterprise Hiring** (Fraud-proof employment history, programmable candidate screening, real-time qualification audits).

Traditional systems rely on static PDF resumes, forged paperwork, fragmented portals, and high-friction manual legalizations. SabiProfile fundamentally shifts data sovereignty back to individuals and sovereign nations by replacing static documents with **programmable, tamper-proof, scoped cryptographic API keys** evaluated by **multi-agent AI screening pipelines** verified against an **immutable blockchain ledger**.

---

## 2. Architectural Pillars

### A. Three-Tier Storage Model
1. **Cloud Storage Tier (User-Controlled / Zero Raw Central Storage):**
   - Physical documents (PDFs, scans, bank statements, certificates) remain strictly inside the user's private cloud drive (Google Drive, Dropbox, OneDrive) or local device via OAuth 2.0.
   - SabiProfile servers **never** centrally store raw user documents.
2. **Structured Data Tier (Sovereign Regional Nodes):**
   - Textual and tabular data extracted from synced documents is normalized into standardized, validated JSON schemas.
   - Hosted on country-specific sovereign database nodes (PostgreSQL / Supabase instances) partitioned by regional jurisdiction to ensure strict adherence to local data protection laws (e.g., **NDPC** in Nigeria/ECOWAS, **GDPR** in the EU).
3. **Immutability Layer (Cryptographic Ledger):**
   - SHA-256 cryptographic hashes are calculated for every synced file or structured record.
   - Hashes and timestamps are anchored onto a low-cost EVM-compatible blockchain network (e.g., Base, Polygon, or Ethereum L2).
   - Serves as the mathematical single source of truth for tamper detection: if a database admin or hacker alters a single character in the candidate's JSON data, the recomputed hash fails verification against the on-chain hash.

### B. Two-Tier Verification Hierarchy
| Verification Tier | Supported Document Types | Validation Workflow & Trust Anchor |
| :--- | :--- | :--- |
| **Tier 1: Standard Hashed** | Bank statements, proof of funds, utility bills, receipts, standard portfolios. | Automatic SHA-256 cryptographic hashing upon OAuth cloud sync. Proves file existence at a specific timestamp and prevents post-upload alteration. |
| **Tier 2: Authenticated / Legalized** | Academic degrees, university transcripts, marriage certificates, sworn affidavits, professional licenses. | Requires institutional attestation or authorized human notary verification before hashing. The notary digital seal, credential metadata, and cryptographic hash are permanently bound on-chain. |

### C. Nine Universal Standardized Vault Categories (+ Auto-Detect)
Every citizen vault organizes extracted structured data into 9 schema-validated domains:
1. `identification` — International passports, passport photographs, national IDs (NIN), driver's licenses, residence permits (Tier-2 Notarized).
2. `legal` — MOUs, affidavits, sworn declarations, partnership contracts, deeds, court orders (Tier-2 Notarized).
3. `receipts` — Purchase receipts, vendor invoices, tuition payment slips, asset acquisition bills (Tier-1 Hashed).
4. `finance` — Bank statements, proof of funds, tax clearance, transaction histories.
5. `portfolio` — Professional summary, bio, public links, personal statements.
6. `certifications` — Professional licenses, technical certifications, industry credentials.
7. `academics` — Degrees, diplomas, transcripts, secondary school certificates.
8. `experience` — Detailed employment history, verified references, project logs.
9. `achievements` — Awards, grants, hackathon placements, recognitions, publications.
*✨ Auto-Detect (AI Classification):* Sentinel Classifier Agent autonomously identifies document layout, seals, and text keywords to categorize into target domains without manual user selection.

### D. Human Profile Setup & Persona Niche Studio (Zero-CV Engine)
- **Human Identity (`/dashboard/profile`):** Verified attributes including CEFR language proficiency scale (A1 to C2 / Native), categorized skill mastery matrix with evaluated tenure, cultural hobbies, and target roles.
- **Persona Niches (`/dashboard/niches`):** Eliminates custom CV drafting and cover letter writing. Users create targeted personas (e.g. *Senior Distributed Systems Engineer*, *EU Chancenkarte Relocation*, *Chevening Fellowship*). When queried by organizations via Scoped API keys, the engine autonomously synthesizes an authentic dossier grounded strictly in on-chain verified records.
- **AI Sovereign Target Advisor (`/dashboard/advisor`):** Autonomous guidance engine monitoring multi-target goals across visas, careers, and scholarships. Evaluates real-time readiness (0-100%) and raises proactive gap alerts (critical blockers, language score boosters, missing tenure records) before applications are submitted.

### E. Scoped Programmable API Key Engine
- Users never send raw PDFs. Instead, they generate a cryptographically signed, scoped API key with fine-grained access policies:
  - **Category Scoping:** e.g., only `["academics", "finance"]`.
  - **TTL / Expiration:** e.g., 7 days, 14 days, or 30 days.
  - **Query Limits:** Single-use or rate-limited.
  - **Recipient Binding:** Optional restriction to designated organization IDs.

### E. Multi-Agent & Multi-LLM Enterprise Screening Engine (B2B)
Evaluators (recruiters, visa officers, admissions deans) upload requirement criteria documents. SabiProfile executes a multi-stage verification pipeline:
1. **Integrity Agent:** Computes live SHA-256 hashes of fetched structured candidate data and cross-checks them against the blockchain ledger.
2. **Criteria Ingestion Agent:** Deconstructs unstructured requirement docs into a strict scoring matrix (minimum GPA, valid liquid balance, specific certifications, verified tenure).
3. **Strict RAG Evaluator Agent:** Evaluates candidate JSON strictly against the rubric with zero hallucination guarantee.
4. **Fraud & Anomaly Detection Agent:** Flags timeline inconsistencies, altered metadata, or mismatching credential issuers.
5. **Multi-LLM Failover Gateway:** Enterprise router maintaining 3–4 redundant model backends (Google Gemini, OpenAI, Anthropic, open-source fallback) with automatic failover, latency tracking, and zero downtime.

---

## 3. Business & Monetization Architecture
1. **B2C Model:**
   - **Free Base Tier:** Personal vault backup, document extraction, basic scoped API key generation.
   - **Pro Tier Subscription:** AI Profile Coach, opportunity matching, automated compliance audits, continuous gap analysis.
2. **B2B / Enterprise SaaS:**
   - Monthly/Annual subscription plans for institutional dashboards.
   - Pay-per-query micro-transactions for bulk and single candidate API verification requests.
3. **GovTech Revenue Split (Smart Contract Enforced):**
   - For queries routed through sovereign regional nodes:
     - **60% to SabiProfile Platform:** Powers infrastructure, AI gateway, and global core network.
     - **40% to Sovereign Node Host (Government/Regional Hub):** Monetizes regulatory compliance for host nations, funding local cloud hosting and creating a direct financial incentive for state-level adoption.

---

## 4. Low-Budget MVP Architecture & Technology Stack
Built specifically to achieve enterprise security with near-zero initial infrastructure costs:

| Layer | Low-Budget / High-Scale Technology Selection | Rationale |
| :--- | :--- | :--- |
| **Frontend & API** | **Next.js 14/15 (App Router, TypeScript, Tailwind CSS, shadcn/ui)** | Full-stack simplicity, high performance, deployable free on Vercel/Cloudflare. |
| **Database & Auth** | **Supabase (PostgreSQL 16 + Row Level Security + Vault)** | Generous free tier, built-in Auth, instant RLS policies, native country node replication capability. |
| **Cloud Sync** | **Google Drive API (OAuth 2.0 restricted scope)** | Direct read of user PDFs without server storage; zero cloud storage bill for SabiProfile. |
| **Document Parser** | **PDF-Parse + Tesseract / OCR + Gemini Flash parser** | Extremely low cost / free tier extraction of text into strict JSON schemas. |
| **Blockchain** | **Base Sepolia / Polygon Amoy (EVM L2) + Solidity Contracts** | Sub-cent gas fees, rock-solid security, instant transaction finality, EVM standard. |
| **LLM Gateway** | **Multi-LLM Gateway Router (Gemini 1.5 Flash + Groq LLaMA 3 + OpenAI mini)** | Extremely high throughput, sub-second latency, near-zero inference cost per query. |
| **Security / Crypto** | **Web Crypto API / Node `crypto` (SHA-256) + Ed25519 / HMAC Scoped Keys** | Industry-standard cryptographic tamper proofing. |

---

## 5. Directory & Module Blueprint
```
sabiprofile/
├── .cursorrules                       # Cross-IDE rule enforcer
├── AGENTS.md                          # Mandatory agent instructions
├── PROJECT_CONTEXT.md                 # THIS FILE (Master Project Context)
├── PROMPT_EXPERIENCE_LOG.md           # Prompt history, experiences, bug fixes, decisions
├── IMPLEMENTATION_PLAN.md             # Detailed engineering roadmap
├── contracts/                         # Solidity Smart Contracts (Registry, Revenue Split)
│   ├── SabiProfileRegistry.sol          # Hash notary & verification ledger
│   └── SabiRevenueSplitter.sol        # 60/40 fee split smart contract
├── src/
│   ├── app/                           # Next.js App Router (User Vault, Enterprise Portal)
│   │   ├── (marketing)/               # Public site: home (hero verification sim, FAQ, testimonials), government, enterprise, about, blog, contact, docs, legal
│   │   ├── reset-password/            # Password reset completion after email link
│   │   ├── signup/organization/       # Self-serve org onboarding -> enterprise_admin + API key
│   │   ├── login/                     # Split-screen Supabase email/password signup and sign-in
│   │   ├── auth/callback/             # Supabase email-confirmation callback
│   │   │   ├── dashboard/                 # Server-verified session entry; renders DashboardShell + role workspaces
│   │   └── api/                       # Scoped Query, Admin, Govt, Vault, M2M, Integrations & Contact APIs
│   ├── lib/                           # Core Libraries & Infrastructure
│   │   ├── auth/                      # Unified AuthGuard (Citizen, Admin, M2M, Role Enforcer)
│   │   ├── security/                  # Enterprise Security Suite (Lockout, Session, Bot Defense, Fingerprint)
│   │   └── supabase/                  # Server, Client, and Service-Role Admin Supabase Clients
│   ├── middleware.ts                  # Route guard, AI scraper detection & strict enterprise security headers
│   ├── components/                    # Modular Dashboard Views (Citizen, Enterprise, Govt)
│   │   ├── Preloader.tsx              # Session-gated brand preloader (shield draw, reduced-motion safe)
│   │   ├── CitizenVaultView.tsx       # B2C Credential CRUD, Document Intake, Scoped Key Manager
│   │   ├── EnterpriseScreeningView.tsx# B2B Dynamic Grounding Studio, Single & Bulk Screening
│   │   ├── SovereignGovtView.tsx      # GovTech Telemetry, 40% Fiscal Splitter & Fraud Radar
│   │   ├── dashboard/                 # DashboardShell (sidebar, scroll-spy, ambient bg), DocumentIntake (drag-drop upload), ScanPipeline, CloudConnectModal
│   │   ├── marketing/                 # Nav, footer, cookie consent, Reveal, VerificationSim
│   │   └── auth/                      # LoginForm, PasswordInput with visibility toggle & autofill protection
│   ├── core/
│   │   ├── admin/                     # Super admin store, AES-256 dynamic configuration vault
│   │   ├── vault/                     # Citizen vault store, credential CRUD, key revocation
│   │   ├── government/                # Sovereign node telemetry, 40% micro-split disbursement
│   │   ├── enterprise/                # Dynamic criteria rubrics, parallel batch screening engine
│   │   ├── blockchain/                # EVM interaction, hash anchors, contract clients
│   │   ├── crypto/                    # SHA-256 hashing, scoped API key generators
│   │   ├── sovereign/                 # Sovereign node routing & residency compliance
│   │   ├── storage/                   # OAuth cloud connectors (Google Drive, Dropbox)
│   │   └── parser/                    # OCR & structured JSON extraction pipelines
│   ├── agents/                        # Multi-Agent Screening & Gateway
│   │   ├── gateway/                   # Multi-LLM failover router (Gemini, Groq, OpenAI)
│   │   ├── integrity_agent.ts         # Blockchain hash verification agent
│   │   ├── criteria_agent.ts          # Requirement document deconstruction agent
│   │   ├── evaluation_agent.ts        # Zero-hallucination RAG scoring agent
│   │   └── fraud_detection_agent.ts   # Anomaly & tamper detection agent
│   └── types/                         # TypeScript schemas (User categories, API keys, nodes)
```

---

## 6. Commit & Update Protocol
1. **Before any code creation or modification:** Agents/Developers must review `PROJECT_CONTEXT.md` and `PROMPT_EXPERIENCE_LOG.md`.
2. **After any commit, fix, or feature addition:**
   - Update `PROMPT_EXPERIENCE_LOG.md` with prompt details, solution design, and verified outcomes.
   - Update `PROJECT_CONTEXT.md` if data schemas, architectural components, or active status change.
