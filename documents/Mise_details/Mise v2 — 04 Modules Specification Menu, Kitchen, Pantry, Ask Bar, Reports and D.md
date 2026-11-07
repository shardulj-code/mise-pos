# Mise v2 — 04 Modules Specification: Menu, Kitchen, Pantry, Ask Bar, Reports and Day Close

**Document 04 of 05 · Version 2.0 · 07 November 2026**

> This document specifies the functional modules in enough detail to build and test them. Document 01 says *what the product is*; Document 02 says *how it is built*; Document 03 owns *every money and tax rule*. Where a module touches money, it calls the engine in Document 03 and invents nothing.

## 1. Menu management

### 1.1 Who and where

Owner and Manager edit the menu on the Manager device or the Hub console. Cashiers and kitchen staff may only toggle availability ("86" an item). Changes appear on every device through live events within a second or two.

### 1.2 Entities and fields

| Entity | Fields | Rules |
| --- | --- | --- |
| Category | name (en, hi,), sort order, active | Archived, never deleted, once any item in it was ever ordered |
| Item | name (en, hi, ), short code, description, base price (paise), tax category, station, veg or non-veg mark, allergen tags, available, archived, image (optional, local) | Short code unique; price non-negative integer paise; tax category mandatory |
| Variant | name (Half, Full, Small, Large), price (absolute paise or delta) | At least one default |
| Modifier group | name, min and max selections, required flag | A required group blocks the item from entering a KOT until chosen |
| Modifier | name, price delta (paise), available | Negative deltas allowed only for explicit "remove" style modifiers |
| Allergen tags | Peanut, Gluten, Shellfish, Dairy, Egg, Soy, Tree nut, Sesame, Fish | Shown high-contrast on the kitchen screen and printed tickets |
| Combo (later) | components and price | Not in the first release |
| Time-based availability (later) | breakfast, lunch, dinner windows | Not in the first release |

### 1.3 Behaviour rules

1. **Price changes are not retroactive.** Open order lines keep their snapshot price; new lines use the new price. The edit screen says so.
2. **Archive, don't delete.** Archived items vanish from ordering but stay in history and reports.
3. **Availability toggle** is one tap, takes effect everywhere, is logged, and can be set by the kitchen when stock runs out. An unavailable item cannot be added, and the waiter sees "Not available" with the reason.
4. **Required modifiers** (for example spice level) are enforced before an order line can be sent to the kitchen.
5. **Station routing** decides which kitchen ticket and printer receives the line.
6. **Price edits** record before and after, the editor and an optional reason. Large changes (configurable percentage) ask for the Manager PIN. Tax category changes are Owner-only because they change tax.
7. **Bulk price change:** select items or a category, apply a percentage or fixed change, preview every new price, confirm, and undo within the session. All rounding is to whole paise using the engine's rounding rule.
8. **Inline editing** with no separate edit pages; edits autosave with a clear "Saved" indicator; destructive actions show an undo toast.

### 1.4 Import and export

CSV (and Excel where practical) import with a **column-mapping step**, a **preview table** with row-level errors fixable inline, and an exact summary: rows read, valid, imported, skipped with reasons.

Sample columns: `category, item_name_en, item_name_hi, item_name_mr, short_code, price_rupees, tax_category, station, veg, allergens, variants, available`.

Validation: price parsed as a decimal string and converted to integer paise without floating point ("125.50" → 12550; reject more than two decimals); duplicate short codes flagged; empty names rejected; unknown tax category or station flagged; invalid rows never block valid ones. Imported text is escaped on display. Export uses the same columns with formula-injection escaping.

### 1.5 Acceptance

300-row import completes in under 2 seconds with a correct summary; malformed fixtures (bad prices, duplicate codes, empty names, unknown tax category) produce exact row messages; editing a price never changes any open or issued bill; archived items remain in historical reports; two managers editing the same item get a conflict message, not a silent overwrite.

## 2. Kitchen module (KOT, kitchen screen, printing hand-off)

### 2.1 Ticket creation

On **Send**, the Hub creates one **KOT per station** containing the new lines. Each KOT has a number, the table, order type, waiter, time, guest count and, per line, quantity, item, variant, modifiers, notes and allergen flags. Changes after sending create a **revision** whose lines are tagged `ADD`, `UPDATE` (quantity or note change) or `CANCEL` (with reason); only the delta is shown or printed, headed **ADDED**, **CHANGED** or **CANCELLED**.

### 2.2 Kitchen screen

- Columns **New**, **Cooking**, **Ready**; large cards; dark theme by default; each ticket shows order type, table, elapsed time and allergen banners.
- Timers turn **amber then red** at owner-set thresholds (defaults: 10 and 20 minutes, to be tuned in the pilot).
- One tap each to **Start**, **Ready** and (if enabled) **Served**. A **Recall** returns a ticket to the previous column with a logged reason.
- **Allergen confirmation:** a ticket with a critical allergen flag requires the chef to tap "Allergen seen" before it can be started; the confirmation is logged.
- A cancelled-after-send item shows prominently and requires **acknowledge** so it cannot be missed.
- A sound plays for new tickets (mutable); the kitchen can toggle **86 item**. Station filter and a station-only view are available.
- Each ticket shows its **print state** (Queued, Printed, Failed, Unknown) and a **Reprint** button marking the reprint.
- Keeping the screen awake uses the Wake Lock API where the context allows it; otherwise the setup guide tells staff how to set the tablet's screen timeout or kiosk mode.

### 2.3 Printing hand-off

Ticket creation and printing are separate. The ticket is saved and visible on screen first; the print job is queued to the station's printer and its state is attached to the ticket. A failed print never removes or hides a ticket.

### 2.4 Acceptance

An item cancelled after sending always reaches the kitchen screen and printer as a CANCEL line; two stations produce two tickets routed to two printers; a printer that is off yields FAILED or UNKNOWN visibly within seconds while the screen still shows the ticket; no duplicate ticket is created by a double tap; the screen works at 360 px and on a 10-inch tablet.

## 3. Pantry module (raw-material stock and grocery audit)

### 3.1 Purpose and promises

The pantry module records what was **bought**, what was **used**, what was **wasted** and what is **physically on the shelf**, so that the owner can see where stock and money go. It is optional, off by default, available to Owner and Manager only, and **it never blocks ordering or billing**.

### 3.2 Units and precision

- Every pantry item has a **base unit**: `g`, `ml` or `pc`, plus a display **stock unit** (kg, l, packet, dozen) with a conversion factor expressed as an integer ratio.
- Quantities are stored as **integers** (for example grams, or millilitres, or thousandths of a piece) and never as floating-point numbers. A fixed scale of 1,000 per stock unit is used when fractional amounts are needed.
- Costs are integer paise per stock unit. Cost of a quantity = `mulDivRoundHalfUp(qty_milli, cost_paise, 1000)`.

### 3.3 Entities

| Entity | Key fields |
| --- | --- |
| Pantry item | name (en, hi, mr), category (vegetables, dairy, dry goods, spices, meat, beverages, packaging, other), base unit, stock unit, conversion, par level, reorder quantity, shelf-life days, active |
| Vendor | name, phone (optional), notes, items supplied with vendor SKU, unit cost, MOQ, typical lead time |
| Purchase | vendor, date, invoice reference, lines (item, quantity, unit cost, batch id, expiry date), total, status |
| Batch (lot) | item, batch id, received date, expiry date, initial quantity, remaining quantity, unit cost |
| Stock movement (ledger) | item, batch, type, quantity delta, cost, reference (purchase, KOT line, wastage, count, adjustment), user, time |
| Recipe | menu item or variant, lines (pantry item, quantity per portion, yield factor in basis points) |
| Wastage record | item, batch, quantity, category, note, user, time |
| Stock count | date, scope, counted lines, variance, reason codes, status |

### 3.4 The ledger

Stock is derived from an **append-only movement ledger**. On-hand quantity of an item is the sum of its movements. Nothing edits or deletes a movement; mistakes are corrected with a reversing movement and a reason. Movement types: `PURCHASE`, `CONSUMPTION`, `CONSUMPTION_REVERSAL`, `WASTAGE`, `COUNT_ADJUSTMENT`, `TRANSFER_IN` and `OPENING_BALANCE`.

### 3.5 Receiving purchases

The manager records a purchase (or receives against a purchase order in the later phase): vendor, items, quantities, unit costs, batch and expiry. Receiving creates `PURCHASE` movements and batches and updates the item's **weighted average cost**: `new_wac = (old_qty × old_wac + received_qty × unit_cost) / (old_qty + received_qty)`, computed in integer paise with the engine's rounding rule inside one transaction. A **cost variance** flag appears when a unit cost differs from the last by more than a configured percentage.

### 3.6 Recipes and automatic deduction (R3)

- Each menu item or variant may have a recipe. **Yield factor:** the net quantity needed from stock is `portion_qty × 10000 / yield_bp` (for example 85% trimming yield needs more raw weight).
- **When stock is deducted:** at **KOT creation**, one `CONSUMPTION` movement per recipe line for each KOT line (as in the roadmap), linked to the KOT line.
- **If a line is cancelled before cooking starts**, a `CONSUMPTION_REVERSAL` returns the quantity. **If cancelled after cooking started**, no reversal is made and the quantity is recorded as `WASTAGE` with the cancellation reason.
- **Batch choice is FEFO:** consume from the batch that expires first and is not expired.
- **Never block billing.** If no valid batch has enough stock (or the only batch is expired), the order and KOT proceed. The system records the consumption as **uncovered** against the item, raises an alert to the manager and shows it in the pantry variance report. This resolves a conflict between the roadmap's "hard-lock" idea and the product rule that billing is never blocked (decision D-113).
- Items without a recipe consume nothing automatically; the pantry is then a purchases, wastage and counts ledger ("stock-lite").

### 3.7 Expiry and alerts

| Alert | Condition | Action |
| --- | --- | --- |
| Amber | Batch expires within 48 hours (configurable) | Appears on Manager "Today"; suggests using it in a daily special |
| Red | Batch has expired | Excluded from automatic consumption; manager must record it as wastage (EXPIRED) or a count adjustment |
| Low stock | On-hand below par level | Listed with a suggested purchase quantity |
| Uncovered consumption | Recipe consumption with no valid batch | Counts and items listed for follow-up |
| Cost spike | Unit cost above the configured change threshold | Flag on receiving |

### 3.8 Wastage and non-revenue use

Categories: **Expired**, **Prep spoilage or burnt**, **Dropped or damaged**, **Staff meals**, **Promotional samples**, **Other (note required)**. Each record reduces stock through a `WASTAGE` movement, stores who recorded it and appears in its own report so that explained loss is separated from unexplained shrinkage.

### 3.9 Counts and audits (the grocery audit)

- **Schedule:** daily spot counts for high-value or high-risk items, weekly counts by category, monthly full count. The Manager device lists what is due.
- **Blind count:** the counter enters physical quantities **before** seeing the system quantity. Quantities are entered in the stock unit with the number pad; partial counts can be saved and resumed.
- **Variance:** `variance = counted − system_on_hand_at_count_time`. Lines beyond the tolerance (percentage or value, configurable per category) need a **reason code** (Spillage, Miscount, Theft suspected, Supplier short delivery, Unrecorded wastage, Recipe inaccuracy, Other).
- **Posting:** approving the count (Manager PIN) creates `COUNT_ADJUSTMENT` movements. History is never edited.
- **Audit math for any period:** `opening + purchases − recipe consumption − recorded wastage − closing count = unexplained variance`. The report ranks items by value of unexplained variance.

### 3.10 Purchase orders (R3)

**Par-level suggestion:** `suggested_qty = max(0, par_level − on_hand + expected_consumption_during_lead_time)` where expected consumption comes from the average of recent days. The manager reviews, adjusts, groups by vendor and shares the list (print or message text). Receiving against a PO checks quantity and cost and updates WAC. Mise does not send orders to vendors automatically in v2.

### 3.11 Screens

Mobile-first list with search and short codes; quick-count mode with a large number pad; expiry board; wastage quick-entry with category chips; purchase entry; variance review; vendor directory. Everything is reachable from the Ask bar ("count rice", "add purchase", "expiring items").

### 3.12 Acceptance

On-hand always equals the sum of ledger movements; a purchase updates WAC exactly in paise; FEFO picks the soonest unexpired batch; an expired batch is never consumed automatically; billing succeeds when stock is missing and an uncovered-consumption alert appears; cancelled-before-cooking reverses stock; a count creates adjustments without altering history; the audit equation balances to the unit on fixtures; permissions exclude everyone but Owner and Manager.

## 4. Ask bar and assistant (search, commands, help, chatbot)

### 4.1 What it is

A search bar at the top of every screen (shortcut `/` or `Ctrl+K`; optional microphone) with three layers, **all deterministic and offline** by default:

1. **Search** across items, tables, open bills, past bills, customers (if enabled), pantry items, settings, screens and help articles.
2. **Commands** that act, always after a preview with **Confirm** or **Cancel**.
3. **Help and diagnostics** that answer "how do I…" and "something is wrong".

The **assistant** (the chatbot panel) is the same engine shown as a conversation. With AI switched off it answers from the help library and command registry. With AI switched on it can also interpret free text the parser missed (section 4.6).

### 4.2 Navigation and search

Typing "printer" opens Printers; "pantry" opens Pantry; "bill 123" finds invoice 123; "pt" finds Paneer Tikka by short code; partial and misspelt names match (fuzzy), including Hinglish spellings such as "paneer​ tikka", "chai" and "cha". Ranking: exact short code, prefix, fuzzy name, then recent. Results are **filtered by the user's permissions**; a waiter never sees reports or tax settings.

### 4.3 Command grammar

A command has a verb, entities and options, resolved with synonyms in English, Hindi, Marathi and Hinglish. Examples:

| Phrase | Meaning | Needs |
| --- | --- | --- |
| `table 4 add 2 chai` | Add 2 Masala Chai to table 4's order | Order-taking permission |
| `bill table 4` | Open the bill preview for table 4 | Counter permission |
| `split table 4 by 3` | Equal split of the bill into three | Counter permission |
| `86 paneer` | Mark Paneer unavailable | Manager, Cashier or Kitchen |
| `today sales` | Show today's sales card | Manager or Owner |
| `best sellers this week` | Item ranking | Manager or Owner |
| `low stock` or `expiring` | Pantry alerts | Manager or Owner |
| `printers` or `check printers` | Open printer health or run the pre-service check | Manager or Owner |
| `change price paneer tikka 280` | Propose a price change with a before and after card | Manager (PIN above threshold) |
| `kitna sale aaj` (Hinglish) | Same as `today sales` | Manager or Owner |

Rules: **every data-changing command shows a preview card and needs Confirm**; commands execute through the same service layer and permission checks as the screens (no side door); ambiguity produces a short choice list; unknown input falls back to search with a "did you mean…" suggestion; each module registers its own commands in a **command registry** with its synonyms, parameters, permission and handler.

### 4.4 Help library

A bundled, searchable set of short how-to articles in three languages ("how do I add a printer", "how do I give a discount", "how do I join a device") that can open the right screen and highlight the button. Articles are versioned with the app and written from real screens, not from memory of competitors.

### 4.5 Diagnostics

"Something is wrong" runs checks and lists fixes: printer health and IP reachability, last backup age, devices offline or pending approval, Hub disk space, clock drift, database integrity check status, queued or failed print jobs, and unsynced client outboxes. Each failed check shows a plain-language cause and a button for the next action.

### 4.6 Optional AI assistant

- **Off by default.** The owner enables it with their own API key, stored encrypted on the Hub; a global kill switch removes it entirely.
- It receives the **minimum** data: the user's text, the command registry, and menu or pantry names where needed. It never receives customer names or phone numbers, PINs, tokens, payment details, or sales data unless the owner explicitly enables insight sentences, and a screen shows exactly what will be sent before first use.
- It can only **propose** commands from the registry or draft text; the user confirms every change; AI output is visibly labelled.
- Billing, KOT, printing, GST and day close never call it. With AI off or offline, nothing breaks.
- It must not give tax or legal advice; for such questions it points to the CA review process and the specification.

### 4.7 Acceptance

A test file of at least 40 phrases (English, Hindi, Marathi, Hinglish, typos) resolves to the expected command or navigation target; role filtering is proven for each role; every mutating command shows a preview; unknown input never executes anything; diagnostics detect a simulated unreachable printer, stale backup and offline device.

## 5. Reports and audits

All reports are computed from **issued bills, payments, audit events, KOTs and stock movements**, never from separate running counters. The business day follows the outlet timezone and configured day-start. Practice-mode bills are excluded. Every report has date-range chips (Today, Yesterday, This week, This month, Custom), a plain-language one-sentence summary, a simple chart and CSV or PDF export.

### 5.1 Manager "Today" screen

Sales so far, bill count, average bill, tenders, open tables, ready-but-unserved tickets, discounts and voids so far, printer health badges, devices online, last backup age, pantry alerts, and a **Needs attention** list.

### 5.2 Report catalogue

| Report | Definition |
| --- | --- |
| Sales summary | Gross sales (subtotal), discounts, service charge, packaging, taxable value, tax by component, round-off, net payable, bill count |
| Tender summary | Totals per tender; outstanding on part-paid bills; tips separately |
| Tax summary for the CA | Taxable value and CGST and SGST by rate and day; document register with gaps and voids; composition turnover and the 5% estimate |
| Item sales | Quantity and value per item, category and station; best and worst sellers; combined with recipe cost when available |
| Hourly rush | Bills and covers by hour |
| Table turnover | Average time from first order to payment |
| Waiter performance | Orders, covers, average bill, discounts given, voids requested |
| Discounts and voids | Every discount over zero and every void with user, approver, reason and amount |
| Reprints and no-sale drawer opens | List with approver and reason |
| Cancelled-after-send items | Item, time, user, approver, reason, whether cooking had started |
| Printer incidents | Failed or unknown jobs, downtime per printer |
| Device and access log | Joins, approvals, revocations, failed code attempts |
| Pantry reports | Stock on hand and value, low stock, expiry, wastage by category, purchases by vendor, cost variance, count variance, unexplained variance, recipe versus actual |
| Day-close history | Expected versus counted by tender, variance, reasons |

### 5.3 Weekly and monthly audit views

The weekly and monthly views present trends versus the previous period, a top-ten of exceptions (largest discounts, most voids, most reprints, largest pantry variances), and a checklist the manager ticks (backup verified, counts done, tax summary exported to the CA). The export bundle is a single dated archive of the CSV files and a PDF summary.

### 5.4 Fraud and control signals ("Needs attention")

Configurable thresholds trigger a flag, never an accusation: voids above a count or value, discounts above a percentage, repeated reprints, no-sale drawer opens, KOT items that were never billed, items cancelled after cooking started, large cash variances, unusually high wastage, off-hours activity. Each flag links to the underlying records.

### 5.5 Audit log viewer

Searchable, filterable by user, device, action and date; shows before and after values and reasons; exportable; cannot be edited or deleted through the application.

### 5.6 Acceptance

Report totals equal independent recomputation from bill records to the paise; a void or refund changes the right totals; multiple tenders reconcile; a 100,000-bill fixture returns each report in under 300 ms with indexes; the day boundary is correct around midnight and a 4 a.m. day start.

## 6. Shifts and day close

- A **shift** opens with an opening cash float and closes by the cashier or manager.
- **Blind close:** the cashier enters physical counts for each tender (cash by denomination, card slips total, UPI total from the merchant app, vouchers) **before** expected values are revealed.
- The Hub computes `variance = counted − expected` per tender; variances beyond tolerance need a reason code.
- Closing locks the business day's bills and payments, prints or exports the **Z-report** and prompts a backup.
- Reopening a closed day is Owner-only, requires a reason and writes an audit event. Late payments after close go into the next business day with a note.

## 7. Staff, devices and settings

- **Users:** name, role, PIN (4 to 6 digits, no all-same or simple sequences), active flag, discount limit, optional photo. Owner adds and removes users; Managers add Waiters, Cashiers and Kitchen staff.
- **Sign-in:** fast user switching by tapping a name and entering the PIN; auto-lock after a configurable idle time; five wrong attempts cause a timed lockout.
- **Devices:** see Document 01 section 4.5 and Document 02 section 4.
- **Language:** per user, English, Hindi or Marathi; receipts have their own language setting.
- **Theme and accessibility:** light and dark; kitchen defaults to dark; text at least 16 px; touch targets at least 48 px; colour never the only status signal; keyboard operable on desktop; respects reduced motion.
- **Backups, tax profile, printers, modules:** Owner-controlled settings with confirmation and audit.

## 8. Cross-module acceptance matrix

| Scenario | Expected result |
| --- | --- |
| Two waiters add items to the same table at once | Both sets appear once; no duplicates |
| Wi-Fi off on a waiter phone for 30 seconds, then on | Outbox replays; one order, one KOT |
| Hub restarts mid-order | No lost order; clients reconnect and resync |
| Kitchen printer unplugged during service | Ticket stays on screen; badge turns Needs attention; plugging back lets the operator reprint once |
| Menu price changed while a table is open | That table keeps its price; new orders use the new price |
| Waiter cancels a cooked item | Manager PIN, reason, kitchen sees CANCEL, stock logged as wastage |
| Cashier discount above limit | Manager PIN, reason, audit row, report shows the approver |
| Revoke a lost phone | Its next request is rejected; it disappears from the Devices list as Revoked |
| Month-end audit | Sales and tax reports match bill records; pantry audit equation balances; exports include the CA bundle |
