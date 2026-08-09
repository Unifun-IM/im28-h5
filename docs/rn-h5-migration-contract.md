# RN to H5 Migration Contract

> TYPE: MIGRATION_SSOT / RN_PARITY_CONTRACT
> STATUS: FROZEN / 2026-08-09
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
| auth flow | `../im28-phone/src/screens/auth/AuthFlowScreen.tsx`; `../im28-phone/src/screens/auth/types.ts` | `/login` 与后续 `/auth/**` routes | `functional-scaffold/not-parity` |
| account login UI | `../im28-phone/src/screens/auth/screens/AccountLoginScreen.tsx`; `../im28-phone/src/screens/auth/styles.ts` | `apps/web/src/pages/login/**` | `core-done-local/acceptance-gated` |
| conversation list | `../im28-phone/src/screens/chat/conversationList/ConversationListScreen.tsx` | `apps/web/src/pages/conversations/**` | `functional-scaffold/not-parity` |
| chat detail | `../im28-phone/src/screens/chat/chatDetail/ChatDetailScreen.tsx`; `../im28-phone/src/screens/chat/components/chatDetailStyles.ts` | `apps/web/src/pages/chat/**` | `functional-scaffold/not-parity` |
| chat header/composer/list | `../im28-phone/src/screens/chat/components/ChatDetailHeader.tsx`; `ChatComposer.tsx`; `ChatMessageList.tsx` | chat feature components | `planned` |
| shell/tab hierarchy | `../im28-phone/src/screens/chat/home/ChatHomeScreen.tsx`; `HomeTabBar.tsx` | nested React Router app layout | `planned` |
| static assets | RN asset roots listed below | `apps/web/src/assets/rn/**` | `466 files/hash-verified` |
| platform-neutral SDK | `../im28-phone/packages/im-sdk/src/web.ts` | dependency of `@im28/im-sdk-web` | `linked` |
| browser runtime | RN Gateway capability semantics + shared SDK Web entry | `packages/im-sdk-web/src/runtime/**`; `sync/**` | auth/conversation/message MVP local |

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
-> @im28/im-sdk/web shared DTO + Gateway client + Repository
-> Gateway HTTP/WebSocket
-> account-scoped SQLite cache
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
| `/login` | account branch in `AuthFlowScreen` | guest route; authenticated user replace to conversations | `core-done-local/acceptance-gated` |
| `/conversations` | `ChatHomeScreen` chats tab + `ConversationListScreen` | authenticated route; list state survives child navigation | `implemented/not-parity` |
| `/conversations/:conversationID` | `ChatDetailScreen` | encoded ID, refresh restore, browser back returns list | `implemented/not-parity` |
| `*` | no RN equivalent | explicit 404 and safe return | `implemented` |

Future full-screen RN states must receive stable routes before UI migration. Auth branches use `/auth/phone`, `/auth/email`, `/auth/account`, `/auth/register`, `/auth/invite`, `/auth/complete-profile` and `/settings/network`; primary tabs use `/conversations`, `/contacts`, `/calls`, `/me`. Bottom sheets and short-lived previews remain modal state only when they are not independently addressable. Production deployment must return `index.html` for valid SPA deep links.

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

Current conversation and chat pages remain API-capable scaffolds, not RN visual parity evidence. Account-login core no longer uses a generic mark/Lucide icon, but it remains below `parity-accepted` until its exact viewport/theme matrix and real login success gate pass.

## 6. Ordered Migration

| slice | deliverable | dependency | status |
| :--- | :--- | :--- | :--- |
| `W6.a0` | freeze this contract and source inventory | RN repository readable | `done` |
| `W6.a1` | mirror all assets; establish complete RN light/dark CSS token base | `W6.a0` | `done-foundation` |
| `W6.a2` | account login visual/interaction/API parity | `W6.a1`; existing auth runtime | `done-local/acceptance-gated` |
| `W6.a3` | conversation shell/list visual/interaction/API parity | `W6.a2`; existing conversation sync | `active` |
| `W6.a4` | chat detail/header/list/composer visual/interaction/API parity | `W6.a3`; existing message sync | `planned` |
| `W6.a5` | remaining auth routes and primary tab route shell | route/API contract per capability | `planned` |
| `W6.closeout` | cross-route responsive/browser/real-Gateway parity review | prior slices | `planned` |

W5 browser-storage evidence and W3 real-Gateway credentials remain independent external gates. They do not block local W6 visual implementation, but they block production acceptance for affected data flows.

## 7. W6.a2 Migration Card

| field | value |
| :--- | :--- |
| feature slice | account login core form + agreement/terms |
| phase | vertical migration / Web SDK adapter + route caller |
| production flow | `AccountLoginScreen.tsx` -> `loginByAccountPassword`; `TermsViewer.tsx` -> `getPlatformTerm` |
| operations | `POST /v1/auth/user/login`; `POST /v1/platform/term/get` |
| current status | login `implemented/local-tested`; platform term `implemented/live-public-api-tested` |
| must-have fields | login: `type/account/password/device_id`; term: `key/title/content/version` |
| adapters | `WebIMRuntime.login`; W6.a2 platform-term runtime adapter; React Router `/login` caller |
| route | `/login` |
| source assets | auth `startup-logo.png`, `clear-icon.svg`, `eye-icon.svg`, `eye-closed-icon.svg`; navbar back SVG for terms modal |
| open gaps | phone/email/register/forgot-password/network-settings routes belong to `W6.a5`; real login success requires approved Gateway test credentials |
| local evidence | `npm run verify`: 466 assets, 20 test files / 55 tests, type/build green; dark `458x786` browser has no overflow; form/clear/eye/agreement/terms/refresh passed |
| acceptance gate | exact `390x844 + desktop` light/dark screenshots and approved-account login success/redirect remain required |

W6.a2 does not render nonfunctional alternate-auth or network-setting links. Their omission is bounded slice scope, not permission to replace them with placeholders; W6.a5 must restore those RN entries together with their real routes and API contracts.
