import { IM_FRIEND_ADDED_MESSAGE_TYPE } from './friend-added-message.js';
/** 按从旧到新的消息顺序计算跨端一致的初始未读边界。 */
export function getIMInitialUnreadNavigation(messages, lastReadSeq) {
    /** readSequence 只接受十进制 uint64 字符串，非法边界必须 fail-closed。 */
    const readSequence = normalizeDecimalSequence(lastReadSeq);
    if (!readSequence)
        return { unreadMessageIDs: [] };
    /** unreadMessages 只包含读边界之后收到的稳定服务端消息。 */
    const unreadMessages = messages.filter(message => message.direction === 'incoming' &&
        isSequenceAfter(getMessageSequence(message), readSequence));
    if (unreadMessages.length === 0)
        return { unreadMessageIDs: [] };
    /** firstUnreadIndex 定位第一条普通未读消息。 */
    const firstUnreadIndex = messages.indexOf(unreadMessages[0]);
    /** boundaryIndex 对齐 RN 对好友建立通知对的跳过规则。 */
    const boundaryIndex = getUnreadBoundaryIndex(messages, firstUnreadIndex, readSequence);
    /** firstUnreadMessage 是分割线后的第一条普通未读消息。 */
    const firstUnreadMessage = boundaryIndex >= 0 ? messages[boundaryIndex] : undefined;
    return {
        unreadMessageIDs: unreadMessages.map(getStableMessageIdentity).filter(Boolean),
        ...(firstUnreadMessage
            ? { firstUnreadMessageID: getStableMessageIdentity(firstUnreadMessage) }
            : {}),
        ...(firstUnreadMessage && boundaryIndex > 0
            ? { lastReadMessageID: getStableMessageIdentity(messages[boundaryIndex - 1]) }
            : {}),
    };
}
/** 返回当前可见身份中严格越过已读边界的最高 incoming 消息序列。 */
export function getIMVisibleUnreadReadSeq(messages, readSeq, visibleMessageIDs) {
    /** readSequence 保证已提交或缓存边界之后才允许再次上报。 */
    const normalizedReadSequence = normalizeDecimalSequence(readSeq);
    if (readSeq !== undefined && !normalizedReadSequence)
        return undefined;
    /** readSequence 在服务端尚无游标时从零开始，明确非法值不得降级。 */
    const readSequence = normalizedReadSequence ?? '0';
    /** maxVisibleSequence 保持 uint64 文本比较，不经过 JavaScript number。 */
    let maxVisibleSequence = '';
    messages.forEach(message => {
        if (message.direction !== 'incoming')
            return;
        /** identity 同初始边界使用 server 优先身份。 */
        const identity = getStableMessageIdentity(message);
        if (!identity || !visibleMessageIDs.has(identity))
            return;
        /** sequence 必须有效且严格大于现有已读游标。 */
        const sequence = getMessageSequence(message);
        if (!isSequenceAfter(sequence, readSequence))
            return;
        if (!maxVisibleSequence || isSequenceAfter(sequence, maxVisibleSequence)) {
            maxVisibleSequence = sequence;
        }
    });
    return maxVisibleSequence || undefined;
}
/** 对齐 RN：未读开头的一条好友建立通知不占普通消息分割线。 */
function getUnreadBoundaryIndex(messages, firstUnreadIndex, readSequence) {
    if (firstUnreadIndex < 0)
        return -1;
    /** friendAddedIndex 兼容通知位于首条或其后一条的历史排列。 */
    const friendAddedIndex = messages[firstUnreadIndex]?.contentType === IM_FRIEND_ADDED_MESSAGE_TYPE
        ? firstUnreadIndex
        : messages[firstUnreadIndex + 1]?.contentType === IM_FRIEND_ADDED_MESSAGE_TYPE
            ? firstUnreadIndex + 1
            : -1;
    if (friendAddedIndex < 0)
        return firstUnreadIndex;
    return messages.findIndex((message, index) => index > friendAddedIndex &&
        message.direction === 'incoming' &&
        isSequenceAfter(getMessageSequence(message), readSequence));
}
/** 返回服务端优先的稳定消息身份。 */
function getStableMessageIdentity(message) {
    return message.serverMsgID?.trim() || message.clientMsgID.trim();
}
/** 优先使用精确 seqString，安全整数历史消息回退 seq。 */
function getMessageSequence(message) {
    return normalizeDecimalSequence(message.seqString) ||
        (Number.isSafeInteger(message.seq) && (message.seq ?? -1) >= 0
            ? String(message.seq)
            : '');
}
/** 判断候选十进制序列是否严格位于阅读边界之后。 */
function isSequenceAfter(candidate, boundary) {
    if (!candidate)
        return false;
    if (candidate.length !== boundary.length)
        return candidate.length > boundary.length;
    return candidate > boundary;
}
/** 规范化无符号十进制序列并移除前导零。 */
function normalizeDecimalSequence(value) {
    /** candidate 只保留调用方提供的十进制文本。 */
    const candidate = value?.trim() ?? '';
    if (!/^\d+$/.test(candidate))
        return '';
    return candidate.replace(/^0+(?=\d)/, '');
}
//# sourceMappingURL=initial-unread-navigation.js.map