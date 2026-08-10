# RN to H5 Migration Contract

> TYPE: MIGRATION_SSOT / RN_PARITY_CONTRACT
> STATUS: FROZEN / 2026-08-10
> AXIOM: `im28-phone` 是产品视觉、静态资源、页面行为和能力范围真相源；`im28-h5` 只做浏览器语义适配，不另起一套设计或业务协议。

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
| `/contacts/friend-applications` | `FriendApplicationsScreen` standalone branch | authenticated friend application list/search/section/status and real accept | `implemented-local/acceptance-gated` |
| `/contacts/group-applications` | `GroupVerificationListScreen` | authenticated pending-group aggregation/search/role/count through audit facade | `implemented-local/acceptance-gated` |
| `/contacts/group-applications/:groupID` | `GroupApplicationsScreen` + `GroupApplicationListView` | authenticated per-group filter/search/section/status and real accept/reject through same audit facade | `implemented-local/acceptance-gated` |
| `/contacts/groups` | `ContactGroupListScreen` + `contactGroupHelpers` | authenticated cache-first joined-group list/search/status/role and real conversation lookup/open | `implemented-local/acceptance-gated` |
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

Future full-screen RN states must receive stable routes before UI migration. Remaining auth/settings branches include `/auth/invite`、`/auth/complete-profile`、network、cache and version；account-security and display/notification/permission/terms settings are implemented-local. `/me/profile/**`、`/me/security/**` 与 `/me/settings/**` are full-screen owners outside the tab shell. `/conversations`、`/contacts`、`/calls` 与 `/me` 已嵌套在唯一 `PrimaryTabsLayout`；chat detail、me child routes 与 auth routes 不显示底栏。Bottom sheets and short-lived previews remain modal state only when they are not independently addressable. Production deployment must return `index.html` for valid SPA deep links.

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
| `W6.a5.2` | remaining auth routes and primary tab route shell | route/API contract per capability | `contacts/calls/me/tab-shell-core-done-local; remaining-active` |
| `W6.closeout` | cross-route responsive/browser/real-Gateway parity review | prior slices | `planned` |

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
| production flow | `ContactListScreen.tsx` -> `WebIMContactSync.list` -> shared `GatewayHTTPClient.listFriends` |
| operation | `POST /v1/friend/list` with bounded `page/page_size` pagination |
| current status | `done-local/acceptance-gated` |
| must-have fields | `userID`; alias-first `displayName`; `nickname`; `remark`; `avatarURL`; `isStarred`; `addedAt` |
| adapters | `../im28-sdk/src/sync/contact-sync.ts`; runtime `getSync().contacts`; React Router `/contacts` caller |
| route | `/contacts`; guest deep link replaces to `/login` -> `/auth/phone` |
| source assets/style | RN search、clear、star SVG; 48px header、40px search、56px row、40px avatar、star/letter groups and right index |
| local evidence | `npm run verify`: 466 assets、22 files / 60 tests、SDK/Web typecheck and production build passed; 390x844 + 760x900 light/dark proof, no horizontal overflow, rows 56px, desktop surface 480px; refresh/back/forward/guest guard and clean console passed |
| API evidence | 2 behavior tests prove authenticated fail-fast, paging, dedupe, field normalization and sort; page has no fetch/shared SDK/Gateway/Repository import |
| no-fake verdict | real Gateway list only; loading/error/empty are explicit; temporary visual proof HTML deleted; verification/group/action entries without bounded facades are omitted |
| open gaps | approved-account Network/data screenshot; RN cache-first path is unavailable because `FriendshipRepository` is not exported by shared Web entry; Chinese Pinyin grouping currently falls back to `#`; profile/action/group/verification-message flows and shared four-tab shell are separate slices |
| acceptance gate | real account proves auth -> paged friend list -> displayed groups/search/index; shared Web Repository export plus cache-first regression, or explicit product acceptance of remote-only contacts; Pinyin-equivalent index behavior before full parity |

W6.a5.2.1 只恢复联系人列表核心。`朋友验证消息`、`我的群组`、好友操作菜单和 profile navigation 均需要独立 operation/route card；当前页面不会渲染不可工作的入口。

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
| excluded visible actions | personal-profile edit needs update/upload/QR subflows; account-security needs bind/reset/settings contracts; QR is explicitly unavailable in shared Web Gateway client; none receive placeholder controls |
| no-fake rule | page imports only `@im28/im-sdk/web` through the runtime context; no direct fetch/Gateway client, hardcoded user profile, fake logout, placeholder destination or page-local tabbar |
| open gaps | authenticated real profile/logout Network proof；profile edit/account security are implemented-local but acceptance-gated；QR/display/notification/network/cache/version require separate bounded cards |
| acceptance gate | focused endpoint/runtime test + workspace verify + mobile/desktop light/dark route/back/refresh proof; real account must prove current-detail and logout redirect/session cleanup before production parity |

Local evidence: authenticated current-detail rendered the real `donk / 86272753597` profile; 390x844 and 760x900 light layouts have no horizontal overflow, one selected `me` tab and a 480px desktop surface; `/me/settings` has zero tab bars and passed confirm/cancel/reload/back/forward. At W6.a5.2.4 closeout, `npm run verify` passed 466 assets, 24 files / 65 tests. A later W6.a5.2.5 cold restart proved no new Provider-context logs; dark screenshots and executing real logout remain acceptance gates.

## 15. W6.a5.2.5 Migration Card

| field | value |
| :--- | :--- |
| feature slice | personal profile read/edit for nickname、gender、bio；不含 avatar upload、QR 与 account security |
| phase | done-local/acceptance-gated；one Gateway operation + three route-owned field actions |
| production flow | RN `ProfileScreen` profile/nickname branches + `ProfileGenderPickerScreen` + `ProfileBioEditorScreen` -> `updateSelfInfo` -> Gateway update-profile |
| operations | `WebIMSync.profile.getCurrent`; `WebIMSync.profile.update({ nickname | gender | bio })` -> `POST /v1/users/update-profile` |
| must-have fields | nickname trim/non-empty/max 32；gender `0|1|2`；bio trim/max 100 Unicode characters；user ID read-only |
| adapters | shared `GatewayHTTPClient.updateUserProfile`; existing `WebIMSync.profile`; React Router `/me/profile` and `/me/profile/nickname|gender|bio` |
| route/shell | all profile/detail edit routes are full-screen outside `PrimaryTabsLayout`; cancel/back/save use React Router and survive refresh |
| source style | RN 94px top bar、72px side actions、16px page padding、12px cards、56px rows、nickname 56px input、bio 160px textarea/count、gender selected mark、profile light/dark tokens |
| excluded actions | avatar needs upload credential/crop/upload chain; QR is unavailable in shared Web client; neither receives a visible placeholder |
| no-fake rule | save success only after `updateUserProfile` resolves; errors stay visible; unchanged values navigate back without a network success claim |
| local evidence | authenticated real current-detail rendered nickname/gender/ID/bio; 390x844 and 760x900 light layouts、all three editor routes、unchanged save、direct refresh、back/forward and guest redirect passed; cold restart added no console warning/error; `npm run verify` passed 466 assets、24 files / 67 tests、typecheck and production build |
| no-fake verdict | one canonical `MeProfileEditorPage -> WebIMSync.profile.update -> GatewayHTTPClient.updateUserProfile` path; no direct fetch/Gateway、mock branch、placeholder action、compat wrapper or file over 300 lines |
| open gaps | authenticated changed-value update Network/result proof and dark visual proof；avatar/QR/account-security remain separate bounded slices |
| acceptance gate | focused auth/input/result/failure tests + workspace verify + mobile/desktop light/dark direct-route/save/cancel/back/refresh proof + real account update evidence |

W6.a5.2.5 未修改真实账号资料：浏览器 proof 只提交未变化值，确保没有未经授权的远端副作用。真实 nickname/gender/bio mutation 与 dark matrix 通过前，状态保持 `done-local/acceptance-gated`。

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
| local evidence | runtime exposes set/reset facades; 3 focused tests prove anonymous fail-fast、set retains session and reset clears session/socket/account DB；authenticated 390x844 + 760x900 light root/form、validation、direct refresh、back/forward and account-state correction passed；guest account/password deep links route to phone/account login；console clean |
| regression | `npm run verify`: 466 assets、25 files / 70 tests、SDK/Web typecheck and production build passed |
| no-fake verdict | one `page -> WebIMRuntime -> GatewayHTTPClient` mutation owner；phone/email rows are read-only；no page fetch/Gateway、sent/countdown claim、mock branch、compat wrapper or overlimit production file |
| open gaps | approved real set/reset Network/result/session proof and authenticated dark matrix；contact bind/update remains deferred |
| acceptance gate | facade auth/input/result/failure/session-cleanup tests + workspace verify + mobile/desktop light/dark route/form/history proof + approved real account set/reset evidence |

W6.a5.2.6 将联系方式与账号凭据拆开，避免一个 slice 超过 3 个 operation。account/password 已本地完成；phone/email change 保留为 blocked contract，直到验证码发送或产品明确接受固定码环境。浏览器验收没有提交 set/reset，避免未经授权修改账号或撤销 session。

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
| avatar | crop -> `uploadAvatar` -> update profile `faceURL` | shared client has upload credential + `avatar_url` DTO；Web upload/crop facade absent | `blocked-web-upload`；不渲染可提交头像动作 |
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
| avatar/contact extensions | upload/crop or verification lifecycle | missing Web upload / send-code facade | blocked until each contract is independently frozen |

Anti-fake verdict: H5 `register -> /conversations` drift is corrected locally: existing login still enters conversations, while successful register records only an account-scoped marker and enters complete-profile; invite-required keeps the original request in memory and retries the same register operation. Gender/bio subroutes only update a Provider memory draft；the main form remains the sole update-profile caller. Avatar/contact display is read-only and has no no-op action. The implementation does not persist verification secrets, infer invite validity from four local characters, copy RN's no-op send-code success, or treat blocked controls as completed onboarding. Valid new-account Network/result and responsive light/dark evidence remain required before parity acceptance.

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

> AXIOM: 好友申请真相只来自 Gateway；本轮只迁 RN standalone 列表的默认可达能力，接受成功前不得修改申请状态，未读/群验证/用户资料链不得以 placeholder 补齐。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| entry/route | `ContactListScreen` verification shortcut -> standalone `FriendApplicationsScreen` | `/contacts` shortcut -> `/contacts/friend-applications` React Router route；full-screen route outside primary tab shell |
| list | `fetchFriendApplicationsAsRecipient(..., 100)` -> pending-first/time-desc | `WebIMSync.friendApplications.list` -> shared `GatewayHTTPClient.listFriendApplications`；authenticated pagination/dedupe/normalization |
| accept | row `加好友` -> confirm -> `acceptFriendApplication` -> reload | `WebIMSync.friendApplications.accept(applicationID)` -> shared accept operation；success then reload，failure keeps original state |
| row/view | standalone search、最近三天/三天前、72px row、48px avatar、source/message/status、confirm dialog | normalized direction/user/message/source/status/time/read model + pure view projection |
| deferred | row press marks read then opens user profile；combined friend/group tabs + badges；reject exists in injected hook but has no page caller | no click/no-op、unread/read、group tab/badge、reject facade；each requires a later bounded route/caller slice |
| acceptance | empty/error/refresh/handling/confirm、guest/history/theme/responsive | local gates + approved real accept mutation；without mutation authorization remains acceptance-gated |

## 21. W6.a5.2.11 Group Applications Core Contract

> AXIOM: 群审核真相只来自 Gateway audit；索引与单群详情共享一个 facade，accept/reject 成功前不得修改可见状态，不能为详情复制第二条 list-by-group transport。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| entry/routes | `ContactListScreen` -> `GroupVerificationListScreen` -> selected `GroupApplicationsScreen` | `/contacts` shortcut -> `/contacts/group-applications` -> `/:groupID` React Router routes；full-screen outside primary tab shell |
| audit/index | `fetchGroupApplicationAuditList` -> pending group count、owner/admin role、group search | `WebIMSync.groupApplications.list` -> shared `GatewayHTTPClient.listGroupApplicationAudit`；authenticated pagination/dedupe/group+requester normalization |
| detail | selected group filters audit applications -> pending-first/time-desc -> recent/older sections | direct URL repeats the same audit read and filters by route `groupID`；no page fetch or per-group transport |
| handle | pending row -> action sheet -> accept/refuse -> reload | `accept/reject(applicationID)` -> shared Gateway operations；success then reload，failure keeps original state |
| deferred | combined friend/group tabs、application unread/read、group profile/manage、ordinary member join | omitted and acceptance-gated；no placeholder、mock badge or fake success |
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
| local evidence | RN source/API trace、4 real sql.js/IndexedDB facade tests、5 pure view tests、466 asset check、31 SDK files/97 tests、H5 typecheck/build、anonymous deep-link guard | `implemented-local/acceptance-gated`；authenticated group data、conversation open and responsive light/dark/history remain open |

## 23. W6.a5.2.13 Contact Profile Core Contract

> AXIOM: 联系人资料关系判断、单聊持久化和好友申请语义只存在于共享 `peerProfile` facade；React Router 页面只负责 RN 视觉、表单状态和成功后的导航。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| entry/routes | `ContactListScreen` contact press -> `UserProfileScreen`; stranger add state -> `AddFriendScreen` | `ContactRow` -> `/contacts/users/:userID` -> optional `/add` React Router routes；both full-screen outside primary tab shell |
| profile read | `fetchFriendProfileSnapshot` combines public user、friend and relationship | `WebIMSync.peerProfile.get` -> authenticated `getUserDetail` and friend-only `getFriend`; normalizes self/friend/stranger、remark/name/avatar/gender/bio/star/added time |
| RN presentation | 120px avatar、centered 18/27 name、24px gender badge、24px ID pill with copy asset、48px primary CTA and 56px flex rows | semantic HTML/CSS uses RN theme tokens、byte-mirrored copy/back SVG and shared RN avatar gradient；no generic UI kit |
| direct conversation | `fetchSingleConversation` -> chat owner | `peerProfile.openConversation` -> real `openDirectConversation` -> shared mapper -> latest-message/conversation repositories -> encoded chat route；self is rejected |
| friend application | 64px result row、80-character greeting、real add operation、success toast only after mutation | `/add` -> `peerProfile.applyFriend` with RN default message/length guard/source type；success state appears only after Gateway resolves |
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

Reviewer verdict: SDK Gateway schemas are `runtime-chain-partial` because request/response types already expose `entities`, while shared `Message` mapping、Repository persistence and Web `sendText` currently drop that semantic. RN is production-ready but owns duplicate App-local algorithms；H5 has all 135 mirrored PNG assets but no preset entity chain. No mock shortcut or fake-success path exists because the unsupported illustrated tab is currently omitted. Contract status is `done`；implementation remains `🟡` until `.1/.2` pass, and real transmission remains `🟡 acceptance-gated`.
