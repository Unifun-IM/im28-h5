# IM28 H5 Foundation Status

- status: `active`
- current_step: `W6.a6.12.1 active；conversation settings、auto-delete、message forward/delete/edit/group mention/search RN/Web consumer convergence completed`
- next_step: `converge RN realtime-message normalization and cache consumers on the shared realtime owner`
- blockers: `W5.a3 browser matrix remains blocked-environment; W3.real-gateway and final data-backed acceptance require Gateway test credentials`
- gate_state: `settings/auto-delete/message forward/delete/edit/group mention/search converged；sync-realtime remains compat-debt；clear-history core blocked-by-convergence-gate`
- latest_evidence: `2026-08-11 neutral createIMMessageSearchSync consumed by RN/Web for current-account query validation、visible-body filtering and pagination；SDK 58 files/184 tests、all-runtime typecheck/build passed；RN tsc、8 search-service + 28 search-page tests passed；H5 55 files/179 tests、466 assets and production build passed`

## Current Readout

| dimension | state | note |
| :--- | :--- | :--- |
| pack | `active` | W3/W4/W5 保留外部门；forward normal/hidden accepted；message edit/delete shared core/H5 UI closed locally，real mutations and forward partial/desktop remain gated |
| `W1` | `done` | H5 规则、架构和存储 SSOT 已落库 |
| `W2` | `done` | H5 app、独立 multi-runtime SDK Git repository、Vite React Router App 与跨仓构建验证链已落地 |
| `W3` | `gated` | browser orchestration、account SQLite 与 privacy gate 已通过，等待真实 smoke |
| `W4` | `gated` | HTTP MVP、默认 routes、新消息/会话/update 与 same-tab ordering 已本地完成；真实 flow gated |
| `W5` | `gated` | W5.a1/W5.a2 done-local；W5.a3 code done-local，真实三浏览器矩阵 pending |
| `W6` | `active` | preset/custom/media/retry/quote/copy/edit local chains、SDK boundary、forward normal+hidden real flow and RN/Web message forward/delete/edit/group-mention/search single-track consumption done；realtime consumer convergence and real mutation residuals remain open |

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
| residual | authorized normal and hidden-sender sends now pass Gateway/cache/list-back；real partial-result and desktop visual proof remain `.14.3` gates |
| next | `W6.a6.14.3-forward-acceptance` partial-result/desktop remainder (`blocked-external`) |

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
| Chat forward UI/core | migration/verification | shared core and H5 flow are implemented；authorized normal origin/list-back and hidden-origin removal pass；real partial-result and desktop visual proof remain | yes |
| Chat auto-delete core | migration/verification | schema v11、strict detail/update、type1701 convergence and RN nine-option route are done-local；real update、second-account realtime/list-back and theme/desktop proof remain | yes |
| General settings residual | migration/contract | version done-local；network blocked-browser；cache blocked-storage；real update response、notification/permission writes and cross-browser proof pending | yes |
| Contacts index parity | resolved | RN 同版本/同参数 `pinyin-pro`、中文/多音/拉丁/fallback 回归和真实 `A/D/Z/H` 分组均已通过；词典已随 `/contacts` 按路由加载，不进入其他页面首包 | no |
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
| closed_slice | `W6.a6.18.3.2.1/.2 shared auto-delete core + H5 route` |
| deliverable_verdict | `done-local/mutation-acceptance-gated` |
| gate_verdict | `SDK Web 55/174、auto-delete focused 5/20、all-runtime typecheck/boundary/build:web sync、H5 focused 4/16、466 assets、full verify/build and authenticated 458px read-only role/route/nine-option proof passed` |
| debt_or_drift | `no page SQL/Gateway、second setting/cache/realtime owner、browser timer、retroactive purge、mock/fake result、RN runtime caller or build:package:desktop:web change；real update、second-account realtime/list-back and theme/desktop matrix remain explicit residuals` |
| next_activation_decision | `keep W6.a6.18.3.3.1 blocked；activate RN/Web message mutation consumer convergence next` |

## Latest Cross-Runtime Closeout Verdict

| field | value |
| :--- | :--- |
| closed_slice | `W6.a6.12.1.5-message-search-consumer-convergence` |
| deliverable_verdict | `converged/acceptance-gated` |
| primary_path | `RN/Web actual callers -> createIMMessageSearchSync -> shared query validation + visible-body filter + MessageRepository.search/pagination；platform code retains parameter、DTO、sender and UI projection only` |
| gate_verdict | `SDK 58/184、all-runtime boundary/typecheck/build、RN tsc、8 search-service + 28 search-page tests、H5 55/179 verify/build passed` |
| debt_or_drift | `RN direct local-store Repository search、duplicated visible-body filtering and legacy search result types removed；search remains cache-only with no Gateway mutation；RN Jest requires forceExit because of pre-existing open handles` |
| next_activation_decision | `activate RN/Web realtime-message consumer convergence；do not modify build:package:desktop:web` |
