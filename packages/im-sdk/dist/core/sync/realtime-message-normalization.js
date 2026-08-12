/** 将 Gateway realtime 常见包装统一为具备稳定身份的消息列表。 */
export function normalizeIMRealtimeMessages(value) {
    /** normalized 保留 wrapper 中的消息顺序，重复身份使用最后版本。 */
    const normalized = [];
    visitRealtimeValue(value, undefined, normalized);
    /** unique 对补拉或嵌套重复消息执行稳定身份去重。 */
    const unique = new Map();
    normalized.forEach((message, index) => {
        /** key 优先使用客户端身份，兼容只有服务端身份的下行消息。 */
        const key = readString(message.client_msg_id) || readString(message.msg_id);
        // transient key 只用于本次返回去重容器，不写回消息身份。
        unique.set(key || `transient:${index}`, message);
    });
    return [...unique.values()];
}
/** 递归处理 JSON、数组、data/payload 与多会话批次包装。 */
function visitRealtimeValue(value, inheritedConversationID, output) {
    if (typeof value === 'string') {
        try {
            visitRealtimeValue(JSON.parse(value), inheritedConversationID, output);
        }
        catch {
            return;
        }
        return;
    }
    if (Array.isArray(value)) {
        value.forEach(item => visitRealtimeValue(item, inheritedConversationID, output));
        return;
    }
    if (!isRecord(value))
        return;
    /** conversationID 允许批次 wrapper 向子消息传递会话身份。 */
    const conversationID = readString(value.conversation_id) ||
        readString(value.conversationID) ||
        inheritedConversationID;
    /** candidate 只在当前对象本身是消息时生成。 */
    const candidate = normalizeMessageRecord(value, conversationID);
    if (candidate)
        output.push(candidate);
    /** collectionKey 仅遍历协议允许承载批量消息的字段。 */
    for (const collectionKey of ['conversations', 'messages', 'list']) {
        if (Array.isArray(value[collectionKey])) {
            value[collectionKey].forEach(item => visitRealtimeValue(item, conversationID, output));
        }
    }
    if (isRecord(value.message)) {
        visitRealtimeValue(value.message, conversationID, output);
    }
    /** wrapperKey 只递归 Gateway 的通用单层包装字段。 */
    for (const wrapperKey of ['data', 'payload']) {
        if (value[wrapperKey] !== undefined) {
            visitRealtimeValue(value[wrapperKey], conversationID, output);
        }
    }
}
/** 将 snake_case 与 RN 兼容字段收敛为 canonical Gateway 消息。 */
function normalizeMessageRecord(record, inheritedConversationID) {
    /** msgID 覆盖 Gateway 服务端 ID 与系统事件稳定 ID。 */
    const msgID = readString(record.msg_id) ||
        readString(record.serverMsgID) ||
        readString(record.event_id);
    /** clientMsgID 优先保留发送端稳定身份。 */
    const clientMsgID = readString(record.client_msg_id) || readString(record.clientMsgID);
    /** senderID 是消息方向与缓存身份的必需字段。 */
    const body = isRecord(record.body) ? record.body : collectLegacyBody(record);
    /** senderID 允许申请类系统事件从 extra 恢复展示身份。 */
    const senderID = readString(record.sender_id) ||
        readString(record.sendID) ||
        readSystemSenderID(body);
    /** conversationID 必须来自消息本身或明确的父批次。 */
    const conversationID = readString(record.conversation_id) ||
        readString(record.conversationID) ||
        inheritedConversationID;
    if (!msgID && !clientMsgID && !isSystemEventBody(body))
        return null;
    return {
        ...record,
        ...(msgID ? { msg_id: msgID } : {}),
        ...(clientMsgID ? { client_msg_id: clientMsgID } : {}),
        ...(conversationID ? { conversation_id: conversationID } : {}),
        ...(senderID ? { sender_id: senderID } : {}),
        ...(record.type !== undefined
            ? { type: record.type }
            : record.contentType !== undefined
                ? { type: record.contentType }
                : {}),
        ...(record.msg_seq !== undefined
            ? { msg_seq: String(record.msg_seq) }
            : record.seq !== undefined
                ? { msg_seq: String(record.seq) }
                : {}),
        ...(body ? { body: body } : {}),
    };
}
/** 判断无稳定消息 ID 的对象是否仍是可投影系统事件。 */
function isSystemEventBody(body) {
    return Boolean(body && isRecord(body.system));
}
/** 从系统事件 extra 读取申请人或操作人身份供平台通知投影。 */
function readSystemSenderID(body) {
    if (!body || !isRecord(body.system))
        return '';
    /** extra 承载申请、群变更和关系事件的参与者身份。 */
    const extra = isRecord(body.system.extra) ? body.system.extra : {};
    return (readString(extra.requester_id) ||
        readString(extra.requester_user_id) ||
        readString(extra.operator_user_id) ||
        readString(extra.user_id));
}
/** 收集 RN/OpenIM 兼容事件中的顶层 legacy 消息元素。 */
function collectLegacyBody(record) {
    /** body 只包含实际存在的消息元素，避免写入空对象。 */
    const body = {};
    /** elementKey 限定允许从 legacy 顶层迁入 body 的消息元素。 */
    for (const elementKey of [
        'textElem',
        'pictureElem',
        'soundElem',
        'videoElem',
        'fileElem',
        'system',
    ]) {
        if (isRecord(record[elementKey]))
            body[elementKey] = record[elementKey];
    }
    return Object.keys(body).length ? body : null;
}
/** 读取非空字符串并统一去除边缘空白。 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
/** 判断 unknown 是否为普通 JSON 对象。 */
function isRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
//# sourceMappingURL=realtime-message-normalization.js.map