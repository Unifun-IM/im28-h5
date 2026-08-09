# IM28 H5 Foundation Status

- status: `active`
- current_step: `W6.a5 remaining auth/tab route decomposition`
- next_step: `freeze one bounded W6.a5 route/capability card before restoring any remaining RN entry`
- blockers: `W5.a3 browser matrix remains blocked-environment; W3.real-gateway and final data-backed acceptance require Gateway test credentials`
- gate_state: `W6.a2/W6.a3/W6.a4 are done-local but not parity-accepted; real account evidence remains gated while W6.a5 decomposition may proceed`
- latest_evidence: `2026-08-09 W6.a4: RN header/list/bubbles/tails/status/composer migrated; deterministic 390x844 light/dark and 760x900 responsive proof passed without overflow; guest chat deep-link guard and npm verify passed with 466 assets and 20 files / 55 tests`

## Current Readout

| dimension | state | note |
| :--- | :--- | :--- |
| pack | `active` | W3/W4/W5 保留外部门；W6 RN parity 本地切片 active |
| `W1` | `done` | H5 规则、架构和存储 SSOT 已落库 |
| `W2` | `done` | npm workspace、Web SDK、Vite React Router App 与验证链已落地 |
| `W3` | `gated` | browser orchestration、account SQLite 与 privacy gate 已通过，等待真实 smoke |
| `W4` | `gated` | HTTP MVP、默认 routes、新消息/会话/update 与 same-tab ordering 已本地完成；真实 flow gated |
| `W5` | `gated` | W5.a1/W5.a2 done-local；W5.a3 code done-local，真实三浏览器矩阵 pending |
| `W6` | `active` | account-login/conversation/chat core done-local/acceptance-gated；remaining auth/tab route decomposition active |

## Active Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a5-auth-tab-route-decomposition` |
| goal | 将 remaining auth 与 primary tab RN states 拆成有稳定 URL、能力 owner 和验收门的 bounded slices；本片不批量恢复 UI |
| source_anchor | `AuthFlowScreen.tsx`; `screens/auth/types.ts`; `ChatHomeScreen.tsx`; `HomeTabBar.tsx` |
| target_owner | `apps/web/src/app/App.tsx` route ledger；后续 feature page；`@im28/im-sdk-web` capability facade |
| expected_deliverable | ordered route/capability/dependency ledger，并选择首个最多 3 个 API operation 的实现 slice |
| verification_shape | RN source trace + API owner trace + React Router URL/guard/back ownership review + first-slice acceptance card |
| stop_condition | required API/shared Web export absent or a route requires multiple unresolved capability families；记录 gap 后停止 UI 实现 |

## Residual Ledger

| item | type | note | seed_for_next_slice |
| :--- | :--- | :--- | :--- |
| Gateway runtime | verification | implementation 已完成；`W3.real-gateway` 缺真实 smoke 证据 | yes |
| Account SQLite lifecycle | code/verification | login/restore/open/migrate 与 sign-out/invalidation/close 已通过 Node + Chromium smoke | no |
| Upstream raw message log | code/privacy | canonical shared SDK 日志已清除，共享 SDK 与 H5 回归通过 | no |
| sync orchestration | code/design | HTTP MVP、新消息/会话串行落库、分页缺口恢复与页面 cache 刷新已完成 | no |
| message update semantics | contract/code | 独立 cursor、edit/delete-all、stale edit guard 与 recovery 已本地完成 | no |
| same-tab semantic locking | resolved | shared FIFO 覆盖 full sync/history/send/realtime，3 个交错/失败回归通过 | no |
| Worker execution | verification | production App 已显式注入 Worker；真实账号浏览器 open/migrate 待 W5.a3 harness/环境证据 | no |
| multi-tab writer | verification gate | lifecycle Web Lock 已本地实现，真实三浏览器 two-tab evidence 缺失 | yes |
| RN visual parity | migration | login/conversation/chat core 已本地迁移且仍有真实账号 gate；remaining auth/tab routes 进入 W6.a5 decomposition | yes |
| RN asset mirror | resolved | 466 文件按源路径复制并由 SHA-256 verify gate 保护 | no |
| snapshot failure poisoning | resolved | fatal discard、subsequent reject、close no-repersist 与 Worker terminate 回归通过 | no |
| Initial Git commit | resolved | `main/origin/main` 已存在 `07a0424` baseline；该外部提交发生于 W6.a3 执行期间 | no |

## Latest Closeout Verdict

| field | value |
| :--- | :--- |
| closed_slice | `W6.a4-chat-parity` |
| deliverable_verdict | `done-local/acceptance-gated` |
| gate_verdict | `RN header/list/bubbles/tails/status/composer + existing history/pull/send/dataVersion chain + route guard + responsive light/dark proof + verify passed; no mock, page fetch or duplicate owner` |
| debt_or_drift | `real account history/send/realtime/list-back proof missing; presence/group profile/settings/voice/emoji/attachment/retry/media interactions lack Web facades and remain omitted` |
| next_activation_decision | `activate W6.a5 decomposition; retain W6.a2/W6.a3/W6.a4 final acceptance and W3/W5 external gates` |
