/** 校验并收敛自定义表情 ID，空值禁止进入缓存或消息体。 */
export function normalizeCustomEmojiID(value) {
    // normalized 统一消除接口和 UI 输入两端的意外空白。
    const normalized = value.trim();
    if (!normalized)
        throw new TypeError('Custom emoji ID is required.');
    return normalized;
}
/** 仅接受浏览器和原生图片组件都可安全加载的 HTTP(S) 地址。 */
export function normalizeCustomEmojiURL(value) {
    // normalized 先消除输入空白，再进入标准 URL parser。
    const normalized = value.trim();
    // parsed 负责拒绝相对地址、畸形地址和脚本协议。
    let parsed;
    try {
        parsed = new URL(normalized);
    }
    catch {
        throw new TypeError('Custom emoji URL must be an absolute HTTP(S) URL.');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new TypeError('Custom emoji URL must use HTTP(S).');
    }
    return parsed.href;
}
//# sourceMappingURL=custom-emoji.js.map