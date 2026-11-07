# Mise POS — Complete Master Document

**The Affordable, Self-Service Restaurant Management System for India**

> Version 3.0 · 07 November 2026 · This document is the single source of truth for understanding, explaining, and building Mise from scratch.

---

## Table of Contents

1. [What is Mise?](#1-what-is-mise)
2. [The Problem We Solve](#2-the-problem-we-solve)
3. [Competitor Landscape & Our Edge](#3-competitor-landscape--our-edge)
4. [Business Model — Build Free, Charge for Service](#4-business-model--build-free-charge-for-service)
5. [Architecture — Zero-Cost Tech Stack](#5-architecture--zero-cost-tech-stack)
6. [The Organisation Model](#6-the-organisation-model)
7. [Complete Workflow — End to End](#7-complete-workflow--end-to-end)
8. [Module Specifications](#8-module-specifications)
9. [GST & Billing Engine](#9-gst--billing-engine)
10. [Chatbot & Ask Bar — Our Customer Support](#10-chatbot--ask-bar--our-customer-support)
11. [Printer & Hardware Integration](#11-printer--hardware-integration)
12. [UI/UX Design Philosophy](#12-uiux-design-philosophy)
13. [Screen-by-Screen Specification](#13-screen-by-screen-specification)
14. [Data Model](#14-data-model)
15. [Security & Permissions](#15-security--permissions)
16. [AI Agent Build Prompts](#16-ai-agent-build-prompts)

---

## 1. What is Mise?

**Mise** (French culinary term: *"everything in its place"*) is a **real-time, offline-first restaurant management and point-of-sale system** designed for independent Indian restaurants, cafés, bakeries, and dhabas.

### One-Sentence Pitch
> A free, self-service POS that runs on your existing devices, works without internet, replaces expensive subscriptions with a one-time payment, and uses a built-in chatbot instead of a call centre.

### What Makes Mise Different

| Attribute | Petpooja / GoFrugal / CaptainPad | **Mise** |
|---|---|---|
| **Pricing** | ₹12,000–₹50,000/year recurring | **One-time payment** (owner sets update charges) |
| **Customer support** | Call centres, ticket systems | **Built-in chatbot + Ask Bar** (self-service) |
| **Internet dependency** | Most features need internet | **100% offline for core billing** |
| **Setup complexity** | Trained technician visits | **Scan a QR code, start in 10 minutes** |
| **Data ownership** | Stored on vendor's cloud | **Your data stays on your computer** |
| **Device requirement** | Proprietary tablets | **Any phone, tablet, or laptop you already own** |
| **Multi-device** | Per-device licensing | **Unlimited devices via module codes** |

---

## 2. The Problem We Solve

### Who Is Our Customer?

| Segment | Fit | Why |
|---|---|---|
| Small dine-in restaurant (10–50 covers) | **Primary** | Needs tables, KOT, split bills, waiters on phones |
| Café / bakery | **Primary** | Fast counter billing, modifiers, takeaway |
| Dhaba / family eatery | **Primary pilot** | Simple menu, low training, survives outages |
| QSR / takeaway counter | **Secondary** | Token flow; validate after counter billing |
| Cloud kitchen | **Later** | Aggregator workflows out of current scope |
| Chains, fine dining, hotels | **Out of scope** | Need central consoles, reservations, integrations |

### Jobs To Be Done

| User | What They Need | What Fails Today |
|---|---|---|
| **Owner** | Know bills, cash, stock are correct without being there | Opaque reports, pilferage, missing stock |
| **Manager** | Control discounts, voids, stock, shift close | No audit trail, weak accountability |
| **Cashier** | Settle a bill fast and correctly | Wrong tax, slow search, unclear discounts |
| **Waiter** | Record the table's order exactly | Handwritten chits, missed notes, lost orders |
| **Kitchen** | See what to cook and what changed | Illegible tickets, duplicates, late cancellations |

---

## 3. Competitor Landscape & Our Edge

### Detailed Competitor Analysis

#### Petpooja (Market Leader)
- **What they offer:** All-in-one POS ecosystem — billing, inventory, KDS, captain app, aggregator sync (Swiggy/Zomato), CRM, loyalty, QR ordering, 50+ reports
- **Pricing:** ₹12,000–₹40,000/year (annual subscription, varies by plan)
- **Strengths:** 100,000+ outlets, hardware-agnostic, extensive integrations
- **Weaknesses:** Recurring cost, cloud-dependent for many features, complex setup needs trained staff, call-centre support can be slow
- **Our advantage:** No recurring fees, self-service setup, offline-first, chatbot support

#### CaptainPad (Pune-based)
- **What they offer:** Wireless POS with mobile ordering, remote KOT printing, inventory, 50+ MIS reports, CRM with SMS, remote access
- **Pricing:** Quote-based (custom per outlet, hardware bundled)
- **Strengths:** Strong wireless ordering, good for dine-in
- **Weaknesses:** Opaque pricing, needs local installation partner, phone support dependency
- **Our advantage:** Transparent pricing, self-service everything, no installation partner needed

#### GoFrugal
- **What they offer:** Comprehensive POS with offline billing, KDS, recipe management, aggregator integration, ONDC support, loyalty programs
- **Pricing:** ₹5,000–₹50,000/year (cloud/on-premise options)
- **Strengths:** Strong inventory/recipe management, multi-platform apps
- **Weaknesses:** Complex tiers, add-on costs for advanced features, enterprise focus
- **Our advantage:** Simpler, cheaper, designed for non-technical owners

#### Restroworks (formerly Posist)
- **What they offer:** Enterprise cloud platform — advanced KDS, self-ordering kiosks, AI analytics, central kitchen management
- **Pricing:** ₹36,000+/year (enterprise, quote-based)
- **Strengths:** Enterprise-grade, extensive analytics
- **Weaknesses:** Overkill for small outlets, expensive, complex
- **Our advantage:** Built specifically for small restaurants, not a scaled-down enterprise product

#### Free/Open-Source Alternatives
- **Odoo Community:** Powerful but complex ERP, needs technical setup
- **ERPNext + URY:** Great but steep learning curve
- **Floreant POS:** Mature but no Indian GST, no UPI
- **Zoho POS (Zakya):** Free tier for micro-merchants, limited features
- **Loyverse:** Good free tier but no Indian GST compliance
- **Our advantage:** Purpose-built for India, GST-native, Hinglish support, zero technical setup

### Mise's Unique Value Proposition

```
┌─────────────────────────────────────────────────────┐
│                    MISE                               │
│                                                       │
│  ✅ One-time payment (no recurring subscription)      │
│  ✅ Self-service chatbot (no call centre needed)      │
│  ✅ 10-minute setup with QR codes                     │
│  ✅ Works 100% offline for core billing               │
│  ✅ Your data stays on YOUR computer                  │
│  ✅ Runs on devices you already own                   │
│  ✅ Indian GST built-in (owner-controlled rates)      │
│  ✅ Unlimited devices, no per-device licensing        │
│  ✅ Real-time sync across all devices on local WiFi   │
│  ✅ Built-in pantry/grocery audit                     │
│  ✅ Hinglish search ("kitna sale aaj")                │
└─────────────────────────────────────────────────────┘
```

---

## 4. Business Model — Build Free, Charge for Service

### Build Cost: ₹0

| Component | Tool | Cost |
|---|---|---|
| Frontend framework | React + TypeScript + Vite | **Free** (MIT) |
| Mobile packaging | Capacitor | **Free** (MIT) |
| Database | SQLite (on-device) | **Free** (public domain) |
| Real-time sync | WebSocket (built-in) | **Free** |
| Styling | CSS Variables + custom system | **Free** |
| Hosting (web client) | GitHub Pages / Vercel / Cloudflare | **Free tier** |
| Android distribution | Direct APK / Play Store (\$25 one-time) | **Free–\$25** |
| Desktop app | Electron (if needed later) | **Free** (MIT) |
| Code hosting | GitHub | **Free** |
| CI/CD | GitHub Actions | **Free tier** |

### Revenue Model

```
┌───────────────────────────────────────────────────┐
│            ONE-TIME PAYMENT MODEL                  │
│                                                     │
│  Customer pays ONCE → gets the full software        │
│                                                     │
│  Main Admin (owner) controls:                       │
│  ├── GST rate updates                               │
│  ├── Menu changes                                   │
│  ├── Staff management                               │
│  └── All settings                                   │
│                                                     │
│  Optional paid add-ons (future):                    │
│  ├── Priority chatbot support                       │
│  ├── Cloud backup service                           │
│  ├── Advanced analytics dashboard                   │
│  └── Multi-outlet management                        │
│                                                     │
│  Updates are controlled by Main Admin:              │
│  ├── GST rate changes → free                        │
│  ├── Feature updates → owner decides pricing        │
│  └── No forced updates, no subscription wall        │
└───────────────────────────────────────────────────┘
```

---

## 5. Architecture — Zero-Cost Tech Stack

### System Architecture

```
  DEVICES (Browser / Capacitor App)              Restaurant WiFi
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Waiter   │ │ Kitchen  │ │ Counter  │ │ Manager  │
  │ (phone)  │ │ (tablet) │ │ (laptop) │ │ (phone)  │
  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
       │             │            │             │
       └─────────────┴────────────┴─────────────┘
                          │
                   WebSocket + REST
                          │
       ┌──────────────────┴──────────────────┐
       │              HUB                      │
       │   (Restaurant's main computer)        │
       │                                       │
       │   ┌─ Local Server (Fastify/Express)   │
       │   ├─ SQLite Database (WAL mode)       │
       │   ├─ Print Queue Manager              │
       │   ├─ Chatbot Engine (offline)         │
       │   └─ WebSocket Event Broadcasting     │
       └──────────┬──────────┬─────────────────┘
                  │          │
          TCP 9100│          │ Windows Queue
                  ▼          ▼
         Kitchen Printer   Bill Printer
```

### Technology Stack (All Free)

| Layer | Technology | Why |
|---|---|---|
| **UI Framework** | React 19 + TypeScript | Component-based, huge ecosystem, free |
| **Build Tool** | Vite 8 | Fast dev server, optimized builds |
| **Mobile Wrapper** | Capacitor 8 | Same codebase → Android/iOS apps |
| **Local Server** | Fastify (on Hub) | Fast, schema validation, WebSocket |
| **Database** | SQLite (WAL mode) | Zero-config, transactional, reliable |
| **Real-time** | WebSocket | Live updates across all devices |
| **Search** | Fuse.js | Fuzzy matching, Hinglish support |
| **i18n** | i18next | English, Hindi, Marathi |
| **Printing** | Raw ESC/POS over TCP | Direct printer control |
| **Validation** | Zod | Shared schemas client ↔ server |
| **Testing** | Vitest + Playwright | Unit + E2E testing |

### Cross-Platform Strategy

```
                    ONE CODEBASE
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
   │ Desktop │    │ Mobile  │    │  Web    │
   │ (Hub)   │    │ (Cap.)  │    │ Browser │
   │ Electron│    │ Android │    │ PWA     │
   │ /direct │    │ iOS     │    │         │
   └─────────┘    └─────────┘    └─────────┘
```

- **Hub (Counter laptop/PC):** Runs the server + database. Either Electron app or direct Node.js server with browser UI
- **Mobile devices (Waiter/Kitchen/Manager):** Capacitor-wrapped React app OR browser pointed at the Hub's IP
- **Any browser:** Open `http://<hub-ip>:8080` on any device on the same WiFi

---

## 6. The Organisation Model

### How It Works

The **Organisation** is the central concept. One restaurant = one organisation. The Hub computer owns all data.

### Create an Organisation (First Launch on Hub)

```
Step 1: Enter restaurant details
        ├── Name, Address, Phone
        ├── State (for GST)
        ├── Optional GSTIN, FSSAI
        └── Tax profile selection (5% / 18% / composition / unregistered)

Step 2: Create owner account
        ├── Name + 4-6 digit PIN
        └── Recovery key (print and store safely)

Step 3: Set operating mode
        ├── Dine-in (add tables/sections)
        ├── Takeaway
        ├── Counter
        └── Or any combination

Step 4: Add starter menu (manual or CSV import)

Step 5: Generate MODULE CODES → 4 unique codes
        ┌─────────────────────────────────────────┐
        │  KITCHEN code:  K7QX-4M2P-9TDA          │
        │  WAITER code:   W3BN-8KFS-2HRP          │
        │  COUNTER code:  C9DM-5JVT-6YQA          │
        │  MANAGER code:  M1GZ-7NXC-4EWB          │
        └─────────────────────────────────────────┘
        Each code is a 12-character high-entropy secret
        QR codes generated for easy scanning
        Print a setup sheet (A4) with all 4 QR codes

Step 6: Register printers by IP address
        └── Test slip → confirm physically

Step 7: Run practice order → practice bill
```

### Join an Organisation (Other Devices)

```
Any device on the same WiFi:
  1. Open Mise app/browser
  2. See "Join an Organisation"
  3. Scan QR code OR enter Hub address manually
  4. Enter the MODULE CODE for your role
  5. Name your device ("Waiter phone 2")
  6. Hub approves → you're in!

Each device gets:
  ├── Its own secure credential
  ├── Role-specific screens only
  ├── Revocable at any time
  └── Staff sign in with personal PINs
```

### Module Codes — Device Roles

| Code | Role | What the device sees | Who uses it |
|---|---|---|---|
| **Kitchen** | Kitchen Display + Printer | Incoming orders, prep status, print KOTs | Kitchen staff, chef |
| **Order Taking** | Waiter Interface | Tables, menu, take orders, send to kitchen | Waiters, servers |
| **Counter** | Cashier Terminal | Bills, payments, GST, print receipts | Cashier, billing person |
| **Manager** | Control Room | Reports, audits, menu changes, pantry, staff | Manager, owner |

### Managing Devices

The Hub console shows:
- Every joined device: name, role, last seen, status
- Actions: approve, rename, revoke, rotate codes
- Lost phone? → Revoke that single device instantly
- Rotate a code → old code stops working, existing devices stay

---

## 7. Complete Workflow — End to End

### Setup Day (Once)

```
Create Organisation
    → Set tax profile (owner controls GST rates)
    → Add tables & stations (Kitchen, Bar, Tandoor, Dessert)
    → Create menu (manual or CSV import)
    → Register printers (IP address + test slip)
    → Add staff + PINs
    → Join devices with module codes
    → Optional: Set up pantry items
    → Practice order + practice bill
    → Set backup destination + test backup
```

### A Normal Service Day

```mermaid
flowchart LR
    A["Guest arrives"] --> B["Waiter opens table\non phone"]
    B --> C["Adds items via\nsearch/categories"]
    C --> D["Send to Kitchen\n(one tap)"]
    D --> E["Hub creates KOTs\nper station"]
    E --> F["Kitchen screen\nshows tickets"]
    F --> G["Kitchen prints\nKOT tickets"]
    G --> H["Chef cooks\n(Start → Ready)"]
    H --> I["Waiter notified\n'Ready to serve'"]
    I --> J["Guest eats"]
    J --> K["Counter opens\nbill preview"]
    K --> L["GST calculated\nautomatically"]
    L --> M["Payment recorded\n(Cash/Card/UPI)"]
    M --> N["Bill printed\n+ table freed"]
```

### Detailed Step-by-Step

| Step | Actor | Device | What Happens | If It Goes Wrong |
|---|---|---|---|---|
| 1 | Waiter | Phone | Opens table, sets guests, adds items via search/categories/short codes | Unavailable items blocked; double-taps ignored |
| 2 | Waiter | Phone | Taps **Send to Kitchen** | If WiFi drops → command queued → sends when reconnected |
| 3 | Hub | Server | Saves order, creates KOTs per station, queues print jobs | Printer failure never loses the order |
| 4 | Kitchen | Tablet | New ticket appears with sound → Start → Ready | Ticket stays until served or cancelled with reason |
| 5 | Waiter | Phone | Gets "Ready" notification → serves guest | Changes after send create delta tickets (ADDED/CHANGED/CANCELLED) |
| 6 | Counter | Laptop | Opens bill preview: items + discount + service charge + GST | Discount above limit asks for manager PIN |
| 7 | Cashier | Laptop | Issues bill → records payment (cash/card/UPI) | Split payments allowed; UPI needs manual confirmation |
| 8 | Hub | Printer | Prints bill (TAX INVOICE or BILL OF SUPPLY) | Failed print shown honestly; reprints need manager PIN |
| 9 | — | — | Table becomes FREE | Part-paid bills stay open with balance shown |

### Table Operations

- **Split bill:** Move items to sub-bills (by item, by seat, or equally by N people)
- **Merge tables:** Combine two active sessions into one
- **Transfer table:** Move an open order to another table

### Day Close

1. **Blind close:** Cashier enters physical cash count BEFORE system shows expected totals
2. System computes variance per tender
3. Variance beyond tolerance → reason required
4. Day locked → Z-report generated → backup prompted
5. Reopening a closed day = Owner-only + audit logged

---

## 8. Module Specifications

### 8.1 Menu Management

**Who:** Owner, Manager (on Manager device or Hub)

| Feature | Details |
|---|---|
| Categories | Drinks, Starters, Mains, Desserts, etc. with sort order |
| Items | Name (EN/HI/MR), short code, price, tax category, station, veg/non-veg, allergens |
| Variants | Half/Full, Small/Large with price variants |
| Modifiers | Spice level, toppings, extras with price adjustments |
| Availability | One-tap toggle ("86 an item"), visible to all devices instantly |
| Pricing | Integer paise (₹245.50 = 24550 paise), no floating point ever |
| Archive | Items are archived (never deleted) to preserve history |
| Import | CSV import with column mapping, preview, row-level error fixing |
| Export | CSV export with formula-injection protection |
| Bulk change | Select items → apply % or fixed change → preview → confirm |
| Search | Short codes, partial names, Hinglish ("paneer tikka", "chai") |

**Rules:**
- Price changes are NOT retroactive (existing orders keep their prices)
- Required modifiers enforced before sending to kitchen
- Station routing determines which kitchen printer gets the item
- Tax category changes are Owner-only

### 8.2 Kitchen Module (KOT & Kitchen Display)

**The Ticket Lifecycle:**
```
Waiter sends order
    → Hub creates one KOT per STATION
    → Each KOT has: table, order type, waiter, items, modifiers, notes, allergens
    → Changes after send create DELTA tickets:
        ├── ADDED (new items)
        ├── CHANGED (quantity/note change)
        └── CANCELLED (with mandatory reason)
```

**Kitchen Screen:**
- Dark theme (default) for visibility
- Columns: **New** → **Cooking** → **Ready**
- Ticket timers: normal → amber (10 min) → red (20 min)
- One tap: Start → Ready → (optionally) Served
- Allergen banners highlighted prominently
- Sound alert for new tickets
- Station filter (see only your station's tickets)
- **86 item** toggle (kitchen can mark items unavailable)
- Print state visible per ticket (Queued/Printed/Failed/Unknown)

### 8.3 Pantry Module (Grocery Audit)

> [!IMPORTANT]
> The pantry module **never blocks ordering or billing**. If stock is missing, billing proceeds and an alert is raised.

**Purpose:** Track what was bought, used, wasted, and what's actually on the shelf.

**Core Features:**

| Feature | How It Works |
|---|---|
| **Items** | Name, category (vegetables, dairy, dry goods, spices, meat, beverages, packaging), units, par levels |
| **Vendors** | Name, phone, items supplied, unit costs |
| **Purchases** | Record deliveries with quantities, costs, batch IDs, expiry dates |
| **Stock Ledger** | Append-only movement log (PURCHASE, CONSUMPTION, WASTAGE, COUNT_ADJUSTMENT) |
| **Recipes** | Link menu items to raw materials with quantities per portion |
| **Auto-Deduction** | At KOT creation, automatically deduct recipe ingredients from stock |
| **FEFO** | First Expiry First Out — uses soonest-expiring batch first |
| **Wastage** | Categories: Expired, Prep spoilage, Dropped, Staff meals, Samples, Other |
| **Blind Count** | Staff enters physical count BEFORE seeing system quantity |
| **Variance** | System vs. counted → reasons required for discrepancies |
| **Alerts** | Low stock, expiring within 48h, expired, cost spikes |

**The Audit Equation:**
```
Opening Stock
  + Purchases
  − Recipe Consumption
  − Recorded Wastage
  − Closing Count
  ────────────────────
  = Unexplained Variance (should be zero)
```

### 8.4 Reports & Audits

**Manager "Today" Dashboard:**
- Sales so far, bill count, average bill
- Tender breakdown (cash/card/UPI)
- Open tables, ready-but-unserved tickets
- Discounts and voids today
- Printer health badges
- Devices online count
- Last backup age
- Pantry alerts
- **"Needs Attention" list**

**Full Report Catalogue:**

| Report | What It Shows |
|---|---|
| Sales Summary | Gross sales, discounts, service charge, packaging, taxable, tax, net payable |
| Tender Summary | Totals per payment method, outstanding partial payments, tips |
| Tax Summary | Taxable value + CGST/SGST by rate and day (for the accountant) |
| Item Sales | Quantity + value per item/category; best & worst sellers |
| Hourly Rush | Bills and covers by hour |
| Table Turnover | Average time from first order to payment |
| Waiter Performance | Orders, covers, avg bill, discounts given, voids requested |
| Discounts & Voids | Every discount/void with user, approver, reason, amount |
| Cancelled Items | Items cancelled after sending to kitchen, with reasons |
| Printer Incidents | Failed/unknown print jobs, downtime per printer |
| Pantry Reports | Stock on hand, low stock, expiry, wastage, purchases, variance |
| Day-Close History | Expected vs counted by tender, variance, reasons |
| Audit Log | Searchable log of all privileged actions |

**Fraud Signals ("Needs Attention"):**
- Voids above threshold
- Repeated reprints
- No-sale drawer opens
- Items cooked but never billed
- Large cash variances
- Off-hours activity

---

## 9. GST & Billing Engine

> [!IMPORTANT]
> **The GST engine is owner-controlled.** The Main Admin sets the rates, updates them when needed, and the system applies them. No hardcoded rates. No CA gatekeeping in the software.

### Tax Profiles (Owner Selects)

| Profile | GST Rate | Document Type | How It Works |
|---|---|---|---|
| **Regular** | 5% (2.5% CGST + 2.5% SGST) | TAX INVOICE | Standard for standalone restaurants |
| **Specified Premises** | 18% (9% + 9%) | TAX INVOICE | Hotels meeting room-tariff threshold |
| **Composition** | 0% shown to customer | BILL OF SUPPLY | Restaurant pays 5% of turnover, but customer bill shows NO tax |
| **Unregistered** | 0% | BILL (receipt) | Below threshold, no GST collected |

### The Calculation — Integer Paise Only

> **Rule: ALL money is integer paise. No floating point. Ever.**
> ₹245.50 = 24550 paise. Rates are basis points (500 = 5.00%)

**Calculation Steps (Exclusive Pricing):**

```
1. Line Gross = quantity × unit_price_paise

2. Discount allocated across lines proportionally
   (largest-remainder method — allocations always sum exactly)

3. Net = Gross − Discount

4. Service Charge = Net × rate / 10000 (if enabled, dine-in only)

5. Packaging = fixed amount (takeaway/delivery only)

6. Taxable Value = Net + Service Charge + Packaging

7. Tax per line:
   CGST = taxable × rate / 20000 (round half up)
   SGST = taxable × rate / 20000 (round half up)

8. Line Total = Taxable + CGST + SGST

9. Round-off: nearest rupee (±50 paise max)

10. Payable = Grand Total + Round-off
```

**Rounding Function (the one rule):**
```
mulDivRoundHalfUp(a, b, d) = floor((2*a*b + d) / (2*d))
```

### Worked Example

**Order: Paneer Tikka ₹260, Butter Naan 3×₹55, Masala Chai 2×₹30. Regular 5%, exclusive, no discount.**

| Item | Gross (paise) | CGST | SGST | Total Tax | Line Total |
|---|---|---|---|---|---|
| Paneer Tikka | 26,000 | 650 | 650 | 1,300 | 27,300 |
| Butter Naan ×3 | 16,500 | 413 | 413 | 826 | 17,326 |
| Masala Chai ×2 | 6,000 | 150 | 150 | 300 | 6,300 |
| **Totals** | **48,500** | **1,213** | **1,213** | **2,426** | **50,926** |

Grand Total: 50,926 paise (₹509.26). Round-off: −26. **Payable: ₹509.00**

### Invoice Rules

- Invoice numbers: `{prefix}/{FY}/{sequence}` (max 16 chars)
- Example: `INV/26-27/000123`
- Consecutive within financial year (April–March)
- **Issued bills are IMMUTABLE** — corrections create voids/credit notes, never edits
- Each bill stores a complete snapshot of tax rules used

### Owner-Controlled GST Updates

```
Main Admin → Tax Settings
  → Current profile: Regular 5%
  → Change rate? Enter new rate
  → Preview: "A ₹200 item becomes ₹210"
  → Confirm with Owner PIN
  → New rate applies to NEW bills only
  → All previously issued bills unchanged
```

---

## 10. Chatbot & Ask Bar — Our Customer Support

> [!IMPORTANT]
> **Mise has NO call centre, NO customer support hotline.** The built-in chatbot and Ask Bar ARE the support system. They must be comprehensive, instant, and solve problems.

### Why Chatbot Instead of Call Support

| Traditional POS (Petpooja, etc.) | Mise |
|---|---|
| Call a number → wait on hold | Type your question → instant answer |
| Support hours: 9 AM – 6 PM | 24/7, always available |
| Language barrier with support agent | English, Hindi, Marathi, Hinglish |
| "Please hold while I check" | Immediate diagnosis + fix steps |
| Cost: ₹5–15 lakh/year support staff | Cost: ₹0 (built into the app) |

### The Ask Bar

Present on **every screen**, opened with `/` or `Ctrl+K` or a microphone icon.

**Three layers, all offline:**

1. **Search** — across items, tables, bills, pantry items, settings, help
2. **Commands** — actions with preview + confirm
3. **Help & Diagnostics** — "how do I…" and "something is wrong"

### Command Examples

| What You Type | What Happens | Permission Needed |
|---|---|---|
| `table 4 add 2 chai` | Adds 2 Masala Chai to table 4 | Waiter |
| `bill table 4` | Opens bill preview for table 4 | Cashier |
| `split table 4 by 3` | Equal 3-way split | Cashier |
| `86 paneer` | Marks Paneer unavailable | Manager/Cashier/Kitchen |
| `today sales` | Shows today's sales card | Manager/Owner |
| `best sellers this week` | Item ranking | Manager/Owner |
| `low stock` | Pantry alerts | Manager/Owner |
| `check printers` | Runs printer health check | Manager/Owner |
| `kitna sale aaj` (Hinglish) | Same as "today sales" | Manager/Owner |
| `chai ka price badlo 50` (Hinglish) | Proposes Chai price → ₹50 | Manager (PIN) |

**Rules:**
- Every data-changing command shows a **preview card** and needs **Confirm**
- Commands go through the same permission system as screens
- Unknown input falls back to search with "did you mean…"
- Each module registers its own commands

### Help Library

Built-in, searchable, offline articles in 3 languages:
- "How do I add a printer?"
- "How do I give a discount?"
- "How do I join a device?"
- "How do I close the day?"
- Each article can open the right screen and highlight the relevant button

### Diagnostics ("Something is wrong")

Type "something is wrong" and the chatbot runs checks:
- ✅ or ❌ Printer health (each printer's IP reachability)
- ✅ or ❌ Last backup age
- ✅ or ❌ Devices online/offline
- ✅ or ❌ Hub disk space
- ✅ or ❌ Database integrity
- ✅ or ❌ Print job queue status
- ✅ or ❌ Unsynced device outboxes

Each failed check shows **plain-language cause** + **fix button**.

### Optional AI Enhancement (Off by Default)

- Owner can enable with their own API key
- AI interprets free text the parser missed
- AI drafts help answers
- AI provides insight sentences ("Paneer Tikka sales up 23% vs last week")
- AI **never** touches billing, KOT, printing, GST, or day close
- AI output is always visibly labelled
- With AI off, nothing breaks

---

## 11. Printer & Hardware Integration

### How Printers Connect

```
Printers are registered by their LOCAL IP address on the restaurant's network.

Example setup:
  Hub (Counter laptop):     192.168.1.10
  Kitchen Printer:          192.168.1.20:9100
  Bill Printer:             192.168.1.21:9100
  Bar Printer:              192.168.1.22:9100

The Hub checks if printers are working by:
  1. TCP connection to IP:port (reachable?)
  2. Status query (paper? cover? error?)
  3. Test slip (operator confirms physically)
```

### Printer Health Badges

| Badge | Meaning |
|---|---|
| 🟢 **Working** | Confirmed test slip recently + reachable + no faults |
| 🟡 **Needs Attention** | Unreachable, paper out, cover open, or test failed |
| ⚪ **Unknown** | Never tested, or reachable but no confirmed test |

### Printing Rules

- **KOTs** print at the station's printer (kitchen, bar, tandoor, etc.)
- **Bills** print at the counter printer
- If a printer is down → ticket stays on kitchen screen → fallback printer if configured
- **SUBMITTED is NOT proof of printing** — operator must confirm
- **Reprints** are always marked REPRINT and need manager PIN for bills
- **Never auto-retry** an unknown print job (could duplicate a bill)

### Pre-Service Check

One button: runs health checks on ALL printers before service starts.

---

## 12. UI/UX Design Philosophy

### Design Principles

1. **Calm, legible, dependable** — not a flashy SaaS dashboard
2. **Mobile-first** — works on a ₹8,000 Android phone
3. **Role-based simplicity** — waiters see only ordering, kitchen sees only tickets
4. **No dead ends** — every error has an explanation and a next action
5. **One accent colour** — saffron/amber on warm neutral
6. **Three languages** — English, Hindi, Marathi (Hinglish accepted in search)

### Design Tokens

```css
/* Surfaces */
--surface-primary: warm neutral (#FAFAF7)
--surface-secondary: slightly darker (#F0EFE9)
--surface-dark: dark mode (#1A1A1A)

/* Text */
--text-primary: charcoal (#2D2D2D)
--text-secondary: muted (#6B6B6B)

/* Accent */
--accent: saffron (#E67E22)
--accent-hover: darker saffron (#D35400)

/* Status */
--status-success: green with icon
--status-warning: amber with icon
--status-error: red with icon
--status-info: blue with icon
/* Colour is NEVER the only status signal */
```

### Accessibility Requirements

- Text: minimum 16px body
- Touch targets: minimum 48px × 48px
- Keyboard navigable on desktop
- Screen reader labels on all interactive elements
- Colour never the only indicator (always icon + text)
- Works at 360px (small phone) and 1280px+ (desktop)
- Respects reduced motion preference
- Dark mode for kitchen (default)

---

## 13. Screen-by-Screen Specification

### 13.1 First Launch Screen

Two large choices:
- **Create an Organisation** (Hub/desktop only)
- **Join an Organisation** (all devices)

### 13.2 Order Taking (Waiter Phone)

Bottom navigation: **Tables** | **Orders** | **Ready** | **Search**

- Table map with state icons and running totals
- Order screen: category rail + search + line list
- Sticky **"Send to kitchen ₹..."** button
- Ask Bar at top of every screen

### 13.3 Kitchen Display

- Full-screen dark theme
- Columns: New | Cooking | Ready
- Large ticket cards with timers
- Station filter tabs
- Sound toggle
- Shows only the station's items
- Print state per ticket

### 13.4 Counter (Cashier)

- Open bills list
- Takeaway quick bill
- Bill sheet with full GST preview
- Payment recording (cash/card/UPI)
- Day close

### 13.5 Manager Dashboard

- Today (live dashboard)
- Audit (week/month/custom)
- Menu editor
- Pantry
- Staff management
- Printers
- Devices
- Tax settings
- Backups

### 13.6 Hub Console (Owner)

Everything the Manager has PLUS:
- Organisation settings
- Module code management
- Device approvals
- Tax profile management
- Backup & restore
- Update control

---

## 14. Data Model

### Core Tables

| Group | Tables | Key Purpose |
|---|---|---|
| **Organisation** | `organisation`, `outlet_settings` | Restaurant profile, tax config |
| **Access** | `module_codes`, `devices`, `users`, `sessions` | Authentication, device pairing |
| **Menu** | `categories`, `menu_items`, `item_variants`, `modifier_groups`, `modifiers`, `stations` | Menu structure |
| **Floor** | `tables`, `sections` | Table layout |
| **Orders** | `orders`, `order_lines`, `order_line_modifiers` | Order tracking |
| **Kitchen** | `kots`, `kot_lines` | Kitchen tickets |
| **Billing** | `bills`, `bill_lines`, `bill_taxes`, `payments`, `invoice_series` | Immutable bill records |
| **Tax** | `tax_profiles`, `tax_rules` | Owner-controlled tax config |
| **Printing** | `printers`, `print_jobs`, `printer_checks` | Printer management |
| **Pantry** | `pantry_items`, `vendors`, `purchases`, `stock_movements`, `recipes`, `stock_counts`, `wastage_records` | Inventory tracking |
| **Operations** | `daily_closes`, `shifts`, `cash_events` | Day close records |
| **Platform** | `audit_events`, `command_log`, `events`, `backup_records`, `settings` | System internals |

### Key Rules
- **Money:** Integer paise everywhere, no floating point
- **Immutability:** Issued bills, audit events, command log are append-only
- **No hard delete:** Everything is archived, never deleted
- **Versioned:** Every entity has `id`, `version`, `created_at`, `updated_at`
- **Timestamps:** ISO-8601 UTC, displayed in outlet timezone

---

## 15. Security & Permissions

### Roles & Permissions

| Action | Owner | Manager | Cashier | Waiter | Kitchen |
|---|---|---|---|---|---|
| Create order, send KOT | ✅ | ✅ | ✅ | ✅ | ❌ |
| Change KOT status | ✅ | ✅ | ❌ | ❌ | ✅ |
| Cancel item before KOT | ✅ | ✅ | ✅ | ✅ | ❌ |
| Void item after KOT | ✅ | ✅ | PIN | PIN | ❌ |
| Issue bill, record payment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Discount within limit | ✅ | ✅ | ✅ | ❌ | ❌ |
| Discount above limit | ✅ | ✅ | PIN | ❌ | ❌ |
| Reprint bill | ✅ | ✅ | PIN | ❌ | ❌ |
| Void issued bill | ✅ | Reason | PIN | ❌ | ❌ |
| Edit menu & prices | ✅ | ✅ | ❌ | ❌ | ❌ |
| Toggle item availability | ✅ | ✅ | ✅ | ❌ | ✅ |
| Manage pantry | ✅ | ✅ | ❌ | ❌ | ❌ |
| Change tax profile | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage users & devices | ✅ | Limited | ❌ | ❌ | ❌ |
| View reports | ✅ | ✅ | Own shift | ❌ | ❌ |
| Backup & restore | ✅ | Backup only | ❌ | ❌ | ❌ |

### Security Measures

- **PINs:** Hashed (argon2id/scrypt), never stored plain, 5-attempt lockout
- **Module codes:** Only hash stored, rate-limited, rotatable, revocable
- **Audit log:** Append-only, records all privileged actions
- **No secrets in logs:** PINs, tokens, codes are redacted
- **Data ownership:** All data on the restaurant's own computer
- **Backups:** Encrypted with owner passphrase (AES-256-GCM)

---

## 16. AI Agent Build Prompts

> [!NOTE]
> This section contains the complete prompts for AI coding agents to build Mise from scratch. Each prompt is a self-contained milestone. Run them in order, one at a time.

### Master Agent Instructions (AGENTS.md)

```
# MISE v3 — MASTER AGENT INSTRUCTIONS

You are building Mise: an India-first, offline-first restaurant POS that runs on
laptops, phones and tablets. One computer (the HUB) owns the data. Other devices
join using MODULE CODES (Kitchen, Order Taking, Counter, Manager).

## Key Architecture Decisions
- React + TypeScript + Vite for all UI
- Capacitor for mobile (Android/iOS) packaging
- SQLite for local database on the Hub
- WebSocket for real-time sync to all devices
- Fastify for the local REST + WebSocket server on the Hub
- ESC/POS over TCP for thermal printers

## Non-Negotiable Rules
1. Money is integer paise; rates are integer basis points. No floating point.
2. One rounding rule (round half up on integers). Tax logic in packages/core.
3. Tax rates are owner-controlled data. Never hard-code a rate.
4. Issued bills are immutable snapshots. Corrections = voids/credit notes.
5. Every command has a client_command_id (idempotency). No duplicate orders/bills.
6. Hub is the only writer. Clients send commands, receive events.
7. Printing is a side effect. Orders survive printer failure.
8. UPI confirmed manually. QR is not payment proof.
9. Module codes are secrets: store only hashes, rate-limit, rotate, revoke.
10. Permission = device role AND user role, enforced server-side.
11. Every privileged action → append-only audit event.
12. Core flows never need internet or AI.
13. Pantry never blocks ordering or billing.
14. Every screen has loading, empty, error, success states.
15. All strings use i18n keys (en, hi, mr).
16. Touch targets >= 48px, text >= 16px, works at 360px.
17. Chatbot/Ask Bar on every screen — this IS our customer support.
```

### Milestone Order

```
M1  → Scaffold + Design System + Responsive Shell
M2  → Database + Organisation + Module Codes + Device Pairing
M3  → Local Server + Commands + Events + WebSocket + Client Outbox
M4  → Menu Management (categories, items, variants, modifiers, CSV import)
M5  → Tables + Order Entry (search, categories, modifiers, notes)
M6  → KOT + Kitchen Display (per-station tickets, timers, deltas)
M7  → GST + Billing Engine (pure functions, integer paise, all schemes)
M8  → Invoices + Payments + Voids (immutable snapshots, split tenders)
M9  → Printing + Printer Health (TCP adapters, health badges, templates)
M10 → Ask Bar + Chatbot + Help Library + Diagnostics
M11 → Reports + Audits + Day Close (all reports from issued bills)
M12 → Backup + Restore (encrypted, checksummed, tested)
M13 → Pantry Basics (items, purchases, wastage, counts, ledger)
M14 → Pantry Depth (recipes, FEFO, auto-deduction, purchase orders)
M15 → Optional AI Assistant (off by default, owner's API key)
M16 → Security Hardening + Resilience Testing
M17 → Pilot Kit + Release Candidate
```

---

> [!TIP]
> **For AI agents building this:** Read this entire document. Build milestone by milestone. Test everything. Never fabricate results. Every screen needs loading, empty, error, and success states. The chatbot is not optional — it IS the support system.

---

*End of Mise Master Document v3.0*
