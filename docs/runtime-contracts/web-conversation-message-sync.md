# Web Conversation And Message Sync Contract

> TYPE: `SPEC`; STATUS: `W4_LOCAL_MVP`; REMOTE_TRUTH: `Gateway`; LOCAL_CACHE: `SQLite`

## Axioms

| rule | constraint |
| :--- | :--- |
| remote truth | Gateway 是会话与消息真相源；SQLite 仅是可重建 cache |
| browser owner | 页面只能调用 `@im28/im-sdk/web` runtime/sync API，不直接调用 Gateway 或 Repository |
| shared semantics | Gateway DTO、HTTP client、Repository、database contract 复用 `@im28/im-sdk/core` |
| failure | remote failure 必须 reject；禁止返回 fake empty、fake sent 或静默成功 |
| auth binding | sync 只能使用当前已认证 user 与已打开 account SQLite |
| operation budget | HTTP 首批冻结 `list conversations`、`pull history`、`send text`；实时片只接收新消息与会话变更 |

## Ownership

| layer | owner | responsibility |
| :--- | :--- | :--- |
| transport/core | `@im28/im-sdk/core` | Gateway client、DTO -> core mapping、Repository、schema |
| browser orchestration | `../im28-sdk/src/sync/**` | cache-first read、remote sync、optimistic send、failure convergence |
| lifecycle | `../im28-sdk/src/platforms/web/runtime/**` | auth session、Gateway clients、account DB、realtime lifecycle |
| UI | `apps/web/src/pages/**` | React Router pages、loading/error/empty state、user commands |

## Operations

| operation | input | remote call | durable result | failure result |
| :--- | :--- | :--- | :--- | :--- |
| `listConversations` | `limit/offset` | none | SQLite ordered list | DB error rejects |
| `listConversationItems` | `limit/offset/archived` | none | SQLite ordered conversations + latest message rows | DB error rejects |
| `syncConversations` | optional page limit | `listConversations` until page token empty | save latest messages -> atomic `replaceAll` conversations | existing cache unchanged; reject |
| `getMessageHistory` | conversation, window | none | SQLite history, newest first | DB error rejects |
| `pullMessageHistory` | conversation, `fromSeq`, limit | `pullMessages` | mapped messages upserted; return SQLite window | existing cache unchanged; reject |
| `sendTextMessage` | conversation, trimmed text | `sendMessage` | local `sending` -> remote `sent`; conversation latest message updated | local message -> `failed`; reject |

## Mapping Contract

| Gateway field | core field | rule |
| :--- | :--- | :--- |
| `conversation_id` | `Conversation.conversationID` | required, non-empty |
| `type` / nested kind | `Conversation.type` | direct -> `single`; group -> `group`; otherwise `unknown` |
| peer/group identity | `Conversation.targetID` | direct user ID or group ID; missing identity rejects |
| `last_message` IDs | `latestMessageID` | prefer `client_msg_id`, fallback `msg_id` |
| `unread_count` | `unreadCount` | decimal uint64 -> bounded JS number |
| `msg_id/client_msg_id` | `Message` IDs | at least one required; missing client ID falls back to server ID |
| current user vs `sender_id` | `direction` | same user -> `outgoing`; otherwise `incoming` |
| Gateway status | `Message.status` | success -> `sent`; failed -> `failed`; recalled -> `revoked`; inbound default -> `received` |
| `body` | `Message.payload` | preserve structured body; UI does not parse transport envelope |

## Ordering And Consistency

1. `syncConversations`: fetch all pages -> map all DTOs -> upsert all available latest messages -> `replaceAll(conversations)`.
2. IF any remote page or mapping fails THEN do not replace conversation cache.
3. `sendTextMessage`: persist stable `clientMsgID` with `sending` -> call Gateway -> upsert remote message as `sent` -> update conversation latest pointer.
4. IF send rejects THEN transition the same local row `sending -> failed` and rethrow.
5. `syncConversations`、`pullMessageHistory`、`sendTextMessage` 与 realtime data event 必须通过 `WebIMSync` 组合根创建的同一 FIFO mutation queue；单次网络请求及其完整写入不可与后入队 operation 交错。
6. 每个 mutating operation 在入队时冻结 user/database owner；前序失败向原调用方 reject，但不得阻断后续 operation。
7. 新消息先按稳定 ID 判断是否已存在；重放事件只幂等更新消息，不重复增加 unread。
8. IF event 标记 `degraded`，或最小新 seq 大于本地 `lastMsgSeq + 1`，THEN 从本地 cursor 分页执行 `pullMessages(desc=false)`，直到 `has_more=false`；缺失/循环 cursor 或超过 100 页必须 reject，完整恢复后再合并事件消息。
9. IF 新消息所属会话不在 cache，THEN 先持久化消息，再调用 `getConversation` 获取权威会话并 upsert；远端失败必须交给 background error reporter。
10. 会话事件只允许 delta upsert，不执行 `replaceAll`；其中携带的 latest message 必须先持久化。
11. 成功写入后 runtime 发布新的无凭据 snapshot，引导 React Router 当前页面重读 SQLite。

## Realtime Event Boundary

| normalized event | accepted payload | persistence behavior | unsupported behavior |
| :--- | :--- | :--- | :--- |
| `message` / `message.created` | 含稳定 message ID、sender 与 conversation ID 的单条或批量消息 | 幂等 upsert；缺口 HTTP recovery；更新 conversation latest/seq/unread | identity 不完整直接 reject 并报告 |
| `conversation` / `conversation.changed` | 可映射的完整会话 DTO | latest message -> conversation delta upsert | 不用不完整字段猜 target/type；可按 ID `getConversation` 恢复 |
| `message.update` | 编辑、撤回、删除批次 | 独立 update cursor、缺口恢复与 Repository 状态转换 | identity/type 不完整 reject；不构造 fake marker |

`event.data`、`data/payload/message/messages/conversation/conversations` 包装允许递归解包；JSON 字符串只在可解析时继续处理。未识别的 realtime kind 不属于数据错误，由对应未来 capability owner 消费。

## Message Update Contract

| rule | decision |
| :--- | :--- |
| cursor | 每个会话使用 `sync_cursors[message_updates:<conversationID>]` 保存独立十进制 `update_seq` |
| ordering | update 按 `update_seq` 升序串行应用；成功应用后才推进 cursor；不改变 `msg_seq` 或 unread |
| gap recovery | realtime `update_seq > cursor + 1` 时调用 `pullMessageUpdates(after_update_seq=cursor)` 分页恢复；缺失/循环 cursor 或页数超限 reject |
| edited | `update.message` 必须是可映射的完整 Gateway message；保留已有 client identity、sendTime 与 seq，仅替换服务端内容/状态并写 edit metadata |
| deleted | 先按 `target_msg_id` 查 server ID，再按 update message 的 client ID 查找；存在时调用 Repository 本地删除转换，重复删除幂等 |
| revoke vocabulary | Gateway 无独立 `revoked` update；`type=deleted, delete_scope=all` 是全员撤回语义，H5 与 phone 生产路径一致地从本地可见历史隐藏 |
| missing target | edit 可用完整 `update.message` 恢复目标；delete 目标不在 cache 时不构造 fake marker，但仍可推进已验证 update cursor |
| cursorless event | 可幂等应用 edit/delete，但不推进持久化 cursor；下一次 HTTP recovery 仍以最后有效 cursor 为准 |

## Acceptance Gates

| gate | evidence | status |
| :--- | :--- | :--- |
| contract freeze | this document + production anchors | `passed` |
| shared mapper | `gateway-domain-mappers.test.mjs` + shared SDK typecheck/build | `passed` |
| browser sync | 6 sql.js/Repository tests: pages、failure retention、history、send convergence | `passed-local` |
| default caller | `/login`; `/conversations`; `/conversations/:conversationID` use runtime sync facade | `passed-local: build + auth guard; conversation and chat 390x844 light/dark + 760px responsive proof` |
| realtime created/conversation | serialized persistence、replay、account isolation、paged gap recovery、runtime cache publication | `passed-local: 5 focused tests + workspace gate` |
| realtime message updates | edit、stale cursorless guard、gap recovery、delete-all、runtime publication | `passed-local: sql.js + raw WebSocket integration` |
| same-tab mutation ordering | delayed full sync -> realtime、history -> send -> realtime、failure continuation | `passed-local: 3 concurrency regressions` |
| real environment | login + conversation + history + send smoke | `blocked: Gateway variables absent` |

## W6.a4 Caller Projection

| page behavior | canonical operation | UI constraint |
| :--- | :--- | :--- |
| initial/cache refresh | `getCachedHistory(conversationID)` | loading/empty/error and ordered message projection only；no page SQL |
| remote history | `pullHistory(conversationID)` | remote failure stays visible/rejects；no fake empty success |
| text send | `sendText(conversationID, text)` | preserve `sending -> sent/failed` row；page does not synthesize sent state |
| realtime refresh | runtime snapshot `dataVersion` -> `getCachedHistory` | event persistence remains sync owner；page only rereads cache |

W6.a4 renders read-only snapshots for supported media/card payloads. Presence、group-member enrichment、voice/emoji/attachment upload、retry、playback and download remain absent until a named `@im28/im-sdk/web` facade owns their operation and failure semantics.

## Production Anchors

- `../im28-sdk/src/transport/gateway-http/**`
- `../im28-sdk/src/modules/conversation/repository.ts`
- `../im28-sdk/src/modules/message/repository.ts`
- `../im28-phone/src/services/openim/conversation-list-sync-service.ts`
- `../im28-phone/src/services/openim/openIMService.ts`
