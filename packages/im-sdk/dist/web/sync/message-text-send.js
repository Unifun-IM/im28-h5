import { getIllustratedPresetEmoji, resolvePresetEmojiEntities, serializePresetEmojiEntities, trimPresetEmojiDocument, } from '@im28/im-sdk/core';
import { executeWebIMMessageSend, } from './message-send-state.js';
import { createWebIMSyncError } from './sync-context.js';
/** 校验文本并复用通用 optimistic send 状态机。 */
export async function sendWebIMTextMessage(context, options, dependencies) {
    // document 同步裁剪正文与实体偏移，保持既有 trim 语义。
    const document = trimPresetEmojiDocument({
        text: options.text,
        entities: options.entities ?? [],
    });
    // text 是最终落库和发送的 Unicode 正文。
    const text = document.text;
    if (!text) {
        throw createWebIMSyncError('INVALID_TEXT_MESSAGE', 'Text sending requires non-empty text.');
    }
    // entities 只保留共享描述可解析且 fallback 完全匹配的身份。
    const entities = resolvePresetEmojiEntities(text, document.entities, getIllustratedPresetEmoji);
    // gatewayEntities 使用现有 snake_case 线格式。
    const gatewayEntities = serializePresetEmojiEntities(entities, text);
    return executeWebIMMessageSend(context, {
        conversationID: options.conversationID,
        contentType: 101,
        payload: { text: { text } },
        ...(entities.length ? { entities } : {}),
    }, { text: { text } }, dependencies, gatewayEntities, options.onSending);
}
//# sourceMappingURL=message-text-send.js.map