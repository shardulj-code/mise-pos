# Mise POS — AI Agent Build Prompts

Use this file with `AGENTS.md` and the four project documents. Run one prompt at a time. Do not ask an agent to build the whole POS in one giant generation.

## Prompt A — initialise and inspect repository

You are starting Mise POS from an empty repository.

First read every project document in `/docs` and `AGENTS.md`. Do not implement product features yet.

Tasks:
1. Inspect the repository and identify existing files, package manager and environment.
2. Propose the smallest maintainable project structure consistent with the Technical Blueprint.
3. Verify current supported Node.js LTS, Electron compatibility, SQLite binding support, Windows packaging support and licences using official documentation.
4. Recommend exact dependency choices and versions, with a short reason for each.
5. Identify native-module rebuild risks for SQLite/Electron on Windows.
6. Create `docs/DECISIONS.md` with initial decisions and unresolved questions.
7. Create `docs/IMPLEMENTATION_PLAN.md` with milestones and acceptance checks.
8. Create a threat-model outline in `docs/SECURITY.md`.
9. Create `docs/TEST_PLAN.md`.
10. Do not install packages or write application code until the plan is approved.

Output repository assessment, proposed tree, dependency table, risks, open questions and the exact first implementation step.

## Prompt B — feasibility spikes

Before building UI, run two isolated spikes.

### Spike 1: Windows printing
- On a real Windows machine, test printing a receipt-sized HTML document to an installed thermal printer using the proposed Electron path.
- Record printer make/model, USB/LAN connection, Windows version, driver name, paper width, margins, cut behaviour, rupee glyph, Devanagari output and reprint behaviour.
- Test printer disconnected, paper out and Windows queue paused where possible.
- Do not claim a printer is supported if it was not physically tested.
- If no physical printer is available, build a mock/test harness and mark hardware validation BLOCKED. A mock does not prove physical compatibility.

### Spike 2: SQLite/Electron
- Build a tiny Electron app with secure main/preload/renderer separation.
- Create SQLite DB, insert/update in transaction, close/reopen and verify persistence.
- Package a development Windows build and confirm native binding loads.
- Test crash/restart during a transaction.

Deliver `docs/SPIKE_RESULTS.md` with environment, commands, evidence, results, limitations and a go/no-go recommendation. No product UI yet.

## Milestone M1 — app shell and design system

Build secure Electron main/preload/renderer separation and a minimal usable desktop shell. Create design tokens and reusable components. Include loading, empty and error states. Do not implement database, menu or billing yet. Add tests for navigation and preload API restrictions. Run typecheck, lint, tests and build.

## Milestone M2 — database and identity

Create SQLite migrations and repository functions for outlet settings, users and audit events. Create first-run owner setup and PIN login/lock screen. Hash PINs using an appropriate maintained password-hashing library. Enforce roles in service layer, not just UI. Add tests for wrong PIN lockout, session expiry, role denial, migration rollback and audit append behaviour. Do not add menu or order features.

## Milestone M3 — menu management

Build category/item/variant/modifier management, active/unavailable status, CSV import preview and row-level validation. Preserve referenced historical items by archive rather than hard delete. Validate prices as integer paise. Add import fixtures with malformed rows, duplicate codes, empty names and invalid prices. Show exact import summary.

## Milestone M4 — order entry

Build counter/takeaway/dine-in order creation and optional table selection. Item search must support name and short code. Add modifiers, quantity, notes and draft persistence. Add an idempotency strategy so repeated taps do not create duplicate orders. Store line snapshots. Test app restart with an open order and simultaneous UI actions.

## Milestone M5 — KOT and kitchen queue

Create station-based KOT records and revisions. Changes after send must produce an explicit ADD/UPDATE/CANCEL delta with reason where needed. Build kitchen queue with status and elapsed time. Printing must be abstracted behind an adapter; do not assume success. Simulate offline printer, timeout, ambiguous submission and duplicate retry.

## Milestone M6 — billing and money engine

Implement money/tax calculation as pure tested functions using integer paise and integer basis points. Define and document rounding. Implement bill preview, bill issue, immutable snapshots, discounts with permission threshold, payment records and partial payments only if specified. Do not enable a live GST profile until a CA has reviewed it. Add randomized/property tests and reconciliation fixtures.

## Milestone M7 — printing MVP

Implement only after Spike 1 passes. Add printer selection, test slip, receipt/KOT templates and print job states. Clearly distinguish submitted, failed and unknown. Require explicit reprint for ambiguous results and mark reprints. If physical hardware is unavailable, implement mock adapter but label hardware support BLOCKED.

## Milestone M8 — reports and day close

Build reports from issued bill/payment records, not duplicated counters. Add daily sales, tender summary, item sales, void/discount report and day-close cash reconciliation. Define business-day boundary using outlet timezone. Test refunds/voids and multiple tenders; reconcile to paise.

## Milestone M9 — backup and restore

Create safe backup and restore. Use a consistent SQLite backup/snapshot mechanism. Include schema version, timestamp and checksum. Validate archive and integrity before replacing live data. Create a pre-restore backup. Test wrong archive, corrupted checksum, wrong passphrase if encryption exists, and successful restore to a clean directory.

## Milestone M10 — hardening and pilot build

Perform security, accessibility, resilience and performance review. Test crash during order/bill transaction, disk full, printer offline, failed backup, app restart and migration from previous schema. Build Windows installer and demo mode. Produce release checklist, known limitations and pilot instructions. Do not claim production-ready if hardware, CA or restore validation is incomplete.

## Mandatory sceptical review prompt

Act as a sceptical senior engineer and product QA reviewer. Do not rewrite code.

Read the product thesis, technical blueprint, AGENTS.md, approved decisions and the current milestone diff. Review:
1. Product scope violations and invented behaviour.
2. Money arithmetic, tax assumptions, rounding and invoice immutability.
3. Duplicate order, KOT, bill or payment risks.
4. Permission bypasses and audit-log gaps.
5. SQLite transaction, migration and data-loss risks.
6. Electron IPC exposure, XSS, unsafe navigation and insecure defaults.
7. Printer false-success, duplicate print and retry risks.
8. Backup consistency, restore safety and data exposure.
9. Missing loading, empty, error and recovery states.
10. Accessibility and keyboard/touch usability.
11. Missing tests and untested edge cases.
12. Dependency, licence and maintenance risks.

For each finding provide severity (Blocker/Critical/Major/Minor), file and line, why it matters, reproduction/test and recommended fix. Separate confirmed defects from questions or risks. Do not say tests passed unless you ran them. End with GO / NO-GO for this milestone.

## Feature request triage prompt

Before implementing a feature request, classify it as:
- already in MVP scope;
- clarification of an existing requirement;
- change requiring product-owner approval;
- explicitly post-MVP.

Explain user problem, affected workflow, data changes, permissions, failure states, security/privacy implications, tests, migration needs and scope impact. If it is not clearly in MVP, do not implement it. Ask for approval and update relevant docs and `DECISIONS.md` before coding.

## Bug-fix prompt

Reproduce the bug before editing code. Identify the smallest failing test or reproduction path. Determine whether it is UI, domain, database, IPC, printer or packaging. Add a regression test that fails before the fix. Implement the smallest safe fix. Run related tests plus full required checks. Report root cause, changed files, commands/results and remaining uncertainty. Do not refactor unrelated code.

## Release-readiness prompt

Perform a release-readiness audit. Do not modify code until you provide findings.

Verify:
- fresh installation and first-run setup;
- menu import and validation;
- full order-to-payment workflow;
- tax profiles and bill templates reviewed by a CA (otherwise BLOCKED);
- printer models physically tested (otherwise unverified);
- void/discount/permission/audit controls;
- reports reconcile to transaction records;
- backup and restore on a clean machine;
- no critical security warnings or dependency vulnerabilities;
- installer works on a clean supported Windows environment;
- demo data is isolated from live data;
- documentation lists limitations and support procedure.

Return a release gate table: PASS / FAIL / BLOCKED / NOT TESTED, evidence, owner and action required. Never convert BLOCKED into PASS.
