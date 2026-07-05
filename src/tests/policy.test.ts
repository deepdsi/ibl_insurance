import { describe, it, expect } from 'vitest';
import { calculateCoverage } from '../utils/policy';
import { CURRENCY_CODE } from '../utils/currency';

describe('calculateCoverage', () => {
  it('uses INR as the policy currency', () => {
    expect(CURRENCY_CODE).toBe('INR');
  });

  it('applies deductible and coinsurance for a standard claim', () => {
    const result = calculateCoverage(250000, 'policy-001');

    expect(result.coveredAmount).toBe(160000);
    expect(result.patientResponsibility).toBe(90000);
    expect(result.coverageRate).toBe(0.8);
  });

  it('caps coverage at the annual limit', () => {
    const result = calculateCoverage(800000, 'policy-001');

    expect(result.coveredAmount).toBe(500000);
    expect(result.patientResponsibility).toBe(300000);
  });

  it('returns zero coverage when the amount is below the deductible', () => {
    const result = calculateCoverage(40000, 'policy-001');

    expect(result.coveredAmount).toBe(0);
    expect(result.patientResponsibility).toBe(40000);
  });
});
