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

## W6.a6.20.149 H5 Interaction Parity Closeout

> INTERACTION AXIOM: Navbar、Toast、目标选择、二维码、名片、录音与通话只复刻 frozen RN production contract；H5 页面不得复制 shared IM mutation、DTO、权限或状态机。

| slice | owner | deliverable | gate | status |
| :--- | :--- | :--- | :--- | :--- |
| `.149.1` | H5 interaction/chat UI | 多选 Navbar、左侧 selector、双操作底栏、全局 Toast foundation | focused + typecheck + build + browser | `local-complete/browser-session-gated` |
| `.149.2` | H5 picker/QR UI | 名片/二维码单选好友发送；个人/群二维码共用全局 modal | focused + typecheck + mobile/dark browser | `local-complete/browser-session-gated` |
| `.149.3` | H5 chat/settings UI | 名片点击、单聊设置、定时删除、input focus | focused + route/browser | `done-local/browser-session-gated` |
| `.149.4` | H5 call/recorder consumers | RN 同源 RTC UI、录音取消动效与真实 runtime chain | focused + media/browser/external RTC | `done-local/external-rtc-gated` |
| `.149.5a` | H5 operation feedback | 聊天、分享、二维码、资料、账号、通知、联系人与申请的瞬时结果收敛到唯一 Toast owner | consumer contract + full tests + typecheck + build + guest browser | `local-complete/authenticated-action-gated` |
| `.149.5b` | H5 operation feedback | 剩余列表、群管理、群角色、群资料、群生命周期、建群、成员、通话记录和媒体操作拆分 load error 与 operation result | inventory + focused/full verification | `local-complete/authenticated-action-gated` |
| `.149.6` | H5 chat forward orchestration | 多选目标确认进入单个目标聊天并生成待发送转发草稿；仅 Composer 点击发送调用 shared forward | no-auto-send regression + full tests + authenticated browser | `completed/send-action-gated` |
| `.149.7` | H5 group owner lifecycle UI | 旧显式 transfer-first 方案，已由 `.149.71` 按 frozen RN 真实合同替代 | historical route-intent regression | `superseded-by-.149.71` |
| `.149.8` | SDK group detail + H5 conversation delete UI | 群聊“为我和所有群成员删除”只按群详情 `can_clear_message` 显式授权；确认层全宽贴底 | SDK/H5 focused + full tests + authenticated permission browser | `completed/destructive-action-gated` |
| `.149.9` | H5 RTC startup composition | 复用 shared call control/LiveKit owner；只有启动成功后进入活动页，Gateway 失败留在来源页并使用错误 Toast | SDK RTC + H5 contract + typecheck/build + controlled real start | `completed/client-converged/external-rtc-gated` |
| `.149.10` | RN/H5 parity inventory | 重新按 frozen RN route/feature/operation 建立 H5 complete/partial/missing/acceptance-gated 清单并选择下一片 | read-only source/route/owner audit | `completed/read-only` |
| `.149.11` | H5 settings operation feedback | permission update、version check、sign-out 使用全局 Toast；load/runtime error 保持结构 owner | focused contract + full verification | `local-complete/authenticated-action-gated` |
| `.149.12` | H5 chat settings structure | 将 539 行 `ChatSettingsPage` 按业务编排与纯展示 responsibility 拆分，保持 route 与 shared owner 不变 | focused behavior + full verification + authenticated readonly browser | `completed/no-behavior-change` |
| `.149.13` | H5 forward preview UI | 转发预览复刻 frozen RN 生产结构，复用 shared message view；只修改草稿选择，不自动发送 | focused/full verification + authenticated readonly browser | `completed/send-result-gated` |
| `.149.14` | H5 forward composer summary | 转发草稿按来源消息发送者去重显示“来自：A，B”，本人、单聊和群成员名称遵循 frozen RN 展示合同 | focused/full verification + authenticated readonly browser | `completed/send-result-gated` |
| `.149.15` | H5 voice playback acceptance | 使用真实缓存语音验证浏览器媒体 owner 的播放、活动态和自然结束回落；不上传、不发送、不修改消息 | authenticated natural-data browser + focused/typecheck | `completed/chromium-pass/browser-matrix-gated` |
| `.149.16` | H5 forward-origin display name | 新生成的转发来源头消费来源会话已解析名称，遵循备注/群昵称/昵称优先级；历史 `forwardOrigin` 快照保持不变 | focused/full verification + authenticated readonly browser | `completed/send-result-gated` |
| `.149.17` | H5 outgoing voice direction | 发送方语音复用 frozen RN 的反向横排与 180° 声波方向；接收方及播放 owner 不变 | typecheck + build + authenticated browser computed style | `completed/browser-pass` |
| `.149.18` | H5 recorder/group-card parity | 录音 HUD 使用真实 Web Audio 电平并复刻 RN 尺寸/取消态；群名片实时刷新入群关系，已加入直达 shared 群会话，未加入进入受控申请页 | focused + typecheck + build + authenticated card browser | `completed/card-browser-pass/physical-record-gated` |
| `.149.19` | H5 forward composer convergence | `ChatForwardComposer` 只保留摘要/预览；转发条进入唯一 `ChatComposer`，复用其输入、表情和显式发送链 | focused + typecheck + build + authenticated readonly browser | `completed/structural-pass/forward-runtime-gated` |
| `.149.20` | H5 group-member picker parity | 邀请/移除成员保持可追踪 SPA route，并共用群设置页上的 100% × 60dvh 底部选择弹窗 | focused + full tests + typecheck + build + authenticated readonly browser | `completed-local/browser-readonly-pass/mutation-gated` |
| `.149.27` | H5 conversation-list state owner | 普通会话页 cache-first、归档摘要、realtime 重读、presence 刷新进入唯一状态 hook；页面保留展示、路由、未读滚动和现有 action owner | focused + full tests + typecheck + build + authenticated readonly browser | `completed-local/structural-pass/browser-readonly-pass` |
| `.149.68` | H5 ordinary-image production acceptance | 精确授权单张图片走生产上传/发送、会话摘要、刷新回读和预览；不扩大到第二端 realtime 或其他媒体 | exact mutation + focused ratio tests + authenticated Chromium | `completed/receiver-realtime-gated` |
| `.149.69` | H5 ordinary-image cross-browser acceptance | 复用已保留真实图片，只读验证 Firefox/WebKit 缩略图比例、全屏预览、刷新回读与运行时错误边界 | isolated production auth + computed metrics + screenshots + focused tests | `completed-image-readonly/runtime-clean-pass` |
| `.149.70` | Web cross-browser Gateway transport audit | 定位 WebKit application-unread CORS 与 Firefox pending-call network failure 的 endpoint/header/config owner；禁止页面吞错或假成功 | OPTIONS/actual POST + WebKit header/auth probes + corrected browser rerun | `completed-audit/harness-false-positive-closed` |
| `.149.71` | SDK/H5 group-owner leave parity | 群主无管理员时阻断并引导管理员设置；有管理员时展示最早添加者并单次 leave，由 Gateway 自动转移 | frozen RN/Figma + SDK tests/typecheck/build:web + H5 focused/typecheck/build + authenticated readonly browser | `completed-local/has-admin-browser-pass/no-admin-and-destructive-gated` |
| `.149.72` | H5 group-state owner browser acceptance | 复用真实登录态只读验证已加入群 cache/search/菜单与群成员角色/presence/search/index，不执行群 mutation | authenticated production DOM + 382px overflow/console evidence | `completed-readonly/group-mutations-gated` |
| `.149.73` | H5 call-record activation audit | 用当前真实登录态复核通话记录同步后数据、筛选/搜索空态与运行时健康；无自然记录时禁止伪造详情证据 | authenticated production DOM + 382px overflow/console evidence | `audited-empty/natural-call-data-gated` |
| `.149.74` | H5 verification-history readonly acceptance | 复用真实好友申请历史验证分组、来源/文案/终态、资料进入和来源返回；群申请空态只证明运行健康 | authenticated production DOM + route round-trip + 382px overflow/console evidence | `completed-readonly/pending-actions-gated` |
| `.149.75` | H5 verification dark readonly acceptance | 复用既有显示偏好验证好友历史、群验证聚合与单群申请空态的 dark token/runtime；验收后恢复 light | authenticated production DOM + theme/computed-color + 382px overflow/console evidence | `completed-dark-readonly/desktop-gated` |
| `.149.76` | H5 verification desktop responsive regression | 修复真实 1280px 验收发现的验证中心/单群申请 Surface 全宽回归；保持移动端满宽与既有 shared read owner | CSS contract + H5 typecheck + authenticated 1280x800 dark/382x786 light geometry/reload evidence | `completed-responsive-readonly/pending-actions-and-gateway-gated` |
| `.149.77` | H5 create-group desktop responsive regression | 修复真实 1280px 验收发现的建群主体与既有 Footer/复核层宽度失配；保持 shared 人数规则和 create transaction 不变 | CSS contract + focused/typecheck + authenticated 1280x800 dark/382x786 light selection/review geometry | `completed-responsive-readonly/create-and-device-gated` |
| `.149.78` | SDK/H5 conversation full refresh + member leave parity | 会话列表保持 SQLite 首屏，首屏后台校准与下拉刷新强制走 `postV1ConversationList` 全量快照且仅明确成功数据替换缓存；普通成员退出复用 RN 两种清理选择 | SDK/H5 focused + transport + typecheck/build:web + authenticated readonly member sheet | `completed-local-readonly/destructive-and-second-account-gated` |
| `.149.79` | H5 migration closeout SSOT reconciliation | 把 `.149.78` 的 canonical owner、测试角色、浏览器能力边界和 activation residual 同步到 PLAN/CLEANUP/INVENTORY；不重复实现或执行 mutation | docs cross-reference + anti-mock/owner scan + diff check | `completed-docs/no-new-activation` |
| `.149.80` | SDK/H5 Web full regression closeout | 在 H5 授权边界内执行 SDK Web 全量测试、runtime boundary、assets、两侧 typecheck 与 H5 production build；不编译/同步 RN/Desktop | 101 files/431 tests + 466 assets + typecheck + build + diff check | `completed-regression/no-new-activation` |
| `.149.81` | H5 PC pointer conversation refresh | 扩展既有 `usePullRefresh` 平台适配器，使 `platform=pc` 鼠标主键下拉与 Touch Events 共用同一阈值并调用唯一会话状态 owner；不复制同步、DTO 或缓存逻辑 | focused/full H5 tests + typecheck/build + authenticated PC mouse drag | `completed-pc-browser-pass/physical-touch-gated` |
| `.149.82` | H5 global PC pull-refresh convergence | 让全部 17 个生产 `usePullRefresh` 消费者接入同一组 mouse Pointer handlers，并移除页面祖先 pointer capture 以保护行长按和按钮点击；各页面刷新动作与 shared owner 不变 | global consumer contract + full H5 tests + typecheck/build + authenticated create-group mouse/click smoke | `completed-global-pc-browser-pass/physical-touch-gated` |
| `.149.94` | H5 migration final local closeout audit | 在不执行业务 mutation 的边界内复核反 mock/fake-success、页面 Gateway/SQL 边界、重复/孤立 owner、生产 LoC、临时标记、全量测试与生产构建 | H5 182 files/589 tests + typecheck + 466 assets + 1242-module build + source/import/diff audit | `completed-local/P0-P1-zero/external-activation-gated` |
| `.149.95` | H5 production vendor chunk convergence | 仅在 Vite/Rolldown 构建层拆出 React、Zod 与二维码 vendor，降低主应用和 shared runtime 首屏 chunk，不移动任何业务或 SDK owner | H5 182 files/589 tests + typecheck + 466 assets + 1242-module build + production preview/chunk HTTP | `completed-local/vendor-chunks-converged/livekit-warning-retained` |
| `.149.96` | H5 personal QR Safari download acceptance | 复用唯一 `QRCodeDisplay` 与浏览器 PNG 导出 owner，在真实 system Safari 完成个人二维码落盘、文件合同和业务 payload 反解；不修改业务代码或执行消息/关系 mutation | authenticated Safari + PNG metadata + Vision QR decode + exact-file cleanup | `completed-production/local-file-decoded` |
| `.149.97` | H5 ordinary video/file dual-account acceptance | 在用户确认后向真实单聊发送一个普通文件和一个普通视频，验证接收端活动聊天 WebSocket 即时更新、双端 SQLite 刷新回读及会话摘要收敛 | exact mutation authorization + isolated receiver origin + active-chat DOM + reload/list-back evidence | `completed-production/dual-account-realtime-persisted` |
| `.149.98` | H5 ordinary video/file cross-browser acceptance | 复用 `.149.97` 保留的真实文件和视频，只读验证 Firefox/WebKit 文件卡片、视频实际播放、刷新回读与运行时错误边界 | isolated production auth + real media timeline + screenshots + reload/runtime evidence | `completed-readonly/firefox-webkit-playback-pass` |
| `.149.99` | H5 ordinary video/file system Safari acceptance | 复用同一真实文件和视频，在 macOS system Safari 只读验证卡片、视频实际播放、刷新回读与像素证据 | authenticated system Safari + playback frame + reload/runtime evidence | `completed-readonly/system-safari-playback-pass` |
| `.149.32` | H5 joined-groups state owner | 已加入群 cache-first/刷新、群会话解析、长按动作与退群事务进入唯一 Hook；页面保留 auth guard、下拉手势和 presentation | focused + full tests + verify + readonly browser | `completed-local/structural-pass/browser-readonly-pass` |
| `.149.33` | H5 group-members state owner | 群会话解析、群/成员 cache-first 同步、请求代次、搜索投影与 presence observation 进入唯一 Hook；页面保留路由、下拉手势、索引 DOM 和 presentation | focused + full tests + verify + readonly browser | `completed-local/structural-pass/browser-readonly-pass` |
| `.149.34` | H5 chat-card presentation owner | 名片 JSX、头像 fallback 与可访问名称进入独立 presentation；`ChatMessageContent` 只保留既有消息类型分发和页面动作透传 | focused + full tests + verify + prior natural-data card proof | `completed-local/structural-pass` |
| `.149.35` | H5 chat-media presentation owner | 通话/图片/视频/语音/文件 JSX 进入独立 presentation；媒体预览、播放、URL/尺寸与页面动作继续使用既有 owner | focused + full tests + verify + prior natural-data voice proof | `completed-local/structural-pass` |
| `.149.36` | H5 chat-text presentation owner | 引用/普通文本/系统/不支持消息 JSX 进入独立 presentation；引用解析、实体 renderer 与页面动作继续使用既有 owner | focused + full tests + verify + structural closeout | `completed-local/structural-pass` |
| `.149.37` | H5 chat-page surface owner | Header、消息区、Composer 与弹层 JSX 进入唯一 Surface；页面只保留 Router/runtime/hooks 编排 | focused + full tests + verify + structural closeout | `completed-local/structural-pass` |
| `.149.38` | H5 chat-composer submission owner | 转发、编辑、组合媒体、引用、提及与普通文本的提交顺序进入唯一 Hook；Composer 保留草稿/面板状态和视图组合 | chat-domain + full tests + verify + structural closeout | `completed-local/structural-pass` |
| `.149.39` | H5 pending-forward recovery owner | 稳定来源 ID、cache 恢复、来源会话/群成员名称增强和异步隔离进入唯一 Hook；转发选择/目标/发送与 Router 保持原 owner | chat-domain + full tests + verify + structural closeout | `completed-local/structural-pass` |
| `.149.40` | H5 chat-bubble chrome owner | sending/pending/failed 状态、shared retry capability 消费和 RN 双主题尾角进入唯一 presentation owner；消息编排与 retry action 保持原 owner | chat-domain + full tests + verify + structural closeout | `completed-local/structural-pass` |
| `.149.41` | H5 chat-message-view primitives owner | unknown payload 收窄与纯展示格式化进入独立 primitive owner；`getChatMessageView` 保持唯一 contentType dispatcher | chat-domain + full tests + verify + structural closeout | `completed-local/structural-pass` |
| `.149.42` | H5 conversation-preview owner | 草稿、消息类型、mention 与群发送者摘要进入独立 preview owner；`conversation-list-view` 只保留列表 metadata | conversations-domain + full tests + verify + structural closeout | `completed-local/structural-pass` |
| `.149.43` | H5 chat-voice recorder platform owner | 浏览器麦克风、MediaRecorder、MIME 与 track cleanup 进入独立 platform owner；会话 exactly-once terminal 保持 recorder owner | chat-domain + full tests + verify + structural closeout | `completed-local/structural-pass` |
| `.149.44` | H5 contact-profile surface owner | 联系人资料 Header、hero、快捷动作与资料卡片进入唯一 Surface；页面保留 runtime/state/router/dialog/actions | contacts-domain + full tests + verify + structural closeout | `completed-local/structural-pass` |
| `.149.45` | H5 chat-settings data owner | 会话、群资料与成员 cache-first/完整同步进入唯一 Hook；页面保留 Router、toast 和危险 mutation | chat-domain + full tests + verify + structural closeout | `completed-local/structural-pass` |
| `.149.46` | H5 app-route owner | 根 provider 装配、唯一 Routes 组合、通用域与聊天域路由账本分离；路径、懒加载与 fallback 不变 | route contracts + full tests + typecheck + verify + structural closeout | `completed-local/structural-pass` |
| `.149.47` | H5 incoming-call presentation owner | 来电资料恢复、banner/fullscreen/floating 形态、铃声与 autoplay 恢复进入唯一 Hook；Provider 保留接听/拒绝、媒体和终态信令 | call contracts + full tests + typecheck + verify + structural closeout | `completed-local/structural-pass` |
| `.149.48` | H5 call-context contract owner | 通话公共 view/snapshot/context/hook 从生命周期 Provider 分离，经 runtime facade 唯一暴露；RTC 时序不移动 | call contracts + full tests + typecheck + verify + structural closeout | `completed-local/structural-pass` |
| `.149.49` | H5 remote-terminal lifecycle owner | 当前 callID 匹配、六类终态白名单及 SDK terminal -> 挂断音 -> dispose -> replace 时序进入唯一 Hook；Provider 保留错误呈现和 owner 编排 | call contracts + full tests + typecheck + verify + structural closeout | `completed-local/structural-pass` |
| `.149.50` | H5 outgoing-call startup owner | 登录/待处理来电/重复启动守卫、媒体 owner 创建、stale 清理与 start 后状态/route 提交进入唯一 Hook；Provider 仅注入活动生命周期依赖 | call contracts + full tests + typecheck + verify + structural closeout | `completed-local/structural-pass` |
| `.149.51` | H5 active-call control/cleanup owner | dispose、媒体操作错误收敛、结束返回、DOM 媒体绑定及 logout/unmount cleanup 进入唯一 Hook；Provider 保留来电动作与 Context/Overlay 组合 | call contracts + full tests + typecheck + verify + structural closeout | `completed-local/structural-pass` |
| `.149.52` | H5 chat-page CSS owner | 唯一超千行 chat stylesheet 按页面、消息、Composer、状态责任拆分；原入口成为顺序稳定 facade | mechanical selector/declaration compare + focused/full/typecheck/build + structural closeout | `completed-local/structural-pass` |
| `.149.53` | H5 chat-page CSS visual acceptance | 复用现有登录态，对拆分后的聊天页执行移动/桌面与亮/暗主题只读视觉门禁 | real runtime screenshot + overflow/console/layout evidence + closeout | `completed-local/browser-readonly-pass` |
| `.149.54` | H5 rich-message CSS natural-sample acceptance | 复用当前已读单聊中的名片、语音与转发自然样本，验证 message/composer CSS owner | real cached message DOM + light/dark mobile screenshots + overflow/console evidence | `completed-local/browser-readonly-pass` |
| `.149.55` | H5 incoming group-bubble natural-sample acceptance | 复用当前群聊中的真实接收方向群主消息，验证 shared 昵称/角色投影、userID 哈希强调色与消息/Composer 布局 | real cached incoming DOM + light/dark mobile screenshots + computed style/overflow/console evidence | `completed-local/browser-readonly-pass` |
| `.149.56` | H5 incoming admin custom-emoji natural-sample acceptance | 复用已读群聊中的真实接收方向管理员自定义表情，验证管理员 shared 投影、表情资源和 message/composer CSS owner | real cached incoming emoji DOM + light/dark mobile screenshots + image/computed style/overflow/console evidence | `completed-local/browser-readonly-pass` |
| `.149.57` | H5 current-account ordinary-media inventory audit | 只读盘点当前账号全部已读会话，确认普通图片、视频、文件自然样本是否已出现 | conversation unread guard + four-chat production DOM inventory + media subtype cross-check | `completed-local/blocked-natural-data` |
| `.149.58` | H5 migration phase regression and browser-runtime gate audit | 对当前累积迁移执行全量 H5 回归、anti-mock/cleanup、仓库边界和跨浏览器运行时可用性审计 | 179-file test + typecheck + assets + production build + static/runtime boundary checks | `completed-local/regression-pass/browser-matrix-blocked-env` |

## W6.a6.20.148 Cold-Start Offline Safety Contract Freeze

> OFFLINE SAFETY AXIOM: unchecked cached identity may unlock only an existing read-only account snapshot；完整 sync、mutation、realtime and fake online state remain forbidden until Gateway auth succeeds again.

| field | contract |
| :--- | :--- |
| source evidence | `.131` 已证明 hot-session cache-first；Gateway-isolated reload currently fails at `check-token` and returns auth |
| eligibility | only browser fetch transport unavailable + structurally valid tab session + existing durable account snapshot |
| shared owner | planned SDK runtime lifecycle、`openExistingReadOnly` and capability-minimal `WebIMOfflineReader` |
| H5 owner | offline banner/read-only conversations/chat + retry/sign-out；no direct storage/token inspection |
| auth safety | explicit invalid/HTTP/business error never enters offline；reconnect must revalidate/refresh before normal runtime |
| mutation safety | no send/retry/draft/mark-read/profile/group/call/message/conversation mutation or offline queue |
| deliverable | `docs/runtime-contracts/web-cold-start-offline.md` + consumer matrix registration + bounded implementation slices |
| status | `completed/h5-consumed/browser-accepted` |

### W6.a6.20.148.1a Transport Classification And Lifecycle Foundation

| field | contract |
| :--- | :--- |
| delivered | browser fetch `TypeError -> GATEWAY_NETWORK_UNAVAILABLE`；other failures unchanged；offline readonly/validating lifecycle transitions |
| deliberately unchanged | production `restore()`、account DB open、sync facade、H5 shell and reconnect orchestration |
| verification | SDK focused 2 files/10 tests；H5 typecheck/build include `build:web/sync:web`；RN protected diff empty |
| status | `completed/foundation-only/not-consumed` |
| next | `.148.1b` existing-snapshot read-only storage + capability-minimal reader |

### W6.a6.20.148.1b Existing-Snapshot Read-Only Storage And Reader

| field | contract |
| :--- | :--- |
| delivered | no-create snapshot probe、read-only lifecycle mode、caller-thread/Worker write rejection、no migration/export/close persist、minimal conversation/history reader |
| shared reuse | normal sync and offline reader consume the same cached conversation projection and message-history query owners |
| verification | focused 7 files/35 tests；Web full 100 files/419 tests；typecheck/boundary/build:web/sync:web；H5 typecheck/build；RN protected diff empty |
| status | `completed/storage-reader-safe/not-consumed` |
| next | `.148.1c` runtime restore/reconnect/getSync/getOfflineReader orchestration |

### W6.a6.20.148.1c Runtime Offline Restore And Reconnect Orchestration

| field | contract |
| :--- | :--- |
| delivered | network-only offline restore、runtime-owned reader gate、offline full-sync/settings/security/call rejection、single-flight reconnect and invalid cleanup |
| concurrency | sign-out/new auth revokes pending reconnect results；stale validation cannot reopen readwrite DB or realtime |
| verification | focused 4 files/17 tests；Web full 101 files/424 tests；typecheck/boundary/build:web/sync:web；H5 typecheck/build；RN protected diff empty |
| status | `completed/runtime-safe/not-h5-consumed` |
| next | `.148.2` H5 offline shell |

### W6.a6.20.148.2 H5 Offline Shell

| field | contract |
| :--- | :--- |
| delivered | runtime-gated offline routes、banner、cache-only conversations/history、retry/sign-out and read-only interaction gates |
| exclusion | no online CallProvider/tabs、search/settings/presence、composer、message/conversation/profile actions |
| status | `completed/local-and-browser-accepted` |

### W6.a6.20.148.3 Isolated Cold-Reload Acceptance

| field | contract |
| :--- | :--- |
| proof | independent origin/proxy warm-up -> blocked reload -> cached list/chat -> failed retry -> valid reconnect |
| fail-closed | isolated invalid check + failed refresh clears local identity and returns auth |
| regression | concurrent cold restore is SDK single-flight, preventing React StrictMode DB-owner race |
| status | `completed/browser-real` |

## W6.a6.20.147 External Gate Activation Review

> ACTIVATION AXIOM: 本地实现闭环后，只有新增自然数据、明确写操作授权、可用外部环境/设备或独立设计授权才能重新激活验收；环境未变化时不得继续生成同类空审计切片。

| gate class | current state | activation requirement |
| :--- | :--- | :--- |
| natural data | `blocked` | 提供 pending 申请、自然 admin/role bubble、bound account、non-missed call、available/conversation-only group、非空 blacklist/media 等真实样本 |
| business mutation | `blocked-authorization` | 明确具体 operation、一次性目标和允许产生的服务器/SQLite 副作用；按 Network/result/cache/realtime/list-back 验收 |
| deployment/runtime | `blocked-external` | 提供已启用 RTC 服务、通话鉴权/凭据或可验证的部署环境 |
| browser/device | `blocked-external` | 提供 Safari、Firefox、实体移动设备或 physical-touch 会话 |
| contract/design | `blocked-separate-slice` | cold-start offline 等需要新增实现的能力必须另行授权和冻结 contract，不得以只读验收代替 |
| auto activation | `none` | 当前三个授权账号及 Chromium 会话已穷尽可安全读取的候选样本 |
| status | `paused/no-safe-auto-activation/external-input-required` | 任一激活条件成立后从对应 ledger item 恢复，不重开已关闭本地实现 |

## W6.a6.20.146 Cross-Account Residual Candidate Audit

> RESIDUAL AUDIT AXIOM: 多账号空态只能排除当前授权样本；不得把 unbound credential、empty calls 或 joined-only group search 写成 reset、call-record 或 available-group 验收。

| field | contract |
| :--- | :--- |
| security | 第二、第三账号只读 `/me/security`；仅真实 `profile.account` 非空时进入 reset form |
| calls | 第二、第三账号只读 `/calls`；非未接/时长必须由真实 record row 证明 |
| groups | 第二账号服务端关键词 `62/群` 搜索群 Tab；第三账号对照 group conversations 与 joined groups |
| safety | 不输入 credential、不编辑/删除 call、不申请入群、不打开 unread chat |
| result | 两账号均 account unbound、calls empty；群搜索 empty；第三账号 2 group conversations 与 2 joined groups 一一对应 |
| status | `audited/blocked-natural-data/runtime-clean` |

## W6.a6.20.145 Multi-Account Natural-Data Gate Audit

> NATURAL-DATA AXIOM: 已授权测试账号只提供 production data evidence；空态、accepted 历史或 unread 保护不能冒充 pending、角色气泡或 mutation 验收。

| field | contract |
| :--- | :--- |
| accounts | 使用既有三个手机号测试账号的隔离 tab/session；只走 production login、application list、group list 和 conversation list/read route |
| applications | 三账号分别读取 friend/group verification；pending 必须由真实 `status=pending` 行证明，禁止 fixture 或 accept/reject |
| role bubble | 仅打开 unread=0 群聊；他人 owner/admin 消息必须真实出现在气泡内才关闭 pixel gate |
| safety | unread>0 会话禁止进入，避免 shared `conversations.markRead`；不发送、不处理申请、不改群或资料 |
| result | 三账号好友申请均为 accepted 历史、群申请均为空；安全群聊只有 system/self 消息，第三账号唯一他人群主消息会话 unread=2，未打开 |
| status | `audited/blocked-natural-data/runtime-clean` |

## W6.a6.20.144 Conversation Remark Responsive Theme Acceptance

> RESPONSIVE TITLE AXIOM: 窄屏与暗色只验证现有真实名称的呈现；不得以 CSS 规则存在替代像素证据，也不得把当前长度样本外推为任意超长备注。

| field | contract |
| :--- | :--- |
| source | `.143` shared remark projection + H5 existing conversation row；不新增 DTO、备注 Map 或 page owner |
| mobile | authenticated `320x786` light；标题/时间/未读零重叠，document width 收敛 |
| desktop | authenticated `760x900` dark；theme token、标题/时间和加号 geometry 保持 |
| safety | 不打开 unread chat、不 mark-read、不写 Gateway/SQLite；媒体无当前账号自然样本时保持 blocked |
| cleanup | 恢复 light、`412x786` 与 `/conversations`；RN/SDK/H5 runtime source 不改 |
| status | `completed/browser-narrow-light-desktop-dark-pass/media-natural-data-gated` |

## W6.a6.20.143 Conversation Remark Title And Home Plus Parity

> CONVERSATION TITLE AXIOM: 好友备注是当前账号关系事实，必须由 shared cache projection 提供；H5 页面不得复制 RN 的备注 Map。点击热区与可见 glyph 尺寸必须分开管理。

| field | contract |
| :--- | :--- |
| RN truth | 单聊标题 `remark > showName`；首页更多操作 40px hit target、14x2px visible plus |
| SDK | `listCachedItems` 批量关联已确认 friendship；只改返回快照 name，不写 conversation cache、不发网络请求 |
| H5 | `getConversationTitle` 继续消费 conversation；仅 CSS 收敛 plus glyph，菜单路由和交互不变 |
| verification | SDK conversation/contact/sender focused、H5 list/home action focused、Web typecheck、build:web/sync:web、真实 412px measurement |
| protection | RN source 只读；禁止 RN/Desktop/all build/sync 和 `build:package:desktop:web` |
| status | `completed/shared-core-ready-web-consumed-rn-frozen/browser-rn-visual-pass` |

## W6.a6.20.142 Chat Card Picker Real Group Target Acceptance

> CHAT CARD PICKER AXIOM: 单选目标替换只改变弹窗 local state；只有点击分享并完成 shared `messages.sendCard` 才是 type108 mutation。

| field | contract |
| :--- | :--- |
| RN truth | frozen `useChatCardPicker -> CardPickerModal` 好友/群聊单选；RN source 只读 |
| data | 无未读真实单聊 + 当前账号真实好友/群聊；不注入 target fixture 或 route DTO |
| interaction | 打开附件名片 -> 群聊 Tab -> 依次选择两个真实群；selected 始终为 1，第二次替换第一次 |
| close | CTA 只验证 enabled；禁止点击；关闭回原聊天，不执行 type108/Gateway/SQLite mutation |
| ownership | `ChatPage -> ChatTargetPickerModal -> forward-target-source`；单选规则由统一组件持有，发送由 SDK facade 持有 |
| verification | picker/card/composer focused、Web typecheck、mobile smoke、RN/SDK boundary |
| status | `completed/browser-chat-card-real-group-single-selection-pass/send-gated` |

## W6.a6.20.141 Group QR In-App Share Group-Target Acceptance

> QR SHARE SELECTION AXIOM: 目标选择只改变弹窗 local state；只有点击分享后生成 PNG 并调用 shared batch-send 才是业务 mutation，两者不得混记。

| field | contract |
| :--- | :--- |
| RN truth | `ForwardTargetSelector variant=cardShare` 的好友/群聊、多选、跨 Tab selection；RN source 只读 |
| data | 当前账号真实 2 好友、2 joined groups；来源为 `.139` 同一真实群二维码 |
| interaction | 群 Tab -> ALL=2 -> 好友 Tab 保留 -> ALL=4；CTA 仅验证 enabled，禁止点击 |
| route | 关闭 replace 回原群二维码；不进入 compose，不生成/上传/发送 PNG |
| ownership | `QRCodeSharePage -> ChatTargetPickerModal -> forward-target-source`；不得复制目标 DTO、会话解析或 batch owner |
| verification | QR/share/picker focused、Web typecheck、HTTP/log/diff boundary |
| status | `completed/browser-group-qr-real-target-multiselect-pass/send-gated` |

## W6.a6.20.140 Real Group QR Code Desktop Dark Acceptance

> GROUP QR DARK AXIOM: 暗色主题必须通过全局 token 适配页面、surface、card 和文字；二维码像素区必须保持白底，不得随主题变暗而破坏识别。

| field | contract |
| :--- | :--- |
| data | `.139` 同一真实群与 canonical conversation；不注入 identity、theme fixture 或历史群资料 |
| viewport | `760x900` dark；surface 480px 居中、card/token 分层、二维码白底、零横向溢出 |
| route | 验证暗色二维码 -> 同一群资料返回；禁止下载、分享、扫一扫和发送 |
| ownership | 只消费全局 theme tokens 与现有 `QRCodeDisplay`；禁止页面级暗色分支或第二 Canvas owner |
| verification | QR/profile focused、Web typecheck、HTTP/log/diff boundary；结束恢复 light/default viewport |
| status | `completed/browser-real-group-qr-desktop-dark-pass/export-scan-send-gated` |

## W6.a6.20.139 Real Group QR Code Mobile Acceptance

> GROUP QR AXIOM: 真实群二维码必须由 canonical group conversation 与匹配的群快照恢复；视觉验收不得用 route ID、fixture 或历史群资料制造二维码。

| field | contract |
| :--- | :--- |
| data | 当前账号真实 owner 群 `donk的群聊`；conversation/group identity 必须由 production source 精确匹配 |
| viewport | `412x786` light；验证二维码 ready、Canvas 尺寸、card 几何与零横向溢出 |
| route | 只验证二维码 route 与同一群资料返回链；禁止下载、分享、扫一扫和最终发送 |
| ownership | SDK group payload + H5 共用 Canvas owner；不新增 QR 协议、导出或资料恢复路径 |
| verification | QR/profile focused、Web typecheck、HTTP/log/diff boundary；RN/SDK source 保持不变 |
| status | `completed/browser-real-group-qr-mobile-pass/export-scan-send-gated` |

## W6.a6.20.138 Broadcast Target Picker Desktop Dark Acceptance

> BROADCAST PICKER AXIOM: 目标选择是 H5 local presentation state；只有点击 CTA 后的 shared batch-send 才是业务 mutation，二者不得混记。

| field | contract |
| :--- | :--- |
| data | 当前账号真实好友/群聊；不注入 fixture，不构造 route target DTO |
| viewport | `760x900` dark；统一 sheet 居中、720px 上限、无横向溢出 |
| selection | 好友/群聊跨 Tab ALL 累计；只验证 local selected map 与 CTA 状态 |
| close | 关闭返回白名单 `backHref`；禁止点击 CTA、进入 compose 或发送 |
| verification | picker/broadcast focused、Web typecheck、HTTP/log、RN protected diff |
| status | `completed/browser-broadcast-desktop-dark-selection-pass/send-gated` |

## W6.a6.20.137 Group Management Owner Dark Responsive Acceptance

> OWNER DARK AXIOM: 只读主题验收必须消费真实 owner 数据与 production route；视觉通过不得外推为 admin 角色或群设置 mutation 通过。

| field | contract |
| :--- | :--- |
| data | 真实 owner 群；不注入 role、permission、member 或 setting fixture |
| viewports | `412x786` 与 `760x900`；page/card token 分层、8px card、无横向溢出 |
| route | 只进入群主转让候选页并关闭返回；禁止选择、确认或提交 |
| safety | 不点开关，不执行 Gateway/SQLite mutation；结束恢复 light/default viewport 并关闭隔离 tab |
| verification | group-management focused、Web typecheck、SDK Web regression、HTTP/log/diff boundary |
| status | `completed/browser-owner-mobile-desktop-dark-pass/admin-and-mutation-gated` |

## W6.a6.20.136 Group Management Role Presentation Parity

> ROLE PRESENTATION AXIOM: shared permission 决定能力；H5 只决定可见/禁用/导航。管理员可读的 RN 设置说明不得因不可操作而隐藏，普通成员不得绕过管理页守卫。

| role | H5 contract |
| :--- | :--- |
| owner | switch enabled；mute/speech/auto-delete/admin/transfer 保持既有 Link |
| admin | switch visible+disabled；speech visible+disabled；applications 按 shared capability；admins 与 owner transfer 显示只读限制 |
| member | `canOpenGroupManage=false` -> replace settings；不得在页面解析 roleLevel |
| boundary | `buildGroupManagementRoleView` 只消费 shared booleans；SDK permission resolver 仍是唯一业务 owner |
| anti-shortcut | 禁止 fake admin fixture 作为 browser evidence；禁止为展示对齐调用 mutation 或复制角色权限矩阵 |
| verification | role projection + group settings/transfer/auto-delete focused、Web typecheck、真实 owner DOM、diff boundary |
| status | `completed/role-presentation-converged/owner-browser-pass/admin-natural-data-gated` |

## W6.a6.20.135 Group Owner Transfer Label Parity

> LABEL PARITY AXIOM: H5 设置入口必须复用 RN 用户可见文案；文案修正不得改变 permission、route、candidate 或 shared mutation owner。

| field | contract |
| :--- | :--- |
| RN truth | frozen `GroupManageScreen` 使用“群主转让” |
| H5 scope | `GroupManagementPage` 对应 `ManagementLink` label 与 route contract assertion |
| proof | 真实 owner 群管理页显示新文案；进入 owner-transfer 页后候选与关闭返回行为不变 |
| anti-shortcut | 禁止选择候选、打开确认、执行 transfer 或借文案修正改写 permission/SDK/route |
| verification | owner-transfer/group-management focused tests、Web typecheck、authenticated DOM/route/return evidence |
| protection | RN business 和 SDK source/generated 保持不变；不运行 SDK/RN/Desktop build/sync |
| status | `completed/rn-label-parity/browser-route-return-pass` |

## W6.a6.20.134 Contact Common-Groups Consistency

> COMMON GROUPS AXIOM: 资料页数量和列表页必须消费同一次 shared capability 语义；异步首帧空值不得替代 settled result，页面不得维护第二分页、去重或 cache owner。

| field | contract |
| :--- | :--- |
| entry | 真实好友资料 `/contacts/users/:userID` -> 共同的群聊 -> 真实群 row -> canonical chat |
| path | `ContactProfilePage/ContactCommonGroupsPage -> contacts.listCommonGroups -> IMContactActionsSync -> repositories`；群打开继续走 `conversations.openGroup` |
| proof | settled count 与 list length/identity 一致；选择无未读群进入真实 conversation，返回后 unread 不变 |
| anti-shortcut | 禁止把 loading 首帧、fixture、route group ID 或页面去重冒充 shared result；禁止 refresh/mark-read/send/relationship/group mutation |
| verification | SDK contact-actions focused；H5 profile/child-route/search focused；authenticated DOM/runtime/layout/log evidence |
| protection | 本片不编辑 production source；既有 dirty worktree 保留；不运行 SDK build/sync、RN/Desktop/build:all 或 `build:package:desktop:web` |
| status | `completed/browser-real-common-groups-count-list-open-consistent` |

## W6.a6.20.133 Joined Group Open-Conversation Persistence

> GROUP OPEN AXIOM: 群列表只能通过 shared `openGroup` 获得真实 conversation；页面不得把 group ID 猜成 conversation ID，也不得因 route 可达伪造持久化成功。

| field | contract |
| :--- | :--- |
| entry | `/contacts -> /contacts/groups`，只选择会话列表中已确认无未读的真实 joined group |
| path | `JoinedGroupsPage -> conversations.openGroup -> openIMGroupConversation -> ConversationRepository -> React Router chat` |
| proof | chat identity/message 可见；返回主会话列表后同 canonical conversation 与 preview 仍存在，未读总数不变 |
| anti-shortcut | 禁止 route-only ID、fixture、refresh、mark-read、send、长按动作、群生命周期或 Gateway mutation |
| verification | SDK open-group focused；H5 joined-group view/route/refresh focused；authenticated DOM/runtime/layout/log evidence |
| protection | 本片不编辑 production source；既有 dirty worktree 保留；不运行 SDK build/sync、RN/Desktop/build:all 或 `build:package:desktop:web` |
| status | `completed/browser-real-joined-group-open-and-list-back-pass` |

## W6.a6.20.132 Real RTC Start Deployment Gate

> RTC AXIOM: 真实通话只有在 Gateway 创建 call、接收端收到 invite 且双方收敛终态后才能验收；部署失败不得由客户端假状态、循环重试或跳过媒体权限来补偿。

| field | contract |
| :--- | :--- |
| accounts | 两个独立 origin 使用真实手机号验证码登录，caller/receiver 都必须先达到 `online` |
| path | 单聊功能面板 -> 音视频通话 -> 语音通话 -> shared call control；禁止测试 API 和页面直写 call state |
| expected chain | start 创建真实 call/credential -> receiver 全局 overlay -> receiver reject -> caller terminal -> 双方通话列表一致 |
| observed | caller active route 显示“通话已结束 / 服务不可用”；receiver 无 invite，双方列表无记录 |
| interpretation | 证据表明本次部署未形成可持久化 call；未抓取 Network，不推断具体 HTTP 状态码或服务内部原因 |
| activation | 部署侧恢复 call creation 与 credential issuance 后，按同一 production path 重新执行完整 invite/reject gate |
| protection | 不改 H5/SDK/RN production，不创建 fake call，不运行 SDK build/sync、RN/Desktop/build:all 或 `build:package:desktop:web` |
| status | `blocked-deployment/runtime-clean/no-call-created` |

## W6.a6.20.131 Offline SQLite Cache-First Acceptance

> OFFLINE AXIOM: `cache-first` 只表示已认证 runtime 在远端失败时继续读取当前账号 SQLite；除非 auth/session 安全 contract 明确允许，否则不得外推为离线冷启动或离线登录。

| field | contract |
| :--- | :--- |
| isolation | 新 origin + per-test HTTP proxy；只隔离测试 tab 的 Gateway，禁止停止共享服务或污染 5176 会话 |
| warm-up | production phone-code login -> conversation sync -> account SQLite；必须保留可识别的真实 marker |
| hot-session proof | 关闭 proxy -> SPA 离开/返回 conversations -> list cache retained -> 进入无未读 chat -> history cache retained；远端错误仍可见 |
| cold-reload proof | proxy offline 时 reload；记录 `restore/check-token` 的真实失败行为，不因期望 parity 降低标准 |
| anti-shortcut | 禁止 fixture、fake-success、runtime monkeypatch、第二 DB reader/writer 或读取浏览器 token/storage |
| status | `completed/hot-session-offline-cache-first-pass; cold-start-contract-gated` |

## W6.a6.20.115 Account Security Mobile Dark Readonly Acceptance

> CREDENTIAL SAFETY AXIOM: 账号安全暗色验收只读取真实绑定状态与空表单；未经授权不得填写或提交 set/reset，也不得用 route 可达性代替 mutation/session-cleanup 证明。

| field | contract |
| :--- | :--- |
| scenario | 真实账号安全总览 -> 当前账号未设置分支 -> 首次设置表单 -> 错误直达 reset route 自动纠正 |
| root | `/me/security` 显示 `+86 15555555551 / 未绑定 / 账号密码`；page `15/17/21`、card `27/29/36` |
| form | `/me/security/account` 显示账号/密码/确认密码；空值 submit disabled；form `27/29/36` |
| route guard | 当前 account 为空时直达 `/me/security/password` replace 到 `/me/security/account` |
| layout | root/form 均 viewport 412x786、无横向溢出 |
| safety | 不输入、不提交、不调用 set/reset/Gateway/SQLite/session cleanup；验收后恢复 light preference |
| verification | SDK credential 1 file/3 tests；H5 menu contract 1 file/3 tests；Web typecheck；3 route HTTP 200；diff/RN protected checks |
| status | `completed/browser-mobile-dark-readonly-pass; desktop-dark-and-mutation-gated` |

## W6.a6.20.116 Verification Pending Natural-Data Audit

> NATURAL DATA AXIOM: pending 申请与处理层只能由 Gateway 真实记录驱动；无 pending 时必须登记为 data-gated，不得注入 fixture、改状态或制造申请。

| field | contract |
| :--- | :--- |
| operations | 好友验证 pending incoming；群聊验证 pending audit |
| friend evidence | `/contacts/verifications/friend` 返回 3 条真实历史记录，全部为“已添加”，无“加好友”入口 |
| group evidence | `/contacts/verifications/group` 返回“暂无群聊验证”，无审核行或动作 |
| safety | 不打开资料、不 mark-read、不接受/拒绝、不制造申请、不执行 Gateway/SQLite mutation |
| verification | H5 focused 2 files/7 tests；Web typecheck；2 route HTTP 200；diff/RN protected checks；412px 无横向溢出 |
| status | `blocked-natural-data/runtime-clean` |
| activation | Gateway 自然出现 incoming pending 好友申请或 owner/admin pending 群申请后，只读打开确认层；mutation 仍需独立授权 |

## W6.a6.20.117 Chat Media Read Natural-Data Audit

> MEDIA READ AXIOM: 真实媒体交互只能在无未读会话中使用 cache payload 验收；不得为寻找媒体打开带未读会话并触发 `markRead`，也不得注入 URL。

| field | contract |
| :--- | :--- |
| candidates | 无未读群 `donk的群聊`、无未读单聊 `donk三大爷`、归档会话列表 |
| evidence | 群仅有系统消息；单聊仅有申请/建联/文本；归档为空；三个 source 均无 image/audio/video action |
| protected | 两个带未读会话未打开；不 mark-read、不播放/下载、不发消息、不执行 Gateway/SQLite mutation |
| verification | H5 media focused 3 files/11 tests；Web typecheck；3 route HTTP 200；diff/RN protected checks；412px 无横向溢出 |
| status | `blocked-natural-data/runtime-clean` |
| activation | 已有无未读会话自然包含 absolute HTTP(S) image/audio/video payload；视频可独立于图片/音频验收 |

## W6.a6.20.114 Me Profile Editors Mobile Dark Readonly Acceptance

> PROFILE DARK AXIOM: 暗色验收只能读取真实资料并浏览字段 route；不改 draft、不点击完成、不把只读像素冒充 update-profile 成功。

| field | contract |
| :--- | :--- |
| scenario | 真实本人资料 `donk / 未知 / 未设置`：资料总览 -> 昵称 -> 返回 -> 性别 -> 取消 -> 个性签名 -> 取消 |
| nickname | `/me/profile/nickname` 保持 `donk`、maxLength=32；page `17/19/24`、input `36/39/51` |
| gender | `/me/profile/gender` 保持“未知”checked；page `17/19/24`、card `27/29/36` |
| bio | `/me/profile/bio` 保持空值、maxLength=100、`0/100`；page `17/19/24`、textarea `27/29/36` |
| navigation | 昵称返回、性别/签名取消均回 `/me/profile`；不点击完成 |
| layout | 资料总览与三编辑 route 均 scrollWidth=clientWidth=412 |
| safety | 不改字段、不调用 `profile.update`、不执行 Gateway/SQLite mutation；验收后恢复 light preference |
| verification | focused 4 files/17 tests；Web typecheck；3 route HTTP 200；diff/RN protected checks；真实 dark browser |
| status | `completed/browser-mobile-dark-readonly-pass; desktop-dark-and-mutation-gated` |

## W6.a6.20.113 Group Management Card Theme Hierarchy

> THEME AXIOM: 群管理页面背景必须使用 `page` token，分组卡片必须使用 `card` token；light、dark 和 system preference 共享同一 token owner。

| field | contract |
| :--- | :--- |
| RN reference | `GroupManageScreen` root 使用 `theme.color.bg.page`，每个 card 使用 `theme.color.bg.card` |
| defect | H5 surface 误用 `--im-bg-app`；light 下与 `--im-bg-card` 同为白色，卡片层级消失 |
| fix | `group-management-page.css` 仅将 surface 改为 `--im-bg-page`；card 继续使用 `--im-bg-card` |
| light proof | surface `rgb(247,247,247)`；card `rgb(255,255,255)`；radius 8px |
| dark proof | surface `rgb(17,19,24)`；card `rgb(27,29,36)`；radius 8px |
| layout | light/dark 均 viewport=scrollWidth=412；content 412px；card 380px |
| ownership | 主题值继续归 `rn-theme.css`；页面 CSS 只选择语义 token，不增加 page-local dark override |
| verification | focused 3 files/10 tests；Web typecheck；diff check；真实 light/dark browser；RN protected diff empty |
| status | `completed/browser-light-dark-card-hierarchy-pass` |

## W6.a6.20.112 Group Admin And Owner Candidate Readonly Acceptance

> ROLE ROUTE AXIOM: 群主角色页必须从同一 shared 成员/权限快照投影管理员和群主候选；只读浏览不得创建选择、确认或角色 mutation。

| field | contract |
| :--- | :--- |
| scenario | 真实 owner 群 `donk的群聊`：群管理 -> 管理员设置 -> 添加成员 -> 返回 -> 转让群主 -> 关闭 |
| admin evidence | 管理员列表显示 10 人上限与空管理员快照；添加页仅显示 `donk二大爷`、`donk三大爷` 两位非本人候选，未选择时“添加”禁用 |
| owner evidence | 转让页排除本人，按 D 分组显示同两位候选；不点击候选，不打开确认层 |
| ownership | `useGroupRoleRouteData` 只组合 SDK permissions/member snapshot；上限、候选资格、角色 mutation 继续归 shared SDK owner |
| layout | 管理员列表、添加候选、转让候选、返回管理页均 scrollWidth=clientWidth=412 |
| safety | 不选择成员、不打开确认、不添加/移除管理员、不转让群主、不执行 Gateway/SQLite mutation |
| verification | group-admin/owner-transfer focused 3 files/10 tests；真实 route/DOM/viewport/log；RN protected diff empty |
| status | `completed/browser-owner-role-routes-pass; natural-admin-and-mutation-gated` |

## W6.a6.20.111 Conversation Search Message Target Acceptance

> MESSAGE SEARCH AXIOM: 首页聊天记录结果只能携带稳定 `messageID` 进入目标会话；聊天页必须从当前账号 SQLite 恢复目标窗口，返回时搜索层不得重放。

| field | contract |
| :--- | :--- |
| scenario | `/conversations/search` 复用真实历史 `123`，选择无未读单聊 `donk三大爷` 的 1 条聊天记录 |
| data evidence | 搜索返回 `donk二大爷的群聊`、`donk三大爷` 两个真实消息分区；目标行正文为 `123` |
| route evidence | 进入 `/conversations/019ff6cd-...?messageID=61da9d1a-...`，DOM 精确命中同 client ID 消息；返回 `/conversations`，搜索层不恢复 |
| ownership | `messages.searchCached`/Repository 持有搜索，`buildConversationHomeSearchRoute` 持有 replace URL，`readFocusedChatMessageWindow` 只读本地窗口；Router state 不承载正文 |
| visual | 目标行位于 412px 可视窗口；900ms Web Animation 高亮有静态调用链和测试，但自动化未捕获活动帧，不声明真实动画像素 |
| safety | 选择无未读会话；未读总数前后均 4；不 markRead、不发送、不执行 Gateway/SQLite mutation |
| verification | home-search/message-focus focused 2 files/10 tests；真实 route/DOM/viewport/log；RN protected diff empty |
| status | `completed/browser-message-window-pass; highlight-frame-gated` |

## W6.a6.20.110 Contact Server Search Joined Group Acceptance

> SERVER JOINED GROUP AXIOM: 联系人服务器群搜索的 `joined` 结果必须通过 shared `conversations.openGroup` 打开规范会话，并以 replace 关闭搜索层。

| field | contract |
| :--- | :--- |
| scenario | `/contacts/search` 输入 `donk`，显式进入服务器搜索并切换群聊 Tab；选择无未读的 `donk的群聊` |
| data evidence | 服务器返回 `donk二大爷的群聊`、`donk的群聊` 两个真实 joined 群，各显示 3 人与真实 groupID |
| route evidence | `donk的群聊 -> /conversations/019ff8b7-... -> /conversations`；返回后联系人搜索层不恢复 |
| ownership | 关系三态继续归 `groupApplications.search`，群/会话身份归 `conversations.openGroup`，URL 归 `buildConversationRoute`；H5 只投影 Tab/行/replace |
| layout | 搜索、聊天、会话首页均 scrollWidth=clientWidth=412 |
| safety | 选择无未读群；不提交群申请、不标记已读、不发送消息、不执行关系/Gateway mutation |
| verification | contact/group route focused 4 files/14 tests；真实 route/DOM/viewport/log；RN protected diff empty |
| status | `completed/browser-server-joined-group-pass; available-application-gated` |

## W6.a6.20.109 Group Conversation Latest Sender Preview Convergence

> GROUP PREVIEW AXIOM: 普通群聊 latestMessage 必须按 RN 规则展示 `发送者：摘要`；群系统消息不得被当作普通成员消息添加发送者。

| field | contract |
| :--- | :--- |
| RN reference | 冻结的 `conversationPreviewHelpers.ts`：普通群消息添加发送者，本人显示“我”；系统类型只展示系统摘要 |
| shared owner | SDK `listCachedItems` 只读 friendship/member/user cache 输出 `latestSenderDisplayName`；`isIMGroupSystemMessageType` 统一系统类型边界 |
| Web projection | 普通 incoming/outgoing 群消息生成 `成员名/我：摘要`，同步平移预设表情 entity offset；mention 复用同一 latest sender；系统消息保持原摘要 |
| browser evidence | 自然群 `donk二大爷的群聊` 显示 `donk二大爷：1231`；自然系统消息仍显示 `群聊已创建`，无 `我：` |
| safety | 只读会话首页，不打开聊天、不标记已读、不发送消息、不执行 Gateway/SQLite mutation |
| verification | SDK Web 98 files/408 tests + `build:web/sync:web`；H5 focused 3 files/32 tests + app typecheck；412px browser/log；RN protected diff empty |
| status | `completed/shared-core-ready/web-consumed/rn-frozen` |

## W6.a6.20.108 Group Member Identity And Role Projection Acceptance

> GROUP IDENTITY AXIOM: 群成员列表与聊天消息必须消费 SDK 同一成员快照；可见名称严格为 `好友备注 > 群内昵称 > 公开昵称 > im-{userId 后四位}`，群主/管理员标签只由规范化角色投影。

| field | contract |
| :--- | :--- |
| scenario | 普通成员自然群 `donk二大爷的群聊` 的只读成员页；聊天页因当前会话含未读且短列表会自动提交 `markRead`，不进入页面制造副作用 |
| browser evidence | 成员页显示 `donk`、`donk二大爷`、`donk三大爷`，群主行显示“群主”，无成员回退为 userId |
| shared owner | SDK `resolveIMGroupMemberDisplayName` 唯一持有备注/群昵称/公开昵称/匿名身份优先级；H5 成员页与 `ChatMessageBubble` 消费同一 `WebIMGroupMember` 快照 |
| chat projection | `getChatGroupSenderView` 将 `owner/admin` 映射为“群主/管理员”；普通消息在气泡内投影，图片/视频在媒体标题行投影；mention 复用同一名称解析 |
| layout | 成员页 3 行均宽 412px，document scrollWidth=clientWidth=412 |
| safety | 不打开未读聊天、不调用 markRead/read receipt、不发送消息、不执行 Gateway/SQLite mutation |
| verification | H5 focused 3 files/13 tests；SDK sender resolver 1 file/4 tests；真实 DOM/viewport/log evidence |
| status | `completed/browser-member-data-pass; unread-chat-role-pixel-gated` |

## W6.a6.20.107 Group Member Role Readonly Acceptance

> MEMBER ROLE AXIOM: 普通成员只能看到成员级群设置；群公告、群管理、群自动删除与解散入口必须隐藏，直接访问群管理 route 必须 fail-closed 返回群设置。

| field | contract |
| :--- | :--- |
| scenario | 新自然群 `donk二大爷的群聊`（group `74522614714`、conversation `019ffe07-...`）的当前账号普通成员设置 |
| visible evidence | 群设置显示 3 位真实成员、本人群昵称、分享/静音/置顶/清空和“退出群聊” |
| hidden evidence | 不显示群公告、群管理、定时删除或“解散群聊” |
| route evidence | 直接访问 `/settings/manage` 被 replace 回同一 `/settings`，不能绕过角色门禁 |
| layout | 设置页 scrollWidth=viewportWidth=412 |
| safety | 不切换设置、不打开 destructive sheet、不退出群、不执行角色/Gateway/SQLite mutation |
| verification | settings/auto-delete/lifecycle focused 4 files/19 tests、真实 DOM/route/viewport evidence |
| status | `completed/browser-owner-and-member-role-pass; admin-and-mutation-gated` |

## W6.a6.20.106 Conversation And Message Action Menu Readonly Acceptance

> ACTION MENU AXIOM: 长按/右键只负责打开 RN 对齐菜单；在未授权业务写入时，只验证菜单内容、定位与关闭，不得执行任一动作。

| field | contract |
| :--- | :--- |
| scenario | 会话首页真实群会话行右键；单聊真实文本消息 `123` 右键 |
| conversation evidence | “会话操作”按 RN 顺序显示标记未读、置顶、免打扰、归档、删除；遮罩关闭后仍在 `/conversations` |
| message evidence | “消息操作”显示引用、复制、编辑、多选、转发、删除，并呈现原消息预览；Escape 关闭后仍在原会话 |
| layout | 两个菜单的 stack/menu 均位于 412px 视口内，body scrollWidth=viewportWidth=412 |
| safety | 不点击任何菜单项，不执行已读、置顶、静音、归档、删除、复制、编辑、转发或发送 |
| verification | action-menu focused 3 files/8 tests、真实 DOM/route/viewport evidence |
| status | `completed/browser-readonly-menu-pass; actions-and-physical-touch-gated` |

## W6.a6.20.105 Conversation Search Group Result Acceptance

> CONVERSATION SEARCH AXIOM: 首页群聊搜索结果进入聊天必须 replace 搜索层；返回只能到会话首页，群身份仍由既有 search/open route owner 提供。

| field | contract |
| :--- | :--- |
| scenario | `/conversations/search` 复用真实历史 `donk`，点击群结果 `donk的群聊` |
| data evidence | 结果包含 2 位好友和 1 个群；群 ID `97524759106` 映射规范 conversation `019ff8b7-...` |
| route evidence | search -> group conversation -> conversations；返回后搜索页面不恢复 |
| layout | 搜索、聊天、会话首页 scrollWidth=clientWidth=412 |
| safety | 不发消息、不改搜索历史、不执行 Gateway/SQLite mutation |
| verification | conversation-search focused 2 files/18 tests、真实 DOM/route/viewport evidence |
| status | `completed/browser-friend-and-group-result-pass; message-result-target-gated` |

## W6.a6.20.104 Group Application Already-Joined Acceptance

> ALREADY-JOINED AXIOM: 群申请入口识别当前账号已入群时只能消费 shared `conversations.openGroup` 进入现有会话，不得提交申请或恢复申请中间层。

| field | contract |
| :--- | :--- |
| scenario | 真实群 ID `97524759106` 进入 `/groups/:groupID/apply`，点击“进入群聊” |
| data evidence | 页面显示 `donk的群聊`、3 位成员和唯一 CTA“进入群聊”，无申请表单/提交按钮 |
| route evidence | shared owner 返回 `/conversations/019ff8b7-b24f-7e71-afe1-332d40294c00`；聊天返回 `/conversations`，申请层不恢复 |
| layout | 申请页、聊天、会话首页 scrollWidth=clientWidth=412 |
| safety | 不提交入群申请、不改变群关系、不发消息、不执行关系/Gateway mutation |
| verification | group-application focused 3 files/11 tests、真实 DOM/route/viewport evidence |
| status | `completed/browser-already-joined-open-group-pass; available-application-gated` |

## W6.a6.20.103 Group Announcement Owner Readonly Acceptance

> ANNOUNCEMENT AXIOM: 群设置入口与公告编辑权限必须来自同一真实角色事实；取消编辑应返回群设置且不得产生发布/已读副作用。

| field | contract |
| :--- | :--- |
| scenario | 当前真实群主从群设置打开“群公告”，随后取消编辑 |
| role evidence | 设置页可解散群、管理页可转让群主；公告页呈现 textbox、取消和完成，符合 owner 可编辑投影 |
| route evidence | settings -> announcement -> cancel -> settings；scrollWidth=clientWidth=412 |
| safety | 不输入公告、不点击完成、不发布、不标记已读、不执行角色/Gateway/SQLite mutation |
| verification | chat-settings focused 1 file/9 tests、真实 DOM/route/viewport evidence |
| status | `completed/browser-announcement-owner-and-member-pass; admin-and-mutation-gated` |

## W6.a6.20.102 Auto Delete Entry Hierarchy Acceptance

> AUTO DELETE ENTRY AXIOM: 单聊设置直接提供“定时删除”；群聊首页不得重复入口，只有群主管理页显示“定时删除消息”。

| field | contract |
| :--- | :--- |
| scenario | 检查真实单聊设置、真实群设置和当前群主管理页 |
| presentation | 单聊显示“定时删除/停用定时删除”；群设置无该入口；群管理显示“定时删除消息/停用定时删除” |
| role evidence | 当前账号可解散群且管理页含管理员设置/转让群主，满足真实群主样本 |
| layout | 三页 scrollWidth=clientWidth=412 |
| safety | 不打开策略页、不切换任何设置、不执行 Gateway/SQLite mutation |
| verification | auto-delete/settings focused 2 files/13 tests、真实 DOM/route/viewport evidence |
| status | `completed/browser-single-owner-and-member-entry-pass; admin-role-gated` |

## W6.a6.20.101 Chat Card Picker Readonly Acceptance

> CARD PICKER AXIOM: 聊天名片必须消费统一目标选择器的单选模式；好友/群聊可切换，未选中不得发送，关闭不得离开当前会话。

| field | contract |
| :--- | :--- |
| scenario | 单聊加号 -> 名片；查看好友/群聊 Tab 后关闭弹窗 |
| presentation | dialog 标题“选择分享对象”；好友仅 `donk三大爷`，排除本人/当前对端；群聊显示 `donk的群聊`；无 ALL |
| interaction | 初始 `已选中(0)`、分享 disabled；关闭后仍在原 conversation，scrollWidth=clientWidth=412 |
| safety | 不选择目标、不点击分享、不发送 type108、不打开系统 picker 或执行 Gateway/SQLite mutation |
| verification | card-picker focused 3 files/7 tests、真实 DOM/route/viewport evidence |
| status | `completed/browser-card-picker-readonly-pass; type108-send-gated` |

## W6.a6.20.100 Group Search Joined Overlay Acceptance

> GROUP SEARCH AXIOM: 建群内的查找群聊是同一 SPA 覆盖层；已加入群进入聊天后，返回不得恢复查群或建群中间页。

| field | contract |
| :--- | :--- |
| scenario | `/groups/create -> /groups/search` 输入 `donk`，打开真实已加入群 `donk的群聊` |
| route evidence | 查群结果经 shared `openGroup` replace 到 `/conversations/019ff8b7-b24f-7e71-afe1-332d40294c00`；聊天返回 `/conversations` |
| presentation | 查群结果、聊天与会话首页均 scrollWidth=clientWidth=412；返回后不含查群标题/输入 |
| safety | 不选择建群好友、不创建群、不发消息、不进设置、不执行群申请/Gateway mutation |
| verification | group-route focused 4 files/17 tests、真实 route/DOM/viewport evidence |
| status | `completed/browser-joined-group-overlay-pass; available-and-application-gated` |

## W6.a6.20.99 Contact Search Server Readonly Acceptance

> SERVER SEARCH AXIOM: 服务器搜索必须显式进入，好友/群聊 Tab 使用同一搜索上下文；资料返回不得丢失关键词或选中 Tab。

| field | contract |
| :--- | :--- |
| scenario | 当前真实登录标签输入 `62`，显式进入服务器搜索；查看好友、资料返回、群聊空态并切回好友 |
| data evidence | 好友结果使用 shared `im-` + userID 后四位缺省昵称；首项 `im-9162` 进入真实资料后返回仍保留 `62` 与好友 Tab |
| tab evidence | 群聊 Tab 正常选中并显示“没有找到相关群聊”；切回好友后真实结果恢复 |
| layout | 全链 scrollWidth=clientWidth=412 |
| safety | 只执行服务器只读查询和资料导航；不进入加好友页、不提交关系/群申请、不执行发送/RTC mutation |
| verification | contact-search focused 5 files/23 tests、真实 route/DOM/viewport evidence |
| status | `completed/browser-server-friend-return-and-tabs-pass; slow-network-and-group-result-gated` |

## W6.a6.20.98 Contact Search Local Joined Group Acceptance

> LOCAL GROUP AXIOM: 本地搜索命中的已加入群必须通过 shared `openGroup` 进入规范会话，搜索页不得持有第二套群/会话身份逻辑。

| field | contract |
| :--- | :--- |
| scenario | `/contacts/search` 输入 `donk`，点击本地 `donk的群聊` |
| route evidence | 群 ID `97524759106` 经既有 owner 进入 `/conversations/019ff8b7-b24f-7e71-afe1-332d40294c00`；Header 显示群名/群聊 |
| presentation | 消息记录和输入区正常渲染，scrollWidth=clientWidth=412 |
| safety | 只打开已有群会话；不发消息、不进群设置、不执行群关系/Gateway mutation |
| verification | contact-search focused 5 files/23 tests、真实 route/DOM/viewport evidence |
| status | `completed/browser-local-joined-group-pass; conversation-fallback-and-server-joined-gated` |

## W6.a6.20.97 Contact Search Source Return Acceptance

> SOURCE AXIOM: 全局“添加朋友”只能打开一个联系人搜索覆盖层；取消必须精确恢复发起它的消息、通讯录或归档会话 scene。

| field | contract |
| :--- | :--- |
| scenario | 分别从 `/conversations`、`/contacts`、`/conversations/archived` 的全局更多菜单进入“添加朋友” |
| route evidence | 三次均进入 `/contacts/search`；取消后分别返回原始三个 pathname，无中间页或错误 Tab |
| presentation | 归档空态返回后 scrollWidth=clientWidth=412；未输入关键词或发起 server search |
| safety | 只开关共享菜单/搜索覆盖层，不进入资料、申请或群路由，不执行关系/Gateway/SQLite mutation |
| verification | source/menu focused 3 files/7 tests、`.94` H5 typecheck、真实 route/viewport evidence |
| status | `completed/browser-three-source-pass; child-mutation-gated` |

## W6.a6.20.96 Conversation Home Search Route Replacement Acceptance

> SEARCH ROUTE AXIOM: 会话首页普通搜索结果进入聊天时必须 replace 搜索层；聊天返回只能回会话列表，不能恢复搜索页。

| field | contract |
| :--- | :--- |
| scenario | 当前真实搜索历史 `donk` -> 好友/群聊结果 -> `donk二大爷` -> 规范会话 -> 返回会话列表 |
| route evidence | `/conversations/search` 点击好友后进入 `/conversations/019ff6cd-...`；聊天返回到 `/conversations`，搜索 input 不再存在 |
| data evidence | 搜索结果包含 2 位好友与 1 个群；只打开已有好友会话，不打开群会话、不发送消息 |
| layout | 搜索/聊天/列表均 scrollWidth=clientWidth=412 |
| non-claim | 当前未命中消息内容结果；`messageID` query、窗口恢复与高亮继续 natural-data-gated |
| boundary | 只读浏览器验收；不修改搜索聚合、Router owner、SDK/Gateway/SQLite、RN business 或 Desktop |
| verification | `conversation-home-search` 1 file/7 tests、`.94` H5 typecheck、真实 route/DOM/viewport evidence |
| status | `completed/browser-friend-and-group-result-pass; message-result-target-gated` |

## W6.a6.20.95 Contact Profile Clipboard And Nested Return Acceptance

> CONTACT AXIOM: 联系人资料复制成功只能来自真实 Clipboard resolve；共同群聊子页必须恢复资料与搜索上下文，且验收不得打开群会话或执行关系操作。

| field | contract |
| :--- | :--- |
| scenario | 当前真实好友 `donk二大爷`：搜索 `donk` -> 资料 -> 复制 ID -> 共同群聊 -> 资料 -> 搜索 |
| clipboard evidence | 点击真实 ID 后出现 RN 联系人资料同款“复制ID成功”，约 1.2s 后消失；URL 与联系人事实不变 |
| route evidence | `/contacts/users/94424103659/groups` 返回资料，再返回 `/contacts/search`；`donk` 查询与两位本地好友/一个本地群结果保留 |
| presentation | 全链 scrollWidth=clientWidth=412；当时共同群真实 count=1/list=0，不冒充群行/打开证据；该历史数据门禁已由 `.134` 当前 count=2/list=2/canonical-open 关闭 |
| safety | 未读取 Clipboard 内容、未点击语音/视频/星标/发消息/备注/分享、未打开群会话或执行关系 mutation |
| verification | clipboard/route focused 4 files/12 tests、`.94` H5 typecheck、真实 DOM/route/viewport evidence |
| status | `completed/browser-readonly-pass; relationship-action-and-group-row-gated` |

## W6.a6.20.94 Me Profile Readonly Browser Acceptance

> PROFILE AXIOM: 本人资料的复制反馈必须来自真实 Clipboard resolve；编辑页只读验收只能通过返回/取消退出，不得点击完成或制造资料 mutation。

| field | contract |
| :--- | :--- |
| scenario | 复用当前真实登录标签，在 412x786 `/me/profile` 验证本人 ID 复制、昵称/性别/签名三个编辑入口及退出 |
| clipboard evidence | 点击“复制ID”后出现 RN 本人资料同款“已复制ID”，约 1.2s 后自动消失；URL、ID 行和资料事实不变 |
| navbar evidence | 昵称页为“返回/完成”，性别和签名页为“取消/完成”；三个入口均精确返回 `/me/profile` |
| presentation | 资料 Navbar 高 56px、宽 412px；ID 行 computed border 0/outline none；所有页面 scrollWidth=clientWidth=412 |
| non-claim | 未读取系统剪贴板内容；未编辑字段、点击完成、触发 pending overlay 或 Gateway profile mutation |
| boundary | 只读浏览器验收与 SSOT 回写；H5 runtime、SDK/Gateway/SQLite、RN business、Desktop 均不改 |
| verification | clipboard/route/navbar focused 5 files/19 tests、H5 typecheck、route/browser DOM/geometry evidence |
| status | `completed/browser-readonly-pass; profile-mutation-and-pending-gated` |

## W6.a6.20.93 Contact Search Keyboard Browser Acceptance

> BROWSER AXIOM: 浏览器 Enter 只释放搜索框焦点；查询词、本地结果与显式远端搜索入口必须保持，不能用模式切换或隐式请求伪装 RN 的收键盘行为。

| field | contract |
| :--- | :--- |
| scenario | 复用当前真实登录标签，在 412x786 `/contacts/search` 输入 `donk` 后按 Enter；不新建标签或第二 SQLite writer |
| browser evidence | 焦点从 searchbox 回到 `BODY`；URL 保持 `/contacts/search`，输入词 `donk` 与两位本地联系人、一个本地群结果保留，零横向溢出 |
| mode safety | 页面没有好友/群聊 server tabs、loading 或 server result section；显式“去服务器搜索”入口仍保留，行为测试继续证明 Enter 不调用 `runServerSearch` |
| non-claim | 自动化 Enter 不是 Android/iOS 软键盘、IME composition 或实体键盘设备证据；这些仍保留 device gate |
| boundary | 浏览器只读验收；H5 runtime、SDK/Gateway/SQLite、RN business、Desktop 与 package scripts 均不改 |
| verification | `.90` focused/full regression + `.92` full verify；本片补真实登录 DOM/focus/result/viewport 证据 |
| status | `completed/browser-enter-pass; soft-keyboard-ime-device-gated` |

## W6.a6.20.92 Custom Emoji Light Responsive Acceptance

> RESPONSIVE AXIOM: H5 桌面 viewport 可以扩大页面留白，但 RN 五列表情单元不得随 1280px 页面宽度膨胀；真实空 cache 只能证明空态，不能冒充 populated list 或 mutation 证据。

| field | contract |
| :--- | :--- |
| source | RN `getCustomEmojiGridCellSize` 按五列手机 surface 计算；H5 footer/reorder 已以 480px 为桌面边界 |
| defect | 管理页 surface 缺少最大宽度，1280px 下五列单元膨胀到约 251px，与 RN 手机网格和其他 H5 全屏子页不一致 |
| fix | `.rn-custom-emoji-manager-surface` 使用 `width: min(100%, 480px)`；移动端保持全宽，桌面居中并增加同源边界阴影 |
| real evidence | 当前真实账号 light theme：管理页 412x786 为 412px/77.6px 单元，1280x800 为居中 480px/90.8px 单元；聊天第三 tab 与管理页均显示同一真实空 cache，零 overflow/console error |
| non-claim | 当前账号没有自定义表情；不声明 light populated-list、预览/选择/排序、文件选择、create/delete 或 type115 send 已验收 |
| boundary | 只改 H5 CSS presentation；SDK/cache/Gateway/SQLite/upload/delete/reorder/send、RN business 与 Desktop 均不变 |
| verification | focused 2 files/7 tests、H5 Web typecheck、`npm run verify` 通过 466 assets、SDK Web 98/407、boundary 和 1184-module build |
| status | `completed/light-empty-responsive-pass; populated-and-mutation-gates-retained` |

## W6.a6.20.91 Residual Inventory SSOT Reconciliation

> CLOSEOUT AXIOM: 已存在且已验收的运行链不得因台账陈旧被重复实现；浏览器没有等价平台 owner 的 RN 能力必须登记排除，不能用删除 IM 数据或错误 Gateway 字段制造表面对齐。

| field | contract |
| :--- | :--- |
| inventory | 逐项复核 RN/H5 页面、React Router route、shared facade 与迁移矩阵；区分真实实现缺口、陈旧状态、平台不适用和外部验收门 |
| corrected state | 聊天记录搜索的 text/date/media/file 与单聊/群聊设置入口均已由 `.18.1/.18.2.1/.18.2.2/.18.2.3` 关闭，状态统一为 `done-local/acceptance-gated` |
| auth/settings | `/auth/invite`、`/auth/complete-profile` 与版本检查/更新弹窗已落地；网络代理依赖原生 per-app transport，H5 为 `web-not-applicable` |
| cache boundary | RN“空间管理”只删除 `RNFS.CachesDirectoryPath` 临时文件；H5 当前没有产品自有 CacheStorage/Service Worker 媒体缓存，禁止删除当前账号 IndexedDB/sql.js IM snapshot 冒充清理 |
| retained capability gate | OpenIM `globalRecvMsgOpt` 仍无 Web read/update/event facade；Gateway `notification` 不是等价事实，继续保持 `blocked-capability/not-implemented` |
| next phase | 本地确定性页面/入口 inventory 关闭；后续只按已登记的真实 Gateway mutation、RTC、离线 SQLite、多标签、跨浏览器/主题/viewport 和自然数据样本执行授权验收 |
| boundary | 文档/验收状态收敛，不修改 H5 runtime、SDK source/dist、RN business、Desktop 或 package scripts |
| verification | `npm run verify` 通过 466 assets、H5/SDK Web typecheck、runtime boundary、SDK Web 98 files/407 tests 和 1184-module production build；仅有既有 chunk warning |
| status | `completed/ssot-reconciled/local-implementation-inventory-closed; external-acceptance-gates-active` |

## W6.a6.20.90 Contact Search Keyboard Completion

> KEYBOARD AXIOM: 联系人搜索键盘完成只结束文本输入并释放结果区；远端搜索必须继续由显式页面动作触发。

| field | contract |
| :--- | :--- |
| RN truth | `ContactSearchScreen` 的 `AppSearchBox` 使用 search return key；`onSubmitEditing` 只执行 `Keyboard.dismiss()`，不调用服务器搜索 |
| H5 input | search input 声明 `enterKeyHint=search`；仅接受 `key=Enter && !isComposing && !repeat` 后 `preventDefault + blur` |
| owner | `shouldDismissContactSearchKeyboard` 只判定平台按键；“去服务器搜索”和好友/群聊 Tab 仍是 `runServerSearch` 的唯一交互入口 |
| structure | 纯加载/错误/启动状态拆至 `ContactSearchStates`；主页面从 411 行收敛至 384 行，不移动请求、路由或状态 owner |
| boundary | 不修改 contacts/groups/conversations facade、Gateway、SQLite、搜索结果、Router、SDK、RN business、Desktop 或 package scripts |
| verification | fail-first 1；focused/full H5、SDK Web regression、assets/typecheck/build、route HTTP、cleanup、RN protected diff；`.93` 已补当前登录标签 Enter/blur 证据 |
| status | `completed/done-local/keyboard-presentation-converged; browser-enter-pass/soft-keyboard-ime-device-gated` |

## W6.a6.20.89 Me Profile Editor Saving Gate

> SAVING AXIOM: 资料 mutation pending 期间不得退出编辑器或重复提交；loading presentation 必须按 RN 编辑器类型投影，不能建立第二保存状态。

| field | contract |
| :--- | :--- |
| RN truth | nickname pending 使用整页半透明 spinner overlay；gender/bio pending 禁用取消并以右侧品牌 spinner 替换“完成” |
| H5 owner | 现有 `saving` 是唯一事实；Header 只消费 `backDisabled/actionPending`，nickname 页面只消费同值渲染 blocking overlay |
| safety | “完成”、字段 disabled、重复提交、成功返回与失败留页仍由唯一 `saveProfile` 处理；不拦截系统 History |
| boundary | 不修改 SDK、profile DTO/Gateway/SQLite、RN business、Desktop 或 package scripts |
| verification | fail-first 2；focused/full H5、SDK Web regression、assets/typecheck/build、三 route HTTP、CSS/reduced-motion/cleanup、RN protected diff |
| status | `completed/done-local/saving-presentation-converged; browser-pending-visual-gated` |

## W6.a6.20.88 Me Profile Editor Navbar Semantics

> NAVBAR AXIOM: 资料编辑页必须按 RN 编辑器类型区分左侧返回动作；左侧退出与右侧保存不可共用视觉语义。

| field | contract |
| :--- | :--- |
| RN truth | 昵称编辑使用返回箭头；性别与个性签名编辑使用“取消”；左侧动作使用正文色，右侧“完成”使用品牌色 |
| H5 projection | `MeProfileHeader.backLabel` 只决定左侧图标/文本 presentation；nickname 不传文本，gender/bio 传“取消” |
| owner | 共用 Header 暴露独立 `back/save` 样式钩子；退出继续调用 `.86` 的 `returnFromEditor`，完成继续调用唯一 `saveProfile` |
| safety | 不修改 profile read/update、字段校验、未变更返回、Gateway、SQLite、SDK、RN business、Desktop 或 package scripts |
| verification | fail-first consumer contract；focused/full H5、SDK Web regression、assets/typecheck/build、三 route HTTP、CSS/cleanup、RN protected diff；`.94` 已补真实 Navbar/退出证据 |
| status | `completed/done-local/navbar-presentation-converged; browser-readonly-pass/pending-gated` |

## W6.a6.20.87 Me Profile Nickname Keyboard Completion

> SUBMIT AXIOM: 昵称软键盘 Done/物理 Enter 必须复用顶栏“完成”的唯一保存链；IME 组合确认和重复按键不得触发资料 mutation。

| field | contract |
| :--- | :--- |
| RN truth | 昵称 `TextInput` 使用 `returnKeyType=done`，`onSubmitEditing` 与顶栏 `onAction` 均调用 `submitNickname` |
| H5 input | 昵称单行 input 声明 `enterKeyHint=done`；只接受 `key=Enter && !isComposing && !repeat`，并阻止浏览器默认动作 |
| owner | `shouldSubmitProfileNicknameKey` 只判定键盘事件；页面命名 callback 委托既有 `saveProfile`，不复制 trim、禁用、未变更、请求或返回逻辑 |
| safety | 空昵称、loading/saving、未变更、Gateway 成功/失败和 route return 继续由现有保存链处理；bio textarea 不消费 Enter 完成规则 |
| boundary | 不修改 SDK source/generated package、RN business、Desktop、profile DTO、Gateway、SQLite、CSS 或 package scripts |
| verification | fail-first pure/consumer guardrails；focused/full H5、typecheck/assets/build、route HTTP、diff/cleanup、RN protected diff；真实软键盘需当前登录标签补证 |
| status | `completed/done-local/input-owner-converged; browser-keyboard-gated` |

## W6.a6.20.86 Me Profile Editor Return Stack

> ROUTE STACK AXIOM: 资料编辑子页必须恢复真实资料总览 entry；深链和首页快捷入口不得通过伪造 history 返回到无关页面，也不得形成编辑页/总览循环。

| field | contract |
| :--- | :--- |
| RN truth | `ProfileScreen` 内部打开昵称、性别和签名编辑态；返回、未变更和保存成功都关闭编辑态并恢复同一资料总览实例 |
| H5 entry | `/me/profile` 的三个字段入口写入精确 `returnMode=history`；`/me` 昵称快捷入口和直接 URL 不写该标记 |
| H5 exit | 返回、未变更和保存成功共用 `returnFromEditor`；合法标记执行 `navigate(-1)`，缺省/未知 state 以 replace 回 `/me/profile` |
| safety | Router state 只决定 presentation 返回方式；profile read/update、校验、Gateway、SQLite 和成功条件保持既有 owner，失败继续留页 |
| boundary | 不修改 SDK source/generated package、RN business、Desktop 或 package scripts；不直接读写 History API |
| verification | fail-first pure/consumer guardrails；focused/full H5、typecheck/assets/build、四 route HTTP、diff/cleanup、RN protected diff；`.94` 已补三个入口真实返回栈证据 |
| status | `completed/done-local/route-stack-owner-converged; browser-readonly-pass/profile-mutation-gated` |

## W6.a6.20.85 User ID Clipboard Platform Adapter Convergence

> SUCCESS AXIOM: 用户 ID 复制成功只能由同一个 H5 Clipboard platform adapter 的真实 resolve 产生；页面点击、定时器或 identity fallback 不得制造成功。

| field | contract |
| :--- | :--- |
| RN truth | 个人资料与联系人资料只复制稳定 userID，成功后提供可见反馈，失败不改变资料或路由；RN source/caller 冻结 |
| H5 owner | `components/clipboard/user-id-clipboard` 唯一持有 trim、空 ID 拒绝、浏览器能力判断和 `navigator.clipboard.writeText`；个人中心首页、资料页和联系人资料页共同消费 |
| presentation | 页面只持点击、错误和 1.2s 成功反馈；联系人资料页由原静默成功补齐“复制ID成功”，失败继续可见且不伪装成功 |
| cleanup | 删除 me-domain `me-profile-clipboard` 私有 owner；三个 consumer 禁止直接读取 `navigator.clipboard`，不保留 wrapper 或 fallback copy |
| boundary | 不修改 SDK source/generated package、profile/contact DTO、Gateway、SQLite、认证、RN business、Desktop 或 package scripts |
| verification | fail-first behavior/consumer guardrail；focused/full H5、typecheck/assets/build、旧 owner/直接调用清查、route HTTP、RN protected diff、cleanup；`.94` 已补本人资料真实 Clipboard resolve/反馈 |
| status | `completed/done-local/presentation-platform-owner-converged; browser-profile-pass` |

## W6.a6.20.84 Chat Card Target Picker Convergence

> OWNER AXIOM: 聊天转发与当前会话名片发送必须共用一个 H5 好友/群聊选择 presentation owner；名片只可在选中后映射为 shared SDK type108 contract。

| field | contract |
| :--- | :--- |
| RN truth | `CardPickerModal` 只在好友/群聊两类真实目标间单选，排除本人和当前单聊对端，用户显式点击分享后才发送 |
| H5 owner | `ChatTargetPickerModal` 同时以 `multiple` 服务转发、以 `single` 服务名片；加载、搜索、Tab、头像、排除和选中状态只实现一次 |
| send boundary | `chat-card-picker.toIMMessageCard` 只将中性 `friend|group` 目标映射为 `IMMessageCard`；`ChatPage` 继续唯一调用 `messages.sendCard`，真实成功后才关闭弹窗 |
| cleanup | 删除 `ChatCardPickerDialog.tsx` 及 `chat-card-picker.css`，不保留兼容 wrapper、第二目标读取链或第二 DOM/CSS owner |
| boundary | 不修改 SDK source/generated package、RN business、Desktop、type108 body、Gateway/SQLite 收敛或 package scripts |
| verification | fail-first consumer guardrail；focused/full H5、typecheck/assets/build、旧 owner/dist 清查、RN protected diff、cleanup；真实弹窗点击保持单登录标签 gate |
| status | `completed/done-local/presentation-owner-converged; browser-card-picker-readonly-pass/type108-send-gated` |

## W6.a6.20.83 Group Application Joined Conversation Owner

> SLICE AXIOM: 公开群资料已确认当前账号入群后，规范会话解析必须归 shared SDK；H5 页面不得再用群列表分页状态判定会话是否可进入。

| field | contract |
| :--- | :--- |
| RN truth | 已加入群的搜索、验证和群列入口均委托 `fetchGroupConversation(groupID, conversationID?)`，页面不自行查群列表推断会话 |
| shared owner | 既有 `conversations.openGroup` 按 groupID cache-first 查会话，必要时经 Gateway 群资料/会话详情解析真实 ID，校验身份后 success-only 收敛当前账号缓存 |
| H5 consumer | `GroupQRCodeApplyPage` 的 already-joined 分支只传 `group.groupID`，再用 SDK 返回的 `conversationID` 构造 SPA route |
| safety | 删除页面 `groups.listCached -> groups.sync -> find`；SDK/Gateway 失败保留申请页和可见错误；search replace / QR push 历史策略不变 |
| boundary | 不修改 SDK source、RN business、Desktop、入群申请 mutation、公开群关系判定或 package scripts |
| verification | fail-first structural guardrail；focused/full H5、typecheck/assets/build、route HTTP、RN protected diff、cleanup |
| status | `completed/done-local/shared-owner-consumed; browser-already-joined-open-group-pass/available-application-gated` |

## W6.a6.20.82 Group Search Overlay Route Stack

> SLICE AXIOM: RN 建群、查找群聊和搜索来源申请属于同一覆盖层；内部页面切换不得增长浏览器历史，进入聊天后不得返回中间流程页。

| field | contract |
| :--- | :--- |
| RN truth | `CreateGroupServerSearchScreen` 打开 joined 群时先关闭自身，`CreateGroupScreen.onCreated` 再关闭建群覆盖层并进入 chats；申请页返回只恢复上一层状态 |
| H5 owner | `conversation-route.buildConversationRoute` 唯一 trim/URI encode conversation ID，调用方显式传入 replace；建群/查群/搜索申请内部切换统一 `replace` |
| consumers | 联系人本地/服务器 joined 群、独立群搜索 joined 群、群申请 already-joined 分支共用 URL owner；扫码申请显式保留既有 push |
| safety | 空 conversation ID fail-closed；search 来源进入/返回/打开聊天均不留下子页面；selection、keyword、Tab state 继续由既有白名单 route state 恢复 |
| boundary | 不修改 SDK、Gateway、SQLite、群关系、申请 mutation、聊天 Header、RN business、Desktop 或 package scripts；不读取 History API |
| verification | fail-first missing-owner/wiring；focused/full H5、SDK Web regression、typecheck/boundary/assets/build、三 route HTTP、RN protected diff、cleanup |
| status | `completed/done-local/route-stack-owner-converged; browser-joined-group-overlay-pass/available-and-application-gated` |

## W6.a6.20.81 Contact Search Server Request Concurrency

> SLICE AXIOM: 服务器搜索的好友/群聊 Tab 在慢网下仍可切换；只有当前关键词与最后一次显式搜索对应的请求可以更新页面状态。

| field | contract |
| :--- | :--- |
| RN truth | `ContactSearchScreen.runServerSearch` 在每次 Tab 点击时立即切换 tab/mode 并发起对应请求，不因上一请求 pending 丢弃点击；输入变化立即回到本地搜索 |
| H5 owner | `ContactSearchPage` 持有页面级递增 request ID；输入变化和后续搜索使旧请求失效，纯 helper 只判断当前代次 |
| consumers | 好友、群聊、恢复查询和错误重试共用同一请求入口；只有最新请求可以写结果、错误与 loading |
| safety | 旧请求成功/失败均不得覆盖新 Tab、新关键词或清除新请求 loading；失败继续保留最近一次成功快照；不取消或复制 SDK operation |
| boundary | 不修改 contacts/groupApplications facade、Gateway、SQLite、关系三态、路由、RN business、Desktop 或 package scripts；不执行真实关系 mutation |
| verification | helper behavior + page wiring guardrail；focused/full H5、SDK Web regression、typecheck/boundary/assets/build、HTTP、RN protected diff、cleanup |
| status | `completed/done-local/interaction-owner-converged; browser-normal-tabs-pass/slow-network-gated` |

## W6.a6.20.80 Contact Search Joined Group Conversation Route

> SLICE AXIOM: 联系人搜索打开已加入群后必须关闭搜索层并进入消息 Tab；规范会话身份归 SDK，URL/history 语义归 H5 route owner。

| field | contract |
| :--- | :--- |
| RN truth | `ContactSearchScreen` 返回规范群会话后，`ChatHomeScreen` 关闭搜索、清空待转发、打开会话并切到 `chats` |
| shared owner | 既有 SDK `conversations.openGroup` 继续唯一校验 group/conversation identity 并收敛 cache；本片 SDK 零源码改动 |
| H5 owner | 当时的联系人私有 URL helper 已由 `.82` 收敛到全局 `buildConversationRoute`；联系人入口传 `replace=true`，URL 自然映射消息 Tab |
| consumers | 本地群与服务器 `joined` 群成功分支共用该 route；空 ID 留在搜索页并显示既有错误；`available/pending` 分支不变 |
| boundary | 不修改群搜索、群关系、SDK/Gateway/SQLite、聊天 Header、主 Tab store、待转发业务、RN 或 Desktop；不读取 History API |
| verification | fail-first 2；focused 4/19、H5 129/402、SDK Web 98/407、466 assets、typecheck/boundary、`build:web/sync:web`、1182-module build、HTTP、RN protected diff、cleanup |
| status | `completed/done-local/route-stack-owner-converged; browser-local-group-pass/server-joined-gated` |

## W6.a6.20.79 Contact Search Source Return Context

> SLICE AXIOM: 联系人搜索是 RN 全局添加菜单上的覆盖层；取消和子页面返回必须恢复打开它的 scene，Router state 只保存白名单 presentation context。

| field | contract |
| :--- | :--- |
| RN truth | `ContactSearchScreen` 可覆盖会话、通讯录和归档会话 scene；取消只关闭覆盖层，资料/申请返回保留原搜索上下文 |
| H5 owner | `contact-search-route` 唯一允许 `/contacts|/conversations|/conversations/archived`；`HomeActionMenu` 记录当前 pathname，搜索页负责清洗和 `replace` 返回 |
| child chain | 用户资料、好友申请、共同群与群申请沿用既有受控 state；`searchBackHref` 不承载资料、关系、搜索结果或权限事实 |
| safety | 未携带、非法、外部或搜索自身地址统一回退 `/contacts`；关键词继续最长 100 字，tab 继续只接受 `friends|groups|null` |
| boundary | 不修改搜索 API/聚合、SDK、Gateway、SQLite、群关系、消息、RN business 或 Desktop；不读取 History API |
| verification | fail-first 5 项；focused 6 files/24 tests、H5 128/399、SDK Web 98/407、466 assets、typecheck/boundary、`build:web/sync:web`、1182-module build、route HTTP、RN protected diff、cleanup |
| status | `completed/done-local/route-context-owner-converged; browser-three-source-pass/child-mutation-gated` |

## W6.a6.20.78 Conversation Home Search Result Route Replacement

> SLICE AXIOM: 首页搜索结果进入聊天前必须关闭搜索层；消息定位 URL 可持久化，但搜索 route 不得留在返回栈中。

| field | contract |
| :--- | :--- |
| RN truth | `ChatHomeScreen.openConversationFromHomeSearch/openMessageFromHomeSearch` 均先 `setHomeSearchVisible(false)`，再打开目标会话或定位消息；退出聊天返回会话列表，不重开搜索层 |
| H5 owner | `buildConversationHomeSearchRoute` 唯一编码 conversation/message route 并固定 `replace=true`；`ConversationSearchPage` 只调用 React Router `navigate` |
| persistence | 普通结果使用 `/conversations/:conversationID`；消息结果保留 `?messageID=`，继续由 `ChatPage` 支持 reload 后稳定定位 |
| boundary | 不修改搜索聚合、SQLite、SDK、Gateway、消息窗口、聊天返回按钮、RN business 或 Desktop；不直接调用 History API |
| verification | fail-first 2 项；focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build、route HTTP、RN protected diff、cleanup |
| status | `completed/done-local/clean; route-stack-owner-converged; browser-ordinary-result-pass/message-result-gated` |

## W6.a6.20.77 Group Join Application Message And Success Return

> SLICE AXIOM: 群申请验证语、字符上限与空消息回退属于 shared SDK；H5 只读本人资料、保护草稿并在真实成功后恢复受控来源。

| field | contract |
| :--- | :--- |
| RN truth | `buildSelfGroupApplicationMessage` 输出 `我是{nickname}，申请加入群聊` 或 `申请加入群聊`；输入最多 50 字；成功关闭申请 overlay 回到原搜索/扫码 scene |
| shared owner | SDK `modules/group/group-application-message.ts` + `groupApplications.apply` 统一生成、trim、50 字校验和 Gateway body 回退 |
| H5 caller | `/groups/:groupID/apply` 读取 `profile.getCurrent`；异步昵称只替换未编辑缺省值；成功 `replace` 返回 `/scan|/groups/search|/contacts/search` 并恢复受控 search state |
| failure | profile 读取失败保留 shared fallback；迟到资料不覆盖用户编辑；Gateway 失败不导航；pending 禁重复；不制造 `submitted` 假关系 |
| boundary | 不修改 RN business/generated、群关系 cache/realtime、审核列表、joined list 或 Desktop；不执行真实申请 |
| verification | fail-first helper/state/wiring；focused/full SDK Web/H5、typecheck/boundary/assets/build、dist/RN protection、cleanup |
| status | `completed/shared-core-ready/web-consumed/rn-frozen; mutation-acceptance-gated` |

## W6.a6.20.76 Friend Application Message And Success Return

| field | value |
| :--- | :--- |
| source | RN `AddFriendScreen` 用本人昵称生成验证语，保留用户编辑，并在 `addFriend` 成功后关闭申请页、打开目标资料 |
| capability | H5 `/contacts/users/:userID/add` 读取当前账号资料生成同一验证语；成功后 replace 回资料页并延续搜索/扫码/群成员/验证列表来源 |
| ownership | SDK `friend-application-message` 持有昵称/缺省规则，`peerProfile.applyFriend` 复用同一 fallback；H5 仅持有异步表单保护和 React Router |
| failure | 本人资料失败保留 shared fallback；迟到资料不覆盖用户编辑；Gateway 失败不导航、不锁死按钮、不伪造成功 |
| boundary | 不修改 RN business/generated、好友申请列表状态、Gateway DTO、SQLite、realtime 或 Desktop；不执行真实申请 |
| verification | fail-first helper/state/wiring；focused/full SDK Web/H5、typecheck/boundary/assets/build、dist/RN protection、cleanup |
| status | `completed/shared-core-ready/web-consumed/rn-frozen; mutation-acceptance-gated` |

## W6.a6.20.75 Contact Profile Common Groups Route Context

| field | value |
| :--- | :--- |
| source | RN `UserProfileScreen` 以资料页内层 `CommonGroupsScreen` 展示共同群聊；关闭内层页后资料及其下方搜索/扫码/群成员来源上下文保持不变 |
| capability | H5 资料页进入 `/contacts/users/:userID/groups` 时透传既有白名单 profile context；共同群聊 Header 返回资料后，资料继续回到原来源 |
| ownership | 复用 H5 `contact-profile-route-state` 唯一清洗的 `profileRouteState` 与公共 `ContactProfileHeader`；共同群、会话打开和资料 SDK owner 均不变 |
| safety | 只传递 `.74` 已验证的内部 backHref、搜索 presentation、扫码来源或群会话候选；不透传任意 history state、DTO、token 或群数据 |
| boundary | 不修改 SDK、RN business、共同群分页、群会话打开、Gateway/SQLite、好友申请、分享名片或 Desktop；不读取 History API |
| verification | fail-first wiring contract；focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build、route runtime、RN protected diff、cleanup |
| status | `completed/done-local/clean; route-context-owner-converged; browser-readonly-pass/group-row-gated` |

## W6.a6.20.74 Contact Profile Child Route Context

| field | value |
| :--- | :--- |
| source | RN 用户资料 Viewer 打开添加好友页前关闭资料浮层，但保留其下方搜索/扫码/群成员场景；添加页返回资料、资料再返回来源场景时上下文连续 |
| capability | H5 资料页进入 `/contacts/users/:userID/add` 时透传白名单 profile context；申请页返回资料时回传同一 context，资料页再按既有 Navbar 规则回到原来源 |
| ownership | 新建 H5 `contact-profile-route-state` 唯一解析 profile child context；`ContactProfileHeader` 只消费 helper 结果；申请 Gateway/SDK owner 不变 |
| safety | 只保留已登记 backHref、最长 100 字搜索词、合法 tab、稳定 groupConversationID 和精确 `qrcode` 来源；未知字段/外部 URL/DTO/token 丢弃 |
| boundary | 不修改 SDK、RN business、好友申请 message/source 默认值、资料关系、Gateway/SQLite 或 Desktop；不读取 History API |
| verification | fail-first pure state/wiring；focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build、route runtime、RN protected diff、cleanup |
| status | `completed/done-local/clean; route-context-owner-converged; browser-readonly-pass` |

## W6.a6.20.73 Contact Search Profile Return State

| field | value |
| :--- | :--- |
| source | RN `ContactSearchScreen` 在同一 screen stack 内打开用户资料，返回后搜索词、本地/服务器模式和好友/群聊页签仍保持 |
| capability | H5 联系人搜索用户结果通过 React Router state 携带受控 `backHref/searchKeyword/serverTab`；资料页返回 `/contacts/search` 时恢复相同搜索上下文 |
| ownership | `contact-search-view` 唯一构造/解析搜索 route state；`ContactProfileHeader` 只消费已校验 back state；资料与搜索业务 facade 不变 |
| safety | 只接受 `/contacts/search`、最长 100 字关键词和 `friends|groups|null`；不透传任意 location state、用户 DTO、token 或业务结果 |
| boundary | 不修改 SDK、RN business、资料读取、好友申请、服务器搜索、群搜索或 Desktop；不直接使用 History API |
| verification | fail-first state/wiring；focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build、route runtime、RN protected diff、cleanup |
| status | `completed/done-local/clean; route-state-owner-converged; browser-local-and-server-friend-return-pass/server-group-result-gated` |

## W6.a6.20.72 Contact Search Group Conversation Fallback

| field | value |
| :--- | :--- |
| source | RN `ContactSearchScreen.loadLocalData` 同时读取 joined groups 与 conversations，并把群列表中缺失的 group conversation 按 groupID 补入本地搜索 |
| capability | H5 `/contacts/search` 读取 `conversations.listCached()`，把 `type=group` 且稳定 targetID 存在的会话投影为只读群搜索项；joined group 同 ID 时始终优先 |
| ownership | `buildContactSearchLocalResults` 唯一完成 contacts/groups/conversations 合并与去重；SDK groups/conversations/openGroup owner 不变 |
| safety | conversation fallback 只含 groupID/conversationID/name/avatar，不携带成员数、角色、权限或群状态；点击仍由 `conversations.openGroup` 二次校验 |
| boundary | 不修改 SDK、RN business、服务器搜索、群申请、群管理或 Desktop；不把 conversation fallback 写回 groups cache |
| verification | fail-first fallback/dedupe/filter/wiring；focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build、RN protected diff、cleanup |
| status | `completed/done-local/clean; presentation-owner-converged; browser-sample-gated` |

## W6.a6.20.71 Contact Search Local Joined Groups

| field | value |
| :--- | :--- |
| source | RN `ContactSearchScreen` 首次加载好友、已加入群聊和群会话；输入关键词后本地结果按“好友 -> 已加入群聊”展示，群名或群 ID 均可命中 |
| capability | H5 `/contacts/search` 同时读取 contacts 与 joined-groups 既有 facade，复用 `filterJoinedGroups` 和统一群结果行；本地群点击只调用 `conversations.openGroup` |
| ownership | `buildContactSearchLocalResults` 唯一合并本地搜索结果；contacts/groups/openGroup 的 Gateway、SQLite 与身份校验 owner 均保持 SDK 既有实现 |
| failure | 好友或群聊任一读取失败时显示可重试错误但保留另一类成功结果；不得用空列表伪装整体成功 |
| boundary | 不修改 SDK、RN business、服务器好友/群聊搜索、群申请或 Desktop；不新增本地搜索缓存 |
| verification | fail-first merge/filter/wiring；focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build、RN protected diff、cleanup |
| status | `completed/done-local/clean; presentation-owner-converged; browser-local-joined-group-pass` |

## W6.a6.20.70 Auto Delete Entry Hierarchy And Owner Permission

| field | value |
| :--- | :--- |
| source | RN 单聊设置首页直接显示“定时删除”；群聊仅在群管理页对群主显示“定时删除消息”，管理员和普通成员不显示 |
| capability | H5 单聊入口保持聊天设置；群聊入口移入群管理，并以 matching joined-group 的 `canManageAdmins` 作为群主权限事实；详情页继续消费 shared conversation auto-delete facade |
| ownership | `canManageChatAutoDelete` 唯一投影页面授权；`ChatAutoDeleteSettingsRow` 唯一持有入口文案、值格式和 React Router 子路由 |
| boundary | 不修改 auto-delete Gateway/SQLite/mutation、SDK DTO、RN business、Desktop 或其他群管理能力 |
| verification | fail-first role/location contract；focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build、RN protected diff、cleanup |
| browser | 只读检查取决于当前登录账号拥有单聊和群主群样本；不执行自动删除保存 mutation |
| status | `completed/done-local/clean; entry-owner-converged; browser-single-owner-and-member-entry-pass/admin-role-gated` |

## W6.a6.20.69 Group Announcement Entry Role Visibility

| field | value |
| :--- | :--- |
| source | RN `GroupSettingsScreen`：只要当前群成员角色不是普通成员，就显示“群公告”；是否可发布由公告详情页的独立编辑权限判断 |
| capability | H5 群设置以 matching joined-group 的 `currentUserRole` 控制公告入口，owner/admin 可查看，member 隐藏；详情页继续使用 `canEditAnnouncement` 控制发布 |
| ownership | `buildChatSettingsView` 唯一投影入口可见性；`GroupAnnouncementPage -> GroupTextDetailPage` 继续唯一投影编辑能力 |
| boundary | 不修改 SDK role/permission DTO、公告发布/已读链、Gateway、SQLite、RN business 或其他群管理能力 |
| verification | fail-first view matrix；focused/full H5、SDK Web regression、verify/typecheck/boundary/assets/build、RN protected diff、cleanup |
| browser | 只读检查取决于当前登录账号是否存在 admin/owner 群样本；不执行公告发布、已读或角色 mutation |
| status | `completed/done-local/clean; presentation-only; browser-owner-and-member-role-pass/admin-and-mutation-gated` |

## W6.a6.20.68 Archived Conversation Global Action Menu Parity

| field | value |
| :--- | :--- |
| source | RN `ConversationListScreen(mode=archive)`：返回/标题右侧继续渲染与消息首页相同的 `GroupActionBubble` 四项菜单 |
| capability | H5 `/conversations/archived` 的 Navbar 右侧复用唯一 `HomeActionMenu`，恢复扫一扫、开始群聊、添加朋友、群发消息入口 |
| ownership | `HomeActionMenu` 继续唯一持有气泡开关、外点关闭和四条 React Router 路由；归档页只负责插槽消费 |
| boundary | 不复制菜单/路由，不修改归档 sync/cache/action、SDK source、RN business 或四个目标页业务逻辑 |
| verification | fail-first raw contract；focused 4 files/6 tests；H5 full 121/371；SDK Web 98/406；`npm run verify`、typecheck/boundary、466 assets、1173-module build、diff/cleanup |
| browser | `.97` 在当前真实登录标签打开归档 Navbar 菜单，点击“添加朋友”进入共享搜索并取消精确回归档；空态 412/412 |
| status | `completed/done-local/clean; shared-presentation-owner; browser-readonly-pass` |

## W6.a6.20.67 Archived Conversation Pinned Background Parity

| field | value |
| :--- | :--- |
| source | RN `ConversationListScreen`：主 header 只跟随可见会话置顶；归档通栏在可见或归档任一集合存在置顶会话时使用置顶背景 |
| capability | H5 通过纯投影给归档通栏追加 `is-pinned`，复用现有置顶主题变量 |
| ownership | `shouldUsePinnedArchiveBackground` 唯一读取两个已加载 cache 集合；页面/CSS 只负责 presentation |
| boundary | 不改归档同步、排序、缓存、长按动作、header 条件、SDK source 或 RN business |
| verification | focused 4 files/17 tests、H5 full 120/370、SDK Web 98/406、`npm run verify`、typecheck/boundary、466 assets、1173-module build、diff/hygiene scan |
| browser | 临时授权登录被真实 SQLite 多标签锁拒绝并已关闭；未注入会话或执行归档/置顶 mutation，自然像素样本保持 data gate |
| status | `completed/done-local/clean; presentation-only; browser-data-lock-gated` |

## W6.a6.20.66 Conversation List Presence Parity

| field | value |
| :--- | :--- |
| source | RN `ConversationListScreen`：只观察单聊对端，单聊 `userID` 缺失时兼容 `si_/single_/direct_` 会话 ID；群聊不查询、不显示在线绿点；每分钟和下拉刷新更新 |
| capability | H5 主列表与归档列表共用单聊在线状态 hook；头像右下角按 RN 17/10px 结构显示真实在线绿点 |
| ownership | `WebIMSync.presence` 继续唯一持有 HTTP、WS、账号隔离与 lifecycle；H5 `useConversationPresence` 只持有目标选择、分钟轮询、下拉刷新和内存投影 |
| boundary | 不新增 Gateway/WebSocket/SQLite/DTO/cache owner；未知状态不伪造在线；不修改 SDK source、generated behavior 或 RN source/caller |
| verification | focused 3 files/6 tests、H5 full 119/368、SDK Web 98/406、`npm run verify`、typecheck、466 assets、1173-module production build、diff/entropy scan |
| browser | 临时标签使用已授权测试账号时再次被真实 SQLite 多标签互斥锁拒绝并已关闭；在线像素与 realtime 切换保持单标签 data gate |
| status | `completed/shared-core-ready/web-consumed/rn-frozen; browser-data-lock-gated` |

## W6.a6.20.65 Muted At-Self Conversation Reminder Parity

| field | value |
| :--- | :--- |
| source | RN `ConversationListScreen`：静音普通未读显示红点，静音但命中 `@当前用户` 的会话仍显示数字未读角标且不加 `[n条]` 摘要前缀 |
| capability | H5 会话行区分普通静音、定向 `@我`、`@所有人` 和手动未读；只有定向 `@我` 越过静音降级规则 |
| ownership | `conversation-unread-view.ts` 唯一持有定向提醒识别与角标优先级；摘要与 `ConversationRow` 共同消费，不复制判断 |
| boundary | 纯 H5 presentation；不修改 unread/manualUnread/mute 数据、已读回执、Gateway、SQLite、SDK 或 RN source/caller |
| verification | focused 2 files/12 tests、H5 full 117/363、`npm run verify`、typecheck、466 assets、production build、diff/entropy scan |
| browser | 临时标签使用已授权测试账号时被真实 SQLite 多标签互斥锁拒绝；未关闭用户页面、未注入 session/mock，像素样本保持 lock-gated |
| status | `completed/done-local/presentation-owner-converged; browser-data-lock-gated` |

## W6.a6.20.64 Me Profile ID Clipboard Parity

| field | value |
| :--- | :--- |
| source | RN `ProfileScreen` 个人资料 ID 行：点击复制当前 userID，成功后显示“已复制ID” |
| capability | H5 `/me/profile` 的 ID 行恢复可点击复制；`/me` 首页既有 ID 复制同时收敛到同一个 me-domain browser clipboard adapter |
| ownership | 本片关闭时由 `copyMeProfileUserID` 持有个人资料域 trim、空 ID 拒绝和 Clipboard 翻译；已被 `.85` 的跨个人/联系人资料全局 H5 adapter supersede |
| failure semantics | Clipboard 不可用或写入失败必须 fail-visible；只有 `writeText` resolve 后才显示成功，不允许 fake-success 或路由跳转 |
| boundary | 不修改 userID、profile DTO、Gateway、SQLite、认证状态或 RN source/caller；不新增跨域全局抽象 |
| verification | focused 2 files/7 tests（连同既有 profile editor 共 3 files/8 tests）、H5 full 116/361、`npm run verify`、typecheck、466 assets、1169-module build；412x786 真实账号点击/反馈/reload/边框/overflow proof |
| status | `completed/done-local/presentation-platform-adapter; browser-success-pass` |

## W6.a6.20.63 Me Home Profile Edit Shortcuts

| field | value |
| :--- | :--- |
| source | RN `ProfileScreen` 首页头像“修改头像”和昵称“编辑昵称”快捷交互 |
| capability | `/me` 头像进入 `/me/profile` 并自动打开既有来源弹层；昵称直接进入 `/me/profile/nickname` |
| ownership | 用户资料头像 owner 继续唯一归 `/me/profile -> profile.updateAvatar`；昵称保存继续归既有 editor -> `profile.update`；首页只持有 React Router 入口 |
| replay guard | `openAvatarSource` 只接受精确布尔 `true`，首次消费后 replace 清空 history state；刷新/直达不得重放弹层 |
| boundary | 不复制上传、Gateway、SQLite、资料 DTO 或保存状态；真实文件选择和资料 mutation 仍需授权验收 |
| verification | focused 2 files/4 tests、H5 full 115/357、typecheck（含 SDK Web boundary/build:web/sync:web）、466 assets、1169-module build；412px 真实账号路由/弹层/reload/零溢出 proof |
| status | `completed/presentation-route-adapter; browser-readonly-pass/mutation-acceptance-gated` |

## W6.a6.20.62 Contact Server Search Tabs And Identity Placeholder Normalization

| field | value |
| :--- | :--- |
| source | RN `ContactSearchScreen` 的好友/群聊服务器搜索页签，以及未设置昵称的 `im-` 后四位展示规则 |
| capability | `/contacts/search` 增加群聊页签；服务端 `nickname===userID` 与空昵称统一显示 `im-` + userID 后四位 |
| ownership | 用户搜索与占位昵称归 SDK `contacts.searchUsers/normalizeIMUserNickname`；群搜索关系三态归 `groupApplications.search`；H5 仅持有 Tab、结果行和 React Router 跳转 |
| boundary | 完整 userID/groupID 继续用于查询、ID 副标题、路由、Gateway 与 SQLite；不复制 transport、关系判断、DTO 或 cache |
| verification | SDK Web 98/406、H5 114/354、typecheck、runtime boundary、build:web/sync:web、1169-module production build；真实账号 `im-9162`、双 Tab、群空态、412px 零溢出/日志 proof |
| status | `completed/shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass` |

## W6.a6.20.61 Unnamed User Display Fallback

| field | value |
| :--- | :--- |
| source | RN `src/utils/user-display-name.ts`：无昵称显示 `im-` + userID 后四位 |
| capability | SDK 公开唯一 helper，H5 联系人、资料、会话、群成员、消息和通话投影共用 |
| boundary | 只改可见显示名；不改 userID、account/phone/email 搜索字段、路由、Gateway 参数或 SQLite identity |
| convergence | RN 现有同行为 helper 保持冻结，状态为 `shared-core-ready/web-consumed/rn-frozen` |
| verification | SDK Web 98/406、H5 114/352、boundary、typecheck、1168-module build；真实账号页面与 clean console proof |
| status | `completed/local-verified/browser-sample-gated` |

## W6.a6.20.60 Me Home Menu Grouping Parity

| field | value |
| :--- | :--- |
| source | RN `ProfileScreen` 个人中心首页：个人资料/通用设置同卡，账号安全位于独立第二卡 |
| capability | H5 `/me` 恢复 RN 菜单分组、顺序和 16px 卡间距，保持三个既有 React Router 入口 |
| boundary | 仅修改 H5 presentation；profile/settings/security facade、路由语义、SDK 与 RN source/caller 均不变 |
| inventory finding | RN 会话标题的全局静音来自 OpenIM `globalRecvMsgOpt`，不是 Gateway `setting.notification`；当前 Web SDK 缺少该 OpenIM 用户设置能力，禁止用通知偏好替代 |
| verification | H5 full 114 files/351 tests、H5 typecheck、1166-module production build、diff scan；真实账号两卡 2/1 行、16px gap、380px 同宽、零 overflow/log browser proof |
| status | `completed/done-local/presentation-only; browser-pass` |

## W6.a6.20.59 Calls Edit Chrome Parity

| field | value |
| :--- | :--- |
| source | RN `ChatHomeScreen -> CallListScreen.onChromeHiddenChange`；通话编辑态隐藏主 TabBar，编辑栏成为唯一底部 chrome，退出/隐藏时恢复 |
| capability | H5 `/calls` 编辑态不再同时显示主 TabBar 与批量操作栏；编辑栏贴视口底部并为列表保留安全区空间 |
| boundary | `PrimaryTabsLayout` 唯一决定全局底栏；`CallsPage` 只报告本地编辑态；calls facade、SQLite、同步、删除、RTC、SDK 和 RN source/caller 均不变 |
| implementation | 新增纯可见性判定；Calls Activity 上报并在 cleanup 归还控制权；编辑态移除 `has-tab-bar` 高度并以 safe-area edit bar 占据底部 |
| verification | focused 2 files/6、H5 full 113/350、H5 typecheck、1166-module build、diff/entropy scan；第二账号 1280x720 编辑前/中/后 geometry 与 clean-console proof |
| status | `completed/done-local/app-shell-owner-converged; browser-pass` |

## W6.a6.20.58 Primary Tab Scene Retention

| field | value |
| :--- | :--- |
| source | RN `ChatHomeScreen` 四个 React `Activity` 主场景；Tab 切换保留页面状态和滚动，隐藏场景暂停副作用 |
| capability | `/conversations`、`/contacts`、`/calls`、`/me` 保持 React Router SPA URL，同时不因 Tab 切换卸载页面；每个场景持有独立滚动视口 |
| boundary | H5 `PrimaryTabsLayout` 只拥有主场景生命周期、可见性、滚动保存/恢复和底栏；页面业务 facade、SDK、RN source/caller 均不变 |
| implementation | 四个 route 使用显式空 marker；主布局常驻四个 `Activity`；外层 scene 隔离滚动并忽略隐藏夹回事件；下拉刷新与 route motion 只读取活动 scene |
| verification | focused 4/10、full H5 112/347、SDK Web 98/403、H5/SDK Web typecheck、boundary、1165-module build、diff check；第二账号 browser state/scroll/geometry/clean-reload proof |
| status | `completed/done-local/app-shell-owner-converged; browser-pass` |

## W6.a6.20.57 Primary Contacts Tab Verification Badge

| field | value |
| :--- | :--- |
| source | RN `HomeTabBar` 的通讯录角标、`ChatHomeScreen` 好友/群申请计数和联系人刷新入口 |
| capability | 全局通讯录 Tab 展示好友申请未读与群申请总数之和；TabBar 与通讯录 shortcut 共用一个主布局快照；进入/下拉后刷新 |
| boundary | H5 只持有 Tab 生命周期与展示；计数读取继续调用既有 SDK `friendApplications.getUnreadCount/groupApplications.getUnreadCount`；RN business/source 冻结 |
| implementation | `PrimaryTabsLayout` 组合 hook；Provider 暴露只读计数/刷新端口；同账号并发读取合并并阻止旧账号结果回写；删除主 Tab 禁用遗留 |
| verification | focused 3/7、full 111/344、H5 typecheck、1165-module build、diff check；真实 2 联系人、四 Tab SPA 往返、零值隐藏 browser proof |
| status | `completed/done-local/presentation-owner-converged; non-zero-data-gated` |

## W6.a6.20.56 Legacy Chat Forward Route Compatibility Convergence

| field | value |
| :--- | :--- |
| source | `.54` 删除独立转发目标页后遗留的旧 React Router 地址、浏览器历史和进程内稳定 ID state |
| capability | 旧 `/conversations/:conversationID/forward` 安全 replace 回当前聊天；有效同源稳定 ID 只触发现有聊天内目标弹窗一次；刷新/后退不重放 |
| boundary | H5 只持有 route/state compatibility；目标 presentation 继续唯一归 `ChatTargetPickerModal`，转发业务继续归 shared SDK；RN business/source 冻结 |
| implementation | 新增无 UI 的 `ChatForwardCompatibilityRedirect`；复用严格 route reader，校验路由、来源与加载后当前会话一致，并立即清除一次性 state |
| verification | focused 1/4、full 110/341、typecheck、1165-module build、diff check；旧 URL、reload、back 与零日志 browser proof |
| status | `completed/done-local/compatibility-only; browser-readonly-pass` |

## W6.a6.20.55 Chat Initial Message Skeleton Parity

| field | value |
| :--- | :--- |
| source | RN `ChatMessageSkeleton.tsx` 的固定 incoming 气泡、群头像、骨架尾巴、shimmer 与底部裁切行为 |
| capability | 聊天冷首屏使用 12 条 RN 同构骨架；群/单聊头像差异明确；加载内容锁定消息视口并从底部排列 |
| boundary | H5 只持有 loading presentation 和 CSS；history/cache/loading 状态继续由既有 ChatPage/SDK owner 提供；RN business/source 冻结 |
| implementation | 新增独立 `ChatMessageSkeleton` 与专属 CSS；删除 `ChatMessageList` 内旧 4 条交替占位；复用 RN skeleton tail 资产和主题变量 |
| verification | H5 focused 1/3、full 110/339、466 assets、typecheck、1164-module build；第二账号真实短群聊底部几何/稳定 reload；自然冷帧因 cache 过快 gated |
| status | `completed/done-local/presentation-only; cold-frame-timing-gated` |

## W6.a6.20.54 Unified Chat Target Picker And Short-List Bottom Alignment

| field | value |
| :--- | :--- |
| source | RN 二维码分享目标弹层、转发/群发/名片选择流程与聊天 FlatList 底部对齐行为 |
| capability | 好友/群聊目标统一封装为可配置单选/多选弹窗；多选提供当前筛选范围 ALL；一次确认可发送多个目标；短消息列表贴近输入区底部 |
| boundary | H5 只持有 modal/search/tab/selection/route source 与 CSS；SDK 持有多目标转发、type108 名片 batch-send 和部分结果；RN business source 冻结 |
| implementation | 新增 `ChatTargetPickerModal`；聊天转发留在当前页；群发、二维码、用户/群名片复用同一弹窗；删除独立转发目标页；消息列表增加内部 bottom-aligned stack |
| verification | SDK focused 3/13 + all-runtime boundary/typecheck；H5 full 109/337、typecheck、1161-module build；登录态弹窗跨 Tab/ALL、URL 不跳转和短列表底对齐 browser proof |
| status | `completed/shared-core-ready/web-consumed/rn-frozen; mutation-acceptance-gated` |

## W6.a6.20.53 Pull Refresh Indicator Owner Convergence

| field | value |
| :--- | :--- |
| source | 已完成的 RN `RefreshControl` 页面与 H5 全部 `usePullRefresh` 生产消费者 |
| capability | 跨页面下拉、松开、刷新三态只由一个全局展示 owner 投影，页面刷新 facade 和状态机不变 |
| boundary | H5 仅收敛 JSX/CSS；不修改 refresh callback、Gateway、SQLite、DTO、mutation、SDK 或 RN business |
| implementation | Calls、Contacts、JoinedGroups、CreateGroup、会话/归档/搜索、群成员、添加管理员、转让群主共 10 页改用 `PullRefreshIndicator`；删除 9 个 CSS 文件中的局部提示选择器 |
| verification | 20/20 consumer contract、legacy selector zero、focused/full H5、assets、typecheck、build、真实登录态四路由只读 browser smoke |
| status | `completed/done-local/presentation-owner-converged; physical-touch-gated` |

## W6.a6.20.52 Forward Target Pull Refresh

| field | value |
| :--- | :--- |
| source | RN `ForwardTargetSelector.tsx` 普通转发选择页的 `RefreshControl` 与既有 H5 转发目标主链 |
| capability | 最近聊天、好友、群聊三类目标顶部单指下拉、统一三态反馈、失败保留当前目标/Tab/搜索词 |
| boundary | H5 只负责手势和提示；三类事实继续复用 `loadChatForwardTargets -> WebIMSync`；不打开目标或提交真实转发 |
| implementation | `ChatForwardTargetPage` 复用全局 `usePullRefresh/PullRefreshIndicator`；手动刷新全部成功后才替换三类快照 |
| verification | pull/shared-owner contract、既有 source/view tests、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-gated` |

## W6.a6.20.51 Blacklist Pull Refresh And Indicator Convergence

| field | value |
| :--- | :--- |
| source | RN `ProfileScreen.tsx` 黑名单 FlatList 的 `refreshing/onRefresh` 与既有 H5 黑名单主链 |
| capability | 黑名单顶部单指下拉、三态反馈、失败保留旧列表与搜索词；跨页面刷新提示单 owner |
| boundary | H5 只负责手势和提示；读取与解除继续复用 shared `blacklist`；不执行真实解除 mutation |
| implementation | `MeBlacklistPage` 复用全局 `usePullRefresh`；七个页面收敛到 `PullRefreshIndicator`，删除两套旧组件与重复 CSS |
| verification | pull/shared-owner contract、黑名单筛选、全局提示消费者、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; empty-data-and-physical-touch-gated` |

## W6.a6.20.50 Group Applications Pull Refresh

| field | value |
| :--- | :--- |
| source | RN `GroupApplicationListView.tsx` 的 `RefreshControl` 与既有 H5 指定群申请处理主链 |
| capability | 指定群申请列表顶部单指下拉、统一三态反馈、失败保留旧列表与搜索词 |
| boundary | H5 只负责手势和提示；读取与 accept/reject 继续复用 shared `groupApplications`；不执行真实申请 mutation |
| implementation | `GroupApplicationsPage` 复用全局 `usePullRefresh` 与既有 `VerificationPullIndicator`；刷新成功后才替换页面事实 |
| verification | pull/shared-owner contract、既有申请 view、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-and-action-data-gated` |

## W6.a6.20.49 Group Mute Pull Refresh

| field | value |
| :--- | :--- |
| source | RN `GroupMuteScreen.tsx` 手动禁言列表 `RefreshControl` 与既有 H5 群禁言主链 |
| capability | 群禁言页顶部单指下拉、统一三态反馈、失败保留禁言范围与成员快照 |
| boundary | H5 只负责手势和提示；刷新继续复用 shared `groups/groupMembers`，mutation 继续复用 `groupManagement`；不执行真实禁言 |
| implementation | `GroupMutePage` 复用全局 `usePullRefresh`；提示收敛为三个群页面共用 `GroupPullRefreshIndicator` |
| verification | mute/pull/shared-owner contract、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-gated` |

## W6.a6.20.48 Group Member Selection Pull Refresh

| field | value |
| :--- | :--- |
| source | RN 群邀请与移除成员选择页的 `RefreshControl`，以及既有 H5 群成员选择主链 |
| capability | 两页顶部单指下拉、统一三态反馈、失败保留旧候选与选择 |
| boundary | H5 只负责手势和提示；同步继续复用 shared `groups/groupMembers/contacts`；不执行邀请或移除 mutation |
| implementation | 两页复用全局 `usePullRefresh` 与 `GroupMemberSelectionPullIndicator`；所有 facade 成功后才一次替换候选事实 |
| verification | shared-owner/pull contract、既有页面 view、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-gated` |

## W6.a6.20.47 Joined Groups Pull Refresh

| field | value |
| :--- | :--- |
| source | RN `ContactGroupListScreen.tsx` 的 `RefreshControl` 与既有 H5 `/contacts/groups` 主链 |
| capability | 群列表顶部单指下拉、刷新反馈、失败保留旧快照 |
| boundary | H5 只负责手势与提示；列表同步继续复用 shared `groups.sync`；不执行群生命周期 mutation |
| implementation | `JoinedGroupsPage` 复用全局 `usePullRefresh`，页面 CSS 投影统一三态提示 |
| verification | pull/shared-owner contract、群列表 view、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-gated` |

## W6.a6.20.46 Create Group Selection Review And Pull Refresh

| field | value |
| :--- | :--- |
| source | RN `CreateGroupScreen.tsx` 普通建群选中态、已选好友复核层与 `RefreshControl` |
| capability | 选中头像预览、清空、逐个移除、搜索返回和联系人下拉刷新 |
| boundary | H5 只负责 UI/手势；创建与联系人读取继续复用 shared SDK 既有 owners；不执行真实建群 mutation |
| implementation | `CreateGroupSelectedFriends` + 纯候选投影 helper + `usePullRefresh`；复用全局 `InteractionModal` |
| verification | helper/component/pull focused、full H5、assets、typecheck、build、真实登录态只读浏览器 smoke |
| status | `completed/done-local/presentation-only; physical-touch-gated` |
- 防止 Web 自建业务分支：共享能力先在 `im28-sdk` 收敛为平台中性实现，再由 H5/Web production caller 消费。RN 当前业务冻结；未获独立授权前不改 RN caller，状态标记 `shared-core-ready/web-consumed/rn-frozen`，不得伪报跨端完成。

## Scope

- `apps/web/**`：Vite + React H5 应用壳及后续页面能力。
- 页面切换统一由 React Router 管理，页面组件不自行操作 History API。
- 跨页面动效与 modal 生命周期统一归 `apps/web/src/components/interaction/**`；只操作瞬时 presentation state，不持有业务状态、SDK 调用或路由决策。
- RN 样式、静态资产、页面状态与 API 能力只做浏览器适配，不另行设计。

### W6.a6.20.17 Chat Message Action Modal

| field | value |
| :--- | :--- |
| source | RN `useChatMessageActionMenu -> MessageActionBubbleModal -> ActionBubbleMenu` |
| target | H5 `ChatMessageAction -> ChatMessageActionModal -> InteractionModal` |
| behavior | `500ms/8px` gesture、context/keyboard entry、full-screen blur、message preview、incoming-left/outgoing-right、viewport clamp、vertical reveal |
| invariant | 动作回调与 shared business owner 不变；preview inert；modal portal 必须位于 body；不得复制 Gateway/SQLite/消息状态机 |
| gate | pure layout tests + H5 typecheck/full verify + authenticated non-mutating browser smoke |
| stop | 不执行复制、编辑、转发、收藏、删除或消息发送；不改 RN/SDK business |

### W6.a6.20.18 Chat Link Action Surface Convergence

| field | value |
| :--- | :--- |
| source | RN 链接动作继续使用 `MessageActionBubbleModal` presentation；H5 `W6.a6.20.16` 旧链接菜单与 `W6.a6.20.17` 普通消息 modal |
| target | H5 `ChatMessageLinkAction/ChatMessageActionModal -> ChatActionModalSurface -> InteractionModal` |
| behavior | 链接普通点击不变；`500ms/8px` 长按、右键、打开/复制两项、收发靠边、viewport clamp 与全局遮罩统一 |
| invariant | shared URL projection、browser open port、clipboard success-only、普通消息动作业务均不变；旧 inline menu 必须退出生产链 |
| gate | anchor/layout behavior tests + existing link contracts + H5 typecheck/full verify + authenticated non-mutating ordinary-message regression |
| stop | 不制造链接消息、不打开外链、不复制或执行消息 mutation；不改 RN business；不运行 RN/desktop builds 或 `build:package:desktop:web` |

### W6.a6.20.19 Friend Profile Presence

| field | value |
| :--- | :--- |
| source | RN `UserProfileScreen` 的好友 presence 初始查询、订阅和导航栏在线/离线投影 |
| target | SDK `createIMUserPresenceSync/WebIMSync.presence` + H5 `useContactProfilePresence` |
| behavior | 先订阅再查询；OpenAPI 100 人分批；realtime 胜过迟到 HTTP；未知状态保持未知；黑名单展示优先 |
| invariant | presence 只存当前账号 runtime 内存，不写 SQLite；退出、切号、token 失效、被踢和 dispose 清订阅；页面不得直调 Gateway/WebSocket |
| gate | SDK behavior/runtime tests + SDK/H5 typecheck/full verify + 真实好友资料只读浏览器 smoke |
| stop | 不修改 RN caller/business，不执行资料 mutation，不运行 RN/desktop builds 或 `build:package:desktop:web` |

### W6.a6.20.20 Group Member Presence

| field | value |
| :--- | :--- |
| source | RN `GroupMembersScreen -> useGroupMemberOnlineStatus` 的普通群判定、批量查询与在线绿点 |
| target | SDK `normalizeIMGroupMode/isIMNormalGroupMode` + H5 `useObservedUserPresence` |
| behavior | `1|normal` 标准化为普通群；仅普通群批量观察完整成员；只显示明确在线成员；large/unknown fail-closed |
| invariant | 复用 `.20.19` shared presence HTTP/realtime/lifecycle；页面不持有 Gateway/WebSocket/SQLite 或群模式 magic number |
| gate | SDK group-mode/joined-group/presence tests + H5 view/typecheck/full verify + 真实普通群成员页只读 smoke |
| stop | 不改 RN caller/business，不执行群/成员 mutation，不运行 RN/desktop builds 或 `build:package:desktop:web` |

### W6.a6.20.21 Group Settings Preview Presence

| field | value |
| :--- | :--- |
| source | RN `GroupSettingsScreen -> useGroupMemberOnlineStatus` 只观察设置页预览成员并显示在线绿点 |
| target | H5 `ChatSettingsPage -> useObservedUserPresence`，复用 `.20.20` shared mode/presence owner |
| behavior | 仅普通群观察实际渲染的最多 10 名预览成员；只给明确在线成员显示 RN 14/8px 状态点 |
| invariant | 不新增设置页 presence service、HTTP/WebSocket/SQLite、群模式数字判断或完整成员订阅 |
| gate | H5 settings/group-member focused tests + H5/SDK Web typecheck/full verify + 真实普通群设置页响应式只读 smoke |
| stop | 不改 SDK/RN business，不执行群/成员 mutation，不运行 RN/desktop builds 或 `build:package:desktop:web` |
- `../im28-sdk/src/platforms/web/**`：浏览器 SDK、存储适配和后续 Gateway runtime。
- `docs/active/h5-foundation/**`：当前阶段的 plan/status/workset 真相源。
- `architecture.md`、`README.md`、`docs/web-im-storage.md`：稳定边界和已实现事实。
- `../im28-sdk/docs/shared-capability-consumer-matrix.md`：跨端 owner、实际消费者、compat debt 与退出条件真相源。

## Active Convergence Gate

- `W6.a6.12.1-rn-web-single-track-convergence-gate`：consumer matrix 已建立；conversation settings、auto-delete、conversation read/manual-unread/archive、message mutation、mention、search、realtime 和 clear-history 均已通过中性 facade、RN/Web actual callers 与旧路径删除完成本地收敛。
- H5 已闭环能力保留局部证据，但在 RN 接入同一 shared implementation 前只能标记 `shared-core-ready` 或 `compat-debt`。
- `W6.a6.18.3.3.1/.3.3.2` 已完成 shared clear-history core 与 RN/H5 production caller 收敛；旧 RN 整删/type2102 双轨已删除，真实破坏性 mutation 仍必须单独授权。

## Non-goals

- 不把当前可运行 H5 页面骨架视为 RN 视觉/交互迁移完成。
- 不复制 `im28-sdk` 已有的 DTO、Repository、Gateway client 和数据库 contract。
- 不直接复用 React Native runtime/`StyleSheet`，不在页面中调用 Gateway/OpenAPI，也不以第三方近似图标替换已有 RN 资产。
- 不在 Worker 与多标签页 writer 实现及浏览器并发证据完成前声明浏览器存储达到生产级并发能力。
- 不改变 `im28-phone` React Native 应用或原生工程。
- 不以“跨端收敛”为理由修改 RN 业务源码、测试或运行语义；只允许依赖/包接线、生成 SDK 包和不改变行为的 import specifier。

## Current Baseline

| area | current truth | source |
| :--- | :--- | :--- |
| Web application | Vite + React Router 根壳、404 与 authenticated `PrimaryTabsLayout` 已实现 | `apps/web`; `architecture.md` |
| RN parity foundation | 迁移合同已冻结；466 个资产按字节同步；auth entry、conversation、chat、contacts/contact-profile、friend/group applications、calls、me/profile/security、settings、global tab shell 与 onboarding core 均为 local/acceptance-gated；valid authenticated data/mutations、onboarding context、cache/network blocked or gated | `docs/rn-h5-migration-contract.md`; `apps/web/src/assets/rn`; `apps/web/src/styles/rn-theme.css` |
| shared SDK | `@im28/im-sdk/core` 提供平台中立 contract、Repository 和 Gateway client | `../im28-sdk/src/core.ts` |
| Web SDK/runtime | `sql.js + IndexedDB`、login/register/account-credential auth-bound lifecycle、notification/permission settings facade、public platform-term/client-version adapters、共享 mutation queue、HTTP/realtime sync、remote contact list/user search、peer profile/conversation/apply、call-record cache/sync/delete、current-profile read/update、preset/custom emoji、same-row retry、uploaded-media checkpoint recovery、shared forward、群 mention/realtime/clear-history/list-actions、群管理/创建、文本/图片/视频/文件/语音群发、二维码协议/个人与群码展示/公开群申请与聊天缓存查询已实现；当前 `test:web` 为 82 文件/337 测试 | `../im28-sdk/src/platforms/web/runtime/**`; `../im28-sdk/src/platforms/web/storage/**`; `../im28-sdk/src/sync/**` |
| Gateway runtime | real phone-code login、refresh restore、Gateway-backed reads、two-account tab isolation、dual WebSocket online and text delivery/SQLite convergence/list-back passed；offline SQLite-hit remains a deployment gate | `docs/runtime-contracts/web-gateway-runtime.md` |
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
| `W3.real-gateway` | offline SQLite-hit、W3 closeout and remaining W4/W6 mutation-backed final acceptance | read-only real login/data、dual-account online、real text delivery/SQLite convergence/list-back、W4 contract/sync and W6 local implementation |
| `W5.browser-matrix` | storage production acceptance | W6 local style/route/API implementation |

W4 本地实现以 W3 code/contract/storage gates 为 entry；已通过的真实登录/读取/online 不能被解释为消息投递、离线 cache 或 mutation 已验收。

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
  - onboarding 按 `route/state owner -> invite register retry -> complete-profile core -> avatar extension` 推进；pending verification secret 只驻留内存，contact 验证码缺口独立冻结。
  - 最近完成 `W6.a6.1-chat-media-read-core` 本地实现：复用已缓存 Gateway payload，迁移图片全屏预览、单实例语音播放/停止和视频全屏播放；文件下载、媒体发送上传、已读/连播与 RTC 延期，真实媒体数据保留为验收门。
  - 最近完成 `W6.a6.2-chat-image-file-send-core` 本地实现：相册图片和普通文件走三操作真实链，shared SDK 持有 optimistic SQLite 状态机，Web adapter 持有 OSS multipart I/O，H5 只持有选择器和 RN composer presentation；真实消息传输等待明确授权。
  - 最近完成 `W6.a6.3-chat-album-video-send-core` 本地实现：RN `mixed` 相册的视频分支已接入同一 shared 上传/状态 owner；Web 只读取浏览器视频元数据，视频 body、500 MB 上限和 OSS snapshot 规则归 shared SDK；真实上传/发送保留显式授权验收门。
  - 最近完成 `W6.a6.4-chat-voice-send-core` 本地实现：RN 按住录音、56px 上滑取消、2–60 秒约束与 audio send 已接入；共享 SDK 持有 Gateway body/SQLite 状态，Web adapter 仅持有 `getUserMedia/MediaRecorder/Blob` 生命周期；真实麦克风和消息传输保留显式授权验收门。
  - `W6.a6.5-chat-system-emoji-core` 已完成本地闭环：RN 第一套 Unicode 表情面板、当前选区插入/替换、完整 grapheme 退格和 21 项最近使用均已接入既有文本草稿；未发送真实消息。
  - `W6.a6.6-chat-illustrated-emoji-contract-freeze` 已完成：135 个 stable preset identity、133 个 fallback、UTF-16 entity、Gateway `packID/presetID`、SQLite/cache/render/failure contract 和 owner map 已冻结。
  - `W6.a6.6.1-shared-preset-emoji-core` 已完成：`im28-sdk` 单一持有 DTO/135 descriptors/document/entity、Gateway/Web send/SQLite v7，RN 已收敛为资源与 `MessageItem` thin adapters。
  - `W6.a6.6.2-h5-illustrated-emoji-ui` 已完成本地闭环：H5 接入 135 个镜像 PNG、第二 tab/独立 MRU/七列网格、DOM selection 与 entity-driven composer/message/conversation rendering；共享语义仍只归 `im28-sdk`，未发送真实消息。
  - 下一片 `W6.a6.6.3-illustrated-emoji-acceptance` 仅做一次经明确授权的 disposable conversation Network/Gateway/SQLite/list-back 验收，当前保持 `blocked-external`。
  - `W6.a6.7.1/.3.1` 已完成 SDK list/create/add/delete、schema v8 cache、共享上传边界和 type 115 optimistic send；`.2/.3.2/.3.3` 已接入 H5 第三 tab、五列 recent/all、React Router 管理页、选择/预览/确认删除、type115 长按/右键收藏入口和 stable-ID Pointer 本地排序。未选择文件、未执行 mutation、未提交排序、未发送消息；`.4` 真实验收保持 blocked-external。
  - `W6.a6.8-chat-media-export` 已完成本地实现：RN 图片保存和文件预览/下载复用 route-scoped media owner；H5 browser adapter 单一持有 fetch/Blob/object URL/open，真实缓存移动/桌面只读证明通过，未触发下载或外部打开。
  - `W6.a6.9-chat-failed-retry` 已完成文本 101 / 自定义表情 115 的同 ID、同 SQLite 行重试主链。
  - `W6.a6.10-chat-media-retry-stage` 已完成本地闭环：上传成功后先把严格校验的 102–105 Gateway body checkpoint 到同一行，Gateway 失败后重试跳过上传；runtime 在 Realtime 前把当前账号中断 sending 恢复为 failed。上传前失败不保存 File/Blob 且只能显式重选 source 创建新发送。
  - `W6.a6.11-chat-quote-reply` 已完成本地闭环：shared SDK 统一持有 type 114 body、引用快照、发送状态和失败恢复，H5 仅持有 action/composer/list projection；真实发送仍为显式授权验收门。
  - `W6.a6.11.1-sdk-sync-runtime-boundary` 已完成：Web 聚合入口迁入 `im28-sdk/src/platforms/web/sync`，shared `src/sync` 禁止反向依赖客户端实现，所有构建前置 AST 边界门禁；RN 产物不包含 Web 聚合入口且 RN 消费项目类型检查通过。
  - `W6.a6.12-shared-sync-neutral-naming-and-rn-adoption-contract-freeze` 已完成：`WebIM*` 被登记为历史兼容名称，当前不增加无消费者 alias；RN 未来只允许经独立 RN composition root 和 `src/services/openim/**` 显式切换。
  - `W6.a6.13-chat-copy-core` 已完成本地闭环：复用 RN copy 资产和现有消息 action owner，feature-local clipboard port 复制当前 projection，只有真实 clipboard Promise 完成后才显示成功；458px 菜单方向锚定无溢出。
  - `W6.a6.14-chat-forward-contract-freeze` 已完成：冻结单条/多选、三类目标、目标 chat 预览/反选/comment、batch/hidden-sender 分支、幂等 ID、逐行成败和 `forward_origin` 持久化要求。
  - `W6.a6.14.1-shared-forward-core` 已完成本地闭环：SDK schema v9、Mapper/Repository、来源重读、normal batch、registered hidden-sender body-copy、stable IDs 与逐行成败均由 shared owner 持有；RN runtime 未接线，H5 仅同步 Web 产物。
  - `W6.a6.14.2-h5-forward-target-preview` 已完成本地闭环：RN 单选/多选、三类真实目标、目标 chat pending preview、反选/隐藏发送者/comment/换目标和 shared submit caller 已接入；Router 只携带稳定 ID，页面不持有 Gateway body/cache owner。
  - `W6.a6.14.3-forward-acceptance` 已完成授权子集：14:59 normal 保留 origin，15:01 hidden 无 origin，两条均通过真实 Gateway、会话置顶和 SQLite/list-back；真实运行暴露的 initial pull/send 覆盖竞态已修复并加入顺序回归。
  - `.14.3` 的现行统一弹窗 desktop visual proof 已由 `.124` 关闭；仅剩可控 real partial-result，继续保持 `blocked-external`，禁止用 production fake failure 替代。
  - `W6.a6.15.1-shared-message-delete-core` 已完成本地闭环：SDK 从当前账号 SQLite 重读来源，区分 single update/batch-delete/local-only self，顶层失败不改本地，partial 只在事务中隐藏成功行；RN runtime 未接线。
  - `W6.a6.15.2-h5-message-delete-ui` 已完成本地闭环：单条 action、多选删除、RN 确认文案、self/all scope 和群角色呈现共用一个 flow，页面只调 `messages.delete`。
  - `W6.a6.15.3-message-delete-acceptance` 需在经明确授权的可丢弃消息上验证 `self/all/partial/list-back`，当前保持 `blocked-destructive-authorization`；只读 UI 验收不等于真实删除验收。
  - `W6.a6.16-chat-message-edit-contract-freeze` 已完成：冻结 RN 可编辑条件、Gateway update body、same-row cache 收敛、entity/editedAt 保留、失败不退出编辑态和 realtime owner。
  - `W6.a6.16.1-shared-message-edit-core` 已完成本地闭环：SDK 从当前账号 SQLite 重读本人已发送且非转发的 type 101，Gateway 成功后才用同 ID/顺序/状态替换原行；RN runtime 未接线。
  - `W6.a6.16.2-h5-message-edit-ui` 已完成本地闭环：action、RN 编辑预览、原文/entities 回填、取消/提交和 `已编辑 HH:mm` 投影只调用 shared facade；未提交真实编辑。
  - `W6.a6.16.3-message-edit-acceptance` 需在经明确授权的可丢弃文本上验证 Gateway、SQLite/list-back 与第二客户端 realtime，当前保持 `blocked-mutation-authorization`。
  - `W6.a6.17.1-shared-group-mention-core` 已完成本地闭环：SDK schema v10 持久化顶层 mention 身份，群成员 facade cache-first 全分页同步，type 106 发送沿用共享 optimistic 状态机；Web composition 显式接线，RN service/runtime 未接线。
  - `W6.a6.17.2-h5-group-mention-ui` 已完成本地闭环：群聊 composer 按 RN 规则提供 `@成员/@所有人` 候选、稳定 ID 选择和光标恢复，消息正文与会话列表消费 shared mention；命中当前用户显示 `[有人@我]`，all target 显示 `[所有人]`。
  - `W6.a6.17.2.1-unread-mention-conversation-projection` 已完成本地闭环：shared SDK 按 `lastReadSeq < seq` 从结构化 mention 身份中选择最近 incoming 提醒，组合已有群成员昵称；H5 保持 `草稿 > 未读 mention > 最新消息`，不扫描页面 history、不猜发送人。
  - `W6.a6.17.2.2-sender-display-name-cache-parity` 已完成本地闭环：成功联系人全分页在 shared mutation queue 中更新 `friendships/users`，会话 facade 按 RN `好友备注 -> 群昵称 -> 用户昵称` 只读解析；分页失败保留旧关系，冷 cache 不猜名称。
  - `W6.a6.18.1-chat-text-search` 已完成本地闭环：单聊 header 进入 React Router 搜索页，shared SDK 在当前账号 SQLite 中按会话和可见正文搜索；结果按稳定 client ID 返回详情并恢复目标缓存窗口，不触发 Gateway、WebSocket 或 mutation。
  - `W6.a6.18.2.1-shared-indexed-search-range` 已完成本地闭环：shared SDK 在当前账号 SQLite 中提供包含下界、排除上界的发送时间范围，并继续复用消息类型查询；不触发 Gateway，也不新增平台专属索引。
  - `W6.a6.18.2.2-h5-date-media-file-index` 已完成本地闭环：React Router 搜索页复刻 RN 日期、图片与视频、文件分类，按月/日投影缓存消息，媒体复用既有预览 owner，日期结果以稳定 client ID 返回聊天页。
  - `W6.a6.18.2.3-chat-settings-entry` 已完成本地闭环：单聊/群聊 header 更多按钮进入独立 React Router settings route，页面只读真实会话、群、成员 cache/facade，资料入口复用既有 profile route，“查看聊天记录/查找聊天内容”进入同一 search owner；未冻结的设置 mutation 不渲染。
  - `W6.a6.18.3-chat-settings-capability-contract-freeze` 已完成：会话设置按非破坏性、消息生命周期、破坏性和群权限域拆分，冻结 shared SDK/Gateway/SQLite/realtime owner 与逐 operation 授权门。
  - `W6.a6.18.3.1-shared-conversation-setting-core` 已完成本地闭环：setting detail、会话免打扰和会话置顶由 shared SDK 严格校验 Gateway target 并 success-only 收敛当前账号 SQLite；H5 只投影真实状态/失败，真实写入仍待授权，自动删除、清空记录和所有群管理 mutation 不进入本切片。
  - `W6.a6.18.3.2-auto-delete-contract` 已冻结：权威详情读取、枚举更新和 type 1701 realtime 为唯一三个 operation；服务端拥有新消息 expiry/实际删除，客户端只持久设置元数据和系统消息，不启动 timer 或追溯清理历史。
  - `W6.a6.18.3.2.1-shared-auto-delete-core` 已完成本地闭环：Conversation/schema v11、Repository、严格 read/update 与 type 1701 durable-message/setting convergence 由 shared SDK 单一持有；真实 mutation 不进入本地验收。
  - `W6.a6.18.3.2.2-h5-auto-delete-route` 已完成本地闭环：React Router 子页复刻 RN 九档，单聊开放、群聊 owner/admin fail-closed，显式确认后才调用 shared mutation，单聊/群聊 type 1701 使用操作者感知文案；真实 update 与第二账号 realtime 仍待授权。
  - `W6.a6.18.3.3-clear-history-contract-trace` 已完成只读冻结：`self|both|all_members`、stable operation ID、Gateway cursor、schema v12 clear boundary/list visibility、type 2102 control event、permission 与 route 后果均有唯一 owner；旧 OpenIM fallback、好友删除和退群 clear-history 排除。
  - `W6.a6.18.3.3.1-shared-clear-history-core` 已完成本地闭环：schema v12、精确 uint64 seq/cursor、stable operation ID、success-only transaction、单聊 list-hidden、type2102 幂等及 history/realtime late-message guard 由 shared SDK 单一持有；Web composition 已接入，RN/H5 production caller convergence 与真实 `self|both|all_members` acceptance 仍未完成。
  - `W6.a6.18.3.3.2-clear-history-consumer-convergence` 已完成本地闭环：RN 主动 action/type2102、Web runtime 和 H5 settings action 均委托 `createIMConversationClearSync`；旧 RN Gateway/本地整会话删除、OpenIM fallback 与控制事件业务分支已删除，H5 只保留 scope 文案、确认和导航。真实 `self|both|all_members` mutation 与双账号 list-back 仍需显式授权。
  - `W6.a6.18.3.4-h5-group-introduction-readonly` 已完成本地闭环：群设置按 RN 顺序显示群简介副标题并进入可深链 React Router 子页；页面只从当前账号会话与 joined-group shared facade 读取真实简介，空值、单聊误入、会话/群资料缺失均显式处理，不复制编辑 mutation。
  - `W6.a6.18.3.5-shared-group-announcement-readonly` 已完成本地闭环：shared joined-group DTO 显式投影公告、版本和当前账号编辑权限，H5 仅对 RN 同样的 owner/admin 展示公告入口并进入共用群文本详情页；未发布、标记已读或发送公告消息。
  - `W6.a6.18.3.6-shared-self-group-nickname` 已完成本地结构闭环：shared 群成员 facade 固定当前认证账号、校验 24 字非空昵称、Gateway 成功和身份一致后才单成员写回 SQLite；H5 群设置只持有 RN 同语义草稿/编辑层/保存反馈，RN 业务源码未改。真实保存、第二账号 realtime/list-back 和 RN consumer convergence 保留验收门。
  - `W6.a6.18.3.7-shared-group-card` 已完成 Web 本地结构闭环：shared contact facade 持有 Web 好友目标过滤、真实单聊打开、type108 群名片与可选 type101 附言状态机；H5 使用 React Router 好友单选页，RN 现有分享编排冻结不改。真实分享、失败重试与第二账号 list-back 保留验收门。
  - `W6.a6.18.3.8/.9/.10-shared-group-profile` 已完成 Web 本地结构闭环：shared group facade 持有 Web 群名、头像、简介的权限/校验/Gateway/cache 规则，H5 提供 React Router 页面和浏览器裁剪；RN `updateGroupInfo` 全链保持冻结基线，三项均为 `shared-core-ready/web-consumed/rn-frozen`。
  - `W6.a6.18.3.11-shared-group-announcement` 已完成 Web 本地结构闭环：shared SDK 持有 Web 公告发布、消息顺序、read-status 和 type1519 cache 收敛，H5 只保留表单/确认/横幅；RN 公告链保持冻结基线。真实发布、发送、read mark 与第二账号 list-back 保留授权门。
  - `W6.a6.18.3.12-group-profile-combined-compat-exit` 的 RN 改造结论已撤销：RN 请求类型、Gateway/OpenIM 兼容和事件投影恢复基线并冻结；Web 继续只暴露单字段/公告专属 facade，禁止组合输入。
  - `W6.a6.18.3.13-group-management-mutation-contract-audit` 的初始只读结论已由 `.13.1-.13.6` 完成 Web consumer 落地：permission、remove、invite、admin/owner、settings/mute、leave/dismiss 均由 shared owner 服务 H5；RN invite/remove/admin/transfer/settings/mute/leave/dismiss 生产链保持冻结。全部真实 mutation 仍保留授权门。
  - `W6.a6.18.3.13.1-shared-group-management-permissions` 已完成 Web 只读消费：SDK neutral resolver 持有 Web explicit capability/fail-closed 投影，H5 joined-group 快照驱动入口；RN 原 helper 已恢复并冻结，状态为 `shared-core-ready/web-consumed/rn-frozen`。
  - `W6.a6.18.3.13.2-shared-member-removal` 已完成 Web 本地消费：SDK 持有 Web 成员目标校验、exactly-once Gateway remove、事务和独立权威刷新，H5 提供 React Router 候选/搜索/确认页；RN Gateway/OpenIM 与页面事件链恢复冻结基线，不是 shared consumer。真实移除与第二账号 realtime/list-back 保留授权门。
  - `W6.a6.18.3.13.3-shared-member-invitation` 已完成 Web 本地消费：SDK 按审核开关持有好友/成员 preflight、唯一申请或直接邀请、严格响应和独立成员刷新，H5 仅保留选择与确认；RN 保持冻结。
  - `W6.a6.18.3.13.4-admin-owner` 已完成 Web 本地消费：SDK 持有管理员候选/上限、群主候选、owner capability、exactly-once、group/member 原子角色收敛和独立权威刷新；H5 `/settings/manage` 只持有 React Router、列表、picker 和 modal，RN 业务零修改。真实角色 mutation 与第二账号 realtime/list-back 保留授权门。
  - `W6.a6.18.3.13.5-group-settings-and-mute` 已完成 Web 本地消费：SDK `createIMGroupManagementSync` 持有 field capability、显式 patch、普通成员目标、exactly-once 和 strict group/member cache merge；H5 管理主页、禁言页与发言频率页只保留 React Router、草稿/确认/modal 和可见 partial-success，RN 业务零修改。真实 toggle/mute、server-denial 与第二账号 realtime/list-back 保留授权门。
  - `W6.a6.18.3.13.6-group-lifecycle` 已完成 Web 本地消费：SDK `createIMGroupLifecycleSync` 持有 leave/dismiss 权限、exactly-once Gateway write、strict group response 与 attachments/messages/group conversations/members/group 原子 cleanup；H5 群设置只保留 shared capability 入口、native dialog、导航和 `remote-only` 防重放锁定。RN 业务零修改，真实退群/解散未执行。
  - `W6.a6.18.3.14-group-creation` 已完成 Web 本地消费：SDK `group-creation.ts` 持有 2–998、稳定 ID 去重/本人拒绝、RN 默认群名、exactly-once Gateway、strict group/conversation identity 和群/会话原子事务；H5 `/groups/create` 与共享首页更多入口只保留好友选择、搜索和 React Router 导航。RN 业务零修改，真实创建未执行。
  - `W6.a6.18.3.15-message-broadcast-text` 已完成 Web 本地消费：SDK `message-broadcast*.ts` 持有 1–50 好友/群目标、稳定批次/消息 ID、单次 batch-send、逐目标 partial-result 与 success-only 消息/会话事务；H5 `/broadcast/select -> /broadcast/compose` 只保留 cache-first 目标选择、文本草稿和结果反馈。RN 广播业务零修改，真实发送未执行；媒体群发进入 `.15.1` 独立合同，扫码进入后续浏览器平台切片。
  - `W6.a6.18.3.15.1-message-broadcast-media` 已完成 Web 本地消费：SDK 图片/视频/文件群发复用普通消息媒体校验/body/OSS 快照 owner，整批 upload once + batch-send once，上传失败零 Gateway 且切号 fail-closed；H5 compose 只保留 RN 资产入口、浏览器 File/video metadata、可回收预览和结果卡片。RN 广播业务零修改，真实文件选择/上传/发送未执行；语音进入 `.15.2`。
  - `W6.a6.18.3.15.2-message-broadcast-voice` 已完成 Web 本地消费：SDK `prepareWebIMAudioUpload` 同时服务普通聊天和群发；H5 compose 直接复用聊天 recorder/hook/gesture/CSS owner。只读切换了语音模式，未按住、未请求权限、未录音上传发送；RN 广播业务零修改。
  - `W6.a6.18.3.16-.19-qr-code-chain` 已完成 Web 本地消费：SDK `modules/qr-code` 统一用户/群二维码协议，H5 browser adapter 承担扫码/Canvas/PNG；个人和群二维码共用展示 owner，应用内分享与普通转发共用 `forward-target-source`，确认后只走 shared `messages.sendImage`。真实相机/相册、群申请、PNG 上传/消息发送和第二账号 list-back 均未执行，RN 业务零修改。
  - `W6.a6.20.1-forgot-password-methods` 已完成 RN parity：账号登录不再用“接口不存在”代替动作，手机号、邮箱和客服说明复用全局原生 modal；未新增已下线忘记密码 API。RN 网络设置依赖 native HTTP/OpenIM proxy，H5 登记 `web-not-applicable`，Electron/Desktop 后续由独立 platform adapter 承接。
  - `W6.a6.20.2-chat-composer-card-send` 已完成本地闭环：shared SDK `messages.sendCard` 统一用户/群 type108 当前会话发送、状态收敛与失败重试；H5 附件面板复用 RN 名片资产和 cache-first 用户/群选择器。隐藏发送人转发仍维持既有不支持 type108 的独立矩阵，RN 业务未改，真实发送和第二账号 list-back 保留验收门。
  - `W6.a6.20.3-chat-composer-camera-rtc-entries` 已完成 H5 platform composition：拍照通过单张 `capture=environment` input 复用既有 album 校验和 shared 图片发送；单聊 RTC 通过共享通话方式弹层进入唯一 `WebIMCallProvider -> SDK calls`，群聊隐藏。未请求相机/媒体权限或发起真实呼叫，RN 业务未改。
  - `W6.a6.20.4-chat-composer-pending-attachment` 已完成本地闭环：SDK shared core 固定单媒体待发送判定、编辑态附件互斥和 `media -> file -> text` 提交顺序；H5 文件选择后展示 RN 同款待发送栏并在一次 operation 内串行调用既有消息 facade。RN 业务未改，真实文件上传、带草稿组合发送和第二账号 list-back 未执行。
  - `W6.a6.20.5-group-server-search` 已完成本地与真实账号空态闭环：SDK transport 保留群搜索 wrapper，shared facade 统一稳定 ID 去重及 `pending > joined > available`；H5 `/groups/create -> /groups/search` 复刻 RN 独立搜索 route，并把可申请结果接回既有申请页。当前账号真实关键字和已知旧群 ID 均返回空列表，因此可加入行、真实申请和加入后 list-back 继续 data-gated；RN 业务未改。
  - `W6.a6.20.6-onboarding-avatar` 已完成本地闭环：SDK `WebIMSync.profile` 统一静态头像/10MB/远端 URL、生产 Web OSS adapter、上传前后账号一致性和 update 响应身份；H5 复刻 RN 相册/拍照/取消，并把群/个人头像裁剪收敛为单一 512x512 JPEG Canvas owner。上传成功只更新 onboarding 内存草稿，最终完成才提交资料；有效新账号上下文、真实上传/update 和响应式视觉仍 blocked-external，RN 业务未改。
  - `W6.a6.20.7-personal-profile-avatar` 已完成本地闭环：SDK `WebIMSync.profile.updateAvatar` 以同一账号原子编排静态头像校验、生产 Web OSS 上传、avatar-only profile update 与响应身份校验；H5 `/me/profile` 增加 RN 同款头像行并复用 onboarding 的来源 sheet、文件合同和 512x512 JPEG crop owner。412px 已登录页面只验收打开/取消，无真实上传或资料 mutation；RN 业务未改。
  - `W6.a6.20.8-verification-unread` 已完成本地闭环：SDK friend application facade 统一专用未读与明确 IDs 单条已读，group application facade 统一审核 `total`；H5 通讯录入口和验证双 tab 共用 hook/角标，incoming 资料入口调用 shared mark-read。真实账号计数为 0 且好友申请均 outgoing/accepted，因此未执行 mutation；RN 业务未改。
  - `W6.a6.20.9-group-conversation-open` 已完成本地闭环：SDK `openIMGroupConversation` 统一按群目标 cache-first 打开规范会话，缺失或失效 ID 时只信 `getGroup` 返回的真实 conversation ID，严格校验 Gateway 群/会话身份并在当前账号队列内缓存 latest/conversation；H5 我的群聊、共同群聊和查找群聊已加入分支只消费同一 facade。真实账号无已加入/共同群，仅完成空态只读验收；RN 业务未改。
  - `W6.a6.20.10-home-search-pagination-and-stale-request` 已完成本地闭环：H5 首页全局搜索继续消费 shared contact/group/conversation cache 与 `messages.searchCached(limit, offset)`，补齐 RN 8 条聊天记录分页、同会话跨页计数/最远消息定位、request generation 和下拉重读。412px 真实账号证明缺省历史、好友与聊天记录分区；缓存不足 8 条使“查看更多”运行态 data-gated，RN/SDK 业务均未改。
  - `W6.a6.20.11-home-search-highlight-parity` 已完成本地闭环：H5 好友/群聊搜索结果按 RN 既有规则对标题与副标题执行大小写不敏感、多处命中品牌色，聊天记录汇总行保持无高亮。412px 真实账号证明好友命中为品牌色、聊天记录 `mark=0` 且零横向溢出；RN/SDK 源码均未改。
  - `W6.a6.20.12-home-search-clear-control` 已完成本地闭环：H5 复用 RN `xmark-circle` 补齐 AppSearchBox 默认清除按钮，页面统一复位 request generation、结果、分页和错误态；清除后显式恢复 input focus。412px 真实账号证明 2 行结果归零、历史恢复、input active 且零横向溢出；RN/SDK 业务均未改。
  - `W6.a6.20.13-group-admin-routes` 已完成本地闭环：H5 将 RN 群管理员列表和添加候选对齐为 `/settings/manage/admins`、`/admins/add` 两个独立 route，删除管理页旧管理员 modal/action；SDK 公开并唯一校验 `IM_GROUP_ADMIN_LIMIT`，H5 候选刷新时裁剪失效选择。`.112` 已用真实 owner 群证明空管理员列表、10 人上限与两位非本人候选；未执行角色 mutation，RN 业务未改。
  - `W6.a6.20.14-group-owner-transfer-route` 已完成本地闭环：H5 将 RN 群主转让对齐为 `/settings/manage/owner-transfer` 独立 route，删除管理页旧 picker、成员加载与 mutation action；管理员/群主页面共用 cache-first route data adapter，SDK 继续唯一持有候选、权限、exactly-once 与角色缓存事务。`.112` 已用真实 owner 群证明本人排除、成员分组与关闭返回；未选择目标或执行角色 mutation，RN 业务未改。
  - `W6.a6.20.15-joined-group-row-actions` 的长按、分享、改名和普通成员退出合同继续有效；其中旧群主显式转让分支已由 `.149.71` 替代。当前群主退出先经 shared 成员完整同步，再与群设置页复用 earliest-admin 双分支和单次 `groupLifecycle.leave`，由 Gateway 自动转移；真实 destructive mutation 仍未授权，RN 业务未改。
  - `W6.a6.20.16-chat-text-link-actions` 已完成本地闭环：SDK shared core 对齐 RN HTTP(S)/www 链接边界、尾随标点和 www->HTTPS；H5 富文本气泡实际消费 shared 片段，普通点击开隔离新标签，500ms 长按/右键只显示打开/复制，复制保留原文并阻断外层消息菜单。当前真实群聊无链接消息，只完成 412px 健康/零溢出/零 console 证明；未发送测试消息，RN business/caller 均未改。
  - `W6.a6.20.25-chat-audio-played-auto-next` 已完成本地闭环：SDK 纯规则统一语音稳定身份、RN localEx 已播放兼容和下一条 incoming type103 选择；H5 chat route 只持有账号/会话 localStorage、未播放红点和唯一 HTMLAudio，自然结束连播、手动停止/失败不推进。RN caller 冻结，真实认证媒体播放仍 data-gated。
  - `W6.a5.2.1.1-contact-pinyin-index-parity` 已完成本地闭环：H5 联系人展示层复用 RN `pinyin-pro@3.28.1` 和同一姓氏优先参数，中文索引、数字/符号 fallback 与分组顺序均有纯函数回归和真实 7 行只读证明；SDK/RN runtime 未改动。
  - `W6.a5.2.1.2-contact-route-code-split` 已完成本地闭环：`/contacts` 经 React Router `React.lazy + Suspense` 按路由加载，搜索过滤从拼音分组模块拆出；生产 main chunk 从 1,088.14 kB/366.35 kB gzip 降至 793.79 kB/222.24 kB gzip，联系人 chunk 为 294.92 kB/145.52 kB gzip。
  - `W6.a5.2.1.4-contact-list-interaction-contract-freeze` 已完成本地闭环：联系人页面先读账号 SQLite cache 再远端刷新，触屏下拉与会话列表共用单一浏览器 hook；右侧索引补齐 RN 顶部图标和活动态。RN 长按菜单四动作已冻结，但 H5 不在联系人 shared facade 缺失时创建部分菜单或 Web-only mutation。
  - `W6.a5.2.1.5.1-shared-friend-delete-core` 已完成本地闭环：SDK 以一次 Gateway `friend/delete` 和 success-only SQLite 事务统一删除关系、目标单聊与消息；RN/Web 均消费同一 facade，RN 菜单不再追加第二次会话删除。未执行真实破坏性请求。
  - `W6.a5.2.1.5.2-shared-user-card-core` 已完成本地闭环：SDK 统一名片目标过滤与一次批量 share operation，非空附言复用 shared direct-conversation mapper/Repository 和 type101 状态机；RN/Web 均消费同一 contact facade，旧 RN Gateway/helper 编排已删除。未执行真实分享或发送。
  - `W6.a5.2.1.5.3.1-shared-rtc-control-convergence` 已完成本地闭环：SDK 统一认证、稳定 ID、六项通话信令、LiveKit 凭证与 E2EE fail-closed；RN/Web production composition 均消费 `createIMCallControlSync`，旧 RN Gateway 控制 helper 和重复 token 校验已删除。Web LiveKit room/permission/route lifecycle 仍由 `.1.5.3.2` 平台 adapter 承接，未执行真实呼叫或媒体权限。
  - `W6.a5.2.1.5.3.2.1-web-call-media-session` 已完成本地闭环：SDK `/web` 通过注入式 `WebIMCallMediaPort` 单一持有连接、麦克风/摄像头、参与者、重连、自动播放恢复和终止快照，不保存 token、不进入 RN 包且不制造假房间。
  - `W6.a5.2.1.5.3.2.2-web-livekit-client-port` 已完成本地闭环：SDK Web port 映射真实 Room/track/device event，outgoing owner 组合 shared start/cancel/hangup/token-refresh 和媒体补偿；H5 全局 Provider 与 `/calls/active` 只持有 DOM/route/可见错误。LiveKit 在明确呼出且 Gateway start 成功后的 media connect 动态加载；未执行真实呼叫或权限。
  - `W6.a5.2.1.5.4-contact-action-menu-ui` 已完成本地闭环：H5 联系人行复用 300ms/8px 长按合同并渲染 RN 四动作；消息/通话先走 shared direct-conversation facade，通话交给唯一 Web call owner，名片分享由独立 React Router 好友选择页确认后调用 shared facade，删除保留 `self|both` 二次确认。未执行真实会话创建、名片分享、删除、呼叫或媒体权限。
  - `W6.a5.2.1.5.6-friend-source-convergence` 已完成本地与真实账号只读闭环：Gateway `Friend.source_type` 进入共享 DTO，SDK `friend-source.ts` 统一来源码、搜索推断与历史兼容文案；RN 删除页面 helper，H5 删除申请页映射表并由资料 facade 输出 `sourceType/sourceLabel`。真实好友资料显示“通过ID添加”和服务端添加时间，所有信息行左右占满卡片；未执行任何 mutation、通话或媒体权限。
  - `W6.a5.2.1.5.7-incoming-call-ringtone-contract` 已完成合同与第一步 consumer convergence：SDK strict parser 统一 type1601..1608、system/custom 包装、必填字段和 event ID 去重，RN 生产消息 helper 改为薄调用且原来来电 Provider/通知/消息行为回归通过；后续 runtime core 已由 `.5.7.1` 闭环，ringtone/UI 留到 `.5.7.2`，未执行真实呼叫、声音或权限。
  - `W6.a5.2.1.5.7.1-incoming-call-runtime-core` 已完成本地闭环：SDK `incoming-call-lifecycle.ts` 统一 event/call 去重、同 call accept/终态清理、终态先到防复活、有界状态和 pending 校验；Web runtime 订阅过程通知，在 login/restore/reconnect 与显式 refresh 时恢复 pending，公开 snapshot 不含 token，账号切换/退出清理身份。H5 全局来电 UI、visibility 调用、ringtone/autoplay 与 answer/reject 留到 `.5.7.2`，未执行真实呼叫、声音或权限。
  - `W6.a5.2.1.5.7.2-incoming-call-web-ui-ringtone` 已完成本地闭环：H5 全局 Provider 只投影 SDK 来电快照，具备 RN 同语义 banner/fullscreen/可拖动 floating、联系人资料补齐、visibility pending refresh、复用音频的循环铃声与 autoplay 手势恢复；SDK `/web` 来电编排保证 reject 不创建媒体，answer 成功后才惰性创建 LiveKit 会话并复用现有 active route。未执行真实呼叫、声音或媒体权限，真实双账号 RTC 仍为显式验收门。
  - `W6.a5.2.3.1-call-detail-shared-convergence` 已完成本地与真实账号只读闭环：中性 `createIMCallRecordSync` 统一 raw 字段无损缓存、详情远端优先合并回写和同日筛选；RN 删除旧详情 Gateway/cache merge owner，H5 以 React Router `/calls/:callID` 消费相同 facade。未执行通话、媒体权限或删除。
  - `W6.a5.2.3.2-call-record-list-consumer-convergence` 已完成本地结构闭环：shared facade 统一远端单页、完整分页、cache、删除、pending、批量保存与终结状态映射；RN 删除旧 Gateway service、通话表 CRUD/schema 和应用层状态推导，只保留资料补齐及事件投影。终结 wrapper 解析和 Web realtime 接线已由 `.3.3` 继续闭环，未执行真实删除或通话。
  - `W6.a5.2.3.3-web-realtime-call-history-composition` 已完成本地运行链：shared parser 统一 system/custom/RN 包装，Web runtime 对终结 frame 调用同一 `convergeTerminalSignals`，普通消息失败不阻断通话记录落库，`/calls` 通过 data version 重读 cache。真实双账号终结事件仍为外部验收门。
  - `W6.a5.2.15-group-members-route-parity` 已完成本地与真实账号只读闭环：复用既有 shared `groupMembers.listCached/sync` 和统一成员显示名 resolver，补齐 RN 群设置“全部”入口、完整成员页、搜索/分组/角色和资料返回；未新增 SDK/RN 逻辑，也未进入 presence、群管理 mutation、好友申请或 RTC。
  - `W6.a6.17.3-group-mention-acceptance` 仅允许在明确授权的可丢弃群聊中验证真实 type 106 send、Gateway top-level mentions、SQLite v10、realtime 和 list-back；当前保持 `blocked-mutation-authorization`。
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
- W6.a3.2 已关闭归档会话能力：SDK 统一全分页/latest-message/快照收敛并隔离普通缓存，RN/Web 实际消费同一 owner，H5 以 React Router 独立归档页完成入口、搜索、分页、下拉和菜单投影；真实 mutation/list-back 保留验收门。

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

## Completed W6.a6.20.26

- 对齐 type115 气泡：快照尺寸优先、旧消息自然尺寸探测、180px 最大宽度、保持比例且不放大小图。
- 复用 route-scoped media owner 增加 `emoji` 纯图片预览；普通图片保存工具栏保持不变。
- 非 HTTP(S) URL fail-closed，解码失败显示稳定失败态；未增加 SDK、Gateway、SQLite 或发送分支。
- focused 15 tests、full SDK Web 89/371、466 assets、typecheck、1125-module build 和真实 412px 路由只读检查通过。
- 当前真实会话无 type115，真实横/竖资源与预览点击保留为 sample gate。

## Completed W6.a6.20.27

- 新增 SDK shared 初始未读导航规则，统一精确 uint64、incoming、稳定消息身份和 RN type1201 边界。
- H5 增加最后已读锚点、未读分割线、剩余未读浮层、80% 可见度统计和 40px 最新端跟随保护；系统消息进入同一身份链。
- 搜索稳定消息定位优先；路由切换重置只读状态；不执行 mark-read/read receipt 或缓存 mutation。
- SDK focused 3 tests、H5 focused 8 tests、full Web 90/374、466 assets、RN/Web/Desktop SDK typecheck、H5 typecheck 与 1127-module build 通过。
- 真实 412px 当前账号无未读样本：验证零误画、最新端、零 overflow/error；非零未读视觉和滚动保留 data gate。

## Completed W6.a6.20.28

- SDK 同一未读模块增加可见身份到最高 incoming uint64 seq 的纯规则，H5 不复制序列或方向筛选。
- H5 复用 converged `conversations.markRead`，对齐 RN 的短列表真实测量、长列表用户交互、显式未读入口和最新端 realtime 放行门禁。
- 修复 shared partial read 收敛：服务端 `unread_count` 优先；无回包事实且未读到 `lastMsgSeq` 时保留原 unreadCount，避免 RN/H5 提前清角标。
- focused SDK 8 tests、H5 4 tests、full SDK Web 90/376、466 assets、runtime boundary、RN/Web/Desktop SDK 与 H5 typecheck、1128-module build 通过。
- 真实 412px 无未读会话零误画/overflow，干净 reload 零 error；真实非零 partial read、回包计数与 list-back 保留 data gate。

## Completed W6.a6.20.29

- SDK 新增历史窗口纯规则和 strict page facade，统一精确 uint64 previous cursor、稳定身份去重排序、clear boundary、SQLite upsert 与 `has_more/next_seq`；旧 `pullHistory` 数组返回保持兼容。
- H5 只持有用户 wheel/touchmove/pointer 手势、顶部阈值、DOM 前插高度补偿和 1.2 秒滚动日期悬浮；初始未读与搜索定位的程序滚动不得误拉历史。
- focused SDK 4/21、full SDK Web 91/381、H5 focused 4/8、466 assets、runtime boundary、SDK/H5 typecheck、build:web package sync 与 1131-module build 通过。
- 真实 412px 短会话验证零误分页、loading/sticky/overflow；当前无长历史和 `has_more/next_seq` 样本，真实位置补偿与悬浮日期保留 data gate。
- RN `useChatLoadMore` caller 保持冻结，状态为 `shared-core-ready/web-consumed/rn-frozen`；未修改 RN business 或同步 RN package，未执行 `build:package:desktop:web`。

## Completed W6.a6.20.30

- SDK `getCachedByStableMsgIDs` 按 client/server 稳定身份批量读取当前账号 SQLite，保序并以 canonical client ID 去重；不新增 Gateway operation 或 cache mutation。
- H5 当前消息窗口优先，缺失来源才批量读取本地库；当前 DOM 直接居中高亮，本地来源用 React Router 同会话 `messageID` 目标窗口恢复。
- 只有确认当前账号本地缺失才显示“引用的内容已删除”；群引用发送人复用 shared `resolveIMGroupMemberDisplayName`，未复制名称规则。
- SDK focused 2/12、full Web 91/381、H5 focused 4/15、466 assets、runtime boundary、SDK/H5 typecheck、build:web package sync 与 1132-module build 通过。
- 当前真实账号三个会话均无引用消息，页面路由、零 overflow 与零新增 console error 已证；真实引用点击、目标窗口与高亮保留 data gate。
- RN `fetchMessageByID/FlatList` caller 保持冻结；未修改 RN business 或同步 RN package，未执行 RN/Desktop/build:all/`build:package:desktop:web`。

## Completed W6.a6.20.31

- H5 删除 flow 只消费既有 shared `messages.delete` 的 `deletedClientMsgIDs`；在 operation 内、SQLite 窗口重读前冻结成功行，partial result 的失败项不进入动画。
- `useChatMessageDeleteExit` 保留删除前窗口 620ms，合并期间新到 cache 行；逐行动画结束或 700ms 兜底后释放，不改变 SDK、Gateway、SQLite 或通知语义。
- `ChatMessageBubble` 为普通/系统消息复用固定 18 粒子的 RN 碎裂退场；独立 CSS 支持 reduced-motion，未继续扩大已接近上限的聊天主样式。
- H5 focused 4 files/13 tests、Web typecheck、1136-module production build 和 diff check 通过；412px 已登录真实聊天页零 overflow/error，CSS 620ms 规则真实加载。
- 真实单条/批量 `self/all` 删除、partial Gateway 结果与肉眼动画仍为破坏性验收门；本片未改 SDK/RN，也未执行 SDK/RN/Desktop build/sync 或 `build:package:desktop:web`。

## Completed W6.a6.20.32

- SDK 单一维护 RN 同优先级的群生命周期、权限、角色、禁言和频率限制规则，并由 joined-group DTO 投影不可用原因。
- H5 cache-first 恢复群与成员，独立收敛两类刷新失败；footer 固定多选、不可用、待转发和普通输入优先级。
- 恢复中、权威群缺失和无缓存读取失败均 fail-closed；有缓存弱网不清空已知限制。
- RN caller 冻结，受限群真实样本和群权限 realtime contract 保留验收门；下一片冻结单聊黑名单/陌生人关系提示。

## Completed W6.a6.20.33

- 冻结真实 contract：Gateway 只有 `is_friend` 与我方 blacklist，没有反向黑名单；RN `blockedByPeer` 历史字段按 stranger 兼容语义处理。
- SDK 单一维护 `blocked-by-me/stranger/friend` 投影、RN 文案与发送关系错误分类；组合 facade 复用 peer profile 和 blacklist owner。
- H5 route hook 只消费 SDK facade；我方拉黑替换 composer，陌生人保留 composer 并在消息底部进入 React Router 好友申请页；未知状态 fail-closed。
- SDK 96/395、全 target typecheck、boundary、build:web/sync:web，H5 focused 2/6、typecheck、1143-module build通过；真实群聊和两条好友单聊零回归。
- RN caller/业务零改动；下一片建立好友关系 domain revision，避免用通用消息 `dataVersion` 反复请求资料/blacklist。

## Completed W6.a6.20.34

- SDK 新增关系 realtime 共享判定，好友/我方 blacklist 事实变化推进独立 `relationshipVersion`；普通消息不再承担关系刷新信号。
- 仅申请列表变化被明确排除，好友申请接受保留为关系事实变化；Web runtime 不新增第二个 socket、transport 或 cache owner。
- H5 `useChatDirectRelationship` 仅把 runtime revision 加入既有 facade 重读依赖，继续沿用 W33 的 fail-closed 和错误可见规则。
- SDK Web 93/387、boundary、Web typecheck/build:web/sync:web，H5 typecheck、1144-module build通过；412px 真实好友单聊刷新、composer 和宽度通过。
- RN 业务、caller 和生成包零改动；真实双账号好友/blacklist realtime 仍为数据验收门。

## Completed W6.a6.20.35

- 单聊设置页成员加号进入独立 React Router SPA route，返回保持原会话设置；普通 `/groups/create` 入口不变。
- 页面从当前账号 conversations cache-first source 严格解析单聊对象，将其固定计入建群成员并从候选中隐藏，用户必须至少再选择一位好友。
- 两个入口都复用既有 SDK `groups.create`；H5 不复制 2–998、去重、本人拒绝、Gateway、`remote-only` 或群/会话原子缓存语义。
- H5 focused 2 files/13 tests、typecheck 与 1144-module production build 通过；412px 真实入口、候选排除、总数/按钮状态、返回和零 overflow 只读验收通过。
- 未执行真实创建；SDK source/package scripts 和 `im28-phone` 零改动，未执行 RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.36

- 唯一全局 `PrimaryTabBar` 对齐 RN 320ms 消息 Tab 双击窗口；只有消息页已选且存在非静音未读时才请求当前页面动作，离开消息路由清空时间窗。
- `PrimaryTabsLayout` 只持有当前会话页注册的短生命周期函数；`ConversationsPage` 按 `unreadCount > 0 || manualUnread`、首个可见行之后和上次目标循环规则选择稳定会话 ID。
- 目标行通过稳定 `data-conversation-id` 解析并只执行 `scrollIntoView`；不触发 markRead、read receipt、Gateway、Repository 或 SQLite mutation。
- H5 focused 2 files/10 tests、typecheck 与 1145-module production build 通过；既有 >500kB chunk warning 不变。
- `.107` 复验时 5176 出现两条真实未读会话、总未读由 4 增至 5；已选消息 Tab 双击保持 URL/角标不变且未触发已读。当前仅 4 行且全部在首屏，无法观察 `scrollIntoView` 位移，长列表可见滚动继续 manual/data gate。
- SDK/RN source/package 零改动，未执行任何 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.37

- SDK `modules/message/call-message.ts` 成为历史通话消息唯一新增解析 owner，统一 core/Gateway/RN 包装、audio/video、七种状态、时长和 RN 文案。
- 实时 `rtc.call.invite/accept` 明确 fail-closed；历史摘要与终态才进入气泡，避免和既有来电 lifecycle 双轨。
- H5 消息 view 消费 shared 投影，气泡复用 RN 镜像图标；单聊点击进入既有 `handleStartCall -> WebIMCallProvider`，群聊只读。
- SDK focused 1/4、full Web 94/391、H5 focused 1/9、boundary、SDK Web/H5 typecheck 与 1147-module build通过。
- 5176 真实目标会话和 console 健康，但缓存无历史通话样本；视觉保持 data-gated，不注入假消息或发起真实呼叫。
- `im28-phone` clean；只执行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web`。

## Completed W6.a6.20.38

- SDK 新增会话草稿 facade 和只读文档 parser，统一当前账号会话校验、trim、预设表情 entities 与本地 SQLite 写入；草稿不调用 Gateway。
- schema v13 用 `draft_entities_json` 分列保存实体；全量/未归档会话远端替换前先快照本地草稿并合并，避免同步刷新清空尚未发送的输入。
- H5 `ChatPage/ChatComposer` 完成输入保存、列表 `[草稿]`、重进恢复、成功发送/显式清空移除；发送失败不清空草稿，列表不再自行解析 SDK payload。
- SDK focused 3 files/12 tests、Web full 95/394，H5 focused 2 files/12 tests、full 97/304，SDK Web/H5 typecheck、build:web/sync:web 与 1149-module build通过。
- 5176 登录态实际完成 `W38草稿😎` 输入、列表预览、重进恢复和清空回退最新消息，console 0 error；未发送消息或执行远端 mutation。
- `im28-phone` clean；RN caller/业务零改动，未执行 RN/Desktop/build:all/`build:package:desktop:web`。

## Completed W6.a6.20.39

- H5 `/calls` 复用全局 `usePullRefresh`，只在页面顶部单指释放后触发；编辑态禁用手势，避免和批量选择冲突。
- 刷新链严格复用既有 SDK `calls.sync -> listCached`，并保留当前 all/missed 筛选、搜索词与第一页大小；页面不新增 Gateway、SQLite、DTO 或通话状态 owner。
- 同步失败不会继续读取或替换 cache，旧列表保留并展示真实错误；成功才原子替换当前筛选列表与总数。
- H5 focused 1 file/4 tests、full 97 files/306 tests、typecheck、1149-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 在 412px 下完成所有/未接筛选、编辑/完成、空态和 TabBar 只读验收，宽度 412/412、console 0 warning/error；物理触摸下拉保留显式验收门。
- 本片 SDK 零改动，`im28-phone` clean；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.40

- 好友验证与群聊验证索引复用全局 `usePullRefresh`，只在页面顶部单指释放后触发；首次 loading 和 refreshing 均禁用重复手势。
- 两侧列表分别只调用既有 `friendApplications.list` 与 `groupApplications.list`；父层角标继续使用原 `getUnreadCount` owners，H5 不新增申请 DTO、Gateway、计数或 mutation owner。
- 列表与角标通过独立结果并行刷新：角标失败不阻断成功列表，列表失败保留旧快照并显示真实错误，不用计数成功伪造空列表。
- focused 3 files/12 tests、H5 full 98 files/308 tests、466 assets、typecheck、1151-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 在 412px 下证明好友 Tab 真实 2 条记录、群 Tab 空态、Router tab 切换、刷新占位收起、412/412 宽度，干净 reload 后 console 0 warning/error；物理触摸释放保留显式验收门。
- 本片 SDK source/generated package 零改动，`im28-phone` clean；未执行 accept/reject/mark-read 或任何 SDK/RN/Desktop build/sync，`build:package:desktop:web` 未修改或执行。

## Completed W6.a6.20.41

- H5 通话列表的删除确认层拆为独立 `CallDeleteSheet`，复用全局 `InteractionModal` 的原生 dialog top-layer、Esc、焦点、背景 inert、退出动画和 reduced-motion；页面不再持有第二套遮罩生命周期。
- 删除期间遮罩、Esc、取消和重复确认均 fail-closed；确认仍只调用既有 `WebIMCallSync.delete`，成功清理/重读和失败错误路径保持不变。
- 空列表按 RN 优先级投影搜索“暂无搜索结果”、未接“暂无未接来电”和默认“暂无通话记录”，不引入新的同步或筛选状态。
- focused 2 files/7 tests、H5 full 99 files/311 tests、466 assets、typecheck、1152-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 在 412px 下完成三类空态、编辑/完成、筛选与 TabBar 只读验收，宽度 412/412、console 0 warning/error；当前账号无通话记录，真实 modal 打开/Esc/取消保持 data-gated，未制造记录或执行删除。
- SDK source/generated package 与 `im28-phone` 零改动；未执行任何 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.42

- 通用设置退出确认拆为独立 `MeLogoutDialog`，复用全局 `InteractionModal`；精确保留 RN 标题、说明、取消与退出动作顺序。
- `InteractionModal` 增加受控 Escape 键兜底，修复部分 WebView 未稳定派发原生 `cancel` 的关闭缺口；遮罩、焦点、退出动画和 reduced-motion owner 不变。
- `signingOut` 期间遮罩、Escape、取消和重复确认全部 fail-closed；页面仍只调用既有 `runtime.signOut()`，不复制 token、WebSocket、媒体或账号数据库清理。
- focused 1 file/2 tests、H5 full 100 files/313 tests、466 assets、typecheck、1153-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 在 412px 下完成打开、Escape、遮罩、取消和 412/412 零溢出验收；路由与登录态保持，未点击最终退出。
- SDK source/generated package 与 `im28-phone` 零改动；未执行任何 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.43

- `app.css` 建立按钮 reset 单一 owner，清除浏览器 appearance、margin、padding、border、radius 和 background；键盘 `:focus-visible` 可访问性焦点保持。
- 新增 `PageNavbar + page-navbar.css`，35 个可寻址详情/选择页统一 safe-area、56px、三列、24px 图标、居中标题和左右动作；页面 class 只保留背景与业务差异。
- 主 Tab 标题、聊天复合资料头、认证品牌、媒体/来电全屏头和 Dialog/裁剪标题按 contract 排除，避免把不同语义强行同构。
- 页面切换继续复用既有 `RouteMotionController + interaction.css`：pathname 变化只动画当前 `#root main`，跳过首屏、固定 TabBar 不闪动并尊重 reduced-motion；未引入 UI/motion 库。
- focused 1 file/2 tests、H5 full 101 files/315 tests、466 assets、typecheck、1155-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 在 412px 下确认通用设置、个人资料、聊天设置使用同一 Navbar 几何；按钮 appearance none/border 0，页面显式按钮样式保留，宽度 412/412。
- SDK source/generated package 与 RN business 零改动；未执行任何 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.44

- SDK 新增 `parseIMGroupSystemMessagePresentation`，统一 core `payload`、Gateway `body.system/payload.body.system` 与 RN wrapper 的群系统消息读取；只有 `event_type + extra` 可以生成结构化文案，不信任 `system.text`。
- 群简介更新按当前账号与操作者昵称输出 RN 同款文案；发言频率按显式 enabled/seconds 输出分钟或秒，缺失事实、未知事件和坏 JSON 均 fail-closed。
- Gateway WebSocket classifier 仅补 OpenAPI 已明示的 `1521/group_description_changed -> message`；发言频率没有公开 numeric type，不猜测注册。
- H5 聊天气泡和会话列表摘要共同消费 shared presentation，删除继续演化页面级 raw `system.extra` 解析的可能；RN production caller 保持冻结。
- SDK focused 2 files/9、Web full 96 files/398 tests、全 target typecheck/boundary；H5 focused 2 files/18、full 101 files/317 tests、466 assets、1156-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 登录态 reload、账号恢复和设置路由通过，console 0 warning/error；当前缓存无可确认的 1521/频率通知，真实列表/气泡视觉与双账号 realtime 保持 natural-data gate。
- `im28-phone` clean；仅执行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web`，RN generated package 未重写。

## Completed W6.a6.20.45

- SDK `friend-added-message.ts` 统一 type1201、RN 已发布中文文案和 unknown fail-closed pure helper；既有 `initial-unread-navigation` 删除私有 1201 常量并复用 shared owner。
- H5 聊天气泡和会话摘要共同调用 `getIMFriendAddedMessageText`；聊天页固定表、列表 label 均不再保存第二份 1201 文案。
- SDK focused 2 files/6、Web full 97 files/400 tests、全 target typecheck/boundary；H5 focused 2 files/20、full 101 files/319 tests、466 assets、1157-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实 `donk二大爷` 会话摘要已从 `[contentType=1201]` 变为“你们已经成为好友，可以开始聊天了”，稳定期 reload 后 raw fallback 消失且日志条数/时间戳未增长。
- `build:web` 同步生成包期间旧标签曾产生一次 Provider HMR 顺序错误；页面自动恢复，新标签冷启动登录页零错误，登记为 dev HMR 噪声而非生产构建回归。
- `im28-phone` clean；仅执行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web`，RN generated package未重写。

## Completed W6.a6.20.46

- 普通建群选中态新增 RN 同构的搜索入口、最多五个头像预览、超出计数和一键清空；“已选好友”底部复核层支持逐人移除，失效身份 fail-closed。
- 页面复用全局 `usePullRefresh`；仅普通建群启用，刷新只调用既有 `contacts.list`，失败保留当前快照并显示真实错误。
- 创建主链保持 `CreateGroupPage -> WebIMSync.groups.create`，未新增页面 Gateway、SQLite、DTO、Repository、校验或创建状态机。
- focused 3 files/8、full 102 files/321 tests、466 assets、typecheck、1158-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实两位好友完成全选、复核、逐个移除和清空，提交按钮状态随选中数切换；412/412 无横向溢出，console 0 warning/error；物理触摸释放保留显式验收门。
- SDK source/generated package 与 `im28-phone` 均零改动；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.47

- `/contacts/groups` 复用全局 `usePullRefresh`，对齐 RN `ContactGroupListScreen` 的顶部单指下拉；搜索、长按菜单、分享/资料路由和退出确认均保持原主链。
- 刷新只调用既有 `groups.sync({ pageSize: 50 })`；成功才替换群列表，失败保留当前快照并显示真实错误，不新增页面 Gateway、SQLite、DTO、Repository 或重试状态机。
- focused 3 files/8、full 103 files/323 tests、466 assets、typecheck、1158-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实 `donk的群聊`、群主标签、无结果搜索与恢复搜索通过；412/412 无横向溢出，console 0 warning/error；物理触摸释放保留显式验收门。
- `JoinedGroupsPage.tsx` 323 行低于页面 400 行上限；无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK 或调试日志。仓库无 `scripts/check-convergence.sh`，保持已登记 gate。
- SDK source/generated package 与 `im28-phone` 本片零改动；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.48

- 邀请与移出群成员页复用全局 `usePullRefresh` 和同一个三态提示组件，对齐 RN 两个选择页的顶部下拉反馈。
- 邀请刷新只调用既有 `groups/groupMembers/contacts`，移除刷新只调用既有 `groups/groupMembers`；所有 facade 成功后才替换候选，失败保留旧快照、搜索词和选择态。
- 邀请、移除确认与提交主链保持不变；未执行真实群成员 mutation，也未新增 Gateway、SQLite、DTO、Repository 或重试状态机。
- focused 4 files/8、full 104 files/325 tests、466 assets、typecheck、1158-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实群完成邀请空态、两位可移除成员、搜索过滤和未选择禁用提交验收；412px 宽度正常，console 0 warning/error；物理触摸释放保留显式验收门。
- 两个页面分别为 282/268 行，共用提示组件 23 行且有两个生产消费者；无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK 或调试日志。
- 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.118

- 聊天头部复用 SDK `WebIMSync.presence`，单聊只观察对端并展示在线/离线，普通群观察成员快照并展示在线人数。
- 群模式继续由 SDK `isIMNormalGroupMode` 判定；large/unknown 群隐藏状态，未知单聊状态保留头部高度且不伪造在线。
- 页面 presence observation 收敛到通用 `useObservedUserPresence`；群成员页、群设置预览和聊天头部不再保留不同 Hook owner。
- 验收要求：纯投影覆盖在线、离线、未知、2 人在线与非普通群；H5 typecheck/build；真实单聊和普通群 412px 无溢出、无 console error。

## Completed W6.a6.20.119

- 群管理页复用既有 `groupApplications.list`，按目标群和 `pending` 状态展示 RN 同款待处理数量；无审核权限时保留“无权限”行，管理员设置无权限时保留“仅群主”行。
- 单群申请页接受受限的 `group-management + conversationID` Router state；从群管理进入返回原会话，从联系人验证或直接访问仍返回群聊验证，不接受任意 back URL。
- focused 2 files/8 tests、H5 full 137 files/435 tests、typecheck、466 assets和 production build通过；真实群管理入口、返回链和 console 零错误通过。
- 当前真实群无 pending 申请，非零角标、admin/member 权限视觉和 accept/reject 仍为显式验收门；SDK 业务源码与 RN protected source 未改，未运行 forbidden build scripts。

## Completed W6.a6.20.120

- 群聊头部新增 RN 同款待审核申请入口：当前群 `pending` 数量为零时隐藏，超过 99 显示 `99+`，单聊始终隐藏。
- `useChatGroupApplicationCount` 只调用现有 `groupApplications.list`，失败时角标归零且不阻断聊天；`.119` 的 pending 计数 helper 同时服务群管理和聊天头部。
- 申请页受限 Router state 新增 `chat` 来源，从头部进入时返回原群聊；仍拒绝任意 back URL，群管理和联系人验证返回语义不变。
- focused 4 files/13 tests、H5 full 139 files/440 tests、typecheck、466 assets和 production build通过；真实 412px 群聊零误显、header 无溢出且无 warning/error。
- 当前账号无 pending 样本，非零角标实际点击、处理后刷新和双账号 realtime 继续 gated；SDK business/RN protected source 与 forbidden build scripts 均未触碰。

## Completed W6.a6.20.49

- 群禁言页复用全局 `usePullRefresh`，对齐 RN `GroupMuteScreen` 手动禁言列表的顶部下拉反馈；首次加载、刷新或提交期间拒绝新手势。
- 刷新只调用既有 `groups/groupMembers`；两者都成功后才替换禁言范围和成员事实，失败保留当前页面快照并显示真实错误。
- 禁言范围、时长选择、二次确认和 `groupManagement.updateMute/updateMemberMute` 主链保持不变；未执行真实禁言 mutation。
- 旧 `GroupMemberSelectionPullIndicator` 已删除，收敛为邀请、移除、禁言三个生产页面共同消费的 `GroupPullRefreshIndicator`，不持有任何数据逻辑。
- focused 3 files/8、full 104 files/326 tests、466 assets、typecheck、1158-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实群显示关闭范围和两位可禁言成员；刷新提示折叠、412/412 无横向溢出，稳定 reload 未新增 warning/error；物理触摸释放保留显式验收门。
- `GroupMutePage.tsx` 237 行、共用提示 25 行；无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK、fake-success 或调试日志。
- 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.50

- 指定群入群申请页复用全局 `usePullRefresh` 与既有 `VerificationPullIndicator`，对齐 RN `GroupApplicationListView` 的顶部下拉反馈。
- 刷新只调用既有 `groupApplications.list`；成功后才替换申请事实，失败保留当前列表和搜索词，加载、刷新或 accept/reject 期间拒绝新手势。
- 搜索、操作弹层和 `groupApplications.accept/reject` 主链保持不变；未执行真实申请 mutation，也未新增 Gateway、SQLite、DTO、Repository 或重试状态机。
- focused 4 files/11、full 105 files/328 tests、466 assets、typecheck、1158-module production build 和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实群路由完成搜索/清除、空态、折叠提示、412/412 和稳定 reload 零 warning/error 验收；当前无申请样本，物理触摸和申请操作保留显式 gate。
- `GroupApplicationsPage.tsx` 126 行、测试 20 行；提示组件有三个生产消费者，无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK、fake-success 或调试日志。
- 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.51

- 黑名单页复用全局 `usePullRefresh`，对齐 RN `ProfileScreen` 黑名单 FlatList 的顶部下拉反馈；首次加载、刷新或解除处理中拒绝新手势。
- 刷新只调用既有 `blacklist.list`；成功后才替换用户事实，失败保留当前列表和搜索词；`blacklist.remove` 解除主链保持不变。
- 七个生产页面统一消费 `components/interaction/PullRefreshIndicator`；旧验证/群页面提示组件和两套重复 CSS 已删除，不保留 compat。
- focused 6 files/16、full 106 files/330 tests、466 assets、typecheck、1158-module production build 和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实空黑名单完成搜索、无结果、清除、空态、折叠提示和 412/412 验收；稳定 reload 日志数量未增长。无列表样本，物理触摸和解除保持显式 gate。
- `MeBlacklistPage.tsx` 176 行、全局提示 23 行、测试 20 行；无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK、fake-success 或调试日志。
- 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.52

- 转发目标页复用全局 `usePullRefresh/PullRefreshIndicator`，对齐 RN 普通转发选择器的顶部下拉反馈；首次加载、刷新或目标打开期间拒绝新的下拉手势。
- 刷新继续调用既有 `loadChatForwardTargets({ sync })`，由 `conversations.sync/contacts.list/groups.sync` 三个 canonical facade 提供事实；三个请求全部成功后才替换页面快照，失败保留当前目标、Tab 和搜索词。
- 目标会话解析、React Router `location.state`、单条/多选来源和 shared forward 提交主链保持不变；未执行目标打开或真实转发 mutation。
- focused 4 files/8、full 107 files/332 tests、466 assets、typecheck、1158-module production build和 diff check 通过；既有 >500kB chunk warning 不变。
- 5176 真实数据完成 3 条最近会话、2 位好友、1 个群聊、搜索/清除、三 Tab、折叠提示和 412/412 验收；warning/error 为零，物理触摸释放保持显式 gate。
- `ChatForwardTargetPage.tsx` 228 行、新 contract test 22 行；无第二 owner、孤立文件、compat wrapper、TODO/FIXME/HACK、fake-success 或调试日志。
- 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.121

- 聊天标题区按 RN `ChatDetailHeader` 语义成为资料入口：群聊进入现有群资料 route，单聊在存在对端 ID 时进入现有联系人资料 route。
- 单聊沿用联系人资料页既有白名单 `backHref`；群资料新增最小 `chat + conversationID` state，只有来源 ID 与当前路由一致才返回聊天，否则保持返回群设置。
- 标题区不读取资料、不复制 DTO/权限/Gateway/SQLite 逻辑；资料内容和 mutation 继续由既有页面及 shared facade 提供。
- focused 3 files/9 tests、H5 full 140 files/443 tests、typecheck、466 assets和 1188-module production build通过；真实群聊/单聊资料进入与返回、412px 零溢出和零 warning/error 通过。
- SDK source/generated package 与 `im28-phone` 本片零改动；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync。

## Completed W6.a6.20.122

- 在真实已登录账号下通过显示设置切换 dark，补齐 `/me/profile`、nickname、gender、bio 四个 route 的 760×900 桌面只读验收。
- 总览保持 `donk / 未知 / 未设置`；昵称输入保持 `donk`、性别“未知”仍 checked、签名为空且 `0/100`，未输入或点击完成。
- 四个页面均使用 dark page `rgb(17,19,24)` 与 card/textarea `rgb(27,29,36)`，document viewport/scrollWidth 均为 760，无横向溢出和 warning/error。
- focused 4 files/17 tests、H5 typecheck、四 route HTTP 200、RN/SDK boundary 和 diff check 通过；结束前恢复 light preference。
- 本片代码与运行时零改动，未运行任何 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web`。

## Completed W6.a6.20.123

- 在真实已登录、未绑定账号密码的账号下，通过显示设置切换 dark，补齐 `/me/security`、`/me/security/account` 和错误重置深链的 760×900 桌面只读验收。
- 总览真实展示 `+86 15555555551 / 未绑定 / 账号密码`；首设账号、密码、确认密码三个输入保持为空，设置按钮保持 disabled，未触发任何凭据 mutation。
- 错误直达 `/me/security/password` 按账号状态自动 replace 到 `/me/security/account`；不把该保护行为声明成密码重置成功。
- page=`rgb(15,17,21)`、card/form=`rgb(27,29,36)`、input=`rgb(36,39,51)`，三个链路 viewport/scrollWidth=`760/760` 且 warning/error 为零。
- SDK 1 file/3 tests、H5 1 file/3 tests、Web typecheck、三 route HTTP 200、RN/SDK boundary 和 diff check 通过；结束前恢复 light preference。
- 本片代码与运行时零改动，未运行任何 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web`。

## Completed W6.a6.20.124

- 从当前真实已读单聊右键可转发文本消息，进入 `.54` 后唯一生产入口 `ChatTargetPickerModal`；URL 保持原聊天，不再进入已删除的独立转发目标页。
- 在 760×900 light viewport 下先选择好友，再切换群聊选择单群，选中计数为 2；点击群聊当前筛选范围 ALL 后计数为 3，证明跨 Tab 保留选择与 ALL 行为。
- modal 尺寸为 720×868、左偏移 20px，grid 720px，viewport/scrollWidth 为 760/760；最终转发按钮在有选择时可用，但未点击。
- 关闭弹窗后仍为原单聊、消息行保持 2 条，未产生发送、Gateway、SQLite 或 list-back 变化，warning/error 为零。
- focused 5 files/14 tests、Web typecheck、两个 route HTTP 200、RN/SDK boundary 与 diff check 通过；本片运行时代码零改动且未执行任何 SDK build/sync。

## Completed W6.a6.20.125

- 在真实已登录单聊搜索中输入 `123`，命中当前账号 sql.js 的稳定消息 `61da9d1a-5ce3-4ce8-8d37-44d56939c104`，结果跳转后精确恢复目标缓存窗口与 DOM 行。
- 修复结果跳转后浏览器 back 丢失关键词/结果的 RN parity 缺口：已提交关键词和文本 tab 写入 `/search?q=123&tab=all`，返回时只通过既有 `WebIMSync.messages.searchCached` 重读缓存。
- 760×900 light/dark 均完成搜索、目标定位和 history 返回；两种主题 viewport/scrollWidth 都为 760/760，dark page/card/input 分别为 `#111318/#1b1d24/#242733`，warning/error 为零。
- focused 3 files/8 tests、Web typecheck（含允许的 SDK `build:web/sync:web`）、两个 route HTTP 200、diff check 与 RN/SDK protected boundary 通过。
- 本片未修改 SDK 或 RN；未调用 Gateway、WebSocket、发送、下载或 mutation。日期/媒体/文件的桌面/history/theme 仍由 `.18.2.2` 独立验收。

## Completed W6.a6.20.126

- 为日期、图片与视频、文件三个索引页补齐 React Router query 状态：`view` 标识页面，`months` 保存有界月份数，`filter` 保存媒体筛选；刷新和 history 返回后只重读当前账号缓存。
- 真实单聊日期页在 760×900 light 下显示 `2026-08-13，3条聊天记录`，进入稳定 messageID 后 back 恢复原日期结果；月份从 3 扩展到 4 后 reload 保持四个月。
- 当前真实群的媒体/文件缓存为空，但 `media&filter=video` 和 `file` 的 URL、选中态及空态在 reload 后保持；既有 458px 非空媒体/文件证据继续有效，未以空态替代非空验收。
- 760×900 light/dark 的 page/card/input token、viewport/scrollWidth 均正确；历史 HMR 日志不计入新证据，clean reload 前后新增 warning/error 为零。
- focused helper 1 file/5 tests、H5 full 140 files/445 tests、Web typecheck、466 assets、1188-module production build、三个 route HTTP 200、diff 与 RN/SDK protected boundary 通过；未修改 SDK/RN，未调用 Gateway、WebSocket、发送、下载或 mutation。

## Audited W6.a6.20.127

- 从当前会话列表取得 4 个真实 conversationID，逐一直接进入现有媒体与文件索引 route；8 个 production route 均返回“暂无图片与视频”或“暂无文件”。
- 扫描前后两个未读会话仍各显示 2 条未读，证明索引搜索直达没有打开聊天页或触发 mark-read；不把未读会话的不可见内容猜测为媒体样本。
- 审计在 412×786 light 下完成，viewport/scrollWidth 为 412/412，warning/error 为零；没有创建第二标签或 SQLite writer。
- 本片不修改 runtime、SDK 或 RN，不注入 fixture、不上传/发送/下载、不调用 Gateway mutation；当前非空媒体/文件和预览活动帧继续保持 `blocked-natural-data`。

## Completed W6.a6.20.128

- 对齐 RN `CHAT_DETAIL_HIGHLIGHT_MS=1600`，将文本搜索结果定位后的消息行高亮从 Web Animations API 改为受控 class/timer；当前轻量浏览器缺少 `HTMLElement.animate` 时仍可见。
- 真实缓存搜索 `123` 继续使用稳定 client message ID 恢复同账号消息窗口；目标行显示 `--im-bg-pressed` 背景和 14px 圆角，1600ms 后移除展示态。
- 高亮 CSS 从既有超长 `chat-page.css` 拆入独立 `chat-message-focus.css`；不新增搜索、缓存、Gateway、WebSocket 或消息状态 owner。
- focused 2 files/5 tests、H5 full 140 files/446 tests、Web typecheck、466 assets和 1189-module production build通过；SDK source 与 RN protected source 未改。
- 本片未运行 RN/Desktop/build:all 或 `build:package:desktop:web`；文本搜索仅剩 Safari/Firefox 与实体设备验收门。

## Audited W6.a6.20.129

- 重新对照 RN `ChatMessageBody` 与 H5 production `getChatMessageView`，确认 text/mention、image、audio、video、file、card、quote、custom emoji、call 与 system notice 均有对应 owner。
- 为 type106 mention、type108 用户/群名片和 type109 位置 fail-closed 补 production parser 护栏；测试不引入测试专用 runtime 分支。
- type109 在 RN 聊天气泡没有专用位置组件，仅会进入通用 fallback；H5 保持 `[暂不支持的消息 · 109]`，不得擅自增加地图、定位权限或点击行为。
- focused 1 file/14、H5 full 140 files/449 tests、Web typecheck 与 466 assets 通过；本片仅测试/文档，沿用 `.128` 的 1189-module production build 基线。
- H5 production、SDK source/generated 与 `im28-phone` protected source 零改动；未执行任何 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web`。

## Accepted W6.a6.20.130

- 使用用户授权的两个真实测试账号、两个 tab-scoped session 和两个账号 SQLite owner，发送唯一文本 `H5-WS-1786686250693`。
- sender production composer 出现发送气泡；receiver 保持会话列表、不刷新/不导航即出现同 marker、`聊天(1)` 与 1 条未读，证明实时 delivery/list-back。
- shared runtime 只有在 `createIMRealtimeMessageSync` 完成 `MessageRepository/ConversationRepository` upsert 后才发布 `dataVersion`；H5 列表响应版本只调用 `listCachedItems`，聊天响应版本只调用 `getCachedHistory`，因此接收端 UI 证据闭合 SQLite convergence。
- receiver 新进入聊天后显示同 marker，返回列表后 preview 保留且 unread 清零；两端 warning/error 为 0。
- SDK realtime focused 2 files/6、H5 conversation/chat focused 2 files/15、route HTTP 200；production code、SDK generated、RN protected source 与 package scripts 零改动。
- 未隔离网络或重启浏览器，offline/restart cache-hit 仍是独立 gate；不把本片 realtime 入库证据扩大为离线验收。

## Completed W6.a6.20.149.13

- 转发预览由 H5 原始 senderID/text 列表收敛为冻结 RN `ForwardPreviewModal` 结构：60% 视口聊天面板、底部对齐 outgoing 气泡、30px 选择器和 200px 四项操作菜单。
- 预览正文复用 `getChatMessageView + ChatMessageContent + ChatForwardOrigin`，图片、语音、文件、名片、表情和来源头不建立第二套 payload 解析；媒体交互继续由聊天页唯一 `ChatMediaInteractionProvider` 承载。
- 预览只编辑反选集合与隐藏发送者选项；“修改收件人”继续走现有单选目标弹窗，“应用更改”仅关闭预览，真实发送仍必须由底部 Composer 显式提交。
- focused 2 files/7、H5 full 150 files/497 tests、466 assets、Web typecheck、1203-module production build 和 diff check 通过。
- 382×786 已登录真实链完成 3 条缓存消息预览：面板 350×471.6、菜单 200×192、选择器 30×30、3 个真实气泡、light/dark token 和零 warning/error；反选计数 `3 -> 2 -> 3`、隐藏发送者来源数 `3 -> 0 -> 3` 通过。
- Figma 节点受登录门禁阻塞，未绕过认证或把不可见设计属性声明为证据；本片以冻结 RN 生产实现和用户截图为视觉合同。
- SDK source/generated package 与 `im28-phone` protected source 零改动；未执行 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web`，也未点击真实发送。

## Completed W6.a6.20.149.21

- 将 `ChatPage` 内的 SQLite 首屏恢复、`dataVersion` 实时缓存重读、搜索消息定位和窗口大小维护抽入唯一 `useChatPageCacheState` owner。
- `ChatPage` 继续持有发送、转发、删除、编辑、录音、名片、通话和 React Router 接线；本片未改变 SDK facade、DTO、缓存替换、重试或 UI 业务分支。
- `ChatPage.tsx` 从 698 行收敛为 595 行；新 hook 159 行且只有一个生产消费者，无 compat wrapper、第二读取 owner、孤立导出、TODO/FIXME/HACK 或调试日志。
- focused 73 files/245 tests、H5 full 152 files/505 tests、Web typecheck、1207-module production build 和 diff check 通过；既有 >500kB chunk warning 不变。
- 382x786 已登录真实群聊完成只读烟测：会话、1 人在线、群主备注名/标签、消息气泡和唯一 Composer 均正常；未发送消息或执行群 mutation。
- SDK source/generated package 零改动；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；未执行 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web`。

## Completed W6.a6.20.149.22

- 将 `ChatComposer` 内唯一输入行表单抽为纯展示组件 `ChatComposerInputRow`，继续复用现有 `ChatVoiceInput`、文本输入、表情与功能面板入口。
- `ChatComposer` 仍唯一持有 submit、转发草稿、提及、附件、面板状态和 availability 编排；本片不改变发送、转发、上传、录音或 SDK 调用链。
- `ChatComposer.tsx` 从 419 行收敛为 353 行；新输入行 138 行且只有一个生产消费者，`rn-chat-composer` 表单 owner 保持唯一。
- focused 4 files/14 tests、H5 full 152 files/505 tests、Web typecheck、1208-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 382x786 已登录真实群聊完成只读烟测：输入框聚焦无 border/outline/box-shadow，表情与功能面板可切换，功能项相册/文件/名片可见，收起后 viewport/scrollWidth=`382/382`；未输入、发送或执行 mutation。
- SDK source/generated package 零改动；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；未执行 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web`。

## Completed W6.a6.20.149.23

- 将聊天页资料、群申请、公告、名片、引用定位、好友申请和表情管理的 React Router 动作抽入唯一 `useChatPageNavigationActions` owner。
- 群名片继续沿用 `groups.sync -> conversations.openGroup -> apply fallback` 生产链；消息发送、缓存、RTC、录音和 SDK mutation owner 均未移动。
- `ChatPage.tsx` 从 595 行收敛为 514 行；新导航 Hook 156 行且只有一个生产消费者，无第二 route owner 或 compat wrapper。
- focused 4 files/10 tests、H5 full 152 files/505 tests、Web typecheck、1209-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 382x786 已登录真实群聊完成“群资料 -> 资料页 -> 返回聊天”只读验收：群名、2 人在线、消息和唯一 Composer 恢复，两个 route 均 viewport/scrollWidth=`382/382`，warning/error 为零。
- 本片未点击名片、群申请、公告或发送动作，不把只读导航扩大为 mutation 成功；SDK source/generated package 零改动，RN 仅保留用户既有 `src/config/appVersion.ts` 修改，未执行 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web`。

## Completed W6.a6.20.149.24

- 将 `ChatPage` 的消息 operation、名片/通话瞬时弹层、Composer 草稿/提及和聊天头部投影拆入四个页面专用 hook；`useChatPageCacheState` 不再反向接收 UI reset callback。
- 消息发送继续保持 `shared operation -> failure relationship projection -> SQLite getCachedHistory -> busy release`；名片只在 type108 真实成功后关闭，通话继续复用全局 `WebIMCallProvider.startOutgoing`。
- `ChatPage.tsx` 从 514 行收敛为 399 行；新增 owner 均低于 300 行、内部 action 函数低于 50 行，只有一个生产消费者，无 compat wrapper、第二业务 owner、TODO/FIXME/HACK 或调试日志。
- focused 4 files/11 tests、H5 full 153 files/508 tests、Web typecheck、466 assets、1213-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 382x786 已登录真实群聊/单聊完成只读验收：群在线/群主气泡、名片单选弹层、单聊在线、通话类型弹层、消息与唯一 Composer 正常，viewport/scrollWidth=`382/382`，cold reload 后零新增 warning/error。
- 未点击分享、语音/视频通话或发送，不扩大 mutation/RTC 成功声明；仅执行允许的 SDK `build:web/sync:web`，SDK worktree clean，RN 仅保留用户既有 `src/config/appVersion.ts` 修改，未运行 RN/Desktop/all 或 `build:package:desktop:web`。

## Completed W6.a6.20.149.25

- 将联系人资料页的打开会话、复制 ID、音视频呼出、星标、备注、黑名单和删除好友编排抽入唯一 `useContactProfileActions`；页面继续持有资料读取、presence、群上下文和弹层展示。
- action owner 只委托既有 shared contact/peer facade、全局 `WebIMCallProvider` 与浏览器 clipboard port，不新增 DTO、缓存、route、retry 或 mutation 语义。
- `ContactProfilePage.tsx` 从 467 行收敛为 344 行；新 Hook 208 行且只有一个生产消费者，页面不再直接出现联系人 mutation、通话启动或剪贴板调用。
- focused 4 files/21 tests、H5 full 154 files/510 tests、Web typecheck、466 assets、1214-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 382x786 已登录真实好友资料完成 cold reload 与只读弹层验收：备注名、离线状态、通话/星标/发消息入口、更多操作和备注编辑正常，viewport/scrollWidth=`382/382`，warning/error 为零。
- 未保存备注、切换星标/黑名单、删除好友、复制 ID、打开会话或正式呼出；仅执行允许的 SDK `build:web/sync:web` 且 SDK clean，RN 仅保留用户既有 `src/config/appVersion.ts` 修改，未运行 RN/Desktop/all 或 `build:package:desktop:web`。

## Completed W6.a6.20.149.26

- 将通讯录页的长按菜单、打开会话、分享名片、音视频呼出和删除好友编排抽入唯一 `useContactsPageActions`；页面继续持有 cache-first 联系人读取、下拉刷新、分组索引与列表展示。
- action owner 只委托既有 `peerProfile/contacts` shared facade、全局 `WebIMCallProvider` 和 React Router，不新增 DTO、Gateway、SQLite、retry、route 或 mutation 语义。
- `ContactsPage.tsx` 从 406 行收敛为 290 行；新 Hook 200 行且只有一个生产消费者，页面不再直接出现联系人删除、会话创建或通话启动调用。
- focused 3 files/7 tests、H5 full 155 files/512 tests、Web typecheck、466 assets、1215-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 382x786 已登录真实通讯录完成只读验收：2 个联系人、备注名、搜索、验证消息、我的群聊、索引栏和全局 Tabbar 正常；截图无横向裁切。
- 未打开会话、分享名片、正式呼出或删除好友；仅执行允许的 SDK `build:web/sync:web` 且 SDK clean，RN 仅保留用户既有 `src/config/appVersion.ts` 修改，未运行 RN/Desktop/all 或 `build:package:desktop:web`。

## Completed W6.a6.20.149.27

- 将普通会话页的 SQLite cache-first 首屏、归档摘要、realtime cache 重读、下拉同步和 presence 刷新抽入唯一 `useConversationsPageState`；页面保留 React Router、展示、未读会话滚动和现有 `useConversationActions` mutation owner。
- 状态 hook 只编排既有 `WebIMSync` 与 `useConversationPresence`，不新增 DTO、Gateway、Repository、retry、权限或 mutation 语义；动作完成后仍通过同一 cache reload 回读普通/归档列表。
- `ConversationsPage.tsx` 从 398 行收敛为 279 行；新 Hook 152 行且只有一个生产消费者，页面不再直接出现 `listCachedItems/syncArchived`。
- focused 4 files/4 tests、H5 full 156 files/513 tests、Web typecheck、466 assets、1216-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 已登录真实会话列表完成只读烟测：从通讯录切换消息 Tab 后恢复 4 条会话，单聊在线状态、好友备注名、群摘要与全局 Tabbar 正常。
- 未执行下拉刷新、打开会话、已读、置顶、静音、归档或删除；仅执行允许的 SDK `build:web/sync:web` 且 SDK clean，RN 仅保留用户既有 `src/config/appVersion.ts` 修改，未运行 RN/Desktop/all 或 `build:package:desktop:web`。

## Completed W6.a6.20.149.28

- 将会话搜索页的四类 SQLite cache 聚合、请求代次隔离、消息分页、分区展开和本地搜索历史抽入唯一 `useConversationSearchState` owner；页面只保留 React Router、下拉手势和结果展示。
- 继续复用 `WebIMSync.contacts/groups/conversations/messages` 与既有纯聚合函数，不新增远端搜索、DTO、SQL、Gateway、Repository、retry 或 mutation 语义。
- `ConversationSearchPage.tsx` 从 376 行收敛为 203 行；新 Hook 271 行且只有一个生产消费者，页面不再直接调用 `searchCached/listCached/localStorage/isCurrentInteractionRequest`。
- focused 2 files/8 tests、H5 full 157 files/514 tests、SDK Web 101 files/426 tests、根级 Web/H5 typecheck、466 assets、1217-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 已登录真实链从会话列表进入搜索，读取既有历史并以 `123` 聚合出 2 个会话、3 条缓存消息；点击结果正确进入目标聊天，未调用远端搜索或业务 mutation。
- 仅执行允许的 SDK `build:web/sync:web` 且 SDK source clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改，未运行 RN/Desktop/all 或 `build:package:desktop:web`。

## Completed W6.a6.20.149.29

- 将发起群聊页的 cache-first 好友读取、单聊固定对端校验、成员选择、人数门槛和创建事务抽入唯一 `useCreateGroupPageState` owner；页面只保留 React Router、下拉手势和展示。
- 选择算法归并到既有 `create-group-view` 纯函数 owner，严格保留普通入口全量替换、单聊筛选保留隐藏选择、2–998 人规则和 remote-only 防重放语义。
- `CreateGroupPage.tsx` 从 388 行收敛为 187 行；新 Hook 283 行且只有一个生产消费者，页面不再直接调用 contacts/conversations/groups facade 或 Toast。
- focused 4 files/27 tests、H5 full 158 files/517 tests、SDK Web 101 files/426 tests、Web typecheck、466 assets、1218-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 已登录真实建群页加载 2 位好友；单选保持创建按钮禁用，全选显示“已选 2 位好友”并启用按钮，恢复选择后新增 warning/error 为零；未提交创建。
- SDK source/generated package 零改动；RN 仅保留用户既有 `src/config/appVersion.ts` 修改，未运行 RN/Desktop/all 或 `build:package:desktop:web`；仓库仍无 `scripts/check-convergence.sh`。

## Completed W6.a6.20.149.30

- 将联系人搜索页的本地好友/已加入群/会话 fallback 快照、服务器好友/群聊双 Tab、请求代次隔离和群会话打开抽入唯一 `useContactSearchPageState` owner；页面只保留 React Router、资料返回 state、键盘与结果展示。
- 继续复用 `WebIMSync.contacts/groups/conversations/groupApplications` 和既有 `contact-search-view` 纯投影，不新增 DTO、SQL、Gateway、Repository、retry、好友申请或入群语义。
- `ContactSearchPage.tsx` 从 384 行收敛为 208 行；新 Hook 241 行且只有一个生产消费者，页面不再直接调用 `searchUsers/listCached/openGroup/isCurrentInteractionRequest`。
- focused 7 files/31 tests、H5 full 159 files/519 tests、SDK Web 101 files/426 tests、根级 Web/H5 typecheck、466 assets、1219-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 临时验收标签正常进入手机号登录页；使用既有固定验证码提交后，sql.js 按设计拒绝第二标签并提示现有预览标签占用本地消息缓存。未关闭用户当前标签，真实已登录搜索/双 Tab visual 保持显式 gate。
- SDK source/generated package clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web`；仓库仍无 `scripts/check-convergence.sh`。

## Completed W6.a6.20.149.31

- 将通话列表的 cache-first 首屏、强制同步、dataVersion 重读、下一页加载、筛选/搜索、全量缓存选择和删除事务抽入唯一 `useCallsPageState` owner；页面只保留全局 TabBar 联动、下拉手势和展示。
- 严格保留 RN/H5 既有合同：筛选或搜索变化清空选择；全选扫描当前筛选的全部缓存分页；删除先提交 `WebIMCallSync.delete`，成功后退出编辑态并重读首屏，失败只显示 error Toast。
- `CallsPage.tsx` 从 355 行收敛为 145 行；新 Hook 285 行且只有一个生产消费者，页面不再直接调用 `sync/listCached/delete/refreshCallListPage/useAppToast`。
- focused 4 files/23 tests、H5 full 160 files/521 tests、SDK Web 101 files/426 tests、根级 Web/H5 typecheck、466 assets、1220-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 新受控标签直达 `/calls` 后由真实 auth guard 跳转手机号登录；未接管用户当前登录标签，未提交验证码或执行通话删除，登录态列表/编辑视觉和真实删除 list-back 保持显式 gate。
- SDK source clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web`；仓库仍无 `scripts/check-convergence.sh`。

## Completed W6.a6.20.149.32

- 将已加入群列表的 cache-first 恢复、完整同步、群会话解析、长按动作和退群事务抽入唯一 `useJoinedGroupsPageState` owner；页面只保留 auth guard、下拉手势与展示。
- 严格保留 frozen RN/H5 合同：普通成员可选择是否清理本人群消息；群主先进入既有转让页；`remote-only` 阻止重复退群；分享/资料路由只消费 canonical Conversation。
- `JoinedGroupsPage.tsx` 从 325 行收敛为 138 行；新 Hook 265 行且只有一个生产消费者，页面不再直调 `groups/conversations/groupLifecycle/useAppToast`。
- focused 4 files/20 tests、H5 full 161 files/523 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1221-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 新受控标签直达 `/contacts/groups` 后由真实 auth guard 跳转手机号登录，零 console warning/error；未接管用户当前登录标签，未提交验证码或执行退群/转让。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web`；仓库仍无 `scripts/check-convergence.sh`。

## Completed W6.a6.20.149.33

- 将群成员完整页的群会话解析、cache-first 群/成员读取、完整远端同步、请求代次、搜索投影和 presence observation 抽入唯一 `useGroupMembersPageState` owner；页面只保留 auth route、下拉手势、索引滚动和展示。
- 严格保留 frozen RN/H5 合同：真实 Conversation targetID 是唯一群身份；cache 失败继续 canonical sync；成员名称、拼音分组、role 标签和 normal-group presence 继续消费既有 shared/view owner。
- `GroupMembersPage.tsx` 从 312 行收敛为 178 行；新 Hook 186 行且只有一个生产消费者，页面不再直调 `getSync/groupMembers.sync/useObservedUserPresence`。
- focused 3 files/9 tests、H5 full 162 files/525 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1222-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 新受控标签直达群成员 route 后由真实 auth guard 跳转 `/auth/phone`；未接管用户当前标签、未提交验证码或执行群成员 mutation，登录态成员/搜索/presence visual 保持显式 gate。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web`；仓库仍无 `scripts/check-convergence.sh`。

## Completed W6.a6.20.149.34

- 将用户/群名片的 JSX、头像 fallback、目标可用性和可访问名称抽入唯一 `ChatCardMessageContent` presentation owner；`ChatMessageContent` 继续只消费既有 `ChatMessageView` 并透传 `onOpenCard`。
- 严格保留 frozen RN/H5 合同：用户/群目标文案、缺失 target/action 时禁用、群名片入群关系刷新和 SPA route 动作均未改变；不移动 DTO、SDK、缓存、申请入群或发送逻辑。
- `ChatMessageContent.tsx` 从 307 行收敛为 272 行；新组件 41 行、唯一生产消费者；源码护栏禁止其引入 Router、WebIMSync 或 SDK runtime。
- focused 3 files/7 tests、H5 full 163 files/527 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1223-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 浏览器能力证据沿用 `.149.18` 已登录真实群名片直达 canonical 群会话；本片只移动同一 JSX，未重复执行申请入群、发送、验证码或其他 mutation。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script/system contract 仍缺失。

## Completed W6.a6.20.149.35

- 将通话/图片/视频/语音/文件 JSX 抽入唯一 `ChatMediaMessageContent` presentation owner；`ChatMessageContent` 仅识别媒体消息族并透传既有 message/action。
- 严格保留 frozen RN/H5 合同：媒体 URL 安全化、图片比例/自然尺寸、音频稳定身份/已播放状态、预览/下载与 RTC 动作均继续消费既有 helper、Provider 和页面 owner。
- `ChatMessageContent.tsx` 从 272 行收敛为 98 行；新组件 232 行、唯一生产消费者；未引入 Router、WebIMSync、`new Audio` 或第二套媒体运行逻辑。
- focused 6 files/19 tests、H5 full 164 files/531 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1224-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 浏览器能力证据沿用 `.149.15` 已登录真实 5 秒语音播放终态；本片只移动同一 JSX，图片/视频/文件自然数据、下载和跨浏览器验收继续保持 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script/system contract 仍缺失。

## Completed W6.a6.20.149.36

- 将引用/普通文本/系统/不支持消息 JSX 抽入唯一 `ChatTextMessageContent` presentation owner；`ChatMessageContent` 只保留媒体、名片、自定义表情和文本族四路分发。
- 严格保留 frozen RN/H5 合同：引用来源/删除态继续消费 `chat-quote-view`，链接与 preset emoji 继续消费 `PresetEmojiTextContent`，页面跳转/复制动作只透传。
- `ChatMessageContent.tsx` 从 98 行收敛为 60 行；新组件 93 行、唯一生产消费者；未引入消息 mapper、引用解析、WebIMSync、Gateway 或第二业务 owner。
- focused 6 files/21 tests、H5 full 165 files/536 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1225-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 本片只移动已验证 JSX，未执行发送、复制、引用跳转或其他 operation；自然 quote/deleted-source 像素与跨浏览器验收继续保持 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script/system contract 仍缺失。

## Completed W6.a6.20.149.37

- 将 Header、公告、消息列表、Composer 和删除/转发/通话/名片弹层 JSX 收敛到唯一 `ChatPageSurface` presentation owner；`ChatPage` 只保留 Router、runtime、shared facade 和 hooks 编排。
- 严格保留 frozen RN/H5 合同：媒体 Provider 继续同时包裹消息区和转发 Composer，输入可用性、多选优先级、名片/转发单选、关系提示和群名片动作继续消费原 owner。
- `ChatPage.tsx` 从 399 行收敛为 255 行；新 Surface 247 行、唯一生产消费者；页面不再持有 `ChatComposer`、`ChatMessageList` 或目标弹窗 JSX，Surface 不持有 state/effect/runtime/Gateway。
- focused 8 files/26 tests、H5 full 165 files/537 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1226-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 本片只移动既有 JSX 和属性映射，未执行发送、通话、转发、删除或其他 operation；自然数据像素与跨浏览器验收继续保持 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script/system contract 仍缺失。

## Completed W6.a6.20.149.38

- 将转发、编辑、组合媒体、引用、提及与普通文本六类提交顺序收敛到唯一 `useChatComposerSubmission`；`ChatComposer` 继续持有草稿、面板、附件、mention 和视图组合，不建立第二发送入口。
- 严格保留 frozen RN/H5 合同：`createIMComposerSubmissionPlan` 仍先于编辑/媒体分派，附件仍先清 pending 再发送，各分支仍只在既有 action 成功后清草稿/mention/quote。
- `ChatComposer.tsx` 从 353 行收敛为 267 行；新 Hook 194 行、唯一生产消费者；旧内联提交分支已删除，无 compat、孤立导出或 test-only production path。
- chat-domain 78 files/260 tests、H5 full 166 files/539 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1227-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 本片只移动已验证的客户端提交编排，未执行发送、编辑、转发、附件、引用或提及 operation；自然结果、跨浏览器和实体设备验收继续保持 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script/system contract 仍缺失。

## Completed W6.a6.20.149.39

- 将待转发来源消息精确回读、来源会话/群成员名称增强、异步代次隔离和失效回调抽入唯一 `useChatPendingForward`；`useChatForwardFlow` 继续持有多选、目标弹窗、Router state 清理和 shared forward 提交。
- 严格保留 frozen RN/H5 合同：只按 1–100 个稳定 client ID 从当前账号缓存恢复；来源不完整仍报错并清 state；名称增强失败仍只降级展示，不破坏完整草稿。
- `useChatForwardFlow.ts` 从 353 行收敛为 286 行；新 Hook 101 行且只有一个生产消费者；两个类型消费者直接引用新 owner，旧类型 re-export 已删除，无 compat wrapper 或第二发送入口。
- focused 5 files/19 tests + 最终 2 files/6 tests、chat-domain 79 files/262 tests、H5 full 167 files/541 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1228-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 本片只移动缓存恢复 effect 和类型入口，未执行真实转发、目标切换或消息 mutation；自然 result/list-back、跨浏览器和实体设备验收继续保持 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script 仍缺失。

## Completed W6.a6.20.149.40

- 将 sending/pending/failed 状态、可重试按钮和双方向 RN 气泡尾角收敛到唯一 `ChatMessageBubbleChrome`；`ChatMessageBubble` 继续只编排消息方向、分组、内容、动作与状态位置。
- 严格保留 frozen RN/H5 合同：class、ARIA、disabled、稳定 client ID 回调、shared `canRetryWebIMMessage` 支持矩阵、明暗主题资源和尾角 DOM 均未改变。
- `ChatMessageBubble.tsx` 从 339 行收敛为 278 行；新组件 78 行且只有一个生产消费者；旧内联实现已删除，无 compat、孤立导出、test-only production path 或第二 retry owner。
- focused 3 files/13 tests、chat-domain 80 files/267 tests、H5 full 168 files/546 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1229-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 本片只移动同一 JSX 与 asset imports，未执行消息 retry/send 或其他 operation；自然 failed/retry 像素、跨浏览器和实体设备验收继续保持 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script 仍缺失。

## Completed W6.a6.20.149.41

- 将 unknown payload 对象/数组/字符串/数值收窄、真实媒体尺寸、时长/文件大小和秒/毫秒短时钟格式化抽入唯一 `chat-message-view-primitives`；`getChatMessageView` 继续唯一持有 contentType 分发和 shared parser 消费。
- 严格保留 frozen RN/H5 合同：普通字段仍 trim，实体敏感正文仍只校验空白并保留 UTF-16 原文；无效数值、非正尺寸、时长/大小和时间戳边界均不变；原模块继续重导出短时钟 API。
- `chat-message-view.ts` 从 370 行收敛为 294 行；primitive 87 行且只有一个生产消费者；旧内联实现已删除，无 compat、孤立导出、test-only production path 或第二消息 parser。
- focused 3 files/19 tests、chat-domain 81 files/271 tests、H5 full 169 files/550 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1230-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 本片只移动纯函数，未改变 DOM/CSS/route，未执行发送、媒体、缓存或其他 operation；自然 uncommon payload、跨浏览器和实体设备验收继续保持 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script 仍缺失。

## Completed W6.a6.20.149.42

- 将草稿优先、消息类型摘要、静音 mention、群发送者前缀和未知类型 fallback 抽入唯一 `conversation-preview-view`；`conversation-list-view` 只保留标题、未读汇总/循环定位、badge 和列表时间。
- 严格保留 frozen RN/H5 合同：shared draft reader、mention projection、群系统类型 classifier、好友消息文案与 raw content fallback 均未改变。
- `conversation-list-view.ts` 从 353 行收敛为 96 行；preview owner 263 行且只有 `ConversationRow` 与归档过滤两个生产消费者；旧内联实现删除，无 re-export、compat、孤立导出、test-only production path 或第二 parser。
- focused 4 files/21 tests、conversations-domain 15 files/47 tests、H5 full 170 files/552 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1231-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 本片只移动纯 projection 与 import，未改变 DOM/CSS/route，未执行发送、缓存写入或其他 operation；5176 route HTTP 200，自然 preview 数据、跨浏览器和实体设备验收继续 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script 仍缺失。

## Completed W6.a6.20.149.43

- 将 `getUserMedia`、`MediaRecorder` 构造、MIME negotiation、扩展名映射与 track cleanup 抽入唯一 `chat-voice-recorder-platform`；`chat-voice-recorder` 继续唯一持有 start/stop/cancel/error 和 exactly-once terminal。
- `chat-voice-recorder.ts` 从 314 行收敛为 224 行，新 platform owner 103 行且有生产消费者；旧内联 browser primitives 已删除，无 re-export、compat、孤立导出、test-only production path 或第二 recorder。
- focused 3 files/8 tests、chat-domain 82 files/273 tests、H5 full 171 files/554 tests、Web/H5 typecheck、`npm run verify`、production build 与 diff check 均通过；纯 adapter/type relocation 未重跑浏览器，真实 trusted hold、权限、录音、上传、发送和跨浏览器/实体设备矩阵继续 gated。

## Completed W6.a6.20.149.44

- 将联系人资料 Header、hero、快捷动作、主动作和资料卡片 JSX 抽入唯一 `ContactProfileSurface`；`ContactProfilePage` 继续持有 runtime、资料恢复、presence、群上下文、Router、弹窗状态和 `useContactProfileActions`。
- 严格保留 frozen RN/H5 合同：显示事实、子路由 state、action 回调与弹窗在 `main` 内的 DOM 层级未改变；不移动 SDK DTO、Gateway、SQLite、RTC 或 mutation owner。
- `ContactProfilePage.tsx` 从 344 行收敛为 224 行；Surface 205 行、唯一生产消费者；旧内联正文删除，无 compat、孤立导出、test-only production path 或第二 runtime owner。
- focused 4 files/10 tests、contacts 27 files/91 tests、H5 full 172 files/556 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、`npm run verify`、1232-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 本片只移动同一 JSX、资源和回调映射，未重跑浏览器或执行资料 mutation/RTC；自然资料数据、跨浏览器和实体设备验收继续 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script 仍缺失。

## Completed W6.a6.20.149.45

- 将 conversation、group 和 member 的 cache-first 读取、完整同步、请求代次与局部快照更新抽入唯一 `useChatSettingsData`；`ChatSettingsPage` 继续持有 React Router、toast、清空记录、退群/解散和确认层。
- 严格保留 frozen RN/H5 合同：读取与同步顺序、群身份来源、错误文案、remote-only 防重放和 shared mutation facade 均未改变。
- `ChatSettingsPage.tsx` 从 343 行收敛为 292 行；Hook 139 行且只有一个生产消费者；无 compat、孤立导出、test-only production path 或第二 cache owner。
- focused 4 files/19 tests、chat-domain 83 files/276 tests、H5 full 173 files/559 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、`npm run verify`、1233-module production build和 diff check通过；既有 >500kB chunk warning 不变。
- 本片只移动数据 effect 与本地快照动作，未重跑浏览器或执行设置 mutation；真实操作、自然数据、跨浏览器和实体设备验收继续 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；convergence script 仍缺失。

## Completed W6.a6.20.149.46

- 将 475 行 `App.tsx` 中的 provider 装配、唯一根路由树、通用域路由与聊天域路由拆为 `App`、`AppRouteTree`、`AppCoreRoutes`、`AppChatRoutes` 四个明确 owner。
- 严格保留 frozen RN/H5 合同：全部 URL、redirect、Primary Tab 嵌套、页面元素、lazy import、Suspense fallback、provider 顺序与最终 wildcard 均未改变。
- `App.tsx` 收敛为 26 行；`AppRouteTree` 16 行、通用路由 133 行、聊天路由 91 行；源码契约测试改为读取真实 owner，并新增 provider/route/transport 边界回归。
- focused 9 files/31 tests、H5 full 174 files/562 tests、Web typecheck、1236-module production build和 diff check通过；最终 `npm run verify` 结果见 status；既有 >500kB chunk warning 不变。
- 本片只搬迁路由 JSX 与 imports，未重跑浏览器或执行任何 operation；生产构建是 React Router 组合的运行时代码解析门禁，自然数据、RTC、跨浏览器和实体设备验收继续 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只允许 SDK `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；不新增 convergence 声明。

## Completed W6.a6.20.149.47

- 将来电资料、展示形态、铃声/autoplay、前台 pending refresh 与 cleanup 收敛到唯一 `useWebIMIncomingCallPresentation`；Provider 保留接听/拒绝、媒体、终态信令与 Router 提交。
- Provider 从 488 行收敛为 423 行；表现 Hook 179 行且只有一个生产消费者，无媒体创建、Gateway、SQLite、navigate、compat 或第二 call runtime。
- focused 3 files/8 tests、H5 full 175 files/564 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1237-module production build、`npm run verify` 和 diff check 通过。
- 本片未执行真实双账号通话或改变 DOM/CSS；RTC deployment、后台、多 tab、权限、弱网及跨浏览器继续 gated。

## Completed W6.a6.20.149.48

- 将通话 view、启动参数、活动快照、Context value、Context 实例与 `useWebIMCall` 抽入唯一 `WebIMCallContext`；页面只经邻近 `runtime/index.ts` facade 消费。
- 严格保留 frozen RN/H5 合同：Provider value、缺失 Provider 错误、呼出/接听/拒绝、LiveKit port、媒体控制、终态信令和 React Router 时序均未改变。
- `WebIMCallProvider.tsx` 从 423 行收敛为 386 行；Context owner 46 行，未创建 Gateway、SQLite、LiveKit 或第二生命周期。Provider 超过 300 行登记为后续 guarded split 债务。
- focused 3 files/7 tests、H5 full 176 files/567 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1238-module production build、`npm run verify`、HTTP 200 和 diff check 通过；既有 >500kB chunk warning 不变。
- 本片只移动公共 React Context/type/hook 和一个页面 import，未重跑视觉或执行 RTC operation；真实双账号、权限、弱网、终态 list-back 与浏览器矩阵继续 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；不新增 convergence 声明。

## Completed W6.a6.20.149.49

- 将当前 callID 匹配、六类远端终态白名单和 `SDK terminal -> 挂断音 -> dispose -> replace 返回会话` 串行时序抽入唯一 `useWebIMCallRemoteTerminal`；Provider 继续拥有可见错误状态和活动 owner 编排。
- `WebIMCallProvider.tsx` 从 386 行收敛为 365 行；终态 Hook 72 行且只有一个生产消费者，无 incoming/media 创建、Gateway、SQLite、compat 或第二 call runtime。Provider 超过 300 行继续登记为 guarded split 债务。
- focused 4 files/10 tests、H5 full 177 files/570 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1239-module production build、`npm run verify`、HTTP 200 和 diff check 通过；既有 >500kB chunk warning 不变。
- 本片仅搬迁相同 effect 与顺序合同，未改变 DOM/CSS/route 或执行 RTC operation，故未重跑视觉；真实双账号终态、权限、弱网、list-back 和浏览器矩阵继续 gated。
- cleanup P0/P1 zero；SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；只运行允许的 `build:web/sync:web`，未运行 RN/Desktop/all 或 `build:package:desktop:web`；不新增 convergence 声明。

## Completed W6.a6.20.149.50

- 将登录、待处理来电和重复启动守卫，LiveKit/media/outgoing owner 创建，版本失效 dispose，以及 `outgoing.start -> owner/snapshot/subscription -> /calls/active` 提交顺序抽入唯一 `useWebIMOutgoingCallStartup`。
- `WebIMCallProvider.tsx` 从 365 行收敛为 321 行；呼出启动 Hook 115 行且只有一个生产消费者。Provider 不再创建 `WebIMOutgoingCall`，无第二呼出路径、compat、Gateway/SQLite 或 fake-success。
- focused 4 files/11 tests、H5 full 177 files/571 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1240-module production build、`npm run verify`、HTTP 200 和 diff check 通过；既有 >500kB chunk warning 不变。
- 本片只移动相同呼出生命周期和依赖注入，未改变 DOM/CSS/route contract 或执行 RTC operation，故未重跑视觉；真实双账号呼出、媒体权限、弱网和浏览器矩阵继续 gated。
- Provider 仍超出 H5 300 行约束 21 行；下一独立 guarded slice 收敛活动通话控制/清理 owner，不在本片混入第二职责。SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web`；不新增 convergence 声明。

## Completed W6.a6.20.149.51

- 将活动 owner dispose、媒体操作与错误收敛、结束后 replace 返回、DOM 媒体节点绑定、logout 和 unmount cleanup 抽入唯一 `useWebIMActiveCallControls`；Provider 保留来电接听/拒绝及 Context/Overlay 组合。
- 严格保持 `捕获 owner -> 摘除 refs/订阅 -> 使启动失效 -> 清空公开状态 -> SDK dispose`，以及 `捕获来源会话 -> dispose -> replace 返回` 顺序；不存在第二 call runtime 或媒体 owner 创建路径。
- `WebIMCallProvider.tsx` 从 321 行收敛为 278 行，回到 H5 300 行约束内；活动控制 Hook 117 行且只有一个生产消费者，无 compat、orphan、Gateway/SQLite 或 fake-success。
- focused 5 files/14 tests、H5 full 178 files/574 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1241-module production build、`npm run verify`、HTTP 200 和 diff check 通过；既有 >500kB chunk warning 不变。
- 本片只移动相同控制/清理 effect，未改变 DOM/CSS/route contract 或执行 RTC operation，故未重跑视觉；真实双账号、媒体权限、弱网、后台和浏览器矩阵继续 gated。SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web`；不新增 convergence 声明。

## Completed W6.a6.20.149.52

- 将 1067 行 `chat-page.css` 收敛为 57 行稳定 facade，并按原始顺序拆为 shell 419 行、message 289 行、composer 282 行、state 25 行四个 presentation owner。
- 拆分前后通过机械重组逐字对比；selector、声明、级联顺序、dark/mobile/reduced-motion 覆盖、DOM 与 route import 均未改变，没有第二 stylesheet 或 compat path。
- 新增 Node 文件系统 owner contract，锁定 facade import 顺序、职责 selector 与 Composer owner 唯一性；focused 3 files/9 tests、H5 full 179 files/576 tests、SDK Web 101 files/426 tests、Web/H5 typecheck、466 assets、1241-module production build、`npm run verify`、HTTP 200 和 diff check 通过。
- 本片没有 SDK、Gateway/SQLite、消息 operation、路由或 RN 业务改动；因规则序列逐字等价且 DOM 不变未重跑视觉。真实消息、RTC、跨浏览器/设备和验证码 contract 继续 gated；SDK clean，RN 仅保留用户既有 `src/config/appVersion.ts`。

## Completed W6.a6.20.149.53

- 复用用户已授权的当前联调账号恢复本地 H5 登录态；未调用验证码发送 operation，目标真实群会话进入前没有未读角标。
- 382x786 与 1280x800、light 与 dark 四种组合均显示 Header、消息列表和 Composer；短消息保持底部布局，`documentElement.scrollWidth === clientWidth`，console warning/error 为 0。
- dark 只通过既有显示设置切换，验收后恢复原 `light` 偏好；临时 viewport 已 reset，标签回到目标聊天 route。
- 本片没有发送、mark-read、RTC、Gateway mutation、代码或 SDK/RN 改动；真实消息类型丰富样本、双账号 RTC、跨浏览器/设备和验证码 contract 继续 gated。

## Completed W6.a6.20.149.54

- 当前真实已读单聊 production route 恢复 11 条缓存消息：1 条群名片、7 条语音、3 条带 `转发自 donk` 的语音及普通文本；未注入 fixture 或测试消息。
- 382x786 light/dark 下全部 11 条为真实 outgoing 方向，语音 icon 位于右侧；可见气泡均在 viewport 内，Composer 与可见消息不相交，`scrollWidth=clientWidth=382`。
- 上滚取得群名片、文本、语音与转发 origin 同屏暗色活动帧；console warning/error 为 0。验收后恢复原 light 偏好、reset viewport 并返回原目标群聊。
- 本片未播放语音、点击名片、发送、mark-read、触发 RTC 或 Gateway mutation；incoming、图片、视频、文件、Safari/Firefox 与实体设备样本继续 gated，生产代码、SDK、RN 零改动。

## Completed W6.a6.20.149.55

- 当前真实目标群恢复 1 条 incoming 群主文本消息；发送人展示为备注名 `donk二大爷备注名`，没有回退到 userID，角色标签为 `群主`。
- 382x786 light/dark 下昵称和角色标签均消费同一 `userID` 哈希强调色 `#FF9850`；头像可见、接收气泡在视口内、Composer 不遮挡且横向 overflow 为 0。
- 深色气泡背景按既有 token 计算为 `rgb(46, 46, 46)`；console warning/error 为 0。验收后恢复 light 偏好、默认 viewport 和原目标群聊。
- 本片未点击消息/头像、发送、mark-read、触发 RTC 或 Gateway mutation；图片、视频、文件、其他角色、Safari/Firefox 与实体设备样本继续 gated，生产代码、SDK、RN 零改动。

## Completed W6.a6.20.149.56

- 当前真实已读群聊恢复 2 条消息，其中 1 条为 incoming 管理员自定义表情；发送人展示备注名 `donk二大爷备注名`，角色标签为 `管理员`。
- 自定义表情原图 `750x1624` 解码完成，按 frozen RN “最大宽度 180、高度保持原比例”合同渲染为 `180x390`；没有擅自改成方形或裁剪。
- 382x786 light/dark 下昵称与管理员标签共用 `#FF9850` 哈希强调色；头像、气泡、Composer 均不越界或遮挡，横向 overflow 与 console warning/error 为 0；focused 2 files/8 tests 通过。
- 验收后恢复 light 偏好、默认 viewport 和原目标群聊；未点击表情、发送、mark-read、触发 RTC 或 Gateway mutation，生产代码、SDK、RN 零改动。

## Completed W6.a6.20.149.57

- 会话列表确认当前 4 个真实会话均无未读角标后，逐个进入 production chat route 做只读 DOM 盘点；没有点击消息、播放、发送或执行任何 Gateway/SQLite mutation。
- 共恢复 16 条可见消息：文本、群名片 1、语音 7、forward origin 3、自定义表情 1；普通图片、视频、文件均为 0，因此对应验收门禁继续保持 `blocked-natural-data`。
- 自定义表情最终资源状态复核为 `complete=true`、自然尺寸 `750x1624`，不把首屏异步占位文本误判为资源失败；该证据沿用 `.149.56`，不外推到普通媒体。
- 本片只更新执行文档；生产代码、SDK 和 RN 零改动。标签恢复原群聊 route，验证码、RTC、跨浏览器与实体设备门禁不变。

## Completed W6.a6.20.149.58

- 当前 H5 累积迁移通过全量 `179 files / 576 tests`、Web TypeScript、466 个 RN 复用资源校验及 1241 模块生产构建；仅保留既有大 chunk warning。
- production source 未发现 `parityRuntime`、`localMock`、test-mode 业务分支、`setTimeout(resolve)` fake success、`console.log` 或 `TODO/FIXME/HACK`；当前没有超过 1000 行的待触达源文件。
- 本机不存在已安装的 Playwright Firefox/WebKit 或可复用跨浏览器登录态，因此 browser matrix 保持 `blocked-env`，不下载大型运行时、不迁移 token、不把 Chromium 结果外推。
- dev route HTTP 200、diff check 通过；SDK clean，RN 仅保留用户既有 `src/config/appVersion.ts`，生产代码与 SDK/RN 均未改动。

## Completed W6.a6.20.149.59

- 逐项核对 frozen RN `AuthFlowScreen` 的忘记密码和网络设置入口，与 H5 React Router/Modal owner 及迁移 SSOT 对照；普通 auth production entry 无新增漏迁。
- H5 账号登录已经通过 `ForgotPasswordMethodsDialog` 复刻 RN 替代登录路径：手机号、邮箱和客服说明；既有回归明确禁止调用已下线的 `forgotPassword` operation，不制造假成功。
- RN `NetworkSettingsScreen` 依赖 native HTTP/OpenIM HTTP/SOCKS proxy；浏览器 `fetch/WebSocket` 无等价 per-app proxy 注入，继续登记 `web-not-applicable`，不新增保存后不生效的页面；Desktop 后续走独立 adapter。
- 本片只更新执行文档；H5 production、SDK 和 RN 零改动。普通媒体自然数据、验证码 contract、RTC deployment、跨浏览器和实体设备门禁保持不变。

## Completed W6.a6.20.149.60

- 对 H5 production 页面执行 interaction/action-chain 静态审计：未发现空 `onClick/onSubmit`、hash route、开发中占位或默认 fake-success；不可用文案均对应真实 runtime/capability fail-visible 边界。
- frozen RN auth、home、conversation、contacts、calls、chat、group、QR、profile/settings 屏幕族逐项映射到 H5 React Router route、短期 modal 或已登记 platform exclusion；普通生产入口新增缺口为 0。
- H5 production TSX 最大 299 行；好友/群验证、日期/媒体/文件搜索、群公告/简介等非直达 Page 均有唯一生产消费者，没有孤立业务页面或第二 owner。
- focused route owner regression 2 files/6 tests 通过；本片只更新执行文档，H5 production、SDK 和 RN 零改动。后续禁止重复相同静态扫描，必须由 external activation ledger 激活。

## Completed W6.a6.20.149.61

- 通过官方 npm Playwright 临时工具安装 Firefox 141 与 WebKit 26 runtime；依赖未写入仓库 `package.json/package-lock`，两个浏览器使用独立临时 profile。
- Firefox 使用账号 2、WebKit 使用账号 3 完成 production 手机号固定码登录；每端真实恢复 4 个会话与 2 个联系人，382px 下 `scrollWidth === clientWidth`。
- 最终按 route 稳定阶段分别采样，会话与通讯录的 console error、page error、failed request、HTTP error 均为 0；初次快速换页产生的 cancelled request 不被误报为 CORS 缺陷。
- 未打开未读聊天、发送、RTC 或业务 mutation，也未读取/复制当前 Chromium token；H5 production、SDK 和 RN 零改动。系统 Safari、媒体/长按/权限/RTC 和实体设备仍按功能 gated。

## Completed W6.a6.20.149.62

- Firefox 141 与 WebKit 26 分别以账号 2/3 的独立临时 profile 完成 production 登录；进入聊天前读取每个会话行的未读可访问标签，只选择无未读真实群聊。
- Firefox 群聊恢复 1 条消息与 `2人在线`，WebKit 群聊恢复 2 条消息与 `1人在线`；两端真实 Composer 可用、消息栈 `flex-end`、382/382 无横向 overflow，消息列表底边与 Composer 顶边相等且不重叠。
- Firefox 短消息在未满一屏时从底部渲染；WebKit 群主文本和管理员长表情保持 RN 比例完整可见。两端点击 `返回会话` 后均恢复 4 rows，chat/back 稳定阶段 console/page/request/HTTP errors 为 0。
- focused chat list/CSS/route regression 3 files/6 tests 通过；未点击消息或媒体、未发送、未触发 RTC/Gateway mutation，production、SDK、RN 零改动。媒体操作、长按、录音/权限、系统 Safari、实体设备与 RTC 继续 gated。

## Completed W6.a6.20.149.63

- Firefox 141 与 WebKit 26 分别使用独立账号和 production 登录，选择无未读真实群聊；会话行按住 430ms 后均显示标记未读、置顶、免打扰、归档、删除五项 RN 顺序菜单。
- 两端关闭会话遮罩后 URL 保持列表；进入安全群聊后，对真实消息按住 650ms，Firefox 显示 6 个适用动作，WebKit 显示 5 个适用动作，差异来自消息编辑资格而非浏览器分支。
- 四张 382x786 截图确认会话菜单、原消息预览及消息动作菜单均在视口内；Esc 关闭消息菜单后 URL 不变，返回均恢复 4 rows，console/page/request/HTTP errors 为 0。
- focused conversation-row/action-layout regression 2 files/6 tests 通过；未点击任何 menuitem，未执行 clipboard、编辑、转发、删除、发送、RTC 或 Gateway mutation，production、SDK、RN 零改动。实体触控、系统 Safari 和所有动作结果继续 gated。

## Completed W6.a6.20.149.64

- 先审计 Firefox/WebKit 账号 2/3 的全部无未读会话，均没有语音样本；随后用两个新隔离 profile 登录主账号，在同一无未读单聊恢复 7 条真实可播放语音，没有注入 fixture 或发送测试消息。
- 两端点击第一条 5 秒语音后均从 `播放语音/false` 进入 `停止语音/true/is-playing`，自然结束后回到 `播放语音/false`；聊天 URL 全程稳定，console/page/request/HTTP errors 为 0。
- Firefox 捕获真实 OSS `.m4a` HTTP 206；WebKit 没有把请求报告为 Playwright `media` resource，但按钮状态、`is-playing` 和自然 `ended` 事件完整，不能把分类差异误报为播放失败。
- focused audio preference/content/layout/view regression 4 files/14 tests 通过；四张 382x786 playing/ended 截图无越界或 Composer 遮挡。未执行 send、Gateway/SQLite mutation、SDK build/sync 或 production/RN 改动；系统 Safari、实体设备听感、后台中断与过期 URL 继续 gated。

## Completed W6.a6.20.149.65

- 复核 `ChatVoiceInput -> useChatVoiceRecorder -> chat-voice-recorder platform -> ChatPageFeedback -> AppToast` 唯一链；权限失败在生成 `MediaRecorder/File` 之前 fail-closed，不触发 upload/send。
- H5 将麦克风权限拒绝、设备缺失和临时不可读的 DOMException 归一化为稳定中文提示；不改变 recorder session、shared audio owner 或 RN 业务合同。
- Firefox 141 通过浏览器原生拒绝策略触发真实 `getUserMedia` failure；382x786 下中文 error Toast 可见，HUD 清理、hold 恢复、route stable，手势后非 GET/upload/message 请求 0，console/page errors 0。
- Playwright WebKit 26 的 `getUserMedia` 在无系统交互时保持 permission pending，且 WebKit 不支持 microphone permission override；未用 navigator/MediaRecorder stub 冒充通过，继续标记 `blocked-env`。
- H5 focused 6 files/27 tests、SDK Web 101 files/426 tests、Web typecheck、1241-module production build 通过；既有 >500kB chunk warning 未扩大；成功录音/上传/发送、system Safari、实体设备、后台/中断继续 gated。
