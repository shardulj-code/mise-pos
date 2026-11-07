# Mise v2 — 03 GST, Billing and Money Specification

**Document 03 of 05 · Version 2.0 · 07 November 2026**

> This document defines every calculation Mise performs on money and tax, with worked examples that were recomputed with integer arithmetic. It is an engineering specification, **not tax advice**. Every rule marked **CA** must be confirmed by the restaurant's Chartered Accountant against the official notifications before live use. The software holds tax rules as *data*; it never hard-codes "the" GST rate.

## 1. Legal background the engine must respect (verified 07 November 2026 from public sources; CA to confirm)

| Topic | Position the engine assumes | Source type |
| --- | --- | --- |
| Standalone restaurant service (dine-in, takeaway, delivery by the restaurant) | 5% GST, **no input tax credit**; 2.5% CGST + 2.5% SGST. This is a conditional rate, not an option: a standalone restaurant cannot choose 18% to claim credit | Notification 11/2017-CTR entry 7(ii); secondary summaries |
| Restaurant service at "specified premises" (hotel premises meeting the notified room-tariff test) | 18% GST with ITC; 9% + 9% | Entry 7(vi); CBIC FAQs of March 2025 |
| Rate rationalisation of 22 September 2025 | Did not change the two restaurant-service rates above | Secondary summaries |
| Composition scheme (restaurants) | 5% of turnover (2.5% + 2.5%) paid by the restaurant; **cannot collect GST from customers**; issues a **bill of supply** carrying the declaration "composition taxable person, not eligible to collect tax on supplies"; no ITC; not available if alcohol is served; turnover limit generally ₹1.5 crore | Section 10 CGST Act, Rule 5; secondary summaries |
| Service charge | Not a statutory levy and not mandatory. When charged as part of the bill it is part of the value of supply and attracts GST like the underlying supply (CBIC FAQ). Consumer guidelines say it is voluntary, must not be added by default and the customer may ask for it to be removed. The Delhi High Court has held it cannot be levied on takeaway | CBIC FAQ; CCPA guidelines; court ruling |
| Alcohol for human consumption | Outside GST (state levies apply). Treat as a separate tax category "OUTSIDE\_GST"; a restaurant serving alcohol cannot use composition | Secondary summaries |
| Tax invoice particulars (Rule 46) | Supplier name, address, GSTIN; consecutive serial number **up to 16 characters** of letters, numerals, hyphen and slash, unique for the financial year; date; recipient details where applicable; HSN or SAC; description; quantity; taxable value after discount; rate and amount of CGST, SGST or IGST; place of supply; reverse-charge indicator; signature (digital or computer-generated is acceptable in practice, CA to confirm) | Rule 46 |
| Small supplies | A tax invoice need not be issued for a supply under ₹200 to an unregistered buyer who does not ask for one; a **consolidated invoice** is issued at the end of the day. A registered person must issue an invoice if the buyer insists | Rule 46 proviso |
| Unregistered recipient, large value | If the recipient is unregistered and the taxable supply is ₹50,000 or more, record the recipient's name, address and the state name and code | Rule 46 |
| Restaurant orders through e-commerce operators (section 9(5)) | The operator issues the invoice and pays the tax. Aggregator orders are therefore **out of scope** for v2 | CBIC circular |
| Service code | Restaurant services sit under SAC heading 9963; a six-digit code such as 996331 is commonly cited for restaurant services | CA to confirm the exact code |
| E-invoicing | Applies above a turnover threshold (commonly cited as ₹5 crore, mainly for B2B); out of scope for the target outlets; the setup wizard warns the owner to ask the CA | CA |

Place of supply for restaurant service is generally where the service is performed, so dine-in and takeaway are **intra-state** (CGST + SGST). The engine supports IGST, but it is **disabled** until the CA approves a rule for a specific case. **VERIFY (CA).**

## 2. Principles

1. **Integer paise and integer basis points only.** No floating point anywhere in money or tax code, including intermediate values, tests and exports.
2. **One explicit rounding rule** (section 4), implemented once in `packages/core`, covered by property tests.
3. **Pure functions.** `calculateBill(input) -> output` has no database, clock or network access. The same input always yields the same output.
4. **Rules are data.** Rates, effective dates, inclusive or exclusive pricing, service-charge settings and rounding mode are configuration rows, versioned and effective-dated.
5. **Issued bills are immutable snapshots** that embed the full rule set used. A later rate change never alters them.
6. **No ambiguous defaults.** Setup forces an explicit choice for price basis, service charge and round-off.
7. **Practice mode until the CA signs off.** Bills are watermarked PRACTICE and excluded from reports.

## 3. Configuration objects

```
TaxProfile   { id, name, scheme: REGULAR | SPECIFIED_PREMISES | COMPOSITION | UNREGISTERED,
               effective_from, reviewed_by, review_date, review_note, active }
TaxCategory  { id, name, kind: GST_RATE | OUTSIDE_GST | EXEMPT, sac_or_hsn, description }
TaxRule      { profile_id, category_id, rate_bp, component: CGST_SGST | IGST,
               effective_from, source_note }          // rate_bp is TOTAL rate: 500 = 5.00%
BillSettings { prices_include_tax: bool, round_mode: NONE | NEAREST_RUPEE,
               service_charge: { enabled, rate_bp, applies_to: [DINE_IN], taxable: true },
               packaging: { mode: NONE | PER_ORDER | PER_ITEM, amount_paise, applies_to: [TAKEAWAY, DELIVERY] },
               consolidated_small_bills: bool, discount_limits_by_role }
```

The active rule for a line is the rule with the greatest `effective_from` not later than the bill's issue time. A change to a rule creates a **new row**; old rows are never edited. Each change stores editor, reason and timestamp, requires the owner PIN and shows a preview such as "a ₹200 item becomes ₹210".

Guards: warn on a rate of 0 or above 40%; warn on any change that alters rates for an existing category; block deleting a rule used by an issued bill.

## 4. The calculation contract

### 4.1 Rounding

All divisions use **round half up at the paise level** on non-negative integers:

```
mulDivRoundHalfUp(a, b, d) = floor((2*a*b + d) / (2*d))      // a,b >= 0, d > 0
```

Negative amounts (refunds, credit notes) are computed on the absolute value and negated, so the rule is symmetric. **CA** must confirm this rule and the rounding of CGST and SGST.

### 4.2 Input and output

```
input: {
  lines: [{ id, qty, unit_price_paise, tax_category, name_snapshot }],  // unit price already includes variant and modifier deltas
  order_type: DINE_IN | TAKEAWAY | DELIVERY | COUNTER,
  discount: { kind: NONE | FLAT_PAISE | PERCENT_BP, value },
  service_charge_enabled_for_this_bill: bool,
  recipient: { gstin?, name?, address?, state_code? },
  profile, rules, settings, supply_type: INTRA_STATE | INTER_STATE
}
output: per line { gross, discount_alloc, service_alloc, packaging_alloc, taxable, cgst, sgst, igst, total_tax, line_total }
        bill { subtotal, discount, service_charge, packaging, taxable_total, cgst_total, sgst_total, igst_total,
               tax_total, grand_total, round_off, payable, document_type, rule_snapshot }
```

### 4.3 Steps (exclusive pricing)

1. **Line gross** = `qty × unit_price_paise`.
2. **Bill discount.** Flat: `D = value`. Percent: `D = mulDivRoundHalfUp(subtotal, value, 10000)`. Cap `D ≤ subtotal`. Allocate `D` across lines in proportion to line gross using the **largest-remainder method** (section 4.5).
3. **Net line** = gross − discount allocation.
4. **Service charge** (only if enabled in settings, enabled for this bill, and the order type is in `applies_to`): `SC = mulDivRoundHalfUp(sum(net), rate_bp, 10000)`; allocate across lines in proportion to **net** by largest remainder. Service charge therefore bears the tax rate of each line, matching the treatment of a composite supply at the principal supply's rate. **CA.** The engine **refuses service charge on TAKEAWAY and DELIVERY** orders (rule R-SC-2, pending CA).
5. **Packaging** (takeaway and delivery): `PER_ORDER` amount allocated like service charge; `PER_ITEM` adds `amount × qty` to the line. Packaging is treated as part of the composite supply at the principal rate. **CA.**
6. **Taxable value** of a line = net + service allocation + packaging allocation.
7. **Tax per line:** for CGST + SGST, `cgst = sgst = mulDivRoundHalfUp(taxable, rate_bp, 20000)`; for IGST, `igst = mulDivRoundHalfUp(taxable, rate_bp, 10000)`. Components are always equal halves; total tax = `cgst + sgst`.
8. **Line total** = taxable + tax. Bill totals are exact sums of line values.
9. **Round-off.** `NEAREST_RUPEE`: `payable = mulDivRoundHalfUp(grand_total, 1, 100) × 100`; `round_off = payable − grand_total` (between −49 and +50 paise), shown as its own untaxed line. `NONE`: `payable = grand_total`. **CA** to confirm round-off presentation.

### 4.4 Inclusive pricing (menu prices already contain GST)

For each line: `taxable = mulDivRoundHalfUp(line_amount, 10000, 10000 + rate_bp)`, `tax = line_amount − taxable`, `cgst = floor(tax / 2)`, `sgst = tax − cgst`. The customer-visible amount never changes, so an odd tax paise goes to SGST. Discounts and service charge are allocated as in 4.3 before this step. **CA.**

### 4.5 Largest-remainder allocation

```
allocate(total, weights[]):
  base[i] = floor(total * weights[i] / sum(weights))
  remainder = total - sum(base)
  give +1 paise to the `remainder` lines with the largest fractional part
  (fraction_i = (total * weights[i]) mod sum(weights)); ties broken by lowest line index
```

Allocations always sum exactly to the total and are deterministic.

### 4.6 Scheme behaviour

| Scheme | Tax shown to customer | Document type | Notes |
| --- | --- | --- | --- |
| REGULAR (5%) | CGST and SGST lines | TAX INVOICE | No ITC; SAC and GSTIN printed |
| SPECIFIED\_PREMISES (18%) | CGST and SGST lines | TAX INVOICE | Owner records the premises declaration; engine uses 1800 bp |
| COMPOSITION | **None.** Payable equals net amount | BILL OF SUPPLY with the statutory declaration | Reports show turnover and the 5% liability estimate for the CA; the bill never shows GST |
| UNREGISTERED | None | BILL (non-GST receipt) | Setup warns that registration may be mandatory above thresholds; CA decides |
| Mixed bill (taxable plus OUTSIDE\_GST items such as alcohol) | Tax only on taxable lines | CA chooses TAX INVOICE or INVOICE-CUM-BILL OF SUPPLY | Template and numbering series are CA decisions |

## 5. Worked examples (recomputed with the exact rules above)

Use these as the first fixtures. Amounts are in paise; ₹ in brackets.

**Example 1 — Standalone restaurant, 5%, exclusive, dine-in, no discount, no service charge.** Lines: Paneer Tikka 26,000 (₹260); Butter Naan 3 × 5,500 = 16,500 (₹165); Masala Chai 2 × 3,000 = 6,000 (₹60). Subtotal 48,500. Half-rate tax per line: 650, **413** (412.5 rounds up), 150. CGST total 1,213; SGST total 1,213; tax 2,426. Grand total 50,926 (₹509.26). Round-off −26. **Payable 50,900 (₹509.00).**

**Example 2 — Same order, 10% discount and 10% service charge (dine-in).** Discount 4,850 allocated 2,600 / 1,650 / 600. Net 23,400 / 14,850 / 5,400 = 43,650. Service charge 4,365 allocated 2,340 / 1,485 / 540. Taxable 25,740 / 16,335 / 5,940 = 48,015. Half-rate tax 644 / 408 / 149 (643.5 up, 408.375 down, 148.5 up). CGST 1,201; SGST 1,201; tax 2,402. Grand 50,417; round-off −17; **payable 50,400 (₹504.00).**

**Example 3 — Flat ₹100 discount with a remainder.** Discount 10,000 over lines 26,000 / 16,500 / 6,000. Floors 5,360 / 3,402 / 1,237 sum 9,999; the 1 paise remainder goes to the largest fraction (.82), line 1, giving 5,361 / 3,402 / 1,237. Net 20,639 / 13,098 / 4,763. Half-rate tax 516 / 327 / 119. Tax 1,924. Grand 40,424; round-off −24; **payable 40,400.**

**Example 4 — Flat ₹100 discount and 5% service charge.** Discount as in Example 3. Service charge 5% of 38,500 = 1,925 allocated 1,032 / 655 / 238. Taxable 21,671 / 13,753 / 5,001. Half-rate tax 542 / 344 / 125. Tax 2,022. Grand 42,447; round-off −47; **payable 42,400.**

**Example 5 — Inclusive pricing, 5%.** (a) Item priced 10,500: taxable 10,000, tax 500, CGST 250, SGST 250, payable 10,500. (b) Item priced 9,900: taxable 9,429 (9,428.57 up), tax 471, CGST 235, **SGST 236**, payable 9,900.

**Example 6 — Specified premises, 18%, exclusive.** One item 85,000. Half-rate tax = 85,000 × 1,800 / 20,000 = 7,650 each. Tax 15,300. Grand and payable 100,300.

**Example 7 — Takeaway with ₹10 per-order packaging, 5%.** Item 26,000; packaging 1,000 allocated to the single line; taxable 27,000; tax 675 + 675; grand 28,350; round-off +50; **payable 28,400.**

**Example 8 — Composition scheme.** Same lines as Example 1. No tax shown. Payable 48,500 (₹485.00). Document: BILL OF SUPPLY with the declaration. The restaurant's own liability of 5% of turnover is reported to the CA, not shown to the customer.

## 6. Invoice and bill-of-supply content

Every issued document stores a snapshot and prints at least:

- Document title: TAX INVOICE, BILL OF SUPPLY, or BILL (non-GST); PRACTICE watermark when in Practice mode.
- Supplier name, address, GSTIN (if registered), state name and code, FSSAI number (show as the CA and food-licence rules require).
- Invoice number and date and time (in the outlet timezone).
- Recipient name, GSTIN and address when the recipient is registered, or when the unregistered recipient's taxable value is ₹50,000 or more.
- Per line: description, SAC, quantity, rate, taxable value, tax rate and CGST and SGST amounts (or IGST).
- Totals: subtotal, discount, service charge (if any), packaging (if any), taxable value, CGST, SGST, round-off, payable, amount in words.
- Place of supply; reverse-charge indicator "No"; computer-generated signature line.
- For composition: the statutory declaration and **no tax columns**.
- Footer text configured by the owner.

### 6.1 Invoice numbering

- Format `{prefix}{FY}{sequence}` with only letters, digits, `-` and `/`, **never longer than 16 characters**, for example `INV/2627/000123`. Validate length when the series is configured.
- Series are separate per document type and may be separate per counter. The financial year runs 1 April to 31 March in the outlet timezone; the sequence resets to 1 at the start of each financial year.
- The number is allocated **inside the same database transaction** that issues the bill, so a failed issue releases nothing and leaves no gap. Voided bills keep their number and appear in the register as VOIDED. Numbers are never reused or edited.
- Do not promise "gapless" as a legal requirement. Promise "consecutive, unique, auditable" and report gaps if any appear.

### 6.2 Small bills

If `consolidated_small_bills` is on (CA decision), bills under ₹200 to unregistered customers who do not ask for an invoice may be recorded and summarised into one consolidated invoice at the close of the day. Default is OFF: every bill gets an individual invoice.

## 7. Voids, refunds and corrections

- **Before a bill is issued:** edit freely; changes after KOT follow the post-KOT approval rules.
- **After issue, same business day, before day close:** a manager PIN and a reason are required. The bill status becomes VOIDED, keeps its number, and a refund record is created for any tender taken. A replacement bill gets a new number.
- **After day close or after the tax period:** the bill is not edited. A **credit note** with its own series, referencing the original invoice, is issued (CA to confirm the legal process and the cut-off). The audit log records who, when and why.
- Refunds are recorded as the outcome of the merchant's own process; Mise moves no money.

## 8. Payments and tenders

- Tenders: CASH, CARD (recorded after the external terminal confirms), UPI (manual confirmation: who confirmed and when, optional reference), VOUCHER, OTHER.
- Multiple tenders per bill are allowed. The sum of non-cash tenders may not exceed the payable amount; cash over-tender is recorded with **change returned**. A bill is PART\_PAID until recorded payments equal payable.
- **Tips** are voluntary, recorded separately from the bill value, are not part of taxable value, and are reported separately. **CA** to confirm treatment if tips are collected on the bill.
- Generating a UPI QR with the exact amount is a convenience only. It is **never** proof of payment. Never read SMS, scrape notifications or accept a screenshot as confirmation.
- Never store card numbers, CVV, UPI PINs or bank credentials.

## 9. Reports derived from tax data

Operational exports for the accountant, **not GST returns**: sales and tax by rate and by day (taxable value, CGST, SGST), document register (invoice numbers, status, voids, gaps), tender summary, discount and service-charge summary, composition turnover and the 5% liability estimate, and CSV with formula-injection escaping. Each export carries the profile, rule versions and the date range.

## 10. Test requirements

**Unit and fixture tests:** all eight worked examples above as exact-match fixtures; boundary amounts (1 paise, 49/50 paise round-off, ₹199.99 and ₹200.00, ₹49,999.99 and ₹50,000.00); zero-quantity rejection; discount larger than subtotal capped; discount of 100%; mixed taxable and OUTSIDE\_GST lines; composition output with zero tax; inclusive and exclusive on the same fixture set; 16-character invoice-number validation.

**Property tests (at least 1,000 random bills per run, fixed seeds recorded):**

- Allocations sum exactly: discount, service charge and packaging allocations equal their totals.
- `grand_total = taxable_total + cgst_total + sgst_total + igst_total` (exclusive) and `taxable + tax = line amount` per line (inclusive).
- `payable = grand_total + round_off` and `|round_off| ≤ 50`.
- Every amount is an integer and non-negative on non-refund bills; CGST equals SGST (exclusive).
- Reordering lines changes only tie-break allocations by at most 1 paise per line and never the totals.
- Recomputing a stored snapshot reproduces the stored values exactly.
- A rate change after issue leaves every issued bill's stored totals unchanged.

**Reconciliation test:** an independent calculator (a separate implementation written in a different style, for example using BigInt) must agree to the paise on all random bills.

## 11. CA review checklist (the gate)

The CA signs a dated record stored in `tax_profiles.review_note` covering: outlet's registration status and scheme; rate and ITC position; price basis; service-charge policy and takeaway exclusion; packaging treatment; rounding rule and round-off presentation; CGST and SGST rounding; SAC code; invoice and bill-of-supply templates; invoice series and financial-year reset; small-bill handling; void and credit-note process; treatment of alcohol and mixed bills; place-of-supply position; tips; FSSAI display; record retention and export. Until signed, the profile stays in Practice mode.

## 12. What Mise must not do

Never claim GST or legal compliance without the signed review; never hard-code a rate; never show GST on a composition bill; never edit an issued bill; never infer payment from a QR; never present a report as a GST return; never rely on an AI agent's reading of tax law. Re-check the law before each major release.
