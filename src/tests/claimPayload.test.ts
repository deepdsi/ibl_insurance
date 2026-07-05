import { describe, expect, it } from 'vitest';
import { parseLineItemsInput } from '../utils/claimPayload';

describe('parseLineItemsInput', () => {
  it('parses line items sent as a JSON string from multipart forms', () => {
    const parsed = parseLineItemsInput('[{"description":"Test item","quantity":2,"unitCost":75}]');

    expect(parsed).toEqual([
      { description: 'Test item', quantity: 2, unitCost: 75 },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseLineItemsInput('')).toEqual([]);
  });
});
