/** 预设表情实体以 UTF-16 区间绑定稳定资源身份。 */
export interface PresetEmojiEntity {
    readonly type: 'preset_emoji';
    readonly offset: number;
    readonly length: number;
    readonly packID: string;
    readonly presetID: string;
}
/** Gateway 线格式使用单字段承载表情包与表情身份。 */
export interface SerializedPresetEmojiEntity {
    readonly type: 'preset_emoji';
    readonly offset: number;
    readonly length: number;
    readonly preset_id: string;
}
/** 预设表情描述只声明共享身份和 Unicode 降级正文。 */
export interface PresetEmojiDescriptor {
    readonly packID: string;
    readonly presetID: string;
    readonly unicode: string;
}
/** 富文本草稿由 Unicode 正文与非重叠实体共同组成。 */
export interface PresetEmojiDocument {
    readonly text: string;
    readonly entities: readonly PresetEmojiEntity[];
}
/** 编辑选区统一使用 JavaScript UTF-16 索引。 */
export interface PresetEmojiSelection {
    readonly start: number;
    readonly end: number;
}
/** 插入结果同时返回新文档和收敛后的光标。 */
export interface PresetEmojiDocumentEditResult {
    readonly document: PresetEmojiDocument;
    readonly selection: PresetEmojiSelection;
}
//# sourceMappingURL=preset-emoji-types.d.ts.map