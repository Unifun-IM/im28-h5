/** 允许作为历史气泡展示的服务端终态信令。 */
const TERMINAL_CALL_SIGNAL_STATUS = {
    'rtc.call.reject': 'rejected',
    'rtc.call.cancel': 'canceled',
    'rtc.call.hangup': 'ended',
    'rtc.call.ended': 'ended',
    'rtc.call.missed': 'missed',
    'rtc.call.failed': 'failed',
};
/** 从 Gateway canonical body 或 RN MessageItem 读取历史通话气泡。 */
export function parseIMCallMessagePresentation(value) {
    /** message 只接受一条普通消息记录，避免递归解析实时消息集合。 */
    const message = readRecord(value);
    if (!message)
        return null;
    /** body 兼容 core Message.payload、Gateway message.body 与 RN payload.body。 */
    const payloadRecord = readRecord(message.payload);
    /** body 优先读取 Gateway 包装，随后读取 core Message.payload。 */
    const body = readRecord(message.body) ?? readRecord(payloadRecord?.body) ?? payloadRecord ?? message;
    /** custom 兼容 Gateway body.custom 与 RN customElem。 */
    const custom = readRecord(body.custom) ?? readRecord(message.customElem);
    /** system 兼容 Gateway body.system。 */
    const system = readRecord(body.system) ?? readRecord(message.system);
    /** key 优先使用服务端 system event_type。 */
    const key = readString(system?.event_type) ||
        readString(custom?.key) ||
        readString(custom?.extension) ||
        readString(custom?.description);
    /** customPayload 兼容 JSON string 和对象快照。 */
    const customPayload = readJSONRecord(custom?.data) ??
        readJSONRecord(custom?.detail) ??
        readJSONRecord(message.content);
    /** signalPayload 读取系统通知的结构化 extra。 */
    const signalPayload = readRecord(system?.extra) ?? customPayload;
    if (customPayload && readString(customPayload.type) === 'im28.rtc.call') {
        return createPresentation(customPayload, '');
    }
    if (key === 'rtc.call.summary' && signalPayload) {
        return createPresentation(signalPayload, 'ended');
    }
    /** fallbackStatus 只覆盖终态白名单，invite/accept 保留给实时状态机。 */
    const fallbackStatus = TERMINAL_CALL_SIGNAL_STATUS[key];
    return fallbackStatus && signalPayload
        ? createPresentation(signalPayload, fallbackStatus)
        : null;
}
/** 按 RN 既有文案格式输出历史通话摘要。 */
export function formatIMCallMessageText(call) {
    if (call.status === 'invited')
        return '发起通话';
    if (call.status === 'accepted')
        return '已接听';
    if (call.status === 'canceled')
        return '已取消';
    if (call.status === 'rejected')
        return '已拒绝';
    if (call.status === 'missed')
        return '未接听';
    if (call.status === 'failed')
        return '通话失败';
    return `通话时长 ${formatDuration(call.durationSeconds)}`;
}
/** 将协议 payload 转换为稳定展示模型。 */
function createPresentation(payload, fallbackStatus) {
    /** mediaType 兼容历史 mediaType 和服务端 call_type。 */
    const mediaType = normalizeMediaType(payload.mediaType ?? payload.media_type ?? payload.callType ?? payload.call_type);
    /** status 优先信任服务端摘要，终态 key 仅作回退。 */
    const status = normalizeStatus(payload.status ?? payload.answer_status) || fallbackStatus;
    if (!mediaType || !status)
        return null;
    /** durationSeconds 兼容 RN 与 Gateway 的字段命名。 */
    const durationSeconds = Math.max(0, readNumber(payload.durationSeconds ??
        payload.duration_seconds ??
        payload.duration ??
        payload.duration_sec));
    /** presentation 由共享逻辑一次性冻结文案和未应答状态。 */
    const presentation = {
        mediaType,
        status,
        durationSeconds,
        roomName: readString(payload.roomName ?? payload.room_name ?? payload.room),
        text: '',
        unanswered: status === 'rejected' || status === 'canceled',
    };
    return { ...presentation, text: formatIMCallMessageText(presentation) };
}
/** 将协议媒体类型归一化为通话控制使用的 audio/video。 */
function normalizeMediaType(value) {
    /** mediaType 忽略服务端大小写差异。 */
    const mediaType = readString(value).toLowerCase();
    if (mediaType === 'audio' || mediaType === 'voice')
        return 'audio';
    if (mediaType === 'video')
        return 'video';
    return '';
}
/** 将历史别名归一化为 RN 已支持的状态。 */
function normalizeStatus(value) {
    /** status 忽略大小写并接受已有服务端别名。 */
    const status = readString(value).toLowerCase();
    if (status === 'invited' || status === 'invite' || status === 'ringing')
        return 'invited';
    if (status === 'accepted' || status === 'accept' || status === 'answered')
        return 'accepted';
    if (status === 'ended' || status === 'end' || status === 'finished')
        return 'ended';
    if (status === 'rejected' || status === 'reject' || status === 'refused')
        return 'rejected';
    if (status === 'canceled' || status === 'cancelled' || status === 'cancel')
        return 'canceled';
    if (status === 'missed' || status === 'timeout' || status === 'no_answer')
        return 'missed';
    if (status === 'failed' || status === 'fail' || status === 'failure')
        return 'failed';
    return '';
}
/** 将秒数格式化为 RN 使用的两位分钟和秒。 */
function formatDuration(value) {
    /** seconds 防止负数和小数进入展示层。 */
    const seconds = Math.max(0, Math.round(value || 0));
    /** minutes 保留超过一小时的累计分钟语义。 */
    const minutes = Math.floor(seconds / 60);
    /** remainingSeconds 是当前分钟内的两位秒数。 */
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
/** 安全读取普通 JSON 对象。 */
function readRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
/** 安全解析字符串或对象形式的 JSON 记录。 */
function readJSONRecord(value) {
    if (readRecord(value))
        return value;
    if (typeof value !== 'string' || !value.trim())
        return null;
    try {
        return readRecord(JSON.parse(value));
    }
    catch {
        return null;
    }
}
/** 安全读取字符串或数字协议值。 */
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
//# sourceMappingURL=call-message.js.map