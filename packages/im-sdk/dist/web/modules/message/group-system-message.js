/** 群简介更新事件的稳定协议标识。 */
const GROUP_DESCRIPTION_CHANGED_EVENT = 'group_description_changed';
/** 群发言频率更新事件的稳定协议标识。 */
const GROUP_SEND_FREQUENCY_CHANGED_EVENT = 'group_send_frequency_changed';
/** 从 canonical、Gateway 或 RN 兼容消息读取结构化群系统文案。 */
export function parseIMGroupSystemMessagePresentation(value, currentUserID = '') {
    /** message 只接受单条普通消息记录。 */
    const message = readRecord(value);
    if (!message)
        return null;
    /** payload 兼容 core Message.payload 与 RN payload wrapper。 */
    const payload = readRecord(message.payload);
    /** body 统一 Gateway、core 和 RN 的消息正文入口。 */
    const body = readRecord(message.body) ?? readRecord(payload?.body) ?? payload ?? message;
    /** system 只接受结构化系统消息对象。 */
    const system = readRecord(body.system) ?? readRecord(message.system);
    if (!system)
        return null;
    /** eventType 是唯一允许选择业务文案的协议字段。 */
    const eventType = readString(system.event_type ?? system.eventType);
    /** extra 承载操作者和频率事实。 */
    const extra = readJSONRecord(system.extra);
    if (!eventType || !extra)
        return null;
    if (eventType === GROUP_DESCRIPTION_CHANGED_EVENT) {
        return createDescriptionPresentation(eventType, extra, currentUserID);
    }
    if (eventType === GROUP_SEND_FREQUENCY_CHANGED_EVENT) {
        return createSendFrequencyPresentation(eventType, extra);
    }
    return null;
}
/** 生成与 RN 一致的群简介操作者文案。 */
function createDescriptionPresentation(eventType, extra, currentUserID) {
    /** operatorUserID 用于识别当前账号本人操作。 */
    const operatorUserID = readString(extra.operator_user_id ?? extra.operatorUserID);
    /** operatorNickname 是非本人操作的服务端名称快照。 */
    const operatorNickname = readString(extra.operator_nickname ?? extra.operatorNickname);
    /** operatorLabel 禁止在名称缺失时回退用户 ID。 */
    const operatorLabel = operatorUserID && operatorUserID === currentUserID.trim()
        ? '你'
        : operatorNickname || '对方';
    return {
        kind: 'description',
        eventType,
        text: `${operatorLabel}更新了[群简介]`,
    };
}
/** 生成与 RN 一致的群发言频率文案。 */
function createSendFrequencyPresentation(eventType, extra) {
    /** enabled 必须来自明确布尔协议值，缺失时禁止猜测关闭。 */
    const enabled = readBoolean(extra.send_frequency_enabled ?? extra.sendFrequencyEnabled);
    if (enabled === undefined)
        return null;
    if (!enabled) {
        return { kind: 'send-frequency', eventType, text: '已关闭发言频率控制' };
    }
    /** frequencySeconds 开启时必须是正数秒数。 */
    const frequencySeconds = readPositiveNumber(extra.send_frequency_seconds ?? extra.sendFrequencySeconds);
    if (frequencySeconds === undefined)
        return null;
    return {
        kind: 'send-frequency',
        eventType,
        text: `已开启发言频率控制，间隔时间为${formatFrequencyInterval(frequencySeconds)}`,
    };
}
/** 将秒数格式化为 RN 使用的整分钟或秒。 */
function formatFrequencyInterval(seconds) {
    return seconds % 60 === 0 ? `${seconds / 60}分钟` : `${seconds}秒`;
}
/** 安全读取普通 JSON 对象。 */
function readRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
/** 兼容对象或 JSON string 形式的 system.extra。 */
function readJSONRecord(value) {
    /** record 允许 Gateway 直接提供结构化 extra。 */
    const record = readRecord(value);
    if (record)
        return record;
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
/** 只接受明确的布尔或布尔字符串。 */
function readBoolean(value) {
    if (typeof value === 'boolean')
        return value;
    /** normalized 统一 Gateway 字符串大小写。 */
    const normalized = readString(value).toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes')
        return true;
    if (normalized === 'false' || normalized === '0' || normalized === 'no')
        return false;
    return undefined;
}
/** 只接受可安全展示的正整数秒数。 */
function readPositiveNumber(value) {
    /** parsed 统一数值和十进制字符串输入。 */
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}
//# sourceMappingURL=group-system-message.js.map