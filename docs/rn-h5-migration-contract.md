# RN to H5 Migration Contract

> TYPE: MIGRATION_SSOT / RN_PARITY_CONTRACT
> STATUS: FROZEN / 2026-08-10
> AXIOM: `im28-phone` 是产品视觉、静态资源、页面行为和能力范围真相源；`im28-h5` 只做浏览器语义适配，不另起一套设计或业务协议。

> RN SOURCE FREEZE (2026-08-12): 本迁移只读 `im28-phone` 作为视觉、资产、行为和接口语义来源，不修改其业务源码、测试或原生工程。允许的 RN 变更仅为依赖/包接线、生成 `packages/im-sdk/**` 和不改变运行逻辑的 import specifier。SDK shared core 与 H5/Web caller 可继续建设；RN 未接入时标记 `shared-core-ready/web-consumed/rn-frozen`，不得伪报 convergence。

> USER DISPLAY FALLBACK (2026-08-14): 用户未设置昵称时，可见名称统一为 `im-` + trim 后 userID 后四位；空昵称或服务端以完整 userID 回填的占位昵称均视为未设置。完整 userID、account、phone 与 email 只作身份/搜索/接口字段，不冒充昵称。SDK `normalizeIMUserNickname + formatIMUserDisplayName` 是 Web 唯一 owner；RN 既有同行为 helper 冻结，未授权切换 caller。

> OFFLINE CACHE BOUNDARY (2026-08-14): H5 已证明 authenticated hot session 在 Gateway HTTP/WebSocket 均不可用时仍可通过 shared facade 读取当前账号 SQLite 会话、联系人和聊天历史，且远端失败保持可见。整页 reload 仍必须先在线 `check-token` 才打开账号 DB，因此离线冷启动、离线登录和未校验 token 下的缓存访问均未实现；任何放宽必须先冻结 read-only DB、mutation/send 禁用、token 过期、reconnect 与 invalid-session cleanup contract。

## 1. Hard Requirements

| area | required outcome | forbidden shortcut |
| :--- | :--- | :--- |
| 样式 | 每个 H5 页面从对应 RN 页面、组件和 `src/theme/**` 迁移布局、颜色、字号、间距、圆角、状态与明暗主题 | 依据现有 H5 骨架自行设计；只对齐主题色；用第三方组件默认样式替代 RN 视觉 |
| SDK/API | 页面只调用 `@im28/im-sdk/web` 暴露的 runtime/sync/capability facade；平台实现复用 `@im28/im-sdk/core` | 页面直接 `fetch`、调用生成 OpenAPI、实例化 Gateway client、导入 `@im28/im-sdk/rn` 或 `/core` |
| assets | RN 业务资产按字节复用，保持 `im28-phone/src` 相对目录；H5 不重绘、不热链、不用近似图标替换 | 已有 RN 图标时继续使用 Lucide/文字占位；把 RN SVG React 组件实现直接搬入浏览器 |
| 页面切换 | 全屏页面和可恢复导航状态由 React Router SPA 管理 | 复制 RN `useState` 页面栈；直接操作 `history`；刷新深链后回到错误页面 |

“样式复用”指设计结果与 token 同源，不指直接运行 React Native `StyleSheet`。`View/Text/Pressable/SafeAreaView` 必须转换为语义化 HTML、CSS 和浏览器交互；仅允许安全区、hover/focus、键盘、滚动容器和响应式宽度等浏览器适配，且不得改变 RN 信息层级。

## 2. Canonical Sources

| concern | RN source | H5 owner | current state |
| :--- | :--- | :--- | :--- |
| light/dark token | `../im28-phone/src/theme/lightTheme.ts`; `darkTheme.ts`; `theme.ts` | `apps/web/src/styles/rn-theme.css` | `foundation-copied` |
| theme preference | `../im28-phone/src/theme/ThemeProvider.tsx` | `apps/web/src/runtime/theme-preference.ts` / root `data-theme` | `core-done-local/acceptance-gated` |
| hairline/font baseline | `../im28-phone/src/theme/applyHairlineWidth.ts`; `applyGlobalBoldText.ts` | CSS root tokens/reset | `foundation-copied` |
| auth flow | `../im28-phone/src/screens/auth/AuthFlowScreen.tsx`; `../im28-phone/src/screens/auth/types.ts` | `/login` redirect + `/auth/phone|email|account|register` | `core-done-local/acceptance-gated` |
| auth entry UI | `PhoneLoginScreen.tsx`; `EmailLoginScreen.tsx`; `AccountLoginScreen.tsx`; `AccountRegisterScreen.tsx`; shared auth styles/components | `apps/web/src/pages/login/**` | `core-done-local/acceptance-gated` |
| conversation list | `../im28-phone/src/screens/chat/conversationList/ConversationListScreen.tsx` | `apps/web/src/pages/conversations/**` | `core-done-local/acceptance-gated` |
| chat detail | `../im28-phone/src/screens/chat/chatDetail/ChatDetailScreen.tsx`; `../im28-phone/src/screens/chat/components/chatDetailStyles.ts` | `apps/web/src/pages/chat/**` | `core-done-local/acceptance-gated` |
| chat header/composer/list | `../im28-phone/src/screens/chat/components/ChatDetailHeader.tsx`; `ChatComposer.tsx`; `ChatMessageList.tsx` | `apps/web/src/pages/chat/**` | `core-done-local/acceptance-gated` |
| chat search | `../im28-phone/src/screens/chat/search/ChatSearchScreen.tsx`; `SearchComponents.tsx`; `chatSearchHelpers.ts`; `message-search-helpers.ts`; `indexedPages.tsx`; `utils.ts` | `/conversations/:conversationID/search`; shared `messages.searchCached` | `done-local/acceptance-gated` |
| contact list | `../im28-phone/src/screens/chat/contactList/ContactListScreen.tsx`; `contactIndexHelpers.ts`; `../im28-phone/src/screens/chat/home/HomeTabBar.tsx` | `apps/web/src/pages/contacts/**` | `core-done-local/acceptance-gated` |
| friend/group applications | `../im28-phone/src/screens/chat/friendApplications/FriendApplicationsScreen.tsx`; `group/GroupVerificationListScreen.tsx`; `group/GroupApplicationsScreen.tsx`; `group/GroupApplicationListView.tsx` | `apps/web/src/pages/contacts/**`; `../im28-sdk/src/sync/*-application-sync.ts` | `implemented-local/acceptance-gated` |
| joined groups | `../im28-phone/src/screens/chat/group/ContactGroupListScreen.tsx`; `contactGroupHelpers.ts` | `/contacts/groups`; `../im28-sdk/src/sync/joined-group-sync.ts` | `implemented-local/acceptance-gated` |
| peer contact profile | `../im28-phone/src/screens/chat/profile/UserProfileScreen.tsx`; `UserProfilePersonalInfo.tsx`; `addFriend/AddFriendScreen.tsx` | `/contacts/users/:userID`; `/contacts/users/:userID/add`; `../im28-sdk/src/sync/peer-profile-sync.ts` | `implemented-local/acceptance-gated` |
| shell/tab hierarchy | `../im28-phone/src/screens/chat/home/ChatHomeScreen.tsx`; `HomeTabBar.tsx` | `PrimaryTabsLayout` + global `components/primary-tabs/**` | `core-done-local/acceptance-gated` |
| static assets | RN asset roots listed below | `apps/web/src/assets/rn/**` | `466 files/hash-verified` |
| platform-neutral SDK | `../im28-sdk/src/core.ts` | internal dependency of `@im28/im-sdk/web` | `linked` |
| browser runtime | RN Gateway capability semantics + shared SDK Web entry | `../im28-sdk/src/platforms/web/runtime/**`; `sync/**` | auth/conversation/message/contact core local |

The RN source currently contains 466 business assets: 324 SVG, 138 PNG, 2 MP3, 1 JPG and 1 JSON. H5 mirrors these source roots:

| RN source root | H5 target root |
| :--- | :--- |
| `../im28-phone/src/assets/**` | `apps/web/src/assets/rn/assets/**` |
| `../im28-phone/src/screens/auth/assets/**` | `apps/web/src/assets/rn/screens/auth/assets/**` |
| `../im28-phone/src/components/navbar/nav-arrow-left.svg` | `apps/web/src/assets/rn/components/navbar/nav-arrow-left.svg` |

`npm run assets:sync` rebuilds the mirror; `npm run assets:check` compares all source/target bytes through SHA-256 and is part of `npm run verify`. `asset-manifest.json` is generated evidence, not a manually maintained inventory.

## 3. SDK and API Chain

```text
React Router page/feature
-> useWebIMRuntime or feature hook
-> @im28/im-sdk/web public facade
-> browser runtime/sync/capability owner
-> contacts: @im28/im-sdk/core Gateway client -> Gateway HTTP (remote-only in W6.a5.2.1)
-> joined groups: shared GroupRepository cache -> Gateway myGroupList full pagination -> success-only cache replace
-> peer profile: Gateway user/friend detail -> shared relationship mapping -> real conversation Repository write or friend-application mutation
-> conversations/messages: shared DTO + Repository -> Gateway HTTP/WebSocket + account SQLite
```

Rules:

1. 页面只从 `@im28/im-sdk/web` 导入公开类型和 facade，不得绕过它导入 `/core`、generated OpenAPI 或其他平台入口。
2. RN 页面中的 `src/services/auth/**`、`src/services/gateway/**`、`src/services/openim/**` 是能力发现锚点，不可整文件复制；先追到 `@im28/im-sdk/rn`/Gateway 操作，再在共享 Web entry 与浏览器 facade 上冻结等价调用。
3. Web 缺失能力必须按 `RN service function -> shared Web export/Gateway operation -> browser facade -> route caller -> verification` 记录后实施。
4. token、device identity、SQLite、WebSocket 和 API 错误仍由现有 runtime owner 管理；视觉迁移不得新增第二条调用链或 fake-success。

## 4. React Router SPA Contract

Current canonical routes:

| URL | RN behavior source | browser requirement | state |
| :--- | :--- | :--- | :--- |
| `/` | App boot/auth decision | redirect into the conversations auth guard; guest resolves to `/login` | `implemented` |
| `/login` | default phone branch in `AuthFlowScreen` | replace to `/auth/phone` | `implemented` |
| `/auth/phone` | `PhoneLoginScreen` | phone verification login; unregistered code `20002` enters real register operation | `core-done-local/acceptance-gated` |
| `/auth/email` | `EmailLoginScreen` | email verification login; unregistered code `20002` enters real register operation | `core-done-local/acceptance-gated` |
| `/auth/account` | `AccountLoginScreen` | account/password login and route-owned switch/register entries | `core-done-local/acceptance-gated` |
| `/auth/register` | `AccountRegisterScreen` | account/password registration; back returns account login | `core-done-local/acceptance-gated` |
| `/conversations` | `ChatHomeScreen` chats tab + `ConversationListScreen` | authenticated route; list state survives child navigation | `core-done-local/acceptance-gated` |
| `/conversations/:conversationID` | `ChatDetailScreen` | encoded ID, refresh restore, browser back returns list | `core-done-local/acceptance-gated` |
| `/contacts` | `ChatHomeScreen` contacts tab + `ContactListScreen` | authenticated route; real paged friend list, local search and index navigation | `core-done-local/acceptance-gated` |
| `/contacts/verifications/:tab` | `VerificationMessagesScreen` + embedded friend/group lists | authenticated RN `验证消息` shell、route-stable friend/group tabs and existing real application facades | `accepted-readonly/mutation-gated` |
| `/contacts/friend-applications`、`/contacts/group-applications` | legacy Web index paths | redirect-only compatibility to canonical verification tabs；no page/business owner | `compatibility-only` |
| `/contacts/group-applications/:groupID` | `GroupApplicationsScreen` + `GroupApplicationListView` | authenticated per-group filter/search/section/status and real accept/reject through same audit facade | `implemented-local/acceptance-gated` |
| `/contacts/groups` | `ContactGroupListScreen` + `contactGroupHelpers` | authenticated cache-first joined-group list/search/status/role and real conversation lookup/open | `implemented-local/acceptance-gated` |
| `/groups/create` | `ChatHomeScreen` + `GroupActionBubble` + `CreateGroupScreen` | authenticated five-column friend selection、2–998 rule、default group name and shared exactly-once create/cache convergence；success opens only the server-returned conversation ID | `done-local/mutation-acceptance-gated` |
| `/contacts/users/:userID` | `ContactListScreen` -> `UserProfileScreen` | authenticated real user/friend profile, RN 120px hero and success-only direct-conversation creation/persistence | `implemented-local/acceptance-gated` |
| `/contacts/users/:userID/add` | `UserProfileScreen` -> `AddFriendScreen` request state | authenticated RN 64px result row、80-character message and real success-only `applyFriend` | `implemented-local/acceptance-gated` |
| `/calls` | `ChatHomeScreen` calls tab + `CallListScreen` | authenticated route; real cache/sync/delete; no RTC placeholder | `core-done-local/acceptance-gated` |
| `/me` | `ChatHomeScreen` me tab + `ProfileScreen` home | authenticated current profile hero and real general-settings route | `core-done-local/acceptance-gated` |
| `/me/settings` | `ProfileScreen` general settings | full-screen route outside primary tab shell; real logout confirmation | `core-done-local/acceptance-gated` |
| `/me/settings/display` | RN display settings / `ThemeProvider` | local `system\|light\|dark` preference with the RN storage key and root theme projection | `core-done-local/acceptance-gated` |
| `/me/settings/notifications` | RN notification settings | authenticated real Gateway notification detail/update facade; no local fake state | `core-done-local/acceptance-gated` |
| `/me/settings/permissions` | RN permission settings | five authenticated Gateway-backed switches with failed-write rollback; blacklist excluded | `core-done-local/acceptance-gated` |
| `/me/settings/terms` | RN terms settings / `TermsViewer` | authenticated route using the existing real platform-term facade and sandboxed document owner | `core-done-local/acceptance-gated` |
| `/me/profile` | `ProfileScreen` personal profile | authenticated nickname/gender/ID/bio overview outside primary tab shell | `core-done-local/acceptance-gated` |
| `/me/profile/nickname\|gender\|bio` | RN field editors | route-owned real update-profile forms; unchanged save has no mutation | `core-done-local/acceptance-gated` |
| `/me/security` | `ProfileScreen` account-security | real phone/email/account read; contact changes remain non-interactive | `core-done-local/acceptance-gated` |
| `/me/security/account\|password` | RN credential forms | real set-account-password/reset-password; reset invalidates local session | `core-done-local/acceptance-gated` |
| `*` | no RN equivalent | explicit 404 and safe return | `implemented` |

Future full-screen RN states must receive stable routes before UI migration. `/auth/invite`、`/auth/complete-profile`、client version、account-security and display/notification/permission/terms settings are implemented-local；native per-app network proxy 与 RN temporary cache-directory cleanup 在 H5 登记 `web-not-applicable`，不得创建保存后无效的设置或删除 account IM database。`/me/profile/**`、`/me/security/**` 与 `/me/settings/**` are full-screen owners outside the tab shell. `/conversations`、`/contacts`、`/calls` 与 `/me` 已嵌套在唯一 `PrimaryTabsLayout`；chat detail、me child routes 与 auth routes 不显示底栏。Bottom sheets and short-lived previews remain modal state only when they are not independently addressable. Production deployment must return `index.html` for valid SPA deep links.

## 5. Slice Acceptance

A page/capability is `parity-accepted` only when all gates pass:

| gate | evidence |
| :--- | :--- |
| source trace | RN screen/component/style/asset/API anchors recorded in this contract or active workset |
| visual parity | light/dark screenshots at 390x844 and desktop responsive viewport; layout, typography, icons, empty/loading/error/disabled states reviewed |
| asset parity | all visible product assets resolve from `apps/web/src/assets/rn/**`; asset hash check passes |
| API parity | no mock/fake-success; Network and runtime evidence proves the intended `@im28/im-sdk/web` call chain |
| route parity | navigation uses React Router; direct URL refresh, browser back/forward, auth guard and 404 behavior pass |
| browser quality | keyboard/focus, safe area, scroll ownership, no overlap/horizontal overflow, accessible names pass |
| regression | `npm run verify` passes; final capability acceptance includes real Gateway smoke where data is required |

Auth-entry、conversation-list、chat-detail 与 contact-list core 均已移除 generic/Lucide 视觉并完成本地 RN 迁移证据。它们仍低于 `parity-accepted`：必须分别通过卡片中记录的真实账号 Network、跨路由和数据更新门禁；未具备 Web facade 的 RN 控件保持省略，验证码发送缺口只允许显示真实限制，不得制造发送成功态。

## 6. Ordered Migration

| slice | deliverable | dependency | status |
| :--- | :--- | :--- | :--- |
| `W6.a0` | freeze this contract and source inventory | RN repository readable | `done` |
| `W6.a1` | mirror all assets; establish complete RN light/dark CSS token base | `W6.a0` | `done-foundation` |
| `W6.a2` | account login visual/interaction/API parity | `W6.a1`; existing auth runtime | `done-local/acceptance-gated` |
| `W6.a3` | conversation shell/list visual/interaction/API parity | `W6.a2`; existing conversation sync | `done-local/acceptance-gated` |
| `W6.a4` | chat detail/header/list/composer visual/interaction/API parity | `W6.a3`; existing message sync | `done-local/acceptance-gated` |
| `W6.a5.1` | phone/email/account/register auth entry routes | existing auth/register/term operations | `done-local/acceptance-gated` |
| `W6.a5.2` | remaining auth routes and primary tab route shell | route/API contract per capability | `primary-routes-done-local; external-acceptance-gated` |
| `W6.closeout` | cross-route responsive/browser/real-Gateway parity review | prior slices | `active-external/authorization-gates` |

W5 browser-storage evidence and W3 real-Gateway credentials remain independent external gates. They do not block local W6 visual implementation, but they block production acceptance for affected data flows.

## 7. W6.a2 Migration Card

| field | value |
| :--- | :--- |
| feature slice | account login core form + agreement/terms |
| phase | vertical migration / Web SDK adapter + route caller |
| production flow | `AccountLoginScreen.tsx` -> `loginByAccountPassword`; `TermsViewer.tsx` -> `getPlatformTerm` |
| operations | `POST /v1/auth/user-login`; `POST /v1/platform/term/get` |
| current status | login `implemented/local-tested`; platform term `implemented/live-public-api-tested` |
| must-have fields | login: `type/account/password/device_id`; term: `key/title/content/version` |
| adapters | `WebIMRuntime.login`; W6.a2 platform-term runtime adapter; React Router `/auth/account` caller |
| route | `/auth/account`; `/login` now replaces to `/auth/phone` |
| source assets | auth `startup-logo.png`, `clear-icon.svg`, `eye-icon.svg`, `eye-closed-icon.svg`; navbar back SVG for terms modal |
| open gaps | forgot-password/network-settings require a real Gateway facade; real login success requires approved Gateway test credentials |
| local evidence | superseded by W6.a5.1 auth-entry matrix: 466 assets, 21 test files / 58 tests, route/browser/type/test/build green |
| acceptance gate | approved-account login success/redirect and explicit light-mode screenshot remain required |

W6.a2 account login is now one branch of W6.a5.1. Network settings remains omitted until a Web facade exists; forgot password exposes a visible capability-gap message and never reports success.

## 8. W6.a3 Migration Card

| field | value |
| :--- | :--- |
| feature slice | authenticated conversation shell/list core |
| phase | vertical migration / Web SDK composition + route caller |
| production flow | `ChatHomeScreen.tsx` -> `ConversationListScreen.tsx` -> cache-first conversation sync |
| operations | `listCachedItems({ archived:false })`; `sync()` -> `POST /v1/conversation/list`; realtime `dataVersion` -> cache reread |
| current status | `done-local/acceptance-gated` |
| must-have fields | conversation identity/name/avatar/draft/pinned/muted/unread/updatedAt + latest message contentType/body/sendTime |
| adapters | `WebIMConversationSync.listCachedItems`; existing `WebIMConversationSync.sync`; React Router `/conversations` caller |
| route | `/conversations` -> encoded `/conversations/:conversationID`; guest deep link -> `/login` |
| source assets | `empty-chat.svg`; `search.regular.svg`; `xmark-circle.solid.svg`; `pin.solid.svg`; `bell-off.solid.svg` |
| local evidence | 390x844 light/dark deterministic visual proof: no overflow, four row states/assets rendered; 760px frame -> 480px centered surface; guest deep-link guard passed; `npm run verify`: 466 assets, 20 test files / 55 tests, type/build green |
| no-fake verdict | no page fetch、no local mock/default placeholder、no parallel route/API owner；temporary visual harness removed after proof |
| open gaps | approved-account cache/sync/chat-back Network smoke；RN global search、group action、archive/long-press mutations、presence/group-member avatar require future Web facades；primary tab shell belongs to W6.a5 |
| acceptance gate | real account proves cache-first -> Gateway sync -> latest-message reread -> chat/back chain；missing operations receive bounded slices before their UI is restored |

W6.a3 uses the RN component's real local-search branch rather than rendering a nonfunctional global-search route. Missing action menus and tab destinations are omitted, not mocked; their RN UI may return only with matching Web facade and React Router owners.

## 9. W6.a4 Migration Card

| field | value |
| :--- | :--- |
| feature slice | authenticated chat detail core: header、message list/bubbles、text composer |
| phase | vertical migration / existing Web message sync + React Router caller |
| production flow | `ChatDetailScreen.tsx` -> `ChatDetailHeader` / `ChatMessageList` / `ChatComposer` -> cache-first history、pull、send、`dataVersion` cache reread |
| operations | `getCachedHistory(conversationID)`; `pullHistory(conversationID)` -> `POST /v1/message/pull`; `sendText(conversationID, text)` -> `POST /v1/message/send`; realtime 只以 runtime `dataVersion` 触发 cache reread，不新增页面 operation |
| current status | `done-local/acceptance-gated` |
| must-have fields | conversation ID/name/avatar/type/muted；message ID/sender/direction/contentType/status/sendTime/payload |
| adapters | existing `WebIMMessageSync`; runtime snapshot subscription; React Router `/conversations/:conversationID` caller |
| route | encoded conversation ID deep link；guest -> `/login`；header back -> `/conversations` |
| source assets | navbar `nav-arrow-left.svg`; `bell-off.solid.svg`; light/dark incoming/outgoing bubble tails; send、speak/play、document assets |
| local evidence | deterministic 390x844 light/dark: header/list/composer、6 bubbles、3 tails、draft/send state、no overflow；760x900: 480px centered surface；guest deep-link guard and clean console passed；`npm run verify`: 466 assets、20 test files / 55 tests、type/build green |
| no-fake verdict | page 无 fetch、Gateway/Repository 直连、local mock、fake sent 或第二 route/API owner；临时 visual harness 已删除；不具 facade 的操作控件未渲染 |
| open gaps | approved account history/pull/send/realtime/list-back Network proof；presence、group member profile/avatar/name、settings、voice/emoji/attachment、failed-message retry mutation、media playback/download 需要独立 Web facades |
| acceptance gate | 真实账号证明 cache history -> pull -> send -> realtime cache reread -> list-back 链；390x844 与 desktop 的 authenticated light/dark 截图复核；缺失能力按独立 bounded slice 恢复 |

W6.a4 对图片、音频、视频、文件和卡片 payload 只投影已有真实消息数据；没有 Web operation 的播放、下载、上传和 RTC 交互不渲染。文本输入保留 RN 的 1000 字符约束，并以 Enter 发送、Shift+Enter 换行完成浏览器键盘适配。

## 10. W6.a5.1 Migration Card

| field | value |
| :--- | :--- |
| feature slice | phone login、email login、account login、account registration and route-based login-method switching |
| phase | vertical migration / Web runtime auth facade + React Router callers |
| production flow | RN auth screens -> `WebIMRuntime.login/register/getPlatformTerm` -> shared Gateway client -> auth-bound account DB + realtime |
| operations | `POST /v1/auth/user-login`; `POST /v1/auth/register`; `POST /v1/platform/term/get` |
| current status | `done-local/acceptance-gated` |
| adapters | `WebIMRuntime.login`; `WebIMRuntime.register`; existing public term adapter |
| routes | `/login` -> `/auth/phone`; `/auth/phone`; `/auth/email`; `/auth/account`; `/auth/register` |
| source assets | RN startup logo、clear/eye icons、country-code chevron、phone/mail/account icons、navbar back icon; all from verified mirror |
| local evidence | `npm run verify`: 466 assets、21 files / 58 tests、SDK/Web typecheck and production build passed; 390x844 dark no overflow; 760x900 surface 480px centered; direct refresh、back/forward、mode switch、register validation and clean console passed |
| API evidence | runtime registration test proves endpoint/body/device/session; phone login test proves area code/verification/device body; page has no direct fetch/Gateway/Repository import |
| no-fake verdict | login/register/terms call real facades; verification button does not start countdown or claim success because Gateway exposes no send-code operation; it displays the documented current code `666666` constraint |
| open gaps | approved real account/phone/email Network smoke; Gateway verification-code-send and forgot-password operations absent; invite/profile/network/me routes and full tab-shell acceptance remain W6.a5.2 |
| acceptance gate | real login/register redirect + session/DB/realtime proof; verification-send contract or explicit product acceptance of fixed-code environment; 390x844 and desktop light-mode screenshot |

W6.a5.1 的 `20002` 未注册分支只对 phone/email 生效，并调用真实 `register`；account 登录不会自动注册。验证码发送能力不计入已完成 operation，缺口保持用户可见且不可伪造成功。

## 11. W6.a5.2.1 Migration Card

| field | value |
| :--- | :--- |
| feature slice | authenticated contact-list core |
| phase | vertical migration / one-operation Web SDK facade + React Router caller |
| production flow | `ContactListScreen.tsx` -> `WebIMContactSync.listCached/list` -> account SQLite + shared `GatewayHTTPClient.listFriends` |
| operation | `POST /v1/friend/list` with bounded `page/page_size` pagination |
| current status | `done-local/acceptance-gated` |
| must-have fields | `userID`; alias-first `displayName`; `nickname`; `remark`; `avatarURL`; `isStarred`; `addedAt` |
| adapters | `../im28-sdk/src/sync/contact-sync.ts`; runtime `getSync().contacts`; React Router `/contacts` caller |
| route | `/contacts`; guest deep link replaces to `/login` -> `/auth/phone` |
| source assets/style | RN search、clear、star SVG; 48px header、40px search、56px row、40px avatar、star/letter groups and right index |
| local evidence | original visual gates plus `.1.4`: shared pull contract 2/2、SDK Web 59/204、full verify；authenticated 390x600 D index reached `scrollY=196` with active state、no overflow/error and header search entered `/contacts/search` |
| API evidence | 2 behavior tests prove authenticated fail-fast, paging, dedupe, field normalization and sort; page has no fetch/shared SDK/Gateway/Repository import |
| no-fake verdict | cache and remote list both use the shared contact facade；loading/error/empty are explicit；long-press menu is omitted until all visible actions have bounded shared owners |
| open gaps | physical touch/offline block/drag index/cross-browser proof；long-press message、RTC、card and delete facade convergence plus authorized mutation acceptance |
| acceptance gate | shared cache-first pagination/failure regression is closed by `.17.2.2`，RN-equivalent Pinyin index by `.a5.2.1.1`；broader visual/history matrix remains before full parity |

W6.a5.2.1 恢复联系人列表核心；验证消息、我的群聊、profile 和搜索已由后续独立 route cards 接入。`.1.4` 只增加 cache-first、下拉和索引平台交互：RN 长按菜单固定为发消息、音视频通话、分享好友名片和删除好友，但共享联系人 action facade 尚未覆盖完整动作，所以页面继续不渲染不可工作的菜单。Gateway client 已有 `deleteFriend` 不等于应用获得直连授权；RN 现存应用 service 调用需要在 `.1.5` 收敛到 shared SDK 后，Web 才能复用同一业务路径。

`.a5.2.1.1` reviewer verdict: H5 只在联系人展示 owner 增加 RN 同版本 `pinyin-pro@3.28.1`，参数逐项保持 `pattern:first / mode:surname / surname:head / nonZh:consecutive`；数字、符号和空名称与 RN 一样回退 `#`，分组内及分组首次出现顺序继续服从 SDK 的好友添加时间结果。纯函数和列表测试覆盖中文、多音、拉丁、fallback、搜索态星标去重；真实 7 行只读页面把“最后那一秒/海绵宝宝不吃香蕉”投影为 `Z/H`，458px 无溢出且控制台无 warning/error。没有 mock shortcut、fake success、第二 API/cache owner、SDK 或 RN runtime 改动。Verdict: `done-local/acceptance-gated`；完整联系人视觉矩阵仍独立 gated，新增词典对主 chunk 的成本进入性能债。

`.a5.2.1.2` reviewer verdict: `/contacts` 由 React Router `React.lazy + Suspense` 延迟加载，联系人搜索只导入独立 `contact-filter`，因此不会通过搜索页静态导入拼音分组 owner。生产 main chunk 从 1,088.14 kB（366.35 kB gzip）降至 793.79 kB（222.24 kB gzip），联系人页面和 `pinyin-pro` 收敛为 294.92 kB（145.52 kB gzip）的 route chunk。H5 36 files/122 tests、SDK Web 52/163、typecheck、466 assets、boundary/build:web sync 和 production build 通过；真实账号从会话 Tab 进入通讯录后仍显示 7 行 `A/D/Z/H`，两个页面在 458px 均无横向溢出和 console error。没有 mock/fake success、第二数据 owner、SDK/RN runtime 或 `build:package:desktop:web` 改动。Verdict: `done-local/acceptance-gated`；应用全局 main chunk 的进一步拆分是独立性能债。

## 12. W6.a5.2.2 Migration Card

| field | value |
| :--- | :--- |
| feature slice | global authenticated primary tab shell |
| phase | route shell migration / zero new API operation |
| production flow | RN `ChatHomeScreen` scene owner -> `HomeTabBar` -> React Router `PrimaryTabsLayout` -> global `PrimaryTabBar` |
| operations | no new remote operation; message badge reads existing `WebIMConversationSync.listCachedItems` and page-reported real unread total |
| current status | `done-local/acceptance-gated` |
| routes | enabled: `/conversations`, `/contacts`, `/calls`, `/me`; excluded: auth、chat detail、`/me/settings`、404 |
| source assets/style | all 8 RN selected/unselected tab SVGs; order/labels; 91px bar、51px item、20px icon、10px label、16/36px unread badge、safe bottom、light/dark tokens |
| canonical owner | route composition: `apps/web/src/app/PrimaryTabsLayout.tsx`; presentation/asset/badge port: `apps/web/src/components/primary-tabs/**`; route truth: `App.tsx` |
| local evidence | real authenticated browser: 390x844 bar 390x91、four equal 51px items、real unread `27`、conversation/contact selected states; contact click + back/forward/reload passed; chat detail bar count `0`; 760x900 light/dark bar/surface both 480px centered; no overflow or console warning/error |
| regression | `npm run verify`: 466 assets、22 files / 60 tests、SDK/Web typecheck and production build passed |
| no-fake verdict | no placeholder route/page, page-local tabbar, Gateway/Repository/fetch direct call or test-mode branch; proof-theme hook removed after evidence |
| retained disabled lifecycle | resolved by W6.a5.2.4: `/me` now has a real route/profile facade; no disabled tab remains |
| open gaps | `/me` route/selected state、calls authenticated visual evidence、friend/group application badge operations、real safe-area device screenshot and final cross-browser acceptance |
| acceptance gate | `/me` real route replaces the final disabled control, missing badge owner is implemented or explicitly accepted, then full four-route light/dark/mobile/desktop/history matrix passes |

后续主页面 **必须** 加入 `PrimaryTabsLayout`，不得复制 `HomeTabBar`。全屏子页面保持布局外路由，避免底栏覆盖 chat/call/profile detail。

## 13. W6.a5.2.3 Migration Card

| field | value |
| :--- | :--- |
| feature slice | authenticated call-record list core，不含 call detail 与 Web RTC |
| phase | vertical migration / three-operation Web SDK facade + React Router caller |
| production flow | RN `CallListScreen` -> `openIMService` -> Gateway v2 list/delete -> app-owned `call_records` SQLite cache |
| operations | `WebIMCallSync.listCached`; `sync` -> `POST /v2/call/list`; `delete` -> `POST /v2/call/delete` |
| current status | `done-local/acceptance-gated` |
| must-have fields | call ID、conversation/peer、direction、nickname/avatar、call type/status/answer status、start/answer/end times |
| adapters | `../im28-sdk/src/sync/call-sync.ts`; Web app-owned `call-record-store.ts`; runtime `getSync().calls`; React Router `/calls` |
| route/shell | `/calls` is a nested `PrimaryTabsLayout` route and activates the global RN call tab; guest deep link replaces to `/login` |
| source assets/style | RN search/clear、call direction、checkbox、audio/video/cancel status SVGs；156px segment、64px row、40px avatar、edit/delete sheet |
| local evidence | `npm run verify`: 466 assets、23 files / 63 tests、SDK/Web typecheck and production build passed；guest `/calls` guard passed；3 sql.js/IndexedDB tests cover cache filter/order、server-first delete and failure preservation |
| no-fake verdict | page has no direct fetch/Gateway/Repository、mock list、fallback success、RTC placeholder button or duplicate tabbar；all mutations pass through `WebIMSync.calls` shared queue |
| open gaps | approved-account Network/data and 390x844/760x900 light/dark proof；call detail、profile hydration、realtime call-history event、Web RTC separate slices |
| acceptance gate | real account proves cache-first -> full Gateway sync -> filter/search/page -> server-first delete；responsive/theme/history matrix passes before production parity |

`call_records` remains an app-owned cache outside the shared SDK schema, matching RN ownership. Shared `GatewayHTTPClient` remains the only endpoint/DTO owner.

## 14. W6.a5.2.4 Migration Card

| field | value |
| :--- | :--- |
| feature slice | authenticated me core: current profile hero + general-settings logout；不含资料编辑、账号安全与二维码 |
| phase | API discovery / bounded two-operation vertical migration |
| production flow | RN `ProfileScreen` home -> `fetchSelfUserInfo` / `onLogout` -> Gateway current-detail / auth logout |
| operations | `WebIMSync.profile.getCurrent` -> `POST /v1/user/current/detail`; existing `WebIMRuntime.signOut` -> `POST /v1/auth/logout` + local realtime/session/account-DB close |
| current status | `done-local/acceptance-gated` |
| must-have fields | user ID、nickname、avatar URL；logout must clear local runtime even when remote logout fails |
| adapters | shared `GatewayHTTPClient.getCurrentUserDetail`; Web sync/runtime facades; React Router `/me` and `/me/settings` callers |
| route/shell | `/me` remains inside `PrimaryTabsLayout`; `/me/settings` is a full-screen route outside the bottom tab shell; guest deep links replace to `/login` |
| source assets/style | RN `assets/my/bg.jpg`、`set.svg`、`nav-arrow-right.regular.svg`、profile light/dark tokens；222px hero、96px avatar、overlapping rounded content panel、56px menu/logout rows |
| excluded visible actions | personal-profile avatar edit、QR and account-security need separate bounded subflows; none receive placeholder controls |
| no-fake rule | page imports only `@im28/im-sdk/web` through the runtime context; no direct fetch/Gateway client, hardcoded user profile, fake logout, placeholder destination or page-local tabbar |
| open gaps | authenticated real profile/logout Network proof；profile edit/account security are implemented-local but acceptance-gated；QR/display/notification/network/cache/version require separate bounded cards |
| acceptance gate | focused endpoint/runtime test + workspace verify + mobile/desktop light/dark route/back/refresh proof; real account must prove current-detail and logout redirect/session cleanup before production parity |

Local evidence: authenticated current-detail rendered the real `donk / 86272753597` profile; 390x844 and 760x900 light layouts have no horizontal overflow, one selected `me` tab and a 480px desktop surface; `/me/settings` has zero tab bars and passed confirm/cancel/reload/back/forward. At W6.a5.2.4 closeout, `npm run verify` passed 466 assets, 24 files / 65 tests. A later W6.a5.2.5 cold restart proved no new Provider-context logs; dark screenshots and executing real logout remain acceptance gates.

## 15. W6.a5.2.5 Migration Card

| field | value |
| :--- | :--- |
| feature slice | personal profile read/edit for nickname、gender、bio；avatar upload 由 onboarding 独立切片消费同一 facade，个人资料头像编辑、QR 与 account security 不在本卡 |
| phase | done-local/acceptance-gated；one Gateway operation + three route-owned field actions |
| production flow | RN `ProfileScreen` profile/nickname branches + `ProfileGenderPickerScreen` + `ProfileBioEditorScreen` -> `updateSelfInfo` -> Gateway update-profile |
| operations | `WebIMSync.profile.getCurrent`; `WebIMSync.profile.update({ nickname | gender | bio })` -> `POST /v1/users/update-profile` |
| must-have fields | nickname trim/non-empty/max 32；gender `0|1|2`；bio trim/max 100 Unicode characters；user ID read-only |
| adapters | shared `GatewayHTTPClient.updateUserProfile`; existing `WebIMSync.profile`; React Router `/me/profile` and `/me/profile/nickname|gender|bio` |
| route/shell | all profile/detail edit routes are full-screen outside `PrimaryTabsLayout`; cancel/back/save use React Router and survive refresh |
| source style | RN 94px top bar、72px side actions、16px page padding、12px cards、56px rows、nickname 56px input、bio 160px textarea/count、gender selected mark、profile light/dark tokens |
| excluded actions | personal-profile avatar edit and QR remain separate routes；本卡不复制 onboarding 的文件/裁剪 UI |
| no-fake rule | save success only after `updateUserProfile` resolves; errors stay visible; unchanged values navigate back without a network success claim |
| local evidence | authenticated real current-detail rendered nickname/gender/ID/bio; 390x844 and 760x900 light layouts、all three editor routes、unchanged save、direct refresh、back/forward and guest redirect passed; cold restart added no console warning/error; `npm run verify` passed 466 assets、24 files / 67 tests、typecheck and production build |
| no-fake verdict | one canonical `MeProfileEditorPage -> WebIMSync.profile.update -> GatewayHTTPClient.updateUserProfile` path; no direct fetch/Gateway、mock branch、placeholder action、compat wrapper or file over 300 lines |
| open gaps | authenticated changed-value update Network/result proof、slow-saving pending visual、Safari/Firefox 与实体设备；personal-profile avatar edit/QR/account-security remain separate bounded slices |
| acceptance gate | focused auth/input/result/failure tests + workspace verify + mobile/desktop light/dark direct-route/save/cancel/back/refresh proof + real account update evidence |

W6.a5.2.5 未修改真实账号资料：`.114` 已证明 412px 本人资料与 nickname/gender/bio 三 route 的 authenticated dark token、字段限制、取消返回和零溢出；`.122` 进一步证明 760×900 dark page/card token、四 route 零溢出与 clean console，并在结束前恢复 light。两片均未输入或点击完成；真实 nickname/gender/bio mutation、slow-saving pending、Safari/Firefox 与实体设备通过前，状态保持 `done-local/acceptance-gated`。

## 16. W6.a5.2.6 Migration Card

| field | value |
| :--- | :--- |
| feature slice | account-security decomposition；first implementation slice only covers account/password credentials |
| phase | done-local/acceptance-gated |
| production flow | RN `ProfileScreen` account-security -> current profile contact/account fields -> set-account or reset-password form -> shared Gateway operations |
| first operations | `GatewayHTTPClient.setAccountPassword` -> `POST /v1/user/account-password/set`; `GatewayHTTPClient.resetPassword` -> `POST /v1/auth/password/reset` |
| first routes | `/me/security`; `/me/security/account`; `/me/security/password`；all full-screen outside `PrimaryTabsLayout` |
| must-have rules | account uses shared 8-24 printable non-space validation；password uses shared 8-24 and at least two character classes；confirm must match；old password required for reset |
| session side effect | reset success revokes current session on Gateway; Web completion MUST close realtime/account DB, clear auth and replace to `/auth/account`; returning to security as RN currently does is rejected behavior drift |
| deferred operations | contact bind/update phone/email are a separate slice; shared Gateway operations exist, but verification-code send is absent and RN `send*VerifyCode` currently resolves without a request |
| anti-fake verdict | do not copy RN verify-current step because it validates only six local digits before navigating; do not render sent/countdown/verified success without a real operation |
| local evidence | runtime exposes set/reset facades; 3 focused tests prove anonymous fail-fast、set retains session and reset clears session/socket/account DB；authenticated 390x844 + 760x900 light root/form、validation、direct refresh、back/forward and account-state correction passed；`.115` real unbound account adds 412x786 dark root/first-set form/disabled submit/reset-route correction proof；`.123` closes the same production branch at 760x900 dark with page/card/form/input token、zero-overflow and clean-console evidence；guest account/password deep links route to phone/account login |
| regression | `npm run verify`: 466 assets、25 files / 70 tests、SDK/Web typecheck and production build passed |
| no-fake verdict | one `page -> WebIMRuntime -> GatewayHTTPClient` mutation owner；phone/email rows are read-only；no page fetch/Gateway、sent/countdown claim、mock branch、compat wrapper or overlimit production file |
| open gaps | approved real set/reset Network/result/session proof and natural bound-account reset-form evidence；Safari/Firefox、实体设备与 contact bind/update remain deferred |
| acceptance gate | facade auth/input/result/failure/session-cleanup tests + workspace verify + mobile/desktop light/dark route/form/history proof + approved real account set/reset evidence |

W6.a5.2.6 将联系方式与账号凭据拆开，避免一个 slice 超过 3 个 operation。account/password 已本地完成；phone/email change 保留为 blocked contract，直到验证码发送或产品明确接受固定码环境。浏览器验收没有提交 set/reset，避免未经授权修改账号或撤销 session。

`.123` 在真实未绑定账号下补齐 760×900 dark 只读证据：总览、首设三字段、disabled submit 与错误 reset 深链纠正均复用 production path，未输入或提交凭据并在结束前恢复 light。该证据只关闭桌面深色视觉/路由门禁；自然已绑定账号 reset 表单和真实 set/reset Network/result/session cleanup 仍需独立样本与授权。

## 17. W6.a5.2.7 Migration Card

| field | value |
| :--- | :--- |
| feature slice | general-settings decomposition；first child covers display preference、notification settings and platform terms |
| phase | display/notification/terms、permission and version children `done-local/acceptance-gated`；cache/network blocked |
| production flow | RN `ProfileScreen` settings -> `ThemeProvider` / `userSettingsService` / `TermsViewer` -> browser preference owner or shared Gateway operations |
| first operations | local `@im28/theme/preference` system/light/dark preference；`getNotificationSetting`；`updateNotificationSetting`；existing `getPlatformTerm` is reused, not duplicated |
| first routes | `/me/settings/display`; `/me/settings/notifications`; `/me/settings/terms`；all full-screen outside `PrimaryTabsLayout` |
| adapters | `theme-preference.ts`; `WebIMRuntime.getSettings()` -> `WebIMUserSettings` -> shared `GatewayHTTPClient`; shared platform-term document builder |
| local evidence | notification anonymous/read/update contract tests；authenticated 390x844 display persistence and dark projection、real notification read、real user/privacy terms；760x900 centered settings surface；refresh/back/forward/guest guard/no-overflow passed |
| regression | `npm run verify`: 466 assets、26 files / 73 tests、SDK/Web typecheck and production build passed；only the existing Vite `>500 kB` warning remains |
| no-fake verdict | no page fetch/shared-SDK import、mock success、duplicate terms builder、page-local theme owner、compat route or overlimit production file |
| acceptance gate | no real notification write was submitted because it mutates user settings；approved write proof and Safari/Firefox theme/route evidence remain before parity acceptance |

Decomposition matrix:

| branch | state | next contract |
| :--- | :--- | :--- |
| display | `done-local/acceptance-gated` | cross-browser persistence/theme proof |
| notification | `done-local/acceptance-gated` | approved real update Network/result proof；read is real-browser proven |
| terms | `done-local/acceptance-gated` | cross-browser sandbox/render proof |
| permission | `done-local/acceptance-gated` | real read proven；approved update Network/result and cross-browser proof pending；blacklist remains separate |
| network | `blocked-browser-semantics` | RN native proxy/AsyncStorage behavior needs a Web deployment/proxy contract |
| cache | `blocked-storage-semantics` | whole account snapshot cannot be cleared；await disposable registry + lifecycle-safe inspect/clear |
| version | `done-local/acceptance-gated` | required deployment identity、public facade、validated update target and RN row/modal implemented；real update response pending |

`W6.a5.2.7.2` adds `getPermission/updatePermission` to the existing user-settings facade and restores the five RN switches at `/me/settings/permissions`. Contract tests prove anonymous fail-fast plus exact detail/switch endpoint and body；authenticated 390x844/760x900 browser proof confirms real read、no overflow、history/reload and guest guard. No real update was submitted because it mutates user settings；blacklist remains a separate capability.

The completed contract-freeze slice `W6.a5.2.7.4-cache-version-contract-freeze` defines the account-scoped rebuildable cache measurement/clear boundary and Web deployment update/reload semantics before either UI is added. Network settings remain `blocked-browser-semantics`.

### W6.a5.2.7.4 Contract Verdict

| branch | verdict | evidence / next |
| :--- | :--- | :--- |
| cache | `blocked-storage-semantics` | RN clears only filesystem cache；H5 account SQLite mixes remote cache with drafts、sending/failed messages and pending tasks. Whole-snapshot deletion and origin-wide estimates are rejected. Await disposable registry + lifecycle-safe inspect/clear. |
| version | `done-local/acceptance-gated` | `W6.a5.2.7.5` adds required deployment version/build config、`platform=web` facade、validated HTTP(S) update target and RN row/modal without claiming navigation/reload success. |

Canonical contract: `docs/runtime-contracts/web-settings-cache-version.md`. Contract freeze added no UI or destructive action. `W6.a5.2.7.5` now closes locally with required `VITE_APP_VERSION`、optional numeric build、one public runtime facade、RN version row and optional/forced update modal. Eleven focused tests prove endpoint/platform/identity/disabled/URL policy；full verify passes 466 assets and 27 files/81 tests. Authenticated browser proof at 390x844 and 760x900 returned `已是最新版本`, passed reload/guest/no-overflow/no-console checks. A real `need_update=true` response、optional/forced modal and live update target remain acceptance gates；no automatic navigation、reload-success claim or cache/network UI exists.

## 18. W6.a5.2.8 Onboarding Contract

> AXIOM: `register success != onboarding complete`。注册先建立真实 auth/session/account-DB/realtime，随后由 React Router 进入认证态 onboarding；只有真实资料 mutation 成功或用户明确跳过允许跳过的步骤后才能进入 `/conversations`。

### Source / Operation Trace

| branch | RN truth | shared/Web operation | frozen verdict |
| :--- | :--- | :--- | :--- |
| phone/email new user | `AuthFlowScreen.registerPendingRegistration` | `WebIMRuntime.register` -> `GatewayHTTPClient.register` -> `POST /v1/auth/register` | `runtime-chain-ready`；caller 必须区分 login success 与 register success |
| invite code | `InviteCodeScreen` -> retry `registerPendingRegistration(pending, code)` | 同一个 register operation 的 optional `invite_code` | `runtime-chain-ready`；无独立 validate operation，不得新增邀请码 API 或本地校验成功态 |
| account registration | `AccountRegisterScreen.onRegistered` | existing `WebIMRuntime.register({type:'account'})` | `runtime-chain-ready`；成功后进入 profile route，不再直接进 conversations |
| current profile | `CompleteProfileScreen` initial contact/user -> `updateSelfInfo` | `WebIMSync.profile.getCurrent/update` -> current-detail/update-profile | nickname/gender/bio `runtime-chain-ready` |
| avatar | crop -> `uploadAvatar` -> update profile `faceURL` | `WebIMSync.profile.uploadAvatar/update` + production Web OSS port；H5 shared 512x512 JPEG crop | `shared-core-ready/web-consumed/rn-frozen`；真实新账号上传/update 仍 acceptance-gated |
| phone/email bind | `BindContactScreen` -> send code -> bind/update | bind/update operations exist；send-code operation absent | `blocked-verification-code`；注册已有 contact 只读展示，缺失 contact 不提供假绑定入口 |

### Route / State Matrix

| event/state | route | required owner/behavior |
| :--- | :--- | :--- |
| existing-account login succeeds | `/conversations` replace | existing login caller；不进入 onboarding |
| phone/email register initially requires invite | `/auth/invite` | app-owned in-memory pending-registration owner holds account/type/area/verification code；URL/session/local storage **不得**保存验证码 |
| invite retry succeeds | `/auth/complete-profile` replace | register 建立的 current auth session remains canonical；clear pending secret immediately |
| phone/email/account register succeeds without invite | `/auth/complete-profile` replace | caller records only account-scoped onboarding-required marker；不得用 route params 拼 profile |
| `/auth/invite` refresh or missing pending secret | originating `/auth/phone|email` replace | visible expired/error notice；不得重放注册或声称邀请码已提交 |
| `/auth/complete-profile` refresh | remain route after runtime restore | `getCurrent()` reconstructs user/contact/profile；onboarding marker only controls intent, not profile truth |
| gender/bio full-screen edit | `/auth/complete-profile/gender|bio` | Provider-owned memory draft；完成后 replace 回主表单；只有主表单最终提交调用 update-profile |
| anonymous direct onboarding deep link | `/auth/phone` replace | no placeholder/fake authenticated form |
| profile update succeeds | `/conversations` replace | clear onboarding marker after `update` resolves；error remains on page |
| user explicitly skips optional profile completion | `/conversations` replace | clear marker；skip is navigation choice, not fake update success |
| cold restore on another authenticated route | requested route | RN currently does not force incomplete profiles after restart；Web must not globally hijack established sessions |

### State Ownership

| state | owner | persistence |
| :--- | :--- | :--- |
| access/refresh token、user ID | existing `WebIMRuntime` auth session | existing `sessionStorage` contract |
| pending register verification code | auth onboarding context/store | memory only；route exit/refresh clears |
| onboarding required + source mode | dedicated account-scoped onboarding marker | `sessionStorage` without contact、password、verification code or token |
| profile/contact truth | Gateway current-detail | no route-state duplication |
| form drafts | route page local state | memory only |

### Decomposition / Gates

| child slice | scope | operations | state/gate |
| :--- | :--- | :--- | :--- |
| `W6.a5.2.8.1-onboarding-route-state` | onboarding marker、pending-secret owner、`/auth/invite` and `/auth/complete-profile` guards、register redirects | existing login/register only | done-local/acceptance-gated；secret-free marker、memory-only pending、login/register split and fail-closed guards have focused tests |
| `W6.a5.2.8.2-invite-page` | RN invite modal/page visual and real register retry | register with/without `invite_code` | done-local/acceptance-gated；real error stays visible；approved invite-required Network/visual evidence pending |
| `W6.a5.2.8.3-complete-profile-core` | current profile read、RN geometry/grouping/missing-contact dialog、memory draft、gender/bio React Router edit、submit transition | current-detail + update-profile | implemented-local/acceptance-gated；10 focused app tests + full verify + anonymous deep-link guards pass；valid-context mutation/visual evidence pending |
| avatar extension | album/camera、shared crop、upload、memory draft、final update | `WebIMSync.profile.uploadAvatar/update` | implemented-local/acceptance-gated；valid new-account Network/result/visual proof pending |
| contact extension | verification lifecycle | send-code facade absent | blocked-verification-code |

Anti-fake verdict: H5 `register -> /conversations` drift is corrected locally: existing login still enters conversations, while successful register records only an account-scoped marker and enters complete-profile; invite-required keeps the original request in memory and retries the same register operation. Gender/bio subroutes and uploaded avatar URL only update a Provider memory draft；the main form remains the sole update-profile caller。头像必须经真实 OSS port 返回远端 URL，上传失败或切号不得形成草稿成功；contact 仍只读且无 no-op action。The implementation does not persist verification secrets, infer invite validity from four local characters, copy RN's no-op send-code success, or treat blocked controls as completed onboarding. Valid new-account Network/result and responsive light/dark evidence remain required before parity acceptance.

## 19. W6.a5.2.9 Blacklist Contract

> AXIOM: 黑名单远端真相只来自 Gateway；解除操作必须等待服务端成功后再移除本地页面项，失败不得伪装为空列表或解除成功。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| entry/route | `PermissionSettingsScreen.onOpenBlacklist` -> `ProfileScreen` blacklist branch | `/me/settings/permissions` -> `/me/settings/blacklist` React Router route |
| list | `fetchBlacklist(100)` + `fetchFriendList().catch([])` enrichment | `WebIMSync.blacklist.list` -> shared `GatewayHTTPClient.listBlacklist` + existing contact facade；paged/authenticated，friend enrichment failure follows RN stranger fallback |
| remove | confirmation sheet -> `removeFromBlacklist(userID)` -> reload | `WebIMSync.blacklist.remove` -> shared `GatewayHTTPClient.removeFromBlacklist`；success-only page removal |
| row | 72px row、40px avatar、name、friend/stranger label、解除 action | normalized `userID/displayName/avatarURL/isFriend`；`isFriend` derives from existing real friend list, no guessed friendship |
| omitted | add blacklist originates in user-profile flow | no add button/operation in this slice；no user-profile placeholder route |

Local closeout: `WebIMSync.blacklist` now owns authenticated pagination、dedupe、normalization、contact enrichment and exact remove requests. `/me/settings/permissions` uses RN-separated switch cards plus a React Router blacklist entry；`/me/settings/blacklist` restores RN search、72px rows、40px avatars、relation labels、empty/error/removing states and confirm sheet. Four facade tests、four filter tests and full workspace verification pass. The anonymous deep link redirects to `/auth/phone`；authenticated data/theme/history and an explicitly approved real remove remain acceptance gates.
| acceptance | search、empty、error、refresh、removing、confirm、guest/history/theme/responsive | local gate + approved real remove mutation；without mutation authorization remains acceptance-gated |

## 20. W6.a5.2.10 Friend Applications Core Contract

> AXIOM: 好友申请真相只来自 Gateway；列表以内嵌方式复用在 RN 同款“验证消息”容器中，接受成功前不得修改申请状态，未读/用户资料链不得以 placeholder 补齐。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| entry/route | `ContactListScreen` single verification shortcut -> `VerificationMessagesScreen` friend tab -> embedded `FriendApplicationsScreen` | `/contacts` shortcut -> `/contacts/verifications/friend`；old `/contacts/friend-applications` redirects to the canonical full-screen route outside primary tab shell |
| list | `fetchFriendApplicationsAsRecipient(..., 100)` -> pending-first/time-desc | `WebIMSync.friendApplications.list` -> shared `GatewayHTTPClient.listFriendApplications`；authenticated pagination/dedupe/normalization |
| accept | row `加好友` -> confirm -> `acceptFriendApplication` -> reload | `WebIMSync.friendApplications.accept(applicationID)` -> shared accept operation；success then reload，failure keeps original state |
| row/view | embedded mode removes the standalone search；最近三天/三天前、72px row、48px avatar、source/message/status、confirm dialog | normalized direction/user/message/source/status/time/read model + pure view projection；统一容器只持有 tab route |
| deferred | row press marks read then opens user profile；friend/group unread badges；reject exists in injected hook but has no page caller | no click/no-op、unread/read、badge or reject facade；each requires a later bounded route/caller slice |
| acceptance | empty/error/refresh/handling/confirm、guest/history/theme/responsive | local gates + approved real accept mutation；without mutation authorization remains acceptance-gated |
| latest natural data | RN source remains frozen | `.116` current Gateway read: 3 accepted friend rows、0 pending action；group verification sibling Tab empty；pending/confirm remains natural-data-gated |

## 21. W6.a5.2.11 Group Applications Core Contract

> AXIOM: 群审核真相只来自 Gateway audit；索引与单群详情共享一个 facade，accept/reject 成功前不得修改可见状态，不能为详情复制第二条 list-by-group transport。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| entry/routes | `ContactListScreen` single verification shortcut -> `VerificationMessagesScreen` group tab -> embedded `GroupVerificationListScreen` -> selected `GroupApplicationsScreen` | `/contacts/verifications/group` -> `/contacts/group-applications/:groupID`；old group index URL redirects to the canonical tab；full-screen outside primary tab shell |
| audit/index | `fetchGroupApplicationAuditList` -> pending group count、owner/admin role、group search | `WebIMSync.groupApplications.list` -> shared `GatewayHTTPClient.listGroupApplicationAudit`；authenticated pagination/dedupe/group+requester normalization |
| detail | selected group filters audit applications -> pending-first/time-desc -> recent/older sections | direct URL repeats the same audit read and filters by route `groupID`；no page fetch or per-group transport |
| handle | pending row -> action sheet -> accept/refuse -> reload | `accept/reject(applicationID)` -> shared Gateway operations；success then reload，failure keeps original state |
| deferred | application unread/read and tab badges、group profile/manage、ordinary member join | omitted and acceptance-gated；no placeholder、mock badge or fake success |
| local evidence | RN source/API trace、4 SDK facade tests、5 pure view tests、466 asset check、30 SDK files/93 tests、H5 typecheck/build、index/detail guest guards | `implemented-local/acceptance-gated`；authenticated group data/theme/history and explicitly approved real mutations remain open |

## 22. W6.a5.2.12 Joined Groups Core Contract

> AXIOM: 已加入群组的本地列表只由 account SQLite `GroupRepository` 持有；Gateway 是远端真相，只有完整分页成功后才能替换 cache，页面不得建立第二个存储或 transport owner。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| entry/route | `ContactListScreen` -> `ContactGroupListScreen` | `/contacts` shortcut -> `/contacts/groups` React Router route；full-screen outside primary tab shell |
| cache/sync | `GroupRepository.listAll` cache-first + `fetchMyGroupList` refresh | `WebIMSync.groups.listCached/sync` -> shared `GroupRepository` + `GatewayHTTPClient.myGroupList`；authenticated account context、全分页、去重、success-only replace |
| row/view | 72px row、40px avatar、名称/群号/成员数/简介、状态和 owner/admin badges、search | normalized group ID/name/avatar/introduction/member count/status/role/server order + pure view projection |
| conversation open | RN group row resolves or creates the corresponding group conversation | H5 reuses existing conversation cache/sync and navigates only after an actual group conversation match；no fabricated conversation or fake-success route |
| deferred | create group、long-press dissolve/quit、group profile/manage、member mutations | omitted and acceptance-gated；no disabled placeholder or duplicate API/cache path |
| local evidence | RN source/API trace、4 real sql.js/IndexedDB facade tests、5 pure view tests、466 asset check、31 SDK files/97 tests、H5 typecheck/build、anonymous deep-link guard | `.133` 已用真实 joined group 关闭 canonical conversation open/list-back；cache-miss fallback、offline cold start、large-group、physical touch 与跨浏览器/设备保持 gated |

## 23. W6.a5.2.13 Contact Profile Core Contract

> AXIOM: 联系人资料关系判断、单聊持久化和好友申请语义只存在于共享 `peerProfile` facade；React Router 页面只负责 RN 视觉、表单状态和成功后的导航。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| entry/routes | `ContactListScreen` contact press -> `UserProfileScreen`; stranger add state -> `AddFriendScreen` | `ContactRow` -> `/contacts/users/:userID` -> optional `/add` React Router routes；both full-screen outside primary tab shell |
| profile read | `fetchFriendProfileSnapshot` combines public user、friend and relationship | `WebIMSync.peerProfile.get` -> authenticated `getUserDetail` and friend-only `getFriend`; normalizes self/friend/stranger、remark/name/avatar/gender/bio/star/added time |
| RN presentation | 120px avatar、centered 18/27 name、24px gender badge、24px ID pill with copy asset、48px primary CTA and 56px flex rows | semantic HTML/CSS uses RN theme tokens、byte-mirrored copy/back SVG and shared RN avatar gradient；no generic UI kit |
| direct conversation | `fetchSingleConversation` -> chat owner | `peerProfile.openConversation` -> real `openDirectConversation` -> shared mapper -> latest-message/conversation repositories -> encoded chat route；self is rejected |
| friend application | 64px result row、80-character greeting、本人昵称缺省验证语、real add operation、mutation 成功后返回资料页 | `/add` -> `profile.getCurrent` + shared `buildIMSelfFriendApplicationMessage` -> `peerProfile.applyFriend`；异步昵称只替换未编辑缺省值，成功后 `replace` 回资料页并保留来源 context，失败留页可见 |
| deferred | RTC、presence、pending accept、remark/star mutations、delete、blacklist、common groups、share、group-member permissions | omitted and acceptance-gated；no placeholder controls、page fetch、mock profile、fake conversation or fake apply success |
| local evidence | four sql.js/IndexedDB facade behavior tests、four pure contract/view tests、466 asset check、SDK 32 files/101 tests、all-runtime typecheck、build:web sync、release status/pack dry-run、H5 full verify/build and HTTP deep-link 200 | `implemented-local/acceptance-gated`；approved authenticated friend/stranger/self data、conversation/apply Network result and responsive light/dark/history remain open；in-app visual automation blocked by local-URL policy |

## 24. W6.a5.2.14 Contact User Search Core Contract

> AXIOM: 联系人用户搜索只通过共享 `contacts` facade 访问 Gateway；本地好友匹配与远端用户结果都只能进入既有 `peerProfile` 资料页，页面不得复制资料读取、关系判断或好友申请逻辑。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| entry/route | `ContactListScreen` search surface -> `ContactSearchScreen` | `/contacts` search link -> `/contacts/search` full-screen React Router route outside primary tab shell |
| local mode | authenticated friend list；trimmed keyword matches remark/nickname/ID/phone/email；empty keyword shows capability hint | existing `WebIMSync.contacts.list` + pure page projection；no second cache or transport owner |
| remote mode | explicit `去服务器搜索` -> `searchUsersByKeyword`；self is excluded | `WebIMSync.contacts.searchUsers(keyword)` -> shared `GatewayHTTPClient.searchUsers`；authenticated trim、invalid-record filtering、self-filter and stable dedupe |
| RN presentation | safe-top + 16、48px search header/cancel、48px server-search row、72px result row、40px avatar、matched field highlight、loading/error/empty | semantic HTML/CSS uses RN theme tokens and byte-mirrored search/clear assets；no generic UI kit |
| result action | local friend and remote user both open user profile | encoded `/contacts/users/:userID` route reuses `.13` `peerProfile` owner；no search-page profile fetch or mutation |
| deferred | server group tab/search、joined-group open、group join application、search-page friend application | omitted and separately bounded；no disabled placeholder、mock group/user result or fake success |
| acceptance | local/remote/error/retry/guest/back-forward-reload/theme/responsive | focused SDK/view gates + full verify + approved real account search Network/result and browser visual/history proof |

Local closeout: `WebIMSync.contacts` now owns authenticated `searchUsers` trim、invalid-record filtering、self-filter、stable dedupe and public-field normalization. `/contacts` uses a React Router search entry；`/contacts/search` restores the RN 48px header、capability hint、explicit server-search transition、72px/40px result geometry、safe text highlight and profile navigation. Four facade tests、four pure view tests、32 SDK files/103 tests、466 asset verification、H5 typecheck/build/full verify and HTTP deep-link 200 passed. No page transport、mock result、fake success、parallel profile/apply owner or search cache was introduced. Approved authenticated local/remote data、Network result and responsive light/dark/history proof remain acceptance gates；group search/join stays deferred.

## 25. W6.a6.1 Chat Media Read Core Contract

> AXIOM: 媒体真相只来自 shared message cache 中的 Gateway payload；H5 聊天页只投影和播放既有 URL，不得为可见交互引入页面 API、第二份缓存、mock URL 或 fake-success。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| message payload | image `list[0].url/thumbnail_url`、audio `url/duration_seconds`、video `url/thumbnail_url/duration_seconds` | existing `Message.payload` projection；补齐遗漏的 `audio.url`，不修改 SDK transport/schema |
| image | image bubble opens black full-screen preview；close action and contained image | feature-local overlay；real full URL only、Escape/close/route cleanup；save-to-album remains deferred |
| audio | one global active voice；same message toggles stop/play；switching stops previous；missing URL is disabled | one chat-page `<audio>` owner；playing/error state is real element state，unmount stops and clears source |
| video | bubble opens black full-screen preview with back header and actual controls/autoplay | feature-local overlay with native `<video controls autoPlay playsInline>`；missing/unsafe URL cannot open |
| routing | preview is short-lived screen state inside current chat detail | no new React Router route；chat detail remains the URL owner and browser back keeps route semantics unchanged |
| deferred | image save、file preview/download、media compose/upload、voice record/read/auto-next、failed retry、RTC | omitted and separately bounded；no disabled fake entry、mock media or direct Gateway call |
| acceptance | mapping/action/error/cleanup、guest guard、mobile/desktop/theme/no-overflow、real media playback | pure/local gates first；approved authenticated image/audio/video messages are required for final playback acceptance |

Local closeout: `chat-message-view.ts` now projects Gateway `audio.url` without changing shared SDK schemas. `ChatMediaInteractionProvider` is the single route-scoped owner for one `<audio>` element、real loading/playing/error state、switch/stop/unmount cleanup and image/video overlays. Media actions accept only absolute HTTP(S) URLs；missing or unsafe URLs remain disabled/fail-closed. Two focused files/five tests、all H5 11 files/42 tests、SDK 32 files/103 tests、466 asset verification、typecheck/build/full verify and the eventual `/auth/phone` anonymous deep-link guard passed. The existing account expired and Gateway restore returned `Failed to fetch`, so no real media playback、responsive visual or theme acceptance is claimed.

Latest natural-data audit: `.117` opened only no-unread candidates to preserve `markRead` semantics. The available group contained only a system message, the available single chat only application/friendship/text, and archive was empty；no real image/audio/video action existed. Two unread conversations were not opened. Playback remains natural-data-gated；no mock URL or historical screenshot is acceptance evidence.

## 26. W6.a6.2 Chat Image/File Send Core Contract

> AXIOM: 页面只能提交浏览器选择结果给 shared `messages` facade；上传凭证、OSS 直传、Gateway body、client message ID 与 SQLite `sending -> sent/failed` 必须由 SDK 单链编排，任一步失败不得显示成功。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| composer | empty draft exposes plus action；action panel uses 4-column 72px icon boxes | H5 reuses mirrored plus/album/file assets and RN geometry；this slice exposes only album/file real actions |
| picker/limits | album max 12 and preserves selection order；image 10 MB；ordinary file 100 MB | hidden native file inputs；supported browser image MIME、per-item validation and sequential send；no synthetic path or base64 copy |
| upload | shared Gateway credential then OSS `FormData(key/policy/OSSAccessKeyId/Signature/success_action_status/file)` | `src/platforms/web` adapter is the only `Blob/FormData` owner；credential stays in memory and is never persisted/logged |
| send/cache | local outgoing row first；Gateway image/file body reuses object key and URL；same client ID converges to sent or failed | shared sync owns conversation existence check、stable ID、repository writes、Gateway mapping and exact body metadata |
| page boundary | picker errors and send failures remain visible in chat page | H5 calls only `sendImage/sendFile`, then rereads account SQLite；no `fetch`、Gateway client or repository import |
| deferred | draft caption/pending file、camera、video/audio/voice、upload progress/cancel/retry、file download | omitted and separately bounded；no fake controls or fake-success fallback |
| acceptance | selecting、limits、ordering、optimistic/failure state、real upload/send、theme/responsive/guest | local contract gates first；approved authenticated account required for OSS/Gateway final acceptance |

## 27. W6.a6.3 Chat Album Video Send Contract

| dimension | RN production truth | H5 migration decision |
| :--- | :--- | :--- |
| entry | `useChatMediaPicker` opens one `mediaType: mixed` album with selection limit 12 | keep the existing single album action and hidden multiple input；do not add a duplicate video action |
| validation | image/video share album order；video max 500 MB | validate the full FileList MIME/count/size before SDK I/O；unsupported media rejects visibly |
| metadata | picker Asset supplies duration/width/height | a short-lived object URL + hidden standard video element reads metadata；failure prevents upload and always revokes the URL |
| send/cache | `type=104` video body uses uploaded object、duration、dimensions and OSS 7-second snapshot；local state converges sending -> sent/failed | `WebIMSync.messages.sendVideo` and shared `message-video-send` are the only body/state owners；page passes File + metadata only |
| snapshot | `x-oss-process=video/snapshot,t_7000,f_jpg[,w,h],m_fast,ar_auto` | shared SDK reproduces the exact RN query and preserves an existing URL query with `&` |
| deferred | draft caption/pending media、camera、progress/cancel/retry、audio/voice、RTC | omitted；no fake thumbnail、fake sent result or unauthorized real transmission |
| acceptance | real metadata、credential、OSS、Gateway、SQLite、bubble/theme/responsive | local deterministic gates first；approved authenticated account and explicit send authorization remain required |

## 28. W6.a6.4 Chat Voice Send Core Contract

> AXIOM: 语音业务状态、Gateway body 和 SQLite 收敛属于 shared SDK；浏览器仅通过标准录音 API 产出真实 `File`，页面不得持有 OSS、消息体或第二套 outgoing state。

| dimension | RN production truth | H5 migration decision |
| :--- | :--- | :--- |
| entry | composer 左侧 voice/keyboard mode；按住说话 | reuse mirrored `voice.svg`/`keyboard.svg` and RN input pill；pointer hold is the only recording entry |
| recording | microphone permission、AAC/M4A recorder、metering、route cleanup | Web media adapter uses `getUserMedia + MediaRecorder`、chooses supported `audio/mp4|webm|ogg`、stops all tracks on every terminal path |
| gesture/time | upward delta `>=56px` cancels；`<2s` reports too short；`60s` auto-stop | preserve thresholds and visible status；cancel/short paths discard Blob and never call SDK upload |
| send/cache | `sendSoundMessage` uploads then sends `type=103` audio body；same client ID converges sending -> sent/failed | `WebIMSync.messages.sendAudio` reuses shared uploaded-message state owner；page passes only File、MIME、size、duration |
| body | `audio.media_id/url/duration_seconds` and optional `size_bytes` | shared SDK emits exact body with integer duration `1..60` and exact Blob bytes |
| deferred | audio file picker、persistent waveform、played/read/auto-next、upload progress/cancel、failed retry、RTC | omitted and separately bounded；no fake recorder、mock Blob、fake success or unauthorized microphone/transmission |
| acceptance | permission/unsupported/start/stop/cancel/short/auto-stop、OSS/Gateway/SQLite、responsive/theme | injected deterministic gates first；real microphone and message transmission require explicit authorization |

Local closeout: H5 now has one RN-mirrored voice composer path and one browser recorder adapter. Injected tests prove typed `File` creation、cancel discard、permission failure、early recorder failure notification and track cleanup；shared SDK tests prove exact `type=103` body、SQLite `sent` convergence and pre-I/O duration rejection. H5 15/56、SDK 36/111、all-runtime typecheck、build:web/full verify and 390x844/760x900 voice-mode layout proof passed. The browser capability sandbox did not expose microphone APIs, and no real permission prompt、recording、upload or transmission was attempted；those remain explicit acceptance gates.

## 29. W6.a6.5 Chat System Emoji Core Contract

> AXIOM: 第一套系统表情只是当前文本草稿的 Unicode 编辑能力；它不得创建第二种消息 body、富文本 entity 或绕过既有 `sendText` 主链。

| dimension | RN production truth | H5 migration decision |
| :--- | :--- | :--- |
| entry | composer 尾部 emoji/keyboard toggle；打开面板回到 text mode and closes actions | mirrored icons；one `activePanel` owner keeps voice/actions/emoji mutually exclusive |
| list/layout | 52-entry `SYSTEM_UNICODE_EMOJIS`、recent/all sections、7 columns、28/32 emoji text、300px panel | copy exact ordered list and RN geometry；system tab only，unsupported tabs are omitted rather than disabled placeholders |
| edit | insert at current UTF-16 selection、replace selected range、delete selection or one complete grapheme | pure Web helper mirrors selection normalization and `Intl.Segmenter` with ZWJ/variation/skin-tone/flag fallback |
| recent | `im28.chat.systemEmoji.recent` MRU、dedupe、max 21 | browser preference adapter keeps the same key/limit；invalid or unavailable storage fails closed to an empty recent section |
| send | edited Unicode remains ordinary text and follows existing send action | no SDK change；panel never invokes send and browser proof must not transmit a message |
| deferred | illustrated preset entities、rich clipboard、custom emoji sync/manager/type `115` | omitted and separately bounded；no fake tab、mock entity or alternate message type |

Local closeout: H5 now mirrors the RN 52-entry Unicode pack、7-column bounded panel、system/recent sections and emoji/keyboard toggle. Pure behavior tests prove UTF-16 selection replacement、full grapheme deletion and 21-item MRU semantics；authenticated 390x844 and 1280x800 browser proof confirmed insert/delete、panel retention and no new reload errors. H5 17/65、SDK 36/111、466 assets and full verify passed. No message was transmitted；illustrated/custom emoji entities remain outside this contract.

## 30. W6.a6.6 Chat Illustrated Preset Emoji Contract

> AXIOM: 插画预设表情仍是 `type=101` 文本消息；Unicode fallback 是跨端可读正文，`preset_emoji` entity 只提供 IM28 bundled-PNG identity。业务算法必须在 `im28-sdk` 单点实现，RN/H5/Desktop 只提供资源映射和 UI。

### Production Truth

| dimension | frozen contract |
| :--- | :--- |
| pack | `im28-preset-v1`；135 个有序且唯一的 `presetID`，133 个 Unicode fallback；`🖼️`、`⛸️` 各有两个 preset identity，禁止按 Unicode 反推 identity |
| app entity | `{ type: 'preset_emoji', offset, length, packID, presetID }`；`offset/length` 使用 JavaScript UTF-16 unit |
| wire entity | `{ type: 'preset_emoji', offset, length, preset_id: 'packID/presetID' }`；entity 位于 Gateway message/request 顶层，不进入 `body.text` |
| text | `body.text.text` 永远保留 Unicode fallback；外部客户端、未知 pack/preset、资源缺失或 fallback 不匹配时仍可读 |
| recent | key `im28.chat.systemEmoji.illustrated.recent`；只存 `presetID` MRU，去空、去重、上限 21；与 Unicode recent 分离 |
| presentation | panel 7 columns、32px PNG、300px bounded surface；混排消息 18px、单 entity 文本消息 60px、会话预览 14px |

### Shared Semantic Rules

| operation | rule |
| :--- | :--- |
| normalize | drop non-array、invalid type、non-integer/negative offset、non-positive length、out-of-range and overlapping entities；sort by offset |
| identity | encode/decode `packID/presetID` exactly once in shared SDK；empty side or missing separator is invalid |
| insert | resolve registered `presetID` -> Unicode fallback；replace current normalized selection；drop intersecting entities、shift later entities by UTF-16 delta、append new entity、sort、collapse cursor after fallback |
| ordinary edit | compute changed UTF-16 interval；preserve entities before it、shift entities after it、drop intersecting entities；plain paste/typing never creates an entity |
| trim/send | trim final text and shift/filter entities against that exact text before optimistic persistence and Gateway send |
| receive/cache | decode Gateway entities before Repository write；SQLite must persist entities with the message, and send success must retain validated local entities if a gradual Gateway response omits them |
| render | replace covered fallback only when `(packID,presetID)` resolves and registered fallback exactly equals covered text；otherwise render original Unicode |
| preview | any sender/draft/unread prefix offset must use shared projection semantics；never mutate source entity identity |

### Owner Map

| owner | must own | must not own |
| :--- | :--- | :--- |
| `im28-sdk/core` | `PresetEmojiEntity/Document` DTO、135 identity/fallback descriptors、normalize/encode/decode、insert/reconcile/trim/project algorithms | React/React Native types、PNG imports、localStorage/AsyncStorage |
| `im28-sdk/transport + sync + repository` | Gateway mapping、`sendText({ text, entities })` validation/serialization、optimistic/sent/failed entity persistence、missing-echo preservation | panel state、asset lookup、DOM selection |
| RN app | static `presetID -> require(PNG)` adapter、existing composer/message presentation；consume shared algorithms through `/rn` | second normalization/document/serialization implementation |
| H5 app | mirrored `presetID -> URL` adapter、illustrated tab/panel、DOM selection bridge、recent preference、inline/large/conversation rendering | Gateway DTO construction、SQLite entity schema/state transition、Unicode identity inference |

### Runtime And Failure Matrix

| case | required result |
| :--- | :--- |
| invalid/overlap/out-of-range entity | drop entity；keep Unicode text；never blank or fail whole history page |
| unknown pack/preset or missing PNG | keep Unicode fallback；no broken image placeholder |
| known identity but fallback mismatch | keep Unicode fallback；do not substitute a different PNG |
| direct Unicode typing/paste | ordinary text only；no entity synthesis even when glyph matches a preset |
| editing across an entity | remove identity for the intersected range；remaining text stays valid |
| Gateway send failure | same `clientMsgID` row becomes `failed` with text/entity snapshot retained；no fake success |
| Gateway success omits entities | preserve the validated optimistic entities locally until authoritative data includes or explicitly replaces them |
| browser preference unavailable | recent section becomes empty；all 135 items remain usable |

### Implementation Decomposition

| slice | deliverable | gate | excluded |
| :--- | :--- | :--- | :--- |
| `W6.a6.6.1-shared-preset-emoji-core` | SDK canonical DTO/descriptor/algorithms、Gateway mapper/send/cache persistence；RN local algorithm files become thin platform adapters over `/rn` | core/document/mapper/real-SQLite send tests + `build:rn`/`build:web` + RN/H5 typecheck | H5 panel/render、draft persistence、edit/forward/retry UI、real send |
| `W6.a6.6.2-h5-illustrated-emoji-ui` | H5 asset registry、illustrated tab/recent/grid、atomic draft preview、inline/60px bubble and conversation preview rendering | H5 behavior tests + SDK regression + 466 assets + mobile/desktop light/dark browser proof | custom emoji type `115`、rich clipboard、draft persistence、real send |
| `W6.a6.6.3-illustrated-emoji-acceptance` | explicitly authorized disposable text send proves Network/Gateway/SQLite/list-back | real request/result/cache evidence | no unapproved message、account mutation or custom emoji operation |

Reviewer verdict after `.1`: shared runtime chain is now `implemented-local`：SDK owns 135 descriptors、DTO/document algorithms、Gateway mapping、`sendText({text,entities})`、optimistic missing-echo preservation and SQLite v7 `entities_json`；RN DTO/helpers/document algorithms are thin `/rn` adapters and its asset table no longer owns Unicode fallback. SDK 37/116、RN targeted 3 suites/12 tests + `tsc`、H5 17/65 + typecheck/build + 466 assets passed. H5 still has no illustrated presentation/rendering, so overall implementation remains `🟡` until `.2` passes；no real message was transmitted and `.3` remains `🟡 acceptance-gated`.

Reviewer verdict after `.2`: H5 now binds all 135 mirrored PNGs by stable descriptor order and keeps browser-only asset URL/MRU/DOM/render adapters outside shared semantics. The illustrated tab、21-item MRU、seven-column grid、atomic draft preview、inline/60px bubble and conversation projection consume SDK-validated entities；unknown/mismatched/missing assets retain Unicode fallback, and raw text whitespace is preserved for exact UTF-16 offsets. H5 21 files/75 tests、SDK 37/116、typecheck/build、466 assets and authenticated mobile/desktop light/dark browser proof passed. Overall implementation is `implemented-local/acceptance-gated`；no message was transmitted and `.3` remains `blocked-external`.

## 31. Custom Emoji Type 115 Contract

> AXIOM: 自定义表情是账号级远端资源，不是 preset entity。列表、消息身份、缓存和发送状态属于 `im28-sdk`；RN/H5/Desktop 只提供图片 I/O、recent preference 与 UI adapter。

### Production Truth

| concern | frozen contract |
| :--- | :--- |
| library read | `POST /v1/emoji/list`；无分页；按添加时间倒序；单账号最多 `100`；item=`emoji_id/url/added_at` |
| create/add/delete | `/v1/emoji/create` 接受 `object_keys`（单批最多 `20`，仅 jpg/jpeg/png/gif/webp）、`/v1/emoji/add` 只接受消息 `emoji_id`、`/v1/emoji/batch-delete` 接受去空去重 `emoji_ids`；三者均幂等，且只能由 SDK facade 构造请求 |
| upload | 平台只向共享 `IMMediaUploadPort` 提供 opaque source 与文件元数据；本地完整校验和本批全部 OSS 上传成功后才调用 create，任一上传失败时不得提交部分 create 或写入本地成员关系 |
| mutation cache | create/add 成功后必须重新拉取完整 list 并原子替换 SQLite；delete 成功后才删除对应本地 rows；请求失败不得改变当前 cache 或显示成功 |
| reorder | Gateway 无排序 operation；H5/RN 仅以稳定 `emoji_id` 保存账号本地展示顺序，sync 时只关联仍在远端列表中的 ID，不得表示服务端顺序已修改 |
| message | `type=115`；request body 只提交 `{ emoji: { emoji_id } }`；Gateway response/realtime/history 回填 URL snapshot |
| optimistic snapshot | local `sending` row 保存 `{emoji_id,url}`；Gateway 未回填 URL 时保留已验证的 library URL；失败更新同一 row 为 `failed`，不得降级为 custom/text 或假成功 |
| cache | 当前账号 SQLite 保存完整远端 snapshot 和服务端顺序；完整 list 成功后原子替换；失败保留旧 cache 并向调用方抛错 |
| recent | browser/RN preference key `im28.chat.customEmoji.recent`；只保存稳定 `emoji_id` MRU；去空、去重、上限 `100`；展示时与 library 关联 |
| composer | 第三个 heart tab；`常用表情` 区先显示 add tile，再显示 recent；`所有表情` 独立保持 library 顺序；五列自适应正方形 |
| display | chat bubble 使用 URL snapshot、最大 `180`，可进入纯图片预览；conversation preview 固定 `[自定义表情]`；URL 缺失/非法时显示不支持状态，不生成 broken image |

### Owner Map

| owner | owns | must not own |
| :--- | :--- | :--- |
| `im28-sdk` core/transport/sync | DTO、Gateway list mapper/client、SQLite repository、listCached/sync、type 115 send/state/cache | DOM/React Native image component、file picker、localStorage/AsyncStorage API |
| RN app | existing remote image/upload adapter、composer/manager/message presentation；逐片收敛到 `/rn` shared semantics | second DTO/normalizer/send-state implementation |
| H5 app | third tab、five-column layout、browser recent preference、safe remote image/preview presentation | Gateway request construction、SQLite schema、message status transition |

### Failure Contract

| failure | behavior |
| :--- | :--- |
| anonymous/no account DB | reject before cache or network access |
| malformed list item | reject the complete snapshot before any cache write；dedupe valid duplicate IDs by the first remote item |
| list request failure | keep previous SQLite snapshot；surface error；no empty-list overwrite |
| create upload failure | do not call `/v1/emoji/create`；keep membership cache unchanged；surface the real upload error |
| create/add response or follow-up list failure | reject；do not synthesize a local member；a retry is safe because Gateway operations are idempotent |
| batch-delete failure | keep all selected rows and selection state；surface error；no success Toast |
| click unknown/uploading item | do not send；surface unavailable/uploading state |
| send rejection | same optimistic row becomes `failed` and error propagates |
| response URL omitted | retain validated local URL snapshot on the same sent row |
| message URL missing/non HTTP(S) | do not render an image or navigate preview |

### Implementation Decomposition

| slice | deliverable | gate | excluded |
| :--- | :--- | :--- | :--- |
| `W6.a6.7.1-shared-custom-emoji-core` | SDK DTO/mapper/client、SQLite v8 repository、`customEmojis.listCached/sync`、`messages.sendCustomEmoji` optimistic state | Gateway contract + real sql.js cache/send tests + all-runtime build + generated package sync | H5 tab/UI、manager CRUD、upload、real request |
| `W6.a6.7.2-h5-custom-emoji-panel` | third tab、five-column recent/all grid、safe image、click caller and type 115 bubble/preview convergence | H5 behavior + SDK regression + responsive light/dark browser proof without send | manager、upload/add/delete/reorder、message-action save、real send |
| `W6.a6.7.3.1-shared-custom-emoji-mutations` | SDK create upload pipeline、add received ID、batch delete、cache convergence | generated Gateway contract + injected upload + real sql.js tests + all-runtime build | H5 manager UI、message action、local reorder、real mutation |
| `W6.a6.7.3.2-h5-custom-emoji-manager` | add tile、React Router manager、image picker、five-column preview/select/confirm-delete | H5 behavior + responsive browser proof without selecting files or deleting | message-action add、drag reorder、real mutation |
| `W6.a6.7.3.3-custom-emoji-add-reorder` | type115 message action add + stable-ID local reorder UI | focused interaction tests + no-fake/owner review | real mutation unless explicitly authorized |
| `W6.a6.7.4-custom-emoji-acceptance` | approved account proves list/cache and one authorized disposable send | Network/Gateway/SQLite/realtime/list-back evidence | unapproved transmission or account mutation |

Reviewer verdict after `.1/.2`: SDK now owns strict DTO/list mapping、schema v8 account cache、atomic failure preservation and type 115 optimistic URL snapshot semantics. H5 consumes those facades through a third heart tab with independent stable-ID MRU and a five-column grid；an authenticated read-only smoke rendered one real item at 458x786 and 1280x800 without overflow or console errors. SDK Web 40 files/121 tests、core Gateway contracts、all-runtime typecheck/build:web package sync、H5 22 files/77 tests、typecheck/build and 466 assets passed. No emoji was clicked and no message was transmitted；light-theme proof、manager mutations and `.4` send/list-back acceptance remain gated.

Reviewer verdict after `.3.1/.3.2`: SDK now owns strict create/add/delete mutation semantics through `IMMediaUploadPort` and account SQLite convergence：create validates the complete 1–20 image batch and only submits after every upload succeeds，create/add refresh the complete list before atomic replacement，and delete removes local membership only after Gateway success. H5 binds those facades to a conversation-scoped React Router manager with an add tile、file picker、preview、organize selection and confirmed batch delete；it contains no Gateway endpoint、repository or upload state machine. SDK Web 40 files/126 tests、core Gateway contracts、all-runtime typecheck/build:all/package sync、H5 23 files/80 tests、typecheck/build and 466 assets passed. Authenticated 458x786 read-only proof showed equal five-column cells and no overflow；no file was selected，no mutation or message was transmitted. Overall verdict is `implemented-local/acceptance-gated`；`.3.3` message collection/local reorder is active，desktop/light visual proof and real mutation/send remain gated.

Reviewer verdict after `.3.3`: H5 type115 projection now retains the stable `emoji_id` and exposes the RN action only through long-press/right-click/keyboard menu；clicking that explicit action delegates to shared `customEmojis.add` and displays success only after the real mutation resolves. Manager ordering stores only deduped IDs under `im28.chat.customEmoji.order`，applies them over the current SDK member snapshot，drops missing IDs，appends new remote members，and uses a touch/mouse Pointer selected-stack tray without claiming a Gateway reorder. H5 24 files/85 tests、typecheck/build and 466 assets passed；authenticated 458x786 proof selected one real cached item，opened the move tray and cancelled without committing order. The current real conversation contains no type115 history，so action-menu visual proof remains gated；no fake message was injected，no add/order write、file selection、mutation or message transmission occurred. Overall verdict remains `implemented-local/acceptance-gated`，and `.4` requires explicit authorization plus real type115 data.

## 32. W6.a6.8 Chat Media Export Contract

> AXIOM: 下载源只能来自 shared message cache 的真实 Gateway HTTP(S) URL；H5 可适配浏览器文件 I/O，但不得复制媒体 DTO、访问 Gateway、伪造下载完成或把打开新窗口描述为已保存。

| dimension | RN production truth | H5 migration decision |
| :--- | :--- | :--- |
| image save | `ImagePreviewModal` 右上角保存；远端图先下载缓存，再写系统相册；失败可见 | 黑色图片预览保留关闭与下载按钮；浏览器 adapter 必须先取得成功 Blob，再触发带文件名的 object URL 下载；成功文案仅表示已交给浏览器下载 |
| file projection | type 105 reads URL/name/size and opens `FilePreviewModal` | existing `Message.payload.file` remains truth；view only adds safe URL projection，no SDK/schema change |
| file preview | full-screen header、file icon/name/size、可打开或下载 | route-scoped full-screen overlay；explicit open uses a new isolated tab，blocked popup is an error；download shares the verified Blob adapter |
| safety/failure | missing source cannot download；download/open errors remain visible | only absolute HTTP(S) is actionable；HTTP/CORS/blob/DOM/open failures reject and never show success；overlay stays open for retry |
| lifecycle | preview is transient chat-detail state | Escape/back button closes overlay；object URL is revoked after the synchronous browser download trigger；no local cache or preference write |
| ownership | RN native filesystem/camera roll are app platform concerns | H5 browser adapter owns `fetch/Blob/URL/document/window.open`；page and SDK own none of them |
| excluded | media send/upload and file-system location are separate operations | no upload/send、progress/cancel、offline file cache、read/played state、failed-send retry、RTC or service worker |
| acceptance | real message、save/download/open、failure、responsive/theme | deterministic injected adapter tests + full H5 gates；approved real image/file history required for final browser evidence |

Reviewer verdict: `chat-message-view` only exposes the persisted file URL；`ChatMessageContent -> ChatMediaInteractionProvider -> ChatMediaPreviewOverlay -> chat-media-download` is the single H5 path，and browser fetch/Blob/object URL/window I/O exists only in the final adapter. HTTP/CORS/popup failures cannot produce success，unsafe URLs fail closed，and there is no Gateway、Repository、SQLite、compat or alternate download path. H5 25 files/92 tests、typecheck/build、466 assets and full workspace verify passed. Real cached mobile image/PDF plus 1280x800 file layout、Escape and zero-console proof passed without clicking download/open；actual browser download/open and light-theme evidence remain acceptance-gated.

## 33. W6.a6.9 Chat Failed Retry Contract

> AXIOM: 重试必须消费当前账号 SQLite 中的原失败行，并继续使用原 `clientMsgID`；H5 不得反解 payload、重新选择发送 API、生成第二条 optimistic message 或把不可恢复媒体伪装成可重试。

| dimension | RN production truth | H5 migration decision |
| :--- | :--- | :--- |
| entry/state | failed outgoing 状态图标可点击；点击后原消息立即 `failed -> sending`，完成后收敛为 `sent/failed` | failed 图标仅在 shared SDK 判定可恢复时成为按钮；`messages.retry({clientMsgID,onSending})` 是唯一 action owner |
| identity | retry dispatch 复用原 `clientMsgID`，避免列表出现重复消息 | SDK 从 Repository 读取原行并向 Gateway 提交相同 `client_msg_id`；禁止调用会创建新 ID 的普通 send API |
| account guard | RN state 只来自当前 chat detail 的 outgoing message | SDK 必须校验当前账号、`direction=outgoing`、`senderID=currentUserID`、`status=failed` 和仍存在的缓存会话，任一不符时在网络前拒绝 |
| text `101` | payload 保留正文与 preset entities，可完整重建请求 | 首批支持；复用 shared entity 校验/序列化，正文、entity 和同一 SQLite 行必须保持一致 |
| custom emoji `115` | payload 保留稳定 emoji ID 与展示 URL | 首批支持；Gateway 仍只接收 `emoji_id`，成功回包缺 URL 时继续保留原安全 URL snapshot |
| media `102..105` | RN 消息行持有可再次读取的本地 path | 首批不支持；Web failed row 只有元数据且没有可持久化 `File/Blob`，静态失败图标不得触发网络或提示可重试 |
| concurrency/failure | sending 状态阻止同一条消息重复 dispatch；异常回到 failed | shared mutation queue 串行化；只有 failed row 可进入 retry；Gateway rejection 必须把同一行恢复为 failed 并原样抛错，无 fake success |
| page ownership | screen 编排动作，service 执行发送 | H5 只传 client ID、呈现 onSending snapshot、从 SQLite 重读最终状态；不访问 Repository/Gateway/消息 DTO body |

### Retry Capability Matrix

| content type | persisted source complete | local retry | required later work |
| :--- | :---: | :---: | :--- |
| `101` text + preset entities | yes | supported | real authorized failure/retry acceptance |
| `115` custom emoji | yes | supported | real authorized failure/retry acceptance |
| `102` image | no | blocked | persist post-upload remote body；pre-upload failure requires explicit source reselection/new send |
| `103` audio | no | blocked | same as image；recording Blob must never be serialized into SQLite |
| `104` video | no | blocked | same as image；metadata alone is not a retryable source |
| `105` file | no | blocked | same as image；name/MIME/size cannot reconstruct file bytes |
| other message types | not frozen | blocked | trace RN payload + Gateway contract before registration |

### Failure Contract

| failure | required behavior |
| :--- | :--- |
| empty/unknown client ID | reject before any status write or Gateway I/O |
| incoming、different sender、non-failed、deleted conversation | reject before Gateway I/O；do not change the row |
| unsupported or malformed persisted payload | reject visibly；keep row failed；do not guess a body |
| Gateway rejection or mismatched returned client ID | restore the same row to failed；propagate the real error；row count remains one |
| successful retry | same client ID row becomes sent and preserves text entities or custom emoji URL fallback |
| rapid repeat click | UI busy state plus SDK status validation prevents a second network send for the same completed row |

Media retry may be registered only after the shared SDK persists a validated post-upload Gateway body before send and defines the pre-upload source-recovery UX. A same-session in-memory `File/Blob` registry is not authoritative recovery and must not be presented as reload-safe retry.

## 34. W6.a6.10 Chat Media Retry Stage Contract

> AXIOM: 媒体重试能力来自同一消息行中已持久化且重新验证通过的 Gateway body，不来自 content type、本次页面内存或无法跨刷新恢复的 `File/Blob`。上传前失败与上传后发送失败必须是两种明确行为。

### Stage Model

| stage | durable row payload | failure/restart result | retry behavior |
| :--- | :--- | :--- | :--- |
| `source-required` | only safe display metadata；no `media_id/url` | same row becomes `failed` | no retry button；UI states that media must be selected/recorded again；a new selection is a new send with a new client ID |
| `uploaded` | exact validated image/audio/video/file Gateway body with `media_id` and HTTP(S) URL | same row becomes `failed` | existing retry button calls `messages.retry` with the original client ID；no upload or source access occurs |
| `sending-to-gateway` | same durable uploaded body，status=`sending` | session recovery changes interrupted sending rows to `failed` before realtime/UI starts | capability is recalculated from persisted body，then explicit retry is available |
| `sent` | authoritative Gateway response mapped to core | terminal success | not retryable |

The stage is derived from validated persisted payload plus message status. No parallel boolean/enum column is added because it could drift from the body that is actually sent.

### Media Body Contract

| type | required durable fields | preserved optional fields | invalid checkpoint result |
| :--- | :--- | :--- | :--- |
| `102` image | exactly one `image.list` item；non-empty `media_id`；HTTP(S) `url/thumbnail_url`；uint64-string `size_bytes` | positive finite `width/height` | reject before Gateway；same row becomes failed and remains source-required/non-retryable |
| `103` audio | non-empty `media_id`；HTTP(S) `url`；integer duration `1..60`；uint64-string `size_bytes` | none | same |
| `104` video | non-empty `media_id`；HTTP(S) `url/thumbnail_url`；non-negative integer duration；uint64-string `size_bytes` | positive finite `width/height` | same |
| `105` file | non-empty `media_id/name/mime_type`；HTTP(S) `url`；uint64-string `size_bytes` | none | same |

### Ordering And Ownership

```text
platform source -> IMMediaUploadPort.upload
-> shared normalize uploaded body
-> MessageRepository checkpoint same sending row
-> Gateway send with same client ID/body
-> same row sent or failed
```

| owner | responsibility | forbidden |
| :--- | :--- | :--- |
| shared `message-upload-send-state` | upload orchestration、body checkpoint before Gateway、same-row failure convergence | platform Blob/File APIs、new client ID after upload |
| shared `message-media-retry` | strict body validation/reconstruction and conditional retry capability for 102–105 | source registry、UI text、Gateway I/O |
| shared `messages.recoverInterruptedSends` | at authenticated account establishment, mark current-user outgoing `sending` rows failed before realtime/UI | guessing remote success、deleting rows、auto-resending |
| Web runtime | call shared recovery after account DB opens and before realtime connects | SQL/status/body logic |
| H5 chat | render shared capability and cache state；pre-upload failed media stays non-actionable | payload parsing、upload retry、File/Blob persistence、fake same-ID source resend |

### Failure And Idempotency Contract

| case | required result |
| :--- | :--- |
| upload rejects | metadata row becomes failed；no Gateway call；no retry capability |
| uploaded body validation/checkpoint rejects | row becomes failed；no Gateway call；no claim that upload can be resumed |
| checkpoint succeeds and Gateway rejects | same row retains uploaded body and becomes failed；retry skips upload and reuses original client ID |
| page/process stops after checkpoint | next authenticated session changes interrupted sending row to failed before realtime/UI；explicit retry uses the checkpoint |
| Gateway actually succeeded before interruption | retry still uses the same idempotency ID；SDK never creates a second optimistic row or guesses success locally |
| malformed/tampered checkpoint | capability fails closed；status remains failed；no Gateway call |
| pre-upload user wants to retry | user must explicitly reselect/re-record source；this is a new send, not a retry of unrecoverable bytes |

Implementation is complete only when real sql.js tests prove upload count remains one across Gateway failure + retry, body survives failed persistence, interrupted sending recovery occurs before runtime realtime connection, malformed/pre-upload rows cause zero Gateway calls, and H5 obtains all actionability from the SDK capability.

## 35. W6.a6.11 Chat Quote/Reply Contract

> AXIOM: 引用消息是 `type=114` 的独立消息，不是普通文本的 UI 装饰。被引用消息的稳定 ID、发送时文本快照和回复正文必须由 shared SDK 构造并作为同一 Gateway body 持久化；H5 不得自行拼协议或在重试时重新读取 composer 状态。

| dimension | RN production truth | shared SDK / H5 decision |
| :--- | :--- | :--- |
| action eligibility | 普通消息长按菜单提供“引用”；系统、撤回和本地删除提示不进入普通气泡动作链 | H5 通用消息动作 owner 对非 system view 开放引用；右键、500ms 长按和键盘动作只选择消息，不发送 |
| source identity | `serverMsgID || clientMsgID`，两者均空时发送前拒绝 | `sendQuote` 优先使用非空 `serverMsgID`，回退 `clientMsgID`；保存到 `quote.msg_id`，禁止生成替代 source ID |
| wire/body | `/v1/message/send`，`type=114`，body=`quote.{msg_id,text,reply_text}` | SDK 是唯一 body owner；`reply_text` trim 后必须非空，`text` 是发送时来源快照且允许空字符串 |
| source snapshot | RN 依次读取 text、quote reply、mention、user/group card 可见文本；媒体可为空 | SDK 按同一语义从 shared payload 读取，不访问 UI projection；快照只用于 source 不在当前窗口时的降级展示，不替代 source ID |
| optimistic/cache | 本地先写 type114 sending，成功/失败在同一 client message 上收敛 | SDK 在 Gateway I/O 前持久化完整 quote body；`onSending` 只收到已落库实体；失败保留 body 和同一 client ID |
| composer | 选择后显示“回复 {sender}”和来源摘要；取消只清引用；成功提交清空引用和草稿 | H5 页面持有选中 `Message`，composer 只展示/取消；非空文本提交调用 `sendQuote`，普通文本仍调用 `sendText` |
| list projection | 引用气泡显示来源预览；已解析来源可跳转；来源删除显示删除态 | H5 用 `msg_id` 在当前缓存窗口匹配 `serverMsgID/clientMsgID` 并滚动；窗口外显示发送时快照，不猜 sender；删除/撤回来源显示“引用的内容已删除” |
| retry | failed quote 复用原消息身份和原引用 payload | type114 注册到 shared retry matrix；只接受完整 `msg_id + reply_text` body，重试沿用原 client ID，畸形 payload 在 Gateway 前失败 |
| realtime | Gateway type114 body 经 mapper 原样进入 SQLite | 现有 realtime/cache reread 路径不新增页面协议分支；投影只消费 shared `Message.payload` |

### Failure And Ownership Contract

| case | required result |
| :--- | :--- |
| source has no stable ID | reject before optimistic row and Gateway I/O |
| reply is empty after trim | reject before optimistic row and Gateway I/O |
| Gateway rejects or returns mismatched client ID | same quote row becomes failed，完整 body remains retryable |
| retry payload is malformed | keep failed，zero Gateway calls，never rebuild from currently selected quote/draft |
| source is outside current 50-message window | render stored snapshot without fabricated sender；no fake source navigation |
| source is revoked/deleted in current window | render explicit deleted copy and disable source jump |

Canonical owner is `im28-sdk/src/sync/message-quote-send.ts` plus the existing message send/retry state machine. H5 owns only action selection、composer state、React rendering and in-list scrolling. This slice does not authorize a real Gateway send；acceptance requires an explicitly approved disposable conversation.

## 36. SDK Sync Runtime Placement Contract

> AXIOM: 客户端差异必须进入明确的平台目录，业务规则必须保留一份 shared 实现。目录可区分 RN/Web/Desktop，但不得以目录清晰为理由复制消息状态、重试、引用、DTO 或 cache convergence。

| class | canonical path | build/runtime rule |
| :--- | :--- | :--- |
| shared sync | `im28-sdk/src/sync/**` | no platform imports；由 core/RN/Web/Desktop typecheck；当前 RN 未 import/call 时不改变 RN 运行链 |
| Web composition | `im28-sdk/src/platforms/web/sync/web-im-sync.ts` | only Web entry/runtime may import；excluded from RN/Desktop output |
| Web adapters | `src/platforms/web/runtime|storage|media/**` | DOM/IndexedDB/Worker/Blob/WebSocket lifecycle only |
| RN adapters | `src/adapters/rn/**`、`src/transport/openim-rn/**` | Nitro SQLite/OpenIM/native ports only；excluded from Web/Desktop |
| Desktop adapters | `src/platforms/desktop/**` | Electron main-process driver/renderer IPC only；excluded from RN/Web |

The former `src/sync/web-im-sync.ts` composition and its sql.js integration test moved under `platforms/web/sync`. Shared `message-*` files remain under `src/sync` because their only environment differences are injected `DatabaseAdapter`、Gateway client、ID/time and media upload ports. `build:rn` must prove the Web composition file is absent from `dist/rn`; all builds must run the AST import-boundary guard before compilation.

### 36.1 Historical naming and RN adoption

- `WebIM*` under shared `src/sync` is a compatibility name, not permission to import DOM、IndexedDB、Worker、Blob or Web composition.
- No neutral alias is added until a real RN/Desktop consumer needs it；an unused alias would be a hidden compatibility layer with no exit signal.
- A future rename must follow `neutral named export -> consumer migration -> RN/Web/Desktop package verification -> breaking removal` and keep one implementation body.
- RN adoption is opt-in only：create an RN composition root under `src/platforms/rn/sync`, inject RN database/transport ports, then switch only through `im28-phone/src/services/openim/**` behind a separately approved regression slice.
- Merely compiling or copying shared sync files into the RN package cannot register listeners、open SQLite、start WebSocket or replace the current RN service path.

## 37. Chat Message Copy Contract

> AXIOM: 复制是当前消息只读 projection 的浏览器平台副作用，不是消息 mutation，也不得通过复制动作触发 SDK、Gateway 或 SQLite。

| surface | contract |
| :--- | :--- |
| eligibility | system/revoked/deleted rows have no action wrapper；normal cached bubbles expose copy even when quote is unavailable |
| presentation | reuse RN `copy.regular.svg` inside the existing long-press/right-click menu；incoming menu anchors left and outgoing menu anchors right to avoid viewport overflow |
| text | text/quote uses visible reply text；image/audio/video/file uses `[图片]/[语音]/[视频]/[文件]`；card uses `[名片] {name}` |
| platform owner | `chat-message-copy.ts` owns the injectable clipboard port；production writes through `navigator.clipboard.writeText` |
| feedback | only a resolved clipboard Promise may show `复制成功`；rejection remains visible error and leaves no success state |
| stop boundary | no rich clipboard entity payload、HTML clipboard、SDK/cache mutation、send、forward、delete、edit or mock clipboard production path |

Local evidence: injected success/failure tests、H5 27 files/99 tests、SDK 44 files/140 tests、full verify/build and authenticated 458x786 right-click proof passed. The first mobile menu layout exceeded the right viewport edge by 21px；direction-aware anchoring reduced its right edge to 442px with `scrollWidth=458px`. No console warning/error or message/network mutation occurred.

## 38. Chat Message Forward Contract

> AXIOM: 转发必须从当前账号 SQLite 的真实源消息出发，由 shared SDK 构造目标消息、幂等 ID 和逐条状态；H5 只编排选择、预览和反选，不得复制 Gateway body、伪造来源或把部分失败描述为整批成功。

### RN Source And Runtime Decisions

| dimension | RN production truth | shared SDK / H5 decision |
| :--- | :--- | :--- |
| entry | 单条 action 或多选 action 进入同一 target selector | H5 只对非 system/revoked/deleted 真实消息展示转发；单条与多选生成同一 pending payload |
| target | 最近会话、好友、已加入群聊；选择后先打开目标会话 | 目标必须由既有 conversation/peer-profile/joined-group facade 解析并落库；page 不拼 `conversation_id` |
| preview | 进入目标 chat 后可更换目标、反选部分消息、附加一条评论 | React Router 只携带内存 pending state；刷新/直达时安全丢弃未发送预览，禁止 localStorage 持久化整批消息 |
| exclusion | RN `excludedMessageKeys` 在最终发送前过滤，保留原顺序 | H5 使用 stable server/client message ID；反选到空批次时只取消 pending，不请求网络 |
| normal forward | RN 对有服务端源 ID 的消息调 `/v1/message/batch-forward` | shared SDK 一批只允许一个目标会话、`1..100` 条；request 只发 `source_msg_id/client_msg_id`，不信任客户端伪造的来源信息 |
| hidden sender / local source | RN 不走 batch-forward，而是剥离 `forward_origin` 后逐条通过 `/v1/message/send` 发送已注册 body | shared SDK 必须显式注册可重建 body 的 content type 并逐条收敛；未注册/畸形 payload 在 I/O 前拒绝，H5 不自行 strip/序列化 |
| comment | RN 在所有转发项后附带一条可选文本 | batch API 使用同一 request comment；逐条 fallback 仅在至少一条转发成功后发送 comment；comment 有独立 client ID 和成败状态 |

### Identity, Cache And Realtime Contract

| invariant | required behavior |
| :--- | :--- |
| source truth | 发送前按当前账号从 Repository 重读源消息；缺失、跨账号、已删除/撤回或不可见源行拒绝 |
| idempotency | 一次提交生成一个 stable `batch_id`，每个转发项和 comment 各有 stable `client_msg_id`；transport retry 原样复用，禁止二次 optimistic 行 |
| optimistic rows | 发网络前在目标会话按原顺序写入 `sending` 转发行，comment 最后；每行在同一 client ID 上独立转为 `sent/failed` |
| partial response | 顶层 HTTP 成功不等于整批成功；必须检查 `data.list[].code` 和 `data.comment.code`，缺失/无法匹配的结果行按失败收敛 |
| forward origin | Gateway top-level `forward_origin` 规范化为 core `Message.forwardOrigin`，并以新 schema 列与 body 分开持久；full sync/history/send/realtime `message.batch` 都必须无损重读 |
| origin display | 普通转发显示服务端返回的来源用户快照；隐藏发送者分支不携带 origin；页面不从当前用户资料补造 |

### Failure And Ownership Contract

| case | required behavior |
| :--- | :--- |
| no eligible source / more than 100 | reject before optimistic write and Gateway I/O |
| target cannot resolve | keep source selection/pending preview and surface the real error；do not open a fabricated conversation |
| top-level request failure | every same-batch optimistic row becomes failed；preserve IDs/payload for an explicit future retry contract |
| partial item failure | successful rows stay sent and failed rows stay failed；comment follows its own result；never show one batch-level success that hides failures |
| all forward items fail | comment remains failed/not sent，matching Gateway semantics |
| hidden-sender unsupported body | reject that item before I/O；do not silently fall back to normal forward and expose sender identity |
| refresh/back before commit | pending UI state may be discarded；no optimistic row or network call has occurred |

Canonical owners are shared `message-forward-*` modules、`GatewayHTTPClient.batchForwardMessage`、core mapper and `MessageRepository`. H5 owns the RN-derived target selector、pending preview、excluded-ID state、optional comment draft and route transitions only.

Reviewer verdict after `.14.1`: shared core now maps Gateway `forward_origin` into `Message.forwardOrigin` and schema v9 persists origin/source/batch separately. `messages.forward` rereads every source and target from the current account database, creates one stable batch plus item/comment identities, atomically writes optimistic rows, then converges normal batch partial results or registered hidden-sender individual sends per row. Hidden body-copy reuses the strict persisted-body registry for types `101..105/114/115`; unsupported or malformed content rejects before ID allocation、SQLite write and Gateway I/O. The initial H5 core deliberately requires completed ordinary sources with `serverMsgID`; RN's local-source fallback remains a later parity extension rather than a silent body-copy shortcut. SDK 49 files/150 tests、Web 46/145、all-runtime typecheck/package compile、`build:web` generated-package sync and H5 full verify passed. No RN application/runtime path was changed and no real Gateway forward was executed. Verdict: shared core `implemented-local/acceptance-gated`; H5 target/preview UI is `.14.2`, real normal/hidden-sender evidence is `.14.3`.

Reviewer verdict after `.14.2`: H5 single-message action and multi-select action now create the same stable-ID-only React Router state and enter one target selector. Recent conversations、friends and joined groups reuse the existing facades；group targets require a matching cached group conversation and never derive a conversation ID. The target chat rereads exact source rows through `messages.getCachedByClientMsgIDs`, keeps pending state in Router memory only, supports exclusion、hide-sender capability gating、optional comment、target replacement and explicit send through `messages.forward`. Refresh/deep-link rejects missing or body-shaped state without optimistic write or network I/O；an incomplete cache reread surfaces the real error and clears invalid pending state instead of leaving a zero-item composer；forwarded rows render only the persisted origin snapshot. H5 29 files/103 tests、SDK Web 46/147、typecheck、`build:web` generated-package sync、466 assets and production build passed；authenticated read-only browser proof covered all three target tabs、single/two-message pending preview and 390x844/458x786 light/dark no-overflow without sending. Verdict: H5 UI `implemented-local/acceptance-gated`；real normal/partial-result/list-back、hidden-sender mutation and desktop visual proof remain `.14.3` gates.

Reviewer verdict during `.14.3`: with explicit authorization, source `😊` from the `donk二大爷` conversation was sent twice to cached group conversation `019fe220-4c15-7344-bcaf-abd424373aef`. The normal batch completed at `14:59`, moved the conversation to the top and reread as `转发自 donk / 😊` with no sending/failed row. The hidden-sender branch completed at `15:01`, moved the same conversation again and reread as plain `😊`; the last row had no `.rn-chat-forward-origin`, while the prior normal row retained origin. This real run exposed a page race where the target's initial old `pullHistory` window could overwrite a concurrently completed send；`pullAndReadChatHistory` now always rereads SQLite after pull, and a focused ordering regression plus H5 30 files/104 tests、typecheck、466 assets and production build pass. No third message was sent. Verdict: real normal and hidden-sender Gateway/cache/list-back are `accepted`; a controllable real partial-result case and desktop visual proof remain gated.

`.54` 已将 `.14.2` 的独立目标页/目标聊天 pending preview 从默认用户路径删除并统一为聊天内 `ChatTargetPickerModal`。`.124` 进一步证明当前主路径在 760×900 light 下保持 720px 居中、好友/群聊跨 Tab 多选、当前筛选 ALL、原 URL 取消返回与零发送；因此上方历史记录中的 desktop visual residual 已关闭。`.14.3` 仅剩无法安全制造的可控 real partial-result，继续保持 `blocked-external`。

## 39. Chat Message Delete Contract

> AXIOM: 消息删除是受权限的服务端/本地状态迁移，不是页面过滤。H5 只提供 RN 对齐的选择、权限呈现和确认 UI；当前账号重读、Gateway mutation、partial result 与 SQLite 收敛只能在 `im28-sdk` 实现一次。

| field | frozen decision |
| :--- | :--- |
| RN source | `ChatDetailScreen.tsx`、`chatDetailMessageActionRunners.ts`、`ConversationDeleteSheet.tsx`、`gateway-message-service.ts`、`openIMService.ts` |
| H5 caller | `ChatMessageAction`、`ChatMultiSelectBar` -> `useChatMessageDeleteFlow` -> `ChatMessageDeleteSheet` -> `runtime.getSync().messages.delete` |
| shared owner | `im28-sdk/src/sync/message-delete*.ts`、`MessageRepository.markLocalDeletedMany`、现有 Gateway generated operations |
| input | `conversationID`、最多 100 个稳定 cached `clientMsgID`、`scope=self|all`；不接收页面构造的 body/server ID |
| single remote | 有 server ID 时调 `updateMessage`，成功后才本地隐藏 |
| batch remote | 两条及以上 server-backed 行调 `batchDeleteMessage`，按 operation/target/index 匹配每项结果 |
| local-only | `self` 可直接隐藏；`all` 必须在任何 Gateway/SQLite mutation 前拒绝 |
| all permission | 直聊允许显示；群聊自己发送的消息允许，群主/管理员可依已有 group cache 呈现其他人消息的入口；SDK 仍执行 server-ID fail-closed |
| failure | 顶层请求失败不改本地；partial 只隐藏成功行并返回可见的成败计数；本地收敛是单事务 |
| realtime | 服务端 deleted update 继续由现有 realtime mapper/repository 收敛；页面不注册第二条 WS 删除逻辑 |
| excluded | revoke 不复用 delete；RN 已显式拒绝撤回，本切片不制造撤回成功路径 |

Reviewer verdict after `.15.1/.15.2`: SDK now rereads authoritative rows from the active account database, uses single update versus batch delete exactly once, preserves every row on top-level failure and transactionally hides only confirmed successes on partial response. H5 single-message and multi-select actions share the RN-derived confirmation sheet and invoke only `messages.delete`; group all-member visibility is projected from the existing role cache and does not bypass SDK guards. SDK Web 47 files/152 tests、all-runtime typecheck、`build:web` generated-package sync、H5 31 files/107 tests、typecheck、466 assets and production build passed. Authenticated read-only browser proof covered single/two-message sheets at 458x786 and 390x844 with no overflow or console warnings/errors. No delete scope was confirmed and no production data changed. Verdict: `.15.1` shared core and `.15.2` H5 UI are `implemented-local`; `.15.3` real `self/all/partial/list-back` is `blocked-destructive-authorization`.

## 40. Chat Message Edit Contract

> AXIOM: 主动编辑是原消息的受限 same-row 状态迁移，不是新发消息或页面文本覆盖。H5 只持有 RN 对齐的 action/composer presentation；资格判断、Gateway body、SQLite 收敛和 realtime 合并只能在 `im28-sdk` 实现一次。

| field | frozen decision |
| :--- | :--- |
| RN source | `ChatDetailScreen.tsx`、`chatEditHelpers.ts`、`EditMessageComposerPreview.tsx`、`gateway-message-service.ts`、`openIMService.ts` |
| H5 caller | `ChatMessageAction` -> `useChatMessageEditFlow` -> `ChatComposerEditPreview` -> `runtime.getSync().messages.editText` |
| shared owner | `im28-sdk/src/sync/message-edit.ts`、`WebIMMessageSync.editText`、现有 Gateway update/repository/realtime edited cursor |
| input | `conversationID`、cached `clientMsgID`、trimmed nonempty text、可选 preset entities；不接受页面传入 server ID、sender、status 或 Gateway body |
| eligibility | 当前用户本人发送、direction outgoing、type 101、status sent、存在 server ID、原正文非空且无 forward origin/source/batch |
| Gateway | stable operation ID；target 是原 server ID；edit body 只含 text 与序列化 entities |
| persistence | 成功后保持同 client/server ID、conversation、sender、direction、contentType、status、sendTime、seq；替换 text/entities 并合并 `localEx.editedAt` |
| failure | 资格失败在 I/O 前拒绝；Gateway 失败/目标不匹配不改 cache；H5 保留编辑态和草稿，只有 facade resolve 后退出 |
| realtime | 其他端 edited update 继续走既有独立 update cursor/repository upsert；H5 不注册第二条 WebSocket path |
| presentation | 编辑 action 位于复制之后、多选之前；进入编辑清除引用并回填原文/entities；preview 可取消；时间显示 `已编辑 HH:mm` |
| excluded | 非文本、未发送、本地-only、他人、转发消息和 revoke 不进入此切片 |

Reviewer verdict after `.16.1/.16.2`: SDK rereads the current account row, applies the RN parity guard and performs one Gateway update under the existing shared mutation queue. It writes no optimistic edit and, only after a matching success response, replaces the same cached identity/order/status while preserving validated entities and recording `editedAt`; failure leaves the original row untouched. H5 exposes edit only through the shared guard, clears quote state, restores the original document into the RN-derived preview/composer and retains draft/editing state on failure. SDK Web 48 files/155 tests、all-runtime typecheck、runtime boundary gate、`build:web` generated-package sync、H5 32 files/109 tests、typecheck、466 assets and production build passed. Authenticated 458x786 read-only proof opened and cancelled the edit preview without horizontal overflow；no edit was submitted. Verdict: `.16.1/.16.2` are `implemented-local/acceptance-gated`；`.16.3` real Gateway、same-row SQLite/list-back and second-client realtime proof is `blocked-mutation-authorization`.

## 41. Chat Group Mention Contract

> AXIOM: 群 mention 的权威是稳定成员 ID 与顶层 `mentions`，不是正文里看起来像 `@名称` 的字符串。成员 cache、type 106 body、发送状态和 SQLite 身份只允许在 shared SDK 实现一次；H5 只负责 RN 对齐的选择与展示。

| field | frozen decision |
| :--- | :--- |
| RN source | `chatMentionHelpers.ts`、`MentionPickerPanel.tsx`、`chatMessageHelpers.ts`、`conversationPreviewHelpers.ts`、现有 Gateway message service |
| member source | `WebIMSync.groupMembers` 先读当前账号 `GroupMemberRepository`，再全分页 `listGroupMembers`；任一页失败保留旧 cache，非 active 成员不进入候选 |
| permission | `@所有人` 仅在 joined-group cache 明确 `canMentionAll=true` 时出现和发送；未知权限 fail-closed |
| selection | 输入光标前最后一个无空白 `@query`；all 优先、排除本人、昵称/userID 不区分大小写匹配、最多 30 个成员；选择后插入 `@名称 ` 并把光标折叠到尾随空格之后 |
| identity | `Message.mentions` 保存 `type=user|all`、稳定 `userID` 与可选 nickname snapshot；正文删除标签后发送前过滤，不从任意手输文本补造身份 |
| send | `messages.sendMention` 唯一构造 type 106、`body.mention.text/targets/user_ids` 与 top-level mentions/entities；沿用同一 mutation queue 和 `sending -> sent/failed` 状态机 |
| persistence | schema v10 `messages.mentions_json` 独立保存身份；history/full sync/send/realtime 均经 shared mapper/repository 重读 |
| presentation | chat 读取 `body.mention.text`；会话列表按 `lastReadSeq < seq` 优先最近 incoming mention，再回退 latest message；命中本人显示 `[有人@我]` 并把 target nickname snapshot 替换为 `@我`，all 显示 `[所有人]`；shared cache 按 `friend remark -> group nickname -> user nickname` 补 `发送人：`，静音未读条数不得覆盖 mention 前缀 |
| RN impact | shared source 进入 RN 编译只证明无平台依赖；RN app 未 import/call Web composition or shared mention facade，构建发布不会替换现有 RN service runtime |

### Failure And Acceptance

| case | required behavior |
| :--- | :--- |
| group missing from account cache | reject before member replacement or message send；不得伪造空群 |
| member page/API failure | preserve last complete group-member snapshot；surface real error |
| manually typed `@name` without picker identity | ordinary text send；never fabricate a user ID |
| selected label removed before submit | omit that target；if no target remains, use ordinary text send |
| invalid user/all target or permission loss | reject before Gateway send and do not claim success |
| Gateway rejection/mismatched response | same optimistic type106 row becomes failed and retains payload/identity for audit |
| local acceptance | SDK 52 files/163 tests、H5 33 files/116 tests、all-runtime boundary/typecheck、466 assets and production build pass |
| real acceptance | requires explicit disposable-group authorization and proves top-level mentions/body targets、SQLite v10、realtime and list-back；currently blocked |

`W6.a6.17.2.1` closes the older-unread-message gap without schema or page history scanning: shared `findLatestUnreadMention` queries only incoming、undeleted、sequenced rows after `lastReadSeq` and matches exact normalized `mentions_json` identity；H5 keeps `draft > unread mention > latest message` and only renders the returned snapshot. `.17.2.2` closes the provable sender-name gap: a complete contact pagination updates existing `friendships/users` under the shared mutation queue，later-page failure preserves the old relationship snapshot，and `resolveGroupSenderDisplayName` reads `friendships -> group_members -> users` in RN priority order. Cold caches remain unnamed；H5 must not use sender ID as a display-name substitute.

## 45. W6.a6.18.1 Chat Text Search Contract

| contract | frozen value |
| :--- | :--- |
| RN source | `ChatSearchScreen.tsx`、`SearchComponents.tsx`、`chatSearchHelpers.ts`、`message-search-helpers.ts` |
| route | single-chat header -> `/conversations/:conversationID/search?q=<keyword>&tab=<all\|file>` -> `/conversations/:conversationID?messageID=<clientMsgID>`；未提交时保持无 query 的搜索首页 |
| canonical runtime chain | H5 route -> `WebIMSync.messages.searchCached` -> `createIMMessageSearchSync` -> `MessageRepository.search` -> current-account sql.js |
| search semantics | keyword is trimmed；SQL LIKE escapes literal `%/_`；deleted/revoked rows are excluded；final match only inspects visible message-body fields；results are newest-first |
| focus semantics | result carries only stable client message ID；chat route rereads the target and surrounding window from the same account cache before DOM focus |
| forbidden paths | page SQL/Repository/Gateway imports、remote search、WebSocket scan、history-page scan、metadata-only false positives、fake results |
| local evidence | SDK Web 52 files/164 tests；H5 38 files/126 tests；all-runtime SDK typecheck、boundary gate、`build:web` package sync、466 assets、H5 typecheck/build/verify pass |
| browser evidence | authenticated 458px search returned real cached `😎😎` and deep-link/reload restored the target；`.125` used real `123` at 760×900 to prove light/dark result、stable messageID target、back query/result restore and forward re-focus；no horizontal overflow or console warning/error |
| residual | text subset: Safari/Firefox and physical device；`.128` 已用真实稳定 messageID 关闭 RN 1600ms focus active-frame；date/media/file remain under the separate indexed contract；group-settings entry is closed by section 47 |

Local closeout: the text subset is `implemented-local/desktop-history-focus-verified/cross-browser-device-gated`, not full RN search parity. Search and focus are cache-only reads and do not trigger Gateway、WebSocket or mutation. The shared SDK is the only query owner；H5 owns route、URL search context、result presentation and DOM focus only. `.128` replaces the unavailable Web Animations API with an RN-aligned 1600ms class/timer and verifies the real target frame；`.18.2` remains a separately bounded indexed-category slice.

## 46. W6.a6.18.2 Indexed Chat Search Contract

| contract | frozen value |
| :--- | :--- |
| RN source | `ChatSearchScreen.tsx`、`indexedPages.tsx`、`chatSearchHelpers.ts`、`utils.ts`、`SearchComponents.tsx`；settings entry additionally comes from `SingleChatSettingsScreen.tsx` and `GroupSettingsScreen.tsx` |
| category entry | search home exposes 日期、图片与视频、文件；text results expose 全部、图片与视频、文件；all stay under `/conversations/:conversationID/search` |
| shared query owner | `RN openIMService/WebIMSync.messages.searchCached -> createIMMessageSearchSync -> MessageRepository.search -> current-account SQLite/sql.js` |
| date semantics | shared query accepts inclusive `afterSendTime` and exclusive `beforeSendTime`；H5 initially renders current plus previous two calendar months and can extend older months；a day links to its oldest cached message by stable client ID |
| media semantics | content types `102/104`、newest-first month grouping、全部/图片/视频 filters；safe media URL delegates to the existing chat media preview owner |
| file semantics | content type `105`、newest-first month grouping、existing message view owns name/size projection；preview reuses the existing file interaction and this slice does not start download |
| browser adaptation | RN scroll-top month extension is an explicit “加载更早月份” control；fixed-format 42-cell calendars and 3-column media grid preserve layout without viewport-font scaling；`view=date\|media\|file`、有界 `months` 和媒体 `filter` 保存可刷新 presentation 状态 |
| forbidden paths | page history scanning、page SQL/Repository/Gateway imports、new media/file preview owner、remote query、fake result、download or mutation during acceptance |
| local evidence | real sql.js lower/upper boundary test；SDK Web 52 files/165 tests；H5 39 files/129 tests；all-runtime typecheck、boundary、`build:web` sync、466 assets、production build/full verify pass |
| browser evidence | authenticated 458px file category rendered real `剑来全文.txt` and existing preview；date rendered June/July/August 2026 and returned Aug 9 to the cached target；media rendered 11 real items, video filter reduced to one and preview opened；`.126` adds 760×900 light/dark date stable-ID/back、3->4 month reload、media video-filter reload and file-route reload proof；all checked views had no horizontal overflow，clean reload added zero warning/error |
| residual | `.18.2.3` entry is closed by section 47；desktop/history/theme gate is closed；`.127` audited all 4 current conversations and all 8 media/file routes were empty without changing the two 2-message unread counters；Safari/Firefox、current non-empty sample、preview active-frame and physical device remain gated |

Local closeout: `.18.2.1` remains `done-local/acceptance-gated` and `.18.2.2` is `done-local/desktop-history-verified/cross-browser-device-gated`. The shared SDK owns reusable query/time-range/filter/pagination semantics，RN/Web production callers consume the neutral facade，and H5 owns calendar/month/filter/URL presentation only. `.18.2.3` closes the missing single/group entry through a real settings owner；`.127` proves the current non-empty media/file gate is unavailable rather than an implementation omission，while cross-browser、preview active-frame and physical-device proof remain gated.

## 47. W6.a6.18.2.3 Chat Settings Entry Contract

| contract | frozen value |
| :--- | :--- |
| RN source | `ChatDetailHeader.tsx`、`SingleChatSettingsScreen.tsx`、`GroupSettingsScreen.tsx` |
| route | both chat headers -> `/conversations/:conversationID/settings`；settings search row -> existing `/conversations/:conversationID/search`；search back -> chat route |
| data owner | settings page first reads `conversations.listCachedItems`；group projection additionally uses existing `groups.listCached/sync` and `groupMembers.listCached/sync`；no page SQL/Repository/Gateway access |
| profile reuse | single peer avatar and group member items link to existing `/contacts/users/:userID` owner；settings does not create a second profile/detail implementation |
| presentation | single title/row preserve RN “聊天设置/查看聊天记录”；group preserves “群设置/群成员/查找聊天内容” and uses cached group name/avatar/ID/member count |
| fail behavior | missing target conversation fails visibly；refresh may retain valid cache while surfacing a sync error；unsupported operations are omitted instead of rendered as fake or disabled success paths |
| excluded | mute、pin、auto-delete、clear-history、add-to-group and group-management mutations require a later frozen owner and action-specific authorization contract |
| local evidence | H5 40 files/132 tests、typecheck、466 assets、full verify and production build passed；SDK Web remained 52/165 and no SDK source change was required |
| browser evidence | authenticated 458px direct refresh rendered real single and 4-member group settings；profile/search links resolved, search returned directly to chat, document width stayed 458px and console errors were zero |
| residual | cross-browser back/forward、light/dark and desktop visual matrix；all excluded settings operations move to `.18.3` contract freeze |

Local closeout: `.18.2.3` is `done-local/acceptance-gated`. React Router remains the only page owner, shared SDK facades remain the only cache/sync owner, and no Gateway request、WebSocket listener、mutation or message send was added. RN search-entry parity is locally complete without claiming the broader settings capability set.

## 47.1 Cross-runtime Single-track Acceptance Gate

| gate | frozen decision |
| :--- | :--- |
| canonical owner | DTO/协议映射、校验、状态机、Repository/cache、sync/realtime 语义只位于 `im28-sdk/src/{core,modules,sync}`。 |
| actual consumers | RN 经 `@im28/im-sdk/rn`、Web 经 `@im28/im-sdk/web` 实际调用同一实现；编译进入 RN dist 不等于 RN 已接入。 |
| platform adapters | 只允许 SQLite/sql.js/Electron driver、transport、lifecycle、media source、navigation 与 UI projection 差异。 |
| compatibility | 客户端等价路径必须删除，或在 SDK consumer matrix 登记调用方、原因和退出条件。 |
| acceptance | `contract + behavior + proof + compatibility` 均齐全才可标记 `converged`。 |

会话设置与自动删除、消息转发/删除/编辑、群 mention 和聊天记录搜索均已完成跨端收敛：RN/Web production callers 分别委托 neutral shared facade，等价 RN Gateway/Repository/filter/state-machine 路径已删除。部分 sync/realtime 仍只证明 shared core + Web consumer 本地闭环，状态保持 `shared-core-ready` 或 `compat-debt`。历史局部证据仍有效，但不能作为整体无双轨结论。`clear-history` core 继续暂停，直到相关 sync/realtime consumer 收敛。

## 48. W6.a6.18.3 Chat Settings Capability Contract

> AXIOM: 会话设置必须按 operation 风险拆分，shared SDK 是 Gateway、当前账号 SQLite 与 realtime 收敛的唯一 owner；H5 只能投影权限、状态和明确操作，不能直接调用 transport 或用本地开关伪造服务端成功。

| capability | RN production chain | current shared status | frozen next slice / gate |
| :--- | :--- | :--- | :--- |
| setting detail | `fetchConversationSetting -> POST /v1/conversation/setting/detail -> local conversation` | `infra-only`：Gateway typed client 已有，shared conversation facade 未公开 | `.18.3.1`；严格校验 target，成功后只更新已有会话的 pin/mute 索引列 |
| conversation mute | `setConversationMessageMute -> POST /v1/conversation/mute -> local isMuted` | `runtime-chain-partial`：Gateway client + Repository column 已有，无 Web caller | `.18.3.1`；非破坏性，可本地实现；真实写入仍是 acceptance gate |
| conversation pin | `pinConversation -> POST /v1/conversation/pin -> local isPinned/pinnedAt` | `runtime-chain-partial`：Gateway client + Repository column 已有，无 Web caller | `.18.3.1`；非破坏性，可本地实现；真实写入仍是 acceptance gate |
| auto delete | `fetchConversationDetail/updateConversationAutoDelete -> POST /v1/conversation/auto-delete/update -> type1701 realtime` | `runtime-chain-partial`：typed client 已有，core setting/cache/realtime lifecycle 尚未闭合 | `.18.3.2` 独立合同；只影响设置后新消息，但属于消息生命周期 mutation，需权限和 realtime/cache 回归 |
| clear history | `deleteConversation -> POST /v1/conversation/clear -> local message clear` | `infra-only/destructive`：typed client 已有，shared 批量 cache 收敛与 route 后果未冻结 | `blocked-destructive-authorization`；必须按 `self|both|all_members` 分别证明 Gateway、SQLite、会话摘要和第二客户端行为 |
| group profile/member settings | name/avatar/introduction 已 shared；announcement、member add/remove、role/owner transfer | `partial-converged`：name/avatar/introduction 权限、校验与 success-only cache 已由 shared facade 持有 | 继续独立 group-management family；按最多三个紧密 operations 冻结其余权限、事件和 cache owner |
| group mute | group/member mute -> `/v1/group/mute/update`、`/v1/group/member/mute/update` | `infra-only`：RN 有权限投影和 realtime helper，Web shared facade 未接入 mutation | 独立 group-mute slice；群主/管理员权限、mute-until、composer disable 与 realtime 必须同时验收 |
| quit/dismiss | `/v1/group/leave`、`/v1/group/dismiss` + conversation/member cache transition | `infra-only/destructive` | `blocked-destructive-authorization`；群主退出前管理员约束、清历史选项和 route/cache 清理必须单独证明 |

`.18.3.1` 的默认运行链固定为 `ChatSettingsPage -> WebIMSync.conversations -> GatewayHTTPClient -> ConversationRepository -> runtime dataVersion -> existing list/settings projections`。Mutation 只有 Gateway resolve 后才写当前账号 SQLite；Gateway 或本地持久化失败必须保持错误可见，不得显示成功。H5 不注册第二个 WebSocket listener，远端其他端变化继续由已有 realtime conversation upsert 收敛。

Contract-freeze verdict: operation scope 为 setting detail、mute、pin 三项；状态分别为 `🟡 infra-only`、`🟡 runtime-chain-partial`、`🟡 runtime-chain-partial`。未发现 mock shortcut 或 fake-success；清空、退群、解散保持 `🔴 authorization-blocked`，其余群设置保持 `🟡 separately-bounded`。

### W6.a6.18.3.4/.3.5 Group Text Detail Parity

| dimension | frozen contract |
| :--- | :--- |
| shared data owner | `WebIMSync.groups -> WebIMJoinedGroup` 显式投影 `introduction/announcement/announcementVersion/canEditAnnouncement`；页面不得读取 raw Gateway payload |
| introduction | 群设置第二卡显示“群简介”，空副标题“请输入群的内容介绍”，详情空值“暂无群简介”；owner/admin 在同一 React Router 子页进入 500 字编辑态，普通成员只读 |
| announcement visibility | 对齐 RN，仅当前角色为 owner/admin 时在置顶/免打扰与清空记录之间显示“群公告”；空副标题“未设置” |
| announcement detail | `/conversations/:conversationID/settings/announcement` 只读真实 shared facade，空值“暂无群公告”，无编辑/发布按钮 |
| convergence | 简介与公告共用 `GroupTextDetailPage` 的会话校验、cache-first 群同步、错误和布局；字段/标题/空值由薄 page 配置 |
| authorization gate | 本切片不调用 `/v1/group/update`、不标记公告已读、不发送公告文本消息；编辑、发布和第二账号通知均需独立合同与授权 |

Local verdict: `.18.3.4/.18.3.5` 的只读范围为 `done-local/read-only-accepted`；SDK 公告投影已由 Web 消费，简介 mutation 后续由 `.18.3.10` 收敛，公告 mutation 仍需单独推进。

### W6.a6.18.3.6 Self Group Nickname

| dimension | frozen contract |
| :--- | :--- |
| identity | 调用方只传 groupID/nickname；成员身份必须来自当前认证上下文，不能指定其他 userID |
| validation | 昵称 trim 后不能为空且最多 24 字；当前成员必须已存在于目标群 cache，否则 fail-closed |
| remote/cache | 一次 `/v1/group/member/nickname/update`；仅 Gateway 成功且响应身份一致后 upsert 当前成员，失败不修改旧 SQLite 快照 |
| display | 返回值继续走 shared `备注 > 群内昵称 > 公开昵称 > im-userID后四位` resolver；H5 不复制名称优先级 |
| H5 | 群设置按 RN 顺序显示本人昵称，ConfirmModal 同语义编辑层持有草稿、取消、保存态和错误，成功 DTO 才更新页面 |
| realtime/authorization | 不猜测群昵称 realtime event、不注册第二 listener；真实保存、第二账号/list-back 需要独立授权验收 |

Local verdict: `.18.3.6` 为 `done-local/mutation-acceptance-gated`；RN 业务源码未改且编译通过，浏览器 open/cancel/layout smoke 因本工具会话无浏览器控制能力待补。

### W6.a6.18.3.7 Shared Group Card

| dimension | frozen contract |
| :--- | :--- |
| shared owner | `contacts.shareGroupCard` 单一持有目标保序去重/本人排除、真实单聊打开、type108 `body.card.group`、可选 type101 附言和消息 SQLite 状态收敛 |
| RN | `rn-frozen/not-consumed`；保留当前 `shareGroupCard` 参数、选择器、Gateway/消息编排和事件语义，本 H5 任务不得改写 |
| H5 | `/conversations/:conversationID/settings/share-group-card` 只从 URL 恢复真实群会话；对齐 RN 当前 production UI，仅好友目标、单选、无附言输入，点击分享前不执行 I/O |
| failure/navigation | shared facade 失败必须保持错误可见且不导航；成功只使用 facade 返回的真实 direct conversation ID，页面不得猜测 ID 或伪造成功 |
| acceptance gate | 未执行真实分享、附言、partial failure/retry 或第二账号 realtime/list-back；这些仍需显式 send 授权 |

Local verdict: `.18.3.7` 为 `shared-core-ready/web-consumed/rn-frozen`；H5 使用 shared Web owner，RN 保持冻结基线。认证 Chromium 已证明目标加载、搜索、单选、取消和布局，但未点击分享。

### W6.a6.18.3.8 Shared Group Profile Name

| dimension | frozen contract |
| :--- | :--- |
| shared owner | `updateIMGroupName` 单一持有当前认证账号、owner/admin 与显式 `can_edit_group_info` 权限、非空群名、Gateway 响应 groupID/title 校验、旧字段保留和 success-only `GroupRepository` upsert |
| RN | `rn-frozen/not-consumed`；当前 `updateGroupInfo`、内存 cache、Gateway/OpenIM 与事件投影保持基线 |
| H5 | `/conversations/:conversationID/settings/profile` 从 URL 恢复真实群会话和 joined-group DTO；头像只读、群名按 shared 权限开放编辑、群 ID 通过真实 clipboard port 复制；页面不调用 Gateway/SQL |
| failure | 空名、权限不足、Gateway 失败或响应目标错配必须显示错误并保持旧 cache/页面；部分响应不得清空 avatar/introduction/announcement/role/order |
| acceptance gate | 本地 sql.js/consumer/browser 证明不等于真实改名；保存、普通成员拒绝、第二账号 type1520/list-back、RN device 与跨浏览器仍需独立验收 |

Local verdict: `.18.3.8` 为 `shared-core-ready/web-consumed/rn-frozen`；认证 Chromium 已证明真实资料、编辑层打开/取消和布局，未保存群名或写 clipboard。

### W6.a6.18.3.9 Shared Group Profile Avatar

| dimension | frozen contract |
| :--- | :--- |
| shared owner | `updateIMGroupAvatar/WebIMSync.groups.updateAvatar` 单一持有 owner/admin 与显式 capability 权限、静态图片/10MB 上传输入、shared `IMMediaUploadPort`、HTTP(S) URL、Gateway groupID/avatar_url 校验、旧字段保留和 success-only `GroupRepository` upsert |
| RN | `rn-frozen/not-consumed`；现有相册/相机、裁剪、上传、更新、cache 与事件投影保持基线 |
| H5 | `/settings/profile` 的头像行只负责浏览器文件选择、JPEG/PNG/WEBP 校验、圆形拖动/1-4x 缩放和 512x512 JPEG Canvas 输出；确认后调用 shared facade，页面不获取上传凭证、不调 Gateway/SQL |
| failure/performance | 越权在上传前失败；上传失败或 Gateway 错配保持旧页面/cache；上传在 shared 写队列外完成，Gateway/SQLite 写回串行，避免大文件阻塞消息/会话 cache |
| acceptance gate | 本地图片预览/取消不等于真实上传；authorized upload/result、普通成员拒绝、第二账号 type1502/list-back、RN device camera/library 与跨浏览器触摸仍需独立验收 |

Local verdict: `.18.3.9` 为 `shared-core-ready/web-consumed/rn-frozen`；认证 Chromium 已证明真实群资料入口、本地圆形裁剪、图片解码、取消和布局，未执行上传/群资料 mutation。

### W6.a6.18.3.10 Shared Group Introduction

| dimension | frozen contract |
| :--- | :--- |
| shared owner | `updateIMGroupIntroduction/WebIMSync.groups.updateIntroduction` 单一持有 owner/admin 与显式 capability 权限、trim 后非空/500 字、Gateway groupID/description 精确回包和 success-only `GroupRepository` merge |
| RN | `rn-frozen/not-consumed`；现有简介 screen、表单错误、更新、cache 与事件投影保持基线 |
| H5 | `/settings/introduction` 复用既有 cache-first 文本详情 owner；owner/admin 显示完成/取消和 textarea，普通成员继续只读；页面只调用 shared facade，不读 raw payload/Gateway/SQL |
| empty/failure | 当前 Gateway 明确空 `description` 为保持原值，故空简介不能假清空；空值、超长、越权、Gateway 失败或响应错配必须可见失败并保持旧 cache |
| acceptance gate | 本地 sql.js/consumer/browser 打开取消不等于真实写入；真实保存、普通成员拒绝、第二账号 type1521/list-back、RN device 与跨浏览器仍需独立验收 |

Local verdict: `.18.3.10` 为 `shared-core-ready/web-consumed/rn-frozen`；H5 消费 shared Web owner，RN 保持冻结基线。认证 Chromium 仅打开编辑态并取消，没有执行 `/v1/group/update`；`build:package:desktop:web` 未修改或执行。

`.18.3.1` reviewer verdict: setting detail 已达到 `✅ implemented-local/read-verified`；mute 与 pin 达到 `🟡 implemented-local/mutation-acceptance-gated`。Shared SDK 通过 4 个真实 sql.js 用例证明详情读取、成功写入、Gateway 失败保留 cache 和响应目标不匹配 fail-closed；SDK Web 53 files/169 tests、all-runtime typecheck、boundary、`build:web` 与 H5 generated package sync 均通过。H5 40 files/132 tests、typecheck、466 assets、生产构建与 full verify 通过；认证态 458px 单聊/群聊 settings 均从真实 cache/Gateway detail 显示两个 enabled switches，无溢出和 console error。浏览器验收未点击开关，因此不声称真实 mute/pin 写入；无 mock、fake-success、页面 Gateway/Repository/SQLite caller 或第二 WebSocket listener。

### W6.a6.18.3.2 Auto-delete Contract Freeze

| operation | production truth | frozen owner / failure contract | local closeout |
| :--- | :--- | :--- | :--- |
| authoritative read | RN `fetchConversationDetail -> /v1/conversation/get` reads unwrapped `direct/group_conversation.auto_delete_seconds`；setting detail may expose the same field but is not the RN authority | shared conversation auto-delete facade calls typed `getConversation`、requires an existing current-account conversation、strictly matches the returned target and persists only validated metadata | `✅ schema v11 + real sql.js` |
| update | `updateConversationAutoDelete -> /v1/conversation/auto-delete/update`；allowed seconds are `0/21600/43200/86400/259200/604800/1296000/2592000/5184000/7776000/15552000` | shared facade validates the enum before I/O；Gateway must return the requested conversation and exact seconds before success-only SQLite convergence；failure or mismatch preserves cache | `✅ local；real mutation gated` |
| realtime convergence | Gateway writes and pushes type `1701`、`event_type=conversation_auto_delete_changed` with operator、seconds and enabled；RN renders it in single/group chat | existing realtime owner persists the message and applies the latest valid system notice to the same conversation metadata；invalid event/seconds/enabled combination changes no setting | `✅ deterministic；second account gated` |

Lifecycle AXIOM: auto-delete only affects messages sent after the server accepts the setting. Gateway owns message `expire_at`、actual expiry and later history/list-back results；SDK/H5 must not start browser timers、retroactively delete cached history、guess expiry from the current conversation setting or rewrite old message rows. Realtime type 1701 is a normal durable system message plus a conversation-setting delta, not proof that any prior message was deleted.

Permission AXIOM: direct-conversation participants may update；group entry is visible only when the existing joined-group snapshot says `owner|admin`, while Gateway remains the authoritative permission check. Unknown group role fails closed by omitting the entry. H5 uses a React Router child page, keeps selection as draft until explicit confirm, and shows success only after shared facade resolve；browser acceptance does not confirm a real update without action-time authorization.

Implementation split: `.18.3.2.1` owns core Conversation fields、schema v11、Repository、strict read/update and realtime 1701 convergence；`.18.3.2.2` owns the RN-derived options route and single/group message wording. Clear-history、local expiry scheduling and group-management mutations remain excluded.

Closeout: `getAutoDelete -> Gateway detail -> schema v11`、`setAutoDelete -> exact success-only cache`、`realtime type1701 -> durable message + latest valid setting` 三条本地链已闭合；H5 React Router 页面只呈现 RN 九档，协议有效但 RN 未展示的 15 天/2 个月保持未选中并禁用确认。SDK Web 55/174、聚焦 5/20、H5 聚焦 4/16、all-runtime typecheck/boundary、`build:web` package sync、production build 与 authenticated 458px read-only route proof 通过。无 mock/fake-success、browser timer、retroactive purge、RN caller 或 `build:package:desktop:web` 变更；真实 update、第二账号 realtime/list-back 与完整 theme/desktop matrix 仍为 acceptance gate。

### W6.a6.18.3.3 Clear-history Contract Freeze

> DESTRUCTIVE AXIOM: `/v1/conversation/clear` 返回的 `ConversationCursor.clear_before_seq` 是本地清空边界；客户端不得在 Gateway 成功前删行，不得把没有稳定身份的 type 2102 控制通知当普通消息，也不得用 `DELETE conversation_id=*` 覆盖并发到达的新消息。

| operation | production truth | frozen owner / failure contract | pre-implementation status |
| :--- | :--- | :--- | :--- |
| clear self | RN settings/list `deleteConversation(id, self) -> Gateway clear -> local message clear`；单聊暂时隐藏，群聊保留入口 | shared facade requires current-account target、stable `operation_id` and exact response target/cursor；success-only transaction advances clear boundary、clears unread/latest and removes only rows at/before the boundary plus pre-operation local-only rows | `🟡 infra-only` |
| clear direct both | RN single sheet exposes “为我和对方删除”；Gateway accepts `scope=both` only for direct participants | same facade validates direct type before I/O；response cursor converges current account，other participant relies on type 2102/re-sync；H5 returns to conversation list after success | `🟡 infra-only/destructive` |
| clear group all | RN group sheet exposes “为我和所有群成员删除” only through shared `canClearMessages`；Gateway remains authoritative | H5 uses `WebIMJoinedGroup.permissions.canClearMessages` only for presentation；unknown permission fails closed，Gateway remains authority；group conversation stays visible with empty latest/unread | `🟢 shared-permission-projection` |
| realtime control | Gateway type `2102` / `event_type=conversation_cleared` carries conversation/peer/operator context and may omit message IDs | existing realtime owner must branch before `collectGatewayMessages`，strictly resolve one current-account target and apply the same cursor/cache transition；event is not persisted as a visible chat message | `🔴 current handler rejects identity-less event` |

State contract: schema v12 adds indexed `clear_before_seq` and `list_hidden` to `Conversation`; history/full-sync/realtime reads must ignore messages at/before the persisted boundary. Clear convergence runs in the existing shared mutation queue and one database transaction: validate target/cursor -> remove eligible target rows -> set `latestMessageID=undefined`、`unreadCount=0`、`lastReadSeq>=clearBeforeSeq`、`clearBeforeSeq` and list visibility. Rows with server seq above the returned boundary are concurrent new history and must survive. Gateway failure、missing/mismatched target、invalid uint64 cursor or SQLite failure must not produce a success state.

Idempotency contract: generated OpenAPI exposes optional `operation_id`, but current handwritten `GatewayClearConversationRequest` drops it. `.18.3.3.1` must add the field and require a shared stable operation ID across transport retry；H5 must not generate a new ID after an ambiguous timeout. The response is `ConversationCursorEnvelope`, not a generic acknowledgement；an empty/mismatched state is failure for destructive convergence.

Permission/route contract: `self` is available to any cached participant；`both` only for direct conversation；`all_members` only when group permission projection resolves `can_clear_message(s)` or the RN role fallback allows owner/admin, with unknown role/permission fail-closed. Settings uses the existing RN confirmation sheet semantics and never submits on open. Direct success navigates to `/conversations`; group success keeps the group route available and renders empty history/summary after cache reread.

Excluded: `clearConversationAndDeleteAllMsg` fallback、friend-delete `clear_scope`、group leave/dismiss `clear_history`、member-history `clear_before_seq` and physical expiry deletion are separate owners. Contract trace found no H5 fake path because the row is still omitted. Shared gaps are explicit: no clear facade、no schema cursor/list-hidden fields、no atomic boundary delete、no 2102 control handler，and current realtime normalization routes 2102 into ordinary message collection where an identity-less event fails. Verdict: contract `done-read-only`；implementation may proceed with deterministic sql.js/realtime tests, but real `self|both|all_members` acceptance remains `blocked-destructive-authorization`.

## 49. W6.a5.2.15 Group-members Route Parity

| contract | RN truth | H5 implementation |
| :--- | :--- | :--- |
| entry/route | 群设置成员预览通过“全部”进入完整成员页 | `/conversations/:conversationID/settings/members` 是唯一 React Router owner；直达、返回和成员资料回跳保留群上下文 |
| data | group cache + member cache/full sync | 页面只调用 shared `groups.listCached/list` 与 `groupMembers.listCached/sync`，不直连 Gateway、SQLite 或 WebSocket |
| identity | `备注 > 群内昵称 > 公开昵称 > im-userID后四位` | 设置预览与完整列表统一调用 SDK `resolveIMGroupMemberDisplayName`，不建立 H5-only 优先级 |
| presentation | 搜索、拼音分组/索引、群主/管理员标签、成员资料入口 | H5 仅拥有 DOM/CSS、搜索状态、索引滚动和 pull-refresh 手势；资料继续复用 `/contacts/users/:userID` |

Closeout verdict: `done-local/read-only-accepted`。H5 focused 4 files/15 tests、typecheck、production build 与 full verify 通过；认证态真实群渲染 4 名成员和群主标签，名称搜索、成员资料返回、567x786/390x844 无横向溢出且 console 为零。未修改 SDK/RN source，未执行 presence、好友申请、成员邀请/移除或其他群管理 mutation；large-group、offline、physical-touch 和 Safari/Firefox 保持验收门。

## 50. W6.a5.2.1.5.3.2.2 Web LiveKit Runtime Contract

| owner | frozen responsibility |
| :--- | :--- |
| shared control | `createIMCallControlSync` 单一持有 start/cancel/hangup/token refresh、稳定 ID、凭据校验和 E2EE fail-closed；RN/Web 不复制 Gateway body 或 token 规则。 |
| SDK Web media | `createWebIMCallMediaSession` 持有稳定状态，`createLiveKitCallMediaPort` 只适配真实 Room/track/device event，`createWebIMOutgoingCall` 持有首次失败 cancel、接通后 hangup、重试和 cleanup。 |
| H5 application | `WebIMCallProvider` 持有单实例内存生命周期；`/calls/active` 只绑定 DOM、React Router 和可见错误。token 不进入 Context、route、storage、SQLite 或日志。 |
| platform boundary | LiveKit 只存在于 SDK `/web` 与 H5 runtime dependency；RN native room 不变，Desktop 后续使用独立 adapter。 |

Route refresh/deep-link 没有内存 token 时必须回到 `/calls`，不得恢复假通话。好友关系与真实 conversation ID 同时成立才开放详情动作。浏览器引擎在用户明确呼出且 Gateway start 成功后的 media `connect()` 动态加载，`index.html` 不得预加载 RTC chunk；首次媒体失败取消已创建 call，远端成员曾进入后结束走 hangup，route/logout/unmount 必须释放 Room、track 和 listener。真实双账号 start/connect/hangup、permission prompt、弱网 reconnect、token expiry 和 terminal list-back 仍需显式授权验收；incoming call、ringtone 和系统级后台唤醒是后续独立切片。

Closeout verdict: `done-local/call-acceptance-gated`。SDK media 4 files/20 tests，通话与 realtime 聚焦 8 files/39 tests，all-runtime typecheck/boundary、`build:web` package sync、H5 typecheck/production build 均通过；认证 Chromium 仅只读验证详情三动作与 active-route guard，新标签冷启动认证 guard 无 console error；未点击呼出、未请求媒体权限、未连接 Room。RN/Desktop 入口与 `build:package:desktop:web` 未修改。

## 51. W6.a5.2.1.5.4 Contact Action Menu Contract

| action | shared/platform owner | H5 responsibility |
| :--- | :--- | :--- |
| 发消息 | `peerProfile.openConversation` 创建或复用 canonical direct conversation | 300ms 长按菜单、关闭气泡并导航真实 conversation ID |
| 音视频通话 | direct conversation facade + shared call control + SDK Web LiveKit port | 二次选择 audio/video，随后交给唯一 `WebIMCallProvider` |
| 分享好友名片 | `contacts.shareUserCard` 校验/过滤目标并执行 Gateway operation | 懒加载 `/contacts/users/:userID/share`，只列好友、单选并在“分享”后调用 |
| 删除好友 | `contacts.deleteFriend` success-only Gateway + SQLite transaction | 显示 RN `self|both` 二次确认，成功后移除当前页面行 |

菜单定位固定复用 RN 168x224、8px margin、12px gap，支持 300ms pointer/touch、8px 移动取消和 context menu；长按后的合成 click 必须被消费。名片 route state 只允许 userID/displayName/avatarURL，URL 与 state 用户不匹配或刷新丢失时回到资料页，不恢复假选择。任何选择层打开都不得触发 Gateway；只有用户点击发消息、选择具体媒体类型、点击分享或确认删除范围后才进入真实 owner。

Closeout verdict: `done-local/mutation-acceptance-gated`。通讯录 9 files/34 tests、Web typecheck 与 production build 通过；认证 Chromium 真实 7 联系人页面只读展示四项菜单且 URL 保持 `/contacts`。未点击任何动作，未创建会话、未分享名片、未删除好友、未发起呼叫或请求媒体权限；这些结果和 physical touch/Safari/Firefox 仍需独立授权验收。SDK source 和生成包未因本切片修改。

## 54. W6.a3.2 Archived Conversation Route Parity

| contract | canonical owner | client responsibility |
| :--- | :--- | :--- |
| full archived snapshot | SDK `createIMConversationArchiveSync` | RN/Web 注入账号数据库；RN 可补齐平台资料，客户端不得复制分页/DTO/SQLite 状态机 |
| cache separation | SDK `ConversationRepository.replaceUnarchived/reconcileArchivedSnapshot` | 普通列表读取 `archived:false`，归档列表读取 `archived:true`；不得用 `listHidden` 代替 archive |
| H5 route | React Router `/conversations/archived` | 主列表只在真实归档 cache 非空时显示通栏；归档页 cache-first、30-row SQLite pagination、本地搜索和 top-only pull refresh |
| actions | shared conversation list/clear facade | 长按菜单只做 presentation；取消归档成功后重读 cache，最后一条消失则返回主列表；删除仍走独立 clear contract |
| failure | shared sync rejection + existing cache | 任一远端分页/映射/持久化失败保留已渲染 cache，不制造空成功；完整成功空快照才允许清理 archive index |

Closeout verdict: `done-local/mutation-acceptance-gated`。RN 原私有 archive pager/replacer 已退出，`openIMService` 通过薄 composition 调用 SDK；普通会话同步不再删除归档行，历史 RN `isArchived + listHidden` 数据在 shared 路径兼容读取后清理。H5 真实账号在 567x786 显示 `donk三大爷` 归档行和主列表通栏，480px surface 无横向溢出且零 console warning/error。SDK all-runtime、build:rn/build:web、12/12，RN tsc/2，H5 70 files/273 tests、466 assets和 production build 通过。未执行取消归档/删除等 mutation；第二账号 list-back、physical touch 与跨浏览器仍为显式验收门。

## 52. W6.a5.2.1.5.5 Contact Profile Action Convergence

| capability | canonical owner | RN/Web consumer rule |
| :--- | :--- | :--- |
| remark/star | `IMContactActionsSync.updateFriendRemark/updateFriendStar` | Gateway 成功后字段级合并 friendship raw；部分响应必须保留用户昵称头像，失败不得改 cache/UI success |
| blacklist | `IMContactActionsSync.setBlacklist` | 空目标/本人 fail before I/O；RN 和资料页仅投影确认与结果，不再保留 app Gateway helper |
| common groups | `IMContactActionsSync.listCommonGroups` | 完整 token 分页、重复 token fail、按 group ID 去重、全部成功后增量 upsert group cache；不得 replace 我的群聊 |
| profile navigation | H5 React Router + existing peer/conversation facades | `/groups` 打开群聊前必须从当前账号 conversation 集合验证真实主键，禁止 `groupID => conversationID` 猜测 |
| UI actions | H5 profile presentation + global call owner | 三项快捷动作、发消息、备注/签名、添加时间、共同群/分享、更多黑名单/删除；sheet/dialog 打开不产生 mutation |

RN 生产 `openIMService` 已删除 `updateGatewayFriendRemark/updateGatewayFriendStar/addGatewayBlacklist/removeGatewayBlacklist/fetchGatewayCommonGroups` 直连，保留既有 RN snapshot、friendship event、DTO 映射和共同群失败时空列表兼容语义。SDK sql.js 10/10 覆盖 success-only cache、失败保留、目标 guard、分页去重与增量 group cache；RN focused composition test/tsc、H5 contacts 10 files/37 tests、typecheck/build 通过。认证 Chromium 真实好友资料显示 3 个共同群，备注/更多层与共同群路由冷重载均无新增 error；未执行真实写入、conversation creation、RTC 或媒体权限。

Residual contract: RN 资料页“来源”字段当前没有 `WebIMPeerProfile`/shared DTO，H5 不得伪造；presence、群成员受限资料、incoming call/ringtone、真实 mutation/list-back 与跨浏览器明暗矩阵继续独立验收。`build:package:desktop:web` 未修改或执行。

## 52.2 W6.a6.18.3.13.2 Shared Group Member Removal

> PROCESS AXIOM: Web 一次用户确认只能产生一次远端成员移除；远端成功后的 SQLite 或全量刷新失败是 partial success。RN 保持现有冻结实现，本合同不授权修改其 Gateway/OpenIM 行为。

| contract | frozen owner and behavior |
| :--- | :--- |
| preflight | SDK 统一 trim/stable-ID 去重、空集合/本人/群主拒绝；owner 可移除普通成员与管理员，admin 只可移除普通成员；显式 permission 缺失字段 fail-closed |
| mutation | `removeIMGroupMembers` 唯一调用 `GatewayHTTPClient.removeGroupMember`；响应群身份错配或本地事务失败输出 `remote-only`，不会尝试第二 transport |
| cache | Gateway 成功后 Group memberCount 与目标 `group_members` 删除在同一事务提交；随后独立全量 sync 校准权威成员集合与人数；失败保留当前可用快照 |
| RN consumer | `rn-frozen/not-consumed`；`openIMService.kickGroupMembers`、`imClientAdapter` 与 app Gateway helper 保持当前基线，本 H5 任务不得改写 |
| H5 consumer | `/conversations/:conversationID/settings/members/remove` 复用 shared permission、候选过滤和名称 resolver；页面只持有 cache-first 读取、搜索、选择、确认、错误与导航；`remote-only` 禁用重复提交 |

Closeout scope: 自动化覆盖 Web 权限拒绝零远端写、Gateway 失败旧 cache 保留、远端成功/刷新失败不重放、响应错配 partial state；H5 consumer regression 通过后标记 `shared-core-ready/web-consumed/rn-frozen`。RN 只做源码零差异和生成包兼容检查；真实最终确认、第二账号成员列表/realtime 与服务端拒绝样本仍是显式 destructive acceptance gate。`build:package:desktop:web` 未修改或执行。

## 52.1 W6.a6.18.3.11 Shared Group Announcement Convergence

> PROCESS AXIOM: 群公告是“群资料版本更新 + 公告文本消息 + 当前账号版本已读”的有序复合能力；任一客户端不得把三个动作拆成自己的业务实现，也不得在 status 缺失或失败时伪造已读。

| contract | frozen owner and behavior |
| :--- | :--- |
| input and permission | shared SDK 统一非空 trim/1000；显式 `user_permission.can_edit_announcement` 优先，旧快照仅 owner 回退；H5/RN 表单只做同约束预检 |
| publication | `publishIMGroupAnnouncement` 严格执行 `/group/update -> local group projection -> existing text send facade`；文本固定 `群公告\n正文`；公告更新成功但消息失败抛出可识别、可重试的部分成功错误，不伪回滚远端公告 |
| cache | Gateway 必须回同 group ID、正文和非空 `announcement_version` 才字段级合并已有 Group；权限、排序和其他资料保留，发布者当前版本记为已读 |
| read version | status 必须显式返回布尔 `is_read`；mark 只提交页面实际展示的非空版本并随后复查权威 status，旧版本不得清除服务器新版本未读 |
| realtime | shared realtime 在普通 type1519 消息落库后解析 `group_announcement_changed` 结构化字段，只更新已存在群 cache；本人操作者已读、其他账号未读、同版本重复投递保持已读 |
| consumers | RN composition 只注入当前 Nitro DB、Gateway、既有文本发送与内存事件投影；Web `groups` facade 复用同一 mutation queue/消息状态机；H5 只持有 React Router 表单、确认层、两行横幅和查看导航 |

Closeout: SDK Web 73 files/290 tests，其中公告发布/已读/realtime real sql.js 8/8；all-runtime typecheck/boundary、`build:rn`、`build:web` 通过。RN TypeScript 和公告页/群详情/openIMService 146/146 通过；H5 full verify、466 assets、748-module production build 通过。认证 567px Chromium 验证真实 owner 群的强制只读详情、编辑态和发布前确认，确认层已取消且无横向溢出。没有执行公告更新、文本发送、read mark 或第二账号 type1519/list-back；历史启动期未登录日志不归因于公告路由。Verdict: `converged/local-mutation-acceptance-gated`。`build:package:desktop:web` 未修改或执行。

## 53. W6.a5.2.1.5.7 Incoming Call And Ringtone Contract

> PROCESS AXIOM: type `1601..1608` 是不占会话 seq 的个人 RTC 过程通知；它们不得作为聊天消息持久化，也不得用通话记录 summary 反推一个正在响铃的来电。活动来电只接受 shared strict parser 输出或 Gateway pending 权威结果。

| contract | RN/Gateway truth | frozen shared/Web owner |
| :--- | :--- | :--- |
| process signal | RN 同时消费 Gateway system notice 和历史 custom wrapper；多设备可能收到相同 `event_id` | SDK `parseIMCallRealtimeSignal/normalizeIMCallRealtimeSignals` 单一解析 type1601..1608、system/custom、字段别名、audio/voice 与 event ID；缺 `call_id/call_type/room_name` 或未知事件 fail-closed |
| terminal record | reject/cancel/hangup/ended/missed/failed/summary 最终进入 call record | 宽松 `normalizeIMCallTerminalSignals -> convergeTerminalSignals` 保持独立，可凭 call ID/detail 补齐；不得作为 ringing source |
| pending restore | RN mount 与 AppState active 调 Gateway pending，恢复仍有效的来电 | Web restore/reconnect/visibility 回前台只调用 `calls.getPending()`；空、过期、本人呼出或身份不完整结果不产生 incoming UI |
| lifecycle | invite -> incoming ringing；accept/answer -> connecting/active；reject/cancel/hangup/ended/timeout -> terminal cleanup | shared 层下一片持有 call ID、event dedupe/order 与单活动通话 transition；Web Provider 只投影 modal/banner/route，不能维护第二套协议 switch |
| ringtone | RN native `rtcToneService` 循环来电音并在任一终态停止 | Web-only audio adapter 复用镜像音频并负责 play/loop/stop；浏览器 autoplay 拒绝必须显示可操作的“恢复声音”状态，不能报告已播放；铃声失败不得阻止接听/拒绝 UI |
| answer/reject | reject 不请求媒体；answer 先走 shared control，再把短期 credential 交平台媒体 session | H5 只在用户明确点击时调用；answer 才允许请求麦克风/摄像头，失败可见并执行服务端/媒体补偿；token 不进入 Context、route、storage、SQLite 或日志 |
| route/cleanup | RN 在 active chat 可用 banner，其他场景全局来电层；终态统一停止铃声并释放 room/track/listener | H5 全局 owner 不依赖当前页面；route/logout/unmount/账号切换清理 UI/audio/media，页面刷新只可通过 pending 重新验证，不能恢复内存 token |

Contract trace verdict: shared strict process parser 已由 RN 生产 `parseRTCServerCallSignal` 实际消费；`incoming-call-lifecycle.ts` 持有 event/call 去重、同 call accept/终态清理、终态先到防复活、有界集合与 Gateway pending 校验，Web runtime 实际订阅过程通知并发布无 token 的 `incomingCall` snapshot，登录/restore/reconnect/visibility 前台恢复 pending，账号切换/退出清空身份。H5 全局 Provider 已投影 RN 同语义 banner/fullscreen/可拖动 floating、shared 资料补齐、铃声/autoplay 恢复与 active route；SDK Web incoming orchestrator 保证 reject 不创建媒体，answer 成功后才创建 LiveKit session，远端终态只释放媒体且不回发 hangup，幂等 cleanup 且 token 不进入 React state/cache。SDK all-runtime typecheck/boundary、incoming/runtime 22/22 and final 15/15、build:web；H5 typecheck、UI/tone 6/6、build 和认证浏览器冷启动零遮罩/零 console smoke 已通过，状态为 `done-local/real-call-acceptance-gated`。真实双账号 invite/answer/reject/timeout、铃声、后台/多 tab 和媒体权限继续需要显式授权；本切片未执行任何呼叫、接听、声音播放或权限请求。

## 55. W6.a6.18.3.15 Text Message Broadcast Contract

> PROCESS AXIOM: 一次群发提交只能产生一次 batch-send；顶层成功不代表每个目标成功，客户端必须按稳定 `client_msg_id` 保留逐目标 sent/failed/unknown，不能重放整批掩盖 partial result。

| contract | canonical owner and behavior |
| :--- | :--- |
| target | shared SDK 统一 1–50、`friend|group + targetID` trim/保序去重；H5 Router 只保存稳定身份，不保存 DTO、会话猜测或媒体对象 |
| idempotency | SDK 为整批和每个目标创建或复用稳定 ID；同一 submit 只调用一次 `batchSendMessage`；网络或本地收敛后客户端不得自动二次提交 |
| result | 只按 `client_msg_id` 关联逐项回包；缺项是 `unknown`，明确非零码是 `failed`，code=0 是 `sent`；不信任顶层 success/failed count |
| cache | 只有明确成功、canonical message identity 与真实 friend/group conversation 匹配时，才在一个事务写消息和 latest conversation；缺消息/身份或本地失败返回 `remote-only` |
| H5 | 会话/通讯录复用 `HomeActionMenu`；`/broadcast/select` cache-first 读取好友/群并提供搜索/全选/50 上限；`/broadcast/compose` 只持有文本草稿和逐目标结果反馈 |
| RN | `BroadcastMessageFlow/BroadcastTargetSelectScreen/BroadcastComposeScreen` 保持冻结参考；本 H5 切片不修改或宣称 RN consumer convergence |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen`。SDK real sql.js 覆盖目标归一化、partial/missing result、success-only cache 和权威 conversation fallback；H5 route/view 4/4、typecheck/build 通过。认证 Chromium 412x786 以真实 2 好友完成选择、进入 compose、空/非空按钮状态和退出，`scrollWidth=innerWidth` 且零 console warning/error。没有点击发送、没有修改远端或账号数据；媒体群发与二维码扫描不在本合同内。

## 56. W6.a6.18.3.15.1 Image Video File Broadcast Contract

> PROCESS AXIOM: 一个媒体群发批次只能上传一个远端对象并执行一次 batch-send；不得循环调用普通单会话 send，也不得在页面复制 OSS 或 Gateway body。

| contract | canonical owner and behavior |
| :--- | :--- |
| shared media | `prepareWebIMImageUpload/prepareWebIMVideoUpload/prepareWebIMFileUpload` 同时服务普通聊天和群发，统一 MIME、大小、时长、尺寸、文件元数据和 OSS snapshot/body |
| ordering | 目标/账号先校验；上传在 mutation queue 外执行；上传完成后二次确认同一账号，再在共享队列内执行唯一 batch-send 和 success-only cache convergence |
| failure | 上传失败不得调用 Gateway；缺 upload adapter 显式失败；切号显式 `BROADCAST_ACCOUNT_CHANGED`；远端 partial result 延续文本群发 sent/failed/unknown，不自动重放 |
| H5 | compose 复用聊天附件校验和 video metadata reader，只持有浏览器 `File`、隐藏 input、RN 资产图标与页面生命周期 object URL；结果继续展示逐目标计数 |
| RN | 现有 Broadcast flow 保持冻结参考；shared-core 可编译不等于 RN production caller 已收敛 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen`。SDK 定向 6/6 与全量 82 files/334 tests 通过；H5 466 assets、typecheck、796-module build 通过。认证 Chromium 412x786 只读证明图片/视频/文件入口、412/412 零溢出和零 console error。没有选择本地文件、上传或发送；语音群发和二维码扫描保持后续独立切片。

## 57. W6.a6.18.3.15.2 Voice Broadcast Contract

> PROCESS AXIOM: 群发语音必须与普通聊天共用 audio upload/body 和浏览器 recorder/gesture owner；页面不得单独维护 MediaRecorder、时长门槛或 OSS 分支。

| contract | canonical owner and behavior |
| :--- | :--- |
| shared audio | `prepareWebIMAudioUpload` 统一 audio MIME、精确 size、RN 四舍五入和 1–60 秒；普通发送与群发构造相同 type103 body |
| Web recorder | `chat-voice-recorder` 唯一管理 getUserMedia/MediaRecorder/chunk/File/track cleanup；`useChatVoiceRecorder` 唯一管理 permission-await、2 秒门槛、60 秒 auto-send 和 unmount cancel |
| gesture | `ChatVoiceInput` 唯一管理 text/voice 切换、pointer capture、上滑 56px 取消、HUD 和组件 CSS；聊天页与群发页共同消费 |
| mutation | 群发仍为 upload once + batch-send once + sent/failed/unknown + success-only cache；H5 不持有 OSS/Gateway 或本地数据库写入 |
| RN | RN Broadcast 和 audio service 保持冻结参考；未宣称 production caller converged |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen`。SDK voice 定向 9/9、全量 82 files/335 tests、build:web/sync:web 通过；H5 recorder 6/6、466 assets、typecheck、797-module build 通过。认证 412x786 只读切换到“按住说话”，未 pointer-down、未请求麦克风、未录音上传发送。

## 58. W6.a6.18.3.16 QR Scanner Platform Contract

> PROCESS AXIOM: 二维码解码是平台 I/O，用户/群目标识别与入群申请是 shared 业务；H5 不得复制协议、直调 OpenAPI，页面加载不得自动请求摄像头权限。

| contract | canonical owner and behavior |
| :--- | :--- |
| payload | SDK `modules/qr-code` 统一 myCard/groupCard JSON、im28 user/group URL 与 legacy user JSON；未知 source、类型错配、空 ID、畸形编码 fail-closed |
| browser decode | H5 route 动态加载 `@zxing/browser`；摄像头只在明确点击后请求，图片只来自原生 file input；首次结果、停止、返回、异常与迟到权限结果均释放媒体轨道/object URL |
| user route | 用户码进入既有 peer profile；若为陌生人，好友申请 route 将 `sourceType=qrcode` 传给 shared `applyFriend`，页面不另建用户 DTO 或申请 mutation |
| group route | 陌生群必须用 `/v1/group/public/get` 读取公开资料、membership/application status；`groupApplications.apply` 统一 group ID/message/source validation 并调用一次真实 apply endpoint |
| RN | RN qr helper、NativeModule camera/album 和页面 flow 保持冻结；shared-core 可编译不代表 RN production caller 已收敛 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen`。SDK focused 9/9、Web 全量 82 files/337 tests、build:web/sync:web 通过；H5 focused 7/7、typecheck、1031-module build 通过。认证 Chromium 412x786 只读证明首页入口、扫码首屏和零溢出；未点击开始扫码/相册，未识别真实二维码，未提交好友或群申请。一个历史群 ID 通过真实 public/get 返回“资源不存在”，页面未生成假资料或假成功。

## 59. W6.a6.18.3.17 Personal QR Code Display Contract

> PROCESS AXIOM: 用户二维码 payload 是 shared 业务协议，Canvas、文件下载和系统分享是 Web 平台 I/O；H5 页面不得自组用户码、缓存另一份资料或在渲染失败后导出空图。

| contract | canonical owner and behavior |
| :--- | :--- |
| identity | `WebIMSync.profile.getCurrent` 提供当前认证用户真实资料，昵称按 `nickname -> im-userID后四位` 回退；Router state 仅恢复 `/me`、`/me/profile`、`/scan` 三个白名单入口 |
| payload | 页面只调用 SDK `buildIM28UserQRCodePayload(userID)`；myCard/version/source/ID 结构不在 H5 复制 |
| render | H5 `qrcode` Canvas adapter 使用 `H` 纠错等级和稳定白边，在中心绘制头像首字 fallback；Canvas 同时是页面、下载和分享的唯一图像 owner |
| export | 仅在资料加载和 Canvas 渲染完成后开放 PNG 下载与文件 Web Share；浏览器不支持文件分享时 fail-visible，不伪造成功态 |
| RN | RN `MyQRCodeScreen/qrCodeHelpers` 保持冻结参考；本切片不修改 RN caller、payload 或展示逻辑 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen`。H5 focused 5/5、full verify 通过，其中 SDK Web 82 files/337 tests、466 assets、typecheck、1064-module production build 均为 green。认证 Chromium 在 412x786 与 1280x800 证明三入口、完整二维码和零横向溢出；未点击下载/系统分享，未请求相机/相册，RN worktree clean。

## 60. W6.a6.18.3.18 Group QR Code Display Contract

> PROCESS AXIOM: 已加入群二维码必须绑定当前账号真实群会话与群快照；route group/conversation ID 不能自行成为群资料。个人和群二维码的 Web Canvas/导出/分享必须只有一个 owner。

| contract | canonical owner and behavior |
| :--- | :--- |
| source | `loadGroupProfileSource` 复用 `WebIMSync.conversations/groups`，先投影缓存再刷新；只接受 group conversation，群 ID 必须来自 conversation target 并精确匹配 shared 群快照 |
| route | RN 群资料层级映射为 `/conversations/:conversationID/settings/profile -> /settings/qrcode`；扫码页只接受同一会话二维码 route 作为受控返回来源 |
| payload | 群页只调用 SDK `buildIM28GroupQRCodePayload(groupID)`；groupCard/source/payload JSON 不在 H5 重组 |
| Web platform | `QRCodeDisplay` 与 `browser-qr-image` 同时服务个人/群码；共享 Canvas、H 纠错、头像 fallback、PNG、Web Share 和 late-render cleanup，不建立两套 export lifecycle |
| fail-closed | 单聊、缺失会话、缺失群快照均显示真实错误，不生成 route-only 假二维码；已有 cache 但刷新失败可继续展示 cache 并显示错误 |
| RN | RN `GroupEditScreen/QRCodeActionSheet/qrCodeHelpers` 保持冻结参考；本切片不修改 RN 业务、分享或发送语义 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen`。原实现 H5 focused 5 files/13 tests，full verify 中 SDK Web 82 files/337 tests、466 assets、typecheck、1067-module production build 均通过。`.20.139` 已用真实 canonical conversation 恢复 `donk的群聊 / 97524759106`，412px 证明 Canvas 268x268、群身份一致、零溢出与返回群资料闭环；旧 `joined groups 为空` 自然数据门禁关闭。下载、Web Share、扫码、应用内发送与 mutation 仍未执行。

## 61. W6.a6.18.3.19 QR Code In-App Share Contract

> PROCESS AXIOM: “分享二维码”是发送图片到应用内好友/群的业务动作，不能由 Web Share 替代；目标加载、目标投影、真实会话解析和图片发送必须复用既有 owners，路由不得保存 Blob、消息正文或凭据。

| gate | frozen contract |
| :--- | :--- |
| source | 个人码从 `profile.getCurrent + buildIM28UserQRCodePayload` 重建；群码从严格匹配的 `loadGroupProfileSource + buildIM28GroupQRCodePayload` 重建 |
| target | `forward-target-source` 统一普通转发和二维码分享的 cache-first 好友/群读取、展示投影和真实 conversation 解析；二维码 UI 对齐 RN `cardShare` 跨好友/群聊多选，H5 多选模式提供当前筛选范围 ALL |
| send | 最终确认后才在内存 Canvas 生成 320x320 PNG，并且只调用 `WebIMSync.messages.sendImage`；上传/body/optimistic/SQLite/Gateway 继续由 SDK 持有 |
| routing | `/me/qrcode/share` 与 `/conversations/:conversationID/settings/qrcode/share` 可刷新恢复公开来源；不携带 File/Blob、消息 body、token 或 route-only 群资料 |
| failure | 来源、目标会话、Canvas、上传或消息发送任一失败均停留当前页可见报错；成功前不导航、不显示假成功、不制造约定式群会话 ID |
| boundary | RN 业务零修改；SDK 已有图片发送满足合同，本切片无新 SDK 路径；真实发送、第二账号 realtime/list-back 需独立授权 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen`。原实现 H5 focused 6 files/13 tests，full verify 中 SDK Web 82 files/337 tests、466 assets、typecheck、1070-module production build 均通过。`.20.141` 已从真实群二维码加载 2 好友+2 群聊，群 ALL=2、跨 Tab 保留、好友 ALL 后累计 4，412px 零溢出并取消返回原二维码；旧“单选/群 tab 空”状态关闭。未点击最终分享，未生成/上传 PNG、batch-send 或制造成功态。

## 62. W6.a6.20.1 Forgot Password Methods Contract

> PROCESS AXIOM: Gateway 忘记密码端点下线后，Web 必须复刻 RN 的替代登录方式，不得继续调用旧端点，也不得用“接口不存在”错误文案代替用户可执行的找回路径。

| gate | frozen contract |
| :--- | :--- |
| entry | 仅账号密码登录页显示“忘记密码？”；点击打开原生 modal bottom sheet，不发送网络请求 |
| methods | “手机号登录”进入 `/auth/phone`，“邮箱登录”进入 `/auth/email`；切路由前必须关闭 sheet，route mode 更新再兜底清理 |
| support | 未绑定手机/邮箱时只显示 RN 同文案客服说明；没有真实客服 endpoint 时不制造 ticket、发送或成功态 |
| API | 禁止调用 `forgotPassword` 或已删除 OpenAPI；登录、登录后密码修改继续使用各自既有 owners |
| platform exclusion | RN 网络设置使用原生 HTTP/OpenIM HTTP/SOCKS proxy；浏览器 `fetch/WebSocket` 无等价 per-app proxy 注入，H5 不实现保存后无效的假设置；Electron/Desktop 另建 platform adapter |

Closeout verdict: `done-local/rn-parity`。H5 focused 2 files/6 tests，full verify 中 SDK Web 82 files/337 tests、466 assets、typecheck、1071-module production build 均通过。认证 Chromium 412px 完成手机号、邮箱、客服三分支、单 modal、route cleanup 与零横向溢出；退出当前账号后已使用 `15555555551/666666` 恢复 donk。未请求验证码、修改密码、提交客服或改动 RN。

## 63. W6.a6.20.2 Chat Composer Card Send Contract

> PROCESS AXIOM: 联系人资料页“把某张名片分享给好友”和聊天附件“把所选名片发送到当前会话”不是同一 target contract；两者可共用 type108 wire schema，但不得共用含糊的页面编排或绕过 message state owner。

| layer | contract |
| :--- | :--- |
| SDK message facade | `messages.sendCard({ conversationID, card })` 只接受 `user(userID/nickname/avatarURL)` 或 `group(groupID/groupName/avatarURL)`，空稳定 ID 在任何 optimistic/network I/O 前拒绝 |
| state/cache | 复用统一 `executeWebIMMessageSend`，先落同一 `sending` 行，再按 Gateway 相同 client ID 收敛 `sent`；失败更新同一行为 `failed`，type108 可从严格持久化 payload 重试 |
| forward compatibility | 失败重试支持 type108 不自动扩大隐藏发送人转发矩阵；hidden-sender 继续在 optimistic/network 前拒绝卡片，普通 server-backed forward 行为不变 |
| H5 selector | 复用 `contacts/groups` cache-first source；单聊排除本人和当前对端，群聊排除本人；tab/search/single-select 只保存稳定目标 key，不携带 Gateway body |
| page caller | `ChatPage` 只传平台中立 card 并通过统一 operation owner 重读当前会话 SQLite；成功才关闭弹层，失败保留选择和可见错误 |
| RN boundary | RN `ChatComposerPanels/CardPickerModal/sendCardMessage` 仅作为行为参考并保持冻结；本切片不改 RN source、测试或生成包 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen`。SDK focused 3 files/11 tests、Web full 83 files/340 tests；H5 focused 2 files/5 tests、466 assets、typecheck 与 1074-module production build 通过。认证 Chromium 412px 证明真实好友过滤、用户/群切换、单选门禁和 412/412 零溢出；弹层重开先清空上一账号内存快照。`.20.142` 又以两个真实 joined groups 证明第二次选择替换第一次、selected 始终为 1、CTA enabled 与取消返回。最终发送未点击，第二账号 realtime/list-back 与真实失败重试仍为授权验收门。

## 64. W6.a6.20.3 Chat Composer Camera And RTC Entry Contract

> PROCESS AXIOM: Web 拍照和通话入口只能组合既有 platform/shared owners；附件面板不得复制图片上传、通话鉴权、信令或 LiveKit 状态机。

| layer | contract |
| :--- | :--- |
| RN parity | 单聊 action 固定 `相册 -> 拍照 -> 音视频通话 -> 文件 -> 名片`；群聊固定隐藏 RTC，其余动作保持原顺序 |
| camera platform | 独立隐藏 input 使用 `type=file + accept=image/* + capture=environment + single`；取消不报错，结果进入既有 `validateChatAlbumSelection -> sendAlbum -> messages.sendImage` |
| call selector | 联系人和聊天共同消费 `CallTypeActionSheet`；只提供 audio/video/cancel，无 Gateway、token、conversation 创建或媒体逻辑 |
| chat caller | 仅真实 `Conversation.type=single` 可打开 RTC；以 `conversationID/name/faceURL` 调用全局 `WebIMCallProvider.startOutgoing`，页面不得拼接会话 ID或直接消费 SDK call control |
| route lifecycle | 切换 conversation 时清除 card/call selector state；呼出开始后由全局 Provider 接管 `/calls/active` 与结束返回 |
| external gate | camera chooser/permission、图片上传发送、audio/video final selection、Gateway/LiveKit、双账号 RTC 和真实群聊视觉均未授权，不得从只读证据推断成功 |
| RN boundary | RN `ComposerActionPanel/useChatMediaPicker/ChatRTCCallActionSheet` 只读参考且保持冻结；本切片无 SDK 或 RN source 修改 |

Closeout verdict: `done-local/shared-owner-consumed`。H5 focused 3 files/10 tests、typecheck 和 full verify 通过；full verify 包含 SDK Web 83 files/340 tests、466 assets 与 1078-module production build。认证 Chromium 412x820 证明单聊五动作顺序、camera DOM contract、通话二选一/取消、412/412 零溢出和零 console warning/error；未打开 chooser、请求权限、上传、发送或发起通话，RN worktree clean。

## 65. W6.a6.20.4 Chat Composer Pending Attachment Contract

> PROCESS AXIOM: 浏览器 File 选择是平台瞬时状态，媒体/文件/文本的组合提交顺序是共享业务语义；H5 不得因回调分散而越过失败步骤继续发送后续文本。

| layer | contract |
| :--- | :--- |
| shared plan | SDK `shouldStageIMComposerMedia` 仅在已有草稿且单选媒体时返回待发送；`createIMComposerSubmissionPlan` 拒绝编辑态附件并固定 `media -> file -> text` 顺序 |
| platform state | H5 hook 只保存当前页面生命周期的 `File/ChatAlbumSelectionItem`；普通文件始终待显式发送，单媒体按 shared 判定，多媒体继续沿既有立即顺序发送 |
| file presentation | 文件栏只展示浏览器可确认的名称、音频/文件类别、大小与移除动作；图片/视频不新增 RN 不存在的顶部缩略图 |
| operation | 组合提交在一个 `runMessageOperation` 中复用既有 image/video/file/text/mention/quote facade；任一步骤 reject 后立即停止，最终统一重读 SQLite cache |
| lifecycle | 用户点击提交时先清空 pending 与有效文本草稿，失败由既有 failed message/cache 状态呈现；File/Blob 不进入 Router、token storage 或 SQLite |
| RN boundary | RN `useChatMediaPicker/useChatComposerSendActions/chatDetailComposerHelpers` 只读参考并保持冻结；本切片只 build/sync Web package，不重建 RN package |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen`。SDK focused 3/3，H5 focused 3 files/10 tests；full verify 包含 SDK Web 84 files/343 tests、466 assets、typecheck 与 1081-module production build。认证 in-app browser 412x820 只选择仓库内 `package.json`，证明待发送栏、发送门禁、移除恢复、412/412 零溢出与零 console error；未点击发送、上传或产生消息 mutation。真实带草稿单媒体/文件组合、失败阻断和第二账号 list-back 保留授权验收门。

## 66. W6.a6.20.5 Group Server Search Contract

> PROCESS AXIOM: 群搜索命中来源、当前账号关系和申请防重属于共享业务事实；H5 页面不得根据标题、路由历史或按钮点击自行推断已加入/待审核状态。

| layer | contract |
| :--- | :--- |
| Gateway transport | `/v1/group/search` 使用专属 `GatewayGroupSearchItem`，必须保留 `group/source_type` 和服务端可选关系字段；不得复用会丢 wrapper 的普通群列表 normalizer |
| shared facade | 非空 keyword 才进入认证/I/O；搜索结果与 canonical 已加入群列表并行读取，按稳定群 ID 去重，关系优先级固定 `pending > joined > available` |
| route/context | `/groups/create -> /groups/search` 通过严格 Router state 只传 selected user IDs、backHref 和 search keyword；返回创建页必须保留已选好友，不跨路由携带群 DTO、token 或数据库对象 |
| actions | joined 仅在真实 `conversationID` 存在时进入会话；pending 禁止重复申请；available 进入 `/groups/:groupID/apply` 并使用 `source_type=search`；最终 mutation 继续由 `groupApplications.apply` 持有 |
| UI truth | loading/error/empty 必须显式；服务端空列表不得转成假结果。标题、头像、成员数仅投影 shared DTO，页面不调用 OpenAPI/SQL、不缓存第二份搜索结果 |
| RN boundary | RN `CreateGroupServerSearchScreen/searchGroupsByID/joinGroupByID` 只读参考并保持冻结；本切片只运行 `build:web/sync:web`，不重建 RN package，不修改 desktop build scripts |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-empty-data-gated`。SDK focused 2 files/9 tests、H5 focused 3 files/7 tests；full verify 包含 SDK Web 84 files/345 tests、466 assets、typecheck 与 1084-module production build。认证 412px 浏览器证明真实入口、独立 route、空结果和已选好友返回保持；当前账号以 `donk` 和已知旧群 ID 搜索均无服务端结果，因此 joined/pending/available 行、真实申请和第二账号 list-back 未验收，不能宣称远端功能闭环。

## 67. W6.a6.20.7 Personal Profile Avatar Contract

> ATOMICITY AXIOM: 个人资料头像只有上传与当前账号资料更新均成功且响应身份一致时才成功；H5 页面不得分步编排或先展示 blob URL。

| layer | contract |
| :--- | :--- |
| RN truth | `ProfileScreen` 头像行 -> `AvatarActionSheet` 的“从相册选一张/拍一张照片/取消” -> 圆形裁剪 -> `uploadAvatar` -> `updateSelfInfo(faceURL)`；RN 业务源码只读冻结 |
| shared owner | `WebIMSync.profile.updateAvatar` 冻结认证 userID，复用 `uploadAvatarForUser` 的 JPEG/PNG/WEBP、10MB、平台上传 port、远端 HTTP(S) URL 和上传后切号保护，再执行一次 avatar-only `updateUserProfile` 并严格匹配响应账号 |
| H5 platform/UI | `/me/profile` 只持有头像行、共用 `AvatarSourceActionSheet`、album/camera file input、`AvatarCropDialog` 与 success-only 当前页面投影；裁剪失败、上传失败、切号或 Gateway 失败均保持错误可见且不关闭裁剪层 |
| timing split | 个人资料必须调用原子 `updateAvatar`；onboarding 继续调用 `uploadAvatar` 只写 Provider 内存草稿，最终“完成”才通过唯一 `update` 提交全部资料。两者不是双轨，不得互换提交时序 |
| structure | 旧 onboarding 专属来源 sheet 和上传元数据 helper 删除；H5 来源 sheet、文件合同、512x512 JPEG crop owner 各一份。SDK 业务规则不复制到页面 |
| acceptance | 浏览器只允许打开/取消来源层；真实文件选择、OSS 上传、profile mutation、刷新回读和第二终端展示需要显式授权。RN caller convergence 需独立 RN 任务 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; mutation-acceptance-gated`。SDK focused 1 file/8 tests、H5 focused 3 files/5 tests；full verify 包含 SDK Web 84 files/349 tests、466 assets、SDK/H5 typecheck 与 1089-module production build。已登录 412px `/me/profile` 证明头像行、RN 三项来源文案、静态图片/camera input 与零横向溢出；仅打开并取消，未选择文件或执行上传/update。`im28-phone` worktree clean，`build:package:desktop:web` 未修改或执行。

## 68. W6.a6.20.8 Verification Unread Contract

> AXIOM: 好友验证未读只来自专用 unread/read API；群验证角标只来自审核接口按权限聚合的 `total`。页面不得按列表长度/`isRead` 猜计数，也不得用空 IDs 触发隐式全量已读。

| owner | contract |
| :--- | :--- |
| shared SDK | `friendApplications.getUnreadCount/markRead` 负责认证、非负整数、稳定 ID 保序去重、空集合 fail-closed；`groupApplications.getUnreadCount` 用 `page=1/page_size=1` 保留服务端审核 `total` |
| H5 | `/contacts` 与 `/contacts/verifications/:tab` 共用单一 hook 和 `0` 隐藏/`99+` 角标；incoming 未读申请进入资料页前调用 shared 单条已读，失败不阻断 RN 既有导航语义 |
| RN freeze | `fetchFriendApplicationUnreadCount/markFriendApplicationsRead/fetchGroupApplicationAuditList` 保持现状；本 H5 slice 不修改 RN caller |
| acceptance | 当前真实账号计数 0、2 条申请均 outgoing/accepted、群审核空；仅完成只读路由/布局/console 证明，真实 incoming mark-read、非零群 total、accept/reject 与 RN convergence 保持 gated |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass/mutation-acceptance-gated`。SDK focused 2 files/15 tests、H5 badge 1/1；full verify 包含 SDK Web 84 files/352 tests、466 assets、SDK/H5 typecheck 与 1091-module build。412px 真实账号 friend/group routes 零溢出、零 console；未点击申请或执行 mutation，RN worktree clean，Desktop/RN builds 与 `build:package:desktop:web` 未修改或执行。

## 69. W6.a6.20.13 Group Administrator Routes Contract

> OWNER AXIOM: 群管理员权限、候选、数量上限、角色 mutation 和缓存收敛只由 SDK 定义；H5 独立 route 不得复制业务规则或保留第二套管理 modal。

| layer | contract |
| :--- | :--- |
| RN truth | `GroupAdminsScreen -> GroupAddAdminsScreen` 是页面/返回栈基线；RN source 只读冻结，不因 H5 路由对齐而改写 |
| shared SDK | `group-admin-owner.ts` 公开 `IM_GROUP_ADMIN_LIMIT` 并同时用于强校验；`setAdmins/cancelAdmins` 持有权限、候选角色、exactly-once Gateway 与 group/member cache transaction |
| routes | `/conversations/:conversationID/settings/manage/admins` 展示管理员并确认移除；`/admins/add` 搜索普通成员、受 shared 剩余名额约束并一次批量提交；直接刷新必须从稳定 conversation ID 恢复 |
| cache order | cache-first 展示后必须先同步群资料，再同步成员完整分页，避免冷缓存成员 owner 因群身份尚未落库而失败；刷新后的候选必须裁剪已退群或已变角色的选择 |
| fail-closed | runtime、登录、会话、群身份或 `canManageAdmins` 任一不成立时不得暴露 mutation 动作；`remote-only` 不得自动重放角色请求 |
| delete-or-register | 管理页旧管理员添加/取消 picker 与 action 已删除，不保留 compat；当时登记的群主转让后续项已由 `.20.14` 独立 route 关闭 |
| acceptance | 当前账号目标群缺失，只证明独立 route、真实错误和动作隐藏；非空管理员列表、添加/移除、刷新回读和第二账号角色变化均未授权/数据受限 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass/data-gated`。SDK focused 1 file/5 tests、H5 focused 1 file/4 tests；full verify 包含 SDK Web 85 files/357 tests、466 assets、boundary/typecheck 与 1099-module build。RN worktree clean，未运行 RN/desktop build 或 `build:package:desktop:web`。

## 70. W6.a6.20.14 Group Owner Transfer Route Contract

> OWNER AXIOM: 群主转让候选、权限、角色状态迁移和缓存收敛只由 SDK 定义；H5 必须用独立 SPA route 呈现，不得在群管理首页保留第二套 picker 或 mutation。

| layer | contract |
| :--- | :--- |
| RN truth | `GroupTransferOwnerScreen` 的关闭式独立选择页、搜索、管理员优先、成员分组、下拉刷新和二次确认是 H5 页面基线；RN source 只读冻结 |
| shared SDK | `filterIMGroupOwnerTransferCandidates` 排除当前群主并约束 active admin/member；`groupMembers.transferOwner` 持有 capability、exactly-once Gateway、group/member 原子角色事务与独立权威刷新 |
| route | `/conversations/:conversationID/settings/manage/owner-transfer` 只从稳定 conversation ID 恢复真实群、成员和权限；管理首页只保留 `Link` 入口 |
| presentation | H5 搜索复用 shared 显示名，管理员在“群主及群管理员”分组优先，普通成员按 RN 拼音分组；选择后显示头像、昵称、提示、确定/取消，提交中禁用重复动作 |
| convergence | 管理员和群主 route 共用一个 cache-first data adapter；页面不 import Gateway/OpenIM、不得复制角色条件；`remote-only` 保持错误可见且禁止自动重放 |
| success/failure | 成功后当前账号已失去 owner 权限，必须 replace 到群设置页；runtime、登录、会话、群身份或 capability 缺失时 fail-closed，不展示提交动作 |
| delete-or-register | 管理页旧群主 picker、成员 load 和 action 已删除，不保留 compat；新 route 是唯一 H5 UI owner |
| acceptance | helper 行为与 route contract 已自动证明；真实浏览器登录受 SQLite 多标签互斥锁阻塞，非空候选、确认视觉、真实转让、权威回读和第二账号角色变化仍 data-gated/未授权 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-login-lock/data-gated`。H5 focused 3 files/10 tests；full verify 包含 SDK Web 85 files/357 tests、466 assets、boundary/typecheck 与 1102-module build。SDK source 与 RN business 均未修改，RN worktree clean，未运行 RN/desktop build 或 `build:package:desktop:web`。

## 71. W6.a6.20.15 Joined Group Row Actions Contract

> OWNER AXIOM: 群列表长按只负责选择既有能力；Conversation 身份、群资料 mutation、退群权限与生命周期收敛仍由 SDK 单一持有，H5 不得复制 RN 的 Gateway/角色编排。

| layer | contract |
| :--- | :--- |
| RN truth | `ContactGroupListScreen + GroupRowActionMenu` 的 `300ms` 长按、`8px` 移动取消、分享群名片、退出群聊和 manager 改名为视觉/入口基线；RN source 只读冻结 |
| capability | 菜单只读取 `WebIMJoinedGroup.permissions.canEditGroupInfo/canQuitGroup/canTransferOwner`；不得读取 `roleLevel/myRoleLevel` 或本地猜测 owner/admin |
| conversation | 分享、改名、群主转让必须先调用 `conversations.openGroup`，随后仅用其 canonical `conversationID` 构造 React Router URL；群 ID 不得冒充会话 ID |
| routes | 分享复用 `/settings/share-group-card`；改名复用 `/settings/profile?edit=name`；群主退出入口复用 `/settings/manage/owner-transfer?from=joined-groups` |
| lifecycle | 普通成员显示 `退出群聊` 与 `退出, 并删除我发的群消息`，分别调用 `groupLifecycle.leave({clearHistory:false|true})`；`remote-only` 必须阻止重放并显示可见错误 |
| owner difference | RN 当前 owner flow 在客户端选 earliest admin 后调用旧 `quitGroup`；H5 不复制该 orchestration。群主先显式转让，返回群列表后由用户再次发起退群，禁止转让成功后自动串联 destructive leave |
| fail-closed | runtime、登录、真实群、canonical Conversation 或 capability 缺失时不得伪造 route/mutation；群设置中的解散入口保持独立，不进入群列表菜单 |
| acceptance | view/route contract 已证明动作顺序、定位、路由和无业务双轨；当前账号群列表为空，只完成真实空态，非空菜单、触屏、分享/改名/退群/转让及第二账号回读均 data-gated/未授权 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-empty-data-gated`。H5 focused 3 files/10 tests；full verify 包含 SDK Web 85 files/357 tests、466 assets、boundary/typecheck 与 1106-module build。SDK 业务源码与 RN business 均未修改，未运行 RN/desktop build 或 `build:package:desktop:web`。

## 72. W6.a6.20.16 Chat Text Link Actions Contract

> OWNER AXIOM: 消息正文 URL 边界与打开地址规范化属于 shared SDK；H5 只适配浏览器手势、开页、clipboard 和反馈，普通消息菜单不得拥有第二份 URL 解析。

| layer | contract |
| :--- | :--- |
| RN truth | `PresetEmojiTextContent -> splitMessageTextSegments -> openLinkActions`；点击打开，长按仅“打开/复制”，复制原始 URL；RN source 只读冻结 |
| shared SDK | `splitIMMessageTextLinks` 固定 HTTP(S)/www、尾随标点和原文；`normalizeIMMessageLinkURL` 仅将 www 补为 HTTPS；core/rn/web/desktop 显式导出 |
| H5 rendering | `PresetEmojiTextContent` 只在消息气泡传入 copy owner 时把普通文本区间投影为链接；预设表情实体、composer 和单行摘要语义不变 |
| interaction | 普通点击通过 browser port 打开 `_blank + noopener,noreferrer`；500ms 长按与右键只显示打开/复制；链接 pointer/context 事件必须停止冒泡，禁止同时打开普通消息菜单 |
| clipboard | 打开动作使用规范化 URL；复制动作使用 trim 后原始 URL，只有 `navigator.clipboard.writeText` resolve 才显示“复制成功” |
| fail-closed | 非 HTTP(S) 打开地址拒绝；clipboard 失败保留菜单并显示真实错误；不得产生 Gateway、SQLite 或消息 mutation |
| convergence | H5 production caller 已消费 shared owner；RN 等价 helper 按冻结矩阵登记，独立 RN 授权前状态为 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | shared/H5 聚焦测试与类型检查通过；412px 已登录真实群聊健康、无溢出/console error，但 cache 无链接消息，真实点击/长按/复制视觉 data-gated，未发送测试消息 |

## 73. W6.a6.20.17 Chat Message Action Modal Contract

> OWNER AXIOM: 普通消息动作层只重现 RN presentation；动作能力、状态校验与 mutation owner 保持既有主链，modal 不得成为第二业务编排器。

| layer | contract |
| :--- | :--- |
| RN truth | `500ms` 长按打开 `MessageActionBubbleModal`；全屏 blur/backdrop、原消息预览、200px 纵向 Telegram menu、40px action row、180ms reveal；RN source 只读冻结 |
| gesture | H5 `ChatMessageAction` 只持有 `500ms` timer、`8px` pointer move cancel、右键/Enter/Space 入口和长按 click suppression |
| modal | `ChatMessageActionModal` 必须通过 body portal 使用全局 `InteractionModal`；预览 `inert + aria-hidden`，Esc/backdrop 请求关闭且不得触发气泡媒体动作 |
| layout | 收到消息靠 16px 左边距，发出消息靠 16px 右边距；菜单固定 200px，极窄屏收窄；动作数量决定高度，预览与整栈必须 clamp 在 viewport 内 |
| actions | 引用/复制/编辑/多选/转发/添加到表情/删除的可见性、disabled、success-only close 与回调维持现有实现；本片不读取 DTO/角色/缓存，不调用 SDK/Gateway/SQLite |
| failure | copy/add 失败保持 modal 与错误反馈；其他动作只关闭 modal 后交给既有 owner；不得制造成功态或重放 mutation |
| acceptance | pure layout/H5 focused/full verify 已通过；412px 已登录页面真实右键打开发出消息 modal，200px/6 动作、仅删除危险色，遮罩关闭后 URL 稳定且零横向溢出；触屏实机仍 gated |

## 74. W6.a6.20.18 Chat Link Action Surface Convergence Contract

> OWNER AXIOM: 消息和消息内链接可以有不同动作集合，但必须消费同一个 H5 top-layer presentation owner；链接不得恢复气泡内绝对定位菜单。

| layer | contract |
| :--- | :--- |
| primary path | `ChatActionModalSurface` 唯一持有 body portal、全局 InteractionModal、锚点冻结、收发方向和 viewport clamp；不持有 URL、clipboard 或消息 mutation |
| ordinary message | `ChatMessageActionModal` 只组装引用/复制/编辑/多选/转发/表情收藏/删除；显式 `.is-danger` 仅标记删除；既有回调和 success-only 规则不变 |
| link | `ChatMessageLinkAction` 普通点击继续复用 browser open port；`500ms` 长按、`8px` move cancel 与右键进入两项 top-layer，只提供打开/复制动作 |
| event boundary | 链接 pointer/context 继续隔离外层消息手势；portal 菜单事件不得被原消息 click-capture 吞掉或重新打开外层菜单 |
| delete-or-register | 旧 `.rn-chat-text-link-menu` JSX/CSS 完全删除，无 compat caller；不得保留 hidden inline menu 或第二套 layout helper |
| fail-closed | URL 非 HTTP(S) 继续拒绝；clipboard reject 保留 modal 并显示真实错误；不得以 modal 关闭制造成功态 |
| acceptance | focused 5 files/16 tests、H5/SDK Web typecheck、SDK Web 86 files/360 tests、1114-module build 已通过；412px 普通消息共用层回归通过；真实 cache 无链接消息，链接视觉 data-gated且未发送测试消息 |

## 75. W6.a6.20.19 Friend Profile Presence Contract

> OWNER AXIOM: 在线状态查询、realtime 先后顺序和账号生命周期属于 shared SDK；H5 资料页只投影当前好友状态，不得建立第二套 WebSocket 或持久化缓存。

| layer | contract |
| :--- | :--- |
| RN truth | `UserProfileScreen` 仅对好友查询/订阅在线状态，导航栏显示在线或离线；黑名单状态优先；RN source 只读冻结 |
| shared SDK | `createIMUserPresenceSync` 按 100 人分批、稳定去重并兼容 Gateway wrapper/aliases；缺失 userID 不推导离线；订阅 revision 阻止迟到 HTTP 覆盖实时状态 |
| realtime/lifecycle | runtime 只路由 `user_status`；账号不匹配和目标外 userID 忽略；退出、切号、token 失效、被踢和 dispose 清 subscriber；不写 SQLite、不推进 dataVersion |
| H5 | `useContactProfilePresence` 只在 authenticated friend profile 建立 observation；navbar view 固定 `blacklisted > online/offline > none`，页面不 import Gateway/WebSocket/Repository |
| failure | 初始 HTTP 失败保持未知；若 realtime 已先到达，随后 HTTP 失败不得撤销已知状态；listener/report error 不制造离线或成功态 |
| convergence | Web production caller 已消费 shared owner；RN 现有 OpenIM presence caller 登记为 frozen，单独 RN 授权前不得声明 `converged` |
| acceptance | SDK focused/runtime 7 tests、full Web 87 files/366 tests、H5 view 7 tests、typecheck/full build 通过；真实好友资料在 412px/390x844 显示在线且零 overflow/console error；离线转换、重连和第二账号事件仍 sample-gated |

## 76. W6.a6.20.20 Group Member Presence Contract

> OWNER AXIOM: 群模式和 presence 语义属于 shared SDK；H5 群成员页只决定何时观察和如何画绿点，不得复制数字模式、HTTP、WebSocket 或缓存规则。

| layer | contract |
| :--- | :--- |
| RN truth | `GroupMembersScreen/useGroupMemberOnlineStatus` 仅在 `mode=1` 普通群批量读取/订阅完整成员；在线头像显示 14px 外层和 8px 绿点；RN source 只读冻结 |
| shared mode | `normalizeIMGroupMode` 统一 `1|2|normal|large`，`isIMNormalGroupMode` 是唯一可见性判定；`WebIMJoinedGroup.mode` 来自 Gateway/cache payload，缺失/未知 fail-closed |
| shared presence | 完整成员稳定 ID 交给 `.20.19` `presence.observe`；HTTP 100 人分批、realtime revision、账号过滤和 lifecycle clear 不建立群专属分支 |
| H5 | `useObservedUserPresence` 只维护当前页面 online map；初始/实时回包只合并出现的身份；离页/换群释放 observation；成员 DTO、SQLite 和 dataVersion 不变 |
| presentation | 仅明确在线且普通群显示绿点；large/unknown 不查询、不展示；昵称优先级、角色标签、ID、资料 route、搜索/索引/下拉刷新保持既有 owner |
| convergence | Web production caller 已消费 shared mode/presence；RN 现有 hook 冻结，单独 RN 授权前状态为 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | SDK focused 3 files/16 tests、H5 view 1/4、full Web 88/368、typecheck/build 通过；真实普通群 3 人中 1 人在线，412px/390x844 零 overflow/页面错误；large 群、上下线转换和 RN convergence 仍 gated |

## 77. W6.a6.20.21 Group Settings Preview Presence Contract

> OWNER AXIOM: 群设置预览与完整成员页只能按各自可见成员消费同一个 shared presence owner；不得为设置页复制查询、订阅或群模式规则。

| layer | contract |
| :--- | :--- |
| RN truth | `GroupSettingsScreen` 将 `getSettingsPreviewMembers` 结果交给 `useGroupMemberOnlineStatus`；仅普通群的明确在线成员显示 14/8px 绿点；RN source 只读冻结 |
| observation scope | H5 只观察 `buildChatSettingsMemberViews` 实际渲染的最多 10 个稳定 userID，不因设置页已加载完整成员快照而扩大订阅 |
| shared owner | 可见性复用 `.20.20` `isIMNormalGroupMode`；HTTP/realtime/revision/lifecycle 复用 `.20.19` `presence.observe`；不改 SDK business source |
| H5 | `ChatSettingsPage` 只连接 group、preview IDs 与 online map；`SettingsMemberAvatar` 只在圆形图片裁剪层外投影状态点；资料 route、昵称和成员动作保持既有 owner |
| fail-closed | large/unknown 群、缺失账号、空预览或未知状态均不展示；query/realtime 失败不制造离线 UI、持久化事实或 fake-success |
| convergence | Web production settings caller 已消费 shared owner；RN caller 保持冻结，状态为 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | H5 focused 2 files/13 tests、full Web 88/368、466 assets、runtime boundary、typecheck/build 通过；真实普通群 3 人预览中 2 人在线，412px/390x844 零 overflow/console error、绿点 14/8px；large 群与 realtime 切换仍 gated |

## 78. W6.a6.20.22 Group Member Restricted Profile Context Contract

> OWNER AXIOM: 群成员资料限制必须由当前账号的真实会话、群和成员事实恢复；Router state 只能定位候选上下文，不得携带可授予权限的结果。

| layer | contract |
| :--- | :--- |
| RN truth | `UserProfileScreen` 在 `groupAddFriendAllowed === false && !isSelf` 时隐藏更多、性别、昵称、ID、简介、快捷动作和全部关系动作，并显示群成员说明；RN source 只读冻结 |
| route | 群设置预览和完整成员列表只传稳定 `groupConversationID` 与白名单 `backHref`；目标用户身份仍只来自 `/contacts/users/:userID` |
| validation | H5 必须从当前认证 runtime 依次校验 group Conversation、`targetID` 对应 joined group 和目标 group member；任一缺失、异常或跨群不匹配均 fail-closed |
| shared display name | 校验成功后只使用 SDK `resolveIMGroupMemberDisplayName`，保持备注名 > 群内昵称 > 好友昵称/成员昵称 > im-userID后四位的共享优先级；页面不得复制 nickname mapper |
| restriction | 只有 authoritative/cached 明确 `allowMemberAddFriend=false` 才显示“已是群成员”；加载期间先隐藏动作，刷新失败显示“群成员资料暂不可用”；self 永不进入受限投影 |
| ownership | H5 hook 只编排 shared facades 和页面内存状态；不得新增 SDK/Gateway/OpenIM/SQLite 分支。群消息头像的 mute context 与成员管理 mutation 不在本片 |
| convergence | Web production caller 已消费 shared DTO/display-name owner；RN caller 保持冻结，状态为 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | H5 focused 3 files/22 tests、full Web 88/368、466 assets、runtime boundary、typecheck 与 1120-module build 通过；真实允许互加群入口昵称/完整动作/412px 零 overflow 已证；禁止互加真实样本仍 gated |

## 79. W6.a6.20.23 Chat Sender Avatar Profile Entry Contract

> OWNER AXIOM: 聊天气泡头像只能提供稳定 SPA 定位；群成员资料、显示名和互加限制必须继续由已有 shared/context owner 恢复，消息组件不得复制权限判断。

| layer | contract |
| :--- | :--- |
| RN truth | 收到的群消息只在连续分组末尾显示可点击头像；点击打开发送人资料并携带群上下文；RN source 只读冻结 |
| visibility | H5 仅把现有 `showSenderAvatar` 的 incoming group avatar 变为 Link；outgoing、单聊、系统消息和连续分组 placeholder 不新增入口 |
| route | helper 只接受非空 conversationID/senderID，构造编码 `/contacts/users/:userID`、当前聊天 backHref 和 `groupConversationID`；不携带昵称、角色、权限或消息 payload |
| profile owner | 资料 route 必须复用 `.22` 当前账号会话/群/成员重新校验、shared 显示名和 fail-closed 限制；消息组件不得读取 `allowMemberAddFriend` |
| interaction | 24px 头像、图片 fallback、占位、消息长按、媒体点击、链接动作和多选 DOM 保持不变；RN 头像长按 @ 成员与群禁言资料动作不在本片 |
| convergence | 这是 H5 presentation/route 接线，不新增 SDK business；RN caller 保持冻结，双端共享业务 owner 无变化 |
| acceptance | focused 2 files/15 tests、full Web 88/368、466 assets、runtime boundary、typecheck 与 1120-module build 通过；真实 412px 群聊零 overflow，但当前群没有 incoming sender avatar，点击/history 仍 data-gated且未发送测试消息 |

## 80. W6.a6.20.24 Chat Sender Avatar Mention Gesture Contract

> OWNER AXIOM: 头像长按只产生 Composer 输入意图；提及显示名、草稿文档、目标 selection 与最终发送必须继续经过现有 shared/Composer owner，头像组件不得建立第二消息链。

| layer | contract |
| :--- | :--- |
| RN truth | 收到的群消息在可见发送人头像长按时把真实群成员加入草稿提及；自身不提及；普通点击仍打开成员资料；RN source 只读冻结 |
| visibility | H5 仅在 `incoming + group + showSenderAvatar + membersByID hit` 时提供长按；未知成员保留资料点击但不生成 mention，outgoing/单聊/系统/placeholder 不新增动作 |
| gesture | 500ms 长按和 8px 移动取消对齐既有 RN/H5 消息手势；触发后抑制同次 click；desktop contextmenu 进入相同 callback，不复制业务分支 |
| composer | 页面传一次性递增 request；Composer 用 shared `resolveIMGroupMemberDisplayName` 建立稳定 user mention，复用 `useChatComposerMentions`；末尾有 active query 时替换，否则按需加分隔并追加 `@昵称 ` |
| identity/document | mention selection 保存 userID 与当前 displayName；草稿文字变化继续经过既有 preset-emoji entity reconcile，提交仍由原 mention collect/send owner 完成 |
| fail-closed | self、空身份、非群聊、编辑态、引用态和缺失成员不插入；头像手势不调用 Gateway、OpenIM、SQLite 或 send，不产生 optimistic success |
| structure | `ChatGroupSenderAvatar` 持有头像呈现/资料 Link，`ChatSenderAvatarAction` 只持有手势，`ChatMessageBubble` 只编排可见性；无第二资料、草稿或发送 owner |
| convergence | 本片只改 H5 UI/Composer 接线并消费已有 SDK 显示名；SDK business 与冻结 RN caller 均不改，双轨边界不扩大 |
| acceptance | focused 2 files/10 tests、full Web 88/368、466 assets、runtime boundary、typecheck 与 1122-module build 通过；匿名 dev/守卫/零 overflow 已证，真实 incoming avatar 长按和草稿投影仍因 session/data 样本 gated |

## 81. W6.a6.20.25 Chat Audio Played And Auto-next Contract

> OWNER AXIOM: 语音是否本地播放和下一条候选属于共享纯规则；浏览器只拥有偏好存储与媒体实例，且本地 played 不得冒充服务端 read。

| layer | contract |
| :--- | :--- |
| RN truth | 播放尝试即记录账号/会话已播放状态，兼容 `localEx.im28SoundMessagePlayed`；自然结束选择后续 incoming 未播放语音，手动停止不推进；RN source/caller 只读冻结 |
| shared rule | SDK 统一 `serverMsgID > clientMsgID` 身份、localEx 解析和阅读顺序扫描；候选必须是稳定身份、incoming、type103、未播放且平台确认可播放 |
| Web adapter | `ChatMediaInteractionProvider` 持有 chat route 唯一 HTMLAudio；localStorage key 为 `im28.voicePlayed.<user>.<conversation>`；消息列表从 newest-first 转为阅读顺序后调用 shared selector |
| UI | 只有 incoming 且本地未播放的语音显示红点；开始真实播放尝试后消失；播放状态、错误和既有按时长气泡宽度继续由原媒体 owner 投影 |
| fail-closed | 空/损坏偏好、缺失当前消息、非法 URL、outgoing、非语音、已播放、手动停止和播放失败均不自动推进；账号/路由切换停止并释放资源 |
| boundary | 不修改消息 DTO、SQLite 或 Gateway，不发 read receipt，不提供跨设备 played；服务端 read 是独立 capability |
| convergence | Web production caller 消费 shared 规则；RN caller 冻结，状态 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | SDK focused 1 file/3 tests、H5 focused 3 files/12 tests、full Web 89/371、466 assets、runtime boundary、typecheck 与 1124-module build 通过；真实账号会话/当前群聊 412px 零 overflow/console error、唯一 audio runtime 已证，当前群无语音，播放链 data-gated |

## 82. W6.a6.20.26 Chat Custom Emoji Bubble Preview Contract

> OWNER AXIOM: type115 身份、URL 快照和发送状态继续属于 shared SDK；H5 只能从既有消息投影尺寸并接入既有媒体预览 owner，不得复制表情业务链。

| layer | contract |
| :--- | :--- |
| RN truth | 自定义表情气泡最大宽度 180，不放大小图并保持真实比例；历史消息缺少宽高时先探测自然尺寸；点击进入无工具栏纯图片预览，点击任意区域关闭；RN source 只读冻结 |
| message projection | H5 type115 继续保留 `emoji_id/url`，仅在 payload 明确提供有限正数时附加 `width/height`；旧消息不猜测固定比例 |
| bubble | 独立 `ChatCustomEmojiMessageContent` 优先快照尺寸，其次复用当前运行期 URL 自然尺寸缓存；未知尺寸使用 1px 隐形探测，解码后复用 `getChatImageDisplaySize`；非法 URL 显示不支持态，解码失败显示稳定失败文案而非 broken image |
| preview | `getChatMediaPreview` 对 type115 只接受 HTTP(S) 快照并投影 `emoji` kind；route-scoped `ChatMediaInteractionProvider` 仍是唯一 overlay owner；预览黑底、无关闭/保存工具栏，图片不阻断整层点击关闭 |
| isolation | 普通图片继续保留关闭/保存与 OSS fallback；文件/视频/音频、收藏、发送、recent 和 manager mutation 均不改变；不新增 Gateway/OpenIM/SQLite/SDK 分支 |
| acceptance | H5 focused 3 files/15 tests、full Web SDK 89 files/371 tests、466 assets、runtime boundary、typecheck 与 1125-module build 通过；真实群聊 412px 零 overflow/console error/破图，当前会话无 type115，真实气泡点击与预览视觉仍 data-gated |

## 83. W6.a6.20.27 Chat Initial Unread Navigation Contract

> OWNER AXIOM: 未读区间和稳定身份属于 shared 纯规则；H5 只拥有当前窗口的滚动与可见度，服务端已读是独立 mutation，不能由滚动结果伪造。

| layer | contract |
| :--- | :--- |
| RN truth | 按 `lastReadSeq` 找 incoming 未读，使用精确 seq 文本比较；首条 type1201 好友建立通知不作为普通未读分割线；最后已读锚点贴近视口底部，用户离开最新端后新消息不强拉到底；RN source/caller 冻结 |
| shared rule | `getIMInitialUnreadNavigation` 接收旧到新消息，统一 uint64、incoming、`serverMsgID > clientMsgID`、首未读与最后已读锚点；非法边界 fail-closed，无 Repository/Gateway I/O |
| Web adapter | `useChatUnreadNavigation` 只在当前路由 50 条窗口完成后冻结边界，按 80% 可见度减少本地剩余数，40px 内才跟随新增消息；普通气泡和系统消息共用双身份 DOM 标识 |
| UI | 首未读前展示“未读消息”分割线；未读尚未达到可见阈值时展示 `N条未读/99+` 浮层；显式点击只滚动当前消息容器，不移动页面 |
| arbitration | 带稳定消息 ID 的搜索结果定位优先，不启动初始未读锚定；路由切换清空前一路由的边界、已看集合和跟随状态 |
| boundary | 本片不调用 `markRead`、不写 `lastReadSeq/unreadCount`、不发 read receipt；当前 50 条之外的未读分页和服务端收敛另立 capability |
| convergence | Web production caller 消费 shared 规则；RN caller 冻结，状态 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | SDK focused 1 file/3 tests、H5 focused 2 files/8 tests、full Web SDK 90 files/374 tests、466 assets、runtime boundary、SDK RN/Web/Desktop 与 H5 typecheck、1127-module build通过；真实 412px 无未读样本时零误画/零 overflow/零 console error且停在最新端，非零未读视觉与滚动仍 data-gated |

## 84. W6.a6.20.28 Chat Visible Unread Read Convergence Contract

> OWNER AXIOM: 可提交 seq 的业务筛选和已读缓存收敛属于 shared SDK；平台只能报告真实可见身份和明确交互许可，不能把程序化定位冒充阅读。

| layer | contract |
| :--- | :--- |
| RN truth | 80% 可见度取最高 incoming unread seq；短列表真实测量完成后可消费全部可见未读；长列表初始锚定禁止提交，只有用户拖动或明确到最新动作放行；RN business caller 不改 |
| shared rule | `getIMVisibleUnreadReadSeq` 按稳定身份过滤可见消息，拒绝 outgoing/已读/非法 seq，用 uint64 文本比较返回最高序列 |
| mutation | H5 只调用既有 converged `conversations.markRead(conversationID, readSeq)`；Gateway 成功且目标匹配后才写 SQLite，失败清除本页去重边界以允许重试 |
| partial count | shared markRead 优先使用回包 `unread_count`；回包缺失时仅 `confirmedReadSeq >= cached lastMsgSeq` 清零，部分游标保留原计数，禁止提前清会话角标 |
| Web gate | `unreadCount > 0` 才允许 mutation；短列表需完成初始定位和真实尺寸；长列表需 wheel/touchmove、显式未读入口，或原先处于最新端的新消息跟随；许可在当前布局帧后清除 |
| identity/visibility | 普通气泡和系统消息共用 server/client 双身份；DOM 达到 80% 才进入可见集合；搜索目标模式不启动未读导航或自动已读 |
| convergence | RN/H5 实际调用同一 shared markRead；新增最高 seq 规则由 SDK 单一持有，平台门禁按 native/DOM 差异分离 |
| acceptance | SDK focused 2 files/8 tests、H5 focused 2 files/4 tests、full Web SDK 90 files/376 tests、466 assets、runtime boundary、SDK RN/Web/Desktop 与 H5 typecheck、1128-module build通过；真实 412px 无未读 route 零误画/零 overflow，干净 reload 后零 console error；真实非零 partial read、Gateway count 与 list-back 仍 data-gated |

## 85. W6.a6.20.29 Chat History Pagination And Sticky Date Contract

> OWNER AXIOM: 历史页游标、窗口合并和服务端分页事实属于 shared SDK；平台只能拥有到顶手势、原生/DOM 位置补偿和悬浮日期展示。

| layer | contract |
| :--- | :--- |
| RN truth | 用户真实滚到最早端才拉取更早消息；前插后保持当前可见消息位置；滚动时短显当前日期；初始程序定位不视为用户滚动；RN source/caller 只读冻结 |
| shared rule | `getIMPreviousMessageHistoryCursor` 用 uint64 十进制精确减一；`mergeIMMessageHistoryWindow` 按稳定消息身份去重更新并以 seq 新到旧稳定排序 |
| shared sync | `pullHistoryPage` 统一请求、clear boundary、DTO 映射、SQLite upsert 与 `has_more/next_seq`；`has_more=true` 时缺失、非法或重复 next cursor 必须拒绝，禁止无限循环 |
| compatibility | 已发布 `pullHistory` 继续返回完整缓存数组，但内部调用同一 page owner；compat 只保留返回形状，不复制 Gateway/Repository 状态机 |
| Web gesture | H5 只有 wheel/touchmove/pointer 等真实用户手势后到达 48px 顶部阈值才加载；初始未读、搜索定位、恢复路由和程序滚动不得触发 |
| Web position/UI | 请求前记录 scrollTop/scrollHeight，React 提交后用新增高度恢复位置；滚动期间从已有日期分隔读取文案并在 1.2 秒后隐藏；短列表不展示悬浮日期 |
| failure | 无 sync/会话/游标、并发请求、路由切换和 Gateway/SQLite 错误不推进 cursor 或伪装完成；错误继续进入页面既有可见反馈 |
| convergence | Web production caller 消费 shared owner；RN 现有 `useChatLoadMore/chatDetailHistoryHelpers` 冻结，状态 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | SDK focused 4 files/21 tests、full Web 91 files/381 tests、H5 focused 4 files/8 tests、466 assets、runtime boundary、SDK/H5 typecheck、build:web sync 与 1131-module build通过；真实 412px 短会话 list 665/665、零误分页/loading/sticky/overflow；长历史 Network、位置补偿和日期视觉仍 data-gated |

## 86. W6.a6.20.30 Chat Quote Source Local Resolution And Focus Contract

> OWNER AXIOM: 引用来源身份和本地缓存读取属于 shared SDK；平台只能拥有当前窗口复用、原生/DOM 定位、高亮和导航，不得为缺失来源增加未定义的远端查询。

| layer | contract |
| :--- | :--- |
| RN truth | 引用来源先查当前列表，再按稳定消息 ID 查本地 SQLite；命中后定位并高亮，确认缺失显示“引用的内容已删除”；RN source/caller 只读冻结 |
| shared sync | `getCachedByStableMsgIDs` 对每个身份先查 client ID、再查 server ID，按请求保序，以 canonical client ID 去重；只读当前账号 `MessageRepository` |
| group identity | 群引用发送人复用 `resolveIMGroupMemberDisplayName` 的 `备注 > 群内昵称 > 公开昵称 > im-userID后四位`；H5 不读取 raw nickname 重算 |
| Web cache | 当前消息窗口命中优先；缺失来源一次批量读取，只接受同会话结果；读取错误保持未确认态，不冒充已删除 |
| Web focus | 当前 DOM 命中时居中并短时高亮；仅在本地库命中且不在窗口时，通过 React Router 同会话 `?messageID=<clientID>` 读取目标窗口再复用同一 DOM focus |
| failure | 空身份、跨会话结果、本地读取失败和确认缺失均不导航；只有确认缺失显示删除文案并禁用动作；不新增 Gateway、WebSocket、retry 或 cache write |
| convergence | Web production caller 消费 shared 本地查询；RN 现有 `fetchMessageByID -> localIMStore` 与 FlatList caller 冻结，状态 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | SDK focused 2 files/12 tests、full Web 91 files/381 tests、H5 focused 4 files/15 tests、466 assets、runtime boundary、SDK/H5 typecheck、build:web sync 与 1132-module build通过；真实三个会话均无引用消息，路由/overflow/console 健康，点击定位仍 data-gated |

## 87. W6.a6.20.31 Chat Message Delete Shatter Exit Contract

> OWNER AXIOM: 删除成功与逐项结果继续属于 shared SDK；H5 只能依据明确成功身份短暂保留展示行，不得用动画反推或伪造业务成功。

| layer | contract |
| :--- | :--- |
| RN truth | 只有本地/双方删除成功的消息执行约 620ms 碎裂退场；批量 partial result 只移除成功项，失败项保留；RN source/caller 只读冻结 |
| shared result | 继续消费既有 `WebIMDeleteMessagesResult.deletedClientMsgIDs`；Gateway、scope/permission、逐项错误、SQLite success-only 隐藏和通知文案均不改变 |
| Web snapshot | 在 shared delete 返回且页面 operation 重读 cache 前冻结当前窗口；只接受当前会话可见的非空成功 client ID；期间用最新 cache 更新未删除行并保留 realtime 新行 |
| Web exit | 普通/系统消息共用 620ms anchor/content/固定粒子动画；根行动画结束逐项释放，700ms 兜底防止 DOM 中断残留；reduced-motion 缩短为 1ms |
| partial/failure | 未返回成功 ID、异常 ID、路由切换和删除失败不触发退场；partial 失败行继续读取当前 cache；动画完成不写 SDK、SQLite 或 notice |
| ownership | H5 仅持有 React state、DOM animation 与 CSS；禁止新增 Gateway/OpenIM/Repository/权限/结果映射或第二删除状态机 |
| acceptance | H5 focused 4 files/13 tests、Web typecheck、1136-module production build 和 diff check 通过；真实 412px 页面零 overflow/error 且 620ms 规则加载；未执行破坏性删除，真实单条/批量/partial 动画仍 gated |

## 88. W6.a6.20.32 Group Chat Composer Availability Contract

> OWNER AXIOM: 群聊是否可发送及不可用原因属于 shared SDK；H5 只能投影 shared 群快照并拥有浏览器输入区布局，不能读取 raw 权限重算。

| layer | contract |
| :--- | :--- |
| RN truth | `getGroupSendDisabledReason` 按成员 removed/left/banned、群 banned/dismissed、`can_send_message`、群主豁免、个人/全员/普通成员禁言和频率限制判定；不可用栏取代 composer，多选仍优先；RN source/caller 冻结 |
| shared rule | SDK `resolveIMGroupComposerUnavailableReason` 按相同优先级集中规则与中文文案；`mapCoreGroupToWeb` 从 joined-group raw payload 投影可选 `composerUnavailableReason` |
| Web cache | 群聊 route 先读 groups/member SQLite，再刷新两套 facade；群权限刷新成功不被成员刷新失败吞掉；任一失败保留对应缓存并显示真实错误 |
| Web footer | 固定 `多选 > 不可用提示 > 待转发 > 普通 composer`；不可用栏无按钮、textarea、语音、表情、附件或 pending forward 入口 |
| fail-closed | 群快照恢复中、权威已加入列表缺失、无缓存读取失败分别显示 shared 恢复/退出/不可用文案；已有缓存且远端失败不把已知限制清空 |
| realtime | 当前 Gateway 没有冻结独立群禁言/成员状态 realtime event；不得为本能力增加页面 WebSocket，进入/返回聊天及群 facade 同步负责收敛 |
| convergence | H5 production caller 消费 shared 规则；RN caller 冻结，状态 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | SDK focused 2/13、full Web 91/381、boundary/Web typecheck/build:web；H5 focused 2/7、full 95/293、466 assets、typecheck、1139-module build；真实 412x786 单聊/普通群零回归，受限群样本 data-gated |

## 89. W6.a6.20.33 Single Chat Relationship Availability Contract

> OWNER AXIOM: 单聊关系可用性只基于服务端可证明的 `is_friend` 与我方 blacklist；没有反向黑名单字段时，禁止沿用历史变量名制造“对方拉黑我”的产品事实。

| layer | contract |
| :--- | :--- |
| RN truth | 我方 blacklist 替换 composer；非好友在消息底部显示验证文案/动作但保留 composer；发送命中好友关系错误后进入同一非好友投影；RN source/caller 冻结 |
| shared rule | SDK `resolveIMDirectChatRelationshipPresentation/isIMFriendRelationshipSendError` 单一维护状态、优先级、中文文案和兼容错误词；`blocked-by-me > stranger > friend/self` |
| shared facade | `createIMDirectChatRelationshipSync` 并行组合 `peerProfile.get().relationship + blacklist.has()`；不读取页面状态、不新增 Gateway/OpenAPI/SQLite/WebSocket owner |
| Web adapter | `useChatDirectRelationship` 只保存 route projection；底部动作进入 `/contacts/users/:userID/add`；footer 继续按 `多选 > 不可用 > 待转发 > composer`；stranger 不关闭 composer |
| fail-closed | 会话身份、关系首轮读取和无旧事实失败时不提前开放发送；已有明确投影不因后续读取失败清空；空目标拒绝进入远端 |
| non-claim | `blockedByPeer` 在 RN 是历史兼容名，本片语义为 `is_friend=false` 或关系发送错误；Gateway 当前不能证明对方 blacklist，故不实现/展示反向拉黑 |
| realtime | 当前只在 route enter 和发送关系错误收敛；好友/blacklist domain revision 不得用每条消息的通用 `dataVersion` 替代，进入下一独立切片 |
| acceptance | SDK 96 files/395 tests、全 target typecheck、boundary、build:web/sync:web；H5 focused 2/6、typecheck、1143-module build；真实群聊与两条好友单聊零回归/console error；陌生人/blacklist 真实样本 data-gated |

## 90. W6.a6.20.34 Single Chat Relationship Realtime Revision Contract

> REVISION AXIOM: 好友和我方黑名单事实变化必须有独立 revision；普通消息、新增申请、拒绝申请和删除申请不能造成聊天页重复远程读取关系。

| layer | contract |
| :--- | :--- |
| shared classifier | SDK `isIMRelationshipRealtimeEvent` 读取标准事件与原始 Gateway 事件名；好友增删改、黑名单增删和好友申请接受返回 true，仅申请列表变化与其他事件返回 false |
| runtime snapshot | Web runtime 公开单调 `relationshipVersion`；命中 classifier 时只推进该版本，不伪装 SQLite `dataVersion` 变化 |
| Web consumer | `ChatPage -> useChatDirectRelationship` 把 `relationshipVersion` 作为关系读取依赖；会话/账号变化仍按既有 route lifecycle 重读 |
| isolation | 消息/会话/message.update 继续只走 realtime persistence 和 `dataVersion`；presence、group、call 与关系 revision 不互相代替 |
| failure | 关系重读失败沿用 W33：已有明确投影不被清空，首轮无事实 fail-closed，错误可见；不新增 WebSocket、transport 或缓存 owner |
| acceptance | SDK Web 93 files/387 tests、boundary、Web typecheck/build:web/sync:web；H5 typecheck、1144-module production build；412px 真实好友单聊刷新、可用 composer 与零横向溢出通过；真实双账号关系变更仍 data-gated |

## 91. W6.a6.20.35 Single Chat Add Members Create Group Contract

> OWNER AXIOM: 单聊设置入口只能把当前聊天对象作为固定成员组合进既有 shared 建群 owner；不得复制建群校验、Gateway 写入、缓存事务或另建第二条业务链。

| layer | contract |
| :--- | :--- |
| RN truth | `SingleChatSettingsScreen` 成员加号打开好友选择，当前单聊对象自动包含且不可取消，用户至少再选一位后创建群聊；RN source/caller 冻结 |
| route | `/conversations/:conversationID/settings/create-group` 为 React Router SPA route；返回固定到当前设置页，不依赖浏览器临时 history 推断 |
| peer identity | 只接受当前账号 cached/synced conversations 中 `conversationID` 精确匹配的单聊；固定成员取非当前账号的 peer userID，群聊、自聊、空身份和缺失会话 fail-closed |
| selection | 固定成员不出现在候选列表且不可取消；搜索只过滤额外好友；提交前按固定成员优先稳定去重，页面显示的已选总数包含固定成员 |
| shared owner | 普通建群和单聊入口都只调用 `WebIMSync.groups.create`；2–998、本人拒绝、默认群名、exactly-once、`remote-only` 与 SQLite 群/会话事务继续属于 SDK |
| acceptance | H5 focused 2 files/13 tests、typecheck、1144-module build；412px 真实单聊设置入口、候选排除、选择 1 位后总数 2/按钮启用、返回与零 overflow 通过；未执行真实创建 |
| protection | 本片不改 SDK source/package scripts 或 RN business；不执行 RN/Desktop/build:all/`build:package:desktop:web` build/sync |

## 92. W6.a6.20.36 Conversation Tab Double Press Next Unread Contract

> NAVIGATION AXIOM: 消息主标签双击只改变会话列表滚动位置；不得借此提交已读、发送回执或建立 SDK/数据库状态。

| layer | contract |
| :--- | :--- |
| RN truth | 已选消息 Tab 两次点击间隔 `<=320ms` 且非静音未读总数大于零时，列表滚动下一未读；RN source/caller 冻结 |
| gesture | H5 唯一 `PrimaryTabBar` 记录消息 Tab 点击时间；离开消息主路由立即清空，其他 Tab 点击也清空；首次点击和超时点击保持普通 React Router 行为 |
| page port | `PrimaryTabsLayout` 只保存当前 `ConversationsPage` 注册的短生命周期 callback；页面卸载必须注销，底栏不读取会话 DTO 或 DOM |
| unread target | 候选满足 `unreadCount > 0 || manualUnread`；无上次目标时从首个可见行之后选第一条并回退列表首条，有上次目标时按未读列表顺序循环 |
| DOM | 会话行暴露稳定 `data-conversation-id`；页面按 header 下方首个可见行计算索引，只执行 `scrollIntoView({ behavior: 'smooth', block: 'center' })` |
| mutation boundary | 禁止调用 `markRead`、read receipt、Gateway、Repository、SQLite 或修改 unread/manual-unread；归档、搜索和会话打开语义不变 |
| acceptance | H5 focused 2 files/10 tests、typecheck、1145-module build通过；5176 dev 服务健康，真实应用内登录态双击滚动因工具不可控保持 manual gate |
| protection | SDK source/package 与 RN business 零改动；不执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build/sync |

## 93. W6.a6.20.37 Chat Call Record Message Bubble Contract

> OWNER AXIOM: 历史通话消息的协议解析、状态与文案属于 shared SDK；平台只拥有图标、布局和对既有通话 owner 的用户动作接线。

| layer | contract |
| :--- | :--- |
| RN truth | `parseRTCCallMessage/formatRTCCallMessageText/ChatMessageBody` 固定 audio/video、七种状态、`mm:ss`、拒绝/取消图标和点击回拨；RN caller 冻结 |
| shared parser | `parseIMCallMessagePresentation` 兼容 core `payload`、Gateway `body.system/body.custom` 与 RN `customElem`；统一媒体、状态、秒数、房间和中文文案 |
| lifecycle isolation | `im28.rtc.call` 历史摘要与 reject/cancel/hangup/ended/missed/failed/summary 终态可展示；实时 invite/accept 不得被历史气泡消费 |
| Web view | `getChatMessageView` 只消费 SDK 投影；`ChatMessageContent` 使用 RN 镜像图标和稳定按钮尺寸，不读取 raw custom payload |
| callback | 单聊点击只调用已有 `handleStartCall -> WebIMCallProvider.startOutgoing`；群聊记录只读，不新增群通话或第二鉴权/信令状态机 |
| failure | 损坏 JSON、未知媒体/状态和非终态信令 fail-closed；不得回退成可点击假通话成功路径 |
| convergence | Web production caller 已消费 shared parser；RN caller 冻结，状态 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | SDK focused 1/4、full Web 94/391、H5 focused 1/9、boundary、SDK Web/H5 typecheck 与 1147-module build通过；5176 目标会话零 console error，真实历史通话样本视觉仍 data-gated |
| protection | `im28-phone` clean；只执行 build:web/sync:web，不执行 RN/Desktop/build:all/`build:package:desktop:web` |

## 94. W6.a6.20.38 Conversation Draft Persistence Contract

> OWNER AXIOM: 会话草稿正文、预设表情实体和同步替换保留规则属于 shared SDK；H5 只持有输入事件、路由生命周期和列表展示。

| layer | contract |
| :--- | :--- |
| RN truth | 输入变化保存到会话草稿，列表优先显示 `[草稿]`，重进恢复，成功发送或显式清空后移除；RN source/caller 冻结 |
| shared facade | `createIMConversationDraftSync` 校验当前账号已缓存会话、trim `PresetEmojiDocument`、保存/读取正文与 entities；local-only，不调用 Gateway |
| storage | schema v13 `draft_entities_json` 分列保存实体；`replaceAll/replaceUnarchived` 必须在删除前快照本地草稿并合并进远端会话，禁止同步刷新丢失草稿 |
| Web consumer | `ChatPage/ChatComposer` 上报文档并只在发送成功/显式清空后清除；列表通过 `readIMConversationDraftDocument` 投影，不解析 raw payload |
| failure | SDK/发送失败保留输入与 entities；坏实体归一化为空；缺失会话 fail-closed；不得出现 Gateway、假成功或第二份草稿映射 |
| convergence | Web production caller 已消费 shared facade；RN caller 冻结，状态 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | SDK focused 3 files/12、full Web 95/394；H5 focused 2 files/12、full 97/304；typecheck、build:web/sync:web、1149-module build；5176 登录态输入/列表/重进/清空闭环与零 console error 通过 |
| residual | 多标签同时编辑同一会话的冲突策略未定义；未发送消息或执行远端 mutation |
| protection | `im28-phone` clean；不执行 RN/Desktop/build:all/`build:package:desktop:web` |

## 95. W6.a6.20.39 Call List Pull Refresh Contract

> OWNER AXIOM: 通话同步、缓存和筛选查询继续属于 shared SDK；H5 只拥有浏览器触摸手势、刷新提示和列表投影，不能建立第二条通话数据链。

| layer | contract |
| :--- | :--- |
| RN truth | 通话列表在顶部下拉释放后强制执行 `syncCallList`，再重读当前筛选第一页；编辑态不执行刷新；RN source/caller 冻结 |
| Web gesture | `/calls` 复用全局 `usePullRefresh` 的单指、顶部、阈值与释放语义；只投影下拉/松开/刷新状态，不在 hook 中读取业务数据 |
| shared chain | 页面只调用既有 `WebIMCallSync.sync()`，成功后调用 `listCached({ answerStatus, keyword, limit, offset: 0 })`；Gateway、分页、SQLite 和 DTO 映射保持 SDK 唯一 owner |
| filter/edit | all/missed、当前搜索词和分页大小在刷新前后保持；`refreshing || editing` 时手势 fail-closed，避免重复同步或与批量选择冲突 |
| failure | `sync` 失败不得调用 `listCached` 或替换列表；旧快照保留，页面显示真实错误，不返回空列表伪造成功 |
| acceptance | H5 focused 1 file/4 tests、full 97 files/306 tests、typecheck、1149-module build；5176 412px 筛选/编辑/空态/TabBar/零 overflow/零 console warning-error 通过，物理触摸释放 gated |
| protection | 本片不改 SDK source/package、RN business 或 desktop 脚本；不执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build/sync |

## 96. W6.a6.20.40 Verification Center Pull Refresh Contract

> OWNER AXIOM: 好友申请、群审核和各自未读总数继续属于现有 shared facade；H5 只拥有双 Tab 的触摸手势、刷新提示与结果投影。

| layer | contract |
| :--- | :--- |
| RN truth | 好友验证与群聊验证索引均用 `RefreshControl` 在顶部下拉重读当前列表；RN source/caller 冻结 |
| Web gesture | 两个嵌入 Tab 复用全局 `usePullRefresh` 的单指、顶部、阈值和释放语义；切换 React Router tab 会卸载当前手势状态 |
| shared reads | 好友侧只调用 `friendApplications.list`，群侧只调用 `groupApplications.list`；父层角标继续调用既有 `getUnreadCount` owners，页面不读取 Gateway 或重算计数 |
| independence | 列表读取和角标刷新并行；角标失败不得阻断成功列表，列表失败不得用角标成功伪造空列表；失败保留旧列表并显示真实错误 |
| concurrency | 首次 loading、用户 refreshing 和申请 mutation 各自可见；已有刷新期间不重复提交，下拉不执行 accept/reject/mark-read |
| acceptance | focused helper tests、H5 full tests/typecheck/build；5176 双 Tab、空/非空列表、tab badge、移动宽度和 console 只读证明；物理触摸释放可显式 gated |
| protection | 本片不改 SDK source/generated package、RN business 或 desktop 脚本；不执行任何 SDK/RN/Desktop build/sync |

## 97. W6.a6.20.41 Call List Modal And Empty-State Contract

> OWNER AXIOM: 通话删除、缓存重读和筛选查询继续属于 shared SDK；H5 本片只收敛确认层生命周期和空列表文案，不改变任何通话业务分支。

| layer | contract |
| :--- | :--- |
| RN truth | 编辑态选择记录后从底部确认删除；搜索无结果显示“暂无搜索结果”，未接筛选为空显示“暂无未接来电”，默认为空显示“暂无通话记录”；RN source/caller 冻结 |
| modal owner | 删除确认复用全局 `InteractionModal` 原生 dialog top-layer、Esc、焦点圈定、背景 inert、遮罩关闭和 reduced-motion；独立组件保留退出动画期间的最后计数 |
| shared mutation | 确认按钮仍只调用既有 `WebIMCallSync.delete`；成功后清空选择、退出编辑并重读首个 cache 分页，失败保留页面真实错误；不得新增 Gateway、Repository、DTO 或成功回退 |
| empty projection | 空态纯函数按 `keyword.trim()` 优先、`missed` 次之、默认最后返回 RN 三类文案；不触发同步、缓存或筛选状态变化 |
| acceptance | focused view/component contract tests、H5 full tests/typecheck/build；5176 `/calls` 空态、编辑态、modal 打开/关闭、移动宽度和零 console warning/error 只读证明；不确认真实删除 |
| protection | 本片不改 SDK source/generated package、RN business 或 desktop 脚本；不执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build/sync |

## 98. W6.a6.20.42 Settings Logout Modal Lifecycle Contract

> OWNER AXIOM: 远端 logout、本地凭据、WebSocket、来电媒体和账号数据库清理继续属于 `WebIMRuntime.signOut`；H5 本片只收敛用户确认层生命周期，不复制退出状态机。

| layer | contract |
| :--- | :--- |
| RN truth | 通用设置点击“退出登录”后展示“退出登录 / 确认退出当前账号？ / 取消 / 退出”；确认后才调用既有 logout owner；RN source/caller 冻结 |
| modal owner | 退出确认复用全局 `InteractionModal` 原生 dialog top-layer、Esc、焦点圈定、背景 inert、遮罩关闭和 reduced-motion；独立组件保留退出动画期间的可见内容 |
| pending | `signingOut=true` 时遮罩、Esc、取消和重复确认全部 fail-closed；成功由 runtime snapshot 与 replace route 清场，失败关闭确认并显示真实错误 |
| shared runtime | 页面仍只调用 `runtime.signOut()`；远端 logout 失败时继续由 runtime finally 清理本地 session/socket/account DB，不新增 fetch、token 或假成功分支 |
| exclusion | 版本更新普通/强制关闭语义不属于本片；不修改 `MeVersionUpdateDialog`，避免混合不同 modal policy |
| acceptance | focused component contract tests、H5 full tests/typecheck/build；5176 `/me/settings` 打开、Esc、遮罩、取消、移动宽度和零 console warning/error证明；不点击最终退出 |
| protection | 本片不改 SDK source/generated package、RN business 或 desktop 脚本；不执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build/sync |

## 99. W6.a6.20.43 Global Reset, Navbar And Route Motion Contract

> UI FOUNDATION AXIOM: 浏览器默认控件样式、详情页顶栏和 SPA 入场动效各自只有一个 H5 owner；不得为已有 CSS/React Router 能力引入第二套 UI 组件库。

| layer | contract |
| :--- | :--- |
| reset | `app.css` 单一清除 button 的原生 appearance、margin、padding、border、background 与非键盘 focus outline；显式页面 border 和 `:focus-visible` 可访问性焦点必须保留 |
| navbar | 可寻址详情/选择页统一追加 `im-page-navbar`，由全局 CSS 固定 safe-area、56px 三列、24px 图标、居中单行标题和左右动作；页面 class 只保留背景/业务差异，不再决定基础几何 |
| exclusions | 主 Tab 首页标题、聊天资料复合头、登录品牌头、媒体全屏头、dialog/sheet 内标题和内容 section header 不是详情页 navbar，不强制套用该 class |
| motion | 继续使用既有 `RouteMotionController + interaction.css`；React Router pathname 变化只给当前 main 播放 160ms 轻量入场，固定 TabBar 不闪动，reduced-motion 关闭动画 |
| dependency | 不引入 UI/motion library；当前能力无需新增运行依赖，避免 RN 样式被组件库覆盖或形成第二 modal/navbar/motion owner |
| acceptance | reset/navbar contract tests、H5 full tests、466 assets、typecheck、production build；5176 至少覆盖设置、资料、群/联系人详情的按钮边框、navbar 几何、路由入场和移动宽度 |
| protection | 本片只改 H5 UI/文档；不改 SDK source/generated package、RN business 或 desktop 脚本，不执行任何 SDK/RN/Desktop build/sync |

## 100. W6.a6.20.44 Structured Group System Notice Contract

> OWNER AXIOM: 群系统消息的 `event_type + system.extra -> 用户可见文案` 属于 shared SDK；平台只决定消息在会话列表或聊天页中的视觉位置。

| layer | contract |
| :--- | :--- |
| RN truth | `group_description_changed` 按 `operator_user_id/operator_nickname` 输出“你/昵称更新了[群简介]”；`group_send_frequency_changed` 按 enabled/seconds 输出开启间隔或关闭文案；RN source/caller 冻结 |
| shared parser | `parseIMGroupSystemMessagePresentation` 兼容 core `Message.payload`、Gateway `body.system`、`payload.body.system` 与 RN 顶层 `system`；只识别上述两个稳定 event，不读取或信任 `system.text` 生成结构化文案 |
| realtime | OpenAPI 已明确 `1521/group_description_changed`，Gateway WebSocket event classifier 必须把 `1521` 归为 `message`；发言频率没有已发布 numeric type，不新增猜测映射，只在消息进入后按 event 解析 |
| Web consumers | 聊天页与会话列表都先消费 shared presentation，再回退现有媒体、文本和系统摘要；不得在两个页面各自解析 `system.extra` |
| failure | 非对象、未知 event、畸形 extra 返回 `null`；`1521` 无结构化 event 时保留既有静态“群简介已更新”降级，不伪造操作者；未知 numeric type 不扩展支持范围 |
| convergence | Web production callers 消费 shared parser；RN 现有等价 helper 冻结，状态 `shared-core-ready/web-consumed/rn-frozen`，只有独立 RN 授权后才能替换 caller |
| acceptance | SDK parser/realtime focused tests、H5 chat/list projection tests、runtime boundary、SDK/H5 typecheck、仅 `build:web/sync:web`、H5 full tests/build；真实 `1521`/频率消息视觉和双账号 realtime 保持 natural-data gate |
| protection | 不修改 `im28-phone/src/**`、RN generated package、Desktop 或 `build:package:desktop:web`；不执行 RN/Desktop/build:all build/sync |

## 101. W6.a6.20.45 Friend-Added Message Presentation Contract

> OWNER AXIOM: type1201 好友关系建立通知的稳定类型和中文文案属于 shared SDK；聊天页、会话摘要和未读边界不得分别维护常量。

| layer | contract |
| :--- | :--- |
| RN truth | type `1201` 在聊天页与会话列表都显示“你们已经成为好友，可以开始聊天了”，并在初始未读边界中作为特殊关系通知处理；RN source/caller 冻结 |
| shared owner | `IM_FRIEND_ADDED_MESSAGE_TYPE`、`IM_FRIEND_ADDED_MESSAGE_TEXT` 和 `getIMFriendAddedMessageText(contentType)` 统一定义身份与纯展示；未知类型返回 `null` |
| shared reuse | `initial-unread-navigation` 必须复用 shared 类型常量，不保留第二个私有 1201；函数不读取 payload、不调用 Gateway 或数据库 |
| Web consumers | H5 聊天气泡与会话摘要共同调用 shared projection；删除两个页面内的 1201 文案硬编码，其他系统类型和列表 label 不变 |
| evidence | 真实登录态会话列表已出现 type1201 且当前展示 `[contentType=1201]`，因此摘要缺口不是 sample gate；聊天页已有等价行为 |
| convergence | Web production callers 消费 shared owner；RN caller 冻结，状态 `shared-core-ready/web-consumed/rn-frozen` |
| acceptance | SDK pure helper/未读边界 tests、H5 chat/list tests、boundary/typecheck、仅 build:web/sync:web、H5 full tests/build；5176 真实目标行应显示 RN 文案且 console 为空 |
| protection | 不修改 `im28-phone/src/**`、RN generated package、Desktop 或 `build:package:desktop:web`；不执行 RN/Desktop/build:all build/sync |

## 102. W6.a6.20.52 Forward Target Pull Refresh Contract

> OWNER AXIOM: 转发目标的会话、好友和群聊事实继续属于既有 shared facades；H5 只拥有浏览器触摸手势和刷新提示，不复制目标解析或转发提交状态机。

> SUPERSEDED: `.54` 已删除独立转发目标页并改为聊天内统一目标弹窗；本节只保留 `.52` 当时验收证据，不再是当前 UI/route 合同。

| layer | contract |
| :--- | :--- |
| RN truth | 普通转发选择器在最近聊天/好友/群聊三 Tab 列表顶部用 `RefreshControl` 重读三类数据；搜索词和当前 Tab 不因刷新清空；RN source/caller 冻结 |
| Web gesture | `/conversations/:conversationID/forward` 复用全局 `usePullRefresh/PullRefreshIndicator` 的单指、顶部、阈值、释放与三态语义；`location.state` 缺失继续按既有 contract 安全退出 |
| shared reads | 页面只调用既有 `loadChatForwardTargets({ sync })`；cache-first 首入继续读取三类缓存，手动刷新不回显中间 cache；底层仅消费 `conversations.sync/contacts.list/groups.sync` |
| atomic view | 手动刷新三个 facade 全部成功后才替换 `ChatForwardTargetSource`；任何失败保留当前三类目标、active Tab 和 keyword，并展示真实错误 |
| concurrency | 首次 loading、用户 refreshing 或目标 opening 时拒绝新的下拉；目标会话解析、Router state 与 `messages.forward` 提交主链不变 |
| acceptance | focused 4 files/8 tests、full 107 files/332 tests、466 assets、typecheck、1158-module build；5176 真实 3/2/1 三类目标、搜索/清除、三 Tab、412/412 与零 warning/error 通过，物理触摸释放 gated |
| protection | 本片不改 SDK source/generated package、RN business 或 desktop 脚本；不打开真实目标、不提交转发，不执行任何 SDK/RN/Desktop build/sync |

## 103. W6.a6.20.53 Pull Refresh Indicator Owner Convergence Contract

> UI OWNER AXIOM: 浏览器下拉手势和三态提示分别只有一个 H5 owner；页面可以注入不同 refresh callback，但不得复制提示 DOM/CSS 或业务同步逻辑。

| layer | contract |
| :--- | :--- |
| RN truth | 已迁移列表继续按各自 RN `RefreshControl` 调用现有业务刷新；RN source/caller 冻结，本片不改变任何刷新行为 |
| gesture owner | `usePullRefresh` 继续唯一负责顶部单指、阻尼、阈值、释放与取消；页面继续注入原 refresh callback，不新增数据访问 |
| presentation owner | `PullRefreshIndicator` 唯一投影“下拉刷新/松开刷新/正在刷新”、高度、armed 色和 reduced-motion；全部 hook 生产消费者必须引用它 |
| delete | Calls、Contacts、JoinedGroups、CreateGroup、会话/归档/搜索、群成员、添加管理员、转让群主的手写 DOM 与局部 `rn-*-pull` CSS 删除，不保留 compat |
| behavior preservation | 各页 refreshing/loading 传值保持原语义；搜索页仅已提交查询的 loading 展示刷新高度；添加管理员/转让群主仍只展示手势距离，不把首次加载冒充刷新 |
| acceptance | 20/20 consumer + legacy selector zero contract、focused 5 files/10、full 108 files/334 tests、466 assets、typecheck、1158-module build；5176 四路由零旧 class/零日志只读 smoke，物理触摸 gated |
| protection | 本片不改 refresh callback、SDK source/generated package、RN business 或 desktop 脚本；不执行 mutation 或任何 SDK/RN/Desktop build/sync |

## 104. W6.a6.20.54 Unified Chat Target Picker And Short-List Bottom Alignment Contract

> OWNER AXIOM: 好友/群聊目标选择是一个 H5 presentation owner；跨目标转发、名片/图片 batch-send、逐目标结果和 success-only cache 收敛属于 shared SDK。短消息贴底只改变内部排版，不改变外层滚动、未读或历史分页语义。

| layer | contract |
| :--- | :--- |
| RN truth | 二维码分享使用底部弹层、搜索、好友/群聊 Tab 与选中计数；聊天短列表从输入区上方底部开始；RN source/caller 冻结 |
| picker owner | `ChatTargetPickerModal` 可配置 `single|multiple`、目标类型、排除身份、初始选择和上限；多选显示 `ALL`，只切换当前 Tab 当前搜索结果并保留另一 Tab 已选项 |
| consumers | 聊天转发直接在当前 `/conversations/:conversationID` 打开；群发、二维码、用户/群名片 route shell 只恢复来源/导航后打开同一弹窗，不复制目标 DOM/CSS |
| shared mutations | `messages.forwardToTargets` 在 shared queue 内冻结来源并逐目标复用 canonical forward；`messageBroadcast.sendCard/sendImage` 统一 batch-send、逐目标 sent/failed/unknown 和 success-only SQLite 事务 |
| failures | 全失败保留弹窗；部分成功显示成功/未成功数量并锁定重复提交；目标加载失败不伪造空成功，关闭始终可用 |
| list layout | `.rn-chat-message-list` 保持唯一 overflow/scroll owner；内部 `.rn-chat-message-stack` 使用 100% 最小高度和 `justify-content:flex-end`，内容超屏后自然增长并继续由外层滚动 |
| verification | SDK focused 3 files/13 tests、all-runtime boundary/typecheck；H5 full 109 files/337 tests、typecheck、1161-module build；5176 登录态跨 Tab ALL、URL 不跳转、同源群发弹窗与短列表 bottom-stack 只读通过；`.124` 追加当前转发弹窗 760×900 light、720px 居中、跨 Tab/ALL/取消与零发送证据 |
| protection | `im28-phone` worktree clean；只执行 `build:web/sync:web`；不执行 RN/Desktop/build:all 或修改/执行 `build:package:desktop:web`；真实发送需显式授权 |

## 105. W6.a6.20.55 Chat Initial Message Skeleton Parity Contract

> PRESENTATION AXIOM: 聊天首屏 loading 只投影既有加载状态；骨架不得创建消息、缓存或业务成功路径，也不得使用与 RN 无关的随机/交替布局。

| layer | contract |
| :--- | :--- |
| RN truth | 固定 12 条 incoming 骨架循环使用 188x58、236x76、142x44、210x58；群聊每条显示 24px 头像，单聊不显示；使用左侧 skeleton tail 和 2.2s 横向 shimmer；容器底部对齐并裁切顶部；RN source/caller 冻结 |
| H5 owner | `ChatMessageSkeleton.tsx + chat-message-skeleton.css` 唯一持有上述几何、资产和动画；`ChatMessageList` 只传入 `isGroup` 并遵循既有 `loading && messages.length === 0` 条件 |
| layout | `.rn-chat-message-stack` 是骨架定位上下文；骨架 `absolute/inset:0/justify-content:flex-end/overflow:hidden`，不撑大外层 scroll、不会改变历史分页、未读定位或短消息贴底 |
| delete | 删除旧的 4 条左右交替 pulse bar JSX/CSS，不保留兼容选择器、随机尺寸或第二 loading component |
| accessibility | loading container 暴露 `role=status` 与“正在加载消息”；纯头像、tail、shimmer 不增加重复可读内容；reduced-motion 关闭 shimmer |
| acceptance | focused behavior tests 锁 12 行、群/单聊头像差异、四档 RN 尺寸与 tail 资产；H5 full tests、466 assets、typecheck、production build、真实短群聊底部几何/稳定 reload；自然瞬态截图允许因本地 cache 过快保持 timing gate |
| protection | 本片不修改 SDK source、generated business contract、RN business 或 desktop 脚本；不执行 RN/Desktop/build:all 或 `build:package:desktop:web` |

## 106. W6.a6.20.56 Legacy Chat Forward Route Compatibility Contract

> COMPATIBILITY AXIOM: 旧转发地址只能恢复到当前唯一聊天内目标弹窗，不得重新拥有页面 UI、目标读取、缓存、提交或 mutation 逻辑。

| layer | contract |
| :--- | :--- |
| primary path | 新入口和生产交互唯一使用 `ChatPage -> ChatTargetPickerModal`；目标加载与选择 presentation 不得回到独立 route page |
| legacy route | `/conversations/:conversationID/forward` 只渲染 `ChatForwardCompatibilityRedirect` 并 replace 到 canonical chat URL；直接访问、缺 state 或坏 state 也必须安全回聊天，不显示 404 |
| state contract | 只接受既有 `chat-forward` 稳定身份、1–100 个非空 client message ID；拒绝 `messages`、`payload` 和消息正文；来源会话必须同时匹配 route conversation ID 与加载后的当前 Conversation |
| replay | 有效兼容 state 只打开现有目标弹窗一次，随后 replace 清除；reload/back 不得再次打开；失配 state 仅清除，不触发目标读取或发送 |
| delete-or-register | 兼容 route 明确登记为 `compatibility-only`；`ChatForwardTargetPage`、旧 CSS、第二 target source 和第二 mutation owner必须保持不存在；发布的历史深链/浏览器历史不再支持时删除 redirect |
| acceptance | pure route tests、consumer structural contract、H5 full tests/typecheck/build/diff check；真实登录态旧 URL、reload、back、聊天内容和 console 只读验收 |
| protection | 不修改 SDK source/generated package、`im28-phone` business 或 Desktop；不执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync；真实转发仍需显式授权 |

## 107. W6.a6.20.57 Primary Contacts Tab Verification Badge Contract

> STATE OWNER AXIOM: 主 Tab 生命周期内申请未读只能有一个 H5 状态 owner；TabBar 与通讯录 shortcut 必须读取同一快照，服务端事实继续唯一来自 shared SDK facade。

| layer | contract |
| :--- | :--- |
| RN truth | 通讯录 Tab 角标等于好友申请未读加群申请总数；零值隐藏，三位数加宽，超过 999 才显示 `999+`；RN source/caller 冻结 |
| shared reads | 只调用既有 `friendApplications.getUnreadCount` 与 `groupApplications.getUnreadCount`；页面不得新增 Gateway、SQLite、DTO mapper 或缓存替换 |
| H5 owner | `PrimaryTabsLayout` 挂载唯一 `useVerificationUnreadCounts`；`PrimaryTabBadgeProvider` 向 `PrimaryTabBar` 与 `ContactsPage` 暴露同一 counts/refresh |
| refresh | 登录态主布局首次挂载、进入通讯录和通讯录下拉均可刷新；同 runtime/账号的并发读取合并；旧 runtime/账号结果不得回写当前账号 |
| full-screen route | 验证消息页在主 Tab 壳外，可独立复用同一 hook 实现；这不构成主 Tab 生命周期内第二状态 owner |
| delete | 四个主 Tab 均已迁移，nullable href、disabled button 与相关 CSS 必须删除，不保留占位/compat 分支 |
| acceptance | 组件角标合同、验证刷新合同、H5 full tests/typecheck/build/diff check；真实四 Tab SPA 路由、零值隐藏；非零视觉等待自然数据，不执行申请 mutation |
| protection | 本片不修改 SDK source/generated package、`im28-phone` business 或 Desktop；不执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

## 108. W6.a6.20.58 Primary Tab Scene Retention Contract

> LIFECYCLE OWNER AXIOM: React Router 唯一持有主 Tab URL；`PrimaryTabsLayout` 唯一持有四个页面实例、可见性和滚动保留，不得让 route element 或页面自身形成第二生命周期 owner。

| layer | contract |
| :--- | :--- |
| RN truth | RN `ChatHomeScreen` 用四个 React `Activity` 保留 chats/contacts/calls/me 页面状态并暂停隐藏副作用；RN source/caller 冻结 |
| SPA URL | `/conversations`、`/contacts`、`/calls`、`/me` 必须继续由 React Router 匹配；leaf route 只允许显式空 marker，不渲染第二页面实例或产生 missing-element warning |
| H5 lifecycle | `PrimaryTabsLayout` 常驻四个 `PrimaryTabScene`；每个 scene 内只存在一个对应页面 `Activity`；认证、详情、设置和 404 不进入该壳 |
| scroll | scene 外层是唯一滚动容器；只保存 visible 场景的真实 scroll event，恢复可见后还原；Activity 隐藏导致的内容归零不得覆盖保存值 |
| integration | `usePullRefresh` 同时检查 window/页面/scene 顶部；通讯录索引回顶写当前 scene；route motion 只选择 active scene；业务 facade、cache 和 mutation 不变 |
| delete-or-register | 删除 Outlet-owned 主页面实例路径；禁止页面级 keep-alive wrapper、第二 tab shell、重复场景 store 或 test-only production branch |
| acceptance | focused lifecycle/refresh/navigation tests、H5 full tests、SDK Web regression、typecheck/boundary/build/diff check；真实账号跨 Tab 搜索与滚动保留、唯一 active、geometry/overflow 和 clean-reload console proof |
| protection | 不修改 SDK source、`im28-phone` business 或 Desktop；如门禁执行 `build:web/sync:web`，只允许同步 Web package；禁止 RN/Desktop/build:all/`build:package:desktop:web` |

## 109. W6.a6.20.59 Calls Edit Chrome Parity Contract

> CHROME OWNER AXIOM: 通话编辑页只能报告自身是否需要全屏；全局 TabBar 的可见性和主场景高度必须继续由 `PrimaryTabsLayout` 唯一决定。

| layer | contract |
| :--- | :--- |
| RN truth | RN `CallListScreen` 在 active 编辑态通过 `onChromeHiddenChange(true)` 隐藏 `ChatHomeScreen` TabBar，并在完成、隐藏或 cleanup 时恢复；RN source/caller 冻结 |
| H5 owner | `PrimaryTabsLayout` 唯一持有 `callsChromeHidden`、认证 guard 和 `PrimaryTabBar` render；`CallsPage` 只报告 `editing`，不得直接查询或操作主导航 DOM |
| lifecycle | 编辑状态变化立即上报；Activity 隐藏、route/layout 卸载或账号切换 cleanup 必须报告 false，避免后续主 Tab 被陈旧状态隐藏 |
| layout | 编辑态移除主 TabBar 及其 scene space；`rn-call-edit-bar` 固定视口底部并包含 browser safe area；列表保留不小于 edit bar 的底部空间 |
| business boundary | `runtime.getSync().calls`、SQLite cache、远端同步、批量删除确认、RTC 和详情 route 不变；本片不得修改 SDK 或形成 H5 业务分支 |
| delete-or-register | 删除 edit bar 叠在 TabBar 上方的双 chrome；禁止页面级第二 tabbar、keep-alive wrapper、Gateway/Repository/cache/mutation owner |
| acceptance | visibility pure tests、layout/callback contract、H5 full tests/typecheck/build/diff scan；真实登录态编辑前/中/后 tabbar/editbar count、scene/editbar geometry、列表留白、overflow 和 console 只读验收；不执行删除 |
| protection | 不修改 SDK source/generated package、`im28-phone` business 或 Desktop；不执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

## 110. W6.a6.20.60 Me Home Menu Grouping Parity Contract

> PRESENTATION AXIOM: 个人中心菜单分组只属于 H5 页面组合；既有资料、设置和安全 route/facade 不得因视觉对齐产生第二状态 owner。

| layer | contract |
| :--- | :--- |
| RN truth | 个人资料与通用设置位于第一张卡，账号安全位于独立第二张卡；两卡间距 16px；RN source/caller 冻结 |
| H5 presentation | `/me` 使用两份 `.rn-me-menu-card`；第一卡固定 profile/settings 顺序，第二卡仅 security；三个入口继续使用既有 React Router URL |
| business boundary | profile current、settings、security credential、auth、SDK 和 route 语义完全不变；页面不得为分组新增 facade 或状态 |
| rejected substitution | RN 会话标题的账号静音来自 OpenIM `globalRecvMsgOpt`；Gateway `setting.notification` 只表示通知偏好，二者禁止互相替代 |
| deferred capability | Web 若补会话账号静音，必须先在 shared SDK 冻结 OpenIM Web 用户设置 read/update/event contract；在此之前不展示图标、不隐藏全局未读 |
| acceptance | H5 structure contract、full tests/typecheck/build/diff scan；真实账号 2/1 card rows、16px gap、equal width、zero overflow/log browser proof |
| protection | 不修改 SDK source/generated package、RN business 或 Desktop；不执行 RN/Desktop/build:all/`build:package:desktop:web` |

## 111. W6.a6.20.63 Me Home Profile Edit Shortcut Contract

> OWNER AXIOM: 个人中心首页快捷动作只能导航到既有资料 owner；头像来源、裁剪、上传、资料保存与昵称保存不得在首页复制。

| layer | contract |
| :--- | :--- |
| RN truth | 首页头像可进入“修改头像”，昵称可进入“编辑昵称”；RN source/caller 冻结 |
| avatar route | `/me` 通过 React Router 进入 `/me/profile` 并传递瞬时 `openAvatarSource:true`；资料页只打开既有 `AvatarSourceActionSheet` |
| nickname route | `/me` 直接进入既有 `/me/profile/nickname`；加载、校验、unchanged 与 update-profile 语义保持不变 |
| replay guard | 未知、字符串或相似真值必须 fail-closed；精确动作首次消费后 replace 清空当前 history state，reload/back 不得重放来源 sheet |
| primary owners | 头像为 `/me/profile -> profile.updateAvatar`；昵称为 editor -> `profile.update`；首页不得持有 File、Blob、Gateway、SQLite、DTO 或 mutation 状态 |
| platform exclusion | RN 网络设置依赖原生 HTTP/OpenIM HTTP/SOCKS proxy；浏览器无等价 per-app fetch/WebSocket 代理注入，H5 禁止保存后无效的假设置 |
| acceptance | route contract、state behavior、H5 full tests/typecheck/build/diff；真实账号打开/取消/reload/nickname route/零溢出；真实上传和保存需独立授权 |
| protection | 不修改 `im28-phone` business；只允许 Web build/sync，不执行 RN/Desktop/build:all/`build:package:desktop:web` |

## 112. W6.a6.20.64 Me Profile ID Clipboard Contract

> SUCCESS AXIOM: 复制成功只能由浏览器 Clipboard API 的真实 resolve 产生；按钮点击、定时器或 UI 状态不得制造 fake-success。

| layer | contract |
| :--- | :--- |
| RN truth | RN 个人资料 ID 行可点击复制当前稳定 userID，成功后显示“已复制ID”；该行无导航箭头；RN source/caller 冻结 |
| H5 owner | 本片关闭时为 me-domain `copyMeProfileUserID`；该 owner 已由 `.85` supersede，当前唯一实现是跨个人/联系人资料复用的 `components/clipboard/user-id-clipboard.copyUserIDToClipboard` |
| identity | 只允许 trim 后非空 userID 写入；不得复制昵称、账号、手机号等可变展示值，也不得改变 profile/runtime identity |
| failure | Clipboard API 缺失、空 ID 或 `writeText` rejection 必须 reject 并由页面 fail-visible；失败不得显示成功、静默降级或 fake copy |
| presentation | `/me/profile` ID 行使用 button 语义但保持 RN 无箭头行视觉；成功反馈 1.2s 后消失且 reload 不持久化；操作不改变当前 React Router URL |
| business boundary | 不新增 Gateway、SQLite、DTO、cache、认证、profile mutation 或跨域 clipboard 状态；其他 feature 的平台 I/O 不在本片迁移 |
| acceptance | helper behavior、页面 wiring、H5 full verify/typecheck/build/diff；真实账号点击、反馈、消失、reload、URL、border/overflow proof；禁止为验证读取用户剪贴板内容 |
| protection | 不修改 SDK source/generated package、`im28-phone` business 或 Desktop；不执行 RN/Desktop/build:all/`build:package:desktop:web` |

## 113. W6.a6.20.65 Muted At-Self Conversation Reminder Contract

> PRIORITY AXIOM: 会话静音只降低普通未读；命中当前用户的定向提醒继续保留数字角标，`@所有人` 不得被误判为 `@当前用户`。

| layer | contract |
| :--- | :--- |
| RN truth | 非静音数值未读显示数字 badge；静音普通未读显示 `[n条]` 摘要前缀和红点；静音 `@当前用户` 保留原摘要并显示数字 badge；手动未读只有红点 |
| H5 owner | `conversation-unread-view.ts` 唯一持有定向提醒识别和数字 badge 判定；摘要 helper 与 `ConversationRow` 必须共同消费，禁止各自维护字符串规则 |
| mention scope | 只接受 RN 已发布的 `text.endsWith(' @你')` 或 `[有人@我]` 前缀；`[所有人]` 仍按普通静音未读处理，不提升为定向提醒 |
| state boundary | 页面只读取 `isMuted/unreadCount/manualUnread` 和 shared preview；不得写会话、发送 read receipt、切换 mute、更新 SQLite 或触发 realtime |
| delete-or-register | 旧的 `conversation.isMuted || manualUnreadOnly` 红点总分支直接退出；不保留 wrapper、feature flag、compat 或 test-only production path |
| acceptance | behavior matrix、组件 wiring contract、H5 full verify/typecheck/build/diff/entropy；真实单标签账号需存在静音 @我样本才能完成像素 proof，禁止伪造 cache |
| protection | 不修改 SDK source/generated package、`im28-phone` business 或 Desktop；不执行 RN/Desktop/build:all/`build:package:desktop:web` |

## 114. W6.a6.20.66 Conversation List Presence Contract

> OWNER AXIOM: 会话列表只能消费 shared presence facade；目标选择和绿点展示属于页面，HTTP、WS、账号生命周期与状态归一化不得在 H5 重写。

| layer | contract |
| :--- | :--- |
| RN truth | 仅单聊对端参与在线查询；身份字段缺失时按 `si_/single_/direct_` 会话 ID 回退；群聊不查询；在线头像显示绿点；目标变化立即更新，每分钟与下拉刷新兜底 |
| shared owner | `createIMUserPresenceSync/WebIMSync.presence` 唯一持有 100 人 HTTP 分批、先订阅后查询、realtime revision、账号隔离和 runtime clear |
| H5 composition | `getConversationPresenceUserIDs` 只选择稳定单聊身份；`useConversationPresence` 只维护 observation、60s timer、manual refresh 与内存 map；主列表和归档列表共用 |
| race safety | 账号/目标 generation 与页面 revision 阻止旧请求回写；HTTP 未返回身份保持未知，查询错误保留上次已知状态等待 realtime，不阻断会话同步 |
| presentation | `ConversationRow` 只接收 `online` 布尔投影；存在稳定单聊对端时才渲染 RN 同构 17px 背板和 10px 绿色圆点；群聊双重 fail-closed |
| forbidden | 页面不得直调 OpenAPI、建立第二 WebSocket、持久化 presence、修改 Conversation DTO、把未知当在线或以群成员身份扩大请求 |
| acceptance | pure behavior + wiring contracts、H5 full tests、SDK Web tests、verify/typecheck/build/diff/entropy；真实单标签登录态在线样本与双账号 realtime 为 browser data gate |
| protection | RN business/caller 冻结；SDK source 不改；只允许 `build:web/sync:web`，不执行 RN/Desktop/build:all/`build:package:desktop:web` |

## 115. W6.a6.20.67 Archived Conversation Pinned Background Contract

> PRESENTATION AXIOM: 归档通栏背景只投影当前已加载会话的置顶事实；不得为样式对齐新增归档同步、缓存或状态 owner。

| layer | contract |
| :--- | :--- |
| RN truth | 主会话 header 只在可见列表含置顶会话时使用置顶背景；归档通栏在可见或归档列表任一含置顶会话时使用置顶背景；RN source/caller 冻结 |
| H5 owner | `shouldUsePinnedArchiveBackground(visibleItems, archivedItems)` 唯一计算通栏状态；`ConversationsPage` 只追加 `is-pinned` class，CSS 复用 `--im-conversation-pinned-background` |
| invariant | 归档为空时不渲染通栏；主 header 条件不得扩大为归档集合；归档页本身、排序、未读、presence、长按和取消归档保持不变 |
| business boundary | 两个输入继续来自既有 `conversations.listCachedItems/syncArchived`；不得新增 Gateway、SQLite、DTO、Repository、缓存替换或 pin/archive mutation |
| acceptance | pure behavior + raw wiring contract、H5 full、SDK Web regression、typecheck/boundary/assets/build/diff；真实像素仅在自然置顶归档样本和单标签 SQLite writer 条件满足时通过 |
| protection | 不修改 SDK source、`im28-phone` business 或 Desktop；验证只允许 `build:web/sync:web`，禁止 RN/Desktop/build:all/`build:package:desktop:web` |

## 116. W6.a6.20.68 Archived Conversation Global Action Menu Contract

> OWNER AXIOM: 主会话、归档会话与通讯录只能消费同一个全局操作菜单；页面不得各自复制气泡状态或四条能力路由。

| layer | contract |
| :--- | :--- |
| RN truth | `ConversationListScreen` 在 `main/archive` 两种 mode 都用 `GroupActionBubble` 展示扫一扫、开始群聊、添加朋友、群发消息；归档页左侧仍是返回，RN source/caller 冻结 |
| H5 owner | `HomeActionMenu` 唯一持有 open/outside-close 与 `/scan`、`/groups/create`、`/contacts/search`、`/broadcast/select` 路由；`ArchivedConversationsPage` 只能 import/render |
| presentation | `/conversations/archived` 的 `PageNavbar` 保持返回/居中标题/72px 右侧插槽，菜单触发器沿用既有 40px 无边框 `+` 与气泡样式 |
| business boundary | 不修改归档 SQLite/Gateway/sync/action、目标页 mutation、Router route table、SDK DTO/repository 或 RN business；不增加 Web 专属菜单 helper/compat |
| acceptance | fail-first raw wiring、归档 background/presence regression、H5 full、SDK Web regression、verify/typecheck/boundary/assets/build/diff/cleanup；真实像素需单标签登录态 |
| protection | 不修改 SDK source、`im28-phone` business 或 Desktop；验证只允许 `build:web/sync:web`，禁止 RN/Desktop/build:all/`build:package:desktop:web` |

## 117. W6.a6.20.69 Group Announcement Entry Role Visibility Contract

> VISIBILITY AXIOM: 群公告设置入口与公告发布权限是两个事实；客户端不得因当前账号不能发布而隐藏 owner/admin 的只读查看入口。

| layer | contract |
| :--- | :--- |
| RN truth | `GroupSettingsScreen` 仅在当前成员存在且角色不是普通成员时显示公告卡；`GroupAnnouncementScreen` 再按编辑权限决定是否出现发布动作 |
| H5 projection | `buildChatSettingsView` 仅对 matching 群的 `owner/admin` 输出 `canShowAnnouncement=true`；member 和 unrelated group 均 fail-closed |
| edit boundary | `GroupAnnouncementPage` 继续只用 shared `canEditAnnouncement` 控制编辑/发布；入口可见性不得提升编辑权限 |
| business boundary | 不修改 joined-group role/permission 归一化、公告内容/版本/已读/发布、Gateway、Repository、SQLite、realtime 或 RN caller |
| acceptance | owner/admin/member/unrelated matrix、页面 wiring、H5 full、SDK Web regression、verify/typecheck/boundary/assets/build/diff/cleanup；浏览器只读证据依赖自然角色样本 |
| protection | 不修改 `im28-phone/src/**`、SDK source/generated behavior 或 Desktop；不执行任何公告/角色 mutation，不运行 RN/Desktop/build:all/`build:package:desktop:web` |

## 118. W6.a6.20.70 Auto Delete Entry Hierarchy And Owner Permission Contract

> LOCATION AXIOM: 自动删除的 mutation 可以共用同一 shared facade，但入口位置和群聊授权必须遵循 RN；客户端不得把“可清空群消息”推断为“可配置群自动删除”。

| layer | contract |
| :--- | :--- |
| RN truth | 单聊设置首页显示“定时删除”；群聊设置首页不显示，群管理页仅 `canManageAdmins` 群主显示“定时删除消息” |
| H5 projection | 单聊 `ChatSettingsPage` 消费唯一入口组件；群聊 `GroupManagementPage` 仅在 matching group 的 `permissions.canManageAdmins` 为真时消费；管理员/member/无群缓存均 fail-closed |
| route owner | 两个入口均进入既有 `/conversations/:conversationID/settings/auto-delete`；`ChatAutoDeletePage` 继续使用 `canManageChatAutoDelete` 做最终授权，并调用 `sync.conversations.getAutoDelete/setAutoDelete` |
| business boundary | 不修改自动删除 DTO、Gateway、Repository、SQLite、cache convergence、系统消息、RN caller 或 Desktop；不复制秒数档位和格式化规则 |
| acceptance | fail-first role/location contract、focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build/diff/cleanup；浏览器只读证据依赖自然单聊和群主样本 |
| protection | 不修改 `im28-phone/src/**` 或 SDK source/generated behavior；不执行自动删除保存 mutation，不运行 RN/Desktop/build:all/`build:package:desktop:web` |

## 119. W6.a6.20.71 Contact Search Local Joined Groups Contract

> LOCAL SEARCH AXIOM: 联系人搜索的本地结果必须同时覆盖已缓存好友和已加入群聊；“本地”描述数据来源，不允许把已有群误导到服务器搜索主路径。

| layer | contract |
| :--- | :--- |
| RN truth | 页面加载好友、已加入群聊与群会话；输入关键词后按好友在前、群聊在后合并，群名和群 ID 可匹配；本地群点击直接解析会话并进入聊天 |
| H5 projection | `buildContactSearchLocalResults(contacts, groups, keyword)` 复用既有好友/群过滤规则并保持各 facade 顺序；空关键词返回空结果 |
| runtime | `ContactSearchPage` 独立读取 `contacts.list()` 与 `groups.listCached/sync()`；任一失败不清空另一类成功结果；本地群点击只调用 `conversations.openGroup` |
| presentation | 本地群与服务器群复用 `ContactSearchGroupRow` 的 72px 行、头像、关键词高亮和描述；本地群固定 joined，不显示申请/待通过动作 |
| business boundary | 不新增 Gateway、Repository、SQLite、群搜索 DTO、cache 或 navigation owner；服务器好友/群聊搜索及群申请链不变 |
| acceptance | merge/filter pure tests、raw wiring、H5 full、SDK Web regression、verify/typecheck/boundary/assets/build/diff/cleanup；真实像素依赖现有单标签账号的非空已加入群样本 |
| protection | 不修改 SDK source/generated、`im28-phone/src/**` 或 Desktop；不执行群申请或其他 mutation，不运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-session-gated`。`buildContactSearchLocalResults` 复用联系人与已加入群的既有 filter，稳定输出好友后群聊；页面独立等待 contacts/groups facade，部分失败保留成功结果，本地群只经 shared `conversations.openGroup` 进入会话。Fail-first 与 focused 2 files/10 tests、H5 full 123/380、SDK Web 98/406、466 assets、typecheck、runtime boundary、1174-module build、diff/cleanup 全绿；仅有既有 >500kB chunk warning。自动化浏览器没有可复用标签，未创建第二登录态或 SQLite writer，因此非空群结果、点击和 412px 像素保留 session gate。SDK source、RN protected source、Desktop 和服务器搜索/申请链无本片改动；只运行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web`。

## 120. W6.a6.20.72 Contact Search Group Conversation Fallback Contract

> FALLBACK AXIOM: group conversation cache 只能补齐本地搜索可见性，不能被提升为完整群资料、成员身份、权限或群生命周期真相。

| layer | contract |
| :--- | :--- |
| RN truth | `ContactSearchScreen.loadLocalData` 并行读取好友、已加入群和会话；先按 groupID 收集 joined groups，再把缺失的 group conversation 投影为群项 |
| H5 projection | `buildContactSearchLocalResults(contacts, groups, conversations, keyword)` 先收集 joined groups，再补 `type=group`、稳定 targetID 的 conversation；按 groupID 去重并保持好友后群聊顺序 |
| fallback fields | 仅允许 `groupID=targetID`、`conversationID`、`name`、`faceURL`；未知名称回退 groupID，成员数/简介/角色/权限/状态不得推断 |
| runtime | 页面只增加 `conversations.listCached()` 独立读取；groups sync 失败不清除 conversation fallback，conversation 失败不清除 joined groups |
| navigation | fallback 点击仍调用 shared `conversations.openGroup({groupID, conversationID})`；不得直接信任 route 或绕过 SDK 身份校验 |
| business boundary | 不新增 SDK/Gateway/Repository/SQLite/cache writer，不写回 groups cache，不改变服务器搜索、群申请、群管理、RN caller 或 Desktop |
| acceptance | fallback/dedupe/filter pure tests、raw wiring、H5 full、SDK Web regression、verify/typecheck/boundary/assets/build/diff/cleanup；真实像素依赖自然 conversation-only 群样本 |
| protection | 不修改 SDK source/generated、`im28-phone/src/**` 或 Desktop；不执行 mutation，不运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-sample-gated`。`buildContactSearchLocalResults` 先保留 joined groups，再用合法 group conversation 按 groupID 补缺；fallback 不携带成员、角色、权限或状态事实，点击继续调用 shared `conversations.openGroup`。Fail-first 与 focused 2 files/12 tests、H5 full 123/382、SDK Web 98/406、466 assets、typecheck、runtime boundary、1175-module build、diff/cleanup 全绿；仅有既有 >500kB chunk warning。`/contacts/search` 本地运行态返回 HTTP 200，但当前未取得自然 conversation-only 群样本，未注入伪数据或创建第二 SQLite writer，因此真实结果与点击像素保持 data gate。SDK source 与 RN protected source 无本片新增；只运行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web`。

## 121. W6.a6.20.73 Contact Search Profile Return State Contract

> ROUTE STATE AXIOM: React Router state 只能恢复搜索 presentation，不是资料、关系或权限真相；任何未知字段必须 fail-closed 丢弃。

| layer | contract |
| :--- | :--- |
| RN truth | `ContactSearchScreen -> openUserProfile` 保持原 screen 实例；关闭资料查看器后关键词、本地/服务器模式和当前页签不变 |
| H5 entry | `ContactSearchUserRow` 进入资料 route 时携带 `backHref=/contacts/search` 与受控 search state；local 结果记录 `serverTab=null`，服务器结果记录实际 tab |
| H5 return | `ContactProfileHeader` 仅当解析后的 backHref 为 `/contacts/search` 时消费白名单 search state，并使用 React Router `Link` 返回恢复页面；资料业务页不拥有搜索状态 |
| state schema | `searchKeyword=trim+slice(0,100)`；`serverTab=friends|groups|null`；未知、外部 URL、嵌套 DTO、token 与其他字段不得透传 |
| business boundary | 不读取或修改 Gateway、Repository、SQLite、profile/contact/group DTO、搜索结果、好友申请或 navigation history API |
| acceptance | pure state tests、raw wiring、focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build/diff/cleanup；真实浏览器验证 local/server 返回与 refresh/back |
| protection | 不修改 SDK source/generated、`im28-phone/src/**` 或 Desktop；不执行资料/关系 mutation，不运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-state-owner-converged; browser-session-gated`。搜索用户结果只携带 `createContactSearchProfileState` 生成的 `backHref/searchKeyword/serverTab`，`ContactProfileHeader` 仅在精确 `/contacts/search` 时消费 `readContactSearchProfileReturnState` 的纯 presentation 结果；未知字段、外部地址和超过 100 字的输入均 fail-closed/截断。Fail-first 3 项按预期失败后，focused 2 files/12 tests、H5 full 124/385、SDK Web 98/406、466 assets、typecheck、runtime boundary、1175-module build、diff/cleanup 全绿；仅有既有 >500kB chunk warning。自动化浏览器未暴露用户当前唯一标签，未新开第二登录态或 SQLite writer，因此 local/server 资料返回与 reload/back 像素保持 session gate。SDK source 与 RN protected source无本片新增；只运行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web`。

## 122. W6.a6.20.74 Contact Profile Child Route Context Contract

> CHILD ROUTE AXIOM: 好友申请子路由只能携带恢复资料来源所需的白名单 context；Router state 不是资料、关系、群成员或申请成功真相。

| layer | contract |
| :--- | :--- |
| RN truth | 用户资料 Viewer 打开添加好友页时关闭自身，但原搜索/扫码/群成员等页面场景仍在；添加页返回后仍可恢复资料与下层来源 |
| H5 entry | 资料页进入 `/contacts/users/:userID/add` 时调用唯一 serializer，只传已验证 profile context；无合法 context 时不传 state |
| child return | 好友申请 Header 与 `self|friend` replace 都把同一受控 context 返回资料 route；资料 Header 再按既有规则回到来源 |
| state schema | `backHref` 只接受既有 contact/conversation/scan 内部路由；搜索词最多 100 字，tab 仅 `friends|groups|null`；群会话候选 trim；来源仅允许精确 `qrcode` |
| source semantics | 搜索/群成员等入口继续使用 SDK `peerProfile.applyFriend` 默认 `user_id`；扫码 context 唯一显式传 `qrcode`，不复活 RN 已无入口的旧推断分支 |
| business boundary | 不修改申请 message、关系、Gateway、Repository、SQLite、SDK/RN/Desktop；不引入 History API、DTO state 或第二 route owner |
| acceptance | pure state + raw wiring fail-first、focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build/diff/cleanup；浏览器只读返回链，禁止执行真实申请 mutation |
| protection | 不运行 RN/Desktop/build:all/`build:package:desktop:web`；SDK source/generated 与 `im28-phone/src/**` 保持零 diff |

Closeout verdict: `clean/done-local/route-context-owner-converged; browser-readonly-pass`。`contact-profile-route-state` 唯一清洗资料子路由 context，资料页只序列化，申请页只读取扫码来源并回传，公共 Header 按目标 route 返回搜索 presentation 或完整资料来源；旧页面内 `sourceType` parser 已删除。Fail-first 按预期因 owner 缺失失败，focused 4 files/25 tests 与 allowlist 收紧后 3/15、H5 full 125/389、SDK Web 98/406、466 assets、typecheck/runtime boundary、1176-module build 和 cleanup 全绿；只有既有 >500kB chunk warning。真实当前单标签完成 `62 -> im-9162 -> profile -> add -> profile -> search`，恢复关键词和 friends tab，console 无 warning/error；未点击“加朋友”。SDK/RN/Desktop 业务无本片改动，未运行 RN/Desktop/build:all/`build:package:desktop:web`。

## 123. W6.a6.20.75 Contact Profile Common Groups Route Context Contract

> NESTED ROUTE AXIOM: 共同群聊独立 route 必须模拟 RN 资料内层覆盖的返回连续性；Router state 只恢复资料来源，不能成为群、会话或关系事实。

| layer | contract |
| :--- | :--- |
| RN truth | `UserProfileScreen` 在自身绝对覆盖层展示 `CommonGroupsScreen`；关闭后恢复同一资料实例，其下方搜索/扫码/群成员来源 scene 未被销毁 |
| H5 entry | 资料页进入 `/contacts/users/:userID/groups` 时只传既有 `createContactProfileChildRouteState(location.state)` 结果；无合法 context 时 state 为空 |
| child return | 共同群聊页继续使用公共 `ContactProfileHeader` 返回资料 route；Header 仅为精确资料目标回传已清洗 profile context |
| business boundary | `contacts.listCommonGroups`、`conversations.openGroup`、Gateway、Repository、SQLite、资料关系和好友申请均保持原 owner；不新增页面 parser 或 History API |
| acceptance | fail-first raw wiring、focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build/diff/cleanup；浏览器只读验证二级返回链，不执行群会话打开或 mutation |
| protection | 不修改 SDK source/generated、`im28-phone/src/**` 或 Desktop；不运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-context-owner-converged; browser-session-gated`。资料页共同群聊入口现在复用 `.74` 的受控 `profileRouteState`，共同群页公共 Header 自动把同一 context 返回资料；共同群分页和群会话打开逻辑未改。Fail-first 1 项、focused 2 files/6 tests、H5 full 125/389、SDK Web 98/406、466 assets、typecheck/runtime boundary、1176-module build 和 cleanup 全绿；只有既有 >500kB chunk warning。`/contacts/search` 返回 HTTP 200，但浏览器控制未取得现有登录标签，且未创建第二登录态或 SQLite writer，因此真实嵌套返回像素保持 session gate。SDK source/generated 与 RN protected source 无本片改动，未运行 RN/Desktop/build:all/`build:package:desktop:web`。

## 124. W6.a6.20.77 Group Join Application Message And Success Return Contract

> APPLICATION AXIOM: 群申请验证语、50 字符上限与空消息回退是 shared business contract；Router 成功返回只恢复来源 presentation，不得充当群关系真相。

| layer | contract |
| :--- | :--- |
| RN truth | `buildSelfGroupApplicationMessage` 按本人昵称生成 `我是{nickname}，申请加入群聊`，无昵称回退 `申请加入群聊`；`GroupJoinApplicationScreen` 最多 50 字；成功关闭当前申请 overlay |
| SDK owner | `modules/group/group-application-message.ts` 导出文案/上限；`groupApplications.apply` trim 后空值回退、超长在 Gateway 前失败，并始终发送规范 message/source body |
| H5 caller | `/groups/:groupID/apply` 读取 `profile.getCurrent` 并消费 shared helper/limit；异步资料只替换用户未编辑的缺省值；好友与群申请共用 `application-message-view` 草稿规则 |
| success navigation | Gateway resolve 后 `replace` 到白名单 `/scan|/groups/search|/contacts/search`；搜索来源恢复最长 100 字关键词、建群 selection context，联系人搜索额外固定 `serverTab=groups` |
| failure/state | profile 失败保留缺省；Gateway 失败留页；public detail 的 pending 禁重复；页面不维护本地 `submitted` 群关系假状态 |
| boundary | 不修改群关系 cache、审核、realtime、joined list、RN/Desktop；不执行真实申请，不运行 RN/Desktop/build:all/`build:package:desktop:web` |
| acceptance | fail-first；SDK/H5 focused/full、typecheck、runtime boundary、build:web sync、assets/build/diff/cleanup/RN protection；真实申请/审核/list-back 仍 mutation gate |

Reviewer verdict: operation `群申请验证语 + apply 请求约束 + 成功返回` 为 `done-local/shared-core-ready/web-consumed/rn-frozen`；无 mock shortcut、fake success、孤立 infra 或第二 Gateway/SQLite owner。生产 parity 仍受真实双账号申请、审核与加入后 list-back 阻断。

## 125. W6.a6.20.78 Conversation Home Search Result Route Replacement Contract

> ROUTE STACK AXIOM: React Router 页面必须复刻 RN overlay 的关闭语义；可刷新消息定位属于 URL，已关闭搜索层不得留在返回栈。

| layer | contract |
| :--- | :--- |
| RN truth | `ChatHomeScreen` 的两个首页搜索结果 callback 都先关闭 `HomeSearchScreen`，再打开会话；聊天退出恢复首页会话列表而非搜索 overlay |
| H5 projection | `buildConversationHomeSearchRoute(item)` 唯一返回 URI 编码后的 `href` 和字面量 `replace=true`；页面不得自行拼接第二套结果 URL |
| message focus | `type=message` 继续生成 `?messageID=`；`ChatPage` 仍是缓存窗口加载、滚动定位和 reload 恢复的唯一 consumer |
| navigation | `ConversationSearchPage` 仅执行 `navigate(route.href, {replace: route.replace})`；取消仍按用户历史 `navigate(-1)`，两种行为不可混用 |
| business boundary | 不修改搜索分区/分页/缓存聚合、消息查询/窗口、Gateway、Repository、SQLite、SDK、RN caller 或 Desktop；禁止直接 History API |
| acceptance | 普通/消息 route pure tests、H5 full、SDK Web regression、verify/typecheck/boundary/assets/build、dev route HTTP、RN protected diff、cleanup；真实 back 像素保留 session gate |
| protection | 只允许 `build:web/sync:web`；不得运行 RN/Desktop/build:all/`build:package:desktop:web`，不得刷新 RN generated package |

Closeout verdict: `clean/done-local/route-stack-owner-converged; browser-interaction-gated`。Fail-first 2 项按预期因 owner 缺失失败，focused 1 file/7 tests、H5 127/397、SDK Web 98/407、466 assets、typecheck/runtime boundary、`build:web/sync:web` 与 1181-module production build 全绿；仅保留既有 >500kB chunk warning。`/conversations/search` 返回 HTTP 200；为避免改变当前登录标签或创建第二 SQLite writer，真实搜索结果点击、浏览器后退和消息定位像素保持 interaction gate。本片无 SDK source/contract 与 RN protected source/generated 改动。

## 126. W6.a6.20.79 Contact Search Source Return Context Contract

> SOURCE SCENE AXIOM: 联系人搜索覆盖层关闭时必须恢复打开它的首页 scene；Router state 只能保存有界 presentation context，不能成为用户、群或关系事实。

| layer | contract |
| :--- | :--- |
| RN truth | `ContactSearchScreen` 覆盖会话、通讯录或归档会话；取消只关闭 overlay；资料及申请子层返回后仍保留搜索和底层 scene |
| source schema | `searchBackHref` 只允许 `/contacts|/conversations|/conversations/archived`；缺省、外部、任意内部或搜索自身地址都回退 `/contacts` |
| H5 entry/exit | `HomeActionMenu` 只记录当前 pathname；`ContactSearchPage` 通过唯一 parser 读取并以 `navigate(source,{replace:true})` 关闭搜索 |
| child chain | 搜索用户资料 state、资料子路由和联系人群申请成功返回只传递清洗后的 source；关键词与 tab 继续沿用既有 100 字和枚举限制 |
| business boundary | 不修改搜索聚合/API、profile/contact/group facade、Gateway、Repository、SQLite、关系 mutation、消息、SDK、RN caller 或 Desktop；禁止直接 History API |
| acceptance | source parser/menu/page/资料/群申请 contracts、H5 full、SDK Web regression、verify/typecheck/boundary/assets/build、route HTTP、RN protected diff、cleanup；真实三入口和子链 back 像素保持 interaction gate |
| protection | 只允许 `build:web/sync:web`；不得运行 RN/Desktop/build:all/`build:package:desktop:web`，不得修改 RN protected source |

Closeout verdict: `clean/done-local/route-context-owner-converged; browser-interaction-gated`。Fail-first 5 项按预期失败后，focused final 6 files/24 tests、H5 128/399、SDK Web 98/407、466 assets、typecheck/runtime boundary、`build:web/sync:web` 与 1182-module production build 全绿；仅保留既有 >500kB chunk warning。`/contacts/search` 返回 HTTP 200；未操作用户当前登录标签或创建第二 SQLite writer，因此会话/通讯录/归档三入口取消和完整子链 back 像素保持 interaction gate。RN `src/App/android/ios` working-tree diff 为零，本片无 SDK source 变化。

## 127. W6.a6.20.80 Contact Search Joined Group Conversation Route Contract

> GROUP OPEN AXIOM: 已加入群的规范 conversation identity 只能来自 shared SDK；搜索覆盖层关闭、URL 编码和 Tab 映射只能属于 H5 Router presentation。

| layer | contract |
| :--- | :--- |
| RN truth | `ContactSearchScreen.openLocalGroup` 获取规范会话；`ChatHomeScreen` callback 关闭搜索、清空待转发、打开会话并切到 chats |
| shared owner | SDK `conversations.openGroup({groupID,conversationID})` 继续校验真实群/会话身份并收敛当前账号 cache；H5 不猜 ID、不写 cache |
| H5 route owner | `buildContactSearchConversationRoute` trim SDK 返回 ID；空值返回 null；合法值 URI 编码为 `/conversations/:id` 并固定 `replace=true` |
| consumers | 本地群和服务器 `joined` 群共用 helper；只在 `openGroup` resolve 后导航；空 ID/异常保留搜索页并显示既有错误 |
| tab/history | `/conversations/:id` 由既有 URL-derived activeTab 映射到 chats；replace 删除搜索 route；Chat Header 继续固定返回 `/conversations` |
| unchanged | `available` 继续进入申请，`pending` 不可打开；搜索/关系/申请、Gateway、Repository、SQLite、消息与转发 owner 均不变 |
| acceptance | pure route + raw consumers、H5 full、SDK Web regression、verify/typecheck/boundary/assets/build、route HTTP、RN protected diff、cleanup；真实非空 joined 群点击依赖自然样本 |
| protection | 只运行 `build:web/sync:web`；不修改 RN protected source、SDK source 或 Desktop，不运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-stack-owner-converged; browser-group-sample-gated`。Fail-first 2 项后，focused 4/19、H5 129/402、SDK Web 98/407、466 assets、typecheck/runtime boundary、`build:web/sync:web` 与 1182-module build 全绿；仅有既有 >500kB warning。没有 mock shortcut、fake-success、孤立 infra 或第二业务 owner；当前未伪造 joined 群样本，真实点击/返回像素保留 data gate。RN protected diff=0，本片 SDK source 零改动。

## 128. W6.a6.20.84 Chat Card Target Picker Convergence Contract

> TARGET PICKER AXIOM: 好友/群聊目标的加载、搜索、Tab、头像、排除和选中状态在 H5 只能有一个 presentation owner；转发与名片发送只差异在选择模式和提交 owner。

| layer | contract |
| :--- | :--- |
| RN truth | `CardPickerModal` 在好友/群聊两 Tab 中单选，排除本人和当前单聊对端，只在显式分享时发送；RN source/caller 冻结 |
| shared presentation | `ChatTargetPickerModal` 以 `multiple` 服务聊天转发，以 `single` 服务当前会话名片；两者共用相同 cache-first 目标源和选择 DOM/CSS |
| mapping/send | `toIMMessageCard` 只将 `friend|group` 目标转为 `IMMessageCard`；`ChatPage` 继续委托 shared `messages.sendCard`，失败留弹窗显错，成功才关闭 |
| deleted owner | 删除 `ChatCardPickerDialog.tsx` 与 `chat-card-picker.css`，禁止兼容 wrapper、第二目标读取链、第二 type108 body 或发送状态机 |
| boundary | 不修改 SDK source/generated package、Gateway/SQLite、type108 wire contract、RN business、Desktop 或 package scripts；不执行真实分享 |
| acceptance | fail-first consumer contract、mapper/selection focused tests、H5 full/typecheck/assets/build、old source/dist zero、RN protected diff、cleanup；单登录标签的真实点击/像素可独立补证 |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-interaction-gated`。Fail-first 消费者断言按预期失败后，focused 3 files/8 tests、H5 full 132/409、466 assets、typecheck 与 1182-module production build 全绿；旧组件/样式在生产源码与 dist 零残留，仅防回归测试保留否定断言。当前会话未暴露已登录 Browser binding，为避免第二 SQLite writer 没有另起自动化页或发送名片。SDK source/generated 与 RN protected source 零本片改动，未运行 RN/Desktop/build:all/`build:package:desktop:web`。

## 129. W6.a6.20.85 User ID Clipboard Platform Adapter Convergence Contract

> USER-ID COPY AXIOM: H5 所有用户 ID 复制必须共用一个浏览器平台端口；成功反馈只能跟随真实 Clipboard resolve，不能由点击、定时器或 identity fallback 推断。

| layer | contract |
| :--- | :--- |
| RN truth | RN 个人资料和联系人资料只复制稳定 userID，并在成功后给出可见反馈；RN source/caller 冻结 |
| H5 platform owner | `components/clipboard/user-id-clipboard.copyUserIDToClipboard` 唯一持有 trim、空值拒绝、Clipboard API capability 判断和 `writeText`；个人中心首页、资料页、联系人资料页共同消费 |
| success/failure | 只有 `writeText` resolve 才允许显示“已复制ID/复制ID成功”；API 缺失、空 ID 或 rejection 必须 reject 并 fail-visible，不允许 fallback、静默成功或 fake copy |
| deleted owner | 删除 `pages/me/me-profile-clipboard.ts` 及测试；三个 consumer 禁止直接访问 `navigator.clipboard`，不保留兼容 wrapper |
| business boundary | profile/contact identity、DTO、Gateway、SQLite、认证、Router、SDK source/generated、RN business、Desktop 与 package scripts 均不变 |
| acceptance | fail-first behavior/consumer tests、focused/full H5、typecheck/assets/build、旧 owner/直接调用扫描、route HTTP、RN protected diff、cleanup；真实 Clipboard 点击需当前用户手势补证 |

Closeout verdict: `clean/done-local/presentation-platform-owner-converged; browser-interaction-gated`。Fail-first 两项按预期失败后，focused final 4 files/17 tests、H5 full 133/411、466 assets、typecheck 与 1182-module production build 全绿；旧 me-domain owner 已删除，生产页面直接 Clipboard API 为零。`/me/profile` 与 `/contacts/search` 均返回 HTTP 200；未操作当前登录标签或创建第二 SQLite writer，因此真实点击和系统写入反馈保持 interaction gate。SDK 与 RN protected source 零本片改动，未运行 RN/Desktop/build:all/`build:package:desktop:web`。

## 130. W6.a6.20.86 Me Profile Editor Return Stack Contract

> PROFILE RETURN AXIOM: 资料编辑页只能恢复明确的资料总览 history entry；缺少受控来源时必须 replace 到总览，不能猜测浏览器前序页面。

| layer | contract |
| :--- | :--- |
| RN truth | `ProfileScreen` 在同一实例内切换 `profile|nickname|gender|bio`；返回、未变更和保存成功均关闭编辑态并恢复资料总览 |
| H5 entry | `/me/profile` 的三个 `ProfileLinkRow` 写入精确 `{returnMode:'history'}`；首页昵称快捷入口和直接 URL 不写 marker |
| state owner | `readMeProfileEditorRouteState` 只接受字面量 history；null、布尔、未知对象和其他字符串全部收敛为 profile fallback |
| exit owner | Header 返回、未变更提交和真实 update 成功共用 `returnFromEditor`；history 执行 `navigate(-1)`，fallback 执行 replace `/me/profile` |
| unchanged | profile current-detail、nickname fallback、gender/bio normalization、update payload、Gateway/SQLite、loading/error/saving 与失败留页均保持原 owner |
| boundary | Router state 不是资料或保存真相；禁止 History API、第二 parser、兼容 route、SDK/RN/Desktop 业务改动以及 fake-success |
| acceptance | fail-first pure/consumer tests、focused/full H5、typecheck/assets/build、四 route HTTP、diff/cleanup、RN protected diff；当前登录标签的真实 back/save 点击保持 gate |
| protection | 只允许 `build:web/sync:web`；不运行 RN/Desktop/build:all/`build:package:desktop:web`，不刷新 RN generated package |

Closeout verdict: `clean/done-local/route-stack-owner-converged; browser-interaction-gated`。Fail-first 4 项按预期失败后，focused final 4 files/10 tests、H5 full 135/416、466 assets、typecheck 与 1183-module production build 全绿；仅保留既有 >500kB chunk warning。四个资料 route 均返回 HTTP 200；Browser 控制未暴露用户当前已登录标签，未新建第二登录态或 SQLite writer，因此真实 back、未变更和保存成功 history 像素保持 interaction gate。本片无 SDK source 新增与 RN protected source 改动，未运行 RN/Desktop/build:all/`build:package:desktop:web`。

## 131. W6.a6.20.87 Me Profile Nickname Keyboard Completion Contract

> KEYBOARD AXIOM: 昵称输入的键盘完成动作只能进入已有资料保存链；输入法组合确认不是保存意图。

| layer | contract |
| :--- | :--- |
| RN truth | 昵称 `TextInput` 声明 `returnKeyType=done`，`onSubmitEditing` 和顶栏完成共同调用 `submitNickname` |
| H5 affordance | 昵称单行 input 声明 `enterKeyHint=done`；浏览器软键盘与物理键盘仍由同一 `onKeyDown` adapter 接收 |
| key rule | 只接受 `key==='Enter' && !isComposing && !repeat`；IME composition、长按 repeat、NumpadEnter 和其他键均 fail-closed |
| submit owner | 页面 `submitNicknameFromKeyboard` 只 `preventDefault + saveProfile`；不得复制 nickname trim、actionDisabled、update payload、错误或 route exit |
| unchanged | 空昵称、loading/saving、未变更、Gateway 成功/失败、`.86` history return 和 bio textarea 换行全部保持既有 owner |
| boundary | 禁止 form/default submit、第二 mutation、SDK/RN/Desktop 业务改动、Gateway/SQLite/DTO/CSS 变化以及 fake-success |
| acceptance | fail-first pure/consumer tests、focused/full H5、typecheck/assets/build、route HTTP、diff/cleanup、RN protected diff；当前登录标签的真实软键盘/IME/Enter 保持 gate |
| protection | 只允许 `build:web/sync:web`；不运行 RN/Desktop/build:all/`build:package:desktop:web`，不刷新 RN generated package |

Closeout verdict: `clean/done-local/input-owner-converged; browser-keyboard-gated`。Fail-first 3 项按预期失败后，focused final 3 files/10 tests、H5 full 135/419、466 assets、typecheck 与 1183-module production build 全绿；仅保留既有 >500kB chunk warning。`/me/profile` 与 `/me/profile/nickname` 均返回 HTTP 200；Browser 控制未暴露用户当前已登录标签，未新建第二登录态或 SQLite writer，因此真实移动 Done、IME 和物理 Enter 保持 keyboard gate。本片无 SDK source 新增与 RN protected source 改动，未运行 RN/Desktop/build:all/`build:package:desktop:web`。

## 132. W6.a6.20.88 Me Profile Editor Navbar Semantics Contract

> NAVBAR AXIOM: 编辑器左侧退出动作必须忠实表达 RN 页面语义；左右动作不得因共用 button selector 而视觉同义。

| layer | contract |
| :--- | :--- |
| RN truth | 昵称编辑顶栏使用返回箭头；性别/签名编辑顶栏使用左“取消”、右“完成”；左侧正文色、右侧品牌色 |
| H5 projection | `MeProfileHeader.backLabel` 为空时渲染 RN back asset，非空时渲染受控文本；gender/bio 唯一传入“取消” |
| style owner | `rn-me-profile-back-action` 与 `rn-me-profile-save-action` 分别拥有颜色；共用 Navbar 继续拥有尺寸、reset 与 grid 布局 |
| interaction | 两种左侧 presentation 都调用 `.86` `returnFromEditor`；右侧继续调用 `.87` 所在的唯一 `saveProfile`，disabled/loading 不变 |
| business boundary | profile read/update、DTO、校验、Gateway、SQLite、错误/成功条件、SDK source、RN business 和 Desktop 均不变 |
| acceptance | fail-first consumer contract、focused/full H5、SDK Web regression、assets/typecheck/build、三 route HTTP、CSS/cleanup、RN protected diff；真实像素/点击保持 browser gate |
| protection | 只允许 `build:web/sync:web`；不运行 RN/Desktop/build:all/`build:package:desktop:web`，不刷新 RN generated package |

Closeout verdict: `clean/done-local/navbar-presentation-converged; browser-visual-gated`。Fail-first 2 项按预期失败后，focused final 1 file/6 tests、H5 full 135/421、SDK Web 98/407、466 assets、typecheck 与 1183-module production build全绿；仅保留既有 >500kB chunk warning。nickname/gender/bio 三个 route 均返回 HTML 200；Browser 控制未暴露用户当前已登录标签，未新建第二登录态或 SQLite writer，因此真实 Navbar 像素和点击保持 visual gate。本片无 SDK source 新增与 RN protected source 改动，未运行 RN/Desktop/build:all/`build:package:desktop:web`。

## 133. W6.a6.20.89 Me Profile Editor Saving Gate Contract

> SAVING AXIOM: pending 只能来自真实 profile mutation；页面可以投影门禁和 loading，但不能自行推断成功或建立第二 pending owner。

| layer | contract |
| :--- | :--- |
| RN truth | nickname pending 以整页 `savingOverlay + ActivityIndicator` 锁定交互；gender/bio pending 禁用取消/完成和字段，并以右侧 ActivityIndicator 替换完成文本 |
| state owner | H5 继续只使用 `MeProfileEditorPage.saving`；Header `backDisabled/actionPending` 与 nickname overlay 都是只读 presentation consumer |
| interaction | pending 时左动作不可点击、右动作 disabled、字段 disabled；nickname overlay 覆盖页面；失败通过既有 catch 清除 saving 并留页 |
| route boundary | 不拦截浏览器后退、不新增 History API 或 route state；成功/未变更继续复用 `.86` `returnFromEditor` |
| business boundary | `saveProfile`、update patch、校验、Gateway、SQLite、错误/成功条件、SDK source、RN business 与 Desktop 均不变 |
| acceptance | fail-first 2、focused/full H5、SDK Web regression、assets/typecheck/build、三 route HTTP、reduced-motion/cleanup、RN protected diff；真实慢请求像素保持 browser gate |
| protection | 只允许 `build:web/sync:web`；不运行 RN/Desktop/build:all/`build:package:desktop:web`，不刷新 RN generated package |

Closeout verdict: `clean/done-local/saving-presentation-converged; browser-pending-visual-gated`。Focused final 1 file/8 tests、H5 full 135/423、SDK Web 98/407、466 assets、typecheck 与 1183-module production build 全绿；仅保留既有 >500kB warning。三个编辑 route 均返回 HTML 200，spinner 有 reduced-motion fallback。Browser 控制未暴露当前已登录标签，未新建第二登录态或 SQLite writer，因此真实慢 update pending 像素保持 gate。本片无 SDK source 新增，RN protected source/generated package 均 clean，未运行 RN/Desktop/build:all/`build:package:desktop:web`。

## 134. W6.a6.20.90 Contact Search Keyboard Completion Contract

> KEYBOARD AXIOM: 联系人搜索软键盘 search/完成只结束输入；远端查询必须保持显式、可识别且可重试的页面动作。

| layer | contract |
| :--- | :--- |
| RN truth | `ContactSearchScreen` 的 `AppSearchBox` 缺省 `returnKeyType=search`；`onSubmitEditing` 只 `Keyboard.dismiss()`，不调用 `runServerSearch` |
| H5 input | input 使用 `enterKeyHint=search`；只接受非 composition、非 repeat 的 `Enter`，随后 `preventDefault + blur` |
| interaction owner | `shouldDismissContactSearchKeyboard` 只判定键盘事件；“去服务器搜索”和好友/群聊 Tab 继续是 `runServerSearch` 唯一入口 |
| unchanged | keyword/local/server mode、请求 generation、结果/错误/loading、资料/群路由、Gateway/SQLite 与 facade 调用全部不变 |
| structure | `ContactSearchStates` 只承接 loading/error/startup presentation；`ContactSearchPage` 411 -> 384 行，不形成第二页面 owner |
| boundary | 不修改 SDK source/generated package、RN business、Desktop、联系人/群/会话 DTO、CSS 或 package scripts |
| acceptance | fail-first、focused/full H5、SDK Web regression、assets/typecheck/build、route HTTP、cleanup、RN protected diff；真实移动键盘保持 browser gate |
| protection | 不运行 RN/Desktop/build:all/`build:package:desktop:web`，不刷新 RN generated package |

Closeout verdict: `clean/done-local/keyboard-presentation-converged; browser-keyboard-gated`。Fail-first 1 项按预期失败后，focused 2 files/14 tests、H5 full 135/425、SDK Web 98/407、466 assets、typecheck 与 1184-module production build 全绿；`/contacts/search` 返回 HTTP 200，仅保留既有 >500kB warning。Browser 控制未暴露当前已登录标签，未创建第二 SQLite writer，因此真实移动 search key、IME 与物理 Enter 保持 gate。本片无 SDK source/generated 与 RN protected 改动，未运行 RN/Desktop/build:all/`build:package:desktop:web`。

### Chat Header Profile Navigation Contract

| layer | contract |
| :--- | :--- |
| RN truth | `ChatDetailHeader` 的头像昵称通栏：群聊进入群资料，单聊在存在对端 ID 时进入对方资料；右侧更多菜单保持独立 |
| H5 trigger | `ChatHeader` 只暴露可访问按钮；`ChatPage` 只选择现有联系人资料或群资料 React Router route |
| return safety | 单聊复用联系人资料白名单 `backHref`；群聊只接受与当前路由 ID 一致的 `chat + conversationID` state，缺失或不匹配回群设置 |
| canonical owner | 联系人/群资料事实、关系、权限和 mutation 继续由既有页面调用 shared SDK facade；标题区不得复制这些逻辑 |
| unchanged | 右侧聊天设置、群申请角标、presence、消息、composer、Gateway、SQLite、OpenIM 和 SDK DTO 均不变 |
| protection | 不修改 RN business、SDK source/generated 或 package scripts；不运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/implemented-local/web-consumed/local-verified`。Focused 3/9、H5 full 140/443、typecheck、466 assets与1188-module production build全绿；真实群聊和单聊资料进入/返回链、412/412布局和零 warning/error 通过。

## 135. W6.a6.20.129 Chat Message Type Parity Audit Contract

> MESSAGE MATRIX AXIOM: H5 只能实现 RN 已存在或另行冻结的跨端消息能力；未知类型必须 fail-closed，不得从 payload 猜测交互。

| content type | RN/H5 contract |
| :--- | :--- |
| `101/106` | 文本与群提及统一进入 text view；mention 解析不在页面复制 |
| `102/103/104/105` | 图片、语音、视频、文件使用协议快照；播放、预览与下载由 Web platform interaction owner 承接 |
| `108` | 用户名片与群名片统一进入 card view，保留稳定 ID、标题与头像快照 |
| `114/115` | 引用与自定义表情使用现有专用 view；不退化为纯文本或第二媒体 owner |
| call/system | call presentation、type1201 和群系统通知继续由 shared parser 提供语义 |
| `109` | RN 聊天气泡没有 location owner；H5 必须明确 unsupported，禁止新增地图、权限、路由或 fake-success |
| acceptance | production parser focused/full tests、typecheck/assets、cleanup 与 RN/SDK protected diff；真实发送/接收和媒体活动帧沿用外部门禁 |
| protection | 不修改 RN business、SDK source/generated 或 package scripts；不运行任何 SDK/RN/Desktop build/sync |

Closeout verdict: `clean/static-parity-audited/no-new-runtime-owner`。本片只增加 production parser 的 contract tests；消息数据、DTO、Gateway、SQLite、WebSocket、发送与展示组件均保持原 owner。

## 136. W6.a6.20.130 Dual-account Realtime Message Acceptance Contract

> REALTIME AXIOM: 只有 receiver 在无 reload/无 navigation 条件下观察到唯一事件，并且该事件先经 shared Repository 写入再驱动 cache consumer，才能关闭 delivery/list-back gate。

| layer | acceptance |
| :--- | :--- |
| accounts | 两个独立 tab 使用 tab-scoped auth/device identity 与 account-scoped SQLite；sender/receiver 均明确 `online` |
| send | sender 只通过 H5 production composer -> `WebIMSync.messages.sendText`；唯一 marker 可关联发送与接收，不调用测试 API |
| delivery | receiver 停留会话列表，无 reload/导航时出现 marker、unread total 与目标行 unread，排除手工历史刷新 |
| persistence owner | shared `createIMRealtimeMessageSync` 顺序执行 Message/Conversation Repository upsert；成功后 runtime 才发布 `dataVersion` |
| H5 consumer | list 响应 `dataVersion` 只执行 `listCachedItems`；新进入 chat 后通过 `getCachedHistory` 显示 marker |
| list-back | receiver 打开 chat 后返回列表，marker preview 保留且 unread 清零；读状态继续走既有 shared mark-read owner |
| anti-shortcut | 禁止 fixture、mock event、window 注入、第二 WebSocket listener、第二 SQLite writer 或按 marker 写 UI |
| non-claim | 网络未隔离，故本片只证明 realtime SQLite convergence；offline/restart cache-hit 仍需独立 harness |
| protection | 不修改 RN business、SDK/H5 production/generated 或 package scripts；不运行 SDK/RN/Desktop build/sync |

Closeout verdict: `clean/real-text-delivery-and-list-back-pass/offline-gated`。真实 marker、无刷新 receiver DOM、shared persistence source trace、cache consumer DOM 和零运行错误形成同一条 production evidence chain。

## 137. W6.a6.20.132 Real RTC Start Deployment Gate Contract

> RTC ACCEPTANCE AXIOM: 编译通过和失败页可见不等于通话完成；必须由真实 call creation、receiver invite 与双方终态收敛共同证明。

| layer | acceptance |
| :--- | :--- |
| RN truth | RN 既有 RTC 业务保持冻结；本片不修改 RN source、caller、引入或 generated package |
| shared owner | `createIMCallControlSync` 唯一拥有认证、稳定 ID、start/reject/hangup 与终态；Web outgoing/incoming owner 只承接浏览器媒体生命周期 |
| H5 path | `ChatPage -> WebIMCallProvider -> SDK calls` 是唯一 production 入口；全局 incoming overlay 和 active route 不创建第二信令状态机 |
| observed | 两个独立账号均 online；caller 进入 audio active route 后显示“服务不可用”，receiver 无 overlay，双方 call list 为空 |
| interpretation | 本次未形成可持久化 call；无 Network 状态码证据，因此不归因具体接口状态或服务内部实现 |
| activation | 部署必须创建真实 call 并签发凭证；随后验证 invite -> reject -> caller terminal -> dual call list，再独立验证 answer/LiveKit media |
| anti-shortcut | 禁止 fake call/invite/token/record、permission bypass、页面写状态、第二 RTC owner 或循环重试掩盖部署错误 |
| verification | SDK RTC 4 files/21 tests；H5 call UI 3 files/10 tests；production source 与 RN protected boundary 零改动 |

Closeout verdict: `blocked-deployment/runtime-clean/no-call-created`。当前只关闭真实入口、失败投影和清理证明；incoming、reject、answer、媒体与记录仍为 deployment gate。

## 138. W6.a6.20.133 Joined Group Open-Conversation Persistence Contract

> GROUP CONVERSATION AXIOM: 只有 shared facade 返回的真实 Conversation 才能进入 chat；group route 与页面状态不是 conversation identity。

| layer | acceptance |
| :--- | :--- |
| RN truth | RN group row 解析/创建对应群会话；RN source/caller 保持冻结 |
| shared owner | `openIMGroupConversation` cache-first 查找目标群，必要时用真实 group detail 校验 conversation identity，并 success-only 写入 current-account repositories |
| H5 caller | `JoinedGroupsPage` 只传 groupID/已有 conversationID；仅在 facade resolve 后用 React Router 导航 |
| real proof | `/contacts/groups` 返回 2 个真实群；`donk的群聊` 打开 canonical `019ff8b7...`，显示真实 title/presence/cache message |
| persistence | 返回 `/conversations` 后同 row/preview 保留；unread 4 -> 4，runtime online，412/412，warning/error=0 |
| anti-shortcut | 不猜 ID、不构造 route、fixture 或 fake-success；不进入 unread 群，不 refresh/mark-read/send/long-press/mutate |
| verification | SDK 1 file/4 tests；H5 3 files/9 tests；本片无 source edit，既有 H5 dirty source 保留，SDK source/RN protected diff 为空 |
| residual | cache-miss Gateway fallback、offline cold start、large-group、physical touch、Safari/Firefox/实体设备和所有群 mutation |

Closeout verdict: `clean/browser-real-joined-group-open-and-list-back-pass`。Joined Groups 的真实 conversation-open persistence gate 已关闭；其他 residual 不外推。

## 139. W6.a6.20.134 Contact Common-Groups Consistency Contract

> COMMON GROUPS ACCEPTANCE AXIOM: 好友资料数量、共同群列表和群会话打开必须来自同一 shared capability chain；异步首帧空值与 route 可达都不能替代 settled production result。

| layer | acceptance |
| :--- | :--- |
| RN truth | RN 资料页和共同群列表既有行为保持冻结；本片不改 RN source/caller/generated package |
| shared owner | `contacts.listCommonGroups -> IMContactActionsSync` 唯一拥有 token 分页、防循环、groupID 去重和 success-only repository upsert |
| H5 callers | `ContactProfilePage` 只读取数组长度；`ContactCommonGroupsPage` 只渲染同一 facade 数组；页面不复制分页、映射或 cache 逻辑 |
| real proof | `donk二大爷` 资料 settled count=2；共同群页返回同一批 `donk二大爷的群聊`、`donk的群聊` 两个真实三人群 |
| canonical open | 选择无未读 `donk的群聊` 经 `conversations.openGroup` 进入 `019ff8b7...`；返回列表 unread 4 -> 4 |
| async rule | 首帧请求未完成时的空 count 不作为业务不一致证据；只以 settled facade result 和对应 list identity 验收 |
| anti-shortcut | 禁止 fixture、页面补 count、页面去重、route ID 猜测、refresh/mark-read/send/relationship/group mutation |
| verification | SDK 1 file/13 tests；H5 3 files/16 tests；runtime online、412/412、零 warning/error；production source 与 RN protected boundary 零改动 |
| residual | cache-miss fallback、offline cold start、large pagination、physical touch、Safari/Firefox/实体设备 |

Closeout verdict: `clean/browser-real-common-groups-count-list-open-consistent`。`.75/.95` 的旧自然样本 count/list 数据门禁由当前真实证据关闭；不外推至未验收环境和 mutation。

## 140. W6.a6.20.135 Group Owner Transfer Label Parity Contract

> GROUP OWNER LABEL AXIOM: 群管理入口文案以 frozen RN `GroupManageScreen` 为真相源；Web 文案适配不得派生新的权限、候选或 mutation 语义。

| layer | acceptance |
| :--- | :--- |
| RN truth | 管理入口为“群主转让”；选择页与真实提交业务保持冻结 |
| H5 owner | `GroupManagementPage` 只拥有入口 label 和 React Router navigation；文案从“转让群主”修正为“群主转让” |
| unchanged | `canTransferOwner`、owner-transfer URL、候选排除/排序、确认层、shared `groupManagement` facade、Gateway/SQLite 均不变 |
| real proof | owner 群管理页显示“群主转让”；选择页仍显示两位非本人候选；关闭精确返回管理页 |
| anti-shortcut | 不选择候选、不打开确认、不执行 transfer，不以 DOM 文案测试冒充 mutation success |
| verification | H5 4 files/13 tests；Web typecheck；authenticated isolated-origin DOM/route/return evidence |
| residual | 真实 transfer result、双方 realtime/list-back、mobile/dark/cross-browser/device |
| protection | SDK source/generated 与 RN protected source 零改动；未运行 SDK/RN/Desktop build/sync |

Closeout verdict: `clean/rn-label-parity/browser-route-return-pass`。只关闭用户可见文案和既有返回链，不外推真实群主转让结果。

## 141. W6.a6.20.136 Group Management Role Presentation Contract

> ROLE UI AXIOM: shared `IMGroupManagementPermissions` 是能力真相；H5 只能投影 RN 的 visible/disabled/navigation，不得自行解析 roleLevel 或因 disabled 删除用户应知设置。

| role | production presentation |
| :--- | :--- |
| owner | 三 switch enabled；mute/speech/auto-delete/admin/owner-transfer 使用既有可操作 route |
| admin | 三 switch visible+disabled；speech visible+disabled；applications 服从 `canAuditApplications`；admins 与 owner-transfer 显示只读限制 |
| member | `canOpenGroupManage=false` 时 replace 回群设置，不渲染管理页 |
| H5 adapter | `buildGroupManagementRoleView` 只接收 `canManageAdmins/canTransferOwner`；不拥有角色、permission fallback、DTO、Gateway 或 SQLite |
| runtime proof | 真实 owner 群原可操作项无回归；admin 无自然账号，故只标 local-verified/natural-data-gated；member direct route 已由 `.107` 证明 |
| anti-shortcut | 禁止 fake admin browser snapshot、roleLevel 分支、页面 permission parser 或为验收触发 mutation |
| verification | H5 5 files/17 tests；Web typecheck；production-caller assertion；SDK source/RN protected diff 为空 |
| residual | natural admin pixel、setting/transfer mutation、realtime/list-back、cross-browser/device |

Closeout verdict: `clean/role-presentation-converged/owner-browser-pass/admin-natural-data-gated`。实现完成但 admin 自然角色 browser acceptance 仍显式保留。

## 142. W6.a6.20.137 Group Management Owner Dark Responsive Acceptance Contract

> OWNER DARK ACCEPTANCE AXIOM: 真实 owner 的主题与 route 只读通过不能替代 admin 自然角色、设置写入或跨浏览器/设备验收。

| layer | acceptance |
| :--- | :--- |
| production data | 当前账号真实 owner 群；完整管理项由 shared permission snapshot 投影，不注入 role fixture |
| mobile dark | `412x786`；page=`rgb(17,19,24)`、card=`rgb(27,29,36)`、card=380px/radius=8px、scrollWidth=412 |
| desktop dark | `760x900`；同 token/radius，card=728px、scrollWidth=760 |
| route | 群主转让进入既有 candidate route；两位非本人候选；关闭精确返回群管理 |
| anti-shortcut | 不点 switch、不选 candidate、不打开确认、不执行设置/转让/Gateway/SQLite mutation，不外推 admin/browser/device gate |
| verification | H5 4 files/15 tests；Web typecheck；SDK Web 98 files/408 tests；HTTP 200；warning/error=0 |
| cleanup | 恢复 light/default viewport、关闭隔离 tab；RN protected source 为空；未运行 RN/Desktop/all/`build:package:desktop:web` |
| residual | natural admin/non-empty admin、真实 setting/transfer result/realtime/list-back、Safari/Firefox、实体设备 |

Closeout verdict: `clean/browser-owner-mobile-desktop-dark-pass/admin-and-mutation-gated`。本片关闭 owner Chromium 暗色与响应式 gate，其余能力仍保持显式门禁。

## 143. W6.a6.20.138 Broadcast Target Picker Desktop Dark Acceptance Contract

> BROADCAST PICKER ACCEPTANCE AXIOM: 跨 Tab 选择与 CTA enabled 仅证明 local presentation；未调用 shared batch-send 时不得声明群发成功、partial result 或 cache convergence。

| layer | acceptance |
| :--- | :--- |
| production data | shared cache-first facade 返回真实 2 好友、2 群聊；H5 不构造目标 DTO 或第二列表 owner |
| dark layout | `760x900`；sheet=`720x868`、left=20、bg=`rgb(17,19,24)`、scrollWidth=760 |
| selection | 好友 ALL=2；群聊 ALL 后跨 Tab 累计 4；返回好友 Tab 保留选择且 CTA enabled |
| close | 未点击 CTA；关闭 replace 回 `/conversations`，未进入 compose |
| anti-shortcut | 禁止 fixture、route target 注入、页面 batch、fake partial、Gateway/SQLite 写入或把 enabled 冒充 send success |
| verification | H5 4 files/10 tests；Web typecheck；HTTP 200；warning/error=0；RN protected diff 为空 |
| cleanup | 恢复 light/default viewport、关闭隔离 tab；未运行 SDK/RN/Desktop/all/`build:package:desktop:web` |
| residual | real send/partial result/realtime/list-back、50-target natural data、Safari/Firefox、physical touch/device |

Closeout verdict: `clean/browser-broadcast-desktop-dark-selection-pass/send-gated`。统一 picker 的真实桌面暗色与 local selection gate 已关闭，shared mutation 保持授权门禁。

## 144. W6.a6.20.139 Real Group QR Code Mobile Acceptance Contract

> REAL GROUP QR ACCEPTANCE AXIOM: 二维码可见不等于身份可信；验收必须证明 canonical conversation、shared 群快照、SDK payload 和返回后的群资料指向同一群。

| layer | acceptance |
| :--- | :--- |
| production identity | conversation `019ff8b7-b24f-7e71-afe1-332d40294c00` 经 `loadGroupProfileSource` 恢复 `donk的群聊 / 97524759106`；不使用 fixture、route-only group ID 或历史群 DTO |
| shared owner | payload 继续由 `buildIM28GroupQRCodePayload` 生成；H5 继续复用个人/群共同 `QRCodeDisplay + browser-qr-image`，无第二协议、Canvas 或导出 owner |
| render proof | authenticated `412x786` light route 渲染可见二维码；Canvas CSS/bitmap=`268x268 / 472x472`、`aria-busy=false`、无错误文案 |
| layout | card=`380x368`、document=`412/412`；无横向溢出 |
| route proof | “返回群资料”进入同一 conversation 的 `/settings/profile`；返回页群名、群 ID 和二维码入口与来源一致 |
| anti-shortcut | 不点击下载、分享、扫一扫；不上传、发送、申请或执行群/Gateway/SQLite mutation；二维码 ready 不冒充外部导出或应用内发送成功 |
| verification | H5 QR/profile 4 files/9 tests；Web typecheck；HTTP 200；warning/error=0；diff check green |
| protection | RN protected source 与 SDK source diff 为空；未运行 SDK/RN/Desktop/all/`build:package:desktop:web` |
| residual | actual download/Web Share/scan、应用内图片发送、dark/desktop、Safari/Firefox、实体设备与第二账号 list-back |

Closeout verdict: `clean/browser-real-group-qr-mobile-pass/export-scan-send-gated`。`.18.3.18` 的旧真实群视觉 natural-data gate 已关闭；外部 I/O、发送和跨环境验收不外推。

## 145. W6.a6.20.140 Real Group QR Code Desktop Dark Acceptance Contract

> GROUP QR DARK ACCEPTANCE AXIOM: 暗色页面必须保留 QR 黑白对比；theme token 验收不得通过修改 Canvas payload、局部 hardcode 整页颜色或复制展示 owner 实现。

| layer | acceptance |
| :--- | :--- |
| production identity | 复用 `.139` canonical conversation 与真实群 `donk的群聊 / 97524759106`；无 fixture 或 route-only identity |
| shared owner | SDK group payload、H5 共用 Canvas/export owner 均不变；页面只消费全局 `--im-*` theme tokens |
| desktop dark | `760x900`；surface=`480x900@140`；page/surface=`rgb(17,19,24)`、card=`rgb(27,29,36)`、text=`rgb(245,245,247)` |
| QR contrast | Canvas=`268x268`，box=`rgb(255,255,255)`；`aria-busy=false`、download ready、无错误文案 |
| layout | card=`448x368@156`、document=`760/760`；hint、CTA、scan action 无重叠 |
| route | 暗色二维码返回同一 conversation 群资料；群名、群 ID 与入口一致 |
| anti-shortcut | 不点击下载、分享、扫一扫；不上传、发送、申请或执行群/Gateway/SQLite mutation；ready 不冒充外部动作成功 |
| verification | H5 QR/profile 4 files/9 tests；Web typecheck；HTTP 200；warning/error=0；diff check green |
| cleanup | 恢复 light/default viewport、关闭隔离 tab；RN protected source 与 SDK source diff 为空；未运行 SDK/RN/Desktop/all/`build:package:desktop:web` |
| residual | actual download/Web Share/scan、应用内发送、Safari/Firefox、实体设备/physical touch |

Closeout verdict: `clean/browser-real-group-qr-desktop-dark-pass/export-scan-send-gated`。真实群二维码 Chromium mobile/light 与 desktop/dark 均已关闭；外部 I/O、发送与 browser/device matrix 继续保持门禁。

## 146. W6.a6.20.141 Group QR In-App Share Group-Target Acceptance Contract

> QR SHARE TARGET AXIOM: RN `cardShare` 的 selection state 与最终图片发送是两个阶段；跨 Tab 多选和 CTA enabled 只能证明 target projection，不得外推 PNG 生成、上传或 batch-send 成功。

| layer | acceptance |
| :--- | :--- |
| RN truth | frozen `ForwardTargetSelector variant=cardShare` 使用 `selectedKeys`，好友/群聊共享跨 Tab 多选；旧 SSOT“单选”描述失效 |
| source | share route 从 canonical conversation 恢复 `donk的群聊 / 97524759106`；不携带 Blob、File、message body 或 route-only group DTO |
| target owner | `forward-target-source -> ChatTargetPickerModal` 返回真实 2 好友、2 joined groups；页面不复制查询、DTO 或会话解析 |
| selection | 群聊 ALL=2 -> 好友 Tab 保留 2 -> 好友 ALL=4；CTA enabled 仅代表 local selection 有效 |
| layout | authenticated `412x786`；sheet=`380x754@16`、document=`412/412`、无 alert/warning/error |
| close | 未点击分享；关闭 replace 回原群二维码，来源 identity 不变 |
| anti-shortcut | 不生成/上传 PNG、不调用 `messageBroadcast.sendImage`、不执行 Gateway/SQLite mutation、不写 fake partial/success/list-back |
| verification | H5 QR/share/picker 4 files/10 tests；Web typecheck；HTTP 200；diff check green |
| protection | 恢复 default viewport、关闭隔离 tab；RN protected source 与 SDK source diff 为空；未运行 SDK/RN/Desktop/all/`build:package:desktop:web` |
| residual | final send/partial result/realtime/list-back、50-target、desktop/dark、Safari/Firefox、physical touch/device |

Closeout verdict: `clean/browser-group-qr-real-target-multiselect-pass/send-gated`。群二维码分享的真实群目标与 local multi-selection gate 已关闭，shared batch-send 继续保持授权门禁。

## 147. W6.a6.20.142 Chat Card Picker Real Group Target Acceptance Contract

> CHAT CARD TARGET AXIOM: chat composer 名片目标使用单选；选择替换只证明 local picker state，未点击分享时不得外推 type108 send、cache convergence 或 realtime list-back。

| layer | acceptance |
| :--- | :--- |
| RN truth | frozen `useChatCardPicker -> CardPickerModal` 对好友/群聊使用同一 `selectedTargetKey`；H5 `ChatTargetPickerModal selectionMode="single"` 对齐该行为 |
| source | authenticated no-unread single conversation `donk三大爷`；好友 Tab 排除 self/current peer 后余 1 项，群聊 Tab 从 shared cache-first facade 返回 2 个真实 joined groups |
| selection | 选择 `donk二大爷的群聊` 后 selected=1/CTA enabled；再选 `donk的群聊` 后第一项取消、第二项选中、selected 仍为 1 |
| layout | `412x786`；document=`412/412`，picker sheet 无横向溢出 |
| close | 未点击分享；关闭后回原 conversation，消息列表与 composer 保持 |
| anti-shortcut | 不注入 fixture/route target DTO，不点击 CTA，不调用 `messages.sendCard`，不制造 Gateway/SQLite/success/failed/realtime/list-back |
| verification | H5 picker/card/composer 4 files/10 tests；Web typecheck；临时 5178 `dev-pc` authenticated smoke |
| cleanup | 5176 已有 SQLite owner 未被干扰；临时 origin、tab、server 已关闭并恢复 default viewport；RN/SDK source 不改，未运行 RN/Desktop/all/`build:package:desktop:web` |
| residual | final type108 send/failure retry/realtime/list-back、search/long-name、Safari/Firefox、physical touch/device |

Closeout verdict: `clean/browser-chat-card-real-group-single-selection-pass/send-gated`。聊天名片 picker 的真实群目标和 single-selection gate 已关闭，shared send state machine 继续保持授权门禁。

## 148. W6.a6.20.143 Conversation Remark Title And Home Plus Parity Contract

> TITLE PARITY AXIOM: 当前账号好友备注必须覆盖单聊会话昵称，但只能修改 cache projection；可见加号尺寸不得扩大 40px accessibility touch target。

| layer | contract |
| :--- | :--- |
| RN truth | `ConversationListScreen` 从 cache-only friend list 叠加 remark；`GroupActionBubble` 为 40px button、18px box 内 14x2px plus |
| shared owner | `WebIMConversationSync.listCachedItems` 批量读取 `FriendshipRepository.getByUserIDs`，复用 `resolveFriendshipDisplayProfile` 且只接受 `isFriend=true` 的 remark |
| projection | 单聊返回快照按 `remark > conversation.name > formatIMUserDisplayName`；群 conversation 不变；不更新 SQLite、不请求 Gateway |
| H5 adapter | 会话页继续使用 `getConversationTitle`；`home-action-menu.css` 仅将 glyph width 20px 收敛到 14px，trigger/interaction/menu 不变 |
| browser | authenticated `412x786`：单聊=`donk二大爷备注名`、群摘要备注正确、trigger=40x40、glyph/pseudo=14x2、document=412/412、warning/error=0 |
| verification | SDK conversation/sender/contact 3 files/23 tests；H5 home/list 3 files/17 tests；Web typecheck；build:web/sync:web |
| boundary | RN business source 不改；RN/Desktop/all 未编译或同步；`build:package:desktop:web` 未修改/执行 |
| residual | remark realtime refresh、长备注截断、Safari/Firefox、physical device |

Closeout verdict: `clean/shared-core-ready-web-consumed-rn-frozen/browser-rn-visual-pass`。Web 已消费 shared title projection，RN 现有同行为 caller 继续冻结；H5 加号视觉与 RN 尺寸一致。

## 149. W6.a6.20.144 Conversation Remark Responsive Theme Acceptance Contract

> RESPONSIVE TITLE AXIOM: 当前自然备注样本只能证明当前长度在已测 viewport 下成立；不得外推任意超长备注或跨浏览器/设备。

| layer | acceptance |
| :--- | :--- |
| canonical path | SDK `.143` remark projection -> H5 existing conversation row/theme；无新 runtime code 或第二 owner |
| mobile light | authenticated `320x786`；真实备注标题/时间无重叠、document=`320/320`、trigger/glyph=`40x40 / 14x2` |
| desktop dark | authenticated `760x900`；surface/text=`rgb(15,17,21) / rgb(245,245,247)`、document=`760/760`、geometry 不变 |
| anti-shortcut | 不构造长备注、不注入 media URL、不打开 unread chat、不 mark-read、不执行 Gateway/SQLite mutation |
| media gate | 历史 route 无当前账号 open database snapshot；图片/语音/视频真实 playback 继续 `blocked-natural-data` |
| cleanup | theme=light、viewport=`412x786`、route=`/conversations`；warning/error=0；RN/SDK/H5 runtime source 不改 |
| residual | arbitrary long natural remark、remark realtime、Safari/Firefox、physical device、real media playback |

Closeout verdict: `clean/browser-narrow-light-desktop-dark-pass/media-natural-data-gated`。只关闭 Chromium responsive/theme gate，不外推未验证环境或媒体能力。

## 150. W6.a6.20.145 Multi-Account Natural-Data Gate Audit Contract

> MULTI-ACCOUNT EVIDENCE AXIOM: production account data can prove only states actually returned and rendered；accepted history、empty group audit、conversation preview or self message cannot prove pending handling or another member's role badge.

| contract | requirement | evidence |
| :--- | :--- | :--- |
| account scope | only the three user-authorized phone-code accounts；one tab-scoped runtime/account DB per account | all three production logins completed；no storage/token inspection |
| pending | require a natural incoming friend `pending` row or owner/admin group audit row | friend rows=`3/3/2`, all accepted；group audit empty for all accounts |
| role bubble | require unread=0 chat containing another member whose normalized role is owner/admin | safe groups contained system/self only；the only other-owner message was behind unread=2 and was not opened |
| mutation boundary | no application handle、profile open/mark-read、message send or group mutation | no business write action executed |
| activation | rerun only when production list exposes pending data or an already-read other-owner/admin message | gate remains `blocked-natural-data` |

Closeout verdict: `clean/audited-three-accounts/blocked-natural-data/runtime-clean`。此审计更新 evidence ledger，不新增或更改 application、member、message、Gateway、SQLite 或 UI owner。

## 151. W6.a6.20.146 Cross-Account Residual Candidate Audit Contract

> RESIDUAL SAMPLE AXIOM: a candidate gate may close only when production data contains the required state；empty or already-covered branches update the ledger but do not advance capability status.

| candidate | required proof | audited result |
| :--- | :--- | :--- |
| bound reset | non-empty current `profile.account` + reset route with empty old/new/confirm fields and disabled submit | accounts 2/3 unbound；reset branch absent |
| call record | natural non-missed or duration-bearing record row | accounts 2/3 call lists empty |
| available group | server result normalized as available/pending without applying | searches `62/群` returned no groups |
| conversation-only group | group conversation absent from joined facade but recoverable by canonical owner | account 3 group conversations and joined groups matched 2/2 |
| existing member guard | ordinary member direct manage route fail-closed | reproduced `.107`; no new acceptance claim |
| mutation boundary | no credential、call、group or unread-message write | no business mutation executed |

Closeout verdict: `clean/audited-cross-account-candidates/blocked-natural-data/runtime-clean`。重新激活需外部账号/数据状态变化或独立 mutation authorization；本片不增加 runtime branch、fallback 或 fake-success。

## 152. W6.a6.20.147 External Gate Activation Review Contract

> ACTIVATION REVIEW AXIOM: an acceptance workset pauses when every remaining proof depends on unavailable production data, explicit side-effect authorization, external runtime/device access or a separately authorized implementation contract; unchanged empty-state reruns are not progress.

| gate class | boundary | activation contract |
| :--- | :--- | :--- |
| natural data | read-only production evidence only | resume when the required pending/admin/role/reset/call/group/blacklist/media state exists naturally |
| mutation | server/SQLite side effects | require operation-specific authorization、disposable target and explicit expected side effects before execution |
| deployment | RTC/auth/service availability | require an enabled environment and test credentials/accounts |
| browser/device | platform-specific behavior | require Safari、Firefox、physical mobile device or physical-touch session |
| design | behavior not implemented by the current contract | create a separate authorized slice before changing cold-start offline or equivalent behavior |
| anti-shortcut | no fixture、fake success、historical screenshot or repeated empty audit | keep the residual item open and preserve its existing production owner |
| current decision | current accounts/environment expose no safe new evidence | `paused/no-safe-auto-activation/external-input-required` |

Closeout verdict: migration remains incomplete but locally closed. Resume only from the matching residual-ledger item after one activation contract becomes true; do not reopen completed local implementation slices or modify frozen RN business code to manufacture convergence.

## 153. W6.a6.20.148 Cold-Start Offline Safety Contract

> COLD-START AXIOM: cached identity without current Gateway validation may unlock only an existing capability-minimal read-only snapshot；it cannot authorize full sync、local mutation、remote mutation、realtime or an online claim.

| layer | frozen contract |
| :--- | :--- |
| eligibility | structurally valid same-tab session + browser fetch transport unavailable + existing durable account snapshot |
| rejection | invalid token、refresh failure after explicit invalid、HTTP/business error、missing/corrupt/busy snapshot all fail closed |
| storage | `openExistingReadOnly` keeps Web Lock；no create、migration write、snapshot export or close persistence |
| SDK API | `offline-readonly/offline-validating` + dedicated `WebIMOfflineReader`；`getSync()` rejects while offline |
| allowed data | cached conversation list and cached chat history only |
| forbidden actions | send/retry/draft/mark-read、upload、presence/call、profile/security、friend/group/message/conversation mutation and offline queue |
| reconnect | `online` only triggers single-flight check；valid/refresh success upgrades canonical runtime，network failure retains offline，invalid clears session/DB |
| H5 | offline banner/read-only routes/retry/sign-out；no token/storage inspection or duplicate SQL owner |
| RN | frozen reference；no RN business edit or convergence claim |

Closeout verdict: `clean/contract-frozen/implementation-pending`。Implementation order is SDK transport/lifecycle/storage/reader -> H5 shell -> isolated cold-reload/reconnect acceptance; green documentation alone cannot close the capability.

## 154. W6.a6.20.148.1a Cold-Start Offline Foundation Contract

| layer | contract |
| :--- | :--- |
| transport | browser fetch `TypeError` only becomes stable `GATEWAY_NETWORK_UNAVAILABLE`；HTTP/business/cancel/internal failures remain canonical and fail closed |
| lifecycle | explicit offline readonly/validating states and guarded reconnect/invalid/sign-out transitions；offline cannot enter realtime connecting |
| non-exposure | production restore、DB open、full sync and H5 UI remain unchanged until storage/reader/shell gates pass |
| verification | SDK focused 2 files/10 tests；H5 typecheck/build includes build:web/sync:web；RN protected diff empty |
| protection | no RN business/generated change；no RN/Desktop/all or `build:package:desktop:web` command |

Closeout verdict: `clean/foundation-complete/not-consumed`。下一片只实现 existing-snapshot read-only storage 与 capability-minimal reader，仍不得提前开放 H5 离线入口。

## 155. W6.a6.20.148.1b Cold-Start Offline Storage And Reader Contract

| layer | contract |
| :--- | :--- |
| snapshot | missing read aborts IndexedDB creation；existing durable bytes only |
| adapter | explicit readonly mode across lifecycle/Worker/sql.js；skip migration/export/close persistence；execute/transaction reject |
| reader | only cached conversation items and message history；no Gateway/token/WebSocket/mutation port；runtime may revoke context |
| shared logic | normal Web sync and offline reader consume one cached projection/history implementation |
| verification | focused 7/35、Web full 100/419、H5 typecheck/build、build:web/sync:web、RN protected diff empty |

Closeout verdict: `clean/storage-reader-safe/not-consumed`。Runtime restore/reconnect 与 H5 shell 仍未接入，不能把底层通过外推为冷启动离线可用。
