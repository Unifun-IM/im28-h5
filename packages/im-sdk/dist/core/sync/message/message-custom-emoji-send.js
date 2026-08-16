import { MessageRepository, normalizeCustomEmojiID, normalizeCustomEmojiURL, } from '@im28/im-sdk/core';
import { executeWebIMMessageSend, } from './message-send-state.js';
/** 使用共享 optimistic 状态机发送自定义表情并保留 URL 快照。 */
export async function sendWebIMCustomEmojiMessage(context, options, dependencies) {
    // emojiID 是唯一远端请求字段。
    const emojiID = normalizeCustomEmojiID(options.emojiID);
    // url 只用于本地投影和缺字段响应补全，禁止发往服务端。
    const url = normalizeCustomEmojiURL(options.url);
    // message 复用通用 sending/sent/failed 状态迁移。
    const message = await executeWebIMMessageSend(context, {
        conversationID: options.conversationID,
        contentType: 115,
        payload: { emoji: { emoji_id: emojiID, url } },
    }, { emoji: { emoji_id: emojiID } }, dependencies);
    // remoteEmoji 可能仅回显 ID，或携带不可信 URL。
    const remoteEmoji = readCustomEmojiPayload(message.payload);
    // remoteURL 仅在身份一致且地址重新校验成功时采用。
    const remoteURL = remoteEmoji.emojiID === emojiID
        ? readValidCustomEmojiURL(remoteEmoji.url)
        : '';
    // persistedMessage 统一保留 ID 与可渲染 URL。
    const persistedMessage = {
        ...message,
        payload: {
            emoji: {
                emoji_id: emojiID,
                url: remoteURL || url,
            },
        },
    };
    await new MessageRepository(context.database).upsert(persistedMessage);
    return persistedMessage;
}
/** 对 Gateway 回包 URL 重新执行与列表相同的安全校验。 */
function readValidCustomEmojiURL(value) {
    if (!value)
        return '';
    try {
        return normalizeCustomEmojiURL(value);
    }
    catch {
        return '';
    }
}
/** 从未知远端 payload 安全读取可选自定义表情字段。 */
function readCustomEmojiPayload(payload) {
    if (!payload || typeof payload !== 'object')
        return { emojiID: '', url: '' };
    // emoji 只接受普通对象，不信任 Gateway 可选字段。
    const emoji = payload.emoji;
    if (!emoji || typeof emoji !== 'object')
        return { emojiID: '', url: '' };
    // candidate 收敛不同运行时 mapper 返回的 snake_case 字段。
    const candidate = emoji;
    return {
        emojiID: typeof candidate.emoji_id === 'string' ? candidate.emoji_id.trim() : '',
        url: typeof candidate.url === 'string' ? candidate.url.trim() : '',
    };
}
//# sourceMappingURL=message-custom-emoji-send.js.map