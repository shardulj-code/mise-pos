MISE

Technical Blueprint & Functional Specification

Practical MVP architecture | Windows-first, local database, no cloud dependency


# Purpose and authority

This document turns the product thesis into implementable engineering requirements. It is intentionally conservative. The first release is a single-host desktop application. LAN-connected phones, remote cloud sync, AI features and multi-outlet operation are not required for MVP.

The architecture is a recommendation, not an instruction to add complexity. The agent must verify current library maintenance, compatibility and licensing before installing dependencies. Pin exact versions in the lockfile and record major choices in docs/DECISIONS.md.


# 1. Architecture decision summary



| Area | MVP choice | Reason / constraint |

| --- | --- | --- |

| Desktop shell | Electron | Mature Windows desktop packaging and access to local printing APIs; follow security guidance. |

| UI | React + TypeScript + Vite | Common ecosystem; straightforward component and test workflow. |

| Styling | CSS variables + Tailwind or plain CSS modules | Choose one styling approach and avoid duplicate systems. |

| State | React state/context initially; Zustand only if needed | Do not introduce global state library without a concrete need. |

| Database | SQLite using a maintained Node binding | Local, transactional, no server installation. |

| Data access | Small repository/service layer with parameterised SQL | Avoid overengineered ORM and keep SQL inspectable. |

| Validation | Zod or equivalent schema validation | Validate UI/API inputs at boundaries. |

| Tests | Vitest + Playwright | Unit, integration and user-flow verification. |

| Printing | Spike first; HTML/Windows driver path initially | Raw ESC/POS support is device/driver-specific. |

| Packaging | electron-builder or maintained equivalent | Create Windows installer after clean-machine tests. |

| Cloud | None required | Core billing must work without accounts, cloud database or hosted API. |

| AI | Not in core runtime | AI is used as a development aid, not a runtime dependency. |




# 2. System boundary

MVP runs on one Windows computer. Electron main process owns the application lifecycle, database connection, file-system operations and printer integration. The renderer displays the user interface and calls a narrow, typed preload API. The renderer must not access Node.js or the file system directly.

    [Cashier / Manager / Owner]

    |

    v

    [React Renderer]

    |  typed, allow-listed IPC

    v

    [Preload Bridge]

    |

    v

    [Electron Main Process]

    |          |           |

    v          v           v

    [Services] [SQLite] [Print Adapter]

    |          |           |

    v          v           v

    [Business] [Local DB] [Windows printer driver / tested transport]

Do not expose arbitrary IPC methods such as executeSql(sql) or readFile(path). Expose narrowly scoped methods such as menu.list, order.create, bill.issue, backup.create and printer.test.


# 3. Runtime and dependency policy

- Use a currently supported Node.js LTS release at project start. As of the research date, Node.js 26 is listed as Active LTS; verify again before scaffolding and choose a version supported by the selected Electron release and native SQLite binding.

- Use the latest stable Electron release compatible with the chosen Node LTS and maintained native dependencies. Do not blindly use a major version because an AI agent suggested it.

- Prefer packages with recent releases, active issue triage, clear licences and Windows support.

- Commit package-lock.json (or the selected package manager lockfile). Never use floating dependency versions in production.

- Do not install a library merely to avoid writing a few lines of simple code.

- Run dependency and licence audits before packaging.


# 4. Repository layout

    mise-pos/

    apps/

    desktop/

    src/main/             # Electron main process

    src/preload/          # typed allow-listed bridge

    src/renderer/         # React UI

    resources/            # icons, receipt templates

    packages/

    core/                   # money, tax, order and bill domain rules

    database/               # schema, migrations, repositories

    printing/               # print adapters, job queue, test utilities

    shared/                 # shared types and validation schemas

    docs/

    PRODUCT_THESIS.md

    TECHNICAL_BLUEPRINT.md

    AGENT_BUILD_HANDBOOK.md

    RESEARCH_COMPLIANCE_REGISTER.md

    DECISIONS.md

    TEST_PLAN.md

    SECURITY.md

    tests/

    fixtures/

    integration/

    scripts/

    README.md

    AGENTS.md

    package.json

    package-lock.json

Keep the repository structure smaller if a monorepo creates friction. The folder layout is logical separation, not a requirement to publish multiple packages.


# 5. Data model

Use SQLite with foreign keys enabled, explicit migrations, transactions and indexes. Use integer paise for all currency. Use ISO-8601 UTC timestamps for stored event timestamps and store the outlet's IANA timezone/configuration for local business-day reporting. Do not assume the computer clock is correct; record timestamps and warn on major clock changes where feasible.



| Table | Important fields | Notes |

| --- | --- | --- |

| outlet_settings | id, name, address, phone, gstin, fssai_no, state_code, timezone, currency | One outlet only in MVP; currency INR. |

| users | id, display_name, pin_hash, role, active, created_at | Never store PIN in plaintext. |

| categories | id, name, sort_order, active | Soft delete where historical reference exists. |

| menu_items | id, category_id, name, short_code, description, price_paise, tax_category_id, veg_flag, station_id, active | Current menu price only; order lines snapshot price. |

| item_variants | id, item_id, name, price_delta_paise, active | Optional Half/Full etc. |

| modifiers | id, name, price_delta_paise, group_id, active | Modifier groups and min/max selection rules. |

| tables | id, label, area, sort_order, active | Optional; counter mode does not require tables. |

| orders | id, order_no, order_type, table_id, status, guest_count, created_by, created_at, updated_at | Order state machine; no hard deletes. |

| order_lines | id, order_id, item_id, item_name_snapshot, qty, unit_price_paise, tax_category_snapshot, notes, status | Snapshots prevent later menu edits changing existing orders. |

| kots | id, order_id, revision_no, station_id, status, created_at | Each send/update creates a revision or delta. |

| kot_lines | id, kot_id, order_line_id, action, qty_snapshot, item_snapshot | Action ADD/UPDATE/CANCEL. |

| bills | id, bill_no, order_id, status, subtotal_paise, discount_paise, taxable_paise, tax_paise, total_paise, tax_profile_snapshot, issued_at | Issued bill immutable. |

| bill_lines | id, bill_id, item_snapshot, qty, unit_price_paise, discount_paise, taxable_paise, tax_rate_snapshot, tax_paise, total_paise | Store calculation outputs and rule snapshot. |

| payments | id, bill_id, method, amount_paise, status, reference_note, confirmed_by, confirmed_at | No card PAN/CVV. UPI manual confirmation explicit. |

| tax_profiles | id, name, scheme_type, effective_from, active, reviewed_by, review_note | Configuration must be CA-reviewed. |

| tax_rules | id, profile_id, category_id, rate_basis_points, inclusive, component_type, effective_from | Represent rates as integer basis points. |

| audit_events | id, user_id, action, entity_type, entity_id, before_json, after_json, reason, created_at | Append-only through app API. |

| print_jobs | id, document_type, document_id, printer_id, status, attempts, created_at, last_error | Job submission != physical proof. |

| printers | id, display_name, transport, system_name, paper_width_mm, role, verified_at, verification_method | Only tested models are labelled verified. |

| daily_closes | id, business_date, expected_cash_paise, counted_cash_paise, variance_paise, note, closed_by, closed_at | Can have controlled reopen with audit event. |

| backup_records | id, path, created_at, size_bytes, checksum, schema_version, status | Never store encryption secrets in plain text. |




# 6. Domain invariants — non-negotiable

- Money is integer paise. No JavaScript floating-point arithmetic for money or tax.

- Every bill line and order line preserves the item name, unit price, tax category and modifier snapshot at the time of order/bill.

- Issued bills are immutable. A correction creates a controlled void/refund/correction record; it does not mutate historical bill totals.

- Every privileged action is audited with actor, timestamp, action, entity, before/after and reason where applicable.

- All database writes that form one business operation occur in a SQLite transaction.

- Every create/send/issue operation has an idempotency key or equivalent duplicate protection.

- Foreign keys are enabled. No orphan bill lines, payment lines or KOT lines.

- An order is not lost because printing failed. Printing is a side effect, not the source of truth.

- Payment status is never inferred from a QR display or customer screenshot.

- Tax profile changes affect future bills only; issued bill snapshots remain unchanged.


# 7. Money and tax calculation contract

    type Money = number; // integer paise only

    interface TaxLineInput {

    taxableAmountPaise: number;

    rateBasisPoints: number; // e.g. 500 = 5.00%

    inclusive: boolean;

    supplyType: 'INTRA_STATE' | 'INTER_STATE';

    }

    interface TaxLineResult {

    taxablePaise: number;

    cgstPaise: number;

    sgstPaise: number;

    igstPaise: number;

    totalTaxPaise: number;

    grossPaise: number;

    }

    // The implementation must define and test one explicit rounding rule.

    // Do not copy a tax example without documenting the chosen rounding behaviour.

The exact tax engine is blocked on CA review of the supported tax profiles and the required invoice/bill-of-supply formats. Build the engine as a pure function with unit/property tests, but do not claim legal correctness until the profiles are reviewed.


# 8. Main modules and acceptance requirements



| Module | Minimum behaviour | Acceptance evidence |

| --- | --- | --- |

| First-run setup | Outlet details, tax-profile selection placeholder, mode, menu starter/import, staff PIN, printer test, backup path. | Fresh install can complete setup and reach sample order; setup can resume after app restart. |

| Menu manager | Create/edit/archive category and item; variants/modifiers; availability; import CSV preview. | Invalid rows are reported; valid rows import; historical order snapshots unchanged. |

| Order entry | New counter/takeaway/dine-in order; add/search items; modifiers; quantity; notes; save draft. | Five-item order created without duplicate lines or lost changes. |

| Table view | Optional table list and status; open order linked to table. | Table status derives from order state, not manually inconsistent flags. |

| KOT | Create ticket by station; record revisions; queue print job. | Changes after send create visible delta; failed print leaves order intact. |

| Kitchen queue | List KOTs, status and elapsed time; mark preparing/ready. | State changes are persisted and audit-logged. |

| Billing | Preview total; discount permission; tax calculation; issue bill. | Independent calculation matches to the paise across tests. |

| Payment | Record one or more tenders; manual UPI confirmation; outstanding balance. | Partial payments reconcile exactly; no overpayment unless explicitly allowed. |

| Reports | Daily totals, tender summary, item sales, void/discount log. | Totals reconcile to issued bills and payment records. |

| Day close | Expected cash, counted cash, variance note, close event. | Cannot silently overwrite an earlier close. |

| Backup/restore | Create backup, checksum, restore into clean DB, verify counts. | Automated restore test passes in CI or documented manual test. |

| Printer setup | List installed printers; choose printer; test slip; clear status. | A physical test is confirmed by operator; unknown remains unknown. |




# 9. Printing strategy — do not guess

Thermal printing is the highest hardware risk. Do not build a complex printer subsystem before a physical proof. First test one common 80mm USB printer installed with its Windows driver, one 80mm LAN printer if available, and one 58mm device if a pilot partner owns one.

- Phase 1 candidate: render a receipt/KOT to a controlled HTML template and invoke the Windows print dialog or configured printer through Electron. Verify paper size, margins, cut behaviour and Hindi/Marathi output on actual hardware.

- Do not assume browser printing, Windows GDI drivers and raw ESC/POS bytes are interchangeable.

- Raw ESC/POS/network port 9100 support is a later adapter and must be tested against actual models and drivers.

- Keep a print job record. A submitted job is not proof that paper emerged.

- On failure, show the real known error if available; otherwise show 'Print status unknown' and ask the operator to inspect the printer before retrying.

- Never automatically retry an ambiguous job if doing so can print a duplicate bill/KOT. Require an explicit reprint action marked REPRINT.

- Receipt and KOT printing must not block order creation or billing.


# 10. Security requirements

- Electron renderer: nodeIntegration false, contextIsolation true, sandbox true where compatible; keep webSecurity enabled.

- Use a restrictive Content Security Policy. Do not load remote scripts or remote web content in the privileged renderer.

- Preload exposes allow-listed, typed IPC methods only. Validate sender and payload for every IPC request.

- PINs are salted and hashed using a maintained password-hashing implementation; never store plaintext or reversible PINs.

- Rate-limit PIN attempts and use a temporary lockout. Provide an owner recovery procedure that does not create a universal backdoor.

- Validate all imported CSV data; prevent formula injection in exported CSV by escaping dangerous leading characters.

- Use parameterised SQL; no string-concatenated queries.

- Audit voids, discounts above threshold, tax-profile changes, user changes, restore operations and manual payment confirmations.

- Do not store card numbers, CVV, UPI PINs, bank passwords or customer payment credentials.

- Backups may contain sensitive business/customer data. Restrict file permissions and consider optional passphrase encryption after recovery UX is designed.


# 11. Backup and restore design

Use SQLite's supported backup mechanism or a safe consistent snapshot; do not copy a live database file blindly while transactions are active. Include schema version, metadata and checksum. Restore must validate the archive before replacing live data, create a pre-restore safety copy, and show the outlet exactly which dataset will be restored.

- Backup name: mise_<outlet-id>_<YYYYMMDD_HHmmss>.zip (or another documented format).

- Write to a temporary file, flush/close, validate checksum, then atomically rename.

- Keep a configurable number of local backups; never delete the last known-good backup before a new backup verifies.

- Restore into a temporary database first; run integrity_check and foreign_key_check; only then activate.

- Test backup/restore on a clean Windows user profile or clean VM before release.


# 12. Test strategy



| Layer | Tests | Release gate |

| --- | --- | --- |

| Pure unit | Money, tax, rounding, state transitions, permission matrix, invoice numbering. | All pass; edge cases included. |

| Database integration | Migrations, constraints, transaction rollback, audit log, snapshots. | All pass against temporary SQLite DB. |

| Application integration | IPC validation, services, print queue, backup operations. | No unhandled errors; failure paths tested. |

| UI component | Form validation, loading/error/empty states, keyboard/touch interaction. | Accessibility checks and responsive desktop layout. |

| End-to-end | Setup → menu → order → KOT → bill → payment → day close → backup. | Repeatable on clean test data. |

| Hardware | Physical printer, paper sizes, driver behaviour, disconnected printer. | Only tested combinations listed as verified. |

| Resilience | Kill app during transaction, disk full, failed backup, printer offline, system restart. | No silent corruption/lost issued bill. |




# 13. Performance and supported hardware

Do not publish minimum hardware requirements until tested. For pilot, record CPU, RAM, Windows version, storage type, screen resolution, printer model, driver version and menu/order volume. Set practical performance budgets after measuring on the lowest-spec pilot machine.

- App should launch reliably on a modest Windows 10/11 machine supported by the selected Electron version.

- Main billing screen should remain responsive during database writes and print failures.

- Reports should use indexed queries and bounded date ranges.

- Database growth and backup size must be measured using representative data.

- Do not promise support for Windows versions no longer receiving security updates.


# 14. Later LAN phone-client decision

Phone-based captain ordering is attractive but is not in MVP. A phone browser connecting to a local host over plain HTTP introduces browser secure-context limitations, local-network security concerns, device pairing, Wi-Fi reliability, conflict handling and host-availability dependencies. Do not casually add a PWA and claim it works offline.

Before implementation, run a separate technical spike: Android Chrome access, local HTTPS/certificate trust, pairing, dropped Wi-Fi, host restart, duplicate commands, device revocation and latency. If the experience requires an app installation or certificate workflow that restaurant staff cannot complete, simplify the design or keep the workflow on the host PC.


# 15. Build and release process

- Build development and test scripts first; make a clean clone installable with one documented command sequence.

- Run typecheck, lint, unit tests, integration tests and build before each milestone is marked complete.

- Use semantic versioning only after a release policy is decided; tag pilot builds clearly as pre-release.

- Produce Windows installer and portable build only after clean-machine testing.

- Keep a changelog and migration tests. Never release a database migration without backup/restore test.

- Provide a demo dataset and reset function isolated from live data.


# References

- Electron security recommendations: https://www.electronjs.org/docs/latest/tutorial/security

- Electron context isolation: https://www.electronjs.org/docs/latest/tutorial/context-isolation

- Node.js release schedule: https://nodejs.org/en/about/previous-releases

- CBIC Rule 46: https://taxinformation.cbic.gov.in/content-page/explore-rules/1000136/1000001

- NPCI UPI FAQ: https://www.npci.org.in/what-we-do/upi/faqs