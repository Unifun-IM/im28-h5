# Web Conversation And Message Sync Contract

> TYPE: `SPEC`; STATUS: `W4_LOCAL_MVP`; REMOTE_TRUTH: `Gateway`; LOCAL_CACHE: `SQLite`

## Axioms

| rule | constraint |
| :--- | :--- |
| remote truth | Gateway 是会话与消息真相源；SQLite 仅是可重建 cache |
| browser owner | 页面只能调用 `@im28/im-sdk-web` runtime/sync API，不直接调用 Gateway 或 Repository |
| shared semantics | Gateway DTO、HTTP client、Repository、database contract 复用 `@im28/im-sdk/web` |
| failure | remote failure 必须 reject；禁止返回 fake empty、fake sent 或静默成功 |
| auth binding | sync 只能使用当前已认证 user 与已打开 account SQLite |
| operation budget | HTTP 首批冻结 `list conversations`、`pull history`、`send text`；实时片只接收新消息与会话变更 |

## Ownership

| layer | owner | responsibility |
| :--- | :--- | :--- |
| transport/core | `@im28/im-sdk/web` | Gateway client、DTO -> core mapping、Repository、schema |
| browser orchestration | `packages/im-sdk-web/src/sync/**` | cache-first read、remote sync、optimistic send、failure convergence |
| lifecycle | `packages/im-sdk-web/src/runtime/**` | auth session、Gateway clients、account DB、realtime lifecycle |
| UI | `apps/web/src/pages/**` | React Router pages、loading/error/empty state、user commands |

## Operations

| operation | input | remote call | durable result | failure result |
| :--- | :--- | :--- | :--- | :--- |
| `listConversations` | `limit/offset` | none | SQLite ordered list | DB error rejects |
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
5. Realtime data events 在 runtime 级单队列串行处理，避免并发消息重复累计 unread 或覆盖较新的会话状态。
6. 新消息先按稳定 ID 判断是否已存在；重放事件只幂等更新消息，不重复增加 unread。
7. IF event 标记 `degraded`，或最小新 seq 大于本地 `lastMsgSeq + 1`，THEN 从本地 cursor 执行 `pullMessages(desc=false)`，先持久化恢复窗口，再合并事件消息。
8. IF 新消息所属会话不在 cache，THEN 先持久化消息，再调用 `getConversation` 获取权威会话并 upsert；远端失败必须交给 background error reporter。
9. 会话事件只允许 delta upsert，不执行 `replaceAll`；其中携带的 latest message 必须先持久化。
10. 成功写入后 runtime 发布新的无凭据 snapshot，引导 React Router 当前页面重读 SQLite。

## Realtime Event Boundary

| normalized event | accepted payload | persistence behavior | unsupported behavior |
| :--- | :--- | :--- | :--- |
| `message` / `message.created` | 含稳定 message ID、sender 与 conversation ID 的单条或批量消息 | 幂等 upsert；缺口 HTTP recovery；更新 conversation latest/seq/unread | identity 不完整直接 reject 并报告 |
| `conversation` / `conversation.changed` | 可映射的完整会话 DTO | latest message -> conversation delta upsert | 不用不完整字段猜 target/type；可按 ID `getConversation` 恢复 |
| `message.update` | 编辑、撤回、删除批次 | `W4.a2-updates` 独立实现 | 当前片不声明成功、不修改本地消息 |

`event.data`、`data/payload/message/messages/conversation/conversations` 包装允许递归解包；JSON 字符串只在可解析时继续处理。未识别的 realtime kind 不属于数据错误，由对应未来 capability owner 消费。

## Acceptance Gates

| gate | evidence | status |
| :--- | :--- | :--- |
| contract freeze | this document + production anchors | `passed` |
| shared mapper | `gateway-domain-mappers.test.mjs` + shared SDK typecheck/build | `passed` |
| browser sync | 6 sql.js/Repository tests: pages、failure retention、history、send convergence | `passed-local` |
| default caller | `/login`; `/conversations`; `/conversations/:conversationID` use runtime sync facade | `passed-local: build + config/login responsive smoke` |
| realtime created/conversation | serialized persistence、replay、gap recovery、runtime cache publication | `active` |
| real environment | login + conversation + history + send smoke | `blocked: Gateway variables absent` |

## Production Anchors

- `../im28-phone/packages/im-sdk/src/transport/gateway-http/**`
- `../im28-phone/packages/im-sdk/src/modules/conversation/repository.ts`
- `../im28-phone/packages/im-sdk/src/modules/message/repository.ts`
- `../im28-phone/src/services/openim/conversation-list-sync-service.ts`
- `../im28-phone/src/services/openim/openIMService.ts`
