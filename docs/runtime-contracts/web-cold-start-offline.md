# Web Cold-Start Offline Contract

> TYPE: RUNTIME / AUTH / STORAGE / SAFETY CONTRACT
> STATUS: IMPLEMENTATION_PARTIAL / NOT_CONSUMED
> AXIOM: 冷启动离线只允许读取已存在的账号 SQLite 快照；未重新通过 Gateway 鉴权前，不得暴露完整 `WebIMSync`、启动 realtime 或执行任何本地/远端 mutation。

## 1. Scope

| field | contract |
| :--- | :--- |
| entry | 同一 browser tab 的 `sessionStorage` 存在结构合法 session，且该 `userID` 已存在持久化账号快照 |
| supported UI | 会话列表、已缓存聊天历史、明确离线状态、手动重试和本地退出 |
| excluded UI | contacts/profile/group/call remote reads、presence、applications、search server results、media download/playback guarantee |
| excluded writes | send/retry/draft/mark-read、profile/security、friend/group/call/message/conversation mutation、upload、realtime convergence |
| RN boundary | `im28-phone` 继续冻结；本合同是 Web lifecycle/storage adapter，不宣称 RN consumer convergence |

## 2. Eligibility Decision

| condition | decision |
| :--- | :--- |
| session 缺失或损坏 | `anonymous`；损坏记录清除并显式报错 |
| `check-token` 成功且 valid | 正常 restore：open DB -> recover -> realtime |
| `check-token` 明确 invalid | 只走既有 refresh；refresh 失败/失效后清 session、close DB、`anonymous` |
| HTTP/业务错误 | fail closed；不得解释为离线 |
| browser fetch transport unavailable | 仅此类错误可尝试 offline restore |
| transport unavailable + durable snapshot absent/corrupt/busy | fail closed；不得创建空 DB 或只读假成功 |
| transport unavailable + existing snapshot opens | `offline-readonly`；保留 token-free `userID`，不信任 token 做远端操作 |

## 3. Ownership

| owner | responsibility |
| :--- | :--- |
| `browser-gateway-fetch` | 将 fetch transport failure 归一化为稳定、无 token 的 network-unavailable error；不吞 HTTP/Gateway error |
| `WebIMAccountDatabaseLifecycle` | `openExistingReadOnly(userID)`；只打开已有 durable snapshot，继续遵守 account Web Lock，不创建/持久化空库 |
| `WebIMRuntime` | `offline-readonly` lifecycle、offline identity、reconnect validation、invalid-session cleanup |
| `WebIMOfflineReader` | 仅公开 `conversations.listCachedItems` 与 `messages.getCachedHistory` 等明确 cache-only query；接口中不存在 mutation |
| H5 shell | 离线 banner、只读列表/聊天、隐藏 composer/action surfaces、retry/sign-out；不得从页面判断 token 或直接打开 IndexedDB |

Implementation checkpoint `.148.1a`: browser `TypeError` transport rejection is normalized to `GATEWAY_NETWORK_UNAVAILABLE` while non-transport failures remain unchanged；runtime lifecycle now has guarded `offline-readonly/offline-validating` transitions. `restore()`、storage open、reader and H5 consumers remain unchanged until `.148.1b/.148.2` pass their own gates.

Implementation checkpoint `.148.1b`: lifecycle `openExistingReadOnly` now carries an explicit mode through caller-thread/Worker sql.js adapters, aborts missing IndexedDB creation, skips migrations/export/close persistence and rejects execute/transaction at the adapter boundary. `WebIMOfflineReader` exposes only cached conversation items and message history through the same shared query owners. Runtime restore/reconnect and H5 consumers remain pending `.148.1c/.148.2`.

Implementation checkpoint `.148.1c`: production runtime now owns network-only offline restore、reader revocation、offline facade rejection、single-flight reconnect、invalid cleanup and stale reconnect cancellation. Valid or refreshed sessions upgrade the canonical readwrite/realtime path only after revalidation. H5 consumers remain pending `.148.2`, so no user-visible cold-start claim is made.

Delivery checkpoint `.148.2/.148.3`: H5 now consumes the runtime reader only through a dedicated offline route boundary；cached conversations/history、retry and sign-out are available while online tabs、calls、presence、settings、composer and mutation actions stay unmounted. Independent proxy-down reload、failed retry、valid reconnect and explicit-invalid cleanup passed with a real account. React StrictMode exposed duplicate cold restore, so SDK `restore()` now coalesces concurrent callers before session validation or database open.

## 4. Lifecycle

| current | event | next | side effect |
| :--- | :--- | :--- | :--- |
| `anonymous` | `offline_restored` | `offline-readonly` | existing read-only DB open；no realtime/recovery mutation |
| `offline-readonly` | `reconnect_started` | `offline-validating` | `check-token` only |
| `offline-validating` | `reconnect_failed_network` | `offline-readonly` | retain reader/DB/session；publish visible failure |
| `offline-validating` | `reconnect_succeeded` | `authenticated` | validated/refreshed session -> upgrade DB owner -> recover interrupted sends |
| `authenticated` | `realtime_connecting` | `connecting` | existing production path |
| `offline-validating` | `session_invalid` | `anonymous` | clear session、close DB、remove offline identity |
| `offline-readonly` | `signed_out` | `anonymous` | local clear/close；remote logout is skipped |

## 5. API Boundary

| API | offline behavior |
| :--- | :--- |
| `runtime.getSnapshot()` | `state=offline-readonly|offline-validating`、stable `userID`、no token、no fake `online` |
| `runtime.getOfflineReader()` | returns capability-minimal cache reader only in offline states |
| `runtime.getSync()` | rejects in offline states before returning a mutation-capable facade |
| `runtime.reconnect()` | single-flight validation；network failure retains offline state；invalid auth clears state |
| `runtime.signOut()` | always available and local-first |

## 6. Storage Rules

- Existing snapshot proof MUST precede offline UI; quota eviction/site-data clear is not an authenticated empty state.
- Read-only open MUST NOT call message recovery, migrations requiring durable writes, snapshot export or close-time persistence.
- Same-account Web Lock remains mandatory; `ACCOUNT_DATABASE_BUSY` stays visible and no second reader/writer fallback is allowed.
- Cache remains non-authoritative; no offline action queue, optimistic message or delayed mutation replay is permitted.

## 7. Reconnect Rules

1. Browser `online` is only a retry signal, not proof of connectivity.
2. `check-token valid -> authenticated -> realtime -> canonical sync`; invalid access token follows the existing refresh contract.
3. A server-declared invalid token always wins over cached identity and deletes the local session.
4. Reconnect must preserve account identity across every async boundary; a stale result cannot upgrade a switched/signed-out runtime.
5. Offline reader is revoked before normal mutation surfaces return.

## 8. Verification Gate

| layer | required evidence |
| :--- | :--- |
| lifecycle | network-only classification、existing snapshot requirement、offline/reconnect/invalid/sign-out transitions |
| storage | no-create read-only open、no migration/export/write、busy/corrupt/missing fail-closed |
| capability | offline reader has cache queries only；`getSync` and all mutation surfaces unavailable |
| H5 | cold reload preserves cached conversation/history、shows offline state、has no composer/actions/presence/call controls |
| reconnect | network failure retains cache；valid token restores normal runtime；invalid token routes to auth and closes DB |
| regression | Web SDK tests/typecheck/build:web/sync:web、H5 focused/full verify/build、RN protected diff empty |

## 9. Non-Claims

- 不支持离线登录、跨 tab/device session、离线发送队列、离线 mark-read、媒体离线副本或后台无限保活。
- 不以 `navigator.onLine`、历史截图、fixture、mock token 或跳过 `check-token` 证明安全恢复。
- H5 delivery is accepted only for the same-tab existing snapshot and Chromium evidence；cross-browser/device、offline writes/queue and media offline bytes remain explicit non-claims。
