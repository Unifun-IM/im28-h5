# IM28 H5 Foundation Status

- status: `active`
- current_step: `W6.a5.2.12 joined groups core implemented-local/acceptance-gated`
- next_step: `retain authenticated joined-group data/open-conversation and responsive light/dark/history as external acceptance gates；freeze the next RN source/API/route slice before implementation`
- blockers: `W5.a3 browser matrix remains blocked-environment; W3.real-gateway and final data-backed acceptance require Gateway test credentials`
- gate_state: `joined-group account cache/full-page sync, /contacts/groups React Router page, contacts entry and guest guard passed locally；authenticated data/open-conversation and visual/history evidence remain gated`
- latest_evidence: `2026-08-10 joined groups: SDK 31 files/97 tests and H5 joined-group view 5 tests passed；build:web synced packages/im-sdk, full H5 verify/build passed, anonymous deep link redirected to /auth/phone with zero console errors`

## Current Readout

| dimension | state | note |
| :--- | :--- | :--- |
| pack | `active` | W3/W4/W5 保留外部门；W6 RN parity 本地切片 active |
| `W1` | `done` | H5 规则、架构和存储 SSOT 已落库 |
| `W2` | `done` | H5 app、独立 multi-runtime SDK Git repository、Vite React Router App 与跨仓构建验证链已落地 |
| `W3` | `gated` | browser orchestration、account SQLite 与 privacy gate 已通过，等待真实 smoke |
| `W4` | `gated` | HTTP MVP、默认 routes、新消息/会话/update 与 same-tab ordering 已本地完成；真实 flow gated |
| `W5` | `gated` | W5.a1/W5.a2 done-local；W5.a3 code done-local，真实三浏览器矩阵 pending |
| `W6` | `active` | prior route cores/settings/onboarding code are done-local or implemented-local/acceptance-gated；valid onboarding context、cache/network and external browser/data gates remain open |

## Active Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.12-joined-groups-core` |
| goal | 迁移 RN“我的群聊”列表，通过当前账号 SQLite cache + `/v1/group/my/list` 全分页同步建立唯一列表主链 |
| source_anchor | RN `ContactGroupListScreen` + `contactGroupHelpers`；shared `GatewayHTTPClient.myGroupList` + `GroupRepository` |
| target_owner | `../im28-sdk/src/sync/joined-group-sync.ts` + `apps/web/src/pages/contacts/groups/**` + App route |
| expected_deliverable | authenticated cache read、paged remote replace、normalized group/role/status model、search/empty/error/loading states、conversation opening and contacts shortcut |
| verification_shape | cache/auth/pagination/dedupe/mapping/failure tests + pure view tests + Web typecheck/build + guest/responsive/theme/history smoke |
| stop_condition | no create-group、long-press menu、group manage/member mutation、page fetch、mock list、fallback success or duplicate storage owner |

## Residual Ledger

| item | type | note | seed_for_next_slice |
| :--- | :--- | :--- | :--- |
| Gateway runtime | verification | implementation 已完成；`W3.real-gateway` 缺真实 smoke 证据 | yes |
| Account SQLite lifecycle | code/verification | login/restore/open/migrate 与 sign-out/invalidation/close 已通过 Node + Chromium smoke | no |
| Upstream raw message log | code/privacy | canonical shared SDK 日志已清除，共享 SDK 与 H5 回归通过 | no |
| Unified SDK ownership | resolved | RN/Web SDK 已迁入独立 `im28-sdk`；共享 sync 位于 `src/sync`，应用内旧 package 已删除，Desktop driver port 已建立 | no |
| sync orchestration | code/design | HTTP MVP、新消息/会话串行落库、分页缺口恢复与页面 cache 刷新已完成 | no |
| message update semantics | contract/code | 独立 cursor、edit/delete-all、stale edit guard 与 recovery 已本地完成 | no |
| same-tab semantic locking | resolved | shared FIFO 覆盖 full sync/history/send/realtime，3 个交错/失败回归通过 | no |
| Worker execution | verification | production App 已显式注入 Worker；真实账号浏览器 open/migrate 待 W5.a3 harness/环境证据 | no |
| multi-tab writer | verification gate | lifecycle Web Lock 已本地实现，真实三浏览器 two-tab evidence 缺失 | yes |
| RN visual parity | migration | prior cores plus settings and onboarding core are local；valid onboarding visuals/data、network/cache keep explicit gates | yes |
| Onboarding acceptance | migration/verification | register/login split、memory-only pending secret、account marker、invite retry and profile core are local；valid new-account flow and approved profile update evidence absent | yes |
| Blacklist core | migration/verification | shared list/remove + Web sync/page/permission entry done-local；authenticated data/theme/history and approved remove proof absent | yes |
| Friend applications core | migration/verification | shared list/accept + Web sync/page/contacts entry implemented-local；authenticated data/theme/history and approved accept proof absent | yes |
| Group applications core | migration/verification | shared audit/accept/reject + Web group index/detail/contacts entry implemented-local；authenticated data/theme/history and approved handle proof absent | yes |
| Joined groups core | migration/verification | shared `GroupRepository` cache + `myGroupList` full sync + Web list/contacts entry implemented-local；authenticated group data/open-conversation and responsive theme/history proof absent | yes |
| General settings residual | migration/contract | version done-local；network blocked-browser；cache blocked-storage；real update response、notification/permission writes and cross-browser proof pending | yes |
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
| closed_slice | `W6.a5.2.12-joined-groups-core local implementation` |
| deliverable_verdict | `implemented-local/acceptance-gated` |
| gate_verdict | `contacts shortcut、/contacts/groups React Router route、cache-first authenticated facade、RN list/search/status/role/empty/error/loading states and real conversation lookup are implemented；4 facade + 5 view tests and full verify passed` |
| debt_or_drift | `authenticated group data、conversation open and responsive/light/dark/history proof remain unavailable without an approved account；create group、long-press actions、group manage/member mutations are explicitly deferred` |
| next_activation_decision | `retain joined-groups real data/open proof as acceptance gate；continue only with a separately frozen RN source/API/route slice, without reopening SDK、cache or page ownership` |
