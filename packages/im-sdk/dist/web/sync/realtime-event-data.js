import { MessageRepository, } from '@im28/im-sdk/core';
import { normalizeIMRealtimeMessages } from './realtime-message-normalization.js';
/** 递归收集带稳定身份的 Gateway 消息。 */
export function collectGatewayMessages(value) {
    return normalizeIMRealtimeMessages(value).filter(message => Boolean(readString(message.conversation_id) &&
        readString(message.sender_id) &&
        (readString(message.client_msg_id) || readString(message.msg_id))));
}
/** 收集带 conversation_id 的会话 DTO。 */
export function collectGatewayConversations(value) {
    // output 后续按 conversation ID 去重。
    const output = [];
    visitWrappedRecords(value, record => {
        if (Array.isArray(record.conversations)) {
            for (const item of record.conversations) {
                if (isRecord(item) && readString(item.conversation_id))
                    output.push(item);
            }
        }
        if (isRecord(record.conversation) &&
            readString(record.conversation.conversation_id)) {
            output.push(record.conversation);
        }
        if (readString(record.conversation_id) && !isRealtimeMessageRecord(record)) {
            output.push(record);
        }
    });
    // unique 使用最后事件版本覆盖同批较早版本。
    const unique = new Map();
    for (const item of output)
        unique.set(readString(item.conversation_id), item);
    return [...unique.values()];
}
/** 按 conversation ID 聚合消息。 */
export function groupGatewayMessages(messages) {
    // groups 保留首见会话顺序。
    const groups = new Map();
    for (const message of messages) {
        // conversationID 已由 collector 验证。
        const conversationID = readString(message.conversation_id);
        // group 是当前会话的可变批次容器。
        const group = groups.get(conversationID) ?? [];
        group.push(message);
        groups.set(conversationID, group);
    }
    return groups;
}
/** 按 client/server ID 对同一批消息去重。 */
export function deduplicateGatewayMessages(messages) {
    // unique 使用后出现版本覆盖恢复窗口中的旧版本。
    const unique = new Map();
    for (const message of messages) {
        // key 已由 collector/mapping contract 保证至少存在一个。
        const key = readString(message.client_msg_id) ?? readString(message.msg_id);
        if (key)
            unique.set(key, message);
    }
    return [...unique.values()];
}
/** 查询 client/server 任一身份是否已在 cache 中。 */
async function findStoredMessage(repository, message) {
    // byClient 覆盖发送回显和绝大多数实时重放。
    const byClient = await repository.getByClientMsgID(message.clientMsgID);
    if (byClient || !message.serverMsgID)
        return byClient;
    return repository.getByServerMsgID(message.serverMsgID);
}
/** 判断最小入站 seq 是否跳过本地下一条 seq。 */
export function hasSequenceGap(localSeq, messages) {
    // minimum 是当前事件批次最早的有效 uint64 seq。
    const minimum = maxDecimalString(messages.map(message => readString(message.msg_seq)), true);
    if (!minimum)
        return false;
    // normalizedLocal 无效时按可重建 cache 的起始 cursor 处理。
    const normalizedLocal = localSeq && /^\d+$/.test(localSeq) ? localSeq : '0';
    return BigInt(minimum) > BigInt(normalizedLocal) + 1n;
}
/** 递归检测 Gateway batch 的 degraded 标记。 */
export function hasDegradedMarker(value) {
    if (typeof value === 'string') {
        try {
            return hasDegradedMarker(JSON.parse(value));
        }
        catch {
            return false;
        }
    }
    if (Array.isArray(value))
        return value.some(hasDegradedMarker);
    if (!isRecord(value))
        return false;
    if (value.degraded === true)
        return true;
    return hasDegradedMarker(value.data) || hasDegradedMarker(value.payload);
}
/** 选择 seq 最大、无 seq 时发送时间最大的消息。 */
export function selectLatestMessage(messages) {
    // selected 通过 Gateway 原始十进制 seq 比较，避免安全整数上限。
    const selected = [...messages].sort(compareMappedMessages)[0];
    return selected?.value;
}
/** 持久化映射消息并只统计首次出现的入站消息。 */
export async function persistMappedMessages(repository, messages) {
    // unreadDelta 对 replay 保持幂等。
    let unreadDelta = 0;
    /** persistedMessages 返回实际占用 SQLite 主键的最终实体。 */
    const persistedMessages = [];
    for (const mapped of messages) {
        // existed 同时检查 client/server ID，兼容发送回显与历史补拉。
        const existed = await findStoredMessage(repository, mapped.value);
        /** persisted 复用已有 optimistic 主键并保留本地发送顺序。 */
        const persisted = reconcileRealtimeMessage(existed, mapped.value);
        await repository.upsert(persisted);
        persistedMessages.push(persisted);
        if (!existed && mapped.value.direction === 'incoming')
            unreadDelta += 1;
    }
    return { messages: persistedMessages, unreadDelta };
}
/** 让服务端回显覆盖已有发送行，不创建第二个 client identity。 */
function reconcileRealtimeMessage(existing, incoming) {
    if (!existing)
        return incoming;
    /** payload 只从旧快照保留客户端本地排序字段。 */
    const payload = preserveRealtimeLocalOrder(existing.payload, incoming.payload);
    return {
        ...incoming,
        clientMsgID: existing.clientMsgID,
        ...(incoming.serverMsgID || existing.serverMsgID
            ? { serverMsgID: incoming.serverMsgID || existing.serverMsgID }
            : {}),
        sendTime: existing.sendTime || incoming.sendTime,
        ...(incoming.seq !== undefined || existing.seq !== undefined
            ? { seq: incoming.seq ?? existing.seq }
            : {}),
        ...(incoming.forwardOrigin || existing.forwardOrigin
            ? { forwardOrigin: incoming.forwardOrigin || existing.forwardOrigin }
            : {}),
        ...(incoming.forwardSourceMsgID || existing.forwardSourceMsgID
            ? {
                forwardSourceMsgID: incoming.forwardSourceMsgID || existing.forwardSourceMsgID,
            }
            : {}),
        ...(incoming.forwardBatchID || existing.forwardBatchID
            ? { forwardBatchID: incoming.forwardBatchID || existing.forwardBatchID }
            : {}),
        ...(incoming.localEx || existing.localEx
            ? { localEx: incoming.localEx || existing.localEx }
            : {}),
        ...(incoming.entities?.length || existing.entities?.length
            ? { entities: incoming.entities?.length ? incoming.entities : existing.entities }
            : {}),
        ...(incoming.mentions?.length || existing.mentions?.length
            ? { mentions: incoming.mentions?.length ? incoming.mentions : existing.mentions }
            : {}),
        payload,
    };
}
/** 从旧 payload 向新正文搬运 RN/Web 共用的本地发送排序标记。 */
function preserveRealtimeLocalOrder(existing, incoming) {
    /** existingRecord 仅接受普通对象缓存。 */
    const existingRecord = isRecord(existing) ? existing : {};
    /** incomingRecord 保留服务端最新正文，非对象原样返回。 */
    const incomingRecord = isRecord(incoming) ? incoming : null;
    if (!incomingRecord)
        return incoming;
    /** localSendOrder 使用 camelCase 兼容 RN 展示排序。 */
    const localSendOrder = existingRecord.localSendOrder;
    /** snakeLocalSendOrder 保留已落库的 legacy 字段。 */
    const snakeLocalSendOrder = existingRecord.local_send_order;
    return {
        ...incomingRecord,
        ...(localSendOrder !== undefined ? { localSendOrder } : {}),
        ...(snakeLocalSendOrder !== undefined
            ? { local_send_order: snakeLocalSendOrder }
            : {}),
    };
}
/** 返回十进制 uint64 集合的最大值，minimum=true 时返回最小值。 */
export function maxDecimalString(values, minimum = false) {
    // valid 只接受无符号十进制字符串。
    const valid = values.filter((value) => Boolean(value && /^\d+$/.test(value)));
    if (!valid.length)
        return undefined;
    return valid.reduce((selected, value) => {
        // comparison 使用 BigInt，避免 Gateway uint64 精度丢失。
        const comparison = BigInt(value) - BigInt(selected);
        if (minimum)
            return comparison < 0n ? value : selected;
        return comparison > 0n ? value : selected;
    });
}
/** 安全读取非空字符串并统一 trim。 */
export function readString(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
/** 深度遍历 data/payload 包装与 JSON 字符串。 */
function visitWrappedRecords(value, visit) {
    if (typeof value === 'string') {
        try {
            visitWrappedRecords(JSON.parse(value), visit);
        }
        catch {
            return;
        }
        return;
    }
    if (Array.isArray(value)) {
        for (const item of value)
            visitWrappedRecords(item, visit);
        return;
    }
    if (!isRecord(value))
        return;
    visit(value);
    for (const key of ['data', 'payload']) {
        if (value[key] !== undefined)
            visitWrappedRecords(value[key], visit);
    }
}
/** 按原始 uint64 seq 降序比较，缺失或相同时按发送时间降序。 */
function compareMappedMessages(left, right) {
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
/** 判断对象是否携带消息稳定身份，防止被会话 collector 重复接收。 */
function isRealtimeMessageRecord(record) {
    return Boolean(readString(record.client_msg_id) ||
        readString(record.msg_id) ||
        readString(record.sender_id));
}
/** 判断 unknown 是否为非数组对象。 */
function isRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
//# sourceMappingURL=realtime-event-data.js.map