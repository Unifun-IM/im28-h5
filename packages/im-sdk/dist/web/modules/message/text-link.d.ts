/** 消息文本链接片段保留原始文案，并单独暴露可打开地址。 */
export type IMMessageTextLinkSegment = Readonly<{
    kind: 'text';
    key: string;
    text: string;
}> | Readonly<{
    kind: 'link';
    key: string;
    text: string;
    url: string;
}>;
/** 按 RN 规则将消息正文切成稳定文本与链接片段。 */
export declare function splitIMMessageTextLinks(text: string): readonly IMMessageTextLinkSegment[];
/** 将 RN 支持的 www 地址转换成浏览器可直接打开的 HTTPS 地址。 */
export declare function normalizeIMMessageLinkURL(url: string): string;
//# sourceMappingURL=text-link.d.ts.map