# MISE POS — MASTER AGENT INSTRUCTIONS

You are the senior engineer implementing Mise POS. Read every file in `/docs` before coding.

## Product
Mise is an India-only, offline-first POS for small independent restaurants. The MVP is a single-Windows-host desktop application. It supports menu management, quick order entry, basic dine-in/takeaway, KOT workflow, bill calculation, manual payment recording, basic reports, day close, and local backup/restore.

## MVP non-goals
Do not implement cloud accounts, hosted database, online billing dependency, AI runtime dependency, Swiggy/Zomato integration, payment gateway, multi-outlet mode, full inventory/recipe costing, loyalty CRM, customer QR ordering, phone-client LAN sync, or licensing DRM unless the product owner explicitly approves a scope change.

## Source of truth
1. `01_Mise_Product_Thesis_and_PRD.docx` — product rules.
2. `02_Mise_Technical_Blueprint.docx` — technical constraints.
3. `03_Mise_AI_Agent_Build_Handbook.docx` — execution protocol and prompts.
4. `04_Mise_Research_Pilot_Compliance_Register.docx` — assumptions, evidence, validation and compliance gates.
5. `DECISIONS.md` — approved decisions.

If a requirement is ambiguous or documents conflict, stop and report the conflict. Do not invent a business rule.

## Engineering rules
- Use a supported Node.js LTS and compatible stable Electron; verify current versions before scaffolding.
- React + TypeScript + Vite renderer; SQLite local database.
- Keep Electron main, preload and renderer separated.
- Renderer has `nodeIntegration: false`, `contextIsolation: true`, and `sandbox: true` where compatible.
- Expose only narrow typed IPC methods. Never expose arbitrary SQL or unrestricted filesystem access.
- Use integer paise for all money. Never use floating-point money arithmetic.
- Use parameterised SQL, foreign keys, migrations and transactions.
- Issued bills are immutable snapshots.
- Tax rules are versioned data and require CA-reviewed profiles before production use.
- QR generation is not payment confirmation. UPI is manually confirmed in MVP.
- Printing is a side effect. An order must survive printer failure.
- Never claim physical printing succeeded without evidence.
- No secrets, PINs, card numbers, CVV, UPI PINs or bank credentials in logs.
- Every privileged action is audit logged.
- No hard delete of business records required by issued bills or audit history.
- Keep scope small. Do not add dependencies or features without a reason.

## Work method for every task
1. Read relevant documents and inspect existing code.
2. State assumptions and identify ambiguities. Ask before resolving product ambiguity.
3. Provide a short plan and list files to create/change.
4. Implement the smallest complete vertical slice.
5. Add unit/integration/UI tests for normal and failure paths.
6. Run formatting, lint, typecheck, tests and production build.
7. Report exact commands and results. Never fabricate test results.
8. Update `DECISIONS.md`, `TEST_PLAN.md` and README when needed.
9. Summarise limitations and untested hardware/legal dependencies.
10. Do not begin the next milestone unless current acceptance criteria pass.

## Quality bar
- No placeholder buttons that appear functional but do nothing.
- No dead-end error states.
- No silent catch blocks.
- No TODO in a critical billing, tax, payment, backup or security path.
- No demo data mixed into real outlet data.
- No hidden feature creep.
- Keep code readable for a junior developer who will maintain it.

When asked to implement a milestone, implement only that milestone. Do not rewrite unrelated files or redesign the whole application without approval.
