# IM28 H5 Foundation Status

- status: `active`
- current_step: `W6.a6.20.57 通讯录申请未读全局角标已完成`
- next_step: `执行 W6-rn-parity-residual-inventory-refresh，继续按 RN 页面/交互/状态选择确定性缺口`

## W6.a6.20.57 Primary Contacts Tab Verification Badge Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 全局通讯录 Tab 复用 RN `friendApplicationUnreadTotal + groupApplicationUnreadTotal`；零值隐藏、三位数宽角标和超过 999 显示 `999+` 与 RN 一致 | RN source/caller 保持冻结 |
| ownership | `single-H5-owner/shared-read` | `PrimaryTabsLayout` 持有主 Tab 生命周期内唯一验证计数 hook；`PrimaryTabBadgeProvider` 同时向 TabBar 与 ContactsPage 提供同一快照/刷新端口；底层仍只调用 SDK 两个既有 read facade | 全屏验证消息 route 独立生命周期继续复用同一 hook 实现 |
| freshness | `pass` | 主布局首次恢复与每次进入通讯录都刷新；同 runtime/账号并发请求合并；旧账号异步结果不能覆盖新账号 | 非零实时变化仍依赖既有页面进入、下拉和 mark-read 刷新点 |
| delete-or-register | `delete` | 四个主 Tab 均已迁移，删除 `href:null`、禁用按钮分支及失效 `:disabled` CSS，不保留 compat | none |
| verification | `pass` | focused 3 files/7 tests、full 111 files/344 tests、H5 typecheck、1165-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 真实 `/contacts` 加载 2 位联系人；四个 Tab 均可导航，消息/通讯录 SPA 往返 URL 正确；当前验证未读为 0，角标正确隐藏 | 非零角标真实视觉等待自然申请数据；未执行 accept/reject/mark-read |
| protection | `pass` | 本片只改 H5；未修改 SDK source/generated package 或 RN business；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-zero-state-pass/non-zero-data-gated`。通讯录角标与页面 shortcut 不再各自请求或维护状态，申请计数事实仍由既有 shared facade 单一提供。

## W6.a6.20.56 Legacy Chat Forward Route Compatibility Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| primary path | `pass/single-owner` | 当前转发唯一 UI 路径仍为 `ChatPage -> ChatTargetPickerModal`；旧 `/conversations/:conversationID/forward` 只执行 replace redirect，不渲染页面或选择器 | 历史深链兼容仍登记保留 |
| state safety | `pass` | 仅接受 1–100 个稳定 client message ID；拒绝正文/payload；来源会话必须与路由及加载后的当前会话同时匹配；一次性 state 使用后清除 | 刷新后不恢复已丢失的内存 state |
| delete-or-register | `register-compat-only` | 无 `ChatForwardTargetPage`、第二目标 source、提交、cache 或 mutation owner；兼容 route 退出条件为历史深链/浏览器历史不再需要支持 | none |
| verification | `pass` | focused 1 file/4 tests、full 110 files/341 tests、typecheck、1165-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 旧 forward URL 从 404 恢复为真实聊天页；reload/back 不重放弹窗，页面消息/输入区正常且零新增 warning/error | 带有效内存 state 的最终转发仍属于真实 mutation gate |
| protection | `pass` | 本片不改 SDK source/generated package 或 RN business；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/compatibility-only; browser-readonly-pass`。兼容入口只修复旧历史地址，不重新引入已删除的转发目标页面或 Web 业务双轨。

## W6.a6.20.55 Chat Initial Message Skeleton Parity Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 固定 12 条 incoming 占位，循环复用 RN 188x58、236x76、142x44、210x58 四档尺寸；群聊显示 24px 头像，单聊隐藏；复用 RN skeleton tail 与 2.2s shimmer | RN source/caller 保持冻结 |
| ownership | `presentation-only/single-owner` | `ChatMessageSkeleton.tsx + chat-message-skeleton.css` 唯一持有首屏加载视觉；`ChatMessageList` 只按 loading/empty 与 isGroup 组合 | none |
| delete-or-register | `delete` | 删除旧的 4 条左右交替 pulse bar 内联实现和旧 CSS，不保留 compat wrapper | none |
| layout | `pass` | 骨架绝对锁定 message stack、底部排列并裁切顶部；真实短群聊 system row bottom 632、list bottom 656、composer top 656、overflowX 0 | none |
| verification | `pass` | H5 focused 1 file/3 tests、full 110 files/339 tests、466 assets、typecheck、1164-module production build、diff check；SDK Web 98 files/403 tests | 既有 >500kB chunk warning |
| browser | `pass-readonly/cold-frame-timing-gated` | 第二联调账号真实群聊、稳定 reload 零新增 warning/error、短消息贴底通过 | SQLite cache 命中过快，未截到自然瞬态骨架帧 |
| protection | `pass` | 本片不改 SDK source 或 RN business；仅允许的 `build:web/sync:web` 发布 Web 包；未执行 RN/Desktop/build:all 或 `build:package:desktop:web` | none |

Closeout verdict: `clean/done-local/presentation-only; browser-short-list-pass/cold-frame-timing-gated`。加载态不再使用 H5 自创的交替占位，且独立样式 owner 避免继续扩张大型聊天样式文件。

## W6.a6.20.54 Unified Chat Target Picker And Short-List Bottom Alignment Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| ownership | `shared-core-ready/web-consumed/rn-frozen` | `ChatTargetPickerModal` 唯一持有好友/群聊目标 presentation；SDK `forwardToTargets/messageBroadcast.sendCard` 持有跨目标业务与结果语义 | RN 多目标 consumer 未迁移，需单独授权 |
| delete-or-register | `delete` | 独立 `ChatForwardTargetPage`、route 与页面 CSS 删除；群发/二维码/用户名片/群名片选择层改用同一组件 | route shell 仅保留可恢复来源与兼容入口 |
| behavior | `pass` | 单/多选、跨 Tab 选择、当前筛选 ALL、50 上限、排除身份、多目标 partial result 与短消息 bottom stack 已覆盖 | 最终发送属于真实 mutation gate |
| verification | `pass` | SDK focused 3 files/13 tests、all-runtime boundary/typecheck；H5 full 109 files/337 tests、typecheck、1161-module production build | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 登录态聊天转发不离开当前 URL；好友 ALL 2、群聊 ALL 后累计 3；群发使用同一全高底部弹窗；短会话 stack `justify-content:flex-end` 且 outer scroll geometry 不变 | 未点击最终分享/转发，不改变远端数据 |
| protection | `pass` | `im28-phone` worktree clean；只执行 SDK `build:web/sync:web`，未执行 RN sync/build；`build:package:desktop:web` 未修改或执行 | none |

Closeout verdict: `clean/shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass/mutation-acceptance-gated`。选择 UI 不再按业务页面复制，多目标业务不落回 H5 循环，短消息与 RN 一致从底部开始展示。

## W6.a6.20.53 Pull Refresh Indicator Owner Convergence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| ownership | `presentation-only/converged-owner` | 全部 20 个 `usePullRefresh` 生产页面统一消费 `components/interaction/PullRefreshIndicator`；页面 refresh callback 与 shared facade 不变 | none |
| delete-or-register | `delete` | 10 份手写提示 DOM 和 9 个 CSS 文件中的局部 `rn-*-pull` 选择器删除；不保留 compat wrapper | none |
| contract | `pass` | 新结构 contract 自动扫描生产页与页面 CSS，锁定 `20/20` consumer 和 legacy selector zero | none |
| verification | `pass` | focused 5 files/10 tests、H5 full 108 files/334 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；两次从错误子目录调用脚本的入口错误已更正 |
| browser | `pass-readonly/physical-touch-gated` | 5176 `/calls`、`/conversations`、`/conversations/search`、真实群成员路由均显示折叠全局提示、旧 class 为零、数据正常且 warning/error 为零 | 物理触摸释放未自动化；未执行任何 mutation |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-readonly-pass/physical-touch-gated`。手势与业务刷新仍由既有页面/facade 持有，三态展示不再存在页面级双轨。

## W6.a6.20.52 Forward Target Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 普通转发目标页对齐 RN `ForwardTargetSelector` 的 `RefreshControl`；三 Tab、搜索、目标打开和转发主链保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 页面只调用既有 `loadChatForwardTargets`，底层继续唯一消费 `conversations/contacts/groups` facades；无 transport/cache owner | none |
| failure | `pass` | 三类刷新全部成功后才替换快照；失败保留当前目标、Tab 和搜索词；加载、刷新或打开目标期间拒绝重复下拉 | none |
| verification | `pass` | focused 4 files/8 tests、H5 full 107 files/332 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/physical-touch-gated` | 5176 真实 3 条最近会话、2 位好友、1 个群聊，搜索/清除、三 Tab、折叠提示、412/412 和零 warning/error 通过 | 物理触摸释放未自动化；未打开目标或提交转发 |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。转发目标刷新沿用既有三类 shared owners，没有建立 Web 数据或转发业务双轨。

## W6.a6.20.51 Blacklist Pull Refresh And Indicator Convergence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 黑名单页对齐 RN `ProfileScreen` 黑名单 FlatList 的刷新入口；搜索、解除确认和 mutation 主链保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 刷新只调用既有 `blacklist.list`；解除继续只调用 `blacklist.remove`；七个页面统一消费全局 `PullRefreshIndicator` | none |
| delete-or-register | `delete` | 删除 `VerificationPullIndicator`、`GroupPullRefreshIndicator` 与两套重复 CSS；不保留 compat wrapper | none |
| failure | `pass` | 刷新成功后才替换列表；失败保留当前黑名单与搜索词；首次加载、刷新或解除处理中拒绝重复手势 | none |
| verification | `pass` | focused 6 files/16 tests、H5 full 106 files/330 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/empty-data/physical-touch-gated` | 5176 真实空黑名单完成搜索/清除、两类空态、折叠提示与 412/412 验收；稳定 reload 日志数量不增长 | 当前无黑名单样本；物理触摸未自动化；删除旧模块时留有一条既有 Vite HMR 历史错误 |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/empty-data-and-physical-touch-gated`。黑名单读取/解除仍服从唯一 shared owner，跨页面刷新提示不再双轨。

## W6.a6.20.50 Group Applications Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 指定群入群申请页对齐 RN `GroupApplicationListView` 的 `RefreshControl`；搜索、申请操作、确认和提交主链保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 刷新只调用既有 `groupApplications.list` facade；accept/reject mutation 继续使用原 shared owner；页面不新增 Gateway、SQLite、DTO 或 Repository 分支 | none |
| failure | `pass` | 刷新成功后才替换列表；失败保留当前申请与搜索词；首次加载、刷新、接受或拒绝处理中拒绝重复手势 | none |
| verification | `pass` | focused 4 files/11 tests、H5 full 105 files/328 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/physical-touch-gated/action-data-gated` | 5176 真实群路由显示群 ID、搜索、折叠刷新提示与空态；搜索/清除、412/412 和稳定 reload 零 warning/error 通过 | 当前无申请样本；物理触摸释放未自动化；未执行 accept/reject |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-and-action-data-gated`。刷新沿用唯一 shared owner，并复用验证列表提示组件，没有建立 Web 群申请业务双轨。

## W6.a6.20.49 Group Mute Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 群禁言页对齐 RN `GroupMuteScreen` 手动禁言列表的 `RefreshControl`；范围选择、成员操作、确认和提交主链保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 刷新只调用既有 `groups/groupMembers`；禁言 mutation 继续唯一调用 `groupManagement`；页面不新增 Gateway、SQLite、DTO、Repository 或权限规则 | none |
| failure | `pass` | 群与成员同步都成功后才替换页面事实；失败保留当前禁言范围和成员快照；首次加载、刷新、提交期间拒绝重复手势 | none |
| verification | `pass` | focused 3 files/8 tests、H5 full 104 files/326 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/physical-touch-gated` | 5176 真实群显示关闭范围、两位可禁言成员、折叠刷新提示、412/412 无溢出；稳定 reload 无新增 warning/error | 物理触摸释放仍需设备验收；未执行真实禁言 |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。刷新沿用唯一 shared owner；旧选择页专属提示已删除并收敛为三个群页面共用展示组件。

## W6.a6.20.48 Group Member Selection Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 邀请群成员与移出群成员页对齐 RN `RefreshControl`；搜索、选择、确认和提交主链保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 邀请刷新复用 `groups/groupMembers/contacts`，移除刷新复用 `groups/groupMembers`；页面不新增 Gateway、SQLite、DTO、Repository 或 mutation 规则 | none |
| failure | `pass` | 每页所有同步成功后才原子替换候选事实；失败保留旧候选、搜索词与选择态并显示真实错误 | none |
| verification | `pass` | focused 4 files/8 tests、H5 full 104 files/325 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/physical-touch-gated` | 5176 真实群邀请空态、移除两位成员、搜索过滤、禁用提交、412px 宽度与 console 0 warning/error 均通过 | 物理触摸释放仍需设备验收 |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。两个页面继续消费既有 shared owners，没有建立 Web 数据或群管理双轨。

## W6.a6.20.47 Joined Groups Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | `/contacts/groups` 对齐 RN `ContactGroupListScreen` 的 `RefreshControl`；顶部单指释放触发群列表刷新，搜索词与既有动作保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 刷新只调用既有 `groups.sync({ pageSize: 50 })`；页面不新增 Gateway、SQLite、DTO、Repository 或群生命周期规则 | none |
| failure | `pass` | 远端同步失败保留当前群列表并展示真实错误；刷新成功才原子替换列表 | none |
| verification | `pass` | focused 3 files/8 tests、H5 full 103 files/323 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/physical-touch-gated` | 5176 真实 `donk的群聊`、群主标签、无结果搜索与恢复搜索均通过；412/412 无溢出，console 0 warning/error | 物理触摸释放仍需设备验收 |
| protection | `pass` | SDK source/generated package 与 `im28-phone` 本片零改动；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。群列表刷新沿用唯一 shared owner，没有建立 Web 数据双轨。

## W6.a6.20.46 Create Group Selection Review And Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 普通建群选中好友后显示搜索、头像预览、清空入口和“已选好友”底部复核层；支持逐个移除；页面顶部单指释放触发联系人刷新 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 创建继续调用既有 `groups.create`，刷新只调用既有 `contacts.list`；H5 仅持有选中态投影、modal 与手势 | none |
| failure | `pass` | 刷新失败保留旧联系人快照并展示真实错误；已失效身份不进入复核列表；零选中时自动关闭复核层 | none |
| verification | `pass` | focused 3 files/8 tests、H5 full 102 files/321 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly/physical-touch-gated` | 5176 真实两位好友完成全选、复核、逐个移除和清空；提交按钮状态正确，412/412 无横向溢出，console 0 warning/error | 物理触摸释放仍需设备验收 |
| protection | `pass` | SDK source/generated package 与 `im28-phone` 均零改动；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。普通建群没有建立 Web 业务双轨，新增内容只负责 RN 交互投影。

## W6.a6.20.45 Friend-Added Message Presentation Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | type1201 在聊天页和会话列表统一显示“你们已经成为好友，可以开始聊天了”；RN source/caller 保持冻结 | RN production caller 需独立授权后才能收敛 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK `friend-added-message.ts` 单一持有类型、文案与 unknown fail-closed helper；初始未读边界复用同一类型常量 | none |
| Web consumers | `done-local` | H5 聊天页和会话摘要共同调用 shared helper，已删除两处页面级 1201 文案/类型硬编码 | none |
| verification | `pass` | SDK focused 2 files/6、Web full 97 files/400 tests、全 target typecheck/boundary；H5 focused 2 files/20、full 101 files/319 tests、466 assets、1157-module build、diff check | 既有 >500kB chunk warning |
| browser | `pass-real-data` | 5176 真实 `donk二大爷` 会话由 `[contentType=1201]` 修复为 RN 文案；稳定期 reload 日志未增长，raw fallback 消失 | build:web 热替换期间旧标签出现 Provider 顺序瞬时错误；冷启动登录页零错误，登记为 dev HMR 噪声 |
| protection | `pass` | `im28-phone` clean；仅执行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-real-data-pass`。type1201 的身份和文案只有 SDK 一个 owner，H5 不再把已知关系通知显示为原始协议号。

## W6.a6.20.44 Structured Group System Notice Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 `group_description_changed` 的“你/操作者昵称更新了[群简介]”及 `group_send_frequency_changed` 的开启间隔/关闭文案；RN source/caller 保持冻结 | RN production caller 需独立授权后才能收敛 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK `parseIMGroupSystemMessagePresentation` 单一解析 core/Gateway/RN wrapper、event 与 extra；聊天页和会话列表都只消费该投影 | none |
| realtime | `done-local` | OpenAPI 明示的 numeric `1521` 已进入 Gateway WebSocket `message` 分类；未为没有公开 numeric type 的发言频率事件猜测映射 | 真实双账号事件样本 |
| failure | `pass` | 未知 event、坏 extra、开启但缺秒数均 fail-closed；不信任 `system.text`，`1521` 缺结构事实时仅保留既有静态降级 | none |
| verification | `pass` | SDK focused 2 files/9、Web full 96 files/398 tests、全 target typecheck/boundary；H5 focused 2 files/18、full 101 files/317 tests、466 assets、1156-module build、diff check | 既有 >500kB chunk warning |
| browser | `pass-runtime/data-gated` | 5176 登录态 reload、账号恢复和设置页路由正常，console 0 warning/error | 当前缓存无可确认的 1521/频率消息，真实列表/气泡视觉保持 natural-data gate |
| protection | `pass` | `im28-phone` clean；仅执行 `build:web/sync:web` 发布 H5 包，未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-runtime-pass/natural-data-gated`。群系统文案只有 SDK 一个业务 owner，H5 未保留页面级 `system.extra` 解析副本。

## W6.a6.20.43 Global Reset, Navbar And Route Motion Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| reset | `done-local` | 全局 button 清除原生 appearance、margin、padding、border、radius 和 background；键盘 `:focus-visible` 仍保留 2px 可见焦点 | 业务组件显式 border/background 继续按页面 CSS 覆盖 |
| navbar | `done-local/converged-owner` | `PageNavbar + page-navbar.css` 已被 35 个可寻址详情/选择页消费；统一 safe-area、56px、三列、标题和图标，页面 class 仅保留视觉/动作差异 | 11 个主 Tab、复合聊天、认证品牌、媒体/来电/Dialog 标题按 contract 排除 |
| motion | `done-local/reused-owner` | 继续复用 `RouteMotionController + interaction.css` 的 pathname 入场；只作用 `#root main`、跳过首屏并尊重 reduced-motion，固定 TabBar 不参与动画 | 物理设备 reduced-motion 目视可后续补证 |
| dependency | `pass` | 未新增 UI/motion 依赖或 lockfile 改动；避免与 RN CSS、现有 modal 和 Navbar owner 形成双轨 | none |
| verification | `pass` | focused 1 file/2 tests、H5 full 101 files/315 tests、466 assets、typecheck、1155-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 5176 412px 通用设置确认 grid/56px/64-268-64、按钮 appearance none/border 0、退出按钮视觉保留、bodyWidth=viewportWidth=412；资料与聊天设置同一几何已点验 | 路由动画瞬时 class 在 160ms 后正常清除 |
| protection | `pass` | 本片未修改 SDK source/generated package 或 RN business；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build/sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass`。轻量交互沿用仓库现有 CSS/React Router owner，不引入第三方 UI 库或第二套组件协议。

## W6.a6.20.42 Settings Logout Modal Lifecycle Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 精确投影“退出登录 / 确认退出当前账号？ / 取消 / 退出”，确认层不再使用页面手写遮罩 | RN source/caller 保持冻结 |
| modal lifecycle | `done-local` | 独立 `MeLogoutDialog` 复用全局 `InteractionModal`；原生 top-layer、受控 Esc、遮罩、焦点和 reduced-motion 一致，WebView Escape 兜底已在全局 owner 收敛 | none |
| ownership | `presentation-only/converged-owner` | 页面继续只调用既有 `runtime.signOut()`；token、WebSocket、来电媒体和账号数据库清理由 runtime 唯一持有 | 未执行最终退出 |
| verification | `pass` | focused 1 file/2 tests、H5 full 100 files/313 tests、466 assets、typecheck、1153-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-nondestructive` | 5176 412px 打开、Escape、遮罩和取消均关闭；路由/登录态保持，宽度 412/412，无最终 logout mutation | pending 状态由组件 contract 与 disabled controls 覆盖 |
| protection | `pass` | 本片 SDK source/generated package 零改动，`im28-phone` clean；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `done-local/presentation-only; browser-nondestructive-pass`。退出业务链保持原样，H5 只删除页面级重复 modal 生命周期。

## W6.a6.20.41 Call List Modal And Empty-State Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 搜索、未接筛选和默认空列表分别投影“暂无搜索结果 / 暂无未接来电 / 暂无通话记录”；批量删除保留 RN 底部确认结构 | RN source/caller 保持冻结 |
| modal lifecycle | `done-local` | 独立 `CallDeleteSheet` 复用全局 `InteractionModal` 的原生 dialog top-layer、Esc、焦点、背景 inert、退出动画和 reduced-motion；删除期间遮罩、Esc、取消和重复确认均 fail-closed | 当前账号无通话记录，真实 modal 打开仍 data-gated |
| ownership | `presentation-only/converged-owner` | 确认仍只回调原 `WebIMCallSync.delete`；成功清理和首屏 cache 重读、失败错误均未改 | 不执行真实删除 |
| verification | `pass` | focused 2 files/7 tests、H5 full 99 files/311 tests、466 assets、typecheck、1152-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 5176 412px 三类空态、编辑/完成、筛选和 TabBar 通过；412/412 无溢出，console 0 warning/error | 无真实通话行，modal 打开/Esc/取消需有数据后复验 |
| protection | `pass` | SDK source/generated package 零改动，`im28-phone` clean；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `done-local/presentation-only; browser-readonly-pass/modal-data-gated`。通话列表没有新增 Web 业务 owner，删除、缓存和查询继续只服从 shared call facade。

## W6.a6.20.40 Verification Center Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN 好友验证与群聊验证索引的顶部下拉刷新；首次 loading 和用户 refreshing 期间均拒绝重复手势 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 两侧复用 H5 `usePullRefresh`；列表只调用既有 `friendApplications.list/groupApplications.list`，角标继续调用原 `getUnreadCount` owners | none |
| failure | `pass` | 列表和角标并行且独立：角标失败保留成功列表；列表失败保留旧快照并显示真实错误，不用计数成功伪造空列表 | none |
| verification | `pass` | focused 3 files/12 tests、H5 full 98 files/308 tests、466 assets、typecheck、1151-module production build | 既有 >500kB chunk warning |
| browser | `pass-readonly/physical-touch-gated` | 5176 412px 好友 Tab 真实 2 条记录、群 Tab 空态、Router tab 切换、刷新占位收起、412/412 宽度、干净 reload 后 console 0 warning/error | 当前语义工具不能可靠合成物理触摸释放 |
| protection | `pass` | SDK source/generated package 零改动，`im28-phone` clean；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。未执行 accept/reject/mark-read，验证列表和角标仍各自服从 shared owner，不产生 Web 业务双轨。

## W6.a6.20.39 Call List Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN 通话列表顶部下拉后强制远端同步、重读当前筛选第一页；编辑态不接管下拉手势 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | H5 复用全局 `usePullRefresh`；业务只调用既有 SDK `calls.sync -> listCached`，无 Gateway、SQLite、DTO 或终态映射副本 | none |
| failure | `pass` | 远端同步失败不读取并替换 cache，不清空旧列表，页面展示真实错误 | none |
| verification | `pass` | H5 focused 1 file/4 tests、full 97 files/306 tests、typecheck、1149-module production build | 既有 >500kB chunk warning |
| browser | `pass-readonly/physical-touch-gated` | 5176 在 412px 下通过所有/未接筛选、编辑/完成、空态、TabBar、`scrollWidth=clientWidth=412`，console 0 warning/error | 当前语义工具不能可靠合成物理触摸下拉 |
| protection | `pass` | 本片 SDK 零改动，`im28-phone` clean；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。刷新没有建立 Web 专属通话业务链，后续仍可直接跟随 shared call facade 演进。

## W6.a6.20.38 Conversation Draft Persistence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN `输入保存 -> 列表 [草稿] -> 重进恢复 -> 发送/清空移除`，正文 trim 与预设表情 entities 同步保存 | RN caller 保持冻结 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK `createIMConversationDraftSync/readIMConversationDraftDocument` 单一拥有文档校验、schema v13 `draft_entities_json` 与同步替换保留规则 | RN 尚未切换 shared facade |
| Web consumer | `done-local` | `ChatPage/ChatComposer` 只投影 route 输入态；`conversation-list-view` 只消费 shared reader，发送失败保留草稿 | none |
| verification | `pass` | SDK focused 3 files/12 tests、Web full 95/394、H5 focused 2 files/12 tests、H5 full 97/304、SDK Web/H5 typecheck、build:web/sync:web 与 1149-module H5 build | 既有 >500kB chunk warning |
| browser | `pass-nonremote` | 5176 登录态完成 `W38草稿😎` 输入、列表 `[草稿]`、重进恢复、清空回退最新消息；console 0 error，未发送消息 | 多标签同会话同时编辑冲突策略未定义 |
| protection | `pass` | `im28-phone` clean；未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-draft-loop-pass`。草稿没有 Gateway 或 fake-success 路径，普通 conversation sync/replace 会保留当前账号本地草稿与实体。

## W6.a6.20.37 Chat Call Record Message Bubble Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 文案、audio/video、拒绝/取消禁用图标和点击回拨语义按 RN `parseRTCCallMessage/ChatMessageBody` 冻结 | RN caller 保持冻结 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 单一解析 core/Gateway/RN 包装；实时 invite/accept fail-closed，不复制 RTC lifecycle | RN 尚未切换 shared parser |
| Web consumer | `done-local` | `getChatMessageView` 消费 SDK 投影；单聊点击复用已有 `handleStartCall -> WebIMCallProvider`，群聊只读 | none |
| verification | `pass` | SDK focused 1/4、Web full 94/391、H5 focused 1/9、boundary、SDK Web/H5 typecheck、1147-module build | 既有 >500kB chunk warning |
| browser | `pass-runtime/data-gated` | 5176 目标会话加载成功且 console 0 error；缓存窗口无 type110/RTC 终态样本，未注入假消息 | 真实历史通话消息的图标/文案目视与只读点击前状态 |
| protection | `pass` | `im28-phone` clean；只执行 build:web/sync:web，未执行 RN/Desktop/build:all/desktop:web | none |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-runtime-pass/history-sample-gated`。历史展示与实时来电状态机已隔离，H5 没有新增通话鉴权、信令或缓存双轨。

## W6.a6.20.36 Conversation Tab Double Press Next Unread Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 320ms 双击窗口、仅已选消息 Tab、非静音未读总数门禁、首个可见行之后选择和上次目标循环均与 RN 对齐 | 真实登录态点击滚动 |
| ownership | `presentation-only` | PrimaryTabsLayout 只转发当前页注册动作；ConversationsPage 只读 DOM 并 `scrollIntoView` | 无 SDK/数据库业务新增 |
| mutation safety | `pass` | 双击不调用 markRead、read receipt、Gateway、Repository 或 cache write | none |
| verification | `pass` | H5 focused 2 files/10 tests、typecheck、1145-module production build | 既有 >500kB chunk warning |
| browser | `manual-gated` | 5176 dev 服务健康；当前工具无法控制应用内登录态浏览器，Chrome 5177 旧存储未恢复，未伪造运行证据 | 在当前 5176 登录态双击消息 Tab 点验实际滚动 |
| protection | `pass` | SDK source/package 与 `im28-phone` 零改动；未执行任何 SDK/RN/Desktop build/sync | `build:package:desktop:web` 未修改或执行 |

Closeout verdict: `done-local/presentation-only; browser-interaction-gated`。关键规则与组件接线具备可重复测试，真实账号只读点击验收保留为显式门，不影响后续残余盘点。

## W6.a6.20.35 Single Chat Add Members Create Group Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 单聊设置成员加号、选择好友、固定当前对象、至少再选一位及返回语义与 RN 一致 | 真实创建未授权 |
| shared owner | `unchanged/converged` | 两个 H5 建群入口都只调用既有 SDK `groups.create`，2–998、去重、Gateway 与缓存语义未复制 | RN caller 冻结 |
| Web consumer | `done-local` | 新 SPA route 严格解析单聊目标，目标隐藏且不可取消；普通 `/groups/create` 行为保持不变 | none |
| verification | `pass` | H5 focused 2 files/13 tests、typecheck、1144-module production build | 既有 >500kB chunk warning |
| browser | `pass-readonly/mutation-gated` | 412px 真实单聊设置入口、候选排除、1 位额外好友后总数 2/按钮启用、返回路由及零横向溢出通过 | 未点击创建 |
| protection | `pass` | SDK source/脚本未改，`im28-phone` clean；未执行任何 RN/Desktop/build:all/desktop:web build 或 sync | none |

Closeout verdict: `done-local/converged-owner; browser-readonly-pass/mutation-gated`。本片只增加 H5 的 RN 同款入口和页面选择编排，没有新增建群业务 owner 或改动 RN 业务。

## W6.a6.20.34 Single Chat Relationship Realtime Revision Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| shared owner | `done-local` | SDK classifier 单一判定好友/我方 blacklist 事实事件，排除仅申请列表事件 | RN caller 冻结 |
| runtime isolation | `pass` | 独立 `relationshipVersion`；普通 message/conversation/update 只推进 `dataVersion` | none |
| Web consumer | `done-local` | H5 hook 只把关系 revision 加入原 facade 读取依赖，保留已有投影与 fail-closed | 真实关系变更样本 |
| verification | `pass` | SDK Web 93 files/387 tests、boundary、Web typecheck/build:web；H5 typecheck、1144-module build | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 412px 真实好友单聊刷新后 composer 可用，bodyWidth=viewportWidth=412 | 未执行好友/blacklist mutation 或双账号事件 |
| protection | `pass` | 只发布 `build:web/sync:web`；RN business、caller、生成包和 package scripts 未改 | 未执行 RN/Desktop/build:all/desktop:web |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; realtime-readonly-pass/data-gated`。关系刷新与普通消息缓存刷新已分离，没有形成 H5 业务双轨。

## W6.a6.20.33 Single Chat Relationship Availability Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐我方 blacklist composer 替换、stranger 底部验证提示/动作和发送关系错误降级；RN source/caller 冻结 | relationship realtime listener |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一状态/文案/错误分类；neutral facade 只组合 peer profile 与 blacklist identity query | RN production caller 需单独授权 |
| truthful contract | `pass` | OpenAPI 只证明 `is_friend` 与我方单向 blacklist；不实现或声称反向 blacklist，历史 `blockedByPeer` 解释为 stranger | none |
| Web adapter | `done-local` | H5 hook 只持有 route projection；申请动作进入既有 SPA route；stranger 保留 composer，blocked-by-me/unknown fail-closed | domain revision 未接入 |
| verification | `pass` | SDK 96/395、全 target typecheck、boundary/build:web；H5 focused 2/6、typecheck、1143-module build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 真实群聊及两条好友单聊 input/controls 正常且 console error/warning=0 | 无陌生人/blacklist 样本，未执行破坏性 mutation |
| protection | `pass-with-tooling-note` | 最终仅 `build:web/sync:web` 发布，RN package 未同步、RN business 未改；SDK 脚本未改 | 一次根 `npm test` 内置 compile-only RN/Desktop，无 sync/产物写入应用 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; relationship-realtime/data-gated`。单聊关系只有 SDK 一个业务 owner，H5 未复制 `is_friend`、blacklist payload、错误词或反向拉黑推断。

## W6.a6.20.32 Group Chat Composer Availability Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN `getGroupSendDisabledReason/ChatDetailComposerArea` 的生命周期、权限、角色、禁言、频率限制及不可用栏优先级；RN caller 只读冻结 | 受限群真实 UI 样本 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK `resolveIMGroupComposerUnavailableReason` 单一维护规则/文案，joined-group DTO 从同一 raw payload 投影可选原因 | RN 需单独授权后才能切换 production caller |
| Web adapter | `done-local/browser-readonly-pass` | `useChatMentionMembers` cache-first 恢复群与成员并独立收敛刷新失败；`ChatPageFooter` 固定多选 > 不可用 > 待转发 > composer | 群权限独立 realtime event 尚无稳定 Gateway contract |
| fail-closed | `pass` | 群路由首帧显示恢复中；权威群缺失显示已退出；无 cache 且读取失败显示状态不可用；有 cache 的弱网保留已知状态并显式报错 | none |
| verification | `pass` | SDK focused 2/13、full Web 91/381、boundary/Web typecheck/build:web；H5 focused 2/7、full 95/293、466 assets、typecheck 与 1139-module build | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/data-gated` | 412x786 真实好友单聊和普通群均保留 composer，零 overflow、零 warning/error | 当前账号无封禁/解散/禁言群；未修改群设置 |
| protection | `pass` | `im28-phone` worktree clean；只执行 `build:web`（内含 `sync:web`）；SDK package/desktop scripts 未改 | 未执行 RN/Desktop/build:all 或 `build:package:desktop:web` |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; restricted-group-data-gated`。群聊发送可用性只有 SDK 一个新 owner，H5 未复制 raw 权限或建立第二业务状态机。

## W6.a6.20.31 Chat Message Delete Shatter Exit Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN 仅在删除成功后执行 620ms 碎裂退场；SDK partial result 只标记成功 ID，失败行原位保留 | 真实单条/批量删除动画样本 |
| business owner | `unchanged/converged` | 继续只调用既有 `messages.delete`；Gateway、逐项结果、SQLite success-only 隐藏和通知文案均未改 | 真实 `self/all` 与 partial Gateway 结果仍属破坏性验收门 |
| Web adapter | `done-local` | `useChatMessageDeleteExit` 在 cache 重读前冻结成功行，DOM 动画结束或 700ms 兜底后释放；新到消息继续消费最新 cache | reduced-motion 只执行 1ms 退场，不伪造删除成功 |
| structure | `pass` | 碎裂 CSS 独立为 85 行模块，`chat-page.css` 回落至 974 行；新增纯规则/Hook/粒子组件均有生产消费者 | `ChatPage.tsx` 既有 485 行 P3 页面债务 |
| verification | `pass` | H5 focused 4 files/13 tests、Web typecheck、1136-module production build、`git diff --check` | 既有 >500kB chunk warning |
| browser | `pass-readonly/destructive-gated` | 412px 已登录聊天页无横向溢出，620ms CSS 规则真实加载，console warning/error 为 0 | 未调用真实删除接口 |
| protection | `pass` | 本片未改 SDK 或 `im28-phone`，未执行任何 SDK/RN/Desktop build/sync | `build:package:desktop:web` 未修改或执行 |

Closeout verdict: `done-local/presentation-only; destructive-acceptance-gated`。Web 只依据 shared SDK 的明确成功 ID 展示退场，未建立第二套删除结果、缓存或权限语义。

## W6.a6.20.30 Chat Quote Source Local Resolution And Focus Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐当前窗口/本地库恢复、点击引用定位与短时高亮、确认缺失文案；RN `fetchMessageByID/FlatList` caller 只读冻结 | 真实引用消息点击样本 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | `getCachedByStableMsgIDs` 按 client/server ID 查询当前账号 SQLite、按请求保序并以 canonical client ID 去重；无 Gateway 和 cache mutation | RN 需独立授权后才能切换 caller |
| Web adapter | `done-local/browser-readonly-pass` | `useChatQuoteSources` 批量补当前会话来源；当前 DOM 直接居中高亮，本地库来源通过同会话 `?messageID=` 目标窗口定位；群名称复用 shared resolver | 当前三个真实会话引用数均为 0 |
| fail-closed | `pass` | 仅确认本地缺失才显示“引用的内容已删除”；读取失败不伪装删除，跨会话结果拒绝，空身份禁用跳转 | none |
| verification | `pass` | SDK focused 2 files/12 tests、full Web 91 files/381 tests、boundary/typecheck/build:web；H5 focused 4 files/15 tests、466 assets、typecheck 与 1132-module build | 既有 >500kB chunk warning |
| protection | `pass` | `im28-phone` business clean；SDK scripts 未改；只执行 `build:web/sync:web` | 未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-quote-data-gated`。引用来源恢复只有 SDK 本地查询一个业务 owner，H5 仅持有当前窗口、React Router 与 DOM 定位差异。

## W6.a6.20.29 Chat History Pagination And Sticky Date Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐最早端加载、更早窗口前插不跳动、滚动日期悬浮和程序定位不误触发；RN `useChatLoadMore/useChatMessageListScroll` caller 冻结 | 真实长历史滚动样本 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一精确 uint64 previous cursor、稳定身份去重排序、clear boundary、SQLite upsert、`has_more/next_seq` 与重复/缺失游标拒绝；旧 `pullHistory` 仅保留数组返回兼容 | RN 需独立授权后才能切换 caller |
| Web adapter | `done-local/browser-readonly-pass` | `useChatHistoryPagination` 只持有用户手势、顶部阈值、DOM 高度补偿和 1.2s 悬浮日期；初始未读/搜索定位不触发分页 | 当前真实会话只有 2 条消息，无 `has_more` 样本 |
| verification | `pass` | SDK focused 4 files/21 tests、full Web 91 files/381 tests；H5 focused 4 files/8 tests、466 assets、SDK boundary/Web typecheck/build:web、H5 typecheck 与 1131-module build | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 412px 真实聊天页 2 条消息，list client/scroll height 均 665、零 loading/sticky/overflow；干净重载后无新增 error | 长列表的 Network、位置补偿和日期视觉待自然样本 |
| protection | `pass` | `im28-phone` business worktree clean；SDK/H5 package scripts 未改；最终发布只执行 `build:web/sync:web` | 一次误用根 `npm test` 触发 compile-only core/RN/Web/Desktop，未 sync RN、未改 RN package，且未执行 `build:package:desktop:web` |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-long-history-data-gated`。分页业务事实只有 SDK 一个 owner，H5 没有建立第二套 DTO、缓存或 Gateway 状态机。

## W6.a6.20.25 Chat Audio Played And Auto-next Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 播放尝试即记录账号/会话本地 played，兼容 `localEx.im28SoundMessagePlayed`；自然结束才选择下一条 incoming 语音，手动停止不连播；RN caller 冻结 | 真实浏览器媒体样本 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一 `serverMsgID > clientMsgID`、localEx 判定与后续 type103 候选；不持有媒体、存储、SQLite 或 Gateway I/O | RN 生产 caller 需独立授权才能收敛 |
| Web adapter | `done-local/browser-readonly-pass` | route-scoped Provider 持有唯一 HTMLAudio、账号/会话 localStorage 和结束回调；incoming 未播放语音显示红点；真实 412px 群聊确认页面只有一个 audio runtime | 跨设备 played/read 明确不在本片 |
| fail-closed | `pass` | 空身份、无当前消息、outgoing、非语音、已播放、非法 URL、手动停止和播放失败均不推进；不伪装服务端 read | none |
| verification | `pass` | SDK focused 1/3、H5 focused 3/12；full verify 通过 466 assets、runtime boundary、SDK Web 89 files/371 tests、SDK/H5 typecheck 与 1124-module build | 既有 >500kB chunk warning |
| protection | `pass` | `im28-phone` clean；仅执行 `build:web/sync:web` | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-media-data-gated`。本地播放状态与服务端消息已读严格分离，Web 未建立第二套候选选择规则。

## W6.a6.20.24 Chat Sender Avatar Mention Gesture Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | incoming 群消息仅在分组头像实际可见且成员快照存在时启用 500ms/8px 长按；桌面右键复用同一动作；本人、单聊、系统消息和未知成员 fail-closed | 编辑/引用态明确不消费提及；真实触屏手势样本 |
| composer owner | `clean/reused` | 头像只产生一次性 member request；Composer 复用 shared 显示名和既有 mention selection/document owner，追加 `@昵称 ` 或替换末尾未完成查询；不直接发送消息 | none |
| presentation | `done-local` | `ChatGroupSenderAvatar` 单独持有头像、资料 Link 和 fallback；长按后抑制点击导航，普通点击仍进入 `.23` 资料链；气泡、媒体、消息动作和多选结构不变 | Safari/Firefox/物理触屏 |
| verification | `pass` | focused 2 files/10 tests；full verify 为 SDK Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1122-module build；cleanup P0/P1 zero | 保留既有 >500kB chunk warning；仓库无 `scripts/check-convergence.sh` |
| browser | `pass-anonymous/data-gated` | dev 服务可访问，匿名 `/conversations` 正确回到手机号登录，1280px 零横向溢出 | 当前浏览器标签未继承 sessionStorage；真实 incoming 群头像长按与草稿投影未验收 |
| protected scope | `pass` | SDK business source 未因本片改动；RN worktree clean；只执行 `build:web/sync:web` | RN/Desktop/build:all/`build:package:desktop:web` 均未执行 |

## W6.a6.20.22 Group Member Restricted Profile Context Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 群设置预览与完整成员列表都只把稳定 `groupConversationID/backHref` 交给资料 route；资料页按 `allowMemberAddFriend === false && !self` 隐藏更多、资料字段、快捷动作、主操作和好友详情 | RN caller 继续冻结；群消息头像入口的禁言上下文另片处理 |
| identity/security | `pass/fail-closed` | Router state 不携带权限或昵称；页面必须从当前账号 `conversations -> groups -> groupMembers` 重新确认真实群会话、群和成员，并用 SDK `resolveIMGroupMemberDisplayName` 投影昵称 | 真实禁止互加群样本当前不存在 |
| presentation | `done-local` | 禁止互加显示“已是群成员”；加载期间不闪现动作，校验失败显示“群成员资料暂不可用”；本人和无群入口资料不受限制 | Safari/Firefox history-state 矩阵 |
| verification | `pass` | H5 focused 3 files/22 tests；full verify 为 SDK Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1120-module build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 真实允许互加群从设置预览进入 `donk二大爷` 资料，显示正确昵称与完整动作；412px 零横向溢出 | 禁止互加真实 UI、校验失败态和刷新/history 恢复仍 data-gated |
| protected scope | `pass` | SDK business source 未改；RN worktree clean；仅执行 `build:web/sync:web` | RN/Desktop/build:all/`build:package:desktop:web` 均未执行 |

## W6.a6.20.23 Chat Sender Avatar Profile Entry Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 只有收到的群消息且连续分组实际显示头像时提供资料入口；头像尺寸、图片 fallback、分组占位和气泡动作不变 | RN 长按头像 @ 成员是另一交互，不在本片 |
| route/owner | `clean/reused` | `buildChatGroupMemberProfileLocation` 只构造编码 user route、当前聊天 backHref 和稳定 groupConversationID；资料页继续唯一持有 `.22` 的群/成员/权限校验 | 群消息 profile 的 mute management context 另片且需 mutation 授权 |
| security | `pass` | 消息正文、昵称、角色、权限和群设置均不写入 Router state；空 conversation/sender identity 不生成链接 | none |
| verification | `pass` | focused 2 files/15 tests；full verify 为 SDK Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1120-module build；cleanup P0/P1 zero | 仓库没有 `scripts/check-convergence.sh` |
| browser | `pass-readonly/data-gated` | 真实群聊 412px 页面、路由和布局健康，零横向溢出；当前群只有系统创建消息，头像点击样本不可得 | 不发送测试消息；真实 incoming group message click/history 仍 data-gated |
| protected scope | `pass` | SDK source 未改；RN worktree clean；仅执行 `build:web/sync:web` | RN/Desktop/build:all/`build:package:desktop:web` 均未执行 |

## W6.a6.20.21 Group Settings Preview Presence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 设置页只观察 `buildChatSettingsMemberViews` 实际渲染的最多 10 名预览成员；完整成员页行为不变 | RN caller 继续冻结 |
| single owner | `shared-core-ready/web-consumed/rn-frozen` | `shouldShowGroupMemberPresence` 复用 SDK normal-mode helper，`useGroupMemberPresence` 复用 `.20.19` presence facade；无第二 service/listener/cache | large/unknown 真实群样本 |
| presentation | `done-local/browser-pass` | 头像裁剪层外投影 RN 14px 底色边框与 8px success 绿点；名称、资料 route、邀请/移除入口不变 | Safari/Firefox 与实时上下线转换 |
| verification | `pass` | H5 focused 2 files/13 tests；full verify 为 SDK Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1119-module build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly` | 真实普通群设置页 3 名预览成员中 2 名明确在线；412px/390x844 均无横向溢出、绿点 14/8px、console warning/error 为 0 | 未制造状态变化或执行 mutation |
| protected scope | `pass` | SDK business source 未改；RN worktree clean；仅执行 `build:web/sync:web` | RN/Desktop/build:all/`build:package:desktop:web` 均未执行 |

## W6.a6.20.20 Group Member Presence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| shared group mode | `done-local` | `normalizeIMGroupMode/isIMNormalGroupMode` 统一 `1|2|normal|large`；joined-group Gateway/cache DTO 投影标准 mode，缺失/未知 fail-closed | RN caller 未切换 shared helper |
| H5 presence | `shared-core-ready/web-consumed/rn-frozen` | `useGroupMemberPresence` 为普通群完整成员建立单一 observation；只合并返回身份，离页释放，不写成员 DTO/SQLite | large 群真实样本、realtime 在线/离线转换 |
| presentation | `done-local/browser-pass` | 头像右下角 14px 底色边框 + 8px success 绿点；角色、昵称、ID、资料 route 保持原样 | Safari/Firefox 和物理触屏下拉 |
| verification | `pass` | SDK focused 3 files/16 tests；H5 view 1 file/4 tests；full verify 为 SDK Web 88 files/368 tests、466 assets、SDK/H5 typecheck、1119-module build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly` | 真实普通群 3 名成员中 1 个在线；412px/390x844 均零横向溢出、无页面错误，绿点 14x14 | 未制造上下线或执行 mutation |
| protected scope | `pass` | RN worktree clean；仅执行 `build:web/sync:web`；未运行 RN/Desktop/build:all/`build:package:desktop:web` | none |

## W6.a6.20.19 Friend Profile Presence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | `createIMUserPresenceSync` 持有 100 人分批、字段归一化、订阅 revision、账号过滤和 lifecycle clear；H5 只消费 `presence.observe` | RN `UserProfileScreen` 现有 OpenIM caller 保持冻结 |
| H5 parity | `done-local` | 好友资料导航栏显示在线/离线；黑名单文案优先；陌生人、自身和未知状态不伪造 presence | group-member restricted/mute context 不在本片 |
| persistence/lifecycle | `clean` | presence 仅在 runtime 内存；退出、切号、token 失效、被踢和 dispose 清除 subscriber；不推进 dataVersion、不写 SQLite | 断线重连真实事件仍需多账号样本 |
| verification | `pass` | SDK focused 2 files/7 tests、SDK Web full 87 files/366 tests、runtime boundary、SDK/H5 typecheck、H5 view 1 file/7 tests、466 assets、1115-module production build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly` | 已登录真实好友资料页展示“在线”；412px 与 390x844 均无横向溢出、导航栏居中，console warning/error 为 0 | 离线切换、断线重连与第二账号事件样本仍 gated |
| protected scope | `pass` | RN worktree clean；只执行 `build:web/sync:web`；未运行 RN/Desktop/build:all/`build:package:desktop:web` | none |

## W6.a6.20.18 Chat Link Action Surface Convergence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| primary path | `clean/single-owner` | `ChatActionModalSurface` 唯一持有 body portal、InteractionModal、收发方向与 viewport clamp；普通消息和链接只提供预览/动作项 | none |
| link behavior | `done-local` | 普通点击仍复用 `_blank` browser port；500ms 长按/右键进入“打开/复制”两项共用层；新增 8px move cancel；copy success-only close 不变 | 真实链接样本、移动端触屏、Safari/Firefox |
| delete-or-register | `delete` | 旧 `.rn-chat-text-link-menu` JSX/CSS 全部删除；危险色从 `last-child` 改为显式 `.is-danger`，链接“复制”不会被误标红 | 无 compat path 需要登记 |
| verification | `pass` | focused H5 5 files/16 tests；full verify：466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1114-module Vite build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 412px 已登录聊天页普通消息共用层真实打开/关闭；200px/6 动作、URL 稳定、`scrollWidth=clientWidth=412` | cache 无链接消息；未发送测试链接或执行动作 |
| protected scope | `pass` | RN worktree clean；仅执行 SDK `build:web/sync:web`；未运行 RN/Desktop/build:all/`build:package:desktop:web` | none |

## W6.a6.20.17 Chat Message Action Modal Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN interaction parity | `done-local/browser-pass` | `500ms` 长按、`8px` 移动取消、右键/键盘入口；全屏 24% blur 遮罩、原气泡预览、200px/40px 纵向动作菜单和 180ms 展开；已登录 412px 真实右键打开 | 触屏实机仍未取得 |
| layout/accessibility | `pass` | 收到靠左/发出靠右；动作数驱动 bottom clamp；超高预览截断；portal 挂到 body，预览 inert；Esc/backdrop 复用全局 InteractionModal | Safari backdrop-filter 仍属于浏览器矩阵 |
| business ownership | `unchanged/clean` | 引用/复制/编辑/多选/转发/表情收藏/删除回调原样复用；无 SDK、Gateway、SQLite、DTO 或 mutation 分支新增 | 所有真实 mutation 均未执行 |
| verification | `pass` | focused H5 4 files/13 tests；full verify：466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1113-module Vite build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly` | 发出消息靠右，6 动作顺序正确且仅删除为危险色；遮罩关闭后 dialog=0、URL 不变、`scrollWidth=clientWidth=412` | 未执行任何菜单 mutation |
| protected scope | `pass` | RN worktree clean；未运行 RN/Desktop/build:all/`build:package:desktop:web` | none |

## W6.a6.20.16 Chat Text Link Actions Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared projection | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一 HTTP(S)/www 分段、RN 尾随标点规则和 www->HTTPS；core/rn/web/desktop 显式导出，H5 生产组件实际消费 | RN 现有 `splitMessageTextSegments/normalizeBrowserUrl` 保持冻结，未宣称 convergence |
| H5 interaction | `done-local` | 普通点击打开隔离新标签；500ms 长按/右键只显示“打开/复制”；复制保留 URL 原文；链接 pointer/context 事件阻止外层普通消息菜单 | 真实移动端长按、弹窗拦截和 Safari/Firefox |
| rich text compatibility | `pass-local` | 链接在预设表情 entity 之间的普通文本区间投影；无 copy owner 的 composer/摘要保持纯文本；DOM contract 锁定可访问标签 | 当前真实 cache 无链接消息，未取得运行态链接 DOM/菜单视觉 |
| structure | `clean` | shared 纯函数、H5 browser port、链接组件与 clipboard hook 分层；无第二 URL parser、页面 Gateway/SQL、fake-success、TODO/debug log；新增文件均 `<300` 行 | `ChatPage` 为既有 383 行页面，未在本片扩大 owner |
| verification | `green-local/data-gated` | SDK focused 3/3、H5 focused 10/10；full verify 含 466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1111-module build；412px 真实群聊 `scrollWidth=clientWidth=412`、console warning/error=0 | build 仅有既有 large-chunk warning；真实链接运行态 data-gated |
| freeze | `pass` | `im28-phone/src/**`、测试、App/native 零改动；仅构建/同步 Web package | RN/desktop build 与 `build:package:desktop:web` 未修改或执行 |

## W6.a6.20.15 Joined Group Row Actions Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN interaction parity | `done-local` | 群行支持 `300ms` 长按、移动超过 `8px` 取消、右键等价入口；菜单顺序为分享群名片、退出群聊、管理角色修改群名称，位置按动作数量翻转并限制在视口 | 当前真实账号返回空群列表，非空菜单视觉和触屏实机手势未取得运行态证据 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | 菜单只消费 `WebIMJoinedGroup.permissions`；分享/改名先调用 `conversations.openGroup` 获得 canonical Conversation；普通退群只调用 `groupLifecycle.leave({clearHistory})`，不复制 Gateway/SQL/角色数字 | RN `GroupRowActionMenu`、owner auto-transfer/quit 业务保持冻结；未宣称双端 convergence |
| owner quit semantics | `explicit-two-step` | 群主点击退出时进入既有 `/owner-transfer?from=joined-groups`，取消或成功均回 `/contacts/groups`；不隐式串联第二次 destructive leave | 转让后需由用户重新长按并确认退出；真实转让、权限刷新、再退出和第二账号回读未授权 |
| route reuse | `done-local` | 分享复用 `/settings/share-group-card`；改名复用 `/settings/profile?edit=name` 并继续执行原 capability 校验和 `groups.updateName`；没有新增业务 route owner | 真实分享、改名 mutation 未执行 |
| structure | `clean` | 纯 view helper、菜单/modal、群行手势和页面 orchestration 各自分层；无页面 Gateway/SQL/OpenIM、role magic、fake-success、TODO/debug log，触及文件均 `<300` 行 | 自动 convergence script 不存在 |
| verification | `green-local/data-gated` | focused 3 files/10 tests；full verify 包含 466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 85 files/357 tests、1106-module build；diff-check 通过 | build 仅有既有 large-chunk warning；浏览器只证明已登录空群态 |
| freeze | `pass` | `im28-phone` clean；SDK 业务源码未改，只更新 consumer matrix；verify 仅运行 `build:web/sync:web` | RN/desktop build 与 `build:package:desktop:web` 未执行 |

## W6.a6.20.14 Group Owner Transfer Route Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN route parity | `done-local` | 新增 `/settings/manage/owner-transfer`；标题、搜索、角色优先分组、下拉刷新、成员选择与二次确认均由独立页面持有；管理首页只保留入口 | 真实非空候选、确认层视觉和成功返回需要可用群数据 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 继续唯一持有群主权限、候选过滤、exactly-once Gateway、group/member 原子角色事务及权威刷新；H5 不复制角色或事务规则 | RN 现有转让链保持冻结，未宣称双端 convergence；未执行真实 mutation |
| H5 behavior | `done-local/fail-closed` | 管理员和群主页面共用 cache-first route data hook；搜索使用 shared 显示名，当前群主排除，管理员置顶，普通成员按拼音分组；`remote-only` 可见且不重放 | 当前浏览器实例受 SQLite 多标签互斥锁阻塞，登录态页面链未完成浏览器复验 |
| structure | `clean` | 管理首页旧群主 picker/action/成员加载已删除；新 route、view helper 与 shared hook 各有单一生产消费者链，无 compat 双轨、页面 Gateway/SQL、TODO/debug log 或 orphan owner | 自动 convergence script 在本仓库不存在 |
| verification | `green-local` | H5 focused 3 files/10 tests；full verify 含 SDK Web 85 files/357 tests、466 assets、boundary、SDK/H5 typecheck、1102-module build；diff-check 通过 | build 仅有既有 large-chunk warning |
| freeze | `pass` | `im28-phone` worktree clean；本片未改 SDK source，只由 verify 执行 `build:web/sync:web` | RN/desktop build 与 `build:package:desktop:web` 未执行 |

## W6.a6.20.13 Group Administrator Routes Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN route parity | `done-local` | 新增 `/settings/manage/admins` 管理员列表和 `/admins/add` 候选页；管理首页只保留入口；浏览器历史/刷新具有稳定 route | 当前账号目标群已不在会话 cache，非空列表视觉与真实返回链 data-gated |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 唯一持有权限、普通成员候选、`IM_GROUP_ADMIN_LIMIT`、exactly-once set/cancel、群/成员缓存事务及 `local/remote-only`；H5 不复制上限 | RN 现有角色 mutation caller 保持冻结，未宣称双端 convergence |
| H5 behavior | `done-local/fail-closed` | 子路由 cache-first 恢复会话/群/成员，先同步群再同步成员；候选刷新会裁剪失效选择；错误或无权限时隐藏添加、搜索、候选和提交动作 | 未执行真实添加/移除管理员 mutation |
| structure | `clean` | 旧管理员添加/取消 modal 和 action 从 `GroupManagementPage` 删除；列表、添加 route 和 shared mutation 分层单一，无 compat 双轨、页面 Gateway/SQL、fake-success 或 orphan helper | 群主转让已由 `W6.a6.20.14` 独立 route 关闭 |
| verification | `green-local` | SDK focused 1 file/5 tests；H5 focused 1 file/4 tests；full verify 含 SDK Web 85 files/357 tests、466 assets、boundary、SDK/H5 typecheck、1099-module build；diff-check 通过 | build 仅有既有 large-chunk warning |
| browser/freeze | `pass-readonly/data-gated` | 412px 两个新 route 在目标群缺失时展示真实错误且动作 fail-closed，document/viewport 均 412px；`im28-phone` worktree clean | 未制造群数据；RN/desktop build 与 `build:package:desktop:web` 未执行 |

## W6.a6.20.12 Home Search Clear Control Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 搜索有值时显示 RN `xmark-circle` 清除按钮；空值隐藏；点击后清空输入、旧结果、分页和错误态并恢复搜索历史 | physical touch keyboard/Safari/Firefox |
| focus | `pass-chromium` | 清除后 `activeElement.type=search`，保持 RN TextInput 编辑态，避免移动端键盘因按钮获焦而收起 | iOS Safari virtual keyboard proof |
| structure | `clean` | `ConversationSearchInput` 只翻译 input/Enter/clear DOM 事件；页面仍是唯一搜索状态与 SDK orchestration owner；page/input/helper 为 376/53/287 行 | no shared SDK capability change |
| browser | `pass-readonly` | 已登录账号 412x786：`donk` 产生 2 行真实结果；清除后 row=0、历史恢复、按钮消失、输入 active；document/viewport 均 412px | no mutation executed |
| verification | `green-local` | focused H5 2 files/7 tests；final full verify 含 SDK Web 85 files/356 tests、466 assets、runtime boundary、SDK/H5 typecheck、1092-module build；diff-check 通过 | build 仅有既有 large-chunk warning |
| freeze | `pass` | 本片未修改 `im28-phone` 或 `im28-sdk/src`；仅按 H5 门禁执行 `build:web/sync:web` | RN/desktop build 与 `build:package:desktop:web` 未执行 |

## W6.a6.20.11 Home Search Highlight Parity Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 好友/群聊标题与副标题按 RN 规则执行 trim、大小写不敏感和多处命中品牌色；聊天记录汇总行保持不高亮 | 当前真实 cache 只有好友命中，无群结果样本 |
| ownership | `clean` | 搜索筛选/缓存仍由 SDK 持有；H5 helper 只切分展示文本，页面只渲染语义标签和 CSS color | RN caller 冻结，本片不产生 shared convergence 声明 |
| browser | `pass-readonly/data-gated` | 已登录账号 412x786：`donk` 两行好友各有一个 `rgb(123, 97, 255)` 命中；`123` 聊天记录行 `mark=0`；document/viewport 均 412px | 无真实群结果，未执行 mutation |
| verification | `green-local` | focused helper 5/5；full verify 含 SDK Web 85 files/356 tests、466 assets、runtime boundary、SDK/H5 typecheck、1091-module build；diff-check 通过 | build 仅有既有 large-chunk warning |
| freeze | `pass` | `im28-phone` worktree clean；SDK 源码零改动，只按 H5 门禁执行 `build:web/sync:web` | RN/desktop build 与 `build:package:desktop:web` 未执行 |

## W6.a6.20.10 Home Search Pagination And Stale Request Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared owner | `converged-owner-consumed` | 继续只消费 SDK `contacts/groups/conversations` cache 与 `messages.searchCached({ limit, offset })`；关键词、可见正文、删除/撤回过滤和结果分页仍由 shared message search owner 持有 | RN caller 冻结，本轮未改写或重新宣称 convergence |
| H5 orchestration | `done-local` | `/conversations/search` 对齐 RN 8 条聊天记录分页、同会话跨页计数/最远消息定位、输入变化 request generation、下拉重读与不重复写历史；好友/群聊仍按页面快照分区展示 | 当前真实缓存不足 8 条同关键词消息，分页按钮运行态 data-gated |
| structure | `clean` | H5 helper 只做 view projection/merge；无页面 SQL/Gateway、第二搜索条件 owner、fake-success、TODO/console 或 orphan helper；页面 348 行、helper 247 行 | full verify 后新增的 request-generation 纯函数由 focused/typecheck 覆盖 |
| browser | `pass-readonly/data-gated` | 已登录账号 412x786：缺省历史 `donk`，真实好友两行；`123` 命中聊天记录一行且可定位稳定消息；document/body/viewport 均 412px，下拉文案存在 | 无群命中、无 8 条以上同关键词消息，未触发真实查看更多手势；未执行任何 mutation |
| verification | `green-local` | focused helper 4/4；full verify 含 SDK Web 85 files/356 tests、466 assets、runtime boundary、SDK/H5 typecheck、1091-module build；最终 H5 typecheck/diff-check 通过 | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | `im28-phone` worktree clean；只运行 Web build/sync | RN/desktop build 未执行，`build:package:desktop:web` 未修改或执行 |

## W6.a6.20.9 Group Conversation Open Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared conversation owner | `shared-core-ready/web-consumed/rn-frozen` | `openIMGroupConversation` cache-first 解析群目标；缺少/失效会话 ID 时经 `getGroup -> getConversation` 获取真实 ID；严格校验群/会话身份，并在当前账号队列内保存 latest message 与 conversation | RN `fetchGroupConversation` 生产 caller 冻结，未执行 caller convergence |
| H5 consumers | `done-local` | “我的群聊”“共同群聊”“查找群聊”的已加入分支全部只调用 `conversations.openGroup`，按 SDK 返回的规范会话 ID 导航；删除页面本地 list/sync/find 双轨 | 群申请分支保持既有 owner；无真实非空群样本，未执行远端打开请求 |
| structure | `clean` | 规范 ID、Gateway DTO 映射、缓存写入、失效 ID fallback 与账号切换保护只存在于 SDK；H5 只持有 opening 状态、错误展示和 React Router 导航 | RN frozen path 已登记，未来需独立授权 convergence |
| browser | `pass-readonly/data-gated` | 已登录账号 `/contacts/groups`、两位联系人的 `/contacts/users/:userID/groups` 均为真实空态；页面无 console error | 当前账号没有已加入群或共同群，无法证明非空点击、Gateway fallback 与 chat route 视觉链 |
| verification | `green-local` | SDK focused sql.js 4/4；full verify 含 SDK Web 85 files/356 tests、466 assets、runtime boundary、SDK/H5 typecheck、1091-module build | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | `im28-phone` worktree clean；只发布 H5 generated package | RN/desktop build 未执行，`build:package:desktop:web` 未修改或执行 |

## W6.a6.20.8 Verification Unread Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared application owner | `shared-core-ready/web-consumed/rn-frozen` | friend facade 统一专用未读读取、非负整数归一化、明确 ID 保序去重和空集合 fail-closed；group facade 以审核第一页 `total` 读取当前账号待处理总数 | RN 现有 service/caller 冻结，未执行 caller convergence |
| H5 consumer | `done-local` | 通讯录入口与验证双 tab 共用单一 hook/角标；页面进入、通讯录下拉、好友单条已读成功为明确刷新点；incoming 未读申请资料入口先本地投影再调用 shared mutation，失败不阻断导航 | 当前真实账号计数为 0、申请均 outgoing/accepted，未取得 incoming 未读或非零群审核数据 |
| structure | `clean` | DTO/未读/审核 total 语义只在 SDK；H5 只持有并行读取、`0/99+` UI 和路由；无 Gateway/OpenAPI 直调、第二计数 owner、orphan wrapper 或 compat 暗桩 | RN frozen path 已登记，未来需单独授权 convergence |
| browser | `pass-readonly` | 412px 真实账号 `/contacts`、friend/group tabs、2 条 accepted 好友申请与群空态；申请行具备资料按钮，双页零横向溢出、console 0 | 未点击申请，未执行 mark-read/accept/reject mutation；dark/desktop/Safari/Firefox 未验收 |
| verification | `green-local` | SDK focused 2 files/15 tests；H5 badge 1/1；full verify 含 SDK Web 84 files/352 tests、466 assets、boundary、SDK/H5 typecheck、1091-module build | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | `im28-phone` worktree clean；仅执行 `build:web/sync:web` 并同步 H5 generated package | RN/desktop build 未执行，`build:package:desktop:web` 未修改或执行 |

## W6.a6.20.7 Personal Profile Avatar Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared profile owner | `shared-core-ready/web-consumed/rn-frozen` | `WebIMSync.profile.updateAvatar` 冻结当前账号并原子执行静态图片/10MB 校验、Web OSS 上传、avatar-only Gateway update 与响应身份校验；部分响应缺头像时保留已确认远端 URL | RN `ProfileScreen/uploadAvatar/updateSelfInfo` 保持冻结，未执行 caller convergence |
| H5 personal profile | `done-local` | `/me/profile` 恢复 RN 头像行、相册/拍照/取消和共享 512x512 JPEG crop；成功后只用 SDK 返回资料更新当前视图，失败保留裁剪层与可见错误 | 真实文件选择、OSS 上传、profile update、刷新回读与第二终端展示未授权 |
| structure | `clean` | `updateAvatar` 是个人资料唯一写入口；onboarding 的 `uploadAvatar -> memory draft -> final update` 是不同提交时序；旧 onboarding 专属 sheet/helper 已删除，来源 sheet、输入合同和 crop owner 仅一份 | RN consumer 继续登记为 frozen，不以多 runtime 编译替代 caller convergence |
| browser | `pass-readonly` | 已登录账号 412px `/me/profile` 显示头像行；来源层准确展示“从相册选一张/拍一张照片/取消”；input 为静态图片相册与 `capture=environment` 拍照；document/body 均 412px，无横向溢出；只打开并取消 | 未选择文件或触发任何上传/资料 mutation；未取得 console/light/dark/desktop proof |
| verification | `green-local` | SDK focused 1 file/8 tests；H5 focused 3 files/5 tests；full verify 含 SDK Web 84 files/349 tests、466 assets、SDK/H5 typecheck、1089-module build；runtime boundary 与 diff-check 通过 | build 仅有既有 large-chunk warning；仓库无 `scripts/check-convergence.sh` |
| RN freeze | `pass` | `im28-phone` worktree clean；只执行 `build:web/sync:web` 并同步 H5 generated package | RN package 未重建，`build:package:desktop:web` 未修改或执行 |

## W6.a6.20.6 Onboarding Avatar Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared profile owner | `shared-core-ready/web-consumed/rn-frozen` | `WebIMSync.profile.uploadAvatar/update` 统一 JPEG/PNG/WEBP、10MB、远端 HTTP(S) URL、上传前后账号一致性和 update 响应身份；复用生产 Web OSS adapter | RN `CompleteProfileScreen/uploadAvatar/updateSelfInfo` 保持冻结，未执行 caller convergence |
| H5 onboarding | `done-local` | 完善资料头像恢复 RN 相册/拍照/取消 sheet；群头像裁剪抽为单一共享 512x512 JPEG Canvas owner；上传成功只写内存草稿，最终“完成”才与 nickname/gender/bio 一起提交 `avatar_url` | 有效 onboarding marker 只来自新账号注册；当前已登录账号不得伪造 marker |
| browser | `guard-only/data-gated` | 已登录账号直达 `/auth/complete-profile` 必须按 guard 返回会话页；未制造注册、上传或资料 mutation | 真实新账号来源 sheet、文件选择、裁剪、OSS 上传、最终 update、移动端/桌面 light/dark/history 需获批可抛弃账号 |
| verification | `green-local` | focused H5 4 files/10 tests；full verify 含 SDK Web 84 files/347 tests、466 assets、SDK/H5 typecheck、1089-module build；runtime boundary 与 diff-check 通过 | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | `im28-phone` worktree clean；只执行 `build:web/sync:web` 并同步 H5 generated package | RN package 未重建，desktop scripts 未改 |

## W6.a6.20.5 Group Server Search Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared search owner | `shared-core-ready/web-consumed/rn-frozen` | Gateway 搜索 wrapper 不再丢失 `source_type`；shared facade 统一 trim、认证、稳定 ID 去重和 `pending > joined > available`，并复用唯一已加入群 owner 提供真实会话 ID | RN `CreateGroupServerSearchScreen/searchGroupsByID/joinGroupByID` 保持冻结，未执行 caller convergence |
| H5 route | `done-local` | `/groups/create` 恢复 RN“查找群聊”入口；`/groups/search` 支持防抖、loading/error/empty、三态操作及返回时保留已选好友；available 复用既有申请页和 `source_type=search` | 无真实可加入结果，未触发申请 mutation |
| browser | `pass-readonly/data-gated` | 412px 认证账号验证入口、独立 route、`donk` 与已知旧群 ID 的真实空结果、返回后已选好友保持、零横向溢出 | 结果行/已加入跳转/待审核禁用/申请成功与第二账号 list-back 缺少后端数据证明 |
| verification | `green-local` | SDK focused 2 files/9 tests；H5 focused 3 files/7 tests；full verify 含 SDK Web 84 files/345 tests、466 assets、typecheck、1084-module build | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | `im28-phone/src/**`、测试、App/native 零改动；仅运行 `build:web/sync:web` 并同步 H5 generated package | RN package 未重建，desktop scripts 未改 |

## W6.a6.20.4 Chat Composer Pending Attachment Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared submission plan | `shared-core-ready/web-consumed/rn-frozen` | `shouldStageIMComposerMedia/createIMComposerSubmissionPlan` 固定已有草稿+单媒体待发送、编辑态附件互斥、`media -> file -> text` 串行步骤 | RN 现有 composer 编排保持冻结，需独立授权后才能切换 shared consumer |
| H5 pending attachment | `done-local` | 文件选择后不立即上传，展示名称/类别/大小/移除；待发送附件可单独提交，媒体/文件与文本/@/引用在一个 operation 中顺序执行，前序失败阻断后续 | 真实文件/媒体上传与带草稿组合消息未执行 |
| browser | `pass-no-send` | 412x820 单聊选择仓库内 `package.json` 后显示 `文件 · 924 B`、发送按钮可见、无横向溢出；移除后恢复加号，零 console error | 未点击发送，未产生 Gateway/OSS/SQLite outgoing mutation |
| verification | `green-local` | SDK focused 3/3；H5 focused 3 files/10 tests；full verify 含 SDK Web 84 files/343 tests、466 assets、typecheck、1081-module build | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | 未修改 `im28-phone/src/**`、测试、App/native；只执行 `build:web/sync:web` 并同步 H5 generated package | RN package 未重建 |

## W6.a6.20.3 Chat Composer Camera And RTC Entries Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| camera platform | `done-local` | 独立单张 `image/* + capture=environment` input；结果复用 album 校验与 `messages.sendImage` 上传/状态链；取消零错误 | 未点击拍照，未请求 camera permission，桌面浏览器按平台退化为文件选择 |
| RTC composition | `done-local/shared-owner-consumed` | 单聊显示 RN 同顺序入口，二次选择复用全局 `CallTypeActionSheet -> WebIMCallProvider -> SDK calls`；群聊隐藏 | 未选择语音/视频，未发起 Gateway/LiveKit/媒体权限；真实群页当前账号 data-gated |
| owner convergence | `pass` | 联系人与聊天共用一个 H5 通话方式弹层；删除旧 `ContactCallSheet`；图片、鉴权、信令、媒体状态均无第二 owner | RN business remains frozen |
| browser | `pass-readonly` | 412x820 真实单聊证明 `相册/拍照/音视频通话/文件/名片` 顺序、通话二选一/取消、camera DOM contract、`scrollWidth=clientWidth=412`、零 console warning/error | camera/file chooser 与 final call 均未触发 |
| verification | `green-local` | H5 focused 3 files/10 tests、typecheck；full verify 含 SDK Web 83 files/340 tests、466 assets、1078-module build；RN worktree clean | build 仅有既有 large-chunk warning |

## W6.a6.20.2 Chat Composer Card Send Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared message owner | `shared-core-ready/web-consumed/rn-frozen` | `messages.sendCard` 统一 user/group card 校验、type108 body、optimistic row、Gateway 回显、SQLite 收敛和 persisted retry | RN 现有消息发送 consumer 冻结；真实失败重试未执行 |
| compatibility guard | `pass` | type108 新增失败重试后，隐藏发送人转发仍按原矩阵拒绝名片；全量 guard 回归证明零 optimistic/network 副作用 | 普通服务端转发仍按既有能力运行 |
| H5 UI | `done-local` | 附件面板增加 RN 名片资产；用户/群 tab、搜索、单选、显式发送；单聊排除本人和当前对端；页面不构造 Gateway body | 拍照、音视频通话附件动作仍待 residual inventory |
| browser | `pass-no-send` | 412px 真实单聊仅展示第三位好友；群 tab 真实空态；选中后按钮解锁；`scrollWidth=clientWidth=412`；安全关闭并返回会话列表 | 未点击发送，未修改远端或账号数据 |
| verification | `green-local` | SDK focused 11/11、Web 83 files/340 tests；H5 focused 5/5、466 assets/typecheck/1074-module build；RN worktree clean | build 仅有既有 large-chunk warning |

## W6.a6.20.1 Forgot Password Methods Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 账号登录“忘记密码”打开手机号/邮箱/客服三分支 sheet；不再展示“接口不存在”错误替代交互 | 真实客服渠道由产品配置决定 |
| H5 platform/UI | `done-local` | 复用全局原生 `InteractionModal`；切 route 前关闭 sheet，route change 再兜底清理；客服说明不提交请求 | 无忘记密码 API，符合 RN 当前 fallback |
| browser | `pass-readonly` | 412px 三分支、单 dialog、phone/email path、零溢出；退出 donk 后使用 `15555555551/666666` 恢复 | 未请求验证码、修改密码或资料 |
| verification | `green-local` | focused 2 files/6 tests；full verify 含 SDK Web 82 files/337 tests、466 assets/typecheck、1071-module build；RN worktree clean | build 仅有既有 large-chunk warning |
| non-applicable | `web-not-applicable` | RN 网络设置是原生 HTTP/OpenIM HTTP/SOCKS proxy 注入；浏览器无等价 per-app proxy owner | Electron/Desktop 可在后续独立 platform adapter 实现 |

## W6.a6.18.3.19 QR Code In-App Share Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| target/source | `shared-core-ready/web-consumed/rn-frozen` | `forward-target-source` 统一普通转发和二维码分享的好友/群 cache-first 加载、投影与真实会话解析；SDK/RN 源码未改 | RN selector consumer frozen |
| H5 platform/UI | `done-local` | 个人/群稳定 share route；RN 好友/群 tab、搜索、单选和确认；确认后才从 shared payload 生成 320x320 PNG 并调用 `messages.sendImage` | 真实上传/发送与可选附言当前 RN UI 已注释，不新增 Web-only 路径 |
| authenticated browser | `pass-no-send` | 真实账号两位好友；412px tab/单选/按钮门禁/安全返回/零横向溢出；群 tab 空态真实显示 | 当前账号 joined groups 为空，群目标卡片 data-gated；未点击最终分享 |
| verification | `green-local` | H5 focused 6 files/13 tests；full verify 含 SDK Web 82 files/337 tests、466 assets/typecheck、1070-module build；RN worktree clean | second-account realtime/list-back only |

## W6.a6.18.3.18 Group QR Code Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared payload/source | `shared-core-ready/web-consumed/rn-frozen` | `buildIM28GroupQRCodePayload` 统一 groupCard；群会话/cache/sync 精确匹配，单聊和缺失群 fail-closed；无页面 Gateway 请求 | RN helper/page consumer frozen |
| H5 platform/UI | `done-local` | 群资料增加 `/settings/qrcode`；个人/群共用 `QRCodeDisplay`、Canvas、PNG、Web Share 与异步 cleanup；扫码返回严格绑定同一路由 | 应用内发送、真实下载/系统分享 |
| authenticated browser | `pass-data-gated` | 412px 个人二维码抽取回归完整、Canvas 268x268、零溢出；缺失群深链显示真实错误 | 当前账号仅两条单聊且 joined groups 为空，真实群视觉不可证明 |
| verification | `green-local` | focused 5 files/13 tests；full verify 含 SDK Web 82 files/337 tests、466 assets/typecheck、1067-module build；RN worktree clean | valid group account、external browser matrix only |

## W6.a6.18.3.17 Personal QR Code Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared payload/profile | `shared-core-ready/web-consumed/rn-frozen` | `buildIM28UserQRCodePayload` 统一用户码；`profile.getCurrent` 提供真实昵称/头像/ID；页面不复制协议或资料 DTO | RN helper/page consumer frozen |
| H5 platform/UI | `done-local` | `/me/qrcode` React Router lazy route；Canvas 高纠错二维码、居中头像 fallback、PNG 下载与文件 Web Share；渲染成功前导出 fail-closed | 真实系统下载/分享弹窗、跨浏览器文件分享 |
| authenticated browser | `pass-readonly` | 真实账号从 `/me`、`/me/profile`、`/scan` 三入口可达；412x786 与 1280x800 完整二维码、零横向溢出 | 未点击下载/分享，未请求相机或相册 |
| verification | `green-local` | H5 focused 5/5；full verify 含 SDK Web 82 files/337 tests、466 assets、typecheck、1064-module production build；RN worktree clean | 外部下载/分享/browser matrix only |

## W6.a6.18.3.16 QR Scanner Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared QR contract | `shared-core-ready/web-consumed/rn-frozen` | myCard/groupCard JSON、im28 URL、legacy user JSON、source/type/encoding fail-closed；public group/get + qrcode apply facade | RN helper/NativeModule consumer frozen |
| H5 platform/UI | `done-local` | 首页扫一扫；`/scan` dynamic ZXing；user profile/source propagation；`/groups/:groupID/apply`；click-only permission、stop/late-permission cleanup | physical camera、album file、real recognized QR、Safari/Firefox |
| authenticated browser | `pass-readonly` | 412x786 首页菜单与扫码首屏；412/412 无横向溢出；未触发权限；历史群 ID 真实返回“资源不存在”而非假资料 | known valid public group、real apply/list-back |
| verification | `green-local` | SDK QR+group application 9/9、Web 82 files/337 tests、build:web/sync:web；H5 focused 7/7、typecheck、1031-module build；RN status clean | external permission/recognition/mutation only |

## W6.a6.18.3.15.2 Voice Broadcast Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared audio broadcast | `shared-core-ready/web-consumed/rn-frozen` | `prepareWebIMAudioUpload` 统一 audio MIME、1–60 秒、size/body；整批 upload once + batch-send once；沿用 partial/cache owner | real recorder/upload/send；RN consumer frozen |
| H5 recorder/UI | `done-local` | 直接复用聊天 recorder/hook/gesture/CSS owner；2 秒、60 秒、上滑 56px、permission-await 与 route cleanup | physical hold、permission、audio playback、Safari/Firefox |
| authenticated browser | `pass-readonly` | 412x786 compose 语音/键盘模式切换，“按住说话”可见；未 pointer-down | 未录音、未上传、未发送 |
| verification | `green-local` | SDK voice focused 9/9、全量 82 files/335 tests、build:web/sync:web；H5 recorder 6/6、466 assets、typecheck、797-module build；RN status clean | external recorder/send/browser matrix only |

## W6.a6.18.3.15.1 Media Broadcast Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared media broadcast | `shared-core-ready/web-consumed/rn-frozen` | image/video/file 复用普通发送 MIME/size/duration/dimension/body；整批 upload once + batch-send once；上传失败零 Gateway；切号 fail-closed；逐目标/cache 复用文本 owner | voice broadcast；RN consumer frozen；real send/realtime/list-back |
| H5 compose | `done-local` | RN 资产图片/视频/文件入口；复用聊天选择校验和 video metadata；页面级可回收预览；只调用 `sync.messageBroadcast` | file chooser/真实上传、physical touch、Safari/Firefox |
| authenticated browser | `pass-readonly` | 412x786 真实好友进入 compose；三媒体入口可见；surface 412/412 无横向溢出；composer 123px；console error=0 | 未选择文件、未上传、未发送 |
| verification | `green-local` | SDK media focused 6/6、全量 82 files/334 tests、build:web/sync:web；H5 media helpers 8/8、466 assets、typecheck、796-module build；RN status clean | external upload/send/browser matrix only |

语音群发需要复用 shared `message-audio-send` 的 1–60 秒和 body owner，但录音权限、MediaRecorder、按住说话交互属于 Web adapter；二维码扫描继续保持独立浏览器 platform slice。

## W6.a6.18.3.15 Text Broadcast Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared broadcast | `shared-core-ready/web-consumed/rn-frozen` | 1–50、trim/保序去重、stable batch/client IDs、one batch-send、逐目标 sent/failed/unknown、真实会话校验和 success-only message/conversation transaction | RN consumer frozen；real partial/result/realtime/list-back |
| H5 route/UI | `done-local` | 会话/通讯录共享入口；`/broadcast/select -> /broadcast/compose`；好友/群 cache-first、搜索/全选/上限、text draft、逐目标计数；Router state 仅稳定 ID | media broadcast、physical touch、Safari/Firefox |
| authenticated browser | `pass-readonly` | 412x786 下真实 2 好友；选择一人、进入 compose、空文本 disabled、填写后 enabled、退出回 conversations；scrollWidth=innerWidth；console warning/error=0 | 未点击发送，未修改账号或远端数据 |
| verification | `green-local` | SDK real sql.js 3/3、全量 82 files/331 tests、typecheck:web/build:web/sync:web；H5 route/view 4/4、466 assets、typecheck、793-module build；生产 route 200 | external send/browser matrix only |

媒体群发没有以临时 Blob URL 或页面 OSS 调用补齐；后续 `.15.1` 必须复用 shared media upload/body/checkpoint 状态机。扫码依赖浏览器摄像头、HTTPS、permission 和二维码解析 port，保持另一独立切片。

## W6.a6.18.3.14 Group Creation Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| residual inventory | `refreshed` | RN Screen/production caller、H5 route/page 与 active ledger 交叉过滤；外部验收门和平台专属项不重复计为开发缺口 | inventory remains living SSOT |
| shared creation | `shared-core-ready/web-consumed/rn-frozen` | 2–998、trim/去重/本人拒绝、默认群名、one Gateway write、strict group/conversation IDs、群/会话原子事务和 `remote-only` 防重放 | RN consumer frozen；real create/realtime/second-account/list-back |
| H5 route/UI | `done-local` | `/groups/create`、cache-first 好友、五列选择/搜索/上限/返回来源、会话与通讯录共享更多入口；只进入真实 conversation ID | authenticated non-empty read-only visual、physical touch、Safari/Firefox、real create |
| verification | `green-local` | SDK creation 4/4、creation+lifecycle 10/10、typecheck:web；H5 creation+lifecycle view 6/6、typecheck、build 784 modules；RN status clean | full verify and external mutation smoke |

## W6.a6.18.3.13.6 Closeout (2026-08-13)

| gate | verdict | evidence | residual |
| :--- | :--- | :--- | :--- |
| SDK shared owner | `pass-local` | `createIMGroupLifecycleSync`；leave/dismiss preflight、one Gateway write、strict group identity、group-domain transaction/rollback、`local\|remote-only`；群管理 related 27/27 | real leave/dismiss + server-denial + second-account realtime/list-back |
| H5 consumer | `pass-local` | 群设置页只消费 `permissions.canQuitGroup/canDismissGroup` 与 `sync.groupLifecycle`；native dialog、remote-only fail-visible/lock；focused 12/12 + typecheck/build | real owner/member group confirmation visual and final result |
| browser read-only | `pass-data-gated` | current account conversations route healthy、console blocking error=0；stale group deep link fail-visible | current account only has two single chats, so group action/modal visual unavailable without fabricating data |
| RN freeze | `pass` | `im28-phone` worktree clean；未运行 `build:rn/sync:rn/build:all` | RN consumer convergence requires separate authorization |

## W6.a6.18.3.13.5 Closeout (2026-08-13)

| gate | verdict | evidence | residual |
| :--- | :--- | :--- | :--- |
| SDK shared owner | `pass-local` | `createIMGroupManagementSync`；field permission、exactly-once、strict group/member identity、preserve-raw、`local\|remote-only`；focused 28/28 | real toggle/mute + server-denial + second-account realtime/list-back |
| H5 consumer | `pass-local` | `/settings/manage`、`/manage/mute`、`/manage/speech-frequency` 只消费 `sync.groupManagement`；focused 14/14 + typecheck/build | authenticated group sample unavailable after current account cache changed |
| browser read-only | `pass-data-gated` | three deep links resolve；missing-group fail-visible；412px `scrollWidth=innerWidth`；console error=0；no mutation executed | real group values、confirmation visual、mobile/Safari/Firefox |
| RN freeze | `pass` | `im28-phone` worktree clean；未运行 `build:rn/sync:rn/build:all` | RN consumer convergence requires separate authorization |
- blockers: `W5.a3 browser matrix remains blocked-environment；destructive/send/edit/delete/clear and real dual-account RTC flows require explicit authorization`
- gate_state: `W6 group-profile compatibility exit converged/local；真实群资料/公告写入与第二账号 realtime/list-back 未授权；clear-history、archive and incoming-call prior gates remain unchanged`
- latest_interaction_evidence: `2026-08-13 H5 interaction closeout: components/interaction 单一 owner 提供 route main-only、realtime tail-message、TabBar selected 和 native dialog；prefers-reduced-motion fail-quiet；ConversationDeleteSheet 成为首个 modal consumer；H5 typecheck/build、466 assets、390x844 zero-overflow、authenticated tab route/zero-console passed；空账号无会话，真实 delete-sheet/message-entry visual remains data-gated；SDK/RN/build:package:desktop:web untouched`
- latest_group_introduction_evidence: `2026-08-12 group-introduction closeout: SDK 74 files/287 tests + all-runtime typecheck/boundary、build:rn/build:web；RN tsc + openIMService 128/128；H5 full verify，SDK Web 71 files/282 tests、466 assets/typecheck/743-module production build；authenticated real owner/admin group opened 500-char editor and cancelled，567px zero-overflow/zero-console；no update/type1521/list-back；build:package:desktop:web untouched`
- latest_evidence: `2026-08-12 group-announcement convergence closeout: SDK Web 73 files/290 tests including real sql.js publish/read/realtime 8/8、all-runtime typecheck/boundary、build:rn/build:web；RN tsc + announcement/detail/openIMService 146/146；H5 full verify、466 assets、748-module production build；authenticated owner group showed forced read-only detail and editor/publish-confirm cancel at 567px with zero overflow；no update/send/read-mark/type1519/list-back；build:package:desktop:web untouched`
- latest_group_profile_compat_evidence: `2026-08-12 combined group-profile compatibility exit: zero RN/H5 combined production callers；RN request type is a mutually-exclusive single-field union；Gateway/OpenIM fallback and unused adapters removed；SDK all-runtime typecheck/boundary + group-profile/announcement 7/7；RN tsc + openIMService 128/128；H5 typecheck + related view 12/12；no real update/send/read/list-back；build:package:desktop:web untouched`
- latest_group_management_audit_evidence: `2026-08-12 read-only caller/owner trace: 8 mutation capabilities across invite/remove/admin/settings/mute/transfer/leave/dismiss；SDK transport exists but shared mutation owner absent；H5 caller count 0；RN invite may replay after post-write sync failure and five domains catch arbitrary Gateway errors then call OpenIM；no source/runtime mutation, no real write, build:package:desktop:web untouched`
- latest_group_management_permission_evidence: `2026-08-12 neutral resolveIMGroupManagementPermissions + WebIMJoinedGroup.permissions；SDK all-runtime typecheck/boundary + 11/11；RN tsc + helper 29/29；H5 full verify SDK Web 74/293、466 assets、749-module build plus focused 18/18；zero production owner/admin permission recomputation in H5 chat/conversation actions；no real mutation；build:package:desktop:web untouched`
- latest_rn_freeze_evidence: `2026-08-12 RN 12 个 tracked 业务文件与 packages/im-sdk 恢复 HEAD、3 个新增 composition 文件及其生成产物移除；im28-phone 整仓 worktree clean，npx tsc --noEmit 通过；H5/Web 后续只 build:web/sync:web，不改 RN 业务源码或 RN 本地 SDK 包`
- latest_group_member_removal_evidence: `2026-08-12 shared removeIMGroupMembers/createIMGroupMentionSync.removeMembers 为 Web owner；stable-ID 去重、角色目标限制、exactly-once Gateway write、group/member transaction、authoritative|local|remote-only；H5 React Router 页面消费，RN kickGroupMembers 保持冻结基线且不是 shared consumer；真实移除未执行，build:package:desktop:web 未修改或执行`
- latest_group_member_invitation_evidence: `2026-08-12 新 OpenAPI requester_user_ids + data.list 已进入 Gateway facade；shared inviteIMGroupMembers/createIMGroupMentionSync.inviteMembers 按 join_approval_required 选择 application|direct，好友 allow_group_invite fail-closed、exactly-once、strict response、authoritative|local|remote-only；H5 /settings/members/invite 消费，SDK 17/17、H5 10/10/typecheck/build；真实邀请未执行，RN worktree clean，build:package:desktop:web 未修改或执行`
- latest_group_admin_owner_evidence: `2026-08-13 shared set/cancel admins + transfer owner 持有 owner/target/admin-limit 校验、exactly-once Gateway、group/member 原子事务、权限降级和独立权威刷新；候选过滤也归 SDK；H5 /settings/manage 只持有 React Router/list/picker/native dialog；SDK related 16/16 + new 4/4、build:web/typecheck；H5 focused 11/11 + typecheck/build；未执行真实 mutation，im28-phone 零改动，build:package:desktop:web 未修改或执行`
- latest_group_card_evidence: `2026-08-12 group-card closeout: SDK contact-actions 12/12、RN/Web typecheck、build:rn/build:web；RN tsc + 43 focused；H5 focused 9/9、typecheck/build；authenticated real group showed entry, 7 real friend targets, search/single-select/cancel and 480px no-overflow；no share/send mutation；build:package:desktop:web untouched`
- latest_group_profile_evidence: `2026-08-12 group-profile-name closeout: SDK joined-group 6/6、all-runtime typecheck/boundary、build:rn/build:web；RN tsc + openIMService 126/126 + group UI 5/5；H5 focused 10/10 + full verify，SDK Web 70/278、466 assets/typecheck/production build；authenticated real group opened profile/name editor and cancelled with 567px no-overflow/zero console error；no update/copy mutation；build:package:desktop:web untouched`
- latest_group_avatar_evidence: `2026-08-12 group-avatar closeout: SDK 73 files/285 tests + all-runtime typecheck/boundary、build:rn/build:web；RN openIMService 127/127；H5 crop/profile 4/4、typecheck/production build；authenticated real group opened local 360px circular crop preview at 567x786, image decode/confirm readiness/zero-overflow/zero-console passed then cancelled；no upload/update mutation；build:package:desktop:web untouched`

## W6.a6.18.3.13 Group Management Mutation Contract Audit

| capability | state | frozen contract |
| :--- | :--- | :--- |
| caller/owner inventory | `done-read-only` | RN production caller 已覆盖邀请、移除、管理员、设置/mute、群主转让、退群/解散；H5 mutation caller 为 0；SDK 目前只有 Gateway transport |
| duplicate-write risk | `confirmed` | invite 的 post-write member sync 失败可进入 OpenIM fallback；remove/admin/transfer/leave/dismiss 对任意 Gateway error 回退第二次写；必须改为 one action -> one remote write |
| invite semantic gap | `resolved-by-openapi` | `join_approval_required=true` 走批量 `/group/application/invite`，false 走 `/group/member/invite`；shared owner 严格校验申请列表或群回包 |
| execution split | `frozen` | permission projection -> member removal -> invite contract/core -> admin/owner -> settings/mute -> destructive lifecycle；每片最多 3 个 operation |

本切片只读审计并写入 `docs/runtime-contracts/group-management-mutations.md`，没有执行或实现任何群管理 mutation，也未修改 SDK/RN/H5 运行代码。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.13.1 Shared Group Management Permissions

| capability | state | frozen contract |
| :--- | :--- | :--- |
| canonical owner | `shared-core-ready/web-consumed/rn-frozen` | SDK resolver 服务 Web；RN 保持现有权限实现，不宣称跨端唯一 owner |
| RN consumer | `frozen/not-consumed` | `getGroupPermissions(currentMember, group)` 已恢复当前 RN 基线，本任务不得改动 |
| H5 consumer | `pass-local` | `WebIMJoinedGroup.permissions` 驱动群资料、简介、自动删除、消息/会话全员清理 presentation；页面不读 raw payload、不按角色重算 |
| verification | `green` | SDK all-runtime + 11 tests；RN tsc + 29 tests；H5 full verify 74/293、466 assets、749 modules + focused 18 tests |

本切片只有只读权限投影和 consumer 收敛，没有新增操作按钮、调用 Gateway mutation 或写入 SQLite。测试 fixture 也调用 production resolver，不维护第二份角色表。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.13.2 Shared Group Member Removal

| capability | state | frozen contract |
| :--- | :--- | :--- |
| canonical owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一 Web stable-ID 去重、目标限制、exactly-once Gateway remove、群资料与成员事务、后置权威刷新 |
| RN consumer | `frozen/not-consumed` | `openIMService.kickGroupMembers`、Gateway/OpenIM 兼容与事件投影保持当前 RN 基线 |
| H5 consumer | `pass-local/read-only-proof` | React Router 成员选择页复用 shared permission/candidate/display resolver；搜索、选择、确认属于 presentation；`remote-only` 阻止再次提交 |
| partial success | `fail-visible` | 远端成功且本地提交失败后只允许权威 refresh；refresh 仍失败返回 `remote-only`，不得自动重放远端删除 |
| acceptance | `web-local-green/rn-source-clean/external-gated` | shared/H5 自动回归；RN 只验证源码零差异和 package 兼容；真实移除、第二账号 realtime/list-back 仍需显式批准 |

本切片没有执行真实群成员移除。浏览器验收仅允许打开候选页、搜索、选择并取消确认；不得点击最终“移除”。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.13.3 Shared Group Member Invitation

| capability | state | frozen contract |
| :--- | :--- | :--- |
| canonical owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一好友/成员/权限 preflight、审核分支、exactly-once Gateway write、严格响应和后置权威刷新 |
| approval branch | `resolved` | `join_approval_required=true` 批量创建 invite applications；false 批量直接入群；审核开关缺失 fail-closed |
| H5 consumer | `pass-local/no-real-write` | `/settings/members/invite` 只持有好友搜索、选择、验证消息和反馈，候选只接受 `allowGroupInvite=true` |
| RN consumer | `frozen/not-consumed` | RN `inviteUsersToGroup`、Gateway/OpenIM fallback 与 UI/event 投影保持当前业务基线 |
| partial success | `fail-visible` | 远端成功后的群 cache/成员 refresh 失败返回 `local|remote-only`，调用方不得自动重放邀请 |
| acceptance | `web-local-green/external-gated` | SDK 17/17、H5 10/10/typecheck/build、dev-pc 运行；真实邀请与第二账号 application/member realtime/list-back 未执行 |

本切片未点击最终邀请，不创建申请、不直接加群、不发送验证消息。仅执行 `build:web/sync:web`，未运行 RN 或 Desktop 发布脚本；`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.13.4 Shared Group Admin And Owner

| capability | state | frozen contract |
| :--- | :--- | :--- |
| canonical owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一 owner capability、目标角色、管理员上限、exactly-once、原子角色事务与独立权威刷新 |
| H5 consumer | `pass-local/no-real-write` | `/settings/manage` 只持有列表、选择、确认与反馈；候选过滤调用 shared helper，三种提交只调用 `groupMembers` facade |
| RN consumer | `frozen/not-consumed` | RN `updateGroupMemberRole/transferGroupOwner` 与页面事件链保持现有业务基线，本切片零修改 |
| partial success | `fail-visible` | 远端成功后本地/刷新失败返回 `remote-only|local`，禁止重放 set/cancel/transfer；转让后缺失权限按 member fail-closed |
| acceptance | `web-local-green/external-gated` | SDK 16/16 + 4/4、H5 11/11/typecheck/build；真实角色变更与第二账号 realtime/list-back 未执行 |

本切片没有确认最终管理员或群主操作。只执行 `build:web/sync:web`，未运行 RN/Desktop 构建或同步；`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.12 Group Profile Combined Compatibility Exit

| capability | state | frozen contract |
| :--- | :--- | :--- |
| caller inventory | `pass` | RN 4 个 production caller 均为 name/avatar/introduction 单字段；H5 分别调用 `groups.updateName/updateAvatar/updateIntroduction`，公告调用专属 facade；组合 caller 为 0 |
| compatibility exit | `converged/local` | `UpdateGroupInfoRequest` 是互斥单字段 union；运行时拒绝组合和公告参数；旧 Gateway helper、OpenIM adapter method 与 `setGroupInfo` fallback 已删除 |
| behavior preservation | `pass-local` | RN 页面、选图/裁剪/上传、shared 成功后的 group/conversation cache 与事件投影未改；H5 无源代码改动 |
| verification | `green` | SDK all-runtime typecheck/boundary + 7 shared tests；RN tsc + 128 service tests；H5 typecheck + 12 related view tests；无真实 mutation |

本切片只删除无生产消费者的兼容成功路径，没有调用 `/v1/group/update`、发送公告消息或写入 SQLite。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.11 Shared Group Announcement

| capability | state | frozen contract |
| :--- | :--- | :--- |
| shared mutation owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 持有 Web 非空 trim/1000、权限、Gateway 回包、groups merge、`update -> type101` 顺序和部分成功 |
| read/realtime owner | `converged/local` | mark 实际展示版本后必须复查权威 status；缺失 `is_read` fail-visible；type1519 只按结构化事件更新已有群 cache，发布者已读、其他成员未读、重复事件幂等 |
| RN/Web consumers | `web-pass/rn-frozen` | H5 只持有 React Router、表单、确认层、聊天横幅和查看导航；RN 公告链已恢复冻结基线，不是本轮 shared consumer |
| acceptance | `local-green/external-gated` | SDK 73/290、RN tsc + 146、H5 full verify/466/748、认证 567px 只读与确认取消通过；真实发布、发送、read mark 和第二账号 type1519/list-back 保留授权门 |

本切片没有发布公告、发送消息或标记已读。浏览器只填写临时草稿以验证发布前确认层并取消；历史启动期“未登录”日志不作为本路由新增错误。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.10 Shared Group Introduction

| capability | state | frozen contract |
| :--- | :--- | :--- |
| shared mutation owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 持有 Web 非空 trim/500 字、权限、Gateway 回包和 success-only groups merge |
| RN consumer | `frozen/not-consumed` | RN introduction 更新、页面、内存 cache 与事件语义保持当前基线 |
| H5 route/UI | `pass-auth-readonly` | 现有 React Router 群简介页按 shared role 切换 RN 编辑/只读态；页面不调用 Gateway/SQL |
| acceptance | `local-green/external-gated` | SDK/RN/H5 回归、build:rn/build:web、真实账号打开/取消通过；真实保存和第二账号 type1521/list-back 保留授权门 |

本切片不包含公告、成员邀请/移除、组合群资料更新，也不修改或执行 `build:package:desktop:web`。浏览器只打开真实群简介编辑页并取消，没有调用 `/v1/group/update`。

## W6.a6.18.3.9 Shared Group Avatar

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared mutation owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 持有 Web 权限、图片/上传、Gateway 响应匹配和 success-only SQLite merge | authorized real upload/update、server permission denial sample |
| RN consumer | `frozen/not-consumed` | RN 选库/相机、裁剪、上传、更新与事件链保持当前基线 | simulator/device baseline regression |
| H5 platform UI | `pass-auth-local-preview` | 群头像行按 shared 角色开放浏览器选择；JPEG/PNG/WEBP、10MB、拖动/1-4x 缩放、圆形预览和 512x512 JPEG Canvas 输出后才调用 `groups.updateAvatar` | authorized real upload/result/list-back |
| runtime/layout | `pass-chromium` | 真实群资料 567x786、360x360 裁剪区、图片解码、确认就绪、取消、零横向溢出与零 console warning/error | dark/desktop/Safari/Firefox、touch drag |

本切片只选择仓库静态图片打开本地裁剪并取消，没有触发 OSS 上传、`/v1/group/update` 或 SQLite mutation。该头像切片关闭时简介仍走 RN 原路径，现已由 `.18.3.10` 收敛；公告和组合更新仍保留兼容路径。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.8 Shared Group Profile Name

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared mutation owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 持有 Web 群名权限、校验、Gateway 响应匹配和 success-only SQLite upsert | authorized real update、server permission denial sample |
| RN consumer | `frozen/not-consumed` | RN `openIMService.updateGroupInfo`、内存 cache 与事件链保持当前基线 | simulator/device baseline regression |
| H5 route/UI | `pass-auth-readonly` | 群设置真实资料头进入 `/settings/profile`；群头像只读，owner/admin 群名可打开编辑层，群 ID 提供真实 clipboard action | authorized save/copy result、ordinary-member sample |
| runtime/layout | `pass-chromium` | 真实 `donk的群聊`/`64866675923` 加载、编辑层打开/取消、567x786 无横向溢出且 console error 为空 | dark/device/Safari/Firefox |

本切片没有保存群名或点击复制。该名称切片关闭时其他字段尚未收敛；头像/简介现已由 `.18.3.9/.18.3.10` 闭环，公告和组合更新仍为兼容路径。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.7 Shared Group Card

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared send owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 持有 Web 好友目标、单聊打开、type108/type101 顺序和 SQLite 状态收敛 | authorized real send、partial failure/retry |
| RN consumer | `frozen/not-consumed` | RN `openIMService.shareGroupCard` 与事件语义保持当前基线 | simulator/device baseline regression |
| H5 route/UI | `pass-auth-readonly` | 群设置进入独立 React Router 选择页；对齐 RN 当前 production UI，仅好友、单选、无附言输入，显式“分享”后才调用 shared facade | authorized share success/failure navigation |
| runtime/layout | `pass-chromium` | 真实群加载 7 个好友目标，搜索、选择、取消和返回通过；480px surface 无横向溢出且 warning/error 为空 | physical touch、dark/Safari/Firefox |

本切片没有点击“分享”，没有创建单聊或写入消息。RN 当前群名片选择器未启用群目标且附言输入被注释，H5 因此不自行扩展这两项；SDK 仍保留可选附言能力。`build:package:desktop:web` 未修改或执行。

## W6 Shared Group Announcement Readonly Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared DTO | `shared-core-ready/web-consumed` | `WebIMJoinedGroup` 从同一 Gateway/SQLite payload 投影公告、版本和显式编辑权限，旧快照按群主规则回退 | RN consumer convergence for update/read status |
| RN visibility parity | `pass-auth-readonly` | H5 仅对匹配群的 owner/admin 显示公告卡，位置在置顶/免打扰之后、清空记录之前；空副标题“未设置” | ordinary-member authenticated sample |
| detail owner | `pass` | 简介/公告共用 `GroupTextDetailPage` 的会话校验、cache-first 群同步、失败与布局；公告页只配置字段/标题/空值 | non-empty real announcement sample |
| runtime/layout | `pass-chromium` | 真实 owner/admin 群进入 `/settings/announcement` 显示“暂无群公告”，返回群设置且 480px surface 无横向溢出 | dark/device/Safari/Firefox；dev HMR history logs not used as zero-console evidence |

## W6.a6.18.3.6 Self Group Nickname

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared mutation | `done-local` | SDK 固定当前认证 userID、24 字非空校验、一次 Gateway update、响应身份校验和 success-only 单成员 SQLite upsert | real authorized update、server permission denial sample |
| cache/identity | `pass` | 当前成员缺失 fail-closed；Gateway 失败/身份错配/非法输入均保留旧 cache；返回 DTO 继续使用 shared 名称 resolver | remote second-client nickname event contract |
| H5 consumer | `done-local/interaction-unverified` | 群设置 RN 同顺序显示“我在本群的昵称”，编辑层含 24 字输入、取消/保存/保存态和可见错误；页面不调用 Gateway/SQL | browser open/cancel/layout proof；real save explicitly not executed |
| RN boundary | `pass` | RN 业务源码未改，`build:rn` 仅同步 generated package，RN `tsc` 通过 | future guarded consumer convergence |

本切片没有注册 Web-only realtime listener，也未执行真实群昵称保存。Gateway 尚无稳定群成员昵称事件合同，因此 realtime/list-back 保留显式外部验收门。

本切片未执行 `/v1/group/update`、公告已读标记、公告文本发送或其他群管理 mutation。SDK 使用普通 `build:rn/build:web` 同步应用包；`build:package:desktop:web` 未修改或执行。

## W6 Group Introduction Readonly Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| source parity | `pass` | RN 群设置第二卡顺序、空值副标题“请输入群的内容介绍”、详情空值“暂无群简介”和只读页脚均已对齐 | owner/admin edit mode |
| data owner | `pass` | H5 只消费当前账号 `conversations` 与 `groups` cache-first/sync facade；同目标群匹配后才投影 `introduction` | offline-source isolation、remote non-empty sample |
| route/failure | `pass-auth-readonly` | `/conversations/:conversationID/settings/introduction` 可深链和返回；单聊误入、会话缺失、群资料缺失均 fail visible | cross-browser history matrix |
| layout/runtime | `pass-chromium` | 567x786 与 390x844 surface/footer/正文无横向溢出，零 console error | physical device、dark theme |

该只读切片当时未新增或修改 SDK/RN source，也未调用群资料更新接口；编辑 owner 后续由 `.18.3.10` 收敛。真实编辑、分享、邀请、移除或其他群管理 mutation 仍未执行；`build:package:desktop:web` 未修改或执行。

## W6 Archived Conversation Route Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared owner | `converged/local` | `createIMConversationArchiveSync` 单一持有全分页、loop/page guard、mapping、latest message 和权威 SQLite 快照收敛 | real second-account list-back |
| cache separation | `pass` | 普通会话 `replaceUnarchived` 保留归档行；`isArchived` 与 clear-history `listHidden` 分离，并兼容清理历史 RN 双置位数据 | old-device upgrade sample |
| RN consumer | `pass-local` | `conversation-archive-shared-service` 只注入 Nitro SQLite、Gateway 和已有 profile hydration；旧私有 pager/replacer 已删除 | simulator/device archive refresh |
| H5 route/UI | `pass-auth-readonly` | 主列表真实归档通栏进入 `/conversations/archived`；30-row cache pagination、本地搜索、top-only pull refresh、长按取消归档菜单和最后一条移除后返回均已接线 | physical touch、authorized cancel/delete |
| runtime/layout | `pass-chromium` | 567x786 真实 `donk三大爷` 归档行、480px surface、无横向溢出、零 warning/error | Safari/Firefox、dark/desktop matrix |

本切片未执行取消归档、删除、已读、置顶或免打扰 mutation。H5 页面不持有 Gateway/SQL/DTO 状态机；`build:package:desktop:web` 未修改或执行。

## W6 Contact Profile Core Action Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared owner | `converged/local` | `IMContactActionsSync` 单一持有备注、星标、黑名单、共同群完整分页和 cache convergence；RN 五个直连 Gateway helpers 已删除 | real mutation/list-back and second client |
| RN consumer | `pass-local` | `openIMService` 只保留既有 snapshot/event/DTO/failure projection，SQLite 与 Gateway 写入委托 shared facade | simulator/device regression |
| friend profile UI | `done-local/read-only-accepted` | 三项快捷操作、发消息、备注/签名、来源、添加时间、共同群数量、名片分享、更多/黑名单/删除确认层与 RN 结构一致 | authorized writes、dark/cross-browser |
| common groups | `done-local/read-only-accepted` | `/contacts/users/:userID/groups` 真实显示 3 群；只从当前账号 canonical conversation 集合解析路由，缺失时 fail visible | open-group mutation/persistence and large pagination |
| mutation boundary | `pass` | sheet/dialog 打开不触发写入；页面只在明确媒体类型、保存、确认黑名单或删除范围后调用 shared owner；星标和备注成功后才更新 UI | real operation result/failure visual matrix |

好友来源已由 `GatewayFriend.source_type -> WebIMPeerProfile.sourceType/sourceLabel -> RN/H5` 形成唯一事实链，空字段保持空白且不伪造“未知来源”。Authenticated Chromium 只读取资料与布局；未保存备注、未切换星标/黑名单、未删除/分享、未创建会话、未发起通话或请求媒体权限。

## W6 Group Members Route Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| settings entry | `pass-auth-readonly` | 群设置复用真实成员预览，并通过“全部”进入 `/conversations/:conversationID/settings/members` | large-group pagination/performance |
| member list | `pass-auth-readonly` | cache-first 后 shared `groupMembers.sync`；真实群显示 4 名成员且 owner 标签正确 | offline cache isolation、admin sample |
| identity | `converged` | 设置预览与完整列表统一消费 SDK `resolveIMGroupMemberDisplayName`，保持 `备注 > 群内昵称 > 公开昵称 > userID` | second-client nickname-change sample |
| search/navigation | `pass-chromium` | 名称/userID 过滤、拼音分组、成员资料跳转和 Router state 返回均通过 | Safari/Firefox history matrix |
| layout/runtime | `pass-chromium` | 567x786 与 390x844 均无横向溢出、无 console error | physical-touch pull refresh |

本切片不新增 Gateway、SQLite、WebSocket 或身份规则 owner，也不执行 presence、成员邀请/移除、好友申请或其他群管理 mutation。SDK 与 RN source 均未修改。

## W6 Shared RTC Control Convergence

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| control truth | `converged/local` | `createIMCallControlSync` owns auth、stable IDs、six Gateway lifecycle operations、credential validation、URL normalization and E2EE fail-closed | real authorized call signaling |
| RN consumer | `pass-local` | `call-control-shared-service` injects Nitro SQLite/Gateway/RN URL adapter；`openIMService` retains profile/cache/UI projection only；six duplicate Gateway helpers removed | device smoke and real peer call |
| Web consumer | `pass-local` | `WebIMSync.calls` delegates the same facade；production runtime forwards browser UUID owner as client call ID；全局 Provider 统一消费呼入/呼出 | real dual-account call signaling |
| Web media runtime | `pass-local/real-port` | `/web` only state machines + real LiveKit Room/track/device adapter + outgoing/incoming orchestrators；credentials never enter snapshot/cache，H5 active route owns DOM/navigation only | real dual-account permission/connect/reconnect/hangup and background behavior |
| call record detail | `converged/local` | `createIMCallRecordSync` owns lossless raw cache、detail merge/writeback and same-day filters；RN detail composition and H5 `/calls/:callID` consume it | real multi-row duration/status matrix and cross-browser acceptance |
| call record lifecycle | `converged/local` | shared parser/facade owns remote list/full sync、cache、detail、delete、pending、terminal wrapper/status/write；RN/Web production callers consume it，`/calls` subscribes data version | real delete and dual-account terminal-event/list-back acceptance |
| incoming call | `converged-local/acceptance-gated` | SDK strict parser + shared lifecycle own type1601..1608、event/call dedupe、终态乱序保护、pending 校验和 answer/reject composition；Web runtime 发布无凭据 snapshot；H5 全局 Provider 投影 banner/fullscreen/draggable floating、visibility refresh、ringtone/autoplay recovery 和活动通话 route | real dual-account invite/answer/reject/timeout、background/multi-tab、ringer and media permission acceptance |

No Gateway call operation、delete、media permission、ringtone playback or LiveKit room was executed. Incoming UI closeout proof includes SDK all-runtime typecheck/boundary、incoming/runtime 22/22 and final orchestrator/runtime 15/15、`build:web` generated package sync；H5 typecheck、tone/UI 6/6、production build and authenticated browser cold zero-overlay/zero-console smoke。Reject does not construct a media session；answer only creates LiveKit media after Gateway confirms；remote terminal only releases media and does not echo hangup；token never enters React snapshot/cache。RN/Desktop runtime behavior and `build:package:desktop:web` remain untouched.

## W6 Contact List Interaction Contract

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| cache-first load | `pass-auth-readonly` | `/contacts` calls `contacts.listCached()` before the existing canonical `contacts.list()`；cache failure does not manufacture success and remote failure stays visible | explicit offline Gateway-block proof |
| pull-to-refresh | `pass-contract/chromium` | shared browser hook owns top-only single-touch damping、56px threshold and 76px cap；contacts release calls only `contacts.list()` and preserves existing rows on failure | physical touch device and Safari overscroll behavior |
| right index | `pass-auth-readonly` | RN search icon semantics are preserved as “scroll to top”，not a duplicate search route；A/D/Z/H buttons own selected state and smooth section scroll；390x600 D proof reached `scrollY=196` without overflow | drag-through letter selection and long-list viewport tracking |
| top search route | `pass-auth-readonly` | existing search surface continues to enter React Router `/contacts/search` | cross-browser history matrix |
| friend long-press menu | `done-local/read-only-menu` | 300ms pointer/touch、8px movement cancellation and right-click render exactly `发消息/音视频通话/分享好友名片/删除好友` | physical touch、Safari/Firefox and authorized action results |
| message/call | `converged/local` | 发消息和音视频都先由 `peerProfile.openConversation` 获取 canonical ID；通话二选一后交给唯一 `WebIMCallProvider` | real conversation create and dual-account RTC |
| card/delete | `converged/local` | 名片分享独立 React Router target route only lists valid friends；确认后调用 `contacts.shareUserCard`；删除二次确认 `self|both` 后调用 `contacts.deleteFriend` | authorized Gateway result、SQLite/list-back and failure matrix |

The H5 app owns only touch/index/menu/sheet/route presentation. Contact reads、delete/card mutations and direct conversation resolution remain shared SDK owners；browser media remains the SDK `/web` port plus the single application Provider. 名片 route state 只携带公开 display fields，缺失或 userID 不匹配时回到资料页。No contact mutation、conversation creation、card share、RTC or media permission was executed.

## W6 Contact Verification Route Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| contact shortcut | `pass-auth-readonly` | `/contacts` now matches current RN with one `验证消息` shortcut plus `我的群聊`；the old separate friend/group shortcuts are gone | unread aggregate badge |
| verification tabs | `pass-auth-readonly` | `/contacts/verifications/friend|group` owns RN `验证消息` header and route-stable `好友验证/群聊验证` tabs；friend and group panels retain their existing real facades | pending friend and non-empty owner/admin group samples |
| route compatibility | `pass` | old `/contacts/friend-applications` and `/contacts/group-applications` deep links redirect to canonical tabs；group detail returns to the group tab；reload and browser back restore the expected SPA owner | non-empty group detail history |
| owner convergence | `pass` | container owns only tab route/presentation；friend accept and group audit/accept/reject remain in existing page/facade owners；no duplicate transport、SQL or application state machine | authorized mutations |
| layout/runtime | `pass-chromium` | 390x844 and 760x900 have no horizontal overflow；desktop surface is 480px；child route has no primary tabbar and no console errors | Safari/Firefox and explicit dark screenshot |

This slice performs no Gateway mutation and changes no SDK or RN source. React Router tab links use replace semantics so a page-internal tab switch does not add an extra RN-inconsistent back step.

## W6 Chat Message Presentation Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| sender identity | `pass-auth-readonly` | `resolveIMGroupMemberDisplayName` is the RN/Web/Desktop owner for `备注 > 群内昵称 > 公开昵称 > userID`；real sender IDs became `donk三大爷` and `A-Robin-0` with member avatar support | current sample contains no owner/admin sender，so role-label pixels retain fixture/unit proof only |
| mention display | `pass-auth-readonly` | stable `Message.mentions[].userID` remains unchanged while visible `@userID`/old snapshot names resolve through the same current member map；SDK UTF-16 entity reconciliation protects preset emoji offsets | second-client nickname-change realtime sample |
| image sizing | `pass-auth-readonly` | Gateway width/height use RN 180px max-width ratio；missing metadata uses browser-decoded natural dimensions；normal GIF keeps the original source while the HEIF-mislabeled JPG alone falls back to an OSS JPEG display projection | signed/private OSS variants and Safari/Firefox media decoding matrix |
| voice sizing | `pass-auth-readonly` | RN 1-10s 70% and 10-60s 30% width curve is reused；real 2s/6s samples measured 100px/146px | physical touch playback and cross-browser audio remain gated |
| forward hierarchy | `pass-auth-readonly` | `转发自` and avatar/name are two lines；incoming forwarded sender identity is inside the bubble | desktop/cross-browser visual matrix |

This slice adds no H5 identity rule: remark/group/public-name priority is owned by the SDK resolver and exported through RN/Web/Desktop entries. H5 owns only immutable message-view substitution、CSS/media layout and a browser-only OSS decoding fallback that never changes the persisted message URL. No message, mutation, download or RTC action was executed.

## W6 Conversation List Interaction Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| global search | `pass-local/auth-readonly` | search surface enters React Router `/conversations/search`；default history/empty state and real friend/group/message sections render from shared facades | cross-browser and large-result performance |
| long-press actions | `pass-local/read-only-menu` | 300ms touch/pointer contract、8px movement cancellation、right-click and RN action labels；backdrop closes without route click-through | real read/unread/pin/mute/archive/delete mutations |
| pull-to-refresh | `pass-contract` | top-only threshold/damping/release helpers and list refresh wiring are covered；empty/list layout remains stable | physical touch-device smoke and Safari overscroll behavior |
| shared action owner | `converged/local` | RN/Web both consume `createIMConversationListActionsSync` for read/manual-unread/archive；RN direct Gateway/local writes and OpenIM hide fallback removed | authorized Gateway result/list-back |

Search、menu and pull gesture are application presentation responsibilities. DTO validation、Gateway target matching、read cursor、manual unread and archive persistence are SDK responsibilities. Delete/clear uses the separate shared clear-history contract. No write action was executed during browser acceptance.

## W6 Real-account Read-only Acceptance

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| calls | `pass-readonly` | real sync/cache rendered 2 missed records；all/missed filters both returned 2；default caller is `WebIMSync.calls` | edit/delete、non-missed/duration samples、desktop/dark matrix、RTC |
| joined groups | `pass-readonly` | 11 real groups；name/ID/member count/intro and owner/admin labels；name/ID/unknown search returned 2/1/0；390x844 system-dark and 760x900 light plus history/reload passed | open-conversation persistence、offline cache isolation、Safari/Firefox |
| friend profile | `pass-readonly` | `donk二大爷` friend read plus current-account self and unknown failure states loaded through `peerProfile.get` | open-conversation persistence、real stranger and friend-application mutation |
| contact search | `pass-readonly` | known result、self filtering and unknown no-result passed locally and through explicit Gateway search | transport/business failure response and Safari/Firefox |
| blacklist | `pass-empty-read/chromium` | authenticated list operation rendered honest empty/search-empty states；permission entry、direct route、back/forward/reload、system-light/explicit-dark and zero-overflow/zero-console proof passed | non-empty enrichment/search、remove confirmation/Gateway result and Safari/Firefox matrix |

Anti-mock review found no page transport、SQL、mock branch or fake-success path in these default callers. No edit、delete、remove、conversation creation、friend application、message send、media or RTC action was executed.

## W6 Blacklist Empty-state Visual And Route Acceptance

| gate | result | evidence |
| :--- | :--- | :--- |
| RN presentation | `pass` | 40px search、RN 文案“暂无黑名单用户/未找到相关用户”、80px 空态间距与 480px Web surface match the canonical RN screen；real account returned zero blacklist rows |
| theme/layout | `pass-chromium` | 567x786 system-light and explicit dark both rendered correctly；`scrollWidth === innerWidth` and no horizontal overflow |
| route recovery | `pass` | permission settings entry、direct `/me/settings/blacklist`、back、forward and reload preserved authentication and exact SPA routes |
| runtime/console | `pass` | startup/login completed through the real runtime；display preference restored to `system`；zero warning/error after final route load |
| mutation boundary | `pass` | no row existed and no remove confirmation or Gateway mutation was triggered |

This acceptance changes no SDK or page code: the existing H5 page already matched the RN layout and consumed only `WebIMSync.blacklist`. Non-empty enrichment/search、real remove Network/result and Safari/Firefox remain explicit gates.

## W6 Applications And Settings Read-only Acceptance

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| friend applications | `pass-readonly` | authenticated shared facade returned 5 real historical rows with source/message/status projection | accept mutation、pending-state sample、search/theme/history matrix |
| group applications | `pass-empty-read` | authenticated group-audit list completed and rendered the honest empty state | non-empty owner/admin audit、detail、accept/reject and visual matrix |
| notification settings | `pass-readonly` | 7 real values loaded through `runtime.getSettings()`；default caller has no page transport or fake branch | any switch update、Network/result、Safari/Firefox；visible RN/H5 title says “全局消息免打扰” while the shared field is an enable switch，retained as cross-client label debt |
| permission settings | `pass-readonly` | 5 real values loaded through the shared settings facade | any switch update、Network/result and Safari/Firefox matrix |
| platform terms | `pass-readonly` | real user agreement and privacy policy loaded in sandboxed frames，both dated 2026-08-04 | cross-browser frame policy and failure response |
| client version | `pass-readonly` | build `1.4.1.202608092238` checked through the public adapter and returned no update | optional/forced update response and target proof |

The notification title/field mismatch already exists in the RN canonical caller: RN and H5 both treat `notification=false` as globally disabled. This slice preserves runtime parity and does not create an H5-only semantic fork. No application handling、settings update、logout or other mutation was executed.

## W6 Read-only Visual And Route Matrix

| gate | result | evidence |
| :--- | :--- | :--- |
| viewport/theme | `pass-chromium` | `/calls`、friend/group applications、settings root/notification/permission/terms and `/me` passed at `390x844` and `760x900` in system dark plus explicit local light mode |
| horizontal layout | `pass` | all 32 route/viewport/theme samples had `scrollWidth === innerWidth`；desktop content consistently constrained to 480px and centered |
| route recovery | `pass` | friend/group application direct links、back、forward and reload retained authenticated data/empty-state and exact SPA path |
| runtime/console | `pass` | preference restored to `system`、viewport override reset、preview returned to `/conversations` with runtime `online` and zero warning/error |
| mutation boundary | `pass` | no Gateway update、accept/reject、delete、logout、send or RTC；only the browser-local display preference was temporarily switched and restored |

This closes the Chromium responsive/theme/history residual for the named routes. Safari/Firefox、non-empty group-application data、pending friend application state and all business writes remain explicit gates.

## W6 Contact Negative And Self Read-only Acceptance

| capability | result | evidence | still gated |
| :--- | :--- | :--- | :--- |
| self profile | `pass-readonly` | `/contacts/users/86272753597` returned real `donk` identity and only back/copy-ID controls；no message、add-friend or more action | none for Chromium read state |
| self search filtering | `pass-readonly` | current ID produced no local profile link and Gateway results were filtered to the honest no-result state | search transport failure and Safari/Firefox |
| unknown search | `pass-readonly` | stable non-user query returned no local result and `未找到相关好友` after explicit Gateway search | transport/business failure response |
| unknown profile | `pass-failure-visible` | unknown deep link returned `资源不存在` plus same-operation retry and no profile action/fake data | backend-specific alternate error codes |
| layout/router | `pass-chromium` | 390x844 system-dark and 760x900 light had no horizontal overflow；desktop surface remained 480px；self/unknown back、forward and reload retained exact state | Safari/Firefox |
| mutation boundary | `pass` | no conversation creation、friend application、profile update or clipboard action；temporary local light mode was restored to system | all business writes remain separately gated |

Static and runtime evidence agree: H5 calls only `contacts.searchUsers` and `peerProfile.get`；the shared SDK filters the current user and classifies self/friend/stranger. No page transport、mock result、fake-success path or second identity owner was found.

## W6 Joined Groups Read-only Visual And Route Acceptance

| capability | result | evidence | still gated |
| :--- | :--- | :--- | :--- |
| data projection | `pass-readonly` | cache-first/full-sync facade returned 11 real groups with name、ID、member count and intro；long intro remained bounded | offline cache isolation |
| role projection | `pass-readonly` | real rows rendered `管理员` and `我创建`/`群主` from the shared group role projection | alternate role samples |
| search | `pass-readonly` | `donk` returned 2 rows、exact group ID `64866675923` returned 1、stable unknown query returned the honest empty state | transport/business failure response |
| layout/theme | `pass-chromium` | 390x844 system-dark and 760x900 explicit light had no horizontal overflow；desktop content stayed centered at 480px | Safari/Firefox |
| route recovery | `pass` | `/contacts` -> `/contacts/groups` direct navigation、back、forward and reload preserved authentication and restored the 11-row list | none for Chromium read state |
| mutation boundary | `pass` | group rows were intentionally not clicked；no conversation open/create、group mutation、message send or other Gateway write occurred | conversation-open persistence requires explicit mutation authorization |

H5 presentation remains page-owned while cache、sync、role mapping and conversation business behavior remain shared SDK owners. No page transport、SQL、mock branch、fake-success path or H5-only group business owner was found.

## W3 Real Gateway Read-only Evidence

| gate | result | conclusion |
| :--- | :--- | :--- |
| account 1 restore | `pass` | reload stayed on `/conversations` and restored the authenticated `donk` tab instead of redirecting to login |
| Gateway-backed reads | `pass` | conversations showed 19 visible rows/25 unread，contacts showed 7 real friends，`/me` returned `donk` and the expected account ID；zero browser warning/error |
| account 2 login/restore | `pass` | the explicitly supplied phone-code test account logged in as `donk二大爷`，loaded its own conversation/unread projection and survived reload |
| account isolation | `pass` | two same-origin tabs concurrently retained different profile IDs and unread totals，so tab session and account database owners did not overwrite each other |
| SQLite offline hit | `not-proven` | the page code is cache-first and local Chromium SQLite gates are green，but this run did not inspect browser storage or block Gateway；no offline cache claim is made |
| WebSocket observability | `pass` | `data-im-runtime-state` exposes only the token-free SDK lifecycle state and no account/token/message payload |
| dual-account WebSocket online | `pass` | shared `localStorage` device identity reproduced alternating reconnects；tab-scoped `sessionStorage` identity removed the collision，with 19/20 long samples dual-online and one simultaneous transient reconnect that recovered |
| realtime message delivery | `not-proven` | no message was sent and no inbound event was observed；connection state is not treated as delivery/list-back proof |

This slice performed only login and read-only navigation. It did not send messages，open media，change settings，clear history，delete data or execute RTC.

## W6 Closeout Evidence

| gate | result | conclusion |
| :--- | :--- | :--- |
| SDK focused all-runtime | `pass` | message/sync/Web/Desktop/custom-emoji test scope + typecheck passed；未调用/修改 `build:package:desktop:web` |
| H5 full verify | `pass` | 466 RN assets、SDK Web 59 files/203 tests、H5 typecheck/build passed；existing main chunk warning retained |
| RN shared-SDK consumer floor | `pass` | `openIMService`、clear facade、SQLite、single detail、group settings：5 suites/176 tests；RN `tsc --noEmit` passed |
| RN full Jest | `pass` | 164/164 suites、1369/1369 tests；ChatDetail 166/166；segmented history、staged unread、voice identity and cache-first presence contracts are covered |
| boundary audit | `pass` | H5 pages do not create Gateway clients or execute SQL；RN screens do not call SDK runtime operations；media download `fetch` remains browser port behavior |
| duplicate-owner audit | `pass` | clear/realtime/search canonical business owners remain in SDK；RN/H5 retain explicit composition and UI/platform integration only |
| fake-success audit | `pass` | no fake-success/error swallowing main path；login `666666` text is the current Gateway integration contract, not a local success bypass |

RN regression ownership is tracked in `IM28_H5_FOUNDATION_CLEANUP.md`. Local P0/P1 is zero；realtime message delivery/list-back、offline SQLite hit、destructive mutations、RTC and cross-browser proof remain external/authorization gates and are not implied by the green local floor.

## Current Readout

| dimension | state | note |
| :--- | :--- | :--- |
| pack | `active` | W3/W4/W5 保留外部门；forward normal/hidden accepted；message edit/delete shared core/H5 UI closed locally，real mutations and forward partial/desktop remain gated |
| `W1` | `done` | H5 规则、架构和存储 SSOT 已落库 |
| `W2` | `done` | H5 app、独立 multi-runtime SDK Git repository、Vite React Router App 与跨仓构建验证链已落地 |
| `W3` | `gated/partial-real` | real login、refresh restore、Gateway-backed reads、two-account tab isolation and dual WebSocket online passed；realtime delivery/list-back and offline SQLite-hit proof remain |
| `W4` | `gated` | HTTP MVP、默认 routes、新消息/会话/update 与 same-tab ordering 已本地完成；真实 flow gated |
| `W5` | `gated` | W5.a1/W5.a2 done-local；W5.a3 code done-local，真实三浏览器矩阵 pending |
| `W6` | `active` | preset/custom/media/retry/quote/copy/edit local chains、SDK boundary、forward normal+hidden real flow and RN/Web message forward/delete/edit/group-mention/search/realtime/clear-history single-track consumption done；local closeout passed，only explicit external/authorization acceptance gates remain open |

## Latest Closed Group Mention Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.17.1-shared-group-mention-core + .17.2-h5-group-mention-ui + .17.2.1-unread-projection + .17.2.2-sender-display-name-cache-parity` |
| production_flow | group cache -> group-member cache/full sync -> RN-derived picker -> shared type106 optimistic send -> Gateway -> SQLite v10 -> existing realtime/cache reread；conversation list separately reads `lastReadSeq < seq` latest incoming mention |
| ownership | SDK owns member/contact/user cache、mention identity、Gateway convergence、unread query and RN sender-name priority；H5 owns picker/composer and returned snapshot presentation only |
| failure contract | unknown group、pagination failure、invalid target/permission reject visibly；invalid seq or absent stable mention fails closed to latest message；H5 never scans history or guesses identity/name |
| verification | SDK Web 52/163、all-runtime typecheck、boundary gate、build:web sync；H5 33/116、typecheck、466 assets、production build；authenticated 7-contact -> 19-conversation navigation and 458x786 no-overflow/zero-console proof |
| RN impact | RN now explicitly composes `createIMGroupMentionSync` through `group-mention-shared-service.ts`；send/member-candidate callers consume the neutral facade，while RN DTO/events/presentation remain app-owned |
| residual | real type106 send、Gateway mention echo、SQLite/list-back and second-client realtime remain `blocked-mutation-authorization`；current account has no real unread mention browser sample；cold sender caches intentionally render no guessed name |

## Latest Closed Message Edit Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.16.1-shared-message-edit-core + W6.a6.16.2-h5-message-edit-ui` |
| production_flow | cached client ID -> shared current-account reread/eligibility -> Gateway update -> success-only same-row text/entity replacement -> existing cache reread/realtime convergence |
| ownership | SDK owns eligibility、operation ID、Gateway body、same-row persistence and editedAt；H5 owns action、composer preview/draft and edited-time projection only |
| failure contract | invalid/local-only/forwarded/non-text rows reject before I/O；Gateway failure or target mismatch preserves original cache；H5 keeps editing state and draft |
| verification | SDK Web 48/155、all-runtime typecheck、boundary gate、build:web sync；H5 32/109、typecheck/build、466 assets；authenticated 458x786 preview/cancel/no-overflow proof |
| RN impact | RN `openIMService.editTextMessage` now consumes the neutral shared mutation facade；RN owns only auth/context、MessageItem projection and existing event emission，legacy inline Gateway/SQLite edit path is deleted |
| residual | real Gateway edit、same-row SQLite/list-back and second-client realtime remain `blocked-mutation-authorization`；revoke remains excluded |

## Latest Closed Message Delete Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.15.1-shared-message-delete-core + W6.a6.15.2-h5-message-delete-ui` |
| production_flow | cached client IDs -> shared current-account reread -> single update or batch-delete -> success-only transactional local hide -> existing cache reread/realtime convergence |
| ownership | SDK owns eligibility、Gateway operations、partial matching and SQLite mutation；H5 owns action/multi-select、group-role presentation、confirmation sheet and visible result only |
| failure contract | `all` rejects any local-only row before I/O；top-level failure changes no local row；partial result hides only confirmed successes；`self` may remove local-only rows |
| verification | SDK Web 47/152、all-runtime typecheck、build:web sync；H5 31/107、typecheck/build、466 assets；authenticated 458x786/390x844 single+two-message read-only proof with no overflow or console errors |
| RN impact | no RN app/service import or caller changed；shared code compiles for RN but cannot alter its runtime without an explicit composition/service cutover |
| residual | real `self/all/partial/list-back` is destructive and remains `blocked-destructive-authorization`；revoke is explicitly excluded |

## Latest Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.13-chat-copy-core` |
| production_flow | cached message -> `ChatMessageView` -> existing message action -> injected clipboard port -> `navigator.clipboard.writeText` -> success-only notice |
| parity | RN copy asset and text/media/card fallbacks are reused；system/deleted/revoked rows remain non-actionable |
| verification | H5 27/99、SDK 44/140、466 assets、full verify/build、authenticated 458x786 right-click/no-overflow/zero-console proof |
| residual | Safari/Firefox permission behavior and touch long-press remain acceptance gates；rich clipboard is explicitly outside scope |

## Latest Closed Forward Core Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.14.1-shared-forward-core` |
| production_flow | current-account SQLite source reread -> atomic optimistic rows -> normal batch or registered hidden-sender send -> per-row final transaction -> realtime/list-back mapper |
| persistence | schema v9 stores `forward_origin_json/forward_source_msg_id/forward_batch_id` separately；history and realtime use the same core projection |
| failure contract | one stable batch/item/comment identity；top-level failure fails every prepared row；partial response and comment converge independently；unsupported hidden body rejects before write/I/O |
| verification | SDK 49 files/150 tests、Web 46/145、all-runtime typecheck/package compile、build:web sync and H5 full verify passed |
| residual | initial core requires completed server-backed sources；registered hidden body types are 101–105/114/115；real Gateway/list-back and H5 UI remain open |
| next | `W6.a6.14.2-h5-forward-target-preview` |

## Latest Closed Forward H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.14.2-h5-forward-target-preview` |
| production_flow | cached action/multi-select stable IDs -> React Router target selector -> existing conversation/contact/group facades -> target chat source reread -> pending exclusion/comment/privacy preview -> explicit shared `messages.forward` caller |
| ownership | Router state carries IDs only；H5 owns selection/presentation；SDK owns eligibility、source/target cache reread、Gateway body、optimistic rows and per-row convergence |
| verification | H5 29/103、SDK Web 46/147、typecheck、build:web sync、466 assets、production build and authenticated read-only three-tab/single+two-message/390x844+458x786 light/dark proof |
| residual | authorized normal and hidden-sender sends now pass Gateway/cache/list-back；real partial-result and desktop visual proof remain `.14.3` gates |
| next | `W6.a6.14.3-forward-acceptance` partial-result/desktop remainder (`blocked-external`) |

## Latest Closed Contract Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.12-shared-sync-neutral-naming-and-rn-adoption-contract-freeze` |
| verdict | keep one shared implementation；treat `WebIM*` as historical public names；do not add unused aliases or move neutral business rules into Web |
| RN adoption | future opt-in RN composition root plus explicit `src/services/openim/**` switch；compilation/package presence alone has no runtime side effect |
| next | `W6.a6.13-chat-copy-core` |

## Latest Closed SDK Boundary Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.11.1-sdk-sync-runtime-boundary` |
| goal | make shared business sync and RN/Web/Desktop-specific composition/adapters structurally distinguishable without replacing the existing RN runtime |
| production_flow | shared `src/sync` consumes injected database/Gateway/ports；Web runtime imports `platforms/web/sync/web-im-sync`；RN keeps its existing service adapter path |
| isolation | Web aggregation exists only in Web dist；RN/Desktop exclude it；AST gate rejects shared-to-platform and cross-client imports before every package build/typecheck |
| verification | SDK 44 files/140 tests、all-runtime build:all、RN consumer `tsc --noEmit`、H5 `npm run verify` and per-target dist inspection passed |

Local closeout: no RN application source was changed. Shared DTO、schema、Repository and Gateway mapper remain intentionally cross-runtime and can affect RN only where RN already imports those contracts；the new Web composition itself cannot enter the RN package or runtime.

## Latest Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.10-chat-media-retry-stage` |
| goal | make media retry honest across upload/Gateway/process boundaries without persisting browser source bytes |
| production_flow | platform upload -> strict 102–105 body validation -> same-row SQLite checkpoint -> Gateway send；failure/restart -> shared capability -> same client ID Gateway retry without upload |
| target_owner | shared SDK owns stage derivation、checkpoint、payload reconstruction、account-scoped recovery and retry；Web runtime orders recovery before Realtime；H5 only renders capability |
| verification_shape | four-body contract tests + real sql.js upload-once/retry/recovery range + runtime-before-WebSocket tests + all-runtime build + H5 full gates/read-only smoke |
| stop_condition | no File/Blob persistence、memory source registry、automatic resend、new retry ID、page payload decode、fake success or unapproved Gateway operation |

Local closeout: type102–105 rows become retryable only after a complete uploaded Gateway body is durably checkpointed. A Gateway failure retains that body and explicit retry reuses the original client ID without invoking upload again. A new authenticated session converts only the current user's outgoing `sending` rows to `failed` before WebSocket construction；pre-upload failures remain non-actionable and require an explicit new source selection/new send. No real message was sent or retried.

## Previous Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.9-chat-failed-retry` |
| goal | mirror RN failed action without creating a second message or pretending browser media bytes are recoverable |
| production_flow | failed cached outgoing 101/115 -> shared capability -> `messages.retry` -> same client ID/SQLite row `sending -> sent/failed` -> page cache reread |
| target_owner | shared SDK owns support matrix、payload reconstruction、account guard、Gateway body and state transition；H5 owns button and visible cache refresh only |
| verification_shape | real sql.js same-row success/failure/no-media-I/O tests + all-runtime build + H5 full gates；real failed-message click remains authorization-gated |
| stop_condition | no new client ID、page payload decode、media File/Blob persistence、unsupported retry button、fake success or unapproved Gateway send |

Local closeout: text 101 and custom emoji 115 can retry only from the current account failed row；both preserve the original client ID，and type115 retains its validated URL when Gateway omits it. Media 102–105 remain static failed states because browser bytes cannot be recovered from persisted metadata. No real message was retried or transmitted.

## Latest Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.8-chat-media-export` |
| goal | migrate RN image save and file preview/download without changing shared message truth |
| production_flow | cached image/file payload -> safe HTTP(S) projection -> route-scoped preview -> verified Blob download or explicit browser open |
| target_owner | shared SDK owns message payload；H5 chat owns overlay；one browser adapter owns fetch/Blob/object-URL/download trigger |
| verification_shape | pure URL/file projection + injected download behavior tests + H5 full gates + authenticated read-only image/file visual proof when real history exists |
| stop_condition | no page Gateway/cache write、mock media、fake download success、upload/send、read receipt、retry or RTC |

Local closeout: real cached image messages opened a 458x786 black preview with complete 400px source image and RN save action；a real 32.6 KB PDF opened the file preview with exact name/size and enabled browser open/download actions. Mobile and 1280x800 desktop widths had no horizontal overflow，Escape closed the overlay and console warning/error count stayed zero. No download、new tab、message、upload or mutation was triggered；light-theme and actual download/open evidence remain acceptance gates.

## Latest Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.3-custom-emoji-add-reorder` |
| goal | expose RN type115 collection action and selected-group local ordering without inventing server reorder |
| production_flow | message stable ID -> explicit long-press/right-click action -> shared add；manager selection -> Pointer tray -> stable-ID browser preference |
| target_owner | SDK owns add/member/cache；H5 owns action UI and local presentation order only |
| verification_shape | H5 24/85 + typecheck/build/assets + authenticated 458x786 select/move-tray/cancel proof；type115 visual remains real-data gated |
| stop_condition | no fake/injected message、real add、order commit、file selection、delete or send |

Local closeout: type115 messages retain stable identity for an explicit RN-derived action menu，and successful feedback can only follow shared add resolution. Manager/panel apply a deduped stable-ID preference over the SDK member snapshot；touch/mouse selected-stack movement is local-only. One real cached item reached move mode and was cancelled without persistence；the current conversation has no type115 history，so its menu was not fabricated.

## Previous Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.2-h5-custom-emoji-manager` |
| goal | mirror the RN custom emoji manager through a conversation-scoped React Router route |
| production_flow | chat add tile -> `/conversations/:conversationID/emojis` -> cache-first list -> user file selection/create or selection/confirm/delete -> shared SDK mutation facade |
| target_owner | SDK owns upload validation、Gateway mutation and SQLite membership；H5 owns file input、route、preview/selection and five-column presentation only |
| verification_shape | H5 23/80 + SDK 40/126 + all-runtime typecheck/build:all + production build/assets + authenticated 458x786 read-only equal-cell/no-overflow proof |
| stop_condition | no message-action collection/local reorder、no real file selection/upload/delete/send |

Local closeout: the chat custom-emoji tab now exposes a real manager route with RN-derived five-column cells、add picker、preview、organize selection and confirmed batch delete. Every mutation delegates to `WebIMSync.customEmojis`; read-only browser proof opened the real cached list without selecting a file or mutating data. Desktop/light visual proof and real mutation remain acceptance gates.

## Latest Closed Shared Mutation Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.1-shared-custom-emoji-mutations` |
| closeout | SDK owns strict create upload batch、add received ID、batch delete and post-success account-cache convergence |
| verification | SDK Web 40/126 + core Gateway contracts + all-runtime typecheck/build:all + RN/Web/Desktop package sync；H5 consumer 23/80 + typecheck/build passed |
| residual_gate | message collection/local reorder is `.3.3`；real upload/mutation/send remains explicitly authorization-gated |

## Previous Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.7.2-h5-custom-emoji-panel` |
| goal | bind shared custom emoji cache/send semantics to the RN third tab and five-column H5 presentation |
| production_flow | `customEmojis.listCached/sync` -> H5 recent/all grid -> `messages.sendCustomEmoji` caller -> existing type115 cached rendering |
| target_owner | SDK owns list membership、DTO、SQLite and send state；H5 owns heart tab、five-column CSS and recent-ID preference only |
| verification_shape | H5 MRU behavior + SDK 121 regression + typecheck/build/assets + authenticated 458x786/1280x800 dark no-overflow proof；light proof remains acceptance gate |
| stop_condition | no add tile/manager/upload/add/delete/reorder、message-action save or real send |

Local closeout: the third heart tab loads the current account SQLite snapshot before remote sync, renders stable-ID recent/all sections in five square columns and delegates clicks to shared type 115 send. SDK Web 40/121、core/all-runtime gates、H5 22/77、typecheck/build、466 assets and authenticated real-list dark mobile/desktop proof passed. One real list item rendered；no emoji was clicked and no message was transmitted. Light-theme visual proof and real send remain acceptance-gated.

## Latest Closed Shared Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.7.1-shared-custom-emoji-core` |
| closeout | SDK owns custom emoji DTO/HTTP list mapper、schema v8 account cache、atomic replace and type115 optimistic/sent/failed URL snapshot semantics |
| verification | SDK Web 40/121 + core Gateway contracts + all-runtime typecheck + build:web package sync；H5 package consumer typecheck/build passed |
| residual_gate | manager create/add/delete/reorder is `.3`；real send remains explicitly authorization-gated in `.4` |

## Latest Local Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.5-chat-system-emoji-core` |
| goal | 迁移 RN 第一套 Unicode 系统表情面板、光标编辑、完整 grapheme 退格和最近使用顺序 |
| production_flow | RN `ChatComposer` -> `ComposerEmojiPanel` -> `chatComposerTextEditing` -> draft -> existing text send |
| operations | local draft insert/replace/delete；browser recent-history read/write；existing `sendText` only |
| contract | 52-entry RN Unicode list；7-column grid；recent MRU dedupe/cap `21`；insert replaces selection；delete removes selection or one full grapheme；panel and actions are mutually exclusive |
| target_owner | H5 composer owns panel state；pure helper owns UTF-16 selection/grapheme editing；browser adapter owns non-sensitive recent history；SDK remains unchanged |
| verification_shape | pure edit/MRU tests + H5 app suite/typecheck/build/full verify + authenticated 390x844/1280x800 insert/delete/MRU/no-overflow smoke |
| stop_condition | no illustrated preset entities、custom emoji API/manager/type `115`、rich clipboard、draft persistence、real message transmission or SDK change |

Local closeout: the composer now has one RN-mirrored Unicode emoji path with 52 ordered entries、7 columns、21-item recent MRU、selection replacement and full-grapheme deletion. H5 17/65、SDK 36/111、466 assets、full verify/build and authenticated 390x844/1280x800 browser proof passed；insert/delete were exercised without clicking send, and a clean reload produced no new console errors. The existing text-send acceptance gate remains open.

## Previous Closed Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.4-chat-voice-send-core` |
| goal | 将 RN 按住录音、上滑取消、2–60 秒语音上传、Gateway audio send 与 SQLite 状态收敛迁入 H5 |
| production_flow | RN `ChatComposer` -> `useChatVoiceRecorder` -> `audioMessageService` -> `sendSoundMessage` -> upload credential/OSS -> Gateway audio body -> local repositories |
| operations | browser `getUserMedia/MediaRecorder`；`getUploadCredential`；OSS multipart POST；`sendMessage` |
| contract | short recording `<2s` rejects；max `60s` auto-stop；cancel threshold `56px`；`type=103`；body uses `media_id/url/duration_seconds/size_bytes` |
| target_owner | shared SDK owns duration/body/state；Web media adapter owns microphone/MediaRecorder/Blob cleanup；composer owns pointer UI only |
| verification_shape | SDK real SQLite state/body tests + injected MediaRecorder lifecycle tests + H5 hook/composer tests + all-runtime typecheck/build:web/full verify + browser capability/layout smoke |
| stop_condition | no real microphone prompt/recording/upload/send、audio file picker、waveform persistence、played/read/auto-next、progress/cancel upload、retry、download or RTC |

Local closeout: the composer now mirrors RN voice/keyboard switching、hold-to-record、56px upward cancel、2-second minimum and 60-second auto-stop. `chat-voice-recorder.ts` is the only browser microphone/MediaRecorder owner and releases all tracks on stop、cancel、start failure and asynchronous recorder failure；`WebIMSync.messages.sendAudio` is the only upload/Gateway/SQLite caller. H5 15/56、SDK 36/111、466 assets、all-runtime typecheck、build:web/full verify and 390x844/760x900 no-overflow proof passed. Browser proof toggled voice mode only；no microphone prompt、recording、file upload or message transmission was executed.

## Earlier Closed Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.3-chat-album-video-send-core` |
| goal | 将 RN `mixed` 相册中的视频选择、元数据、OSS 上传、Gateway send 与 SQLite 状态收敛迁入 H5 |
| production_flow | RN `useChatMediaPicker` -> `assertChatMediaAssetAllowed` -> `sendVideoMessage` -> upload credential/OSS -> Gateway video body -> local message repositories |
| operations | `getUploadCredential`；OSS multipart POST；`sendMessage`，与图片/文件复用同一 shared optimistic state owner |
| contract | album image/video total `<=12`；video MIME must be browser video；single video `<=500 MB`；duration/width/height come from browser metadata；`type=104`；snapshot uses RN OSS `t_7000` rule |
| target_owner | shared SDK owns limit/body/state；Web App owns `File` selection and HTML video metadata I/O；page only calls `WebIMSync.messages.sendVideo` |
| verification_shape | real SQLite facade tests + H5 mixed-selection/metadata tests + SDK all-runtime typecheck/build:web + H5 full verify + responsive browser smoke |
| stop_condition | no caption/pending attachment、camera、audio/voice、upload progress/cancel、retry、local thumbnail generation、real unauthorized send or RTC |

Local closeout: mixed album selection now preserves image/video order and validates a shared maximum of 12 items、10 MB images and 500 MB videos before I/O. The browser reads duration/width/height through a short-lived `HTMLVideoElement`; `WebIMSync.messages.sendVideo` owns upload、RN-compatible snapshot URL、Gateway `type=104` body and SQLite `sending -> sent/failed`. H5 13/50、SDK 35/109、466 assets、all-runtime typecheck、build:web/full verify and 390x844/760x900 no-overflow proof passed. No real file was uploaded or message transmitted without explicit authorization.

## Earlier Closed Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.2-chat-image-file-send-core` |
| goal | 迁移 RN 相册图片与普通文件发送主链，保持 Gateway/OSS/SQLite 真实状态收敛 |
| source_anchor | RN `ChatComposer/ComposerActionPanel`、`useChatMediaPicker`、`gatewayUploadService`、`openIMService.sendImageMessage/sendFileMessage` |
| target_owner | `../im28-sdk/src/sync` shared send state + `../im28-sdk/src/platforms/web` OSS adapter + H5 chat composer caller |
| operations | `getUploadCredential`；OSS multipart POST；`sendMessage` |
| limits | album `<=12`；image `<=10 MB`；ordinary file `<=100 MB`；selected items send sequentially |
| expected_deliverable | SQLite optimistic `sending`、success `sent`、any-stage `failed`；RN two-item attachment panel and hidden browser file inputs |
| verification_shape | real SQLite facade tests + browser upload adapter tests + H5 picker/view tests + build:web/typecheck/build/full verify + guest guard |
| stop_condition | no page Gateway/fetch、mock URL/fake success、caption/pending draft、camera/video/audio/recording、upload progress/cancel、retry、file download or RTC |

Local closeout: shared `message-send-state` now owns conversation guard、stable client ID and SQLite `sending -> sent/failed` for text/image/file；`message-media-send` owns 10 MB/100 MB limits and Gateway image/file body；the Web adapter alone owns credential-backed OSS `FormData`. H5 exposes only RN album/file actions, validates max 12 images/browser MIME/size, preserves selection order and renders the SDK-persisted `sending` entity. H5 12/46、SDK 33/107、466 assets、all-runtime typecheck、full verify/build、changeset/pack and 390x844/760x900 no-overflow proof passed. No real message was transmitted during browser proof because that requires explicit authorization.

## Closed Slice W6.a6.1

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.1-chat-media-read-core` |
| goal | 将聊天页已有图片、语音、视频真实 payload 从静态投影升级为 RN 对应的只读媒体交互 |
| source_anchor | RN `ChatMessageBody`、`ImagePreviewModal`、`VideoPreviewModal`、`useChatSoundPlayback`；Gateway `AudioMessage/ImageMessage/VideoMessage` |
| target_owner | `apps/web/src/pages/chat` feature-local message projection、single media controller and full-screen overlays |
| expected_deliverable | image full-screen preview、one-active-audio play/stop/error state、native video full-screen controls；route exit cleanup and unsafe/missing URL fail-closed |
| verification_shape | pure message/media view tests + H5 app tests + Web typecheck/build/full verify + anonymous guard |
| stop_condition | no SDK/page transport、mock media、image save/file download、media send/upload、voice recording、played/read sync、auto-next、retry or RTC |

## Closed Slice W6.a5.2.14

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.14-contact-user-search-core` |
| goal | 迁移 RN 联系人用户搜索主链，并让本地好友结果和远端用户结果统一进入既有联系人资料页 |
| source_anchor | RN `ContactListScreen -> ContactSearchScreen`；shared `searchUsers` Gateway operation and existing contact/profile owners |
| target_owner | `../im28-sdk/src/sync/contact-sync.ts` + `apps/web/src/pages/contacts/ContactSearchPage.tsx` + Contacts/App route callers |
| expected_deliverable | authenticated normalized user search、self-filter/dedupe、local friend match、RN search/result states and React Router navigation |
| verification_shape | facade auth/normalization/dedupe/failure tests + view tests + build:web/verify + guest/responsive/theme/history smoke |
| stop_condition | no group search/join、search-page friend apply、page Gateway calls、fake results/success、second profile or search storage owner |

## Closed Slice W6.a5.2.13

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.13-contact-profile-core` |
| goal | 将联系人行默认行为接入 RN 个人资料主链，并通过真实 Gateway 资料、单聊创建和好友申请 operation 闭环 |
| source_anchor | RN `ContactListScreen -> UserProfileScreen`；shared `getUserDetail/getFriend/openDirectConversation/applyFriend` + conversation repositories |
| target_owner | `../im28-sdk/src/sync/peer-profile-sync.ts` + `apps/web/src/pages/contacts/ContactProfilePage.tsx` + App route/ContactRow caller |
| expected_deliverable | authenticated profile normalization、friend/stranger/self state、RN avatar/name/nickname/ID/bio、success-only send-message/add-friend actions and stable SPA route |
| verification_shape | auth/normalization/persistence/mutation/failure tests + pure view tests + build:web/verify + guest/responsive/theme/history smoke |
| stop_condition | no RTC、presence、remark/star/delete/blacklist/common-groups/share/group-member context、page fetch、mock profile、fake navigation or second conversation owner |

## Residual Ledger

| item | type | note | seed_for_next_slice |
| :--- | :--- | :--- | :--- |
| Gateway runtime | verification | real login、refresh restore、Gateway-backed reads、two-account tab isolation and dual WebSocket online passed；delivery/list-back and offline SQLite-hit remain unproven | yes |
| Account SQLite lifecycle | code/verification | login/restore/open/migrate 与 sign-out/invalidation/close 已通过 Node + Chromium smoke | no |
| Upstream raw message log | code/privacy | canonical shared SDK 日志已清除，共享 SDK 与 H5 回归通过 | no |
| Unified SDK ownership | resolved | RN/Web SDK 已迁入独立 `im28-sdk`；共享 sync 位于 `src/sync`，应用内旧 package 已删除，Desktop driver port 已建立 | no |
| sync orchestration | code/design | HTTP MVP、新消息/会话串行落库、分页缺口恢复与页面 cache 刷新已完成 | no |
| message update semantics | contract/code | 独立 cursor、edit/delete-all、stale edit guard 与 recovery 已本地完成 | no |
| same-tab semantic locking | resolved | shared FIFO 覆盖 full sync/history/send/realtime，3 个交错/失败回归通过 | no |
| Worker execution | verification | production App 已显式注入 Worker；真实账号浏览器 open/migrate 待 W5.a3 harness/环境证据 | no |
| multi-tab writer | verification gate | lifecycle Web Lock 已本地实现，真实三浏览器 two-tab evidence 缺失 | yes |
| RN visual parity | migration | prior cores plus settings and onboarding core are local；valid onboarding visuals/data、network/cache keep explicit gates | yes |
| Onboarding acceptance | migration/verification | register/login split、memory-only pending secret、account marker、invite retry and profile core are local；valid new-account flow and approved profile update evidence absent | yes |
| Blacklist core | migration/verification | authenticated real list empty-state passed；non-empty enrichment/search、theme/history and approved remove proof remain | yes |
| Friend applications core | migration/verification | authenticated 5-row real list plus 390x844/760x900 light/dark and route-history/reload passed；pending sample and approved accept proof remain | yes |
| Group applications core | migration/verification | authenticated empty-state plus 390x844/760x900 light/dark and route-history/reload passed；non-empty owner/admin detail and approved handle proof remain | yes |
| Joined groups core | migration/verification | authenticated 11-group list、member/status/role、name/ID/unknown search and Chromium responsive/theme/history proof passed；open-conversation persistence、offline isolation and Safari/Firefox remain | yes |
| Contact profile core | migration/verification | authenticated friend/self/unknown failure plus Chromium responsive/history proof passed；conversation persistence、real stranger and friend apply remain | yes |
| Contact user search core | migration/verification | known local/remote result、self filtering、unknown no-result and Chromium responsive proof passed；transport/business failure and Safari/Firefox remain | yes |
| Chat media read core | migration/verification | real image/audio/video payload projection、single audio owner and full-screen image/video overlays are implemented-local；approved authenticated media playback and visual proof absent | yes |
| Chat image/file send core | migration/verification | shared optimistic state、Web OSS adapter、RN attachment panel and default facade callers are implemented-local；an explicitly authorized real upload/send and final Network/cache proof are absent | yes |
| Chat album video send core | migration/verification | mixed selection、browser metadata、shared video body/snapshot and SQLite state are implemented-local；an explicitly authorized real upload/send and final Network/cache proof are absent | yes |
| Chat voice send core | migration/verification | RN voice composer、browser recorder lifecycle、shared audio body and SQLite state are implemented-local；real microphone、recording/upload/send and authenticated Network/cache proof are absent | yes |
| Chat forward UI/core | migration/verification | shared core and H5 flow are implemented；authorized normal origin/list-back and hidden-origin removal pass；real partial-result and desktop visual proof remain | yes |
| Chat auto-delete core | migration/verification | schema v11、strict detail/update、type1701 convergence and RN nine-option route are done-local；real update、second-account realtime/list-back and theme/desktop proof remain | yes |
| General settings residual | migration/contract | real reads plus Chromium 390x844/760x900 light/dark passed；network blocked-browser、cache blocked-storage；writes、update-available and Safari/Firefox proof pending；notification title semantic debt is shared with RN | yes |
| Contacts index parity | resolved | RN 同版本/同参数 `pinyin-pro`、中文/多音/拉丁/fallback 回归和真实 `A/D/Z/H` 分组均已通过；词典已随 `/contacts` 按路由加载，不进入其他页面首包 | no |
| Primary tab shell | migration | global owner、四个 routes and `/me` 390x844/760x900 light/dark proof passed；friend/group application badge and real logout proof remain | yes |
| Calls real-account parity | migration/verification | real 2-row cache/sync、all/missed filters and 390x844/760x900 light/dark proof passed；delete and non-missed/duration samples remain | yes |
| Verification code send | API gap | Gateway OpenAPI 无发送验证码 operation；页面只展示固定 `666666` 联调约束，不制造发送成功态 | yes |
| Contact security mutation | API gap | phone/email security rows are read-only because send-code operation is absent；不制造绑定/换绑成功态 | yes |
| RN asset mirror | resolved | 466 文件按源路径复制并由 SHA-256 verify gate 保护 | no |
| snapshot failure poisoning | resolved | fatal discard、subsequent reject、close no-repersist 与 Worker terminate 回归通过 | no |
| Initial Git commit | resolved | `main/origin/main` 已存在 `07a0424` baseline；该外部提交发生于 W6.a3 执行期间 | no |

## Latest Closeout Verdict

| field | value |
| :--- | :--- |
| closed_slice | `W6.closeout` |
| deliverable_verdict | `done-local/acceptance-gated` |
| gate_verdict | `SDK focused all-runtime and H5 verify passed；RN tsc、ChatDetail 166/166 and full Jest 164/164 suites、1369/1369 tests passed；boundary、duplicate-owner and fake-success audits passed` |
| debt_or_drift | `RN clearGateway/local whole-delete/OpenIM fallback/old type2102 business branches removed；H5 owns scope presentation only；local RN regressions are zero；real mutation、dual-account realtime/list-back、RTC/browser matrix and Jest open handles remain external or accepted-debt gates；build:package:desktop:web unchanged` |
| next_activation_decision | `local closeout is complete；activate only an explicitly authorized external acceptance slice，and never execute real self/both/all_members clear by inference` |

## Latest Cross-Runtime Closeout Verdict

| field | value |
| :--- | :--- |
| closed_slice | `W6.a6.12.1.5-message-search-consumer-convergence` |
| deliverable_verdict | `converged/acceptance-gated` |
| primary_path | `RN/Web actual callers -> createIMMessageSearchSync -> shared query validation + visible-body filter + MessageRepository.search/pagination；platform code retains parameter、DTO、sender and UI projection only` |
| gate_verdict | `SDK 58/184、all-runtime boundary/typecheck/build、RN tsc、8 search-service + 28 search-page tests、H5 55/179 verify/build passed` |
| debt_or_drift | `RN direct local-store Repository search、duplicated visible-body filtering and legacy search result types removed；search remains cache-only with no Gateway mutation；RN Jest requires forceExit because of pre-existing open handles` |
| next_activation_decision | `activate RN/Web realtime-message consumer convergence；do not modify build:package:desktop:web` |

## Closed Slice W6.a6.20.26

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.26-chat-custom-emoji-bubble-preview` |
| goal | 对齐 RN type115 自定义表情气泡真实比例、历史消息尺寸探测和无工具栏纯图片预览 |
| source_anchor | RN `CustomEmojiMessageContent`、`CustomEmojiPreviewModal`、`imageMediaSizeFromDimensions` |
| target_owner | H5 `ChatCustomEmojiMessageContent` + existing `ChatMediaInteractionProvider/getChatMediaPreview` |
| deliverable_verdict | `implemented-local/acceptance-gated` |
| verification | focused 3 files/15 tests；full Web SDK 89/371；466 assets；boundary/typecheck；1125-module production build；真实群聊 412px 零 overflow/error/broken image |
| preserved_boundaries | RN source clean；SDK source未改；仅执行 `build:web/sync:web`；普通图片保存、type115 收藏/发送/管理逻辑不变；`build:package:desktop:web` 未修改或执行 |
| acceptance_gate | 当前真实会话没有 type115 样本，未注入假消息，气泡比例与纯预览真实点击仍待自然样本只读验收 |

Residual ledger addition: `Chat custom emoji bubble preview` is implemented-local；真实 type115 气泡、横/竖资源视觉和点击关闭仍 sample-gated，且不得为验收伪造或发送消息。

## Closed Slice W6.a6.20.27

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.27-chat-initial-unread-navigation` |
| goal | 对齐 RN 聊天首入页未读边界、未读计数入口和用户滚动保护，不扩张为服务端已读 mutation |
| source_anchor | RN `chatDetailScrollHelpers`、FlatList `viewabilityConfig=80%`、last-read/first-unread scroll flow |
| target_owner | SDK `initial-unread-navigation.ts` + H5 `useChatUnreadNavigation/ChatMessageList` |
| deliverable_verdict | `shared-core-ready/web-consumed/rn-frozen/acceptance-gated` |
| verification | SDK focused 1 file/3 tests；H5 focused 2 files/8 tests；full Web SDK 90/374；466 assets；boundary、SDK RN/Web/Desktop + H5 typecheck；1127-module build；真实 412px zero false-positive/overflow/error and at-latest |
| preserved_boundaries | RN worktree clean；仅 `build:web/sync:web` 生成 H5 包；没有 markRead/read receipt/Repository/Gateway mutation；`build:package:desktop:web` 未修改或执行 |
| acceptance_gate | 当前真实会话没有非零 unread 样本；当前 50 条之外分页、非零分割线/浮层滚动和服务端已读收敛待独立切片/联调 |

Residual ledger addition: `Chat initial unread navigation` 已完成 shared 只读规则与 H5 当前窗口 UI；非零未读真实样本、跨窗口分页和 mark-read/read receipt 不在本片完成声明内。

## Closed Slice W6.a6.20.28

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.28-chat-visible-unread-read-convergence` |
| goal | 对齐 RN 可见未读提交门禁，并修复 shared partial read 提前清零问题 |
| source_anchor | RN `getViewableMessageListUpdate/reportUnreadReadSeq/useChatMessageListScroll` |
| target_owner | SDK `getIMVisibleUnreadReadSeq + conversations.markRead`；H5 `chat-unread-read-gate/useChatUnreadNavigation` |
| deliverable_verdict | `converged/local-verified/runtime-data-gated` |
| verification | SDK focused 2/8；H5 focused 2/4；full Web SDK 90/376；466 assets；boundary、SDK RN/Web/Desktop + H5 typecheck；1128-module build；真实 412px clean-reload zero false-positive/overflow/error |
| preserved_boundaries | `im28-phone` worktree clean；RN caller 签名/业务门禁不改；仅 `build:web/sync:web`；`build:package:desktop:web` 未修改或执行 |
| acceptance_gate | 当前真实会话无 unread 样本；非零 partial read、Gateway unread_count、Realtime 最新端 read 和 list-back 仍需双账号/自然数据联调；dev HMR 曾产生一次 Provider 顺序 error，干净 reload 不复现，登记为 HMR 债务 |

Residual ledger addition: `Chat visible unread read convergence` 已闭合 shared 规则、partial cache 安全和 H5 调用链；真实非零网络结果与跨窗口未读分页仍 acceptance-gated。
