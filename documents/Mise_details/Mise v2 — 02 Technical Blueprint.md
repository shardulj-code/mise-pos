# Mise v2 — 02 Technical Blueprint

**Document 02 of 05 · Version 2.0 · 07 November 2026**

> This document turns the product into engineering requirements: architecture, the organisation and device-pairing protocol, data model, synchronisation, printing and printer health, security, backup and testing. It is deliberately conservative. Anything marked **VERIFY** is a hypothesis that a spike must prove before features depend on it.

## 1. Architecture at a glance

```
  Phones / tablets / laptops (browser or installed PWA)          Restaurant LAN / Wi-Fi
  +-----------+ +-----------+ +-----------+ +-----------+
  | Waiter    | | Kitchen   | | Counter   | | Manager   |   <-- role = module code
  | client    | | client    | | client    | | client    |
  +-----+-----+ +-----+-----+ +-----+-----+ +-----+-----+
        |  HTTPS or HTTP: REST commands + WebSocket events (per-device token)
        v
  +--------------------------------------------------------------+
  | HUB  (desktop app on the restaurant's main computer)          |
  |  Electron main process                                        |
  |   +- Local server (Fastify): REST, WebSocket, static client   |
  |   +- Services: org, devices, menu, orders, KOT, billing, GST, |
  |   |            pantry, reports, audit, backup, ask-bar        |
  |   +- SQLite (WAL): the single source of truth                 |
  |   +- Print subsystem: queue, adapters, health monitor         |
  |  Electron renderer: the Hub console (owner / counter UI)      |
  +--------+-------------------------+---------------------------+
           | TCP 9100 (raw ESC/POS)  | Windows print queue
           v                         v
   Kitchen / Bar / Bill printers   USB printers installed on the Hub
```

**Key consequences.** The Hub owns all data. Clients never write to the database; they send *commands* to the Hub and receive *events* back. Phones and browsers cannot open raw TCP sockets, so **only the Hub prints**. If the Hub is off, the restaurant cannot take orders from phones (see section 9).

## 2. Decision summary

| Area | Choice | Reason and constraint |
| --- | --- | --- |
| Hub shell | Electron | Mature desktop packaging, printer access, tray and auto-start. Follow Electron's security guidance |
| Local server | Fastify with a WebSocket plugin, running in the Electron main process or a utility process | Small, fast, schema validation built in. VERIFY plugin maintenance |
| Client | React + TypeScript + Vite, responsive, mobile-first, PWA where the browser allows | One codebase for phone, tablet and laptop; also used inside the Hub console |
| Database | SQLite via a maintained Node binding (for example better-sqlite3), WAL mode, foreign keys on | Local, transactional, no server to install |
| Validation | Zod (or equivalent) shared between client and server | One schema per command |
| Styling | CSS variables plus one utility or module system; do not mix two | Theme tokens: warm neutral surface, charcoal text, one saffron accent |
| i18n | i18next with en, hi, mr | All strings are keys |
| Search | Fuse.js (or SQLite FTS5) for fuzzy match | Short codes, partial names, Hinglish |
| Printing | Hub-side adapters: TCP 9100 raw ESC/POS, Windows queue | Spike first; browser printing is not used for thermal printers |
| Tests | Vitest (unit, integration), Playwright (end-to-end, multi-device), a mock ESC/POS printer | See section 13 |
| Packaging | electron-builder or maintained equivalent; Windows first | Clean-machine install test before release |
| Cloud | None | Core never needs an account or internet |
| AI | Optional adapter, off by default | Never in the core path |

Change any choice only with a written entry in `docs/DECISIONS.md`. Verify current Node LTS, Electron and binding compatibility before scaffolding; pin exact versions and commit the lockfile.

## 3. Client delivery and the secure-context problem (VERIFY with Spike S2)

Browsers treat `http://192.168.x.x` as an **insecure context**. In an insecure context service workers, PWA install and several APIs (for example the Screen Wake Lock used to keep a kitchen screen awake, and Web Crypto's `subtle` interface) may be unavailable. Mise therefore defines two delivery modes and must work in both:

| Mode | How | What works | What does not |
| --- | --- | --- | --- |
| **A. Plain HTTP on the LAN** (baseline) | Client opens `http://<hub-ip>:8080` in a normal browser tab | Ordering, KOT, billing, live updates over WebSocket, IndexedDB outbox, search | Installable PWA, service-worker caching, wake lock; the kitchen tablet must use OS settings (screen timeout, guided access or kiosk mode) |
| **B. Local HTTPS** (enhanced) | The Hub generates a private certificate authority and a server certificate for its address; staff install the CA on each device through a guided step | Everything in A plus PWA install, service worker, wake lock | Setup is harder on iOS and some Android versions; staff may fail the trust step |

Spike S2 measures both on real Android Chrome and iOS Safari, with a 30-second Wi-Fi drop, and recommends a default. If neither is workable for non-technical staff, the fallback is a thin native wrapper app (for example Capacitor) distributed later; that would be a new decision.

**Discovery:** the Hub advertises itself by mDNS (for example `mise.local`) and shows its IP and QR. mDNS is best-effort, so the manual address field always exists. Recommend a fixed IP or router DHCP reservation for the Hub and every printer.

## 4. Organisation, module codes and device pairing

### 4.1 Entities

- **Organisation**: one row; contains the outlet profile, an `org_id` (UUID), a random `pairing_pepper` and the active tax profile reference.
- **Module code**: one active code per role (`KITCHEN`, `WAITER`, `COUNTER`, `MANAGER`). Only a hash is stored.
- **Device**: a joined phone, tablet or computer with its own credential.
- **User and session**: a person signs in with a PIN on a device; the session is bound to that device.

### 4.2 Code format and storage

- 12 characters from the Crockford base32 alphabet (digits and letters without I, L, O, U), shown as three groups: `K7QX-4M2P-9TDA`. That is 60 bits of randomness from a cryptographically secure generator.
- Input is normalised before checking: upper case, hyphens and spaces removed, `O` read as `0`, `I` and `L` read as `1`.
- Stored as `SHA-256(pairing_pepper || normalised_code)` with: role, created\_at, expires\_at (nullable), max\_devices (default 10), uses, status (`ACTIVE`, `ROTATED`, `REVOKED`). The plain code is shown **once** on the owner's screen at generation and can be re-displayed only by re-authenticating with the owner PIN and rotating it.
- Defaults: Kitchen, Waiter and Counter codes do not expire until rotated; the **Manager code expires after 24 hours** and always requires owner approval. The owner can generate a new one at any time.

### 4.3 Join sequence

```
Client                              Hub
  | GET /api/v1/org/public          |  (restaurant name, hub id, TLS fingerprint if any)
  |<--------------------------------|
  | POST /api/v1/pair               |  { code, device_name, platform, app_version,
  |---------------------------------> client_command_id }
  |                                 |  1. rate-limit check (per IP and global)
  |                                 |  2. hash code, look up ACTIVE code
  |                                 |  3. check expiry and max_devices
  |                                 |  4. create device (PENDING or ACTIVE)
  |  { device_id, status }          |  5. audit event DEVICE_JOIN_REQUESTED
  |<--------------------------------|
  | (if PENDING) owner approves on the Hub console -> status ACTIVE, audit event
  | GET /api/v1/pair/{device_id}/credential  (poll or WebSocket)
  |<-- one-time device token (256-bit random) delivered once, stored hashed on the Hub
```

The device token is stored in the client's persistent storage and sent as `Authorization: Bearer <token>`. It is never put in a URL. WebSocket authentication sends the token in the first message or a subprotocol header, not in the query string.

### 4.4 Sessions and permissions

- A user signs in with a PIN (`POST /api/v1/session`), receiving a short-lived session token bound to the `device_id` with an idle timeout.
- **Effective permission = what the device's role allows AND what the signed-in user's role allows.** A cashier signed in on a waiter phone still sees only ordering. A manager can **authorise** a sensitive action (void, large discount, reprint) by entering a manager PIN on any device; that is an *approval*, not a change of module, and it records both the requesting user and the approving manager.
- Every command handler checks permission in the service layer. UI hiding is a convenience, never the control.

### 4.5 Rotation, revocation and abuse limits

- **Rotate code:** old code becomes `ROTATED` and stops working; already-joined devices are unaffected.
- **Revoke device:** status `REVOKED`; its token is invalid at once; open WebSockets are closed; audit event written.
- **Rate limits:** 5 failed code attempts per minute per source address, then exponential backoff; a global ceiling on pairing attempts; every failure is logged without storing the code attempted.
- **Plain HTTP risk (honest statement):** on a plain-HTTP LAN, someone able to sniff the Wi-Fi could read a code or token in transit. Mitigations: require a WPA2/WPA3 password-protected restaurant network that is not shared with guests, owner approval of new devices, short Manager code lifetime, visible device list with last-seen times, easy revocation, and a recommendation to use HTTPS mode. This risk is listed in the threat model (`docs/SECURITY.md`).

### 4.6 Owner recovery

The owner PIN is hashed and never recoverable. Recovery uses a **recovery key** printed once at organisation creation (a long random string the owner stores offline). Losing both PIN and key means restoring from a backup into a new organisation. There is no universal backdoor. A reset with the recovery key is audit logged and invalidates all manager sessions.

## 5. Data model

SQLite with foreign keys on, explicit migrations (`V001__init.sql`, `V002__...`), transactions, and indexes. **Money is `INTEGER` paise. Rates are integer basis points. Quantities of stock are stored as integers in the smallest unit (grams, millilitres, pieces) or as fixed-point integers with a documented scale; no floating point for money or stock.** Timestamps are ISO-8601 UTC; the outlet's IANA timezone (default `Asia/Kolkata`) and a configurable business-day start (for example 04:00) drive reporting. The Hub's clock is authoritative; client clocks are informational.

Every syncable entity has `id` (UUID), `version INTEGER NOT NULL` (optimistic locking), `created_at`, `updated_at`.

| Group | Tables | Key fields and notes |
| --- | --- | --- |
| Organisation | `organisation`, `outlet_settings` | name, address, state\_code, gstin, fssai\_no, timezone, business\_day\_start, currency=INR, pairing\_pepper |
| Access | `module_codes`, `devices`, `users`, `sessions`, `approvals` | code\_hash, role, status, expires\_at, max\_devices; device token\_hash, role, last\_seen\_at; user pin\_hash (argon2id or scrypt), role, active, failed\_attempts, locked\_until; approvals: requester, approver, action, reason |
| Menu | `categories`, `menu_items`, `item_variants`, `modifier_groups`, `modifiers`, `stations`, `tax_categories` | menu\_items: price\_paise, short\_code, station\_id, tax\_category\_id, veg\_flag, allergen\_tags, available, archived |
| Floor | `tables`, `sections` | label, section\_id, derived status |
| Orders | `orders`, `order_lines`, `order_line_modifiers` | order\_no, type, table\_id, guest\_count, status, version; line snapshots: item\_name, unit\_price\_paise, tax\_category, variant, notes |
| Kitchen | `kots`, `kot_lines` | revision\_no, station\_id, status, action ADD/UPDATE/CANCEL, qty\_snapshot, item\_snapshot, cancel\_reason |
| Billing | `bills`, `bill_lines`, `bill_taxes`, `payments`, `invoice_series`, `credit_notes` | immutable snapshot JSON of tax rules; bill\_no unique within series and financial year; payments: method, amount\_paise, status, confirmed\_by, confirmed\_at, reference\_note |
| Tax | `tax_profiles`, `tax_rules` | scheme\_type, effective\_from, reviewed\_by, review\_note; rule: rate\_bp, inclusive, component, applies\_to |
| Printing | `printers`, `print_jobs`, `printer_checks` | see section 8 |
| Pantry | `pantry_items`, `units`, `vendors`, `purchases`, `purchase_lines`, `stock_batches`, `stock_movements`, `recipes`, `recipe_lines`, `stock_counts`, `stock_count_lines`, `wastage_records` | see Document 04 |
| Operations | `daily_closes`, `shifts`, `cash_events` | blind-close counts, variance, reason |
| Platform | `audit_events`, `command_log`, `events`, `backup_records`, `settings` | audit append-only; command\_log keyed by client\_command\_id; events has a monotonic `seq` |

**Immutability.** `bills`, `bill_lines`, `bill_taxes`, `audit_events` and `command_log` are append-only through the service API. Corrections create new records (void, credit note, reversal). No hard delete for any record referenced by a bill or the audit trail; menu items are archived, not deleted.

## 6. Commands, events and synchronisation

### 6.1 Commands

Clients call REST endpoints such as `POST /api/v1/orders`, `POST /api/v1/orders/{id}/send`, `POST /api/v1/bills`, `POST /api/v1/bills/{id}/payments`, `POST /api/v1/printers/{id}/test`. Each mutating request carries a **client\_command\_id** (UUID v4) and, for updates, the **expected\_version** of the entity.

- The Hub first looks up `command_log`. If the id exists, it returns the **stored result** and changes nothing. This makes retries safe after a dropped connection.
- The handler runs in **one SQLite transaction**: check permission, validate with Zod, check `expected_version`, write the entity, write `audit_events` when privileged, append to `events`, write `command_log`. Commit or roll back as a unit.
- Version mismatch returns `409 CONFLICT` with the current entity so the client can show the difference and let the user retry.
- Optimistic locking pattern: `UPDATE orders SET status=:s, version=version+1 WHERE id=:id AND version=:expected;` and treat zero rows changed as a conflict.

### 6.2 Events

Every committed change appends a row to `events(seq, type, entity, entity_id, payload_json, at)`. The WebSocket pushes events to subscribed devices, filtered by the device role. A reconnecting client sends `since_seq`; the Hub replays missed events, or tells the client to reload a full snapshot if the gap is too large. Clients are read-through caches; the server is the truth.

### 6.3 Client outbox

Each client keeps an **outbox** in IndexedDB of commands not yet acknowledged, each with its `client_command_id`. The screen shows a clear sync state: *Synced*, *Sending*, *Not sent yet (offline)*, *Needs attention (conflict)*. When the connection returns, the outbox replays in order. A command is removed only when the Hub acknowledges it.

### 6.4 Conflict rules

- Two waiters adding items to the **same** open order: both succeed because adds are separate line commands; the Hub orders them by arrival.
- Two users editing the **same line** or the same bill: the second receives CONFLICT.
- A bill cannot be issued twice for the same order (unique constraint plus idempotency).
- Menu price changes never alter existing order lines (snapshots).
- A device offline for long enough that its draft refers to an archived item or a closed table receives a plain rejection with a fix action.

## 7. Security

### 7.1 Hub (Electron)

`nodeIntegration: false`, `contextIsolation: true`, `sandbox: true` where compatible, `webSecurity` on, restrictive Content Security Policy, no remote content in privileged windows, navigation blocked outside the app. The preload exposes only narrow, typed methods (for example `printers.test`, `backup.create`); never arbitrary SQL, shell or file access. Validate sender and payload for every IPC call.

### 7.2 Local server

Bind to the LAN interface only when the organisation exists. Every route except `GET /org/public` and `POST /pair` requires a valid device token; most also require a session. Validate every body, query and parameter with schemas. Use parameterised SQL only. Set conservative CORS (same origin). Limit request size and rate. Escape output; the client never uses `dangerouslySetInnerHTML` on user data.

### 7.3 Secrets and logs

No PINs, tokens, module codes, card numbers, CVV, UPI PINs or bank credentials in logs, error messages, audit payloads or backups of logs. Redact by key name in the logger. PINs use argon2id or scrypt with per-user salt; five wrong attempts cause a timed lockout.

### 7.4 Privileged actions that are audited

Organisation creation, code generation, rotation and revocation, device approval, user changes, tax-profile changes, price changes, discounts above threshold, voids, reprints, no-sale drawer opens, payment confirmations, day close and reopen, backups, restores, stock adjustments and counts, and every failed approval. Each audit row stores actor, device, action, entity, before and after JSON, reason and timestamp.

### 7.5 Data at rest and exports

Database file permissions restricted to the Hub user. Backups encrypted with AES-256-GCM using a key derived from the owner's passphrase (scrypt or argon2id). CSV exports escape leading `=`, `+`, `-`, `@` to block spreadsheet formula injection.

### 7.6 Threat model starting list

Rogue device on the Wi-Fi guessing codes; sniffed traffic on plain HTTP; stolen phone; shared manager PIN; malicious CSV import; XSS via menu text; SQL injection; printer IP spoofing; replayed commands; tampered backup file; staff abusing discounts or voids. Each gets a mitigation and a test in `docs/SECURITY.md`.

## 8. Printing subsystem

### 8.1 Principles

Printing is a **side effect**. The order, KOT and bill are saved first; a print job is queued after. A job that was *submitted* is not proof that paper came out. The Hub never reports success it cannot evidence.

### 8.2 Printer record

`printers(id, name, transport, host, port, windows_queue_name, station_id or role, paper_width_mm, code_page, cut_command, drawer_wired, fallback_printer_id, health, health_reason, last_checked_at, last_confirmed_test_at, verification_label)` where `transport` is `TCP`, `WINDOWS_QUEUE` or `COM`, and `verification_label` is `LAB_VERIFIED`, `COMMUNITY_REPORTED` or `UNVERIFIED`. Only hardware physically tested by the team may be `LAB_VERIFIED`.

### 8.3 Adapters

- **TCP (LAN IP, default port 9100):** raw ESC/POS bytes over a socket with connect and write timeouts. Typical for kitchen and bar printers.
- **Windows queue:** renders HTML or raw bytes to an installed printer. Raw bytes work only if the queue's print processor and datatype are RAW; manufacturer GDI drivers may garble raw data. A "Generic / Text Only" queue is the usual workaround.
- **COM (serial):** optional later.
- All adapters implement the same interface: `connect`, `send(bytes)`, `queryStatus`, `close`, with typed errors (`UNREACHABLE`, `TIMEOUT`, `REFUSED`, `WRITE_FAILED`, `QUEUE_PAUSED`, `UNKNOWN`).

### 8.4 Print job lifecycle

```
PENDING -> SENDING -> SUBMITTED -> (operator confirms or status OK) -> CONFIRMED
                 \-> FAILED   (known error with reason)
                 \-> UNKNOWN  (sent but no evidence; timeout after write)
```

Rules: one serial queue per printer; a job id is unique and never reused; FAILED jobs may be retried by the operator or by bounded automatic retry **only if the failure happened before any bytes were sent**; **UNKNOWN jobs are never auto-retried**, because a retry may print a duplicate bill or ticket; the operator chooses **Reprint**, which prints a REPRINT marker and is audit logged (manager PIN for bills).

### 8.5 Health monitoring (the IP check)

The monitor runs at Hub start, every few minutes while idle, after any failed job, and on the **Pre-service check** button. For each printer:

1. **Reachability:** TCP connect to `host:port` with a short timeout (for example 1.5 seconds). Record `reachable` and latency. Two consecutive failures mean `NEEDS_ATTENTION: UNREACHABLE`.
2. **Status query (where supported):** send the real-time status requests `DLE EOT 1` to `4` (printer, offline cause, error cause, paper sensor) with a short read timeout and parse the bits for cover open, paper end, paper near end and error. Bit layouts vary by model; some printers return nothing; a powered-off printer cannot answer. No reply means *unknown status*, never *OK*.
3. **Confirmed test slip:** the operator prints a test slip and answers **Yes**, **No** or **Garbled**. This is the only source of *proof*.

Health badge rules:

| Badge | Condition |
| --- | --- |
| **Working** | Last confirmed test slip is recent (configurable days) AND latest reachability is OK AND status, if available, shows no fault; or the most recent job was CONFIRMED |
| **Needs attention** | Unreachable twice, a status fault (paper end, cover open, error), or the last test was answered No or Garbled |
| **Unknown** | Never tested, or reachable without status and without a confirmed test (display *Reachable, not yet tested*) |

Make network scanning an **opt-in** button (scan the local subnet for open port 9100 with short timeouts and limited concurrency), never automatic.

### 8.6 Templates and content

KOT and bill templates are versioned. Support 58 mm and 80 mm widths, bold and centred text, aligned columns, the rupee sign, QR, cut and cash-drawer pulse. Hindi and Marathi lines print as **raster images** because many printers lack Devanagari code pages. Allergen tags print in high-contrast style. Bills show the document title (TAX INVOICE or BILL OF SUPPLY) and the required particulars (Document 03).

### 8.7 Printer compatibility registry

Ship a JSON registry of models with paper widths, code page, cut and drawer commands, and status support, each labelled `LAB_VERIFIED`, `COMMUNITY_REPORTED` or `UNVERIFIED`. Start every entry as community-reported or unverified until a real test passes.

## 9. Offline behaviour and the Hub as single point of failure

| Situation | Behaviour |
| --- | --- |
| Internet unavailable | No effect |
| Client loses Wi-Fi briefly | Outbox buffers; replay with idempotency keys |
| Client loses the Hub for longer | Order drafts are kept locally and marked *Not sent*. They are **not** shown to the kitchen. A banner tells the waiter to use the paper fallback after a configurable wait (for example 60 seconds) |
| Hub app crashes or restarts | Auto-restart, WAL recovery, clients reconnect and resync from `since_seq` |
| Hub computer off | Same as above; the restaurant needs a paper fallback procedure and should keep the Hub on a UPS |
| Power loss during a write | SQLite WAL guarantees a consistent state; tests must prove it |

A second standby Hub is a later project. Do not promise zero downtime.

## 10. Backup and restore

Use SQLite's online backup API (or `VACUUM INTO`) to produce a consistent snapshot while the database is in use; never copy the live file blindly. Package with metadata (schema version, created time, outlet id, checksum), encrypt, write to a temporary file, verify, then atomically rename. Keep the last N backups and never delete the last known-good one before a new one verifies. Restore into a temporary database first, run `integrity_check` and `foreign_key_check`, create a pre-restore safety copy, show the owner exactly what will be restored, then switch. A backup that has not been restored in a test is **not proven**. Backup age appears on the Manager device and turns amber after 3 days.

## 11. Performance budgets (set after measuring on the lowest-spec pilot hardware)

Cold start of the Hub under 3 seconds on a modest Windows 10 or 11 machine; order-screen interactions under 100 ms on a low-end Android phone; item search results under 50 ms for 2,000 items; report queries under 300 ms on 100,000 bills with indexes; WebSocket event fan-out to 10 devices under 200 ms on typical Wi-Fi. Record the actual hardware, Windows version and driver versions in the spike results; do not publish minimum requirements until measured.

## 12. Repository layout and risks

```
mise/
  apps/hub/        Electron main, preload, console renderer, local server
  apps/client/     Responsive React client (served by the Hub)
  packages/core/   Money, GST, order, bill and pantry domain rules (pure functions)
  packages/db/     Schema, migrations, repositories
  packages/printing/ Adapters, queue, health monitor, templates, mock printer
  packages/shared/ Zod schemas, types, i18n catalogues, permission matrix
  docs/            All documents, DECISIONS.md, SECURITY.md, TEST_PLAN.md, RESEARCH_NOTES.md
  tests/           Fixtures, integration, end-to-end, chaos
  AGENTS.md
```

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Printer incompatibility | Critical | Physical spike, registry labels, no universal claim |
| Tax misconfiguration | Critical | CA-approved profiles, versioned rules, Practice mode |
| Hub failure | High | WAL, backups, UPS advice, paper fallback |
| Plain-HTTP pairing exposure | Medium to high | Protected Wi-Fi, approvals, HTTPS mode, short Manager code life |
| Duplicate bill, KOT or print | High | Idempotency, UNKNOWN state, explicit reprint |
| Client browser limits | Medium to high | Spike S2, two delivery modes, optional native wrapper |
| Native-module rebuild issues for SQLite on Electron | Medium | Spike S1, pinned versions, packaged-build test |
| AI agent scope drift | High | Milestone gating, review prompts, decision log |

## 13. Test strategy

| Layer | Tests | Gate |
| --- | --- | --- |
| Pure unit | Money, GST, rounding, state machines, permission matrix, invoice numbering, code generation and normalisation | All pass, property tests included |
| Database integration | Migrations up and rollback, constraints, transaction rollback, audit append-only, snapshots, optimistic locking | Pass on a temporary database |
| API and IPC | Validation, permission denials, idempotent replay, rate limiting, token revocation | No unhandled errors |
| Printing | Mock ESC/POS TCP server simulating paper-out, cover-open, offline, no-reply, timeout after write | Every health and job state reached |
| Multi-device end to end | Two or more simulated clients: concurrent orders, Wi-Fi drop and replay, device revoked mid-session | Repeatable in CI |
| UI | Loading, empty, error, success states; keyboard and touch; accessibility checks; 360 px and 1280 px | Zero critical issues |
| Hardware | Physical printers per exact model, driver, OS | Only tested models labelled verified |
| Resilience | Kill the Hub mid-bill, power loss during write, disk full, failed backup, clock change | No silent corruption or lost issued bill |
