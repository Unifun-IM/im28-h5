# IM28 H5 Foundation Status

- status: `active`
- current_step: `W6.a6.18.3.5 shared 群公告投影、权限入口与只读 React Router 子页已完成本地闭环`
- next_step: `继续 W6 群设置功能检索；优先冻结“我在本群的昵称”read/update/cache/realtime shared contract，再评估群名片类型是否可复用既有卡片 facade；真实编辑和分享保留显式授权门`
- blockers: `W5.a3 browser matrix remains blocked-environment；destructive/send/edit/delete/clear and real dual-account RTC flows require explicit authorization`
- gate_state: `W6 group-announcement slice green/read-only-accepted；group introduction remains closed；clear-history、archive and incoming-call prior gates remain unchanged`
- latest_evidence: `2026-08-12 group-announcement closeout: SDK joined-group real sql.js 4/4、all-runtime typecheck/boundary、build:rn/build:web；RN tsc；H5 focused 6/6、SDK Web 70/272、466 assets/typecheck/production build；authenticated owner/admin group showed entry + “暂无群公告” detail/back/480px no-overflow；no update/read-mark/send mutation；desktop:web script untouched`

## W6 Shared Group Announcement Readonly Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared DTO | `shared-core-ready/web-consumed` | `WebIMJoinedGroup` 从同一 Gateway/SQLite payload 投影公告、版本和显式编辑权限，旧快照按群主规则回退 | RN consumer convergence for update/read status |
| RN visibility parity | `pass-auth-readonly` | H5 仅对匹配群的 owner/admin 显示公告卡，位置在置顶/免打扰之后、清空记录之前；空副标题“未设置” | ordinary-member authenticated sample |
| detail owner | `pass` | 简介/公告共用 `GroupTextDetailPage` 的会话校验、cache-first 群同步、失败与布局；公告页只配置字段/标题/空值 | non-empty real announcement sample |
| runtime/layout | `pass-chromium` | 真实 owner/admin 群进入 `/settings/announcement` 显示“暂无群公告”，返回群设置且 480px surface 无横向溢出 | dark/device/Safari/Firefox；dev HMR history logs not used as zero-console evidence |

本切片未执行 `/v1/group/update`、公告已读标记、公告文本发送或其他群管理 mutation。SDK 使用普通 `build:rn/build:web` 同步应用包；`build:package:desktop:web` 未修改或执行。

## W6 Group Introduction Readonly Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| source parity | `pass` | RN 群设置第二卡顺序、空值副标题“请输入群的内容介绍”、详情空值“暂无群简介”和只读页脚均已对齐 | owner/admin edit mode |
| data owner | `pass` | H5 只消费当前账号 `conversations` 与 `groups` cache-first/sync facade；同目标群匹配后才投影 `introduction` | offline-source isolation、remote non-empty sample |
| route/failure | `pass-auth-readonly` | `/conversations/:conversationID/settings/introduction` 可深链和返回；单聊误入、会话缺失、群资料缺失均 fail visible | cross-browser history matrix |
| layout/runtime | `pass-chromium` | 567x786 与 390x844 surface/footer/正文无横向溢出，零 console error | physical device、dark theme |

本切片未新增或修改 SDK/RN source，未调用群资料更新接口，也未执行编辑、分享、邀请、移除或其他群管理 mutation。`build:package:desktop:web` 未修改或执行。

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
