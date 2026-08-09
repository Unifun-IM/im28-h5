import {
  ConversationRepository,
  MessageRepository,
  mapGatewayConversationToCore,
  mapGatewayMessageToCore,
  type Conversation,
  type GatewayConversation,
  type GatewayHTTPClient,
  type GatewayMessage,
  type GatewayRealtimeEvent,
  type Message,
} from '@im28/im-sdk/web';

import {
  createWebIMSyncError,
  requireWebIMSyncContext,
  type WebIMSyncContext,
  type WebIMSyncContextDependencies,
} from './sync-context.js';

/** 实时同步只公开串行消费 normalized Gateway event 的入口。 */
export interface WebIMRealtimeSync {
  handle(event: GatewayRealtimeEvent): Promise<boolean>;
}

/** 实时同步复用 runtime 唯一 Gateway client 与账号数据库 owner。 */
export interface WebIMRealtimeSyncDependencies
  extends WebIMSyncContextDependencies {
  readonly gatewayClient: GatewayHTTPClient;
}

/** 创建与 runtime 同生命周期的实时持久化队列。 */
export function createWebIMRealtimeSync(
  dependencies: WebIMRealtimeSyncDependencies,
): WebIMRealtimeSync {
  return new WebIMRealtimeSyncImpl(dependencies);
}

/** 单队列编排实时事件、HTTP 恢复与 Repository 写入。 */
class WebIMRealtimeSyncImpl implements WebIMRealtimeSync {
  // dependencies 动态读取当前认证账号，但 Gateway client 保持唯一。
  private readonly dependencies: WebIMRealtimeSyncDependencies;
  // operationQueue 防止并发事件重复累计 unread 或覆盖新状态。
  private operationQueue: Promise<void> = Promise.resolve();

  /** 保存 runtime owners，不持有账号外的可变业务状态。 */
  constructor(dependencies: WebIMRealtimeSyncDependencies) {
    this.dependencies = dependencies;
  }

  /** 将当前事件追加到队列，失败后仍允许后续事件继续处理。 */
  handle(event: GatewayRealtimeEvent): Promise<boolean> {
    // result 保留当前事件的成功、忽略或失败结果。
    const result = this.operationQueue.then(() => this.handleDirect(event));
    this.operationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  /** 只路由本片明确支持的新消息与会话变更。 */
  private async handleDirect(event: GatewayRealtimeEvent): Promise<boolean> {
    if (event.type === 'message.update') {
      return false;
    }
    if (event.type === 'message') {
      return this.persistMessageEvent(event);
    }
    if (event.type === 'conversation') {
      return this.persistConversationEvent(event);
    }
    return false;
  }

  /** 按会话恢复缺口并幂等持久化实时消息。 */
  private async persistMessageEvent(
    event: GatewayRealtimeEvent,
  ): Promise<boolean> {
    // context 在排队事件真正执行时固定 auth/database owner。
    const context = requireWebIMSyncContext(this.dependencies, 'Realtime sync');
    // gatewayMessages 递归解开 normalized event 的常见包装。
    const gatewayMessages = collectGatewayMessages(event.data ?? event.raw);
    if (!gatewayMessages.length) {
      throw createWebIMSyncError(
        'INVALID_REALTIME_MESSAGE',
        'Realtime message event has no entity with stable identity.',
      );
    }
    // groups 保证同一会话的 cursor、unread 与 latest 一次收敛。
    const groups = groupGatewayMessages(gatewayMessages);
    for (const [conversationID, eventMessages] of groups) {
      await this.persistConversationMessages(
        context,
        conversationID,
        eventMessages,
        hasDegradedMarker(event.data ?? event.raw),
      );
    }
    return true;
  }

  /** 持久化单会话消息批次并更新或恢复会话。 */
  private async persistConversationMessages(
    context: WebIMSyncContext,
    conversationID: string,
    eventMessages: readonly GatewayMessage[],
    degraded: boolean,
  ): Promise<void> {
    // repositories 在当前串行 operation 内共享同一 account database。
    const conversations = new ConversationRepository(context.database);
    // messages 负责稳定 client/server identity 查询与幂等 upsert。
    const messages = new MessageRepository(context.database);
    // existingConversation 提供恢复 cursor 与本地 UI 字段。
    const existingConversation = await conversations.getByID(conversationID);
    // recoveryNeeded 同时覆盖服务端降级标记与 seq 跳号。
    const recoveryNeeded =
      degraded || hasSequenceGap(existingConversation?.lastMsgSeq, eventMessages);
    // recoveredMessages 必须先于事件消息进入同一去重集合。
    const recoveredMessages = recoveryNeeded
      ? await this.pullRecoveryMessages(
          conversationID,
          existingConversation?.lastMsgSeq ?? '0',
        )
      : [];
    // mergedMessages 按稳定 ID 去重，事件版本覆盖补拉版本。
    const mergedMessages = deduplicateGatewayMessages([
      ...recoveredMessages,
      ...eventMessages,
    ]);
    // mappedMessages 在写库前全部校验，防止半批次落库。
    const mappedMessages = mergedMessages.map(message => ({
      source: message,
      value: mapGatewayMessageToCore(message, {
        currentUserID: context.userID,
        conversationID,
      }),
    }));
    // unreadDelta 只统计首次出现的入站消息，事件重放保持幂等。
    let unreadDelta = 0;
    for (const mapped of mappedMessages) {
      // existed 同时检查 client/server ID，兼容发送回显与历史补拉。
      const existed = await findStoredMessage(messages, mapped.value);
      await messages.upsert(mapped.value);
      if (!existed && mapped.value.direction === 'incoming') {
        unreadDelta += 1;
      }
    }
    if (!existingConversation) {
      await this.restoreConversation(context, conversationID, conversations, messages);
      return;
    }
    // latestMessage 以 seq 优先、发送时间兜底选择会话指针。
    const latestMessage = selectLatestMessage(mappedMessages.map(item => item.value));
    // lastMsgSeq 保留 Gateway uint64 字符串，避免 JS number 截断。
    const lastMsgSeq = maxDecimalString([
      existingConversation.lastMsgSeq,
      ...mergedMessages.map(message => readString(message.msg_seq)),
    ]);
    // nextConversation 保留本地 pinned/muted/draft 并只推进消息字段。
    const nextConversation: Conversation = {
      ...existingConversation,
      ...(latestMessage ? { latestMessageID: latestMessage.clientMsgID } : {}),
      ...(lastMsgSeq ? { lastMsgSeq } : {}),
      unreadCount: existingConversation.unreadCount + unreadDelta,
      updatedAt: Math.max(existingConversation.updatedAt, latestMessage?.sendTime ?? 0),
    };
    await conversations.upsert(nextConversation);
  }

  /** 从本地 cursor 正序补拉缺失窗口。 */
  private async pullRecoveryMessages(
    conversationID: string,
    fromSeq: string,
  ): Promise<readonly GatewayMessage[]> {
    // response failure 必须向 runtime reporter 传播，不能伪装成功。
    const response = await this.dependencies.gatewayClient.pullMessages({
      conversation_id: conversationID,
      from_seq: fromSeq,
      limit: 100,
      desc: false,
    });
    return response.messages ?? [];
  }

  /** 缺失会话时用 Gateway 权威详情补齐，不猜测 target/type。 */
  private async restoreConversation(
    context: WebIMSyncContext,
    conversationID: string,
    conversations: ConversationRepository,
    messages: MessageRepository,
  ): Promise<void> {
    // remoteConversation 是缺失会话资料的唯一恢复来源。
    const remoteConversation = await this.dependencies.gatewayClient.getConversation({
      conversation_id: conversationID,
    });
    // mapping 复用 shared canonical DTO 语义。
    const mapping = mapGatewayConversationToCore(remoteConversation, context.userID);
    if (mapping.latestMessage) {
      await messages.upsert(mapping.latestMessage);
    }
    await conversations.upsert(mapping.conversation);
  }

  /** 将会话 delta 及其 latest message 按 Repository 顺序 upsert。 */
  private async persistConversationEvent(
    event: GatewayRealtimeEvent,
  ): Promise<boolean> {
    // context 保证事件永远写入当前认证账号数据库。
    const context = requireWebIMSyncContext(this.dependencies, 'Realtime sync');
    // candidates 接受 direct DTO 和常见单条/批量 wrapper。
    const candidates = collectGatewayConversations(event.data ?? event.raw);
    if (!candidates.length) {
      throw createWebIMSyncError(
        'INVALID_REALTIME_CONVERSATION',
        'Realtime conversation event has no stable conversation identity.',
      );
    }
    // repositories 保证 latest message 先于 conversation pointer。
    const messages = new MessageRepository(context.database);
    // conversations 执行 delta upsert，绝不清空未出现在事件中的 cache。
    const conversations = new ConversationRepository(context.database);
    for (const candidate of candidates) {
      // mapping 失败时仅允许按稳定 conversation ID 请求权威详情恢复。
      const mapping = await this.mapOrRestoreConversation(context, candidate);
      if (mapping.latestMessage) {
        await messages.upsert(mapping.latestMessage);
      }
      await conversations.upsert(mapping.conversation);
    }
    return true;
  }

  /** 映射完整会话 DTO，字段不足时按 ID 向 Gateway 恢复。 */
  private async mapOrRestoreConversation(
    context: WebIMSyncContext,
    candidate: GatewayConversation,
  ) {
    try {
      return mapGatewayConversationToCore(candidate, context.userID);
    } catch (cause) {
      // conversationID 是允许发起权威恢复请求的最低条件。
      const conversationID = readString(candidate.conversation_id);
      if (!conversationID) {
        throw cause;
      }
      // remoteConversation 替代不完整 event DTO，禁止本地猜字段。
      const remoteConversation = await this.dependencies.gatewayClient.getConversation({
        conversation_id: conversationID,
      });
      return mapGatewayConversationToCore(remoteConversation, context.userID);
    }
  }
}

/** JSON object 的最小安全读模型。 */
type UnknownRecord = Record<string, unknown>;

/** 递归收集带稳定身份的 Gateway 消息。 */
function collectGatewayMessages(value: unknown): GatewayMessage[] {
  // output 保留 wrapper 顺序，后续稳定 ID 去重。
  const output: GatewayMessage[] = [];
  visitWrappedRecords(value, record => {
    // conversationID 可由 batch wrapper 向单条 message 继承。
    const conversationID = readString(record.conversation_id);
    // messages 仅处理显式数组，避免把 body 当 transport wrapper。
    const items = Array.isArray(record.messages) ? record.messages : [];
    for (const item of items) {
      if (isRecord(item)) {
        pushGatewayMessage(output, item, conversationID);
      }
    }
    if (isRecord(record.message)) {
      pushGatewayMessage(output, record.message, conversationID);
    }
    pushGatewayMessage(output, record, undefined);
  });
  return deduplicateGatewayMessages(output);
}

/** 收集带 conversation_id 的会话 DTO。 */
function collectGatewayConversations(value: unknown): GatewayConversation[] {
  // output 后续按 conversation ID 去重。
  const output: GatewayConversation[] = [];
  visitWrappedRecords(value, record => {
    if (Array.isArray(record.conversations)) {
      for (const item of record.conversations) {
        if (isRecord(item) && readString(item.conversation_id)) output.push(item);
      }
    }
    if (isRecord(record.conversation) && readString(record.conversation.conversation_id)) {
      output.push(record.conversation);
    }
    if (readString(record.conversation_id) && !isMessageRecord(record)) output.push(record);
  });
  // unique 使用最后事件版本覆盖同批较早版本。
  const unique = new Map<string, GatewayConversation>();
  for (const item of output) unique.set(readString(item.conversation_id)!, item);
  return [...unique.values()];
}

/** 深度遍历 data/payload 包装与 JSON 字符串。 */
function visitWrappedRecords(
  value: unknown,
  visit: (record: UnknownRecord) => void,
): void {
  if (typeof value === 'string') {
    try { visitWrappedRecords(JSON.parse(value), visit); } catch { return; }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) visitWrappedRecords(item, visit);
    return;
  }
  if (!isRecord(value)) return;
  visit(value);
  for (const key of ['data', 'payload'] as const) {
    if (value[key] !== undefined) visitWrappedRecords(value[key], visit);
  }
}

/** 将有效 message record 补齐父级 conversation ID 后加入集合。 */
function pushGatewayMessage(
  output: GatewayMessage[],
  record: UnknownRecord,
  inheritedConversationID: string | undefined,
): void {
  if (!isMessageRecord(record)) return;
  // conversationID 优先使用 message 自身字段。
  const conversationID = readString(record.conversation_id) ?? inheritedConversationID;
  if (!conversationID) return;
  output.push({ ...record, conversation_id: conversationID });
}

/** 判断 record 是否具备 mapper 要求的消息稳定身份。 */
function isMessageRecord(record: UnknownRecord): record is GatewayMessage & UnknownRecord {
  return Boolean(
    (readString(record.client_msg_id) || readString(record.msg_id)) &&
      readString(record.sender_id),
  );
}

/** 按 conversation ID 聚合消息。 */
function groupGatewayMessages(
  messages: readonly GatewayMessage[],
): Map<string, GatewayMessage[]> {
  // groups 保留首见会话顺序。
  const groups = new Map<string, GatewayMessage[]>();
  for (const message of messages) {
    // conversationID 已由 collector 验证。
    const conversationID = readString(message.conversation_id)!;
    // group 是当前会话的可变批次容器。
    const group = groups.get(conversationID) ?? [];
    group.push(message);
    groups.set(conversationID, group);
  }
  return groups;
}

/** 按 client/server ID 对同一批消息去重。 */
function deduplicateGatewayMessages(
  messages: readonly GatewayMessage[],
): GatewayMessage[] {
  // unique 使用后出现版本覆盖恢复窗口中的旧版本。
  const unique = new Map<string, GatewayMessage>();
  for (const message of messages) {
    // key 已由 collector/mapping contract 保证至少存在一个。
    const key = readString(message.client_msg_id) ?? readString(message.msg_id);
    if (key) unique.set(key, message);
  }
  return [...unique.values()];
}

/** 查询 client/server 任一身份是否已在 cache 中。 */
async function findStoredMessage(
  repository: MessageRepository,
  message: Message,
): Promise<Message | null> {
  // byClient 覆盖发送回显和绝大多数实时重放。
  const byClient = await repository.getByClientMsgID(message.clientMsgID);
  if (byClient || !message.serverMsgID) return byClient;
  return repository.getByServerMsgID(message.serverMsgID);
}

/** 判断最小入站 seq 是否跳过本地下一条 seq。 */
function hasSequenceGap(
  localSeq: string | undefined,
  messages: readonly GatewayMessage[],
): boolean {
  // minimum 是当前事件批次最早的有效 uint64 seq。
  const minimum = maxDecimalString(messages.map(message => readString(message.msg_seq)), true);
  if (!minimum) return false;
  return BigInt(minimum) > BigInt(localSeq ?? '0') + 1n;
}

/** 递归检测 Gateway batch 的 degraded 标记。 */
function hasDegradedMarker(value: unknown): boolean {
  if (typeof value === 'string') {
    try { return hasDegradedMarker(JSON.parse(value)); } catch { return false; }
  }
  if (Array.isArray(value)) return value.some(hasDegradedMarker);
  if (!isRecord(value)) return false;
  if (value.degraded === true) return true;
  return hasDegradedMarker(value.data) || hasDegradedMarker(value.payload);
}

/** 选择 seq 最大、无 seq 时发送时间最大的消息。 */
function selectLatestMessage(messages: readonly Message[]): Message | undefined {
  return [...messages].sort((left, right) =>
    (right.seq ?? -1) - (left.seq ?? -1) || right.sendTime - left.sendTime,
  )[0];
}

/** 返回十进制 uint64 集合的最大值，minimum=true 时返回最小值。 */
function maxDecimalString(
  values: readonly (string | undefined)[],
  minimum = false,
): string | undefined {
  // valid 只接受无符号十进制字符串。
  const valid = values.filter((value): value is string => Boolean(value && /^\d+$/.test(value)));
  if (!valid.length) return undefined;
  return valid.reduce((selected, value) => {
    // comparison 使用 BigInt，避免 Gateway uint64 精度丢失。
    const comparison = BigInt(value) - BigInt(selected);
    return minimum ? (comparison < 0n ? value : selected) : (comparison > 0n ? value : selected);
  });
}

/** 安全读取非空字符串并统一 trim。 */
function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** 判断 unknown 是否为非数组对象。 */
function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
