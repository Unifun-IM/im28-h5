# Cleanup Report - 2026-08-09

## Baseline

- TypeScript: `npm run typecheck` passed for `@im28/im-sdk-web` and `@im28/h5-web`.
- Tests: 20 Vitest files / 55 tests passed, including platform-term endpoint/error validation, Web Lock lifecycle, Worker RPC Repository parity, rollback/timeout/fatal persistence and sync ordering regressions.
- Build: SDK declaration/ESM build and Vite production build passed.
- Browser: prior config fail-closed and isolated WASM account DB smoke remain passed; W6.a4 guest chat deep link resolves to `/login`; deterministic 390x844 light/dark chat proof renders 6 bubbles/3 tails/draft-send state without overflow, and the 760x900 viewport keeps a centered 480px surface.
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
- Production TypeScript remains at or below 300 lines; new chat presentation files are at most 275 lines and the touched runtime owner remains 299 lines.

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
| chat presentation | `apps/web/src/pages/chat/**` | `/conversations/:conversationID` consumes existing message sync; no transport ownership |

## Test Roles

| role | retained evidence | decision |
| :--- | :--- | :--- |
| contract/behavior | 20 Vitest files / 55 tests covering runtime、storage、conversation/message sync、realtime and ordering | retained; protects canonical behavior owners |
| migration proof | temporary deterministic chat harness + browser screenshots/metrics | proof consumed and harness deleted; no production route pollution |
| placeholder/compat | none | no legacy UI path or test-only wrapper retained |

## Parity Gaps

- Conversation/Message Repository paths used by W4 are covered locally; remaining repository capabilities still need feature-scoped parity before use.
- Chromium proves real-browser sql.js open/migrate/close; reload/crash/quota recovery remains unverified.
- Real Gateway login/WebSocket behavior is covered by injected-port tests, not deployment evidence.
- Authenticated conversation/chat routes and realtime data persistence have local integration evidence but no real Gateway deployment evidence.
- Same-tab HTTP/realtime writes share one semantic queue; this does not provide cross-tab writer ownership.
- Account-login core is RN-sourced and live-term verified, but final parity still lacks the exact 390x844/desktop light/dark matrix and approved-account login success.
- Conversation core is RN-sourced and locally responsive-verified, but final parity lacks approved-account cache/sync/chat-back Network evidence; global search/group actions/long-press/presence/group-avatar capabilities remain omitted until Web facades exist.
- Chat core is RN-sourced and locally responsive-verified, but final parity lacks approved-account history/pull/send/realtime/list-back Network evidence；presence、group-member enrichment、settings、voice/emoji/attachment、retry、media playback/download remain omitted until Web facades exist.

## Accepted Debt

| item | owner | next |
| :--- | :--- | :--- |
| real browser Worker/Web Lock lifecycle not exercised without a harness/account | Web SDK storage runtime | run Chromium/Firefox/Safari same-account close/crash matrix before production acceptance |
| no Safari/Firefox evidence | Web App + SDK runtime | browser matrix after real runtime exists |
| real Gateway smoke credentials absent | deployment owner | provide approved test URL/account/password variables and run `npm run smoke:gateway` |
| same-tab full-sync/delta semantic race | `resolved 2026-08-09` | shared FIFO owner and 3 interleaving/failure regressions passed |
| raw WebSocket message log in shared SDK | `resolved 2026-08-09` | removed in canonical owner; shared SDK test and H5 `npm run verify` passed |
| initial Git history | `resolved 2026-08-09` | `main/origin/main` share `07a0424`; the external commit occurred during W6.a3 execution |
| RN page-specific `StyleSheet` migration incomplete | Web App W6 | retain W6.a2/W6.a3/W6.a4 acceptance gates and execute bounded W6.a5 auth/tab route decomposition |
