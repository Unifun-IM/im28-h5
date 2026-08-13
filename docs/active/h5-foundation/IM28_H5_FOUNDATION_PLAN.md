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

## W6.a6.20.57 Primary Contacts Tab Verification Badge

| field | value |
| :--- | :--- |
| source | RN `HomeTabBar` 的通讯录角标、`ChatHomeScreen` 好友/群申请计数和联系人刷新入口 |
| capability | 全局通讯录 Tab 展示好友申请未读与群申请总数之和；TabBar 与通讯录 shortcut 共用一个主布局快照；进入/下拉后刷新 |
| boundary | H5 只持有 Tab 生命周期与展示；计数读取继续调用既有 SDK `friendApplications.getUnreadCount/groupApplications.getUnreadCount`；RN business/source 冻结 |
| implementation | `PrimaryTabsLayout` 组合 hook；Provider 暴露只读计数/刷新端口；同账号并发读取合并并阻止旧账号结果回写；删除主 Tab 禁用遗留 |
| verification | focused 3/7、full 111/344、H5 typecheck、1165-module build、diff check；真实 2 联系人、四 Tab SPA 往返、零值隐藏 browser proof |
| status | `completed/done-local/presentation-owner-converged; non-zero-data-gated` |

## W6.a6.20.56 Legacy Chat Forward Route Compatibility Convergence

| field | value |
| :--- | :--- |
| source | `.54` 删除独立转发目标页后遗留的旧 React Router 地址、浏览器历史和进程内稳定 ID state |
| capability | 旧 `/conversations/:conversationID/forward` 安全 replace 回当前聊天；有效同源稳定 ID 只触发现有聊天内目标弹窗一次；刷新/后退不重放 |
| boundary | H5 只持有 route/state compatibility；目标 presentation 继续唯一归 `ChatTargetPickerModal`，转发业务继续归 shared SDK；RN business/source 冻结 |
| implementation | 新增无 UI 的 `ChatForwardCompatibilityRedirect`；复用严格 route reader，校验路由、来源与加载后当前会话一致，并立即清除一次性 state |
| verification | focused 1/4、full 110/341、typecheck、1165-module build、diff check；旧 URL、reload、back 与零日志 browser proof |
| status | `completed/done-local/compatibility-only; browser-readonly-pass` |

## W6.a6.20.55 Chat Initial Message Skeleton Parity

| field | value |
| :--- | :--- |
| source | RN `ChatMessageSkeleton.tsx` 的固定 incoming 气泡、群头像、骨架尾巴、shimmer 与底部裁切行为 |
| capability | 聊天冷首屏使用 12 条 RN 同构骨架；群/单聊头像差异明确；加载内容锁定消息视口并从底部排列 |
| boundary | H5 只持有 loading presentation 和 CSS；history/cache/loading 状态继续由既有 ChatPage/SDK owner 提供；RN business/source 冻结 |
| implementation | 新增独立 `ChatMessageSkeleton` 与专属 CSS；删除 `ChatMessageList` 内旧 4 条交替占位；复用 RN skeleton tail 资产和主题变量 |
| verification | H5 focused 1/3、full 110/339、466 assets、typecheck、1164-module build；第二账号真实短群聊底部几何/稳定 reload；自然冷帧因 cache 过快 gated |
| status | `completed/done-local/presentation-only; cold-frame-timing-gated` |

## W6.a6.20.54 Unified Chat Target Picker And Short-List Bottom Alignment

| field | value |
| :--- | :--- |
| source | RN 二维码分享目标弹层、转发/群发/名片选择流程与聊天 FlatList 底部对齐行为 |
| capability | 好友/群聊目标统一封装为可配置单选/多选弹窗；多选提供当前筛选范围 ALL；一次确认可发送多个目标；短消息列表贴近输入区底部 |
| boundary | H5 只持有 modal/search/tab/selection/route source 与 CSS；SDK 持有多目标转发、type108 名片 batch-send 和部分结果；RN business source 冻结 |
| implementation | 新增 `ChatTargetPickerModal`；聊天转发留在当前页；群发、二维码、用户/群名片复用同一弹窗；删除独立转发目标页；消息列表增加内部 bottom-aligned stack |
| verification | SDK focused 3/13 + all-runtime boundary/typecheck；H5 full 109/337、typecheck、1161-module build；登录态弹窗跨 Tab/ALL、URL 不跳转和短列表底对齐 browser proof |
| status | `completed/shared-core-ready/web-consumed/rn-frozen; mutation-acceptance-gated` |

## W6.a6.20.53 Pull Refresh Indicator Owner Convergence

| field | value |
| :--- | :--- |
| source | 已完成的 RN `RefreshControl` 页面与 H5 全部 `usePullRefresh` 生产消费者 |
| capability | 跨页面下拉、松开、刷新三态只由一个全局展示 owner 投影，页面刷新 facade 和状态机不变 |
| boundary | H5 仅收敛 JSX/CSS；不修改 refresh callback、Gateway、SQLite、DTO、mutation、SDK 或 RN business |
| implementation | Calls、Contacts、JoinedGroups、CreateGroup、会话/归档/搜索、群成员、添加管理员、转让群主共 10 页改用 `PullRefreshIndicator`；删除 9 个 CSS 文件中的局部提示选择器 |
| verification | 20/20 consumer contract、legacy selector zero、focused/full H5、assets、typecheck、build、真实登录态四路由只读 browser smoke |
| status | `completed/done-local/presentation-owner-converged; physical-touch-gated` |

## W6.a6.20.52 Forward Target Pull Refresh

| field | value |
| :--- | :--- |
| source | RN `ForwardTargetSelector.tsx` 普通转发选择页的 `RefreshControl` 与既有 H5 转发目标主链 |
| capability | 最近聊天、好友、群聊三类目标顶部单指下拉、统一三态反馈、失败保留当前目标/Tab/搜索词 |
| boundary | H5 只负责手势和提示；三类事实继续复用 `loadChatForwardTargets -> WebIMSync`；不打开目标或提交真实转发 |
| implementation | `ChatForwardTargetPage` 复用全局 `usePullRefresh/PullRefreshIndicator`；手动刷新全部成功后才替换三类快照 |
| verification | pull/shared-owner contract、既有 source/view tests、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-gated` |

## W6.a6.20.51 Blacklist Pull Refresh And Indicator Convergence

| field | value |
| :--- | :--- |
| source | RN `ProfileScreen.tsx` 黑名单 FlatList 的 `refreshing/onRefresh` 与既有 H5 黑名单主链 |
| capability | 黑名单顶部单指下拉、三态反馈、失败保留旧列表与搜索词；跨页面刷新提示单 owner |
| boundary | H5 只负责手势和提示；读取与解除继续复用 shared `blacklist`；不执行真实解除 mutation |
| implementation | `MeBlacklistPage` 复用全局 `usePullRefresh`；七个页面收敛到 `PullRefreshIndicator`，删除两套旧组件与重复 CSS |
| verification | pull/shared-owner contract、黑名单筛选、全局提示消费者、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; empty-data-and-physical-touch-gated` |

## W6.a6.20.50 Group Applications Pull Refresh

| field | value |
| :--- | :--- |
| source | RN `GroupApplicationListView.tsx` 的 `RefreshControl` 与既有 H5 指定群申请处理主链 |
| capability | 指定群申请列表顶部单指下拉、统一三态反馈、失败保留旧列表与搜索词 |
| boundary | H5 只负责手势和提示；读取与 accept/reject 继续复用 shared `groupApplications`；不执行真实申请 mutation |
| implementation | `GroupApplicationsPage` 复用全局 `usePullRefresh` 与既有 `VerificationPullIndicator`；刷新成功后才替换页面事实 |
| verification | pull/shared-owner contract、既有申请 view、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-and-action-data-gated` |

## W6.a6.20.49 Group Mute Pull Refresh

| field | value |
| :--- | :--- |
| source | RN `GroupMuteScreen.tsx` 手动禁言列表 `RefreshControl` 与既有 H5 群禁言主链 |
| capability | 群禁言页顶部单指下拉、统一三态反馈、失败保留禁言范围与成员快照 |
| boundary | H5 只负责手势和提示；刷新继续复用 shared `groups/groupMembers`，mutation 继续复用 `groupManagement`；不执行真实禁言 |
| implementation | `GroupMutePage` 复用全局 `usePullRefresh`；提示收敛为三个群页面共用 `GroupPullRefreshIndicator` |
| verification | mute/pull/shared-owner contract、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-gated` |

## W6.a6.20.48 Group Member Selection Pull Refresh

| field | value |
| :--- | :--- |
| source | RN 群邀请与移除成员选择页的 `RefreshControl`，以及既有 H5 群成员选择主链 |
| capability | 两页顶部单指下拉、统一三态反馈、失败保留旧候选与选择 |
| boundary | H5 只负责手势和提示；同步继续复用 shared `groups/groupMembers/contacts`；不执行邀请或移除 mutation |
| implementation | 两页复用全局 `usePullRefresh` 与 `GroupMemberSelectionPullIndicator`；所有 facade 成功后才一次替换候选事实 |
| verification | shared-owner/pull contract、既有页面 view、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-gated` |

## W6.a6.20.47 Joined Groups Pull Refresh

| field | value |
| :--- | :--- |
| source | RN `ContactGroupListScreen.tsx` 的 `RefreshControl` 与既有 H5 `/contacts/groups` 主链 |
| capability | 群列表顶部单指下拉、刷新反馈、失败保留旧快照 |
| boundary | H5 只负责手势与提示；列表同步继续复用 shared `groups.sync`；不执行群生命周期 mutation |
| implementation | `JoinedGroupsPage` 复用全局 `usePullRefresh`，页面 CSS 投影统一三态提示 |
| verification | pull/shared-owner contract、群列表 view、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-gated` |

## W6.a6.20.46 Create Group Selection Review And Pull Refresh

| field | value |
| :--- | :--- |
| source | RN `CreateGroupScreen.tsx` 普通建群选中态、已选好友复核层与 `RefreshControl` |
| capability | 选中头像预览、清空、逐个移除、搜索返回和联系人下拉刷新 |
| boundary | H5 只负责 UI/手势；创建与联系人读取继续复用 shared SDK 既有 owners；不执行真实建群 mutation |
| implementation | `CreateGroupSelectedFriends` + 纯候选投影 helper + `usePullRefresh`；复用全局 `InteractionModal` |
| verification | helper/component/pull focused、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-gated` |
- 防止 Web 自建业务分支：共享能力先在 `im28-sdk` 收敛为平台中性实现，再由 H5/Web production caller 消费。RN 当前业务冻结；未获独立授权前不改 RN caller，状态标记 `shared-core-ready/web-consumed/rn-frozen`，不得伪报跨端完成。

## Scope

- `apps/web/**`：Vite + React H5 应用壳及后续页面能力。
- 页面切换统一由 React Router 管理，页面组件不自行操作 History API。
- 跨页面动效与 modal 生命周期统一归 `apps/web/src/components/interaction/**`；只操作瞬时 presentation state，不持有业务状态、SDK 调用或路由决策。
- RN 样式、静态资产、页面状态与 API 能力只做浏览器适配，不另行设计。

### W6.a6.20.17 Chat Message Action Modal

| field | value |
| :--- | :--- |
| source | RN `useChatMessageActionMenu -> MessageActionBubbleModal -> ActionBubbleMenu` |
| target | H5 `ChatMessageAction -> ChatMessageActionModal -> InteractionModal` |
| behavior | `500ms/8px` gesture、context/keyboard entry、full-screen blur、message preview、incoming-left/outgoing-right、viewport clamp、vertical reveal |
| invariant | 动作回调与 shared business owner 不变；preview inert；modal portal 必须位于 body；不得复制 Gateway/SQLite/消息状态机 |
| gate | pure layout tests + H5 typecheck/full verify + authenticated non-mutating browser smoke |
| stop | 不执行复制、编辑、转发、收藏、删除或消息发送；不改 RN/SDK business |

### W6.a6.20.18 Chat Link Action Surface Convergence

| field | value |
| :--- | :--- |
| source | RN 链接动作继续使用 `MessageActionBubbleModal` presentation；H5 `W6.a6.20.16` 旧链接菜单与 `W6.a6.20.17` 普通消息 modal |
| target | H5 `ChatMessageLinkAction/ChatMessageActionModal -> ChatActionModalSurface -> InteractionModal` |
| behavior | 链接普通点击不变；`500ms/8px` 长按、右键、打开/复制两项、收发靠边、viewport clamp 与全局遮罩统一 |
| invariant | shared URL projection、browser open port、clipboard success-only、普通消息动作业务均不变；旧 inline menu 必须退出生产链 |
| gate | anchor/layout behavior tests + existing link contracts + H5 typecheck/full verify + authenticated non-mutating ordinary-message regression |
| stop | 不制造链接消息、不打开外链、不复制或执行消息 mutation；不改 RN business；不运行 RN/desktop builds 或 `build:package:desktop:web` |

### W6.a6.20.19 Friend Profile Presence

| field | value |
| :--- | :--- |
| source | RN `UserProfileScreen` 的好友 presence 初始查询、订阅和导航栏在线/离线投影 |
| target | SDK `createIMUserPresenceSync/WebIMSync.presence` + H5 `useContactProfilePresence` |
| behavior | 先订阅再查询；OpenAPI 100 人分批；realtime 胜过迟到 HTTP；未知状态保持未知；黑名单展示优先 |
| invariant | presence 只存当前账号 runtime 内存，不写 SQLite；退出、切号、token 失效、被踢和 dispose 清订阅；页面不得直调 Gateway/WebSocket |
| gate | SDK behavior/runtime tests + SDK/H5 typecheck/full verify + 真实好友资料只读浏览器 smoke |
| stop | 不修改 RN caller/business，不执行资料 mutation，不运行 RN/desktop builds 或 `build:package:desktop:web` |

### W6.a6.20.20 Group Member Presence

| field | value |
| :--- | :--- |
| source | RN `GroupMembersScreen -> useGroupMemberOnlineStatus` 的普通群判定、批量查询与在线绿点 |
| target | SDK `normalizeIMGroupMode/isIMNormalGroupMode` + H5 `useGroupMemberPresence` |
| behavior | `1|normal` 标准化为普通群；仅普通群批量观察完整成员；只显示明确在线成员；large/unknown fail-closed |
| invariant | 复用 `.20.19` shared presence HTTP/realtime/lifecycle；页面不持有 Gateway/WebSocket/SQLite 或群模式 magic number |
| gate | SDK group-mode/joined-group/presence tests + H5 view/typecheck/full verify + 真实普通群成员页只读 smoke |
| stop | 不改 RN caller/business，不执行群/成员 mutation，不运行 RN/desktop builds 或 `build:package:desktop:web` |

### W6.a6.20.21 Group Settings Preview Presence

| field | value |
| :--- | :--- |
| source | RN `GroupSettingsScreen -> useGroupMemberOnlineStatus` 只观察设置页预览成员并显示在线绿点 |
| target | H5 `ChatSettingsPage -> useGroupMemberPresence`，复用 `.20.20` shared mode/presence owner |
| behavior | 仅普通群观察实际渲染的最多 10 名预览成员；只给明确在线成员显示 RN 14/8px 状态点 |
| invariant | 不新增设置页 presence service、HTTP/WebSocket/SQLite、群模式数字判断或完整成员订阅 |
| gate | H5 settings/group-member focused tests + H5/SDK Web typecheck/full verify + 真实普通群设置页响应式只读 smoke |
| stop | 不改 SDK/RN business，不执行群/成员 mutation，不运行 RN/desktop builds 或 `build:package:desktop:web` |
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
| Web SDK/runtime | `sql.js + IndexedDB`、login/register/account-credential auth-bound lifecycle、notification/permission settings facade、public platform-term/client-version adapters、共享 mutation queue、HTTP/realtime sync、remote contact list/user search、peer profile/conversation/apply、call-record cache/sync/delete、current-profile read/update、preset/custom emoji、same-row retry、uploaded-media checkpoint recovery、shared forward、群 mention/realtime/clear-history/list-actions、群管理/创建、文本/图片/视频/文件/语音群发、二维码协议/个人与群码展示/公开群申请与聊天缓存查询已实现；当前 `test:web` 为 82 文件/337 测试 | `../im28-sdk/src/platforms/web/runtime/**`; `../im28-sdk/src/platforms/web/storage/**`; `../im28-sdk/src/sync/**` |
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
  - onboarding 按 `route/state owner -> invite register retry -> complete-profile core -> avatar extension` 推进；pending verification secret 只驻留内存，contact 验证码缺口独立冻结。
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
  - `W6.a6.18.3.13-group-management-mutation-contract-audit` 的初始只读结论已由 `.13.1-.13.6` 完成 Web consumer 落地：permission、remove、invite、admin/owner、settings/mute、leave/dismiss 均由 shared owner 服务 H5；RN invite/remove/admin/transfer/settings/mute/leave/dismiss 生产链保持冻结。全部真实 mutation 仍保留授权门。
  - `W6.a6.18.3.13.1-shared-group-management-permissions` 已完成 Web 只读消费：SDK neutral resolver 持有 Web explicit capability/fail-closed 投影，H5 joined-group 快照驱动入口；RN 原 helper 已恢复并冻结，状态为 `shared-core-ready/web-consumed/rn-frozen`。
  - `W6.a6.18.3.13.2-shared-member-removal` 已完成 Web 本地消费：SDK 持有 Web 成员目标校验、exactly-once Gateway remove、事务和独立权威刷新，H5 提供 React Router 候选/搜索/确认页；RN Gateway/OpenIM 与页面事件链恢复冻结基线，不是 shared consumer。真实移除与第二账号 realtime/list-back 保留授权门。
  - `W6.a6.18.3.13.3-shared-member-invitation` 已完成 Web 本地消费：SDK 按审核开关持有好友/成员 preflight、唯一申请或直接邀请、严格响应和独立成员刷新，H5 仅保留选择与确认；RN 保持冻结。
  - `W6.a6.18.3.13.4-admin-owner` 已完成 Web 本地消费：SDK 持有管理员候选/上限、群主候选、owner capability、exactly-once、group/member 原子角色收敛和独立权威刷新；H5 `/settings/manage` 只持有 React Router、列表、picker 和 modal，RN 业务零修改。真实角色 mutation 与第二账号 realtime/list-back 保留授权门。
  - `W6.a6.18.3.13.5-group-settings-and-mute` 已完成 Web 本地消费：SDK `createIMGroupManagementSync` 持有 field capability、显式 patch、普通成员目标、exactly-once 和 strict group/member cache merge；H5 管理主页、禁言页与发言频率页只保留 React Router、草稿/确认/modal 和可见 partial-success，RN 业务零修改。真实 toggle/mute、server-denial 与第二账号 realtime/list-back 保留授权门。
  - `W6.a6.18.3.13.6-group-lifecycle` 已完成 Web 本地消费：SDK `createIMGroupLifecycleSync` 持有 leave/dismiss 权限、exactly-once Gateway write、strict group response 与 attachments/messages/group conversations/members/group 原子 cleanup；H5 群设置只保留 shared capability 入口、native dialog、导航和 `remote-only` 防重放锁定。RN 业务零修改，真实退群/解散未执行。
  - `W6.a6.18.3.14-group-creation` 已完成 Web 本地消费：SDK `group-creation.ts` 持有 2–998、稳定 ID 去重/本人拒绝、RN 默认群名、exactly-once Gateway、strict group/conversation identity 和群/会话原子事务；H5 `/groups/create` 与共享首页更多入口只保留好友选择、搜索和 React Router 导航。RN 业务零修改，真实创建未执行。
  - `W6.a6.18.3.15-message-broadcast-text` 已完成 Web 本地消费：SDK `message-broadcast*.ts` 持有 1–50 好友/群目标、稳定批次/消息 ID、单次 batch-send、逐目标 partial-result 与 success-only 消息/会话事务；H5 `/broadcast/select -> /broadcast/compose` 只保留 cache-first 目标选择、文本草稿和结果反馈。RN 广播业务零修改，真实发送未执行；媒体群发进入 `.15.1` 独立合同，扫码进入后续浏览器平台切片。
  - `W6.a6.18.3.15.1-message-broadcast-media` 已完成 Web 本地消费：SDK 图片/视频/文件群发复用普通消息媒体校验/body/OSS 快照 owner，整批 upload once + batch-send once，上传失败零 Gateway 且切号 fail-closed；H5 compose 只保留 RN 资产入口、浏览器 File/video metadata、可回收预览和结果卡片。RN 广播业务零修改，真实文件选择/上传/发送未执行；语音进入 `.15.2`。
  - `W6.a6.18.3.15.2-message-broadcast-voice` 已完成 Web 本地消费：SDK `prepareWebIMAudioUpload` 同时服务普通聊天和群发；H5 compose 直接复用聊天 recorder/hook/gesture/CSS owner。只读切换了语音模式，未按住、未请求权限、未录音上传发送；RN 广播业务零修改。
  - `W6.a6.18.3.16-.19-qr-code-chain` 已完成 Web 本地消费：SDK `modules/qr-code` 统一用户/群二维码协议，H5 browser adapter 承担扫码/Canvas/PNG；个人和群二维码共用展示 owner，应用内分享与普通转发共用 `forward-target-source`，确认后只走 shared `messages.sendImage`。真实相机/相册、群申请、PNG 上传/消息发送和第二账号 list-back 均未执行，RN 业务零修改。
  - `W6.a6.20.1-forgot-password-methods` 已完成 RN parity：账号登录不再用“接口不存在”代替动作，手机号、邮箱和客服说明复用全局原生 modal；未新增已下线忘记密码 API。RN 网络设置依赖 native HTTP/OpenIM proxy，H5 登记 `web-not-applicable`，Electron/Desktop 后续由独立 platform adapter 承接。
  - `W6.a6.20.2-chat-composer-card-send` 已完成本地闭环：shared SDK `messages.sendCard` 统一用户/群 type108 当前会话发送、状态收敛与失败重试；H5 附件面板复用 RN 名片资产和 cache-first 用户/群选择器。隐藏发送人转发仍维持既有不支持 type108 的独立矩阵，RN 业务未改，真实发送和第二账号 list-back 保留验收门。
  - `W6.a6.20.3-chat-composer-camera-rtc-entries` 已完成 H5 platform composition：拍照通过单张 `capture=environment` input 复用既有 album 校验和 shared 图片发送；单聊 RTC 通过共享通话方式弹层进入唯一 `WebIMCallProvider -> SDK calls`，群聊隐藏。未请求相机/媒体权限或发起真实呼叫，RN 业务未改。
  - `W6.a6.20.4-chat-composer-pending-attachment` 已完成本地闭环：SDK shared core 固定单媒体待发送判定、编辑态附件互斥和 `media -> file -> text` 提交顺序；H5 文件选择后展示 RN 同款待发送栏并在一次 operation 内串行调用既有消息 facade。RN 业务未改，真实文件上传、带草稿组合发送和第二账号 list-back 未执行。
  - `W6.a6.20.5-group-server-search` 已完成本地与真实账号空态闭环：SDK transport 保留群搜索 wrapper，shared facade 统一稳定 ID 去重及 `pending > joined > available`；H5 `/groups/create -> /groups/search` 复刻 RN 独立搜索 route，并把可申请结果接回既有申请页。当前账号真实关键字和已知旧群 ID 均返回空列表，因此可加入行、真实申请和加入后 list-back 继续 data-gated；RN 业务未改。
  - `W6.a6.20.6-onboarding-avatar` 已完成本地闭环：SDK `WebIMSync.profile` 统一静态头像/10MB/远端 URL、生产 Web OSS adapter、上传前后账号一致性和 update 响应身份；H5 复刻 RN 相册/拍照/取消，并把群/个人头像裁剪收敛为单一 512x512 JPEG Canvas owner。上传成功只更新 onboarding 内存草稿，最终完成才提交资料；有效新账号上下文、真实上传/update 和响应式视觉仍 blocked-external，RN 业务未改。
  - `W6.a6.20.7-personal-profile-avatar` 已完成本地闭环：SDK `WebIMSync.profile.updateAvatar` 以同一账号原子编排静态头像校验、生产 Web OSS 上传、avatar-only profile update 与响应身份校验；H5 `/me/profile` 增加 RN 同款头像行并复用 onboarding 的来源 sheet、文件合同和 512x512 JPEG crop owner。412px 已登录页面只验收打开/取消，无真实上传或资料 mutation；RN 业务未改。
  - `W6.a6.20.8-verification-unread` 已完成本地闭环：SDK friend application facade 统一专用未读与明确 IDs 单条已读，group application facade 统一审核 `total`；H5 通讯录入口和验证双 tab 共用 hook/角标，incoming 资料入口调用 shared mark-read。真实账号计数为 0 且好友申请均 outgoing/accepted，因此未执行 mutation；RN 业务未改。
  - `W6.a6.20.9-group-conversation-open` 已完成本地闭环：SDK `openIMGroupConversation` 统一按群目标 cache-first 打开规范会话，缺失或失效 ID 时只信 `getGroup` 返回的真实 conversation ID，严格校验 Gateway 群/会话身份并在当前账号队列内缓存 latest/conversation；H5 我的群聊、共同群聊和查找群聊已加入分支只消费同一 facade。真实账号无已加入/共同群，仅完成空态只读验收；RN 业务未改。
  - `W6.a6.20.10-home-search-pagination-and-stale-request` 已完成本地闭环：H5 首页全局搜索继续消费 shared contact/group/conversation cache 与 `messages.searchCached(limit, offset)`，补齐 RN 8 条聊天记录分页、同会话跨页计数/最远消息定位、request generation 和下拉重读。412px 真实账号证明缺省历史、好友与聊天记录分区；缓存不足 8 条使“查看更多”运行态 data-gated，RN/SDK 业务均未改。
  - `W6.a6.20.11-home-search-highlight-parity` 已完成本地闭环：H5 好友/群聊搜索结果按 RN 既有规则对标题与副标题执行大小写不敏感、多处命中品牌色，聊天记录汇总行保持无高亮。412px 真实账号证明好友命中为品牌色、聊天记录 `mark=0` 且零横向溢出；RN/SDK 源码均未改。
  - `W6.a6.20.12-home-search-clear-control` 已完成本地闭环：H5 复用 RN `xmark-circle` 补齐 AppSearchBox 默认清除按钮，页面统一复位 request generation、结果、分页和错误态；清除后显式恢复 input focus。412px 真实账号证明 2 行结果归零、历史恢复、input active 且零横向溢出；RN/SDK 业务均未改。
  - `W6.a6.20.13-group-admin-routes` 已完成本地闭环：H5 将 RN 群管理员列表和添加候选对齐为 `/settings/manage/admins`、`/admins/add` 两个独立 route，删除管理页旧管理员 modal/action；SDK 公开并唯一校验 `IM_GROUP_ADMIN_LIMIT`，H5 候选刷新时裁剪失效选择。当前账号目标群已不在 cache，只完成 412px 真实错误态、权限 fail-closed 与零溢出证明；未执行角色 mutation，RN 业务未改。
  - `W6.a6.20.14-group-owner-transfer-route` 已完成本地闭环：H5 将 RN 群主转让对齐为 `/settings/manage/owner-transfer` 独立 route，删除管理页旧 picker、成员加载与 mutation action；管理员/群主页面共用 cache-first route data adapter，SDK 继续唯一持有候选、权限、exactly-once 与角色缓存事务。focused 10/10 和 full verify 通过；浏览器复验受真实 SQLite 多标签互斥锁阻塞，未执行角色 mutation，RN 业务未改。
  - `W6.a6.20.15-joined-group-row-actions` 已完成本地闭环：H5 我的群聊行复用 RN `300ms/8px` 长按合同，按 shared capability 展示分享群名片、退出群聊和修改群名称；分享/改名先由 shared `openGroup` 解析 canonical Conversation，再进入既有 SPA route，普通成员退出只调用 `groupLifecycle.leave(clearHistory)`。群主不复制 RN 客户端挑管理员并隐式退出的双轨编排，而是显式进入现有群主转让 route，转让后回我的群聊并由用户再次确认退出。focused 10/10 和 full verify 通过；当前账号群列表为空，非空气泡视觉与所有 destructive mutation 仍 data-gated/未授权，RN 业务未改。
  - `W6.a6.20.16-chat-text-link-actions` 已完成本地闭环：SDK shared core 对齐 RN HTTP(S)/www 链接边界、尾随标点和 www->HTTPS；H5 富文本气泡实际消费 shared 片段，普通点击开隔离新标签，500ms 长按/右键只显示打开/复制，复制保留原文并阻断外层消息菜单。当前真实群聊无链接消息，只完成 412px 健康/零溢出/零 console 证明；未发送测试消息，RN business/caller 均未改。
  - `W6.a6.20.25-chat-audio-played-auto-next` 已完成本地闭环：SDK 纯规则统一语音稳定身份、RN localEx 已播放兼容和下一条 incoming type103 选择；H5 chat route 只持有账号/会话 localStorage、未播放红点和唯一 HTMLAudio，自然结束连播、手动停止/失败不推进。RN caller 冻结，真实认证媒体播放仍 data-gated。
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

## Completed W6.a6.20.26

- 对齐 type115 气泡：快照尺寸优先、旧消息自然尺寸探测、180px 最大宽度、保持比例且不放大小图。
- 复用 route-scoped media owner 增加 `emoji` 纯图片预览；普通图片保存工具栏保持不变。
- 非 HTTP(S) URL fail-closed，解码失败显示稳定失败态；未增加 SDK、Gateway、SQLite 或发送分支。
- focused 15 tests、full SDK Web 89/371、466 assets、typecheck、1125-module build 和真实 412px 路由只读检查通过。
- 当前真实会话无 type115，真实横/竖资源与预览点击保留为 sample gate。

## Completed W6.a6.20.27

- 新增 SDK shared 初始未读导航规则，统一精确 uint64、incoming、稳定消息身份和 RN type1201 边界。
- H5 增加最后已读锚点、未读分割线、剩余未读浮层、80% 可见度统计和 40px 最新端跟随保护；系统消息进入同一身份链。
- 搜索稳定消息定位优先；路由切换重置只读状态；不执行 mark-read/read receipt 或缓存 mutation。
- SDK focused 3 tests、H5 focused 8 tests、full Web 90/374、466 assets、RN/Web/Desktop SDK typecheck、H5 typecheck 与 1127-module build 通过。
- 真实 412px 当前账号无未读样本：验证零误画、最新端、零 overflow/error；非零未读视觉和滚动保留 data gate。

## Completed W6.a6.20.28

- SDK 同一未读模块增加可见身份到最高 incoming uint64 seq 的纯规则，H5 不复制序列或方向筛选。
- H5 复用 converged `conversations.markRead`，对齐 RN 的短列表真实测量、长列表用户交互、显式未读入口和最新端 realtime 放行门禁。
- 修复 shared partial read 收敛：服务端 `unread_count` 优先；无回包事实且未读到 `lastMsgSeq` 时保留原 unreadCount，避免 RN/H5 提前清角标。
- focused SDK 8 tests、H5 4 tests、full SDK Web 90/376、466 assets、runtime boundary、RN/Web/Desktop SDK 与 H5 typecheck、1128-module build 通过。
- 真实 412px 无未读会话零误画/overflow，干净 reload 零 error；真实非零 partial read、回包计数与 list-back 保留 data gate。

## Completed W6.a6.20.29

- SDK 新增历史窗口纯规则和 strict page facade，统一精确 uint64 previous cursor、稳定身份去重排序、clear boundary、SQLite upsert 与 `has_more/next_seq`；旧 `pullHistory` 数组返回保持兼容。
- H5 只持有用户 wheel/touchmove/pointer 手势、顶部阈值、DOM 前插高度补偿和 1.2 秒滚动日期悬浮；初始未读与搜索定位的程序滚动不得误拉历史。
- focused SDK 4/21、full SDK Web 91/381、H5 focused 4/8、466 assets、runtime boundary、SDK/H5 typecheck、build:web package sync 与 1131-module build 通过。
- 真实 412px 短会话验证零误分页、loading/sticky/overflow；当前无长历史和 `has_more/next_seq` 样本，真实位置补偿与悬浮日期保留 data gate。
- RN `useChatLoadMore` caller 保持冻结，状态为 `shared-core-ready/web-consumed/rn-frozen`；未修改 RN business 或同步 RN package，未执行 `build:package:desktop:web`。

## Completed W6.a6.20.30

- SDK `getCachedByStableMsgIDs` 按 client/server 稳定身份批量读取当前账号 SQLite，保序并以 canonical client ID 去重；不新增 Gateway operation 或 cache mutation。
- H5 当前消息窗口优先，缺失来源才批量读取本地库；当前 DOM 直接居中高亮，本地来源用 React Router 同会话 `messageID` 目标窗口恢复。
- 只有确认当前账号本地缺失才显示“引用的内容已删除”；群引用发送人复用 shared `resolveIMGroupMemberDisplayName`，未复制名称规则。
- SDK focused 2/12、full Web 91/381、H5 focused 4/15、466 assets、runtime boundary、SDK/H5 typecheck、build:web package sync 与 1132-module build 通过。
- 当前真实账号三个会话均无引用消息，页面路由、零 overflow 与零新增 console error 已证；真实引用点击、目标窗口与高亮保留 data gate。
- RN `fetchMessageByID/FlatList` caller 保持冻结；未修改 RN business 或同步 RN package，未执行 RN/Desktop/build:all/`build:package:desktop:web`。

## Completed W6.a6.20.31

- H5 删除 flow 只消费既有 shared `messages.delete` 的 `deletedClientMsgIDs`；在 operation 内、SQLite 窗口重读前冻结成功行，partial result 的失败项不进入动画。
- `useChatMessageDeleteExit` 保留删除前窗口 620ms，合并期间新到 cache 行；逐行动画结束或 700ms 兜底后释放，不改变 SDK、Gateway、SQLite 或通知语义。
- `ChatMessageBubble` 为普通/系统消息复用固定 18 粒子的 RN 碎裂退场；独立 CSS 支持 reduced-motion，未继续扩大已接近上限的聊天主样式。
- H5 focused 4 files/13 tests、Web typecheck、1136-module production build 和 diff check 通过；412px 已登录真实聊天页零 overflow/error，CSS 620ms 规则真实加载。
- 真实单条/批量 `self/all` 删除、partial Gateway 结果与肉眼动画仍为破坏性验收门；本片未改 SDK/RN，也未执行 SDK/RN/Desktop build/sync 或 `build:package:desktop:web`。

## Completed W6.a6.20.32

- SDK 单一维护 RN 同优先级的群生命周期、权限、角色、禁言和频率限制规则，并由 joined-group DTO 投影不可用原因。
- H5 cache-first 恢复群与成员，独立收敛两类刷新失败；footer 固定多选、不可用、待转发和普通输入优先级。
- 恢复中、权威群缺失和无缓存读取失败均 fail-closed；有缓存弱网不清空已知限制。
- RN caller 冻结，受限群真实样本和群权限 realtime contract 保留验收门；下一片冻结单聊黑名单/陌生人关系提示。

## Completed W6.a6.20.33

- 冻结真实 contract：Gateway 只有 `is_friend` 与我方 blacklist，没有反向黑名单；RN `blockedByPeer` 历史字段按 stranger 兼容语义处理。
- SDK 单一维护 `blocked-by-me/stranger/friend` 投影、RN 文案与发送关系错误分类；组合 facade 复用 peer profile 和 blacklist owner。
- H5 route hook 只消费 SDK facade；我方拉黑替换 composer，陌生人保留 composer 并在消息底部进入 React Router 好友申请页；未知状态 fail-closed。
- SDK 96/395、全 target typecheck、boundary、build:web/sync:web，H5 focused 2/6、typecheck、1143-module build通过；真实群聊和两条好友单聊零回归。
- RN caller/业务零改动；下一片建立好友关系 domain revision，避免用通用消息 `dataVersion` 反复请求资料/blacklist。

## Completed W6.a6.20.34

- SDK 新增关系 realtime 共享判定，好友/我方 blacklist 事实变化推进独立 `relationshipVersion`；普通消息不再承担关系刷新信号。
- 仅申请列表变化被明确排除，好友申请接受保留为关系事实变化；Web runtime 不新增第二个 socket、transport 或 cache owner。
- H5 `useChatDirectRelationship` 仅把 runtime revision 加入既有 facade 重读依赖，继续沿用 W33 的 fail-closed 和错误可见规则。
- SDK Web 93/387、boundary、Web typecheck/build:web/sync:web，H5 typecheck、1144-module build通过；412px 真实好友单聊刷新、composer 和宽度通过。
- RN 业务、caller 和生成包零改动；真实双账号好友/blacklist realtime 仍为数据验收门。

## Completed W6.a6.20.35

- 单聊设置页成员加号进入独立 React Router SPA route，返回保持原会话设置；普通 `/groups/create` 入口不变。
- 页面从当前账号 conversations cache-first source 严格解析单聊对象，将其固定计入建群成员并从候选中隐藏，用户必须至少再选择一位好友。
- 两个入口都复用既有 SDK `groups.create`；H5 不复制 2–998、去重、本人拒绝、Gateway、`remote-only` 或群/会话原子缓存语义。
- H5 focused 2 files/13 tests、typecheck 与 1144-module production build 通过；412px 真实入口、候选排除、总数/按钮状态、返回和零 overflow 只读验收通过。
- 未执行真实创建；SDK source/package scripts 和 `im28-phone` 零改动，未执行 RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.36

- 唯一全局 `PrimaryTabBar` 对齐 RN 320ms 消息 Tab 双击窗口；只有消息页已选且存在非静音未读时才请求当前页面动作，离开消息路由清空时间窗。
- `PrimaryTabsLayout` 只持有当前会话页注册的短生命周期函数；`ConversationsPage` 按 `unreadCount > 0 || manualUnread`、首个可见行之后和上次目标循环规则选择稳定会话 ID。
- 目标行通过稳定 `data-conversation-id` 解析并只执行 `scrollIntoView`；不触发 markRead、read receipt、Gateway、Repository 或 SQLite mutation。
- H5 focused 2 files/10 tests、typecheck 与 1145-module production build 通过；既有 >500kB chunk warning 不变。
- 5176 dev 服务正常，但当前工具不能控制应用内登录态浏览器，Chrome 旧 5177 账号存储也未恢复；真实登录态双击滚动如实保留 manual gate，不注入假数据或伪造证据。
- SDK/RN source/package 零改动，未执行任何 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.37

- SDK `modules/message/call-message.ts` 成为历史通话消息唯一新增解析 owner，统一 core/Gateway/RN 包装、audio/video、七种状态、时长和 RN 文案。
- 实时 `rtc.call.invite/accept` 明确 fail-closed；历史摘要与终态才进入气泡，避免和既有来电 lifecycle 双轨。
- H5 消息 view 消费 shared 投影，气泡复用 RN 镜像图标；单聊点击进入既有 `handleStartCall -> WebIMCallProvider`，群聊只读。
- SDK focused 1/4、full Web 94/391、H5 focused 1/9、boundary、SDK Web/H5 typecheck 与 1147-module build通过。
- 5176 真实目标会话和 console 健康，但缓存无历史通话样本；视觉保持 data-gated，不注入假消息或发起真实呼叫。
- `im28-phone` clean；只执行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web`。

## Completed W6.a6.20.38

- SDK 新增会话草稿 facade 和只读文档 parser，统一当前账号会话校验、trim、预设表情 entities 与本地 SQLite 写入；草稿不调用 Gateway。
- schema v13 用 `draft_entities_json` 分列保存实体；全量/未归档会话远端替换前先快照本地草稿并合并，避免同步刷新清空尚未发送的输入。
- H5 `ChatPage/ChatComposer` 完成输入保存、列表 `[草稿]`、重进恢复、成功发送/显式清空移除；发送失败不清空草稿，列表不再自行解析 SDK payload。
- SDK focused 3 files/12 tests、Web full 95/394，H5 focused 2 files/12 tests、full 97/304，SDK Web/H5 typecheck、build:web/sync:web 与 1149-module build通过。
- 5176 登录态实际完成 `W38草稿😎` 输入、列表预览、重进恢复和清空回退最新消息，console 0 error；未发送消息或执行远端 mutation。
- `im28-phone` clean；RN caller/业务零改动，未执行 RN/Desktop/build:all/`build:package:desktop:web`。

## Completed W6.a6.20.39

- H5 `/calls` 复用全局 `usePullRefresh`，只在页面顶部单指释放后触发；编辑态禁用手势，避免和批量选择冲突。
- 刷新链严格复用既有 SDK `calls.sync -> listCached`，并保留当前 all/missed 筛选、搜索词与第一页大小；页面不新增 Gateway、SQLite、DTO 或通话状态 owner。
- 同步失败不会继续读取或替换 cache，旧列表保留并展示真实错误；成功才原子替换当前筛选列表与总数。
- H5 focused 1 file/4 tests、full 97 files/306 tests、typecheck、1149-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 在 412px 下完成所有/未接筛选、编辑/完成、空态和 TabBar 只读验收，宽度 412/412、console 0 warning/error；物理触摸下拉保留显式验收门。
- 本片 SDK 零改动，`im28-phone` clean；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.40

- 好友验证与群聊验证索引复用全局 `usePullRefresh`，只在页面顶部单指释放后触发；首次 loading 和 refreshing 均禁用重复手势。
- 两侧列表分别只调用既有 `friendApplications.list` 与 `groupApplications.list`；父层角标继续使用原 `getUnreadCount` owners，H5 不新增申请 DTO、Gateway、计数或 mutation owner。
- 列表与角标通过独立结果并行刷新：角标失败不阻断成功列表，列表失败保留旧快照并显示真实错误，不用计数成功伪造空列表。
- focused 3 files/12 tests、H5 full 98 files/308 tests、466 assets、typecheck、1151-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 在 412px 下证明好友 Tab 真实 2 条记录、群 Tab 空态、Router tab 切换、刷新占位收起、412/412 宽度，干净 reload 后 console 0 warning/error；物理触摸释放保留显式验收门。
- 本片 SDK source/generated package 零改动，`im28-phone` clean；未执行 accept/reject/mark-read 或任何 SDK/RN/Desktop build/sync，`build:package:desktop:web` 未修改或执行。

## Completed W6.a6.20.41

- H5 通话列表的删除确认层拆为独立 `CallDeleteSheet`，复用全局 `InteractionModal` 的原生 dialog top-layer、Esc、焦点、背景 inert、退出动画和 reduced-motion；页面不再持有第二套遮罩生命周期。
- 删除期间遮罩、Esc、取消和重复确认均 fail-closed；确认仍只调用既有 `WebIMCallSync.delete`，成功清理/重读和失败错误路径保持不变。
- 空列表按 RN 优先级投影搜索“暂无搜索结果”、未接“暂无未接来电”和默认“暂无通话记录”，不引入新的同步或筛选状态。
- focused 2 files/7 tests、H5 full 99 files/311 tests、466 assets、typecheck、1152-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 在 412px 下完成三类空态、编辑/完成、筛选与 TabBar 只读验收，宽度 412/412、console 0 warning/error；当前账号无通话记录，真实 modal 打开/Esc/取消保持 data-gated，未制造记录或执行删除。
- SDK source/generated package 与 `im28-phone` 零改动；未执行任何 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.42

- 通用设置退出确认拆为独立 `MeLogoutDialog`，复用全局 `InteractionModal`；精确保留 RN 标题、说明、取消与退出动作顺序。
- `InteractionModal` 增加受控 Escape 键兜底，修复部分 WebView 未稳定派发原生 `cancel` 的关闭缺口；遮罩、焦点、退出动画和 reduced-motion owner 不变。
- `signingOut` 期间遮罩、Escape、取消和重复确认全部 fail-closed；页面仍只调用既有 `runtime.signOut()`，不复制 token、WebSocket、媒体或账号数据库清理。
- focused 1 file/2 tests、H5 full 100 files/313 tests、466 assets、typecheck、1153-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 在 412px 下完成打开、Escape、遮罩、取消和 412/412 零溢出验收；路由与登录态保持，未点击最终退出。
- SDK source/generated package 与 `im28-phone` 零改动；未执行任何 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.43

- `app.css` 建立按钮 reset 单一 owner，清除浏览器 appearance、margin、padding、border、radius 和 background；键盘 `:focus-visible` 可访问性焦点保持。
- 新增 `PageNavbar + page-navbar.css`，35 个可寻址详情/选择页统一 safe-area、56px、三列、24px 图标、居中标题和左右动作；页面 class 只保留背景与业务差异。
- 主 Tab 标题、聊天复合资料头、认证品牌、媒体/来电全屏头和 Dialog/裁剪标题按 contract 排除，避免把不同语义强行同构。
- 页面切换继续复用既有 `RouteMotionController + interaction.css`：pathname 变化只动画当前 `#root main`，跳过首屏、固定 TabBar 不闪动并尊重 reduced-motion；未引入 UI/motion 库。
- focused 1 file/2 tests、H5 full 101 files/315 tests、466 assets、typecheck、1155-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 在 412px 下确认通用设置、个人资料、聊天设置使用同一 Navbar 几何；按钮 appearance none/border 0，页面显式按钮样式保留，宽度 412/412。
- SDK source/generated package 与 RN business 零改动；未执行任何 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.44

- SDK 新增 `parseIMGroupSystemMessagePresentation`，统一 core `payload`、Gateway `body.system/payload.body.system` 与 RN wrapper 的群系统消息读取；只有 `event_type + extra` 可以生成结构化文案，不信任 `system.text`。
- 群简介更新按当前账号与操作者昵称输出 RN 同款文案；发言频率按显式 enabled/seconds 输出分钟或秒，缺失事实、未知事件和坏 JSON 均 fail-closed。
- Gateway WebSocket classifier 仅补 OpenAPI 已明示的 `1521/group_description_changed -> message`；发言频率没有公开 numeric type，不猜测注册。
- H5 聊天气泡和会话列表摘要共同消费 shared presentation，删除继续演化页面级 raw `system.extra` 解析的可能；RN production caller 保持冻结。
- SDK focused 2 files/9、Web full 96 files/398 tests、全 target typecheck/boundary；H5 focused 2 files/18、full 101 files/317 tests、466 assets、1156-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 登录态 reload、账号恢复和设置路由通过，console 0 warning/error；当前缓存无可确认的 1521/频率通知，真实列表/气泡视觉与双账号 realtime 保持 natural-data gate。
- `im28-phone` clean；仅执行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web`，RN generated package 未重写。

## Completed W6.a6.20.45

- SDK `friend-added-message.ts` 统一 type1201、RN 已发布中文文案和 unknown fail-closed pure helper；既有 `initial-unread-navigation` 删除私有 1201 常量并复用 shared owner。
- H5 聊天气泡和会话摘要共同调用 `getIMFriendAddedMessageText`；聊天页固定表、列表 label 均不再保存第二份 1201 文案。
- SDK focused 2 files/6、Web full 97 files/400 tests、全 target typecheck/boundary；H5 focused 2 files/20、full 101 files/319 tests、466 assets、1157-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实 `donk二大爷` 会话摘要已从 `[contentType=1201]` 变为“你们已经成为好友，可以开始聊天了”，稳定期 reload 后 raw fallback 消失且日志条数/时间戳未增长。
- `build:web` 同步生成包期间旧标签曾产生一次 Provider HMR 顺序错误；页面自动恢复，新标签冷启动登录页零错误，登记为 dev HMR 噪声而非生产构建回归。
- `im28-phone` clean；仅执行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web`，RN generated package未重写。

## Completed W6.a6.20.46

- 普通建群选中态新增 RN 同构的搜索入口、最多五个头像预览、超出计数和一键清空；“已选好友”底部复核层支持逐人移除，失效身份 fail-closed。
- 页面复用全局 `usePullRefresh`；仅普通建群启用，刷新只调用既有 `contacts.list`，失败保留当前快照并显示真实错误。
- 创建主链保持 `CreateGroupPage -> WebIMSync.groups.create`，未新增页面 Gateway、SQLite、DTO、Repository、校验或创建状态机。
- focused 3 files/8、full 102 files/321 tests、466 assets、typecheck、1158-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实两位好友完成全选、复核、逐个移除和清空，提交按钮状态随选中数切换；412/412 无横向溢出，console 0 warning/error；物理触摸释放保留显式验收门。
- SDK source/generated package 与 `im28-phone` 均零改动；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.47

- `/contacts/groups` 复用全局 `usePullRefresh`，对齐 RN `ContactGroupListScreen` 的顶部单指下拉；搜索、长按菜单、分享/资料路由和退出确认均保持原主链。
- 刷新只调用既有 `groups.sync({ pageSize: 50 })`；成功才替换群列表，失败保留当前快照并显示真实错误，不新增页面 Gateway、SQLite、DTO、Repository 或重试状态机。
- focused 3 files/8、full 103 files/323 tests、466 assets、typecheck、1158-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实 `donk的群聊`、群主标签、无结果搜索与恢复搜索通过；412/412 无横向溢出，console 0 warning/error；物理触摸释放保留显式验收门。
- `JoinedGroupsPage.tsx` 323 行低于页面 400 行上限；无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK 或调试日志。仓库无 `scripts/check-convergence.sh`，保持已登记 gate。
- SDK source/generated package 与 `im28-phone` 本片零改动；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.48

- 邀请与移出群成员页复用全局 `usePullRefresh` 和同一个三态提示组件，对齐 RN 两个选择页的顶部下拉反馈。
- 邀请刷新只调用既有 `groups/groupMembers/contacts`，移除刷新只调用既有 `groups/groupMembers`；所有 facade 成功后才替换候选，失败保留旧快照、搜索词和选择态。
- 邀请、移除确认与提交主链保持不变；未执行真实群成员 mutation，也未新增 Gateway、SQLite、DTO、Repository 或重试状态机。
- focused 4 files/8、full 104 files/325 tests、466 assets、typecheck、1158-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实群完成邀请空态、两位可移除成员、搜索过滤和未选择禁用提交验收；412px 宽度正常，console 0 warning/error；物理触摸释放保留显式验收门。
- 两个页面分别为 282/268 行，共用提示组件 23 行且有两个生产消费者；无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK 或调试日志。
- 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.49

- 群禁言页复用全局 `usePullRefresh`，对齐 RN `GroupMuteScreen` 手动禁言列表的顶部下拉反馈；首次加载、刷新或提交期间拒绝新手势。
- 刷新只调用既有 `groups/groupMembers`；两者都成功后才替换禁言范围和成员事实，失败保留当前页面快照并显示真实错误。
- 禁言范围、时长选择、二次确认和 `groupManagement.updateMute/updateMemberMute` 主链保持不变；未执行真实禁言 mutation。
- 旧 `GroupMemberSelectionPullIndicator` 已删除，收敛为邀请、移除、禁言三个生产页面共同消费的 `GroupPullRefreshIndicator`，不持有任何数据逻辑。
- focused 3 files/8、full 104 files/326 tests、466 assets、typecheck、1158-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实群显示关闭范围和两位可禁言成员；刷新提示折叠、412/412 无横向溢出，稳定 reload 未新增 warning/error；物理触摸释放保留显式验收门。
- `GroupMutePage.tsx` 237 行、共用提示 25 行；无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK、fake-success 或调试日志。
- 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.50

- 指定群入群申请页复用全局 `usePullRefresh` 与既有 `VerificationPullIndicator`，对齐 RN `GroupApplicationListView` 的顶部下拉反馈。
- 刷新只调用既有 `groupApplications.list`；成功后才替换申请事实，失败保留当前列表和搜索词，加载、刷新或 accept/reject 期间拒绝新手势。
- 搜索、操作弹层和 `groupApplications.accept/reject` 主链保持不变；未执行真实申请 mutation，也未新增 Gateway、SQLite、DTO、Repository 或重试状态机。
- focused 4 files/11、full 105 files/328 tests、466 assets、typecheck、1158-module production build 和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实群路由完成搜索/清除、空态、折叠提示、412/412 和稳定 reload 零 warning/error 验收；当前无申请样本，物理触摸和申请操作保留显式 gate。
- `GroupApplicationsPage.tsx` 126 行、测试 20 行；提示组件有三个生产消费者，无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK、fake-success 或调试日志。
- 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.51

- 黑名单页复用全局 `usePullRefresh`，对齐 RN `ProfileScreen` 黑名单 FlatList 的顶部下拉反馈；首次加载、刷新或解除处理中拒绝新手势。
- 刷新只调用既有 `blacklist.list`；成功后才替换用户事实，失败保留当前列表和搜索词；`blacklist.remove` 解除主链保持不变。
- 七个生产页面统一消费 `components/interaction/PullRefreshIndicator`；旧验证/群页面提示组件和两套重复 CSS 已删除，不保留 compat。
- focused 6 files/16、full 106 files/330 tests、466 assets、typecheck、1158-module production build 和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实空黑名单完成搜索、无结果、清除、空态、折叠提示和 412/412 验收；稳定 reload 日志数量未增长。无列表样本，物理触摸和解除保持显式 gate。
- `MeBlacklistPage.tsx` 176 行、全局提示 23 行、测试 20 行；无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK、fake-success 或调试日志。
- 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.52

- 转发目标页复用全局 `usePullRefresh/PullRefreshIndicator`，对齐 RN 普通转发选择器的顶部下拉反馈；首次加载、刷新或目标打开期间拒绝新的下拉手势。
- 刷新继续调用既有 `loadChatForwardTargets({ sync })`，由 `conversations.sync/contacts.list/groups.sync` 三个 canonical facade 提供事实；三个请求全部成功后才替换页面快照，失败保留当前目标、Tab 和搜索词。
- 目标会话解析、React Router `location.state`、单条/多选来源和 shared forward 提交主链保持不变；未执行目标打开或真实转发 mutation。
- focused 4 files/8、full 107 files/332 tests、466 assets、typecheck、1158-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实数据完成 3 条最近会话、2 位好友、1 个群聊、搜索/清除、三 Tab、折叠提示和 412/412 验收；warning/error 为零，物理触摸释放保持显式 gate。
- `ChatForwardTargetPage.tsx` 228 行、新 contract test 22 行；无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK、fake-success 或调试日志。
- 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。
