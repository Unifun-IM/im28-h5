# Architecture (im28-h5)

> TYPE: SYSTEM_MAP / WEB_IM_CONTRACT
> STATUS: CONVERSATION_MESSAGE_MVP_LOCAL / WORKER_WEB_LOCK_STORAGE_LOCAL / RN_PARITY_FOUNDATION
> AXIOM: `im28-h5` is a browser IM client. Gateway owns remote truth; local SQLite is an account-scoped, rebuildable cache persisted through IndexedDB.

## 1. Current State

| Surface | State | Owner |
| :--- | :--- | :--- |
| Web app shell | `MVP/local-verified` | `apps/web` |
| Page routing | `implemented` | React Router under `apps/web/src/app/App.tsx` |
| RN migration contract | `frozen` | `docs/rn-h5-migration-contract.md` |
| RN static asset mirror | `implemented/hash-verified` | 466 files under `apps/web/src/assets/rn/**` |
| RN light/dark theme tokens | `foundation-copied` | `apps/web/src/styles/rn-theme.css` |
| RN page visual parity | `active/not-accepted` | account-login core is `done-local`; conversation/chat remain functional scaffolds |
| Browser SDK facade | `MVP` | `packages/im-sdk-web` |
| Shared SDK contracts | `linked` | `@im28/im-sdk/web` |
| Gateway runtime contract | `frozen` | `docs/runtime-contracts/web-gateway-runtime.md` |
| Conversation/message contract | `frozen` | `docs/runtime-contracts/web-conversation-message-sync.md` |
| Gateway runtime primitives | `implemented` | config/auth/lifecycle plus public platform-term adapter under `packages/im-sdk-web/src/runtime/**` |
| Account database lifecycle | `implemented` | auth-bound open/migrate/close owner under `packages/im-sdk-web/src/storage/account-database-lifecycle.ts` |
| Web SQLite adapter | `implemented/local-verified` | Worker RPC client/runtime + `packages/im-sdk-web/src/storage/sqlite/**` engine |
| SQLite engine | `decided` | `sql.js` WASM |
| Durable browser storage | `decided` | IndexedDB database binary store |
| Web transport orchestration | `implemented/local-verified` | shared Gateway clients assembled under `packages/im-sdk-web/src/runtime/**` |
| HTTP conversation/message sync | `implemented/local-verified` | `packages/im-sdk-web/src/sync/**` |
| Realtime message/conversation persistence | `implemented/local-verified` | `packages/im-sdk-web/src/sync/realtime-sync.ts` |
| Realtime message updates | `implemented/local-verified` | independent update cursor under `packages/im-sdk-web/src/sync/**` |
| Same-tab sync/delta serialization | `implemented/local-verified` | shared FIFO owner under `packages/im-sdk-web/src/sync/sync-mutation-queue.ts` |
| Dedicated Worker SQL owner | `implemented/local-verified` | production app injects Vite module Worker; RPC/storage parity and fatal-state regressions passed |
| Storage production boundary | `implemented-local/browser-gated` | Dedicated Worker + account lifecycle Web Lock passed local gates; browser matrix pending |
| Multi-tab writer ownership | `implemented-local/browser-gated` | exclusive lifecycle Web Lock; busy/unsupported fail closed; cross-browser evidence pending |

## 2. Runtime Topology

```text
apps/web React Router pages
-> RN-sourced HTML/CSS composition + byte-identical assets
-> @im28/im-sdk-web browser facade
-> authenticated WebIMSync facade (conversations + messages + shared mutation queue)
-> Gateway HTTP full sync/history/send + shared DTO-to-core mapper
-> normalized message/conversation events -> serialized persistence + paged HTTP gap recovery
-> successful realtime writes publish dataVersion -> routed pages reread SQLite cache
-> typed deployment config + sessionStorage auth + localStorage device identity
-> public platform terms through generated OpenAPI operation without auth/session coupling
-> auth success/restore opens migrated account SQLite; logout/invalidation closes it
-> @im28/im-sdk/web platform-neutral contracts and repositories
-> main-thread WorkerDatabaseAdapter serializes typed RPC
-> Dedicated module Worker owns SqlJsIndexedDBDatabaseAdapter
-> sql.js SQLite database in Worker memory
-> export Uint8Array after committed writes
-> IndexedDB binary snapshot keyed by account database name
```

W5.a3 production ownership path:

```text
account lifecycle
-> acquire exclusive Web Lock before snapshot read
-> Dedicated module Worker owns sql.js + IndexedDB
-> main-thread DatabaseAdapter serializes typed RPC
-> healthy close ack or fatal Worker discard
-> release Web Lock after the Worker can no longer write
```

## 3. Ownership

| Path | Owns | Must not own |
| :--- | :--- | :--- |
| `apps/web/src/app/App.tsx` | React Router 装配和页面匹配 | Gateway、SQL、页面业务逻辑 |
| `apps/web/src/pages/**` | 由 RN 源映射驱动的页面组合、可见交互与 feature hook 调用 | 共享 DTO、直接 SQL、React Native 能力、直接 Gateway/API 调用 |
| `apps/web/src/styles/rn-theme.css` | RN light/dark/profile/chat token 的浏览器 CSS 映射 | 页面专属几何、独立设计系统 |
| `apps/web/src/assets/rn/**` | RN 业务资产的字节级镜像和哈希清单 | 手工重绘、近似替代、远程热链 |
| `packages/im-sdk-web/src/index.ts` | 浏览器 SDK facade 和共享 Web SDK 具名重导出 | 页面 UI、重复核心 SDK 语义 |
| `packages/im-sdk-web/src/runtime/**` | browser config、auth session、Gateway lifecycle 与 generated-operation-backed public term adapter | 页面 UI、生成接口复制、SQLite token persistence |
| `packages/im-sdk-web/src/sync/**` | auth/account-bound cache read、HTTP sync、history pull、optimistic send、realtime persistence/recovery | token storage、页面 UI、重复 Gateway DTO mapping |
| `packages/im-sdk-web/src/storage/account-database-lifecycle.ts` | 单 tab 账户数据库 open/migrate/switch/close 与显式 Worker adapter 组合 | token、Gateway 请求、跨 tab writer ownership |
| `packages/im-sdk-web/src/storage/sqlite/sqljs-indexeddb-database-adapter.ts` | Worker 内 SQL execution、transactions、snapshot timing 与 fatal discard；caller-thread 仅供显式测试/兼容组合 | auth, sync, UI |
| `packages/im-sdk-web/src/storage/sqlite/indexeddb-sqlite-binary-store.ts` | IndexedDB schema, binary read/write/delete | SQL execution, message semantics |
| `packages/im-sdk-web/src/storage/sqlite/account-database-name.ts` | deterministic account isolation | token persistence |
| `packages/im-sdk-web/src/storage/worker/**` | typed RPC、sql.js execution、snapshot durability 与 fatal-state discard | auth、UI、Gateway semantics |
| `packages/im-sdk-web/src/storage/lock/**` | account-scoped Web Lock acquisition/release and busy/unsupported errors | short write locks、`localStorage` lease、hidden fallback |
| `@im28/im-sdk/web` | database contract、shared DTO、Gateway-to-core mapper、Repository 和 runtime-neutral SDK surface | browser persistence implementation |

## 4. RN Parity Boundary

```text
im28-phone screen/component + StyleSheet + theme + asset + service behavior
-> docs/rn-h5-migration-contract.md source mapping
-> React Router route + semantic HTML/CSS + RN asset import
-> @im28/im-sdk-web feature/runtime call
-> responsive/light/dark/route/API evidence
-> parity-accepted
```

React Native components and `StyleSheet` objects are not runtime dependencies of H5. Browser adaptation may change primitives, safe-area implementation, focus/hover and responsive sizing; it may not replace the RN information hierarchy, artwork, visual states or business result. Full-screen RN state must become a React Router route, while non-addressable sheets/previews may remain route-owned modal state.

## 5. Persistence Contract

| Event | Durable action |
| :--- | :--- |
| `open()` | load latest account snapshot from IndexedDB, then create sql.js database |
| `execute()` | run one statement, export and persist one snapshot |
| `transaction()` success | `BEGIN -> statements -> COMMIT -> export -> persist` |
| `transaction()` failure | `ROLLBACK`; do not persist failed writes |
| `close()` | persist current snapshot, close SQLite, release memory |

The W5.a2 adapter reports success only after IndexedDB commit. Any post-mutation snapshot failure is fatal: it discards the in-memory database without a final export, terminates the Worker and requires reopen from the last durable snapshot.

## 6. Retained Non-Claims

- Production composition now requires an account lifecycle Web Lock before creating the Worker; cross-tab safety remains a browser acceptance non-claim until the Chromium/Firefox/Safari two-tab matrix passes.
- Missing Web Locks and same-account contention fail closed before Worker creation; there is no empty, read-only or caller-thread production fallback.
- IndexedDB persistence does not make local data authoritative or immune to browser quota eviction/site-data clearing.
- The production App now injects a Dedicated Worker; real browser SQL open/migrate still lacks an authenticated account smoke, while Vite Worker/WASM build and in-process protocol parity are verified.
- `/login`、`/conversations`、`/conversations/:conversationID` 已由 React Router 接入真实 runtime/sync API；缺部署配置时 fail-closed。
- `/login` 的账号密码核心表单、RN 资产、协议确认和真实平台条款查询已完成本地迁移；剩余 auth 入口归 W6.a5，真实登录成功与 390/desktop 明暗截图矩阵未验收，因此仍不得标记为 `parity-accepted`。
- `/conversations` 与 `/conversations/:conversationID` 仍是 API 骨架，其通用图标和现有 `app.css` 尚未完成 RN 样式/资产迁移。
- Browser fetch、device identity、login/restore/refresh/logout 与 realtime orchestration 已实现，但尚无真实 Gateway 凭据 smoke 证据。
- 会话全分页同步、历史拉取与文本发送已通过本地 sql.js/Repository 回归；认证后的真实会话/聊天 UI 尚无部署 smoke 证据。
- 新消息与会话变更事件已由 runtime 默认串行落库；seq 缺口按本地 cursor 正序分页补拉，成功后通过 `dataVersion` 驱动当前路由页面重读 cache。
- 消息编辑与删除/全员撤回已使用独立 `update_seq` cursor 落库，不改变 `msg_seq/unread`；cursorless 旧编辑按服务端时间拒绝。
- 全量会话同步、history、send 与 realtime delta 已共享同 tab FIFO 业务队列；该保证不扩展到多标签页 writer。
- 共享 `@im28/im-sdk` 的原始 Gateway WebSocket message data 日志已在 canonical owner 清除，并通过共享 SDK 与 H5 回归验证。
- Media、RTC、notifications 和 service worker behavior 不在当前 MVP slice。
