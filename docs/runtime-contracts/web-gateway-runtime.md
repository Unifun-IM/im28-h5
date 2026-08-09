# Web Gateway Runtime Contract

> TYPE: RUNTIME_CONTRACT / AUTH_TRANSPORT
> STATUS: W3_A2_IMPLEMENTED / REAL_SMOKE_PENDING
> OWNER: `packages/im-sdk-web/src/runtime/**`
> AXIOM: Gateway owns remote truth; the Web runtime owns browser transport lifecycle and never invents a second Gateway protocol.

## 1. Runtime Topology

```text
apps/web config + pages
-> @im28/im-sdk-web runtime facade
-> @im28/im-sdk/web Gateway HTTP/WebSocket clients
-> Gateway

sessionStorage
-> WebIMAuthSessionStore
-> runtime-only Bearer token access

SQLite/IndexedDB
-> message/conversation cache only
-> never stores access_token or refresh_token
```

## 2. Deployment Configuration

| environment key | required | normalized runtime field | rule |
| :--- | :--- | :--- | :--- |
| `VITE_GATEWAY_HTTP_URL` | yes | `gatewayHTTPURL` | absolute `http:` or `https:` URL; trailing slash removed |
| `VITE_GATEWAY_WS_URL` | yes | `gatewayWebSocketURL` | absolute `ws:`/`wss:` URL; `http:`/`https:` is normalized to the matching WebSocket protocol |
| `VITE_IM_PLATFORM_ID` | no | `platformID` | positive integer; defaults to OpenIM Web platform `5` |
| `VITE_IM_LANGUAGE` | no | `language` | non-empty BCP-47-style value; defaults to `zh-CN` |

Gateway domains are deployment input. Mobile code and README currently contain different historical domains, so H5 must not compile either value as hidden production truth.

OpenIM documents Web as platform ID `5`: <https://docs.openim.io/sdks/enum/platform>.

## 3. Authentication Ownership

| concern | owner | contract |
| :--- | :--- | :--- |
| login/refresh/logout HTTP calls | `WebIMRuntimeImpl` | call the shared `GatewayHTTPClient`; do not duplicate endpoints |
| access token | `WebIMAuthSessionStore` | JS-readable because the shared client sends `Authorization: Bearer`; stored in `sessionStorage`, never SQLite/localStorage |
| refresh token | `WebIMAuthSessionStore` | same tab-scoped session as access token; cleared on invalid/corrupt state |
| user ID | auth session | normalized non-empty string; scopes SQLite database after authentication |
| device ID | `WebIMDeviceIdentityStore` | non-secret stable browser identity; passed to login, refresh and WebSocket auth |
| logout | `WebIMRuntimeImpl` | best-effort remote logout, mandatory realtime close, local session clear and account database close |
| account database | `WebIMAccountDatabaseLifecycle` | open/migrate before authenticated state; switch by normalized userID; close on sign-out, kicked or token-expired |

`sessionStorage` limits persistence to the current tab session but does not protect tokens from XSS. Production acceptance therefore requires CSP, dependency hygiene and no unsafe HTML injection. An HttpOnly-cookie/BFF design would require a backend contract change and is not claimed here.

## 4. Shared Gateway Contract

| channel | shared behavior reused from `@im28/im-sdk/web` |
| :--- | :--- |
| HTTP | base URL normalization, JSON envelope unwrap, Bearer header, request ID, language, typed login/refresh/logout/check-token calls |
| WebSocket | `user_id` and `device_id` query values, auth frame with token/platform/device, heartbeat, pong timeout, exponential reconnect and token-expired event |

The H5 package may adapt browser `fetch`, `WebSocket`, storage and configuration. It must not copy generated endpoints, DTOs, realtime payload normalization or reconnect algorithms.

## 5. Lifecycle State Machine

| current | event | next |
| :--- | :--- | :--- |
| `anonymous` | `auth_started` | `authenticating` |
| `anonymous` | `auth_restored` | `authenticated` |
| `authenticating` | `auth_succeeded` | `authenticated` |
| `authenticating` | `auth_failed` | `anonymous` |
| `authenticated` | `realtime_connecting` | `connecting` |
| `connecting` | `realtime_connected` | `online` |
| `connecting` / `online` | `realtime_disconnected` | `reconnecting` |
| `reconnecting` | `realtime_connecting` | `connecting` |
| `reconnecting` | `realtime_connected` | `online` |
| any authenticated state | `token_expired` / `signed_out` | `anonymous` |

Invalid transitions must throw a structured runtime error. They must not silently report a connected or authenticated state.

## 6. Failure Semantics

| failure | required behavior |
| :--- | :--- |
| missing/invalid runtime environment | reject before creating Gateway clients |
| malformed persisted auth session | remove corrupt record and reject restore visibly |
| login/refresh failure | do not save partial session |
| account database open/migration failure | reject authentication before saving session or creating realtime client |
| account database close failure during sign-out | credentials and realtime are still cleared; sign-out rejects visibly |
| account database close failure after realtime invalidation | report through the injected background error channel; never swallow |
| token-expired realtime event | close realtime client, clear auth session and transition to `anonymous` |
| remote logout failure | still close local runtime and clear local auth |
| missing browser WebSocket/fetch | reject runtime startup; never return fake success |

## 7. W3 Boundaries

- `W3.a1`: config parser, auth session store, lifecycle state machine and this contract.
- `W3.a2`: browser fetch/WebSocket adapters, device identity, login/restore/refresh/logout orchestration and real Gateway smoke.
- `W4`: conversation sync, repository writes and user-facing auth/chat pages.

## 8. Real Gateway Smoke

Run from `im28-h5/` with secrets supplied by the local shell or an approved secret manager:

```sh
export IM28_GATEWAY_HTTP_URL='https://confirmed-gateway.example.com'
export IM28_GATEWAY_WS_URL='wss://confirmed-push.example.com/ws'
export IM28_GATEWAY_ACCOUNT='test-account'
export IM28_GATEWAY_PASSWORD='test-password'
npm run smoke:gateway
```

Optional variables: `IM28_GATEWAY_PLATFORM_ID` (default `5`), `IM28_GATEWAY_LANGUAGE` (default `zh-CN`) and `IM28_GATEWAY_DEVICE_ID`. The script keeps tokens in process memory, prints only `state/userID`, and performs remote logout in `finally`. Never commit smoke credentials or place them in `.env.example`.

Current gate state on 2026-08-09:

- implementation: passed with 10 Vitest files / 25 tests and workspace typecheck/build;
- Chromium App and account SQLite smoke: passed; WASM open/migrate/close completed with no console warning/error and the isolated smoke database was deleted;
- real Gateway smoke: not run because URL/account/password variables are absent; fail-closed preflight returned exit code `1` before network access;
- upstream privacy gate: passed after removing raw `event.data` logging from the canonical `@im28/im-sdk` realtime client; shared SDK and H5 regression gates passed.
