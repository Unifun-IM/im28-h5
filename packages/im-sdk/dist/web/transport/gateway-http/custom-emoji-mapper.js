import { normalizeCustomEmojiID, normalizeCustomEmojiURL, } from '../../modules/custom-emoji/index.js';
/** 将 Gateway 自定义表情 DTO 严格映射为共享领域模型。 */
export function mapGatewayCustomEmojiToCore(emoji) {
    // addedAt 拒绝不可排序的服务端时间，防止污染完整缓存快照。
    const addedAt = Date.parse(emoji.added_at?.trim() ?? '');
    if (!Number.isFinite(addedAt)) {
        throw new TypeError('Custom emoji added_at must be a valid timestamp.');
    }
    return {
        emojiID: normalizeCustomEmojiID(emoji.emoji_id ?? ''),
        url: normalizeCustomEmojiURL(emoji.url ?? ''),
        addedAt,
    };
}
//# sourceMappingURL=custom-emoji-mapper.js.map