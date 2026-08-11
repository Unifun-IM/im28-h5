/** SDK 内部稳定的自定义表情领域模型。 */
export interface CustomEmoji {
    readonly emojiID: string;
    readonly url: string;
    readonly addedAt: number;
}
/** 校验并收敛自定义表情 ID，空值禁止进入缓存或消息体。 */
export declare function normalizeCustomEmojiID(value: string): string;
/** 仅接受浏览器和原生图片组件都可安全加载的 HTTP(S) 地址。 */
export declare function normalizeCustomEmojiURL(value: string): string;
//# sourceMappingURL=custom-emoji.d.ts.map