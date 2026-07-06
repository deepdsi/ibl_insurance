import { claimLineItemSchema } from './validation';

export function parseLineItemsInput(rawValue: unknown): Array<{ description: string; quantity: number; unitCost: number }> {
  if (!rawValue) {
    return [];
  }

  if (Array.isArray(rawValue)) {
    return rawValue
      .map((item) => claimLineItemSchema.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data);
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      return parseLineItemsInput(parsed);
    } catch {
      return [];
    }
  }

  return [];
}
