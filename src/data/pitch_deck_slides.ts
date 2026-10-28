export interface PitchDeckSlide {
  id: string;
  number: number;
  category: string;
  tagline: string;
  headline: string;
  subtitle?: string;
  bodyText?: string;
  keyMetrics?: Array<{ label: string; value: string; detail?: string; icon?: string }>;
  points?: Array<{ title: string; description: string; tag?: string; icon?: string }>;
  directCompetitors?: Array<{ name: string; description: string }>;
  indirectCompetitors?: Array<{ name: string; description: string }>;
  advantages?: Array<{ title: string; description: string; tag?: string }>;
  timeline?: Array<{ phase: string; period: string; title: string; description: string }>;
  fundAllocation?: Array<{ category: string; percentage: number; amount: string; purpose: string }>;
  team?: Array<{ name: string; role: string; bio: string; linkedinUrl?: string; avatarUrl?: string }>;
  visualType:
    | "cover"
    | "contents"
    | "introduction"
    | "problem"
    | "solutions"
    | "services"
    | "market-size"
    | "competitors"
    | "advantages"
    | "traction"
    | "roadmap"
    | "funds"
    | "team"
    | "thank-you";
  speakerNotes: string;
}

export const PITCH_DECK_SLIDES: PitchDeckSlide[] = [
  // SLIDE 1: COVER
  {
    id: "slide-1",
    number: 1,
    category: "Sovereign Identity Protocol",
    tagline: "Seed Round Presentation",
    headline: "Startup",
    subtitle: "Pitch Deck",
    bodyText: "SabiProfile is the sovereign data infrastructure and decentralized identity platform replacing unverified paperwork with programmable, scoped cryptographic keys verified on Base L2.",
    keyMetrics: [
      { label: "Centralized Files", value: "0 Bytes", detail: "Zero raw document retention", icon: "Database" },
      { label: "Verification Latency", value: "< 800ms", detail: "Real-time on-chain hash check", icon: "Zap" },
      { label: "GovTech Split", value: "90 : 10", detail: "Treasury / Host Node revenue sharing", icon: "Coins" },
      { label: "Active Network", value: "Base L2", detail: "Ethereum Layer-2 Security", icon: "ShieldCheck" },
    ],
    visualType: "cover",
    speakerNotes:
      "Welcome. SabiProfile replaces the world's most vulnerable asset—unverified paper resumes and centralized PDF storage—with programmable, tamper-proof scoped keys and zero-hallucination multi-agent screening.",
  },

  // SLIDE 2: LIST OF CONTENTS
  {
    id: "slide-2",
    number: 2,
    category: "Presentation Overview",
    tagline: "Table of Contents",
    headline: "List of Contents",
    points: [
      { title: "Who We Are?", description: "Introduction to sovereign data infrastructure and decentralized identity." },
      { title: "Problem Statement", description: "The multi-billion dollar fraud crisis in global cross-border mobility." },
      { title: "Our Innovative Solutions", description: "Zero raw storage, regional sovereign nodes, and immutable ledger." },
      { title: "Discover Our Services", description: "Cross-border screening across Immigration, Higher Education, and Labour." },
      { title: "Size of Market", description: "TAM, SAM, SOM analysis across global mobility and identity verification." },
      { title: "Direct & Indirect Competitors", description: "Competitive landscape, legacy agencies, and SabiProfile's sovereign moat." },
      { title: "Key Competitive Advantages", description: "Zero document centralization and sub-800ms multi-agent AI discovery." },
      { title: "Traction, Milestones & Team", description: "Production platform metrics, execution roadmap, fund allocation, and leadership." },
    ],
    visualType: "contents",
    speakerNotes:
      "Our deck covers the 8 core dimensions of the SabiProfile business: from our three-tier architecture to market sizing, competitive differentiation, traction, and team execution.",
  },

  // SLIDE 3: INTRODUCTION
  {
    id: "slide-3",
    number: 3,
    category: "Who We Are",
    tagline: "Sovereign Cross-Border Mobility",
    headline: "Introduction",
    subtitle: "A Mathematical Single Source of Truth for Global Credentials",
    bodyText:
      "SabiProfile fundamentally transforms how cross-border identity and qualifications are verified. Traditional ecosystems rely on static PDFs, forged paper certificates, and fragmented manual legalization channels. SabiProfile shifts data sovereignty directly to individuals and sovereign governments by replacing static documents with programmable, tamper-proof, scoped cryptographic API keys evaluated by multi-agent AI screening pipelines verified against an immutable blockchain ledger.",
    points: [
      {
        title: "Zero Centralized Liability",
        description: "User files remain exclusively in their private cloud storage (Google Drive, Dropbox). SabiProfile never retains raw user PDFs.",
        icon: "Lock",
      },
      {
        title: "Multi-Sector Sovereign Attestation",
        description: "Built from day one to serve Immigration & Consulates, Higher Education Admissions, and Enterprise Labour Screening.",
        icon: "Globe",
      },
    ],
    visualType: "introduction",
    speakerNotes:
      "SabiProfile is not a simple HR tool; it is a sovereign infrastructure layer that unifies cross-border visa screening, university credential notarization, and enterprise talent verification.",
  },

  // SLIDE 4: PROBLEM STATEMENT
  {
    id: "slide-4",
    number: 4,
    category: "Market Problem",
    tagline: "The Multi-Billion Dollar Verification Bottleneck",
    headline: "Problem Statement",
    subtitle: "Global credential verification is slow, fraud-ridden, and violates privacy.",
    points: [
      {
        title: "Problem 01: Rampant Forgery & High-Friction Legalization",
        description:
          "40% of consular and university admissions processing time is wasted manually verifying bank statements, apostilles, and degree certificates. 78% of enterprise resumes contain inflated or fraudulent qualifications, causing 3-6 month visa backlogs and expensive bad hires.",
        tag: "Fraud Crisis",
        icon: "ShieldAlert",
      },
      {
        title: "Problem 02: Centralized Identity Honeypots & Compliance Penalties",
        description:
          "Traditional verification agencies and ATS vendors store gigabytes of raw passports, bank statements, and national IDs on centralized servers. This directly violates modern privacy laws (NDPC in Nigeria, GDPR in Europe), exposing institutions to crippling multi-million dollar data breach liabilities.",
        tag: "Data Breach Risk",
        icon: "Database",
      },
    ],
    visualType: "problem",
    speakerNotes:
      "The global economy is stuck between two bad options: agonizing manual verification delays or centralized document honeypots that create enormous compliance and security risks.",
  },

  // SLIDE 5: OUR INNOVATIVE SOLUTIONS
  {
    id: "slide-5",
    number: 5,
    category: "Architecture & Solution",
    tagline: "Three-Tier Sovereign Infrastructure",
    headline: "Our Innovative Solutions",
    subtitle: "Mathematical verification without storing a single byte of citizen documents.",
    bodyText:
      "We replace fragile paper documents and centralized servers with a patented three-tier sovereign architecture that guarantees complete data privacy and sub-800ms verification.",
    points: [
      {
        title: "Solution 01",
        description:
          "Zero Raw Document Centralization: User documents remain in their private Google Drive or Dropbox via OAuth. SabiProfile servers never retain raw PDFs or scans.",
        tag: "Privacy First",
        icon: "Cloud",
      },
      {
        title: "Solution 02",
        description:
          "Sovereign Regional Node Isolation: Structured candidate claims are hosted on regional sovereign database nodes, fully satisfying local data residency mandates (NDPC, GDPR).",
        tag: "Residency Compliant",
        icon: "Server",
      },
      {
        title: "Solution 03",
        description:
          "Immutable Blockchain Verification: Every attested claim and document has a SHA-256 hash anchored to Base L2, enabling instant on-chain mathematical tamper detection.",
        tag: "Base L2 Verified",
        icon: "ShieldCheck",
      },
    ],
    visualType: "solutions",
    speakerNotes:
      "Our three-tier architecture separates physical file storage, sovereign JSON metadata, and cryptographic blockchain proofs, creating an impenetrable moat against data breaches.",
  },

  // SLIDE 6: DISCOVER OUR SERVICES
  {
    id: "slide-6",
    number: 6,
    category: "Product Verticals",
    tagline: "Unified Multi-Sector Platform",
    headline: "Discover Our Services",
    subtitle: "Delivering automated, tamper-proof screening across three mission-critical sectors.",
    bodyText:
      "SabiProfile's unified engine powers tailored workflows for immigration authorities, academic registrars, and enterprise human resource departments.",
    points: [
      {
        title: "Service 01",
        description:
          "Sovereign Immigration & Consular Screening: Automated 28-day liquid funds holding audits, Tier-2 legal apostille attestation, and real-time visa candidate discovery with zero paperwork.",
        tag: "Immigration & Visas",
        icon: "Plane",
      },
      {
        title: "Service 02",
        description:
          "Tamper-Proof Academic Credentials: Instant university registrar transcript notarization, degree authenticity validation, and automated international student credential equivalency.",
        tag: "Higher Education",
        icon: "GraduationCap",
      },
      {
        title: "Service 03",
        description:
          "Labour & Enterprise Talent Evaluation: Programmable scoped candidate API keys, AI-driven technical rubric matching, and automated candidate interview probe generation.",
        tag: "Enterprise Talent",
        icon: "Briefcase",
      },
    ],
    visualType: "services",
    speakerNotes:
      "One sovereign protocol solves the verification bottleneck for embassies issuing visas, universities admitting foreign scholars, and Fortune 500 enterprises hiring global talent.",
  },

  // SLIDE 7: SIZE OF MARKET
  {
    id: "slide-7",
    number: 7,
    category: "Market Opportunity",
    tagline: "Massive Global Expansion",
    headline: "Size of Market",
    subtitle: "Addressing a rapidly accelerating global compliance and mobility market.",
    bodyText:
      "Cross-border migration, international student enrollment, and remote global workforce expansion are accelerating exponentially. Simultaneously, strict data sovereignty regulations (NDPC in Africa, GDPR in the EU, DPDP in India) are rendering legacy centralized screening platforms legally obsolete. SabiProfile captures this inflection point.",
    keyMetrics: [
      {
        label: "Total Addressable Market",
        value: "$54.2B",
        detail: "Global Identity Verification & Cross-Border Mobility Market by 2030 (15.6% CAGR).",
        icon: "Globe",
      },
      {
        label: "Serviceable Addressable Market",
        value: "$14.8B",
        detail: "African, Commonwealth & Global South outbound mobility, visa attestation & GovTech screening.",
        icon: "PieChart",
      },
    ],
    points: [
      {
        title: "Serviceable Obtainable Market (SOM)",
        description: "$1.2B focused on UK/Canada/EU student and skilled-worker migration corridors originating from West Africa and emerging markets.",
        icon: "TrendingUp",
      },
    ],
    visualType: "market-size",
    speakerNotes:
      "With over $54B in market size, our initial beachhead focuses on high-friction African and Commonwealth migration routes where credential fraud is rampant and compliance costs are highest.",
  },

  // SLIDE 8: DIRECT & INDIRECT COMPETITORS (Canva Template Slide 8)
  {
    id: "slide-8",
    number: 8,
    category: "Competitive Analysis",
    tagline: "Market Positioning & Unfair Advantages",
    headline: "Competitors",
    subtitle: "How SabiProfile outperforms both legacy agencies and Web3 protocols.",
    indirectCompetitors: [
      {
        name: "Legacy Verification Agencies (WES, VFS Global, HireRight)",
        description: "Manual, paper-heavy 4–8 week turnaround times; exorbitant fees ($200–$400 per transcript/visa document); zero real-time cryptographic automation.",
      },
      {
        name: "Cloud Storage & Enterprise ATS (Workday, Google Drive, Taleo)",
        description: "Passive document silos that centralize raw PDFs; completely lack tamper-detection hashes, blockchain audit trails, or autonomous candidate evaluation.",
      },
      {
        name: "Generic KYC Providers (Onfido, Sumsub, Veriff)",
        description: "Surface-level passport selfie scanners; cannot verify multi-year university transcripts, 28-day bank balance holding rules, or professional credentials.",
      },
    ],
    directCompetitors: [
      {
        name: "Decentralized ID Protocols (Polygon ID, Civic, Privado ID)",
        description: "Crypto-centric and complex for non-technical users; lack consular workflow integrations, institutional compliance tooling, and private cloud OAuth bridges.",
      },
      {
        name: "Centralized Government Portals (NIN/NIMC, DigiLocker India)",
        description: "National data honeypots with zero cross-border interoperability; highly vulnerable to domestic surveillance and rejected by foreign consular systems.",
      },
      {
        name: "SabiProfile's Sovereign Moat",
        description: "Zero raw storage + Base L2 cryptographic ledger + multi-agent LLM discovery + built-in dynamic 90:10 GovTech revenue split for sovereign node operators.",
      },
    ],
    visualType: "competitors",
    speakerNotes:
      "Legacy players are too slow and centralized; Web3 protocols are too complicated and disconnected from consular and educational realities. SabiProfile bridges this chasm.",
  },

  // SLIDE 9: KEY COMPETITIVE ADVANTAGES
  {
    id: "slide-9",
    number: 9,
    category: "Unfair Advantage",
    tagline: "Defensible Architectural Moats",
    headline: "Key Competitive Advantages",
    subtitle: "Built on privacy preservation, autonomous intelligence, and blockchain truth.",
    advantages: [
      {
        title: "Advantage 01: Zero Raw Document Centralization",
        description:
          "By leaving physical files inside the applicant's private cloud drive via OAuth and verifying only cryptographic hashes, SabiProfile eliminates institutional data breach liability, slashing cloud storage overhead to near zero while maintaining 100% NDPC and GDPR compliance.",
        tag: "Zero Breach Risk",
      },
      {
        title: "Advantage 02: Autonomous Multi-Agent AI Discovery",
        description:
          "Our strict RAG evaluator screens verified structured claims against institutional rubrics with zero hallucination. It generates tailored interview probes and on-chain tamper verification in under 800 milliseconds, replacing weeks of human review with instant certainty.",
        tag: "Sub-800ms Speed",
      },
    ],
    visualType: "advantages",
    speakerNotes:
      "Our zero raw document storage and autonomous multi-agent evaluator give us an insurmountable cost and compliance advantage over legacy verification incumbents.",
  },

  // SLIDE 10: TRACTION
  {
    id: "slide-10",
    number: 10,
    category: "Platform Execution",
    tagline: "Pre-Production Architecture Complete",
    headline: "Traction",
    subtitle: "Fully architected pre-production platform with verified operational metrics.",
    bodyText:
      "SabiProfile has transitioned from concept to an enterprise-grade sovereign infrastructure platform. All core modules are live in our pre-production environment with automated end-to-end test verification.",
    keyMetrics: [
      { label: "Production Routes", value: "88 Routes", detail: "Next.js 14 App Router API & Views", icon: "Layers" },
      { label: "Verification Latency", value: "< 800ms", detail: "SHA-256 On-Chain Ledger Lookup", icon: "Zap" },
      { label: "Automated Tests", value: "100%", detail: "Pass rate across auth, keys, and M2M", icon: "CheckCircle2" },
      { label: "Smart Contracts", value: "Base L2", detail: "EVM-compatible registry live", icon: "ShieldCheck" },
    ],
    visualType: "traction",
    speakerNotes:
      "We are not an idea-stage pitch; we have built 88 production routes, verified Base L2 smart contract anchoring, and completed end-to-end integration across all three verticals.",
  },

  // SLIDE 11: ACCOMPLISHMENTS & ROADMAP
  {
    id: "slide-11",
    number: 11,
    category: "Execution Plan",
    tagline: "Phase-Gated Growth Strategy",
    headline: "Accomplishments & Roadmap",
    subtitle: "Clear, disciplined execution from core protocol to global sovereign expansion.",
    timeline: [
      {
        phase: "Phase 1",
        period: "2025 – 2026",
        title: "Core Protocol & Ledger",
        description: "Completed three-tier storage model, Base L2 cryptographic anchoring, multi-agent AI discovery engine, and scoped API key minting system.",
      },
      {
        phase: "Phase 2",
        period: "Q1 – Q2 2026",
        title: "Consular & University Pilots",
        description: "Deploying 10 institutional pilots across West Africa, UK, and Canadian visa/education corridors; launch of dynamic 90:10 GovTech revenue split.",
      },
      {
        phase: "Phase 3",
        period: "2026+",
        title: "Global Sovereign Network",
        description: "Expansion to 25+ sovereign regional nodes across ECOWAS and the EU; cross-border diplomatic attestation API and mobile sovereign citizen wallet.",
      },
    ],
    visualType: "roadmap",
    speakerNotes:
      "Our roadmap executes in disciplined phases: having built the core protocol, we are now launching institutional pilots before scaling to a global sovereign network.",
  },

  // SLIDE 12: USE OF FUNDS
  {
    id: "slide-12",
    number: 12,
    category: "Financial Strategy",
    tagline: "$1,500,000 USD Seed Round",
    headline: "Use of Funds",
    subtitle: "Disciplined capital allocation focused on engineering, pilots, and compliance.",
    fundAllocation: [
      {
        category: "Engineering & Cryptography",
        percentage: 50,
        amount: "$750,000",
        purpose: "Base L2 contract hardening, multi-agent LLM pipeline scaling, and sovereign node zero-knowledge enhancements.",
      },
      {
        category: "Regional Sovereign Nodes & Pilots",
        percentage: 30,
        amount: "$450,000",
        purpose: "Deploying regional database nodes across West Africa and the EU; expanding consular and university registrar pilots.",
      },
      {
        category: "Legal, Compliance & Security",
        percentage: 20,
        amount: "$300,000",
        purpose: "NDPC & GDPR sovereign regulatory certifications, formal smart contract audits, and diplomatic stakeholder partnerships.",
      },
    ],
    points: [
      {
        title: "Dynamic 90:10 GovTech Revenue Model",
        description: "Configurable treasury split ($0.90 Platform / $0.10 Regional Host) incentivizes sovereign node hosts while delivering high-margin recurring SaaS revenue.",
        icon: "Coins",
      },
    ],
    visualType: "funds",
    speakerNotes:
      "Our $1.5M Seed round provides 18 months of runway to secure our first 25 institutional partners, scale our sovereign regional nodes, and achieve cash-flow positive unit economics.",
  },

  // SLIDE 13: OUR TEAM
  {
    id: "slide-13",
    number: 13,
    category: "Executive Leadership",
    tagline: "Domain Expertise Across Tech & Global Mobility",
    headline: "Our Team",
    subtitle: "Proven leadership in software architecture, international mobility, and compliance.",
    bodyText:
      "Our founding team combines deep software engineering expertise with decade-long experience in cross-border travel, consular regulations, and international human resources.",
    team: [
      {
        name: "Uyouko Nathaniel Ekpo",
        role: "Founder & CEO",
        bio: "Full-stack software architect & decentralized systems engineer. Creator of SabiProfile's zero raw document storage and cryptographic scoped key infrastructure.",
        linkedinUrl: "https://www.linkedin.com/in/uyouko-nathaniel-ekpo-111b69396/",
      },
      {
        name: "Bernis DOUSSOH",
        role: "Co-Founder / Head of Global Mobility & HR",
        bio: "Senior travel, tourism, and global mobility executive with over 10 years of cross-border immigration, consular attestation, and international human resource leadership.",
        linkedinUrl: "https://www.linkedin.com/in/bernis-doussoh-516b5498/",
      },
    ],
    visualType: "team",
    speakerNotes:
      "Led by Uyouko in software architecture and Bernis in global mobility and consular operations, our team has the exact blend of technical and regulatory mastery required to win this market.",
  },

  // SLIDE 14: THANK YOU
  {
    id: "slide-14",
    number: 14,
    category: "Next Steps",
    tagline: "Join Us in Building the Future of Sovereign Identity",
    headline: "Thank You",
    subtitle: "Partner with SabiProfile to eradicate credential fraud worldwide.",
    points: [
      {
        title: "Direct Investor Relations",
        description: "invest@sabiprofile.com",
        icon: "Mail",
      },
      {
        title: "Official Platform Portal",
        description: "www.sabiprofile.com",
        icon: "Globe",
      },
    ],
    visualType: "thank-you",
    speakerNotes:
      "Thank you for your time and vision. We invite you to join us in building the mathematical single source of truth for global mobility and identity. We are open for questions.",
  },
];
