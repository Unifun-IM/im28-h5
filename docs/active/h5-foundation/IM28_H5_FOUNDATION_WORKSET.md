# IM28 H5 Foundation Workset

## Current Workset W6 RN Parity Residual Inventory Refresh

| field | value |
| :--- | :--- |
| status | `active/inventory` |
| owner | `RN frozen reference -> H5 route/interaction/state inventory -> existing shared SDK owners` |
| target | 继续按 RN 页面、交互和状态逐项检索确定性缺口，优先选择不改 RN business 且不建立 Web 双轨的独立切片 |
| non-claim | 不把 data/authorization/browser gate 伪报为实现缺口，不以收敛为由修改 RN 业务调用 |
| verification | 每个后续切片独立冻结 contract、focused/full gates 和真实浏览器证据 |
| protected | 后续 inventory 不默认修改 SDK 或 `im28-phone`；若确认 shared 缺口，仅允许单独冻结 contract 后执行 `build:web/sync:web` |
| next | `.57` 已关闭通讯录主 Tab 申请角标缺口；重新扫描 RN/H5 route、手势、空态、modal、媒体与设置细节，选择下一项可闭环差异 |

## Latest Closed Slice W6.a6.20.57

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-owner-converged; browser-zero-state-pass/non-zero-data-gated` |
| goal | 对齐 RN 通讯录主 Tab 的好友申请未读加群申请总数角标，并让 Tab 与通讯录 shortcut 复用同一快照 |
| business owner | SDK 既有 `friendApplications/groupApplications` read facades 继续唯一提供计数事实；无新增 Gateway、SQLite、DTO 或 mutation |
| H5 owner | `PrimaryTabsLayout -> useVerificationUnreadCounts -> PrimaryTabBadgeProvider` 持有主 Tab 生命周期；TabBar 与 ContactsPage 只消费同一状态/刷新端口 |
| freshness | 首次恢复与进入通讯录刷新；同 runtime/账号并发合并；账号切换拒绝旧结果回写 |
| delete | 删除四 Tab 全部迁移后遗留的 nullable href、disabled button 和禁用 CSS 分支，不保留 compat |
| verification floor | focused 3 files/7、full 111 files/344 tests、typecheck、1165-module build、diff check；真实四 Tab 路由与零值隐藏 proof |
| protected | 本片未修改 SDK、generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 owner、可独立验证且不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.56

| field | value |
| :--- | :--- |
| status | `done-local/clean; compatibility-only; browser-readonly-pass` |
| goal | 让已发布/历史浏览器中的旧转发 URL 安全回到当前聊天内唯一目标选择器，不恢复第二页面 |
| primary owner | `ChatPage -> ChatTargetPickerModal` 继续是唯一选择 UI；shared SDK 转发 facade 保持唯一业务 owner |
| compatibility | `ChatForwardCompatibilityRedirect` 只做 replace；仅转交同路由会话、1–100 个稳定 client ID，并在聊天页复核后清除 state |
| delete/register | 登记旧 route 为 compatibility-only；无旧页面/CSS/source/mutation；历史深链不再支持时可删除该 route 和 redirect |
| verification floor | focused 1 file/4、full 110 files/341 tests、typecheck、1165-module build、diff check；旧 URL/reload/back/零日志 browser proof |
| protected | 本片未修改 SDK、generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续从 RN 页面/动作/状态清单选择不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.55

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-only; cold-frame-timing-gated` |
| goal | 用 RN 固定几何、头像差异、尾巴和 shimmer 替换 H5 自创的交替消息骨架 |
| business owner | 既有 ChatPage/SDK history、cache 和 loading 主链不变；本片不新增业务 owner |
| H5 owner | `ChatMessageSkeleton.tsx + chat-message-skeleton.css` 唯一持有加载视觉；`ChatMessageList` 只组合 loading/empty/isGroup |
| delete | 删除旧内联 `ChatMessageSkeleton` 与 4 条 peer/mine pulse bar CSS，不保留 compat |
| verification floor | focused 1 file/3、full 110 files/339 tests、466 assets、typecheck、1164-module build、diff check；真实短群聊 bottom geometry/稳定 reload |
| browser gate | 第二账号真实路由和短列表贴底通过；本地 cache 命中过快，无法稳定捕获自然骨架帧，视觉瞬态保持 timing gate |
| protected | `im28-phone` clean；本片不改 SDK source；只执行 Web build/sync，不执行 RN/Desktop/build:all/`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续从 RN 页面/动作/状态清单选择不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.54

| field | value |
| :--- | :--- |
| status | `done-local/clean; shared-core-ready/web-consumed/rn-frozen; mutation-gated` |
| goal | 删除好友/群聊目标选择双轨，统一单选/多选/ALL 弹窗，并使短消息列表贴底 |
| business owner | SDK `messages.forwardToTargets` 与 `messageBroadcast.sendCard/sendImage` 唯一持有多目标、batch、partial result 和 cache 收敛 |
| H5 owner | `ChatTargetPickerModal` 唯一持有 modal/search/tab/selection；聊天转发直接在当前 ChatPage 打开；route shells 只恢复来源 |
| delete | 删除独立转发目标页/route/CSS；二维码、群发、用户/群名片不再复制选择器 DOM |
| verification floor | SDK focused 3/13 + all-runtime boundary/typecheck；H5 full 109/337、typecheck、1161-module build；登录态弹窗与短列表 browser proof |
| browser gate | 已证明跨 Tab ALL、多选计数、当前聊天 URL 不变和短列表底对齐；未点击最终发送，真实 partial/list-back 保持授权门 |
| protected | `im28-phone` clean；仅 `build:web/sync:web`；未执行 RN/Desktop/build:all 或 `build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续从 RN 页面/动作/状态清单选择不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.53

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-owner-converged; physical-touch-gated` |
| goal | 删除页面级下拉刷新三态展示双轨，让全部生产消费者复用同一全局组件 |
| business owner | 20 个页面原有 refresh callback 和 shared SDK facades 完全保持，不新增 transport/cache/mutation owner |
| H5 owner | `usePullRefresh` 唯一持有触摸翻译；`PullRefreshIndicator` 唯一持有三态 DOM/CSS；页面只组合两者 |
| delete | 10 份手写 DOM 与 9 个 CSS 文件中的 `rn-*-pull` 选择器全部删除，不保留 compat |
| verification floor | focused 5 files/10、full 108 files/334 tests、466 assets、typecheck、1158-module build、diff check、20/20 consumer contract |
| browser gate | 5176 通话、会话、搜索、真实群成员四路由均为折叠全局提示、旧 class 0、数据正常和零 warning/error；物理触摸释放保持显式 gate |
| not authorized | 任何真实 mutation；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.52

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-gated` |
| goal | 对齐 RN 普通转发目标列表 `RefreshControl`，保持三 Tab、搜索、目标打开和转发提交主链不变 |
| business owner | `loadChatForwardTargets -> WebIMSync.conversations/contacts/groups` 继续唯一持有三类目标 cache-first/远端刷新事实 |
| H5 owner | `ChatForwardTargetPage` 只复用全局 `usePullRefresh/PullRefreshIndicator`；全部刷新成功后才替换当前快照 |
| verification floor | focused 4 files/8、full 107 files/332 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实 3/2/1 三类目标、搜索/清除、三 Tab、折叠提示、412/412 和零 warning/error 通过；物理触摸释放保持显式 gate |
| not authorized | 打开真实目标、提交转发；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.51

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/empty-data-and-physical-touch-gated` |
| goal | 对齐 RN 黑名单列表下拉刷新，并删除验证/群页面两套重复提示 owner |
| business owner | `WebIMSync.blacklist.list/remove` 继续唯一持有黑名单事实与解除 mutation；页面无 transport/cache owner |
| H5 owner | `MeBlacklistPage` 只复用全局 `usePullRefresh`；`PullRefreshIndicator` 为七个页面共用的纯展示组件 |
| delete | 删除 `VerificationPullIndicator`、`GroupPullRefreshIndicator` 及重复 CSS，不保留 compat |
| verification floor | focused 6 files/16、full 106 files/330 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 空列表、搜索/清除、空态、412/412 和稳定 reload 通过；无黑名单样本、物理触摸和真实解除保持显式 gate |
| not authorized | 解除真实黑名单；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.50

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-and-action-data-gated` |
| goal | 对齐 RN 指定群入群申请列表 `RefreshControl`，保持搜索、申请操作和 accept/reject 主链不变 |
| business owner | `WebIMSync.groupApplications.list/accept/reject` 继续唯一持有申请事实与 mutation；页面无 transport/cache owner |
| H5 owner | `GroupApplicationsPage` 只复用全局 `usePullRefresh` 和既有 `VerificationPullIndicator`；成功才替换列表，失败保留旧快照与搜索词 |
| verification floor | focused 4 files/11、full 105 files/328 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实群路由、搜索/清除、空态、412/412 和稳定 reload 零 warning/error 通过；物理触摸与申请操作保持显式 gate |
| not authorized | 接受或拒绝真实申请；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.49

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-gated` |
| goal | 对齐 RN 群禁言手动成员列表 `RefreshControl`，保持禁言范围、成员动作和 mutation 主链不变 |
| business owner | `WebIMSync.groups/groupMembers` 继续持有刷新事实；`WebIMSync.groupManagement` 继续唯一持有禁言 mutation |
| H5 owner | `GroupMutePage` 只复用全局 `usePullRefresh`；`GroupPullRefreshIndicator` 为邀请、移除、禁言三个群页面共用的纯展示组件 |
| verification floor | focused 3 files/8、full 104 files/326 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实关闭范围、两位可禁言成员、412/412 和稳定 reload 零新增 warning/error 通过；物理触摸释放保持显式 gate |
| not authorized | 开启/关闭群禁言、成员禁言或解除；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.48

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-gated` |
| goal | 对齐 RN 邀请群成员与移出群成员选择页 `RefreshControl`，保持搜索、选择和 mutation 主链不变 |
| business owner | 邀请继续消费 `WebIMSync.groups/groupMembers/contacts`；移除继续消费 `WebIMSync.groups/groupMembers`；页面无 transport/cache owner |
| H5 owner | 两页只复用全局 `usePullRefresh` 和共用三态提示；全部同步成功后才替换候选，失败保留旧快照与选择 |
| verification floor | focused 4 files/8、full 104 files/325 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实邀请空态、移除两位成员、搜索过滤、禁用提交、412px 与零 warning/error 通过；物理触摸释放保持显式 gate |
| not authorized | 邀请或移除真实成员；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.47

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-gated` |
| goal | 对齐 RN 我的群聊列表 `RefreshControl`，同时保持搜索、长按动作和群生命周期主链不变 |
| business owner | 既有 `WebIMSync.groups.sync` 继续唯一持有 Gateway 全分页与 SQLite 快照替换；页面无 transport/cache owner |
| H5 owner | `JoinedGroupsPage` 只复用全局 `usePullRefresh`，失败保留旧列表并显示真实错误 |
| verification floor | focused 3 files/8、full 103 files/323 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实群、群主标签、无结果/恢复搜索、412/412 和零 warning/error 通过；物理触摸释放保持显式 gate |
| not authorized | 退群、转让、分享或资料 mutation；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.46

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-gated` |
| goal | 对齐 RN 普通建群的已选好友复核、清空/逐个移除和页面下拉刷新 |
| business owner | 继续复用既有 `WebIMSync.groups.create` 与 `WebIMSync.contacts.list`；未新增 Gateway、SQLite、DTO、Repository 或创建状态机 |
| H5 owner | `CreateGroupSelectedFriends` 只投影选中预览与全局 `InteractionModal`；页面复用 `usePullRefresh`，失败保留旧联系人快照 |
| verification floor | focused 3 files/8、full 102 files/321 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实两位好友完成全选、复核、逐个移除和清空；提交态正确，412/412、console 0；物理触摸释放保持显式 gate |
| not authorized | 创建真实群、修改 SDK/RN business、SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、无需修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.45

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-real-data-pass` |
| goal | 对齐 RN type1201 好友关系通知在聊天页、会话摘要和初始未读边界中的固定身份与文案 |
| shared owner | SDK `modules/message/friend-added-message.ts` 持有类型、文案和 pure helper；未读边界复用同一常量 |
| H5 consumers | 聊天气泡与会话摘要共同消费 shared helper，不保留页面级 1201 硬编码 |
| verification floor | SDK focused 2 files/6、Web full 97/400、全 target typecheck/boundary；H5 focused 2/20、full 101/319、466 assets、1157-module build |
| browser gate | 5176 真实会话摘要由 raw `[contentType=1201]` 修复为 RN 文案；稳定期 reload 无新增日志 |
| not authorized | RN business/generated package、RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.21

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass` |
| goal | 对齐 RN 群设置首屏预览成员在线绿点，不建立设置页专属 presence 分支 |
| shared owner | 既有 `isIMNormalGroupMode` 与 `createIMUserPresenceSync/WebIMSync.presence` 保持唯一业务 owner |
| H5 owner | `ChatSettingsPage` 只选择预览身份；`useGroupMemberPresence` 持有唯一页面内存 observation；CSS 投影 14/8px 绿点 |
| verification floor | H5 focused 2/13、full Web 88/368、466 assets、runtime boundary、SDK/H5 typecheck、1119-module build、真实普通群响应式 smoke |
| browser gate | 真实 3 人预览中 2 人在线，412px/390x844 零 overflow/console error；large 群和实时切换仍 sample-gated |
| not authorized | SDK/RN business、群/成员 mutation、RN/desktop builds、build:all、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择可复用 shared owner、真实 API/样本齐备且不改 RN business 的独立缺口。

## Latest Closed Slice W6.a6.20.20

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass` |
| goal | 对齐 RN 普通群成员列表的在线绿点，并消除页面群模式判断双轨 |
| shared owner | `normalizeIMGroupMode/isIMNormalGroupMode` 持有群模式；既有 `createIMUserPresenceSync` 持有 HTTP/realtime/lifecycle |
| H5 owner | `useGroupMemberPresence` 只持有页面内存映射；`GroupMemberRow` 只投影 14/8px 在线绿点 |
| verification floor | SDK focused 3/16、H5 view 1/4、full Web 88/368、466 assets、SDK/H5 typecheck、1119-module build、真实 3 人普通群响应式 smoke |
| browser gate | 真实普通群显示 1 个在线成员，412px/390x844 零 overflow/页面错误；large 群和实时状态切换仍 sample-gated |
| not authorized | RN business/caller、群/成员 mutation、RN/desktop builds、build:all、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有真实 API/样本且不修改 RN business 的独立缺口。

## Latest Closed Slice W6.a6.20.19

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass` |
| goal | 对齐 RN 好友资料页在线/离线状态，同时把 HTTP/realtime/lifecycle 语义放入 shared SDK |
| business owner | `createIMUserPresenceSync` 持有 OpenAPI 分批、状态归一化、revision 和账号生命周期；presence 不写 SQLite |
| H5 owner | `useContactProfilePresence` 只连接当前好友与 runtime；navbar view 只投影黑名单/presence 优先级 |
| verification floor | SDK focused 2 files/7 tests、full Web 87 files/366 tests、SDK/H5 typecheck、H5 view 1/7、466 assets、1115-module build、真实好友资料响应式只读 smoke |
| browser gate | 当前好友真实显示在线且无 overflow/console error；离线转换、重连和第二账号事件仍需样本 |
| not authorized | RN business/caller 改动、资料 mutation、RN/desktop builds、build:all、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续区分真实功能缺口与仅缺授权/样本的 acceptance gate。

## Latest Closed Slice W6.a6.20.18

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/link-data-gated` |
| goal | 将文本链接“打开/复制”从气泡内绝对定位菜单收敛到普通消息已验证的全局 top-layer，消除聊天动作展示双轨 |
| business owner | 链接解析仍由 shared SDK 持有；浏览器打开端口、clipboard success-only 回调和普通消息动作回调均保持不变 |
| H5 owner | `ChatActionModalSurface` 唯一持有 body portal/InteractionModal/锚点定位；普通消息与链接分别只提供自己的预览和动作项 |
| verification floor | focused H5 5 files/16 tests；full verify：466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1114-module build；412px authenticated ordinary-message regression pass |
| browser gate | 普通消息共用层、关闭、路由稳定、零横向溢出已证；真实 cache 无链接消息，链接 top-layer 视觉保持 data-gated，未发送测试消息 |
| not authorized | 打开外链、复制、编辑、转发、删除或消息发送 mutation；修改 RN business/caller；RN/desktop builds；`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续区分真实功能缺口与只缺授权/样本的 acceptance gate。

## Latest Closed Slice W6.a6.20.17

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass` |
| goal | 将普通消息长按从气泡内绝对定位菜单对齐为 RN 全屏遮罩、原消息预览和纵向动作 modal |
| business owner | 引用/复制/编辑/多选/转发/添加表情/删除继续调用既有 H5 -> shared SDK 主链；本片不新增业务 owner |
| H5 owner | `ChatMessageAction` 持有 `500ms/8px` gesture；`ChatMessageActionModal` 通过 body portal/InteractionModal 呈现；纯 layout helper 持有收发靠边与 viewport clamp |
| verification floor | focused H5 4 files/13 tests；full verify：466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1113-module build |
| browser gate | 当前已登录 412px 页面右键打开真实 modal：发出消息靠右、200px/6 动作、只有删除为危险色；遮罩关闭后 dialog 清除、URL 不变、零横向溢出；触屏实机仍 gated |
| not authorized | 任何消息发送/复制/编辑/转发/删除 mutation、修改 RN business/caller、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续区分真实功能缺口与只缺授权/样本的 acceptance gate。

## Latest Closed Slice W6.a6.20.16

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-link-data-gated` |
| goal | 对齐 RN 文本消息链接点击，以及长按/右键仅显示“打开/复制” |
| shared owner | SDK `splitIMMessageTextLinks/normalizeIMMessageLinkURL` 唯一持有 HTTP(S)/www 边界、尾随标点与 www->HTTPS；RN caller 冻结 |
| H5 owner | `PresetEmojiTextContent` 消费 shared 片段；`ChatMessageLinkAction` 只持有 500ms 手势/菜单；browser adapter 与已有 clipboard owner 执行真实 I/O |
| verification floor | focused SDK 1 file/3 tests、H5 3 files/10 tests；full verify：466 assets、boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1111-module build；已登录 412px 群聊页无溢出/console error，但真实 cache 无链接消息 |
| not authorized | 发送测试链接消息、修改 RN business/caller、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，跳过已完成但仍 acceptance-gated 的能力。

## Previous Closed Slice W6.a6.20.15

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-empty-data-gated` |
| goal | 将 RN 我的群聊行长按菜单接到既有群名片、群资料和 shared lifecycle 主链 |
| shared owner | `WebIMJoinedGroup.permissions` 决定动作；`conversations.openGroup` 解析 canonical Conversation；`groupLifecycle.leave(clearHistory)` 唯一持有普通退群业务；群主先进入 shared 群主转让 route |
| H5 owner | `JoinedGroupRow` 持有 `300ms/8px` 手势；`JoinedGroupActionMenu` 持有气泡与确认展示；`JoinedGroupsPage` 只编排 SPA route/shared facade；群资料 `?edit=name` 复用既有 editor |
| verification floor | focused 3 files/10 tests；final full verify：466 assets、SDK runtime boundary、SDK/H5 typecheck、SDK Web 85 files/357 tests、1106-module build；已登录浏览器群列表为空，交互视觉 data-gated |
| not authorized | 制造群数据、真实分享/改名/退群/转让 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，跳过已完成但仍 acceptance-gated 的能力。

## Previous Closed Slice W6.a6.20.14

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-login-lock/data-gated` |
| goal | 将 RN 群主转让从管理页 modal 对齐为独立 React Router SPA route |
| shared owner | SDK `group-admin-owner.ts`/`WebIMSync.groupMembers.transferOwner` 唯一持有权限、候选、exactly-once 与角色缓存事务；H5 只消费 |
| H5 owner | `GroupOwnerTransferPage` 持有搜索、角色/拼音分组、下拉刷新、选择和确认；管理员与群主页面共用 cache-first route data hook；旧管理页转让 modal 已删除 |
| verification floor | H5 focused 3 files/10 tests；final full verify：SDK Web 85 files/357 tests、466 assets、boundary、SDK/H5 typecheck、1102-module build；浏览器登录按真实 SQLite 多标签互斥锁失败；RN protected worktree clean |
| not authorized | 制造群数据、真实群主转让 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，跳过已完成但仍 acceptance-gated 的能力。

## Previous Closed Slice W6.a6.20.13

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/data-gated` |
| goal | 将 RN 群管理员列表与添加候选从管理页 modal 对齐为独立 React Router SPA route |
| shared owner | SDK `group-admin-owner.ts` 唯一持有权限、候选、公开上限、set/cancel exactly-once 与角色缓存事务；H5 只消费 |
| H5 owner | `GroupAdminsPage` 持有列表/移除确认，`GroupAddAdminsPage` 持有搜索/选择 UI，共用一个 cache-first route data hook；旧管理页管理员 modal 已删除 |
| verification floor | SDK focused 5/5、H5 focused 4/4；final full verify：SDK Web 85 files/357 tests、466 assets、boundary、SDK/H5 typecheck、1099-module build；412px missing-group fail-closed/zero-overflow；RN protected worktree clean |
| not authorized | 制造群数据、真实管理员 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

## Previous Closed Slice W6.a6.20.12

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass` |
| goal | 对齐 RN AppSearchBox 默认清除控件，并在清除结果状态后保持输入焦点 |
| shared owner | SDK 继续持有缓存与搜索查询；本片无 SDK capability 变更 |
| H5 owner | 独立 input 组件只翻译 input/Enter/clear；页面统一复位 request generation、结果、分页与错误态 |
| verification floor | focused H5 2 files/7 tests；final full verify：SDK Web 85 files/356 tests、466 assets、boundary、SDK/H5 typecheck、1092-module build；412px authenticated clear/focus/history/zero-overflow；RN protected worktree clean |
| not authorized | 任何 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，跳过已完成但仍 acceptance-gated 的能力。

## Previous Closed Slice W6.a6.20.11

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/data-gated` |
| goal | 对齐 RN 首页搜索好友/群聊结果的关键词高亮，并保持聊天记录汇总行原有无高亮分支 |
| shared owner | SDK 继续持有缓存实体与搜索结果；本片 SDK 零源码改动 |
| H5 owner | helper 只按 RN 规则切分展示文本；结果行仅翻译为语义标签与品牌色，不新增查询或业务 owner |
| verification floor | focused H5 5/5；full verify：SDK Web 85 files/356 tests、466 assets、boundary、SDK/H5 typecheck、1091-module build；412px authenticated friend-highlight/message-no-highlight/zero-overflow；RN protected worktree clean |
| not authorized | 制造群搜索数据、任何 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择可真实只读证明或有明确 mutation 授权边界的缺口。

## Previous Closed Slice W6.a6.20.10

| field | value |
| :--- | :--- |
| status | `done-local/converged-owner-consumed; browser-readonly-pass/data-gated` |
| goal | 对齐 RN 首页全局搜索的 8 条消息分页、过期请求隔离和结果下拉重读，同时保持 shared search 单一 owner |
| shared owner | SDK `messages.searchCached({ keyword, limit, offset })` 继续持有当前账号、查询校验、可见正文过滤和 SQLite 结果分页；本轮 SDK 零源码改动 |
| H5 owner | 页面只持有 request generation、分页 UI、下拉手势和历史 preference；helper 只持有好友/群/消息 view projection 与跨页会话合并 |
| verification floor | focused H5 4/4；full verify：SDK Web 85 files/356 tests、466 assets、boundary、SDK/H5 typecheck、1091-module build；412px authenticated history/friend/message/zero-overflow；RN protected worktree clean |
| not authorized | 制造消息/群数据、发送或远端刷新 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择可真实只读证明或有明确 mutation 授权边界的缺口。

## Previous Closed Slice W6.a6.20.9

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass/data-gated` |
| goal | 让所有“已知群 ID 进入聊天”入口通过同一个 SDK owner 获取、校验并缓存规范群会话 |
| shared owner | `openIMGroupConversation` 持有 cache-first、真实 conversation ID 获取、Gateway identity fail-closed、latest/conversation 缓存事务与账号切换保护 |
| H5 owner | 我的群聊、共同群聊、查找群聊只持有 opening/error/React Router；不扫描会话列表、不猜 `sg_` ID、不映射 Gateway DTO |
| verification floor | SDK focused sql.js 4/4；full verify：SDK Web 85 files/356 tests、466 assets、boundary、SDK/H5 typecheck、1091-module build；browser 空态/console 证据；RN protected worktree clean |
| not authorized | 制造群数据、执行群申请/创建/发送 mutation、RN consumer convergence、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择可真实只读证明或有明确 mutation 授权边界的缺口。

## Earlier Closed Slice W6.a6.20.8

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass/mutation-acceptance-gated` |
| goal | 对齐 RN 通讯录与验证消息的好友未读、群待审核角标和单条好友申请已读资料链 |
| shared owner | friend application facade 持有专用 unread、明确 IDs mark-read 与 fail-closed；group application facade 持有审核 `total` 语义 |
| H5 owner | 共用 hook 只编排两个 facade；通讯录/双 tab 复用 `0/99+` badge；好友行只持有资料路由和 success-triggered refresh |
| verification floor | SDK focused 2 files/15 tests；H5 focused 1/1；full verify：SDK Web 84 files/352 tests、466 assets、SDK/H5 typecheck、1091-module build；412px authenticated friend/group route、zero-overflow/console；RN protected worktree clean |
| not authorized | 点击真实申请、mark-read/accept/reject、非零群审核样本制造、RN consumer convergence、RN/desktop builds |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择可真实只读证明或有明确 mutation 授权边界的缺口。

## Earlier Closed Slice W6.a6.20.7

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass/mutation-acceptance-gated` |
| goal | 补齐 RN 个人资料头像编辑，同时保持个人资料与 onboarding 不同提交时序并收敛 H5 平台交互 owner |
| shared owner | `WebIMSync.profile.updateAvatar` 原子统一静态图片/10MB、Web OSS、上传阶段账号保护、avatar-only profile update 与响应身份；`uploadAvatar` 仅服务 onboarding 内存草稿 |
| H5 owner | `/me/profile` 只持有头像行、共用相册/拍照来源 sheet、文件 input、共享 Canvas crop 和 success-only 展示；不编排 Gateway 或 blob URL 成功态 |
| verification floor | SDK focused 1 file/8 tests；H5 focused 3 files/5 tests；full verify：SDK Web 84 files/349 tests、466 assets、SDK/H5 typecheck、1089-module build；boundary/diff-check；412px authenticated open/cancel；RN protected worktree clean |
| not authorized | 真实文件选择、OSS/profile mutation、刷新/第二终端回读、RN consumer convergence、RN/desktop build scripts |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择可真实只读证明或有明确 mutation 授权边界的缺口。

## Previous Closed Slice W6.a6.20.6

Onboarding 头像已完成 shared 上传 owner、共用来源/裁剪与内存草稿时序；有效新账号、真实上传/update 和响应式矩阵保持 acceptance-gated。

## Earlier Closed Slice W6.a6.20.5

群服务端搜索已完成 shared 三态 owner、独立 `/groups/search` route 和真实账号空态验收；真实可加入结果、申请与加入后 list-back 保持 data-gated。

## Earlier Closed Slice W6.a6.20.4

- shared owner:
  - `../im28-sdk/src/modules/message/composer-submission.ts` 只持有平台中立事实：有草稿且单选媒体时进入待发送态，编辑消息不得附带附件，一次提交按 `media -> file -> text` 排序。
  - H5 `useChatOutgoingMessageActions.sendSubmission` 在一个 `runMessageOperation` 内消费计划并复用现有 image/video/file/text/mention/quote facade；前序 reject 会阻断后续步骤。
- Web presentation:
  - `useChatComposerAttachments` 只持有浏览器 File input、校验和瞬时 pending state；普通文件始终等待显式发送，单媒体仅按 shared 判定等待。
  - `ChatComposerPendingFile` 复刻 RN 文件栏的名称、类别、大小与移除动作；`ChatComposerAttachmentControls` 集中附件面板和三个浏览器 input；媒体不新增 RN 不存在的顶部缩略图。
- evidence:
  - SDK focused `3/3`；H5 focused `3 files/10 tests`；`npm run verify` 通过 `84 files/343 tests + 466 assets + typecheck + 1081 modules`。
  - 412x820 真实单聊只选择仓库内测试文件：pending/移除/按钮门禁/零溢出/零 console error 均通过；未点击发送。
  - `im28-phone/src/**` 零改动；未运行 RN build/sync，未修改 desktop build scripts。
- residual:
  - 真实普通文件上传、带草稿单媒体组合发送、失败阻断及第二账号 realtime/list-back 仍需独立授权验收。

## Previous Closed Slice W6.a6.20.3

| field | value |
| :--- | :--- |
| status | `done-local/shared-owner-consumed` |
| goal | 补齐 RN 聊天附件“拍照/音视频通话”，保持相册、拍照、RTC、文件、名片顺序，不建立 Web-only 图片或通话业务链 |
| camera owner | H5 浏览器 input 只持有 `capture=environment` platform I/O；选择结果进入既有 album MIME/size 校验与 `messages.sendImage` owner |
| RTC owner | `CallTypeActionSheet` 是联系人/聊天共享纯 UI；ChatPage 只传 canonical conversation 展示快照并调用唯一 `WebIMCallProvider`，鉴权/信令/LiveKit 继续由 SDK/Web platform owner 持有 |
| visibility | RTC 只在 `Conversation.type=single` 显示，群聊 fail-closed 隐藏；拍照对单聊/群聊均可用 |
| verification floor | H5 focused 3 files/10 tests、typecheck；full verify：SDK Web 83 files/340 tests、466 assets、1078-module build；412x820 authenticated action order/sheet/camera-contract/zero-overflow/zero-console；RN worktree clean |
| not authorized | camera chooser/permission、真实图片上传发送、语音/视频 final selection、Gateway call、LiveKit room、second-account RTC、RN 业务修改 |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择真实 API/平台能力齐备且无副作用的下一条缺口。

## Previous Closed Slice W6.a6.20.2

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 补齐 RN 聊天附件“名片”：用户/群选择、当前会话 type108 发送和失败重试，不复用语义不同的联系人跨会话分享 API |
| shared owner | SDK `message-card-send.ts` 校验 user/group card、冻结展示快照并复用统一 `sending -> sent/failed`、Gateway、SQLite 状态机；type108 可从持久化 payload 重试 |
| H5 owner | `ChatCardPickerDialog` 复用好友/群 cache-first source，单聊排除本人和当前对端；`ChatPage` 只调用 `sync.messages.sendCard` 并重读当前会话 cache |
| compatibility | 隐藏发送人转发继续拒绝 type108，失败重试支持矩阵与转发支持矩阵显式解耦；RN 现有 `sendCardMessage` 路径冻结不改 |
| verification floor | SDK focused 3 files/11 tests、Web full 83 files/340 tests；H5 focused 2 files/5 tests、466 assets/typecheck/1074-module build；412px authenticated user/group/search/select/disabled/zero-overflow proof；RN worktree clean |
| not authorized | 最终发送点击、第二账号 realtime/list-back、真实失败重试、拍照/RTC 附件入口、RN consumer convergence |

该 residual 已由 `.20.3-chat-composer-camera-rtc-entries` 关闭；`.20.4` 继续关闭附件待发送/组合提交偏差，下一片继续全局 RN parity inventory。

## Previous Closed Slice W6.a6.20.1

| field | value |
| :--- | :--- |
| status | `done-local/rn-parity` |
| goal | 修复账号登录“忘记密码”用错误文案代替 RN 交互的问题；Gateway 端点已下线时只提供手机号/邮箱替代登录和客服说明 |
| owner | H5 `ForgotPasswordMethodsDialog` 复用全局 `InteractionModal`；手机号/邮箱使用既有 `/auth/phone`、`/auth/email` 路由，SDK 无新增 API |
| platform boundary | RN 网络设置依赖原生 HTTP/OpenIM HTTP/SOCKS proxy；浏览器 `fetch/WebSocket` 无等价 per-app proxy 注入，登记 `web-not-applicable`，禁止创建保存后不生效的假设置 |
| verification floor | H5 focused 2 files/6 tests + full verify：SDK Web 82 files/337 tests、466 assets/typecheck/1071-module build；412px phone/email/support branches、modal replacement、route cleanup、zero overflow；退出后已恢复 donk 当前账号 |
| not authorized | 忘记密码 API、客服请求、密码修改、验证码请求、浏览器代理注入、RN 业务修改 |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN 页面入口、交互、状态和真实 API 对照，优先处理仍缺失且 Web 有真实等价能力的下一项。

## Previous Closed Slice W6.a6.18.3.19

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 对齐 RN 二维码“发送给好友/群”语义，统一个人/群二维码的应用内图片分享，不用 Web Share 替代业务动作 |
| shared owner | 既有 `WebIMSync.contacts/groups/conversations/peerProfile/messages.sendImage`；SDK 无新增业务路径 |
| H5 owner | `forward-target-source` 统一普通转发与二维码分享的 cache-first 目标加载、投影和真实会话解析；`QRCodeSharePage` 只保留 React Router、单选 UI 与显式确认 |
| route/data contract | `/me/qrcode/share`、`/conversations/:conversationID/settings/qrcode/share`；路由仅携带稳定来源 ID，确认后从 shared payload 生成 320x320 PNG，不跨路由携带 Blob/消息正文/凭据 |
| verification floor | H5 focused 6 files/13 tests + full verify：SDK Web 82 files/337 tests、466 assets/typecheck/1070-module build；412px authenticated friend/group tabs、single-select、disabled gate、safe return、zero overflow；RN source zero change |
| not authorized | 最终“分享”点击、真实 PNG 上传/消息发送、第二账号 realtime/list-back、RN consumer convergence |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；重新按 RN 页面入口、交互、状态和真实 API 检索未迁移功能，优先选择不修改 RN 业务且可独立验收的下一条垂直切片。

## Previous Closed Slice W6.a6.18.3.18

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 从 RN 群资料层级补齐群二维码 SPA 展示，并将个人/群 Canvas、PNG 下载和 Web Share 收敛为同一 H5 platform owner |
| shared owner | `../im28-sdk/src/modules/qr-code/buildIM28GroupQRCodePayload` + 既有 `WebIMSync.conversations/groups` |
| production consumer | `/conversations/:conversationID/settings/profile` -> `/settings/qrcode`；`/scan` 可严格返回同一群二维码 route |
| platform owner | `QRCodeDisplay` + `browser-qr-image`；用户/群共用高纠错 Canvas、头像 fallback、导出/分享和 async cleanup |
| verification floor | H5 focused 5 files/13 tests + full verify：SDK Web 82 files/337 tests、466 assets/typecheck/1067-module build；412px personal QR zero-overflow + missing-group fail-visible；RN source zero change |
| data gate | 当前认证账号会话列表只有两条单聊且“我的群聊”为空；历史群深链已失效，真实群卡片/二维码视觉未伪造 |
| not authorized | 实际下载/Web Share、应用内图片消息发送、物理扫码、群申请/群 mutation、RN consumer convergence |

Next bounded slice: `W6.a6.18.3.19-qrcode-in-app-share`；已由上方 latest slice 关闭。

## Previous Closed Slice W6.a6.18.3.17

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 复用 shared 用户二维码 payload，在 H5 交付 RN 对应的个人二维码展示、PNG 下载与浏览器文件分享，页面不复制二维码协议 |
| shared owner | `../im28-sdk/src/modules/qr-code/buildIM28UserQRCodePayload` + `WebIMSync.profile.getCurrent` |
| production consumer | `/me`、`/me/profile`、`/scan` -> `/me/qrcode`；React Router state 只保存白名单返回来源 |
| platform owner | H5 `qrcode` Canvas renderer；高纠错等级、居中头像 fallback、同一 Canvas PNG 下载/Web Share、unsupported fail-visible |
| verification floor | H5 focused 5/5 + full verify：SDK Web 82 files/337 tests、466 assets/typecheck/1064-module build；412x786/1280x800 authenticated zero-overflow；RN source zero change |
| not authorized | 实际下载/系统分享弹窗、物理相机/相册识别、好友/群申请 mutation、RN consumer convergence |

Next bounded slice: `W6.a6.18.3.18-group-qrcode-display`；复用 shared group payload 与现有群详情/cache owner，从群设置补齐只读群二维码展示，不执行分享、申请或群 mutation。

## Previous Closed Slice W6.a6.18.3.16

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | IM28 二维码协议归 shared SDK；H5 用浏览器 adapter 承担解码/权限/cleanup，并接入既有用户资料和真实公开群申请链 |
| shared owner | `../im28-sdk/src/modules/qr-code` + `GatewayHTTPClient.getPublicGroup` + `WebIMSync.groupApplications.getPublicGroup/apply` |
| production consumer | 首页 `HomeActionMenu -> /scan`；用户码 -> `/contacts/users/:userID`；群码 -> `/groups/:groupID/apply` |
| verification floor | SDK focused 9/9 + Web 82 files/337 tests + build:web/sync:web；H5 focused 7/7 + typecheck/1031-module build；412x786 no-permission readonly；RN source zero change |
| not authorized | physical camera permission、album chooser、real QR decode、friend/group mutation、second-account list-back、RN consumer convergence |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；按 RN 页面/入口/状态/真实 API 重新检索 H5 遗漏，选择下一条非破坏性垂直切片。

## Previous Closed Slice W6.a6.18.3.15.2

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 语音群发复用普通音频 prepared owner 与 H5 现有 MediaRecorder/按住说话 owner，不建立第二套录音或 body 逻辑 |
| shared owner | `../im28-sdk/src/sync/message-audio-send.ts` + `message-broadcast*.ts` + `WebIMSync.messageBroadcast.sendAudio` |
| production consumer | `/broadcast/compose` -> `useChatVoiceRecorder` -> `ChatVoiceInput` -> `sendAudio` |
| verification floor | SDK focused 9/9 + full 82 files/335 tests + build:web/sync:web；H5 recorder 6/6 + 466 assets/typecheck/797-module build；412x786 mode toggle；RN source zero change |
| not authorized | microphone permission、record/upload/send、second-account realtime/list-back、RN business convergence |

Next bounded slice: `W6.a6.18.3.16-qr-scanner-platform-contract`；冻结浏览器 HTTPS/camera permission/decoder/route payload 与 cleanup，先不请求摄像头权限。

## Previous Closed Slice W6.a6.18.3.15.1

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 图片/视频/文件群发复用普通消息媒体 owner，整批只上传一次并只 batch-send 一次，H5 只保留浏览器 I/O 和结果 UI |
| shared owner | `../im28-sdk/src/sync/message-broadcast*.ts` + `prepareWebIMImage/Video/FileUpload` + `WebIMSync.messageBroadcast` |
| production consumer | `/broadcast/compose` -> `sendImage/sendVideo/sendFile`；页面复用聊天 attachment/video metadata helper |
| verification floor | SDK focused 6/6 + full 82 files/334 tests + build:web/sync:web；H5 helper 8/8 + 466 assets/typecheck/796-module build；412x786 authenticated media actions、zero overflow/console；RN source zero change |
| not authorized | final file selection/upload/send、second-account realtime/list-back、RN business convergence |

Next bounded slice: `W6.a6.18.3.15.2-message-broadcast-voice`；复用 shared audio upload/body owner，Web 只实现 MediaRecorder/按住说话与临时预览，不请求真实权限或发送。

## Previous Closed Slice W6.a6.18.3.15

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 文本群发由 shared owner 单批执行并逐目标收敛，H5 只保留好友/群选择、文本编辑和 SPA 导航，RN 保持冻结 |
| shared owner | `../im28-sdk/src/sync/message-broadcast.ts` + `message-broadcast-result.ts` + `WebIMSync.messageBroadcast` |
| production consumer | 会话/通讯录 `HomeActionMenu` -> `/broadcast/select` -> `/broadcast/compose` -> `runtime.getSync().messageBroadcast.sendText` |
| verification floor | SDK sql.js 3/3 + full 82 files/331 tests + typecheck:web/build:web；H5 route/view 4/4 + 466 assets/typecheck/793-module build；412x786 authenticated selection/compose/exit、zero overflow/console；RN source zero change |
| not authorized | final send、second-account realtime/list-back、RN business convergence |

Next bounded slice: `W6.a6.18.3.15.1-message-broadcast-media-contract-refresh`；追踪 RN 图片/视频/文件群发并复用现有 shared upload/body/checkpoint owner，不执行真实发送。扫码作为独立浏览器 platform slice 后续处理。

## Previous Closed Slice W6.a6.18.3.14

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 发起群聊由 shared owner exactly-once 执行并原子缓存服务端群/会话，H5 只保留好友选择和 SPA 导航，RN 保持冻结 |
| shared owner | `../im28-sdk/src/sync/group-creation.ts` + `WebIMJoinedGroupSync.create` + `GroupRepository.applyCreation` |
| production consumer | 会话/通讯录 `HomeActionMenu` -> `/groups/create` -> `runtime.getSync().groups.create` |
| verification floor | SDK creation 4/4、creation+lifecycle 10/10、typecheck:web；H5 creation+lifecycle view 6/6、typecheck/build；RN source zero change |
| not authorized | final create、second-account member/realtime/list-back、RN business convergence |

该 residual inventory 已由 `.15-message-broadcast-text` 关闭；下一片进入媒体群发合同，不执行真实发送。

## Previous Closed Slice W6.a6.18.3.13.6

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 普通成员退群、群主解散由 Web shared owner exactly-once 执行，远端成功后原子删除群域缓存，H5 只保留确认与导航，RN 保持冻结 |
| shared owner | `../im28-sdk/src/sync/group-lifecycle.ts` + `createIMGroupLifecycleSync` + `GroupRepository.removeLifecycleState` |
| frozen contract | cached group/current member/shared capability -> one leave/dismiss Gateway write -> strict group response -> attachments/messages/group conversations/members/group transaction -> `local\|remote-only`；no replay |
| production consumer | `/conversations/:conversationID/settings` -> `runtime.getSync().groupLifecycle`；shared capability 决定退出/解散入口 |
| verification floor | SDK group-management related 27/27 + Web typecheck/build:web/sync:web；H5 focused 12/12 + typecheck/build；RN source zero change |
| not authorized | final leave/dismiss、server-denial sample、second-account realtime/list-back、RN business convergence |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；按 RN 功能域/caller/页面/状态重新生成剩余缺口，不执行 mutation，不改 RN 业务逻辑。

## Previous Closed Slice W6.a6.18.3.13.5

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 群设置、群禁言与成员禁言由 Web shared owner exactly-once 执行，H5 只保留 SPA presentation，RN 保持冻结 |
| shared owner | `../im28-sdk/src/sync/group-settings-mute.ts` + `createIMGroupManagementSync` |
| frozen contract | field capability/target preflight -> one explicit Gateway patch -> strict group/member identity merge -> `local\|remote-only`；no replay |
| production consumer | `/settings/manage`、`/settings/manage/mute`、`/settings/manage/speech-frequency` -> `runtime.getSync().groupManagement` |
| verification floor | SDK focused 28/28 + Web typecheck/build；H5 focused 14/14 + typecheck/build；RN source zero change |
| not authorized | final toggle/mute、server-denial sample、second-account realtime/list-back、RN business convergence |

该切片已由上方 `.13.6-group-lifecycle` 关闭；当前 next bounded slice 为 `W6-rn-parity-residual-inventory-refresh`。

## Latest Closed Slice W6.a6.18.3.13.4

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 管理员设置/取消与群主转让由 Web shared owner exactly-once 执行，H5 只保留 SPA presentation，RN 保持冻结 |
| shared owner | `../im28-sdk/src/sync/group-admin-owner.ts` + `createIMGroupMentionSync.setAdmins/cancelAdmins/transferOwner` |
| frozen contract | owner/capability/target/admin-limit preflight -> one Gateway write -> group/member transaction -> independent authoritative refresh；no replay |
| production consumer | `/conversations/:conversationID/settings/manage` -> `runtime.getSync().groupMembers`；候选过滤也消费 shared helper |
| verification floor | SDK related 16/16 + new 4/4 + build:web/typecheck；H5 focused 11/11 + typecheck/build；RN source zero change |
| not authorized | final admin/owner mutation、second-account realtime/list-back、RN business convergence |

该切片已由上方 `.13.5-group-settings-and-mute` 关闭，且 `.13.6-group-lifecycle` 已继续关闭；当前 next bounded slice 为 `W6-rn-parity-residual-inventory-refresh`。

## Latest Closed Slice W6.a7.1

| field | value |
| :--- | :--- |
| status | `done-local/visual-data-gated` |
| goal | H5 建立轻量 route/bubble/TabBar/modal 交互基础，不改变 RN 视觉层级或共享业务 owner |
| owner | `apps/web/src/components/interaction/**`；feature 页面只传受控状态与关闭回调 |
| production consumer | `App -> RouteMotionController`；`ChatMessageList -> useTailItemMotion`；`PrimaryTabBar` selected CSS；`ConversationDeleteSheet -> InteractionModal` |
| frozen contract | no remount、main-only route entry、history-prepend no animation、native dialog focus/inert/Esc/backdrop、reduced-motion zero animation |
| verification floor | H5 typecheck/build + 466 assets + authenticated React Router tabs/zero-console + 390x844 zero-overflow |
| residual | 当前登录账号会话为空，真实会话 delete modal 与 realtime appended bubble 视觉证据 data-gated；不制造/删除真实数据 |

该 presentation slice 后续已由 `.13.4-admin-owner`、`.13.5-settings-mute` 和 `.13.6-group-lifecycle` 关闭；当前 next bounded slice 为 `W6-rn-parity-residual-inventory-refresh`。

## Previous Closed Slice W6.a6.18.3.13.3

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | Web 群成员邀请由 shared owner 按服务端审核开关选择唯一 endpoint；H5 只保留交互，RN 业务保持冻结基线 |
| shared owner | `../im28-sdk/src/sync/group-member-invitation.ts` + `createIMGroupMentionSync.inviteMembers`；Gateway facade 对齐批量 application response |
| source anchor | RN 好友权限/成员过滤与反馈；OpenAPI `/group/application/invite`、`/group/member/invite`；shared permission/contact/member DTO |
| frozen contract | preflight -> exactly one application/direct invite -> strict response -> independent member refresh；远端成功后禁止邀请重放 |
| verification floor | SDK 17/17 + typecheck/boundary/build:web；RN whole-worktree zero diff；H5 10/10 + typecheck/build + dev-pc smoke |
| not authorized | final invite、第二账号 application/member realtime/list-back、RN business convergence |

Next bounded slice: `W6.a6.18.3.13.4-admin-owner-contract-core`；冻结管理员设置/取消与群主转让的 exactly-once 合同，RN 只读不改；不执行真实 mutation。

| field | value |
| :--- | :--- |
| status | `active` |
| active_slice | `W6-rn-parity-residual-inventory-refresh` |
| verification_floor | `RN route/page/action inventory -> H5 production route/API owner cross-check -> missing/detail/deferred register；no RN business change, mock success or inferred parity` |

## Workstream Ledger

| workstream | scope | owner | expected deliverable | verification | status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `W1` | 基线与执行治理 | docs | H5 SSOT 与 active trio | 文档交叉核对 | `done` |
| `W2` | workspace 与 Web SDK 基础 | web app + sdk | 可安装、可构建、可启动骨架 | `npm run verify`; browser smoke | `done` |
| `W3` | Gateway runtime | sdk runtime | 真实认证与连接链路 | targeted tests + manual smoke | `gated` |
| `W4` | 会话与文本消息 | feature + sdk | 核心聊天 MVP | tests + real flow smoke | `gated` |
| `W5` | 生产化门禁 | storage/runtime | Worker、多标签页与恢复策略 | browser matrix + regression | `gated` |
| `W6` | RN 页面 parity | web feature + sdk facade | RN 样式/资产/行为/API 的 React Router SPA 迁移 | source trace + visual/route/API evidence | `active` |
| `W6.a6.12.1` | cross-runtime convergence | shared SDK + RN/Web composition | consumer matrix、neutral facade、RN/Web actual-call adoption、compat exit register | shared tests + runtime boundary + RN/Web caller evidence | `done-local/acceptance-gated` |
| `W6.a6.19-chat-message-presentation-parity` | code/verification | shared SDK display-name resolver + H5 chat projection/layout | sender/mention display、image ratio/OSS decode fallback、voice duration width、forwarded-message hierarchy without duplicating SDK identity rules | H5 focused 5/22 + SDK 59/204 + full verify + authenticated DOM/layout proof | `done-local/acceptance-gated` |
| `W6.a7.1-lightweight-interaction-foundation` | code/architecture/verification | H5 presentation components | route/message/TabBar motion tokens + native modal lifecycle + reduced-motion without second business owner | H5 typecheck/build、466 assets、authenticated tab route/zero-console、390x844 zero-overflow | `done-local/visual-data-gated` |

## Active / Pending Slice Queue

| item | type | owner | target output | verification | status | next activation rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `W2.a1` | code/docs | workspace + sdk + app | npm workspace、`@im28/im-sdk/web`、Vite React Router App | `npm run verify`; browser smoke | `done` | closed 2026-08-09 |
| `W2.a2-unified-multi-runtime-sdk` | architecture/refactor | `im28-sdk` + RN/H5 consumers | single npm package、shared `src/sync`、isolated RN/Web/Desktop entries、app-local SDK removal | SDK typecheck/29 files 89 tests/build:all/pack dry-run + RN tsc + H5 verify | `done` | closed 2026-08-10；Desktop concrete driver remains Electron-app choice |
| `W2.closeout` | verification/docs | docs + workspace | 状态、架构、cleanup 和证据回写 | trio consistency + root gate | `done` | closed 2026-08-09 |
| `W3.a1` | contract/design | sdk runtime | Gateway runtime contract、auth/token owner 与配置边界 | 4 test files / 11 tests + workspace verify | `done` | closed 2026-08-09 |
| `W3.a2-local` | code/verification | sdk runtime + storage | browser auth/realtime、account SQLite lifecycle、privacy gate | shared SDK test + H5 25 tests + Chromium SQLite smoke | `done` | closed 2026-08-09 |
| `W3.real-gateway-readonly` | deployment verification | sdk runtime + deployment | real phone-code login、refresh restore、Gateway-backed reads、two-account tab isolation and WS online | authenticated browser smoke + token-free lifecycle/list/error evidence | `passed-partial` | closed 2026-08-12；shared device-ID collision reproduced/fixed；30s sample 19/20 dual-online + one simultaneous recovered reconnect；no send/mutation |
| `W3.real-gateway` | deployment verification | sdk runtime + deployment | authoritative realtime delivery/list-back and offline SQLite cache-hit evidence | explicitly authorized dual-account event + non-destructive offline harness | `blocked-external` | online is proven；do not infer delivery or offline cache from populated pages |
| `W3.closeout` | verification/docs | sdk runtime + docs | real smoke evidence、架构与 trio 回写 | `npm run verify` + real Gateway smoke | `planned` | `W3.real-gateway` passed |
| `W4.a0` | contract/code | shared sdk + web sdk | 三操作 contract 与唯一 Gateway DTO -> core mapper | pure mapping tests + shared SDK build | `done` | closed 2026-08-09 |
| `W4.a1-conversations` | code | web sdk runtime | cache list、Gateway full sync、latest message persistence | 3 focused sql.js/Repository tests | `done` | closed 2026-08-09 |
| `W4.a1-history-send` | code | web sdk runtime | cache history、remote pull、optimistic text send | 3 message sync tests + workspace verify | `done` | closed 2026-08-09 |
| `W4.a1-ui` | code | web app | React Router conversation/message default caller | build + desktop/mobile config/login smoke | `done-local` | authenticated real flow still gated |
| `W4.a2-created-conversation` | code/verification | web sdk runtime | 新消息/会话事件落库、账号隔离、分页 HTTP 缺口恢复与 UI cache 刷新 | 5 focused tests + workspace verify | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-updates` | contract/code | web sdk runtime | 消息编辑、撤回、删除的 cursor 与 Repository 状态收敛 | sql.js + raw WebSocket integration | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-serialization` | architecture/code | web sdk sync | full sync/history/send/realtime 共享业务 operation queue | 3 delayed interleaving/failure regressions | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-closeout` | verification/docs | web sdk runtime + docs | W4.a2 证据、残留项与下一片回写 | `npm run verify` + real chat smoke | `blocked-external` | local closeout and real WS online passed；message delivery/list-back event remains unproven |
| `W5.a1-storage-boundary` | architecture | storage/runtime | Dedicated Worker RPC、lifecycle Web Lock 与 failure contract | architecture review + executable test plan | `done` | closed 2026-08-09 |
| `W5.a2-worker-runtime` | code/verification | storage worker | typed RPC/client、Worker-owned sql.js/IndexedDB、fatal-state discard | 7 adapter/protocol tests + 18/47 workspace verify + Worker build | `done-local` | closed 2026-08-09 |
| `W5.a3-multi-tab-writer` | code/verification | storage lifecycle | account-scoped lifecycle Web Lock、busy/unsupported UI state | 6 lock/lifecycle tests + 19/52 verify | `done-local` | closed 2026-08-09 |
| `W5.a3-browser-matrix` | deployment verification | storage runtime | real Worker/IndexedDB/Web Locks two-tab close/crash evidence | Chromium/Firefox/Safari matrix | `blocked-environment` | target browser harness available |
| `W5.a4-storage-operations` | code/verification | storage/runtime | quota、compaction、corruption rebuild workflow | large-history/quota/recovery evidence | `planned` | W5.a3 passed |
| `W6.a0-migration-contract` | contract/docs | docs + RN source inventory | 样式、资产、SDK/API、React Router 四类硬约束与验收门 | source-path cross-check | `done` | closed 2026-08-09 |
| `W6.a1-assets-theme` | code/docs | web styles/assets | 466 文件字节镜像、SHA-256 gate、完整 RN light/dark token foundation | `npm run assets:check`; CSS/source review | `done-foundation` | closed 2026-08-09 |
| `W6.a2-account-login-parity` | code/verification | web login + sdk facade | RN 账号登录布局、资产、协议状态、真实登录/条款 caller | 466 assets + 20/55 verify + dark mobile interaction/refresh/live-term smoke | `done-local/acceptance-gated` | exact viewport/theme + real login evidence available |
| `W6.a3-conversation-parity` | code/verification | web conversations + sdk facade | RN home shell/conversation list parity | 390x844 light/dark + 760px responsive + auth guard + cache composition test + verify | `done-local/acceptance-gated` | real account cache/sync/chat-back evidence available |
| `W6.a3.1-conversation-list-interaction-parity` | code/verification | web conversations + shared SDK + RN composition | dedicated global search route、long-press/right-click actions、pull-to-refresh and one shared read/unread/archive state machine | SDK 59/203 + RN 190 focused tests/typecheck + H5 focused tests/full verify + authenticated Chromium layout/route/menu proof | `done-local/mutation-acceptance-gated` | real mutations、physical touch、Safari/Firefox remain explicit gates |
| `W6.a3.2-archived-conversation-route-parity` | code/convergence/verification | shared SDK + RN/Web composition + H5 route | shared archive full pagination/snapshot、normal/archive cache isolation、RN caller convergence、main entry and `/conversations/archived` cache pagination/search/pull/menu | SDK all-runtime + 12/12 + build:rn/build:web；RN tsc/2；H5 verify 70/273 + authenticated real row/entry/layout/console proof | `done-local/mutation-acceptance-gated` | closed 2026-08-12；cancel/delete、second-account list-back、physical touch and cross-browser remain |
| `W6.a4-chat-parity` | code/verification | web chat + sdk facade | RN header/message list/composer parity | 390x844 light/dark + 760x900 responsive + guest guard + existing sync chain review + verify | `done-local/acceptance-gated` | approved account history/send/realtime/list-back evidence available |
| `W6.a5.1-auth-entry-routes` | code/verification | web login + sdk runtime | phone/email/account/register RN parity、real auth facades and route switching | 21/58 verify + 390x844 dark + 760x900 + deep-link/back/forward + no-fake audit | `done-local/acceptance-gated` | real account/phone/email smoke、send-code contract and light-mode proof available |
| `W6.a5.2-remaining-auth-tab-routes` | design/code/verification | web app routes + features | invite/profile/network and contacts/calls/me as bounded route slices | source/API/route ledger, then per-slice deep-link/back/forward/auth-guard matrix | `active` | continue child slices through the shared tab shell owner |
| `W6.a5.2.1-contacts-core` | code/verification | web contacts + sdk facade | RN contact list, real paged friend operation, local search/group/index and `/contacts` guard | original 22/60 gate + `.17.2.2` cache + `.1.1` Pinyin authenticated 7-row proof | `done-local/acceptance-gated` | cache-first and Pinyin paths closed；active next: broader responsive/theme/route acceptance |
| `W6.a5.2.1.1-contact-pinyin-index-parity` | code/verification | web contacts presentation | RN `pinyin-pro@3.28.1` surname-mode Chinese index with unchanged SDK order and `#` fallback | 4 focused tests + H5 35/120 + full verify + authenticated 458x786 A/D/Z/H proof | `done-local/acceptance-gated` | closed 2026-08-11；dictionary-in-main debt closed by `.1.2` |
| `W6.a5.2.1.2-contact-route-code-split` | code/verification | web React Router + contacts presentation | lazy `/contacts` route, accessible loading state and dictionary-free search filter | H5 36/122 + full verify + production chunk comparison + authenticated tab navigation/overflow/console proof | `done-local/acceptance-gated` | closed 2026-08-11；global main chunk remains a separate app-wide performance debt |
| `W6.a5.2.1.3-contact-verification-route-parity` | code/verification | web contacts routing + existing application facades | RN 单一“验证消息”入口、好友/群聊双 tab、旧深链重定向和单群审核详情返回 | SDK Web 59/204 + H5 typecheck/build/full verify + authenticated real 5-row/empty read + 390x844/760x900 route/overflow/console proof | `done-local/mutation-gated` | closed 2026-08-12；pending friend、non-empty group、unread badges and approved audit mutations remain |
| `W6.a5.2.1.4-contact-list-interaction-contract-freeze` | code/contract/verification | web contacts + shared SDK reads | cache-first、下拉刷新、RN 索引顶部/活动态和联系人长按四动作 owner 冻结 | pull contract 2/2 + SDK Web 59/204 + full verify + authenticated 390x600 route/index/overflow/console proof | `done-local/action-facade-gated` | closed 2026-08-12；physical touch、offline block、drag index and cross-browser remain acceptance gates |
| `W6.a5.2.1.5-contact-action-shared-facade-convergence` | contract/refactor | shared SDK + RN/Web composition | 将发消息、音视频、分享名片、删除好友逐项归类为 neutral facade/platform adapter，并移除 RN 应用内重复业务 owner | RN caller + SDK gateway/export/consumer matrix + focused tests + all-runtime boundary | `done-local/acceptance-gated` | all four H5 actions consume converged owners；real mutations/RTC remain gated |
| `W6.a5.2.1.5.1-shared-friend-delete-core` | code/convergence | shared SDK + RN/Web composition | one Gateway friend delete -> success-only friendship/direct-conversation/message transaction -> platform event projection | SDK real sql.js 3/3 + all-runtime typecheck/boundary + build:rn/build:web + RN 2 focused/tsc + H5 typecheck/build | `done-local/destructive-acceptance-gated` | closed 2026-08-12；no real delete；legacy RN delete Gateway owner and second conversation deletion removed |
| `W6.a5.2.1.5.2-shared-user-card-core` | code/convergence | shared SDK + RN/Web composition | normalized target set -> one Gateway card share -> shared direct-open/type101 optional note -> platform event projection | SDK contact/peer 10/10 + all-runtime typecheck/boundary + build:rn/build:web + RN 5 focused/tsc + H5 typecheck/build | `done-local/mutation-acceptance-gated` | closed 2026-08-12；no real share/send；legacy RN Gateway/helper orchestration removed |
| `W6.a5.2.1.5.3-web-rtc-platform-adapter-contract` | contract/design | shared call contract + Web media/runtime | start/token/refresh/hangup shared truth、LiveKit browser adapter、permission/device/route lifecycle and failure boundaries | RN/Gateway/source trace + browser dependency/runtime decision + anti-fake review | `done-local/call-acceptance-gated` | shared control、real Web media port and H5 outgoing route closed；real dual-account call remains gated |
| `W6.a5.2.1.5.3.1-shared-rtc-control-convergence` | code/convergence | shared SDK + RN/Web composition | one auth/ID/credential/E2EE owner for start/answer/reject/cancel/hangup/token refresh；remove RN duplicate control helpers | SDK 3 files/11 tests + all-runtime typecheck/boundary + RN composition/outgoing projection tests + RN tsc | `done-local/call-acceptance-gated` | closed 2026-08-12；no real call operation、permission or room connection |
| `W6.a5.2.1.5.3.2-web-livekit-media-runtime-adapter` | contract/code | Web platform media/runtime + H5 route | real browser LiveKit room adapter、permission/device lifecycle、token refresh/reconnect、terminal cleanup and visible failure state | dependency/source trace + injected lifecycle tests + typecheck/build + non-mutating route proof | `done-local/call-acceptance-gated` | no real call/permission；incoming call and ringtone are separate slices |
| `W6.a5.2.1.5.3.2.1-web-call-media-session` | code/contract | SDK Web platform media | injected connect/track/participant/reconnect/autoplay/terminal state machine with no token snapshot or fake room | SDK 3 focused files/14 tests + Web typecheck + boundary/build + route-exit race guard | `done-local` | closed 2026-08-12；does not request permission or instantiate LiveKit |
| `W6.a5.2.1.5.3.2.2-web-livekit-client-port` | code/integration | SDK Web port + H5 runtime/route | instantiate real LiveKit Room、map RoomEvent、permission/device lifecycle、token refresh and route cleanup | dependency install + 4 media files/20 tests + call/runtime focused 8/39 + all-runtime typecheck/boundary + build:web sync + H5 typecheck/build + authenticated non-mutating route proof | `done-local/call-acceptance-gated` | closed 2026-08-12；no real start/permission/room；dynamic RTC chunk；RN/Desktop and desktop:web script untouched |
| `W6.a5.2.1.5.4-contact-action-menu-ui` | code/verification | H5 contacts + existing shared/platform owners | RN four-action long-press menu backed by direct-conversation facade、Web RTC adapter、shared card send and shared friend delete | contacts 9 files/34 tests + typecheck/build + authenticated 7-contact read-only menu proof | `done-local/mutation-acceptance-gated` | closed 2026-08-12；no action clicked；physical touch/cross-browser and real write/RTC results remain gated |
| `W6.a5.2.1.5.6-friend-source-convergence` | code/convergence/verification | shared SDK + RN/H5 profile/application/search callers | Gateway source DTO、one inference/display owner、H5 source row and full-width profile rows | SDK 7/7 + all-runtime/build:rn/build:web + RN tsc/16 + H5 11/typecheck/build + authenticated real-profile geometry | `converged/read-only-accepted` | closed 2026-08-12；no mutation/call/permission；cross-browser/dark remain gated |
| `W6.a5.2.1.5.7-incoming-call-ringtone-contract` | contract/design/convergence | RN incoming RTC + shared call control + Web platform call lifecycle | freeze realtime offer/invite、ringing state、ringtone/autoplay、answer/reject/timeout/route cleanup ownership；shared strict parser + RN adoption | SDK 18/18 + all-runtime/build:rn/build:web + RN tsc/76 focused | `done-local/web-consumer-pending` | closed 2026-08-12；no real call, answer, media permission or ringtone playback |
| `W6.a5.2.1.5.7.1-incoming-call-runtime-core` | code/convergence | shared call lifecycle + Web runtime | event ID/call ID state transition、realtime process subscription、pending restore and account cleanup without persistence | SDK 8 files/37 + final 4/16 + all-runtime boundary + build:web + H5 typecheck/build | `done-local` | closed 2026-08-12；no real call/permission/ringtone；incoming UI follows `.5.7.2` |
| `W6.a5.2.1.5.7.2-incoming-call-web-ui-ringtone` | code/integration | H5 global call provider + SDK Web platform audio/media | runtime snapshot projection、foreground pending refresh、banner/fullscreen/draggable floating、ringtone/autoplay recovery、lazy-media answer/reject、remote-terminal cleanup | SDK all-runtime + 22/22 + final 15/15 + build:web；H5 typecheck + UI/tone 6/6 + build + authenticated cold zero-overlay/zero-console smoke | `done-local/real-call-acceptance-gated` | closed 2026-08-12；no real call/ringtone/permission；`build:package:desktop:web` untouched |
| `W6.a5.2.2-primary-tab-shell` | code/verification | web app layout + global component | RN 4-tab global shell, real unread badge, nested conversation/contact/calls routes and child-page exclusion | 390x844/760x900 light/dark + click/back/forward/reload + chat-detail exclusion + 22/60 verify | `done-local/acceptance-gated` | me real route + application badge owner + calls/overall safe-area/cross-browser evidence |
| `W6.a5.2.3-calls-core` | code/verification | web calls + sdk facade | RN 通话记录 cache/sync/delete 与 `/calls` 主标签页 | source/tests + real 2-row filters + 390x844/760x900 light/dark zero-overflow proof | `accepted-readonly/mutation-gated` | delete and non-missed/duration data remain；Safari/Firefox joins W5 browser matrix |
| `W6.a5.2.3.1-call-detail-shared-convergence` | code/convergence/verification | shared SDK + RN/H5 callers | lossless call raw cache、Gateway detail merge/writeback、same-day filters、RN detail adoption and `/calls/:callID` route | SDK 3 files/15 + all-runtime typecheck/boundary + build:rn/build:web + RN tsc/2 composition + H5 62 files/223/466 assets/build + authenticated 567x786 route proof | `converged/read-only-accepted` | closed 2026-08-12；no call/delete/permission；legacy RN detail Gateway/cache merge owner removed；`build:package:desktop:web` unchanged |
| `W6.a5.2.3.2-call-record-list-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web callers | move RN list/delete/pending/realtime terminal record business transitions into the neutral call-record facade and delete duplicate app owners | SDK 65 files/234 + all-runtime boundary/build；RN service 127 + focused 15 + CallList 11 + tsc；H5 62 files/228/466 assets/build | `done-local/mutation-gated` | closed 2026-08-12；RN duplicate Gateway/schema/CRUD/status owners removed；Web realtime composition closed by `.3.3`；no real delete/call；desktop:web script untouched |
| `W6.a5.2.3.3-web-realtime-call-history-composition` | code/convergence/verification | shared terminal parser + Web runtime + H5 calls consumer | WebSocket terminal message -> shared parser -> shared call state/cache -> one runtime data version -> `/calls` cache reread | shared/runtime focused 3 files/15；all-runtime typecheck/boundary；build:rn/build:web；RN 2 suites/4 + tsc；H5 verify 63 files/232/466 assets/build | `done-local/realtime-acceptance-gated` | closed 2026-08-12；no mock/fake-success/second parser；real dual-account terminal event and list-back remain；desktop:web script untouched |
| `W6.a5.2.4-me-core` | code/verification | web me + sdk facade | RN current-profile hero、general settings/logout、`/me` fourth tab | source/tests + authenticated 390x844/760x900 light/dark screenshots/history + 24/65 verify | `accepted-readonly/mutation-gated` | real logout Network/session/DB cleanup proof；Safari/Firefox joins W5 browser matrix |
| `W6.a5.2.5-me-profile-edit` | code/verification | web me profile + sdk facade | nickname/gender/bio update-profile routes and RN field validation | source/API trace + 4 tests + authenticated responsive/history/cold-restart + 24/67 verify | `done-local/acceptance-gated` | dark proof + approved changed-value Network/result evidence |
| `W6.a5.2.6-account-security` | design | web me security + sdk/runtime facade | RN security screen/operation/route matrix with bounded real mutations only | source/API/export/session-side-effect trace | `decomposed` | account credential child done-local/acceptance-gated；contact verification remains blocked-contract |
| `W6.a5.2.6.1-account-credential` | code/verification | web me security + sdk runtime | security root、set account/password、old-password reset with revoked-session cleanup | 3 focused tests + 25/70 verify + authenticated responsive/history/guest browser matrix | `done-local/acceptance-gated` | approved real set/reset Network/result + dark proof |
| `W6.a5.2.6.2-contact-security` | contract/code | web me security + sdk/runtime facade | phone/email bind or change with verified-code lifecycle | send-code + mutation contract and real verification flow | `blocked-contract` | Gateway exposes a real send-code operation or product explicitly changes scope |
| `W6.a5.2.7-general-settings` | design | web me settings + sdk/runtime facade | display、notification、permission、network、terms、version/cache route/capability matrix | RN source/API/route owner trace | `decomposed/active-children` | continue bounded children without mixing browser-blocked contracts |
| `W6.a5.2.7.1-display-notification-terms` | code/verification | web me settings + sdk runtime | RN display preference、real notification detail/update facade、real terms routes | focused tests + real reads + 390x844/760x900 light/dark/history/reload and zero-console proof | `accepted-readonly/mutation-gated` | approved notification update + Safari/Firefox proof；RN/H5 shared title semantics debt remains explicit |
| `W6.a5.2.7.2-permission-settings` | code/verification | web me settings + sdk runtime | five RN permission switches through authenticated detail/update operations | focused tests + authenticated 5-value read + 390x844/760x900 light/dark/history/reload proof | `accepted-readonly/mutation-gated` | approved real update Network/result + Safari/Firefox proof；blacklist remains separate |
| `W6.a5.2.7.3-network-settings` | contract | deployment + web settings | Web-equivalent proxy/network semantics | deployment proxy contract | `blocked-browser-semantics` | browser-safe proxy/config owner is defined |
| `W6.a5.2.7.4-cache-version` | contract | storage/deployment + web settings | browser cache scope/clear and Web update semantics | RN/shared SDK/storage/deployment trace + destructive/anti-fake review | `contract-frozen/decomposed` | version child done-local/acceptance-gated；cache child blocked-storage-semantics |
| `W6.a5.2.7.4-cache-contract` | contract/code | storage/runtime | disposable storage registry + lifecycle-safe current-account inspect/clear | preserve local-only data + isolated destructive tests + Worker/Web Lock recovery | `blocked-storage-semantics` | disposable data is separable from drafts/failed/sending/pending state |
| `W6.a5.2.7.5-web-version-check` | code/verification | web runtime config + settings | required build identity、public check adapter、RN version row/update modal | 11 focused tests + authenticated build `1.4.1.202608092238` no-update browser proof + responsive/reload/guest proof | `accepted-no-update/acceptance-gated` | real `need_update=true` optional/forced response and update target proof |
| `W6.a5.2.8-invite-complete-profile-contract-freeze` | contract/design | auth onboarding + sdk/runtime | RN invite/profile route、operation and post-register state matrix | source/API/caller trace + anti-placeholder/anti-fake review | `done` | closed 2026-08-10；decomposed into route-state/invite/profile children plus explicit avatar/contact blockers |
| `W6.a5.2.8.1-onboarding-route-state` | code/verification | web auth routing + onboarding state | register/login split、memory-only pending registration、account-scoped marker and route guards | 4 state tests + caller tests + full verify + missing-marker browser guards | `done-local/acceptance-gated` | valid register context proof joins `.8.3` acceptance；no credential persistence |
| `W6.a5.2.8.2-invite-page` | code/verification | web auth invite + runtime register | RN invite UI and retry through existing register optional `invite_code` | register body/error tests + responsive/history proof | `done-local/acceptance-gated` | approved invite-required response + valid-context visuals；no standalone invite validation |
| `W6.a5.2.8.3-complete-profile-core` | code/verification | web auth profile + existing profile facade | RN profile core、memory draft、gender/bio SPA subroutes and real current-detail/update | 10 focused app tests + full 27/81 verify + base/gender/bio anonymous guards passed；valid-context matrix pending | `implemented-local/acceptance-gated` | active until approved register/profile Network/result + responsive/light/dark/history proof；contact action remains omitted |
| `W6.a6.20.6-onboarding-avatar` | code/verification | shared profile sync + web auth avatar platform/UI | RN album/camera/crop/upload/draft/final profile timing | H5 4 files/10 tests + full SDK Web 84 files/347 tests + 466 assets/typecheck/1089-module build + route guard | `shared-core-ready/web-consumed/rn-frozen` | valid new-account source/crop/upload/update visual and Network proof blocked-external；RN consumer frozen |
| `W6.a5.2.8.4-onboarding-real-acceptance` | deployment verification | web auth + deployment owner | approved register/optional invite/profile mutation and valid-context visual/history evidence | Network/result + 390x844/760x900 light/dark/back/forward/reload | `blocked-external` | approved disposable new account and mutation authorization available；never fabricate marker/session |
| `W6.a5.2.9-blacklist-core` | code/verification | web me + sdk sync | RN blacklist list/search/remove/confirm route through shared Gateway operations | 4 view tests + authenticated real empty/search-empty + 567x786 system-light/dark/direct/history/reload/zero-console proof + full verify | `accepted-empty-read/chromium/mutation-gated` | non-empty enrichment/search、approved remove Network/result and Safari/Firefox proof；no unsupported add flow |
| `W6.a5.2.10-friend-applications-core` | code/verification | web contacts + sdk sync | RN standalone friend application list/search/group/status/accept through shared Gateway operations | facade/view tests + real 5-row list + 390x844/760x900 light/dark/direct/history/reload + zero-console | `accepted-readonly/mutation-gated` | pending-state sample and approved accept remain；no fake session or unsupported unread/group/profile/reject path |
| `W6.a5.2.11-group-applications-core` | code/verification | web contacts + sdk sync | RN group verification index、per-group application list/search/section/status and accept/reject through one audit facade | facade/view tests + real empty-state + 390x844/760x900 light/dark/direct/history/reload + zero-console | `accepted-empty-read/mutation-gated` | non-empty owner/admin detail and approved accept/reject remain；no fake session or unsupported unread/profile/manage/member-join path |
| `W6.a5.2.12-joined-groups-core` | code/verification | web contacts + sdk sync | RN 我的群聊 cache-first list/search/status/role and conversation opening through shared group/conversation facades | tests + authenticated 11-group/role/search 2/1/0 + 390x844 dark/760x900 light/history/reload proof | `accepted-readonly/mutation-gated` | open-conversation persistence、offline cache isolation and Safari/Firefox remain |
| `W6.a5.2.13-contact-profile-core` | code/verification | web contacts + sdk sync | RN 联系人点击 -> 资料 -> 发消息/加好友 through shared user/friend/conversation facades | tests + real friend/self/unknown-error + 390x844 dark/760x900 light/history/reload proof | `accepted-readonly/mutation-gated` | open-conversation、real stranger and friend apply remain；Safari/Firefox joins W5 matrix |
| `W6.a5.2.14-contact-user-search-core` | code/verification | web contacts + sdk sync | RN 通讯录搜索入口、本地好友匹配、真实 Gateway 用户搜索和资料页跳转 | tests + known result/self-filter/unknown no-result + responsive theme proof | `accepted-readonly/acceptance-gated` | transport/business failure and Safari/Firefox remain |
| `W6.a5.2.15-group-members-route-parity` | code/verification | H5 chat settings/router + existing shared group-member facade | RN 群设置“全部”入口、完整成员 cache-first/sync、搜索、分组、角色标签、资料跳转和 SPA 返回 | H5 focused 4/15 + typecheck/build/full verify + authenticated 4-row search/profile-back + 567/390px zero-overflow proof | `done-local/read-only-accepted` | closed 2026-08-12；large-group、offline、physical touch、Safari/Firefox and all member mutations remain gated |
| `W6.a6.1-chat-media-read-core` | code/verification | web chat | RN 图片全屏预览、单实例语音播放/停止、视频全屏播放，消费既有 cache payload | H5 11/42 + SDK 32/103 + 466 assets + typecheck/build/full verify + guest guard | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10；approved authenticated media playback and responsive light/dark proof remain acceptance gates |
| `W6.a6.2-chat-image-file-send-core` | code/verification | shared sdk + web adapter + web chat | RN 相册图片/普通文件选择 -> 上传凭证 -> OSS 直传 -> Gateway send -> SQLite 状态收敛 | H5 12/46 + SDK 33/107 + 466 assets + all-runtime typecheck + full verify/build + release/pack + responsive browser proof | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10；real upload/send requires explicit authorization and remains an acceptance gate |
| `W6.a6.3-chat-album-video-send-core` | code/verification | shared sdk + web adapter + web chat | RN mixed 相册视频 -> browser metadata -> shared upload/Gateway video body -> SQLite 状态收敛 | H5 13/50 + SDK 35/109 + 466 assets + all-runtime typecheck/build:web/full verify + responsive browser proof | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10；real upload/send requires explicit authorization and remains an acceptance gate |
| `W6.a6.4-chat-voice-send-core` | code/verification | shared sdk + web media adapter + web chat | RN hold/cancel recording -> browser Blob -> shared upload/Gateway audio body -> SQLite 状态收敛 | H5 15/56 + SDK 36/111 + injected recorder lifecycle/error tests + all-runtime typecheck/build:web/full verify + responsive voice-mode proof | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10 without opening a microphone or transmitting media；real recording/upload/send requires explicit authorization |
| `W6.a6.5-chat-system-emoji-core` | code/verification | web chat composer + browser preference adapter | RN Unicode emoji panel -> selection-aware draft editing -> existing text send path | 9 focused + H5 17/65 + SDK 36/111 + 466 assets + full verify/build + authenticated 390x844/1280x800 browser proof | `done-local/acceptance-gated` | no message transmitted；real text send remains an explicit acceptance gate |
| `W6.a6.6-chat-illustrated-emoji-contract-freeze` | contract/design | RN preset registry/document/send/read + shared SDK boundary | source trace -> entity/body/cache/display contract -> bounded implementation slices | RN source/API/caller trace + 135/133 identity audit + ownership/failure/anti-placeholder review | `done` | Gateway schema partial、SDK mapper/send/cache gaps and shared owner decision frozen in migration contract §30 |
| `W6.a6.6.1-shared-preset-emoji-core` | code/convergence | im28-sdk core/transport/sync/repository + RN thin adapters | shared DTO/descriptor/document/entity -> Web send/map/SQLite；remove RN live algorithm duplication | SDK 37/116 + build:rn/build:web + RN 3 suites/12/tsc + H5 17/65/typecheck/build + 466 assets | `done-local` | closed 2026-08-10；no H5 UI or real send |
| `W6.a6.6.2-h5-illustrated-emoji-ui` | code/verification | H5 chat composer/message/conversation + browser preference/assets | shared descriptors/entities -> illustrated tab/grid/preview/bubble/conversation projection | H5 21/75 + SDK 37/116 + 466 assets + 458x786/1280x900 light/dark proof | `done-local` | closed 2026-08-10；no real send/custom emoji/draft persistence |
| `W6.a6.6.3-illustrated-emoji-acceptance` | deployment verification | H5 + SDK + approved disposable conversation | one authorized preset text send -> Gateway -> SQLite -> list-back | Network/result/cache proof | `blocked-external` | explicit send authorization and disposable account/conversation required |
| `W6.a6.7-custom-emoji-contract-freeze` | contract/design | RN custom emoji library/send/manager + Gateway generated API + SDK/H5 gaps | freeze type 115 DTO/cache/send/UI/failure/owner map and bounded slices | RN/API/caller trace + anti-fake/owner review | `done` | closed 2026-08-11；overall runtime-chain-partial |
| `W6.a6.7.1-shared-custom-emoji-core` | code/convergence | SDK core/transport/sync/repository | DTO + list mapper/client + SQLite cache + `listCached/sync/sendCustomEmoji` | Gateway contract + 5 focused real sql.js/HTTP tests + 40/121 Web suite + core/all-runtime build + package sync | `done-local` | closed 2026-08-11；no manager mutation or real send |
| `W6.a6.7.2-h5-custom-emoji-panel` | code/verification | H5 chat panel/message + browser preference | third tab + five-column recent/all + safe type 115 send/read presentation | H5 22/77 + SDK 40/121 + typecheck/build/assets + authenticated real-list 458x786/1280x800 dark proof | `implemented-local/acceptance-gated` | no manager/real send；light-theme proof remains open |
| `W6.a6.7.3-custom-emoji-manager` | contract/design | SDK media/custom emoji + H5 manager | create/add/delete/reorder decomposition with explicit mutation semantics | RN/Gateway/caller/owner/failure review | `done` | closed 2026-08-11；split into `.3.1/.3.2/.3.3` |
| `W6.a6.7.3.1-shared-custom-emoji-mutations` | code/convergence | SDK transport/sync/repository + shared upload port | create uploaded images、add received ID、batch delete and cache convergence | HTTP contract + injected upload + real sql.js + 40/126 Web + all-runtime build | `done-local` | closed 2026-08-11；no real upload/mutation |
| `W6.a6.7.3.2-h5-custom-emoji-manager` | code/verification | H5 chat/manager/router | add tile、image picker、five-column preview/select/confirm-delete | H5 23/80 + SDK regression + 458x786 read-only browser proof | `implemented-local/acceptance-gated` | closed 2026-08-11；real file selection/mutation and desktop/light proof remain gated |
| `W6.a6.7.3.3-custom-emoji-add-reorder` | code/verification | H5 message actions + browser preference | type115 add action + stable-ID local reorder | H5 24/85 + focused projection/order tests + 458x786 move-tray/cancel proof | `implemented-local/acceptance-gated` | closed 2026-08-11；current history has no type115；no real add/order commit |
| `W6.a6.7.4-custom-emoji-acceptance` | deployment verification | H5 + SDK + approved account | real list/cache + one authorized disposable type 115 send | Network/Gateway/SQLite/realtime/list-back | `blocked-external` | explicit account/conversation authorization required |
| `W6.a6.8-chat-media-export` | code/verification | H5 chat + browser media adapter | RN image save and file preview/download over persisted real payload | H5 25/92 + full verify + real cached 458x786/1280x800 proof | `implemented-local/acceptance-gated` | actual download/open and light-theme proof remain gated |
| `W6.a6.9-chat-failed-retry` | contract/code/verification | RN chat + shared SDK + H5 chat | same-row type101/type115 retry with shared owner and explicit media exclusion | SDK 41/130 + real sql.js identity/failure/no-I/O gates + build:all + H5 25/92/typecheck/build | `implemented-local/acceptance-gated` | closed 2026-08-11；real failure/retry requires explicit authorization |
| `W6.a6.10-chat-media-retry-stage` | contract/code/verification | shared SDK media send + Web runtime + H5 capability | durable post-upload body checkpoint、conditional 102–105 same-row retry、pre-Realtime interrupted-send recovery and explicit pre-upload source reselection | SDK 43/138 + upload-once/body/range/order gates + all-runtime build:all + H5 25/92/verify + 458px read-only smoke | `implemented-local/acceptance-gated` | closed 2026-08-11；real Gateway failure/retry remains explicitly authorized acceptance only |
| `W6.a6.11-chat-quote-reply` | contract/code/verification | RN chat actions + shared SDK message sync + H5 composer/list | type114 quote eligibility、Gateway body、durable source projection、composer cancel/send、failed-state semantics and source jump | SDK 44/140 + all-runtime build + H5 typecheck/build/verify + authenticated 458px read-only action/preview/cancel proof | `implemented-local/acceptance-gated` | closed 2026-08-11；real quote send remains explicitly authorized acceptance only |
| `W6.a6.11.1-sdk-sync-runtime-boundary` | architecture/refactor/verification | shared SDK + RN/Web/Desktop entries | shared business sync、Web-only composition and three runtime adapter directories become structurally distinguishable | AST boundary gate + SDK 44/140 + build:all + RN tsc + H5 verify + per-target dist presence check | `done-local` | closed 2026-08-11；RN runtime path unchanged and Web composition absent from RN/Desktop dist |
| `W6.a6.12-shared-sync-neutral-naming-and-rn-adoption-contract-freeze` | contract/design | shared SDK + RN service boundary | freeze neutral-name aliases/deprecation order and explicit RN adoption decision without dual-track business logic | public export inventory + RN caller trace + compatibility/build matrix | `done` | closed 2026-08-11；no unused alias、mass rename or RN runtime cutover；future adoption requires explicit RN composition/service slice |
| `W6.a6.13-chat-copy-core` | code/verification | H5 chat action + browser clipboard adapter | RN copy action/icon、message projection text and success-only feedback | H5 27/99 + SDK 44/140 + full verify/build + authenticated 458x786 right-click/no-overflow/zero-console proof | `implemented-local/acceptance-gated` | closed 2026-08-11；Safari/Firefox clipboard permission and touch long-press remain acceptance gates；no rich clipboard or mutation |
| `W6.a6.14-chat-forward-contract-freeze` | contract/design | RN forward actions + shared SDK send/cache + H5 router/modal | freeze single/multi forward eligibility、target selection、payload identity、preview editing and failure convergence | RN caller/payload/API/SQLite/UI owner trace + anti-fake review | `done` | closed 2026-08-11；Gateway batch exists but shared mapper/schema drop `forward_origin`；normal and hidden-sender paths remain distinct |
| `W6.a6.14.1-shared-forward-core` | code/verification | shared SDK message sync + Gateway transport + SQLite | core forward-origin model/schema/repository、source reread、normal batch + registered hidden-sender send、stable IDs and per-row final state | SDK 49/150 + Web 46/145、real sql.js mapper/repository、partial/top-level/hidden guards、all-runtime typecheck/package、build:web + H5 verify | `done-local/acceptance-gated` | closed 2026-08-11；no RN runtime wiring or real Gateway mutation；server-backed sources only |
| `W6.a6.14.2-h5-forward-target-preview` | code/verification | H5 chat + React Router + existing contact/group/conversation facades | RN action/multi-select、three target sources、target-chat pending preview、exclude/change-target/comment and shared submit caller | H5 29/103 + SDK Web 46/147 + typecheck/build + 466 assets + authenticated read-only 390x844/458x786 light/dark proof + zero page transport/cache logic | `implemented-local/acceptance-gated` | closed 2026-08-11；invalid zero-item pending state fixed；real mutation and desktop visual proof remain `.14.3` gates |
| `W6.a6.14.3-forward-acceptance` | authorized verification | deployment + H5 + SDK | one disposable normal/partial-result/list-back proof and explicitly approved hidden-sender proof | 14:59 normal origin + 15:01 hidden no-origin + conversation cache/list-back + zero sending/failed + H5 30/104 | `partially-accepted/blocked-external` | normal/hidden closed 2026-08-11；controllable real partial-result and desktop viewport remain unavailable |
| `W6.a6.15.1-shared-message-delete-core` | contract/code/verification | shared SDK message sync + Gateway transport + SQLite | current-account source reread、single update/batch-delete/local-only self、partial-result and transactional local convergence | SDK Web 47/152 + all-runtime typecheck + build:web generated-package sync | `done-local/acceptance-gated` | closed 2026-08-11；RN service/runtime import graph unchanged |
| `W6.a6.15.2-h5-message-delete-ui` | code/verification | H5 chat action + multi-select + shared SDK facade | RN single/multi confirmation、self/all scope、group permission presentation and visible partial feedback | H5 31/107 + typecheck/build + 466 assets + authenticated read-only 458x786/390x844 no-overflow/zero-console proof | `done-local/acceptance-gated` | closed 2026-08-11；no delete option was confirmed |
| `W6.a6.15.3-message-delete-acceptance` | destructive authorized verification | deployment + H5 + SDK | disposable `self/all/partial` Gateway、SQLite、realtime/list-back proof | Network/result + exact affected rows + conversation reread | `blocked-destructive-authorization` | explicit disposable messages and action-time authorization required；never delete production history by inference |
| `W6.a6.16-chat-message-edit-contract-freeze` | contract/design | RN edit flow + shared SDK + H5 composer | freeze eligibility、Gateway update、same-row/entity/editedAt/failure/realtime ownership | RN caller/body/cache/UI trace + anti-fake/owner review | `done` | closed 2026-08-11；revoke and non-text/forwarded edit excluded |
| `W6.a6.16.1-shared-message-edit-core` | code/verification | shared SDK message sync + Gateway transport + SQLite | current-account source reread、RN parity guard、success-only same-row text/entity replacement | SDK Web 48/155 + all-runtime typecheck + boundary gate + build:web generated-package sync | `done-local/acceptance-gated` | closed 2026-08-11；RN service/runtime import graph unchanged |
| `W6.a6.16.2-h5-message-edit-ui` | code/verification | H5 chat action + composer/list projection | RN edit action/preview、original document refill、cancel/submit、edited timestamp | H5 32/109 + typecheck/build + 466 assets + authenticated read-only 458x786 no-overflow proof | `done-local/acceptance-gated` | closed 2026-08-11；no edit was submitted |
| `W6.a6.16.3-message-edit-acceptance` | authorized verification | deployment + H5 + SDK | one disposable text edit -> Gateway -> same SQLite row/list-back -> second-client realtime | Network/result + stable IDs/order/status + editedAt/entities + realtime proof | `blocked-mutation-authorization` | explicit disposable message and action-time authorization required |
| `W6.a6.17.1-shared-group-mention-core` | contract/code/verification | shared SDK group/message/repository + Web composition | cache-first full group-member sync、schema v10 mention identity、type106 optimistic send and mapper/realtime persistence | SDK Web 50/159 + all-runtime typecheck + boundary gate + build:web generated-package sync | `done-local/acceptance-gated` | closed 2026-08-11；RN service/runtime import graph unchanged；no real send |
| `W6.a6.17.2-h5-group-mention-ui` | code/verification | H5 group chat composer/message/conversation | RN `@成员/@所有人` query/picker/selection/cursor、shared send caller、type106 read and latest `[有人@我]/[所有人]` preview | H5 33/114 + typecheck + 466 assets + production build | `done-local/acceptance-gated` | closed 2026-08-11；no message transmitted；then-open unread projection residual closed by `.17.2.1` |
| `W6.a6.17.2.1-unread-mention-conversation-projection` | code/verification | shared SDK message/group repository + conversation facade + H5 preview | seq-bounded latest unread mention、cached group sender name、draft/mention/latest priority | SDK 50/160 + H5 33/116 + all-runtime typecheck + verify + 458x786 real-list no-overflow proof | `done-local/acceptance-gated` | closed 2026-08-11；no network/mutation；sender-name residual closed by `.17.2.2` |
| `W6.a6.17.2.2-sender-display-name-cache-parity` | code/verification | shared SDK contact cache + sender resolver + conversation facade | success-only `friendships/users` snapshot、shared queue、RN remark/group/user priority、no ID guessing | SDK 52/163 + all-runtime typecheck + build:web/H5 verify + authenticated 7-contact/19-conversation zero-console proof | `done-local/acceptance-gated` | closed 2026-08-11；no message mutation；real unread mention sample remains `.17.3` gate |
| `W6.a6.17.3-group-mention-acceptance` | authorized verification | deployment + H5 + SDK | one disposable member mention and one permission-valid all mention -> Gateway -> SQLite/realtime/list-back | Network/result + top-level mentions/body targets + stable IDs/status/cache proof | `blocked-mutation-authorization` | explicit disposable group and action-time send authorization required |
| `W6.a6.18.1-chat-text-search` | code/verification | shared SDK message repository/sync + H5 chat/router | current-account visible-text search、RN result list、stable client-ID cached-window focus | SDK Web 52/164 + all-runtime typecheck/boundary/build:web + H5 38/126/verify + authenticated 458px real-cache deep-link/reload proof | `done-local/acceptance-gated` | closed 2026-08-11；no Gateway/mutation/send；history/theme/desktop matrix remains gated |
| `W6.a6.18.2.1-shared-indexed-search-range` | contract/code/verification | shared SDK message repository/sync | current-account inclusive-lower/exclusive-upper send-time query plus existing content-type query, without Gateway I/O | real sql.js boundary test + SDK Web 52/165 + all-runtime typecheck/boundary/build:web | `done-local/acceptance-gated` | closed 2026-08-11；no RN service/runtime or desktop build-script change |
| `W6.a6.18.2.2-h5-date-media-file-index` | code/verification | H5 chat/router + existing media preview owner | RN date calendar、media filters/month groups、file groups and stable-ID return without page history scans | H5 39/129 + 466 assets + build/verify + authenticated 458px real-cache browser proof | `done-local/acceptance-gated` | closed 2026-08-11；no Gateway/download/mutation/send；history/theme/desktop matrix remains gated |
| `W6.a6.18.2.3-chat-settings-entry` | contract/code/verification | RN single/group chat settings + H5 router | settings-owned “查看聊天记录/查找聊天内容” entry routes into the same search owner | RN source mapping + H5 40/132 + full verify + authenticated single/group deep-link browser proof | `done-local/acceptance-gated` | closed 2026-08-11；only existing cache/profile/search facades render，unsupported mutation rows remain omitted |
| `W6.a6.18.3-chat-settings-capability-contract-freeze` | contract/design | RN single/group settings + shared SDK/runtime | freeze mute、pin、auto-delete、clear-history and group-management ownership/failure/authorization boundaries | RN service/Gateway/cache/realtime trace + owner and destructive-action review | `done` | closed 2026-08-11；three-operation `.18.3.1` split from lifecycle/destructive/group domains |
| `W6.a6.18.3.1-shared-conversation-setting-core` | code/verification | shared conversation sync + RN/H5 composition | neutral setting detail、mute、pin facade with RN/Web actual callers and success-only SQLite convergence | SDK focused 13 + all-runtime typecheck/build:rn/build:web + RN tsc/4 caller tests + H5 full verify | `converged/mutation-acceptance-gated` | RN legacy Gateway/local/fallback paths deleted；real toggle remains gated |
| `W6.a6.18.3.2-auto-delete-contract` | contract/design | shared message/conversation sync + realtime | freeze authoritative read、enum update、type1701、permission、setting/cache and new-message lifecycle semantics | RN/Gateway/realtime/schema trace + anti-fake review | `done` | closed 2026-08-11；server owns expiry/deletion，client never retroactively purges history |
| `W6.a6.18.3.2.1-shared-auto-delete-core` | code/verification | shared conversation/message sync + RN/H5 composition | Conversation metadata、schema v11、strict detail/update、type1701 convergence and RN/Web actual callers | SDK focused 13 + all-runtime typecheck/build:rn/build:web + RN tsc/auto-delete caller test + H5 full verify | `converged/mutation-acceptance-gated` | RN legacy detail/update/cache path deleted；real update and second-account realtime remain gated |
| `W6.a6.18.3.2.2-h5-auto-delete-route` | code/verification | H5 chat settings/router/message projection | RN options route、single/group role gate、explicit confirm and operator-aware type1701 wording | H5 focused 4/16 + typecheck/build + authenticated 458px read-only browser proof | `done-local/mutation-acceptance-gated` | closed 2026-08-11；no real confirm；hidden protocol values fail closed |
| `W6.a6.12.1.2-message-edit-delete-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | neutral message-mutation composition、RN delete/edit actual-call adoption、legacy RN payload compatibility and obsolete path deletion | SDK 58/179 + all-runtime typecheck + build:rn/build:web + RN tsc/9 focused tests + H5 55/174 verify | `converged/mutation-acceptance-gated` | closed 2026-08-11；real mutations retain explicit authorization gates |
| `W6.a6.12.1.3-message-forward-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | RN forward callers consume one shared business owner while preserving platform-provided optimistic IDs and RN presentation/events | SDK 58/181 + forward guard/sql.js + all-runtime boundary/build:rn/build:web + RN tsc/10 focused + H5 55/176 verify | `converged/mutation-acceptance-gated` | closed 2026-08-11；real partial-result remains external gate；`build:package:desktop:web` unchanged |
| `W6.a6.12.1.4-group-mention-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | RN group-member/mention production callers consume shared identity、permission、Gateway body and cache owners | SDK 58/184 + all-runtime boundary/build + RN tsc/13 group-detail + 3 mention tests + H5 55/179 verify | `converged/mutation-acceptance-gated` | closed 2026-08-11；real type106 send、second-account realtime/list-back remain gated；no production fallback |
| `W6.a6.12.1.5-message-search-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | RN chat-message search production callers consume shared query validation、SQLite filtering and pagination owner | SDK 58/184 + all-runtime boundary/build:rn/build:web + RN tsc/8 search-service + 28 search-page tests + H5 55/179 verify | `converged/acceptance-gated` | closed 2026-08-11；old RN Repository/filter path deleted；cache-only read；`build:package:desktop:web` unchanged |
| `W6.a6.12.1.6-realtime-message-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web realtime consumers | RN/Web production callers consume shared normalization、gap recovery and cache convergence while RN retains RTC/AppState/notification/UI projection | SDK sync 35/126 + Web 57/194 + all-runtime typecheck + build:rn/build:web + RN tsc/141 + H5 assets/typecheck/build | `converged/acceptance-gated` | closed 2026-08-11；RN duplicate parser and three gap/cache owners deleted；real dual-account WS/disconnect/list-back gated；`build:package:desktop:web` unchanged |
| `W6.a6.18.3.3-clear-history-contract-trace` | contract/design | RN clear-history + shared SDK/Gateway/cache/realtime | freeze destructive target、scope、response、cache and realtime/list-back semantics before any UI/mutation | RN/Gateway/schema/realtime backward trace + destructive-action review | `done-read-only` | closed 2026-08-11；no clear action；old OpenIM/friend-delete/group-leave paths excluded |
| `W6.a6.18.3.3.1-shared-clear-history-core` | code/verification | shared conversation/message sync + schema/repository/realtime | schema v12 cursor/list-hidden、stable operation ID、boundary-safe success-only clear and type2102 control convergence | clear 4/4 + sync 36/130 real sql.js、all-runtime typecheck/boundary、build:rn/build:web、RN tsc、H5 typecheck/build | `done-local/shared-core-ready` | closed 2026-08-12；uint64 max、failure、concurrency、idempotency and late-message guards passed；no real destructive request |
| `W6.a6.18.3.3.2-clear-history-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/H5 clear callers | RN action/type2102 and H5 settings action consume one clear facade；remove legacy whole-delete/control business paths | SDK 8 focused + 56/194 sync/Web、all-runtime typecheck/build:rn/build:web + RN tsc/126 + H5 6 focused/typecheck/build/browser sheets；no real mutation | `converged/acceptance-gated` | closed 2026-08-12；all-members uses shared role snapshot/helper；real destructive/list-back acceptance gated；`build:package:desktop:web` unchanged |
| `W6.a6.18.3.4-h5-group-introduction-readonly` | code/verification | H5 group settings/router + existing shared group facade | RN-ordered introduction row、empty subtitle/read detail、deep-link/back and visible route/data failure without duplicate mutation | H5 focused 5/5 + 54/177；SDK Web 70/272；466 assets/typecheck/build + authenticated 567/390px real-group proof | `done-local/read-only-accepted` | closed 2026-08-12；no SDK/RN source or mutation；non-empty/edit/device/cross-browser remain gated |
| `W6.a6.18.3.5-shared-group-announcement-readonly` | code/convergence/verification | shared joined-group facade + H5 settings/router | announcement/version/edit-permission DTO、RN owner/admin entry parity and shared text-detail route without raw payload access | SDK 4/4 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc；H5 6/6 + SDK Web 70/272、466 assets/typecheck/build + authenticated owner/admin proof | `done-local/read-only-accepted` | closed 2026-08-12；no update/read-mark/send；ordinary-member/non-empty/device/cross-browser remain gated |
| `W6.a6.18.3.6-shared-self-group-nickname` | code/convergence/verification | shared group-member facade + H5 settings dialog | current-auth identity、24-char validation、Gateway success-only member upsert and RN-semantic H5 editor | SDK group-member 9/9 + Web 70/274 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc/source boundary；H5 7/7 + 466 assets/typecheck/build/full verify | `done-local/mutation-acceptance-gated` | closed 2026-08-12；no real save/realtime/list-back；browser open/cancel/layout and RN guarded consumer convergence remain gated |
| `W6.a6.18.3.7-shared-group-card` | code/convergence/verification | shared contact facade + RN composition + H5 group settings/router | friend target filtering、canonical type108 group card、optional type101 note and one shared send/cache state machine | SDK contact-actions 12/12 + RN/Web typecheck/build:rn/build:web；RN tsc + 43 focused；H5 9/9 + typecheck/build；authenticated search/select/cancel/480px proof | `converged/local-send-acceptance-gated` | closed 2026-08-12；no real send/note/partial-failure/list-back；`build:package:desktop:web` unchanged |
| `W6.a6.18.3.8-shared-group-profile-name` | code/convergence/verification | shared group facade + RN composition + H5 group settings/router | current-account owner/admin permission、name validation、strict Gateway response and success-only group merge with RN name-only caller | SDK joined-group 6/6 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc + 126 service/5 UI；H5 10/10 + full verify 70/278、466 assets/build + authenticated editor cancel/567px proof | `converged/local-mutation-acceptance-gated` | closed 2026-08-12；no real save/copy/type1520/list-back；other group profile fields unchanged；`build:package:desktop:web` untouched |
| `W6.a6.18.3.9-shared-group-profile-avatar` | code/convergence/verification | shared group facade + RN composition + H5 platform crop | owner/admin preflight、static image/10MB upload、strict Gateway avatar response、success-only group merge and RN avatar-only caller | SDK 73/285 + all-runtime typecheck/boundary/build:rn/build:web；RN 127 service；H5 4 focused + typecheck/build + authenticated local crop/cancel/567px proof | `converged/local-mutation-acceptance-gated` | closed 2026-08-12；no real upload/update/type1502/list-back；introduction later converged in `.18.3.10`，announcement/combined remain registered；`build:package:desktop:web` untouched |
| `W6.a6.18.3.10-shared-group-introduction` | code/convergence/verification | shared group facade + RN composition + H5 text-detail route | owner/admin、non-empty trim/500、strict Gateway description response、success-only group merge and RN introduction-only caller | SDK 74/287 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc + 128 service；H5 full verify 71/282、466 assets/743 modules + authenticated open/cancel/567px proof | `converged/local-mutation-acceptance-gated` | closed 2026-08-12；no real update/type1521/list-back；announcement/combined path registered；`build:package:desktop:web` untouched |
| `W6.a6.18.3.11-shared-group-announcement` | code/convergence/verification | shared group facade + RN composition + H5 text-detail/chat banner | non-empty trim/1000、announcement permission、update-before-type101、partial failure、authoritative read version and type1519 cache convergence | SDK Web 73/290 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc + 146 focused；H5 466 assets/full verify/748 modules + authenticated view/editor/confirm/567px proof | `converged/local-mutation-acceptance-gated` | closed 2026-08-12；no real update/send/read-mark/type1519/list-back；combined path remains registered；`build:package:desktop:web` untouched |
| `W6.a6.18.3.12-group-profile-combined-compat-exit` | architecture/refactor/verification | RN group-profile composition + shared SDK consumer contract | prove zero combined caller、enforce single-field XOR、reject announcement through generic entry and delete Gateway/OpenIM fallback | SDK all-runtime typecheck/boundary + profile/announcement 7/7；RN tsc + service 128/128；H5 typecheck + related view 12/12 | `converged/local` | closed 2026-08-12；no mutation/send/read/list-back；`build:package:desktop:web` untouched |
| `W6.a6.18.3.13-group-management-mutation-contract-audit` | contract/read-only | RN group-management callers + SDK transport + H5 routes | freeze caller/owner/permission/cache/realtime/destructive boundaries and split max-three-operation slices | source/API/fallback trace + `docs/runtime-contracts/group-management-mutations.md` | `done-read-only` | closed 2026-08-12；SDK shared mutation owner absent、H5 caller 0、RN duplicate-write risks registered；no runtime source or real mutation；`build:package:desktop:web` untouched |
| `W6.a6.18.3.13.1-shared-group-management-permissions` | code/convergence/read-only | shared permission resolver + RN helper + H5 joined-group/settings | explicit capability precedence、role fallback、fail-closed and zero platform raw permission parser | SDK all-runtime + 11/11；RN tsc + 29/29；H5 full verify SDK Web 74/293、466 assets、749 modules + focused 18/18 | `converged/read-only` | closed 2026-08-12；no mutation/SQLite write；H5 production chat/conversation permissions consume joined-group DTO；`build:package:desktop:web` untouched |
| `W6.closeout` | verification/docs | RN + web app + sdk + docs | local regression floor、migrated route parity evidence、duplicate-owner audit and residual ledger | SDK all-runtime pass + H5 verify 58/200 + RN tsc + ChatDetail 166/166 + RN full 164/164 suites、1369/1369 tests | `done-local/acceptance-gated` | local P0/P1 zero；external Gateway/destructive/dual-account WS/RTC/cross-browser gates remain explicit |
| `W6.a6.19-chat-message-presentation-parity` | code/verification | shared SDK group display-name resolver + H5 chat projection/layout | RN sender identity placement、mention display projection、180px image ratio、decode-failure-only OSS JPEG fallback、duration-based voice width and two-line forward origin | H5 focused 5/22 + SDK Web 59/204 + SDK sender 1/4 + 466 assets/all-runtime typecheck/build:rn/build:web + authenticated real DOM geometry | `done-local/acceptance-gated` | closed 2026-08-12；HEIF-mislabeled JPG root cause fixed without converting normal GIF；role-label real sample、signed OSS and cross-browser media remain gated；no mutation/send/download；`build:package:desktop:web` unchanged |

## Latest Closed H5 Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.3-custom-emoji-add-reorder` |
| production_flow | type115 stable ID -> long-press/right-click action -> shared `customEmojis.add`；manager selected group -> Pointer drag -> browser stable-ID order |
| canonical_owner | SDK owns add/member/cache；H5 owns explicit action UI and `im28.chat.customEmoji.order` presentation preference only |
| expected_deliverable | type115-only collection action、success/error feedback、touch/mouse selected-stack reorder、ordered panel/manager projection |
| verification_shape | H5 24/85 + SDK 40/126 regression basis + typecheck/build/assets + authenticated 458x786 select/move-tray/cancel proof |
| stop_condition | no injected type115 data、real add、order drop/commit、upload/delete/send |
| closeout | manager selected one real cached item and opened the RN-style move tray before cancel；current conversation has no type115 message，so collection-menu visual remains acceptance-gated |

## Previous Closed H5 Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.2-h5-custom-emoji-manager` |
| production_flow | chat add tile -> conversation-scoped manager route -> cache-first list -> explicit file/create or select/confirm/delete -> shared SDK mutation facade |
| canonical_owner | SDK owns validation/upload/Gateway/cache membership；H5 owns route/file input/preview/selection/five-column UI |
| expected_deliverable | add tile、React Router manager、image picker、preview、organize selection and confirm-delete |
| verification_shape | H5 23/80 + SDK 40/126 + typecheck/build:all/package sync + build/assets + authenticated 458x786 read-only proof |
| stop_condition | no real file selection/mutation/send；no message collection or local reorder |
| closeout | one real cached item and add tile rendered as equal five-column cells with no horizontal overflow；desktop/light and real mutation remain gated |

## Latest Closed Shared Mutation Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.1-shared-custom-emoji-mutations` |
| primary_path | `WebIMSync.customEmojis.create/add/delete -> GatewayHTTPClient -> CustomEmojiRepository` through shared upload port |
| convergence | create/add refresh and atomically replace full membership only after Gateway success；delete removes local rows only after Gateway success；failure preserves membership |
| closeout | SDK Web 40/126、core Gateway contracts、all-runtime typecheck/build:all and generated-package sync passed |
| residual_gate | `.3.3` implemented-local/acceptance-gated；real mutations remain authorization-gated |

## Earlier Closed H5 Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.2-h5-custom-emoji-panel` |
| production_flow | shared account cache/sync -> third heart tab -> recent/all grid -> shared type115 send caller/read projection |
| canonical_owner | SDK owns membership/cache/body/state；H5 owns RN UI、safe image and recent-ID preference only |
| expected_deliverable | third tab、cache-first refresh、five-column recent/all、safe direct-send caller |
| verification_shape | H5 22/77 + SDK 40/121 + typecheck/build/assets + real-list mobile/desktop dark proof |
| stop_condition | no add tile/manager/upload/add/delete/reorder/message-action save or real send |
| closeout | one real list item rendered in strict five-column responsive grid；no click/transmission；light proof remains acceptance-gated |

## Latest Closed Shared Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.1-shared-custom-emoji-core` |
| primary_path | Gateway list -> strict mapper -> schema v8 `custom_emojis` -> `customEmojis.listCached/sync`；`messages.sendCustomEmoji` -> shared optimistic state |
| convergence | SDK is the only DTO/cache/send owner；H5 generated package contains dist only；RN manager metadata remains registered compatibility work |
| closeout | SDK 5 focused + Web 40/121、core Gateway contracts、all-runtime typecheck、build:web package sync and H5 consumer gates passed |
| residual_gate | manager mutations `.3` active；authorized Network/SQLite/realtime/list-back send proof `.4` blocked-external |

## Latest Closed Contract Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.6-chat-illustrated-emoji-contract-freeze` |
| evidence | RN production source、Gateway generated/hand types、SDK mapper/sync/repository and H5 asset/UI gap traced backward；135 unique IDs、133 fallback values、135 mirrored PNGs verified |
| verdict | contract `done`；Gateway schema `runtime-chain-partial`；SDK/H5 implementation `🟡`；real send `🟡 acceptance-gated` |
| anti_shortcut | omitted H5 tab is honest missing capability；no mock entity、fake success、Unicode identity inference or second page transport exists |

## Previous Closed Local Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.5-chat-system-emoji-core` |
| production_flow | RN composer emoji toggle -> system panel -> insert/replace/delete draft -> existing text submit |
| primary_path | `ChatComposer` panel owner -> pure draft editing helper -> current text draft -> existing `sendText`; browser preference adapter owns recent MRU only |
| closeout | exact 52-entry list、7-column panel、selection replacement、full grapheme delete and 21-item MRU passed H5 17/65、SDK 36/111、466 assets、full verify/build and authenticated dual-viewport browser proof；no transmission occurred |
| residual_gate | real text send remains authorization-gated；illustrated/custom entity transport is not part of this slice |

## Previous Closed Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.4-chat-voice-send-core` |
| production_flow | RN voice mode -> hold recorder -> short/cancel/send decision -> upload credential -> OSS multipart -> Gateway audio message -> local repositories |
| public_caller | H5 only calls `WebIMSync.messages.sendAudio`; no page transport、repository、OSS body or recorder format mapping |
| recorder_contract | browser adapter chooses a supported audio MIME、owns stream/track/recorder cleanup and returns one `File`；permission/unsupported/error paths reject visibly |
| interaction_contract | pointer hold starts；upward delta `>=56px` cancels；release below `2s` rejects；`60s` auto-stops and sends；route exit cancels |
| state_contract | reuse shared `sending -> sent/failed` state machine and stable client ID across upload/Gateway stages |
| body_contract | `audio.media_id/url/duration_seconds/size_bytes`；content type `103`；duration is integer `1..60` |
| stop_condition | no real permission prompt/recording/upload/send、audio picker、persistent waveform、played/read/auto-next、upload progress/cancel、retry、download or RTC |
| closeout | one browser recorder owner and one shared audio send/state owner are live；H5 15/56、SDK 36/111 and local gates passed；voice mode was layout-tested without requesting microphone access or transmitting media |

## Earlier Closed Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.3-chat-album-video-send-core` |
| production_flow | RN mixed album -> media validation -> video send -> upload credential -> OSS multipart -> Gateway video message -> local repositories |
| public_caller | H5 only calls `WebIMSync.messages.sendVideo`; no page transport、repository or OSS body construction |
| metadata_contract | browser reads duration/videoWidth/videoHeight before send；metadata failure is visible and prevents upload |
| state_contract | reuse existing shared `sending -> sent/failed` state machine and stable client ID across upload/Gateway stages |
| body_contract | `media_id/url/thumbnail_url/duration_seconds/width/height/size_bytes`；snapshot query matches RN `t_7000,f_jpg,...,m_fast,ar_auto` |
| selection_contract | image/video total max 12；image 10 MB；video 500 MB；sequential order；unsupported MIME rejects the full selection before I/O |
| stop_condition | no draft caption/pending attachment、camera、audio/voice、progress/cancel、retry、local snapshot generation、real unauthorized send or RTC |
| closeout | shared video limit/body/snapshot/state owner and default H5 mixed-album caller are live；H5 13/50、SDK 35/109 and full local gates passed；no real upload/send was executed without authorization |

## Earlier Closed Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.2-chat-image-file-send-core` |
| production_flow | RN attachment action -> platform picker -> upload credential -> OSS multipart upload -> Gateway message -> local message/conversation repositories |
| public_caller | H5 only calls `WebIMSync.messages.sendImage/sendFile`; no page transport or repository import |
| platform_port | opaque upload source + metadata enters shared sync；Web adapter alone validates `Blob/File` and constructs `FormData` |
| state_contract | persist local `sending` before upload；map matching client ID to `sent`；credential/upload/send failure updates the same row to `failed` and rethrows |
| selection_contract | image input accepts browser-decodable image kinds、max 12、10 MB each；file input sends one ordinary file、100 MB max；sequential ordering |
| stop_condition | no draft caption/pending attachment、camera、video/audio/voice、progress/cancel、retry、download/preview expansion or RTC |
| acceptance_gate | approved authenticated account must prove credential、OSS 200、Gateway send、SQLite/cache projection and responsive light/dark behavior |

| closeout | shared state/upload owners and default H5 callers are live；no real message was transmitted during proof without explicit authorization |

## Closed Slice W6.a5.2.15

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.15-group-members-route-parity` |
| goal | 将 RN 群设置的全部成员入口、完整成员页、搜索/索引/角色和资料返回迁移为 React Router 子路由 |
| source_anchor | RN `GroupSettingsScreen -> GroupMembersScreen`；shared group-member cache/sync/display-name facade |
| target_owner | H5 chat settings/member presentation；SDK 继续唯一持有成员数据和身份优先级 |
| verification_shape | focused 4/15、typecheck/build/full verify、真实 4-row group/search/profile-back、567/390px zero overflow/console |
| stop_condition | no presence、member mutation、friend apply、page Gateway/SQL、SDK/RN source or RTC |
| residual_seed | large group、offline cache、physical touch refresh、Safari/Firefox and authorized group management remain gated |

## Closed Slice W6.a6.1

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.1-chat-media-read-core` |
| goal | 将 cache 中真实图片、语音、视频消息接入 RN 对应的浏览器只读媒体交互 |
| source_anchor | RN media branches/previews/sound hook；Gateway generated media schemas |
| target_owner | H5 chat message projection + one feature-local media controller + image/video overlays |
| expected_deliverable | safe real URL actions、one-active-audio lifecycle、full-screen image/video surfaces、keyboard/route cleanup |
| verification_shape | message/media contract tests + full H5 app tests + SDK regression + typecheck/build/verify + guest guard |
| stop_condition | no direct API/cache/mock URL、download/save/upload/send/record/read-sync/auto-next/retry/RTC |
| residual_seed | approved account must prove real image/audio/video playback and responsive theme behavior；all deferred operations require separate contracts |

## Closed Slice W6.a5.2.14

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.14-contact-user-search-core` |
| goal | 建立 `/contacts` 搜索入口 -> `/contacts/search` -> 本地好友匹配/真实 Gateway 用户搜索 -> 既有联系人资料页的唯一主链 |
| source_anchor | RN `ContactListScreen -> ContactSearchScreen`；48px search header、local hint、server-search row、72px result row and highlighted fields |
| target_owner | existing Web `contacts` sync facade + contact search page/App route；`peerProfile` remains the sole profile/action owner |
| expected_deliverable | authenticated `searchUsers` normalization/self-filter/dedupe、local friend projection、RN core presentation、stable SPA navigation |
| verification_shape | facade auth/normalization/dedupe/failure tests + pure view tests + typecheck/build/verify + mobile/desktop light/dark/history/guest smoke |
| stop_condition | no group search/join、search-page friend mutation、page transport、mock result、fake success、duplicate peer profile or new search cache |
| residual_seed | approved account must prove local/remote result and profile navigation；group search/join remains separately bounded |

## Closed Slice W6.a5.2.13

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.13-contact-profile-core` |
| goal | 建立 contact row -> `/contacts/users/:userID` -> profile read -> real direct conversation/add-friend action 的唯一主链 |
| source_anchor | RN 120px avatar、centered profile header、ID pill、bio/action card and primary CTA；shared user/friend/conversation operations |
| target_owner | Web sync peer-profile facade + contact profile page + ContactRow/App route；shared clients/repositories remain endpoint/cache owners |
| expected_deliverable | friend/stranger/self normalization、RN core presentation、authenticated route、real conversation persistence/navigation and success-only friend application |
| verification_shape | auth/normalization/open-persist/apply/failure unit tests + view tests + typecheck/build/verify + mobile/desktop light/dark/history/guest smoke |
| stop_condition | no RTC/presence/remark/star/delete/blacklist/common groups/share/group-member context、page transport、mock data、fake success or duplicate persistence |
| residual_seed | authenticated friend/self/unknown-error and Chromium visual/history proof passed；real stranger、conversation persistence and friend-application Network result remain separately gated |

### Completed W6.a5.2.3 Migration Card

| field | frozen value |
| :--- | :--- |
| feature_slice | `/calls` 通话记录主列表，不含 RTC 通话建立与详情页 |
| phase | `W6.a5.2.3` |
| production_flow | RN/Web UI -> platform composition -> shared `createIMCallRecordSync` -> Gateway + account-scoped `call_records` SQLite cache |
| operations | `listRemote`; `listCached`; `sync`; `getDetail`; `delete`; `getPending`; `save`; `convergeTerminalSignals` |
| current_status | `done-local/mutation-gated`；RN/Web list/detail/delete 共用 shared facade，RN pending/realtime terminal 也已收敛 |
| must_have_fields | `call_id`; `conversation_id`; `direction`; `user_id`; `nickname`; `avatar_url`; `call_type`; `status`; `answer_status`; `started_at`; `answered_at`; `ended_at` |
| adapters | existing authenticated `GatewayHTTPClient`; account-scoped `DatabaseAdapter`; shared sync mutation queue |
| open_gaps | Web RTC、真实删除、双账号通话终结事件/list-back 验收仍待完成；RN 资料补齐作为显式平台 adapter 保留，不得在 Web 页面复制 |

`call_records` schema/CRUD 已归 shared SDK 所有，并通过增量补列兼容旧 RN 表；H5 页面只能通过 `WebIMSync.calls` 访问该能力。

## Deferred Residuals

| item | reason_not_active | likely_owner | candidate_verification |
| :--- | :--- | :--- | :--- |
| Real Gateway smoke | read-only login/restore/data/account-isolation and dual WebSocket online passed；offline SQLite hit and realtime delivery lack authoritative observation | deployment + runtime owner | run an explicitly authorized dual-account realtime event and a non-destructive offline-cache harness |
| authenticated conversation UI smoke | real account 1 restored 19 visible rows/25 unread and account 2 loaded an independent list；cache-vs-remote source was not isolated | `apps/web/src/pages/conversations` | offline cache-first evidence plus chat-back/realtime list-back smoke |
| authenticated chat UI smoke | authenticated history/read surfaces have prior local proof；this slice intentionally sent no message | `apps/web/src/pages/chat` | explicitly authorized send/realtime/list-back flow only |
| Worker SQL runtime | `done-local`: production App Worker、RPC/fatal parity 与 Vite build passed | storage worker | real-browser DB open evidence joins W5.a3 |
| multi-tab writer | `done-local/gated-browser`: lifecycle owner 已接入，缺真实浏览器矩阵 | storage runtime | three-browser two-tab concurrency test |
| Remaining RN route surfaces | prior cores/settings/onboarding core 已移除 generic 视觉；valid onboarding context、network/cache remain gated | `apps/web/src/app` + feature owners | approved onboarding real flow；then continue explicit blocked/acceptance ledger |
| Onboarding valid context | current authenticated session has no matching onboarding marker；不得伪造 marker 或创建/修改账号数据 | `apps/web/src/pages/login` + deployment owner | approved new account validates register/invite/profile Network/result and responsive light/dark/history |
| Settings final acceptance | real reads plus Chromium 390x844/760x900 light/dark/history/reload passed；notification write and Safari/Firefox absent；RN/H5 title semantic debt remains shared | `apps/web/src/pages/me/settings` + Web runtime | approved update Network/result + coordinated cross-client label decision + Safari/Firefox matrix |
| Settings permission/network/cache/version | real permission/version reads plus Chromium responsive/theme proof passed；network browser-blocked；cache storage-blocked | settings/runtime/storage/deployment owners | real update/write、update-available and Safari/Firefox acceptance；cache awaits disposable-data separation |
| Friend applications final acceptance | real 5-row historical list and Chromium responsive/theme/history/reload passed；no accept was attempted | `apps/web/src/pages/contacts` + Web SDK friend-applications facade | pending-state sample；accept still requires action-time authorization |
| Group applications final acceptance | real empty-state and Chromium responsive/theme/history/reload passed；no accept/reject was attempted | `apps/web/src/pages/contacts` + Web SDK group-applications facade | non-empty owner/admin/detail data；handling still requires action-time authorization |
| Joined groups final acceptance | authenticated 11-row list/full-sync projection、role badges、name/ID/unknown search and Chromium responsive/theme/history/reload passed | `apps/web/src/pages/contacts` + Web SDK groups facade | conversation-open persistence、offline cache isolation and Safari/Firefox remain |
| Contact profile final acceptance | authenticated friend/self/unknown-error and Chromium responsive/history proof passed | `apps/web/src/pages/contacts` + Web SDK `peerProfile` facade | real stranger、conversation open/persistence and authorized friend apply remain |
| Contact search final acceptance | known local/Gateway result、self filtering、unknown no-result and Chromium responsive proof passed | `apps/web/src/pages/contacts` + Web SDK `contacts` facade | transport/business failure and Safari/Firefox remain |
| Me final acceptance | `/me` authenticated 390x844/760x900 light/dark/history proof passed；no logout was attempted | `apps/web/src/pages/me` + Web sync/runtime | real logout Network/session/DB cleanup proof；Safari/Firefox joins W5 matrix |
| Calls real-account proof | real 2-row filters and Chromium responsive light/dark proof passed；no delete was attempted | `apps/web/src/pages/calls` + Web SDK calls facade | non-missed/duration data；delete still requires action-time authorization |
| Blacklist real-account proof | authenticated empty/search-empty、system-light/dark、permission entry、direct/history/reload and zero-overflow/zero-console passed；no remove was attempted | `apps/web/src/pages/me` + Web SDK blacklist facade | non-empty enrichment/search、approved remove Network/result and Safari/Firefox；remove still requires action-time authorization |
| Verification-code send | shared Gateway OpenAPI 无 operation；不得用 countdown/fake success 替代 | shared SDK/Gateway contract owner | backend contract available or product explicitly accepts fixed-code environment |
| Account-security final acceptance | account set/reset 本地链路已闭合，但真实 mutation 与 dark 证据未执行；contact mutation 缺 send-code contract | `apps/web/src/pages/me/security` + Web runtime | approved real set/reset Network/result/session cleanup + dark matrix；contact waits for real code-send contract |
| upstream raw WS log | `resolved 2026-08-09`: canonical owner 已清除原始 payload 日志 | `im28-sdk` | shared SDK test + H5 `npm run verify` passed |
# Current Workset

## W6.a6.20.24 Chat Sender Avatar Mention Gesture

- status: `closed-local/browser-data-gated`
- owner chain: `ChatMessageList -> ChatGroupSenderAvatar -> one-shot mention request -> ChatComposer -> useChatComposerMentions -> existing mention send flow`。
- completed: 可见 incoming 群头像按 RN 500ms/8px 长按提及，桌面右键同义；普通点击继续走资料 SPA；提及复用 shared 显示名，追加 `@昵称 ` 或替换末尾查询，并登记稳定 member selection。
- fail-closed: outgoing/单聊/系统消息、缺失成员、自身、编辑态和引用态都不产生提及；动作不直接发送、不写 SQLite、不新增 Gateway/OpenIM 分支。
- structure: 新增 64 行头像展示 owner 与 111 行手势 owner；`ChatMessageBubble` 收敛至 281 行，避免资料/手势逻辑继续膨胀。
- verification: focused 2 files/10 tests；full Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1122-module build；cleanup P0/P1 zero。
- browser gate: 匿名标签验证 dev/登录守卫/1280px 零 overflow；未伪造 sessionStorage，真实 incoming 群头像长按与草稿结果仍待已登录样本。
- protected: `im28-phone` clean；SDK source 未因本片调整；未运行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，按 RN 页面、动作、状态重新生成剩余缺口清单。

## W6.a6.20.26 Chat Custom Emoji Bubble Preview

- status: `closed-local/browser-data-gated`。
- owner chain: `Message -> getChatMessageView -> ChatCustomEmojiMessageContent -> existing ChatMediaInteractionProvider -> ChatMediaPreviewOverlay`。
- completed: type115 快照尺寸映射、旧消息自然尺寸探测、180px 比例气泡、非法 URL/解码失败 fail-closed、无工具栏纯图片预览。
- preserved: 普通图片保存、表情发送/收藏/manager/recent、SDK/Gateway/SQLite 和 RN business 均未改变。
- verification: focused 3 files/15 tests；full Web SDK 89 files/371 tests；466 assets；runtime boundary、SDK/H5 typecheck、1125-module build；真实 412px group route zero overflow/error/broken image。
- browser gate: 当前真实群聊无 type115，未注入假消息或发送测试消息；横/竖资源与点击关闭仍待自然样本。
- protected: `im28-phone` clean；仅执行 `build:web/sync:web`；未运行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，继续选择不需 RN 业务改动的确定性缺口。

## W6.a6.20.27 Chat Initial Unread Navigation

- status: `closed-local/browser-data-gated`。
- owner chain: `Conversation.lastReadSeq + Message[] -> SDK getIMInitialUnreadNavigation -> H5 useChatUnreadNavigation -> ChatMessageList`。
- completed: 精确 uint64 incoming 未读、type1201 边界、server/client 双身份、最后已读锚点、未读分割线/浮层、80% 可见度和用户离开最新端后的滚动保护。
- fail-closed: 非法/缺失边界不制造未读；搜索定位不与首入页定位竞争；只读滚动不写 SQLite/Gateway，不调用 markRead/read receipt。
- verification: SDK focused 1/3、H5 focused 2/8、full Web SDK 90/374、466 assets、runtime boundary、SDK RN/Web/Desktop 与 H5 typecheck、1127-module build；cleanup P0/P1 zero。
- browser gate: 当前真实三个会话均无未读角标；412px 证实零误画、latest edge=0、bodyWidth=viewportWidth=412、系统消息稳定身份和零 console error；非零样本不得伪造。
- protected: `im28-phone` worktree clean；仅执行 `build:web/sync:web`；未执行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，继续按 RN page/action/state 选择不需 RN 业务改动的确定性残余。

## W6.a6.20.28 Chat Visible Unread Read Convergence

- status: `closed-local/browser-data-gated`。
- owner chain: `DOM/native visible stable IDs -> SDK getIMVisibleUnreadReadSeq -> converged conversations.markRead -> Gateway -> success-only ConversationRepository`。
- completed: 80% 可见 incoming 最高 seq、短列表测量放行、长列表用户滚动/显式入口/最新端 realtime 放行、单调去重与失败重试；partial read 不再无条件清零缓存角标。
- fail-closed: 无会话 unread 事实、未定位/未测量、初始长列表程序化滚动、outgoing、非法 seq 和搜索定位均不提交；Gateway 失败不更新会话。
- verification: SDK focused 2/8、H5 focused 2/4、full Web SDK 90/376、466 assets、runtime boundary、SDK RN/Web/Desktop 与 H5 typecheck、1128-module build；cleanup P0/P1 zero。
- browser gate: 当前真实三个会话无未读；412px route 零误画/overflow，clean reload 后零 error；browser 隔离环境无 resource timing，未声称 Network 零请求证据。
- protected: `im28-phone` worktree clean，RN business/caller 未改；仅 `build:web/sync:web`；未执行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，从剩余 chat history pagination/sticky date 或其他无 RN 改动缺口继续。

## W6.a6.20.23 Chat Sender Avatar Profile Entry

- status: `closed-local/browser-data-gated`
- owner chain: `ChatMessageList -> ChatMessageBubble avatar Link -> ContactProfilePage -> W6.a6.20.22 validated group context`。
- completed: incoming group message 的可见分组头像改为 React Router Link；只携带 stable user/conversation IDs 与当前聊天 backHref；空身份 fail-closed；资料页新增当前聊天返回白名单。
- verification: focused 2 files/15 tests；full Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1120-module build；cleanup P0/P1 zero。
- browser gate: 真实 412px 群聊仅含系统创建消息，无 incoming sender avatar 样本；页面零 overflow，未发送测试消息。
- accepted debt: 仓库无 `scripts/check-convergence.sh`；真实头像点击/history 和群消息 mute profile context 待后续样本/授权。
- protected: `im28-phone` business clean；SDK source 未改；未运行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，继续选择不需要 RN 业务改动、非破坏且有真实样本的缺口。

## W6.a6.20.22 Group Member Restricted Profile Context

- status: `closed-local/browser-readonly-pass/data-gated`
- owner chain: `React Router candidate -> WebIMSync.conversations -> WebIMSync.groups -> WebIMSync.groupMembers -> resolveIMGroupMemberDisplayName -> ContactProfilePage`
- completed: 群设置预览和完整成员列表传递稳定会话上下文；资料页重新校验真实群/成员；明确禁止互加时隐藏关系动作与敏感字段；加载/失败 fail-closed；本人保持完整资料。
- verification: focused 3 files/22 tests；full Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1120-module build；真实允许互加群 412px 只读 smoke 通过。
- gated: 真实禁止互加群样本、Safari/Firefox history state、群消息头像携带的禁言上下文；不制造群配置 mutation。
- protected: `im28-phone` business clean；未运行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，重新按 RN page/action/state 对 H5 route/owner 做残余检索。
