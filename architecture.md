# Architecture (im28-h5)

> TYPE: SYSTEM_MAP / WEB_IM_CONTRACT
> STATUS: CONVERSATION_MESSAGE_MVP_LOCAL / WORKER_WEB_LOCK_STORAGE_LOCAL / RN_PARITY_CORE_LOCAL
> AXIOM: `im28-h5` is a browser IM client. Gateway owns remote truth; local SQLite is an account-scoped, rebuildable cache persisted through IndexedDB.

## 1. Current State

| Surface | State | Owner |
| :--- | :--- | :--- |
| Web app shell | `MVP/local-verified` | `apps/web` |
| Page routing | `implemented` | React Router under `apps/web/src/app/App.tsx`; authenticated primary routes use `PrimaryTabsLayout` |
| RN migration contract | `frozen` | `docs/rn-h5-migration-contract.md` |
| RN static asset mirror | `implemented/hash-verified` | 466 files under `apps/web/src/assets/rn/**` |
| RN light/dark theme tokens | `foundation-copied` | `apps/web/src/styles/rn-theme.css` |
| RN page visual parity | `active/not-accepted` | auth entry、conversation、chat、contacts/joined-groups、calls、me/profile/security、settings、global primary tab shell and onboarding core/subroutes are local/acceptance-gated；valid onboarding context and external data/browser proof remain open |
| Browser SDK facade | `MVP` | `../im28-sdk/src/platforms/web` |
| Web SDK distribution | `generated/committed` | `packages/im-sdk/package.json + dist/{core,web}` generated from sibling `im28-sdk` |
| Shared SDK contracts | `local-package` | `@im28/im-sdk/core` resolved through `apps/web -> file:../../packages/im-sdk` |
| Gateway runtime contract | `frozen` | `docs/runtime-contracts/web-gateway-runtime.md` |
| Conversation/message contract | `frozen` | `docs/runtime-contracts/web-conversation-message-sync.md` |
| Settings cache/version contract | `frozen/partially-implemented` | `docs/runtime-contracts/web-settings-cache-version.md`；cache blocked-storage，version done-local/acceptance-gated |
| Gateway runtime primitives | `implemented` | config、login/register auth lifecycle and public platform-term adapter under `../im28-sdk/src/platforms/web/runtime/**` |
| Account database lifecycle | `implemented` | auth-bound open/migrate/close owner under `../im28-sdk/src/platforms/web/storage/account-database-lifecycle.ts` |
| Web SQLite adapter | `implemented/local-verified` | Worker RPC client/runtime + `../im28-sdk/src/platforms/web/storage/sqlite/**` engine |
| SQLite engine | `decided` | `sql.js` WASM |
| Durable browser storage | `decided` | IndexedDB database binary store |
| Web transport orchestration | `implemented/local-verified` | shared Gateway clients assembled under `../im28-sdk/src/platforms/web/runtime/**` |
| HTTP conversation/message sync | `implemented/local-verified` | `../im28-sdk/src/sync/**` |
| HTTP contact list | `implemented-local/acceptance-gated` | remote paged `GatewayHTTPClient.listFriends` facade under `../im28-sdk/src/sync/contact-sync.ts`; cache-first/Pinyin parity pending |
| HTTP joined-group cache/sync | `implemented-local/acceptance-gated` | `WebIMSync.groups` reads account SQLite through shared `GroupRepository`, then replaces cache only after all `GatewayHTTPClient.myGroupList` pages succeed |
| HTTP call-record cache/sync/delete | `implemented-local/acceptance-gated` | `WebIMSync.calls` uses shared Gateway v2 list/delete operations and account-scoped app-owned `call_records` SQLite cache |
| HTTP current-user profile | `implemented-local/acceptance-gated` | `WebIMSync.profile.getCurrent/update` uses shared current-detail/update-profile operations for nickname、gender、bio; avatar/QR/security remain separate |
| HTTP account credentials | `implemented-local/acceptance-gated` | `WebIMRuntime.setAccountPassword/resetPassword` uses shared Gateway operations; reset success clears realtime/session/account DB before account-login routing |
| HTTP notification settings | `implemented-local/acceptance-gated` | `WebIMRuntime.getSettings().getNotification/updateNotification` reuse shared Gateway detail/switch operations；real read proven, approved write evidence pending |
| HTTP permission settings | `implemented-local/acceptance-gated` | `WebIMRuntime.getSettings().getPermission/updatePermission` reuse shared Gateway detail/switch operations；five RN fields and real read proven, approved write evidence pending |
| HTTP blacklist list/remove | `implemented-local/acceptance-gated` | `WebIMSync.blacklist` uses shared Gateway list/remove operations；paged normalization, contact enrichment and success-only page removal are locally verified |
| Public Web client version | `implemented-local/acceptance-gated` | `WebIMRuntime.getClientVersion()` uses required deployment identity、shared `platform=web` operation and HTTPS/loopback URL policy；real no-update proven, update modal response pending |
| Realtime message/conversation persistence | `implemented/local-verified` | `../im28-sdk/src/sync/realtime-sync.ts` |
| Realtime message updates | `implemented/local-verified` | independent update cursor under `../im28-sdk/src/sync/**` |
| Same-tab sync/delta serialization | `implemented/local-verified` | shared FIFO owner under `../im28-sdk/src/sync/sync-mutation-queue.ts` |
| Dedicated Worker SQL owner | `implemented/local-verified` | production app injects Vite module Worker; RPC/storage parity and fatal-state regressions passed |
| Storage production boundary | `implemented-local/browser-gated` | Dedicated Worker + account lifecycle Web Lock passed local gates; browser matrix pending |
| Multi-tab writer ownership | `implemented-local/browser-gated` | exclusive lifecycle Web Lock; busy/unsupported fail closed; cross-browser evidence pending |

## 2. Runtime Topology

```text
apps/web React Router pages
-> PrimaryTabsLayout for authenticated primary routes only
-> AuthOnboardingProvider for memory-only pending registration + account-scoped onboarding intent
-> RN-sourced HTML/CSS composition + byte-identical assets
-> @im28/im-sdk/web browser facade
-> authenticated WebIMSync facade (conversations + messages + contacts + groups + calls + blacklist + shared mutation queue)
-> contacts branch: paged shared Gateway friend-list client -> normalized remote-only page model
-> blacklist branch: paged shared Gateway blacklist client + contact enrichment -> remote-only page model
-> calls branch: Gateway v2 full list/delete -> Web app-owned call_records cache -> paged page model
-> conversation/message branch: Gateway HTTP full sync/history/send + shared DTO-to-core mapper
-> normalized message/conversation events -> serialized persistence + paged HTTP gap recovery
-> successful realtime writes publish dataVersion -> routed pages reread SQLite cache
-> typed deployment config + sessionStorage auth + localStorage device identity
-> public platform terms through generated OpenAPI operation without auth/session coupling
-> login/register success or restore opens migrated account SQLite; logout/invalidation closes it
-> @im28/im-sdk/core platform-neutral contracts and repositories
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
| `apps/web/src/app/PrimaryTabsLayout.tsx` | authenticated primary-route Outlet、底栏可见性和真实 cache 未读投影 | 页面业务、Gateway 请求、tab-specific feature state |
| `apps/web/src/components/**` | 跨页面 RN SVG mask 与 avatar fallback 浏览器适配 | 业务状态、页面布局、Gateway/SDK 调用 |
| `apps/web/src/components/primary-tabs/**` | RN HomeTabBar 的全局展示、资产、角标上报 contract | feature route 实现、Gateway/Repository 调用、me placeholder 页面 |
| `apps/web/src/pages/**` | 由 RN 源映射驱动的页面组合、可见交互与 feature hook 调用 | 共享 DTO、直接 SQL、React Native 能力、直接 Gateway/API 调用 |
| `apps/web/src/pages/login/AuthOnboardingProvider.tsx` | memory-only pending registration、secret-free account marker、current-detail initialized profile draft and guarded invite/profile/subroute intent | auth token/session truth、remote profile truth、Gateway validation、verification secret persistence |
| `apps/web/src/styles/rn-theme.css` | RN light/dark/profile/chat token 的浏览器 CSS 映射 | 页面专属几何、独立设计系统 |
| `apps/web/src/assets/rn/**` | RN 业务资产的字节级镜像和哈希清单 | 手工重绘、近似替代、远程热链 |
| `../im28-sdk/src/platforms/web/index.ts` | 浏览器 SDK facade 和共享 Web SDK 具名重导出 | 页面 UI、重复核心 SDK 语义 |
| `../im28-sdk/src/platforms/web/runtime/**` | browser config、auth session、Gateway lifecycle 与 generated-operation-backed public term adapter | 页面 UI、生成接口复制、SQLite token persistence |
| `../im28-sdk/src/sync/**` | auth/account-bound conversation/message/group/call cache read/write、HTTP/realtime sync，以及 remote-only contact/blacklist/friend/group-application paging/normalization | token storage、页面 UI、重复 Gateway endpoint/DTO contract |
| `../im28-sdk/src/sync/blacklist-sync.ts` | blacklist auth guard、分页去重、资料归一化、联系人关系补全与 success-only remove port | 页面 UI、endpoint/envelope 复制、加入黑名单的用户资料 flow |
| `../im28-sdk/src/sync/friend-application-sync.ts` | friend-application auth guard、分页去重、incoming/outgoing 归一化与 success-only accept port | 页面 UI、endpoint/envelope 复制、unread/read、reject、group verification 或 profile navigation |
| `../im28-sdk/src/sync/group-application-sync.ts` | group-application audit auth guard、分页去重、group/applicant 归一化与 success-only accept/reject ports | 页面 UI、第二条 per-group transport、unread/read、group profile/manage 或 member join flow |
| `../im28-sdk/src/sync/joined-group-sync.ts` | joined-group auth/account guard、`GroupRepository` cache read、`myGroupList` 全分页去重与 success-only replace | 页面 UI、page fetch、create/manage/member mutation、第二个 group cache owner |
| `../im28-sdk/src/platforms/web/storage/account-database-lifecycle.ts` | 单 tab 账户数据库 open/migrate/switch/close 与显式 Worker adapter 组合 | token、Gateway 请求、跨 tab writer ownership |
| `../im28-sdk/src/platforms/web/storage/sqlite/sqljs-indexeddb-database-adapter.ts` | Worker 内 SQL execution、transactions、snapshot timing 与 fatal discard；caller-thread 仅供显式测试/兼容组合 | auth, sync, UI |
| `../im28-sdk/src/platforms/web/storage/sqlite/indexeddb-sqlite-binary-store.ts` | IndexedDB schema, binary read/write/delete | SQL execution, message semantics |
| `../im28-sdk/src/platforms/web/storage/sqlite/account-database-name.ts` | deterministic account isolation | token persistence |
| `../im28-sdk/src/platforms/web/storage/worker/**` | typed RPC、sql.js execution、snapshot durability 与 fatal-state discard | auth、UI、Gateway semantics |
| `../im28-sdk/src/platforms/web/storage/lock/**` | account-scoped Web Lock acquisition/release and busy/unsupported errors | short write locks、`localStorage` lease、hidden fallback |
| `@im28/im-sdk/core` | database contract、shared DTO、Gateway-to-core mapper、Repository 和 runtime-neutral SDK surface | browser persistence implementation |

## 4. RN Parity Boundary

```text
im28-phone screen/component + StyleSheet + theme + asset + service behavior
-> docs/rn-h5-migration-contract.md source mapping
-> React Router route + semantic HTML/CSS + RN asset import
-> @im28/im-sdk/web feature/runtime call
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
- `/login` replace 到 `/auth/phone`；auth、conversation/chat、contacts/calls、`/me/**` 与 `/me/settings/display|notifications|permissions|blacklist|terms` 均由 React Router 接入真实 runtime/sync or browser preference owner；缺部署配置时 fail-closed。
- 四个 auth-entry routes 的 RN 样式/资产/协议/条款与 login/register facade 已完成本地迁移；真实认证成功、亮色截图和验证码发送 contract 未验收，因此仍不得标记为 `parity-accepted`。
- 注册成功已与既有账号登录成功分流：register caller 写入仅含 userID/source-mode 的 account marker 并进入认证态 `/auth/complete-profile`；邀请码只通过同一 register operation 的 optional `invite_code` 重试，pending verification code 仅存内存。完善资料的 gender/bio 全屏状态由 `/auth/complete-profile/gender|bio` 承载并只更新 Provider memory draft，主表单是唯一 update-profile caller。有效新账号的真实 Network/result 与 light/dark responsive proof 仍未验收。
- Gateway 当前无验证码发送 operation；页面只公开固定 `666666` 联调限制，不启动倒计时、不声称发送成功。忘记密码与 network/cache settings 仍未完成；version 已本地闭环。
- `/conversations` 已完成 RN header/search/72px row/avatar/preview/time/pinned/muted/unread/loading/empty/error 的本地迁移，且只消费 `WebIMConversationSync.listCachedItems/sync`；真实账号数据与 RN global-search/group-action/long-press operations 仍未验收。
- `/conversations/:conversationID` 已完成 RN header、message list/bubble/tail/status、text composer 与明暗主题的本地迁移，并只消费现有 history/pull/send 与 runtime `dataVersion` cache reread 链；真实账号 Network/list-back 证据仍缺失。
- `/contacts` 已完成 RN header/search/56px row/40px avatar/star-letter group/right index 与明暗主题的本地迁移，并只消费 `runtime.getSync().contacts.list()`；真实账号数据、cache-first `FriendshipRepository` Web export 和 Pinyin index parity 仍缺失。
- `/contacts/friend-applications` 通过联系人 shortcut 接入独立 React Router 页面，且只消费 `runtime.getSync().friendApplications` 的真实分页与 success-only accept；unread/read、组合群验证、资料跳转和 reject 未进入当前切片。SDK/H5 本地测试、build:web package sync、生产构建与匿名 guard 已通过，真实账号列表、明暗响应式/history 与授权 accept 仍未验收。
- `/contacts/group-applications` 与 `/:groupID` 通过联系人 shortcut 接入群验证索引和单群申请页，且共同消费 `runtime.getSync().groupApplications` 的同一 audit/accept/reject facade；详情直接刷新仍通过 audit 数据恢复，不新增 per-group transport。组合 tabs、unread/read、群资料/管理和普通成员申请入群未进入当前切片。SDK/H5 本地测试、build:web package sync、生产构建与两个匿名 guard 已通过，真实群管理员数据、明暗响应式/history 与授权 accept/reject 仍未验收。
- `/contacts/groups` 通过联系人 shortcut 接入 RN“我的群聊”列表，只消费 `runtime.getSync().groups` 和既有 conversation facade；页面先读 account SQLite，再执行全分页远端同步，任一页失败保留原 cache。创建群、长按操作、群管理/成员 mutation 均未进入当前切片。SDK/H5 本地测试、build:web package sync、生产构建与匿名 guard 已通过，真实群数据、会话打开和明暗响应式/history 仍未验收。
- `/calls` 只消费 `runtime.getSync().calls`，提供账号 SQLite cache 分页/筛选/搜索、Gateway 全量同步和服务端优先批量删除；通话详情、实时 call-history event 与 RTC 操作未迁移，不渲染假入口。
- `/me` 只消费 `runtime.getSync().profile` 并启用全局第四个主标签；`/me/profile` 与 nickname/gender/bio 子路由在底栏外复用 `getCurrent/update`。`/me/security` 读取 current-detail，账号设置/密码重置只调用 runtime；手机号/邮箱修改因缺验证码发送 operation 保持只读。
- `/me/settings/display` 使用 RN 同键 `@im28/theme/preference` 的唯一 Web theme store；`/me/settings/notifications|permissions` 只消费 `runtime.getSettings()`；`/me/settings/terms` 与登录页复用同一 CSP/sandbox document builder 和 platform-term runtime operation。
- `/me/settings/blacklist` 只消费 `runtime.getSync().blacklist`；列表分页复用 shared Gateway client，联系人读取只补充好友标签，解除失败保留原行。加入黑名单仍属于未迁移的用户资料 flow，不展示假入口。
- 黑名单本地测试、类型检查和生产构建已通过；当前浏览器会话为匿名态，因此不声称已完成真实列表、明暗主题/历史矩阵或破坏性解除验收。
- 空间管理不删除当前 account SQLite：该 snapshot 混有 drafts、failed/sending messages 与 pending tasks。版本链由部署注入 `VITE_APP_VERSION`/optional build、`web-im-client-version.ts` 和 RN row/modal 唯一承载；禁止 package version、自动 navigation 或 reload fake-success。
- `/conversations`、`/contacts`、`/calls` 与 `/me` 共享 `PrimaryTabsLayout -> PrimaryTabBar` 唯一底栏；chat detail、`/me/settings`、auth 与 404 不挂载底栏，禁止复制页面级 tabbar。
- 联系人当前为 authenticated remote-only Gateway 分页读取；它不写入 SQLite，也不宣称与 RN cache-first 行为等价。shared Web entry 提供 Repository contract 后才能恢复本地优先路径。
- Browser fetch、device identity、login/restore/refresh/logout 与 realtime orchestration 已实现，但尚无真实 Gateway 凭据 smoke 证据。
- 会话全分页同步、历史拉取与文本发送已通过本地 sql.js/Repository 回归；认证后的真实会话/聊天 UI 尚无部署 smoke 证据。
- 新消息与会话变更事件已由 runtime 默认串行落库；seq 缺口按本地 cursor 正序分页补拉，成功后通过 `dataVersion` 驱动当前路由页面重读 cache。
- 消息编辑与删除/全员撤回已使用独立 `update_seq` cursor 落库，不改变 `msg_seq/unread`；cursorless 旧编辑按服务端时间拒绝。
- 全量会话同步、history、send 与 realtime delta 已共享同 tab FIFO 业务队列；该保证不扩展到多标签页 writer。
- 共享 `@im28/im-sdk` 的原始 Gateway WebSocket message data 日志已在 canonical owner 清除，并通过共享 SDK 与 H5 回归验证。
- 图片、音频、视频、文件和卡片可只读投影已有真实 payload；上传、播放、下载、failed-message retry、RTC、native push delivery 和 service worker behavior 不在当前 MVP slice，必须由后续 Web facade 提供操作语义。
