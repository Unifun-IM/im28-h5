# IM28 H5 Foundation Status

- status: `active`
- current_step: `W6.a5.2.7 general-settings route/capability decomposition after account credential closeout`
- next_step: `trace RN general settings rows and classify display/notification/permission/network/terms/version/cache owners before restoring routes`
- blockers: `W5.a3 browser matrix remains blocked-environment; W3.real-gateway and final data-backed acceptance require Gateway test credentials`
- gate_state: `auth entry、conversation、chat、contacts、calls、me/profile/security and global tab shell are done-local but not parity-accepted; contact credential mutation、general settings and external real-account/browser gates remain`
- latest_evidence: `2026-08-10 W6.a5.2.6.1: WebIMRuntime set/reset credential facade + /me/security|account|password; 390x844/760x900 authenticated light、guest guard、refresh/back/forward and console proof passed; npm verify 466 assets + 25 files / 70 tests; dark and real set/reset remain gated`

## Current Readout

| dimension | state | note |
| :--- | :--- | :--- |
| pack | `active` | W3/W4/W5 保留外部门；W6 RN parity 本地切片 active |
| `W1` | `done` | H5 规则、架构和存储 SSOT 已落库 |
| `W2` | `done` | npm workspace、Web SDK、Vite React Router App 与验证链已落地 |
| `W3` | `gated` | browser orchestration、account SQLite 与 privacy gate 已通过，等待真实 smoke |
| `W4` | `gated` | HTTP MVP、默认 routes、新消息/会话/update 与 same-tab ordering 已本地完成；真实 flow gated |
| `W5` | `gated` | W5.a1/W5.a2 done-local；W5.a3 code done-local，真实三浏览器矩阵 pending |
| `W6` | `active` | auth-entry/conversation/chat/contacts/calls/me/profile/security/global tab shell core done-local/acceptance-gated；general-settings decomposition active |

## Active Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.7-general-settings-decomposition` |
| goal | 将 RN 通用设置行拆成可实施、可验收的独立 H5 route/capability slices |
| source_anchor | RN `ProfileScreen` display、notification、permission、network、terms、version/cache 分支及其 service/API owners |
| target_owner | future `apps/web/src/pages/me/settings/**`; Web runtime/sync facades；React Router route ledger |
| expected_deliverable | source/API/route matrix，明确 ready/missing/blocked owner，并选择不超过三个真实操作进入下一切片 |
| verification_shape | RN source trace + Gateway/shared SDK export trace + route ownership review；本阶段不制造占位页或成功态 |
| stop_condition | capability has no real browser/runtime owner or requires native-only permission/cache semantics；记录 gap 后停止该分支 |

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
| RN visual parity | migration | phone/email/account/register、conversation、chat、contacts、calls、me/profile/security core 已本地迁移且仍有真实账号/theme/data gate；general settings continue W6.a5.2 | yes |
| Contacts cache/index parity | migration/API gap | `/contacts` 真实远端分页已完成；shared Web entry 未导出 `FriendshipRepository`，中文拼音索引未对齐 | yes |
| Primary tab shell | migration | global owner 和四个 route 均已启用；friend/group application badge、me dark/real logout proof 缺失 | yes |
| Calls real-account parity | migration/verification | cache/sync/delete、SQLite tests、route/guest guard 已完成；账号 session 失效，缺真实列表/删除与 light/dark screenshot | yes |
| Verification code send | API gap | Gateway OpenAPI 无发送验证码 operation；页面只展示固定 `666666` 联调约束，不制造发送成功态 | yes |
| Contact security mutation | API gap | phone/email security rows are read-only because send-code operation is absent；不制造绑定/换绑成功态 | yes |
| RN asset mirror | resolved | 466 文件按源路径复制并由 SHA-256 verify gate 保护 | no |
| snapshot failure poisoning | resolved | fatal discard、subsequent reject、close no-repersist 与 Worker terminate 回归通过 | no |
| Initial Git commit | resolved | `main/origin/main` 已存在 `07a0424` baseline；该外部提交发生于 W6.a3 执行期间 | no |

## Latest Closeout Verdict

| field | value |
| :--- | :--- |
| closed_slice | `W6.a5.2.6.1-account-credential` |
| deliverable_verdict | `done-local/acceptance-gated` |
| gate_verdict | `two credential operations + three React Router security routes + 3 focused runtime tests + authenticated mobile/desktop/history/guest proof + 25/70 verify passed` |
| debt_or_drift | `dark screenshot and approved real set/reset remain gated; phone/email mutation is blocked by missing send-code contract; no direct Gateway/mock/fake-success/compat/orphan route or overlimit production file` |
| next_activation_decision | `activate W6.a5.2.7 general-settings decomposition; retain contact-security API gap and all real-account/theme/W3/W5 gates` |
