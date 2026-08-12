/** RTC 过程通知支持的服务端事件类型。 */
export const IM_CALL_REALTIME_SIGNAL_KEYS = [
    'rtc.call.invite',
    'rtc.call.accept',
    'rtc.call.reject',
    'rtc.call.cancel',
    'rtc.call.hangup',
    'rtc.call.ended',
    'rtc.call.summary',
    'rtc.call.missed',
    'rtc.call.failed',
];
/** content type 到 Gateway RTC 事件类型的固定映射。 */
const CALL_NOTICE_KEY_BY_CONTENT_TYPE = {
    1601: 'rtc.call.invite',
    1602: 'rtc.call.accept',
    1603: 'rtc.call.reject',
    1604: 'rtc.call.cancel',
    1605: 'rtc.call.hangup',
    1606: 'rtc.call.ended',
    1607: 'rtc.call.missed',
    1608: 'rtc.call.failed',
};
/** RTC 事件白名单拒绝未知 rtc.call.* 值进入客户端状态机。 */
const CALL_SIGNAL_KEY_SET = new Set(IM_CALL_REALTIME_SIGNAL_KEYS);
/** 从单条 RN、Web 或 Desktop 消息包装读取第一个合法 RTC 过程通知。 */
export function parseIMCallRealtimeSignal(value) {
    return normalizeIMCallRealtimeSignals(value)[0] ?? null;
}
/** 从 RN、Web 或 Desktop realtime 包装中按输入顺序归一化 RTC 过程通知。 */
export function normalizeIMCallRealtimeSignals(value) {
    /** signals 用稳定事件身份去重，并保留服务端后到状态。 */
    const signals = new Map();
    visitCallSignalValue(value, signals);
    return [...signals.values()];
}
/** 深度遍历 Gateway 批次与各平台常见单层包装。 */
function visitCallSignalValue(value, output) {
    if (typeof value === 'string') {
        /** parsed 仅递归有效 JSON，普通文本不会产生 RTC 信号。 */
        const parsed = parseJSONValue(value);
        if (parsed !== null)
            visitCallSignalValue(parsed, output);
        return;
    }
    if (Array.isArray(value)) {
        value.forEach(item => visitCallSignalValue(item, output));
        return;
    }
    if (!isRecord(value))
        return;
    /** signal 先尝试从当前消息本身读取 canonical 或兼容字段。 */
    const signal = readCallRealtimeSignal(value);
    if (signal) {
        /** identity 优先使用跨设备 event ID，否则退化为同通话同事件类型。 */
        const identity = signal.eventID || `${signal.key}:${signal.callID}`;
        output.set(identity, signal);
        return;
    }
    /** collectionKey 仅递归协议允许携带批次数据的字段。 */
    for (const collectionKey of ['messages', 'list', 'events', 'notifications']) {
        if (Array.isArray(value[collectionKey])) {
            value[collectionKey].forEach(item => visitCallSignalValue(item, output));
        }
    }
    /** wrapperKey 兼容 Gateway event 与 RN callback 的常见包装。 */
    for (const wrapperKey of ['data', 'payload', 'message']) {
        if (value[wrapperKey] !== undefined)
            visitCallSignalValue(value[wrapperKey], output);
    }
}
/** 从一条消息读取 system notice 或 custom RTC 信号。 */
function readCallRealtimeSignal(message) {
    /** body 兼容 Gateway canonical body 和 RN payload.body。 */
    const body = readRecord(message.body) ?? readRecord(readRecord(message.payload)?.body);
    /** system 同时兼容 canonical、RN payload 和历史顶层包装。 */
    const system = readRecord(body?.system) ?? readRecord(message.system);
    /** custom 兼容 Gateway body.custom 与 RN customElem。 */
    const custom = readRecord(body?.custom) ?? readRecord(message.customElem);
    /** contentType 兼容 RN camelCase 与 Gateway snake_case。 */
    const contentType = readNumber(message.contentType ?? message.content_type);
    /** fallbackKey 仅对服务端固定 1601-1608 类型生效。 */
    const fallbackKey = CALL_NOTICE_KEY_BY_CONTENT_TYPE[contentType];
    /** key 优先使用 Gateway 权威 event_type。 */
    const rawKey = readString(system?.event_type) ||
        readString(custom?.key) ||
        readString(custom?.extension) ||
        readString(custom?.description) ||
        fallbackKey || '';
    if (!CALL_SIGNAL_KEY_SET.has(rawKey))
        return null;
    /** payload 优先读取 system.extra，再兼容 custom 的 JSON 字段。 */
    const payload = parseJSONRecord(system?.extra) ??
        parseJSONRecord(custom?.data) ??
        parseJSONRecord(custom?.detail) ??
        parseJSONRecord(message.content);
    if (!payload)
        return null;
    /** callID 是跨端状态机唯一主键。 */
    const callID = readString(payload.call_id ?? payload.callID);
    /** callType 统一服务端 audio/voice 别名。 */
    const callType = normalizeCallType(payload.call_type ?? payload.callType);
    /** roomName 是媒体会话关联键，缺失时保持 fail-closed。 */
    const roomName = readString(payload.room_name ?? payload.roomName ?? payload.room_id ?? payload.roomID);
    if (!callID || !callType || !roomName)
        return null;
    /** eventID 支持同用户多设备收到相同通知时跨端去重。 */
    const eventID = readString(message.event_id ?? message.eventID ?? payload.event_id ?? payload.eventID);
    /** occurredAtMs 保留服务端或平台消息时间，不用本地时间伪造事实。 */
    const occurredAtMs = readMessageTime(message);
    return {
        key: rawKey,
        callID,
        conversationID: readString(payload.conversation_id ?? payload.conversationID),
        callType,
        mediaType: callType === 'video' ? 'video' : 'voice',
        roomName,
        callerID: readString(payload.caller_id ?? payload.callerID),
        operatorID: readString(payload.operator_id ?? payload.operatorID),
        status: readString(payload.status),
        reason: readString(payload.reason),
        durationSeconds: readNumber(payload.duration_seconds ??
            payload.durationSeconds ??
            payload.duration ??
            payload.duration_sec),
        e2eeRequired: readBoolean(payload.e2ee_required ?? payload.e2eeRequired),
        ...(eventID ? { eventID } : {}),
        ...(occurredAtMs ? { occurredAtMs } : {}),
    };
}
/** 统一 audio、voice 与 video 媒体类型。 */
function normalizeCallType(value) {
    /** normalizedType 拒绝服务端未声明的新媒体类型静默降级。 */
    const normalizedType = readString(value).toLowerCase();
    if (normalizedType === 'audio' || normalizedType === 'voice')
        return 'audio';
    if (normalizedType === 'video')
        return 'video';
    return null;
}
/** 读取消息服务端时间并统一为毫秒。 */
function readMessageTime(message) {
    /** candidates 按 Gateway 时间、RN 发送时间与创建时间排序。 */
    const candidates = [message.sent_at, message.sendTime, message.createTime];
    for (const candidate of candidates) {
        if (typeof candidate === 'number' && Number.isFinite(candidate))
            return candidate;
        if (typeof candidate !== 'string' || !candidate.trim())
            continue;
        /** numeric 兼容 RN 毫秒字符串。 */
        const numeric = Number(candidate);
        if (Number.isFinite(numeric) && numeric > 0)
            return numeric;
        /** parsed 兼容 Gateway ISO 时间。 */
        const parsed = Date.parse(candidate);
        if (Number.isFinite(parsed))
            return parsed;
    }
    return 0;
}
/** 判断 unknown 是否为普通 JSON 对象。 */
function isRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
/** 安全读取普通对象。 */
function readRecord(value) {
    return isRecord(value) ? value : null;
}
/** 安全读取字符串或数字身份。 */
function readString(value) {
    return typeof value === 'string'
        ? value.trim()
        : typeof value === 'number'
            ? String(value)
            : '';
}
/** 安全读取有限数字。 */
function readNumber(value) {
    /** numeric 统一 number 与数字字符串。 */
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
}
/** 统一读取布尔值与服务端常见字符串别名。 */
function readBoolean(value) {
    if (typeof value === 'boolean')
        return value;
    /** normalized 只接受明确真值，其他输入保持 false。 */
    const normalized = readString(value).toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
}
/** 安全解析任意 JSON 值。 */
function parseJSONValue(value) {
    try {
        return JSON.parse(value);
    }
    catch {
        return null;
    }
}
/** 安全解析 JSON 普通对象。 */
function parseJSONRecord(value) {
    if (isRecord(value))
        return value;
    if (typeof value !== 'string' || !value.trim())
        return null;
    return readRecord(parseJSONValue(value));
}
//# sourceMappingURL=call-realtime-signal.js.map