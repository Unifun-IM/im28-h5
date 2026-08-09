# Architecture (im28-h5)

> TYPE: SYSTEM_MAP / WEB_IM_CONTRACT
> STATUS: CONVERSATION_MESSAGE_MVP_LOCAL
> AXIOM: `im28-h5` is a browser IM client. Gateway owns remote truth; local SQLite is an account-scoped, rebuildable cache persisted through IndexedDB.

## 1. Current State

| Surface | State | Owner |
| :--- | :--- | :--- |
| Web app shell | `MVP/local-verified` | `apps/web` |
| Page routing | `implemented` | React Router under `apps/web/src/app/App.tsx` |
| Browser SDK facade | `MVP` | `packages/im-sdk-web` |
| Shared SDK contracts | `linked` | `@im28/im-sdk/web` |
| Gateway runtime contract | `frozen` | `docs/runtime-contracts/web-gateway-runtime.md` |
| Conversation/message contract | `frozen` | `docs/runtime-contracts/web-conversation-message-sync.md` |
| Gateway runtime primitives | `implemented` | config parser, auth session store and lifecycle under `packages/im-sdk-web/src/runtime/**` |
| Account database lifecycle | `implemented` | auth-bound open/migrate/close owner under `packages/im-sdk-web/src/storage/account-database-lifecycle.ts` |
| Web SQLite adapter | `foundation` | `packages/im-sdk-web/src/storage/sqlite/**` |
| SQLite engine | `decided` | `sql.js` WASM |
| Durable browser storage | `decided` | IndexedDB database binary store |
| Web transport orchestration | `implemented/local-verified` | shared Gateway clients assembled under `packages/im-sdk-web/src/runtime/**` |
| HTTP conversation/message sync | `implemented/local-verified` | `packages/im-sdk-web/src/sync/**` |
| Realtime data persistence | `deferred` | `W4.a2` sync runtime |
| Multi-tab writer ownership | `deferred` | Web Locks or SharedWorker design required |

## 2. Runtime Topology

```text
apps/web React Router pages
-> @im28/im-sdk-web browser facade
-> authenticated WebIMSync facade (conversations + messages)
-> Gateway HTTP full sync/history/send + shared DTO-to-core mapper
-> typed deployment config + sessionStorage auth + localStorage device identity
-> auth success/restore opens migrated account SQLite; logout/invalidation closes it
-> @im28/im-sdk/web platform-neutral contracts and repositories
-> SqlJsIndexedDBDatabaseAdapter
-> sql.js SQLite database in memory
-> export Uint8Array after committed writes
-> IndexedDB binary snapshot keyed by account database name
```

## 3. Ownership

| Path | Owns | Must not own |
| :--- | :--- | :--- |
| `apps/web/src/app/App.tsx` | React Router 装配和页面匹配 | Gateway、SQL、页面业务逻辑 |
| `apps/web/src/pages/**` | 页面组合与可见交互 | 共享 DTO、直接 SQL、React Native 能力 |
| `packages/im-sdk-web/src/index.ts` | 浏览器 SDK facade 和共享 Web SDK 具名重导出 | 页面 UI、重复核心 SDK 语义 |
| `packages/im-sdk-web/src/runtime/**` | browser config、auth session 和 Gateway lifecycle | 页面 UI、生成接口复制、SQLite token persistence |
| `packages/im-sdk-web/src/sync/**` | auth/account-bound cache read、HTTP sync、history pull、optimistic send | token storage、页面 UI、重复 Gateway DTO mapping |
| `packages/im-sdk-web/src/storage/account-database-lifecycle.ts` | 单 tab 账户数据库 open/migrate/switch/close | token、Gateway 请求、跨 tab writer ownership |
| `packages/im-sdk-web/src/storage/sqlite/sqljs-indexeddb-database-adapter.ts` | SQL execution, transactions, in-process serialization, snapshot timing | auth, sync, UI |
| `packages/im-sdk-web/src/storage/sqlite/indexeddb-sqlite-binary-store.ts` | IndexedDB schema, binary read/write/delete | SQL execution, message semantics |
| `packages/im-sdk-web/src/storage/sqlite/account-database-name.ts` | deterministic account isolation | token persistence |
| `@im28/im-sdk/web` | database contract、shared DTO、Gateway-to-core mapper、Repository 和 runtime-neutral SDK surface | browser persistence implementation |

## 4. Persistence Contract

| Event | Durable action |
| :--- | :--- |
| `open()` | load latest account snapshot from IndexedDB, then create sql.js database |
| `execute()` | run one statement, export and persist one snapshot |
| `transaction()` success | `BEGIN -> statements -> COMMIT -> export -> persist` |
| `transaction()` failure | `ROLLBACK`; do not persist failed writes |
| `close()` | persist current snapshot, close SQLite, release memory |

## 5. Retained Non-Claims

- The current adapter is single-tab only; in-process serialization does not prevent a second tab from overwriting a newer snapshot.
- IndexedDB persistence does not make local data authoritative or immune to browser quota eviction/site-data clearing.
- `sql.js` runs in the caller thread in this foundation; a Worker RPC boundary is required before large-database production acceptance.
- `/login`、`/conversations`、`/conversations/:conversationID` 已由 React Router 接入真实 runtime/sync API；缺部署配置时 fail-closed。
- Browser fetch、device identity、login/restore/refresh/logout 与 realtime orchestration 已实现，但尚无真实 Gateway 凭据 smoke 证据。
- 会话全分页同步、历史拉取与文本发送已通过本地 sql.js/Repository 回归；认证后的真实会话/聊天 UI 尚无部署 smoke 证据。
- Realtime 当前只驱动连接生命周期；消息/会话 event 落库及 HTTP recovery convergence 留给 `W4.a2`。
- 共享 `@im28/im-sdk` 的原始 Gateway WebSocket message data 日志已在 canonical owner 清除，并通过共享 SDK 与 H5 回归验证。
- Media、RTC、notifications 和 service worker behavior 不在当前 MVP slice。
