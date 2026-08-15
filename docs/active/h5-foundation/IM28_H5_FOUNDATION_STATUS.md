# IM28 H5 Foundation Status

- status: `active/activation-gated`
- current_step: `W6.a6.20.149.99 Ordinary Video/File System Safari Acceptance/completed-readonly`
- next_step: `等待 pending 好友/群申请自然样本或审核授权、自然通话记录/详情样本、麦克风权限桥接、新 contract、RTC 联调、实体设备与其余业务 mutation 验收；验证码发送 operation 未提供前保持 blocked`

## W6.a6.20.149.99 Ordinary Video/File System Safari Acceptance (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| activation | `pass` | 用户手动解锁 macOS 并允许 Safari 远程自动化；系统 Safari 26.4 的 `safaridriver` 成功建立真实会话并打开 production 登录页 | none |
| ordinary file | `pass-readonly` | 独立 Safari automation session 登录 `donk`，等待真实会话列表同步后点击目标单聊；展示 `IM28-H5-FILE-ACCEPTANCE.txt / 137 B`，route reload 后仍可读 | 大文件、下载内容、失败重试 |
| ordinary video | `pass-playback` | 展示 `0:02` 视频入口；Safari 原生 `video.play()` 成功，`readyState=4`、`320x180`、duration=2s、timeline=0.30s、`errorCode=null`；截图含真实蓝色视频帧 | 其他编码、全屏/下载、后台生命周期、实体设备 |
| layout/persistence | `pass` | 382x786 聊天/播放截图目检通过，document=`382/382`；刷新后同一文件卡片和视频入口均由正式 route/SQLite 恢复 | refresh 截图短暂显示联系人关系恢复，不影响消息回读 |
| mutation protection | `pass` | 未发送、下载、mark-read 或执行 Gateway/SQLite mutation；H5/SDK/RN production source 零改动 | none |

Closeout verdict: `.149.99 completed-readonly/system-safari-playback-pass`。普通文件/视频已保留生产消息的 system Safari“登录 -> 会话列表 -> 文件卡片/视频入口 -> 真实解码播放 -> route reload 回读”门禁关闭；不外推到其他编码、大文件、下载内容、失败恢复、后台生命周期或实体设备。

## W6.a6.20.149.98 Ordinary Video/File Cross-Browser Acceptance (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| isolated production path | `pass-readonly` | Firefox/WebKit 分别使用全新独立 profile 登录发送方 `donk`，等待真实会话列表完成同步后点击目标单聊；未重复发送或注入缓存 | none |
| ordinary file | `pass-readonly` | 两端均展示 `IM28-H5-FILE-ACCEPTANCE.txt / 137 B` 正式文件卡片，route reload 后仍可见 | 大文件、下载内容校验、失败重试 |
| ordinary video | `pass-playback` | 两端均展示 `0:02` 视频入口；原生 `video.play()` 成功，`readyState=4`、`320x180`、duration=2s，时间轴推进至约 0.26s | system Safari、其他编码、全屏/下载、后台生命周期 |
| layout/runtime | `pass` | 382x786 消息与预览截图完成目检；document=`382/382`；两端 console/page/request/HTTP blocking errors 均为 0 | physical device |
| persistence/protection | `pass` | Firefox/WebKit reload 后文件与视频均保持可见；无 send/download/Gateway/SQLite mutation，H5/SDK/RN production source 零改动 | none |

Closeout verdict: `.149.98 completed-readonly/firefox-webkit-playback-pass`。普通文件/视频已保留自然消息的跨浏览器“会话恢复 -> 文件卡片/视频入口 -> 视频真实解码播放 -> route reload 回读”门禁关闭；不外推到 system Safari、实体设备、其他编码、大文件、下载校验、失败恢复或断线补洞。

## W6.a6.20.149.97 Ordinary Video/File Dual-Account Acceptance (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| exact authorization | `pass` | 用户在最终发送前明确确认；发送端 `donk`，接收端 `donk三大爷`，目标会话 `019ff6cd-c8df-7aa1-82ad-bb39e1aa4b02` | none |
| ordinary file | `pass-production` | `IM28-H5-FILE-ACCEPTANCE.txt` 137 B 经正式 Composer 显式提交；发送端与接收端活动聊天均展示文件卡片 | 大文件、失败重试与下载内容校验 |
| ordinary video | `pass-production` | 320x180、约 2 秒 H.264 MP4 经正式相册/媒体链发送；双端活动聊天均展示可播放视频消息和 `0:02` 时长 | Firefox/WebKit 读取与播放已由 `.149.98` 关闭；system Safari、编码矩阵、全屏播放与下载仍 gated |
| WebSocket realtime | `pass` | 接收端保持目标聊天 route，文件和视频均在不离开页面的情况下出现；未靠列表往返触发重读 | 断线、重连、补洞和多窗口竞争 |
| SQLite persistence | `pass` | 双端同时 reload 后文件和视频仍存在；接收端列表摘要更新为 `[视频]`，时间 `13:55`，未读 `5 -> 7` | 长历史分页、清理与容量压力 |
| runtime/repository protection | `pass` | 双端 warning/error 为 0；仅 Vite debug/React DevTools info；H5/SDK/RN production source 零改动，未运行 SDK build/sync | Firefox/WebKit 已由 `.149.98` 关闭；system Safari/device 仍 gated |

Closeout verdict: `.149.97 completed-production/dual-account-realtime-persisted`。普通文件和普通视频的“正式发送 -> 接收端活动页 WebSocket -> message/conversation SQLite -> 双端刷新回读 -> 会话摘要”链已关闭；Firefox/WebKit 只读播放由 `.149.98` 补证，不外推到大文件、失败/断线恢复、system Safari、实体设备或媒体下载。

## W6.a6.20.149.96 Personal QR Safari Download Acceptance (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| authenticated source | `pass` | system Safari 真实登录态打开 `/me/qrcode`，展示 `donk / 68078541335` 与“下载二维码”正式动作 | none |
| file contract | `pass` | 生成 `im28-user-qr-68078541335.png`；`13,673 bytes`、`472x472`、8-bit RGBA、non-interlaced PNG | none |
| payload decode | `pass` | macOS Vision 反解为 `{"source":"myCard","payload":{"id":"68078541335"}}` | none |
| cleanup | `pass` | 验收后仅删除本次可重新下载的目标 PNG；无消息、关系、群、Gateway 或 SQLite mutation | none |
| runtime protection | `pass` | H5/SDK/RN production source 零改动，未运行任何 SDK/RN/Desktop/all build 或 sync | camera scan、应用内分享最终发送、实体设备 |

Closeout verdict: `.149.96 completed-production/local-file-decoded`。个人二维码的“展示 -> Safari 下载 -> PNG 落盘 -> payload 反解”链已关闭，并继续复用与群二维码相同的 Web 导出 owner；结论不外推到相机扫码、应用内分享最终发送或实体设备。

## W6.a6.20.149.95 Production Vendor Chunk Convergence (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| build ownership | `pass` | `vite.config.ts` 仅按 node_modules 路径拆出 React、Zod、qrcode vendor；页面、runtime、SDK、SQLite、WS 和业务 owner 不变 | none |
| chunk convergence | `pass` | app index `547.7 -> 369.5 kB`；shared runtime `612.4 -> 492.5 kB`；React `228.9 kB`、validation `68.5 kB`、QR `23.5 kB` 独立 | LiveKit 单依赖 `505.5 kB` 仍略高于 Vite 500 kB 默认阈值 |
| production preview | `pass` | 1242-module build 后独立 preview 进入 `/auth/phone`；入口 JS/CSS 与新 vendor chunks 全部 HTTP 200，浏览器 warning/error 为 0 | authenticated production-preview route 未重复启动第二 SQLite writer |
| verification | `pass` | H5 182 files/589 tests、Web typecheck、466 assets、production build、preview smoke、diff check | none |
| personal QR activation | `blocked-environment` | 当前真实资料 `/me/qrcode` 恢复 `donk / 68078541335` 与 472x472 canvas；内嵌浏览器不产生可追踪 download event，system Safari 被 macOS 锁屏阻断 | 解锁系统后复用既有 Safari 下载链完成个人 PNG 落盘与 payload 反解 |
| repository protection | `pass` | SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；未运行 SDK/RN/Desktop/all build/sync | none |

Closeout verdict: `.149.95 completed-local/vendor-chunks-converged/livekit-warning-retained`。本地可安全收敛的 app/runtime 聚合告警已关闭；LiveKit 保持独立 lazy chunk 且只超阈值约 5.5 kB，不通过抬高阈值隐藏。个人二维码真实 Safari 下载仍是锁屏环境门禁，不声明完成。

## W6.a6.20.149.94 Migration Final Local Closeout Audit (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| local capability inventory | `pass` | parity matrix 没有 `partial` 行；剩余项均为 natural data、真实 mutation、RTC、camera/browser/device 或缺失 OpenAPI contract gate | 需要外部激活条件，不得自动执行 |
| anti-mock/fake-success | `pass` | production source 无 `parityRuntime`、`localMock`、test-mode 业务分支、`setTimeout(resolve)` 或 fake-success path | none |
| architecture/owner | `pass` | 页面/组件无 Gateway client、Repository、SQL/WebSocket 直连；唯一页面 `fetch` 位于已登记的浏览器媒体下载 adapter | UI preference/localStorage、clipboard、media/browser I/O 保持 H5 platform owner |
| cleanup | `pass` | 无 TODO/FIXME/HACK/WIP、调试 console、未实现异常、重复导出名或 >300 行生产 TS/TSX；唯一零生产入边文件是被 10 个测试消费的 fixture | 既有 >500 kB chunk performance warning |
| verification | `pass` | H5 182 files/589 tests、Web typecheck、466 assets、1242-module production build、HTTP 200、`git diff --check` | none |
| repository protection | `pass` | SDK clean；RN 仅保留用户既有 `src/config/appVersion.ts` 修改；本片未运行 SDK/RN/Desktop/all build/sync | none |

Closeout verdict: `.149.94 completed-local/P0-P1-zero/external-activation-gated`。当前 H5 迁移在本地可实现范围内没有未登记 P0/P1，也没有可安全自动激活的下一片；整体不能标为产品验收完成，后续必须由真实自然数据、明确 mutation 授权、可用 RTC/相机/设备环境或新 OpenAPI contract 激活。

## W6.a6.20.149.93 Group QR Download And Shared Export Owner (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| production group QR | `pass` | 真实群 `donk的群聊 / 97524759106` 在 system Safari 点击“下载二维码”，生成 `im28-group-qr-97524759106.png` | none |
| file and decode | `pass` | 文件为 13,277 字节、472x472 RGBA PNG；ZXing 反解为 `{"source":"groupCard","payload":{"id":"97524759106"}}` | none |
| shared owner | `pass-contract` | `ProfileQRCodePage` 与 `GroupQRCodePage` 都直接消费唯一 `QRCodeDisplay`；Canvas、PNG 导出、下载 Toast 与底部模态没有第二实现 | 个人二维码实际下载仍需独立登录态运行时取证 |
| cleanup | `pass` | 只删除本次明确下载文件；群、关系、消息、SQLite 和路由状态均未修改 | none |
| runtime protection | `pass` | production code、SDK、RN 零改动；未运行 SDK/RN/Desktop/all build/sync | none |

Closeout verdict: `.149.93 completed-production-local-file-decoded`。真实群二维码的“展示 -> 下载 -> PNG 落盘 -> payload 反解”链已关闭，并证明个人/群二维码共用同一 Web 导出 owner；结论不外推到个人二维码实际落盘、应用内分享最终发送、相机扫描或实体设备。

## W6.a6.20.149.92 Safari Ordinary Image Final Download (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| system permission | `pass` | 在 `.149.91` 已验证的 Safari 下载提示中点击“允许”，正式图片完成本地保存 | Safari 已记录本地开发站点下载授权 |
| file identity | `pass` | 文件名 `a0c68aa4-4da1-480f-8275-aff22f12c07b.png`，大小 29,509 字节，格式为 8-bit RGBA non-interlaced PNG | none |
| dimensions | `pass` | `file` 与 `sips` 均确认 640x360，与消息 payload/预览自然尺寸一致 | none |
| byte integrity | `pass` | 本地文件与 OSS 原 URL 的 SHA-256 均为 `1fdfbee8720797719d27cb3a4e63e2b1fe8870b873efb7cb6d2890f2e8dbe95d` | none |
| cleanup | `pass` | 只删除本次明确文件；下载目录不再存在目标文件，消息、SQLite、关系和群状态不变 | none |
| runtime protection | `pass` | 本片 production code、SDK、RN 零改动；未运行任何 SDK/RN/Desktop/all build/sync | none |

Closeout verdict: `.149.92 completed-production-local-file-verified`。普通图片在 system Safari 的“预览 -> 保存 -> 权限 -> 文件落盘 -> 字节一致性”链已完整关闭；结论不外推到普通视频、文件消息、过期 signed URL 或物理移动设备。

## W6.a6.20.149.91 Safari Ordinary Image Save Boundary (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| defect reproduction | `pass-fixed` | 原 Blob 路径在 Safari 点击后无权限提示、无下载文件；异步 `fetch` 已越过 Safari 用户手势窗口 | none |
| platform branch | `pass` | 安全 HTTP(S) URL 与清理后文件名保持统一；Safari 在同步 click 内直接提交 OSS URL，其他浏览器仍先校验 HTTP 响应再走 Blob 下载 | Safari 依赖服务端 `Content-Disposition` 驱动保存 |
| system Safari boundary | `pass` | 真实图片“保存图片”触发系统提示“你要允许 127.0.0.1 上的下载吗？”，提示中远端 URL 与消息图片一致 | 用户授权后的最终文件与内容校验 |
| cancellation protection | `pass` | 验证只点击“取消”；下载目录无目标文件，消息/关系/群/SQLite 均未修改 | none |
| verification | `pass` | focused 1 file/6 tests、Web typecheck、1242-module production build、`git diff --check` | 既有 >500 kB chunk warning |
| runtime protection | `pass` | SDK/RN 零改动；未运行 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web` | none |

Closeout verdict: `.149.91 completed-local/system-safari-permission-boundary-pass/final-file-gated`。Safari 保存动作已经从丢失用户手势的无响应路径修复为真实浏览器下载权限链；由于验收主动取消授权，不声明文件最终落盘或字节内容通过。

## W6.a6.20.149.90 Ordinary Image Runtime Recheck (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| production sample | `pass` | 复用 `.149.68` 正式上传发送的 640x360 PNG；系统 Safari 与 H5 内嵌浏览器均从真实会话/SQLite 恢复同一图片消息 | 过期 URL、视频与文件样本 |
| H5 image lifecycle | `pass` | 缩略图自然尺寸 640x360、展示尺寸 180x101；全屏预览自然尺寸 640x360，关闭后 reload 仍完整解码 | none |
| system Safari structure | `pass-readonly` | Safari 可访问树确认“预览图片 -> 图片预览/关闭图片预览/保存图片”；关闭和 reload 后预览入口仍在 | 未点击保存，避免无关下载写入 |
| Safari pixel evidence | `tooling-gated` | 系统截图持续只捕获黑色预览背景，尽管可访问树保留已加载图片节点；同 URL 的 H5 内嵌浏览器截图和原始 640x360 PNG 均显示正常 | 需要可可靠捕获 Safari 跨域媒体合成层的工具或实体设备目视 |
| mutation protection | `pass` | 未保存、分享、发送或修改消息；H5/SDK/RN production source 零改动 | none |

Closeout verdict: `.149.90 completed-production-readonly-safari-pixel-evidence-gated`。普通图片的 URL、解码、比例、预览、关闭与刷新回读链已经关闭；Safari 的结构与生命周期通过，但当前控制层截图不能证明像素主体，因此既不归因为产品黑屏，也不把 Safari 像素显示声明为通过。

## W6.a6.20.149.89 System Safari Voice Playback Acceptance (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| production sample | `pass` | macOS 系统 Safari 复用真实登录态和单聊缓存，当前页面含 7 条真实语音消息 | 过期 URL、后台/中断与物理设备听感 |
| playback lifecycle | `pass` | 7 秒语音经历“播放语音 -> 正在加载语音 -> 停止语音/on”；截图确认活动态；等待超过音频时长后 7 个控件全部恢复“播放语音/off” | 手动停止的稳定时序未单独宣称 |
| runtime boundary | `pass-readonly` | 真实 Safari 页面、真实媒体 URL 和既有 `ChatMediaInteractionProvider`；无 fixture、mock、fake-success 或页面媒体旁路 | none |
| mutation protection | `pass` | 未录音、未发送、未修改消息或关系；H5/SDK/RN production source 零改动 | none |

Closeout verdict: `.149.89 completed-production-readonly`。系统 Safari 已证明真实语音能够加载、进入活动播放态并在自然结束后复位；该结论不外推到录音权限、上滑取消、后台中断、过期签名 URL 或实体设备听感。

## W6.a6.20.149.88 System Safari Microphone Activation Audit (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| natural-data activation | `not-activated` | 当前好友验证仅 3 条已完成历史、群验证为空；4 条真实会话的已加载历史未出现普通视频/文件；黑名单为空 | pending application、普通视频/文件、非空黑名单继续等待自然样本 |
| system Safari runtime | `pass-readonly` | macOS 系统 Safari 真实手机号验证码登录成功，恢复 4 条会话；进入含 7 条真实语音的单聊并切换到“语音消息/按住说话”模式 | physical touch、后台/中断与成功采集 |
| microphone activation | `tooling-gated` | 普通 click 不产生录音或消息；Computer Use 对 Safari 持续按压/上滑返回 `noWindowsAvailable`，无法到达权限 prompt，故不把系统权限桥接声明为通过或失败 | 可产生 pointerdown hold/up 的 Safari 控制器或实体设备 |
| mutation protection | `pass` | 未发送语音、未改变联系人/群/黑名单/申请状态；H5/SDK/RN production source 零改动 | none |

Closeout verdict: `.149.88 completed-readonly/tooling-gated`。系统 Safari 的登录、SQLite 会话恢复、真实聊天渲染与语音输入模式可达；权限请求、拒绝恢复、上滑取消和成功采集仍需要可持续按压的运行环境，不能由普通 click 或 WebKit 自动化结果外推。

## W6.a6.20.149.87 Visible Unread Read Natural Acceptance (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| natural unread sample | `pass` | 复用 `.149.86` 真实第二账号消息形成的 2 条未读；列表 reload 后仍显示 2，证明验收起点来自 SQLite 而非页面拼装 | none |
| initial long-list guard | `pass-rn-parity` | 首入长列表正确展示未读分割线和“2条未读”；仅等待 2.8 秒不会清零，符合 RN 禁止初始程序化锚定伪已读的门禁 | none |
| explicit unread action | `pass` | 点击“2条未读”后，当前可见 incoming 最高 seq 经 `conversations.markRead` 成功收敛，列表群角标与总角标均清零 | 真实 wheel/touchmove 与 latest-edge realtime 分支仍按既有门禁独立验收 |
| SQLite cold read | `pass` | 会话列表整页 reload 后角标保持 0；重进目标聊天后未读分割线与入口均不存在 | none |
| runtime protection | `pass` | 浏览器日志只有 Vite/React DevTools debug/info，无 error；H5/SDK/RN production source 零改动 | none |

Closeout verdict: `.149.87 completed-production-natural-sample`。本片证明长列表不会因初始定位误清未读，明确未读入口会把真实可见边界提交给 shared success-only facade，并在 Gateway 成功后持久化到 Conversation SQLite。该结论不外推到物理触摸、断线重试、跨窗口分页或媒体消息。

## W6.a6.20.149.86 Realtime Message.Batch Dual-Account Acceptance (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| real sender | `pass` | 隔离 H5 标签通过手机号 `15555555553` + 固定联调验证码登录 `donk三大爷`，进入同一真实群聊并发送唯一文本 `WS-14985-验收` | 测试环境保留一条可识别联调消息 |
| active chat realtime | `pass` | 接收端始终停留在 `/conversations/019ff8b7-b24f-7e71-afe1-332d40294c00`；发送后约 2.5 秒直接出现消息，未退出会话或重新进入 | none |
| conversation convergence | `pass` | 返回列表后首行 latest 为 `donk三大爷：WS-14985-验收`、时间为 `12:05`，群未读由 1 增至 2，总未读为 2 | none |
| SQLite cold read | `pass` | 整页 reload 后 latest、时间和 2 条未读保持，证明接收帧已写入 message/conversation SQLite，而非仅内存态渲染 | none |
| browser runtime | `pass` | 发送端与接收端验收完成后的 console error 均为 0 | none |
| anti-shortcut | `pass` | 使用真实登录、真实 Gateway send 与真实 WS 接收；无 fixture、mock、手工注入 frame、页面补写 SQL 或 fake success | none |
| protection | `pass` | 本片只产生一条明确标识的联调文本并回写文档；未改 H5/SDK/RN production source，未执行退群、删除、建群、审核或 RTC mutation | none |

Closeout verdict: `.149.86 completed-production-dual-account`。`.149.85` 的部署后运行证据门已关闭：真实第二账号消息可在接收端活动聊天即时出现，Conversation latest/unread 同步更新，reload 后仍从 SQLite 恢复。该结论只覆盖 `message.batch` 文本接收链，不外推到媒体、申请审核、群管理 mutation、RTC 或跨浏览器能力。

## W6.a6.20.149.85 Realtime Message.Batch SQLite Visibility (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| defect reproduction | `pass-fixed` | 真实 WS frame 的子消息无 `sent_at/updated_at`、仅批次有 `server_time`；旧 mapper 写入 `send_time=0`，当前聊天按时间窗口重读时可能裁掉新消息 | none |
| canonical owner | `pass` | `normalizeIMRealtimeMessages` 仅在子消息无显式时间时继承最近批次 `server_time`；SQLite、seq gap、unread/latest/cursor 与 `dataVersion` owner 均保持 shared SDK 单路径 | none |
| persistence/runtime | `pass-production` | 用户 frame shape normalization 回归；真实 sql.js Repository 验证 `send_time`、幂等 replay 与 conversation cursor；Web runtime WS bridge 验证 SQLite history + `dataVersion`；`.149.86` 完成双账号活动页、latest/unread 与 reload 冷读 | none |
| SDK verification | `pass` | focused 3 files / 13 tests；Web full 101 files / 432 tests；全平台 typecheck + runtime boundary；`build:web/sync:web` | none |
| H5 verification | `pass` | focused chat 2 files / 5 tests；full 182 files / 588 tests；Web app typecheck；1242-module production build | 既有 >500 kB chunk warning |
| protection | `pass` | `im28-phone/src/**` 零改动；未运行 `build:rn/sync:rn/build:all/build:package:desktop:web`；无 Gateway mutation | none |

Closeout verdict: `.149.85 completed-local/accepted-by-.149.86`。批次消息现在先以有效时间写入当前账号 SQLite，事务成功后通过既有 `dataVersion` 让活动聊天页重读；不新增 H5 SQL 写入、DTO mapper 或 realtime 分支。真实双账号运行证据已由 `.149.86` 关闭。

## W6.a6.20.149.84 Chat Draft Delete-Permission Cache Identity (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| dependency audit | `pass-fixed` | 删除权限 hook 是聊天页最后一个会随草稿产生的新 `Conversation` 引用重读群缓存的 effect；现改为稳定 `groupID + conversationID` | none |
| owner protection | `pass` | 仅收敛 `groups.listCached()` 触发身份；删除范围判断、确认层、shared delete facade、DTO 与 SQLite owner 均未改变 | real delete remains authorized-only |
| regression | `pass` | focused 3 files / 10 tests；H5 full 182 files / 588 tests；Web typecheck；1242-module production build | 既有 >500 kB chunk warning |
| authenticated browser | `pass-readonly` | 真实群聊输入/清空临时草稿；整页刷新后输入框保持空，刷新后 warning/error=0；未发送 | network recorder unavailable |
| tooling boundary | `partial-tooling` | 当前页面控制层不暴露 Resource Timing、`fetch`、XHR 或网络事件；不为验收新增产品日志/探针，不声明逐请求抓包通过 | DevTools/CDP network recorder |
| runtime protection | `pass` | SDK/RN 零改动，无消息发送或其他业务 mutation，未运行 SDK/RN/Desktop/all build/sync | none |

Closeout verdict: `.149.84 completed-local/browser-smoke/network-recorder-tooling-gated`。逐字草稿现在不会重复触发群远端同步，也不会重复读取删除权限群缓存；其余完整会话引用只用于同步计算、事件回调或无活动 route state 的早退路径，没有同类 I/O effect。

## W6.a6.20.149.83 Chat Draft Stable Group-Sync Identity (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| trigger isolation | `pass-fixed` | 草稿继续逐字写入 shared SQLite；群成员/资料同步和群申请角标只依赖稳定 `groupID`，不再依赖草稿保存返回的新 `Conversation` 对象引用 | none |
| request chain | `pass-fixed` | 输入字符不再重复触发 `group/application/audit/list`、`group/my/list`、`group/member/list`、`user/batch-detail`；切换群、runtime 恢复与 `dataVersion` 变化仍保留原同步入口 | production network recorder |
| regression | `pass` | focused 2 files / 6 tests；H5 full 182 files / 587 tests；Web typecheck；1242-module production build | 既有 >500 kB chunk warning |
| authenticated browser | `partial-tooling` | 真实群聊加载成功，临时草稿字符写入后已清空，warning/error=0；当前 in-app browser 无 Resource Timing，未伪造逐请求网络证据 | 可用 network recorder 的登录态复验 |
| runtime protection | `pass` | 未发送消息、未执行业务 mutation；SDK/RN 零改动，未运行 SDK/RN/Desktop/all build/sync | none |

Closeout verdict: `.149.83 completed-local/browser-smoke/network-recorder-tooling-gated`。逐字草稿持久化保持不变，重复 HTTP 链已通过稳定身份依赖和回归合同移除；浏览器网络抓包仍需具备 Resource Timing 或 DevTools recorder 的环境补证。

## W6.a6.20.149.82 H5 Global PC Pull-Refresh Convergence (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| global consumer contract | `pass` | 17 个生产 `usePullRefresh` 页面均接入 Touch 与 mouse Pointer down/move/up/cancel；邀请/移除成员共用弹窗完成类型透传 | physical touch/device |
| interaction safety | `pass-fixed` | 删除页面祖先 `setPointerCapture/releasePointerCapture`，避免截断会话行长按、列表按钮和成员选择的子 Pointer 生命周期 | physical long-press matrix |
| regression | `pass` | focused 4 files / 12 tests；H5 full 182 files / 586 tests；workspace typecheck；1242-module production build | 既有 >500 kB chunk warning |
| authenticated browser | `pass-pc` | 真实建群页鼠标下拉出现“正在刷新”并恢复“下拉刷新”；刷新后好友可选中/取消，创建 CTA 最终 disabled，warning/error=0 | 其余 16 页逐页像素、实体触摸 |
| runtime protection | `pass` | 未创建群、未发送、未删除、未退群；SDK/RN 零改动，未运行 RN/Desktop/all build/sync | none |

Closeout verdict: `.149.82 completed-global-pc-browser-pass/physical-touch-gated`。PC 下拉能力已从会话单页收敛为全局平台适配，同时保持每个页面原有刷新 owner 和 Touch Events；无 mock、fixture、fake success、第二业务路径或未登记 compat。

## W6.a6.20.149.81 H5 PC Pointer Conversation Refresh (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| pointer adapter | `pass` | `usePullRefresh` 仅接受鼠标主键 Pointer Events；touch/pen/right button 被拒绝，原 Touch Events 保留 | physical touch device |
| canonical owner | `pass` | `ConversationsPage -> useConversationsPageState.refreshConversations -> SDK forceFullSnapshot -> success-only SQLite replace`；未新增页面同步或缓存实现 | second-account realtime/list-back |
| regression | `pass` | focused 3 files / 8 tests；H5 full 182 files / 584 tests；workspace typecheck；1242-module production build | 既有 >500 kB chunk warning |
| authenticated browser | `pass-pc` | 真实登录态恢复 4 条 SQLite 会话；鼠标下拉出现“正在刷新”，完成后回到“下拉刷新”，4 条会话稳定且未新增 runtime error | physical touch/system Safari/device |
| runtime protection | `pass` | 未执行发送、删除、退群、建群等 mutation；未改 SDK/RN，未运行 RN/Desktop/all build/sync | none |

Closeout verdict: `.149.81 completed-pc-browser-pass/physical-touch-gated`。PC 鼠标与移动触摸现在共享同一手势适配器和正式会话刷新 owner；无 mock、fixture、fake success 或第二业务路径。浏览器日志中的旧 realtime stable-identity 错误早于本片验收，单独保留为既有 realtime 残留，不归因或吞并。

## W6.a6.20.149.80 SDK/H5 Web Full Regression Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| SDK Web regression | `pass` | `npm run test:web`；runtime boundary 通过；101 files / 431 tests 全绿 | none |
| asset parity | `pass` | `npm run assets:check`；RN 同源 assets 466 files 无漂移 | none |
| type safety | `pass` | SDK `typecheck:web` 与 H5 workspace typecheck 均通过 | none |
| production build | `pass-with-warning` | Vite 1242 modules 构建成功；仅保留既有 >500 kB chunk warning | bundle split 为非阻断性能债 |
| runtime protection | `pass` | 未运行 RN/Desktop/all build/sync，未改 frozen RN，未执行 Gateway/SQLite/business mutation | none |

Closeout verdict: `.149.80 completed-regression/no-new-activation`。当前 Web 生产链回归稳定；剩余能力仍必须由自然数据、明确 mutation 目标、RTC/浏览器设备或新后端 contract 激活。

## W6.a6.20.149.79 Migration Closeout SSOT Reconciliation (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| plan convergence | `pass` | `.149.78` 的全量会话刷新、普通成员退出、成功替换语义和冻结边界已登记到 stable PLAN | none |
| inventory convergence | `pass` | parity inventory 新增 shared owner、H5 production caller、RN frozen 与 destructive/second-account activation gate | none |
| cleanup verdict | `pass` | canonical owner 仍为 SDK conversation/group lifecycle；H5 仅持有 cache-first/手势/UI；没有第二业务 owner、compat wrapper 或 fake success | none |
| browser readonly | `partial-tooling` | 当前登录态从 SQLite 恢复 4 条会话且 warning/error=0；桌面控制层鼠标拖拽不能触发 touch-only 下拉手势，因此不伪造 refresh 通过 | physical touch 或可合成 touch 的实体/浏览器验收 |
| runtime protection | `pass` | 本片无 production/SDK/RN 代码改动、无 Gateway/SQLite mutation、无 forbidden build/sync | none |

Closeout verdict: `.149.79 completed-docs/no-new-activation`。迁移执行包已恢复为一致 SSOT；当前仍无可无授权自动推进的业务能力，后续必须由自然数据、明确 mutation 目标、可用 RTC/浏览器设备或新后端 contract 激活。

## W6.a6.20.149.78 Conversation Full Refresh + Member Leave RN Parity Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| cache-first list | `pass` | 会话页首次进入继续先读取 Web SQLite；后台同步和下拉刷新统一调用 `sync({ forceFullSnapshot: true, pageSize: 100 })`，完成后从 SQLite 重载视图 | 第二账号 realtime/list-back |
| full Gateway snapshot | `pass-local` | shared sync 强制绕过 Difference，分页调用 `listConversations`；Gateway OpenAPI transport 对应 `postV1ConversationList` | 当前浏览器控制层未提供 network recorder，不声明浏览器网络抓包证据 |
| success-only replace | `pass` | 缺少明确 `conversations` 数组时抛出 `SYNC_INVALID_RESPONSE` 并保留缓存；显式空数组才允许清空非归档快照；非空数组成功后替换 SQLite 并由 H5 重载 | 生产错误响应自然样本 |
| ordinary member leave | `pass-readonly` | 真实普通成员群设置展示 RN 同款底部层：退出群聊、退出并删除我发的群消息、取消；取消后页面与成员关系保持不变 | 两种真实退出结果、第二账号回读 |
| verification | `pass` | SDK conversation sync 9/9、Gateway transport、typecheck、`build:web/sync:web`；H5 focused 6/6、typecheck、production build；浏览器只读验收通过 | full H5 suite 未重复执行 |
| protection | `pass` | 未执行真实退群/删消息；未修改 `im28-phone/src/**`，未运行 RN/all/desktop SDK 发布脚本 | RN consumer convergence 需独立授权 |

Closeout verdict: `.149.78 completed-local-readonly/destructive-and-second-account-gated`。会话列表已收敛为 SQLite 首屏 + `postV1ConversationList` 全量快照的单一 shared 路径，只有明确成功数据可替换本地缓存；普通成员退群交互已与 RN 对齐，但破坏性结果仍按授权门禁管理。

## W6.a6.20.149.77 Create-Group Desktop Responsive Regression Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| desktop shell | `pass-fixed` | 1280x800 验收发现建群主体为 1280px、Footer/已选复核层为 480px；H5 为主体恢复 `max-width: 480px`，三者统一为 `x=400/width=480` | system Safari/实体设备 |
| mobile regression | `pass` | 382x786 下主体/Footer/复核层均为 `x=0/width=382`；document `382/382` | physical touch |
| production readonly | `pass` | 真实 2 位好友；初始创建 CTA disabled；ALL 后“已选 2 位好友”、CTA enabled；复核层标题/行数为 2/2 | 真实 create、持久化与第二账号 list-back |
| runtime boundary | `pass-with-known-environment-noise` | 页面 blocking error=0；仅记录 favicon 404 与全局 incoming-call refresh 的既有 `Gateway network is unavailable` | RTC/Gateway deployment |
| verification | `pass` | focused 3 files/9 tests；H5 typecheck；`git diff --check` | full suite/build 未因单行 CSS 重复执行 |
| protection | `pass` | 未点击创建 CTA、未执行 Gateway/SQLite mutation；SDK/RN runtime 零改动 | none |

Closeout verdict: `.149.77 completed-responsive-readonly/create-and-device-gated`。建群主体桌面壳层回归已修复并用 CSS contract 固化；既有 shared 人数规则和创建事务未改，本片不声明真实创建结果。

## W6.a6.20.149.76 Verification Desktop Responsive Regression Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| desktop shell | `pass-fixed` | 验收发现验证中心与单群申请 Surface 在 1280x800 被拉伸为 1280px；H5 为两个既有 Surface 恢复 `max-width: 480px` + `margin: 0 auto` | system Safari/实体设备 |
| production readonly | `pass` | dark desktop 下好友验证、群验证聚合、群 `97524759106` 单群申请三路 Surface 均为 `x=400/width=480`；好友真实历史刷新前后均为 3 条 | pending row、审核 action、角标与第二账号 realtime/list-back |
| mobile regression | `pass` | light 382x786 下三路 Surface 均为 `x=0/width=382`；document `382/382`，无横向溢出 | dark mobile 已由 `.149.75` 关闭 |
| runtime boundary | `partial-environment` | 好友历史缓存读与 reload 正常；群聚合/单群保持真实空态 | 当前环境群申请远端刷新报告 `Gateway network is unavailable`，不得声明远端审核链成功 |
| verification | `pass` | CSS contract 1/1；H5 typecheck；`git diff --check` | full suite/build 未因两行 CSS 重复执行 |
| protection | `pass` | 未接受/拒绝申请、未执行 Gateway/SQLite mutation；SDK 与 RN runtime 零改动 | none |

Closeout verdict: `.149.76 completed-responsive-readonly/pending-actions-and-gateway-gated`。`.149.75` 的 desktop gate 已关闭，并用静态 CSS 合约保护移动宽度壳层；本片不扩大申请审核、远端刷新或 realtime 完成声明。

## W6.a6.20.149.75 Verification Dark Readonly Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| friend history dark | `pass-readonly` | `/contacts/verifications/friend` 在 `data-theme=dark/color-scheme=dark` 下恢复 3 条真实已添加记录；页面/Surface 背景分别为 `rgb(17,19,24)` / `rgb(15,17,21)` | pending/non-terminal 状态与 action |
| group verification dark | `pass-empty-state` | 群聊验证聚合页与群 `97524759106` 单群申请页均在 dark 下保持真实空态 | pending group row、审核权限与结果 |
| layout/runtime | `pass-mobile` | 382x786，document `382/382`；三页 warning/error=0 | controller 无 viewport resize API；desktop 需独立真实宽屏证据 |
| state restoration | `pass` | 通过既有显示设置恢复 `data-theme=light/color-scheme=light`，最终回到好友验证列表，3 条历史仍在 | system-following/system Safari |
| protection | `pass` | 未接受/拒绝申请、未发送好友申请、未执行 Gateway/SQLite mutation；H5/SDK/RN runtime 均未修改 | none |

Closeout verdict: `.149.75 completed-dark-readonly/desktop-gated`。验证消息链的 Chromium mobile dark token、空态、历史回读与偏好恢复已闭合；desktop 不因源码 token 或移动端结果外推为通过，须在可控宽屏 viewport 下另验。

## W6.a6.20.149.74 Verification-History Readonly Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| friend history | `pass-readonly` | `/contacts/verifications/friend` 恢复最近三天 3 条真实记录；覆盖 incoming ID 来源与两条 outgoing 申请，来源、申请文案和“已添加”终态正确 | pending/non-terminal 状态、角标与 accept action |
| profile round-trip | `pass-readonly` | 点击 `donk二大爷` 进入 `/contacts/users/94424103659`；备注名、原昵称、来源、添加时间和共同群聊恢复；返回目标为 `/contacts/verifications/friend` | stranger/pending applicant profile、history forward/reload |
| group verification | `pass-empty-state` | 群聊验证聚合页为空；直达真实群 `97524759106` 的单群审核页同样显示暂无入群申请 | pending group row、owner/admin 权限、accept/reject result |
| layout/runtime | `pass` | 382x786，document `382/382`；warning/error=0；最终返回好友验证列表 | dark/system Safari/physical device |
| protection | `pass` | 未接受/拒绝申请、未发送好友申请、未执行 Gateway/SQLite mutation；H5/SDK/RN runtime 均未修改 | none |

Closeout verdict: `.149.74 completed-readonly/pending-actions-gated`。真实好友申请历史与资料往返链已验收；当前没有 pending 好友/群申请，因此按钮、确认层、审核结果、角标和第二账号 realtime/list-back 继续按自然数据或动作授权 gate 管理。

## W6.a6.20.149.73 Call-Record Activation Audit Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| production data | `empty-natural-sample` | 当前真实登录态进入 `/calls` 后同步结果为 0 条，不能复用历史 2 条记录或伪造 callID 证明详情链 | 等待自然通话记录后验收列表 row、`/calls/:callID`、同日记录与返回链 |
| list interaction | `pass-empty-state` | 所有通话/未接来电分段切换正常；搜索 `donk` 展示“暂无搜索结果”，清除后恢复“暂无通话记录” | 非空筛选、分页、详情和 realtime list-back |
| layout/runtime | `pass` | 382x786，document `382/382`；warning/error=0；最终恢复所有通话、空搜索词 | dark/system Safari/physical device |
| protection | `pass` | 未拨号、未进入 RTC、未删除记录、未访问伪造详情；H5/SDK/RN runtime 均未修改 | none |

Closeout verdict: `.149.73 audited-empty/natural-call-data-gated`。当前证据只关闭真实空态与列表筛选交互的运行健康复核，不覆盖历史非空样本、通话详情、删除、RTC 或第二账号链路；这些能力继续按 activation gate 管理。

## W6.a6.20.149.72 Group-State Owner Browser Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| joined groups | `pass-readonly` | `/contacts/groups` 恢复 2 个真实群；owner 群展示“我创建/群主”；`7452` 只命中目标群 ID；右键等价长按菜单完整展示分享群名片/退出群聊/修改群名称并通过页面点击关闭 | physical touch long-press、真实分享/退出/改名结果 |
| group members | `pass-readonly` | 真实群 `97524759106` 恢复 3 人；本人在线、群主和两位管理员角色正确；“备注名”搜索只保留 `94424103659`；成员索引存在 | remote refresh race、presence 变更、成员/角色 mutation |
| layout/runtime | `pass` | 两页均为 382x786，document `382/382`；warning/error=0；搜索值已清空，未保留菜单或选择态 | dark/system Safari/physical device |
| protection | `pass` | 仅真实 production read path；未执行 send、share、leave、rename、invite、remove、role 或其他 Gateway/SQLite mutation | none |

Closeout verdict: `.149.72 completed-readonly/group-mutations-gated`。此前 `.149.32/.149.33` 的 browser-login gate 已由当前真实账号关闭；该证据只证明已有生产快照、搜索、角色/presence 投影和菜单 presentation，不外推任何 mutation 结果。

## W6.a6.20.149.71 Group-Owner Leave RN Parity Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| frozen RN/Figma truth | `pass` | `GroupSettingsScreen + GroupOwnerQuitActionSheets + getEarliestAdminGroupMember`：无管理员阻断并进入管理员设置；有管理员按 `admin_since` 最早者展示；确认后只调用 `quitGroup` | none |
| shared SDK owner | `pass-local` | `selectIMEarliestGroupAdmin` 稳定选择继任者；owner 无管理员 fail-closed，有管理员时只执行一次 Gateway leave，不显式 transfer；完整群域事务保持 | 真实 Gateway leave/自动转移/第二账号回读 |
| H5 consumer | `pass-local` | 群设置页删除 transfer-first route intent，复用 RN 两分支全宽底部面板；两个退出按钮分别传 `clearHistory=false/true` | authenticated light/dark pixel proof |
| authenticated browser | `pass-has-admin` | 真实群 `97524759106` 打开群主退出层，展示最早管理员 `donk二大爷备注名 / 94424103659`；382x786 面板贴底、document `382/382`、warning/error=0；取消后群和会话保持不变 | 无管理员群主自然样本、dark/system Safari、最终退出与第二账号回读 |
| create-group readonly audit | `pass` | 真实 2 好友数据验证普通入口、已有群入口、ALL、2 人选中、已选复核层、disabled/enabled CTA 与 2–998 shared rule；清空本地选择后离开，未创建群 | 真实 create/persistence/second-account list-back |
| verification | `pass` | SDK 104 files/433 tests、typecheck、`build:web/sync:web`；H5 focused 5 files/22 tests、typecheck、1242-module production build | H5 full suite 未在本片重复执行 |
| protection | `pass` | `im28-phone/src/**` 未修改；RN generated package 未同步；未执行 `build:rn/sync:rn/build:all` 或 `build:package:desktop:web` | RN consumer convergence 仍需独立授权 |

Closeout verdict: `.149.71 completed-local/has-admin-browser-pass/no-admin-and-destructive-gated`。旧 `.149.7` 的显式 transfer-first H5 编排已被 RN 真实合同替代；代码、测试和 Web 生成包已收敛。有管理员分支已使用真实登录态完成只读像素/内容验收；当前账号没有“群主且无管理员”的自然样本，且最终退群属于破坏性操作，因此二者继续按 activation gate 管理。

## W6.a6.20.149.70 Cross-Browser Gateway Transport Audit Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| Gateway CORS | `pass` | friend unread、group audit、call pending 的标准 OPTIONS 均为 204；未认证实际 POST 均为 HTTP 200/业务未登录且保留 CORS 头 | production deployment 仍需保持同一响应 contract |
| WebKit header matrix | `pass` | 从 H5 Origin 逐项加入 Content-Type、X-Request-ID、X-Device-ID、Authorization、Accept-Language，五组请求均可读取 HTTP 200 | none |
| authenticated branch | `pass-readonly` | 同一已登录 WebKit session 内 friend unread 与 group audit 均返回 HTTP 200/code 0；凭据和业务 data 未进入输出 | none |
| harness correction | `closed-false-positive` | 删除登录后冗余 `page.goto('/conversations')`；该导航此前中止刚挂载的 unread/pending 请求，WebKit 报 access-control checks、Firefox 报 network unavailable | test-only script 不进入仓库 |
| final browser gate | `pass` | Firefox/WebKit 均为 640x360 decode、180x101 thumbnail、preview opacity=1、reload readback、382/382，runtime blocking errors 0 | system Safari/device、其他媒体仍 gated |
| boundary | `pass` | H5/SDK/RN runtime 均未修改；无发送、下载、保存或业务 mutation | none |

Closeout verdict: `.149.70 completed-audit/no-product-defect/harness-false-positive-closed`。不得为本次测试中止假阳性新增 dev proxy、SDK swallow 或页面兼容分支；`.149.69` 的 Firefox/WebKit 普通图片读取门禁同步提升为 runtime-clean pass。

## W6.a6.20.149.69 Firefox/WebKit Ordinary-Image Readonly Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| Firefox image | `pass-readonly/runtime-clean` | isolated production login -> real conversation row -> retained 640x360 image；thumbnail 180x101 / `object-fit: cover`；full preview visible；reload readback；382/382；corrected harness errors 0 | none |
| WebKit image | `pass-readonly/runtime-clean` | same production path；640x360 decode、180x101 thumbnail、full preview after transition settles、reload readback、382/382；page/node screenshots visually inspected；corrected harness errors 0 | none |
| animation control | `pass` | preview screenshot waits for decoded image、visible node and final `opacity=1`；pre-transition blank capture rejected as timing false negative | none |
| regression | `pass` | H5 focused 2 files / 5 tests | full suite unchanged from `.149.67` |
| boundary | `pass` | no new message、download、save、Gateway/SQLite mutation or H5/SDK/RN runtime edit | none |

Closeout verdict: `.149.69 completed-image-readonly/firefox-webkit-runtime-clean-pass`。普通图片跨浏览器读取、比例、预览和刷新链已闭合；`.149.70` 已证明此前 Gateway/CORS 记录来自验收脚本登录后冗余导航造成的请求中止，不是产品运行时缺陷。

## W6.a6.20.149.68 Authorized Image Send Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| exact mutation | `pass` | 用户明确授权主账号仅向 `donk三大爷` 发送一张无敏感测试图片并保留；相册选图按现有生产交互自动触发唯一一次发送 | no second send |
| upload/send/render | `pass-chromium` | 640x360 PNG 进入 production media upload/send owner；聊天页新增普通图片消息，缩略图、全屏预览与保存入口均可见 | actual save、video/file、cross-browser/device |
| convergence/list-back | `pass-local-and-server-list` | 会话列表立即更新为 `[图片]` 与同一时间；重新进入并整页刷新后图片仍由 production route 回读 | 接收账号未在发送前在线，不能把本证据外推为第二客户端 WebSocket realtime |
| ratio contract | `pass` | production `ChatMediaMessageContent -> getChatImageDisplaySize` 使用 Gateway 宽高或浏览器 natural size，按 RN 180px 上限等比展示；focused 2 files/5 tests | browser computed pixel probe unavailable in current controller |
| boundary | `pass` | H5/SDK/RN runtime source 零改动；SDK clean；RN 仅用户既有 `src/config/appVersion.ts` | none |

Closeout verdict: `.149.68 completed/authorized-image-send/chromium-pass/receiver-realtime-gated`。普通图片的 production 上传、发送、当前端收敛、会话摘要、刷新回读和预览链已形成真实证据；由于接收账号未在发送前保持在线，本片不宣称双端 WebSocket 实时接收或接收端 SQLite 回读。

## W6.a6.20.149.67 H5 Cleanup Audit Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| baseline | `pass` | H5 TypeScript；Vitest 180 files/579 tests | production build remains `.149.65` baseline |
| P0/P1 | `zero` | production TS/TSX 最大 299 行；TODO/FIXME/HACK/WIP、debug console、not-implemented=0 | none |
| P3 | `accepted` | CSS 最大为 `login-page.css` 830 行，低于仓库 1000 行强制拆分门槛；无业务 owner drift 证据，不为体量单独重构 | split only when touched responsibility requires it |
| tooling | `accepted-gap` | repo 无 `scripts/check-convergence.sh`；使用 typecheck、Vitest、source scan、Git boundary 代替 | future deterministic convergence helper |
| boundary | `pass` | production/SDK/RN runtime 零改动；SDK clean；RN 仅用户既有 `src/config/appVersion.ts` | none |

Closeout verdict: `.149.67 cleanup-audited/p0-p1-zero/no-new-activation`。没有可证明的死代码、重复 owner、临时实现或编译基线问题；禁止为制造进度进行无证据 P3 拆分，active slice 继续为 `none`。

## W6.a6.20.149.66 Activation Audit Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| authenticated runtime | `pass-readonly` | 使用已授权主账号恢复 production H5；4 个会话均无未读标记，console error=0 | physical device/system Safari |
| natural media | `blocked-natural-data` | 4 个已读会话共 16 条可见消息；普通图片/视频/文件均为 0；现有样本仍为文本、语音、转发、名片/系统消息 | real ordinary image/video/file sample |
| external activation | `unchanged` | Gateway verification-code operation 仍缺失；RTC 可用部署、成功麦克风采集及业务 mutation 授权均未出现 | backend/deployment/authorization |
| boundary | `pass` | 未上传、发送、下载、删除或调用群/设置 mutation；SDK clean；RN 仅用户既有 `src/config/appVersion.ts` | none |

Closeout verdict: `.149.66 audited-readonly/no-new-activation`。当前没有可在不造数据、不改 RN 业务且不执行未授权 mutation 的新切片；active slice 保持 `none`，等待 ledger 中任一真实激活条件。

## W6.a6.20.149.65 Microphone Failure Recovery Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| failure projection | `pass` | `NotAllowedError/SecurityError` 归一化为“无法访问麦克风，请检查浏览器权限”；缺失/占用设备分别有稳定中文提示 | browser-specific uncommon DOMException |
| Firefox denial | `pass` | Firefox 141 原生 `permissions.default.microphone=2`；真实 `getUserMedia` 拒绝后 error Toast 可见、HUD=0、按钮恢复、URL 稳定 | successful capture、physical microphone |
| mutation safety | `pass` | 录音手势后非 GET 请求 0、upload/message mutation 0；console/page errors 0；无 File/MediaRecorder/send | authorized audio upload/send |
| WebKit denial | `blocked-env` | Playwright WebKit 26 顶层 `getUserMedia` 在默认、空权限覆盖及 `Permissions-Policy` 下均停留系统询问态；iframe policy probe 无 `mediaDevices`，未伪造 API | system permission bridge or real Safari session |
| regression | `pass` | H5 focused 6 files/27 tests；SDK Web 101 files/426 tests；Web typecheck；1241-module build；382x786 Firefox screenshot | existing >500kB chunk warning；system Safari、device/background/interruption |

Closeout verdict: `.149.65 completed-local/firefox-microphone-denial-pass/webkit-permission-bridge-gated`。Firefox 的真实权限拒绝、中文 Toast 和 fail-closed 恢复链已通过；WebKit 运行时无法在无系统交互的 Playwright 会话中形成拒绝终态，因此保持环境门禁。本证据不证明成功录音、音量、电平、上传、发送、系统 Safari 或实体设备行为。

## W6.a6.20.149.64 Firefox/WebKit Audio Playback Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| natural data | `pass` | 主账号无未读单聊恢复 7 条真实可播放语音；账号 2/3 无样本，未造 fixture | ordinary image/video/file samples |
| Firefox playback | `pass` | 5 秒真实 `.m4a`：播放 false -> 停止 true/is-playing -> natural ended -> 播放 false；OSS HTTP 206 | system Safari、physical audio output |
| WebKit playback | `pass` | 同一真实消息完成相同状态链和 natural ended；URL 稳定、无 error | system Safari、WebKit media request classification |
| visual | `pass` | 两端 382x786 playing/ended 截图中发送方 icon 位于右侧，消息、Header、Composer 无越界遮挡 | animation frame pixel、device safe-area |
| regression/protection | `pass` | focused 4 files / 14 tests；console/page/request/HTTP errors 0；无 send、Gateway/SQLite、SDK/RN/production edit | background/interruption、expired URL |

Closeout verdict: `.149.64 completed-local/firefox-webkit-audio-playback-pass`。Firefox/WebKit 的真实语音播放与自然结束链已通过；WebKit 未把请求归类为 Playwright `media`，但真实 `playing/ended` 状态成立。本证据不外推到系统 Safari、实体设备听感、后台中断或过期签名 URL。

## W6.a6.20.149.63 Firefox/WebKit Long-Press Menu Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| conversation long-press | `pass-readonly` | Firefox/WebKit 真实鼠标指针按住 430ms；五项 RN 顺序菜单完整出现；遮罩关闭后 URL 不变 | physical touch、all menu actions |
| message long-press | `pass-readonly` | 两端真实消息按住 650ms；消息预览及 5/6 个适用动作完整出现；Esc 关闭后 URL 不变 | physical touch、all message actions |
| visual | `pass` | 四张 382x786 截图中菜单、预览和动作项均在视口内，无空白、越界或 Composer 遮挡 | system Safari、device safe-area |
| route/runtime | `pass` | 两端关闭消息菜单并返回后恢复 4 rows；console/page/request/HTTP errors 0 | browser back/forward gesture |
| regression/protection | `pass` | focused 2 files / 6 tests；没有点击 menuitem、执行 clipboard/send/delete/forward/RTC/Gateway mutation 或修改 production/SDK/RN | none |

Closeout verdict: `.149.63 completed-local/firefox-webkit-longpress-menu-pass`。Firefox/WebKit 的会话行和消息气泡桌面指针长按已取得只读证据；不外推到实体触控、系统 Safari 或任一菜单动作执行结果。

## W6.a6.20.149.62 Firefox/WebKit Chat Readonly Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| unread safety | `pass` | Firefox/WebKit 均先读取会话行可访问未读标签，只打开 `unreadLabel=''` 的真实群聊 | future unread conversations remain protected |
| Firefox chat | `pass-readonly` | account 2；1 real message；`2人在线`；Composer present；message stack `flex-end`；382/382；list bottom 720 = composer top 720 | message/media interaction matrix |
| WebKit chat | `pass-readonly` | account 3；2 real messages；`1人在线`；Composer present；message stack `flex-end`；382/382；list bottom 722 = composer top 722 | message/media interaction matrix |
| visual | `pass` | Firefox 短消息底部渲染；WebKit 群主文本与管理员长表情完整可见；Header、消息区、Composer 无遮挡 | system Safari、physical touch |
| route/runtime | `pass` | 两端 `返回会话` 后恢复 4 rows；chat/back stable phase console/page/request/HTTP errors 0 | back/forward gesture on physical device |
| regression/protection | `pass` | focused 3 files / 6 tests；无消息/媒体点击、send、RTC、Gateway mutation、production/SDK/RN edit | none |

Closeout verdict: `.149.62 completed-local/firefox-webkit-chat-readonly-pass`。Firefox/WebKit 的真实聊天页壳层、短消息底部布局、群身份/长表情渲染和返回导航已取得只读证据；不外推到媒体播放、长按、录音、权限、RTC、系统 Safari 或实体设备。

## W6.a6.20.149.61 Firefox/WebKit Core-Route Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| runtime | `pass` | official Playwright Firefox 141 / WebKit 26 installed outside repo dependencies | system Safari、physical device |
| isolated auth | `pass` | Firefox account 2、WebKit account 3；真实手机号固定码登录；独立临时 profile；未读取/复制 Chromium token | send-code operation remains absent |
| conversation route | `pass-readonly` | each browser restored 4 real rows；382/382 width；stable phase 0 console/page/request/HTTP errors | message/media interaction matrix |
| contacts route | `pass-readonly` | each browser restored 2 real rows；382/382 width；stable phase 0 console/page/request/HTTP errors | profile/mutation interaction matrix |
| navigation cancellation control | `pass` | first sample exposed route-switch cancellation；final run separated stable phases and eliminated all failures | none |
| protection | `pass` | no unread chat open、send、RTC、Gateway mutation、token inspection or production/SDK/RN edit | none |

Closeout verdict: `.149.61 completed-local/firefox-webkit-core-route-pass`。基础认证、会话列表和通讯录的 Firefox/WebKit 环境门禁已解除；结果不外推到系统 Safari、媒体、长按、权限、RTC 或实体设备。

## W6.a6.20.149.60 Production Action-Chain Residual Audit Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| interaction stubs | `pass` | production H5 无空 `onClick/onSubmit`、`href/to="#"`、`暂未实现/功能开发中` | none |
| fake-success markers | `pass` | 命中项均为真实 timer、状态 predicate、capability fallback 或 fail-visible 文案；无默认成功 shortcut | none |
| page ownership | `pass` | 最大 TSX 299 行；验证、搜索、群文本详情等非直达 Page 均有唯一生产消费者 | existing CSS owners above 300 lines are presentation debt, not runtime-chain gaps |
| RN screen-family coverage | `pass` | auth、home、conversation、contacts、calls、chat、group、QR、profile/settings 屏幕族逐项映射到 route/modal/platform exclusion | external acceptance gates only |
| route assembly | `pass` | `app-route-owner-contract` + `primary-tab-scene-contract`：2 files / 6 tests | none |
| protection | `pass` | 生产代码、SDK、RN business 零改动 | none |

Closeout verdict: `.149.60 completed-local/production-action-chain-ledger-clean`。当前未发现可无条件激活的本地 capability gap；重复扫描相同静态面不再产生新证据，下一片必须由 inventory activation gate 触发。

## W6.a6.20.149.59 Auth Entry Residual Audit Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| forgot-password entry | `complete-local` | RN `ForgotPasswordMethodsScreen` 对应 H5 `ForgotPasswordMethodsDialog`；账号登录页打开手机号/邮箱替代登录和客服说明 | support channel product config |
| fake-request boundary | `pass` | H5 回归锁定不调用 `runtime.forgotPassword`；Gateway 旧端点不可用时不制造成功态 | backend contract remains absent |
| network settings | `web-not-applicable` | RN `NetworkSettingsScreen` 依赖 native HTTP/OpenIM HTTP/SOCKS proxy；browser fetch/WebSocket 无 per-app proxy 注入 | Desktop future platform adapter |
| route ledger | `pass` | RN auth 可见入口与 H5 React Router/Modal owner 逐项核对；无新增普通生产入口缺口 | external activation ledger only |
| protection | `pass` | 仅更新执行文档；H5 production、SDK、RN business 零改动 | none |

Closeout verdict: `.149.59 completed-local/auth-entry-ledger-clean`。忘记密码已是可执行的替代登录交互，网络设置是明确平台排除；不新增无效页面，也不把缺失后端 operation 包装成完成能力。

## W6.a6.20.149.58 Migration Phase Regression And Browser-Runtime Gate Audit Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| H5 full regression | `pass` | Vitest 179 files / 576 tests | none |
| TypeScript/assets | `pass` | Web `tsc --noEmit`；RN assets 466 files | none |
| production build | `pass` | Vite 1241 modules | existing >500kB chunk warning |
| anti-mock/fake-success | `pass` | production source 无 parityRuntime/localMock/test-mode business branch/setTimeout(resolve) | none |
| cleanup/static boundary | `pass` | 无 console.log/TODO/FIXME/HACK；无 >1000-line touched source candidate；diff check clean | existing CSS files above 300 lines are not current touched-source blockers |
| runtime/repo protection | `pass` | dev route HTTP 200；SDK clean；RN 仅用户既有 appVersion 修改 | none |
| Firefox/WebKit | `blocked-env` | 本机无 Playwright browser runtime 或可复用登录态；未下载、未复制 token | installed runtime + authorized session |

Closeout verdict: `.149.58 completed-local/regression-pass/browser-matrix-blocked-env`。当前累积 H5 迁移在本地代码门禁上保持全绿；跨浏览器仍是明确环境门禁，不能由 Chromium 或构建结果外推。

## W6.a6.20.149.57 Current-Account Ordinary-Media Inventory Audit Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| unread safety | `pass` | 当前 4 个会话列表均无未读角标后才进入；未制造 mark-read 副作用 | future unread conversations remain protected |
| production inventory | `pass-readonly` | 4 routes、16 visible rows；文本、群名片 1、语音 7、forward origin 3、自定义表情 1 | ordinary media samples |
| ordinary image | `blocked-natural-data` | 4 个会话均为 0 | real cached image message |
| video | `blocked-natural-data` | 4 个会话均为 0 | real cached video message |
| file | `blocked-natural-data` | 4 个会话均为 0 | real cached file message |
| custom emoji cross-check | `pass-existing` | 最终 `complete=true`、`750x1624`；不把首屏异步占位文本当最终失败 | owned by `.149.56` |
| safety/protection | `pass` | 无 click/play/send/RTC/Gateway/SQLite mutation；生产代码、SDK、RN 零改动；恢复原 route | external gates retained |

Closeout verdict: `.149.57 completed-local/blocked-natural-data`。当前账号没有可用于普通图片、视频、文件验收的自然样本；本轮只证明门禁尚未满足，不声明这些能力已完成或失败。

## W6.a6.20.149.56 Incoming Admin Custom-Emoji Natural-Sample Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| natural data | `pass` | 已读真实群聊 2 rows；1 incoming 管理员自定义表情；无 fixture/发送 | ordinary image/video/file samples |
| shared sender projection | `pass` | 备注名 `donk二大爷备注名`、角色 `管理员`；未回退 userID | none |
| RN media parity | `pass` | frozen RN 只限制 180 最大宽度并保持比例；资源 `750x1624` 正确渲染 `180x390` | cross-browser image decode |
| light/dark layout | `pass` | 382x786；hash color `#FF9850`；头像/气泡/Composer 无越界遮挡；横向 overflow 0 | browser/device matrix |
| runtime/state | `pass` | focused 2 files/8 tests；image complete、natural size 非零、console warning/error 0；恢复 light/default viewport/original route | none |
| safety/protection | `pass` | 无 emoji click/send/mark-read/RTC/Gateway mutation；生产代码、SDK、RN 零改动 | external gates retained |

Closeout verdict: `.149.56 completed-local/browser-readonly-pass`。incoming 管理员身份与自定义表情已取得真实自然样本证据；长图比例严格保留 frozen RN 合同，不外推到普通图片、视频、文件或跨浏览器/设备。

## W6.a6.20.149.55 Incoming Group Bubble Natural-Sample Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| shared sender projection | `pass` | 真实 incoming 群主消息展示 `donk二大爷备注名` 和 `群主`；未回退 userID | admin/member natural samples |
| hash color | `pass` | light/dark 中昵称与角色标签均解析为 `#FF9850` / `rgb(255, 152, 80)` | other userID color samples |
| mobile layout | `pass` | 382x786；头像可见、气泡在视口内、Composer 不遮挡、横向 overflow 0 | cross-browser/device |
| dark theme | `pass` | peer bubble `rgb(46, 46, 46)`；sender identity token 保持稳定 | none |
| runtime/state | `pass` | console warning/error 0；恢复 light、默认 viewport 和原 chat route | none |
| safety/protection | `pass` | 无 message/avatar click、send、mark-read、RTC/Gateway mutation；生产代码、SDK、RN 零改动 | external gates retained |

Closeout verdict: `.149.55 completed-local/browser-readonly-pass`。incoming 群消息的 shared 名称/角色投影与 H5 气泡展示已取得真实自然样本证据；不外推到未出现的媒体、其他角色、跨浏览器或实体设备。

## W6.a6.20.149.54 Rich Message CSS Natural-Sample Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| natural data | `pass` | production cache 11 rows：群名片 1、语音 7、forward origin 3、普通文本；无 fixture | incoming/image/video/file natural samples |
| light/dark mobile | `pass` | 382x786；11 outgoing；语音 icon 右侧；气泡边界有效；scrollWidth=clientWidth=382 | cross-browser/device |
| composer/layout | `pass` | Composer 可见且与可见消息不相交；群名片/文本/语音/转发 origin 同屏活动帧 | none |
| runtime errors | `pass` | console warning/error 0；dev route HTTP 200 | none |
| state restoration | `pass` | light 偏好、默认 viewport 和原目标群聊恢复 | none |
| safety/protection | `pass` | 无 playback/card click/send/mark-read/RTC/Gateway mutation；生产代码、SDK、RN 零改动 | external gates retained |

Closeout verdict: `.149.54 completed-local/browser-readonly-pass`。message/composer CSS owner 已取得当前真实名片、语音和转发样本证据；不外推到未出现的消息方向/类型或跨运行时。

## W6.a6.20.149.53 Chat Page CSS Visual Acceptance Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| authenticated runtime | `pass` | 当前授权账号真实登录；目标群会话无未读角标；验证码发送 operation 未调用 | none |
| mobile light/dark | `pass` | 382x786；Header/list/Composer 可见；短消息底部布局；scrollWidth=clientWidth=382 | richer natural message samples |
| desktop light/dark | `pass` | 1280x800；Header/list/Composer 可见；既有 full-width surface；scrollWidth=clientWidth=1280 | product desktop-width refinement outside slice |
| runtime errors | `pass` | console warning/error 0；route HTTP 200 | none |
| state restoration | `pass` | 原 light 偏好恢复；viewport reset；标签返回目标 chat route | none |
| safety/protection | `pass` | 无 send/mark-read/RTC/Gateway mutation；生产代码、SDK、RN 零改动 | cross-browser/device and RTC remain gated |

Closeout verdict: `.149.53 completed-local/browser-readonly-pass`。`.149.52` CSS owner 拆分已取得真实 light/dark、mobile/desktop 视觉证据；不扩大业务 capability 完成声明。

## W6.a6.20.149.52 Chat Page CSS Owner Split Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| owner split | `pass` | `chat-page.css 1067 -> facade 57 + shell 419 + message 289 + composer 282 + state 25` | none |
| behavior preservation | `pass` | 原文件按区间重组与拆分产物逐字一致；selector、声明、级联、dark/mobile/reduced-motion、DOM/import 不变 | none |
| contract | `pass` | Node 文件系统测试锁定 import 顺序、四类 canonical selector 与 Composer owner 唯一性 | none |
| verification | `pass` | focused 3/9；H5 179/576；SDK Web 101/426；Web/H5 typecheck；466 assets；1241-module build；`npm run verify`；HTTP 200；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | CSS 规则序列逐字等价且 DOM/route 不变；生产构建与 route HTTP 健康 | real visual/browser/device matrix remains gated |
| cleanup/protection | `pass` | P0/P1 zero；无 orphan/compat/duplicate/TODO/debug/fake-success；SDK clean；RN 仅用户既有 `appVersion.ts` | convergence script absent |

Closeout verdict: `.149.52 completed-local/structural-pass`。唯一超千行 H5 源文件已关闭；本片不新增业务能力或 RN/Web convergence 声明，下一步回到 inventory activation gate。

## W6.a6.20.149.51 Active Call Control And Cleanup Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 活动控制、结束返回和资源释放合同零修改；RN 业务源码零修改 | none |
| owner convergence | `pass` | `WebIMCallProvider -> useWebIMActiveCallControls -> current SDK call owner/LiveKit port` | none |
| behavior preservation | `pass` | dispose 引用隔离/状态清理/SDK 释放顺序、结束前来源捕获、replace 返回、媒体错误呈现及 logout/unmount cleanup 不变 | real dual-account RTC remains gated |
| structure | `pass` | Provider `321 -> 278`，满足 H5 300 行约束；Hook 117 行；无 call owner 构造、compat/orphan/test-only production path | none |
| verification | `pass` | focused 5/14；H5 178/574；SDK Web 101/426；Web/H5 typecheck；466 assets；1241-module build；`npm run verify`；HTTP 200；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只搬迁相同控制和 cleanup effect；DOM/CSS/route contract/operation 不变 | dual-account active controls、permission/weak-network/background and browser matrix |
| cleanup/protection | `pass` | unique owner contract；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.51 completed-local/structural-pass`。本片只收敛 H5 活动通话控制/清理 owner，不新增 SDK DTO、Gateway/SQLite、RTC 能力或 RN/Web convergence 声明；Provider LoC 债务已关闭。

## W6.a6.20.149.50 Outgoing Call Startup Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 呼出、媒体与路由合同零修改；RN 业务源码零修改 | none |
| owner convergence | `pass` | `WebIMCallProvider -> useWebIMOutgoingCallStartup -> SDK outgoing/media owner -> /calls/active` | none |
| behavior preservation | `pass` | 登录/来电/重复启动守卫、stale dispose、失败透传及 `start -> owner/snapshot/subscription -> route` 顺序不变 | real dual-account outgoing RTC remains gated |
| structure | `pass-with-debt` | Provider `365 -> 321`；Hook 115 行；SDK outgoing 创建只有一个生产 owner，无 compat/orphan/test-only production path | Provider remains 21 lines over H5 limit; active-control/cleanup split queued |
| verification | `pass` | focused 4/11；H5 177/571；SDK Web 101/426；Web/H5 typecheck；466 assets；1240-module build；`npm run verify`；HTTP 200；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只搬迁相同呼出生命周期；DOM/CSS/route contract/operation 不变 | dual-account outgoing、permission/weak-network and browser matrix |
| cleanup/protection | `pass` | unique owner contract；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.50 completed-local/structural-pass`。本片只收敛 H5 呼出启动 owner，不新增 SDK DTO、Gateway/SQLite、RTC 能力或 RN/Web convergence 声明；Provider 21 行超限作为 `.149.51` 候选债务保留。

## W6.a6.20.149.49 Remote Terminal Lifecycle Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 通话终态与路由合同零修改；RN 业务源码零修改 | none |
| owner convergence | `pass` | `WebIMCallProvider -> useWebIMCallRemoteTerminal -> SDK active call owner -> tone/dispose/React Router replace` | none |
| behavior preservation | `pass` | 只处理当前 callID 和六类终态；严格保持 `handleRemoteTerminal -> hangup tone -> dispose -> replace` 与既有错误呈现 | real dual-account RTC remains gated |
| structure | `pass` | Provider `386 -> 365`；Hook 72 行；订阅、白名单和终态顺序只有一个生产 owner，无 compat/orphan/test-only production path 或第二 lifecycle | Provider >300 lines remains a separately guarded split debt |
| verification | `pass` | focused 4/10；H5 177/570；SDK Web 101/426；Web/H5 typecheck；466 assets；1239-module build；`npm run verify`；HTTP 200；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只搬迁相同 effect；DOM/CSS/route/operation 不变 | dual-account terminal/list-back、permission/weak-network and browser matrix |
| cleanup/protection | `pass` | owner contract；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.49 completed-local/structural-pass`。本片只收敛 H5 远端终态生命周期 owner，不新增 SDK DTO、Gateway/SQLite、RTC 能力或 RN/Web convergence 声明。

## W6.a6.20.149.48 Call Context Contract Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 通话合同与业务源码零修改；H5 通话公共方法签名不变 | none |
| owner convergence | `pass` | `runtime facade -> WebIMCallContext public contract/hook -> WebIMCallProvider unique lifecycle -> SDK Web call/media owners` | none |
| behavior preservation | `pass` | Provider value、缺失 Provider 错误、呼出/接听/拒绝、LiveKit port、媒体控制、终态信令和 Router 提交均原位 | real dual-account RTC remains gated |
| structure | `pass` | Provider `423 -> 386`；Context 46 行；页面无 Provider 深层 import，无 compat/orphan/test-only production path 或第二 lifecycle | Provider >300 lines remains a separately guarded split debt |
| verification | `pass` | focused 3/7；H5 176/567；SDK Web 101/426；Web/H5 typecheck；466 assets；1238-module build；`npm run verify`；HTTP 200；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动相同 Context/type/hook 与 import；DOM/CSS/route/operation 不变 | dual-account RTC、permission/weak-network/list-back and browser matrix |
| cleanup/protection | `pass` | owner contract；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.48 completed-local/structural-pass`。本片只收敛 H5 通话公共 Context 契约 owner，不新增 SDK DTO、Gateway/SQLite、RTC 能力或 RN/Web convergence 声明。

## W6.a6.20.149.47 Incoming Call Presentation Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 通话身份、展示形态和媒体合同未改变；RN 业务源码零修改 | none |
| owner convergence | `pass` | `WebIMCallProvider call lifecycle -> useWebIMIncomingCallPresentation browser presentation -> IncomingCallOverlay` | none |
| behavior preservation | `pass` | answer/reject、Gateway、LiveKit port、活动 owner、终态信令和 React Router 提交顺序留在原 Provider；仅迁移资料、形态、铃声、visibility refresh 与 autoplay 恢复 | real dual-account RTC remains gated |
| structure | `pass` | Provider `488 -> 423`；来电表现 Hook 179 行且只有一个生产消费者；Hook 无媒体创建、route navigation 或 call runtime | active-call lifecycle Provider remains >300 lines pending a separately safe boundary |
| verification | `pass` | focused 3/8；H5 175/564；SDK Web 101/426；Web typecheck；466 assets；1237-module production build；最终 `npm run verify`；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动相同来电表现状态/effect，Overlay DOM/CSS 与正式 operation 未改变 | dual-account invite/answer/reject/timeout、background multi-tab、permission/weak-network/browser matrix |
| cleanup/protection | `pass` | owner contract；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.47 completed-local/structural-pass`。本片只收敛 H5 来电表现 owner，不新增 SDK DTO、Gateway/SQLite、RTC 能力或 RN/Web convergence 声明。

## W6.a6.20.149.46 App Route Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 页面、导航和业务源码零修改；H5 既有 React Router 路径合同不变 | none |
| owner convergence | `pass` | `App providers -> AppRouteTree unique Routes -> AppCoreRoutes/AppChatRoutes domain ledgers -> pages` | none |
| behavior preservation | `pass` | provider 顺序、redirect、Primary Tab children、lazy import、Suspense fallback、页面元素和 wildcard 均原样搬迁 | browser/device matrix remains gated |
| structure | `pass` | `App 475 -> 26`；route tree 16、core ledger 133、chat ledger 91 行；无第二 Routes/wildcard、compat wrapper 或 transport owner | `WebIMCallProvider.tsx` deployment-gated owner remains >300 lines |
| verification | `pass` | focused 9/31；H5 174/562；Web typecheck；1236-module production build；diff check；最终 `npm run verify` | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只搬迁相同 JSX/import；DOM、CSS、URL、operation 与 runtime provider 顺序不变 | Safari/Firefox/device and natural operation data |
| cleanup/protection | `pass` | route-owner contract + full regression；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.46 completed-local/structural-pass`。本片只收敛 H5 应用装配与路由账本 owner，不新增业务能力、SDK DTO、Gateway/SQLite、RN caller 或跨端 convergence 声明。

## W6.a6.20.149.45 Chat Settings Data Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 单聊/群聊设置、权限和危险操作合同未改变；RN 业务源码零修改 | none |
| owner convergence | `pass` | `ChatSettingsPage interaction/router/mutations -> useChatSettingsData cache-first data -> existing WebIMSync facades` | none |
| behavior preservation | `pass` | conversation cache/sync、group cache/sync、member cache/sync 顺序、错误文案和 remote-only 常驻状态保持一致 | real settings/group mutation remains gated |
| structure | `pass` | page `343 -> 292`；Hook 139 行且只有一个生产消费者；页面不再持有 cache load，Hook 不持有 Router/toast/destructive mutation | none |
| verification | `pass` | focused 4/19；chat 83/276；H5 173/559；SDK Web 101/426；typecheck；`npm run verify`；1233-module production build；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动同一数据 effect 与本地更新动作，DOM/CSS/route/operation 不变 | natural data + browser/device matrix |
| cleanup/protection | `pass` | owner contract + domain/full regression；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.45 completed-local/structural-pass`。本片只收敛 H5 聊天设置 cache-first 数据 owner；React Router、toast、清空记录、退群/解散、确认层和 shared mutation 仍归页面及既有 SDK owner，不新增 RN/Web convergence 声明。

## W6.a6.20.149.44 Contact Profile Surface Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 联系人资料展示、路由和 action 合同未改变；RN 业务源码零修改 | none |
| owner convergence | `pass` | `ContactProfilePage runtime/state/router/dialog/actions -> ContactProfileSurface presentation -> existing shared profile components` | none |
| behavior preservation | `pass` | 资料加载、presence、群上下文、动作回调、子路由 state 和弹窗 DOM 层级保持原样 | real profile mutation/RTC remains gated |
| structure | `pass` | page `344 -> 224`；Surface 205 行且只有一个生产消费者；旧内联正文删除，无 compat/orphan/第二 runtime owner | none |
| verification | `pass` | focused 4 files/10 tests；contacts 27/91；H5 172/556；SDK Web 101/426；typecheck；`npm run verify`；1232-module production build；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动同一 JSX、资源和回调映射，保持原 DOM/CSS/route/operation | natural profile data + browser/device matrix |
| cleanup/protection | `pass` | contract + domain/full regression；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.44 completed-local/structural-pass`。本片只收敛 H5 联系人资料 presentation owner；runtime、资料恢复、presence、群上下文、Router、弹窗状态和 mutation 继续归页面及既有 action/shared owner，不新增 RN/Web convergence 声明。

## W6.a6.20.149.43 Chat Voice Recorder Platform Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 按住录音、上滑取消、时长和发送合同未改变；RN 业务源码零修改 | none |
| owner convergence | `pass` | `useChatVoiceRecorder -> chat-voice-recorder session lifecycle -> chat-voice-recorder-platform + chat-voice-level-reader` | none |
| behavior preservation | `pass` | start/stop/cancel/error、exactly-once terminal、MIME 顺序、Blob/File、时长上限和 track cleanup 原样迁移 | physical microphone/record/upload/send remains gated |
| structure | `pass` | recorder `314 -> 224`；platform owner 103 行且有生产消费者；旧内联 browser primitives 删除，无 re-export/compat/第二 recorder | none |
| verification | `pass` | focused 3 files/8 tests；chat 82/273；H5 171/554；typecheck；`npm run verify`；production build；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动浏览器媒体 adapter 与类型入口，未改变 DOM、CSS、gesture、route 或 operation | trusted hold + permission + browser/device matrix |
| cleanup/protection | `pass` | contract + behavior tests；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.43 completed-local/structural-pass`。本片只拆分 H5 录音会话终态与浏览器媒体能力 owner；shared audio upload/Gateway/SQLite 继续归 SDK，录音 HUD/手势继续归既有 H5 组件，真实麦克风、上传和发送不作完成声明。

## W6.a6.20.149.42 Conversation Preview Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 草稿、消息类型、@ 提及、群发送者与列表摘要合同未改变 | none |
| owner convergence | `pass` | `ConversationRow/archive -> conversation-preview-view -> shared draft/mention/system-message projection` | none |
| behavior preservation | `pass` | 草稿优先、静音 mention、群发送者前缀、系统/好友消息与未知类型 fallback 原样迁移 | natural uncommon preview payload remains gated |
| structure | `pass` | `conversation-list-view 353 -> 96`；preview owner 263 行且两个生产消费者；旧内联实现删除，无 re-export/compat/第二 parser | none |
| verification | `pass` | focused 4 files/21 tests；conversations 15/47；H5 170/552；SDK Web 101/426；typecheck；466 assets；1231-module build；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动纯 projection 与 import，未改变 DOM、CSS、route 或 operation；5176 route HTTP 200 | natural preview data + browser/device matrix |
| cleanup/protection | `pass` | contract + behavior tests；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.42 completed-local/structural-pass`。本片只收敛 H5 会话摘要 projection owner；标题、未读、循环定位、badge 与时间继续归 `conversation-list-view`，不新增 SDK DTO、缓存、Gateway/SQLite、发送或 RN/Web convergence 声明。

## W6.a6.20.149.41 Chat Message View Primitives Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 消息类型、正文、媒体元数据和短时钟展示合同未改变 | none |
| owner convergence | `pass` | `getChatMessageView unique dispatcher -> chat-message-view-primitives safe narrowing/formatting -> existing shared parsers` | none |
| behavior preservation | `pass` | 字符串空白、UTF-16 原文、数值、媒体尺寸、时长、文件大小及秒/毫秒时间戳规则原样迁移 | natural uncommon payload remains gated |
| structure | `pass` | dispatcher owner `370 -> 294`；primitive 87 行、唯一生产消费者；无 contentType/SDK/Gateway/SQLite/Router，旧内联实现删除 | none |
| verification | `pass` | focused 3 files/19 tests；chat 81/271；H5 169/550；SDK Web 101/426；typecheck；466 assets；1230-module build；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动纯函数并保持原模块重导出，未改变 DOM、CSS、route 或 operation | natural uncommon payload + browser/device matrix |
| cleanup/protection | `pass` | behavior + contract tests；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.41 completed-local/structural-pass`。本片只收敛 H5 消息 payload 安全取值与展示格式化 primitive，不新增第二消息 parser，不扩大 SDK DTO、缓存、发送或 RN/Web convergence 声明。

## W6.a6.20.149.40 Chat Bubble Chrome Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 发送中、失败重试、不可重试失败与双主题气泡尾角合同未改变 | none |
| owner convergence | `pass` | `ChatMessageBubble orchestration -> ChatMessageBubbleChrome presentation -> shared canRetryWebIMMessage + RN assets` | none |
| behavior preservation | `pass` | class、ARIA、disabled、clientMsgID 回调、尾角资源及明暗主题结构原样迁移 | natural failed-retry operation remains gated |
| structure | `pass` | bubble `339 -> 278`；新 chrome 78 行、唯一生产消费者；旧内联实现删除，无 compat/orphan/test-only path | none |
| verification | `pass` | focused 3 files/13 tests；chat 80/267；H5 168/546；SDK Web 101/426；typecheck；466 assets；1229-module build；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动同一 JSX/资源 import，未改变 DOM、CSS、route 或 operation | natural failed/retry pixels + browser/device matrix |
| cleanup/protection | `pass` | behavior + contract tests；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.40 completed-local/structural-pass`。本片只收敛 H5 气泡 chrome presentation owner，不扩大 SDK 重试、消息发送、缓存、资源或 RN/Web convergence 声明。

## W6.a6.20.149.39 Pending Forward Recovery Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 转发预览恢复、名称优先级和显式发送合同未改变 | none |
| owner convergence | `pass` | `useChatForwardFlow selection/target/send -> useChatPendingForward -> existing WebIMSync cache + sender-name projection` | none |
| behavior preservation | `pass` | 稳定 ID 精确回读、来源不完整失效、名称增强降级、旧请求隔离和 Router state 清理顺序保持一致 | real forward result remains gated |
| structure | `pass` | flow `353 -> 286`；新 Hook 101 行、唯一生产消费者；两个类型消费者直连新 owner，旧 re-export 删除 | none |
| verification | `pass` | focused 5 files/19 tests + final 2/6；chat 79/262；H5 167/541；SDK Web 101/426；typecheck；466 assets；1228-module build；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动缓存恢复 effect 和类型入口，DOM/CSS/route/operation 未改变 | natural result + browser/device matrix |
| cleanup/protection | `pass` | contract test；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.39 completed-local/structural-pass`。本片只收敛 H5 待转发缓存恢复 owner，不扩大消息转发、SDK DTO/状态机、SQLite 语义或 RN/Web convergence 声明。

## W6.a6.20.149.38 Chat Composer Submission Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 转发、编辑、组合媒体、引用、提及与文本提交顺序未改变 | none |
| owner convergence | `pass` | `ChatComposer state/view -> useChatComposerSubmission -> SDK submission plan + existing page actions` | none |
| behavior preservation | `pass` | 互斥校验、pending 清理、成功后草稿/mention/quote 清理与失败保留时机保持一致 | natural operation results remain gated |
| structure | `pass` | Composer `353 -> 267`；Hook 194 行、唯一生产消费者；旧内联提交分支删除，无 compat/orphan/test-only path | none |
| verification | `pass` | chat-domain 78 files/260 tests；H5 166 files/539 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1227-module build；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动客户端提交编排，DOM/CSS/route 与 operation 均未改变 | natural results + browser/device matrix |
| cleanup/protection | `pass` | contract tests 指向唯一 owner；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script/system contract absent |

Closeout verdict: `.149.38 completed-local/structural-pass`。本片只收敛 H5 Composer 提交编排 owner，不扩大消息 mutation、SDK DTO/状态机、缓存、RTC 或 RN/Web convergence 声明。

## W6.a6.20.149.37 Chat Page Surface Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN Header/消息/Composer/弹层合同与 H5 既有组件、hooks 和 action 链保持不变 | none |
| owner convergence | `pass` | `ChatPage Router/runtime/hooks -> ChatPageSurface presentation -> existing component/action owners` | none |
| behavior preservation | `pass` | media Provider、输入三态、转发/名片单选、关系提示、群名片和各弹层 callback 未改变 | natural operation pixels remain gated |
| structure | `pass` | page `399 -> 255`；Surface 247 行、唯一生产消费者；页面无列表/Composer/target modal JSX，Surface 无 state/effect/runtime/Gateway | none |
| verification | `pass` | focused 8 files/26 tests；H5 165 files/537 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1226-module build；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动既有 JSX 与属性映射，未执行发送、通话、转发或删除 operation | natural data + browser/device matrix |
| cleanup/protection | `pass` | contract tests 已转向新 owner；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script/system contract absent |

Closeout verdict: `.149.37 completed-local/structural-pass`。本片只收敛 H5 聊天页面 presentation owner，不扩大 shared DTO、缓存、消息 operation、RTC 或 RN/Web convergence 声明。

## W6.a6.20.149.36 Chat Text Presentation Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 引用/文本/系统降级合同与 H5 既有 view、quote source、entity renderer 和页面 action 链保持不变 | none |
| owner convergence | `pass` | `ChatMessageContent dispatcher -> ChatTextMessageContent presentation -> existing quote/entity/page actions` | none |
| behavior preservation | `pass` | 引用来源优先级、删除禁用、回复正文、链接动作、preset emoji 和 unsupported class 未改变 | natural quote/deleted-source pixels remain gated |
| structure | `pass` | dispatcher `98 -> 60`；文本组件 93 行、唯一生产消费者；无 mapper/quote resolver/WebIMSync/Gateway | none |
| verification | `pass` | focused 6 files/21 tests；H5 165 files/536 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1225-module build；diff check | existing >500kB chunk warning |
| browser evidence | `not-rerun` | 本片只移动同一 JSX，未执行复制、引用跳转、发送或其他 operation | natural uncommon payload + browser/device matrix |
| cleanup/protection | `pass` | contract + behavior tests；P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script/system contract absent |

Closeout verdict: `.149.36 completed-local/structural-pass`。本片只收敛 H5 文本族 presentation owner，不扩大引用解析、消息 DTO、发送、缓存或 RN/Web convergence 声明。

## W6.a6.20.149.35 Chat Media Presentation Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 通话/图片/视频/语音/文件展示合同与 H5 既有 `ChatMessageView`、媒体 Provider、页面 action 链保持不变 | none |
| owner convergence | `pass` | `ChatMessageContent dispatcher -> ChatMediaMessageContent presentation -> ChatMediaInteractionProvider/page action` | none |
| behavior preservation | `pass` | URL 安全化、图片比例/自然尺寸、视频预览、语音身份/已播放状态、文件预览及 RTC action 未改变 | image/video/file natural-data operations remain gated |
| structure | `pass` | dispatcher `272 -> 98`；媒体组件 232 行、唯一生产消费者；无 Router/WebIMSync/`new Audio` | quote/text family may be a later structural slice |
| verification | `pass` | focused 6 files/19 tests；H5 164 files/531 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1224-module build；diff check | existing >500kB chunk warning |
| browser evidence | `prior-proof` | `.149.15` 已证明真实 5 秒语音播放与终态；本片只移动同一 JSX，未执行 operation | image/video/file natural sample + browser/device matrix |
| cleanup/protection | `pass` | P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script/system contract absent |

Closeout verdict: `.149.35 completed-local/structural-pass`。本片只收敛 H5 媒体 presentation owner，不扩大媒体发送/下载、RTC、缓存或 RN/Web convergence 声明。

## W6.a6.20.149.34 Chat Card Presentation Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 用户/群名片点击合同与 H5 既有 `ChatMessageView/onOpenCard` 链保持不变 | none |
| owner convergence | `pass` | `ChatMessageContent kind dispatcher -> ChatCardMessageContent pure presentation -> existing page action` | none |
| behavior preservation | `pass` | 头像 fallback、用户/群 aria-label、缺 target/action 禁用及真实卡片 route 均未改变 | non-member apply/send mutation remains gated |
| structure | `pass` | dispatcher `307 -> 272`；名片组件 41 行、唯一生产消费者；无 Router/WebIMSync/SDK runtime | dispatcher 主函数后续可继续按消息族拆分 |
| verification | `pass` | focused 3 files/7 tests；H5 163 files/527 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1223-module build；diff check | existing >500kB chunk warning |
| browser evidence | `prior-proof` | `.149.18` 已证明真实已加入群名片进入 canonical 群会话；本片只移动同一 JSX，未执行 operation | fresh non-member natural sample |
| cleanup/protection | `pass` | P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script/system contract absent |

Closeout verdict: `.149.34 completed-local/structural-pass`。本片只收敛 H5 名片 presentation owner，不扩大名片发送、申请入群、消息 DTO 或 RN/Web convergence 声明。

## W6.a6.20.149.33 Group Members Page State Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 与 H5 均保持真实群身份、cache-first、主动刷新、名称/拼音/角色和 normal-group presence 规则 | none |
| owner convergence | `pass` | `GroupMembersPage route/gesture/index/presentation -> useGroupMembersPageState -> existing WebIMSync/group-members-view/presence owners` | none |
| behavior preservation | `pass` | cache 失败继续远端同步、旧请求禁止写回、成员资料 backHref 和错误重试保持原规则 | real authenticated sync/presence visual |
| structure | `pass` | page `312 -> 178`；Hook 186 行、唯一生产消费者；页面无 `getSync/groupMembers.sync/useObservedUserPresence` | none |
| verification | `pass` | focused 3 files/9 tests；H5 162 files/525 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1222-module build；diff check | existing >500kB chunk warning |
| browser readonly | `pass-via-.149.72` | 当前真实账号在群 `97524759106` 恢复 3 人、online、群主/管理员、备注搜索与索引；382px 零溢出、clean console | remote refresh race、presence 变更、真实 mutation |
| cleanup/protection | `pass` | P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.33 completed-local/structural-pass/browser-login-gated`。本片只收敛 H5 群成员完整页状态 owner，不扩大真实成员同步、presence、mutation 或 RN/Web convergence 声明。

## W6.a6.20.149.32 Joined Groups Page State Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 与 H5 均保持 cache-first、主动刷新、canonical 群会话、普通成员退群选项和群主先转让 | none |
| owner convergence | `pass` | `JoinedGroupsPage auth/gesture/presentation -> useJoinedGroupsPageState -> existing WebIMSync/groupLifecycle/view owners` | none |
| behavior preservation | `pass` | share/profile route、remote-only 防重放、错误区域与 mutation Toast 保持既有规则 | real leave/transfer/list-back |
| structure | `pass` | page `325 -> 138`；Hook 265 行、唯一生产消费者；页面无 groups/conversations/lifecycle/Toast 直调 | none |
| verification | `pass` | focused 4 files/20 tests；H5 161 files/523 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1221-module build；diff check | existing >500kB chunk warning |
| browser readonly | `pass-via-.149.72` | 当前真实账号恢复 2 个群、owner 标签、ID 搜索和三项右键等价长按菜单；382px 零溢出、clean console | physical touch、真实 share/leave/rename |
| cleanup/protection | `pass` | P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.32 completed-local/structural-pass/browser-login-gated`。本片只收敛 H5 已加入群页面状态 owner，不扩大真实退群、群主转让、登录态视觉或 RN/Web convergence 声明。

## W6.a6.20.149.31 Calls Page State Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 与 H5 均保持 cache-first、强制同步、筛选/搜索清选择、全量缓存分页全选和 SDK-first 删除 | none |
| owner convergence | `pass` | `CallsPage chrome/presentation -> useCallsPageState -> existing WebIMCallSync/call-list-view owners` | none |
| behavior preservation | `pass` | 首屏 cache/sync、dataVersion 重读、offset 分页、删除 Toast 与失败保留旧列表保持既有规则 | real delete/list-back、duration samples |
| structure | `pass` | page `355 -> 145`；Hook 285 行、唯一生产消费者；页面无 sync/listCached/delete/Toast 直调 | none |
| verification | `pass` | focused 4 files/23 tests；H5 160 files/521 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1220-module build；diff check | existing >500kB chunk warning |
| browser readonly | `login-gated` | 新受控标签 `/calls` 可达并按真实路由守卫进入手机号登录；未接管用户既有登录标签或提交验证码 | 登录态 list/edit visual、real delete |
| cleanup/protection | `pass` | P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.31 completed-local/structural-pass/browser-login-gated`。本片只收敛 H5 通话列表状态 owner，不扩大通话删除、RTC、详情自然数据或 RN/Web convergence 声明。

## W6.a6.20.149.30 Contact Search State Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 与 H5 均保持本地好友+已加入群、服务器好友/群聊双 Tab、Enter 仅收键盘 | none |
| owner convergence | `pass` | `ContactSearchPage Router/presentation -> useContactSearchPageState -> existing WebIMSync/contact-search-view owners` | none |
| behavior preservation | `pass` | 三 facade 独立加载、cache-first 群快照、会话 fallback、request generation、关系三态和受控返回保持既有规则 | real remote result/open/apply |
| structure | `pass` | page `384 -> 208`；Hook 241 行、唯一生产消费者；页面无 search/cache/openGroup 直调 | none |
| verification | `pass` | focused 7 files/31 tests；H5 159 files/519 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1219-module build；diff check | existing >500kB chunk warning |
| browser readonly | `login-gated` | 临时标签登录页正常；固定验证码提交后被既有预览标签的 sql.js 单实例锁明确拒绝 | 关闭现有标签后补真实搜索/双 Tab visual |
| cleanup/protection | `pass` | P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.30 completed-local/structural-pass/browser-login-gated`。本片只收敛 H5 联系人搜索状态 owner，不扩大真实远端搜索结果、打开会话、好友申请、入群申请或 RN/Web convergence 声明。

## W6.a6.20.149.29 Create Group State Owner Closeout (2026-08-15)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| owner convergence | `pass` | `CreateGroupPage -> useCreateGroupPageState -> existing WebIMSync/create-group-view owners` | none |
| behavior preservation | `pass` | cache-first 好友、固定单聊对端、普通/筛选全选差异、2–998 人门槛、remote-only 防重放保持原规则 | real create/list-back |
| structure | `pass` | page `388 -> 187`；Hook 283 行、唯一生产消费者；页面无 contacts/conversations/groups/Toast 直调 | none |
| verification | `pass` | focused 4 files/27 tests；H5 158 files/517 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1218-module build；diff check | existing >500kB chunk warning |
| browser readonly | `pass` | 已登录真实建群页 2 位好友；单选禁用创建，全选显示 2 位并启用；恢复选择后零新增 error | create mutation 未执行 |
| cleanup/protection | `pass` | P0/P1 zero；SDK clean；RN 仅用户既有 `appVersion.ts`；无 RN/Desktop/all 或禁用脚本 | convergence script absent |

Closeout verdict: `.149.29 completed-local/structural-pass/browser-readonly-pass`。本片只收敛 H5 建群状态 owner，不扩大真实创建、缓存 list-back、realtime 或 RN/Web convergence 声明。

## W6.a6.20.149.28 Conversation Search State Owner Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| owner convergence | `pass` | `ConversationSearchPage -> useConversationSearchState -> existing WebIMSync cache facade + conversation-home-search pure projection` | none |
| behavior preservation | `pass` | 四 cache 并行读取、interaction request generation、8 条消息分页、分区展开与十条历史上限保持原规则；无远端搜索/mutation | cross-browser/physical gesture |
| structure | `pass` | page `376 -> 203`；Hook 271 行、唯一生产消费者；页面无 cache/history/race 直调 | Hook 主函数长度登记为后续结构候选，不阻塞本片 |
| verification | `pass` | focused 2 files/8 tests；H5 157 files/514 tests；SDK Web 101 files/426 tests；typecheck；466 assets；1217-module build；diff check | existing >500kB chunk warning |
| browser readonly | `pass` | 已登录链：会话列表 -> 搜索历史 -> `123` -> 2 会话/3 消息 -> 目标聊天；使用真实当前账号 sql.js cache | Safari/Firefox + physical pull gesture |
| protection | `pass` | SDK source clean；RN protected business source 零改动，仅用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或 `build:package:desktop:web` | none |

Closeout verdict: `.149.28 completed-local/structural-pass/browser-readonly-pass`。本片只收敛 H5 页面状态 owner，不扩大搜索、发送、mutation 或跨客户端 convergence 声明。

## W6.a6.20.149.19 Unified Forward Composer Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 在唯一 `ChatComposer` 顶部渲染 `ForwardComposerPreview`；普通 draft 作为可选转发留言，空留言仍允许发送 | none |
| H5 owner | `pass` | `ChatForwardComposer` 只负责摘要、预览、反选与隐藏发送者；零 `form/textarea/send icon`；选择结果回传 `ChatComposer` | none |
| submit chain | `pass-local` | `ChatPageFooter` 不再用转发态替换普通输入；`ChatComposer` 唯一提交按钮调用 `forwardDraft.onSubmit`，成功后才清空既有 draft | real forward send result |
| verification | `pass` | focused 3 files/12 tests；H5 TypeScript；`build:web/sync:web`；1205-module production build；diff check | existing >500kB chunk warning |
| browser readonly | `pass-bounded` | 已登录真实群聊仍只有一个“消息内容” textarea、语音/表情/功能入口；未脚本伪造长按或点击发送 | natural pending-forward visual |
| protection | `pass` | SDK source 零修改；RN protected business source 零修改，只有用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或 `build:package:desktop:web` | none |

Closeout verdict: `.149.19 completed/structural-pass/forward-runtime-gated`。唯一 Composer owner 已收敛；真实长按生成待转发草稿后的视觉与最终发送结果继续保留显式验收门。

## W6.a6.20.149.18 Recorder HUD And Group Card Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 录音 HUD 为 150×150、52×64 麦克风、38/34/30/26/22/18 六格真实电平；群名片点击每次 force-refresh，已入群直达会话，未入群进入申请 | none |
| recorder adapter | `pass-local` | 唯一 `chat-voice-recorder` 通过 Web Audio analyser 读取 RMS；不支持/读取失败时静音 fail-closed；stop/cancel/start/error 同步释放 analyser、AudioContext 与 tracks | physical trusted hold + microphone permission + Safari/Firefox |
| H5 presentation | `pass-local` | HUD 尺寸、间距、字号、最低一格、后 N 格点亮和危险取消态对齐 RN；删除固定 CSS pulse，不伪造音量 | physical upward-cancel pixel |
| group card runtime | `browser-pass-real` | 真实单聊点击 `donk二大爷的群聊` 后从 type108 直接进入 `/conversations/019ffe07...`，展示群聊天与 `2人在线`；未进入群资料 | non-member card natural sample + real apply mutation |
| route safety | `pass` | `card` 申请来源只接受单段编码 `/conversations/:id`，成功/返回关闭申请历史项；已入群复用 SDK `conversations.openGroup` | none |
| verification | `pass` | H5 focused 3 files/11 tests；TypeScript；SDK Web 101 files/426 tests；`build:web/sync:web`；1205-module production build；diff check | existing >500kB chunk warning |
| protection | `pass` | SDK source 零修改；RN protected business source 零修改，只有用户既有 `appVersion.ts`；未运行 RN/Desktop/all 或 `build:package:desktop:web` | none |

Closeout verdict: `.149.18 completed/card-browser-pass/physical-record-gated`。群名片 production caller 已对齐；录音 HUD 与真实电平链已本地闭环，但没有用不受信任脚本伪造按住、没有录音上传或发送，物理触屏/麦克风矩阵继续保留验收门。

## W6.a6.20.149.17 Outgoing Voice Direction Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN `soundContentMine` 使用 `row-reverse`，`voiceIconBoxMine` 使用 `rotate(180deg)` | none |
| H5 presentation | `pass` | `.is-outgoing .rn-chat-audio-content` 反向横排，发送方时长在左、声波在右且旋转 180°；incoming 选择器不受影响 | none |
| verification | `pass` | 串行 H5 typecheck；1204-module production build；382×786 已登录真实语音列表截图 | existing >500kB chunk warning |
| browser computed style | `pass` | `flexDirection=row-reverse`；icon transform=`matrix(-1,0,0,-1,0,0)` | Safari/Firefox/device matrix |
| protection | `pass` | 只改 H5 CSS；SDK source 与 RN protected business source 零改动 | none |

Closeout verdict: `.149.17 completed/browser-pass`。本片不改变语音 URL、播放状态、已读偏好、消息 DTO 或转发发送逻辑。

## W6.a6.20.149.16 Forward-Origin Display Name Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN contract | `pass` | frozen RN 只为缺少来源头的消息新建 `forwardOrigin`，发送者名称来自既有消息展示投影；已有历史来源不覆盖 | none |
| H5 projection | `pass` | `ChatForwardComposer -> senderNamesByID -> ChatForwardPreviewModal -> resolveChatForwardPreviewOrigin`；新来源使用备注/群昵称/昵称结果，不再回退 `im-xxxx` | cache miss remains formatted ID |
| history safety | `pass` | 消息已有 `forwardOrigin` 时原对象与原名称保持不变，避免再次转发把原发送者错误改成当前发送者 | none |
| verification | `pass` | focused 2 files/9 tests；full H5 151 files/502 tests；466 assets；H5 typecheck；1204-module production build；diff check | existing >500kB chunk warning |
| browser readonly | `pass-bounded` | 已登录预览显示名称来源头，未点击最终发送；当前自然样本中的已转发语音继续保留历史来源 `donk` | original raw missing-name sample after fresh selection |
| protection/cleanup | `pass` | SDK 零改动；RN 仅用户已有 `appVersion.ts`；3 个生产文件 143/245/101 行；P0/P1 zero | none |

Closeout verdict: `.149.16 completed/send-result-gated`。本片只修复 H5 转发预览的新来源展示名，不修改消息 DTO、缓存、route state 或 shared send facade。

## W6.a6.20.149.15 Voice Playback Natural-Data Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| natural sample | `pass` | 已登录真实单聊缓存包含 5/7/8 秒语音，本轮选择 5 秒样本，不创建 fixture、不上传、不发送 | signed URL expiry variants |
| runtime state | `pass-browser-real` | 点击后控件由“播放语音”切换为 `pressed` 的“停止语音”，5 秒结束后自然回落“播放语音” | audible output/device volume not asserted |
| draft isolation | `pass` | 既有 2 条转发草稿保持完整，未点击“发送转发消息”，消息列表与草稿摘要未被播放终态改写 | none |
| verification | `pass` | `.149.14` focused 1 file/3 tests、H5 typecheck、diff check；SDK 零改动，RN 仅用户已有 `appVersion.ts` | full suite沿用 `.149.14` 151/500 baseline |

Closeout verdict: `.149.15 completed/chromium-pass/browser-matrix-gated`。真实语音播放默认链已取得 Chromium 自然数据证据；Safari/Firefox、物理设备听感、图片/视频/文件打开下载继续保留独立验收门。

## W6.a6.20.149.14 Forward Composer Sender Summary Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN/Figma contract | `pass` | RN `getPendingForwardSubtitle/getForwardSourceSummary` 与 Figma `55933:71482` 均要求多条显示来源发送者集合；本人显示“您自己”，按首次出现去重，超过两人显示“等N人” | none |
| source identity | `pass` | 来源单聊使用来源会话对端名；来源群聊只读 shared group-member cache，并复用备注、群昵称、公开昵称优先级；目标聊天标题不参与 | member cache miss uses formatted ID fallback |
| failure boundary | `pass` | 消息 cache 完整时，来源会话/成员名称增强失败只降级展示，不使转发草稿失效 | none |
| browser readonly | `pass` | 382×786 真实已登录链显示“来自：donk二大爷，您自己”；preview=`382×56`、input=`382×52`、document=`382/382`；未点击发送 | Safari/Firefox + physical touch |
| verification | `pass` | focused 2 files/7 tests；full H5 151 files/500 tests；Web typecheck；1204-module production build；diff check | existing >500kB chunk warning |
| cleanup/protection | `pass` | helper 81 行且唯一生产消费者；P0/P1 zero；SDK 零改动，RN protected source 未改；仓库无 convergence script | none |

Closeout verdict: `.149.14 completed/send-result-gated`。本片只收敛 H5 转发草稿展示，不修改 route state、消息正文、发送 facade 或真实发送结果。

## W6.a6.20.149.13 Forward Preview RN Parity Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN structure parity | `pass` | 60% 视口面板、底部 outgoing 气泡、30px 多选、发送者显示切换与四项操作菜单均复用 frozen RN production contract | Figma 登录后像素对照 |
| shared owner | `pass` | 正文复用 `getChatMessageView + ChatMessageContent + ChatForwardOrigin`；预览组件不持有发送 facade | none |
| draft safety | `pass` | 反选、隐藏发送者和修改收件人只更新待发送草稿；应用更改不发送，真实提交仍由 Composer 显式触发 | real partial-result/realtime/list-back |
| browser readonly | `pass` | 382×786 已登录链验证 3 条真实缓存消息、面板与菜单尺寸、反选/恢复、隐藏/恢复及零 warning/error | Safari/Firefox + physical touch |
| full verification | `pass` | focused 2 files/7 tests；H5 150 files/497 tests；466 assets；Web typecheck；1203-module production build | existing >500kB chunk warning |
| protection | `pass` | SDK source/generated 与 RN protected source 零改动；未运行 SDK/RN/Desktop/all build/sync；未点击发送 | none |

Closeout verdict: `.149.13 completed/send-result-gated`。当前 inventory 没有新的无条件本地实现缺口；保持验证码发送 contract blocked，不制造 fake success。

## W6.a6.20.149.12 Chat Settings Responsibility Split Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| responsibility split | `pass` | `ChatSettingsPage.tsx` 只保留加载、presence、mutation、权限投影与确认层编排；首卡、成员预览、头像、搜索和清空入口迁入 `ChatSettingsCards.tsx` | none |
| size boundary | `pass` | 页面由 539 行降至 343 行；展示模块 202 行，均低于 cleanup 阈值 | none |
| behavior guardrail | `pass` | 定向 4 files/29 tests；route、shared facade、permission、Toast、remote-only 与 destructive semantics 未改 | real mutation remains gated |
| browser readonly | `pass` | 现有账号单聊设置 4 cards、群设置 5 cards；群资料/成员/搜索/清空/退出入口可见；zero console error；未点击 mutation | Safari/Firefox + operation pixels |
| full verification | `pass` | H5 149 files/493 tests；466 assets；Web typecheck；production build；diff check | existing >500kB chunk warning |
| cleanup/protection | `pass` | 无新增 TODO/FIXME/HACK、调试日志、孤立导出或重复 owner；SDK 未改；RN 仅有用户已有 `src/config/appVersion.ts` | none |

Closeout verdict: `.149.12 completed/no-behavior-change`。本片仅拆分 H5 presentation owner；未修改 RN、SDK、路由、权限、缓存、同步或 mutation 逻辑。

## W6.a6.20.149.11 Settings Operation Feedback Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| permission update | `pass-local` | success/error 使用 `useAppToast`；加载失败继续由页面 error + retry owner 承载 | real changed-value mutation |
| version check | `pass-local` | latest/error 使用 Toast；need-update 继续使用可操作 update dialog | update-available sample |
| sign-out | `pass-local` | success/error 使用 Toast；成功后仍由 runtime 完整清理并 replace 到 phone auth | real logout cleanup pixel |
| verification | `pass` | focused 1 file/13 tests；full H5 149 files/493 tests；466 assets；Web typecheck；production build；diff check | existing >500kB chunk warning |
| protection | `pass` | SDK 与 generated package 未改；RN 仅有用户已有 `src/config/appVersion.ts`；未运行 RN/Desktop/all 或 `build:package:desktop:web` | none |

Closeout verdict: `.149.11 local-complete/authenticated-action-gated`。本片仅改变 H5 feedback projection，未执行权限写入、版本更新或退出 mutation。

## W6.a6.20.149.10 RN/H5 Parity Residual Inventory (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| route surface | `pass-read-only` | frozen RN screen/routes 与 H5 60+ React Router paths 按认证、四主 Tab、联系人、通话、聊天、群、群发、二维码、个人设置逐域映射 | no confirmed ordinary route gap |
| runtime ownership | `pass-read-only` | H5 page 只持有 route/UI/browser I/O；DTO、Gateway、Repository、cache/realtime/mutation 继续由 shared SDK owner 持有 | RN remains frozen |
| anti-fake | `pass` | 忘记密码使用 RN 同款替代方式；验证码缺口只显示固定 `666666` contract；网络代理/cache cleanup 未创建无效 Web 页面 | none |
| inventory SSOT | `written` | `IM28_H5_RN_PARITY_INVENTORY.md` 记录 complete/partial/acceptance/contract/platform 状态与 activation gate | living inventory |
| next bounded slice | `selected` | `.149.11`: permission update、version check、sign-out failure 三个同域反馈 consumer | no real mutation |

Closeout verdict: `.149.10 completed/read-only`。确认普通 RN production route 缺口为 0；开发残留以 consumer/contract/platform/acceptance 分类，不以“文件存在”冒充 capability complete。

## W6.a6.20.149.5b Operation Feedback Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen RN 只作为反馈文案、操作边界和页面结构参考；未改 RN 业务调用、DTO、缓存、事件或 UI 逻辑 | RN business unchanged |
| feedback split | `pass-local` | 好友/群申请、黑名单、通话删除、群设置、管理员/群主、建群、邀请/移除成员、群资料/文本、群生命周期、已加入群和媒体打开/下载的 mutation success/error 进入唯一 `useAppToast`；加载、刷新、分页、权限、remote-only/cache 恢复和媒体结构错误继续由页面 owner 承载 | authenticated operation pixel |
| success boundary | `pass` | 通话删除与删除后 cache 重读分开判定；已成功的服务端删除不会因随后列表重读失败被误报为删除失败 | none |
| cross-route Toast | `pass` | 添加管理员和转让群主由共用 hook 在导航前直接触发全局 Toast，不依赖即将卸载页面的反馈适配器 | none |
| media feedback | `pass` | 图片/文件下载成功失败和文件打开失败使用全局 Toast；旧 inline feedback state 与 CSS 已删除 | authenticated download/open pixel |
| verification | `pass` | focused 3 files/18 tests；full H5 149 files/492 tests；466 assets；Web typecheck；production build；diff check | existing >500kB chunk warning |
| cleanup P0/P1 | `zero` | 触达范围无旧 feedback state/CSS、重复 Toast owner、TODO/FIXME/HACK、调试日志或孤立 import；canonical owner 为 `AppToastProvider/useAppToast` | none |
| accepted P3 debt | `registered` | `ChatSettingsPage.tsx` 539 行超过 cleanup 建议的 400 行页面阈值，但低于仓库触达 1000 行强制拆分门；本片不做无关结构重写 | `.149.10` responsibility inventory |
| API gap | `accepted` | Gateway OpenAPI 暂无验证码发送 operation；继续显示固定 `666666` 联调约束，不接不存在的接口、不制造发送成功和倒计时 | backend send-code contract |
| protection | `pass` | 未修改 SDK source/generated package；未改 `im28-phone/src/**`，RN 仅存在用户已有 `src/config/appVersion.ts` 改动；未执行 RN/Desktop/all 或 `build:package:desktop:web` | none |

Closeout verdict: `.149.5b local-complete/authenticated-action-gated`。未执行接受/拒绝、解除黑名单、删除通话、群成员/角色/生命周期、建群或媒体下载等真实 mutation，不将静态契约和构建结果写成操作期浏览器验收完成；下一步重新生成 RN parity residual inventory。

## W6.a6.20.149.9 RTC Startup Failure Convergence (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen RN `GlobalRTCCallProvider` 只在 shared `startCall` 成功取得 call/credential 后提交 active call；失败只显示错误 | RN business unchanged |
| shared chain | `pass-local` | H5 继续消费 `createIMCallControlSync -> createWebIMOutgoingCall -> createWebIMCallMediaSession -> LiveKitCallMediaPort`，pending、process realtime、terminal convergence 均沿既有 SDK owner | none |
| failure convergence | `pass-browser-real` | 真实测试账号呼出时 `/v1/call/start` 返回“服务不可用”，未返回 call ID/credential；H5 留在联系人来源页并显示全局 error Toast，不再进入 `/calls/active` 假活动态 | dev RTC control/backend availability |
| startup guard | `pass` | `startingRef` 覆盖完整异步 start，阻止重复点击；启动或账号版本失效会 dispose 且不提交 route/owner | none |
| verification | `pass` | H5 full 149 files/484 tests、SDK Web 101 files/426 tests、466 assets、两侧 typecheck、1198-module production build | existing >500kB chunk warning |
| protection | `pass` | 未改 `im28-phone/src/**`；仅已有 `src/config/appVersion.ts` 用户改动；未执行 RN/Desktop/all 或 `build:package:desktop:web` | none |

Closeout verdict: `.149.9 completed/client-converged/external-rtc-gated`。客户端不再把 Gateway 启动失败投影成已结束通话页；真实双账号呼出、接听、远端音视频、静音/摄像头、挂断、pending 恢复与终态 list-back 仍需可用 RTC 部署后验收。

## W6.a6.20.149.8 Conversation Delete Permission And Sheet (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| permission owner | `pass-shared` | SDK joined-group detail 读取并缓存显式 `can_clear_message` capability；角色不再推断全员清空权限，缺失字段 fail-closed | RN frozen consumer 不切换 |
| H5 projection | `pass` | 会话列表先读缓存 capability，缺失时调用 shared `fetchDetail`；全员删除按钮只在明确 true 时出现 | destructive click gated |
| modal layout | `pass-browser` | portal 挂到 body，确认层固定全视口遮罩并全宽贴底；不再受 PrimaryTabs scene/container 限制 | Safari/Firefox |
| permission samples | `pass-browser-real` | 无权限群仅显示本地删除；群详情返回 `can_clear_message=true` 时显示“为我和所有群成员删除”；未点击删除 | actual deletion/list-back |
| verification | `pass` | SDK focused 12 tests；H5 focused 7 tests；最终 full H5 149/484、SDK Web 101/426、typecheck/build | none |
| protection | `pass` | 仅 SDK Web source/H5 generated package 与 H5 UI；未同步 RN package，未执行破坏性删除 | none |

Closeout verdict: `.149.8 completed/destructive-action-gated`。权限与展示已按服务端显式 capability 收敛，真实 self/both/all-members 删除及多账号 list-back 保持动作时授权门。

## W6.a6.20.149.7 Group Owner Transfer-Before-Leave (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen RN 群主设置同时呈现退出/解散；退出必须先完成权限交接语义 | RN 服务端自动管理员承接不复制到 H5 |
| capability boundary | `superseded` | `.149.71` 已将 SDK 群主 leave 改为管理员继任条件 + single leave | 见 `.149.71` |
| two-step flow | `superseded` | 旧 owner-transfer route intent 不再是退群主路径 | 见 `.149.71` |
| browser | `pass-auth-readonly` | 真实 owner 群同时显示“退出群聊/解散群聊”；退出进入 2 位真实候选页，关闭返回原设置；412/412 无横向溢出 | 转让、退出、第二账号 list-back |
| verification | `pass` | focused 3 files/17 tests；full 147 files/478 tests；Web typecheck；1198-module production build | existing >500kB chunk warning |
| protection | `pass` | 仅 H5 route/UI/tests/docs；SDK/RN business 未修改；未执行 RN/Desktop/all 或 `build:package:desktop:web` | none |

Closeout verdict: `.149.7 superseded-by-.149.71`。本片保留为历史证据；当前群主退群合同以 `.149.71` 的 earliest-admin + single-leave/Gateway-auto-transfer 为准。

## W6.a6.20.149.5b Custom Emoji Feedback Progress (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| feedback split | `pass-local` | 添加、删除、排序 success/error 直接进入全局 `useAppToast`；初始化同步失败继续由 `loadError` 页面状态承载 | none |
| cleanup | `pass` | 删除 `notice` 状态、`OperationToastFeedback` 间接消费和 `.is-success` 横幅 CSS | none |
| browser | `pass-readonly` | 412px 真实表情页：inline success=0、Toast host=1、viewport/scrollWidth=412/412、零 warning/error；未重复 mutation | 真实下一次操作 Toast 活动帧 |
| verification | `pass` | focused 2 files/7 tests；full 147 files/476 tests；Web typecheck；1198-module production build | existing >500kB chunk warning |
| protection | `pass` | 仅 H5 页面/CSS/contract/docs；SDK 与 RN source 未修改 | none |

## W6.a6.20.149.6 Pending Multi-Forward Draft (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen RN `ChatHomeScreen.openPendingForwardTarget` 只解析首个目标、切换会话并挂载 `PendingForwardPayload`；Composer 点击发送才执行 batch forward | none |
| target selection | `pass-local` | 聊天转发目标改为 `single`；确认只执行 `prepareChatForwardTargetDestination`，不调用 `messages.forward/forwardToTargets` | none |
| draft route | `pass-local` | Router state 仅保存来源会话、标题和有序 clientMsgIDs；目标聊天从 SDK cache 恢复“转发N条消息/来自”预览，消息正文不进入 history state | reload 后内存草稿按安全约束丢弃 |
| composer send | `pass-unchanged` | 用户点击发送时继续消费 canonical `messages.forward`，可附带留言；取消和更换目标不发送，取消更换目标不再丢原草稿 | 真实最终发送仍需 action-time 授权 |
| browser | `pass-auth-readonly` | 真实会话选 2 条 -> 单选 `donk` -> URL 切到目标聊天 -> 底部显示“转发2条消息 / 来自：donk三大爷”；目标历史仍为原 3 条，未点击发送 | 最终发送/list-back 未执行 |
| verification | `pass` | focused 2 files/8 tests；full 147 files/475 tests；Web typecheck；1198-module production build | existing >500kB chunk warning |
| protection | `pass` | 仅修改 H5 路由/UI 编排与测试；SDK/RN source 均未修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` | none |

Closeout verdict: `.149.6 completed/send-action-gated`。目标选择与消息发送已严格分离；不把未点击的最终发送声明为真实 mutation 验收。

## W6.a6.20.149.5a Operation Toast Consumers (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| global owner | `pass-local` | App 顶层唯一 `AppToastProvider/useAppToast`；`OperationToastFeedback` 只接收已分类的瞬时 success/error | authenticated mutation pixel |
| consumers | `pass-local` | 23 个生产页面/反馈 owner 已接入；覆盖聊天、四类单选好友分享、二维码下载、资料保存/复制、账号安全、通知、联系人动作和好友/群申请 | `.149.5b` 后续批次已关闭 |
| structural states | `pass` | load、权限、空态、媒体内联状态、RTC 持久错误和带重试错误继续由页面结构呈现；未机械替换全部 `role=status/alert` | none |
| focus/reset | `pass-browser` | 删除全部输入壳 `:focus-within` 描边；1280px 登录输入聚焦为 `border:0/box-shadow:none/outline:none`；按钮/链接键盘 focus-visible 保留 | mobile physical keyboard |
| browser | `pass-guest` | 5176 验证码 contract 提示显示为顶部成功 Toast；1280/1280 无横向溢出；未登录标签未调用真实认证或发送 mutation | 已登录分享/保存/失败 Toast |
| cleanup | `pass` | 删除三个无消费者 copy-state CSS 与十套 focus-within override；旧 clipboard contract 改为 success-only Toast | none |
| verification | `pass` | focused 6 files/28 tests；full 147 files/473 tests；Web typecheck；1198-module production build；5176 HTTP 200 | existing >500kB chunk warning |
| protection | `pass` | RN business 未改；未执行 RN/Desktop/all 或 `build:package:desktop:web`；SDK 仅沿既有 H5 typecheck 执行允许的 `build:web/sync:web` | none |

Closeout verdict: `.149.5a clean/local-complete/authenticated-action-gated`。本片不将未执行的真实名片/二维码发送、账号修改、好友/群申请或联系人 mutation 写成浏览器验收完成；后续 `.149.5b` 已于同日关闭。

## W6.a6.20.149.3/.149.4 Card Settings Recorder And RTC (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| card action | `pass-local` | type108 显式保存 user/group 与 targetID；用户名片进入资料；群名片 cache-first 判断已加入后进入群资料，否则进入申请页 | authenticated card pixel |
| settings/reset | `pass-local` | 单聊文字头像链接去下划线；input/textarea/select focus 去浏览器默认轮廓且按钮/链接保留键盘焦点；定时删除确认按钮不再被统一 Navbar 撑至 56px | mobile keyboard/device pixel |
| recorder | `pass-local` | 只在真实 recording 状态运行分段音量条动效；上滑取消立即停动效并切危险态；reduced-motion 保持静态 | physical touch + microphone sample |
| RTC chain | `pass-local/external-gated` | 复核 `CallTypeActionSheet -> WebIMCallProvider -> SDK calls -> LiveKit media port -> /calls/active`；呼入/呼出/终态/凭据隔离均为正式 owner，无 fake call | 双账号 Gateway credential、权限、接通、重连和挂断 |
| feedback | `pass-local` | 定时删除提交 success/error 使用全局 Toast；加载失败仍保留页面可重试状态 | repo-wide consumers 在 `.149.5` |
| verification | `pass` | card 2 files/15 tests；recorder/auto-delete/call 5 files/17 tests；Web typecheck；1197-module production build | existing >500kB chunk warning |
| protection | `pass` | 仅 H5；SDK/RN 未改；未运行 RN/Desktop/all 或禁改脚本 | none |

Closeout verdict: `.149.3 clean/local-complete/browser-session-gated; .149.4 clean/local-complete/external-rtc-gated`。正式 RTC 代码链已存在且通过构建，但不把缺少部署侧双账号媒体证据写成端到端完成。

## W6.a6.20.149.2 Single-Friend Share And QR Modal (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| target contract | `pass-local` | 好友名片、群名片、个人二维码、群二维码均 `single + friend-only`；无 ALL/群聊 Tab；确认再次校验 `kind=friend` | authenticated picker pixel |
| shared mutation | `pass-unchanged` | 继续消费 `messageBroadcast.sendCard/sendImage`；每次仅提交一个 friend target；无页面 send DTO/state machine 分叉 | 真实发送需 mutation 授权 |
| QR owner | `pass-local` | 个人/群二维码继续共用 `QRCodeDisplay` Canvas/export；展示改为唯一 `InteractionModal`，light/dark token 共享 | authenticated mobile/dark pixel |
| verification | `pass` | focused 3 files/9 tests；Web typecheck；1197-module production build | existing >500kB chunk warning |
| browser | `blocked-session` | 与 `.149.1` 相同的 5176 multi-tab SQLite lease；未关闭用户 tab | lease 释放后补视觉 |
| protection | `pass` | 仅 H5 picker/QR/cards/docs；SDK/RN 未改；禁跑脚本未执行 | none |

Closeout verdict: `clean/local-complete/browser-session-gated/send-mutation-gated`。选择与 modal 合同已收敛；不声明真实名片/二维码发送成功。

## W6.a6.20.149.1 Chat Multi-Select And Toast Foundation (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen `ChatDetailHeader/ChatDetailComposerArea/ToastProvider`：取消+数量在 Navbar；底部仅转发/删除；Toast=1600ms top pill + success/error | physical touch |
| multi-select layout | `pass-local` | selector 固定消息行左侧；普通/群聊气泡方向不变；Navbar 隐藏普通资料/设置动作 | authenticated pixel proof |
| bottom actions | `pass-local` | 仅转发、删除两个 24px 图标；零选择同时 disabled；删除/转发原 mutation owner 未改 | delete/forward authorized smoke |
| Toast owner | `pass-foundation` | App 顶层唯一 `AppToastProvider/useAppToast`；聊天 error 优先、notice success；旧页面横幅 CSS 删除 | 其他页面消费者迁移在 `.149.5` |
| verification | `pass` | focused 3 files/7 tests；Web typecheck；1197-module production build | existing >500kB chunk warning |
| browser | `blocked-session` | 5176 真实页面被另一 tab 持有 SQLite lease，claim 后安全回 `/auth/phone` 并提示关闭占用 tab | 用户现有会话释放后补 mobile/dark pixel |
| protection | `pass` | 仅 H5 UI/docs；SDK、RN business/generated 未改；未运行 RN/Desktop/all | none |

Closeout verdict: `clean/local-complete/browser-session-gated`。多选与 Toast 结构已对齐 RN；不把被多标签 lease 阻断的页面写成浏览器通过。

## W6.a6.20.148.2/.148.3 H5 Offline Shell And Isolated Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| route boundary | `pass` | offline states only mount cached conversations/chat routes；CallProvider、PrimaryTabs、search/settings/presence and remote tabs remain unmounted | Safari/Firefox、physical device |
| readonly UI | `pass` | banner + retry/sign-out；cached list/history readable；composer、message actions、profile/settings and conversation long-press unavailable | media bytes are not an offline claim |
| strict-mode safety | `pass` | real reload exposed duplicate `restore()` DB-owner race；SDK now coalesces concurrent restore calls and regression proves one read-only open | multi-tab lease contention |
| isolated cold reload | `browser-pass-real` | isolated `5179 -> 5191` warm-up；proxy-down reload retained 4 conversations and `H5-WS-1786686250693` chat history | long-duration/background eviction |
| reconnect | `browser-pass-real` | proxy-down retry retained reader with visible network error；restored proxy revoked shell and returned full online conversations/tabs | unstable/flapping network |
| invalid cleanup | `browser-pass-real` | isolated check `valid:false` + refresh failure revoked reader/session/DB owner and returned `/auth/phone` | production token expiry timing |
| verification | `pass` | SDK Web 101/425；H5 142/457；466 assets、typecheck、runtime boundary、build:web/sync:web and 1195-module production build | existing >500 kB chunk warning |
| protection | `pass` | no send/mark-read/draft/profile/group/call/message/conversation mutation；only `build:web/sync:web`；RN business untouched | RN remains frozen |

Closeout verdict: `clean/h5-consumed/browser-cold-reload-reconnect-invalid-cleanup-pass`。能力只声明当前 tab 的已有账号快照在 Gateway transport unavailable 时可只读恢复；不声明离线登录、离线写入/队列、媒体离线副本、跨浏览器或设备完成。

## W6.a6.20.148.1c Runtime Offline Restore And Reconnect Orchestration (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| eligibility | `pass` | only stable Gateway network-unavailable opens existing read-only snapshot；business/HTTP/invalid fail closed | isolated browser proof |
| capability | `pass` | offline reader runtime-gated；full sync/settings/security/incoming-call unavailable；no recovery/realtime in offline restore | H5 consumer |
| reconnect | `pass` | single-flight network retry retains reader；valid/refresh upgrades canonical DB/realtime；invalid clears session/DB | online event/UI |
| concurrency | `pass` | sign-out/new auth increments reconnect generation；stale validation cannot publish success、open readwrite DB or create WS | browser race smoke |
| verification | `pass` | focused 4 files/17；Web full 101/424；typecheck/boundary/build:web/sync:web；H5 typecheck/build | `.148.2/.148.3` |
| protection | `pass` | RN protected source/generated diff empty；no RN/Desktop/all or `build:package:desktop:web` command | RN frozen |

Closeout verdict: `clean/runtime-safe/not-h5-consumed`。SDK production runtime 已闭合离线身份与重连安全，但 H5 provider/pages 尚未读取 offline snapshot/reader，不能声明用户可见能力完成。

## W6.a6.20.148.1b Existing-Snapshot Read-Only Storage And Reader (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| no-create | `pass` | missing snapshot read aborts first IndexedDB upgrade and leaves `databases()=[]` | browser cold reload |
| read-only storage | `pass` | lifecycle mode reaches caller-thread and Worker adapters；no migrations/export/close persistence；execute/transaction reject | runtime orchestration |
| capability surface | `pass` | reader keys fixed to conversations/messages cache queries；no Gateway/token/WebSocket/mutation dependency；revoked context rejects | runtime-owned context gate |
| shared logic | `pass` | normal Web sync and offline reader share conversation item projection and message history functions | H5 consumer |
| verification | `pass` | focused 7 files/35；Web full 100/419；typecheck/boundary/build:web/sync:web；H5 typecheck/build；diff check | `.148.1c/.148.2/.148.3` |
| protection | `pass` | RN protected source/generated empty；no RN/Desktop/all or `build:package:desktop:web` command | RN frozen |

Closeout verdict: `clean/storage-reader-safe/not-consumed`。本片关闭 no-create/no-write/read-only API 门禁，但 production restore 尚未返回 reader，因此不声明功能可用。

## W6.a6.20.148.1a Transport Classification And Lifecycle Foundation (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| error classifier | `pass` | browser fetch `TypeError` only -> `GATEWAY_NETWORK_UNAVAILABLE`；non-transport error identity preserved；HTTP response path unchanged | storage eligibility consumer |
| lifecycle | `pass` | `anonymous -> offline-readonly -> offline-validating -> authenticated/offline-readonly/anonymous` guarded transitions；offline cannot connect realtime | runtime orchestration |
| production exposure | `pass/none` | `restore()`、DB open、full sync facade and H5 shell unchanged；无半成品离线入口 | `.148.1b/.148.2` |
| verification | `pass` | SDK focused 2 files/10 tests；H5 typecheck/build；Web boundary/build:web/sync:web；RN protected diff empty | isolated browser acceptance |
| protection | `pass` | no RN source/generated rewrite；no RN/Desktop/all or `build:package:desktop:web` command | RN remains frozen |

Closeout verdict: `clean/foundation-complete/not-consumed`。当前代码只建立安全分类和状态图，不声明冷启动离线已经可用。

## W6.a6.20.148 Cold-Start Offline Safety Contract Freeze (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| production gap | `confirmed` | `.131` 的隔离 Gateway reload 固定在 `check-token` 失败后 close DB 并回 auth | implementation |
| auth safety | `frozen` | only fetch transport unavailable may enter offline；invalid/HTTP/business errors fail closed | error classifier tests |
| storage safety | `frozen` | existing durable snapshot only；read-only open does not create/migrate/export/write；Web Lock remains mandatory | storage port/tests |
| capability safety | `frozen` | dedicated `WebIMOfflineReader` only；offline `getSync()` unavailable；no local/remote mutation or queue | SDK facade/tests |
| reconnect | `frozen` | single-flight check/refresh；network failure retains reader；invalid clears session/DB；success restores canonical runtime | lifecycle/tests |
| H5 scope | `frozen` | offline list/chat/banner/retry/sign-out only；no composer/actions/presence/call controls | `.148.2` |
| protection | `pass` | docs-only；H5/SDK/RN runtime source unchanged，no build/sync or business mutation | implementation gate |

Closeout verdict: `clean/contract-frozen/implementation-pending`。本片把原 external design gate 转为可执行的本地 implementation queue，但不把合同写成已实现能力。

## W6.a6.20.147 External Gate Activation Review (2026-08-14)

| gate class | status | evidence | resume condition |
| :--- | :--- | :--- | :--- |
| natural data | `blocked` | `.145-.146` 已审计三个授权账号；pending、admin/role bubble、bound reset、call record、available/conversation-only group 均无可用样本 | 对应 production list/chat/profile 出现真实目标状态 |
| mutation | `blocked-authorization` | send、accept/reject、profile/security、call delete、group management、clear/edit/delete 等会改变服务器或 SQLite | 明确 operation、一次性目标、允许副作用和验收窗口 |
| deployment | `blocked-external` | RTC 服务/鉴权与真实 call flow 不由本地只读环境提供 | 可用 RTC 部署和测试凭据/账号 |
| browser/device | `blocked-external` | 当前仅 Chromium in-app browser；Safari、Firefox、实体设备和 physical touch 不可验证 | 提供对应运行会话或设备 |
| design | `blocked-separate-slice` | cold-start offline 等条目需要新增 contract/实现，不能由现有页面只读 smoke 关闭 | 独立功能或修复授权后重新 plan |
| auto activation | `none` | 重复读取不会产生新证据，只会复述空态 | 外部状态发生变化后恢复 |
| protection | `pass` | 本片仅更新执行文档；H5/SDK/RN runtime source 未修改，未执行任何 SDK build/sync | RN business 继续冻结 |

Closeout verdict: `paused/no-safe-auto-activation/external-input-required`。迁移不标记完成；已关闭的本地实现保持关闭，剩余项继续可追踪且不得以 fixture、fake success 或重复空态审计替代。

## W6.a6.20.146 Cross-Account Residual Candidate Audit (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| bound reset | `blocked-natural-data` | 账号 2/3 安全总览分别显示手机号、邮箱未绑定和“账号密码”；`profile.account` 为空，未进入 reset branch | natural bound account reset form、approved reset mutation |
| call record | `blocked-natural-data` | 账号 2/3 `/calls` 均显示“暂无通话记录” | non-missed、duration、detail/delete/list-back |
| available group | `blocked-natural-data` | 账号 2 服务端关键词 `62` 与 `群` 的群 Tab 均为“没有找到相关群聊” | available/pending group row、application route |
| conversation-only group | `blocked-natural-data` | 账号 3 conversation list 有 2 个 group conversations；joined list 返回相同 `74522614714/97524759106` 两群 | conversation-only group recovery |
| member route | `already-covered` | 账号 3 直达 manage replace 回 settings；与 `.107` 普通成员 fail-closed 证据一致，不重复关闭新 gate | natural admin positive surface |
| safety | `pass` | 未输入/提交 credential，未编辑 call，未申请群，未打开 unread chat 或执行业务 mutation | login/cache establishment only |
| protection | `pass` | runtime source 零修改；未运行 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web` | external browser/device |

Closeout verdict: `clean/audited-cross-account-candidates/blocked-natural-data/runtime-clean`。本片排除当前授权账号可安全提供的三类候选样本，不改变既有 production owner 或完成状态。

## W6.a6.20.145 Multi-Account Natural-Data Gate Audit (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| account isolation | `pass` | 三个已授权手机号账号分别通过 production phone-code login 建立 tab-scoped session/account DB；未读取浏览器 storage/token | cold-start/offline、多浏览器 |
| friend pending | `blocked-natural-data` | 账号 1/2/3 分别返回 3/3/2 条历史申请，全部展示“已添加”；无 incoming pending action | pending row、确认弹层、approved accept |
| group pending | `blocked-natural-data` | 三账号 `/contacts/verifications/group` 均真实返回“暂无群聊验证” | owner/admin 非空审核、detail、accept/reject |
| role bubble | `blocked-natural-data` | 账号 2 的两个 unread=0 群分别只有 system message 与 self message；账号 3 的同一 owner message 会话 unread=2，按保护规则未打开 | 他人 owner/admin 已读消息气泡自然像素 |
| preserved evidence | `pass` | 账号 2 群列表证明 `donk二大爷的群聊` 为其创建/群主；账号 3 会话摘要证明该群 last sender=`donk二大爷` | 摘要不替代 bubble role label |
| safety | `pass` | 未点击资料/接受/拒绝，未打开 unread chat，未执行 mark-read、send、Gateway/SQLite business mutation | 登录本身仅建立隔离 runtime/cache |
| protection | `pass` | H5/SDK/RN runtime source 零修改；未运行 SDK build/sync 或 forbidden package scripts | cross-browser/device |

Closeout verdict: `clean/audited-three-accounts/blocked-natural-data/runtime-clean`。本片只收敛样本事实与激活条件，不把空态、摘要或 self message 外推为 pending/角色气泡验收。

## W6.a6.20.144 Conversation Remark Responsive Theme Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen RN 会话标题 `numberOfLines=1`；可见加号与 40px 点击区分离 | RN caller 继续冻结 |
| narrow light | `browser-pass-real` | authenticated `320x786`；真实备注=`donk二大爷备注名`；标题/时间无重叠，document=`320/320` | 更长自然备注、physical touch |
| desktop dark | `browser-pass-real` | authenticated `760x900`；surface=`rgb(15,17,21)`、text=`rgb(245,245,247)`；标题/时间无重叠，document=`760/760` | Safari/Firefox、实体设备 |
| plus geometry | `pass` | 两个 viewport 均保持 trigger=`40x40`、glyph/pseudo=`14x2` | 系统缩放、辅助技术设备 |
| runtime | `pass-readonly` | warning/error=0；未打开聊天、未 mark-read、未执行 Gateway/SQLite mutation | remark realtime refresh |
| media audit | `blocked-natural-data` | 历史媒体会话的当前账号 search route 无 open database snapshot；未注入 URL 或用历史截图冒充 playback | 真实无未读 image/audio/video payload |
| protection | `pass` | 无 H5/SDK/RN runtime source edit；主题恢复 light、viewport 恢复 `412x786`、route 恢复 `/conversations` | cross-browser/device |

Closeout verdict: `clean/browser-narrow-light-desktop-dark-pass/media-natural-data-gated`。本片只关闭真实备注标题与加号的 Chromium responsive/theme gate；任意超长备注与真实媒体播放不外推。

## W6.a6.20.143 Conversation Remark Title And Home Plus Parity (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen RN 会话列表从好友 cache 叠加 remark；`GroupActionBubble` 为 40px touch target、18px icon box 内 14x2px glyph | RN caller 继续冻结 |
| shared title owner | `fixed` | SDK `listCachedItems` 批量读已确认 friendships，仅对单聊展示快照投影备注；不覆盖 conversation SQLite | RN consumer convergence 待授权 |
| H5 icon | `fixed-local` | 可见线条 `20px -> 14px`；40x40 trigger、2px stroke 和菜单交互不变 | Safari/Firefox、实体设备 |
| browser | `pass-real` | `412x786` 首条标题=`donk二大爷备注名`；群摘要=`donk二大爷备注名：1231`；trigger=40x40、glyph/pseudo=14x2、document=412/412 | remark realtime event、长备注截断 |
| verification | `pass` | SDK 3 files/23 tests；H5 3 files/17 tests；Web typecheck；`build:web/sync:web` | full suites 未重复执行 |
| protection | `pass` | RN protected source 未改；未执行或同步 RN/Desktop/all；`build:package:desktop:web` 未修改/执行；warning/error=0 | cross-browser/device |

Closeout verdict: `clean/shared-core-ready-web-consumed-rn-frozen/browser-rn-visual-pass`。备注标题双轨由 SDK Web consumer 收敛，RN caller 保持冻结；加号视觉已对齐 RN。

## W6.a6.20.142 Chat Card Picker Real Group Target Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen RN `CardPickerModal/useChatCardPicker` 为好友/群聊单选；名片目标与发送状态分离 | RN caller 继续冻结 |
| production source | `browser-pass-real` | 无未读单聊 `donk三大爷` 打开附件“名片”；好友 Tab 排除本人和当前对端，仅余 1 位好友；群聊 Tab 返回 2 个真实 joined groups | cache-miss、加载失败 |
| single selection | `pass-local-state` | 先选 `donk二大爷的群聊` 后 selected=1/CTA enabled；再选 `donk的群聊` 后前项清除、计数仍为 1 | 搜索过滤、超长名称 |
| mobile layout | `pass` | `412x786`；sheet 未横向溢出，document=`412/412`；群目标两列可见 | Safari/Firefox、实体设备 |
| close | `browser-pass` | 未点击分享；关闭弹窗返回原单聊，消息列表和 composer 保持 | 最终 type108 send、list-back |
| verification | `pass` | H5 picker/card/composer 4 files/10 tests；Web typecheck；临时同源 dev-pc smoke | full H5/SDK 未重复执行 |
| protection | `pass` | 5176 被已有 SQLite owner 占用时改用临时 5178 origin；结束恢复默认 viewport、关闭 tab/临时 server；无 Gateway/SQLite mutation；RN/SDK source 不改 | second-account realtime、真实失败重试 |

Closeout verdict: `clean/browser-chat-card-real-group-single-selection-pass/send-gated`。真实群目标单选替换 gate 已关闭，type108 shared mutation 仍保持授权门禁。

## W6.a6.20.141 Group QR In-App Share Group-Target Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen `ForwardTargetSelector variant=cardShare` 使用 `selectedKeys` 支持好友/群聊跨 Tab 多选；旧合同“单选”描述已纠正 | RN caller 继续冻结 |
| production source | `browser-pass-real` | 群二维码 share route 从同一 canonical conversation 恢复来源；target facade 返回真实 2 好友、2 群聊 | 大目标集、加载失败 |
| group selection | `pass-local-state` | 群聊 Tab 展示 `donk二大爷的群聊`、`donk的群聊`；群聊 ALL 后 selected=2、CTA enabled | 50 上限自然数据 |
| cross-tab | `pass-local-state` | 返回好友 Tab 保留 2 个群选择；好友 ALL 后累计 4，全部 target 显示选中 | 搜索过滤下 ALL |
| mobile layout | `pass` | `412x786`；sheet=`380x754@16`、document=`412/412`；无 alert、warning/error | desktop/dark、Safari/Firefox、实体设备 |
| close | `browser-pass` | 未点击分享；关闭 replace 回原群二维码 `/settings/qrcode`，identity 保持 `donk的群聊 / 97524759106` | 最终分享、partial result、list-back |
| verification | `pass` | H5 QR/picker 4 files/10 tests；Web typecheck；HTTP 200；diff check green | full H5/SDK 未重复执行 |
| protection | `pass` | 未生成/上传 PNG，未 batch-send、Gateway/SQLite mutation；恢复默认 viewport 并关闭隔离 tab；RN/SDK source diff 为空 | second-account realtime |

Closeout verdict: `clean/browser-group-qr-real-target-multiselect-pass/send-gated`。真实群目标与跨 Tab local selection 已关闭，最终图片发送仍保持授权门禁。

## W6.a6.20.140 Real Group QR Code Desktop Dark Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| production identity | `browser-pass-real` | canonical conversation 恢复 `donk的群聊 / 97524759106`，未注入 route-only group DTO | cache-miss、资料刷新失败 |
| desktop dark | `pass` | `760x900`；surface=`480x900`、left=140；page/surface=`17/19/24`、card=`27/29/36`、text=`245/245/247` | Safari/Firefox、实体设备 |
| QR render | `browser-pass` | Canvas=`268x268`、二维码 box 白底、`aria-busy=false`、下载按钮 ready、无错误文案 | 实际下载、Web Share、扫码 |
| layout | `pass` | card=`448x368`、left=156；document=`760/760`；CTA 与 hint 无重叠 | 更宽桌面、系统主题切换 |
| route | `browser-pass` | 暗色下返回同一 conversation 群资料，群名、群 ID、二维码入口一致 | 多步 history、扫码返回 |
| verification | `pass` | H5 QR/profile 4 files/9 tests；Web typecheck；HTTP 200；warning/error=0；diff check green | full H5/SDK 未重复执行 |
| protection | `pass` | 未点击下载/分享/扫一扫；未执行上传、发送、申请、Gateway/SQLite mutation；已恢复 light/default viewport 并关闭隔离 tab；RN/SDK source diff 为空 | 应用内发送与第二账号 list-back |

Closeout verdict: `clean/browser-real-group-qr-desktop-dark-pass/export-scan-send-gated`。本片关闭 `.139` 的 desktop/dark residual，不新增或改写二维码 owner。

## W6.a6.20.139 Real Group QR Code Mobile Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| production identity | `browser-pass-real` | canonical conversation `019ff8b7-b24f-7e71-afe1-332d40294c00` 恢复 `donk的群聊 / 97524759106`；群名和群 ID 与返回后的群资料一致 | cache-miss、资料刷新失败 |
| QR render | `browser-pass` | shared group payload 在共用 `QRCodeDisplay` Canvas 渲染为可见二维码；CSS=`268x268`、bitmap=`472x472`、`aria-busy=false`、下载按钮仅在 ready 后开放 | 实际下载、Web Share、扫码 |
| mobile layout | `pass` | `412x786`；card=`380x368`、document=`412/412`、无错误文案 | dark/desktop 已由 `.140` 关闭；Safari/Firefox、实体设备 |
| route | `browser-pass` | “返回群资料”精确回到同一 conversation 的 `/settings/profile`，群二维码入口仍绑定该群 | 多步 history、扫码返回 |
| verification | `pass` | H5 QR/profile focused 4 files/9 tests；Web typecheck；HTTP 200；warning/error=0；`git diff --check` | full H5/SDK 未重复执行 |
| protection | `pass` | 未点击下载、分享、扫一扫；未执行上传、发送、群申请、Gateway/SQLite mutation；RN protected diff 与 SDK source diff 为空 | 应用内发送与第二账号 list-back |

Closeout verdict: `clean/browser-real-group-qr-mobile-pass/export-scan-send-gated`。本片关闭 `.18.3.18` 因旧账号自然数据不足而遗留的真实群二维码视觉门禁，不新增业务实现。

## W6.a6.20.138 Broadcast Target Picker Desktop Dark Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| production data | `browser-pass-real` | 当前账号真实 2 位好友、2 个群聊；目标由 shared cache-first facade 提供 | 大目标集、失败态 |
| desktop dark | `pass` | `760x900`；sheet=`720x868`、left=20、bg=`17/19/24`、scrollWidth=760 | Safari/Firefox、实体设备 |
| selection | `pass-local-state` | 好友 ALL=2，群聊 ALL 后累计 4；返回好友 Tab 保留跨 Tab 选择，CTA enabled | 50 上限自然数据 |
| close | `browser-pass` | 关闭弹窗 replace 回 `/conversations`；未进入 compose | browser history 多步恢复 |
| verification | `pass` | H5 picker/broadcast 4 files/10 tests；Web typecheck；HTTP 200；warning/error=0 | full H5/SDK 未重复执行 |
| protection | `pass` | 未点击 CTA、未发送、未执行 Gateway/SQLite mutation；恢复 light/default viewport 并关闭隔离 tab；RN protected diff 为空 | real partial result/realtime/list-back、physical touch |

Closeout verdict: `clean/browser-broadcast-desktop-dark-selection-pass/send-gated`。本片只关闭统一目标选择器的真实桌面暗色与本地跨 Tab 选择 gate。

## W6.a6.20.137 Group Management Owner Dark Responsive Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| production data | `browser-pass-real` | 真实 owner 群显示三个开关、群禁言、发言频率、定时删除、入群申请、管理员设置与群主转让 | admin/member 自然角色不在本片 |
| mobile dark | `pass` | `412x786`，page=`17/19/24`、card=`27/29/36`、card=380px/radius=8px、scrollWidth=412 | Safari/Firefox、实体设备 |
| desktop dark | `pass` | `760x900`，page/card token 同 mobile、card=728px、scrollWidth=760 | 更宽桌面与系统主题 |
| route | `browser-pass` | 群主转让进入既有 owner-transfer route，显示两位非本人候选；关闭精确返回群管理 | 未选择候选或打开确认 |
| verification | `pass` | H5 4 files/15 tests；Web typecheck；SDK Web 98 files/408 tests；HTTP 200；warning/error=0 | full H5 suite 未重复执行 |
| protection | `pass` | 恢复 light/default viewport 并关闭隔离 tab；无设置、转让、Gateway/SQLite mutation；RN protected diff 为空 | natural admin、真实 mutation、cross-browser/device |

Closeout verdict: `clean/browser-owner-mobile-desktop-dark-pass/admin-and-mutation-gated`。本片只关闭真实 owner 的 Chromium 暗色、响应式和既有 route-return gate。

## W6.a6.20.136 Group Management Role Presentation Parity (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen RN 对 admin 保留三项开关、只读发言频率、管理员设置与“群主转让/仅群主”；member 不进入管理页 | none |
| shared boundary | `pass` | `buildGroupManagementRoleView` 只消费 `canManageAdmins/canTransferOwner`；不解析 roleLevel，不复制 permission resolver | RN caller 继续冻结 |
| owner runtime | `browser-pass-real` | 真实 owner 群三个 switch 仍 enabled；群禁言、发言频率、自动删除、管理员设置、群主转让继续为既有 Link | owner mutation 未执行 |
| admin projection | `implemented-local/natural-data-gated` | admin 显示 switch 但 disabled，发言频率显示 current value 但不导航，群主转让显示“仅群主” | 当前无自然 admin 账号，未声明 browser pixel |
| member guard | `pass/fail-closed` | production route 继续用 shared `canOpenGroupManage` replace 回群设置；页面无角色枚举 | member direct-route browser 已由 `.107` 证明 |
| verification | `pass` | H5 role/group-management focused 5 files/17 tests；Web typecheck；production caller assertion | full suite 未因局部展示修正重复执行 |
| protection | `pass` | 无 switch click、候选选择、确认或 Gateway/SQLite mutation；SDK source/RN protected diff 为空 | admin natural role、cross-browser/device、真实 mutation |

Closeout verdict: `clean/role-presentation-converged/owner-browser-pass/admin-natural-data-gated`。本片收敛 H5 信息层级，不外推管理员自然像素或任何群管理 mutation。

## W6.a6.20.135 Group Owner Transfer Label Parity (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN truth | `pass` | frozen RN `GroupManageScreen` 行文案为“群主转让”；H5 原为“转让群主” | none |
| presentation | `fixed/browser-pass-real` | H5 群主管理页改为“群主转让”；真实 owner 群页面显示新文案 | dark/mobile 像素沿用 `.112/.113`，本片无 CSS 改动 |
| route | `browser-pass` | 新文案进入既有 `/settings/manage/owner-transfer`，显示两位非本人候选；“关闭选择新群主”精确返回群管理 | 确认层和真实转让未执行 |
| ownership | `pass/no-drift` | 仅修改 `ManagementLink` label 与对应 route contract assertion；权限、候选解析、SDK facade、Router URL 均不变 | RN caller 继续冻结 |
| verification | `pass` | H5 group management/owner transfer focused 4 files/13 tests；`@im28/h5-web` typecheck | full suite 未因单文案修正重复执行 |
| protection | `pass` | 未选择候选、未打开确认、未执行 transfer/Gateway/SQLite mutation；SDK source 与 RN protected diff 为空 | 跨浏览器/设备与真实 mutation |

Closeout verdict: `clean/rn-label-parity/browser-route-return-pass`。本片只关闭 RN/H5 群主转让入口文案偏差，不声明群主转让 mutation、realtime 或 list-back 完成。

## W6.a6.20.134 Contact Common-Groups Consistency (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| profile count | `browser-pass-real` | `donk二大爷` 资料异步加载完成后显示 `共同的群聊 2`；首帧空值未作为最终业务事实 | 慢网 loading 像素未单独验收 |
| common-group list | `browser-pass-real` | `/contacts/users/94424103659/groups` 返回同一批 2 个真实三人群：`donk二大爷的群聊`、`donk的群聊` | 大列表分页、Safari/Firefox、实体设备 |
| canonical open | `browser-pass` | 选择已知无未读的 `donk的群聊`，经 shared `conversations.openGroup` 进入 canonical conversation `019ff8b7-b24f-7e71-afe1-332d40294c00` | cache-miss Gateway fallback 未单独触发 |
| list-back | `browser-pass` | chat 显示真实群名、`2人在线`、缓存系统消息；返回会话列表后总未读保持 4 | offline reload 由 cold-start contract 管理 |
| ownership | `pass/shared-owner` | 资料数量与共同群列表均消费 SDK `contacts.listCommonGroups`；SDK 完成分页、token 防循环、去重与 success-only cache upsert，H5 无第二查询/映射 owner | RN caller 继续冻结，不声明 converged |
| runtime quality | `pass` | runtime=`online`；viewport/scrollWidth=`412/412`；warning/error=0 | 跨浏览器/设备 |
| verification | `pass` | SDK contact-actions 1 file/13 tests；H5 profile/child-route/search 3 files/16 tests | full suite 未因 docs-only 验收重复执行 |
| protection | `pass` | 本片仅改 docs；未 mark-read/send/refresh/mutation，既有 H5 dirty source 原样保留，SDK source 与 RN protected diff 为空 | none |

Closeout verdict: `clean/browser-real-common-groups-count-list-open-consistent`。`.75/.95` 的旧自然样本不一致残项由当前真实结果取代；不声明 cache-miss、离线冷启动、大列表分页或跨浏览器/设备完成。

## W6.a6.20.133 Joined Group Open-Conversation Persistence (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| real entry | `browser-pass-real` | `/contacts -> 我的群聊` 返回 2 个真实群；选择无未读 owner 群 `donk的群聊` | 大群、Safari/Firefox、实体设备 |
| canonical open | `pass-runtime-chain` | production row 调用 shared `conversations.openGroup`，导航到真实 conversation `019ff8b7-b24f-7e71-afe1-332d40294c00` | cache-miss Gateway fallback 未单独触发 |
| chat projection | `browser-pass` | chat 显示真实群名、`2人在线` 与缓存系统消息“群聊已创建” | 非系统消息不在本片 |
| list-back | `browser-pass` | 返回 `/conversations` 后目标群仍存在，preview 保留；总未读前后均为 4 | offline reload 由独立 cold-start contract 管理 |
| runtime quality | `pass` | runtime=`online`；viewport/scrollWidth=`412/412`；warning/error=0 | 跨浏览器/设备 |
| verification | `pass` | SDK open-group 1 file/4 tests；H5 joined-group 3 files/9 tests | full suite 未因 docs-only验收重复执行 |
| protection | `pass` | 未进入有未读群、未 mark-read/send/refresh/mutation；本片仅改 docs，既有 H5 dirty source 原样保留，SDK source 与 RN protected diff 为空 | none |

Closeout verdict: `clean/browser-real-joined-group-open-and-list-back-pass`。本片关闭 Joined Groups 的真实 conversation-open persistence；不声明 cache-miss fallback、离线冷启动、长按动作或任何群 mutation。

## W6.a6.20.132 Real RTC Start Deployment Gate (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| dual online | `browser-pass` | `donk二大爷` caller 与 `donk三大爷` receiver 位于两个独立 origin，均为 `online` | 跨浏览器/实体设备 |
| production entry | `browser-pass-real` | caller 从真实单聊依次进入功能面板、音视频通话、语音通话和 `/calls/active` | 视频分支未执行 |
| call start | `blocked-deployment` | active route 显示目标昵称和“通话已结束 / 服务不可用”；没有伪造 call、credential 或媒体状态 | 需部署侧恢复真实通话创建与凭证签发 |
| incoming invite | `not-reached` | receiver 保持会话列表且没有全局来电 overlay | 服务可用后重跑 invite -> reject |
| durable record | `not-created` | caller/receiver 的 `/calls` 均显示“暂无通话记录”，证据表明本次 start 未形成可持久化 call | 未抓取 Network，不声明具体 HTTP 状态码 |
| failure cleanup | `pass` | caller 挂断返回会话列表；两端 runtime 继续 `online`，测试 tab/独立 5178 已关闭 | none |
| verification | `pass` | SDK RTC 4 files/21 tests；H5 incoming/list/modal 3 files/10 tests；diff boundary clean | 真实 invite/reject/answer 仍 blocked |
| protection | `pass` | H5/SDK/RN production source 零改动；未执行 SDK build/sync；无 permission bypass、retry loop 或 fake-success | none |

Closeout verdict: `blocked-deployment/runtime-clean/no-call-created`。本片只证明真实 production 入口、失败投影与清理链正常；在部署返回可创建 call 前，不把 incoming、reject、answer、LiveKit 媒体或通话记录标记完成。

## W6.a6.20.131 Offline SQLite Cache-First Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| isolation | `pass` | 独立 `5178` origin 仅经临时 `5190` HTTP proxy 访问 Gateway，WebSocket 从启动即指向未监听本地端口；未停止共享 Gateway 或 5176 | Safari/Firefox、实体设备 |
| online warm-up | `browser-pass-real` | `donk二大爷` production 登录后同步 4 个会话；唯一 marker `H5-WS-1786686250693` 已进入当前账号 SQLite | none |
| offline list/cache | `browser-pass-real` | 关闭仅测试会话使用的 HTTP proxy 后，联系人仍显示 2 条缓存；SPA 返回会话页仍显示 4 条会话和同 marker，同时远端错误 `Failed to fetch` 可见 | 后台长时离线、quota eviction |
| offline chat/cache | `browser-pass-real` | Gateway 已隔离时进入无未读单聊，`getCachedHistory` 仍显示历史与同 marker；页面未伪造在线成功 | 媒体离线副本不在本能力范围 |
| cold reload | `expected-gated` | Gateway 隔离时整页重载先执行 `check-token`，失败后关闭账号 DB 并回 `/auth/phone` 显示错误 | 离线冷启动尚未实现；需先决定过期 token、只读 DB、发送禁用和重新联网收敛 contract |
| protection | `pass` | 无 fixture/fake-success/第二 cache writer；H5/SDK/RN production source 零改动；未执行任何 SDK build/sync | none |

Closeout verdict: `clean/hot-session-offline-cache-first-pass/cold-start-contract-gated`。本片证明已认证 runtime 生命周期内 Gateway 失败不会抹除 SQLite 列表/历史；不把该证据扩展为刷新、重启或 token 未校验时的离线登录能力。

## W6.a6.20.130 Dual-account Realtime Message Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| dual online | `browser-pass` | `donk三大爷` sender 与 `donk二大爷` receiver 两个独立 tab 均为 `online` | 长时重连矩阵沿用既有 gate |
| send | `browser-pass-real` | sender 通过 production composer 发送唯一文本 `H5-WS-1786686250693`，同会话出现发送气泡 | 非文本发送不在本片 |
| realtime receive | `browser-pass-real` | receiver 未刷新/未导航即从“聊天”变为“聊天(1)”，目标会话出现同 marker 与 1 条未读 | 跨浏览器/后台状态 |
| SQLite convergence | `pass-runtime-chain` | shared realtime 先写 `MessageRepository/ConversationRepository`，成功后发布 `dataVersion`；H5 列表只响应版本重读 `listCachedItems` | 断网 cache-hit 仍是独立 gate |
| chat cache window | `browser-pass` | receiver 新进入会话后由 `getCachedHistory` 显示同 marker；返回列表后 preview 保留且未读清零 | 离线重启恢复未验证 |
| runtime quality | `pass` | sender/receiver warning/error 均为 0；SDK realtime 2 files/6、H5 conversation/chat 2 files/15、route HTTP 200 | none |
| protection | `pass` | H5/SDK production 与 RN protected source 零改动；未执行 SDK build/sync、RN/Desktop/all 或 `build:package:desktop:web` | none |

Closeout verdict: `clean/real-realtime-delivery-list-back-pass/offline-isolation-gated`。本片使用真实 Gateway/WebSocket 和 production UI；无 fixture、mock、fake-success、第二 realtime listener 或第二 SQLite writer。

## W6.a6.20.129 Chat Message Type Parity Audit (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| dedicated bubbles | `pass-static` | RN/H5 均覆盖 text/mention、image、audio、video、file、card、quote、custom emoji、call 与 system notice | 自然媒体样本仍沿用既有 gate |
| type106 | `pass-test` | mention body 进入既有 text view，不新增第二 mention parser | 真实 @ 发送/接收需授权双账号消息 |
| type108 | `pass-test` | 用户名片与群名片快照均进入既有 card view | 真实卡片点击沿用既有自然样本 gate |
| type109 | `aligned-fail-closed` | RN 聊天气泡无专用位置 owner；H5 明确展示 unsupported，不猜测地图或点击能力 | 若产品新增位置消息，需独立冻结跨端 contract |
| verification | `pass` | focused 1 file/14；H5 full 140/449；Web typecheck；466 assets | 本片仅测试/文档，无需重复 production build |
| protection | `pass` | H5 production、SDK source/generated 与 RN protected source 零改动 | 未运行任何 SDK build/sync 或 RN/Desktop/all 脚本 |

Closeout verdict: `clean/message-matrix-audited/no-new-local-implementation-gap`。测试直接消费 production `getChatMessageView`，不新增 fixture-only 分支、Gateway/SQLite/WebSocket owner 或 fake-success。

## W6.a6.20.128 Chat Search Target Highlight (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `pass-static` | RN 常量为 1600ms；H5 同值且使用 `--im-bg-pressed`、14px 圆角 | RN business 未改 |
| real target | `browser-pass` | 真实 `123 -> messageID=61da...c104 -> 当前账号 cache window -> target row` | Safari/Firefox、实体设备 |
| active frame | `browser-pass` | 目标行出现 `is-focus-highlighted`，背景 `rgba(0,0,0,0.04)`；1600ms 后 class 清理 | 跨浏览器动画观感 |
| compatibility | `pass` | 不依赖当前轻量浏览器缺失的 `HTMLElement.animate/getAnimations` | none |
| safety | `pass` | cache-only；无 Gateway/WebSocket/send/download/mutation，不改 SDK/RN | none |
| verification | `pass` | focused 2/5；H5 full 140/446；Web typecheck；466 assets；1189-module build | 既有 large-chunk warning 不变 |

Closeout verdict: `clean/focus-highlight-verified/cross-browser-device-gated`。高亮是 H5 DOM 展示态，搜索、稳定身份与缓存窗口仍由既有 shared owner 提供。

## W6.a6.20.117 Chat Media Read Natural-Data Audit (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| safe candidates | `browser-pass-readonly` | 无未读群仅系统消息；无未读单聊仅申请/建联/文本；归档为空 | 无未读 image/audio/video payload |
| unread protection | `pass` | 2 个带未读会话未打开 | 需先自然变为无未读或另有无未读媒体会话 |
| media interaction | `blocked-natural-data` | DOM 无 image/audio/video action，未注入 URL | 图片预览、音频 play/stop、视频 overlay |
| layout | `pass` | 已访问会话均 412x786、无横向溢出 | responsive light/dark media overlay |
| safety | `pass` | 未 mark-read、未播放/下载/发送、未执行 Gateway/SQLite mutation | none |
| verification | `pass` | H5 3 files/11 tests；Web typecheck；3 route HTTP 200；diff/RN protected checks | SDK/H5 runtime 零改动 |

Closeout verdict: `blocked-natural-data/runtime-clean`。本轮只证明安全候选不含媒体且 unread gate 生效；不把纯测试或历史截图冒充真实播放验收。

## W6.a6.20.116 Verification Pending Natural-Data Audit (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| friend pending | `blocked-natural-data` | 当前 Gateway 返回 3 条真实记录，均为“已添加”；无 incoming pending/“加好友”按钮 | pending 行与确认层 |
| group pending | `blocked-natural-data` | 群聊验证 Tab 返回“暂无群聊验证” | owner/admin non-empty audit 与动作层 |
| layout | `pass` | 两个 Tab 均 412x786、scrollWidth=clientWidth | Safari/Firefox、实体设备 |
| safety | `pass` | 未开资料、未 mark-read、未接受/拒绝、未制造申请、未执行 Gateway/SQLite mutation | mutation 需独立授权 |
| verification | `pass` | H5 2 files/7 tests；Web typecheck；2 route HTTP 200；diff/RN protected checks | SDK/H5 runtime 零改动 |

Closeout verdict: `blocked-natural-data/runtime-clean`。本轮证明 production read path 与 empty/accepted 投影正常，但 pending/确认层没有自然样本，不能标记验收完成。

## W6.a6.20.115 Account Security Mobile Dark Readonly Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| real root | `browser-pass` | `+86 15555555551 / 未绑定 / 账号密码`；page=`15/17/21`、card=`27/29/36` | contact bind/change 仍 blocked-contract |
| natural branch | `browser-pass` | 当前 account 为空，进入首次设置账号/密码/确认密码表单 | 已绑定账号 reset form 自然样本 |
| route correction | `browser-pass` | 直达 `/me/security/password` 自动 replace 到 `/me/security/account` | none |
| form/layout | `pass` | 3 输入为空、submit disabled、form=`27/29/36`；412x786、无横向溢出 | 760x900 dark、Safari/Firefox、实体设备 |
| safety | `pass` | 未输入/提交、未 set/reset、未执行 Gateway/SQLite/session cleanup；恢复 light | approved real set/reset Network/result/session proof |
| verification | `pass` | SDK 1 file/3 tests；H5 1 file/3 tests；Web typecheck；3 route HTTP 200；diff/RN protected checks | SDK/H5 runtime 零改动 |

Closeout verdict: `clean/browser-mobile-dark-readonly-pass; desktop-dark-and-mutation-gated`。只关闭 authenticated mobile dark 与 account-state route guard；不声明凭据 mutation、reset 后会话失效或 contact verification 已验收。

## W6.a6.20.114 Me Profile Editors Mobile Dark Readonly Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| real profile | `browser-pass` | 本人资料保持 `donk / 未知 / 未设置`；总览 page/card=`17/19/24 -> 27/29/36` | changed-value update 未执行 |
| nickname dark | `browser-pass` | draft=`donk`、max=32、input=`36/39/51`；返回按钮回资料页 | slow-saving overlay |
| gender dark | `browser-pass` | “未知”radio checked；card=`27/29/36`；取消回资料页 | changed selection/save |
| bio dark | `browser-pass` | draft empty、max=100、`0/100`；textarea=`27/29/36`；取消回资料页 | changed text/save |
| layout | `pass` | 总览及三 route 均 412/412 | 760x900 dark、Safari/Firefox、实体设备 |
| safety | `pass` | 未改 draft、未点击完成、未调用 profile update/Gateway/SQLite；恢复 light | none |
| verification | `pass` | focused 4 files/17 tests；Web typecheck；3 route HTTP 200；diff/RN protected checks | SDK/H5 runtime 零改动 |

Closeout verdict: `clean/browser-mobile-dark-readonly-pass; desktop-dark-and-mutation-gated`。关闭个人资料编辑的 authenticated mobile dark gate；不声明 desktop dark、真实更新或 pending 像素。

## W6.a6.20.113 Group Management Card Theme Hierarchy (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `pass-static` | RN root=`theme.color.bg.page`、card=`theme.color.bg.card` | RN business 未改 |
| CSS owner | `pass` | H5 surface 从 `--im-bg-app` 收敛为 `--im-bg-page`；card 保持 `--im-bg-card` | none |
| light browser | `pass` | page `247/247/247`、card `255/255/255`、8px；412/412，card 380px | Safari/Firefox、实体设备 |
| dark browser | `pass` | page `17/19/24`、card `27/29/36`、8px；412/412，card 380px | 跟随系统仅由同一 token contract 覆盖 |
| verification | `pass` | focused 3 files/10 tests；Web typecheck；diff check | none |
| protection | `pass` | SDK/RN business 零改动；RN protected diff empty | 未执行 SDK build/sync、RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-light-dark-card-hierarchy-pass`。修复只改变 H5 presentation token 选择，不改变权限、开关、路由或 mutation；验收后已恢复原浅色偏好。

## W6.a6.20.112 Group Admin And Owner Candidate Readonly Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| owner capability | `browser-pass` | `donk的群聊` 管理页自然显示管理员设置与转让群主，两个子路由均未被权限 guard 退回 | natural admin-role 当前账号样本仍缺失 |
| admin list/add | `browser-pass` | 空管理员列表显示 10 人上限；添加页仅有 `donk二大爷`、`donk三大爷`，未选择时添加 disabled | 非空管理员行/移除 sheet 未出现 |
| owner candidates | `browser-pass` | 转让页排除本人并按 D 分组显示同两位候选；关闭精确返回群管理 | 确认层和 mutation 未打开 |
| layout/runtime | `pass` | 四个 route 均 412/412；无 warning/error | Safari/Firefox、实体设备 |
| safety | `pass` | 未选择、未确认、未添加/移除管理员、未转让、不执行 Gateway/SQLite mutation | role mutation 保留授权门 |
| verification | `pass` | focused 3 files/10 tests；真实 DOM/route/viewport/log | 本片无 runtime code |
| protection | `pass` | RN protected diff empty；SDK/H5 runtime 零改动 | 未运行任何 SDK build/sync、RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-owner-role-routes-pass; natural-admin-and-mutation-gated`。关闭 `.20.13/.20.14` 的 owner 正向自然数据门，不把空管理员列表外推为管理员角色样本，也不执行角色写入。

## W6.a6.20.111 Conversation Search Message Target Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| natural result | `browser-pass` | `123` 返回两个真实聊天记录分区；无未读 `donk三大爷` 分区含 1 条结果 | 8 条以上分页自然样本仍缺失 |
| stable target | `browser-pass` | URL 仅携带稳定 client `messageID=61da9d1a-...`；当前账号本地窗口精确恢复正文 `123` 的目标 DOM 行 | 强制本地缺失错误未制造 |
| replace/back | `browser-pass` | chat 返回 `/conversations`，搜索层不恢复 | none |
| visual | `partial` | 目标行在 412px 视口内可见；高亮调用链与测试通过 | 900ms animation 活动帧未被自动化捕获 |
| safety | `pass` | 目标会话无未读；总未读前后均 4；未 markRead/发送/Gateway/SQLite mutation | none |
| verification | `pass` | focused 2 files/10 tests；真实 DOM/route/viewport/log | none |
| protection | `pass` | RN protected diff empty；SDK/H5 runtime 零改动 | 未运行任何 SDK build/sync、RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-message-window-pass; highlight-frame-gated`。关闭 `.78/.96/.105` 的自然消息结果与本地窗口恢复 gate；不把自动化未捕获的短时动画冒充真实高亮像素。

## W6.a6.20.110 Contact Server Search Joined Group Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| server result | `browser-pass` | `donk` 的服务器群聊 Tab 返回两个真实 joined 群，均有 3 人与真实 groupID | available/pending 结果未出现 |
| canonical open | `browser-pass` | `donk的群聊` 经 shared `conversations.openGroup` 进入 canonical conversation `019ff8b7-...` | 强制 cache-miss fallback 未破坏验证 |
| replace/back | `browser-pass` | chat 返回 `/conversations`，搜索层不恢复 | none |
| layout/runtime | `pass` | 搜索、聊天、列表均 412/412；无 warning/error | Safari/Firefox、实体设备 |
| safety | `pass` | 选择无未读群；未申请、未 markRead、未发送、未执行关系/Gateway mutation | available application 保留授权门 |
| verification | `pass` | focused 4 files/14 tests；真实 DOM/route/viewport/log | 本片无 runtime code |
| protection | `pass` | RN protected diff empty；SDK/H5 runtime 零改动 | 未运行任何 SDK build/sync、RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-server-joined-group-pass; available-application-gated`。关闭 `.73/.80/.99` 的服务器非空 joined 群自然数据 gate，不把未出现的 available/pending 行外推为申请链证据。

## W6.a6.20.109 Group Conversation Latest Sender Preview Convergence (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `pass-static` | 冻结 RN helper 对普通群消息添加 `发送者：摘要`，本人显示“我”，系统消息不加成员前缀 | RN caller 本片不改 |
| shared owner | `pass` | SDK `listCachedItems` 复用 `resolveGroupSenderDisplayName` 输出 latest sender；共享 classifier 固定群系统类型 | RN consumer 收敛需单独授权 |
| Web projection | `pass` | 普通/本人/mention 摘要统一添加 sender，并平移预设表情 entity offset；系统类型保持原摘要 | none |
| natural browser | `pass` | 412x786 会话首页：`donk二大爷：1231`；`群聊已创建` 未误显示 `我：`；重启后无 warning/error | Safari/Firefox、实体设备 |
| safety | `pass` | 未打开聊天、未标记已读、未发送、不执行 Gateway/SQLite mutation | none |
| verification | `pass` | SDK Web 98 files/408 tests、`build:web/sync:web`；H5 focused 3 files/32 tests、app typecheck | none |
| protection | `pass` | RN protected source diff empty；未运行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `clean/shared-core-ready/web-consumed/rn-frozen`。修复的是 Web 缺失的 RN 既有摘要规则，并把可共享的名称解析/系统类型边界留在 SDK；不改写或宣称 RN 业务已迁移。

## W6.a6.20.108 Group Member Identity And Role Projection Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| natural member data | `browser-pass` | `donk二大爷的群聊` 成员页显示 `donk`、`donk二大爷`、`donk三大爷`；群主行明确显示“群主”，未回退为 userId | 自然管理员样本仍未出现 |
| shared name owner | `pass` | SDK `resolveIMGroupMemberDisplayName` 唯一执行备注 > 群昵称 > 公开昵称 > `im-xxxx`；成员页和聊天 sender/mention 均消费该 resolver | none |
| chat role wiring | `pass-static` | `ChatMessageBubble -> getChatGroupSenderView` 从同一成员 DTO 投影群主/管理员；普通消息放气泡内，图片/视频放媒体标题行 | 当前目标会话含未读，聊天气泡真实像素未进入 |
| unread safety | `pass` | 短列表入页在真实测量后会调用 shared `conversations.markRead`，因此未打开目标聊天，不把已读 mutation 包装成只读验收 | 需已读 owner/admin 消息自然样本，或明确授权已读写入 |
| layout/runtime | `pass` | 412x786；3 个成员行均宽 412px；document 412/412；无 warning/error | Safari/Firefox、实体设备 |
| verification | `pass` | H5 focused 3 files/13 tests；SDK resolver 1 file/4 tests；真实 DOM/viewport/log | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行任何 SDK build/sync、RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-member-data-pass; unread-chat-role-pixel-gated`。本片证明自然成员数据、共享昵称优先级和聊天角色投影链一致；不把单元测试/静态链冒充未读聊天页像素，也不触发已读写入。

## W6.a6.20.107 Group Member Role Readonly Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| natural role | `browser-pass` | 新群 `donk二大爷的群聊` 显示 3 位成员和“退出群聊”，无“解散群聊”，构成真实普通成员样本 | 管理员自然角色仍未出现 |
| entry projection | `browser-pass` | 群设置不显示群公告、群管理或定时删除；成员级昵称、简介、分享、静音、置顶、清空入口保持 | 公告发布/自动删除保存未执行 |
| route guard | `browser-pass` | 直达 `/settings/manage` 被 replace 回 `/settings`，DOM 不出现管理员设置、转让群主或自动删除 | admin route 正向像素仍 data-gated |
| layout | `pass` | 普通成员设置 scrollWidth=viewportWidth=412 | Safari/Firefox、实体设备 |
| safety | `pass` | 未切换设置、未清空、未退出、未执行角色/Gateway/SQLite mutation | destructive/mutation gate 保留 |
| verification | `pass` | focused 4 files/19 tests；真实 DOM/route/viewport；`.94` H5 typecheck 基线 | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-owner-and-member-role-pass; admin-and-mutation-gated`。关闭 `.69/.70/.102/.103` 的普通成员自然样本分支，不把 member 的隐藏入口外推为管理员正向可见性或 mutation 证据。

## W6.a6.20.106 Conversation And Message Action Menu Readonly Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| conversation menu | `browser-pass` | 真实群会话行右键显示标记未读、置顶、免打扰、归档、删除 5 项 RN 同序菜单；点击遮罩关闭 | physical touch `300ms/8px` 长按 |
| message menu | `browser-pass` | 真实文本 `123` 右键显示引用、复制、编辑、多选、转发、删除及原消息预览；Escape 关闭 | physical touch `500ms/8px` 长按 |
| layout | `pass` | 会话菜单 rect `72..256 x 176..418`；消息 stack `196..396 x 473.8..770`；body/viewport 均 412 | Safari/Firefox、实体设备 |
| safety | `pass` | 未点击任何 menuitem；未执行已读、置顶、静音、归档、删除、复制、编辑、转发或发送 | 所有真实动作继续授权门禁 |
| verification | `pass` | focused 3 files/8 tests；真实 DOM/route/viewport；`.94` H5 typecheck 基线 | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-readonly-menu-pass; actions-and-physical-touch-gated`。关闭用户点名的会话行/消息气泡菜单可见性 gate，不把右键等价入口外推为触屏手势或动作成功证据。

## W6.a6.20.105 Conversation Search Group Result Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| group result | `browser-pass` | 真实历史 `donk` 返回 2 位好友/1 个群；点击 `donk的群聊` 进入规范 conversation `019ff8b7-...` | 消息内容结果未出现 |
| replace/back | `browser-pass` | `/conversations/search -> /conversations/:id -> /conversations`；返回后搜索页不恢复 | messageID 窗口恢复/高亮仍 data-gated |
| layout | `pass` | 搜索、聊天、会话首页均 scrollWidth=clientWidth=412 | 跨浏览器/实体设备仍外部门禁 |
| safety | `pass` | 未发消息、未改搜索历史、未执行 Gateway/SQLite mutation | none |
| verification | `pass` | focused 2 files/18 tests；真实 DOM/route/viewport；`.94` H5 typecheck 基线 | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-friend-and-group-result-pass; message-result-target-gated`。关闭 `.96` 的真实群结果分支，不把未出现的消息内容结果冒充 messageID 证据。

## W6.a6.20.104 Group Application Already-Joined Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| relationship state | `browser-pass` | 真实群 `97524759106` 的 apply route 显示 `donk的群聊`、3 位成员和唯一 CTA“进入群聊” | available/未加入群样本未出现 |
| shared owner | `browser-pass` | 点击后由既有 `conversations.openGroup` 返回规范 conversation `019ff8b7-...` | Gateway fallback 未强制破坏 cache 验证 |
| replace/back | `browser-pass` | 聊天返回 `/conversations`，DOM 无“申请加入群聊”中间层 | 跨浏览器/实体设备仍外部门禁 |
| layout | `pass` | 申请、聊天、会话首页均 scrollWidth=clientWidth=412 | none |
| safety | `pass` | 未提交申请、未改变群关系、未发消息、未执行关系/Gateway mutation | application mutation 保留授权门 |
| verification | `pass` | focused 3 files/11 tests；真实 DOM/route/viewport；`.94` H5 typecheck 基线 | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-already-joined-open-group-pass; available-application-gated`。关闭 `.83` 的真实 already-joined Gateway/cache/navigation 门禁，不外推未加入群申请链。

## W6.a6.20.103 Group Announcement Owner Readonly Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| owner entry | `browser-pass` | 真实群主群设置显示“查看群公告”；点击进入 announcement route；`.107` 真实 member 群正确隐藏入口 | admin 自然角色未切换 |
| edit projection | `browser-pass` | 公告页显示 textbox“编辑群公告”、取消和完成；入口/编辑权限来自现有 role/permission owner | 发布 mutation 未执行 |
| cancel/back | `browser-pass` | 取消精确返回群设置；编辑器消失，URL 与 412/412 布局正常 | 跨浏览器/实体设备仍外部门禁 |
| safety | `pass` | 未输入、未完成、未发布、未标记已读、未执行角色/Gateway/SQLite mutation | destructive gate 保留 |
| verification | `pass` | focused 1 file/9 tests；真实 DOM/route/viewport；`.94` H5 typecheck 基线 | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-announcement-owner-and-member-pass; admin-and-mutation-gated`。关闭 `.69` 的 owner/member 自然角色像素，不外推 admin 或公告发布/已读链。

## W6.a6.20.102 Auto Delete Entry Hierarchy Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| single chat | `browser-pass` | 单聊设置直接显示“定时删除 / 停用定时删除” | 策略页与保存 mutation 未执行 |
| group hierarchy | `browser-pass` | owner 群设置首页无自动删除、管理页显示“定时删除消息”；`.107` member 群设置隐藏入口且直达管理 route 被退回 | 管理员自然角色样本未切换 |
| owner/member role | `browser-pass` | owner 群有解散/管理员/转让；member 群只有退出且无管理入口 | admin 角色仍 data-gated |
| layout | `pass` | 单聊设置、群设置、群管理均 scrollWidth=clientWidth=412 | 跨浏览器/实体设备仍外部门禁 |
| safety | `pass` | 未打开策略页、未切换设置、未执行 Gateway/SQLite mutation | setting mutation 保留授权门 |
| verification | `pass` | focused 2 files/13 tests；真实 DOM/route/viewport；`.94` H5 typecheck 基线 | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-single-owner-and-member-entry-pass; admin-role-gated`。关闭 `.70` 的单聊/群主/普通成员自然样本，不外推管理员权限像素。

## W6.a6.20.101 Chat Card Picker Readonly Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| entry | `browser-pass` | 单聊“打开功能面板 -> 名片”打开统一 dialog“选择分享对象” | type108 真实发送未执行 |
| single mode | `browser-pass` | 初始 `已选中(0)`、分享 disabled、无 ALL；好友排除本人和当前对端，只显示 `donk三大爷` | 选择后的 payload/send 保留 mutation gate |
| tabs/close | `browser-pass` | 群聊 Tab 显示 `donk的群聊`；关闭后留在原 conversation，dialog 消失 | 跨浏览器/实体设备仍外部门禁 |
| layout | `pass` | 打开/关闭弹窗均 scrollWidth=clientWidth=412 | none |
| safety | `pass` | 未选择目标、未点分享、未发送 type108、未执行 Gateway/SQLite mutation | send gate 保留 |
| verification | `pass` | focused 3 files/7 tests；真实 DOM/route/viewport；`.94` H5 typecheck 基线 | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-card-picker-readonly-pass; type108-send-gated`。关闭 `.84` 的弹窗/Tab/排除/禁用/关闭像素，不把未执行的选择和发送冒充成功。

## W6.a6.20.100 Group Search Joined Overlay Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| overlay entry | `browser-pass` | `/groups/create` 点击“查找群聊”进入 `/groups/search`，输入 `donk` 命中真实 joined 群 | available/未加入群样本未出现 |
| canonical route | `browser-pass` | `donk的群聊` 经既有 owner 进入规范会话 `019ff8b7-...` | 群申请 mutation 未执行 |
| replace/back | `browser-pass` | 聊天“返回会话”落到 `/conversations`；DOM 无查群/建群中间层 | 跨浏览器/实体设备仍外部门禁 |
| layout | `pass` | 查群、聊天、会话首页均 scrollWidth=clientWidth=412 | none |
| safety | `pass` | 未选择好友、未创建群、未发消息、未进设置、未执行群申请/Gateway mutation | destructive gate 保留 |
| verification | `pass` | focused 4 files/17 tests；真实 route/DOM/viewport；`.94` H5 typecheck 基线 | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-joined-group-overlay-pass; available-and-application-gated`。关闭 `.82` 的 joined 群 click/back 自然样本，不外推 available 群或申请成功返回。

## W6.a6.20.99 Contact Search Server Readonly Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| server friends | `browser-pass` | 输入 `62` 后显式服务器搜索；真实好友结果使用 `im-` + userID 后四位缺省昵称 | 关系 mutation 未执行 |
| profile return | `browser-pass` | `im-9162 -> /contacts/users/48622839162 -> 返回`；关键词 `62`、server mode 与好友 Tab 恢复 | 服务器群结果自然样本未出现 |
| tabs | `browser-pass` | 好友 -> 群聊空态 -> 好友可逆切换，结果不丢失 | 慢网竞态仍需 throttling/设备环境 |
| layout | `pass` | 搜索与资料均 scrollWidth=clientWidth=412 | 跨浏览器/实体设备仍外部门禁 |
| safety | `pass` | 只执行只读 Gateway 查询和资料导航；未进申请页、未执行好友/群申请、发送或 RTC mutation | destructive/relationship gate 保留 |
| verification | `pass` | focused 5 files/23 tests；真实 route/DOM/viewport；`.94` H5 typecheck 基线 | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-server-friend-return-and-tabs-pass; slow-network-and-group-result-gated`。只关闭正常网络只读链，不把群聊空结果或普通切换冒充慢网并发证据。

## W6.a6.20.98 Contact Search Local Joined Group Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| local group | `browser-pass` | `donk` 本地结果包含 `donk的群聊`，群 ID `97524759106` | conversation-only fallback 样本未单独识别 |
| canonical route | `browser-pass` | 点击后进入 `/conversations/019ff8b7-b24f-7e71-afe1-332d40294c00`；Header 群名/群聊、消息区与输入区正常 | 服务器 joined 群样本未出现 |
| layout | `pass` | 聊天页 scrollWidth=clientWidth=412 | 跨浏览器/实体设备仍外部门禁 |
| safety | `pass` | 只打开已有群会话；未发消息、未进群设置、未执行群关系/Gateway mutation | send/group mutation 保留授权门 |
| verification | `pass` | focused 5 files/23 tests；真实 route/DOM/viewport；`.94` H5 typecheck 基线 | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-local-joined-group-pass; conversation-fallback-and-server-joined-gated`。关闭 `.71/.80` 本地 joined 群自然样本，不外推 conversation-only fallback 或服务器 joined 分支。

## W6.a6.20.97 Contact Search Source Return Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| conversations source | `browser-pass` | `/conversations -> contacts/search -> cancel -> /conversations` | none |
| contacts source | `browser-pass` | `/contacts -> contacts/search -> cancel -> /contacts` | none |
| archived source | `browser-pass` | `/conversations/archived -> contacts/search -> cancel -> archived`，空态 412/412 | 归档真实行不影响 route owner |
| safety | `pass` | 未输入关键词、未发起 server search、未进入资料/申请、未执行关系 mutation | child mutation 继续授权门 |
| verification | `pass` | focused 3 files/7 tests；`.94` H5 typecheck；真实 route/viewport | 本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-three-source-pass; child-mutation-gated`。三类主 scene 的覆盖层来源/取消返回均关闭，不外推好友申请或群申请成功返回。

## W6.a6.20.96 Conversation Home Search Route Replacement Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| ordinary result | `browser-pass` | `.96` 打开好友 `donk二大爷`；`.105` 打开群 `donk的群聊`，两者均进入规范会话 | none |
| replace/back | `browser-pass` | `/conversations/search -> /conversations/:id -> /conversations`；返回列表后无 search input | 消息 `messageID` 定位需自然结果样本 |
| layout | `pass` | 搜索、聊天、列表均 scrollWidth=clientWidth=412 | 跨浏览器/设备仍外部门禁 |
| safety | `pass` | 未发消息、未改搜索历史、未执行 Gateway/SQLite mutation | none |
| verification | `pass` | focused 1 file/7 tests；`.94` H5 typecheck；真实 route/DOM | 本片无 runtime code，不重复 full verify |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-friend-and-group-result-pass; message-result-target-gated`。关闭好友/群聊普通结果的 search-layer replacement，不把未出现的消息结果冒充定位证据。

## W6.a6.20.95 Contact Profile Clipboard And Nested Return Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| contact clipboard | `browser-pass` | 当前真实好友 ID 点击后显示“复制ID成功”并约 1.2s 消失；URL/资料事实不变 | Clipboard failure browser path 未主动破坏环境 |
| nested route | `browser-pass` | search -> profile -> groups -> profile -> search；查询 `donk` 与本地结果恢复 | 当前共同群 count=1 但列表为空，群行/openGroup 仍 data-gated |
| layout | `pass` | 全链 scrollWidth=clientWidth=412 | 跨浏览器/设备仍外部门禁 |
| safety | `pass` | 未读 Clipboard 内容，未操作通话/关系/消息/备注/分享或群会话 | relationship/RTC/send/openGroup 保持授权门 |
| verification | `pass` | focused 4 files/12 tests；`.94` H5 typecheck；真实 DOM/route evidence | 本片无 runtime code，不重复 full verify |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-readonly-pass; relationship-action-and-group-row-gated`。`.75/.85` 的可无副作用自然联系人样本 gate 已关闭，不把空共同群列表冒充群会话证据。

## W6.a6.20.94 Me Profile Readonly Browser Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| clipboard | `browser-pass` | 真实点击“复制ID”后出现“已复制ID”，约 1.2s 后消失；URL/资料事实不变 | 联系人资料复制已由 `.95` 自然样本关闭 |
| navbar | `browser-pass` | 昵称为返回/完成；性别、签名为取消/完成；Navbar 412x56，ID 行 border 0/outline none | pending spinner 仍需真实慢 mutation |
| return stack | `browser-pass` | 三个资料总览入口均进入对应 SPA route，并通过返回/取消精确回 `/me/profile` | 保存成功返回未执行 |
| layout | `pass` | 三编辑页与资料总览均 scrollWidth=clientWidth=412 | 跨浏览器/实体设备仍外部门禁 |
| safety | `pass` | 未读取剪贴板、未改字段、未点击完成、未执行 profile Gateway/SQLite mutation | mutation/pending 保留授权门 |
| verification | `pass` | focused 5 files/19 tests；H5 Web typecheck；浏览器真实 DOM/geometry | 完整 verify 复用 `.92`，本片无 runtime code |
| protection | `pass` | RN protected source、SDK/H5 runtime 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-readonly-pass; profile-mutation-and-pending-gated`。`.85/.86/.88` 的可无副作用本人资料 browser gate 已关闭，不把复制内容读取或资料保存包装成只读证据。

## W6.a6.20.93 Contact Search Keyboard Browser Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| authenticated browser | `pass` | 复用当前真实登录标签；412x786 `/contacts/search` 输入 `donk` 后按 Enter | 无第二标签/SQLite writer |
| keyboard completion | `browser-pass` | active element 回到 `BODY`；URL 不变；输入词与 2 位本地联系人、1 个本地群结果保留 | 移动软键盘/IME/实体设备仍 device-gated |
| remote-search safety | `pass` | 无 server tabs、loading、server section；显式“去服务器搜索”仍在，本地测试证明 Enter 不调用 `runServerSearch` | 未点击远端搜索、未发起关系 mutation |
| layout/runtime | `pass` | scrollWidth=clientWidth=412；页面无横向溢出 | 跨浏览器矩阵仍为外部门禁 |
| protection | `pass` | 本片只回写 H5 SSOT；RN/SDK/H5 runtime 业务零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/browser-enter-pass; soft-keyboard-ime-device-gated`。本片关闭 `.90` 的可自动化登录态浏览器证据，不把 Playwright Enter 冒充移动软键盘或 IME composition。

## W6.a6.20.92 Custom Emoji Light Responsive Acceptance (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| light empty state | `browser-pass` | 当前真实账号聊天第三 tab 与管理页都显示“暂无自定义表情”，draft 为空，未触发表情 click/file picker/send | populated light sample 仍自然数据门禁 |
| mobile viewport | `browser-pass` | 412x786：surface 412px，五列约 77.6px，scrollWidth=clientWidth=412 | physical touch 仍设备门禁 |
| desktop viewport | `fixed/browser-pass` | 初始 1280px 下 surface/单元为 1280/约251px；修复后居中 480px，五列/add cell 约90.8px，零 overflow | Safari/Firefox 仍归 W5 browser matrix |
| ownership | `presentation-only/pass` | 只为既有 manager surface 补 480px Web 容器边界；gridRef 继续读取真实容器几何 | 无第二 grid/size/drag owner |
| business safety | `pass` | SDK facade、SQLite、Gateway、upload/create/delete/reorder/type115 send 均未改未执行 | 真实 mutation/send 保持授权门 |
| verification | `pass` | focused 2 files/7 tests、H5 Web typecheck；`npm run verify` 覆盖 466 assets、H5/SDK Web typecheck、boundary、SDK Web 98/407、1184 modules | 既有 >500kB chunk warning；无 convergence script |
| protection | `pass` | RN protected source 零改动；仅运行允许的 `build:web/sync:web` | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/light-empty-responsive-pass; populated-and-mutation-gates-retained`。P0/P1 为零；不可靠的 CSS raw 测试未保留，真实 DOM 几何/截图与完整 build 承担样式证据。

## W6.a6.20.91 Residual Inventory SSOT Reconciliation (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| route/capability inventory | `reconciled/pass` | RN screen 与 H5 route/page 交叉复核；chat search 设置入口已由 `.18.2.3` 落地，不再标记 planned | none |
| auth/settings inventory | `reconciled/pass` | invite、complete-profile、version 已有真实 route/runtime；network 是浏览器平台排除 | 真实 onboarding/version mutation 仍按既有授权门验收 |
| cache safety | `web-not-applicable/pass` | RN 只删 `RNFS.CachesDirectoryPath`；H5 无产品自有临时媒体 cache owner，当前 account IndexedDB/sql.js 属 IM 权威本地状态 | 若未来引入 Service Worker/CacheStorage，需先建立独立临时缓存 owner |
| global mute | `blocked-capability/retained` | OpenIM `globalRecvMsgOpt` 与 Gateway `notification` 仍为不同事实 | 需独立 shared Web read/update/event 合同后才能实施 |
| local implementation inventory | `closed` | 未发现可在不复制 owner、不改 RN business、不伪造平台能力前提下继续实施的确定性 route/presentation 缺口 | 转入 W3/W4/W5/W6 external/authorization acceptance gates |
| verification | `pass` | `npm run verify`：466 assets、H5/SDK Web typecheck、runtime boundary、SDK Web 98 files/407 tests、1184-module production build | 仅保留既有 >500kB chunk warning |
| protection | `pass` | 本片只回写 H5 SSOT；H5 runtime、SDK source/generated、RN protected source 均零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/ssot-reconciled/local-implementation-inventory-closed; external-acceptance-gates-active`。本片删除的是台账漂移，不是产品能力；没有新增 mock、fake success、SQLite 删除、错误通知映射或第二业务 owner。

## W6.a6.20.90 Contact Search Keyboard Completion (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | search return key 只收起键盘；不隐式进入服务器模式或发起用户/群搜索 | RN source/caller 保持冻结 |
| ownership | `keyboard-presentation-converged/pass` | `shouldDismissContactSearchKeyboard` 唯一判定 Enter/IME/repeat；页面只执行 `preventDefault + blur` | none |
| business safety | `pass` | `runServerSearch` 仍只有显式“去服务器搜索”和 Tab 入口；关键词、本地结果、请求代次、Gateway/SQLite/Router 均不变 | none |
| structure | `pass` | 纯状态 UI 拆至 31 行 `ContactSearchStates`；`ContactSearchPage` 411 -> 384 行 | none |
| verification | `pass` | fail-first 1；focused 2/14；H5 full 135/425、SDK Web 98/407、466 assets、typecheck、1184-module build、route HTTP 200 | 既有 >500kB chunk warning |
| runtime | `browser-enter-pass/device-gated` | `.93` 复用真实登录标签证明 Enter 后 blur，URL/查询词/本地结果保持且不进入 server mode | 真实移动软键盘、IME composition 与实体设备仍待补 |
| protection | `pass` | RN protected diff=0；本片 SDK source/generated 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/keyboard-presentation-converged; browser-enter-pass/soft-keyboard-ime-device-gated`。无 mock、fake success、第二查询/键盘 owner、页面 Gateway/SQLite 或 RN 业务改动。

## W6.a6.20.89 Me Profile Editor Saving Gate (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | nickname pending 显示整页 overlay；gender/bio 右侧显示 spinner；三者左侧退出 pending 时禁用 | RN source/caller 保持冻结 |
| ownership | `saving-presentation-converged/pass` | 仅消费既有 `saving`；Header 的 pending/disabled 与页面 overlay 不拥有 mutation 或 route 状态 | none |
| business safety | `pass` | `saveProfile`、字段校验、重复提交、Gateway 成功/失败和 `.86` 返回栈均未改变；未新增 History 拦截 | none |
| verification | `pass` | fail-first 2；focused 1/8；H5 full 135/423、SDK Web 98/407、466 assets、typecheck、1183-module build；三 route HTTP 200 | 既有 >500kB chunk warning |
| runtime | `route-pass/browser-pending-visual-gated` | 三编辑 route 均 HTML 200；spinner 有 reduced-motion fallback；dev server 继续运行于 5176 | 当前已登录标签未暴露，真实慢 update pending 像素待补 |
| protection | `pass` | RN `src/App/android/ios` diff=0 且 generated package clean；本片 SDK source 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/saving-presentation-converged; browser-pending-visual-gated`。无 mock、fake success、第二 saving/save/route owner、SDK/RN 业务改动或不可关闭的历史拦截。

## W6.a6.20.88 Me Profile Editor Navbar Semantics (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 昵称保留返回箭头；性别和个性签名改用“取消”；左退出正文色、右完成品牌色 | RN source/caller 保持冻结 |
| ownership | `navbar-presentation-converged/pass` | `MeProfileHeader.backLabel` 只投影图标/文本，独立 back/save class 阻止颜色再次耦合 | none |
| business safety | `pass` | 两类左动作仍调用 `returnFromEditor`，右动作仍调用 `saveProfile`；请求、字段校验、Gateway/SQLite 未变 | none |
| verification | `pass` | fail-first 2 expected failures；focused final 1 file/6 tests；H5 full 135/421、SDK Web 98/407、466 assets、typecheck、1183-module production build；三 route HTTP 200 | 既有 >500kB chunk warning |
| runtime | `browser-readonly-pass/pending-gated` | `.94` 证明 nickname 返回/完成、gender/bio 取消/完成与 412px Navbar/退出行为 | pending spinner 仍需真实慢请求 |
| protection | `pass` | RN `src/App/android/ios` diff=0；本片 SDK source 零改动，只执行允许的 Web build/sync | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/navbar-presentation-converged; browser-readonly-pass/pending-gated`。无 mock shortcut、fake success、第二保存/退出 owner、SDK/RN 业务改动或默认按钮边框回归。

## W6.a6.20.87 Me Profile Nickname Keyboard Completion (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 昵称 input 提示 Done；非组合、非重复 Enter 与顶栏“完成”共同进入 `saveProfile` | RN source/caller 保持冻结 |
| ownership | `input-owner-converged/pass` | `shouldSubmitProfileNicknameKey` 是唯一键盘规则；页面只有一个命名适配 callback，资料保存仍只有 `saveProfile` | none |
| business safety | `pass` | 空值、pending、未变更、真实 update、失败留页和 `.86` 返回栈全部复用原链；IME/重复键 fail-closed，bio Enter 不受影响 | none |
| verification | `pass` | fail-first 3 expected failures；focused final 3 files/10 tests；H5 full 135/419、466 assets、typecheck、1183-module production build；两 route HTTP 200 | 既有 >500kB chunk warning |
| runtime | `route-pass/browser-keyboard-gated` | `/me/profile`、`/me/profile/nickname` 均 HTTP 200；dev server 继续运行 | Browser 控制未暴露当前已登录标签，真实移动软键盘 Done/IME/物理 Enter 待单标签补证 |
| protection | `pass` | RN `src/App/android/ios` diff=0；本片 SDK source 零改动，只执行允许的 Web build/sync | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/input-owner-converged; browser-keyboard-gated`。无 mock shortcut、fake success、第二保存 owner、form 默认提交或 RN 业务改动。

## W6.a6.20.86 Me Profile Editor Return Stack (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 资料总览的昵称/性别/签名编辑入口均恢复原总览 entry；首页昵称快捷入口和深链安全回总览 | RN source/caller 保持冻结 |
| ownership | `route-stack-owner-converged/pass` | 26 行 `me-profile-editor-route` 唯一解析 state/投影退出动作；返回、未变更与保存成功共用同一 callback | none |
| business safety | `pass` | profile read/update、字段校验、Gateway、SQLite 与失败留页均未改变；未知 state fail-closed，页面不访问 History API | none |
| verification | `pass` | fail-first 4 expected failures；focused final 4 files/10 tests；H5 full 135/416、466 assets、typecheck、1183-module production build；四 route HTTP 200 | 既有 >500kB chunk warning |
| runtime | `browser-readonly-pass/profile-mutation-gated` | `.94` 证明三个资料入口经返回/取消精确回 `/me/profile` | 保存成功返回仍需真实 mutation 授权 |
| protection | `pass` | RN `src/App/android/ios` diff=0；本片 SDK source 零改动，只执行允许的 Web build/sync | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-stack-owner-converged; browser-readonly-pass/profile-mutation-gated`。无 mock shortcut、fake success、第二退出 owner、直接 History API 或 RN 业务改动。

## W6.a6.20.85 User ID Clipboard Platform Adapter Convergence (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 个人中心首页、个人资料与联系人资料均只复制稳定 userID；联系人资料新增 success-only “复制ID成功”反馈 | RN source/caller 保持冻结 |
| ownership | `presentation-platform-owner-converged/pass` | `components/clipboard/user-id-clipboard` 唯一持有 trim、空值拒绝、browser capability 和 Clipboard API；旧 me-domain helper/test 已删除 | none |
| business safety | `pass` | profile/contact identity、DTO、Gateway、SQLite、认证和 Router 均不变；写入失败传播到页面，失败不显示成功 | none |
| verification | `pass` | fail-first 2 expected failures；focused final 4 files/17 tests；H5 full 133/411、466 assets、typecheck、1182-module production build；旧 owner/页面直接调用零残留 | 既有 >500kB chunk warning |
| runtime | `browser-profile-pass` | `.94` 本人“已复制ID”与 `.95` 联系人“复制ID成功”均由真实用户手势/Clipboard resolve 触发并自动消失 | Clipboard failure browser path 不主动破坏环境 |
| protection | `pass` | RN `src/App/android/ios` diff=0；本片 SDK source/generated 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/presentation-platform-owner-converged; browser-profile-pass`。无 mock shortcut、fake success、第二 Clipboard owner、页面平台判断或 RN 业务改动。

## W6.a6.20.84 Chat Card Target Picker Convergence (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 聊天名片继续好友/群聊单选、排除本人/当前单聊对端、显式分享后发送 | RN source/caller 保持冻结 |
| ownership | `presentation-owner-converged/pass` | 转发和名片分别消费 `ChatTargetPickerModal` 的 `multiple|single`；重复 `ChatCardPickerDialog` 及专用 CSS 已删除 | none |
| business safety | `pass` | 中性 target 仅映射为 `IMMessageCard`；发送仍唯一委托 `messages.sendCard`，失败留弹窗、成功才关闭 | 真实 type108 发送未执行 |
| verification | `pass` | fail-first 1 expected failure；focused 3 files/8 tests；H5 full 132/409、466 assets、typecheck、1182-module production build；old source/dist 零残留 | 既有 >500kB chunk warning；仓库无 `scripts/check-convergence.sh` |
| runtime | `browser-card-picker-readonly-pass/type108-send-gated` | `.101` 真实单聊打开名片统一单选弹窗，好友/群聊 Tab、排除规则、disabled 分享与关闭均通过，412/412 | 真实选择与 type108 发送仍需 mutation 授权 |
| protection | `pass` | RN `src/App/android/ios` diff=0；本片 SDK source/generated 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-card-picker-readonly-pass/type108-send-gated`。无 mock shortcut、fake success、第二目标读取链、第二发送 owner 或 RN 业务改动。

## W6.a6.20.83 Group Application Joined Conversation Owner (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | RN 已加入群入口委托 `fetchGroupConversation`；H5 群申请 already-joined 分支改为委托等价 shared `conversations.openGroup` | RN source/caller 保持冻结 |
| ownership | `shared-owner-consumed/pass` | SDK 唯一持有 cache-first、Gateway 群/会话 identity 校验和 success-only cache；H5 只传 groupID 并消费规范 conversationID | none |
| safety | `pass` | 页面 `groups.listCached/sync/find` 已删除；失败留页可见；search replace / QR push 不变；无关系、申请或路由算法变更 | none |
| verification | `pass` | fail-first 1 expected failure；focused 3 files/10 tests；H5 full 132/409、466 assets、typecheck、1184-module production build | 既有 >500kB chunk warning；仓库无 `scripts/check-convergence.sh` |
| runtime | `browser-already-joined-open-group-pass/available-application-gated` | `.104` 真实已加入群 apply route 显示“进入群聊”，经 shared openGroup 进入规范会话并返回列表，412/412 | available 群与申请提交仍需自然样本/授权 |
| protection | `pass` | RN `src/App/android/ios` diff=0；本片 SDK source/generated 零改动 | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/shared-owner-consumed; browser-already-joined-open-group-pass/available-application-gated`。无 mock shortcut、fake success、群列表会话推断、第二 cache owner 或 RN 业务改动。

## W6.a6.20.82 Group Search Overlay Route Stack (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 建群与查群双向、search apply 进入/返回及 joined 群进聊天均 replace 同一覆盖层；返回聊天只到进入流程前主页面 | RN source/caller 保持冻结 |
| ownership | `route-stack-owner-converged/pass` | 12 行 `conversation-route` 唯一校验/编码 conversation ID；联系人搜索、群搜索、群申请三入口共同消费并显式决定 replace；联系人私有 helper 已删除 | none |
| safety | `pass` | 空 ID fail-closed；搜索 selection/keyword/Tab state 保留；扫码申请继续 push；无 History API、Gateway、SQLite、关系或 mutation 变化 | none |
| verification | `pass` | fail-first 3 missing-owner suites + 1 incomplete-wiring assertion；focused final 4 files/13 tests；H5 132/409、SDK Web 98/407、466 assets、typecheck、runtime boundary、`build:web/sync:web`、1184-module production build | 既有 >500kB chunk warning |
| runtime | `browser-joined-group-overlay-pass/available-and-application-gated` | `.100` 真实 `/groups/create -> /groups/search -> joined group -> conversation -> conversations`，412/412 且中间层不恢复 | available 群、申请页与成功返回仍需自然样本/授权 |
| protection | `pass` | RN `src/App/android/ios` diff=0；本片 SDK source 零改动；只执行允许的 Web build/sync | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-stack-owner-converged; browser-joined-group-overlay-pass/available-and-application-gated`。无 mock shortcut、fake success、第二 URL builder、搜索关系算法或 RN 业务改动。

## W6.a6.20.81 Contact Search Server Request Concurrency (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 好友/群聊 Tab 不再因上一请求 pending 丢弃点击；输入变化立即回本地并使旧请求失效；只有最后请求可写结果、错误和 loading | RN source/caller 保持冻结 |
| ownership | `interaction-owner-converged/pass` | 7 行 `isCurrentInteractionRequest` 同时服务联系人搜索和会话搜索；页面各自只持 request ID 与 facade 编排，两份同义 helper 已删除 | none |
| safety | `pass` | 旧成功/失败均不覆盖新 Tab/关键词或提前结束新 loading；失败保留旧成功快照；无页面取消、Gateway/SQLite/关系算法 | none |
| verification | `pass` | fail-first 2 expected failures；focused final 4 files/20 tests；H5 131/405、SDK Web 98/407、466 assets、typecheck、runtime boundary、`build:web/sync:web`、1183-module production build | 既有 >500kB chunk warning；`verify` 不含 H5 tests，已单独运行完整 H5 Vitest |
| browser | `normal-tabs-pass/slow-network-gated` | `.99` 真实服务器搜索完成好友 -> 群聊空态 -> 好友可逆切换，结果不丢失、412/412 | 真实慢网连续切换与迟到请求竞态仍待 throttling 环境 |
| protection | `pass` | RN `src/App/android/ios` diff=0；本片无 SDK source；只运行允许的 Web build/sync | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/interaction-owner-converged; browser-normal-tabs-pass/slow-network-gated`。无 mock shortcut、fake success、孤立 helper、第二搜索 owner 或 RN 业务改动。

## W6.a6.20.80 Contact Search Joined Group Conversation Route (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 本地群和服务器已加入群在 SDK 返回规范会话后均 replace 进入聊天；搜索 route 被关闭，`/conversations/:id` 自然映射 chats；Header 返回会话列表 | RN source/caller 保持冻结 |
| ownership | `route-stack-owner-converged/pass` | SDK `openGroup` 唯一持有身份/cache；来源白名单仍归 8 行 `contact-search-route`，conversation URL/history 已由后续 `.82` 收敛到全局 `conversation-route`；未新增 Tab store | none |
| safety | `pass` | conversation ID trim、空值 fail-closed、URI 编码；只在 SDK resolve 后导航；available/pending 分支不变 | none |
| verification | `pass` | fail-first 2 expected failures；focused 4 files/19 tests；H5 129/402、SDK Web 98/407、466 assets、typecheck、runtime boundary、`build:web/sync:web`、1182-module production build | 既有 >500kB chunk warning |
| browser | `local-group-pass/server-joined-gated` | `.98` 真实本地 joined 群经 shared `openGroup` 进入规范会话，412/412 且未发送消息 | 服务器搜索 joined 群分支仍需自然样本 |
| protection | `pass` | RN `src/App/android/ios` diff=0；本片无 SDK source；只运行允许的 Web build/sync | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-stack-owner-converged; browser-local-group-pass/server-joined-gated`。无 mock shortcut、fake success、孤立 SDK infra 或第二搜索/群会话 owner。

## W6.a6.20.79 Contact Search Source Return Context (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 会话、通讯录、归档会话的全局添加菜单进入搜索时记录来源；取消以 replace 恢复来源；资料/好友申请/共同群/群申请链继续携带该来源 | 群结果打开会话后的 Tab 切换语义留作独立切片 |
| ownership | `route-context-owner-converged/pass` | 8 行 `contact-search-route` 唯一清洗来源；菜单只写当前 pathname，搜索/资料/群申请 helper 只传递白名单 state | none |
| safety | `pass` | 只允许三个内部 scene；缺省、非法、外部和 `/contacts/search` 均回退 `/contacts`；不透传 DTO/token 或任意 history state | none |
| verification | `pass` | fail-first 5 expected failures；focused final 6 files/24 tests；H5 128/399、SDK Web 98/407、466 assets、typecheck、runtime boundary、`build:web/sync:web`、1182-module production build | 既有 >500kB chunk warning |
| browser | `three-source-pass/child-mutation-gated` | `.97` 从消息/通讯录/归档更多菜单进入同一搜索，并分别取消回原 scene | 好友/群申请成功返回仍 mutation-gated |
| protection | `pass` | RN `src/App/android/ios` working-tree diff=0；本片无 SDK source；只运行允许的 Web build/sync | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-context-owner-converged; browser-three-source-pass/child-mutation-gated`。本片只恢复联系人搜索覆盖层来源，不改变搜索、资料、好友/群关系或任何 mutation。

## W6.a6.20.78 Conversation Home Search Result Route Replacement (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 好友、群聊和聊天记录结果均替换搜索 route 后进入聊天；退出聊天不会因历史项恢复搜索页；消息结果继续携带稳定 `messageID` | RN source/caller 保持冻结 |
| ownership | `route-stack-owner-converged/pass` | `buildConversationHomeSearchRoute` 唯一编码 href/replace；页面只调用 React Router；搜索聚合与 `ChatPage` 定位 owner 不变 | none |
| safety | `pass` | conversation/message ID 均 URI 编码；不读写 History API、DTO、Gateway、SQLite 或 runtime state | none |
| verification | `pass` | fail-first 2 expected missing-owner failures；focused 1 file/7 tests；H5 127/397、SDK Web 98/407、466 assets、typecheck、runtime boundary、`build:web/sync:web`、1181-module production build | 既有 >500kB chunk warning |
| browser | `ordinary-result-pass/message-result-gated` | `.96` 真实 `donk` 好友结果进入聊天并返回 `/conversations`，搜索层不重开、412/412 | `messageID` 结果/窗口恢复/高亮仍需自然样本 |
| protection | `pass` | RN protected source/generated package 零改动；本片无 SDK source/contract 变化；只运行允许的 `build:web/sync:web` | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-stack-owner-converged; browser-ordinary-result-pass/message-result-gated`。本片只修正 React Router 历史栈，不新增搜索、消息定位、SDK、缓存或业务分支。

## W6.a6.20.77 Group Join Application Message And Success Return (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 缺省验证语按本人昵称生成，无昵称稳定回退，最大 50 字；真实申请成功后 replace 返回扫码/群搜索/联系人搜索并恢复 context | RN source/caller 保持冻结 |
| ownership | `shared-core-ready/web-consumed/rn-frozen` | SDK `group-application-message` 持有文案/上限，`groupApplications.apply` 强制 trim/fallback/body；好友和群申请页共用 H5 草稿保护 helper | RN 等价 helper/caller 待独立授权切换 |
| failure safety | `pass` | profile 增强失败不阻断；用户编辑不被迟到资料覆盖；超长在 Gateway 前失败；pending 不重复提交；成功前不导航 | 真实 mutation 未执行 |
| verification | `pass` | fail-first 2 expected missing-owner failures；focused SDK 2 files/12、H5 3/9；`npm run verify` 覆盖 H5 127/395、SDK Web 98/407、466 assets、全 runtime/应用 typecheck、boundary、build:web/sync:web 和 1181-module production build | 既有 >500kB chunk warning |
| browser | `mutation-gated` | dev route 可达；不执行真实入群申请，避免改变群关系和产生审核事件 | 双账号申请/审核/加入后 list-back 待授权 |
| protection | `pass` | RN protected source/generated package 未修改；SDK `/rn`、`/desktop` 仅暴露 shared helper 并通过类型检查；只执行 `build:web/sync:web` | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/shared-core-ready/web-consumed/rn-frozen; mutation-acceptance-gated`。本片收敛群验证语、长度、Gateway body 与成功返回，不新增群关系、审核、SQLite 或 realtime owner。

## W6.a6.20.76 Friend Application Message And Success Return (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 缺省验证语按本人昵称生成；无昵称稳定回退；真实申请成功后 replace 回资料页并保留来源 context | RN source/caller 保持冻结 |
| ownership | `shared-core-ready/web-consumed/rn-frozen` | SDK `friend-application-message` 唯一持有文案规则，`peerProfile.applyFriend` 复用 fallback；H5 只读取 profile、保护用户草稿和导航 | RN 既有同行为 helper 待独立授权切换 |
| failure safety | `pass` | 本人资料增强失败不阻断申请；用户已编辑内容不被迟到资料覆盖；Gateway rejection 留页显示错误，成功前不导航 | 真实 mutation 未执行 |
| verification | `pass` | fail-first 2 expected missing-owner failures；focused SDK/H5 4 files/14 tests；H5 126/392、SDK Web 98/406、typecheck/boundary、466 assets、1179-module build、dist/RN protection | 既有 >500kB chunk warning |
| browser | `mutation-gated` | dev server route 可达；未执行真实好友申请，避免改变账号关系与向其他账号发送申请 | 双账号申请内容、接收端和 list-back 待授权 |
| protection | `pass` | RN business/generated package 零本片改动；仅执行 `build:web/sync:web` | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/shared-core-ready/web-consumed/rn-frozen; mutation-acceptance-gated`。本片收敛验证语 owner 与成功导航，不新增 pending 关系假状态、Gateway/SQLite 路径或 Web 专属业务分支。

## W6.a6.20.75 Contact Profile Common Groups Route Context (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 资料进入共同群聊、返回资料、再返回来源的 React Router 链保留 `.74` 已验证的搜索/扫码/群成员/验证列表 context | RN source/caller 保持冻结 |
| ownership | `route-context-owner-converged/pass` | 资料页只传既有 `profileRouteState`，共同群页公共 Header 自动回传；共同群/会话 SDK owner 不变 | none |
| safety | `pass` | 仅延续既有 allowlist state，不读取 History API，不透传 DTO/token/群数据 | none |
| verification | `pass` | fail-first 1 expected failure；focused 2 files/6、H5 125/389、SDK Web 98/406、`npm run verify`、466 assets、typecheck/boundary、1176-module build、diff/cleanup | 既有 >500kB chunk warning；无 convergence script |
| browser | `readonly-pass/group-row-gated` | `.95` 真实好友完成 search -> profile -> common-groups -> profile -> search，关键词/结果恢复、412/412 | count=1 但列表为空，真实群行/openGroup 仍 data-gated |
| protection | `pass` | RN protected diff=0；本片无 SDK source/generated 或 RN business 改动；verify 仅触发允许的 SDK Web build/sync | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-context-owner-converged; browser-readonly-pass/group-row-gated`。本片只把既有受控 route state 传入共同群聊子路由，不改变共同群分页、群会话打开、好友关系或任何 mutation。

## W6.a6.20.74 Contact Profile Child Route Context (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 资料进入申请页、返回资料、再返回来源的 React Router 链保留搜索/扫码/群成员/验证列表白名单 context | RN source/caller 保持冻结 |
| ownership | `route-context-owner-converged/pass` | `contact-profile-route-state` 唯一清洗 context；资料/申请/Header 只传递；SDK `peerProfile.applyFriend` 继续唯一持有申请业务 | none |
| safety | `pass` | backHref 使用明确 allowlist；关键词最长 100、tab 合法、群会话候选 trim、来源只接受与 `/scan` 绑定的 `qrcode`；未知字段/地址丢弃 | none |
| verification | `pass` | fail-first expected missing-owner failure；focused 4 files/25 tests，收紧后 3/15；H5 125/389、SDK Web 98/406、`npm run verify`、466 assets、typecheck/boundary、1176-module build、diff/cleanup | 既有 >500kB chunk warning；无 convergence script |
| browser | `readonly-pass` | 当前唯一登录标签：服务器好友搜索 `62 -> im-9162 -> profile -> add -> profile -> search`，关键词 `62` 与 friends tab 恢复，console warning/error=0 | 扫码/群成员自然样本仍按既有能力 gate；未提交申请 |
| protection | `pass` | RN protected diff=0；本片未写 SDK source/RN/Desktop；只执行允许的 SDK Web build/sync | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-context-owner-converged; browser-readonly-pass`。本片只恢复 React Router context，不改变申请来源默认值、message、关系或 mutation；真实好友申请未执行。

## W6.a6.20.73 Contact Search Profile Return State (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 本地或服务器好友结果进入资料 route 时携带有界关键词与页签；Navbar 返回 `/contacts/search` 后恢复 local/server presentation，服务器模式按原 tab 重新调用既有 facade | RN source/caller 保持冻结 |
| ownership | `route-state-owner-converged/pass` | `contact-search-view` 唯一构造/解析 state；`ContactSearchUserRow` 与 `ContactProfileHeader` 仅传递/消费；资料与搜索 SDK owner 不变 | 好友申请子路由的搜索上下文延续留作独立切片 |
| safety | `pass` | 仅允许精确 `/contacts/search`、trim 后最长 100 字关键词、`friends|groups|null`；未知字段和外部 URL 丢弃，不透传 DTO/token | none |
| verification | `pass` | fail-first 3 expected failures；focused 2 files/12 tests、H5 full 124 files/385 tests、SDK Web 98 files/406 tests、`npm run verify`、typecheck、runtime boundary、466 assets、1175-module build、diff/cleanup | 既有 >500kB chunk warning；仓库无 `scripts/check-convergence.sh` |
| browser | `local-and-server-friend-return-pass/server-group-result-gated` | `.95` 关闭 local；`.99` 关闭 server friends：`62 -> im-9162 -> profile -> search`，关键词/server mode/friends Tab 保持、412/412 | 服务器 groups 只有空态，结果资料/群路由仍自然样本门禁 |
| protection | `pass` | `im28-phone` protected diff=0；SDK source 无本片新增；仅 `build:web/sync:web` 刷新 H5 generated package | 未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/route-state-owner-converged; browser-local-and-server-friend-return-pass/server-group-result-gated`。本片只恢复搜索 presentation context，不复制 profile/search 业务、不读取 History API，也不改变任何关系 mutation。

## W6.a6.20.72 Contact Search Group Conversation Fallback (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 本地搜索按 RN 顺序先收集 joined groups，再用 `type=group` 且 targetID 有效的 cached conversation 补缺；同 groupID 的 joined group 始终优先 | RN source/caller 保持冻结 |
| ownership | `pass` | `buildContactSearchLocalResults` 唯一合并 contacts/groups/conversations；SDK `listCached/openGroup`、群资料与权限 owner 不变 | SDK source 不需修改 |
| safety | `pass` | fallback 只投影 groupID/conversationID/name/avatar；不推断成员数、角色、权限、群状态，也不写回 groups cache | none |
| failure | `pass` | contacts、groups、conversations 三项独立 settled；任一失败保留其余成功快照并显示可重试错误 | 真实 Gateway/SQLite 失败像素未注入 |
| verification | `pass` | fail-first；focused 2 files/12 tests、H5 full 123 files/382 tests、SDK Web 98 files/406 tests、`npm run verify`、typecheck、runtime boundary、466 assets、1175-module build、diff/cleanup | 既有 >500kB chunk warning；仓库无 `scripts/check-convergence.sh` |
| browser | `runtime-pass/sample-data-gated` | 本地 `/contacts/search` 返回 HTTP 200；未注入伪造会话或创建第二 SQLite writer | 真实 conversation-only 群样本、点击与 412px 像素待自然数据补证 |
| protection | `pass` | `im28-phone` protected diff=0；SDK source 无本片新增；仅 `build:web/sync:web` 刷新 H5 generated package | 未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-sample-gated`。conversation cache 仅补本地搜索可见性，群事实与导航身份校验继续由 shared SDK owner 持有。

## W6.a6.20.71 Contact Search Local Joined Groups (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 本地关键词结果按好友在前、已加入群聊在后稳定合并；群名/群 ID 大小写不敏感命中，空关键词不生成结果 | RN source/caller 保持冻结 |
| ownership | `pass` | `buildContactSearchLocalResults` 只组合既有 filter；加载只消费 contacts/groups facade；群点击只消费 shared `conversations.openGroup` | SDK source 不需修改 |
| failure | `pass` | contacts/groups 用独立 settled task；任一失败保留另一类成功结果并显示可重试错误 | 真实 Gateway 失败像素未注入 |
| verification | `pass` | fail-first；focused 2 files/10 tests、H5 full 123 files/380 tests、SDK Web 98 files/406 tests、`npm run verify`、typecheck、runtime boundary、466 assets、1174-module build、diff/cleanup | 既有 >500kB chunk warning；仓库无 `scripts/check-convergence.sh` |
| browser | `local-joined-group-pass` | `.98` 真实 `donk的群聊` 本地结果进入规范群会话，群名/消息区/输入区正常且 412/412 | conversation-only fallback 仍归 `.72` 自然样本门禁 |
| protection | `pass` | `im28-phone` protected diff=0；SDK source 无本片新增；仅 `build:web/sync:web` 刷新 H5 generated package | 未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-local-joined-group-pass`。本片补齐本地搜索 presentation，不新增联系人、群聊或会话业务 owner。

## W6.a6.20.70 Auto Delete Entry Hierarchy And Owner Permission Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 单聊入口保留聊天设置；群聊入口移入群管理且仅 matching group `canManageAdmins` 群主可见；管理员/member fail-closed | RN source/caller 保持冻结 |
| authorization | `pass` | `canManageChatAutoDelete` 从 `canClearMessages` 收窄为 `canManageAdmins`，直接输入 URL 同样不能绕过；保存/返回群聊回到群管理 | 真实保存 mutation 未执行 |
| ownership | `pass` | `ChatAutoDeleteSettingsRow` 唯一持有入口文案、值和路由；`ChatAutoDeletePage -> sync.conversations.getAutoDelete/setAutoDelete` 仍是原主链 | SDK source 不需修改 |
| verification | `pass` | fail-first；focused 5 files/23 tests、H5 full 122 files/375 tests、SDK Web 98 files/406 tests、`npm run verify`、typecheck、runtime boundary、466 assets、1174-module build、diff/cleanup | 既有 >500kB chunk warning |
| browser | `single-owner-and-member-entry-pass/admin-role-gated` | `.102` 关闭单聊/owner；`.107` 关闭 member 隐藏入口和直达管理 route 退回，均零策略 mutation | 管理员自然角色仍待样本 |
| protection | `pass` | `im28-phone` 受保护源码零 diff；SDK source/业务零新增；未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `clean/done-local/entry-owner-converged; browser-single-owner-and-member-entry-pass/admin-role-gated`。本片只收敛入口位置、授权投影与返回层级，没有重写自动删除业务链。

## W6.a6.20.69 Group Announcement Entry Role Visibility Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | RN 设置页对存在的非普通成员显示群公告；H5 matching 群现在同样由 owner/admin 角色显示，member 隐藏 | RN source/caller 保持冻结 |
| permission separation | `pass` | 设置入口只投影 `currentUserRole`；详情页继续以 shared `canEditAnnouncement` 控制编辑/发布，入口不会提升权限 | 真实发布/已读 mutation 仍需独立授权 |
| ownership | `presentation-only/pass` | `buildChatSettingsView` 是唯一入口投影；SDK role、permission、公告版本/已读/发布链均未修改 | none |
| verification | `pass` | fail-first；focused 2 files/12 tests、H5 full 121 files/371 tests、SDK Web 98 files/406 tests、H5 typecheck、runtime boundary、466 assets、1173-module production build、diff/cleanup | 既有 >500kB chunk warning；仓库无 `scripts/check-convergence.sh` |
| browser | `owner-and-member-role-pass/admin-and-mutation-gated` | `.103` 关闭 owner；`.107` 真实 member 群隐藏公告入口，均 412/412 且零编辑/发布 | admin 自然角色与发布/已读 mutation 仍 gated |
| protection | `pass` | `im28-phone` 受保护目录零改动；SDK source/业务逻辑零改动 | 未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/presentation-only; browser-owner-role-pass/admin-member-and-mutation-gated`。本片修复的是公告设置入口的角色可见性，没有改变公告编辑授权或建立 Web 专属业务路径。

## W6.a6.20.68 Archived Conversation Global Action Menu Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | RN 归档模式与消息首页共用 `GroupActionBubble`；H5 归档 Navbar 右侧现复用 `HomeActionMenu`，四项能力与主会话/通讯录一致 | RN source/caller 保持冻结 |
| ownership | `shared-presentation-owner/pass` | 归档页只 import/render 菜单；气泡状态、外点关闭和四条 SPA route 仍只有 `HomeActionMenu` 一个 owner | 跨二级页的 overlay/history 差异继续由各目标路由验收，不在页面复制返回算法 |
| verification | `pass` | fail-first contract；focused 4 files/6 tests、H5 full 121 files/371 tests、SDK Web 98 files/406 tests、`npm run verify`、H5/SDK Web typecheck、runtime boundary、466 assets、1173-module build、diff/cleanup | 既有 >500kB chunk warning；仓库无 `scripts/check-convergence.sh` |
| browser | `readonly-pass` | `.97` 真实登录标签打开归档 Navbar 菜单，“添加朋友”进入共享搜索并取消精确回归档；空态 412/412 | 其他三项目标页业务动作不在本入口门禁内执行 |
| protection | `pass` | `im28-phone` 受保护目录零改动；SDK source 零改动；仅 `build:web/sync:web` 刷新 H5 generated package | 未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/shared-presentation-owner; browser-readonly-pass`。本片关闭的是归档页入口遗漏，没有创建 Web 专属菜单、业务路由或 SDK 分支。

## W6.a6.20.67 Archived Conversation Pinned Background Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 主 header 仍只读取可见列表置顶；归档通栏在主列表或归档列表任一存在 `isPinned` 时使用同一置顶主题背景 | RN source/caller 保持冻结 |
| ownership | `presentation-only/pass` | `shouldUsePinnedArchiveBackground` 唯一投影两个既有 cache 集合；页面只追加 `is-pinned`，无第二同步、缓存或 mutation owner | none |
| verification | `pass` | focused 4 files/17 tests、H5 full 120 files/370 tests、SDK Web 98 files/406 tests、`npm run verify`、H5/SDK Web typecheck、runtime boundary、466 assets、1173-module build、diff/hygiene scan | 既有 >500kB chunk warning |
| browser | `blocked-by-real-lock` | 临时授权登录页再次命中 SQLite 多标签单写锁并已关闭；未关闭用户标签、注入会话或执行归档/置顶 mutation | 自然“已归档且置顶”像素样本待单标签环境补证 |
| protection | `pass` | `im28-phone` 受保护目录零改动；SDK source 零改动；只执行允许的 `build:web/sync:web` | 未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/done-local/presentation-only; browser-data-lock-gated`。本片只修复归档通栏展示投影，没有建立 Web 专属业务逻辑或改写 RN 已完成链路。

## W6.a6.20.66 Conversation List Presence Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 只观察单聊；targetID 为空时兼容 RN 三种历史前缀；群聊无请求/绿点；主列表和归档列表头像使用 RN 17/10px 绿点；分钟轮询与下拉刷新均读取真实 presence | RN source/caller 保持冻结 |
| ownership | `shared-core-ready/web-consumed/rn-frozen` | `WebIMSync.presence` 继续唯一持有 HTTP/WS/账号生命周期；H5 hook 只选择当前单聊目标并投影内存状态 | RN 现有 OpenIM caller 未获授权切换 |
| state safety | `pass` | 未知响应不伪造在线，账号/目标 generation 与 revision 阻止迟到 HTTP 覆盖 WS；effect cleanup 释放 timer/observation | 断线重连像素仍需真实双账号样本 |
| verification | `pass` | focused 3 files/6 tests、H5 full 119 files/368 tests、SDK Web 98 files/406 tests、`npm run verify`、H5/SDK Web typecheck、runtime boundary、466 assets、1173-module build、diff/entropy scan | 既有 >500kB chunk warning |
| browser | `blocked-by-real-lock` | 新临时标签使用已授权 `15555555551/666666`，runtime 返回 SQLite 单写者多标签锁；临时标签已关闭 | 未关闭用户现有标签；真实在线用户像素/realtime 状态变化待单标签补证 |
| protection | `pass` | `im28-phone` 零改动；SDK source 未改，仅执行允许的 `build:web/sync:web` 同步 H5 包 | 未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/shared-core-ready/web-consumed/rn-frozen; browser-data-lock-gated`。会话列表成为现有 presence owner 的新增 Web 消费者，没有第二套 HTTP、WebSocket、SQLite 或状态解析路径。

## W6.a6.20.65 Muted At-Self Conversation Reminder Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 静音普通未读继续 `[n条]` + 红点；静音 `[有人@我]` 不加条数前缀并显示数字 badge；`[所有人]` 不冒充定向提醒；手动未读保持红点 | RN source/caller 保持冻结 |
| ownership | `single-owner/pass` | `isConversationAtSelfPreview/shouldShowConversationUnreadBadge` 唯一解释定向提醒；摘要 helper 与行组件消费同一规则 | none |
| state safety | `pass` | 只读取 shared 会话/消息投影；不调用 markRead、mute、Gateway、Repository、SQLite mutation 或 realtime action | none |
| verification | `pass` | focused 2 files/12 tests、H5 full 117 files/363 tests、`npm run verify`、H5/SDK Web typecheck、runtime boundary、466 assets、production build、diff/entropy scan | 既有 >500kB chunk warning |
| browser | `blocked-by-real-lock` | 新自动化标签填写已授权 `15555555551/666666` 后，runtime 明确返回“本地消息缓存正在其他标签页中使用”；临时标签已关闭 | 未关闭用户正在使用的现有标签；当前真实列表的静音 @我像素样本待单标签环境补证 |
| protection | `pass` | `im28-phone` 与 SDK source/generated package 本片零改动；未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-data-lock-gated`。行为链没有第二判断 owner、mock shortcut 或 fake-success；真实像素证据因预期的单写者锁保持显式门禁。

## W6.a6.20.64 Me Profile ID Clipboard Parity Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | `/me/profile` ID 行恢复 RN 同语义点击复制并显示“已复制ID”；行内不增加箭头或页面跳转 | RN source/caller 保持冻结 |
| ownership | `single-owner/pass` | 本片关闭时 `MePage` 与 `MeProfilePage` 共用 `copyMeProfileUserID`；该 owner 已被 `.85` 的跨个人/联系人资料 adapter supersede | 历史验收结论保留，当前 owner 以 `.85` 为准 |
| failure safety | `pass` | 只有 `navigator.clipboard.writeText` resolve 后才设置成功反馈；API 缺失、空 ID 或 rejection 均 fail-visible | 浏览器拒绝权限的像素态依赖用户环境，行为测试已锁定 rejection |
| verification | `pass` | focused 3 files/8 tests、H5 full 116 files/361 tests、`npm run verify`、H5/SDK Web typecheck、runtime boundary、466 assets、1169-module production build、diff/entropy scan | 既有 >500kB chunk warning |
| browser | `pass-success` | 真实账号 412x786：ID 行为 button、点击后出现“已复制ID”、1.2s 后消失、reload 不保留、URL 不变；computed border/outline none 且无横向溢出 | 未读取系统剪贴板内容，避免越权读取用户数据 |
| protection | `pass` | `im28-phone` 本片零改动；SDK source/generated package 未修改，未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `clean/done-local/presentation-platform-adapter; browser-success-pass`。个人资料域只保留一条真实剪贴板写入路径，页面没有复制 API 判断、身份或成功状态逻辑。

## W6.a6.20.63 Me Home Profile Edit Shortcuts Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | `/me` 头像恢复“修改头像”快捷动作，昵称恢复“编辑昵称”；均使用 React Router SPA route | RN source/caller 保持冻结 |
| ownership | `single-owner/pass` | 头像继续复用 `/me/profile` 的来源 sheet、Canvas crop 与 `profile.updateAvatar`；昵称继续复用 `/me/profile/nickname -> profile.update` | 首页不持有上传、保存或资料副本 |
| replay safety | `pass` | 未知 Router state fail-closed；精确 `openAvatarSource:true` 仅消费一次并 replace 清空，取消后刷新不重放 | none |
| verification | `pass` | focused 2 files/4 tests、H5 full 115 files/357 tests、H5/SDK Web typecheck、runtime boundary、`build:web/sync:web`、466 assets、1169-module production build、diff/entropy scan | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 真实账号 412x786：头像链接打开唯一来源 dialog，取消后 reload 不再打开；昵称进入 `/me/profile/nickname`；页面无横向溢出 | 未选择文件、上传或保存资料；desktop/light/dark 视觉仍为总体验收项 |
| platform exclusion | `web-not-applicable` | RN 网络设置依赖原生 HTTP/OpenIM HTTP/SOCKS proxy；浏览器无法为应用内 fetch/WebSocket 注入等价代理 | Electron/Desktop 后续通过独立 platform adapter 实现，H5 禁止假设置 |
| protection | `pass` | `im28-phone` 本片零改动；只执行 Web build/sync，未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `clean/done-local/presentation-route-adapter; browser-readonly-pass/mutation-acceptance-gated`。头像和昵称没有形成首页第二业务路径，Router state 只是一次性平台适配信号。

## W6.a6.20.62 Contact Server Search Tabs And Identity Placeholder Closeout (2026-08-14)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | `/contacts/search` 恢复 RN 的好友/群聊服务器搜索双页签；用户无真实昵称时显示 `im-` + userID 后四位 | RN source/caller 保持冻结 |
| ownership | `shared-core-ready/web-consumed/rn-frozen` | 用户归 `contacts.searchUsers + normalizeIMUserNickname`；群关系归 `groupApplications.search`；H5 只投影 Tab/行/route | `/groups/search` 是同一 facade 的另一合法 presentation，不是第二业务 owner |
| identity | `pass` | SDK 把空昵称与 `nickname===userID` 统一归一为空；完整 userID 保留在 ID 摘要及所有稳定身份链 | none |
| routing | `pass` | `available` 复用既有申请页并恢复关键词/群页签；`joined` 经 canonical `openGroup` 进入真实 conversation；`pending` 禁止重复操作 | 非空群结果与最终 mutation 仍 data/authorization-gated |
| verification | `pass` | SDK Web 98 files/406 tests、boundary/core/Web compile；H5 114 files/354 tests、typecheck、1169-module build、generated dist parity 与 diff checks | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 真实查询 `62` 展示好友/群聊双 Tab，`48622839162` 显示 `im-9162` 且第二行保留完整 ID；群页签真实空态、412px 零横向溢出、warning/error=0 | 未执行加群或进入群 mutation |
| protection | `pass` | `im28-phone` worktree clean；只执行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `clean/shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass`。用户与群查询各自保持一个 shared owner，H5 未新增 Gateway、关系状态或匿名名称双轨。

## W6.a6.20.61 Unnamed User Display Fallback Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | RN 既有 `formatIMUserDisplayName` 产出 `im-` + trim 后 userID 后四位；SDK 建立同一公开 helper，H5 不再以 account/phone/email/完整 ID 冒充昵称 | RN caller 仍使用已发布本地 helper，未授权切换 |
| ownership | `shared-core-ready/web-consumed/rn-frozen` | `formatIMUserDisplayName` 是联系人、好友申请、黑名单、资料、单聊会话、群成员/提及、名片与通话展示 owner | 完整 userID 仍用于搜索、路由、API 和 SQLite |
| stale cache | `pass` | H5 单聊会话当 `name` 为空或等于 `targetID` 时使用同一 helper；群名不套用用户规则 | none |
| verification | `pass` | SDK Web 98 files/406 tests、runtime boundary、core/Web compile；H5 114 files/352 tests、typecheck、1168-module production build | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 真实账号联系人/会话页恢复正常，warning/error=0；用已知 ID 执行真实服务器搜索返回空结果 | 当前账号无可见“无昵称用户”样本，像素证据保持 data-gated |
| protection | `pass` | `im28-phone` worktree clean；仅执行 `build:web/sync:web`，生成包只同步到 H5 | 未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `clean/shared-core-ready/web-consumed/rn-frozen; local-verified/browser-sample-gated`。默认运行链为 Gateway -> SDK DTO/display owner -> H5 投影，无 mock shortcut、fake-success 或第二份匿名名称算法。

## W6.a6.20.60 Me Home Menu Grouping Parity Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | `/me` 恢复 RN 的两卡结构：个人资料/通用设置同卡，账号安全独立第二卡，卡间距 16px | 头像/昵称快捷编辑是独立交互 inventory，不在本片扩展 |
| ownership | `presentation-only` | 三个入口继续指向既有 `/me/profile`、`/me/settings`、`/me/security`；未增加 facade、状态或兼容路由 | none |
| global mute audit | `blocked-capability/not-implemented` | RN 会话标题读取 OpenIM `globalRecvMsgOpt`；Gateway `setting.notification` 是另一条通知设置链，不能替代 | 需先冻结 OpenIM Web 用户设置 facade 或后端等价事实合同，再独立实施 |
| verification | `pass` | H5 full 114 files/351 tests、H5 typecheck、1166-module production build、diff scan | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 真实账号 cardCount=2、rowCounts=2/1、labels 顺序正确、gap=16、width=380/380、overflowX=false、warning/error=0 | 无 mutation |
| protection | `pass` | SDK source/generated package 与 RN business 均未修改；本片未执行 RN/Desktop/build:all/`build:package:desktop:web` | 验证早期只执行允许的 `build:web/sync:web`，RN 包未重写 |

Closeout verdict: `clean/done-local/presentation-only; browser-pass`。个人中心不再把 RN 的两个菜单分组压成一张卡；OpenIM 全局接收选项保留为显式 SDK 能力门，没有用 Gateway 推送偏好制造 Web 双轨。

## W6.a6.20.59 Calls Edit Chrome Parity Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN `CallListScreen.onChromeHiddenChange`：进入编辑隐藏主 TabBar，完成或 Activity cleanup 恢复 | RN source/caller 保持冻结 |
| ownership | `single-app-shell-owner` | `PrimaryTabsLayout` 唯一计算并渲染 `PrimaryTabBar`；`CallsPage` 只上报 `editing`，不直接操作全局 DOM 或导航 | none |
| layout | `pass` | 编辑栏 `bottom:0`、包含 browser safe area；列表编辑态保留 84px+safe-area 底部空间；主 scene 在编辑态扩展至完整视口 | 空通话列表已证明 chrome；真实长列表最后一行仍属自然数据视觉补证 |
| delete-or-register | `delete` | 删除编辑栏依赖 TabBar 高度的叠加布局，不新增 wrapper、第二底栏、Gateway、SQLite、DTO、cache 或 mutation owner | none |
| verification | `pass` | focused 2 files/6 tests、H5 full 113 files/350 tests、H5 typecheck、1166-module production build、diff/entropy scan | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 第二账号 1280x720：编辑前 tabbar=1/editbar=0、边界 629；编辑中 tabbar=0/editbar=1、editbar 648..720、scene bottom 720、list padding 84、overflowX 0；完成后恢复；warning/error 0 | 未执行删除或通话 mutation |
| protection | `pass` | 本片未修改 SDK source/generated package、RN business 或 Desktop；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/app-shell-owner-converged; browser-pass`。全局底栏仍只有主布局一个 owner，通话业务和 RN 行为没有产生双轨。

## W6.a6.20.58 Primary Tab Scene Retention Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN `ChatHomeScreen` 四个 React `Activity`：页面实例跨 Tab 保留，隐藏时暂停副作用，返回后恢复本地 UI 状态与滚动 | RN source/caller 保持冻结 |
| routing | `single-SPA-owner` | React Router 继续唯一持有四个稳定 URL；叶 route 使用显式空 Fragment marker，页面实例只由 `PrimaryTabsLayout` 渲染 | detail/auth/settings route 不进入保留壳 |
| scroll | `pass` | 四个 absolute scene 各自 `overflow-y:auto`；只记录可见 scene 的真实滚动，恢复时还原；pull refresh 与通讯录回顶读取 scene owner | 浏览器默认 window scroll 仍服务非主 Tab route |
| delete-or-register | `delete` | 主 Tab route 不再拥有页面 element/Outlet 实例；无第二页面壳、兼容 wrapper 或页面级滚动保存分支 | none |
| verification | `pass` | focused 4 files/10 tests、H5 full 112/347、SDK Web 98/403、H5/SDK Web typecheck、runtime boundary、1165-module build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 第二账号通话搜索词 `donk` 跨通讯录往返保留；四场景常驻且唯一 active；缩小视口实测消息 `59 -> 通讯录 0 -> 消息 59`；412x786 scene bottom/tabbar top 均 695、overflowX 0；clean reload 新日志 0 | 未执行消息、通话或资料 mutation |
| protection | `pass` | 未修改 SDK source、RN business 或 Desktop；门禁执行 SDK `build:web/sync:web` 仅同步 Web package，未执行 RN/Desktop/build:all/`build:package:desktop:web` | 既有 generated package 脏状态保持，不归因本片业务改动 |

Closeout verdict: `clean/done-local/app-shell-owner-converged; browser-pass`。React Router 继续只负责 URL，主场景生命周期和滚动只存在于 `PrimaryTabsLayout`，没有形成第二套页面业务或影响 RN。

## W6.a6.20.57 Primary Contacts Tab Verification Badge Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 全局通讯录 Tab 复用 RN `friendApplicationUnreadTotal + groupApplicationUnreadTotal`；零值隐藏、三位数宽角标和超过 999 显示 `999+` 与 RN 一致 | RN source/caller 保持冻结 |
| ownership | `single-H5-owner/shared-read` | `PrimaryTabsLayout` 持有主 Tab 生命周期内唯一验证计数 hook；`PrimaryTabBadgeProvider` 同时向 TabBar 与 ContactsPage 提供同一快照/刷新端口；底层仍只调用 SDK 两个既有 read facade | 全屏验证消息 route 独立生命周期继续复用同一 hook 实现 |
| freshness | `pass` | 主布局首次恢复与每次进入通讯录都刷新；同 runtime/账号并发请求合并；旧账号异步结果不能覆盖新账号 | 非零实时变化仍依赖既有页面进入、下拉和 mark-read 刷新点 |
| delete-or-register | `delete` | 四个主 Tab 均已迁移，删除 `href:null`、禁用按钮分支及失效 `:disabled` CSS，不保留 compat | none |
| verification | `pass` | focused 3 files/7 tests、full 111 files/344 tests、H5 typecheck、1165-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 真实 `/contacts` 加载 2 位联系人；四个 Tab 均可导航，消息/通讯录 SPA 往返 URL 正确；当前验证未读为 0，角标正确隐藏 | 非零角标真实视觉等待自然申请数据；未执行 accept/reject/mark-read |
| protection | `pass` | 本片只改 H5；未修改 SDK source/generated package 或 RN business；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-zero-state-pass/non-zero-data-gated`。通讯录角标与页面 shortcut 不再各自请求或维护状态，申请计数事实仍由既有 shared facade 单一提供。

## W6.a6.20.56 Legacy Chat Forward Route Compatibility Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| primary path | `pass/single-owner` | 当前转发唯一 UI 路径仍为 `ChatPage -> ChatTargetPickerModal`；旧 `/conversations/:conversationID/forward` 只执行 replace redirect，不渲染页面或选择器 | 历史深链兼容仍登记保留 |
| state safety | `pass` | 仅接受 1–100 个稳定 client message ID；拒绝正文/payload；来源会话必须与路由及加载后的当前会话同时匹配；一次性 state 使用后清除 | 刷新后不恢复已丢失的内存 state |
| delete-or-register | `register-compat-only` | 无 `ChatForwardTargetPage`、第二目标 source、提交、cache 或 mutation owner；兼容 route 退出条件为历史深链/浏览器历史不再需要支持 | none |
| verification | `pass` | focused 1 file/4 tests、full 110 files/341 tests、typecheck、1165-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 旧 forward URL 从 404 恢复为真实聊天页；reload/back 不重放弹窗，页面消息/输入区正常且零新增 warning/error | 带有效内存 state 的最终转发仍属于真实 mutation gate |
| protection | `pass` | 本片不改 SDK source/generated package 或 RN business；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/compatibility-only; browser-readonly-pass`。兼容入口只修复旧历史地址，不重新引入已删除的转发目标页面或 Web 业务双轨。

## W6.a6.20.55 Chat Initial Message Skeleton Parity Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 固定 12 条 incoming 占位，循环复用 RN 188x58、236x76、142x44、210x58 四档尺寸；群聊显示 24px 头像，单聊隐藏；复用 RN skeleton tail 与 2.2s shimmer | RN source/caller 保持冻结 |
| ownership | `presentation-only/single-owner` | `ChatMessageSkeleton.tsx + chat-message-skeleton.css` 唯一持有首屏加载视觉；`ChatMessageList` 只按 loading/empty 与 isGroup 组合 | none |
| delete-or-register | `delete` | 删除旧的 4 条左右交替 pulse bar 内联实现和旧 CSS，不保留 compat wrapper | none |
| layout | `pass` | 骨架绝对锁定 message stack、底部排列并裁切顶部；真实短群聊 system row bottom 632、list bottom 656、composer top 656、overflowX 0 | none |
| verification | `pass` | H5 focused 1 file/3 tests、full 110 files/339 tests、466 assets、typecheck、1164-module production build、diff check；SDK Web 98 files/403 tests | 既有 >500kB chunk warning |
| browser | `pass-readonly/cold-frame-timing-gated` | 第二联调账号真实群聊、稳定 reload 零新增 warning/error、短消息贴底通过 | SQLite cache 命中过快，未截到自然瞬态骨架帧 |
| protection | `pass` | 本片不改 SDK source 或 RN business；仅允许的 `build:web/sync:web` 发布 Web 包；未执行 RN/Desktop/build:all 或 `build:package:desktop:web` | none |

Closeout verdict: `clean/done-local/presentation-only; browser-short-list-pass/cold-frame-timing-gated`。加载态不再使用 H5 自创的交替占位，且独立样式 owner 避免继续扩张大型聊天样式文件。

## W6.a6.20.54 Unified Chat Target Picker And Short-List Bottom Alignment Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| ownership | `shared-core-ready/web-consumed/rn-frozen` | `ChatTargetPickerModal` 唯一持有好友/群聊目标 presentation；SDK `forwardToTargets/messageBroadcast.sendCard` 持有跨目标业务与结果语义 | RN 多目标 consumer 未迁移，需单独授权 |
| delete-or-register | `delete` | 独立 `ChatForwardTargetPage`、route 与页面 CSS 删除；群发/二维码/用户名片/群名片选择层改用同一组件 | route shell 仅保留可恢复来源与兼容入口 |
| behavior | `pass` | 单/多选、跨 Tab 选择、当前筛选 ALL、50 上限、排除身份、多目标 partial result 与短消息 bottom stack 已覆盖 | 最终发送属于真实 mutation gate |
| verification | `pass` | SDK focused 3 files/13 tests、all-runtime boundary/typecheck；H5 full 109 files/337 tests、typecheck、1161-module production build | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 登录态聊天转发不离开当前 URL；好友 ALL 2、群聊 ALL 后累计 3；群发使用同一全高底部弹窗；短会话 stack `justify-content:flex-end` 且 outer scroll geometry 不变 | 未点击最终分享/转发，不改变远端数据 |
| protection | `pass` | `im28-phone` worktree clean；只执行 SDK `build:web/sync:web`，未执行 RN sync/build；`build:package:desktop:web` 未修改或执行 | none |

Closeout verdict: `clean/shared-core-ready/web-consumed/rn-frozen; browser-readonly-pass/mutation-acceptance-gated`。选择 UI 不再按业务页面复制，多目标业务不落回 H5 循环，短消息与 RN 一致从底部开始展示。

## W6.a6.20.53 Pull Refresh Indicator Owner Convergence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| ownership | `presentation-only/converged-owner` | 全部 20 个 `usePullRefresh` 生产页面统一消费 `components/interaction/PullRefreshIndicator`；页面 refresh callback 与 shared facade 不变 | none |
| delete-or-register | `delete` | 10 份手写提示 DOM 和 9 个 CSS 文件中的局部 `rn-*-pull` 选择器删除；不保留 compat wrapper | none |
| contract | `pass` | 新结构 contract 自动扫描生产页与页面 CSS，锁定 `20/20` consumer 和 legacy selector zero | none |
| verification | `pass` | focused 5 files/10 tests、H5 full 108 files/334 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；两次从错误子目录调用脚本的入口错误已更正 |
| browser | `pass-readonly/physical-touch-gated` | 5176 `/calls`、`/conversations`、`/conversations/search`、真实群成员路由均显示折叠全局提示、旧 class 为零、数据正常且 warning/error 为零 | 物理触摸释放未自动化；未执行任何 mutation |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-owner-converged; browser-readonly-pass/physical-touch-gated`。手势与业务刷新仍由既有页面/facade 持有，三态展示不再存在页面级双轨。

## W6.a6.20.52 Forward Target Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 普通转发目标页对齐 RN `ForwardTargetSelector` 的 `RefreshControl`；三 Tab、搜索、目标打开和转发主链保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 页面只调用既有 `loadChatForwardTargets`，底层继续唯一消费 `conversations/contacts/groups` facades；无 transport/cache owner | none |
| failure | `pass` | 三类刷新全部成功后才替换快照；失败保留当前目标、Tab 和搜索词；加载、刷新或打开目标期间拒绝重复下拉 | none |
| verification | `pass` | focused 4 files/8 tests、H5 full 107 files/332 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/physical-touch-gated` | 5176 真实 3 条最近会话、2 位好友、1 个群聊，搜索/清除、三 Tab、折叠提示、412/412 和零 warning/error 通过 | 物理触摸释放未自动化；未打开目标或提交转发 |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。转发目标刷新沿用既有三类 shared owners，没有建立 Web 数据或转发业务双轨。

## W6.a6.20.51 Blacklist Pull Refresh And Indicator Convergence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 黑名单页对齐 RN `ProfileScreen` 黑名单 FlatList 的刷新入口；搜索、解除确认和 mutation 主链保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 刷新只调用既有 `blacklist.list`；解除继续只调用 `blacklist.remove`；七个页面统一消费全局 `PullRefreshIndicator` | none |
| delete-or-register | `delete` | 删除 `VerificationPullIndicator`、`GroupPullRefreshIndicator` 与两套重复 CSS；不保留 compat wrapper | none |
| failure | `pass` | 刷新成功后才替换列表；失败保留当前黑名单与搜索词；首次加载、刷新或解除处理中拒绝重复手势 | none |
| verification | `pass` | focused 6 files/16 tests、H5 full 106 files/330 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/empty-data/physical-touch-gated` | 5176 真实空黑名单完成搜索/清除、两类空态、折叠提示与 412/412 验收；稳定 reload 日志数量不增长 | 当前无黑名单样本；物理触摸未自动化；删除旧模块时留有一条既有 Vite HMR 历史错误 |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/empty-data-and-physical-touch-gated`。黑名单读取/解除仍服从唯一 shared owner，跨页面刷新提示不再双轨。

## W6.a6.20.50 Group Applications Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 指定群入群申请页对齐 RN `GroupApplicationListView` 的 `RefreshControl`；搜索、申请操作、确认和提交主链保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 刷新只调用既有 `groupApplications.list` facade；accept/reject mutation 继续使用原 shared owner；页面不新增 Gateway、SQLite、DTO 或 Repository 分支 | none |
| failure | `pass` | 刷新成功后才替换列表；失败保留当前申请与搜索词；首次加载、刷新、接受或拒绝处理中拒绝重复手势 | none |
| verification | `pass` | focused 4 files/11 tests、H5 full 105 files/328 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/physical-touch-gated/action-data-gated` | 5176 真实群路由显示群 ID、搜索、折叠刷新提示与空态；搜索/清除、412/412 和稳定 reload 零 warning/error 通过 | 当前无申请样本；物理触摸释放未自动化；未执行 accept/reject |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-and-action-data-gated`。刷新沿用唯一 shared owner，并复用验证列表提示组件，没有建立 Web 群申请业务双轨。

## W6.a6.20.49 Group Mute Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 群禁言页对齐 RN `GroupMuteScreen` 手动禁言列表的 `RefreshControl`；范围选择、成员操作、确认和提交主链保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 刷新只调用既有 `groups/groupMembers`；禁言 mutation 继续唯一调用 `groupManagement`；页面不新增 Gateway、SQLite、DTO、Repository 或权限规则 | none |
| failure | `pass` | 群与成员同步都成功后才替换页面事实；失败保留当前禁言范围和成员快照；首次加载、刷新、提交期间拒绝重复手势 | none |
| verification | `pass` | focused 3 files/8 tests、H5 full 104 files/326 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/physical-touch-gated` | 5176 真实群显示关闭范围、两位可禁言成员、折叠刷新提示、412/412 无溢出；稳定 reload 无新增 warning/error | 物理触摸释放仍需设备验收；未执行真实禁言 |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。刷新沿用唯一 shared owner；旧选择页专属提示已删除并收敛为三个群页面共用展示组件。

## W6.a6.20.48 Group Member Selection Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 邀请群成员与移出群成员页对齐 RN `RefreshControl`；搜索、选择、确认和提交主链保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 邀请刷新复用 `groups/groupMembers/contacts`，移除刷新复用 `groups/groupMembers`；页面不新增 Gateway、SQLite、DTO、Repository 或 mutation 规则 | none |
| failure | `pass` | 每页所有同步成功后才原子替换候选事实；失败保留旧候选、搜索词与选择态并显示真实错误 | none |
| verification | `pass` | focused 4 files/8 tests、H5 full 104 files/325 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/physical-touch-gated` | 5176 真实群邀请空态、移除两位成员、搜索过滤、禁用提交、412px 宽度与 console 0 warning/error 均通过 | 物理触摸释放仍需设备验收 |
| protection | `pass` | 本片未修改 SDK source/generated package 或 `im28-phone`；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。两个页面继续消费既有 shared owners，没有建立 Web 数据或群管理双轨。

## W6.a6.20.47 Joined Groups Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | `/contacts/groups` 对齐 RN `ContactGroupListScreen` 的 `RefreshControl`；顶部单指释放触发群列表刷新，搜索词与既有动作保持不变 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 刷新只调用既有 `groups.sync({ pageSize: 50 })`；页面不新增 Gateway、SQLite、DTO、Repository 或群生命周期规则 | none |
| failure | `pass` | 远端同步失败保留当前群列表并展示真实错误；刷新成功才原子替换列表 | none |
| verification | `pass` | focused 3 files/8 tests、H5 full 103 files/323 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/physical-touch-gated` | 5176 真实 `donk的群聊`、群主标签、无结果搜索与恢复搜索均通过；412/412 无溢出，console 0 warning/error | 物理触摸释放仍需设备验收 |
| protection | `pass` | SDK source/generated package 与 `im28-phone` 本片零改动；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。群列表刷新沿用唯一 shared owner，没有建立 Web 数据双轨。

## W6.a6.20.46 Create Group Selection Review And Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 普通建群选中好友后显示搜索、头像预览、清空入口和“已选好友”底部复核层；支持逐个移除；页面顶部单指释放触发联系人刷新 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 创建继续调用既有 `groups.create`，刷新只调用既有 `contacts.list`；H5 仅持有选中态投影、modal 与手势 | none |
| failure | `pass` | 刷新失败保留旧联系人快照并展示真实错误；已失效身份不进入复核列表；零选中时自动关闭复核层 | none |
| verification | `pass` | focused 3 files/8 tests、H5 full 102 files/321 tests、466 assets、typecheck、1158-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly/physical-touch-gated` | 5176 真实两位好友完成全选、复核、逐个移除和清空；提交按钮状态正确，412/412 无横向溢出，console 0 warning/error | 物理触摸释放仍需设备验收 |
| protection | `pass` | SDK source/generated package 与 `im28-phone` 均零改动；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。普通建群没有建立 Web 业务双轨，新增内容只负责 RN 交互投影。

## W6.a6.20.45 Friend-Added Message Presentation Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | type1201 在聊天页和会话列表统一显示“你们已经成为好友，可以开始聊天了”；RN source/caller 保持冻结 | RN production caller 需独立授权后才能收敛 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK `friend-added-message.ts` 单一持有类型、文案与 unknown fail-closed helper；初始未读边界复用同一类型常量 | none |
| Web consumers | `done-local` | H5 聊天页和会话摘要共同调用 shared helper，已删除两处页面级 1201 文案/类型硬编码 | none |
| verification | `pass` | SDK focused 2 files/6、Web full 97 files/400 tests、全 target typecheck/boundary；H5 focused 2 files/20、full 101 files/319 tests、466 assets、1157-module build、diff check | 既有 >500kB chunk warning |
| browser | `pass-real-data` | 5176 真实 `donk二大爷` 会话由 `[contentType=1201]` 修复为 RN 文案；稳定期 reload 日志未增长，raw fallback 消失 | build:web 热替换期间旧标签出现 Provider 顺序瞬时错误；冷启动登录页零错误，登记为 dev HMR 噪声 |
| protection | `pass` | `im28-phone` clean；仅执行 `build:web/sync:web`，未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-real-data-pass`。type1201 的身份和文案只有 SDK 一个 owner，H5 不再把已知关系通知显示为原始协议号。

## W6.a6.20.44 Structured Group System Notice Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 `group_description_changed` 的“你/操作者昵称更新了[群简介]”及 `group_send_frequency_changed` 的开启间隔/关闭文案；RN source/caller 保持冻结 | RN production caller 需独立授权后才能收敛 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK `parseIMGroupSystemMessagePresentation` 单一解析 core/Gateway/RN wrapper、event 与 extra；聊天页和会话列表都只消费该投影 | none |
| realtime | `done-local` | OpenAPI 明示的 numeric `1521` 已进入 Gateway WebSocket `message` 分类；未为没有公开 numeric type 的发言频率事件猜测映射 | 真实双账号事件样本 |
| failure | `pass` | 未知 event、坏 extra、开启但缺秒数均 fail-closed；不信任 `system.text`，`1521` 缺结构事实时仅保留既有静态降级 | none |
| verification | `pass` | SDK focused 2 files/9、Web full 96 files/398 tests、全 target typecheck/boundary；H5 focused 2 files/18、full 101 files/317 tests、466 assets、1156-module build、diff check | 既有 >500kB chunk warning |
| browser | `pass-runtime/data-gated` | 5176 登录态 reload、账号恢复和设置页路由正常，console 0 warning/error | 当前缓存无可确认的 1521/频率消息，真实列表/气泡视觉保持 natural-data gate |
| protection | `pass` | `im28-phone` clean；仅执行 `build:web/sync:web` 发布 H5 包，未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-runtime-pass/natural-data-gated`。群系统文案只有 SDK 一个业务 owner，H5 未保留页面级 `system.extra` 解析副本。

## W6.a6.20.43 Global Reset, Navbar And Route Motion Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| reset | `done-local` | 全局 button 清除原生 appearance、margin、padding、border、radius 和 background；键盘 `:focus-visible` 仍保留 2px 可见焦点 | 业务组件显式 border/background 继续按页面 CSS 覆盖 |
| navbar | `done-local/converged-owner` | `PageNavbar + page-navbar.css` 已被 35 个可寻址详情/选择页消费；统一 safe-area、56px、三列、标题和图标，页面 class 仅保留视觉/动作差异 | 11 个主 Tab、复合聊天、认证品牌、媒体/来电/Dialog 标题按 contract 排除 |
| motion | `done-local/reused-owner` | 继续复用 `RouteMotionController + interaction.css` 的 pathname 入场；只作用 `#root main`、跳过首屏并尊重 reduced-motion，固定 TabBar 不参与动画 | 物理设备 reduced-motion 目视可后续补证 |
| dependency | `pass` | 未新增 UI/motion 依赖或 lockfile 改动；避免与 RN CSS、现有 modal 和 Navbar owner 形成双轨 | none |
| verification | `pass` | focused 1 file/2 tests、H5 full 101 files/315 tests、466 assets、typecheck、1155-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly` | 5176 412px 通用设置确认 grid/56px/64-268-64、按钮 appearance none/border 0、退出按钮视觉保留、bodyWidth=viewportWidth=412；资料与聊天设置同一几何已点验 | 路由动画瞬时 class 在 160ms 后正常清除 |
| protection | `pass` | 本片未修改 SDK source/generated package 或 RN business；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build/sync | none |

Closeout verdict: `clean/done-local/presentation-only; browser-readonly-pass`。轻量交互沿用仓库现有 CSS/React Router owner，不引入第三方 UI 库或第二套组件协议。

## W6.a6.20.42 Settings Logout Modal Lifecycle Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 精确投影“退出登录 / 确认退出当前账号？ / 取消 / 退出”，确认层不再使用页面手写遮罩 | RN source/caller 保持冻结 |
| modal lifecycle | `done-local` | 独立 `MeLogoutDialog` 复用全局 `InteractionModal`；原生 top-layer、受控 Esc、遮罩、焦点和 reduced-motion 一致，WebView Escape 兜底已在全局 owner 收敛 | none |
| ownership | `presentation-only/converged-owner` | 页面继续只调用既有 `runtime.signOut()`；token、WebSocket、来电媒体和账号数据库清理由 runtime 唯一持有 | 未执行最终退出 |
| verification | `pass` | focused 1 file/2 tests、H5 full 100 files/313 tests、466 assets、typecheck、1153-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-nondestructive` | 5176 412px 打开、Escape、遮罩和取消均关闭；路由/登录态保持，宽度 412/412，无最终 logout mutation | pending 状态由组件 contract 与 disabled controls 覆盖 |
| protection | `pass` | 本片 SDK source/generated package 零改动，`im28-phone` clean；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `done-local/presentation-only; browser-nondestructive-pass`。退出业务链保持原样，H5 只删除页面级重复 modal 生命周期。

## W6.a6.20.41 Call List Modal And Empty-State Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 搜索、未接筛选和默认空列表分别投影“暂无搜索结果 / 暂无未接来电 / 暂无通话记录”；批量删除保留 RN 底部确认结构 | RN source/caller 保持冻结 |
| modal lifecycle | `done-local` | 独立 `CallDeleteSheet` 复用全局 `InteractionModal` 的原生 dialog top-layer、Esc、焦点、背景 inert、退出动画和 reduced-motion；删除期间遮罩、Esc、取消和重复确认均 fail-closed | 当前账号无通话记录，真实 modal 打开仍 data-gated |
| ownership | `presentation-only/converged-owner` | 确认仍只回调原 `WebIMCallSync.delete`；成功清理和首屏 cache 重读、失败错误均未改 | 不执行真实删除 |
| verification | `pass` | focused 2 files/7 tests、H5 full 99 files/311 tests、466 assets、typecheck、1152-module production build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 5176 412px 三类空态、编辑/完成、筛选和 TabBar 通过；412/412 无溢出，console 0 warning/error | 无真实通话行，modal 打开/Esc/取消需有数据后复验 |
| protection | `pass` | SDK source/generated package 零改动，`im28-phone` clean；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `done-local/presentation-only; browser-readonly-pass/modal-data-gated`。通话列表没有新增 Web 业务 owner，删除、缓存和查询继续只服从 shared call facade。

## W6.a6.20.40 Verification Center Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN 好友验证与群聊验证索引的顶部下拉刷新；首次 loading 和用户 refreshing 期间均拒绝重复手势 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | 两侧复用 H5 `usePullRefresh`；列表只调用既有 `friendApplications.list/groupApplications.list`，角标继续调用原 `getUnreadCount` owners | none |
| failure | `pass` | 列表和角标并行且独立：角标失败保留成功列表；列表失败保留旧快照并显示真实错误，不用计数成功伪造空列表 | none |
| verification | `pass` | focused 3 files/12 tests、H5 full 98 files/308 tests、466 assets、typecheck、1151-module production build | 既有 >500kB chunk warning |
| browser | `pass-readonly/physical-touch-gated` | 5176 412px 好友 Tab 真实 2 条记录、群 Tab 空态、Router tab 切换、刷新占位收起、412/412 宽度、干净 reload 后 console 0 warning/error | 当前语义工具不能可靠合成物理触摸释放 |
| protection | `pass` | SDK source/generated package 零改动，`im28-phone` clean；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。未执行 accept/reject/mark-read，验证列表和角标仍各自服从 shared owner，不产生 Web 业务双轨。

## W6.a6.20.39 Call List Pull Refresh Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN 通话列表顶部下拉后强制远端同步、重读当前筛选第一页；编辑态不接管下拉手势 | RN source/caller 保持冻结 |
| ownership | `presentation-only/converged-owner` | H5 复用全局 `usePullRefresh`；业务只调用既有 SDK `calls.sync -> listCached`，无 Gateway、SQLite、DTO 或终态映射副本 | none |
| failure | `pass` | 远端同步失败不读取并替换 cache，不清空旧列表，页面展示真实错误 | none |
| verification | `pass` | H5 focused 1 file/4 tests、full 97 files/306 tests、typecheck、1149-module production build | 既有 >500kB chunk warning |
| browser | `pass-readonly/physical-touch-gated` | 5176 在 412px 下通过所有/未接筛选、编辑/完成、空态、TabBar、`scrollWidth=clientWidth=412`，console 0 warning/error | 当前语义工具不能可靠合成物理触摸下拉 |
| protection | `pass` | 本片 SDK 零改动，`im28-phone` clean；未执行 SDK/RN/Desktop/build:all/`build:package:desktop:web` build 或 sync | none |

Closeout verdict: `done-local/presentation-only; browser-readonly-pass/physical-touch-gated`。刷新没有建立 Web 专属通话业务链，后续仍可直接跟随 shared call facade 演进。

## W6.a6.20.38 Conversation Draft Persistence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN `输入保存 -> 列表 [草稿] -> 重进恢复 -> 发送/清空移除`，正文 trim 与预设表情 entities 同步保存 | RN caller 保持冻结 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK `createIMConversationDraftSync/readIMConversationDraftDocument` 单一拥有文档校验、schema v13 `draft_entities_json` 与同步替换保留规则 | RN 尚未切换 shared facade |
| Web consumer | `done-local` | `ChatPage/ChatComposer` 只投影 route 输入态；`conversation-list-view` 只消费 shared reader，发送失败保留草稿 | none |
| verification | `pass` | SDK focused 3 files/12 tests、Web full 95/394、H5 focused 2 files/12 tests、H5 full 97/304、SDK Web/H5 typecheck、build:web/sync:web 与 1149-module H5 build | 既有 >500kB chunk warning |
| browser | `pass-nonremote` | 5176 登录态完成 `W38草稿😎` 输入、列表 `[草稿]`、重进恢复、清空回退最新消息；console 0 error，未发送消息 | 多标签同会话同时编辑冲突策略未定义 |
| protection | `pass` | `im28-phone` clean；未执行 RN/Desktop/build:all/`build:package:desktop:web` | none |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-draft-loop-pass`。草稿没有 Gateway 或 fake-success 路径，普通 conversation sync/replace 会保留当前账号本地草稿与实体。

## W6.a6.20.37 Chat Call Record Message Bubble Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 文案、audio/video、拒绝/取消禁用图标和点击回拨语义按 RN `parseRTCCallMessage/ChatMessageBody` 冻结 | RN caller 保持冻结 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 单一解析 core/Gateway/RN 包装；实时 invite/accept fail-closed，不复制 RTC lifecycle | RN 尚未切换 shared parser |
| Web consumer | `done-local` | `getChatMessageView` 消费 SDK 投影；单聊点击复用已有 `handleStartCall -> WebIMCallProvider`，群聊只读 | none |
| verification | `pass` | SDK focused 1/4、Web full 94/391、H5 focused 1/9、boundary、SDK Web/H5 typecheck、1147-module build | 既有 >500kB chunk warning |
| browser | `pass-runtime/data-gated` | 5176 目标会话加载成功且 console 0 error；缓存窗口无 type110/RTC 终态样本，未注入假消息 | 真实历史通话消息的图标/文案目视与只读点击前状态 |
| protection | `pass` | `im28-phone` clean；只执行 build:web/sync:web，未执行 RN/Desktop/build:all/desktop:web | none |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-runtime-pass/history-sample-gated`。历史展示与实时来电状态机已隔离，H5 没有新增通话鉴权、信令或缓存双轨。

## W6.a6.20.36 Conversation Tab Double Press Next Unread Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 320ms 双击窗口、仅已选消息 Tab、非静音未读总数门禁、首个可见行之后选择和上次目标循环均与 RN 对齐 | 长列表可见滚动 |
| ownership | `presentation-only` | PrimaryTabsLayout 只转发当前页注册动作；ConversationsPage 只读 DOM 并 `scrollIntoView` | 无 SDK/数据库业务新增 |
| mutation safety | `pass` | 双击不调用 markRead、read receipt、Gateway、Repository 或 cache write | none |
| verification | `pass` | 原 focused 2 files/10 tests、typecheck、1145-module build；`.107` 当前 focused 2 files/14 tests | 既有 >500kB chunk warning |
| browser | `real-unread-short-list-pass/long-list-scroll-gated` | 5176 真实两条未读会话、总未读 4->5；已选消息 Tab 双击后 URL/角标不变、412/412，未触发已读 | 仅 4 行且全部可见，无法观察原生平滑滚动位移与循环目标 |
| protection | `pass` | SDK source/package 与 `im28-phone` 零改动；未执行任何 SDK/RN/Desktop build/sync | `build:package:desktop:web` 未修改或执行 |

Closeout verdict: `done-local/presentation-only; browser-real-unread-short-list-pass/long-list-scroll-gated`。真实未读与双击无副作用已补证；未用 DOM 注入、假会话或布局篡改伪造长列表位移。

## W6.a6.20.35 Single Chat Add Members Create Group Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 单聊设置成员加号、选择好友、固定当前对象、至少再选一位及返回语义与 RN 一致 | 真实创建未授权 |
| shared owner | `unchanged/converged` | 两个 H5 建群入口都只调用既有 SDK `groups.create`，2–998、去重、Gateway 与缓存语义未复制 | RN caller 冻结 |
| Web consumer | `done-local` | 新 SPA route 严格解析单聊目标，目标隐藏且不可取消；普通 `/groups/create` 行为保持不变 | none |
| verification | `pass` | H5 focused 2 files/13 tests、typecheck、1144-module production build | 既有 >500kB chunk warning |
| browser | `pass-readonly/mutation-gated` | 412px 真实单聊设置入口、候选排除、1 位额外好友后总数 2/按钮启用、返回路由及零横向溢出通过 | 未点击创建 |
| protection | `pass` | SDK source/脚本未改，`im28-phone` clean；未执行任何 RN/Desktop/build:all/desktop:web build 或 sync | none |

Closeout verdict: `done-local/converged-owner; browser-readonly-pass/mutation-gated`。本片只增加 H5 的 RN 同款入口和页面选择编排，没有新增建群业务 owner 或改动 RN 业务。

## W6.a6.20.34 Single Chat Relationship Realtime Revision Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| shared owner | `done-local` | SDK classifier 单一判定好友/我方 blacklist 事实事件，排除仅申请列表事件 | RN caller 冻结 |
| runtime isolation | `pass` | 独立 `relationshipVersion`；普通 message/conversation/update 只推进 `dataVersion` | none |
| Web consumer | `done-local` | H5 hook 只把关系 revision 加入原 facade 读取依赖，保留已有投影与 fail-closed | 真实关系变更样本 |
| verification | `pass` | SDK Web 93 files/387 tests、boundary、Web typecheck/build:web；H5 typecheck、1144-module build | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 412px 真实好友单聊刷新后 composer 可用，bodyWidth=viewportWidth=412 | 未执行好友/blacklist mutation 或双账号事件 |
| protection | `pass` | 只发布 `build:web/sync:web`；RN business、caller、生成包和 package scripts 未改 | 未执行 RN/Desktop/build:all/desktop:web |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; realtime-readonly-pass/data-gated`。关系刷新与普通消息缓存刷新已分离，没有形成 H5 业务双轨。

## W6.a6.20.33 Single Chat Relationship Availability Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐我方 blacklist composer 替换、stranger 底部验证提示/动作和发送关系错误降级；RN source/caller 冻结 | relationship realtime listener |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一状态/文案/错误分类；neutral facade 只组合 peer profile 与 blacklist identity query | RN production caller 需单独授权 |
| truthful contract | `pass` | OpenAPI 只证明 `is_friend` 与我方单向 blacklist；不实现或声称反向 blacklist，历史 `blockedByPeer` 解释为 stranger | none |
| Web adapter | `done-local` | H5 hook 只持有 route projection；申请动作进入既有 SPA route；stranger 保留 composer，blocked-by-me/unknown fail-closed | domain revision 未接入 |
| verification | `pass` | SDK 96/395、全 target typecheck、boundary/build:web；H5 focused 2/6、typecheck、1143-module build、diff check | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 真实群聊及两条好友单聊 input/controls 正常且 console error/warning=0 | 无陌生人/blacklist 样本，未执行破坏性 mutation |
| protection | `pass-with-tooling-note` | 最终仅 `build:web/sync:web` 发布，RN package 未同步、RN business 未改；SDK 脚本未改 | 一次根 `npm test` 内置 compile-only RN/Desktop，无 sync/产物写入应用 |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; relationship-realtime/data-gated`。单聊关系只有 SDK 一个业务 owner，H5 未复制 `is_friend`、blacklist payload、错误词或反向拉黑推断。

## W6.a6.20.32 Group Chat Composer Availability Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN `getGroupSendDisabledReason/ChatDetailComposerArea` 的生命周期、权限、角色、禁言、频率限制及不可用栏优先级；RN caller 只读冻结 | 受限群真实 UI 样本 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK `resolveIMGroupComposerUnavailableReason` 单一维护规则/文案，joined-group DTO 从同一 raw payload 投影可选原因 | RN 需单独授权后才能切换 production caller |
| Web adapter | `done-local/browser-readonly-pass` | `useChatMentionMembers` cache-first 恢复群与成员并独立收敛刷新失败；`ChatPageFooter` 固定多选 > 不可用 > 待转发 > composer | 群权限独立 realtime event 尚无稳定 Gateway contract |
| fail-closed | `pass` | 群路由首帧显示恢复中；权威群缺失显示已退出；无 cache 且读取失败显示状态不可用；有 cache 的弱网保留已知状态并显式报错 | none |
| verification | `pass` | SDK focused 2/13、full Web 91/381、boundary/Web typecheck/build:web；H5 focused 2/7、full 95/293、466 assets、typecheck 与 1139-module build | 既有 >500kB chunk warning；仓库无 convergence script |
| browser | `pass-readonly/data-gated` | 412x786 真实好友单聊和普通群均保留 composer，零 overflow、零 warning/error | 当前账号无封禁/解散/禁言群；未修改群设置 |
| protection | `pass` | `im28-phone` worktree clean；只执行 `build:web`（内含 `sync:web`）；SDK package/desktop scripts 未改 | 未执行 RN/Desktop/build:all 或 `build:package:desktop:web` |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; restricted-group-data-gated`。群聊发送可用性只有 SDK 一个新 owner，H5 未复制 raw 权限或建立第二业务状态机。

## W6.a6.20.31 Chat Message Delete Shatter Exit Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐 RN 仅在删除成功后执行 620ms 碎裂退场；SDK partial result 只标记成功 ID，失败行原位保留 | 真实单条/批量删除动画样本 |
| business owner | `unchanged/converged` | 继续只调用既有 `messages.delete`；Gateway、逐项结果、SQLite success-only 隐藏和通知文案均未改 | 真实 `self/all` 与 partial Gateway 结果仍属破坏性验收门 |
| Web adapter | `done-local` | `useChatMessageDeleteExit` 在 cache 重读前冻结成功行，DOM 动画结束或 700ms 兜底后释放；新到消息继续消费最新 cache | reduced-motion 只执行 1ms 退场，不伪造删除成功 |
| structure | `pass` | 碎裂 CSS 独立为 85 行模块，`chat-page.css` 回落至 974 行；新增纯规则/Hook/粒子组件均有生产消费者 | `ChatPage.tsx` 既有 485 行 P3 页面债务 |
| verification | `pass` | H5 focused 4 files/13 tests、Web typecheck、1136-module production build、`git diff --check` | 既有 >500kB chunk warning |
| browser | `pass-readonly/destructive-gated` | 412px 已登录聊天页无横向溢出，620ms CSS 规则真实加载，console warning/error 为 0 | 未调用真实删除接口 |
| protection | `pass` | 本片未改 SDK 或 `im28-phone`，未执行任何 SDK/RN/Desktop build/sync | `build:package:desktop:web` 未修改或执行 |

Closeout verdict: `done-local/presentation-only; destructive-acceptance-gated`。Web 只依据 shared SDK 的明确成功 ID 展示退场，未建立第二套删除结果、缓存或权限语义。

## W6.a6.20.30 Chat Quote Source Local Resolution And Focus Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐当前窗口/本地库恢复、点击引用定位与短时高亮、确认缺失文案；RN `fetchMessageByID/FlatList` caller 只读冻结 | 真实引用消息点击样本 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | `getCachedByStableMsgIDs` 按 client/server ID 查询当前账号 SQLite、按请求保序并以 canonical client ID 去重；无 Gateway 和 cache mutation | RN 需独立授权后才能切换 caller |
| Web adapter | `done-local/browser-readonly-pass` | `useChatQuoteSources` 批量补当前会话来源；当前 DOM 直接居中高亮，本地库来源通过同会话 `?messageID=` 目标窗口定位；群名称复用 shared resolver | 当前三个真实会话引用数均为 0 |
| fail-closed | `pass` | 仅确认本地缺失才显示“引用的内容已删除”；读取失败不伪装删除，跨会话结果拒绝，空身份禁用跳转 | none |
| verification | `pass` | SDK focused 2 files/12 tests、full Web 91 files/381 tests、boundary/typecheck/build:web；H5 focused 4 files/15 tests、466 assets、typecheck 与 1132-module build | 既有 >500kB chunk warning |
| protection | `pass` | `im28-phone` business clean；SDK scripts 未改；只执行 `build:web/sync:web` | 未执行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-quote-data-gated`。引用来源恢复只有 SDK 本地查询一个业务 owner，H5 仅持有当前窗口、React Router 与 DOM 定位差异。

## W6.a6.20.29 Chat History Pagination And Sticky Date Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 对齐最早端加载、更早窗口前插不跳动、滚动日期悬浮和程序定位不误触发；RN `useChatLoadMore/useChatMessageListScroll` caller 冻结 | 真实长历史滚动样本 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一精确 uint64 previous cursor、稳定身份去重排序、clear boundary、SQLite upsert、`has_more/next_seq` 与重复/缺失游标拒绝；旧 `pullHistory` 仅保留数组返回兼容 | RN 需独立授权后才能切换 caller |
| Web adapter | `done-local/browser-readonly-pass` | `useChatHistoryPagination` 只持有用户手势、顶部阈值、DOM 高度补偿和 1.2s 悬浮日期；初始未读/搜索定位不触发分页 | 当前真实会话只有 2 条消息，无 `has_more` 样本 |
| verification | `pass` | SDK focused 4 files/21 tests、full Web 91 files/381 tests；H5 focused 4 files/8 tests、466 assets、SDK boundary/Web typecheck/build:web、H5 typecheck 与 1131-module build | 既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 412px 真实聊天页 2 条消息，list client/scroll height 均 665、零 loading/sticky/overflow；干净重载后无新增 error | 长列表的 Network、位置补偿和日期视觉待自然样本 |
| protection | `pass` | `im28-phone` business worktree clean；SDK/H5 package scripts 未改；最终发布只执行 `build:web/sync:web` | 一次误用根 `npm test` 触发 compile-only core/RN/Web/Desktop，未 sync RN、未改 RN package，且未执行 `build:package:desktop:web` |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-long-history-data-gated`。分页业务事实只有 SDK 一个 owner，H5 没有建立第二套 DTO、缓存或 Gateway 状态机。

## W6.a6.20.25 Chat Audio Played And Auto-next Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 播放尝试即记录账号/会话本地 played，兼容 `localEx.im28SoundMessagePlayed`；自然结束才选择下一条 incoming 语音，手动停止不连播；RN caller 冻结 | 真实浏览器媒体样本 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一 `serverMsgID > clientMsgID`、localEx 判定与后续 type103 候选；不持有媒体、存储、SQLite 或 Gateway I/O | RN 生产 caller 需独立授权才能收敛 |
| Web adapter | `done-local/browser-readonly-pass` | route-scoped Provider 持有唯一 HTMLAudio、账号/会话 localStorage 和结束回调；incoming 未播放语音显示红点；真实 412px 群聊确认页面只有一个 audio runtime | 跨设备 played/read 明确不在本片 |
| fail-closed | `pass` | 空身份、无当前消息、outgoing、非语音、已播放、非法 URL、手动停止和播放失败均不推进；不伪装服务端 read | none |
| verification | `pass` | SDK focused 1/3、H5 focused 3/12；full verify 通过 466 assets、runtime boundary、SDK Web 89 files/371 tests、SDK/H5 typecheck 与 1124-module build | 既有 >500kB chunk warning |
| protection | `pass` | `im28-phone` clean；仅执行 `build:web/sync:web` | 未运行 RN/Desktop/build:all/`build:package:desktop:web` |

Closeout verdict: `shared-core-ready/web-consumed/rn-frozen; browser-media-data-gated`。本地播放状态与服务端消息已读严格分离，Web 未建立第二套候选选择规则。

## W6.a6.20.24 Chat Sender Avatar Mention Gesture Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | incoming 群消息仅在分组头像实际可见且成员快照存在时启用 500ms/8px 长按；桌面右键复用同一动作；本人、单聊、系统消息和未知成员 fail-closed | 编辑/引用态明确不消费提及；真实触屏手势样本 |
| composer owner | `clean/reused` | 头像只产生一次性 member request；Composer 复用 shared 显示名和既有 mention selection/document owner，追加 `@昵称 ` 或替换末尾未完成查询；不直接发送消息 | none |
| presentation | `done-local` | `ChatGroupSenderAvatar` 单独持有头像、资料 Link 和 fallback；长按后抑制点击导航，普通点击仍进入 `.23` 资料链；气泡、媒体、消息动作和多选结构不变 | Safari/Firefox/物理触屏 |
| verification | `pass` | focused 2 files/10 tests；full verify 为 SDK Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1122-module build；cleanup P0/P1 zero | 保留既有 >500kB chunk warning；仓库无 `scripts/check-convergence.sh` |
| browser | `pass-anonymous/data-gated` | dev 服务可访问，匿名 `/conversations` 正确回到手机号登录，1280px 零横向溢出 | 当前浏览器标签未继承 sessionStorage；真实 incoming 群头像长按与草稿投影未验收 |
| protected scope | `pass` | SDK business source 未因本片改动；RN worktree clean；只执行 `build:web/sync:web` | RN/Desktop/build:all/`build:package:desktop:web` 均未执行 |

## W6.a6.20.22 Group Member Restricted Profile Context Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 群设置预览与完整成员列表都只把稳定 `groupConversationID/backHref` 交给资料 route；资料页按 `allowMemberAddFriend === false && !self` 隐藏更多、资料字段、快捷动作、主操作和好友详情 | RN caller 继续冻结；群消息头像入口的禁言上下文另片处理 |
| identity/security | `pass/fail-closed` | Router state 不携带权限或昵称；页面必须从当前账号 `conversations -> groups -> groupMembers` 重新确认真实群会话、群和成员，并用 SDK `resolveIMGroupMemberDisplayName` 投影昵称 | 真实禁止互加群样本当前不存在 |
| presentation | `done-local` | 禁止互加显示“已是群成员”；加载期间不闪现动作，校验失败显示“群成员资料暂不可用”；本人和无群入口资料不受限制 | Safari/Firefox history-state 矩阵 |
| verification | `pass` | H5 focused 3 files/22 tests；full verify 为 SDK Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1120-module build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 真实允许互加群从设置预览进入 `donk二大爷` 资料，显示正确昵称与完整动作；412px 零横向溢出 | 禁止互加真实 UI、校验失败态和刷新/history 恢复仍 data-gated |
| protected scope | `pass` | SDK business source 未改；RN worktree clean；仅执行 `build:web/sync:web` | RN/Desktop/build:all/`build:package:desktop:web` 均未执行 |

## W6.a6.20.23 Chat Sender Avatar Profile Entry Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 只有收到的群消息且连续分组实际显示头像时提供资料入口；头像尺寸、图片 fallback、分组占位和气泡动作不变 | RN 长按头像 @ 成员是另一交互，不在本片 |
| route/owner | `clean/reused` | `buildChatGroupMemberProfileLocation` 只构造编码 user route、当前聊天 backHref 和稳定 groupConversationID；资料页继续唯一持有 `.22` 的群/成员/权限校验 | 群消息 profile 的 mute management context 另片且需 mutation 授权 |
| security | `pass` | 消息正文、昵称、角色、权限和群设置均不写入 Router state；空 conversation/sender identity 不生成链接 | none |
| verification | `pass` | focused 2 files/15 tests；full verify 为 SDK Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1120-module build；cleanup P0/P1 zero | 仓库没有 `scripts/check-convergence.sh` |
| browser | `pass-readonly/data-gated` | 真实群聊 412px 页面、路由和布局健康，零横向溢出；当前群只有系统创建消息，头像点击样本不可得 | 不发送测试消息；真实 incoming group message click/history 仍 data-gated |
| protected scope | `pass` | SDK source 未改；RN worktree clean；仅执行 `build:web/sync:web` | RN/Desktop/build:all/`build:package:desktop:web` 均未执行 |

## W6.a6.20.21 Group Settings Preview Presence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 设置页只观察 `buildChatSettingsMemberViews` 实际渲染的最多 10 名预览成员；完整成员页行为不变 | RN caller 继续冻结 |
| single owner | `shared-core-ready/web-consumed/rn-frozen` | `shouldShowGroupMemberPresence` 复用 SDK normal-mode helper，`useObservedUserPresence` 复用 `.20.19` presence facade；无第二 service/listener/cache | large/unknown 真实群样本 |
| presentation | `done-local/browser-pass` | 头像裁剪层外投影 RN 14px 底色边框与 8px success 绿点；名称、资料 route、邀请/移除入口不变 | Safari/Firefox 与实时上下线转换 |
| verification | `pass` | H5 focused 2 files/13 tests；full verify 为 SDK Web 88 files/368 tests、466 assets、runtime boundary、SDK/H5 typecheck、1119-module build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly` | 真实普通群设置页 3 名预览成员中 2 名明确在线；412px/390x844 均无横向溢出、绿点 14/8px、console warning/error 为 0 | 未制造状态变化或执行 mutation |
| protected scope | `pass` | SDK business source 未改；RN worktree clean；仅执行 `build:web/sync:web` | RN/Desktop/build:all/`build:package:desktop:web` 均未执行 |

## W6.a6.20.20 Group Member Presence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| shared group mode | `done-local` | `normalizeIMGroupMode/isIMNormalGroupMode` 统一 `1|2|normal|large`；joined-group Gateway/cache DTO 投影标准 mode，缺失/未知 fail-closed | RN caller 未切换 shared helper |
| H5 presence | `shared-core-ready/web-consumed/rn-frozen` | `useObservedUserPresence` 为页面所需用户建立单一 observation；只合并返回身份，离页释放，不写成员 DTO/SQLite | large 群真实样本、realtime 在线/离线转换 |
| presentation | `done-local/browser-pass` | 头像右下角 14px 底色边框 + 8px success 绿点；角色、昵称、ID、资料 route 保持原样 | Safari/Firefox 和物理触屏下拉 |
| verification | `pass` | SDK focused 3 files/16 tests；H5 view 1 file/4 tests；full verify 为 SDK Web 88 files/368 tests、466 assets、SDK/H5 typecheck、1119-module build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly` | 真实普通群 3 名成员中 1 个在线；412px/390x844 均零横向溢出、无页面错误，绿点 14x14 | 未制造上下线或执行 mutation |
| protected scope | `pass` | RN worktree clean；仅执行 `build:web/sync:web`；未运行 RN/Desktop/build:all/`build:package:desktop:web` | none |

## W6.a6.20.19 Friend Profile Presence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | `createIMUserPresenceSync` 持有 100 人分批、字段归一化、订阅 revision、账号过滤和 lifecycle clear；H5 只消费 `presence.observe` | RN `UserProfileScreen` 现有 OpenIM caller 保持冻结 |
| H5 parity | `done-local` | 好友资料导航栏显示在线/离线；黑名单文案优先；陌生人、自身和未知状态不伪造 presence | group-member restricted/mute context 不在本片 |
| persistence/lifecycle | `clean` | presence 仅在 runtime 内存；退出、切号、token 失效、被踢和 dispose 清除 subscriber；不推进 dataVersion、不写 SQLite | 断线重连真实事件仍需多账号样本 |
| verification | `pass` | SDK focused 2 files/7 tests、SDK Web full 87 files/366 tests、runtime boundary、SDK/H5 typecheck、H5 view 1 file/7 tests、466 assets、1115-module production build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly` | 已登录真实好友资料页展示“在线”；412px 与 390x844 均无横向溢出、导航栏居中，console warning/error 为 0 | 离线切换、断线重连与第二账号事件样本仍 gated |
| protected scope | `pass` | RN worktree clean；只执行 `build:web/sync:web`；未运行 RN/Desktop/build:all/`build:package:desktop:web` | none |

## W6.a6.20.18 Chat Link Action Surface Convergence Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| primary path | `clean/single-owner` | `ChatActionModalSurface` 唯一持有 body portal、InteractionModal、收发方向与 viewport clamp；普通消息和链接只提供预览/动作项 | none |
| link behavior | `done-local` | 普通点击仍复用 `_blank` browser port；500ms 长按/右键进入“打开/复制”两项共用层；新增 8px move cancel；copy success-only close 不变 | 真实链接样本、移动端触屏、Safari/Firefox |
| delete-or-register | `delete` | 旧 `.rn-chat-text-link-menu` JSX/CSS 全部删除；危险色从 `last-child` 改为显式 `.is-danger`，链接“复制”不会被误标红 | 无 compat path 需要登记 |
| verification | `pass` | focused H5 5 files/16 tests；full verify：466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1114-module Vite build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly/data-gated` | 412px 已登录聊天页普通消息共用层真实打开/关闭；200px/6 动作、URL 稳定、`scrollWidth=clientWidth=412` | cache 无链接消息；未发送测试链接或执行动作 |
| protected scope | `pass` | RN worktree clean；仅执行 SDK `build:web/sync:web`；未运行 RN/Desktop/build:all/`build:package:desktop:web` | none |

## W6.a6.20.17 Chat Message Action Modal Closeout (2026-08-13)

| gate | status | evidence | residual |
| :--- | :--- | :--- | :--- |
| RN interaction parity | `done-local/browser-pass` | `500ms` 长按、`8px` 移动取消、右键/键盘入口；全屏 24% blur 遮罩、原气泡预览、200px/40px 纵向动作菜单和 180ms 展开；已登录 412px 真实右键打开 | 触屏实机仍未取得 |
| layout/accessibility | `pass` | 收到靠左/发出靠右；动作数驱动 bottom clamp；超高预览截断；portal 挂到 body，预览 inert；Esc/backdrop 复用全局 InteractionModal | Safari backdrop-filter 仍属于浏览器矩阵 |
| business ownership | `unchanged/clean` | 引用/复制/编辑/多选/转发/表情收藏/删除回调原样复用；无 SDK、Gateway、SQLite、DTO 或 mutation 分支新增 | 所有真实 mutation 均未执行 |
| verification | `pass` | focused H5 4 files/13 tests；full verify：466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1113-module Vite build | 保留既有 >500kB chunk warning |
| browser | `pass-readonly` | 发出消息靠右，6 动作顺序正确且仅删除为危险色；遮罩关闭后 dialog=0、URL 不变、`scrollWidth=clientWidth=412` | 未执行任何菜单 mutation |
| protected scope | `pass` | RN worktree clean；未运行 RN/Desktop/build:all/`build:package:desktop:web` | none |

## W6.a6.20.16 Chat Text Link Actions Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared projection | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一 HTTP(S)/www 分段、RN 尾随标点规则和 www->HTTPS；core/rn/web/desktop 显式导出，H5 生产组件实际消费 | RN 现有 `splitMessageTextSegments/normalizeBrowserUrl` 保持冻结，未宣称 convergence |
| H5 interaction | `done-local` | 普通点击打开隔离新标签；500ms 长按/右键只显示“打开/复制”；复制保留 URL 原文；链接 pointer/context 事件阻止外层普通消息菜单 | 真实移动端长按、弹窗拦截和 Safari/Firefox |
| rich text compatibility | `pass-local` | 链接在预设表情 entity 之间的普通文本区间投影；无 copy owner 的 composer/摘要保持纯文本；DOM contract 锁定可访问标签 | 当前真实 cache 无链接消息，未取得运行态链接 DOM/菜单视觉 |
| structure | `clean` | shared 纯函数、H5 browser port、链接组件与 clipboard hook 分层；无第二 URL parser、页面 Gateway/SQL、fake-success、TODO/debug log；新增文件均 `<300` 行 | `ChatPage` 为既有 383 行页面，未在本片扩大 owner |
| verification | `green-local/data-gated` | SDK focused 3/3、H5 focused 10/10；full verify 含 466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 86 files/360 tests、1111-module build；412px 真实群聊 `scrollWidth=clientWidth=412`、console warning/error=0 | build 仅有既有 large-chunk warning；真实链接运行态 data-gated |
| freeze | `pass` | `im28-phone/src/**`、测试、App/native 零改动；仅构建/同步 Web package | RN/desktop build 与 `build:package:desktop:web` 未修改或执行 |

## W6.a6.20.15 Joined Group Row Actions Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN interaction parity | `done-local` | 群行支持 `300ms` 长按、移动超过 `8px` 取消、右键等价入口；菜单顺序为分享群名片、退出群聊、管理角色修改群名称，位置按动作数量翻转并限制在视口 | 当前真实账号返回空群列表，非空菜单视觉和触屏实机手势未取得运行态证据 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | 菜单只消费 `WebIMJoinedGroup.permissions`；分享/改名先调用 `conversations.openGroup` 获得 canonical Conversation；普通退群只调用 `groupLifecycle.leave({clearHistory})`，不复制 Gateway/SQL/角色数字 | RN `GroupRowActionMenu`、owner auto-transfer/quit 业务保持冻结；未宣称双端 convergence |
| owner quit semantics | `superseded-by-.149.71` | 群主长按退出改为 shared 完整成员同步、earliest-admin 双分支和同一 `groupLifecycle.leave`；不调用 owner-transfer route | 真实退群、Gateway 自动转移和第二账号回读未授权 |
| route reuse | `done-local` | 分享复用 `/settings/share-group-card`；改名复用 `/settings/profile?edit=name` 并继续执行原 capability 校验和 `groups.updateName`；没有新增业务 route owner | 真实分享、改名 mutation 未执行 |
| structure | `clean` | 纯 view helper、菜单/modal、群行手势和页面 orchestration 各自分层；无页面 Gateway/SQL/OpenIM、role magic、fake-success、TODO/debug log，触及文件均 `<300` 行 | 自动 convergence script 不存在 |
| verification | `green-local/data-gated` | focused 3 files/10 tests；full verify 包含 466 assets、runtime boundary、SDK/H5 typecheck、SDK Web 85 files/357 tests、1106-module build；diff-check 通过 | build 仅有既有 large-chunk warning；浏览器只证明已登录空群态 |
| freeze | `pass` | `im28-phone` clean；SDK 业务源码未改，只更新 consumer matrix；verify 仅运行 `build:web/sync:web` | RN/desktop build 与 `build:package:desktop:web` 未执行 |

## W6.a6.20.14 Group Owner Transfer Route Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN route parity | `done-local` | 新增 `/settings/manage/owner-transfer`；标题、搜索、角色优先分组、下拉刷新、成员选择与二次确认均由独立页面持有；管理首页只保留入口 | 真实非空候选、确认层视觉和成功返回需要可用群数据 |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 继续唯一持有群主权限、候选过滤、exactly-once Gateway、group/member 原子角色事务及权威刷新；H5 不复制角色或事务规则 | RN 现有转让链保持冻结，未宣称双端 convergence；未执行真实 mutation |
| H5 behavior | `done-local/fail-closed` | 管理员和群主页面共用 cache-first route data hook；搜索使用 shared 显示名，当前群主排除，管理员置顶，普通成员按拼音分组；`remote-only` 可见且不重放 | 当前浏览器实例受 SQLite 多标签互斥锁阻塞，登录态页面链未完成浏览器复验 |
| structure | `clean` | 管理首页旧群主 picker/action/成员加载已删除；新 route、view helper 与 shared hook 各有单一生产消费者链，无 compat 双轨、页面 Gateway/SQL、TODO/debug log 或 orphan owner | 自动 convergence script 在本仓库不存在 |
| verification | `green-local` | H5 focused 3 files/10 tests；full verify 含 SDK Web 85 files/357 tests、466 assets、boundary、SDK/H5 typecheck、1102-module build；diff-check 通过 | build 仅有既有 large-chunk warning |
| freeze | `pass` | `im28-phone` worktree clean；本片未改 SDK source，只由 verify 执行 `build:web/sync:web` | RN/desktop build 与 `build:package:desktop:web` 未执行 |

## W6.a6.20.13 Group Administrator Routes Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN route parity | `done-local` | 新增 `/settings/manage/admins` 管理员列表和 `/admins/add` 候选页；管理首页只保留入口；浏览器历史/刷新具有稳定 route | 当前账号目标群已不在会话 cache，非空列表视觉与真实返回链 data-gated |
| shared owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 唯一持有权限、普通成员候选、`IM_GROUP_ADMIN_LIMIT`、exactly-once set/cancel、群/成员缓存事务及 `local/remote-only`；H5 不复制上限 | RN 现有角色 mutation caller 保持冻结，未宣称双端 convergence |
| H5 behavior | `done-local/fail-closed` | 子路由 cache-first 恢复会话/群/成员，先同步群再同步成员；候选刷新会裁剪失效选择；错误或无权限时隐藏添加、搜索、候选和提交动作 | 未执行真实添加/移除管理员 mutation |
| structure | `clean` | 旧管理员添加/取消 modal 和 action 从 `GroupManagementPage` 删除；列表、添加 route 和 shared mutation 分层单一，无 compat 双轨、页面 Gateway/SQL、fake-success 或 orphan helper | 群主转让已由 `W6.a6.20.14` 独立 route 关闭 |
| verification | `green-local` | SDK focused 1 file/5 tests；H5 focused 1 file/4 tests；full verify 含 SDK Web 85 files/357 tests、466 assets、boundary、SDK/H5 typecheck、1099-module build；diff-check 通过 | build 仅有既有 large-chunk warning |
| browser/freeze | `pass-readonly/data-gated` | 412px 两个新 route 在目标群缺失时展示真实错误且动作 fail-closed，document/viewport 均 412px；`im28-phone` worktree clean | 未制造群数据；RN/desktop build 与 `build:package:desktop:web` 未执行 |

## W6.a6.20.12 Home Search Clear Control Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 搜索有值时显示 RN `xmark-circle` 清除按钮；空值隐藏；点击后清空输入、旧结果、分页和错误态并恢复搜索历史 | physical touch keyboard/Safari/Firefox |
| focus | `pass-chromium` | 清除后 `activeElement.type=search`，保持 RN TextInput 编辑态，避免移动端键盘因按钮获焦而收起 | iOS Safari virtual keyboard proof |
| structure | `clean` | `ConversationSearchInput` 只翻译 input/Enter/clear DOM 事件；页面仍是唯一搜索状态与 SDK orchestration owner；page/input/helper 为 376/53/287 行 | no shared SDK capability change |
| browser | `pass-readonly` | 已登录账号 412x786：`donk` 产生 2 行真实结果；清除后 row=0、历史恢复、按钮消失、输入 active；document/viewport 均 412px | no mutation executed |
| verification | `green-local` | focused H5 2 files/7 tests；final full verify 含 SDK Web 85 files/356 tests、466 assets、runtime boundary、SDK/H5 typecheck、1092-module build；diff-check 通过 | build 仅有既有 large-chunk warning |
| freeze | `pass` | 本片未修改 `im28-phone` 或 `im28-sdk/src`；仅按 H5 门禁执行 `build:web/sync:web` | RN/desktop build 与 `build:package:desktop:web` 未执行 |

## W6.a6.20.11 Home Search Highlight Parity Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 好友/群聊标题与副标题按 RN 规则执行 trim、大小写不敏感和多处命中品牌色；聊天记录汇总行保持不高亮 | 当前真实 cache 只有好友命中，无群结果样本 |
| ownership | `clean` | 搜索筛选/缓存仍由 SDK 持有；H5 helper 只切分展示文本，页面只渲染语义标签和 CSS color | RN caller 冻结，本片不产生 shared convergence 声明 |
| browser | `pass-readonly/data-gated` | 已登录账号 412x786：`donk` 两行好友各有一个 `rgb(123, 97, 255)` 命中；`123` 聊天记录行 `mark=0`；document/viewport 均 412px | 无真实群结果，未执行 mutation |
| verification | `green-local` | focused helper 5/5；full verify 含 SDK Web 85 files/356 tests、466 assets、runtime boundary、SDK/H5 typecheck、1091-module build；diff-check 通过 | build 仅有既有 large-chunk warning |
| freeze | `pass` | `im28-phone` worktree clean；SDK 源码零改动，只按 H5 门禁执行 `build:web/sync:web` | RN/desktop build 与 `build:package:desktop:web` 未执行 |

## W6.a6.20.10 Home Search Pagination And Stale Request Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared owner | `converged-owner-consumed` | 继续只消费 SDK `contacts/groups/conversations` cache 与 `messages.searchCached({ limit, offset })`；关键词、可见正文、删除/撤回过滤和结果分页仍由 shared message search owner 持有 | RN caller 冻结，本轮未改写或重新宣称 convergence |
| H5 orchestration | `done-local` | `/conversations/search` 对齐 RN 8 条聊天记录分页、同会话跨页计数/最远消息定位、输入变化 request generation、下拉重读与不重复写历史；好友/群聊仍按页面快照分区展示 | 当前真实缓存不足 8 条同关键词消息，分页按钮运行态 data-gated |
| structure | `clean` | H5 helper 只做 view projection/merge；无页面 SQL/Gateway、第二搜索条件 owner、fake-success、TODO/console 或 orphan helper；页面 348 行、helper 247 行 | full verify 后新增的 request-generation 纯函数由 focused/typecheck 覆盖 |
| browser | `pass-readonly/data-gated` | 已登录账号 412x786：缺省历史 `donk`，真实好友两行；`123` 命中聊天记录一行且可定位稳定消息；document/body/viewport 均 412px，下拉文案存在 | 无群命中、无 8 条以上同关键词消息，未触发真实查看更多手势；未执行任何 mutation |
| verification | `green-local` | focused helper 4/4；full verify 含 SDK Web 85 files/356 tests、466 assets、runtime boundary、SDK/H5 typecheck、1091-module build；最终 H5 typecheck/diff-check 通过 | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | `im28-phone` worktree clean；只运行 Web build/sync | RN/desktop build 未执行，`build:package:desktop:web` 未修改或执行 |

## W6.a6.20.9 Group Conversation Open Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared conversation owner | `shared-core-ready/web-consumed/rn-frozen` | `openIMGroupConversation` cache-first 解析群目标；缺少/失效会话 ID 时经 `getGroup -> getConversation` 获取真实 ID；严格校验群/会话身份，并在当前账号队列内保存 latest message 与 conversation | RN `fetchGroupConversation` 生产 caller 冻结，未执行 caller convergence |
| H5 consumers | `done-local` | “我的群聊”“共同群聊”“查找群聊”的已加入分支全部只调用 `conversations.openGroup`，按 SDK 返回的规范会话 ID 导航；删除页面本地 list/sync/find 双轨 | 群申请分支保持既有 owner；无真实非空群样本，未执行远端打开请求 |
| structure | `clean` | 规范 ID、Gateway DTO 映射、缓存写入、失效 ID fallback 与账号切换保护只存在于 SDK；H5 只持有 opening 状态、错误展示和 React Router 导航 | RN frozen path 已登记，未来需独立授权 convergence |
| browser | `pass-readonly/data-gated` | 已登录账号 `/contacts/groups`、两位联系人的 `/contacts/users/:userID/groups` 均为真实空态；页面无 console error | 当前账号没有已加入群或共同群，无法证明非空点击、Gateway fallback 与 chat route 视觉链 |
| verification | `green-local` | SDK focused sql.js 4/4；full verify 含 SDK Web 85 files/356 tests、466 assets、runtime boundary、SDK/H5 typecheck、1091-module build | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | `im28-phone` worktree clean；只发布 H5 generated package | RN/desktop build 未执行，`build:package:desktop:web` 未修改或执行 |

## W6.a6.20.8 Verification Unread Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared application owner | `shared-core-ready/web-consumed/rn-frozen` | friend facade 统一专用未读读取、非负整数归一化、明确 ID 保序去重和空集合 fail-closed；group facade 以审核第一页 `total` 读取当前账号待处理总数 | RN 现有 service/caller 冻结，未执行 caller convergence |
| H5 consumer | `done-local` | 通讯录入口与验证双 tab 共用单一 hook/角标；页面进入、通讯录下拉、好友单条已读成功为明确刷新点；incoming 未读申请资料入口先本地投影再调用 shared mutation，失败不阻断导航 | 当前真实账号计数为 0、申请均 outgoing/accepted，未取得 incoming 未读或非零群审核数据 |
| structure | `clean` | DTO/未读/审核 total 语义只在 SDK；H5 只持有并行读取、`0/99+` UI 和路由；无 Gateway/OpenAPI 直调、第二计数 owner、orphan wrapper 或 compat 暗桩 | RN frozen path 已登记，未来需单独授权 convergence |
| browser | `pass-readonly` | 412px 真实账号 `/contacts`、friend/group tabs、2 条 accepted 好友申请与群空态；申请行具备资料按钮，双页零横向溢出、console 0 | 未点击申请，未执行 mark-read/accept/reject mutation；dark/desktop/Safari/Firefox 未验收 |
| verification | `green-local` | SDK focused 2 files/15 tests；H5 badge 1/1；full verify 含 SDK Web 84 files/352 tests、466 assets、boundary、SDK/H5 typecheck、1091-module build | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | `im28-phone` worktree clean；仅执行 `build:web/sync:web` 并同步 H5 generated package | RN/desktop build 未执行，`build:package:desktop:web` 未修改或执行 |

## W6.a6.20.7 Personal Profile Avatar Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared profile owner | `shared-core-ready/web-consumed/rn-frozen` | `WebIMSync.profile.updateAvatar` 冻结当前账号并原子执行静态图片/10MB 校验、Web OSS 上传、avatar-only Gateway update 与响应身份校验；部分响应缺头像时保留已确认远端 URL | RN `ProfileScreen/uploadAvatar/updateSelfInfo` 保持冻结，未执行 caller convergence |
| H5 personal profile | `done-local` | `/me/profile` 恢复 RN 头像行、相册/拍照/取消和共享 512x512 JPEG crop；成功后只用 SDK 返回资料更新当前视图，失败保留裁剪层与可见错误 | 真实文件选择、OSS 上传、profile update、刷新回读与第二终端展示未授权 |
| structure | `clean` | `updateAvatar` 是个人资料唯一写入口；onboarding 的 `uploadAvatar -> memory draft -> final update` 是不同提交时序；旧 onboarding 专属 sheet/helper 已删除，来源 sheet、输入合同和 crop owner 仅一份 | RN consumer 继续登记为 frozen，不以多 runtime 编译替代 caller convergence |
| browser | `pass-readonly` | 已登录账号 412px `/me/profile` 显示头像行；来源层准确展示“从相册选一张/拍一张照片/取消”；input 为静态图片相册与 `capture=environment` 拍照；document/body 均 412px，无横向溢出；只打开并取消 | 未选择文件或触发任何上传/资料 mutation；未取得 console/light/dark/desktop proof |
| verification | `green-local` | SDK focused 1 file/8 tests；H5 focused 3 files/5 tests；full verify 含 SDK Web 84 files/349 tests、466 assets、SDK/H5 typecheck、1089-module build；runtime boundary 与 diff-check 通过 | build 仅有既有 large-chunk warning；仓库无 `scripts/check-convergence.sh` |
| RN freeze | `pass` | `im28-phone` worktree clean；只执行 `build:web/sync:web` 并同步 H5 generated package | RN package 未重建，`build:package:desktop:web` 未修改或执行 |

## W6.a6.20.6 Onboarding Avatar Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared profile owner | `shared-core-ready/web-consumed/rn-frozen` | `WebIMSync.profile.uploadAvatar/update` 统一 JPEG/PNG/WEBP、10MB、远端 HTTP(S) URL、上传前后账号一致性和 update 响应身份；复用生产 Web OSS adapter | RN `CompleteProfileScreen/uploadAvatar/updateSelfInfo` 保持冻结，未执行 caller convergence |
| H5 onboarding | `done-local` | 完善资料头像恢复 RN 相册/拍照/取消 sheet；群头像裁剪抽为单一共享 512x512 JPEG Canvas owner；上传成功只写内存草稿，最终“完成”才与 nickname/gender/bio 一起提交 `avatar_url` | 有效 onboarding marker 只来自新账号注册；当前已登录账号不得伪造 marker |
| browser | `guard-only/data-gated` | 已登录账号直达 `/auth/complete-profile` 必须按 guard 返回会话页；未制造注册、上传或资料 mutation | 真实新账号来源 sheet、文件选择、裁剪、OSS 上传、最终 update、移动端/桌面 light/dark/history 需获批可抛弃账号 |
| verification | `green-local` | focused H5 4 files/10 tests；full verify 含 SDK Web 84 files/347 tests、466 assets、SDK/H5 typecheck、1089-module build；runtime boundary 与 diff-check 通过 | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | `im28-phone` worktree clean；只执行 `build:web/sync:web` 并同步 H5 generated package | RN package 未重建，desktop scripts 未改 |

## W6.a6.20.5 Group Server Search Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared search owner | `shared-core-ready/web-consumed/rn-frozen` | Gateway 搜索 wrapper 不再丢失 `source_type`；shared facade 统一 trim、认证、稳定 ID 去重和 `pending > joined > available`，并复用唯一已加入群 owner 提供真实会话 ID | RN `CreateGroupServerSearchScreen/searchGroupsByID/joinGroupByID` 保持冻结，未执行 caller convergence |
| H5 route | `done-local` | `/groups/create` 恢复 RN“查找群聊”入口；`/groups/search` 支持防抖、loading/error/empty、三态操作及返回时保留已选好友；available 复用既有申请页和 `source_type=search` | 无真实可加入结果，未触发申请 mutation |
| browser | `pass-readonly/data-gated` | 412px 认证账号验证入口、独立 route、`donk` 与已知旧群 ID 的真实空结果、返回后已选好友保持、零横向溢出 | 结果行/已加入跳转/待审核禁用/申请成功与第二账号 list-back 缺少后端数据证明 |
| verification | `green-local` | SDK focused 2 files/9 tests；H5 focused 3 files/7 tests；full verify 含 SDK Web 84 files/345 tests、466 assets、typecheck、1084-module build | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | `im28-phone/src/**`、测试、App/native 零改动；仅运行 `build:web/sync:web` 并同步 H5 generated package | RN package 未重建，desktop scripts 未改 |

## W6.a6.20.4 Chat Composer Pending Attachment Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared submission plan | `shared-core-ready/web-consumed/rn-frozen` | `shouldStageIMComposerMedia/createIMComposerSubmissionPlan` 固定已有草稿+单媒体待发送、编辑态附件互斥、`media -> file -> text` 串行步骤 | RN 现有 composer 编排保持冻结，需独立授权后才能切换 shared consumer |
| H5 pending attachment | `done-local` | 文件选择后不立即上传，展示名称/类别/大小/移除；待发送附件可单独提交，媒体/文件与文本/@/引用在一个 operation 中顺序执行，前序失败阻断后续 | 真实文件/媒体上传与带草稿组合消息未执行 |
| browser | `pass-no-send` | 412x820 单聊选择仓库内 `package.json` 后显示 `文件 · 924 B`、发送按钮可见、无横向溢出；移除后恢复加号，零 console error | 未点击发送，未产生 Gateway/OSS/SQLite outgoing mutation |
| verification | `green-local` | SDK focused 3/3；H5 focused 3 files/10 tests；full verify 含 SDK Web 84 files/343 tests、466 assets、typecheck、1081-module build | build 仅有既有 large-chunk warning |
| RN freeze | `pass` | 未修改 `im28-phone/src/**`、测试、App/native；只执行 `build:web/sync:web` 并同步 H5 generated package | RN package 未重建 |

## W6.a6.20.3 Chat Composer Camera And RTC Entries Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| camera platform | `done-local` | 独立单张 `image/* + capture=environment` input；结果复用 album 校验与 `messages.sendImage` 上传/状态链；取消零错误 | 未点击拍照，未请求 camera permission，桌面浏览器按平台退化为文件选择 |
| RTC composition | `done-local/shared-owner-consumed` | 单聊显示 RN 同顺序入口，二次选择复用全局 `CallTypeActionSheet -> WebIMCallProvider -> SDK calls`；群聊隐藏 | 未选择语音/视频，未发起 Gateway/LiveKit/媒体权限；真实群页当前账号 data-gated |
| owner convergence | `pass` | 联系人与聊天共用一个 H5 通话方式弹层；删除旧 `ContactCallSheet`；图片、鉴权、信令、媒体状态均无第二 owner | RN business remains frozen |
| browser | `pass-readonly` | 412x820 真实单聊证明 `相册/拍照/音视频通话/文件/名片` 顺序、通话二选一/取消、camera DOM contract、`scrollWidth=clientWidth=412`、零 console warning/error | camera/file chooser 与 final call 均未触发 |
| verification | `green-local` | H5 focused 3 files/10 tests、typecheck；full verify 含 SDK Web 83 files/340 tests、466 assets、1078-module build；RN worktree clean | build 仅有既有 large-chunk warning |

## W6.a6.20.2 Chat Composer Card Send Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared message owner | `shared-core-ready/web-consumed/rn-frozen` | `messages.sendCard` 统一 user/group card 校验、type108 body、optimistic row、Gateway 回显、SQLite 收敛和 persisted retry | RN 现有消息发送 consumer 冻结；真实失败重试未执行 |
| compatibility guard | `pass` | type108 新增失败重试后，隐藏发送人转发仍按原矩阵拒绝名片；全量 guard 回归证明零 optimistic/network 副作用 | 普通服务端转发仍按既有能力运行 |
| H5 UI | `done-local` | 附件面板增加 RN 名片资产；用户/群 tab、搜索、单选、显式发送；单聊排除本人和当前对端；页面不构造 Gateway body | 拍照、音视频通话入口已由 `.20.3` 关闭；真实权限/上传/呼叫仍按授权门验收 |
| browser | `pass-no-send` | 412px 真实单聊仅展示第三位好友；群 tab 真实空态；选中后按钮解锁；`scrollWidth=clientWidth=412`；安全关闭并返回会话列表 | 未点击发送，未修改远端或账号数据 |
| verification | `green-local` | SDK focused 11/11、Web 83 files/340 tests；H5 focused 5/5、466 assets/typecheck/1074-module build；RN worktree clean | build 仅有既有 large-chunk warning |

## W6.a6.20.1 Forgot Password Methods Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| RN parity | `done-local` | 账号登录“忘记密码”打开手机号/邮箱/客服三分支 sheet；不再展示“接口不存在”错误替代交互 | 真实客服渠道由产品配置决定 |
| H5 platform/UI | `done-local` | 复用全局原生 `InteractionModal`；切 route 前关闭 sheet，route change 再兜底清理；客服说明不提交请求 | 无忘记密码 API，符合 RN 当前 fallback |
| browser | `pass-readonly` | 412px 三分支、单 dialog、phone/email path、零溢出；退出 donk 后使用 `15555555551/666666` 恢复 | 未请求验证码、修改密码或资料 |
| verification | `green-local` | focused 2 files/6 tests；full verify 含 SDK Web 82 files/337 tests、466 assets/typecheck、1071-module build；RN worktree clean | build 仅有既有 large-chunk warning |
| non-applicable | `web-not-applicable` | RN 网络设置是原生 HTTP/OpenIM HTTP/SOCKS proxy 注入；浏览器无等价 per-app proxy owner | Electron/Desktop 可在后续独立 platform adapter 实现 |

## W6.a6.18.3.19 QR Code In-App Share Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| target/source | `shared-core-ready/web-consumed/rn-frozen` | `forward-target-source` 统一普通转发和二维码分享的好友/群 cache-first 加载、投影与真实会话解析；SDK/RN 源码未改 | RN selector consumer frozen |
| H5 platform/UI | `done-local` | 个人/群稳定 share route；对齐 RN `cardShare` 好友/群 tab、搜索、跨 Tab 多选和确认；确认后才从 shared payload 生成 320x320 PNG 并调用 `messageBroadcast.sendImage` | 真实上传/发送与可选附言当前 RN UI 已注释，不新增 Web-only 路径 |
| authenticated browser | `pass-no-send` | `.20.141` 真实 2 好友+2 群聊；群 ALL=2、跨 Tab 保留、好友 ALL=4、CTA enabled、取消返回、412/412 | 群二维码应用内最终分享仍未点击 |
| verification | `green-local` | H5 focused 6 files/13 tests；full verify 含 SDK Web 82 files/337 tests、466 assets/typecheck、1070-module build；RN worktree clean | second-account realtime/list-back only |

## W6.a6.18.3.18 Group QR Code Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared payload/source | `shared-core-ready/web-consumed/rn-frozen` | `buildIM28GroupQRCodePayload` 统一 groupCard；群会话/cache/sync 精确匹配，单聊和缺失群 fail-closed；无页面 Gateway 请求 | RN helper/page consumer frozen |
| H5 platform/UI | `done-local` | 群资料增加 `/settings/qrcode`；个人/群共用 `QRCodeDisplay`、Canvas、PNG、Web Share 与异步 cleanup；扫码返回严格绑定同一路由 | 应用内发送、真实下载/系统分享 |
| authenticated browser | `pass-real` | `.20.139` 使用 canonical conversation 恢复 `donk的群聊 / 97524759106`；412px Canvas 268x268、零溢出并返回同一群资料 | 下载/Web Share/扫码/应用内发送未执行 |
| verification | `green-local` | focused 5 files/13 tests；full verify 含 SDK Web 82 files/337 tests、466 assets/typecheck、1067-module build；RN worktree clean | valid group account、external browser matrix only |

## W6.a6.18.3.17 Personal QR Code Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared payload/profile | `shared-core-ready/web-consumed/rn-frozen` | `buildIM28UserQRCodePayload` 统一用户码；`profile.getCurrent` 提供真实昵称/头像/ID；页面不复制协议或资料 DTO | RN helper/page consumer frozen |
| H5 platform/UI | `done-local` | `/me/qrcode` React Router lazy route；Canvas 高纠错二维码、居中头像 fallback、PNG 下载与文件 Web Share；渲染成功前导出 fail-closed | 真实系统下载/分享弹窗、跨浏览器文件分享 |
| authenticated browser | `pass-readonly` | 真实账号从 `/me`、`/me/profile`、`/scan` 三入口可达；412x786 与 1280x800 完整二维码、零横向溢出 | 未点击下载/分享，未请求相机或相册 |
| verification | `green-local` | H5 focused 5/5；full verify 含 SDK Web 82 files/337 tests、466 assets、typecheck、1064-module production build；RN worktree clean | 外部下载/分享/browser matrix only |

## W6.a6.18.3.16 QR Scanner Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared QR contract | `shared-core-ready/web-consumed/rn-frozen` | myCard/groupCard JSON、im28 URL、legacy user JSON、source/type/encoding fail-closed；public group/get + qrcode apply facade | RN helper/NativeModule consumer frozen |
| H5 platform/UI | `done-local` | 首页扫一扫；`/scan` dynamic ZXing；user profile/source propagation；`/groups/:groupID/apply`；click-only permission、stop/late-permission cleanup | physical camera、album file、real recognized QR、Safari/Firefox |
| authenticated browser | `pass-readonly` | 412x786 首页菜单与扫码首屏；412/412 无横向溢出；未触发权限；历史群 ID 真实返回“资源不存在”而非假资料 | known valid public group、real apply/list-back |
| verification | `green-local` | SDK QR+group application 9/9、Web 82 files/337 tests、build:web/sync:web；H5 focused 7/7、typecheck、1031-module build；RN status clean | external permission/recognition/mutation only |

## W6.a6.18.3.15.2 Voice Broadcast Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared audio broadcast | `shared-core-ready/web-consumed/rn-frozen` | `prepareWebIMAudioUpload` 统一 audio MIME、1–60 秒、size/body；整批 upload once + batch-send once；沿用 partial/cache owner | real recorder/upload/send；RN consumer frozen |
| H5 recorder/UI | `done-local` | 直接复用聊天 recorder/hook/gesture/CSS owner；2 秒、60 秒、上滑 56px、permission-await 与 route cleanup | physical hold、permission、audio playback、Safari/Firefox |
| authenticated browser | `pass-readonly` | 412x786 compose 语音/键盘模式切换，“按住说话”可见；未 pointer-down | 未录音、未上传、未发送 |
| verification | `green-local` | SDK voice focused 9/9、全量 82 files/335 tests、build:web/sync:web；H5 recorder 6/6、466 assets、typecheck、797-module build；RN status clean | external recorder/send/browser matrix only |

## W6.a6.18.3.15.1 Media Broadcast Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared media broadcast | `shared-core-ready/web-consumed/rn-frozen` | image/video/file 复用普通发送 MIME/size/duration/dimension/body；整批 upload once + batch-send once；上传失败零 Gateway；切号 fail-closed；逐目标/cache 复用文本 owner | voice broadcast；RN consumer frozen；real send/realtime/list-back |
| H5 compose | `done-local` | RN 资产图片/视频/文件入口；复用聊天选择校验和 video metadata；页面级可回收预览；只调用 `sync.messageBroadcast` | file chooser/真实上传、physical touch、Safari/Firefox |
| authenticated browser | `pass-readonly` | 412x786 真实好友进入 compose；三媒体入口可见；surface 412/412 无横向溢出；composer 123px；console error=0 | 未选择文件、未上传、未发送 |
| verification | `green-local` | SDK media focused 6/6、全量 82 files/334 tests、build:web/sync:web；H5 media helpers 8/8、466 assets、typecheck、796-module build；RN status clean | external upload/send/browser matrix only |

语音群发需要复用 shared `message-audio-send` 的 1–60 秒和 body owner，但录音权限、MediaRecorder、按住说话交互属于 Web adapter；二维码扫描继续保持独立浏览器 platform slice。

## W6.a6.18.3.15 Text Broadcast Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared broadcast | `shared-core-ready/web-consumed/rn-frozen` | 1–50、trim/保序去重、stable batch/client IDs、one batch-send、逐目标 sent/failed/unknown、真实会话校验和 success-only message/conversation transaction | RN consumer frozen；real partial/result/realtime/list-back |
| H5 route/UI | `done-local` | 会话/通讯录共享入口；`/broadcast/select -> /broadcast/compose`；好友/群 cache-first、搜索/全选/上限、text draft、逐目标计数；Router state 仅稳定 ID | media broadcast、physical touch、Safari/Firefox |
| authenticated browser | `pass-readonly` | 412x786 下真实 2 好友；选择一人、进入 compose、空文本 disabled、填写后 enabled、退出回 conversations；scrollWidth=innerWidth；console warning/error=0 | 未点击发送，未修改账号或远端数据 |
| verification | `green-local` | SDK real sql.js 3/3、全量 82 files/331 tests、typecheck:web/build:web/sync:web；H5 route/view 4/4、466 assets、typecheck、793-module build；生产 route 200 | external send/browser matrix only |

媒体群发没有以临时 Blob URL 或页面 OSS 调用补齐；后续 `.15.1` 必须复用 shared media upload/body/checkpoint 状态机。扫码依赖浏览器摄像头、HTTPS、permission 和二维码解析 port，保持另一独立切片。

## W6.a6.18.3.14 Group Creation Closeout (2026-08-13)

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| residual inventory | `refreshed` | RN Screen/production caller、H5 route/page 与 active ledger 交叉过滤；外部验收门和平台专属项不重复计为开发缺口 | inventory remains living SSOT |
| shared creation | `shared-core-ready/web-consumed/rn-frozen` | 2–998、trim/去重/本人拒绝、默认群名、one Gateway write、strict group/conversation IDs、群/会话原子事务和 `remote-only` 防重放 | RN consumer frozen；real create/realtime/second-account/list-back |
| H5 route/UI | `done-local` | `/groups/create`、cache-first 好友、五列选择/搜索/上限/返回来源、会话与通讯录共享更多入口；只进入真实 conversation ID | authenticated non-empty read-only visual、physical touch、Safari/Firefox、real create |
| verification | `green-local` | SDK creation 4/4、creation+lifecycle 10/10、typecheck:web；H5 creation+lifecycle view 6/6、typecheck、build 784 modules；RN status clean | full verify and external mutation smoke |

## W6.a6.18.3.13.6 Closeout (2026-08-13)

| gate | verdict | evidence | residual |
| :--- | :--- | :--- | :--- |
| SDK shared owner | `pass-local` | `createIMGroupLifecycleSync`；leave/dismiss preflight、one Gateway write、strict group identity、group-domain transaction/rollback、`local\|remote-only`；群管理 related 27/27 | real leave/dismiss + server-denial + second-account realtime/list-back |
| H5 consumer | `pass-local` | 群设置页只消费 `permissions.canQuitGroup/canDismissGroup` 与 `sync.groupLifecycle`；native dialog、remote-only fail-visible/lock；focused 12/12 + typecheck/build | real owner/member group confirmation visual and final result |
| browser read-only | `pass-data-gated` | current account conversations route healthy、console blocking error=0；stale group deep link fail-visible | current account only has two single chats, so group action/modal visual unavailable without fabricating data |
| RN freeze | `pass` | `im28-phone` worktree clean；未运行 `build:rn/sync:rn/build:all` | RN consumer convergence requires separate authorization |

## W6.a6.18.3.13.5 Closeout (2026-08-13)

| gate | verdict | evidence | residual |
| :--- | :--- | :--- | :--- |
| SDK shared owner | `pass-local` | `createIMGroupManagementSync`；field permission、exactly-once、strict group/member identity、preserve-raw、`local\|remote-only`；focused 28/28 | real toggle/mute + server-denial + second-account realtime/list-back |
| H5 consumer | `pass-local` | `/settings/manage`、`/manage/mute`、`/manage/speech-frequency` 只消费 `sync.groupManagement`；focused 14/14 + typecheck/build | authenticated group sample unavailable after current account cache changed |
| browser read-only | `pass-data-gated` | three deep links resolve；missing-group fail-visible；412px `scrollWidth=innerWidth`；console error=0；no mutation executed | real group values、confirmation visual、mobile/Safari/Firefox |
| RN freeze | `pass` | `im28-phone` worktree clean；未运行 `build:rn/sync:rn/build:all` | RN consumer convergence requires separate authorization |
- blockers: `W5.a3 browser matrix remains blocked-environment；destructive/send/edit/delete/clear and real dual-account RTC flows require explicit authorization`
- gate_state: `W6 group-profile compatibility exit converged/local；真实群资料/公告写入与第二账号 realtime/list-back 未授权；clear-history、archive and incoming-call prior gates remain unchanged`
- latest_interaction_evidence: `2026-08-13 H5 interaction closeout: components/interaction 单一 owner 提供 route main-only、realtime tail-message、TabBar selected 和 native dialog；prefers-reduced-motion fail-quiet；ConversationDeleteSheet 成为首个 modal consumer；H5 typecheck/build、466 assets、390x844 zero-overflow、authenticated tab route/zero-console passed；空账号无会话，真实 delete-sheet/message-entry visual remains data-gated；SDK/RN/build:package:desktop:web untouched`
- latest_group_introduction_evidence: `2026-08-12 group-introduction closeout: SDK 74 files/287 tests + all-runtime typecheck/boundary、build:rn/build:web；RN tsc + openIMService 128/128；H5 full verify，SDK Web 71 files/282 tests、466 assets/typecheck/743-module production build；authenticated real owner/admin group opened 500-char editor and cancelled，567px zero-overflow/zero-console；no update/type1521/list-back；build:package:desktop:web untouched`
- latest_evidence: `2026-08-12 group-announcement convergence closeout: SDK Web 73 files/290 tests including real sql.js publish/read/realtime 8/8、all-runtime typecheck/boundary、build:rn/build:web；RN tsc + announcement/detail/openIMService 146/146；H5 full verify、466 assets、748-module production build；authenticated owner group showed forced read-only detail and editor/publish-confirm cancel at 567px with zero overflow；no update/send/read-mark/type1519/list-back；build:package:desktop:web untouched`
- latest_group_profile_compat_evidence: `2026-08-12 combined group-profile compatibility exit: zero RN/H5 combined production callers；RN request type is a mutually-exclusive single-field union；Gateway/OpenIM fallback and unused adapters removed；SDK all-runtime typecheck/boundary + group-profile/announcement 7/7；RN tsc + openIMService 128/128；H5 typecheck + related view 12/12；no real update/send/read/list-back；build:package:desktop:web untouched`
- latest_group_management_audit_evidence: `2026-08-12 read-only caller/owner trace: 8 mutation capabilities across invite/remove/admin/settings/mute/transfer/leave/dismiss；SDK transport exists but shared mutation owner absent；H5 caller count 0；RN invite may replay after post-write sync failure and five domains catch arbitrary Gateway errors then call OpenIM；no source/runtime mutation, no real write, build:package:desktop:web untouched`
- latest_group_management_permission_evidence: `2026-08-12 neutral resolveIMGroupManagementPermissions + WebIMJoinedGroup.permissions；SDK all-runtime typecheck/boundary + 11/11；RN tsc + helper 29/29；H5 full verify SDK Web 74/293、466 assets、749-module build plus focused 18/18；zero production owner/admin permission recomputation in H5 chat/conversation actions；no real mutation；build:package:desktop:web untouched`
- latest_rn_freeze_evidence: `2026-08-12 RN 12 个 tracked 业务文件与 packages/im-sdk 恢复 HEAD、3 个新增 composition 文件及其生成产物移除；im28-phone 整仓 worktree clean，npx tsc --noEmit 通过；H5/Web 后续只 build:web/sync:web，不改 RN 业务源码或 RN 本地 SDK 包`
- latest_group_member_removal_evidence: `2026-08-12 shared removeIMGroupMembers/createIMGroupMentionSync.removeMembers 为 Web owner；stable-ID 去重、角色目标限制、exactly-once Gateway write、group/member transaction、authoritative|local|remote-only；H5 React Router 页面消费，RN kickGroupMembers 保持冻结基线且不是 shared consumer；真实移除未执行，build:package:desktop:web 未修改或执行`
- latest_group_member_invitation_evidence: `2026-08-12 新 OpenAPI requester_user_ids + data.list 已进入 Gateway facade；shared inviteIMGroupMembers/createIMGroupMentionSync.inviteMembers 按 join_approval_required 选择 application|direct，好友 allow_group_invite fail-closed、exactly-once、strict response、authoritative|local|remote-only；H5 /settings/members/invite 消费，SDK 17/17、H5 10/10/typecheck/build；真实邀请未执行，RN worktree clean，build:package:desktop:web 未修改或执行`
- latest_group_admin_owner_evidence: `2026-08-13 shared set/cancel admins + transfer owner 持有 owner/target/admin-limit 校验、exactly-once Gateway、group/member 原子事务、权限降级和独立权威刷新；候选过滤也归 SDK；H5 /settings/manage 只持有 React Router/list/picker/native dialog；SDK related 16/16 + new 4/4、build:web/typecheck；H5 focused 11/11 + typecheck/build；未执行真实 mutation，im28-phone 零改动，build:package:desktop:web 未修改或执行`
- latest_group_card_evidence: `2026-08-12 group-card closeout: SDK contact-actions 12/12、RN/Web typecheck、build:rn/build:web；RN tsc + 43 focused；H5 focused 9/9、typecheck/build；authenticated real group showed entry, 7 real friend targets, search/single-select/cancel and 480px no-overflow；no share/send mutation；build:package:desktop:web untouched`
- latest_group_profile_evidence: `2026-08-12 group-profile-name closeout: SDK joined-group 6/6、all-runtime typecheck/boundary、build:rn/build:web；RN tsc + openIMService 126/126 + group UI 5/5；H5 focused 10/10 + full verify，SDK Web 70/278、466 assets/typecheck/production build；authenticated real group opened profile/name editor and cancelled with 567px no-overflow/zero console error；no update/copy mutation；build:package:desktop:web untouched`
- latest_group_avatar_evidence: `2026-08-12 group-avatar closeout: SDK 73 files/285 tests + all-runtime typecheck/boundary、build:rn/build:web；RN openIMService 127/127；H5 crop/profile 4/4、typecheck/production build；authenticated real group opened local 360px circular crop preview at 567x786, image decode/confirm readiness/zero-overflow/zero-console passed then cancelled；no upload/update mutation；build:package:desktop:web untouched`

## W6.a6.18.3.13 Group Management Mutation Contract Audit

| capability | state | frozen contract |
| :--- | :--- | :--- |
| caller/owner inventory | `done-read-only` | RN production caller 已覆盖邀请、移除、管理员、设置/mute、群主转让、退群/解散；H5 mutation caller 为 0；SDK 目前只有 Gateway transport |
| duplicate-write risk | `confirmed` | invite 的 post-write member sync 失败可进入 OpenIM fallback；remove/admin/transfer/leave/dismiss 对任意 Gateway error 回退第二次写；必须改为 one action -> one remote write |
| invite semantic gap | `resolved-by-openapi` | `join_approval_required=true` 走批量 `/group/application/invite`，false 走 `/group/member/invite`；shared owner 严格校验申请列表或群回包 |
| execution split | `frozen` | permission projection -> member removal -> invite contract/core -> admin/owner -> settings/mute -> destructive lifecycle；每片最多 3 个 operation |

本切片只读审计并写入 `docs/runtime-contracts/group-management-mutations.md`，没有执行或实现任何群管理 mutation，也未修改 SDK/RN/H5 运行代码。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.13.1 Shared Group Management Permissions

| capability | state | frozen contract |
| :--- | :--- | :--- |
| canonical owner | `shared-core-ready/web-consumed/rn-frozen` | SDK resolver 服务 Web；RN 保持现有权限实现，不宣称跨端唯一 owner |
| RN consumer | `frozen/not-consumed` | `getGroupPermissions(currentMember, group)` 已恢复当前 RN 基线，本任务不得改动 |
| H5 consumer | `pass-local` | `WebIMJoinedGroup.permissions` 驱动群资料、简介、自动删除、消息/会话全员清理 presentation；页面不读 raw payload、不按角色重算 |
| verification | `green` | SDK all-runtime + 11 tests；RN tsc + 29 tests；H5 full verify 74/293、466 assets、749 modules + focused 18 tests |

本切片只有只读权限投影和 consumer 收敛，没有新增操作按钮、调用 Gateway mutation 或写入 SQLite。测试 fixture 也调用 production resolver，不维护第二份角色表。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.13.2 Shared Group Member Removal

| capability | state | frozen contract |
| :--- | :--- | :--- |
| canonical owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一 Web stable-ID 去重、目标限制、exactly-once Gateway remove、群资料与成员事务、后置权威刷新 |
| RN consumer | `frozen/not-consumed` | `openIMService.kickGroupMembers`、Gateway/OpenIM 兼容与事件投影保持当前 RN 基线 |
| H5 consumer | `pass-local/read-only-proof` | React Router 成员选择页复用 shared permission/candidate/display resolver；搜索、选择、确认属于 presentation；`remote-only` 阻止再次提交 |
| partial success | `fail-visible` | 远端成功且本地提交失败后只允许权威 refresh；refresh 仍失败返回 `remote-only`，不得自动重放远端删除 |
| acceptance | `web-local-green/rn-source-clean/external-gated` | shared/H5 自动回归；RN 只验证源码零差异和 package 兼容；真实移除、第二账号 realtime/list-back 仍需显式批准 |

本切片没有执行真实群成员移除。浏览器验收仅允许打开候选页、搜索、选择并取消确认；不得点击最终“移除”。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.13.3 Shared Group Member Invitation

| capability | state | frozen contract |
| :--- | :--- | :--- |
| canonical owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一好友/成员/权限 preflight、审核分支、exactly-once Gateway write、严格响应和后置权威刷新 |
| approval branch | `resolved` | `join_approval_required=true` 批量创建 invite applications；false 批量直接入群；审核开关缺失 fail-closed |
| H5 consumer | `pass-local/no-real-write` | `/settings/members/invite` 只持有好友搜索、选择、验证消息和反馈，候选只接受 `allowGroupInvite=true` |
| RN consumer | `frozen/not-consumed` | RN `inviteUsersToGroup`、Gateway/OpenIM fallback 与 UI/event 投影保持当前业务基线 |
| partial success | `fail-visible` | 远端成功后的群 cache/成员 refresh 失败返回 `local|remote-only`，调用方不得自动重放邀请 |
| acceptance | `web-local-green/external-gated` | SDK 17/17、H5 10/10/typecheck/build、dev-pc 运行；真实邀请与第二账号 application/member realtime/list-back 未执行 |

本切片未点击最终邀请，不创建申请、不直接加群、不发送验证消息。仅执行 `build:web/sync:web`，未运行 RN 或 Desktop 发布脚本；`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.13.4 Shared Group Admin And Owner

| capability | state | frozen contract |
| :--- | :--- | :--- |
| canonical owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 统一 owner capability、目标角色、管理员上限、exactly-once、原子角色事务与独立权威刷新 |
| H5 consumer | `pass-local/no-real-write` | `/settings/manage` 只持有列表、选择、确认与反馈；候选过滤调用 shared helper，三种提交只调用 `groupMembers` facade |
| RN consumer | `frozen/not-consumed` | RN `updateGroupMemberRole/transferGroupOwner` 与页面事件链保持现有业务基线，本切片零修改 |
| partial success | `fail-visible` | 远端成功后本地/刷新失败返回 `remote-only|local`，禁止重放 set/cancel/transfer；转让后缺失权限按 member fail-closed |
| acceptance | `web-local-green/external-gated` | SDK 16/16 + 4/4、H5 11/11/typecheck/build；真实角色变更与第二账号 realtime/list-back 未执行 |

本切片没有确认最终管理员或群主操作。只执行 `build:web/sync:web`，未运行 RN/Desktop 构建或同步；`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.12 Group Profile Combined Compatibility Exit

| capability | state | frozen contract |
| :--- | :--- | :--- |
| caller inventory | `pass` | RN 4 个 production caller 均为 name/avatar/introduction 单字段；H5 分别调用 `groups.updateName/updateAvatar/updateIntroduction`，公告调用专属 facade；组合 caller 为 0 |
| compatibility exit | `converged/local` | `UpdateGroupInfoRequest` 是互斥单字段 union；运行时拒绝组合和公告参数；旧 Gateway helper、OpenIM adapter method 与 `setGroupInfo` fallback 已删除 |
| behavior preservation | `pass-local` | RN 页面、选图/裁剪/上传、shared 成功后的 group/conversation cache 与事件投影未改；H5 无源代码改动 |
| verification | `green` | SDK all-runtime typecheck/boundary + 7 shared tests；RN tsc + 128 service tests；H5 typecheck + 12 related view tests；无真实 mutation |

本切片只删除无生产消费者的兼容成功路径，没有调用 `/v1/group/update`、发送公告消息或写入 SQLite。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.11 Shared Group Announcement

| capability | state | frozen contract |
| :--- | :--- | :--- |
| shared mutation owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 持有 Web 非空 trim/1000、权限、Gateway 回包、groups merge、`update -> type101` 顺序和部分成功 |
| read/realtime owner | `converged/local` | mark 实际展示版本后必须复查权威 status；缺失 `is_read` fail-visible；type1519 只按结构化事件更新已有群 cache，发布者已读、其他成员未读、重复事件幂等 |
| RN/Web consumers | `web-pass/rn-frozen` | H5 只持有 React Router、表单、确认层、聊天横幅和查看导航；RN 公告链已恢复冻结基线，不是本轮 shared consumer |
| acceptance | `local-green/external-gated` | SDK 73/290、RN tsc + 146、H5 full verify/466/748、认证 567px 只读与确认取消通过；真实发布、发送、read mark 和第二账号 type1519/list-back 保留授权门 |

本切片没有发布公告、发送消息或标记已读。浏览器只填写临时草稿以验证发布前确认层并取消；历史启动期“未登录”日志不作为本路由新增错误。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.10 Shared Group Introduction

| capability | state | frozen contract |
| :--- | :--- | :--- |
| shared mutation owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 持有 Web 非空 trim/500 字、权限、Gateway 回包和 success-only groups merge |
| RN consumer | `frozen/not-consumed` | RN introduction 更新、页面、内存 cache 与事件语义保持当前基线 |
| H5 route/UI | `pass-auth-readonly` | 现有 React Router 群简介页按 shared role 切换 RN 编辑/只读态；页面不调用 Gateway/SQL |
| acceptance | `local-green/external-gated` | SDK/RN/H5 回归、build:rn/build:web、真实账号打开/取消通过；真实保存和第二账号 type1521/list-back 保留授权门 |

本切片不包含公告、成员邀请/移除、组合群资料更新，也不修改或执行 `build:package:desktop:web`。浏览器只打开真实群简介编辑页并取消，没有调用 `/v1/group/update`。

## W6.a6.18.3.9 Shared Group Avatar

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared mutation owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 持有 Web 权限、图片/上传、Gateway 响应匹配和 success-only SQLite merge | authorized real upload/update、server permission denial sample |
| RN consumer | `frozen/not-consumed` | RN 选库/相机、裁剪、上传、更新与事件链保持当前基线 | simulator/device baseline regression |
| H5 platform UI | `pass-auth-local-preview` | 群头像行按 shared 角色开放浏览器选择；JPEG/PNG/WEBP、10MB、拖动/1-4x 缩放、圆形预览和 512x512 JPEG Canvas 输出后才调用 `groups.updateAvatar` | authorized real upload/result/list-back |
| runtime/layout | `pass-chromium` | 真实群资料 567x786、360x360 裁剪区、图片解码、确认就绪、取消、零横向溢出与零 console warning/error | dark/desktop/Safari/Firefox、touch drag |

本切片只选择仓库静态图片打开本地裁剪并取消，没有触发 OSS 上传、`/v1/group/update` 或 SQLite mutation。该头像切片关闭时简介仍走 RN 原路径，现已由 `.18.3.10` 收敛；公告和组合更新仍保留兼容路径。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.8 Shared Group Profile Name

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared mutation owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 持有 Web 群名权限、校验、Gateway 响应匹配和 success-only SQLite upsert | authorized real update、server permission denial sample |
| RN consumer | `frozen/not-consumed` | RN `openIMService.updateGroupInfo`、内存 cache 与事件链保持当前基线 | simulator/device baseline regression |
| H5 route/UI | `pass-auth-readonly` | 群设置真实资料头进入 `/settings/profile`；群头像只读，owner/admin 群名可打开编辑层，群 ID 提供真实 clipboard action | authorized save/copy result、ordinary-member sample |
| runtime/layout | `pass-chromium` | 真实 `donk的群聊`/`64866675923` 加载、编辑层打开/取消、567x786 无横向溢出且 console error 为空 | dark/device/Safari/Firefox |

本切片没有保存群名或点击复制。该名称切片关闭时其他字段尚未收敛；头像/简介现已由 `.18.3.9/.18.3.10` 闭环，公告和组合更新仍为兼容路径。`build:package:desktop:web` 未修改或执行。

## W6.a6.18.3.7 Shared Group Card

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared send owner | `shared-core-ready/web-consumed/rn-frozen` | SDK 持有 Web 好友目标、单聊打开、type108/type101 顺序和 SQLite 状态收敛 | authorized real send、partial failure/retry |
| RN consumer | `frozen/not-consumed` | RN `openIMService.shareGroupCard` 与事件语义保持当前基线 | simulator/device baseline regression |
| H5 route/UI | `pass-auth-readonly` | 群设置进入独立 React Router 选择页；对齐 RN 当前 production UI，仅好友、单选、无附言输入，显式“分享”后才调用 shared facade | authorized share success/failure navigation |
| runtime/layout | `pass-chromium` | 真实群加载 7 个好友目标，搜索、选择、取消和返回通过；480px surface 无横向溢出且 warning/error 为空 | physical touch、dark/Safari/Firefox |

本切片没有点击“分享”，没有创建单聊或写入消息。RN 当前群名片选择器未启用群目标且附言输入被注释，H5 因此不自行扩展这两项；SDK 仍保留可选附言能力。`build:package:desktop:web` 未修改或执行。

## W6 Shared Group Announcement Readonly Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared DTO | `shared-core-ready/web-consumed` | `WebIMJoinedGroup` 从同一 Gateway/SQLite payload 投影公告、版本和显式编辑权限，旧快照按群主规则回退 | RN consumer convergence for update/read status |
| RN visibility parity | `pass-auth-readonly` | H5 仅对匹配群的 owner/admin 显示公告卡，位置在置顶/免打扰之后、清空记录之前；空副标题“未设置” | ordinary-member authenticated sample |
| detail owner | `pass` | 简介/公告共用 `GroupTextDetailPage` 的会话校验、cache-first 群同步、失败与布局；公告页只配置字段/标题/空值 | non-empty real announcement sample |
| runtime/layout | `pass-chromium` | 真实 owner/admin 群进入 `/settings/announcement` 显示“暂无群公告”，返回群设置且 480px surface 无横向溢出 | dark/device/Safari/Firefox；dev HMR history logs not used as zero-console evidence |

## W6.a6.18.3.6 Self Group Nickname

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared mutation | `done-local` | SDK 固定当前认证 userID、24 字非空校验、一次 Gateway update、响应身份校验和 success-only 单成员 SQLite upsert | real authorized update、server permission denial sample |
| cache/identity | `pass` | 当前成员缺失 fail-closed；Gateway 失败/身份错配/非法输入均保留旧 cache；返回 DTO 继续使用 shared 名称 resolver | remote second-client nickname event contract |
| H5 consumer | `done-local/interaction-unverified` | 群设置 RN 同顺序显示“我在本群的昵称”，编辑层含 24 字输入、取消/保存/保存态和可见错误；页面不调用 Gateway/SQL | browser open/cancel/layout proof；real save explicitly not executed |
| RN boundary | `pass` | RN 业务源码未改，`build:rn` 仅同步 generated package，RN `tsc` 通过 | future guarded consumer convergence |

本切片没有注册 Web-only realtime listener，也未执行真实群昵称保存。Gateway 尚无稳定群成员昵称事件合同，因此 realtime/list-back 保留显式外部验收门。

本切片未执行 `/v1/group/update`、公告已读标记、公告文本发送或其他群管理 mutation。SDK 使用普通 `build:rn/build:web` 同步应用包；`build:package:desktop:web` 未修改或执行。

## W6 Group Introduction Readonly Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| source parity | `pass` | RN 群设置第二卡顺序、空值副标题“请输入群的内容介绍”、详情空值“暂无群简介”和只读页脚均已对齐 | owner/admin edit mode |
| data owner | `pass` | H5 只消费当前账号 `conversations` 与 `groups` cache-first/sync facade；同目标群匹配后才投影 `introduction` | offline-source isolation、remote non-empty sample |
| route/failure | `pass-auth-readonly` | `/conversations/:conversationID/settings/introduction` 可深链和返回；单聊误入、会话缺失、群资料缺失均 fail visible | cross-browser history matrix |
| layout/runtime | `pass-chromium` | 567x786 与 390x844 surface/footer/正文无横向溢出，零 console error | physical device、dark theme |

该只读切片当时未新增或修改 SDK/RN source，也未调用群资料更新接口；编辑 owner 后续由 `.18.3.10` 收敛。真实编辑、分享、邀请、移除或其他群管理 mutation 仍未执行；`build:package:desktop:web` 未修改或执行。

## W6 Archived Conversation Route Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared owner | `converged/local` | `createIMConversationArchiveSync` 单一持有全分页、loop/page guard、mapping、latest message 和权威 SQLite 快照收敛 | real second-account list-back |
| cache separation | `pass` | 普通会话 `replaceUnarchived` 保留归档行；`isArchived` 与 clear-history `listHidden` 分离，并兼容清理历史 RN 双置位数据 | old-device upgrade sample |
| RN consumer | `pass-local` | `conversation-archive-shared-service` 只注入 Nitro SQLite、Gateway 和已有 profile hydration；旧私有 pager/replacer 已删除 | simulator/device archive refresh |
| H5 route/UI | `pass-auth-readonly` | 主列表真实归档通栏进入 `/conversations/archived`；30-row cache pagination、本地搜索、top-only pull refresh、长按取消归档菜单和最后一条移除后返回均已接线 | physical touch、authorized cancel/delete |
| runtime/layout | `pass-chromium` | 567x786 真实 `donk三大爷` 归档行、480px surface、无横向溢出、零 warning/error | Safari/Firefox、dark/desktop matrix |

本切片未执行取消归档、删除、已读、置顶或免打扰 mutation。H5 页面不持有 Gateway/SQL/DTO 状态机；`build:package:desktop:web` 未修改或执行。

## W6 Contact Profile Core Action Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| shared owner | `converged/local` | `IMContactActionsSync` 单一持有备注、星标、黑名单、共同群完整分页和 cache convergence；RN 五个直连 Gateway helpers 已删除 | real mutation/list-back and second client |
| RN consumer | `pass-local` | `openIMService` 只保留既有 snapshot/event/DTO/failure projection，SQLite 与 Gateway 写入委托 shared facade | simulator/device regression |
| friend profile UI | `done-local/read-only-accepted` | 三项快捷操作、发消息、备注/签名、来源、添加时间、共同群数量、名片分享、更多/黑名单/删除确认层与 RN 结构一致 | authorized writes、dark/cross-browser |
| common groups | `done-local/read-only-accepted` | `/contacts/users/:userID/groups` 真实显示 3 群；只从当前账号 canonical conversation 集合解析路由，缺失时 fail visible | open-group mutation/persistence and large pagination |
| mutation boundary | `pass` | sheet/dialog 打开不触发写入；页面只在明确媒体类型、保存、确认黑名单或删除范围后调用 shared owner；星标和备注成功后才更新 UI | real operation result/failure visual matrix |

好友来源已由 `GatewayFriend.source_type -> WebIMPeerProfile.sourceType/sourceLabel -> RN/H5` 形成唯一事实链，空字段保持空白且不伪造“未知来源”。Authenticated Chromium 只读取资料与布局；未保存备注、未切换星标/黑名单、未删除/分享、未创建会话、未发起通话或请求媒体权限。

## W6 Group Members Route Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| settings entry | `pass-auth-readonly` | 群设置复用真实成员预览，并通过“全部”进入 `/conversations/:conversationID/settings/members` | large-group pagination/performance |
| member list | `pass-auth-readonly` | cache-first 后 shared `groupMembers.sync`；真实群显示 4 名成员且 owner 标签正确 | offline cache isolation、admin sample |
| identity | `shared-core-ready/web-consumed/rn-frozen` | 设置预览与完整列表统一消费 SDK `resolveIMGroupMemberDisplayName`，保持 `备注 > 群内昵称 > 公开昵称 > im-userID后四位` | second-client nickname-change sample；RN caller 保持冻结 |
| search/navigation | `pass-chromium` | 名称/userID 过滤、拼音分组、成员资料跳转和 Router state 返回均通过 | Safari/Firefox history matrix |
| layout/runtime | `pass-chromium` | 567x786 与 390x844 均无横向溢出、无 console error | physical-touch pull refresh |

本切片不新增 Gateway、SQLite、WebSocket 或身份规则 owner，也不执行 presence、成员邀请/移除、好友申请或其他群管理 mutation。SDK 与 RN source 均未修改。

## W6 Shared RTC Control Convergence

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| control truth | `converged/local` | `createIMCallControlSync` owns auth、stable IDs、six Gateway lifecycle operations、credential validation、URL normalization and E2EE fail-closed | real authorized call signaling |
| RN consumer | `pass-local` | `call-control-shared-service` injects Nitro SQLite/Gateway/RN URL adapter；`openIMService` retains profile/cache/UI projection only；six duplicate Gateway helpers removed | device smoke and real peer call |
| Web consumer | `pass-local` | `WebIMSync.calls` delegates the same facade；production runtime forwards browser UUID owner as client call ID；全局 Provider 统一消费呼入/呼出 | real dual-account call signaling |
| Web media runtime | `pass-local/real-port` | `/web` only state machines + real LiveKit Room/track/device adapter + outgoing/incoming orchestrators；credentials never enter snapshot/cache，H5 active route owns DOM/navigation only | real dual-account permission/connect/reconnect/hangup and background behavior |
| call record detail | `converged/local` | `createIMCallRecordSync` owns lossless raw cache、detail merge/writeback and same-day filters；RN detail composition and H5 `/calls/:callID` consume it | real multi-row duration/status matrix and cross-browser acceptance |
| call record lifecycle | `converged/local` | shared parser/facade owns remote list/full sync、cache、detail、delete、pending、terminal wrapper/status/write；RN/Web production callers consume it，`/calls` subscribes data version | real delete and dual-account terminal-event/list-back acceptance |
| incoming call | `converged-local/acceptance-gated` | SDK strict parser + shared lifecycle own type1601..1608、event/call dedupe、终态乱序保护、pending 校验和 answer/reject composition；Web runtime 发布无凭据 snapshot；H5 全局 Provider 投影 banner/fullscreen/draggable floating、visibility refresh、ringtone/autoplay recovery 和活动通话 route | real dual-account invite/answer/reject/timeout、background/multi-tab、ringer and media permission acceptance |

No Gateway call operation、delete、media permission、ringtone playback or LiveKit room was executed. Incoming UI closeout proof includes SDK all-runtime typecheck/boundary、incoming/runtime 22/22 and final orchestrator/runtime 15/15、`build:web` generated package sync；H5 typecheck、tone/UI 6/6、production build and authenticated browser cold zero-overlay/zero-console smoke。Reject does not construct a media session；answer only creates LiveKit media after Gateway confirms；remote terminal only releases media and does not echo hangup；token never enters React snapshot/cache。RN/Desktop runtime behavior and `build:package:desktop:web` remain untouched.

## W6 Contact List Interaction Contract

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| cache-first load | `pass-auth-readonly` | `/contacts` calls `contacts.listCached()` before the existing canonical `contacts.list()`；cache failure does not manufacture success and remote failure stays visible | explicit offline Gateway-block proof |
| pull-to-refresh | `pass-contract/chromium` | shared browser hook owns top-only single-touch damping、56px threshold and 76px cap；contacts release calls only `contacts.list()` and preserves existing rows on failure | physical touch device and Safari overscroll behavior |
| right index | `pass-auth-readonly` | RN search icon semantics are preserved as “scroll to top”，not a duplicate search route；A/D/Z/H buttons own selected state and smooth section scroll；390x600 D proof reached `scrollY=196` without overflow | drag-through letter selection and long-list viewport tracking |
| top search route | `pass-auth-readonly` | existing search surface continues to enter React Router `/contacts/search` | cross-browser history matrix |
| friend long-press menu | `done-local/read-only-menu` | 300ms pointer/touch、8px movement cancellation and right-click render exactly `发消息/音视频通话/分享好友名片/删除好友` | physical touch、Safari/Firefox and authorized action results |
| message/call | `converged/local` | 发消息和音视频都先由 `peerProfile.openConversation` 获取 canonical ID；通话二选一后交给唯一 `WebIMCallProvider` | real conversation create and dual-account RTC |
| card/delete | `converged/local` | 名片分享独立 React Router target route only lists valid friends；确认后调用 `contacts.shareUserCard`；删除二次确认 `self|both` 后调用 `contacts.deleteFriend` | authorized Gateway result、SQLite/list-back and failure matrix |

The H5 app owns only touch/index/menu/sheet/route presentation. Contact reads、delete/card mutations and direct conversation resolution remain shared SDK owners；browser media remains the SDK `/web` port plus the single application Provider. 名片 route state 只携带公开 display fields，缺失或 userID 不匹配时回到资料页。No contact mutation、conversation creation、card share、RTC or media permission was executed.

## W6 Contact Verification Route Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| contact shortcut | `pass-auth-readonly` | `/contacts` now matches current RN with one `验证消息` shortcut plus `我的群聊`；the old separate friend/group shortcuts are gone | unread aggregate badge |
| verification tabs | `pass-auth-readonly` | `/contacts/verifications/friend|group` owns RN `验证消息` header and route-stable `好友验证/群聊验证` tabs；friend and group panels retain their existing real facades | pending friend and non-empty owner/admin group samples |
| route compatibility | `pass` | old `/contacts/friend-applications` and `/contacts/group-applications` deep links redirect to canonical tabs；group detail returns to the group tab；reload and browser back restore the expected SPA owner | non-empty group detail history |
| owner convergence | `pass` | container owns only tab route/presentation；friend accept and group audit/accept/reject remain in existing page/facade owners；no duplicate transport、SQL or application state machine | authorized mutations |
| layout/runtime | `pass-chromium` | 390x844 and 760x900 have no horizontal overflow；desktop surface is 480px；child route has no primary tabbar and no console errors | Safari/Firefox and explicit dark screenshot |

This slice performs no Gateway mutation and changes no SDK or RN source. React Router tab links use replace semantics so a page-internal tab switch does not add an extra RN-inconsistent back step.

## W6 Chat Message Presentation Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| sender identity | `pass-auth-readonly` | `resolveIMGroupMemberDisplayName + formatIMUserDisplayName` own `备注 > 群内昵称 > 公开昵称 > im-userID后四位`；real sender IDs became `donk三大爷` and `A-Robin-0` with member avatar support | current sample contains no owner/admin sender，so role-label pixels retain fixture/unit proof only |
| mention display | `pass-auth-readonly` | stable `Message.mentions[].userID` remains unchanged while visible `@userID`/old snapshot names resolve through the same current member map；SDK UTF-16 entity reconciliation protects preset emoji offsets | second-client nickname-change realtime sample |
| image sizing | `pass-auth-readonly` | Gateway width/height use RN 180px max-width ratio；missing metadata uses browser-decoded natural dimensions；normal GIF keeps the original source while the HEIF-mislabeled JPG alone falls back to an OSS JPEG display projection | signed/private OSS variants and Safari/Firefox media decoding matrix |
| voice sizing | `pass-auth-readonly` | RN 1-10s 70% and 10-60s 30% width curve is reused；real 2s/6s samples measured 100px/146px | physical touch playback and cross-browser audio remain gated |
| forward hierarchy | `pass-auth-readonly` | `转发自` and avatar/name are two lines；incoming forwarded sender identity is inside the bubble | desktop/cross-browser visual matrix |

This slice adds no H5 identity rule: remark/group/public-name priority is owned by the SDK resolver and exported through RN/Web/Desktop entries. H5 owns only immutable message-view substitution、CSS/media layout and a browser-only OSS decoding fallback that never changes the persisted message URL. No message, mutation, download or RTC action was executed.

## W6 Conversation List Interaction Parity

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| global search | `pass-local/auth-readonly` | search surface enters React Router `/conversations/search`；default history/empty state and real friend/group/message sections render from shared facades | cross-browser and large-result performance |
| long-press actions | `pass-local/read-only-menu` | 300ms touch/pointer contract、8px movement cancellation、right-click and RN action labels；backdrop closes without route click-through | real read/unread/pin/mute/archive/delete mutations |
| pull-to-refresh | `pass-contract` | top-only threshold/damping/release helpers and list refresh wiring are covered；empty/list layout remains stable | physical touch-device smoke and Safari overscroll behavior |
| shared action owner | `converged/local` | RN/Web both consume `createIMConversationListActionsSync` for read/manual-unread/archive；RN direct Gateway/local writes and OpenIM hide fallback removed | authorized Gateway result/list-back |

Search、menu and pull gesture are application presentation responsibilities. DTO validation、Gateway target matching、read cursor、manual unread and archive persistence are SDK responsibilities. Delete/clear uses the separate shared clear-history contract. No write action was executed during browser acceptance.

## W6 Real-account Read-only Acceptance

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| calls | `pass-readonly` | real sync/cache rendered 2 missed records；all/missed filters both returned 2；default caller is `WebIMSync.calls` | edit/delete、non-missed/duration samples、desktop/dark matrix、RTC |
| joined groups | `pass-readonly` | 11 real groups；name/ID/member count/intro and owner/admin labels；name/ID/unknown search returned 2/1/0；390x844 system-dark and 760x900 light plus history/reload passed | open-conversation persistence、offline cache isolation、Safari/Firefox |
| friend profile | `pass-readonly` | `donk二大爷` friend read plus current-account self and unknown failure states loaded through `peerProfile.get` | open-conversation persistence、real stranger and friend-application mutation |
| contact search | `pass-readonly` | known result、self filtering and unknown no-result passed locally and through explicit Gateway search | transport/business failure response and Safari/Firefox |
| blacklist | `pass-empty-read/chromium` | authenticated list operation rendered honest empty/search-empty states；permission entry、direct route、back/forward/reload、system-light/explicit-dark and zero-overflow/zero-console proof passed | non-empty enrichment/search、remove confirmation/Gateway result and Safari/Firefox matrix |

Anti-mock review found no page transport、SQL、mock branch or fake-success path in these default callers. No edit、delete、remove、conversation creation、friend application、message send、media or RTC action was executed.

## W6 Blacklist Empty-state Visual And Route Acceptance

| gate | result | evidence |
| :--- | :--- | :--- |
| RN presentation | `pass` | 40px search、RN 文案“暂无黑名单用户/未找到相关用户”、80px 空态间距与 480px Web surface match the canonical RN screen；real account returned zero blacklist rows |
| theme/layout | `pass-chromium` | 567x786 system-light and explicit dark both rendered correctly；`scrollWidth === innerWidth` and no horizontal overflow |
| route recovery | `pass` | permission settings entry、direct `/me/settings/blacklist`、back、forward and reload preserved authentication and exact SPA routes |
| runtime/console | `pass` | startup/login completed through the real runtime；display preference restored to `system`；zero warning/error after final route load |
| mutation boundary | `pass` | no row existed and no remove confirmation or Gateway mutation was triggered |

This acceptance changes no SDK or page code: the existing H5 page already matched the RN layout and consumed only `WebIMSync.blacklist`. Non-empty enrichment/search、real remove Network/result and Safari/Firefox remain explicit gates.

## W6 Applications And Settings Read-only Acceptance

| capability | result | proven scope | still gated |
| :--- | :--- | :--- | :--- |
| friend applications | `pass-readonly` | authenticated shared facade returned 5 real historical rows with source/message/status projection | accept mutation、pending-state sample、search/theme/history matrix |
| group applications | `pass-empty-read` | authenticated group-audit list completed and rendered the honest empty state | non-empty owner/admin audit、detail、accept/reject and visual matrix |
| notification settings | `pass-readonly` | 7 real values loaded through `runtime.getSettings()`；default caller has no page transport or fake branch | any switch update、Network/result、Safari/Firefox；visible RN/H5 title says “全局消息免打扰” while the shared field is an enable switch，retained as cross-client label debt |
| permission settings | `pass-readonly` | 5 real values loaded through the shared settings facade | any switch update、Network/result and Safari/Firefox matrix |
| platform terms | `pass-readonly` | real user agreement and privacy policy loaded in sandboxed frames，both dated 2026-08-04 | cross-browser frame policy and failure response |
| client version | `pass-readonly` | build `1.4.1.202608092238` checked through the public adapter and returned no update | optional/forced update response and target proof |

The notification title/field mismatch already exists in the RN canonical caller: RN and H5 both treat `notification=false` as globally disabled. This slice preserves runtime parity and does not create an H5-only semantic fork. No application handling、settings update、logout or other mutation was executed.

## W6 Read-only Visual And Route Matrix

| gate | result | evidence |
| :--- | :--- | :--- |
| viewport/theme | `pass-chromium` | `/calls`、friend/group applications、settings root/notification/permission/terms and `/me` passed at `390x844` and `760x900` in system dark plus explicit local light mode |
| horizontal layout | `pass` | all 32 route/viewport/theme samples had `scrollWidth === innerWidth`；desktop content consistently constrained to 480px and centered |
| route recovery | `pass` | friend/group application direct links、back、forward and reload retained authenticated data/empty-state and exact SPA path |
| runtime/console | `pass` | preference restored to `system`、viewport override reset、preview returned to `/conversations` with runtime `online` and zero warning/error |
| mutation boundary | `pass` | no Gateway update、accept/reject、delete、logout、send or RTC；only the browser-local display preference was temporarily switched and restored |

This closes the Chromium responsive/theme/history residual for the named routes. Safari/Firefox、non-empty group-application data、pending friend application state and all business writes remain explicit gates.

## W6 Contact Negative And Self Read-only Acceptance

| capability | result | evidence | still gated |
| :--- | :--- | :--- | :--- |
| self profile | `pass-readonly` | `/contacts/users/86272753597` returned real `donk` identity and only back/copy-ID controls；no message、add-friend or more action | none for Chromium read state |
| self search filtering | `pass-readonly` | current ID produced no local profile link and Gateway results were filtered to the honest no-result state | search transport failure and Safari/Firefox |
| unknown search | `pass-readonly` | stable non-user query returned no local result and `未找到相关好友` after explicit Gateway search | transport/business failure response |
| unknown profile | `pass-failure-visible` | unknown deep link returned `资源不存在` plus same-operation retry and no profile action/fake data | backend-specific alternate error codes |
| layout/router | `pass-chromium` | 390x844 system-dark and 760x900 light had no horizontal overflow；desktop surface remained 480px；self/unknown back、forward and reload retained exact state | Safari/Firefox |
| mutation boundary | `pass` | no conversation creation、friend application、profile update or clipboard action；temporary local light mode was restored to system | all business writes remain separately gated |

Static and runtime evidence agree: H5 calls only `contacts.searchUsers` and `peerProfile.get`；the shared SDK filters the current user and classifies self/friend/stranger. No page transport、mock result、fake-success path or second identity owner was found.

## W6 Joined Groups Read-only Visual And Route Acceptance

| capability | result | evidence | still gated |
| :--- | :--- | :--- | :--- |
| data projection | `pass-readonly` | cache-first/full-sync facade returned 11 real groups with name、ID、member count and intro；long intro remained bounded | offline cache isolation |
| role projection | `pass-readonly` | real rows rendered `管理员` and `我创建`/`群主` from the shared group role projection | alternate role samples |
| search | `pass-readonly` | `donk` returned 2 rows、exact group ID `64866675923` returned 1、stable unknown query returned the honest empty state | transport/business failure response |
| layout/theme | `pass-chromium` | 390x844 system-dark and 760x900 explicit light had no horizontal overflow；desktop content stayed centered at 480px | Safari/Firefox |
| route recovery | `pass` | `/contacts` -> `/contacts/groups` direct navigation、back、forward and reload preserved authentication and restored the 11-row list | none for Chromium read state |
| mutation boundary | `pass` | group rows were intentionally not clicked；no conversation open/create、group mutation、message send or other Gateway write occurred | conversation-open persistence requires explicit mutation authorization |

H5 presentation remains page-owned while cache、sync、role mapping and conversation business behavior remain shared SDK owners. No page transport、SQL、mock branch、fake-success path or H5-only group business owner was found.

## W3 Real Gateway Read-only Evidence

| gate | result | conclusion |
| :--- | :--- | :--- |
| account 1 restore | `pass` | reload stayed on `/conversations` and restored the authenticated `donk` tab instead of redirecting to login |
| Gateway-backed reads | `pass` | conversations showed 19 visible rows/25 unread，contacts showed 7 real friends，`/me` returned `donk` and the expected account ID；zero browser warning/error |
| account 2 login/restore | `pass` | the explicitly supplied phone-code test account logged in as `donk二大爷`，loaded its own conversation/unread projection and survived reload |
| account isolation | `pass` | two same-origin tabs concurrently retained different profile IDs and unread totals，so tab session and account database owners did not overwrite each other |
| SQLite offline hit | `not-proven` | the page code is cache-first and local Chromium SQLite gates are green，but this run did not inspect browser storage or block Gateway；no offline cache claim is made |
| WebSocket observability | `pass` | `data-im-runtime-state` exposes only the token-free SDK lifecycle state and no account/token/message payload |
| dual-account WebSocket online | `pass` | shared `localStorage` device identity reproduced alternating reconnects；tab-scoped `sessionStorage` identity removed the collision，with 19/20 long samples dual-online and one simultaneous transient reconnect that recovered |
| realtime message delivery | `pass-real/.130` | 后续授权切片已发送唯一 marker；receiver 无刷新出现 preview/unread，chat cache 与 list-back 均命中；online 状态本身仍不作为投递证据 |

This slice performed only login and read-only navigation. It did not send messages，open media，change settings，clear history，delete data or execute RTC.

## W6 Closeout Evidence

| gate | result | conclusion |
| :--- | :--- | :--- |
| SDK focused all-runtime | `pass` | message/sync/Web/Desktop/custom-emoji test scope + typecheck passed；未调用/修改 `build:package:desktop:web` |
| H5 full verify | `pass` | 466 RN assets、SDK Web 59 files/203 tests、H5 typecheck/build passed；existing main chunk warning retained |
| RN shared-SDK consumer floor | `pass` | `openIMService`、clear facade、SQLite、single detail、group settings：5 suites/176 tests；RN `tsc --noEmit` passed |
| RN full Jest | `pass` | 164/164 suites、1369/1369 tests；ChatDetail 166/166；segmented history、staged unread、voice identity and cache-first presence contracts are covered |
| boundary audit | `pass` | H5 pages do not create Gateway clients or execute SQL；RN screens do not call SDK runtime operations；media download `fetch` remains browser port behavior |
| duplicate-owner audit | `pass` | clear/realtime/search canonical business owners remain in SDK；RN/H5 retain explicit composition and UI/platform integration only |
| fake-success audit | `pass` | no fake-success/error swallowing main path；login `666666` text is the current Gateway integration contract, not a local success bypass |

RN regression ownership is tracked in `IM28_H5_FOUNDATION_CLEANUP.md`. Local P0/P1 is zero；real text delivery/list-back 已由 `.130` 关闭；offline SQLite hit、其他 destructive mutations、RTC and cross-browser proof remain external/authorization gates and are not implied by the green local floor.

## Current Readout

| dimension | state | note |
| :--- | :--- | :--- |
| pack | `active` | W3/W4/W5 保留外部门；forward normal/hidden accepted；message edit/delete shared core/H5 UI closed locally，real mutations and forward partial/desktop remain gated |
| `W1` | `done` | H5 规则、架构和存储 SSOT 已落库 |
| `W2` | `done` | H5 app、独立 multi-runtime SDK Git repository、Vite React Router App 与跨仓构建验证链已落地 |
| `W3` | `gated/partial-real` | real login、refresh restore、Gateway-backed reads、two-account tab isolation、dual WebSocket online、text delivery/SQLite convergence/list-back passed；offline SQLite-hit proof remains |
| `W4` | `gated` | HTTP MVP、默认 routes、新消息/会话/update 与 same-tab ordering 已本地完成；真实 flow gated |
| `W5` | `gated` | W5.a1/W5.a2 done-local；W5.a3 code done-local，真实三浏览器矩阵 pending |
| `W6` | `active` | preset/custom/media/retry/quote/copy/edit local chains、SDK boundary、forward normal+hidden real flow and RN/Web message forward/delete/edit/group-mention/search/realtime/clear-history single-track consumption done；local closeout passed，only explicit external/authorization acceptance gates remain open |

## Latest Closed Group Mention Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.17.1-shared-group-mention-core + .17.2-h5-group-mention-ui + .17.2.1-unread-projection + .17.2.2-sender-display-name-cache-parity` |
| production_flow | group cache -> group-member cache/full sync -> RN-derived picker -> shared type106 optimistic send -> Gateway -> SQLite v10 -> existing realtime/cache reread；conversation list separately reads `lastReadSeq < seq` latest incoming mention |
| ownership | SDK owns member/contact/user cache、mention identity、Gateway convergence、unread query and RN sender-name priority；H5 owns picker/composer and returned snapshot presentation only |
| failure contract | unknown group、pagination failure、invalid target/permission reject visibly；invalid seq or absent stable mention fails closed to latest message；H5 never scans history or guesses identity/name |
| verification | SDK Web 52/163、all-runtime typecheck、boundary gate、build:web sync；H5 33/116、typecheck、466 assets、production build；authenticated 7-contact -> 19-conversation navigation and 458x786 no-overflow/zero-console proof |
| RN impact | RN now explicitly composes `createIMGroupMentionSync` through `group-mention-shared-service.ts`；send/member-candidate callers consume the neutral facade，while RN DTO/events/presentation remain app-owned |
| residual | real type106 send、Gateway mention echo、SQLite/list-back and second-client realtime remain `blocked-mutation-authorization`；current account has no real unread mention browser sample；cold sender caches intentionally render no guessed name |

## Latest Closed Message Edit Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.16.1-shared-message-edit-core + W6.a6.16.2-h5-message-edit-ui` |
| production_flow | cached client ID -> shared current-account reread/eligibility -> Gateway update -> success-only same-row text/entity replacement -> existing cache reread/realtime convergence |
| ownership | SDK owns eligibility、operation ID、Gateway body、same-row persistence and editedAt；H5 owns action、composer preview/draft and edited-time projection only |
| failure contract | invalid/local-only/forwarded/non-text rows reject before I/O；Gateway failure or target mismatch preserves original cache；H5 keeps editing state and draft |
| verification | SDK Web 48/155、all-runtime typecheck、boundary gate、build:web sync；H5 32/109、typecheck/build、466 assets；authenticated 458x786 preview/cancel/no-overflow proof |
| RN impact | RN `openIMService.editTextMessage` now consumes the neutral shared mutation facade；RN owns only auth/context、MessageItem projection and existing event emission，legacy inline Gateway/SQLite edit path is deleted |
| residual | real Gateway edit、same-row SQLite/list-back and second-client realtime remain `blocked-mutation-authorization`；revoke remains excluded |

## Latest Closed Message Delete Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.15.1-shared-message-delete-core + W6.a6.15.2-h5-message-delete-ui` |
| production_flow | cached client IDs -> shared current-account reread -> single update or batch-delete -> success-only transactional local hide -> existing cache reread/realtime convergence |
| ownership | SDK owns eligibility、Gateway operations、partial matching and SQLite mutation；H5 owns action/multi-select、group-role presentation、confirmation sheet and visible result only |
| failure contract | `all` rejects any local-only row before I/O；top-level failure changes no local row；partial result hides only confirmed successes；`self` may remove local-only rows |
| verification | SDK Web 47/152、all-runtime typecheck、build:web sync；H5 31/107、typecheck/build、466 assets；authenticated 458x786/390x844 single+two-message read-only proof with no overflow or console errors |
| RN impact | no RN app/service import or caller changed；shared code compiles for RN but cannot alter its runtime without an explicit composition/service cutover |
| residual | real `self/all/partial/list-back` is destructive and remains `blocked-destructive-authorization`；revoke is explicitly excluded |

## Latest Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.13-chat-copy-core` |
| production_flow | cached message -> `ChatMessageView` -> existing message action -> injected clipboard port -> `navigator.clipboard.writeText` -> success-only notice |
| parity | RN copy asset and text/media/card fallbacks are reused；system/deleted/revoked rows remain non-actionable |
| verification | H5 27/99、SDK 44/140、466 assets、full verify/build、authenticated 458x786 right-click/no-overflow/zero-console proof |
| residual | Safari/Firefox permission behavior and touch long-press remain acceptance gates；rich clipboard is explicitly outside scope |

## Latest Closed Forward Core Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.14.1-shared-forward-core` |
| production_flow | current-account SQLite source reread -> atomic optimistic rows -> normal batch or registered hidden-sender send -> per-row final transaction -> realtime/list-back mapper |
| persistence | schema v9 stores `forward_origin_json/forward_source_msg_id/forward_batch_id` separately；history and realtime use the same core projection |
| failure contract | one stable batch/item/comment identity；top-level failure fails every prepared row；partial response and comment converge independently；unsupported hidden body rejects before write/I/O |
| verification | SDK 49 files/150 tests、Web 46/145、all-runtime typecheck/package compile、build:web sync and H5 full verify passed |
| residual | initial core requires completed server-backed sources；registered hidden body types are 101–105/114/115；real Gateway/list-back and H5 UI remain open |
| next | `W6.a6.14.2-h5-forward-target-preview` |

## Latest Closed Forward H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.14.2-h5-forward-target-preview` |
| production_flow | cached action/multi-select stable IDs -> React Router target selector -> existing conversation/contact/group facades -> target chat source reread -> pending exclusion/comment/privacy preview -> explicit shared `messages.forward` caller |
| ownership | Router state carries IDs only；H5 owns selection/presentation；SDK owns eligibility、source/target cache reread、Gateway body、optimistic rows and per-row convergence |
| verification | H5 29/103、SDK Web 46/147、typecheck、build:web sync、466 assets、production build and authenticated read-only three-tab/single+two-message/390x844+458x786 light/dark proof |
| residual | authorized normal and hidden-sender sends pass Gateway/cache/list-back；`.124` closes current unified-modal desktop proof；real partial-result remains `.14.3` gate |
| next | `W6.a6.14.3-forward-acceptance` controllable partial-result (`blocked-external`) |

## Latest Closed Contract Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.12-shared-sync-neutral-naming-and-rn-adoption-contract-freeze` |
| verdict | keep one shared implementation；treat `WebIM*` as historical public names；do not add unused aliases or move neutral business rules into Web |
| RN adoption | future opt-in RN composition root plus explicit `src/services/openim/**` switch；compilation/package presence alone has no runtime side effect |
| next | `W6.a6.13-chat-copy-core` |

## Latest Closed SDK Boundary Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.11.1-sdk-sync-runtime-boundary` |
| goal | make shared business sync and RN/Web/Desktop-specific composition/adapters structurally distinguishable without replacing the existing RN runtime |
| production_flow | shared `src/sync` consumes injected database/Gateway/ports；Web runtime imports `platforms/web/sync/web-im-sync`；RN keeps its existing service adapter path |
| isolation | Web aggregation exists only in Web dist；RN/Desktop exclude it；AST gate rejects shared-to-platform and cross-client imports before every package build/typecheck |
| verification | SDK 44 files/140 tests、all-runtime build:all、RN consumer `tsc --noEmit`、H5 `npm run verify` and per-target dist inspection passed |

Local closeout: no RN application source was changed. Shared DTO、schema、Repository and Gateway mapper remain intentionally cross-runtime and can affect RN only where RN already imports those contracts；the new Web composition itself cannot enter the RN package or runtime.

## Latest Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.10-chat-media-retry-stage` |
| goal | make media retry honest across upload/Gateway/process boundaries without persisting browser source bytes |
| production_flow | platform upload -> strict 102–105 body validation -> same-row SQLite checkpoint -> Gateway send；failure/restart -> shared capability -> same client ID Gateway retry without upload |
| target_owner | shared SDK owns stage derivation、checkpoint、payload reconstruction、account-scoped recovery and retry；Web runtime orders recovery before Realtime；H5 only renders capability |
| verification_shape | four-body contract tests + real sql.js upload-once/retry/recovery range + runtime-before-WebSocket tests + all-runtime build + H5 full gates/read-only smoke |
| stop_condition | no File/Blob persistence、memory source registry、automatic resend、new retry ID、page payload decode、fake success or unapproved Gateway operation |

Local closeout: type102–105 rows become retryable only after a complete uploaded Gateway body is durably checkpointed. A Gateway failure retains that body and explicit retry reuses the original client ID without invoking upload again. A new authenticated session converts only the current user's outgoing `sending` rows to `failed` before WebSocket construction；pre-upload failures remain non-actionable and require an explicit new source selection/new send. No real message was sent or retried.

## Previous Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.9-chat-failed-retry` |
| goal | mirror RN failed action without creating a second message or pretending browser media bytes are recoverable |
| production_flow | failed cached outgoing 101/115 -> shared capability -> `messages.retry` -> same client ID/SQLite row `sending -> sent/failed` -> page cache reread |
| target_owner | shared SDK owns support matrix、payload reconstruction、account guard、Gateway body and state transition；H5 owns button and visible cache refresh only |
| verification_shape | real sql.js same-row success/failure/no-media-I/O tests + all-runtime build + H5 full gates；real failed-message click remains authorization-gated |
| stop_condition | no new client ID、page payload decode、media File/Blob persistence、unsupported retry button、fake success or unapproved Gateway send |

Local closeout: text 101 and custom emoji 115 can retry only from the current account failed row；both preserve the original client ID，and type115 retains its validated URL when Gateway omits it. Media 102–105 remain static failed states because browser bytes cannot be recovered from persisted metadata. No real message was retried or transmitted.

## Latest Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.8-chat-media-export` |
| goal | migrate RN image save and file preview/download without changing shared message truth |
| production_flow | cached image/file payload -> safe HTTP(S) projection -> route-scoped preview -> verified Blob download or explicit browser open |
| target_owner | shared SDK owns message payload；H5 chat owns overlay；one browser adapter owns fetch/Blob/object-URL/download trigger |
| verification_shape | pure URL/file projection + injected download behavior tests + H5 full gates + authenticated read-only image/file visual proof when real history exists |
| stop_condition | no page Gateway/cache write、mock media、fake download success、upload/send、read receipt、retry or RTC |

Local closeout: real cached image messages opened a 458x786 black preview with complete 400px source image and RN save action；a real 32.6 KB PDF opened the file preview with exact name/size and enabled browser open/download actions. Mobile and 1280x800 desktop widths had no horizontal overflow，Escape closed the overlay and console warning/error count stayed zero. No download、new tab、message、upload or mutation was triggered；light-theme and actual download/open evidence remain acceptance gates.

## Latest Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.3-custom-emoji-add-reorder` |
| goal | expose RN type115 collection action and selected-group local ordering without inventing server reorder |
| production_flow | message stable ID -> explicit long-press/right-click action -> shared add；manager selection -> Pointer tray -> stable-ID browser preference |
| target_owner | SDK owns add/member/cache；H5 owns action UI and local presentation order only |
| verification_shape | H5 24/85 + typecheck/build/assets + authenticated 458x786 select/move-tray/cancel proof；type115 visual remains real-data gated |
| stop_condition | no fake/injected message、real add、order commit、file selection、delete or send |

Local closeout: type115 messages retain stable identity for an explicit RN-derived action menu，and successful feedback can only follow shared add resolution. Manager/panel apply a deduped stable-ID preference over the SDK member snapshot；touch/mouse selected-stack movement is local-only. One real cached item reached move mode and was cancelled without persistence；the current conversation has no type115 history，so its menu was not fabricated.

## Previous Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.2-h5-custom-emoji-manager` |
| goal | mirror the RN custom emoji manager through a conversation-scoped React Router route |
| production_flow | chat add tile -> `/conversations/:conversationID/emojis` -> cache-first list -> user file selection/create or selection/confirm/delete -> shared SDK mutation facade |
| target_owner | SDK owns upload validation、Gateway mutation and SQLite membership；H5 owns file input、route、preview/selection and five-column presentation only |
| verification_shape | H5 23/80 + SDK 40/126 + all-runtime typecheck/build:all + production build/assets + authenticated 458x786 read-only equal-cell/no-overflow proof |
| stop_condition | no message-action collection/local reorder、no real file selection/upload/delete/send |

Local closeout: the chat custom-emoji tab now exposes a real manager route with RN-derived five-column cells、add picker、preview、organize selection and confirmed batch delete. Every mutation delegates to `WebIMSync.customEmojis`; read-only browser proof opened the real cached list without selecting a file or mutating data. Desktop/light visual proof and real mutation remain acceptance gates.

## Latest Closed Shared Mutation Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.7.3.1-shared-custom-emoji-mutations` |
| closeout | SDK owns strict create upload batch、add received ID、batch delete and post-success account-cache convergence |
| verification | SDK Web 40/126 + core Gateway contracts + all-runtime typecheck/build:all + RN/Web/Desktop package sync；H5 consumer 23/80 + typecheck/build passed |
| residual_gate | message collection/local reorder is `.3.3`；real upload/mutation/send remains explicitly authorization-gated |

## Previous Closed H5 Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.7.2-h5-custom-emoji-panel` |
| goal | bind shared custom emoji cache/send semantics to the RN third tab and five-column H5 presentation |
| production_flow | `customEmojis.listCached/sync` -> H5 recent/all grid -> `messages.sendCustomEmoji` caller -> existing type115 cached rendering |
| target_owner | SDK owns list membership、DTO、SQLite and send state；H5 owns heart tab、five-column CSS and recent-ID preference only |
| verification_shape | H5 MRU behavior + SDK 121 regression + typecheck/build/assets + authenticated 458x786/1280x800 dark no-overflow proof；light proof remains acceptance gate |
| stop_condition | no add tile/manager/upload/add/delete/reorder、message-action save or real send |

Local closeout: the third heart tab loads the current account SQLite snapshot before remote sync, renders stable-ID recent/all sections in five square columns and delegates clicks to shared type 115 send. SDK Web 40/121、core/all-runtime gates、H5 22/77、typecheck/build、466 assets and authenticated real-list dark mobile/desktop proof passed. One real list item rendered；no emoji was clicked and no message was transmitted. Light-theme visual proof and real send remain acceptance-gated.

## Latest Closed Shared Slice

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.7.1-shared-custom-emoji-core` |
| closeout | SDK owns custom emoji DTO/HTTP list mapper、schema v8 account cache、atomic replace and type115 optimistic/sent/failed URL snapshot semantics |
| verification | SDK Web 40/121 + core Gateway contracts + all-runtime typecheck + build:web package sync；H5 package consumer typecheck/build passed |
| residual_gate | manager create/add/delete/reorder is `.3`；real send remains explicitly authorization-gated in `.4` |

## Latest Local Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.5-chat-system-emoji-core` |
| goal | 迁移 RN 第一套 Unicode 系统表情面板、光标编辑、完整 grapheme 退格和最近使用顺序 |
| production_flow | RN `ChatComposer` -> `ComposerEmojiPanel` -> `chatComposerTextEditing` -> draft -> existing text send |
| operations | local draft insert/replace/delete；browser recent-history read/write；existing `sendText` only |
| contract | 52-entry RN Unicode list；7-column grid；recent MRU dedupe/cap `21`；insert replaces selection；delete removes selection or one full grapheme；panel and actions are mutually exclusive |
| target_owner | H5 composer owns panel state；pure helper owns UTF-16 selection/grapheme editing；browser adapter owns non-sensitive recent history；SDK remains unchanged |
| verification_shape | pure edit/MRU tests + H5 app suite/typecheck/build/full verify + authenticated 390x844/1280x800 insert/delete/MRU/no-overflow smoke |
| stop_condition | no illustrated preset entities、custom emoji API/manager/type `115`、rich clipboard、draft persistence、real message transmission or SDK change |

Local closeout: the composer now has one RN-mirrored Unicode emoji path with 52 ordered entries、7 columns、21-item recent MRU、selection replacement and full-grapheme deletion. H5 17/65、SDK 36/111、466 assets、full verify/build and authenticated 390x844/1280x800 browser proof passed；insert/delete were exercised without clicking send, and a clean reload produced no new console errors. The existing text-send acceptance gate remains open.

## Previous Closed Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.4-chat-voice-send-core` |
| goal | 将 RN 按住录音、上滑取消、2–60 秒语音上传、Gateway audio send 与 SQLite 状态收敛迁入 H5 |
| production_flow | RN `ChatComposer` -> `useChatVoiceRecorder` -> `audioMessageService` -> `sendSoundMessage` -> upload credential/OSS -> Gateway audio body -> local repositories |
| operations | browser `getUserMedia/MediaRecorder`；`getUploadCredential`；OSS multipart POST；`sendMessage` |
| contract | short recording `<2s` rejects；max `60s` auto-stop；cancel threshold `56px`；`type=103`；body uses `media_id/url/duration_seconds/size_bytes` |
| target_owner | shared SDK owns duration/body/state；Web media adapter owns microphone/MediaRecorder/Blob cleanup；composer owns pointer UI only |
| verification_shape | SDK real SQLite state/body tests + injected MediaRecorder lifecycle tests + H5 hook/composer tests + all-runtime typecheck/build:web/full verify + browser capability/layout smoke |
| stop_condition | no real microphone prompt/recording/upload/send、audio file picker、waveform persistence、played/read/auto-next、progress/cancel upload、retry、download or RTC |

Local closeout: the composer now mirrors RN voice/keyboard switching、hold-to-record、56px upward cancel、2-second minimum and 60-second auto-stop. `chat-voice-recorder.ts` is the only browser microphone/MediaRecorder owner and releases all tracks on stop、cancel、start failure and asynchronous recorder failure；`WebIMSync.messages.sendAudio` is the only upload/Gateway/SQLite caller. H5 15/56、SDK 36/111、466 assets、all-runtime typecheck、build:web/full verify and 390x844/760x900 no-overflow proof passed. Browser proof toggled voice mode only；no microphone prompt、recording、file upload or message transmission was executed.

## Earlier Closed Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.3-chat-album-video-send-core` |
| goal | 将 RN `mixed` 相册中的视频选择、元数据、OSS 上传、Gateway send 与 SQLite 状态收敛迁入 H5 |
| production_flow | RN `useChatMediaPicker` -> `assertChatMediaAssetAllowed` -> `sendVideoMessage` -> upload credential/OSS -> Gateway video body -> local message repositories |
| operations | `getUploadCredential`；OSS multipart POST；`sendMessage`，与图片/文件复用同一 shared optimistic state owner |
| contract | album image/video total `<=12`；video MIME must be browser video；single video `<=500 MB`；duration/width/height come from browser metadata；`type=104`；snapshot uses RN OSS `t_7000` rule |
| target_owner | shared SDK owns limit/body/state；Web App owns `File` selection and HTML video metadata I/O；page only calls `WebIMSync.messages.sendVideo` |
| verification_shape | real SQLite facade tests + H5 mixed-selection/metadata tests + SDK all-runtime typecheck/build:web + H5 full verify + responsive browser smoke |
| stop_condition | no caption/pending attachment、camera、audio/voice、upload progress/cancel、retry、local thumbnail generation、real unauthorized send or RTC |

Local closeout: mixed album selection now preserves image/video order and validates a shared maximum of 12 items、10 MB images and 500 MB videos before I/O. The browser reads duration/width/height through a short-lived `HTMLVideoElement`; `WebIMSync.messages.sendVideo` owns upload、RN-compatible snapshot URL、Gateway `type=104` body and SQLite `sending -> sent/failed`. H5 13/50、SDK 35/109、466 assets、all-runtime typecheck、build:web/full verify and 390x844/760x900 no-overflow proof passed. No real file was uploaded or message transmitted without explicit authorization.

## Earlier Closed Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.2-chat-image-file-send-core` |
| goal | 迁移 RN 相册图片与普通文件发送主链，保持 Gateway/OSS/SQLite 真实状态收敛 |
| source_anchor | RN `ChatComposer/ComposerActionPanel`、`useChatMediaPicker`、`gatewayUploadService`、`openIMService.sendImageMessage/sendFileMessage` |
| target_owner | `../im28-sdk/src/sync` shared send state + `../im28-sdk/src/platforms/web` OSS adapter + H5 chat composer caller |
| operations | `getUploadCredential`；OSS multipart POST；`sendMessage` |
| limits | album `<=12`；image `<=10 MB`；ordinary file `<=100 MB`；selected items send sequentially |
| expected_deliverable | SQLite optimistic `sending`、success `sent`、any-stage `failed`；RN two-item attachment panel and hidden browser file inputs |
| verification_shape | real SQLite facade tests + browser upload adapter tests + H5 picker/view tests + build:web/typecheck/build/full verify + guest guard |
| stop_condition | no page Gateway/fetch、mock URL/fake success、caption/pending draft、camera/video/audio/recording、upload progress/cancel、retry、file download or RTC |

Local closeout: shared `message-send-state` now owns conversation guard、stable client ID and SQLite `sending -> sent/failed` for text/image/file；`message-media-send` owns 10 MB/100 MB limits and Gateway image/file body；the Web adapter alone owns credential-backed OSS `FormData`. H5 exposes only RN album/file actions, validates max 12 images/browser MIME/size, preserves selection order and renders the SDK-persisted `sending` entity. H5 12/46、SDK 33/107、466 assets、all-runtime typecheck、full verify/build、changeset/pack and 390x844/760x900 no-overflow proof passed. No real message was transmitted during browser proof because that requires explicit authorization.

## Closed Slice W6.a6.1

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.1-chat-media-read-core` |
| goal | 将聊天页已有图片、语音、视频真实 payload 从静态投影升级为 RN 对应的只读媒体交互 |
| source_anchor | RN `ChatMessageBody`、`ImagePreviewModal`、`VideoPreviewModal`、`useChatSoundPlayback`；Gateway `AudioMessage/ImageMessage/VideoMessage` |
| target_owner | `apps/web/src/pages/chat` feature-local message projection、single media controller and full-screen overlays |
| expected_deliverable | image full-screen preview、one-active-audio play/stop/error state、native video full-screen controls；route exit cleanup and unsafe/missing URL fail-closed |
| verification_shape | pure message/media view tests + H5 app tests + Web typecheck/build/full verify + anonymous guard |
| stop_condition | no SDK/page transport、mock media、image save/file download、media send/upload、voice recording、played/read sync、auto-next、retry or RTC |

## Closed Slice W6.a5.2.14

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.14-contact-user-search-core` |
| goal | 迁移 RN 联系人用户搜索主链，并让本地好友结果和远端用户结果统一进入既有联系人资料页 |
| source_anchor | RN `ContactListScreen -> ContactSearchScreen`；shared `searchUsers` Gateway operation and existing contact/profile owners |
| target_owner | `../im28-sdk/src/sync/contact-sync.ts` + `apps/web/src/pages/contacts/ContactSearchPage.tsx` + Contacts/App route callers |
| expected_deliverable | authenticated normalized user search、self-filter/dedupe、local friend match、RN search/result states and React Router navigation |
| verification_shape | facade auth/normalization/dedupe/failure tests + view tests + build:web/verify + guest/responsive/theme/history smoke |
| stop_condition | no group search/join、search-page friend apply、page Gateway calls、fake results/success、second profile or search storage owner |

## Closed Slice W6.a5.2.13

| field | value |
| :--- | :--- |
| slice_id | `W6.a5.2.13-contact-profile-core` |
| goal | 将联系人行默认行为接入 RN 个人资料主链，并通过真实 Gateway 资料、单聊创建和好友申请 operation 闭环 |
| source_anchor | RN `ContactListScreen -> UserProfileScreen`；shared `getUserDetail/getFriend/openDirectConversation/applyFriend` + conversation repositories |
| target_owner | `../im28-sdk/src/sync/peer-profile-sync.ts` + `apps/web/src/pages/contacts/ContactProfilePage.tsx` + App route/ContactRow caller |
| expected_deliverable | authenticated profile normalization、friend/stranger/self state、RN avatar/name/nickname/ID/bio、success-only send-message/add-friend actions and stable SPA route |
| verification_shape | auth/normalization/persistence/mutation/failure tests + pure view tests + build:web/verify + guest/responsive/theme/history smoke |
| stop_condition | no RTC、presence、remark/star/delete/blacklist/common-groups/share/group-member context、page fetch、mock profile、fake navigation or second conversation owner |

## Residual Ledger

| item | type | note | seed_for_next_slice |
| :--- | :--- | :--- | :--- |
| Gateway runtime | verification | real login、refresh restore、Gateway-backed reads、two-account tab isolation、dual WebSocket online and text delivery/SQLite convergence/list-back passed；offline SQLite-hit remains unproven | yes |
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
| Blacklist core | migration/verification | authenticated real list empty-state passed；non-empty enrichment/search、theme/history and approved remove proof remain | yes |
| Friend applications core | migration/verification | authenticated 5-row real list plus 390x844/760x900 light/dark and route-history/reload passed；pending sample and approved accept proof remain | yes |
| Group applications core | migration/verification | authenticated empty-state plus 390x844/760x900 light/dark and route-history/reload passed；non-empty owner/admin detail and approved handle proof remain | yes |
| Joined groups core | migration/verification | authenticated 11-group list、member/status/role、name/ID/unknown search and Chromium responsive/theme/history proof passed；open-conversation persistence、offline isolation and Safari/Firefox remain | yes |
| Contact profile core | migration/verification | authenticated friend/self/unknown failure plus Chromium responsive/history proof passed；conversation persistence、real stranger and friend apply remain | yes |
| Contact user search core | migration/verification | known local/remote result、self filtering、unknown no-result and Chromium responsive proof passed；transport/business failure and Safari/Firefox remain | yes |
| Chat media read core | migration/verification | real image/audio/video payload projection、single audio owner and full-screen image/video overlays are implemented-local；approved authenticated media playback and visual proof absent | yes |
| Chat image/file send core | migration/verification | shared optimistic state、Web OSS adapter、RN attachment panel and default facade callers are implemented-local；an explicitly authorized real upload/send and final Network/cache proof are absent | yes |
| Chat album video send core | migration/verification | mixed selection、browser metadata、shared video body/snapshot and SQLite state are implemented-local；an explicitly authorized real upload/send and final Network/cache proof are absent | yes |
| Chat voice send core | migration/verification | RN voice composer、browser recorder lifecycle、shared audio body and SQLite state are implemented-local；real microphone、recording/upload/send and authenticated Network/cache proof are absent | yes |
| Chat forward UI/core | migration/verification | shared core and H5 flow are implemented；authorized normal origin/list-back and hidden-origin removal pass；real partial-result and desktop visual proof remain | yes |
| Chat auto-delete core | migration/verification | schema v11、strict detail/update、type1701 convergence and RN nine-option route are done-local；real update、second-account realtime/list-back and theme/desktop proof remain | yes |
| General settings residual | migration/contract | real reads plus Chromium 390x844/760x900 light/dark passed；network blocked-browser、cache blocked-storage；writes、update-available and Safari/Firefox proof pending；notification title semantic debt is shared with RN | yes |
| Contacts index parity | resolved | RN 同版本/同参数 `pinyin-pro`、中文/多音/拉丁/fallback 回归和真实 `A/D/Z/H` 分组均已通过；词典已随 `/contacts` 按路由加载，不进入其他页面首包 | no |
| Primary tab shell | migration | global owner、四个 routes and `/me` 390x844/760x900 light/dark proof passed；friend/group application badge and real logout proof remain | yes |
| Calls real-account parity | migration/verification | real 2-row cache/sync、all/missed filters and 390x844/760x900 light/dark proof passed；delete and non-missed/duration samples remain | yes |
| Verification code send | API gap | Gateway OpenAPI 无发送验证码 operation；页面只展示固定 `666666` 联调约束，不制造发送成功态 | yes |
| Contact security mutation | API gap | phone/email security rows are read-only because send-code operation is absent；不制造绑定/换绑成功态 | yes |
| RN asset mirror | resolved | 466 文件按源路径复制并由 SHA-256 verify gate 保护 | no |
| snapshot failure poisoning | resolved | fatal discard、subsequent reject、close no-repersist 与 Worker terminate 回归通过 | no |
| Initial Git commit | resolved | `main/origin/main` 已存在 `07a0424` baseline；该外部提交发生于 W6.a3 执行期间 | no |

## Latest Closeout Verdict

| field | value |
| :--- | :--- |
| closed_slice | `W6.closeout` |
| deliverable_verdict | `done-local/acceptance-gated` |
| gate_verdict | `SDK focused all-runtime and H5 verify passed；RN tsc、ChatDetail 166/166 and full Jest 164/164 suites、1369/1369 tests passed；boundary、duplicate-owner and fake-success audits passed` |
| debt_or_drift | `RN clearGateway/local whole-delete/OpenIM fallback/old type2102 business branches removed；H5 owns scope presentation only；local RN regressions are zero；real mutation、dual-account realtime/list-back、RTC/browser matrix and Jest open handles remain external or accepted-debt gates；build:package:desktop:web unchanged` |
| next_activation_decision | `local closeout is complete；activate only an explicitly authorized external acceptance slice，and never execute real self/both/all_members clear by inference` |

## Latest Cross-Runtime Closeout Verdict

| field | value |
| :--- | :--- |
| closed_slice | `W6.a6.12.1.5-message-search-consumer-convergence` |
| deliverable_verdict | `converged/acceptance-gated` |
| primary_path | `RN/Web actual callers -> createIMMessageSearchSync -> shared query validation + visible-body filter + MessageRepository.search/pagination；platform code retains parameter、DTO、sender and UI projection only` |
| gate_verdict | `SDK 58/184、all-runtime boundary/typecheck/build、RN tsc、8 search-service + 28 search-page tests、H5 55/179 verify/build passed` |
| debt_or_drift | `RN direct local-store Repository search、duplicated visible-body filtering and legacy search result types removed；search remains cache-only with no Gateway mutation；RN Jest requires forceExit because of pre-existing open handles` |
| next_activation_decision | `activate RN/Web realtime-message consumer convergence；do not modify build:package:desktop:web` |

## Closed Slice W6.a6.20.26

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.26-chat-custom-emoji-bubble-preview` |
| goal | 对齐 RN type115 自定义表情气泡真实比例、历史消息尺寸探测和无工具栏纯图片预览 |
| source_anchor | RN `CustomEmojiMessageContent`、`CustomEmojiPreviewModal`、`imageMediaSizeFromDimensions` |
| target_owner | H5 `ChatCustomEmojiMessageContent` + existing `ChatMediaInteractionProvider/getChatMediaPreview` |
| deliverable_verdict | `implemented-local/acceptance-gated` |
| verification | focused 3 files/15 tests；full Web SDK 89/371；466 assets；boundary/typecheck；1125-module production build；真实群聊 412px 零 overflow/error/broken image |
| preserved_boundaries | RN source clean；SDK source未改；仅执行 `build:web/sync:web`；普通图片保存、type115 收藏/发送/管理逻辑不变；`build:package:desktop:web` 未修改或执行 |
| acceptance_gate | 当前真实会话没有 type115 样本，未注入假消息，气泡比例与纯预览真实点击仍待自然样本只读验收 |

Residual ledger addition: `Chat custom emoji bubble preview` is implemented-local；真实 type115 气泡、横/竖资源视觉和点击关闭仍 sample-gated，且不得为验收伪造或发送消息。

## Closed Slice W6.a6.20.27

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.27-chat-initial-unread-navigation` |
| goal | 对齐 RN 聊天首入页未读边界、未读计数入口和用户滚动保护，不扩张为服务端已读 mutation |
| source_anchor | RN `chatDetailScrollHelpers`、FlatList `viewabilityConfig=80%`、last-read/first-unread scroll flow |
| target_owner | SDK `initial-unread-navigation.ts` + H5 `useChatUnreadNavigation/ChatMessageList` |
| deliverable_verdict | `shared-core-ready/web-consumed/rn-frozen/acceptance-gated` |
| verification | SDK focused 1 file/3 tests；H5 focused 2 files/8 tests；full Web SDK 90/374；466 assets；boundary、SDK RN/Web/Desktop + H5 typecheck；1127-module build；真实 412px zero false-positive/overflow/error and at-latest |
| preserved_boundaries | RN worktree clean；仅 `build:web/sync:web` 生成 H5 包；没有 markRead/read receipt/Repository/Gateway mutation；`build:package:desktop:web` 未修改或执行 |
| acceptance_gate | 当前真实会话没有非零 unread 样本；当前 50 条之外分页、非零分割线/浮层滚动和服务端已读收敛待独立切片/联调 |

Residual ledger addition: `Chat initial unread navigation` 已完成 shared 只读规则与 H5 当前窗口 UI；非零未读真实样本、跨窗口分页和 mark-read/read receipt 不在本片完成声明内。

## Closed Slice W6.a6.20.28

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.28-chat-visible-unread-read-convergence` |
| goal | 对齐 RN 可见未读提交门禁，并修复 shared partial read 提前清零问题 |
| source_anchor | RN `getViewableMessageListUpdate/reportUnreadReadSeq/useChatMessageListScroll` |
| target_owner | SDK `getIMVisibleUnreadReadSeq + conversations.markRead`；H5 `chat-unread-read-gate/useChatUnreadNavigation` |
| deliverable_verdict | `converged/local-verified/runtime-data-gated` |
| verification | SDK focused 2/8；H5 focused 2/4；full Web SDK 90/376；466 assets；boundary、SDK RN/Web/Desktop + H5 typecheck；1128-module build；真实 412px clean-reload zero false-positive/overflow/error |
| preserved_boundaries | `im28-phone` worktree clean；RN caller 签名/业务门禁不改；仅 `build:web/sync:web`；`build:package:desktop:web` 未修改或执行 |
| acceptance_gate | 当前真实会话无 unread 样本；非零 partial read、Gateway unread_count、Realtime 最新端 read 和 list-back 仍需双账号/自然数据联调；dev HMR 曾产生一次 Provider 顺序 error，干净 reload 不复现，登记为 HMR 债务 |

Residual ledger addition: `Chat visible unread read convergence` 已闭合 shared 规则、partial cache 安全和 H5 调用链；真实非零网络结果与跨窗口未读分页仍 acceptance-gated。

## Closed Slice W6.a6.20.118

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.118-chat-header-presence` |
| goal | 对齐 RN 单聊在线/离线和普通群在线人数头部状态 |
| primary_path | `ChatPage -> useObservedUserPresence -> WebIMSync.presence -> buildChatHeaderPresenceView -> ChatHeader` |
| deliverable_verdict | `shared-core-ready/web-consumed/rn-frozen/local-verified` |
| verification | H5 focused 2 files/8 tests、typecheck、production build；真实 412px 单聊离线与普通群 1 人在线、零 overflow/error |
| preserved_boundaries | SDK business source 与 RN source 均未修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| acceptance_gate | large 群、未知状态自然窗口和 realtime 在线切换仍需真实样本；2 人在线聚合已由纯投影回归覆盖 |

## Closed Slice W6.a6.20.119

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.119-group-management-applications-entry` |
| goal | 对齐 RN 群管理“入群申请”入口、待处理数量、无权限提示和来源返回链 |
| primary_path | `GroupManagementPage -> WebIMSync.groupApplications.list -> countPendingGroupApplications -> GroupApplicationsPage` |
| deliverable_verdict | `implemented-local/web-consumed/runtime-data-gated` |
| verification | H5 focused 2 files/8 tests、full 137 files/435 tests、typecheck、466 assets、production build；真实群主管理入口与两类返回地址、零 console error |
| preserved_boundaries | SDK 业务源码与 RN source 均未修改；只执行 Web SDK build/sync；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| acceptance_gate | 当前真实群没有 pending 申请，非零角标、管理员/普通成员无权限视觉和 accept/reject mutation 仍待自然样本或独立授权 |

## Closed Slice W6.a6.20.120

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.120-chat-header-group-applications` |
| goal | 对齐 RN 群聊头部待审核入群申请角标及头部来源返回聊天链 |
| primary_path | `ChatPage -> useChatGroupApplicationCount -> groupApplications.list -> countPendingGroupApplications -> ChatHeader` |
| deliverable_verdict | `implemented-local/web-consumed/natural-data-gated` |
| verification | focused 4 files/13 tests、H5 full 139 files/440 tests、typecheck、466 assets、production build；真实 412px 群聊零误显、header 412/412、零 warning/error |
| preserved_boundaries | SDK business source 与 RN protected source 均未修改；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| acceptance_gate | 当前真实账号没有 pending 群申请；非零角标点击、申请处理后刷新与 owner/admin realtime 更新仍待自然样本/独立授权 |

## Closed Slice W6.a6.20.121

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.121-chat-header-profile-navigation` |
| goal | 对齐 RN 单聊/群聊聊天标题区资料入口及来源返回链 |
| primary_path | `ChatHeader -> ChatPage navigate -> ContactProfilePage/GroupProfilePage -> shared profile/group facades` |
| deliverable_verdict | `implemented-local/web-consumed/local-verified` |
| verification | focused 3 files/9 tests、H5 full 140 files/443 tests、typecheck、466 assets、production build；真实 412px 群/单资料进入返回、412/412、零 warning/error |
| preserved_boundaries | SDK business/generated 与 RN protected source 均未修改；未运行 SDK RN/Web/Desktop/all 或 `build:package:desktop:web` |
| acceptance_gate | 默认主链已真实验收；直接 deep link 或刷新缺少 history state 时继续按安全默认路由返回，不接受任意 URL |

## Closed Slice W6.a6.20.122

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.122-me-profile-desktop-dark-readonly-acceptance` |
| goal | 关闭本人资料总览及三编辑 route 的 760×900 dark Chromium gate |
| deliverable_verdict | `browser-readonly-pass/profile-mutation-gated` |
| real_profile | `donk / 未知 / 未设置`；nickname=`donk`、gender=`未知 checked`、bio=`empty / 0/100` |
| visual | 四 route theme=`dark`、page=`17/19/24`、card/textarea=`27/29/36`、viewport/scrollWidth=`760/760`、零 warning/error |
| verification | focused 4 files/17 tests、Web typecheck、4 route HTTP 200、RN/SDK boundary/diff；display preference 已恢复 light |
| acceptance_gate | 真实 changed-value update Network/result、slow-saving pending、Safari/Firefox 和实体设备仍未执行 |

## Closed Slice W6.a6.20.123

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.123-account-security-desktop-dark-readonly-acceptance` |
| goal | 关闭账号安全总览、首次设置表单和账号状态 route guard 的 760×900 dark Chromium gate |
| deliverable_verdict | `browser-readonly-pass/credential-mutation-gated` |
| real_state | `+86 15555555551 / 未绑定 / 账号密码`；account/password/confirm 均为空，submit disabled |
| route_guard | 直达 `/me/security/password` 自动 replace 到 `/me/security/account`，未执行 reset |
| visual | theme=`dark`、page=`15/17/21`、card/form=`27/29/36`、input=`36/39/51`、viewport/scrollWidth=`760/760`、零 warning/error |
| verification | SDK 1 file/3 tests、H5 1 file/3 tests、Web typecheck、3 route HTTP 200、RN/SDK boundary/diff；display preference 已恢复 light |
| acceptance_gate | 已绑定账号 reset 自然表单、approved real set/reset Network/result/session cleanup、Safari/Firefox 和实体设备仍未执行 |

## Closed Slice W6.a6.20.124

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.124-forward-target-picker-desktop-readonly-acceptance` |
| goal | 关闭 `.54` 现行统一转发目标弹窗的 760×900 light Chromium gate |
| deliverable_verdict | `browser-readonly-pass/forward-partial-result-gated` |
| real_flow | 已读单聊文本右键 -> 转发 -> 当前聊天内 `ChatTargetPickerModal`；好友/群聊跨 Tab 选 2、群聊 ALL 后选 3 |
| visual | modal=`720×868`、left=`20`、grid=`720`、viewport/scrollWidth=`760/760`、theme=`light`、零 warning/error |
| safety | 未点击最终转发；关闭后 URL 不变、消息行仍为 2；无 Gateway/SQLite/send/list-back，未制造旧 pending preview state |
| verification | focused 5 files/14 tests、Web typecheck、2 route HTTP 200、RN/SDK boundary/diff；运行时零改动 |
| acceptance_gate | 可控 real partial-result、Safari/Firefox、物理长按与实体设备继续 gated |

## Closed Slice W6.a6.20.149.13

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.149.13-forward-preview-rn-parity` |
| goal | 将 H5 转发预览收敛为冻结 RN 生产结构，并保持草稿不自动发送 |
| primary_path | `ChatForwardComposer -> ChatForwardPreviewModal -> getChatMessageView/ChatMessageContent -> existing forward submit` |
| deliverable_verdict | `complete-local/browser-readonly-pass/send-result-gated` |
| visual | 382×786；panel=`350×471.6`、menu=`200×192`、selector=`30×30`、3 outgoing bubbles、零 warning/error |
| interaction | 反选标题 `3 -> 2 -> 3`；隐藏发送者 subtitle `会看到 -> 看不到` 且来源头 `3 -> 0 -> 3`；未触发发送 |
| verification | focused 2/7、H5 full 150/497、466 assets、Web typecheck、1203-module build、diff check |
| preserved_boundaries | SDK 与 RN protected source 零改动；未执行任何 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web` |
| acceptance_gate | Figma 登录后像素对照、Safari/Firefox、物理触摸和真实 forward partial-result/list-back 仍 gated |

## Closed Slice W6.a6.20.125

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.125-chat-text-search-desktop-history-acceptance` |
| goal | 关闭单聊文本搜索的 760×900 light/dark、稳定 messageID 与 history gate |
| deliverable_verdict | `local-verified/text-history-desktop-pass` |
| real_flow | 搜索 `123` -> 当前账号缓存命中 -> `messageID=61da...c104` -> 目标行；back 恢复 `/search?q=123&tab=all` 和结果，forward 再次定位同一行 |
| visual | light page/card=`#f7f7f7/#ffffff`；dark page/card/input=`#111318/#1b1d24/#242733`；两者 viewport/scrollWidth=`760/760`、零 warning/error |
| safety | cache-only；无 Gateway/WebSocket/send/download/mutation；不把日期/媒体/文件纳入文本验收 |
| verification | focused 3 files/8 tests、Web typecheck（含 SDK build:web/sync:web）、2 route HTTP 200、diff/RN/SDK boundary |
| acceptance_gate | indexed category desktop/history/theme、Safari/Firefox、动画活动帧和实体设备 |

## Closed Slice W6.a6.20.126

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.126-chat-indexed-search-desktop-history-acceptance` |
| goal | 关闭日期、媒体、文件索引搜索的 760×900 light/dark、reload 与 history gate |
| deliverable_verdict | `local-verified/indexed-desktop-history-pass` |
| real_flow | 日期 3 月 -> 真实 8/13 结果 -> 稳定 messageID -> back 恢复；扩展 4 月后 reload 保持；媒体视频筛选和文件空态 reload 保持 |
| visual | light page/card=`#f7f7f7/#ffffff`；dark page/card/input=`#111318/#1b1d24/#242733`；各页 viewport/scrollWidth=`760/760` |
| safety | cache-only；`months` 1..120，未知 view/filter 收敛；无 Gateway/WebSocket/send/download/mutation，不改 SDK/RN |
| verification | helper 1/5、H5 full 140/445、Web typecheck、466 assets、1188-module build、3 route HTTP 200、diff/RN/SDK boundary；clean reload 日志增长 0 |
| acceptance_gate | 当前非空媒体/文件自然样本、Safari/Firefox、媒体预览活动帧和实体设备 |

## Audited Slice W6.a6.20.127

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.127-indexed-media-file-natural-data-audit` |
| goal | 在无发送、无 mark-read、无第二 writer 条件下寻找当前非空媒体/文件样本 |
| deliverable_verdict | `blocked-natural-data/runtime-clean` |
| real_flow | 会话列表 4 个真实 ID -> 每个媒体/文件索引 route -> 共 8 个明确空态 -> 返回列表未读仍为 2+2 |
| visual | 412×786 light，viewport/scrollWidth=`412/412`，warning/error=`0` |
| safety | 未打开聊天、未 mark-read；无 fixture、上传、发送、下载、Gateway mutation、SDK/RN/runtime 改动 |
| acceptance_gate | 任一当前会话自然出现 type102/104/105 后补非空预览活动帧；跨浏览器和实体设备仍 gated |

## Closed Slice W6.a6.20.149.20

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.149.20-group-member-picker-modal-parity` |
| goal | 将邀请群成员与移除群成员从独立全屏页收敛为群设置页上的共用底部选择弹窗 |
| deliverable_verdict | `completed-local/browser-readonly-pass/mutation-gated` |
| primary_path | `ChatSettingsPage modal route -> GroupMemberPickerModal -> existing invite/remove presentation -> WebIMSync.groupMembers` |
| visual | 382x786 light + dark；dialog=`382x471.59`、100% 宽、60dvh 高、设置背景存在、底部贴边、零横向溢出；深色搜索、候选、空态与禁用 CTA 无浅色硬编码 |
| verification | focused 4 files/20 tests、H5 full 152 files/505 tests、typecheck、1206-module production build；真实邀请空态、移除 2 位候选、disabled、关闭 replace 与 Chromium dark 只读验收 |
| preserved_boundaries | 未执行邀请/移除 mutation；SDK source/generated 零改动；RN 仅用户已有 `src/config/appVersion.ts`；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| acceptance_gate | 真实 mutation/第二账号 realtime/list-back、Safari/Firefox 和物理触摸仍 gated |

## Closed Slice W6.a6.20.149.21

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.149.21-chat-page-cache-owner-split` |
| goal | 收敛聊天页首屏恢复、实时缓存重读与搜索定位职责，不改变现有消息业务链 |
| deliverable_verdict | `completed-local/structural-pass/browser-readonly-pass` |
| primary_path | `ChatPage -> useChatPageCacheState -> WebIMSync conversations/messages cache facade -> ChatPage presentation` |
| structure | `ChatPage.tsx 698 -> 595`；新 hook 159 行、单一生产消费者；发送/转发/删除/录音/名片/通话 owner 不移动 |
| verification | focused 73 files/245 tests、H5 full 152 files/505 tests、typecheck、1207-module production build、diff check；382x786 真实群聊恢复与 Composer 只读烟测 |
| preserved_boundaries | SDK source/generated 零改动；RN 仅用户既有 `src/config/appVersion.ts`；未运行 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web` |
| acceptance_gate | 本片不扩大任何业务能力完成声明；现有 mutation、自然数据、RTC、跨浏览器/设备和验证码合同 gate 保持不变 |

## Closed Slice W6.a6.20.149.22

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.149.22-chat-composer-input-row-split` |
| goal | 收敛聊天输入行展示职责，同时保持唯一提交与业务编排 owner |
| deliverable_verdict | `completed-local/structural-pass/browser-readonly-pass` |
| primary_path | `ChatComposer orchestration -> ChatComposerInputRow -> existing ChatVoiceInput/text/emoji/action controls` |
| structure | `ChatComposer.tsx 419 -> 353`；新输入行 138 行、单一生产消费者；发送/转发/录音/附件/提及 owner 不移动 |
| verification | focused 4 files/14 tests、H5 full 152 files/505 tests、typecheck、1208-module production build、diff check；382x786 真实群聊输入与面板只读烟测 |
| preserved_boundaries | SDK source/generated 零改动；RN 仅用户既有 `src/config/appVersion.ts`；未运行 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web` |
| acceptance_gate | 本片不扩大任何业务能力完成声明；现有 mutation、自然数据、RTC、跨浏览器/设备和验证码合同 gate 保持不变 |

## Closed Slice W6.a6.20.149.23

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.149.23-chat-page-navigation-owner-split` |
| goal | 收敛聊天页 SPA 导航职责，不改变 shared runtime 或业务 mutation 链 |
| deliverable_verdict | `completed-local/structural-pass/browser-readonly-pass` |
| primary_path | `ChatPage -> useChatPageNavigationActions -> existing React Router routes/shared groups/conversations facade` |
| structure | `ChatPage.tsx 595 -> 514`；新 Hook 156 行、单一生产消费者；发送/cache/RTC/录音 owner 不移动 |
| verification | focused 4 files/10 tests、H5 full 152 files/505 tests、typecheck、1209-module production build、diff check；382x786 群资料往返只读验收 |
| preserved_boundaries | SDK source/generated 零改动；RN 仅用户既有 `src/config/appVersion.ts`；未运行 SDK/RN/Desktop/all build/sync 或 `build:package:desktop:web` |
| acceptance_gate | 名片、群申请、公告、发送等 mutation 未执行；现有自然数据、RTC、跨浏览器/设备和验证码合同 gate 保持不变 |

## Closed Slice W6.a6.20.149.24

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.149.24-chat-page-action-owner-split` |
| goal | 收敛聊天页消息 operation 与瞬时 UI 状态，同时保持 shared mutation/RTC/缓存语义不变 |
| deliverable_verdict | `completed-local/structural-pass/browser-readonly-pass` |
| primary_path | `ChatPage -> message/transient/composer/header hooks -> existing WebIMSync/WebIMCallProvider/presentation owners` |
| structure | `ChatPage.tsx 514 -> 399`；4 个页面 owner 独立持有消息 operation、名片/通话、草稿/提及和头部投影；cache owner 不再反向回调 UI |
| verification | focused 4 files/11 tests、H5 full 153 files/508 tests、Web typecheck、466 assets、1213-module production build、diff check；382x786 群名片/单聊通话弹层只读验收 |
| preserved_boundaries | 仅执行允许的 SDK `build:web/sync:web` 且 SDK clean；RN 仅用户既有 `src/config/appVersion.ts`；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| acceptance_gate | 未点击分享、发送或正式呼出；真实 mutation/RTC、跨浏览器/设备和验证码合同 gate 保持不变 |

## Closed Slice W6.a6.20.149.25

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.149.25-contact-profile-action-owner-split` |
| goal | 收敛联系人资料页动作编排，不改变 shared 联系人、通话、缓存或路由语义 |
| deliverable_verdict | `completed-local/structural-pass/browser-readonly-pass` |
| primary_path | `ContactProfilePage -> useContactProfileActions -> existing contacts/peerProfile/WebIMCallProvider/clipboard owners` |
| structure | `ContactProfilePage.tsx 467 -> 344`；新 Hook 208 行、单一生产消费者；页面保留读取、presence、群上下文与展示职责 |
| verification | focused 4 files/21 tests、H5 full 154 files/510 tests、Web typecheck、466 assets、1214-module production build、diff check；382x786 真实好友资料 cold reload/弹层只读验收 |
| preserved_boundaries | 仅执行允许的 SDK `build:web/sync:web` 且 SDK clean；RN 仅用户既有 `src/config/appVersion.ts`；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| acceptance_gate | 未执行复制、打开会话、通话、星标、备注、黑名单或删除好友；真实 mutation/RTC、跨浏览器/设备和验证码合同 gate 保持不变 |

## Closed Slice W6.a6.20.149.26

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.149.26-contacts-page-action-owner-split` |
| goal | 收敛通讯录联系人动作编排，不改变 shared 联系人、通话、缓存、刷新或路由语义 |
| deliverable_verdict | `completed-local/structural-pass/browser-readonly-pass` |
| primary_path | `ContactsPage list owner -> useContactsPageActions -> existing peerProfile/contacts/WebIMCallProvider/React Router owners` |
| structure | `ContactsPage.tsx 406 -> 290`；新 Hook 200 行、单一生产消费者；页面保留 cache-first 读取、刷新、分组索引与列表展示 |
| verification | focused 3 files/7 tests、H5 full 155 files/512 tests、Web typecheck、466 assets、1215-module production build、diff check；382x786 真实 2 联系人列表只读验收 |
| preserved_boundaries | 仅执行允许的 SDK `build:web/sync:web` 且 SDK clean；RN 仅用户既有 `src/config/appVersion.ts`；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| acceptance_gate | 未执行打开会话、分享名片、正式呼出或删除好友；真实 mutation/RTC、跨浏览器/设备和验证码合同 gate 保持不变 |

## Closed Slice W6.a6.20.149.27

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.20.149.27-conversations-page-state-owner-split` |
| goal | 收敛普通会话列表的缓存与刷新状态，不改变 shared 同步、presence、动作、路由或展示语义 |
| deliverable_verdict | `completed-local/structural-pass/browser-readonly-pass` |
| primary_path | `ConversationsPage presentation/navigation -> useConversationsPageState -> existing WebIMSync/useConversationPresence owners` |
| structure | `ConversationsPage.tsx 398 -> 279`；新 Hook 152 行、单一生产消费者；`useConversationActions` 继续独立拥有 mutation |
| verification | focused 4 files/4 tests、H5 full 156 files/513 tests、Web typecheck、466 assets、1216-module production build、diff check；已登录 4 会话列表只读烟测 |
| cleanup | `P0/P1 zero`；无孤立导出、重复 owner、compat wrapper、TODO/FIXME/HACK 或调试日志；仓库无 convergence script |
| preserved_boundaries | 仅执行允许的 SDK `build:web/sync:web` 且 SDK clean；RN 仅用户既有 `src/config/appVersion.ts`；未运行 RN/Desktop/all 或 `build:package:desktop:web` |
| acceptance_gate | 未执行下拉刷新、打开会话、已读、置顶、静音、归档或删除；真实 mutation、realtime 双端结果、跨浏览器/设备和验证码合同 gate 保持不变 |
