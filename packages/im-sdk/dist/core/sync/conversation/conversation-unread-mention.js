import { findLatestUnreadMention, } from '@im28/im-sdk/core';
import { resolveGroupSenderDisplayName } from '../contact/sender-display-name.js';
/** 读取单个群会话的最近未读 mention 与可用发送人名称。 */
export async function readUnreadMentionSnapshot(context, conversation) {
    if (conversation.type !== 'group' || conversation.unreadCount <= 0)
        return null;
    /** lastReadSeq 是本地未读窗口的严格下界，非法值必须 fail-closed。 */
    const lastReadSeq = parseSafeSequence(conversation.lastReadSeq);
    if (lastReadSeq === null)
        return null;
    /** message 只会命中 incoming、未删除且具有稳定 mention 身份的缓存行。 */
    const message = await findLatestUnreadMention(context.database, {
        conversationID: conversation.conversationID,
        currentUserID: context.userID,
        lastReadSeq,
    });
    if (!message)
        return null;
    /** senderDisplayName 只组合现有好友、群成员和用户缓存，不额外发起网络同步。 */
    const senderDisplayName = await resolveGroupSenderDisplayName(context.database, conversation.targetID, message.senderID);
    return {
        message,
        ...(senderDisplayName ? { senderDisplayName } : {}),
    };
}
/** 将 Gateway uint64 字符串收窄为当前 SQLite 可比较的非负安全整数。 */
function parseSafeSequence(value) {
    if (value === undefined || !/^\d+$/.test(value.trim()))
        return null;
    /** sequence 只在不丢失整数精度时参与未读边界查询。 */
    const sequence = Number(value);
    return Number.isSafeInteger(sequence) && sequence >= 0 ? sequence : null;
}
//# sourceMappingURL=conversation-unread-mention.js.map