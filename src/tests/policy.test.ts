import { describe, it, expect } from 'vitest';
import { calculateCoverage } from '../utils/policy';

describe('calculateCoverage', () => {
  it('applies deductible and coinsurance for a standard claim', () => {
    const result = calculateCoverage(2500, 'policy-001');

    expect(result.coveredAmount).toBe(1600);
    expect(result.patientResponsibility).toBe(900);
    expect(result.coverageRate).toBe(0.8);
  });

  it('caps coverage at the annual limit', () => {
    const result = calculateCoverage(8000, 'policy-001');

    expect(result.coveredAmount).toBe(5000);
    expect(result.patientResponsibility).toBe(3000);
  });

  it('returns zero coverage when the amount is below the deductible', () => {
    const result = calculateCoverage(400, 'policy-001');

    expect(result.coveredAmount).toBe(0);
    expect(result.patientResponsibility).toBe(400);
  });
});
