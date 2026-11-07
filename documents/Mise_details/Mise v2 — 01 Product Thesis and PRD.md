# Mise v2 — 01 Product Thesis and PRD

**Document 01 of 05 · Version 2.0 · 07 November 2026**

> Read Document 00 first for the reading order, precedence rules, assumptions and decisions. This document explains **what Mise is, for whom, and exactly how it behaves** from the first launch to the monthly audit.

## 1. Executive summary

Mise is a point-of-sale and restaurant-management system for independent Indian restaurants, cafes, bakeries and dhabas. It runs on the devices a restaurant already owns: a laptop or PC at the counter and the phones and tablets of the staff. It keeps working when the internet is down because nothing in the daily workflow depends on the internet.

The central idea is the **Organisation**. The first time anyone opens Mise they either **Create an organisation** (on the restaurant's main computer, the Hub) or **Join an organisation** (on any other device). Creating an organisation produces four secret join codes, one for each way a device can be used:

| Code | Device role | What the device does |
| --- | --- | --- |
| **Kitchen** | Kitchen screen and kitchen printer owner | Shows incoming orders, tracks preparation, triggers printing of kitchen tickets |
| **Order Taking** | Waiter phone or tablet | Takes orders at tables and sends them to the kitchen |
| **Counter** | Cashier terminal | Raises the final bill, applies GST and discounts, records payment, prints the bill |
| **Manager** | Manager's phone, tablet or laptop | Daily, weekly and monthly audits, menu changes, pantry, staff, printer health |

Many devices can join with the same code. Each gets its own revocable credential, and staff still sign in with personal PINs. Network printers are registered by their local IP address and monitored continuously, and every bill is computed in integer paise with GST handled as versioned, auditable data.

**The thesis in one paragraph.** Many small restaurants do not need a cloud ERP. They need orders that never get lost between the waiter and the kitchen, a bill that is arithmetically and legally correct, a printer that visibly works or visibly fails, an owner who can see what happened today without trusting anyone's memory, and a pantry that does not quietly leak money. They value predictable cost, local data ownership and a system that survives a router outage. This is a hypothesis to test with real operators in the pilot, not a proven market fact. Offline billing alone is not a differentiator, because incumbents advertise it too; the differentiators Mise tests are simple setup by codes, honest hardware status, accurate and editable GST, a built-in Ask bar and pantry audits, and owner-held data.

## 2. Customers and jobs to be done

| Segment | Fit | Notes |
| --- | --- | --- |
| Small dine-in restaurant | Primary | Tables, KOT, split bills, waiters on phones |
| Cafe or bakery | Primary | Fast counter billing, modifiers, takeaway |
| Dhaba or family eatery | Primary pilot | Simple menu, low training, resilient to outages |
| QSR or takeaway counter | Secondary | Token flow; validate after counter billing is stable |
| Cloud kitchen | Later | Aggregator workflows are out of scope |
| Chains, fine dining, hotels | Out of scope for v2 | Need central consoles, reservations, integrations |

Roles are **permissions, not headcount**. One person may be owner, manager and cashier. The app must never force five staff accounts.

| User | Job to be done | Failure today |
| --- | --- | --- |
| Owner | Know bills, cash and stock are right without being there all day | Opaque reports, pilferage, missing stock |
| Manager | Control discounts, voids, stock and shift close | No audit trail, weak accountability |
| Cashier | Settle a bill fast and correctly | Wrong tax, slow search, unclear discounts |
| Waiter | Record the table's order exactly | Handwritten chits, missed notes, lost orders |
| Kitchen | See what to cook and what changed | Illegible tickets, duplicates, late cancellations |

## 3. Principles

1. **Billing and orders are the core.** Every other module exists to support them and must never block them.
2. **Local first.** Order entry, kitchen tickets, billing, printing and day close work with no internet.
3. **Honest status.** Never claim a print, a payment or a backup succeeded without evidence. Unknown is a valid state.
4. **No lost orders, no duplicate bills.** Every command is idempotent; printing is a side effect, not the source of truth.
5. **Money is integer paise.** Tax rules are data with effective dates; issued bills are immutable snapshots.
6. **No dead ends.** Every error explains what happened and offers a next action.
7. **Small surface per role.** A waiter sees ordering; a kitchen device sees tickets; the manager sees audits. Modules are off until needed.
8. **Plain language, three languages.** English, Hindi, Marathi; Hinglish accepted in search.
9. **Data minimisation.** Customer details are optional; no card numbers, ever.
10. **Never replace the CA.** Tax behaviour is configured by the restaurant and approved by their accountant.

## 4. The Organisation model

### 4.1 Concepts

- **Organisation:** one restaurant outlet's private group of devices, users, menu, tables, printers, tax profile, pantry and history. v2 supports exactly one outlet per Organisation.
- **Hub:** the computer on which the Organisation was created. It stores the database, runs the local server, talks to printers and serves the client app to other devices on the restaurant network.
- **Device:** any phone, tablet or computer that joined using a module code.
- **Module code:** a secret, high-entropy code that authorises a device to join in exactly one role. It never grants access to another role.
- **User:** a person with a name, role and PIN. A device identifies *where* an action happened; the user identifies *who* did it.

### 4.2 First launch screen

On first launch every device sees two large choices:

- **Create an organisation** (only offered on a device that can act as a Hub: a computer with the desktop app installed).
- **Join an organisation** (every device).

A phone or tablet opening the web client offers only **Join an organisation** unless the person explicitly installs the desktop Hub app.

### 4.3 Create an organisation: step by step

1. Enter restaurant name, address, phone, state (needed for GST), optional GSTIN and FSSAI number.
2. Create the **owner account**: name and a 4–6 digit PIN, with a recovery procedure shown and confirmed (Document 02 section 7.6).
3. Choose the **tax profile** (regular 5%, specified premises 18%, composition, or "not registered"), with a clear note that the profile must be confirmed with the restaurant's CA before real billing. Until confirmed, the Hub runs in **Practice mode**: bills are watermarked PRACTICE and excluded from reports.
4. Choose the operating mode: dine-in, takeaway or counter, or both. Add tables and sections if dine-in.
5. Add stations (for example Kitchen, Bar, Tandoor, Dessert) and optionally a starter menu or import a menu file.
6. **Generate module codes.** The Hub shows four cards, one per module, each with its code, a QR code, a device count and Copy, Share, Rotate and Revoke actions. The owner can print a **setup sheet** (A4) with the four QR codes for staff.
7. Register printers (see section 8) and run the pre-service check.
8. Run a guided practice order and bill; set the backup destination and perform a test backup.

### 4.4 Join an organisation: step by step

1. The device must be on the same Wi-Fi or LAN as the Hub. The Join screen offers three ways to find the Hub: **scan the QR** on the setup sheet or Hub screen, **automatic discovery** on the local network, or **enter the Hub address** (for example `192.168.1.20:8443`) by hand.
2. Enter or scan the **module code**. The device shows which role it will join as and the restaurant name for confirmation.
3. Name the device (for example "Waiter phone 2" or "Kitchen tablet").
4. The Hub checks the code, then either approves automatically or asks the owner to **approve** (always required for the Manager code; configurable for others).
5. The device receives its own credential and opens the role's home screen. Staff then sign in with their PINs.

Wrong, expired or revoked codes produce a plain message ("This code is no longer valid. Ask the owner for a new one.") and are rate-limited.

### 4.5 Managing codes and devices

The owner's Hub console has a **Devices** screen listing every device: name, role, last seen, app version and status (Online, Offline, Pending approval, Revoked). Actions: approve, rename, revoke, and **rotate a role's code** (new code issued; devices already joined stay joined; the old code stops working). A lost phone is handled by revoking that device only. All of this is audit logged.

## 5. The complete restaurant workflow

### 5.1 Setup day

Create the organisation → tax profile (CA confirmation) → tables and stations → menu (manual or import) → printers on the network with test slips → staff and PINs → join devices with codes → pantry items (optional) → practice order and bill → backup test.

### 5.2 A normal service, end to end

| Step | Actor and device | What happens | If it goes wrong |
| --- | --- | --- | --- |
| 1 | Waiter, Order Taking device | Opens a table, sets guest count, adds items using search, categories and short codes; picks variants, modifiers (required ones enforced), quantity and notes | Unavailable items cannot be added and show why; repeated taps never duplicate lines |
| 2 | Waiter | Taps **Send to kitchen**. The Hub creates one KOT per station | If Wi-Fi drops, the command waits in the device's outbox with its idempotency key and sends when reconnected; the screen shows "Not sent yet" |
| 3 | Hub | Saves the order and KOT first, then queues print jobs | A printer failure never loses the order; the KOT shows PRINT\_FAILED with a fix |
| 4 | Kitchen device | New ticket appears with sound; chef taps Start, then Ready; allergens are highlighted | Ticket never disappears until served or cancelled with a reason |
| 5 | Waiter | Receives "Ready" notice; serves; may add items later. Changes after sending produce a visible ADDED, CHANGED or CANCELLED delta ticket | A cancelled-after-send item always shows to the kitchen; post-send voids need manager approval |
| 6 | Counter device | Opens the table's bill preview: lines, discount, service charge if enabled, packaging for takeaway, GST split, rounding | Discount above the user's limit asks for a manager PIN and reason |
| 7 | Cashier | Issues the bill (immutable snapshot with the next invoice number). Records payments: cash, card (after the terminal confirms), UPI (after the merchant confirms receipt), vouchers; split tenders allowed | A QR on screen is never proof of payment; manual UPI confirmation records who confirmed and when |
| 8 | Hub | Prints the bill through the counter printer. Prints are marked ISSUED or REPRINT | Failed or unknown print is shown honestly; reprints are explicit and need manager approval |
| 9 | Cashier or Hub | Table becomes Free once billed and paid | Part-paid bills stay open with the outstanding balance |

### 5.3 Table operations

- **Split bill:** move selected items to child sub-bills (by item, by seat, or equally by N people); KOT history is preserved.
- **Merge tables:** combine two active sessions into one; item-level waiter metadata is retained.
- **Transfer table or tab:** move an open order to another table without closing it.
- **Course-wise fire (Phase 3):** hold mains until starters are served; held items appear greyed on the kitchen screen and do not start timers until fired.

### 5.4 Daily, weekly and monthly audit (Manager device)

The Manager device is the control room: **Today** (sales, tenders, open tables, discounts and voids, printer health, backup age), **This week**, **This month** and **Custom range**, each exportable. Audits cover sales and tax by slab, tender reconciliation, item sales, discounts, voids, reprints, cancelled KOTs, staff activity, pantry variance and wastage, and the audit log itself (see Document 04).

### 5.5 Day close

A **blind close**: the cashier enters physical counts for each tender before the system shows expected totals; the Hub computes variance, requires a reason above the configured tolerance, locks the business day and prompts a backup. Reopening a closed day needs the owner and is audit logged.

## 6. The service catalogue: what a POS provides and where Mise stands

This table is the result of analysing what restaurant POS products offer (Petpooja, GoFrugal, Restroworks, CaptainPad and the roadmap in your PDF). **Core** ships in the first pilot release; **Module** is optional and off by default; **Later** is designed but not built; **No** is deliberately excluded for now.

| Service area | Capability | Status |
| --- | --- | --- |
| Organisation | Create or join, module codes, device approval and revocation | Core |
| Order types | Dine-in, takeaway, counter (quick bill); delivery as an order type without aggregator integration | Core |
| Tables | Table map, states (Free, Ordering, Cooking, Ready, Billed), sections, guest count | Core |
| Order entry | Search, categories, short codes, variants, modifiers (required rules), notes, quantity | Core |
| KOT | Per-station tickets, revisions, ADD/UPDATE/CANCEL deltas, reprint marking | Core |
| Kitchen display | Ticket columns, timers, bump, sound, allergen highlighting, wake-lock | Core |
| Billing | Preview, discount (flat or percent) with permission thresholds, service charge toggle, packaging charge, round-off | Core |
| GST engine | 5% and 18% restaurant profiles, composition bill of supply, CGST/SGST/IGST, inclusive or exclusive prices, effective-dated rules | Core, CA gate |
| Invoices | Tax invoice and bill of supply series per financial year, immutable snapshots, void and credit-note records | Core, CA gate |
| Payments | Cash, card (recorded), UPI manual confirmation, vouchers, split tenders, partial payments | Core |
| Printing | Network printers by IP, Windows-queue printers, test slips, print queue, honest states, reprint | Core |
| Printer health | Reachability, status query, confirmed test, pre-service check, plain-language fixes | Core |
| Menu management | Categories, items, variants, modifiers, availability toggle, price changes, CSV import, archive | Core |
| Staff and roles | PIN sign-in, permission matrix, lockout, manager approval | Core |
| Audit log | Append-only record of privileged actions | Core |
| Reports | Daily, weekly, monthly, tender, item, discount and void reports; CSV export | Core |
| Day close | Blind close, Z-report, variance reasons | Core |
| Backup and restore | Scheduled backup, checksum, tested restore | Core |
| Ask bar | Search across everything, commands, help, diagnostics | Module, early |
| Assistant (chatbot) | Optional AI helper with the owner's key | Module, optional |
| Pantry | Items, units, vendors, purchases, wastage, counts, expiry, recipe deduction, alerts | Module |
| Purchase orders | Par-level suggestions, receiving, weighted average cost | Module, later |
| Table split, merge, transfer | See section 5.3 | Core (split), Core (merge, transfer) |
| Course-wise fire | Hold and fire stages | Later |
| Customers and loyalty | Optional phone capture, visit count | Later |
| QR table ordering | Customers order from their phones | No (post-v2) |
| Aggregators | Swiggy or Zomato order feed and menu sync | No (post-v2) |
| Payment gateway | Automatic UPI and card confirmation | No (needs acquirer) |
| Multi-outlet and cloud sync | Central console | No (post-v2) |
| Reservations | Booking calendar | No |

## 7. Screens by device role

Every screen has loading, empty, error and success states. No screen is more than two levels deep. A search bar (the **Ask bar**) is present at the top of every screen and opens with `/` or `Ctrl+K`.

### 7.1 Order Taking (waiter)

Bottom navigation on phones: **Tables**, **Orders**, **Ready**, **Search**. Table map with state icons and running totals; order screen with category rail, search, line list and a sticky **Send to kitchen ₹…** button.

### 7.2 Kitchen

Full-screen ticket board in dark theme: columns **New**, **Cooking**, **Ready**; ticket timers turning amber then red at set thresholds; station filter; sound toggle; shows only the station's items. Prints are managed by the Hub; this screen shows each ticket's print state and a manual **Reprint** (with a marked REPRINT label).

### 7.3 Counter (cashier)

**Open bills**, **Take-away quick bill**, **Payments**, **Day close**. Bill sheet with full GST preview, discount, charges, payments and print state.

### 7.4 Manager

**Today**, **Audit** (week, month, custom), **Menu**, **Pantry**, **Staff**, **Printers**, **Devices**, **Tax**, **Settings**, **Backups**.

### 7.5 Hub console (owner)

All Manager functions plus organisation settings, module codes, device approvals, tax profile approval record, backups and restore, language and the Assistant switch.

## 8. Printers by network IP

- A printer is registered with: display name, **IP address and port** (default 9100) or a Windows queue name, **role** (Bill or a station), paper width (58 or 80 mm), code page and optional cash-drawer wiring.
- The Hub shows a **health badge** per printer: **Working** (a confirmed test slip or a recent successful job with an OK status), **Needs attention** (unreachable, offline, paper out, cover open, reported error) or **Unknown** (never tested, or no reply).
- **How the check works:** the Hub opens a TCP connection to the IP and port with a short timeout (reachable or not), then sends the printer a status request where the model supports it, then relies on a **test slip the operator confirms** as final proof. Reachable means "something answered"; it does not mean paper is present.
- Checks run at start-up, every few minutes while idle, after any failed job and from a **Pre-service check** button. The Manager device shows all badges and the last check time.
- Plain fixes are shown for each failure: paper finished; cover open; printer off or unplugged; cannot reach 192.168.x.x (rescan or re-enter the IP); IP changed (suggest a fixed IP or DHCP reservation on the router); garbled output (raw-mode guide).
- **Printing rule:** KOTs print at the station's printer; bills print at the counter printer. If a station's printer is down, the ticket stays on the kitchen screen and queues for print; a **fallback printer** can be assigned.
- Ambiguous jobs are never silently retried; the operator chooses **Reprint**.

## 9. GST and billing behaviour (summary; full rules in Document 03)

- Money is integer paise; rates are basis points. Standalone restaurants use 5% (2.5% CGST + 2.5% SGST) without ITC; restaurants at specified hotel premises use 18% (9% + 9%) with ITC; composition-scheme outlets issue a **bill of supply** with the statutory declaration and **do not show or collect GST**.
- Service charge, packaging charge and discounts are explicit settings with documented effect on taxable value.
- Inter-state treatment (IGST) is supported by the engine but disabled until the CA approves a place-of-supply rule.
- Each issued bill stores the full tax-rule snapshot. Later rate changes never alter it.
- Invoice numbers are consecutive within a financial year and no longer than 16 characters (for example `A/25-26/000123` style); the series and prefix are configurable.
- Below-₹200 consolidated-invoice handling is a CA-reviewed option, off by default.

## 10. Roles and permissions matrix

Permissions belong to roles; the Hub enforces them in the service layer, not just the screen.

| Action | Owner | Manager | Cashier | Waiter | Kitchen |
| --- | --- | --- | --- | --- | --- |
| Create order, add items, send KOT | Yes | Yes | Yes | Yes | No |
| Change KOT status (start, ready) | Yes | Yes | No | No | Yes |
| Cancel an item before KOT | Yes | Yes | Yes | Yes | No |
| Void an item after KOT | Yes | Yes | Needs manager PIN | Needs manager PIN | No |
| Issue bill, record payment | Yes | Yes | Yes | No | No |
| Discount within user's limit | Yes | Yes | Yes (limit) | No | No |
| Discount above limit | Yes | Yes | Needs manager PIN | No | No |
| Reprint a bill | Yes | Yes | Needs manager PIN | No | No |
| Open cash drawer without sale | Yes | Yes | Needs manager PIN | No | No |
| Void an issued bill | Yes | Needs reason | Needs manager PIN | No | No |
| Run day close | Yes | Yes | Yes | No | No |
| Edit menu and prices | Yes | Yes | No | No | No |
| Toggle item availability | Yes | Yes | Yes | No | Yes (86 an item) |
| Manage pantry and purchases | Yes | Yes | No | No | No |
| Change tax profile | Yes | No | No | No | No |
| Manage users and devices | Yes | Limited | No | No | No |
| View audit and reports | Yes | Yes | Own shift | No | No |
| Backup and restore | Yes | Backup only | No | No | No |

## 11. State models

| Object | States | Rules |
| --- | --- | --- |
| Table | FREE, ORDERING, COOKING, READY, BILLED | Derived from the open order, never edited by hand |
| Order | OPEN, SENT, IN\_PROGRESS, READY, SERVED, BILLED, CANCELLED | Explicit transitions; no hard delete |
| KOT | QUEUED, PRINTED, PRINT\_FAILED, ACKNOWLEDGED | Each send or change creates a revision with ADD, UPDATE or CANCEL lines |
| Bill | DRAFT, ISSUED, PART\_PAID, PAID, VOIDED | ISSUED is immutable |
| Payment | PENDING, RECORDED, FAILED, REFUNDED, REVERSED | Manual UPI records the confirming user |
| Print job | PENDING, SENDING, SUBMITTED, FAILED, UNKNOWN | SUBMITTED is not proof of paper |
| Device | PENDING, ACTIVE, REVOKED | Revoked devices lose access immediately |
| Business day | OPEN, CLOSED | Closed days are locked; reopening is audited |

## 12. Failure scenarios and required behaviour

| Scenario | Required behaviour |
| --- | --- |
| Internet down | Nothing changes for billing, KOT or printing |
| Wi-Fi drops on a waiter phone | Orders buffer locally with idempotency keys; the phone shows its sync state; resend on reconnect without duplicates |
| Wi-Fi router fails | Clients cannot reach the Hub; the Hub's own Counter screen still works; printing to LAN printers fails and shows honestly |
| Hub restarts or crashes | Database recovers from the write-ahead log; clients reconnect automatically; no issued bill lost |
| Hub powered off | Clients show "Hub unavailable"; waiters may keep drafting orders locally for a short window (Document 02 section 9); nothing reaches the kitchen until the Hub is back, so the restaurant must have a paper fallback |
| Kitchen printer offline | Ticket stays on the kitchen screen, print job FAILED or UNKNOWN, manager sees the badge; fallback printer used if configured |
| Duplicate tap | Idempotency key prevents a second order, KOT, bill or payment |
| Item cancelled after send | Delta ticket with reason reaches the kitchen; manager PIN required |
| Price or tax changed mid-day | Existing orders and issued bills keep their snapshots; new orders use the new data |
| Device lost | Owner revokes that device; its credential stops working at once |
| Wrong module code | Rejected with a plain message and rate limiting |
| Manager forgets PIN | Owner recovery procedure; no universal backdoor |

## 13. Release plan

| Release | Contents | Gate |
| --- | --- | --- |
| R0 Discovery and spikes | Research notes, printer spike, LAN client spike, CA engagement | Go or no-go recorded |
| R1 Core pilot | Organisation and devices, menu, ordering, KOT and kitchen, billing with GST, payments, printing and printer health, reports, day close, backup | Tax, printer, restore gates cleared |
| R2 Control | Ask bar, audits on the Manager device, pantry basics (items, purchases, wastage, counts), alerts | Pilot feedback |
| R3 Depth | Recipes and auto-deduction, FEFO and expiry, purchase orders, course-wise fire, optional AI assistant | Owner approval |
| Later | Loyalty, QR ordering, aggregators, multi-outlet, cloud | Separate projects |

## 14. Success criteria

| Metric | Target | Measured by |
| --- | --- | --- |
| Setup from first launch to first bill | Under 20 minutes at first, aiming for 10 | Observed on clean install |
| Device join | Under 60 seconds per device | Timed test |
| New waiter completes an order after a short tour | Yes | Unfamiliar-user task test |
| Five common items added | Under 20 seconds | Timed test |
| Bill arithmetic | Zero unexplained mismatches; every sample bill reconciles to the paise | Independent recalculation |
| KOT reliability | No silent loss; failed prints visible within 5 seconds | Compare events to paper |
| Printer health accuracy | No printer labelled Working without a confirmed test | Review of status logic |
| Recovery | Clean-machine restore proven | Recorded checksum |
| Continued use | Owner keeps using it after the trial | Observed usage |

## 15. Risks and what Mise must never claim

Key risks: printer variety (critical), tax misconfiguration (critical), Hub single point of failure (high), phone browser limits on plain HTTP (medium to high), duplicate prints or bills on retry (high), AI-agent scope drift (high), one-time revenue not funding support (high). Mitigations are in Document 02 section 12 and Document 05.

Mise must never claim: GST or legal compliance without CA sign-off; universal printer support; that a reachable IP means a working printer; that UPI is verified because a QR was shown; that a backup is proven before a restore passes; that the system works fully offline where a feature needs internet.
