/** RTC 终结事件允许进入通话记录状态机的固定类型。 */
const TERMINAL_CALL_SIGNAL_KEYS = new Set([
    'rtc.call.reject',
    'rtc.call.cancel',
    'rtc.call.hangup',
    'rtc.call.ended',
    'rtc.call.missed',
    'rtc.call.failed',
    'rtc.call.summary',
]);
/** 从 RN、Web、Desktop 消息包装中归一化全部 RTC 终结信号。 */
export function normalizeIMCallTerminalSignals(value, fallbackEndedAtMs = Date.now()) {
    /** signals 保留输入顺序，重复身份以后出现的服务端状态为准。 */
    const signals = new Map();
    visitCallSignalValue(value, fallbackEndedAtMs, signals);
    return [...signals.values()];
}
/** 深度遍历消息集合与常见 transport 包装。 */
function visitCallSignalValue(value, fallbackEndedAtMs, output) {
    if (typeof value === 'string') {
        /** parsed 仅接收有效 JSON，普通正文不会产生信号。 */
        const parsed = parseJSONValue(value);
        if (parsed !== null)
            visitCallSignalValue(parsed, fallbackEndedAtMs, output);
        return;
    }
    if (Array.isArray(value)) {
        value.forEach(item => visitCallSignalValue(item, fallbackEndedAtMs, output));
        return;
    }
    if (!isRecord(value))
        return;
    /** signal 从当前消息本身读取 system/custom 两类协议字段。 */
    const signal = readCallTerminalSignal(value, fallbackEndedAtMs);
    if (signal)
        output.set(`${signal.key}:${signal.callID}`, signal);
    /** collectionKey 限定协议允许携带批量消息的字段。 */
    for (const collectionKey of ['messages', 'list', 'events', 'notifications']) {
        if (Array.isArray(value[collectionKey])) {
            value[collectionKey].forEach(item => visitCallSignalValue(item, fallbackEndedAtMs, output));
        }
    }
    /** wrapperKey 递归 Gateway 与 RN 常见单层包装。 */
    for (const wrapperKey of ['data', 'payload', 'message']) {
        if (value[wrapperKey] !== undefined) {
            visitCallSignalValue(value[wrapperKey], fallbackEndedAtMs, output);
        }
    }
}
/** 从一条消息记录读取 system notice 或 custom RTC 终结信号。 */
function readCallTerminalSignal(message, fallbackEndedAtMs) {
    /** body 兼容 Gateway canonical body 和 RN payload.body。 */
    const body = readRecord(message.body) ?? readRecord(readRecord(message.payload)?.body);
    /** system 承载 Gateway 1601-1608 系统通知。 */
    const system = readRecord(body?.system);
    /** custom 兼容 Gateway body.custom 与 RN customElem。 */
    const custom = readRecord(body?.custom) ?? readRecord(message.customElem);
    /** key 优先使用权威 system event_type。 */
    const key = readString(system?.event_type) ||
        readString(custom?.key) ||
        readString(custom?.extension) ||
        readString(custom?.description);
    if (!TERMINAL_CALL_SIGNAL_KEYS.has(key))
        return null;
    /** payload 优先使用 system.extra，再解析 custom 多种 JSON 别名。 */
    const payload = readRecord(system?.extra) ??
        parseJSONRecord(custom?.data) ??
        parseJSONRecord(custom?.detail) ??
        parseJSONRecord(message.content);
    /** callID 是通话缓存唯一身份，缺失时保持 fail-closed。 */
    const callID = readString(payload?.call_id) || readString(payload?.callID);
    if (!payload || !callID)
        return null;
    return {
        key,
        callID,
        conversationID: readString(payload.conversation_id),
        callType: readString(payload.call_type),
        roomName: readString(payload.room_name),
        callerID: readString(payload.caller_id),
        operatorID: readString(payload.operator_id),
        status: readString(payload.status),
        answerStatus: readString(payload.answer_status),
        reason: readString(payload.reason),
        durationSeconds: readNumber(payload.duration_seconds ??
            payload.durationSeconds ??
            payload.duration ??
            payload.duration_sec),
        endedAtMs: readMessageTime(message) || fallbackEndedAtMs,
    };
}
/** 读取消息时间并兼容 Gateway ISO 与 RN 毫秒值。 */
function readMessageTime(message) {
    /** candidates 按服务端发送时间、RN 发送时间和创建时间排序。 */
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
/** 安全读取普通对象。 */
function readRecord(value) {
    return isRecord(value) ? value : null;
}
/** 判断 unknown 是否为普通 JSON 对象。 */
function isRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
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
//# sourceMappingURL=call-terminal-signal.js.map