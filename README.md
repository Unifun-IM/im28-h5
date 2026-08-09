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
| `apps/web` | React Router login, conversation list and chat pages |
| `apps/web/src/assets/rn` | hash-tracked mirror of all RN business assets |
| `packages/im-sdk-web` | browser runtime, sync facade and sql.js/IndexedDB adapter |
| `docs/active/h5-foundation` | current plan, status and workset |

## Current Scope

- implemented/local-verified: npm workspace, Vite React App, React Router login/conversation/chat routes, browser SDK facade, typed Gateway configuration, tab-scoped auth session, stable device identity, login/restore/refresh/logout and realtime lifecycle, public platform-term adapter, auth-bound account SQLite, conversation full sync, cached/pulled history, optimistic text send, shared same-tab mutation queue, realtime message/conversation persistence with paged HTTP gap recovery, independent message edit/delete update cursor, Dedicated Worker sql.js + IndexedDB persistence, account-lifecycle Web Lock ownership, 466-file RN asset mirror, RN light/dark CSS token foundation and account-login core migration
- active: RN conversation shell/list parity; account-login core is done-local but still requires exact light/dark viewport evidence and a real login success smoke for final acceptance
- pending gate: real Gateway login/WebSocket/conversation/history/send smoke variables
- pending gate: Chromium/Firefox/Safari same-account two-tab close/crash matrix
- deferred: media, RTC and notifications

The App expects `VITE_GATEWAY_HTTP_URL` and `VITE_GATEWAY_WS_URL`; without them it displays a fail-closed configuration state.

See `architecture.md`, `docs/rn-h5-migration-contract.md`, `docs/web-im-storage.md`, `docs/runtime-contracts/web-gateway-runtime.md` and `docs/runtime-contracts/web-conversation-message-sync.md` before changing the runtime or migrating a page.
