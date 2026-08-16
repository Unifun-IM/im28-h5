import { readString } from './realtime-event-data.js';
/** 从 normalized realtime payload 收集消息更新。 */
export function collectRealtimeMessageUpdates(value) {
    // output 保留服务端事件顺序，后续按 update_seq 重新排序。
    const output = [];
    visitUpdateRecords(value, record => {
        // parsed 过滤缺 conversation/type/target 的非 update wrapper。
        const parsed = parseUpdateRecord(record);
        if (parsed)
            output.push(parsed);
    });
    // unique 使用 update ID 或 seq/target/type 组合幂等去重。
    const unique = new Map();
    for (const parsed of output) {
        // key 对 cursorless event 仍包含稳定 update/target identity。
        const key = readString(parsed.update.update_id) ??
            `${parsed.update.conversation_id}:${parsed.updateSeq ?? ''}:${parsed.update.type}:${parsed.update.target_msg_id}`;
        unique.set(key, parsed);
    }
    return [...unique.values()];
}
/** 将直接 DTO 或 metadata wrapper 归一为 GatewayMessageUpdate。 */
function parseUpdateRecord(record) {
    // metadata 兼容 Gateway WebSocket 的 numeric update envelope。
    const metadata = isRecord(record.metadata) ? record.metadata : record;
    // message 优先使用 metadata 内的完整目标消息。
    const message = isRecord(metadata.message)
        ? metadata.message
        : isRecord(record.message)
            ? record.message
            : undefined;
    // conversationID 可由外层 batch wrapper 补充。
    const conversationID = readString(record.conversation_id) ??
        readString(metadata.conversation_id) ??
        readString(message?.conversation_id);
    // updateType 同时兼容 canonical string 与 numeric 1/2。
    const updateType = normalizeUpdateType(metadata.type ?? metadata.update_type, readString(record.event_type) ?? readString(metadata.event_type));
    // targetMessageID 是 delete/edit 定位本地消息的稳定服务端 ID。
    const targetMessageID = readString(metadata.target_msg_id) ?? readString(message?.msg_id);
    if (!conversationID || !updateType || !targetMessageID)
        return null;
    // updateSeq 只接受不丢精度的十进制 cursor。
    const updateSeq = normalizeUpdateSeq(metadata.update_seq);
    // latestUpdateSeq 表示 batch 仍有更新时触发 HTTP recovery。
    const latestUpdateSeq = normalizeUpdateSeq(record.latest_update_seq ?? metadata.latest_update_seq);
    // updateID 用于 realtime/HTTP 回显去重。
    const updateID = readString(metadata.update_id) ?? readString(metadata.event_id);
    // operatorUserID 保留服务端操作审计身份。
    const operatorUserID = readString(metadata.operator_user_id);
    // occurredAt 优先使用外层 server_time。
    const occurredAt = readString(record.server_time) ?? readString(metadata.occurred_at);
    // update 使用 shared DTO，禁止 H5 自创第二种 transport shape。
    const update = {
        ...(updateID ? { update_id: updateID } : {}),
        conversation_id: conversationID,
        ...(updateSeq ? { update_seq: updateSeq } : {}),
        type: updateType,
        target_msg_id: targetMessageID,
        ...(operatorUserID ? { operator_user_id: operatorUserID } : {}),
        delete_scope: normalizeDeleteScope(metadata.delete_scope),
        ...(message ? { message } : {}),
        ...(occurredAt ? { occurred_at: occurredAt } : {}),
    };
    return {
        update,
        ...(updateSeq ? { updateSeq } : {}),
        ...(latestUpdateSeq ? { latestUpdateSeq } : {}),
    };
}
/** 深度遍历 data/payload 包装和 JSON 字符串。 */
function visitUpdateRecords(value, visit) {
    if (typeof value === 'string') {
        try {
            visitUpdateRecords(JSON.parse(value), visit);
        }
        catch {
            return;
        }
        return;
    }
    if (Array.isArray(value)) {
        for (const item of value)
            visitUpdateRecords(item, visit);
        return;
    }
    if (!isRecord(value))
        return;
    visit(value);
    for (const key of ['data', 'payload', 'updates']) {
        if (value[key] !== undefined)
            visitUpdateRecords(value[key], visit);
    }
}
/** 归一 canonical/numeric update 类型。 */
function normalizeUpdateType(value, eventType) {
    if (value === 'edited' || value === 1 || value === '1')
        return 'edited';
    if (value === 'deleted' || value === 2 || value === '2')
        return 'deleted';
    if (eventType === 'message.edited')
        return 'edited';
    if (eventType === 'message.deleted')
        return 'deleted';
    return undefined;
}
/** 归一 self/all 删除范围。 */
function normalizeDeleteScope(value) {
    if (value === 'all' || value === 2 || value === '2')
        return 'all';
    if (value === 'self' || value === 1 || value === '1')
        return 'self';
    return '';
}
/** 将安全 number 或十进制 string 归一为无损 cursor。 */
export function normalizeUpdateSeq(value) {
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
        return value.trim();
    }
    if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) {
        return String(value);
    }
    return undefined;
}
/** 判断 unknown 是否为非数组对象。 */
function isRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
//# sourceMappingURL=realtime-message-update-data.js.map