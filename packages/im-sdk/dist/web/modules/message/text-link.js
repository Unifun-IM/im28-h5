/** RN 已发布文本链接识别范围只包含 HTTP(S) 与 www 前缀。 */
const MESSAGE_TEXT_LINK_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
/** 句末标点不属于可点击地址，必须继续留在正文中。 */
const MESSAGE_TEXT_LINK_TRAILING_PUNCTUATION = /[.,!?;:，。！？；：、)\]}]+$/;
/** 按 RN 规则将消息正文切成稳定文本与链接片段。 */
export function splitIMMessageTextLinks(text) {
    if (!text)
        return [];
    /** segments 按原始 UTF-16 顺序累积，禁止改写可见正文。 */
    const segments = [];
    /** currentIndex 指向尚未投影的正文起点。 */
    let currentIndex = 0;
    /** match 保存当前正则命中的原始链接范围。 */
    let match;
    MESSAGE_TEXT_LINK_PATTERN.lastIndex = 0;
    /** 合并相邻正文片段，避免标点回填制造多余节点。 */
    const pushText = (index, segmentText) => {
        if (!segmentText)
            return;
        /** previous 用于保持连续正文只有一个投影节点。 */
        const previous = segments.at(-1);
        if (previous?.kind === 'text') {
            /** merged 替换 readonly 投影，保持公开结果不可变。 */
            const merged = {
                ...previous,
                text: previous.text + segmentText,
            };
            segments[segments.length - 1] = merged;
            return;
        }
        segments.push({ kind: 'text', key: `text-${index}`, text: segmentText });
    };
    while ((match = MESSAGE_TEXT_LINK_PATTERN.exec(text))) {
        /** rawURL 是包含可能尾随标点的原始命中。 */
        const rawURL = match[0];
        /** url 移除 RN 明确排除的句末标点。 */
        const url = rawURL.replace(MESSAGE_TEXT_LINK_TRAILING_PUNCTUATION, '');
        /** urlStart 是当前链接在原始正文中的稳定偏移。 */
        const urlStart = match.index;
        if (!url)
            continue;
        if (urlStart > currentIndex)
            pushText(currentIndex, text.slice(currentIndex, urlStart));
        segments.push({ kind: 'link', key: `link-${urlStart}`, text: url, url });
        /** urlEnd 标记标点回填的起点。 */
        const urlEnd = urlStart + url.length;
        /** trailingText 保留被剥离标点的原始顺序。 */
        const trailingText = rawURL.slice(url.length);
        if (trailingText)
            pushText(urlEnd, trailingText);
        currentIndex = urlStart + rawURL.length;
    }
    if (currentIndex < text.length)
        pushText(currentIndex, text.slice(currentIndex));
    return segments.length ? segments : [{ kind: 'text', key: 'text-0', text }];
}
/** 将 RN 支持的 www 地址转换成浏览器可直接打开的 HTTPS 地址。 */
export function normalizeIMMessageLinkURL(url) {
    /** trimmed 去除交互层传入的意外首尾空白。 */
    const trimmed = url.trim();
    return /^www\./i.test(trimmed) ? `https://${trimmed}` : trimmed;
}
//# sourceMappingURL=text-link.js.map