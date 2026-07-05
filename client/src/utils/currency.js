export const CURRENCY_CODE = 'INR';
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: CURRENCY_CODE,
        maximumFractionDigits: 2,
    }).format(amount);
}
