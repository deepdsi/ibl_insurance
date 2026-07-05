export interface CoverageResult {
  coveredAmount: number;
  patientResponsibility: number;
  coverageRate: number;
}

export function calculateCoverage(totalAmount: number, _policyId?: string): CoverageResult {
  const deductible = 500;
  const coinsuranceRate = 0.8;
  const annualLimit = 5000;

  const amountAboveDeductible = Math.max(totalAmount - deductible, 0);
  const coveredAmount = Math.min(amountAboveDeductible * coinsuranceRate, annualLimit);
  const patientResponsibility = Math.max(totalAmount - coveredAmount, 0);

  return {
    coveredAmount,
    patientResponsibility,
    coverageRate: coinsuranceRate,
  };
}
