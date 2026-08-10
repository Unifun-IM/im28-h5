# IM28 H5 Foundation Plan

| field | value |
| :--- | :--- |
| status | `active` |
| family | `h5-foundation` |
| root | `docs/active/h5-foundation/` |
| governing_docs | `AGENTS.md`; `architecture.md`; `docs/rn-h5-migration-contract.md`; `docs/web-im-storage.md` |
| verification_floor | `npm run verify` from `im28-h5/` plus a local browser smoke for Web App slices |

## Goal

- 建立可独立安装、构建和持续演进的 `im28-h5` npm workspace。
- 在独立 `im28-sdk` Git 仓库建立浏览器平台 owner，以 `@im28/im-sdk/core` 复用公共逻辑，并通过 `@im28/im-sdk/web` 交付 SQLite/IndexedDB、Gateway 和同步运行时适配。
- 以纵向切片逐步交付认证、会话和消息能力，每个切片都有明确验证和残留项。
- 以 `im28-phone` 为视觉、资产、页面行为和能力源，按 React Router SPA 路由逐页完成可追踪 parity 迁移。

## Scope

- `apps/web/**`：Vite + React H5 应用壳及后续页面能力。
- 页面切换统一由 React Router 管理，页面组件不自行操作 History API。
- RN 样式、静态资产、页面状态与 API 能力只做浏览器适配，不另行设计。
- `../im28-sdk/src/platforms/web/**`：浏览器 SDK、存储适配和后续 Gateway runtime。
- `docs/active/h5-foundation/**`：当前阶段的 plan/status/workset 真相源。
- `architecture.md`、`README.md`、`docs/web-im-storage.md`：稳定边界和已实现事实。

## Non-goals

- 不把当前可运行 H5 页面骨架视为 RN 视觉/交互迁移完成。
- 不复制 `im28-sdk` 已有的 DTO、Repository、Gateway client 和数据库 contract。
- 不直接复用 React Native runtime/`StyleSheet`，不在页面中调用 Gateway/OpenAPI，也不以第三方近似图标替换已有 RN 资产。
- 不在 Worker 与多标签页 writer 实现及浏览器并发证据完成前声明浏览器存储达到生产级并发能力。
- 不改变 `im28-phone` React Native 应用或原生工程。

## Current Baseline

| area | current truth | source |
| :--- | :--- | :--- |
| Web application | Vite + React Router 根壳、404 与 authenticated `PrimaryTabsLayout` 已实现 | `apps/web`; `architecture.md` |
| RN parity foundation | 迁移合同已冻结；466 个资产按字节同步；auth entry、conversation、chat、contacts/contact-profile、friend/group applications、calls、me/profile/security、settings、global tab shell 与 onboarding core 均为 local/acceptance-gated；valid authenticated data/mutations、onboarding context、cache/network blocked or gated | `docs/rn-h5-migration-contract.md`; `apps/web/src/assets/rn`; `apps/web/src/styles/rn-theme.css` |
| shared SDK | `@im28/im-sdk/core` 提供平台中立 contract、Repository 和 Gateway client | `../im28-sdk/src/core.ts` |
| Web SDK/runtime | `sql.js + IndexedDB`、login/register/account-credential auth-bound lifecycle、notification/permission settings facade、public platform-term/client-version adapters、共享 mutation queue、HTTP/realtime sync、remote contact list/user search、peer profile/conversation/apply、call-record cache/sync/delete、current-profile read/update 已实现；当前 SDK Web suite 共 103 个测试 | `../im28-sdk/src/platforms/web/runtime/**`; `../im28-sdk/src/platforms/web/storage/**`; `../im28-sdk/src/sync/**` |
| Gateway runtime | 本地 auth/realtime/account DB 实现与验证已通过；真实环境 smoke 保留为 deployment gate | `docs/runtime-contracts/web-gateway-runtime.md` |
| package shape | H5 workspace 仅保留 `apps/web`；浏览器 SDK 已迁入独立兄弟 Git 仓库 | `package.json`; `../im28-sdk/package.json` |

## Workstreams

### `W1` 基线与执行治理

- focus:
  - 固化 Web 架构方向、存储决策和可续做 trio。
- exit:
  - `AGENTS.md`、架构、存储 SSOT 与 active trio 可被下一轮只读恢复。

### `W2` Workspace 与浏览器 SDK 基础

- focus:
  - 建立 npm workspace、Vite React App、React Router 路由 owner，并把 Web runtime 收敛进统一 `@im28/im-sdk` 多入口包。
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
| `W3.real-gateway` | W3 closeout、W4/W6 data-backed final acceptance、真实聊天 smoke | W4 contract/sync 与 W6 source mapping/asset/theme/local UI implementation |
| `W5.browser-matrix` | storage production acceptance | W6 local style/route/API implementation |

W4 本地实现以 W3 code/contract/storage gates 为 entry；缺少部署 URL 或测试账号不能被解释为 W3/W4 已验收。

### `W5` 生产化门禁

- focus:
  - Worker 执行、多标签页 writer 所有权、配额/清理策略、恢复与浏览器兼容验证。
  - 既定顺序：`W5.a1` 冻结 Dedicated Worker + lifecycle Web Lock 契约；`W5.a2` 实现 Worker runtime；`W5.a3` 实现跨 tab owner；`W5.a4` 处理配额与恢复。
- exit:
  - 已知存储并发和主线程风险被解决或以明确产品约束验收。

### `W6` RN 页面 Parity 迁移

- focus:
  - 以 RN screen/component/theme/assets/service 为源，按 auth entry、conversation、chat、contacts、global tab shell、remaining auth/tabs 的顺序迁移。
  - 页面与全屏状态使用 React Router SPA；UI 只调用 `@im28/im-sdk/web` facade。
  - onboarding 按 `route/state owner -> invite register retry -> complete-profile core` 推进；pending verification secret 只驻留内存，avatar/contact 缺口独立冻结。
  - 最近完成 `W6.a6.1-chat-media-read-core` 本地实现：复用已缓存 Gateway payload，迁移图片全屏预览、单实例语音播放/停止和视频全屏播放；文件下载、媒体发送上传、已读/连播与 RTC 延期，真实媒体数据保留为验收门。
  - 最近完成 `W6.a6.2-chat-image-file-send-core` 本地实现：相册图片和普通文件走三操作真实链，shared SDK 持有 optimistic SQLite 状态机，Web adapter 持有 OSS multipart I/O，H5 只持有选择器和 RN composer presentation；真实消息传输等待明确授权。
  - 最近完成 `W6.a6.3-chat-album-video-send-core` 本地实现：RN `mixed` 相册的视频分支已接入同一 shared 上传/状态 owner；Web 只读取浏览器视频元数据，视频 body、500 MB 上限和 OSS snapshot 规则归 shared SDK；真实上传/发送保留显式授权验收门。
  - 最近完成 `W6.a6.4-chat-voice-send-core` 本地实现：RN 按住录音、56px 上滑取消、2–60 秒约束与 audio send 已接入；共享 SDK 持有 Gateway body/SQLite 状态，Web adapter 仅持有 `getUserMedia/MediaRecorder/Blob` 生命周期；真实麦克风和消息传输保留显式授权验收门。
  - `W6.a6.5-chat-system-emoji-core` 已完成本地闭环：RN 第一套 Unicode 表情面板、当前选区插入/替换、完整 grapheme 退格和 21 项最近使用均已接入既有文本草稿；未发送真实消息。
  - `W6.a6.6-chat-illustrated-emoji-contract-freeze` 已完成：135 个 stable preset identity、133 个 fallback、UTF-16 entity、Gateway `packID/presetID`、SQLite/cache/render/failure contract 和 owner map 已冻结。
  - 当前 `W6.a6.6.1-shared-preset-emoji-core`：先在 `im28-sdk` 建立 DTO/descriptor/document/entity canonical owner，闭合 Web text send/map/SQLite，并把 RN 重复算法收敛为 thin adapter；完成后才进入 H5 illustrated UI。
- exit:
  - 已迁移页面具有源映射、RN 资产、明暗主题、响应式、路由和真实 API 证据；不存在 generic placeholder 视觉或第二条 API 链。

## Entry Criteria

- H5 迁移方向和 `sql.js + IndexedDB` 存储基础已确定。
- 共享 `@im28/im-sdk/core` 是浏览器 runtime 的唯一底层 contract。
- 用户已明确授权先创建项目骨架与 SDK。
- 用户已明确要求所有样式、资产、SDK/API 调用和页面切换分别以 RN、Web SDK facade 和 React Router SPA 为唯一来源。

## Exit Criteria

- `apps/web` 和 `../im28-sdk/src/platforms/web` owner 边界稳定。
- 登录、连接、会话和文本消息形成真实纵向链路。
- 已迁移页面通过 `docs/rn-h5-migration-contract.md` 的视觉、资产、API 和路由 parity gates。
- 根级验证、浏览器冒烟和关键持久化回归均有证据。
- 剩余媒体、RTC、通知或生产化能力已进入新执行包或显式 backlog。

## Verification Ladder

1. package scoped:
   - `npm --prefix ../im28-sdk run typecheck:web`
   - `npm --prefix ../im28-sdk run test:web`
   - `npm --prefix ../im28-sdk run build:web`
2. Web App:
   - `npm run typecheck -w @im28/h5-web`
   - `npm run build -w @im28/h5-web`
3. workspace crossing:
   - `npm run verify`（包含 466 个 RN 资产逐文件 SHA-256 校验）
4. runtime closeout:
   - 启动 `npm run dev`，使用浏览器检查首屏、控制台和静态资源。
5. critical IM flow:
   - 使用真实 Gateway 环境进行登录、连接、收发、恢复和缓存一致性手工验证。

## Stop Conditions

- Gateway URL、认证协议或 token 所有权存在多个同等可行方案且本地契约无法判定。
- 下一步要求修改 `im28-phone` 的共享 SDK contract，超出当前 H5 package 边界。
- RN 页面没有稳定视觉/行为源，或所需 API 在 shared Web entry 中无可验证等价能力。
- 生产数据或凭据成为唯一验证前提，但当前环境未提供。
- 新需求属于媒体、RTC、通知等独立能力族，应建立新的执行包。
