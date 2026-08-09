# IM28 H5 Foundation Workset

| field | value |
| :--- | :--- |
| status | `active` |
| active_slice | `W4.a2-created-conversation` |
| verification_floor | `npm run verify` plus local browser smoke |

## Workstream Ledger

| workstream | scope | owner | expected deliverable | verification | status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `W1` | 基线与执行治理 | docs | H5 SSOT 与 active trio | 文档交叉核对 | `done` |
| `W2` | workspace 与 Web SDK 基础 | web app + sdk | 可安装、可构建、可启动骨架 | `npm run verify`; browser smoke | `done` |
| `W3` | Gateway runtime | sdk runtime | 真实认证与连接链路 | targeted tests + manual smoke | `gated` |
| `W4` | 会话与文本消息 | feature + sdk | 核心聊天 MVP | tests + real flow smoke | `active` |
| `W5` | 生产化门禁 | storage/runtime | Worker、多标签页与恢复策略 | browser matrix + regression | `planned` |

## Active / Pending Slice Queue

| item | type | owner | target output | verification | status | next activation rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `W2.a1` | code/docs | workspace + sdk + app | npm workspace、`@im28/im-sdk-web`、Vite React Router App | `npm run verify`; browser smoke | `done` | closed 2026-08-09 |
| `W2.closeout` | verification/docs | docs + workspace | 状态、架构、cleanup 和证据回写 | trio consistency + root gate | `done` | closed 2026-08-09 |
| `W3.a1` | contract/design | sdk runtime | Gateway runtime contract、auth/token owner 与配置边界 | 4 test files / 11 tests + workspace verify | `done` | closed 2026-08-09 |
| `W3.a2-local` | code/verification | sdk runtime + storage | browser auth/realtime、account SQLite lifecycle、privacy gate | shared SDK test + H5 25 tests + Chromium SQLite smoke | `done` | closed 2026-08-09 |
| `W3.real-gateway` | deployment verification | sdk runtime + deployment | real login/WebSocket evidence | `npm run smoke:gateway` | `blocked-external` | Gateway URL/account variables available |
| `W3.closeout` | verification/docs | sdk runtime + docs | real smoke evidence、架构与 trio 回写 | `npm run verify` + real Gateway smoke | `planned` | `W3.real-gateway` passed |
| `W4.a0` | contract/code | shared sdk + web sdk | 三操作 contract 与唯一 Gateway DTO -> core mapper | pure mapping tests + shared SDK build | `done` | closed 2026-08-09 |
| `W4.a1-conversations` | code | web sdk runtime | cache list、Gateway full sync、latest message persistence | 3 focused sql.js/Repository tests | `done` | closed 2026-08-09 |
| `W4.a1-history-send` | code | web sdk runtime | cache history、remote pull、optimistic text send | 3 message sync tests + workspace verify | `done` | closed 2026-08-09 |
| `W4.a1-ui` | code | web app | React Router conversation/message default caller | build + desktop/mobile config/login smoke | `done-local` | authenticated real flow still gated |
| `W4.a2-created-conversation` | code/verification | web sdk runtime | 新消息/会话事件落库、HTTP 缺口恢复与 UI cache 刷新 | focused tests + real chat smoke | `active` | W4.a1 local passed; final gate needs W3 real |
| `W4.a2-updates` | contract/code | web sdk runtime | 消息编辑、撤回、删除的 cursor 与 Repository 状态收敛 | focused update regressions | `planned` | created/conversation slice closed |
| `W4.a2-closeout` | verification/docs | web sdk runtime + docs | W4.a2 证据、残留项与下一片回写 | `npm run verify` + real chat smoke | `planned` | update slice local gate passed |
| `W5.a1` | architecture/code | storage/runtime | Worker 与 multi-tab writer owner | browser concurrency regression | `planned` | MVP semantics stable |

## Active Slice Card

| field | value |
| :--- | :--- |
| slice_id | `W4.a2-created-conversation` |
| goal | 让新消息/会话事件与 SQLite/HTTP recovery 收敛为单一串行数据路径 |
| source_anchor | shared realtime event contract; `docs/runtime-contracts/web-conversation-message-sync.md` |
| target_owner | `packages/im-sdk-web/src/sync/**`; runtime event bridge |
| expected_deliverable | event ordering contract、serialized persistence bridge、failure reporter、recovery regressions、页面 cache 刷新 |
| verification_shape | targeted Vitest + H5 `npm run verify`; final real chat smoke |
| stop_condition | event identity contract 不足，或 realtime callback error 被静默吞掉；消息更新不在本片实现 |
| residual_seed | `W4.a2-updates` |

## Deferred Residuals

| item | reason_not_active | likely_owner | candidate_verification |
| :--- | :--- | :--- | :--- |
| Real Gateway smoke | 缺部署 URL 与测试账号环境变量 | deployment owner | `npm run smoke:gateway` |
| authenticated conversation/chat UI smoke | 本地 routes 已实现，缺真实 Gateway 账号 | `apps/web/src/pages` | real browser flow smoke |
| Worker SQL runtime | 需要先观察 MVP 数据规模和调用协议 | storage worker | large history performance test |
| multi-tab writer | 需要选定 Web Locks 或 SharedWorker owner | storage runtime | two-tab concurrency test |
| upstream raw WS log | `resolved 2026-08-09`: canonical owner 已清除原始 payload 日志 | `im28-phone/packages/im-sdk` | shared SDK test + H5 `npm run verify` passed |
