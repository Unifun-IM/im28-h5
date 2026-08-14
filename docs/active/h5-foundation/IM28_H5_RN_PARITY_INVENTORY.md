# IM28 RN/H5 Parity Inventory

> TYPE: MIGRATION_SSOT / READ_ONLY_AUDIT
> UPDATED: 2026-08-14
> AXIOM: `route exists != capability complete`；只有 production caller、shared owner、failure semantics 与 acceptance evidence 同时闭合才可标 `complete`。

## 1. Status Model

| status | definition | next action |
| :--- | :--- | :--- |
| `complete-local` | RN 可见结构与默认 H5 runtime chain 已实现，自动 gate 通过 | 仅处理明确 regression |
| `acceptance-gated` | production chain 已存在，但真实 mutation、自然数据、双账号、媒体或跨浏览器证据缺失 | 满足 activation gate 后验收 |
| `contract-blocked` | Gateway/OpenAPI 缺失必要 operation | 等待后端合同；禁止 fake success |
| `web-not-applicable` | RN 能力依赖 native OS/runtime，浏览器无等价 owner | 不创建无效页面；Desktop 走独立 adapter |
| `partial` | route/runtime 存在，但仍有明确 consumer/interaction 缺口 | 建立 bounded implementation slice |

## 2. Capability Matrix

| domain | frozen RN anchor | H5 route/owner | status | residual/gate |
| :--- | :--- | :--- | :--- | :--- |
| phone/email/account login | `AuthFlowScreen` + three login screens | `/auth/phone|email|account` -> `LoginPage` -> Web runtime auth | `acceptance-gated` | fixed `666666` environment works；send-code operation absent |
| register/invite/profile onboarding | register/invite/complete-profile screens | `/auth/register|invite|complete-profile*` -> onboarding provider/shared auth | `acceptance-gated` | disposable new-account flow、avatar upload/profile update |
| forgot-password alternatives | `ForgotPasswordMethodsScreen` | `ForgotPasswordMethodsDialog` | `complete-local` | actual support channel product config |
| phone/email bind/change | `ProfileScreen verify/bind routes` | `/me/security` currently read-only contact rows | `contract-blocked` | Gateway send-code operation absent；no fake bind/change |
| native network proxy | `NetworkSettingsScreen` | none | `web-not-applicable` | browser fetch/WebSocket cannot inject per-app HTTP/SOCKS proxy；Desktop adapter only |
| four primary tabs | `ChatHomeScreen` | `/conversations|contacts|calls|me` -> `PrimaryTabsLayout` | `complete-local` | badge/logout real action and Safari/Firefox evidence |
| conversation list/search/archive | conversation/home search/archive screens | `/conversations*` + shared conversation/message search | `acceptance-gated` | long-page/natural media samples、destructive actions、cross-browser |
| contacts/search/profile/applications/groups | contact/profile/verification/group screens | `/contacts*` + shared contact/application/group facades | `acceptance-gated` | pending/non-empty natural data、accept/reject/apply/leave real actions |
| call list/detail | `CallListScreen`/`CallDetailScreen` | `/calls` + `/calls/:callID` -> shared call record facade | `acceptance-gated` | answered/duration samples、delete result/list-back |
| RTC outgoing/incoming/active | RN global call provider + LiveKit modal | `WebIMCallProvider` + `/calls/active` + shared call control/LiveKit port | `acceptance-gated` | usable RTC deployment、dual account、permissions、background/terminal flows |
| chat history/realtime/unread | `ChatDetailScreen` hooks | `/conversations/:id` -> shared message/conversation/realtime owners | `acceptance-gated` | non-zero unread pagination、offline restart、dual-account edge cases |
| text/mention/quote/card/system messages | RN message body family | shared message view/parser + chat bubble components | `complete-local` | natural uncommon payload pixels；type109 stays generic in both clients |
| image/audio/video/file/custom emoji read | RN media message components | shared payload projection + `ChatMediaInteractionProvider` | `acceptance-gated` | Chromium 真实 5 秒语音播放/终态已通过；图片/视频/文件打开下载、signed URL 变体、Safari/Firefox/device 仍待验收 |
| text/media/voice/card/custom emoji send | RN composer/services | H5 composer/browser media ports -> shared send owners | `acceptance-gated` | explicitly authorized upload/send、Network/cache/realtime/list-back |
| forward/edit/delete/multi-select | RN message action menus | H5 action menu/picker/composer -> shared message owners | `acceptance-gated` | destructive/partial-result authorization、physical long-press |
| chat search/date/media/file index | RN chat search | `/conversations/:id/search` -> shared cache search | `complete-local` | non-empty media/file natural data、cross-browser/device |
| single/group chat settings | RN single/group settings screens | `/conversations/:id/settings*` | `acceptance-gated` | mute/pin/auto-delete/clear/leave/dismiss real actions |
| group profile/member/admin/management | RN group edit/member/manage screens | group settings/profile/members/manage child routes -> shared group owners | `acceptance-gated` | role-specific natural data、authorized member/admin/owner mutations |
| group create/search/apply/card open | RN create/server-search/application + type108 card action | `/groups/create|search|:id/apply` + chat card -> shared group owners | `acceptance-gated` | 已加入群名片 real browser 直达会话已通过；create/apply/non-member card mutation、persistence and second-account list-back |
| broadcast | RN broadcast select/compose | `/broadcast/select|compose` -> shared batch owners | `acceptance-gated` | real text/media batch send、partial results |
| QR scan/display/share | RN QR screens | `/scan`、profile/group QR routes + global share picker | `acceptance-gated` | camera permission/device scan、download/share final send |
| profile/display/terms | RN `ProfileScreen` routes | `/me/profile*`、display、terms | `acceptance-gated` | changed-value update、device/cross-browser evidence |
| notification/permission settings | RN notification/permission screens | `/me/settings/notifications|permissions` -> shared settings facade | `acceptance-gated` | operation feedback converged；real changed-value result/rollback and cross-browser evidence |
| blacklist | RN blacklist route | `/me/settings/blacklist` -> shared blacklist facade | `acceptance-gated` | non-empty sample、authorized removal/list-back |
| version/logout | RN general settings | `/me/settings` -> client version/runtime sign-out | `acceptance-gated` | operation feedback converged；update-available and real logout cleanup evidence |
| cache cleanup | RN cache-space semantics | none | `web-not-applicable` | H5 has no product-owned temporary CacheStorage/Service Worker cache；must not delete account SQLite snapshot |

## 3. Confirmed Development Residuals

| priority | slice | operations | owner | stop condition |
| :--- | :--- | :--- | :--- | :--- |
| `closed` | `.149.11 settings-operation-feedback` | permission update；version check；sign-out | H5 `useAppToast` consumers only | 149 files/493 tests + typecheck/build passed；real mutation gated |
| `closed` | `.149.12 chat-settings-responsibility-split` | split 539-line `ChatSettingsPage` by existing responsibility | H5 presentation modules | 343-line page + 202-line cards module；focused/full/browser passed |
| `closed` | `.149.13 forward-preview-rn-parity` | forward preview selection/presentation；no send | H5 presentation + existing shared message view | 150 files/497 tests + 382×786 browser passed；send partial result gated |
| `closed` | `.149.14 forward-composer-sender-summary` | source sender names；no send | H5 presentation + shared conversation/group-member cache | 151 files/500 tests + RN/Figma + 382×786 browser passed；send result gated |
| `closed` | `.149.15 voice-playback-natural-data` | real cached voice play/terminal state；no mutation | H5 media interaction consumer + existing browser audio owner | Chromium 5s sample passed；browser/device matrix gated |
| `closed` | `.149.16 forward-origin-display-name` | preview origin remark/nickname projection；no send | H5 presentation + existing resolved sender-name cache | 151 files/502 tests + authenticated readonly browser；fresh raw sample/send gated |
| `closed` | `.149.17 outgoing-voice-direction` | outgoing audio content order and icon direction；no playback mutation | H5 CSS presentation + existing media interaction owner | typecheck/build + authenticated 382px computed-style/screenshot pass |
| `closed` | `.149.18 recorder-hud-and-group-card` | 真实录音电平 HUD；群名片按实时入群关系进入会话或申请页 | H5 browser media/route adapter + existing shared group owner | group-card authenticated browser passed；physical microphone/touch and non-member mutation gated |
| `closed` | `.149.19 unified-forward-composer` | 转发摘要置于唯一 `ChatComposer` 顶部；输入、表情和显式发送不再双轨 | H5 presentation + existing shared forward owner | 152 files/505 tests + typecheck/build；real forward send result gated |
| `closed` | `.149.20 group-member-picker-modal` | invite/remove routes 叠加群设置背景并复用 100% × 60dvh 底部选择弹窗 | H5 shared modal shell + existing shared group-members owner | 152 files/505 tests + authenticated light/dark Chromium；real mutation、Safari/Firefox、physical touch gated |
| `closed` | `.149.21 chat-page-cache-owner-split` | 首屏恢复、实时缓存重读、搜索消息定位与窗口维护 | H5 `useChatPageCacheState` + existing WebIMSync cache facade | 152 files/505 tests + typecheck/build + authenticated readonly Chromium；不扩大 capability 完成声明 |
| `P3` | contract activation | verification-code send + phone/email bind/change | shared Gateway/OpenAPI/SDK owner | activate only when backend contract exists |

## 4. Acceptance Ledger

| gate class | blocked capabilities | activation |
| :--- | :--- | :--- |
| `business-mutation` | application handling、profile/settings、group lifecycle/roles、message edit/delete/send、call delete | exact operation + disposable target + allowed server/SQLite effect |
| `natural-data` | pending application、non-empty blacklist、admin/member bubbles、uncommon message/media/call samples | real account naturally exposes sample |
| `deployment` | RTC signaling/credential/LiveKit | working RTC backend and two accounts |
| `browser/device` | Safari、Firefox、physical touch、camera/microphone、background lifecycle | corresponding runtime available |
| `backend-contract` | verification code、contact bind/change | generated OpenAPI + shared SDK facade available |

## 5. Audit Verdict

- ordinary RN production route gaps: `0 confirmed`。
- bounded H5 consumer gaps: `.149.11-.17` 已关闭 operation feedback、chat settings、forward preview/summary/origin、真实语音播放与发送方方向；`.149.18-.20` 已继续关闭录音 HUD/群名片、唯一 forward composer 和群成员选择弹窗双轨；`.149.21` 收敛聊天缓存页面 owner；no unconditionally activatable local gap remains。
- backend contract gaps: verification code + phone/email bind/change。
- platform exclusions: native network proxy + native temporary-cache cleanup。
- mock/fake-success: none found in audited default paths；fixed `666666` is visible environment contract, not send-code success。
