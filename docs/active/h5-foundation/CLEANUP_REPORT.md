# Cleanup Report - 2026-08-09

## Baseline

- TypeScript: `npm run typecheck` passed for `@im28/im-sdk-web` and `@im28/h5-web`.
- Tests: 12 Vitest files / 31 tests passed, including 6 real sql.js/Repository conversation/history/send regressions.
- Build: SDK declaration/ESM build and Vite production build passed.
- Browser: 1280x800 and 390x844 config/login pages had no horizontal overflow or current-origin console warning/error; isolated WASM account DB smoke remains passed.
- Automated convergence script: unavailable; `/scripts/check-convergence.sh` does not exist in this workspace.

## P0/P1 Findings

- Resolved P1: duplicated auth/account DB checks in conversation/message services moved to `sync-context.ts` canonical owner.
- H5 scope: no remaining P0/P1 finding after sync context convergence and obsolete `BootPage` removal.
- no React Native import, fake-success path, wildcard export, debug console, placeholder marker, broken import or source file over 300 lines remains in H5 scope.
- upstream privacy gate closed: the canonical shared `@im28/im-sdk` client no longer logs complete Gateway WebSocket `event.data`; shared SDK and H5 regression gates passed.

## Canonical Homes

| semantic | canonical owner | adapter/consumer |
| :--- | :--- | :--- |
| platform-neutral IM DTO, Repository and Gateway clients | `im28-phone/packages/im-sdk` via `@im28/im-sdk/web` | `packages/im-sdk-web` named facade |
| browser SQLite/IndexedDB persistence | `packages/im-sdk-web/src/storage` | account lifecycle and future Repository sync owner |
| account database open/migrate/switch/close | `packages/im-sdk-web/src/storage/account-database-lifecycle.ts` | auth runtime and future Repository sync owner |
| browser page routing | `apps/web/src/app/App.tsx` with React Router | page modules under `apps/web/src/pages` |
| browser auth/realtime orchestration | `packages/im-sdk-web/src/runtime` | lazy App assembly under `apps/web/src/runtime` |
| Gateway DTO -> core entities | `im28-phone/packages/im-sdk/src/transport/gateway-http/domain-mappers.ts` | Web conversation/message sync |
| browser conversation/message orchestration | `packages/im-sdk-web/src/sync` | React Router pages through `runtime.getSync()` |

## Parity Gaps

- Conversation/Message Repository paths used by W4 are covered locally; remaining repository capabilities still need feature-scoped parity before use.
- Chromium proves real-browser sql.js open/migrate/close; reload/crash/quota recovery remains unverified.
- Real Gateway login/WebSocket behavior is covered by injected-port tests, not deployment evidence.
- Authenticated conversation/chat routes and realtime data persistence have no real environment evidence.

## Accepted Debt

| item | owner | next |
| :--- | :--- | :--- |
| sql.js caller-thread execution | Web SDK storage runtime | Worker RPC production gate |
| no multi-tab writer ownership | Web SDK storage runtime | choose Web Locks or SharedWorker and add two-tab regression |
| no Safari/Firefox evidence | Web App + SDK runtime | browser matrix after real runtime exists |
| real Gateway smoke credentials absent | deployment owner | provide approved test URL/account/password variables and run `npm run smoke:gateway` |
| realtime data events not persisted | Web SDK sync/runtime | execute active `W4.a2` with normalized event and HTTP recovery tests |
| raw WebSocket message log in shared SDK | `resolved 2026-08-09` | removed in canonical owner; shared SDK test and H5 `npm run verify` passed |
| initial Git history not created yet | repository owner | review the initial file set, then create and push the first commit to `origin/main` |
