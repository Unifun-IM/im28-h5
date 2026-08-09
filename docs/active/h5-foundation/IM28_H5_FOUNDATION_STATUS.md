# IM28 H5 Foundation Status

- status: `active`
- current_step: `W6.a3 RN conversation shell/list parity`
- next_step: `freeze the RN conversation source/API/route card, then replace the generic list shell without changing sync ownership`
- blockers: `W5.a3 browser matrix remains blocked-environment; W3.real-gateway and final data-backed acceptance require Gateway test credentials`
- gate_state: `W6.a2 is done-local but not parity-accepted; exact light/dark viewport matrix and real login success remain gated while W6.a3 may proceed`
- latest_evidence: `2026-08-09 W6.a2: RN account form/assets/agreement migrated; live public terms loaded; dark 458x786 interaction/refresh smoke passed; npm verify passed with 466 assets and 20 files / 55 tests`

## Current Readout

| dimension | state | note |
| :--- | :--- | :--- |
| pack | `active` | W3/W4/W5 保留外部门；W6 RN parity 本地切片 active |
| `W1` | `done` | H5 规则、架构和存储 SSOT 已落库 |
| `W2` | `done` | npm workspace、Web SDK、Vite React Router App 与验证链已落地 |
| `W3` | `gated` | browser orchestration、account SQLite 与 privacy gate 已通过，等待真实 smoke |
| `W4` | `gated` | HTTP MVP、默认 routes、新消息/会话/update 与 same-tab ordering 已本地完成；真实 flow gated |
| `W5` | `gated` | W5.a1/W5.a2 done-local；W5.a3 code done-local，真实三浏览器矩阵 pending |
| `W6` | `active` | account-login core done-local/acceptance-gated；conversation parity active |

## Active Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a3-conversation-parity` |
| goal | 将 RN home/chat tab 的会话列表视觉、资源、交互状态迁入 `/conversations` |
| source_anchor | `ChatHomeScreen.tsx`; `ConversationListScreen.tsx`; list rows/header/empty-state components; RN theme/assets |
| target_owner | `apps/web/src/pages/conversations/**`; React Router `/conversations`; existing `runtime.getSync()` caller |
| expected_deliverable | RN header/list row/avatar/unread/loading/empty/error states、light/dark responsive layout和现有 cache/sync 链 |
| verification_shape | source card + asset check + type/build + viewport/theme screenshots + refresh/chat-back/API smoke |
| stop_condition | required conversation operation absent from Web facade; record gap instead of page fetch/mock |

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
| RN visual parity | migration | login core 已迁移但仍缺最终矩阵；conversation/chat 继续按 W6.a3/a4 移除 generic UI | yes |
| RN asset mirror | resolved | 466 文件按源路径复制并由 SHA-256 verify gate 保护 | no |
| snapshot failure poisoning | resolved | fatal discard、subsequent reject、close no-repersist 与 Worker terminate 回归通过 | no |
| Initial Git commit | repository/debt | 已关联 `origin`，尚未创建和推送首次提交 | no |

## Latest Closeout Verdict

| field | value |
| :--- | :--- |
| closed_slice | `W6.a2-account-login-parity` |
| deliverable_verdict | `done-local/acceptance-gated` |
| gate_verdict | `RN core layout/assets/interactions + live public terms + verify passed; no mock, page fetch or duplicate route owner` |
| debt_or_drift | `real login success and exact 390x844/desktop light/dark evidence remain; W6.a5 owns deferred auth/network entries` |
| next_activation_decision | `activate W6.a3 locally; retain W6.a2 final acceptance and W3/W5 external gates` |
