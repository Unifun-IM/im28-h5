# RN to H5 Migration Contract

> TYPE: MIGRATION_SSOT / RN_PARITY_CONTRACT
> STATUS: FROZEN / 2026-08-10
> AXIOM: `im28-phone` 是产品视觉、静态资源、页面行为和能力范围真相源；`im28-h5` 只做浏览器语义适配，不另起一套设计或业务协议。

## 1. Hard Requirements

| area | required outcome | forbidden shortcut |
| :--- | :--- | :--- |
| 样式 | 每个 H5 页面从对应 RN 页面、组件和 `src/theme/**` 迁移布局、颜色、字号、间距、圆角、状态与明暗主题 | 依据现有 H5 骨架自行设计；只对齐主题色；用第三方组件默认样式替代 RN 视觉 |
| SDK/API | 页面只调用 `@im28/im-sdk-web` 暴露的 runtime/sync/capability facade；facade 复用 `@im28/im-sdk/web` | 页面直接 `fetch`、调用生成 OpenAPI、实例化 Gateway client、导入 `@im28/im-sdk/rn` |
| assets | RN 业务资产按字节复用，保持 `im28-phone/src` 相对目录；H5 不重绘、不热链、不用近似图标替换 | 已有 RN 图标时继续使用 Lucide/文字占位；把 RN SVG React 组件实现直接搬入浏览器 |
| 页面切换 | 全屏页面和可恢复导航状态由 React Router SPA 管理 | 复制 RN `useState` 页面栈；直接操作 `history`；刷新深链后回到错误页面 |

“样式复用”指设计结果与 token 同源，不指直接运行 React Native `StyleSheet`。`View/Text/Pressable/SafeAreaView` 必须转换为语义化 HTML、CSS 和浏览器交互；仅允许安全区、hover/focus、键盘、滚动容器和响应式宽度等浏览器适配，且不得改变 RN 信息层级。

## 2. Canonical Sources

| concern | RN source | H5 owner | current state |
| :--- | :--- | :--- | :--- |
| light/dark token | `../im28-phone/src/theme/lightTheme.ts`; `darkTheme.ts`; `theme.ts` | `apps/web/src/styles/rn-theme.css` | `foundation-copied` |
| theme preference | `../im28-phone/src/theme/ThemeProvider.tsx` | Web theme provider / root `data-theme` | `planned` |
| hairline/font baseline | `../im28-phone/src/theme/applyHairlineWidth.ts`; `applyGlobalBoldText.ts` | CSS root tokens/reset | `foundation-copied` |
| auth flow | `../im28-phone/src/screens/auth/AuthFlowScreen.tsx`; `../im28-phone/src/screens/auth/types.ts` | `/login` redirect + `/auth/phone|email|account|register` | `core-done-local/acceptance-gated` |
| auth entry UI | `PhoneLoginScreen.tsx`; `EmailLoginScreen.tsx`; `AccountLoginScreen.tsx`; `AccountRegisterScreen.tsx`; shared auth styles/components | `apps/web/src/pages/login/**` | `core-done-local/acceptance-gated` |
| conversation list | `../im28-phone/src/screens/chat/conversationList/ConversationListScreen.tsx` | `apps/web/src/pages/conversations/**` | `core-done-local/acceptance-gated` |
| chat detail | `../im28-phone/src/screens/chat/chatDetail/ChatDetailScreen.tsx`; `../im28-phone/src/screens/chat/components/chatDetailStyles.ts` | `apps/web/src/pages/chat/**` | `core-done-local/acceptance-gated` |
| chat header/composer/list | `../im28-phone/src/screens/chat/components/ChatDetailHeader.tsx`; `ChatComposer.tsx`; `ChatMessageList.tsx` | `apps/web/src/pages/chat/**` | `core-done-local/acceptance-gated` |
| contact list | `../im28-phone/src/screens/chat/contactList/ContactListScreen.tsx`; `contactIndexHelpers.ts`; `../im28-phone/src/screens/chat/home/HomeTabBar.tsx` | `apps/web/src/pages/contacts/**` | `core-done-local/acceptance-gated` |
| shell/tab hierarchy | `../im28-phone/src/screens/chat/home/ChatHomeScreen.tsx`; `HomeTabBar.tsx` | `PrimaryTabsLayout` + global `components/primary-tabs/**` | `core-done-local/acceptance-gated` |
| static assets | RN asset roots listed below | `apps/web/src/assets/rn/**` | `466 files/hash-verified` |
| platform-neutral SDK | `../im28-phone/packages/im-sdk/src/web.ts` | dependency of `@im28/im-sdk-web` | `linked` |
| browser runtime | RN Gateway capability semantics + shared SDK Web entry | `packages/im-sdk-web/src/runtime/**`; `sync/**` | auth/conversation/message/contact core local |

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
-> @im28/im-sdk-web public facade
-> browser runtime/sync/capability owner
-> contacts: @im28/im-sdk/web Gateway client -> Gateway HTTP (remote-only in W6.a5.2.1)
-> conversations/messages: shared DTO + Repository -> Gateway HTTP/WebSocket + account SQLite
```

Rules:

1. 页面可从 `@im28/im-sdk-web` 导入公开类型和 facade，不得绕过它导入共享 SDK。
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
| `/calls` | `ChatHomeScreen` calls tab + `CallListScreen` | authenticated route; real cache/sync/delete; no RTC placeholder | `core-done-local/acceptance-gated` |
| `/me` | `ChatHomeScreen` me tab + `ProfileScreen` home | authenticated current profile hero and real general-settings route | `core-done-local/acceptance-gated` |
| `/me/settings` | `ProfileScreen` general settings | full-screen route outside primary tab shell; real logout confirmation | `core-done-local/acceptance-gated` |
| `/me/profile` | `ProfileScreen` personal profile | authenticated nickname/gender/ID/bio overview outside primary tab shell | `core-done-local/acceptance-gated` |
| `/me/profile/nickname\|gender\|bio` | RN field editors | route-owned real update-profile forms; unchanged save has no mutation | `core-done-local/acceptance-gated` |
| `/me/security` | `ProfileScreen` account-security | real phone/email/account read; contact changes remain non-interactive | `core-done-local/acceptance-gated` |
| `/me/security/account\|password` | RN credential forms | real set-account-password/reset-password; reset invalidates local session | `core-done-local/acceptance-gated` |
| `*` | no RN equivalent | explicit 404 and safe return | `implemented` |

Future full-screen RN states must receive stable routes before UI migration. Remaining auth/settings branches include `/auth/invite`、`/auth/complete-profile` and `/settings/network`; account-security routes are implemented-local. `/me/profile`、its nickname/gender/bio editors and `/me/security/**` are full-screen owners outside the tab shell. `/conversations`、`/contacts`、`/calls` 与 `/me` 已嵌套在唯一 `PrimaryTabsLayout`；chat detail、me settings/profile/security editors 与 auth routes 不显示底栏。Bottom sheets and short-lived previews remain modal state only when they are not independently addressable. Production deployment must return `index.html` for valid SPA deep links.

## 5. Slice Acceptance

A page/capability is `parity-accepted` only when all gates pass:

| gate | evidence |
| :--- | :--- |
| source trace | RN screen/component/style/asset/API anchors recorded in this contract or active workset |
| visual parity | light/dark screenshots at 390x844 and desktop responsive viewport; layout, typography, icons, empty/loading/error/disabled states reviewed |
| asset parity | all visible product assets resolve from `apps/web/src/assets/rn/**`; asset hash check passes |
| API parity | no mock/fake-success; Network and runtime evidence proves the intended `@im28/im-sdk-web` call chain |
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
| adapters | `packages/im-sdk-web/src/sync/contact-sync.ts`; runtime `getSync().contacts`; React Router `/contacts` caller |
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
| adapters | `packages/im-sdk-web/src/sync/call-sync.ts`; Web app-owned `call-record-store.ts`; runtime `getSync().calls`; React Router `/calls` |
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
| no-fake rule | page imports only `@im28/im-sdk-web` through the runtime context; no direct fetch/Gateway client, hardcoded user profile, fake logout, placeholder destination or page-local tabbar |
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
