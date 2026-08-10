# IM28 H5 Foundation Workset

| field | value |
| :--- | :--- |
| status | `active` |
| active_slice | `W6.a5.2.12-joined-groups-core` |
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
| `W6.a5.2.1-contacts-core` | code/verification | web contacts + sdk facade | RN contact list, real paged friend operation, local search/group/index and `/contacts` guard | 22/60 verify + 390x844/760x900 light/dark + route history + no-fake/owner audit | `done-local/acceptance-gated` | real account data proof + cache-first Web Repository export + Pinyin index parity |
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
| `W6.closeout` | verification/docs | web app + sdk + docs | migrated route parity evidence and residual ledger | `npm run verify` + browser matrix + real Gateway flow | `planned` | W6.a2-a5 accepted |

## Active Slice Card

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.12-joined-groups-core` |
| goal | 建立 contacts shortcut -> `/contacts/groups` -> cache-first list/remote sync -> conversation route 的唯一主链 |
| source_anchor | RN 72px group row/search/status/role badges；shared Gateway `myGroupList`、`GroupRepository` and conversation facade |
| target_owner | Web sync joined-group facade + contacts groups page + App route；shared client remains endpoint/envelope owner |
| expected_deliverable | authenticated cached list、token pagination、dedupe/normalization/server order、remote-success replace、search/status/role/empty/error/loading states and contacts entry |
| verification_shape | cache/auth/pagination/dedupe/mapping/failure unit tests + view tests + typecheck/build/verify + mobile/desktop light/dark/history/guest smoke |
| stop_condition | no create-group、long-press actions、group profile/manage/member mutation、page fetch、mock list、failure-as-success or second storage owner |
| residual_seed | authenticated data/open-conversation and exact visual proof require an approved account；create/manage/member capabilities remain later slices |

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
| Contact cache/Pinyin parity | shared Web entry 未导出 `FriendshipRepository`；当前中文索引回退 `#` | `../im28-sdk/src/sync/contact-sync.ts` + shared SDK contract owner | real account remote proof, then cache-first export/regression and Pinyin-equivalent grouping |
| Joined groups final acceptance | local cache/sync/route 已完成，当前会话无真实账号群数据 | `apps/web/src/pages/contacts` + Web SDK groups facade | approved account proves cache-first list/full sync/search/status/role、conversation open and mobile/desktop light/dark/history；no injected session/data |
| Me final acceptance | `/me` 已启用真实 route/capability；dark 与 real logout 证据尚缺 | `apps/web/src/pages/me` + Web sync/runtime | authenticated dark screenshot + real logout Network/session/DB cleanup proof |
| Calls real-account proof | local session expired during closeout；不得以 fake session/mock list 替代 | `apps/web/src/pages/calls` + Web SDK calls facade | approved account validates Network/cache/filter/page/delete and 390x844/760x900 light/dark/history |
| Blacklist real-account proof | local session is anonymous；不得以 mock list、injected session or unapproved destructive mutation替代 | `apps/web/src/pages/me` + Web SDK blacklist facade | approved account validates list/enrichment/search/theme/history and explicitly approved remove Network/result |
| Verification-code send | shared Gateway OpenAPI 无 operation；不得用 countdown/fake success 替代 | shared SDK/Gateway contract owner | backend contract available or product explicitly accepts fixed-code environment |
| Account-security final acceptance | account set/reset 本地链路已闭合，但真实 mutation 与 dark 证据未执行；contact mutation 缺 send-code contract | `apps/web/src/pages/me/security` + Web runtime | approved real set/reset Network/result/session cleanup + dark matrix；contact waits for real code-send contract |
| upstream raw WS log | `resolved 2026-08-09`: canonical owner 已清除原始 payload 日志 | `im28-sdk` | shared SDK test + H5 `npm run verify` passed |
