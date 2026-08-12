# IM28 H5 Foundation Cleanup

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
| canonical display-name owner | `pass` | `resolveIMGroupMemberDisplayName` owns `备注 > 群内昵称 > 公开昵称 > userID` and is exported by RN/Web/Desktop；H5 has no duplicate priority chain |
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
