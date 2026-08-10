# IM28 H5 Foundation Status

- status: `active`
- current_step: `W6.a6.6 illustrated preset emoji contract done；W6.a6.6.1 shared core active`
- next_step: `move preset DTO/descriptor/document/entity semantics into im28-sdk；close Web send/cache gaps and make RN files thin adapters before H5 UI`
- blockers: `W5.a3 browser matrix remains blocked-environment; W3.real-gateway and final data-backed acceptance require Gateway test credentials`
- gate_state: `W6.a6.6 source/API/owner/anti-fake contract passed；shared implementation pending；real transmission remains authorization-gated`
- latest_evidence: `2026-08-10 preset trace: RN 135 unique preset IDs/133 fallback values、Gateway entities request/response schema present、SDK Message mapper/send/cache gap proven、H5 135 mirrored PNG assets present`

## Current Readout

| dimension | state | note |
| :--- | :--- | :--- |
| pack | `active` | W3/W4/W5 保留外部门；W6.a6.6 contract closed and W6.a6.6.1 is the only active implementation slice |
| `W1` | `done` | H5 规则、架构和存储 SSOT 已落库 |
| `W2` | `done` | H5 app、独立 multi-runtime SDK Git repository、Vite React Router App 与跨仓构建验证链已落地 |
| `W3` | `gated` | browser orchestration、account SQLite 与 privacy gate 已通过，等待真实 smoke |
| `W4` | `gated` | HTTP MVP、默认 routes、新消息/会话/update 与 same-tab ordering 已本地完成；真实 flow gated |
| `W5` | `gated` | W5.a1/W5.a2 done-local；W5.a3 code done-local，真实三浏览器矩阵 pending |
| `W6` | `active` | W6.a6.5 done-local；W6.a6.6 contract done；shared preset core active；custom emoji、real send and external/data gates remain open |

## Active Slice Definition

| field | value |
| :--- | :--- |
| slice_id | `W6.a6.6.1-shared-preset-emoji-core` |
| goal | establish one cross-runtime preset entity/document owner in `im28-sdk` and close Web text send/map/SQLite persistence without adding H5 UI yet |
| production_flow | shared descriptor/document -> `sendText({ text, entities })` -> Gateway top-level entities -> core Message/SQLite -> cached history |
| target_owner | SDK core owns DTO/algorithms/descriptors；transport/sync/repository own wire/state；RN local files become thin asset/MessageItem adapters |
| verification_shape | shared normalize/document/mapper tests + real SQLite optimistic/sent/missing-echo tests + `build:rn`/`build:web` + RN/H5 typecheck |
| stop_condition | no H5 illustrated tab/render、draft persistence、edit/forward/retry、rich clipboard、custom emoji type `115` or real message transmission |

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
| Contact profile core | migration/verification | contact row、profile/add routes、shared user/friend normalization、conversation persistence and success-only apply are implemented-local；approved account Network/result and visual/history proof absent | yes |
| Contact user search core | migration/verification | `/contacts/search`、local friend match、shared authenticated user search and profile navigation are implemented-local；approved account local/remote Network/result and visual/history proof absent | yes |
| Chat media read core | migration/verification | real image/audio/video payload projection、single audio owner and full-screen image/video overlays are implemented-local；approved authenticated media playback and visual proof absent | yes |
| Chat image/file send core | migration/verification | shared optimistic state、Web OSS adapter、RN attachment panel and default facade callers are implemented-local；an explicitly authorized real upload/send and final Network/cache proof are absent | yes |
| Chat album video send core | migration/verification | mixed selection、browser metadata、shared video body/snapshot and SQLite state are implemented-local；an explicitly authorized real upload/send and final Network/cache proof are absent | yes |
| Chat voice send core | migration/verification | RN voice composer、browser recorder lifecycle、shared audio body and SQLite state are implemented-local；real microphone、recording/upload/send and authenticated Network/cache proof are absent | yes |
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
| closed_slice | `W6.a6.4-chat-voice-send-core local implementation` |
| deliverable_verdict | `implemented-local/acceptance-gated` |
| gate_verdict | `ChatVoiceInput -> useChatVoiceRecorder -> browser recorder adapter -> WebIMSync.messages.sendAudio -> shared audio/state owner -> Web OSS adapter -> Gateway is the only production path；H5 15/56、SDK 36/111、466 assets、all-runtime typecheck、full verify/build and responsive voice-mode proof passed` |
| debt_or_drift | `no parallel recorder/message/cache/upload owner、page transport、mock Blob or fake success found；real microphone、OSS/Gateway send and authenticated cache projection were not executed without explicit authorization` |
| next_activation_decision | `retain real authorized voice record/send as acceptance gate；freeze audio picker、waveform、played/read/auto-next、progress/cancel/retry/download/RTC and the next implementation slice separately` |
