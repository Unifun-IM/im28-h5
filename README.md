# im28-h5

`im28-h5` is the browser client workspace for IM28. It contains the Vite + React Router Web App and consumes `@im28/im-sdk/web` from the generated local package under `packages/im-sdk`.

The sibling `im28-sdk` repository remains the only SDK source owner. `build:web` copies `dist/core`, `dist/web`, and a target-specific package manifest into the committed `packages/im-sdk`; the Web App consumes it through `file:../../packages/im-sdk`.

## Commands

```sh
npm --prefix ../im28-sdk install
npm --prefix ../im28-sdk run build:web
npm install
npm run assets:sync # refresh the byte-identical RN asset mirror
npm run verify
npm run dev
npm run smoke:gateway # requires the variables documented in the runtime contract
```

The development app is served by Vite at `http://localhost:5173/` by default.

## Workspace

| path | owner |
| :--- | :--- |
| `apps/web` | React Router auth/conversation/chat/contacts/calls/me pages and the global RN primary tab shell |
| `apps/web/src/assets/rn` | hash-tracked mirror of all RN business assets |
| `packages/im-sdk` | generated and committed Web SDK package; never a source owner |
| `../im28-sdk/src/platforms/web` | canonical browser runtime, sync facade and sql.js/IndexedDB adapter in the SDK Git repository |
| `docs/active/h5-foundation` | current plan, status and workset |

## Current Scope

- implemented/local-verified: npm workspace, Vite React App, React Router phone/email/account/register/conversation/chat/contacts/calls/me/settings/profile/security routes, settings display/notification/permissions/terms plus RN version row/update modal, global RN primary tab shell, browser SDK facade, typed Gateway/build-identity configuration, tab-scoped auth session, stable device identity, login/register/restore/refresh/logout/account-password lifecycle, notification/permission preference、public platform-term and public Web client-version adapters, current-user profile read/update facade, auth-bound account SQLite, conversation full sync + latest-message list composition, cached/pulled history, optimistic text send, paged remote friend list, call-record SQLite cache/full sync/server-first delete, shared same-tab mutation queue, realtime message/conversation persistence with paged HTTP gap recovery, independent message edit/delete update cursor, Dedicated Worker sql.js + IndexedDB persistence, account-lifecycle Web Lock ownership, 466-file RN asset mirror and RN light/dark CSS token foundation
- active: W6.a5.2 invite/complete-profile contract freeze; prior auth-entry、conversation、chat、contacts、calls、me/profile/security and display/notification/permissions/terms/version settings are done-local/acceptance-gated pending remaining real-account/cross-browser evidence
- known contacts gap: `/contacts` currently uses the real remote friend-list operation but not RN cache-first behavior; shared Web `FriendshipRepository` export and Pinyin-equivalent grouping remain acceptance gates
- known calls gap: `/calls` uses real Gateway list/delete and account SQLite cache, but real-account visual/data evidence、call detail、realtime history updates and Web RTC remain acceptance gates
- known me gap: `/me/security` and account/password routes use real runtime operations; phone/email changes remain read-only because verification-code send is absent. Avatar/QR、dark、real profile/credential mutation and logout evidence remain gated
- known auth gap: Gateway currently exposes no verification-code-send or forgot-password operation; the verification UI states the fixed `666666` integration constraint and never reports fake success
- pending gate: real Gateway login/WebSocket/conversation/history/send smoke variables
- pending gate: Chromium/Firefox/Safari same-account two-tab close/crash matrix
- known settings gap: notification/permission real reads are proven but writes remain approval-gated；network is browser-blocked；whole account-cache clear is rejected until disposable data is isolated；Web version check is implemented but a real `need_update=true` response/update target remains acceptance-gated
- deferred: media upload/playback/download, failed-message retry, RTC and native push notification delivery until matching Web facades exist

The App expects `VITE_GATEWAY_HTTP_URL`, `VITE_GATEWAY_WS_URL` and deployment-generated `VITE_APP_VERSION`; optional `VITE_APP_BUILD_NUMBER` must be a non-negative decimal string. `npm run dev` uses the same dev Gateway HTTP/WebSocket endpoints as `im28-phone_2/src/config/appEnvironment.ts` and the OpenAPI `/pc` platform path; `npm run dev:h5` uses the same dev endpoints with `/h5`. Production builds keep deployment-provided endpoints and default to `/h5` unless deployment explicitly sets `VITE_GATEWAY_PLATFORM`. Missing or invalid values display a fail-closed configuration state.

See `architecture.md`, `docs/rn-h5-migration-contract.md`, `docs/web-im-storage.md`, `docs/runtime-contracts/web-gateway-runtime.md`, `docs/runtime-contracts/web-conversation-message-sync.md` and `docs/runtime-contracts/web-settings-cache-version.md` before changing the runtime or migrating a page.
