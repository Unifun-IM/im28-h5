# Cleanup Report - 2026-08-10

## Baseline

- TypeScript: `npm run typecheck` passed for `@im28/im-sdk-web` and `@im28/h5-web`.
- Tests: 25 Vitest files / 70 tests passed, including account credential auth/request/session cleanup、profile current-detail/update validation/auth、call cache filter/order、server-first delete/failure preservation、contact paging/auth/normalization、runtime/storage/conversation/message/realtime and ordering regressions.
- Build: SDK declaration/ESM build and Vite production build passed；Vite 保留现有 `>500 kB` main chunk size warning，未阻塞本切片。
- Browser: W6.a5.2.6.1 security root/account/password passes authenticated 390x844 + 760x900 light geometry, real read-only phone/email state, route correction、reload/back/forward and guest guards with a clean console. No credential mutation was submitted；dark proof and approved real set/reset remain gated.
- RN parity foundation: 466 source/target asset files and the generated manifest passed SHA-256 verification; W6.a2/W6.a3/W6.a4 real-account acceptance gates remain open.
- Automated convergence script: unavailable; `/scripts/check-convergence.sh` does not exist in this workspace.

## P0/P1 Findings

- Resolved P1: duplicated auth/account DB checks in conversation/message services moved to `sync-context.ts` canonical owner.
- H5 scope: no remaining P0/P1 finding after sync context convergence and obsolete `BootPage` removal.
- no React Native import, fake-success path, wildcard export, debug console, broken import or source file over 300 lines remains in H5 scope.
- upstream privacy gate closed: the canonical shared `@im28/im-sdk` client no longer logs complete Gateway WebSocket `event.data`; shared SDK and H5 regression gates passed.
- Realtime owner is split into bounded orchestration/parser/recovery/update modules; oversized convergence, unsafe numeric seq comparison, stale cursorless edit and enqueue-time cross-account binding risks were removed during closeout.
- Full sync、history、send 与 realtime 统一由 `sync-mutation-queue.ts` 串行业务 operation；前序失败继续消费，未新增 nested enqueue。
- W5.a2 Worker owner is split into protocol/client/runtime/entry/factory modules; production files are at most 286 lines and no P0/P1 cleanup finding remains.
- W5.a3 Web Lock semantics have one canonical owner under `storage/lock`; account lifecycle consumes a lease port and the App only injects native `navigator.locks`.
- W6.a0/a1 adds no second visual or asset owner: RN remains canonical, the H5 mirror is generated/verified, and current generic page visuals are explicitly non-accepted debt rather than a competing design system.
- W6.a2 removed the generic login/Lucide path; all visible auth assets resolve from the RN mirror and the terms page calls one generated-operation-backed Web SDK owner. No page fetch, mock or fake-success branch remains.
- W6.a3 removed the generic conversation/Lucide/global-CSS path; page-local view helpers and CSS are bounded below 300 TypeScript lines, all visible icons use RN assets, and the page consumes one SDK `listCachedItems/sync` path.
- W6.a3 temporary visual proof HTML was deleted after browser evidence; no test-only production route, orphan wrapper, compat shell or second API owner remains.
- W6.a4 removed the generic chat/Lucide/global-CSS path; header/list/bubble/composer owners consume byte-mirrored RN assets and the existing `getCachedHistory/pullHistory/sendText/dataVersion` chain only.
- Shared `RNAssetIcon` and avatar fallback adapters now own the repeated browser projection used by conversation and chat; the former page-local icon helper, duplicate avatar algorithm, unused `lucide-react` dependency and temporary chat proof harness were removed.
- W6.a4 intentionally omits controls whose production mutations are unavailable instead of leaving fake voice/attachment/retry/playback actions; no second route/API owner was introduced.
- W6.a5.1 replaces the single account-login route with one React Router auth-entry owner for phone/email/account/register; all pages consume `WebIMRuntime.login/register/getPlatformTerm`, all visible assets come from the RN mirror, and no page-level Gateway/Repository path exists.
- Verification-code send and forgot-password operations are absent from the Gateway contract. The UI exposes the gap without countdown/fake success; no placeholder API or hidden compatibility wrapper was added.
- W6.a5.2.1 adds one contact primary path: page -> runtime `contacts` facade -> shared `GatewayHTTPClient.listFriends`. No page fetch/shared-SDK import, duplicate endpoint, mock list, test-only production route or retained proof harness remains.
- Contact cache-first and Pinyin grouping are explicitly acceptance-gated rather than implemented through a hidden fallback; verification/group/profile/action UI is omitted until bounded owners exist.
- W6.a5.2.2 has one route-shell owner (`PrimaryTabsLayout`) and one presentation owner (`components/primary-tabs`); page-level tabbar implementations do not exist. Shared unread helpers remain canonical in `conversation-list-view.ts` rather than duplicating aggregation/999+ rules.
- Calls and me disabled display lifecycles are resolved: each now has a real route/capability owner, and no placeholder page was retained.
- W6.a5.2.3 activates calls through one primary path: `CallsPage -> WebIMSync.calls -> GatewayHTTPClient + account call_records SQLite`; no page fetch、duplicate endpoint、RTC placeholder、compat wrapper or page-local tabbar remains.
- W6.a5.2.4 activates me through one profile path: `MePage -> WebIMSync.profile -> GatewayHTTPClient.getCurrentUserDetail`; logout stays in the existing runtime owner. The overlimit runtime extension was removed before closeout; production files remain within 300 lines and no direct Gateway、fake menu destination、compat wrapper or page-local tabbar exists.
- W6.a5.2.5 extends that canonical owner through `MeProfileEditorPage -> WebIMSync.profile.update -> GatewayHTTPClient.updateUserProfile`; nickname/gender/bio validation lives in the facade, all routes are full-screen React Router owners, and no direct Gateway、mock、compat wrapper、orphan route or placeholder avatar/QR action remains.
- W6.a5.2.6.1 has one credential mutation path: `MeSecurityCredentialPage -> WebIMRuntime -> GatewayHTTPClient.setAccountPassword/resetPassword`. Reset success reuses the runtime session invalidation owner to stop realtime、clear auth、publish signed-out state and close the account DB；no page fetch、duplicate endpoint、fake success、compat wrapper or orphan security route remains.
- Phone/email security rows are deliberately read-only because the Gateway contract has no send-code operation；the missing mutation is registered as blocked capability rather than hidden behind a local-only form.
- Call production TypeScript files are at most 256 lines；the 3 tests are contract/behavior evidence, not migration placeholders. Authenticated visual/data proof remains an explicit acceptance gate after the local browser session expired.
- Production TypeScript remains at or below 300 lines; contact production files are at most 155 lines and the touched sync facade is 151 lines.

## Canonical Homes

| semantic | canonical owner | adapter/consumer |
| :--- | :--- | :--- |
| platform-neutral IM DTO, Repository and Gateway clients | `im28-phone/packages/im-sdk` via `@im28/im-sdk/web` | `packages/im-sdk-web` named facade |
| browser SQLite/IndexedDB persistence | `packages/im-sdk-web/src/storage` | account lifecycle and future Repository sync owner |
| account database open/migrate/switch/close | `packages/im-sdk-web/src/storage/account-database-lifecycle.ts` | auth runtime and future Repository sync owner |
| browser page routing | `apps/web/src/app/App.tsx` with React Router | page modules under `apps/web/src/pages` |
| shared RN browser asset/avatar projection | `apps/web/src/components/RNAssetIcon.tsx`; `rn-avatar-view.ts` | conversation/chat presentation only；no business behavior |
| browser auth/realtime orchestration | `packages/im-sdk-web/src/runtime` | lazy App assembly under `apps/web/src/runtime` |
| Gateway DTO -> core entities | `im28-phone/packages/im-sdk/src/transport/gateway-http/domain-mappers.ts` | Web conversation/message sync |
| browser conversation/message orchestration | `packages/im-sdk-web/src/sync` | React Router pages through `runtime.getSync()` |
| browser conversation + latest-message cache composition | `packages/im-sdk-web/src/sync/conversation-sync.ts` | `/conversations` through `listCachedItems`; page owns presentation only |
| realtime event serialization and HTTP gap recovery | `packages/im-sdk-web/src/sync/realtime-sync.ts` | runtime data bridge and routed page cache readers |
| message edit/delete update cursor | `packages/im-sdk-web/src/sync/realtime-message-update-*.ts` | main realtime queue and shared sync_cursors schema |
| same-tab mutating operation ordering | `packages/im-sdk-web/src/sync/sync-mutation-queue.ts` | conversation/message/realtime services assembled by `web-im-sync.ts` |
| production browser SQL execution | `packages/im-sdk-web/src/storage/worker/**` | App-injected Vite module Worker; shared sql.js adapter is the Worker engine |
| cross-tab account database ownership | `packages/im-sdk-web/src/storage/lock/**` | account lifecycle acquires before Worker creation and releases after close/terminate |
| product visual/style truth | `im28-phone/src/theme/**` plus capability screen/component `StyleSheet` | `apps/web/src/styles/**` browser mappings governed by `docs/rn-h5-migration-contract.md` |
| product static assets | `im28-phone/src/assets/**` plus recorded scattered RN asset roots | `apps/web/src/assets/rn/**` byte mirror generated by `scripts/sync-rn-assets.mjs` |
| public platform terms | generated `postV1PlatformTermGet` operation through `packages/im-sdk-web/src/runtime/platform-terms-client.ts` | login terms dialog through `WebIMRuntime.getPlatformTerm` |
| browser authentication session establishment | `packages/im-sdk-web/src/runtime/web-im-authentication.ts` | `WebIMRuntime.login/register/refresh`; page routes consume only public facade |
| auth-entry presentation and routing | `apps/web/src/pages/login/**`; route truth in `apps/web/src/app/App.tsx` | `/login` redirect and `/auth/phone|email|account|register`; no retained legacy route owner |
| chat presentation | `apps/web/src/pages/chat/**` | `/conversations/:conversationID` consumes existing message sync; no transport ownership |
| browser contact paging/normalization | `packages/im-sdk-web/src/sync/contact-sync.ts` | `/contacts` consumes `runtime.getSync().contacts`; page owns only presentation/filter/index |
| contact presentation and routing | `apps/web/src/pages/contacts/**`; route truth in `apps/web/src/app/App.tsx` | `/contacts`; no retained generic/preview/compat route |
| authenticated primary-route shell | `apps/web/src/app/PrimaryTabsLayout.tsx` | `App.tsx` nested routes; pages remain feature owners |
| RN primary tab presentation | `apps/web/src/components/primary-tabs/**` | layout passes active tab/real unread; no runtime transport ownership |
| browser call cache/sync/delete | `packages/im-sdk-web/src/sync/call-sync.ts` + app-owned `call-record-store.ts` | `/calls` consumes `runtime.getSync().calls`; shared SDK remains endpoint/DTO owner |
| call presentation and routing | `apps/web/src/pages/calls/**`; route truth in `apps/web/src/app/App.tsx` | `/calls` under global primary layout; no detail/RTC transport ownership |
| current-user profile read/update | `packages/im-sdk-web/src/sync/profile-sync.ts` | `/me` and `/me/profile/**` consume `runtime.getSync().profile`; shared SDK remains endpoint/DTO owner |
| account credential lifecycle | `packages/im-sdk-web/src/runtime/web-im-runtime.ts` | `/me/security/account|password` consume public runtime facade；reset success uses canonical local-session invalidation |
| me presentation and routing | `apps/web/src/pages/me/**`; route truth in `apps/web/src/app/App.tsx` | `/me` under global primary layout；profile/security full-screen routes outside it；avatar/contact mutation/QR omitted or gated |

## Test Roles

| role | retained evidence | decision |
| :--- | :--- | :--- |
| contract/behavior | 25 Vitest files / 70 tests covering account credential auth/request/session cleanup、profile auth/current detail/update validation、call cache/sync/delete failure semantics、contact paging/auth/normalization plus auth、runtime、storage、conversation/message sync、realtime and ordering | retained; protects canonical behavior owners |
| migration proof | authenticated security 390x844/760x900 light screenshots/metrics、route correction/refresh/history/guest guard plus prior profile/me/contacts/tab proof | no temporary proof hook or production route pollution |
| placeholder/compat | none | no legacy UI path or test-only wrapper retained |

## Parity Gaps

- Conversation/Message Repository paths used by W4 are covered locally; remaining repository capabilities still need feature-scoped parity before use.
- Chromium proves real-browser sql.js open/migrate/close; reload/crash/quota recovery remains unverified.
- Real Gateway login/WebSocket behavior is covered by injected-port tests, not deployment evidence.
- Authenticated conversation/chat routes and realtime data persistence have local integration evidence but no real Gateway deployment evidence.
- Same-tab HTTP/realtime writes share one semantic queue; this does not provide cross-tab writer ownership.
- Account-login core is RN-sourced and live-term verified, but final parity still lacks the exact 390x844/desktop light/dark matrix and approved-account login success.
- Phone/email/account/register auth-entry core is RN-sourced and route-verified, but final parity still lacks approved real-auth Network/session evidence, light-mode screenshot proof and a verification-code-send backend contract.
- Conversation core is RN-sourced and locally responsive-verified, but final parity lacks approved-account cache/sync/chat-back Network evidence; global search/group actions/long-press/presence/group-avatar capabilities remain omitted until Web facades exist.
- Chat core is RN-sourced and locally responsive-verified, but final parity lacks approved-account history/pull/send/realtime/list-back Network evidence；presence、group-member enrichment、settings、voice/emoji/attachment、retry、media playback/download remain omitted until Web facades exist.
- Contacts core is RN-sourced and locally responsive-verified, but final parity lacks approved-account Network/data evidence, RN cache-first behavior and Pinyin-equivalent index grouping; verification/group/profile/action/tab-shell flows remain separate slices.
- Primary tab shell is RN-sourced and all four routes are active, but final parity lacks calls authenticated visual proof、application unread badges、real safe-area device proof and cross-browser evidence.
- Me/profile/security core is RN-sourced and authenticated light/route/cold-start-verified, but final parity lacks dark visual proof、changed-value profile update、real credential set/reset and executing real logout Network/session/DB cleanup；avatar/contact security mutation/QR remain omitted or gated.
- Calls core is RN-sourced and locally contract/route-verified, but final parity lacks approved-account cache/sync/delete Network evidence and authenticated 390x844/760x900 light/dark/history proof；call detail、profile hydration、realtime call-history and Web RTC remain omitted.

## Accepted Debt

| item | owner | next |
| :--- | :--- | :--- |
| real browser Worker/Web Lock lifecycle not exercised without a harness/account | Web SDK storage runtime | run Chromium/Firefox/Safari same-account close/crash matrix before production acceptance |
| no Safari/Firefox evidence | Web App + SDK runtime | browser matrix after real runtime exists |
| real Gateway smoke credentials absent | deployment owner | provide approved test URL/account/password variables and run `npm run smoke:gateway` |
| same-tab full-sync/delta semantic race | `resolved 2026-08-09` | shared FIFO owner and 3 interleaving/failure regressions passed |
| raw WebSocket message log in shared SDK | `resolved 2026-08-09` | removed in canonical owner; shared SDK test and H5 `npm run verify` passed |
| initial Git history | `resolved 2026-08-09` | `main/origin/main` share `07a0424`; the external commit occurred during W6.a3 execution |
| RN page-specific `StyleSheet` migration incomplete | Web App W6 | retain W6.a5.1/W6.a3/W6.a4 acceptance gates and execute bounded W6.a5.2 auth/tab route decomposition |
| verification-code-send/forgot-password operations absent | shared SDK/Gateway contract owner | add a real operation before enabling sent/countdown/reset-success behavior; fixed-code integration notice remains explicit meanwhile |
| contact cache-first unavailable | shared SDK contract owner + Web SDK sync | export/verify `FriendshipRepository` through shared Web entry, then add account-scoped cached list + refresh regression; remote-only behavior remains explicit |
| contact Chinese index falls back to `#` | Web contacts owner | introduce a reviewed Pinyin-equivalent index dependency/contract before parity acceptance |
| me final acceptance | Web App + Web sync/runtime | authenticated dark mobile/desktop proof and approved real logout Network/session/DB cleanup flow |
| profile edit final acceptance | Web App + Web profile sync | approved nickname/gender/bio changed-value Network/result proof and authenticated dark mobile/desktop matrix; do not mutate user data without explicit authorization |
| account credential final acceptance | Web App + Web runtime | approved real set/reset Network/result/session-cleanup proof and authenticated dark mobile/desktop matrix；do not mutate credentials without explicit authorization |
| contact security send-code contract absent | shared SDK/Gateway contract owner | add a real send-code operation before enabling phone/email bind or change；read-only current values remain explicit |
| calls authenticated acceptance | Web App + Web SDK calls owner | run approved-account Network/cache/filter/page/delete and mobile/desktop light/dark/history matrix; no fake session permitted |
| friend/group application tab badge absent | Web contacts + SDK contract owner | add real application-unread operation or explicitly accept no contacts badge before tab-shell parity acceptance |
| Vite main chunk `>500 kB` warning | Web App build owner | split route/SDK loading in a dedicated performance slice; current build remains valid |
