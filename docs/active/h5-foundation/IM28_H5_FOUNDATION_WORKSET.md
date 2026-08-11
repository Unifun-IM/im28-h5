# IM28 H5 Foundation Workset

| field | value |
| :--- | :--- |
| status | `active` |
| active_slice | `W6.a6.12.1-rn-web-single-track-convergence-gate` |
| verification_floor | `npm run verify` plus local browser smoke |

## Workstream Ledger

| workstream | scope | owner | expected deliverable | verification | status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `W1` | 基线与执行治理 | docs | H5 SSOT 与 active trio | 文档交叉核对 | `done` |
| `W2` | workspace 与 Web SDK 基础 | web app + sdk | 可安装、可构建、可启动骨架 | `npm run verify`; browser smoke | `done` |
| `W3` | Gateway runtime | sdk runtime | 真实认证与连接链路 | targeted tests + manual smoke | `gated` |
| `W4` | 会话与文本消息 | feature + sdk | 核心聊天 MVP | tests + real flow smoke | `gated` |
| `W5` | 生产化门禁 | storage/runtime | Worker、多标签页与恢复策略 | browser matrix + regression | `gated` |
| `W6` | RN 页面 parity | web feature + sdk facade | RN 样式/资产/行为/API 的 React Router SPA 迁移 | source trace + visual/route/API evidence | `active` |
| `W6.a6.12.1` | cross-runtime convergence | shared SDK + RN/Web composition | consumer matrix、neutral facade、RN/Web actual-call adoption、compat exit register | shared tests + runtime boundary + RN/Web caller evidence | `active` |

## Active / Pending Slice Queue

| item | type | owner | target output | verification | status | next activation rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `W2.a1` | code/docs | workspace + sdk + app | npm workspace、`@im28/im-sdk/web`、Vite React Router App | `npm run verify`; browser smoke | `done` | closed 2026-08-09 |
| `W2.a2-unified-multi-runtime-sdk` | architecture/refactor | `im28-sdk` + RN/H5 consumers | single npm package、shared `src/sync`、isolated RN/Web/Desktop entries、app-local SDK removal | SDK typecheck/29 files 89 tests/build:all/pack dry-run + RN tsc + H5 verify | `done` | closed 2026-08-10；Desktop concrete driver remains Electron-app choice |
| `W2.closeout` | verification/docs | docs + workspace | 状态、架构、cleanup 和证据回写 | trio consistency + root gate | `done` | closed 2026-08-09 |
| `W3.a1` | contract/design | sdk runtime | Gateway runtime contract、auth/token owner 与配置边界 | 4 test files / 11 tests + workspace verify | `done` | closed 2026-08-09 |
| `W3.a2-local` | code/verification | sdk runtime + storage | browser auth/realtime、account SQLite lifecycle、privacy gate | shared SDK test + H5 25 tests + Chromium SQLite smoke | `done` | closed 2026-08-09 |
| `W3.real-gateway` | deployment verification | sdk runtime + deployment | real login/WebSocket evidence | `npm run smoke:gateway` | `blocked-external` | Gateway URL/account variables available |
| `W3.closeout` | verification/docs | sdk runtime + docs | real smoke evidence、架构与 trio 回写 | `npm run verify` + real Gateway smoke | `planned` | `W3.real-gateway` passed |
| `W4.a0` | contract/code | shared sdk + web sdk | 三操作 contract 与唯一 Gateway DTO -> core mapper | pure mapping tests + shared SDK build | `done` | closed 2026-08-09 |
| `W4.a1-conversations` | code | web sdk runtime | cache list、Gateway full sync、latest message persistence | 3 focused sql.js/Repository tests | `done` | closed 2026-08-09 |
| `W4.a1-history-send` | code | web sdk runtime | cache history、remote pull、optimistic text send | 3 message sync tests + workspace verify | `done` | closed 2026-08-09 |
| `W4.a1-ui` | code | web app | React Router conversation/message default caller | build + desktop/mobile config/login smoke | `done-local` | authenticated real flow still gated |
| `W4.a2-created-conversation` | code/verification | web sdk runtime | 新消息/会话事件落库、账号隔离、分页 HTTP 缺口恢复与 UI cache 刷新 | 5 focused tests + workspace verify | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-updates` | contract/code | web sdk runtime | 消息编辑、撤回、删除的 cursor 与 Repository 状态收敛 | sql.js + raw WebSocket integration | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-serialization` | architecture/code | web sdk sync | full sync/history/send/realtime 共享业务 operation queue | 3 delayed interleaving/failure regressions | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-closeout` | verification/docs | web sdk runtime + docs | W4.a2 证据、残留项与下一片回写 | `npm run verify` + real chat smoke | `blocked-external` | local closeout passed; real Gateway variables absent |
| `W5.a1-storage-boundary` | architecture | storage/runtime | Dedicated Worker RPC、lifecycle Web Lock 与 failure contract | architecture review + executable test plan | `done` | closed 2026-08-09 |
| `W5.a2-worker-runtime` | code/verification | storage worker | typed RPC/client、Worker-owned sql.js/IndexedDB、fatal-state discard | 7 adapter/protocol tests + 18/47 workspace verify + Worker build | `done-local` | closed 2026-08-09 |
| `W5.a3-multi-tab-writer` | code/verification | storage lifecycle | account-scoped lifecycle Web Lock、busy/unsupported UI state | 6 lock/lifecycle tests + 19/52 verify | `done-local` | closed 2026-08-09 |
| `W5.a3-browser-matrix` | deployment verification | storage runtime | real Worker/IndexedDB/Web Locks two-tab close/crash evidence | Chromium/Firefox/Safari matrix | `blocked-environment` | target browser harness available |
| `W5.a4-storage-operations` | code/verification | storage/runtime | quota、compaction、corruption rebuild workflow | large-history/quota/recovery evidence | `planned` | W5.a3 passed |
| `W6.a0-migration-contract` | contract/docs | docs + RN source inventory | 样式、资产、SDK/API、React Router 四类硬约束与验收门 | source-path cross-check | `done` | closed 2026-08-09 |
| `W6.a1-assets-theme` | code/docs | web styles/assets | 466 文件字节镜像、SHA-256 gate、完整 RN light/dark token foundation | `npm run assets:check`; CSS/source review | `done-foundation` | closed 2026-08-09 |
| `W6.a2-account-login-parity` | code/verification | web login + sdk facade | RN 账号登录布局、资产、协议状态、真实登录/条款 caller | 466 assets + 20/55 verify + dark mobile interaction/refresh/live-term smoke | `done-local/acceptance-gated` | exact viewport/theme + real login evidence available |
| `W6.a3-conversation-parity` | code/verification | web conversations + sdk facade | RN home shell/conversation list parity | 390x844 light/dark + 760px responsive + auth guard + cache composition test + verify | `done-local/acceptance-gated` | real account cache/sync/chat-back evidence available |
| `W6.a4-chat-parity` | code/verification | web chat + sdk facade | RN header/message list/composer parity | 390x844 light/dark + 760x900 responsive + guest guard + existing sync chain review + verify | `done-local/acceptance-gated` | approved account history/send/realtime/list-back evidence available |
| `W6.a5.1-auth-entry-routes` | code/verification | web login + sdk runtime | phone/email/account/register RN parity、real auth facades and route switching | 21/58 verify + 390x844 dark + 760x900 + deep-link/back/forward + no-fake audit | `done-local/acceptance-gated` | real account/phone/email smoke、send-code contract and light-mode proof available |
| `W6.a5.2-remaining-auth-tab-routes` | design/code/verification | web app routes + features | invite/profile/network and contacts/calls/me as bounded route slices | source/API/route ledger, then per-slice deep-link/back/forward/auth-guard matrix | `active` | continue child slices through the shared tab shell owner |
| `W6.a5.2.1-contacts-core` | code/verification | web contacts + sdk facade | RN contact list, real paged friend operation, local search/group/index and `/contacts` guard | original 22/60 gate + `.17.2.2` cache + `.1.1` Pinyin authenticated 7-row proof | `done-local/acceptance-gated` | cache-first and Pinyin paths closed；broader responsive/theme acceptance remains |
| `W6.a5.2.1.1-contact-pinyin-index-parity` | code/verification | web contacts presentation | RN `pinyin-pro@3.28.1` surname-mode Chinese index with unchanged SDK order and `#` fallback | 4 focused tests + H5 35/120 + full verify + authenticated 458x786 A/D/Z/H proof | `done-local/acceptance-gated` | closed 2026-08-11；dictionary-in-main debt closed by `.1.2` |
| `W6.a5.2.1.2-contact-route-code-split` | code/verification | web React Router + contacts presentation | lazy `/contacts` route, accessible loading state and dictionary-free search filter | H5 36/122 + full verify + production chunk comparison + authenticated tab navigation/overflow/console proof | `done-local/acceptance-gated` | closed 2026-08-11；global main chunk remains a separate app-wide performance debt |
| `W6.a5.2.2-primary-tab-shell` | code/verification | web app layout + global component | RN 4-tab global shell, real unread badge, nested conversation/contact/calls routes and child-page exclusion | 390x844/760x900 light/dark + click/back/forward/reload + chat-detail exclusion + 22/60 verify | `done-local/acceptance-gated` | me real route + application badge owner + calls/overall safe-area/cross-browser evidence |
| `W6.a5.2.3-calls-core` | code/verification | web calls + sdk facade | RN 通话记录 cache/sync/delete 与 `/calls` 主标签页 | source trace + 3 sql.js tests + guest guard + anti-fake/owner audit + 23/63 verify | `done-local/acceptance-gated` | real-account Network/data/delete + 390x844/760x900 light/dark/history proof |
| `W6.a5.2.4-me-core` | code/verification | web me + sdk facade | RN current-profile hero、general settings/logout、`/me` fourth tab | source trace + profile auth tests + authenticated 390x844/760x900 light + history + 24/65 verify | `done-local/acceptance-gated` | dark screenshot + real logout Network/session cleanup proof |
| `W6.a5.2.5-me-profile-edit` | code/verification | web me profile + sdk facade | nickname/gender/bio update-profile routes and RN field validation | source/API trace + 4 tests + authenticated responsive/history/cold-restart + 24/67 verify | `done-local/acceptance-gated` | dark proof + approved changed-value Network/result evidence |
| `W6.a5.2.6-account-security` | design | web me security + sdk/runtime facade | RN security screen/operation/route matrix with bounded real mutations only | source/API/export/session-side-effect trace | `decomposed` | account credential child done-local/acceptance-gated；contact verification remains blocked-contract |
| `W6.a5.2.6.1-account-credential` | code/verification | web me security + sdk runtime | security root、set account/password、old-password reset with revoked-session cleanup | 3 focused tests + 25/70 verify + authenticated responsive/history/guest browser matrix | `done-local/acceptance-gated` | approved real set/reset Network/result + dark proof |
| `W6.a5.2.6.2-contact-security` | contract/code | web me security + sdk/runtime facade | phone/email bind or change with verified-code lifecycle | send-code + mutation contract and real verification flow | `blocked-contract` | Gateway exposes a real send-code operation or product explicitly changes scope |
| `W6.a5.2.7-general-settings` | design | web me settings + sdk/runtime facade | display、notification、permission、network、terms、version/cache route/capability matrix | RN source/API/route owner trace | `decomposed/active-children` | continue bounded children without mixing browser-blocked contracts |
| `W6.a5.2.7.1-display-notification-terms` | code/verification | web me settings + sdk runtime | RN display preference、real notification detail/update facade、real terms routes | 2 focused tests + 26/72 verify + authenticated responsive/theme/history/guest browser matrix | `done-local/acceptance-gated` | approved notification update + Safari/Firefox route/theme proof |
| `W6.a5.2.7.2-permission-settings` | code/verification | web me settings + sdk runtime | five RN permission switches through authenticated detail/update operations | 3 focused settings tests + 26/73 verify + real-read responsive/history/reload/guest browser matrix | `done-local/acceptance-gated` | approved real update Network/result + Safari/Firefox proof；blacklist remains separate |
| `W6.a5.2.7.3-network-settings` | contract | deployment + web settings | Web-equivalent proxy/network semantics | deployment proxy contract | `blocked-browser-semantics` | browser-safe proxy/config owner is defined |
| `W6.a5.2.7.4-cache-version` | contract | storage/deployment + web settings | browser cache scope/clear and Web update semantics | RN/shared SDK/storage/deployment trace + destructive/anti-fake review | `contract-frozen/decomposed` | version child done-local/acceptance-gated；cache child blocked-storage-semantics |
| `W6.a5.2.7.4-cache-contract` | contract/code | storage/runtime | disposable storage registry + lifecycle-safe current-account inspect/clear | preserve local-only data + isolated destructive tests + Worker/Web Lock recovery | `blocked-storage-semantics` | disposable data is separable from drafts/failed/sending/pending state |
| `W6.a5.2.7.5-web-version-check` | code/verification | web runtime config + settings | required build identity、public check adapter、RN version row/update modal | 11 focused tests + 27/81 verify + authenticated no-update + responsive/reload/guest proof | `done-local/acceptance-gated` | real `need_update=true` optional/forced response and update target proof |
| `W6.a5.2.8-invite-complete-profile-contract-freeze` | contract/design | auth onboarding + sdk/runtime | RN invite/profile route、operation and post-register state matrix | source/API/caller trace + anti-placeholder/anti-fake review | `done` | closed 2026-08-10；decomposed into route-state/invite/profile children plus explicit avatar/contact blockers |
| `W6.a5.2.8.1-onboarding-route-state` | code/verification | web auth routing + onboarding state | register/login split、memory-only pending registration、account-scoped marker and route guards | 4 state tests + caller tests + full verify + missing-marker browser guards | `done-local/acceptance-gated` | valid register context proof joins `.8.3` acceptance；no credential persistence |
| `W6.a5.2.8.2-invite-page` | code/verification | web auth invite + runtime register | RN invite UI and retry through existing register optional `invite_code` | register body/error tests + responsive/history proof | `done-local/acceptance-gated` | approved invite-required response + valid-context visuals；no standalone invite validation |
| `W6.a5.2.8.3-complete-profile-core` | code/verification | web auth profile + existing profile facade | RN profile core、memory draft、gender/bio SPA subroutes and real current-detail/update | 10 focused app tests + full 27/81 verify + base/gender/bio anonymous guards passed；valid-context matrix pending | `implemented-local/acceptance-gated` | active until approved register/profile Network/result + responsive/light/dark/history proof；avatar/contact actions omitted |
| `W6.a5.2.8.4-onboarding-real-acceptance` | deployment verification | web auth + deployment owner | approved register/optional invite/profile mutation and valid-context visual/history evidence | Network/result + 390x844/760x900 light/dark/back/forward/reload | `blocked-external` | approved disposable new account and mutation authorization available；never fabricate marker/session |
| `W6.a5.2.9-blacklist-core` | code/verification | web me + sdk sync | RN blacklist list/search/remove/confirm route through shared Gateway operations | 4 facade + 4 filter tests + 28/85 verify + guest guard/cleanup | `done-local/acceptance-gated` | approved authenticated list/remove + responsive/light/dark/history proof；no unsupported add flow |
| `W6.a5.2.10-friend-applications-core` | code/verification | web contacts + sdk sync | RN standalone friend application list/search/group/status/accept through shared Gateway operations | 4 facade + 5 view tests + 29/89 SDK verify + build:web package sync + guest guard | `implemented-local/acceptance-gated` | approved authenticated list/accept + responsive/light/dark/history proof；no fake session or unsupported unread/group/profile/reject path |
| `W6.a5.2.11-group-applications-core` | code/verification | web contacts + sdk sync | RN group verification index、per-group application list/search/section/status and accept/reject through one audit facade | 4 facade + 5 view tests + 30/93 SDK verify + build:web package sync + index/detail guest guards | `implemented-local/acceptance-gated` | approved group-admin audit/accept/reject + responsive/light/dark/history proof；no fake session or unsupported unread/profile/manage/member-join path |
| `W6.a5.2.12-joined-groups-core` | code/verification | web contacts + sdk sync | RN 我的群聊 cache-first list/search/status/role and conversation opening through shared group/conversation facades | 4 cache/auth/pagination/dedupe/mapping/failure tests + 5 pure view tests + 31/97 verify + guest guard | `implemented-local/acceptance-gated` | local implementation and gates passed 2026-08-10；real account data/open-conversation and responsive theme/history proof remain acceptance gates |
| `W6.a5.2.13-contact-profile-core` | code/verification | web contacts + sdk sync | RN 联系人点击 -> 资料 -> 发消息/加好友 through shared user/friend/conversation facades | 4 auth/normalize/open-persist/apply/failure tests + 4 pure view tests + 32/101 SDK verify + build:web/full verify/HTTP deep-link smoke | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10；approved account data/actions and responsive light/dark/history proof remain acceptance gates |
| `W6.a5.2.14-contact-user-search-core` | code/verification | web contacts + sdk sync | RN 通讯录搜索入口、本地好友匹配、真实 Gateway 用户搜索和资料页跳转 | 4 facade + 4 view tests + 32/103 SDK verify + build:web/full verify/deep-link smoke | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10；approved account local/remote search and responsive light/dark/history proof remain acceptance gates |
| `W6.a6.1-chat-media-read-core` | code/verification | web chat | RN 图片全屏预览、单实例语音播放/停止、视频全屏播放，消费既有 cache payload | H5 11/42 + SDK 32/103 + 466 assets + typecheck/build/full verify + guest guard | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10；approved authenticated media playback and responsive light/dark proof remain acceptance gates |
| `W6.a6.2-chat-image-file-send-core` | code/verification | shared sdk + web adapter + web chat | RN 相册图片/普通文件选择 -> 上传凭证 -> OSS 直传 -> Gateway send -> SQLite 状态收敛 | H5 12/46 + SDK 33/107 + 466 assets + all-runtime typecheck + full verify/build + release/pack + responsive browser proof | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10；real upload/send requires explicit authorization and remains an acceptance gate |
| `W6.a6.3-chat-album-video-send-core` | code/verification | shared sdk + web adapter + web chat | RN mixed 相册视频 -> browser metadata -> shared upload/Gateway video body -> SQLite 状态收敛 | H5 13/50 + SDK 35/109 + 466 assets + all-runtime typecheck/build:web/full verify + responsive browser proof | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10；real upload/send requires explicit authorization and remains an acceptance gate |
| `W6.a6.4-chat-voice-send-core` | code/verification | shared sdk + web media adapter + web chat | RN hold/cancel recording -> browser Blob -> shared upload/Gateway audio body -> SQLite 状态收敛 | H5 15/56 + SDK 36/111 + injected recorder lifecycle/error tests + all-runtime typecheck/build:web/full verify + responsive voice-mode proof | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10 without opening a microphone or transmitting media；real recording/upload/send requires explicit authorization |
| `W6.a6.5-chat-system-emoji-core` | code/verification | web chat composer + browser preference adapter | RN Unicode emoji panel -> selection-aware draft editing -> existing text send path | 9 focused + H5 17/65 + SDK 36/111 + 466 assets + full verify/build + authenticated 390x844/1280x800 browser proof | `done-local/acceptance-gated` | no message transmitted；real text send remains an explicit acceptance gate |
| `W6.a6.6-chat-illustrated-emoji-contract-freeze` | contract/design | RN preset registry/document/send/read + shared SDK boundary | source trace -> entity/body/cache/display contract -> bounded implementation slices | RN source/API/caller trace + 135/133 identity audit + ownership/failure/anti-placeholder review | `done` | Gateway schema partial、SDK mapper/send/cache gaps and shared owner decision frozen in migration contract §30 |
| `W6.a6.6.1-shared-preset-emoji-core` | code/convergence | im28-sdk core/transport/sync/repository + RN thin adapters | shared DTO/descriptor/document/entity -> Web send/map/SQLite；remove RN live algorithm duplication | SDK 37/116 + build:rn/build:web + RN 3 suites/12/tsc + H5 17/65/typecheck/build + 466 assets | `done-local` | closed 2026-08-10；no H5 UI or real send |
| `W6.a6.6.2-h5-illustrated-emoji-ui` | code/verification | H5 chat composer/message/conversation + browser preference/assets | shared descriptors/entities -> illustrated tab/grid/preview/bubble/conversation projection | H5 21/75 + SDK 37/116 + 466 assets + 458x786/1280x900 light/dark proof | `done-local` | closed 2026-08-10；no real send/custom emoji/draft persistence |
| `W6.a6.6.3-illustrated-emoji-acceptance` | deployment verification | H5 + SDK + approved disposable conversation | one authorized preset text send -> Gateway -> SQLite -> list-back | Network/result/cache proof | `blocked-external` | explicit send authorization and disposable account/conversation required |
| `W6.a6.7-custom-emoji-contract-freeze` | contract/design | RN custom emoji library/send/manager + Gateway generated API + SDK/H5 gaps | freeze type 115 DTO/cache/send/UI/failure/owner map and bounded slices | RN/API/caller trace + anti-fake/owner review | `done` | closed 2026-08-11；overall runtime-chain-partial |
| `W6.a6.7.1-shared-custom-emoji-core` | code/convergence | SDK core/transport/sync/repository | DTO + list mapper/client + SQLite cache + `listCached/sync/sendCustomEmoji` | Gateway contract + 5 focused real sql.js/HTTP tests + 40/121 Web suite + core/all-runtime build + package sync | `done-local` | closed 2026-08-11；no manager mutation or real send |
| `W6.a6.7.2-h5-custom-emoji-panel` | code/verification | H5 chat panel/message + browser preference | third tab + five-column recent/all + safe type 115 send/read presentation | H5 22/77 + SDK 40/121 + typecheck/build/assets + authenticated real-list 458x786/1280x800 dark proof | `implemented-local/acceptance-gated` | no manager/real send；light-theme proof remains open |
| `W6.a6.7.3-custom-emoji-manager` | contract/design | SDK media/custom emoji + H5 manager | create/add/delete/reorder decomposition with explicit mutation semantics | RN/Gateway/caller/owner/failure review | `done` | closed 2026-08-11；split into `.3.1/.3.2/.3.3` |
| `W6.a6.7.3.1-shared-custom-emoji-mutations` | code/convergence | SDK transport/sync/repository + shared upload port | create uploaded images、add received ID、batch delete and cache convergence | HTTP contract + injected upload + real sql.js + 40/126 Web + all-runtime build | `done-local` | closed 2026-08-11；no real upload/mutation |
| `W6.a6.7.3.2-h5-custom-emoji-manager` | code/verification | H5 chat/manager/router | add tile、image picker、five-column preview/select/confirm-delete | H5 23/80 + SDK regression + 458x786 read-only browser proof | `implemented-local/acceptance-gated` | closed 2026-08-11；real file selection/mutation and desktop/light proof remain gated |
| `W6.a6.7.3.3-custom-emoji-add-reorder` | code/verification | H5 message actions + browser preference | type115 add action + stable-ID local reorder | H5 24/85 + focused projection/order tests + 458x786 move-tray/cancel proof | `implemented-local/acceptance-gated` | closed 2026-08-11；current history has no type115；no real add/order commit |
| `W6.a6.7.4-custom-emoji-acceptance` | deployment verification | H5 + SDK + approved account | real list/cache + one authorized disposable type 115 send | Network/Gateway/SQLite/realtime/list-back | `blocked-external` | explicit account/conversation authorization required |
| `W6.a6.8-chat-media-export` | code/verification | H5 chat + browser media adapter | RN image save and file preview/download over persisted real payload | H5 25/92 + full verify + real cached 458x786/1280x800 proof | `implemented-local/acceptance-gated` | actual download/open and light-theme proof remain gated |
| `W6.a6.9-chat-failed-retry` | contract/code/verification | RN chat + shared SDK + H5 chat | same-row type101/type115 retry with shared owner and explicit media exclusion | SDK 41/130 + real sql.js identity/failure/no-I/O gates + build:all + H5 25/92/typecheck/build | `implemented-local/acceptance-gated` | closed 2026-08-11；real failure/retry requires explicit authorization |
| `W6.a6.10-chat-media-retry-stage` | contract/code/verification | shared SDK media send + Web runtime + H5 capability | durable post-upload body checkpoint、conditional 102–105 same-row retry、pre-Realtime interrupted-send recovery and explicit pre-upload source reselection | SDK 43/138 + upload-once/body/range/order gates + all-runtime build:all + H5 25/92/verify + 458px read-only smoke | `implemented-local/acceptance-gated` | closed 2026-08-11；real Gateway failure/retry remains explicitly authorized acceptance only |
| `W6.a6.11-chat-quote-reply` | contract/code/verification | RN chat actions + shared SDK message sync + H5 composer/list | type114 quote eligibility、Gateway body、durable source projection、composer cancel/send、failed-state semantics and source jump | SDK 44/140 + all-runtime build + H5 typecheck/build/verify + authenticated 458px read-only action/preview/cancel proof | `implemented-local/acceptance-gated` | closed 2026-08-11；real quote send remains explicitly authorized acceptance only |
| `W6.a6.11.1-sdk-sync-runtime-boundary` | architecture/refactor/verification | shared SDK + RN/Web/Desktop entries | shared business sync、Web-only composition and three runtime adapter directories become structurally distinguishable | AST boundary gate + SDK 44/140 + build:all + RN tsc + H5 verify + per-target dist presence check | `done-local` | closed 2026-08-11；RN runtime path unchanged and Web composition absent from RN/Desktop dist |
| `W6.a6.12-shared-sync-neutral-naming-and-rn-adoption-contract-freeze` | contract/design | shared SDK + RN service boundary | freeze neutral-name aliases/deprecation order and explicit RN adoption decision without dual-track business logic | public export inventory + RN caller trace + compatibility/build matrix | `done` | closed 2026-08-11；no unused alias、mass rename or RN runtime cutover；future adoption requires explicit RN composition/service slice |
| `W6.a6.13-chat-copy-core` | code/verification | H5 chat action + browser clipboard adapter | RN copy action/icon、message projection text and success-only feedback | H5 27/99 + SDK 44/140 + full verify/build + authenticated 458x786 right-click/no-overflow/zero-console proof | `implemented-local/acceptance-gated` | closed 2026-08-11；Safari/Firefox clipboard permission and touch long-press remain acceptance gates；no rich clipboard or mutation |
| `W6.a6.14-chat-forward-contract-freeze` | contract/design | RN forward actions + shared SDK send/cache + H5 router/modal | freeze single/multi forward eligibility、target selection、payload identity、preview editing and failure convergence | RN caller/payload/API/SQLite/UI owner trace + anti-fake review | `done` | closed 2026-08-11；Gateway batch exists but shared mapper/schema drop `forward_origin`；normal and hidden-sender paths remain distinct |
| `W6.a6.14.1-shared-forward-core` | code/verification | shared SDK message sync + Gateway transport + SQLite | core forward-origin model/schema/repository、source reread、normal batch + registered hidden-sender send、stable IDs and per-row final state | SDK 49/150 + Web 46/145、real sql.js mapper/repository、partial/top-level/hidden guards、all-runtime typecheck/package、build:web + H5 verify | `done-local/acceptance-gated` | closed 2026-08-11；no RN runtime wiring or real Gateway mutation；server-backed sources only |
| `W6.a6.14.2-h5-forward-target-preview` | code/verification | H5 chat + React Router + existing contact/group/conversation facades | RN action/multi-select、three target sources、target-chat pending preview、exclude/change-target/comment and shared submit caller | H5 29/103 + SDK Web 46/147 + typecheck/build + 466 assets + authenticated read-only 390x844/458x786 light/dark proof + zero page transport/cache logic | `implemented-local/acceptance-gated` | closed 2026-08-11；invalid zero-item pending state fixed；real mutation and desktop visual proof remain `.14.3` gates |
| `W6.a6.14.3-forward-acceptance` | authorized verification | deployment + H5 + SDK | one disposable normal/partial-result/list-back proof and explicitly approved hidden-sender proof | 14:59 normal origin + 15:01 hidden no-origin + conversation cache/list-back + zero sending/failed + H5 30/104 | `partially-accepted/blocked-external` | normal/hidden closed 2026-08-11；controllable real partial-result and desktop viewport remain unavailable |
| `W6.a6.15.1-shared-message-delete-core` | contract/code/verification | shared SDK message sync + Gateway transport + SQLite | current-account source reread、single update/batch-delete/local-only self、partial-result and transactional local convergence | SDK Web 47/152 + all-runtime typecheck + build:web generated-package sync | `done-local/acceptance-gated` | closed 2026-08-11；RN service/runtime import graph unchanged |
| `W6.a6.15.2-h5-message-delete-ui` | code/verification | H5 chat action + multi-select + shared SDK facade | RN single/multi confirmation、self/all scope、group permission presentation and visible partial feedback | H5 31/107 + typecheck/build + 466 assets + authenticated read-only 458x786/390x844 no-overflow/zero-console proof | `done-local/acceptance-gated` | closed 2026-08-11；no delete option was confirmed |
| `W6.a6.15.3-message-delete-acceptance` | destructive authorized verification | deployment + H5 + SDK | disposable `self/all/partial` Gateway、SQLite、realtime/list-back proof | Network/result + exact affected rows + conversation reread | `blocked-destructive-authorization` | explicit disposable messages and action-time authorization required；never delete production history by inference |
| `W6.a6.16-chat-message-edit-contract-freeze` | contract/design | RN edit flow + shared SDK + H5 composer | freeze eligibility、Gateway update、same-row/entity/editedAt/failure/realtime ownership | RN caller/body/cache/UI trace + anti-fake/owner review | `done` | closed 2026-08-11；revoke and non-text/forwarded edit excluded |
| `W6.a6.16.1-shared-message-edit-core` | code/verification | shared SDK message sync + Gateway transport + SQLite | current-account source reread、RN parity guard、success-only same-row text/entity replacement | SDK Web 48/155 + all-runtime typecheck + boundary gate + build:web generated-package sync | `done-local/acceptance-gated` | closed 2026-08-11；RN service/runtime import graph unchanged |
| `W6.a6.16.2-h5-message-edit-ui` | code/verification | H5 chat action + composer/list projection | RN edit action/preview、original document refill、cancel/submit、edited timestamp | H5 32/109 + typecheck/build + 466 assets + authenticated read-only 458x786 no-overflow proof | `done-local/acceptance-gated` | closed 2026-08-11；no edit was submitted |
| `W6.a6.16.3-message-edit-acceptance` | authorized verification | deployment + H5 + SDK | one disposable text edit -> Gateway -> same SQLite row/list-back -> second-client realtime | Network/result + stable IDs/order/status + editedAt/entities + realtime proof | `blocked-mutation-authorization` | explicit disposable message and action-time authorization required |
| `W6.a6.17.1-shared-group-mention-core` | contract/code/verification | shared SDK group/message/repository + Web composition | cache-first full group-member sync、schema v10 mention identity、type106 optimistic send and mapper/realtime persistence | SDK Web 50/159 + all-runtime typecheck + boundary gate + build:web generated-package sync | `done-local/acceptance-gated` | closed 2026-08-11；RN service/runtime import graph unchanged；no real send |
| `W6.a6.17.2-h5-group-mention-ui` | code/verification | H5 group chat composer/message/conversation | RN `@成员/@所有人` query/picker/selection/cursor、shared send caller、type106 read and latest `[有人@我]/[所有人]` preview | H5 33/114 + typecheck + 466 assets + production build | `done-local/acceptance-gated` | closed 2026-08-11；no message transmitted；then-open unread projection residual closed by `.17.2.1` |
| `W6.a6.17.2.1-unread-mention-conversation-projection` | code/verification | shared SDK message/group repository + conversation facade + H5 preview | seq-bounded latest unread mention、cached group sender name、draft/mention/latest priority | SDK 50/160 + H5 33/116 + all-runtime typecheck + verify + 458x786 real-list no-overflow proof | `done-local/acceptance-gated` | closed 2026-08-11；no network/mutation；sender-name residual closed by `.17.2.2` |
| `W6.a6.17.2.2-sender-display-name-cache-parity` | code/verification | shared SDK contact cache + sender resolver + conversation facade | success-only `friendships/users` snapshot、shared queue、RN remark/group/user priority、no ID guessing | SDK 52/163 + all-runtime typecheck + build:web/H5 verify + authenticated 7-contact/19-conversation zero-console proof | `done-local/acceptance-gated` | closed 2026-08-11；no message mutation；real unread mention sample remains `.17.3` gate |
| `W6.a6.17.3-group-mention-acceptance` | authorized verification | deployment + H5 + SDK | one disposable member mention and one permission-valid all mention -> Gateway -> SQLite/realtime/list-back | Network/result + top-level mentions/body targets + stable IDs/status/cache proof | `blocked-mutation-authorization` | explicit disposable group and action-time send authorization required |
| `W6.a6.18.1-chat-text-search` | code/verification | shared SDK message repository/sync + H5 chat/router | current-account visible-text search、RN result list、stable client-ID cached-window focus | SDK Web 52/164 + all-runtime typecheck/boundary/build:web + H5 38/126/verify + authenticated 458px real-cache deep-link/reload proof | `done-local/acceptance-gated` | closed 2026-08-11；no Gateway/mutation/send；history/theme/desktop matrix remains gated |
| `W6.a6.18.2.1-shared-indexed-search-range` | contract/code/verification | shared SDK message repository/sync | current-account inclusive-lower/exclusive-upper send-time query plus existing content-type query, without Gateway I/O | real sql.js boundary test + SDK Web 52/165 + all-runtime typecheck/boundary/build:web | `done-local/acceptance-gated` | closed 2026-08-11；no RN service/runtime or desktop build-script change |
| `W6.a6.18.2.2-h5-date-media-file-index` | code/verification | H5 chat/router + existing media preview owner | RN date calendar、media filters/month groups、file groups and stable-ID return without page history scans | H5 39/129 + 466 assets + build/verify + authenticated 458px real-cache browser proof | `done-local/acceptance-gated` | closed 2026-08-11；no Gateway/download/mutation/send；history/theme/desktop matrix remains gated |
| `W6.a6.18.2.3-chat-settings-entry` | contract/code/verification | RN single/group chat settings + H5 router | settings-owned “查看聊天记录/查找聊天内容” entry routes into the same search owner | RN source mapping + H5 40/132 + full verify + authenticated single/group deep-link browser proof | `done-local/acceptance-gated` | closed 2026-08-11；only existing cache/profile/search facades render，unsupported mutation rows remain omitted |
| `W6.a6.18.3-chat-settings-capability-contract-freeze` | contract/design | RN single/group settings + shared SDK/runtime | freeze mute、pin、auto-delete、clear-history and group-management ownership/failure/authorization boundaries | RN service/Gateway/cache/realtime trace + owner and destructive-action review | `done` | closed 2026-08-11；three-operation `.18.3.1` split from lifecycle/destructive/group domains |
| `W6.a6.18.3.1-shared-conversation-setting-core` | code/verification | shared conversation sync + RN/H5 composition | neutral setting detail、mute、pin facade with RN/Web actual callers and success-only SQLite convergence | SDK focused 13 + all-runtime typecheck/build:rn/build:web + RN tsc/4 caller tests + H5 full verify | `converged/mutation-acceptance-gated` | RN legacy Gateway/local/fallback paths deleted；real toggle remains gated |
| `W6.a6.18.3.2-auto-delete-contract` | contract/design | shared message/conversation sync + realtime | freeze authoritative read、enum update、type1701、permission、setting/cache and new-message lifecycle semantics | RN/Gateway/realtime/schema trace + anti-fake review | `done` | closed 2026-08-11；server owns expiry/deletion，client never retroactively purges history |
| `W6.a6.18.3.2.1-shared-auto-delete-core` | code/verification | shared conversation/message sync + RN/H5 composition | Conversation metadata、schema v11、strict detail/update、type1701 convergence and RN/Web actual callers | SDK focused 13 + all-runtime typecheck/build:rn/build:web + RN tsc/auto-delete caller test + H5 full verify | `converged/mutation-acceptance-gated` | RN legacy detail/update/cache path deleted；real update and second-account realtime remain gated |
| `W6.a6.18.3.2.2-h5-auto-delete-route` | code/verification | H5 chat settings/router/message projection | RN options route、single/group role gate、explicit confirm and operator-aware type1701 wording | H5 focused 4/16 + typecheck/build + authenticated 458px read-only browser proof | `done-local/mutation-acceptance-gated` | closed 2026-08-11；no real confirm；hidden protocol values fail closed |
| `W6.a6.12.1.2-message-edit-delete-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | neutral message-mutation composition、RN delete/edit actual-call adoption、legacy RN payload compatibility and obsolete path deletion | SDK 58/179 + all-runtime typecheck + build:rn/build:web + RN tsc/9 focused tests + H5 55/174 verify | `converged/mutation-acceptance-gated` | closed 2026-08-11；real mutations retain explicit authorization gates |
| `W6.a6.12.1.3-message-forward-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | RN forward callers consume one shared business owner while preserving platform-provided optimistic IDs and RN presentation/events | SDK 58/181 + forward guard/sql.js + all-runtime boundary/build:rn/build:web + RN tsc/10 focused + H5 55/176 verify | `converged/mutation-acceptance-gated` | closed 2026-08-11；real partial-result remains external gate；`build:package:desktop:web` unchanged |
| `W6.a6.12.1.4-group-mention-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | RN group-member/mention production callers consume shared identity、permission、Gateway body and cache owners | SDK 58/184 + all-runtime boundary/build + RN tsc/13 group-detail + 3 mention tests + H5 55/179 verify | `converged/mutation-acceptance-gated` | closed 2026-08-11；real type106 send、second-account realtime/list-back remain gated；no production fallback |
| `W6.a6.12.1.5-message-search-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | RN chat-message search production callers consume shared query validation、SQLite filtering and pagination owner | SDK 58/184 + all-runtime boundary/build:rn/build:web + RN tsc/8 search-service + 28 search-page tests + H5 55/179 verify | `converged/acceptance-gated` | closed 2026-08-11；old RN Repository/filter path deleted；cache-only read；`build:package:desktop:web` unchanged |
| `W6.a6.12.1.6-realtime-message-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web realtime consumers | RN realtime production caller consumes shared event normalization and cache convergence while retaining native/AppState/event projection | shared realtime tests + runtime boundary + RN caller tests + H5 verify | `active` | message search convergence passed；do not change `build:package:desktop:web` |
| `W6.a6.18.3.3-clear-history-contract-trace` | contract/design | RN clear-history + shared SDK/Gateway/cache/realtime | freeze destructive target、scope、response、cache and realtime/list-back semantics before any UI/mutation | RN/Gateway/schema/realtime backward trace + destructive-action review | `done-read-only` | closed 2026-08-11；no clear action；old OpenIM/friend-delete/group-leave paths excluded |
| `W6.a6.18.3.3.1-shared-clear-history-core` | code/verification | shared conversation/message sync + schema/repository/realtime | schema v12 cursor/list-hidden、stable operation ID、boundary-safe success-only clear and type2102 control convergence | real sql.js boundary/concurrency/failure tests + realtime tests + all-runtime typecheck/boundary/build:web | `blocked-by-convergence-gate` | resume only after related RN/Web setting/sync consumers converge；no real clear |
| `W6.closeout` | verification/docs | web app + sdk + docs | migrated route parity evidence and residual ledger | `npm run verify` + browser matrix + real Gateway flow | `planned` | W6.a2-a5 accepted |

## Latest Closed H5 Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.3-custom-emoji-add-reorder` |
| production_flow | type115 stable ID -> long-press/right-click action -> shared `customEmojis.add`；manager selected group -> Pointer drag -> browser stable-ID order |
| canonical_owner | SDK owns add/member/cache；H5 owns explicit action UI and `im28.chat.customEmoji.order` presentation preference only |
| expected_deliverable | type115-only collection action、success/error feedback、touch/mouse selected-stack reorder、ordered panel/manager projection |
| verification_shape | H5 24/85 + SDK 40/126 regression basis + typecheck/build/assets + authenticated 458x786 select/move-tray/cancel proof |
| stop_condition | no injected type115 data、real add、order drop/commit、upload/delete/send |
| closeout | manager selected one real cached item and opened the RN-style move tray before cancel；current conversation has no type115 message，so collection-menu visual remains acceptance-gated |

## Previous Closed H5 Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.2-h5-custom-emoji-manager` |
| production_flow | chat add tile -> conversation-scoped manager route -> cache-first list -> explicit file/create or select/confirm/delete -> shared SDK mutation facade |
| canonical_owner | SDK owns validation/upload/Gateway/cache membership；H5 owns route/file input/preview/selection/five-column UI |
| expected_deliverable | add tile、React Router manager、image picker、preview、organize selection and confirm-delete |
| verification_shape | H5 23/80 + SDK 40/126 + typecheck/build:all/package sync + build/assets + authenticated 458x786 read-only proof |
| stop_condition | no real file selection/mutation/send；no message collection or local reorder |
| closeout | one real cached item and add tile rendered as equal five-column cells with no horizontal overflow；desktop/light and real mutation remain gated |

## Latest Closed Shared Mutation Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.1-shared-custom-emoji-mutations` |
| primary_path | `WebIMSync.customEmojis.create/add/delete -> GatewayHTTPClient -> CustomEmojiRepository` through shared upload port |
| convergence | create/add refresh and atomically replace full membership only after Gateway success；delete removes local rows only after Gateway success；failure preserves membership |
| closeout | SDK Web 40/126、core Gateway contracts、all-runtime typecheck/build:all and generated-package sync passed |
| residual_gate | `.3.3` implemented-local/acceptance-gated；real mutations remain authorization-gated |

## Earlier Closed H5 Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.2-h5-custom-emoji-panel` |
| production_flow | shared account cache/sync -> third heart tab -> recent/all grid -> shared type115 send caller/read projection |
| canonical_owner | SDK owns membership/cache/body/state；H5 owns RN UI、safe image and recent-ID preference only |
| expected_deliverable | third tab、cache-first refresh、five-column recent/all、safe direct-send caller |
| verification_shape | H5 22/77 + SDK 40/121 + typecheck/build/assets + real-list mobile/desktop dark proof |
| stop_condition | no add tile/manager/upload/add/delete/reorder/message-action save or real send |
| closeout | one real list item rendered in strict five-column responsive grid；no click/transmission；light proof remains acceptance-gated |

## Latest Closed Shared Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.1-shared-custom-emoji-core` |
| primary_path | Gateway list -> strict mapper -> schema v8 `custom_emojis` -> `customEmojis.listCached/sync`；`messages.sendCustomEmoji` -> shared optimistic state |
| convergence | SDK is the only DTO/cache/send owner；H5 generated package contains dist only；RN manager metadata remains registered compatibility work |
| closeout | SDK 5 focused + Web 40/121、core Gateway contracts、all-runtime typecheck、build:web package sync and H5 consumer gates passed |
| residual_gate | manager mutations `.3` active；authorized Network/SQLite/realtime/list-back send proof `.4` blocked-external |

## Latest Closed Contract Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.6-chat-illustrated-emoji-contract-freeze` |
| evidence | RN production source、Gateway generated/hand types、SDK mapper/sync/repository and H5 asset/UI gap traced backward；135 unique IDs、133 fallback values、135 mirrored PNGs verified |
| verdict | contract `done`；Gateway schema `runtime-chain-partial`；SDK/H5 implementation `🟡`；real send `🟡 acceptance-gated` |
| anti_shortcut | omitted H5 tab is honest missing capability；no mock entity、fake success、Unicode identity inference or second page transport exists |

## Previous Closed Local Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.5-chat-system-emoji-core` |
| production_flow | RN composer emoji toggle -> system panel -> insert/replace/delete draft -> existing text submit |
| primary_path | `ChatComposer` panel owner -> pure draft editing helper -> current text draft -> existing `sendText`; browser preference adapter owns recent MRU only |
| closeout | exact 52-entry list、7-column panel、selection replacement、full grapheme delete and 21-item MRU passed H5 17/65、SDK 36/111、466 assets、full verify/build and authenticated dual-viewport browser proof；no transmission occurred |
| residual_gate | real text send remains authorization-gated；illustrated/custom entity transport is not part of this slice |

## Previous Closed Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.4-chat-voice-send-core` |
| production_flow | RN voice mode -> hold recorder -> short/cancel/send decision -> upload credential -> OSS multipart -> Gateway audio message -> local repositories |
| public_caller | H5 only calls `WebIMSync.messages.sendAudio`; no page transport、repository、OSS body or recorder format mapping |
| recorder_contract | browser adapter chooses a supported audio MIME、owns stream/track/recorder cleanup and returns one `File`；permission/unsupported/error paths reject visibly |
| interaction_contract | pointer hold starts；upward delta `>=56px` cancels；release below `2s` rejects；`60s` auto-stops and sends；route exit cancels |
| state_contract | reuse shared `sending -> sent/failed` state machine and stable client ID across upload/Gateway stages |
| body_contract | `audio.media_id/url/duration_seconds/size_bytes`；content type `103`；duration is integer `1..60` |
| stop_condition | no real permission prompt/recording/upload/send、audio picker、persistent waveform、played/read/auto-next、upload progress/cancel、retry、download or RTC |
| closeout | one browser recorder owner and one shared audio send/state owner are live；H5 15/56、SDK 36/111 and local gates passed；voice mode was layout-tested without requesting microphone access or transmitting media |

## Earlier Closed Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.3-chat-album-video-send-core` |
| production_flow | RN mixed album -> media validation -> video send -> upload credential -> OSS multipart -> Gateway video message -> local repositories |
| public_caller | H5 only calls `WebIMSync.messages.sendVideo`; no page transport、repository or OSS body construction |
| metadata_contract | browser reads duration/videoWidth/videoHeight before send；metadata failure is visible and prevents upload |
| state_contract | reuse existing shared `sending -> sent/failed` state machine and stable client ID across upload/Gateway stages |
| body_contract | `media_id/url/thumbnail_url/duration_seconds/width/height/size_bytes`；snapshot query matches RN `t_7000,f_jpg,...,m_fast,ar_auto` |
| selection_contract | image/video total max 12；image 10 MB；video 500 MB；sequential order；unsupported MIME rejects the full selection before I/O |
| stop_condition | no draft caption/pending attachment、camera、audio/voice、progress/cancel、retry、local snapshot generation、real unauthorized send or RTC |
| closeout | shared video limit/body/snapshot/state owner and default H5 mixed-album caller are live；H5 13/50、SDK 35/109 and full local gates passed；no real upload/send was executed without authorization |

## Earlier Closed Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.2-chat-image-file-send-core` |
| production_flow | RN attachment action -> platform picker -> upload credential -> OSS multipart upload -> Gateway message -> local message/conversation repositories |
| public_caller | H5 only calls `WebIMSync.messages.sendImage/sendFile`; no page transport or repository import |
| platform_port | opaque upload source + metadata enters shared sync；Web adapter alone validates `Blob/File` and constructs `FormData` |
| state_contract | persist local `sending` before upload；map matching client ID to `sent`；credential/upload/send failure updates the same row to `failed` and rethrows |
| selection_contract | image input accepts browser-decodable image kinds、max 12、10 MB each；file input sends one ordinary file、100 MB max；sequential ordering |
| stop_condition | no draft caption/pending attachment、camera、video/audio/voice、progress/cancel、retry、download/preview expansion or RTC |
| acceptance_gate | approved authenticated account must prove credential、OSS 200、Gateway send、SQLite/cache projection and responsive light/dark behavior |

| closeout | shared state/upload owners and default H5 callers are live；no real message was transmitted during proof without explicit authorization |

## Closed Slice W6.a6.1

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.1-chat-media-read-core` |
| goal | 将 cache 中真实图片、语音、视频消息接入 RN 对应的浏览器只读媒体交互 |
| source_anchor | RN media branches/previews/sound hook；Gateway generated media schemas |
| target_owner | H5 chat message projection + one feature-local media controller + image/video overlays |
| expected_deliverable | safe real URL actions、one-active-audio lifecycle、full-screen image/video surfaces、keyboard/route cleanup |
| verification_shape | message/media contract tests + full H5 app tests + SDK regression + typecheck/build/verify + guest guard |
| stop_condition | no direct API/cache/mock URL、download/save/upload/send/record/read-sync/auto-next/retry/RTC |
| residual_seed | approved account must prove real image/audio/video playback and responsive theme behavior；all deferred operations require separate contracts |

## Closed Slice W6.a5.2.14

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.14-contact-user-search-core` |
| goal | 建立 `/contacts` 搜索入口 -> `/contacts/search` -> 本地好友匹配/真实 Gateway 用户搜索 -> 既有联系人资料页的唯一主链 |
| source_anchor | RN `ContactListScreen -> ContactSearchScreen`；48px search header、local hint、server-search row、72px result row and highlighted fields |
| target_owner | existing Web `contacts` sync facade + contact search page/App route；`peerProfile` remains the sole profile/action owner |
| expected_deliverable | authenticated `searchUsers` normalization/self-filter/dedupe、local friend projection、RN core presentation、stable SPA navigation |
| verification_shape | facade auth/normalization/dedupe/failure tests + pure view tests + typecheck/build/verify + mobile/desktop light/dark/history/guest smoke |
| stop_condition | no group search/join、search-page friend mutation、page transport、mock result、fake success、duplicate peer profile or new search cache |
| residual_seed | approved account must prove local/remote result and profile navigation；group search/join remains separately bounded |

## Closed Slice W6.a5.2.13

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.13-contact-profile-core` |
| goal | 建立 contact row -> `/contacts/users/:userID` -> profile read -> real direct conversation/add-friend action 的唯一主链 |
| source_anchor | RN 120px avatar、centered profile header、ID pill、bio/action card and primary CTA；shared user/friend/conversation operations |
| target_owner | Web sync peer-profile facade + contact profile page + ContactRow/App route；shared clients/repositories remain endpoint/cache owners |
| expected_deliverable | friend/stranger/self normalization、RN core presentation、authenticated route、real conversation persistence/navigation and success-only friend application |
| verification_shape | auth/normalization/open-persist/apply/failure unit tests + view tests + typecheck/build/verify + mobile/desktop light/dark/history/guest smoke |
| stop_condition | no RTC/presence/remark/star/delete/blacklist/common groups/share/group-member context、page transport、mock data、fake success or duplicate persistence |
| residual_seed | authenticated friend/stranger/self profile、conversation/apply Network result and exact visual/history proof require an approved account；browser automation is blocked by local-URL policy；deferred actions remain separately bounded |

### Completed W6.a5.2.3 Migration Card

| field | frozen value |
| :--- | :--- |
| feature_slice | `/calls` 通话记录主列表，不含 RTC 通话建立与详情页 |
| phase | `W6.a5.2.3` |
| production_flow | RN `CallListScreen` -> `useOpenIM` -> `openIMService` -> Gateway v2 call list/delete -> app-owned `call_records` SQLite cache |
| operations | `listCachedCalls`; `syncCalls`; `deleteCalls` |
| current_status | `done-local/acceptance-gated`；shared Gateway client + H5 call cache/sync/delete facade runtime chain ready |
| must_have_fields | `call_id`; `conversation_id`; `direction`; `user_id`; `nickname`; `avatar_url`; `call_type`; `status`; `answer_status`; `started_at`; `answered_at`; `ended_at` |
| adapters | existing authenticated `GatewayHTTPClient`; account-scoped `DatabaseAdapter`; shared sync mutation queue |
| open_gaps | Web RTC、通话详情、实时 call-history event、头像资料二次补全均延期，不得以占位操作替代 |

本切片以 RN app-owned `call_records` schema 为 Web cache 对照，不修改共享 SDK 主 schema；H5 页面只能通过 `WebIMSync.calls` 访问该能力。

## Deferred Residuals

| item | reason_not_active | likely_owner | candidate_verification |
| :--- | :--- | :--- | :--- |
| Real Gateway smoke | 缺部署 URL 与测试账号环境变量 | deployment owner | `npm run smoke:gateway` |
| authenticated conversation UI smoke | RN core 与 route 已本地实现，缺真实 Gateway 账号 | `apps/web/src/pages/conversations` | cache-first/sync/chat-back real browser flow smoke |
| authenticated chat UI smoke | RN core 与 route 已本地实现，缺真实 Gateway 账号 | `apps/web/src/pages/chat` | history/send/realtime/list-back real browser flow smoke |
| Worker SQL runtime | `done-local`: production App Worker、RPC/fatal parity 与 Vite build passed | storage worker | real-browser DB open evidence joins W5.a3 |
| multi-tab writer | `done-local/gated-browser`: lifecycle owner 已接入，缺真实浏览器矩阵 | storage runtime | three-browser two-tab concurrency test |
| Remaining RN route surfaces | prior cores/settings/onboarding core 已移除 generic 视觉；valid onboarding context、network/cache remain gated | `apps/web/src/app` + feature owners | approved onboarding real flow；then continue explicit blocked/acceptance ledger |
| Onboarding valid context | current authenticated session has no matching onboarding marker；不得伪造 marker 或创建/修改账号数据 | `apps/web/src/pages/login` + deployment owner | approved new account validates register/invite/profile Network/result and responsive light/dark/history |
| Settings final acceptance | display/notification/terms local chain passed；notification real write and cross-browser evidence absent | `apps/web/src/pages/me/settings` + Web runtime | approved update Network/result + Safari/Firefox route/theme matrix |
| Settings permission/network/cache/version | permission/version local chains passed；network browser-blocked；cache storage-blocked | settings/runtime/storage/deployment owners | real update response/write/cross-browser acceptance；cache awaits disposable-data separation |
| Joined groups final acceptance | local cache/sync/route 已完成，当前会话无真实账号群数据 | `apps/web/src/pages/contacts` + Web SDK groups facade | approved account proves cache-first list/full sync/search/status/role、conversation open and mobile/desktop light/dark/history；no injected session/data |
| Contact profile final acceptance | shared facade/routes/styles are local complete；no approved authenticated peer data or local-browser visual automation | `apps/web/src/pages/contacts` + Web SDK `peerProfile` facade | approved account proves friend/stranger/self read、conversation open/persistence、authorized friend apply and 390x844/760x900 light/dark/history；no injected session/data |
| Contact search final acceptance | shared facade/route/styles are local complete；no approved authenticated friend/search data or local-browser visual automation | `apps/web/src/pages/contacts` + Web SDK `contacts` facade | approved account proves local/remote results、search Network/result、profile navigation and 390x844/760x900 light/dark/history；no injected session/data |
| Me final acceptance | `/me` 已启用真实 route/capability；dark 与 real logout 证据尚缺 | `apps/web/src/pages/me` + Web sync/runtime | authenticated dark screenshot + real logout Network/session/DB cleanup proof |
| Calls real-account proof | local session expired during closeout；不得以 fake session/mock list 替代 | `apps/web/src/pages/calls` + Web SDK calls facade | approved account validates Network/cache/filter/page/delete and 390x844/760x900 light/dark/history |
| Blacklist real-account proof | local session is anonymous；不得以 mock list、injected session or unapproved destructive mutation替代 | `apps/web/src/pages/me` + Web SDK blacklist facade | approved account validates list/enrichment/search/theme/history and explicitly approved remove Network/result |
| Verification-code send | shared Gateway OpenAPI 无 operation；不得用 countdown/fake success 替代 | shared SDK/Gateway contract owner | backend contract available or product explicitly accepts fixed-code environment |
| Account-security final acceptance | account set/reset 本地链路已闭合，但真实 mutation 与 dark 证据未执行；contact mutation 缺 send-code contract | `apps/web/src/pages/me/security` + Web runtime | approved real set/reset Network/result/session cleanup + dark matrix；contact waits for real code-send contract |
| upstream raw WS log | `resolved 2026-08-09`: canonical owner 已清除原始 payload 日志 | `im28-sdk` | shared SDK test + H5 `npm run verify` passed |
