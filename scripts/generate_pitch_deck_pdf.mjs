import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePitchDeckPdf() {
  const rootDir = path.resolve(__dirname, "..");
  const inputPdfPath = path.join(rootDir, "SabiProfile pitch.pdf");
  const outputPublicPath = path.join(rootDir, "public", "SabiProfile_Pitch_Deck.pdf");

  if (!fs.existsSync(inputPdfPath)) {
    console.error("Input PDF not found at:", inputPdfPath);
    return;
  }

  console.log("Loading SabiProfile pitch.pdf...");
  const existingPdfBytes = fs.readFileSync(inputPdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Exact Canva background sage color (#EFF0EA)
  const bgSage = rgb(0.9373, 0.9412, 0.9176);
  // Dark teal heading color (#285C56)
  const textDarkTeal = rgb(0.1568, 0.3607, 0.3372);
  // Secondary teal (#377272)
  const textMedTeal = rgb(0.2157, 0.4471, 0.4471);
  // Body dark slate (#2D5550)
  const textBody = rgb(0.1765, 0.3333, 0.3137);
  // Deep cypress for card bottoms (#193E39)
  const bgCypress = rgb(0.098, 0.243, 0.224);
  const textMint = rgb(0.435, 0.902, 0.741);
  const textWhite = rgb(1, 1, 1);

  const pages = pdfDoc.getPages();
  console.log(`Processing ${pages.length} pages...`);

  // Universal Header replacement
  const replaceHeader = (page) => {
    // Top-left: cover "Borcelle Company" exactly next to logo mark
    page.drawRectangle({
      x: 120,
      y: 680,
      width: 320,
      height: 60,
      color: bgSage,
    });
    page.drawText("SabiProfile", {
      x: 130,
      y: 708,
      size: 22,
      font: fontBold,
      color: textDarkTeal,
    });

    // Top-right: cover date
    page.drawRectangle({
      x: 1160,
      y: 680,
      width: 260,
      height: 60,
      color: bgSage,
    });
    page.drawText("October 2026", {
      x: 1240,
      y: 708,
      size: 16,
      font: fontRegular,
      color: textMedTeal,
    });
  };

  // Universal Footer replacement
  const replaceFooter = (page) => {
    page.drawRectangle({
      x: 50,
      y: 35,
      width: 1340,
      height: 95,
      color: bgSage,
    });
    page.drawText("Presented by: Uyouko Nathaniel Ekpo & Bernis DOUSSOH", {
      x: 80,
      y: 85,
      size: 14,
      font: fontBold,
      color: textDarkTeal,
    });
    page.drawText("October 2026", {
      x: 650,
      y: 85,
      size: 14,
      font: fontRegular,
      color: textMedTeal,
    });
    page.drawText("www.sabiprofile.com", {
      x: 1120,
      y: 85,
      size: 14,
      font: fontBold,
      color: textDarkTeal,
    });
  };

  // PAGE 1: COVER
  if (pages[0]) {
    const p1 = pages[0];
    replaceHeader(p1);
    replaceFooter(p1);

    // Cover old pill
    p1.drawRectangle({
      x: 780,
      y: 220,
      width: 600,
      height: 105,
      color: bgSage,
    });
    p1.drawRectangle({
      x: 810,
      y: 242,
      width: 480,
      height: 55,
      borderColor: textDarkTeal,
      borderWidth: 1.5,
      color: bgSage,
    });
    p1.drawText("Business Presentation • Seed Round 2026", {
      x: 840,
      y: 264,
      size: 18,
      font: fontBold,
      color: textDarkTeal,
    });
  }

  // PAGE 2: LIST OF CONTENTS
  if (pages[1]) {
    const p2 = pages[1];
    replaceHeader(p2);

    p2.drawRectangle({
      x: 1030,
      y: 90,
      width: 360,
      height: 640,
      color: bgSage,
    });

    const contents = [
      "Who We Are? (Introduction)",
      "Problem Statement",
      "Our Innovative Solutions",
      "Discover Our Services",
      "Size of Market (TAM/SAM)",
      "Direct & Indirect Competitors",
      "Key Competitive Advantages",
      "Traction, Milestones & Team",
    ];

    let y = 628;
    contents.forEach((item) => {
      p2.drawText(item, {
        x: 1045,
        y,
        size: 17,
        font: fontBold,
        color: textDarkTeal,
      });
      y -= 62;
    });
  }

  // PAGE 3: INTRODUCTION
  if (pages[2]) {
    const p3 = pages[2];
    replaceHeader(p3);

    p3.drawRectangle({
      x: 80,
      y: 90,
      width: 600,
      height: 530,
      color: bgSage,
    });

    p3.drawText(
      "SabiProfile fundamentally transforms how cross-border\nidentity and qualifications are verified.\n\nTraditional systems rely on static PDFs, forged paperwork,\nand high-friction manual legalization channels.\n\nSabiProfile shifts data sovereignty back to individuals and\nsovereign nations by replacing static documents with\nprogrammable, tamper-proof, scoped cryptographic API keys\nevaluated by multi-agent AI screening pipelines verified\nagainst an immutable Base L2 blockchain ledger.",
      {
        x: 95,
        y: 440,
        size: 16,
        font: fontRegular,
        color: textBody,
        lineHeight: 26,
      }
    );
  }

  // PAGE 4: PROBLEM STATEMENT
  if (pages[3]) {
    const p4 = pages[3];
    replaceHeader(p4);

    p4.drawRectangle({
      x: 1060,
      y: 500,
      width: 330,
      height: 90,
      color: bgSage,
    });
    p4.drawText("The multi-billion dollar fraud crisis\nin cross-border mobility.", {
      x: 1070,
      y: 550,
      size: 14,
      font: fontRegular,
      color: textMedTeal,
      lineHeight: 20,
    });

    // Problem 01 text
    p4.drawRectangle({
      x: 640,
      y: 330,
      width: 720,
      height: 130,
      color: bgSage,
    });
    p4.drawText(
      "40% of consular and university admissions time is lost manually\nverifying bank statements, apostilles, and transcripts. 78% of enterprise\nresumes contain false claims, creating 3-6 month visa backlogs.",
      {
        x: 650,
        y: 395,
        size: 15,
        font: fontRegular,
        color: textBody,
        lineHeight: 24,
      }
    );

    // Problem 02 text
    p4.drawRectangle({
      x: 640,
      y: 170,
      width: 720,
      height: 130,
      color: bgSage,
    });
    p4.drawText(
      "Centralizing raw citizen identity documents on corporate servers violates\nNDPC (Nigeria) and GDPR (Europe), exposing institutions to\nmulti-million dollar data breach liabilities.",
      {
        x: 650,
        y: 235,
        size: 15,
        font: fontRegular,
        color: textBody,
        lineHeight: 24,
      }
    );
  }

  // PAGE 5: OUR INNOVATIVE SOLUTIONS
  if (pages[4]) {
    const p5 = pages[4];
    replaceHeader(p5);

    p5.drawRectangle({
      x: 80,
      y: 450,
      width: 500,
      height: 120,
      color: bgSage,
    });
    p5.drawText(
      "Patented three-tier sovereign architecture delivering instant\nmathematical verification with zero raw file centralization.",
      {
        x: 85,
        y: 515,
        size: 15,
        font: fontRegular,
        color: textMedTeal,
        lineHeight: 22,
      }
    );

    // Solution 01
    p5.drawRectangle({
      x: 90,
      y: 170,
      width: 340,
      height: 150,
      color: bgSage,
    });
    p5.drawText(
      "Zero Raw Storage:\nFiles remain in user Google Drive/Dropbox;\nSabiProfile stores 0 bytes of raw PDFs.",
      {
        x: 110,
        y: 255,
        size: 14,
        font: fontRegular,
        color: textBody,
        lineHeight: 22,
      }
    );

    // Solution 02
    p5.drawRectangle({
      x: 530,
      y: 170,
      width: 340,
      height: 150,
      color: bgSage,
    });
    p5.drawText(
      "Sovereign Regional Nodes:\nCandidate JSON partitioned locally to satisfy\nstrict regional residency (NDPC, GDPR).",
      {
        x: 550,
        y: 255,
        size: 14,
        font: fontRegular,
        color: textBody,
        lineHeight: 22,
      }
    );

    // Solution 03
    p5.drawRectangle({
      x: 970,
      y: 170,
      width: 340,
      height: 150,
      color: bgSage,
    });
    p5.drawText(
      "Immutable Base L2 Verification:\nSHA-256 hashes anchored on-chain for\nsub-800ms tamper detection.",
      {
        x: 990,
        y: 255,
        size: 14,
        font: fontRegular,
        color: textBody,
        lineHeight: 22,
      }
    );
  }

  // PAGE 6: DISCOVER OUR SERVICES
  if (pages[5]) {
    const p6 = pages[5];
    replaceHeader(p6);

    p6.drawRectangle({
      x: 80,
      y: 120,
      width: 500,
      height: 110,
      color: bgSage,
    });
    p6.drawText(
      "Automated sovereign screening workflows across three\nfoundational global sectors.",
      {
        x: 85,
        y: 185,
        size: 15,
        font: fontRegular,
        color: textMedTeal,
        lineHeight: 22,
      }
    );

    // Service 01
    p6.drawRectangle({
      x: 90,
      y: 320,
      width: 340,
      height: 140,
      color: bgSage,
    });
    p6.drawText(
      "Immigration & Consular:\n28-day funds holding audit, visa candidate\ndiscovery, and instant embassy attestation.",
      {
        x: 110,
        y: 405,
        size: 14,
        font: fontRegular,
        color: textBody,
        lineHeight: 22,
      }
    );

    // Service 02
    p6.drawRectangle({
      x: 530,
      y: 240,
      width: 340,
      height: 140,
      color: bgSage,
    });
    p6.drawText(
      "Academic Credentials:\nUniversity transcript notarization, degree\napostilles, and international admissions.",
      {
        x: 550,
        y: 325,
        size: 14,
        font: fontRegular,
        color: textBody,
        lineHeight: 22,
      }
    );

    // Service 03
    p6.drawRectangle({
      x: 970,
      y: 170,
      width: 340,
      height: 140,
      color: bgSage,
    });
    p6.drawText(
      "Labour & Enterprise Screening:\nProgrammable scoped API keys, multi-agent AI\nrubric screening, and fraud-proof hiring.",
      {
        x: 990,
        y: 255,
        size: 14,
        font: fontRegular,
        color: textBody,
        lineHeight: 22,
      }
    );
  }

  // PAGE 7: SIZE OF MARKET
  if (pages[6]) {
    const p7 = pages[6];
    replaceHeader(p7);

    // 10% -> $54.2B
    p7.drawRectangle({
      x: 120,
      y: 430,
      width: 310,
      height: 150,
      color: bgSage,
    });
    p7.drawText("$54.2B", {
      x: 140,
      y: 485,
      size: 58,
      font: fontBold,
      color: textDarkTeal,
    });

    p7.drawRectangle({
      x: 470,
      y: 430,
      width: 260,
      height: 140,
      color: bgSage,
    });
    p7.drawText("Global Identity Verification\n& Mobility TAM by 2030\n(15.6% CAGR).", {
      x: 485,
      y: 520,
      size: 14,
      font: fontRegular,
      color: textBody,
      lineHeight: 20,
    });

    // 150K -> $14.8B
    p7.drawRectangle({
      x: 120,
      y: 150,
      width: 310,
      height: 150,
      color: bgSage,
    });
    p7.drawText("$14.8B", {
      x: 140,
      y: 205,
      size: 58,
      font: fontBold,
      color: textDarkTeal,
    });

    p7.drawRectangle({
      x: 470,
      y: 150,
      width: 260,
      height: 140,
      color: bgSage,
    });
    p7.drawText("African & Global South\noutbound mobility, visa attestation\n& GovTech SAM.", {
      x: 485,
      y: 240,
      size: 14,
      font: fontRegular,
      color: textBody,
      lineHeight: 20,
    });

    // Right paragraph
    p7.drawRectangle({
      x: 830,
      y: 90,
      width: 540,
      height: 320,
      color: bgSage,
    });
    p7.drawText(
      "Cross-border migration, international student enrollment,\nand remote skilled workforce hiring are growing at historic\nrates. Concurrently, strict data sovereignty regulations\n(NDPC, GDPR) are rendering centralized verification\nplatforms legally unviable.\n\nSabiProfile captures this market inflection point with an initial\n$1.2B beachhead across high-friction Commonwealth corridors.",
      {
        x: 850,
        y: 335,
        size: 15,
        font: fontRegular,
        color: textBody,
        lineHeight: 24,
      }
    );
  }

  // PAGE 8: DIRECT & INDIRECT COMPETITORS (Canva Template Slide 8)
  if (pages[7]) {
    const p8 = pages[7];
    replaceHeader(p8);

    // Top half: Indirect Competitor bullets
    p8.drawRectangle({
      x: 80,
      y: 420,
      width: 840,
      height: 260,
      color: bgSage,
    });

    p8.drawText(
      "• Legacy Verification Agencies (WES, VFS Global, HireRight):\n  Manual 4-8 week turnarounds, $200-$400/doc fees, zero cryptographic automation.\n\n• Cloud Storage & ATS (Workday, Google Drive, Taleo):\n  Passive file repositories without on-chain tamper detection or AI evaluation.\n\n• Generic KYC Providers (Onfido, Sumsub, Veriff):\n  Selfie/ID scanners; cannot audit transcripts, 28-day funds, or work credentials.",
      {
        x: 95,
        y: 620,
        size: 15,
        font: fontRegular,
        color: textBody,
        lineHeight: 22,
      }
    );

    // Bottom half: Direct Competitor bullets
    p8.drawRectangle({
      x: 520,
      y: 60,
      width: 860,
      height: 290,
      color: bgSage,
    });

    p8.drawText(
      "• Decentralized ID Protocols (Polygon ID, Civic, Privado ID):\n  Web3-centric, lacks consular workflows, non-crypto enterprise adoption, or cloud sync.\n\n• Centralized National Gov Portals (NIN/NIMC, DigiLocker):\n  Siloed domestic honeypots without cross-border attestation or private storage.\n\n• SabiProfile's Sovereign Moat:\n  Zero raw storage + Base L2 ledger + multi-agent discovery + 90:10 GovTech split.",
      {
        x: 540,
        y: 280,
        size: 15,
        font: fontRegular,
        color: textBody,
        lineHeight: 22,
      }
    );
  }

  // PAGE 9: KEY COMPETITIVE ADVANTAGES
  if (pages[8]) {
    const p9 = pages[8];
    replaceHeader(p9);

    p9.drawRectangle({
      x: 540,
      y: 160,
      width: 360,
      height: 120,
      color: bgSage,
    });
    p9.drawText(
      "Zero Raw Document Centralization:\nLeaves files in user cloud storage via OAuth;\neliminates corporate breach liability.",
      {
        x: 560,
        y: 235,
        size: 14,
        font: fontRegular,
        color: textBody,
        lineHeight: 22,
      }
    );

    p9.drawRectangle({
      x: 960,
      y: 160,
      width: 360,
      height: 120,
      color: bgSage,
    });
    p9.drawText(
      "Autonomous Multi-Agent AI Discovery:\nSub-800ms zero-hallucination evaluation with\ndynamic interview probes & Base L2 proofs.",
      {
        x: 980,
        y: 235,
        size: 14,
        font: fontRegular,
        color: textBody,
        lineHeight: 22,
      }
    );
  }

  // PAGE 10: TRACTION
  if (pages[9]) {
    const p10 = pages[9];
    replaceHeader(p10);

    p10.drawRectangle({
      x: 80,
      y: 140,
      width: 600,
      height: 440,
      color: bgSage,
    });
    p10.drawText(
      "SabiProfile has completed pre-production architecture with\nall core modules active and verified.\n\n• 88 Production Next.js 14 App Router routes active\n• Sub-800ms average cryptographic verification latency\n• 100% automated test suite pass rate across all modules\n• Base L2 Ethereum blockchain smart contracts deployed",
      {
        x: 100,
        y: 470,
        size: 16,
        font: fontRegular,
        color: textBody,
        lineHeight: 28,
      }
    );
  }

  // PAGE 11: ACCOMPLISHMENTS & ROADMAP
  if (pages[10]) {
    const p11 = pages[10];
    replaceHeader(p11);

    // Left date node
    p11.drawRectangle({
      x: 80,
      y: 580,
      width: 380,
      height: 110,
      color: bgSage,
    });
    p11.drawText("Phase 1: 2025–2026", {
      x: 140,
      y: 635,
      size: 22,
      font: fontBold,
      color: textDarkTeal,
    });

    p11.drawRectangle({
      x: 80,
      y: 80,
      width: 380,
      height: 510,
      color: bgSage,
    });
    p11.drawText(
      "Core Protocol & Ledger:\n\n• Patented three-tier storage model\n• Base L2 smart contract deployment\n• Multi-agent AI discovery engine\n• Scoped API key minting system",
      {
        x: 100,
        y: 510,
        size: 15,
        font: fontRegular,
        color: textBody,
        lineHeight: 24,
      }
    );

    // Center date node
    p11.drawRectangle({
      x: 530,
      y: 580,
      width: 380,
      height: 110,
      color: textDarkTeal,
    });
    p11.drawText("Phase 2: Q1–Q2 2026", {
      x: 600,
      y: 635,
      size: 22,
      font: fontBold,
      color: textWhite,
    });

    p11.drawRectangle({
      x: 530,
      y: 80,
      width: 380,
      height: 510,
      color: bgSage,
    });
    p11.drawText(
      "Consular & University Pilots:\n\n• 10 institutional partner pilots\n• UK & Canada immigration corridors\n• Dynamic 90:10 GovTech split engine\n• Transactional email dispatch system",
      {
        x: 560,
        y: 510,
        size: 15,
        font: fontRegular,
        color: textBody,
        lineHeight: 24,
      }
    );

    // Right date node
    p11.drawRectangle({
      x: 980,
      y: 580,
      width: 380,
      height: 110,
      color: bgSage,
    });
    p11.drawText("Phase 3: 2026+", {
      x: 1080,
      y: 635,
      size: 22,
      font: fontBold,
      color: textDarkTeal,
    });

    p11.drawRectangle({
      x: 980,
      y: 80,
      width: 380,
      height: 510,
      color: bgSage,
    });
    p11.drawText(
      "Global Sovereign Network:\n\n• 25+ regional sovereign database nodes\n• ECOWAS & EU diplomatic attestation\n• Mobile sovereign citizen wallet\n• Full B2B M2M API monetization",
      {
        x: 1010,
        y: 510,
        size: 15,
        font: fontRegular,
        color: textBody,
        lineHeight: 24,
      }
    );
  }

  // PAGE 12: USE OF FUNDS
  if (pages[11]) {
    const p12 = pages[11];
    replaceHeader(p12);

    p12.drawRectangle({
      x: 560,
      y: 290,
      width: 170,
      height: 85,
      color: bgSage,
    });
    p12.drawText("50% Engineering\n& Cryptography", {
      x: 580,
      y: 345,
      size: 14,
      font: fontBold,
      color: textDarkTeal,
    });

    p12.drawRectangle({
      x: 80,
      y: 370,
      width: 170,
      height: 85,
      color: bgSage,
    });
    p12.drawText("30% Regional\nSovereign Nodes", {
      x: 100,
      y: 425,
      size: 14,
      font: fontBold,
      color: textDarkTeal,
    });

    p12.drawRectangle({
      x: 210,
      y: 630,
      width: 180,
      height: 85,
      color: bgSage,
    });
    p12.drawText("20% Legal,\nNDPC/GDPR Audit", {
      x: 230,
      y: 685,
      size: 14,
      font: fontBold,
      color: textDarkTeal,
    });

    p12.drawRectangle({
      x: 740,
      y: 130,
      width: 600,
      height: 430,
      color: bgSage,
    });
    p12.drawText(
      "Our $1,500,000 USD Seed round provides 18 months of runway\nto deploy 25 sovereign regional nodes, scale university and\nconsular pilots, and secure NDPC & GDPR certifications.\n\nDynamic 90:10 GovTech Split Model:\n$0.90 Platform Treasury / $0.10 Sovereign Node Host creates\nan incentivized decentralized network with high-margin\nrecurring B2B enterprise SaaS revenue ($199 - $799/mo).",
      {
        x: 770,
        y: 460,
        size: 16,
        font: fontRegular,
        color: textBody,
        lineHeight: 26,
      }
    );
  }

  // PAGE 13: OUR TEAM
  if (pages[12]) {
    const p13 = pages[12];
    replaceHeader(p13);

    p13.drawRectangle({
      x: 80,
      y: 160,
      width: 400,
      height: 300,
      color: bgSage,
    });
    p13.drawText(
      "Our founding team combines deep software engineering\nexpertise with over a decade of cross-border travel,\nconsular regulations, and international human resource\nleadership.",
      {
        x: 85,
        y: 390,
        size: 15,
        font: fontRegular,
        color: textBody,
        lineHeight: 24,
      }
    );

    // Card 1: Uyouko Nathaniel Ekpo
    p13.drawRectangle({
      x: 520,
      y: 40,
      width: 280,
      height: 290,
      color: bgCypress,
    });
    p13.drawText("Uyouko Nathaniel", {
      x: 540,
      y: 275,
      size: 22,
      font: fontBold,
      color: textWhite,
    });
    p13.drawText("Ekpo", {
      x: 540,
      y: 248,
      size: 22,
      font: fontBold,
      color: textWhite,
    });
    p13.drawText("CEO & Founder", {
      x: 540,
      y: 210,
      size: 15,
      font: fontRegular,
      color: textMint,
    });
    p13.drawText("Full-Stack Software Architect\nDecentralized Identity Engineer", {
      x: 540,
      y: 180,
      size: 12,
      font: fontRegular,
      color: rgb(0.85, 0.85, 0.85),
      lineHeight: 18,
    });

    // Card 2: Bernis DOUSSOH
    p13.drawRectangle({
      x: 825,
      y: 40,
      width: 280,
      height: 290,
      color: bgCypress,
    });
    p13.drawText("Bernis", {
      x: 845,
      y: 275,
      size: 22,
      font: fontBold,
      color: textWhite,
    });
    p13.drawText("DOUSSOH", {
      x: 845,
      y: 248,
      size: 22,
      font: fontBold,
      color: textWhite,
    });
    p13.drawText("Head of Mobility & HR", {
      x: 845,
      y: 210,
      size: 15,
      font: fontRegular,
      color: textMint,
    });
    p13.drawText("Global Travel/Tourism Specialist\nSenior International HR Lead", {
      x: 845,
      y: 180,
      size: 12,
      font: fontRegular,
      color: rgb(0.85, 0.85, 0.85),
      lineHeight: 18,
    });

    // Card 3: Sovereign Advisory Board
    p13.drawRectangle({
      x: 1130,
      y: 40,
      width: 280,
      height: 290,
      color: bgCypress,
    });
    p13.drawText("Sovereign", {
      x: 1150,
      y: 275,
      size: 22,
      font: fontBold,
      color: textWhite,
    });
    p13.drawText("Advisory Board", {
      x: 1150,
      y: 248,
      size: 22,
      font: fontBold,
      color: textWhite,
    });
    p13.drawText("GovTech & Consular", {
      x: 1150,
      y: 210,
      size: 15,
      font: fontRegular,
      color: textMint,
    });
    p13.drawText("Diplomatic Attestation Experts\nRegional Node Governance", {
      x: 1150,
      y: 180,
      size: 12,
      font: fontRegular,
      color: rgb(0.85, 0.85, 0.85),
      lineHeight: 18,
    });
  }

  // PAGE 14: THANK YOU
  if (pages[13]) {
    const p14 = pages[13];
    replaceHeader(p14);
    replaceFooter(p14);

    p14.drawRectangle({
      x: 580,
      y: 270,
      width: 480,
      height: 190,
      color: bgSage,
    });
    p14.drawRectangle({
      x: 610,
      y: 290,
      width: 420,
      height: 150,
      borderColor: textDarkTeal,
      borderWidth: 1.5,
      color: bgSage,
    });

    p14.drawText("invest@sabiprofile.com", {
      x: 670,
      y: 380,
      size: 18,
      font: fontBold,
      color: textDarkTeal,
    });

    p14.drawText("www.sabiprofile.com", {
      x: 670,
      y: 335,
      size: 18,
      font: fontBold,
      color: textDarkTeal,
    });
  }

  const outputBytes = await pdfDoc.save();

  // Save to public folder so browser can download it
  fs.writeFileSync(outputPublicPath, outputBytes);
  console.log(`Saved updated pitch deck to ${outputPublicPath} (${outputBytes.length} bytes)`);

  // Also update SabiProfile pitch.pdf directly as requested by the user
  fs.writeFileSync(inputPdfPath, outputBytes);
  console.log(`Successfully updated ${inputPdfPath} directly on disk!`);
}

generatePitchDeckPdf().catch(console.error);
