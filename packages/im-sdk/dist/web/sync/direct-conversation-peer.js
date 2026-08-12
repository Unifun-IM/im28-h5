/** 按消息关系、明确对端、会话快照和 ID 依次解析单聊对端。 */
export function resolveDirectConversationPeerUserID(input) {
    /** currentUserID 用于排除自发消息中的本人身份。 */
    const currentUserID = input.currentUserID.trim();
    /** conversationID 只作为最后兼容兜底。 */
    const conversationID = input.conversationID.trim();
    /** senderID 是当前消息发送方。 */
    const senderID = input.messageSenderID?.trim() ?? '';
    /** receiverID 是当前消息接收方。 */
    const receiverID = input.messageReceiverID?.trim() ?? '';
    /** messageCounterpart 优先采用当前消息明确指向的非本人身份。 */
    const messageCounterpart = senderID && senderID !== currentUserID
        ? senderID
        : receiverID && receiverID !== currentUserID
            ? receiverID
            : '';
    /** candidates 按可靠性排序，实时关系消息优先于可能过时的会话快照。 */
    const candidates = [
        messageCounterpart,
        ...(input.systemRelatedUserIDs ?? []),
        input.explicitPeerUserID,
        input.conversationUserID,
        input.existingUserID,
    ];
    /** peerUserID 必须非空、非本人且不能误用完整会话 ID。 */
    const peerUserID = candidates
        .map(candidate => candidate?.trim() ?? '')
        .find(candidate => Boolean(candidate) &&
        candidate !== currentUserID &&
        candidate !== conversationID);
    if (peerUserID)
        return peerUserID;
    /** derivedUserID 兼容旧 si_/single_/direct_ 会话键。 */
    const derivedUserID = deriveDirectConversationUserID(conversationID);
    return derivedUserID !== currentUserID ? derivedUserID : '';
}
/** 从兼容会话键中提取最后兜底身份。 */
function deriveDirectConversationUserID(conversationID) {
    for (const prefix of ['si_', 'single_', 'direct_']) {
        if (conversationID.startsWith(prefix))
            return conversationID.slice(prefix.length);
    }
    return conversationID;
}
//# sourceMappingURL=direct-conversation-peer.js.map