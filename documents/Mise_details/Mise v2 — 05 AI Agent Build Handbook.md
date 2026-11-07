# Mise v2 — 05 AI Agent Build Handbook

**Document 05 of 05 · Version 2.0 · 07 November 2026**

> This handbook contains everything an AI coding agent (Codex, Claude Code, Antigravity or similar) and the human supervising it need to build Mise from an empty repository: the master instructions (`AGENTS.md`), the mandatory research step, two feasibility spikes, seventeen milestone prompts with acceptance checks, and the review, bug-fix, triage and release prompts. **Run one prompt at a time. Never ask an agent to build the whole product in one go.**

## 1. How to use this handbook

1. Create an empty Git repository. Copy Documents 00 to 05 into `/docs` (export each from the document view as Markdown), and save section 2 below as `AGENTS.md` in the repository root (or `CLAUDE.md` or the tool's workspace rules). Check each tool's current documentation for the exact file name it reads.
2. Run **Prompt R** (research). The agent must open the reference links in Document 00 section 11 and write `docs/RESEARCH_NOTES.md`. **Do not let it scaffold anything until you approve that file.**
3. Run **Prompt A** (plan), approve it, then **Spike S1** and **Spike S2**. Record go or no-go in `docs/SPIKE_RESULTS.md`.
4. Run milestones **M1 to M17 in order**, one per session. Each ends with acceptance checks. Commit only when they pass.
5. After every milestone run the **Sceptical Review Prompt** in a fresh session or a second tool. Fix findings, then proceed.
6. Human gates the agent cannot pass for you: **CA sign-off on tax, physical printer tests, phone-over-Wi-Fi tests, clean-machine restore test, pilot.** Anything not tested by a human is BLOCKED or NOT TESTED, never PASS.

**Supervisor tips.** Keep the agent's context small: attach only the documents a milestone names. Ask for a plan and a list of files first. Review the diff before merging. Make the agent run the commands and paste the real output; never accept "tests should pass". Re-run the checks yourself on the milestone you care most about.

## 2. `AGENTS.md` (copy into the repository root)

```
# MISE v2 — MASTER AGENT INSTRUCTIONS

You are the senior engineer building Mise: an India-first, offline-first restaurant POS that runs on
laptops, phones and tablets. One computer (the HUB) owns the data. Other devices join an ORGANISATION
using MODULE CODES (Kitchen, Order Taking, Counter, Manager). Read every file in /docs before coding.

## Source of truth (highest first)
1. docs/DECISIONS.md (approved decisions)
2. docs/03_GST_Billing_and_Money.md (all money and tax rules)
3. docs/01_Product_Thesis_and_PRD.md (behaviour)
4. docs/02_Technical_Blueprint.md (architecture and security)
5. docs/04_Modules_Specification.md (module detail)
6. docs/05_Agent_Build_Handbook.md (process)
If a requirement is missing or documents conflict: STOP and report it. Never invent a business rule,
a tax rule or a legal claim.

## Scope
In scope: organisation create/join with module codes; device approval and revocation; menu management;
tables and ordering; KOT and kitchen screen; GST billing (regular 5%, specified premises 18%,
composition bill of supply, unregistered); payments recorded manually; printers by LAN IP and Windows
queue with health checks; reports and audits; day close; encrypted backup and restore; Ask bar;
pantry; optional AI assistant (off by default).
Out of scope unless the product owner approves in writing: cloud accounts or sync, aggregator
integration, payment gateway, multi-outlet, loyalty CRM, customer QR ordering, DRM licensing,
reservations, automatic UPI confirmation.

## Non-negotiable rules
1. Money is integer paise; rates are integer basis points. No floating point for money, tax or stock.
2. One rounding rule (round half up on integers). Tax logic lives only in packages/core as pure functions.
3. Tax rates and rules are effective-dated data. Never hard-code a rate. Issued bills are immutable
   snapshots. Corrections are voids, credit notes or reversals, never edits.
4. Every command has a client_command_id (idempotency key). Retries must never duplicate an order,
   KOT, bill, payment or print.
5. Every business operation is one SQLite transaction. Foreign keys on. Parameterised SQL only.
   Versioned migrations only.
6. The Hub is the only writer to the database. Clients send commands and receive events.
7. Printing is a side effect and only the Hub prints. An order must survive printer failure.
   Never report printing, payment or backup success without evidence. UNKNOWN is a valid state.
   A reachable printer IP is NOT proof of a working printer. Never auto-retry an UNKNOWN print job.
8. UPI is confirmed manually. A QR is not payment proof. Never store card numbers, CVV, UPI PINs, bank
   credentials. No PINs, tokens or module codes in logs.
9. Module codes are secrets: store only hashes, rate-limit attempts, allow rotation and revocation.
   Permission = device role AND user role, enforced in the service layer, not only the UI.
10. Electron: nodeIntegration false, contextIsolation true, sandbox true where compatible, strict CSP,
    narrow typed IPC only. Never expose arbitrary SQL, shell or file access.
11. Every privileged action writes an append-only audit event (actor, device, action, entity,
    before/after, reason, time). No hard delete of anything an issued bill or audit record refers to.
12. Core flows (order, KOT, bill, print, day close, backup) never need internet or AI.
13. Pantry never blocks ordering or billing.
14. Every screen has loading, empty, error and success states with a fix action. No dead ends,
    no placeholder buttons that do nothing, no silent catch blocks, no TODO in billing, tax,
    payment, security, backup or pairing code paths.
15. All strings use i18n keys (en, hi, mr). Touch targets >= 48px, text >= 16px, works at 360px and
    on desktop, colour is never the only status signal.
16. Verify dependency versions, maintenance and licences from official sources before adding them.
    Pin exact versions. Do not add a dependency or feature without a written reason.

## Work method for every task
1. Read the relevant documents and inspect the code. 2. State assumptions and ambiguities; ask before
resolving product ambiguity. 3. Give a short plan and list files to create or change. 4. Implement the
smallest complete vertical slice. 5. Add unit, integration and UI tests for normal and failure paths.
6. Run format, lint, typecheck, tests and production build. 7. Report the exact commands and real
results; never fabricate results. 8. Update docs/DECISIONS.md, docs/TEST_PLAN.md and the README.
9. List limitations and anything untested (hardware, phones, CA review). 10. Do not start the next
milestone until this one's acceptance criteria pass and the owner approves.
Implement only the milestone you were given. Do not rewrite unrelated files or redesign without approval.
```

## 3. Prompt R — mandatory research (Milestone 0)

```
You are starting Mise v2 from an empty repository. Do not write application code or scaffold anything.

1. Read every document in /docs completely, especially Document 00 section 11 (reference links).
2. Open and analyse every link in that section. For each group (GST and invoices, UPI and payments,
   platform and security and data, printing and hardware, competitor context) record: the source and
   the date you accessed it, what you learned, any conflict between sources, and what you could not
   verify. If a link is dead or changed, find the current official page; never fill gaps from memory.
3. Classify each source as Official, Vendor, Secondary, or Assumption. Never encode a tax rule from a
   Secondary source; mark it VERIFY and BLOCKED on the CA.
4. Verify from official sources: the current supported Node.js LTS; the current stable Electron and
   its bundled Node version; a maintained SQLite binding for that Electron on Windows (prebuilt
   binaries or rebuild requirements); the maintenance status and licences of Fastify, a WebSocket
   plugin, the chosen printer library, Zod, i18next and Fuse.js; the secure-context limits for
   service workers, PWA install and Screen Wake Lock on Android Chrome and iOS Safari.
5. Write docs/RESEARCH_NOTES.md with one section per group, plus: (a) a table of every tax statement
   you intend to encode with its official source or BLOCKED-on-CA, (b) a dependency table (name,
   exact version, licence, last release date, reason), (c) risks you found that the documents missed,
   (d) questions for the product owner.
6. Seed docs/DECISIONS.md from Document 00 section 6 using the decision template.
Stop and wait for approval. Do not begin Prompt A or any spike.
```

## 4. Prompt A — repository assessment and plan

```
Read /docs, AGENTS.md and the approved docs/RESEARCH_NOTES.md. Do not install packages yet.
1. Inspect the repository, package manager and environment.
2. Propose the smallest maintainable monorepo consistent with Document 02 section 12.
3. Propose exact dependency versions with reasons (from RESEARCH_NOTES.md).
4. Identify native-module rebuild risks (SQLite on Electron for Windows) and packaging risks.
5. Create docs/IMPLEMENTATION_PLAN.md with milestones M1 to M17, each with acceptance checks.
6. Create docs/SECURITY.md (threat-model outline from Document 02 section 7.6) and docs/TEST_PLAN.md.
7. Output: repository assessment, proposed tree, dependency table, risks, open questions, and the
   exact first step. Wait for approval.
```

## 5. Feasibility spikes (no product UI)

### Spike S1 — printers by IP, status and honest health

```
Goal: prove printing and printer-health logic before any product UI. Build packages/printing with:
(1) A TCP adapter for raw ESC/POS to host:port (default 9100) with connect and write timeouts and
    typed errors (UNREACHABLE, TIMEOUT, REFUSED, WRITE_FAILED).
(2) A Windows-queue adapter and listPrinters() via Electron's printer listing; classify each as Likely
    receipt printer, Unknown, or Not a receipt printer from name patterns.
(3) reachability(host, port): TCP connect with a short timeout, returning reachable and latency.
(4) queryStatus(): send the real-time status requests (DLE EOT 1 to 4) with a short read timeout and
    parse cover-open, paper-end, paper-near-end and error. No reply returns UNKNOWN, never OK.
    Cite the manufacturer's ESC/POS manual you used; command support varies by model.
(5) Health badge logic exactly as Document 02 section 8.5: Working only with a confirmed test slip or
    a confirmed job; reachable-but-untested is Unknown; Needs attention on repeated unreachability or
    a status fault.
(6) Print job state machine PENDING, SENDING, SUBMITTED, CONFIRMED, FAILED, UNKNOWN. A job that fails
    before any byte is sent may be retried automatically; UNKNOWN must never be auto-retried.
(7) A test slip generator for 58 mm and 80 mm: bold, centred, aligned columns, rupee sign, QR, a raster
    Devanagari line, cut, drawer pulse, and a box-pattern slip for spotting garbled output.
(8) A mock ESC/POS TCP server that simulates paper-out, cover-open, offline, no-reply, slow reply,
    connection reset after write, and port closed.
(9) An opt-in subnet scan for open port 9100 with short timeouts and limited concurrency.
Acceptance: automated tests reach every health and job state against the mock; the README holds a
manual hardware checklist and a results table for me to fill (a LAN printer, a USB printer with its
manufacturer driver and again as Generic / Text Only, a 58 mm device). If no physical printer is
available, mark HARDWARE VALIDATION BLOCKED. A mock never proves physical compatibility.
Deliver docs/SPIKE_RESULTS.md section S1 with environment, commands, evidence, limits, go or no-go.
```

### Spike S2 — phones, pairing and Wi-Fi

```
Goal: prove that phones and tablets can pair with and use the Hub over restaurant Wi-Fi. Build a tiny
Electron Hub that starts a Fastify server serving a minimal React page, a WebSocket echo, and the
pairing flow from Document 02 section 4 with module codes, device tokens, approval, rotation and
revocation (in-memory or SQLite). Show URL and QR in the Hub window. Test on a real Android Chrome
phone and a real iOS Safari device where available, in three modes: (1) plain HTTP on the LAN IP,
(2) local HTTPS with a generated certificate authority and a guided trust step, (3) an mDNS name such
as mise.local. Report for each: whether pairing works, whether the page loads, whether service
workers, PWA install, IndexedDB and Screen Wake Lock work, behaviour when Wi-Fi drops for 30 seconds,
replay of an outbox command without duplicates, latency, and what happens after revoking a device.
Also test: rate-limiting of wrong codes, expired Manager code, max devices, code rotation.
Build no product features. Write docs/SPIKE_RESULTS.md section S2 with a recommendation on delivery
mode A (HTTP) versus B (HTTPS) and any need for a native wrapper. Mark untested devices NOT TESTED.
```

## 6. Milestone prompts

Each prompt assumes `AGENTS.md` is loaded. Start each with: *"Read the documents named below and the current code. Give a plan and file list first. Implement only this milestone."*

### M1 — Scaffold and design system

Create the monorepo (`apps/hub`, `apps/client`, `packages/core`, `packages/db`, `packages/printing`, `packages/shared`). Implement a secure Electron shell (main, preload, renderer) and the design system: tokens (warm neutral surface, charcoal text, one saffron accent, status colours with icons), light and dark themes, and components Button, Card, Sheet (bottom sheet on phone, side panel on desktop), Toast with Undo, Chip, StatusDot with icon, NumberPad, SearchField, EmptyState, Skeleton, Table. Add i18n with en, hi, mr stubs and a language switcher. Build a `/styleguide` page. Tests: preload API restrictions, navigation, accessibility checks, Playwright screenshots at 360 and 1280 px. Docs: 02 sections 2, 7.1; 04 section 7.

### M2 — Database, organisation, module codes, devices, users

Create SQLite migrations and repositories for organisation, settings, users, devices, module codes, sessions, approvals, audit events and the command log. Implement: first-run **Create or Join** screen; Create flow steps 1–6 of Document 01 section 4.3 (profile, owner PIN with recovery key, tax-profile choice entering **Practice mode**, mode, tables and stations, code generation); code format, hashing, normalisation, rotation, revocation, expiry, max devices and rate limiting exactly as Document 02 section 4; Hub console Devices screen with approve, rename, revoke; PIN sign-in with fast user switching, idle lock and five-attempt lockout. Hash PINs with argon2id or scrypt. Tests: code normalisation and entropy, wrong-code rate limit, expired and revoked codes, device revocation closes access immediately, role and device-role intersection, lockout, audit append-only, migration up and rollback. Do not add menu or orders. Docs: 01 section 4; 02 sections 4, 5, 7.

### M3 — Local server, commands, events, client outbox

Implement the Fastify server (REST commands with client\_command\_id and expected\_version; WebSocket events with `seq` and `since_seq` resume), the command\_log idempotent replay, optimistic locking, and the responsive client shell with Join screen (QR scan, discovery, manual address) and role home screens (empty). Implement the client IndexedDB **outbox** with visible sync states. Use the delivery mode chosen in Spike S2. Tests: duplicate command returns the stored result and changes nothing, version conflict returns 409 with current entity, reconnect replays missed events, outbox replay after a simulated Wi-Fi drop, revoked device cannot reconnect. Docs: 02 sections 3, 6.

### M4 — Menu management

Implement Document 04 section 1: categories, items, variants, modifier groups with required rules, allergen tags, stations, tax categories (data only), availability toggle, archive, inline editing, bulk price change with preview, CSV import with mapping and preview and row-level errors, and export with formula-injection escaping. Prices parse to integer paise without floating point. Tests: import fixtures with malformed rows, duplicate codes, empty names, bad prices, unknown tax category; 300-row import under 2 seconds; price edit does not alter existing lines. Docs: 04 section 1.

### M5 — Tables and order entry

Build the table map with derived states, sections, guest count; the Order Taking client with search, categories, short codes, variants and modifiers, required-modifier enforcement, quantity, notes, draft persistence, and idempotent line commands; takeaway and counter orders. Order and line snapshots. Tests: repeated taps do not duplicate lines; two devices adding to one order; restart with an open order; unavailable item rejected; snapshot unaffected by menu change. Docs: 01 sections 5, 7, 11; 02 section 6.

### M6 — KOT and kitchen screen

Implement per-station KOTs with revisions and ADD/UPDATE/CANCEL deltas with reasons, the manager PIN approval for post-KOT cancels, the kitchen screen (columns, timers, allergen confirmation, recall, acknowledge cancels, sound, station filter, 86), and a **print-job queue abstraction using a mock adapter only**. Tests: cancel after send reaches the kitchen; double tap creates one KOT; allergen confirmation logged; ticket remains visible when the mock printer fails. Docs: 04 section 2.

### M7 — GST and billing engine

Implement Document 03 completely in `packages/core` as pure functions: rounding, largest-remainder allocation, exclusive and inclusive pricing, service charge, packaging, discounts with role limits, schemes (regular, specified premises, composition, unregistered), mixed bills. Implement tax profiles and rules as effective-dated data with the change-preview screen and owner PIN. Add the eight worked examples as exact fixtures, the property tests and an independent BigInt reference calculator. Bill preview UI on the Counter client. **Do not enable any live profile; Practice mode stays on until the CA record is stored.** Docs: 03 in full.

### M8 — Invoices, payments, voids

Implement bill issue as one transaction with the invoice number allocated inside it, series per document type and financial year, 16-character validation, immutable snapshots, document titles and required particulars, recipient details rules, payments (cash with change, card recorded, UPI manual confirmation, vouchers, split tenders, part payment), tips recorded separately, voids with manager PIN and reason, credit notes after day close, and the table becoming Free after payment. Tests: no duplicate bill for one order under concurrency; gap-free allocation rollback; rate change leaves issued bills unchanged; over-tender rules; void and credit-note audit. Docs: 03 sections 6–8; 01 section 5.2.

### M9 — Printing and printer health (real adapters)

Only after Spike S1 passes. Promote the spike code to production: printer registry with IP, port, role, paper width and fallback; TCP and Windows-queue adapters; test slip with Yes/No/Garbled confirmation; health monitor (start-up, idle interval, after failure, Pre-service check); badges and plain-language fixes; KOT and bill templates (58 and 80 mm; Hindi and Marathi as raster; allergen styling; TAX INVOICE, BILL OF SUPPLY, REPRINT and PRACTICE markers); the compatibility registry labelled LAB\_VERIFIED, COMMUNITY\_REPORTED or UNVERIFIED; manager-PIN reprints. Tests against the mock: every scenario in the hardware acceptance table of the Spike S1 prompt, and billing completes with the printer unplugged. Mark physical hardware BLOCKED until a human confirms. Docs: 02 section 8.

### M10 — Ask bar and help

Implement Document 04 section 4.1–4.5: search across items, tables, bills, pantry items (stub until M13), settings and help; command grammar and registry with English, Hindi, Marathi and Hinglish synonyms; preview-and-confirm for every mutating command; permission-filtered results; help library with screen highlight; diagnostics. Tests: at least 40 phrases resolve correctly; role filtering; unknown input executes nothing. Docs: 04 section 4.

### M11 — Reports, audits and day close

Implement Document 04 sections 5 and 6: the Manager Today screen, the report catalogue computed from bills, payments, audit events and KOTs, weekly and monthly audit views, Needs-attention signals, the audit-log viewer, CSV and PDF export (formula-injection safe), shifts, blind close, Z-report, controlled reopen. Tests: totals equal independent recomputation to the paise; void and refund effects; multiple tenders; 100,000-bill fixture under 300 ms; day boundary at midnight and a 4 a.m. start. Docs: 04 sections 5–6.

### M12 — Backup and restore

Implement Document 02 section 10: consistent snapshot with SQLite's backup API, metadata and checksum, AES-256-GCM encryption with a passphrase-derived key, temp-write-verify-rename, retention, backup-age badge, restore into a temporary database with integrity and foreign-key checks, pre-restore safety copy, and a clear dataset summary before activation. Tests: wrong archive, corrupted checksum, wrong passphrase, successful restore into a clean directory with identical counts. Mark the clean-machine restore BLOCKED until a human does it. Docs: 02 section 10.

### M13 — Pantry basics

Implement Document 04 sections 3.1–3.5, 3.7 (low stock and expiry), 3.8, 3.9: units and integer quantities, items, vendors, purchases with batches and expiry, the append-only ledger, weighted average cost, wastage categories, blind counts with variance and reason codes, count adjustments, the audit equation report, and Ask-bar commands. Owner and Manager only; module off by default; never blocks billing. Tests: on-hand equals the ledger sum; WAC exact in paise; count creates adjustments without altering history; audit equation balances on fixtures. Docs: 04 section 3.

### M14 — Pantry depth: recipes, FEFO, purchase orders

Implement recipes with yield factors, deduction at KOT creation, reversal before cooking and wastage after, FEFO batch selection, expired-batch exclusion, **uncovered consumption alerts without blocking billing**, par-level purchase suggestions and receiving against a purchase order. Tests: FEFO order; expired never consumed; billing succeeds with no stock; cancel-before-cook reversal; cancel-after-cook wastage; suggestion formula. Docs: 04 sections 3.6, 3.10; decision D-113.

### M15 — Optional AI assistant

Implement the adapter interface `suggest(task, context)` off by default with the owner's own API key stored encrypted, a data-disclosure screen, visible AI labelling, propose-only behaviour through the command registry, and a global kill switch. Tasks: interpret free text the parser missed, draft help answers, plain-language insight sentences if enabled. Never send customer data, PINs, tokens or payment details. Tests: with AI off or offline nothing breaks; redaction tests; no AI call in billing, KOT, print, GST or day close paths. Docs: 04 section 4.6.

### M16 — Security and resilience hardening

Write the full threat model in `docs/SECURITY.md`; run SQL injection, XSS, CSV-injection and IPC abuse tests; review pairing, rate limits, token handling and revocation; dependency and licence audit; ASVS-style checklist. Chaos tests: kill the Hub mid-bill, power cut during a write, Wi-Fi drop of 30 seconds, client clock change, full disk, failed backup, printer offline, concurrent edits on 10 simulated clients. Check keyboard use, screen-reader labels and contrast. Performance budgets from Document 02 section 11 measured on the lowest-spec machine available. Output a list of fixed and open issues. Do not claim production-ready.

### M17 — Pilot kit and release candidate

Build the Windows installer, a first-run guided setup that finishes in under 20 minutes, an interactive first-order tour, a printable A4 setup sheet with the four module QR codes, a quick-start card, a demo mode with a Reset button that cannot mix with live data, an in-app Report-a-problem that bundles a redacted log the owner shares manually, a release checklist and known-limitations list. Run the release-readiness prompt. Do not claim production-ready if the CA, printer, phone or restore gates are open.

## 7. Review, triage, bug-fix and release prompts

### 7.1 Sceptical review (after every milestone)

```
Act as a sceptical senior engineer and QA reviewer. Do not rewrite code.
Read AGENTS.md, docs/DECISIONS.md and the milestone diff. Review: (1) scope violations and invented
behaviour; (2) money, tax, rounding and immutability; (3) duplicate order, KOT, bill, payment or print
risks; (4) permission bypass, device-role versus user-role gaps and audit gaps; (5) pairing, code, token
and rate-limit weaknesses; (6) SQLite transaction, migration and data-loss risks; (7) Electron IPC,
XSS, unsafe navigation, insecure defaults; (8) printer false-success, UNKNOWN handling, retry and
duplicate-print risks; (9) offline, outbox, reconnect and conflict behaviour; (10) backup consistency
and restore safety; (11) missing loading, empty, error and recovery states; (12) accessibility, keyboard,
touch, 360 px layout, Hindi and Marathi strings; (13) missing tests and untested edge cases;
(14) dependency, licence and maintenance risks.
For each finding give severity (Blocker, Critical, Major, Minor), file and line, why it matters, how to
reproduce or test, and the recommended fix. Separate confirmed defects from questions. Do not say a
test passed unless you ran it. End with GO or NO-GO for this milestone.
```

### 7.2 Feature-request triage

```
Before implementing any request, classify it: already in scope; clarification of an existing
requirement; change requiring product-owner approval; or explicitly post-v2. Explain the user problem,
affected workflow, data changes, permissions, device roles, failure states, security and privacy
impact, tests, migration needs and scope impact. If it is not clearly in scope, do not implement it.
Ask for approval and update the documents and docs/DECISIONS.md before coding.
```

### 7.3 Bug fix

```
Reproduce the bug before editing code. Find the smallest failing test or reproduction. Decide whether it
is UI, domain, database, API, sync, printer or packaging. Add a regression test that fails before the
fix. Make the smallest safe fix. Run related tests and all required checks. Report root cause, changed
files, commands with real results, and remaining uncertainty. Do not refactor unrelated code.
```

### 7.4 Release readiness

```
Audit release readiness. Do not modify code until you give findings. Verify: fresh install and
first-run create and join; four module codes, device approval and revocation; menu import; full
order-to-payment flow on at least three devices; CA-reviewed tax profile and invoice or bill-of-supply
samples (otherwise BLOCKED); each printer model physically tested with its exact connection and driver
(otherwise unverified); void, discount, reprint and audit controls; reports reconcile to bills;
pantry audit equation; encrypted backup and restore on a clean machine; no critical security findings
or dependency vulnerabilities; installer on a clean Windows machine; demo data isolated; limitations
and support procedure documented.
Return a gate table: PASS, FAIL, BLOCKED or NOT TESTED, with evidence, owner and required action.
Never convert BLOCKED into PASS.
```

## 8. Definition of done (every milestone)

The milestone's acceptance checks pass with real command output pasted into the report; format, lint, typecheck, unit, integration and relevant end-to-end tests and the production build pass; loading, empty, error and success states exist; permissions are enforced in the service layer; audit events exist for privileged actions; documents and `DECISIONS.md` are updated; limitations and untested hardware or legal dependencies are listed; the sceptical review returns GO; the owner approves.

## 9. Suggested prompt for the very first message to an agent

```
Read AGENTS.md. Then run Prompt R from docs/05_Agent_Build_Handbook.md exactly. Do not scaffold,
install or code anything. When RESEARCH_NOTES.md and DECISIONS.md are written, stop and show me a
summary of what you could not verify and the questions you need answered.
```
