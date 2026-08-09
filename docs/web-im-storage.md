# Web IM Storage

> TYPE: DECISION / STORAGE_CONTRACT
> STATUS: WORKER_AND_WEB_LOCK_IMPLEMENTED_LOCAL / BROWSER_MATRIX_PENDING
> DECISION: `sql.js + IndexedDB` remains the cache engine; production execution uses a Dedicated Worker protected by an account-database lifecycle Web Lock.

## 1. Stable Decision

| Question | Decision |
| :--- | :--- |
| Browser query engine | `sql.js` SQLite WASM |
| Durable store | IndexedDB stores exported SQLite bytes |
| Canonical schema/query semantics | `@im28/im-sdk` migrations and repositories |
| Account isolation | one deterministic database key per normalized `userID` |
| Local authority | cache only; Gateway is authoritative |
| Token storage | excluded from SQLite snapshot |
| SQL execution owner | one Dedicated module Worker per open account database |
| Same-tab ordering | one `DatabaseAdapter` RPC queue; transaction child operations cannot interleave |
| Cross-tab ownership | one exclusive Web Lock held from before snapshot read until Worker close/discard |
| Busy tab behavior | fail fast with `ACCOUNT_DATABASE_BUSY`; never open an empty/read-only fallback |
| Unsupported coordination | fail closed with `STORAGE_COORDINATION_UNAVAILABLE`; no `localStorage` lease fallback |
| Auth lifecycle | login/restore acquires, opens and migrates the account database; sign-out/invalidation closes it and releases ownership |

## 2. Architecture Verdict

Verdict: `ACCEPT_WITH_CONSTRAINTS`.

| Option | Verdict | Reason |
| :--- | :--- | :--- |
| `sql.js + IndexedDB` | `ACCEPT` | preserves current SQL statements, migrations, indexes and repositories |
| Dedicated Worker + Web Locks | `ACCEPT` | removes sql.js work from the UI thread and gives the complete in-memory snapshot lifecycle one cross-tab owner |
| lock each write only | `REJECT` | each tab can retain a stale in-memory SQLite image and later overwrite a newer full snapshot |
| `SharedWorker` as primary owner | `DEFER` | simultaneous multi-tab access is not required; it adds shared auth/account routing and implementation-defined worker lifetime |
| `localStorage` lease | `REJECT` | expiry and tab suspension cannot prove exclusive ownership; split-brain remains possible |
| Dexie/IndexedDB repositories | `DEFER` | browser-native but duplicates current SQL repository implementation |
| in-memory `sql.js` only | `REJECT` | reload loses all cache |
| OPFS SQLite | `DEFER` | stronger file semantics but changes the VFS, deployment and browser validation surface |

Platform basis:

- [Web Locks](https://www.w3.org/TR/web-locks/) exposes exclusive named locks to Window and Worker agents in the same origin/storage bucket, and holds a lock until the request callback promise settles.
- [HTML Workers](https://html.spec.whatwg.org/multipage/workers.html) leaves Worker lifetime and suspension decisions to the user agent; a `SharedWorker` therefore does not remove recovery requirements.
- [Vite Worker support](https://vite.dev/guide/features.html#web-workers) supports a module Worker through `new Worker(new URL(..., import.meta.url), { type: 'module' })`.

## 3. Target Ownership Topology

```text
account lifecycle (main thread)
-> derive account database name and lock name
-> navigator.locks.request(lockName, { mode: 'exclusive', ifAvailable: true })
-> lock acquired: create Dedicated module Worker
-> Worker loads sql.js WASM and latest IndexedDB snapshot
-> Worker runs shared migrations
-> publish DatabaseAdapter only after open/migration succeeds
-> serialize query/execute/transaction RPC
-> close ack or fatal discard terminates Worker
-> settle lock callback and release exclusive ownership
```

The lock name is `im28-h5:sqlite:<accountDatabaseName>`. `steal` is prohibited. Ownership begins before the Worker reads IndexedDB and ends only after the Worker can no longer write.

## 4. Lifecycle State Contract

| State | Allowed transition | Required behavior |
| :--- | :--- | :--- |
| `idle` | `acquiring` | no Worker and no exposed adapter |
| `acquiring` | `opening` | obtain the account lock with `ifAvailable: true`; null means `ACCOUNT_DATABASE_BUSY` |
| `opening` | `ready` | create Worker, load snapshot, run migrations, then expose adapter |
| `ready` | `closing` | stop accepting new operations and drain the serialized RPC queue |
| `closing` | `idle` | persist final healthy snapshot, close SQLite, acknowledge, terminate Worker, release lock |
| any live state | `faulted` | reject pending/new operations, terminate Worker without a final export, then release lock |

`pagehide` may request best-effort close, but must not release ownership before a close acknowledgement. If a page is suspended, keeping the lock is safer than allowing a second stale snapshot owner. Document/Worker termination releases the Web Lock; the next owner reloads the last durable snapshot.

## 5. Worker RPC Contract

Every request has `{ id, operation, payload }`. Every response is either `{ id, ok: true, result }` or `{ id, ok: false, error: { code, message, retryable } }`.

| Operation | Payload/result contract |
| :--- | :--- |
| `open` | database name, WASM URL and IndexedDB store config; returns only after snapshot load |
| `execute` | one shared `DatabaseStatement`; resolves after the new snapshot is durable |
| `query` | one shared `DatabaseStatement`; returns structured-cloned rows |
| `transaction.begin` | creates one active transaction ID |
| `transaction.execute/query` | requires the active transaction ID |
| `transaction.commit` | COMMIT, export and durable IndexedDB write; then acknowledges |
| `transaction.rollback` | rolls back the active transaction |
| `close` | persists only a healthy database, closes it, then acknowledges |

The main-thread adapter retains the existing `DatabaseAdapter` surface and one FIFO RPC queue. While `transaction(run)` owns the queue, only its transaction-scoped RPC calls may run. The Worker rejects mismatched or nested transaction IDs.

The main thread passes a resolved WASM URL string; functions are not cloneable. Caller-owned `ArrayBuffer` parameters are cloned rather than transferred so a database call cannot detach caller state. Worker-created binary query results may be transferred.

Each request has a watchdog. A timeout faults and terminates the Worker because operation outcome is unknown; exact timeout values remain configuration-owned and must be covered by focused tests.

## 6. Durability And Failure Semantics

An operation reports success only after its corresponding IndexedDB transaction completes.

| Failure | Required behavior |
| :--- | :--- |
| invalid/missing account | reject before acquiring/opening storage |
| lock unavailable | reject `ACCOUNT_DATABASE_BUSY`; keep the tab auth session and show retry/close-other-tab UI |
| Web Locks unavailable | reject `STORAGE_COORDINATION_UNAVAILABLE`; do not silently downgrade |
| corrupt IndexedDB record | reject; preserve forensic evidence before an explicit rebuild |
| SQL failure outside transaction | reject; no new snapshot; database may remain ready when SQLite state is unchanged |
| transaction callback/SQL failure before COMMIT | rollback and reject |
| Worker protocol violation or timeout | enter `faulted`, reject all operations and discard the Worker |
| IndexedDB snapshot failure after SQL mutation/COMMIT | enter `faulted`; discard the in-memory database without final export because it is ahead of durable truth |
| quota eviction/site data clear | reopen an empty cache only when the store proves no record exists, then rebuild from Gateway |
| page/Worker crash | automatic lock release; next owner reloads the last completed IndexedDB snapshot and resyncs from Gateway |

The shared sql.js engine now satisfies the fatal snapshot-failure rule: after a failed durable write it discards memory state, rejects subsequent work and lets `close()` return without another export. The production App explicitly injects the Worker adapter; direct caller-thread composition remains test/compatibility-only.

## 7. Implementation Slices

| Slice | Deliverable | Exit evidence |
| :--- | :--- | :--- |
| `W5.a1-storage-boundary` | this decision, lifecycle, RPC and failure contract | architecture review and executable regression list |
| `W5.a2-worker-runtime` | typed Worker protocol/client, Worker-owned sql.js/IndexedDB adapter, fatal-state handling | adapter parity, transaction isolation, persistence failure and timeout tests; workspace verify |
| `W5.a3-multi-tab-writer` | lifecycle Web Lock owner and visible busy/unsupported states | real two-tab acquire/release/crash regression in Chromium, Firefox and Safari |
| `W5.a4-storage-operations` | quota estimate/persistence request, compaction limit and corruption rebuild workflow | large-history, quota and recovery evidence |

## 8. Executable Regression Plan

- Worker adapter passes the current migrations, account isolation, reload persistence and rollback suite unchanged at the `DatabaseAdapter` boundary.
- Delayed query/write RPCs resolve in caller order; transaction children cannot interleave with a normal request.
- A post-COMMIT IndexedDB failure rejects the caller, faults the adapter and cannot become durable through `close()`.
- Worker error, malformed response and request timeout reject pending requests and allow a clean future reopen from the last durable snapshot.
- Two tabs targeting different accounts can open concurrently; two tabs targeting the same account yield exactly one owner and one `ACCOUNT_DATABASE_BUSY` result.
- Owner close allows the waiting user action to retry successfully; owner crash allows a new owner without stale-snapshot overwrite.
- Missing Web Locks fails closed; no alternate writer path is created.
- Chromium, Firefox and Safari cover open/reload/close/crash; quota and corruption scenarios remain W5.a4 gates.

## 9. Evidence

| Date | Evidence |
| :--- | :--- |
| 2026-08-09 | Foundation adapter root `npm run verify` passed with real `sql.js` WASM, `fake-indexeddb`, shared migrations and `MessageRepository`; covered account naming, reload persistence and failed-transaction rollback. |
| 2026-08-09 | Account lifecycle passed sql.js migration/account-switch/reopen plus runtime login/restore/sign-out/token-invalid/database-failure tests; Chromium completed isolated account DB open/migrate/close. |
| 2026-08-09 | W5.a1 reviewed current full-snapshot semantics against Web Locks, HTML Worker lifetime and Vite module Worker constraints; production boundary frozen as Dedicated Worker + lifecycle Web Lock. Implementation and browser concurrency evidence remain pending. |
| 2026-08-09 | W5.a2 added typed/Zod-validated RPC, FIFO transaction child operations, Dedicated Worker sql.js/IndexedDB ownership, timeout/fatal termination and no-repersist failure handling. Root verify passed with 18 files / 47 tests; Vite emitted a distinct Worker chunk and WASM asset; clean login cold start had no warning/error or overflow. |
| 2026-08-09 | W5.a3 added account-scoped lifecycle Web Lock ownership, `ACCOUNT_DATABASE_BUSY` / unsupported fail-closed errors, acquire-before-Worker and terminate-before-release ordering, restore error visibility, and same/different-account/retry/no-fallback regressions. Root verify passed with 19 files / 52 tests; login cold start remained clean. Real browser lock/two-tab matrix is still pending. |

Accepted gap: real Worker SQL open/migrate plus same-account close/crash behavior still needs Chromium, Firefox and Safari evidence. No production-ready multi-tab storage claim is allowed until that matrix passes.
