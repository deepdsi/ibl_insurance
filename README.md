# ibl_insurance

## Policy Coverage Rules

Claims use a simple fixed INR coverage policy:

- Claim amounts below `₹0` are treated as `₹0`.
- A deductible of `₹50,000` is applied first.
- The insurer covers `80%` of the amount remaining after the deductible.
- The covered amount is capped at an annual policy limit of `₹5,00,000`.
- Patient responsibility is the total claim amount minus the covered amount.
- Currency values are rounded to two decimal places.

Formula:

```text
eligibleAmount = max(totalClaimAmount, 0)
amountAfterDeductible = max(eligibleAmount - 50000, 0)
coveredAmount = min(amountAfterDeductible * 0.80, 500000)
patientResponsibility = eligibleAmount - coveredAmount
```
