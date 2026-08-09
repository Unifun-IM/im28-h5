# im28-h5

`im28-h5` is the browser client workspace for IM28. It contains a Vite + React Router Web App and a browser SDK package. The SDK facade reuses `@im28/im-sdk/web` and owns the `sql.js + IndexedDB` persistence adapter.

The current workspace consumes the sibling SDK through `file:../im28-phone/packages/im-sdk`; replace that link with the eventual package distribution contract before independent deployment.

## Commands

```sh
npm install
npm run verify
npm run dev
npm run smoke:gateway # requires the variables documented in the runtime contract
```

The development app is served by Vite at `http://localhost:5173/` by default.

## Workspace

| path | owner |
| :--- | :--- |
| `apps/web` | React Router login, conversation list and chat pages |
| `packages/im-sdk-web` | browser runtime, sync facade and sql.js/IndexedDB adapter |
| `docs/active/h5-foundation` | current plan, status and workset |

## Current Scope

- implemented/local-verified: npm workspace, Vite React App, React Router login/conversation/chat routes, browser SDK facade, typed Gateway configuration, tab-scoped auth session, stable device identity, login/restore/refresh/logout and realtime lifecycle, auth-bound account SQLite, conversation full sync, cached/pulled history, optimistic text send, sql.js + IndexedDB persistence
- pending gate: real Gateway login/WebSocket/conversation/history/send smoke variables
- deferred: realtime message persistence, Worker execution, multi-tab writer ownership, media, RTC and notifications

The App expects `VITE_GATEWAY_HTTP_URL` and `VITE_GATEWAY_WS_URL`; without them it displays a fail-closed configuration state.

See `architecture.md`, `docs/web-im-storage.md`, `docs/runtime-contracts/web-gateway-runtime.md` and `docs/runtime-contracts/web-conversation-message-sync.md` before changing the runtime.
