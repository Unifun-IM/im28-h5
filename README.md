# im28-h5

`im28-h5` is the browser client workspace for IM28. It contains a Vite + React Router Web App and a browser SDK package. The SDK facade reuses `@im28/im-sdk/web` and owns the `sql.js + IndexedDB` persistence adapter.

The current workspace consumes the sibling SDK through `file:../im28-phone/packages/im-sdk`; replace that link with the eventual package distribution contract before independent deployment.

## Commands

```sh
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
| `packages/im-sdk-web` | browser runtime, sync facade and sql.js/IndexedDB adapter |
| `docs/active/h5-foundation` | current plan, status and workset |

## Current Scope

- implemented/local-verified: npm workspace, Vite React App, React Router phone/email/account/register/conversation/chat/contacts/calls/me/settings/profile/security routes, global RN primary tab shell, browser SDK facade, typed Gateway configuration, tab-scoped auth session, stable device identity, login/register/restore/refresh/logout/account-password lifecycle, public platform-term adapter, current-user profile read/update facade, auth-bound account SQLite, conversation full sync + latest-message list composition, cached/pulled history, optimistic text send, paged remote friend list, call-record SQLite cache/full sync/server-first delete, shared same-tab mutation queue, realtime message/conversation persistence with paged HTTP gap recovery, independent message edit/delete update cursor, Dedicated Worker sql.js + IndexedDB persistence, account-lifecycle Web Lock ownership, 466-file RN asset mirror and RN light/dark CSS token foundation
- active: W6.a5.2 general-settings capability decomposition; auth-entry, conversation, chat, contacts, calls, me/profile and account credential security are done-local/acceptance-gated pending remaining real-account/theme evidence
- known contacts gap: `/contacts` currently uses the real remote friend-list operation but not RN cache-first behavior; shared Web `FriendshipRepository` export and Pinyin-equivalent grouping remain acceptance gates
- known calls gap: `/calls` uses real Gateway list/delete and account SQLite cache, but real-account visual/data evidence、call detail、realtime history updates and Web RTC remain acceptance gates
- known me gap: `/me/security` and account/password routes use real runtime operations; phone/email changes remain read-only because verification-code send is absent. Avatar/QR、dark、real profile/credential mutation and logout evidence remain gated
- known auth gap: Gateway currently exposes no verification-code-send or forgot-password operation; the verification UI states the fixed `666666` integration constraint and never reports fake success
- pending gate: real Gateway login/WebSocket/conversation/history/send smoke variables
- pending gate: Chromium/Firefox/Safari same-account two-tab close/crash matrix
- deferred: media upload/playback/download, failed-message retry, RTC and notifications until matching Web facades exist

The App expects `VITE_GATEWAY_HTTP_URL` and `VITE_GATEWAY_WS_URL`; without them it displays a fail-closed configuration state.

See `architecture.md`, `docs/rn-h5-migration-contract.md`, `docs/web-im-storage.md`, `docs/runtime-contracts/web-gateway-runtime.md` and `docs/runtime-contracts/web-conversation-message-sync.md` before changing the runtime or migrating a page.
