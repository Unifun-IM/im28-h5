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
| chat search | `../im28-phone/src/screens/chat/search/ChatSearchScreen.tsx`; `SearchComponents.tsx`; `chatSearchHelpers.ts`; `message-search-helpers.ts`; `indexedPages.tsx`; `utils.ts` | `/conversations/:conversationID/search`; shared `messages.searchCached` | `text-date-media-file-done-local/settings-entry-planned` |
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

> AXIOM: 好友申请真相只来自 Gateway；列表以内嵌方式复用在 RN 同款“验证消息”容器中，接受成功前不得修改申请状态，未读/用户资料链不得以 placeholder 补齐。

| dimension | RN truth | Web owner/verdict |
| :--- | :--- | :--- |
| entry/route | `ContactListScreen` single verification shortcut -> `VerificationMessagesScreen` friend tab -> embedded `FriendApplicationsScreen` | `/contacts` shortcut -> `/contacts/verifications/friend`；old `/contacts/friend-applications` redirects to the canonical full-screen route outside primary tab shell |
| list | `fetchFriendApplicationsAsRecipient(..., 100)` -> pending-first/time-desc | `WebIMSync.friendApplications.list` -> shared `GatewayHTTPClient.listFriendApplications`；authenticated pagination/dedupe/normalization |
| accept | row `加好友` -> confirm -> `acceptFriendApplication` -> reload | `WebIMSync.friendApplications.accept(applicationID)` -> shared accept operation；success then reload，failure keeps original state |
| row/view | embedded mode removes the standalone search；最近三天/三天前、72px row、48px avatar、source/message/status、confirm dialog | normalized direction/user/message/source/status/time/read model + pure view projection；统一容器只持有 tab route |
| deferred | row press marks read then opens user profile；friend/group unread badges；reject exists in injected hook but has no page caller | no click/no-op、unread/read、badge or reject facade；each requires a later bounded route/caller slice |
| acceptance | empty/error/refresh/handling/confirm、guest/history/theme/responsive | local gates + approved real accept mutation；without mutation authorization remains acceptance-gated |

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
| route | single-chat header -> `/conversations/:conversationID/search` -> `/conversations/:conversationID?messageID=<clientMsgID>` |
| canonical runtime chain | H5 route -> `WebIMSync.messages.searchCached` -> `createIMMessageSearchSync` -> `MessageRepository.search` -> current-account sql.js |
| search semantics | keyword is trimmed；SQL LIKE escapes literal `%/_`；deleted/revoked rows are excluded；final match only inspects visible message-body fields；results are newest-first |
| focus semantics | result carries only stable client message ID；chat route rereads the target and surrounding window from the same account cache before DOM focus |
| forbidden paths | page SQL/Repository/Gateway imports、remote search、WebSocket scan、history-page scan、metadata-only false positives、fake results |
| local evidence | SDK Web 52 files/164 tests；H5 38 files/126 tests；all-runtime SDK typecheck、boundary gate、`build:web` package sync、466 assets、H5 typecheck/build/verify pass |
| browser evidence | authenticated 458px search returned the real cached `😎😎` row with sender/date/highlight；result deep link and reload restored the target；no horizontal overflow or console error |
| residual | date/media/file classifications、group-settings entry、automated browser back/forward matrix、desktop/light/dark visual matrix |

Local closeout: the text subset is `implemented-local/acceptance-gated`, not full RN search parity. Search and focus are cache-only reads and do not trigger Gateway、WebSocket or mutation. The shared SDK is the only query owner；H5 owns route、input、result presentation and DOM focus only. `.18.2` remains a separately bounded indexed-category slice.

## 46. W6.a6.18.2 Indexed Chat Search Contract

| contract | frozen value |
| :--- | :--- |
| RN source | `ChatSearchScreen.tsx`、`indexedPages.tsx`、`chatSearchHelpers.ts`、`utils.ts`、`SearchComponents.tsx`；settings entry additionally comes from `SingleChatSettingsScreen.tsx` and `GroupSettingsScreen.tsx` |
| category entry | search home exposes 日期、图片与视频、文件；text results expose 全部、图片与视频、文件；all stay under `/conversations/:conversationID/search` |
| shared query owner | `RN openIMService/WebIMSync.messages.searchCached -> createIMMessageSearchSync -> MessageRepository.search -> current-account SQLite/sql.js` |
| date semantics | shared query accepts inclusive `afterSendTime` and exclusive `beforeSendTime`；H5 initially renders current plus previous two calendar months and can extend older months；a day links to its oldest cached message by stable client ID |
| media semantics | content types `102/104`、newest-first month grouping、全部/图片/视频 filters；safe media URL delegates to the existing chat media preview owner |
| file semantics | content type `105`、newest-first month grouping、existing message view owns name/size projection；preview reuses the existing file interaction and this slice does not start download |
| browser adaptation | RN scroll-top month extension is an explicit “加载更早月份” control；fixed-format 42-cell calendars and 3-column media grid preserve layout without viewport-font scaling |
| forbidden paths | page history scanning、page SQL/Repository/Gateway imports、new media/file preview owner、remote query、fake result、download or mutation during acceptance |
| local evidence | real sql.js lower/upper boundary test；SDK Web 52 files/165 tests；H5 39 files/129 tests；all-runtime typecheck、boundary、`build:web` sync、466 assets、production build/full verify pass |
| browser evidence | authenticated 458px file category rendered real `剑来全文.txt` and existing preview；date rendered June/July/August 2026 and returned Aug 9 to the cached target；media rendered 11 real items, video filter reduced to one and preview opened；all checked views had no horizontal overflow or console error |
| residual | `.18.2.3` entry is closed by section 47；back/forward、desktop and full light/dark visual matrix remain acceptance gates |

Local closeout: `.18.2.1` and `.18.2.2` are `done-local/acceptance-gated`. The shared SDK owns reusable query/time-range/filter/pagination semantics，RN/Web production callers now consume the neutral facade，and H5 owns calendar/month/filter presentation only. `.18.2.3` closes the missing single/group entry through a real settings owner；cross-browser history and full theme/desktop proof remain acceptance gates.

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
| group profile/member settings | nickname、introduction、announcement、member add/remove、role/owner transfer | `infra-only`：Gateway operations 存在，Web shared group facade 目前只读 | 独立 group-management family；按最多三个紧密 operations 冻结权限、事件和 cache owner |
| group mute | group/member mute -> `/v1/group/mute/update`、`/v1/group/member/mute/update` | `infra-only`：RN 有权限投影和 realtime helper，Web shared facade 未接入 mutation | 独立 group-mute slice；群主/管理员权限、mute-until、composer disable 与 realtime 必须同时验收 |
| quit/dismiss | `/v1/group/leave`、`/v1/group/dismiss` + conversation/member cache transition | `infra-only/destructive` | `blocked-destructive-authorization`；群主退出前管理员约束、清历史选项和 route/cache 清理必须单独证明 |

`.18.3.1` 的默认运行链固定为 `ChatSettingsPage -> WebIMSync.conversations -> GatewayHTTPClient -> ConversationRepository -> runtime dataVersion -> existing list/settings projections`。Mutation 只有 Gateway resolve 后才写当前账号 SQLite；Gateway 或本地持久化失败必须保持错误可见，不得显示成功。H5 不注册第二个 WebSocket listener，远端其他端变化继续由已有 realtime conversation upsert 收敛。

Contract-freeze verdict: operation scope 为 setting detail、mute、pin 三项；状态分别为 `🟡 infra-only`、`🟡 runtime-chain-partial`、`🟡 runtime-chain-partial`。未发现 mock shortcut 或 fake-success；清空、退群、解散保持 `🔴 authorization-blocked`，其余群设置保持 `🟡 separately-bounded`。

### W6.a6.18.3.4/.3.5 Group Text Detail Parity

| dimension | frozen contract |
| :--- | :--- |
| shared data owner | `WebIMSync.groups -> WebIMJoinedGroup` 显式投影 `introduction/announcement/announcementVersion/canEditAnnouncement`；页面不得读取 raw Gateway payload |
| introduction | 群设置第二卡显示“群简介”，空副标题“请输入群的内容介绍”，详情空值“暂无群简介”，React Router 子页只读 |
| announcement visibility | 对齐 RN，仅当前角色为 owner/admin 时在置顶/免打扰与清空记录之间显示“群公告”；空副标题“未设置” |
| announcement detail | `/conversations/:conversationID/settings/announcement` 只读真实 shared facade，空值“暂无群公告”，无编辑/发布按钮 |
| convergence | 简介与公告共用 `GroupTextDetailPage` 的会话校验、cache-first 群同步、错误和布局；字段/标题/空值由薄 page 配置 |
| authorization gate | 本切片不调用 `/v1/group/update`、不标记公告已读、不发送公告文本消息；编辑、发布和第二账号通知均需独立合同与授权 |

Local verdict: `.18.3.4/.18.3.5` 为 `done-local/read-only-accepted`；SDK 公告投影已由 Web 消费，RN 保持既有 service 兼容，后续 shared mutation consumer convergence 单独推进。

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
| clear group all | RN group sheet exposes “为我和所有群成员删除” only through `canClearMessages`；Gateway authorizes owner or admin with clear permission | H5 uses joined-group role/permission snapshot only for presentation；unknown permission fails closed，Gateway remains authority；group conversation stays visible with empty latest/unread | `🟡 permission-projection-gap` |
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
| identity | `备注 > 群内昵称 > 公开昵称 > userID` | 设置预览与完整列表统一调用 SDK `resolveIMGroupMemberDisplayName`，不建立 H5-only 优先级 |
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
