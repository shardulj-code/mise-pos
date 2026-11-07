MISE

Research, Pilot & Compliance Register

Evidence, assumptions, validation questions and launch gates for India


# Purpose

This register separates verified public-source facts from vendor claims, working assumptions and product recommendations. It is designed to prevent the product team or AI agents from turning uncertain information into hardcoded product behaviour.


# 1. Evidence classification



| Label | Meaning | How to use |

| --- | --- | --- |

| Official source | Government, regulator or platform rule/document. | Use as primary reference, but verify amendments and applicability. |

| Vendor statement | A software company describes its own product/features. | Useful for competitor mapping; not independent proof. |

| Secondary research | Comparison article, market guide or review site. | Use as a lead; verify material facts independently. |

| Pilot observation | Directly observed at a restaurant or hardware test. | Record date, sample and conditions; do not generalise nationally. |

| Assumption | Plausible but unverified product hypothesis. | Must be tested before it becomes a requirement. |

| Decision | Approved product/engineering choice. | Record owner, date and reason in DECISIONS.md. |




# 2. India market and competitor context

The original research pack identifies Petpooja, GoFrugal, Restroworks and CaptainPad as relevant reference products. Current public-source checks show that Petpooja markets a local/on-premise offline POS and positions features such as inventory, reports, kitchen display, captain app and token management across its offering. Therefore, 'offline POS' alone is not a defensible unique selling point.

Petpooja's official pricing page uses plan tiers and a demo/contact flow; exact pricing may vary by region and package. GoFrugal publishes India pricing information with one-time plus annual renewal and subscription options. Do not repeat unverified competitor price claims from blogs as facts.



| Competitor/reference | What public sources support | What remains unknown |

| --- | --- | --- |

| Petpooja | Official site lists restaurant POS plans/features and a separate offline POS proposition. | Exact negotiated price, feature availability by plan, actual offline limitations and hardware compatibility for a particular outlet. |

| GoFrugal | Official India page describes pricing models and implementation/training conditions. | Final quote, renewals, add-on costs and exact feature tier for target customer. |

| Restroworks | Enterprise restaurant platform positioning and extensive feature set. | Small-outlet price and suitability; not the MVP benchmark. |

| CaptainPad | Original research pack records wireless ordering, table and report capabilities based on its prior research. | Public detail and pricing are thin; independently verify before using as a major competitor benchmark. |



Market gap hypothesis: independent outlets may prefer a smaller product with simpler setup, local data ownership and predictable cost. This must be tested through interviews and observed use. No national market-size claim is made in this document.


# 3. Pricing research — use caution

Public vendor pricing can be quote-based, regional, package-specific or inclusive/exclusive of tax. Third-party comparison articles may be outdated or commercially biased. The correct research method is to request written quotes from vendors using the same outlet profile, and record included modules, number of terminals, hardware, onboarding, annual renewal, support, taxes and cancellation/data-export terms.



| Question to ask vendor | Why it matters |

| --- | --- |

| Is price per outlet, terminal, device or user? | Makes comparisons meaningful. |

| What is included in year one and year two? | Reveals renewal/maintenance cost. |

| Are KDS, captain app and token display included? | Avoids comparing base plan to full Mise scope. |

| Is offline billing supported? What still needs internet? | Clarifies true offline boundary. |

| Who owns the data and how is it exported? | Measures switching cost. |

| What printer models are supported? | Tests hardware lock-in and installation risk. |

| What happens when support contract expires? | Reveals operational dependency. |




# 4. Field research plan

Minimum discovery sample: 8–12 outlets across one city/region before freezing the MVP. This is qualitative discovery, not a statistically representative sample of India. Include at least two cafes/bakeries, two dine-in restaurants, two dhabas/family eateries and two takeaway/QSR counters where possible.



| Research activity | Method | Output |

| --- | --- | --- |

| Owner interview | 20–30 minute semi-structured interview. | Current POS, cost, frustrations, buying criteria. |

| Cashier observation | Observe at least one normal and one busy period. | Clicks/taps, search behaviour, bill corrections, training gaps. |

| Kitchen observation | Follow an order from send to ready. | KOT content, station routing, changes/cancellations, delay causes. |

| Hardware inventory | Record printer make/model/connection/driver. | Real compatibility test matrix. |

| Existing bill review | With permission, inspect anonymised sample bill. | Tax fields, receipt layout, local terminology; no personal data. |

| Prototype test | Give an unfamiliar user 3–5 tasks. | Task success, time, errors and confusion. |

| Willingness-to-pay | Ask for price range and compare one-time vs annual. | Price hypothesis; not proof of purchase intent. |




# 5. Interview script

- Tell me how an order moves from customer to kitchen to payment.

- What do you currently use for billing? Why did you choose it?

- Show me the last time the POS caused a problem.

- What happens when the internet stops? What happens when power stops?

- Which printer do you use? Who installed it? What problems occur?

- How are discounts, voids, refunds and staff handovers handled?

- Which reports do you actually check every day or week?

- How do new cashiers learn the system?

- What do you pay today, including software, hardware, support and renewals?

- What would make you switch? What would prevent you from switching?

- If a simple local POS were available, what would you expect to pay once?

- May we observe a real workflow and test a prototype using dummy data?

Do not lead the respondent by pitching the product first. Ask them to demonstrate the current workflow. Record direct quotes separately from researcher interpretation.


# 6. Pilot design

Run a controlled 2–3 week pilot with 2–3 outlets after the internal test gate. Do not put an unverified tax configuration or untested printer path into live service. Initially run Mise in parallel with the existing system or in a demo/shadow process; only switch live billing after owner and CA approval.



| Pilot phase | Duration | Activities / gate |

| --- | --- | --- |

| Preparation | 2–3 days | Menu setup, hardware test, staff training, sample bills, backup/restore. |

| Shadow operation | 3–5 service days | Compare orders/bills with current POS; no reliance on Mise as sole record. |

| Limited live use | 5–10 service days | Only after tax/printer/backup checks; founder available for support. |

| Review | 1–2 days | Analyse errors, task times, support load, willingness to continue/pay. |




# 7. Pilot scorecard



| Measure | Record | Pass condition |

| --- | --- | --- |

| Setup duration | Start/end time, blockers | Median improves across pilots; target set after first observation. |

| Training time | Time to complete standard tasks without help | Cashier completes order and bill correctly. |

| Order accuracy | Mismatch count and cause | No unexplained mismatch. |

| Billing arithmetic | Independent recalculation sample | All tested bills reconcile to paise. |

| Print reliability | Jobs submitted, confirmed, failed, unknown, duplicates | No silent loss or duplicate issue; physical reliability measured. |

| Offline behaviour | Router disconnected / internet unavailable | Core local workflow remains functional as specified. |

| Recovery | App restart, power interruption, backup restore | No silent corruption; restore proven. |

| Support burden | Founder interventions per outlet/week | Support burden documented before pricing decision. |

| Retention intent | Would outlet continue using it? Why? | Evidence of real usage, not only positive feedback. |

| Willingness to pay | Price asked, objections, actual paid pilot if applicable | At least one real commercial signal before price finalisation. |




# 8. India GST and invoice compliance register

Official CBIC Rule 46 lists tax invoice particulars including supplier name/address/GSTIN, consecutive serial number unique for a financial year, issue date, recipient details in applicable cases, HSN/SAC, description, quantity where applicable, value and tax particulars. The complete rule and current amendments must be reviewed before implementing invoice templates.

The software must support distinct document profiles, including tax invoice and bill of supply where relevant. Composition taxpayers cannot collect GST from customers as tax and issue a bill of supply; exact eligibility and treatment must be confirmed by the CA for the outlet.



| Compliance area | Implementation requirement | Approval required |

| --- | --- | --- |

| Tax registration profile | Registered regular / composition / unregistered or applicable profile, as legally appropriate. | CA confirms outlet status. |

| Invoice vs bill of supply | Select correct document type and content based on profile. | CA confirms template. |

| GST rates and classification | Configurable effective-dated rules; no universal hardcoded rate. | CA confirms classification/rates. |

| SAC/HSN | Store applicable code and description. | CA confirms code and applicability. |

| Place of supply | Define intra/inter-state treatment only where applicable. | CA review. |

| Discounts and charges | Document how discount, service charge, packaging and other charges affect taxable value. | CA review. |

| Rounding | One documented arithmetic rule; reconcile to invoice total. | CA review. |

| Invoice sequence | Unique consecutive serial number/series for financial year; retain audit history. | CA review of sequence and correction process. |

| Credit/debit notes and voids | Do not erase issued invoices; support legally appropriate correction records. | CA review. |

| Record retention/export | Provide readable data exports and backup; confirm retention obligations. | CA/legal review. |



Do not rely on an AI agent's interpretation of GST law. The app should store the tax configuration and the approving CA's review date/name/notes. Re-check legal updates before each major release.


# 9. UPI and payments register

NPCI's public FAQ explains that merchants are onboarded through an acquiring bank/partner and describes QR, intent, app-based and collect integration modes. Mise MVP should record UPI payment manually after the merchant verifies receipt. Automated payment integration is a separate project requiring an acquirer/PSP relationship, technical documentation, compliance and testing.

- Do not generate a generic QR and label it an officially onboarded merchant integration.

- Do not mark payment complete because the customer displays a screenshot.

- Record the operator who manually confirmed UPI and optional transaction reference.

- Never collect UPI PIN, bank login, card number or CVV.

- Refunds and reversals must follow the merchant/acquirer process; POS records the outcome but does not move funds in MVP.


# 10. Privacy and data minimisation

- Customer name and phone are not required to create a bill unless the restaurant has a lawful, operational reason.

- Do not collect customer details by default for analytics or marketing.

- Provide a clear purpose when personal data is entered and restrict access to it.

- Do not send customer details, sales records or bills to AI services.

- Do not put real customer data into development prompts, screenshots, test fixtures or public issue trackers.

- Have an India-qualified privacy/legal reviewer assess applicable data-protection obligations before customer-data features or cloud sync are launched.


# 11. Technical risk register



| Risk | Severity | Mitigation / gate |

| --- | --- | --- |

| Thermal printer incompatibility | Critical | Physical spike; tested-model registry; no universal compatibility claim. |

| Host computer failure | High | Safe DB transactions, startup recovery, backup and restore; later evaluate secondary host. |

| Tax misconfiguration | Critical | CA-approved profiles; versioning; sample bill sign-off; explicit setup warning. |

| Duplicate bill/KOT on retry | High | Idempotency keys, print job states, explicit reprint. |

| Incorrect money arithmetic | Critical | Integer paise, pure functions, property tests, independent reconciliation. |

| AI agent scope drift | High | Master prompt, milestone gating, review prompt, decision log. |

| One-time revenue insufficient | High | Pilot support-cost measurement, transparent upgrade policy, pricing experiments. |

| Windows version / dependency changes | Medium | Pin dependencies, test installer on clean machine, update cadence. |

| LAN phone client complexity | Medium/High | Defer; separate HTTPS/security/connectivity spike. |

| Backup theft or loss | High | Access controls, optional encryption, external backup, restore drills. |




# 12. Launch gates



| Gate | Required evidence | Status before evidence |

| --- | --- | --- |

| Product discovery | 8–12 interviews/observations and prioritised findings. | OPEN |

| MVP workflow | End-to-end order-to-payment tests. | OPEN |

| Tax | CA-approved profiles and invoice/bill-of-supply samples. | BLOCKED until reviewed |

| Printer | Physical print tests for exact model/driver/OS combinations. | BLOCKED until tested |

| Backup | Successful restore on clean machine. | BLOCKED until tested |

| Security | Electron IPC review, dependency audit, PIN and permission tests. | OPEN |

| Pilot | 2–3 outlets complete controlled pilot and review. | OPEN |

| Commercial | Price, support, updates, data export, terms and privacy reviewed. | OPEN |




# 13. Research sources and links

- CBIC — CGST Rules, Rule 46: https://taxinformation.cbic.gov.in/content-page/explore-rules/1000136/1000001

- CBIC — GST invoice rules: https://cbic-gst.gov.in/gst-invoice-rules.html

- GST Council — restaurant services background material: https://gstcouncil.gov.in/sites/default/files/2024-04/restaurantservices_vns-i.pdf

- NPCI — UPI FAQs and merchant onboarding: https://www.npci.org.in/what-we-do/upi/faqs

- NPCI — BHIM UPI Guidelines, June 2026: https://www.npci.org.in/uploads/BHIM_UPI_Guidelines_2026_012a0b1bce.pdf

- NPCI — UPI circulars: https://www.npci.org.in/circulars/upi

- Petpooja — official pricing/features: https://www.petpooja.com/poss/pricing

- Petpooja — offline POS: https://www.petpooja.com/offline-pos

- GoFrugal — India pricing: https://cdn.gofrugal.com/plans-pricing.html?business=1&dptype=cloud

- Electron — security checklist: https://www.electronjs.org/docs/latest/tutorial/security

- Node.js — release status: https://nodejs.org/en/about/previous-releases


# 14. Decision log template

    # Decision: <short title>

    Date: YYYY-MM-DD

    Status: Proposed | Approved | Rejected | Superseded

    Owner: <person>

    ## Context

    What problem or constraint requires a decision?

    ## Options considered

    A.

    B.

    C.

    ## Decision

    What was chosen?

    ## Consequences

    Benefits, trade-offs, risks and future migration cost.

    ## Evidence

    Links, pilot observations, tests or source documents.

    ## Review trigger

    What new evidence would cause us to revisit this decision?