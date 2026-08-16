import { createWebIMSyncError } from '../sync-context.js';
/** 校验平台提供的输出 ID 与来源顺序严格对齐，防止覆盖来源或批内实体。 */
export function normalizeForwardOutputIDs(options, sourceClientMsgIDs) {
    // providedIDs 缺省时保留 SDK 自生成行为。
    const providedIDs = options.forwardClientMsgIDs;
    if (providedIDs === undefined) {
        return sourceClientMsgIDs.map(() => undefined);
    }
    // normalizedIDs 不允许通过 trim 后丢项改变来源与输出的索引关系。
    const normalizedIDs = providedIDs.map(value => value.trim());
    if (normalizedIDs.length !== sourceClientMsgIDs.length ||
        normalizedIDs.some(value => !value)) {
        throw createWebIMSyncError('INVALID_FORWARD_OUTPUT_IDS', 'Forward output client message IDs must match every source message.');
    }
    // reservedIDs 同时保护来源行和可选评论行不被 optimistic upsert 覆盖。
    const reservedIDs = new Set(sourceClientMsgIDs);
    // commentClientMsgID 仅在真实评论存在时参与批内身份约束。
    const commentClientMsgID = options.comment?.trim()
        ? options.commentClientMsgID?.trim() ?? ''
        : '';
    if (commentClientMsgID)
        reservedIDs.add(commentClientMsgID);
    // uniqueIDs 确保批内每个 optimistic 行具有唯一主键。
    const uniqueIDs = new Set(normalizedIDs);
    if (uniqueIDs.size !== normalizedIDs.length ||
        normalizedIDs.some(value => reservedIDs.has(value))) {
        throw createWebIMSyncError('DUPLICATE_FORWARD_OUTPUT_ID', 'Forward output client message IDs must be unique and separate from source identities.');
    }
    return normalizedIDs;
}
/** 防止平台注入的稳定 ID 覆盖当前账号内不相关的缓存消息。 */
export async function assertReusableForwardOutputRows(params) {
    // outputClientMsgIDs 只检查平台显式提供的身份。
    for (let index = 0; index < params.outputClientMsgIDs.length; index += 1) {
        // clientMsgID 缺省代表本项仍由 SDK 生成。
        const clientMsgID = params.outputClientMsgIDs[index];
        if (!clientMsgID)
            continue;
        // existing 是可能被同主键 upsert 覆盖的当前账号实体。
        const existing = await params.messageRepository.getByClientMsgID(clientMsgID);
        if (!existing)
            continue;
        // sourceMessage 与输出索引严格对齐。
        const sourceMessage = params.sourceMessages[index];
        // reusable 仅允许同目标、同账号、同来源的失败转发重试。
        const reusable = existing.conversationID === params.conversationID &&
            existing.senderID === params.context.userID &&
            existing.direction === 'outgoing' &&
            existing.status === 'failed' &&
            existing.forwardSourceMsgID === sourceMessage.serverMsgID;
        if (!reusable) {
            throw createWebIMSyncError('FORWARD_OUTPUT_ID_CONFLICT', 'Forward output client message ID already belongs to another cached message.');
        }
    }
    if (!params.commentText || !params.commentClientMsgID)
        return;
    // existingComment 是可能被评论 optimistic upsert 覆盖的当前账号实体。
    const existingComment = await params.messageRepository.getByClientMsgID(params.commentClientMsgID);
    if (!existingComment)
        return;
    // reusableComment 只允许同目标账号的失败普通文本评论重试。
    const reusableComment = existingComment.conversationID === params.conversationID &&
        existingComment.senderID === params.context.userID &&
        existingComment.direction === 'outgoing' &&
        existingComment.status === 'failed' &&
        existingComment.contentType === 101 &&
        Boolean(existingComment.forwardBatchID);
    if (!reusableComment) {
        throw createWebIMSyncError('FORWARD_COMMENT_ID_CONFLICT', 'Forward comment client message ID already belongs to another cached message.');
    }
}
//# sourceMappingURL=message-forward-identities.js.map