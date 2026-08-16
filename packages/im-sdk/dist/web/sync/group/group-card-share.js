import { executeWebIMMessageSend, } from '../message/message-send-state.js';
import { sendWebIMTextMessage } from '../message/message-text-send.js';
import { openAndCacheWebIMDirectConversation } from '../contact/peer-profile-sync.js';
import { createWebIMSyncError, } from '../sync-context.js';
/** 在冻结账号上下文中执行 RN/Web/Desktop 共用的群名片发送顺序。 */
export async function shareIMGroupCard(context, options, dependencies) {
    // groupID 是卡片跳转和服务端 body 的稳定群身份。
    const groupID = options.groupID.trim();
    if (!groupID) {
        throw createWebIMSyncError('INVALID_GROUP_CARD_ID', 'Group card sharing requires a group ID.');
    }
    // targetUserIDs 保序去重并排除本人，保持所有平台选择器边界一致。
    const targetUserIDs = Array.from(new Set(options.targetUserIDs
        .map(userID => userID.trim())
        .filter(userID => userID && userID !== context.userID)));
    if (targetUserIDs.length === 0) {
        throw createWebIMSyncError('INVALID_GROUP_CARD_TARGETS', 'Group card sharing requires at least one valid friend target.');
    }
    // body 在首个 I/O 前完整冻结，防止逐目标发送时内容发生偏移。
    const body = createIMGroupCardBody(options, groupID);
    // message 沿用 RN trim 语义，空附言不创建文本消息。
    const message = options.message?.trim() ?? '';
    // conversationIDs 按调用目标顺序返回真实 Gateway 会话身份。
    const conversationIDs = [];
    // cardMessages 保存每个目标由共享状态机收敛的 type108 实体。
    const cardMessages = [];
    // noteMessages 仅包含实际发送的非空附言实体。
    const noteMessages = [];
    for (const targetUserID of targetUserIDs) {
        // conversation 复用共享 Gateway mapper 与 Repository 写入。
        const conversation = await openAndCacheWebIMDirectConversation(context, targetUserID, dependencies.gatewayClient);
        conversationIDs.push(conversation.conversationID);
        // cardMessage 统一执行 sending -> sent/failed 与 SQLite 收敛。
        const cardMessage = await executeWebIMMessageSend(context, {
            conversationID: conversation.conversationID,
            contentType: 108,
            payload: body,
        }, body, dependencies);
        cardMessages.push(cardMessage);
        if (message) {
            // noteMessage 必须位于同一目标卡片之后，保持 RN 既有可见顺序。
            const noteMessage = await sendWebIMTextMessage(context, { conversationID: conversation.conversationID, text: message }, dependencies);
            noteMessages.push(noteMessage);
        }
    }
    return { groupID, targetUserIDs, conversationIDs, cardMessages, noteMessages };
}
/** 构造 Gateway 规范群卡片 body，并冻结名称与头像展示快照。 */
function createIMGroupCardBody(options, groupID) {
    // groupName 缺失时回退稳定群 ID，与 RN 既有卡片展示一致。
    const groupName = options.groupName.trim() || groupID;
    // faceURL 只保留调用时已有的可选展示快照。
    const faceURL = options.faceURL?.trim() ?? '';
    return {
        card: {
            type: 'group',
            group: {
                group_id: groupID,
                title: groupName,
                avatar_url: faceURL,
            },
        },
    };
}
//# sourceMappingURL=group-card-share.js.map