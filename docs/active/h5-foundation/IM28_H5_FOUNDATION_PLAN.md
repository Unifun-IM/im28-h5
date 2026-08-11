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
- 防止 RN/Web 双轨：共享能力必须先在 `im28-sdk` 收敛为平台中性实现，再由 RN/Web production callers 实际消费；compile-only 不作为完成证据。

## Scope

- `apps/web/**`：Vite + React H5 应用壳及后续页面能力。
- 页面切换统一由 React Router 管理，页面组件不自行操作 History API。
- RN 样式、静态资产、页面状态与 API 能力只做浏览器适配，不另行设计。
- `../im28-sdk/src/platforms/web/**`：浏览器 SDK、存储适配和后续 Gateway runtime。
- `docs/active/h5-foundation/**`：当前阶段的 plan/status/workset 真相源。
- `architecture.md`、`README.md`、`docs/web-im-storage.md`：稳定边界和已实现事实。
- `../im28-sdk/docs/shared-capability-consumer-matrix.md`：跨端 owner、实际消费者、compat debt 与退出条件真相源。

## Active Convergence Gate

- `W6.a6.12.1-rn-web-single-track-convergence-gate`：consumer matrix 已建立；conversation settings 与 auto-delete 已通过中性 facade、RN/Web actual callers 和旧路径删除完成首个收敛，下一组处理 message mutation、mention、search、sync/realtime。
- H5 已闭环能力保留局部证据，但在 RN 接入同一 shared implementation 前只能标记 `shared-core-ready` 或 `compat-debt`。
- `W6.a6.18.3.3.1-shared-clear-history-core` 状态改为 `blocked-by-convergence-gate`，不得在既有双轨上继续增加共享业务表面。

## Non-goals

- 不把当前可运行 H5 页面骨架视为 RN 视觉/交互迁移完成。
- 不复制 `im28-sdk` 已有的 DTO、Repository、Gateway client 和数据库 contract。
- 不直接复用 React Native runtime/`StyleSheet`，不在页面中调用 Gateway/OpenAPI，也不以第三方近似图标替换已有 RN 资产。
- 不在 Worker 与多标签页 writer 实现及浏览器并发证据完成前声明浏览器存储达到生产级并发能力。
- 不改变 `im28-phone` React Native 应用或原生工程。

## Current Baseline

| area | current truth | source |
| :--- | :--- | :--- |
| Web application | Vite + React Router 根壳、404 与 authenticated `PrimaryTabsLayout` 已实现 | `apps/web`; `architecture.md` |
| RN parity foundation | 迁移合同已冻结；466 个资产按字节同步；auth entry、conversation、chat、contacts/contact-profile、friend/group applications、calls、me/profile/security、settings、global tab shell 与 onboarding core 均为 local/acceptance-gated；valid authenticated data/mutations、onboarding context、cache/network blocked or gated | `docs/rn-h5-migration-contract.md`; `apps/web/src/assets/rn`; `apps/web/src/styles/rn-theme.css` |
| shared SDK | `@im28/im-sdk/core` 提供平台中立 contract、Repository 和 Gateway client | `../im28-sdk/src/core.ts` |
| Web SDK/runtime | `sql.js + IndexedDB`、login/register/account-credential auth-bound lifecycle、notification/permission settings facade、public platform-term/client-version adapters、共享 mutation queue、HTTP/realtime sync、remote contact list/user search、peer profile/conversation/apply、call-record cache/sync/delete、current-profile read/update、preset/custom emoji、same-row retry、uploaded-media checkpoint recovery、shared forward、群 mention core、未读 mention、sender cache priority 与聊天缓存关键词/类型/时间范围查询已实现；当前 SDK Web 全量共 52 文件/165 测试 | `../im28-sdk/src/platforms/web/runtime/**`; `../im28-sdk/src/platforms/web/storage/**`; `../im28-sdk/src/sync/**` |
| Gateway runtime | 本地 auth/realtime/account DB 实现与验证已通过；真实环境 smoke 保留为 deployment gate | `docs/runtime-contracts/web-gateway-runtime.md` |
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
| `W3.real-gateway` | W3 closeout、W4/W6 data-backed final acceptance、真实聊天 smoke | W4 contract/sync 与 W6 source mapping/asset/theme/local UI implementation |
| `W5.browser-matrix` | storage production acceptance | W6 local style/route/API implementation |

W4 本地实现以 W3 code/contract/storage gates 为 entry；缺少部署 URL 或测试账号不能被解释为 W3/W4 已验收。

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
  - `W6.a6.18.3.3.1-shared-clear-history-core` 暂停于 `blocked-by-convergence-gate`；setting/auto-delete caller 已收敛，但相关 sync/realtime consumer 仍未收敛，暂不恢复 schema/Repository/facade/realtime deterministic chain。真实 `self|both|all_members`、页面确认与 destructive browser acceptance 继续保持授权门。
  - `W6.a5.2.1.1-contact-pinyin-index-parity` 已完成本地闭环：H5 联系人展示层复用 RN `pinyin-pro@3.28.1` 和同一姓氏优先参数，中文索引、数字/符号 fallback 与分组顺序均有纯函数回归和真实 7 行只读证明；SDK/RN runtime 未改动。
  - `W6.a5.2.1.2-contact-route-code-split` 已完成本地闭环：`/contacts` 经 React Router `React.lazy + Suspense` 按路由加载，搜索过滤从拼音分组模块拆出；生产 main chunk 从 1,088.14 kB/366.35 kB gzip 降至 793.79 kB/222.24 kB gzip，联系人 chunk 为 294.92 kB/145.52 kB gzip。
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
