# IM28 H5 Foundation Workset

## Current Workset W6 H5 Interaction Parity Closeout

| field | value |
| :--- | :--- |
| status | `.149.100 QR display converged to one global bottom-sheet owner; external activation gated` |
| owner | `shared QR/profile/group facades -> H5 QRCodeModalProvider -> entry pages` |
| target | 等待真实自然数据、明确 mutation 授权、RTC/相机/实体设备环境或新 OpenAPI contract 激活下一片；保持 shared/H5 owner 不变 |
| non-claim | route 存在不等于 capability complete；readonly browser、编译和静态合同不证明真实 send/mutation/RTC/cross-browser 成功 |
| verification | 新激活项必须复用 production path，记录 result/cache/realtime/list-back/visual evidence；禁止 fixture、fake success 或第二业务 owner |
| protected | RN business 继续冻结；shared defect 只改 `im28-sdk` 并走 `build:web/sync:web`；验证码 operation 未提供前保持 blocked |
| next | 回到 pending 申请、自然通话、RTC/相机/实体设备、明确 mutation 授权或新 OpenAPI contract 的 activation ledger；验证码发送 operation 未提供前保持 blocked |

## Closed Slice W6.a6.20.149.100 Global QR Bottom-Sheet Owner

| field | value |
| :--- | :--- |
| capability | 个人中心、个人资料、扫一扫和群资料在当前 URL 原地打开同一个全宽贴底二维码弹窗 |
| primary path | `entry page -> QRCodeModalProvider -> shared profile/group source + QR payload -> lazy QRCodeDisplay` |
| route convergence | 删除 `ProfileQRCodePage/GroupQRCodePage`；旧 `/me/qrcode` 和群二维码展示地址只做 replace 兼容跳转；分享页保留并返回真实来源页 |
| browser proof | 382x786 登录态；群弹窗 `width=382`、`bottom=786`、URL 保持群资料；个人中心和扫一扫均在原 URL 打开；旧地址分别跳转 `/me` 与群资料 |
| verification | H5 typecheck、二维码 3 文件/8 测试、1241-module production build 通过；无 mock、fake-success、页面第二 owner 或 SDK/RN 改动 |
| historical note | `.149.93/.149.96` 的 Safari 下载与 payload 反解证据仍有效；其中旧页面路径已由本切片的全局 Provider owner 取代 |
| non-claim | 不外推相机权限、实体设备扫码、二维码最终分享发送或跨浏览器触控表现 |
| status | `completed-local/global-bottom-sheet-converged` |

## Closed Slice W6.a6.20.149.99 Ordinary Video/File System Safari Acceptance

| field | value |
| :--- | :--- |
| capability | system Safari 读取 `.149.97` 已保留普通文件/视频，验证视频真实播放和 route reload 回读 |
| primary path | `authenticated system Safari -> production conversation list -> target chat -> shared SQLite read -> H5 media presentation -> Safari video element -> reload` |
| DoD | 文件卡片与视频入口可见；视频时间轴或像素帧真实变化；reload 后两类消息仍存在；无阻断 runtime error |
| activation | 用户手动解锁 Mac 并允许 Safari 远程自动化；真实 Safari 26.4 WebDriver 会话成功建立 |
| media proof | 文件=`IM28-H5-FILE-ACCEPTANCE.txt / 137 B`；视频=`320x180 / 2s`；`play()` 成功、`readyState=4`、timeline=0.30s、真实蓝色视频帧 |
| persistence proof | route reload 后文件卡片和可播放视频入口仍存在；document=`382/382` |
| protected | 不发送、不下载、不 mark-read、不执行业务 mutation；不修改 H5/SDK/RN production source |
| status | `completed-readonly/system-safari-playback-pass` |

## Closed Slice W6.a6.20.149.98 Ordinary Video/File Cross-Browser Acceptance

| field | value |
| :--- | :--- |
| capability | 复用 `.149.97` 的真实普通文件和视频，在 Firefox/WebKit 关闭读取、视频实际播放及刷新回读门禁 |
| primary path | `isolated production login -> synced conversation row -> shared SQLite message read -> H5 file/video presentation -> browser video element -> route reload` |
| media proof | 两端文件卡片=`IM28-H5-FILE-ACCEPTANCE.txt / 137 B`；视频=`320x180 / 2s`；`play()` 成功、`readyState=4`、时间轴推进约 0.26s |
| runtime proof | Firefox/WebKit 均为 382/382；消息/预览截图目检通过；console/page/request/HTTP blocking errors 0；reload 后两类消息仍可见 |
| correction | 首轮 post-login 二次导航中止会话恢复，按 `.149.70` 既有结论改为等待真实会话列表并点击目标行；该 harness 超时不归因产品 |
| non-claim | system Safari、实体设备、其他编码、大文件、文件/视频下载内容、失败重试、后台/断线恢复继续 gated |
| protected | 无 send/download/Gateway/SQLite mutation；H5/SDK/RN production source 零改动；无 SDK/RN/Desktop/all build/sync |
| status | `completed-readonly/firefox-webkit-playback-pass` |

## Closed Slice W6.a6.20.149.97 Ordinary Video/File Dual-Account Acceptance

| field | value |
| :--- | :--- |
| capability | 验证普通文件和普通视频经正式 Composer 发送后，在第二账号活动聊天实时收敛并持久化 |
| primary path | `ChatComposer -> browser attachment adapter -> shared send owner -> Gateway -> receiver WebSocket -> shared realtime normalization -> message/conversation SQLite -> H5 cache readers` |
| production proof | 137 B 文本文件与 320x180/约 2 秒 H.264 MP4；接收端不离开聊天即出现；双端 reload 后仍在；列表摘要 `[视频]`、未读 `5 -> 7` |
| runtime | 双端 warning/error 为 0；无 fixture、mock runtime、手写 WebSocket 注入或页面数据库直写 |
| cleanup | 仅删除可重新生成的本机 `/tmp` 样本；两条已授权生产测试消息保留为后续只读自然数据 |
| non-claim | Firefox/WebKit 只读播放已由 `.149.98` 关闭；不外推大文件、失败重试、断线补洞、媒体下载、system Safari 或实体设备 |
| protected | H5/SDK/RN production source 零改动；未运行 SDK/RN/Desktop/all build/sync |
| status | `completed-production/dual-account-realtime-persisted` |

## Closed Slice W6.a6.20.149.96 Personal QR Safari Download Acceptance

| field | value |
| :--- | :--- |
| capability | 在真实 system Safari 完成个人二维码 PNG 下载、文件识别与业务 payload 反解 |
| primary path | `ProfileQRCodePage -> QRCodeDisplay -> browser-qr-image -> Safari download -> Downloads PNG -> Vision decode` |
| production proof | `donk / 68078541335`；文件 `13,673 bytes`、`472x472 RGBA PNG`；反解 payload 为 `myCard / 68078541335` |
| cleanup | 验收后只移除 `im28-user-qr-68078541335.png`；文件可从正式页面重新下载 |
| non-claim | 不外推应用内分享最终发送、相机扫描、系统分享或实体设备 |
| protected | H5/SDK/RN production source 零改动，无业务 mutation，无 forbidden build/sync |
| status | `completed-production/local-file-decoded` |

## Closed Slice W6.a6.20.149.95 Production Vendor Chunk Convergence

| field | value |
| :--- | :--- |
| capability | 收敛 `.149.94` 登记的生产大 chunk 性能债，同时保持所有迁移能力和 runtime owner 不变 |
| primary path | `Vite/Rolldown module path -> React/Zod/qrcode vendor chunk -> unchanged lazy routes/runtime` |
| size proof | index `547.7 -> 369.5 kB`；runtime `612.4 -> 492.5 kB`；只剩独立 LiveKit `505.5 kB` 告警 |
| runtime proof | 独立 production preview 进入 `/auth/phone`，入口及 vendor JS/CSS 均 HTTP 200，warning/error 0 |
| verification | H5 182 files/589 tests、Web typecheck、466 assets、1242-module build、preview smoke、diff check |
| non-claim | 不外推真实业务 mutation、RTC 成功或个人二维码实际下载；LiveKit 不拆内部实现、不抬高 warning threshold |
| protected | SDK clean；RN 只含用户既有 appVersion 修改；无 forbidden build/sync |
| status | `completed-local/vendor-chunks-converged/livekit-warning-retained` |

## Closed Slice W6.a6.20.149.94 Migration Final Local Closeout Audit

| field | value |
| :--- | :--- |
| capability | 对当前 H5 迁移进行本地最终清查，确认是否仍有可直接实施的功能缺口、假成功、双 owner、孤儿或架构越界 |
| primary path | `parity inventory -> anti-mock/owner/LoC/orphan audit -> full H5 tests -> typecheck/assets/build -> repository boundary` |
| inventory proof | capability matrix 无 `partial`；所有 residual 均有明确 external activation gate |
| cleanup proof | production source markers/debug/not-implemented/duplicate export/overlimit 均为 0；测试 fixture 有 10 个真实测试消费者，不是孤儿 |
| architecture proof | 页面无 Gateway/Repository/SQL/WebSocket 直连；浏览器媒体下载 adapter 是页面域唯一 `fetch` owner |
| verification | H5 182 files/589 tests、Web typecheck、466 assets、1242-module build、HTTP 200、diff check |
| non-claim | 不证明真实 send/mutation/RTC/camera/device 或缺失 contract；既有 >500 kB chunk warning 作为非阻塞性能债保留 |
| protected | SDK clean；RN 只含用户既有 appVersion 修改；无 SDK/RN/Desktop/all build/sync |
| status | `completed-local/P0-P1-zero/external-activation-gated` |

## Closed Slice W6.a6.20.149.93 Group QR Download And Shared Export Owner

| field | value |
| :--- | :--- |
| capability | 在 system Safari 完成真实群二维码 PNG 下载、文件识别与业务 payload 反解，并核对个人/群二维码唯一导出 owner |
| primary path | `GroupQRCodePage -> QRCodeDisplay -> browser-qr-image -> Safari download -> Downloads PNG -> ZXing decode` |
| production proof | `donk的群聊 / 97524759106`；文件 `13,277 bytes`、`472x472 RGBA PNG`；反解 payload 为 `groupCard / 97524759106` |
| ownership proof | `ProfileQRCodePage` 与 `GroupQRCodePage` 均直接传入 kind/identity/payload 给同一 `QRCodeDisplay`；Canvas、PNG、Toast、modal 无双轨 |
| cleanup | 验收后只移除 `im28-group-qr-97524759106.png`；无消息、关系、群或 SQLite mutation |
| non-claim | 个人二维码实际落盘、应用内分享最终发送、相机扫描、系统分享与实体设备仍需独立验收 |
| protected | H5/SDK/RN production source 零改动，无 forbidden build/sync |
| status | `completed-production-local-file-decoded` |

## Closed Slice W6.a6.20.149.92 Safari Ordinary Image Final Download

| field | value |
| :--- | :--- |
| capability | 在 system Safari 完成正式普通图片的权限授权、文件落盘和内容一致性验收 |
| primary path | `ChatMediaPreviewOverlay -> Safari synchronous download -> browser permission -> Downloads file` |
| file proof | `29,509 bytes`、`PNG 640x360 RGBA`；本地与 OSS SHA-256 均为 `1fdfbee8720797719d27cb3a4e63e2b1fe8870b873efb7cb6d2890f2e8dbe95d` |
| cleanup | 验收后只移除目标测试文件；不改页面消息、SQLite 或业务状态 |
| non-claim | 不外推普通视频、文件消息、过期 signed URL、后台生命周期或物理移动设备 |
| protected | H5/SDK/RN production source 零改动，无业务 mutation，无 forbidden build/sync |
| status | `completed-production-local-file-verified` |

## Closed Slice W6.a6.20.149.91 Safari Ordinary Image Save Boundary

| field | value |
| :--- | :--- |
| capability | 修复 Safari 异步 Blob 下载丢失用户手势的问题，并证明正式普通图片保存动作到达浏览器权限边界 |
| primary path | `ChatMediaPreviewOverlay save -> normalized HTTP(S) URL -> Safari synchronous anchor -> browser download permission`；非 Safari 保持 `fetch -> response/blob -> object URL` |
| defect proof | 修复前 Safari 点击后无权限提示且下载目录无文件；内嵌浏览器也未暴露 Blob download event |
| runtime proof | 修复后系统 Safari 明确显示下载授权提示及正确 OSS URL；验收点击取消，下载目录保持无目标文件 |
| verification | focused 1 file/6 tests、Web typecheck、1242-module production build、diff check |
| non-claim | 未允许下载，因此不声明最终文件落盘、文件名或字节内容通过；普通视频/文件未外推 |
| protected | SDK/RN 零改动，无消息或业务 mutation，未运行 forbidden build/sync |
| status | `completed-local/system-safari-permission-boundary-pass/final-file-gated` |

## Closed Slice W6.a6.20.149.87 Visible Unread Read Natural Acceptance

| field | value |
| :--- | :--- |
| capability | 真实非零未读在 RN 对齐门禁下完成首入保护、明确定位、Gateway 已读和 Conversation SQLite 收敛 |
| primary path | `natural unread SQLite -> Chat unread divider/jump -> explicit unread action -> shared visible seq -> conversations.markRead -> Gateway success -> ConversationRepository` |
| guard proof | 长列表首次程序化锚定后静置 2.8 秒仍保留 2 条未读；没有把“DOM 已出现”错误等同于用户已阅读 |
| convergence proof | 点击“2条未读”后列表群角标和总角标清零；整页 reload 仍为 0；重进聊天不再展示未读分割线/入口 |
| runtime proof | 真实账号、真实 SQLite/Gateway 路径，浏览器无 error；未使用 fixture、mock、直接 SQL 或 fake success |
| protected | H5/SDK/RN production source 零改动；未执行 SDK/RN/Desktop/all build/sync；无额外消息或破坏性 mutation |
| residual | 物理 wheel/touchmove、latest-edge realtime read、跨窗口未读分页和失败重试继续由独立自然样本/设备 gate 管理 |
| status | `completed-production-natural-sample` |

## Closed Slice W6.a6.20.149.86 Realtime Message.Batch Dual-Account Acceptance

| field | value |
| :--- | :--- |
| capability | 真实第二账号消息经 Gateway WS 写入接收端 SQLite，并驱动活动聊天、会话 latest 和 unread 即时收敛 |
| primary path | `donk三大爷 H5 send -> Gateway -> receiver message.batch -> shared normalize/sync -> message + conversation SQLite -> dataVersion -> active chat/list` |
| production proof | 接收端未离开目标聊天；约 2.5 秒内出现 `WS-14985-验收`；返回列表后首行 latest 更新且未读由 1 增至 2 |
| persistence proof | 接收端整页 reload 后 latest、时间与 2 条未读保持，证明不是页面内存态或临时事件投影 |
| browser proof | 发送端与接收端最终 console error 均为 0 |
| anti-shortcut | 真实账号、真实发送、真实 WS；无 fixture、mock、frame 注入、H5 SQL 补写或 fake success |
| protected | 仅产生一条明确标识的联调文本；H5/SDK/RN production source 零改动；无退群、删除、建群、审核或 RTC mutation |
| residual | 本链 none；媒体消息、申请/群管理 mutation、RTC、Safari/实体设备仍由各自 activation gate 管理 |
| status | `completed-production-dual-account` |

## Closed Slice W6.a6.20.149.85 Realtime Message.Batch SQLite Visibility

| field | value |
| :--- | :--- |
| capability | WS `message.batch` 子消息缺少独立发送时间时仍写入可被当前聊天窗口读取的 SQLite 行，并发布 runtime 数据版本 |
| primary path | `Gateway WS -> normalizeIMRealtimeMessages(server_time fallback) -> createIMRealtimeMessageSync -> MessageRepository/ConversationRepository -> Web runtime dataVersion -> ChatPage SQLite reload` |
| delete-or-register | 修复既有 shared owner；未新增 H5 SQL、DTO mapping、页面事件总线、compat wrapper 或第二 realtime 路径 |
| test roles | 用户原始 frame shape 为 contract；sql.js Repository 为 persistence behavior；Web runtime WS bridge 为 subscription behavior；真实第二账号自然消息由 `.149.86` 完成 production proof |
| verification | SDK focused 3 files/13 tests + Web full 101 files/432 tests + full typecheck/boundary + `build:web/sync:web`；H5 focused 2 files/5 tests + full 182 files/588 tests + typecheck + production build |
| residual | none；部署后双账号活动聊天、latest/unread 与 reload SQLite 冷读已由 `.149.86` 验收 |
| protected | RN business/generated package 未改；未运行 RN/Desktop/all/forbidden build；无 Gateway mutation |
| status | `completed-local/accepted-by-.149.86` |

## Closed Slice W6.a6.20.149.84 Chat Draft Delete-Permission Cache Identity

| field | value |
| :--- | :--- |
| capability | 消除草稿保存换引用导致的删除权限群缓存重复读取，补齐 `.149.83` 同源 I/O 审计 |
| primary path | `Conversation projection -> stable groupID/conversationID -> groups.listCached -> joinedGroup permission projection` |
| delete-or-register | 删除 effect 对完整 `Conversation` 引用的依赖；未新增 debounce、缓存层、compat wrapper 或第二权限 owner |
| audit result | 群公告/群成员/群申请/单聊关系均已使用稳定标量；其余完整会话引用属于同步计算、回调或无活动 route state 的早退路径 |
| verification | focused 3 files/10 tests；full H5 182 files/588 tests；Web typecheck；1242-module production build |
| browser evidence | 真实群聊临时草稿已清空；整页刷新后 SQLite 回读为空，刷新后 warning/error=0；未发送 |
| non-claim | 页面控制层无 Resource Timing/fetch/XHR/network events，不声明逐请求抓包通过 |
| protected | SDK/RN 零改动、无业务 mutation、无 forbidden build/sync |
| status | `completed-local/browser-smoke/network-recorder-tooling-gated` |

## Closed Slice W6.a6.20.149.83 Chat Draft Stable Group-Sync Identity

| field | value |
| :--- | :--- |
| capability | 保留聊天草稿逐字 SQLite 持久化，同时阻止草稿对象换引用重复拉取群申请、群资料、群成员和用户详情 |
| primary path | `ChatComposer draft -> shared SQLite save -> Conversation projection update`；群同步 effect 改为只观察稳定 `groupID`，业务 owner 不变 |
| delete-or-register | 删除对完整 `Conversation` 引用的 effect 依赖；未新增 debounce、请求缓存、compat wrapper 或第二同步路径 |
| test roles | 稳定依赖为 contract；既有 shared facade 调用为 behavior；真实群聊草稿写入/清空为 readonly smoke；placeholder=0 |
| verification | focused 2 files/6 tests；full H5 182 files/587 tests；Web typecheck；1242-module production build |
| browser evidence | 真实群聊加载；临时草稿字符已清空；warning/error=0；运行环境无 Resource Timing，因此不声明浏览器逐请求抓包通过 |
| protected | SDK/RN 零改动、未发送、无业务 mutation、无 forbidden build/sync |
| status | `completed-local/browser-smoke/network-recorder-tooling-gated` |

## Closed Slice W6.a6.20.149.82 H5 Global PC Pull-Refresh Convergence

| field | value |
| :--- | :--- |
| capability | 全部下拉刷新页面在 `platform=pc` 支持鼠标主键拖拽，同时保留原 Touch Events |
| primary path | `shared usePullRefresh platform gesture -> page-injected existing refresh action -> existing state/shared owner` |
| change mode | `extend`；只扩展 17 个生产消费者的平台事件接入，不移动或复制任何 refresh/sync/cache 业务逻辑 |
| interaction safety | 页面祖先不再捕获 Pointer；子行长按、按钮点击和成员选择继续接收自己的 up/cancel 生命周期 |
| test roles | 全局消费者/无 capture 为 contract；Hook pointer 判定为 behavior；真实建群页鼠标刷新和好友选中/取消为 proof；placeholder=0 |
| verification | focused 4 files/12 tests；full H5 182 files/586 tests；typecheck；1242-module production build；`git diff --check` |
| browser evidence | 真实好友数据；`正在刷新 -> 下拉刷新`；好友选中/取消正常；创建 CTA disabled；warning/error=0；未创建群 |
| protected | SDK/RN 零改动、无业务 mutation、无 forbidden build/sync；实体触摸和其余页面逐页视觉仍 gated |
| status | `completed-global-pc-browser-pass/physical-touch-gated` |

## Closed Slice W6.a6.20.149.81 H5 PC Pointer Conversation Refresh

| field | value |
| :--- | :--- |
| capability | `platform=pc` 鼠标下拉触发正式会话全量刷新，同时保留原 Touch Events |
| primary path | `usePullRefresh platform gesture -> useConversationsPageState.refreshConversations -> SDK forceFullSnapshot -> postV1ConversationList -> success-only SQLite replace` |
| delete-or-register | 本次为既有手势适配器的 `extend`；没有被替代生产路径、compat wrapper 或第二 refresh owner |
| test roles | pointer 判定为 behavior；页面唯一 owner wiring 为 contract；真实登录态鼠标下拉为 proof；placeholder=0 |
| browser evidence | 4 条真实 SQLite 会话；鼠标下拉显示“正在刷新”并自然恢复“下拉刷新”，列表数量稳定，无本片新增 runtime error |
| verification | focused 3 files/8 tests；full H5 182 files/584 tests；typecheck；1242-module production build；`git diff --check` |
| protected | 无 SDK/RN 改动、无业务 mutation、无 forbidden build/sync；physical touch 仍显式 gated |
| status | `completed-pc-browser-pass/physical-touch-gated` |

## Closed Slice W6.a6.20.149.80 SDK/H5 Web Full Regression Closeout

| field | value |
| :--- | :--- |
| scope | 只验证 Web runtime：SDK shared+web、H5 production consumer、RN 同源 assets；不进入 RN/Desktop build 或 sync |
| SDK evidence | runtime boundary pass；101 test files / 431 tests pass；`typecheck:web` pass |
| H5 evidence | 466 assets pass；workspace typecheck pass；1242-module production build pass |
| warning | Vite 报告既有 >500 kB chunks；不影响 correctness gate，登记为后续性能拆包债 |
| protected | 无 production source 改动、无业务 mutation、无 RN source/package rewrite；未运行 forbidden build/sync |
| status | `completed-regression/no-new-activation` |

## Closed Slice W6.a6.20.149.79 Migration Closeout SSOT Reconciliation

| field | value |
| :--- | :--- |
| capability | `.149.78 conversation full refresh + ordinary member leave RN parity` |
| primary path | `H5 cache-first/touch UI -> SDK forceFullSnapshot/listConversations -> postV1ConversationList -> success-only SQLite replace`；group leave 继续由 shared lifecycle 持有 |
| delete-or-register | 无旧生产路径被保留；Difference 继续作为增量同步 owner，全量用户刷新是显式 mode，不是第二 DTO/cache owner |
| test roles | SDK transport/sync 为 behavior；H5 caller/sheet 为 contract；登录态列表与普通成员弹层为 readonly proof；placeholder=0 |
| browser boundary | 4 条真实 SQLite 会话、warning/error=0；鼠标 drag 未触发 touch-only 手势，不声明浏览器 refresh pass |
| anti-shortcut | 未新增 fixture、mock、fake success、页面 DTO/cache 替换或兼容 wrapper |
| protected | docs-only；无业务 mutation；SDK/RN/H5 production source 均未改 |
| status | `completed-docs/no-new-activation` |

## Closed Slice W6.a6.20.149.78 Conversation Full Refresh + Member Leave RN Parity

| field | value |
| :--- | :--- |
| primary path | `Web SQLite first paint -> shared forceFullSnapshot sync -> postV1ConversationList pages -> success-only SQLite replace -> H5 cache reload` |
| sync change | `forceFullSnapshot` 显式绕过 Difference；远端缺少数组 fail-closed，显式空数组才是合法空快照 |
| H5 consumer | 首次后台同步和下拉刷新均使用全量模式，页面不直接持有 DTO 映射或缓存替换逻辑 |
| leave parity | 普通成员复用 RN 两动作底部层；`clearHistory=false/true` 继续交给 shared group lifecycle |
| browser evidence | 真实普通成员群展示两项退出动作；仅点击取消，弹窗关闭且群设置保持 |
| verification | SDK 9/9 focused + Gateway transport + typecheck + build:web/sync:web；H5 6/6 focused + typecheck + production build |
| non-claim | 无浏览器网络抓包证据；未执行真实退出、删本人群消息或第二账号回读 |
| protected | RN business frozen；未运行 `build:rn/sync:rn/build:all/build:package:desktop:web` |
| status | `completed-local-readonly/destructive-and-second-account-gated` |

## Closed Slice W6.a6.20.149.77 Create-Group Desktop Responsive Regression

| field | value |
| :--- | :--- |
| primary path | `authenticated contacts cache -> create-group state owner -> H5 selection presentation -> 480px desktop shell` |
| defect | 1280x800 下主体 Surface 为 1280px，而 Footer/已选复核层已为 480px，桌面壳层失配 |
| change | `rn-create-group-surface` 恢复 `max-width: 480px`；新增独立 CSS contract，不修改 shared 2–998 rule 或 create transaction |
| desktop evidence | dark 1280x800；主体/Footer/复核层均为 `x=400/width=480`；document `1280/1280` |
| mobile evidence | light 382x786；三者均为 `x=0/width=382`；document `382/382` |
| interaction evidence | 2 位真实好友；初始 CTA disabled；ALL 后已选 2、CTA enabled；复核层 2 行；未提交创建 |
| runtime boundary | blocking error=0；favicon 404 与全局 incoming-call refresh Gateway 不可用按环境噪声登记 |
| verification | focused 3 files/9 tests；H5 typecheck；diff check |
| protected | 无 create/Gateway/SQLite mutation；SDK/RN runtime 零改动；未运行 `build:rn/sync:rn/build:all/build:package:desktop:web` |
| status | `completed-responsive-readonly/create-and-device-gated` |

## Closed Slice W6.a6.20.149.76 Verification Desktop Responsive Regression

| field | value |
| :--- | :--- |
| primary path | `verification page shell -> 480px centered desktop Surface -> full-width mobile Surface -> existing shared application read path` |
| defect | 1280x800 实测验证中心和单群申请 Surface 被拉伸为 1280px，与既有移动页面桌面壳层合同不一致 |
| change | `rn-verification-messages-surface` 与 `rn-group-applications-surface` 恢复 `max-width: 480px`；新增 CSS contract 防回退 |
| desktop evidence | dark 1280x800；好友/群聚合/单群三路均为 `x=400/width=480`；好友历史 reload 前后 3/3；document `1280/1280` |
| mobile evidence | light 382x786；三路均为 `x=0/width=382`；document `382/382` |
| runtime boundary | 群聚合/单群真实空态；当前环境远端刷新报告 `Gateway network is unavailable`，不声明审核 transport pass |
| verification | CSS contract 1/1；H5 typecheck；diff check |
| protected | 无 application mutation；SDK/RN runtime 零改动；未运行 `build:rn/sync:rn/build:all/build:package:desktop:web` |
| status | `completed-responsive-readonly/pending-actions-and-gateway-gated` |

## Closed Slice W6.a6.20.149.75 Verification Dark Readonly Acceptance

| field | value |
| :--- | :--- |
| primary path | `display preference -> dark theme tokens -> friend/group verification routes -> restore light` |
| friend evidence | 3 条真实好友历史在 dark 下完整恢复；page/surface computed background=`rgb(17,19,24)` / `rgb(15,17,21)` |
| group evidence | 群验证聚合页和群 `97524759106` 单群页 dark 空态正确 |
| runtime evidence | 382x786、document `382/382`、三页 warning/error=0；最终恢复 light 并回到好友历史列表 |
| non-claim | 浏览器控制层无 viewport resize API，本片不声明 desktop；pending/审核/角标/system Safari/实体设备仍 gated |
| protected | 无 application mutation；H5/SDK/RN runtime 零改动 |
| status | `completed-dark-readonly/desktop-gated` |

## Closed Slice W6.a6.20.149.74 Verification-History Readonly Acceptance

| field | value |
| :--- | :--- |
| primary path | `authenticated runtime -> shared application sync/cache -> verification list -> contact profile -> source return` |
| friend evidence | 最近三天 3 条真实已添加记录；incoming/outgoing、来源、申请文案与终态正确 |
| route evidence | `donk二大爷 -> /contacts/users/94424103659 -> /contacts/verifications/friend`；资料备注名/昵称/来源/日期正确 |
| group evidence | 聚合页和群 `97524759106` 单群页均为空态；不得外推 pending/审核能力 |
| runtime evidence | 382x786、document `382/382`、warning/error=0 |
| non-claim | pending 角标、接受/拒绝、权限、Gateway/SQLite 结果和第二账号 realtime/list-back 未验证 |
| protected | 无 application mutation；H5/SDK/RN runtime 零改动 |
| status | `completed-readonly/pending-actions-gated` |

## Closed Audit W6.a6.20.149.73 Call-Record Activation

| field | value |
| :--- | :--- |
| primary path | `authenticated runtime -> shared call-record sync/cache -> H5 calls list filters/search` |
| production data | 当前真实账号同步后 0 条；历史 2 条证据不可替代当前自然详情样本，不构造 callID |
| browser evidence | 所有通话/未接来电、`donk` 搜索空态、清除恢复均通过；382x786、document `382/382`、warning/error=0 |
| non-claim | 未验证非空 row、分页、`/calls/:callID`、同日记录、删除、RTC、terminal realtime 或第二账号 list-back |
| protected | 无拨号、删除或 RTC；H5/SDK/RN runtime 零改动 |
| status | `audited-empty/natural-call-data-gated` |

## Closed Slice W6.a6.20.149.72 Group-State Owner Browser Acceptance

| field | value |
| :--- | :--- |
| primary path | `authenticated runtime -> joined-groups/group-members state hooks -> cached/synced group projections -> H5 readonly presentation` |
| joined-groups evidence | 2 个真实群；owner 标签、群 ID 搜索、三项右键等价长按菜单均通过；关闭菜单后清空搜索 |
| members evidence | 群 `97524759106` 的 3 位成员、online、群主/管理员、备注名搜索和索引通过 |
| runtime evidence | 382x786、document `382/382`、warning/error=0 |
| non-claim | 未执行刷新副作用以外的 share/leave/rename/invite/remove/role mutation；physical touch、跨浏览器与 realtime/persistence 仍 gated |
| status | `completed-readonly/group-mutations-gated` |

## Closed Slice W6.a6.20.149.71 Group-Owner Leave RN Parity

| field | value |
| :--- | :--- |
| primary path | `GroupSettingsScreen/GroupOwnerQuitActionSheets frozen truth -> selectIMEarliestGroupAdmin -> H5 owner quit sheet -> groupLifecycle.leave -> Gateway auto-transfer -> group-domain transaction` |
| browser readonly | 真实群 `97524759106` 的有管理员分支展示 `donk二大爷备注名 / 94424103659`；382x786 面板贴底、无横向溢出、console clean；只点击取消，未执行退出 |
| adjacent create audit | `/groups/create` 真实好友数据验证已有群入口、ALL、2 人选中、已选复核和 shared 2–998 CTA；最终清空本地选择，未创建群 |
| remaining activation | 群主无管理员自然样本；真实退出/Gateway 自动转移/第二账号 realtime-list-back；dark/system Safari/physical device |
| no-admin branch | 当前群主无管理员时 shared lifecycle fail-closed；H5 展示 RN 同款说明并进入 `/settings/manage/admins`，不调用 leave |
| admin branch | 按 `adminSince/admin_since` 升序选择最早添加管理员并展示头像、昵称、ID、角色；两个动作分别发送 `clearHistory=false/true` |
| mutation boundary | 只调用一次 Gateway leave；禁止先显式 transfer 再 leave；`remote-only` 继续锁定重放 |
| verification | SDK 104/433、typecheck、build:web/sync:web；H5 focused 5 files/22 tests、typecheck、1242-module build |
| protected | RN business/generated package 未修改；未运行 RN/Desktop/all publish；真实退群、自动转移和第二账号回读未执行 |
| status | `completed-local/destructive-browser-gated` |

## Closed Slice W6.a6.20.149.70 Cross-Browser Gateway Transport Audit

| field | value |
| :--- | :--- |
| primary path | `Gateway OPTIONS/actual POST -> WebKit header matrix -> authenticated in-page probes -> corrected Firefox/WebKit acceptance rerun` |
| transport | three OPTIONS 204；three unauthenticated POST HTTP 200 with CORS；WebKit five-header matrix pass；authenticated friend/group probes HTTP 200/code 0 |
| root cause | 登录 URL 稳定后测试脚本再次 `page.goto('/conversations')`，中止页面刚挂载的 unread/pending 请求；WebKit/Firefox 将 navigation abort 分别报告为 CORS/network error |
| correction | 只删除临时验收脚本的冗余导航；未改产品 H5、SDK、Gateway 配置或 RN |
| verification | Firefox/WebKit complete image gate pass；runtime blocking errors both 0 |
| status | `completed-audit/no-product-defect/harness-false-positive-closed` |

## Closed Slice W6.a6.20.149.69 Firefox/WebKit Ordinary-Image Readonly Acceptance

| field | value |
| :--- | :--- |
| primary path | `isolated production login -> synced conversation list -> retained ordinary image -> thumbnail -> full preview -> reload readback` |
| Firefox | 640x360 decode；180x101 thumbnail；preview final opacity=1；382/382；image-specific blocking errors 0 |
| WebKit | same image metrics and final visual proof；transition-phase blank capture was rejected and rerun after opacity=1 |
| runtime residual | `.149.70` corrected the redundant post-login navigation；both browsers now report zero blocking runtime errors |
| verification | H5 focused 2 files/5 tests；corrected Firefox/WebKit full readonly gates pass |
| protected | no send/download/save、business mutation、production runtime、SDK source/generated package or frozen RN business edit |
| status | `completed-image-readonly/firefox-webkit-runtime-clean-pass` |

## Closed Slice W6.a6.20.149.68 Authorized Image Send Acceptance

| field | value |
| :--- | :--- |
| primary path | `ChatComposer 相册 -> browser file chooser -> production media upload/send owner -> chat cache/list projection -> conversation preview -> refreshed chat route` |
| exact scope | 主账号仅向 `donk三大爷` 发送并保留一张 640x360 无敏感测试 PNG；选图后现有交互自动发送，未执行第二次发送 |
| runtime result | 聊天新增普通图片；会话摘要=`[图片]`；重新进入和整页刷新后仍可回读；全屏预览与保存入口可打开 |
| ratio result | `ChatMediaMessageContent` 消费消息宽高，缺失时用 natural size 回补；RN 180px 上限等比规则的 focused 2 files/5 tests 通过 |
| non-claim | 接收账号未在发送前在线；不宣称第二客户端 WebSocket realtime、接收端 SQLite、实际下载保存、视频/文件、跨浏览器或实体设备 |
| protected | H5/SDK/RN runtime source 零改动；SDK clean；RN 仅用户既有 `src/config/appVersion.ts`；未运行 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web` |
| status | `completed/authorized-image-send/chromium-pass/receiver-realtime-gated` |

## Audited Slice W6.a6.20.149.67 H5 Cleanup Audit

| field | value |
| :--- | :--- |
| baseline | H5 TypeScript pass；Vitest 180/579 pass |
| findings | P0/P1=`0`；production TS/TSX max=299；temporary/debug/not-implemented markers=`0` |
| accepted P3 | CSS max=830，低于 1000-line hard gate；无 owner drift 时不做体量驱动拆分 |
| tooling gap | `scripts/check-convergence.sh` absent；不伪造 deterministic convergence result |
| protected | production/SDK/RN runtime 零改动；SDK clean；RN 仅用户既有 `src/config/appVersion.ts` |
| next | active slice=`none`；等待 inventory 中真实 activation |
| status | `cleanup-audited/p0-p1-zero/no-new-activation` |

## Audited Slice W6.a6.20.149.66 Activation Audit

| field | value |
| :--- | :--- |
| production check | 已授权主账号登录；4 个无未读会话只读检查，console error=0 |
| natural data | 16 条可见消息；ordinary image/video/file=`0/0/0`；未用 custom emoji、语音或 fixture 外推 |
| activation state | verification-code=`contract-blocked`；RTC=`deployment-gated`；successful microphone/media=`browser-device-gated`；business mutation=`authorization-gated` |
| protected | 无 upload/send/download/delete/group/settings mutation；SDK clean；RN 仅用户既有 `src/config/appVersion.ts` |
| next | 任一真实激活条件出现后冻结单条 operation 再继续；此前不新增代码 slice |
| status | `audited-readonly/no-new-activation` |

## Closed Slice W6.a6.20.149.65 Microphone Failure Recovery Acceptance

| field | value |
| :--- | :--- |
| primary path | `production chat -> ChatVoiceInput trusted mouse hold -> real getUserMedia -> useChatVoiceRecorder -> ChatPageFeedback -> global error Toast` |
| code change | H5-only DOMException 中文归一化；不改 recorder/session/upload/send owner |
| Firefox | native microphone deny；Toast=`无法访问麦克风，请检查浏览器权限`；HUD 退出、hold 恢复、route stable |
| safety | post-gesture non-GET/upload/message requests 0；console/page errors 0；no File/MediaRecorder/send |
| WebKit | top-level permission remains pending without system interaction；iframe policy removes mediaDevices；honestly retained as blocked-env |
| verification | H5 6 files/27 tests；SDK Web 101/426；Web typecheck；1241-module build；382x786 visual proof |
| protected | no fake media API、no upload/send/Gateway/SQLite mutation、no SDK source or RN business edit |
| non-claim | no successful recording、physical microphone/touch、system Safari、background/interruption or audio send proof |
| status | `completed-local/firefox-microphone-denial-pass/webkit-permission-bridge-gated` |

## Closed Slice W6.a6.20.149.64 Firefox/WebKit Audio Playback Acceptance

| field | value |
| :--- | :--- |
| primary path | `isolated production phone login -> unread guard -> cached audio message -> ChatMediaInteractionProvider -> browser audio play/ended` |
| sample | account 1 safe direct chat；7 real playable audio messages；first duration 5s；accounts 2/3 audited with zero audio samples |
| Firefox | `播放语音(false) -> 停止语音(true/is-playing) -> natural ended -> 播放语音(false)`；OSS 206 |
| WebKit | same state chain and natural ended；Playwright did not classify request as media；runtime errors 0 |
| verification | focused 4 files/14 tests；four 382x786 screenshots；URL stable；console/page/request/HTTP errors 0 |
| protected | no fixture、send、message/Gateway/SQLite mutation、SDK build/sync、production or RN business edit |
| non-claim | no system Safari、physical audio quality、background/interruption、expired URL or device safe-area proof |
| status | `completed-local/firefox-webkit-audio-playback-pass` |

## Closed Slice W6.a6.20.149.63 Firefox/WebKit Long-Press Menu Acceptance

| field | value |
| :--- | :--- |
| primary path | `isolated production phone login -> safe conversation row hold -> menu/backdrop close -> safe chat message hold -> menu/Escape close -> React Router back` |
| Firefox | account 2；430ms conversation hold + 650ms message hold；5/6 actions；URL stable；back 4 rows |
| WebKit | account 3；430ms conversation hold + 650ms message hold；5/5 actions；URL stable；back 4 rows |
| visual | four 382x786 screenshots；conversation menu、message preview and applicable actions stay inside viewport |
| verification | focused 2 files/6 tests；console/page/request/HTTP errors 0 |
| protected | no menuitem click、clipboard、edit、forward、delete、send、RTC、Gateway mutation or production/SDK/RN edit |
| non-claim | no physical touch、system Safari、action-result、permission or device safe-area proof |
| status | `completed-local/firefox-webkit-longpress-menu-pass` |

## Closed Slice W6.a6.20.149.62 Firefox/WebKit Chat Readonly Acceptance

| field | value |
| :--- | :--- |
| primary path | `isolated production phone login -> unread DOM guard -> read group chat -> ChatHeader/ChatMessageList/ChatComposer -> React Router back` |
| Firefox | account 2；safe group 1 message；2 online；flex-end；382/382；no overlap；back 4 rows |
| WebKit | account 3；safe group 2 messages；1 online；flex-end；382/382；no overlap；back 4 rows |
| visual | Firefox short message anchored at bottom；WebKit owner text + admin custom emoji visible at RN aspect ratio |
| verification | focused 3 files/6 tests；chat/back stable console/page/request/HTTP errors 0 |
| protected | unread row never opened；no message/media click、send、RTC、Gateway mutation、token inspection or production/SDK/RN edit |
| non-claim | no media playback/download、long-press、voice recording、permission、system Safari、physical touch or RTC proof |
| status | `completed-local/firefox-webkit-chat-readonly-pass` |

## Closed Slice W6.a6.20.149.61 Firefox/WebKit Core-Route Acceptance

| field | value |
| :--- | :--- |
| primary path | `official Playwright Firefox/WebKit -> isolated production phone login -> conversations -> contacts` |
| accounts | Firefox `15555555552`；WebKit `15555555553`；固定码环境合同；profiles close 后不保留 |
| proof | both browsers: conversations 4、contacts 2、382px no overflow、stable console/page/request/HTTP errors 0 |
| cancellation control | 初次快速 route switch 的 aborted request 未作为缺陷；最终按页面稳定阶段采样后失败为 0 |
| protected | 未打开未读聊天、未发送、未触发 RTC/mutation、未读取/复制 token；production/SDK/RN 零改动 |
| non-claim | 不证明 system Safari、media decode/playback、long-press、camera/mic、RTC、background 或 physical touch |
| status | `completed-local/firefox-webkit-core-route-pass` |

## Closed Slice W6.a6.20.149.60 Production Action-Chain Residual Audit

| field | value |
| :--- | :--- |
| primary path | `frozen RN screen-family ledger -> H5 routes/pages/modal composition -> handler/fake-success/orphan scan -> route owner regression` |
| interaction result | 无空 handler、hash route、开发中占位或默认成功 shortcut；运行配置/服务不可用文案均为 fail-visible boundary |
| ownership result | production TSX 最大 299 行；非直达 Page 均由验证、搜索或群文本详情 owner 唯一消费，无孤立业务页面 |
| route result | auth/home/conversation/contact/call/chat/group/QR/profile/settings 屏幕族均有 route、modal 或明确 platform exclusion |
| verification | focused route owner 2 files/6 tests；source ledger；diff/repo protection |
| protected | H5 production、SDK、RN business 零改动；不运行 SDK build/sync；不执行 mutation/RTC/验证码 |
| stop rule | 相同静态面不得再次扫描；下一片只能由 natural-data、business-mutation、deployment、browser/device 或 backend-contract 激活 |
| status | `completed-local/production-action-chain-ledger-clean` |

## Closed Slice W6.a6.20.149.59 Auth Entry Residual Audit

| field | value |
| :--- | :--- |
| primary path | `RN AuthFlowScreen visible entries -> H5 auth route/modal ledger -> migration SSOT classification` |
| forgot password | H5 已由账号登录页打开 `ForgotPasswordMethodsDialog`，提供手机号/邮箱替代登录和客服说明；不调用已下线 Gateway operation |
| network settings | RN native HTTP/OpenIM HTTP/SOCKS proxy 在 browser 无等价 owner，维持 `web-not-applicable`；Desktop 后续独立 adapter |
| route verdict | 普通 RN auth production entry 无新增漏迁；route/modal 存在不扩大 operation 完成声明 |
| protected | H5 production、SDK、RN business 零改动；不运行 SDK build/sync；验证码发送不调用 |
| verification | RN/H5 source ledger + existing focused contract + migration SSOT cross-check + diff/repo protection |
| status | `completed-local/auth-entry-ledger-clean` |

## Closed Slice W6.a6.20.149.58 Migration Phase Regression And Browser-Runtime Gate Audit

| field | value |
| :--- | :--- |
| primary path | `current H5 migration worktree -> full Vitest/typecheck/assets/build -> anti-mock/static/repo/runtime boundary audit` |
| verification | 179 files/576 tests；Web typecheck；466 assets；1241-module production build；HTTP 200；diff check |
| anti-mock | production source 无 parityRuntime/localMock/test-mode business branch/fake-success |
| cleanup | 无 console.log/TODO/FIXME/HACK；无 >1000-line touched source candidate；既有 chunk warning 未扩大 |
| browser gate | Firefox/WebKit runtime 和授权登录态均不可用，保持 `blocked-env`；未安装大型依赖或迁移 token |
| protected | SDK clean；RN 仅用户既有 `src/config/appVersion.ts`；生产代码零改动 |
| status | `completed-local/regression-pass/browser-matrix-blocked-env` |

## Closed Slice W6.a6.20.149.57 Current-Account Ordinary-Media Inventory Audit

| field | value |
| :--- | :--- |
| primary path | `authenticated conversation list -> unread guard -> four production chat routes -> message DOM subtype inventory` |
| scenario | 当前 4 个会话均无未读角标；逐个只读检查全部 16 条可见消息 |
| result | 文本、群名片 1、语音 7、forward origin 3、自定义表情 1；普通图片/视频/文件均为 0 |
| safety | 禁止 unread chat、message/media click、playback、send、RTC、Gateway/SQLite mutation |
| cross-check | 自定义表情最终 `complete=true`、自然尺寸 `750x1624`；普通媒体不从自定义表情外推 |
| protected | H5 production、SDK、RN business 零改动；不运行 SDK build/sync；验证码发送不调用 |
| status | `completed-local/blocked-natural-data` |

## Closed Slice W6.a6.20.149.56 Incoming Admin Custom-Emoji Natural-Sample Acceptance

| field | value |
| :--- | :--- |
| primary path | `authenticated cached group chat -> SDK member resolver -> ChatGroupSenderView -> ChatMessageBubble/ChatMediaMessageContent -> split CSS owners` |
| scenario | 当前已读 `donk的群聊`；真实 incoming 管理员自定义表情；382x786 light/dark |
| safety | screenshot、DOM、image state、computed style、overflow、console only；禁止 emoji click/send/mark-read/RTC/mutation |
| proof | 备注名与管理员标签可见且共用哈希色；真实 img complete/natural size 非零；头像/气泡/Composer 无越界遮挡 |
| protected | RN business frozen；SDK/H5 production 仅在发现真实缺陷后做最小修复；验证码发送不调用 |
| verification | focused 2 files/8 tests；2 real rows；1 incoming admin custom emoji；750x1624 -> RN parity 180x390；382x786 light/dark；零 overflow/overlap/console error；主题恢复 |
| status | `completed-local/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.55 Incoming Group Bubble Natural-Sample Acceptance

| field | value |
| :--- | :--- |
| primary path | `authenticated cached group chat -> SDK group member display-name resolver -> ChatGroupSenderView -> ChatMessageBubble -> chat-message-layout.css` |
| scenario | 当前目标群聊中的真实 incoming 群主文本；382x786 light/dark |
| safety | screenshot、DOM、computed style、overflow、console only；禁止 message click/send/mark-read/RTC/mutation |
| proof | 昵称不是 userID fallback；群主标签可见；昵称和标签共用同一 userID 哈希色；头像/气泡/Composer 无越界遮挡 |
| protected | RN business frozen；SDK/H5 production 仅在发现真实缺陷后做最小修复；验证码发送不调用 |
| verification | 1 real incoming owner row；备注名/群主标签；shared hash color `#FF9850`；382x786 light/dark；零 overflow/overlap/console error；主题恢复 |
| status | `completed-local/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.54 Rich Message CSS Natural-Sample Acceptance

| field | value |
| :--- | :--- |
| primary path | `authenticated cached single chat -> ChatMessageContent/ChatMessageBubble -> chat-message-layout.css + chat-composer-layout.css` |
| scenario | 当前已读 `donk三大爷` 单聊；type108/type103/forward origin 自然缓存消息；382x786 light/dark |
| safety | screenshot、DOM、computed layout、console only；禁止 playback/card click/send/mark-read/RTC/mutation |
| verification | 11 real rows；card 1/audio 7/forward origin 3；382x786 light/dark；outgoing icon 右侧；零 overflow/overlap/console error；主题恢复 |
| protected | 无 playback/card click/send/mark-read/RTC/Gateway mutation；生产代码、SDK、RN 零改动 |
| status | `completed-local/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.53 Chat Page CSS Visual Acceptance

| field | value |
| :--- | :--- |
| primary path | `authenticated React Router chat route -> ChatPageSurface -> chat-page.css facade -> visible DOM` |
| scenario | 当前真实会话；移动/桌面 viewport；亮/暗主题；不切换业务状态 |
| safety | screenshot、computed layout、overflow、console only；禁止 send/mark-read/RTC/mutation |
| verification | 382x786/1280x800 × light/dark；Header/list/Composer 可见；零 overflow；零 console warning/error；主题和 viewport 恢复 |
| protected | 无 send/mark-read/RTC/Gateway mutation；生产代码、SDK、RN 零改动；验证码发送未调用 |
| status | `completed-local/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.52 Chat Page CSS Owner Split

| field | value |
| :--- | :--- |
| primary path | `ChatPage/OfflineChatPage -> chat-page.css facade -> four responsibility CSS owners` |
| change mode | `replace structural ownership only` |
| delete-or-register | 1067 行单文件已变为 57 行 facade；四个职责 owner 无第二份规则或 compat stylesheet |
| behavior contract | selector、声明、导入顺序、dark/mobile/reduced-motion、DOM 与 route 均不变 |
| structure | facade 57；shell 419；message 289；composer 282；state 25；重组逐字一致 |
| verification | focused 3/9；H5 179/576；SDK Web 101/426；typecheck；466 assets；1241-module build；verify；HTTP 200；diff check；P0/P1 zero |
| protected | RN business frozen；SDK source unchanged；只允许 Web build/sync；验证码和真实 RTC gate 不变 |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.51 Active Call Control And Cleanup Owner Split

| field | value |
| :--- | :--- |
| owner chain | `WebIMCallProvider composition -> useWebIMActiveCallControls dispose/control/end/lifecycle -> current SDK call owner/LiveKit port` |
| completed | dispose、媒体操作/错误收敛、结束返回、DOM 媒体绑定、logout/unmount cleanup 进入唯一 Hook；接听/拒绝和 Context/Overlay 组合留在 Provider |
| structure | `WebIMCallProvider.tsx 321 -> 278`，关闭 300 行超限；Hook 117 行、唯一生产消费者；无 owner 创建、compat/orphan/test-only path 或第二 runtime |
| browser | 纯控制/cleanup relocation 未重跑视觉；HTTP 200；DOM/CSS/route contract/operation 不变；真实双账号控制与浏览器矩阵继续 gated |
| verification | focused 5/14；H5 full 178/574；SDK Web 101/426；Web/H5 typecheck；466 assets；1241-module build；`npm run verify`；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.50 Outgoing Call Startup Owner Split

| field | value |
| :--- | :--- |
| owner chain | `WebIMCallProvider dependency composition -> useWebIMOutgoingCallStartup guards/stale cleanup/commit -> SDK outgoing/media owner -> active route` |
| completed | 登录/待处理来电/重复启动守卫、媒体 owner 创建、stale dispose、失败透传和 start 后状态/订阅/route 提交进入唯一 Hook |
| structure | `WebIMCallProvider.tsx 365 -> 321`；Hook 115 行、唯一生产消费者；Provider 无 `createWebIMOutgoingCall`；无 compat/orphan/test-only path；21 行超限登记下一 guarded split |
| browser | 纯生命周期 relocation 未重跑视觉；HTTP 200；DOM/CSS/route contract/operation 不变；真实双账号呼出与浏览器矩阵继续 gated |
| verification | focused 4/11；H5 full 177/571；SDK Web 101/426；Web/H5 typecheck；466 assets；1240-module build；`npm run verify`；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.49 Remote Terminal Lifecycle Owner Split

| field | value |
| :--- | :--- |
| owner chain | `WebIMCallProvider error/active-owner composition -> useWebIMCallRemoteTerminal current-call terminal lifecycle -> SDK active call owner -> tone/dispose/router replace` |
| completed | 当前 callID 匹配、六类终态白名单和 `handleRemoteTerminal -> hangup tone -> dispose -> replace` 顺序进入唯一 Hook；既有失败提示语义不变 |
| structure | `WebIMCallProvider.tsx 386 -> 365`；Hook 72 行；无 incoming/media 创建、Gateway、SQLite、compat/orphan/test-only path 或第二 call runtime；Provider >300 行继续登记 guarded debt |
| browser | 纯 effect relocation 未重跑视觉；HTTP 200；DOM/CSS/route/operation 不变；真实双账号终态、list-back 与浏览器矩阵继续 gated |
| verification | focused 4/10；H5 full 177/570；SDK Web 101/426；Web/H5 typecheck；466 assets；1239-module build；`npm run verify`；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.48 Call Context Contract Owner Split

| field | value |
| :--- | :--- |
| owner chain | `runtime/index facade -> WebIMCallContext types/context/hook -> WebIMCallProvider answer/outgoing/media/terminal lifecycle -> SDK Web call/media owners` |
| completed | 公共 view、启动参数、活动快照、Context value、Context 实例与消费 Hook 独立；CallDetailPage 移除 Provider 深层 import |
| structure | `WebIMCallProvider.tsx 423 -> 386`；Context 46 行；无 Gateway/SQLite/LiveKit 创建、compat、orphan、test-only production path 或第二 lifecycle；Provider >300 行登记后续 guarded debt |
| browser | 纯 Context/type/import relocation 未重跑视觉；HTTP 200；DOM/CSS/route/operation 不变；真实双账号 RTC 与浏览器矩阵继续 gated |
| verification | focused 3/7；H5 full 176/567；SDK Web 101/426；Web/H5 typecheck；466 assets；1238-module build；`npm run verify`；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.47 Incoming Call Presentation Owner Split

| field | value |
| :--- | :--- |
| owner chain | `WebIMCallProvider answer/reject/media/terminal lifecycle -> useWebIMIncomingCallPresentation profile/mode/tone lifecycle -> IncomingCallOverlay` |
| completed | 抽离 peer profile 补齐、banner/fullscreen/floating 初始形态、循环铃声、挂断音、autoplay 恢复、前台 pending refresh 和 tone cleanup；正式通话 owner 与 Router 提交保持原位 |
| structure | `WebIMCallProvider.tsx 488 -> 423`；Hook 179 行、唯一生产消费者；无媒体创建、Gateway、SQLite、navigate、compat/orphan/test-only path 或第二 call runtime |
| browser | 纯状态/effect relocation 未重跑浏览器；Overlay DOM/CSS 不变；真实双账号、后台、多 tab、权限、弱网与跨浏览器继续 gated |
| verification | focused 3/8；H5 full 175/564；SDK Web 101/426；Web typecheck；466 assets；1237-module build；`npm run verify`；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.46 App Route Owner Split

| field | value |
| :--- | :--- |
| owner chain | `App global providers -> AppRouteTree unique Routes/wildcard -> core/chat route ledgers -> existing pages` |
| completed | 根组件只保留 Toast、BrowserRouter、runtime、offline、call 与 onboarding provider；通用域和聊天域分别持有原有路径、lazy import 与 fallback |
| structure | `App.tsx 475 -> 26`；route tree 16、core 133、chat 91 行；唯一 Routes/wildcard；无 compat/orphan/test-only production path 或 transport owner |
| browser | 纯 JSX/import relocation 未重跑浏览器；DOM/CSS/URL/provider 顺序和 operation 均未改变，生产构建完成 React Router 解析门禁 |
| verification | focused 9/31；H5 full 174/562；Web typecheck；1236-module build；`npm run verify`；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.45 Chat Settings Data Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ChatSettingsPage interaction/router/mutations -> useChatSettingsData -> existing conversations/groups/groupMembers facades` |
| completed | 抽离会话、群资料和成员 cache-first 读取、完整同步、请求代次与局部快照替换；页面继续持有 Router、toast、清空和群生命周期危险操作 |
| structure | `ChatSettingsPage.tsx 343 -> 292`；Hook 139 行、唯一生产消费者；无 compat/orphan/test-only path 或第二 cache owner |
| browser | 纯数据 effect relocation 未重跑浏览器；DOM/CSS/route/operation 均未改变，真实 mutation、自然数据和跨浏览器/设备矩阵继续 gated |
| verification | focused 4/19；chat 83/276；H5 full 173/559；SDK Web 101/426；typecheck；`npm run verify`；1233-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.44 Contact Profile Surface Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ContactProfilePage runtime/state/router/dialog/actions -> ContactProfileSurface presentation -> existing shared profile components` |
| completed | 抽离资料 Header、hero、快捷动作、主动作和资料卡片；页面继续持有 runtime、资料恢复、presence、群上下文、Router、弹窗状态与 action hook |
| structure | `ContactProfilePage.tsx 344 -> 224`；Surface 205 行、唯一生产消费者；旧内联正文删除，无 compat/orphan/test-only path 或第二 runtime owner |
| browser | 纯 JSX/资源/回调 relocation 未重跑浏览器且弹窗 DOM 层级保持；自然资料数据、mutation、RTC 和跨浏览器/设备矩阵继续 gated |
| verification | focused 4/10；contacts 27/91；H5 full 172/556；SDK Web 101/426；typecheck；`npm run verify`；1232-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.43 Chat Voice Recorder Platform Owner Split

| field | value |
| :--- | :--- |
| owner chain | `useChatVoiceRecorder -> chat-voice-recorder session lifecycle -> chat-voice-recorder-platform + chat-voice-level-reader` |
| completed | 抽离 getUserMedia、MediaRecorder 构造、MIME negotiation、扩展名和 track cleanup；start/stop/cancel/error 与 exactly-once terminal 保持 recorder owner |
| structure | `chat-voice-recorder.ts 314 -> 224`；platform owner 103 行、唯一生产消费者；旧内联实现删除，无 re-export/compat/orphan/test-only path 或第二 recorder |
| browser | 纯 adapter/type relocation 未重跑浏览器；真实 trusted hold、权限、录音、上传、发送和 Safari/Firefox/设备矩阵继续 gated |
| verification | focused 3/8；chat 82/273；H5 full 171/554；typecheck；`npm run verify`；production build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.42 Conversation Preview Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ConversationRow/archive -> conversation-preview-view -> shared draft/mention/system-message projection` |
| completed | 抽离草稿优先、消息类型摘要、静音 mention、群发送者前缀和未知类型 fallback；标题、未读、循环定位、badge 与时间保持 list metadata owner |
| structure | `conversation-list-view.ts 353 -> 96`；preview owner 263 行、两个生产消费者；旧内联实现删除，无 re-export/compat/orphan/test-only path 或第二 parser |
| browser | 纯 projection/import relocation 未重跑浏览器；5176 route HTTP 200；自然 preview 数据、跨浏览器和实体设备验收继续 gated |
| verification | focused 4/21；conversations 15/47；H5 full 170/552；SDK Web 101/426；typecheck；466 assets；1231-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.41 Chat Message View Primitives Owner Split

| field | value |
| :--- | :--- |
| owner chain | `getChatMessageView unique dispatcher -> chat-message-view-primitives safe narrowing/formatting -> existing shared parsers` |
| completed | 抽离 unknown payload 收窄、字符串/数值读取、媒体尺寸、时长/大小/短时钟格式化；contentType 分发与 shared parser 消费保持原 owner |
| structure | `chat-message-view.ts 370 -> 294`；primitive 87 行、唯一生产消费者；旧内联实现删除，无 compat/orphan/test-only production path 或第二 parser |
| browser | 纯函数 relocation 与兼容重导出未重跑浏览器；自然 uncommon payload、跨浏览器和实体设备验收继续 gated |
| verification | focused 3/19；chat 81/271；H5 full 169/550；SDK Web 101/426；typecheck；466 assets；1230-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.40 Chat Bubble Chrome Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ChatMessageBubble orchestration -> ChatMessageBubbleChrome presentation -> shared canRetryWebIMMessage + RN assets` |
| completed | 抽离 sending/pending/failed 状态、可重试按钮和双方向气泡尾角；消息内容、动作、分组和页面 retry action 保持原 owner |
| structure | `ChatMessageBubble.tsx 339 -> 278`；新组件 78 行、唯一生产消费者；旧内联实现删除，无 compat/orphan/test-only production path |
| browser | 纯 JSX/asset import relocation 未重跑浏览器；真实 failed/retry、跨浏览器和实体设备验收继续 gated |
| verification | focused 3/13；chat 80/267；H5 full 168/546；SDK Web 101/426；typecheck；466 assets；1229-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.39 Pending Forward Recovery Owner Split

| field | value |
| :--- | :--- |
| owner chain | `useChatForwardFlow selection/target/send -> useChatPendingForward -> existing WebIMSync cache + sender-name projection` |
| completed | 抽离来源消息精确回读、来源会话/群成员名称增强、异步代次和失效回调；多选、目标路由、最终发送与 Router 清理仍在原 owner |
| structure | `useChatForwardFlow.ts 353 -> 286`；Hook 101 行、唯一生产消费者；类型消费者直连新 owner；旧 re-export 删除，无 compat/orphan/test-only production path |
| browser | 纯 effect/type relocation 未重跑浏览器；真实转发 result/list-back、跨浏览器和实体设备验收继续 gated |
| verification | focused 5/19 + final 2/6；chat 79/262；H5 full 167/541；SDK Web 101/426；typecheck；466 assets；1228-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.38 Chat Composer Submission Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ChatComposer state/view -> useChatComposerSubmission -> SDK submission plan + existing page actions` |
| completed | 抽离转发、编辑、组合媒体、引用、提及与普通文本提交顺序；草稿、附件、面板、mention 和视图保持现有 owner |
| structure | `ChatComposer.tsx 353 -> 267`；Hook 194 行、唯一生产消费者；旧内联分支删除，无 compat/orphan/test-only production path |
| browser | 纯编排 relocation 未重跑浏览器；自然 operation result、跨浏览器和实体设备验收继续 gated |
| verification | chat-domain 78/260；H5 full 166/539；SDK Web 101/426；typecheck；466 assets；1227-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.37 Chat Page Surface Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ChatPage Router/runtime/hooks -> ChatPageSurface presentation -> existing component/action owners` |
| completed | 抽离 Header、公告、消息列表、Composer 与四类弹层 JSX；所有 cache/send/forward/delete/call/navigation owner 保持不变 |
| structure | `ChatPage.tsx 399 -> 255`；Surface 247 行、唯一生产消费者；页面无列表/Composer/target modal JSX，Surface 无 state/effect/runtime/Gateway |
| browser | 纯 JSX relocation 未重跑浏览器；自然数据像素、operation 和跨浏览器验收继续 gated |
| verification | focused 8/26；H5 full 165/537；SDK Web 101/426；typecheck；466 assets；1226-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.36 Chat Text Presentation Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ChatMessageContent dispatcher -> ChatTextMessageContent presentation -> existing quote/entity/page actions` |
| completed | 抽离引用/普通文本/系统/不支持消息 JSX；引用解析、实体 renderer 和页面动作保持原 owner |
| structure | `ChatMessageContent.tsx 98 -> 60`；新组件 93 行、唯一生产消费者；无 mapper/quote resolver/WebIMSync/Gateway |
| browser | 纯 JSX relocation 未重跑浏览器；自然 quote/deleted-source 像素与跨浏览器 operation 继续 gated |
| verification | focused 6/21；H5 full 165/536；SDK Web 101/426；typecheck；466 assets；1225-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.35 Chat Media Presentation Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ChatMessageContent dispatcher -> ChatMediaMessageContent presentation -> ChatMediaInteractionProvider/page action` |
| completed | 抽离通话/图片/视频/语音/文件 JSX；URL、尺寸、预览/播放状态和页面动作保持原 owner |
| structure | `ChatMessageContent.tsx 272 -> 98`；新组件 232 行、唯一生产消费者；无 Router/WebIMSync/`new Audio` |
| browser | 沿用 `.149.15` 真实 5 秒语音播放终态；图片/视频/文件自然数据及跨浏览器操作继续 gated |
| verification | focused 6/19；H5 full 164/531；SDK Web 101/426；typecheck；466 assets；1224-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.34 Chat Card Presentation Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ChatMessageContent kind dispatcher -> ChatCardMessageContent pure presentation -> existing page card action` |
| completed | 抽离用户/群名片 JSX、头像 fallback、目标禁用和可访问名称；消息投影与页面动作保持原 owner |
| structure | `ChatMessageContent.tsx 307 -> 272`；新组件 41 行、唯一生产消费者；无 Router/WebIMSync/SDK runtime |
| browser | 沿用 `.149.18` 真实已加入群名片直达 canonical 群会话证据；本片未执行申请、发送或验证码 operation |
| verification | focused 3/7；H5 full 163/527；SDK Web 101/426；typecheck；466 assets；1223-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass` |

## Closed Slice W6.a6.20.149.33 Group Members Page State Owner Split

| field | value |
| :--- | :--- |
| owner chain | `GroupMembersPage route/gesture/index/presentation -> useGroupMembersPageState -> existing WebIMSync/group-members-view/presence owners` |
| completed | 抽离群会话解析、cache-first 群/成员同步、请求代次、搜索投影与 presence observation；auth route、下拉手势、索引 DOM 和 presentation 留在页面 |
| structure | `GroupMembersPage.tsx 312 -> 178`；新 Hook 186 行、唯一生产消费者；页面无 `getSync/groupMembers.sync/useObservedUserPresence` 直调 |
| browser | 新受控标签直达群成员 route 后由真实 auth guard 跳转 `/auth/phone`；未接管用户标签、提交验证码或执行群成员 mutation |
| verification | focused 3/9；H5 full 162/525；SDK Web 101/426；typecheck；466 assets；1222-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-login-gated` |

## Closed Slice W6.a6.20.149.32 Joined Groups Page State Owner Split

| field | value |
| :--- | :--- |
| owner chain | `JoinedGroupsPage auth/gesture/presentation -> useJoinedGroupsPageState -> existing WebIMSync/groupLifecycle/view owners` |
| completed | 抽离 cache-first、远端同步、群会话解析、长按动作与退群事务；auth guard、下拉手势和 presentation 留在页面 |
| structure | `JoinedGroupsPage.tsx 325 -> 138`；新 Hook 265 行、唯一生产消费者；页面无 groups/conversations/lifecycle/Toast 直调 |
| browser | 新受控标签直达 `/contacts/groups` 后由真实 auth guard 跳转手机号登录；零 console warning/error；未接管用户标签或执行群 mutation |
| verification | focused 4/20；H5 full 161/523；SDK Web 101/426；typecheck；466 assets；1221-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-login-gated` |

## Closed Slice W6.a6.20.149.31 Calls Page State Owner Split

| field | value |
| :--- | :--- |
| owner chain | `CallsPage chrome/presentation -> useCallsPageState -> existing WebIMCallSync/call-list-view owners` |
| completed | 抽离 cache-first 首屏、远端同步、dataVersion 重读、分页、筛选/搜索、全量选择和删除事务；全局 TabBar 联动、下拉手势与 presentation 留在页面 |
| structure | `CallsPage.tsx 355 -> 145`；新 Hook 285 行、唯一生产消费者；页面无 sync/listCached/delete/Toast 直调 |
| browser | 新受控标签直达 `/calls` 后由真实 auth guard 跳转手机号登录；未接管用户既有登录标签、未提交验证码或删除记录 |
| verification | focused 4/23；H5 full 160/521；SDK Web 101/426；typecheck；466 assets；1220-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-login-gated` |

## Closed Slice W6.a6.20.149.30 Contact Search State Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ContactSearchPage Router/presentation -> useContactSearchPageState -> existing WebIMSync/contact-search-view owners` |
| completed | 抽离本地好友/群/会话快照、服务器双 Tab、请求代次和群会话打开；受控 Router state 与 presentation 留在页面 |
| structure | `ContactSearchPage.tsx 384 -> 208`；新 Hook 241 行、唯一生产消费者；页面无 search/cache/openGroup 直调 |
| browser | 临时标签正常进入登录门禁；固定验证码提交被既有预览标签 sql.js 单实例锁拒绝；未关闭用户标签或执行搜索/open/apply mutation |
| verification | focused 7/31；H5 full 159/519；SDK Web 101/426；typecheck；466 assets；1219-module build；diff check；P0/P1 zero |
| protected | SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-login-gated` |

## Closed Slice W6.a6.20.149.29 Create Group State Owner Split

| field | value |
| :--- | :--- |
| owner chain | `CreateGroupPage presentation/navigation -> useCreateGroupPageState -> existing WebIMSync/create-group-view owners` |
| completed | 抽离好友 cache-first、固定对端校验、成员选择和创建事务；路由、手势与 presentation 留在页面 |
| structure | `CreateGroupPage.tsx 388 -> 187`；新 Hook 283 行、唯一生产消费者；页面无 contacts/conversations/groups/Toast 直调 |
| browser | 已登录真实页加载 2 位好友；单选禁用，全选启用且显示 2 位；恢复选择后零 error；未提交创建 |
| verification | focused 4/27；H5 full 158/517；SDK Web 101/426；typecheck；466 assets；1218-module build；diff check；P0/P1 zero |
| protected | SDK source/generated clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.28 Conversation Search State Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ConversationSearchPage presentation/navigation -> useConversationSearchState -> existing WebIMSync cache facade/conversation-home-search projection` |
| completed | 抽离四 cache 聚合、异步竞态、消息分页、分区展开和本地历史；路由、手势与结果 presentation 留在页面 |
| structure | `ConversationSearchPage.tsx 376 -> 203`；新 Hook 271 行、唯一生产消费者；页面无 cache/history/race 直调 |
| browser | 已登录真实链以既有历史 `123` 搜索：2 个会话、3 条缓存消息，结果进入正确目标聊天；未远端搜索或 mutation |
| verification | focused 2/8；H5 full 157/514；SDK Web 101/426；root typecheck；466 assets；1217-module build；diff check；P0/P1 zero |
| protected | 仅执行允许的 SDK `build:web/sync:web` 且 SDK source clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.27 Conversations Page State Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ConversationsPage presentation/navigation -> useConversationsPageState -> existing WebIMSync/useConversationPresence owners` |
| completed | 抽离普通/归档 cache-first 读取、realtime 重读、下拉同步和 presence 刷新；展示、路由、未读滚动及 mutation action owner 留在页面 |
| structure | `ConversationsPage.tsx 398 -> 279`；新 Hook 152 行、唯一生产消费者；页面无 `listCachedItems/syncArchived` 直调 |
| browser | 已登录从通讯录切换消息 Tab：4 条真实会话、单聊在线、好友备注、群摘要和 Tabbar 正常；未执行 mutation |
| verification | focused 4/4；H5 full 156/513；Web typecheck；466 assets；1216-module build；diff check；P0/P1 zero |
| protected | 仅执行允许的 SDK `build:web/sync:web` 且 SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.25 Contact Profile Action Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ContactProfilePage read/presentation facts -> useContactProfileActions -> existing shared/runtime/platform owners` |
| completed | 抽离打开会话、复制 ID、通话、星标、备注、黑名单和删除好友编排；读取、presence、群上下文与弹层展示留在页面 |
| structure | `ContactProfilePage.tsx 467 -> 344`；新 Hook 208 行、唯一生产消费者，页面不再直调联系人 mutation、通话启动或 clipboard |
| browser | 382x786 真实好友资料 cold reload：备注名/离线状态、快捷入口、更多操作和备注编辑层正常；382/382；零 warning/error；未执行 mutation |
| verification | focused 4/21；H5 full 154/510；Web typecheck；466 assets；1214-module build；diff check |
| protected | 仅执行允许的 SDK `build:web/sync:web` 且 SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.26 Contacts Page Action Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ContactsPage list facts -> useContactsPageActions -> existing shared/runtime/router owners` |
| completed | 抽离长按菜单、打开会话、分享名片、通话和删除好友编排；列表 cache-first 读取、刷新、分组索引与展示留在页面 |
| structure | `ContactsPage.tsx 406 -> 290`；新 Hook 200 行、唯一生产消费者，页面不再直调联系人删除、会话创建或通话启动 |
| browser | 382x786 真实通讯录：2 联系人、备注名、搜索/验证/群聊入口、索引栏与 Tabbar 正常；未执行 mutation |
| verification | focused 3/7；H5 full 155/512；Web typecheck；466 assets；1215-module build；diff check |
| protected | 仅执行允许的 SDK `build:web/sync:web` 且 SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.24 Chat Page Action Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ChatPage runtime/cache facts -> message/transient/composer/header hooks -> existing shared/runtime/presentation owners` |
| completed | 抽离消息 busy/错误/cache 回读、名片/通话弹层、草稿/提及和头部投影；发送/RTC/SQLite/Gateway 语义不移动 |
| structure | `ChatPage.tsx 514 -> 399`；4 个页面 owner 均低于 300 行，内部 action 函数低于 50 行；cache owner 删除 UI `onReset` 反向依赖 |
| browser | 382x786 真实群/单聊：在线状态、群主气泡、名片单选、通话类型、消息与 Composer 正常；382/382；cold reload 后零新增 warning/error；未发送/呼出 |
| verification | focused 4/11；H5 full 153/508；Web typecheck；466 assets；1213-module build；diff check |
| protected | 仅执行允许的 SDK `build:web/sync:web` 且 SDK clean；RN 仅用户既有 appVersion 修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.23 Chat Page Navigation Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ChatPage runtime facts -> useChatPageNavigationActions -> existing React Router routes/shared group facade` |
| completed | 抽离资料、群申请、公告、名片、引用定位、好友申请和表情管理动作；发送/cache/RTC/录音 owner 不移动 |
| structure | `ChatPage.tsx 595 -> 514`；新 Hook 156 行、唯一生产消费者、无第二 route owner或 compat wrapper |
| browser | 382x786 真实群聊进入群资料并返回；群名、2 人在线、消息与 Composer 恢复；两个 route 382/382、零 warning/error；未执行 mutation |
| verification | focused 4/10；H5 full 152/505；typecheck；1209-module build；diff check |
| protected | SDK source/generated 零改动；RN 仅用户既有 appVersion 修改；未运行 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.22 Chat Composer Input Row Split

| field | value |
| :--- | :--- |
| owner chain | `ChatComposer submit/draft/panel orchestration -> ChatComposerInputRow pure presentation -> existing ChatVoiceInput/text/emoji/action controls` |
| completed | 抽离唯一输入行表单；submit、转发、提及、附件、面板状态和 availability owner 不移动 |
| structure | `ChatComposer.tsx 419 -> 353`；新输入行 138 行、唯一生产消费者、唯一 `rn-chat-composer` form，无 compat wrapper |
| browser | 382x786 真实群聊输入聚焦无默认边框；表情/功能面板切换与相册/文件/名片可见；收起后 382/382；未输入、发送或 mutation |
| verification | focused 4/14；H5 full 152/505；typecheck；1208-module build；diff check |
| protected | SDK source/generated 零改动；RN 仅用户既有 appVersion 修改；未运行 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.21 Chat Page Cache Owner Split

| field | value |
| :--- | :--- |
| owner chain | `ChatPage route/runtime facts -> useChatPageCacheState -> conversations/messages cache facade -> existing presentation` |
| completed | 抽离首屏恢复、实时缓存重读、搜索消息定位与窗口维护；ChatPage 保留全部 mutation 和 UI 编排 |
| structure | `ChatPage.tsx 698 -> 595`；新 hook 159 行、唯一生产消费者、无第二业务 owner或 compat wrapper |
| browser | 382x786 真实群聊恢复、在线状态、群主备注/标签、气泡和唯一 Composer 只读通过；未发送或 mutation |
| verification | focused 73/245；H5 full 152/505；typecheck；1207-module build；diff check |
| protected | SDK source/generated 零改动；RN 仅用户既有 appVersion 修改；未运行 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web` |
| status | `completed-local/structural-pass/browser-readonly-pass` |

## Closed Slice W6.a6.20.149.19 Unified Forward Composer

| field | value |
| :--- | :--- |
| owner chain | `ChatForwardComposer selection/preview -> ChatComposer input/submit -> useChatForwardFlow -> shared messages.forward` |
| completed | 删除转发组件独立 textarea/form/send；转发条置于唯一 ChatComposer 顶部；空留言可发送，成功后清空复用 draft |
| browser | 真实群聊确认唯一 textarea 与普通 Composer 控件未回归；未伪造长按、未点击发送 |
| verification | focused 3/12；H5 TypeScript；build:web/sync:web；1205-module production build；diff check |
| protected | SDK source 与 RN protected business source零改动；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed/structural-pass/forward-runtime-gated` |

## Closed Slice W6.a6.20.149.18 Recorder HUD And Group Card

| field | value |
| :--- | :--- |
| owner chain | `ChatVoiceInput -> useChatVoiceRecorder -> chat-voice-recorder Web Audio/MediaRecorder`；`type108 view -> ChatPage -> groups.sync -> conversations.openGroup` |
| completed | 真实 RMS 驱动 RN 六格录音 HUD；取消态/尺寸对齐；群名片 force-refresh 后已加入直达群会话，未加入使用受控 card apply state |
| browser | 真实已加入群卡片从单聊直接进入目标群会话并展示 2 人在线；未执行录音、上传、发送或申请 mutation |
| verification | focused 3/11；H5 TypeScript；SDK Web 101/426；build:web/sync:web；1205-module build；diff check |
| protected | SDK source 与 RN protected business source零改动；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed/card-browser-pass/physical-record-gated` |

## Closed Slice W6.a6.20.149.17 Outgoing Voice Direction

| field | value |
| :--- | :--- |
| owner chain | `ChatMessageBubble is-outgoing -> ChatMessageContent audio -> CSS presentation`; playback remains in `ChatMediaInteractionProvider` |
| completed | 发送方时长在左、声波图标在右并旋转 180°；接收方布局、未读点和播放状态不变 |
| verification | H5 typecheck、1204-module production build；382×786 authenticated screenshot；computed `row-reverse + matrix(-1,0,0,-1,0,0)` |
| protected | SDK source 与 RN protected business source 零改动；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| status | `completed/browser-pass` |

## Closed Slice W6.a6.20.148.2 H5 Offline Shell

| field | value |
| :--- | :--- |
| source anchor | H5 runtime provider、auth route guard、conversation/chat data owners、global shell |
| deliverable | offline banner、cached conversations/chat history、retry/sign-out；composer/actions/presence/call/remote tabs unavailable |
| guardrail | pages consume runtime `getOfflineReader()` only；no direct sessionStorage/IndexedDB/token、no duplicate SQL/query owner |
| verification | focused H5 tests + typecheck/build/full verify + isolated responsive route smoke |
| protected | no RN business source；no build:rn/build:desktop/build:all/`build:package:desktop:web` |
| verification | H5 focused 1/4 + full 142/457；typecheck/build/full verify；independent cold-reload smoke |
| status | `done-local/browser-accepted-with-.148.3` |

## Latest Closed Slice W6.a6.20.148.1c Runtime Offline Restore And Reconnect

| field | value |
| :--- | :--- |
| delivered | network-only cold restore、runtime reader gate、offline capability rejection、single-flight reconnect、invalid cleanup and stale-result revocation |
| non-exposure | H5 provider/pages unchanged；no user-visible offline claim |
| verification | focused 4/17；Web full 101/424；H5 typecheck/build；build:web/sync:web；RN protected diff empty |
| verdict | `clean/runtime-safe/not-h5-consumed` |

## Closed Slice W6.a6.20.148.1b Existing-Snapshot Storage And Reader

| field | value |
| :--- | :--- |
| delivered | no-create IndexedDB probe、read-only lifecycle/Worker/sql.js mode、minimal reader and shared cache query extraction |
| non-exposure | production restore/reconnect/getSync and H5 consumers unchanged |
| verification | focused 7/35；Web full 100/419；H5 typecheck/build；build:web/sync:web；RN protected diff empty |
| verdict | `clean/storage-reader-safe/not-consumed` |

## Latest Closed Slice W6.a6.20.148.1a Transport Classification And Lifecycle

| field | value |
| :--- | :--- |
| delivered | strict browser transport error normalization + guarded offline lifecycle transitions |
| non-exposure | production restore/storage/sync/H5 consumers unchanged；no usable offline runtime claimed |
| verification | SDK 2 files/10 tests；H5 typecheck/build；build:web/sync:web；RN protected diff empty |
| verdict | `clean/foundation-complete/not-consumed` |

## Closed Slice W6.a6.20.148.3 Isolated Cold-Reload Acceptance

| field | value |
| :--- | :--- |
| deliverable | isolated origin warm-up -> Gateway blocked reload -> cache list/chat -> failed retry -> valid reconnect；separate invalid-session cleanup harness |
| mutation | no send、mark-read、draft、profile/group/call/message/conversation write |
| real proof | account 2 warmed 4 conversations；proxy-down reload kept list and `H5-WS-1786686250693` history；failed retry retained reader；proxy restore returned online tabs |
| invalid proof | isolated `valid:false` + refresh failure returned `/auth/phone` and revoked offline identity |
| discovered defect | React StrictMode duplicate restore raced the DB owner；SDK restore single-flight fixed and covered by focused regression |
| status | `browser-pass-real/cleaned-up` |

## Current Activation Card W6.a6.20.147

| field | value |
| :--- | :--- |
| decision | `no-safe-auto-activation` |
| natural-data resume | pending friend/group、自然 admin/role bubble、bound account、non-missed/duration call、available/conversation-only group、非空 blacklist/media 等样本 |
| mutation resume | 指定 operation + disposable target + 明确服务器/SQLite 副作用授权 |
| environment resume | RTC deployment/credential、Safari/Firefox、实体设备或 physical-touch 会话 |
| design resume | cold-start offline 等需新增实现的条目另建 contract/slice |
| anti-loop | 外部状态未变化时不新增同类 audit 编号，不重跑三账号空态 |
| protected | 不改 frozen RN business；Web defect 才进入 shared SDK 且仅允许 `build:web/sync:web` |
| status | `superseded-by-explicit-local-design-authorization/.148` |

## Latest Audited Slice W6.a6.20.146

| field | value |
| :--- | :--- |
| goal | 跨第二/第三授权账号审计 bound reset、通话记录和 available/conversation-only 群候选样本 |
| security proof | 两账号均 `account=''`，安全总览进入首次设置语义，不存在 reset form |
| calls proof | 两账号 `/calls` 均为空，无 non-missed/duration row |
| group proof | 关键词 `62/群` 服务端群搜索为空；第三账号 2 group conversations 与 2 joined groups 相同 |
| dedupe | 普通成员 manage deep-link replace 已由 `.107` 验收，本片不重复记为新通过 |
| anti-shortcut | 不输入 credential、不编辑 call、不申请群、不打开 unread chat、不注入 fixture |
| protection | runtime code 零修改；未运行 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web` |
| verdict | `audited/blocked-natural-data/runtime-clean` |

## Latest Audited Slice W6.a6.20.145

| field | value |
| :--- | :--- |
| goal | 用三个已授权测试账号重新审计 pending 申请与已读 owner/admin 消息自然样本，消除重复尝试 |
| friend proof | 账号 1/2/3 分别为 3/3/2 条申请，全部 accepted；无 pending action |
| group proof | 三账号群验证均为空；账号 2 是真实 owner，账号 3 能看到其群摘要 |
| bubble proof | unread=0 群聊仅 system/self 消息；账号 3 的他人 owner message 会话 unread=2，未打开 |
| anti-shortcut | 不用摘要替代 role badge，不用空态替代 pending，不注入 fixture，不接受/拒绝或 mark-read |
| protection | runtime code 零修改；未运行 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web` |
| verdict | `audited/blocked-natural-data/runtime-clean` |

## Latest Accepted Slice W6.a6.20.144

| field | value |
| :--- | :--- |
| goal | 关闭 `.143` 真实备注标题与首页加号的窄屏 light、桌面 dark 响应式 gate |
| mobile proof | authenticated `320x786`；`donk二大爷备注名` 与时间/未读无重叠；document=`320/320` |
| desktop proof | authenticated `760x900` dark；surface/text token 正确；标题/时间无重叠；document=`760/760` |
| geometry | 两个 viewport 均保持 trigger=`40x40`、glyph/pseudo=`14x2` |
| media audit | 旧媒体 route 缺当前账号 open database snapshot；未注入 URL、未 playback，继续 natural-data-gated |
| anti-shortcut | 不打开 unread chat、不 mark-read、不执行 Gateway/SQLite mutation；当前真实长度不外推任意超长备注 |
| protection | 无 runtime source edit；light、`412x786` 与 `/conversations` 已恢复；RN/SDK source 不改 |

## Latest Accepted Slice W6.a6.20.143

| field | value |
| :--- | :--- |
| goal | 修复单聊会话备注名缺失和首页加号过大两项 RN parity defect |
| owner | SDK `listCachedItems + resolveFriendshipDisplayProfile` 持有备注投影；H5 CSS 持有 glyph 尺寸 |
| behavior | 已确认 friend remark 覆盖单聊展示 snapshot name；SQLite conversation/name 不改；群标题不受影响 |
| browser | 真实首行=`donk二大爷备注名`、群摘要备注正确；40x40 target、14x2 glyph/pseudo、412/412、warning/error=0 |
| verification | SDK 3 files/23 tests；H5 3 files/17 tests；Web typecheck；build:web/sync:web |
| protection | RN source clean；未运行/同步 RN/Desktop/all；未修改/执行 `build:package:desktop:web` |
| residual | remark realtime refresh、长备注截断、Safari/Firefox、physical device |

## Latest Accepted Slice W6.a6.20.142

| field | value |
| :--- | :--- |
| goal | 关闭聊天附件名片选择器真实群目标、单选替换、取消返回自然数据 gate |
| RN proof | frozen RN 为好友/群聊 single-select；选择和最终发送分属两阶段 |
| real proof | 无未读单聊 `donk三大爷`；好友过滤后 1 项，群聊 Tab 2 个真实群 |
| selection proof | 首群 selected=1/CTA enabled；选择第二群后前项清除且 selected 仍为 1 |
| layout/route | `412x786`、document=`412/412`；关闭回原单聊，composer 保持 |
| verification | H5 4 files/10 tests；Web typecheck；临时 5178 dev-pc smoke |
| anti-shortcut | 不点击 CTA，不发送 type108，不制造 success/failed/realtime/list-back |
| protection | 结束恢复 default viewport、关闭隔离 tab/临时 server；RN/SDK source 不改；未运行 RN/Desktop/all/`build:package:desktop:web` |
| residual | final send/failure retry/realtime/list-back、search/long-name、Safari/Firefox、physical touch/device |

## Latest Accepted Slice W6.a6.20.141

| field | value |
| :--- | :--- |
| goal | 关闭 `.18.3.19` 群二维码分享中真实群目标、ALL、多选保留和取消返回自然数据 gate |
| RN proof | `cardShare` 以 `selectedKeys` 多选好友/群聊；旧 SSOT“单选”已纠正，不改 RN source |
| real proof | share source=`donk的群聊 / 97524759106`；target facade=2 好友+2 群聊 |
| selection proof | 群聊 ALL=2；切好友仍 selected=2；好友 ALL 后 selected=4、CTA enabled |
| layout/route | `412x786`、sheet=`380x754@16`、document=`412/412`；关闭 replace 回原群二维码 |
| verification | H5 4 files/10 tests；Web typecheck；HTTP 200；warning/error=0；diff check green |
| anti-shortcut | 不点击 CTA，不生成/上传 PNG，不 batch-send，不制造 partial/success/list-back |
| protection | 恢复 default viewport 并关闭隔离 tab；RN protected diff 与 SDK source diff 为空；未运行 SDK/RN/Desktop/all/`build:package:desktop:web` |
| residual | final send/partial result/realtime/list-back、50-target、desktop/dark、Safari/Firefox、physical touch/device |

## Latest Accepted Slice W6.a6.20.140

| field | value |
| :--- | :--- |
| goal | 关闭真实群二维码 desktop dark、主题 token 分层、二维码白底和宽屏居中 residual |
| real proof | `donk的群聊 / 97524759106`；同一 canonical conversation；二维码 ready、无错误 |
| layout proof | `760x900`；surface=`480x900@140`、card=`448x368@156`、Canvas=`268x268`、document=`760/760` |
| theme proof | page/surface=`rgb(17,19,24)`、card=`rgb(27,29,36)`、text=`rgb(245,245,247)`、QR box=`rgb(255,255,255)` |
| route proof | 暗色返回精确进入同一群资料，identity 与二维码入口一致 |
| verification | H5 4 files/9 tests；Web typecheck；HTTP 200；warning/error=0；diff check green |
| anti-shortcut | 不注入主题/群资料，不点击下载/分享/扫一扫，不执行上传、发送、申请或群 mutation |
| protection | 已恢复 light/default viewport 并关闭隔离 tab；RN protected diff 与 SDK source diff 为空；未运行 SDK/RN/Desktop/all/`build:package:desktop:web` |
| residual | actual download/Web Share/scan、应用内发送、Safari/Firefox、实体设备/physical touch |

## Latest Accepted Slice W6.a6.20.139

| field | value |
| :--- | :--- |
| goal | 用真实 joined group 关闭 `.18.3.18` 群二维码视觉、身份绑定和返回链 data gate |
| real proof | `donk的群聊 / 97524759106`；canonical conversation `019ff8b7-b24f-7e71-afe1-332d40294c00`；二维码可见且 ready |
| layout proof | `412x786`；Canvas CSS/bitmap=`268x268 / 472x472`；card=`380x368`；document=`412/412` |
| route proof | 返回精确进入同一 conversation 的群资料页，群名、群 ID 和二维码入口一致 |
| verification | H5 4 files/9 tests；Web typecheck；HTTP 200；warning/error=0；diff check green |
| anti-shortcut | 不注入群资料，不点击下载/分享/扫一扫，不执行上传、发送、申请或群 mutation |
| residual | dark/desktop 已由 `.140` 关闭；actual download/Web Share/scan、应用内发送、Safari/Firefox、实体设备 |
| protection | RN protected diff 与 SDK source diff 为空；未运行 SDK/RN/Desktop/all/`build:package:desktop:web` |

## Latest Accepted Slice W6.a6.20.138

| field | value |
| :--- | :--- |
| goal | 关闭统一群发目标选择器的真实桌面暗色、跨 Tab ALL、本地选择保留和取消返回 gate |
| real proof | `760x900` dark sheet=`720x868`；真实好友 2、群聊 2；好友 ALL 后 2、群聊 ALL 后累计 4 |
| route proof | CTA enabled 但未点击；关闭 replace 回 conversations，未进入 compose |
| verification | H5 4 files/10 tests；Web typecheck；HTTP 200；warning/error=0 |
| anti-shortcut | 不注入目标、不点击 CTA、不执行 broadcast/Gateway/SQLite mutation，不冒充 partial result |
| residual | real send/partial result/realtime/list-back、50 上限、Safari/Firefox、physical touch/device |
| protection | 已恢复 light/default viewport 并关闭隔离 tab；RN protected diff 为空；未运行 SDK/RN/Desktop/all/`build:package:desktop:web` |

## Latest Accepted Slice W6.a6.20.137

| field | value |
| :--- | :--- |
| goal | 关闭真实 owner 群管理页的 Chromium 移动/桌面暗色、响应式和群主转让返回链 gate |
| real proof | `412x786` 与 `760x900` 均显示完整 owner 项；page/card=`17/19/24 -> 27/29/36`、8px、无横向溢出 |
| route proof | 群主转让显示两位非本人候选；关闭返回同一管理页；未选择或确认 |
| verification | H5 4 files/15 tests；Web typecheck；SDK Web 98/408；HTTP 200；warning/error=0 |
| anti-shortcut | 不伪造 admin/member，不点击开关，不执行设置、转让、Gateway/SQLite mutation |
| residual | natural admin/non-empty admin、真实 setting/transfer、Safari/Firefox、实体设备 |
| protection | 已恢复 light/default viewport 并关闭隔离 tab；RN protected diff 为空；未运行 RN/Desktop/all/`build:package:desktop:web` |

## Latest Accepted Slice W6.a6.20.136

| field | value |
| :--- | :--- |
| goal | 对齐 RN 群管理 owner/admin/member 三角色下控制项可见、禁用和路由守卫语义 |
| owner proof | H5 presentation helper 只消费 shared `canManageAdmins/canTransferOwner`；页面 production caller 已接线，无 roleLevel/parser/transport/cache owner |
| owner proof runtime | 真实 owner 群所有原可操作入口保持 Link/enabled switch；无回归 |
| admin proof | focused test 锁定三 switch disabled、发言频率只读、群主转让“仅群主”；自然 admin 账号缺失，browser pixel gated |
| member proof | shared `canOpenGroupManage` 路由守卫保持；`.107` 已证明普通成员直达 replace |
| verification | H5 5 files/17 tests；Web typecheck；真实 owner DOM；source/owner/diff checks |
| anti-shortcut | 不伪造 admin snapshot，不点 switch/候选/确认，不执行设置、转让、Gateway/SQLite mutation |
| residual | natural admin pixel、真实 setting/transfer result、realtime/list-back、cross-browser/device |
| protection | SDK source/RN protected diff 为空；不运行 SDK build/sync 或 RN/Desktop/all 脚本 |

## Latest Accepted Slice W6.a6.20.135

| field | value |
| :--- | :--- |
| goal | 将 H5 群主管理入口“转让群主”纠正为 frozen RN `GroupManageScreen` 的“群主转让” |
| real proof | 真实 owner 群管理页显示“群主转让”；点击进入既有选择页，仍只列两位非本人候选，关闭后返回同管理页 |
| owner proof | 只改 `ManagementLink` label；permission、candidate view、SDK `groupManagement` facade、route URL 均不变 |
| verification | H5 4 files/13 tests；Web typecheck；真实 localhost 隔离账号 route/DOM/return evidence |
| anti-shortcut | 不选择候选、不打开确认、不执行 transfer/Gateway/SQLite mutation，不改 SDK 或 RN business |
| residual | 真实转让确认/result/realtime/list-back、mobile/dark/cross-browser/device |
| protection | RN protected source 与 SDK source diff 为空；不运行 SDK build/sync 或 RN/Desktop/all 脚本 |

## Latest Accepted Slice W6.a6.20.134

| field | value |
| :--- | :--- |
| goal | 关闭好友资料共同群 count、共同群列表与 canonical conversation open 的真实一致性 gate |
| real proof | `donk二大爷` 资料异步完成后 count=2；共同群页返回同一批 2 个真实三人群；无未读 `donk的群聊` 打开 canonical `019ff8b7...` |
| persistence proof | chat 显示群名、2 人在线与缓存系统消息；返回列表后 unread 4 -> 4，runtime online，412/412，零 warning/error |
| owner proof | Profile 与 CommonGroups 页面均消费 SDK `contacts.listCommonGroups`；分页、token、防重复和 cache upsert 只在 shared SDK |
| verification | SDK 1 file/13 tests；H5 3 files/16 tests；本片 source-edit audit、SDK source 与 RN protected diff checks |
| anti-shortcut | 等待异步数据稳定，不把首帧空 count 当最终事实；不进入 unread 群、不 refresh/mark-read/send，不执行关系或群 mutation |
| residual | cache-miss Gateway fallback、offline cold start、large pagination、physical touch、Safari/Firefox/实体设备 |
| protection | 本片仅改 docs，既有 H5 dirty source 原样保留；SDK source/RN protected diff 为空；未运行 SDK build/sync 或 RN/Desktop/all 脚本 |

## Latest Accepted Slice W6.a6.20.133

| field | value |
| :--- | :--- |
| goal | 关闭 Joined Groups 真实群行解析 canonical conversation、进入 chat 与 list-back persistence gate |
| real proof | 联系人 -> 我的群聊显示 2 个真实群；无未读 `donk的群聊` 打开 conversation `019ff8b7...`，显示群名、2 人在线和缓存系统消息 |
| persistence proof | 返回会话列表后目标群/preview 保留，总未读保持 4，runtime online，412/412，零 warning/error |
| owner proof | `JoinedGroupsPage -> conversations.openGroup -> openIMGroupConversation -> ConversationRepository`；页面未构造 conversation ID 或第二 cache owner |
| verification | SDK 1 file/4 tests；H5 3 files/9 tests；本片 source-edit audit、SDK source 与 RN protected diff checks |
| anti-shortcut | 不进入有未读群、不 refresh/mark-read/send，不执行长按、群生命周期、Gateway mutation、fixture 或 fake-success |
| residual | cache-miss Gateway fallback、offline cold start、large-group、physical touch、Safari/Firefox/实体设备与所有群 mutation |
| protection | 本片仅改 docs，既有 H5 dirty source 原样保留；SDK source/RN protected diff 为空；未运行 SDK build/sync 或 RN/Desktop/all 脚本 |

## Latest Audited Slice W6.a6.20.132

| field | value |
| :--- | :--- |
| goal | 用两个独立在线账号执行 production 语音通话入口，验证 start、incoming、reject、终态和通话记录链 |
| reached | caller 完成聊天附件 -> 音视频通话 -> 语音通话 -> `/calls/active`；两端 runtime 均保持 online |
| blocker | active route 立即显示“通话已结束 / 服务不可用”，receiver 无来电 overlay，双方通话列表为空；本次未创建持久化 call |
| static owner | `ChatPage -> WebIMCallProvider -> SDK call control -> Gateway call start -> Web media owner` 保持唯一链；reject 不创建媒体 |
| verification | SDK RTC 4 files/21 tests、H5 call UI 3 files/10 tests、diff boundary、端口与清理检查通过 |
| anti-shortcut | 不读取 token/storage、不伪造邀请/凭证/记录、不绕过权限、不用 retry loop 掩盖部署错误 |
| activation | 通话服务必须能创建真实 call 并下发凭证；随后重跑 caller invite -> receiver overlay -> reject -> caller terminal -> 双方 call list |
| protection | H5/SDK/RN production source 零改动；未运行任何 SDK build/sync 或 RN/Desktop/all 脚本 |

## Latest Accepted Slice W6.a6.20.131

| field | value |
| :--- | :--- |
| goal | 使用独立 origin 和仅测试会话可见的 Gateway proxy，证明在线预热后 SPA 路由重进仍从当前账号 SQLite 读取会话与消息 |
| real proof | `donk二大爷` 在线同步 4 个会话；关闭 proxy 后联系人 2 条、会话 4 条及 `H5-WS-1786686250693` 均保留，进入聊天仍显示同 marker |
| failure proof | 会话/聊天明确显示 `Failed to fetch`；整页 reload 返回手机号登录并显示同错误，证明现有 restore 不支持冷启动离线恢复 |
| owner proof | H5 只调用 `listCachedItems/getCachedHistory`；SDK `restore` 仍固定 `check-token -> open account DB -> recover -> realtime`，无第二 writer 或页面 token/cache 分支 |
| non-claim | 只关闭 authenticated hot-session cache-first；不声明离线登录、刷新/重启恢复、离线发送、媒体离线副本或 token 过期安全语义 |
| protection | 临时 proxy/dev server 与测试 tab 已停止；5176/共享 Gateway 未受影响；H5/SDK/RN production source 零改动 |
| next | 继续外部 gate；若推进 cold-start，先建立 auth/session/只读 DB/发送禁用/reconnect 的产品与安全 contract |

## Latest Accepted Slice W6.a6.20.130

| field | value |
| :--- | :--- |
| goal | 用两个独立认证 tab 验证 production text send -> Gateway -> WebSocket -> shared SQLite convergence -> H5 list/chat cache projection |
| real proof | `donk三大爷 -> donk二大爷` 发送唯一 marker；receiver 不刷新即出现 preview、`聊天(1)` 与 1 unread，进入聊天显示同 marker，返回后 preview 保留且 unread 清零 |
| owner proof | `createIMRealtimeMessageSync -> MessageRepository/ConversationRepository -> publishDataChange -> listCachedItems/getCachedHistory`；页面无 transport/SQL owner |
| verification | SDK realtime 2 files/6、H5 conversation/chat 2 files/15、route HTTP 200、双 tab 零 warning/error |
| non-claim | 已证明 realtime SQLite 写入触发和 cache consumer；未隔离网络，不能声明 offline/restart cache-hit |
| protection | production code、SDK generated、RN protected source 和 package scripts 零改动；禁跑脚本未执行 |
| next | `W3.real-gateway-offline-cache`：使用非破坏网络隔离或受控 Gateway failure，证明 IndexedDB/sql.js cache-first；不得停服影响其他用户 |

## Latest Audited Slice W6.a6.20.129

| field | value |
| :--- | :--- |
| goal | 按 RN 聊天气泡 production 分支重新审计 H5 消息类型矩阵，确认 `[暂不支持的消息]` 是否代表迁移遗漏 |
| result | RN/H5 专用气泡类型一致；type106/type108 已由现有生产 parser 覆盖；type109 在 RN 无专用气泡 owner，H5 fail-closed 属于对齐行为 |
| guardrail | 新增 mention、用户/群名片、位置 unsupported 三组 production parser 测试；未新增 runtime 分支 |
| verification | focused 1 file/14、H5 full 140 files/449 tests、Web typecheck、466 assets |
| protection | H5 production、SDK source/generated、RN protected source 零改动；未运行 SDK/RN/Desktop build/sync |
| next | 维持 external acceptance workset；下一项必须来自明确授权的真实 mutation/消息、RTC、offline、多浏览器/设备或自然数据，不制造本地占位实现 |

## Latest Closed Slice W6.a6.20.119

| field | value |
| :--- | :--- |
| goal | 补齐 RN 群管理“入群申请”行及群管理/联系人验证双来源返回语义 |
| proof | 真实群主管理页出现入群申请；进入 `/contacts/group-applications/97524759106` 后返回目标为原会话管理页；无来源 URL 回退 `/contacts/verifications/group` |
| ownership | 审核事实继续来自 `WebIMSync.groupApplications.list`；H5 helper 只统计目标群 `pending` 并校验受限 Router state |
| verification | focused 2/8、H5 full 137/435、typecheck、466 assets、production build、真实页面零 console error；RN protected diff empty |
| residual | 当前真实群无 pending；非零数量、admin/member 无权限行和真实审核 mutation 继续 natural-data/authorization gated |

## Latest Closed Slice W6.a6.20.120

| field | value |
| :--- | :--- |
| goal | 补齐 RN 群聊头部非零入群申请角标，并确保申请页返回原群聊 |
| proof | 纯渲染覆盖零隐藏、99+ 和单聊隐藏；真实 owner 群无 pending 时头部不误显，群聊设置保留，header `412/412` 且 clean log |
| ownership | 审核事实继续来自 shared `groupApplications.list`；`.119` 的目标群 pending helper 被群管理和聊天头部共同消费；Router state 只允许 chat/manage 两种来源 |
| verification | focused 4/13、H5 full 139/440、typecheck、466 assets、production build、RN protected diff empty |
| residual | 非零 pending 自然样本、角标点击实际返回、处理后刷新、双账号 realtime 和跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.121

| field | value |
| :--- | :--- |
| goal | 对齐 RN 聊天标题区点击资料入口，单聊进入对方资料、群聊进入群资料 |
| proof | 真实群聊进入群资料并直接返回原群聊；真实单聊进入 donk三大爷资料并返回原单聊 |
| ownership | 标题区只负责 React Router 导航；联系人/群资料继续调用既有 shared facade，不新增资料读取、DTO、Gateway 或 SQLite owner |
| verification | focused 3/9、H5 full 140/443、typecheck、466 assets、1188-module production build；真实 412px 双链路、412/412 与零 warning/error |
| residual | 浏览器 history state 刷新后按安全默认值返回群设置/通讯录；这属于既有 SPA 安全降级，不影响标题点击主链 |

## Latest Closed Slice W6.a6.20.122

| field | value |
| :--- | :--- |
| goal | 关闭本人资料总览与 nickname/gender/bio 三编辑 route 的 760×900 deep-dark 只读验收门 |
| proof | 真实 `donk / 未知 / 未设置`；page=`17/19/24`、card/textarea=`27/29/36`，四 route 均 760/760 且零 warning/error |
| anti-shortcut | 仅通过显示设置切换 dark/light；不编辑字段、不点击完成、不调用 update-profile，不把 HTTP 200 当作资料事实 |
| verification | focused 4 files/17 tests、Web typecheck、4 route HTTP 200、RN/SDK boundary/diff；浏览器结束前恢复 light |
| residual | changed-value Network/result、slow-saving pending、Safari/Firefox 与实体设备继续 gated |

## Latest Closed Slice W6.a6.20.123

| field | value |
| :--- | :--- |
| goal | 关闭账号安全总览、首次设置表单与账号状态 route guard 的 760×900 dark Chromium 门禁 |
| proof | root `+86 15555555551 / 未绑定 / 账号密码`；account/password/confirm 空表单；reset deep link 纠正到 account；page=`15/17/21`、card/form=`27/29/36`、input=`36/39/51` |
| anti-shortcut | 只通过显示设置切换 dark/light；不输入/提交凭据，不执行 set/reset/Gateway/SQLite/session cleanup；不把 route correction 当作 reset 成功 |
| verification | SDK 1 file/3 tests、H5 1 file/3 tests、Web typecheck、3 route HTTP 200、RN/SDK boundary/diff；760/760、零 warning/error，结束前恢复 light |
| residual | 已绑定账号 reset 自然表单、approved real set/reset Network/result/session cleanup、Safari/Firefox 与实体设备 |

## Latest Closed Slice W6.a6.20.124

| field | value |
| :--- | :--- |
| goal | 关闭现行统一转发目标弹窗的 760×900 light 桌面只读门禁，并清理旧独立转发页残余表述 |
| proof | 当前已读单聊右键消息进入原 URL 内 modal；好友/群聊跨 Tab 累计选中 2，群聊 ALL 后累计 3；modal=`720×868`、left=`20`、viewport/scrollWidth=`760/760` |
| anti-shortcut | 不点击最终“转发”，不构造旧 pending preview state，不执行 Gateway/SQLite/send/list-back；关闭后原聊天保持 2 条消息且零 warning/error |
| verification | focused 5 files/14 tests、Web typecheck、2 route HTTP 200、RN/SDK boundary/diff；运行时与 SDK/RN 零改动 |
| residual | 可控 real partial-result、Safari/Firefox、物理长按与实体设备；真实发送继续授权门 |

## Latest Closed Slice W6.a6.20.125

| field | value |
| :--- | :--- |
| goal | 关闭单聊文本搜索的 760×900 light/dark、稳定 messageID 和浏览器 history 门禁 |
| proof | 真实 `123` 命中 `61da9d1a-5ce3-4ce8-8d37-44d56939c104`；目标行精确恢复；back 返回 `/search?q=123&tab=all` 并自动恢复结果，forward 再次命中同一行 |
| change | H5 将已提交关键词/tab 持久化到 React Router query；history 返回时只经 `WebIMSync.messages.searchCached` 重读当前账号缓存 |
| safety | 不调用 Gateway/WebSocket/send/download/mutation，不改 SDK/RN；日期/媒体/文件索引不计入本片结论 |
| verification | focused 3 files/8 tests、Web typecheck（含 SDK build:web/sync:web）、2 route HTTP 200、RN/SDK boundary/diff；light/dark 均 760/760 且零 warning/error |
| residual | 日期/媒体/文件独立桌面/history/theme matrix、Safari/Firefox、动画活动帧和实体设备 |

## Latest Closed Slice W6.a6.20.126

| field | value |
| :--- | :--- |
| goal | 关闭日期、图片与视频、文件索引搜索的 760×900 light/dark、刷新与浏览器 history 门禁 |
| proof | 日期页真实 `2026-08-13，3条聊天记录` 可进入稳定 messageID，back 恢复日期结果；月份由 3 扩展到 4 后 reload 保持；媒体视频筛选与文件页 reload 保持各自 URL/空态 |
| change | H5 只将 `view/months/filter` presentation 状态写入 React Router query；恢复时继续调用 `WebIMSync.messages.searchCached` 重读当前账号缓存 |
| safety | URL 月份限制为 1..120，未知 view/filter fail-closed；无 Gateway/WebSocket/send/download/mutation，不改 SDK/RN |
| verification | focused helper 1 file/5 tests、H5 full 140 files/445 tests、Web typecheck、466 assets、1188-module production build、3 route HTTP 200、RN/SDK boundary/diff；light/dark 760/760，clean reload 新增零 warning/error |
| residual | 当前自然样本没有非空媒体/文件；历史 458px 已有非空证据；Safari/Firefox、实体设备和媒体预览活动帧继续 gated |

## Latest Audited Slice W6.a6.20.127

| field | value |
| :--- | :--- |
| goal | 只读扫描当前全部会话，寻找 `.126` 所需的非空媒体/文件自然样本 |
| proof | 当前 4 个会话的 `view=media&filter=all` 与 `view=file` 共 8 个真实 route 均返回明确空态；会话列表扫描前后两个未读会话均保持各 2 条未读 |
| anti-shortcut | 不打开聊天、不注入 fixture/URL payload、不发送/上传/下载、不调用 Gateway mutation、不 mark-read，不以历史截图替代当前自然数据 |
| runtime | 412×786 light，viewport/scrollWidth=`412/412`，warning/error=`0`；existing production Router/cache path only |
| change | runtime/code/SDK/RN 零改动；仅登记 current-natural-data gate |
| activation | 任一当前会话自然出现 type102/104/105 缓存消息后，复用现有索引 route 完成非空预览活动帧；真实发送仍需独立授权 |

## Latest Closed Slice W6.a6.20.128

| field | value |
| :--- | :--- |
| goal | 关闭文本搜索结果定位消息的 RN 1600ms 高亮活动帧残余 |
| proof | 真实 `123` 结果携带稳定 `messageID=61da9d1a-5ce3-4ce8-8d37-44d56939c104`，当前账号缓存恢复目标窗口后，目标消息行出现 `is-focus-highlighted`、`rgba(0,0,0,0.04)` 与 `14px` 圆角，并在 1600ms 后清理 |
| change | H5 用受控 class/timer 替代当前轻量浏览器缺失的 Web Animations API；样式拆入独立 `chat-message-focus.css`，不继续扩大既有大 CSS 文件 |
| ownership | SDK 继续独占搜索/SQLite；H5 helper 只负责目标 DOM 行滚动和短暂展示态；RN business 与 SDK source 均不改 |
| verification | focused 2 files/5 tests、H5 full 140 files/446 tests、Web typecheck、466 assets、1189-module production build；真实 target ID/高亮帧/清理时序通过 |
| residual | 文本搜索仅剩 Safari/Firefox 与实体设备；索引媒体/文件非空自然样本仍由 `.127` gate 管理 |

## Latest Audited Slice W6.a6.20.117

| field | value |
| :--- | :--- |
| goal | 在不触发 mark-read 的前提下寻找真实 image/audio/video cache payload 并验收媒体交互 |
| proof | 无未读群=系统消息；无未读单聊=申请/建联/文本；归档=empty；均无媒体 action |
| anti-shortcut | 两个 unread 会话未打开；不注入 URL、不 mark-read、不播放/下载/发送、不执行 Gateway/SQLite |
| verification | H5 3 files/11 tests、Web typecheck、3 route HTTP 200、diff/RN protected checks；runtime 零改动 |
| state | `blocked-natural-data` |
| activation | 无未读会话自然包含 safe absolute HTTP(S) image/audio/video payload |

## Latest Audited Slice W6.a6.20.116

| field | value |
| :--- | :--- |
| goal | 审计好友/群聊验证是否已有可无副作用验收的真实 pending 样本 |
| proof | friend=3 条 accepted、无“加好友”；group=empty；两个 Tab 均 412px 无横向溢出 |
| anti-shortcut | 不注入 fixture、不制造申请、不打开资料/mark-read、不接受/拒绝、不改 Gateway/SQLite |
| verification | H5 2 files/7 tests、Web typecheck、2 route HTTP 200、diff/RN protected checks；runtime 零改动 |
| state | `blocked-natural-data` |
| activation | incoming pending 好友申请或 owner/admin pending 群申请自然出现；mutation 继续独立授权 |

## Latest Closed Slice W6.a6.20.115

| field | value |
| :--- | :--- |
| goal | 关闭账号安全总览、首次设置表单与账号状态 route guard 的 authenticated 412px dark gate |
| proof | root `+86 15555555551 / 未绑定 / 账号密码`；account/password/confirm 空表单；reset deep link 纠正到 account；page `15/17/21`、card/form `27/29/36` |
| anti-shortcut | 不输入/提交凭据，不执行 set/reset/Gateway/SQLite/session cleanup，不把错误 route 可达冒充 reset 成功；恢复 light |
| verification | SDK 1 file/3 tests、H5 1 file/3 tests、Web typecheck、3 route HTTP 200、diff/RN protected checks；runtime 零改动 |
| residual | 760x900 dark、已绑定账号 reset 自然表单、approved real set/reset Network/result/session cleanup、跨浏览器/设备 |

## Latest Closed Slice W6.a6.20.114

| field | value |
| :--- | :--- |
| goal | 关闭本人资料总览与 nickname/gender/bio 三编辑 route 的 authenticated 412px dark gate |
| proof | `donk/32`、`未知 checked`、`empty/100/0-100`；page `17/19/24`，card/textarea `27/29/36`，input `36/39/51`；全链 412/412 |
| anti-shortcut | 不改 draft、不点击完成、不调用 update-profile；取消/返回后事实不变并恢复 light preference |
| verification | focused 4 files/17 tests、Web typecheck、3 route HTTP 200、diff/RN protected checks；SDK/H5 runtime 零改动 |
| residual | 760x900 dark、真实 changed-value Network/result、slow-saving pending、Safari/Firefox/实体设备继续 gated |

## Latest Closed Slice W6.a6.20.113

| field | value |
| :--- | :--- |
| goal | 恢复 RN 群管理页 `page/card` 视觉层级，并同步覆盖 light/dark 主题 |
| proof | light `247/247/247 -> 255/255/255`；dark `17/19/24 -> 27/29/36`；8px、card 380px、viewport 412/412 |
| ownership | `rn-theme.css` 继续持有主题值；页面仅选择 `--im-bg-page/--im-bg-card`，无局部 dark 分支 |
| verification | focused 3 files/10 tests、Web typecheck、diff check、真实 light/dark browser；RN protected diff empty |
| residual | Safari/Firefox、实体设备主题切换继续 gated；不外推到其他页面 |

## Latest Closed Slice W6.a6.20.112

| field | value |
| :--- | :--- |
| goal | 关闭真实 owner 群的管理员列表/添加候选与转让群主候选正向只读 gate |
| proof | admin empty+limit -> 2 add candidates+disabled -> owner transfer 2 candidates+self excluded -> manage；全链 412/412、clean log |
| anti-shortcut | 不选择、不打开确认、不执行 add/remove/transfer；只消费 production permission/member/route owners |
| verification | focused 3 files/10 tests、真实 DOM/route/viewport/log；RN protected diff empty；SDK/H5 runtime 零改动 |
| residual | natural admin/non-empty list、确认层、真实角色 mutation、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.111

| field | value |
| :--- | :--- |
| goal | 关闭会话首页真实聊天记录结果、稳定 messageID route、本地目标窗口和 replace/back gate |
| proof | `123 -> donk三大爷 1条 -> ?messageID=61da9d1a-... -> target DOM 123 -> conversations`；412/412、clean log、unread 4 不变 |
| anti-shortcut | 不把正文/DTO塞入 Router state，不请求 Gateway，不改 cache；不声明未捕获的 900ms animation 活动帧 |
| verification | focused 2 files/10 tests、真实 DOM/route/viewport/log；RN protected diff empty；SDK/H5 runtime 零改动 |
| residual | 高亮 animation 活动帧、8+ 结果分页、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.110

| field | value |
| :--- | :--- |
| goal | 关闭联系人服务器群聊搜索的真实非空 joined 结果、规范会话打开与搜索层 replace gate |
| proof | `donk -> 群聊 -> 2 joined 群 -> donk的群聊 -> canonical conversation -> conversations`；全链 412/412、clean log |
| anti-shortcut | 使用 production Gateway/facade/Router；选择无未读群，不申请、不 markRead/发送、不改 cache |
| verification | focused 4 files/14 tests、真实 DOM/route/viewport/log；RN protected diff empty；SDK/H5 runtime 零改动 |
| residual | available/pending 服务器结果、申请 mutation、cache-miss fallback、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.109

| field | value |
| :--- | :--- |
| goal | 按冻结 RN 规则补齐普通群会话 latest sender 摘要，并消除 Web 群系统类型分类双轨 |
| proof | SDK cache-only `latestSenderDisplayName` + shared system classifier；真实列表显示 `donk二大爷：1231`，系统摘要仍为 `群聊已创建` |
| anti-shortcut | 不请求发送者网络资料、不打开会话、不 markRead/发送/写 cache；RN 业务源码保持冻结 |
| verification | SDK Web 98/408 + build:web/sync:web；H5 focused 3/32 + app typecheck；412px DOM/log；RN protected diff empty |
| residual | RN consumer convergence 需独立授权；跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.108

| field | value |
| :--- | :--- |
| goal | 关闭真实群成员昵称、群主角色数据与聊天共享投影链的无副作用 gate |
| proof | 真实成员页 3 个昵称均正确，群主行带“群主”；SDK resolver、聊天 sender/mention 和成员页使用同一优先级/DTO |
| anti-shortcut | 目标聊天含未读且短列表入页会 markRead，因此不进入聊天、不声明真实气泡像素、不执行任何写入 |
| verification | H5 focused 3 files/13 tests、SDK focused 1 file/4 tests、真实 DOM/412px/log；RN/SDK/H5 runtime 零改动 |
| residual | 已读 owner/admin 消息气泡自然像素、自然管理员样本、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.107

| field | value |
| :--- | :--- |
| goal | 关闭群公告、群管理与群自动删除的普通成员角色自然样本 gate |
| proof | real member group settings：3 members + leave；no announcement/manage/auto-delete/dismiss；direct `/settings/manage` replace 回 `/settings`；412/412 |
| anti-shortcut | 不切换设置、不清空/退出、不执行角色或群 mutation；不声明 admin 正向像素 |
| verification | focused 4 files/19 tests、`.94` H5 typecheck 基线、真实 DOM/route/viewport；RN/SDK/H5 runtime 零改动 |
| residual | admin 角色、公告/自动删除/角色 mutation、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.106

| field | value |
| :--- | :--- |
| goal | 关闭会话行与普通文本消息 RN 长按等价菜单的真实数据只读 gate |
| proof | group row -> 5 项会话菜单 -> backdrop close；text `123` -> 6 项消息菜单+预览 -> Escape close；URL 均稳定，412/412 |
| anti-shortcut | 仅用 production 右键等价入口；不点击 menuitem，不声明 physical touch 或任何 mutation 成功 |
| verification | focused 3 files/8 tests、`.94` H5 typecheck 基线、真实 DOM/route/viewport；RN/SDK/H5 runtime 零改动 |
| residual | physical touch、所有业务动作、Safari/Firefox/实体设备继续 gated |

## Latest Closed Slice W6.a6.20.105

| field | value |
| :--- | :--- |
| goal | 关闭会话首页真实群搜索结果进入聊天后的 search-layer replace/back gate |
| proof | `donk -> 2 好友/1 群 -> donk的群聊 -> /conversations/019ff8b7-... -> /conversations`；搜索层不恢复，412/412 |
| anti-shortcut | 不发消息、不改搜索历史、不声明未出现的 messageID 定位/高亮 |
| verification | focused 2 files/18 tests、`.94` H5 typecheck 基线、真实 DOM/route/viewport；RN/SDK/H5 runtime 零改动 |
| residual | 消息内容结果、messageID 窗口恢复/高亮、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.104

| field | value |
| :--- | :--- |
| goal | 关闭群申请入口 already-joined 状态经 shared openGroup 进入规范会话的自然样本 gate |
| proof | `97524759106/apply -> 进入群聊 -> /conversations/019ff8b7-... -> /conversations`；申请层不恢复，412/412 |
| anti-shortcut | 不提交入群申请、不改变群关系、不发消息、不执行关系/Gateway mutation |
| verification | focused 3 files/11 tests、`.94` H5 typecheck 基线、真实 DOM/route/viewport；RN/SDK/H5 runtime 零改动 |
| residual | available 群/真实申请、Gateway cache-miss fallback、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.103

| field | value |
| :--- | :--- |
| goal | 关闭真实群主的群公告入口、可编辑投影与取消返回只读 gate |
| proof | 群设置 -> 公告编辑页（取消/完成/textbox）-> 取消 -> 群设置；412/412，零内容变更 |
| anti-shortcut | 不输入、不完成、不发布、不标记已读、不执行角色/Gateway/SQLite mutation |
| verification | focused 1 file/9 tests、`.94` H5 typecheck 基线、真实 DOM/route/viewport；RN/SDK/H5 runtime 零改动 |
| residual | `.107` 已关闭 member；admin 角色、公告发布/已读、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.102

| field | value |
| :--- | :--- |
| goal | 关闭单聊设置与真实群主管理页的自动删除入口层级 browser gate |
| proof | 单聊设置有“定时删除”；群设置无入口；真实群主管理页有“定时删除消息”，三页 412/412 |
| anti-shortcut | 不打开策略页、不切换设置、不执行 Gateway/SQLite mutation；本片未声明管理员/普通成员像素，member 后由 `.107` 关闭 |
| verification | focused 2 files/13 tests、`.94` H5 typecheck 基线、真实 DOM/route/viewport；RN/SDK/H5 runtime 零改动 |
| residual | `.107` 已关闭 member；admin 角色、策略保存、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.101

| field | value |
| :--- | :--- |
| goal | 关闭聊天“加号 -> 名片”统一单选目标弹窗的只读交互 gate |
| proof | 好友排除本人/当前对端且无 ALL；群聊 Tab 可切换；未选中分享 disabled；关闭留在原会话，412/412 |
| anti-shortcut | 不选择目标、不点分享、不发送 type108、不执行 Gateway/SQLite mutation |
| verification | focused 3 files/7 tests、`.94` H5 typecheck 基线、真实 DOM/route/viewport；RN/SDK/H5 runtime 零改动 |
| residual | type108 真实选择/发送、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.100

| field | value |
| :--- | :--- |
| goal | 关闭建群内查找群聊的 joined 结果进入规范会话并移除中间覆盖层 gate |
| proof | `/groups/create -> /groups/search -> donk的群聊 -> /conversations/019ff8b7-... -> /conversations`；412/412，无中间层恢复 |
| anti-shortcut | 不选好友、不建群、不发消息、不进设置、不执行群申请/Gateway mutation |
| verification | focused 4 files/17 tests、`.94` H5 typecheck 基线、真实 route/DOM/viewport；RN/SDK/H5 runtime 零改动 |
| residual | available 群、群申请成功返回、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.99

| field | value |
| :--- | :--- |
| goal | 关闭联系人服务器搜索好友缺省昵称、资料返回和好友/群聊双 Tab 的正常网络只读 gate |
| proof | `62 -> server friends -> im-9162 -> profile -> search` 保留 keyword/server/friends；groups 空态后切回好友结果恢复，412/412 |
| anti-shortcut | 不进申请页、不提交好友/群申请、不发消息、不执行 RTC；不把普通 Tab 切换冒充慢网竞态 |
| verification | focused 5 files/23 tests、`.94` H5 typecheck 基线、真实 route/DOM/viewport；RN/SDK/H5 runtime 零改动 |
| residual | slow-network request race、服务器群结果/已加入群、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.98

| field | value |
| :--- | :--- |
| goal | 关闭联系人本地已加入群搜索结果经 shared openGroup 进入规范会话的自然样本 gate |
| proof | `donk -> donk的群聊(97524759106) -> /conversations/019ff8b7-...`；群 Header/消息区/输入区正常，412/412 |
| anti-shortcut | 不发消息、不进设置、不执行群关系/Gateway mutation；不声明未识别的 conversation-only fallback 或服务器 joined 分支 |
| verification | focused 5 files/23 tests、`.94` H5 typecheck 基线、真实 route/DOM/viewport；RN/SDK/H5 runtime 零改动 |
| residual | conversation-only 群、服务器 joined 群、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.97

| field | value |
| :--- | :--- |
| goal | 关闭消息、通讯录、归档会话三个主 scene 的联系人搜索来源/取消返回 browser gate |
| proof | 三个更多菜单“添加朋友”均进 `/contacts/search`，取消分别精确恢复原 pathname；归档空态 412/412 |
| anti-shortcut | 不输入关键词、不发起 server search、不进入资料/申请、不执行关系 mutation |
| verification | focused 3/7、`.94` H5 typecheck、真实 route/412px；RN/SDK/H5 runtime 零改动 |
| residual | 好友/群申请成功返回、跨浏览器/实体设备继续 gated |

## Latest Closed Slice W6.a6.20.96

| field | value |
| :--- | :--- |
| goal | 关闭会话首页好友与群聊普通结果进入聊天后的 search-layer replace/back browser gate |
| proof | `.96` 好友 `donk二大爷`、`.105` 群 `donk的群聊` 均进入规范会话并返回 `/conversations`；搜索 input 不恢复 |
| anti-shortcut | 不发消息、不改搜索历史；不声明未出现的 messageID 定位/高亮 |
| verification | `.96` focused 1/7 + `.105` focused 2/18、`.94` H5 typecheck、真实 route/DOM/412px；RN/SDK/H5 runtime 零改动 |
| residual | 消息搜索结果、messageID 窗口恢复/高亮、跨浏览器/设备继续 gated |

## Latest Closed Slice W6.a6.20.95

| field | value |
| :--- | :--- |
| goal | 关闭真实联系人 Clipboard success-only 与共同群聊嵌套返回的自然样本 browser gate |
| contact proof | `donk` 本地好友 -> `donk二大爷` 资料；点击 ID 显示“复制ID成功”并约 1.2s 消失 |
| route proof | profile -> common-groups -> profile -> search；查询与 2 位本地好友/1 个本地群结果恢复，412/412 |
| anti-shortcut | 不读 Clipboard 内容；不点通话/星标/消息/备注/分享，不打开共同群会话或执行关系 mutation |
| verification | focused 4/12、`.94` H5 typecheck、真实 DOM/route；RN protected source 与 SDK/H5 runtime 零改动 |
| residual | 当时共同群 count=1 但列表为空；该自然数据残项已由 `.134` 的 count=2/list=2/canonical-open 真实证据关闭；关系/RTC/send、跨浏览器/设备仍 gated |

## Latest Closed Slice W6.a6.20.94

| field | value |
| :--- | :--- |
| goal | 关闭本人资料 Clipboard、三编辑页 Navbar 与返回栈的当前登录态只读 browser gate |
| clipboard proof | 用户手势点击后出现“已复制ID”并约 1.2s 自动消失；不读取剪贴板内容，URL/资料不变 |
| route proof | nickname 返回/完成，gender/bio 取消/完成；三个入口只用返回/取消退出并精确回 `/me/profile` |
| geometry | 412x786，Navbar 412x56，ID button border 0/outline none，所有 route 412/412 零溢出 |
| anti-shortcut | 不改字段、不点完成、不触发 pending/profile mutation，不新增 fixture、writer 或 browser tab |
| verification | focused 5/19、H5 typecheck、真实 DOM/geometry；RN protected source 与 SDK/H5 runtime 零改动 |
| next | 等待 profile mutation/pending、RTC、offline、多浏览器/设备或自然数据 gate 获得授权/环境 |

## Latest Closed Slice W6.a6.20.93

| field | value |
| :--- | :--- |
| goal | 在当前真实登录标签关闭联系人搜索 Enter/blur 的可自动化 browser gate |
| real evidence | 412x786 输入 `donk` 后按 Enter；焦点回 `BODY`，URL/查询词/2 位本地联系人/1 个本地群结果保持，412/412 零溢出 |
| anti-shortcut | 无 server tabs/loading/server section；“去服务器搜索”仍是显式入口，未点击它或执行远端搜索/mutation |
| non-claim | Playwright Enter 不代表移动软键盘、IME composition 或实体设备；这些继续 device-gated |
| protection | 文档验收片；H5 runtime、SDK source/generated、RN protected source 零改动 |
| next | 等待已登记的真实 mutation、RTC、offline、多浏览器/设备或自然数据 gate 获得授权/环境 |

## Latest Closed Slice W6.a6.20.92

| field | value |
| :--- | :--- |
| goal | 用当前真实登录态关闭自定义表情浅色 empty/viewport gate，并修复验收发现的 desktop cell 拉伸 |
| defect/fix | 1280px surface 导致五列约251px；surface 改为 mobile full-width、desktop centered 480px，单元恢复约90.8px |
| real evidence | light 412x786 + 1280x800；聊天 tab 与管理页同为真实 empty cache；零 overflow、默认按钮边框和 console warning/error |
| non-claim | 当前账号 image count=0；不把 empty 当 populated，不执行 picker、preview、reorder、create/delete/send |
| verification | focused 2/7、H5 Web typecheck、466 assets、SDK Web 98/407、boundary、1184-module build |
| next | `W6.a6.20.93-contact-search-keyboard-browser-acceptance`，同一标签只验证 Enter blur/no request/no mode change |

## Latest Closed Slice W6.a6.20.91

| field | value |
| :--- | :--- |
| goal | 收敛 RN/H5 route/capability inventory 与台账漂移，停止重复实现和危险平台替代 |
| corrected state | chat search 设置入口已完成；invite/complete-profile/version 已完成本地实现，不再列为 remaining branch |
| platform exclusions | native network proxy 与 RN temporary cache directory 在 browser 无等价 owner；H5 不提供无效设置，不删除 IM IndexedDB/sql.js |
| retained gate | OpenIM `globalRecvMsgOpt` 仍需独立 Web facade；Gateway `notification` 不替代 |
| next phase | 本地确定性 implementation inventory 关闭，进入已有 external/authorization acceptance ledger |
| verification | source/route/facade/SSOT trace；`npm run verify` 通过 466 assets、H5/SDK Web typecheck、boundary、SDK Web 98/407 和 1184-module build；RN protected source 零改动 |

## Latest Closed Slice W6.a6.20.90

| field | value |
| :--- | :--- |
| goal | 对齐 RN 联系人搜索的软键盘 search/完成行为，仅收起键盘并让出结果区 |
| source anchor | RN `ContactSearchScreen`：`AppSearchBox.returnKeyType=search`；`onSubmitEditing -> Keyboard.dismiss()` |
| H5 owner | `shouldDismissContactSearchKeyboard` 判定非 composition/repeat Enter；页面只执行 `preventDefault + blur` |
| anti-shortcut | Enter 不调用 `runServerSearch`、不切换 server mode/Tab；远端请求仍只有显式页面动作入口 |
| structure | `ContactSearchStates` 承接纯状态 UI；主页面 411 -> 384 行，未移动业务 owner |
| verification | fail-first 1；focused 2/14；H5 135/425；SDK Web 98/407；466 assets、typecheck、1184 modules、route HTTP 200、RN protected diff=0 |
| browser gate | `.93` 已复用当前登录标签关闭可自动化 Enter/blur；移动软键盘、IME composition 与实体设备继续 gated |

## Latest Closed Slice W6.a6.20.89

| field | value |
| :--- | :--- |
| goal | 对齐 RN 三类资料编辑器的 pending 门禁与 loading presentation，不复制保存状态 |
| source anchor | RN nickname `savingOverlay`；shared `EditTopBar` 的 disabled cancel / ActivityIndicator |
| H5 owner | 既有 `saving` 单一事实；Header 仅投影 back disabled/right spinner，nickname 仅投影 blocking overlay |
| anti-shortcut | 不新增保存、返回、pending store 或 History 拦截；spinner 不替代真实 Gateway resolve |
| verification | fail-first 2；focused 1/8；H5 135/423；SDK Web 98/407；466 assets、typecheck、1183 modules、三 route HTTP 200、RN protected diff=0 |
| browser gate | 当前已登录标签未暴露；未新开第二 SQLite writer，真实慢请求 pending 像素待单标签补证 |

## Latest Closed Slice W6.a6.20.88

| field | value |
| :--- | :--- |
| goal | 对齐 RN 三类个人资料编辑器的左侧动作和左右导航动作配色，不改变已有返回/保存链 |
| source anchor | RN `ProfileScreen` 昵称编辑顶栏；`ProfileGenderPickerScreen/ProfileBioEditorScreen` 的取消/完成顶栏 |
| H5 owner | `MeProfileHeader.backLabel` 只投影箭头或取消文本；`rn-me-profile-back-action/save-action` 分离颜色语义 |
| anti-shortcut | 不新增返回、保存、校验或 mutation owner；两侧均复用 `.86/.87` 已有 callback；无页面级内联颜色 |
| business boundary | profile facade/DTO/Gateway/SQLite、SDK、RN 与 Desktop 零业务改动；只改 H5 Header presentation/CSS |
| verification | fail-first 2；focused 1/6；H5 135/421；SDK Web 98/407；466 assets、typecheck、1183 modules、三 route HTTP 200、RN protected diff=0 |
| browser gate | `.94` 已关闭 Navbar 与返回/取消的只读证据；pending/save-success 继续 mutation-gated |

## Latest Closed Slice W6.a6.20.87

| field | value |
| :--- | :--- |
| goal | 对齐 RN 昵称软键盘 Done/物理 Enter 完成行为，并避免 IME 中文确认误触发保存 |
| source anchor | RN `ProfileScreen` 昵称 `TextInput.returnKeyType=done + onSubmitEditing=submitNickname` |
| H5 owner | `shouldSubmitProfileNicknameKey` 唯一判定 `Enter/IME/repeat`；页面适配 callback 只调用既有 `saveProfile` |
| anti-shortcut | 无 form/default submit、第二 update/trim/route owner；空值、pending、未变更和失败仍由既有链 fail-closed |
| business boundary | profile facade/DTO/Gateway/SQLite/CSS、SDK、RN 与 Desktop 零业务改动；bio textarea 不接入此规则 |
| verification | fail-first 3；focused 3/10；H5 135/419；466 assets、typecheck、1183 modules、两 route HTTP 200、RN protected diff=0 |
| browser gate | 当前已登录标签未暴露给 Browser 控制；未新开第二 SQLite writer，真实软键盘 Done/IME/Enter 待单标签补证 |

## Latest Closed Slice W6.a6.20.86

| field | value |
| :--- | :--- |
| goal | 让资料字段编辑页像 RN 内部编辑态一样退出到真实资料总览，且深链/首页快捷入口不产生错误后退或循环 |
| source anchor | RN `ProfileScreen` 内部 `nickname/gender/bio` route state 及统一 close/save 返回行为 |
| H5 owner | `me-profile-editor-route` 唯一清洗 `returnMode` 并投影 history/profile 动作；编辑 Header、未变更和保存成功共用 `returnFromEditor` |
| anti-shortcut | 只有资料总览三个入口写 history 标记；未知 state fail-closed replace，总览与编辑页不再互相 push；无直接 History API |
| business boundary | profile facade、字段 DTO/校验、Gateway、SQLite、错误与成功判定不变；SDK/RN/Desktop 零业务改动 |
| verification | fail-first 4；focused 4/10；H5 135/416；466 assets、typecheck、1183 modules、四 route HTTP 200、RN protected diff=0 |
| browser gate | `.94` 已关闭三个入口返回栈；保存成功返回继续 mutation-gated |

## Latest Closed Slice W6.a6.20.85

| field | value |
| :--- | :--- |
| goal | 把个人中心首页、个人资料和联系人资料的用户 ID 复制收敛到同一个 H5 platform adapter，并补齐联系人 success-only 反馈 |
| source anchor | RN `ProfileScreen/UserProfileScreen` 的稳定 userID、真实 Clipboard resolve 和可见成功反馈 |
| H5 owner | `components/clipboard/user-id-clipboard` 唯一持有 trim、空值拒绝、browser capability 与 Clipboard API；页面只持短时反馈和错误 |
| anti-shortcut | 删除 `me-profile-clipboard`；三个 consumer 无直接 `navigator.clipboard`、无 fallback copy、mock 或 fake-success |
| verification | fail-first 2；focused 4/17；H5 133/411；466 assets、typecheck、1182 modules、旧 owner/直接调用零残留、route HTTP 200、RN protected diff=0 |
| browser gate | `.94/.95` 已分别关闭本人/联系人真实 Clipboard resolve 与 success-only 反馈 |

## Latest Closed Slice W6.a6.20.84

| field | value |
| :--- | :--- |
| goal | 删除聊天名片选择的独立弹窗及专用样式，改为消费全局好友/群聊选择器单选模式 |
| source anchor | RN `CardPickerModal`的好友/群聊、排除本人/对端、单选和显式分享语义 |
| H5 owner | `ChatTargetPickerModal` 同时为转发提供 `multiple`、为名片提供 `single`；`toIMMessageCard` 仅做平台中立映射 |
| shared boundary | `messages.sendCard` 继续唯一持有 type108 optimistic/Gateway/SQLite 收敛；弹窗在成功后才关闭 |
| anti-shortcut | 删除 `ChatCardPickerDialog.tsx` 和 `chat-card-picker.css`；无兼容 wrapper、第二 cache-first 目标链、mock 或 fake-success |
| verification | fail-first 1；focused 3/8；H5 132/409；466 assets、typecheck、1182 modules、old source/dist 零残留、RN protected diff=0 |
| browser gate | `.101` 已关闭弹窗、好友/群聊 Tab、排除、disabled 与关闭；真实选择/type108 发送仍 gated |

## Latest Closed Slice W6.a6.20.83

| field | value |
| :--- | :--- |
| goal | 删除群申请 already-joined 分支的页面群列表会话推断，改为消费 shared `conversations.openGroup` |
| source anchor | RN 已加入群入口的 `fetchGroupConversation(groupID, conversationID?)`；SDK `openIMGroupConversation` |
| shared owner | SDK 按 groupID 读当前账号缓存，缺失时解析 Gateway 真实 conversation ID，严格校验后 success-only 保存 |
| H5 consumer | 页面只传公开群 groupID，使用返回 conversationID 和全局 `buildConversationRoute`；search replace / QR push 不变 |
| anti-shortcut | 删除 `groups.listCached -> groups.sync -> find`；无 mock/fake-success、页面 Gateway/SQLite、关系或申请双轨 |
| verification | fail-first 1；focused 3/10；H5 132/409；466 assets、typecheck、1184 modules、三 route HTTP 200、RN protected diff=0 |
| browser gate | `.104` 已关闭真实 already-joined 公开群 CTA/openGroup/chat/back；available 群与申请提交仍 gated |

## Latest Closed Slice W6.a6.20.82

| field | value |
| :--- | :--- |
| goal | 建群、查找群聊和 search apply 作为 RN 单一覆盖层内部 replace，joined 群进入聊天不残留中间页面 |
| source anchor | RN `CreateGroupServerSearchScreen -> CreateGroupScreen.onCreated -> ChatHomeScreen`；群申请返回恢复既有页面状态 |
| H5 owner | 12 行 `conversation-route.buildConversationRoute` 唯一 trim/URI encode，会话入口显式传 replace；建群/查群/search apply 只用 React Router |
| business boundary | SDK `openGroup`、群搜索三态、Gateway、SQLite、申请 mutation、聊天 Header、RN business 均不改变；扫码申请仍 push |
| verification | fail-first 3 suites + 1 wiring assertion；focused 4/13；H5 132/409；SDK Web 98/407；466 assets、typecheck/boundary、1184 modules、三 route HTTP 200、RN protected diff=0 |
| browser gate | `.100` 已关闭真实 joined 群 search/click/chat/back；available 群与申请链仍 data/mutation gate |

## Latest Closed Slice W6.a6.20.81

| field | value |
| :--- | :--- |
| goal | 慢网时好友/群聊 Tab 点击不丢失，迟到请求不得覆盖当前关键词、Tab、错误或 loading |
| source anchor | RN `ContactSearchScreen.runServerSearch/onChangeText`；H5 既有 conversation search request-generation pattern |
| H5 owner | `components/interaction/isCurrentInteractionRequest` 唯一判断最新代次；联系人与会话搜索共同消费 |
| business boundary | contacts/groupApplications facade、关系三态、Gateway、SQLite、路由、SDK source、RN business 均不改变 |
| verification | fail-first 2；focused final 4/20；H5 131/405；SDK Web 98/407；466 assets、typecheck/boundary、1183 modules、HTTP 200、RN protected diff=0 |
| browser gate | Browser binding 未暴露当前登录标签；未新建第二 SQLite writer，真实慢网连续切换保持 interaction gate |

## Latest Closed Slice W6.a6.20.80

| field | value |
| :--- | :--- |
| goal | 联系人搜索的本地群与服务器已加入群在打开聊天时关闭搜索层，并与 RN 一样进入消息 Tab |
| source anchor | RN `ContactSearchScreen.openLocalGroup` + `ChatHomeScreen.onOpenGroupConversation`；H5 URL-derived `PrimaryTabsLayout.activeTab` |
| shared owner | SDK `conversations.openGroup` 继续唯一持有群/会话身份和 cache；本片 SDK source 零改动 |
| H5 owner | 该私有 helper 已由 `.82` 删除并收敛到全局 `buildConversationRoute`；两个联系人成功分支均显式传 replace，空 ID fail-closed |
| anti-shortcut | 无 mock/fake-success；页面不直连 Gateway/SQLite/OpenIM，不新增 Tab store 或第二群关系算法 |
| verification | fail-first 2；focused 4/19；H5 129/402；SDK Web 98/407；verify、466 assets、typecheck/boundary、1182 modules、HTTP 200、RN protected diff=0 |
| browser gate | 当前未验证自然 joined 群结果点击；未注入伪群、未执行申请/进入 mutation，登记 group-sample gate |

## Latest Closed Slice W6.a6.20.79

| field | value |
| :--- | :--- |
| goal | 联系人搜索从会话、通讯录或归档会话打开后，取消及资料/申请子链稳定回到原 scene |
| RN truth | 搜索是三个首页 scene 上方的覆盖层；取消只关闭覆盖层，资料子层返回不销毁其下来源 |
| route owner | `contact-search-route` 白名单 `/contacts|/conversations|/conversations/archived`；非法值回退通讯录 |
| H5 consumers | `HomeActionMenu` 记录来源；`ContactSearchPage` replace 返回；资料 state 与群申请成功返回只传递受控字段 |
| boundary | SDK/search API/Gateway/SQLite/关系/mutation/RN/Desktop 零业务改动；无 History API |
| verification | fail-first 5；focused final 6/24；H5 128/399；SDK Web 98/407；verify、466 assets、typecheck/boundary、1182 modules、HTTP 200、RN protected diff=0 |
| browser gate | 未操作当前登录标签；会话/通讯录/归档三入口及子链真实 back 像素保持 interaction gate |

## Latest Closed Slice W6.a6.20.78

| field | value |
| :--- | :--- |
| status | `done-local/clean; route-stack-owner-converged; browser-ordinary-result-pass/message-result-gated` |
| goal | 对齐 RN 首页搜索关闭 overlay 后进入好友/群聊/聊天记录结果的返回栈语义 |
| source anchor | RN `ChatHomeScreen.openConversationFromHomeSearch/openMessageFromHomeSearch` + `HomeSearchScreen` result callbacks |
| primary owner | H5 `buildConversationHomeSearchRoute` 唯一投影 href/replace；页面仅调用 React Router，聊天定位继续消费 query string |
| fail-first | 普通会话和消息定位两个结果均先因 route owner 缺失失败，随后锁定 URI 编码、`messageID` 与 `replace=true` |
| verification | focused 1/7、H5 127/397、SDK Web 98/407、466 assets、typecheck/boundary、`build:web/sync:web`、1181-module build、route HTTP 200、cleanup |
| browser gate | `.96` 已关闭普通好友 result -> chat -> back；消息 `messageID` 定位/高亮继续 natural-data-gated |
| protected | SDK source 与 RN protected source/generated 零本片改动；未运行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.77

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; mutation-acceptance-gated` |
| goal | 对齐 RN 本人昵称群申请验证语、50 字限制、空消息回退和成功关闭申请页语义 |
| source anchor | RN `friendApplicationMessage.ts`、`ContactSearchScreen`、`ChatHomeScreen`、`GroupJoinApplicationScreen` |
| primary owner | SDK `modules/group/group-application-message.ts` + `groupApplications.apply`；H5 只持有资料读取、草稿保护和 Router 返回 |
| delivery | shared helper/constant/limit 导出；apply 前规范化；H5 `/groups/:groupID/apply` 消费；通用 application-message view helper |
| verification | focused SDK 2/12、H5 3/9；`npm run verify` 覆盖 H5 127/395、SDK Web 98/407、466 assets、全 runtime/应用 typecheck、boundary、build:web/sync:web 和 1181-module production build |
| browser gate | 入群申请会产生真实外部关系 mutation，本片不提交；双账号申请/审核/list-back 需独立授权 |
| protected | RN business/generated 零改动；RN/Desktop SDK 入口仅增加 shared helper 导出并完成类型检查；未运行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.76

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; mutation-acceptance-gated` |
| goal | 对齐 RN 本人昵称好友验证语，并在真实好友申请成功后返回资料页且保留来源 context |
| primary owner | SDK `friend-application-message.ts`；`peerProfile.applyFriend` 复用缺省值，H5 页面只读取本人 profile、保护编辑态和 React Router 导航 |
| fail-first | SDK helper 缺失与 H5 message-state/wiring 缺失均先失败；最终 focused 4 files/14 tests |
| verification floor | H5 126/392、SDK Web 98/406、typecheck/boundary、466 assets、1179-module build、generated dist parity、RN protected diff |
| browser gate | 好友申请会产生真实外部关系 mutation，本片未点击提交；双账号内容/接收/list-back 需独立授权 |
| protected | RN business/generated 零改动；仅 `build:web/sync:web`，未运行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.75

| field | value |
| :--- | :--- |
| status | `done-local/clean; route-context-owner-converged; browser-readonly-pass/group-row-gated` |
| goal | 共同群聊子路由返回资料后，资料仍可回到搜索/扫码/群成员/验证列表的原始受控 context |
| primary owner | H5 既有 `contact-profile-route-state` 清洗 state；资料/共同群/Header 只传递；共同群与会话业务继续归 shared SDK |
| verification floor | fail-first 1 expected failure、focused 2/6、H5 full 125/389、SDK Web 98/406、`npm run verify`、typecheck/boundary、466 assets、1176-module build、diff/cleanup |
| browser gate | `.95` 已关闭真实二级返回与搜索恢复；当时共同群 count=1/list=0 的数据门禁已由 `.134` 当前 count=2/list=2/canonical-open 证据关闭 |
| protected | SDK source/generated 与 RN business 零本片改动；未运行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.74

| field | value |
| :--- | :--- |
| status | `done-local/clean; route-context-owner-converged; browser-readonly-pass` |
| goal | 好友申请子路由返回资料后，资料仍可回到搜索/扫码/群成员/验证列表的原始受控 context |
| primary owner | H5 `contact-profile-route-state` 清洗完整 child context；资料/申请/Header 只传递；申请业务继续归 shared SDK |
| verification floor | fail-first；focused 4/25 + final 3/15、H5 full 125/389、SDK Web 98/406、`npm run verify`、typecheck/boundary、466 assets、1176-module build、diff/cleanup |
| browser proof | 当前单标签 `62 -> im-9162 -> profile -> add -> profile -> search`，关键词/tab 恢复、console clean、未提交申请 |
| protected | SDK/RN/Desktop business 零本片改动；未运行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.73

| field | value |
| :--- | :--- |
| status | `done-local/clean; route-state-owner-converged; browser-local-and-server-friend-return-pass/server-group-result-gated` |
| goal | 搜索用户结果进入资料后，返回 `/contacts/search` 时恢复关键词与 local/server/tab 上下文 |
| primary owner | H5 `contact-search-view` 构造/解析白名单 state；`ContactSearchUserRow` 和资料 header 仅传递/消费 |
| fail-first | local/server state、非法 state fail-closed、搜索结果 Link 接线、资料 header state 回传、无 History API |
| verification floor | focused 2/12、H5 full 124/385、SDK Web 98/406、`npm run verify`、typecheck/boundary、466 assets、1175-module build、diff/cleanup |
| browser gate | `.95` 关闭 local；`.99` 关闭 server friends 的资料返回与 keyword/tab 恢复；server groups 结果仍 natural-sample-gated |
| protected | 不修改 SDK source/generated、RN/Desktop、资料读取/好友申请/服务器搜索；禁止 RN/Desktop/build:all/`build:package:desktop:web` |

## Prior Closed Slice W6.a6.20.72

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-owner-converged; browser-sample-gated` |
| goal | `/contacts/search` 在 joined-group 快照暂缺时仍可从当前账号 group conversation cache 搜索并进入真实群会话 |
| primary owner | H5 `buildContactSearchLocalResults` 合并 contacts/groups/conversations；SDK `listCached/openGroup` owner 不变 |
| fail-first | group conversation fallback、joined-group 优先去重、非群/空 target 排除、页面 listCached 接线、无 transport/SQL import |
| verification floor | focused 2/12、H5 full 123/382、SDK Web 98/406、`npm run verify`、typecheck/boundary、466 assets、1175-module build、diff/cleanup |
| browser gate | `/contacts/search` runtime HTTP 200；真实 conversation-only 群自然样本与点击像素保持 data gate |
| protected | 不修改 SDK source/generated、RN/Desktop、服务器搜索/群申请/群管理；禁止 RN/Desktop/build:all/`build:package:desktop:web` |

## Prior Closed Slice W6.a6.20.71

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-owner-converged; browser-local-joined-group-pass` |
| goal | `/contacts/search` 输入关键词后同时展示本地好友和已加入群聊，群名/群 ID 可命中，点击进入 canonical 群会话 |
| primary owner | H5 `buildContactSearchLocalResults` 只组合既有 contacts/groups DTO；SDK `groups` 与 `conversations.openGroup` owner 不变 |
| fail-first | 好友+群合并顺序、群 ID 大小写命中、空词、页面 facade/openGroup wiring、无 transport/SQL import |
| verification floor | focused 2/10、H5 full 123/380、SDK Web 98/406、`npm run verify`、typecheck/boundary、466 assets、1174-module build、diff/cleanup |
| browser gate | `.98` 真实本地非空 joined 群经 shared openGroup 进入规范会话，412/412 且未发送消息 |
| protected | 不修改 SDK source/generated、RN/Desktop、服务器搜索与群申请；禁止 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.70

| field | value |
| :--- | :--- |
| status | `done-local/clean; entry-owner-converged; browser-single-owner-and-member-entry-pass/admin-role-gated` |
| goal | 单聊“定时删除”留在聊天设置；群聊“定时删除消息”移入群管理且仅群主可见 |
| primary owner | `canManageChatAutoDelete` 授权投影；`ChatAutoDeleteSettingsRow` 入口 presentation；现有 `sync.conversations.getAutoDelete/setAutoDelete` mutation owner 不变 |
| verification floor | fail-first；focused 5 files/23 tests、H5 full 122/375、SDK Web 98/406、`npm run verify`、typecheck/boundary、466 assets、1174-module build、diff/cleanup |
| browser gate | `.102` 已关闭单聊/owner；`.107` 已关闭 member 隐藏入口和直达管理 route 退回；admin 仍 natural-data-gated |
| protected | SDK/RN/Desktop/Gateway/SQLite 不改；不执行保存 mutation；禁止 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.69

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-only; browser-owner-and-member-role-pass/admin-and-mutation-gated` |
| goal | 对齐 RN 群设置中 owner/admin 可查看公告、member 隐藏且发布权限独立判断的语义 |
| primary owner | `buildChatSettingsView` 唯一投影设置入口；`GroupAnnouncementPage` 继续消费 shared `canEditAnnouncement` 控制发布 |
| unchanged | SDK role/permission DTO、公告发布/已读/realtime/SQLite、RN business 和其他群管理 capability 均不变 |
| test roles | view matrix 为 behavior evidence；页面已有 wiring/full regression；自然角色浏览器样本为 proof；placeholder 为 0 |
| verification floor | fail-first；focused 2/12、H5 full 121/371、SDK Web 98/406、H5 typecheck、boundary、466 assets、1173-module build、diff/cleanup |
| browser gate | `.103` 已关闭 owner；`.107` 已关闭 member 隐藏入口；admin 与发布/已读仍 gated |
| protected | `im28-phone` protected diff=0；SDK source/behavior 零改动；未执行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.68

| field | value |
| :--- | :--- |
| status | `done-local/clean; shared-presentation-owner; browser-readonly-pass` |
| goal | 对齐 RN 归档会话页右上角与消息首页共用的四项全局操作菜单 |
| primary owner | `HomeActionMenu` 唯一持有气泡生命周期与扫一扫/开始群聊/添加朋友/群发消息 SPA routes；归档页只消费 Navbar 插槽 |
| unchanged | 归档 sync/cache/action/search/pagination/presence、四个目标页业务逻辑、SDK/RN business 均不变 |
| test roles | raw page contract 为 wiring；既有归档 view/presence contracts 为 regression；真实浏览器为 proof；placeholder 为 0 |
| browser gate | `.97` 已关闭归档 Navbar 菜单、添加朋友 route 与取消返回；空态 412/412 |
| verification floor | fail-first；focused 4/6、H5 full 121/371、SDK Web 98/406、`npm run verify`、typecheck/boundary、466 assets、1173-module build、diff/cleanup |
| browser gate | 独立只读标签命中真实认证守卫后关闭；未登录第二标签或争用 SQLite writer，菜单像素保持 auth gate |
| protected | `im28-phone` 零业务改动；SDK source 零改动；仅 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.67

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-only; browser-data-lock-gated` |
| goal | 对齐 RN 归档通栏在可见或归档集合存在置顶会话时的背景规则 |
| primary owner | `conversation-archive-view.shouldUsePinnedArchiveBackground`；页面只投影 `is-pinned` class |
| unchanged | 主 header 仍只跟随可见列表置顶；归档 sync/cache/action/route 和 SDK owner 不变 |
| test roles | pure view 为 behavior；页面 source 为 wiring contract；真实浏览器为 proof；placeholder 为 0 |
| verification floor | focused 4/17、H5 full 120/370、SDK Web 98/406、`npm run verify`、typecheck、runtime boundary、466 assets、1173-module build、diff/hygiene scan |
| browser gate | 临时授权登录被真实 SQLite 多标签锁拒绝并关闭；未注入样本或执行归档/置顶 mutation |
| protected | `im28-phone` 零业务改动；SDK source 零改动；仅 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.66

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-data-lock-gated` |
| goal | 对齐 RN 会话列表单聊在线绿点、历史单聊 ID 回退、分钟轮询与下拉刷新 |
| primary owner | `WebIMSync.presence`；H5 `useConversationPresence` 只选择单聊目标并持有页面内存投影 |
| consumers | `/conversations` 与 `/conversations/archived` 共用同一 hook/row；群聊 fail-closed，不扩大请求 |
| test roles | pure view 为 behavior；presence/row raw tests 为 wiring contract；真实浏览器为 proof；placeholder 为 0 |
| verification floor | focused 3/6、H5 full 119/368、SDK Web 98/406、`npm run verify`、typecheck、runtime boundary、466 assets、1173-module build、diff/entropy scan |
| browser gate | 已授权测试账号的临时标签被真实 SQLite 多标签锁拒绝并已关闭；未干预用户现有标签或注入数据 |
| protected | `im28-phone` 零改动；SDK source 零改动；仅 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.65

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-owner-converged; browser-data-lock-gated` |
| goal | 对齐 RN 静音普通未读、定向 @我、@所有人与手动未读的摘要和角标优先级 |
| primary owner | `conversation-unread-view.ts`；摘要前缀与 `ConversationRow` 共用同一定向提醒识别 |
| delete-or-register | 删除旧“全部静音未读都显示红点”和把 @所有人视为高优先级的活动分支；无 compat |
| test roles | `conversation-list-view` 为 behavior；`conversation-row-contract` 为 wiring contract；真实浏览器为 proof；placeholder 为 0 |
| verification floor | focused 2/12、H5 full 117/363、`npm run verify`、typecheck、runtime boundary、466 assets、production build、diff/entropy scan |
| browser gate | 已授权测试账号登录在临时标签被真实 SQLite 多标签锁拒绝；未干预用户现有标签或注入假数据 |
| protected | `im28-phone` 与 SDK source/generated package 零改动；未执行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.64

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-platform-adapter; browser-success-pass` |
| goal | 对齐 RN 个人资料 ID 行点击复制与成功反馈，并收敛个人中心两处复制入口 |
| primary owner | 本片关闭时为 `copyMeProfileUserID`；已由 `.85` supersede，当前唯一 owner 为 `components/clipboard/user-id-clipboard.copyUserIDToClipboard` |
| H5 boundary | `MePage/MeProfilePage` 只提供点击和 1.2s 反馈；userID 身份、profile facade、Gateway 与 SQLite 不变 |
| test roles | clipboard test 为 behavior；me profile raw contract 为 wiring；真实浏览器操作为 proof；placeholder 为 0 |
| verification floor | focused 3/8、H5 full 116/361、`npm run verify`、H5/SDK Web typecheck、runtime boundary、466 assets、1169-module build、diff/entropy scan |
| browser proof | 真实 412x786：button 语义、成功反馈/自动消失/reload 清空、URL 不变、无默认边框与横向溢出 |
| protected | `im28-phone` 与 SDK source/generated package 零改动；未执行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.63

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-route-adapter; browser-readonly-pass/mutation-acceptance-gated` |
| goal | 对齐 RN 个人中心首页头像“修改头像”和昵称“编辑昵称”快捷交互 |
| primary owner | 头像 `/me/profile -> AvatarSourceActionSheet/AvatarCropDialog -> profile.updateAvatar`；昵称 `/me/profile/nickname -> profile.update` |
| H5 boundary | `MePage` 只提供 SPA links；`readMeProfileRouteState` fail-closed 收敛未知 state，资料页消费一次后 replace 清空，不复制业务状态 |
| test roles | `me-home-menu-contract` 为 route contract；`profile-edit-view` 为 behavior；真实浏览器操作为 proof；placeholder 为 0 |
| verification floor | focused 2/4、H5 full 115/357、H5/SDK Web typecheck、runtime boundary、466 assets、1169-module build、diff/entropy scan |
| browser proof | 真实 412x786：快捷头像打开已有 dialog，取消+reload 不重放；昵称 route 正确；零横向溢出 |
| blocked residual | 真实文件选择、OSS/profile mutation、刷新回读需独立授权；RN 原生网络代理在 browser 无等价 per-app owner，继续 `web-not-applicable` |
| protected | `im28-phone` 零改动；仅 `build:web/sync:web`；未执行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.62

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass` |
| goal | 联系人服务器搜索对齐 RN 好友/群聊双页签；无真实昵称显示 `im-` + userID 后四位 |
| SDK owner | `contacts.searchUsers + normalizeIMUserNickname + formatIMUserDisplayName`；群搜索复用 `groupApplications.search` 三态 owner |
| H5 boundary | 页面只持有双 Tab、结果行、关键词恢复和 React Router；完整 ID、Gateway、关系判断和 cache 不变 |
| verification floor | SDK Web 98/406 + boundary/core/Web compile；H5 114/354 + typecheck + 1169-module build；dist parity/diff checks |
| browser proof | 真实 `62` 查询显示 `im-9162` 与完整 ID；群聊 Tab/真实空态、412px 零溢出、clean console |
| protected | `im28-phone` clean；仅 `build:web/sync:web`；未执行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.61

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; local-verified/browser-sample-gated` |
| goal | 未设置昵称时统一显示 `im-` + userID 后四位，不改稳定身份 |
| SDK owner | `formatIMUserDisplayName`；联系人/资料/群成员/会话/消息/通话 mapper 复用 |
| H5 boundary | 页面仅消费 shared helper；单聊旧缓存 `name===targetID` 在可见标题层兼容，群名不变 |
| verification floor | SDK Web 98/406 + boundary/core/Web compile；H5 114/352 + typecheck + 1168-module build；real-account clean-console readonly proof |
| browser gate | 当前真实账号无无昵称可见样本；已知 ID 服务器搜索为空，未伪造数据 |
| protected | `im28-phone` clean；仅 `build:web/sync:web`；未执行 RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.60

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-only; browser-pass` |
| goal | 对齐 RN 个人中心首页的菜单分组与顺序，恢复两张独立卡片 |
| H5 owner | `MePage + me-page.css` 只持有菜单组合和间距；三个 React Router route 与业务 facade 保持不变 |
| structure | 第一卡为个人资料/通用设置，第二卡仅账号安全；结构合同锁定 2 卡和入口顺序 |
| verification floor | H5 full 114/351、typecheck、1166-module build、diff scan；真实账号 2/1 行、16px gap、同宽、零 overflow/log browser proof |
| blocked residual | RN 会话全局静音来自 OpenIM `globalRecvMsgOpt`；Web SDK 当前没有该设置 facade，且 Gateway `notification` 不是等价事实，禁止替代接线 |
| protected | 未改 SDK source/generated package 或 `im28-phone` business；未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 owner、可独立验证且不修改 RN business 的确定性缺口。OpenIM 全局接收选项只能在独立 SDK 合同冻结后进入实施。

## Latest Closed Slice W6.a6.20.59

| field | value |
| :--- | :--- |
| status | `done-local/clean; app-shell-owner-converged; browser-pass` |
| goal | 对齐 RN 通话编辑态隐藏主 TabBar、以批量编辑栏独占底部 chrome，并在退出/隐藏时恢复 |
| chrome owner | `PrimaryTabsLayout` 唯一计算全局底栏；`CallsPage` 只通过可选回调上报编辑态并在 cleanup 复位 |
| layout | 编辑时 scene 占满视口，edit bar 贴底并包含 safe area；列表保留 84px+safe-area，末行不被 fixed bar 覆盖 |
| business boundary | calls cache/sync/delete/RTC 继续使用原 facade；无 SDK、Gateway、SQLite、DTO、cache replacement 或 mutation 变化 |
| verification floor | focused 2/6、H5 full 113/350、typecheck、1166-module build、diff/entropy scan；第二账号 edit enter/leave geometry 与 clean-console browser proof |
| protected | 未改 SDK source/generated package 或 `im28-phone` business；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 owner、可独立验证且不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.58

| field | value |
| :--- | :--- |
| status | `done-local/clean; app-shell-owner-converged; browser-pass` |
| goal | 对齐 RN 四个主 Tab 的 Activity 保留语义，避免 React Router 切换卸载页面并丢失搜索、筛选和滚动状态 |
| routing owner | React Router 只持有 `/conversations|contacts|calls|me` URL marker；`PrimaryTabsLayout` 唯一渲染四个页面实例 |
| lifecycle owner | React `Activity` 常驻页面并暂停隐藏副作用；外层 scene 唯一持有可见性、独立滚动和保存/恢复 |
| supporting changes | pull refresh 识别 scene 顶部；通讯录索引回顶写当前 scene；route motion 只选 active scene；calls 高度继承 tabbar space |
| verification floor | focused 4/10、H5 full 112/347、SDK Web 98/403、typecheck/boundary、1165-module build、diff check；第二账号状态/滚动/geometry/clean-log browser proof |
| protected | 未改 SDK source 或 `im28-phone` business；仅门禁执行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 owner、可独立验证且不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.57

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-owner-converged; browser-zero-state-pass/non-zero-data-gated` |
| goal | 对齐 RN 通讯录主 Tab 的好友申请未读加群申请总数角标，并让 Tab 与通讯录 shortcut 复用同一快照 |
| business owner | SDK 既有 `friendApplications/groupApplications` read facades 继续唯一提供计数事实；无新增 Gateway、SQLite、DTO 或 mutation |
| H5 owner | `PrimaryTabsLayout -> useVerificationUnreadCounts -> PrimaryTabBadgeProvider` 持有主 Tab 生命周期；TabBar 与 ContactsPage 只消费同一状态/刷新端口 |
| freshness | 首次恢复与进入通讯录刷新；同 runtime/账号并发合并；账号切换拒绝旧结果回写 |
| delete | 删除四 Tab 全部迁移后遗留的 nullable href、disabled button 和禁用 CSS 分支，不保留 compat |
| verification floor | focused 3 files/7、full 111 files/344 tests、typecheck、1165-module build、diff check；真实四 Tab 路由与零值隐藏 proof |
| protected | 本片未修改 SDK、generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 owner、可独立验证且不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.56

| field | value |
| :--- | :--- |
| status | `done-local/clean; compatibility-only; browser-readonly-pass` |
| goal | 让已发布/历史浏览器中的旧转发 URL 安全回到当前聊天内唯一目标选择器，不恢复第二页面 |
| primary owner | `ChatPage -> ChatTargetPickerModal` 继续是唯一选择 UI；shared SDK 转发 facade 保持唯一业务 owner |
| compatibility | `ChatForwardCompatibilityRedirect` 只做 replace；仅转交同路由会话、1–100 个稳定 client ID，并在聊天页复核后清除 state |
| delete/register | 登记旧 route 为 compatibility-only；无旧页面/CSS/source/mutation；历史深链不再支持时可删除该 route 和 redirect |
| verification floor | focused 1 file/4、full 110 files/341 tests、typecheck、1165-module build、diff check；旧 URL/reload/back/零日志 browser proof |
| protected | 本片未修改 SDK、generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续从 RN 页面/动作/状态清单选择不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.55

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-only; cold-frame-timing-gated` |
| goal | 用 RN 固定几何、头像差异、尾巴和 shimmer 替换 H5 自创的交替消息骨架 |
| business owner | 既有 ChatPage/SDK history、cache 和 loading 主链不变；本片不新增业务 owner |
| H5 owner | `ChatMessageSkeleton.tsx + chat-message-skeleton.css` 唯一持有加载视觉；`ChatMessageList` 只组合 loading/empty/isGroup |
| delete | 删除旧内联 `ChatMessageSkeleton` 与 4 条 peer/mine pulse bar CSS，不保留 compat |
| verification floor | focused 1 file/3、full 110 files/339 tests、466 assets、typecheck、1164-module build、diff check；真实短群聊 bottom geometry/稳定 reload |
| browser gate | 第二账号真实路由和短列表贴底通过；本地 cache 命中过快，无法稳定捕获自然骨架帧，视觉瞬态保持 timing gate |
| protected | `im28-phone` clean；本片不改 SDK source；只执行 Web build/sync，不执行 RN/Desktop/build:all/`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续从 RN 页面/动作/状态清单选择不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.54

| field | value |
| :--- | :--- |
| status | `done-local/clean; shared-core-ready/web-consumed/rn-frozen; mutation-gated` |
| goal | 删除好友/群聊目标选择双轨，统一单选/多选/ALL 弹窗，并使短消息列表贴底 |
| business owner | SDK `messages.forwardToTargets` 与 `messageBroadcast.sendCard/sendImage` 唯一持有多目标、batch、partial result 和 cache 收敛 |
| H5 owner | `ChatTargetPickerModal` 唯一持有 modal/search/tab/selection；聊天转发直接在当前 ChatPage 打开；route shells 只恢复来源 |
| delete | 删除独立转发目标页/route/CSS；二维码、群发、用户/群名片不再复制选择器 DOM |
| verification floor | SDK focused 3/13 + all-runtime boundary/typecheck；H5 full 109/337、typecheck、1161-module build；登录态弹窗与短列表 browser proof |
| browser gate | 已证明跨 Tab ALL、多选计数、当前聊天 URL 不变和短列表底对齐；未点击最终发送，真实 partial/list-back 保持授权门 |
| protected | `im28-phone` clean；仅 `build:web/sync:web`；未执行 RN/Desktop/build:all 或 `build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续从 RN 页面/动作/状态清单选择不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.53

| field | value |
| :--- | :--- |
| status | `done-local/clean; presentation-owner-converged; physical-touch-gated` |
| goal | 删除页面级下拉刷新三态展示双轨，让全部生产消费者复用同一全局组件 |
| business owner | 20 个页面原有 refresh callback 和 shared SDK facades 完全保持，不新增 transport/cache/mutation owner |
| H5 owner | `usePullRefresh` 唯一持有触摸翻译；`PullRefreshIndicator` 唯一持有三态 DOM/CSS；页面只组合两者 |
| delete | 10 份手写 DOM 与 9 个 CSS 文件中的 `rn-*-pull` 选择器全部删除，不保留 compat |
| verification floor | focused 5 files/10、full 108 files/334 tests、466 assets、typecheck、1158-module build、diff check、20/20 consumer contract |
| browser gate | 5176 通话、会话、搜索、真实群成员四路由均为折叠全局提示、旧 class 0、数据正常和零 warning/error；物理触摸释放保持显式 gate |
| not authorized | 任何真实 mutation；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.52

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-gated` |
| goal | 对齐 RN 普通转发目标列表 `RefreshControl`，保持三 Tab、搜索、目标打开和转发提交主链不变 |
| business owner | `loadChatForwardTargets -> WebIMSync.conversations/contacts/groups` 继续唯一持有三类目标 cache-first/远端刷新事实 |
| H5 owner | `ChatForwardTargetPage` 只复用全局 `usePullRefresh/PullRefreshIndicator`；全部刷新成功后才替换当前快照 |
| verification floor | focused 4 files/8、full 107 files/332 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实 3/2/1 三类目标、搜索/清除、三 Tab、折叠提示、412/412 和零 warning/error 通过；物理触摸释放保持显式 gate |
| not authorized | 打开真实目标、提交转发；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Latest Closed Slice W6.a6.20.51

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/empty-data-and-physical-touch-gated` |
| goal | 对齐 RN 黑名单列表下拉刷新，并删除验证/群页面两套重复提示 owner |
| business owner | `WebIMSync.blacklist.list/remove` 继续唯一持有黑名单事实与解除 mutation；页面无 transport/cache owner |
| H5 owner | `MeBlacklistPage` 只复用全局 `usePullRefresh`；`PullRefreshIndicator` 为七个页面共用的纯展示组件 |
| delete | 删除 `VerificationPullIndicator`、`GroupPullRefreshIndicator` 及重复 CSS，不保留 compat |
| verification floor | focused 6 files/16、full 106 files/330 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 空列表、搜索/清除、空态、412/412 和稳定 reload 通过；无黑名单样本、物理触摸和真实解除保持显式 gate |
| not authorized | 解除真实黑名单；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.50

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-and-action-data-gated` |
| goal | 对齐 RN 指定群入群申请列表 `RefreshControl`，保持搜索、申请操作和 accept/reject 主链不变 |
| business owner | `WebIMSync.groupApplications.list/accept/reject` 继续唯一持有申请事实与 mutation；页面无 transport/cache owner |
| H5 owner | `GroupApplicationsPage` 只复用全局 `usePullRefresh` 和既有 `VerificationPullIndicator`；成功才替换列表，失败保留旧快照与搜索词 |
| verification floor | focused 4 files/11、full 105 files/328 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实群路由、搜索/清除、空态、412/412 和稳定 reload 零 warning/error 通过；物理触摸与申请操作保持显式 gate |
| not authorized | 接受或拒绝真实申请；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.49

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-gated` |
| goal | 对齐 RN 群禁言手动成员列表 `RefreshControl`，保持禁言范围、成员动作和 mutation 主链不变 |
| business owner | `WebIMSync.groups/groupMembers` 继续持有刷新事实；`WebIMSync.groupManagement` 继续唯一持有禁言 mutation |
| H5 owner | `GroupMutePage` 只复用全局 `usePullRefresh`；`GroupPullRefreshIndicator` 为邀请、移除、禁言三个群页面共用的纯展示组件 |
| verification floor | focused 3 files/8、full 104 files/326 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实关闭范围、两位可禁言成员、412/412 和稳定 reload 零新增 warning/error 通过；物理触摸释放保持显式 gate |
| not authorized | 开启/关闭群禁言、成员禁言或解除；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.48

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-gated` |
| goal | 对齐 RN 邀请群成员与移出群成员选择页 `RefreshControl`，保持搜索、选择和 mutation 主链不变 |
| business owner | 邀请继续消费 `WebIMSync.groups/groupMembers/contacts`；移除继续消费 `WebIMSync.groups/groupMembers`；页面无 transport/cache owner |
| H5 owner | 两页只复用全局 `usePullRefresh` 和共用三态提示；全部同步成功后才替换候选，失败保留旧快照与选择 |
| verification floor | focused 4 files/8、full 104 files/325 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实邀请空态、移除两位成员、搜索过滤、禁用提交、412px 与零 warning/error 通过；物理触摸释放保持显式 gate |
| not authorized | 邀请或移除真实成员；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.47

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-gated` |
| goal | 对齐 RN 我的群聊列表 `RefreshControl`，同时保持搜索、长按动作和群生命周期主链不变 |
| business owner | 既有 `WebIMSync.groups.sync` 继续唯一持有 Gateway 全分页与 SQLite 快照替换；页面无 transport/cache owner |
| H5 owner | `JoinedGroupsPage` 只复用全局 `usePullRefresh`，失败保留旧列表并显示真实错误 |
| verification floor | focused 3 files/8、full 103 files/323 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实群、群主标签、无结果/恢复搜索、412/412 和零 warning/error 通过；物理触摸释放保持显式 gate |
| not authorized | 退群、转让、分享或资料 mutation；SDK/RN business；SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、可只读验收且不修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.46

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/physical-touch-gated` |
| goal | 对齐 RN 普通建群的已选好友复核、清空/逐个移除和页面下拉刷新 |
| business owner | 继续复用既有 `WebIMSync.groups.create` 与 `WebIMSync.contacts.list`；未新增 Gateway、SQLite、DTO、Repository 或创建状态机 |
| H5 owner | `CreateGroupSelectedFriends` 只投影选中预览与全局 `InteractionModal`；页面复用 `usePullRefresh`，失败保留旧联系人快照 |
| verification floor | focused 3 files/8、full 102 files/321 tests、466 assets、typecheck、1158-module build、diff check |
| browser gate | 5176 真实两位好友完成全选、复核、逐个移除和清空；提交态正确，412/412、console 0；物理触摸释放保持显式 gate |
| not authorized | 创建真实群、修改 SDK/RN business、SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有 shared owner、无需修改 RN business 的确定性缺口。

## Previous Closed Slice W6.a6.20.45

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-real-data-pass` |
| goal | 对齐 RN type1201 好友关系通知在聊天页、会话摘要和初始未读边界中的固定身份与文案 |
| shared owner | SDK `modules/message/friend-added-message.ts` 持有类型、文案和 pure helper；未读边界复用同一常量 |
| H5 consumers | 聊天气泡与会话摘要共同消费 shared helper，不保留页面级 1201 硬编码 |
| verification floor | SDK focused 2 files/6、Web full 97/400、全 target typecheck/boundary；H5 focused 2/20、full 101/319、466 assets、1157-module build |
| browser gate | 5176 真实会话摘要由 raw `[contentType=1201]` 修复为 RN 文案；稳定期 reload 无新增日志 |
| not authorized | RN business/generated package、RN/Desktop/build:all/`build:package:desktop:web` |

## Latest Closed Slice W6.a6.20.21

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass` |
| goal | 对齐 RN 群设置首屏预览成员在线绿点，不建立设置页专属 presence 分支 |
| shared owner | 既有 `isIMNormalGroupMode` 与 `createIMUserPresenceSync/WebIMSync.presence` 保持唯一业务 owner |
| H5 owner | `ChatSettingsPage` 只选择预览身份；`useObservedUserPresence` 持有唯一页面内存 observation；CSS 投影 14/8px 绿点 |
| verification floor | H5 focused 2/13、full Web 88/368、466 assets、runtime boundary、SDK/H5 typecheck、1119-module build、真实普通群响应式 smoke |
| browser gate | 真实 3 人预览中 2 人在线，412px/390x844 零 overflow/console error；large 群和实时切换仍 sample-gated |
| not authorized | SDK/RN business、群/成员 mutation、RN/desktop builds、build:all、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择可复用 shared owner、真实 API/样本齐备且不改 RN business 的独立缺口。

## Latest Closed Slice W6.a6.20.20

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass` |
| goal | 对齐 RN 普通群成员列表的在线绿点，并消除页面群模式判断双轨 |
| shared owner | `normalizeIMGroupMode/isIMNormalGroupMode` 持有群模式；既有 `createIMUserPresenceSync` 持有 HTTP/realtime/lifecycle |
| H5 owner | `useObservedUserPresence` 只持有页面内存映射；`GroupMemberRow` 只投影 14/8px 在线绿点 |
| verification floor | SDK focused 3/16、H5 view 1/4、full Web 88/368、466 assets、SDK/H5 typecheck、1119-module build、真实 3 人普通群响应式 smoke |
| browser gate | 真实普通群显示 1 个在线成员，412px/390x844 零 overflow/页面错误；large 群和实时状态切换仍 sample-gated |
| not authorized | RN business/caller、群/成员 mutation、RN/desktop builds、build:all、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续选择已有真实 API/样本且不修改 RN business 的独立缺口。

## Latest Closed Slice W6.a6.20.19

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass` |
| goal | 对齐 RN 好友资料页在线/离线状态，同时把 HTTP/realtime/lifecycle 语义放入 shared SDK |
| business owner | `createIMUserPresenceSync` 持有 OpenAPI 分批、状态归一化、revision 和账号生命周期；presence 不写 SQLite |
| H5 owner | `useContactProfilePresence` 只连接当前好友与 runtime；navbar view 只投影黑名单/presence 优先级 |
| verification floor | SDK focused 2 files/7 tests、full Web 87 files/366 tests、SDK/H5 typecheck、H5 view 1/7、466 assets、1115-module build、真实好友资料响应式只读 smoke |
| browser gate | 当前好友真实显示在线且无 overflow/console error；离线转换、重连和第二账号事件仍需样本 |
| not authorized | RN business/caller 改动、资料 mutation、RN/desktop builds、build:all、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续区分真实功能缺口与仅缺授权/样本的 acceptance gate。

## Latest Closed Slice W6.a6.20.18

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/link-data-gated` |
| goal | 将文本链接“打开/复制”从气泡内绝对定位菜单收敛到普通消息已验证的全局 top-layer，消除聊天动作展示双轨 |
| business owner | 链接解析仍由 shared SDK 持有；浏览器打开端口、clipboard success-only 回调和普通消息动作回调均保持不变 |
| H5 owner | `ChatActionModalSurface` 唯一持有 body portal/InteractionModal/锚点定位；普通消息与链接分别只提供自己的预览和动作项 |
| verification floor | focused H5 5 files/16 tests；full verify：466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1114-module build；412px authenticated ordinary-message regression pass |
| browser gate | 普通消息共用层、关闭、路由稳定、零横向溢出已证；真实 cache 无链接消息，链接 top-layer 视觉保持 data-gated，未发送测试消息 |
| not authorized | 打开外链、复制、编辑、转发、删除或消息发送 mutation；修改 RN business/caller；RN/desktop builds；`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续区分真实功能缺口与只缺授权/样本的 acceptance gate。

## Latest Closed Slice W6.a6.20.17

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass` |
| goal | 将普通消息长按从气泡内绝对定位菜单对齐为 RN 全屏遮罩、原消息预览和纵向动作 modal |
| business owner | 引用/复制/编辑/多选/转发/添加表情/删除继续调用既有 H5 -> shared SDK 主链；本片不新增业务 owner |
| H5 owner | `ChatMessageAction` 持有 `500ms/8px` gesture；`ChatMessageActionModal` 通过 body portal/InteractionModal 呈现；纯 layout helper 持有收发靠边与 viewport clamp |
| verification floor | focused H5 4 files/13 tests；full verify：466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1113-module build |
| browser gate | 当前已登录 412px 页面右键打开真实 modal：发出消息靠右、200px/6 动作、只有删除为危险色；遮罩关闭后 dialog 清除、URL 不变、零横向溢出；触屏实机仍 gated |
| not authorized | 任何消息发送/复制/编辑/转发/删除 mutation、修改 RN business/caller、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续区分真实功能缺口与只缺授权/样本的 acceptance gate。

## Latest Closed Slice W6.a6.20.16

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-link-data-gated` |
| goal | 对齐 RN 文本消息链接点击，以及长按/右键仅显示“打开/复制” |
| shared owner | SDK `splitIMMessageTextLinks/normalizeIMMessageLinkURL` 唯一持有 HTTP(S)/www 边界、尾随标点与 www->HTTPS；RN caller 冻结 |
| H5 owner | `PresetEmojiTextContent` 消费 shared 片段；`ChatMessageLinkAction` 只持有 500ms 手势/菜单；browser adapter 与已有 clipboard owner 执行真实 I/O |
| verification floor | focused SDK 1 file/3 tests、H5 3 files/10 tests；full verify：466 assets、boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1111-module build；已登录 412px 群聊页无溢出/console error，但真实 cache 无链接消息 |
| not authorized | 发送测试链接消息、修改 RN business/caller、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，跳过已完成但仍 acceptance-gated 的能力。

## Previous Closed Slice W6.a6.20.15

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-empty-data-gated` |
| goal | 将 RN 我的群聊行长按菜单接到既有群名片、群资料和 shared lifecycle 主链 |
| shared owner | `WebIMJoinedGroup.permissions` 决定动作；`conversations.openGroup` 解析 canonical Conversation；`groupLifecycle.leave(clearHistory)` 唯一持有普通退群业务；群主先进入 shared 群主转让 route |
| H5 owner | `JoinedGroupRow` 持有 `300ms/8px` 手势；`JoinedGroupActionMenu` 持有气泡与确认展示；`JoinedGroupsPage` 只编排 SPA route/shared facade；群资料 `?edit=name` 复用既有 editor |
| verification floor | focused 3 files/10 tests；final full verify：466 assets、SDK runtime boundary、SDK/H5 typecheck、SDK Web 85 files/357 tests、1106-module build；已登录浏览器群列表为空，交互视觉 data-gated |
| not authorized | 制造群数据、真实分享/改名/退群/转让 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，跳过已完成但仍 acceptance-gated 的能力。

## Previous Closed Slice W6.a6.20.14

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-login-lock/data-gated` |
| goal | 将 RN 群主转让从管理页 modal 对齐为独立 React Router SPA route |
| shared owner | SDK `group-admin-owner.ts`/`WebIMSync.groupMembers.transferOwner` 唯一持有权限、候选、exactly-once 与角色缓存事务；H5 只消费 |
| H5 owner | `GroupOwnerTransferPage` 持有搜索、角色/拼音分组、下拉刷新、选择和确认；管理员与群主页面共用 cache-first route data hook；旧管理页转让 modal 已删除 |
| verification floor | H5 focused 3 files/10 tests；final full verify：SDK Web 85 files/357 tests、466 assets、boundary、SDK/H5 typecheck、1102-module build；浏览器登录按真实 SQLite 多标签互斥锁失败；RN protected worktree clean |
| not authorized | 制造群数据、真实群主转让 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，跳过已完成但仍 acceptance-gated 的能力。

## Previous Closed Slice W6.a6.20.13

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/data-gated` |
| goal | 将 RN 群管理员列表与添加候选从管理页 modal 对齐为独立 React Router SPA route |
| shared owner | SDK `group-admin-owner.ts` 唯一持有权限、候选、公开上限、set/cancel exactly-once 与角色缓存事务；H5 只消费 |
| H5 owner | `GroupAdminsPage` 持有列表/移除确认，`GroupAddAdminsPage` 持有搜索/选择 UI，共用一个 cache-first route data hook；旧管理页管理员 modal 已删除 |
| verification floor | SDK focused 5/5、H5 focused 4/4；final full verify：SDK Web 85 files/357 tests、466 assets、boundary、SDK/H5 typecheck、1099-module build；412px missing-group fail-closed/zero-overflow；RN protected worktree clean |
| not authorized | 制造群数据、真实管理员 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

## Previous Closed Slice W6.a6.20.12

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass` |
| goal | 对齐 RN AppSearchBox 默认清除控件，并在清除结果状态后保持输入焦点 |
| shared owner | SDK 继续持有缓存与搜索查询；本片无 SDK capability 变更 |
| H5 owner | 独立 input 组件只翻译 input/Enter/clear；页面统一复位 request generation、结果、分页与错误态 |
| verification floor | focused H5 2 files/7 tests；final full verify：SDK Web 85 files/356 tests、466 assets、boundary、SDK/H5 typecheck、1092-module build；412px authenticated clear/focus/history/zero-overflow；RN protected worktree clean |
| not authorized | 任何 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，跳过已完成但仍 acceptance-gated 的能力。

## Previous Closed Slice W6.a6.20.11

| field | value |
| :--- | :--- |
| status | `done-local/clean; browser-readonly-pass/data-gated` |
| goal | 对齐 RN 首页搜索好友/群聊结果的关键词高亮，并保持聊天记录汇总行原有无高亮分支 |
| shared owner | SDK 继续持有缓存实体与搜索结果；本片 SDK 零源码改动 |
| H5 owner | helper 只按 RN 规则切分展示文本；结果行仅翻译为语义标签与品牌色，不新增查询或业务 owner |
| verification floor | focused H5 5/5；full verify：SDK Web 85 files/356 tests、466 assets、boundary、SDK/H5 typecheck、1091-module build；412px authenticated friend-highlight/message-no-highlight/zero-overflow；RN protected worktree clean |
| not authorized | 制造群搜索数据、任何 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择可真实只读证明或有明确 mutation 授权边界的缺口。

## Previous Closed Slice W6.a6.20.10

| field | value |
| :--- | :--- |
| status | `done-local/converged-owner-consumed; browser-readonly-pass/data-gated` |
| goal | 对齐 RN 首页全局搜索的 8 条消息分页、过期请求隔离和结果下拉重读，同时保持 shared search 单一 owner |
| shared owner | SDK `messages.searchCached({ keyword, limit, offset })` 继续持有当前账号、查询校验、可见正文过滤和 SQLite 结果分页；本轮 SDK 零源码改动 |
| H5 owner | 页面只持有 request generation、分页 UI、下拉手势和历史 preference；helper 只持有好友/群/消息 view projection 与跨页会话合并 |
| verification floor | focused H5 4/4；full verify：SDK Web 85 files/356 tests、466 assets、boundary、SDK/H5 typecheck、1091-module build；412px authenticated history/friend/message/zero-overflow；RN protected worktree clean |
| not authorized | 制造消息/群数据、发送或远端刷新 mutation、RN consumer rewrite、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择可真实只读证明或有明确 mutation 授权边界的缺口。

## Previous Closed Slice W6.a6.20.9

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass/data-gated` |
| goal | 让所有“已知群 ID 进入聊天”入口通过同一个 SDK owner 获取、校验并缓存规范群会话 |
| shared owner | `openIMGroupConversation` 持有 cache-first、真实 conversation ID 获取、Gateway identity fail-closed、latest/conversation 缓存事务与账号切换保护 |
| H5 owner | 我的群聊、共同群聊、查找群聊只持有 opening/error/React Router；不扫描会话列表、不猜 `sg_` ID、不映射 Gateway DTO |
| verification floor | SDK focused sql.js 4/4；full verify：SDK Web 85 files/356 tests、466 assets、boundary、SDK/H5 typecheck、1091-module build；browser 空态/console 证据；RN protected worktree clean |
| not authorized | 制造群数据、执行群申请/创建/发送 mutation、RN consumer convergence、RN/desktop builds、`build:package:desktop:web` |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择可真实只读证明或有明确 mutation 授权边界的缺口。

## Earlier Closed Slice W6.a6.20.8

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass/mutation-acceptance-gated` |
| goal | 对齐 RN 通讯录与验证消息的好友未读、群待审核角标和单条好友申请已读资料链 |
| shared owner | friend application facade 持有专用 unread、明确 IDs mark-read 与 fail-closed；group application facade 持有审核 `total` 语义 |
| H5 owner | 共用 hook 只编排两个 facade；通讯录/双 tab 复用 `0/99+` badge；好友行只持有资料路由和 success-triggered refresh |
| verification floor | SDK focused 2 files/15 tests；H5 focused 1/1；full verify：SDK Web 84 files/352 tests、466 assets、SDK/H5 typecheck、1091-module build；412px authenticated friend/group route、zero-overflow/console；RN protected worktree clean |
| not authorized | 点击真实申请、mark-read/accept/reject、非零群审核样本制造、RN consumer convergence、RN/desktop builds |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择可真实只读证明或有明确 mutation 授权边界的缺口。

## Earlier Closed Slice W6.a6.20.7

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass/mutation-acceptance-gated` |
| goal | 补齐 RN 个人资料头像编辑，同时保持个人资料与 onboarding 不同提交时序并收敛 H5 平台交互 owner |
| shared owner | `WebIMSync.profile.updateAvatar` 原子统一静态图片/10MB、Web OSS、上传阶段账号保护、avatar-only profile update 与响应身份；`uploadAvatar` 仅服务 onboarding 内存草稿 |
| H5 owner | `/me/profile` 只持有头像行、共用相册/拍照来源 sheet、文件 input、共享 Canvas crop 和 success-only 展示；不编排 Gateway 或 blob URL 成功态 |
| verification floor | SDK focused 1 file/8 tests；H5 focused 3 files/5 tests；full verify：SDK Web 84 files/349 tests、466 assets、SDK/H5 typecheck、1089-module build；boundary/diff-check；412px authenticated open/cancel；RN protected worktree clean |
| not authorized | 真实文件选择、OSS/profile mutation、刷新/第二终端回读、RN consumer convergence、RN/desktop build scripts |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择可真实只读证明或有明确 mutation 授权边界的缺口。

## Previous Closed Slice W6.a6.20.6

Onboarding 头像已完成 shared 上传 owner、共用来源/裁剪与内存草稿时序；有效新账号、真实上传/update 和响应式矩阵保持 acceptance-gated。

## Earlier Closed Slice W6.a6.20.5

群服务端搜索已完成 shared 三态 owner、独立 `/groups/search` route 和真实账号空态验收；真实可加入结果、申请与加入后 list-back 保持 data-gated。

## Earlier Closed Slice W6.a6.20.4

- shared owner:
  - `../im28-sdk/src/modules/message/composer-submission.ts` 只持有平台中立事实：有草稿且单选媒体时进入待发送态，编辑消息不得附带附件，一次提交按 `media -> file -> text` 排序。
  - H5 `useChatOutgoingMessageActions.sendSubmission` 在一个 `runMessageOperation` 内消费计划并复用现有 image/video/file/text/mention/quote facade；前序 reject 会阻断后续步骤。
- Web presentation:
  - `useChatComposerAttachments` 只持有浏览器 File input、校验和瞬时 pending state；普通文件始终等待显式发送，单媒体仅按 shared 判定等待。
  - `ChatComposerPendingFile` 复刻 RN 文件栏的名称、类别、大小与移除动作；`ChatComposerAttachmentControls` 集中附件面板和三个浏览器 input；媒体不新增 RN 不存在的顶部缩略图。
- evidence:
  - SDK focused `3/3`；H5 focused `3 files/10 tests`；`npm run verify` 通过 `84 files/343 tests + 466 assets + typecheck + 1081 modules`。
  - 412x820 真实单聊只选择仓库内测试文件：pending/移除/按钮门禁/零溢出/零 console error 均通过；未点击发送。
  - `im28-phone/src/**` 零改动；未运行 RN build/sync，未修改 desktop build scripts。
- residual:
  - 真实普通文件上传、带草稿单媒体组合发送、失败阻断及第二账号 realtime/list-back 仍需独立授权验收。

## Previous Closed Slice W6.a6.20.3

| field | value |
| :--- | :--- |
| status | `done-local/shared-owner-consumed` |
| goal | 补齐 RN 聊天附件“拍照/音视频通话”，保持相册、拍照、RTC、文件、名片顺序，不建立 Web-only 图片或通话业务链 |
| camera owner | H5 浏览器 input 只持有 `capture=environment` platform I/O；选择结果进入既有 album MIME/size 校验与 `messages.sendImage` owner |
| RTC owner | `CallTypeActionSheet` 是联系人/聊天共享纯 UI；ChatPage 只传 canonical conversation 展示快照并调用唯一 `WebIMCallProvider`，鉴权/信令/LiveKit 继续由 SDK/Web platform owner 持有 |
| visibility | RTC 只在 `Conversation.type=single` 显示，群聊 fail-closed 隐藏；拍照对单聊/群聊均可用 |
| verification floor | H5 focused 3 files/10 tests、typecheck；full verify：SDK Web 83 files/340 tests、466 assets、1078-module build；412x820 authenticated action order/sheet/camera-contract/zero-overflow/zero-console；RN worktree clean |
| not authorized | camera chooser/permission、真实图片上传发送、语音/视频 final selection、Gateway call、LiveKit room、second-account RTC、RN 业务修改 |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN page/action/state 与 H5 route/owner 交叉检索，优先选择真实 API/平台能力齐备且无副作用的下一条缺口。

## Previous Closed Slice W6.a6.20.2

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 补齐 RN 聊天附件“名片”：用户/群选择、当前会话 type108 发送和失败重试，不复用语义不同的联系人跨会话分享 API |
| shared owner | SDK `message-card-send.ts` 校验 user/group card、冻结展示快照并复用统一 `sending -> sent/failed`、Gateway、SQLite 状态机；type108 可从持久化 payload 重试 |
| H5 owner at close | 当时由 `ChatCardPickerDialog` 复用好友/群 cache-first source；该 presentation owner 已被 `.84` supersede，当前唯一路径为 `ChatPage -> ChatTargetPickerModal(single)` |
| compatibility | 隐藏发送人转发继续拒绝 type108，失败重试支持矩阵与转发支持矩阵显式解耦；RN 现有 `sendCardMessage` 路径冻结不改 |
| verification floor | SDK focused 3 files/11 tests、Web full 83 files/340 tests；H5 focused 2 files/5 tests、466 assets/typecheck/1074-module build；412px authenticated user/group/search/select/disabled/zero-overflow proof；RN worktree clean |
| not authorized | 最终发送点击、第二账号 realtime/list-back、真实失败重试、拍照/RTC 附件入口、RN consumer convergence |

该 residual 已由 `.20.3-chat-composer-camera-rtc-entries` 关闭；`.20.4` 继续关闭附件待发送/组合提交偏差，下一片继续全局 RN parity inventory。

## Previous Closed Slice W6.a6.20.1

| field | value |
| :--- | :--- |
| status | `done-local/rn-parity` |
| goal | 修复账号登录“忘记密码”用错误文案代替 RN 交互的问题；Gateway 端点已下线时只提供手机号/邮箱替代登录和客服说明 |
| owner | H5 `ForgotPasswordMethodsDialog` 复用全局 `InteractionModal`；手机号/邮箱使用既有 `/auth/phone`、`/auth/email` 路由，SDK 无新增 API |
| platform boundary | RN 网络设置依赖原生 HTTP/OpenIM HTTP/SOCKS proxy；浏览器 `fetch/WebSocket` 无等价 per-app proxy 注入，登记 `web-not-applicable`，禁止创建保存后不生效的假设置 |
| verification floor | H5 focused 2 files/6 tests + full verify：SDK Web 82 files/337 tests、466 assets/typecheck/1071-module build；412px phone/email/support branches、modal replacement、route cleanup、zero overflow；退出后已恢复 donk 当前账号 |
| not authorized | 忘记密码 API、客服请求、密码修改、验证码请求、浏览器代理注入、RN 业务修改 |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；继续按 RN 页面入口、交互、状态和真实 API 对照，优先处理仍缺失且 Web 有真实等价能力的下一项。

## Previous Closed Slice W6.a6.18.3.19

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 对齐 RN 二维码“发送给好友/群”语义，统一个人/群二维码的应用内图片分享，不用 Web Share 替代业务动作 |
| shared owner | 既有 `WebIMSync.contacts/groups/conversations/peerProfile/messages.sendImage`；SDK 无新增业务路径 |
| H5 owner | `forward-target-source` 统一普通转发与二维码分享的 cache-first 目标加载、投影和真实会话解析；`QRCodeSharePage` 只保留 React Router、RN `cardShare` 同源多选 UI 与显式确认 |
| route/data contract | `/me/qrcode/share`、`/conversations/:conversationID/settings/qrcode/share`；路由仅携带稳定来源 ID，确认后从 shared payload 生成 320x320 PNG，不跨路由携带 Blob/消息正文/凭据 |
| verification floor | H5 focused 6 files/13 tests + full verify：SDK Web 82 files/337 tests、466 assets/typecheck/1070-module build；412px authenticated friend/group tabs、single-select、disabled gate、safe return、zero overflow；RN source zero change |
| not authorized | 最终“分享”点击、真实 PNG 上传/消息发送、第二账号 realtime/list-back、RN consumer convergence |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；重新按 RN 页面入口、交互、状态和真实 API 检索未迁移功能，优先选择不修改 RN 业务且可独立验收的下一条垂直切片。

## Previous Closed Slice W6.a6.18.3.18

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 从 RN 群资料层级补齐群二维码 SPA 展示，并将个人/群 Canvas、PNG 下载和 Web Share 收敛为同一 H5 platform owner |
| shared owner | `../im28-sdk/src/modules/qr-code/buildIM28GroupQRCodePayload` + 既有 `WebIMSync.conversations/groups` |
| production consumer | `/conversations/:conversationID/settings/profile` -> `/settings/qrcode`；`/scan` 可严格返回同一群二维码 route |
| platform owner | `QRCodeDisplay` + `browser-qr-image`；用户/群共用高纠错 Canvas、头像 fallback、导出/分享和 async cleanup |
| verification floor | H5 focused 5 files/13 tests + full verify：SDK Web 82 files/337 tests、466 assets/typecheck/1067-module build；412px personal QR zero-overflow + missing-group fail-visible；RN source zero change |
| data gate | 已由 `.20.139` 使用真实群 `donk的群聊 / 97524759106` 关闭；实际下载/Web Share/扫码/发送仍保持门禁 |
| not authorized | 实际下载/Web Share、应用内图片消息发送、物理扫码、群申请/群 mutation、RN consumer convergence |

Next bounded slice: `W6.a6.18.3.19-qrcode-in-app-share`；已由上方 latest slice 关闭。

## Previous Closed Slice W6.a6.18.3.17

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 复用 shared 用户二维码 payload，在 H5 交付 RN 对应的个人二维码展示、PNG 下载与浏览器文件分享，页面不复制二维码协议 |
| shared owner | `../im28-sdk/src/modules/qr-code/buildIM28UserQRCodePayload` + `WebIMSync.profile.getCurrent` |
| production consumer | `/me`、`/me/profile`、`/scan` -> `/me/qrcode`；React Router state 只保存白名单返回来源 |
| platform owner | H5 `qrcode` Canvas renderer；高纠错等级、居中头像 fallback、同一 Canvas PNG 下载/Web Share、unsupported fail-visible |
| verification floor | H5 focused 5/5 + full verify：SDK Web 82 files/337 tests、466 assets/typecheck/1064-module build；412x786/1280x800 authenticated zero-overflow；RN source zero change |
| not authorized | 实际下载/系统分享弹窗、物理相机/相册识别、好友/群申请 mutation、RN consumer convergence |

Next bounded slice: `W6.a6.18.3.18-group-qrcode-display`；复用 shared group payload 与现有群详情/cache owner，从群设置补齐只读群二维码展示，不执行分享、申请或群 mutation。

## Previous Closed Slice W6.a6.18.3.16

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | IM28 二维码协议归 shared SDK；H5 用浏览器 adapter 承担解码/权限/cleanup，并接入既有用户资料和真实公开群申请链 |
| shared owner | `../im28-sdk/src/modules/qr-code` + `GatewayHTTPClient.getPublicGroup` + `WebIMSync.groupApplications.getPublicGroup/apply` |
| production consumer | 首页 `HomeActionMenu -> /scan`；用户码 -> `/contacts/users/:userID`；群码 -> `/groups/:groupID/apply` |
| verification floor | SDK focused 9/9 + Web 82 files/337 tests + build:web/sync:web；H5 focused 7/7 + typecheck/1031-module build；412x786 no-permission readonly；RN source zero change |
| not authorized | physical camera permission、album chooser、real QR decode、friend/group mutation、second-account list-back、RN consumer convergence |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；按 RN 页面/入口/状态/真实 API 重新检索 H5 遗漏，选择下一条非破坏性垂直切片。

## Previous Closed Slice W6.a6.18.3.15.2

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 语音群发复用普通音频 prepared owner 与 H5 现有 MediaRecorder/按住说话 owner，不建立第二套录音或 body 逻辑 |
| shared owner | `../im28-sdk/src/sync/message-audio-send.ts` + `message-broadcast*.ts` + `WebIMSync.messageBroadcast.sendAudio` |
| production consumer | `/broadcast/compose` -> `useChatVoiceRecorder` -> `ChatVoiceInput` -> `sendAudio` |
| verification floor | SDK focused 9/9 + full 82 files/335 tests + build:web/sync:web；H5 recorder 6/6 + 466 assets/typecheck/797-module build；412x786 mode toggle；RN source zero change |
| not authorized | microphone permission、record/upload/send、second-account realtime/list-back、RN business convergence |

Next bounded slice: `W6.a6.18.3.16-qr-scanner-platform-contract`；冻结浏览器 HTTPS/camera permission/decoder/route payload 与 cleanup，先不请求摄像头权限。

## Previous Closed Slice W6.a6.18.3.15.1

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 图片/视频/文件群发复用普通消息媒体 owner，整批只上传一次并只 batch-send 一次，H5 只保留浏览器 I/O 和结果 UI |
| shared owner | `../im28-sdk/src/sync/message-broadcast*.ts` + `prepareWebIMImage/Video/FileUpload` + `WebIMSync.messageBroadcast` |
| production consumer | `/broadcast/compose` -> `sendImage/sendVideo/sendFile`；页面复用聊天 attachment/video metadata helper |
| verification floor | SDK focused 6/6 + full 82 files/334 tests + build:web/sync:web；H5 helper 8/8 + 466 assets/typecheck/796-module build；412x786 authenticated media actions、zero overflow/console；RN source zero change |
| not authorized | final file selection/upload/send、second-account realtime/list-back、RN business convergence |

Next bounded slice: `W6.a6.18.3.15.2-message-broadcast-voice`；复用 shared audio upload/body owner，Web 只实现 MediaRecorder/按住说话与临时预览，不请求真实权限或发送。

## Previous Closed Slice W6.a6.18.3.15

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 文本群发由 shared owner 单批执行并逐目标收敛，H5 只保留好友/群选择、文本编辑和 SPA 导航，RN 保持冻结 |
| shared owner | `../im28-sdk/src/sync/message-broadcast.ts` + `message-broadcast-result.ts` + `WebIMSync.messageBroadcast` |
| production consumer | 会话/通讯录 `HomeActionMenu` -> `/broadcast/select` -> `/broadcast/compose` -> `runtime.getSync().messageBroadcast.sendText` |
| verification floor | SDK sql.js 3/3 + full 82 files/331 tests + typecheck:web/build:web；H5 route/view 4/4 + 466 assets/typecheck/793-module build；412x786 authenticated selection/compose/exit、zero overflow/console；RN source zero change |
| not authorized | final send、second-account realtime/list-back、RN business convergence |

Next bounded slice: `W6.a6.18.3.15.1-message-broadcast-media-contract-refresh`；追踪 RN 图片/视频/文件群发并复用现有 shared upload/body/checkpoint owner，不执行真实发送。扫码作为独立浏览器 platform slice 后续处理。

## Previous Closed Slice W6.a6.18.3.14

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 发起群聊由 shared owner exactly-once 执行并原子缓存服务端群/会话，H5 只保留好友选择和 SPA 导航，RN 保持冻结 |
| shared owner | `../im28-sdk/src/sync/group-creation.ts` + `WebIMJoinedGroupSync.create` + `GroupRepository.applyCreation` |
| production consumer | 会话/通讯录 `HomeActionMenu` -> `/groups/create` -> `runtime.getSync().groups.create` |
| verification floor | SDK creation 4/4、creation+lifecycle 10/10、typecheck:web；H5 creation+lifecycle view 6/6、typecheck/build；RN source zero change |
| not authorized | final create、second-account member/realtime/list-back、RN business convergence |

该 residual inventory 已由 `.15-message-broadcast-text` 关闭；下一片进入媒体群发合同，不执行真实发送。

## Previous Closed Slice W6.a6.18.3.13.6

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 普通成员退群、群主解散由 Web shared owner exactly-once 执行，远端成功后原子删除群域缓存，H5 只保留确认与导航，RN 保持冻结 |
| shared owner | `../im28-sdk/src/sync/group-lifecycle.ts` + `createIMGroupLifecycleSync` + `GroupRepository.removeLifecycleState` |
| frozen contract | cached group/current member/shared capability -> one leave/dismiss Gateway write -> strict group response -> attachments/messages/group conversations/members/group transaction -> `local\|remote-only`；no replay |
| production consumer | `/conversations/:conversationID/settings` -> `runtime.getSync().groupLifecycle`；shared capability 决定退出/解散入口 |
| verification floor | SDK group-management related 27/27 + Web typecheck/build:web/sync:web；H5 focused 12/12 + typecheck/build；RN source zero change |
| not authorized | final leave/dismiss、server-denial sample、second-account realtime/list-back、RN business convergence |

Next bounded slice: `W6-rn-parity-residual-inventory-refresh`；按 RN 功能域/caller/页面/状态重新生成剩余缺口，不执行 mutation，不改 RN 业务逻辑。

## Previous Closed Slice W6.a6.18.3.13.5

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 群设置、群禁言与成员禁言由 Web shared owner exactly-once 执行，H5 只保留 SPA presentation，RN 保持冻结 |
| shared owner | `../im28-sdk/src/sync/group-settings-mute.ts` + `createIMGroupManagementSync` |
| frozen contract | field capability/target preflight -> one explicit Gateway patch -> strict group/member identity merge -> `local\|remote-only`；no replay |
| production consumer | `/settings/manage`、`/settings/manage/mute`、`/settings/manage/speech-frequency` -> `runtime.getSync().groupManagement` |
| verification floor | SDK focused 28/28 + Web typecheck/build；H5 focused 14/14 + typecheck/build；RN source zero change |
| not authorized | final toggle/mute、server-denial sample、second-account realtime/list-back、RN business convergence |

该切片已由上方 `.13.6-group-lifecycle` 关闭；当前 next bounded slice 为 `W6-rn-parity-residual-inventory-refresh`。

## Latest Closed Slice W6.a6.18.3.13.4

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | 管理员设置/取消与群主转让由 Web shared owner exactly-once 执行，H5 只保留 SPA presentation，RN 保持冻结 |
| shared owner | `../im28-sdk/src/sync/group-admin-owner.ts` + `createIMGroupMentionSync.setAdmins/cancelAdmins/transferOwner` |
| frozen contract | owner/capability/target/admin-limit preflight -> one Gateway write -> group/member transaction -> independent authoritative refresh；no replay |
| production consumer | `/conversations/:conversationID/settings/manage` -> `runtime.getSync().groupMembers`；候选过滤也消费 shared helper |
| verification floor | SDK related 16/16 + new 4/4 + build:web/typecheck；H5 focused 11/11 + typecheck/build；RN source zero change |
| not authorized | final admin/owner mutation、second-account realtime/list-back、RN business convergence |

该切片已由上方 `.13.5-group-settings-and-mute` 关闭，且 `.13.6-group-lifecycle` 已继续关闭；当前 next bounded slice 为 `W6-rn-parity-residual-inventory-refresh`。

## Latest Closed Slice W6.a7.1

| field | value |
| :--- | :--- |
| status | `done-local/visual-data-gated` |
| goal | H5 建立轻量 route/bubble/TabBar/modal 交互基础，不改变 RN 视觉层级或共享业务 owner |
| owner | `apps/web/src/components/interaction/**`；feature 页面只传受控状态与关闭回调 |
| production consumer | `App -> RouteMotionController`；`ChatMessageList -> useTailItemMotion`；`PrimaryTabBar` selected CSS；`ConversationDeleteSheet -> InteractionModal` |
| frozen contract | no remount、main-only route entry、history-prepend no animation、native dialog focus/inert/Esc/backdrop、reduced-motion zero animation |
| verification floor | H5 typecheck/build + 466 assets + authenticated React Router tabs/zero-console + 390x844 zero-overflow |
| residual | 当前登录账号会话为空，真实会话 delete modal 与 realtime appended bubble 视觉证据 data-gated；不制造/删除真实数据 |

该 presentation slice 后续已由 `.13.4-admin-owner`、`.13.5-settings-mute` 和 `.13.6-group-lifecycle` 关闭；当前 next bounded slice 为 `W6-rn-parity-residual-inventory-refresh`。

## Previous Closed Slice W6.a6.18.3.13.3

| field | value |
| :--- | :--- |
| status | `shared-core-ready/web-consumed/rn-frozen` |
| goal | Web 群成员邀请由 shared owner 按服务端审核开关选择唯一 endpoint；H5 只保留交互，RN 业务保持冻结基线 |
| shared owner | `../im28-sdk/src/sync/group-member-invitation.ts` + `createIMGroupMentionSync.inviteMembers`；Gateway facade 对齐批量 application response |
| source anchor | RN 好友权限/成员过滤与反馈；OpenAPI `/group/application/invite`、`/group/member/invite`；shared permission/contact/member DTO |
| frozen contract | preflight -> exactly one application/direct invite -> strict response -> independent member refresh；远端成功后禁止邀请重放 |
| verification floor | SDK 17/17 + typecheck/boundary/build:web；RN whole-worktree zero diff；H5 10/10 + typecheck/build + dev-pc smoke |
| not authorized | final invite、第二账号 application/member realtime/list-back、RN business convergence |

Next bounded slice: `W6.a6.18.3.13.4-admin-owner-contract-core`；冻结管理员设置/取消与群主转让的 exactly-once 合同，RN 只读不改；不执行真实 mutation。

| field | value |
| :--- | :--- |
| status | `active` |
| active_slice | `W6-closeout-external-acceptance-gates` |
| verification_floor | `existing production path -> authorized real Network/cache/list-back/browser/device evidence；no fixture, fake success, second writer or RN business change` |

## Closed Slice W6.a6.20.69

| field | value |
| :--- | :--- |
| source_truth | RN 群设置用 `currentMember && roleLevel !== normal` 展示公告卡；详情页再独立限制发布权限 |
| target_owner | H5 `buildChatSettingsView` 读取 matching `WebIMJoinedGroup.currentUserRole`；公告编辑仍由 `canEditAnnouncement` owner 决定 |
| expected_change | owner/admin 即使 `canEditAnnouncement=false` 仍可进入只读公告页；member 即使异常 capability=true 也不显示设置入口 |
| stop_condition | 不发布/标记已读公告，不修改 shared DTO/permission fallback，不改 RN/desktop，不执行真实角色或群资料 mutation |
| acceptance | view matrix、页面 wiring regression、H5/SDK Web full gates、RN protected diff、cleanup 与自然账号只读浏览器证据或 data gate |
| closeout | `done-local/clean`；owner/admin/member/unrelated matrix、full gates 与 protected diff 通过；自然角色像素保持 data gate |

## Workstream Ledger

| workstream | scope | owner | expected deliverable | verification | status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `W1` | 基线与执行治理 | docs | H5 SSOT 与 active trio | 文档交叉核对 | `done` |
| `W2` | workspace 与 Web SDK 基础 | web app + sdk | 可安装、可构建、可启动骨架 | `npm run verify`; browser smoke | `done` |
| `W3` | Gateway runtime | sdk runtime | 真实认证与连接链路 | targeted tests + manual smoke | `gated` |
| `W4` | 会话与文本消息 | feature + sdk | 核心聊天 MVP | tests + real flow smoke | `gated` |
| `W5` | 生产化门禁 | storage/runtime | Worker、多标签页与恢复策略 | browser matrix + regression | `gated` |
| `W6` | RN 页面 parity | web feature + sdk facade | RN 样式/资产/行为/API 的 React Router SPA 迁移 | source trace + visual/route/API evidence | `active` |
| `W6.a6.12.1` | cross-runtime convergence | shared SDK + RN/Web composition | consumer matrix、neutral facade、RN/Web actual-call adoption、compat exit register | shared tests + runtime boundary + RN/Web caller evidence | `done-local/acceptance-gated` |
| `W6.a6.19-chat-message-presentation-parity` | code/verification | shared SDK display-name resolver + H5 chat projection/layout | sender/mention display、image ratio/OSS decode fallback、voice duration width、forwarded-message hierarchy without duplicating SDK identity rules | H5 focused 5/22 + SDK 59/204 + full verify + authenticated DOM/layout proof | `done-local/acceptance-gated` |
| `W6.a7.1-lightweight-interaction-foundation` | code/architecture/verification | H5 presentation components | route/message/TabBar motion tokens + native modal lifecycle + reduced-motion without second business owner | H5 typecheck/build、466 assets、authenticated tab route/zero-console、390x844 zero-overflow | `done-local/visual-data-gated` |

## Active / Pending Slice Queue

| item | type | owner | target output | verification | status | next activation rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `W2.a1` | code/docs | workspace + sdk + app | npm workspace、`@im28/im-sdk/web`、Vite React Router App | `npm run verify`; browser smoke | `done` | closed 2026-08-09 |
| `W2.a2-unified-multi-runtime-sdk` | architecture/refactor | `im28-sdk` + RN/H5 consumers | single npm package、shared `src/sync`、isolated RN/Web/Desktop entries、app-local SDK removal | SDK typecheck/29 files 89 tests/build:all/pack dry-run + RN tsc + H5 verify | `done` | closed 2026-08-10；Desktop concrete driver remains Electron-app choice |
| `W2.closeout` | verification/docs | docs + workspace | 状态、架构、cleanup 和证据回写 | trio consistency + root gate | `done` | closed 2026-08-09 |
| `W3.a1` | contract/design | sdk runtime | Gateway runtime contract、auth/token owner 与配置边界 | 4 test files / 11 tests + workspace verify | `done` | closed 2026-08-09 |
| `W3.a2-local` | code/verification | sdk runtime + storage | browser auth/realtime、account SQLite lifecycle、privacy gate | shared SDK test + H5 25 tests + Chromium SQLite smoke | `done` | closed 2026-08-09 |
| `W3.real-gateway-readonly` | deployment verification | sdk runtime + deployment | real phone-code login、refresh restore、Gateway-backed reads、two-account tab isolation and WS online | authenticated browser smoke + token-free lifecycle/list/error evidence | `passed-partial` | closed 2026-08-12；shared device-ID collision reproduced/fixed；30s sample 19/20 dual-online + one simultaneous recovered reconnect；no send/mutation |
| `W3.real-gateway` | deployment verification | sdk runtime + deployment | authoritative realtime delivery/list-back and offline SQLite cache-hit evidence | explicitly authorized dual-account event + non-destructive offline harness | `passed-partial` | text delivery/SQLite convergence/list-back passed 2026-08-14；offline isolation remains |
| `W3.closeout` | verification/docs | sdk runtime + docs | real smoke evidence、架构与 trio 回写 | `npm run verify` + real Gateway smoke | `planned` | `W3.real-gateway` passed |
| `W4.a0` | contract/code | shared sdk + web sdk | 三操作 contract 与唯一 Gateway DTO -> core mapper | pure mapping tests + shared SDK build | `done` | closed 2026-08-09 |
| `W4.a1-conversations` | code | web sdk runtime | cache list、Gateway full sync、latest message persistence | 3 focused sql.js/Repository tests | `done` | closed 2026-08-09 |
| `W4.a1-history-send` | code | web sdk runtime | cache history、remote pull、optimistic text send | 3 message sync tests + workspace verify | `done` | closed 2026-08-09 |
| `W4.a1-ui` | code | web app | React Router conversation/message default caller | build + desktop/mobile config/login smoke | `done-local` | authenticated real flow still gated |
| `W4.a2-created-conversation` | code/verification | web sdk runtime | 新消息/会话事件落库、账号隔离、分页 HTTP 缺口恢复与 UI cache 刷新 | 5 focused tests + workspace verify | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-updates` | contract/code | web sdk runtime | 消息编辑、撤回、删除的 cursor 与 Repository 状态收敛 | sql.js + raw WebSocket integration | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-serialization` | architecture/code | web sdk sync | full sync/history/send/realtime 共享业务 operation queue | 3 delayed interleaving/failure regressions | `done-local` | closed 2026-08-09; real gate retained |
| `W4.a2-closeout` | verification/docs | web sdk runtime + docs | W4.a2 证据、残留项与下一片回写 | `npm run verify` + real chat smoke | `passed-real-text` | local closeout plus real text send/realtime/cache/list-back passed；offline/cross-browser/non-text remain separate |
| `W5.a1-storage-boundary` | architecture | storage/runtime | Dedicated Worker RPC、lifecycle Web Lock 与 failure contract | architecture review + executable test plan | `done` | closed 2026-08-09 |
| `W5.a2-worker-runtime` | code/verification | storage worker | typed RPC/client、Worker-owned sql.js/IndexedDB、fatal-state discard | 7 adapter/protocol tests + 18/47 workspace verify + Worker build | `done-local` | closed 2026-08-09 |
| `W5.a3-multi-tab-writer` | code/verification | storage lifecycle | account-scoped lifecycle Web Lock、busy/unsupported UI state | 6 lock/lifecycle tests + 19/52 verify | `done-local` | closed 2026-08-09 |
| `W5.a3-browser-matrix` | deployment verification | storage runtime | real Worker/IndexedDB/Web Locks two-tab close/crash evidence | Chromium/Firefox/Safari matrix | `blocked-environment` | target browser harness available |
| `W5.a4-storage-operations` | code/verification | storage/runtime | quota、compaction、corruption rebuild workflow | large-history/quota/recovery evidence | `planned` | W5.a3 passed |
| `W6.a0-migration-contract` | contract/docs | docs + RN source inventory | 样式、资产、SDK/API、React Router 四类硬约束与验收门 | source-path cross-check | `done` | closed 2026-08-09 |
| `W6.a1-assets-theme` | code/docs | web styles/assets | 466 文件字节镜像、SHA-256 gate、完整 RN light/dark token foundation | `npm run assets:check`; CSS/source review | `done-foundation` | closed 2026-08-09 |
| `W6.a2-account-login-parity` | code/verification | web login + sdk facade | RN 账号登录布局、资产、协议状态、真实登录/条款 caller | 466 assets + 20/55 verify + dark mobile interaction/refresh/live-term smoke | `done-local/acceptance-gated` | exact viewport/theme + real login evidence available |
| `W6.a3-conversation-parity` | code/verification | web conversations + sdk facade | RN home shell/conversation list parity | 390x844 light/dark + 760px responsive + auth guard + cache composition test + verify | `done-local/acceptance-gated` | real account cache/sync/chat-back evidence available |
| `W6.a3.1-conversation-list-interaction-parity` | code/verification | web conversations + shared SDK + RN composition | dedicated global search route、long-press/right-click actions、pull-to-refresh and one shared read/unread/archive state machine | SDK 59/203 + RN 190 focused tests/typecheck + H5 focused tests/full verify + authenticated Chromium layout/route/menu proof | `done-local/mutation-acceptance-gated` | real mutations、physical touch、Safari/Firefox remain explicit gates |
| `W6.a3.2-archived-conversation-route-parity` | code/convergence/verification | shared SDK + RN/Web composition + H5 route | shared archive full pagination/snapshot、normal/archive cache isolation、RN caller convergence、main entry and `/conversations/archived` cache pagination/search/pull/menu | SDK all-runtime + 12/12 + build:rn/build:web；RN tsc/2；H5 verify 70/273 + authenticated real row/entry/layout/console proof | `done-local/mutation-acceptance-gated` | closed 2026-08-12；cancel/delete、second-account list-back、physical touch and cross-browser remain |
| `W6.a4-chat-parity` | code/verification | web chat + sdk facade | RN header/message list/composer parity | 390x844 light/dark + 760x900 responsive + guest guard + existing sync chain review + verify | `done-local/acceptance-gated` | approved account history/send/realtime/list-back evidence available |
| `W6.a5.1-auth-entry-routes` | code/verification | web login + sdk runtime | phone/email/account/register RN parity、real auth facades and route switching | 21/58 verify + 390x844 dark + 760x900 + deep-link/back/forward + no-fake audit | `done-local/acceptance-gated` | real account/phone/email smoke、send-code contract and light-mode proof available |
| `W6.a5.2-remaining-auth-tab-routes` | design/code/verification | web app routes + features | invite/profile/network and contacts/calls/me as bounded route slices | source/API/route ledger, then per-slice deep-link/back/forward/auth-guard matrix | `active` | continue child slices through the shared tab shell owner |
| `W6.a5.2.1-contacts-core` | code/verification | web contacts + sdk facade | RN contact list, real paged friend operation, local search/group/index and `/contacts` guard | original 22/60 gate + `.17.2.2` cache + `.1.1` Pinyin authenticated 7-row proof | `done-local/acceptance-gated` | cache-first and Pinyin paths closed；active next: broader responsive/theme/route acceptance |
| `W6.a5.2.1.1-contact-pinyin-index-parity` | code/verification | web contacts presentation | RN `pinyin-pro@3.28.1` surname-mode Chinese index with unchanged SDK order and `#` fallback | 4 focused tests + H5 35/120 + full verify + authenticated 458x786 A/D/Z/H proof | `done-local/acceptance-gated` | closed 2026-08-11；dictionary-in-main debt closed by `.1.2` |
| `W6.a5.2.1.2-contact-route-code-split` | code/verification | web React Router + contacts presentation | lazy `/contacts` route, accessible loading state and dictionary-free search filter | H5 36/122 + full verify + production chunk comparison + authenticated tab navigation/overflow/console proof | `done-local/acceptance-gated` | closed 2026-08-11；global main chunk remains a separate app-wide performance debt |
| `W6.a5.2.1.3-contact-verification-route-parity` | code/verification | web contacts routing + existing application facades | RN 单一“验证消息”入口、好友/群聊双 tab、旧深链重定向和单群审核详情返回 | SDK Web 59/204 + H5 typecheck/build/full verify + authenticated real 5-row/empty read + 390x844/760x900 route/overflow/console proof | `done-local/mutation-gated` | closed 2026-08-12；pending friend、non-empty group、unread badges and approved audit mutations remain |
| `W6.a5.2.1.4-contact-list-interaction-contract-freeze` | code/contract/verification | web contacts + shared SDK reads | cache-first、下拉刷新、RN 索引顶部/活动态和联系人长按四动作 owner 冻结 | pull contract 2/2 + SDK Web 59/204 + full verify + authenticated 390x600 route/index/overflow/console proof | `done-local/action-facade-gated` | closed 2026-08-12；physical touch、offline block、drag index and cross-browser remain acceptance gates |
| `W6.a5.2.1.5-contact-action-shared-facade-convergence` | contract/refactor | shared SDK + RN/Web composition | 将发消息、音视频、分享名片、删除好友逐项归类为 neutral facade/platform adapter，并移除 RN 应用内重复业务 owner | RN caller + SDK gateway/export/consumer matrix + focused tests + all-runtime boundary | `done-local/acceptance-gated` | all four H5 actions consume converged owners；real mutations/RTC remain gated |
| `W6.a5.2.1.5.1-shared-friend-delete-core` | code/convergence | shared SDK + RN/Web composition | one Gateway friend delete -> success-only friendship/direct-conversation/message transaction -> platform event projection | SDK real sql.js 3/3 + all-runtime typecheck/boundary + build:rn/build:web + RN 2 focused/tsc + H5 typecheck/build | `done-local/destructive-acceptance-gated` | closed 2026-08-12；no real delete；legacy RN delete Gateway owner and second conversation deletion removed |
| `W6.a5.2.1.5.2-shared-user-card-core` | code/convergence | shared SDK + RN/Web composition | normalized target set -> one Gateway card share -> shared direct-open/type101 optional note -> platform event projection | SDK contact/peer 10/10 + all-runtime typecheck/boundary + build:rn/build:web + RN 5 focused/tsc + H5 typecheck/build | `done-local/mutation-acceptance-gated` | closed 2026-08-12；no real share/send；legacy RN Gateway/helper orchestration removed |
| `W6.a5.2.1.5.3-web-rtc-platform-adapter-contract` | contract/design | shared call contract + Web media/runtime | start/token/refresh/hangup shared truth、LiveKit browser adapter、permission/device/route lifecycle and failure boundaries | RN/Gateway/source trace + browser dependency/runtime decision + anti-fake review | `done-local/call-acceptance-gated` | shared control、real Web media port and H5 outgoing route closed；real dual-account call remains gated |
| `W6.a5.2.1.5.3.1-shared-rtc-control-convergence` | code/convergence | shared SDK + RN/Web composition | one auth/ID/credential/E2EE owner for start/answer/reject/cancel/hangup/token refresh；remove RN duplicate control helpers | SDK 3 files/11 tests + all-runtime typecheck/boundary + RN composition/outgoing projection tests + RN tsc | `done-local/call-acceptance-gated` | closed 2026-08-12；no real call operation、permission or room connection |
| `W6.a5.2.1.5.3.2-web-livekit-media-runtime-adapter` | contract/code | Web platform media/runtime + H5 route | real browser LiveKit room adapter、permission/device lifecycle、token refresh/reconnect、terminal cleanup and visible failure state | dependency/source trace + injected lifecycle tests + typecheck/build + non-mutating route proof | `done-local/call-acceptance-gated` | no real call/permission；incoming call and ringtone are separate slices |
| `W6.a5.2.1.5.3.2.1-web-call-media-session` | code/contract | SDK Web platform media | injected connect/track/participant/reconnect/autoplay/terminal state machine with no token snapshot or fake room | SDK 3 focused files/14 tests + Web typecheck + boundary/build + route-exit race guard | `done-local` | closed 2026-08-12；does not request permission or instantiate LiveKit |
| `W6.a5.2.1.5.3.2.2-web-livekit-client-port` | code/integration | SDK Web port + H5 runtime/route | instantiate real LiveKit Room、map RoomEvent、permission/device lifecycle、token refresh and route cleanup | dependency install + 4 media files/20 tests + call/runtime focused 8/39 + all-runtime typecheck/boundary + build:web sync + H5 typecheck/build + authenticated non-mutating route proof | `done-local/call-acceptance-gated` | closed 2026-08-12；no real start/permission/room；dynamic RTC chunk；RN/Desktop and desktop:web script untouched |
| `W6.a5.2.1.5.4-contact-action-menu-ui` | code/verification | H5 contacts + existing shared/platform owners | RN four-action long-press menu backed by direct-conversation facade、Web RTC adapter、shared card send and shared friend delete | contacts 9 files/34 tests + typecheck/build + authenticated 7-contact read-only menu proof | `done-local/mutation-acceptance-gated` | closed 2026-08-12；no action clicked；physical touch/cross-browser and real write/RTC results remain gated |
| `W6.a5.2.1.5.6-friend-source-convergence` | code/convergence/verification | shared SDK + RN/H5 profile/application/search callers | Gateway source DTO、one inference/display owner、H5 source row and full-width profile rows | SDK 7/7 + all-runtime/build:rn/build:web + RN tsc/16 + H5 11/typecheck/build + authenticated real-profile geometry | `converged/read-only-accepted` | closed 2026-08-12；no mutation/call/permission；cross-browser/dark remain gated |
| `W6.a5.2.1.5.7-incoming-call-ringtone-contract` | contract/design/convergence | RN incoming RTC + shared call control + Web platform call lifecycle | freeze realtime offer/invite、ringing state、ringtone/autoplay、answer/reject/timeout/route cleanup ownership；shared strict parser + RN adoption | SDK 18/18 + all-runtime/build:rn/build:web + RN tsc/76 focused | `done-local/web-consumer-pending` | closed 2026-08-12；no real call, answer, media permission or ringtone playback |
| `W6.a5.2.1.5.7.1-incoming-call-runtime-core` | code/convergence | shared call lifecycle + Web runtime | event ID/call ID state transition、realtime process subscription、pending restore and account cleanup without persistence | SDK 8 files/37 + final 4/16 + all-runtime boundary + build:web + H5 typecheck/build | `done-local` | closed 2026-08-12；no real call/permission/ringtone；incoming UI follows `.5.7.2` |
| `W6.a5.2.1.5.7.2-incoming-call-web-ui-ringtone` | code/integration | H5 global call provider + SDK Web platform audio/media | runtime snapshot projection、foreground pending refresh、banner/fullscreen/draggable floating、ringtone/autoplay recovery、lazy-media answer/reject、remote-terminal cleanup | SDK all-runtime + 22/22 + final 15/15 + build:web；H5 typecheck + UI/tone 6/6 + build + authenticated cold zero-overlay/zero-console smoke | `done-local/real-call-acceptance-gated` | closed 2026-08-12；no real call/ringtone/permission；`build:package:desktop:web` untouched |
| `W6.a5.2.2-primary-tab-shell` | code/verification | web app layout + global component | RN 4-tab global shell, real unread badge, nested conversation/contact/calls routes and child-page exclusion | 390x844/760x900 light/dark + click/back/forward/reload + chat-detail exclusion + 22/60 verify | `done-local/acceptance-gated` | me real route + application badge owner + calls/overall safe-area/cross-browser evidence |
| `W6.a5.2.3-calls-core` | code/verification | web calls + sdk facade | RN 通话记录 cache/sync/delete 与 `/calls` 主标签页 | source/tests + real 2-row filters + 390x844/760x900 light/dark zero-overflow proof | `accepted-readonly/mutation-gated` | delete and non-missed/duration data remain；Safari/Firefox joins W5 browser matrix |
| `W6.a5.2.3.1-call-detail-shared-convergence` | code/convergence/verification | shared SDK + RN/H5 callers | lossless call raw cache、Gateway detail merge/writeback、same-day filters、RN detail adoption and `/calls/:callID` route | SDK 3 files/15 + all-runtime typecheck/boundary + build:rn/build:web + RN tsc/2 composition + H5 62 files/223/466 assets/build + authenticated 567x786 route proof | `converged/read-only-accepted` | closed 2026-08-12；no call/delete/permission；legacy RN detail Gateway/cache merge owner removed；`build:package:desktop:web` unchanged |
| `W6.a5.2.3.2-call-record-list-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web callers | move RN list/delete/pending/realtime terminal record business transitions into the neutral call-record facade and delete duplicate app owners | SDK 65 files/234 + all-runtime boundary/build；RN service 127 + focused 15 + CallList 11 + tsc；H5 62 files/228/466 assets/build | `done-local/mutation-gated` | closed 2026-08-12；RN duplicate Gateway/schema/CRUD/status owners removed；Web realtime composition closed by `.3.3`；no real delete/call；desktop:web script untouched |
| `W6.a5.2.3.3-web-realtime-call-history-composition` | code/convergence/verification | shared terminal parser + Web runtime + H5 calls consumer | WebSocket terminal message -> shared parser -> shared call state/cache -> one runtime data version -> `/calls` cache reread | shared/runtime focused 3 files/15；all-runtime typecheck/boundary；build:rn/build:web；RN 2 suites/4 + tsc；H5 verify 63 files/232/466 assets/build | `done-local/realtime-acceptance-gated` | closed 2026-08-12；no mock/fake-success/second parser；real dual-account terminal event and list-back remain；desktop:web script untouched |
| `W6.a5.2.4-me-core` | code/verification | web me + sdk facade | RN current-profile hero、general settings/logout、`/me` fourth tab | source/tests + authenticated 390x844/760x900 light/dark screenshots/history + 24/65 verify | `accepted-readonly/mutation-gated` | real logout Network/session/DB cleanup proof；Safari/Firefox joins W5 browser matrix |
| `W6.a5.2.5-me-profile-edit` | code/verification | web me profile + sdk facade | nickname/gender/bio update-profile routes and RN field validation | source/API trace + authenticated responsive/history/cold-restart + `.114` 412px dark readonly | `done-local/acceptance-gated` | 760x900 dark + approved changed-value Network/result + slow-saving pending evidence |
| `W6.a5.2.6-account-security` | design | web me security + sdk/runtime facade | RN security screen/operation/route matrix with bounded real mutations only | source/API/export/session-side-effect trace | `decomposed` | account credential child done-local/acceptance-gated；contact verification remains blocked-contract |
| `W6.a5.2.6.1-account-credential` | code/verification | web me security + sdk runtime | security root、set account/password、old-password reset with revoked-session cleanup | 3 focused tests + 25/70 verify + authenticated responsive/history/guest browser matrix + `.115` 412px dark readonly | `done-local/acceptance-gated` | 760x900 dark + 已绑定账号 reset 自然表单 + approved real set/reset Network/result/session cleanup |
| `W6.a5.2.6.2-contact-security` | contract/code | web me security + sdk/runtime facade | phone/email bind or change with verified-code lifecycle | send-code + mutation contract and real verification flow | `blocked-contract` | Gateway exposes a real send-code operation or product explicitly changes scope |
| `W6.a5.2.7-general-settings` | design | web me settings + sdk/runtime facade | display、notification、permission、network、terms、version/cache route/capability matrix | RN source/API/route owner trace | `decomposed/active-children` | continue bounded children without mixing browser-blocked contracts |
| `W6.a5.2.7.1-display-notification-terms` | code/verification | web me settings + sdk runtime | RN display preference、real notification detail/update facade、real terms routes | focused tests + real reads + 390x844/760x900 light/dark/history/reload and zero-console proof | `accepted-readonly/mutation-gated` | approved notification update + Safari/Firefox proof；RN/H5 shared title semantics debt remains explicit |
| `W6.a5.2.7.2-permission-settings` | code/verification | web me settings + sdk runtime | five RN permission switches through authenticated detail/update operations | focused tests + authenticated 5-value read + 390x844/760x900 light/dark/history/reload proof | `accepted-readonly/mutation-gated` | approved real update Network/result + Safari/Firefox proof；blacklist remains separate |
| `W6.a5.2.7.3-network-settings` | contract | deployment + web settings | Web-equivalent proxy/network semantics | deployment proxy contract | `blocked-browser-semantics` | browser-safe proxy/config owner is defined |
| `W6.a5.2.7.4-cache-version` | contract | storage/deployment + web settings | browser cache scope/clear and Web update semantics | RN/shared SDK/storage/deployment trace + destructive/anti-fake review | `contract-frozen/decomposed` | version child done-local/acceptance-gated；cache child blocked-storage-semantics |
| `W6.a5.2.7.4-cache-contract` | contract/code | storage/runtime | disposable storage registry + lifecycle-safe current-account inspect/clear | preserve local-only data + isolated destructive tests + Worker/Web Lock recovery | `blocked-storage-semantics` | disposable data is separable from drafts/failed/sending/pending state |
| `W6.a5.2.7.5-web-version-check` | code/verification | web runtime config + settings | required build identity、public check adapter、RN version row/update modal | 11 focused tests + authenticated build `1.4.1.202608092238` no-update browser proof + responsive/reload/guest proof | `accepted-no-update/acceptance-gated` | real `need_update=true` optional/forced response and update target proof |
| `W6.a5.2.8-invite-complete-profile-contract-freeze` | contract/design | auth onboarding + sdk/runtime | RN invite/profile route、operation and post-register state matrix | source/API/caller trace + anti-placeholder/anti-fake review | `done` | closed 2026-08-10；decomposed into route-state/invite/profile children plus explicit avatar/contact blockers |
| `W6.a5.2.8.1-onboarding-route-state` | code/verification | web auth routing + onboarding state | register/login split、memory-only pending registration、account-scoped marker and route guards | 4 state tests + caller tests + full verify + missing-marker browser guards | `done-local/acceptance-gated` | valid register context proof joins `.8.3` acceptance；no credential persistence |
| `W6.a5.2.8.2-invite-page` | code/verification | web auth invite + runtime register | RN invite UI and retry through existing register optional `invite_code` | register body/error tests + responsive/history proof | `done-local/acceptance-gated` | approved invite-required response + valid-context visuals；no standalone invite validation |
| `W6.a5.2.8.3-complete-profile-core` | code/verification | web auth profile + existing profile facade | RN profile core、memory draft、gender/bio SPA subroutes and real current-detail/update | 10 focused app tests + full 27/81 verify + base/gender/bio anonymous guards passed；valid-context matrix pending | `implemented-local/acceptance-gated` | active until approved register/profile Network/result + responsive/light/dark/history proof；contact action remains omitted |
| `W6.a6.20.6-onboarding-avatar` | code/verification | shared profile sync + web auth avatar platform/UI | RN album/camera/crop/upload/draft/final profile timing | H5 4 files/10 tests + full SDK Web 84 files/347 tests + 466 assets/typecheck/1089-module build + route guard | `shared-core-ready/web-consumed/rn-frozen` | valid new-account source/crop/upload/update visual and Network proof blocked-external；RN consumer frozen |
| `W6.a5.2.8.4-onboarding-real-acceptance` | deployment verification | web auth + deployment owner | approved register/optional invite/profile mutation and valid-context visual/history evidence | Network/result + 390x844/760x900 light/dark/back/forward/reload | `blocked-external` | approved disposable new account and mutation authorization available；never fabricate marker/session |
| `W6.a5.2.9-blacklist-core` | code/verification | web me + sdk sync | RN blacklist list/search/remove/confirm route through shared Gateway operations | 4 view tests + authenticated real empty/search-empty + 567x786 system-light/dark/direct/history/reload/zero-console proof + full verify | `accepted-empty-read/chromium/mutation-gated` | non-empty enrichment/search、approved remove Network/result and Safari/Firefox proof；no unsupported add flow |
| `W6.a5.2.10-friend-applications-core` | code/verification | web contacts + sdk sync | RN standalone friend application list/search/group/status/accept through shared Gateway operations | facade/view tests + historical real 5-row list + 390x844/760x900 light/dark/direct/history/reload + `.116` current 3 accepted rows | `accepted-readonly/natural-data-and-mutation-gated` | pending-state sample and approved accept remain；no fake session or unsupported unread/group/profile/reject path |
| `W6.a5.2.11-group-applications-core` | code/verification | web contacts + sdk sync | RN group verification index、per-group application list/search/section/status and accept/reject through one audit facade | facade/view tests + `.116` current real empty-state + 390x844/760x900 light/dark/direct/history/reload + zero-console | `accepted-empty-read/natural-data-and-mutation-gated` | non-empty owner/admin detail and approved accept/reject remain；no fake session or unsupported unread/profile/manage/member-join path |
| `W6.a5.2.12-joined-groups-core` | code/verification | web contacts + sdk sync | RN 我的群聊 cache-first list/search/status/role and conversation opening through shared group/conversation facades | tests + authenticated list/role/search/theme/history + `.133` real canonical open/list-back proof | `accepted-readonly/open-conversation-accepted/mutation-gated` | cache-miss fallback、offline cold start、large-group、physical touch、Safari/Firefox and mutations remain |
| `W6.a5.2.13-contact-profile-core` | code/verification | web contacts + sdk sync | RN 联系人点击 -> 资料 -> 发消息/加好友 through shared user/friend/conversation facades | tests + real friend/self/unknown-error + 390x844 dark/760x900 light/history/reload proof | `accepted-readonly/mutation-gated` | open-conversation、real stranger and friend apply remain；Safari/Firefox joins W5 matrix |
| `W6.a5.2.14-contact-user-search-core` | code/verification | web contacts + sdk sync | RN 通讯录搜索入口、本地好友匹配、真实 Gateway 用户搜索和资料页跳转 | tests + known result/self-filter/unknown no-result + responsive theme proof | `accepted-readonly/acceptance-gated` | transport/business failure and Safari/Firefox remain |
| `W6.a5.2.15-group-members-route-parity` | code/verification | H5 chat settings/router + existing shared group-member facade | RN 群设置“全部”入口、完整成员 cache-first/sync、搜索、分组、角色标签、资料跳转和 SPA 返回 | H5 focused 4/15 + typecheck/build/full verify + authenticated 4-row search/profile-back + 567/390px zero-overflow proof | `done-local/read-only-accepted` | closed 2026-08-12；large-group、offline、physical touch、Safari/Firefox and all member mutations remain gated |
| `W6.a6.1-chat-media-read-core` | code/verification | web chat | RN 图片全屏预览、单实例语音播放/停止、视频全屏播放，消费既有 cache payload | H5 11/42 + SDK 32/103 + 466 assets + typecheck/build/full verify + guest guard + `.117` safe-candidate audit | `implemented-local/natural-data-acceptance-gated` | 当前无未读候选无媒体；authenticated media playback + responsive light/dark 仍待自然 payload |
| `W6.a6.2-chat-image-file-send-core` | code/verification | shared sdk + web adapter + web chat | RN 相册图片/普通文件选择 -> 上传凭证 -> OSS 直传 -> Gateway send -> SQLite 状态收敛 | H5 12/46 + SDK 33/107 + 466 assets + all-runtime typecheck + full verify/build + release/pack + responsive browser proof | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10；real upload/send requires explicit authorization and remains an acceptance gate |
| `W6.a6.3-chat-album-video-send-core` | code/verification | shared sdk + web adapter + web chat | RN mixed 相册视频 -> browser metadata -> shared upload/Gateway video body -> SQLite 状态收敛 | H5 13/50 + SDK 35/109 + 466 assets + all-runtime typecheck/build:web/full verify + responsive browser proof | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10；real upload/send requires explicit authorization and remains an acceptance gate |
| `W6.a6.4-chat-voice-send-core` | code/verification | shared sdk + web media adapter + web chat | RN hold/cancel recording -> browser Blob -> shared upload/Gateway audio body -> SQLite 状态收敛 | H5 15/56 + SDK 36/111 + injected recorder lifecycle/error tests + all-runtime typecheck/build:web/full verify + responsive voice-mode proof | `implemented-local/acceptance-gated` | local implementation passed 2026-08-10 without opening a microphone or transmitting media；real recording/upload/send requires explicit authorization |
| `W6.a6.5-chat-system-emoji-core` | code/verification | web chat composer + browser preference adapter | RN Unicode emoji panel -> selection-aware draft editing -> existing text send path | 9 focused + H5 17/65 + SDK 36/111 + 466 assets + full verify/build + authenticated 390x844/1280x800 browser proof | `done-local/acceptance-gated` | no message transmitted；real text send remains an explicit acceptance gate |
| `W6.a6.6-chat-illustrated-emoji-contract-freeze` | contract/design | RN preset registry/document/send/read + shared SDK boundary | source trace -> entity/body/cache/display contract -> bounded implementation slices | RN source/API/caller trace + 135/133 identity audit + ownership/failure/anti-placeholder review | `done` | Gateway schema partial、SDK mapper/send/cache gaps and shared owner decision frozen in migration contract §30 |
| `W6.a6.6.1-shared-preset-emoji-core` | code/convergence | im28-sdk core/transport/sync/repository + RN thin adapters | shared DTO/descriptor/document/entity -> Web send/map/SQLite；remove RN live algorithm duplication | SDK 37/116 + build:rn/build:web + RN 3 suites/12/tsc + H5 17/65/typecheck/build + 466 assets | `done-local` | closed 2026-08-10；no H5 UI or real send |
| `W6.a6.6.2-h5-illustrated-emoji-ui` | code/verification | H5 chat composer/message/conversation + browser preference/assets | shared descriptors/entities -> illustrated tab/grid/preview/bubble/conversation projection | H5 21/75 + SDK 37/116 + 466 assets + 458x786/1280x900 light/dark proof | `done-local` | closed 2026-08-10；no real send/custom emoji/draft persistence |
| `W6.a6.6.3-illustrated-emoji-acceptance` | deployment verification | H5 + SDK + approved disposable conversation | one authorized preset text send -> Gateway -> SQLite -> list-back | Network/result/cache proof | `blocked-external` | explicit send authorization and disposable account/conversation required |
| `W6.a6.7-custom-emoji-contract-freeze` | contract/design | RN custom emoji library/send/manager + Gateway generated API + SDK/H5 gaps | freeze type 115 DTO/cache/send/UI/failure/owner map and bounded slices | RN/API/caller trace + anti-fake/owner review | `done` | closed 2026-08-11；overall runtime-chain-partial |
| `W6.a6.7.1-shared-custom-emoji-core` | code/convergence | SDK core/transport/sync/repository | DTO + list mapper/client + SQLite cache + `listCached/sync/sendCustomEmoji` | Gateway contract + 5 focused real sql.js/HTTP tests + 40/121 Web suite + core/all-runtime build + package sync | `done-local` | closed 2026-08-11；no manager mutation or real send |
| `W6.a6.7.2-h5-custom-emoji-panel` | code/verification | H5 chat panel/message + browser preference | third tab + five-column recent/all + safe type 115 send/read presentation | H5 22/77 + SDK 40/121 + typecheck/build/assets + authenticated real-list 458x786/1280x800 dark proof | `implemented-local/acceptance-gated` | no manager/real send；light-theme proof remains open |
| `W6.a6.7.3-custom-emoji-manager` | contract/design | SDK media/custom emoji + H5 manager | create/add/delete/reorder decomposition with explicit mutation semantics | RN/Gateway/caller/owner/failure review | `done` | closed 2026-08-11；split into `.3.1/.3.2/.3.3` |
| `W6.a6.7.3.1-shared-custom-emoji-mutations` | code/convergence | SDK transport/sync/repository + shared upload port | create uploaded images、add received ID、batch delete and cache convergence | HTTP contract + injected upload + real sql.js + 40/126 Web + all-runtime build | `done-local` | closed 2026-08-11；no real upload/mutation |
| `W6.a6.7.3.2-h5-custom-emoji-manager` | code/verification | H5 chat/manager/router | add tile、image picker、five-column preview/select/confirm-delete | H5 23/80 + SDK regression + 458x786 read-only browser proof | `implemented-local/acceptance-gated` | closed 2026-08-11；real file selection/mutation and desktop/light proof remain gated |
| `W6.a6.7.3.3-custom-emoji-add-reorder` | code/verification | H5 message actions + browser preference | type115 add action + stable-ID local reorder | H5 24/85 + focused projection/order tests + 458x786 move-tray/cancel proof | `implemented-local/acceptance-gated` | closed 2026-08-11；current history has no type115；no real add/order commit |
| `W6.a6.7.4-custom-emoji-acceptance` | deployment verification | H5 + SDK + approved account | real list/cache + one authorized disposable type 115 send | Network/Gateway/SQLite/realtime/list-back | `blocked-external` | explicit account/conversation authorization required |
| `W6.a6.8-chat-media-export` | code/verification | H5 chat + browser media adapter | RN image save and file preview/download over persisted real payload | H5 25/92 + full verify + real cached 458x786/1280x800 proof | `implemented-local/acceptance-gated` | actual download/open and light-theme proof remain gated |
| `W6.a6.9-chat-failed-retry` | contract/code/verification | RN chat + shared SDK + H5 chat | same-row type101/type115 retry with shared owner and explicit media exclusion | SDK 41/130 + real sql.js identity/failure/no-I/O gates + build:all + H5 25/92/typecheck/build | `implemented-local/acceptance-gated` | closed 2026-08-11；real failure/retry requires explicit authorization |
| `W6.a6.10-chat-media-retry-stage` | contract/code/verification | shared SDK media send + Web runtime + H5 capability | durable post-upload body checkpoint、conditional 102–105 same-row retry、pre-Realtime interrupted-send recovery and explicit pre-upload source reselection | SDK 43/138 + upload-once/body/range/order gates + all-runtime build:all + H5 25/92/verify + 458px read-only smoke | `implemented-local/acceptance-gated` | closed 2026-08-11；real Gateway failure/retry remains explicitly authorized acceptance only |
| `W6.a6.11-chat-quote-reply` | contract/code/verification | RN chat actions + shared SDK message sync + H5 composer/list | type114 quote eligibility、Gateway body、durable source projection、composer cancel/send、failed-state semantics and source jump | SDK 44/140 + all-runtime build + H5 typecheck/build/verify + authenticated 458px read-only action/preview/cancel proof | `implemented-local/acceptance-gated` | closed 2026-08-11；real quote send remains explicitly authorized acceptance only |
| `W6.a6.11.1-sdk-sync-runtime-boundary` | architecture/refactor/verification | shared SDK + RN/Web/Desktop entries | shared business sync、Web-only composition and three runtime adapter directories become structurally distinguishable | AST boundary gate + SDK 44/140 + build:all + RN tsc + H5 verify + per-target dist presence check | `done-local` | closed 2026-08-11；RN runtime path unchanged and Web composition absent from RN/Desktop dist |
| `W6.a6.12-shared-sync-neutral-naming-and-rn-adoption-contract-freeze` | contract/design | shared SDK + RN service boundary | freeze neutral-name aliases/deprecation order and explicit RN adoption decision without dual-track business logic | public export inventory + RN caller trace + compatibility/build matrix | `done` | closed 2026-08-11；no unused alias、mass rename or RN runtime cutover；future adoption requires explicit RN composition/service slice |
| `W6.a6.13-chat-copy-core` | code/verification | H5 chat action + browser clipboard adapter | RN copy action/icon、message projection text and success-only feedback | H5 27/99 + SDK 44/140 + full verify/build + authenticated 458x786 right-click/no-overflow/zero-console proof | `implemented-local/acceptance-gated` | closed 2026-08-11；Safari/Firefox clipboard permission and touch long-press remain acceptance gates；no rich clipboard or mutation |
| `W6.a6.14-chat-forward-contract-freeze` | contract/design | RN forward actions + shared SDK send/cache + H5 router/modal | freeze single/multi forward eligibility、target selection、payload identity、preview editing and failure convergence | RN caller/payload/API/SQLite/UI owner trace + anti-fake review | `done` | closed 2026-08-11；Gateway batch exists but shared mapper/schema drop `forward_origin`；normal and hidden-sender paths remain distinct |
| `W6.a6.14.1-shared-forward-core` | code/verification | shared SDK message sync + Gateway transport + SQLite | core forward-origin model/schema/repository、source reread、normal batch + registered hidden-sender send、stable IDs and per-row final state | SDK 49/150 + Web 46/145、real sql.js mapper/repository、partial/top-level/hidden guards、all-runtime typecheck/package、build:web + H5 verify | `done-local/acceptance-gated` | closed 2026-08-11；no RN runtime wiring or real Gateway mutation；server-backed sources only |
| `W6.a6.14.2-h5-forward-target-preview` | code/verification | H5 chat + React Router + existing contact/group/conversation facades | historical target-chat preview path，现已由 `.54` 统一弹窗 supersede | H5 29/103 + SDK Web 46/147 + authenticated 390x844/458x786 historical proof；`.124` closes current modal 760x900 proof | `implemented-local/superseded-ui-history` | current default path is `ChatTargetPickerModal`；real mutation remains `.14.3` gate |
| `W6.a6.14.3-forward-acceptance` | authorized verification | deployment + H5 + SDK | one disposable normal/partial-result/list-back proof and explicitly approved hidden-sender proof | 14:59 normal origin + 15:01 hidden no-origin + conversation cache/list-back + zero sending/failed；current modal 760x900 closed by `.124` | `partially-accepted/blocked-external` | normal/hidden and desktop readonly closed；controllable real partial-result remains unavailable |
| `W6.a6.15.1-shared-message-delete-core` | contract/code/verification | shared SDK message sync + Gateway transport + SQLite | current-account source reread、single update/batch-delete/local-only self、partial-result and transactional local convergence | SDK Web 47/152 + all-runtime typecheck + build:web generated-package sync | `done-local/acceptance-gated` | closed 2026-08-11；RN service/runtime import graph unchanged |
| `W6.a6.15.2-h5-message-delete-ui` | code/verification | H5 chat action + multi-select + shared SDK facade | RN single/multi confirmation、self/all scope、group permission presentation and visible partial feedback | H5 31/107 + typecheck/build + 466 assets + authenticated read-only 458x786/390x844 no-overflow/zero-console proof | `done-local/acceptance-gated` | closed 2026-08-11；no delete option was confirmed |
| `W6.a6.15.3-message-delete-acceptance` | destructive authorized verification | deployment + H5 + SDK | disposable `self/all/partial` Gateway、SQLite、realtime/list-back proof | Network/result + exact affected rows + conversation reread | `blocked-destructive-authorization` | explicit disposable messages and action-time authorization required；never delete production history by inference |
| `W6.a6.16-chat-message-edit-contract-freeze` | contract/design | RN edit flow + shared SDK + H5 composer | freeze eligibility、Gateway update、same-row/entity/editedAt/failure/realtime ownership | RN caller/body/cache/UI trace + anti-fake/owner review | `done` | closed 2026-08-11；revoke and non-text/forwarded edit excluded |
| `W6.a6.16.1-shared-message-edit-core` | code/verification | shared SDK message sync + Gateway transport + SQLite | current-account source reread、RN parity guard、success-only same-row text/entity replacement | SDK Web 48/155 + all-runtime typecheck + boundary gate + build:web generated-package sync | `done-local/acceptance-gated` | closed 2026-08-11；RN service/runtime import graph unchanged |
| `W6.a6.16.2-h5-message-edit-ui` | code/verification | H5 chat action + composer/list projection | RN edit action/preview、original document refill、cancel/submit、edited timestamp | H5 32/109 + typecheck/build + 466 assets + authenticated read-only 458x786 no-overflow proof | `done-local/acceptance-gated` | closed 2026-08-11；no edit was submitted |
| `W6.a6.16.3-message-edit-acceptance` | authorized verification | deployment + H5 + SDK | one disposable text edit -> Gateway -> same SQLite row/list-back -> second-client realtime | Network/result + stable IDs/order/status + editedAt/entities + realtime proof | `blocked-mutation-authorization` | explicit disposable message and action-time authorization required |
| `W6.a6.17.1-shared-group-mention-core` | contract/code/verification | shared SDK group/message/repository + Web composition | cache-first full group-member sync、schema v10 mention identity、type106 optimistic send and mapper/realtime persistence | SDK Web 50/159 + all-runtime typecheck + boundary gate + build:web generated-package sync | `done-local/acceptance-gated` | closed 2026-08-11；RN service/runtime import graph unchanged；no real send |
| `W6.a6.17.2-h5-group-mention-ui` | code/verification | H5 group chat composer/message/conversation | RN `@成员/@所有人` query/picker/selection/cursor、shared send caller、type106 read and latest `[有人@我]/[所有人]` preview | H5 33/114 + typecheck + 466 assets + production build | `done-local/acceptance-gated` | closed 2026-08-11；no message transmitted；then-open unread projection residual closed by `.17.2.1` |
| `W6.a6.17.2.1-unread-mention-conversation-projection` | code/verification | shared SDK message/group repository + conversation facade + H5 preview | seq-bounded latest unread mention、cached group sender name、draft/mention/latest priority | SDK 50/160 + H5 33/116 + all-runtime typecheck + verify + 458x786 real-list no-overflow proof | `done-local/acceptance-gated` | closed 2026-08-11；no network/mutation；sender-name residual closed by `.17.2.2` |
| `W6.a6.17.2.2-sender-display-name-cache-parity` | code/verification | shared SDK contact cache + sender resolver + conversation facade | success-only `friendships/users` snapshot、shared queue、RN remark/group/user priority、no ID guessing | SDK 52/163 + all-runtime typecheck + build:web/H5 verify + authenticated 7-contact/19-conversation zero-console proof | `done-local/acceptance-gated` | closed 2026-08-11；no message mutation；real unread mention sample remains `.17.3` gate |
| `W6.a6.17.3-group-mention-acceptance` | authorized verification | deployment + H5 + SDK | one disposable member mention and one permission-valid all mention -> Gateway -> SQLite/realtime/list-back | Network/result + top-level mentions/body targets + stable IDs/status/cache proof | `blocked-mutation-authorization` | explicit disposable group and action-time send authorization required |
| `W6.a6.18.1-chat-text-search` | code/verification | shared SDK message repository/sync + H5 chat/router | current-account visible-text search、RN result list、stable client-ID cached-window focus、query/tab history restore | SDK Web 52/164 + H5 38/126 baseline；authenticated 458px deep-link/reload plus `.125` real 760×900 light/dark back/forward proof | `done-local/acceptance-gated` | text history/theme/desktop gate closed 2026-08-14；no Gateway/mutation/send；Safari/Firefox、动画活动帧和实体设备 remain gated |
| `W6.a6.18.2.1-shared-indexed-search-range` | contract/code/verification | shared SDK message repository/sync | current-account inclusive-lower/exclusive-upper send-time query plus existing content-type query, without Gateway I/O | real sql.js boundary test + SDK Web 52/165 + all-runtime typecheck/boundary/build:web | `done-local/acceptance-gated` | closed 2026-08-11；no RN service/runtime or desktop build-script change |
| `W6.a6.18.2.2-h5-date-media-file-index` | code/verification | H5 chat/router + existing media preview owner | RN date calendar、media filters/month groups、file groups and stable-ID return without page history scans | H5 39/129 + authenticated 458px non-empty proof；`.126` H5 full 140/445 + 760×900 light/dark/history/reload proof | `done-local/desktop-history-verified` | desktop/history/theme closed 2026-08-14；no Gateway/download/mutation/send；current non-empty media/file、Safari/Firefox/device remain gated |
| `W6.a6.18.2.3-chat-settings-entry` | contract/code/verification | RN single/group chat settings + H5 router | settings-owned “查看聊天记录/查找聊天内容” entry routes into the same search owner | RN source mapping + H5 40/132 + full verify + authenticated single/group deep-link browser proof | `done-local/acceptance-gated` | closed 2026-08-11；only existing cache/profile/search facades render，unsupported mutation rows remain omitted |
| `W6.a6.18.3-chat-settings-capability-contract-freeze` | contract/design | RN single/group settings + shared SDK/runtime | freeze mute、pin、auto-delete、clear-history and group-management ownership/failure/authorization boundaries | RN service/Gateway/cache/realtime trace + owner and destructive-action review | `done` | closed 2026-08-11；three-operation `.18.3.1` split from lifecycle/destructive/group domains |
| `W6.a6.18.3.1-shared-conversation-setting-core` | code/verification | shared conversation sync + RN/H5 composition | neutral setting detail、mute、pin facade with RN/Web actual callers and success-only SQLite convergence | SDK focused 13 + all-runtime typecheck/build:rn/build:web + RN tsc/4 caller tests + H5 full verify | `converged/mutation-acceptance-gated` | RN legacy Gateway/local/fallback paths deleted；real toggle remains gated |
| `W6.a6.18.3.2-auto-delete-contract` | contract/design | shared message/conversation sync + realtime | freeze authoritative read、enum update、type1701、permission、setting/cache and new-message lifecycle semantics | RN/Gateway/realtime/schema trace + anti-fake review | `done` | closed 2026-08-11；server owns expiry/deletion，client never retroactively purges history |
| `W6.a6.18.3.2.1-shared-auto-delete-core` | code/verification | shared conversation/message sync + RN/H5 composition | Conversation metadata、schema v11、strict detail/update、type1701 convergence and RN/Web actual callers | SDK focused 13 + all-runtime typecheck/build:rn/build:web + RN tsc/auto-delete caller test + H5 full verify | `converged/mutation-acceptance-gated` | RN legacy detail/update/cache path deleted；real update and second-account realtime remain gated |
| `W6.a6.18.3.2.2-h5-auto-delete-route` | code/verification | H5 chat settings/router/message projection | RN options route、single/group role gate、explicit confirm and operator-aware type1701 wording | H5 focused 4/16 + typecheck/build + authenticated 458px read-only browser proof | `done-local/mutation-acceptance-gated` | closed 2026-08-11；no real confirm；hidden protocol values fail closed |
| `W6.a6.12.1.2-message-edit-delete-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | neutral message-mutation composition、RN delete/edit actual-call adoption、legacy RN payload compatibility and obsolete path deletion | SDK 58/179 + all-runtime typecheck + build:rn/build:web + RN tsc/9 focused tests + H5 55/174 verify | `converged/mutation-acceptance-gated` | closed 2026-08-11；real mutations retain explicit authorization gates |
| `W6.a6.12.1.3-message-forward-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | RN forward callers consume one shared business owner while preserving platform-provided optimistic IDs and RN presentation/events | SDK 58/181 + forward guard/sql.js + all-runtime boundary/build:rn/build:web + RN tsc/10 focused + H5 55/176 verify | `converged/mutation-acceptance-gated` | closed 2026-08-11；real partial-result remains external gate；`build:package:desktop:web` unchanged |
| `W6.a6.12.1.4-group-mention-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | RN group-member/mention production callers consume shared identity、permission、Gateway body and cache owners | SDK 58/184 + all-runtime boundary/build + RN tsc/13 group-detail + 3 mention tests + H5 55/179 verify | `converged/mutation-acceptance-gated` | closed 2026-08-11；real type106 send、second-account realtime/list-back remain gated；no production fallback |
| `W6.a6.12.1.5-message-search-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web consumers | RN chat-message search production callers consume shared query validation、SQLite filtering and pagination owner | SDK 58/184 + all-runtime boundary/build:rn/build:web + RN tsc/8 search-service + 28 search-page tests + H5 55/179 verify | `converged/acceptance-gated` | closed 2026-08-11；old RN Repository/filter path deleted；cache-only read；`build:package:desktop:web` unchanged |
| `W6.a6.12.1.6-realtime-message-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/Web realtime consumers | RN/Web production callers consume shared normalization、gap recovery and cache convergence while RN retains RTC/AppState/notification/UI projection | SDK sync 35/126 + Web 57/194 + all-runtime typecheck + build:rn/build:web + RN tsc/141 + H5 assets/typecheck/build | `converged/acceptance-gated` | closed 2026-08-11；RN duplicate parser and three gap/cache owners deleted；real dual-account WS/disconnect/list-back gated；`build:package:desktop:web` unchanged |
| `W6.a6.18.3.3-clear-history-contract-trace` | contract/design | RN clear-history + shared SDK/Gateway/cache/realtime | freeze destructive target、scope、response、cache and realtime/list-back semantics before any UI/mutation | RN/Gateway/schema/realtime backward trace + destructive-action review | `done-read-only` | closed 2026-08-11；no clear action；old OpenIM/friend-delete/group-leave paths excluded |
| `W6.a6.18.3.3.1-shared-clear-history-core` | code/verification | shared conversation/message sync + schema/repository/realtime | schema v12 cursor/list-hidden、stable operation ID、boundary-safe success-only clear and type2102 control convergence | clear 4/4 + sync 36/130 real sql.js、all-runtime typecheck/boundary、build:rn/build:web、RN tsc、H5 typecheck/build | `done-local/shared-core-ready` | closed 2026-08-12；uint64 max、failure、concurrency、idempotency and late-message guards passed；no real destructive request |
| `W6.a6.18.3.3.2-clear-history-consumer-convergence` | architecture/refactor/verification | shared SDK + RN/H5 clear callers | RN action/type2102 and H5 settings action consume one clear facade；remove legacy whole-delete/control business paths | SDK 8 focused + 56/194 sync/Web、all-runtime typecheck/build:rn/build:web + RN tsc/126 + H5 6 focused/typecheck/build/browser sheets；no real mutation | `converged/acceptance-gated` | closed 2026-08-12；all-members uses shared role snapshot/helper；real destructive/list-back acceptance gated；`build:package:desktop:web` unchanged |
| `W6.a6.18.3.4-h5-group-introduction-readonly` | code/verification | H5 group settings/router + existing shared group facade | RN-ordered introduction row、empty subtitle/read detail、deep-link/back and visible route/data failure without duplicate mutation | H5 focused 5/5 + 54/177；SDK Web 70/272；466 assets/typecheck/build + authenticated 567/390px real-group proof | `done-local/read-only-accepted` | closed 2026-08-12；no SDK/RN source or mutation；non-empty/edit/device/cross-browser remain gated |
| `W6.a6.18.3.5-shared-group-announcement-readonly` | code/convergence/verification | shared joined-group facade + H5 settings/router | announcement/version/edit-permission DTO、RN owner/admin entry parity and shared text-detail route without raw payload access | SDK 4/4 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc；H5 6/6 + SDK Web 70/272、466 assets/typecheck/build + authenticated owner/admin proof | `done-local/read-only-accepted` | closed 2026-08-12；no update/read-mark/send；ordinary-member/non-empty/device/cross-browser remain gated |
| `W6.a6.18.3.6-shared-self-group-nickname` | code/convergence/verification | shared group-member facade + H5 settings dialog | current-auth identity、24-char validation、Gateway success-only member upsert and RN-semantic H5 editor | SDK group-member 9/9 + Web 70/274 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc/source boundary；H5 7/7 + 466 assets/typecheck/build/full verify | `done-local/mutation-acceptance-gated` | closed 2026-08-12；no real save/realtime/list-back；browser open/cancel/layout and RN guarded consumer convergence remain gated |
| `W6.a6.18.3.7-shared-group-card` | code/convergence/verification | shared contact facade + RN composition + H5 group settings/router | friend target filtering、canonical type108 group card、optional type101 note and one shared send/cache state machine | SDK contact-actions 12/12 + RN/Web typecheck/build:rn/build:web；RN tsc + 43 focused；H5 9/9 + typecheck/build；authenticated search/select/cancel/480px proof | `converged/local-send-acceptance-gated` | closed 2026-08-12；no real send/note/partial-failure/list-back；`build:package:desktop:web` unchanged |
| `W6.a6.18.3.8-shared-group-profile-name` | code/convergence/verification | shared group facade + RN composition + H5 group settings/router | current-account owner/admin permission、name validation、strict Gateway response and success-only group merge with RN name-only caller | SDK joined-group 6/6 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc + 126 service/5 UI；H5 10/10 + full verify 70/278、466 assets/build + authenticated editor cancel/567px proof | `converged/local-mutation-acceptance-gated` | closed 2026-08-12；no real save/copy/type1520/list-back；other group profile fields unchanged；`build:package:desktop:web` untouched |
| `W6.a6.18.3.9-shared-group-profile-avatar` | code/convergence/verification | shared group facade + RN composition + H5 platform crop | owner/admin preflight、static image/10MB upload、strict Gateway avatar response、success-only group merge and RN avatar-only caller | SDK 73/285 + all-runtime typecheck/boundary/build:rn/build:web；RN 127 service；H5 4 focused + typecheck/build + authenticated local crop/cancel/567px proof | `converged/local-mutation-acceptance-gated` | closed 2026-08-12；no real upload/update/type1502/list-back；introduction later converged in `.18.3.10`，announcement/combined remain registered；`build:package:desktop:web` untouched |
| `W6.a6.18.3.10-shared-group-introduction` | code/convergence/verification | shared group facade + RN composition + H5 text-detail route | owner/admin、non-empty trim/500、strict Gateway description response、success-only group merge and RN introduction-only caller | SDK 74/287 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc + 128 service；H5 full verify 71/282、466 assets/743 modules + authenticated open/cancel/567px proof | `converged/local-mutation-acceptance-gated` | closed 2026-08-12；no real update/type1521/list-back；announcement/combined path registered；`build:package:desktop:web` untouched |
| `W6.a6.18.3.11-shared-group-announcement` | code/convergence/verification | shared group facade + RN composition + H5 text-detail/chat banner | non-empty trim/1000、announcement permission、update-before-type101、partial failure、authoritative read version and type1519 cache convergence | SDK Web 73/290 + all-runtime typecheck/boundary/build:rn/build:web；RN tsc + 146 focused；H5 466 assets/full verify/748 modules + authenticated view/editor/confirm/567px proof | `converged/local-mutation-acceptance-gated` | closed 2026-08-12；no real update/send/read-mark/type1519/list-back；combined path remains registered；`build:package:desktop:web` untouched |
| `W6.a6.18.3.12-group-profile-combined-compat-exit` | architecture/refactor/verification | RN group-profile composition + shared SDK consumer contract | prove zero combined caller、enforce single-field XOR、reject announcement through generic entry and delete Gateway/OpenIM fallback | SDK all-runtime typecheck/boundary + profile/announcement 7/7；RN tsc + service 128/128；H5 typecheck + related view 12/12 | `converged/local` | closed 2026-08-12；no mutation/send/read/list-back；`build:package:desktop:web` untouched |
| `W6.a6.18.3.13-group-management-mutation-contract-audit` | contract/read-only | RN group-management callers + SDK transport + H5 routes | freeze caller/owner/permission/cache/realtime/destructive boundaries and split max-three-operation slices | source/API/fallback trace + `docs/runtime-contracts/group-management-mutations.md` | `done-read-only` | closed 2026-08-12；SDK shared mutation owner absent、H5 caller 0、RN duplicate-write risks registered；no runtime source or real mutation；`build:package:desktop:web` untouched |
| `W6.a6.18.3.13.1-shared-group-management-permissions` | code/convergence/read-only | shared permission resolver + RN helper + H5 joined-group/settings | explicit capability precedence、role fallback、fail-closed and zero platform raw permission parser | SDK all-runtime + 11/11；RN tsc + 29/29；H5 full verify SDK Web 74/293、466 assets、749 modules + focused 18/18 | `converged/read-only` | closed 2026-08-12；no mutation/SQLite write；H5 production chat/conversation permissions consume joined-group DTO；`build:package:desktop:web` untouched |
| `W6.closeout` | verification/docs | RN + web app + sdk + docs | local regression floor、migrated route parity evidence、duplicate-owner audit and residual ledger | SDK all-runtime pass + H5 verify 58/200 + RN tsc + ChatDetail 166/166 + RN full 164/164 suites、1369/1369 tests | `done-local/acceptance-gated` | local P0/P1 zero；external Gateway/destructive/dual-account WS/RTC/cross-browser gates remain explicit |
| `W6.a6.19-chat-message-presentation-parity` | code/verification | shared SDK group display-name resolver + H5 chat projection/layout | RN sender identity placement、mention display projection、180px image ratio、decode-failure-only OSS JPEG fallback、duration-based voice width and two-line forward origin | H5 focused 5/22 + SDK Web 59/204 + SDK sender 1/4 + 466 assets/all-runtime typecheck/build:rn/build:web + authenticated real DOM geometry | `done-local/acceptance-gated` | closed 2026-08-12；HEIF-mislabeled JPG root cause fixed without converting normal GIF；role-label real sample、signed OSS and cross-browser media remain gated；no mutation/send/download；`build:package:desktop:web` unchanged |

## Latest Closed H5 Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.3-custom-emoji-add-reorder` |
| production_flow | type115 stable ID -> long-press/right-click action -> shared `customEmojis.add`；manager selected group -> Pointer drag -> browser stable-ID order |
| canonical_owner | SDK owns add/member/cache；H5 owns explicit action UI and `im28.chat.customEmoji.order` presentation preference only |
| expected_deliverable | type115-only collection action、success/error feedback、touch/mouse selected-stack reorder、ordered panel/manager projection |
| verification_shape | H5 24/85 + SDK 40/126 regression basis + typecheck/build/assets + authenticated 458x786 select/move-tray/cancel proof |
| stop_condition | no injected type115 data、real add、order drop/commit、upload/delete/send |
| closeout | manager selected one real cached item and opened the RN-style move tray before cancel；current conversation has no type115 message，so collection-menu visual remains acceptance-gated |

## Previous Closed H5 Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.2-h5-custom-emoji-manager` |
| production_flow | chat add tile -> conversation-scoped manager route -> cache-first list -> explicit file/create or select/confirm/delete -> shared SDK mutation facade |
| canonical_owner | SDK owns validation/upload/Gateway/cache membership；H5 owns route/file input/preview/selection/five-column UI |
| expected_deliverable | add tile、React Router manager、image picker、preview、organize selection and confirm-delete |
| verification_shape | H5 23/80 + SDK 40/126 + typecheck/build:all/package sync + build/assets + authenticated 458x786 read-only proof |
| stop_condition | no real file selection/mutation/send；no message collection or local reorder |
| closeout | one real cached item and add tile rendered as equal five-column cells with no horizontal overflow；desktop/light and real mutation remain gated |

## Latest Closed Shared Mutation Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.1-shared-custom-emoji-mutations` |
| primary_path | `WebIMSync.customEmojis.create/add/delete -> GatewayHTTPClient -> CustomEmojiRepository` through shared upload port |
| convergence | create/add refresh and atomically replace full membership only after Gateway success；delete removes local rows only after Gateway success；failure preserves membership |
| closeout | SDK Web 40/126、core Gateway contracts、all-runtime typecheck/build:all and generated-package sync passed |
| residual_gate | `.3.3` implemented-local/acceptance-gated；real mutations remain authorization-gated |

## Earlier Closed H5 Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.2-h5-custom-emoji-panel` |
| production_flow | shared account cache/sync -> third heart tab -> recent/all grid -> shared type115 send caller/read projection |
| canonical_owner | SDK owns membership/cache/body/state；H5 owns RN UI、safe image and recent-ID preference only |
| expected_deliverable | third tab、cache-first refresh、five-column recent/all、safe direct-send caller |
| verification_shape | H5 22/77 + SDK 40/121 + typecheck/build/assets + real-list mobile/desktop dark proof |
| stop_condition | no add tile/manager/upload/add/delete/reorder/message-action save or real send |
| closeout | one real list item rendered in strict five-column responsive grid；no click/transmission；light proof remains acceptance-gated |

## Latest Closed Shared Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.7.1-shared-custom-emoji-core` |
| primary_path | Gateway list -> strict mapper -> schema v8 `custom_emojis` -> `customEmojis.listCached/sync`；`messages.sendCustomEmoji` -> shared optimistic state |
| convergence | SDK is the only DTO/cache/send owner；H5 generated package contains dist only；RN manager metadata remains registered compatibility work |
| closeout | SDK 5 focused + Web 40/121、core Gateway contracts、all-runtime typecheck、build:web package sync and H5 consumer gates passed |
| residual_gate | manager mutations `.3` active；authorized Network/SQLite/realtime/list-back send proof `.4` blocked-external |

## Latest Closed Contract Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.6-chat-illustrated-emoji-contract-freeze` |
| evidence | RN production source、Gateway generated/hand types、SDK mapper/sync/repository and H5 asset/UI gap traced backward；135 unique IDs、133 fallback values、135 mirrored PNGs verified |
| verdict | contract `done`；Gateway schema `runtime-chain-partial`；SDK/H5 implementation `🟡`；real send `🟡 acceptance-gated` |
| anti_shortcut | omitted H5 tab is honest missing capability；no mock entity、fake success、Unicode identity inference or second page transport exists |

## Previous Closed Local Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.5-chat-system-emoji-core` |
| production_flow | RN composer emoji toggle -> system panel -> insert/replace/delete draft -> existing text submit |
| primary_path | `ChatComposer` panel owner -> pure draft editing helper -> current text draft -> existing `sendText`; browser preference adapter owns recent MRU only |
| closeout | exact 52-entry list、7-column panel、selection replacement、full grapheme delete and 21-item MRU passed H5 17/65、SDK 36/111、466 assets、full verify/build and authenticated dual-viewport browser proof；no transmission occurred |
| residual_gate | real text send remains authorization-gated；illustrated/custom entity transport is not part of this slice |

## Previous Closed Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.4-chat-voice-send-core` |
| production_flow | RN voice mode -> hold recorder -> short/cancel/send decision -> upload credential -> OSS multipart -> Gateway audio message -> local repositories |
| public_caller | H5 only calls `WebIMSync.messages.sendAudio`; no page transport、repository、OSS body or recorder format mapping |
| recorder_contract | browser adapter chooses a supported audio MIME、owns stream/track/recorder cleanup and returns one `File`；permission/unsupported/error paths reject visibly |
| interaction_contract | pointer hold starts；upward delta `>=56px` cancels；release below `2s` rejects；`60s` auto-stops and sends；route exit cancels |
| state_contract | reuse shared `sending -> sent/failed` state machine and stable client ID across upload/Gateway stages |
| body_contract | `audio.media_id/url/duration_seconds/size_bytes`；content type `103`；duration is integer `1..60` |
| stop_condition | no real permission prompt/recording/upload/send、audio picker、persistent waveform、played/read/auto-next、upload progress/cancel、retry、download or RTC |
| closeout | one browser recorder owner and one shared audio send/state owner are live；H5 15/56、SDK 36/111 and local gates passed；voice mode was layout-tested without requesting microphone access or transmitting media |

## Earlier Closed Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.3-chat-album-video-send-core` |
| production_flow | RN mixed album -> media validation -> video send -> upload credential -> OSS multipart -> Gateway video message -> local repositories |
| public_caller | H5 only calls `WebIMSync.messages.sendVideo`; no page transport、repository or OSS body construction |
| metadata_contract | browser reads duration/videoWidth/videoHeight before send；metadata failure is visible and prevents upload |
| state_contract | reuse existing shared `sending -> sent/failed` state machine and stable client ID across upload/Gateway stages |
| body_contract | `media_id/url/thumbnail_url/duration_seconds/width/height/size_bytes`；snapshot query matches RN `t_7000,f_jpg,...,m_fast,ar_auto` |
| selection_contract | image/video total max 12；image 10 MB；video 500 MB；sequential order；unsupported MIME rejects the full selection before I/O |
| stop_condition | no draft caption/pending attachment、camera、audio/voice、progress/cancel、retry、local snapshot generation、real unauthorized send or RTC |
| closeout | shared video limit/body/snapshot/state owner and default H5 mixed-album caller are live；H5 13/50、SDK 35/109 and full local gates passed；no real upload/send was executed without authorization |

## Earlier Closed Slice Card

| field | frozen value |
| :--- | :--- |
| slice_id | `W6.a6.2-chat-image-file-send-core` |
| production_flow | RN attachment action -> platform picker -> upload credential -> OSS multipart upload -> Gateway message -> local message/conversation repositories |
| public_caller | H5 only calls `WebIMSync.messages.sendImage/sendFile`; no page transport or repository import |
| platform_port | opaque upload source + metadata enters shared sync；Web adapter alone validates `Blob/File` and constructs `FormData` |
| state_contract | persist local `sending` before upload；map matching client ID to `sent`；credential/upload/send failure updates the same row to `failed` and rethrows |
| selection_contract | image input accepts browser-decodable image kinds、max 12、10 MB each；file input sends one ordinary file、100 MB max；sequential ordering |
| stop_condition | no draft caption/pending attachment、camera、video/audio/voice、progress/cancel、retry、download/preview expansion or RTC |
| acceptance_gate | approved authenticated account must prove credential、OSS 200、Gateway send、SQLite/cache projection and responsive light/dark behavior |

| closeout | shared state/upload owners and default H5 callers are live；no real message was transmitted during proof without explicit authorization |

## Closed Slice W6.a5.2.15

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.15-group-members-route-parity` |
| goal | 将 RN 群设置的全部成员入口、完整成员页、搜索/索引/角色和资料返回迁移为 React Router 子路由 |
| source_anchor | RN `GroupSettingsScreen -> GroupMembersScreen`；shared group-member cache/sync/display-name facade |
| target_owner | H5 chat settings/member presentation；SDK 继续唯一持有成员数据和身份优先级 |
| verification_shape | focused 4/15、typecheck/build/full verify、真实 4-row group/search/profile-back、567/390px zero overflow/console |
| stop_condition | no presence、member mutation、friend apply、page Gateway/SQL、SDK/RN source or RTC |
| residual_seed | large group、offline cache、physical touch refresh、Safari/Firefox and authorized group management remain gated |

## Closed Slice W6.a6.1

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.1-chat-media-read-core` |
| goal | 将 cache 中真实图片、语音、视频消息接入 RN 对应的浏览器只读媒体交互 |
| source_anchor | RN media branches/previews/sound hook；Gateway generated media schemas |
| target_owner | H5 chat message projection + one feature-local media controller + image/video overlays |
| expected_deliverable | safe real URL actions、one-active-audio lifecycle、full-screen image/video surfaces、keyboard/route cleanup |
| verification_shape | message/media contract tests + full H5 app tests + SDK regression + typecheck/build/verify + guest guard |
| stop_condition | no direct API/cache/mock URL、download/save/upload/send/record/read-sync/auto-next/retry/RTC |
| residual_seed | approved account must prove real image/audio/video playback and responsive theme behavior；all deferred operations require separate contracts |

## Closed Slice W6.a5.2.14

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.14-contact-user-search-core` |
| goal | 建立 `/contacts` 搜索入口 -> `/contacts/search` -> 本地好友匹配/真实 Gateway 用户搜索 -> 既有联系人资料页的唯一主链 |
| source_anchor | RN `ContactListScreen -> ContactSearchScreen`；48px search header、local hint、server-search row、72px result row and highlighted fields |
| target_owner | existing Web `contacts` sync facade + contact search page/App route；`peerProfile` remains the sole profile/action owner |
| expected_deliverable | authenticated `searchUsers` normalization/self-filter/dedupe、local friend projection、RN core presentation、stable SPA navigation |
| verification_shape | facade auth/normalization/dedupe/failure tests + pure view tests + typecheck/build/verify + mobile/desktop light/dark/history/guest smoke |
| stop_condition | no group search/join、search-page friend mutation、page transport、mock result、fake success、duplicate peer profile or new search cache |
| residual_seed | approved account must prove local/remote result and profile navigation；group search/join remains separately bounded |

## Closed Slice W6.a5.2.13

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.13-contact-profile-core` |
| goal | 建立 contact row -> `/contacts/users/:userID` -> profile read -> real direct conversation/add-friend action 的唯一主链 |
| source_anchor | RN 120px avatar、centered profile header、ID pill、bio/action card and primary CTA；shared user/friend/conversation operations |
| target_owner | Web sync peer-profile facade + contact profile page + ContactRow/App route；shared clients/repositories remain endpoint/cache owners |
| expected_deliverable | friend/stranger/self normalization、RN core presentation、authenticated route、real conversation persistence/navigation and success-only friend application |
| verification_shape | auth/normalization/open-persist/apply/failure unit tests + view tests + typecheck/build/verify + mobile/desktop light/dark/history/guest smoke |
| stop_condition | no RTC/presence/remark/star/delete/blacklist/common groups/share/group-member context、page transport、mock data、fake success or duplicate persistence |
| residual_seed | authenticated friend/self/unknown-error and Chromium visual/history proof passed；real stranger、conversation persistence and friend-application Network result remain separately gated |

### Completed W6.a5.2.3 Migration Card

| field | frozen value |
| :--- | :--- |
| feature_slice | `/calls` 通话记录主列表，不含 RTC 通话建立与详情页 |
| phase | `W6.a5.2.3` |
| production_flow | RN/Web UI -> platform composition -> shared `createIMCallRecordSync` -> Gateway + account-scoped `call_records` SQLite cache |
| operations | `listRemote`; `listCached`; `sync`; `getDetail`; `delete`; `getPending`; `save`; `convergeTerminalSignals` |
| current_status | `done-local/mutation-gated`；RN/Web list/detail/delete 共用 shared facade，RN pending/realtime terminal 也已收敛 |
| must_have_fields | `call_id`; `conversation_id`; `direction`; `user_id`; `nickname`; `avatar_url`; `call_type`; `status`; `answer_status`; `started_at`; `answered_at`; `ended_at` |
| adapters | existing authenticated `GatewayHTTPClient`; account-scoped `DatabaseAdapter`; shared sync mutation queue |
| open_gaps | Web RTC、真实删除、双账号通话终结事件/list-back 验收仍待完成；RN 资料补齐作为显式平台 adapter 保留，不得在 Web 页面复制 |

`call_records` schema/CRUD 已归 shared SDK 所有，并通过增量补列兼容旧 RN 表；H5 页面只能通过 `WebIMSync.calls` 访问该能力。

## Deferred Residuals

| item | reason_not_active | likely_owner | candidate_verification |
| :--- | :--- | :--- | :--- |
| Real Gateway smoke | dual WebSocket online and real text delivery/SQLite convergence/list-back passed；offline SQLite hit lacks isolated observation | deployment + runtime owner | run a non-destructive offline-cache harness without stopping shared services |
| authenticated conversation UI smoke | real receiver list updated without reload and cache reread preserved preview/read convergence；offline source was not isolated | `apps/web/src/pages/conversations` | offline cache-first evidence only |
| authenticated chat UI smoke | real text send、receiver cache window and chat-back passed | `apps/web/src/pages/chat` | non-text/cross-browser/background natural samples |
| Worker SQL runtime | `done-local`: production App Worker、RPC/fatal parity 与 Vite build passed | storage worker | real-browser DB open evidence joins W5.a3 |
| multi-tab writer | `done-local/gated-browser`: lifecycle owner 已接入，缺真实浏览器矩阵 | storage runtime | three-browser two-tab concurrency test |
| Remaining RN route surfaces | prior cores/settings/onboarding core 已移除 generic 视觉；valid onboarding context、network/cache remain gated | `apps/web/src/app` + feature owners | approved onboarding real flow；then continue explicit blocked/acceptance ledger |
| Onboarding valid context | current authenticated session has no matching onboarding marker；不得伪造 marker 或创建/修改账号数据 | `apps/web/src/pages/login` + deployment owner | approved new account validates register/invite/profile Network/result and responsive light/dark/history |
| Settings final acceptance | real reads plus Chromium 390x844/760x900 light/dark/history/reload passed；notification write and Safari/Firefox absent；RN/H5 title semantic debt remains shared | `apps/web/src/pages/me/settings` + Web runtime | approved update Network/result + coordinated cross-client label decision + Safari/Firefox matrix |
| Settings permission/network/cache/version | real permission/version reads plus Chromium responsive/theme proof passed；network browser-blocked；cache storage-blocked | settings/runtime/storage/deployment owners | real update/write、update-available and Safari/Firefox acceptance；cache awaits disposable-data separation |
| Friend applications final acceptance | real 5-row historical list and Chromium responsive/theme/history/reload passed；no accept was attempted | `apps/web/src/pages/contacts` + Web SDK friend-applications facade | pending-state sample；accept still requires action-time authorization |
| Group applications final acceptance | real empty-state and Chromium responsive/theme/history/reload passed；no accept/reject was attempted | `apps/web/src/pages/contacts` + Web SDK group-applications facade | non-empty owner/admin/detail data；handling still requires action-time authorization |
| Joined groups final acceptance | authenticated 11-row list/full-sync projection、role badges、name/ID/unknown search and Chromium responsive/theme/history/reload passed | `apps/web/src/pages/contacts` + Web SDK groups facade | conversation-open persistence、offline cache isolation and Safari/Firefox remain |
| Contact profile final acceptance | authenticated friend/self/unknown-error and Chromium responsive/history proof passed | `apps/web/src/pages/contacts` + Web SDK `peerProfile` facade | real stranger、conversation open/persistence and authorized friend apply remain |
| Contact search final acceptance | known local/Gateway result、self filtering、unknown no-result and Chromium responsive proof passed | `apps/web/src/pages/contacts` + Web SDK `contacts` facade | transport/business failure and Safari/Firefox remain |
| Me final acceptance | `/me` authenticated 390x844/760x900 light/dark/history proof passed；no logout was attempted | `apps/web/src/pages/me` + Web sync/runtime | real logout Network/session/DB cleanup proof；Safari/Firefox joins W5 matrix |
| Calls real-account proof | real 2-row filters and Chromium responsive light/dark proof passed；no delete was attempted | `apps/web/src/pages/calls` + Web SDK calls facade | non-missed/duration data；delete still requires action-time authorization |
| Blacklist real-account proof | authenticated empty/search-empty、system-light/dark、permission entry、direct/history/reload and zero-overflow/zero-console passed；no remove was attempted | `apps/web/src/pages/me` + Web SDK blacklist facade | non-empty enrichment/search、approved remove Network/result and Safari/Firefox；remove still requires action-time authorization |
| Verification-code send | shared Gateway OpenAPI 无 operation；不得用 countdown/fake success 替代 | shared SDK/Gateway contract owner | backend contract available or product explicitly accepts fixed-code environment |
| Account-security final acceptance | account set/reset 本地链路已闭合，但真实 mutation 与 dark 证据未执行；contact mutation 缺 send-code contract | `apps/web/src/pages/me/security` + Web runtime | approved real set/reset Network/result/session cleanup + dark matrix；contact waits for real code-send contract |
| upstream raw WS log | `resolved 2026-08-09`: canonical owner 已清除原始 payload 日志 | `im28-sdk` | shared SDK test + H5 `npm run verify` passed |
# Activation Queue Snapshot

## W6.a6.20.149 H5 Interaction Parity Closeout

- active slice: `none`。
- owner: `activation gate`。
- expected: 只在 inventory 中出现新合同、自然数据、可用 RTC 部署或明确 mutation 授权后激活下一片。
- forbidden: 不以补页面数量代替 capability；不接不存在的验证码接口；不改 `im28-phone/src/**`；不运行 RN/Desktop/all；不改 `build:package:desktop:web`。
- verification: 新切片必须重新冻结 operation、owner、可观测结果与回滚边界。
- current state: `.149.14 completed/send-result-gated`。
- next activation: verification-code send 等待 Gateway OpenAPI；RTC 等待可用部署；真实 destructive/member/media/settings 操作与跨浏览器验收等待对应条件。
- residual seeds: `.149.4` RTC external deployment；Toast authenticated action/browser samples；真实 destructive/member/media operation；Safari/Firefox matrix。

### `.149.5b` Progress

- custom emoji manager: 添加/删除/排序 success/error 已接入唯一全局 Toast；初始化同步失败保留页面状态；旧成功横幅状态和 CSS 已删除。
- evidence: focused 2/7、full 147/476、Web typecheck、1198-module build；真实 412px 页面 inline success=0、Toast host=1、zero overflow/log。
- verification/blacklist/calls: 好友通过、群申请通过/拒绝、解除黑名单和通话删除 success/error 已接入唯一全局 Toast；加载、刷新、分页及删除后缓存重读失败保留页面状态；通话删除成功不再被后续 cache 重读失败误报。
- group/settings/media: 群设置、管理员/群主、建群、成员邀请/移除、群资料/文本、群生命周期、已加入群和媒体打开/下载的瞬时结果已进入全局 Toast；`remote-only`、权限和加载错误仍保留结构 owner；跨路由操作在导航前发出 Toast。
- evidence: focused 3/18、full 149/492、466 assets、Web typecheck、production build、diff check；RN business 未改且未执行真实 mutation。
- verification-code gap: 用户确认验证码发送暂不接入；Gateway OpenAPI 无 operation，保持固定 `666666` 联调提示，禁止 fake success/countdown。
- closeout: `.149.5b local-complete/authenticated-action-gated`；真实成功/失败像素、服务端结果、SQLite/realtime/list-back 仍需对应 operation 的单独授权。

### Closed `.149.10`

- SSOT: `IM28_H5_RN_PARITY_INVENTORY.md`。
- result: 普通 RN production route 缺口 `0 confirmed`；联系方式验证码/绑定归 `contract-blocked`，native network/cache 归 `web-not-applicable`，真实写操作/媒体/RTC/跨浏览器归 `acceptance-gated`。
- next: `.149.11` 只收敛 permission update、version check、sign-out failure 的反馈 owner，不执行真实 mutation。

### Closed `.149.11`

- permission update、version check、sign-out success/error 已进入唯一全局 Toast；settings/profile load error 仍保留页面结构和 retry。
- evidence: focused 1/13、full 149/493、466 assets、Web typecheck/build、diff/RN boundary。
- real operations: 未执行；继续按逐 operation 授权门管理。

### Closed `.149.12`

- responsibility: `ChatSettingsPage.tsx` 保留数据加载、presence、mutation 和确认编排；`ChatSettingsCards.tsx` 承载首卡、成员预览、头像、搜索和清空入口纯展示。
- behavior: route、SDK facade、permission、Toast、remote-only、destructive 与 lifecycle semantics 不变。
- evidence: 343/202 LoC；focused 4/29；full 149/493；466 assets；Web typecheck/build；现有账号单聊/群聊设置 readonly browser zero-error。
- protection: SDK/RN business 未改；验证码发送继续不接不存在的接口。

### Closed `.149.6`

- deliverable: 多选转发目标改为单选；确认目标只解析真实会话并通过 React Router 进入目标聊天待发送草稿，不再调用 `forwardToTargets`；最终发送继续由目标 Composer 的 shared `messages.forward` 承担。
- state boundary: route state 只包含来源 conversation、标题和有序 clientMsgIDs；目标页从当前账号 SDK cache 恢复消息；更换接收人取消时保留原草稿。
- evidence: focused 2/8、full 147/475、Web typecheck、1198-module build；真实登录态选择 2 条进入 `donk` 会话并显示待发送摘要，消息历史未新增。
- verdict: `completed/send-action-gated`；真实最终发送与第二账号 list-back 未执行。

### Superseded `.149.7`

- deliverable: 旧 transfer-first 编排保留为历史记录；当前实现已由 `.149.71` 的 earliest-admin + single-leave/Gateway-auto-transfer 替代。
- owner boundary: 页面只投影 shared permissions 和路由意图；`groupMembers.transferOwner`、`groupLifecycle.leave/dismiss` 继续由 SDK owner 承担。
- evidence: focused 3/17、full 147/478、Web typecheck、1198-module build；真实 owner 群显示双入口，退出进入 2 位候选页并可无副作用关闭返回，412/412、零 error log。
- verdict: `superseded-by-.149.71`；真实退群、解散和第二账号 list-back 未执行。

### Closed `.149.8`

- deliverable: 会话删除确认层改为全宽贴底；群聊全员清空按钮只消费 SDK 群详情的显式 `can_clear_message`，缓存缺字段时 shared `fetchDetail` 补齐，角色不得推断权限。
- evidence: SDK focused 12；H5 focused 7；最终 full H5 149/484、SDK Web 101/426、466 assets、两侧 typecheck、1198-module build；真实有/无权限群按钮分支通过。
- verdict: `completed/destructive-action-gated`；未点击任何删除，真实 self/both/all-members 与多账号 list-back 待动作时授权。

### Closed `.149.9`

- deliverable: H5 呼出保持 shared call-control/Web outgoing/LiveKit 单一 owner，只有真实 start 成功后才提交 active call 与 `/calls/active`；失败留在来源页并走全局 error Toast；重复点击锁覆盖完整异步启动。
- evidence: 真实测试账号 `/v1/call/start` 返回“服务不可用”且无 call ID/credential，H5 未跳转活动页；H5 full 149/484、SDK Web 101/426、466 assets、两侧 typecheck、1198-module build。
- verdict: `completed/client-converged/external-rtc-gated`；dev RTC 后端不可用，双账号接通、远端媒体、控制、挂断、pending/终态/list-back 待环境恢复。

### Closed `.149.5a`

- deliverable: 23 个生产页面/反馈 owner 接入唯一 Toast；四类分享/二维码/资料/账号/通知/联系人/申请动作覆盖；输入壳焦点描边与 copy-state 死 CSS 清零。
- evidence: focused 6/28、full 147/473、typecheck、1198-module build、5176 guest success Toast 与 1280px zero-overflow。
- verdict: `local-complete/authenticated-action-gated`；加载/权限/空态/媒体/RTC/显式重试状态仍保持页面 owner。

### Closed `.149.3/.149.4`

- deliverable: type108 名片正式点击链；设置/input/确认按钮样式；录音态动效；RTC 正式 owner 审计。
- evidence: card 2/15、recorder/auto-delete/call 5/17、typecheck、1197-module build。
- verdict: `.149.3 local-complete/browser-session-gated; .149.4 local-complete/external-rtc-gated`。

### Closed `.149.1`

- deliverable: 多选 selector 左对齐、Navbar 取消/数量、底部转发/删除、全局 Toast foundation。
- evidence: focused 3/7、typecheck、1197-module build；browser 被另一 tab SQLite lease fail-closed。
- verdict: `local-complete/browser-session-gated`。

### Closed `.149.2`

- deliverable: 四类分享 friend-only single selection；个人/群二维码共用 `InteractionModal`。
- evidence: focused 3/9、typecheck、1197-module build；真实发送和 browser pixel 分别 mutation/session gated。
- verdict: `local-complete/browser-session-gated/send-mutation-gated`。

## W6.a6.20.24 Chat Sender Avatar Mention Gesture

- status: `closed-local/browser-data-gated`
- owner chain: `ChatMessageList -> ChatGroupSenderAvatar -> one-shot mention request -> ChatComposer -> useChatComposerMentions -> existing mention send flow`。
- completed: 可见 incoming 群头像按 RN 500ms/8px 长按提及，桌面右键同义；普通点击继续走资料 SPA；提及复用 shared 显示名，追加 `@昵称 ` 或替换末尾查询，并登记稳定 member selection。
- fail-closed: outgoing/单聊/系统消息、缺失成员、自身、编辑态和引用态都不产生提及；动作不直接发送、不写 SQLite、不新增 Gateway/OpenIM 分支。
- structure: 新增 64 行头像展示 owner 与 111 行手势 owner；`ChatMessageBubble` 收敛至 281 行，避免资料/手势逻辑继续膨胀。
- verification: focused 2 files/10 tests；full Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1122-module build；cleanup P0/P1 zero。
- browser gate: 匿名标签验证 dev/登录守卫/1280px 零 overflow；未伪造 sessionStorage，真实 incoming 群头像长按与草稿结果仍待已登录样本。
- protected: `im28-phone` clean；SDK source 未因本片调整；未运行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，按 RN 页面、动作、状态重新生成剩余缺口清单。

## W6.a6.20.26 Chat Custom Emoji Bubble Preview

- status: `closed-local/browser-data-gated`。
- owner chain: `Message -> getChatMessageView -> ChatCustomEmojiMessageContent -> existing ChatMediaInteractionProvider -> ChatMediaPreviewOverlay`。
- completed: type115 快照尺寸映射、旧消息自然尺寸探测、180px 比例气泡、非法 URL/解码失败 fail-closed、无工具栏纯图片预览。
- preserved: 普通图片保存、表情发送/收藏/manager/recent、SDK/Gateway/SQLite 和 RN business 均未改变。
- verification: focused 3 files/15 tests；full Web SDK 89 files/371 tests；466 assets；runtime boundary、SDK/H5 typecheck、1125-module build；真实 412px group route zero overflow/error/broken image。
- browser gate: 当前真实群聊无 type115，未注入假消息或发送测试消息；横/竖资源与点击关闭仍待自然样本。
- protected: `im28-phone` clean；仅执行 `build:web/sync:web`；未运行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，继续选择不需 RN 业务改动的确定性缺口。

## W6.a6.20.27 Chat Initial Unread Navigation

- status: `closed-local/browser-data-gated`。
- owner chain: `Conversation.lastReadSeq + Message[] -> SDK getIMInitialUnreadNavigation -> H5 useChatUnreadNavigation -> ChatMessageList`。
- completed: 精确 uint64 incoming 未读、type1201 边界、server/client 双身份、最后已读锚点、未读分割线/浮层、80% 可见度和用户离开最新端后的滚动保护。
- fail-closed: 非法/缺失边界不制造未读；搜索定位不与首入页定位竞争；只读滚动不写 SQLite/Gateway，不调用 markRead/read receipt。
- verification: SDK focused 1/3、H5 focused 2/8、full Web SDK 90/374、466 assets、runtime boundary、SDK RN/Web/Desktop 与 H5 typecheck、1127-module build；cleanup P0/P1 zero。
- browser gate: 当前真实三个会话均无未读角标；412px 证实零误画、latest edge=0、bodyWidth=viewportWidth=412、系统消息稳定身份和零 console error；非零样本不得伪造。
- protected: `im28-phone` worktree clean；仅执行 `build:web/sync:web`；未执行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，继续按 RN page/action/state 选择不需 RN 业务改动的确定性残余。

## W6.a6.20.28 Chat Visible Unread Read Convergence

- status: `closed-local/browser-data-gated`。
- owner chain: `DOM/native visible stable IDs -> SDK getIMVisibleUnreadReadSeq -> converged conversations.markRead -> Gateway -> success-only ConversationRepository`。
- completed: 80% 可见 incoming 最高 seq、短列表测量放行、长列表用户滚动/显式入口/最新端 realtime 放行、单调去重与失败重试；partial read 不再无条件清零缓存角标。
- fail-closed: 无会话 unread 事实、未定位/未测量、初始长列表程序化滚动、outgoing、非法 seq 和搜索定位均不提交；Gateway 失败不更新会话。
- verification: SDK focused 2/8、H5 focused 2/4、full Web SDK 90/376、466 assets、runtime boundary、SDK RN/Web/Desktop 与 H5 typecheck、1128-module build；cleanup P0/P1 zero。
- browser gate: 当前真实三个会话无未读；412px route 零误画/overflow，clean reload 后零 error；browser 隔离环境无 resource timing，未声称 Network 零请求证据。
- protected: `im28-phone` worktree clean，RN business/caller 未改；仅 `build:web/sync:web`；未执行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，从剩余 chat history pagination/sticky date 或其他无 RN 改动缺口继续。

## W6.a6.20.23 Chat Sender Avatar Profile Entry

- status: `closed-local/browser-data-gated`
- owner chain: `ChatMessageList -> ChatMessageBubble avatar Link -> ContactProfilePage -> W6.a6.20.22 validated group context`。
- completed: incoming group message 的可见分组头像改为 React Router Link；只携带 stable user/conversation IDs 与当前聊天 backHref；空身份 fail-closed；资料页新增当前聊天返回白名单。
- verification: focused 2 files/15 tests；full Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1120-module build；cleanup P0/P1 zero。
- browser gate: 真实 412px 群聊仅含系统创建消息，无 incoming sender avatar 样本；页面零 overflow，未发送测试消息。
- accepted debt: 仓库无 `scripts/check-convergence.sh`；真实头像点击/history 和群消息 mute profile context 待后续样本/授权。
- protected: `im28-phone` business clean；SDK source 未改；未运行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，继续选择不需要 RN 业务改动、非破坏且有真实样本的缺口。

## W6.a6.20.22 Group Member Restricted Profile Context

- status: `closed-local/browser-readonly-pass/data-gated`
- owner chain: `React Router candidate -> WebIMSync.conversations -> WebIMSync.groups -> WebIMSync.groupMembers -> resolveIMGroupMemberDisplayName -> ContactProfilePage`
- completed: 群设置预览和完整成员列表传递稳定会话上下文；资料页重新校验真实群/成员；明确禁止互加时隐藏关系动作与敏感字段；加载/失败 fail-closed；本人保持完整资料。
- verification: focused 3 files/22 tests；full Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1120-module build；真实允许互加群 412px 只读 smoke 通过。
- gated: 真实禁止互加群样本、Safari/Firefox history state、群消息头像携带的禁言上下文；不制造群配置 mutation。
- protected: `im28-phone` business clean；未运行 RN/Desktop/build:all 或 `build:package:desktop:web`。
- next: `W6-rn-parity-residual-inventory-refresh`，重新按 RN page/action/state 对 H5 route/owner 做残余检索。

## W6.a6.20.118 Chat Header Presence

- owner chain: `ChatPage -> useObservedUserPresence -> WebIMSync.presence -> buildChatHeaderPresenceView -> ChatHeader`。
- completed: 单聊明确状态展示在线/离线；未知状态隐藏圆点并保留高度；普通群去重统计明确在线成员；large/unknown 群 fail-closed。
- verification: focused 2 files/8 tests、H5 typecheck/build；真实 donk三大爷显示离线，普通群当前显示 1 人在线，412px 无页面横向溢出或 console error。
- protected: SDK/RN business source 不改；不写 presence DTO/SQLite；不新增 Gateway/WebSocket owner；禁跑脚本未执行。
- next: 继续 RN/H5 功能残余检索，presence 的 large 群和 realtime 转换保留自然样本 gate。

## W6.a6.20.149.13 Forward Preview RN Parity

- status: `closed-local/browser-readonly-pass/send-result-gated`。
- owner chain: `ChatForwardComposer -> ChatForwardPreviewModal -> shared message view + existing ChatMessageContent -> useChatForwardFlow.submitForward`。
- completed: RN 60% 预览面板、底部 outgoing 气泡、30px 多选、发送者显示切换、修改收件人、应用和取消四项菜单；异类相邻发送者不再错误合并气泡组。
- fail-closed: 至少保留一条来源；不支持隐藏来源的消息集合禁用该动作；Escape/遮罩只应用本地选择；预览组件不持有 `onSubmit` 或发送 facade。
- verification: focused 2 files/7 tests；full H5 150 files/497 tests；466 assets；Web typecheck；1203-module production build；382×786 真实已登录 DOM、尺寸、截图与零日志验收。
- cleanup: 新组件 239 行、唯一生产消费者、P0/P1 zero；无 orphan、compat wrapper、重复 parser、TODO/FIXME/HACK、console 或 fake-success；仓库无 `scripts/check-convergence.sh` 和 runtime-contracts 文档。
- protected: `im28-phone` business/source 和 SDK source/generated 零改动；不运行 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web`；不点击发送。
- gated: Figma 文件需登录；Safari/Firefox、物理触摸、真实发送 partial result/realtime/list-back 继续按独立授权验收。
- next: 继续 inventory 中 backend-contract/deployment/natural-data gate；验证码发送 operation 未提供前保持 blocked，禁止 fake success。

## W6.a6.20.149.14 Forward Composer Sender Summary

- status: `closed-local/browser-readonly-pass/send-result-gated`。
- owner chain: `route source IDs -> cached messages/conversation/group members -> chat-forward-composer-view -> ChatForwardComposer`。
- completed: 多条摘要按首次出现去重显示“来自：A，B”；本人显示“您自己”，来源单聊使用对端名，来源群聊复用 shared 成员展示优先级，超过两人显示“等N人”。
- fail-closed: 名称 cache 读取失败只退回 `formatIMUserDisplayName`，不使完整消息草稿失效；目标会话标题不参与来源名称；不改正文、route state 或 send facade。
- verification: focused 2 files/7 tests；full H5 151 files/500 tests；Web typecheck；1204-module production build；382×786 真实链显示“来自：donk二大爷，您自己”，document=`382/382`。
- cleanup: helper 81 行、唯一生产消费者、P0/P1 zero；无 TODO/FIXME/HACK、console、fake-success、孤立导出或重复 payload parser；仓库无 `scripts/check-convergence.sh`。
- protected: SDK/RN business 零改动；未执行 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web`；未点击最终发送。
- next: 保持 send partial-result/realtime/list-back、Safari/Firefox 和 physical touch gate；验证码发送合同继续 blocked。

## W6.a6.20.149.15 Voice Playback Natural-Data Acceptance

- status: `completed/chromium-pass/browser-matrix-gated`。
- owner chain: `ChatMessageContent voice action -> ChatMediaInteractionProvider -> browser audio element -> message-local playing state`。
- completed: 使用真实缓存 5 秒语音验证点击播放、`pressed` 停止态与自然结束回落；没有 fixture、上传、发送或消息 mutation。
- draft safety: 页面既有 2 条待发送转发草稿保持完整，未点击最终发送。
- verification: `.149.14` focused 1 file/3 tests、H5 typecheck、diff check；SDK source 零改动，RN 仅用户已有 `src/config/appVersion.ts`。
- gated: 物理设备听感、后台/中断、过期 signed URL，以及视频/文件打开下载仍需对应 runtime 或自然样本；Firefox/WebKit 由 `.149.64` 关闭，系统 Safari 由 `.149.89` 关闭。
- next: 仅在 inventory 出现新自然数据、可用 RTC、明确 mutation 授权或后端验证码合同后激活下一片。

## W6.a6.20.149.16 Forward-Origin Display Name

- status: `completed/send-result-gated`。
- owner chain: `useChatForwardFlow resolved sender map -> ChatForwardComposer -> ChatForwardPreviewModal -> ChatForwardOrigin`。
- completed: 普通来源消息新建预览来源头时消费备注/群昵称/昵称结果，不再直接显示 `im-xxxx`；摘要与气泡共用同一来源名称表。
- history safety: 已有 `forwardOrigin` 继续保留历史原发送者快照；隐藏发送者仍完全移除来源头；不改最终 send facade。
- verification: focused 2 files/9 tests；full H5 151 files/502 tests；466 assets；H5 typecheck；1204-module build；diff check。
- cleanup: 纯函数唯一生产消费者；3 个生产文件 143/245/101 行；无 mock/fake-success、临时标记、调试日志、重复解析或 orphan export；P0/P1 zero。
- protected: SDK source/generated 零改动；RN 仅用户已有 `src/config/appVersion.ts`；未运行 RN/Desktop/all 或 `build:package:desktop:web`；未发送。
- next: 保持真实 send partial-result/realtime/list-back、fresh raw missing-name sample、Safari/Firefox 和 physical touch gate。

## W6.a6.20.149.20 Group Member Picker Modal Parity

- status: `closed-local/browser-readonly-pass/mutation-gated`。
- goal: 将邀请群成员与移除群成员从独立全屏页收敛为群设置页上的共用 100% x 60dvh 底部选择弹窗。
- H5 owner: `GroupMemberPickerModal` 只持有 dialog、关闭栏和尺寸；邀请/移除页面继续持有各自 presentation，shared `WebIMSync.groupMembers` 继续唯一持有 mutation 与缓存收敛。
- route contract: `/settings/members/invite|remove` 保持可直达和可追踪，路由先渲染 `ChatSettingsPage`，再叠加选择 dialog；关闭统一 replace 回 `/settings`。
- verification: focused 4 files/20 tests、H5 full 152 files/505 tests、typecheck、1206-module build；382x786 light/dark 两路由背景、空态、2 候选、disabled、close 与 overflow 只读验收。
- not authorized: 点击最终邀请或移除、第二账号 realtime/list-back、SDK/RN business、SDK RN/Desktop/all build/sync、`build:package:desktop:web`。

## W6.a6.20.149.88 System Safari Microphone Activation Audit

- status: `completed-readonly/tooling-gated`。
- activation audit: 好友申请仅有已完成历史、群申请/黑名单为空，4 条真实会话无普通视频/文件，均未形成新的可验收自然样本。
- system Safari: 真实账号登录、4 条会话恢复、含 7 条语音的单聊渲染与“语音消息/按住说话”模式切换通过。
- tooling gate: 普通 click 不启动录音；Computer Use 无法对 Safari 执行持续 pointer hold/上滑，返回 `noWindowsAvailable`，因此权限 prompt、拒绝恢复、上滑取消与成功采集继续 gated。
- protected: 未发送消息、未改变申请/关系/群/黑名单状态；H5/SDK/RN production source 零改动。
- next: 只在出现自然数据、明确 mutation 授权、可持续按压的 Safari/实体设备、可用 RTC 或新后端 contract 时激活下一片。

## W6.a6.20.149.89 System Safari Voice Playback Acceptance

- status: `completed-production-readonly`。
- owner chain: `ChatMessageContent voice action -> ChatMediaInteractionProvider -> system Safari audio element -> message-local playing state`。
- completed: 真实 7 秒语音经历加载、`停止语音/on` 活动态与自然结束后的全量 `播放语音/off` 复位；截图保留活动播放视觉证据。
- protection: 不新增媒体 owner、adapter 或 fake-success；未录音、发送、删除或修改任何业务数据，H5/SDK/RN production source 零改动。
- gated: 手动停止稳定时序、过期签名 URL、后台/中断、实体设备听感与录音权限链继续独立验收。
- next: 返回 active ledger，等待自然数据、明确 mutation 授权、可持续按压设备、RTC deployment 或新后端 contract。

## W6.a6.20.149.90 Ordinary Image Runtime Recheck

- status: `completed-production-readonly-safari-pixel-evidence-gated`。
- owner chain: `shared persisted image payload -> getChatMessageView -> ChatMediaMessageContent -> ChatMediaInteractionProvider -> ChatMediaPreviewOverlay`。
- completed: 复用正式 640x360 PNG，H5 内嵌浏览器验证缩略图 180x101、全屏 640x360 解码、关闭与 reload 回读；系统 Safari 验证预览入口、覆盖层、关闭、保存控件和 reload 回读。
- cross-check: 原始 OSS URL 下载后确认为 640x360 RGBA PNG；内嵌浏览器 DOM/截图显示完整图片，排除消息 URL、资源内容、比例计算和通用预览 owner 缺陷。
- tooling gate: 系统 Safari 截图持续只捕获黑色媒体背景，无法把跨域图片合成层形成像素证据；不据此修改 production code，也不声明 Safari 像素显示通过或失败。
- protected: 未点击保存/分享、未发送或修改消息；H5/SDK/RN production source 零改动，未运行任何 SDK/RN/Desktop/all build/sync。
- next: 等待普通视频/文件自然样本、可捕获 Safari 媒体合成层的工具或实体设备，以及其余 natural-data/business-mutation/deployment/backend-contract 激活条件。

## W6.a6.20.149.91 Main Tab Cache-First Verification Realtime

- status: `implemented-local/dual-account-realtime-gated`。
- owner chain: `Gateway WS verification event -> Web runtime verificationVersion -> verification unread facades -> PrimaryTabs badge`；`Activity tab entry -> shared listCached -> silent full facade sync -> array-gated Repository replacement -> cache reread`。
- completed: `type=1200/friend_application_created` 与好友/群申请生命周期事件触发通讯录角标权威重读；通讯录进入时先恢复 SQLite，再独立同步好友列表和我的群聊；消息进入时先恢复普通/归档会话，再同步两份全量快照；归档页与通话页同样 cache-first 后静默校准。
- failure contract: collection operation 必须成功且明确返回数组才允许替换 SQLite；分页、字段、账号或持久化失败保留旧 cache，显式成功空数组可清空；verification revision 不猜增量、不先把现有角标置零。
- verification: SDK focused 5 files/29 tests、`typecheck:web`、`build:web/sync:web`；H5 focused 4 files/10 tests、production build；H5 全量 typecheck 仅被既有 QR/Node test 三处无关错误阻断。
- cleanup: shared DTO/array guard/realtime revision 位于 SDK，H5 只有 tab lifecycle 编排；无 fake-success、console、第二套 Gateway mapper 或 Repository writer；`im28-phone` worktree clean。
- protected: 未运行 RN/Desktop/all build/sync 或 `build:package:desktop:web`；RN business/source 未改。
- gated: 真实第二账号申请后 badge、好友/群/普通/归档/通话列表 Network -> SQLite -> reload 证据，及现有 H5 三处无关 typecheck 错误的独立修复。
