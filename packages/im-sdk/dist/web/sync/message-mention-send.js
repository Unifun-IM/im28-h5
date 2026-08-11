import { getIllustratedPresetEmoji, normalizeMessageMentions, resolvePresetEmojiEntities, serializePresetEmojiEntities, trimPresetEmojiDocument, } from '@im28/im-sdk/core';
import { executeWebIMMessageSend, } from './message-send-state.js';
import { createWebIMSyncError } from './sync-context.js';
/** 校验提及身份与正文后复用共享 optimistic send 状态机。 */
export async function sendWebIMMentionMessage(context, options, dependencies) {
    /** document 同步裁剪正文与实体偏移。 */
    const document = trimPresetEmojiDocument({
        text: options.text,
        entities: options.entities ?? [],
    });
    /** text 是 Gateway 和 SQLite 使用的完整提及正文。 */
    const text = document.text;
    if (!text) {
        throw createWebIMSyncError('INVALID_MENTION_MESSAGE', 'Mention sending requires non-empty text.');
    }
    /** mentions 去重并拒绝无法从正文证明的幽灵目标。 */
    const mentions = normalizeMessageMentions(options.mentions).filter(mention => mention.type === 'all'
        ? text.includes('@所有人')
        : Boolean(mention.userID && mention.nickname && text.includes(`@${mention.nickname}`)));
    if (!mentions.length) {
        throw createWebIMSyncError('INVALID_MENTION_TARGETS', 'Mention sending requires a visible target in the message text.');
    }
    /** entities 复用共享 preset 身份校验。 */
    const entities = resolvePresetEmojiEntities(text, document.entities, getIllustratedPresetEmoji);
    /** gatewayMentions 转成现有 snake_case 线格式。 */
    const gatewayMentions = serializeMessageMentions(mentions);
    /** gatewayEntities 保留提及正文中的插画表情身份。 */
    const gatewayEntities = serializePresetEmojiEntities(entities, text);
    /** body 同时保存 targets/user_ids，兼容历史消费者。 */
    const body = {
        mention: {
            text,
            targets: gatewayMentions,
            user_ids: mentions.flatMap(mention => mention.userID ? [mention.userID] : []),
        },
    };
    return executeWebIMMessageSend(context, {
        conversationID: options.conversationID,
        contentType: 106,
        payload: body,
        mentions,
        ...(entities.length ? { entities } : {}),
    }, body, dependencies, gatewayEntities, gatewayMentions);
}
/** 将共享提及目标序列化为 Gateway 线格式。 */
function serializeMessageMentions(mentions) {
    return mentions.map(mention => {
        if (mention.type === 'all') {
            return { type: 'all', ...(mention.nickname ? { nickname: mention.nickname } : {}) };
        }
        /** userID 已由 normalizeMessageMentions 保证非空。 */
        const userID = mention.userID;
        if (!userID) {
            throw createWebIMSyncError('INVALID_MENTION_TARGETS', 'User mention requires a user ID.');
        }
        return {
            type: 'user',
            user_id: userID,
            ...(mention.nickname ? { nickname: mention.nickname } : {}),
        };
    });
}
//# sourceMappingURL=message-mention-send.js.map