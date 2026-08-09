# IM28 H5 Foundation Workset

| field | value |
| :--- | :--- |
| status | `active` |
| active_slice | `W6.a5-auth-tab-route-decomposition` |
| verification_floor | `npm run verify` plus local browser smoke |

## Workstream Ledger

| workstream | scope | owner | expected deliverable | verification | status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `W1` | 基线与执行治理 | docs | H5 SSOT 与 active trio | 文档交叉核对 | `done` |
| `W2` | workspace 与 Web SDK 基础 | web app + sdk | 可安装、可构建、可启动骨架 | `npm run verify`; browser smoke | `done` |
| `W3` | Gateway runtime | sdk runtime | 真实认证与连接链路 | targeted tests + manual smoke | `gated` |
| `W4` | 会话与文本消息 | feature + sdk | 核心聊天 MVP | tests + real flow smoke | `gated` |
| `W5` | 生产化门禁 | storage/runtime | Worker、多标签页与恢复策略 | browser matrix + regression | `gated` |
| `W6` | RN 页面 parity | web feature + sdk facade | RN 样式/资产/行为/API 的 React Router SPA 迁移 | source trace + visual/route/API evidence | `active` |

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
| `W4.a2-created-conversation` | code/verification | web sdk runtime | 新消息/会话事件落库、账号隔离、分页 HTTP 缺口恢复与 UI cache 刷新 | 5 focused tests + workspace verify | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-updates` | contract/code | web sdk runtime | 消息编辑、撤回、删除的 cursor 与 Repository 状态收敛 | sql.js + raw WebSocket integration | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-serialization` | architecture/code | web sdk sync | full sync/history/send/realtime 共享业务 operation queue | 3 delayed interleaving/failure regressions | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-closeout` | verification/docs | web sdk runtime + docs | W4.a2 证据、残留项与下一片回写 | `npm run verify` + real chat smoke | `blocked-external` | local closeout passed; real Gateway variables absent |
| `W5.a1-storage-boundary` | architecture | storage/runtime | Dedicated Worker RPC、lifecycle Web Lock 与 failure contract | architecture review + executable test plan | `done` | closed 2026-08-09 |
| `W5.a2-worker-runtime` | code/verification | storage worker | typed RPC/client、Worker-owned sql.js/IndexedDB、fatal-state discard | 7 adapter/protocol tests + 18/47 workspace verify + Worker build | `done-local` | closed 2026-08-09 |
| `W5.a3-multi-tab-writer` | code/verification | storage lifecycle | account-scoped lifecycle Web Lock、busy/unsupported UI state | 6 lock/lifecycle tests + 19/52 verify | `done-local` | closed 2026-08-09 |
| `W5.a3-browser-matrix` | deployment verification | storage runtime | real Worker/IndexedDB/Web Locks two-tab close/crash evidence | Chromium/Firefox/Safari matrix | `blocked-environment` | target browser harness available |
| `W5.a4-storage-operations` | code/verification | storage/runtime | quota、compaction、corruption rebuild workflow | large-history/quota/recovery evidence | `planned` | W5.a3 passed |
| `W6.a0-migration-contract` | contract/docs | docs + RN source inventory | 样式、资产、SDK/API、React Router 四类硬约束与验收门 | source-path cross-check | `done` | closed 2026-08-09 |
| `W6.a1-assets-theme` | code/docs | web styles/assets | 466 文件字节镜像、SHA-256 gate、完整 RN light/dark token foundation | `npm run assets:check`; CSS/source review | `done-foundation` | closed 2026-08-09 |
| `W6.a2-account-login-parity` | code/verification | web login + sdk facade | RN 账号登录布局、资产、协议状态、真实登录/条款 caller | 466 assets + 20/55 verify + dark mobile interaction/refresh/live-term smoke | `done-local/acceptance-gated` | exact viewport/theme + real login evidence available |
| `W6.a3-conversation-parity` | code/verification | web conversations + sdk facade | RN home shell/conversation list parity | 390x844 light/dark + 760px responsive + auth guard + cache composition test + verify | `done-local/acceptance-gated` | real account cache/sync/chat-back evidence available |
| `W6.a4-chat-parity` | code/verification | web chat + sdk facade | RN header/message list/composer parity | 390x844 light/dark + 760x900 responsive + guest guard + existing sync chain review + verify | `done-local/acceptance-gated` | approved account history/send/realtime/list-back evidence available |
| `W6.a5-auth-tab-routes` | design/code/verification | web app routes + features | remaining auth and contacts/calls/me capabilities as bounded route slices | source/API/route ledger, then per-slice deep-link/back/forward/auth-guard matrix | `active-decomposition` | W6.a4 local implementation passed；select one facade-backed bounded slice |
| `W6.closeout` | verification/docs | web app + sdk + docs | migrated route parity evidence and residual ledger | `npm run verify` + browser matrix + real Gateway flow | `planned` | W6.a2-a5 accepted |

## Active Slice Card

| field | value |
| :--- | :--- |
| slice_id | `W6.a5-auth-tab-route-decomposition` |
| goal | 冻结 remaining auth/primary tab 的有序 route ledger，并选择一个最多 3 个 API operation 的首个实现 slice |
| source_anchor | RN `AuthFlowScreen.tsx`; `screens/auth/types.ts`; `ChatHomeScreen.tsx`; `HomeTabBar.tsx` |
| target_owner | `apps/web/src/app/App.tsx`; `docs/rn-h5-migration-contract.md`; future feature owner + `@im28/im-sdk-web` facade |
| expected_deliverable | route/state/capability/dependency matrix；首片 source/API/route/acceptance card；不得一次恢复全部页面 |
| verification_shape | source trace + shared Web export/API owner trace + route URL/guard/back ownership review |
| stop_condition | missing API/shared facade or cross-capability dependency cannot fit bounded slice；记录 gap，不渲染无效 RN entry |
| residual_seed | `W6.closeout` and remaining ordered W6.a5 slices |

## Deferred Residuals

| item | reason_not_active | likely_owner | candidate_verification |
| :--- | :--- | :--- | :--- |
| Real Gateway smoke | 缺部署 URL 与测试账号环境变量 | deployment owner | `npm run smoke:gateway` |
| authenticated conversation UI smoke | RN core 与 route 已本地实现，缺真实 Gateway 账号 | `apps/web/src/pages/conversations` | cache-first/sync/chat-back real browser flow smoke |
| authenticated chat UI smoke | RN core 与 route 已本地实现，缺真实 Gateway 账号 | `apps/web/src/pages/chat` | history/send/realtime/list-back real browser flow smoke |
| Worker SQL runtime | `done-local`: production App Worker、RPC/fatal parity 与 Vite build passed | storage worker | real-browser DB open evidence joins W5.a3 |
| multi-tab writer | `done-local/gated-browser`: lifecycle owner 已接入，缺真实浏览器矩阵 | storage runtime | three-browser two-tab concurrency test |
| Remaining RN route surfaces | login/conversation/chat core 均已移除 generic 视觉；remaining auth/contacts/calls/me 尚未进入 bounded migration | `apps/web/src/app` + future feature owners | W6.a5 route/capability decomposition and per-slice evidence |
| upstream raw WS log | `resolved 2026-08-09`: canonical owner 已清除原始 payload 日志 | `im28-phone/packages/im-sdk` | shared SDK test + H5 `npm run verify` passed |
