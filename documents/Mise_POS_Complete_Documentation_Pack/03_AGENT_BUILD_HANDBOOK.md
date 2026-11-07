MISE

AI Agent Build Handbook

Complete from-zero build instructions for Codex and other coding agents


# Read this first

This handbook is intended to be copied into an empty repository and used with an AI coding agent. It is not a magic one-shot prompt. A production POS must be built in small, reviewable milestones with human approval, physical hardware testing and real restaurant validation.

The agent is an implementation assistant, not the product owner, accountant, security auditor or final QA authority. It must not invent tax rules, silently broaden scope, claim tests passed when they were not run, or hide failures.


# 1. Recommended workflow

1. Create a new empty Git repository named mise-pos.

1. Place the four project documents in /docs and this handbook's master instructions in AGENTS.md.

1. Open the repository in Codex or another coding agent.

1. Run Prompt A (repository inspection and planning) first. Do not start feature implementation until the plan and decisions are reviewed.

1. Run the printer feasibility spike before committing to a printing library or printer architecture.

1. Run milestones in order. Each milestone must include implementation, tests, documentation and a review report.

1. Commit only after all milestone acceptance checks pass.

1. After each milestone, start a fresh agent session and run the sceptical review prompt.

1. Human owner reviews the diff, app behaviour and test evidence before proceeding.


# 2. Master system prompt — put in AGENTS.md

    # MISE POS — MASTER AGENT INSTRUCTIONS

    You are the senior engineer implementing Mise POS. Read all files in /docs before coding.

    PRODUCT:

    Mise is an India-only, offline-first POS for small independent restaurants.

    The MVP is a single-Windows-host desktop app. It supports menu management,

    quick order entry, basic dine-in/takeaway, KOT workflow, bill calculation,

    manual payment recording, basic reports, day close, local backup/restore.

    NON-GOALS FOR MVP:

    No cloud account, no hosted database, no online billing dependency, no AI

    runtime dependency, no Swiggy/Zomato integration, no payment gateway, no

    multi-outlet mode, no full inventory/recipe costing, no loyalty CRM, no

    customer QR ordering, no phone-client LAN sync, no licensing DRM.

    SOURCE OF TRUTH:

    1. /docs/01_Mise_Product_Thesis_and_PRD.docx (product rules)

    2. /docs/02_Mise_Technical_Blueprint.docx (technical constraints)

    3. /docs/03_Mise_AI_Agent_Build_Handbook.docx (execution workflow)

    4. /docs/04_Mise_Research_Pilot_Compliance_Register.docx (assumptions and verification)

    5. /docs/DECISIONS.md (approved decisions; overrides only when explicitly approved)

    If a requirement is ambiguous or documents conflict, stop and report the conflict.

    Do not invent a business rule.

    ENGINEERING RULES:

    - Use a supported Node.js LTS and compatible stable Electron; verify current versions.

    - React + TypeScript + Vite renderer; SQLite local database.

    - Keep Electron main, preload and renderer separated.

    - Renderer has nodeIntegration:false, contextIsolation:true, sandbox:true where compatible.

    - Expose only narrow typed IPC methods. Never expose arbitrary SQL or filesystem access.

    - Use integer paise for all money. Never use floating-point money arithmetic.

    - Use parameterised SQL, foreign keys, migrations and transactions.

    - Issued bills are immutable snapshots.

    - Tax rules are versioned data and require CA-reviewed profiles before production use.

    - QR generation is not payment confirmation. UPI is manually confirmed in MVP.

    - Printing is a side effect. An order must survive printer failure.

    - Never claim physical printing succeeded without evidence.

    - No secrets, PINs, card numbers, CVV, UPI PINs or bank credentials in logs.

    - Every privileged action is audit logged.

    - No hard delete of business records needed by issued bills/audit history.

    - Keep scope small. Do not add dependencies or features without a reason.

    WORK METHOD FOR EVERY TASK:

    1. Read relevant docs and inspect existing code.

    2. State assumptions and identify ambiguities. Ask before resolving product ambiguity.

    3. Provide a short plan and list files to create/change.

    4. Implement the smallest complete vertical slice.

    5. Add unit/integration/UI tests for normal and failure paths.

    6. Run formatting, lint, typecheck, tests and production build.

    7. Report exact commands and results. Never fabricate test results.

    8. Update docs/DECISIONS.md, docs/TEST_PLAN.md and README when needed.

    9. Summarise limitations and untested hardware/legal dependencies.

    10. Do not begin the next milestone unless the current acceptance criteria pass.

    QUALITY BAR:

    - No placeholder buttons that appear functional but do nothing.

    - No dead-end error states.

    - No silent catch blocks.

    - No TODO in a critical billing, tax, payment, backup or security path.

    - No demo data mixed into real outlet data.

    - No hidden feature creep.

    - Keep code readable for a junior developer who will maintain it.

    When asked to implement a milestone, implement only that milestone. Do not

    rewrite unrelated files or redesign the whole application without approval.


# 3. Prompt A — initialise and inspect the repository

    You are starting Mise POS from an empty repository.

    First read every project document in /docs and this AGENTS.md.

    Do not implement product features yet.

    Tasks:

    1. Inspect the repository and identify existing files, package manager and environment.

    2. Propose the smallest maintainable project structure consistent with the Technical Blueprint.

    3. Verify current supported Node.js LTS, Electron compatibility, SQLite binding support,

    Windows packaging support and licences using official documentation.

    4. Recommend exact dependency choices and versions, with a short reason for each.

    5. Identify native-module rebuild risks for SQLite/Electron on Windows.

    6. Create docs/DECISIONS.md with initial decisions and unresolved questions.

    7. Create docs/IMPLEMENTATION_PLAN.md with milestones and acceptance checks.

    8. Create a threat-model outline in docs/SECURITY.md.

    9. Create a test strategy in docs/TEST_PLAN.md.

    10. Do not install packages or write application code until the plan is approved.

    Output: repository assessment, proposed tree, dependency table, risks, open questions,

    and the exact first implementation step.


# 4. Prompt B — technical feasibility spikes

    Before building UI, run two small isolated spikes.

    SPIKE 1 — WINDOWS PRINTING:

    - On a real Windows machine, test printing a receipt-sized HTML document to an

    installed thermal printer using the proposed Electron path.

    - Record printer make/model, USB/LAN connection, Windows version, driver name,

    paper width, margins, cut behaviour, rupee glyph, Devanagari output and reprint behaviour.

    - Test printer disconnected, paper out and Windows queue paused where possible.

    - Do not claim a printer is supported if it was not physically tested.

    - If no physical printer is available, build a mock/test harness and mark hardware

    validation BLOCKED. Do not pretend the mock proves physical compatibility.

    SPIKE 2 — SQLITE/ELECTRON:

    - Build a tiny Electron app with secure main/preload/renderer separation.

    - Create SQLite DB, insert/update in transaction, close/reopen and verify persistence.

    - Package a development Windows build and confirm native binding loads.

    - Test crash/restart during a transaction.

    Deliver docs/SPIKE_RESULTS.md with environment, commands, evidence, results,

    limitations and a go/no-go recommendation. No product UI yet.


# 5. Milestone plan


## M0 — Product and technical baseline

Approved decisions, repo structure, threat model, dependency/licence review, print and SQLite feasibility. Gate: unresolved blockers listed; no false claims.


## M1 — App shell and design system

Electron secure shell, React routes, navigation, theme tokens, responsive desktop layout, reusable inputs/buttons/dialogs/toasts, demo mode. Gate: app launches and clean build works.


## M2 — Database and identity

SQLite schema/migrations, repository layer, owner setup, PIN hashing, role checks, audit events. Gate: permission tests and migration tests pass.


## M3 — Menu management

Categories, items, price, tax category placeholder, variants, modifiers, availability, CSV import preview. Gate: import validation and item snapshot tests.


## M4 — Order entry

Counter/takeaway/dine-in orders, optional tables, item search, quantity, modifiers, notes, draft save. Gate: five-item order flow and idempotency tests.


## M5 — KOT and kitchen queue

Station assignment, KOT creation/revisions, kitchen status queue, print job integration boundary. Gate: changes create visible deltas; printer failure never loses order.


## M6 — Billing and money engine

Integer-paise calculations, discount controls, tax profile framework, bill snapshots, numbering, payment records. Gate: independent totals and property tests; CA-dependent profiles remain disabled/unverified.


## M7 — Printing MVP

Printer selection, test slip, receipt/KOT templates, print job state, explicit reprint. Gate: physical test evidence for every claimed supported model.


## M8 — Reports and day close

Daily totals, tender summary, item sales, void/discount report, cash count and variance. Gate: report totals reconcile to source records.


## M9 — Backup and restore

Safe snapshot, checksum, retention, restore validation, pre-restore backup. Gate: clean-machine restore test.


## M10 — Hardening and pilot build

Security review, accessibility, crash recovery, performance profiling, installer, demo reset, pilot guide. Gate: all release-blocking tests pass.


# 6. Detailed milestone prompts


## M1 prompt

    Implement only M1 from docs/IMPLEMENTATION_PLAN.md. Build secure Electron main/preload/renderer separation and a minimal usable desktop shell. Use the approved stack only. Create design tokens and reusable components. Include loading, empty and error examples. Do not implement database, menu or billing yet. Add tests for navigation and preload API restrictions. Run typecheck, lint, tests and build. Report exact output and screenshots or describe how to reproduce.


## M2 prompt

    Implement only M2. Create SQLite migrations and repository functions for outlet settings, users and audit events. Create first-run owner setup and PIN login/lock screen. Hash PINs using an appropriate maintained password hashing library. Enforce roles in service layer, not just UI. Add tests for wrong PIN lockout, session expiry, role denial, migration rollback and audit append behaviour. Do not add menu or order features.


## M3 prompt

    Implement only M3. Build category/item/variant/modifier management, active/unavailable status, CSV import preview and row-level validation. Preserve referenced historical items by archive rather than hard delete. Validate prices as integer paise. Add import fixtures with malformed rows, duplicate codes, empty names and invalid prices. Show exact import summary.


## M4 prompt

    Implement only M4. Build counter/takeaway/dine-in order creation and optional table selection. Item search must support name and short code. Add modifiers, quantity, notes and draft persistence. Add an idempotency strategy so repeated taps do not create duplicate orders. Store line snapshots. Test app restart with an open order and simultaneous UI actions.


## M5 prompt

    Implement only M5. Create station-based KOT records and revisions. Changes after send must produce an explicit ADD/UPDATE/CANCEL delta with reason where needed. Build kitchen queue with status and elapsed time. Printing must be abstracted behind an adapter; do not assume success. Simulate offline printer, timeout, ambiguous submission and duplicate retry.


## M6 prompt

    Implement only M6. Implement money/tax calculation as pure tested functions using integer paise and integer basis points. Define and document rounding. Implement bill preview, bill issue, immutable snapshots, discounts with permission threshold, payment records and partial payments only if specified. Do not enable a live GST profile until a CA has reviewed it. Add randomized/property tests and reconciliation fixtures.


## M7 prompt

    Implement only M7 after SPIKE 1 passes. Add printer list/configuration, test slip, receipt/KOT templates and print job states. Clearly distinguish submitted, failed and unknown. Require explicit reprint for ambiguous results and mark reprints. If physical hardware is unavailable, implement mock adapter but label hardware support BLOCKED.


## M8 prompt

    Implement only M8. Build reports from issued bill/payment records, not duplicated counters. Add daily sales, tender summary, item sales, void/discount report and day-close cash reconciliation. Define business-day boundary using outlet timezone. Test refunds/voids and multiple tenders; reconcile to paise.


## M9 prompt

    Implement only M9. Create safe backup and restore. Use a consistent SQLite backup/snapshot mechanism. Include schema version, timestamp and checksum. Validate archive and integrity before replacing live data. Create a pre-restore backup. Test wrong archive, corrupted checksum, wrong passphrase if encryption exists, and successful restore to a clean directory.


## M10 prompt

    Implement only M10. Perform security, accessibility, resilience and performance review. Test crash during order/bill transaction, disk full, printer offline, failed backup, app restart and migration from previous schema. Build Windows installer and demo mode. Produce release checklist, known limitations and pilot instructions. Do not claim production-ready if hardware, CA or restore validation is incomplete.


# 7. Mandatory review prompt after every milestone

    Act as a sceptical senior engineer and product QA reviewer. Do not rewrite code.

    Read the product thesis, technical blueprint, AGENTS.md, approved decisions and the

    current milestone diff. Review the implementation for:

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

    For each finding provide severity (Blocker/Critical/Major/Minor), file and line,

    why it matters, reproduction/test and recommended fix. Separate confirmed defects

    from questions or risks. Do not say tests passed unless you ran them. End with a

    GO / NO-GO recommendation for this milestone.


# 8. Prompt for a feature request

    Before implementing this feature request, classify it as:

    - already in MVP scope;

    - a clarification of an existing requirement;

    - a change requiring product-owner approval;

    - explicitly post-MVP.

    Explain user problem, affected workflow, data changes, permissions, failure states,

    security/privacy implications, tests, migration needs and scope impact. If it is not

    clearly in MVP, do not implement it. Ask for approval and update the relevant docs

    and docs/DECISIONS.md before coding.


# 9. Prompt for bug fixing

    Reproduce the bug before editing code. Identify the smallest failing test or

    reproduction path. Determine whether it is a UI, domain, database, IPC, printer or

    packaging issue. Add a regression test that fails before the fix. Implement the

    smallest safe fix. Run related tests plus the full required checks. Report root

    cause, changed files, commands/results and remaining uncertainty. Do not refactor

    unrelated code.


# 10. Prompt for release readiness

    Perform a release-readiness audit. Do not modify code until you provide findings.

    Verify:

    - fresh installation and first-run setup;

    - menu import and validation;

    - full order-to-payment workflow;

    - tax profiles and bill templates reviewed by a CA (otherwise mark BLOCKED);

    - printer models physically tested (otherwise mark unverified);

    - void/discount/permission/audit controls;

    - reports reconcile to transaction records;

    - backup and restore on a clean machine;

    - no critical security warnings or dependency vulnerabilities;

    - installer works on a clean supported Windows environment;

    - demo data is isolated from live data;

    - documentation lists limitations and support procedure.

    Return a release gate table: PASS / FAIL / BLOCKED / NOT TESTED, evidence,

    owner and action required. Never convert BLOCKED into PASS.


# 11. Human approval checkpoints



| Checkpoint | Human must verify |

| --- | --- |

| Architecture approval | Stack, repository structure, dependencies, Windows support and licensing. |

| Printer spike | Actual receipt/KOT output from a physical printer; no mock-only approval. |

| Tax approval | CA reviews tax profiles, bill/bill-of-supply templates, rounding and correction flows. |

| Billing acceptance | Manually reconcile representative bills and edge cases to paise. |

| Backup acceptance | Restore on a separate clean installation and inspect records. |

| Pilot release | Observe real cashier and kitchen staff; record failures and training time. |

| Commercial release | Pricing, support promise, privacy notice, licence terms and update policy reviewed. |




# 12. Agent operating rules

- Use one agent as the primary integrator. Parallel agents may research or review isolated tasks, but must not concurrently edit shared core files without coordination.

- Ask the agent to list files it will touch before each milestone.

- Do not let agents make product decisions based on assumptions hidden in generated code.

- Keep commits small and named after a tested milestone.

- Require screenshots or reproducible steps for UI work; screenshots do not replace tests.

- Keep a human-readable decision log. Every major architectural change needs a reason and trade-off.

- Never paste real restaurant customer data, credentials or payment secrets into an AI agent.

- Review licence terms for generated code and every dependency before commercial distribution.