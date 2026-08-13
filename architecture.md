# Architecture (im28-h5)

> TYPE: SYSTEM_MAP / WEB_IM_CONTRACT
> STATUS: CONVERSATION_MESSAGE_MVP_LOCAL / WORKER_WEB_LOCK_STORAGE_LOCAL / RN_PARITY_CORE_LOCAL
> AXIOM: `im28-h5` is a browser IM client. Gateway owns remote truth; local SQLite is an account-scoped, rebuildable cache persisted through IndexedDB.

## Cross-runtime Completion Gate

H5 调用 shared SDK 只能证明 Web consumer 已接入。当前 `im28-phone` 是只读业务/视觉参考：H5/Web 迁移不得修改 RN `src`、业务测试或原生工程，只允许依赖/包接线、生成的 SDK 包和不改变行为的 import specifier。相同能力若 RN 尚未消费 shared owner，状态必须是 `shared-core-ready/web-consumed/rn-frozen` 或 `compat-debt`，不能标记跨端完成；只有用户单独授权 RN 迁移后才允许收敛 caller。权威状态见 `../im28-sdk/docs/shared-capability-consumer-matrix.md`。

## 1. Current State

| Surface | State | Owner |
| :--- | :--- | :--- |
| Web app shell | `MVP/local-verified` | `apps/web` |
| Page routing | `implemented` | React Router under `apps/web/src/app/App.tsx`; authenticated primary routes use `PrimaryTabsLayout` |
| Interaction foundation | `implemented-local` | `apps/web/src/components/interaction/**` owns reduced-motion-safe route/message entry effects and native `dialog` lifecycle；feature pages retain action state and business decisions |
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
| Text/image/video/file/audio message broadcast | `shared-core-ready/web-consumed/rn-frozen` | shared SDK owns 1–50 target normalization、media upload-once、one batch-send、per-target result interpretation and success-only message/conversation transaction；H5 owns React Router selection、browser file/metadata/MediaRecorder、temporary preview and result presentation；real recording/send remain gated |
| Group mention | `converged/mutation-acceptance-gated` | neutral `createIMGroupMentionSync` owns member identity/cache、permission、type106 send/retry/state for RN/Web；H5 owns RN-derived picker/cursor and `[有人@我]/[所有人]` presentation only |
| Cached chat search | `converged/acceptance-gated` | neutral `createIMMessageSearchSync` owns current-account SQLite keyword/type/time-range query、visible-body filtering and pagination for RN/Web；React Router `/conversations/:conversationID/search` owns RN-derived text/date/media/file presentation、preview delegation and stable client-ID return focus only；single/group header enters it through the RN-derived settings route |
| Conversation home search/actions/refresh | `implemented-local/mutation-acceptance-gated` | React Router `/conversations/search` owns RN-derived default history、friend/group/message result sections；H5 owns 300ms long-press/right-click menu and top-only touch pull gesture；shared `createIMConversationListActionsSync` owns RN/Web read/manual-unread/archive Gateway + SQLite convergence，delete remains the separate clear-history contract |
| Conversation settings | `implemented-local/mutation-acceptance-gated` | shared `conversations.getSetting/setMuted/setPinned` owns strict Gateway target validation and success-only current-account SQLite convergence；H5 settings route owns two RN-derived switches and visible pending/error state only；real writes remain gated |
| HTTP contact list | `implemented-local/acceptance-gated` | paged `GatewayHTTPClient.listFriends` facade plus success-only `friendships/users` cache under `../im28-sdk/src/sync/contact-sync.ts`; H5 presentation reuses RN `pinyin-pro@3.28.1` parameters for Chinese index parity and loads that dictionary only with the React Router `/contacts` route |
| HTTP contact user search | `implemented-local/acceptance-gated` | `WebIMSync.contacts.searchUsers` owns authenticated Gateway search、public-field normalization、self-filter and stable dedupe；`/contacts/search` owns RN presentation only |
| HTTP joined-group cache/sync | `implemented-local/acceptance-gated` | `WebIMSync.groups` reads account SQLite through shared `GroupRepository`, then replaces cache only after all `GatewayHTTPClient.myGroupList` pages succeed |
| HTTP peer profile/actions | `implemented-local/acceptance-gated` | `WebIMSync.peerProfile` normalizes real user/friend detail plus shared `source_type/sourceLabel`, persists a real opened direct conversation and submits success-only friend applications；`contacts` owns remark/star/blacklist/common-groups/delete/card actions |
| HTTP call-record cache/sync/delete | `implemented-local/acceptance-gated` | `WebIMSync.calls` uses shared Gateway v2 list/delete operations and account-scoped app-owned `call_records` SQLite cache |
| HTTP current-user profile | `implemented-local/acceptance-gated` | `WebIMSync.profile.getCurrent/update/uploadAvatar/updateAvatar` owns nickname、gender、bio、avatar_url normalization, platform upload, account-switch and response-identity guards；`/me/profile` uses atomic `updateAvatar` while onboarding uses `uploadAvatar -> memory draft -> final update`；H5 owns shared album/camera、Canvas crop and presentation only；QR/security remain separate |
| HTTP application unread/read | `shared-core-ready/web-consumed/rn-frozen` | SDK friend facade owns dedicated unread + explicit-ID mark-read；group facade owns audit `total`；`/contacts` and verification tabs share one H5 hook/badge；real incoming write and non-zero group sample gated |
| HTTP account credentials | `implemented-local/acceptance-gated` | `WebIMRuntime.setAccountPassword/resetPassword` uses shared Gateway operations; reset success clears realtime/session/account DB before account-login routing |
| HTTP notification settings | `implemented-local/acceptance-gated` | `WebIMRuntime.getSettings().getNotification/updateNotification` reuse shared Gateway detail/switch operations；real read proven, approved write evidence pending |
| HTTP permission settings | `implemented-local/acceptance-gated` | `WebIMRuntime.getSettings().getPermission/updatePermission` reuse shared Gateway detail/switch operations；five RN fields and real read proven, approved write evidence pending |
| HTTP blacklist list/remove | `implemented-local/acceptance-gated` | `WebIMSync.blacklist` uses shared Gateway list/remove operations；paged normalization, contact enrichment and success-only page removal are locally verified |
| Public Web client version | `implemented-local/acceptance-gated` | `WebIMRuntime.getClientVersion()` uses required deployment identity、shared `platform=web` operation and HTTPS/loopback URL policy；real no-update proven, update modal response pending |
| Realtime message/conversation persistence | `converged/local-verified` | `normalizeIMRealtimeMessages` + `createIMRealtimeMessageSync`；RN/Web share normalization、gap recovery、optimistic identity and cache advancement；real dual-account/disconnect/list-back gated |
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
-> typed deployment config + tab-scoped sessionStorage auth/device identity
-> deployment selection: repository dev mirrors im28-phone_2 DEV endpoints and defaults to pc; production build keeps deployment endpoints and defaults to h5
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
| `apps/web/src/components/interaction/**` | 页面/实时尾部节点瞬时动效、`prefers-reduced-motion` 降级、原生 `dialog` focus/inert/Esc/backdrop 生命周期 | mutation、路由决策、SDK/Gateway、持久状态、业务确认结果 |
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
- `/conversations` 已完成 RN header、72px row、avatar、preview、time、pinned、muted、unread、loading/empty/error、顶部下拉刷新和 300ms 长按/右键气泡菜单的本地迁移；搜索入口通过 React Router 进入 `/conversations/search`，缺省展示历史/空态，提交后按好友、群聊和消息分组展示当前账号 cache 结果。页面只消费 conversation/contact/group/message facades；已读、手动未读和归档由 shared `createIMConversationListActionsSync` 同时服务 RN/Web，删除继续委托 shared clear-history。真实 mutation、物理触摸和 Safari/Firefox 仍属验收门。
- `/conversations/:conversationID` 已完成 RN header、message list/bubble/tail/status、text composer 与明暗主题的本地迁移，并只消费现有 history/pull/send 与 runtime `dataVersion` cache reread 链；真实账号 Network/list-back 证据仍缺失。
- 消息转发 shared core 与 H5 编排已完成闭环：Gateway top-level `forward_origin` 映射为 core 字段，schema v9 分列持久 origin/source/batch，普通 batch 与已注册隐藏发送者 body-copy 使用稳定 ID 并逐行收敛；H5 单条/多选共用 React Router 目标选择器，最近会话/好友/群聊均通过既有 facade 解析，目标 chat 只从当前账号 cache 重读来源并提供反选、隐藏发送者、comment、换目标和发送前预览。失效来源会显示真实错误并清除 pending state，不留下空批次；首次 history pull 完成后必须重读 SQLite，避免旧窗口覆盖并发发送。真实普通转发已证明 origin/list-back，隐藏发送者已证明 body-copy 后无 origin；真实 partial-result 和桌面 visual proof 仍待受控环境验收。
- 消息删除已完成 shared core 与 H5 本地闭环：H5 单条 action 和多选删除共用一个 RN 文案确认面板，只把 conversation ID、client ID 与 `self|all` scope 交给 `messages.delete`；SDK 重读当前账号 SQLite，执行单条 update 或 batch-delete，并按真实 partial result 事务性隐藏成功行。群主/管理员的双方删除入口只在 H5 根据已有 group cache 呈现，SDK 仍对 `all` 的服务端 ID 完整性 fail-closed。已通过移动端单条/两条确认面板、无溢出和零 console 只读证明；真实 `self/all`、partial 与 list-back 属破坏性验收，必须另行明确授权。
- 消息编辑已完成 shared core 与 H5 本地闭环：H5 只把 conversation ID、cached client ID、文本和 entities 交给 `messages.editText`；SDK 从当前账号 SQLite 重读原行，严格限制本人已发送、服务端已确认、非转发的 type 101 文本，调用 Gateway update 成功后以同 client/server ID、同顺序和同发送状态替换原行，并写入 `localEx.editedAt`。失败不改 cache，H5 保留编辑态和草稿；既有 realtime edited cursor 继续负责其他端更新。真实 Gateway edit、SQLite/list-back 和第二客户端 realtime 证明需另行明确授权。
- 群 mention 已完成 RN/Web consumer convergence：中性 `createIMGroupMentionSync` 统一账号 SQLite 群成员 cache/full-sync、stable user/all identity、`@all` 权限、type106 body/targets、stable optimistic ID、最多三次发送尝试和状态收敛；Web `groupMentions` 与 RN `sendAtTextMessage/fetchMentionGroupMembers` 均消费同一实现。`listCachedItems` 按 `lastReadSeq < seq` 从结构化 `mentions_json` 选最近 incoming mention，并按 RN `好友备注 -> 群昵称 -> 用户昵称` 只读组合 shared cache。H5 只持有查询/候选/光标状态和消息/会话投影；RN 只保留会话解析、DTO/event 与展示资料适配。手输未选择的 `@名称` 不会伪造身份，未知目标/权限和冷名称 cache 均 fail-closed。真实 Gateway、SQLite、realtime/list-back 仍需明确发送授权。
- Realtime 消息已完成 RN/Web consumer convergence：`normalizeIMRealtimeMessages` 单一解析 wrapper/alias，`createIMRealtimeMessageSync` 在账号冻结的 shared queue 中统一 seq/degraded 缺口恢复、事件覆盖去重、optimistic client identity 复用、幂等消息入库和会话 `cursor/unread/latest` 推进。Web runtime 直接组合该 facade；RN 通过薄 composition 注入 Nitro SQLite/Gateway，并保留 RTC、AppState、通知、资料补全和 UI event projection。临时控制事件没有完整 cache identity 时仍只做平台投影；真实双账号 WebSocket、断线恢复和 list-back 是外部验收门。
- `/conversations/:conversationID/settings` 已承接 RN 单聊/群聊 header 的更多按钮；页面先读真实会话缓存，群聊只通过既有 groups/group-members facade 补齐群资料与成员预览，并通过 `/conversations/:conversationID/settings/members` 投影完整成员、搜索、拼音索引、角色和成员资料返回；设置预览与完整列表都消费 shared `resolveIMGroupMemberDisplayName`，H5 不复制身份优先级。`WebIMJoinedGroup.permissions` 由 shared `resolveIMGroupManagementPermissions` 统一显式 `user_permission`、角色回退与 fail-closed；群资料、简介、自动删除、消息/会话清理入口不得按 owner/admin 或 raw payload 重算权限。`/settings/profile` 的群名与群头像分别调用 shared `groups.updateName/updateAvatar`；`/settings/introduction` 按 shared capability 进入 RN 同款编辑态并只调用 `groups.updateIntroduction`，空值因 Gateway no-op 合同 fail-visible。`/settings/announcement` 只调用 shared `groups.publishAnnouncement/getAnnouncementReadStatus/markAnnouncementRead`，聊天页 type1519 后刷新同一 group facade 并按权威版本显示两行公告横幅；页面只持有 React Router 表单、发布前确认和展示态。H5 头像平台层只负责 JPEG/PNG/WEBP 选择、圆形拖动缩放、短期 object URL 和 512x512 JPEG Canvas 编码，上传凭证、OSS、群资料/公告权限、Gateway、消息状态机与 SQLite 收敛均留在 SDK。RN/H5 不提供组合群资料 API；每个 UI action 只调用一个 shared 单字段 owner，组合输入 fail-closed。单聊头像和群成员复用既有 profile route，两类“聊天记录”行统一进入 `/conversations/:conversationID/search`。免打扰与置顶只调用 shared `conversations.getSetting/setMuted/setPinned`，自动删除子路由只调用 shared `getAutoDelete/setAutoDelete`；均不做 optimistic success，Gateway 成功后才由 SDK 更新当前账号 SQLite。RN 九档之外的合法 Gateway 值保持未选中并禁用确认，避免误改为停用。type 1701 在单聊/群聊均使用操作者感知文案。清空记录以 RN 同款确认层调用 shared `conversations.clear`：单聊支持 `self|both`，群聊 capability 允许时支持 `self|all_members`，普通成员 fail-closed；H5 不持有 cursor、权限或缓存删除分支。真实设置/群资料/公告/清空写入与第二账号 realtime 尚未授权；其余群管理 mutation 仍属独立合同。
- 群成员移除通过 `/conversations/:conversationID/settings/members/remove` 的 React Router 选择页进入，只把稳定群 ID 与候选成员 ID 交给 shared `groupMembers.removeMembers`。候选角色过滤、单次 Gateway 写、成员/人数事务、权威刷新与 partial-success 均属于 SDK；页面只持有搜索、选择、确认和不可重放提示，真实移除未获授权。
- 群成员邀请通过 `/conversations/:conversationID/settings/members/invite` 的 React Router 选择页进入；候选好友必须由 shared contact DTO 明确给出 `allowGroupInvite=true` 且不在当前成员快照。页面只持有搜索、选择和审核群验证消息，提交统一调用 `groupMembers.inviteMembers`；SDK 按 `join_approval_required` 选择批量申请或直接邀请，并持有 exactly-once、严格响应及 partial-success。真实邀请未获授权。
- 群管理员由 `/conversations/:conversationID/settings/manage/admins` 列表页和 `/admins/add` 候选页承接，群主转让由 `/settings/manage/owner-transfer` 独立页承接，管理首页只保留路由入口；三个角色页共用 cache-first route data adapter。SDK `group-admin-owner.ts` 单一持有 owner capability、公开管理员上限、管理员/群主候选过滤、exactly-once Gateway 写、group/member 原子角色事务、转让后当前账号权限 fail-closed 和独立权威刷新。H5 只持有 React Router、搜索/角色及拼音分组、选择展示、下拉刷新、确认和 partial-success 提示，不保留第二套角色 modal、成员加载或业务常量。RN 业务保持冻结，不宣称双端 convergence，真实角色 mutation 未获授权。
- 退群/解散从群设置页进入，只消费 `WebIMJoinedGroup.permissions` 与 `WebIMSync.groupLifecycle`。SDK `group-lifecycle.ts` 单一持有 leave/dismiss preflight、exactly-once Gateway 写和 success-only 群域事务；`GroupRepository.removeLifecycleState` 精确删除该群 attachments/messages/group conversations/members/group，并保留同 target ID 单聊。H5 只持有危险入口、native dialog、导航和 `remote-only` 可见锁定；RN `quitGroup/dismissGroup` 保持冻结。真实退群/解散未授权。
- 发起群聊由 `/groups/create` 全屏 SPA route 承载；会话/通讯录共用 `HomeActionMenu`，页面只拥有 cache-first 好友选择、搜索、返回来源和确认态。SDK `groups.create` 统一 RN 2–998、默认群名、exactly-once Gateway 与群/真实 `conversation_id` 原子缓存；`remote-only` 锁定重复提交。RN `CreateGroupScreen/openIMService.createGroup` 保持冻结，真实创建未授权。
- 发起群聊页的“查找群聊”进入 `/groups/search`，页面只保存防抖关键字、React Router selection context 和三态投影。`WebIMSync.groupApplications.search` 并行组合 Gateway `/v1/group/search` 与 canonical 已加入群 owner，按稳定群 ID 去重并输出 `pending > joined > available`；joined 仅在真实 `conversationID` 存在时进入会话，available 复用 `/groups/:groupID/apply` 并登记 `source_type=search`。页面不得直调 OpenAPI、复制关系状态或制造搜索结果；真实账号空结果已只读验收，可加入结果与申请仍 data-gated。
- 文本、图片、视频、文件和语音群发由 `/broadcast/select -> /broadcast/compose` 两个全屏 SPA route 承载；会话/通讯录共用 `HomeActionMenu`，选择页只从 contacts/groups facade 读取 cache-first 目标，Router state 只保存 `friend|group + ID`。SDK `messageBroadcast` 统一 1–50、保序去重、批次/逐目标稳定 ID、媒体单次上传、单次 batch-send、`sent|failed|unknown` 和 success-only 消息/会话事务；四类媒体与普通聊天复用同一校验、body 和 OSS owner。H5 语音直接复用聊天 recorder/hook/gesture/CSS owner，只持有浏览器 I/O、可回收预览与计数反馈。412x786 认证态 compose 三媒体入口和语音模式切换已只读证明；未选择文件、未按住录音、未请求权限或发送。
- 二维码业务协议归 SDK `modules/qr-code`，H5 不复制 `myCard/groupCard`、legacy 用户码或深链解析。首页“扫一扫”进入 `/scan` 并动态加载 ZXing；摄像头权限只在点击后请求，图片只来自原生 file input，停止、返回、迟到授权和首次识别均 cleanup。用户码进入既有联系人资料/好友申请并保留 `qrcode` 来源；群码进入 `/groups/:groupID/apply`，只通过 `groupApplications.getPublicGroup/apply` 使用陌生人公开群接口和真实申请，页面不直调 OpenAPI、不伪造资料或成功态。`/me`、`/me/profile` 与 `/scan` 可进入 `/me/qrcode`；群资料通过 `/conversations/:conversationID/settings/qrcode` 展示已加入群二维码。两类页面分别使用 `profile.getCurrent` 或严格匹配的 `conversations/groups` cache-first source，只调用 `buildIM28User|GroupQRCodePayload`；`QRCodeDisplay/browser-qr-image` 是高纠错 Canvas、头像 fallback、PNG 下载与异步 cleanup 的唯一 H5 owner。主分享动作进入稳定 React Router 分享页，`forward-target-source` 与普通转发共用好友/群目标和真实会话解析，用户确认后才生成 320x320 PNG 并调用 shared `messages.sendImage`；不以 Web Share 代替 RN 应用内分享语义。
- `/conversations/:conversationID/search` 已完成 RN 文本、日期、图片与视频、文件四类聊天记录搜索的本地闭环：Web message facade 与 RN `openIMService.searchConversationMessages` 均委托 neutral `createIMMessageSearchSync`；SDK 在当前账号 SQLite 内统一校验、读取、过滤可见正文并分页，H5 只按月/日生成 RN 分类视图、复用既有媒体预览，并通过稳定 client ID 返回 chat route。该能力不触发 Gateway、WebSocket、下载或消息 mutation；跨浏览器 history 与完整明暗/桌面视觉矩阵仍待验收。
- `/contacts` 已完成 RN header/search/56px row/40px avatar/star-letter group/right index 与明暗主题迁移，并只消费 `runtime.getSync().contacts.listCached/list()`；页面先读当前账号 SQLite cache，再由 shared mutation queue 完成远端分页和 `friendships/users` 替换，失败保留旧快照并显示真实错误。联系人展示层复用 RN 同版本 `pinyin-pro` 和姓氏优先参数生成中文首字母索引，数字/符号统一回退 `#`，不改变 SDK 的添加时间顺序；真实账号 7 个联系人已只读证明 `A/D/Z/H` 分组。React Router 通过 `React.lazy + Suspense` 只在 `/contacts` 加载页面与拼音词典，联系人搜索过滤已拆为无词典依赖的独立模块。触屏下拉与会话列表共用 H5 `usePullRefresh` 平台 hook，释放后仍只调用联系人 facade；索引顶部搜索图标保持 RN 的滚回顶部语义，实际搜索继续由 header 进入 `/contacts/search`。联系人行以 RN 的 300ms/8px 合同打开四动作菜单：发消息与通话先经 `peerProfile.openConversation`，通话交给唯一 `WebIMCallProvider`；删除好友和分享名片只调用 shared `contacts.deleteFriend/shareUserCard`，后者通过懒加载 `/contacts/users/:userID/share` 选择有效好友目标。菜单、二次确认和路由属于 H5 presentation，Gateway、SQLite、通话鉴权及 LiveKit 状态机不在页面复制；真实写入与 RTC 仍是显式验收门。
- `/contacts/verifications/friend|group` 通过通讯录唯一“验证消息”shortcut 接入 RN 同款统一 header/双 tab 容器；好友与群聊面板分别只消费既有 `friendApplications` 和 `groupApplications` facade，容器只持有 React Router tab 状态。旧 `/contacts/friend-applications`、`/contacts/group-applications` 仅重定向到 canonical tab，不形成第二套页面 owner；未读/read、tab badge 和资料跳转仍独立延期。
- `/contacts/group-applications/:groupID` 保留单群申请详情路由并返回群聊验证 tab；索引与详情共同消费 `runtime.getSync().groupApplications` 的同一 audit/accept/reject facade，直接刷新仍通过 audit 数据恢复，不新增 per-group transport。真实非空群管理员数据、授权 accept/reject 和跨浏览器矩阵仍未验收。
- `/contacts/groups` 通过联系人 shortcut 接入 RN“我的群聊”列表，只消费 `runtime.getSync().groups` 和既有 conversation facade；页面先读 account SQLite，再执行全分页远端同步，任一页失败保留原 cache。列表自身仍不持有长按或 mutation；创建群、群管理和成员动作已由独立 React Router 页面消费各自 shared owner。SDK/H5 本地测试、build:web package sync、生产构建与匿名 guard 已通过，真实 mutation 仍按各能力授权门验收。
- `/contacts/users/:userID` 与 `/contacts/users/:userID/add` 由联系人默认行进入；资料读取和好友申请只消费 `peerProfile`，好友快捷语音/视频先取得 canonical direct conversation 再交唯一 `WebIMCallProvider`，备注、星标、黑名单、共同群聊、删除和分享只消费 shared `contacts` facade。`/contacts/users/:userID/groups` 完整分页展示共同群聊，进入聊天前必须在当前账号 conversation facade 中命中真实主键；不得用 group ID 猜 conversation ID。好友 `source_type`、搜索来源推断及中文展示由 SDK `friend-source.ts` 单一持有，资料页只投影 `sourceLabel`，空来源保持空白。资料页仅拥有 React/CSS/sheet/route 状态，所有 mutation 等待 Gateway resolve；真实写入/RTC 仍为授权门。presence、group-member restricted context 与跨浏览器明暗/history 仍待独立切片。
- `/contacts/search` 由通讯录搜索 surface 进入，只消费 `runtime.getSync().contacts.list/searchUsers`；本地好友匹配和远端用户结果统一进入既有资料 route，页面不读取 profile 或执行好友 mutation。SDK/H5 本地测试、build:web package sync、生产构建和匿名 deep-link 已通过；真实账号本地/远端结果、Network、资料导航及响应式明暗/history 仍未验收，群搜索/加群独立延期。
- `/calls`、`/calls/:callID` 与内存态 `/calls/active` 共用 `WebIMCallProvider`：记录列表/详情仍只消费 `runtime.getSync().calls`，SDK `createIMCallRecordSync` 单一持有远端同步、SQLite、详情、pending 和终结状态；详情仅在 shared `peerProfile` 明确好友且存在真实 conversation ID 时展示可用的发消息/语音/视频动作。联系人和单聊附件入口共用 H5 `CallTypeActionSheet`，只负责 audio/video 二选一；聊天页直接使用已加载的 canonical `Conversation`，群聊隐藏 RTC。呼出由 shared control 创建通话并把 token 直接交给媒体会话；呼入由 SDK `/web` 编排在 Gateway answer 成功后才惰性创建媒体会话，reject 不构造 LiveKit port。SDK Web port 到 `connect()` 才动态加载 `livekit-client`；页面只绑定 audio/remote video/local video DOM、投影参与者/重连/自动播放/设备错误和执行媒体开关。首次呼出媒体失败执行 cancel，已接听/接通结束执行幂等 hangup，重试刷新 token 或重新 start，退出 route/账号时释放 Room/track/listener。刷新或直达无内存凭据的 active route 安全返回 `/calls`；不恢复或持久化 token。真实双账号呼出/接听、权限、弱网和终结 list-back 仍需授权验收。
- RTC 来电过程的 canonical owner 已进入 SDK：strict parser 负责 type1601..1608/system/custom，shared lifecycle 负责 event/call 去重、终态乱序保护与 pending 校验；Web runtime 在 login/restore/reconnect 和前台 visibility refresh 恢复 pending，并通过 `incomingCall` 公开无凭据快照，账号切换/退出清空身份。H5 全局 Provider 只持有平台展示与资源：RN 同语义 banner/fullscreen/可拖动 floating、shared `peerProfile` 资料补齐、复用音频铃声、autoplay 可见恢复和 React Router 活动页切换；answer/reject/token/媒体状态仍由 SDK owner 持有。真实双账号 invite/answer/reject/timeout、后台多 tab、铃声和媒体权限仍是验收门。
- `/me` 只消费 `runtime.getSync().profile` 并启用全局第四个主标签；`/me/profile` 与 nickname/gender/bio 子路由在底栏外复用 `getCurrent/update`。`/me/security` 读取 current-detail，账号设置/密码重置只调用 runtime；手机号/邮箱修改因缺验证码发送 operation 保持只读。
- `/me/settings/display` 使用 RN 同键 `@im28/theme/preference` 的唯一 Web theme store；`/me/settings/notifications|permissions` 只消费 `runtime.getSettings()`；`/me/settings/terms` 与登录页复用同一 CSP/sandbox document builder 和 platform-term runtime operation。
- `/me/settings/blacklist` 只消费 `runtime.getSync().blacklist` 完成列表与解除；资料页加入/移出黑名单由 `contacts.setBlacklist` 单一写 owner 承担。两页不复制 Gateway operation，真实 mutation/list-back 仍需授权验收。
- 黑名单本地测试、类型检查和生产构建已通过；当前浏览器会话为匿名态，因此不声称已完成真实列表、明暗主题/历史矩阵或破坏性解除验收。
- 空间管理不删除当前 account SQLite：该 snapshot 混有 drafts、failed/sending messages 与 pending tasks。版本链由部署注入 `VITE_APP_VERSION`/optional build、`web-im-client-version.ts` 和 RN row/modal 唯一承载；禁止 package version、自动 navigation 或 reload fake-success。
- `/conversations`、`/contacts`、`/calls` 与 `/me` 共享 `PrimaryTabsLayout -> PrimaryTabBar` 唯一底栏；chat detail、`/me/settings`、auth 与 404 不挂载底栏，禁止复制页面级 tabbar。
- 联系人已通过 `WebIMSync.contacts` 实现当前账号 SQLite cache-first、完整 Gateway 分页替换、搜索和 shared 删除好友能力；列表和动作不得在 H5 复制 Gateway/Repository 状态机。删除好友只有远端成功后才由 SDK 原子清理好友关系、单聊和消息；真实 `self|both` 删除保持破坏性授权门。
- Browser fetch、tab-scoped device identity、login/restore/refresh/logout 与 realtime orchestration 已实现；真实双账号 smoke 证明共享 localStorage device ID 会导致 Push 连接交替重连，改为 sessionStorage 后 30 秒采样达到 19/20 双 tab 同时 `online`，一次同步瞬时重连在下一样本恢复。消息投递和离线 cache 命中仍是独立门禁。
- 会话全分页同步、历史拉取与文本发送已通过本地 sql.js/Repository 回归；认证后的真实会话/聊天 UI 尚无部署 smoke 证据。
- 归档会话完整分页、重复游标/页数保护、Gateway/core 映射、latest-message 保存与 SQLite 快照收敛由 shared `createIMConversationArchiveSync` 单一持有；普通同步只替换未归档集合。H5 `/conversations` 仅投影真实归档通栏，懒加载 `/conversations/archived` 承载 30-row cache pagination、本地搜索、top-only pull refresh 与共享长按动作；页面不读取 Gateway/SQL，最后一条取消归档后返回主列表。RN 同样通过薄 composition 消费该 owner。
- 新消息与会话变更事件已由 runtime 默认串行落库；seq 缺口按本地 cursor 正序分页补拉，成功后通过 `dataVersion` 驱动当前路由页面重读 cache。
- 消息编辑与删除/全员撤回已使用独立 `update_seq` cursor 落库，不改变 `msg_seq/unread`；cursorless 旧编辑按服务端时间拒绝。
- 全量会话同步、history、send 与 realtime delta 已共享同 tab FIFO 业务队列；该保证不扩展到多标签页 writer。
- 共享 `@im28/im-sdk` 的原始 Gateway WebSocket message data 日志已在 canonical owner 清除，并通过共享 SDK 与 H5 回归验证。
- 图片、音频、视频、文件和卡片可只读投影已有真实 payload；图片全屏预览、单实例语音播放/停止和原生视频全屏播放由 chat route-scoped media owner 本地实现，并对缺失/非 HTTP(S) URL fail-closed。图片保存与文件预览/下载复用同一 owner：H5 browser adapter 先验证 HTTP(S) 响应并取得 Blob，再触发短期 object URL 下载；文件打开使用隔离标签页，网络/CORS/弹窗失败均保持可见，不写 SQLite 或离线副本。消息复制只读取当前 `ChatMessageView`，由 feature-local clipboard port 映射 RN 的文本/媒体/名片 fallback，`navigator.clipboard.writeText` 完成后才显示成功。mixed 相册图片/视频、按住录制的语音与普通文件发送通过 `WebIMSync.messages` 完成 upload credential -> OSS multipart -> validated body checkpoint -> Gateway send -> SQLite 状态收敛；当前会话用户/群名片通过 `messages.sendCard` 统一校验 type108 body、optimistic/Gateway/SQLite 和失败重试，H5 选择器只消费 contacts/groups cache-first 快照并传平台中立 card。普通文件始终先进入 H5 瞬时待发送栏，已有草稿且单选媒体时按 shared `shouldStageIMComposerMedia` 等待提交；`createIMComposerSubmissionPlan` 固定 `media -> file -> text`，Web 在一个 operation 内复用既有 facade，前序失败不得继续文本。页面只持有隐藏 file input、标准 `HTMLVideoElement` metadata I/O、短期 `MediaRecorder` session、RN composer gesture 和 `onSending` 已落库实体投影。拍照入口使用 `capture=environment` 并复用图片发送，单聊 RTC 复用全局 Call Provider，群聊隐藏；真实权限/上传/呼叫仍为授权门。上传后 Gateway 失败的 102–105 由 shared capability 暴露同 ID 重试；上传前失败不持久化 `File/Blob`，必须由用户重新选择 source 创建新发送。Web runtime 在 Realtime 前把当前账号遗留 sending 行恢复为 failed，不自动发送。Unicode 系统表情只编辑现有文本草稿：chat composer 持有唯一面板状态，纯 Web helper 持有 UTF-16 selection/grapheme 规则，browser preference adapter 持有 21 项 MRU。插画表情的 135 项 identity/fallback、UTF-16 文档算法、Gateway 顶层 `entities`、core `Message.entities` 和 SQLite v7 `entities_json` 由 shared SDK 单一持有；H5 已接入镜像 PNG、独立 MRU、DOM selection 和 entity-driven composer/message/conversation rendering，只负责资源与 UI adapter，不得重写语义或从 Unicode 反推身份。自定义表情的 DTO、完整列表、schema v8 SQLite cache、create/add/delete mutation 和 type 115 sending 由 shared SDK 单一持有；H5 第三 tab 与 `/conversations/:conversationID/emojis` 管理路由只执行 cache-first facade 调用、文件选择、五列 RN UI、预览/选择/确认删除和最近使用 ID preference，禁止复制成员事实、DTO mapper、SQLite mutation 或 type 115 body 规则；Gateway 没有 reorder operation，本地排序不得伪装成服务端同步。500 MB 视频上限、1–60 秒语音上限、Gateway media body 与 OSS snapshot 规则属于 shared SDK。played/read/auto-next、upload progress/cancel、native push delivery 和 service worker behavior 仍需后续独立契约。
