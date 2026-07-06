import { ANNUAL_LIMIT, DEDUCTIBLE_AMOUNT } from './currency';

export const COVERAGE_RATE = 0.8;

export interface CoverageResult {
  coveredAmount: number;
  patientResponsibility: number;
  coverageRate: number;
}

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

export function calculateCoverage(totalAmount: number, _policyId?: string): CoverageResult {
  const eligibleAmount = Math.max(totalAmount, 0);
  const amountAfterDeductible = Math.max(eligibleAmount - DEDUCTIBLE_AMOUNT, 0);
  const coveredAmount = roundCurrency(Math.min(amountAfterDeductible * COVERAGE_RATE, ANNUAL_LIMIT));
  const patientResponsibility = roundCurrency(eligibleAmount - coveredAmount);

  return {
    coveredAmount,
    patientResponsibility,
    coverageRate: COVERAGE_RATE,
  };
}
