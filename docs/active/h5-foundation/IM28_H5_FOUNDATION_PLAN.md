# IM28 H5 Foundation Plan

| field | value |
| :--- | :--- |
| status | `active` |
| family | `h5-foundation` |
| root | `docs/active/h5-foundation/` |
| governing_docs | `AGENTS.md`; `architecture.md`; `docs/rn-h5-migration-contract.md`; `docs/web-im-storage.md` |
| verification_floor | `npm run verify` from `im28-h5/` plus a local browser smoke for Web App slices |

## Goal

- 建立可独立安装、构建和持续演进的 `im28-h5` npm workspace。
- 在独立 `im28-sdk` Git 仓库建立浏览器平台 owner，以 `@im28/im-sdk/core` 复用公共逻辑，并通过 `@im28/im-sdk/web` 交付 SQLite/IndexedDB、Gateway 和同步运行时适配。
- 以纵向切片逐步交付认证、会话和消息能力，每个切片都有明确验证和残留项。
- 以 `im28-phone` 为视觉、资产、页面行为和能力源，按 React Router SPA 路由逐页完成可追踪 parity 迁移。
- 防止 Web 自建业务分支：共享能力先在 `im28-sdk` 收敛为平台中性实现，再由 H5/Web production caller 消费。RN 当前业务冻结；未获独立授权前不改 RN caller，状态标记 `shared-core-ready/web-consumed/rn-frozen`，不得伪报跨端完成。

## Scope

- `apps/web/**`：Vite + React H5 应用壳及后续页面能力。
- 页面切换统一由 React Router 管理，页面组件不自行操作 History API。
- 跨页面动效与 modal 生命周期统一归 `apps/web/src/components/interaction/**`；只操作瞬时 presentation state，不持有业务状态、SDK 调用或路由决策。
- RN 样式、静态资产、页面状态与 API 能力只做浏览器适配，不另行设计。
- `../im28-sdk/src/platforms/web/**`：浏览器 SDK、存储适配和后续 Gateway runtime。
- `docs/active/h5-foundation/**`：当前阶段的 plan/status/workset 真相源。
- `architecture.md`、`README.md`、`docs/web-im-storage.md`：稳定边界和已实现事实。
- `../im28-sdk/docs/shared-capability-consumer-matrix.md`：跨端 owner、实际消费者、compat debt 与退出条件真相源。

## Active Convergence Gate

- `W6.a6.12.1-rn-web-single-track-convergence-gate`：consumer matrix 已建立；conversation settings、auto-delete、conversation read/manual-unread/archive、message mutation、mention、search、realtime 和 clear-history 均已通过中性 facade、RN/Web actual callers 与旧路径删除完成本地收敛。
- H5 已闭环能力保留局部证据，但在 RN 接入同一 shared implementation 前只能标记 `shared-core-ready` 或 `compat-debt`。
- `W6.a6.18.3.3.1/.3.3.2` 已完成 shared clear-history core 与 RN/H5 production caller 收敛；旧 RN 整删/type2102 双轨已删除，真实破坏性 mutation 仍必须单独授权。

## Non-goals

- 不把当前可运行 H5 页面骨架视为 RN 视觉/交互迁移完成。
- 不复制 `im28-sdk` 已有的 DTO、Repository、Gateway client 和数据库 contract。
- 不直接复用 React Native runtime/`StyleSheet`，不在页面中调用 Gateway/OpenAPI，也不以第三方近似图标替换已有 RN 资产。
- 不在 Worker 与多标签页 writer 实现及浏览器并发证据完成前声明浏览器存储达到生产级并发能力。
- 不改变 `im28-phone` React Native 应用或原生工程。
- 不以“跨端收敛”为理由修改 RN 业务源码、测试或运行语义；只允许依赖/包接线、生成 SDK 包和不改变行为的 import specifier。

## Current Baseline

| area | current truth | source |
| :--- | :--- | :--- |
| Web application | Vite + React Router 根壳、404 与 authenticated `PrimaryTabsLayout` 已实现 | `apps/web`; `architecture.md` |
| RN parity foundation | 迁移合同已冻结；466 个资产按字节同步；auth entry、conversation、chat、contacts/contact-profile、friend/group applications、calls、me/profile/security、settings、global tab shell 与 onboarding core 均为 local/acceptance-gated；valid authenticated data/mutations、onboarding context、cache/network blocked or gated | `docs/rn-h5-migration-contract.md`; `apps/web/src/assets/rn`; `apps/web/src/styles/rn-theme.css` |
| shared SDK | `@im28/im-sdk/core` 提供平台中立 contract、Repository 和 Gateway client | `../im28-sdk/src/core.ts` |
| Web SDK/runtime | `sql.js + IndexedDB`、login/register/account-credential auth-bound lifecycle、notification/permission settings facade、public platform-term/client-version adapters、共享 mutation queue、HTTP/realtime sync、remote contact list/user search、peer profile/conversation/apply、call-record cache/sync/delete、current-profile read/update、preset/custom emoji、same-row retry、uploaded-media checkpoint recovery、shared forward、群 mention/realtime/clear-history/list-actions core 与聊天缓存关键词/类型/时间范围查询已实现；当前 SDK Web 全量共 59 文件/204 测试 | `../im28-sdk/src/platforms/web/runtime/**`; `../im28-sdk/src/platforms/web/storage/**`; `../im28-sdk/src/sync/**` |
| Gateway runtime | real phone-code login、refresh restore、Gateway-backed reads、two-account tab isolation and dual WebSocket online passed；realtime delivery/list-back and offline SQLite-hit remain deployment gates | `docs/runtime-contracts/web-gateway-runtime.md` |
| package shape | H5 workspace 仅保留 `apps/web`；浏览器 SDK 已迁入独立兄弟 Git 仓库 | `package.json`; `../im28-sdk/package.json` |

## Workstreams

### `W1` 基线与执行治理

- focus:
  - 固化 Web 架构方向、存储决策和可续做 trio。
- exit:
  - `AGENTS.md`、架构、存储 SSOT 与 active trio 可被下一轮只读恢复。

### `W2` Workspace 与浏览器 SDK 基础

- focus:
  - 建立 npm workspace、Vite React App、React Router 路由 owner，并把 Web runtime 收敛进统一 `@im28/im-sdk` 多入口包。
  - 将现有 SQLite/IndexedDB 实现迁入 Web SDK owner，并由 App 完成最小编译接入。
- exit:
  - 根级 `npm run verify` 覆盖 App 与 SDK，开发服务器可在浏览器打开。

### `W3` Gateway Runtime 纵向切片

- focus:
  - 建立认证 token owner、Gateway HTTP/WebSocket runtime、事件归一化和重连边界。
- exit:
  - 真实 Gateway 登录和连接链路无 fake-success，并有聚焦验证证据。

### `W4` 会话与文本消息 MVP

- focus:
  - 打通同步、会话列表、消息历史、文本发送和实时接收。
- exit:
  - 真实数据链路可完成核心聊天闭环，SQLite 仍是可重建缓存而非远端真相源。

## Cross-workstream Gate

| gate | blocks | does_not_block |
| :--- | :--- | :--- |
| `W3.real-gateway` | realtime delivery/list-back、offline SQLite-hit、W3 closeout and W4/W6 mutation-backed final acceptance | read-only real login/data、dual-account online、W4 contract/sync and W6 local implementation |
| `W5.browser-matrix` | storage production acceptance | W6 local style/route/API implementation |

W4 本地实现以 W3 code/contract/storage gates 为 entry；已通过的真实登录/读取/online 不能被解释为消息投递、离线 cache 或 mutation 已验收。

### `W5` 生产化门禁

- focus:
  - Worker 执行、多标签页 writer 所有权、配额/清理策略、恢复与浏览器兼容验证。
  - 既定顺序：`W5.a1` 冻结 Dedicated Worker + lifecycle Web Lock 契约；`W5.a2` 实现 Worker runtime；`W5.a3` 实现跨 tab owner；`W5.a4` 处理配额与恢复。
- exit:
  - 已知存储并发和主线程风险被解决或以明确产品约束验收。

### `W6` RN 页面 Parity 迁移

- focus:
  - 以 RN screen/component/theme/assets/service 为源，按 auth entry、conversation、chat、contacts、global tab shell、remaining auth/tabs 的顺序迁移。
  - 页面与全屏状态使用 React Router SPA；UI 只调用 `@im28/im-sdk/web` facade。
  - onboarding 按 `route/state owner -> invite register retry -> complete-profile core` 推进；pending verification secret 只驻留内存，avatar/contact 缺口独立冻结。
  - 最近完成 `W6.a6.1-chat-media-read-core` 本地实现：复用已缓存 Gateway payload，迁移图片全屏预览、单实例语音播放/停止和视频全屏播放；文件下载、媒体发送上传、已读/连播与 RTC 延期，真实媒体数据保留为验收门。
  - 最近完成 `W6.a6.2-chat-image-file-send-core` 本地实现：相册图片和普通文件走三操作真实链，shared SDK 持有 optimistic SQLite 状态机，Web adapter 持有 OSS multipart I/O，H5 只持有选择器和 RN composer presentation；真实消息传输等待明确授权。
  - 最近完成 `W6.a6.3-chat-album-video-send-core` 本地实现：RN `mixed` 相册的视频分支已接入同一 shared 上传/状态 owner；Web 只读取浏览器视频元数据，视频 body、500 MB 上限和 OSS snapshot 规则归 shared SDK；真实上传/发送保留显式授权验收门。
  - 最近完成 `W6.a6.4-chat-voice-send-core` 本地实现：RN 按住录音、56px 上滑取消、2–60 秒约束与 audio send 已接入；共享 SDK 持有 Gateway body/SQLite 状态，Web adapter 仅持有 `getUserMedia/MediaRecorder/Blob` 生命周期；真实麦克风和消息传输保留显式授权验收门。
  - `W6.a6.5-chat-system-emoji-core` 已完成本地闭环：RN 第一套 Unicode 表情面板、当前选区插入/替换、完整 grapheme 退格和 21 项最近使用均已接入既有文本草稿；未发送真实消息。
  - `W6.a6.6-chat-illustrated-emoji-contract-freeze` 已完成：135 个 stable preset identity、133 个 fallback、UTF-16 entity、Gateway `packID/presetID`、SQLite/cache/render/failure contract 和 owner map 已冻结。
  - `W6.a6.6.1-shared-preset-emoji-core` 已完成：`im28-sdk` 单一持有 DTO/135 descriptors/document/entity、Gateway/Web send/SQLite v7，RN 已收敛为资源与 `MessageItem` thin adapters。
  - `W6.a6.6.2-h5-illustrated-emoji-ui` 已完成本地闭环：H5 接入 135 个镜像 PNG、第二 tab/独立 MRU/七列网格、DOM selection 与 entity-driven composer/message/conversation rendering；共享语义仍只归 `im28-sdk`，未发送真实消息。
  - 下一片 `W6.a6.6.3-illustrated-emoji-acceptance` 仅做一次经明确授权的 disposable conversation Network/Gateway/SQLite/list-back 验收，当前保持 `blocked-external`。
  - `W6.a6.7.1/.3.1` 已完成 SDK list/create/add/delete、schema v8 cache、共享上传边界和 type 115 optimistic send；`.2/.3.2/.3.3` 已接入 H5 第三 tab、五列 recent/all、React Router 管理页、选择/预览/确认删除、type115 长按/右键收藏入口和 stable-ID Pointer 本地排序。未选择文件、未执行 mutation、未提交排序、未发送消息；`.4` 真实验收保持 blocked-external。
  - `W6.a6.8-chat-media-export` 已完成本地实现：RN 图片保存和文件预览/下载复用 route-scoped media owner；H5 browser adapter 单一持有 fetch/Blob/object URL/open，真实缓存移动/桌面只读证明通过，未触发下载或外部打开。
  - `W6.a6.9-chat-failed-retry` 已完成文本 101 / 自定义表情 115 的同 ID、同 SQLite 行重试主链。
  - `W6.a6.10-chat-media-retry-stage` 已完成本地闭环：上传成功后先把严格校验的 102–105 Gateway body checkpoint 到同一行，Gateway 失败后重试跳过上传；runtime 在 Realtime 前把当前账号中断 sending 恢复为 failed。上传前失败不保存 File/Blob 且只能显式重选 source 创建新发送。
  - `W6.a6.11-chat-quote-reply` 已完成本地闭环：shared SDK 统一持有 type 114 body、引用快照、发送状态和失败恢复，H5 仅持有 action/composer/list projection；真实发送仍为显式授权验收门。
  - `W6.a6.11.1-sdk-sync-runtime-boundary` 已完成：Web 聚合入口迁入 `im28-sdk/src/platforms/web/sync`，shared `src/sync` 禁止反向依赖客户端实现，所有构建前置 AST 边界门禁；RN 产物不包含 Web 聚合入口且 RN 消费项目类型检查通过。
  - `W6.a6.12-shared-sync-neutral-naming-and-rn-adoption-contract-freeze` 已完成：`WebIM*` 被登记为历史兼容名称，当前不增加无消费者 alias；RN 未来只允许经独立 RN composition root 和 `src/services/openim/**` 显式切换。
  - `W6.a6.13-chat-copy-core` 已完成本地闭环：复用 RN copy 资产和现有消息 action owner，feature-local clipboard port 复制当前 projection，只有真实 clipboard Promise 完成后才显示成功；458px 菜单方向锚定无溢出。
  - `W6.a6.14-chat-forward-contract-freeze` 已完成：冻结单条/多选、三类目标、目标 chat 预览/反选/comment、batch/hidden-sender 分支、幂等 ID、逐行成败和 `forward_origin` 持久化要求。
  - `W6.a6.14.1-shared-forward-core` 已完成本地闭环：SDK schema v9、Mapper/Repository、来源重读、normal batch、registered hidden-sender body-copy、stable IDs 与逐行成败均由 shared owner 持有；RN runtime 未接线，H5 仅同步 Web 产物。
  - `W6.a6.14.2-h5-forward-target-preview` 已完成本地闭环：RN 单选/多选、三类真实目标、目标 chat pending preview、反选/隐藏发送者/comment/换目标和 shared submit caller 已接入；Router 只携带稳定 ID，页面不持有 Gateway body/cache owner。
  - `W6.a6.14.3-forward-acceptance` 已完成授权子集：14:59 normal 保留 origin，15:01 hidden 无 origin，两条均通过真实 Gateway、会话置顶和 SQLite/list-back；真实运行暴露的 initial pull/send 覆盖竞态已修复并加入顺序回归。
  - `.14.3` 仅剩可控 real partial-result 和 desktop visual proof；当前保持 `blocked-external`，禁止用 production fake failure 替代。
  - `W6.a6.15.1-shared-message-delete-core` 已完成本地闭环：SDK 从当前账号 SQLite 重读来源，区分 single update/batch-delete/local-only self，顶层失败不改本地，partial 只在事务中隐藏成功行；RN runtime 未接线。
  - `W6.a6.15.2-h5-message-delete-ui` 已完成本地闭环：单条 action、多选删除、RN 确认文案、self/all scope 和群角色呈现共用一个 flow，页面只调 `messages.delete`。
  - `W6.a6.15.3-message-delete-acceptance` 需在经明确授权的可丢弃消息上验证 `self/all/partial/list-back`，当前保持 `blocked-destructive-authorization`；只读 UI 验收不等于真实删除验收。
  - `W6.a6.16-chat-message-edit-contract-freeze` 已完成：冻结 RN 可编辑条件、Gateway update body、same-row cache 收敛、entity/editedAt 保留、失败不退出编辑态和 realtime owner。
  - `W6.a6.16.1-shared-message-edit-core` 已完成本地闭环：SDK 从当前账号 SQLite 重读本人已发送且非转发的 type 101，Gateway 成功后才用同 ID/顺序/状态替换原行；RN runtime 未接线。
  - `W6.a6.16.2-h5-message-edit-ui` 已完成本地闭环：action、RN 编辑预览、原文/entities 回填、取消/提交和 `已编辑 HH:mm` 投影只调用 shared facade；未提交真实编辑。
  - `W6.a6.16.3-message-edit-acceptance` 需在经明确授权的可丢弃文本上验证 Gateway、SQLite/list-back 与第二客户端 realtime，当前保持 `blocked-mutation-authorization`。
  - `W6.a6.17.1-shared-group-mention-core` 已完成本地闭环：SDK schema v10 持久化顶层 mention 身份，群成员 facade cache-first 全分页同步，type 106 发送沿用共享 optimistic 状态机；Web composition 显式接线，RN service/runtime 未接线。
  - `W6.a6.17.2-h5-group-mention-ui` 已完成本地闭环：群聊 composer 按 RN 规则提供 `@成员/@所有人` 候选、稳定 ID 选择和光标恢复，消息正文与会话列表消费 shared mention；命中当前用户显示 `[有人@我]`，all target 显示 `[所有人]`。
  - `W6.a6.17.2.1-unread-mention-conversation-projection` 已完成本地闭环：shared SDK 按 `lastReadSeq < seq` 从结构化 mention 身份中选择最近 incoming 提醒，组合已有群成员昵称；H5 保持 `草稿 > 未读 mention > 最新消息`，不扫描页面 history、不猜发送人。
  - `W6.a6.17.2.2-sender-display-name-cache-parity` 已完成本地闭环：成功联系人全分页在 shared mutation queue 中更新 `friendships/users`，会话 facade 按 RN `好友备注 -> 群昵称 -> 用户昵称` 只读解析；分页失败保留旧关系，冷 cache 不猜名称。
  - `W6.a6.18.1-chat-text-search` 已完成本地闭环：单聊 header 进入 React Router 搜索页，shared SDK 在当前账号 SQLite 中按会话和可见正文搜索；结果按稳定 client ID 返回详情并恢复目标缓存窗口，不触发 Gateway、WebSocket 或 mutation。
  - `W6.a6.18.2.1-shared-indexed-search-range` 已完成本地闭环：shared SDK 在当前账号 SQLite 中提供包含下界、排除上界的发送时间范围，并继续复用消息类型查询；不触发 Gateway，也不新增平台专属索引。
  - `W6.a6.18.2.2-h5-date-media-file-index` 已完成本地闭环：React Router 搜索页复刻 RN 日期、图片与视频、文件分类，按月/日投影缓存消息，媒体复用既有预览 owner，日期结果以稳定 client ID 返回聊天页。
  - `W6.a6.18.2.3-chat-settings-entry` 已完成本地闭环：单聊/群聊 header 更多按钮进入独立 React Router settings route，页面只读真实会话、群、成员 cache/facade，资料入口复用既有 profile route，“查看聊天记录/查找聊天内容”进入同一 search owner；未冻结的设置 mutation 不渲染。
  - `W6.a6.18.3-chat-settings-capability-contract-freeze` 已完成：会话设置按非破坏性、消息生命周期、破坏性和群权限域拆分，冻结 shared SDK/Gateway/SQLite/realtime owner 与逐 operation 授权门。
  - `W6.a6.18.3.1-shared-conversation-setting-core` 已完成本地闭环：setting detail、会话免打扰和会话置顶由 shared SDK 严格校验 Gateway target 并 success-only 收敛当前账号 SQLite；H5 只投影真实状态/失败，真实写入仍待授权，自动删除、清空记录和所有群管理 mutation 不进入本切片。
  - `W6.a6.18.3.2-auto-delete-contract` 已冻结：权威详情读取、枚举更新和 type 1701 realtime 为唯一三个 operation；服务端拥有新消息 expiry/实际删除，客户端只持久设置元数据和系统消息，不启动 timer 或追溯清理历史。
  - `W6.a6.18.3.2.1-shared-auto-delete-core` 已完成本地闭环：Conversation/schema v11、Repository、严格 read/update 与 type 1701 durable-message/setting convergence 由 shared SDK 单一持有；真实 mutation 不进入本地验收。
  - `W6.a6.18.3.2.2-h5-auto-delete-route` 已完成本地闭环：React Router 子页复刻 RN 九档，单聊开放、群聊 owner/admin fail-closed，显式确认后才调用 shared mutation，单聊/群聊 type 1701 使用操作者感知文案；真实 update 与第二账号 realtime 仍待授权。
  - `W6.a6.18.3.3-clear-history-contract-trace` 已完成只读冻结：`self|both|all_members`、stable operation ID、Gateway cursor、schema v12 clear boundary/list visibility、type 2102 control event、permission 与 route 后果均有唯一 owner；旧 OpenIM fallback、好友删除和退群 clear-history 排除。
  - `W6.a6.18.3.3.1-shared-clear-history-core` 已完成本地闭环：schema v12、精确 uint64 seq/cursor、stable operation ID、success-only transaction、单聊 list-hidden、type2102 幂等及 history/realtime late-message guard 由 shared SDK 单一持有；Web composition 已接入，RN/H5 production caller convergence 与真实 `self|both|all_members` acceptance 仍未完成。
  - `W6.a6.18.3.3.2-clear-history-consumer-convergence` 已完成本地闭环：RN 主动 action/type2102、Web runtime 和 H5 settings action 均委托 `createIMConversationClearSync`；旧 RN Gateway/本地整会话删除、OpenIM fallback 与控制事件业务分支已删除，H5 只保留 scope 文案、确认和导航。真实 `self|both|all_members` mutation 与双账号 list-back 仍需显式授权。
  - `W6.a6.18.3.4-h5-group-introduction-readonly` 已完成本地闭环：群设置按 RN 顺序显示群简介副标题并进入可深链 React Router 子页；页面只从当前账号会话与 joined-group shared facade 读取真实简介，空值、单聊误入、会话/群资料缺失均显式处理，不复制编辑 mutation。
  - `W6.a6.18.3.5-shared-group-announcement-readonly` 已完成本地闭环：shared joined-group DTO 显式投影公告、版本和当前账号编辑权限，H5 仅对 RN 同样的 owner/admin 展示公告入口并进入共用群文本详情页；未发布、标记已读或发送公告消息。
  - `W6.a6.18.3.6-shared-self-group-nickname` 已完成本地结构闭环：shared 群成员 facade 固定当前认证账号、校验 24 字非空昵称、Gateway 成功和身份一致后才单成员写回 SQLite；H5 群设置只持有 RN 同语义草稿/编辑层/保存反馈，RN 业务源码未改。真实保存、第二账号 realtime/list-back 和 RN consumer convergence 保留验收门。
  - `W6.a6.18.3.7-shared-group-card` 已完成 Web 本地结构闭环：shared contact facade 持有 Web 好友目标过滤、真实单聊打开、type108 群名片与可选 type101 附言状态机；H5 使用 React Router 好友单选页，RN 现有分享编排冻结不改。真实分享、失败重试与第二账号 list-back 保留验收门。
  - `W6.a6.18.3.8/.9/.10-shared-group-profile` 已完成 Web 本地结构闭环：shared group facade 持有 Web 群名、头像、简介的权限/校验/Gateway/cache 规则，H5 提供 React Router 页面和浏览器裁剪；RN `updateGroupInfo` 全链保持冻结基线，三项均为 `shared-core-ready/web-consumed/rn-frozen`。
  - `W6.a6.18.3.11-shared-group-announcement` 已完成 Web 本地结构闭环：shared SDK 持有 Web 公告发布、消息顺序、read-status 和 type1519 cache 收敛，H5 只保留表单/确认/横幅；RN 公告链保持冻结基线。真实发布、发送、read mark 与第二账号 list-back 保留授权门。
  - `W6.a6.18.3.12-group-profile-combined-compat-exit` 的 RN 改造结论已撤销：RN 请求类型、Gateway/OpenIM 兼容和事件投影恢复基线并冻结；Web 继续只暴露单字段/公告专属 facade，禁止组合输入。
  - `W6.a6.18.3.13-group-management-mutation-contract-audit` 已完成只读合同审计：邀请/移除/admin/settings/mute/transfer/leave/dismiss 的 SDK transport 均不能视为 shared business owner；H5 production mutation caller 为 0；RN invite 存在 post-write sync failure 后重放风险，remove/admin/transfer/leave/dismiss 存在任意 Gateway error 后 OpenIM 二次写风险。后续按 permission projection、member removal、invite contract、admin/owner、settings/mute、destructive lifecycle 分片，每片最多 3 个 operation，真实 mutation 均保留授权门。
  - `W6.a6.18.3.13.1-shared-group-management-permissions` 已完成 Web 只读消费：SDK neutral resolver 持有 Web explicit capability/fail-closed 投影，H5 joined-group 快照驱动入口；RN 原 helper 已恢复并冻结，状态为 `shared-core-ready/web-consumed/rn-frozen`。
  - `W6.a6.18.3.13.2-shared-member-removal` 已完成 Web 本地消费：SDK 持有 Web 成员目标校验、exactly-once Gateway remove、事务和独立权威刷新，H5 提供 React Router 候选/搜索/确认页；RN Gateway/OpenIM 与页面事件链恢复冻结基线，不是 shared consumer。真实移除与第二账号 realtime/list-back 保留授权门。
  - `W6.a5.2.1.1-contact-pinyin-index-parity` 已完成本地闭环：H5 联系人展示层复用 RN `pinyin-pro@3.28.1` 和同一姓氏优先参数，中文索引、数字/符号 fallback 与分组顺序均有纯函数回归和真实 7 行只读证明；SDK/RN runtime 未改动。
  - `W6.a5.2.1.2-contact-route-code-split` 已完成本地闭环：`/contacts` 经 React Router `React.lazy + Suspense` 按路由加载，搜索过滤从拼音分组模块拆出；生产 main chunk 从 1,088.14 kB/366.35 kB gzip 降至 793.79 kB/222.24 kB gzip，联系人 chunk 为 294.92 kB/145.52 kB gzip。
  - `W6.a5.2.1.4-contact-list-interaction-contract-freeze` 已完成本地闭环：联系人页面先读账号 SQLite cache 再远端刷新，触屏下拉与会话列表共用单一浏览器 hook；右侧索引补齐 RN 顶部图标和活动态。RN 长按菜单四动作已冻结，但 H5 不在联系人 shared facade 缺失时创建部分菜单或 Web-only mutation。
  - `W6.a5.2.1.5.1-shared-friend-delete-core` 已完成本地闭环：SDK 以一次 Gateway `friend/delete` 和 success-only SQLite 事务统一删除关系、目标单聊与消息；RN/Web 均消费同一 facade，RN 菜单不再追加第二次会话删除。未执行真实破坏性请求。
  - `W6.a5.2.1.5.2-shared-user-card-core` 已完成本地闭环：SDK 统一名片目标过滤与一次批量 share operation，非空附言复用 shared direct-conversation mapper/Repository 和 type101 状态机；RN/Web 均消费同一 contact facade，旧 RN Gateway/helper 编排已删除。未执行真实分享或发送。
  - `W6.a5.2.1.5.3.1-shared-rtc-control-convergence` 已完成本地闭环：SDK 统一认证、稳定 ID、六项通话信令、LiveKit 凭证与 E2EE fail-closed；RN/Web production composition 均消费 `createIMCallControlSync`，旧 RN Gateway 控制 helper 和重复 token 校验已删除。Web LiveKit room/permission/route lifecycle 仍由 `.1.5.3.2` 平台 adapter 承接，未执行真实呼叫或媒体权限。
  - `W6.a5.2.1.5.3.2.1-web-call-media-session` 已完成本地闭环：SDK `/web` 通过注入式 `WebIMCallMediaPort` 单一持有连接、麦克风/摄像头、参与者、重连、自动播放恢复和终止快照，不保存 token、不进入 RN 包且不制造假房间。
  - `W6.a5.2.1.5.3.2.2-web-livekit-client-port` 已完成本地闭环：SDK Web port 映射真实 Room/track/device event，outgoing owner 组合 shared start/cancel/hangup/token-refresh 和媒体补偿；H5 全局 Provider 与 `/calls/active` 只持有 DOM/route/可见错误。LiveKit 在明确呼出且 Gateway start 成功后的 media connect 动态加载；未执行真实呼叫或权限。
  - `W6.a5.2.1.5.4-contact-action-menu-ui` 已完成本地闭环：H5 联系人行复用 300ms/8px 长按合同并渲染 RN 四动作；消息/通话先走 shared direct-conversation facade，通话交给唯一 Web call owner，名片分享由独立 React Router 好友选择页确认后调用 shared facade，删除保留 `self|both` 二次确认。未执行真实会话创建、名片分享、删除、呼叫或媒体权限。
  - `W6.a5.2.1.5.6-friend-source-convergence` 已完成本地与真实账号只读闭环：Gateway `Friend.source_type` 进入共享 DTO，SDK `friend-source.ts` 统一来源码、搜索推断与历史兼容文案；RN 删除页面 helper，H5 删除申请页映射表并由资料 facade 输出 `sourceType/sourceLabel`。真实好友资料显示“通过ID添加”和服务端添加时间，所有信息行左右占满卡片；未执行任何 mutation、通话或媒体权限。
  - `W6.a5.2.1.5.7-incoming-call-ringtone-contract` 已完成合同与第一步 consumer convergence：SDK strict parser 统一 type1601..1608、system/custom 包装、必填字段和 event ID 去重，RN 生产消息 helper 改为薄调用且原来来电 Provider/通知/消息行为回归通过；后续 runtime core 已由 `.5.7.1` 闭环，ringtone/UI 留到 `.5.7.2`，未执行真实呼叫、声音或权限。
  - `W6.a5.2.1.5.7.1-incoming-call-runtime-core` 已完成本地闭环：SDK `incoming-call-lifecycle.ts` 统一 event/call 去重、同 call accept/终态清理、终态先到防复活、有界状态和 pending 校验；Web runtime 订阅过程通知，在 login/restore/reconnect 与显式 refresh 时恢复 pending，公开 snapshot 不含 token，账号切换/退出清理身份。H5 全局来电 UI、visibility 调用、ringtone/autoplay 与 answer/reject 留到 `.5.7.2`，未执行真实呼叫、声音或权限。
  - `W6.a5.2.1.5.7.2-incoming-call-web-ui-ringtone` 已完成本地闭环：H5 全局 Provider 只投影 SDK 来电快照，具备 RN 同语义 banner/fullscreen/可拖动 floating、联系人资料补齐、visibility pending refresh、复用音频的循环铃声与 autoplay 手势恢复；SDK `/web` 来电编排保证 reject 不创建媒体，answer 成功后才惰性创建 LiveKit 会话并复用现有 active route。未执行真实呼叫、声音或媒体权限，真实双账号 RTC 仍为显式验收门。
  - `W6.a5.2.3.1-call-detail-shared-convergence` 已完成本地与真实账号只读闭环：中性 `createIMCallRecordSync` 统一 raw 字段无损缓存、详情远端优先合并回写和同日筛选；RN 删除旧详情 Gateway/cache merge owner，H5 以 React Router `/calls/:callID` 消费相同 facade。未执行通话、媒体权限或删除。
  - `W6.a5.2.3.2-call-record-list-consumer-convergence` 已完成本地结构闭环：shared facade 统一远端单页、完整分页、cache、删除、pending、批量保存与终结状态映射；RN 删除旧 Gateway service、通话表 CRUD/schema 和应用层状态推导，只保留资料补齐及事件投影。终结 wrapper 解析和 Web realtime 接线已由 `.3.3` 继续闭环，未执行真实删除或通话。
  - `W6.a5.2.3.3-web-realtime-call-history-composition` 已完成本地运行链：shared parser 统一 system/custom/RN 包装，Web runtime 对终结 frame 调用同一 `convergeTerminalSignals`，普通消息失败不阻断通话记录落库，`/calls` 通过 data version 重读 cache。真实双账号终结事件仍为外部验收门。
  - `W6.a5.2.15-group-members-route-parity` 已完成本地与真实账号只读闭环：复用既有 shared `groupMembers.listCached/sync` 和统一成员显示名 resolver，补齐 RN 群设置“全部”入口、完整成员页、搜索/分组/角色和资料返回；未新增 SDK/RN 逻辑，也未进入 presence、群管理 mutation、好友申请或 RTC。
  - `W6.a6.17.3-group-mention-acceptance` 仅允许在明确授权的可丢弃群聊中验证真实 type 106 send、Gateway top-level mentions、SQLite v10、realtime 和 list-back；当前保持 `blocked-mutation-authorization`。
- exit:
  - 已迁移页面具有源映射、RN 资产、明暗主题、响应式、路由和真实 API 证据；不存在 generic placeholder 视觉或第二条 API 链。

## Entry Criteria

- H5 迁移方向和 `sql.js + IndexedDB` 存储基础已确定。
- 共享 `@im28/im-sdk/core` 是浏览器 runtime 的唯一底层 contract。
- 用户已明确授权先创建项目骨架与 SDK。
- 用户已明确要求所有样式、资产、SDK/API 调用和页面切换分别以 RN、Web SDK facade 和 React Router SPA 为唯一来源。

## Exit Criteria

- `apps/web` 和 `../im28-sdk/src/platforms/web` owner 边界稳定。
- 登录、连接、会话和文本消息形成真实纵向链路。
- 已迁移页面通过 `docs/rn-h5-migration-contract.md` 的视觉、资产、API 和路由 parity gates。
- 根级验证、浏览器冒烟和关键持久化回归均有证据。
- 剩余媒体、RTC、通知或生产化能力已进入新执行包或显式 backlog。
- W6.a3.2 已关闭归档会话能力：SDK 统一全分页/latest-message/快照收敛并隔离普通缓存，RN/Web 实际消费同一 owner，H5 以 React Router 独立归档页完成入口、搜索、分页、下拉和菜单投影；真实 mutation/list-back 保留验收门。

## Verification Ladder

1. package scoped:
   - `npm --prefix ../im28-sdk run typecheck:web`
   - `npm --prefix ../im28-sdk run test:web`
   - `npm --prefix ../im28-sdk run build:web`
2. Web App:
   - `npm run typecheck -w @im28/h5-web`
   - `npm run build -w @im28/h5-web`
3. workspace crossing:
   - `npm run verify`（包含 466 个 RN 资产逐文件 SHA-256 校验）
4. runtime closeout:
   - 启动 `npm run dev`，使用浏览器检查首屏、控制台和静态资源。
5. critical IM flow:
   - 使用真实 Gateway 环境进行登录、连接、收发、恢复和缓存一致性手工验证。

## Stop Conditions

- Gateway URL、认证协议或 token 所有权存在多个同等可行方案且本地契约无法判定。
- 下一步要求修改 `im28-phone` 的共享 SDK contract，超出当前 H5 package 边界。
- RN 页面没有稳定视觉/行为源，或所需 API 在 shared Web entry 中无可验证等价能力。
- 生产数据或凭据成为唯一验证前提，但当前环境未提供。
- 新需求属于媒体、RTC、通知等独立能力族，应建立新的执行包。
