import { FullUserVault, VerificationTier } from "@/types/vault";

export interface FraudAuditItem {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  flag: string;
  evidence: string;
}

export interface FraudAuditReport {
  overallRiskLevel: "CLEAN" | "LOW_RISK" | "SUSPICIOUS" | "FRAUD_SUSPECTED";
  riskScore: number; // 0 (completely clean) to 100 (fraudulent)
  flags: FraudAuditItem[];
  passedChecks: string[];
  recommendedAction: "APPROVE" | "MANUAL_NOTARY_REVIEW_REQUIRED" | "REJECT_TAMPER_FLAG";
}

/**
 * Sabi Vault Automated Fraud Detection Agent
 *
 * Scans candidate structured records for chronological anomalies, forged graduation timelines,
 * un-notarized Tier 2 legal certificates, and suspicious balance surges.
 */
export class FraudDetectionAgent {
  auditCandidateVault(
    vault: Partial<FullUserVault>,
    mandatoryTier2: boolean = false
  ): FraudAuditReport {
    const flags: FraudAuditItem[] = [];
    const passedChecks: string[] = [];

    // 1. Audit Academics: Check graduation years and Tier 2 Notarization
    if (vault.academics && vault.academics.degrees.length > 0) {
      const currentYear = new Date().getFullYear();
      for (const degree of vault.academics.degrees) {
        if (degree.graduationYear > currentYear) {
          flags.push({
            severity: "HIGH",
            category: "academics",
            flag: "FUTURE_GRADUATION_DATE",
            evidence: `Degree ${degree.fieldOfStudy} at ${degree.institution} has graduation year ${degree.graduationYear} in the future.`,
          });
        }

        if (mandatoryTier2 && degree.tier !== VerificationTier.TIER_2_AUTHENTICATED_LEGALIZED) {
          flags.push({
            severity: "MEDIUM",
            category: "academics",
            flag: "UNAUTHENTICATED_LEGAL_CREDENTIAL",
            evidence: `Degree ${degree.fieldOfStudy} is Tier 1 (Standard Hashed) but requires Tier 2 Notarization for this vertical.`,
          });
        }
      }
      passedChecks.push("Academic records checked for chronologic integrity.");
    }

    // 2. Audit Finance: Check for sudden liquid balance vs 3-month average
    if (vault.finance && vault.finance.bankRecords.length > 0) {
      for (const record of vault.finance.bankRecords) {
        if (record.averageThreeMonthBalance > 0) {
          const ratio = record.currentLiquidBalance / record.averageThreeMonthBalance;
          if (ratio > 5.0 && record.currentLiquidBalance > 10000) {
            flags.push({
              severity: "MEDIUM",
              category: "finance",
              flag: "SUDDEN_BALANCE_SURGE",
              evidence: `Current liquid balance (${record.currentLiquidBalance} ${record.currency}) is ${ratio.toFixed(1)}x greater than 3-month average (${record.averageThreeMonthBalance} ${record.currency}). Potential artificial fund inflation.`,
            });
          }
        }
      }
      passedChecks.push("Financial records audited for balance stability and deposit velocity.");
    }

    // 3. Audit Experience: Check for invalid overlapping dates
    if (vault.experience && vault.experience.experiences.length > 0) {
      const exps = vault.experience.experiences;
      for (const exp of exps) {
        if (exp.endDate && exp.startDate && new Date(exp.startDate) > new Date(exp.endDate)) {
          flags.push({
            severity: "HIGH",
            category: "experience",
            flag: "INVALID_TENURE_DATES",
            evidence: `Position '${exp.jobTitle}' at '${exp.company}' has start date (${exp.startDate}) later than end date (${exp.endDate}).`,
          });
        }
      }
      passedChecks.push("Employment tenure history checked for timeline validity.");
    }

    // Compute Risk Score
    let riskScore = 0;
    for (const flag of flags) {
      if (flag.severity === "CRITICAL") riskScore += 50;
      else if (flag.severity === "HIGH") riskScore += 30;
      else if (flag.severity === "MEDIUM") riskScore += 15;
      else riskScore += 5;
    }
    riskScore = Math.min(riskScore, 100);

    let overallRiskLevel: FraudAuditReport["overallRiskLevel"] = "CLEAN";
    let recommendedAction: FraudAuditReport["recommendedAction"] = "APPROVE";

    if (riskScore >= 60) {
      overallRiskLevel = "FRAUD_SUSPECTED";
      recommendedAction = "REJECT_TAMPER_FLAG";
    } else if (riskScore >= 25) {
      overallRiskLevel = "SUSPICIOUS";
      recommendedAction = "MANUAL_NOTARY_REVIEW_REQUIRED";
    } else if (riskScore > 0) {
      overallRiskLevel = "LOW_RISK";
      recommendedAction = "APPROVE";
    }

    return {
      overallRiskLevel,
      riskScore,
      flags,
      passedChecks,
      recommendedAction,
    };
  }
}
