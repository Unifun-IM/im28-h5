# IM28 H5 Foundation Plan

| field | value |
| :--- | :--- |
| status | `active` |
| family | `h5-foundation` |
| root | `docs/active/h5-foundation/` |
| governing_docs | `AGENTS.md`; `architecture.md`; `docs/web-im-storage.md` |
| verification_floor | `npm run verify` from `im28-h5/` plus a local browser smoke for Web App slices |

## Goal

- 建立可独立安装、构建和持续演进的 `im28-h5` npm workspace。
- 建立浏览器 SDK owner，复用 `@im28/im-sdk/web` 并承接 SQLite/IndexedDB、Gateway 和同步运行时适配。
- 以纵向切片逐步交付认证、会话和消息能力，每个切片都有明确验证和残留项。

## Scope

- `apps/web/**`：Vite + React H5 应用壳及后续页面能力。
- 页面切换统一由 React Router 管理，页面组件不自行操作 History API。
- `packages/im-sdk-web/**`：浏览器 SDK、存储适配和后续 Gateway runtime。
- `docs/active/h5-foundation/**`：当前阶段的 plan/status/workset 真相源。
- `architecture.md`、`README.md`、`docs/web-im-storage.md`：稳定边界和已实现事实。

## Non-goals

- 不在骨架阶段实现登录、WebSocket、消息收发、媒体、RTC、通知或完整同步。
- 不复制 `im28-phone/packages/im-sdk` 已有的 DTO、Repository、Gateway client 和数据库 contract。
- 不在未完成 Worker 与多标签页 writer 设计前声明浏览器存储达到生产级并发能力。
- 不改变 `im28-phone` React Native 应用或原生工程。

## Current Baseline

| area | current truth | source |
| :--- | :--- | :--- |
| Web application | Vite + React Router 根壳与 404 返回路由已实现 | `apps/web`; `architecture.md` |
| shared SDK | `@im28/im-sdk/web` 已提供平台中立 contract、Repository 和 Gateway client | `../im28-phone/packages/im-sdk/src/web.ts` |
| Web storage/sync | `sql.js + IndexedDB` adapter、auth-bound account lifecycle 与 HTTP conversation/message sync 已实现；当前 workspace 共 31 个聚焦测试 | `packages/im-sdk-web/src/storage/**`; `packages/im-sdk-web/src/sync/**` |
| Gateway runtime | 本地 auth/realtime/account DB 实现与验证已通过；真实环境 smoke 保留为 deployment gate | `docs/runtime-contracts/web-gateway-runtime.md` |
| package shape | npm workspace 已分为 `apps/web` 与 `packages/im-sdk-web` | `package.json` |

## Workstreams

### `W1` 基线与执行治理

- focus:
  - 固化 Web 架构方向、存储决策和可续做 trio。
- exit:
  - `AGENTS.md`、架构、存储 SSOT 与 active trio 可被下一轮只读恢复。

### `W2` Workspace 与浏览器 SDK 基础

- focus:
  - 建立 npm workspace、Vite React App、React Router 路由 owner、独立 Web SDK package。
  - 将现有 SQLite/IndexedDB 实现迁入 Web SDK owner，并由 App 完成最小编译接入。
- exit:
  - 根级 `npm run verify` 覆盖 App 与 SDK，开发服务器可在浏览器打开。

### `W3` Gateway Runtime 纵向切片

- focus:
  - 建立认证 token owner、Gateway HTTP/WebSocket runtime、事件归一化和重连边界。
- exit:
  - 真实 Gateway 登录和连接链路无 fake-success，并有聚焦验证证据。

### `W4` 会话与文本消息 MVP

- focus:
  - 打通同步、会话列表、消息历史、文本发送和实时接收。
- exit:
  - 真实数据链路可完成核心聊天闭环，SQLite 仍是可重建缓存而非远端真相源。

## Cross-workstream Gate

| gate | blocks | does_not_block |
| :--- | :--- | :--- |
| `W3.real-gateway` | W3 closeout、W4 final acceptance、真实聊天 smoke | W4 contract、mapping、sync、UI 本地实现与 focused verification |

W4 本地实现以 W3 code/contract/storage gates 为 entry；缺少部署 URL 或测试账号不能被解释为 W3/W4 已验收。

### `W5` 生产化门禁

- focus:
  - Worker 执行、多标签页 writer 所有权、配额/清理策略、恢复与浏览器兼容验证。
- exit:
  - 已知存储并发和主线程风险被解决或以明确产品约束验收。

## Entry Criteria

- H5 迁移方向和 `sql.js + IndexedDB` 存储基础已确定。
- 共享 `@im28/im-sdk/web` 可作为浏览器 package 的底层 contract。
- 用户已明确授权先创建项目骨架与 SDK。

## Exit Criteria

- `apps/web` 和 `packages/im-sdk-web` owner 边界稳定。
- 登录、连接、会话和文本消息形成真实纵向链路。
- 根级验证、浏览器冒烟和关键持久化回归均有证据。
- 剩余媒体、RTC、通知或生产化能力已进入新执行包或显式 backlog。

## Verification Ladder

1. package scoped:
   - `npm run typecheck -w @im28/im-sdk-web`
   - `npm run test -w @im28/im-sdk-web`
   - `npm run build -w @im28/im-sdk-web`
2. Web App:
   - `npm run typecheck -w @im28/h5-web`
   - `npm run build -w @im28/h5-web`
3. workspace crossing:
   - `npm run verify`
4. runtime closeout:
   - 启动 `npm run dev`，使用浏览器检查首屏、控制台和静态资源。
5. critical IM flow:
   - 使用真实 Gateway 环境进行登录、连接、收发、恢复和缓存一致性手工验证。

## Stop Conditions

- Gateway URL、认证协议或 token 所有权存在多个同等可行方案且本地契约无法判定。
- 下一步要求修改 `im28-phone` 的共享 SDK contract，超出当前 H5 package 边界。
- 生产数据或凭据成为唯一验证前提，但当前环境未提供。
- 新需求属于媒体、RTC、通知等独立能力族，应建立新的执行包。
