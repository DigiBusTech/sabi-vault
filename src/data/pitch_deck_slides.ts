export interface PitchDeckSlide {
  id: string;
  number: number;
  category: string;
  tagline: string;
  headline: string;
  subtitle?: string;
  keyMetrics?: Array<{ label: string; value: string; detail?: string }>;
  points?: Array<{ title: string; description: string; tag?: string }>;
  visualType:
    | "title-hero"
    | "tri-sector-problem"
    | "solution-flow"
    | "architecture-invariants"
    | "market-sizing"
    | "multi-agent-discovery"
    | "business-model"
    | "traction-milestones"
    | "competitive-matrix"
    | "growth-flywheel"
    | "team-leadership"
    | "investment-ask";
  speakerNotes: string;
  tableData?: Array<Record<string, string>>;
}

export const PITCH_DECK_SLIDES: PitchDeckSlide[] = [
  // SLIDE 1: TITLE & POSITIONING
  {
    id: "slide-1",
    number: 1,
    category: "Sovereign Identity Protocol",
    tagline: "Eradicating Credential Fraud & Black-Box Screening",
    headline: "SabiProfile: The Sovereign Identity & Cryptographic Verification Protocol",
    subtitle:
      "A decentralized data infrastructure replacing static PDF resumes and forged credentials with programmable, scoped cryptographic API keys verified on Base L2.",
    keyMetrics: [
      { label: "Centralized Files", value: "0 Bytes", detail: "Zero raw document retention" },
      { label: "Verification Latency", value: "< 800ms", detail: "Deterministic on-chain hash checks" },
      { label: "GovTech Split", value: "90 : 10", detail: "Configurable treasury / host split" },
      { label: "Active Network", value: "Base L2", detail: "Ethereum Layer-2 Security" },
    ],
    visualType: "title-hero",
    speakerNotes:
      "Welcome. SabiProfile is the sovereign data infrastructure and decentralized identity platform built to replace the world's most vulnerable asset—unverified paper resumes and centralized PDF storage—with programmable, tamper-proof scoped keys and zero-hallucination multi-agent screening.",
  },

  // SLIDE 2: THE TRI-SECTOR PROBLEM
  {
    id: "slide-2",
    number: 2,
    category: "The Market Problem",
    tagline: "$600B+ Annual Economic Drag",
    headline: "Global Screening Relies on Fake Paperwork, Centralized Honey-Pots, and Broken ATS",
    subtitle:
      "Document fraud, slow manual verifications, and regulatory non-compliance cripple three foundational economic sectors simultaneously.",
    points: [
      {
        title: "Immigration & Consular Bottlenecks",
        description:
          "Consulates spend 40% of processing time manually verifying forged bank statements and diplomas, causing 3-to-6 month visa delays and strict rejection rates.",
        tag: "Border Security",
      },
      {
        title: "Enterprise Hiring & Blind ATS Keyword Matching",
        description:
          "Over 78% of resumes contain exaggerated or forged claims. Traditional ATS software filters out high-performing practical talent while hiring inflated paper pedigrees.",
        tag: "Labour & Talent",
      },
      {
        title: "Sovereign Data Non-Compliance & Breach Liability",
        description:
          "Centralizing raw citizen identity documents violates NDPC (Nigeria/ECOWAS) and GDPR (EU), exposing enterprise verification platforms to catastrophic fines and data leaks.",
        tag: "Data Sovereignty",
      },
    ],
    visualType: "tri-sector-problem",
    speakerNotes:
      "Whether evaluating a skilled software engineer in Lagos, verifying an international student's academic credentials in London, or reviewing a digital nomad visa in Albania, existing systems are either dangerously centralized or rely on forged PDFs.",
  },

  // SLIDE 3: THE SOLUTION
  {
    id: "slide-3",
    number: 3,
    category: "The SabiProfile Solution",
    tagline: "Cryptographic Keys Instead of Vulnerable Files",
    headline: "Sovereign Citizen Vaults + Scoped API Keys + Immutable Blockchain Proofs",
    subtitle:
      "Users own their credentials inside their private cloud storage. Organizations query only consented structured data with instant on-chain mathematical verification.",
    points: [
      {
        title: "1. Zero Raw Document Centralization",
        description:
          "Physical documents (PDFs, bank statements, transcripts) live strictly in the user's private Google Drive or Dropbox via OAuth. Servers never store raw user files.",
        tag: "Privacy By Design",
      },
      {
        title: "2. Programmable Scoped API Keys",
        description:
          "Citizens mint bearer keys (e.g. sbk_live_v1_...) with granular category scopes, query quotas, and expiration TTLs, maintaining complete control over their sovereign data.",
        tag: "Granular Consent",
      },
      {
        title: "3. Base L2 Cryptographic Anchors",
        description:
          "Every credential receives an immutable SHA-256 hash committed to EVM smart contracts. Any database tampering causes instantaneous query rejection.",
        tag: "Mathematical Trust",
      },
    ],
    visualType: "solution-flow",
    speakerNotes:
      "SabiProfile turns candidate credentials into programmable API keys. The citizen never gives away custody of their files, the enterprise gets mathematical verification in under 800 milliseconds, and the citizen can revoke access at any time.",
  },

  // SLIDE 4: ARCHITECTURAL INVARIANTS
  {
    id: "slide-4",
    number: 4,
    category: "Cryptographic Defensibility",
    tagline: "Mathematical Proofs, Never Promises",
    headline: "Four Non-Negotiable Invariants That Prevent Manipulation and Breaches",
    subtitle:
      "Engineered from the ground up to prevent internal database corruption, data theft, and AI hallucinations.",
    points: [
      {
        title: "Zero Raw Document Centralization",
        description:
          "Ephemeral Vision AI parses files into standardized JSON, computes cryptographic hashes, and instantly zeroes memory with buffer.fill(0).",
        tag: "Zero Storage Vector",
      },
      {
        title: "Real-Time Ledger Tamper Detection",
        description:
          "During an enterprise query, the active record is re-hashed. If a rogue database admin or attacker altered a single character, the query fails with TAMPER_DETECTED.",
        tag: "On-Chain Tamper Proof",
      },
      {
        title: "Sovereign Regional Node Isolation",
        description:
          "PostgreSQL regional partitions strictly enforce regional data residency (NDPC West Africa, GDPR European Union), guaranteeing zero extraterritorial leakage.",
        tag: "Regulatory Residency",
      },
      {
        title: "Strict RAG Zero-Hallucination Evaluator",
        description:
          "Our multi-agent screening engine evaluates candidates strictly against verified JSON records and uploaded criteria. The LLM cannot hallucinate qualifications.",
        tag: "Zero Hallucination",
      },
    ],
    visualType: "architecture-invariants",
    speakerNotes:
      "We built SabiProfile on four non-negotiable architectural invariants. Even if our central database were attacked, there are zero PDFs to steal. If someone modifies a user's GPA or bank balance in PostgreSQL, our Base L2 smart contract catches the fraud immediately.",
  },

  // SLIDE 5: MARKET OPPORTUNITY (TAM / SAM / SOM)
  {
    id: "slide-5",
    number: 5,
    category: "Market Size & Growth",
    tagline: "$54.2 Billion Convergence Space",
    headline: "Capitalizing on the Convergence of Identity Verification, HR Tech, and GovTech",
    subtitle:
      "A massive addressable market driven by cross-border labor migration, digital nomadism, and stringent data protection legislation.",
    keyMetrics: [
      { label: "Total Addressable Market", value: "$54.2B", detail: "Global ID, background checks & enterprise ATS" },
      { label: "Serviceable Addressable Market", value: "$14.8B", detail: "Cross-border mobility & emerging market talent" },
      { label: "Serviceable Obtainable Market", value: "$1.2B", detail: "Initial focus: West Africa to UK/EU/US corridors" },
      { label: "Market Growth Rate", value: "18.4% YoY", detail: "Accelerated by statutory immigration reforms" },
    ],
    points: [
      {
        title: "Immigration & Border Compliance ($12.0B)",
        description: "Statutory visa proof-of-funds (UKVI 28-day holding, Germany Opportunity Card points rubric).",
      },
      {
        title: "Enterprise Background Checks & ATS ($23.6B)",
        description: "Cross-border hiring, technical qualification attestation, and developer credential verification.",
      },
      {
        title: "Higher Education & Academic Attestation ($18.6B)",
        description: "Hague Apostille digital notarization and university transcript authentication.",
      },
    ],
    visualType: "market-sizing",
    speakerNotes:
      "Our TAM is 54.2 billion dollars across background checks, identity verification, and ATS software. Stricter statutory immigration rules like UKVI's 28-day holding rule and Germany's Opportunity Card make automated, tamper-proof credential verification an urgent global necessity.",
  },

  // SLIDE 6: PRODUCT DEEP-DIVE & DISCOVERY ENGINE
  {
    id: "slide-6",
    number: 6,
    category: "Product & AI Innovation",
    tagline: "The 'Right Applicant' Discovery Engine",
    headline: "Beyond Flat Credentials: Multi-Agent Screening & Holistic Match Index (HMI)",
    subtitle:
      "Uncovering true practical problem-solvers while eliminating pedigree inflation through autonomous multi-agent pipelines.",
    points: [
      {
        title: "Agent 1: Ledger Integrity Agent",
        description: "Recomputes SHA-256 hashes against Base L2 and validates Tier-1 vs Tier-2 notary attestation.",
        tag: "Integrity",
      },
      {
        title: "Agent 2: Criteria Ingestion Agent",
        description: "Translates unstructured job descriptions and visa guidelines into executable benchmark rubrics.",
        tag: "Grounding",
      },
      {
        title: "Agent 3: Strict RAG Evaluator",
        description: "Evaluates candidates with zero hallucination against verified structured credentials.",
        tag: "Precision",
      },
      {
        title: "Agent 4: Discovery & Radar Agent",
        description:
          "Calculates Holistic Match Index (HMI 0-100), flags Hidden Gems (high practical aptitude overlooked by ATS), and generates tailored interview probes.",
        tag: "Intelligence",
      },
    ],
    visualType: "multi-agent-discovery",
    speakerNotes:
      "Employers struggle because traditional ATS filters candidates on keywords, rejecting self-taught geniuses while shortlisting inflated pedigrees. Our Discovery Engine evaluates verified proof-of-work, calculates the Holistic Match Index, and uncovers hidden gems.",
  },

  // SLIDE 7: BUSINESS MODEL & REVENUE SPLIT
  {
    id: "slide-7",
    number: 7,
    category: "Monetization & Economics",
    tagline: "High-Margin B2B SaaS + Micro-Transactions",
    headline: "Dual-Engine Revenue: Enterprise SaaS Subscriptions & 90:10 GovTech Split",
    subtitle:
      "Predictable recurring SaaS revenue coupled with automated on-chain micro-transaction settlement via SabiRevenueSplitter.sol.",
    keyMetrics: [
      { label: "Platform Treasury Split", value: "90%", detail: "$0.90 per verified query fee" },
      { label: "Sovereign Host Split", value: "10%", detail: "$0.10 paid to regional node host" },
      { label: "Gross Margin", value: "84%+", detail: "Zero central physical storage overhead" },
      { label: "Enterprise Subscription", value: "$199 - $799", detail: "Monthly recurring SaaS tiers" },
    ],
    points: [
      {
        title: "B2B Enterprise Subscriptions",
        description: "Monthly recurring licenses for recruiters, agencies, and consulates for Talent Pool CRM and team RBAC.",
        tag: "Recurring SaaS",
      },
      {
        title: "90:10 Configurable GovTech Split",
        description:
          "$1.00 fee per verified query: 90% ($0.90) to SabiProfile Treasury, 10% ($0.10) to regional node hosts, dynamically configurable via Admin Dashboard.",
        tag: "On-Chain Micro-Fee",
      },
      {
        title: "Citizen Premium Vaults",
        description: "Free tier (25MB) with upsells to Pro ($9.99/yr) and Sovereign ($29.99/yr) for advanced visa simulations and notary seals.",
        tag: "Citizen Pro",
      },
    ],
    visualType: "business-model",
    speakerNotes:
      "Our business model operates on high-margin SaaS subscriptions for hiring teams and automated on-chain query micro-transactions. Our 90:10 revenue split pays regional node hosts, incentivizing sovereign data infrastructure adoption across Africa, the UK, and Europe.",
  },

  // SLIDE 8: TRACTION & ARCHITECTURAL MILESTONES
  {
    id: "slide-8",
    number: 8,
    category: "Proven Execution",
    tagline: "Live Production Infrastructure",
    headline: "Production Platform Built, Smart Contracts Deployed, and Zero Tech Debt",
    subtitle: "A fully functional, battle-tested system with 86 compiled Next.js routes and 100% automated test coverage.",
    keyMetrics: [
      { label: "Production Routes", value: "86 Routes", detail: "Zero TypeScript or build errors" },
      { label: "Automated Test Suites", value: "10 / 10", detail: "100% passing across CRM, RBAC & Forensics" },
      { label: "Blockchain Deployment", value: "Base Sepolia", detail: "Registry & Splitter smart contracts" },
      { label: "Live URL", value: "sabiprofile.com", detail: "End-to-end production web app" },
    ],
    points: [
      {
        title: "Talent Pool CRM & Granular RBAC",
        description: "Enterprise hiring teams manage candidate pipelines with multi-role access (Admin, Recruiter, Interviewer).",
      },
      {
        title: "Consular Forensics Radar",
        description: "Automated detection of 28-day funds holding periods, funds dumping anomalies, and Hague Apostille checks.",
      },
      {
        title: "Dynamic Transactional Email Studio",
        description: "Event-triggered citizen transparency notices, interview invites, and critical tamper alerts.",
      },
    ],
    visualType: "traction-milestones",
    speakerNotes:
      "We are not presenting wireframes or unverified mockups. SabiProfile is a fully functional web platform with smart contracts deployed on Base L2, ten comprehensive automated test suites, and enterprise CRM modules running live today.",
  },

  // SLIDE 9: COMPETITIVE LANDSCAPE & MOATS
  {
    id: "slide-9",
    number: 9,
    category: "Competitive Advantage",
    tagline: "Defensible Moats by Design",
    headline: "Why Traditional Background Checkers and Web2 ATS Cannot Compete",
    subtitle:
      "Legacy players rely on dangerous centralized PDF databases that expose them to multi-million-dollar GDPR/NDPC legal penalties.",
    tableData: [
      {
        Feature: "Instant Ledger Verification",
        "Legacy ATS (Workday/Greenhouse)": "❌ Manual (Days)",
        "Background Checkers (Checkr/Sterling)": "❌ 3-14 Days",
        "Decentralized Wallets": "⚠️ Complex UX",
        SabiProfile: "✅ < 800ms On-Chain",
      },
      {
        Feature: "Zero Raw File Centralization",
        "Legacy ATS (Workday/Greenhouse)": "❌ High Breach Risk",
        "Background Checkers (Checkr/Sterling)": "❌ Centralized PDFs",
        "Decentralized Wallets": "✅ Self-Sovereign",
        SabiProfile: "✅ 100% User OAuth Cloud",
      },
      {
        Feature: "Zero-Hallucination AI Screening",
        "Legacy ATS (Workday/Greenhouse)": "❌ Keyword Matching",
        "Background Checkers (Checkr/Sterling)": "❌ None",
        "Decentralized Wallets": "❌ None",
        SabiProfile: "✅ Strict RAG + HMI Radar",
      },
      {
        Feature: "Multi-Sector Statutory Engine",
        "Legacy ATS (Workday/Greenhouse)": "❌ Jobs Only",
        "Background Checkers (Checkr/Sterling)": "❌ Criminal/Credit Only",
        "Decentralized Wallets": "❌ Identity Only",
        SabiProfile: "✅ Labour + Visas + Degrees",
      },
      {
        Feature: "NDPC & GDPR Sovereign Residency",
        "Legacy ATS (Workday/Greenhouse)": "❌ US Cloud Servers",
        "Background Checkers (Checkr/Sterling)": "❌ US Cloud Servers",
        "Decentralized Wallets": "⚠️ Public Chain Leak",
        SabiProfile: "✅ Regional Sovereign Nodes",
      },
    ],
    visualType: "competitive-matrix",
    speakerNotes:
      "Legacy background check providers take 3 to 14 days and store centralized user PDFs, which violates emerging sovereign data residency laws. SabiProfile is mathematically tamper-free, delivers sub-second results, and never retains custody of raw user documents.",
  },

  // SLIDE 10: GO-TO-MARKET & EXPANSION FLYWHEEL
  {
    id: "slide-10",
    number: 10,
    category: "Growth Strategy",
    tagline: "High-Velocity Tri-Sector Flywheel",
    headline: "Targeting High-Friction Mobility Corridors to Drive Viral Citizen Adoption",
    subtitle:
      "Every candidate who creates a vault for a student visa or embassy attestation retains that vault forever to apply for global remote jobs.",
    points: [
      {
        title: "Phase 1: Consular & Study Abroad Corridors (Q1 - Q2 2027)",
        description:
          "Partner with 50+ study abroad agencies, visa consultants, and immigration lawyers in Nigeria, Ghana, and Kenya processing UK, EU, and Canadian visas.",
        tag: "Infiltration",
      },
      {
        title: "Phase 2: Global Tech Talent & Remote Hiring (Q3 - Q4 2027)",
        description:
          "Deploy Developer API Keys to multinational outsourcing hubs, fintechs, and tech startups seeking fraud-proof engineering qualification attestation.",
        tag: "Expansion",
      },
      {
        title: "Phase 3: Sovereign Attestation Consortia (2028+)",
        description:
          "Onboard university registrar consortia and national identity management commissions directly onto our sovereign regional node network.",
        tag: "Institutional Scale",
      },
    ],
    visualType: "growth-flywheel",
    speakerNotes:
      "Our go-to-market strategy begins in the highest-friction sector: international visas and study abroad. Once a citizen's bank statement and university degree are hashed and verified, that citizen uses their SabiProfile vault forever to apply for global remote work.",
  },

  // SLIDE 11: LEADERSHIP TEAM & EXECUTION DNA
  {
    id: "slide-11",
    number: 11,
    category: "Leadership Team",
    tagline: "World-Class Execution & Domain Mastery",
    headline: "Experienced Builders in Sovereign Architecture, Global Mobility, and HR Compliance",
    subtitle:
      "Combining deep cryptographic systems engineering with decade-long cross-border travel, consular, and enterprise HR expertise.",
    points: [
      {
        title: "Uyouko Nathaniel Ekpo",
        description:
          "Founder & CEO. Distributed systems engineer, sovereign data architect, and cryptographic protocol designer. Architected SabiProfile's zero-knowledge storage invariants, Base L2 smart contracts, and multi-agent AI pipeline.",
        tag: "Founder & CEO",
      },
      {
        title: "Bernis DOUSSOH",
        description:
          "Co-Founder & Head of Global Mobility & HR. Renowned travel/tourism expert, HR specialist, and international relocation compliance veteran with extensive operational experience across international consular regulations and statutory mobility.",
        tag: "Co-Founder & Global Mobility / HR",
      },
    ],
    visualType: "team-leadership",
    speakerNotes:
      "Our leadership team combines deep technical capability with domain mastery. Uyouko architected our zero-storage cryptographic infrastructure and smart contracts, while Bernis brings extensive practical experience in global travel, immigration logistics, and enterprise HR operations.",
  },

  // SLIDE 12: THE ASK & CAPITAL ALLOCATION
  {
    id: "slide-12",
    number: 12,
    category: "Investment Opportunity",
    tagline: "Seed Financing Opportunity",
    headline: "Raising $1.5M Seed to Scale Sovereign Nodes and Dominate Cross-Border Verification",
    subtitle:
      "18 months of fully-funded operational runway to expand node infrastructure, onboard 150+ institutional partners, and achieve $1.2M ARR.",
    keyMetrics: [
      { label: "Round Target", value: "$1.5M", detail: "Seed Round (SAFE / Equity)" },
      { label: "Target Runway", value: "18 Months", detail: "Cashflow self-sustaining by Month 16" },
      { label: "Target ARR", value: "$1.2M", detail: "18-month projected ARR run-rate" },
      { label: "Active Vaults Goal", value: "50,000+", detail: "Verified citizen identity vaults" },
    ],
    points: [
      {
        title: "45% Engineering & Sovereign Nodes ($675k)",
        description: "Deploy regional PostgreSQL nodes across West Africa and Europe; audit smart contracts on Base/Polygon mainnet.",
      },
      {
        title: "30% Enterprise & Consular GTM ($450k)",
        description: "Onboard 150+ immigration agencies, 40+ universities, and 200+ enterprise employers across the Nigeria-UK/EU corridor.",
      },
      {
        title: "15% Regulatory & Compliance ($225k)",
        description: "NDPC data processor certifications, GDPR compliance audits, and legal partner network expansion.",
      },
      {
        title: "10% Security Audits & Operations ($150k)",
        description: "Formal third-party smart contract audits and 24/7 sovereign node security telemetry monitoring.",
      },
    ],
    visualType: "investment-ask",
    speakerNotes:
      "We are raising 1.5 million dollars in Seed financing. This capital gives us 18 months of runway to expand our sovereign node network, secure our regulatory moats across the West Africa-UK corridor, and scale to 50,000 active verified vaults and 1.2 million dollars in ARR. Thank you.",
  },
];
