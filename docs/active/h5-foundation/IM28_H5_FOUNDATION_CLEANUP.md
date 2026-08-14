# IM28 H5 Foundation Cleanup

## W6.a6.20.114 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-mobile-dark-readonly-pass; desktop-dark-and-mutation-gated` |
| canonical owner | `MeProfileEditorPage -> WebIMSync.profile` 保持唯一读取/更新链；CSS 继续消费全局 profile theme token |
| browser proof | 真实 nickname/gender/bio 值与限制、dark page/input/card/textarea、返回/取消、412/412 |
| safety | 不改 draft、不完成、不 update-profile/Gateway/SQLite；恢复 light；SDK/H5 runtime/RN business 零改动 |
| delete-or-register | 无 mock、fake success、第二 profile/theme/route owner、fixture 或 page-local dark override |
| verification | focused 4 files/17 tests、Web typecheck、3 route HTTP 200、diff/RN protected checks |
| residual | 760x900 dark、changed-value Network/result、slow-saving pending、跨浏览器/设备 |

## W6.a6.20.113 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-light-dark-card-hierarchy-pass` |
| canonical owner | global `rn-theme.css` 持有 light/dark/system token；群管理 CSS 只映射 RN page/card 语义 |
| browser proof | light/dark page 与 card 计算色不同；8px；card 380px；两模式均 412/412；恢复原 light preference |
| safety | 不改群权限、开关、路由、Gateway/SQLite、SDK 或 RN business |
| delete-or-register | 无 page-local dark override、重复 token、compat wrapper、fixture 或 fake success |
| verification | focused 3 files/10 tests、Web typecheck、diff check、RN protected diff |
| residual | Safari/Firefox、实体设备和其他页面主题缺口独立验收 |

## W6.a6.20.112 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-owner-role-routes-pass; natural-admin-and-mutation-gated` |
| canonical owners | 权限、成员角色、上限、候选和 mutation 归 SDK；`useGroupRoleRouteData` 只组合 route 数据，页面只持有选择/确认 presentation |
| browser proof | owner 群 admin empty/limit、2 add candidates、2 transfer candidates/self excluded、close-back；412/412、clean log |
| safety | 不选择/确认/add/remove/transfer，不执行 Gateway/SQLite mutation；SDK/H5 runtime/RN business 零改动 |
| delete-or-register | 无第二 role/candidate/limit/member loader、modal business owner、fixture、wrapper 或 fake success |
| verification | focused 3 files/10 tests、RN protected diff、真实 DOM/route/viewport/log |
| residual | natural admin/non-empty list、确认、角色 mutation、跨浏览器/设备继续 gated |

## W6.a6.20.111 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-message-window-pass; highlight-frame-gated` |
| canonical owners | 搜索归 shared message facade/Repository，URL/replace 归 home-search route owner，目标窗口归 `readFocusedChatMessageWindow`，H5 DOM 只滚动/强调 |
| browser proof | 真实 `123` 消息分区进入稳定 messageID route，精确恢复目标行后返回 conversations；412/412、unread 4 不变、clean log |
| safety | 不 markRead/发送/Gateway/SQLite mutation；SDK/H5 runtime/RN business 零改动 |
| delete-or-register | 无第二消息搜索、window loader、URL/history、cache owner、fixture、wrapper 或 fake success |
| verification | focused 2 files/10 tests、RN protected diff、真实 DOM/route/viewport/log |
| residual | 900ms animation 活动帧、8+ 分页、跨浏览器/设备继续 gated |

## W6.a6.20.110 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-server-joined-group-pass; available-application-gated` |
| canonical owners | server relation 归 `groupApplications.search`，group/conversation identity 归 `conversations.openGroup`，URL/replace 归 `buildConversationRoute` |
| browser proof | `donk` 返回 2 个 joined 群；无未读 `donk的群聊` 进入 canonical chat 后返回 conversations；412/412、clean log |
| safety | 不申请、不 markRead/发送、不执行关系/Gateway mutation；SDK/H5 runtime/RN business 零改动 |
| delete-or-register | 无第二关系判断、group/conversation mapper、URL/history owner、fixture、wrapper 或 fake success |
| verification | focused 4 files/14 tests、RN protected diff、真实 DOM/route/viewport/log |
| residual | available/pending 结果、申请、强制 cache-miss、跨浏览器/设备继续 gated |

## W6.a6.20.109 Closeout

| field | value |
| :--- | :--- |
| status | `clean/shared-core-ready/web-consumed/rn-frozen` |
| canonical owners | SDK sender resolver/会话 cache projection 持有名称，shared classifier 持有群系统类型；H5 只持有摘要文案与 entity offset 展示 |
| browser proof | 自然普通群摘要 `donk二大爷：1231`；自然系统摘要 `群聊已创建`；412x786；无 warning/error |
| safety | 不打开聊天、不 markRead/发送、不执行 Gateway/SQLite mutation；RN protected diff empty |
| delete-or-register | 删除 H5 本地群系统类型 Set；无第二 sender resolver、网络补全、cache writer、compat wrapper 或 fake success |
| verification | SDK Web 98/408 + build:web/sync:web；H5 focused 3/32 + app typecheck；真实 DOM/log |
| residual | RN caller 冻结且未宣称 convergence；跨浏览器/设备继续 gated |

## W6.a6.20.108 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-member-data-pass; unread-chat-role-pixel-gated` |
| canonical owners | SDK `resolveIMGroupMemberDisplayName` 持有名称优先级；`WebIMGroupMember.role` 持有角色；H5 成员行/聊天气泡只投影 |
| browser proof | 真实 3 人成员页显示完整昵称，owner 行显示“群主”，三行 412px 且页面 412/412 |
| safety | 不打开会自动 markRead 的未读聊天，不发送、不执行 Gateway/SQLite/read receipt；无 runtime 代码改动 |
| delete-or-register | 无第二名称、角色、member cache、Gateway/SQLite owner、fixture、wrapper 或 fake success |
| verification | H5 focused 3 files/13 tests、SDK focused 1 file/4 tests、RN protected diff、真实 DOM/viewport/log |
| residual | 已读 owner/admin 消息气泡自然像素、admin 样本、跨浏览器/设备继续 gated |

## W6.a6.20.107 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-owner-and-member-role-pass; admin-and-mutation-gated` |
| canonical owners | 角色事实仍归 SDK `WebIMJoinedGroup.currentUserRole/permissions`；H5 只由既有 settings view 和 route guard 投影 |
| browser proof | real member group 显示 leave、隐藏 announcement/manage/auto-delete/dismiss；直达 manage route replace 回 settings；412/412 |
| safety | 不切换设置、不清空/退出、不执行角色/Gateway/SQLite mutation；无 runtime 代码改动 |
| delete-or-register | 无第二 role/permission/route guard、Gateway/SQLite owner、fixture、wrapper 或 fake success |
| verification | focused 4 files/19 tests、`.94` H5 typecheck 基线、RN protected diff、真实 DOM/route |
| residual | admin 自然角色、公告/自动删除/角色 mutation、跨浏览器/设备继续 gated |

## W6.a6.20.106 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-readonly-menu-pass; actions-and-physical-touch-gated` |
| canonical owners | 会话动作仍归 `useConversationActions -> WebIMSync.conversations`；消息动作仍归 `ChatMessageAction` 和已有 composer/forward/delete owners |
| browser proof | 真实 group row 5 项菜单、text `123` 6 项菜单和预览、遮罩/Escape 关闭、412/412 |
| safety | 不点击 menuitem、不执行任何 mutation/clipboard/navigation；无 runtime 代码改动 |
| delete-or-register | 无第二 gesture、menu、action、Gateway/SQLite owner、fixture、wrapper 或 fake success |
| verification | focused 3 files/8 tests、`.94` H5 typecheck 基线、RN protected diff、真实 DOM/route |
| residual | physical touch、授权动作结果、Safari/Firefox/实体设备继续 gated |

## W6.a6.20.105 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-friend-and-group-result-pass; message-result-target-gated` |
| canonical owner | `buildConversationHomeSearchRoute` 仍唯一编码 href/replace；群 identity 与聊天定位 owner 不变 |
| browser proof | real group result -> canonical conversation -> conversations；搜索层不恢复，412/412 |
| safety | 不发送、不改搜索历史、不执行 Gateway/SQLite mutation；无 runtime 代码改动 |
| delete-or-register | 无第二 search/openGroup/URL/history owner、fixture、wrapper 或 fake success |
| verification | focused 2 files/18 tests、`.94` H5 typecheck 基线、RN protected diff、真实 DOM/route |
| residual | messageID 结果定位/窗口恢复/高亮、跨浏览器/设备继续 gated |

## W6.a6.20.104 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-already-joined-open-group-pass; available-application-gated` |
| canonical owners | 群/会话 identity、cache 与 navigation resolve 仍唯一归 SDK `conversations.openGroup` |
| browser proof | real group apply -> “进入群聊” -> canonical conversation -> conversations，412/412 且申请层不恢复 |
| safety | 不提交申请、不改变关系、不发送、不执行关系/Gateway mutation；无 runtime 代码改动 |
| delete-or-register | 无第二 group-list inference、cache、URL owner、fixture、wrapper 或 fake success |
| verification | focused 3 files/11 tests、`.94` H5 typecheck 基线、RN protected diff、真实 DOM/route |
| residual | available 群/申请 mutation、cache-miss fallback、跨浏览器/设备继续 gated |

## W6.a6.20.103 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-announcement-owner-and-member-pass; admin-and-mutation-gated` |
| canonical owners | 入口仍归 `buildChatSettingsView`；编辑权限仍归 `GroupAnnouncementPage -> canEditAnnouncement` |
| browser proof | 真实 owner 设置入口 -> 可编辑公告页 -> 取消回设置，412/412 |
| safety | 不输入、不完成、不发布、不标记已读、不执行角色/Gateway/SQLite mutation；无 runtime 代码改动 |
| delete-or-register | 无第二 role/permission/announcement owner、fixture、wrapper 或 fake success |
| verification | focused 1 file/9 tests、`.94` H5 typecheck 基线、RN protected diff、真实 DOM/route |
| residual | `.107` 已关闭 member；admin 角色、公告发布/已读、跨浏览器/设备继续 gated |

## W6.a6.20.102 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-single-owner-and-member-entry-pass; admin-role-gated` |
| canonical owners | entry presentation 仍归 `ChatAutoDeleteSettingsRow`；授权仍归 `canManageChatAutoDelete`；mutation 仍归 shared facade |
| browser proof | 单聊入口、群设置无入口、真实群主管理入口通过，三页 412/412 |
| safety | 不打开策略页、不改设置、不执行 Gateway/SQLite mutation；无 runtime 代码改动 |
| delete-or-register | 无第二 entry/permission/mutation owner、fixture、wrapper 或 fake success |
| verification | focused 2 files/13 tests、`.94` H5 typecheck 基线、RN protected diff、真实 DOM/route |
| residual | `.107` 已关闭 member；admin 角色、策略 mutation、跨浏览器/设备继续 gated |

## W6.a6.20.101 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-card-picker-readonly-pass; type108-send-gated` |
| canonical owners | 目标 presentation 仍归 `ChatTargetPickerModal`；type108 映射/发送仍归 `toIMMessageCard/messages.sendCard` |
| browser proof | 单聊名片 dialog、single 无 ALL、好友排除、群 Tab、disabled 分享与关闭通过，412/412 |
| safety | 不选择、不分享、不发送、不执行 Gateway/SQLite mutation；无 runtime 代码改动 |
| delete-or-register | 无第二 picker/cache/send owner、fixture、wrapper 或 fake success |
| verification | focused 3 files/7 tests、`.94` H5 typecheck 基线、RN protected diff、真实 DOM/route |
| residual | type108 真实发送、跨浏览器/设备继续 gated |

## W6.a6.20.100 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-joined-group-overlay-pass; available-and-application-gated` |
| canonical owners | 群身份/cache 仍归 SDK `conversations.openGroup`；URL/history 仍归 `conversation-route` |
| browser proof | create -> search -> joined group -> canonical conversation -> conversations；中间层不恢复，412/412 |
| safety | 不选择/创建群、不发消息、不进设置、不执行群申请/Gateway mutation；无 runtime 代码改动 |
| delete-or-register | 无第二 group/conversation/URL/history owner、fixture、wrapper 或 fake success |
| verification | focused 4 files/17 tests、`.94` H5 typecheck 基线、RN protected diff、真实 route/DOM |
| residual | available 群、群申请成功返回、跨浏览器/设备继续 gated |

## W6.a6.20.99 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-server-friend-return-and-tabs-pass; slow-network-and-group-result-gated` |
| canonical owners | server request generation 仍归 `ContactSearchPage`；route state 仍归 `contact-search-view`；缺省昵称仍归 shared SDK |
| browser proof | `62 -> im-9162 -> profile -> search` 恢复 keyword/server/friends；friends/groups/friends 可逆切换，412/412 |
| safety | 仅只读查询/导航；不进申请、不提交关系/群 mutation、不发消息/RTC；无 runtime 代码改动 |
| delete-or-register | 无第二 search/tab/request/display-name owner、fixture、wrapper 或 fake success |
| verification | focused 5 files/23 tests、`.94` H5 typecheck 基线、RN protected diff、真实 route/DOM |
| residual | slow-network request race、服务器群结果/已加入群、跨浏览器/设备继续 gated |

## W6.a6.20.98 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-local-joined-group-pass; conversation-fallback-and-server-joined-gated` |
| canonical owners | 本地结果仍归 `buildContactSearchLocalResults`；群身份/cache/navigation 仍唯一归 SDK `conversations.openGroup` |
| browser proof | `donk的群聊` 群 ID `97524759106` 进入规范 conversation ID；Header/消息区/输入区正常，412/412 |
| safety | 只打开已有群；不发送、不进设置、不执行群关系/Gateway mutation；无 runtime 代码改动 |
| delete-or-register | 无第二 group/conversation mapper、URL owner、fixture、wrapper 或 fake success |
| verification | focused 5 files/23 tests、`.94` H5 typecheck 基线、RN protected diff、真实 route/DOM |
| residual | conversation-only fallback、服务器 joined 群、跨浏览器/设备继续 gated |

## W6.a6.20.97 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-three-source-pass; child-mutation-gated` |
| canonical owner | `contact-search-route` 仍唯一清洗来源；`HomeActionMenu` 只写当前 pathname |
| browser proof | messages/contacts/archived -> 同一搜索 -> cancel -> 精确原 scene；归档空态 412/412 |
| safety | 不搜索、不进入资料/申请、不执行 Gateway/SQLite/关系 mutation；无 runtime 代码改动 |
| delete-or-register | 无第二 parser/menu/search owner、wrapper、fixture 或 fake success |
| verification | focused 3 files/7 tests、`.94` H5 typecheck、RN protected diff、route evidence |
| residual | 申请成功返回与跨浏览器/设备继续 gated |

## W6.a6.20.96 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-friend-and-group-result-pass; message-result-target-gated` |
| canonical owner | `buildConversationHomeSearchRoute` 仍唯一编码 href/replace；搜索聚合与聊天定位 owner 不变 |
| browser proof | `.96` 好友、`.105` 群聊结果均进入规范会话并返回会话列表；搜索页不重开，三 route 412/412 |
| safety | 不发消息、不改历史、不执行 Gateway/SQLite mutation；无 runtime 代码改动 |
| delete-or-register | 无第二 URL/history owner、wrapper、fixture 或 fake success；好友/群普通结果均关闭 |
| verification | focused 1 file/7 tests、`.94` H5 typecheck、RN protected diff、route/DOM evidence |
| residual | messageID 结果定位/窗口恢复/高亮继续 gated |

## W6.a6.20.95 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-readonly-pass; relationship-action-and-group-row-gated` |
| canonical owners | Clipboard 仍唯一归 `user-id-clipboard`；嵌套 route state 仍唯一归 `contact-profile-route-state` |
| browser proof | 真实联系人“复制ID成功”/自动消失；search -> profile -> groups -> profile -> search；查询/结果恢复，412/412 |
| safety | 不读 Clipboard 内容，不触发通话/关系/消息/备注/分享/openGroup，不新增 tab/writer/fixture |
| delete-or-register | 无 runtime 代码或第二 owner；只关闭 `.75/.85` 自然样本门禁并保留空共同群列表 non-claim |
| verification | focused 4 files/12 tests、`.94` H5 typecheck、RN protected diff、DOM/route evidence |
| residual | 共同群真实行/openGroup、关系/RTC/send、跨浏览器/设备继续 gated |

## W6.a6.20.94 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-readonly-pass; profile-mutation-and-pending-gated` |
| canonical owners | Clipboard 仍唯一归 `user-id-clipboard`；Navbar/return 仍归 `MeProfileHeader + me-profile-editor-route` |
| browser proof | 412px 本人复制 success-only/自动消失；三个编辑入口正确左右动作并返回资料总览；零溢出/默认边框 |
| safety | 不读取剪贴板内容、不改字段、不点完成、不触发 profile Gateway/SQLite mutation 或 pending |
| delete-or-register | 无运行时代码改动、第二 owner、wrapper、fixture 或 fake success；仅关闭既有 browser gate |
| verification | focused 5 files/19 tests、H5 typecheck、RN protected diff、DOM/geometry evidence |
| residual | 联系人复制自然样本、保存成功、pending spinner、移动设备/跨浏览器继续 gated |

## W6.a6.20.93 Closeout

| field | value |
| :--- | :--- |
| status | `clean/browser-enter-pass; soft-keyboard-ime-device-gated` |
| canonical owner | `.90` 的 `shouldDismissContactSearchKeyboard` 仍唯一判定 Enter/IME/repeat；页面只执行 DOM blur |
| browser proof | 当前登录标签 412x786：`donk` 输入后焦点回 `BODY`，URL/输入/本地联系人与群结果保持，412/412 零溢出 |
| safety | 无 server tabs/loading/server section；未点击显式远端入口，不执行 Gateway/SQLite/mutation，不新建第二 writer |
| delete-or-register | 无新增/替换代码；本片只关闭可自动化 browser evidence，不添加 wrapper、fixture 或假网络证明 |
| residual | 移动软键盘、IME composition、实体设备与跨浏览器继续保留外部门禁 |

## W6.a6.20.92 Closeout

| field | value |
| :--- | :--- |
| status | `clean/light-empty-responsive-pass; populated-and-mutation-gates-retained` |
| canonical owner | `custom-emoji-manager-page.css` 的唯一 surface/grid presentation；SDK 继续唯一持有 list/cache/mutation/type115 业务 |
| defect removed | desktop viewport 不再把 5 列单元扩张到约251px；480px surface 与既有 footer/reorder 边界一致 |
| safety | 当前真实 cache 为空；不伪造表情、不触发 picker/preview/reorder/create/delete/send，不新增 size/drag owner |
| verification | browser 412x786/1280x800 light DOM geometry + screenshots + clean console；focused 2/7、typecheck、full verify |
| tooling debt | 仓库仍无 `scripts/check-convergence.sh`；CSS raw contract 在当前 Vitest transform 不可靠，已删除而非保留假护栏 |
| residual | populated light list、真实 upload/delete/type115 send、Safari/Firefox 和 physical touch 保持门禁 |

## W6.a6.20.91 Closeout

| field | value |
| :--- | :--- |
| status | `clean/ssot-reconciled/local-implementation-inventory-closed; external-acceptance-gates-active` |
| canonical owners | chat search 保持 shared `createIMMessageSearchSync` + H5 search/settings routes；auth/version 保持既有 runtime；平台排除项不创建 owner |
| delete-or-register | 删除 `settings-entry-planned` 与 remaining auth/settings 的陈旧状态；network/cache/global-mute 分别登记 `web-not-applicable/web-not-applicable/blocked-capability` |
| safety | 禁止用 Gateway notification 替代 OpenIM global mute，禁止删除 account IndexedDB/sql.js 冒充 RN 临时目录清理 |
| verification | RN/H5 source、route、facade 与 SSOT 交叉追踪；文档一致性 scan；`npm run verify` 通过 466 assets、H5/SDK Web typecheck、boundary、SDK Web 98/407 和 1184-module build |
| residual | 仅保留真实 mutation、RTC、offline/multi-browser/cross-browser 和自然数据的 external/authorization acceptance gates |

## W6.a6.20.90 Closeout

| field | value |
| :--- | :--- |
| status | `done-local/clean; keyboard-presentation-converged; browser-enter-pass/soft-keyboard-ime-device-gated` |
| canonical owner | `contact-search-view.shouldDismissContactSearchKeyboard` 唯一持有 Enter/IME/repeat 判定；页面只持 DOM blur 适配 |
| delete-or-register | 纯状态 UI 拆至 `ContactSearchStates`；无第二 request/mode/keyboard owner 或 compat handler |
| safety | Enter 不调用 `runServerSearch`；搜索、Tab、请求代次、Gateway、SQLite、Router 和结果保持原链 |
| verification | fail-first 1；focused 2/14；H5 full 135/425；SDK Web 98/407；466 assets、typecheck、1184-module build、route HTTP、RN protected diff |
| residual | `.93` 已关闭当前单标签自动化 Enter/blur；真实移动软键盘、IME composition、实体设备与跨浏览器仍为外部门禁 |

## W6.a6.20.89 Closeout

| field | value |
| :--- | :--- |
| status | `done-local/clean; saving-presentation-converged; browser-pending-visual-gated` |
| canonical owner | 现有 `MeProfileEditorPage.saving`；Header/overlay 仅是两个 RN presentation consumer |
| delete-or-register | 无第二 pending store、save function、route callback、History blocker 或 compat wrapper |
| safety | pending 时禁用左/右动作和字段；nickname overlay 截获页面交互；失败仍由原链解除 saving 并留页 |
| verification | fail-first 2；focused 1/8；H5 135/423；SDK Web 98/407；466 assets、typecheck、1183-module build、三 route HTTP、RN protected diff |
| residual | 真实慢 Gateway pending 像素为 browser gate；既有 >500kB chunk warning 不变 |

## W6.a6.20.88 Closeout

| field | value |
| :--- | :--- |
| status | `done-local/clean; navbar-presentation-converged; browser-readonly-pass/pending-gated` |
| canonical owner | `MeProfileHeader.backLabel` 只决定左侧箭头/取消；独立 back/save class 唯一持有左右颜色语义 |
| delete-or-register | 无旧 owner 可删；没有第二 Header、内联颜色、兼容分支或新的退出/保存 callback |
| safety | nickname/gender/bio 均复用 `returnFromEditor/saveProfile`；Gateway、SQLite、字段 DTO/校验和错误语义不变 |
| verification | fail-first 2；focused 1/6；H5 135/421；SDK Web 98/407；466 assets、typecheck、1183-module build、三 route HTTP、RN protected diff |
| residual | `.94` 已关闭真实 Navbar/返回/取消；pending spinner 仍需真实慢 mutation；既有 >500kB chunk warning 不变 |

## W6.a6.20.87 Closeout

| field | value |
| :--- | :--- |
| status | `done-local/clean; input-owner-converged; browser-keyboard-gated` |
| canonical owner | `profile-edit-view.shouldSubmitProfileNicknameKey` 唯一持有 Enter/IME/repeat 判定；页面 callback 只委托 `saveProfile` |
| delete-or-register | 无旧 owner 可删；不引入 form、兼容 handler 或第二保存函数，顶栏和键盘共同消费同一 mutation chain |
| safety | composition/repeat/非 Enter fail-closed；空昵称、pending、未变更、失败留页与返回栈不变；bio textarea 保留换行语义 |
| verification | fail-first 3；focused 3/10；H5 full 135/419；466 assets、typecheck、1183-module build、两 route HTTP、RN protected diff |
| residual | 当前单标签真实移动软键盘/IME/物理 Enter 仍为 browser gate；既有 >500kB chunk warning 不变 |

## W6.a6.20.86 Closeout

| field | value |
| :--- | :--- |
| status | `done-local/clean; route-stack-owner-converged; browser-readonly-pass/profile-mutation-gated` |
| canonical owner | `me-profile-editor-route` 唯一清洗返回 state 并投影 `history(-1)|profile(replace)`；三个退出点共用 `returnFromEditor` |
| delete-or-register | 不引入兼容 route 或第二 parser；资料总览三个入口登记 history 标记，首页快捷入口/深链显式走安全 fallback |
| safety | 未改 profile 请求、字段校验、Gateway、SQLite、成功/失败语义；未知 state 不允许后退到无关页面；Navbar button reset 保持统一 |
| verification | fail-first 4；focused 4/10；H5 full 135/416；466 assets、typecheck、1183-module build、四 route HTTP、RN protected diff |
| residual | `.94` 已关闭真实 back/取消 history；save-success 仍需 profile mutation 授权；既有 >500kB chunk warning 不变 |

## W6.a6.20.85 Closeout

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-platform-owner-converged; browser-profile-pass` |
| canonical owner | `components/clipboard/user-id-clipboard.copyUserIDToClipboard`；三个用户 ID consumer 共用一个浏览器端口 |
| delete-or-register | 删除 `pages/me/me-profile-clipboard.ts` 及其测试；页面直接 `navigator.clipboard` 为 0，无 compat wrapper 或 fallback |
| safety | 只有 `writeText` resolve 后显示成功；空 ID、缺失 API 和 rejection 全部 fail-visible；身份、Gateway、SQLite 与 Router 不变 |
| verification | fail-first 2；focused 4/17；H5 full 133/411；466 assets、typecheck、1182-module build、route HTTP、RN protected diff |
| residual | `.94/.95` 已关闭本人/联系人 Clipboard resolve/feedback；failure browser path 不主动破坏环境；既有 >500kB warning 不变 |

## W6.a6.20.84 Closeout

- `P0/P1=0`；好友/群聊目标选择唯一归 `ChatTargetPickerModal`，聊天转发与名片分别只传 `multiple|single` 配置。
- 旧 `ChatCardPickerDialog.tsx` 与 `chat-card-picker.css` 已删除；生产源码和 dist 无旧 class/owner，仅防回归测试保留旧组件名的否定断言。
- `toIMMessageCard` 只做 `friend|group -> IMMessageCard` 映射；type108 仍唯一委托 `messages.sendCard`，失败不关闭，无第二 Gateway/SQLite/DTO 或发送状态机。
- fail-first 1、focused 3/8、H5 132/409、466 assets、typecheck、1182 modules、cleanup 与 RN protected diff=0 通过；无 TODO/FIXME/HACK/debug console；真实弹窗交互因当前无 Browser binding 保持 `browser-interaction-gated`。

## W6.a6.20.83 Closeout

- `P0/P1=0`；群申请 already-joined 会话解析唯一归 SDK `conversations.openGroup`，H5 页面只传 groupID 和消费规范 conversationID。
- 页面 `groups.listCached -> groups.sync -> find` 重复 owner 已删除；群列表分页/缓存缺失不再被误当成会话不可进入。
- 无 mock/fake-success、页面 Gateway/SQLite、关系/申请算法、孤立 helper、TODO/FIXME/HACK 或 debug console；页面 200 行。
- fail-first 1、focused 3/10、H5 132/409、466 assets、typecheck、1184 modules、三 route HTTP 通过；`.104` 已关闭真实 already-joined CTA/openGroup/chat/back，available/申请分支继续 gated。

## W6.a6.20.82 Closeout

- `P0/P1=0`；conversation ID trim/URI encode 唯一归 12 行 `conversation-route`，联系人私有 URL helper 已删除；三个生产入口共同消费且显式传入历史策略。
- 建群/查群/search apply 双向切换与 joined 群进聊天统一 replace；扫码申请保持 push；selection、keyword、Tab route state 不变。
- 无 mock/fake-success、History API、Gateway/SQLite/OpenIM、群关系/申请算法、孤立 export、TODO/FIXME/HACK 或 debug console。
- fail-first 3 suites + 1 wiring assertion、focused final 4/13、H5 132/409、SDK Web 98/407、466 assets、typecheck/boundary/`build:web/sync:web`/1184 modules、三 route HTTP 全绿；`.100` 已关闭真实 joined 群 search/click/chat/back，available/申请分支继续 gated。

## W6.a6.20.81 Closeout

- `P0/P1=0`；异步交互 latest-request 相等判断唯一归 7 行 `components/interaction/interaction-request`，联系人与会话搜索共同消费；两份页面同义 helper 已删除。
- 联系人服务器搜索不再以 loading 丢弃 Tab 点击；关键词/Tab 建立新代次，只有最新代次可提交结果、错误和 loading；旧成功/失败均 fail-quiet。
- 无 mock/fake-success、Gateway/SQLite/OpenIM、关系三态、请求取消、路由或 SDK/RN 业务变化；无孤立 export、TODO/FIXME/HACK 或 debug console。
- fail-first 2、focused final 4/20、H5 131/405、SDK Web 98/407、466 assets、typecheck/boundary/`build:web/sync:web`/1183 modules 全绿；`.99` 已补正常网络好友/群聊 Tab 可逆切换，真实慢网迟到请求仍登记 `browser-slow-network-gated`。

## W6.a6.20.80 Closeout

- `P0/P1=0`；群/会话 identity 与 cache 唯一归 SDK `conversations.openGroup`；该切片的私有 URL helper 已由 `.82` 删除并收敛到全局 `conversation-route`。
- 本地群和服务器 joined 群在 SDK resolve 后共用 `trim + URI encode + replace`；空 ID 留页报错；URL 自然切换消息 Tab，无第二 Tab store。
- 无 mock/fake-success、History API、Gateway/SQLite/OpenIM、关系算法或 available/pending 分支变化；旧 view 中重复来源白名单断言已删除。
- fail-first 2、focused 4/19、H5 129/402、SDK Web 98/407、466 assets、typecheck/boundary/`build:web/sync:web`/1182 modules 全绿；`.98` 已补本地 joined 群像素，服务器 joined 群仍自然样本门禁。

## W6.a6.20.79 Closeout

- `P0/P1=0`；联系人搜索来源唯一归 8 行 `contact-search-route`，菜单只记录、搜索/资料/群申请只消费或传递，无第二 parser。
- 只允许通讯录、会话和归档会话三个 scene；非法/外部/搜索自身地址回退通讯录；取消统一 `replace`，无 History API、DTO/token、Gateway/SQLite 或关系双轨。
- fail-first 5 项、focused final 6/24、H5 128/399、SDK Web 98/407、466 assets、typecheck/boundary/`build:web/sync:web`/1182-module build 全绿；RN protected diff=0；route HTTP 200。
- 真实三入口取消与子链返回像素登记 `browser-interaction-gated`；本片不执行申请、打开群会话或其他 mutation。

## W6.a6.20.78 Closeout

- `P0/P1=0`；搜索结果 route 唯一归 `buildConversationHomeSearchRoute`，页面只消费 React Router，消息窗口定位仍归 `ChatPage`。
- 好友/群聊/消息结果统一 `replace=true`；消息结果保留 URI 编码的 `messageID`；无第二 URL builder、History API、SDK/Gateway/SQLite 或搜索业务双轨。
- fail-first 2 项、focused 1/7、H5 127/397、SDK Web 98/407、466 assets、typecheck/boundary/`build:web/sync:web`/1181-module build 全绿；RN protected diff=0；route HTTP 200。
- accepted debt：`conversation-home-search.ts` 307 行略高于 cleanup 300 建议线但低于仓库 1000 行强制线；新增 19 行与结果模型同责，当前拆分只会产生单 consumer wrapper。

## W6.a6.20.75 Closeout

- `P0/P1=0`；共同群聊入口复用 `.74` 的 `contact-profile-route-state`，资料/共同群/Header 无第二 parser，业务继续唯一归 SDK `contacts.listCommonGroups/conversations.openGroup`。
- 只传既有白名单 `profileRouteState`；无任意 history state、DTO/token、History API、Gateway/SQLite、fake-success、临时标记或调试日志。
- fail-first 1 项、focused 2/6、H5 125/389、SDK Web 98/406、466 assets、typecheck/boundary/1176-module build 全绿；RN protected diff=0；真实像素登记 `browser-session-gated`。
- accepted debt：既有 `ContactProfilePage.tsx` 457 行超过 page 400 建议线，但低于 1000 行强制拆分线；本片只增加 3 行 route wiring，不扩张业务 owner。

## W6.a6.20.74 Closeout

- `P0/P1=0`；资料 child route state 唯一归 `contact-profile-route-state`，资料/申请/Header 无第二 parser，申请业务继续唯一归 SDK `peerProfile.applyFriend`。
- backHref 采用明确 allowlist，搜索/群候选/扫码来源按字段清洗；无任意 state、DTO/token、History API、Gateway/SQLite、fake-success 或 debug path。
- focused 4/25 + final 3/15、H5 125/389、SDK Web 98/406、466 assets、typecheck/boundary/1176-module build 全绿；真实只读二级返回链与 console 通过；RN protected diff=0。
- accepted debt：既有 `ContactProfilePage.tsx` 455 行超过 page 400 建议线，但低于仓库 1000 行强制拆分线；本片删除旧 parser 后净缩减且不扩张业务 owner，后续由资料页职责拆分切片处理。

## W6.a6.20.73 Closeout

- `P0/P1=0`；搜索 route state 唯一归 `contact-search-view`，结果行只传递、资料 Navbar 只消费，资料业务页不拥有搜索状态。
- 仅恢复 `/contacts/search + bounded keyword + legal tab`；无 History API、Gateway/SQLite/DTO/token 或 profile/search mutation 双轨。
- fail-first 3 项、focused 2/12、H5 124/385、SDK Web 98/406、466 assets、typecheck/boundary/1175-module build 全绿；`.95` 已补 local，`.99` 已补 server friends 资料返回；server groups 结果保持样本门禁。

## W6.a6.20.72 Closeout

- `P0/P1=0`；本地合并唯一归 `buildContactSearchLocalResults`，会话缓存与导航身份校验仍唯一归 SDK `conversations.listCached/openGroup`。
- conversation fallback 仅补 joined groups 缺失项，不推断群成员、角色、权限或状态；三类缓存独立失败并保留成功快照。
- focused 2/12、H5 123/382、SDK Web 98/406、466 assets、typecheck/boundary/1175-module build 全绿；RN protected diff=0；自然 conversation-only 群像素登记 `browser-sample-gated`。

## W6.a6.20.71 Closeout

- `P0/P1=0`；本地合并唯一归 `buildContactSearchLocalResults`，数据与导航仍唯一归 SDK contacts/groups/openGroup facades。
- contacts/groups 独立失败保留另一类成功结果；无 Gateway/Repository/SQLite/DTO/cache/身份算法双轨。
- focused 2/10、H5 123/380、SDK Web 98/406、466 assets、typecheck/boundary/1174-module build 全绿；`.98` 已用真实本地 joined 群关闭 session gate，RN protected source 保持零改动。

## W6.a6.20.70 Closeout

- `P0/P1=0`；入口 presentation 唯一归 `ChatAutoDeleteSettingsRow`，最终授权唯一归 `canManageChatAutoDelete`，mutation 仍归 shared conversation auto-delete facade。
- 管理员不再因 `canClearMessages` 获得群自动删除权限；单聊设置与群主管理分别消费同一路由，无并行业务 owner。
- H5 122/375、SDK Web 98/406、466 assets、typecheck/boundary/1174-module build 全绿；`.102` 已关闭真实单聊/群主入口层级，`.107` 已关闭普通成员，管理员角色仍 natural-data-gated。

## W6.a6.20.69 Closeout

- `P0/P1=0`；公告入口唯一投影为 `buildChatSettingsView -> currentUserRole`，公告编辑仍唯一归 `GroupAnnouncementPage -> canEditAnnouncement`。
- 无 SDK/RN/Desktop/Gateway/SQLite/公告 mutation 改动；owner/admin/member/unrelated 矩阵与全量回归通过。
- `.103` 已用真实 owner 关闭设置入口/编辑投影/取消返回，`.107` 已关闭 member 隐藏入口；admin 角色和发布/已读 mutation 继续 gated。

> RN FREEZE OVERRIDE (2026-08-12): 当前 H5/Web 迁移不再修改 RN 业务源码。本文历史 closeout 中凡声称本轮新增群资料、群公告、群名片、群管理权限或成员移除已完成 RN caller convergence 的内容均由 active status 与 consumer matrix 覆盖；这些能力当前为 `shared-core-ready/web-consumed/rn-frozen`。

> TYPE: W6 CLOSEOUT SSOT. `local gate green` does not imply real Gateway、device or destructive-flow acceptance.

## 1. Verdict

| dimension | state | evidence |
| :--- | :--- | :--- |
| shared business owner | `converged` | clear/realtime/search logic exists once in `im28-sdk/src/sync`; RN/H5 own composition and presentation |
| SDK -> RN compatibility floor | `green` | 5 suites/176 tests + RN typecheck |
| H5 local migration floor | `green` | 466 assets + SDK Web 58/200 + H5 typecheck/build |
| RN repository floor | `green` | TypeScript passed；164/164 suites、1369/1369 tests；ChatDetail 166/166 |
| W6 local closeout | `done-local/acceptance-gated` | local P0/P1 zero；external gates remain explicit |

## 2. RN Regression Ledger

| owner | failures | classification | next action |
| :--- | ---: | :--- | :--- |
| `ChatDetailScreen.test.tsx` | 0 | segmented history/staged unread integration contract converged | `166/166` green；production fixes and current native event sequence are covered |
| `ActionBubble.test.tsx` | 0 | fixed product SVG paint propagation | `5/5` green |
| `ConversationListScreen.test.tsx` | 0 | standalone contract is green；prior full-run leakage not reproduced after convergence | targeted suite green |
| `BroadcastComposeScreen.test.tsx` | 0 | fixed owned ScrollView lookup | targeted suite green |
| `ChatHomeScreen.test.tsx` | 0 | chronological cache ordering expectation aligned | targeted suite green |
| `ProfileQRCodeOverlay.test.tsx` | 0 | React Native `Platform.default` mock repaired | targeted suite green |
| `ForwardTargetSelector.test.tsx` | 0 | restored card-share message input | targeted suite green |
| `chatMessageHelpers.test.ts` | 0 | `im-` fallback identity contract frozen | targeted suite green |
| `scripts/__tests__/svg-icon-paints.test.js` | 0 | registered as a real Jest test | targeted suite green |

Resolved ChatDetail production defects: no-boundary history no longer duplicates rows；server-cleared/deleted unread gaps use an explicit non-user read convergence path；voice played persistence and rendering use one stable message identity. Corrected guards: delete marker order is `marker -> shatter -> animation end -> remove`，and incomplete history mocks no longer inject `clientMsgID=undefined` rows.

Resolved closeout drift: staged unread anchors use index `0` before the unread batch enters the native document flow；read reporting requires a completed anchor plus real user drag/scroll/end events；presence tests cover cache-first status followed by deferred Gateway refresh. No SDK business rule was weakened to satisfy legacy UI assertions.

## 3. Boundary Audit

| rule | result | retained exception |
| :--- | :--- | :--- |
| H5 page MUST NOT own SQL/Gateway client | `pass` | `chat-media-download.ts` uses injected browser resource `fetch`; no IM API/cache mutation |
| RN screen MUST NOT call SDK runtime directly | `pass` | screen imports are types or pure preset/icon helpers only |
| shared clear/realtime/search MUST have one owner | `pass` | SDK neutral sync + RN/H5 composition facades |
| fake-success main path MUST NOT exist | `pass` | visible errors remain visible；no local success fallback |
| generated app packages MUST NOT own source | `pass` | app `packages/im-sdk` contains generated package artifacts only |

## 4. Accepted Debt

| debt | reason | exit condition |
| :--- | :--- | :--- |
| RN `ChatDetailScreen.tsx` exceeds 1000 lines | current change restores a narrowly scoped production notice regression；splitting the high-risk screen inside closeout would expand blast radius | dedicated guarded refactor with behavioral baseline |
| H5 production main chunk exceeds 500 KB warning | migration remains functional and build is green | route/module chunking performance slice |
| Jest reports open handles under `--forceExit` | full suite completes but teardown ownership is not isolated | run targeted `--detectOpenHandles` and fix owning service mocks |
| RN lint unavailable | repository has no usable ESLint config in the current package baseline | restore declared lint toolchain/config and rerun |

## 5. External Gates

| gate | state | required authority/environment |
| :--- | :--- | :--- |
| real Gateway login/data-backed parity | `blocked-external` | stable test Gateway credentials/data |
| clear/delete/edit/send mutations | `blocked-authorization` | explicit destructive/mutation approval |
| dual-account realtime/list-back | `blocked-external` | two simultaneous authenticated clients |
| Safari/Firefox/browser matrix | `blocked-environment` | runnable target browsers |
| RTC authentication/call flow | `blocked-external` | valid RTC credentials and device permissions |

## 6. Exit Rule

`W6.closeout = local P0/P1 zero + SDK all-runtime green + H5 verify green + RN full local floor green + residual external gates explicitly retained`.

## 7. W6.a6.19 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| canonical display-name owner | `pass` | `resolveIMGroupMemberDisplayName + formatIMUserDisplayName` own `备注 > 群内昵称 > 公开昵称 > im-userID后四位`；H5 has no duplicate priority chain，RN caller remains frozen |
| generated-package boundary | `pass` | source changed only under `im28-sdk/src`；`build:web`/`build:rn` synced committed app distributions；`build:package:desktop:web` remained unchanged |
| platform-only presentation | `pass` | H5 owns sender placement、role badge、180px image ratio、voice width and browser OSS decode fallback；message URL/cache/mention identity remain immutable |
| file-size convergence | `pass` | touched `chat-page.css` was split from 1138 to 902 lines；message content styles moved to a 235-line owned file；all touched TS/TSX stay below 300 lines |
| placeholders/debug/dead exports | `pass` | no new TODO/FIXME/HACK/console path；shared resolver has RN/Web consumers and focused tests |
| local verification | `green` | H5 5/22 focused + full verify；SDK Web 59/204 + sender 1/4；466 assets；RN/Web/Desktop typecheck；build:rn/build:web/H5 build |

Incremental P0/P1 is zero. Accepted gates are a real owner/admin sender sample、signed/private OSS media、Safari/Firefox media behavior and already registered authorized mutation/realtime/RTC flows.

## 8. W6.a5.2.1.3 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| current RN route truth | `pass` | one contact shortcut opens `验证消息` with `好友验证/群聊验证` tabs；H5 removed the two-shortcut drift |
| business owner | `pass` | verification container owns route/presentation only；existing friend/group pages retain their sole facade and mutation flows |
| compatibility exit | `pass` | two old index paths are redirect-only；unused standalone page/header/search branches were deleted；group detail remains one route |
| platform boundary | `pass` | no SDK、RN、Gateway、SQLite or generated package source changed；no fake badge/success was added |
| local/browser gate | `green` | SDK Web 59/204；H5 typecheck/build；real 5-row friend/empty group data、390x844/760x900、redirect/reload/back、zero-overflow/zero-console proof passed |

Incremental P0/P1 is zero. Pending friend、non-empty owner/admin group、unread badges、approved mutations and Safari/Firefox remain explicit gates.

## 10. W6.a6.18.3.4 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| shared business owner | `pass` | group introduction remains `WebIMJoinedGroup.introduction` behind existing group cache/sync facade；H5 adds no Gateway、SQL、DTO or update state machine |
| route ownership | `pass` | one lazy React Router child route owns the read-only detail；settings entry uses current verified conversation identity |
| parity/no fake path | `pass` | RN order and three canonical strings are source-traced；cache miss and mismatched group fail visibly rather than fabricating content/success |
| code hygiene | `pass` | new TSX is 140 lines、CSS 92 lines；no TODO/FIXME/HACK、console、dead export、platform-cross import or duplicate helper |
| local/browser gate | `green` | focused 5/5、H5 54/177、SDK Web 70/272、466 assets/typecheck/build；authenticated 567/390px entry/detail/back/overflow/console proof |

Incremental P0/P1 is zero. Non-empty remote content、owner/admin editing、dark/device/Safari/Firefox and all group mutations remain explicit acceptance gates.

## 11. W6.a6.18.3.5 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| canonical data owner | `pass` | announcement/version/edit permission are explicit shared DTO fields from joined-group raw cache；H5 contains no raw-payload parser or role fallback |
| consumer boundary | `pass` | Web settings/detail consume shared fields；RN business screens remain unchanged and compile against rebuilt `/rn` package；matrix registers RN mutation convergence as residual |
| duplicate convergence | `pass` | introduction and announcement use one `GroupTextDetailPage` for route validation/cache/sync/errors/layout；two thin pages only select field and RN strings |
| package/runtime safety | `pass` | all-runtime typecheck/boundary and ordinary build:rn/build:web passed；generated app packages synced；`build:package:desktop:web` untouched |
| debug/dead/size | `pass` | shared detail TSX 150 lines、thin pages 18/17 lines；no TODO/FIXME/HACK/console/platform-cross import；old introduction-specific CSS owner renamed to neutral text-detail owner |

Incremental P0/P1 is zero. Real update/read-mark/send、ordinary-member/non-empty samples、dark/device/Safari/Firefox remain explicit gates. Vite HMR transient provider/removed-CSS reload history is excluded from zero-console claims; stable production build and functional runtime proof are green.

## 12. W6.a6.18.3.6 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| canonical owner | `pass` | existing group-member facade owns auth identity、validation、Gateway call、mutation queue、success-only upsert and returned DTO；H5 has no API/SQL/cache state machine |
| RN isolation | `pass` | no RN business source changed；ordinary `build:rn` only synced committed generated package and RN `tsc` passed |
| failure atomicity | `pass` | real sql.js tests cover success、Gateway failure、identity mismatch、empty/overlength input and unchanged old cache |
| realtime honesty | `pass-gated` | no speculative WebSocket listener；stable Gateway event contract and second-account list-back are explicitly unresolved |
| package/runtime safety | `green` | SDK 9/9 + Web 70/274、all-runtime typecheck/boundary、build:rn/build:web；H5 7/7 + full verify；`build:package:desktop:web` untouched |
| code size | `pass` | nickname mutation split to 100-line domain module；group sync 286 lines；H5 dialog/card 132 lines；settings page reduced from 533 to 392 lines |

Incremental P0/P1 is zero. Browser controls were unavailable in this tool session, so open/cancel/layout proof remains pending and no real nickname save was executed.

## 13. W6.a6.18.3.7 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| canonical owner | `pass` | `group-card-share.ts` 单一持有目标过滤、direct conversation、type108/type101 顺序与缓存状态；RN/H5 未复制 Gateway DTO 或发送循环 |
| consumer convergence | `pass` | RN production `shareGroupCard` 与 Web contacts facade 调用同一 SDK action；旧 RN 逐目标 Gateway/message 编排已删除 |
| platform projection | `pass` | RN 仅投影 canonical 卡片/文本为既有 `MessageItem`；H5 仅持有 React Router 选择、搜索、反馈和真实 conversationID 导航 |
| package/runtime safety | `green` | SDK 12/12、RN/Web typecheck/build:rn/build:web；RN tsc + 43 focused；H5 9/9 + typecheck/build；`build:package:desktop:web` untouched |
| browser safety/layout | `pass-readonly` | 认证真实群加载 7 个好友目标，搜索、单选、取消、返回和 480px 无溢出通过；没有点击分享或写消息 |
| duplicate/dead/size | `pass` | 共享业务拆为独立模块，新 H5 page 166 行；保留通用 `sendCardMessage` 作为聊天发送能力，不与群名片多目标 orchestration 重叠；无 fake success/console/TODO |

Incremental P0/P1 is zero. 真实分享、附言、partial failure/retry、RN device projection、第二账号 realtime/list-back 和跨浏览器矩阵仍是显式验收门。

## 14. W6.a6.18.3.8 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| canonical owner | `pass` | `group-profile-update.ts` 单一持有权限、名称校验、Gateway 响应匹配、旧字段合并和 success-only group upsert；H5 不含 transport/SQL/DTO 规则 |
| RN behavior preservation | `pass` | 仅 name-only `updateGroupInfo` 进入 shared composition；头像、简介、公告和组合更新仍走原路径；现有 screen caller 未改 |
| platform projection | `pass` | RN 保留既有内存 group/conversation cache 与事件；H5 仅持有 React Router、草稿、编辑层、clipboard port 和可见失败 |
| failure atomicity | `pass` | real sql.js 覆盖成功、成员权限不足、Gateway 失败、响应群错配及旧 avatar/introduction/announcement/role/order 保留 |
| package/runtime safety | `green` | all-runtime typecheck/boundary、build:rn/build:web；RN tsc + 126/5；H5 10/10 + full verify 70/278、466 assets/build；`build:package:desktop:web` untouched |
| duplicate/dead/size | `pass` | shared domain 114 行、RN composition 35 行、H5 page 168 行/view 39 行；无 fake success、console、TODO/FIXME/HACK 或第二个群名 mutation owner |

Incremental P0/P1 is zero. 真实改名、普通成员权限样本、第二账号 type1520/list-back、群头像与其他资料字段、RN device 和跨浏览器矩阵仍是显式验收门。

## 15. W6.a6.18.3.9 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| canonical owner | `pass` | `group-profile-update.ts/joined-group-sync.ts` 单一持有权限、上传输入、Gateway 响应和 success-only cache；H5 不含凭证/transport/SQL/DTO 规则 |
| RN behavior preservation | `pass` | 仅 avatar-only `updateGroupInfo` 进入 shared composition；页面选库/相机、圆形裁剪、上传调用、组合资料更新与简介/公告 caller 未改 |
| platform projection | `pass` | H5 只持有文件 input、短期 object URL、拖动/缩放、Canvas 512 JPEG 和可见失败；StrictMode URL 生命周期已在真实预览中修复 |
| failure/queue safety | `pass` | sql.js 覆盖上传失败、成员越权、响应错配和旧字段保留；上传位于全局写队列外，Gateway/SQLite 在队列内，不阻塞消息缓存 |
| package/runtime safety | `green` | SDK 73/285 + all-runtime typecheck/boundary、build:rn/build:web；RN 127；H5 4 + typecheck/build；`build:package:desktop:web` untouched |
| duplicate/dead/size | `pass` | shared module 181 行、crop 121 行/dialog 172 行/profile page 231 行；无 fake success、console、TODO/FIXME/HACK 或第二群头像 owner |

Incremental P0/P1 is zero. 真实上传/更新、普通成员、第二账号 type1502/list-back、RN device camera/library 和跨浏览器触摸矩阵仍是显式验收门。

## 16. W6.a6.18.3.10 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| canonical owner | `pass` | `group-profile-update.ts/joined-group-profile-actions.ts` 单一持有简介校验、权限、Gateway 响应和 success-only cache；H5 不含 transport/SQL/raw DTO 规则 |
| RN behavior preservation | `pass` | 仅 introduction-only `updateGroupInfo` 进入 shared composition；screen、中文表单提示、内存 group/conversation 与事件投影未改，500 字上限只改为复用 SDK 常量 |
| compatibility register | `explicit` | 公告和组合 `updateGroupInfo` 继续走既有 RN 路径；有明确 owner/退出条件，不伪装成已收敛能力；Desktop 只导出 shared owner，尚无应用 caller |
| failure atomicity | `pass` | real sql.js 覆盖空值、超长、越权、Gateway 失败、群错配、description 错配和旧 cache 保留；空值不做 fake clear |
| package/runtime safety | `green` | SDK 74/287 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc + 128；H5 full verify 71/282、466 assets/743 modules；`build:package:desktop:web` untouched |
| duplicate/dead/size | `pass` | shared profile 232 行、actions 147 行、mappers 147 行、RN composition 112 行、H5 detail page 小于 300 行；无 console/TODO/FIXME/HACK、第二简介 owner或新超大文件 |

Incremental P0/P1 is zero. 真实保存、普通成员、第二账号 type1521/list-back、RN device 和跨浏览器矩阵仍是显式验收门。

## 17. W6.a6.18.3.12 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| primary path | `pass` | 群名/头像/简介分别由 shared SDK 单字段 owner 持有；公告只走 `publishGroupAnnouncement`；RN composition 仅注入平台依赖和投影事件 |
| delete-or-register | `deleted` | RN/H5 组合 production caller 为 0；旧 `updateGatewayGroupInfo`、`imClientAdapter.updateGroupInfo`、OpenIM `setGroupInfo` fallback 与组合成功测试已删除，不保留 compat register |
| contract guard | `pass` | `UpdateGroupInfoRequest` 收紧为互斥单字段 union；运行时对旧 JS 组合/公告输入 fail-closed 且零 Gateway/SQLite side effect |
| test roles | `pass` | SDK tests 是 shared behavior；RN 单字段委托与组合拒绝是 consumer contract/behavior；H5 view tests 是无回归 proof |
| package/runtime safety | `green` | SDK all-runtime typecheck/boundary + 7 tests；RN tsc + 128；H5 typecheck + 12；`build:package:desktop:web` untouched |
| structural verdict | `clean` | 无 parallel primary path、test-only production wrapper、orphan helper、fake success、TODO 或新增 console；H5 production source unchanged |

Incremental P0/P1 is zero. 真实群资料/公告 mutation、RN device、第二账号 realtime/list-back 和跨浏览器矩阵继续沿用既有外部门禁。

## 9. W6.a5.2.15 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| shared business owner | `pass` | member cache/sync and display-name priority remain in the existing SDK facades；H5 adds no transport、SQL or identity state machine |
| route ownership | `pass` | one React Router member route；profile return state is allowlisted to that exact route family |
| duplicate/dead code | `pass` | settings preview now reuses the shared display-name resolver；member row/view/page responsibilities are separated and all new TS/TSX files stay below 300 lines |
| debug/placeholders | `pass` | no new console、TODO/FIXME/HACK、mock or fake-success path |
| local/browser gate | `green` | focused 4/15、typecheck/build/full verify、authenticated 4-row/search/profile-back and 567/390px zero-overflow proof |

Incremental P0/P1 is zero. SDK/RN source and `build:package:desktop:web` remain untouched；all group mutations and RTC remain outside this slice.

## 17. W6.a6.18.3.11 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| canonical owner | `pass` | `group-announcement.ts` 单一持有发布/权限/版本已读，`group-announcement-realtime.ts` 单一持有 type1519 cache；RN/H5 无第二 Gateway/SQL/消息状态机 |
| RN behavior preservation | `pass` | RN 公告页面改为一次 `publishGroupAnnouncement` composition；既有文本发送、MessageItem、内存 cache/event 与页面确认语义保留，146 focused 回归通过 |
| failure and version safety | `pass` | real sql.js 覆盖输入/越权前置失败、Gateway 精确回包、update-before-send、部分成功、status 缺字段和旧版本 mark 后新公告仍未读 |
| package/runtime safety | `green` | SDK 73/290 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc；H5 full verify、466 assets/748 modules；`build:package:desktop:web` untouched |
| duplicate/dead/size | `pass` | shared 主模块 300 行、realtime 137 行、RN composition 103 行、H5 hook 89 行/detail 298 行；旧 RN 公告 Gateway read/status 与消息文本 helper 已删除，无 fake success/TODO/debug owner |

Incremental P0/P1 is zero. 组合 `updateGroupInfo` compatibility path 有登记 owner 和下一片退出审计；真实发布/发送/read mark、普通成员服务端拒绝、第二账号 type1519/list-back 和跨浏览器矩阵仍是显式验收门。

## 18. W6.a6.18.3.13.2 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| primary path | `pass` | `group-member-removal.ts -> createIMGroupMentionSync.removeMembers -> GatewayHTTPClient/GroupRepository` 是唯一权限、目标、远端写、事务与 partial-success owner |
| delete-or-register | `deleted` | RN `removeGatewayGroupMembers`、OpenIM `kickGroupMember` adapter/runtime fallback 已退出；实时成员事件仍消费的本地 cache helper 有真实 production caller，不是 compat 或死代码 |
| RN behavior preservation | `pass` | `GroupRemoveMembersScreen` 未改；service 保留参数、内存成员快照、groups event 与原成功/失败调用合同，只替换业务执行 owner |
| H5 boundary | `pass` | React Router 页只持有 cache-first load、搜索、选择、确认、错误和导航；候选/名称/权限来自 shared facade，权限同步完成前不渲染候选，`remote-only` 禁止重放 |
| test roles | `pass` | SDK 17 项是 contract/behavior；RN 29+128 是 consumer behavior；H5 10 项是 view behavior；认证直链自动退回是 read-only proof；无 placeholder |
| package/runtime safety | `green` | SDK all-runtime typecheck/boundary、build:rn/build:web；RN tsc + 157 tests；H5 full verify 75 files/298 tests、466 assets、755 modules；`build:package:desktop:web` untouched |
| duplicate/dead/size | `pass` | shared 新 owner 217 行、repository 290 行、H5 page 222 行；无 parallel writer、fake success、TODO/FIXME/HACK、新 console 或孤儿 route |

Incremental P0/P1 is zero。真实最终移除、服务端拒绝、第二账号 realtime/list-back 和 owner/admin 可操作页面仍是显式 destructive acceptance gate。仓库没有 `scripts/check-convergence.sh`，已用 runtime boundary、owner/consumer grep、LoC/debug 扫描和三端回归替代。
W6.a6.20.76 cleanup result: P0/P1 zero. Canonical greeting owner is SDK `modules/friendship/friend-application-message.ts`; `peerProfile.applyFriend` and H5 `/add` consume the same fallback, while H5 only reads current profile, preserves edited text and replaces back to the profile route after the real mutation resolves. The old H5 fixed literal/submitted-lock path is gone. RN keeps its existing equivalent helper under the explicit `rn-frozen` register and was not edited or rebuilt. Focused 4 files/14 tests, H5 126/392, SDK Web 98/406, typecheck/runtime boundary, 466 assets and 1179-module production build passed. No duplicate Gateway/SQLite/relationship state, fake success, debug output or oversized touched file was introduced. Real friend application and two-account receipt/list-back remain mutation-gated. Structural verdict: `clean/shared-core-ready/web-consumed/rn-frozen`.
W6.a6.20.77 cleanup result: P0/P1 zero. Canonical owner is SDK `modules/group/group-application-message.ts + groupApplications.apply`; H5 reuses one application draft helper and owns only profile read/Router navigation. Fixed Web greeting and local submitted state were removed; no second transport/cache/membership path, mock, fake-success, debug marker or forbidden RN/Desktop change was added. Existing `group-application-sync.ts` size is accepted debt below the hard split threshold. Real application/audit/list-back remains mutation-gated. Structural verdict: `clean/shared-core-ready/web-consumed/rn-frozen`.
