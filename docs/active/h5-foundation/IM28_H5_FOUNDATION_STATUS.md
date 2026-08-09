# IM28 H5 Foundation Status

- status: `active`
- current_step: `W4.a2-created-conversation realtime persistence and HTTP gap recovery`
- next_step: `persist normalized message/conversation events in one serialized queue, then publish cache changes to routed pages`
- blockers: `W3.real-gateway and final W4 acceptance require absent Gateway URL/test account variables`
- gate_state: `W3 local implementation passed; W4.a1 local MVP passed; W3/W4 real deployment gates pending`
- latest_evidence: `2026-08-09 shared SDK mapper tests passed; H5 verify passed with 12 files / 31 tests; Vite build passed; 1280x800 and 390x844 config/login smoke had no current-origin console errors or horizontal overflow`

## Current Readout

| dimension | state | note |
| :--- | :--- | :--- |
| pack | `active` | W3 保留真实环境门；W4 本地实现按独立 slice 推进 |
| `W1` | `done` | H5 规则、架构和存储 SSOT 已落库 |
| `W2` | `done` | npm workspace、Web SDK、Vite React Router App 与验证链已落地 |
| `W3` | `gated` | browser orchestration、account SQLite 与 privacy gate 已通过，等待真实 smoke |
| `W4` | `active` | HTTP MVP 与默认 routes 已本地完成；realtime persistence active，真实 flow gated |
| `W5` | `planned` | 在 MVP 后执行生产化门禁 |

## Active Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W4.a2-created-conversation` |
| goal | 将新消息与会话变更事件落入当前 account SQLite，并以 HTTP sync 恢复丢失消息窗口 |
| source_anchor | `docs/runtime-contracts/web-conversation-message-sync.md`; shared realtime event contract |
| target_owner | `packages/im-sdk-web/src/sync/**`; `packages/im-sdk-web/src/runtime/**` |
| expected_deliverable | event ordering contract、serialized runtime bridge、message/conversation persistence、recovery tests |
| verification_shape | focused event/storage tests + H5 workspace verify; final acceptance needs real chat smoke |
| stop_condition | event DTO 无稳定 identity，或 callback 无法暴露持久化失败；`message.update` 不进入本片 |

## Residual Ledger

| item | type | note | seed_for_next_slice |
| :--- | :--- | :--- | :--- |
| Gateway runtime | verification | implementation 已完成；`W3.real-gateway` 缺真实 smoke 证据 | yes |
| Account SQLite lifecycle | code/verification | login/restore/open/migrate 与 sign-out/invalidation/close 已通过 Node + Chromium smoke | no |
| Upstream raw message log | code/privacy | canonical shared SDK 日志已清除，共享 SDK 与 H5 回归通过 | no |
| sync orchestration | code/design | HTTP MVP 已实现；新消息/会话事件落库与缺口恢复为当前切片 | no |
| message update semantics | contract/code | 编辑、撤回、删除需要独立 cursor 与状态转换，排入 `W4.a2-updates` | yes |
| Worker execution | architecture/debt | 当前 sql.js 仍在 caller thread | no |
| multi-tab writer | architecture/debt | 当前没有跨标签页写入所有权 | no |
| Initial Git commit | repository/debt | 已关联 `origin`，尚未创建和推送首次提交 | no |

## Latest Closeout Verdict

| field | value |
| :--- | :--- |
| closed_slice | `W4.a1-local` |
| deliverable_verdict | `done` |
| gate_verdict | `mapper + 6 sync tests + 12/31 workspace gate + responsive config/login smoke passed` |
| debt_or_drift | `认证后 routes、realtime receive 与 real chat flow 尚无部署证据` |
| next_activation_decision | `W4.a2 active; W3.real-gateway retained as final acceptance dependency` |
