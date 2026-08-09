# Web IM Storage

> TYPE: DECISION / STORAGE_CONTRACT
> STATUS: FOUNDATION_IMPLEMENTED
> DECISION: `sql.js + IndexedDB`, compatible with the `@im28/im-sdk/web` SQL `DatabaseAdapter` contract.

## 1. Decision

| Question | Decision |
| :--- | :--- |
| Browser query engine | `sql.js` SQLite WASM |
| Durable store | IndexedDB stores exported SQLite bytes |
| Canonical schema/query semantics | `@im28/im-sdk` migrations and repositories |
| Account isolation | one deterministic database key per normalized `userID` |
| Local authority | cache only; Gateway is authoritative |
| Token storage | excluded from SQLite snapshot |
| Write ordering | serialized inside one adapter instance |
| Multi-tab writes | rejected until cross-tab ownership exists |
| Auth lifecycle | login/restore opens and migrates the normalized account database; sign-out/token invalidation closes it |

## 2. Why This Path

| Option | Verdict | Reason |
| :--- | :--- | :--- |
| `sql.js + IndexedDB` | `ACCEPT` | preserves current SQL statements, migrations, indexes, and repositories |
| Dexie/IndexedDB repositories | `DEFER` | browser-native but duplicates current SQL repository implementation |
| `localStorage` | `REJECT` | synchronous, small quota, no transaction/query model |
| in-memory `sql.js` only | `REJECT` | reload loses all cache |
| OPFS SQLite | `DEFER` | stronger file semantics but adds Worker/VFS/browser deployment constraints before a Web app exists |

## 3. Data Lifecycle

```text
open account
-> normalize userID
-> key = im28-web-<encoded-userID>.sqlite
-> load ArrayBuffer from IndexedDB
-> new SQL.Database(bytes?)
-> run shared SDK migrations
-> repository reads/writes SQL
-> commit
-> db.export()
-> IndexedDB put(snapshot)
```

## 4. Failure Semantics

| Failure | Required behavior |
| :--- | :--- |
| invalid/missing account | reject before opening storage |
| corrupt IndexedDB record | reject; never silently replace with an empty database |
| SQL failure outside transaction | reject; no new snapshot |
| transaction callback/SQL failure | rollback and reject |
| IndexedDB snapshot failure after commit | reject; caller must not report durable success |
| quota eviction/site data clear | rebuild from Gateway after next login |

## 5. Production Gates

- [ ] Move sql.js execution behind a dedicated Worker RPC boundary.
- [ ] Add exclusive multi-tab writer ownership with Web Locks or SharedWorker.
- [ ] Run real `@im28/im-sdk` migrations and repository parity tests for all tables consumed by H5.
- [ ] Define snapshot compaction/write-amplification limits for large message histories.
- [ ] Handle `QuotaExceededError`, storage estimates, and best-effort persistent-storage request.
- [ ] Run Chromium, Firefox, and Safari reload/crash/quota/manual smoke.
- [ ] Add corruption recovery that preserves forensic evidence before rebuilding from Gateway.

## 6. Foundation Evidence

| Date | Evidence |
| :--- | :--- |
| 2026-08-09 | After moving storage into `packages/im-sdk-web`, root `npm run verify` passed: both workspace typechecks, 1 Vitest file / 3 tests, SDK declaration build and Vite App build. Tests use real `sql.js` WASM, `fake-indexeddb`, shared `@im28/im-sdk` migrations and `MessageRepository`; covered account naming, reload persistence and failed-transaction rollback. |
| 2026-08-09 | Account lifecycle owner passed real sql.js migration/account-switch/reopen tests and runtime login/restore/sign-out/token-invalid/database-failure tests. Root gate passed with 10 Vitest files / 25 tests; Chromium loaded WASM and completed isolated account DB open/migrate/close with no warning/error, then deleted the smoke IndexedDB container. |

Accepted gap: Chromium proves account DB open/migrate/close, but reload/crash/quota recovery and Firefox/Safari evidence remain pending.
