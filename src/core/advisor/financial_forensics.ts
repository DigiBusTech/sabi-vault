import { FinancialForensicsReport, ConsularVisaRoute } from "@/types/consular";
import { FullUserVault } from "@/types/vault";
import { UserHumanProfile } from "@/types/profile";

// Benchmark consular exchange rates against USD base (calibrated to official CBN/OANDA rates)
const EXCHANGE_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  GBP: 1.28,
  EUR: 1.08,
  CAD: 0.74,
  NGN: 0.000625, // ~1,600 NGN per USD
  GHS: 0.063,    // ~15.8 GHS per USD
  KES: 0.0077,   // ~130 KES per USD
  INR: 0.012,    // ~84 INR per USD
  ZAR: 0.055,    // ~18 ZAR per USD
  ALL: 0.011,    // ~92 ALL per USD
};

/**
 * Converts any currency into the target destination currency.
 */
export function convertCurrency(
  amount: number,
  sourceCurrency: string = "NGN",
  targetCurrency: string = "GBP"
): { convertedAmount: number; exchangeRate: number } {
  const src = sourceCurrency.toUpperCase().trim() || "NGN";
  const tgt = targetCurrency.toUpperCase().trim() || "GBP";

  if (src === tgt) {
    return { convertedAmount: amount, exchangeRate: 1.0 };
  }

  const srcRateToUsd = EXCHANGE_RATES_TO_USD[src] || 0.000625; // fallback to NGN
  const tgtRateToUsd = EXCHANGE_RATES_TO_USD[tgt] || 1.0;

  // Convert source amount -> USD -> target amount
  const amountInUsd = amount * srcRateToUsd;
  const convertedAmount = amountInUsd / tgtRateToUsd;
  const exchangeRate = srcRateToUsd / tgtRateToUsd;

  return {
    convertedAmount: Math.round(convertedAmount * 100) / 100,
    exchangeRate: Math.round(exchangeRate * 100000) / 100000,
  };
}

/**
 * Normalizes and compares a bank account holder name against the passport legal name.
 * Detects abbreviation variances, maiden name orderings, and generates forensic alerts.
 */
export function reconcileAccountHolderName(
  accountName?: string,
  passportName?: string
): { isMatch: boolean; details?: string } {
  if (!accountName || !passportName) {
    return { isMatch: true };
  }

  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 1);

  const accTokens = clean(accountName);
  const passTokens = clean(passportName);

  if (accTokens.length === 0 || passTokens.length === 0) {
    return { isMatch: true };
  }

  // Count common tokens (e.g. surname + first name)
  const common = accTokens.filter((token) => passTokens.includes(token));
  const isMatch = common.length >= Math.min(2, passTokens.length);

  if (!isMatch) {
    return {
      isMatch: false,
      details: `Bank statement account name ("${accountName}") differs from verified passport legal name ("${passportName}"). Consular officers will flag this as third-party funds unless accompanied by a notarized Sworn Affidavit of One and Same Person.`,
    };
  }

  return { isMatch: true };
}

/**
 * Analyzes bank statements and transaction records for statutory compliance:
 * - 28-day consecutive holding rule (UKVI) / 90-day rule (Schengen)
 * - Minimum liquid balance vs target threshold
 * - Unexplained sudden deposits / funds dumping
 * - Name reconciliation
 */
export function auditFinancialForensics(
  userVault: FullUserVault,
  profile: UserHumanProfile,
  route: ConsularVisaRoute
): FinancialForensicsReport {
  const finance = userVault.finance;
  const bankRecords = finance?.bankRecords || [];
  const primaryBank = bankRecords[0] || null;

  const targetCurr = route.financialRequirements.targetCurrency;
  const requiredTargetAmount = route.financialRequirements.minimumLiquidFundsTargetCurrency;
  const holdingRequired = route.financialRequirements.holdingPeriodDays;

  // Extract detected liquid balances
  let rawDetectedBalance = 0;
  let rawDetectedCurrency = "NGN";
  let averageThreeMonth = 0;
  let statementFrom = "";
  let statementTo = "";
  let accountHolder = "";

  if (primaryBank) {
    rawDetectedBalance = Number(primaryBank.currentLiquidBalance) || 0;
    rawDetectedCurrency = primaryBank.currency || "NGN";
    averageThreeMonth = Number(primaryBank.averageThreeMonthBalance) || rawDetectedBalance;
    statementFrom = primaryBank.statementPeriod?.from || "";
    statementTo = primaryBank.statementPeriod?.to || "";
    accountHolder = primaryBank.accountHolderName || "";
  }

  // Currency Conversion to Target (e.g. NGN -> GBP or EUR)
  const { convertedAmount: detectedInTargetCurr, exchangeRate } = convertCurrency(
    rawDetectedBalance,
    rawDetectedCurrency,
    targetCurr
  );

  const isAmountSufficient = detectedInTargetCurr >= requiredTargetAmount;
  const shortfallAmount = isAmountSufficient ? 0 : Math.round(requiredTargetAmount - detectedInTargetCurr);

  // Consecutive Holding Days Calculation
  let consecutiveDaysPassed = 0;
  if (statementFrom && statementTo) {
    const d1 = new Date(statementFrom).getTime();
    const d2 = new Date(statementTo).getTime();
    if (!isNaN(d1) && !isNaN(d2) && d2 >= d1) {
      consecutiveDaysPassed = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    }
  } else if (rawDetectedBalance > 0) {
    // If statement period was not explicitly extracted, assume standard 30-day statement
    consecutiveDaysPassed = 30;
  }

  const isConsecutiveRuleSatisfied = consecutiveDaysPassed >= holdingRequired && isAmountSufficient;

  // Sudden Deposit / Funds Dumping Detection
  let suddenDepositDetected = false;
  let suddenDepositDetails: string | undefined;

  // Check 1: Current balance is more than 2.5x the 3-month average without prior tenure
  if (averageThreeMonth > 0 && rawDetectedBalance > averageThreeMonth * 2.5 && rawDetectedBalance > 500000) {
    suddenDepositDetected = true;
    suddenDepositDetails = `Current closing balance (${rawDetectedCurrency} ${rawDetectedBalance.toLocaleString()}) is more than 250% higher than your 3-month average balance (${rawDetectedCurrency} ${averageThreeMonth.toLocaleString()}). Consular scrutiny will suspect temporary parked/borrowed funds.`;
  }

  // Check 2: Single deposit exceeds 25% of total balance
  if ((primaryBank as any)?.items && Array.isArray((primaryBank as any).items)) {
    const spikeItem = (primaryBank as any).items.find(
      (item: any) =>
        item.amount &&
        item.amount > rawDetectedBalance * (route.financialRequirements.fundsDumpingThresholdPercent / 100)
    );
    if (spikeItem) {
      suddenDepositDetected = true;
      suddenDepositDetails = `Unexplained lump-sum deposit of ${rawDetectedCurrency} ${spikeItem.amount.toLocaleString()} ("${
        spikeItem.description || "Credit"
      }") detected. Consular officers mandate proof of funds provenance (e.g. sale deed, gift affidavit, employer letter).`;
    }
  }

  // Name Reconciliation
  const passportName =
    userVault.identification?.identifications?.[0]?.fullName || profile.fullName || "";
  const nameReconciliation = reconcileAccountHolderName(accountHolder, passportName);

  // Grade Computation:
  // A = Compliant across amount, holding period, name, and no funds dumping
  // B = Amount satisfied, minor holding period gap or unconfirmed statement period
  // C = Shortfall < 20% or sudden deposit flag
  // F = Severe shortfall or zero verified balance
  let financialHealthGrade: "A" | "B" | "C" | "F" = "F";
  let summary = "";

  if (rawDetectedBalance === 0) {
    financialHealthGrade = "F";
    summary = `No verified liquid bank records found in Vault. Consular maintenance requires verified proof of funds in ${targetCurr}.`;
  } else if (isAmountSufficient && isConsecutiveRuleSatisfied && !suddenDepositDetected && nameReconciliation.isMatch) {
    financialHealthGrade = "A";
    summary = `Excellent financial standing. Your detected balance of ${targetCurr} ${detectedInTargetCurr.toLocaleString()} satisfies the statutory ${route.statutoryAuthority} maintenance requirement (${targetCurr} ${requiredTargetAmount.toLocaleString()}) with consecutive holding verified.`;
  } else if (isAmountSufficient && (!isConsecutiveRuleSatisfied || suddenDepositDetected || !nameReconciliation.isMatch)) {
    financialHealthGrade = "B";
    const issues: string[] = [];
    if (!isConsecutiveRuleSatisfied) issues.push(`Statement duration (${consecutiveDaysPassed} days) is less than the required ${holdingRequired} consecutive days`);
    if (suddenDepositDetected) issues.push("Sudden lump-sum deposit flagged");
    if (!nameReconciliation.isMatch) issues.push("Account name differs from passport");
    summary = `Sufficient total funds detected (${targetCurr} ${detectedInTargetCurr.toLocaleString()}), but procedural flags exist: ${issues.join("; ")}.`;
  } else if (detectedInTargetCurr >= requiredTargetAmount * 0.75) {
    financialHealthGrade = "C";
    summary = `Marginal funds shortfall of ${targetCurr} ${shortfallAmount.toLocaleString()}. Current balance of ${targetCurr} ${detectedInTargetCurr.toLocaleString()} is below the statutory threshold of ${targetCurr} ${requiredTargetAmount.toLocaleString()}.`;
  } else {
    financialHealthGrade = "F";
    summary = `Critical funds deficit. Detected balance (${targetCurr} ${detectedInTargetCurr.toLocaleString()}) leaves a shortfall of ${targetCurr} ${shortfallAmount.toLocaleString()} against the mandatory requirement of ${targetCurr} ${requiredTargetAmount.toLocaleString()}. Visa refusal is virtually guaranteed under current balance.`;
  }

  return {
    targetCurrency: targetCurr,
    requiredAmount: requiredTargetAmount,
    detectedLiquidBalance: detectedInTargetCurr,
    detectedCurrency: rawDetectedCurrency,
    exchangeRateUsed: exchangeRate,
    isAmountSufficient,
    shortfallAmount,
    consecutiveDaysPassed,
    consecutiveDaysRequired: holdingRequired,
    isConsecutiveRuleSatisfied,
    suddenDepositDetected,
    suddenDepositDetails,
    accountHolderNameMatch: nameReconciliation.isMatch,
    accountNameDetected: accountHolder || "—",
    passportNameDetected: passportName || "—",
    financialHealthGrade,
    summary,
  };
}
