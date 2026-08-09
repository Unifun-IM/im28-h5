import {
  type GatewayConversation,
  type GatewayMessage,
  type Message,
  MessageRepository,
} from '@im28/im-sdk/web';

/** JSON object 的最小安全读模型。 */
type UnknownRecord = Record<string, unknown>;

/** 保留 Gateway uint64 seq 与映射后 core message 的配对。 */
export interface MappedRealtimeMessage {
  readonly source: GatewayMessage;
  readonly value: Message;
}

/** 消息批次写入后用于推进会话的聚合结果。 */
export interface PersistedRealtimeMessageBatch {
  readonly unreadDelta: number;
}

/** 递归收集带稳定身份的 Gateway 消息。 */
export function collectGatewayMessages(value: unknown): GatewayMessage[] {
  // output 保留 wrapper 顺序，后续稳定 ID 去重。
  const output: GatewayMessage[] = [];
  visitWrappedRecords(value, record => {
    // conversationID 可由 batch wrapper 向单条 message 继承。
    const conversationID = readString(record.conversation_id);
    // items 仅处理显式数组，避免把 body 当 transport wrapper。
    const items = Array.isArray(record.messages) ? record.messages : [];
    for (const item of items) {
      if (isRecord(item)) pushGatewayMessage(output, item, conversationID);
    }
    if (isRecord(record.message)) {
      pushGatewayMessage(output, record.message, conversationID);
    }
    pushGatewayMessage(output, record, undefined);
  });
  return deduplicateGatewayMessages(output);
}

/** 收集带 conversation_id 的会话 DTO。 */
export function collectGatewayConversations(
  value: unknown,
): GatewayConversation[] {
  // output 后续按 conversation ID 去重。
  const output: GatewayConversation[] = [];
  visitWrappedRecords(value, record => {
    if (Array.isArray(record.conversations)) {
      for (const item of record.conversations) {
        if (isRecord(item) && readString(item.conversation_id)) output.push(item);
      }
    }
    if (
      isRecord(record.conversation) &&
      readString(record.conversation.conversation_id)
    ) {
      output.push(record.conversation);
    }
    if (readString(record.conversation_id) && !isMessageRecord(record)) {
      output.push(record);
    }
  });
  // unique 使用最后事件版本覆盖同批较早版本。
  const unique = new Map<string, GatewayConversation>();
  for (const item of output) unique.set(readString(item.conversation_id)!, item);
  return [...unique.values()];
}

/** 按 conversation ID 聚合消息。 */
export function groupGatewayMessages(
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
export function deduplicateGatewayMessages(
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
export function hasSequenceGap(
  localSeq: string | undefined,
  messages: readonly GatewayMessage[],
): boolean {
  // minimum 是当前事件批次最早的有效 uint64 seq。
  const minimum = maxDecimalString(
    messages.map(message => readString(message.msg_seq)),
    true,
  );
  if (!minimum) return false;
  // normalizedLocal 无效时按可重建 cache 的起始 cursor 处理。
  const normalizedLocal = localSeq && /^\d+$/.test(localSeq) ? localSeq : '0';
  return BigInt(minimum) > BigInt(normalizedLocal) + 1n;
}

/** 递归检测 Gateway batch 的 degraded 标记。 */
export function hasDegradedMarker(value: unknown): boolean {
  if (typeof value === 'string') {
    try {
      return hasDegradedMarker(JSON.parse(value));
    } catch {
      return false;
    }
  }
  if (Array.isArray(value)) return value.some(hasDegradedMarker);
  if (!isRecord(value)) return false;
  if (value.degraded === true) return true;
  return hasDegradedMarker(value.data) || hasDegradedMarker(value.payload);
}

/** 选择 seq 最大、无 seq 时发送时间最大的消息。 */
export function selectLatestMessage(
  messages: readonly MappedRealtimeMessage[],
): Message | undefined {
  // selected 通过 Gateway 原始十进制 seq 比较，避免安全整数上限。
  const selected = [...messages].sort(compareMappedMessages)[0];
  return selected?.value;
}

/** 持久化映射消息并只统计首次出现的入站消息。 */
export async function persistMappedMessages(
  repository: MessageRepository,
  messages: readonly MappedRealtimeMessage[],
): Promise<PersistedRealtimeMessageBatch> {
  // unreadDelta 对 replay 保持幂等。
  let unreadDelta = 0;
  for (const mapped of messages) {
    // existed 同时检查 client/server ID，兼容发送回显与历史补拉。
    const existed = await findStoredMessage(repository, mapped.value);
    await repository.upsert(mapped.value);
    if (!existed && mapped.value.direction === 'incoming') unreadDelta += 1;
  }
  return { unreadDelta };
}

/** 返回十进制 uint64 集合的最大值，minimum=true 时返回最小值。 */
export function maxDecimalString(
  values: readonly (string | undefined)[],
  minimum = false,
): string | undefined {
  // valid 只接受无符号十进制字符串。
  const valid = values.filter(
    (value): value is string => Boolean(value && /^\d+$/.test(value)),
  );
  if (!valid.length) return undefined;
  return valid.reduce((selected, value) => {
    // comparison 使用 BigInt，避免 Gateway uint64 精度丢失。
    const comparison = BigInt(value) - BigInt(selected);
    if (minimum) return comparison < 0n ? value : selected;
    return comparison > 0n ? value : selected;
  });
}

/** 安全读取非空字符串并统一 trim。 */
export function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** 深度遍历 data/payload 包装与 JSON 字符串。 */
function visitWrappedRecords(
  value: unknown,
  visit: (record: UnknownRecord) => void,
): void {
  if (typeof value === 'string') {
    try {
      visitWrappedRecords(JSON.parse(value), visit);
    } catch {
      return;
    }
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
  const conversationID =
    readString(record.conversation_id) ?? inheritedConversationID;
  if (!conversationID) return;
  output.push({ ...record, conversation_id: conversationID });
}

/** 判断 record 是否具备 mapper 要求的消息稳定身份。 */
function isMessageRecord(
  record: UnknownRecord,
): record is GatewayMessage & UnknownRecord {
  return Boolean(
    (readString(record.client_msg_id) || readString(record.msg_id)) &&
      readString(record.sender_id),
  );
}

/** 按原始 uint64 seq 降序比较，缺失或相同时按发送时间降序。 */
function compareMappedMessages(
  left: MappedRealtimeMessage,
  right: MappedRealtimeMessage,
): number {
  // leftSeq/rightSeq 只接受十进制 uint64 字符串。
  const leftSeq = readString(left.source.msg_seq);
  const rightSeq = readString(right.source.msg_seq);
  if (leftSeq && rightSeq && /^\d+$/.test(leftSeq) && /^\d+$/.test(rightSeq)) {
    if (BigInt(leftSeq) !== BigInt(rightSeq)) {
      return BigInt(rightSeq) > BigInt(leftSeq) ? 1 : -1;
    }
  }
  return right.value.sendTime - left.value.sendTime;
}

/** 判断 unknown 是否为非数组对象。 */
function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
