import { createWebIMSyncError } from './sync-context.js';
/** 按会话保留账号页最高 pts 状态，并拒绝无效账号更新。 */
export function deduplicateGatewayDifferenceStates(updates) {
    // byConversationID 保存状态及其账号级排序水位。
    const byConversationID = new Map();
    for (const update of updates) {
        // conversationID 是去重和后续 Difference 的稳定 owner。
        const conversationID = update.state.conversation_id?.trim();
        if (!conversationID || !/^\d+$/.test(update.pts)) {
            throw createWebIMSyncError('GATEWAY_DIFFERENCE_UPDATE_INVALID', 'Gateway account difference returned an invalid update.');
        }
        // existing 只在新 pts 不更大时保留。
        const existing = byConversationID.get(conversationID);
        if (!existing || BigInt(update.pts) > BigInt(existing.pts)) {
            byConversationID.set(conversationID, {
                pts: update.pts,
                state: { ...update.state, conversation_id: conversationID },
            });
        }
    }
    return [...byConversationID.values()].map(item => item.state);
}
/** 把账号级游标状态覆盖到详情映射，同时保留详情拥有的资料字段。 */
export function mergeGatewayDifferenceConversationState(conversation, state) {
    // unreadCount 只接受非负安全数字或十进制字符串。
    const unreadCount = readGatewayDifferenceCount(state.unread_count, conversation.unreadCount);
    // pinnedAt 空值表示取消置顶，非空时间由 Date parser 归一化。
    const pinnedAt = state.pinned_at === undefined
        ? conversation.pinnedAt
        : Date.parse(state.pinned_at || '') || 0;
    return {
        ...conversation,
        ...(state.last_msg_seq ? { lastMsgSeq: state.last_msg_seq } : {}),
        ...(state.last_read_seq ? { lastReadSeq: state.last_read_seq } : {}),
        ...(state.clear_before_seq ? { clearBeforeSeq: state.clear_before_seq } : {}),
        unreadCount,
        ...(state.manual_unread === undefined ? {} : { manualUnread: state.manual_unread }),
        ...(state.archived === undefined ? {} : { isArchived: state.archived }),
        ...(state.notification_muted === undefined
            ? {}
            : { isMuted: state.notification_muted }),
        ...(pinnedAt === undefined ? {} : { isPinned: pinnedAt > 0, pinnedAt }),
    };
}
/** 将 Gateway user DTO 映射为共享最小用户资料并按 userID 去重。 */
export function mapGatewayDifferenceUsers(gatewayUsers) {
    // users 只保存具备稳定身份的服务端资料。
    const users = gatewayUsers.flatMap(gatewayUser => {
        // userID 为空时该资料无法关联任何消息。
        const userID = gatewayUser.user_id?.trim();
        if (!userID)
            return [];
        return [{
                userID,
                ...(gatewayUser.nickname ? { nickname: gatewayUser.nickname } : {}),
                ...(gatewayUser.avatar_url ? { faceURL: gatewayUser.avatar_url } : {}),
                payload: gatewayUser,
            }];
    });
    return [...new Map(users.map(user => [user.userID, user])).values()];
}
/** 校验会话 Difference 双游标存在、单调且有分页进展。 */
export function assertGatewayConversationDifferenceState(difference, conversationID, previousPTS, previousQTS) {
    // pts 与 qts 必须是可无损比较的十进制字符串。
    const pts = difference.state?.pts;
    // qts 与消息更新 cursor 共用同一格式约束。
    const qts = difference.state?.qts;
    if (!/^\d+$/.test(pts ?? '') || !/^\d+$/.test(qts ?? '')) {
        throw createWebIMSyncError('GATEWAY_CONVERSATION_DIFFERENCE_STATE_INVALID', `Gateway conversation difference returned invalid cursors for ${conversationID}.`);
    }
    if (BigInt(pts) < BigInt(previousPTS) || BigInt(qts) < BigInt(previousQTS)) {
        throw createWebIMSyncError('GATEWAY_CONVERSATION_DIFFERENCE_CURSOR_REGRESSION', `Gateway conversation difference regressed cursors for ${conversationID}.`);
    }
    if (difference.has_more && pts === previousPTS && qts === previousQTS) {
        throw createWebIMSyncError('GATEWAY_CONVERSATION_DIFFERENCE_CURSOR_STALLED', `Gateway conversation difference did not advance cursors for ${conversationID}.`);
    }
}
/** 将服务端 unread 值约束为页面可安全消费的非负整数。 */
function readGatewayDifferenceCount(value, fallback) {
    // numeric 仅允许安全整数，超大 uint64 不进入 JS 计数展示。
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isSafeInteger(numeric) && numeric >= 0 ? numeric : fallback;
}
//# sourceMappingURL=gateway-difference-data.js.map