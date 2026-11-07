MISE

Product Thesis & Product Requirements

India-only restaurant POS | Founder, product, design and operational reference | Version 1.0


# Document control



| Field | Value |

| --- | --- |

| Product | Mise POS (working name; name clearance not performed) |

| Document purpose | Explain the product, market hypothesis, user problems, scope, workflows, product rules and release strategy. |

| Audience | Founder, product designer, developer, restaurant pilot partners and AI coding agents. |

| Status | Working baseline for discovery and MVP planning; not a claim of market validation or legal certification. |

| Geography | India only for initial release. |

| Last reviewed | 07 November 2026 |

| Source baseline | User-provided Mise POS Research Summary and AI Build Prompts Pack, supplemented by current public-source checks. |




# How to use this document

Read this document before making product or architecture decisions. It defines what Mise is and is not. The Technical Blueprint defines how the MVP should be implemented. The AI Agent Build Handbook contains the prompts and execution protocol. The Research, Pilot & Compliance Register records assumptions that must be tested or reviewed.

If documents conflict, follow this order: (1) an explicitly approved decision in docs/DECISIONS.md, (2) this Product Thesis for product scope, (3) the Technical Blueprint for implementation constraints, (4) the Agent Handbook for execution mechanics. An AI agent must stop and ask rather than silently invent a product rule.


# Executive summary

Mise is a locally operated point-of-sale application for small, single-outlet restaurants in India. Its first release focuses on fast menu-based billing, order tracking, kitchen order tickets, basic table service, configurable Indian tax settings, payment recording, end-of-day summaries and reliable local backups. It is designed to keep core billing usable without internet access.

Mise is not initially a cloud restaurant ERP, aggregator integration platform, accounting package, inventory-management suite, CRM, loyalty platform or multi-outlet control centre. Those directions may be evaluated later, but they are explicitly outside the first release.

The product thesis is that many small restaurant operators value predictable billing, simple daily workflows, local data control, hardware compatibility and transparent ownership more than a long list of advanced modules. This is a hypothesis to validate with real restaurant operators, not a proven national market fact.

The build strategy is deliberately conservative: one Windows host computer, one local database, one operator-facing application, optional local printer support after a technical proof, and no cloud dependency for the first usable release. Multi-device phone ordering is deferred until the single-machine workflow is stable.


# 1. Product definition

Working name: Mise POS. The name is provisional and must be checked for trademark, domain and app-name conflicts before public launch.

One-sentence definition: Mise is an offline-first billing and order-management application for independent Indian restaurants that want a straightforward POS on their existing Windows computer.

Product promise: Set up your menu, take an order, send it to the kitchen, collect payment and close the day without needing a cloud account or monthly software subscription.

The product should feel calm, legible and dependable. The interface should prioritise the next operational action, not dashboards or decorative analytics.


# 2. India-first target customer



| Segment | Initial fit | Reason / constraint |

| --- | --- | --- |

| Small dine-in restaurant | Primary | Needs menu billing, tables, KOTs and split/partial payment handling. |

| Cafe / bakery | Primary | Needs quick counter billing, modifiers, takeaway and simple receipts. |

| Dhaba / family eatery | Primary pilot candidate | Needs simple menu, low training burden and resilient local operation. |

| QSR / takeaway counter | Secondary | Token workflow may matter; test after counter billing is stable. |

| Cloud kitchen | Later | Delivery aggregator integration and dispatch workflows add complexity. |

| Multi-outlet chain | Out of scope for v1 | Requires centralised administration, synchronisation, permissions and support. |

| Fine dining / hotel | Out of scope for v1 | Reservations, service workflows, complex billing and integrations expand scope. |



Initial ideal customer profile: one independent outlet, owner or manager involved in daily operations, a Windows PC or laptop available at the billing counter, a manageable menu, and willingness to use a local application. The product must not assume that the restaurant has a dedicated IT person.


# 3. Problem statement and jobs to be done



| User | Job to be done | Current failure to investigate |

| --- | --- | --- |

| Owner | Know that bills, cash and daily totals are correct. | Opaque reports, staff errors, missing cash, difficult setup. |

| Cashier | Create and settle a bill quickly. | Too many screens, slow item search, unclear discounts/tax. |

| Captain / waiter | Record table orders accurately. | Handwritten notes, missed modifiers, unclear order status. |

| Kitchen staff | See what to prepare and what changed. | Illegible KOTs, duplicate tickets, late cancellation updates. |

| Manager | Control discounts, voids and shift close. | Weak audit trail and unclear accountability. |



Do not assume every restaurant needs every role. A single cashier may perform several jobs. Roles in the application should be permissions, not a requirement to create five separate staff accounts.


# 4. Product principles

- Billing is the core product. Every other feature must support a real restaurant workflow.

- Offline means core data entry, bill calculation, order state and local printing do not require internet. It does not mean UPI payment confirmation, cloud backup or online integrations work offline.

- One outlet and one host computer are the initial operating model. Do not introduce distributed-system complexity before it is needed.

- Use plain language. Show the next action and explain failures with a practical recovery step.

- Never silently lose an order, duplicate a bill or claim a payment/print succeeded without evidence.

- Prefer existing hardware and open formats. Do not require a proprietary printer, tablet, payment terminal or cloud account.

- Make tax behaviour configurable and auditable; never present the app as a substitute for a CA.

- Keep customer personal data optional and minimal.

- Every feature must have a testable acceptance criterion and an explicit out-of-scope boundary.


# 5. Scope: MVP, next release and non-goals



| MVP — must build | After MVP — validate first | Explicitly not in v1 |

| --- | --- | --- |

| Menu categories/items/variants/modifiers | Phone/tablet captain ordering over LAN | Swiggy/Zomato integrations |

| Quick dine-in and takeaway billing | Customer token display | Online ordering marketplace |

| Basic table list/status | Stock-lite and recipe costing | Full inventory/ERP |

| KOT generation and kitchen queue | Loyalty/customer history | Automated WhatsApp campaigns |

| Cash, card-recorded and UPI-manual payment status | Advanced sales analytics | Payment gateway / acquiring integration |

| Configurable GST/tax profiles with CA-reviewed templates | QR table ordering | Multi-outlet central console |

| Discounts, void/refund records and audit log | AI-assisted menu import and insights | AI required for core functions |

| Daily close and basic reports | Cloud backup integration | Cloud account required to bill |

| Local backup, restore and CSV export | Licence/paid upgrade mechanism | DRM or online activation in MVP |

| Printer setup/test for one verified path | Additional printer transports and hardware registry | Promise universal printer compatibility |



Scope gate: the MVP is not complete merely because screens exist. It is complete when an operator can configure a menu, create a real order, send a KOT, issue a correctly configured bill, record payment, close the day, back up data and restore that data on a clean installation.


# 6. Primary workflow — restaurant setup

1. Install the Windows application from a signed or clearly identified installer.

1. Create the owner PIN and record the recovery procedure.

1. Enter restaurant name, address and optional GSTIN/FSSAI details.

1. Choose the tax profile only after confirming it with the restaurant's accountant/CA. The software must allow an appropriate non-GST setup where applicable.

1. Create or import categories and menu items. Validate prices and tax categories.

1. Choose operating mode: counter/takeaway, dine-in, or both. This is a workflow preset, not a different product build.

1. Configure tables only if dine-in is enabled.

1. Select an installed printer and print a test receipt/KOT. If printer support is not verified, show the limitation clearly and allow a non-printing demo workflow.

1. Create staff PINs and assign minimum permissions.

1. Run a sample order and sample bill. Confirm the receipt layout and tax configuration before live use.

1. Set the backup destination and perform a test backup/restore.


# 7. Primary workflow — order to payment



| Step | Actor / screen | System behaviour | Failure handling |

| --- | --- | --- | --- |

| 1. Start order | Cashier; New Order | Choose dine-in table or takeaway/counter. | Do not create duplicate open orders on repeated taps. |

| 2. Add items | Menu screen | Search, category browse, choose variant/modifiers, set quantity and notes. | Unavailable items cannot be added; show reason. |

| 3. Review | Order summary | Show line items, quantities, notes, subtotal and estimated tax where configured. | Changing menu price must not rewrite existing order line price snapshots. |

| 4. Send to kitchen | Cashier/captain | Create KOT and immutable KOT revision/delta record. | If print fails, keep order and mark KOT print pending/failed; never discard order. |

| 5. Prepare | Kitchen queue | Show ticket, items, modifiers, age and state: New / Preparing / Ready / Served where applicable. | KOT updates must identify added, changed or cancelled lines. |

| 6. Bill | Cashier | Create bill from order snapshot; apply permitted discount; calculate taxes from active versioned rule. | Validate rounding and totals in integer paise. |

| 7. Record payment | Cashier | Record cash/card/UPI status; split tenders if supported in MVP. | UPI QR display is not proof of payment. Manual confirmation must be explicit. |

| 8. Close | Cashier/manager | Mark bill paid/part-paid as allowed; close table/order; issue receipt. | Paid bill is immutable; corrections use void/refund/credit-note workflow as approved. |

| 9. Day close | Manager/owner | Summarise sales, tenders, cash expected, voids/discounts and backup status. | Require explanation for cash mismatch; preserve audit events. |




# 8. Order and bill state model



| Object | Allowed states | Rules |

| --- | --- | --- |

| Order | OPEN, SENT, IN_PROGRESS, READY, SERVED, BILLED, CANCELLED | State transitions are explicit; a cancelled order retains its audit history. |

| KOT | QUEUED, PRINTED, PRINT_FAILED, ACKNOWLEDGED (if supported) | Print submission is not equivalent to successful physical printing. |

| Bill | DRAFT, ISSUED, PART_PAID, PAID, VOIDED | Issued bill snapshots are immutable. Never edit issued totals in place. |

| Payment | PENDING, RECORDED, FAILED, REFUNDED, REVERSED | Manual UPI confirmation must record who confirmed and when. |

| Printer job | PENDING, SENDING, SUBMITTED, FAILED, UNKNOWN | Do not automatically retry ambiguous jobs without duplicate-protection policy. |




# 9. Billing, tax and money rules

All money is stored as integer paise. UI formatting may show ₹ with two decimals where appropriate, but arithmetic must never use binary floating-point values. Define a single tested money/tax calculation module.

- Tax configuration must be selected by the outlet and verified by its CA. Do not hardcode a single GST rate for all restaurants or all transactions.

- Support a tax profile and effective date/version. Each issued bill stores a snapshot of the applied rule and line tax amounts.

- Support CGST/SGST split for intra-state supplies and IGST where legally applicable, only after the required place-of-supply logic is defined and reviewed.

- Composition-scheme businesses issue a bill of supply and cannot collect GST as tax from customers. Do not show the same invoice flow for all tax profiles.

- Service charge, packaging charge, discounts, inclusive/exclusive tax and rounding must be explicit configuration options with test cases. Do not ship ambiguous defaults.

- Invoice number series must be unique for the financial year and follow applicable legal requirements. Do not promise gapless numbering as a legal requirement.

- Store tax rule source, effective date, editor and change reason. Previously issued bills remain unchanged.

Compliance note: This document is product/engineering guidance, not legal or tax advice. A qualified Indian CA must review each tax profile, invoice template, tax calculation, rounding and correction workflow before commercial deployment.


# 10. Payment handling — realistic boundary

MVP payment recording is not a payment gateway. Cash is recorded by the cashier. Card is recorded as a tender after the external terminal transaction is completed. UPI may be recorded manually after the cashier verifies receipt in the merchant's bank/acquirer app or statement.

A QR code can carry merchant and amount information if configured through an appropriate acquiring-bank/merchant arrangement. Generating or displaying a QR does not confirm that money arrived. Do not scrape payment notifications, read personal SMS, or infer success from the customer screen.

Automated payment status, refunds, settlement and reconciliation require an approved payment/acquirer integration and separate security/commercial review. They are out of MVP.


# 11. User experience and visual direction

Design direction: warm neutral surfaces, charcoal text, one restrained saffron accent, clear status icons, high-contrast controls and large tabular numerals for money. The design should feel like dependable business software, not a flashy SaaS dashboard.

- Minimum 16px body text where practical; primary touch targets at least 44–48px.

- Keyboard and mouse operation must work on a Windows counter PC. Touch operation is a bonus, not an assumption that every device is a tablet.

- Keep the main order flow to: choose order type/table → add items → send/continue → bill/payment.

- Search must support partial item names and common local spellings; multilingual search can be expanded after real menu tests.

- Use icons plus text for statuses; never communicate status by colour alone.

- Every screen has loading, empty, error and success states.

- Confirm destructive actions; provide undo where safe; require a manager PIN and reason for voids and privileged discounts.

- Provide a demo-data mode that cannot accidentally mix with live restaurant data.


# 12. Roles and permissions



| Role | Can do | Cannot do by default |

| --- | --- | --- |

| Owner | All settings, users, menu, tax profile, reports, backups, audit log. | No restriction except destructive actions are confirmed and logged. |

| Manager | Daily operations, discounts within limits, void/refund workflow, shift close. | Change owner PIN, tax profile, backup encryption key or remove audit records. |

| Cashier | Create orders, send KOT, bill and record payments. | Change tax settings, change menu prices, void paid bills without approval. |

| Kitchen | View KOTs, update preparation status. | See sales reports, payment details or customer contact data. |

| Captain (later) | Create/edit orders for assigned tables. | Access billing settings or owner reports. |




# 13. Reports in MVP

- Daily sales summary: gross sales, discounts, tax, net sales, bill count.

- Payment summary: cash, card, UPI manual-confirmed, other tenders and outstanding amounts.

- Item sales: quantities and sales value by item.

- Voids and discounts: user, amount, reason and timestamp.

- Day-close summary: expected cash, counted cash and variance.

- Export to CSV for the outlet's accountant. PDF can follow once layout and printing are stable.

Avoid claims that a POS report is a GST return, accounting ledger or tax filing. It is an operational export that must be reconciled with the accountant's records.


# 14. Backup, data ownership and recovery

- Database is stored locally on the host computer.

- Create an automatic daily backup and allow a manual backup before tax/menu changes.

- Support backup to a user-selected local folder or USB drive. Cloud-synced folders are user-managed and not a product dependency.

- Backups must be versioned and include schema version, creation time, outlet identifier and integrity checksum.

- Restore must be tested on a clean data directory. A backup that has never been restored is not proven.

- Export menu, bills and reports in documented formats. Do not trap customer data in a proprietary format.

- Warn when the last successful backup is older than the configured threshold.


# 15. Success metrics and pilot criteria



| Metric | Pilot target | How measured |

| --- | --- | --- |

| Setup time | Median under 20 minutes initially; aim for under 10 after onboarding refinement. | Observe setup from clean install. |

| Cashier training | A new cashier can complete a basic order after a short guided session. | Task test with someone unfamiliar with app. |

| Order speed | Five common menu items added in under 20 seconds after training. | Timed usability test. |

| Billing correctness | Zero unexplained mismatches in pilot sample. | Reconcile app bill against independently calculated expected total. |

| KOT reliability | No silent lost KOT; failed print is visible. | Compare order events and physical tickets. |

| Recovery | Restore test succeeds on a clean machine. | Record test result and dataset checksum. |

| Daily use | Owner/cashier chooses to continue using it after trial. | Interview and observed usage; not just stated interest. |




# 16. Risks and explicit assumptions



| Risk / assumption | Why it matters | Mitigation / validation |

| --- | --- | --- |

| Windows host is available | Initial architecture depends on it. | Interview target outlets; test low-spec Windows hardware. |

| Thermal printer compatibility | Models/drivers vary significantly. | Run printer spike with actual local devices; publish tested matrix only. |

| No internet required for core | Local operations still depend on power and host hardware. | Power-loss recovery and backup tests; no claim of zero downtime. |

| One-time purchase can fund maintenance | Updates and support continue after sale. | Test willingness to pay; define update/support policy before launch. |

| Tax configuration can be safely generic | Tax treatment depends on registration and supply facts. | CA review; versioned profiles; no universal default. |

| AI agent output is reliable | Agents may hallucinate, omit edge cases or alter scope. | Tests, acceptance criteria, review prompts, small commits and human approval. |




# 17. What Mise must never claim

- Never claim GST/legal compliance without a CA review of the exact configuration and invoice output.

- Never claim every thermal printer is supported.

- Never claim UPI payment is verified merely because a QR was generated or customer showed a screenshot.

- Never claim backups are safe until restore tests pass.

- Never claim the system is fully offline if a particular feature still depends on internet.

- Never claim that AI coding agents can deliver a production-safe POS without human testing and restaurant pilots.


# 18. Glossary



| Term | Meaning |

| --- | --- |

| POS | Point of Sale; software used to record orders, bills and payments. |

| KOT | Kitchen Order Ticket; instruction sent to a kitchen station. |

| SKU / item code | Short identifier used to search a menu item. |

| Tender | Payment method recorded against a bill. |

| Void | Cancellation of an issued bill under controlled, audited rules. |

| Paise | Integer subunit of INR; ₹1 = 100 paise. |

| Host | The primary Windows computer running the local application and database. |

| MVP | Minimum viable product; smallest usable release that validates the core problem. |

| CA | Chartered Accountant. |




# References and source notes

The original user-provided research pack is the starting point, not an independently validated market study. Public-source checks below support specific points only. Vendor pages are vendor claims; independent pilot evidence is still required.

- CBIC, Central Goods and Services Tax Rules, 2017 — Rule 46 (tax invoice particulars): https://taxinformation.cbic.gov.in/content-page/explore-rules/1000136/1000001

- CBIC GST invoice rules: https://cbic-gst.gov.in/gst-invoice-rules.html

- NPCI UPI FAQ — merchant onboarding and payment integration: https://www.npci.org.in/what-we-do/upi/faqs

- NPCI BHIM UPI Guidelines, June 2026: https://www.npci.org.in/uploads/BHIM_UPI_Guidelines_2026_012a0b1bce.pdf

- Petpooja official pricing/features (prices may be quote-based or region-specific): https://www.petpooja.com/poss/pricing

- Petpooja offline POS claims: https://www.petpooja.com/offline-pos

- GoFrugal India pricing page: https://cdn.gofrugal.com/plans-pricing.html?business=1&dptype=cloud

- Market pricing guides are secondary sources and should be treated as indicative, not definitive: https://servyn.in/guides/free-restaurant-pos-india/