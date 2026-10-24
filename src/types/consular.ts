import { z } from "zod";
import { VaultCategory } from "./vault";

export type ConsularChecklistStatus = "verified" | "warning" | "refusal_risk";

export interface ConsularChecklistItem {
  id: string;
  category: VaultCategory | "language" | "general";
  title: string;
  requirement: string;
  statutoryCitation: string;
  status: ConsularChecklistStatus;
  isSatisfied: boolean;
  proofSnippet?: string;
  suggestedAction?: string;
  rectificationUrl?: string;
}

export interface FinancialForensicsReport {
  targetCurrency: string;
  requiredAmount: number;
  detectedLiquidBalance: number;
  detectedCurrency: string;
  exchangeRateUsed: number;
  isAmountSufficient: boolean;
  shortfallAmount: number;
  consecutiveDaysPassed: number;
  consecutiveDaysRequired: number;
  isConsecutiveRuleSatisfied: boolean;
  suddenDepositDetected: boolean;
  suddenDepositDetails?: string;
  accountHolderNameMatch: boolean;
  accountNameDetected: string;
  passportNameDetected: string;
  financialHealthGrade: "A" | "B" | "C" | "F";
  summary: string;
}

export interface ConsularVisaRoute {
  id: string;
  destinationCountry: string;
  streamName: string;
  category: "work" | "study" | "relocation" | "business" | "nomad";
  statutoryAuthority: string;
  officialPortalUrl: string;
  financialRequirements: {
    minimumLiquidFundsTargetCurrency: number;
    targetCurrency: string;
    holdingPeriodDays: number;
    strictConsecutiveBalance: boolean;
    fundsDumpingThresholdPercent: number;
    monthlyCostOfLivingEstimate?: number;
  };
  mandatoryChecklist: {
    category: VaultCategory | "language";
    documentType: string;
    title: string;
    requirement: string;
    statutoryCitation: string;
    requiresTier2Legalization?: boolean;
    requiresApostille?: boolean;
    validityMonths?: number;
    minYearsExperience?: number;
    languageMinCefr?: string;
  }[];
}
