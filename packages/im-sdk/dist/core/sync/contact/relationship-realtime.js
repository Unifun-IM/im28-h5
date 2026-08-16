/** 这些好友申请事件只改变申请列表，不代表当前好友或黑名单事实已经变化。 */
const NON_RELATIONSHIP_FRIEND_EVENTS = new Set([
    'friend_application_created',
    'onFriendApplicationAdded',
    'onFriendApplicationRejected',
    'onFriendApplicationDeleted',
]);
/** 这些申请事件要求刷新好友或群验证计数，不等同于普通消息缓存变化。 */
const VERIFICATION_EVENTS = new Set([
    'friend_application_created',
    'onFriendApplicationAdded',
    'onFriendApplicationAccepted',
    'onFriendApplicationRejected',
    'onFriendApplicationDeleted',
    'onGroupApplicationAdded',
    'onGroupApplicationAccepted',
    'onGroupApplicationRejected',
    'onGroupApplicationDeleted',
]);
/** 判断 Gateway realtime 事件是否要求重新读取单聊关系事实。 */
export function isIMRelationshipRealtimeEvent(event) {
    if (event.type === 'friend_deleted')
        return true;
    if (event.type !== 'friend')
        return false;
    /** eventNames 保留归一化前事件名，用于排除仅变更申请列表的通知。 */
    const eventNames = collectGatewayEventNames(event);
    return !eventNames.some(name => NON_RELATIONSHIP_FRIEND_EVENTS.has(name));
}
/** 判断 Gateway realtime 事件是否要求重新读取好友或群验证计数。 */
export function isIMVerificationRealtimeEvent(event) {
    if (event.type === 'friend_application_created')
        return true;
    if (event.type !== 'friend' && event.type !== 'group')
        return false;
    return collectGatewayEventNames(event).some(name => VERIFICATION_EVENTS.has(name));
}
/** 从标准事件及原始 Gateway 信封中收集候选事件名。 */
function collectGatewayEventNames(event) {
    /** names 去重保存顶层和 data 内可能存在的 Gateway 事件字段。 */
    const names = new Set();
    if (event.event)
        names.add(event.event);
    collectRecordEventNames(event.raw, names);
    return [...names];
}
/** 读取单层信封及其 data 内的事件名，避免把业务 payload 任意深度遍历。 */
function collectRecordEventNames(value, names) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return;
    /** record 提供类型安全的 Gateway 动态字段读取。 */
    const record = value;
    for (const key of ['type', 'event', 'event_name', 'command', 'action']) {
        /** name 只接纳非空字符串事件标识。 */
        const name = typeof record[key] === 'string' ? record[key].trim() : '';
        if (name)
            names.add(name);
    }
    /** data 可能包裹真正的 Gateway 事件名，仅额外读取这一层。 */
    const data = record.data;
    if (!data || typeof data !== 'object' || Array.isArray(data))
        return;
    /** dataRecord 对应嵌套信封而不是业务实体。 */
    const dataRecord = data;
    for (const key of ['type', 'event', 'event_name', 'command', 'action']) {
        /** name 只接纳嵌套信封中的非空字符串事件标识。 */
        const name = typeof dataRecord[key] === 'string' ? dataRecord[key].trim() : '';
        if (name)
            names.add(name);
    }
}
//# sourceMappingURL=relationship-realtime.js.map