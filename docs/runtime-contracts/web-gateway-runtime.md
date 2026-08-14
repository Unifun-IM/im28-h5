# Web Gateway Runtime Contract

> TYPE: RUNTIME_CONTRACT / AUTH_TRANSPORT
> STATUS: W3_A2_IMPLEMENTED / REAL_SMOKE_PENDING
> OWNER: `../im28-sdk/src/platforms/web/runtime/**`
> AXIOM: Gateway owns remote truth; the Web runtime owns browser transport lifecycle and never invents a second Gateway protocol.

## 1. Runtime Topology

```text
apps/web config + pages
-> @im28/im-sdk/web runtime facade
-> @im28/im-sdk/web Gateway HTTP/WebSocket clients
-> Gateway

sessionStorage
-> WebIMAuthSessionStore
-> runtime-only Bearer token access
-> WebIMDeviceIdentityStore
-> tab-scoped non-secret device identity

SQLite/IndexedDB
-> message/conversation cache only
-> contacts remain remote-only until a shared Web Repository export is accepted
-> never stores access_token or refresh_token
```

## 2. Deployment Configuration

| environment key | required | normalized runtime field | rule |
| :--- | :--- | :--- | :--- |
| `VITE_GATEWAY_HTTP_URL` | yes | `gatewayHTTPURL` | absolute `http:` or `https:` deployment root; runtime appends the configured client platform unless already present |
| `VITE_GATEWAY_WS_URL` | yes | `gatewayWebSocketURL` | absolute `ws:`/`wss:` URL; `http:`/`https:` is normalized to the matching WebSocket protocol |
| `VITE_GATEWAY_PLATFORM` | no | HTTP path platform | `h5` by default; accepts only `h5` or `pc`, and rejects a base URL ending in a different platform |
| `VITE_IM_PLATFORM_ID` | no | `platformID` | positive integer; defaults to OpenIM Web platform `5` |
| `VITE_IM_LANGUAGE` | no | `language` | non-empty BCP-47-style value; defaults to `zh-CN` |

Gateway domains are deployment input. Mobile code and README currently contain different historical domains, so H5 must not compile either value as hidden production truth.

OpenIM documents Web as platform ID `5`: <https://docs.openim.io/sdks/enum/platform>.

## 3. Authentication Ownership

| concern | owner | contract |
| :--- | :--- | :--- |
| login/register/refresh/logout HTTP calls | `WebIMRuntimeImpl` | call the shared `GatewayHTTPClient`; do not duplicate endpoints |
| access token | `WebIMAuthSessionStore` | JS-readable because the shared client sends `Authorization: Bearer`; stored in `sessionStorage`, never SQLite/localStorage |
| refresh token | `WebIMAuthSessionStore` | same tab-scoped session as access token; cleared on invalid/corrupt state |
| user ID | auth session | normalized non-empty string; scopes SQLite database after authentication |
| device ID | `WebIMDeviceIdentityStore` | non-secret stable tab identity in `sessionStorage`; passed unchanged to login, register, refresh and WebSocket auth；must not be shared across concurrent account tabs |
| logout | `WebIMRuntimeImpl` | best-effort remote logout, mandatory realtime close, local session clear and account database close |
| account database | `WebIMAccountDatabaseLifecycle` | open/migrate before authenticated state; switch by normalized userID; close on sign-out, kicked or token-expired |

`sessionStorage` limits persistence to the current tab session but does not protect tokens from XSS. Production acceptance therefore requires CSP, dependency hygiene and no unsafe HTML injection. An HttpOnly-cookie/BFF design would require a backend contract change and is not claimed here.

## 4. Shared Gateway Contract

The updated OpenAPI uses `/{platform}/v1/**`. Production/browser builds default to the normalized `/h5` base path. Repository `npm run dev` loads `dev-pc`, using `im28-phone_2/src/config/appEnvironment.ts` development HTTP/WebSocket endpoints plus `/pc`; `npm run dev:h5` loads `dev-h5` with the same development endpoints plus `/h5`. The stable installation identity is sent through `X-Device-ID` for register, login, refresh and all authenticated calls; auth/call/conversation request bodies must not reintroduce `device_id`. WebSocket authentication keeps its existing `device_id` query/frame contract because it is not governed by the HTTP OpenAPI body migration.

| channel | shared behavior reused from `@im28/im-sdk/core` |
| :--- | :--- |
| HTTP | base URL normalization, JSON envelope unwrap, Bearer header, request ID, language, typed login/register/refresh/logout/check-token/friend-list calls |
| WebSocket | `user_id` and `device_id` query values, auth frame with token/platform/device, heartbeat, pong timeout, exponential reconnect and token-expired event |

The H5 package may adapt browser `fetch`, `WebSocket`, storage and configuration. It must not copy generated endpoints, DTOs, realtime payload normalization or reconnect algorithms.

## 5. Lifecycle State Machine

冷启动离线扩展的资格、只读数据库、专用 reader、mutation 禁用与 reconnect 规则由 [`web-cold-start-offline.md`](./web-cold-start-offline.md) 冻结；H5 已通过独立 Gateway proxy 验收消费该 reader，Gateway 再校验成功后才恢复下表完整 production 主链。

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
| login/register/refresh failure | do not save partial session |
| verification-code-send unavailable | preserve a visible capability gap; never start a countdown or report that a code was sent |
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
- `W6.a5.2.1`: authenticated paged friend-list read through the shared client; no duplicate endpoint and no claimed contact cache.

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

Current gate state on 2026-08-14:

- implementation: passed with 10 Vitest files / 25 tests and workspace typecheck/build;
- Chromium App and account SQLite smoke: passed; WASM open/migrate/close completed with no console warning/error and the isolated smoke database was deleted;
- real Gateway read-only smoke: phone-code login、refresh restore、Gateway-backed conversation/contact/profile reads and two-account tab isolation passed;
- realtime observability: `PrimaryTabsLayout[data-im-runtime-state]` exposes only the token-free SDK lifecycle state；the initial two-account run exposed alternating `online/reconnecting` caused by origin-shared device identity，and tab-scoped `sessionStorage` device identity removed that collision；a 30-second sample produced 19/20 dual-online states plus one simultaneous transient reconnect that recovered on the next sample;
- realtime delivery: two online tab-scoped accounts used the production composer/Gateway/WebSocket path；the receiver list updated without reload to the unique marker plus one unread, then the chat cache window and list-back showed the same marker;
- SQLite convergence: shared realtime writes `MessageRepository/ConversationRepository` before publishing `dataVersion`，and H5 consumes that revision only through `listCachedItems/getCachedHistory`；this proves realtime persistence, not offline restart recovery;
- offline SQLite hot-session hit: passed in an isolated origin after online warm-up; once its HTTP proxy was stopped and WebSocket remained unavailable, contacts、conversation rows、latest marker and chat history stayed readable from the current-account cache while `Failed to fetch` remained visible;
- offline cold start: SDK runtime-safe but not H5-consumed；`restore()` 仅在 check-token transport failure 且 existing snapshot 可读时返回专用 reader，当前 H5 仍未渲染该分支；
- any cold-start design must first freeze token-expiry、read-only database、send/mutation disablement、reconnect and invalid-session cleanup semantics; hot-session evidence must not be expanded into an offline-login claim;
- RTC deployment gate: two independent online accounts reached the production audio-call active route, but the caller received `通话已结束 / 服务不可用`, the receiver received no invite overlay, and neither call list gained a record; this proves the client failure cleanup path, not real invite/reject/LiveKit acceptance;
- RTC activation requires the deployed call service to create a durable call and issue credentials; only then may the same production path close receiver invite/reject, caller terminal convergence, media and call-list gates;
- upstream privacy gate: passed after removing raw `event.data` logging from the canonical `@im28/im-sdk` realtime client; shared SDK and H5 regression gates passed.
