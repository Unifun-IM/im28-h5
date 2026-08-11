# Architecture (im28-h5)

> TYPE: SYSTEM_MAP / WEB_IM_CONTRACT
> STATUS: CONVERSATION_MESSAGE_MVP_LOCAL / WORKER_WEB_LOCK_STORAGE_LOCAL / RN_PARITY_CORE_LOCAL
> AXIOM: `im28-h5` is a browser IM client. Gateway owns remote truth; local SQLite is an account-scoped, rebuildable cache persisted through IndexedDB.

## Cross-runtime Completion Gate

H5 调用 shared SDK 只能证明 Web consumer 已接入。相同能力若仍由 RN service 持有 DTO、校验、状态机、缓存或 realtime 语义，整体状态必须是 `shared-core-ready` 或 `compat-debt`，不能标记为跨端完成。权威业务实现属于 `../im28-sdk/src/{core,modules,sync}`；H5/RN 只保留平台 driver、transport/lifecycle、媒体原语、导航和 UI 投影。当前消费状态与退出条件以 `../im28-sdk/docs/shared-capability-consumer-matrix.md` 为准。

## 1. Current State

| Surface | State | Owner |
| :--- | :--- | :--- |
| Web app shell | `MVP/local-verified` | `apps/web` |
| Page routing | `implemented` | React Router under `apps/web/src/app/App.tsx`; authenticated primary routes use `PrimaryTabsLayout` |
| RN migration contract | `frozen` | `docs/rn-h5-migration-contract.md` |
| RN static asset mirror | `implemented/hash-verified` | 466 files under `apps/web/src/assets/rn/**` |
| RN light/dark theme tokens | `foundation-copied` | `apps/web/src/styles/rn-theme.css` |
| RN page visual parity | `active/not-accepted` | auth entry、conversation、chat、contacts/joined-groups/contact-profile/contact-search、calls、me/profile/security、settings、global primary tab shell and onboarding core/subroutes are local/acceptance-gated；valid onboarding context and external data/browser proof remain open |
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
| Media outgoing sync | `implemented-local/acceptance-gated` | shared optimistic/upload-checkpoint state and image/file/video/audio body owners under `../im28-sdk/src/sync/message-{send-state,upload-send-state,media-send,video-send,audio-send}.ts`; Web OSS adapter under `../im28-sdk/src/platforms/web/media/**` |
| Failed message retry | `implemented-local/acceptance-gated` | shared `message-retry` + `message-media-retry` own same-row/current-account recovery；101/115 restore original snapshots，102–105 require a strict uploaded body checkpoint；H5 only exposes the shared capability and rereads SQLite |
| Message forward | `implemented/real-normal-hidden-verified/partial-gated` | shared SDK schema v9 preserves `forward_origin/source/batch` and converges each normal/hidden-sender row；H5 owns RN-derived selection/preview only；real normal origin and hidden-origin removal passed Gateway + conversation cache/list-back |
| Message delete | `implemented-local/destructive-acceptance-gated` | shared SDK rereads account SQLite and owns single/batch Gateway mutation plus transactional local convergence；H5 owns RN-derived single/multi confirmation and group permission presentation only |
| Message edit | `implemented-local/mutation-acceptance-gated` | shared SDK rereads the current-account text row、validates RN parity eligibility、calls Gateway update and replaces the same SQLite row only after success；H5 owns action/composer preview and edited-time projection only |
| Group mention | `converged/mutation-acceptance-gated` | neutral `createIMGroupMentionSync` owns member identity/cache、permission、type106 send/retry/state for RN/Web；H5 owns RN-derived picker/cursor and `[有人@我]/[所有人]` presentation only |
| Cached chat search | `converged/acceptance-gated` | neutral `createIMMessageSearchSync` owns current-account SQLite keyword/type/time-range query、visible-body filtering and pagination for RN/Web；React Router `/conversations/:conversationID/search` owns RN-derived text/date/media/file presentation、preview delegation and stable client-ID return focus only；single/group header enters it through the RN-derived settings route |
| Conversation settings | `implemented-local/mutation-acceptance-gated` | shared `conversations.getSetting/setMuted/setPinned` owns strict Gateway target validation and success-only current-account SQLite convergence；H5 settings route owns two RN-derived switches and visible pending/error state only；real writes remain gated |
| HTTP contact list | `implemented-local/acceptance-gated` | paged `GatewayHTTPClient.listFriends` facade plus success-only `friendships/users` cache under `../im28-sdk/src/sync/contact-sync.ts`; H5 presentation reuses RN `pinyin-pro@3.28.1` parameters for Chinese index parity and loads that dictionary only with the React Router `/contacts` route |
| HTTP contact user search | `implemented-local/acceptance-gated` | `WebIMSync.contacts.searchUsers` owns authenticated Gateway search、public-field normalization、self-filter and stable dedupe；`/contacts/search` owns RN presentation only |
| HTTP joined-group cache/sync | `implemented-local/acceptance-gated` | `WebIMSync.groups` reads account SQLite through shared `GroupRepository`, then replaces cache only after all `GatewayHTTPClient.myGroupList` pages succeed |
| HTTP peer profile/actions | `implemented-local/acceptance-gated` | `WebIMSync.peerProfile` normalizes real user/friend detail, persists a real opened direct conversation through shared repositories and submits success-only friend applications |
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
-> authenticated WebIMSync facade (conversations + messages + contacts + peer profile + groups + calls + blacklist + shared mutation queue)
-> contacts branch: paged shared Gateway friend-list client + authenticated user search -> normalized remote-only page models
-> peer-profile branch: user/friend detail -> relationship model -> real direct-conversation persistence or friend-application mutation
-> blacklist branch: paged shared Gateway blacklist client + contact enrichment -> remote-only page model
-> calls branch: Gateway v2 full list/delete -> Web app-owned call_records cache -> paged page model
-> conversation/message branch: Gateway HTTP full sync/history/send + shared DTO-to-core mapper
-> chat-search branch: current-account MessageRepository keyword/type/time-range search -> visible-body filtering/grouping -> React Router result or existing media preview -> stable client-ID cached-window focus
-> retry branch: cached failed outgoing 101/115 or uploaded 102–105 -> shared capability/payload recovery -> same client ID Gateway send -> same SQLite row convergence
-> forward branch: cached eligible server-backed sources -> shared source reread/target resolution -> batch or registered hidden-sender send -> per-row SQLite convergence -> realtime/list-back origin projection
-> voice branch: feature-local getUserMedia/MediaRecorder -> real File -> shared audio send -> OSS/Gateway/SQLite
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
| `apps/web/src/pages/chat/chat-voice-recorder.ts` | browser microphone、MediaRecorder MIME negotiation、short-lived Blob/File and track cleanup | Gateway body、upload credential、OSS FormData、message identity/state、persistent recording cache |
| `apps/web/src/pages/login/AuthOnboardingProvider.tsx` | memory-only pending registration、secret-free account marker、current-detail initialized profile draft and guarded invite/profile/subroute intent | auth token/session truth、remote profile truth、Gateway validation、verification secret persistence |
| `apps/web/src/styles/rn-theme.css` | RN light/dark/profile/chat token 的浏览器 CSS 映射 | 页面专属几何、独立设计系统 |
| `apps/web/src/assets/rn/**` | RN 业务资产的字节级镜像和哈希清单 | 手工重绘、近似替代、远程热链 |
| `../im28-sdk/src/platforms/web/index.ts` | 浏览器 SDK facade 和共享 Web SDK 具名重导出 | 页面 UI、重复核心 SDK 语义 |
| `../im28-sdk/src/platforms/web/sync/web-im-sync.ts` | Web-only composition root；组合 shared sync、浏览器 account lifecycle 与 media upload port | shared DTO/state/retry/message business rule、RN/Desktop adapter |
| `../im28-sdk/src/platforms/web/runtime/**` | browser config、auth session、Gateway lifecycle 与 generated-operation-backed public term adapter | 页面 UI、生成接口复制、SQLite token persistence |
| `../im28-sdk/src/platforms/web/media/**` | browser `Blob/File` validation、credential-backed OSS multipart `FormData` I/O | message state、Gateway body、page picker、cache/repository semantics |
| `../im28-sdk/src/sync/**` | auth/account-bound conversation/message/group/call cache read/write、HTTP/realtime sync，以及 remote-only contact list/search/blacklist/friend/group-application paging/normalization | token storage、页面 UI、重复 Gateway endpoint/DTO contract |
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
- 消息转发 shared core 与 H5 编排已完成闭环：Gateway top-level `forward_origin` 映射为 core 字段，schema v9 分列持久 origin/source/batch，普通 batch 与已注册隐藏发送者 body-copy 使用稳定 ID 并逐行收敛；H5 单条/多选共用 React Router 目标选择器，最近会话/好友/群聊均通过既有 facade 解析，目标 chat 只从当前账号 cache 重读来源并提供反选、隐藏发送者、comment、换目标和发送前预览。失效来源会显示真实错误并清除 pending state，不留下空批次；首次 history pull 完成后必须重读 SQLite，避免旧窗口覆盖并发发送。真实普通转发已证明 origin/list-back，隐藏发送者已证明 body-copy 后无 origin；真实 partial-result 和桌面 visual proof 仍待受控环境验收。
- 消息删除已完成 shared core 与 H5 本地闭环：H5 单条 action 和多选删除共用一个 RN 文案确认面板，只把 conversation ID、client ID 与 `self|all` scope 交给 `messages.delete`；SDK 重读当前账号 SQLite，执行单条 update 或 batch-delete，并按真实 partial result 事务性隐藏成功行。群主/管理员的双方删除入口只在 H5 根据已有 group cache 呈现，SDK 仍对 `all` 的服务端 ID 完整性 fail-closed。已通过移动端单条/两条确认面板、无溢出和零 console 只读证明；真实 `self/all`、partial 与 list-back 属破坏性验收，必须另行明确授权。
- 消息编辑已完成 shared core 与 H5 本地闭环：H5 只把 conversation ID、cached client ID、文本和 entities 交给 `messages.editText`；SDK 从当前账号 SQLite 重读原行，严格限制本人已发送、服务端已确认、非转发的 type 101 文本，调用 Gateway update 成功后以同 client/server ID、同顺序和同发送状态替换原行，并写入 `localEx.editedAt`。失败不改 cache，H5 保留编辑态和草稿；既有 realtime edited cursor 继续负责其他端更新。真实 Gateway edit、SQLite/list-back 和第二客户端 realtime 证明需另行明确授权。
- 群 mention 已完成 RN/Web consumer convergence：中性 `createIMGroupMentionSync` 统一账号 SQLite 群成员 cache/full-sync、stable user/all identity、`@all` 权限、type106 body/targets、stable optimistic ID、最多三次发送尝试和状态收敛；Web `groupMentions` 与 RN `sendAtTextMessage/fetchMentionGroupMembers` 均消费同一实现。`listCachedItems` 按 `lastReadSeq < seq` 从结构化 `mentions_json` 选最近 incoming mention，并按 RN `好友备注 -> 群昵称 -> 用户昵称` 只读组合 shared cache。H5 只持有查询/候选/光标状态和消息/会话投影；RN 只保留会话解析、DTO/event 与展示资料适配。手输未选择的 `@名称` 不会伪造身份，未知目标/权限和冷名称 cache 均 fail-closed。真实 Gateway、SQLite、realtime/list-back 仍需明确发送授权。
- `/conversations/:conversationID/settings` 已承接 RN 单聊/群聊 header 的更多按钮；页面先读真实会话缓存，群聊只通过既有 groups/group-members facade 补齐群资料与成员预览，单聊头像和群成员复用既有 profile route，两类“聊天记录”行统一进入 `/conversations/:conversationID/search`。免打扰与置顶只调用 shared `conversations.getSetting/setMuted/setPinned`，自动删除子路由只调用 shared `getAutoDelete/setAutoDelete`；均不做 optimistic success，Gateway 成功后才由 SDK 更新当前账号 SQLite。自动删除入口对单聊参与者开放，群聊仅现有 joined-group 快照中的 owner/admin 可见；RN 九档之外的合法 Gateway 值保持未选中并禁用确认，避免误改为停用。type 1701 在单聊/群聊均使用操作者感知的系统文案。真实写入与第二账号 realtime 尚未授权；清空记录及群管理仍属独立合同，不渲染占位入口。
- `/conversations/:conversationID/search` 已完成 RN 文本、日期、图片与视频、文件四类聊天记录搜索的本地闭环：Web message facade 与 RN `openIMService.searchConversationMessages` 均委托 neutral `createIMMessageSearchSync`；SDK 在当前账号 SQLite 内统一校验、读取、过滤可见正文并分页，H5 只按月/日生成 RN 分类视图、复用既有媒体预览，并通过稳定 client ID 返回 chat route。该能力不触发 Gateway、WebSocket、下载或消息 mutation；跨浏览器 history 与完整明暗/桌面视觉矩阵仍待验收。
- `/contacts` 已完成 RN header/search/56px row/40px avatar/star-letter group/right index 与明暗主题迁移，并只消费 `runtime.getSync().contacts.list()`；完整好友分页会在 shared mutation queue 中更新 `friendships/users`，失败保留旧关系快照。联系人展示层复用 RN 同版本 `pinyin-pro` 和姓氏优先参数生成中文首字母索引，数字/符号统一回退 `#`，不改变 SDK 的添加时间顺序；真实账号 7 个联系人已只读证明 `A/D/Z/H` 分组。React Router 通过 `React.lazy + Suspense` 只在 `/contacts` 加载页面与拼音词典，联系人搜索过滤已拆为无词典依赖的独立模块。
- `/contacts/friend-applications` 通过联系人 shortcut 接入独立 React Router 页面，且只消费 `runtime.getSync().friendApplications` 的真实分页与 success-only accept；unread/read、组合群验证、资料跳转和 reject 未进入当前切片。SDK/H5 本地测试、build:web package sync、生产构建与匿名 guard 已通过，真实账号列表、明暗响应式/history 与授权 accept 仍未验收。
- `/contacts/group-applications` 与 `/:groupID` 通过联系人 shortcut 接入群验证索引和单群申请页，且共同消费 `runtime.getSync().groupApplications` 的同一 audit/accept/reject facade；详情直接刷新仍通过 audit 数据恢复，不新增 per-group transport。组合 tabs、unread/read、群资料/管理和普通成员申请入群未进入当前切片。SDK/H5 本地测试、build:web package sync、生产构建与两个匿名 guard 已通过，真实群管理员数据、明暗响应式/history 与授权 accept/reject 仍未验收。
- `/contacts/groups` 通过联系人 shortcut 接入 RN“我的群聊”列表，只消费 `runtime.getSync().groups` 和既有 conversation facade；页面先读 account SQLite，再执行全分页远端同步，任一页失败保留原 cache。创建群、长按操作、群管理/成员 mutation 均未进入当前切片。SDK/H5 本地测试、build:web package sync、生产构建与匿名 guard 已通过，真实群数据、会话打开和明暗响应式/history 仍未验收。
- `/contacts/users/:userID` 与 `/contacts/users/:userID/add` 由联系人默认行进入，只消费 `runtime.getSync().peerProfile`；资料读取合并真实 user/friend，发消息先创建并写入 account SQLite，再进入 chat route，好友申请只在 Gateway mutation 成功后显示完成态。RTC、presence、remark/star mutation、delete、blacklist、common groups、share 与 group-member context 未进入当前切片；真实账号数据/动作和响应式明暗/history 仍未验收，本地浏览器自动化受 local-URL policy 阻断。
- `/contacts/search` 由通讯录搜索 surface 进入，只消费 `runtime.getSync().contacts.list/searchUsers`；本地好友匹配和远端用户结果统一进入既有资料 route，页面不读取 profile 或执行好友 mutation。SDK/H5 本地测试、build:web package sync、生产构建和匿名 deep-link 已通过；真实账号本地/远端结果、Network、资料导航及响应式明暗/history 仍未验收，群搜索/加群独立延期。
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
- 图片、音频、视频、文件和卡片可只读投影已有真实 payload；图片全屏预览、单实例语音播放/停止和原生视频全屏播放由 chat route-scoped media owner 本地实现，并对缺失/非 HTTP(S) URL fail-closed。图片保存与文件预览/下载复用同一 owner：H5 browser adapter 先验证 HTTP(S) 响应并取得 Blob，再触发短期 object URL 下载；文件打开使用隔离标签页，网络/CORS/弹窗失败均保持可见，不写 SQLite 或离线副本。消息复制只读取当前 `ChatMessageView`，由 feature-local clipboard port 映射 RN 的文本/媒体/名片 fallback，`navigator.clipboard.writeText` 完成后才显示成功。mixed 相册图片/视频、按住录制的语音与普通文件发送通过 `WebIMSync.messages` 完成 upload credential -> OSS multipart -> validated body checkpoint -> Gateway send -> SQLite 状态收敛；页面只持有隐藏 file input、标准 `HTMLVideoElement` metadata I/O、短期 `MediaRecorder` session、RN composer gesture 和 `onSending` 已落库实体投影。上传后 Gateway 失败的 102–105 由 shared capability 暴露同 ID 重试；上传前失败不持久化 `File/Blob`，必须由用户重新选择 source 创建新发送。Web runtime 在 Realtime 前把当前账号遗留 sending 行恢复为 failed，不自动发送。Unicode 系统表情只编辑现有文本草稿：chat composer 持有唯一面板状态，纯 Web helper 持有 UTF-16 selection/grapheme 规则，browser preference adapter 持有 21 项 MRU。插画表情的 135 项 identity/fallback、UTF-16 文档算法、Gateway 顶层 `entities`、core `Message.entities` 和 SQLite v7 `entities_json` 由 shared SDK 单一持有；H5 已接入镜像 PNG、独立 MRU、DOM selection 和 entity-driven composer/message/conversation rendering，只负责资源与 UI adapter，不得重写语义或从 Unicode 反推身份。自定义表情的 DTO、完整列表、schema v8 SQLite cache、create/add/delete mutation 和 type 115 sending 由 shared SDK 单一持有；H5 第三 tab 与 `/conversations/:conversationID/emojis` 管理路由只执行 cache-first facade 调用、文件选择、五列 RN UI、预览/选择/确认删除和最近使用 ID preference，禁止复制成员事实、上传状态机或请求 body。type 115 消息动作只在稳定 `emoji_id` 存在时显式调用 shared add；管理页移动只写 `im28.chat.customEmoji.order` stable-ID preference，并在远端成员快照变化时丢弃失效 ID、追加新成员，绝不声称 Gateway reorder。500 MB 视频上限、1–60 秒语音上限、Gateway media body 与 OSS snapshot 规则属于 shared SDK。camera/audio file picker、played/read/auto-next、upload progress/cancel、RTC、native push delivery 和 service worker behavior 仍需后续独立契约。
