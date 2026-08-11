import type { PresetEmojiDescriptor, PresetEmojiDocument, PresetEmojiDocumentEditResult, PresetEmojiEntity, PresetEmojiSelection, SerializedPresetEmojiEntity } from './preset-emoji-types.js';
/** 将未知实体集合规范为合法、非重叠且未越界的 UTF-16 区间。 */
export declare function normalizePresetEmojiEntities(value: unknown, text: string): PresetEmojiEntity[];
/** 仅保留身份可解析且正文 fallback 完全匹配的可渲染实体。 */
export declare function resolvePresetEmojiEntities(text: string, value: unknown, resolve: (packID: string, presetID: string) => PresetEmojiDescriptor | undefined): PresetEmojiEntity[];
/** 将 App 双层身份编码成 Gateway preset_id。 */
export declare function encodePresetEmojiID(packID: string, presetID: string): string;
/** 将 Gateway preset_id 解码为 App 双层身份。 */
export declare function decodePresetEmojiID(value: unknown): Pick<PresetEmojiEntity, 'packID' | 'presetID'> | null;
/** 将合法 App 实体序列化为 Gateway 线格式。 */
export declare function serializePresetEmojiEntities(entities: readonly PresetEmojiEntity[], text: string): SerializedPresetEmojiEntity[];
/** 将正文实体投影到包含昵称或状态前缀的展示文本。 */
export declare function projectPresetEmojiEntitiesToDisplayText(params: {
    readonly sourceText: string;
    readonly sourceEntities: readonly PresetEmojiEntity[];
    readonly displayText: string;
}): PresetEmojiEntity[];
/** 将预设表情作为原子实体插入当前 UTF-16 选区。 */
export declare function insertPresetEmojiAtSelection(params: {
    readonly document: PresetEmojiDocument;
    readonly selection: PresetEmojiSelection;
    readonly descriptor: PresetEmojiDescriptor;
}): PresetEmojiDocumentEditResult;
/** 根据单次文本差量平移实体，并删除与编辑区相交的实体。 */
export declare function reconcilePresetEmojiEntitiesAfterTextChange(document: PresetEmojiDocument, nextText: string): PresetEmojiDocument;
/** 发送前裁剪首尾空白并同步修正实体偏移。 */
export declare function trimPresetEmojiDocument(document: PresetEmojiDocument): PresetEmojiDocument;
//# sourceMappingURL=preset-emoji.d.ts.map