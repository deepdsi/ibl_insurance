export const CURRENCY_CODE = 'INR';
export const CURRENCY_SYMBOL = '₹';
export const DEDUCTIBLE_AMOUNT = 50000;
export const ANNUAL_LIMIT = 500000;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: CURRENCY_CODE,
    maximumFractionDigits: 2,
  }).format(amount);
}
