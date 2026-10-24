import { ConsularVisaRoute } from "@/types/consular";

export const CONSULAR_ROUTES_CATALOG: ConsularVisaRoute[] = [
  // --- 1. UNITED KINGDOM (UKVI) ---
  {
    id: "uk_skilled_worker",
    destinationCountry: "United Kingdom",
    streamName: "Skilled Worker Visa",
    category: "work",
    statutoryAuthority: "UK Visas and Immigration (UKVI) - Appendix Skilled Worker & Appendix Finance",
    officialPortalUrl: "https://www.gov.uk/skilled-worker-visa",
    financialRequirements: {
      minimumLiquidFundsTargetCurrency: 1270,
      targetCurrency: "GBP",
      holdingPeriodDays: 28,
      strictConsecutiveBalance: true,
      fundsDumpingThresholdPercent: 25,
      monthlyCostOfLivingEstimate: 1270,
    },
    mandatoryChecklist: [
      {
        category: "identification",
        documentType: "international_passport",
        title: "Valid International Passport",
        requirement: "Valid biometric passport with at least 1 blank page and minimum 6 months validity.",
        statutoryCitation: "UKVI Immigration Rules Part 1: Leave to enter or stay",
        validityMonths: 6,
      },
      {
        category: "finance",
        documentType: "bank_statement",
        title: "Proof of Maintenance Funds (£1,270 for 28 Consecutive Days)",
        requirement: "Bank balance must never drop below £1,270 for a consecutive 28-day period ending within 31 days of application, unless employer certifies maintenance on CoS.",
        statutoryCitation: "UKVI Appendix Finance FIN 5.1 & FIN 5.2",
      },
      {
        category: "language",
        documentType: "language_certificate",
        title: "English Language Proficiency (B1 CEFR or Higher)",
        requirement: "Pass approved SELT exam (IELTS for UKVI, PTE Home/Academic) at CEFR Level B1, or hold an Ecctis-verified degree taught in English.",
        statutoryCitation: "UKVI Appendix English Language EL 1.1",
        languageMinCefr: "B1",
      },
      {
        category: "legal",
        documentType: "tb_certificate_or_police_check",
        title: "Tuberculosis (TB) Test & Criminal Record Certificate",
        requirement: "TB screening certificate from IOM-approved clinic (if resident in Nigeria, Ghana, India, etc.) plus police clearance certificate.",
        statutoryCitation: "UKVI Appendix T (Tuberculosis Screening) & Immigration Rules Part 6A",
        requiresTier2Legalization: true,
      },
      {
        category: "experience",
        documentType: "employment_contract",
        title: "Certificate of Sponsorship (CoS) & Professional Tenure",
        requirement: "Valid CoS reference from licensed A-rated sponsor and verified evidence of previous career experience matching eligible SOC 2020 code.",
        statutoryCitation: "UKVI Appendix Skilled Worker SW 4.1",
        minYearsExperience: 2,
      },
    ],
  },
  {
    id: "uk_student",
    destinationCountry: "United Kingdom",
    streamName: "Student Visa (Higher Education)",
    category: "study",
    statutoryAuthority: "UK Visas and Immigration (UKVI) - Appendix Student & Appendix Finance",
    officialPortalUrl: "https://www.gov.uk/student-visa",
    financialRequirements: {
      minimumLiquidFundsTargetCurrency: 12006, // 9 months x £1,334 (Inner London)
      targetCurrency: "GBP",
      holdingPeriodDays: 28,
      strictConsecutiveBalance: true,
      fundsDumpingThresholdPercent: 20,
      monthlyCostOfLivingEstimate: 1334,
    },
    mandatoryChecklist: [
      {
        category: "identification",
        documentType: "international_passport",
        title: "Valid International Passport",
        requirement: "Valid passport with official MRZ zone.",
        statutoryCitation: "UKVI Student Rules ST 1.1",
        validityMonths: 6,
      },
      {
        category: "finance",
        documentType: "bank_statement",
        title: "Full Tuition + Living Costs (£9,207 - £12,006 for 28 Days)",
        requirement: "Living costs (£1,334/mo London or £1,023/mo outside) plus remaining tuition held consecutively for 28 days without dipping by £1.",
        statutoryCitation: "UKVI Appendix Finance FIN 6.1",
      },
      {
        category: "academics",
        documentType: "cas_and_degree",
        title: "Confirmation of Acceptance for Studies (CAS) & Degree Transcripts",
        requirement: "Official CAS letter from UK university and verified undergraduate transcripts/certificates listed on the CAS.",
        statutoryCitation: "UKVI Appendix Student ST 4.1",
        requiresTier2Legalization: true,
      },
      {
        category: "legal",
        documentType: "tb_certificate",
        title: "IOM Approved Tuberculosis Clearance",
        requirement: "Official medical certificate confirming negative active pulmonary tuberculosis.",
        statutoryCitation: "UKVI Appendix T",
      },
    ],
  },

  // --- 2. GERMANY (BAMF & Ausländerbehörde) ---
  {
    id: "de_chancenkarte",
    destinationCountry: "Germany",
    streamName: "Opportunity Card (Chancenkarte - AufenthG § 20a)",
    category: "work",
    statutoryAuthority: "Federal Ministry of the Interior / BAMF - Aufenthaltsgesetz § 20a",
    officialPortalUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/chancenkarte-job-search",
    financialRequirements: {
      minimumLiquidFundsTargetCurrency: 12324, // €1,027/mo x 12 months
      targetCurrency: "EUR",
      holdingPeriodDays: 90,
      strictConsecutiveBalance: false,
      fundsDumpingThresholdPercent: 25,
      monthlyCostOfLivingEstimate: 1027,
    },
    mandatoryChecklist: [
      {
        category: "identification",
        documentType: "international_passport",
        title: "Valid International Passport",
        requirement: "Biometric passport issued within past 10 years with at least 3 months validity beyond intended stay.",
        statutoryCitation: "AufenthG § 3 Passpflicht",
        validityMonths: 6,
      },
      {
        category: "finance",
        documentType: "blocked_account_or_funds",
        title: "Proof of Subsistence (€12,324 Blocked Account or Liquid Proof)",
        requirement: "Sperrkonto (blocked account) containing minimum €1,027 per month or liquid bank statement demonstrating €12,324+ independent solvency.",
        statutoryCitation: "AufenthG § 2 Abs. 3 & § 20a",
      },
      {
        category: "academics",
        documentType: "anabin_verified_degree",
        title: "University Degree with Anabin (H+) or ZAB Statement of Comparability",
        requirement: "Degree awarded by institution with 'H+' status on Anabin or individual ZAB comparability evaluation.",
        statutoryCitation: "AufenthG § 18 Abs. 3",
        requiresTier2Legalization: true,
      },
      {
        category: "language",
        documentType: "language_certificate",
        title: "German (A1/B1) or English (B2) Proficiency",
        requirement: "Goethe/Telc German certificate (A1 minimum for points, B1+ for points multiplier) or certified B2+ English.",
        statutoryCitation: "AufenthG § 20a Abs. 4",
        languageMinCefr: "A1",
      },
      {
        category: "experience",
        documentType: "work_experience_tenure",
        title: "Minimum 2 Years Professional Experience in Field of Study",
        requirement: "Documented employment history and signed reference letters detailing at least 24 months professional practice.",
        statutoryCitation: "Chancenkarte Points Scoring System",
        minYearsExperience: 2,
      },
    ],
  },
  {
    id: "de_eu_blue_card",
    destinationCountry: "Germany",
    streamName: "EU Blue Card (AufenthG § 18g)",
    category: "work",
    statutoryAuthority: "Ausländerbehörde / Federal Employment Agency",
    officialPortalUrl: "https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Migrathek/BlaueKarteEU/blauekarteeu-node.html",
    financialRequirements: {
      minimumLiquidFundsTargetCurrency: 3500,
      targetCurrency: "EUR",
      holdingPeriodDays: 30,
      strictConsecutiveBalance: false,
      fundsDumpingThresholdPercent: 30,
    },
    mandatoryChecklist: [
      {
        category: "identification",
        documentType: "international_passport",
        title: "Valid International Passport",
        requirement: "Valid biometric travel document.",
        statutoryCitation: "AufenthG § 3",
      },
      {
        category: "experience",
        documentType: "employment_contract",
        title: "Binding German Job Offer / Employment Contract",
        requirement: "Employment contract with minimum gross annual salary (€45,300 or €41,041.80 for STEM shortage professions).",
        statutoryCitation: "AufenthG § 18g Abs. 1",
      },
      {
        category: "academics",
        documentType: "degree_certificate",
        title: "Recognized Higher Education Degree",
        requirement: "German degree or comparable foreign tertiary degree.",
        statutoryCitation: "AufenthG § 18g",
        requiresTier2Legalization: true,
      },
    ],
  },

  // --- 3. ALBANIA (Border & Migration Directorate) ---
  {
    id: "al_unique_permit",
    destinationCountry: "Albania",
    streamName: "Unique Residence & Work Permit (Leje Unike)",
    category: "relocation",
    statutoryAuthority: "Ministry of Interior / State Police Directorate for Border and Migration - Law No. 79/2021",
    officialPortalUrl: "https://e-albania.al/eAlbaniaServices/UseService.aspx?service_code=14434",
    financialRequirements: {
      minimumLiquidFundsTargetCurrency: 3000,
      targetCurrency: "EUR",
      holdingPeriodDays: 30,
      strictConsecutiveBalance: false,
      fundsDumpingThresholdPercent: 30,
      monthlyCostOfLivingEstimate: 500,
    },
    mandatoryChecklist: [
      {
        category: "identification",
        documentType: "international_passport",
        title: "Valid International Passport",
        requirement: "Valid passport with validity exceeding intended stay by at least 3 months.",
        statutoryCitation: "Law No. 79/2021 On Foreigners, Article 33",
        validityMonths: 6,
      },
      {
        category: "legal",
        documentType: "police_character_certificate",
        title: "Police Character Clearance with Hague Apostille / Legalization",
        requirement: "Certificate of clean criminal record issued within last 6 months by country of origin, legalized or apostilled with certified Albanian translation.",
        statutoryCitation: "Law No. 79/2021, Article 34(c)",
        requiresTier2Legalization: true,
        requiresApostille: true,
        validityMonths: 6,
      },
      {
        category: "legal",
        documentType: "lease_agreement",
        title: "Proof of Accommodation / Notarized Residential Lease in Albania",
        requirement: "Notarized rental contract or host declaration in Albania registered with local municipal tax authorities.",
        statutoryCitation: "Law No. 79/2021, Article 34(d)",
        requiresTier2Legalization: true,
      },
      {
        category: "finance",
        documentType: "bank_statement",
        title: "Proof of Sufficient Living Funds (€3,000+)",
        requirement: "Personal bank statement in EUR, USD, or local equivalent proving independent financial sustenance in Albania.",
        statutoryCitation: "Law No. 79/2021, Article 34(e)",
      },
      {
        category: "experience",
        documentType: "work_contract_or_license",
        title: "Employment Contract or Self-Employment Business Registration",
        requirement: "Signed labor contract with Albanian entity or registration as sole proprietor/digital nomad in QKB.",
        statutoryCitation: "Law No. 79/2021, Articles 41 & 42",
      },
    ],
  },

  // --- 4. CANADA (IRCC) ---
  {
    id: "ca_express_entry",
    destinationCountry: "Canada",
    streamName: "Express Entry (Federal Skilled Worker - FSW)",
    category: "work",
    statutoryAuthority: "Immigration, Refugees and Citizenship Canada (IRCC) - IRPA",
    officialPortalUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
    financialRequirements: {
      minimumLiquidFundsTargetCurrency: 14690, // C$14,690 for 1 person (2024 settlement funds)
      targetCurrency: "CAD",
      holdingPeriodDays: 180, // 6 months average balance
      strictConsecutiveBalance: false,
      fundsDumpingThresholdPercent: 20,
      monthlyCostOfLivingEstimate: 1500,
    },
    mandatoryChecklist: [
      {
        category: "identification",
        documentType: "international_passport",
        title: "Valid International Passport",
        requirement: "Valid biometric travel document for applicant and all accompanying dependents.",
        statutoryCitation: "IRPR Section 50",
        validityMonths: 6,
      },
      {
        category: "finance",
        documentType: "settlement_funds",
        title: "Proof of Settlement Funds (C$14,690 Unencumbered Funds)",
        requirement: "Official bank letterhead statements for past 6 months showing average balance. Must be unencumbered by debt. Borrowed funds prohibited.",
        statutoryCitation: "IRPR Section 76(1)(b) & LICO Standards",
      },
      {
        category: "academics",
        documentType: "eca_report",
        title: "Educational Credential Assessment (ECA) via WES/ICAS/CES",
        requirement: "Official ECA report verifying Canadian equivalency of degrees, diplomas, or certificates.",
        statutoryCitation: "IRPR Section 75(2)",
        requiresTier2Legalization: true,
      },
      {
        category: "language",
        documentType: "ielts_celpip_tef",
        title: "Language Test Results (CLB 7+ in All 4 Abilities)",
        requirement: "IELTS General or CELPIP (English) / TEF or TCF (French) taken within past 2 years with minimum score of CLB 7.",
        statutoryCitation: "IRPR Section 74(1)",
        languageMinCefr: "B2",
      },
      {
        category: "experience",
        documentType: "reference_letters",
        title: "At Least 1 Year Continuous Full-Time TEER 0, 1, 2, or 3 Experience",
        requirement: "Reference letters on company letterhead detailing duties matching National Occupational Classification (NOC).",
        statutoryCitation: "IRPR Section 75(2)(a)",
        minYearsExperience: 1,
      },
      {
        category: "legal",
        documentType: "police_certificate",
        title: "Police Certificates from Every Country Resided 6+ Months",
        requirement: "Clear criminal record checks for primary applicant and dependents aged 18+.",
        statutoryCitation: "IRPA Section 36",
        requiresTier2Legalization: true,
      },
    ],
  },

  // --- 5. UNITED STATES (USCIS / Dept of State) ---
  {
    id: "us_employment_h1b_o1",
    destinationCountry: "United States",
    streamName: "Specialty / Extraordinary Employment (H-1B / O-1A / EB-2 NIW)",
    category: "work",
    statutoryAuthority: "U.S. Citizenship and Immigration Services (USCIS) - INA § 101(a)(15)",
    officialPortalUrl: "https://www.uscis.gov/working-in-the-united-states",
    financialRequirements: {
      minimumLiquidFundsTargetCurrency: 5000,
      targetCurrency: "USD",
      holdingPeriodDays: 30,
      strictConsecutiveBalance: false,
      fundsDumpingThresholdPercent: 35,
    },
    mandatoryChecklist: [
      {
        category: "identification",
        documentType: "international_passport",
        title: "Valid Passport (>6 Months Beyond Stay)",
        requirement: "Valid biometric passport meeting Six-Month Club requirements.",
        statutoryCitation: "INA § 212(a)(7)(B)",
        validityMonths: 6,
      },
      {
        category: "academics",
        documentType: "degree_evaluation",
        title: "U.S. Bachelor's Degree Equivalency Evaluation",
        requirement: "Certified evaluation report proving tertiary degree corresponds to U.S. bachelor's or higher in specialty field.",
        statutoryCitation: "8 CFR § 214.2(h)(4)(iii)(C)",
        requiresTier2Legalization: true,
      },
      {
        category: "experience",
        documentType: "portfolio_and_employment",
        title: "Documented Work Experience & Expert Critical Contributions",
        requirement: "Evidence of progressive experience, scholarly publications, patents, or critical roles at distinguished organizations.",
        statutoryCitation: "8 CFR § 204.5(k)(3) / 8 CFR § 214.2(o)",
        minYearsExperience: 3,
      },
    ],
  },

  // --- 6. UNIVERSAL GLOBAL RELOCATION FALLBACK ---
  {
    id: "global_general_relocation",
    destinationCountry: "Global",
    streamName: "International Relocation & Residence Standard",
    category: "relocation",
    statutoryAuthority: "Sovereign Consular Adjudication Standard",
    officialPortalUrl: "https://sabiprofile.com",
    financialRequirements: {
      minimumLiquidFundsTargetCurrency: 3500,
      targetCurrency: "USD",
      holdingPeriodDays: 30,
      strictConsecutiveBalance: false,
      fundsDumpingThresholdPercent: 30,
    },
    mandatoryChecklist: [
      {
        category: "identification",
        documentType: "international_passport",
        title: "Valid International Passport",
        requirement: "Valid passport with machine-readable zone (MRZ) and at least 6 months validity.",
        statutoryCitation: "ICAO Document 9303 Part 4",
        validityMonths: 6,
      },
      {
        category: "finance",
        documentType: "bank_statement",
        title: "Proof of Financial Solvency ($3,500+)",
        requirement: "Recent 3-6 month official bank statement demonstrating sufficient personal savings.",
        statutoryCitation: "Consular Maintenance Guideline",
      },
      {
        category: "legal",
        documentType: "police_certificate_or_affidavit",
        title: "Police Character Certificate or Sworn Affidavit",
        requirement: "Certificate of clean criminal record or sworn statutory declaration of good character.",
        statutoryCitation: "Consular Inadmissibility Safeguard",
        requiresTier2Legalization: true,
      },
      {
        category: "experience",
        documentType: "work_contracts",
        title: "Documented Professional Experience & Contracts",
        requirement: "Verified employment history or business credentials.",
        statutoryCitation: "Labor & Talent Mobility Standard",
        minYearsExperience: 1,
      },
    ],
  },
];

/**
 * Resolves the closest statutory consular visa route by country and stream title.
 */
export function findConsularRoute(
  destinationCountry: string,
  streamHint?: string
): ConsularVisaRoute {
  const normCountry = (destinationCountry || "").toLowerCase().trim();
  const normStream = (streamHint || "").toLowerCase().trim();

  // 1. Direct country + stream match
  const match = CONSULAR_ROUTES_CATALOG.find((r) => {
    const rCountry = r.destinationCountry.toLowerCase();
    const rStream = r.streamName.toLowerCase();
    const rId = r.id.toLowerCase();

    const countryMatches =
      rCountry === normCountry ||
      (normCountry.includes("uk") && rCountry.includes("united kingdom")) ||
      (normCountry.includes("united kingdom") && rCountry.includes("united kingdom")) ||
      (normCountry.includes("germany") && rCountry.includes("germany")) ||
      (normCountry.includes("albania") && rCountry.includes("albania")) ||
      (normCountry.includes("canada") && rCountry.includes("canada")) ||
      (normCountry.includes("united states") && rCountry.includes("united states")) ||
      (normCountry.includes("usa") && rCountry.includes("united states"));

    if (!countryMatches) return false;

    if (normStream) {
      if (normStream.includes("student") || normStream.includes("study")) {
        return r.category === "study";
      }
      if (normStream.includes("chancenkarte") || normStream.includes("opportunity")) {
        return rId.includes("chancenkarte");
      }
      if (normStream.includes("blue card")) {
        return rId.includes("blue_card");
      }
      if (normStream.includes("unique") || normStream.includes("nomad") || normStream.includes("self")) {
        return rId.includes("unique");
      }
      if (normStream.includes("express entry") || normStream.includes("fsw")) {
        return rId.includes("express_entry");
      }
    }

    return true;
  });

  if (match) return match;

  // 2. Country fallback
  const countryFallback = CONSULAR_ROUTES_CATALOG.find((r) =>
    r.destinationCountry.toLowerCase().includes(normCountry)
  );
  if (countryFallback) return countryFallback;

  // 3. Global fallback
  return CONSULAR_ROUTES_CATALOG.find((r) => r.id === "global_general_relocation")!;
}

export function getAllSupportedRoutes(): ConsularVisaRoute[] {
  return CONSULAR_ROUTES_CATALOG;
}
